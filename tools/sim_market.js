// Market simulator (Nov 15): 1,000 simulated players from Flicky Cricket's target markets, played day by day for 90 days
// on the game's real rules (leagues, trophies, win odds vs kit, ads cadence, offer triggers and prices).
// Behaviour (how often people come back, how many buy, ad prices) comes from 2025-26 industry benchmarks, so treat
// the output as a model, not a forecast. Run: node tools/sim_market.js [--runs 30] [--scenario name] [--json out.json]
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../flicky-cricket.html', 'utf8');
const LG = [...src.slice(src.indexOf('const THEMED_LEAGUES')).matchAll(/name: "([^"]+)"[\s\S]*?unlock: (\d+)[\s\S]*?entry: (\d+),[\s\S]*?winTrophy: (\d+)[\s\S]*?winChest: '(\w+)'/g)].slice(0, 28)
  .map(m => ({ name: m[1], unlock: +m[2], entry: +m[3], win: +m[4] }));
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const RUNS = +arg('--runs', 30), USERS = 1000, DAYS = 90, GBP = 0.79;   // 1 USD = £0.79 (assumption)

// ── target markets: share of installs, iPhone share, retention curve R(d) = R1·d^-k, 90-day payer target,
//    local price of a £0.99 item in USD, sales tax inside store prices, ad eCPM USD (rewarded, interstitial, Android)
const MK = {
  India:        { share: .38, ios: .05, R1: .28, k: .62, pay: .006, p99: .58, tax: .18, rw: 1.4, it: .8 },
  Pakistan:     { share: .12, ios: .03, R1: .27, k: .64, pay: .004, p99: .53, tax: .15, rw: .9, it: .5 },
  Bangladesh:   { share: .07, ios: .03, R1: .27, k: .64, pay: .0035, p99: .65, tax: .15, rw: .8, it: .45 },
  'Sri Lanka':  { share: .03, ios: .08, R1: .28, k: .62, pay: .005, p99: .66, tax: .18, rw: 1.0, it: .6 },
  UK:           { share: .16, ios: .50, R1: .32, k: .53, pay: .025, p99: 1.25, tax: .20, rw: 12, it: 9 },
  Australia:    { share: .08, ios: .55, R1: .32, k: .53, pay: .028, p99: 1.25, tax: .10, rw: 13, it: 10 },
  'New Zealand':{ share: .02, ios: .50, R1: .32, k: .54, pay: .025, p99: 1.20, tax: .15, rw: 11, it: 8 },
  'South Africa':{ share: .05, ios: .20, R1: .29, k: .58, pay: .012, p99: .82, tax: .15, rw: 3, it: 2 },
  'Gulf, US & Caribbean': { share: .09, ios: .40, R1: .30, k: .56, pay: .020, p99: 1.25, tax: .10, rw: 9, it: 7 },
};
const NAMES = Object.keys(MK);
// offers (prices in GBP for the £ markets; local prices scale by p99/1.25)
const OFFERS = {
  starter: { gbp: .99, appeal: 1.0 }, noAds: { gbp: 2.99, appeal: .55 }, league299: { gbp: 2.99, appeal: .45 }, league499: { gbp: 4.99, appeal: .4 },
  super1: { gbp: 1.99, appeal: .45 }, super2: { gbp: 2.99, appeal: .35 }, gemJar: { gbp: 2.99, appeal: .35 },
  pass: { gbp: 4.99, appeal: .30 }, passPlus: { gbp: 9.99, appeal: .10 }, gems80: { gbp: .99, appeal: .25 }, gems450: { gbp: 4.99, appeal: .18 },
  gems1000: { gbp: 9.99, appeal: .12 }, gems2200: { gbp: 19.99, appeal: .05 }, gems6000: { gbp: 49.99, appeal: .015 },
};
const BASE = {   // game rules, from GAME_CONFIG
  interEvery: 3, noInterFirst: 3, rewardedPerDay: 3, gemsPerDay: 30, extraOverGems: 25, trophyLoss: { base: 1, perLeague: .12, max: 3 },
  statCurve: [[0, 46], [7, 51], [30, 65], [90, 75]], matchesPerDay: 8, events: true, hairShop: true,
};
const SCEN = {   // what-ifs (--scenario)
  base: {},
  gentleAds: { interEvery: 4, noInterFirst: 8 },
  tighterGems: { gemsPerDay: 18 },
  smootherClimb: { needSlope: 1.9 },
  festivalEvents: { eventLift: .10 },
  ukFocus: { mix: { UK: .30, Australia: .12, India: .28, Pakistan: .08 } },
  rewardedSwap: { interEvery: 4, noInterFirst: 8, rewardedPerDay: 5 },
  all: { interEvery: 4, noInterFirst: 8, rewardedPerDay: 5, gemsPerDay: 18, eventLift: .10 },
};
let seed = 1; const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };   // mulberry32
const norm = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const pois = l => { let L = Math.exp(-l), k = 0, p = 1; do { k++; p *= rnd(); } while (p > L); return k - 1; };
const interp = (pts, x) => { for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const [a, b] = [pts[i - 1], pts[i]]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return pts[pts.length - 1][1]; };
const lgFor = tr => { let i = 1; for (let k = 1; k < LG.length; k++) if (tr >= LG[k].unlock) i = k; return i; };

