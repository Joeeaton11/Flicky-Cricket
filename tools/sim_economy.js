// Economy simulator (sprint 4 kit tiers). Plays 90 days for three players and reports pacing.
// Win chance comes from kit stats vs what the league expects (measured with tools/sim_chase.js: about +2.2% win
// per stat point around 60%). Run: node tools/sim_economy.js            → report for the numbers in GAME_CONFIG
//                                  node tools/sim_economy.js --search   → search per-tier card/coin multipliers
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../flicky-cricket.html', 'utf8');
const LG = [...src.slice(src.indexOf('const THEMED_LEAGUES')).matchAll(/name: "([^"]+)"[\s\S]*?unlock: (\d+)[\s\S]*?entry: (\d+),[\s\S]*?winTrophy: (\d+)[\s\S]*?winChest: '(\w+)'/g)].slice(0, 28)
  .map(m => ({ name: m[1], unlock: +m[2], entry: +m[3], winTrophy: +m[4], chest: m[5] }));
LG.forEach(l => { l.winCoins = l.entry * 2; });
const CHEST = {
  wooden: { t: 0, cards: [1, 2], coins: [50, 150], gems: [0, 3], r: [.9, .1, 0, 0] },
  bronze: { t: 2, cards: [1, 3], coins: [30, 80], gems: [0, 5], r: [.8, .18, .02, 0] },
  silver: { t: 8, cards: [3, 6], coins: [80, 200], gems: [3, 12], r: [.6, .3, .09, .01] },
  gold: { t: 12, cards: [5, 10], coins: [200, 500], gems: [8, 25], r: [.4, .35, .2, .05] },
  platinum: { t: 24, cards: [10, 18], coins: [700, 2000], gems: [25, 70], r: [.15, .33, .34, .18] },
};
const BAGS = ['wooden', 'bronze', 'silver', 'gold', 'platinum'];
const RAR = ['common', 'rare', 'epic', 'legendary'];
let UNLOCK = { common: 0, rare: 2, epic: 4, legendary: 8 };
const BAND = { common: [32, 52], rare: [40, 66], epic: [45, 77], legendary: [47, 92] };
const SHAPE_CARDS = [2, 3, 5, 7, 10, 14, 18, 24, 30];                 // to L2..L10, ×tier multiplier
const SHAPE_COINS = [10, 40, 100, 250, 600, 1500, 3000, 6000, 12000];  // to L2..L10, ×tier multiplier
const STREAK = [[1, 1, 0], [3, 1.2, 1], [5, 1.5, 1], [10, 2, 2]];
let seed = 1; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const stat = (r, L) => BAND[r][0] + (BAND[r][1] - BAND[r][0]) * (1 - Math.pow(1 - (L - 1) / 9, 1.5));
const need = lg => 28 + lg * 2.2;
let LOSS = { base: 1, perLeague: 0.12, max: 3 };
const trophyLoss = li => Math.min(LOSS.max, Math.round(LOSS.base + li * LOSS.perLeague));
const lgFor = tr => { let i = 1; for (let k = 1; k < LG.length; k++) if (tr >= LG[k].unlock) i = k; return i; };

