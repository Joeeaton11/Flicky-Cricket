// Scroll story: one delivery, twenty-four grounds. The phone stays pinned while the page scrolls;
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
    // timeline (scroll progress): contact frame -> bat comes through -> ball out to the wall -> bounce -> logo
    var pHit = FEND * cfg.hit / (N - 1), pBat = FEND * (cfg.hit + 2.5) / (N - 1), pWall = pBat + 0.05, pArr = 0.9;
    var after = ss(pWall, pArr, p);
    phoneEl.style.opacity = groundEl.style.opacity = String(1 - after);
    endEl.classList.toggle('on', p > 0.955); sec.classList.toggle('ending', p > pWall);
    if (p < pHit) { lastD = 0; return; }
    var sr = stick.getBoundingClientRect(), pr = phoneEl.getBoundingClientRect(), cr = cv.getBoundingClientRect(), ox = sr.left, oy = sr.top;
    var IS = Math.min(W * 0.62, pr.height * 0.42, 300), ix = pr.left - ox + pr.width / 2 - IS / 2, iy = pr.top - oy + pr.height * 0.40 - IS / 2;
    endEl.style.top = (iy + IS + 18) + 'px';
    var br = IS * 0.177, base = Math.max(3, cr.width * 0.022);
    var C = cfg.contact || [0.5, 0.607];
    var c0 = [cr.left - ox + cr.width * C[0], cr.top - oy + cr.height * C[1], base];              // where the ball was when he swung
    var bat = [c0[0] - cr.width * 0.035, c0[1] + cr.height * 0.012, base * 1.1];                   // meets the bat
    var edge = [cr.left - ox - base, bat[1] - cr.height * 0.05, base * 2];                          // leaves the game screen
    var wall = [base * 3, edge[1] - cr.height * 0.035, base * 3];                                    // smack: the side of your screen
    var logo = [ix + IS * 0.74, iy + IS * 0.275, br];
    var pos, seg, segD, hitK = 0, spin = 0;
    function lerp3(A, B, t) { return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; }
    function seg1(t) { var a = lerp3(bat, edge, Math.min(1, t / 0.5)); return t <= 0.5 ? a : lerp3(edge, wall, (t - 0.5) / 0.5); }
    if (p < pBat) { pos = lerp3(c0, bat, ss(pHit, pBat, p)); seg = 0; }
    else if (p < pWall) { var t = (p - pBat) / (pWall - pBat); pos = seg1(t); seg = 1; segD = t; }
    else { var t = 1 - Math.pow(1 - ss(pWall, pArr, p), 2.2); pos = lerp3(wall, logo, t); seg = 2; segD = t; hitK = Math.max(0, 1 - (p - pWall) / 0.025); }
    if (lastD < 2 && seg === 2) { stick.classList.remove('shudder'); void stick.offsetWidth; stick.classList.add('shudder'); try { navigator.vibrate && navigator.vibrate([40, 30, 25]); } catch (e) {} }
    lastD = seg;
    // trail: a tidy tapered comet behind the ball on the current leg of its journey
    var trail = [], K = 22;
    if (seg > 0) {
      var len = seg === 1 ? 0.55 : 0.32, from = Math.max(0, segD - len * Math.min(1, segD / len + 0.15));
      for (var k = 0; k <= K; k++) { var tt = segD - (segD - from) * k / K; trail.push(seg === 1 ? seg1(tt) : lerp3(wall, logo, 1 - Math.pow(1 - tt, 1))); }
    }
    var paintA = ss(0.935, 0.985, p), tileA = ss(pArr - 0.015, 0.95, p), flyA = 1 - paintA;
    function tile() { var rr = IS * 0.22; fctx.beginPath(); fctx.moveTo(ix + rr, iy); fctx.arcTo(ix + IS, iy, ix + IS, iy + IS, rr); fctx.arcTo(ix + IS, iy + IS, ix, iy + IS, rr); fctx.arcTo(ix, iy + IS, ix, iy, rr); fctx.arcTo(ix, iy, ix + IS, iy, rr); fctx.closePath(); }
    if (tileA > 0) {   // the logo loads around the ball
      fctx.save(); fctx.globalAlpha = tileA; fctx.shadowColor = 'rgba(0,0,0,.5)'; fctx.shadowBlur = 40 * tileA; fctx.shadowOffsetY = 14 * tileA; tile();
      var gr = fctx.createRadialGradient(ix + IS * 0.72, iy + IS * 0.28, IS * 0.05, ix + IS * 0.5, iy + IS * 0.55, IS * 0.85);
      gr.addColorStop(0, '#2f7ff0'); gr.addColorStop(0.45, '#1450c0'); gr.addColorStop(1, '#06246e'); fctx.fillStyle = gr; fctx.fill();
      fctx.shadowColor = 'transparent'; fctx.lineWidth = IS * 0.03; fctx.strokeStyle = '#ffc93a'; fctx.stroke();
      if (paintA > 0 && icon.complete && icon.naturalWidth) { fctx.globalAlpha = tileA * paintA; fctx.clip(); var pd = IS * 0.03; fctx.drawImage(icon, ix + pd, iy + pd, IS - 2 * pd, IS - 2 * pd); }
      fctx.restore();
      if (paintA > 0) { fctx.save(); tile(); fctx.lineWidth = IS * 0.03; fctx.strokeStyle = '#ffc93a'; fctx.stroke(); fctx.restore(); }
    }
    if (flyA <= 0) return;
    fctx.globalAlpha = flyA;
    var r = pos[2];
    if (trail.length > 2) {
      var hd = trail[0], tl = trail[trail.length - 1];
      var layer = function (scale, c1, c2, glow) {
        var L = [], Rr = [];
        for (var k = 0; k < trail.length; k++) {
          var a = trail[k], b = trail[Math.min(trail.length - 1, k + 1)], a0 = trail[Math.max(0, k - 1)];
          var dx = a0[0] - b[0], dy = a0[1] - b[1], m = Math.hypot(dx, dy) || 1, nx = -dy / m, ny = dx / m, f = k / K;
          var w = r * scale * Math.pow(1 - f, 1.1) * (1 + 0.12 * Math.sin(f * 9));        // smooth taper with a gentle flame swell
          L.push([a[0] + nx * w, a[1] + ny * w]); Rr.push([a[0] - nx * w, a[1] - ny * w]);
        }
        fctx.beginPath(); fctx.moveTo(L[0][0], L[0][1]);
        for (var i = 1; i < L.length; i++) fctx.lineTo(L[i][0], L[i][1]);
        for (var j = Rr.length - 1; j >= 0; j--) fctx.lineTo(Rr[j][0], Rr[j][1]); fctx.closePath();
        var g = fctx.createLinearGradient(hd[0], hd[1], tl[0], tl[1]); g.addColorStop(0, c1); g.addColorStop(1, c2);
        fctx.save(); if (glow) { fctx.shadowColor = 'rgba(255,120,30,.85)'; fctx.shadowBlur = r * 1.4; } fctx.fillStyle = g; fctx.fill(); fctx.restore();
      };
      layer(0.95, 'rgba(255,104,20,.95)', 'rgba(255,80,10,0)', true);
      layer(0.66, 'rgba(255,196,44,1)', 'rgba(255,160,30,0)');
      layer(0.3, 'rgba(255,252,226,1)', 'rgba(255,236,160,0)');
    }
    if (hitK > 0) {   // impact at the side of the screen: flash and a few speed lines
      fctx.save(); fctx.globalAlpha = flyA * hitK; fctx.translate(0, wall[1]);
      var gl = fctx.createRadialGradient(0, 0, 0, 0, 0, base * 9); gl.addColorStop(0, 'rgba(255,255,240,1)'); gl.addColorStop(0.35, 'rgba(255,214,110,.8)'); gl.addColorStop(1, 'rgba(255,180,60,0)');
      fctx.fillStyle = gl; fctx.beginPath(); fctx.ellipse(0, 0, base * 5, base * 9, 0, 0, 7); fctx.fill();
      fctx.strokeStyle = 'rgba(255,255,255,.9)'; fctx.lineWidth = 2.5; fctx.lineCap = 'round';
      for (var i = -2; i <= 2; i++) { var an = i * 0.38, l0 = base * 4.5, l1 = base * (7.5 + (1 - hitK) * 3); fctx.beginPath(); fctx.moveTo(Math.cos(an) * l0, Math.sin(an) * l0); fctx.lineTo(Math.cos(an) * l1, Math.sin(an) * l1); fctx.stroke(); }
      fctx.restore();
    }
    if (ball.complete && ball.naturalWidth) {
      var gg = seg === 0 ? 0 : seg === 1 ? segD * 0.4 : 0.4 + 0.6 * segD; spin = Math.PI * 12 * (1 - Math.pow(1 - gg, 2));   // spins down to a stop seam-on at the logo
      var sq = 1 - 0.32 * hitK;
      fctx.save(); fctx.shadowColor = 'rgba(255,170,60,.8)'; fctx.shadowBlur = seg ? r * 0.9 : 0; fctx.translate(pos[0] - (1 - sq) * r, pos[1]); fctx.scale(sq, 1 / sq); fctx.rotate(spin); fctx.drawImage(ball, -r, -r, r * 2, r * 2); fctx.restore();
    }
    fctx.globalAlpha = 1;
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