function simulate(S, payScale) {
  const C = Object.assign({}, BASE, S), mix = Object.assign({}, ...NAMES.map(n => ({ [n]: MK[n].share })), S.mix || {});
  const tot = Object.values(mix).reduce((a, b) => a + b, 0);
  const users = [], out = { users };
  for (let u = 0; u < USERS; u++) {
    let r = rnd() * tot, m = NAMES[0]; for (const n of NAMES) { if ((r -= mix[n]) <= 0) { m = n; break; } }
    const M = MK[m], ios = rnd() < M.ios;
    const U = { m, ios, skill: .06 * norm(), eng: Math.exp(.55 * norm()), adTol: 2 + 3 * rnd(), spend: Math.exp(1.1 * norm()),
      alive: true, active: [], tr: 0, best: 0, actDays: 0, matches: 0, wins: 0, lossStreak: 0, gems: 300, jar: 0,
      bought: {}, iap: 0, ads: 0, rw: 0, inter: 0, quitLeague: null, quitWhy: null, payDay: null, noAds: false, stuckDays: 0, lastBest: 0, frus: 0 };
    const q = .78;   // chance an alive player opens the game on a given day
    for (let d = 0; d < DAYS; d++) {
      if (!U.alive) { U.active.push(0); continue; }
      if (d > 0) {
        const Sd = x => Math.min(1, M.R1 * Math.pow(Math.max(1, x), -M.k) / q);
        let h = 1 - Sd(d) / Sd(d - 1); if (d === 1) h = 1 - Sd(1);
        // game factors move the hazard: frustration (loss streaks, stalls, too many ads) up; promotions and buying down
        const lift = (C.eventLift && d % 14 < 4 ? C.eventLift : 0);
        h *= Math.exp(.35 * U.frus) * (U.iap > 0 ? .55 : 1) * (1 - lift);
        U.frus *= .6;
        if (rnd() < h) { U.alive = false; U.quitLeague = lgFor(U.best); U.quitWhy = U.whyLast || 'drift'; U.active.push(0); continue; }
        if (rnd() > q) { U.active.push(0); continue; }
      }
      U.active.push(1); U.actDays++;
      let n = Math.max(1, pois(C.matchesPerDay * U.eng * (d === 0 ? 1.2 : 1))), adsToday = 0, rwToday = 0, promoted = false;
      for (let i = 0; i < n; i++) {
        const lg = lgFor(U.best), stat = interp(C.statCurve, U.actDays * Math.min(1.6, U.eng)) + (U.iap > 0 ? 3 : 0);
        const need = 28 + lg * (C.needSlope || 2.2);
        let p = Math.max(.15, Math.min(.92, .62 + .022 * (stat - need) + U.skill));
        if (U.matches === 0) p = .97;   // the guided first ball / first match
        const win = rnd() < p; U.matches++;
        if (win) { U.wins++; U.lossStreak = 0; U.tr += LG[lg].win + 1 + (rnd() < .4 ? 1 : 0); U.jar += 4 * rnd(); }
        else {
          U.lossStreak++; U.tr = Math.max(LG[lgFor(U.best)].unlock, U.tr - Math.min(C.trophyLoss.max, Math.round(C.trophyLoss.base + lg * C.trophyLoss.perLeague)));
          if (U.lossStreak >= 3) { U.frus += .5; U.whyLast = 'losing streak'; }
          if (rnd() < .3) {   // lost by a few: extra over for gems or a rewarded ad
            if (rwToday < 6 && rnd() < .5 * U.adTol / 4) { rwToday++; U.rw++; } else if (U.gems >= C.extraOverGems && rnd() < .4) U.gems -= C.extraOverGems;
            else if (U.gems < C.extraOverGems) offer(U, M, 'gems80', d, 1.6);
          }
        }
        if (U.tr > U.best) { const before = lgFor(U.best); U.best = U.tr; if (lgFor(U.best) > before) { promoted = true; U.frus = Math.max(0, U.frus - .8);
          const nl = lgFor(U.best); if (nl >= 11) offer(U, M, nl >= 16 ? 'league499' : 'league299', d, 1); } }
        if (win && U.wins === 1) offer(U, M, 'starter', d, 1);
        if (!U.noAds && U.matches > C.noInterFirst && U.matches % C.interEvery === 0) { adsToday++; U.inter++; }
        if (U.matches === 10 || (U.matches > 10 && d % 7 === 0 && i === 0)) { offer(U, M, 'super1', d, 1); if (U.bought.super1) offer(U, M, 'super2', d, 1); }
      }
      // daily rewarded gem ads, gem income, gem jar, pass, cosmetics
      const want = Math.min(C.rewardedPerDay, Math.round(U.adTol * .55 + rnd()));
      rwToday += want; U.rw += want; U.gems += C.gemsPerDay + 5 * want;
      if (adsToday >= 3 && !U.noAds) { offer(U, M, 'noAds', d, 1); if (adsToday > U.adTol + 1) { U.frus += .25 * (adsToday - U.adTol); U.whyLast = 'too many ads'; } }
      if (U.jar >= 300 && !U.bought.gemJar) offer(U, M, 'gemJar', d, 1);
      if (d % 28 === 3 && U.actDays >= 4) { offer(U, M, 'pass', d, 1); offer(U, M, 'passPlus', d, .8); }
      // gem sinks a keen player reaches for: bag timers, boosters, extra overs, Endless tickets, hair and kit unlocks
      const wantGems = Math.round((15 + 45 * Math.min(3, U.spend)) * Math.min(2, U.eng));
      if (U.gems >= wantGems) U.gems -= wantGems; else { U.gems = 0; U.short = (U.short || 0) + 1; offer(U, M, U.spend > 2 ? 'gems450' : 'gems80', d, 1.2); }
      if (U.spend > 4 && rnd() < .004 * U.spend) offer(U, M, ['gems1000', 'gems2200', 'gems6000'][Math.min(2, Math.floor(rnd() * 3))], d, 1);
      if (lgFor(U.best) === lgFor(U.lastBest)) { U.stuckDays++; if (U.stuckDays >= 3) { U.frus += .3; U.whyLast = 'stuck in a league'; } } else U.stuckDays = 0;
      U.lastBest = U.best;
      if (U.noAds) adsToday = 0;
    }
    users.push(U);
  }
  function offer(U, M, key, d, w) {
    if (U.bought[key] && ['starter', 'noAds', 'gemJar'].includes(key)) return;
    const O = OFFERS[key], usd = O.gbp * M.p99 / .99 * (O.gbp >= 1 ? 1 : 1);
    const p = 1 - Math.exp(-payScale[U.m] * U.spend * O.appeal * w / Math.pow(usd, .5));
    U.seen = (U.seen || 0) + 1;
    if (rnd() < p) { U.bought[key] = (U.bought[key] || 0) + 1; const net = usd * (1 / (1 + M.tax)) * .85; U.iap += net; U.payDay = U.payDay == null ? d : U.payDay;
      (out.sales = out.sales || {})[key] = ((out.sales || {})[key] || 0) + net; if (key === 'noAds') U.noAds = true; if (key.startsWith('gems') || key.startsWith('league') || key.startsWith('super')) U.gems += 300; }
  }
  for (const U of users) { const M = MK[U.m], f = U.ios ? 1.3 : 1; U.adRev = .9 * (U.rw * M.rw + U.inter * M.it) * f / 1000; }
  return out;
}