function run(P, M, days = 90) {
  if (M.unlock) UNLOCK = Object.assign({ common: 0 }, M.unlock);
  if (M.loss) LOSS = M.loss;
  // M = { cards: {common: x, ...}, coins: {common: y, ...} }
  seed = P.seed || 7;
  const S = { tr: 0, best: 0, coins: 500, gems: 300, streak: 0, slots: [null, null, null, null], opening: null, items: {}, log: [] };
  for (let sl = 0; sl < 5; sl++) for (const r of RAR) for (let k = 0; k < 2; k++) S.items[`${sl}_${r}_${k}`] = { sl, r, L: 0, cards: 0 };
  for (let sl = 0; sl < 5; sl++) S.items[`${sl}_common_0`].L = 1;
  const rep = { firstMax: {}, upgrades: 0, upgradeDays: new Set(), stuckDays: 0, leagueByDay: [], statByDay: [], tierMaxDay: {} };
  const unlocked = r => lgFor(S.best) >= UNLOCK[r];
  const slotStat = sl => Math.max(...Object.values(S.items).filter(it => it.sl === sl && it.L > 0).map(it => stat(it.r, it.L)));
  const myStat = () => [0, 1, 2, 3, 4].reduce((t, sl) => t + slotStat(sl), 0) / 5;
  const cardsTo = (r, L) => Math.max(1, Math.round(SHAPE_CARDS[L - 1] * M.cards[r]));   // L = current level, to L+1
  const coinsTo = (r, L) => Math.round(SHAPE_COINS[L - 1] * M.coins[r]);
  function openBag(type) {
    const c = CHEST[type];
    S.coins += ri(...c.coins); S.gems += ri(...c.gems);
    const w = c.r.map((x, i) => unlocked(RAR[i]) ? x : 0), tw = w.reduce((a, b) => a + b, 0);
    for (let n = ri(...c.cards); n > 0; n--) {
      let p = rnd() * tw, i = 0; for (; i < 4; i++) { p -= w[i]; if (p <= 0) break; }
      const r = RAR[Math.min(i, 3)], it = S.items[`${ri(0, 4)}_${r}_${ri(0, 1)}`];
      if (it.L >= 10) { S.coins += { common: 5, rare: 25, epic: 100, legendary: 500 }[r]; continue; }
      it.cards++; if (!it.L) it.L = 1;
    }
    const next = RAR.find(r => !unlocked(r));
    if (next && rnd() < 0.04) { const it = S.items[`${ri(0, 4)}_${next}_${ri(0, 1)}`]; it.cards++; if (!it.L) it.L = 1; }
  }
  function upgrades(day) {
    // level the strongest item in each slot first, keep coins for two entries
    const reserve = 2 * LG[lgFor(S.tr)].entry;
    let did = true;
    while (did) {
      did = false;
      const its = Object.values(S.items).filter(it => it.L > 0 && it.L < 10).sort((a, b) => stat(b.r, b.L + 1) - stat(a.r, a.L + 1));
      for (const it of its) {
        if (it.cards >= cardsTo(it.r, it.L) && S.coins - coinsTo(it.r, it.L) >= reserve) {
          it.cards -= cardsTo(it.r, it.L); S.coins -= coinsTo(it.r, it.L); it.L++; rep.upgrades++; rep.upgradeDays.add(day); did = true;
          if (it.L === 10 && rep.firstMax[it.r] == null) rep.firstMax[it.r] = day;
          if (it.L === 10) { const all = Object.values(S.items).filter(x => x.r === it.r); }
          break;
        }
      }
    }
    for (const r of RAR) if (rep.tierMaxDay[r] == null && [0, 1, 2, 3, 4].every(sl => Object.values(S.items).some(it => it.sl === sl && it.r === r && it.L === 10))) rep.tierMaxDay[r] = day;
  }
  for (let day = 1; day <= days; day++) {
    // 2 free daily bronze bags, login coins
    for (let k = 0; k < 2; k++) { const i = S.slots.indexOf(null); if (i >= 0) S.slots[i] = 'bronze'; }
    S.coins += 25;
    if (P.passBags) for (let k = 0; k < P.passBags; k++) { const i = S.slots.indexOf(null); if (i >= 0) S.slots[i] = 'gold'; }
    let playedPaid = 0;
    for (let session = 0; session < 3; session++) {
      // bags: open what's ready, start the next (timers move on between sessions; spenders skip timers)
      let hours = 8 * (P.timerSpeed || 1);
      for (let guard = 0; guard < 6; guard++) {
        if (!S.opening) { const i = S.slots.findIndex(x => x); if (i < 0) break; S.opening = { type: S.slots[i], left: CHEST[S.slots[i]].t }; S.slots[i] = null; }
        if (S.opening.left <= hours) { hours -= S.opening.left; openBag(S.opening.type); S.opening = null; } else { S.opening.left -= hours; break; }
      }
      upgrades(day);
      for (let m = 0; m < P.matches / 3; m++) {
        let li = lgFor(S.tr);
        while (li > 1 && S.coins < LG[li].entry) li--;
        if (S.coins < LG[li].entry) continue;   // can't afford anything: Nets
        playedPaid++;
        S.coins -= LG[li].entry;
        const p = Math.max(0.08, Math.min(0.95, 0.6 + 0.022 * (myStat() - need(li)) + (P.skill || 0)));
        if (rnd() < p) {
          S.streak++; const t = STREAK.filter(x => S.streak >= x[0]).pop();
          S.coins += Math.round(LG[li].winCoins * t[1]);
          if (li >= lgFor(S.tr)) S.tr += LG[li].winTrophy + 1 + (rnd() < .4 ? 1 : 0);
          const i = S.slots.indexOf(null); if (i >= 0) S.slots[i] = BAGS[Math.min(4, BAGS.indexOf(LG[li].chest) + t[2])];
        } else {
          S.streak = 0; S.coins += Math.round(LG[li].entry * 0.35);
          if (li >= lgFor(S.tr)) S.tr = Math.max(LG[lgFor(S.best)].unlock, S.tr - trophyLoss(li));
        }
        S.best = Math.max(S.best, S.tr);
      }
    }
    if (playedPaid < P.matches * 0.5) rep.stuckDays++;
    rep.leagueByDay.push(lgFor(S.tr)); rep.statByDay.push(Math.round(myStat()));
  }
  rep.upgradeDayCount = rep.upgradeDays.size; delete rep.upgradeDays;
  return rep;
}
const PLAYERS = { free: { matches: 10, seed: 11 }, pass: { matches: 12, passBags: 1, seed: 12 }, spender: { matches: 14, passBags: 2, timerSpeed: 2, seed: 13 } };
function avg(P, M, n = 6) { const out = []; for (let s = 0; s < n; s++) out.push(run(Object.assign({}, P, { seed: P.seed * 100 + s }), M)); return out; }
function summary(name, reps) {
  const med = a => { const b = a.filter(x => x != null).sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : '—'; };
  const tm = r => med(reps.map(x => x.tierMaxDay[r] == null ? 999 : x.tierMaxDay[r])), fm = r => med(reps.map(x => x.firstMax[r] == null ? 999 : x.firstMax[r]));
  const lg = d => med(reps.map(x => x.leagueByDay[d - 1])), st = d => med(reps.map(x => x.statByDay[d - 1]));
  return `${name.padEnd(8)} first item maxed (day): C ${fm('common')} R ${fm('rare')} E ${fm('epic')} L ${fm('legendary')} | whole tier maxed: C ${tm('common')} R ${tm('rare')} E ${tm('epic')} L ${tm('legendary')}\n` +
    `         league d7 ${lg(7)} d14 ${lg(14)} d30 ${lg(30)} d60 ${lg(60)} d90 ${lg(90)} | kit stat d7 ${st(7)} d30 ${st(30)} d90 ${st(90)} | upgrade days ${med(reps.map(r => r.upgradeDayCount))}/90 | coin-stuck days ${med(reps.map(r => r.stuckDays))}`;
}
function score(M) {
  const reps = avg(PLAYERS.free, M, 5), med = a => { const b = a.slice().sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
  const tm = r => med(reps.map(x => x.tierMaxDay[r] == null ? 200 : x.tierMaxDay[r])), lg = d => med(reps.map(x => x.leagueByDay[d - 1]));
  const ud = med(reps.map(r => r.upgradeDayCount)), stuck = med(reps.map(r => r.stuckDays));
  return Math.pow((tm('common') - 12) / 4, 2) + Math.pow((tm('rare') - 40) / 8, 2) + Math.pow((Math.min(tm('epic'), 120) - 85) / 12, 2)
    + Math.pow((lg(90) - 22) / 3, 2) + Math.pow(Math.max(0, 50 - ud) / 10, 2) + stuck * 2 + Math.pow(Math.max(0, 6 - lg(14)) / 2, 2);
}
module.exports = { run, avg, summary, PLAYERS, score };
if (process.argv[2] === '--search') {
  let best = null, bs = 1e9; const R = (a, b) => a + Math.random() * (b - a);
  for (let it = 0; it < 900; it++) {
    const base = best && Math.random() < .6 ? JSON.parse(JSON.stringify(best)) : null;
    const M = base || { cards: { common: R(.1, .6), rare: R(.2, 1.2), epic: R(.3, 2), legendary: R(.5, 3) }, coins: { common: R(.03, .3), rare: R(.1, 1.5), epic: R(.3, 5), legendary: R(1, 15) }, unlock: { rare: Math.round(R(2, 12)), epic: Math.round(R(8, 20)), legendary: Math.round(R(14, 24)) } };
    if (base) { const k = ['cards', 'coins'][Math.floor(Math.random() * 2)], r = ['common', 'rare', 'epic', 'legendary'][Math.floor(Math.random() * 4)]; M[k][r] *= R(.75, 1.33);
      if (Math.random() < .3) { const u = ['rare', 'epic', 'legendary'][Math.floor(Math.random() * 3)]; M.unlock[u] = Math.max(1, Math.min(26, M.unlock[u] + (Math.random() < .5 ? -1 : 1))); } }
    if (!(M.unlock.rare < M.unlock.epic && M.unlock.epic < M.unlock.legendary)) continue;
    const sc = score(M); if (sc < bs) { bs = sc; best = M; }
  }
  console.log('best score', bs.toFixed(2)); console.log(JSON.stringify(best));
  for (const [k, P] of Object.entries(PLAYERS)) console.log(summary(k, avg(P, best)));
  process.exit(0);
}
if (require.main === module && process.argv[2] !== '--search') {
  // default = the numbers in GAME_CONFIG.kit.tierCost / tierUnlockLeague (Oct 29)
  const M = JSON.parse(process.argv[2] || 'null') || { cards: { common: .15, rare: .25, epic: .4, legendary: .6 }, coins: { common: .12, rare: .5, epic: 1.6, legendary: 5 }, unlock: { rare: 9, epic: 16, legendary: 21 }, loss: { base: 1, perLeague: 0.12, max: 3 } };
  console.log(JSON.stringify(M));
  for (const [k, P] of Object.entries(PLAYERS)) console.log(summary(k, avg(P, M)));
}
