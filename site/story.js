// Scroll story: one delivery, sixteen grounds. The phone stays pinned while the page scrolls;
// scroll position picks the frame, and the ground changes every few frames.
(function () {
  var sec = document.getElementById('story'); if (!sec) return;
  var cfg = window.STORY, N = cfg.frames, cv = sec.querySelector('canvas.screen'), ctx = cv.getContext('2d');
  var bg = sec.querySelector('.storyBg'), lab = sec.querySelector('.ground b'), caps = [].slice.call(sec.querySelectorAll('.cap'));
  var FEND = 0.8, lastD = 0, imgs = new Array(N), cur = -1, want = 0, ticking = false, prog = 0;
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
    phoneEl.style.opacity = groundEl.style.opacity = String(1 - ss(0.4, 0.75, u));
    endEl.classList.toggle('on', u > 0.95); sec.classList.toggle('ending', u > 0.4);
    if (u <= 0) return; u = Math.min(1, u);
    var sr = stick.getBoundingClientRect(), pr = phoneEl.getBoundingClientRect(), cr = cv.getBoundingClientRect();
    var ox = sr.left, oy = sr.top, x0 = cr.left - ox + cr.width * 0.5, y0 = cr.top - oy + cr.height * 0.655, top = cr.top - oy;
    // the icon's spot, centred on the phone
    var IS = Math.min(W * 0.62, pr.height * 0.42, 300), ix = pr.left - ox + pr.width / 2 - IS / 2, iy = pr.top - oy + pr.height * 0.40 - IS / 2;
    endEl.style.top = (iy + IS + 18) + 'px';
    var br = IS * 0.177, base = cr.width * 0.03, side = Math.min(W - 46, pr.right - ox + pr.width * (W > 900 ? 1.1 : 0.32));
    function T(x, y) { return [ix + IS * x, iy + IS * y]; }
    // a pull shot off a short ball: out of the game screen, smack into the side of YOUR phone, one bounce, into the logo
    var wallR = base * 2.6, wall = [wallR + 2, y0 - cr.height * 0.12, base * 2.6];
    var edge = [cr.left - ox, y0 - cr.height * 0.07, base * 1.7];
    var WP = [wall, T(0.74, 0.275).concat(br)];   // after the bounce: straight to the ball's spot on the logo
    var pts = [], len = [0];
    for (var k = 0; k < 24; k++) { var t = k / 24, q = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5, A = t < 0.5 ? [x0, y0, base] : edge, B = t < 0.5 ? edge : wall; pts.push([A[0] + (B[0] - A[0]) * q, A[1] + (B[1] - A[1]) * q, A[2] + (B[2] - A[2]) * q]); }
    for (var k = 0; k < 24; k++) { var t = k / 24, A = WP[0], B = WP[1]; pts.push([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); }
    pts.push(WP[WP.length - 1].slice());
    for (var i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    var TOT = len[len.length - 1], L1 = len[24];
    function at(d) { d = Math.max(0, Math.min(TOT, d)); var j = 1; while (j < len.length - 1 && len[j] < d) j++; var f = (d - len[j - 1]) / ((len[j] - len[j - 1]) || 1), A = pts[j - 1], B = pts[j]; return [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f]; }
    var x = Math.min(1, u / 0.8), dist = x < 0.4 ? L1 * x / 0.4 : L1 + (TOT - L1) * (1 - Math.pow(1 - (x - 0.4) / 0.6, 1.6));
    // the whole screen shudders when the ball hits the side of it
    if (lastD < L1 && dist >= L1) { stick.classList.remove('shudder'); void stick.offsetWidth; stick.classList.add('shudder'); }
    lastD = dist;
    var imp = wall;
    var near = 0;   // plain comet trail for now (no morphing into the logo's flame)
    var flameLen = TOT - len[24];
    var span = Math.min(dist, cr.width * 0.5);
    var K = 34, C = [];
    for (var k = 0; k <= K; k++) C.push(at(dist - span * k / K));
    var head = C[0], r = head[2];
    function ribbon(scale, tongue) {
      var L = [], Rr = [];
      for (var k = 0; k < C.length; k++) {
        var a = C[k], b = C[Math.min(C.length - 1, k + 1)], dx = a[0] - b[0], dy = a[1] - b[1], m = Math.hypot(dx, dy) || 1, nx = -dy / m, ny = dx / m;
        var f = k / K, shape = (1 - near) * Math.pow(1 - f, 0.9) + near * Math.pow(1 - f, 0.7) * (1 + 0.3 * Math.sin(f * 3.1));
        var w = r * scale * shape;
        // licking flame tongues, stronger towards the tail, like the painted flame on the icon
        var n1 = (Math.sin(f * 19 - p * 420) * 0.6 + Math.sin(f * 8 + p * 260) * 0.4) * tongue * r * Math.pow(f, 0.6) * (1 - f * 0.5);
        var n2 = (Math.sin(f * 15 + p * 380 + 1.7) * 0.6 + Math.sin(f * 6 - p * 200) * 0.4) * tongue * r * Math.pow(f, 0.6) * (1 - f * 0.5) * 0.7;
        L.push([a[0] + nx * (w + Math.max(0, n1)), a[1] + ny * (w + Math.max(0, n1))]); Rr.push([a[0] - nx * (w + Math.max(0, n2)), a[1] - ny * (w + Math.max(0, n2))]);
      }
      fctx.beginPath(); fctx.moveTo(L[0][0], L[0][1]); L.forEach(function (q) { fctx.lineTo(q[0], q[1]); }); for (var j = Rr.length - 1; j >= 0; j--) fctx.lineTo(Rr[j][0], Rr[j][1]); fctx.closePath();
    }
    var tl = C[C.length - 1];
    function g(c1, c2) { var gr = fctx.createLinearGradient(head[0], head[1], tl[0], tl[1]); gr.addColorStop(0, c1); gr.addColorStop(1, c2); return gr; }
    function tile(path) { var rr = IS * 0.22; fctx.beginPath(); fctx.moveTo(ix + rr, iy); fctx.arcTo(ix + IS, iy, ix + IS, iy + IS, rr); fctx.arcTo(ix + IS, iy + IS, ix, iy + IS, rr); fctx.arcTo(ix, iy + IS, ix, iy, rr); fctx.arcTo(ix, iy, ix + IS, iy, rr); fctx.closePath(); }
    // the tile gathers behind the ball as it comes in: a soft blue glow first, then the framed tile, then the painted icon
    var tileA = ss(0.8, 0.9, u), paintA = ss(0.86, 0.96, u);   // ball arrives, then the logo loads around it
    if (tileA > 0) {
      fctx.save(); fctx.globalAlpha = tileA;
      fctx.shadowColor = 'rgba(0,0,0,.5)'; fctx.shadowBlur = 40 * tileA; fctx.shadowOffsetY = 14 * tileA; tile();
      var gr = fctx.createRadialGradient(ix + IS * 0.72, iy + IS * 0.28, IS * 0.05, ix + IS * 0.5, iy + IS * 0.55, IS * 0.85);
      gr.addColorStop(0, '#2f7ff0'); gr.addColorStop(0.45, '#1450c0'); gr.addColorStop(1, '#06246e'); fctx.fillStyle = gr; fctx.fill();
      fctx.shadowColor = 'transparent'; fctx.lineWidth = IS * 0.03 * ss(0.6, 1, tileA); fctx.strokeStyle = '#ffc93a'; if (fctx.lineWidth > 0.3) fctx.stroke();
      if (paintA > 0 && icon.complete && icon.naturalWidth) { fctx.globalAlpha = tileA * paintA; fctx.clip(); var pd = IS * 0.03; fctx.drawImage(icon, ix + pd, iy + pd, IS - 2 * pd, IS - 2 * pd); }
      fctx.restore();
      if (paintA > 0) { fctx.save(); fctx.globalAlpha = tileA; tile(); fctx.lineWidth = IS * 0.03; fctx.strokeStyle = '#ffc93a'; fctx.stroke(); fctx.restore(); }
    }
    var flyA = 1 - paintA;
    if (flyA > 0) {
      fctx.globalAlpha = flyA;
      fctx.save(); fctx.shadowColor = 'rgba(255,110,20,.9)'; fctx.shadowBlur = 16 + 8 * near; ribbon(1.0, 0.5 + 0.5 * near); fctx.fillStyle = g('rgba(255,96,16,1)', 'rgba(235,60,10,' + (0.5 * near) + ')'); fctx.fill(); fctx.restore();
      ribbon(0.7, 0.3 + 0.3 * near); fctx.fillStyle = g('rgba(255,196,44,1)', 'rgba(255,150,25,' + (0.5 * near) + ')'); fctx.fill();
      ribbon(0.32, 0.08); fctx.fillStyle = g('rgba(255,253,228,1)', 'rgba(255,236,150,' + (0.7 * near) + ')'); fctx.fill();
      if (near > 0) {   // the bright spark at the tail of the icon's flame
        var sp = r * 0.9 * near, tx = tl[0], ty = tl[1]; fctx.save(); fctx.globalAlpha = flyA * near; fctx.shadowColor = 'rgba(255,200,80,1)'; fctx.shadowBlur = sp; fctx.fillStyle = '#fff3c4'; fctx.beginPath();
        for (var i = 0; i < 16; i++) { var an = i * Math.PI / 8 + 0.3, rr = i % 2 ? sp * 0.18 : sp * (i % 4 ? 0.6 : 1); fctx.lineTo(tx + Math.cos(an) * rr, ty + Math.sin(an) * rr); } fctx.fill(); fctx.restore(); }
      var hitK = dist < L1 - cr.width * 0.03 ? 0 : Math.max(0, 1 - Math.abs(dist - L1) / (cr.width * 0.22));
      if (hitK > 0) {   // impact flash where the ball meets the side of the phone
        fctx.save(); fctx.globalAlpha = flyA * hitK; fctx.translate(0, imp[1]);
        fctx.fillStyle = '#fff6d6'; fctx.shadowColor = 'rgba(255,220,120,1)'; fctx.shadowBlur = 24; fctx.beginPath();
        for (var i = 0; i < 20; i++) { var an = i * Math.PI / 10, rr = (i % 2 ? 0.25 : (i % 4 ? 0.7 : 1)) * base * 5.5 * (0.6 + 0.4 * hitK); fctx.lineTo(Math.cos(an) * rr * 0.6, Math.sin(an) * rr); } fctx.fill();
        fctx.strokeStyle = 'rgba(255,255,255,.8)'; fctx.lineWidth = 2; fctx.beginPath(); fctx.arc(0, 0, base * 7 * (1.3 - hitK), 0, 7); fctx.stroke(); fctx.restore();
      }
      var spin = Math.PI * 2 * 5 * (1 - Math.pow(1 - x, 2.2));                    // spins down and settles seam-on, just like the icon
      if (ball.complete && ball.naturalWidth) { fctx.save(); fctx.shadowColor = 'rgba(255,170,60,.85)'; fctx.shadowBlur = r * 0.8; fctx.translate(head[0], head[1]); var sq = 1 - 0.3 * hitK; fctx.scale(sq, 1 / sq); fctx.rotate(spin); fctx.drawImage(ball, -r, -r, r * 2, r * 2); fctx.restore(); }
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
