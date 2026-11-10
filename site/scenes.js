// Two more scroll scenes: the kit bag (info cards pop out of the bag) and the road of postcards (beach to moon).
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ss(a, b, x) { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
  function back(x) { var c = 1.9; x = Math.min(1, Math.max(0, x)); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }   // ease-out with a little overshoot
  function prog(sec) { var r = sec.getBoundingClientRect(), t = sec.offsetHeight - innerHeight; return Math.min(1, Math.max(0, -r.top / t)); }
  var scenes = [];

  // ── The kit bag ──
  var bag = document.getElementById('bagScene');
  if (bag) {
    var panel = bag.querySelector('.panel'), cards = [].slice.call(bag.querySelectorAll('.kc')), burst = bag.querySelector('.burst'), head = bag.querySelector('.sceneHead');
    var SLOTS = [[0.2, 0.235], [0.4, 0.235], [0.6, 0.235], [0.8, 0.235], [0.3, 0.41], [0.5, 0.41], [0.7, 0.41]];
    if (reduce) bag.classList.add('still');
    scenes.push(function () {
      if (reduce) return;
      var p = prog(bag), W = panel.clientWidth, H = panel.clientHeight, n = cards.length, mouth = [0.5 * W, 0.62 * H];
      var cw = cards[0].offsetWidth, big = Math.min(1, (W * 0.54) / cw), small = (W * 0.19) / cw;
      var lastPop = -1;
      cards.forEach(function (c, i) {
        var a = 0.06 + i * (0.86 / n), s = (p - a) / (0.86 / n);            // this card's turn
        var st = SLOTS[i], sx = st[0] * W, sy = st[1] * H, cx = 0.5 * W, cy = 0.53 * H, x, y, k, rot, o = 1;
        if (s <= 0) { c.style.opacity = 0; c.style.transform = 'translate(' + (mouth[0] - cw / 2) + 'px,' + (mouth[1]) + 'px) scale(.1)'; return; }
        var up = back(s / 0.32), fly = ss(0.68, 1, s);
        if (s < 0.68) { x = mouth[0] + (cx - mouth[0]) * Math.min(1, s / 0.32); y = mouth[1] + (cy - mouth[1]) * Math.min(1.08, up); k = 0.12 + (big - 0.12) * up; rot = (1 - Math.min(1, up)) * (i % 2 ? 14 : -14); o = Math.min(1, s / 0.08); lastPop = i; }
        else { x = cx + (sx - cx) * fly; y = cy + (sy - cy) * fly; k = big + (small - big) * fly; rot = (1 - fly) * 0 + fly * ((i % 3) - 1) * 4; }
        c.style.opacity = o; c.style.zIndex = s < 0.68 ? 20 : 10 + i;
        c.style.transform = 'translate(' + (x - cw / 2) + 'px,' + (y - c.offsetHeight / 2) + 'px) rotate(' + rot + 'deg) scale(' + k + ')';
        c.classList.toggle('big', s < 0.8);
      });
      // gold burst out of the bag mouth each time a card pops
      var b = 0; cards.forEach(function (c, i) { var a = 0.06 + i * (0.86 / n), s = (p - a) / (0.86 / n); if (s > 0 && s < 0.35) b = Math.max(b, 1 - s / 0.35); });
      burst.style.opacity = b; burst.style.transform = 'translate(-50%,-50%) scale(' + (0.6 + 0.8 * (1 - b)) + ') rotate(' + (p * 400) + 'deg)';
      head.classList.toggle('on', p < 0.97);
    });
  }

  // ── The road of postcards ──
  var road = document.getElementById('roadScene');
  if (road) {
    var rp = road.querySelector('.panel'), world = road.querySelector('.world'), pcs = [].slice.call(road.querySelectorAll('.pc')), count = road.querySelector('.count b'), more = road.querySelector('.more');
    if (reduce) road.classList.add('still');
    scenes.push(function () {
      if (reduce) return;
      var p = prog(road), H = rp.clientHeight, WH = world.offsetHeight, n = pcs.length;
      var pan = ss(0.0, 0.9, p);
      world.style.transform = 'translateY(' + (-(WH - H) * (1 - pan)) + 'px)';
      var shown = 0, off = (WH - H) * (1 - pan);
      pcs.forEach(function (c, i) {
        var y = parseFloat(c.style.top) / 100 * WH - off, s = Math.min((y - 0.08 * H) / (0.14 * H), (p - 0.022 * i) / 0.03), k = back(s), r = +c.dataset.r;   // pops as it comes into view
        if (s <= 0) { c.style.opacity = 0; c.style.transform = 'translate(-50%,-50%) scale(.2) rotate(' + (r * 3) + 'deg)'; return; }
        shown++;
        c.style.opacity = Math.min(1, s * 3);
        c.style.transform = 'translate(-50%,-50%) scale(' + (0.2 + 0.8 * k) + ') rotate(' + (r * (3 - 2 * Math.min(1, k))) + 'deg)';
      });
      count.textContent = shown;
      more.classList.toggle('on', p > 0.9);
    });
  }

  if (!scenes.length) return;
  var ticking = false;
  function run() { ticking = false; scenes.forEach(function (f) { f(); }); }
  function on() { if (!ticking) { ticking = true; requestAnimationFrame(run); } }
  addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); addEventListener('load', on); on();
})();
