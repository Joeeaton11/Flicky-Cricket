// Scroll story: one delivery, sixteen grounds. The phone stays pinned while the page scrolls;
// scroll position picks the frame, and the ground changes every few frames.
(function () {
  var sec = document.getElementById('story'); if (!sec) return;
  var cfg = window.STORY, N = cfg.frames, cv = sec.querySelector('canvas.screen'), ctx = cv.getContext('2d');
  var bg = sec.querySelector('.storyBg'), lab = sec.querySelector('.ground b'), caps = [].slice.call(sec.querySelectorAll('.cap'));
  var imgs = new Array(N), cur = -1, want = 0, ticking = false;
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
  function progress() {
    var r = sec.getBoundingClientRect(), total = sec.offsetHeight - innerHeight;
    return Math.min(1, Math.max(0, -r.top / total));
  }
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; want = Math.round(progress() * (N - 1)); draw(want); }); }
  if (reduce) { sec.classList.add('still'); load(cfg.hero); var im = imgs[cfg.hero]; im.onload = function () { want = cfg.hero; draw(cfg.hero); }; return; }
  // first scenes straight away, then the rest in order once the story is near
  for (var i = 0; i < Math.min(N, 14); i++) load(i);
  var started = false;
  function rest() { if (started) return; started = true; var i = 14; (function next() { var n = 0; while (i < N && n < 6) { load(i++); n++; } if (i < N) setTimeout(next, 60); })(); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { if (e[0].isIntersecting) rest(); }, { rootMargin: '150% 0px' }).observe(sec); else rest();
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();
})();
