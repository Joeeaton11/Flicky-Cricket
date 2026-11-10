// Fun bits for the homepage: flick the ball out of the logo for a six, seasonal looks that follow the game's
// events, and a couple of hidden surprises. Everything is optional and fails quietly.
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function ev(name) { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: name, event: true }); } catch (e) {} }
  function buzz(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }
  var ballImg = new Image(); ballImg.src = 'img/ball.webp';

  // one full-screen canvas for flying balls, cracks and snow
  var fx = document.createElement('canvas'); fx.className = 'funFx'; fx.setAttribute('aria-hidden', 'true'); document.body.appendChild(fx);
  var fc = fx.getContext('2d'), dpr = 1, W = 0, H = 0;
  function size() { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; fx.width = W * dpr; fx.height = H * dpr; fc.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size(); addEventListener('resize', size);
  var layers = [];                      // each: function(t) -> false when finished
  var running = false;
  function tick(now) { fc.clearRect(0, 0, W, H); layers = layers.filter(function (f) { return f(now) !== false; }); if (layers.length) requestAnimationFrame(tick); else { running = false; fc.clearRect(0, 0, W, H); } }
  function add(f) { layers.push(f); if (!running) { running = true; requestAnimationFrame(tick); } }

  function trail(pts, r) {             // tapered comet trail, same look as the logo: orange glow, gold body, white core
    if (pts.length < 3) return;
    var hd = pts[0], tl = pts[pts.length - 1];
    [[1, 'rgba(255,104,20,.95)', 'rgba(255,80,10,0)', 1], [0.66, 'rgba(255,196,44,1)', 'rgba(255,160,30,0)', 0], [0.3, 'rgba(255,252,226,1)', 'rgba(255,236,160,0)', 0]].forEach(function (L) {
      var A = [], B = [];
      for (var k = 0; k < pts.length; k++) { var a = pts[k], b = pts[Math.min(pts.length - 1, k + 1)], a0 = pts[Math.max(0, k - 1)], dx = a0[0] - b[0], dy = a0[1] - b[1], m = Math.hypot(dx, dy) || 1, f = k / (pts.length - 1), w = (a[2] || r) * L[0] * Math.pow(1 - f, 1.1);
        A.push([a[0] - dy / m * w, a[1] + dx / m * w]); B.push([a[0] + dy / m * w, a[1] - dx / m * w]); }
      fc.beginPath(); fc.moveTo(A[0][0], A[0][1]); A.forEach(function (q) { fc.lineTo(q[0], q[1]); }); for (var j = B.length - 1; j >= 0; j--) fc.lineTo(B[j][0], B[j][1]); fc.closePath();
      var g = fc.createLinearGradient(hd[0], hd[1], tl[0], tl[1]); g.addColorStop(0, L[1]); g.addColorStop(1, L[2]);
      fc.save(); if (L[3]) { fc.shadowColor = 'rgba(255,120,30,.85)'; fc.shadowBlur = r * 1.4; } fc.fillStyle = g; fc.fill(); fc.restore();
    });
  }
  function drawBall(x, y, r, spin) { if (!ballImg.complete) return; fc.save(); fc.shadowColor = 'rgba(255,170,60,.8)'; fc.shadowBlur = r * 0.9; fc.translate(x, y); fc.rotate(spin); fc.drawImage(ballImg, -r, -r, r * 2, r * 2); fc.restore(); }
  function pop(text, sub, x, y, gold) {  // big slam word
    var el = document.createElement('div'); el.className = 'funPop' + (gold ? ' gold' : ''); el.innerHTML = '<b>' + text + '</b>' + (sub ? '<small>' + sub + '</small>' : '');
    el.style.left = x + 'px'; el.style.top = y + 'px'; document.body.appendChild(el); setTimeout(function () { el.remove(); }, 1700);
  }

  // ── 1. Flick the ball out of the logo ──
  var icon = document.querySelector('.hero-icon');
  if (icon) {
    var full = icon.src, empty = 'img/icon_noball.webp'; new Image().src = empty;
    icon.draggable = false; icon.classList.add('flickable');
    var hint = document.createElement('p'); hint.className = 'flickHint';
    var best = +store('fcBest') || 0;
    function showHint() { hint.innerHTML = best ? 'Best <b>' + best + 'm</b> · <a href="play/" data-ev="play-flick">beat it in the game ▶</a>' : '<span class="arrow">↑</span> Flick the ball to hit a six'; }
    showHint(); icon.insertAdjacentElement('afterend', hint);
    var down = null, busy = false;
    icon.addEventListener('pointerdown', function (e) { if (busy) return; down = { x: e.clientX, y: e.clientY, t: performance.now() }; icon.setPointerCapture(e.pointerId); e.preventDefault(); });
    icon.addEventListener('pointerup', function (e) {
      if (!down || busy) return; var dx = e.clientX - down.x, dy = e.clientY - down.y, dt = Math.max(16, performance.now() - down.t), d = Math.hypot(dx, dy); down = null;
      if (d < 18 || dy > -10) { icon.classList.remove('nudge'); void icon.offsetWidth; icon.classList.add('nudge'); return; }   // a tap or a downward drag: just a little hop
      hit(dx, dy, d / dt);
    });
    function hit(dx, dy, speed) {
      busy = true; var r0 = icon.getBoundingClientRect(), sx = r0.left + r0.width * 0.74, sy = r0.top + r0.height * 0.275, br = r0.width * 0.177;
      var straight = Math.max(0, -dy) / Math.hypot(dx, dy);                       // straighter flicks go further
      var m = Math.round(Math.max(28, Math.min(118, 22 + speed * 46 * (0.6 + 0.4 * straight))));
      var six = m >= 70, ang = Math.atan2(dy, dx);
      icon.src = empty; buzz(six ? [20, 40, 30] : 15);
      // the ball swings out towards you, then sails away and shrinks into the sky (a four stays lower and runs off the side)
      var dir = Math.max(-1, Math.min(1, dx / 120)), t0 = performance.now(), D = six ? 1300 : 1000, hist = [];
      var c1 = [sx + dir * W * 0.35, sy + H * (six ? 0.32 : 0.2)], end = six ? [W * (0.5 + dir * 0.32), Math.max(80, sy - 30)] : [dir >= 0 ? W + 60 : -60, sy + H * 0.12];
      add(function (now) {
        var u = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - u, 1.6), v = 1 - e;
        var x = v * v * sx + 2 * v * e * c1[0] + e * e * end[0], y = v * v * sy + 2 * v * e * c1[1] + e * e * end[1];
        var grow = Math.sin(Math.min(1, u / 0.35) * Math.PI / 2), r = br * (1 + (six ? 1.5 : 0.9) * grow) * (six ? Math.max(0.06, 1 - Math.pow(Math.max(0, u - 0.3) / 0.7, 0.8)) : 1);
        hist.unshift([x, y, r]); if (hist.length > 16) hist.pop();
        fc.globalAlpha = six ? 1 - Math.max(0, (u - 0.88) / 0.12) : 1; trail(hist, r); drawBall(x, y, r, u * 22); fc.globalAlpha = 1;
        return u < 1;
      });
      setTimeout(function () { pop(six ? 'SIX!' : 'FOUR!', m + 'm', r0.left + r0.width / 2, r0.top + r0.height * 0.55, six); ev(six ? 'flick-six' : 'flick-four'); }, reduce ? 0 : D - 250);
      if (m > best) { best = m; store('fcBest', String(m)); }
      setTimeout(function () { icon.src = full; icon.classList.remove('respawn'); void icon.offsetWidth; icon.classList.add('respawn'); showHint(); busy = false; }, D + 250);
    }
  }

  // ── 3. Seasonal looks that follow the game's events ──
  var q = (location.search.match(/[?&]season=(\w+)/) || [])[1], now = new Date(), md = (now.getMonth() + 1) * 100 + now.getDate();
  var season = q || (md >= 1105 && md <= 1116 ? 'diwali' : (md >= 1201 || md <= 104) ? 'xmas' : '');
  if (season === 'xmas' || season === 'diwali') {
    var xm = season === 'xmas', live = xm ? (md >= 1212 || md <= 104 || q) : true;
    var band = document.createElement('a'); band.className = 'seasonBand ' + season; band.href = 'play/'; band.setAttribute('data-ev', 'play-season');
    band.innerHTML = '<img src="img/ev/' + (xm ? 'present' : 'diya') + '.webp" alt="" width="28" height="32"><span>' +
      (xm ? (live ? 'The <b>Christmas Cup</b> is on: win exclusive festive kit' : 'The <b>Christmas Cup</b> starts 12 December') : 'The <b>Diwali Cup</b> is on: collect diyas for exclusive kit') + '</span><em>PLAY ▶</em>';
    var top = document.querySelector('.top'); top && top.insertAdjacentElement('afterend', band);
    document.documentElement.classList.add('season-' + season);
    if (!reduce) {
      if (xm) {   // gentle snow over the whole page
        var flakes = []; for (var i = 0; i < 46; i++) flakes.push({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 2.6, s: 0.2 + Math.random() * 0.5, w: Math.random() * 6.28 });
        var last = performance.now();
        add(function (t) { var dt = Math.min(50, t - last) / 16.7; last = t; fc.fillStyle = 'rgba(255,255,255,.85)';
          flakes.forEach(function (f) { f.y += f.s * dt / H * 2.2; f.w += 0.02 * dt; if (f.y > 1.02) { f.y = -0.02; f.x = Math.random(); }
            fc.globalAlpha = 0.5 + f.r / 6; fc.beginPath(); fc.arc(f.x * W + Math.sin(f.w) * 12, f.y * H, f.r, 0, 7); fc.fill(); });
          fc.globalAlpha = 1; return true; });
      } else {   // little firework bursts in the sky over the hero
        var hero = document.querySelector('.hero'), bursts = [], nextB = 0, cols = ['#ffd75e', '#ff8a3d', '#ff5fa2', '#7fd3ff', '#b46cff'];
        add(function (t) {
          var hr = hero ? hero.getBoundingClientRect() : null; if (!hr || hr.bottom < 0) return true;
          if (t > nextB) { nextB = t + 900 + Math.random() * 900; bursts.push({ x: hr.left + hr.width * (0.12 + Math.random() * 0.76), y: hr.top + hr.height * (0.06 + Math.random() * 0.22), t: t, c: cols[Math.floor(Math.random() * cols.length)] }); }
          bursts = bursts.filter(function (b) { var u = (t - b.t) / 1100; if (u > 1) return false;
            fc.fillStyle = b.c; fc.globalAlpha = 1 - u; for (var k = 0; k < 18; k++) { var a = k / 18 * 6.28, d = 6 + 46 * Math.sqrt(u); fc.beginPath(); fc.arc(b.x + Math.cos(a) * d, b.y + Math.sin(a) * d + 18 * u * u, 2.2 * (1 - u) + 0.6, 0, 7); fc.fill(); }
            fc.globalAlpha = 1; return true; });
          return true; });
      }
    }
  }

  // ── 4. Hidden surprises ──
  // tap the logo in the header five times quickly: a beamer comes straight at your screen
  var brand = document.querySelector('.top .brand'), taps = [];
  if (brand && /\/(index\.html)?$/.test(location.pathname)) {
    brand.addEventListener('click', function (e) {
      e.preventDefault(); var t = performance.now(); taps = taps.filter(function (x) { return t - x < 2500; }); taps.push(t);
      if (taps.length >= 5) { taps = []; beamer(); } else if (taps.length === 1 && scrollY > 10) scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }
  function beamer() {
    ev('egg-beamer'); var t0 = performance.now(), cx = W * (0.45 + Math.random() * 0.1), cy = H * 0.42, cracked = false;
    add(function (t) {
      var u = (t - t0) / 900;
      if (u < 1) { var e = Math.pow(u, 2.6), r = 3 + e * Math.min(W, H) * 0.32; drawBall(cx + (1 - e) * 20, cy - (1 - e) * H * 0.18, r, u * 30); return true; }
      if (!cracked) { cracked = true; buzz([60, 40, 80]); document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake'); pop('BEAMER!', 'NO BALL · FREE HIT', cx, cy + Math.min(W, H) * 0.36, true); }
      var v = (t - t0 - 900) / 1400; if (v > 1) return false;
      fc.save(); fc.globalAlpha = 1 - Math.max(0, (v - 0.6) / 0.4); fc.strokeStyle = 'rgba(255,255,255,.9)'; fc.lineWidth = 2; fc.lineCap = 'round';
      for (var k = 0; k < 11; k++) { var a = k / 11 * 6.28 + 0.3, l = Math.min(W, H) * (0.18 + (k * 37 % 10) / 22); fc.beginPath(); fc.moveTo(cx, cy);
        var mx = cx + Math.cos(a) * l * 0.5 + Math.sin(k) * 8, my = cy + Math.sin(a) * l * 0.5; fc.lineTo(mx, my); fc.lineTo(cx + Math.cos(a + 0.08) * l, cy + Math.sin(a + 0.08) * l); fc.stroke(); }
      fc.beginPath(); fc.arc(cx, cy, Math.min(W, H) * 0.06, 0, 7); fc.stroke(); fc.restore();
      drawBall(cx, cy, Math.min(W, H) * 0.32 * (1 - 0.15 * Math.min(1, v * 4)), 0);
      return true;
    });
  }
  // scroll back up to the top after watching the six: the ball comes home to the logo
  var story = document.getElementById('story'), sawSix = false, cameHome = false;
  if (story && icon && !reduce) addEventListener('scroll', function () {
    if (!sawSix) { var r = story.getBoundingClientRect(), p = -r.top / (story.offsetHeight - innerHeight); if (p > 0.95) sawSix = true; return; }
    if (cameHome || scrollY > 30) return; cameHome = true; ev('egg-home');
    setTimeout(function () {
      var r0 = icon.getBoundingClientRect(), tx = r0.left + r0.width * 0.74, ty = r0.top + r0.height * 0.275, br = r0.width * 0.177, sx = W + 40, sy = H * 0.85, t0 = performance.now(), hist = [];
      icon.src = empty;
      add(function (t) { var u = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - u, 3), x = sx + (tx - sx) * e, y = sy + (ty - sy) * e - Math.sin(e * Math.PI) * H * 0.15;
        hist.unshift([x, y, br]); if (hist.length > 14) hist.pop(); trail(hist, br); drawBall(x, y, br, (1 - e) * 18);
        if (u >= 1) { icon.src = full; icon.classList.remove('respawn'); void icon.offsetWidth; icon.classList.add('respawn'); pop('WELCOME BACK', '', r0.left + r0.width / 2, r0.bottom + 30, false); return false; } return true; });
    }, 250);
  }, { passive: true });
})();
