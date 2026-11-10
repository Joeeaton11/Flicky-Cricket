// Two more scroll scenes: the kit bag (info cards pop out of the bag) and the road of postcards (beach to moon).
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ss(a, b, x) { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
  function back(x) { var c = 1.9; x = Math.min(1, Math.max(0, x)); return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }   // ease-out with a little overshoot
  function prog(sec) { var r = sec.getBoundingClientRect(), t = sec.offsetHeight - innerHeight; return Math.min(1, Math.max(0, -r.top / t)); }
  var scenes = [];

  // ── The kit bag: the same bag opening as in the game. Two bumps, a crouch, POP, then every scroll
  //    the bag hops and spits out a card, which rises to the middle and then settles in a slot. ──
  var bag = document.getElementById('bagScene');
  if (bag) {
    var panel = bag.querySelector('.panel'), cards = [].slice.call(bag.querySelectorAll('.kc')), head = bag.querySelector('.sceneHead');
    var bw = bag.querySelector('.bagWrap'), pop = bag.querySelector('.bagPop'), fl = pop.querySelector('.flash'), rays = [].slice.call(pop.querySelectorAll('.rays')),
        rings = [].slice.call(pop.querySelectorAll('.ring')), bits = [].slice.call(pop.querySelectorAll('.bits b'));
    var sideNow = bag.querySelector('.side.l .now'), sideN = bag.querySelector('.side.r .n'), sideList = bag.querySelector('.side.r .got'), sideKey = '';
    var SLOTS = [[0.23, 0.2], [0.5, 0.2], [0.77, 0.2], [0.36, 0.37], [0.64, 0.37]];
    var lg = bag.querySelector('.legGlow'), OPEN = 0.17, C0 = 0.2, CS = 0.78 / 5.8, LEG = CS * 0.8;   // the last (legendary) card gets a slow build-up first
    var START = cards.map(function (c, i) { return C0 + i * CS + (i === cards.length - 1 ? LEG : 0); });
    if (reduce) {   // still layout: bag open, all seven cards laid out above it
      bag.classList.add('still'); bw.classList.add('isOpen');
      var lay = function () { var W = panel.clientWidth, H = panel.clientHeight, cw = cards[0].offsetWidth, k = (W * 0.24) / cw;
        cards.forEach(function (c, i) { var x = SLOTS[i][0] * W, y = SLOTS[i][1] * H; c.style.opacity = 1; c.style.transform = 'translate(' + (x - cw / 2) + 'px,' + (y - c.offsetHeight / 2) + 'px) scale(' + k + ')'; });
        head.classList.add('on'); };
      lay(); addEventListener('resize', lay); addEventListener('load', lay);
    }
    function bump(u, h, tilt) {   // the game's bump: squat, up and over, land squash  -> [y, sx, rot]
      if (u <= 0 || u >= 1) return null; var e = function (k) { return Math.sin(Math.PI * k); };
      if (u < 0.18) return [0, 1 + 0.1 * Math.sin(Math.PI / 2 * u / 0.18), 0];
      if (u < 0.82) { var k = (u - 0.18) / 0.64; return [-e(k) * h, 1 - 0.06 * e(k), tilt * e(k)]; }
      return [0, 1 + 0.12 * e((u - 0.82) / 0.18), 0];
    }
    function hop(u) {             // the game's bagHop keyframes as a function of u
      var K = [[0, 0, 1, 1, 0], [0.14, 0, 1.12, 0.84, 0], [0.34, -34, 0.92, 1.1, -5], [0.5, -38, 1, 1, 4], [0.68, 0, 1.1, 0.88, -2], [0.82, 0, 0.97, 1.04, 1], [1, 0, 1, 1, 0]];
      if (u <= 0 || u >= 1) return null; for (var i = 1; i < K.length; i++) if (u <= K[i][0]) { var A = K[i - 1], B = K[i], f = (u - A[0]) / (B[0] - A[0]); f = f * f * (3 - 2 * f);
        return [A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f, A[3] + (B[3] - A[3]) * f, A[4] + (B[4] - A[4]) * f]; }
    }
    function burst(s, big) {      // flash, spinning rays, shock rings and confetti, driven by s (0..1)
      if (s <= 0 || s >= 1) { pop.style.opacity = 0; return; } pop.style.opacity = 1;
      fl.style.opacity = (big ? 0.95 : 0.6) * (1 - ss(0, 0.45, s)); fl.style.transform = 'translate(-50%,-50%) scale(' + (big ? 0.4 + 0.8 * ss(0, 0.3, s) : 0.25 + 0.3 * s) + ')';
      rays.forEach(function (r, i) { r.style.opacity = big ? (i ? 0.5 : 0.85) * (1 - ss(0.4, 1, s)) * ss(0, 0.1, s) : 0; r.style.transform = 'translate(-50%,-50%) scale(' + (0.3 + 0.9 * ss(0, 0.5, s)) + ') rotate(' + ((i ? -1 : 1) * s * 90) + 'deg)'; });
      rings.forEach(function (r, i) { var q = ss(0.04 * i, (big ? 0.5 : 0.35) + 0.05 * i, s); r.style.opacity = (1 - q) * (q > 0 ? 1 : 0); r.style.transform = 'translate(-50%,-50%) scale(' + (1 + q * (big ? 7 : 4)) + ')'; });
      bits.forEach(function (bt, i) { var a = -Math.PI / 2 + ((i * 0.61) % 1 - 0.5) * Math.PI * 1.7, sp = (big ? 160 : 100) + (i * 37 % 7) * (big ? 30 : 16), q = ss(0, 0.8, s);
        bt.style.opacity = s < 0.85 ? 1 : (1 - s) / 0.15; bt.style.transform = 'translate(' + Math.cos(a) * sp * q + 'px,' + (Math.sin(a) * sp * q + 220 * q * q) + 'px) rotate(' + (i * 97 * q) + 'deg) scale(' + (0.6 + (i % 4) * 0.25) + ')'; });
    }
    scenes.push(function () {
      if (reduce) return;
      var p = prog(bag), W = panel.clientWidth, H = panel.clientHeight, n = cards.length;
      var cw = cards[0].offsetWidth, big = Math.min(1, (W * 0.54) / cw), small = (W * 0.24) / cw, mouth = [0.5 * W, 0.63 * H];
      // the bag: bump, bump, crouch, POP open; then a hop for every card
      var y = 0, sx = 1, sy = 1, rot = 0, r;
      if (p < OPEN) { var t = p / OPEN * 1.5;
        if ((r = bump((t - 0.18) / 0.42, 16, -3)) || (r = bump((t - 0.72) / 0.46, 24, 3.5))) { y = r[0]; sx = r[1]; sy = 2 - r[1]; rot = r[2]; }
        else if (t > 1.24) { sx = 1 + 0.14 * Math.sin(Math.PI / 2 * (t - 1.24) / 0.26); sy = 2 - sx; } }
      else if (p < OPEN + 0.04) { var k = (p - OPEN) / 0.04; sx = k < 0.45 ? 0.82 + (1.12 - 0.82) * k / 0.45 : 1.12 - 0.12 * (k - 0.45) / 0.55; sy = k < 0.45 ? 1.12 - 0.22 * k / 0.45 : 0.9 + 0.1 * (k - 0.45) / 0.55; }   // lid pop
      else for (var i = 0; i < n; i++) { var hh = hop(((p - START[i]) / CS) / 0.3); if (hh) { y = hh[0]; sx = hh[1]; sy = hh[2]; rot = hh[3]; } }
      // legendary build-up before the last card: the bag rattles faster and faster and glows gold
      var lb = (p - (START[n - 1] - LEG)) / LEG, gl = 0;
      if (lb > 0 && lb < 1.25) { var e = Math.min(1, lb); gl = lb < 1 ? e : 1 - (lb - 1) / 0.25;
        if (lb < 1) { rot = Math.sin(lb * lb * 60) * 5 * e; y = -Math.abs(Math.sin(lb * lb * 60)) * 6 * e; sx = 1 + 0.05 * e; sy = 1 - 0.04 * e; } }
      lg.style.opacity = gl; lg.style.transform = 'translate(-50%,-50%) scale(' + (0.6 + 0.6 * gl) + ')';
      bw.classList.toggle('isOpen', p >= OPEN);
      bw.style.transform = 'translate(-50%,-92%) translateY(' + y + 'px) rotate(' + rot + 'deg) scale(' + sx + ',' + sy + ')';
      // bursts: a big one when it opens, a small one with every card
      var bs = (p - OPEN) / 0.07, isBig = true;
      if (bs >= 1 || bs <= 0) { isBig = false; bs = -1; for (var i = 0; i < n; i++) { var q = ((p - START[i]) / CS - 0.12) / (i === n - 1 ? 0.6 : 0.3); if (q > 0 && q < 1) { bs = q; isBig = i === n - 1; } } }
      burst(bs, isBig);
      cards.forEach(function (c, i) {
        var s = (p - START[i]) / CS - 0.12;                                     // launches just as the bag lands its hop
        c.classList.toggle('leg', i === n - 1 && s > 0);
        var st = SLOTS[i], sx2 = st[0] * W, sy2 = st[1] * H, cx = 0.5 * W, cy = 0.5 * H, x, y2, k, rt, o = 1;
        if (s <= 0) { c.style.opacity = 0; return; }
        var up = back(s / 0.3), fly = ss(0.66, 0.98, s);
        if (s < 0.66) { x = cx; y2 = mouth[1] + (cy - mouth[1]) * Math.min(1.08, up); k = 0.12 + (big - 0.12) * up; rt = (1 - Math.min(1, up)) * (i % 2 ? 14 : -14); o = Math.min(1, s / 0.06); }
        else { x = cx + (sx2 - cx) * fly; y2 = cy + (sy2 - cy) * fly; k = big + (small - big) * fly; rt = fly * ((i % 3) - 1) * 4; }
        c.style.opacity = o; c.style.zIndex = s < 0.66 ? 20 : 10 + i;
        c.style.transform = 'translate(' + (x - cw / 2) + 'px,' + (y2 - c.offsetHeight / 2) + 'px) rotate(' + rt + 'deg) scale(' + k + ')';
        c.classList.toggle('big', s < 0.8);
      });
      head.classList.toggle('on', p < C0 + 0.08);
      if (sideNow) { var cur = -1, got = 0; cards.forEach(function (c, i) { var q = (p - START[i]) / CS - 0.12; if (q > 0) { cur = i; if (q > 0.66) got = i + 1; } });
        var key = cur + ':' + got; if (key !== sideKey) { sideKey = key;
          if (cur >= 0) { var c = cards[cur]; sideNow.innerHTML = '<em>' + c.querySelector('em').textContent + '</em><b>' + c.querySelector('b').textContent + '</b><p>' + c.querySelector('small').innerHTML + '</p>'; }
          sideN.textContent = got; sideList.innerHTML = cards.slice(0, got).map(function (c) { return '<li>' + c.querySelector('b').textContent + '</li>'; }).join(''); } }
    });
  }

  // ── The road of postcards ──
  var road = document.getElementById('roadScene');
  if (road) {
    var rp = road.querySelector('.panel'), world = road.querySelector('.world'), pcs = [].slice.call(road.querySelectorAll('.pc')), count = road.querySelector('.count b'), more = road.querySelector('.more');
    var rNow = road.querySelector('.side.r .now b'), rN = road.querySelector('.side.r .n');
    if (reduce) {   // still layout: the whole road from the beach to the moon, every postcard in place
      road.classList.add('still');
      var fit = function () { var H = rp.clientHeight, WH = world.offsetHeight, k = H / WH; world.style.transformOrigin = '50% 0'; world.style.transform = 'scale(' + k + ')';
        pcs.forEach(function (c) { c.style.opacity = 1; c.style.transform = 'translate(-50%,-50%) scale(' + Math.min(2, 0.9 / k) * 0.6 + ') rotate(' + c.dataset.r + 'deg)'; }); count.textContent = pcs.length; more.classList.add('on'); };
      fit(); addEventListener('resize', fit); addEventListener('load', fit);
    }
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
        c.style.transform = 'translate(-50%,-50%) perspective(700px) rotateY(' + (-95 * (1 - Math.min(1, s * 1.15))) + 'deg) scale(' + (0.2 + 0.8 * k) + ') rotate(' + (r * (3 - 2 * Math.min(1, k))) + 'deg)';   // flips over as it lands
      });
      count.textContent = shown;
      if (rNow) { var last = pcs[Math.max(0, shown - 1)].querySelector('b').textContent; if (rNow.textContent !== last) rNow.textContent = last; rN.textContent = shown; }
      more.classList.toggle('on', p > 0.9);
    });
  }

  if (!scenes.length) return;
  var ticking = false;
  function run() { ticking = false; scenes.forEach(function (f) { f(); }); }
  function on() { if (!ticking) { ticking = true; requestAnimationFrame(run); } }
  addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); addEventListener('load', on); on();
})();
