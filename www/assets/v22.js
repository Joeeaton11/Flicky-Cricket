// ═══ Flicky 2.2 (Nov 22, Joe: "build the optimal version") ═══════════════════════════════════════════════
// League cards (Golf Clash style) · Rival Cup Finals · Trophy Cabinet · Choose-how-to-play · Pass bar · Album ·
// Sixes Weekend · win-streak flame · daily share · staged reveals. Everything here wraps the existing game.
(function () {
  if (typeof THEMED_LEAGUES === 'undefined') return;
  const LG = THEMED_LEAGUES, TEASER = !!window.TEASER_ON;
  const sec = n => SAVE.section(n), save = () => { try { SAVE.save(); } catch (e) {} };
  const tap = () => { try { playUiTap(); hapticTap(); } catch (e) {} };
  const snd = (n, o) => { try { FCSound.play(n, o || {}); } catch (e) {} };
  const trk = (n, d) => { try { track(n, d || {}); } catch (e) {} };
  const fmt = n => (n || 0).toLocaleString();
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const ART = { coin: 'assets/inline/fa7858fcd3d5.webp', coinS: 'assets/inline/de3b6b337a19.webp', gem: 'assets/ui/ui_1014_e0c52b08.webp', gemS: 'assets/inline/9a8b8f21ed70.webp',
    trophy: 'assets/inline/7cae0f596ea0.webp', bag: t => (typeof CHEST_IMG_SRC !== 'undefined' && CHEST_IMG_SRC[t === 'elite' || t === 'legendary' ? 'platinum' : t]) || CHEST_IMG_SRC.bronze };
  const PAINT = i => (typeof PAINTED_LEAGUE !== 'undefined' && PAINTED_LEAGUE[LG[i].name]) || {};
  const matches = () => career.matchesPlayed || 0;

  // ── 1. RIVAL CAPTAINS: one per league, drawn with the game's own player art (bespoke portraits can replace `img` later)
  const SIG = { spin: 'turns sharply after pitching', pace: 'arrives much quicker than you expect', swing: 'swings late and wide', slow: 'floats up slower than it looks', yorker: 'lands right on your toes', bouncer: 'rears up short and fast' };
  const RIVALS = [null,
    { n: 'SKY SHAH', t: 'The back-street spin queen. Never lost at home.', look: { g: 'f', face: 2, shirt: 'teal', trim: 'gold', pants: 'navy', hair: 'black' }, ball: ['THE DOOSRA', 'spin'], img: 'assets/ui/rivals/r1', flag: '🇮🇳' },
    { n: 'DEX OKAFOR', t: 'Loves the lights. Bowls thunderbolts after dark.', look: { g: 'm', face: 1, shirt: 'black', trim: 'silver', pants: 'black', hair: 'black' }, ball: ['THE THUNDERBOLT', 'pace'], img: 'assets/ui/rivals/r2', flag: '🇿🇦' },
    { n: 'MARINA COLE', t: 'Reads the sea breeze like a map.', look: { g: 'f', face: 4, shirt: 'royal', trim: 'cream', pants: 'white', hair: 'blonde' }, ball: ['THE SEA BREEZE', 'swing'], img: 'assets/ui/rivals/r3', flag: '🇦🇺' },
    { n: 'BARNEY PRICE', t: 'The showman. Every ball is a trick.', look: { g: 'm', face: 3, shirt: 'purple', trim: 'gold', pants: 'black', hair: 'ginger' }, ball: ['THE BIG TOP', 'slow'], img: 'assets/ui/rivals/r4', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { n: 'REX HARTLEY', t: 'Old-school captain. Never gives an inch.', look: { g: 'm', face: 0, shirt: 'maroon', trim: 'gold', pants: 'white', hair: 'brown' }, ball: ['THE TOE CRUSHER', 'yorker'], img: 'assets/ui/rivals/r5', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { n: 'RAJ VERMA', t: 'Express pace. Fire in the run-up.', look: { g: 'm', face: 2, shirt: 'orange', trim: 'red', pants: 'navy', hair: 'black' }, ball: ['THE BLAZE', 'bouncer'], img: 'assets/ui/rivals/r6', flag: '🇮🇳' },
    { n: "ZAIN AL-RASHID", t: "Desert league captain. Cool as the night sand.", look: { g: 'm', face: 2, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE MIRAGE", 'slow'], img: 'assets/ui/rivals/r7', flag: "\ud83c\udde6\ud83c\uddea" },
    { n: "NILU PERERA", t: "Heritage Cup spin wizard. Smiles, then turns it a mile.", look: { g: 'f', face: 3, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE TEMPLE TWIST", 'spin'], img: 'assets/ui/rivals/r8', flag: "\ud83c\uddf1\ud83c\uddf0" },
    { n: "ARJUN MEHRA", t: "Champions Cup skipper. Plays to a full house every night.", look: { g: 'm', face: 4, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE SUPER OVER", 'pace'], img: 'assets/ui/rivals/r9', flag: "\ud83c\uddee\ud83c\uddf3" },
    { n: "DESMOND KING", t: "Calypso Cup legend. Bowls with a grin and a dance.", look: { g: 'm', face: 0, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE STEEL DRUM", 'swing'], img: 'assets/ui/rivals/r10', flag: "\ud83c\uddef\ud83c\uddf2" },
    { n: "ANNIKE DU TOIT", t: "Protea Cup quick. Fierce, fast, never smiles at batters.", look: { g: 'f', face: 1, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE PROTEA PACE", 'pace'], img: 'assets/ui/rivals/r11', flag: "\ud83c\uddff\ud83c\udde6" },
    { n: "RAFI HOSSAIN", t: "Tiger Cup captain. Prowls the crease like a tiger.", look: { g: 'm', face: 2, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE TIGER CLAW", 'spin'], img: 'assets/ui/rivals/r12', flag: "\ud83c\udde7\ud83c\udde9" },
    { n: "TAMA WIREMU", t: "Silver Fern Cup captain. Calm as a lake, hits like a storm.", look: { g: 'm', face: 3, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE LONG CLOUD", 'swing'], img: 'assets/ui/rivals/r13', flag: "\ud83c\uddf3\ud83c\uddff" },
    { n: "CAPTAIN RUBY BLACKWATER", t: "Buccaneer Cup pirate queen. Plays for treasure.", look: { g: 'f', face: 4, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE CANNONBALL", 'bouncer'], img: 'assets/ui/rivals/r14', flag: "\ud83c\udff4\u200d\u2620\ufe0f" },
    { n: "IMRAN QURESHI", t: "Markhor Cup express. Long run, longer stare.", look: { g: 'm', face: 0, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE MARKHOR HORN", 'pace'], img: 'assets/ui/rivals/r15', flag: "\ud83c\uddf5\ud83c\uddf0" },
    { n: "MORGANA HEX", t: "Witches' Ashes captain. Her deliveries are cursed.", look: { g: 'f', face: 1, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE HEX", 'spin'], img: 'assets/ui/rivals/r16', flag: "\ud83c\udf83" },
    { n: "DUSTY McGRAW", t: "Frontier Cup sheriff. Fastest arm in the west.", look: { g: 'm', face: 2, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE QUICK DRAW", 'yorker'], img: 'assets/ui/rivals/r17', flag: "\ud83e\udd20" },
    { n: "INGRID FROST", t: "Frozen Ashes captain. Ice in her veins.", look: { g: 'f', face: 3, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE BLIZZARD", 'swing'], img: 'assets/ui/rivals/r18', flag: "\u2744\ufe0f" },
    { n: "COMMANDER NOVA", t: "Cosmos Cup captain. Bowls from orbit.", look: { g: 'f', face: 4, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE METEOR", 'pace'], img: 'assets/ui/rivals/r19', flag: "\ud83d\ude80" },
    { n: "BLAZE VULCAN", t: "Inferno Cup captain. Bowls lava.", look: { g: 'm', face: 0, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE ERUPTION", 'bouncer'], img: 'assets/ui/rivals/r20', flag: "\ud83c\udf0b" },
    { n: "KIRA NEON", t: "Neon Series captain. Glitches the scoreboard.", look: { g: 'f', face: 1, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE GLITCH", 'slow'], img: 'assets/ui/rivals/r21', flag: "\ud83d\udc9c" },
    { n: "KOFI MENSAH", t: "Jungle Cup captain. Hears every rustle in the leaves.", look: { g: 'm', face: 2, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE VINE SWING", 'swing'], img: 'assets/ui/rivals/r22', flag: "\ud83c\udf3f" },
    { n: "SIR EDMUND STEEL", t: "Knight's Cup captain. Defends his castle like a fortress.", look: { g: 'm', face: 3, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE LANCE", 'yorker'], img: 'assets/ui/rivals/r23', flag: "\ud83d\udee1\ufe0f" },
    { n: "PROFESSOR COGSWORTH", t: "Brass Cup inventor. His bowling machine never misses.", look: { g: 'm', face: 4, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE CLOCKWORK", 'slow'], img: 'assets/ui/rivals/r24', flag: "\u2699\ufe0f" },
    { n: "ELARA MOONWHISPER", t: "Wizard's Cup captain. The ball goes where she wills it.", look: { g: 'f', face: 0, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE SPELL", 'spin'], img: 'assets/ui/rivals/r25', flag: "\ud83d\udd2e" },
    { n: "MARINO REEF", t: "Deep Cup captain. Bowls from the bottom of the sea.", look: { g: 'm', face: 1, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE RIPTIDE", 'swing'], img: 'assets/ui/rivals/r26', flag: "\ud83c\udf0a" },
    { n: "MAXIMUS AURELIUS", t: "Eternal Cup emperor. The last wall between you and immortality.", look: { g: 'm', face: 2, shirt: 'navy', trim: 'gold', pants: 'white', hair: 'black' }, ball: ["THE COLOSSEUM", 'pace'], img: 'assets/ui/rivals/r27', flag: "\ud83c\udfdb\ufe0f" }];
  const FN = ['ZARA', 'KOFI', 'NINA', 'LEO', 'AMARA', 'JONTY', 'PRIYA', 'MAX', 'TALIA', 'OMAR', 'ISLA', 'SAM', 'MEERA', 'FINN', 'ROSA', 'DEV', 'IVY', 'KAI', 'NOOR', 'BEN', 'LILA'];
  const SN = ['QUINN', 'MENSAH', 'FORDE', 'BAXTER', 'KHAN', 'RHODES', 'NAIR', 'COOPER', 'REID', 'MALIK', 'WEST', 'ORTIZ', 'DAS', 'HALE', 'MOORE', 'SINGH', 'LANE', 'PATEL', 'BLAKE', 'ROSS', 'GRANT'];
  const SH = ['green', 'navy', 'maroon', 'teal', 'purple', 'royal', 'orange', 'black'], TR = ['gold', 'cream', 'red', 'blue', 'green', 'silver'], BT = ['spin', 'pace', 'swing', 'slow', 'yorker', 'bouncer'];
  const BN = { spin: ['THE MYSTERY SPINNER', 'THE CARROM BALL', 'THE ARM BALL'], pace: ['THE ROCKET', 'THE EXPRESS', 'THE LIGHTNING'], swing: ['THE BANANA', 'THE LATE DIP', 'THE OUTSWINGER'], slow: ['THE FLOATER', 'THE KNUCKLE BALL', 'THE LOOPER'], yorker: ['THE SANDSHOE', 'THE TOE CRUSHER', 'THE SLINGER'], bouncer: ['THE SKULL RATTLER', 'THE BUMPER', 'THE RISER'] };
  function rival(i) {
    if (RIVALS[i]) return RIVALS[i];
    const k = i * 7, g = i % 2 ? 'f' : 'm', bt = BT[i % BT.length];
    return { n: FN[k % FN.length] + ' ' + SN[(k * 3 + 5) % SN.length], t: `Captain of the ${LG[i].name.replace(/ CUP| SERIES| LEAGUE/, '')} XI. The last wall before the cup.`,
      look: { g, face: i % 5, shirt: SH[i % SH.length], trim: TR[(i * 5) % TR.length], pants: i % 3 ? 'white' : 'navy', hair: ['black', 'brown', 'blonde', 'black', 'grey'][i % 5] },
      ball: [BN[bt][i % 3], bt], flag: '' };
  }
  const _face = {};
  function rivalFace(i, kind) {   // head (or upper body) crop of the rival's art, as a data URL
    const key = i + '|' + (kind || 'h'); if (_face[key]) return Promise.resolve(_face[key]);
    if (i !== 'me' && RIVALS[i] && RIVALS[i].img) return Promise.resolve(RIVALS[i].img + (kind === 'u' ? '' : 'h') + '.webp');
    const L = i === 'me' ? curLook() : Object.assign({ name: '', flag: '' }, rival(i).look);
    return renderPlayer(L).then(src => { const c = document.createElement('canvas'), up = kind === 'u';
      c.width = 240; c.height = up ? 300 : 240; const g = c.getContext('2d'), sw = src.width * (up ? 0.86 : 0.55), sx = src.width * (up ? 0.07 : 0.22);
      g.drawImage(src, sx, 0, sw, up ? sw * 1.25 : sw, 0, 0, c.width, c.height); return (_face[key] = c.toDataURL('image/webp', .9)); }).catch(() => '');
  }
  const fillFaces = root => (root || document).querySelectorAll('[data-face]').forEach(el => { const v = el.dataset.face, k = el.dataset.fk || 'h';
    rivalFace(v === 'me' ? 'me' : +v, k).then(u => { if (u) el.style.backgroundImage = `url(${u})`; }); });

  // ── 2. FINALS: a full league bar unlocks that league's Final; winning it lifts the cup and opens the next league
  const kfmt = n => n >= 1000 ? (Math.round(n / 100) / 10).toString().replace(/\.0$/, '') + 'K' : fmt(n);
  const FRAMES = new Set([]) /* borders parked: was [1, 2, 3, 4, 5] */, BADGES = new Set([...Array(27).keys()].map(i => i + 1)), FDIM = { 5: [0.31831, 0.25983, 0.00575], 7: [0.3271, 0.24], 8: [0.4686, 0.3886], 2: [0.37654, 0.37654, 0.00579], 3: [0.31323, 0.29163, 0.0063], 4: [0.58608, 0.27921, 0.00624], 1: [0.20184, 0.20553, 0.00645], 6: [0.289, 0.2475], 16: [0.2241, 0.2241], 18: [0.2, 0.1834], 21: [0.228, 0.2052] };
  function F() { const f = sec('finals'); if (!f.won) { f.won = {}; f.ready = {}; const hi = highestLeagueIdx(); for (let i = 1; i < hi; i++) f.won[i] = 1; save(); } return f; }
  const finalWon = i => !!F().won[i], finalReady = i => !!F().ready[i] && !F().won[i];
  const cupsWon = () => Object.keys(F().won).filter(k => +k >= 1).length;
  function finalReward(i) { const lg = LG[i]; return { coins: lg.winCoins * 10, gems: 25 + i * 5, bag: i < 4 ? 'silver' : i < 12 ? 'gold' : 'platinum' }; }
  function finalTarget(i) { return Math.round(leagueTarget(LG[i]) * 1.25); }
  { const _tc = window.trophyChangeFor; window.trophyChangeFor = function (li, beat, by) {
      const d = _tc.apply(this, arguments);
      try { if (TEASER) return d; if (window.chase && window.chase.final != null) return 0;
        const i = currentLeagueIdx(), nx = LG[i + 1]; if (i < 1 || !nx || finalWon(i) || li < i) return d;
        if (finalReady(i)) return 0;
        const cap = nx.unlock - 1;
        if (d > 0 && trophyState.count + d >= nx.unlock) { F().ready[i] = 1; save(); window._finalJustReady = i; trk('final_ready', { league: i }); return Math.max(0, cap - trophyState.count); }
      } catch (e) {}
      return d; }; }
  // anyone already sitting at a full bar (from before 2.2) gets their Final straight away
  setTimeout(() => { try { const i = currentLeagueIdx(), nx = LG[i + 1]; if (i >= 1 && nx && !finalWon(i) && trophyState.count >= nx.unlock - 1) { F().ready[i] = 1; save(); } } catch (e) {} }, 500);

  function signatureBall() {   // every third ball in a Final is the rival's signature delivery
    const c = window.chase; if (!c || c.final == null) return; const R = rival(c.final), t = R.ball[1];
    try {
      if (t === 'spin') { ball.turn = (Math.random() < .5 ? -1 : 1) * (0.085 + Math.random() * 0.03); ballSpeed *= 0.78; }
      if (t === 'pace') ballSpeed *= 1.3;
      if (t === 'swing') ball.targetX = 0.5 + (Math.random() < .5 ? -1 : 1) * (0.16 + Math.random() * 0.05);
      if (t === 'slow') { ballSpeed *= 0.55; ball.zoneCenter = Math.min(1.02, ball.zoneCenter + 0.04); }
      if (t === 'yorker') ball.zoneCenter = Math.min(1.02, ball.zoneCenter + 0.08);
      if (t === 'bouncer') { ball.zoneCenter = Math.max(0.76, ball.zoneCenter - 0.08); ballSpeed *= 1.12; }
      ball.lineSide = (ball.targetX + (ball.turn || 0)) > 0.5 ? 1 : ((ball.targetX + (ball.turn || 0)) < 0.5 ? -1 : 0);
      showMessage(R.ball[0] + '!', '#ff8a65', 1100);
    } catch (e) {}
  }
  { const _sb = window.startBallSequence; if (typeof _sb === 'function') window.startBallSequence = function () {
      const r = _sb.apply(this, arguments); try { const c = window.chase; if (c && c.final != null && c.used % 3 === 2) signatureBall(); } catch (e) {} return r; }; }

  function playFinal(i) {
    const lg = LG[i]; if (!lg) return;
    window._freeEntry = true; setSelectedLeague(i); window._activeLeagueIdx = i;
    const tg = finalTarget(i); target = tg; window._leagueTargetFloor = tg;
    const c = setupChase('league', i); c.final = i; c.target = tg;
    try { boostersConsume(); } catch (e) {}
    closeAll(); try { leagueScreen.classList.add('hidden'); closeAllScreens(); } catch (e) {}
    trk('final_start', { league: i }); startGame();
  }
  { const _eg = window.endGame; window.endGame = function () {
      const c = window.chase, fi = c && c.final != null ? c.final : null, won = fi != null && runs >= c.target;
      const r = _eg.apply(this, arguments);
      if (fi != null) { trk(won ? 'final_won' : 'final_lost', { league: fi, runs });
        if (won) finalWin(fi); else setTimeout(() => { try { showMessage(`${rival(fi).n} WINS THIS ONE · NO TROPHIES LOST`, '#ff8a65', 2600); } catch (e) {} }, 2200); }
      return r; }; }
  function finalWin(i) {
    window._v2Quiet = Date.now() + 20000;
    const f = F(); f.won[i] = 1; delete f.ready[i]; save();
    const nx = LG[i + 1];
    if (nx) { trophyState.count = Math.max(trophyState.count, nx.unlock); trophyState.best = Math.max(trophyState.best || 0, trophyState.count); saveTrophies(); setSelectedLeague(i + 1); }
    const rw = finalReward(i); grantReward(rw);
    setTimeout(() => champions(i, rw), 2300);
  }

  // ── 3. STYLES ────────────────────────────────────────────────────────────────────────────────────────────
  const css = document.createElement('style');
  css.textContent = `
  .v2o{position:fixed;inset:0;z-index:9000;display:none;overflow:hidden;color:#fff;font-family:'Lilita One','Arial Black',Arial,sans-serif;background:#071022}
  .v2o.show{display:block}
  .v2o .bgx{position:absolute;inset:-20px;background:url(assets/ui/web/hero.webp) center/cover;filter:blur(5px) brightness(.5)}
  .v2top{position:relative;display:flex;align-items:center;gap:8px;padding:max(var(--insT),12px) 12px 0}
  .v2top .bk{width:42px;height:42px;border-radius:50%;border:3px solid #FFC93A;background:#14203a;color:#fff;font:30px/1 'Lilita One',sans-serif;cursor:pointer;flex:none}
  .v2top h1{flex:1;min-width:0;margin:0;font-weight:400;font-size:clamp(16px,5.2vw,24px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.04em;text-shadow:0 3px 0 #050A14}
  .v2top .pill{display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:14px;border:3px solid #050A14;background:#14203a;font-size:16px}.v2top .pill img{height:20px}
  .v2rail{position:absolute;left:0;right:0;top:calc(max(var(--insT),12px) + 58px);bottom:calc(env(safe-area-inset-bottom,0px) + 34px);display:flex;gap:14px;overflow-x:auto;overflow-y:auto;scroll-snap-type:x mandatory;padding:14px 9vw 10px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .v2rail::-webkit-scrollbar{display:none}
  .v2dots{position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);display:flex;justify-content:center;gap:6px}
  .v2dots i{width:7px;height:7px;border-radius:50%;background:#55607a}.v2dots i.on{width:18px;border-radius:4px;background:#FFC93A}
  .tcard{position:relative;flex:0 0 82vw;max-width:400px;scroll-snap-align:center;align-self:flex-start;border-radius:24px;border:4px solid #050A14;
    background:linear-gradient(color-mix(in srgb,var(--a) 55%,#14203a),#101a33 42%);box-shadow:0 0 0 3px color-mix(in srgb,var(--a) 70%,#fff) inset,0 8px 0 #050A14;
    padding:0 12px 14px;display:flex;flex-direction:column;gap:8px;align-items:center;overflow:hidden}
  .tcard .hero{position:relative;width:calc(100% + 24px);margin:0 -12px;height:clamp(150px,24vh,220px);background:center 45%/cover;border-bottom:4px solid #050A14}
  .tcard .hero::after{content:'';position:absolute;inset:0;background:linear-gradient(rgba(5,10,20,0) 45%,rgba(5,10,20,.55))}
  .tcard .crest{position:relative;width:100%;margin-top:-62px;z-index:2;display:flex;flex-direction:column;align-items:center}
  .tcard .crest .cup{height:84px;filter:drop-shadow(0 6px 6px rgba(0,0,0,.5));z-index:2}
  .tcard .ban{margin-top:-12px;max-width:94%;padding:5px 14px 3px;border-radius:12px;border:4px solid #050A14;background:linear-gradient(var(--a),color-mix(in srgb,var(--a) 60%,#000));font-size:clamp(17px,6vw,25px);letter-spacing:.03em;text-shadow:0 3px 0 #050A14;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tcard .rib{margin-top:-3px;padding:1px 12px;border-radius:8px;border:3px solid #050A14;background:linear-gradient(#3b82f6,#1d4ed8);font-size:12px;letter-spacing:.08em}
  .tcard .post{display:none}
  .tcard.pt{background:none!important;border:0;border-radius:26px;--pad:29px;padding:0 var(--pad) 26px;box-shadow:none!important;--ins:9px}
  .tcard.pt::before{content:'';position:absolute;inset:var(--ins);border-radius:16px;pointer-events:none;z-index:0;background:linear-gradient(rgba(8,14,32,0) 28%,rgba(8,14,32,.3) 40%,rgba(8,14,32,.62) 58%,rgba(8,14,32,.8)),var(--pc) center calc(var(--u) * -60)/100% auto no-repeat,linear-gradient(color-mix(in srgb,var(--a) 40%,#14203a),#0b1226)}
  .tcard.pt::after{content:'';position:absolute;inset:0;border:30px solid transparent;border-image:url(assets/ui/card_frame.webp) 150 / 30px / 0 round;pointer-events:none;z-index:6}
  .tcard.pt>*{position:relative;z-index:1}
  .v2pager em{display:flex;align-items:center;gap:1px;font-size:13px;color:#ffd75a}.v2pager em img{height:20px;filter:drop-shadow(0 1px 1px rgba(0,0,0,.5))}
  #v2deck .v2top::before{content:'';position:absolute;left:0;right:0;top:0;height:calc(var(--insT) + 22px);background:linear-gradient(rgba(6,34,80,.75),rgba(6,34,80,.35) 55%,rgba(6,34,80,0));pointer-events:none}
  #v2deck .v2pz2{min-width:0;width:100%;box-sizing:border-box}#v2deck .v2pz2 .g{min-width:0}#v2deck .v2pz2 .g:first-child h5{padding-right:0}#v2deck .v2pz2 .row span{min-width:0}#v2deck .tcard.pt .v2tgt{font-size:12px;white-space:normal;text-align:center}#v2deck .tcard.pt .v2tgt b{font-size:16px}
  #v2deck .v2pz2{padding:4px 2px 5px}#v2deck .v2pz2 .g{flex-basis:36%}#v2deck .v2pz2 .row{gap:3px;justify-content:space-evenly}#v2deck .v2pz2 .row img{height:23px}#v2deck .v2pz2 .row span{font-size:11px}#v2deck .v2pz2 h5{font-size:10.5px;padding-right:16px}#v2deck .v2info2{width:19px;height:19px;font-size:11px;top:3px;right:3px}
  #v2deck .tcard{flex-basis:73vw;max-width:350px;align-self:center}#v2deck .v2rail{padding-left:13.5vw;padding-right:13.5vw;padding-top:52px}
  .tcard.pt .crest::after{display:none}
  .tcard.pt .ban::after{animation-duration:9s}
  .tcard.pt .rib{display:none}
  .v2pz2{position:relative}.v2info2{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;border:2px solid rgba(255,255,255,.85);background:#1d2c52;color:#fff;font:700 13px/1 Georgia,serif;font-style:italic;z-index:2}
  #v2deck .tcard{transform:scale(calc(1 - .08 * var(--f,0)));filter:brightness(calc(1 - .28 * var(--f,0))) drop-shadow(0 14px 9px rgba(8,30,8,.5));transform-origin:50% 60%}#v2deck .tcard>.v2rib,#v2deck .tcard>.v2stamp,#v2deck .tcard>.v2rv{transition:opacity .2s}#v2deck .tcard:not(.foc)>.v2rib,#v2deck .tcard:not(.foc)>.v2stamp,#v2deck .tcard:not(.foc)>.v2rv{opacity:0}
  #v2deck .tcard.land{animation:v2land .38s cubic-bezier(.3,1.6,.5,1)}@keyframes v2land{0%{transform:scale(.97)}60%{transform:scale(1.025)}100%{transform:scale(1)}}
  .tcard.pt .ptcup{animation:v2bob 3.2s ease-in-out infinite}@keyframes v2bob{50%{transform:translateX(-50%) translateY(-4px)}}
  .tcard.pt .ptcup{filter:drop-shadow(0 6px 6px rgba(0,0,0,.5)) drop-shadow(0 0 0 rgba(255,230,140,0));}
  .tcard.pt .crest::after{content:'';position:absolute;left:50%;width:70px;height:70px;margin-left:-35px;top:calc(var(--u) * (120 + var(--pp,270)) - 80px);background:radial-gradient(circle,rgba(255,250,210,.9) 0 2px,transparent 3px) 30% 30%/100% 100% no-repeat,radial-gradient(circle,rgba(255,250,210,.9) 0 1.5px,transparent 2.5px) 72% 55%/100% 100% no-repeat;animation:v2spark 2.6s ease-in-out infinite;pointer-events:none;z-index:3}
  @keyframes v2spark{0%,100%{opacity:0;transform:scale(.6)}50%{opacity:1;transform:scale(1.1)}}
  .tcard.pt .ban{position:relative;overflow:hidden}.tcard.pt .ban::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.65) 50%,transparent 65%) -160% 0/60% 100% no-repeat;animation:v2glint 4.5s ease-in-out infinite;pointer-events:none}
  .tcard.pt .ban.bimg{overflow:visible}.tcard.pt .ban.bimg::after{-webkit-mask:var(--bm) center/100% 100% no-repeat;mask:var(--bm) center/100% 100% no-repeat}
  @keyframes v2glint{0%,60%{background-position:-160% 0}100%{background-position:260% 0}}
  .tcard.fready{animation:v2ready 1.6s ease-in-out infinite}@keyframes v2ready{50%{box-shadow:0 0 34px 6px rgba(255,80,60,.85),0 8px 0 #050A14}}
  .tcard.pt>.v2info{position:absolute;z-index:9;top:38px;right:36px;width:28px;height:28px;border-radius:50%;border:2px solid #fff;background:rgba(10,20,40,.55);color:#fff;font:700 16px/1 Georgia,serif;font-style:italic;backdrop-filter:blur(4px)}
  .tcard.pt>.v2rv{position:absolute;z-index:9;top:36px;left:34px;display:flex;align-items:center;gap:5px;padding:3px 8px 3px 3px;border-radius:20px;background:rgba(10,20,40,.6);border:2px solid rgba(255,215,120,.7);backdrop-filter:blur(4px)}
  .v2rv .v2face{width:30px;height:30px;border-radius:50%;border:2px solid #FFC93A}.v2rv span{font:9px/1.1 'Lilita One',sans-serif;color:#ffd75a;letter-spacing:.04em}.v2rv b{display:block;font-weight:400;font-size:11px;color:#fff;letter-spacing:0;max-width:92px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tcard.pt>.v2rib{position:absolute;z-index:10;top:72px;left:-8px;padding:4px 14px 4px 12px;font-size:13px;letter-spacing:.06em;border:3px solid #050A14;border-left:0;border-radius:0 12px 12px 0;box-shadow:0 3px 0 #050A14}
  .v2rib.here{background:linear-gradient(#5be0ff,#1f8fd6)}.v2rib.fin{background:linear-gradient(#ff7a59,#e0352b);animation:v2pulse 1.2s infinite}@keyframes v2pulse{50%{transform:scale(1.06)}}
  .tcard.pt>.v2stamp{position:absolute;z-index:10;top:44px;right:26px;transform:rotate(14deg);padding:4px 10px;border:4px solid #ffd75a;border-radius:10px;color:#ffd75a;font-size:20px;letter-spacing:.08em;background:rgba(40,20,0,.55);text-shadow:0 2px 0 #000;box-shadow:0 0 0 2px #050A14}
  .tcard.locked .ptcup{filter:drop-shadow(0 0 12px rgba(255,215,90,.95)) brightness(1.05)!important;animation:none}
  .tcard.locked .lockx.shake{animation:v2shake .45s}.tcard.locked .need.shake{animation:v2pulse .45s 2;color:#ffd75a}
  @keyframes v2shake{20%{transform:translateX(-7px) rotate(-2deg)}40%{transform:translateX(6px) rotate(2deg)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}
  .v2go.gold img{height:22px}
  #v2deck .v2top .pill.tro{color:#fff}#v2deck .v2top .pill.tro~.pill+.pill{display:none}.tcard.pt .v2stk .v2bar.fin span::before,.tcard.pt .v2stk .v2bar.done span::before{content:''}
  .v2pager{z-index:6!important;position:absolute;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 98px);display:flex;align-items:center;gap:8px;padding:4px 10px;border-radius:14px;border:2px solid rgba(255,255,255,.7);background:rgba(10,30,20,.45);backdrop-filter:blur(6px);color:#fff;font:13px 'Lilita One',sans-serif;letter-spacing:.05em;z-index:5}
  .v2pager b{font-weight:400;white-space:nowrap}.v2pager .pbar{width:70px;height:8px;border-radius:4px;background:rgba(0,0,0,.4);overflow:hidden}.v2pager .pbar i{display:block;height:100%;background:linear-gradient(90deg,#ffd75a,#f0a21a)}.v2pager em{font-style:normal;font-size:16px}
  .v2grid,.v2sheet{position:absolute;inset:0;z-index:50;background:rgba(5,12,28,.7);backdrop-filter:blur(6px);opacity:0;transition:opacity .2s;display:flex;align-items:flex-end}
  .v2grid.on,.v2sheet.on{opacity:1}
  .v2grid .gin,.v2sheet .sin{width:100%;max-height:74%;overflow:auto;background:linear-gradient(#1b2b52,#0d1730);border-top:3px solid #FFC93A;border-radius:22px 22px 0 0;padding:12px 12px calc(env(safe-area-inset-bottom,0px) + 104px)}
  .gh{display:flex;justify-content:space-between;align-items:center;font-size:20px;margin-bottom:10px}.gh button{width:34px;height:34px;border-radius:50%;border:2px solid #fff;background:#0a1226;color:#fff;font-size:16px}
  .gg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.gt{position:relative;border:2px solid #2a3a60;border-radius:14px;background:#0a1226;color:#fff;padding:6px 4px;font:11px 'Lilita One',sans-serif;display:flex;flex-direction:column;align-items:center;gap:3px}
  .gt img{height:40px}.gt.lock{opacity:.55}.gt.won{border-color:#7CF29A}.gt.open{border-color:#FFC93A}.gt i{position:absolute;top:3px;right:6px;font-style:normal;font-size:11px;color:#ffd75a}
  .v2sheet .ln{display:flex;justify-content:space-between;gap:10px;padding:8px 2px;border-bottom:1px solid rgba(255,255,255,.1);font:13px 'Lilita One',sans-serif}.v2sheet .ln span{color:#9fb3e0}.v2sheet .ln b{font-weight:400;text-align:right}.v2sheet .ln b img{height:16px;vertical-align:-3px}
  body:has(#v2deck.show) #bottomNav{background:linear-gradient(rgba(255,255,255,0),rgba(30,90,40,.35) 35%,rgba(20,70,30,.6));backdrop-filter:blur(6px)}
  body:has(#v2deck.show) #bottomNav .navTile{background:linear-gradient(rgba(255,255,255,.38),rgba(255,255,255,.16));border-color:rgba(255,255,255,.6);box-shadow:0 3px 0 rgba(0,0,0,.25)}
  #v2deck .v2top .pill{background:rgba(255,255,255,.26);border:2px solid rgba(255,255,255,.7);backdrop-filter:blur(8px);text-shadow:0 2px 0 rgba(0,0,0,.45)}
  #v2deck .v2top .bk{background:linear-gradient(#ffd75a,#f0a21a);color:#3a2000;border-color:#fff;text-shadow:none}
  #v2deck .v2top h1{text-shadow:0 2px 0 #0b3a66,0 0 8px rgba(0,0,0,.35)}
  #v2deck .bgx{background:url(assets/ui/deck_sky.webp) center top/100% 100% no-repeat!important;overflow:hidden}#v2deck .bgx::before,#v2deck .bgx::after{content:'';position:absolute;left:0;right:0;top:0;bottom:0}#v2deck .bgx::before{left:calc(-1 * var(--cw,700px));width:calc(100% + 3 * var(--cw,700px));background:url(assets/ui/deck_clouds.webp) 0 var(--bgy,0px)/var(--cw,700px) auto repeat-x;animation:v2clouds 120s linear infinite}#v2deck .bgx::after{background:url(assets/ui/deck_ground.webp) center var(--bgy,0px)/auto 116% no-repeat}@keyframes v2clouds{to{transform:translateX(var(--cw,700px))}}
  .v2pz2 h5{font-size:11.5px}.v2pz2 .row span{font-size:12.5px}.v2pz2 .row img{height:26px}.v2pz2 em{font-size:12px}.v2pz2 em img{height:14px!important}.v2pz2 .row{gap:6px}
  .tcard.pt.tf.nopto .pto{background:var(--frb) bottom center/auto 34px no-repeat}
  .v2pz2{display:flex;gap:0;padding:4px 4px 5px}.v2pz2 .g{flex:0 0 38%;text-align:center}.v2pz2 .g.f{flex:1;border-left:2px solid rgba(255,215,120,.25)}
  .v2pz2 h5{margin:1px 0 3px;font-size:10px}.v2pz2 .row{gap:8px;margin:0}.v2pz2 .row span{font-size:10.5px;white-space:nowrap}.v2pz2 .row img{height:30px}
  .v2pz2 em{font-style:normal;display:flex;align-items:center;gap:1px;font-size:10px;color:#e6c8ff}.v2pz2 em img{height:13px!important}
  .tcard.pt .v2stk .v2bar{height:34px;border-color:#ffd75a}.tcard.pt .v2stk .v2bar span{line-height:30px;font-size:19px}
  .tcard.pt .v2stk .v2bar span::before{content:'🏆 ';font-size:15px}
  body:has(#v2deck.show) #bottomNav{z-index:9500}
  #v2deck .v2rail{bottom:calc(env(safe-area-inset-bottom,0px) + 128px)}#v2deck .v2dots{bottom:calc(env(safe-area-inset-bottom,0px) + 82px)}
  #v2deck .bgx{background:url(assets/ui/deck_sunny.webp) center bottom/cover;filter:none;inset:0}
  .tcard.pt .ban.bimg{background:none!important;border:0!important;padding:0;max-width:none;width:84%;height:auto;margin-top:0}.tcard.pt .ban.bimg img{width:100%;display:block;filter:drop-shadow(0 4px 4px rgba(0,0,0,.5))}
  .tcard.pt .lockx.ch .st,.tcard.pt .lockx.ch .bd{display:none}.tcard.pt .need{position:relative;z-index:9}.tcard.pt .lockx.ch{bottom:58px;top:6px;left:6px;right:6px;background:url(assets/ui/lock_chains.webp) center 38%/100% auto no-repeat;z-index:8}
  .tcard.pt.tf::after{border-width:34px;border-image:var(--fr) 170 / 34px / 0 stretch round}
  .tcard.pt.tf .pto{position:absolute;inset:0;z-index:7;pointer-events:none;background:var(--frt) top center/auto 34px no-repeat,var(--frb) bottom center/auto 34px no-repeat}
  .tcard.pt{container-type:inline-size}
  .tcard .ptcup{display:none}
  .tcard.pt{--u:calc((100cqw + 2 * var(--pad,22px) - 2 * var(--ins,9px)) / 768)}.tcard.pt .crest{position:static;margin-top:-10px}.tcard.pt .crest .cup{display:none}
  .tcard.pt .ptcup{display:block;position:absolute;z-index:2;left:50%;transform:translateX(-50%);height:84px;filter:drop-shadow(0 6px 6px rgba(0,0,0,.5));top:calc(var(--ins,9px) + var(--u) * (60 + var(--pp,270)) - 84px + var(--sink,4px))}
  .tcard.pt .hero{background:none!important;border-bottom:0;width:calc(100% + 2 * var(--pad,22px));margin:0 calc(-1 * var(--pad,22px));height:calc(var(--ins,9px) + var(--u) * (60 + var(--pp,270) + var(--ph,100)))}.tcard.pt .hero::after{display:none}
  .tcard.pt .v2stk,.tcard.pt .v2prz,.tcard.pt .v2road{background:rgba(6,12,28,.6);backdrop-filter:blur(5px);border-color:rgba(255,215,120,.35)}
  .tcard.pt.locked::before{background:linear-gradient(rgba(8,14,32,.35),rgba(8,14,32,.9)),var(--pc) center calc(var(--u) * -60)/100% auto no-repeat,#0b1226;filter:saturate(.45)}
  .v2stk{width:100%;display:flex;align-items:center;gap:6px;padding:5px;border-radius:14px;background:#0a1226;border:2px solid #050A14}
  .v2stk .w,.v2stk .l{width:52px;text-align:center;font-size:11px;line-height:1.1}.v2stk b{display:block;font-weight:400;font-size:16px}
  .v2stk .w b{color:#7CF29A}.v2stk .l b{color:#ff8a80}
  .v2bar{position:relative;flex:1;height:28px;border-radius:12px;background:#050A14;border:2px solid #2a3a60;overflow:hidden}
  .v2bar i{position:absolute;inset:0 auto 0 0;background:linear-gradient(#ffd75a,#f0a21a)}.v2bar.done i{background:linear-gradient(#7CF29A,#22a050)}.v2bar.fin i{background:linear-gradient(#ff8a65,#e0352b)}
  .v2bar span{position:relative;display:block;text-align:center;line-height:24px;font-size:16px;text-shadow:0 2px 0 #000}
  .v2prz{width:100%;border-radius:14px;background:rgba(5,10,20,.55);border:2px solid #050A14;padding:5px 8px 6px}
  .v2prz h5{margin:2px 0 3px;font-weight:400;font-size:11px;text-align:center;color:#9fb3e0;letter-spacing:.08em}
  .v2prz .row{display:flex;justify-content:center;gap:16px;margin-bottom:3px}.v2prz .row span{display:flex;flex-direction:column;align-items:center;font-size:11px}
  .v2prz .row img{height:32px}
  .v2road{width:100%;border-radius:14px;background:rgba(5,10,20,.55);border:2px solid #050A14;padding:6px 8px;display:flex;align-items:center;gap:8px}
  .v2road .tx{flex:1;font-size:13px;line-height:1.2}.v2road .tx small{display:block;font:600 11px Arial,sans-serif;color:#9fb3e0}
  .v2face{width:46px;height:46px;flex:none;border-radius:12px;border:3px solid #050A14;background:#24365c center/cover}
  .v2tgt{font-size:14px;color:#cfd9f2}.v2tgt b{font-weight:400;color:#FFC93A;font-size:19px}
  .v2go{width:88%;height:52px;border-radius:16px;border:3px solid #050A14;background:linear-gradient(#8ef06a,#33b34a);color:#fff;font:22px 'Lilita One',sans-serif;text-shadow:0 2px 0 #0a4a14;box-shadow:0 5px 0 #1a6a2a,0 8px 0 #050A14;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}
  .v2go img{height:24px}.v2go.red{background:linear-gradient(#ff7a59,#e0352b);box-shadow:0 5px 0 #8a1a10,0 8px 0 #050A14;text-shadow:0 2px 0 #5a0a00}
  .v2go.gold{background:linear-gradient(#FFD75A,#F5A915);color:#3a2000;text-shadow:none;box-shadow:0 5px 0 #a86a00,0 8px 0 #050A14}
  .v2go.dim{background:linear-gradient(#2a3d6b,#1a2a50);box-shadow:0 5px 0 #0b1530,0 8px 0 #050A14}
  .tcard.locked .hero,.tcard.locked .v2stk,.tcard.locked .v2prz{filter:saturate(.35) brightness(.72)}
  .tcard .lockx{position:absolute;left:0;right:0;top:0;bottom:70px;pointer-events:none;overflow:hidden}
  .tcard .lockx .st{position:absolute;left:50%;top:42%;width:150%;height:20px;margin-left:-75%;border-radius:10px;border:3px solid #050A14;background:repeating-linear-gradient(90deg,#e9d8a6 0 26px,#c9a96a 26px 30px);box-shadow:0 4px 8px rgba(0,0,0,.5)}
  .tcard .lockx .s1{transform:rotate(36deg)}.tcard .lockx .s2{transform:rotate(-36deg)}
  .tcard .lockx .bd{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);width:66px;height:66px;border-radius:18px;border:4px solid #050A14;background:linear-gradient(#ffd75a,#f0a21a);display:flex;align-items:center;justify-content:center;font-size:32px;box-shadow:0 6px 0 #050A14}
  .tcard .need{font-size:18px;text-align:center;text-shadow:0 3px 0 #050A14;padding:6px 4px 2px}.tcard .need b{font-weight:400;color:#FFC93A}
  .tcard .donepill{padding:3px 10px;border-radius:10px;background:#1e7a3c;border:2px solid #050A14;font-size:13px}
  /* finals: walk-out + champions */
  #v2vs .scr,#v2champ .scr{position:relative;height:100%;display:flex;flex-direction:column;align-items:center;padding:calc(var(--insT) + 14px) 16px calc(env(safe-area-inset-bottom,0px) + 22px);box-sizing:border-box}
  .v2o h2{margin:6px 0 2px;font-weight:400;font-size:30px;text-align:center;color:#FFC93A;text-shadow:0 3px 0 #050A14;line-height:1}
  .v2o h3{margin:0;font-weight:400;font-size:15px;text-align:center;color:#cfd9f2}
  .v2o .tag{font-size:13px;color:#FFC93A;letter-spacing:.1em}
  .v2pan{width:100%;box-sizing:border-box;border-radius:16px;border:3px solid #050A14;background:rgba(10,18,38,.9);padding:10px;box-shadow:0 4px 0 #050A14}
  .v2vsrow{position:relative;width:100%;display:flex;justify-content:space-between;margin-top:10px}
  .v2vsrow .p{width:46%;text-align:center}.v2vsrow .p .pic{width:100%;aspect-ratio:.8;background-position:center top !important;border-radius:20px;border:4px solid #050A14;background:#24365c center top/cover;box-shadow:0 5px 0 #050A14}
  .v2vsrow .p.me .pic{background-color:#1d3a78}.v2vsrow .p.riv .pic{background-color:#7a1d1d}
  .v2vsrow .p b{display:block;font-weight:400;font-size:18px;margin-top:6px}.v2vsrow .p small{font-size:12px;color:#9fb3e0}
  .v2vsrow .vx{position:absolute;left:50%;top:34%;transform:translateX(-50%);width:70px;height:70px;border-radius:50%;border:4px solid #050A14;background:linear-gradient(#ff7a59,#c8261c);display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 5px 0 #050A14}
  .v2sig{display:flex;gap:10px;align-items:center}.v2sig .ic{font-size:28px}.v2sig b{font-weight:400;font-size:16px;color:#FFC93A;display:block}.v2sig small{font:600 12px/1.3 Arial,sans-serif;color:#cfd9f2}
  .v2rays{position:absolute;left:50%;top:32%;width:1300px;height:1300px;margin:-650px 0 0 -650px;background:repeating-conic-gradient(rgba(255,214,90,.16) 0 9deg,transparent 9deg 18deg);animation:v2spin 16s linear infinite}
  @keyframes v2spin{to{transform:rotate(360deg)}}
  .v2bigcup{position:relative;height:min(30vh,230px);margin-top:10px;filter:drop-shadow(0 12px 16px rgba(0,0,0,.6));animation:v2pop .7s cubic-bezier(.3,1.6,.5,1) both}
  @keyframes v2pop{from{transform:scale(.2);opacity:0}}
  .v2rw{display:flex;justify-content:center;gap:16px}.v2rw span{display:flex;flex-direction:column;align-items:center;font-size:13px}.v2rw img{height:42px}
  .v2cab{display:grid;grid-template-columns:repeat(9,1fr);gap:4px;width:100%}
  .v2cab i{aspect-ratio:1;border-radius:8px;background:#0a1226 center/80% no-repeat;border:2px solid #050A14;filter:grayscale(1) brightness(.35)}
  .v2cab i.on{filter:none;background-color:#2f4a7c;box-shadow:0 0 8px rgba(255,201,58,.6)}
  .v2row2{display:flex;gap:10px;width:100%;justify-content:center}.v2row2 .v2go{width:48%}
  .v2conf{position:absolute;top:-20px;width:9px;height:14px;border-radius:2px;animation:v2fall linear forwards}
  @keyframes v2fall{to{transform:translateY(110vh) rotate(720deg)}}
  /* mode cards */
  .mcard{position:relative;flex:0 0 78vw;max-width:380px;scroll-snap-align:center;align-self:flex-start;border-radius:24px;border:4px solid #050A14;background:linear-gradient(color-mix(in srgb,var(--a) 50%,#14203a),#101a33 48%);box-shadow:0 0 0 3px color-mix(in srgb,var(--a) 70%,#fff) inset,0 8px 0 #050A14;padding:12px;display:flex;flex-direction:column;gap:8px;align-items:center}
  .mcard .ico{height:86px;filter:drop-shadow(0 6px 6px rgba(0,0,0,.5))}.mcard .ico.e{font-size:64px;height:auto;line-height:1}
  .mcard h4{margin:0;font-weight:400;font-size:32px;text-shadow:0 4px 0 #050A14;text-align:center;line-height:1}.mcard .sub{font-size:12px;color:#FFC93A;letter-spacing:.06em;text-align:center}
  .mcard .post{width:100%;height:clamp(110px,22vh,190px);border-radius:14px;border:3px solid #050A14;background:center/cover}
  .mcard .now{width:100%;box-sizing:border-box;text-align:center;border-radius:14px;background:rgba(5,10,20,.55);padding:8px;display:flex;flex-direction:column;gap:5px;font-size:14px}
  .mcard .now small{font:600 12px/1.3 Arial,sans-serif;color:#9fb3e0}
  .mcard.locked .post,.mcard.locked .ico{filter:grayscale(.8) brightness(.6)}
  .v2lbls{position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 28px);display:flex;justify-content:center;gap:10px;font-size:12px;color:#9fb3e0}.v2lbls b{font-weight:400;color:#FFC93A}
  /* home bits */
  #v2pass{position:absolute;left:12px;right:12px;z-index:45;display:none;align-items:center;gap:8px;padding:5px 8px;border-radius:16px;border:3px solid #050A14;background:linear-gradient(#2f4a7c,#14203a);box-shadow:0 4px 0 #050A14;font-family:'Lilita One',sans-serif;color:#fff;cursor:pointer}
  #v2pass.on{display:flex}#v2pass .tg{font-size:12px;color:#FFC93A;white-space:nowrap}
  #v2pass .bar{position:relative;flex:1;height:18px;border-radius:9px;background:#050A14;overflow:hidden}#v2pass .bar i{position:absolute;inset:0 auto 0 0;background:linear-gradient(#ffd75a,#f0a21a)}
  #v2pass .bar b{position:relative;display:block;text-align:center;font-weight:400;font-size:12px;line-height:18px;text-shadow:0 1px 0 #000}
  #v2pass .nx{display:flex;flex-direction:column;align-items:center;font-size:9px;color:#9fb3e0}#v2pass .nx img{height:22px}
  .v2badge{position:absolute;z-index:45;width:84px;border-radius:14px;border:3px solid #050A14;text-align:center;font:12px/1.15 'Lilita One',sans-serif;color:#fff;padding:5px 3px;box-shadow:0 4px 0 #050A14;cursor:pointer;display:none}
  .v2badge.on{display:block}.v2badge .e{font-size:20px;display:block}.v2badge small{display:block;color:#ffe27a;font-size:11px}
  #v2evB{left:10px;background:linear-gradient(#ff7a59,#c8261c)}#v2alB{left:10px;background:linear-gradient(#3ec7a0,#178a68)}
  .v2dot{position:absolute;top:-8px;right:-6px;min-width:20px;height:20px;border-radius:10px;background:#ff3b3b;border:2px solid #050A14;font-size:12px;line-height:16px}
  #v2flame{position:absolute;z-index:46;right:12px;display:none;padding:3px 9px;border-radius:12px;border:3px solid #050A14;background:linear-gradient(#ffb43c,#e2501a);font:13px 'Lilita One',sans-serif;color:#fff;box-shadow:0 3px 0 #050A14}
  #v2flame.on{display:block}
  @media (max-height:620px){.tcard.pt{--ph:84}.tcard.pt .v2prz .row:last-child{display:none}.tcard.pt .v2prz h5:nth-of-type(2){display:none}}
  #v2deck .v2pz2 .row span{font-size:12.5px}#v2deck .v2pz2 h5{font-size:11px;white-space:nowrap;letter-spacing:.03em}#v2deck .v2pz2 .row img{height:25px}#v2deck .v2pz2 em{font-size:12px}
  .tcard.pt.tf::after{border:0!important;border-image:none!important;--fw:calc(100cqw + 2 * var(--pad,22px));background:var(--ft) center top/100% auto no-repeat,var(--fb) center bottom/100% auto no-repeat,var(--fm) center calc(var(--fw) * (var(--fr1) - var(--fe,0)) - 2px * (1 - min(1, var(--fe,0) * 1000)))/100% calc(100% - var(--fw) * (var(--fr1) + var(--fr2) - 2 * var(--fe,0)) + 4px * (1 - min(1, var(--fe,0) * 1000))) no-repeat}
  .tcard.pt.tf{overflow:visible}.tcard.pt.tf::after{top:calc(var(--fw) * var(--ftop,-.06) + 3px);bottom:calc(var(--fw) * var(--fbot,-.06) + 3px)}.tcard.pt.tf{padding-bottom:34px}.tcard.pt.tf[data-lg="6"]{--pad:30px;--ftop:-.151;--fbot:-.038}.tcard.pt.tf[data-lg="16"]{--pad:31px;--ftop:-.102;--fbot:-.03}.tcard.pt.tf[data-lg="5"]{--pad:30px;--ftop:-0.129;--fbot:-0.094;--fside:0.0207}.tcard.pt.tf[data-lg="7"]{--pad:30px;--ftop:-0.146;--fbot:-0.103;--fside:0.0549}.tcard.pt.tf[data-lg="8"]{--pad:30px;--ftop:-0.187;--fbot:-0.127;--fside:0.0906}.tcard.pt.tf[data-lg="2"]{--pad:30px;--ftop:-0.196;--fbot:-0.164;--fside:0.0789}.tcard.pt.tf[data-lg="3"]{--pad:30px;--ftop:-0.200;--fbot:-0.130;--fside:0.0370}.tcard.pt.tf[data-lg="4"]{--pad:30px;--ftop:-0.164;--fbot:-0.061;--fside:0.0987}.tcard.pt.tf[data-lg="1"]{--pad:30px;--ftop:-0.141;--fbot:-0.069;--fside:0.0588}.tcard.pt.tf[data-lg="18"]{--pad:30px;--ftop:-0.099;--fbot:-0.118;--fside:0.0768}.tcard.pt.tf[data-lg="21"]{--pad:30px;--ftop:-0.112;--fbot:-0.151;--fside:0.0814}.v2go.gold{white-space:nowrap;font-size:clamp(14px,4.6vw,20px);padding:0 6px}.v2go.gold img{height:20px}
  .tcard .lockx.st{position:absolute;left:0;right:0;top:auto;bottom:64px;height:52%;align-items:flex-end;display:flex;justify-content:center;pointer-events:none;z-index:8}
  .tcard .lockx.st .stk{position:relative;height:100%;aspect-ratio:896/1200;filter:drop-shadow(0 6px 6px rgba(0,0,0,.45))}
  .tcard .lockx.st img{position:absolute;inset:0;width:100%;height:100%}
  .lockx.st .lock{transform-origin:50% 13%;animation:lkSway 3.4s ease-in-out infinite}
  .lockx.st .bail_l{transform-origin:8% 15%}.lockx.st .bail_r{transform-origin:92% 15%}
  .lockx.st .stump_l,.lockx.st .stump_m,.lockx.st .stump_r{transform-origin:50% 100%}
  @keyframes lkSway{0%,100%{transform:rotate(-1.2deg) scaleY(1)}50%{transform:rotate(1.2deg) scaleY(1.012)}}
  #v2deck .tcard.land .lockx.st .lock{animation:lkSwing 1.5s ease-out,lkSway 3.4s ease-in-out 1.5s infinite}
  @keyframes lkSwing{0%{transform:rotate(0)}15%{transform:rotate(6deg) scaleY(1.03)}35%{transform:rotate(-4.5deg) scaleY(.98)}55%{transform:rotate(2.5deg)}75%{transform:rotate(-1deg)}100%{transform:rotate(0)}}
  .lockx.st.shake{animation:none!important}.lockx.st.shake .lock{animation:lkJig .5s}.lockx.st.shake .bail_l{animation:blJig .4s}.lockx.st.shake .bail_r{animation:brJig .4s}
  @keyframes lkJig{20%{transform:translateY(3%) rotate(-4deg)}45%{transform:translateY(-1%) rotate(3deg)}70%{transform:translateY(1%) rotate(-1.5deg)}100%{transform:rotate(0)}}
  @keyframes blJig{30%{transform:translateY(-4%) rotate(-6deg)}60%{transform:translateY(0) rotate(3deg)}}@keyframes brJig{30%{transform:translateY(-4%) rotate(6deg)}60%{transform:translateY(0) rotate(-3deg)}}
  .lockx.st .ball{position:absolute;width:15%;aspect-ratio:1;left:42.5%;top:42%;border-radius:50%;opacity:0;background:radial-gradient(circle at 35% 30%,#ff8a7a,#c8161b 45%,#6e0508);box-shadow:inset 0 0 0 2px rgba(0,0,0,.15)}
  .lockx.st .ball::after{content:'';position:absolute;inset:0;border-radius:50%;border-left:2px dashed rgba(255,240,220,.9);transform:translateX(42%)}
  .lockx.st.open .ball{animation:bFly .45s cubic-bezier(.3,.1,.6,1) forwards}
  @keyframes bFly{0%{opacity:1;transform:translate(-320%,180%) scale(.6)}100%{opacity:1;transform:translate(0,0) scale(1)}}
  .lockx.st.open .stk>*{animation-fill-mode:forwards!important}
  .lockx.st.open .bail_l{animation:blOff .9s .42s cubic-bezier(.2,.6,.4,1) forwards}.lockx.st.open .bail_r{animation:brOff .9s .42s cubic-bezier(.2,.6,.4,1) forwards}
  @keyframes blOff{to{transform:translate(-55%,-35%) rotate(-280deg);opacity:0}}@keyframes brOff{to{transform:translate(55%,-40%) rotate(300deg);opacity:0}}
  .lockx.st.open .stump_m{animation:smOff .8s .42s ease-out forwards}.lockx.st.open .stump_l{animation:slOff .8s .46s ease-out forwards}.lockx.st.open .stump_r{animation:srOff .8s .46s ease-out forwards}
  @keyframes smOff{to{transform:translateY(6%) rotate(14deg);opacity:0}}@keyframes slOff{to{transform:rotate(-38deg) translateX(-20%);opacity:0}}@keyframes srOff{to{transform:rotate(38deg) translateX(20%);opacity:0}}
  .lockx.st.open .lock{animation:lkDrop .9s .42s cubic-bezier(.5,0,.8,.6) forwards}@keyframes lkDrop{30%{transform:rotate(-18deg) scale(1.1)}100%{transform:translateY(70%) rotate(25deg) scale(.8);opacity:0}}
  .lockx.st.open .ball{animation:bFly .45s cubic-bezier(.3,.1,.6,1) forwards,bOut .6s .45s ease-in forwards}@keyframes bOut{to{opacity:0;transform:translate(260%,-60%) scale(.8)}}
  .tcard.unlocking .need{transition:opacity .4s 1.2s}.tcard.unlocking .lockx.open~.need{opacity:0}
  .tcard.unlocking{filter:none}
  .tcard.pt.locked .lockx.st{top:calc(var(--ins,9px) + var(--u) * (60 + var(--pp,270) - 8));height:calc(var(--u) * 330);bottom:auto;align-items:flex-start;z-index:3}
  .tcard.pt.locked .lockx.st .stk{filter:drop-shadow(0 10px 6px rgba(0,0,0,.55))}
  .tcard.pt.locked .lockx.st::after{content:'';position:absolute;left:50%;bottom:-2%;width:52%;height:9%;margin-left:-26%;border-radius:50%;background:radial-gradient(rgba(0,0,0,.45),transparent 70%);z-index:-1}
  .tcard.pt.locked .hero,.tcard.pt.locked .v2stk,.tcard.pt.locked .v2prz{filter:none}
  .tcard.pt.locked::before{background:linear-gradient(rgba(8,14,32,0) 28%,rgba(8,14,32,.35) 40%,rgba(8,14,32,.7) 58%,rgba(8,14,32,.85)),var(--pc) center calc(var(--u) * -60)/100% auto no-repeat,#0b1226!important;filter:saturate(.6) brightness(.85)!important}
  .v2lockp{width:100%;border-radius:14px;background:rgba(10,18,38,.94);box-shadow:0 6px 14px rgba(0,0,0,.45);border:2px solid rgba(255,215,120,.35);padding:8px 8px 7px;text-align:center;display:flex;flex-direction:column;gap:6px}
  .v2lockp .need{font-size:17px;line-height:1.15;color:#fff;text-shadow:0 2px 0 #000}.v2lockp .need b{font-weight:400;color:#ffd75a}
  .v2lockp .v2bar{flex:none;height:26px}.v2lockp .v2bar span{line-height:22px;font-size:15px}
  .v2lockp h5{margin:2px 0 0;font-weight:400;font-size:11px;color:#9fb3e0;letter-spacing:.08em}.v2lockp .row{display:flex;justify-content:space-evenly}.v2lockp .row span{display:flex;flex-direction:column;align-items:center;font-size:11.5px}.v2lockp .row img{height:26px}
  .tcard.pt.locked .ptcup{filter:drop-shadow(0 0 14px rgba(255,215,90,.9)) drop-shadow(0 6px 6px rgba(0,0,0,.5))!important}
  .tcard.pt.locked .crest .ban{visibility:hidden}.v2lockp .lnm{font-size:13px;letter-spacing:.06em;color:#ffd75a;margin-bottom:-2px}
  .tcard.pt.locked{overflow:visible}.tcard.pt.locked .lockx.st{z-index:2}.tcard.pt.locked .v2lockp{position:relative;z-index:5}
  .tcard.pt.locked .lockx.st .stk{filter:drop-shadow(0 8px 5px rgba(0,0,0,.5))}
  .tcard.pt.locked{overflow:hidden!important}
  .tcard.pt.locked .lockx.st{top:calc(var(--ins,9px) + 2%)!important;bottom:auto!important;align-items:flex-start!important;z-index:3!important}
  .tcard.pt.locked .lockx.st .stk{aspect-ratio:auto!important;width:78%;filter:drop-shadow(0 8px 8px rgba(0,0,0,.55))}
  .tcard.pt.locked .lockx.st .lock{transform-origin:50% 14.5%!important;animation:lkSway1 3.4s ease-in-out infinite!important}
  .tcard.pt.locked .lockx.st .bail_l{transform-origin:12% 14%!important}.tcard.pt.locked .lockx.st .bail_r{transform-origin:88% 14%!important}
  @keyframes lkSway1{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}
  #v2deck .tcard.pt.locked.land .lockx.st .lock{animation:lkSwing1 1.5s ease-out,lkSway1 3.4s ease-in-out 1.5s infinite!important}
  @keyframes lkSwing1{15%{transform:rotate(14deg)}35%{transform:rotate(-10deg)}55%{transform:rotate(6deg)}75%{transform:rotate(-3deg)}100%{transform:rotate(0)}}
  .tcard.pt.locked .lockx.st.shake .lock{animation:lkJig1 .5s!important}@keyframes lkJig1{20%{transform:rotate(-12deg)}45%{transform:rotate(10deg)}70%{transform:rotate(-5deg)}100%{transform:rotate(0)}}
  .tcard.pt.locked .lockx.st .ball{width:17%!important;left:41.5%!important;top:30%!important}
  .tcard.pt.locked .ptcup{opacity:.9}
  .tcard.pt.locked .lockx.st::after{display:none}
  .tcard.pt.locked .lockx.st .lock{left:28%!important;right:28%!important;width:44%!important}
  .tcard.pt.locked{overflow:visible!important}
  .tcard.pt.locked .lockx.st{top:var(--lt,calc(var(--ins,9px) + var(--u) * (60 + var(--pp,270) + 280)))!important;z-index:8!important}
  .tcard.pt.locked .lockx.st .stk{aspect-ratio:768/1376!important;width:auto!important}
  .tcard.pt.locked .lockx.st .lock{left:0!important;right:0!important;width:100%!important}
  .tcard.pt.locked .crest .ban{visibility:visible!important}
  .tcard.pt.locked .need{position:relative;z-index:9}
  .tcard.pt .v2stk.lkneed{justify-content:center;min-height:38px}.v2stk.lkneed .need{font-size:15px;line-height:1.1;text-align:center;color:#fff;text-shadow:0 2px 0 #000}.v2stk.lkneed .need b{font-weight:400;color:#ffd75a;display:inline;font-size:inherit}
  #v2deck .tcard.pt{translate:0 -46px}
  .tcard.pt.locked .lockx.st{z-index:50!important}
  #v2deck .tcard.pt .v2go{font-size:7.6cqw!important;white-space:nowrap}#v2deck .tcard.pt .v2go img{height:1.4em;width:auto}#v2deck .tcard.pt .v2pz2 .row span{font-size:min(12.5px,5.3cqw)!important}#v2deck .tcard.pt .v2pz2 h5{font-size:min(11px,4.7cqw)!important}
  #v2deck .tcard.pt{flex-basis:calc(73vw - min(26px, var(--insT) * .45));translate:0 calc(-46px + min(27px, var(--insT) * .46))}
  .tcard.pt.locked .lockx.st .stk{aspect-ratio:896/1200!important;width:auto!important}
  .tcard.pt.locked .lockx.st .lock{transform-origin:50% 13%!important;animation:lkSway 3.4s ease-in-out infinite!important;left:0!important;right:0!important;width:100%!important}
  .tcard.pt.locked .lockx.st .bail_l{transform-origin:8% 15%!important}.tcard.pt.locked .lockx.st .bail_r{transform-origin:92% 15%!important}
  #v2deck .tcard.pt.locked.land .lockx.st .lock{animation:lkSwing 1.5s ease-out,lkSway 3.4s ease-in-out 1.5s infinite!important}
  .tcard.pt.locked .lockx.st.shake .lock{animation:lkJig .5s!important}
  .tcard.pt.locked .lockx.st .ball{width:15%!important;left:42.5%!important;top:42%!important}
  .tcard.pt.locked .v2prz,.tcard.pt.locked .v2stk:not(.lkneed){filter:grayscale(1) brightness(.6)!important;opacity:.75}
  .tcard .lockx.st .ext{position:absolute;left:0;right:0;top:calc(100% - 2px);height:var(--ext,0px);background:url(assets/ui/lock/stump_ext.webp) center top/100% auto repeat-y}
  .lockx.st.open .ext{animation:smOff .8s .42s ease-out forwards}
  .tcard.pt.locked .lockx.st{overflow:visible}
  #v2deck .v2rail{bottom:0!important;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 128px)!important}
  
  .tcard.pt.locked .v2prz,.tcard.pt.locked .v2stk:not(.lkneed){filter:grayscale(1) brightness(.6) blur(2.5px)!important}
  #v2deck .tcard.pt{transition:translate .35s cubic-bezier(.3,1.3,.5,1),transform .15s,filter .15s}
  .tcard .lockx.st img.padb{inset:auto;left:36.3%;top:54.6%;width:28%;height:auto;transform-origin:50% 0;scale:1.3;animation:pbBob 3.4s ease-in-out infinite}
  @keyframes pbBob{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg) translateY(1%)}}
  #v2deck .tcard.land .lockx.st img.padb{animation:pbSwing 1.5s ease-out,pbBob 3.4s ease-in-out 1.5s infinite}
  @keyframes pbSwing{15%{transform:rotate(8deg)}35%{transform:rotate(-6deg)}55%{transform:rotate(3deg)}75%{transform:rotate(-1deg)}100%{transform:rotate(0)}}
  .lockx.st.shake img.padb{animation:pbJig .5s!important}@keyframes pbJig{20%{transform:translateY(3%) rotate(-7deg)}45%{transform:translateY(-1%) rotate(6deg)}70%{transform:rotate(-2deg)}}
  .lockx.st.open img.padb{animation:lkDrop .9s .42s cubic-bezier(.5,0,.8,.6) forwards!important}
  .tcard .lockx.st .chn{position:absolute;inset:0;transform-origin:50% 12%;animation:lkSway 3.4s ease-in-out infinite}
  .tcard .lockx.st .chn img{animation:none!important}
  #v2deck .tcard.land .lockx.st .chn{animation:lkSwing 1.5s ease-out,lkSway 3.4s ease-in-out 1.5s infinite}
  .lockx.st.shake .chn{animation:lkJig .5s!important}
  .tcard.pt.locked .lockx.st.open .chn,.lockx.st.open .chn{animation:chDrop .9s .42s cubic-bezier(.5,0,.8,.6) forwards!important}
  @keyframes chDrop{25%{transform:translateY(-3%) rotate(-6deg)}100%{transform:translateY(60%) rotate(18deg);opacity:0}}
  .tcard.pt.locked .lockx.st.open .bail_l{animation:blOff .9s .42s cubic-bezier(.2,.6,.4,1) forwards!important}.tcard.pt.locked .lockx.st.open .bail_r{animation:brOff .9s .42s cubic-bezier(.2,.6,.4,1) forwards!important}
  .tcard .lockx.st .ball,.tcard.pt.locked .lockx.st .ball{width:34%!important;left:33%!important;top:36%!important;background:radial-gradient(circle at 35% 30%,#fff,#f1efe6 45%,#b9b4a6)!important;box-shadow:0 3px 6px rgba(0,0,0,.35)}
  .tcard .lockx.st .ball::after{border-left-color:rgba(60,60,70,.55)!important}
  /* clean unlock sequence */
  .tcard .lockx.st.open .stk>*,.tcard .lockx.st.open .chn,.tcard .lockx.st.open .ext{animation:none!important}
  .tcard .lockx.st.open .ball{animation:bHit .38s cubic-bezier(.35,.05,.65,1) forwards,bDrop .5s .38s ease-in forwards!important}
  @keyframes bHit{0%{opacity:1;transform:translate(-300%,60%) scale(.7)}100%{opacity:1;transform:translate(0,0) scale(1)}}
  @keyframes bDrop{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:translate(70%,160%)}}
  .tcard .lockx.st.open .bail_l{animation:uBl .55s .38s cubic-bezier(.2,.7,.4,1) forwards!important}
  .tcard .lockx.st.open .bail_r{animation:uBr .55s .38s cubic-bezier(.2,.7,.4,1) forwards!important}
  @keyframes uBl{100%{transform:translate(-22%,-18%) rotate(-160deg);opacity:0}}@keyframes uBr{100%{transform:translate(22%,-20%) rotate(170deg);opacity:0}}
  .tcard .lockx.st.open .stump_m{transform-origin:50% 100%!important;animation:uSm .5s .38s ease-out forwards!important}
  .tcard .lockx.st.open .stump_l{transform-origin:50% 100%!important;animation:uSl .5s .42s ease-out forwards!important}
  .tcard .lockx.st.open .stump_r{transform-origin:50% 100%!important;animation:uSr .5s .42s ease-out forwards!important}
  @keyframes uSm{100%{transform:rotate(9deg);opacity:0}}@keyframes uSl{100%{transform:rotate(-12deg);opacity:0}}@keyframes uSr{100%{transform:rotate(12deg);opacity:0}}
  .tcard .lockx.st.open .ext{animation:uFade .35s .4s ease-out forwards!important}@keyframes uFade{to{opacity:0}}
  .tcard .lockx.st.open .chn{animation:uCh .55s .38s ease-in forwards!important}@keyframes uCh{100%{transform:translateY(35%);opacity:0}}
  .tcard .lockx.st.open .stk{filter:none!important}
  .tcard .lockx.st.open .chn img.padb,.lockx.st.open img.padb{animation:none!important}
  .v2pz2 .g:not(.f){flex:0 0 40%!important}.v2pz2 .g:not(.f) .row{gap:4px;justify-content:space-around}.v2pz2 .g:not(.f) .row span{font-size:11.5px;letter-spacing:-.2px}.v2pz2 .g.f .row{gap:3px}.v2pz2 .g.f .row span{font-size:11.5px;letter-spacing:-.2px}
  .tcard.pt.tf:not([data-lg="6"]):not([data-lg="16"])::before{border-radius:28px}.tcard.pt.tf::after{z-index:40!important;pointer-events:none;--cw:calc(100cqw + 2 * var(--pad,22px));--fw:calc(var(--cw) * (1 + 2 * var(--fside,0)));left:calc(var(--cw) * var(--fside,0) * -1);right:calc(var(--cw) * var(--fside,0) * -1)}
  .tcard.pt.tf[data-lg="1"]{--hl:0.1005;--hr:0.894;--ht:0.0968;--hb:0.1005}.tcard.pt.tf[data-lg="2"]{--hl:0.1883;--hr:0.8117;--ht:0.1883;--hb:0.1883}.tcard.pt.tf[data-lg="3"]{--hl:0.1107;--hr:0.8857;--ht:0.1728;--hb:0.1512}.tcard.pt.tf[data-lg="4"]{--hl:0.1392;--hr:0.9072;--ht:0.1802;--hb:0.1401}.tcard.pt.tf[data-lg="5"]{--hl:0.0844;--hr:0.9099;--ht:0.1687;--hb:0.1103}.tcard.pt.tf[data-lg="6"]{--hl:0.088;--hr:0.912;--ht:0.2442;--hb:0.1346}.tcard.pt.tf[data-lg="7"]{--hl:0.1543;--hr:0.8443;--ht:0.2;--hb:0.1571}.tcard.pt.tf[data-lg="8"]{--hl:0.1557;--hr:0.8457;--ht:0.2514;--hb:0.1729}.tcard.pt.tf[data-lg="16"]{--hl:0.0833;--hr:0.9195;--ht:0.1609;--hb:0.1106}.tcard.pt.tf[data-lg="18"]{--hl:0.0539;--hr:0.9461;--ht:0.0705;--hb:0.0539}.tcard.pt.tf[data-lg="21"]{--hl:0.0539;--hr:0.9461;--ht:0.0984;--hb:0.0756}.tcard.pt.tf::after{--tw:calc(100cqw + 2 * var(--pad,22px));--fw:calc(var(--tw) / (var(--hr) - var(--hl)));left:calc(0px - var(--fw) * var(--hl))!important;right:auto!important;width:var(--fw)!important;top:calc(0px - var(--fw) * var(--ht))!important;bottom:calc(0px - var(--fw) * var(--hb))!important;z-index:40!important;pointer-events:none}
  #v2deck .v2rail{gap:90px!important}
  .tcard.pt:not(.tf)::after{border:0!important;border-image:none!important}.tcard.pt:not(.tf)::after{inset:calc(var(--ins) - 1px);border-radius:17px;border:2.5px solid color-mix(in srgb,var(--a) 55%,#fff6d8)!important;box-shadow:0 0 0 1.5px rgba(0,0,0,.45),inset 0 0 0 1px rgba(255,255,255,.22),inset 0 2px 6px rgba(255,255,255,.18);z-index:41}#v2deck .tcard.pt.foc{filter:brightness(calc(1 - .28 * var(--f,0))) drop-shadow(0 30px 22px rgba(6,26,6,.62)) drop-shadow(0 10px 8px rgba(0,0,0,.32))}
  .tcard.pt.tf::before{inset:0!important;border-radius:4px!important}
  @media (max-height:760px){.tcard.pt{padding-bottom:20px}.tcard.pt .ban.bimg{width:60%}#v2deck .v2rail{padding-top:52px!important}.tcard.pt .rib{display:none}.tcard.pt .v2tgt{font-size:12px}.tcard.pt .v2prz .row img{height:24px}#v2deck .v2rail{padding-top:6px}.tcard.pt .crest{margin-top:-16px}.tcard.pt .v2road{display:none}.tcard{gap:6px}.tcard .hero{height:104px}.tcard .crest{margin-top:-50px}.tcard .v2road{padding:3px 8px}.tcard .v2road .tx small{display:none}.tcard .v2face{width:34px;height:34px}.v2prz h5{margin:0 0 2px}.v2prz .row img{height:26px}.v2go{height:46px;font-size:20px}.tcard .crest .cup{height:72px}.mcard .post{display:none}.mcard .ico{height:64px}.mcard h4{font-size:28px}.v2rail{padding-top:48px}}`;
  document.head.appendChild(css);

  // ── overlay helpers
  const OV = {};
  function ov(id) { if (OV[id]) return OV[id]; const o = document.createElement('div'); o.id = id; o.className = 'v2o'; document.body.appendChild(o); return (OV[id] = o); }
  function closeAll() { Object.values(OV).forEach(o => o.classList.remove('show')); }
  function goHome() { closeAll(); try { closeAllScreens(); document.getElementById('overlay').classList.remove('hidden'); showNav('league'); updateMenuHUD(); } catch (e) {} }
  const topBar = (title, back) => `<div class="v2top"><button class="bk" data-v2back="${back || 'home'}">‹</button><h1>${title}</h1><span class="pill"><img src="${ART.coinS}">${fmt(career.coins)}</span><span class="pill"><img src="${ART.gemS}">${fmt(gems)}</span></div>`;
  function railDots(o) { const rail = o.querySelector('.v2rail'), dots = o.querySelector('.v2dots'); if (!rail || !dots) return;
    const n = rail.children.length; dots.innerHTML = Array.from({ length: Math.min(n, 30) }, () => '<i></i>').join('');
    const upd = () => { const w = rail.children[0] ? rail.children[0].getBoundingClientRect().width + 14 : 1, k = Math.round(rail.scrollLeft / w);
      dots.querySelectorAll('i').forEach((d, j) => d.classList.toggle('on', j === k)); };
    rail.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true }); upd(); }
  function scrollTo(o, idx) { const rail = o.querySelector('.v2rail'); if (!rail || !rail.children[idx]) return; const c = rail.children[idx];
    rail.scrollLeft = c.offsetLeft - (rail.clientWidth - c.clientWidth) / 2; }

  // ── 4. LEAGUE CARDS ────────────────────────────────────────────────────────────────────────────────────
  function leagueCard(i) {
    const lg = LG[i], P = PAINT(i), nx = LG[i + 1], hi = highestLeagueIdx(), cur = currentLeagueIdx();
    const won = finalWon(i), ready = finalReady(i), open = i <= hi, live = open && !won;
    const band = matchBand(Math.max(1, i)), wT = (lg.winTrophy || 1) + 1, lossT = (won || ready || i < cur) ? 0 : trophyLossFor(i);
    let pct = 0, lbl = '', cls = '';
    if (won) { pct = 100; lbl = '✓ COMPLETE'; cls = 'done'; }
    else if (ready) { pct = 100; lbl = 'FINAL READY'; cls = 'fin'; }
    else if (open && nx) { pct = Math.max(0, Math.min(1, (trophyState.count - lg.unlock) / Math.max(1, nx.unlock - lg.unlock))) * 100; lbl = `${trophyState.count} / ${nx.unlock}`; }
    else if (nx) { lbl = `0 / ${nx.unlock}`; } else lbl = 'TOP LEAGUE';
    const R = rival(i), fr = finalReward(i), wins = nx && open && !won && !ready ? Math.ceil(Math.max(0, nx.unlock - trophyState.count) / (wT + 1)) : 0;
    let body = `<div class="v2stk"><div class="w">WIN<b>+${won || ready ? 0 : wT}🏆</b></div><div class="v2bar ${cls}"><i style="width:${pct}%"></i><span>${lbl}</span></div><div class="l">LOSS<b>${lossT ? '−' + lossT : '0'}🏆</b></div></div>
      <div class="v2prz v2pz2"><button class="v2info2" data-info="${i}">i</button><div class="g"><h5>EVERY WIN</h5><div class="row"><span><img src="${ART.coin}">${kfmt(lg.winCoins)}</span><span><img src="${ART.bag(lg.winChest || 'bronze')}">${bagNm(lg.winChest || 'bronze')}</span></div></div>${nx ? `<div class="g f"><h5>WIN THE FINAL</h5><div class="row"><span><img src="${ART.coin}">${kfmt(fr.coins)}<em><img src="${ART.gemS}">${fr.gems}</em></span><span><img src="${ART.bag(fr.bag)}">${bagNm(fr.bag)}</span><span><img src="${P.trophy || ART.trophy}">CUP</span></div></div>` : ''}</div>`;
    if (false) body += `<div class="v2road"><div class="tx">${ready ? `<b style="font-weight:400;color:#ff8a65">THE FINAL IS ON!</b><small>Beat ${esc(R.n)} to lift the ${esc(lg.name)}</small>` : `THE ROAD TO THE FINAL<small>About ${wins} more win${wins === 1 ? '' : 's'} to face ${esc(R.n)}</small>`}</div><div class="v2face" data-face="${i}"></div></div>`;
    if (won) body += `<div class="v2road"><span class="donepill">🏆 CUP WON</span><div class="tx"><small>Beat ${esc(R.n)} · no trophies lost here · play any time for coins and bags</small></div></div>`;
    const isCur = open && !won && i === cur, short = open && !ready && (career.coins || 0) < (lg.entry || 0);
    let tags = '';
    if (nx && ready) tags += `<div class="v2rv"><div class="v2face" data-face="${i}"></div><span>FINAL vs<b>${esc(R.n)}</b></span></div>`;
    if (ready) tags += `<div class="v2rib fin">⚔ FINAL READY</div>`;
    if (won) tags += `<div class="v2stamp">CHAMPIONS</div>`;
    let foot = '';
    if (!open) { const prevPending = i === hi + 1 && LG[hi + 1] && !finalWon(hi);
      const needTx = prevPending ? `WIN THE <b>${esc(LG[hi].name)}</b> FINAL TO UNLOCK` : `WIN <b>${Math.max(0, lg.unlock - trophyState.count)}</b> MORE 🏆 TO UNLOCK`;
      body = body.replace(/<div class="v2stk">[\s\S]*?<\/div><\/div>(?=\s*<div class="v2prz)/, `<div class="v2stk lkneed"><div class="need">${needTx}</div></div>`);
      foot = lockStumps(); }
    else if (ready) foot = `<div class="v2tgt">FINAL: CHASE <b>${finalTarget(i)}</b> OFF <b>${band.balls}</b> · FREE ENTRY</div><button class="v2go red" data-final="${i}">⚔ PLAY THE FINAL</button>`;
    else foot = `${short ? `<button class="v2go gold" data-short="${i}">NEED <img src="${ART.coinS}">${fmt(lg.entry - (career.coins || 0))} MORE</button>` : `<button class="v2go" data-play="${i}">PLAY · <img src="${ART.coinS}">${fmt(lg.entry)}</button>`}`;
    return `<div data-lg="${i}" class="tcard pt${FRAMES.has(i) ? ' tf' : ''}${i === 6 ? ' nopto' : ''}${ready ? ' fready' : ''}${isCur ? ' iscur' : ''} ${open ? (won ? 'done' : 'cur') : 'locked'}" style="--a:${lg.accentColor || '#f0a21a'};--pc:url(assets/ui/leagues/lg_${i}_tall.webp)${FRAMES.has(i) ? `;--ft:url(assets/ui/frames/f${i}t.webp);--fm:url(assets/ui/frames/f${i}m.webp);--fb:url(assets/ui/frames/f${i}b.webp);--fr1:${FDIM[i][0]};--fr2:${FDIM[i][1]};--fe:${FDIM[i][2] || 0}` : ''}${({2:279,3:298,4:303,7:286,8:300,9:287,11:315,12:276,13:311,14:276,17:276,18:288,21:287,22:265,24:282,25:287,26:280,27:273})[i] ? ';--pp:' + ({2:279,3:298,4:303,7:286,8:300,9:287,11:315,12:276,13:311,14:276,17:276,18:288,21:287,22:265,24:282,25:287,26:280,27:273})[i] : ''}">${tags}<div class="hero" style="background-image:url(${P.bg || ''})"></div><div class="crest"><img class="cup" src="${P.trophy || ART.trophy}" alt=""><img class="ptcup" src="${P.trophy || ART.trophy}" alt="">${BADGES.has(i) ? `<div class="ban bimg" style="--bm:url(assets/ui/badges/lb${i}.webp)"><img src="assets/ui/badges/lb${i}.webp" alt="${esc(lg.name)}"></div>` : `<div class="ban">${esc(lg.name)}</div>`}<div class="rib">LEAGUE ${i}</div></div>
      <div class="post" style="background-image:url(${P.bg || ''})"></div>${body}${foot}</div>`;
  }


  const LK = n => `<img class="${n}" src="assets/ui/lock/${n}.webp" alt="">`;
  const lockStumps = () => `<div class="lockx st"><div class="stk">${LK('stump_l')}${LK('stump_r')}${LK('stump_m')}${LK('bail_l')}${LK('bail_r')}<div class="chn">${LK('lock')}<img class="padb" src="assets/ui/lock/padbody.webp" alt=""></div><i class="ball"></i><i class="ext"></i></div></div>`;
  function unlockFx(card, done) {
    if (!card) return done && done();
    let lx = card.querySelector('.lockx.st'); if (!lx) { card.insertAdjacentHTML('beforeend', lockStumps()); lx = card.querySelector('.lockx.st'); card.classList.add('unlocking'); }
    snd('whoosh'); setTimeout(() => { snd('stumps'); try { hapticTap(); } catch (e) {} }, 420); setTimeout(() => snd('cheer'), 900);
    lx.classList.add('open'); setTimeout(() => { lx.remove(); card.classList.remove('unlocking', 'locked'); done && done(); }, 1050);
  }
  window.v2UnlockFx = i => { const c = document.querySelector(`#v2deck .tcard[data-lg="${i}"]`); unlockFx(c); };
  // focus effect, pager, landing sounds for the league cards
  function fitLocks(o) { o.querySelectorAll('.tcard.pt.locked').forEach(c => { const lx = c.querySelector('.lockx.st'); if (!lx) return; const nd = c.querySelector('.v2stk.lkneed'); if (nd) lx.style.setProperty('--lt', (nd.offsetTop + nd.offsetHeight + 4) + 'px');
      const pg = o.querySelector('.v2pager'), sc = c.getBoundingClientRect().height / c.offsetHeight || 1; requestAnimationFrame(() => { const lt = lx.getBoundingClientRect().top, pt = pg ? pg.getBoundingClientRect().top : lt + c.offsetHeight; const h = Math.min((pt - 6 - lt) / sc, c.offsetWidth * 0.95 / (896 / 1200)); if (h > 40) lx.style.height = Math.round(h) + 'px'; lx.style.setProperty('--ext', Math.max(0, Math.round((innerHeight - lt) / sc - h + 10)) + 'px'); }); }); }
  function deckFocus(o, n) { requestAnimationFrame(() => fitLocks(o)); setTimeout(() => fitLocks(o), 400);
    const rail = o.querySelector('.v2rail'), pg = o.querySelector('.v2pager'); let last = -1, settle = 0, ready = 0;
    const upd = () => { const mid = rail.scrollLeft + rail.clientWidth / 2; let best = 0, bd = 1e9;
      [...rail.children].forEach((c, k) => { const cx = c.offsetLeft + c.offsetWidth / 2, d = Math.min(1, Math.abs(cx - mid) / (c.offsetWidth + 14)); c.style.setProperty('--f', d.toFixed(3)); c.classList.toggle('foc', d < 0.35); if (Math.abs(cx - mid) < bd) { bd = Math.abs(cx - mid); best = k; } });
      if (pg) { pg.querySelector('.pn').textContent = best + 1; pg.querySelector('.pbar i').style.width = ((best + 1) / n * 100) + '%'; }
      if (best !== last) { if (ready && last >= 0) snd('whoosh'); last = best; }
      clearTimeout(settle); settle = setTimeout(() => { const c = rail.children[best]; if (!c || !ready) return; c.classList.remove('land'); void c.offsetWidth; c.classList.add('land');
        if (c.classList.contains('locked')) snd('gloves'); else if (c.classList.contains('iscur')) snd('cheer'); }, 160); };
    rail.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true }); requestAnimationFrame(upd); setTimeout(() => { ready = 1; }, 700);
  }
  function deckGrid(o) {
    const n = LG.length - 1, hi = highestLeagueIdx();
    const g = document.createElement('div'); g.className = 'v2grid';
    g.innerHTML = `<div class="gin"><div class="gh">ALL LEAGUES<button data-gridx="1">✕</button></div><div class="gg">${Array.from({ length: n }, (_, k) => { const i = k + 1, P = PAINT(i), st = finalWon(i) ? 'won' : i <= hi ? 'open' : 'lock';
      return `<button class="gt ${st}" data-jump="${k}"><img src="${P.trophy || ART.trophy}"><span>${esc(LG[i].name)}</span><i>${st === 'won' ? '✓' : st === 'lock' ? '🔒' : i}</i></button>`; }).join('')}</div></div>`;
    o.appendChild(g); requestAnimationFrame(() => g.classList.add('on'));
  }
  const BALLTXT = { spin: 'turns sharply after pitching', pace: 'comes at you extra fast', swing: 'swings late in the air', slow: 'a deceptive slower ball', yorker: 'aimed right at your toes', bouncer: 'rears up off a length' };
  function deckInfo(o, i) {
    const lg = LG[i], band = matchBand(Math.max(1, i)), R = rival(i), nx = LG[i + 1], wT = (lg.winTrophy || 1) + 1, lT = trophyLossFor(i), fr = finalReward(i), b = R.ball || ['Signature ball', 'spin'];
    const sh = document.createElement('div'); sh.className = 'v2sheet';
    sh.innerHTML = `<div class="sin"><div class="gh">${esc(lg.name)}<button data-gridx="1">✕</button></div>
      <div class="ln"><span>Entry</span><b><img src="${ART.coinS}">${fmt(lg.entry)}</b></div>
      <div class="ln"><span>Your chase</span><b>${leagueTarget(lg)} off ${band.balls} balls · ${band.wickets} wkt${band.wickets === 1 ? '' : 's'}</b></div>
      <div class="ln"><span>Trophies</span><b>Win +${wT} · Lose −${lT}</b></div>
      <div class="ln"><span>Every win</span><b>${fmt(lg.winCoins)} coins + ${bagNm(lg.winChest || 'bronze')} bag</b></div>
      ${nx ? `<div class="ln"><span>Reach the Final</span><b>${nx.unlock} 🏆</b></div>
      <div class="ln"><span>The Final</span><b>Beat ${esc(R.n)} · chase ${finalTarget(i)} · free entry</b></div>
      <div class="ln"><span>${esc(b[0])}</span><b>Every 3rd ball ${BALLTXT[b[1]] || 'is special'}</b></div>
      <div class="ln"><span>Win the Final</span><b>${fmt(fr.coins)} coins · ${fr.gems} gems · ${bagNm(fr.bag)} bag · the cup</b></div>` : ''}</div>`;
    o.appendChild(sh); requestAnimationFrame(() => sh.classList.add('on'));
  }
  function openDeck(focus) {
    const o = ov('v2deck'), n = LG.length - 1;
    o.innerHTML = `<div class="bgx"></div>${topBar('LEAGUES')}<div class="v2rail">${Array.from({ length: n }, (_, k) => leagueCard(k + 1)).join('')}</div><button class="v2pager" data-pager="1"><b>LEAGUE <span class="pn">1</span> OF ${n}</b><span class="pbar"><i></i></span><em><img src="${ART.trophy}" alt="">▸</em></button>`;
    { const pills = o.querySelector('.v2top .pill'); if (pills) pills.insertAdjacentHTML('beforebegin', `<span class="pill tro">🏆 ${fmt(trophyState.count)}</span>`); }
    o.classList.add('show'); fillFaces(o); deckFocus(o, n);
    { const v = sec('v2deck'), hi = highestLeagueIdx(); if (v.seenHi && hi > v.seenHi) { const c = o.querySelector(`.tcard[data-lg="${hi}"]`); if (c) { c.classList.add('locked'); c.insertAdjacentHTML('beforeend', lockStumps()); c.classList.add('unlocking'); setTimeout(() => unlockFx(c), 900); } } v.seenHi = hi; save(); }
    { const rail = o.querySelector('.v2rail'), bg = o.querySelector('.bgx'); const setBg = () => { const w = rail.children[0] ? rail.children[0].getBoundingClientRect().width + 14 : 1, c = rail.children[Math.round(rail.scrollLeft / w)]; if (c) { bg.style.setProperty('--dk', c.style.getPropertyValue('--pc')); const r = c.getBoundingClientRect(), bh = bg.clientHeight * 1.16, sc = bh / 1376, cr = 1047 * sc; bg.style.setProperty('--bgy', Math.round(Math.max(-0.16 * bg.clientHeight, Math.min(0, r.bottom - 6 - cr))) + 'px'); bg.style.setProperty('--cw', Math.round(608 * sc) + 'px'); } };
      rail.addEventListener('scroll', () => requestAnimationFrame(setBg), { passive: true }); setTimeout(setBg, 60); }
    if (!window._v2NavHook) { window._v2NavHook = 1; const bn = document.getElementById('bottomNav'); if (bn) bn.addEventListener('click', () => { const d = document.getElementById('v2deck'); if (d) d.classList.remove('show'); }, true); }
    const f = focus != null ? focus : selectedLeagueIdx(); requestAnimationFrame(() => scrollTo(o, Math.max(0, f - 1)));
    try { showNav('league'); } catch (e) {}
    trk('v2_deck', { focus: f });
  }
  window.openLeagueDeck = openDeck;
  // the old Leagues list now opens the cards (all callers go through renderLeagueScreen)
  { const _r = window.renderLeagueScreen; window.renderLeagueScreen = function () { const r = _r.apply(this, arguments);
      try { if (!leagueScreen.classList.contains('hidden') && !window._v2NoDeck) { leagueScreen.classList.add('hidden'); openDeck(); } } catch (e) {} return r; }; }

  // ── 5. WALK-OUT + CHAMPIONS ──────────────────────────────────────────────────────────────────────────────
  function openVs(i) {
    const lg = LG[i], R = rival(i), L = curLook(), band = matchBand(Math.max(1, i)), o = ov('v2vs');
    o.innerHTML = `<div class="bgx" style="background-image:url(${PAINT(i).bg || 'assets/ui/web/hero.webp'})"></div><div class="scr">
      <div class="tag">${esc(lg.name)} · FINAL</div><h2>YOU v ${esc(R.n)}</h2><h3>${esc(R.t)}</h3>
      <div class="v2vsrow"><div class="p me"><div class="pic" data-face="me" data-fk="u"></div><b>${esc(L.name || 'YOU')}</b><small>${L.flag || ''} 🏆 ${trophyState.count}</small></div><div class="vx">VS</div>
      <div class="p riv"><div class="pic" data-face="${i}" data-fk="u"></div><b>${esc(R.n)}</b><small>${R.flag || ''} CAPTAIN</small></div></div>
      <div class="v2pan v2sig" style="margin-top:12px"><span class="ic">${{ spin: '🌀', pace: '⚡', swing: '🌊', slow: '🎈', yorker: '🎯', bouncer: '🔥' }[R.ball[1]]}</span><div><b>SIGNATURE BALL: ${esc(R.ball[0])}</b><small>Every third ball ${SIG[R.ball[1]]}. Watch for the warning.</small></div></div>
      <div class="v2pan" style="margin-top:8px;text-align:center;font-size:17px">CHASE <b style="font-weight:400;color:#FFC93A;font-size:26px">${finalTarget(i)}</b> OFF <b style="font-weight:400;color:#FFC93A;font-size:26px">${band.balls}</b> · ${band.wickets} WICKET${band.wickets === 1 ? '' : 'S'}<br><small style="font:600 12px Arial;color:#9fb3e0">Free entry. Lose and you keep your trophies. Try again any time.</small></div>
      <div style="flex:1"></div><div class="v2row2"><button class="v2go dim" data-v2back="deck">NOT YET</button><button class="v2go red" data-walk="${i}">WALK OUT</button></div></div>`;
    o.classList.add('show'); fillFaces(o); snd('whoosh'); trk('final_vs', { league: i });
  }
  function champions(i, rw) {
    const lg = LG[i], nx = LG[i + 1], o = ov('v2champ');
    o.innerHTML = `<div class="v2rays"></div><div class="scr"><div class="tag">FINAL WON</div><h2 style="font-size:42px">CHAMPIONS!</h2><h3>You beat ${esc(rival(i).n)} and lifted the ${esc(lg.name)}</h3>
      <img class="v2bigcup" src="${PAINT(i).trophy || ART.trophy}" alt="">
      <div class="v2pan"><div class="v2rw"><span><img src="${ART.coin}">+${fmt(rw.coins)}</span><span><img src="${ART.gem}">+${rw.gems}</span><span><img src="${ART.bag(rw.bag)}">${bagNm(rw.bag)} BAG</span></div></div>
      <div class="v2pan" style="margin-top:8px"><div style="text-align:center;font-size:13px;color:#9fb3e0;margin-bottom:6px">TROPHY CABINET · ${cupsWon()} / ${LG.length - 1}</div><div class="v2cab">${LG.slice(1).map((l, k) => `<i class="${finalWon(k + 1) ? 'on' : ''}" style="background-image:url(${(PAINT(k + 1).trophy) || ''})"></i>`).join('')}</div></div>
      <div style="flex:1"></div><div class="v2row2"><button class="v2go gold" data-share="${i}">📣 SHARE</button><button class="v2go" data-v2back="result">${nx ? 'NEXT LEAGUE ›' : 'CONTINUE'}</button></div></div>`;
    for (let k = 0; k < 60; k++) { const c = document.createElement('i'); c.className = 'v2conf'; c.style.left = Math.random() * 100 + '%'; c.style.background = ['#FFC93A', '#7CF29A', '#ff6b5e', '#7fd0ff', '#fff'][k % 5]; c.style.animationDuration = (2 + Math.random() * 2) + 's'; c.style.animationDelay = Math.random() * .8 + 's'; o.appendChild(c); }
    o.classList.add('show'); snd('levelup'); snd('sting4', { delay: 300 }); snd('cheer_big', { delay: 200 });
  }
  // share card: your player lifting the cup, drawn to a picture
  async function shareCard(i) {
    const lg = LG[i], c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const g = c.getContext('2d');
    const img = src => new Promise(r => { if (!src) return r(null); const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = src; });
    const [bg, cup, me] = await Promise.all([img(PAINT(i).bg), img(PAINT(i).trophy), renderPlayer(curLook()).catch(() => null)]);
    g.fillStyle = '#071022'; g.fillRect(0, 0, 1080, 1350);
    if (bg) { const s = Math.max(1080 / bg.width, 1350 / bg.height); g.globalAlpha = .55; g.drawImage(bg, (1080 - bg.width * s) / 2, (1350 - bg.height * s) / 2, bg.width * s, bg.height * s); g.globalAlpha = 1; }
    const gr = g.createLinearGradient(0, 700, 0, 1350); gr.addColorStop(0, 'rgba(7,16,34,0)'); gr.addColorStop(1, 'rgba(7,16,34,.95)'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1350);
    if (me) { const h = 980, w = me.width * h / me.height; g.drawImage(me, 60, 300, w, h); }
    if (cup) { const h = 520, w = cup.width * h / cup.height; g.drawImage(cup, 1080 - w - 40, 360, w, h); }
    g.textAlign = 'center'; g.lineJoin = 'round';
    const txt = (t, y, size, col) => { g.font = `${size}px 'Lilita One', 'Arial Black', sans-serif`; g.lineWidth = size / 5; g.strokeStyle = '#050A14'; g.strokeText(t, 540, y); g.fillStyle = col; g.fillText(t, 540, y); };
    txt('CHAMPIONS!', 170, 150, '#FFC93A'); txt(lg.name, 260, 80, '#fff'); txt(`BEAT ${rival(i).n} IN THE FINAL`, 330, 46, '#cfe0ff');
    txt('FLICKY CRICKET', 1230, 70, '#FFC93A'); txt('flickycricket.com', 1300, 40, '#cfe0ff');
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .9)); const file = new File([blob], 'flicky-champions.jpg', { type: 'image/jpeg' });
    const text = `I just won the ${lg.name} in Flicky Cricket 🏆 Think you can beat ${rival(i).n}? https://flickycricket.com`;
    trk('final_share', { league: i });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); return; } } catch (e) { return; }
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch (e) { return; }
    try { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'flicky-champions.jpg'; a.click(); } catch (e) {}
  }

  // ── 6. CHOOSE HOW TO PLAY (the Home PLAY button) ─────────────────────────────────────────────────────────
  function modeCards() {
    const li = selectedLeagueIdx(), lg = LG[li], P = PAINT(li), nx = LG[li + 1], open = (() => { try { return featureOn('compete'); } catch (e) { return true; } })();
    const ready = finalReady(li), m4 = Math.min(4, matches());
    const lockNow = (txt) => `<div class="now"><b style="font-weight:400;font-size:18px">🔒 ${txt}</b><div class="v2bar" style="flex:none;height:22px"><i style="width:${m4 / 4 * 100}%"></i><span style="line-height:18px;font-size:13px">${m4} / 4 MATCHES</span></div></div>`;
    const cards = [
      { k: 'league', a: lg.accentColor || '#f0a21a', h: `<img class="ico" src="${P.trophy || ART.trophy}"><h4>LEAGUES</h4><div class="sub">${LG.length - 1} CUPS · 120+ GROUNDS</div><div class="post" style="background-image:url(${P.bg || ''})"></div>
        <div class="now"><small>YOU'RE IN</small><b style="font-weight:400;font-size:22px">${esc(lg.name)}</b>${nx ? `<div class="v2bar" style="flex:none"><i style="width:${ready ? 100 : Math.max(0, Math.min(1, (trophyState.count - lg.unlock) / Math.max(1, nx.unlock - lg.unlock))) * 100}%"></i><span>${ready ? '⚔ FINAL READY' : trophyState.count + ' / ' + nx.unlock}</span></div>` : ''}</div>
        ${ready ? `<button class="v2go red" data-final="${li}">⚔ PLAY THE FINAL</button>` : `<button class="v2go" data-play="${li}">PLAY · <img src="${ART.coinS}">${fmt(lg.entry)}</button>`}<button class="v2go dim" data-deck="1" style="height:42px;font-size:17px">VIEW ALL LEAGUES</button>` },
      { k: 'duel', a: '#e0352b', lock: !open, h: `<img class="ico" src="assets/ui/icon_duel.webp"><h4>DUELS</h4><div class="sub">LIVE 1V1 · SAME BALLS · WINNER TAKES THE POT</div><div class="post" style="background-image:url(assets/ui/ev_duels.webp);background-position:center 30%"></div>
        ${open ? `<div class="now">Face a real player's innings, ball for ball.<small>Win trophies for your duel tables</small></div><button class="v2go" data-mode="duel">DUEL</button>` : lockNow('UNLOCKS AFTER 4 MATCHES')}` },
      { k: 'cup', a: '#8A5CF6', lock: !open, h: `<img class="ico" src="assets/ui/cup_trophy.webp"><h4>THE CUP</h4><div class="sub">32 PLAYERS · KNOCKOUT · WEEKENDS</div><div class="post" style="background-image:url(assets/ui/cup_bg.webp)"></div>
        ${open ? `<div class="now">Win and go on. Lose and you're out.<small>5 rounds to the trophy</small></div><button class="v2go" data-mode="cup">ENTER THE CUP</button>` : lockNow('UNLOCKS AFTER 4 MATCHES')}` },
      { k: 'daily', a: '#2BB3A0', h: `<span class="ico e">📅</span><h4>DAILY</h4><div class="sub">ONE CHASE · THE SAME FOR EVERYONE TODAY</div><div class="post" style="background-image:url(${PAINT(Math.max(1, li)).bg || ''});background-position:center 60%"></div>
        <div class="now">Beat today's chase and share your score.<small>New chase at midnight</small></div><button class="v2go" data-mode="challenge">PLAY TODAY'S CHASE</button>` },
      { k: 'nets', a: '#3b82f6', h: `<span class="ico e">🏏</span><h4>NETS</h4><div class="sub">FREE PRACTICE · NO ENTRY</div><div class="post" style="background-image:url(${P.bg || ''});filter:saturate(.7)"></div>
        <div class="now">Hit as many as you like. No trophies, no pressure.<small>Great for learning your timing</small></div><button class="v2go dim" data-mode="nets">PRACTISE</button>` },
      { k: 'friends', a: '#22a050', h: `<span class="ico e">🤝</span><h4>FRIENDS</h4><div class="sub">CHALLENGE A MATE · BOTH GET REWARDS</div><div class="post" style="background-image:url(assets/ui/web/hero.webp)"></div>
        <div class="now">Send your best innings to a mate and see if they can beat it.<small>Your invite code gives you both a bag</small></div><button class="v2go" data-mode="friends">CHALLENGE A FRIEND</button>` }];
    return cards;
  }
  function openModes() {
    const o = ov('v2modes'), C = modeCards();
    o.innerHTML = `<div class="bgx"></div>${topBar('CHOOSE HOW TO PLAY')}<div class="v2rail">${C.map(c => `<div class="mcard ${c.lock ? 'locked' : ''}" style="--a:${c.a}">${c.h}</div>`).join('')}</div><div class="v2dots"></div>`;
    o.classList.add('show'); railDots(o); requestAnimationFrame(() => scrollTo(o, 0)); trk('v2_modes', {});
  }
  window.openModeDeck = openModes;
  function runMode(k) {
    closeAll();
    if (k === 'nets') { try { playNets(); } catch (e) {} return; }
    if (k === 'friends') { goHome(); try { Mates.render(); document.getElementById('matesPanel').classList.add('show'); } catch (e) {} return; }
    try { goHome(); playMode(k); } catch (e) {}
  }

  // ── click wiring ─────────────────────────────────────────────────────────────────────────────────────────
  document.addEventListener('click', e => {
    const t = e.target && e.target.closest ? e.target : null; if (!t) return;
    const inV2 = t.closest('.v2o'); if (!inV2) return;
    let b;
    if ((b = t.closest('[data-v2back]'))) { tap(); const w = b.dataset.v2back; if (w === 'deck') { closeAll(); openDeck(); } else if (w === 'result') { closeAll(); } else goHome(); return; }
    if ((b = t.closest('[data-gridx]'))) { tap(); const w = b.closest('.v2grid,.v2sheet'); if (w) w.remove(); return; }
    if ((b = t.closest('[data-jump]'))) { tap(); const d = b.closest('.v2o'), w = b.closest('.v2grid'); if (w) w.remove(); const rail = d.querySelector('.v2rail'), c = rail.children[+b.dataset.jump]; if (c) rail.scrollTo({ left: c.offsetLeft - (rail.clientWidth - c.clientWidth) / 2, behavior: 'smooth' }); return; }
    if ((b = t.closest('[data-pager]'))) { tap(); deckGrid(b.closest('.v2o')); return; }
    if ((b = t.closest('[data-info]'))) { tap(); deckInfo(b.closest('.v2o'), +b.dataset.info); return; }
    if ((b = t.closest('[data-short]'))) { tap(); closeAll(); try { const sb = document.getElementById('shopNavBtn'); if (sb) sb.click(); } catch (e) {} return; }
    if ((b = t.closest('.tcard.locked'))) { const lx = b.querySelector('.lockx'), nd = b.querySelector('.need'); [lx, nd].forEach(el => { if (el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); } }); snd('gloves'); try { hapticTap(); } catch (e) {} return; }
    if ((b = t.closest('[data-play]'))) { tap(); const i = +b.dataset.play; closeAll(); window._v2NoDeck = true; try { playLeague(i); } finally { window._v2NoDeck = false; } return; }
    if ((b = t.closest('[data-final]'))) { tap(); openVs(+b.dataset.final); return; }
    if ((b = t.closest('[data-walk]'))) { tap(); playFinal(+b.dataset.walk); return; }
    if ((b = t.closest('[data-deck]'))) { tap(); closeAll(); openDeck(); return; }
    if ((b = t.closest('[data-mode]'))) { tap(); runMode(b.dataset.mode); return; }
    if ((b = t.closest('[data-share]'))) { tap(); shareCard(+b.dataset.share); return; }
    if ((b = t.closest('[data-album]'))) { tap(); albumNav(b.dataset.album); return; }
    if ((b = t.closest('[data-swap]'))) { tap(); albumSwap(b.dataset.swap); return; }
    if ((b = t.closest('[data-claimpage]'))) { tap(); albumClaim(+b.dataset.claimpage); return; }
  }, true);
  // Home PLAY → Choose how to play (the app); the web taster keeps one tap to play
  window.addEventListener('click', e => { const t = e.target && e.target.closest && e.target.closest('#startBtn'); if (!t || TEASER) return;
    if (matches() < 1) return;   // the very first match goes straight in
    // Nov 27 (Joe): PLAY goes straight to your league match; other modes live on the MODES screen
    e.stopImmediatePropagation(); e.preventDefault(); tap(); const li = selectedLeagueIdx();
    if (finalReady(li)) { openVs(li); return; } closeAll(); window._v2NoDeck = true; try { playLeague(li); } finally { window._v2NoDeck = false; } }, true);
  // the home league card opens the league cards
  window.addEventListener('click', e => { const t = e.target && e.target.closest && e.target.closest('#homeLeagueCard'); if (!t || TEASER) return;
    e.stopImmediatePropagation(); e.preventDefault(); tap(); openDeck(); }, true);

  // ── 7. HOME: Pass bar, badges, final-ready state, streak flame, staged reveals ───────────────────────────
  const home = document.getElementById('overlay');
  const passB = document.createElement('div'); passB.id = 'v2pass'; passB.innerHTML = '<span class="tg">⭐ FLICKY PASS</span><span class="bar"><i></i><b></b></span><span class="nx"><img alt=""><span>NEXT</span></span>';
  const evB = document.createElement('div'); evB.id = 'v2evB'; evB.className = 'v2badge';
  const alB = document.createElement('div'); alB.id = 'v2alB'; alB.className = 'v2badge';
  const flame = document.createElement('div'); flame.id = 'v2flame';
  if (home) [passB, evB, alB, flame].forEach(x => home.appendChild(x));
  passB.addEventListener('click', e => { e.stopPropagation(); tap(); try { renderPass(); document.getElementById('passPanel').classList.add('show'); } catch (err) {} });
  evB.addEventListener('click', e => { e.stopPropagation(); tap(); openSixes(); });
  alB.addEventListener('click', e => { e.stopPropagation(); tap(); openAlbum(); });
  function passNext() { try { const t = passTier(), P = GAME_CONFIG.season.pass; if (t >= P.tiers) return null; return passReward(t + 1, false); } catch (e) { return null; } }
  function rwIcon(r) { if (!r) return ART.trophy; if (r.bag) return ART.bag(r.bag); if (r.gems) return ART.gemS; return ART.coinS; }
  function layoutHome() {
    try {
      const top = document.querySelector('#overlay .menuTopBar, #menuTopBar, #homeTop') ; const logoB = Math.round(Math.min(190, innerHeight * 0.225));
      passB.style.top = logoB + 'px'; const showA = alB.classList.contains('on'); alB.style.top = (logoB + 56) + 'px'; evB.style.top = (logoB + (showA ? 140 : 56)) + 'px'; flame.style.top = (logoB + 56) + 'px';
    } catch (e) {}
  }
  function paintHome() {
    if (!home || home.classList.contains('hidden')) return;
    const m = matches();
    // Pass (from match 5)
    const showPass = !TEASER && m >= 5; passB.classList.toggle('on', showPass);
    if (showPass) { try { const P = GAME_CONFIG.season.pass, xp = passState().xp, t = passTier(); const inT = t >= P.tiers ? 1 : (xp % P.xpPerTier) / P.xpPerTier;
      passB.querySelector('.bar i').style.width = (inT * 100) + '%'; passB.querySelector('.bar b').textContent = t >= P.tiers ? 'MAXED' : `TIER ${t} · ${Math.round(inT * 100)}%`;
      passB.querySelector('.nx img').src = rwIcon(passNext()); } catch (e) {} }
    // Event badge
    const sw = sixesOn(), ae = (() => { try { return activeEvent(); } catch (e) { return null; } })();
    if (!TEASER && m >= 3 && (sw || ae)) { evB.classList.add('on'); evB.innerHTML = sw ? `<span class="e">💥</span>SIXES<br>WEEKEND<small>${sixesLeft()}</small>` : `<span class="e">🎄</span>${esc(ae.name.split(' ')[0])}<br>EVENT<small>ON NOW</small>`;
      evB.onclick = sw ? null : (ev => { ev.stopPropagation(); tap(); document.getElementById('eventsNavBtn').click(); }); } else evB.classList.remove('on');
    // Album badge (from match 10)
    const showAl = !TEASER && m >= 10; alB.classList.toggle('on', showAl);
    if (showAl) { const a = A(), li = Math.max(1, selectedLeagueIdx()), pg = page(li), have = pg.filter(s => a.have[s.id]).length, nw = a.fresh || 0;
      alB.innerHTML = `<span class="e">📒</span>ALBUM<br>${have} / ${pg.length}${nw ? `<small>+${nw} NEW</small>` : '<small>COLLECT</small>'}${nw ? `<span class="v2dot">${nw}</span>` : ''}`;
      if (!a.intro && !busyMoment()) { a.intro = 1; a.have = a.have || {}; save(); setTimeout(() => albumGift(), 900); } }
    layoutHome();
    // streak flame
    try { const n = sec('streak').current || 0; flame.classList.toggle('on', n >= 3); if (n >= 3) flame.textContent = `🔥 ${n} WIN STREAK`; } catch (e) { flame.classList.remove('on'); }
    // final-ready / road text on the home league card
    try { const li = currentLeagueIdx(), fill = document.getElementById('homeRoadFill'), txt = document.getElementById('homeRoadTxt');
      if (finalReady(li) && fill && txt) { fill.style.width = '100%'; fill.style.background = 'linear-gradient(#ff8a65,#e0352b)'; txt.textContent = '⚔ FINAL'; }
      else if (fill) fill.style.background = ''; } catch (e) {}
    // hide the old mode chips (the PLAY button now opens the mode cards)
    if (!TEASER) { const mc = document.getElementById('modeChips'); if (mc) mc.style.display = 'none'; try { localStorage.setItem('flickyPlayMode', 'league'); } catch (e) {} }
    // first Final: tell them once
    if (window._finalJustReady != null) { const i = window._finalJustReady; window._finalJustReady = null; setTimeout(() => { try { showMessage(`⚔ THE ${LG[i].name} FINAL IS ON!`, '#ff8a65', 2800); snd('horn'); } catch (e) {} }, 1600); }
  }
  setInterval(paintHome, 1200); setTimeout(paintHome, 300);
  window.v2PaintHome = paintHome;

  // nothing else pops up during a big moment (Finals, unlocks, packs)
  function busyMoment() { return (window._v2Quiet || 0) > Date.now() || !!document.querySelector('.v2o.show, #rdUnlock.show, #nkWow.show, #tzCard.show'); }
  window.v2BusyMoment = busyMoment;
  setTimeout(() => { try { ['maybeOfferCode', 'ask'].forEach(k => { const f = Mates[k]; if (typeof f !== 'function') return; Mates[k] = function () { if (busyMoment()) return; return f.apply(this, arguments); }; }); } catch (e) {} }, 0);

  // ── 8. TROPHY CABINET in the Profile (appears after your first Final) ────────────────────────────────────
  { const _rs = window.renderStatsScreen; if (typeof _rs === 'function') window.renderStatsScreen = function () { const r = _rs.apply(this, arguments);
      try { if (cupsWon() || matches() >= 1) { const body = document.getElementById('statsBody'); let el = document.getElementById('v2cabS'); if (!el) { el = document.createElement('div'); el.id = 'v2cabS'; body.insertBefore(el, body.firstChild); }
        el.innerHTML = `<div style="margin:4px 0 10px;padding:10px;border-radius:16px;border:3px solid #050A14;background:#14203a;font-family:'Lilita One',sans-serif;color:#fff"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>🏆 TROPHY CABINET</span><span style="color:#FFC93A">${cupsWon()} / ${LG.length - 1}</span></div>
          <div class="v2cab">${LG.slice(1).map((l, k) => `<i class="${finalWon(k + 1) ? 'on' : ''}" title="${esc(l.name)}" style="background-image:url(${PAINT(k + 1).trophy || ''})"></i>`).join('')}</div></div>`; } } catch (e) {} return r; }; }

  // ── 9. STICKER ALBUM ─────────────────────────────────────────────────────────────────────────────────────
  const KIT = (() => { try { return Object.keys(EQUIP_ART); } catch (e) { return []; } })();
  function A() { const a = sec('album'); a.have = a.have || {}; a.claimed = a.claimed || {}; return a; }
  const _pages = {};
  function page(li) {   // 9 stickers per league: its grounds, kit from that league, the cup
    if (_pages[li]) return _pages[li];
    const lg = LG[li], out = [];
    (lg.scenes || []).slice(0, 6).forEach(k => out.push({ id: `g${li}_${k}`, kind: 'g', name: (() => { try { return sceneName(k); } catch (e) { return k.toUpperCase(); } })(), img: (typeof RESULT_ART !== 'undefined' && RESULT_ART[k]) || PAINT(li).bg }));
    let n = 0; while (out.length < 8 && KIT.length && n < 200) { const id = KIT[(li * 5 + n * 7) % KIT.length]; n++; if (out.some(s => s.id === 'k' + li + '_' + id)) continue;
      const nm = (() => { try { const it = (typeof equipItemById === 'function') ? equipItemById(id) : null; return it ? it.name : id.split('_').slice(1).join(' ').toUpperCase(); } catch (e) { return id.toUpperCase(); } })(); if (out.some(s => s.name === nm)) continue;
      out.push({ id: `k${li}_${id}`, kind: 'k', name: (() => { try { const it = (typeof equipItemById === 'function') ? equipItemById(id) : null; return it ? it.name : id.split('_').slice(1).join(' ').toUpperCase(); } catch (e) { return id.toUpperCase(); } })(), img: EQUIP_ART[id] }); }
    out.push({ id: `c${li}`, kind: 'c', name: lg.name, img: PAINT(li).trophy, gold: 1 });
    return (_pages[li] = out);
  }
  function dropStickers(n, li, why) {   // n stickers, mostly from the given league's page
    const a = A(), got = []; li = Math.max(1, li || selectedLeagueIdx());
    for (let k = 0; k < n; k++) { const L = Math.random() < .75 ? li : Math.max(1, Math.floor(1 + Math.random() * Math.max(1, highestLeagueIdx())));
      const pg = page(L).filter(s => !s.gold || Math.random() < .12); const s = pg[Math.floor(Math.random() * pg.length)]; if (!s) continue;
      const isNew = !a.have[s.id]; a.have[s.id] = (a.have[s.id] || 0) + 1; if (isNew) a.fresh = (a.fresh || 0) + 1; got.push(Object.assign({ isNew, li: L }, s)); }
    save(); trk('album_drop', { n: got.length, why }); return got;
  }
  function stickerHTML(s, have, cls) {
    const miss = !have; return `<div class="stk3 ${s.kind === 'g' ? '' : 'k'} ${miss ? 'miss' : ''} ${cls || ''}" style="background-image:url(${s.img || ''})">${s.gold ? '<b class="star">⭐</b>' : ''}${have > 1 ? `<b class="dup">×${have}</b>` : ''}<span>${miss ? '???' : esc(s.name)}</span></div>`;
  }
  const acss = document.createElement('style');
  acss.textContent = `.v2alb{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%}
  .stk3{position:relative;aspect-ratio:.8;border-radius:12px;border:3px solid #050A14;background:#0a1226 center/cover;box-shadow:0 3px 0 #050A14;overflow:hidden}
  .stk3.k{background-size:68%;background-repeat:no-repeat;background-color:#24365c}
  .stk3 span{position:absolute;left:0;right:0;bottom:0;padding:3px 2px;background:rgba(5,10,20,.82);font-size:10px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .stk3.miss{filter:grayscale(1) brightness(.22)}.stk3 .star{position:absolute;top:3px;left:4px;font-size:12px}
  .stk3 .dup{position:absolute;top:3px;right:4px;padding:0 5px;border-radius:7px;background:#3b82f6;border:2px solid #050A14;font-weight:400;font-size:11px}
  .stk3.pop{animation:v2pop .6s cubic-bezier(.3,1.6,.5,1) both}
  #v2album .scr,#v2pack .scr,#v2six .scr{position:relative;height:calc(100% - 60px);overflow:auto;display:flex;flex-direction:column;align-items:center;gap:8px;padding:6px 14px calc(env(safe-area-inset-bottom,0px) + 18px);box-sizing:border-box}
  .v2pgnav{display:flex;align-items:center;gap:8px;width:100%}.v2pgnav button{width:44px;height:44px;border-radius:12px;border:3px solid #050A14;background:#24365c;color:#fff;font:24px 'Lilita One',sans-serif}
  .v2pgnav .mid{flex:1;text-align:center}.v2pgnav .mid b{display:block;font-weight:400;font-size:20px}.v2pgnav .mid small{font-size:12px;color:#9fb3e0}
  .v2fan{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;width:100%;margin:10px 0}.v2fan .stk3{width:100%}
  .v2fan .tagn{position:absolute;top:4px;left:50%;transform:translateX(-50%);padding:1px 7px;border-radius:8px;border:2px solid #050A14;background:#ff4d4d;font-size:11px;z-index:2}
  .v2ms{position:relative;width:100%;height:16px;border-radius:8px;background:#050A14;margin:28px 0 34px}
  .v2ms>i{position:absolute;inset:0 auto 0 0;border-radius:8px;background:linear-gradient(#ffd75a,#f0a21a)}
  .v2ms em{position:absolute;top:-24px;transform:translateX(-50%);width:42px;height:42px;border-radius:10px;border:3px solid #050A14;background:#24365c center/78% no-repeat;font-style:normal}
  .v2ms em.got{background-color:#2f7a3c}.v2ms em span{position:absolute;top:44px;left:50%;transform:translateX(-50%);font-size:11px;color:#9fb3e0;white-space:nowrap}`;
  document.head.appendChild(acss);
  let alPage = null;
  function openAlbum(li) {
    const a = A(); a.fresh = 0; save(); alPage = li || alPage || Math.max(1, selectedLeagueIdx());
    const hi = Math.max(1, highestLeagueIdx()), pg = page(alPage), have = pg.filter(s => a.have[s.id]).length, done = have === pg.length, claimed = a.claimed[alPage];
    const dupes = Object.values(a.have).reduce((t, v) => t + Math.max(0, v - 1), 0), missing = pg.filter(s => !a.have[s.id]);
    const pagesDone = Object.keys(a.claimed).length, o = ov('v2album');
    o.innerHTML = `<div class="bgx"></div>${topBar('📒 FLICKY ALBUM')}<div class="scr">
      <div class="v2pgnav"><button data-album="prev" ${alPage <= 1 ? 'disabled' : ''}>‹</button><div class="mid"><b>${esc(LG[alPage].name)}</b><small>PAGE ${alPage} OF ${LG.length - 1}${alPage > hi ? ' · NOT REACHED YET' : ''}</small></div><button data-album="next" ${alPage >= LG.length - 1 ? 'disabled' : ''}>›</button></div>
      <div class="v2bar" style="flex:none;width:100%"><i style="width:${have / pg.length * 100}%"></i><span>${have} / ${pg.length} STICKERS</span></div>
      <div class="v2alb">${pg.map(s => stickerHTML(s, a.have[s.id] || 0)).join('')}</div>
      <div class="v2pan" style="display:flex;align-items:center;gap:10px"><img src="${ART.bag('gold')}" style="height:46px"><div style="flex:1;font-size:15px">PAGE REWARD<br><small style="font:600 12px Arial;color:#9fb3e0">${claimed ? 'Collected ✓' : 'Gold bag + ' + (40 + alPage * 5) + ' gems'}</small></div>${done && !claimed ? `<button class="v2go gold" style="width:auto;padding:0 16px;height:44px" data-claimpage="${alPage}">CLAIM</button>` : ''}</div>
      <div class="v2pan" style="display:flex;align-items:center;gap:10px"><span style="font-size:26px">🔁</span><div style="flex:1;font-size:14px">SWAP 5 DUPLICATES FOR A STICKER YOU NEED<br><small style="font:600 12px Arial;color:#9fb3e0">You have ${dupes} duplicate${dupes === 1 ? '' : 's'}</small></div>${dupes >= 5 && missing.length && alPage <= hi ? `<button class="v2go" style="width:auto;padding:0 16px;height:44px" data-swap="${alPage}">SWAP</button>` : ''}</div>
      <div style="font:600 12px Arial;color:#9fb3e0;text-align:center">Stickers drop from every kit bag and sometimes from league wins. Gold stickers are rare. ${pagesDone} page${pagesDone === 1 ? '' : 's'} complete.</div></div>`;
    o.classList.add('show'); trk('album_open', { page: alPage });
  }
  window.openFlickyAlbum = openAlbum; window.v2AlbumPage = page;
  function albumNav(d) { alPage = Math.max(1, Math.min(LG.length - 1, alPage + (d === 'next' ? 1 : -1))); openAlbum(alPage); }
  function albumSwap(li) { li = +li; const a = A(); const miss = page(li).filter(s => !a.have[s.id]); if (!miss.length) return;
    let need = 5; for (const k of Object.keys(a.have)) { while (a.have[k] > 1 && need > 0) { a.have[k]--; need--; } if (!need) break; }
    if (need) return; const s = miss.find(x => !x.gold) || miss[0]; a.have[s.id] = 1; save(); snd('card'); trk('album_swap', { page: li }); showPack([Object.assign({ isNew: true }, s)], 'SWAPPED IN'); }
  function albumClaim(li) { const a = A(); if (a.claimed[li]) return; a.claimed[li] = Date.now(); save(); const lbl = grantReward({ bag: 'gold', gems: 40 + li * 5 }); snd('levelup'); try { showMessage('PAGE COMPLETE! ' + lbl, '#FFC93A', 2600); } catch (e) {} trk('album_page', { page: li }); openAlbum(li); }
  function showPack(got, title) {
    if (!got || !got.length) return; const o = ov('v2pack'), a = A();
    o.innerHTML = `<div class="v2rays"></div><div class="scr" style="justify-content:center"><div class="tag">${esc(title || 'STICKER PACK')}</div><h2>${got.length} STICKER${got.length > 1 ? 'S' : ''}!</h2>
      <div class="v2fan">${got.map((s, k) => `<div style="position:relative;width:30%">${s.isNew ? '<b class="tagn">NEW!</b>' : '<b class="tagn" style="background:#3b82f6">+1 SWAP</b>'}${stickerHTML(s, 1, 'pop')}</div>`).join('')}</div>
      <div class="v2pan" style="text-align:center;font-size:15px">${esc(LG[got[0].li || selectedLeagueIdx()].name)} PAGE <b style="font-weight:400;color:#FFC93A">${page(got[0].li || selectedLeagueIdx()).filter(s => a.have[s.id]).length} / ${page(got[0].li || selectedLeagueIdx()).length}</b></div>
      <div class="v2row2" style="margin-top:10px"><button class="v2go dim" data-v2back="result">LATER</button><button class="v2go gold" data-album="open">OPEN ALBUM</button></div></div>`;
    o.classList.add('show'); snd('sparkle');
  }
  { const _an = albumNav; window.__albumNav = _an; }
  function albumGift() { const got = dropStickers(3, selectedLeagueIdx(), 'intro'); showPack(got, 'YOUR ALBUM IS OPEN · FREE PACK'); }
  // bags drop stickers; league wins sometimes do
  { const _oc = window.openChestRewards; if (typeof _oc === 'function') window.openChestRewards = function (type) { const r = _oc.apply(this, arguments);
      try { if (!TEASER && matches() >= 10) { const n = { wooden: 1, bronze: 1, silver: 2, gold: 2, platinum: 3, elite: 3, legendary: 3 }[type] || 1; window._v2PackAfter = dropStickers(n, selectedLeagueIdx(), 'bag'); } } catch (e) {} return r; }; }
  { const _sa = window.showChestOpenAnimation; if (typeof _sa === 'function') window.showChestOpenAnimation = function (t, r, done) { return _sa.call(this, t, r, function () {
        try { done && done.apply(this, arguments); } catch (e) {}
        const got = window._v2PackAfter; window._v2PackAfter = null; if (got && got.length) { let n = 0; const w = () => { const nk = document.getElementById('nkWow'); if (nk && nk.classList.contains('show') && n++ < 400) return setTimeout(w, 300); setTimeout(() => showPack(got, 'STICKERS FROM YOUR BAG'), 300); }; setTimeout(w, 400); } }); }; }
  { const _eg2 = window.endGame; window.endGame = function () { const c = window.chase, li = c && c.leagueIdx, won = c && c.mode === 'league' && runs >= c.target;
      const r = _eg2.apply(this, arguments); try { if (won && !TEASER && matches() >= 10 && Math.random() < .25) { const got = dropStickers(1, li, 'win'); if (got.length) setTimeout(() => { try { showMessage(`📒 STICKER: ${got[0].name}${got[0].isNew ? ' · NEW!' : ''}`, '#7CF29A', 2200); } catch (e) {} }, 3200); } } catch (e) {} return r; }; }
  // album open button inside the pack screen
  document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-album="open"]'); if (!b) return; e.stopImmediatePropagation(); tap(); closeAll(); openAlbum(); }, true);

  // ── 10. SIXES WEEKEND (every Sat-Sun): every six in any match scores a point towards milestone rewards ─────
  const SIXM = [[10, { coins: 500 }], [20, { bag: 'bronze' }], [35, { gems: 50 }], [50, { bag: 'gold' }], [75, { gems: 150, bag: 'platinum' }]];
  function wkKey() { const d = _nowDate(); const day = d.getDay(); const sat = new Date(d); sat.setDate(d.getDate() - ((day + 1) % 7)); return sat.toISOString().slice(0, 10); }
  function sixesOn() { try { const d = _nowDate().getDay(); return d === 6 || d === 0; } catch (e) { return false; } }
  function sixesLeft() { const d = _nowDate(), end = new Date(d); end.setDate(d.getDate() + (d.getDay() === 6 ? 2 : 1)); end.setHours(0, 0, 0, 0); const h = Math.max(0, Math.round((end - d) / 36e5)); return h > 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h`; }
  function SX() { const s = sec('sixes'); const k = wkKey(); if (s.wk !== k) { s.wk = k; s.n = 0; s.got = []; } return s; }
  { const _cb = window.chaseBall; if (typeof _cb === 'function') window.chaseBall = function (rs) { const r = _cb.apply(this, arguments);
      try { if (!TEASER && rs >= 6 && sixesOn() && window.chase && window.chase.mode !== 'nets') { const s = SX(); s.n++; SIXM.forEach(([v, rw], k) => { if (s.n >= v && !s.got.includes(k)) { s.got.push(k); const l = grantReward(rw); setTimeout(() => { try { showMessage(`💥 SIXES WEEKEND: ${v} SIXES! ${l}`, '#FFC93A', 2600); } catch (e) {} }, 1200); trk('sixes_ms', { v }); } }); save(); } } catch (e) {}
      return r; }; }
  function openSixes() {
    const s = SX(), o = ov('v2six'), max = SIXM[SIXM.length - 1][0] + 5;
    o.innerHTML = `<div class="bgx"></div>${topBar('EVENT')}<div class="scr">
      <div class="v2pan" style="height:140px;display:flex;flex-direction:column;justify-content:flex-end;background:linear-gradient(rgba(5,10,20,.1),rgba(5,10,20,.8)),url(${PAINT(2).bg || ''}) center/cover"><small style="color:#FFC93A;font-size:13px">WEEKEND EVENT · ENDS IN ${sixesLeft()}</small><b style="font-weight:400;font-size:32px;text-shadow:0 3px 0 #050A14">💥 SIXES WEEKEND</b></div>
      <h3>Every six you hit in any match scores a point</h3>
      <div class="v2pan"><div style="font-size:16px;text-align:center">YOUR SIXES: <b style="font-weight:400;color:#FFC93A;font-size:24px">${s.n}</b></div>
      <div class="v2ms"><i style="width:${Math.min(100, s.n / max * 100)}%"></i>${SIXM.map(([v, rw], k) => `<em class="${s.got.includes(k) ? 'got' : ''}" style="left:${v / max * 100}%;background-image:url(${rwIcon(rw)})"><span>${v}</span></em>`).join('')}</div></div>
      <div class="v2pan" style="font:600 13px/1.45 Arial,sans-serif;color:#d6e2ff">Rewards drop straight into your bags and wallet as you pass each milestone. Leagues, duels, the cup and the daily chase all count. Nets don't.</div>
      <div style="flex:1"></div><button class="v2go" data-v2back="home" style="flex:none">PLAY ›</button></div>`;
    o.classList.add('show'); trk('sixes_open', { n: s.n });
  }
  window.openSixesWeekend = openSixes;
  // "PLAY ›" on the event screen goes to the mode cards
  document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('#v2six [data-v2back="home"]'); if (!b) return; e.stopImmediatePropagation(); tap(); closeAll(); goHome(); setTimeout(openModes, 50); }, true);

  // ── 11. DAILY CHALLENGE share: an emoji grid of your innings, Wordle style ───────────────────────────────
  function dailyShareText(log, runs, tgt, won) {
    const em = v => v === 'W' || v === -1 ? '🟥' : v >= 6 ? '🟪' : v >= 4 ? '🟩' : v > 0 ? '🟨' : '⬜';
    const d = _nowDate(), day = `${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]}`;
    return `Flicky Cricket · Daily ${day}\n${won ? '✅' : '❌'} ${runs}/${tgt}\n${(log || []).map(em).join('')}\nhttps://flickycricket.com/play`;
  }
  window.flickyDailyShare = async function () { try { const c = window._v2LastDaily; if (!c) return; const text = dailyShareText(c.log, c.runs, c.target, c.won);
      trk('daily_share', {}); if (navigator.share) { await navigator.share({ text }); return; } await navigator.clipboard.writeText(text); showMessage('COPIED · PASTE IT ANYWHERE', '#22c55e', 1800); } catch (e) {} };
  { const _me = window.modeEnd; if (typeof _me === 'function') window.modeEnd = function () { const c = window.chase;
      if (c && c.mode === 'challenge') window._v2LastDaily = { log: (c.log || []).slice(), runs, target: c.target, won: runs >= c.target };
      const r = _me.apply(this, arguments);
      if (c && c.mode === 'challenge') setTimeout(() => { try { let b = document.getElementById('v2dshare'); if (!b) { b = document.createElement('button'); b.id = 'v2dshare'; b.className = 'v2go gold';
          b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 110px);z-index:8500;width:min(80vw,320px)'; b.onclick = e => { e.stopPropagation(); window.flickyDailyShare(); }; document.body.appendChild(b); }
          b.textContent = '📣 SHARE TODAY\'S SCORE'; b.style.display = 'flex'; const hide = () => { if (document.getElementById('overlay') && !document.getElementById('overlay').classList.contains('hidden')) b.style.display = 'none'; }; const iv = setInterval(() => { hide(); if (b.style.display === 'none') clearInterval(iv); }, 800); } catch (e) {} }, 1600);
      return r; }; }

  // ── 12. NOTIFICATIONS tied to the loop (app only): Final ready · stickers waiting · event ending ───────────
  async function loopNotices() { try { const LN = window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.LocalNotifications; if (!LN) return;
      const now = Date.now(), list = [], li = currentLeagueIdx();
      if (finalReady(li)) list.push({ id: 7101, title: `⚔ The ${LG[li].name} Final is on`, body: `${rival(li).n} is waiting. Free entry, no trophies to lose.`, at: now + 3 * 36e5 });
      if (sixesOn()) { const s = SX(); const nx = SIXM.find(([v], k) => !s.got.includes(k)); if (nx) list.push({ id: 7102, title: '💥 Sixes Weekend ends soon', body: `${s.n} sixes so far. ${nx[0]} gets the next reward.`, at: now + 5 * 36e5 }); }
      await LN.cancel({ notifications: [{ id: 7101 }, { id: 7102 }] }).catch(() => {});
      if (list.length) await LN.schedule({ notifications: list.map(n => ({ id: n.id, title: n.title, body: n.body, schedule: { at: new Date(n.at) } })) }); } catch (e) {} }
  document.addEventListener('visibilitychange', () => { if (document.hidden) loopNotices(); });
})();

/* ===== 2.2 home screen (option 1): trophies in the top bar, smaller logo, side rails, painted league panel ===== */
(function homeV22() {
  const css = document.createElement('style');
  css.textContent = `
  #homeWordmark{width:204px!important;height:auto!important;left:50%!important;transform:translateX(-50%)!important}
  #homePlayer::after{display:none!important}
  @keyframes hv2flash{0%,100%{box-shadow:0 0 0 0 rgba(255,210,74,0)}40%{box-shadow:0 0 0 5px rgba(255,210,74,.9)}}
  .hv2flash{animation:hv2flash .7s ease 2;border-radius:16px}
  #homeTop{left:62px!important;right:8px!important;width:auto!important;display:flex!important;gap:5px!important}
  #homeTop .hPill{flex:1 1 0!important;min-width:0!important;width:auto!important;padding-right:4px!important}
  #homeTop .hPill .hNum{font-size:15px!important;min-width:0!important}
  #homeTroPill{border-color:#ffd24a!important}
  #homeTroPill .hNum{color:#fff}
  body:not(:has(#v2deck.show)) #bottomNav .navTile{border:2.5px solid rgba(255,255,255,.85);border-radius:16px;background:linear-gradient(#3a64b8,#1a3270);box-shadow:inset 0 2px 0 rgba(255,255,255,.28),0 3px 0 rgba(0,0,0,.45)}
  body:not(:has(#v2deck.show)) #bottomNav .navBtn.active .navTile{border-color:#ffd24a;background:linear-gradient(#4a78d0,#1f3c86)}
  body:not(:has(#v2deck.show)) #bottomNav .navBtn.navPlay .navTile{border:3px solid #ffd24a;background:linear-gradient(#4a78d0,#1a3270);box-shadow:inset 0 2px 0 rgba(255,255,255,.3),0 4px 0 #050A14,0 0 14px rgba(255,201,58,.45)}
  #homePlayer{height:max(200px, min(calc(100vh - var(--navH) - 206px - var(--hdrTop) - 138px), 390px))!important;bottom:calc(var(--navH) + 206px)!important}
  .hv2rail{position:absolute;top:calc(var(--hdrTop,6px) + 184px);display:flex;flex-direction:column;gap:16px;z-index:4}
  .hv2rail.l{left:10px}.hv2rail.r{right:10px}
  .hv2b{width:62px;background:none;border:0;padding:0;color:#fff;font:400 11.5px/1 'Lilita One',sans-serif;letter-spacing:.02em;text-align:center;text-shadow:0 2px 0 rgba(0,0,0,.6);cursor:pointer;-webkit-tap-highlight-color:transparent}
  .hv2b .ic{display:block;width:56px;height:56px;margin:0 auto 5px;border-radius:15px;background:center/cover no-repeat;border:2.5px solid #fff;box-shadow:0 3px 0 rgba(0,0,0,.45);position:relative}
  .hv2b:active .ic{transform:scale(.94)}
  .hv2b .tg{position:absolute;right:-9px;top:-9px;background:#e8243a;border-radius:9px;padding:2px 6px 1px;font-size:10.5px;line-height:1.1;white-space:nowrap;border:2px solid #fff;box-shadow:0 2px 0 rgba(0,0,0,.35)}
  .hv2b .tg:empty{display:none}
  .hv2b .tg.g{background:#2bb24c}
  .hv2b .dt{position:absolute;right:-6px;top:-6px;min-width:19px;height:19px;border-radius:10px;background:#e8243a;border:2px solid #fff;font-size:11px;display:grid;place-items:center;padding:0 3px}
  .hv2b.off .ic{filter:grayscale(.7) brightness(.75)}
  @media (max-height:720px){.hv2rail{top:calc(var(--hdrTop,6px) + 124px)!important;gap:11px!important}.hv2b{width:52px!important;font-size:10px!important}.hv2b .ic{width:46px!important;height:46px!important;border-radius:12px!important;margin-bottom:4px!important}#homeWordmark{width:132px!important;top:calc(var(--safeT,0px) + 50px)!important}#homePlayer{height:calc(100vh - var(--navH) - 200px - var(--hdrTop) - 112px)!important;bottom:calc(var(--navH) + 200px)!important}}
  #homeLeagueCard{border-radius:18px!important;overflow:hidden!important;border:2.5px solid #ffd98a!important;box-shadow:0 0 0 1.5px rgba(0,0,0,.5),0 8px 14px rgba(0,0,0,.45)!important;background:#2a1a10 var(--hv2art) var(--hv2x,0px) var(--hv2y,0px)/var(--hv2w,260px) auto no-repeat!important;height:88px!important}
  #homeLeagueCard>canvas,#homeLeagueCard>.lcShade,#homeLeagueCard>.lcTag,#homeLeagueCard>.lcBody{display:none!important}
  #homeLeagueCard .hv2s{position:absolute;inset:0;border-radius:15.5px;background:linear-gradient(90deg,rgb(8,14,32) 0%,rgb(8,14,32) var(--hv2a0,52%),rgba(8,14,32,0) var(--hv2a1,74%));pointer-events:none}
  #homeLeagueCard .hv2bd{position:absolute;left:2px;top:-22px;height:80px;width:auto;max-width:56%;filter:drop-shadow(0 4px 4px rgba(0,0,0,.55));object-fit:contain;object-position:0 50%;pointer-events:none}
  #homeLeagueCard .hv2c{position:static;flex:none;margin-right:-2px;font-size:13px!important;padding:1px 7px 1px 3px!important;background:rgba(0,0,0,.5);border-radius:12px;padding:2px 9px 2px 4px;font:400 15px 'Lilita One',sans-serif;color:#fff;display:flex;align-items:center;gap:3px;text-shadow:0 2px 0 rgba(0,0,0,.5)}
  #homeLeagueCard .hv2c i{width:20px;height:20px}
  #homeLeagueCard .hv2p{position:absolute;left:12px;right:26%;bottom:5px;display:flex;align-items:center;gap:7px;font:400 12px 'Lilita One',sans-serif;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.6);white-space:nowrap}
  #homeLeagueCard .hv2p i.hIco{width:16px;height:16px;flex:none}
  #homeLeagueCard .hv2bar{flex:1;height:10px;border-radius:6px;background:rgba(0,0,0,.55);overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.6)}
  #homeLeagueCard .hv2bar b{display:block;height:100%;border-radius:6px;background:linear-gradient(#ffe27a,#f5a11a);box-shadow:inset 0 2px 0 rgba(255,255,255,.5);transition:width .6s}
  #homeLeagueCard .hv2n{color:#ffd24a}
  #homeLeagueCard{overflow:visible!important}#homeLeagueCard .hv2nc{position:absolute;left:var(--hv2cx,76%);top:calc(var(--hv2cb,52px) - var(--hv2ch,74px));width:var(--hv2cw,74px);height:var(--hv2ch,74px);transform:translateX(-50%);object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 4px 4px rgba(0,0,0,.55));pointer-events:none}
  #homeLeagueCard .hv2g:empty{display:none}
  `;
  document.head.appendChild(css);
  const $ = id => document.getElementById(id), ov = $('overlay');
  if (!ov || !$('homeTop')) return;
  // trophies pill, first in the top bar
  const coin = $('homeCoinPill');
  if (coin && !$('homeTroPill')) {
    const t = document.createElement('button'); t.id = 'homeTroPill'; t.className = 'hPill menuCurrencyPill';
    t.innerHTML = '<i class="hIco hi-trophy"></i><span class="hNum" id="homeTroCount">0</span>';
    t.addEventListener('click', () => { try { hapticTap(); } catch (e) {} $('homeLeagueCard').click(); });
    coin.parentNode.insertBefore(t, coin);
  }
  // side rails
  const btn = (cls, art, label, extra) => `<button class="hv2b ${cls}"><span class="ic" style="background:${art}">${extra || ''}</span>${label}</button>`;
  const L = document.createElement('div'); L.className = 'hv2rail l'; L.id = 'hv2L';
  L.innerHTML = btn('gift', `url(assets/ui/daily_gift.webp) center/84% no-repeat,linear-gradient(#ffcf4a,#f08a1a)`, 'DAILY', '<span class="tg g">FREE</span>')
    + btn('inbox', `url(assets/ui/icon_inbox.webp) center/70% no-repeat,linear-gradient(#3f6ac8,#22408a)`, 'INBOX', '<span class="dt" hidden></span>')
    + btn('kit', `url(assets/ui/home_edit_kit.webp) center/80% no-repeat,radial-gradient(circle at 50% 35%,#3a63ad,#13284f 70%)`, 'MY KIT');
  const R = document.createElement('div'); R.className = 'hv2rail r'; R.id = 'hv2R';
  R.innerHTML = btn('ev" data-hv2ev="cup', 'url(assets/ui/ev_cup.webp) center/cover no-repeat', 'CUP', '<span class="tg"></span>') + btn('ev" data-hv2ev="duel', 'url(assets/ui/ev_duels.webp) center/cover no-repeat', 'DUELS', '<span class="tg"></span>') + btn('ev" data-hv2ev="tourney', 'url(assets/ui/ev_weekly.webp) center/cover no-repeat', 'WEEKLY', '<span class="tg"></span>');
  ov.appendChild(L); ov.appendChild(R);
  L.querySelector('.gift').addEventListener('click', () => {
    try { hapticTap(); } catch (e) {}
    // Nov 27 (Joe): the tile is DAILY: it still hands over today's gift, then opens Today (daily reward + missions)
    try { if (giftReady()) { const l = claimGift(); if (l) showMessage('+ ' + l, '#FFC93A', 2000); } } catch (e) {}
    try { openToday(); } catch (e) {}
    refresh();
  });
  L.querySelector('.inbox').addEventListener('click', () => { try { $('inboxBtn').click(); } catch (e) {} });
  L.querySelector('.kit').addEventListener('click', () => { try { $('homePlayer').click(); } catch (e) {} });
  R.querySelectorAll('.ev').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.hv2ev; try { $('eventsNavBtn').click(); } catch (e) {}
    setTimeout(() => { try {
      let t = k === 'cup' ? [...document.querySelectorAll('h2,h3,b,strong,div,span')].find(e => e.children.length < 3 && /FLICKY CUP/.test(e.textContent) && e.getBoundingClientRect().width > 0) : document.querySelector(`button[data-mode="${k}"]`);
      if (!t) return; const card = t.closest('.evCard,.gcCard,section,article') || t.parentElement || t;
      card.scrollIntoView({ block: 'center', behavior: 'smooth' }); card.classList.add('hv2flash'); setTimeout(() => card.classList.remove('hv2flash'), 1600);
    } catch (e) {} }, 350);
  }));
  // league panel
  const card = $('homeLeagueCard');
  if (card && !card.querySelector('.hv2s')) {
    card.insertAdjacentHTML('beforeend', '<span class="hv2s"></span><img class="hv2bd" alt=""><span class="hv2p"><i class="hIco hi-trophy"></i><span class="hv2t"></span><span class="hv2bar"><b></b></span><span class="hv2g"></span><span class="hv2c"><i class="hIco hi-coin"></i><span class="hv2e">75</span></span></span><img class="hv2nc" alt="">');
  }
  function refresh() {
    try {
      const n = selectedLeagueIdx(), troph = (typeof trophyState !== 'undefined' ? trophyState.count : 0) || 0;
      const tc = $('homeTroCount'); if (tc) tc.textContent = troph.toLocaleString('en-GB');
      if (card) {
        card.style.setProperty('--hv2art', `url(assets/ui/leagues/lg_${n}_tall.webp)`);
        { const PL = {"1":[233,399],"2":[246,408],"3":[202,426],"4":[171,432],"5":[232,400],"6":[205,399],"7":[175,414],"8":[197,429],"9":[192,415],"10":[280,399],"11":[222,444],"12":[233,405],"13":[211,440],"14":[234,405],"15":[219,399],"16":[287,399],"17":[231,404],"18":[204,417],"19":[195,398],"20":[213,399],"21":[209,415],"22":[229,394],"23":[207,399],"24":[218,411],"25":[203,416],"26":[226,408],"27":[195,402]}, d = PL[n] || [225, 405], W = card.clientWidth || 363, cw = 84, k = cw / d[0], cx = W * 0.81, cb = 61;
          card.style.setProperty('--hv2w', (768 * k).toFixed(1) + 'px');
          card.style.setProperty('--hv2x', (cx - 384 * k).toFixed(1) + 'px');
          card.style.setProperty('--hv2y', (cb - d[1] * k).toFixed(1) + 'px');
          card.style.setProperty('--hv2cx', cx.toFixed(1) + 'px'); card.style.setProperty('--hv2cb', cb + 'px');
          card.style.setProperty('--hv2cw', cw + 'px'); { const a0 = Math.max(0, cx - 384 * k) / W * 100; card.style.setProperty('--hv2a0', (a0 + 0.5).toFixed(1) + '%'); card.style.setProperty('--hv2a1', Math.min(86, a0 + 11).toFixed(1) + '%'); } card.style.setProperty('--hv2ch', (cw * 1.03).toFixed(1) + 'px'); }
        const bd = card.querySelector('.hv2bd'), src = `assets/ui/badges/lb${n}.webp`; if (bd.getAttribute('src') !== src) bd.src = src;
        card.querySelector('.hv2e').textContent = ($('homeLeagueEntry') || {}).textContent || '';
        const m = (($('homeRoadTxt') || {}).textContent || '').match(/([\d,]+)\s*\/\s*([\d,]+)/);
        const nx = (typeof THEMED_LEAGUES !== 'undefined') && THEMED_LEAGUES[n + 1];
        const nc = card.querySelector('.hv2nc');
        if (m && nx) {
          const a = +m[1].replace(/,/g, ''), z = +m[2].replace(/,/g, '');
          card.querySelector('.hv2t').textContent = a.toLocaleString('en-GB') + '/' + z.toLocaleString('en-GB');
          card.querySelector('.hv2bar b').style.width = Math.max(4, Math.min(100, a / z * 100)) + '%';
          card.querySelector('.hv2g').innerHTML = '';
          nc.src = `assets/ui/leagues/lg_${n}_cup.webp`; nc.hidden = false;
        } else {
          card.querySelector('.hv2t').textContent = troph.toLocaleString('en-GB');
          card.querySelector('.hv2bar b').style.width = '100%'; card.querySelector('.hv2g').innerHTML = ''; nc.src = `assets/ui/leagues/lg_${n}_cup.webp`; nc.hidden = false;
        }
      }
      const g = L.querySelector('.gift'), ready = (typeof giftReady === 'function' && giftReady()) || (typeof calendarReady === 'function' && calendarReady());
      g.classList.toggle('off', !ready); g.querySelector('.tg').hidden = !ready;
      const ib = $('inboxBadge'), dt = L.querySelector('.inbox .dt');
      const cnt = ib && getComputedStyle(ib).display !== 'none' ? ib.textContent.trim() : '';
      dt.textContent = cnt; dt.hidden = !cnt;
      try { const tg = R.querySelector('[data-hv2ev=cup] .tg'), open = typeof cupOpenNow === 'function' && cupOpenNow();
        if (open) { tg.textContent = 'OPEN'; tg.className = 'tg g'; } else { const ms = cupOpensIn(); tg.textContent = ms >= 864e5 ? Math.ceil(ms / 864e5) + 'd' : fmtLeft(ms).replace(/ \d+m$/, ''); tg.className = 'tg'; } } catch (e) {}
      try { const tg = R.querySelector('[data-hv2ev=duel] .tg'), f = duelFreeLeft() > 0; tg.textContent = f ? 'FREE' : ''; tg.className = 'tg g'; tg.hidden = !f; } catch (e) {}
      try { const tg = R.querySelector('[data-hv2ev=tourney] .tg'), dl = passDaysLeftWeek(); tg.textContent = dl + 'd'; tg.className = 'tg'; } catch (e) {}
      const hidden = ov.classList.contains('hidden'); L.style.display = R.style.display = hidden ? 'none' : '';
    } catch (e) {}
  }
  const _u = window.updateMenuHUD;
  if (typeof _u === 'function') window.updateMenuHUD = function () { const r = _u.apply(this, arguments); refresh(); return r; };
  new MutationObserver(refresh).observe(ov, { attributes: true, attributeFilter: ['class'] });
  ['homeRoadTxt', 'homeLeagueName', 'inboxBadge'].forEach(id => { const e = $(id); if (e) new MutationObserver(refresh).observe(e, { childList: true, characterData: true, subtree: true, attributes: true }); });
  setInterval(refresh, 4000); refresh();
})();


/* ===== 2.2 duel tables: painted league scenes, cup on plinth, league badge, rim + shadow ===== */
(function duelV22() {
  const PL = {"1":[233,399],"2":[246,408],"3":[202,426],"4":[171,432],"5":[232,400],"6":[205,399],"7":[175,414],"8":[197,429],"9":[192,415],"10":[280,399],"11":[222,444],"12":[233,405],"13":[211,440],"14":[234,405],"15":[219,399],"16":[287,399],"17":[231,404],"18":[204,417],"19":[195,398],"20":[213,399],"21":[209,415],"22":[229,394],"23":[207,399],"24":[218,411],"25":[203,416],"26":[226,408],"27":[195,402]};
  const css = document.createElement('style');
  css.textContent = `
  #duelRes .drScore em{font-size:0!important;flex:none}
  #duelRes .drScore em::after{content:'VS';font-size:30px;line-height:1;color:#ffd24a;text-shadow:0 3px 0 #7a3a00,0 0 8px rgba(0,0,0,.5);-webkit-text-stroke:1px #7a3a00}
  #duelRes .drChat{gap:8px!important}
  #duelRes .drChat button{font-size:14px!important;padding:8px 14px!important;min-height:38px;border-radius:14px!important}
  #duelTables .dtTop{padding-bottom:2px}
  #duelTables .dtTop>b{font-size:22px}
  #duelTables .dtSub{font-size:12.5px;line-height:1.35;padding:2px 16px 0 66px;margin-top:-4px}
  #duelTables .dtCard{border:0!important;border-radius:22px!important;overflow:hidden;background:linear-gradient(#14234a,#0a1430)!important;box-shadow:0 0 0 2.5px color-mix(in srgb,var(--a) 55%,#fff6d8),0 0 0 4px rgba(0,0,0,.45),0 22px 24px rgba(4,10,24,.6),0 8px 8px rgba(0,0,0,.3)!important}
  #duelTables .dtCard.cur{box-shadow:0 0 0 3px #ffd24a,0 0 0 4.5px rgba(0,0,0,.45),0 24px 26px rgba(4,10,24,.65),0 8px 8px rgba(0,0,0,.3)!important}
  #duelTables .dtHero{background:#0b1226 var(--dart) var(--dx,0) var(--dy,0)/var(--dw,100%) auto no-repeat!important;border-bottom:0!important;overflow:hidden}
  #duelTables .dtHero::after{background:linear-gradient(rgba(8,14,32,0) 55%,rgba(8,14,32,.9))!important}
  #duelTables .dtCrest{display:none}
  #duelTables .dtCup{position:absolute;z-index:1;left:50%;transform:translateX(-50%);object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 6px 6px rgba(0,0,0,.5))}
  #duelTables .dtBadge{position:absolute;z-index:2;left:50%;bottom:-2px;transform:translateX(-50%);width:72%;filter:drop-shadow(0 4px 4px rgba(0,0,0,.55))}
  #duelTables .dtName{padding-top:4px}#duelTables .dtName b{display:none}
  #duelTables .dtName small{font-size:12px;color:#c9d6f2}
  #duelTables .dtCard.locked .dtHero{filter:grayscale(.7) brightness(.55)}
  #duelTables .dtLock{z-index:3}
  `;
  document.head.appendChild(css);
  const decorate = () => {
    const el = document.getElementById('duelTables'); if (!el) return;
    const sub = el.querySelector('.dtSub'); if (sub && !sub.dataset.v22) { sub.dataset.v22 = 1; sub.innerHTML = sub.innerHTML.replace(/\s*Bigger tables, bigger pots\s*(·\s*)?/, ' ').replace(/·\s*$/, ''); }
    el.querySelectorAll('.dtCard').forEach(c => {
      const li = +c.dataset.dtli, h = c.querySelector('.dtHero'); if (!h || h.querySelector('.dtCup')) return;
      const d = PL[li] || [225, 405], W = h.clientWidth || 300, H = h.clientHeight || 230, cupW = W * 0.4, k = cupW / d[0], cb = H * 0.62;
      h.style.setProperty('--dart', `url(assets/ui/leagues/lg_${li}_tall.webp)`);
      h.style.setProperty('--dw', (768 * k).toFixed(1) + 'px'); h.style.setProperty('--dx', (W / 2 - 384 * k).toFixed(1) + 'px'); h.style.setProperty('--dy', (cb - d[1] * k).toFixed(1) + 'px');
      h.insertAdjacentHTML('beforeend', `<img class="dtCup" alt="" src="assets/ui/leagues/lg_${li}_cup.webp" style="width:${cupW.toFixed(0)}px;height:${(cupW * 1.03).toFixed(0)}px;top:${(cb - cupW * 1.03).toFixed(0)}px"><img class="dtBadge" alt="" src="assets/ui/badges/lb${li}.webp">`);
    });
  };
  const _o = window.openDuelTables;
  if (typeof _o === 'function') window.openDuelTables = function () { const r = _o.apply(this, arguments); requestAnimationFrame(decorate); return r; };
})();

/* ===== 2.2 cup results use the duel result card (with cup titles), not the plain end screen ===== */
(function cupResultV22() {
  if (typeof window.cupAfterDuel !== 'function' || typeof window.showDuelResult !== 'function') return;
  const _c = window.cupAfterDuel;
  window.cupAfterDuel = function (c, res, line) {
    const c0 = career.coins, run = cupState().run, li = run ? run.li : (c.leagueIdx || 1);
    const r = _c.apply(this, arguments);
    try {
      const got = Math.max(0, career.coins - c0), champ = run && run.champ;
      r.ui = { res: r.res, me: (typeof runs !== 'undefined' ? runs : 0), them: c.rv, myWk: Math.min(c.wkLost, c.wickets), rvWk: c.rvWk, sd: !!c.sd,
        rv: c.rival, coins: got, bag: '', troph: 0, tg: 0, li, streak: 0, cup: true, champ, title: r.title, extra: r.extra, again: r.again };
      window._duelUi = r.ui;
    } catch (e) {}
    return r;
  };
  const _s = window.showDuelResult;
  window.showDuelResult = function (u) {
    _s.apply(this, arguments);
    if (!u || !u.cup) return;
    const el = document.getElementById('duelRes'); if (!el) return;
    const t = el.querySelector('.drTitle'); if (t) { t.textContent = u.title || t.textContent; t.classList.add('cupT'); }
    el.querySelectorAll('.drTile.tro,.drTile.neg').forEach(x => x.remove());
    const rew = el.querySelector('.drRew'), C = GAME_CONFIG.season.cup;
    if (rew && !rew.children.length) {
      const run = cupState().run, done = run ? run.path.filter(p => p.res === 'win').length : 0, total = C.rounds.length;
      rew.innerHTML = `<div class="drPath">${C.rounds.map((n, i) => `<span class="${i < done ? 'w' : i === done && u.res === 'win' && !u.champ ? 'n' : u.res !== 'win' && i === done ? 'x' : ''}"><i></i>${String(n).replace('ROUND OF ', 'LAST ').replace('QUARTER-FINAL', 'QF').replace('SEMI-FINAL', 'SF')}</span>`).join('')}</div>`;
    }
    if (u.extra) { const s = el.querySelector('.drSub'); if (s) s.insertAdjacentHTML('afterend', `<div class="drNote cupX">${u.extra}</div>`); }
    if (u.res !== 'win') el.querySelectorAll('.drNote').forEach(n => { if (/fresh balls/.test(n.textContent)) n.textContent = 'A new cup draw is ready whenever you are'; });
  };
  const css = document.createElement('style');
  css.textContent = `
  #duelRes .drTitle.cupT{font-size:clamp(26px,8vw,40px);line-height:1.05}
  #duelRes .drNote.cupX{color:#ffd24a;font-size:14px;margin:2px 0 4px}
  #duelRes .drPath{display:flex;gap:4px;justify-content:center;flex-wrap:nowrap;width:100%}
  #duelRes .drPath span{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;color:#9fb0d6;min-width:46px}
  #duelRes .drPath i{width:26px;height:26px;border-radius:50%;border:2.5px solid #3a4f86;background:#132247}
  #duelRes .drPath span.w{color:#7CF29A}#duelRes .drPath span.w i{background:#2bb24c;border-color:#bff5c8}
  #duelRes .drPath span.n{color:#ffd24a}#duelRes .drPath span.n i{background:#ffd24a;border-color:#fff3c4;box-shadow:0 0 10px rgba(255,210,74,.7)}
  #duelRes .drPath span.x{color:#ff8a7a}#duelRes .drPath span.x i{background:#c42a2a;border-color:#ffc2b8}
  `;
  document.head.appendChild(css);
})();

/* ===== 2.2 Flicky Cup gets its own versus + result look (purple and gold), so it never reads as a normal duel ===== */
(function cupLookV22() {
  const css = document.createElement('style');
  css.textContent = `
  #duelVs.cupVs .vsHead{background:linear-gradient(#7b3fe4,#4a1ea8)!important;border:3px solid #ffd24a!important;color:#fff!important;font-size:17px!important;padding:8px 20px!important;box-shadow:0 4px 0 rgba(0,0,0,.4)}
  #duelVs.cupVs .vsSide.me b,#duelVs.cupVs .vsSide.them b{background:linear-gradient(#8a4cf0,#4a1ea8)!important}
  #duelVs.cupVs .vsSide.me b{border-color:#ffd24a!important}
  #duelVs.cupVs .vsSide.them b{border-color:#c9b6ff!important}
  #duelVs.cupVs .vsMid img{display:none!important}
  #duelVs.cupVs{grid-template-rows:auto 1fr auto auto!important;padding-top:calc(max(var(--hdrTop,6px), 50px) + 20px)!important}
  #duelVs.cupVs .vsSide,#duelVs.cupVs .vsMid{align-self:end;margin-bottom:2vh}
  #duelVs.cupVs .vsSide canvas{max-width:200px!important}
  #duelVs.cupVs .vsSide.me{transform:translateX(16px)}#duelVs.cupVs .vsSide.them{transform:translateX(-16px)}
  #duelVs.cupVs .vsMid{align-self:end!important;margin:0 0 calc(2vh + 96px)!important}
  #duelVs.cupVs .vsSide.them b{background:linear-gradient(#5b5577,#2c2846)!important;border-color:#d8d4ea!important}
  #duelVs.cupVs .vsMid span{font-size:64px}
  #duelVs .cupStake{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:8px;margin:6px 0 16px;animation:vsDrop .5s .3s cubic-bezier(.3,1.5,.5,1) both}
  #duelVs .cupStake b{font-size:17px;letter-spacing:.06em;color:#ff8a7a;text-shadow:0 2px 0 #2a0c1a}
  #duelVs .cupStake .dots{display:flex;gap:6px;padding:7px 12px;border-radius:16px;background:rgba(20,6,50,.7);border:2px solid rgba(255,210,74,.5)}
  #duelVs .cupStake .dots span{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;color:#9fb0d6;min-width:44px}
  #duelVs .cupStake .dots i{width:22px;height:22px;border-radius:50%;border:2.5px solid #3a4f86;background:#132247}
  #duelVs .cupStake .dots span.w{color:#7CF29A}#duelVs .cupStake .dots span.w i{background:#2bb24c;border-color:#bff5c8}
  #duelVs .cupStake .dots span.n{color:#ffd24a}#duelVs .cupStake .dots span.n i{background:#ffd24a;border-color:#fff3c4;box-shadow:0 0 10px rgba(255,210,74,.7)}

  #duelVs.cupVs .vsFoot span{background:linear-gradient(#a56cff,#5a24c8)!important;color:#fff!important;box-shadow:0 6px 0 #2a0c6a!important;border-color:#ffd24a!important;text-shadow:0 2px 0 #2a0c6a}
  #duelVs.cupVs .vsFlash{background:radial-gradient(circle,rgba(255,210,74,.55),transparent 60%)!important}
  #duelRes.cupRes .drCard{border-color:#b48cff!important;box-shadow:0 0 0 3px #2a0c6a,0 0 30px rgba(140,90,255,.45)!important;background:linear-gradient(#3a1e7a,#1c0f44)!important}
  #duelRes.cupRes .drP.me{background:linear-gradient(#8a4cf0,#4a1ea8)!important}
  #duelRes.cupRes .drP.them{background:linear-gradient(#5b4a8a,#2c2050)!important}
  #duelRes.cupRes .drTitle::before{content:'';display:block;width:64px;height:64px;margin:-6px auto 2px;background:url(assets/ui/cup_trophy.webp) center/contain no-repeat;filter:drop-shadow(0 4px 4px rgba(0,0,0,.5))}
  `;
  document.head.appendChild(css);
  const _v = window.duelVersus;
  if (typeof _v === 'function') window.duelVersus = function (rival, extra) {
    const r = _v.apply(this, arguments);
    try { const el = document.getElementById('duelVs'); if (!el) return r;
      el.classList.toggle('cupVs', !!(extra && extra.cup));
      if (extra && extra.cup) {
        const li = window._activeLeagueIdx || 1, art = (typeof sceneArt === 'function') ? sceneArt('cup', li) : 'assets/ui/cup_bg.webp';
        el.style.backgroundImage = `linear-gradient(#1a0a40 0%,#1a0a40 calc(max(var(--hdrTop,6px),50px) + 96px),rgba(26,10,64,0) calc(max(var(--hdrTop,6px),50px) + 122px)),linear-gradient(rgba(20,6,50,0) 60%,rgba(20,6,50,.9) 88%),url(${art})`;
        el.style.backgroundSize = '100% 100%,100% 100%,100% auto'; el.style.backgroundPosition = '0 0,0 0,center calc(max(var(--hdrTop,6px),50px) + 96px)'; el.style.backgroundColor = '#1a0a40'; el.style.backgroundRepeat = 'no-repeat';
        if (!el.querySelector('.cupStake')) { const C = GAME_CONFIG.season.cup, run = cupState().run, rd = extra.cupRound || 0, fin = rd === C.rounds.length - 1;
          const dots = C.rounds.map((n, i) => `<span class="${i < rd ? 'w' : i === rd ? 'n' : ''}"><i></i>${String(n).replace('ROUND OF ', 'LAST ').replace('QUARTER-FINAL', 'QF').replace('SEMI-FINAL', 'SF')}</span>`).join('');
          const foot = el.querySelector('.vsFoot'); if (foot) foot.insertAdjacentHTML('beforebegin', `<div class="cupStake"><b>${fin ? 'WIN AND LIFT THE CUP' : 'LOSE AND YOU\'RE OUT'}</b><div class="dots">${dots}</div></div>`); } el.style.backgroundColor = '#1a0a40'; el.style.backgroundRepeat = 'no-repeat';
      } } catch (e) {}
    return r;
  };
  const _s = window.showDuelResult;
  if (typeof _s === 'function') window.showDuelResult = function (u) {
    const r = _s.apply(this, arguments);
    try { const el = document.getElementById('duelRes'); if (el) { el.classList.toggle('cupRes', !!(u && u.cup));
      if (u && u.cup) { const li = u.li || 1, art = (typeof sceneArt === 'function') ? sceneArt('cup', li) : 'assets/ui/cup_bg.webp';
        el.style.backgroundImage = `linear-gradient(rgba(30,10,70,.5),rgba(20,6,50,.92) 70%),url(${art})`; } } } catch (e) {}
    return r;
  };
})();


/* ===== 2.2 match result: painted league scene, league panel instead of trophy road, bigger bag, clearer loss coins, one hero button ===== */
(function resultV22() {
  const PL = {"1":[233,399],"2":[246,408],"3":[202,426],"4":[171,432],"5":[232,400],"6":[205,399],"7":[175,414],"8":[197,429],"9":[192,415],"10":[280,399],"11":[222,444],"12":[233,405],"13":[211,440],"14":[234,405],"15":[219,399],"16":[287,399],"17":[231,404],"18":[204,417],"19":[195,398],"20":[213,399],"21":[209,415],"22":[229,394],"23":[207,399],"24":[218,411],"25":[203,416],"26":[226,408],"27":[195,402]};
  const css = document.createElement('style');
  css.textContent = `
  #resultScreen.r2 #r2ArtCanvas{opacity:0}
  #resultScreen.r2 #r2Art{height:max(280px, calc(100dvh - 404px - env(safe-area-inset-bottom,0px)))!important}
  #resultScreen.r2 #r2Road.v22{margin-top:26px!important;margin-bottom:6px}
  #resultScreen.r2{background:linear-gradient(rgba(18,48,99,0) 0,rgba(18,48,99,0) 30%,rgba(18,48,99,.18) 36%,rgba(18,48,99,.5) 42%,rgba(18,48,99,.82) 48%,#123063 55%,#0a1d3d 74%,#01162C 100%),#123063 var(--r2art) center top/100% auto no-repeat!important}
  #resultScreen.r2 #r2Art{background:none!important}
  html body #resultScreen.r2 #r2Art::after{content:'';position:absolute;inset:0;background:linear-gradient(rgba(6,12,30,.35),rgba(6,12,30,0) 30%)!important;pointer-events:none;z-index:1}
  #resultScreen.r2 #r2Player{height:min(330px, calc(100dvh - 404px - env(safe-area-inset-bottom,0px) - max(var(--insT),6px) - 78px))!important;left:12px!important;bottom:14px!important}
  #resultScreen.r2 #r2HeroR{width:58%!important;z-index:3}
  #resultScreen.r2 .r2Rew img#r2BagImg{width:58px!important;height:52px!important;margin-top:-6px;filter:drop-shadow(0 3px 3px rgba(0,0,0,.5))}
  #r2Road.v22{position:relative;height:86px;margin-top:22px;border-radius:18px!important;border:2.5px solid #ffd98a!important;box-shadow:0 0 0 1.5px rgba(0,0,0,.5),0 8px 14px rgba(0,0,0,.45)!important;background:#0b1226 var(--rart) var(--rx,0) var(--ry,0)/var(--rw,260px) auto no-repeat!important;padding:0!important;overflow:visible}
  #r2Road.v22::before{content:'';position:absolute;inset:0;border-radius:15.5px;background:linear-gradient(90deg,rgb(8,14,32) 0%,rgb(8,14,32) var(--ra0,50%),rgba(8,14,32,0) var(--ra1,70%));pointer-events:none}
  #r2Road.v22 #r2RoadHead{display:none}
  #r2Road.v22 .rbd{position:absolute;left:2px;top:-20px;height:74px;max-width:56%;object-fit:contain;object-position:0 50%;filter:drop-shadow(0 4px 4px rgba(0,0,0,.55));z-index:2}
  #r2Road.v22 .rcup{position:absolute;transform:translateX(-50%);object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 4px 4px rgba(0,0,0,.55));z-index:2}
  #r2Road.v22 .rrow{position:absolute;left:12px;right:24%;bottom:7px;display:flex;align-items:center;gap:7px;z-index:2;font:400 12px 'Lilita One',sans-serif;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.6);white-space:nowrap}
  #r2Road.v22 .rrow i.hIco{width:16px;height:16px;flex:none}
  #r2Road.v22 #r2RoadBar{flex:1;height:10px!important;border:0!important;border-radius:6px!important;background:rgba(0,0,0,.55)!important;box-shadow:inset 0 1px 2px rgba(0,0,0,.6)}
  #r2Road.v22 #r2RoadFill{border-radius:6px;box-shadow:inset 0 2px 0 rgba(255,255,255,.5)}
  #r2Road.v22 .rnx{color:#ffd24a}
  #resultScreen.r2 #r2Btns{display:grid!important;grid-template-columns:1fr 2.1fr 54px!important;gap:8px!important;align-items:center;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 10px)!important}
  html body #resultScreen.r2 #rs-menuBtn,html body.rsTight #resultScreen.r2 #rs-menuBtn{order:1;width:auto!important;height:58px!important;font-size:17px!important}
  html body #resultScreen.r2 .r2Rew{height:104px!important}
  html body #r2Wrap{gap:10px!important}
  #resultScreen.r2 #r2Road.v22{margin-top:22px!important}
  #resultScreen.r2 #rs-playAgainBtn{order:2;height:66px!important;width:auto!important}
  #resultScreen.r2 #r2Share{order:3;height:58px!important;width:54px!important}
  #resultScreen.r2 .rs-playLabel{font-size:24px!important}
  #resultScreen.r2 .rs-playCost{font-size:18px!important;opacity:1!important;margin-top:2px!important}
  #resultScreen.r2 .rs-playCost .hIco{width:21px!important;height:21px!important}
  #resultScreen.r2 .r2Rew .hIco{width:46px!important;height:46px!important}
  #resultScreen.r2 .r2Rew img#r2BagImg{width:70px!important;height:56px!important;margin-top:-6px}
  #resultScreen.r2 .r2Rew b{font-size:28px!important}
  #resultScreen.r2 .r2Rew small{font-size:11px!important}
  #resultScreen.r2 #r2HeroR{top:calc(max(var(--insT),6px) + 72px)!important;gap:6px!important}
  #resultScreen.r2 #r2HeroR #r2Ribbon{font-size:44px!important;padding:6px 18px!important}
  #resultScreen.r2 #r2Pills{top:calc(max(var(--insT),6px) + 12px)!important}
  #resultScreen.r2 #r2Team{top:calc(max(var(--insT),6px) + 13px)!important}
  #resultScreen.r2 #r2HeroR #r2Runs{font-size:88px!important}
  #resultScreen.r2 #r2HeroR #r2ScoreTop{margin-right:22px}
  #resultScreen.r2 #r2HeroR::before{content:'';position:absolute;z-index:-1;left:-14%;right:-8%;top:-6%;bottom:-8%;background:radial-gradient(closest-side,rgba(6,12,30,.62),rgba(6,12,30,.35) 60%,rgba(6,12,30,0));pointer-events:none}
  #resultScreen.r2 .r2cup{position:absolute;z-index:0;transform:translateX(-50%);object-fit:contain;object-position:50% 100%;filter:drop-shadow(0 6px 6px rgba(0,0,0,.5));pointer-events:none;animation:r2cupIn .6s cubic-bezier(.3,1.5,.5,1) .5s both}
  #resultScreen.r2.cupWin #r2HeroR{top:var(--hrTop)!important;width:62%!important;gap:3px!important}
  #resultScreen.r2.cupWin #r2HeroR #r2Ribbon{font-size:40px!important;padding:2px 10px!important}
  #resultScreen.r2.cupWin #r2HeroR #r2Runs{font-size:74px!important}
  #resultScreen.r2.cupWin #r2HeroR #r2Stars{transform:scale(.85);transform-origin:100% 0;margin:-4px 0 -8px}
  #resultScreen.r2 #r2Stars i.on{animation:r2starPop .5s cubic-bezier(.3,1.8,.5,1) both}
  #resultScreen.r2 #r2Stars i.on:nth-child(2){animation-delay:.15s}#resultScreen.r2 #r2Stars i.on:nth-child(3){animation-delay:.3s}
  @keyframes r2starPop{0%{transform:scale(0) rotate(-40deg)}100%{transform:scale(1) rotate(0)}}
  #resultScreen.r2 .r2best{display:inline-block;margin:0 0 2px;padding:3px 10px;border-radius:10px;background:linear-gradient(#ffe066,#f7a81b);color:#5a2a00;font-size:14px;letter-spacing:.04em;border:2px solid #fff3c4;box-shadow:0 3px 0 #a5560a;animation:r2starPop .5s .6s cubic-bezier(.3,1.8,.5,1) both}
  html body #resultScreen.r2 #r2Double{height:44px!important;font-size:15px!important;background:linear-gradient(#3fae5a,#27863f)!important;border-width:2px!important;box-shadow:0 3px 0 #155a26!important;opacity:.95}
  #resultScreen.r2 .r2trofly{position:fixed;z-index:20000;width:30px;height:30px;left:0;top:0;transition:transform .7s cubic-bezier(.4,0,.2,1),opacity .2s .65s;pointer-events:none}
  #r2Road.v22{transition:transform .12s}#r2Road.v22.bump{transform:scale(1.03)}
  #resultScreen.r2 #r2Extras .r2Badge.gold{display:none}
  #resultScreen.r2 #r2ScoreTop{position:relative}
  #resultScreen.r2 #r2ScoreTop .r2best{position:absolute;right:calc(100% + 6px);top:18px;white-space:nowrap}
  #resultScreen.r2.cupWin.tight #r2StatLine{display:none}
  @keyframes r2cupIn{0%{opacity:0;transform:translateX(-50%) translateY(-30px) scale(.7)}100%{opacity:1;transform:translateX(-50%)}}
  `;
  document.head.appendChild(css);
  const _s = window.showResultScreen;
  if (typeof _s !== 'function') return;
  window.showResultScreen = function (d) {
    const r = _s.apply(this, arguments);
    try {
      const $ = id => document.getElementById(id);
      const li = (d && d.activeLgIdx) || selectedLeagueIdx() || 1;
      const art = $('resultScreen'); if (art) art.style.setProperty('--r2art', `url(assets/ui/leagues/lg_${li}_tall.webp)`);
      // the cup sits on its plinth when you win; the plinth stays bare when you lose
      { const host = $('r2Art'), old = host && host.querySelector('.r2cup'); if (old) old.remove();
        if (host && d && d.beatTarget) { const W = document.getElementById('resultScreen').clientWidth || 393, k = W / 768, dd = PL[li] || [225, 405];
          const cw = dd[0] * k, im = document.createElement('img'); im.className = 'r2cup'; im.alt = ''; im.src = `assets/ui/leagues/lg_${li}_cup.webp`;
          Object.assign(im.style, { left: (W / 2) + 'px', width: cw + 'px', height: (cw * 1.03) + 'px', top: (dd[1] * k - cw * 1.03) + 'px' }); host.appendChild(im); }
        const rs = $('resultScreen'); rs.classList.toggle('cupWin', !!(d && d.beatTarget));
        if (d && d.beatTarget) { const dd = PL[li] || [225, 405], W = rs.clientWidth || 393, k = W / 768; rs.style.setProperty('--hrTop', (dd[1] * k + 2).toFixed(0) + 'px');
          requestAnimationFrame(() => { const rw = $('r2Rewards').getBoundingClientRect().top, need = dd[1] * k + 232; rs.classList.toggle("tight", rw < need + 34); }); } }
      // NEW BEST tag
      { const sc = $('r2ScoreTop'), old = document.querySelector('#resultScreen .r2best'); if (old) old.remove();
        if (d && d.isNewBest && sc) sc.insertAdjacentHTML('afterbegin', '<span class="r2best">NEW BEST!</span>'); }
      // trophies fly into the league panel
      if (d && d.trophyDelta > 0) setTimeout(() => { try {
        const a = $('r2Trophy'), b = document.querySelector('#r2Road.v22 .rrow .hIco'); if (!a || !b) return;
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(), n = Math.min(6, d.trophyDelta + 2);
        for (let i = 0; i < n; i++) { const f = document.createElement('i'); f.className = 'hIco hi-trophy r2trofly';
          f.style.transform = `translate(${ra.left + ra.width / 2 - 15 + (Math.random() * 30 - 15)}px,${ra.top + 20}px)`; $('resultScreen').appendChild(f);
          setTimeout(() => { f.style.transform = `translate(${rb.left - 7}px,${rb.top - 7}px) scale(.6)`; f.style.opacity = '0'; }, 40 + i * 80);
          setTimeout(() => { f.remove(); if (i === n - 1) { const r = $('r2Road'); r.classList.add('bump'); setTimeout(() => r.classList.remove('bump'), 260); try { playTone({ freq: 1100, duration: .08, volume: .08 }); } catch (e) {} } }, 800 + i * 80); }
      } catch (e) {} }, 2300);
      // loss coin label
      if (d && !d.beatTarget && d.entryPaid) { $('r2CoinsSub').textContent = d.coinsEarned ? `ENTRY · ${d.coinsEarned.toLocaleString()} BACK` : 'ENTRY'; }
      // league panel in place of the trophy road
      const road = $('r2Road');
      if (road) {
        road.classList.add('v22');
        const ci = currentLeagueIdx(), cur = THEMED_LEAGUES[ci], nx = THEMED_LEAGUES[ci + 1];
        if (!road.querySelector('.rrow')) {
          road.insertAdjacentHTML('afterbegin', '<img class="rbd" alt=""><img class="rcup" alt=""><div class="rrow"><i class="hIco hi-trophy"></i><span class="rt"></span></div>');
          road.querySelector('.rrow').appendChild($('r2RoadBar'));
          road.querySelector('.rrow').insertAdjacentHTML('beforeend', '<span class="rn"></span>');
        }
        road.querySelector('.rbd').src = `assets/ui/badges/lb${ci}.webp`;
        road.querySelector('.rt').textContent = nx ? `${trophyState.count.toLocaleString('en-GB')}/${nx.unlock.toLocaleString('en-GB')}` : trophyState.count.toLocaleString('en-GB');
        road.querySelector('.rn').innerHTML = nx ? `NEXT <span class="rnx">${String(nx.name).split(' ')[0]}</span>` : '<span class="rnx">TOP LEAGUE</span>';
        const W = road.clientWidth || 360, dd = PL[ci] || [225, 405], cw = 80, k = cw / dd[0], cx = W * 0.84, cb = 60;
        road.style.setProperty('--rart', `url(assets/ui/leagues/lg_${ci}_tall.webp)`);
        road.style.setProperty('--rw', (768 * k).toFixed(1) + 'px'); road.style.setProperty('--rx', (cx - 384 * k).toFixed(1) + 'px'); road.style.setProperty('--ry', (cb - dd[1] * k).toFixed(1) + 'px');
        const a0 = Math.max(0, cx - 384 * k) / W * 100; road.style.setProperty('--ra0', (a0 + .5).toFixed(1) + '%'); road.style.setProperty('--ra1', (a0 + 11).toFixed(1) + '%');
        const cup = road.querySelector('.rcup'); cup.src = `assets/ui/leagues/lg_${ci}_cup.webp`;
        Object.assign(cup.style, { left: cx + 'px', width: cw + 'px', height: (cw * 1.03) + 'px', top: (cb - cw * 1.03) + 'px' });
      }
    } catch (e) {}
    return r;
  };
})();

// ── MODES (Nov 27, Joe): the Events screen becomes MODES. A slim "Just play" row (Nets, Friends) sits above
// the "Compete" posters; "i HOW IT WORKS" loses the i; the nav button reads MODES (trophy icon stays).
(function modesV22() {
  if (window.__modesV22) return; window.__modesV22 = 1;
  const css = document.createElement('style'); css.textContent = `
  .jpLbl{font-family:'Lilita One',sans-serif;color:#9fb4dc;font-size:15px;letter-spacing:.08em;margin:4px 4px 8px;display:flex;align-items:center;gap:8px}
  .jpLbl:after{content:'';flex:1;height:2px;background:linear-gradient(90deg,rgba(159,180,220,.45),transparent)}
  .jpRow{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 12px}
  .jpT{position:relative;height:80px;border-radius:18px;border:3px solid #050A14;box-shadow:0 5px 0 rgba(0,0,0,.45);overflow:hidden;background:#101a33 center/cover no-repeat;display:flex;flex-direction:column;justify-content:flex-end;padding:0 40px 9px 12px;text-align:left;font-family:'Lilita One',sans-serif;cursor:pointer}
  .jpT:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,16,36,.92) 0,rgba(8,16,36,.7) 48%,rgba(8,16,36,.05) 100%)}
  .jpT:after{content:'';position:absolute;inset:0;border-radius:15px;box-shadow:0 0 0 2px var(--c) inset;pointer-events:none}
  .jpT:active{transform:translateY(2px)}
  .jpT b{position:relative;font-size:23px;line-height:1;font-weight:400;color:#fff;text-shadow:0 2px 0 #050A14}
  .jpT small{position:relative;font-size:11px;color:#c8d6f0;letter-spacing:.03em;margin-top:3px;white-space:nowrap}
  .jpT .go{position:absolute;right:8px;bottom:8px;width:30px;height:30px;border-radius:50%;background:var(--c);border:2px solid #050A14;box-shadow:0 2px 0 #050A14;display:grid;place-items:center}
  .jpT .go:before{content:'';width:8px;height:8px;border:solid #fff;border-width:3px 3px 0 0;transform:translateX(-2px) rotate(45deg)}
  .jpT .tag{position:absolute;top:7px;right:8px;background:var(--c);color:#fff;font-size:12px;padding:1px 8px;border-radius:9px;border:2px solid #050A14}`;
  document.head.appendChild(css);
  const label = () => { try { const nb = document.getElementById('eventsNavBtn'); if (!nb) return;
      const s = [...nb.querySelectorAll('*')].find(y => y.children.length === 0 && /EVENTS/.test(y.textContent)); if (s) s.textContent = 'MODES';
      else for (const n of nb.childNodes) if (n.nodeType === 3 && /EVENTS/.test(n.textContent)) n.textContent = n.textContent.replace('EVENTS', 'MODES'); } catch (e) {} };
  label(); setTimeout(label, 500); setTimeout(label, 2500);
  const _r = window.renderCompeteV2; if (typeof _r !== 'function') return;
  window.renderCompeteV2 = function () { const r = _r.apply(this, arguments);
    try { const pn = document.getElementById('competePanel'), sh = pn && pn.querySelector('.sh3'), car = sh && sh.querySelector('.evCarousel'); if (!car) return r;
      const tl = pn.querySelector('.evTop'); if (tl) { const t = [...tl.querySelectorAll('*')].find(x => x.children.length === 0 && /EVENTS/.test(x.textContent)); if (t) t.textContent = 'MODES'; }
      sh.querySelectorAll('.evHow').forEach(x => { x.textContent = x.textContent.replace(/^\s*i\s+/, ''); });
      if (!sh.querySelector('.jpRow')) { const w = document.createElement('div');
        w.innerHTML = `<div class="jpLbl">JUST PLAY</div><div class="jpRow">
          <button class="jpT" data-jp="nets" style="--c:#3b82f6;background-image:url(assets/ui/deck_ground.webp)"><span class="tag">FREE PLAY</span><b>NETS</b><small>PRACTICE · NO ENTRY</small><i class="go"></i></button>
          <button class="jpT" data-jp="friends" style="--c:#22a050;background-image:url(assets/ui/web/hero.webp)"><b>FRIENDS</b><small>CHALLENGE A MATE</small><i class="go"></i></button>
        </div><div class="jpLbl">COMPETE</div>`;
        car.parentNode.insertBefore(w, car); }
    } catch (e) {}
    label(); return r; };
  document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-jp]'); if (!b) return;
    e.stopImmediatePropagation(); e.preventDefault(); try { playUiTap(); hapticTap(); } catch (er) {}
    try { document.getElementById('competePanel').classList.remove('show'); } catch (er) {}
    if (b.dataset.jp === 'nets') { try { closeAllScreens(); } catch (er) {} try { playNets(); } catch (er) {} }
    else { try { Mates.render(); const m = document.getElementById('matesPanel'); if (m) m.classList.add('show'); } catch (er) {} } }, true);
})();
// Nov 27: the old home badges (Pass bar, Album, event badge, Missions) from the earlier layout appeared over the new side rails a few
// seconds after the home opened. The new home doesn't use them; the Pass lives on MODES.
(function () { const s = document.createElement('style');
  s.textContent = '#overlay #v2pass,#overlay #v2alB,#overlay #v2evB,#overlay #todayBtn{display:none!important}';
  document.head.appendChild(s); })();
// Nov 27: coin pill clipped "5,000" to "5,00" — give coins more room than the trophy pill
(function () { const s = document.createElement('style');
  s.textContent = '#homeTop #homeCoinPill{flex:1.35 1 0!important}#homeTop #homeTroPill{flex:.8 1 0!important}';
  document.head.appendChild(s); })();

// Nov 27 (Joe): the sticker album lives on the Bags screen (stickers come from bags) — a pill left of the free-bags timer
(function () {
  const css = document.createElement('style'); css.textContent = `
  .albPill{position:absolute;left:10px;z-index:3;height:38px;box-sizing:border-box;display:flex;align-items:center;gap:5px;padding:0 10px 0 6px;border-radius:19px;border:2px solid #2a1606;background:linear-gradient(#fdf4dc,#e8d09b);box-shadow:0 3px 0 rgba(42,22,6,.55);color:#4a2a0c;font:14px/1 'Lilita One',sans-serif;cursor:pointer}
  .albPill b{font-weight:400;color:#b3261e}
  #chestSlotsGrid ~ .oddsBtn, .bagFreeBar ~ .oddsBtn, .oddsBtn{box-sizing:border-box}
  .bagFreeBar{margin-top:8px!important;box-shadow:0 3px 0 rgba(42,22,6,.55)!important;white-space:nowrap!important;height:38px!important;box-sizing:border-box!important;padding-left:5px!important;padding-right:10px!important;gap:4px!important;font-size:14px!important}
  .bagFreeBar .bIcon{width:26px!important;height:26px!important}
  .albPill i{position:relative;margin-right:2px;width:26px!important;height:26px!important;background:none!important;border:0!important;box-shadow:none!important}
  .albPill i:before,.albPill i:after{content:'';position:absolute;top:2px;width:14px;height:20px;border-radius:3px;border:2px solid #fff;outline:1.5px solid #2a1606;background:center/cover}
  .albPill i:before{left:0;transform:rotate(-12deg);background-image:url(assets/ui/leagues/lg_2_bg.webp)}
  .albPill i:after{left:8px;transform:rotate(10deg);background-image:url(assets/ui/leagues/lg_1_bg.webp)}
  .albPill i{width:22px;height:26px;border-radius:4px;border:2px solid #050A14;background:linear-gradient(90deg,#c0392b 0 22%,#FFC93A 22% 30%,#e9573f 30%);box-shadow:inset -2px 0 0 rgba(0,0,0,.2)}
  .albPill .n{position:absolute;top:-8px;right:-6px;min-width:18px;height:18px;border-radius:9px;background:#e0352b;border:2px solid #050A14;font-size:11px;display:grid;place-items:center;padding:0 3px}`;
  document.head.appendChild(css);
  const _rf = window.renderFreeBar; if (typeof _rf !== 'function') return;
  window.renderFreeBar = function (el) { const r = _rf.apply(this, arguments);
    try { if (!el || !el.parentElement) return r;
      const mp = (typeof career !== 'undefined' && career.matchesPlayed) || 0; let b = el.parentElement.querySelector(':scope > .albPill');
      if (mp < 10 || typeof window.openFlickyAlbum !== 'function') { if (b) b.remove(); el.style.transform = ''; return r; }
      if (!b) { b = document.createElement('button'); b.className = 'albPill'; b.addEventListener('click', e => { e.stopPropagation(); try { playUiTap(); } catch (er) {} window.openFlickyAlbum(); }); el.parentElement.insertBefore(b, el.nextSibling);
        if (getComputedStyle(el.parentElement).position === 'static') el.parentElement.style.position = 'relative'; }
      const a = SAVE.section('album'), have = a.have || {}, li = Math.max(1, selectedLeagueIdx()), pg = window.v2AlbumPage ? window.v2AlbumPage(li) : [], got = pg.filter(x => have[x.id]).length, nw = a.fresh || 0;
      b.innerHTML = `<i></i>ALBUM <b>${got}/${pg.length}</b>${nw ? `<span class="n">${nw}</span>` : ''}`;
      b.style.top = (el.offsetTop + (el.offsetHeight - 38) / 2) + 'px';
      // one row, equal 8px gaps: [ALBUM] [free bags timer] [i]
      requestAnimationFrame(() => { try { el.style.transform = ''; const pr = el.parentElement.getBoundingClientRect(), ar = b.getBoundingClientRect(), er = el.getBoundingClientRect();
        const ob = el.parentElement.querySelector('.oddsBtn'); if (ob) { ob.style.width = ob.style.height = '38px'; ob.style.boxShadow = '0 3px 0 rgba(42,22,6,.55)'; ob.style.top = (el.offsetTop) + 'px'; }
        const ir = ob ? ob.getBoundingClientRect() : { left: pr.right - 12 }; const room = ir.left - 8 - (ar.right + 8);
        
        const sp = el.querySelector('span'); if (sp && /Free bags in /.test(sp.innerHTML)) sp.innerHTML = sp.innerHTML.replace('Free bags in ', 'Free bags ');
        const er2 = el.getBoundingClientRect(), gap = (ir.left - ar.right - er2.width) / 2; el.style.transform = `translateX(${Math.round(ar.right + gap - er2.left)}px)`; } catch (e) {} });
    } catch (e) {}
    return r; };
})();

// ── ONE OVER (Nov 27, Joe): a weekend event like Golf Clash's Golden Shot. One over (6 balls, 1 wicket) at your ground.
// Your runs pick ONE bag from the ladder; each bag can only be won once a weekend. First go each weekend is free; more goes
// are real money (£0.99 one / £4.99 six — placeholders). Home tile sits bottom left beside PLAY on Fri–Sun.
(function oneOver() {
  if (window.__oneOver) return; window.__oneOver = 1;
  const TIERS = [{ t: 30, bag: 'platinum', c: '#8A5CF6' }, { t: 25, bag: 'gold', c: '#e0a01a' }, { t: 20, bag: 'silver', c: '#7d8aa3' }, { t: 15, bag: 'bronze', c: '#b0652a' }, { t: 10, bag: 'wooden', c: '#7a5233' }];
  const DAYS = [5, 6, 0], MIN_MATCHES = 3;
  const $ = id => document.getElementById(id);
  const tapS = () => { try { playUiTap(); hapticTap(); } catch (e) {} };
  const now = () => (typeof _nowDate === 'function' ? _nowDate() : new Date());
  const wkKey = () => { const d = now(), back = (d.getDay() + 2) % 7, f = new Date(d.getFullYear(), d.getMonth(), d.getDate() - back); return `${f.getFullYear()}-${f.getMonth() + 1}-${f.getDate()}`; };
  const st = () => { const o = SAVE.section('oneover'); if (o.wk !== wkKey()) { o.wk = wkKey(); o.free = 1; o.won = {}; o.best = 0; } o.paid = o.paid || 0; o.won = o.won || {}; return o; };
  const save = () => { try { SAVE.save(); } catch (e) {} };
  const mp = () => (typeof career !== 'undefined' && career.matchesPlayed) || 0;
  const isOn = () => (window.OO_ALWAYS || DAYS.includes(now().getDay())) && mp() >= MIN_MATCHES && !(typeof TEASER !== 'undefined' && TEASER);
  const left = () => { const d = now(), add = (8 - d.getDay()) % 7 || 7, m = new Date(d.getFullYear(), d.getMonth(), d.getDate() + (d.getDay() === 1 ? 7 : add)); return Math.max(0, m - d); };
  const fmtL = ms => { const h = Math.floor(ms / 36e5), dd = Math.floor(h / 24); return dd ? `${dd}D ${h % 24}H` : `${h}H ${Math.floor(ms / 6e4) % 60}M`; };
  const img = b => (typeof CHEST_IMG_SRC !== 'undefined' && CHEST_IMG_SRC[b]) || '';
  const nm = b => (typeof bagNm === 'function' ? bagNm(b) : b.toUpperCase());
  const allWon = o => TIERS.every(x => o.won[x.bag]);
  const price = (id, g) => (typeof storePrice === 'function' ? storePrice(id, g) : '£' + g);

  const css = document.createElement('style'); css.textContent = `
  #ooTile{position:fixed;left:12px;z-index:40;width:96px;border-radius:18px;border:3px solid #050A14;background:radial-gradient(circle at 50% 30%,#2b5fb8,#0f2550 70%);box-shadow:0 0 0 2px #FFC93A inset,0 5px 0 #050A14;display:none;flex-direction:column;align-items:center;justify-content:flex-end;padding:0 0 6px;box-sizing:border-box;font-family:'Lilita One',sans-serif;color:#fff;cursor:pointer}
  body.ooOn #ooTile{display:flex}
  #ooTile .ball{position:absolute;top:-24px;left:-12px;width:34px;filter:drop-shadow(0 3px 0 #050A14)}
  #ooTile b{font-weight:400;font-size:19px;line-height:.92;color:#FFC93A;text-shadow:0 2px 0 #050A14;text-align:center}
  #ooTile .rb{margin-top:4px;background:linear-gradient(#45c24a,#23912a);border:2px solid #050A14;border-radius:8px;font-size:12px;padding:1px 7px;white-space:nowrap}
  #ooTile .rb.gold{background:linear-gradient(#ffd34d,#f0a21a)}#ooTile .rb.dim{background:#46556f}
  #ooTile .tm{position:absolute;top:-10px;right:-8px;background:#e0352b;border:2px solid #050A14;border-radius:9px;font-size:11px;padding:1px 6px;white-space:nowrap}
  #ooScr,#ooRes{position:fixed;inset:0;z-index:400;display:none;font-family:'Lilita One',sans-serif;color:#fff;overflow:hidden;background:#0a1b3c}
  #ooScr.show,#ooRes.show{display:block}
  .ooBg{position:absolute;inset:-10px;background:url(assets/ui/home_bg_v5.webp) center/cover;filter:blur(3px) brightness(.5)}
  .ooLogo{position:absolute;left:0;right:0;text-align:center;font-size:46px;line-height:.9;background:linear-gradient(#fff3a8,#FFC93A 45%,#e88a10);-webkit-background-clip:background;-webkit-background-clip:text;color:transparent;filter:drop-shadow(0 3px 0 #5a2a00) drop-shadow(0 0 2px #5a2a00) drop-shadow(0 6px 6px rgba(0,0,0,.5))}
  .ooHdr{position:absolute;left:22px;right:22px;border-radius:20px;border:3px solid #050A14;background:linear-gradient(#1c3a78,#132a58);box-shadow:0 0 0 2px #FFC93A inset,0 5px 0 #050A14;text-align:center;padding:40px 8px 12px}
  .ooHdr b{font-weight:400;font-size:23px;display:block}.ooHdr small{font-size:13px;color:#9fb4dc;letter-spacing:.03em}
  .ooCall{position:absolute;left:0;right:0;text-align:center;font-size:20px;text-shadow:0 3px 0 #050A14}
  .ooLad{position:absolute;left:22px;right:22px;border-radius:20px;border:3px solid #050A14;background:linear-gradient(#0f2550,#0a1b3c);box-shadow:0 5px 0 #050A14;padding:10px 10px 6px;display:flex;flex-direction:column;gap:7px}
  .ooRow{position:relative;height:50px;display:flex;align-items:center;gap:8px}
  .ooRow img{width:56px;height:44px;object-fit:contain;filter:drop-shadow(0 3px 0 rgba(0,0,0,.5))}
  .ooRow .nm{flex:1;height:38px;border-radius:12px;border:3px solid #050A14;background:#e9f0ff;color:#0a1b3c;font-size:18px;display:flex;align-items:center;padding-left:12px;box-sizing:border-box}
  .ooRow .rn{width:70px;height:42px;border-radius:12px;border:3px solid #050A14;background:var(--c);display:flex;align-items:center;justify-content:center;font-size:22px;text-shadow:0 2px 0 rgba(0,0,0,.45);box-sizing:border-box}
  .ooRow.got .nm{background:#b9c4da;color:#5a6a8c}.ooRow.got img{filter:grayscale(.8) brightness(.8)}
  .ooRow .tick{position:absolute;left:24px;top:24px;background:#23912a;border:2px solid #050A14;border-radius:8px;font-size:11px;padding:0 5px}
  .ooBtns{position:absolute;left:22px;right:22px;display:flex;gap:10px}
  .ooBtn{flex:1;height:68px;border-radius:16px;border:3px solid #050A14;box-shadow:0 5px 0 #050A14;display:flex;flex-direction:column;align-items:center;justify-content:center;font:22px/1 'Lilita One',sans-serif;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.4);cursor:pointer}
  .ooBtn small{font-size:19px;margin-top:3px}.ooBtn:active{transform:translateY(3px);box-shadow:0 2px 0 #050A14}
  .ooBtn.g{background:linear-gradient(#5fd35f,#23912a)}.ooBtn.bl{background:linear-gradient(#4b8ef0,#2a62c4)}.ooBtn.gd{background:linear-gradient(#ffd34d,#f0a21a)}.ooBtn[disabled]{filter:grayscale(.7);opacity:.7}
  .ooFoot{position:absolute;left:0;right:0;text-align:center;font-size:14px;color:#c8d6f0}
  #ooStrip{position:fixed;left:10px;right:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);z-index:60;height:58px;border-radius:16px;border:3px solid #050A14;background:rgba(10,27,60,.86);box-shadow:0 4px 0 #050A14;display:none;pointer-events:none;font-family:'Lilita One',sans-serif;color:#fff}
  #ooStrip.on{display:block}
  #ooStrip .bar{position:absolute;left:16px;right:16px;top:36px;height:8px;border-radius:4px;background:#26375a}
  #ooStrip .bar i{position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:linear-gradient(90deg,#ffd34d,#f0a21a);transition:width .4s}
  #ooStrip .s{position:absolute;top:2px;width:40px;margin-left:-20px;text-align:center}
  #ooStrip .s img{width:34px;height:26px;object-fit:contain;filter:drop-shadow(0 2px 0 #050A14) grayscale(.6) brightness(.75)}
  #ooStrip .s.hit img{filter:drop-shadow(0 0 6px #ffd34d)}#ooStrip .s.got img{filter:grayscale(1) brightness(.5)}
  #ooStrip .s span{display:block;font-size:11px;margin-top:12px;text-shadow:0 2px 0 #050A14}
  #ooStrip .me{position:absolute;top:28px;width:30px;margin-left:-15px;height:22px;border-radius:8px;border:2px solid #050A14;background:#fff;color:#0a1b3c;font-size:14px;display:flex;align-items:center;justify-content:center;transition:left .4s}
  .ooRays{position:absolute;left:50%;top:38%;width:760px;height:760px;margin:-380px 0 0 -380px;border-radius:50%;background:repeating-conic-gradient(rgba(255,201,58,.15) 0 10deg,transparent 10deg 20deg)}
  .ooWon{position:absolute;left:0;right:0;text-align:center}
  .ooWon .h{font-size:38px;line-height:1;color:#FFC93A;text-shadow:0 3px 0 #5a2a00,0 0 2px #5a2a00;padding:0 16px}
  .ooWon img{width:190px;margin-top:16px;filter:drop-shadow(0 10px 10px rgba(0,0,0,.5))}
  .ooWon .runs{font-size:60px;line-height:1;margin-top:8px;text-shadow:0 4px 0 #050A14}.ooWon .runs small{font-size:20px;color:#9fb4dc}
  .ooBalls{display:flex;gap:6px;justify-content:center;margin-top:8px}
  .ooBalls i{width:36px;height:30px;border-radius:9px;border:3px solid #050A14;font-style:normal;font-size:17px;display:flex;align-items:center;justify-content:center;background:#0a1b3c;box-sizing:border-box}
  .ooNxt{position:absolute;left:28px;right:28px;border-radius:16px;border:3px solid #050A14;background:#0f2550;padding:10px 12px;display:flex;align-items:center;gap:10px}
  .ooNxt img{width:50px}.ooNxt div{font-size:16px;line-height:1.15}.ooNxt small{display:block;font-size:13px;color:#9fb4dc}
  /* art pass: painted ground, gold rims, red ribbon, glossy rows */
  .ooArt{position:absolute;inset:0;background-position:center top;background-size:cover}
  .ooArt:after{content:'';position:absolute;inset:0;background:linear-gradient(rgba(10,27,60,.35) 0,rgba(10,27,60,.55) 30%,#0f2550 52%,#0a1b3c 78%,#061226 100%)}
  .ooTop{position:absolute;left:0;right:0;display:flex;flex-direction:column;align-items:center;z-index:3}
  .ooTop .lg{display:flex;align-items:center;gap:6px}
  .ooTop .lg img{width:46px;transform:rotate(-14deg);filter:drop-shadow(0 4px 0 #050A14)}
  .ooTop .lg b{font-weight:400;font-size:50px;line-height:.9;background:linear-gradient(#fff3a8,#FFC93A 45%,#e88a10);-webkit-background-clip:text;color:transparent;filter:drop-shadow(0 3px 0 #5a2a00) drop-shadow(0 0 2px #5a2a00) drop-shadow(0 6px 6px rgba(0,0,0,.5))}
  .ooTop .wk{margin-top:4px;font-size:14px;color:#fff;background:linear-gradient(#e0352b,#a3161a);border:3px solid #050A14;border-radius:11px;padding:2px 12px;box-shadow:0 3px 0 #050A14;letter-spacing:.04em}
  .ooCard{position:absolute;left:22px;right:22px;height:122px;border-radius:20px;border:4px solid #050A14;box-shadow:0 0 0 3px #FFC93A inset,0 6px 0 #050A14;background:center 40%/cover;overflow:hidden}
  .ooCard:after{content:'';position:absolute;inset:0;background:linear-gradient(rgba(5,10,20,0) 40%,rgba(5,10,20,.85))}
  .ooCard .gn{position:absolute;left:14px;bottom:10px;z-index:2;font-size:24px;line-height:1;text-shadow:0 3px 0 #050A14}
  .ooCard .ch{position:absolute;right:10px;bottom:10px;z-index:2;display:flex;gap:6px}
  .ooCard .ch span{font-size:13px;background:rgba(5,10,20,.8);border:2px solid #FFC93A;border-radius:10px;padding:2px 8px}
  .ooRib{position:absolute;left:34px;right:34px;height:46px;z-index:3;display:flex;align-items:center;justify-content:center;font-size:21px;color:#FFE27A;text-shadow:0 3px 0 #5a0a0a;background:linear-gradient(#ef4136,#b31b1f);border:3px solid #050A14;border-radius:6px;box-shadow:0 4px 0 #050A14}
  .ooRib:before,.ooRib:after{content:'';position:absolute;top:10px;width:28px;height:36px;background:#8e1418;border:3px solid #050A14;z-index:-1}
  .ooRib:before{left:-22px;clip-path:polygon(0 0,100% 0,100% 100%,0 100%,30% 50%)}.ooRib:after{right:-22px;clip-path:polygon(0 0,100% 0,70% 50%,100% 100%,0 100%)}
  .ooLad.v2{background:linear-gradient(#152d63,#0c1d42);box-shadow:0 0 0 2px #2d4f94 inset,0 5px 0 #050A14;padding:20px 10px 8px;gap:8px}
  .ooLad.v2 .ooRow{height:52px;border-radius:14px;border:3px solid #050A14;background:linear-gradient(#2c4f93,#1a336b);box-shadow:inset 0 2px 0 rgba(255,255,255,.18);padding-right:5px;gap:4px}
  .ooLad.v2 .ooRow img{width:64px;height:50px;margin:-6px -4px 0 -6px}
  .ooLad.v2 .ooRow .nm{background:none;border:0;color:#fff;font-size:19px;padding-left:2px;text-shadow:0 2px 0 #050A14;height:auto}
  .ooLad.v2 .ooRow .rn{width:auto;min-width:70px;height:38px;padding:0 8px;border-radius:11px;background:linear-gradient(color-mix(in srgb,var(--c) 70%,#fff),var(--c) 55%,color-mix(in srgb,var(--c) 70%,#000));gap:3px;font-size:21px}
  .ooLad.v2 .ooRow .rn small{font-size:10px;opacity:.9;margin-top:5px}
  .ooLad.v2 .ooRow.got{background:linear-gradient(#273450,#1b2640)}
  .ooLad.v2 .ooRow.got .nm{color:#8090b0;background:none}
  .ooLad.v2 .ooRow .tick{left:auto;right:84px;top:50%;transform:translateY(-50%) rotate(-8deg);font-size:13px;padding:1px 8px;border-radius:9px;background:linear-gradient(#5fd35f,#23912a)}
  .ooGlow{position:absolute;left:50%;width:250px;height:250px;margin-left:-125px;border-radius:50%;background:radial-gradient(circle,rgba(255,214,90,.55),rgba(255,214,90,0) 65%)}
  .ooRib.dim{background:linear-gradient(#3a5590,#22386b);color:#fff;text-shadow:0 3px 0 #050A14}.ooRib.dim:before,.ooRib.dim:after{background:#18294f}
  /* round 2 (Joe): One Over has its own floodlit look; bags bigger than their rows; real over summary; result in one card */
  .ooArt.sp{background-image:url(assets/ui/web/hero.webp)!important;background-position:center top}
  .ooArt.sp:after{background:linear-gradient(rgba(6,14,34,.15) 0,rgba(6,14,34,.35) 28%,rgba(8,20,48,.9) 50%,#081430 75%,#050d20 100%)}
  .ooLad.v2 .ooRow{overflow:visible}
  .ooLad.v2 .ooRow img{width:84px!important;height:64px!important;margin:-14px -10px -10px -14px!important;object-fit:contain;position:relative;z-index:2;filter:drop-shadow(0 4px 0 rgba(0,0,0,.55))!important}
  .ooLad.v2 .ooRow.got img{filter:grayscale(.85) brightness(.75) drop-shadow(0 4px 0 rgba(0,0,0,.55))!important}
  .ooLad.v2{gap:12px;padding-top:24px}
  .ooRC{position:absolute;left:22px;right:22px;border-radius:24px;border:4px solid #050A14;background:linear-gradient(#1d3b7c,#0f2452 60%,#0b1b40);box-shadow:0 0 0 3px #FFC93A inset,0 7px 0 #050A14;display:flex;flex-direction:column;align-items:center;padding:44px 14px 16px}
  .ooRC .ooRib{position:absolute;top:-24px;left:12px;right:12px}
  .ooRC .bagw{position:relative;width:210px;height:170px;display:grid;place-items:center}
  .ooRC .bagw:before{content:'';position:absolute;inset:-10px;border-radius:50%;background:radial-gradient(circle,rgba(255,214,90,.5),rgba(255,214,90,0) 66%)}
  .ooRC .bagw img{position:relative;width:200px;filter:drop-shadow(0 10px 8px rgba(0,0,0,.55))}
  .ooRC .bagw.none img{width:130px;filter:grayscale(1) brightness(.6) drop-shadow(0 8px 6px rgba(0,0,0,.5));opacity:.75}
  .ooRC .rr{font-size:64px;line-height:1;text-shadow:0 4px 0 #050A14;margin-top:2px}.ooRC .rr small{font-size:20px;color:#9fb4dc}
  .ooRC .ol{margin-top:12px;font-size:13px;color:#9fb4dc;letter-spacing:.1em}
  .ooOver{display:flex;gap:8px;margin-top:6px}
  .ooOver .b{display:flex;flex-direction:column;align-items:center;gap:3px}
  .ooOver .b i{width:38px;height:38px;border-radius:50%;border:3px solid #050A14;box-shadow:inset -4px -5px 0 rgba(0,0,0,.25),inset 3px 3px 0 rgba(255,255,255,.35),0 3px 0 #050A14;display:grid;place-items:center;font:18px/1 'Lilita One';font-style:normal;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.5);background:#e9eef7;color:#0a1b3c;text-shadow:none}
  .ooOver .b i.six{background:radial-gradient(circle at 35% 30%,#ff6a5e,#c8191d 60%,#8a0f12);color:#fff;text-shadow:0 2px 0 #5a0a0a}
  .ooOver .b i.four{background:radial-gradient(circle at 35% 30%,#7fb2ff,#2a62c4 60%,#183f86);color:#fff}
  .ooOver .b i.dot{background:radial-gradient(circle at 35% 30%,#7c889e,#46556f 65%);color:#c8d0e0}
  .ooOver .b i.wk{background:radial-gradient(circle at 35% 30%,#3a1a1a,#140808);color:#ff6b6b}
  .ooOver .b i.no{background:transparent;border-style:dashed;border-color:#3a4f7a;box-shadow:none}
  .ooOver .b span{font-size:10px;color:#6f84ad}`;
  document.head.appendChild(css);

  // ── home tile ──
  const tile = document.createElement('div'); tile.id = 'ooTile';
  (document.getElementById('overlay') || document.body).appendChild(tile);
  function paintTile() {
    const on = isOn(); document.body.classList.toggle('ooOn', on); if (!on) return;
    const o = st(), sb = $('startBtn');
    if (sb) { const r = sb.getBoundingClientRect(); if (r.height) { tile.style.top = r.top + 'px'; tile.style.height = r.height + 'px'; } }
    const rb = o.free ? '<span class="rb">FREE OVER</span>' : allWon(o) ? '<span class="rb dim">ALL WON</span>' : o.paid ? `<span class="rb">${o.paid} LEFT</span>` : '<span class="rb gold">GO AGAIN</span>';
    tile.innerHTML = `<img class="ball" alt="" src="assets/ui/comet_ball.webp"><b>ONE<br>OVER</b>${rb}<span class="tm">${fmtL(left())}</span>`;
  }
  const css2 = document.createElement('style'); css2.textContent = `body.ooOn #startBtn{margin-left:96px!important;width:calc(100% - 96px)!important;max-width:none!important}`; document.head.appendChild(css2);
  tile.addEventListener('click', e => { e.stopPropagation(); tapS(); openScr(); });
  { const _u = window.updateMenuHUD; if (typeof _u === 'function') window.updateMenuHUD = function () { const r = _u.apply(this, arguments); try { paintTile(); } catch (e) {} return r; }; }
  setInterval(() => { try { const ov = $('overlay'); if (ov && !ov.classList.contains('hidden')) paintTile(); } catch (e) {} }, 15000);
  addEventListener('resize', () => { try { paintTile(); } catch (e) {} });
  setTimeout(() => { try { paintTile(); } catch (e) {} }, 800);

  // ── prize ladder screen ──
  const scr = document.createElement('div'); scr.id = 'ooScr'; document.body.appendChild(scr);
  const T = () => `max(var(--insT,0px),6px)`;
  function ladder(o, hit) { return TIERS.map(x => `<div class="ooRow${o.won[x.bag] ? ' got' : ''}"><img alt="" src="${img(x.bag)}">${o.won[x.bag] ? '<b class="tick">WON ✓</b>' : ''}<span class="nm">${nm(x.bag)} BAG</span><span class="rn" style="--c:${x.c}">${x.t}${x.t === 30 ? '+' : ''}<small>RUNS</small></span></div>`).join(''); }
  function openScr() {
    const o = st(), li = Math.max(1, typeof selectedLeagueIdx === 'function' ? selectedLeagueIdx() : 1), ground = (THEMED_LEAGUES[li] && THEMED_LEAGUES[li].name) || '';
    let btns;
    if (allWon(o)) btns = `<button class="ooBtn bl" data-oo="x">BACK</button><button class="ooBtn g" disabled>ALL BAGS WON<small>BACK NEXT WEEKEND</small></button>`;
    else if (o.free) btns = `<button class="ooBtn bl" data-oo="x">EXIT</button><button class="ooBtn g" data-oo="go">FREE OVER<small>× 1</small></button>`;
    else if (o.paid) btns = `<button class="ooBtn bl" data-oo="x">EXIT</button><button class="ooBtn g" data-oo="go">PLAY<small>${o.paid} LEFT</small></button>`;
    else btns = `<button class="ooBtn bl" data-oo="x" style="flex:.8">EXIT</button><button class="ooBtn g" data-oo="b1">1 OVER<small>${price('one_over_1', 0.99)}</small></button><button class="ooBtn g" data-oo="b6">6 OVERS<small>${price('one_over_6', 4.99)}</small></button>`;
    scr.innerHTML = `<div class="ooArt sp"></div>
      <div class="ooTop" style="top:calc(${T()} + 6px)"><div class="lg"><img alt="" src="assets/ui/comet_ball.webp"><b>ONE OVER</b></div><span class="wk">WEEKEND · ENDS IN ${fmtL(left())}</span></div>
      <div class="ooCard" style="top:calc(${T()} + 96px);background-image:url(assets/themes/te_evening.webp);background-position:center 6%"><span class="ch" style="top:10px;bottom:auto"><span>6 BALLS</span><span>1 WICKET</span></span><span class="gn">EVENING SPECIAL</span></div>
      <div class="ooRib" style="top:calc(${T()} + 232px)">SCORE BIG FOR TOP PRIZES!</div>
      <div class="ooLad v2" style="top:calc(${T()} + 256px)">${ladder(o)}</div>
      <div class="ooBtns" style="top:calc(${T()} + 614px)">${btns}</div>
      <div class="ooFoot" style="top:calc(${T()} + 696px)">ONE BAG A GO · EACH BAG CAN ONLY BE WON ONCE</div>`;
    scr.classList.add('show');
  }
  function closeScr() { scr.classList.remove('show'); }
  function start() {
    const o = st(); if (allWon(o)) return;
    if (o.free) o.free = 0; else if (o.paid > 0) o.paid--; else return; save();
    closeScr(); $('ooRes').classList.remove('show');
    const li = Math.max(1, selectedLeagueIdx());
    window._activeLeagueIdx = li; window._leagueTargetFloor = 0;
    setupChase('league', li); Object.assign(window.chase, { mode: 'tourney', oo: true, target: 0, balls: 6, wickets: 1, board: null }); window._modeScene = 'te_evening';
    try { track('match_start', { mode: 'one_over' }); } catch (e) {}
    closeAllScreens(); startGame();
  }
  function buy(n) { const id = n === 6 ? 'one_over_6' : 'one_over_1', g = n === 6 ? 4.99 : 0.99;
    buyRealMoney(id, g, () => { const o = st(); o.paid += n; save(); setTimeout(() => { if (scr.classList.contains('show')) openScr(); if ($('ooRes').classList.contains('show')) start(); paintTile(); }, 50); return `${n} ONE OVER GO${n > 1 ? 'ES' : ''}`; }); }
  document.addEventListener('click', e => { const b = e.target && e.target.closest && e.target.closest('[data-oo]'); if (!b) return; e.stopImmediatePropagation(); tapS();
    const k = b.dataset.oo;
    if (k === 'x') { closeScr(); return; }
    if (k === 'go') { start(); return; }
    if (k === 'b1') { buy(1); return; } if (k === 'b6') { buy(6); return; }
    if (k === 'home') { $('ooRes').classList.remove('show'); try { closeAllScreens(); $('overlay').classList.remove('hidden'); showNav('league'); updateMenuHUD(); } catch (er) {} return; }
    if (k === 'again') { const o = st(); if (o.paid > 0) start(); else buy(1); return; }
  }, true);

  // ── in-game prize strip along the bottom ──
  const strip = document.createElement('div'); strip.id = 'ooStrip'; document.body.appendChild(strip);
  const MAX = 32, pos = t => 16 + (t / MAX) * 100;
  function paintStrip() {
    const c = window.chase; if (!c || !c.oo || (typeof state !== 'undefined' && state === 'menu')) { strip.classList.remove('on'); strip.dataset.k = ''; return; }
    strip.classList.add('on');
    const o = st(), r = typeof runs === 'number' ? runs : 0, w = (strip.clientWidth || 373) - 32, px = t => 16 + Math.min(1, t / MAX) * w;
    if (!strip.dataset.k) { strip.innerHTML = '<div class="bar"><i></i></div>' + TIERS.slice().reverse().map(x => `<div class="s" data-t="${x.t}"><img alt="" src="${img(x.bag)}"><span>${x.t}</span></div>`).join('') + '<div class="me"></div>'; strip.dataset.k = '1'; }
    strip.querySelectorAll('.s').forEach(s => { s.style.left = px(+s.dataset.t) + 'px'; });
    strip.querySelector('.bar i').style.width = Math.min(100, r / MAX * 100) + '%';
    const top = TIERS.find(y => r >= y.t && !o.won[y.bag]);
    strip.querySelectorAll('.s').forEach(s => { const t = +s.dataset.t, x = TIERS.find(y => y.t === t); s.classList.toggle('got', !!o.won[x.bag]); s.classList.toggle('hit', !!top && top.t === t); });
    const me = strip.querySelector('.me'); me.textContent = r; me.style.left = px(r) + 'px';
    strip.classList.add('on');
  }
  setInterval(paintStrip, 250);

  // ── result ──
  const res = document.createElement('div'); res.id = 'ooRes'; document.body.appendChild(res);
  const _me = window.modeEnd;
  window.modeEnd = function () { const c = window.chase; if (!c || !c.oo) return _me.apply(this, arguments);
    try { if (typeof _fxBigEl !== 'undefined' && _fxBigEl) { _fxBigEl.remove(); } } catch (e) {}
    state = 'menu'; try { hideMoment(); } catch (e) {}
    const o = st(), r = runs, tier = TIERS.find(x => r >= x.t);
    let title, bag = null, sub = '';
    if (tier && !o.won[tier.bag]) { bag = tier.bag; o.won[bag] = Date.now(); try { grantReward({ bag }); } catch (e) {} title = `${nm(bag)} BAG WON!`; }
    else if (tier) title = `${nm(tier.bag)} BAG ALREADY WON`;
    else title = 'NO BAG THIS TIME';
    o.best = Math.max(o.best || 0, r); save();
    const nx = TIERS.slice().reverse().find(x => x.t > r && !o.won[x.bag]);
    try { track('match_end', { mode: 'one_over', runs: r, bag: bag || '' }); } catch (e) {}
    const log = (c.log || []).slice(0, 6), balls = log.map(v => typeof v !== 'number' ? '<i style="background:#7a1d1d">W</i>' : `<i style="background:${v >= 6 ? '#e0352b' : v >= 4 ? '#2a62c4' : v === 0 ? '#46556f' : '#0a1b3c'}">${v}</i>`).join('') + (c.wkLost && !log.some(v => typeof v !== 'number') ? '<i style="background:#7a1d1d">W</i>' : '');
    window.chase = null; window._modeScene = null; window._activeLeagueIdx = null; window._modeEndAt = Date.now();
    const again = allWon(o) ? '' : o.paid ? `<button class="ooBtn gd" data-oo="again">GO AGAIN<small>${o.paid} LEFT</small></button>` : `<button class="ooBtn gd" data-oo="again">GO AGAIN<small>${price('one_over_1', 0.99)}</small></button>`;
    const chip = (v, k) => v === undefined ? `<div class="b"><i class="no"></i><span>${k + 1}</span></div>` : typeof v !== 'number' ? `<div class="b"><i class="wk">W</i><span>${k + 1}</span></div>`
      : `<div class="b"><i class="${v >= 6 ? 'six' : v >= 4 ? 'four' : v === 0 ? 'dot' : ''}">${v === 0 ? '•' : v}</i><span>${k + 1}</span></div>`;
    const lg2 = log.slice(); if (c.wkLost && !lg2.some(v => typeof v !== 'number') && lg2.length < 6) lg2.push('W');
    const over = [0, 1, 2, 3, 4, 5].map(k => chip(lg2[k], k)).join('');
    const showBag = bag || (tier && tier.bag);
    res.innerHTML = `<div class="ooArt sp"></div>
      <div class="ooTop" style="top:calc(${T()} + 6px)"><div class="lg"><img alt="" src="assets/ui/comet_ball.webp"><b>ONE OVER</b></div></div>
      <div class="ooRC" style="top:calc(${T()} + 104px)"><div class="ooRib${bag ? '' : ' dim'}">${title}</div>
        <div class="bagw${bag ? '' : ' none'}"><img alt="" src="${img(showBag || 'wooden')}"></div>
        <div class="rr">${r}<small> RUNS</small></div><div class="ol">THE OVER</div><div class="ooOver">${over}</div></div>
      ${nx ? `<div class="ooNxt" style="top:calc(${T()} + 520px)"><img alt="" src="${img(nx.bag)}"><div>${nx.t - r} RUN${nx.t - r === 1 ? '' : 'S'} FROM THE ${nm(nx.bag)} BAG<small>Face the over again to go for it</small></div></div>` : ''}
      <div class="ooBtns" style="top:calc(${T()} + 610px)"><button class="ooBtn bl" data-oo="home">CONTINUE</button>${again}</div>`;
    res.classList.add('show'); strip.classList.remove('on'); strip.dataset.k = '';
    try { hapticBig(); playAchievementChime(); } catch (e) {}
  };
  window.openOneOver = openScr;
})();
