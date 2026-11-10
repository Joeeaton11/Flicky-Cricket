// Scroll story: one delivery, sixteen grounds. The phone stays pinned while the page scrolls;
// scroll position picks the frame, and the ground changes every few frames.
(function () {
  var sec = document.getElementById('story'); if (!sec) return;
  var cfg = window.STORY, N = cfg.frames, cv = sec.querySelector('canvas.screen'), ctx = cv.getContext('2d');
  var bg = sec.querySelector('.storyBg'), lab = sec.querySelector('.ground b'), caps = [].slice.call(sec.querySelectorAll('.cap'));
  var FEND = 0.88, imgs = new Array(N), cur = -1, want = 0, ticking = false, prog = 0;
  var fx = sec.querySelector('canvas.fly'), fctx = fx.getContext('2d'), stick = sec.querySelector('.storyStick'), ball = new Image(); ball.src = 'img/ball.webp';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function src(i) { return 'img/story/' + String(i).padStart(3, '0') + '.webp'; }
  function load(i) { if (imgs[i]) return; var im = new Image(); im.decoding = 'async'; im.onload = function () { if (i === want || cur < 0) draw(want); }; im.src = src(i); imgs[i] = im; }
  function ready(i) { var im = imgs[i]; return im && im.complete && im.naturalWidth; }
  function nearest(i) { for (var d = 0; d < N; d++) { if (i - d >= 0 && ready(i - d)) return i - d; if (i + d < N && ready(i + d)) return i + d; } return -1; }
  function sceneOf(i) { var s = cfg.scenes, k = 0; for (var j = 0; j < s.length; j++) if (i >= s[j].from) k = j; return k; }
  function draw(i) {
    var j = nearest(i); if (j < 0 || j === cur) return; cur = j;
    ctx.drawImage(imgs[j], 0, 0, cv.width, cv.height);
    var sc = cfg.scenes[sceneOf(j)];
    if (lab.textContent !== sc.name) { lab.textContent = sc.name; lab.parentNode.classList.remove('pop'); void lab.offsetWidth; lab.parentNode.classList.add('pop'); }
    bg.style.backgroundImage = 'url(' + src(sc.from + 2 < N ? sc.from + 2 : sc.from) + ')';
    var p = j / (N - 1);
    caps.forEach(function (c) { var a = +c.dataset.a, b = +c.dataset.b; c.classList.toggle('on', p >= a && p < b); });
  }

  // After contact the ball leaves the phone: it swells towards you, climbs high over the grounds,
  // then swoops back in from the lower left and becomes the ball on the app icon.
  var icon = new Image(); icon.src = 'img/icon_end.webp';
  var phoneEl = sec.querySelector('.phone'), groundEl = sec.querySelector('.ground'), endEl = sec.querySelector('.endCard');
  function bez(a, b, c, d, t) { var u = 1 - t; return u*u*u*a + 3*u*u*t*b + 3*u*t*t*c + t*t*t*d; }
  function ss(a, b, x) { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
  function flight(p) {
    var dpr = Math.min(2, devicePixelRatio || 1), W = stick.clientWidth, H = stick.clientHeight;
    if (fx.width !== Math.round(W * dpr) || fx.height !== Math.round(H * dpr)) { fx.width = Math.round(W * dpr); fx.height = Math.round(H * dpr); }
    fctx.setTransform(dpr, 0, 0, dpr, 0, 0); fctx.clearRect(0, 0, W, H);
    var pHit = FEND * (cfg.hit + 0.5) / (N - 1), u = (p - pHit) / (0.985 - pHit);
    var fadeOut = ss(0.8, 0.9, u);
    phoneEl.style.opacity = groundEl.style.opacity = String(1 - fadeOut);
    endEl.classList.toggle('on', u > 0.95); sec.classList.toggle('ending', u > 0.86);
    if (u <= 0) return; u = Math.min(1, u);
    var sr = stick.getBoundingClientRect(), pr = phoneEl.getBoundingClientRect(), cr = cv.getBoundingClientRect();
    var x0 = cr.left - sr.left + cr.width * 0.5, y0 = cr.top - sr.top + cr.height * 0.655, top = cr.top - sr.top;
    // where the icon lands: centred on the phone; its ball sits at (0.74, 0.275) of the tile, radius 0.177
    var IS = Math.min(W * 0.62, pr.height * 0.42, 300), ix = pr.left - sr.left + pr.width / 2 - IS / 2, iy = pr.top - sr.top + pr.height * 0.40 - IS / 2;
    endEl.style.top = (iy + IS + 18) + 'px';
    var bx = ix + IS * 0.74, by = iy + IS * 0.275, br = IS * 0.177;
    var hiX = pr.left - sr.left + pr.width * 0.12, hiY = top + pr.height * 0.06;           // high point, far away
    var side = Math.min(W - 46, pr.right - sr.left + pr.width * (W > 900 ? 1.1 : 0.35));
    var base = cr.width * 0.03;
    function P(t) {
      if (t < 0.5) { var q = t / 0.5; return [bez(x0, x0 + cr.width * 0.55, side + cr.width * 0.2, hiX, q), bez(y0, y0 - cr.height * 0.3, top + cr.height * 0.3, hiY, q)]; }
      var q = (t - 0.5) / 0.5, lx = ix + IS * 0.05, ly = iy + IS * 1.05;                   // dive down the left, then up into the icon along its flame
      return [bez(hiX, hiX - cr.width * 0.35, lx - IS * 0.1, bx, q * q * (3 - 2 * q) * 0 + q), bez(hiY, hiY + cr.height * 0.5, ly + IS * 0.25, by, q)];
    }
    function R(t) {
      if (t < 0.5) { var q = t / 0.5; return q < 0.45 ? base * (1 + 4 * Math.sin(q / 0.45 * Math.PI / 2)) : base * (5 - 4.4 * Math.pow((q - 0.45) / 0.55, 0.8)); }
      var q = (t - 0.5) / 0.5; return base * 0.6 + (br - base * 0.6) * Math.pow(q, 1.6);
    }
    var K = 26, span = 0.13, C = [], tp = Math.min(1, u / 0.9);
    for (var k = 0; k <= K; k++) { var t = Math.max(0, tp - span * k / K); C.push([P(t), t]); }
    function ribbon(scale, wob) {
      var L = [], Rr = [];
      for (var k = 0; k < C.length; k++) {
        var a = C[k][0], b = C[Math.min(C.length - 1, k + 1)][0], dx = a[0] - b[0], dy = a[1] - b[1], m = Math.hypot(dx, dy) || 1, nx = -dy / m, ny = dx / m;
        var f = k / K, w = R(C[0][1]) * scale * Math.pow(1 - f, 0.9) * (1 + wob * Math.sin(f * 17 + p * 90) * f);
        L.push([a[0] + nx * w, a[1] + ny * w]); Rr.push([a[0] - nx * w, a[1] - ny * w]);
      }
      fctx.beginPath(); fctx.moveTo(L[0][0], L[0][1]); L.forEach(function (q) { fctx.lineTo(q[0], q[1]); }); for (var j = Rr.length - 1; j >= 0; j--) fctx.lineTo(Rr[j][0], Rr[j][1]); fctx.closePath();
    }
    var h = C[0][0], tl = C[C.length - 1][0];
    function g(c1, c2) { var gr = fctx.createLinearGradient(h[0], h[1], tl[0], tl[1]); gr.addColorStop(0, c1); gr.addColorStop(1, c2); return gr; }
    var iconA = ss(0.86, 0.96, u);
    // the icon tile builds up around the arriving ball
    if (iconA > 0 && icon.complete && icon.naturalWidth) {
      fctx.save(); fctx.globalAlpha = iconA; var sc = 0.9 + 0.1 * iconA, cx = bx, cy = by;
      fctx.translate(cx, cy); fctx.scale(sc, sc); fctx.translate(-cx, -cy);
      fctx.shadowColor = 'rgba(0,0,0,.55)'; fctx.shadowBlur = 40; fctx.shadowOffsetY = 14;
      var rr = IS * 0.22; fctx.beginPath(); fctx.moveTo(ix + rr, iy); fctx.arcTo(ix + IS, iy, ix + IS, iy + IS, rr); fctx.arcTo(ix + IS, iy + IS, ix, iy + IS, rr); fctx.arcTo(ix, iy + IS, ix, iy, rr); fctx.arcTo(ix, iy, ix + IS, iy, rr); fctx.closePath();
      fctx.fillStyle = '#ffc93a'; fctx.fill(); fctx.shadowColor = 'transparent';
      var pd = IS * 0.03, r2 = rr - pd; fctx.beginPath(); fctx.moveTo(ix + pd + r2, iy + pd); fctx.arcTo(ix + IS - pd, iy + pd, ix + IS - pd, iy + IS - pd, r2); fctx.arcTo(ix + IS - pd, iy + IS - pd, ix + pd, iy + IS - pd, r2); fctx.arcTo(ix + pd, iy + IS - pd, ix + pd, iy + pd, r2); fctx.arcTo(ix + pd, iy + pd, ix + IS - pd, iy + pd, r2); fctx.closePath(); fctx.clip();
      fctx.drawImage(icon, ix + pd, iy + pd, IS - 2 * pd, IS - 2 * pd); fctx.restore();
    }
    var flyA = 1 - ss(0.93, 0.98, u);
    if (flyA > 0) {
      fctx.globalAlpha = flyA;
      fctx.save(); fctx.shadowColor = 'rgba(255,110,20,.9)'; fctx.shadowBlur = 18; ribbon(1.05, 0.35); fctx.fillStyle = g('rgba(255,100,18,1)', 'rgba(235,60,10,0)'); fctx.fill(); fctx.restore();
      ribbon(0.72, 0.2); fctx.fillStyle = g('rgba(255,190,40,1)', 'rgba(255,140,25,0)'); fctx.fill();
      ribbon(0.3, 0.08); fctx.fillStyle = g('rgba(255,252,220,1)', 'rgba(255,225,120,0)'); fctx.fill();
      var r = R(tp);
      if (ball.complete && ball.naturalWidth) { fctx.save(); fctx.shadowColor = 'rgba(255,170,60,.85)'; fctx.shadowBlur = r * 0.8; fctx.translate(h[0], h[1]); fctx.rotate(tp * 26); fctx.drawImage(ball, -r, -r, r * 2, r * 2); fctx.restore(); }
      fctx.globalAlpha = 1;
    }
  }
  function progress() {
    var r = sec.getBoundingClientRect(), total = sec.offsetHeight - innerHeight;
    return Math.min(1, Math.max(0, -r.top / total));
  }
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; prog = progress(); want = Math.round(Math.min(1, prog / FEND) * (N - 1)); draw(want); flight(prog); }); }
  if (reduce) { sec.classList.add('still'); load(cfg.hero); var im = imgs[cfg.hero]; im.onload = function () { want = cfg.hero; draw(cfg.hero); }; return; }
  // first scenes straight away, then the rest in order once the story is near
  for (var i = 0; i < Math.min(N, 14); i++) load(i);
  var started = false;
  function rest() { if (started) return; started = true; var i = 14; (function next() { var n = 0; while (i < N && n < 6) { load(i++); n++; } if (i < N) setTimeout(next, 60); })(); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { if (e[0].isIntersecting) rest(); }, { rootMargin: '150% 0px' }).observe(sec); else rest();
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();
})();
