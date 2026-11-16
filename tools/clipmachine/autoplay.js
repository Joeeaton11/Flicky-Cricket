// Injected auto-batter: hits every ball at the sweet spot with a strong swipe, logs runs for clip cutting
(() => {
  try { Object.defineProperty(document, 'hidden', { get: () => false }); Object.defineProperty(document, 'visibilityState', { get: () => 'visible' }); } catch (e) {}
  document.addEventListener('visibilitychange', e => e.stopImmediatePropagation(), true);
  try { localStorage.setItem('flickyTutorialSeen', 'true'); } catch (e) {}
  window._clipLog = [];
  const T0 = performance.now();
  let lastRuns = 0, lastState = '', aimed = false;
  // swipe angles (degrees from straight; − = leg side) chosen to hit every shot in the game's mocap library:
  // sweep, pull/slog, flick, on drive, drive, off drive, cover drive/slash, cut, reverse sweep, scoop
  const ANG = [-125, -90, -55, -25, 0, 25, 60, 95, 130, 160];
  let order = [];
  const nextAngle = () => { if (!order.length) order = ANG.slice().sort(() => Math.random() - 0.5); return order.pop(); };
  const dirs = { pick() { const a = nextAngle() * Math.PI / 180, m = 330; return [Math.sin(a) * m, -Math.cos(a) * m]; } };
  function tick() {
    try {
      if (window._userPaused && !window._clipKeepPause) { window._userPaused = false; try { const pz = document.getElementById('pauseOverlay'); if (pz) pz.classList.add('hidden'); } catch (e) {} }
      if (typeof state !== 'undefined') {
        if (state === 'ballcoming' && ball && ball.active && !aimed && ball.zoneCenter != null) {
          const jitter = (window._clipJitter || 0.015) * (Math.random() - 0.5);
          if (ball.z >= ball.zoneCenter - 0.012 + jitter) {
            const d = dirs.pick();
            swipeVec = { dx: d[0], dy: d[1], dt: 95, cz: ball.z };
            aimed = true; attemptFlick();
          }
        }
        if (state !== 'ballcoming') aimed = false;
        if (typeof runs !== 'undefined' && runs !== lastRuns) {
          const d = runs - lastRuns; if (d > 0) { let shot = '', bowl = ''; try { shot = gullyShotPose(); bowl = window._bowlPre || ''; } catch (e) {} window._clipLog.push({ t: Date.now() / 1000, ev: 'runs', n: d, total: runs, shot, bowl }); } lastRuns = runs; }
        if (state !== lastState) { window._clipLog.push({ t: Date.now() / 1000, ev: 'state', s: state }); lastState = state; }
      }
    } catch (e) {}
    requestAnimationFrame(tick);
  }
  // start clean matches ourselves once the boot flow has settled, and keep playing after each result
  const LG = +(new URLSearchParams(location.search).get('lg') || 1);
  function go() { try {
      const rs = document.getElementById('resultScreen'); if (rs) { rs.classList.add('hidden'); rs.classList.remove('rs-visible'); }
      document.querySelectorAll('.show').forEach(el => { if (el.id && /tz|bag|chest|offer|daily|mates|promo|pop/i.test(el.id)) el.classList.remove('show'); });
      closeAllScreens(); career.matchesPlayed = Math.max(career.matchesPlayed || 0, 5); career.coins = 1e6; saveCareerStats(); window.chase = null;
      if (LG <= 1) playLeague(LG);
      else { const lg = THEMED_LEAGUES[LG]; window._activeLeagueIdx = LG; target = leagueTarget(lg); window._leagueTargetFloor = target; setupChase('league', LG); startGame(); }
      window._clipLog.push({ t: Date.now() / 1000, ev: 'start', lg: LG });
    } catch (e) { window._clipLog.push({ t: Date.now() / 1000, ev: 'err', m: String(e) }); } }
  window._clipGo = go;
  setTimeout(go, 7000);
  let resAt = 0;
  setInterval(() => { try { if (state === 'result' || state === 'menu') { if (!resAt) resAt = Date.now(); if (Date.now() - resAt > 5500) { resAt = 0; go(); } } else resAt = 0; } catch (e) {} }, 500);
  requestAnimationFrame(tick);
})();
