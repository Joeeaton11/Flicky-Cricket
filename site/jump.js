// Scrolling back UP through the scroll scenes (the delivery, the kit bag, the road) used to replay them frame by
// frame. Scrolling up inside a scene jumps to the top of that scene; up again from there jumps to the scene before
// it, and from the first scene back home. Scrolling down is unchanged.
// Nov 20 (Joe, iPhone: "still scrolls scrolls scrolls"): on iPhones a swipe that starts while the page is still gliding
// can't be stopped, so the jump also happens when the finger lifts, and the glide is cut off first.
(function () {
  var scenes = ['story', 'bagScene', 'roadScene'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if (!scenes.length) return;
  var busy = 0;
  function top(el) { return el.getBoundingClientRect().top + window.pageYOffset; }
  function target(at) {   // where an upward scroll should go, or null to scroll normally
    var y = at == null ? window.pageYOffset : at, H = window.innerHeight;
    for (var i = scenes.length - 1; i >= 0; i--) {
      var s = scenes[i], t = top(s), b = t + s.offsetHeight;
      if (y > t + 40 && y < b - H * 0.15) return t;                        // inside a scene: back to its start
      if (Math.abs(y - t) <= 40) return i ? top(scenes[i - 1]) : 0;        // at a scene's start: the one before, or home
      if (y >= b - H * 0.15 && y < b + H * 0.6) return t;                 // just below a scene: skip back over it
    }
    return null;
  }
  function jump(t, smooth) {
    busy = Date.now() + 900;
    var de = document.documentElement, b = document.body, o1 = de.style.overflow, o2 = b.style.overflow;
    de.style.overflow = 'hidden'; b.style.overflow = 'hidden';          // stops an iPhone's glide dead
    window.scrollTo(0, t);
    setTimeout(function () { window.scrollTo(0, t); de.style.overflow = o1; b.style.overflow = o2;
      if (smooth === false) return; window.scrollTo(0, t); }, 60);
  }
  function go(e) {
    if (busy > Date.now()) { if (e && e.cancelable) e.preventDefault(); return true; }
    var t = target(); if (t == null) return false;
    if (e && e.cancelable) e.preventDefault();
    jump(t); return true;
  }
  addEventListener('wheel', function (e) { if (e.deltaY < -2) go(e); }, { passive: false });
  addEventListener('keydown', function (e) { if (e.key === 'ArrowUp' || e.key === 'PageUp') go(e); });
  // touch: decide on the first finger movement; if the browser won't let us stop its scroll, jump when the finger lifts
  var y0 = null, ys = 0, decided = false, hold = false, pending = false;
  addEventListener('touchstart', function (e) { y0 = e.touches[0].clientY; ys = window.pageYOffset; decided = false; hold = false; pending = false; }, { passive: true });
  addEventListener('touchmove', function (e) {
    if (y0 == null) return;
    if (hold) { if (e.cancelable) e.preventDefault(); return; }
    var dy = e.touches[0].clientY - y0;
    if (!decided) { if (Math.abs(dy) < 3) return; decided = true;
      if (dy > 0 && target(ys) != null) { if (e.cancelable) { hold = true; go(e); } else pending = true; } return; }
    if (pending && dy < -10) pending = false;   // changed their mind and swiped back down the page
  }, { passive: false });
  addEventListener('touchend', function () { if (pending && busy < Date.now()) { var t = target(ys); if (t != null) jump(t); } y0 = null; hold = false; pending = false; }, { passive: true });
})();
