// Scrolling back UP through the scroll scenes (the delivery, the kit bag, the road) used to replay them frame by
// frame. Nov 19 (player feedback): scrolling up inside a scene jumps to the top of that scene; up again from there
// jumps to the scene before it, and from the first scene back home. Scrolling down is unchanged.
(function () {
  var scenes = ['story', 'bagScene', 'roadScene'].map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if (!scenes.length) return;
  var busy = 0, touchY = null;
  function top(el) { return el.getBoundingClientRect().top + scrollY; }
  function target() {   // where an upward scroll should go, or null to scroll normally
    var y = scrollY, H = innerHeight;
    for (var i = scenes.length - 1; i >= 0; i--) {
      var s = scenes[i], t = top(s), b = t + s.offsetHeight;
      if (y > t + 8 && y < b - H * 0.15) return t;                        // inside a scene: back to its start
      if (Math.abs(y - t) <= 8) return i ? top(scenes[i - 1]) : 0;        // at a scene's start: the one before, or home
      if (y >= b - H * 0.15 && y < b + H * 0.6) return t;                 // just below a scene: skip back over it
    }
    return null;
  }
  function go(e) {
    if (busy > Date.now()) { if (e.cancelable) e.preventDefault(); return; }
    var t = target(); if (t == null) return;
    if (e.cancelable) e.preventDefault();
    busy = Date.now() + 900;
    window.scrollTo({ top: t, behavior: 'smooth' });
  }
  addEventListener('wheel', function (e) { if (e.deltaY < -2) go(e); }, { passive: false });
  // Nov 20 (Joe, iPhone: still swiping back frame by frame): phones decide on the very first finger movement, while the
  // browser still lets us cancel its own scroll (after that iOS ignores preventDefault and its momentum wins)
  var decided = false, hold = false;
  addEventListener('touchstart', function (e) { touchY = e.touches[0].clientY; decided = false; hold = false; }, { passive: true });
  addEventListener('touchmove', function (e) {
    if (touchY == null) return;
    if (hold) { if (e.cancelable) e.preventDefault(); return; }   // keep the page still until the finger lifts
    if (decided) return;
    var dy = e.touches[0].clientY - touchY;
    if (Math.abs(dy) < 3) return;
    decided = true;
    if (dy > 0 && target() != null && e.cancelable) { hold = true; go(e); }
  }, { passive: false });
  addEventListener('touchend', function () { touchY = null; hold = false; }, { passive: true });
  addEventListener('keydown', function (e) { if (e.key === 'ArrowUp' || e.key === 'PageUp') go(e); });
})();