// calibrate the spend scale per market so 90-day payer conversion lands on the benchmark (offers decide WHEN and WHAT)
function calibrate(S) {
  const scale = {}; NAMES.forEach(n => scale[n] = .02);
  for (let it = 0; it < 10; it++) {
    seed = 999; const all = []; for (let k = 0; k < 10; k++) all.push(...simulate(S, scale).users);
    for (const n of NAMES) { const us = all.filter(u => u.m === n), c = us.filter(u => u.iap > 0).length / Math.max(1, us.length);
      scale[n] *= Math.max(.3, Math.min(3, MK[n].pay / Math.max(c, .0005))); }
  }
  return scale;
}
const SCALE = calibrate({});
if (process.argv.includes('--debug')) { seed = 5; const R = simulate({}, SCALE); for (const n of NAMES) { const us = R.users.filter(u => u.m === n); console.log(n, us.length, (us.filter(u => u.iap > 0).length / us.length * 100).toFixed(2) + '%', 'target', MK[n].pay * 100, 'scale', SCALE[n].toExponential(2)); } console.log('inter/user', R.users.reduce((a,u)=>a+u.inter,0)/USERS, 'rw/user', R.users.reduce((a,u)=>a+u.rw,0)/USERS, 'sales', R.sales); process.exit(); }   // conversion calibrated on the game as it is, then held fixed for every what-if

