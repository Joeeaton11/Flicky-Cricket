// Chase simulator (sprint 2): an "average player" plays each league's chase thousands of times using the
// same shot maths as doFlick/resolveShot, and we pick the target that gives a 60% win rate (55–65% band).
// Run: node tools/sim_chase.js   → prints targets for GAME_CONFIG.match.targets
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../flicky-cricket.html', 'utf8');
const leagues = [...src.slice(src.indexOf('const THEMED_LEAGUES')).matchAll(/name: "([^"]+)"[\s\S]*?difficulty: ([\d.]+)/g)].slice(0, 28).map(m => ({ name: m[1], diff: +m[2] }));
const bands = [{ a: 1, b: 8, balls: 12, wk: 2 }, { a: 9, b: 18, balls: 18, wk: 2 }, { a: 19, b: 28, balls: 24, wk: 2 }];
const lerp = (a, b, t) => a + (b - a) * t;
let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const gauss = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

// average player: timing error sd in ms, swing power, how often they read the line
const PLAYER = { timingSdMs: 80, timingBiasMs: -8, power: 1.35, powerSd: 0.45, readLine: 0.62 };
const statFor = (lgNo) => Math.min(90, 28 + lgNo * 2.2);   // kit stats an average player has reached by that league

function ball(lgNo, diff, ballNo, energy, need, left) {
  const st = statFor(lgNo) / 100;
  const d = Math.min(1, (diff - 1.0) / 0.90);
  const DEL = [[lerp(.28, .08, d), 1, .9, 0], [lerp(.28, .12, d), .55, .7, .04], [lerp(.2, .3, d), 1.3, 1, -.02], [lerp(.12, .28, d), 1.1, 2, 0], [lerp(.08, .14, d), 1.15, 1.4, -.06], [lerp(.04, .08, d), 1.2, .6, .08]];
  const tw = DEL.reduce((s, x) => s + x[0], 0); let pk = rnd() * tw, dv = DEL[0]; for (const x of DEL) { pk -= x[0]; if (pk <= 0) { dv = x; break; } }
  const speed = (0.011 + Math.min(ballNo * 0.0006, 0.01) + (rnd() - .5) * .003) * dv[1];
  const zc = Math.max(.76, Math.min(1.02, .92 + dv[3] + (rnd() - .5) * .1));
  const tx = .5 + (rnd() - .5) * Math.min(.18 * dv[2], .4); const lineSide = tx > .5 ? 1 : -1;
  // player: pressure makes them swing harder when the rate is high
  const rate = need / Math.max(1, left);
  let power = Math.max(.3, Math.min(3, PLAYER.power + (rate > 2 ? .35 : rate < 1 ? -.3 : 0) + gauss() * PLAYER.powerSd));
  const errMs = PLAYER.timingBiasMs + gauss() * PLAYER.timingSdMs;
  const z = zc + speed * (errMs / 16.67);
  const win = .22 + st * .14;
  let q; if (z < zc - win) q = .3; else if (z > zc + .13) return { w: true, energy }; else q = 1 - Math.abs(z - zc) / .3;
  q = Math.max(.15, Math.min(1, q));
  const perfect = Math.abs(z - zc) <= .04;
  let eff = power, fat = false;
  if (energy < 30 && power > 1) { fat = true; const f = 1 - energy / 30; eff = power * (1 - f * .5); q = Math.max(.1, q * (1 - f * .4)); }
  const shotSide = rnd() < PLAYER.readLine ? lineSide : -lineSide;
  let mism = false;
  if (z >= 1 - st && power > .8 && shotSide !== lineSide) { mism = true; eff *= (1 - .55 * (1 - st * .5)); q = Math.max(.08, q * (1 - .6 * (1 - st * .5))); }
  let drain = 1; if (power > 1.5) drain *= (1 - st * .55); if (fat) drain *= (1 - st * .6);
  energy = Math.max(0, energy - Math.max(0, power - .5) * 14 * drain);
  const dist = eff * (.4 + st * .6) * q * (perfect ? 1.08 : 1);
  const mistimed = q < .45, near = rnd(), nearDiff = rnd() * 40, nearDist = rnd(), canSave = rnd() < .45;
  const catchA = .65 * (1 - st * .43), catchD = .65 * (1 - st * .45), two = .5 + st * .24, dotT = .18 - st * .05;
  let r = 0, out = false;
  if (dist < dotT) r = 0;
  else if (dist < .45) { if (mistimed && nearDiff < 30 && nearDist < .7 && rnd() < catchD) out = true; else r = rnd() < two ? 2 : 1; }
  else if (dist < .9) { if (mistimed && nearDiff < 30 && rnd() < catchA) out = true; else if (canSave) r = rnd() < two ? 2 : 1; else r = 4; }
  else { if (mistimed && nearDiff < 22 && rnd() < catchA * .7) out = true; else if (mism) r = rnd() < .55 ? 4 : (rnd() < two ? 2 : 1); else r = 6; }
  energy = Math.min(100, energy + 6 + (dist < .45 ? 16 : 0));
  return { r, w: out, energy };
}
function play(lgNo, diff, balls, wk, target) {
  let runs = 0, lost = 0, energy = 100;
  for (let b = 0; b < balls; b++) {
    const o = ball(lgNo, diff, b, energy, target - runs, balls - b);
    energy = o.energy;
    if (o.w) { lost++; energy = 100; if (lost >= wk) return false; } else runs += o.r;
    if (runs >= target) return true;
  }
  return false;
}
// Calibration: the old format (unlimited balls, 1 wicket, targets 20 + 3.1 per league) was balanced so a player who
// belongs in a league wins about half the time. For each league we first find the player skill (timing spread)
// that wins 55% in the OLD format, then find the NEW-format target that gives that same player 60%.
const N = 5000, out = [0], report = [];
const winRate = (lgNo, diff, balls, wk, t) => { let w = 0; for (let i = 0; i < N; i++) if (play(lgNo, diff, balls, wk, t)) w++; return w / N; };
for (let lgNo = 1; lgNo <= 27; lgNo++) {
  const lg = leagues[lgNo]; const band = bands.find(b => lgNo >= b.a && lgNo <= b.b);
  const oldT = Math.round(20 + lgNo * 3.1);
  let lo = 20, hi = 160;
  for (let k = 0; k < 12; k++) { PLAYER.timingSdMs = (lo + hi) / 2; if (winRate(lgNo, lg.diff, 999, 1, oldT) > 0.55) lo = PLAYER.timingSdMs; else hi = PLAYER.timingSdMs; }
  let bestT = null, bestGap = 9;
  for (let t = 4; t <= 160; t++) { const p = winRate(lgNo, lg.diff, band.balls, band.wk, t); const gap = Math.abs(p - .60); if (gap < bestGap) { bestGap = gap; bestT = { t, p }; } if (p < .45) break; }
  out[lgNo] = bestT.t;
  report.push(`${String(lgNo).padStart(2)} ${lg.name.padEnd(16)} ${band.balls}b ${band.wk}w  player timing ±${PLAYER.timingSdMs.toFixed(0)}ms  target ${bestT.t}  win ${(bestT.p * 100).toFixed(0)}%`);
}
out[0] = out[1];   // SCENE TEST plays like league 1
console.log(report.join('\n'));
console.log('targets: [' + out.join(', ') + ']');
