// Small site helpers: the sticky Play bar, and privacy-friendly visitor counts (GoatCounter: no cookies, no personal data).
(function () {
  // ── sticky Play bar: slides in once the top section has scrolled away ──
  var bar = document.getElementById('playBar'), hero = document.querySelector('.hero'), foot = document.querySelector('.getIt');
  function onScroll() {
    if (!bar || !hero) return;
    var past = hero.getBoundingClientRect().bottom < 0, nearEnd = foot && foot.getBoundingClientRect().top < innerHeight;
    bar.classList.toggle('on', past && !nearEnd); bar.setAttribute('aria-hidden', String(!(past && !nearEnd)));
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ── visitor counts ──
  var GC = '';   // GoatCounter site code, e.g. 'flickycricket' — counting stays off until this is set
  if (!GC) return;
  window.goatcounter = { no_onload: false };
  var sc = document.createElement('script'); sc.async = true; sc.src = 'https://gc.zgo.at/count.js'; sc.dataset.goatcounter = 'https://' + GC + '.goatcounter.com/count'; document.head.appendChild(sc);
  function ev(name) { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: name, title: name, event: true }); } catch (e) {} }
  // how far people get: the story, the six, the bag, the road, the end
  var marks = [['story', 'reached-story'], ['bagScene', 'reached-bag'], ['roadScene', 'reached-road']], hit = {};
  addEventListener('scroll', function () {
    marks.forEach(function (m) { var el = document.getElementById(m[0]); if (el && !hit[m[1]] && el.getBoundingClientRect().top < innerHeight * 0.5) { hit[m[1]] = 1; ev(m[1]); } });
    var st = document.getElementById('story'); if (st && !hit.six) { var r = st.getBoundingClientRect(); if (-r.top / (st.offsetHeight - innerHeight) > 0.9) { hit.six = 1; ev('watched-six'); } }
    if (foot && !hit.end && foot.getBoundingClientRect().top < innerHeight) { hit.end = 1; ev('reached-end'); }
  }, { passive: true });
  document.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('[data-ev]'); if (a) ev(a.dataset.ev); });
})();