function report(name) {
  const S = SCEN[name]; const runs = [];
  for (let r = 0; r < RUNS; r++) { seed = 1000 + r * 7919; runs.push(simulate(S, SCALE)); }
  const avg = f => runs.reduce((a, R) => a + f(R), 0) / runs.length;
  const pct = (f, lo) => { const v = runs.map(f).sort((a, b) => a - b); return v[Math.floor(v.length * lo)]; };
  const ret = d => R => R.users.filter(u => u.active[d]).length / USERS;
  const iap = R => R.users.reduce((a, u) => a + u.iap, 0) * GBP, ads = R => R.users.reduce((a, u) => a + u.adRev, 0) * GBP;
  const dau = R => R.users.reduce((a, u) => a + u.active.reduce((x, y) => x + y, 0), 0);
  const res = {
    scenario: name, D1: avg(ret(1)), D7: avg(ret(7)), D30: avg(ret(30)), D60: avg(ret(60)), D90: avg(ret(89)),
    iap: avg(iap), ads: avg(ads), total: avg(R => iap(R) + ads(R)), totLo: pct(R => iap(R) + ads(R), .1), totHi: pct(R => iap(R) + ads(R), .9),
    payers: avg(R => R.users.filter(u => u.iap > 0).length), dauDays: avg(dau),
    matchesPerActiveDay: avg(R => R.users.reduce((a, u) => a + u.matches, 0) / dau(R)),
    winRate: avg(R => R.users.reduce((a, u) => a + u.wins, 0) / R.users.reduce((a, u) => a + u.matches, 0)),
    sales: {}, byMarket: {}, quitLeague: {}, quitWhy: {}, leagueD30: {}, firstPayDay: [],
  };
  runs.forEach(R => { for (const k in R.sales || {}) res.sales[k] = (res.sales[k] || 0) + R.sales[k] * GBP / runs.length;
    R.users.forEach(u => { if (!u.alive && u.quitLeague) { res.quitLeague[u.quitLeague] = (res.quitLeague[u.quitLeague] || 0) + 1 / runs.length; res.quitWhy[u.quitWhy] = (res.quitWhy[u.quitWhy] || 0) + 1 / runs.length; }
      if (u.payDay != null) res.firstPayDay.push(u.payDay); }); });
  for (const n of NAMES) res.byMarket[n] = { users: avg(R => R.users.filter(u => u.m === n).length), D7: avg(R => { const us = R.users.filter(u => u.m === n); return us.filter(u => u.active[7]).length / Math.max(1, us.length); }),
    D30: avg(R => { const us = R.users.filter(u => u.m === n); return us.filter(u => u.active[30]).length / Math.max(1, us.length); }),
    iap: avg(R => R.users.filter(u => u.m === n).reduce((a, u) => a + u.iap, 0) * GBP), ads: avg(R => R.users.filter(u => u.m === n).reduce((a, u) => a + u.adRev, 0) * GBP),
    payers: avg(R => R.users.filter(u => u.m === n && u.iap > 0).length) };
  const fp = res.firstPayDay.sort((a, b) => a - b); res.payDayMedian = fp[Math.floor(fp.length / 2)]; res.payDay0to1 = fp.filter(x => x <= 1).length / Math.max(1, fp.length); delete res.firstPayDay;
  // league reached on day 30 among players still active
  runs.forEach(R => R.users.filter(u => u.active[30]).forEach(u => { const l = lgFor(u.best); res.leagueD30[l] = (res.leagueD30[l] || 0) + 1 / runs.length; }));
  return res;
}
const which = arg('--scenario', 'all-scenarios');
const results = which === 'all-scenarios' ? Object.keys(SCEN).map(report) : [report(which)];
if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify({ results, scale: SCALE, leagues: LG.map(l => l.name) }, null, 1));
for (const r of results) console.log(`${r.scenario.padEnd(15)} D1 ${(r.D1 * 100).toFixed(1)}% D7 ${(r.D7 * 100).toFixed(1)}% D30 ${(r.D30 * 100).toFixed(1)}% | 90-day £${r.total.toFixed(0)} (IAP £${r.iap.toFixed(0)}, ads £${r.ads.toFixed(0)}) [${r.totLo.toFixed(0)}–${r.totHi.toFixed(0)}] payers ${r.payers.toFixed(1)} win ${(r.winRate * 100).toFixed(0)}%`);
