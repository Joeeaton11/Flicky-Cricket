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
  .v2top{position:relative;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 12px) 12px 0}
  .v2top .bk{width:42px;height:42px;border-radius:50%;border:3px solid #FFC93A;background:#14203a;color:#fff;font:30px/1 'Lilita One',sans-serif;cursor:pointer;flex:none}
  .v2top h1{flex:1;min-width:0;margin:0;font-weight:400;font-size:clamp(16px,5.2vw,24px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.04em;text-shadow:0 3px 0 #050A14}
  .v2top .pill{display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:14px;border:3px solid #050A14;background:#14203a;font-size:16px}.v2top .pill img{height:20px}
  .v2rail{position:absolute;left:0;right:0;top:calc(env(safe-area-inset-top,0px) + 70px);bottom:calc(env(safe-area-inset-bottom,0px) + 34px);display:flex;gap:14px;overflow-x:auto;overflow-y:auto;scroll-snap-type:x mandatory;padding:14px 9vw 10px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
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
  .tcard.pt{background:var(--pc) center top/100% auto no-repeat,linear-gradient(color-mix(in srgb,var(--a) 40%,#14203a),#0b1226)!important;border:0;border-radius:26px;padding:0 22px 26px;box-shadow:0 0 22px color-mix(in srgb,var(--a) 75%,transparent),0 8px 0 #050A14}
  .tcard.pt::before{content:'';position:absolute;inset:0;background:linear-gradient(rgba(8,14,32,0) 28%,rgba(8,14,32,.3) 40%,rgba(8,14,32,.62) 58%,rgba(8,14,32,.8));pointer-events:none;z-index:0}
  .tcard.pt::after{content:'';position:absolute;inset:0;border:30px solid transparent;border-image:url(assets/ui/card_frame.webp) 150 / 30px / 0 round;pointer-events:none;z-index:6}
  .tcard.pt>*{position:relative;z-index:1}
  .tcard.pt{container-type:inline-size}
  .tcard .ptcup{display:none}
  .tcard.pt{--u:calc((100cqw + 44px) / 768)}.tcard.pt .crest{position:static;margin-top:-10px}.tcard.pt .crest .cup{display:none}
  .tcard.pt .ptcup{display:block;position:absolute;z-index:2;left:50%;transform:translateX(-50%);height:84px;filter:drop-shadow(0 6px 6px rgba(0,0,0,.5));top:calc(var(--u) * (120 + var(--pp,270)) - 84px + var(--sink,4px))}
  .tcard.pt .hero{background:none!important;border-bottom:0;width:calc(100% + 44px);margin:0 -22px;height:calc(var(--u) * (120 + var(--pp,270) + var(--ph,100)))}.tcard.pt .hero::after{display:none}
  .tcard.pt .v2stk,.tcard.pt .v2prz,.tcard.pt .v2road{background:rgba(6,12,28,.6);backdrop-filter:blur(5px);border-color:rgba(255,215,120,.35)}
  .tcard.pt.locked::before{background:linear-gradient(rgba(8,14,32,.35),rgba(8,14,32,.9));backdrop-filter:saturate(.35)}
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
  #v2vs .scr,#v2champ .scr{position:relative;height:100%;display:flex;flex-direction:column;align-items:center;padding:calc(env(safe-area-inset-top,0px) + 14px) 16px calc(env(safe-area-inset-bottom,0px) + 22px);box-sizing:border-box}
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
  @media (max-height:760px){.tcard.pt{padding-bottom:20px}.tcard.pt .crest{margin-top:-16px}.tcard.pt .v2road{display:none}.tcard{gap:6px}.tcard .hero{height:104px}.tcard .crest{margin-top:-50px}.tcard .v2road{padding:3px 8px}.tcard .v2road .tx small{display:none}.tcard .v2face{width:34px;height:34px}.v2prz h5{margin:0 0 2px}.v2prz .row img{height:26px}.v2go{height:46px;font-size:20px}.tcard .crest .cup{height:72px}.mcard .post{display:none}.mcard .ico{height:64px}.mcard h4{font-size:28px}.v2rail{padding-top:48px}}`;
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
    else if (ready) { pct = 100; lbl = '⚔ FINAL READY'; cls = 'fin'; }
    else if (open && nx) { pct = Math.max(0, Math.min(1, (trophyState.count - lg.unlock) / Math.max(1, nx.unlock - lg.unlock))) * 100; lbl = `${trophyState.count} / ${nx.unlock}`; }
    else if (nx) { lbl = `0 / ${nx.unlock}`; } else lbl = 'TOP LEAGUE';
    const R = rival(i), fr = finalReward(i), wins = nx && open && !won && !ready ? Math.ceil(Math.max(0, nx.unlock - trophyState.count) / (wT + 1)) : 0;
    let body = `<div class="v2stk"><div class="w">WIN<b>+${won || ready ? 0 : wT}🏆</b></div><div class="v2bar ${cls}"><i style="width:${pct}%"></i><span>${lbl}</span></div><div class="l">LOSS<b>${lossT ? '−' + lossT : '0'}🏆</b></div></div>
      <div class="v2prz"><h5>EVERY WIN</h5><div class="row"><span><img src="${ART.coin}">${fmt(lg.winCoins)}</span><span><img src="${ART.bag(lg.winChest || 'bronze')}">${bagNm(lg.winChest || 'bronze')} BAG</span></div>
      ${nx ? `<h5>WIN THE FINAL</h5><div class="row"><span><img src="${ART.coin}">${fmt(fr.coins)}</span><span><img src="${ART.gemS}" style="height:28px">${fr.gems}</span><span><img src="${ART.bag(fr.bag)}">${bagNm(fr.bag)} BAG</span><span><img src="${lg.cup ? '' : ''}${P.trophy || ART.trophy}">THE CUP</span></div>` : ''}</div>`;
    if (nx && !won && open) body += `<div class="v2road"><div class="tx">${ready ? `<b style="font-weight:400;color:#ff8a65">THE FINAL IS ON!</b><small>Beat ${esc(R.n)} to lift the ${esc(lg.name)}</small>` : `THE ROAD TO THE FINAL<small>About ${wins} more win${wins === 1 ? '' : 's'} to face ${esc(R.n)}</small>`}</div><div class="v2face" data-face="${i}"></div></div>`;
    if (won) body += `<div class="v2road"><span class="donepill">🏆 CUP WON</span><div class="tx"><small>Beat ${esc(R.n)} · no trophies lost here · play any time for coins and bags</small></div></div>`;
    let foot = '';
    if (!open) { const prevPending = i === hi + 1 && LG[hi + 1] && !finalWon(hi);
      foot = `<div class="lockx"><div class="st s1"></div><div class="st s2"></div><div class="bd">🔒</div></div><div class="need">${prevPending ? `WIN THE <b>${esc(LG[hi].name)}</b> FINAL TO UNLOCK` : `WIN <b>${Math.max(0, lg.unlock - trophyState.count)}</b> MORE 🏆 TO UNLOCK`}</div>`; }
    else if (ready) foot = `<div class="v2tgt">FINAL: CHASE <b>${finalTarget(i)}</b> OFF <b>${band.balls}</b> · FREE ENTRY</div><button class="v2go red" data-final="${i}">⚔ PLAY THE FINAL</button>`;
    else foot = `<div class="v2tgt">NEED <b>${leagueTarget(lg)}</b> OFF <b>${band.balls}</b> BALLS · ${band.wickets} WKT${band.wickets === 1 ? '' : 'S'}</div><button class="v2go" data-play="${i}">PLAY · <img src="${ART.coinS}">${fmt(lg.entry)}</button>`;
    return `<div class="tcard pt ${open ? (won ? 'done' : 'cur') : 'locked'}" style="--a:${lg.accentColor || '#f0a21a'};--pc:url(assets/ui/leagues/lg_${i}_tall.webp)${({3:280,8:300,11:308,13:296})[i] ? ';--pp:' + ({3:280,8:300,11:308,13:296})[i] : ''}"><div class="hero" style="background-image:url(${P.bg || ''})"></div><div class="crest"><img class="cup" src="${P.trophy || ART.trophy}" alt=""><img class="ptcup" src="${P.trophy || ART.trophy}" alt=""><div class="ban">${esc(lg.name)}</div><div class="rib">LEAGUE ${i}</div></div>
      <div class="post" style="background-image:url(${P.bg || ''})"></div>${body}${foot}</div>`;
  }
  function openDeck(focus) {
    const o = ov('v2deck'), n = LG.length - 1;
    o.innerHTML = `<div class="bgx"></div>${topBar('LEAGUES')}<div class="v2rail">${Array.from({ length: n }, (_, k) => leagueCard(k + 1)).join('')}</div><div class="v2dots"></div>`;
    o.classList.add('show'); fillFaces(o); railDots(o);
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
    e.stopImmediatePropagation(); e.preventDefault(); tap(); openModes(); }, true);
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
