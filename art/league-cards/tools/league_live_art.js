// ═══════════════════════════════════════════════════════════════════════════
// LIVE LEAGUE ART — animated card scenes (Tier 1 + Tier 2 rebuilds).
// Each factory paints into a 620×355 canvas and returns { start(), stop() }; only the
// card in the middle of the carousel animates, the rest show a still frame.
// ═══════════════════════════════════════════════════════════════════════════
function makeLeagueArt_gully(cvs) {
  let __running = false, __t0 = 0, __elapsed = 0;
  // Soft fade at the foot of the art so it melts into the card's info panel
  function __fade() {
    const g = ctx.createLinearGradient(0, 355 * 0.78, 0, 355);
    g.addColorStop(0, 'rgba(8,8,18,0)'); g.addColorStop(1, 'rgba(8,8,18,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 355 * 0.78, 620, 355 * 0.22);
  }
  function __frame(ms) { frame(ms); __fade(); }
  const PI = Math.PI;
  const SHOW = 19;                                   // shared schedule for the "moments", seconds
  const CROW_CAWS = [6.0, 13.5];                     // when the crow on the wire caws
  const TURN_SECONDS = 9.8;                          // one full turn of the cup
  // Moments on the shared schedule (seconds into SHOW), spread so something is always just starting:
  // scooter 0.5–4.5 · shutter up 2.5–4.5 · crow 6.0 · chai pour 7.0–9.2 · pigeons 9–12 (back 16) ·
  // kite swoop 11.5–14 · crow 13.5 · stray ball 14.5–17 · shutter down 17.6–18.9
  const SHUTTER_UP = [2.5, 4.5], SHUTTER_DOWN = [17.6, 18.9];
  const POUR = [7.0, 9.2], KITE_SWOOP = [11.5, 14.0], STRAY_BALL = [14.5, 17.0];
  let RICK_CTX = null, KETTLE_SKIP = false;           // rickshaw and kettle are painted separately so they can move

  // ════════ STILL SCENE — a Mumbai gully on a warm, hazy morning ════════
  // part 'back' paints sky → buildings → lane; part 'front' paints the props on a transparent layer.
  function draw(ctxReal, W, H, part) {
    let ctx = part === 'front' ? SCRATCH : ctxReal;
    let seed = 13;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const VX = W * 0.5, VY = H * 0.470;
    function limb(x1, y1, x2, y2, w, col) {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    function glow(x, y, r, col) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    }
    function shade(hex, k) {
      const n = parseInt(hex.slice(1), 16);
      return `rgb(${Math.min(255, Math.round(((n >> 16) & 255) * k))},${Math.min(255, Math.round(((n >> 8) & 255) * k))},${Math.min(255, Math.round((n & 255) * k))})`;
    }

    // ── Sky: soft morning blue warming to a dusty haze at the end of the lane ──
    const sky = ctx.createLinearGradient(0, 0, 0, VY);
    sky.addColorStop(0, '#78b0e0'); sky.addColorStop(0.55, '#b8d6ec'); sky.addColorStop(1, '#f6e2bc');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, VY + 4);
    const sun = ctx.createRadialGradient(W * 0.12, -H * 0.02, 0, W * 0.12, -H * 0.02, W * 0.45);
    sun.addColorStop(0, 'rgba(255,248,220,0.95)'); sun.addColorStop(0.25, 'rgba(255,240,200,0.35)'); sun.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = sun; ctx.fillRect(0, 0, W, VY);

    // ── The far end of the lane: hazy buildings, water tanks, a palm, a temple flag ──
    ctx.fillStyle = '#d8c4a8';
    [[0.36, 0.30, 0.07], [0.43, 0.27, 0.06], [0.49, 0.32, 0.05], [0.54, 0.26, 0.07], [0.60, 0.31, 0.06]].forEach(([x, top, w]) => {
      ctx.fillStyle = rnd() < 0.5 ? '#d6c0a6' : '#cdbcb0'; ctx.fillRect(W * x, H * top, W * w, VY - H * top);
      ctx.fillStyle = 'rgba(120,100,90,0.25)';
      for (let k = 0; k < 6; k++) for (let j = 0; j < 3; j++) if (rnd() < 0.7) ctx.fillRect(W * x + W * w * (j + 0.3) / 3, H * top + 6 + k * 7, 2.5, 3.5);
      ctx.fillStyle = '#9aa0a8'; ctx.fillRect(W * x + W * w * 0.3, H * top - 7, 8, 7);   // black/grey water tank
    });
    // Coconut palm poking above the far roofs
    limb(W * 0.465, VY - H * 0.05, W * 0.475, H * 0.215, 2, '#8a7a5a');
    ctx.fillStyle = '#7a9a5a';
    for (let k = 0; k < 7; k++) { const a = -PI / 2 + (k - 3) * 0.45; ctx.save(); ctx.translate(W * 0.475, H * 0.215); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(10, 0, 11, 2.2, 0, 0, PI * 2); ctx.fill(); ctx.restore(); }
    // Saffron temple flag on a far rooftop
    limb(W * 0.555, H * 0.26, W * 0.555, H * 0.19, 1, '#7a6a5a');
    ctx.fillStyle = '#ff8c1a'; ctx.beginPath(); ctx.moveTo(W * 0.555, H * 0.19); ctx.lineTo(W * 0.585, H * 0.205); ctx.lineTo(W * 0.555, H * 0.22); ctx.closePath(); ctx.fill();
    // Morning haze over the distance
    const hz = ctx.createLinearGradient(0, H * 0.18, 0, VY);
    hz.addColorStop(0, 'rgba(250,236,210,0)'); hz.addColorStop(1, 'rgba(250,236,210,0.55)');
    ctx.fillStyle = hz; ctx.fillRect(W * 0.3, H * 0.18, W * 0.4, VY - H * 0.18);

    // ── The lane: dusty concrete running away to the vanishing point ──
    const road = ctx.createLinearGradient(0, VY, 0, H);
    road.addColorStop(0, '#d8c2a0'); road.addColorStop(0.5, '#b89e7c'); road.addColorStop(1, '#8a7258');
    ctx.fillStyle = road; ctx.fillRect(0, VY, W, H - VY);
    ctx.strokeStyle = 'rgba(80,60,40,0.18)'; ctx.lineWidth = 0.8;
    for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(VX + i * W * 0.012, VY); ctx.lineTo(VX + i * W * 0.14, H); ctx.stroke(); }
    for (let y = VY + 3, st = 3; y < H; y += st, st *= 1.22) { ctx.fillStyle = 'rgba(80,60,40,0.10)'; ctx.fillRect(0, y, W, 0.8); }
    // Puddle catching the sky, and chalk crease marks for the evening match
    ctx.fillStyle = 'rgba(170,205,230,0.55)'; ctx.beginPath(); ctx.ellipse(W * 0.36, H * 0.655, W * 0.050, H * 0.012, 0, 0, PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(W * 0.34, H * 0.652, W * 0.03, 1);
    ctx.strokeStyle = 'rgba(255,255,250,0.55)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(W * 0.43, H * 0.545); ctx.lineTo(W * 0.57, H * 0.545); ctx.stroke();

    // ── Building facades, three rows each side, near to far ──
    function facade(x0, x1, top, bot, col, opts) {
      const w = x1 - x0, h = bot - top, floors = opts.floors, fh = h / floors;
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, shade(col, 1.08)); g.addColorStop(1, shade(col, 0.88));
      ctx.fillStyle = g; ctx.fillRect(x0, top, w, h);
      // Weathering: damp streaks under the ledges
      ctx.fillStyle = 'rgba(60,40,30,0.08)';
      for (let k = 0; k < Math.round(w / 6); k++) if (rnd() < 0.4) ctx.fillRect(x0 + rnd() * w, top + rnd() * h, 1.2 + rnd() * 2, 6 + rnd() * 14);
      for (let f = 0; f < floors; f++) {
        const fy = top + f * fh;
        ctx.fillStyle = shade(col, 0.72); ctx.fillRect(x0, fy + fh - 2, w, 2.5);                      // floor ledge
        ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x0, fy + fh + 0.5, w, 2);
        if (f === floors - 1 && opts.shop) continue;
        const n = opts.cols;
        for (let c = 0; c < n; c++) {
          const ww = w / n * 0.50, wx = x0 + w * (c + 0.5) / n - ww / 2, wy = fy + fh * 0.18, wh = fh * 0.56;
          ctx.fillStyle = '#2a2a34'; ctx.fillRect(wx, wy, ww, wh);
          ctx.fillStyle = 'rgba(150,190,220,0.35)'; ctx.fillRect(wx + 1, wy + 1, ww * 0.4, wh - 2);
          // Wooden shutters, some open
          const sc = opts.shutter;
          if (rnd() < 0.55) { ctx.fillStyle = sc; ctx.fillRect(wx - ww * 0.32, wy, ww * 0.30, wh); ctx.fillRect(wx + ww * 1.02, wy, ww * 0.30, wh); }
          else { ctx.fillStyle = sc; ctx.fillRect(wx, wy, ww, wh); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(wx + ww / 2 - 0.4, wy, 0.8, wh); }
          ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.6; ctx.strokeRect(wx, wy, ww, wh);
          // Iron grille balcony with a potted plant or two
          if (opts.balcony && rnd() < 0.6) {
            const by = wy + wh + 1;
            ctx.fillStyle = shade(col, 0.6); ctx.fillRect(wx - ww * 0.25, by, ww * 1.5, 2);
            ctx.strokeStyle = 'rgba(30,30,40,0.7)'; ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(wx - ww * 0.25, by - fh * 0.16); ctx.lineTo(wx + ww * 1.25, by - fh * 0.16); ctx.stroke();
            for (let k = 0; k <= 6; k++) { const xx = wx - ww * 0.25 + ww * 1.5 * k / 6; ctx.beginPath(); ctx.moveTo(xx, by); ctx.lineTo(xx, by - fh * 0.16); ctx.stroke(); }
            if (rnd() < 0.6) { ctx.fillStyle = '#4a8a3a'; ctx.beginPath(); ctx.arc(wx + ww * 0.1, by - fh * 0.20, Math.max(1.5, ww * 0.18), 0, PI * 2); ctx.fill(); ctx.fillStyle = '#b05a30'; ctx.fillRect(wx + ww * 0.1 - 2, by - fh * 0.14, 4, 3); }
            if (rnd() < 0.5) { ctx.fillStyle = ['#e84a6a', '#3a8ae0', '#f2c440', '#ffffff'][Math.floor(rnd() * 4)]; ctx.fillRect(wx + ww * 0.5, by - fh * 0.16, ww * 0.5, fh * 0.14); }   // towel over the rail
          }
          // AC box stuck under a window
          if (opts.ac && rnd() < 0.25) { ctx.fillStyle = '#e8e4dc'; ctx.fillRect(wx + ww * 0.1, wy + wh + 3, ww * 0.8, fh * 0.14); ctx.fillStyle = 'rgba(0,0,0,0.2)'; for (let k = 0; k < 4; k++) ctx.fillRect(wx + ww * (0.18 + k * 0.17), wy + wh + 4, 0.6, fh * 0.11); }
        }
      }
      // Shopfront at street level
      if (opts.shop) {
        const sy = bot - fh;
        const s = opts.shop;
        ctx.fillStyle = '#3a2a1e'; ctx.fillRect(x0 + w * 0.05, sy + fh * 0.30, w * 0.90, fh * 0.70);
        const lit = ctx.createLinearGradient(0, sy + fh * 0.30, 0, bot);
        lit.addColorStop(0, '#f0c880'); lit.addColorStop(1, '#a8784a');
        ctx.fillStyle = lit; ctx.fillRect(x0 + w * 0.08, sy + fh * 0.34, w * 0.84, fh * 0.62);
        const goods = ['#e84a4a', '#f2c440', '#3a8ae0', '#4ab060', '#ff8c1a', '#ffffff'];
        for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) { ctx.fillStyle = goods[(k + r * 2) % goods.length]; ctx.fillRect(x0 + w * (0.11 + k * 0.088), sy + fh * (0.40 + r * 0.16), w * 0.06, fh * 0.10); }
        for (let k = 0; k < 7; k++) { ctx.fillStyle = goods[(k + 3) % goods.length]; ctx.fillRect(x0 + w * (0.12 + k * 0.12), sy + fh * 0.34, w * 0.04, fh * 0.14); }   // hanging snack strips
        // Painted signboard
        ctx.fillStyle = s.bg; ctx.fillRect(x0 + w * 0.04, sy + fh * 0.06, w * 0.92, fh * 0.22);
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x0 + w * 0.04, sy + fh * 0.06, w * 0.92, 1.2);
        ctx.save(); ctx.fillStyle = s.fg; ctx.font = `800 ${fh * 0.16}px 'Barlow Condensed', 'Arial Narrow', sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s.text, x0 + w * 0.5, sy + fh * 0.175, w * 0.86); ctx.restore();
        // Striped awning
        for (let k = 0; k < 8; k++) { ctx.fillStyle = k % 2 ? '#ffffff' : s.awn; ctx.beginPath(); ctx.moveTo(x0 + w * (0.03 + k * 0.1175), sy + fh * 0.28); ctx.lineTo(x0 + w * (0.03 + (k + 1) * 0.1175), sy + fh * 0.28); ctx.lineTo(x0 + w * (0.02 + (k + 1) * 0.1175), sy + fh * 0.38); ctx.lineTo(x0 + w * (0.02 + k * 0.1175), sy + fh * 0.38); ctx.closePath(); ctx.fill(); }
      }
      // Inner edge in shade (the side wall turning away down the lane)
      const ie = ctx.createLinearGradient(opts.inner === 'r' ? x1 - W * 0.025 : x0, 0, opts.inner === 'r' ? x1 : x0 + W * 0.025, 0);
      ie.addColorStop(opts.inner === 'r' ? 0 : 1, 'rgba(40,30,30,0)'); ie.addColorStop(opts.inner === 'r' ? 1 : 0, 'rgba(40,30,30,0.30)');
      ctx.fillStyle = ie; ctx.fillRect(opts.inner === 'r' ? x1 - W * 0.025 : x0, top, W * 0.025, h);
      // Parapet and rooftop water tank
      ctx.fillStyle = shade(col, 0.8); ctx.fillRect(x0, top - 4, w, 4);
      if (opts.tank) { ctx.fillStyle = '#2e3236'; ctx.fillRect(x0 + w * opts.tank, top - 14, 14, 10); ctx.fillStyle = '#4a5054'; ctx.fillRect(x0 + w * opts.tank - 1, top - 15, 16, 2.5); }
    }
    // Far row
    facade(W * 0.300, W * 0.400, H * 0.220, H * 0.505, '#e8a0a8', { floors: 4, cols: 2, shutter: '#4a8ab0', inner: 'r', balcony: true, tank: 0.3 });
    facade(W * 0.600, W * 0.700, H * 0.200, H * 0.505, '#a8d0a0', { floors: 4, cols: 2, shutter: '#c05a3a', inner: 'l', balcony: true, tank: 0.5 });
    // Middle row
    facade(W * 0.190, W * 0.310, H * 0.100, H * 0.560, '#f2c860', { floors: 5, cols: 2, shutter: '#2a7a6a', inner: 'r', balcony: true, ac: true, tank: 0.2 });
    facade(W * 0.690, W * 0.810, H * 0.080, H * 0.560, '#7ab0d8', { floors: 5, cols: 2, shutter: '#e8a030', inner: 'l', balcony: true, ac: true, tank: 0.55 });
    // Near row, with shops at street level
    facade(-W * 0.01, W * 0.200, -H * 0.05, H * 0.640, '#e86a5a', { floors: 5, cols: 2, shutter: '#f2e2b8', inner: 'r', balcony: true, ac: true, shop: { text: 'SHARMA GENERAL STORES', bg: '#1a4a8a', fg: '#ffe8a0', awn: '#e84a4a' } });
    facade(W * 0.800, W * 1.01, -H * 0.05, H * 0.640, '#5ab0a0', { floors: 5, cols: 2, shutter: '#f6d6a0', inner: 'l', balcony: true, ac: true, shop: { text: 'PATEL TEA HOUSE', bg: '#c03a2a', fg: '#fff2d0', awn: '#2a7a4a' } });
    // Footpath kerbs at the base of each row
    [[0, 0.20, 0.640], [0.80, 1.0, 0.640], [0.19, 0.31, 0.560], [0.69, 0.81, 0.560], [0.30, 0.40, 0.505], [0.60, 0.70, 0.505]].forEach(([a, b, y]) => {
      ctx.fillStyle = '#c8b498'; ctx.fillRect(W * a, H * y, W * (b - a), H * 0.010);
      ctx.fillStyle = 'rgba(60,40,30,0.25)'; ctx.fillRect(W * a, H * y + H * 0.010, W * (b - a), 1.5);
    });

    // ── Morning sun spilling across the far end of the lane: a warm pool on the ground and a soft glow behind the cup ──
    {
      const pool = ctx.createRadialGradient(W * 0.50, H * 0.53, 0, W * 0.50, H * 0.53, W * 0.26);
      pool.addColorStop(0, 'rgba(255,224,160,0.45)'); pool.addColorStop(1, 'rgba(255,224,160,0)');
      ctx.save(); ctx.translate(0, H * 0.53); ctx.scale(1, 0.30); ctx.translate(0, -H * 0.53);
      ctx.fillStyle = pool; ctx.fillRect(0, 0, W, H * 1.2); ctx.restore();
      const back = ctx.createRadialGradient(W * 0.50, H * 0.34, W * 0.02, W * 0.50, H * 0.34, W * 0.24);
      back.addColorStop(0, 'rgba(255,238,200,0.38)'); back.addColorStop(1, 'rgba(255,238,200,0)');
      ctx.fillStyle = back; ctx.fillRect(W * 0.20, 0, W * 0.60, H * 0.70);
      // Sunlit edge on the far buildings' lane-facing walls
      ctx.fillStyle = 'rgba(255,226,170,0.22)'; ctx.fillRect(W * 0.385, H * 0.22, W * 0.015, H * 0.285); ctx.fillRect(W * 0.290, H * 0.10, W * 0.020, H * 0.46);
    }

    // ── Overhead tangle of wires (crows perch on the lowest one, drawn each frame) ──
    ctx.strokeStyle = 'rgba(30,25,25,0.75)'; ctx.lineWidth = 0.8;
    [[0.00, 0.05, 1.00, 0.06, 0.025], [0.05, 0.11, 0.95, 0.09, 0.025], [0.19, 0.24, 0.81, 0.22, 0.04], [0.00, 0.30, 0.70, 0.27, 0.05], [0.62, 0.02, 1.00, 0.20, 0.05]].forEach(([x0, y0, x1, y1, sag]) => {
      ctx.beginPath();
      for (let k = 0; k <= 30; k++) { const t = k / 30; ctx.lineTo(W * (x0 + (x1 - x0) * t), H * (y0 + (y1 - y0) * t) + H * sag * 4 * t * (1 - t)); }
      ctx.stroke();
    });
    // Marigold-and-mango-leaf toran strung across the lane for a festival
    {
      const x0 = W * 0.19, x1 = W * 0.81, y0 = H * 0.040, sag = H * 0.022;
      const pt = (t) => [x0 + (x1 - x0) * t, y0 + sag * 4 * t * (1 - t)];
      ctx.strokeStyle = 'rgba(80,60,30,0.7)'; ctx.lineWidth = 0.7;
      ctx.beginPath(); for (let k = 0; k <= 30; k++) { const [x, y] = pt(k / 30); ctx.lineTo(x, y); } ctx.stroke();
      for (let k = 0; k <= 40; k++) {
        const [x, y] = pt(k / 40);
        if (k % 3 === 0) { ctx.fillStyle = '#4a8a2a'; ctx.beginPath(); ctx.ellipse(x, y + 5, 1.6, 4.5, 0, 0, PI * 2); ctx.fill(); }
        else { ctx.fillStyle = k % 3 === 1 ? '#ff8c1a' : '#ffc21a'; ctx.beginPath(); ctx.arc(x, y + 1.5, 2.1, 0, PI * 2); ctx.fill(); }
      }
    }

    if (part === 'back') return;
    ctx = ctxReal;

    // ════════ FRONT LAYER — chai cart, parked rickshaw, stumps in bricks ════════
    // Chai cart on the left
    {
      const cx = W * 0.115, base = H * 0.715, cw2 = W * 0.150, ch = H * 0.085;
      ctx.fillStyle = 'rgba(40,30,30,0.30)'; ctx.beginPath(); ctx.ellipse(cx + W * 0.03, base + 2, cw2 * 0.65, H * 0.012, 0.05, 0, PI * 2); ctx.fill();
      const wg = ctx.createLinearGradient(cx - cw2 / 2, 0, cx + cw2 / 2, 0);
      wg.addColorStop(0, '#b07838'); wg.addColorStop(0.5, '#d09a58'); wg.addColorStop(1, '#8a5a28');
      ctx.fillStyle = wg; ctx.fillRect(cx - cw2 / 2, base - ch, cw2, ch * 0.82);
      ctx.fillStyle = '#1a5ab0'; ctx.fillRect(cx - cw2 / 2, base - ch, cw2, ch * 0.24);
      ctx.save(); ctx.fillStyle = '#ffe8a0'; ctx.font = `800 ${ch * 0.18}px 'Barlow Condensed', 'Arial Narrow', sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CUTTING CHAI ₹10', cx, base - ch * 0.88, cw2 * 0.9); ctx.restore();
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; for (let k = 1; k < 4; k++) ctx.fillRect(cx - cw2 / 2, base - ch * 0.76 + k * ch * 0.14, cw2, 0.8);
      [-0.32, 0.32].forEach(o => { ctx.fillStyle = '#2a2420'; ctx.beginPath(); ctx.arc(cx + cw2 * o, base - ch * 0.10, ch * 0.13, 0, PI * 2); ctx.fill(); ctx.fillStyle = '#a89070'; ctx.beginPath(); ctx.arc(cx + cw2 * o, base - ch * 0.10, ch * 0.05, 0, PI * 2); ctx.fill(); });
      // Stove, kettle and a row of little glasses
      ctx.fillStyle = '#3a3a3a'; ctx.fillRect(cx - cw2 * 0.38, base - ch - H * 0.012, cw2 * 0.20, H * 0.012);
      ctx.fillStyle = 'rgba(80,140,255,0.8)'; ctx.fillRect(cx - cw2 * 0.36, base - ch - H * 0.014, cw2 * 0.16, 1.6);
      if (!KETTLE_SKIP) drawKettle(ctx, W, H, 0);
      for (let k = 0; k < 5; k++) {
        const gx = cx + cw2 * (0.02 + k * 0.08), gy = base - ch;
        ctx.fillStyle = 'rgba(230,240,245,0.65)'; ctx.fillRect(gx - 2.5, gy - 8, 5, 8);
        ctx.fillStyle = '#c88a4a'; ctx.fillRect(gx - 2.2, gy - 5, 4.4, 5);
      }
    }
    // Autorickshaw parked on the right, nose cut off by the frame (painted on its own layer so it can tick over)
    {
      const ctxSaved = ctx; if (RICK_CTX) ctx = RICK_CTX;
      const rx = W * 0.905, base = H * 0.715, s = H * 0.16;
      ctx.fillStyle = 'rgba(40,30,30,0.30)'; ctx.beginPath(); ctx.ellipse(rx + s * 0.2, base + 2, s * 0.75, H * 0.012, 0.05, 0, PI * 2); ctx.fill();
      // Body: yellow lower, black canvas canopy
      ctx.fillStyle = '#f2c420';
      ctx.beginPath(); ctx.moveTo(rx - s * 0.55, base - s * 0.12); ctx.lineTo(rx - s * 0.50, base - s * 0.55); ctx.lineTo(rx + s * 0.55, base - s * 0.55); ctx.lineTo(rx + s * 0.60, base - s * 0.12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.30)'; ctx.fillRect(rx - s * 0.50, base - s * 0.55, s * 1.05, 1.5);
      ctx.fillStyle = '#1e1e22';
      ctx.beginPath(); ctx.moveTo(rx - s * 0.52, base - s * 0.55); ctx.quadraticCurveTo(rx - s * 0.48, base - s * 1.02, rx - s * 0.10, base - s * 1.02); ctx.lineTo(rx + s * 0.62, base - s * 1.00); ctx.lineTo(rx + s * 0.60, base - s * 0.55); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(rx - s * 0.30, base - s * 0.98, s * 0.85, 1.2);
      // Open side, seat and driver's rail
      ctx.fillStyle = '#3a2a24'; ctx.fillRect(rx - s * 0.25, base - s * 0.52, s * 0.70, s * 0.30);
      ctx.fillStyle = '#7a2a2a'; ctx.fillRect(rx - s * 0.18, base - s * 0.36, s * 0.55, s * 0.12);
      limb(rx - s * 0.28, base - s * 0.92, rx - s * 0.28, base - s * 0.55, 1.4, '#c8c8cc');
      ctx.fillStyle = '#1a6a3a'; ctx.fillRect(rx - s * 0.55, base - s * 0.18, s * 1.15, s * 0.06);   // green stripe
      // Wheels
      [[-0.38, 0.11], [0.48, 0.11]].forEach(([o, r]) => { ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(rx + s * o, base - s * r, s * r, 0, PI * 2); ctx.fill(); ctx.fillStyle = '#8a8a90'; ctx.beginPath(); ctx.arc(rx + s * o, base - s * r, s * r * 0.45, 0, PI * 2); ctx.fill(); });
      // A little painted slogan on the back panel
      ctx.save(); ctx.fillStyle = '#1a1a1a'; ctx.font = `800 ${s * 0.07}px 'Barlow Condensed', 'Arial Narrow', sans-serif`; ctx.textAlign = 'center';
      ctx.fillText('HORN OK PLEASE', rx + s * 0.05, base - s * 0.26); ctx.restore();
      ctx = ctxSaved;
    }
    // Stumps wedged in a stack of bricks, right of the trophy
    {
      const sx = W * 0.690, base = H * 0.705;
      ctx.fillStyle = 'rgba(40,30,30,0.30)';
      ctx.beginPath(); ctx.moveTo(sx - W * 0.04, base); ctx.lineTo(sx + W * 0.04, base); ctx.lineTo(sx + W * 0.11, base + H * 0.05); ctx.lineTo(sx + W * 0.03, base + H * 0.05); ctx.closePath(); ctx.fill();
      // Bricks: two courses
      [[0, -0.040, 0.034], [0.036, -0.040, 0.034], [-0.036, -0.040, 0.034], [-0.018, -0.070, 0.034], [0.018, -0.070, 0.034]].forEach(([dx, dy, bw]) => {
        const x = sx + W * dx - W * bw / 2, y = base + H * dy * 0.6, h = H * 0.024;
        ctx.fillStyle = '#b44a30'; ctx.fillRect(x, y - h, W * bw, h);
        ctx.fillStyle = 'rgba(255,200,170,0.25)'; ctx.fillRect(x, y - h, W * bw, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + W * bw - 1, y - h, 1, h);
      });
      const top0 = base - H * 0.040 * 0.6 - H * 0.024 * 2 + 2;
      [[-0.020, -0.05, 0.150], [0, 0.0, 0.158], [0.020, 0.06, 0.146]].forEach(([dx, lean, h]) => {
        ctx.save(); ctx.translate(sx + W * dx, top0); ctx.rotate(lean);
        const r = W * 0.0058, sh = H * h;
        const g = ctx.createLinearGradient(-r, 0, r, 0);
        g.addColorStop(0, '#f0d8a8'); g.addColorStop(0.4, '#d8b078'); g.addColorStop(1, '#8a5a30');
        ctx.fillStyle = g; ctx.fillRect(-r, -sh, r * 2, sh);
        ctx.fillStyle = '#2a50b0'; ctx.fillRect(-r, -sh * 0.62, r * 2, sh * 0.06);          // a bit of electrical tape
        ctx.fillStyle = '#f2dcb0'; ctx.beginPath(); ctx.ellipse(0, -sh, r, r * 0.55, 0, 0, PI * 2); ctx.fill();
        ctx.restore();
      });
    }
  }

  // The chai kettle on the cart's stove. pour 0→1 lifts it across and tips it over the first glass.
  function drawKettle(ctx, W, H, pour) {
    const cx = W * 0.115, base = H * 0.715, cw2 = W * 0.150, ch = H * 0.085;
    const kx = cx - cw2 * 0.28, ky = base - ch - H * 0.014;
    const e = pour * pour * (3 - 2 * pour);
    ctx.save(); ctx.translate(kx + 15 * e, ky - 7 - 11 * e); ctx.rotate(0.80 * e); ctx.translate(-kx, -(ky - 7));
    const kg = ctx.createLinearGradient(kx - 8, 0, kx + 8, 0);
    kg.addColorStop(0, '#f0f0f0'); kg.addColorStop(0.5, '#b8bcc4'); kg.addColorStop(1, '#6a6e78');
    ctx.fillStyle = kg; ctx.beginPath(); ctx.ellipse(kx, ky - 7, 9, 7.5, 0, 0, PI * 2); ctx.fill();
    ctx.strokeStyle = '#9aa0aa'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(kx + 7, ky - 8); ctx.lineTo(kx + 14, ky - 13); ctx.stroke();   // spout
    ctx.beginPath(); ctx.arc(kx, ky - 13, 6, PI, 0); ctx.stroke();                                                                         // handle
    ctx.restore();
    return [kx, ky];
  }

  // Morning haze and a soft vignette over everything
  function drawAtmos(ctx, W, H) {
    const haze = ctx.createLinearGradient(0, H * 0.25, 0, H * 0.50);
    haze.addColorStop(0, 'rgba(250,236,210,0)'); haze.addColorStop(1, 'rgba(250,236,210,0.16)');
    ctx.fillStyle = haze; ctx.fillRect(0, H * 0.25, W, H * 0.25);
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.42, W * 0.20, W * 0.5, H * 0.42, W * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(0.7, 'rgba(40,20,10,0.05)'); vig.addColorStop(1, 'rgba(40,20,10,0.24)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  }

  // ════════ THE GULLY CUP — a hammered-brass pot on a stencilled crate ════════
  // Its own silhouette: a pot-bellied vessel (like a brass lota) with ring handles, a marigold garland
  // round the neck, and a taped tennis ball resting in its mouth. phi = turn angle; t = seconds.
  function drawTrophy(ctx, W, H, phi, t) {
    const FONT = (wt, px) => `${wt} ${px}px 'Barlow Condensed', 'Arial Narrow', sans-serif`;
    const tx = W * 0.5, tb = H * 0.705, S = H * 0.390, K = 1.70, TILT = 0.08;
    const P = (r, y, a) => [tx + r * Math.sin(a), y + r * Math.cos(a) * TILT];
    const brass = (x0, x1) => {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, '#5a3a10'); g.addColorStop(0.14, '#f2cc80'); g.addColorStop(0.30, '#ffeec0');
      g.addColorStop(0.50, '#dca048'); g.addColorStop(0.72, '#8a5818'); g.addColorStop(0.88, '#c48a38'); g.addColorStop(1, '#4a2a08');
      return g;
    };
    ctx.save(); ctx.translate(tx, tb); ctx.scale(K, K); ctx.translate(-tx, -tb);
    // Shadow falling down and to the right (sun top-left)
    const shg = ctx.createLinearGradient(0, tb, 0, tb + H * 0.08);
    shg.addColorStop(0, 'rgba(40,30,30,0.40)'); shg.addColorStop(1, 'rgba(40,30,30,0)');
    ctx.fillStyle = shg;
    ctx.beginPath(); ctx.moveTo(tx - W * 0.07, tb); ctx.lineTo(tx + W * 0.07, tb); ctx.lineTo(tx + W * 0.13, tb + H * 0.07); ctx.lineTo(tx + W * 0.0, tb + H * 0.07); ctx.closePath(); ctx.fill();

    // ── Crate plinth: pine slats painted faded blue, orange stencil lettering ──
    const pW = W * 0.072, pH = S * 0.24, dep = S * 0.045;
    const crateTop = tb - pH;
    ctx.fillStyle = '#9ab8c8';                                           // top face, seen from above
    ctx.beginPath(); ctx.moveTo(tx - pW, crateTop); ctx.lineTo(tx - pW + W * 0.010, crateTop - dep); ctx.lineTo(tx + pW + W * 0.010, crateTop - dep); ctx.lineTo(tx + pW, crateTop); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(tx - pW + 2, crateTop - dep * 0.5, pW * 2, 0.7);
    ctx.fillStyle = '#5a7a8c';                                           // right side in shade
    ctx.beginPath(); ctx.moveTo(tx + pW, crateTop); ctx.lineTo(tx + pW + W * 0.010, crateTop - dep); ctx.lineTo(tx + pW + W * 0.010, tb - dep); ctx.lineTo(tx + pW, tb); ctx.closePath(); ctx.fill();
    const cf = ctx.createLinearGradient(tx - pW, 0, tx + pW, 0);
    cf.addColorStop(0, '#8ab0c4'); cf.addColorStop(1, '#6a90a6');
    ctx.fillStyle = cf; ctx.fillRect(tx - pW, crateTop, pW * 2, pH);
    ctx.fillStyle = 'rgba(30,40,50,0.35)';                               // gaps between slats
    for (let k = 1; k < 4; k++) ctx.fillRect(tx - pW, crateTop + pH * k / 4, pW * 2, 1.2);
    ctx.fillStyle = 'rgba(200,170,120,0.35)';                            // bare wood where the paint has worn
    [[-0.7, 0.10, 0.25], [0.35, 0.62, 0.30], [-0.2, 0.86, 0.18]].forEach(([x, y, w]) => ctx.fillRect(tx + pW * x, crateTop + pH * y, pW * w, pH * 0.06));
    ctx.fillStyle = '#7a5a3a'; ctx.fillRect(tx - pW, crateTop, pW * 0.10, pH); ctx.fillRect(tx + pW * 0.90, crateTop, pW * 0.10, pH);   // corner posts
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(30,40,55,0.35)'; ctx.font = FONT(900, pH * 0.30); ctx.fillText('GULLY CUP', tx + 0.8, crateTop + pH * 0.42 + 0.8, pW * 1.6);
    ctx.fillStyle = '#ffe2b0'; ctx.fillText('GULLY CUP', tx, crateTop + pH * 0.42, pW * 1.6);
    ctx.fillStyle = '#1a2a3a'; ctx.font = FONT(800, pH * 0.13); ctx.fillText('STREET CRICKET · LANE NO. 4', tx, crateTop + pH * 0.70, pW * 1.6);
    ctx.restore();

    // ── Foot and a short stem with one knop ──
    const footY = crateTop - dep * 0.45, footW = W * 0.040;
    ctx.fillStyle = brass(tx - footW, tx + footW);
    ctx.beginPath(); ctx.ellipse(tx, footY, footW, S * 0.016, 0, 0, PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx - footW, footY); ctx.quadraticCurveTo(tx - footW * 0.85, footY - S * 0.035, tx - footW * 0.24, footY - S * 0.040);
    ctx.lineTo(tx + footW * 0.24, footY - S * 0.040); ctx.quadraticCurveTo(tx + footW * 0.85, footY - S * 0.035, tx + footW, footY); ctx.closePath(); ctx.fill();
    const stemTop = footY - S * 0.085;
    ctx.fillRect(tx - footW * 0.20, stemTop, footW * 0.40, S * 0.050);
    ctx.beginPath(); ctx.ellipse(tx, footY - S * 0.060, footW * 0.42, S * 0.014, 0, 0, PI * 2); ctx.fill();

    // ── Pot-bellied bowl: a smooth profile through these points (radius in cw, height above the bottom in S) ──
    const SB = S * 1.20;                                 // the bowl is drawn 20% taller than the base scale
    const cw = W * 0.068, yb = stemTop;
    const pts = [[0.30, 0.000], [0.62, 0.030], [0.92, 0.080], [1.08, 0.150], [1.03, 0.210], [0.84, 0.258], [0.68, 0.282], [0.68, 0.298], [0.84, 0.316]];
    const prof = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < 8; k++) {
        const u = k / 8, u2 = u * u, u3 = u2 * u;
        const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
        prof.push([cr(p0[0], p1[0], p2[0], p3[0]) * cw, yb - cr(p0[1], p1[1], p2[1], p3[1]) * S]);
      }
    }
    prof.push([pts[pts.length - 1][0] * cw, yb - pts[pts.length - 1][1] * S]);
    const lipY = prof[prof.length - 1][1], lipR = prof[prof.length - 1][0];
    const radiusAt = (y) => { let best = cw, bd = 1e9; prof.forEach(([r, yy]) => { const d = Math.abs(yy - y); if (d < bd) { bd = d; best = r; } }); return best; };
    const bowlPath = () => { ctx.beginPath(); prof.forEach(([r, y], i) => i ? ctx.lineTo(tx - r, y) : ctx.moveTo(tx - r, y)); for (let i = prof.length - 1; i >= 0; i--) ctx.lineTo(tx + prof[i][0], prof[i][1]); ctx.closePath(); };

    // ── Ring handles on the shoulders ──
    const ringY = yb - SB * 0.200, ringR0 = cw * 1.26, ringR = cw * 0.20;
    function drawRing(a, back) {
      ctx.strokeStyle = brass(tx - cw * 1.6, tx + cw * 1.6); ctx.lineWidth = W * 0.0048; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let k = 0; k <= 40; k++) { const th = k / 40 * PI * 2; const [x, y] = P(ringR0 + ringR * Math.cos(th), ringY + ringR * Math.sin(th), a); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      // Boss where the ring hooks into the pot
      const [bx, by] = P(radiusAt(ringY) * 0.99, ringY, a);
      ctx.fillStyle = brass(tx - cw, tx + cw); ctx.beginPath(); ctx.ellipse(bx, by, W * 0.006 * Math.max(0.35, Math.abs(Math.cos(a))), W * 0.007, 0, 0, PI * 2); ctx.fill();
      if (back) { ctx.strokeStyle = 'rgba(40,25,10,0.35)'; ctx.stroke(); }
    }
    const rings = [phi - PI / 2, phi + PI / 2];
    rings.filter(a => Math.cos(a) < 0).forEach(a => drawRing(a, true));

    // ── Body ──
    ctx.fillStyle = brass(tx - cw * 1.08, tx + cw * 1.08); bowlPath(); ctx.fill();
    // Soft, calm reflections: sky across the shoulder, warm street below the belly
    ctx.save(); bowlPath(); ctx.clip();
    const sk = ctx.createLinearGradient(0, yb - SB * 0.27, 0, yb - SB * 0.15);
    sk.addColorStop(0, 'rgba(160,200,235,0)'); sk.addColorStop(0.6, 'rgba(160,200,235,0.20)'); sk.addColorStop(1, 'rgba(160,200,235,0)');
    ctx.fillStyle = sk; ctx.fillRect(tx - cw * 1.2, yb - SB * 0.27, cw * 2.4, SB * 0.12);
    const st = ctx.createLinearGradient(0, yb - SB * 0.12, 0, yb);
    st.addColorStop(0, 'rgba(120,70,30,0)'); st.addColorStop(1, 'rgba(120,70,30,0.30)');
    ctx.fillStyle = st; ctx.fillRect(tx - cw * 1.2, yb - SB * 0.12, cw * 2.4, SB * 0.12);
    // Hammered dimples, fixed to the metal so they turn with it
    let ds = 5; const dr = () => { ds = (ds * 16807) % 2147483647; return (ds - 1) / 2147483646; };
    for (let i = 0; i < 90; i++) {
      const a = phi + dr() * PI * 2, y = yb - SB * (0.03 + dr() * 0.24), c = Math.cos(a);
      if (c < 0.12) continue;
      const r = radiusAt(y), [x, yy] = P(r, y, a), s = Math.sin(a);
      const d = cw * 0.040;
      ctx.fillStyle = `rgba(255,240,200,${(0.30 * c * (s < 0 ? 1 : 0.5)).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(x - 0.5, yy - 0.5, d * c, d * 0.8, 0, 0, PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(80,45,10,${(0.22 * c).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(x + 0.6, yy + 0.6, d * c * 0.7, d * 0.55, 0, 0, PI * 2); ctx.fill();
    }
    ctx.restore();
    // Two engraved bands round the belly
    ctx.strokeStyle = 'rgba(90,55,15,0.55)'; ctx.lineWidth = 0.8;
    [0.105, 0.195].forEach(f => { const y = yb - SB * f, r = radiusAt(y); ctx.beginPath(); ctx.ellipse(tx, y, r * 0.995, r * TILT, 0, 0, PI); ctx.stroke(); });

    // ── Painted medallions: truck-art bat-and-ball on the front, "GC" on the back ──
    const ey = yb - SB * 0.150, er = radiusAt(ey) * 0.97, es = cw * 0.28;
    function emblem(a, fn) {
      const c = Math.cos(a); if (c <= 0) return;
      ctx.save(); ctx.globalAlpha = Math.min(1, c * 3.5);
      ctx.translate(tx + er * Math.sin(a), ey + er * c * TILT); ctx.scale(c, 1); fn(); ctx.restore();
    }
    emblem(phi, () => {
      for (let k = 0; k < 12; k++) { const a = k * PI / 6; ctx.fillStyle = k % 2 ? '#ff7a1a' : '#1aa0a0'; ctx.beginPath(); ctx.ellipse(Math.cos(a) * es * 0.92, Math.sin(a) * es * 0.92, es * 0.20, es * 0.11, a, 0, PI * 2); ctx.fill(); }
      ctx.fillStyle = '#fff4d8'; ctx.beginPath(); ctx.arc(0, 0, es * 0.80, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = '#c02a4a'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.arc(0, 0, es * 0.80, 0, PI * 2); ctx.stroke();
      ctx.save(); ctx.rotate(-0.6);
      ctx.fillStyle = '#c8945a'; ctx.beginPath(); ctx.roundRect(-es * 0.12, -es * 0.18, es * 0.24, es * 0.70, es * 0.06); ctx.fill();
      ctx.fillStyle = '#2a50b0'; ctx.fillRect(-es * 0.05, -es * 0.55, es * 0.10, es * 0.38);
      ctx.restore();
      ctx.fillStyle = '#d8ec50'; ctx.beginPath(); ctx.arc(es * 0.34, es * 0.22, es * 0.14, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#d02828'; ctx.fillRect(es * 0.20, es * 0.19, es * 0.28, es * 0.06);
    });
    emblem(phi + PI, () => {
      ctx.fillStyle = '#ff7a1a'; ctx.beginPath(); ctx.arc(0, 0, es, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = '#1aa0a0'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(0, 0, es * 0.84, 0, PI * 2); ctx.stroke();
      ctx.fillStyle = '#fff4d8'; ctx.font = FONT(900, es * 0.95); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('GC', 0, es * 0.06);
    });

    // ── Marigold garland round the neck, with swags hanging down the shoulder ──
    const neckY = yb - SB * 0.272, neckR = radiusAt(neckY) + cw * 0.05;
    const flower = (x, y, c, k) => {
      const fr = cw * 0.072;
      ctx.fillStyle = k % 2 ? '#ffb41a' : '#ff7a12';
      ctx.beginPath(); ctx.arc(x, y, fr, 0, PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(255,240,200,${(0.35 * c).toFixed(3)})`; ctx.beginPath(); ctx.arc(x - fr * 0.3, y - fr * 0.3, fr * 0.45, 0, PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(150,60,0,0.45)'; ctx.beginPath(); ctx.arc(x + fr * 0.15, y + fr * 0.2, fr * 0.30, 0, PI * 2); ctx.fill();
    };
    const garland = [];
    for (let k = 0; k < 30; k++) { const a = phi + k * PI * 2 / 30; garland.push([a, neckY, neckR, k]); }
    for (let sw = 0; sw < 5; sw++) {
      for (let j = 1; j < 8; j++) {
        const f = j / 8, a = phi + (sw + f) * PI * 2 / 5, y = neckY + SB * 0.065 * Math.sin(f * PI);
        garland.push([a, y, radiusAt(y) + cw * 0.05, j + sw]);
      }
    }
    garland.sort((p, q) => Math.cos(p[0]) - Math.cos(q[0]));
    garland.forEach(([a, y, r, k]) => { const c = Math.cos(a); if (c < -0.05) return; const [x, yy] = P(r, y, a); flower(x, yy, Math.max(0, c), k); });

    // ── Flared lip, dark mouth, and the taped tennis ball resting in it ──
    ctx.fillStyle = brass(tx - lipR, tx + lipR); ctx.beginPath(); ctx.ellipse(tx, lipY, lipR, lipR * TILT * 1.6, 0, 0, PI * 2); ctx.fill();
    ctx.fillStyle = '#3a2208'; ctx.beginPath(); ctx.ellipse(tx, lipY, lipR * 0.84, lipR * TILT * 1.2, 0, 0, PI * 2); ctx.fill();
    {
      const br = cw * 0.27, bx = tx, by = lipY - br * 0.62;
      // Sits down in the pot: only the part above the mouth's front edge shows
      ctx.save(); ctx.beginPath(); ctx.rect(bx - br * 1.5, by - br * 1.5, br * 3, lipY - (by - br * 1.5));
      ctx.ellipse(tx, lipY, lipR * 0.84, lipR * TILT * 1.2, 0, 0, PI * 2); ctx.clip();
      const g = ctx.createRadialGradient(bx - br * 0.35, by - br * 0.40, br * 0.1, bx, by, br);
      g.addColorStop(0, '#f0fa8a'); g.addColorStop(0.65, '#cfe03a'); g.addColorStop(1, '#8a9a1c');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, br, 0, PI * 2); ctx.fill();
      // Felt seam, a strip of red electrical tape and a maker's stamp, fixed to the ball in 3D so it
      // turns with the cup (same axis, same speed); the shading stays put because the light doesn't move.
      ctx.save(); ctx.beginPath(); ctx.arc(bx, by, br, 0, PI * 2); ctx.clip();
      const cp = Math.cos(phi), sp = Math.sin(phi);
      // Turn about the same upright axis as the cup, then view from slightly above (like the cup's
      // rim) so the near side of the seam sits lower than the far side and the direction reads clearly
      const EL = 0.38, ce = Math.cos(EL), se = Math.sin(EL);
      const turn = ([X, Y, Z]) => { const x = X * cp + Z * sp, z = Z * cp - X * sp; return [x, Y * ce - z * se, z * ce + Y * se]; };
      const curve = (fn, n, col, lw) => {                    // draw only the parts facing us
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round';
        let prev = null;
        for (let k = 0; k <= n; k++) {
          const [X, Y, Z] = turn(fn(k / n * PI * 2));
          const pt = [bx + X * br, by - Y * br];
          if (Z > 0 && prev) { ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(pt[0], pt[1]); ctx.stroke(); }
          prev = Z > 0 ? pt : null;
        }
      };
      // The classic tennis-ball seam: two white lines either side of a groove
      const seam = u => { const x = 0.75 * Math.cos(u) + 0.25 * Math.cos(3 * u), z = 0.75 * Math.sin(u) - 0.25 * Math.sin(3 * u), y = 0.866 * Math.sin(2 * u), m = Math.hypot(x, y, z); return [x / m, y / m, z / m]; };
      curve(seam, 160, 'rgba(255,255,240,0.95)', br * 0.16);
      curve(seam, 160, 'rgba(150,170,30,0.55)', br * 0.05);
      ctx.restore();
      // Fixed shading over the top so the turning markings sit "on" a lit sphere
      { const sh = ctx.createRadialGradient(bx - br * 0.3, by - br * 0.35, br * 0.2, bx, by, br);
        sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(0.75, 'rgba(0,0,0,0.04)'); sh.addColorStop(1, 'rgba(40,40,0,0.30)');
        ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(bx, by, br, 0, PI * 2); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,240,0.35)'; ctx.beginPath(); ctx.ellipse(bx - br * 0.38, by - br * 0.42, br * 0.22, br * 0.14, -0.6, 0, PI * 2); ctx.fill();
      ctx.restore();
    }

    // ── Near-side rings in front ──
    rings.filter(a => Math.cos(a) >= 0).forEach(a => drawRing(a, false));
    // One gentle highlight down the sunlit side
    ctx.save(); bowlPath(); ctx.clip();
    ctx.fillStyle = 'rgba(255,250,230,0.28)';
    ctx.beginPath(); ctx.ellipse(tx - cw * 0.62, yb - SB * 0.15, cw * 0.10, SB * 0.075, 0.1, 0, PI * 2); ctx.fill();
    ctx.restore();
    ctx.restore();

    // A taped tennis bat leaning on the crate (drawn unscaled)
    {
      const toeX = tx - W * 0.072 * K - W * 0.070, toeY = tb - H * 0.002, topX = tx - W * 0.072 * K + W * 0.006, topY = tb - H * 0.150;
      const ang = Math.atan2(topY - toeY, topX - toeX), len = Math.hypot(topX - toeX, topY - toeY);
      ctx.fillStyle = 'rgba(40,30,30,0.30)'; ctx.beginPath(); ctx.ellipse(toeX + W * 0.03, toeY + 2, W * 0.03, H * 0.007, 0.1, 0, PI * 2); ctx.fill();
      ctx.save(); ctx.translate(toeX, toeY); ctx.rotate(ang);
      const bw = W * 0.022, bl = len * 0.64;
      const g = ctx.createLinearGradient(0, -bw / 2, 0, bw / 2);
      g.addColorStop(0, '#f0d4a0'); g.addColorStop(0.4, '#d8b480'); g.addColorStop(1, '#9a7448');
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(0, -bw / 2, bl, bw, bw * 0.28); ctx.fill();
      ctx.fillStyle = '#1a1a1a'; [0.15, 0.22, 0.70].forEach(f => ctx.fillRect(bl * f, -bw / 2, bl * 0.035, bw));        // black tape strips
      ctx.fillStyle = 'rgba(80,50,20,0.25)'; ctx.fillRect(bl * 0.40, -bw * 0.40, bl * 0.18, bw * 0.30);                   // ball marks
      ctx.fillStyle = '#d8b480'; ctx.fillRect(bl, -bw * 0.16, bw * 0.6, bw * 0.32);
      ctx.fillStyle = '#2a50b0'; ctx.fillRect(bl + bw * 0.55, -bw * 0.17, len - bl - bw * 0.55, bw * 0.34);              // blue tape grip
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; for (let x = bl + bw * 0.8; x < len - 2; x += 3.2) ctx.fillRect(x, -bw * 0.17, 0.9, bw * 0.34);
      ctx.restore();
    }
  }

  // ════════ AMBIENT ANIMATION ════════
  // Behind the props: washing line, kite, crows, a scooter at the end of the lane, pigeons
  function drawAmbientBack(ctx, W, H, t) {
    const m = t % SHOW;
    // Saris and shirts on a line strung between the buildings on the right, swaying in the breeze
    {
      const x0 = W * 0.705, x1 = W * 0.975, y0 = H * 0.300, sag = H * 0.026;
      const pt = (u) => [x0 + (x1 - x0) * u, y0 + sag * 4 * u * (1 - u)];
      ctx.strokeStyle = 'rgba(60,50,40,0.7)'; ctx.lineWidth = 0.7;
      ctx.beginPath(); for (let k = 0; k <= 30; k++) { const [x, y] = pt(k / 30); ctx.lineTo(x, y); } ctx.stroke();
      [[0.10, 0.038, 0.066, '#e83a6a'], [0.27, 0.026, 0.046, '#ffffff'], [0.45, 0.042, 0.072, '#2a8ae0'], [0.64, 0.030, 0.052, '#f2c420'], [0.84, 0.038, 0.064, '#4ab060']].forEach(([u, w, h, col], i) => {
        const [x, y] = pt(u), sway = Math.sin(t * 1.1 + i * 1.3) * 0.10 + Math.sin(t * 2.3 + i) * 0.03;
        const ww = W * w, hh = H * h;
        ctx.save(); ctx.translate(x, y); ctx.transform(1, 0, sway, 1, 0, 0);
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-ww / 2, 0); ctx.lineTo(ww / 2, 0);
        ctx.quadraticCurveTo(ww / 2 + 1, hh * 0.6, ww / 2 - 1, hh); ctx.quadraticCurveTo(0, hh + 2 + Math.sin(t * 2 + i) * 1.2, -ww / 2 + 1, hh); ctx.quadraticCurveTo(-ww / 2 - 1, hh * 0.6, -ww / 2, 0); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(ww * 0.15, 0, ww * 0.35, hh);
        ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-ww / 2, hh - 3, ww, 1.5);
        ctx.fillStyle = '#8a6a3a'; ctx.fillRect(-ww * 0.35, -2, 2, 4); ctx.fillRect(ww * 0.30, -2, 2, 4);
        ctx.restore();
      });
    }
    // A paper kite (patang) bobbing high above the rooftops, string trailing off to a terrace on the left
    {
      const sw = (m - KITE_SWOOP[0]) / (KITE_SWOOP[1] - KITE_SWOOP[0]), swoop = sw > 0 && sw < 1 ? Math.sin(sw * PI) : 0;
      const kx = W * 0.83 + Math.sin(t * 0.7) * W * 0.012 - swoop * Math.sin(sw * PI * 2) * W * 0.035;
      const ky = H * 0.085 + Math.sin(t * 1.1) * H * 0.010 + swoop * H * 0.075;
      const tilt = Math.sin(t * 0.9) * 0.25 + 0.8 + (sw > 0 && sw < 1 ? Math.sin(sw * PI) * Math.sin(sw * PI * 2) * 1.6 : 0);
      ctx.strokeStyle = 'rgba(80,70,70,0.55)'; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(kx, ky + 6); ctx.quadraticCurveTo(W * 0.70, H * 0.15, W * 0.58, H * 0.03); ctx.stroke();
      ctx.save(); ctx.translate(kx, ky); ctx.rotate(tilt);
      ctx.fillStyle = '#e8226a'; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(8, 0); ctx.lineTo(0, 9); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffd21a'; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(8, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(60,30,30,0.7)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(0, 9); ctx.moveTo(-8, 0); ctx.quadraticCurveTo(0, -4, 8, 0); ctx.stroke();
      ctx.fillStyle = '#ffd21a'; ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(-3, 14 + Math.sin(t * 6) * 1.5); ctx.lineTo(3, 14 - Math.sin(t * 6) * 1.5); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    // A far-off kite drifting slowly
    {
      const kx = W * 0.20 + Math.sin(t * 0.4) * W * 0.015, ky = H * 0.045 + Math.sin(t * 0.8 + 1) * H * 0.006;
      ctx.save(); ctx.translate(kx, ky); ctx.rotate(0.6 + Math.sin(t * 0.7) * 0.2);
      ctx.fillStyle = '#2a8ae0'; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(4.5, 0); ctx.lineTo(0, 5); ctx.lineTo(-4.5, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    // Crows on the lowest wire; one caws on cue (head up, beak open, wings half out)
    {
      const wy = (x) => { const u = (x / W - 0.0) / 0.70; return H * (0.30 + (0.27 - 0.30) * u) + H * 0.05 * 4 * u * (1 - u); };
      [[0.215, 0], [0.245, 1], [0.285, 0]].forEach(([fx, caller], i) => {
        const x = W * fx, y = wy(x), s = H * 0.022;
        let caw = 0, d = 0;
        if (caller) CROW_CAWS.forEach(st => { const dd = m - st; if (dd > 0 && dd < 1.4) { caw = Math.sin(dd / 1.4 * PI); d = dd; } });
        const bob = Math.sin(t * 0.9 + i * 2) * 0.5 + caw * Math.sin(d * 18) * 1.0;
        ctx.save(); ctx.translate(x, y + bob);
        ctx.fillStyle = '#1e1c22';
        ctx.beginPath(); ctx.ellipse(0, -s * 0.55, s * 0.45, s * 0.38, -0.3, 0, PI * 2); ctx.fill();                   // body
        ctx.beginPath(); ctx.moveTo(s * 0.30, -s * 0.40); ctx.lineTo(s * 0.85, -s * 0.10); ctx.lineTo(s * 0.70, -s * 0.30); ctx.closePath(); ctx.fill();   // tail
        if (caw > 0.2) { ctx.beginPath(); ctx.moveTo(-s * 0.1, -s * 0.70); ctx.lineTo(s * 0.55, -s * 1.15 * caw - s * 0.4); ctx.lineTo(s * 0.35, -s * 0.50); ctx.closePath(); ctx.fill(); }   // wing lifts
        ctx.save(); ctx.translate(-s * 0.35, -s * 0.82); ctx.rotate(-caw * 0.5);
        ctx.fillStyle = '#4a4650'; ctx.beginPath(); ctx.arc(0, 0, s * 0.24, 0, PI * 2); ctx.fill();                    // grey nape
        ctx.fillStyle = '#1e1c22'; ctx.beginPath(); ctx.arc(-s * 0.04, -s * 0.02, s * 0.20, 0, PI * 2); ctx.fill();
        ctx.fillStyle = '#e8e4d8'; ctx.beginPath(); ctx.arc(-s * 0.10, -s * 0.06, s * 0.035, 0, PI * 2); ctx.fill();   // eye glint
        ctx.fillStyle = '#121014';
        ctx.beginPath(); ctx.moveTo(-s * 0.18, -s * 0.06); ctx.lineTo(-s * 0.48, -s * 0.02 - caw * s * 0.10); ctx.lineTo(-s * 0.18, s * 0.02); ctx.closePath(); ctx.fill();   // upper beak
        ctx.beginPath(); ctx.moveTo(-s * 0.18, s * 0.02); ctx.lineTo(-s * 0.44, s * 0.06 + caw * s * 0.14); ctx.lineTo(-s * 0.18, s * 0.06); ctx.closePath(); ctx.fill();   // lower beak drops
        ctx.restore();
        ctx.strokeStyle = '#3a3640'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-s * 0.05, -s * 0.2); ctx.lineTo(-s * 0.05, 0); ctx.moveTo(s * 0.08, -s * 0.2); ctx.lineTo(s * 0.08, 0); ctx.stroke();
        ctx.restore();
      });
    }
    // A scooter puttering across the far end of the lane (0.5–4.5s in the schedule)
    {
      const f = (m - 0.5) / 4.0;
      if (f > 0 && f < 1) {
        const x = W * (0.385 + f * 0.23), y = H * 0.500, s = H * 0.030;
        ctx.save(); ctx.beginPath(); ctx.rect(W * 0.40, 0, W * 0.20, H); ctx.clip();
        ctx.fillStyle = 'rgba(60,50,40,0.25)'; ctx.fillRect(x - s * 0.7, y, s * 1.4, 1.2);
        ctx.fillStyle = '#d82a2a'; ctx.beginPath(); ctx.ellipse(x, y - s * 0.35, s * 0.55, s * 0.22, 0, 0, PI * 2); ctx.fill();   // scooter body
        ctx.fillStyle = '#1a1a1a'; [-0.4, 0.4].forEach(o => { ctx.beginPath(); ctx.arc(x + s * o, y - s * 0.10, s * 0.12, 0, PI * 2); ctx.fill(); });
        ctx.fillStyle = '#2a4a8a'; ctx.fillRect(x - s * 0.18, y - s * 1.05, s * 0.30, s * 0.55);                               // rider
        ctx.fillStyle = '#c89068'; ctx.beginPath(); ctx.arc(x - s * 0.03, y - s * 1.18, s * 0.13, 0, PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x - s * 0.03, y - s * 1.22, s * 0.14, PI, 0); ctx.fill();          // helmet
        ctx.fillStyle = 'rgba(200,190,170,0.35)'; ctx.beginPath(); ctx.ellipse(x - s * 0.9, y - s * 0.15, s * 0.35, s * 0.12, 0, 0, PI * 2); ctx.fill();   // puff of dust
        ctx.restore();
      }
    }
    // Pigeons on the ledge of the right middle building: they burst into flight at 9s and drift back by 17s
    {
      const birds = [[0.715, 0.192], [0.735, 0.190], [0.755, 0.193], [0.775, 0.191]];
      const flyStart = 9.0, flyDur = 3.0, back = 16.0;
      birds.forEach(([bx, by], i) => {
        let x = W * bx, y = H * by, flying = 0, alpha = 1;
        if (m > flyStart && m < flyStart + flyDur) { const f = (m - flyStart) / flyDur; flying = 1; x -= f * W * (0.20 + i * 0.03); y -= f * H * (0.25 + i * 0.02) - Math.sin(f * PI) * H * 0.02; }
        else if (m >= flyStart + flyDur && m < back) return;
        else if (m >= back && m < back + 1) alpha = m - back;
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y);
        ctx.fillStyle = '#8a8c98';
        if (flying) {
          const flap = Math.sin(t * 22 + i);
          ctx.beginPath(); ctx.ellipse(0, 0, 3.2, 1.6, -0.3, 0, PI * 2); ctx.fill();
          ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(-5, -4 * flap); ctx.lineTo(1, -0.5); ctx.lineTo(5, -4 * flap); ctx.lineTo(1, 0); ctx.fill();
        } else {
          ctx.beginPath(); ctx.ellipse(0, -2, 2.6, 2.2, 0, 0, PI * 2); ctx.fill();
          ctx.fillStyle = '#6a6c78'; ctx.beginPath(); ctx.arc(-2, -4, 1.4, 0, PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(120,200,160,0.7)'; ctx.fillRect(-2.2, -3, 1.4, 1);                                           // iridescent neck
          ctx.fillStyle = '#5a5c68'; ctx.beginPath(); ctx.moveTo(1.5, -2); ctx.lineTo(4.5, -0.5); ctx.lineTo(1.5, -0.5); ctx.fill();
        }
        ctx.restore();
      });
    }
    // Patel Tea House's shutter: rolls up for the morning, comes down again just before the loop restarts
    {
      const ease = (u) => { u = Math.min(1, Math.max(0, u)); return u * u * (3 - 2 * u); };
      const open = ease((m - SHUTTER_UP[0]) / (SHUTTER_UP[1] - SHUTTER_UP[0])) - ease((m - SHUTTER_DOWN[0]) / (SHUTTER_DOWN[1] - SHUTTER_DOWN[0]));
      const x0 = W * 0.800, w = W * 0.210, fh = (H * 0.640 + H * 0.05) / 5, sy = H * 0.640 - fh;
      const top = sy + fh * 0.30, full = fh * 0.70, hh = full * (1 - open) + full * 0.06;
      ctx.save(); ctx.beginPath(); ctx.rect(x0 + w * 0.05, top, w * 0.90, full); ctx.clip();
      const g = ctx.createLinearGradient(0, top, 0, top + hh);
      g.addColorStop(0, '#8a9098'); g.addColorStop(1, '#a8aeb6');
      ctx.fillStyle = g; ctx.fillRect(x0 + w * 0.05, top, w * 0.90, hh);
      ctx.fillStyle = 'rgba(40,45,55,0.35)'; for (let y = top + hh - 1.5; y > top; y -= 2.6) ctx.fillRect(x0 + w * 0.05, y, w * 0.90, 0.8);   // corrugations
      ctx.fillStyle = '#5a6068'; ctx.fillRect(x0 + w * 0.05, top + hh - 2, w * 0.90, 2);                                   // bottom bar
      ctx.fillStyle = '#c8b030'; ctx.fillRect(x0 + w * 0.48, top + hh - 3.5, w * 0.04, 1.6);                              // padlock hasp
      ctx.restore();
    }
    // A stray ball: someone's lofted shot from off to the left sails over the lane, clips the
    // Patel Tea House awning and drops out of sight behind the rickshaw
    {
      const f = (m - STRAY_BALL[0]) / (STRAY_BALL[1] - STRAY_BALL[0]);
      if (f > 0 && f < 1) {
        const p0 = [-0.03, 0.46], pk = [0.40, 0.03], hit = [0.875, 0.545], drop = [0.93, 0.66];
        const ballAt = (u) => {
          if (u < 0.78) {                                   // the flight: a parabola through the peak
            const v = u / 0.78, x = p0[0] + (hit[0] - p0[0]) * v;
            const a = (x - pk[0]) / (x < pk[0] ? (p0[0] - pk[0]) : (hit[0] - pk[0]));
            const y = pk[1] + (x < pk[0] ? (p0[1] - pk[1]) : (hit[1] - pk[1])) * a * a;
            return [x, y];
          }
          const v = (u - 0.78) / 0.22;                      // the hop off the awning
          return [hit[0] + (drop[0] - hit[0]) * v, hit[1] - Math.sin(v * PI) * 0.05 + (drop[1] - hit[1]) * v * v];
        };
        const r = H * 0.013;
        for (let k = 4; k >= 0; k--) {                      // a faint trail
          const [x, y] = ballAt(Math.max(0, f - k * 0.012));
          ctx.fillStyle = k ? `rgba(220,240,90,${(0.16 * (5 - k) / 5).toFixed(3)})` : '#d8ec40';
          ctx.beginPath(); ctx.arc(W * x, H * y, r * (k ? 0.85 : 1), 0, PI * 2); ctx.fill();
        }
        const [x, y] = ballAt(f);
        ctx.fillStyle = 'rgba(255,255,230,0.7)'; ctx.beginPath(); ctx.arc(W * x - r * 0.3, H * y - r * 0.3, r * 0.35, 0, PI * 2); ctx.fill();
        // A little puff as it clips the awning
        const d = f - 0.78;
        if (d > 0 && d < 0.10) { ctx.fillStyle = `rgba(255,250,235,${(0.5 * (1 - d / 0.10)).toFixed(3)})`; ctx.beginPath(); ctx.arc(W * hit[0], H * hit[1], r * (1 + d * 25), 0, PI * 2); ctx.fill(); }
      }
    }
  }

  // In front of the props: steam curling up from the chai kettle, and dust motes drifting in the morning light
  function drawAmbientFront(ctx, W, H, t) {
    const m = t % SHOW;
    const pf = (m - POUR[0]) / (POUR[1] - POUR[0]);
    const pour = pf > 0 && pf < 1 ? Math.min(1, Math.sin(pf * PI) * 1.6) : 0;
    const [kx0, ky0] = drawKettle(ctx, W, H, pour);
    // The stream of chai into the first glass while the kettle is tipped
    if (pour > 0.8) {
      const sx = kx0 + 29.5, sy = ky0 - 12.5, gx = W * 0.115 + W * 0.150 * 0.02, gy = ky0 - 3;
      ctx.strokeStyle = '#a8662c'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(sx + 2, sy + 4, gx, gy); ctx.stroke();
    }
    // A puff of steam off the fresh glass just after the pour
    {
      const d = m - (POUR[1] - 0.6), gx = W * 0.115 + W * 0.150 * 0.02, gy = ky0 - 8;
      if (d > 0 && d < 2.2) for (let i = 0; i < 3; i++) {
        const u = Math.min(1, Math.max(0, (d - i * 0.25) / 1.6));
        if (u <= 0 || u >= 1) continue;
        ctx.fillStyle = `rgba(255,255,255,${(0.30 * Math.sin(u * PI)).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(gx + Math.sin(u * 4 + i) * 2, gy - u * H * 0.07, 1.5 + u * 4.5, 0, PI * 2); ctx.fill();
      }
    }
    const kx = kx0 + 14 + 15 * pour, ky = ky0 - 13 - 11 * pour;
    for (let i = 0; i < 6; i++) {
      const life = ((t * 0.55 + i / 6) % 1), x = kx + Math.sin(life * 5 + i) * 4 + life * 6, y = ky - life * H * 0.13;
      ctx.fillStyle = `rgba(255,255,255,${(0.32 * (1 - pour) * Math.sin(life * PI)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(x, y, 2.5 + life * 7, 0, PI * 2); ctx.fill();
    }
    let s = 99; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    for (let i = 0; i < 26; i++) {
      const x0 = r() * W, y0 = H * (0.12 + r() * 0.50), sp = 0.3 + r() * 0.6, ph = r() * 6;
      const x = (x0 + t * 4 * sp) % W, y = y0 + Math.sin(t * sp + ph) * 6;
      ctx.fillStyle = `rgba(255,245,220,${(0.25 + 0.25 * Math.sin(t * 1.3 + ph)).toFixed(3)})`;
      ctx.fillRect(x, y, 1.2, 1.2);
    }
    // Marigold petals coming loose from the toran now and then, swaying down through the light
    [[0.27, 7.3, 0.0], [0.58, 11.1, 3.7], [0.71, 9.4, 6.2], [0.42, 13.7, 9.0]].forEach(([fx, period, off], i) => {
      const u = ((t + off) % period) / 4.2;                 // falls for 4.2s, then waits for its next turn
      if (u >= 1) return;
      const x = W * fx + Math.sin(u * PI * 3 + i) * W * 0.018 + u * W * 0.02, y = H * 0.07 + u * H * 0.42;
      const a = u < 0.1 ? u / 0.1 : u > 0.8 ? (1 - u) / 0.2 : 1;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(Math.sin(u * PI * 3 + i) * 0.9); ctx.scale(Math.cos(u * PI * 5 + i) * 0.6 + 0.4 || 0.1, 1);
      ctx.fillStyle = i % 2 ? '#ffb41a' : '#ff7a12'; ctx.beginPath(); ctx.ellipse(0, 0, 2.6, 1.6, 0, 0, PI * 2); ctx.fill();
      ctx.restore();
    });
    // Rickshaw exhaust: a little blue-grey puff every couple of seconds from the tailpipe
    {
      const ex = W * 0.905 - H * 0.16 * 0.56, ey = H * 0.715 - H * 0.16 * 0.10;
      for (let i = 0; i < 2; i++) {
        const u = ((t + i * 1.35) % 2.7) / 2.7;
        ctx.fillStyle = `rgba(150,155,170,${(0.30 * Math.sin(u * PI)).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(ex - u * W * 0.045, ey - u * H * 0.035 + Math.sin(u * 6) * 1.5, 2 + u * 6, 0, PI * 2); ctx.fill();
      }
    }
  }

  // ════════ PAINT — back → ambient (back) → props → ambient (front) → cup → haze ════════
  // (canvas passed in)
  const ctx = cvs.getContext('2d');
  const SCRATCH = document.createElement('canvas').getContext('2d');
  const back = document.createElement('canvas'); back.width = 620; back.height = 355;
  const front = document.createElement('canvas'); front.width = 620; front.height = 355;
  const rick = document.createElement('canvas'); rick.width = 620; rick.height = 355;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function paintBase() {
    const b = back.getContext('2d'); b.clearRect(0, 0, 620, 355); draw(b, 620, 355, 'back');
    const f = front.getContext('2d'); f.clearRect(0, 0, 620, 355);
    const r = rick.getContext('2d'); r.clearRect(0, 0, 620, 355);
    RICK_CTX = r; KETTLE_SKIP = true; draw(f, 620, 355, 'front'); RICK_CTX = null; KETTLE_SKIP = false;
  }
  function frame(ms) {
    const t = reduceMotion ? 0 : ms / 1000;
    ctx.clearRect(0, 0, 620, 355);
    ctx.drawImage(back, 0, 0);
    drawAmbientBack(ctx, 620, 355, t);
    ctx.drawImage(front, 0, 0);
    // The parked rickshaw ticks over: a fine engine shudder
    ctx.drawImage(rick, Math.sin(t * 41) * 0.35, Math.sin(t * 57) * 0.45 + Math.sin(t * 23) * 0.2);
    drawTrophy(ctx, 620, 355, (t / TURN_SECONDS) * PI * 2, t);
    drawAmbientFront(ctx, 620, 355, t);
    drawAtmos(ctx, 620, 355);
  }
  function loop(ms) { if (!__running) return; __elapsed = ms - __t0; __frame(__elapsed); requestAnimationFrame(loop); }
  paintBase(); __frame(0);
  let repainted = false;
  const repaint = () => { if (!repainted) { repainted = true; paintBase(); __frame(__elapsed); } };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(repaint).catch(() => {});
  setTimeout(repaint, 2000);
  return {
    start() { if (__running) return; if (reduceMotion) { __frame(0); return; } __running = true; __t0 = performance.now() - __elapsed; requestAnimationFrame(loop); },
    stop() { __running = false; },
  };
}
function makeLeagueArt_floodlit(cvs) {
  let __running = false, __t0 = 0, __elapsed = 0;
  // Soft fade at the foot of the art so it melts into the card's info panel
  function __fade() {
    const g = ctx.createLinearGradient(0, 355 * 0.78, 0, 355);
    g.addColorStop(0, 'rgba(8,8,18,0)'); g.addColorStop(1, 'rgba(8,8,18,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 355 * 0.78, 620, 355 * 0.22);
  }
  function __frame(ms) { frame(ms); __fade(); }
  const PI = Math.PI;
  const SHOW = 20;                                   // shared schedule for the "moments", seconds
  const TURN_SECONDS = 10.3;                         // one full turn of the cup
  // Moments on the shared schedule (seconds into SHOW), spread so something is always just starting:
  // phone-torch wave 0.6–2.6 · fireworks 3.0–8.2 (+ flashes) · SIX! 8.4–10.0 (+ flashes) · wicket 10.2–12.0 ·
  // fireworks again 12.8–18.0 (+ flashes) · lamp bank warms up 18.2–19.4
  const SIX = [8.4, 10.0], WICKET = [10.2, 12.0], LAMP_WARM = [18.2, 19.4], WAVE = [0.6, 2.6];
  const FW_SHOWS = [[3.0, 8.2], [12.8, 18.0]];       // two trophy-lift firework shows per loop
  const fwWin = (m) => { for (let v = 0; v < FW_SHOWS.length; v++) { const f = win(m, FW_SHOWS[v]); if (f > 0) return { f, T: f * (FW_SHOWS[v][1] - FW_SHOWS[v][0]), v }; } return null; };
  const FLASHES = [[3.5, 5.0], [9.2, 10.2], [13.3, 14.9]];
  const FW_HASH = (n) => { const v = Math.sin(n * 127.1) * 43758.5453; return v - Math.floor(v); };
  const FW_RGB = { gold: [255, 206, 110], pink: [255, 110, 170], white: [238, 242, 255], cyan: [120, 220, 255], red: [255, 90, 80] };
  // Every shell in a show: [launch time, x, burst height, colour, size, seed]
  function fwShells(V) {
    const cols = ['gold', 'pink', 'white', 'cyan', 'red', 'gold', 'white'], out = [];
    for (let k = 0; k < 30; k++) {
      const t0 = 0.05 + Math.floor(k / 2) * 0.20 + (k % 2) * 0.07;
      const fx = (k % 2 ? 0.52 : 0.04) + FW_HASH(k * 3.1 + V * 17) * 0.44, fy = 0.03 + FW_HASH(k * 5.3 + V * 7) * 0.13;
      out.push([t0, fx, fy, cols[Math.floor(FW_HASH(k * 9.7 + V) * cols.length)], 0.09 + 0.05 * FW_HASH(k * 2.3 + V), k + V * 40]);
    }
    [0.06, 0.20, 0.35, 0.50, 0.65, 0.80, 0.94].forEach((fx, k) => out.push([3.2 + (k % 2) * 0.06, fx, 0.05 + (k % 3) * 0.035, cols[(k + V * 2) % cols.length], 0.17, 100 + k + V * 40]));
    return out;
  }
  // The colour and strength of firework light falling on the scene right now
  function fwLight(m) {
    const fw = fwWin(m); if (!fw) return null;
    let r = 0, g = 0, b = 0, w = 0;
    if (fw.T > 0.05 && fw.T < 3.6) { const c = fw.v ? FW_RGB.pink : FW_RGB.gold, k = 0.35; r += c[0] * k; g += c[1] * k; b += c[2] * k; w += k; }
    fwShells(fw.v).forEach(([t0, , , col, size]) => {
      const db = fw.T - t0 - 0.42; if (db < 0 || db > 0.7) return;
      const k = Math.pow(1 - db / 0.7, 2) * size / 0.12, c = FW_RGB[col];
      r += c[0] * k; g += c[1] * k; b += c[2] * k; w += k;
    });
    if (w <= 0) return null;
    return { r: Math.round(r / w), g: Math.round(g / w), b: Math.round(b / w), a: Math.min(1, w * 0.45), T: fw.T };
  }
  const SCREEN = [0.705, 0.313, 0.865, 0.420];       // big screen on the stand (x0, y0, x1, y1)
  const TRUCK = { x0: -0.02, x1: 0.215, base: 0.715, top: 0.535 };
  const FONT = (wt, px) => `${wt} ${px}px 'Barlow Condensed', 'Arial Narrow', sans-serif`;
  const win = (m, [a, b]) => { const f = (m - a) / (b - a); return f > 0 && f < 1 ? f : -1; };

  // Layout shared by the still scene and the animation
  const ROOF_Y = 0.285, WIN_Y0 = 0.335, WIN_Y1 = 0.400, RIB_Y0 = 0.440, RIB_Y1 = 0.474, BASE_Y = 0.560;
  const GATES = [[0.285, 'GATE 4'], [0.770, 'GATE 5']];
  const PYLONS = [[0.095, 0.050, 1.00], [0.255, 0.095, 0.72], [0.745, 0.095, 0.72], [0.905, 0.050, 1.00]];   // x, head y, scale
  const LAMP = [0.195, 0.300];                       // plaza lamp post lantern

  // ════════ STILL SCENE — outside the ground on a match night, floodlights blazing over the roof ════════
  function draw(ctxReal, W, H, part) {
    let ctx = part === 'front' ? SCRATCH : ctxReal;
    let seed = 21;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const glow = (x, y, r, col) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    };

    // ── Night sky: deep navy, a little lighter low down where the lights bleed into the haze ──
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.56);
    sky.addColorStop(0, '#060a22'); sky.addColorStop(0.55, '#141a46'); sky.addColorStop(1, '#2a2a5a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.60);
    for (let i = 0; i < 70; i++) {                   // stars (the brightest few twinkle in the animation layer)
      const x = rnd() * W, y = rnd() * H * 0.26, a = 0.25 + rnd() * 0.5;
      ctx.fillStyle = `rgba(230,236,255,${a.toFixed(2)})`; ctx.fillRect(x, y, rnd() < 0.15 ? 1.6 : 1, rnd() < 0.15 ? 1.6 : 1);
    }
    // A crescent moon
    { const mx = W * 0.585, my = H * 0.070, mr = H * 0.024;
      glow(mx, my, mr * 4, 'rgba(180,190,255,0.16)');
      ctx.fillStyle = '#f2f0e0'; ctx.beginPath(); ctx.arc(mx, my, mr, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#0a0f2c'; ctx.beginPath(); ctx.arc(mx + mr * 0.45, my - mr * 0.18, mr * 0.92, 0, PI * 2); ctx.fill(); }

    // ── The bowl's light spilling up over the roof into the night haze ──
    {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const d = ctx.createRadialGradient(W * 0.5, H * 0.34, W * 0.05, W * 0.5, H * 0.34, W * 0.62);
      d.addColorStop(0, 'rgba(150,170,255,0.40)'); d.addColorStop(0.45, 'rgba(110,120,220,0.16)'); d.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.translate(0, H * 0.34); ctx.scale(1, 0.55); ctx.translate(0, -H * 0.34);
      ctx.fillStyle = d; ctx.fillRect(0, 0, W, H); ctx.restore();
    }

    // ── Four floodlight pylons behind the stand: lattice masts with tilted banks of lamps ──
    PYLONS.forEach(([fx, hy, sc], i) => {
      const x = W * fx, headY = H * hy, foot = H * (ROOF_Y + 0.02), lean = fx < 0.5 ? 1 : -1;
      const wb = W * 0.012 * sc, wt = W * 0.005 * sc;
      ctx.strokeStyle = sc < 1 ? '#3a4278' : '#434c88'; ctx.lineWidth = 1.3 * sc;
      ctx.beginPath(); ctx.moveTo(x - wb, foot); ctx.lineTo(x - wt, headY + H * 0.04 * sc); ctx.moveTo(x + wb, foot); ctx.lineTo(x + wt, headY + H * 0.04 * sc); ctx.stroke();
      ctx.lineWidth = 0.7 * sc;                      // cross-bracing
      const n = 12; ctx.beginPath();
      for (let k = 0; k <= n; k++) {
        const u = k / n, y = foot + (headY + H * 0.04 * sc - foot) * u, hw = wb + (wt - wb) * u;
        k % 2 ? ctx.lineTo(x + hw, y) : (k ? ctx.lineTo(x - hw, y) : ctx.moveTo(x - hw, y));
      }
      ctx.stroke();
      // Head: a frame of lamps angled down towards the middle
      const hw = W * 0.040 * sc, hh = H * 0.050 * sc;
      glow(x, headY + hh * 0.5, W * 0.13 * sc, 'rgba(210,225,255,0.30)');
      ctx.save(); ctx.translate(x, headY + hh * 0.5); ctx.transform(1, lean * 0.10, 0, 1, 0, 0);
      ctx.fillStyle = '#20264e'; ctx.fillRect(-hw / 2 - 2, -hh / 2 - 2, hw + 4, hh + 4);
      const cols = 6, rows = 4;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const lx = -hw / 2 + hw * (c + 0.5) / cols, ly = -hh / 2 + hh * (r + 0.5) / rows, lr = Math.min(hw / cols, hh / rows) * 0.40;
        ctx.fillStyle = '#fbfcff'; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, PI * 2); ctx.fill();
      }
      ctx.restore();
      glow(x, headY + hh * 0.5, W * 0.045 * sc, 'rgba(255,255,255,0.55)');
    });

    // ── The stand, seen from the plaza ──
    const roofY = (x) => H * ROOF_Y + H * 0.035 * Math.pow((x - W * 0.5) / (W * 0.5), 2);
    // Far side of the bowl peeking over the roof: a dark rim of the opposite stand, lit from inside
    ctx.fillStyle = '#1a1e44';
    ctx.beginPath(); ctx.moveTo(W * 0.18, roofY(W * 0.18)); ctx.quadraticCurveTo(W * 0.5, H * 0.235, W * 0.82, roofY(W * 0.82)); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(200,215,255,0.35)';
    ctx.beginPath(); ctx.moveTo(W * 0.20, roofY(W * 0.20) - 1); ctx.quadraticCurveTo(W * 0.5, H * 0.238, W * 0.80, roofY(W * 0.80) - 1);
    ctx.quadraticCurveTo(W * 0.5, H * 0.246, W * 0.20, roofY(W * 0.20) - 1); ctx.fill();
    // Facade panels
    ctx.beginPath(); ctx.moveTo(0, roofY(0));
    for (let k = 0; k <= 40; k++) { const x = W * k / 40; ctx.lineTo(x, roofY(x)); }
    ctx.lineTo(W, H * BASE_Y); ctx.lineTo(0, H * BASE_Y); ctx.closePath();
    const fg = ctx.createLinearGradient(0, H * ROOF_Y, 0, H * BASE_Y);
    fg.addColorStop(0, '#262c58'); fg.addColorStop(1, '#1a1e3e');
    ctx.fillStyle = fg; ctx.fill();
    // Roof: a deep cantilever edge with a lit underside
    ctx.strokeStyle = '#0e1230'; ctx.lineWidth = H * 0.020;
    ctx.beginPath(); for (let k = 0; k <= 40; k++) { const x = W * k / 40; k ? ctx.lineTo(x, roofY(x)) : ctx.moveTo(x, roofY(x)); } ctx.stroke();
    ctx.strokeStyle = 'rgba(190,205,255,0.45)'; ctx.lineWidth = 1;
    ctx.beginPath(); for (let k = 0; k <= 40; k++) { const x = W * k / 40; k ? ctx.lineTo(x, roofY(x) + H * 0.011) : ctx.moveTo(x, roofY(x) + H * 0.011); } ctx.stroke();
    // Vertical fins
    for (let k = 0; k < 34; k++) {
      const x = W * (k + 0.5) / 34, y0 = roofY(x) + H * 0.012;
      ctx.fillStyle = 'rgba(70,80,140,0.45)'; ctx.fillRect(x, y0, 1.6, H * (WIN_Y0 - 0.005) - y0);
      ctx.fillRect(x, H * (WIN_Y1 + 0.005), 1.6, H * (RIB_Y0 - WIN_Y1 - 0.01));
    }
    // Concourse glazing: warm light, a few silhouettes inside (camera flashes pop here)
    {
      const y0 = H * WIN_Y0, y1 = H * WIN_Y1;
      const wg = ctx.createLinearGradient(0, y0, 0, y1);
      wg.addColorStop(0, '#ffd9a0'); wg.addColorStop(1, '#e89a58');
      ctx.fillStyle = wg; ctx.fillRect(0, y0, W, y1 - y0);
      ctx.fillStyle = 'rgba(40,30,40,0.55)';
      for (let i = 0; i < 46; i++) { const x = rnd() * W, h = (y1 - y0) * (0.45 + rnd() * 0.3); ctx.beginPath(); ctx.arc(x, y1 - h, 1.7, 0, PI * 2); ctx.fill(); ctx.fillRect(x - 1.8, y1 - h + 1.2, 3.6, h); }
      ctx.fillStyle = 'rgba(30,30,60,0.75)'; for (let k = 0; k <= 34; k++) ctx.fillRect(W * k / 34 - 0.6, y0, 1.2, y1 - y0);
      ctx.fillRect(0, y0 - 1, W, 2); ctx.fillRect(0, y1 - 1, W, 2.5);
    }
    // Stair cores breaking up the glazing; the left one carries the club crest
    [[0.105, 0.052, true], [0.640, 0.046, false]].forEach(([fx, fw, crest]) => {
      const x = W * fx, w = W * fw, y0 = roofY(x + w / 2) + H * 0.010, y1 = H * (RIB_Y0 - 0.004);
      const cg = ctx.createLinearGradient(x, 0, x + w, 0);
      cg.addColorStop(0, '#2a3060'); cg.addColorStop(1, '#181c3c');
      ctx.fillStyle = cg; ctx.fillRect(x, y0, w, y1 - y0);
      ctx.fillStyle = 'rgba(255,214,150,0.65)';
      for (let k = 0; y0 + 6 + k * 8 < y1 - 4; k++) ctx.fillRect(x + w * (k % 2 ? 0.62 : 0.30), y0 + 6 + k * 8, w * 0.10, 3);
      if (crest) {
        const cx = x + w / 2, cy = (y0 + y1) / 2 + 2, cs = w * 0.36;
        ctx.beginPath(); ctx.moveTo(cx - cs, cy - cs * 1.05); ctx.lineTo(cx + cs, cy - cs * 1.05); ctx.lineTo(cx + cs, cy + cs * 0.1);
        ctx.quadraticCurveTo(cx + cs * 0.9, cy + cs * 0.9, cx, cy + cs * 1.3); ctx.quadraticCurveTo(cx - cs * 0.9, cy + cs * 0.9, cx - cs, cy + cs * 0.1); ctx.closePath();
        ctx.fillStyle = '#1a2060'; ctx.fill(); ctx.strokeStyle = '#f0c040'; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.strokeStyle = '#f2f4ff'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(cx - cs * 0.55, cy - cs * 0.6); ctx.lineTo(cx + cs * 0.45, cy + cs * 0.6); ctx.moveTo(cx + cs * 0.55, cy - cs * 0.6); ctx.lineTo(cx - cs * 0.45, cy + cs * 0.6); ctx.stroke();
        ctx.fillStyle = '#ff5a98'; ctx.beginPath(); ctx.arc(cx, cy - cs * 0.15, cs * 0.26, 0, PI * 2); ctx.fill();
        ctx.fillStyle = '#f0c040'; ctx.beginPath(); ctx.moveTo(cx - cs * 0.4, cy - cs * 1.05); ctx.lineTo(cx - cs * 0.25, cy - cs * 1.35); ctx.lineTo(cx, cy - cs * 1.1); ctx.lineTo(cx + cs * 0.25, cy - cs * 1.35); ctx.lineTo(cx + cs * 0.4, cy - cs * 1.05); ctx.closePath(); ctx.fill();
      }
    });
    // Big screen frame (its picture is animated)
    { const [a, b, c, d] = SCREEN;
      ctx.fillStyle = '#0a0b16'; ctx.fillRect(W * a - 3, H * b - 3, W * (c - a) + 6, H * (d - b) + 6);
      ctx.fillStyle = '#3a4070'; ctx.fillRect(W * a - 3, H * d + 3, W * (c - a) + 6, 1.5);
      ctx.fillStyle = '#2a2e50'; ctx.fillRect(W * (a + c) / 2 - 2, H * d + 3, 4, H * (RIB_Y0 - d) - 3); }

    // LED ribbon board housing (the text is animated)
    ctx.fillStyle = '#07080f'; ctx.fillRect(0, H * RIB_Y0, W, H * (RIB_Y1 - RIB_Y0));
    ctx.fillStyle = 'rgba(120,130,200,0.30)'; ctx.fillRect(0, H * RIB_Y0 - 1, W, 1); ctx.fillRect(0, H * RIB_Y1, W, 1);
    // Ground level wall and the gates
    ctx.fillStyle = '#151834'; ctx.fillRect(0, H * (RIB_Y1 + 0.004), W, H * (BASE_Y - RIB_Y1));
    GATES.forEach(([fx, label]) => {
      const x = W * fx, gw = W * 0.072, top = H * 0.492, bot = H * BASE_Y;
      const gl = ctx.createLinearGradient(0, top, 0, bot);
      gl.addColorStop(0, '#f8e6b8'); gl.addColorStop(1, '#c8904a');
      ctx.fillStyle = gl; ctx.fillRect(x - gw / 2, top, gw, bot - top);
      ctx.fillStyle = 'rgba(60,50,60,0.7)';                                    // turnstiles
      for (let k = 0; k < 3; k++) { const tx = x - gw * 0.33 + k * gw * 0.33; ctx.fillRect(tx - 2.5, bot - H * 0.022, 5, H * 0.022); }
      ctx.fillStyle = '#f2f4ff'; ctx.fillRect(x - gw * 0.42, H * 0.479, gw * 0.84, H * 0.016);  // sign
      ctx.fillStyle = '#1a2060'; ctx.font = FONT(800, H * 0.013); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, x, H * 0.4875);
      // Light pooling out of the gate onto the plaza
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const pg = ctx.createRadialGradient(x, bot, 0, x, bot, W * 0.09);
      pg.addColorStop(0, 'rgba(255,210,150,0.35)'); pg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.translate(0, bot); ctx.scale(1, 0.35); ctx.translate(0, -bot); ctx.fillStyle = pg; ctx.fillRect(x - W * 0.1, bot - W * 0.1, W * 0.2, W * 0.2); ctx.restore();
    });
    // Flags on the roof
    [[0.335, '#e8336a'], [0.665, '#2ac0d0']].forEach(([fx]) => {
      const x = W * fx, y = roofY(x);
      ctx.strokeStyle = '#8a90b0'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - H * 0.055); ctx.stroke();
    });

    // ── The plaza: dark paving, wet-looking reflections of the gates and lights ──
    {
      const top = H * BASE_Y;
      const pg = ctx.createLinearGradient(0, top, 0, H);
      pg.addColorStop(0, '#2a2c48'); pg.addColorStop(1, '#14152a');
      ctx.fillStyle = pg; ctx.fillRect(0, top, W, H - top);
      ctx.strokeStyle = 'rgba(120,130,190,0.12)'; ctx.lineWidth = 0.7;
      for (let k = -10; k <= 10; k++) { ctx.beginPath(); ctx.moveTo(W * 0.5 + k * W * 0.035, top); ctx.lineTo(W * 0.5 + k * W * 0.16, H); ctx.stroke(); }
      for (let k = 1; k < 9; k++) { const y = top + (H - top) * Math.pow(k / 9, 1.6); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.fillStyle = '#0e1028'; ctx.fillRect(0, top, W, 1.5);
    }
    // Rain-wet paving: long soft reflections of everything lit, broken by the paving joints
    {
      const top = H * BASE_Y;
      const refl = (x, w, y0, len, col) => {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(0, y0, 0, y0 + len);
        g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        for (let k = 0; k < 16; k++) {
          const yy = y0 + len * k / 16, ww = w * (1 + k * 0.05) * (0.75 + rnd() * 0.5), xx = x + (rnd() - 0.5) * 3;
          ctx.save(); ctx.beginPath(); ctx.ellipse(xx, yy + len / 32, ww / 2, len / 32 + 0.3, 0, 0, PI * 2); ctx.clip();
          ctx.fillRect(xx - ww / 2, yy, ww, len / 16); ctx.restore();
        }
        ctx.restore();
      };
      refl(W * 0.5, W, top, H * 0.045, 'rgba(255,190,120,0.10)');                                   // the glazing band
      GATES.forEach(([fx]) => refl(W * fx, W * 0.050, top + 1, H * 0.15, 'rgba(255,205,140,0.38)'));
      refl(W * (SCREEN[0] + SCREEN[2]) / 2, W * 0.10, top + 1, H * 0.11, 'rgba(120,170,255,0.18)');
      refl(W * LAMP[0], 7, H * 0.632, H * 0.10, 'rgba(255,225,160,0.30)');
      PYLONS.forEach(([fx, , sc]) => refl(W * fx, W * 0.03 * sc, top + 1, H * 0.06 * sc, 'rgba(210,225,255,0.10)'));
      // A couple of glossy puddles
      [[0.36, 0.600, 0.05], [0.83, 0.620, 0.06], [0.24, 0.680, 0.07]].forEach(([fx, fy, fw]) => {
        ctx.fillStyle = 'rgba(90,100,170,0.20)'; ctx.beginPath(); ctx.ellipse(W * fx, H * fy, W * fw, H * 0.008, 0, 0, PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(220,230,255,0.18)'; ctx.fillRect(W * (fx - fw * 0.5), H * fy - 0.5, W * fw * 0.6, 0.8);
      });
    }
    // A plaza lamp post (moths circle the lantern in the animation)
    {
      const x = W * LAMP[0], y = H * LAMP[1];
      ctx.fillStyle = '#2a2e4a'; ctx.fillRect(x - 1.3, y, 2.6, H * 0.33);
      ctx.fillStyle = '#3a3e5a'; ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.lineTo(x + 3, y - 4); ctx.lineTo(x - 3, y - 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff2c8'; ctx.fillRect(x - 4, y, 8, 7);
      glow(x, y + 4, W * 0.07, 'rgba(255,230,170,0.40)');
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const pg = ctx.createRadialGradient(x, H * 0.63, 0, x, H * 0.63, W * 0.07);
      pg.addColorStop(0, 'rgba(255,220,160,0.30)'); pg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.translate(0, H * 0.63); ctx.scale(1, 0.3); ctx.translate(0, -H * 0.63); ctx.fillStyle = pg; ctx.fillRect(x - W * 0.08, H * 0.63 - W * 0.08, W * 0.16, W * 0.16); ctx.restore();
    }

    if (part === 'back') return;
    ctx = ctxReal;

    // ════════ FRONT LAYER — food truck, LED stumps, a chalkboard sign ════════
    // "Boundary Bites" food truck on the left, cab cut off by the frame
    {
      const x0 = -W * 0.02, x1 = W * 0.215, base = H * 0.715, top = H * 0.535;
      ctx.fillStyle = 'rgba(0,0,10,0.45)'; ctx.beginPath(); ctx.ellipse((x0 + x1) / 2, base + 2, (x1 - x0) * 0.55, H * 0.014, 0, 0, PI * 2); ctx.fill();
      const bg = ctx.createLinearGradient(0, top, 0, base);
      bg.addColorStop(0, '#e8e6f0'); bg.addColorStop(1, '#a8a6c0');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x0, top, x1 - x0, base - top - H * 0.02, 5); ctx.fill();
      ctx.fillStyle = '#1aa8b8'; ctx.fillRect(x0, base - H * 0.055, x1 - x0, H * 0.018);                   // teal stripe
      ctx.fillStyle = '#e8336a'; ctx.fillRect(x0, base - H * 0.037, x1 - x0, H * 0.005);
      // Serving hatch, lit from inside, with a propped-up flap
      const hx0 = x0 + (x1 - x0) * 0.22, hx1 = x1 - (x1 - x0) * 0.08, hy0 = top + H * 0.040, hy1 = top + H * 0.105;
      const hg = ctx.createLinearGradient(0, hy0, 0, hy1);
      hg.addColorStop(0, '#fff0c8'); hg.addColorStop(1, '#f0b060');
      ctx.fillStyle = hg; ctx.fillRect(hx0, hy0, hx1 - hx0, hy1 - hy0);
      ctx.fillStyle = 'rgba(80,50,30,0.55)'; for (let k = 0; k < 4; k++) ctx.fillRect(hx0 + 4 + k * 10, hy0 + 4, 6, 3);   // jars on a shelf
      ctx.fillStyle = '#c8c6d8'; ctx.beginPath(); ctx.moveTo(hx0 - 3, hy0); ctx.lineTo(hx1 + 3, hy0); ctx.lineTo(hx1 + 8, hy0 - H * 0.030); ctx.lineTo(hx0 - 8, hy0 - H * 0.030); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d0cee0'; ctx.fillRect(hx0 - 2, hy1, hx1 - hx0 + 4, 3);                              // counter
      // Name across the top
      ctx.fillStyle = '#1a2060'; ctx.font = FONT(900, H * 0.026); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('BOUNDARY BITES', (x0 + x1) / 2 + W * 0.01, top + H * 0.020, (x1 - x0) * 0.9);
      // Menu board
      ctx.fillStyle = '#1a1a24'; ctx.fillRect(x0 + (x1 - x0) * 0.02, hy0, (x1 - x0) * 0.17, H * 0.07);
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; for (let k = 0; k < 5; k++) ctx.fillRect(x0 + (x1 - x0) * 0.04, hy0 + 4 + k * 4.5, (x1 - x0) * (0.08 + (k % 3) * 0.02), 1.2);
      // Wheels
      [0.25, 0.80].forEach(f => { const wx = x0 + (x1 - x0) * f; ctx.fillStyle = '#0c0c14'; ctx.beginPath(); ctx.arc(wx, base - H * 0.018, H * 0.024, 0, PI * 2); ctx.fill(); ctx.fillStyle = '#5a5c70'; ctx.beginPath(); ctx.arc(wx, base - H * 0.018, H * 0.010, 0, PI * 2); ctx.fill(); });
      // Server leaning out of the hatch, and a customer at the counter
      ctx.fillStyle = 'rgba(40,24,30,0.85)';
      { const sx = hx0 + (hx1 - hx0) * 0.58, sy = hy1; ctx.beginPath(); ctx.arc(sx, sy - H * 0.040, H * 0.011, 0, PI * 2); ctx.fill(); ctx.beginPath(); ctx.roundRect(sx - H * 0.016, sy - H * 0.029, H * 0.032, H * 0.030, 3); ctx.fill(); }
      { const cx = x0 + (x1 - x0) * 0.40, cb = base - H * 0.004, ch = H * 0.105;
        ctx.fillStyle = '#0c0c1a';
        ctx.beginPath(); ctx.arc(cx, cb - ch * 0.90, ch * 0.095, 0, PI * 2); ctx.fill();
        ctx.beginPath(); ctx.roundRect(cx - ch * 0.13, cb - ch * 0.80, ch * 0.26, ch * 0.46, ch * 0.05); ctx.fill();
        ctx.fillRect(cx - ch * 0.10, cb - ch * 0.36, ch * 0.08, ch * 0.36); ctx.fillRect(cx + ch * 0.02, cb - ch * 0.36, ch * 0.08, ch * 0.36);
        ctx.fillStyle = '#e8336a'; ctx.fillRect(cx - ch * 0.13, cb - ch * 0.78, ch * 0.26, ch * 0.06);                   // scarf
        ctx.fillStyle = 'rgba(255,200,130,0.45)'; ctx.fillRect(cx + ch * 0.11, cb - ch * 0.78, 1.2, ch * 0.42); }       // hatch light on their side
      // Little chimney (steam in the animation)
      ctx.fillStyle = '#6a6c80'; ctx.fillRect(x0 + (x1 - x0) * 0.35, top - H * 0.022, 5, H * 0.022);
    }
    // LED stumps to the right of the cup (the bails glow; they flash on the wicket moment)
    {
      const sx = W * 0.685, base = H * 0.705;
      ctx.fillStyle = 'rgba(0,0,10,0.45)'; ctx.beginPath(); ctx.ellipse(sx + W * 0.008, base + 3, W * 0.032, H * 0.010, 0, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#2a2c3c'; ctx.beginPath(); ctx.ellipse(sx, base, W * 0.028, H * 0.008, 0, 0, PI * 2); ctx.fill();   // base plate
      [-1, 0, 1].forEach(k => {
        const x = sx + k * W * 0.0135, h = H * 0.155, r = W * 0.0055;
        const g = ctx.createLinearGradient(x - r, 0, x + r, 0);
        g.addColorStop(0, '#f6f6fa'); g.addColorStop(0.45, '#c8c8d4'); g.addColorStop(1, '#5a5a6a');
        ctx.fillStyle = g; ctx.fillRect(x - r, base - h, r * 2, h);
        ctx.fillStyle = '#1a1c2a'; ctx.fillRect(x - r, base - h * 0.42, r * 2, h * 0.16);        // black band
        ctx.fillStyle = '#e8336a'; ctx.fillRect(x - r, base - h * 0.27, r * 2, h * 0.025);
        ctx.fillStyle = 'rgba(160,200,255,0.5)'; ctx.fillRect(x - r * 0.6, base - h + 2, 0.8, h - 4);   // floodlight on the edge
      });
    }
    // Chalkboard sign on the right
    {
      const bx = W * 0.895, base = H * 0.715, bw = W * 0.090, bh = H * 0.125;
      ctx.fillStyle = 'rgba(0,0,10,0.45)'; ctx.beginPath(); ctx.ellipse(bx, base + 2, bw * 0.6, H * 0.010, 0, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#6a4a2a'; ctx.beginPath(); ctx.moveTo(bx - bw / 2 - 4, base); ctx.lineTo(bx - bw / 2 + 2, base - bh - 4); ctx.lineTo(bx + bw / 2 - 2, base - bh - 4); ctx.lineTo(bx + bw / 2 + 4, base); ctx.lineTo(bx + bw / 2, base); ctx.lineTo(bx + bw / 2 - 5, base - bh); ctx.lineTo(bx - bw / 2 + 5, base - bh); ctx.lineTo(bx - bw / 2, base); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1e2a26'; ctx.beginPath(); ctx.moveTo(bx - bw / 2 + 1, base - 3); ctx.lineTo(bx - bw / 2 + 5.5, base - bh + 1); ctx.lineTo(bx + bw / 2 - 5.5, base - bh + 1); ctx.lineTo(bx + bw / 2 - 1, base - 3); ctx.closePath(); ctx.fill();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.font = FONT(800, H * 0.020); ctx.fillText('TONIGHT', bx, base - bh * 0.78);
      ctx.fillStyle = '#ff8ab0'; ctx.font = FONT(900, H * 0.030); ctx.fillText('7:30PM', bx, base - bh * 0.56);
      ctx.fillStyle = 'rgba(255,255,255,0.80)'; ctx.font = FONT(700, H * 0.016); ctx.fillText('UNDER THE LIGHTS', bx, base - bh * 0.34, bw * 0.8);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(bx - bw * 0.25, base - bh * 0.22); ctx.lineTo(bx + bw * 0.25, base - bh * 0.22); ctx.stroke();
    }
  }

  // Night haze near the ground and a deep vignette
  function drawAtmos(ctx, W, H) {
    const haze = ctx.createLinearGradient(0, H * 0.40, 0, H * 0.62);
    haze.addColorStop(0, 'rgba(120,130,220,0)'); haze.addColorStop(1, 'rgba(120,130,220,0.08)');
    ctx.fillStyle = haze; ctx.fillRect(0, H * 0.40, W, H * 0.22);
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.40, W * 0.22, W * 0.5, H * 0.40, W * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(0.7, 'rgba(0,0,20,0.10)'); vig.addColorStop(1, 'rgba(0,0,20,0.40)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  }

  // ════════ THE FLOODLIT CUP — a faceted crystal cup with a pink ball sealed inside ════════
  // Ten flat facets catch the floodlights behind it as it turns; the pink day-night ball sits in the
  // crystal and turns with it. Black gloss plinth with a cool LED line. phi = turn angle; t = seconds.
  function drawTrophy(ctx, W, H, phi, t) {
    const tx = W * 0.5, tb = H * 0.705, S = H * 0.390, K = 1.45, TILT = 0.09;
    const P = (r, y, a) => [tx + r * Math.sin(a), y + r * Math.cos(a) * TILT];
    const chrome = (x0, x1) => {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, '#3a3e58'); g.addColorStop(0.18, '#e8ecff'); g.addColorStop(0.35, '#9aa0c0');
      g.addColorStop(0.55, '#5a6080'); g.addColorStop(0.80, '#c8d0f0'); g.addColorStop(1, '#2a2e48');
      return g;
    };
    const breathe = 0.5 + 0.5 * Math.sin(t * PI * 2 / 4.7);
    ctx.save(); ctx.translate(tx, tb); ctx.scale(K, K); ctx.translate(-tx, -tb);
    // Shadow: lit from behind, so it falls forward towards us
    const shg = ctx.createLinearGradient(0, tb, 0, tb + H * 0.06);
    shg.addColorStop(0, 'rgba(0,0,10,0.55)'); shg.addColorStop(1, 'rgba(0,0,10,0)');
    ctx.fillStyle = shg; ctx.beginPath(); ctx.moveTo(tx - W * 0.075, tb); ctx.lineTo(tx + W * 0.075, tb); ctx.lineTo(tx + W * 0.095, tb + H * 0.06); ctx.lineTo(tx - W * 0.095, tb + H * 0.06); ctx.closePath(); ctx.fill();

    // ── Plinth: black gloss block with a silver plate and a cool LED line round the top ──
    const pW = W * 0.068, pH = S * 0.22, dep = S * 0.040, pTop = tb - pH;
    ctx.fillStyle = '#20243c'; ctx.beginPath(); ctx.moveTo(tx - pW, pTop); ctx.lineTo(tx - pW + W * 0.012, pTop - dep); ctx.lineTo(tx + pW - W * 0.012, pTop - dep); ctx.lineTo(tx + pW, pTop); ctx.closePath(); ctx.fill();
    const pg = ctx.createLinearGradient(tx - pW, 0, tx + pW, 0);
    pg.addColorStop(0, '#2a2e48'); pg.addColorStop(0.12, '#0c0e1c'); pg.addColorStop(0.5, '#080a14'); pg.addColorStop(0.88, '#0c0e1c'); pg.addColorStop(1, '#262a44');
    ctx.fillStyle = pg; ctx.fillRect(tx - pW, pTop, pW * 2, pH);
    ctx.fillStyle = 'rgba(170,190,255,0.10)'; ctx.fillRect(tx - pW * 0.80, pTop + 2, pW * 0.12, pH - 4); ctx.fillRect(tx + pW * 0.62, pTop + 2, pW * 0.06, pH - 4);   // floodlight reflections in the gloss
    const led = 0.65 + 0.35 * breathe;
    ctx.fillStyle = `rgba(150,210,255,${led.toFixed(3)})`; ctx.fillRect(tx - pW, pTop - 0.6, pW * 2, 1.4);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const lg = ctx.createLinearGradient(0, pTop - 6, 0, pTop + 6);
    lg.addColorStop(0, 'rgba(120,190,255,0)'); lg.addColorStop(0.5, `rgba(120,190,255,${(0.35 * led).toFixed(3)})`); lg.addColorStop(1, 'rgba(120,190,255,0)');
    ctx.fillStyle = lg; ctx.fillRect(tx - pW - 4, pTop - 6, pW * 2 + 8, 12); ctx.restore();
    // Silver plate
    const plW = pW * 1.30, plH = pH * 0.42, plY = pTop + pH * 0.30;
    ctx.fillStyle = chrome(tx - plW / 2, tx + plW / 2); ctx.fillRect(tx - plW / 2, plY, plW, plH);
    ctx.strokeStyle = 'rgba(20,24,40,0.6)'; ctx.lineWidth = 0.6; ctx.strokeRect(tx - plW / 2 + 1.5, plY + 1.5, plW - 3, plH - 3);
    ctx.fillStyle = '#141830'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = FONT(900, plH * 0.44); ctx.fillText('FLOODLIT SERIES', tx, plY + plH * 0.40, plW * 0.86);
    ctx.font = FONT(700, plH * 0.24); ctx.fillText('UNDER THE LIGHTS', tx, plY + plH * 0.76, plW * 0.7);

    // ── Foot and stem: polished chrome with a faceted knop ──
    const footY = pTop - dep * 0.5, footW = W * 0.034;
    ctx.fillStyle = chrome(tx - footW, tx + footW);
    ctx.beginPath(); ctx.ellipse(tx, footY, footW, S * 0.014, 0, 0, PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx - footW, footY); ctx.quadraticCurveTo(tx - footW * 0.6, footY - S * 0.03, tx - footW * 0.16, footY - S * 0.045);
    ctx.lineTo(tx + footW * 0.16, footY - S * 0.045); ctx.quadraticCurveTo(tx + footW * 0.6, footY - S * 0.03, tx + footW, footY); ctx.closePath(); ctx.fill();
    const stemTop = footY - S * 0.130;
    ctx.fillRect(tx - footW * 0.13, stemTop, footW * 0.26, footY - S * 0.04 - stemTop);
    // Knop: a small cut-crystal bead
    { const ky = footY - S * 0.088, kr = footW * 0.30;
      ctx.fillStyle = 'rgba(200,220,255,0.55)'; ctx.beginPath(); ctx.moveTo(tx - kr, ky); ctx.lineTo(tx, ky - kr * 0.9); ctx.lineTo(tx + kr, ky); ctx.lineTo(tx, ky + kr * 0.9); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.moveTo(tx - kr, ky); ctx.lineTo(tx, ky - kr * 0.9); ctx.lineTo(tx - kr * 0.2, ky); ctx.closePath(); ctx.fill(); }
    // Chrome collar the crystal sits in
    ctx.fillStyle = chrome(tx - W * 0.020, tx + W * 0.020); ctx.beginPath(); ctx.ellipse(tx, stemTop, W * 0.020, W * 0.020 * TILT * 2, 0, 0, PI * 2); ctx.fill();
    ctx.fillRect(tx - W * 0.020, stemTop - S * 0.012, W * 0.040, S * 0.012);

    // ── Cut-crystal cup and lid: one faceted body of revolution (sapphire-tinted, solid-looking) ──
    const cw = W * 0.062, yb = stemTop - S * 0.010;
    const PROF = [[0.30, 0.000], [0.62, 0.050], [0.88, 0.130], [1.00, 0.240], [0.98, 0.330], [1.05, 0.380],   // bowl, up to the lip
                  [0.95, 0.392], [0.74, 0.424], [0.42, 0.446], [0.20, 0.455]];                                 // lid dome
    const LIP = 5, prof = PROF.map(([r, h]) => [r * cw, yb - h * S]);
    const lipY = prof[LIP][1], lipR = prof[LIP][0], crownY = prof[prof.length - 1][1];
    const rAt = (y) => { for (let k = 0; k < LIP; k++) { const [r0, y0] = prof[k], [r1, y1] = prof[k + 1]; if (y <= y0 && y >= y1) return r0 + (r1 - r0) * (y0 - y) / (y0 - y1); } return cw; };
    const N = 12, facetAt = (i) => phi + i * PI * 2 / N;
    const mix = (c1, c2, u) => c1.map((v, k) => Math.round(v + (c2[k] - v) * u));
    const DEEP = [14, 22, 74], PALE = [200, 220, 255], WARM = [255, 200, 140];
    const H1 = [-0.894, 0.447], H2 = [0.894, 0.447];          // half-vectors for the floodlights behind left and right

    // ── Floodlight-pylon handles: a lattice mast each side with a lit lamp head, braced to the bowl ──
    const RM = cw * 1.36, yLo = yb - S * 0.095, yHi = yb - S * 0.300, yHead = lipY - S * 0.045;
    const hw = cw * 0.36, hh = cw * 0.26, hd = cw * 0.10;
    function pylonHandle(a) {
      const c = Math.cos(a), sn = Math.sin(a);
      const rail = c > 0 ? '#dfe5ff' : '#8a90b8';
      ctx.strokeStyle = rail; ctx.lineCap = 'round';
      // Brackets to the bowl
      ctx.lineWidth = 1.5;
      [[yLo, rAt(yLo)], [yHi, rAt(yHi)]].forEach(([y, r]) => { const [x0, y0] = P(r * 0.98, y, a), [x1, y1] = P(RM, y, a); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); });
      // Lattice mast, tapering upwards
      const [mx0, my0] = P(RM, yLo + S * 0.02, a), [mx1, my1] = P(RM, yHead, a);
      const wb = 2.6, wt = 1.2;
      ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(mx0 - wb, my0); ctx.lineTo(mx1 - wt, my1); ctx.moveTo(mx0 + wb, my0); ctx.lineTo(mx1 + wt, my1); ctx.stroke();
      ctx.lineWidth = 0.55; ctx.beginPath();
      for (let k = 0; k <= 10; k++) { const u = k / 10, x = mx0 + (mx1 - mx0) * u, y = my0 + (my1 - my0) * u, w = wb + (wt - wb) * u; k ? ctx.lineTo(x + (k % 2 ? w : -w), y) : ctx.moveTo(x - w, y); }
      ctx.stroke();
      // Lamp head: a small box whose lit face points outwards from the cup
      const cx = mx1, cy = my1 - hh * 0.5, fw = hw * Math.abs(c), side = hd * Math.abs(sn), outward = sn >= 0 ? 1 : -1;
      ctx.fillStyle = '#4a5078'; ctx.fillRect(cx - fw / 2 + (outward > 0 ? fw : -side), cy - hh / 2, side, hh);   // side of the box
      ctx.fillStyle = '#7a82b0'; ctx.fillRect(cx - fw / 2, cy - hh / 2 - 1, fw, 1.2);
      if (c > 0) {
        ctx.fillStyle = '#20264e'; ctx.fillRect(cx - fw / 2, cy - hh / 2, fw, hh);
        for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) { const lx = cx - fw / 2 + fw * (k + 0.5) / 3, ly = cy - hh / 2 + hh * (r + 0.5) / 2; ctx.fillStyle = '#fbfcff'; ctx.beginPath(); ctx.ellipse(lx, ly, Math.max(0.3, fw / 3 * 0.33), hh / 2 * 0.33, 0, 0, PI * 2); ctx.fill(); }
      } else if (fw > 0.5) { ctx.fillStyle = '#3a4068'; ctx.fillRect(cx - fw / 2, cy - hh / 2, fw, hh); }
      // The lamps' glow, strongest when the face turns towards us
      const gl = 0.25 + 0.45 * Math.max(0, c) + 0.15 * Math.abs(sn);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(cx + outward * side * 0.5, cy, 0, cx + outward * side * 0.5, cy, hw * 1.3);
      g.addColorStop(0, `rgba(230,240,255,${gl.toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(cx - hw * 1.4, cy - hw * 1.4, hw * 2.8, hw * 2.8); ctx.restore();
    }
    const handles = [phi + PI / 2, phi - PI / 2];

    // ── Body: a sapphire base, then each visible facet shaded by where it faces ──
    const silhouette = () => { ctx.beginPath(); prof.forEach(([r, y], k) => k ? ctx.lineTo(tx - r, y) : ctx.moveTo(tx - r, y)); for (let k = prof.length - 1; k >= 0; k--) ctx.lineTo(tx + prof[k][0], prof[k][1]); ctx.closePath(); };
    { const bg = ctx.createLinearGradient(0, crownY, 0, yb); bg.addColorStop(0, '#24348a'); bg.addColorStop(1, '#0c1240'); ctx.fillStyle = bg; silhouette(); ctx.fill(); }
    for (let i = 0; i < N; i++) {
      const a0 = facetAt(i), a1 = facetAt(i + 1), am = (a0 + a1) / 2, nx = Math.sin(am), nz = Math.cos(am);
      if (nz < -0.15) continue;
      for (let j = 0; j < prof.length - 1; j++) {
        const [r0, y0] = prof[j], [r1, y1] = prof[j + 1];
        const q = [P(r0, y0, a0), P(r0, y0, a1), P(r1, y1, a1), P(r1, y1, a0)];
        const slope = j >= LIP ? 0.55 : (j === 0 ? -0.5 : 0);           // lid rows face upwards, the base row faces down
        // Crystal: looking straight through a facet shows the dark night behind; facets turned away reflect the lights
        const key = 0.06 + 0.62 * Math.pow(Math.abs(nx), 1.5) + 0.18 * Math.max(0, slope) + ((i + j) % 2 ? 0 : 0.10) + 0.08 * Math.max(0, -nx);
        const spec = Math.pow(Math.max(0, nx * H1[0] + nz * H1[1]), 24) + Math.pow(Math.max(0, nx * H2[0] + nz * H2[1]), 24);
        const warm = Math.max(0, 1 - Math.abs(nx - 0.30) * 3.5) * (j < LIP ? 0.35 : 0.1);   // the lit concourse reflected in one band of facets
        let col = mix(DEEP, PALE, Math.min(1, key));
        col = mix(col, WARM, warm);
        ctx.beginPath(); q.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},0.86)`; ctx.fill();
        if (spec > 0.45) { const [sx, sy] = q[3]; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 5); sg.addColorStop(0, `rgba(255,255,255,${Math.min(0.8, spec).toFixed(3)})`); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(sx - 5, sy - 5, 10, 10); ctx.restore(); }
        if (spec > 0.03) { ctx.fillStyle = `rgba(255,255,255,${Math.min(0.75, spec * 0.8).toFixed(3)})`; ctx.fill(); }
        ctx.strokeStyle = `rgba(230,240,255,${(0.40 + 0.40 * Math.abs(nx)).toFixed(3)})`; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]); ctx.lineTo(q[3][0], q[3][1]); ctx.stroke();
      }
    }
    // Horizontal cuts between rows, and a bright cut lip where the lid sits
    ctx.strokeStyle = 'rgba(225,235,255,0.35)'; ctx.lineWidth = 0.5;
    for (let j = 1; j < prof.length - 1; j++) { if (j === LIP) continue; const [r, y] = prof[j]; ctx.beginPath(); ctx.ellipse(tx, y, r, r * TILT, 0, 0, PI); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(245,250,255,0.95)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.ellipse(tx, lipY, lipR, lipR * TILT, 0, 0, PI); ctx.stroke();
    ctx.strokeStyle = 'rgba(20,28,80,0.6)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(tx, lipY + 1.2, lipR * 0.99, lipR * TILT, 0, 0, PI); ctx.stroke();
    // Rim light down both silhouette edges from the floodlights behind (fixed; the light doesn't move)
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.1;
    [-1, 1].forEach(sd => { ctx.beginPath(); prof.forEach(([r, y], k) => k ? ctx.lineTo(tx + sd * r * 0.99, y) : ctx.moveTo(tx + sd * r * 0.99, y)); ctx.stroke(); });
    // Etched stars round the band under the lip, turning with the cup
    for (let i = 0; i < 10; i++) {
      const a = phi + i * PI * 2 / 10, c = Math.cos(a); if (c < 0.12) continue;
      const y = yb - S * 0.300, [x, yy] = P(rAt(y) * 1.005, y, a);
      ctx.fillStyle = `rgba(255,255,255,${(0.75 * c).toFixed(3)})`; ctx.save(); ctx.translate(x, yy); ctx.scale(c, 1);
      ctx.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? 0.9 : 2.2, aa = k * PI / 5 - PI / 2; ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } ctx.closePath(); ctx.fill(); ctx.restore();
    }
    // Soft LED glow breathing up through the base of the crystal
    ctx.save(); silhouette(); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    const ig = ctx.createRadialGradient(tx, yb, 0, tx, yb, cw * 1.1);
    ig.addColorStop(0, `rgba(120,190,255,${(0.28 + 0.18 * breathe).toFixed(3)})`); ig.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ig; ctx.fillRect(tx - cw * 1.2, yb - S * 0.2, cw * 2.4, S * 0.21); ctx.restore();
    // Firework light washing over the crystal from above, in the colour of whatever just burst
    { const L = fwLight(t % SHOW);
      if (L) { ctx.save(); silhouette(); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
        const fg = ctx.createLinearGradient(0, crownY, 0, yb);
        fg.addColorStop(0, `rgba(${L.r},${L.g},${L.b},${(0.30 * L.a).toFixed(3)})`); fg.addColorStop(1, `rgba(${L.r},${L.g},${L.b},${(0.10 * L.a).toFixed(3)})`);
        ctx.fillStyle = fg; ctx.fillRect(tx - cw * 1.2, crownY, cw * 2.4, yb - crownY); ctx.restore(); } }


    // ── Chrome crown on the lid, holding the pink day-night ball (its seam turns with the cup) ──
    {
      const crR = cw * 0.24, crH = S * 0.040, crTop = crownY - crH;
      ctx.fillStyle = chrome(tx - crR, tx + crR);
      ctx.beginPath(); ctx.moveTo(tx - crR * 0.55, crownY + 1); ctx.lineTo(tx - crR * 0.40, crTop + crH * 0.4); ctx.lineTo(tx - crR, crTop); ctx.lineTo(tx + crR, crTop); ctx.lineTo(tx + crR * 0.40, crTop + crH * 0.4); ctx.lineTo(tx + crR * 0.55, crownY + 1); ctx.closePath(); ctx.fill();
      for (let k = 0; k < 6; k++) {                                    // little crown points, turning
        const a = phi + k * PI / 3, c = Math.cos(a); if (c < -0.1) continue;
        const [x, y] = P(crR, crTop, a); ctx.beginPath(); ctx.moveTo(x - 1.3, y); ctx.lineTo(x, y - 3.2); ctx.lineTo(x + 1.3, y); ctx.closePath(); ctx.fill();
      }
      const br = cw * 0.30, bx = tx, by = crTop - br * 0.78;
      const g = ctx.createRadialGradient(bx - br * 0.35, by - br * 0.40, br * 0.1, bx, by, br);
      g.addColorStop(0, '#ffb8d0'); g.addColorStop(0.55, '#f04a88'); g.addColorStop(1, '#8a1848');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, br, 0, PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(bx, by, br, 0, PI * 2); ctx.clip();
      const cp = Math.cos(phi), sp = Math.sin(phi), EL = 0.30, ce = Math.cos(EL), se = Math.sin(EL);
      const turn = ([X, Y, Z]) => { const x = X * cp + Z * sp, z = Z * cp - X * sp; return [x, Y * ce - z * se, z * ce + Y * se]; };
      const ring = (off) => (u) => { const k = Math.sqrt(1 - off * off); return [off, Math.sin(u) * k, Math.cos(u) * k]; };   // upright seam
      const curve = (fn, col, lw) => {
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; let prev = null;
        for (let k = 0; k <= 120; k++) { const [X, Y, Z] = turn(fn(k / 120 * PI * 2)), pt = [bx + X * br, by - Y * br];
          if (Z > 0 && prev) { ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(pt[0], pt[1]); ctx.stroke(); } prev = Z > 0 ? pt : null; }
      };
      curve(ring(0), 'rgba(255,240,245,0.9)', br * 0.11);
      curve(ring(0.15), 'rgba(255,255,255,0.75)', br * 0.05);
      curve(ring(-0.15), 'rgba(255,255,255,0.75)', br * 0.05);
      ctx.restore();
      const sh = ctx.createRadialGradient(bx - br * 0.3, by - br * 0.35, br * 0.2, bx, by, br);
      sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(40,0,20,0.30)');
      ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(bx, by, br, 0, PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(bx - br * 0.38, by - br * 0.42, br * 0.20, br * 0.12, -0.6, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(200,220,255,0.5)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(bx, by, br, -PI * 0.15, PI * 0.35); ctx.stroke();   // floodlight rim on the ball
    }
    ctx.restore();

    // A bat leaning on the plinth with a pink ball at its toe (drawn unscaled)
    {
      const toeX = tx - W * 0.068 * K - W * 0.070, toeY = tb - H * 0.002, topX = tx - W * 0.068 * K + W * 0.004, topY = tb - H * 0.145;
      const ang = Math.atan2(topY - toeY, topX - toeX), len = Math.hypot(topX - toeX, topY - toeY);
      ctx.fillStyle = 'rgba(0,0,10,0.45)'; ctx.beginPath(); ctx.ellipse(toeX + W * 0.03, toeY + 2, W * 0.032, H * 0.007, 0.1, 0, PI * 2); ctx.fill();
      ctx.save(); ctx.translate(toeX, toeY); ctx.rotate(ang);
      const bw = W * 0.022, bl = len * 0.64;
      const g = ctx.createLinearGradient(0, -bw / 2, 0, bw / 2);
      g.addColorStop(0, '#e8d8b8'); g.addColorStop(0.4, '#b8a080'); g.addColorStop(1, '#5a4a38');
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(0, -bw / 2, bl, bw, bw * 0.28); ctx.fill();
      ctx.fillStyle = '#1a2060'; ctx.fillRect(bl * 0.45, -bw / 2, bl * 0.22, bw);                       // sticker
      ctx.fillStyle = '#e8336a'; ctx.fillRect(bl * 0.47, -bw * 0.12, bl * 0.18, bw * 0.24);
      ctx.fillStyle = 'rgba(160,190,255,0.35)'; ctx.fillRect(0, -bw / 2, bl, 1.2);                       // floodlight on the edge
      ctx.fillStyle = '#b8a080'; ctx.fillRect(bl, -bw * 0.16, bw * 0.6, bw * 0.32);
      ctx.fillStyle = '#1a1c2a'; ctx.fillRect(bl + bw * 0.55, -bw * 0.17, len - bl - bw * 0.55, bw * 0.34);   // black grip
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; for (let x = bl + bw * 0.8; x < len - 2; x += 3.2) ctx.fillRect(x, -bw * 0.17, 0.9, bw * 0.34);
      ctx.restore();
      const bx = toeX - W * 0.012, by = toeY - H * 0.012, r = H * 0.012;
      const bg = ctx.createRadialGradient(bx - r * 0.3, by - r * 0.4, r * 0.1, bx, by, r);
      bg.addColorStop(0, '#ffb8d0'); bg.addColorStop(0.6, '#f04a88'); bg.addColorStop(1, '#8a1848');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(bx, by, r, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(bx, by, r * 0.35, r, 0.3, 0, PI * 2); ctx.stroke();
    }
  }

  // ════════ AMBIENT ANIMATION ════════
  // Behind the props: twinkling stars, a plane, the stadium glow, the LED ribbon, flashes, fans at the gates
  function drawAmbientBack(ctx, W, H, t) {
    const m = t % SHOW;
    const sixF = win(m, SIX), wkF = win(m, WICKET);
    // Bright stars twinkle
    [[0.05, 0.03], [0.17, 0.15], [0.36, 0.05], [0.47, 0.17], [0.66, 0.03], [0.80, 0.16], [0.97, 0.10]].forEach(([fx, fy], i) => {
      const a = 0.35 + 0.35 * Math.sin(t * (0.9 + i * 0.37) + i * 2);
      ctx.fillStyle = `rgba(240,244,255,${a.toFixed(3)})`; ctx.fillRect(W * fx - 1, H * fy, 3, 1); ctx.fillRect(W * fx, H * fy - 1, 1, 3);
    });
    // A plane crossing high up, blinking (its own 37.9s cycle, unrelated to the schedule)
    {
      const u = (t % 37.9) / 22;
      if (u < 1) {
        const x = W * (1.04 - u * 1.08), y = H * (0.135 - u * 0.04);
        ctx.fillStyle = 'rgba(200,205,230,0.6)'; ctx.fillRect(x - 3, y, 6, 1);
        if ((t * 1.6) % 1 < 0.18) { ctx.fillStyle = '#ff4040'; ctx.beginPath(); ctx.arc(x - 3, y + 0.5, 1.2, 0, PI * 2); ctx.fill(); }
        if ((t * 1.6 + 0.5) % 1 < 0.10) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x + 3, y + 0.5, 1.1, 0, PI * 2); ctx.fill(); }
      }
    }
    // The crowd's roar on a six: the glow over the roof swells and settles
    {
      const swell = sixF > 0 ? Math.sin(sixF * PI) : 0;
      const base = 0.10 + 0.04 * Math.sin(t * 0.8);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(W * 0.5, H * 0.29, 0, W * 0.5, H * 0.29, W * 0.45);
      g.addColorStop(0, `rgba(170,190,255,${(base + 0.22 * swell).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.translate(0, H * 0.29); ctx.scale(1, 0.40); ctx.translate(0, -H * 0.29); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    // Floodlight heads: one bank on the far-left mast flickers as it warms up, then holds
    {
      const f = win(m, LAMP_WARM);
      const [fx, hy, sc] = PYLONS[0], x = W * fx, y = H * hy + H * 0.025 * sc;
      let a = 0;
      if (f > 0) a = f < 0.6 ? (Math.sin(f * 90) > 0.2 ? 0.5 : 0.05) : (1 - f) / 0.4 * 0.35;
      if (a > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, W * 0.06); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - W * 0.06, y - W * 0.06, W * 0.12, W * 0.12); ctx.restore(); }
    }
    // Roof flags fluttering
    [[0.335, '#e8336a'], [0.665, '#2ac0d0']].forEach(([fx, col], i) => {
      const x = W * fx, y = H * ROOF_Y + H * 0.035 * Math.pow((x - W * 0.5) / (W * 0.5), 2) - H * 0.055;
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y);
      for (let k = 0; k <= 8; k++) { const u = k / 8; ctx.lineTo(x + u * W * 0.03, y + Math.sin(t * 5 + u * 5 + i) * 1.3 * u); }
      for (let k = 8; k >= 0; k--) { const u = k / 8; ctx.lineTo(x + u * W * 0.03, y + H * 0.018 + Math.sin(t * 5 + u * 5 + i) * 1.3 * u); }
      ctx.closePath(); ctx.fill();
    });
    // Camera flashes popping in the concourse glazing
    FLASHES.forEach(([a, b], n) => {
      if (m < a || m > b) return;
      for (let k = 0; k < 7; k++) {
        const st = a + (b - a) * ((k * 0.37 + n * 0.11) % 1), d = m - st;
        if (d < 0 || d > 0.12) continue;
        const x = W * ((k * 0.137 + n * 0.29 + 0.05) % 1), y = H * (WIN_Y0 + 0.01 + ((k * 0.31) % 1) * (WIN_Y1 - WIN_Y0 - 0.02));
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(x, y, 0, x, y, 7); g.addColorStop(0, `rgba(255,255,255,${(1 - d / 0.12).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 7, y - 7, 14, 14); ctx.restore();
      }
    });
    // Big screen: the series graphic, switching to SIX! / OUT! / CHAMPIONS on cue
    {
      const [a, b, c, d] = SCREEN, x0 = W * a, y0 = H * b, w = W * (c - a), h = H * (d - b);
      const fwF = fwWin(m) ? 1 : -1, waveF = win(m, WAVE);
      ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
      const bg = ctx.createLinearGradient(x0, y0, x0 + w, y0 + h);
      bg.addColorStop(0, '#1a2a8a'); bg.addColorStop(0.5 + 0.3 * Math.sin(t * 0.5), '#3a1a7a'); bg.addColorStop(1, '#0a1a5a');
      ctx.fillStyle = bg; ctx.fillRect(x0, y0, w, h);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const blink = Math.floor(t * 6) % 2 === 0;
      if (sixF > 0) { ctx.fillStyle = blink ? '#ff5aa0' : '#ffd040'; ctx.font = FONT(900, h * 0.62); ctx.fillText('SIX!', x0 + w / 2, y0 + h * 0.52); }
      else if (wkF > 0) { ctx.fillStyle = blink ? '#ff4040' : '#ffffff'; ctx.font = FONT(900, h * 0.62); ctx.fillText('OUT!', x0 + w / 2, y0 + h * 0.52); }
      else if (fwF > 0) { ctx.fillStyle = '#ffd040'; ctx.font = FONT(900, h * 0.36); ctx.fillText('CHAMPIONS', x0 + w / 2, y0 + h * 0.52, w * 0.9); }
      else if (waveF > 0) { ctx.fillStyle = '#ffffff'; ctx.font = FONT(900, h * 0.28); ctx.fillText('MAKE SOME', x0 + w / 2, y0 + h * 0.36); ctx.fillStyle = '#2ae0f0'; ctx.fillText('NOISE!', x0 + w / 2, y0 + h * 0.68); }
      else {
        ctx.fillStyle = '#ffffff'; ctx.font = FONT(900, h * 0.27); ctx.fillText('FLOODLIT', x0 + w / 2, y0 + h * 0.40);
        ctx.fillStyle = '#ff8ab0'; ctx.fillText('SERIES', x0 + w / 2, y0 + h * 0.70);
        ctx.fillStyle = (t % 1.2) < 0.7 ? '#ff3040' : 'rgba(255,48,64,0.3)'; ctx.beginPath(); ctx.arc(x0 + w * 0.08, y0 + h * 0.14, 1.8, 0, PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = FONT(800, h * 0.12); ctx.textAlign = 'left'; ctx.fillText('LIVE', x0 + w * 0.12, y0 + h * 0.15);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; for (let yy = y0; yy < y0 + h; yy += 2) ctx.fillRect(x0, yy, w, 0.6);   // scanlines
      ctx.restore();
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const sg = ctx.createRadialGradient(x0 + w / 2, y0 + h / 2, 0, x0 + w / 2, y0 + h / 2, w * 0.8);
      sg.addColorStop(0, 'rgba(120,120,255,0.12)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sg; ctx.fillRect(x0 - w * 0.3, y0 - h * 0.5, w * 1.6, h * 2); ctx.restore();
    }
    // Mexican wave of phone torches rippling along the concourse
    {
      const f = win(m, WAVE);
      if (f > 0) {
        const xf = W * (-0.10 + 1.20 * f);
        for (let k = 0; k < 60; k++) {
          const x = W * ((k * 0.6180339) % 1), base = H * (WIN_Y0 + 0.012 + ((k * 0.377) % 1) * (WIN_Y1 - WIN_Y0 - 0.03));
          const e = Math.exp(-Math.pow((x - xf) / (W * 0.055), 2));
          if (e < 0.05) continue;
          const y = base - e * H * 0.012;
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          const g = ctx.createRadialGradient(x, y, 0, x, y, 4.5); g.addColorStop(0, `rgba(255,255,255,${(0.95 * e).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g; ctx.fillRect(x - 5, y - 5, 10, 10); ctx.restore();
        }
      }
    }
    // Trophy-lift pyro: golden rain pouring off the roof edge, a dense wall of fountains, salvoes of
    // shells, then a finale of big simultaneous bursts and glitter
    {
      const fw = fwWin(m);
      if (fw) {
        const T = fw.T, V = fw.v;
        const roofY = (x) => H * ROOF_Y + H * 0.035 * Math.pow((x - W * 0.5) / (W * 0.5), 2);
        const COL = { gold: '255,206,110', pink: '255,110,170', white: '238,242,255', cyan: '120,220,255', red: '255,90,80' };
        const hash = (n) => { const v = Math.sin(n * 127.1) * 43758.5453; return v - Math.floor(v); };
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        // The whole sky lifts with the light
        { const lift = Math.min(1, T / 0.2) * Math.max(0, 1 - (T - 4.4) / 0.8) * 0.18;
          const g = ctx.createLinearGradient(0, 0, 0, H * ROOF_Y); g.addColorStop(0, 'rgba(255,190,120,0)'); g.addColorStop(1, `rgba(255,190,120,${lift.toFixed(3)})`);
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * ROOF_Y); }
        // 1 · Golden-rain curtain pouring down the face of the stand (0–2.8s)
        if (T < 2.8) {
          const on = Math.min(1, T / 0.15) * (T > 2.3 ? (2.8 - T) / 0.5 : 1);
          for (let x = 2; x < W; x += 5) {
            const y0 = roofY(x) + 2, h0 = hash(x);
            for (let p = 0; p < 6; p++) {
              const life = (T * 1.7 + p / 6 + h0) % 1, y = y0 + life * H * (0.15 + 0.03 * h0);
              const a = on * (1 - life) * (0.55 + 0.45 * Math.sin(T * 40 + x + p));
              ctx.fillStyle = `rgba(${COL.gold},${Math.max(0, a).toFixed(3)})`; ctx.fillRect(x + Math.sin(life * 3 + h0 * 9) * 1.2, y, 1.2, 2.6);
            }
          }
          const rg = ctx.createLinearGradient(0, H * ROOF_Y, 0, H * (ROOF_Y + 0.16));
          rg.addColorStop(0, `rgba(255,190,100,${(0.22 * on).toFixed(3)})`); rg.addColorStop(1, 'rgba(255,190,100,0)');
          ctx.fillStyle = rg; ctx.fillRect(0, H * ROOF_Y, W, H * 0.16);
        }
        // 2 · Wall of fountains shooting up off the roof (0.3–3.2s), alternating gold and white
        if (T > 0.05 && T < 3.6) {
          const u0 = T - 0.05, on = Math.min(1, u0 / 0.12) * (T > 3.0 ? (3.6 - T) / 0.6 : 1);
          for (let gI = 0; gI < 29; gI++) {
            const x = W * (0.015 + gI * 0.0348), y = roofY(x) - 2, tall = 0.24 + 0.06 * Math.sin(gI * 1.7 + T * 3);
            const col = (gI + V) % 2 ? COL.white : (V ? COL.pink : COL.gold);
            for (let p = 0; p < 34; p++) {
              const life = (u0 * 2.6 + p / 34 + gI * 0.137) % 1, spread = (hash(p * 7 + gI) - 0.5) * 12;
              const px = x + spread * life, py = y - life * H * tall * (0.75 + 0.25 * hash(p + gI * 3)) + life * life * H * 0.06;
              ctx.fillStyle = `rgba(${col},${(on * (1 - life * 0.9)).toFixed(3)})`; ctx.fillRect(px - 0.9, py - 0.9, 1.9, 1.9);
            }
            const g = ctx.createRadialGradient(x, y, 0, x, y, 16); g.addColorStop(0, `rgba(255,225,160,${(0.6 * on).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g; ctx.fillRect(x - 16, y - 16, 32, 32);
          }
        }
        // 3 · Shells: salvoes, then a finale of big simultaneous bursts at 3.0s
        const burst = (t0, fx, fy, col, size, si) => {
          const dt = T - t0; if (dt < 0) return;
          const x = W * fx, y0 = roofY(x), yb = H * fy, rise = 0.42;
          if (dt < rise) {
            const u = dt / rise;
            for (let k = 0; k < 6; k++) { const uu = Math.max(0, u - k * 0.045), yk = y0 + (yb - y0) * (1 - (1 - uu) * (1 - uu)); ctx.fillStyle = `rgba(255,220,160,${(0.85 - k * 0.13).toFixed(3)})`; ctx.fillRect(x - 0.7, yk, 1.4, 1.6); }
            return;
          }
          const db = dt - rise, life = 1.8; if (db > life) return;
          const Rr = H * size * (1 - Math.exp(-db * 3.0)), fall = db * db * H * 0.04, a = Math.pow(1 - db / life, 1.3);
          if (db < 0.4) { const g = ctx.createRadialGradient(x, yb, 0, x, yb, H * 0.22); g.addColorStop(0, `rgba(${COL[col]},${(0.5 * (1 - db / 0.4)).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - H * 0.22, yb - H * 0.22, H * 0.44, H * 0.44); }
          const n = 56;
          for (let k = 0; k < n; k++) {
            const ang = k / n * PI * 2 + si, rr = Rr * (0.82 + 0.18 * hash(k + si * 13));
            for (let tr = 0; tr < 3; tr++) {                    // a short trail behind each star
              const q = 1 - tr * 0.10, px = x + Math.cos(ang) * rr * q, py = yb + Math.sin(ang) * rr * q * 0.92 + fall * q;
              ctx.fillStyle = `rgba(${COL[col]},${(a * (tr ? 0.35 / tr : 1)).toFixed(3)})`; ctx.fillRect(px - 1, py - 1, tr ? 1.4 : 2.2, tr ? 1.4 : 2.2);
            }
          }
        };
        // A rapid barrage: two shells every ~0.2s from the moment it starts, then a seven-shell finale
        fwShells(V).forEach(([t0, fx, fy, col, size, si]) => burst(t0, fx, fy, col, size, si));
        // 4 · Glitter: crackling white twinkles hanging in the sky after the finale
        if (T > 3.8 && T < 5.2) {
          const ga = Math.min(1, (T - 3.8) / 0.2) * (1 - (T - 3.8) / 1.4);
          for (let k = 0; k < 90; k++) { if (Math.sin(T * 30 + k * 7.1) < 0.3) continue;
            const x = W * hash(k * 3.3 + V), y = H * (0.04 + 0.22 * hash(k * 5.7 + V)) + (T - 3.8) * H * 0.03;
            ctx.fillStyle = `rgba(255,250,235,${(ga * 0.95).toFixed(3)})`; ctx.fillRect(x, y, 1.5, 1.5); }
        }
        // Smoke drifting off afterwards
        if (T > 1.0) { const sa = Math.min(1, (T - 1.0) / 1.0) * Math.max(0, 1 - (T - 4.2) / 1.0) * 0.10;
          ctx.globalCompositeOperation = 'source-over';
          for (let k = 0; k < 7; k++) { const x = W * (0.08 + k * 0.14) + T * 4, y = H * (0.18 + (k % 2) * 0.03), r = W * 0.08; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(160,170,210,${sa.toFixed(3)})`); g.addColorStop(1, 'rgba(160,170,210,0)'); ctx.fillStyle = g; ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.45); ctx.translate(-x, -y); ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); } }
        ctx.restore();
      }
    }
    // Firework light flickering across the wet plaza and the face of the stand
    { const L = fwLight(m);
      if (L) { ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(0, H * BASE_Y, 0, H);
        g.addColorStop(0, `rgba(${L.r},${L.g},${L.b},${(0.30 * L.a).toFixed(3)})`); g.addColorStop(0.5, `rgba(${L.r},${L.g},${L.b},${(0.10 * L.a).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(0, H * BASE_Y, W, H * (1 - BASE_Y));
        ctx.fillStyle = `rgba(${L.r},${L.g},${L.b},${(0.07 * L.a).toFixed(3)})`; ctx.fillRect(0, H * ROOF_Y, W, H * (BASE_Y - ROOF_Y));
        ctx.restore(); } }
    // LED ribbon board: amber dot-matrix scroll, interrupted by SIX! and WICKET! on cue
    {
      const y0 = H * RIB_Y0, h = H * (RIB_Y1 - RIB_Y0);
      ctx.save(); ctx.beginPath(); ctx.rect(0, y0, W, h); ctx.clip();
      ctx.textBaseline = 'middle'; ctx.font = FONT(800, h * 0.78);
      const fwR = fwWin(m) ? fwWin(m).f : -1;
      if (fwR > 0) {
        ctx.fillStyle = Math.floor(fwR * 16) % 2 ? '#ffd040' : '#ffffff'; ctx.textAlign = 'center';
        [0.12, 0.30, 0.70, 0.88].forEach(fx => ctx.fillText('★ CHAMPIONS ★', W * fx, y0 + h / 2 + 0.5));
      } else if (sixF > 0 || wkF > 0) {
        const f = sixF > 0 ? sixF : wkF, on = Math.floor(f * 12) % 2 === 0;
        const text = sixF > 0 ? '★  SIX!  ★' : 'WICKET!';
        ctx.fillStyle = sixF > 0 ? (on ? '#ff5aa0' : '#ffd040') : (on ? '#ff4040' : '#ffffff');
        ctx.textAlign = 'center';
        [0.12, 0.30, 0.70, 0.88].forEach(fx => ctx.fillText(text, W * fx, y0 + h / 2 + 0.5));
      } else {
        const msg = 'FLOODLIT SERIES  ·  TONIGHT UNDER THE LIGHTS  ·  GATES OPEN 6PM  ·  ';
        const mw = ctx.measureText(msg).width, off = (t * 34) % mw;
        ctx.fillStyle = '#ffb030'; ctx.textAlign = 'left';
        for (let x = -off; x < W; x += mw) ctx.fillText(msg, x, y0 + h / 2 + 0.5);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (let x = 0; x < W; x += 2) ctx.fillRect(x, y0, 0.7, h);   // LED pitch
      ctx.restore();
    }
    // Queues at the gates, a steward in hi-vis at each, a flag waving above the queue
    GATES.forEach(([fx], gi) => {
      const dir = gi ? 1 : -1, gx = W * fx;
      for (let q = 0; q < 4; q++) {
        const x = gx + dir * W * (0.050 + q * 0.016), y = H * (BASE_Y + 0.006 + q * 0.003), s = H * (0.040 + q * 0.002);
        const bob = Math.sin(t * 1.3 + q * 1.7 + gi) * 0.4;
        ctx.fillStyle = '#0a0b18';
        ctx.beginPath(); ctx.arc(x, y - s * 0.88 + bob, s * 0.11, 0, PI * 2); ctx.fill();
        ctx.beginPath(); ctx.roundRect(x - s * 0.13, y - s * 0.76 + bob, s * 0.26, s * 0.46, s * 0.06); ctx.fill();
        ctx.fillRect(x - s * 0.10, y - s * 0.32, s * 0.08, s * 0.32); ctx.fillRect(x + s * 0.02, y - s * 0.32, s * 0.08, s * 0.32);
        ctx.fillStyle = ['#e8336a', '#2ac0d0', '#ffd040', '#e8336a'][(q + gi) % 4]; ctx.fillRect(x - s * 0.13, y - s * 0.74 + bob, s * 0.26, s * 0.05);
        if (q === 2) {                                       // a flag on a stick
          const fx0 = x + s * 0.12, fy0 = y - s * 1.25;
          ctx.strokeStyle = '#8a8a9a'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(x + s * 0.10, y - s * 0.55); ctx.lineTo(fx0, fy0); ctx.stroke();
          ctx.fillStyle = gi ? '#2ac0d0' : '#e8336a'; ctx.beginPath(); ctx.moveTo(fx0, fy0);
          for (let k = 0; k <= 6; k++) { const u = k / 6; ctx.lineTo(fx0 + u * s * 0.5, fy0 + Math.sin(t * 6 + u * 4 + gi) * 1.2 * u); }
          for (let k = 6; k >= 0; k--) { const u = k / 6; ctx.lineTo(fx0 + u * s * 0.5, fy0 + s * 0.28 + Math.sin(t * 6 + u * 4 + gi) * 1.2 * u); }
          ctx.closePath(); ctx.fill();
        }
      }
      // Steward beside the turnstiles, waving people through now and then
      const sx = gx - dir * W * 0.046, sy = H * (BASE_Y + 0.004), s = H * 0.044, wave = Math.max(0, Math.sin(t * 0.9 + gi * 2)) ;
      ctx.fillStyle = '#0a0b18'; ctx.beginPath(); ctx.arc(sx, sy - s * 0.88, s * 0.11, 0, PI * 2); ctx.fill();
      ctx.fillRect(sx - s * 0.10, sy - s * 0.32, s * 0.08, s * 0.32); ctx.fillRect(sx + s * 0.02, sy - s * 0.32, s * 0.08, s * 0.32);
      ctx.fillStyle = '#e8f040'; ctx.beginPath(); ctx.roundRect(sx - s * 0.14, sy - s * 0.76, s * 0.28, s * 0.46, s * 0.06); ctx.fill();   // hi-vis vest
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(sx - s * 0.14, sy - s * 0.52, s * 0.28, s * 0.04);
      ctx.strokeStyle = '#e8f040'; ctx.lineWidth = s * 0.08; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sx + dir * s * 0.12, sy - s * 0.70); ctx.lineTo(sx + dir * s * (0.22 + 0.10 * wave), sy - s * (0.55 + 0.45 * wave)); ctx.stroke();
    });
    // Fans heading for the gates; the turnstile light blinks green as each one goes through
    {
      const fans = [
        { from: [1.02, 0.640], to: [0.770, 0.560], period: 13.1, off: 0.0, col: '#e8336a' },
        { from: [1.04, 0.660], to: [0.790, 0.560], period: 17.3, off: 6.0, col: '#2ac0d0' },
        { from: [0.215, 0.660], to: [0.285, 0.560], period: 11.7, off: 3.0, col: '#ffd040' },
        { from: [0.180, 0.640], to: [0.270, 0.560], period: 15.9, off: 9.5, col: '#e8336a' },
      ];
      fans.forEach((f, i) => {
        const u = ((t + f.off) % f.period) / 7.0;          // takes 7s to reach the gate
        if (u < 1) {
          const x = W * (f.from[0] + (f.to[0] - f.from[0]) * u), y = H * (f.from[1] + (f.to[1] - f.from[1]) * u);
          const s = H * (0.050 - 0.012 * u), a = u > 0.88 ? (1 - u) / 0.12 : 1, step = Math.sin(t * 9 + i);
          ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#0a0b18';
          ctx.beginPath(); ctx.arc(x, y - s * 0.88, s * 0.11, 0, PI * 2); ctx.fill();
          ctx.beginPath(); ctx.roundRect(x - s * 0.13, y - s * 0.76, s * 0.26, s * 0.42, s * 0.06); ctx.fill();
          ctx.strokeStyle = '#0a0b18'; ctx.lineWidth = s * 0.09; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x - s * 0.05, y - s * 0.36); ctx.lineTo(x - s * 0.05 - step * s * 0.08, y); ctx.moveTo(x + s * 0.05, y - s * 0.36); ctx.lineTo(x + s * 0.05 + step * s * 0.08, y); ctx.stroke();
          ctx.fillStyle = f.col; ctx.fillRect(x - s * 0.13, y - s * 0.74, s * 0.26, s * 0.06);   // team scarf
          ctx.restore();
        }
        const gate = f.to[0] < 0.5 ? GATES[0] : GATES[1];
        const d = u - 1;                                     // just through the turnstile
        if (d > 0 && d < 0.15) {
          const x = W * gate[0], y = H * (BASE_Y - 0.028);
          ctx.fillStyle = `rgba(80,255,140,${(1 - d / 0.15).toFixed(3)})`; ctx.beginPath(); ctx.arc(x + (i % 2 ? 6 : -6), y, 1.8, 0, PI * 2); ctx.fill();
        }
      });
    }
  }

  // In front of the props: food-truck steam and fairy lights, moths at the lamp, the LED bails
  function drawAmbientFront(ctx, W, H, t) {
    const m = t % SHOW, wkF = win(m, WICKET);
    // Ticker tape drifting down over the plaza as each firework finale fades
    { const fw = fwWin(m);
      if (fw && fw.T > 3.3) {
        const u = fw.T - 3.3, fade = Math.min(1, u / 0.3) * Math.max(0, Math.min(1, (6.0 - fw.T) / 0.8));
        const cols = ['#ffd040', '#ffffff', fw.v ? '#ff8ab0' : '#ffe8a0'];
        for (let k = 0; k < 46; k++) {
          const h1 = FW_HASH(k * 1.7 + fw.v), h2 = FW_HASH(k * 4.3 + 2), delay = h2 * 0.6;
          const uu = u - delay; if (uu < 0) continue;
          const x = W * (0.03 + 0.94 * h1) + Math.sin(uu * 2.2 + k) * W * 0.02, y = -H * 0.03 + uu * H * (0.30 + 0.12 * h2);
          if (y > H * 0.70) continue;
          ctx.save(); ctx.globalAlpha = fade; ctx.translate(x, y); ctx.rotate(Math.sin(uu * 3 + k) * 0.8); ctx.scale(1, Math.cos(uu * 7 + k * 1.3));
          ctx.fillStyle = cols[k % 3]; ctx.fillRect(-1.2, -2.6, 2.4, 5.2); ctx.restore();
        }
      } }
    // Steam from the truck's chimney
    { const cx = W * (-0.02 + 0.235 * 0.35) + 2.5, cy = H * 0.535 - H * 0.022;
      for (let i = 0; i < 5; i++) { const life = (t * 0.45 + i / 5) % 1; ctx.fillStyle = `rgba(220,225,255,${(0.22 * Math.sin(life * PI)).toFixed(3)})`; ctx.beginPath(); ctx.arc(cx + Math.sin(life * 4 + i) * 3 + life * 8, cy - life * H * 0.10, 2 + life * 6, 0, PI * 2); ctx.fill(); } }
    // Fairy lights along the truck's hatch flap
    { const x0 = W * 0.0, x1 = W * 0.205, y = H * 0.535 + H * 0.040 - H * 0.030 - 1;
      for (let k = 0; k < 14; k++) {
        const u = k / 13, x = x0 + (x1 - x0) * u, yy = y + Math.sin(u * PI * 3) * 2;
        const a = 0.55 + 0.45 * Math.sin(t * 2.3 + k * 1.7);
        ctx.fillStyle = [`rgba(255,210,120,${a.toFixed(3)})`, `rgba(255,120,170,${a.toFixed(3)})`, `rgba(120,220,255,${a.toFixed(3)})`][k % 3];
        ctx.beginPath(); ctx.arc(x, yy, 1.4, 0, PI * 2); ctx.fill();
      } }
    // Neon OPEN sign on the truck, with the odd flicker
    { const x0 = W * TRUCK.x0, x1 = W * TRUCK.x1, top = H * TRUCK.top, hx0 = x0 + (x1 - x0) * 0.22;
      const ox = x1 - (x1 - x0) * 0.13, oy = top + H * 0.128, flick = (t % 7.3) > 7.0 && Math.sin(t * 60) > 0 ? 0.25 : 1;
      ctx.fillStyle = '#16141e'; ctx.fillRect(ox - 11, oy - 5, 22, 10);
      ctx.fillStyle = `rgba(255,80,150,${flick})`; ctx.font = FONT(900, 8); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('OPEN', ox, oy + 0.5);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, 16); g.addColorStop(0, `rgba(255,80,150,${(0.35 * flick).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(ox - 16, oy - 16, 32, 32); ctx.restore(); }
    // Light-up stumps: an LED strip down each one, glowing amber, flashing red on the wicket
    { const sx = W * 0.685, base = H * 0.705, h = H * 0.155;
      const flash = wkF > 0 && wkF < 0.75 && Math.floor(wkF * 16) % 2 === 0;
      [-1, 0, 1].forEach(k => {
        const x = sx + k * W * 0.0135;
        const pulse = 0.55 + 0.20 * Math.sin(t * 2 + k);
        ctx.fillStyle = flash ? 'rgba(255,40,40,0.95)' : `rgba(255,180,80,${pulse.toFixed(3)})`;
        ctx.fillRect(x - 1, base - h + 3, 2, h * 0.55); ctx.fillRect(x - 1, base - h * 0.25, 2, h * 0.22);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(x - 8, 0, x + 8, 0); const col = flash ? '255,50,50' : '255,180,80';
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, `rgba(${col},${flash ? 0.45 : 0.14})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 8, base - h, 16, h); ctx.restore();
      }); }
    // Moths circling the plaza lamp
    { const x = W * LAMP[0], y = H * LAMP[1] + 4;
      for (let i = 0; i < 4; i++) { const a = t * (2.1 + i * 0.6) + i * 1.9, r = 6 + i * 2.5 + Math.sin(t * 3 + i) * 2;
        ctx.fillStyle = 'rgba(255,245,215,0.75)'; ctx.fillRect(x + Math.cos(a) * r, y + Math.sin(a * 1.3) * r * 0.6, 1.3, 1.3); } }
    // LED zing bails: a soft amber glow, flashing red on the wicket moment
    { const sx = W * 0.685, top = H * 0.705 - H * 0.155;
      const flash = wkF > 0 && wkF < 0.75 ? (Math.floor(wkF * 16) % 2 === 0) : false;
      const col = flash ? 'rgba(255,40,40,1)' : 'rgba(255,190,90,0.85)';
      ctx.fillStyle = col; ctx.fillRect(sx - W * 0.0190, top - 3, W * 0.0175, 2.4); ctx.fillRect(sx + W * 0.0015, top - 3, W * 0.0175, 2.4);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const r = flash ? 18 : 9, g = ctx.createRadialGradient(sx, top - 2, 0, sx, top - 2, r);
      g.addColorStop(0, flash ? 'rgba(255,60,60,0.7)' : 'rgba(255,190,90,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(sx - r, top - 2 - r, r * 2, r * 2); ctx.restore();
      // On the wicket the bails pop off and tumble, then settle back
      if (wkF > 0 && wkF < 0.75) {
        const u = wkF / 0.75;
        [-1, 1].forEach(sd => { const bx = sx + sd * (W * 0.010 + u * W * 0.03), by = top - 3 - Math.sin(u * PI) * H * 0.05 + u * H * 0.02;
          ctx.save(); ctx.translate(bx, by); ctx.rotate(u * 6 * sd); ctx.fillStyle = flash ? '#ff3030' : '#ffb060'; ctx.fillRect(-W * 0.008, -1.2, W * 0.016, 2.4); ctx.restore(); });
      } }
  }

  // ════════ PAINT — back → ambient (back) → props → cup → ambient (front) → haze ════════
  // (canvas passed in)
  const ctx = cvs.getContext('2d');
  const SCRATCH = document.createElement('canvas').getContext('2d');
  const back = document.createElement('canvas'); back.width = 620; back.height = 355;
  const front = document.createElement('canvas'); front.width = 620; front.height = 355;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function paintBase() {
    const b = back.getContext('2d'); b.clearRect(0, 0, 620, 355); draw(b, 620, 355, 'back');
    const f = front.getContext('2d'); f.clearRect(0, 0, 620, 355); draw(f, 620, 355, 'front');
  }
  function frame(ms) {
    const t = reduceMotion ? 0 : ms / 1000;
    ctx.clearRect(0, 0, 620, 355);
    ctx.drawImage(back, 0, 0);
    drawAmbientBack(ctx, 620, 355, t);
    ctx.drawImage(front, 0, 0);
    drawTrophy(ctx, 620, 355, (t / TURN_SECONDS) * PI * 2, t);
    drawAmbientFront(ctx, 620, 355, t);
    drawAtmos(ctx, 620, 355);
  }
  function loop(ms) { if (!__running) return; __elapsed = ms - __t0; __frame(__elapsed); requestAnimationFrame(loop); }
  paintBase(); __frame(0);
  let repainted = false;
  const repaint = () => { if (!repainted) { repainted = true; paintBase(); __frame(__elapsed); } };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(repaint).catch(() => {});
  setTimeout(repaint, 2000);
  return {
    start() { if (__running) return; if (reduceMotion) { __frame(0); return; } __running = true; __t0 = performance.now() - __elapsed; requestAnimationFrame(loop); },
    stop() { __running = false; },
  };
}
function makeLeagueArt_coastal(cvs) {
  let __running = false, __t0 = 0, __elapsed = 0;
  // Soft fade at the foot of the art so it melts into the card's info panel
  function __fade() {
    const g = ctx.createLinearGradient(0, 355 * 0.78, 0, 355);
    g.addColorStop(0, 'rgba(8,8,18,0)'); g.addColorStop(1, 'rgba(8,8,18,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 355 * 0.78, 620, 355 * 0.22);
  }
  function __frame(ms) { frame(ms); __fade(); }
  const PI = Math.PI;
  const SHOW = 21;                                   // shared schedule for the "moments", seconds
  const TURN_SECONDS = 10.7;                         // one full turn of the cup
  // Moments on the shared schedule (seconds into SHOW), spread so something is always just starting:
  // beach ball 1.5–4.2 · spray on the rocks 5.0–6.6 · gull lands on the stumps 7.4–12.4 ·
  // banner plane crosses 3.0–12.0 · crab scuttles 12.8–16.0 · kite swoop 16.2–18.4 · spray again 18.8–20.4
  const BALL = [1.5, 4.2], SPRAY = [[5.0, 6.6], [18.8, 20.4]], GULL = [7.4, 12.4], CRAB = [12.8, 16.0], KITE_SWOOP = [16.2, 18.4], PLANE = [3.0, 12.0];
  const FONT = (wt, px) => `${wt} ${px}px 'Barlow Condensed', 'Arial Narrow', sans-serif`;
  const win = (m, [a, b]) => { const f = (m - a) / (b - a); return f > 0 && f < 1 ? f : -1; };

  // Layout shared by the still scene and the animation
  const HORIZON = 0.405, SHORE = 0.535;
  const STUMPS = [0.690, 0.705];                     // x, base
  const CASTLE = [0.290, 0.692];                     // sandcastle (the kite is tied to its flag)
  const ROCKS = [0.80, 0.545];                       // where the waves break on the headland

  // ════════ STILL SCENE — a bright seaside afternoon ════════
  // part: 'back' (sky + sea), 'mid' (headland, pier, beach), 'front' (huts, windbreak, stumps, sandcastle)
  function draw(ctxReal, W, H, part) {
    let ctx;
    const use = (layer) => { ctx = layer === part ? ctxReal : SCRATCH; };
    let seed = 31;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const glow = (x, y, r, col) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    };

    use('back');
    // ── Sky: clear summer blue, paler and warmer at the horizon; the sun high on the right ──
    const sky = ctx.createLinearGradient(0, 0, 0, H * HORIZON);
    sky.addColorStop(0, '#3a9ee6'); sky.addColorStop(0.65, '#86c8f2'); sky.addColorStop(1, '#d4ecf6');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * HORIZON + 1);
    glow(W * 0.90, H * 0.05, W * 0.22, 'rgba(255,248,220,0.55)');
    glow(W * 0.90, H * 0.05, W * 0.05, 'rgba(255,255,240,0.9)');

    // ── Sea: deep blue at the horizon to turquoise in the shallows, with the sun's sparkle path ──
    const sea = ctx.createLinearGradient(0, H * HORIZON, 0, H * SHORE);
    sea.addColorStop(0, '#1a64a8'); sea.addColorStop(0.45, '#2290c0'); sea.addColorStop(1, '#4ccac8');
    ctx.fillStyle = sea; ctx.fillRect(0, H * HORIZON, W, H * (SHORE - HORIZON) + 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(0, H * HORIZON, W, 1);
    for (let i = 0; i < 140; i++) {                  // ripples
      const y = H * (HORIZON + 0.005 + rnd() * (SHORE - HORIZON - 0.01)), d = (y - H * HORIZON) / (H * (SHORE - HORIZON));
      const x = rnd() * W, len = 3 + d * 12;
      ctx.fillStyle = `rgba(255,255,255,${(0.10 + d * 0.12).toFixed(3)})`; ctx.fillRect(x, y, len, 0.8);
      ctx.fillStyle = `rgba(10,50,100,${(0.10 + d * 0.08).toFixed(3)})`; ctx.fillRect(x + len * 0.3, y + 1.2, len * 0.7, 0.7);
    }
    // A far headland low on the left horizon, hazy blue-grey
    ctx.fillStyle = '#7a98b4';
    ctx.beginPath(); ctx.moveTo(0, H * HORIZON + 0.5); ctx.lineTo(0, H * (HORIZON - 0.032)); ctx.quadraticCurveTo(W * 0.05, H * (HORIZON - 0.040), W * 0.10, H * (HORIZON - 0.022));
    ctx.quadraticCurveTo(W * 0.16, H * (HORIZON - 0.012), W * 0.24, H * (HORIZON - 0.006)); ctx.lineTo(W * 0.30, H * HORIZON + 0.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(220,235,245,0.35)'; ctx.fillRect(0, H * (HORIZON - 0.008), W * 0.30, H * 0.008);
    { const g = ctx.createLinearGradient(W * 0.70, 0, W * 1.0, 0);   // sun path on the water
      g.addColorStop(0, 'rgba(255,250,220,0)'); g.addColorStop(0.6, 'rgba(255,250,220,0.22)'); g.addColorStop(1, 'rgba(255,250,220,0.05)');
      ctx.fillStyle = g; ctx.fillRect(W * 0.70, H * HORIZON, W * 0.30, H * 0.10); }

    use('mid');
    // ── The pier on the left, running out to a domed pavilion ──
    {
      const y = H * 0.432, x0 = -W * 0.01, x1 = W * 0.255;
      ctx.strokeStyle = '#6a5a50'; ctx.lineWidth = 1.2;
      for (let x = x0 + 4; x < x1; x += 9) { ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x, y + H * 0.045); ctx.stroke(); }   // stilts
      ctx.strokeStyle = 'rgba(106,90,80,0.6)'; ctx.lineWidth = 0.7;
      for (let x = x0 + 4; x < x1 - 9; x += 9) { ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x + 9, y + H * 0.035); ctx.moveTo(x + 9, y + 4); ctx.lineTo(x, y + H * 0.035); ctx.stroke(); }
      ctx.fillStyle = '#efe6d8'; ctx.fillRect(x0, y - 2, x1 - x0, 4);                     // deck and white railing
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x0, y - 6); ctx.lineTo(x1 - W * 0.04, y - 6); ctx.stroke();
      for (let x = x0 + 6; x < x1 - W * 0.04; x += 14) { ctx.fillStyle = '#2a4a6a'; ctx.fillRect(x, y - 12, 1, 10); ctx.fillStyle = '#fff6d0'; ctx.fillRect(x - 1, y - 14, 3, 2.5); }   // lamp posts
      // Bunting looping between the lamp posts, and the lamp glass catching the sun
      { const cols = ['#e84a5a', '#f6c830', '#2a8ad8', '#ffffff'];
        for (let x = x0 + 6; x < x1 - W * 0.04 - 14; x += 14) {
          ctx.strokeStyle = 'rgba(80,70,60,0.6)'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(x, y - 13); ctx.quadraticCurveTo(x + 7, y - 9, x + 14, y - 13); ctx.stroke();
          for (let k = 0; k < 3; k++) { const u = (k + 0.5) / 3, bx = x + 14 * u, by = y - 13 + 4 * 4 * u * (1 - u) * 0.5; ctx.fillStyle = cols[(k + Math.round(x)) % 4]; ctx.beginPath(); ctx.moveTo(bx - 1.3, by); ctx.lineTo(bx + 1.3, by); ctx.lineTo(bx, by + 2.4); ctx.closePath(); ctx.fill(); }
          ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.fillRect(x + 0.8, y - 13.6, 0.9, 0.9);
        } }
      // Pavilion at the end
      const px = W * 0.225, pw = W * 0.065;
      ctx.fillStyle = '#f6efe2'; ctx.fillRect(px - pw / 2, y - H * 0.040, pw, H * 0.040);
      ctx.fillStyle = '#5ab0c8'; for (let k = 0; k < 4; k++) ctx.fillRect(px - pw / 2 + 3 + k * (pw - 6) / 4 + 1, y - H * 0.032, (pw - 6) / 4 - 2, H * 0.020);
      ctx.fillStyle = '#3a8aa8'; ctx.beginPath(); ctx.ellipse(px, y - H * 0.040, pw * 0.42, H * 0.028, 0, PI, 0); ctx.fill();
      ctx.fillStyle = '#e8f6fa'; ctx.beginPath(); ctx.ellipse(px - pw * 0.12, y - H * 0.052, pw * 0.10, H * 0.010, -0.3, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = '#6a5a50'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(px, y - H * 0.068); ctx.lineTo(px, y - H * 0.095); ctx.stroke();
    }

    // ── Headland on the right: chalk-and-grass cliff, rocks at its foot, a striped lighthouse on top ──
    {
      // Chalk cliff face on the seaward side
      const outline = () => { ctx.beginPath(); ctx.moveTo(W * 0.70, H * 0.555); ctx.lineTo(W * 0.715, H * 0.46); ctx.quadraticCurveTo(W * 0.75, H * 0.36, W * 0.81, H * 0.305);
        ctx.quadraticCurveTo(W * 0.86, H * 0.262, W * 0.94, H * 0.252); ctx.lineTo(W * 1.01, H * 0.256); ctx.lineTo(W * 1.01, H * 0.56); ctx.closePath(); };
      outline(); ctx.fillStyle = '#efe8d6'; ctx.fill();
      ctx.save(); outline(); ctx.clip();
      const cf = ctx.createLinearGradient(W * 0.70, 0, W * 0.92, 0);
      cf.addColorStop(0, 'rgba(120,110,100,0.38)'); cf.addColorStop(0.55, 'rgba(255,255,250,0.0)'); cf.addColorStop(1, 'rgba(255,255,240,0.25)');
      ctx.fillStyle = cf; ctx.fillRect(W * 0.68, H * 0.24, W * 0.34, H * 0.33);
      // Soft vertical weathering and a few faint bands of flint
      for (let k = 0; k < 26; k++) { const x = W * (0.72 + rnd() * 0.20), y = H * (0.31 + rnd() * 0.16); ctx.fillStyle = `rgba(150,140,120,${(0.06 + rnd() * 0.10).toFixed(3)})`; ctx.fillRect(x, y, 1 + rnd() * 2.5, H * (0.03 + rnd() * 0.06)); }
      ctx.strokeStyle = 'rgba(120,110,95,0.16)'; ctx.lineWidth = 1.1;
      for (let k = 0; k < 4; k++) { const y = H * (0.36 + k * 0.040 + rnd() * 0.01); ctx.beginPath(); ctx.moveTo(W * 0.70, y + 5); ctx.bezierCurveTo(W * 0.77, y - 1 + rnd() * 4, W * 0.84, y + rnd() * 4, W * 0.92, y + 2); ctx.stroke(); }
      // Scree at the foot of the cliff
      ctx.fillStyle = '#d8d0bc'; ctx.beginPath(); ctx.moveTo(W * 0.70, H * 0.556); ctx.quadraticCurveTo(W * 0.78, H * 0.505, W * 0.90, H * 0.52); ctx.lineTo(W * 0.92, H * 0.56); ctx.closePath(); ctx.fill();
      // Green slope running back inland on the right
      const gs = ctx.createLinearGradient(W * 0.86, H * 0.25, W * 1.0, H * 0.56);
      gs.addColorStop(0, '#74c05a'); gs.addColorStop(0.6, '#4e9a42'); gs.addColorStop(1, '#3a7e36');
      ctx.fillStyle = gs; ctx.beginPath(); ctx.moveTo(W * 0.84, H * 0.270); ctx.quadraticCurveTo(W * 0.88, H * 0.256, W * 0.94, H * 0.252); ctx.lineTo(W * 1.01, H * 0.256); ctx.lineTo(W * 1.01, H * 0.56);
      ctx.lineTo(W * 0.945, H * 0.56); ctx.bezierCurveTo(W * 0.93, H * 0.47, W * 0.90, H * 0.36, W * 0.86, H * 0.30); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(40,90,40,0.25)'; ctx.lineWidth = 0.8;                                    // mown stripes in the turf
      for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(W * (0.88 + k * 0.022), H * 0.27); ctx.quadraticCurveTo(W * (0.92 + k * 0.016), H * 0.40, W * (0.955 + k * 0.01), H * 0.56); ctx.stroke(); }
      ctx.restore();
      // Grass cap along the cliff top, with a crumbly chalk edge beneath it
      ctx.fillStyle = '#5aa84a';
      ctx.beginPath(); ctx.moveTo(W * 0.715, H * 0.46); ctx.quadraticCurveTo(W * 0.75, H * 0.36, W * 0.81, H * 0.305); ctx.quadraticCurveTo(W * 0.86, H * 0.262, W * 0.94, H * 0.252);
      const edge = [];
      for (let k = 0; k <= 24; k++) { const u = k / 24, x = W * (0.94 - u * 0.225), base = u < 0.55 ? H * (0.252 + u / 0.55 * 0.055) : H * (0.307 + (u - 0.55) / 0.45 * 0.153); edge.push([x + 2, base + H * (0.012 + rnd() * 0.012)]); }
      edge.forEach(([x, y]) => ctx.lineTo(x, y)); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#7ac85a'; ctx.fillRect(W * 0.86, H * 0.253, W * 0.15, 1.2);
      ctx.fillStyle = 'rgba(120,110,90,0.35)'; edge.forEach(([x, y], k) => { if (k % 2) ctx.fillRect(x - 2, y, 3, 2.5 + rnd() * 3); });   // crumbling chalk
      // Gorse clumps
      [[0.90, 0.300], [0.955, 0.360], [0.915, 0.420], [0.985, 0.300], [0.80, 0.318]].forEach(([fx, fy]) => {
        const x = W * fx, y = H * fy;
        ctx.fillStyle = '#2e6a2e'; [[-0.006, 0.6], [0, 1], [0.007, 0.7]].forEach(([dx, r]) => { ctx.beginPath(); ctx.arc(x + W * dx, y - H * 0.004 * r, H * 0.008 * r, 0, PI * 2); ctx.fill(); });
        ctx.fillStyle = '#f6d030'; for (let k = 0; k < 7; k++) ctx.fillRect(x + (rnd() - 0.5) * W * 0.020, y - rnd() * H * 0.009, 1.3, 1.3);
      });
      // Coastal path winding down from the lighthouse, with a fence along the cliff edge
      ctx.strokeStyle = 'rgba(240,226,190,0.9)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(W * 0.885, H * 0.258); ctx.bezierCurveTo(W * 0.93, H * 0.29, W * 0.90, H * 0.36, W * 0.95, H * 0.40); ctx.bezierCurveTo(W * 0.99, H * 0.43, W * 0.97, H * 0.50, W * 1.01, H * 0.53); ctx.stroke();
      ctx.strokeStyle = '#6a5040'; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(W * 0.765, H * 0.343); ctx.quadraticCurveTo(W * 0.81, H * 0.296, W * 0.86, H * 0.270); ctx.stroke();
      for (let k = 0; k <= 8; k++) { const u = k / 8, x = W * (0.765 + u * 0.095), y = H * (0.343 - u * 0.073 + 0.018 * u * (1 - u) * -1); ctx.beginPath(); ctx.moveTo(x, y + 2.5); ctx.lineTo(x, y - 1); ctx.stroke(); }
      // Rocks at the foot, where the waves break: a jumble of sizes and greys
      [[0.705, 0.548, 0.020, '#6e6e78'], [0.73, 0.542, 0.032, '#5e5e68'], [0.765, 0.550, 0.018, '#7a7a84'], [0.79, 0.540, 0.036, '#62626c'], [0.83, 0.551, 0.022, '#74747e'],
       [0.86, 0.544, 0.030, '#5a5a64'], [0.90, 0.552, 0.024, '#6e6e78'], [0.935, 0.545, 0.034, '#60606a'], [0.975, 0.552, 0.026, '#74747e'], [1.0, 0.546, 0.03, '#5e5e68']].forEach(([fx, fy, fr, col]) => {
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(W * (fx - fr), H * fy);
        ctx.quadraticCurveTo(W * (fx - fr * 0.8), H * fy - H * fr * 1.3, W * (fx - fr * 0.1), H * fy - H * fr * 1.2);
        ctx.quadraticCurveTo(W * (fx + fr * 0.7), H * fy - H * fr * 1.0, W * (fx + fr), H * fy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.ellipse(W * (fx + fr * 0.25), H * fy - H * fr * 0.85, W * fr * 0.35, H * fr * 0.22, 0.2, 0, PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(40,60,50,0.35)'; ctx.fillRect(W * (fx - fr), H * fy - 2, W * fr * 2, 2);    // weed line
      });
      // Lighthouse: white tower, red bands, black lantern room
      const lx = W * 0.875, lb = H * 0.256, lh = H * 0.150, wb = W * 0.020, wt = W * 0.013;
      const tw = (u) => wb + (wt - wb) * u;
      ctx.fillStyle = '#f8f6f0'; ctx.beginPath(); ctx.moveTo(lx - wb, lb); ctx.lineTo(lx - wt, lb - lh); ctx.lineTo(lx + wt, lb - lh); ctx.lineTo(lx + wb, lb); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d83a3a';
      [[0.18, 0.36], [0.54, 0.72]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(lx - tw(a), lb - lh * a); ctx.lineTo(lx - tw(b), lb - lh * b); ctx.lineTo(lx + tw(b), lb - lh * b); ctx.lineTo(lx + tw(a), lb - lh * a); ctx.closePath(); ctx.fill(); });
      ctx.fillStyle = 'rgba(80,60,60,0.18)'; ctx.beginPath(); ctx.moveTo(lx - wb, lb); ctx.lineTo(lx - wt, lb - lh); ctx.lineTo(lx - wt * 0.3, lb - lh); ctx.lineTo(lx - wb * 0.3, lb); ctx.closePath(); ctx.fill();   // shade (sun on the right)
      ctx.fillStyle = '#2a2a30'; ctx.fillRect(lx - wt * 1.5, lb - lh - 2, wt * 3, 2.5);    // gallery
      ctx.fillStyle = '#f2e6a8'; ctx.fillRect(lx - wt * 0.85, lb - lh - H * 0.026, wt * 1.7, H * 0.024);
      ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 0.8; ctx.strokeRect(lx - wt * 0.85, lb - lh - H * 0.026, wt * 1.7, H * 0.024);
      ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.moveTo(lx - wt * 1.1, lb - lh - H * 0.026); ctx.lineTo(lx, lb - lh - H * 0.044); ctx.lineTo(lx + wt * 1.1, lb - lh - H * 0.026); ctx.closePath(); ctx.fill();
      // Keeper's cottage
      ctx.fillStyle = '#f2ece0'; ctx.fillRect(W * 0.915, lb - H * 0.030, W * 0.060, H * 0.030);
      ctx.fillStyle = '#c84a3a'; ctx.beginPath(); ctx.moveTo(W * 0.910, lb - H * 0.030); ctx.lineTo(W * 0.945, lb - H * 0.052); ctx.lineTo(W * 0.980, lb - H * 0.030); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3a6a9a'; ctx.fillRect(W * 0.925, lb - H * 0.022, 4, 4); ctx.fillRect(W * 0.955, lb - H * 0.022, 4, 4);
    }

    // ── The beach: wet sand at the waterline, warm dry sand up to us ──
    {
      const top = H * SHORE;
      const sg = ctx.createLinearGradient(0, top, 0, H);
      sg.addColorStop(0, '#c8a474'); sg.addColorStop(0.08, '#e8cf9c'); sg.addColorStop(0.5, '#f0d8a8'); sg.addColorStop(1, '#e2c28a');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(0, top); ctx.lineTo(W * 0.68, top); ctx.lineTo(W * 0.70, H * 0.552); ctx.lineTo(W, H * 0.565); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(120,90,60,0.18)';        // ripples and footprints in the sand
      for (let i = 0; i < 160; i++) { const y = top + H * 0.03 + rnd() * H * 0.40, x = rnd() * W; ctx.fillRect(x, y, 2 + rnd() * 5, 0.8); }
      ctx.fillStyle = 'rgba(255,255,240,0.25)';
      for (let i = 0; i < 90; i++) { const y = top + H * 0.03 + rnd() * H * 0.40, x = rnd() * W; ctx.fillRect(x, y, 1.5 + rnd() * 3, 0.7); }
      // High-tide line: a wavy strand of dried seaweed, driftwood twigs and shells just above where the waves reach
      { const ty = (x) => H * (SHORE + 0.058) + Math.sin(x / W * 22) * H * 0.006 + Math.sin(x / W * 7) * H * 0.004;
        for (let x = 2; x < W * 0.70; x += 3) {
          const y = ty(x) + (rnd() - 0.5) * 3;
          ctx.fillStyle = rnd() < 0.5 ? 'rgba(60,70,40,0.55)' : 'rgba(110,80,40,0.45)';
          ctx.beginPath(); ctx.ellipse(x, y, 1.6 + rnd() * 2.2, 0.8 + rnd() * 0.6, (rnd() - 0.5) * 0.8, 0, PI * 2); ctx.fill();
        }
        for (let k = 0; k < 7; k++) { const x = W * (0.03 + rnd() * 0.64), y = ty(x); ctx.strokeStyle = '#9a8468'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x - 4, y + 1); ctx.lineTo(x + 5, y - 1); ctx.stroke(); }
        for (let k = 0; k < 18; k++) { const x = W * (0.02 + rnd() * 0.66), y = ty(x) + (rnd() - 0.5) * 4;
          ctx.fillStyle = ['#ffffff', '#f6dcc8', '#e8c8d8', '#f2e6c0'][k % 4]; ctx.beginPath(); ctx.ellipse(x, y, 1.6, 1.1, rnd(), 0, PI * 2); ctx.fill(); } }
      ctx.fillStyle = 'rgba(255,255,255,0.75)';      // a few shells
      for (let i = 0; i < 12; i++) { const x = rnd() * W, y = top + H * (0.06 + rnd() * 0.10); ctx.beginPath(); ctx.ellipse(x, y, 1.6, 1.0, rnd(), 0, PI * 2); ctx.fill(); }
    }

    use('front');
    // ════════ FRONT LAYER — beach huts, windbreak and deckchair, stumps in the sand, a sandcastle ════════
    // Beach huts along the left, receding slightly
    {
      const huts = [[0.000, 0.680, 0.066, '#f28aa8'], [0.071, 0.668, 0.060, '#f6d24a'], [0.135, 0.657, 0.055, '#7ad0b0'], [0.194, 0.648, 0.050, '#5aa8e8']];
      huts.slice().reverse().forEach(([fx, fb, fw, col], i) => {
        const x = W * fx, b = H * fb, w = W * fw * 1.12, h = H * 0.125, rh = H * 0.036;
        ctx.fillStyle = 'rgba(80,60,40,0.25)'; ctx.beginPath(); ctx.moveTo(x, b); ctx.lineTo(x + w, b); ctx.lineTo(x + w - W * 0.03, b + H * 0.018); ctx.lineTo(x - W * 0.03, b + H * 0.018); ctx.closePath(); ctx.fill();   // shadow to the left
        ctx.fillStyle = col; ctx.fillRect(x, b - h, w, h);
        ctx.fillStyle = 'rgba(0,0,0,0.10)'; for (let k = 1; k < 7; k++) ctx.fillRect(x + w * k / 7, b - h, 0.8, h);   // planks
        ctx.fillStyle = 'rgba(255,255,255,0.20)'; ctx.fillRect(x + w - 3, b - h, 3, h);                               // sunlit edge
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x - 2, b - h); ctx.lineTo(x + w / 2, b - h - rh); ctx.lineTo(x + w + 2, b - h); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.moveTo(x - 2, b - h); ctx.lineTo(x + w / 2, b - h - rh); ctx.lineTo(x + w / 2, b - h); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(x, b - h, w, 2);                                       // fascia
        // Door with a little window; the yellow hut's door stands open
        const dx = x + w * 0.28, dw = w * 0.44, dh = h * 0.70;
        if (col === '#f6d24a') {
          ctx.fillStyle = '#4a3a2a'; ctx.fillRect(dx, b - dh, dw, dh);
          ctx.fillStyle = '#f6d24a'; ctx.fillRect(dx - dw * 0.45, b - dh, dw * 0.45, dh);
          ctx.fillStyle = '#e84a4a'; ctx.fillRect(dx + dw * 0.15, b - dh * 0.45, dw * 0.7, dh * 0.08);                // a towel hung inside
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(dx, b - dh, dw, dh);
          ctx.fillStyle = col; ctx.fillRect(dx + 1.5, b - dh + 1.5, dw - 3, dh - 3);
          ctx.fillStyle = '#bfe6f6'; ctx.fillRect(dx + dw * 0.25, b - dh * 0.85, dw * 0.5, dh * 0.22);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = FONT(800, H * 0.016); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(12 + (3 - i)), x + w * 0.5, b - h * 0.86);
      });
    }
    // Windbreak and a deckchair on the right
    {
      const x0 = W * 0.800, x1 = W * 0.985, b0 = H * 0.690, b1 = H * 0.676, h = H * 0.080;
      ctx.fillStyle = 'rgba(80,60,40,0.25)'; ctx.beginPath(); ctx.moveTo(x0, b0); ctx.lineTo(x1, b1); ctx.lineTo(x1 - W * 0.05, b1 + H * 0.020); ctx.lineTo(x0 - W * 0.05, b0 + H * 0.020); ctx.closePath(); ctx.fill();
      const n = 6;
      for (let k = 0; k < n; k++) {
        const xa = x0 + (x1 - x0) * k / n, xb = x0 + (x1 - x0) * (k + 1) / n, ba = b0 + (b1 - b0) * k / n, bb = b0 + (b1 - b0) * (k + 1) / n;
        ctx.fillStyle = k % 2 ? '#ffffff' : '#e84a5a';
        ctx.beginPath(); ctx.moveTo(xa, ba); ctx.lineTo(xa + 1, ba - h); ctx.quadraticCurveTo((xa + xb) / 2, ba - h + 3, xb, bb - h); ctx.lineTo(xb, bb); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = '#8a6a48'; for (let k = 0; k <= n; k++) { const x = x0 + (x1 - x0) * k / n, b = b0 + (b1 - b0) * k / n; ctx.fillRect(x - 1, b - h - 4, 2, h + 6); }
      // Deckchair in front of it
      const cx = W * 0.885, cb = H * 0.712, cw = W * 0.050;
      ctx.fillStyle = 'rgba(80,60,40,0.25)'; ctx.beginPath(); ctx.ellipse(cx - W * 0.02, cb + 1, cw * 0.8, H * 0.010, 0, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = '#8a6a48'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx - cw * 0.55, cb); ctx.lineTo(cx + cw * 0.35, cb - H * 0.085); ctx.moveTo(cx + cw * 0.50, cb); ctx.lineTo(cx - cw * 0.25, cb - H * 0.040); ctx.stroke();
      const seat = (u, v) => [cx - cw * 0.45 + u * cw * 0.85 + v * cw * 0.5, cb - H * 0.010 - u * H * 0.072 - v * H * 0.006];
      for (let k = 0; k < 5; k++) {
        const v0 = k / 5, v1 = (k + 1) / 5;
        ctx.fillStyle = k % 2 ? '#ffffff' : '#2a7ad8';
        ctx.beginPath(); [seat(0, v0), seat(1, v0), seat(1, v1), seat(0, v1)].forEach(([x, y], j) => j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill();
      }
    }
    // Stumps pushed into the sand, a red bucket beside them
    {
      const sx = W * STUMPS[0], base = H * STUMPS[1];
      ctx.fillStyle = 'rgba(80,60,40,0.30)';
      ctx.beginPath(); ctx.moveTo(sx - W * 0.03, base); ctx.lineTo(sx + W * 0.03, base); ctx.lineTo(sx - W * 0.05, base + H * 0.035); ctx.lineTo(sx - W * 0.11, base + H * 0.035); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d8b880'; ctx.beginPath(); ctx.ellipse(sx, base, W * 0.032, H * 0.008, 0, 0, PI * 2); ctx.fill();   // heaped sand
      [[-0.0135, -0.05, 0.145], [0, 0.02, 0.152], [0.0135, 0.07, 0.140]].forEach(([dx, lean, h]) => {
        ctx.save(); ctx.translate(sx + W * dx, base); ctx.rotate(lean);
        const r = W * 0.0058, sh = H * h;
        const g = ctx.createLinearGradient(-r, 0, r, 0);
        g.addColorStop(0, '#9a7448'); g.addColorStop(0.55, '#e8cc98'); g.addColorStop(1, '#fff0d0');    // lit from the right
        ctx.fillStyle = g; ctx.fillRect(-r, -sh, r * 2, sh);
        ctx.fillStyle = '#f2dcb0'; ctx.beginPath(); ctx.ellipse(0, -sh, r, r * 0.55, 0, 0, PI * 2); ctx.fill();
        ctx.restore();
      });
      ctx.fillStyle = '#c8a070'; ctx.fillRect(sx - W * 0.0205, base - H * 0.153, W * 0.019, 2.2); ctx.fillRect(sx + W * 0.0015, base - H * 0.150, W * 0.019, 2.2);   // bails
      // Bucket and spade
      const bx = W * 0.745, bb = H * 0.712, bw = W * 0.020, bh = H * 0.040;
      ctx.fillStyle = 'rgba(80,60,40,0.25)'; ctx.beginPath(); ctx.ellipse(bx - W * 0.015, bb + 1, bw * 1.2, H * 0.007, 0, 0, PI * 2); ctx.fill();
      const bg = ctx.createLinearGradient(bx - bw, 0, bx + bw, 0); bg.addColorStop(0, '#b02a2a'); bg.addColorStop(0.6, '#f04a3a'); bg.addColorStop(1, '#ff8a6a');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(bx - bw * 0.8, bb); ctx.lineTo(bx - bw, bb - bh); ctx.lineTo(bx + bw, bb - bh); ctx.lineTo(bx + bw * 0.8, bb); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c03a2a'; ctx.beginPath(); ctx.ellipse(bx, bb - bh, bw, H * 0.006, 0, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = '#f2f2f2'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(bx, bb - bh, bw * 0.9, PI * 1.05, PI * 1.95); ctx.stroke();
      ctx.strokeStyle = '#2a8ad8'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(bx + bw * 0.4, bb - bh - 2); ctx.lineTo(bx + bw * 1.6, bb - bh - H * 0.040); ctx.stroke();
      ctx.fillStyle = '#2a8ad8'; ctx.beginPath(); ctx.ellipse(bx + bw * 0.25, bb - bh + 1, 3, 2, 0.5, 0, PI * 2); ctx.fill();
    }
    // Sandcastle on the left of the cup (the kite string is tied to its flag)
    {
      const cx = W * CASTLE[0], cb = H * CASTLE[1], cs = W * 0.056;
      ctx.fillStyle = 'rgba(80,60,40,0.25)'; ctx.beginPath(); ctx.ellipse(cx - W * 0.02, cb + 1, cs * 1.4, H * 0.010, 0, 0, PI * 2); ctx.fill();
      const sand = (x0, x1) => { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#c8a070'); g.addColorStop(0.6, '#ecd09a'); g.addColorStop(1, '#f8e4b8'); return g; };
      ctx.fillStyle = sand(cx - cs, cx + cs); ctx.beginPath(); ctx.moveTo(cx - cs, cb); ctx.lineTo(cx - cs * 0.85, cb - cs * 0.55); ctx.lineTo(cx + cs * 0.85, cb - cs * 0.55); ctx.lineTo(cx + cs, cb); ctx.closePath(); ctx.fill();
      [[-0.55, 0.42], [0.55, 0.42], [0, 0.55]].forEach(([dx, w], k) => {
        const tx = cx + cs * dx, tw = cs * w * 0.5, tb = cb - cs * 0.55, th = cs * (k === 2 ? 0.75 : 0.45);
        ctx.fillStyle = sand(tx - tw, tx + tw); ctx.beginPath(); ctx.moveTo(tx - tw, tb); ctx.lineTo(tx - tw * 0.85, tb - th); ctx.lineTo(tx + tw * 0.85, tb - th); ctx.lineTo(tx + tw, tb); ctx.closePath(); ctx.fill();
        for (let c = 0; c < 3; c++) ctx.fillRect(tx - tw * 0.85 + c * tw * 0.7, tb - th - 2.5, tw * 0.36, 2.5);   // crenellations
      });
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.ellipse(cx - cs * 0.3, cb - cs * 0.25, 1.6, 1.0, 0, 0, PI * 2); ctx.fill();   // a shell pressed in
      ctx.fillStyle = '#4a3a2a'; ctx.beginPath(); ctx.arc(cx, cb - cs * 0.28, cs * 0.12, PI, 0); ctx.fill();                                        // doorway
      ctx.strokeStyle = '#6a5a48'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(cx, cb - cs * 1.33); ctx.lineTo(cx, cb - cs * 1.75); ctx.stroke();   // flagpole
    }
  }

  // Bright afternoon haze at the horizon and a gentle vignette
  function drawAtmos(ctx, W, H) {
    const haze = ctx.createLinearGradient(0, H * 0.33, 0, H * 0.46);
    haze.addColorStop(0, 'rgba(255,250,235,0)'); haze.addColorStop(0.6, 'rgba(255,250,235,0.14)'); haze.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.fillStyle = haze; ctx.fillRect(0, H * 0.33, W, H * 0.13);
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.42, W * 0.25, W * 0.5, H * 0.42, W * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(0.75, 'rgba(20,30,40,0.05)'); vig.addColorStop(1, 'rgba(20,30,40,0.22)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  }

  // ════════ THE COASTAL CUP — a fluted silver shell bowl with rope handles, on a driftwood crate ════════
  // Sixteen shell flutes and a scalloped lip turn with the cup; the inside is mother-of-pearl. A sea-glass
  // enamel band with little breaking waves runs round the middle; a starfish on the front, a scallop on the back.
  function drawTrophy(ctx, W, H, phi, t) {
    const tx = W * 0.5, tb = H * 0.705, S = H * 0.390, K = 1.72, TILT = 0.10;
    const P = (r, y, a) => [tx + r * Math.sin(a), y + r * Math.cos(a) * TILT];
    const silver = (x0, x1) => {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, '#4a5460'); g.addColorStop(0.16, '#a8b4c2'); g.addColorStop(0.38, '#dfe7ef');
      g.addColorStop(0.62, '#c4d0dc'); g.addColorStop(0.80, '#f8fcff'); g.addColorStop(0.92, '#b8c4d0'); g.addColorStop(1, '#5a6470');
      return g;
    };
    ctx.save(); ctx.translate(tx, tb); ctx.scale(K, K); ctx.translate(-tx, -tb);
    // Shadow falling to the left (sun high on the right)
    const shg = ctx.createLinearGradient(tx, 0, tx - W * 0.14, 0);
    shg.addColorStop(0, 'rgba(90,60,30,0.32)'); shg.addColorStop(1, 'rgba(90,60,30,0)');
    ctx.fillStyle = shg; ctx.beginPath(); ctx.moveTo(tx - W * 0.066, tb); ctx.lineTo(tx + W * 0.066, tb); ctx.lineTo(tx - W * 0.02, tb + H * 0.035); ctx.lineTo(tx - W * 0.15, tb + H * 0.035); ctx.closePath(); ctx.fill();

    // ── Driftwood crate: bleached planks, a brass plaque, a coil of rope on top ──
    const pW = W * 0.066, pH = S * 0.21, dep = S * 0.042, pTop = tb - pH;
    ctx.fillStyle = '#e2d8c8'; ctx.beginPath(); ctx.moveTo(tx - pW, pTop); ctx.lineTo(tx - pW + W * 0.010, pTop - dep); ctx.lineTo(tx + pW + W * 0.010, pTop - dep); ctx.lineTo(tx + pW, pTop); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c8bca8'; ctx.beginPath(); ctx.moveTo(tx + pW, pTop); ctx.lineTo(tx + pW + W * 0.010, pTop - dep); ctx.lineTo(tx + pW + W * 0.010, tb - dep); ctx.lineTo(tx + pW, tb); ctx.closePath(); ctx.fill();   // sunlit side
    const wg = ctx.createLinearGradient(tx - pW, 0, tx + pW, 0);
    wg.addColorStop(0, '#9a8c78'); wg.addColorStop(1, '#bcae96');
    ctx.fillStyle = wg; ctx.fillRect(tx - pW, pTop, pW * 2, pH);
    ctx.fillStyle = 'rgba(60,45,30,0.35)'; for (let k = 1; k < 3; k++) ctx.fillRect(tx - pW, pTop + pH * k / 3, pW * 2, 1.1);
    ctx.strokeStyle = 'rgba(90,70,50,0.25)'; ctx.lineWidth = 0.5;           // grain
    for (let k = 0; k < 9; k++) { const y = pTop + 2 + k * pH / 9; ctx.beginPath(); ctx.moveTo(tx - pW, y); ctx.bezierCurveTo(tx - pW * 0.3, y + 1.5, tx + pW * 0.3, y - 1.5, tx + pW, y + 0.5); ctx.stroke(); }
    ctx.fillStyle = '#3a3a3a'; [[-0.85, 0.16], [0.85, 0.16], [-0.85, 0.83], [0.85, 0.83]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(tx + pW * dx, pTop + pH * dy, 0.9, 0, PI * 2); ctx.fill(); });
    const plW = pW * 1.20, plH = pH * 0.46, plY = pTop + pH * 0.27;
    const bg = ctx.createLinearGradient(tx - plW / 2, 0, tx + plW / 2, 0);
    bg.addColorStop(0, '#9a7a3a'); bg.addColorStop(0.5, '#f2d88a'); bg.addColorStop(0.8, '#ffeeb8'); bg.addColorStop(1, '#a8843a');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(tx - plW / 2, plY, plW, plH, 2); ctx.fill();
    ctx.fillStyle = '#3a2a10'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = FONT(900, plH * 0.48); ctx.fillText('COASTAL CUP', tx, plY + plH * 0.40, plW * 0.86);
    ctx.font = FONT(700, plH * 0.24); ctx.fillText('SAND & SURF', tx, plY + plH * 0.78, plW * 0.7);
    // Rope coil round the foot, back half first
    const coilY = pTop - dep * 0.5, coilR = pW * 0.62;
    const rope = (a0, a1) => {
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#c8a870'; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.ellipse(tx, coilY, coilR, coilR * TILT * 1.6, 0, a0, a1); ctx.stroke();
      ctx.strokeStyle = '#8a6a40'; ctx.lineWidth = 1.2; ctx.setLineDash([1.6, 2.4]); ctx.lineDashOffset = -phi * 8; ctx.beginPath(); ctx.ellipse(tx, coilY, coilR, coilR * TILT * 1.6, 0, a0, a1); ctx.stroke(); ctx.setLineDash([]);
    };
    rope(PI, PI * 2);

    // ── Foot and a rope-twist stem ──
    const footY = pTop - dep * 0.45, footW = W * 0.032;
    ctx.fillStyle = silver(tx - footW, tx + footW);
    ctx.beginPath(); ctx.ellipse(tx, footY, footW, S * 0.014, 0, 0, PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx - footW, footY); ctx.quadraticCurveTo(tx - footW * 0.7, footY - S * 0.030, tx - footW * 0.22, footY - S * 0.038);
    ctx.lineTo(tx + footW * 0.22, footY - S * 0.038); ctx.quadraticCurveTo(tx + footW * 0.7, footY - S * 0.030, tx + footW, footY); ctx.closePath(); ctx.fill();
    rope(0, PI);
    const stemTop = footY - S * 0.125, sr = footW * 0.20;
    ctx.fillStyle = silver(tx - sr, tx + sr); ctx.fillRect(tx - sr, stemTop, sr * 2, footY - S * 0.035 - stemTop);
    ctx.strokeStyle = 'rgba(60,70,85,0.55)'; ctx.lineWidth = 0.8;           // twist grooves that turn with the cup
    for (let k = 0; k < 10; k++) {
      const y = stemTop + (k + ((phi / (PI * 2) * 4) % 1)) * (footY - S * 0.035 - stemTop) / 10;
      if (y > footY - S * 0.036) continue;
      ctx.beginPath(); ctx.moveTo(tx - sr, y + 2); ctx.lineTo(tx + sr, y - 1); ctx.stroke();
    }
    // Knop: a small silver scallop
    { const ky = stemTop + S * 0.050, kr = footW * 0.42;
      ctx.fillStyle = silver(tx - kr, tx + kr); ctx.beginPath(); ctx.ellipse(tx, ky, kr, kr * 0.45, 0, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(60,70,85,0.45)'; ctx.lineWidth = 0.5;
      for (let k = 0; k < 7; k++) { const a = phi * 2 + k * PI / 3.5, c = Math.cos(a); if (c < 0) continue; const x = tx + kr * Math.sin(a); ctx.beginPath(); ctx.moveTo(x, ky - kr * 0.40); ctx.lineTo(x, ky + kr * 0.40); ctx.stroke(); } }

    // ── The bowl: a wide fluted shell ──
    const cw = W * 0.058, yb = stemTop;
    const pts = [[0.22, 0.000], [0.50, 0.035], [0.80, 0.090], [1.00, 0.155], [1.12, 0.220], [1.20, 0.275]];
    const prof = pts.map(([r, h]) => [r * cw, yb - h * S]);
    const lipY = prof[prof.length - 1][1], lipR = prof[prof.length - 1][0];
    const rAt = (y) => { for (let k = 0; k < prof.length - 1; k++) { const [r0, y0] = prof[k], [r1, y1] = prof[k + 1]; if (y <= y0 && y >= y1) return r0 + (r1 - r0) * (y0 - y) / (y0 - y1); } return cw; };
    const bowlPath = () => { ctx.beginPath(); prof.forEach(([r, y], k) => k ? ctx.lineTo(tx - r, y) : ctx.moveTo(tx - r, y)); for (let k = prof.length - 1; k >= 0; k--) ctx.lineTo(tx + prof[k][0], prof[k][1]); ctx.closePath(); };

    // Rope handles: a loop of twisted rope on each side
    const ringY = yb - S * 0.200, ringR = cw * 0.15, ringR0 = rAt(ringY) + ringR * 0.85;
    function ropeLoop(a) {
      const pts2 = [];
      for (let k = 0; k <= 48; k++) { const th = k / 48 * PI * 2; pts2.push(P(ringR0 + ringR * Math.cos(th), ringY + ringR * Math.sin(th), a)); }
      const path = () => { ctx.beginPath(); pts2.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); };
      ctx.lineCap = 'round';
      ctx.strokeStyle = Math.cos(a) < 0 ? '#a88a5a' : '#d8b878'; ctx.lineWidth = W * 0.0048; path(); ctx.stroke();
      ctx.strokeStyle = 'rgba(110,80,40,0.75)'; ctx.lineWidth = W * 0.0022; ctx.setLineDash([1.5, 1.9]); ctx.lineDashOffset = -phi * 6; path(); ctx.stroke(); ctx.setLineDash([]);
      // Silver ferrules where the rope meets the bowl
      [-1, 1].forEach(sd => { const [x, y] = P(rAt(ringY + sd * ringR * 0.9) * 0.99, ringY + sd * ringR * 0.9, a); ctx.fillStyle = silver(x - 4, x + 4); ctx.beginPath(); ctx.ellipse(x, y, 2.6 * Math.max(0.35, Math.abs(Math.cos(a))), 2.2, 0, 0, PI * 2); ctx.fill(); });
    }
    const loops = [phi + PI / 2, phi - PI / 2];
    loops.filter(a => Math.cos(a) < 0).forEach(ropeLoop);

    // Body in silver, with calm reflections of the sky above and the sand below
    ctx.fillStyle = silver(tx - lipR, tx + lipR); bowlPath(); ctx.fill();
    ctx.save(); bowlPath(); ctx.clip();
    const sk = ctx.createLinearGradient(0, lipY, 0, yb - S * 0.15);
    sk.addColorStop(0, 'rgba(120,190,240,0.35)'); sk.addColorStop(1, 'rgba(120,190,240,0)');
    ctx.fillStyle = sk; ctx.fillRect(tx - lipR, lipY, lipR * 2, S * 0.13);
    const sd = ctx.createLinearGradient(0, yb - S * 0.10, 0, yb);
    sd.addColorStop(0, 'rgba(230,195,140,0)'); sd.addColorStop(1, 'rgba(230,195,140,0.40)');
    ctx.fillStyle = sd; ctx.fillRect(tx - lipR, yb - S * 0.10, lipR * 2, S * 0.10);
    // Sixteen shell flutes, fixed to the metal so they turn; lit from the right
    const NF = 16;
    for (let i = 0; i < NF; i++) {
      const a = phi + i * PI * 2 / NF, c = Math.cos(a), sn = Math.sin(a); if (c < 0.03) continue;
      const groove = [], ridge = [];
      prof.forEach(([r, y]) => { groove.push(P(r * 1.001, y, a)); ridge.push(P(r * 1.001, y, a + PI / NF)); });
      ctx.strokeStyle = `rgba(50,60,75,${(0.45 * c).toFixed(3)})`; ctx.lineWidth = 0.9;
      ctx.beginPath(); groove.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
      const lit = Math.max(0, Math.cos(a + PI / NF)) * (0.25 + 0.45 * Math.max(0, Math.sin(a + PI / NF) + 0.3));
      ctx.strokeStyle = `rgba(255,255,255,${lit.toFixed(3)})`; ctx.lineWidth = 1.3;
      ctx.beginPath(); ridge.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    }
    ctx.restore();
    // Sea-glass enamel band with little breaking waves
    {
      const ya = yb - S * 0.105, yc = yb - S * 0.140, ra = rAt(ya), rc = rAt(yc);
      ctx.beginPath();
      for (let k = 0; k <= 30; k++) { const a = -PI / 2 + PI * k / 30, [x, y] = P(ra, ya, a); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      for (let k = 30; k >= 0; k--) { const a = -PI / 2 + PI * k / 30, [x, y] = P(rc, yc, a); ctx.lineTo(x, y); }
      ctx.closePath();
      const eg = ctx.createLinearGradient(tx - ra, 0, tx + ra, 0);
      eg.addColorStop(0, '#1a6a78'); eg.addColorStop(0.55, '#3ab8b8'); eg.addColorStop(0.8, '#7ae0d8'); eg.addColorStop(1, '#2a8a90');
      ctx.fillStyle = eg; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.6; ctx.stroke();
      for (let i = 0; i < 18; i++) {
        const a = phi + i * PI * 2 / 18, c = Math.cos(a); if (c < 0.1) continue;
        const ym = (ya + yc) / 2, [x, y] = P((ra + rc) / 2 * 1.004, ym, a), s = (ya - yc) * 0.40;
        ctx.save(); ctx.translate(x, y); ctx.scale(c, 1);
        ctx.strokeStyle = `rgba(255,255,255,${(0.9 * c).toFixed(3)})`; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(-s * 1.2, s * 0.5); ctx.quadraticCurveTo(-s * 0.2, -s * 1.0, s * 0.6, -s * 0.2); ctx.quadraticCurveTo(s * 0.2, s * 0.1, s * 0.4, s * 0.5); ctx.stroke();
        ctx.restore();
      }
    }
    // Starfish on the front, a scallop shell on the back, foreshortened as they come round
    const ey = yb - S * 0.200, er = rAt(ey) * 1.0, es = cw * 0.22;
    function emblem(a, fn) {
      const c = Math.cos(a); if (c <= 0) return;
      ctx.save(); ctx.globalAlpha = Math.min(1, c * 3); ctx.translate(tx + er * Math.sin(a), ey + er * c * TILT); ctx.scale(c, 1); fn(); ctx.restore();
    }
    emblem(phi, () => {
      ctx.fillStyle = '#f2843a'; ctx.beginPath();
      for (let k = 0; k < 10; k++) { const rr = k % 2 ? es * 0.42 : es, aa = k * PI / 5 - PI / 2; ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,220,170,0.8)'; for (let k = 0; k < 5; k++) { const aa = k * PI * 2 / 5 - PI / 2; ctx.beginPath(); ctx.arc(Math.cos(aa) * es * 0.5, Math.sin(aa) * es * 0.5, 0.7, 0, PI * 2); ctx.fill(); }
      ctx.strokeStyle = 'rgba(140,60,20,0.5)'; ctx.lineWidth = 0.5; ctx.stroke();
    });
    emblem(phi + PI, () => {
      ctx.fillStyle = '#f2b8c8'; ctx.beginPath(); ctx.moveTo(0, es * 0.7); ctx.arc(0, es * 0.1, es * 0.85, PI * 1.08, PI * 1.92); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(160,80,100,0.7)'; ctx.lineWidth = 0.6;
      for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(0, es * 0.7); ctx.lineTo(Math.sin(k * 0.22) * es * 0.85, es * 0.1 - Math.cos(k * 0.22) * es * 0.85); ctx.stroke(); }
    });
    // One soft highlight on the sunny side
    ctx.save(); bowlPath(); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,250,0.30)'; ctx.beginPath(); ctx.ellipse(tx + cw * 0.70, yb - S * 0.17, cw * 0.09, S * 0.075, -0.15, 0, PI * 2); ctx.fill();
    ctx.restore();

    // ── Scalloped lip and the mother-of-pearl inside ──
    const NS = 16, lip = (a) => [lipR * (1 + 0.035 * Math.cos(NS * (a - phi))), lipY - S * 0.010 * Math.cos(NS * (a - phi))];
    const rimPts = []; for (let k = 0; k <= 160; k++) { const a = k / 160 * PI * 2, [r, y] = lip(a); rimPts.push([...P(r, y, a), Math.cos(a)]); }
    ctx.beginPath(); rimPts.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
    const pearl = ctx.createLinearGradient(tx - lipR, lipY - lipR * TILT, tx + lipR, lipY + lipR * TILT);
    pearl.addColorStop(0, '#e8d8e8'); pearl.addColorStop(0.3, '#c8e8f2'); pearl.addColorStop(0.55, '#f6ecf4'); pearl.addColorStop(0.8, '#d8f0e8'); pearl.addColorStop(1, '#f2e2d0');
    ctx.fillStyle = pearl; ctx.fill();
    ctx.save(); ctx.clip();                          // shadow under the near rim, sheen on the far wall
    const ish = ctx.createLinearGradient(0, lipY + lipR * TILT, 0, lipY - lipR * TILT);
    ish.addColorStop(0, 'rgba(60,70,90,0.45)'); ish.addColorStop(0.45, 'rgba(60,70,90,0)'); ish.addColorStop(1, 'rgba(255,255,255,0.20)');
    ctx.fillStyle = ish; ctx.fillRect(tx - lipR * 1.1, lipY - lipR * TILT * 2, lipR * 2.2, lipR * TILT * 4);
    ctx.restore();
    // A gold cricket ball resting in the shell like a pearl; its seam turns with the cup
    {
      const br = cw * 0.30, bx = tx, by = lipY - br * 0.25;
      ctx.save(); ctx.beginPath(); ctx.moveTo(tx - lipR * 1.1, lipY); ctx.lineTo(tx - lipR * 1.1, by - br - 3); ctx.lineTo(tx + lipR * 1.1, by - br - 3); ctx.lineTo(tx + lipR * 1.1, lipY);
      for (let k = 40; k >= -40; k--) { const [x, y] = rimPts[(k + 160) % 160]; ctx.lineTo(x, y); }   // the front half of the rim, right round to the left
      ctx.closePath(); ctx.clip();
      const g = ctx.createRadialGradient(bx + br * 0.35, by - br * 0.40, br * 0.1, bx, by, br);
      g.addColorStop(0, '#fff6c8'); g.addColorStop(0.5, '#f0c440'); g.addColorStop(1, '#8a5a10');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, br, 0, PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(bx, by, br, 0, PI * 2); ctx.clip();
      const cp = Math.cos(phi), sp = Math.sin(phi), EL = 0.30, ce = Math.cos(EL), se = Math.sin(EL);
      const turn = ([X, Y, Z]) => { const x = X * cp + Z * sp, z = Z * cp - X * sp; return [x, Y * ce - z * se, z * ce + Y * se]; };
      const ring = (off) => (u) => { const k = Math.sqrt(1 - off * off); return [off, Math.sin(u) * k, Math.cos(u) * k]; };
      const curve = (fn, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; let prev = null;
        for (let k = 0; k <= 100; k++) { const [X, Y, Z] = turn(fn(k / 100 * PI * 2)), pt = [bx + X * br, by - Y * br];
          if (Z > 0 && prev) { ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(pt[0], pt[1]); ctx.stroke(); } prev = Z > 0 ? pt : null; } };
      curve(ring(0), 'rgba(255,250,225,0.9)', br * 0.12);
      curve(ring(0.15), 'rgba(140,90,20,0.7)', br * 0.05);
      curve(ring(-0.15), 'rgba(140,90,20,0.7)', br * 0.05);
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,240,0.55)'; ctx.beginPath(); ctx.ellipse(bx + br * 0.38, by - br * 0.42, br * 0.20, br * 0.12, 0.6, 0, PI * 2); ctx.fill();
      ctx.restore();
    }
    // Rim: thin at the back, a bright rolled edge at the front
    ctx.lineCap = 'round';
    for (let k = 0; k < rimPts.length - 1; k++) {
      const [x0, y0, c0] = rimPts[k], [x1, y1] = rimPts[k + 1];
      ctx.strokeStyle = c0 >= 0 ? 'rgba(250,252,255,0.95)' : 'rgba(150,160,175,0.9)'; ctx.lineWidth = c0 >= 0 ? 1.5 : 0.9;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    loops.filter(a => Math.cos(a) >= 0).forEach(ropeLoop);
    ctx.restore();

    // A bat leaning on the sandcastle with a red ball beside it (drawn unscaled)
    {
      const toeX = W * CASTLE[0] + W * 0.075, toeY = H * CASTLE[1] - H * 0.002, topX = W * CASTLE[0] + W * 0.030, topY = H * CASTLE[1] - H * 0.150;
      const ang = Math.atan2(topY - toeY, topX - toeX), len = Math.hypot(topX - toeX, topY - toeY);
      ctx.fillStyle = 'rgba(80,60,40,0.28)'; ctx.beginPath(); ctx.ellipse(toeX - W * 0.03, toeY + 2, W * 0.030, H * 0.007, -0.1, 0, PI * 2); ctx.fill();
      ctx.save(); ctx.translate(toeX, toeY); ctx.rotate(ang);
      const bw = W * 0.024, bl = len * 0.64;
      const g = ctx.createLinearGradient(0, -bw / 2, 0, bw / 2);
      g.addColorStop(0, '#9a7a50'); g.addColorStop(0.5, '#e0c490'); g.addColorStop(1, '#fbe8bc');
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(0, -bw / 2, bl, bw, bw * 0.28); ctx.fill();
      ctx.fillStyle = '#2a8ad8'; ctx.fillRect(bl * 0.42, -bw / 2, bl * 0.20, bw);
      ctx.fillStyle = 'rgba(160,120,70,0.35)'; ctx.fillRect(bl * 0.12, -bw * 0.4, bl * 0.12, bw * 0.3);           // sand stuck to the toe
      ctx.fillStyle = '#e0c490'; ctx.fillRect(bl, -bw * 0.16, bw * 0.6, bw * 0.32);
      ctx.fillStyle = '#e8336a'; ctx.fillRect(bl + bw * 0.55, -bw * 0.17, len - bl - bw * 0.55, bw * 0.34);
      ctx.restore();
      const bx = toeX + W * 0.020, by = toeY - H * 0.013, r = H * 0.013;
      const bg2 = ctx.createRadialGradient(bx + r * 0.3, by - r * 0.4, r * 0.1, bx, by, r);
      bg2.addColorStop(0, '#ff8a7a'); bg2.addColorStop(0.6, '#c82a2a'); bg2.addColorStop(1, '#6a1010');
      ctx.fillStyle = bg2; ctx.beginPath(); ctx.arc(bx, by, r, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,240,220,0.8)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.ellipse(bx, by, r * 0.35, r, -0.3, 0, PI * 2); ctx.stroke();
    }
  }

  // ════════ AMBIENT ANIMATION ════════
  // Over the sky and sea (behind the headland and pier): clouds, the sailing boat, sparkles on the water, distant gulls
  // Soft cumulus clouds, painted once into sprites (sunlit tops, cool grey-blue undersides, soft edges)
  const CLOUDS = (() => {
    const make = (w, h, seed) => {
      let s = seed; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
      const a = document.createElement('canvas'); a.width = w; a.height = h; const g = a.getContext('2d');
      g.fillStyle = '#ffffff';
      const base = h * 0.78;
      for (let k = 0; k < 14; k++) {                      // puffs: big in the middle, smaller to the sides, all sitting on a flat base
        const u = k / 13, x = w * (0.12 + 0.76 * u + (r() - 0.5) * 0.05), rad = h * (0.18 + 0.30 * Math.sin(u * Math.PI) * (0.75 + r() * 0.4));
        g.beginPath(); g.arc(x, Math.min(base - rad * 0.55, base - h * 0.05), rad, 0, Math.PI * 2); g.fill();
      }
      g.fillRect(w * 0.10, base - h * 0.16, w * 0.80, h * 0.16);
      g.globalCompositeOperation = 'source-atop';
      const sh = g.createLinearGradient(0, h * 0.15, 0, base);
      sh.addColorStop(0, 'rgba(255,253,245,1)'); sh.addColorStop(0.6, 'rgba(240,246,252,1)'); sh.addColorStop(1, 'rgba(190,208,228,1)');
      g.fillStyle = sh; g.fillRect(0, 0, w, h);
      const lit = g.createRadialGradient(w * 0.75, h * 0.1, 0, w * 0.75, h * 0.1, w * 0.5);  // sun on the right
      lit.addColorStop(0, 'rgba(255,250,230,0.6)'); lit.addColorStop(1, 'rgba(255,250,230,0)');
      g.fillStyle = lit; g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = 'source-over';
      const b = document.createElement('canvas'); b.width = w; b.height = h; const gb = b.getContext('2d');
      gb.filter = 'blur(2px)'; gb.globalAlpha = 0.95; gb.drawImage(a, 0, 0);
      return b;
    };
    return [make(150, 60, 7), make(110, 46, 19), make(190, 70, 33)];
  })();
  function drawAmbientSky(ctx, W, H, t) {
    // Clouds gliding steadily across from right to left at different heights and speeds
    // All at the same speed and evenly spread round the loop, so they never bunch up
    [[0, 0.030, 0.467, 0.85], [1, 0.175, 0.80, 0.70], [2, 0.010, 0.0, 1.0]].forEach(([i, fy, off, sc]) => {
      const spr = CLOUDS[i], w = spr.width * sc, h = spr.height * sc, span = W + 400;
      const x = W + 200 - ((t * 8 + off * span) % span), y = H * fy;
      ctx.drawImage(spr, x - w, y, w, h);
    });
    // A light aircraft towing a COASTAL CUP banner across the sky (behind the lighthouse)
    {
      const f = win(t % SHOW, PLANE);
      if (f > 0) {
        const x = W * (1.12 - f * 1.55), y = H * 0.070 + Math.sin(f * PI * 3) * 2, s = H * 0.016;
        // Banner trailing behind (to the right), rippling
        const bx0 = x + s * 3.2, bw = W * 0.20, bh = H * 0.040;
        ctx.strokeStyle = 'rgba(60,60,70,0.7)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x + s * 1.2, y); ctx.lineTo(bx0, y); ctx.stroke();
        ctx.save();
        const rip = (u) => Math.sin(u * 9 - t * 9) * 1.6 * u;
        ctx.beginPath(); for (let k = 0; k <= 20; k++) { const u = k / 20; ctx.lineTo(bx0 + bw * u, y - bh / 2 + rip(u)); } for (let k = 20; k >= 0; k--) { const u = k / 20; ctx.lineTo(bx0 + bw * u, y + bh / 2 + rip(u)); } ctx.closePath();
        ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.clip();
        ctx.fillStyle = 'rgba(0,0,0,0.08)'; for (let k = 1; k < 8; k++) ctx.fillRect(bx0 + bw * k / 8, y - bh, 1, bh * 2);
        ctx.fillStyle = '#d83a3a'; ctx.font = FONT(900, bh * 0.70); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('COASTAL CUP', bx0 + bw / 2, y + 0.5 + rip(0.5), bw * 0.9);
        ctx.restore();
        // The plane, flying left
        ctx.fillStyle = '#f4f4f6'; ctx.beginPath(); ctx.ellipse(x, y, s * 1.4, s * 0.32, 0, 0, PI * 2); ctx.fill();
        ctx.fillStyle = '#d83a3a'; ctx.fillRect(x - s * 0.3, y - s * 0.9, s * 0.45, s * 1.8);                         // wing seen from below-ish
        ctx.beginPath(); ctx.moveTo(x + s * 1.0, y); ctx.lineTo(x + s * 1.5, y - s * 0.7); ctx.lineTo(x + s * 1.45, y); ctx.closePath(); ctx.fill();   // tail fin
        ctx.fillStyle = '#3a6aa8'; ctx.fillRect(x - s * 0.95, y - s * 0.22, s * 0.35, s * 0.16);                          // cockpit
        ctx.fillStyle = `rgba(80,80,90,${(0.35 + 0.3 * Math.sin(t * 60)).toFixed(3)})`; ctx.fillRect(x - s * 1.5, y - s * 0.6, 0.8, s * 1.2);   // propeller blur
      }
    }
    // A sailing boat gliding along the horizon (its own 53s cycle)
    {
      const u = (t % 53) / 53, x = W * (-0.08 + u * 0.80), y = H * (HORIZON + 0.012), s = H * 0.030;
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x, y - s * 1.6); ctx.lineTo(x, y - s * 0.2); ctx.lineTo(x + s * 0.8, y - s * 0.2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f2f6fa'; ctx.beginPath(); ctx.moveTo(x - 1, y - s * 1.3); ctx.lineTo(x - 1, y - s * 0.25); ctx.lineTo(x - s * 0.55, y - s * 0.25); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#c83a3a'; ctx.beginPath(); ctx.moveTo(x - s * 0.6, y - s * 0.18); ctx.lineTo(x + s * 0.9, y - s * 0.18); ctx.lineTo(x + s * 0.7, y); ctx.lineTo(x - s * 0.45, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x - s * 0.9, y + 0.5, s * 0.5, 0.7);
    }
    // Two little yachts further out, barely moving
    [[71.0, 0.40, 0.006, '#ffffff'], [97.0, 0.10, 0.014, '#f6e0a0']].forEach(([period, off, dy, sail], i) => {
      const u = ((t / period) + off) % 1, x = W * (0.32 + u * 0.36), y = H * (HORIZON + dy), s = H * 0.014;
      ctx.fillStyle = sail; ctx.beginPath(); ctx.moveTo(x, y - s * 1.7); ctx.lineTo(x, y - s * 0.2); ctx.lineTo(x + s * 0.8, y - s * 0.2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2a3a5a'; ctx.fillRect(x - s * 0.4, y - s * 0.2, s * 1.4, s * 0.3);
    });
    // Sparkles on the water, thickest along the sun's path
    for (let k = 0; k < 26; k++) {
      const h1 = Math.sin(k * 91.7) * 0.5 + 0.5, h2 = Math.sin(k * 47.3) * 0.5 + 0.5;
      const x = W * (0.55 + 0.45 * h1) - (k % 3) * W * 0.18, y = H * (HORIZON + 0.01 + h2 * (SHORE - HORIZON - 0.03));
      const a = Math.max(0, Math.sin(t * (1.3 + h1) + k * 2.1)) * 0.75;
      if (a < 0.05) continue;
      ctx.fillStyle = `rgba(255,255,245,${a.toFixed(3)})`; ctx.fillRect(x - 1.5, y, 3, 0.9); ctx.fillRect(x - 0.4, y - 0.8, 0.9, 2.5);
    }
  }

  // On the beach (behind the huts and props): waves running up the sand, spray on the rocks, the beach ball
  function drawAmbientShore(ctx, W, H, t) {
    const m = t % SHOW;
    // Two sets of waves washing up the sand and sliding back
    [0, 3.15].forEach((off, wI) => {
      const u = ((t + off) % 6.3) / 6.3, reach = Math.sin(u * PI);
      const y = H * (SHORE + 0.002 + 0.040 * reach);
      ctx.save(); ctx.beginPath(); ctx.rect(0, H * SHORE - 2, W * 0.70, H * 0.08); ctx.clip();
      const g = ctx.createLinearGradient(0, H * SHORE, 0, y);
      g.addColorStop(0, 'rgba(76,202,200,0.70)'); g.addColorStop(1, 'rgba(160,230,225,0.45)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, H * SHORE - 2);
      for (let k = 0; k <= 40; k++) { const x = W * 0.70 * k / 40; ctx.lineTo(x, y + Math.sin(k * 0.9 + t * 1.5 + wI) * 1.5); }
      ctx.lineTo(W * 0.70, H * SHORE - 2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${(0.55 + 0.35 * (u < 0.5 ? 1 : 0.4)).toFixed(3)})`; ctx.lineWidth = 1.4;
      ctx.beginPath(); for (let k = 0; k <= 40; k++) { const x = W * 0.70 * k / 40; const yy = y + Math.sin(k * 0.9 + t * 1.5 + wI) * 1.5; k ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let k = 0; k < 30; k++) { const x = W * 0.70 * ((k * 0.137 + wI * 0.05) % 1); ctx.fillRect(x, y - 1.5 - (k % 3), 1.4, 1); }
      ctx.restore();
    });
    // Swells rolling in, each with a curling white crest that spills as it nears the beach
    for (let wI = 0; wI < 3; wI++) {
      const u = ((t + wI * 1.9) % 5.7) / 5.7, y = H * (HORIZON + 0.035 + u * (SHORE - HORIZON - 0.045)), sc = 0.4 + u * 0.8;
      const a = Math.sin(u * PI) * 0.85;
      ctx.save(); ctx.beginPath(); ctx.rect(0, H * HORIZON, W * 0.70, H * (SHORE - HORIZON)); ctx.clip();
      ctx.fillStyle = `rgba(20,90,140,${(0.25 * a).toFixed(3)})`; ctx.fillRect(0, y + 1, W * 0.70, 2 * sc);              // the swell's shadow
      for (let k = 0; k < 7; k++) {
        const hk = Math.sin((k + 1) * (wI + 3) * 12.9898) * 0.5 + 0.5;
        if (hk < 0.25) continue;                          // some stretches of the swell don't break
        const cx = W * (0.03 + k * 0.10 + hk * 0.05) + Math.sin(t * 0.7 + k) * 3, len = W * (0.030 + 0.035 * hk) * sc;
        ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`; ctx.lineWidth = 1 + sc * 0.8; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx - len, y + 1); ctx.quadraticCurveTo(cx - len * 0.2, y - 2.5 * sc, cx + len * 0.35, y - 1.5 * sc);
        ctx.quadraticCurveTo(cx + len * 0.55, y - 0.5 * sc, cx + len * 0.40, y + 0.8 * sc); ctx.stroke();                         // the curl
        ctx.fillStyle = `rgba(255,255,255,${(a * 0.5).toFixed(3)})`; for (let d = 0; d < 4; d++) ctx.fillRect(cx - len * 0.6 + d * len * 0.3, y + 1.8 * sc, 1.2, 0.9);
      }
      ctx.restore();
    }
    // Waves breaking on the rocks: a gentle wash all the time, a big burst of spray on cue
    {
      const wash = 0.5 + 0.5 * Math.sin(t * 1.0);
      ctx.fillStyle = `rgba(255,255,255,${(0.35 + 0.35 * wash).toFixed(3)})`;
      for (let k = 0; k < 12; k++) { const x = W * (0.70 + k * 0.027), y = H * (0.548 + (k % 2) * 0.005) - wash * 2; ctx.beginPath(); ctx.ellipse(x, y, 5, 1.6, 0, 0, PI * 2); ctx.fill(); }
      SPRAY.forEach(range => {
        const f = win(m, range); if (f < 0) return;
        const cx = W * ROCKS[0], cy = H * ROCKS[1];
        for (let k = 0; k < 40; k++) {
          const ang = -PI / 2 + (k / 40 - 0.5) * 1.8, sp = 0.6 + 0.4 * Math.sin(k * 7.3), u = f * 1.6;
          const x = cx + Math.cos(ang) * u * W * 0.08 * sp + (k % 5 - 2) * 3, y = cy + Math.sin(ang) * u * H * 0.20 * sp + u * u * H * 0.11;
          const a = Math.max(0, 1 - f) * 0.9;
          ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, 1.2 + (k % 3) * 0.8 + f * 2, 0, PI * 2); ctx.fill();
        }
        ctx.fillStyle = `rgba(255,255,255,${(0.45 * Math.max(0, 1 - f * 1.4)).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(cx, cy - H * 0.01, W * 0.05 * (0.5 + f), H * 0.03 * (0.5 + f), 0, 0, PI * 2); ctx.fill();
      });
    }
    // A red pennant fluttering on the lighthouse, and a windsock on the headland
    { const lx = W * 0.875, ly = H * 0.256 - H * 0.150 - H * 0.044;
      ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly - H * 0.030); ctx.stroke();
      ctx.fillStyle = '#d83a3a'; ctx.beginPath(); ctx.moveTo(lx, ly - H * 0.030);
      for (let k = 1; k <= 6; k++) { const u = k / 6; ctx.lineTo(lx - u * W * 0.024, ly - H * 0.030 + u * H * 0.006 + Math.sin(t * 7 + u * 4) * 1.2 * u); }
      for (let k = 6; k >= 0; k--) { const u = k / 6; ctx.lineTo(lx - u * W * 0.024, ly - H * 0.030 + H * 0.012 * (1 - u * 0.5) + u * H * 0.006 + Math.sin(t * 7 + u * 4) * 1.2 * u); }
      ctx.closePath(); ctx.fill(); }
    { const wx = W * 0.975, wy = H * 0.262, swing = Math.sin(t * 0.8) * 0.15 + Math.sin(t * 2.3) * 0.05;
      ctx.strokeStyle = '#8a8a90'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx, wy - H * 0.050); ctx.stroke();
      ctx.save(); ctx.translate(wx, wy - H * 0.048); ctx.rotate(PI + swing);
      for (let k = 0; k < 5; k++) { const x0 = k * W * 0.006, r0 = H * (0.009 - k * 0.0012), r1 = H * (0.009 - (k + 1) * 0.0012), dy = Math.sin(t * 6 + k) * 0.6;
        ctx.fillStyle = k % 2 ? '#ffffff' : '#ff7a20'; ctx.beginPath(); ctx.moveTo(x0, -r0 + dy); ctx.lineTo(x0 + W * 0.006, -r1 + dy); ctx.lineTo(x0 + W * 0.006, r1 + dy); ctx.lineTo(x0, r0 + dy); ctx.closePath(); ctx.fill(); }
      ctx.restore(); }
    // A beach ball blown along the sand from right to left, bouncing
    {
      const f = win(m, BALL);
      if (f > 0) {
        const x = W * (1.05 - f * 1.15), base = H * 0.615, hop = Math.abs(Math.sin(f * PI * 5)) * H * 0.045 * (1 - f * 0.5), r = H * 0.022;
        const y = base - r - hop, rot = -f * 14;
        ctx.fillStyle = 'rgba(80,60,40,0.22)'; ctx.beginPath(); ctx.ellipse(x - 4, base, r * (1 - hop / (H * 0.1)), r * 0.25, 0, 0, PI * 2); ctx.fill();
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        ['#e84a4a', '#ffffff', '#f6c830', '#ffffff', '#2a8ad8', '#ffffff'].forEach((c, k) => { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, k * PI / 3, (k + 1) * PI / 3); ctx.closePath(); ctx.fill(); });
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, r * 0.18, 0, PI * 2); ctx.fill();
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(x + r * 0.35, y - r * 0.35, r * 0.30, 0, PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.arc(x, y, r, PI * 0.6, PI * 1.4); ctx.arc(x + r * 0.3, y, r * 0.9, PI * 1.4, PI * 0.6, true); ctx.fill();
      }
    }
  }

  // In front of everything: gulls, the kite tied to the sandcastle, bunting on the huts, the crab, the gull landing on the stumps
  function drawAmbientFront(ctx, W, H, t) {
    const m = t % SHOW;
    const gull = (x, y, s, flap, dir) => {
      ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
      ctx.strokeStyle = '#3a3a44'; ctx.lineWidth = Math.max(0.8, s * 0.12); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const wy = -flap * s * 0.55;
      ctx.beginPath(); ctx.moveTo(-s, wy); ctx.quadraticCurveTo(-s * 0.45, -s * 0.30 + wy * 0.3, 0, 0); ctx.quadraticCurveTo(s * 0.45, -s * 0.30 + wy * 0.3, s, wy); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(0, s * 0.05, s * 0.22, s * 0.10, 0, 0, PI * 2); ctx.fill();
      ctx.restore();
    };
    // Gulls wheeling high over the water (different cycle lengths)
    [[23.3, 0.0, 0.13, 7], [31.9, 9.0, 0.08, 5.5], [41.7, 20.0, 0.19, 6.5]].forEach(([period, off, fy, s], i) => {
      const u = ((t + off) % period) / period;
      const x = W * (-0.05 + u * 1.10), y = H * fy + Math.sin(u * PI * 6 + i) * H * 0.02;
      gull(x, y, s, Math.sin(t * (i ? 3 : 4) + i) * (Math.sin(t * 0.5 + i) > 0 ? 1 : 0.15), 1);
    });
    // The kite, tied to the sandcastle flagpole; it swoops on cue
    {
      const sw = win(m, KITE_SWOOP), swoop = sw > 0 ? Math.sin(sw * PI) : 0;
      const kx = W * 0.175 + Math.sin(t * 0.6) * W * 0.012 - swoop * Math.sin(sw * PI * 2) * W * 0.05;
      const ky = H * 0.115 + Math.sin(t * 0.9) * H * 0.012 + swoop * H * 0.09;
      const tilt = 0.3 + Math.sin(t * 0.8) * 0.18 + (sw > 0 ? Math.sin(sw * PI) * Math.sin(sw * PI * 2) * 1.4 : 0);
      const ax = W * CASTLE[0], ay = H * CASTLE[1] - W * 0.056 * 1.75;
      ctx.strokeStyle = 'rgba(60,60,70,0.55)'; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.quadraticCurveTo(W * 0.27, H * 0.40, kx, ky + 8); ctx.stroke();
      ctx.fillStyle = '#e8336a'; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + 5 + Math.sin(t * 6) * 1, ay + 1.5); ctx.lineTo(ax, ay + 3.5); ctx.closePath(); ctx.fill();   // castle flag
      ctx.save(); ctx.translate(kx, ky); ctx.rotate(tilt);
      ctx.fillStyle = '#2a8ad8'; ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(8, -2); ctx.lineTo(0, 11); ctx.lineTo(-8, -2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f6c830'; ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(8, -2); ctx.lineTo(0, -2); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(0, 11); ctx.lineTo(-8, -2); ctx.lineTo(0, -2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(40,40,60,0.6)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(0, 11); ctx.moveTo(-8, -2); ctx.lineTo(8, -2); ctx.stroke();
      ctx.strokeStyle = '#e8336a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 11);   // tail
      for (let k = 1; k <= 8; k++) ctx.lineTo(Math.sin(t * 5 + k * 0.9) * 3, 11 + k * 3.2); ctx.stroke();
      ctx.restore();
    }
    // Bunting strung along the hut roofs
    {
      const x0 = W * 0.005, y0 = H * 0.520, x1 = W * 0.245, y1 = H * 0.530;
      ctx.strokeStyle = 'rgba(80,70,60,0.7)'; ctx.lineWidth = 0.6;
      const pt = (u) => [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + H * 0.010 * Math.sin(u * PI)];
      ctx.beginPath(); for (let k = 0; k <= 20; k++) { const [x, y] = pt(k / 20); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      const cols = ['#e84a5a', '#f6c830', '#2a8ad8', '#ffffff', '#5ac88a'];
      for (let k = 0; k < 12; k++) { const u = (k + 0.5) / 12, [x, y] = pt(u), fl = Math.sin(t * 4 + k) * 1.2;
        ctx.fillStyle = cols[k % cols.length]; ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x + 3, y); ctx.lineTo(x + fl, y + 6); ctx.closePath(); ctx.fill(); }
    }
    // A crab scuttling sideways across the sand, pausing to wave a claw, then hurrying back
    {
      const f = win(m, CRAB);
      if (f > 0) {
        const path = f < 0.4 ? f / 0.4 : f < 0.6 ? 1 : 1 - (f - 0.6) / 0.4;
        const x = W * (0.80 - path * 0.13), y = H * 0.692, s = H * 0.013, walk = f < 0.4 || f > 0.6;
        const leg = walk ? Math.sin(t * 30) : 0, wave = !walk ? Math.sin(t * 10) : 0;
        ctx.fillStyle = 'rgba(80,60,40,0.25)'; ctx.beginPath(); ctx.ellipse(x - 2, y + s * 0.8, s * 1.4, s * 0.3, 0, 0, PI * 2); ctx.fill();
        ctx.strokeStyle = '#c83a2a'; ctx.lineWidth = 1; ctx.lineCap = 'round';
        for (let k = 0; k < 3; k++) { const dx = s * (0.5 + k * 0.3); [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(x + sd * s * 0.5, y); ctx.lineTo(x + sd * (dx + s * 0.3), y + s * 0.3 + (k % 2 ? leg : -leg) * 1.2); ctx.lineTo(x + sd * (dx + s * 0.4), y + s * 0.8); ctx.stroke(); }); }
        ctx.fillStyle = '#e84a2a'; ctx.beginPath(); ctx.ellipse(x, y, s, s * 0.62, 0, 0, PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,200,170,0.5)'; ctx.beginPath(); ctx.ellipse(x + s * 0.3, y - s * 0.25, s * 0.35, s * 0.18, 0, 0, PI * 2); ctx.fill();
        [-1, 1].forEach(sd => { const up = sd > 0 ? wave * s * 0.6 : 0; ctx.strokeStyle = '#c83a2a'; ctx.beginPath(); ctx.moveTo(x + sd * s * 0.7, y - s * 0.2); ctx.lineTo(x + sd * s * 1.3, y - s * 0.9 - up); ctx.stroke();
          ctx.fillStyle = '#e84a2a'; ctx.beginPath(); ctx.ellipse(x + sd * s * 1.4, y - s * 1.1 - up, s * 0.38, s * 0.26, sd * 0.6, 0, PI * 2); ctx.fill(); });
        ctx.fillStyle = '#1a1a1a'; [-0.25, 0.25].forEach(dx => { ctx.fillRect(x + dx * s - 0.3, y - s * 0.95, 0.6, s * 0.4); ctx.beginPath(); ctx.arc(x + dx * s, y - s * 0.95, 0.9, 0, PI * 2); ctx.fill(); });
      }
    }
    // A gull glides in, lands on the stumps, looks about, then takes off again
    {
      const f = win(m, GULL);
      if (f > 0) {
        const sx = W * STUMPS[0], sy = H * STUMPS[1] - H * 0.158;
        const T = f * (GULL[1] - GULL[0]);
        let x, y, flap, sitting = false, dir = -1;
        if (T < 1.4) { const u = T / 1.4, e = 1 - (1 - u) * (1 - u); x = sx + (1 - e) * W * 0.30; y = sy - (1 - e) * H * 0.22; flap = u > 0.75 ? Math.sin(T * 20) : 0.1; }
        else if (T < 3.8) { x = sx; y = sy; sitting = true; }
        else { const u = (T - 3.8) / 1.2; x = sx - u * W * 0.35; y = sy - u * u * H * 0.30 - u * H * 0.05; flap = Math.sin(T * 18); }
        if (sitting) {
          const look = Math.sin(T * 2.2) > 0.3 ? 1 : -1;
          ctx.save(); ctx.translate(x, y); ctx.scale(1.35, 1.35);
          ctx.fillStyle = '#f2f2f4'; ctx.beginPath(); ctx.ellipse(0, -6, 6.5, 4.2, -0.1, 0, PI * 2); ctx.fill();           // body
          ctx.fillStyle = '#8a92a0'; ctx.beginPath(); ctx.ellipse(1.5, -6.6, 5.2, 2.6, -0.15, 0, PI * 2); ctx.fill();       // grey wing
          ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.moveTo(5.5, -6.5); ctx.lineTo(9.5, -5.5); ctx.lineTo(5.5, -4.8); ctx.closePath(); ctx.fill();   // black tail tips
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-4.8 * look, -11, 2.8, 0, PI * 2); ctx.fill();                // head
          ctx.fillStyle = '#f2c020'; ctx.beginPath(); ctx.moveTo(-7.2 * look, -11.2); ctx.lineTo(-10.8 * look, -10.6); ctx.lineTo(-7.2 * look, -10.0); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-5.8 * look - 0.5, -11.8, 1.1, 1.1);
          ctx.strokeStyle = '#e8a060'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-1, -2); ctx.lineTo(-1, 0); ctx.moveTo(1.5, -2); ctx.lineTo(1.5, 0); ctx.stroke();
          ctx.restore();
        } else gull(x, y, 9, flap, dir);
      }
    }
  }

  // ════════ PAINT — back → sky ambient → mid → shore ambient → props → cup → front ambient → haze ════════
  // (canvas passed in)
  const ctx = cvs.getContext('2d');
  const SCRATCH = document.createElement('canvas').getContext('2d');
  const mk = () => { const c = document.createElement('canvas'); c.width = 620; c.height = 355; return c; };
  const back = mk(), mid = mk(), front = mk();
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function paintBase() {
    [[back, 'back'], [mid, 'mid'], [front, 'front']].forEach(([c, part]) => { const g = c.getContext('2d'); g.clearRect(0, 0, 620, 355); draw(g, 620, 355, part); });
  }
  function frame(ms) {
    const t = reduceMotion ? 0 : ms / 1000;
    ctx.clearRect(0, 0, 620, 355);
    ctx.drawImage(back, 0, 0);
    drawAmbientSky(ctx, 620, 355, t);
    ctx.drawImage(mid, 0, 0);
    drawAmbientShore(ctx, 620, 355, t);
    ctx.drawImage(front, 0, 0);
    drawTrophy(ctx, 620, 355, (t / TURN_SECONDS) * PI * 2, t);
    drawAmbientFront(ctx, 620, 355, t);
    drawAtmos(ctx, 620, 355);
  }
  function loop(ms) { if (!__running) return; __elapsed = ms - __t0; __frame(__elapsed); requestAnimationFrame(loop); }
  paintBase(); __frame(0);
  let repainted = false;
  const repaint = () => { if (!repainted) { repainted = true; paintBase(); __frame(__elapsed); } };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(repaint).catch(() => {});
  setTimeout(repaint, 2000);
  return {
    start() { if (__running) return; if (reduceMotion) { __frame(0); return; } __running = true; __t0 = performance.now() - __elapsed; requestAnimationFrame(loop); },
    stop() { __running = false; },
  };
}
function makeLeagueArt_fairground(cvs) {
  let __running = false, __t0 = 0, __elapsed = 0;
  // Soft fade at the foot of the art so it melts into the card's info panel
  function __fade() {
    const g = ctx.createLinearGradient(0, 355 * 0.78, 0, 355);
    g.addColorStop(0, 'rgba(8,8,18,0)'); g.addColorStop(1, 'rgba(8,8,18,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 355 * 0.78, 620, 355 * 0.22);
  }
  function __frame(ms) { frame(ms); __fade(); }
  const PI = Math.PI;
  const SHOW = 22;                                   // shared schedule for the "moments", seconds
  const TURN_SECONDS = 11.3;                         // one full turn of the cup
  // Moments on the shared schedule (seconds into SHOW), spread so something is always just starting:
  // coconut knocked off 2.0–5.0 · high striker rings the bell 6.0–8.0 · a balloon floats away 8.6–16.0 ·
  // firework shows 3.0–8.4 and 12.4–17.8 · the wheel's lights flash together 15.0–16.6 · bell again 17.2–19.2
  const COCONUT = [2.0, 5.0], DINGS = [[6.0, 8.0], [17.2, 19.2]], BALLOON = [8.6, 16.0], FW_SHOWS = [[3.0, 8.4], [12.4, 17.8]], WHEEL_FLASH = [15.0, 16.6];
  const BALLOONS = [0.262, 0.700];
  const SLING = [[1.0, 7.0], [11.6, 17.6]];          // slingshot launches                 // balloon stand (x, base)
  const CART = [0.805, 0.712];                     // popcorn cart (x, base)
  const FONT = (wt, px) => `${wt} ${px}px 'Barlow Condensed', 'Arial Narrow', sans-serif`;
  const win = (m, [a, b]) => { const f = (m - a) / (b - a); return f > 0 && f < 1 ? f : -1; };
  const BULB = ['#ffe080', '#ff6a8a', '#7ae0ff', '#a8ff8a', '#ffb050'];

  // Layout shared by the still scene and the animation
  const GROUND = 0.525;
  const WHEEL = [0.800, 0.285, 0.190];               // Ferris wheel centre x, y, radius (in H)
  const SHY = { x0: -0.01, x1: 0.225, base: 0.715 }; // coconut shy
  const STRIKER = [0.895, 0.715, 0.275];             // high striker x, base, top
  const STUMPS = [0.700, 0.705];

  // ════════ STILL SCENE — a fairground at twilight, lights just coming on ════════
  // part: 'back' (sky, trees, big top), 'mid' (stalls, ground), 'front' (coconut shy, high striker, stumps)
  function draw(ctxReal, W, H, part) {
    let ctx;
    const use = (layer) => { ctx = layer === part ? ctxReal : SCRATCH; };
    let seed = 41;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const glow = (x, y, r, col) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    };
    const bulbRow = (pts, r) => pts.forEach(([x, y], k) => { ctx.fillStyle = BULB[k % BULB.length]; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); glow(x, y, r * 4, 'rgba(255,220,150,0.25)'); });

    use('back');
    // ── Twilight sky: violet overhead, rose and peach at the horizon ──
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.50);
    sky.addColorStop(0, '#24184e'); sky.addColorStop(0.40, '#5a2c7a'); sky.addColorStop(0.72, '#c4508a'); sky.addColorStop(1, '#ffa884');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.56);
    for (let i = 0; i < 50; i++) { const x = rnd() * W, y = rnd() * H * 0.20, a = 0.25 + rnd() * 0.5; ctx.fillStyle = `rgba(255,240,255,${a.toFixed(2)})`; ctx.fillRect(x, y, 1, 1); }
    glow(W * 0.60, H * 0.12, W * 0.025, 'rgba(255,250,230,0.7)'); ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.arc(W * 0.60, H * 0.12, 1.6, 0, PI * 2); ctx.fill();   // the evening star
    // Soft streaks of lit cloud low down
    [[0.15, 0.38, 0.20], [0.55, 0.41, 0.25], [0.88, 0.36, 0.16]].forEach(([fx, fy, fw]) => {
      const g = ctx.createLinearGradient(W * (fx - fw), 0, W * (fx + fw), 0);
      g.addColorStop(0, 'rgba(255,170,150,0)'); g.addColorStop(0.5, 'rgba(255,170,150,0.35)'); g.addColorStop(1, 'rgba(255,170,150,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(W * fx, H * fy, W * fw, H * 0.008, 0, 0, PI * 2); ctx.fill();
    });
    // Tree line along the horizon
    ctx.fillStyle = '#3a2048';
    ctx.fillRect(0, H * 0.475, W, H * 0.06);
    for (let x = -4; x <= W + 8; x += 7 + rnd() * 6) { const r = H * (0.014 + rnd() * 0.016); ctx.beginPath(); ctx.arc(x, H * 0.478 - r * 0.4, r, 0, PI * 2); ctx.fill(); }   // rounded treetops
    ctx.fillStyle = 'rgba(255,150,140,0.10)'; ctx.fillRect(0, H * 0.455, W, H * 0.02);

    use('mid');
    // ── Ground: trodden grass, a straw-strewn walkway, warm pools of light ──
    {
      const top = H * GROUND;
      const gg = ctx.createLinearGradient(0, top, 0, H);
      gg.addColorStop(0, '#4a4a5e'); gg.addColorStop(0.15, '#3a5244'); gg.addColorStop(1, '#22362a');
      ctx.fillStyle = gg; ctx.fillRect(0, top, W, H - top);
      // Straw-strewn walkway with soft edges
      { const wg = ctx.createLinearGradient(W * 0.25, 0, W * 0.75, 0);
        wg.addColorStop(0, 'rgba(220,180,110,0)'); wg.addColorStop(0.25, 'rgba(220,180,110,0.30)'); wg.addColorStop(0.75, 'rgba(220,180,110,0.30)'); wg.addColorStop(1, 'rgba(220,180,110,0)');
        ctx.fillStyle = wg; ctx.beginPath(); ctx.moveTo(W * 0.40, top); ctx.lineTo(W * 0.60, top); ctx.lineTo(W * 0.85, H); ctx.lineTo(W * 0.15, H); ctx.closePath(); ctx.fill(); }
      // Tufts of grass
      for (let i = 0; i < 120; i++) { const x = rnd() * W, y = top + H * 0.01 + rnd() * (H - top); ctx.strokeStyle = `rgba(${rnd() < 0.5 ? '110,160,110' : '70,110,80'},0.55)`; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 1, y - 2.5); ctx.moveTo(x + 1, y); ctx.lineTo(x + 2, y - 2.2); ctx.stroke(); }
      for (let i = 0; i < 160; i++) { const y = top + rnd() * (H - top), x = rnd() * W; ctx.fillStyle = rnd() < 0.5 ? 'rgba(230,200,130,0.30)' : 'rgba(120,150,120,0.25)'; ctx.fillRect(x, y, 2 + rnd() * 3, 0.7); }
      [[0.180, 0.56, 0.12], [0.30, 0.60, 0.07], [0.634, 0.60, 0.07], [0.80, 0.58, 0.10]].forEach(([fx, fy, fw]) => {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const pg = ctx.createRadialGradient(W * fx, H * fy, 0, W * fx, H * fy, W * fw);
        pg.addColorStop(0, 'rgba(255,190,120,0.30)'); pg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.translate(0, H * fy); ctx.scale(1, 0.30); ctx.translate(0, -H * fy); ctx.fillStyle = pg; ctx.fillRect(W * (fx - fw), H * fy - W * fw, W * fw * 2, W * fw * 2); ctx.restore();
      });
    }
    // ── The big top on the left: red-and-white stripes, a lit entrance, bulbs along the eaves ──
    {
      const cx = W * 0.180, base = H * 0.530, wallTop = H * 0.430, peak = H * 0.215, hw = W * 0.140, ew = W * 0.128;
      // Walls
      for (let k = 0; k < 14; k++) { const x0 = cx - hw + 2 * hw * k / 14; ctx.fillStyle = k % 2 ? '#f6ece6' : '#d8323e'; ctx.fillRect(x0, wallTop, 2 * hw / 14 + 0.5, base - wallTop); }
      ctx.fillStyle = 'rgba(40,10,40,0.35)'; ctx.fillRect(cx - hw, wallTop, hw * 0.5, base - wallTop);
      // Roof: curved cone of stripes
      for (let k = 0; k < 16; k++) {
        const u0 = k / 16, u1 = (k + 1) / 16, x0 = cx - ew + 2 * ew * u0, x1 = cx - ew + 2 * ew * u1;
        ctx.fillStyle = k % 2 ? '#f6ece6' : '#d8323e';
        ctx.beginPath(); ctx.moveTo(x0, wallTop); ctx.quadraticCurveTo((x0 + cx) / 2, (wallTop + peak) / 2 + H * 0.03, cx, peak); ctx.quadraticCurveTo((x1 + cx) / 2, (wallTop + peak) / 2 + H * 0.03, x1, wallTop); ctx.closePath(); ctx.fill();
      }
      const rs = ctx.createLinearGradient(cx - ew, 0, cx + ew, 0);
      rs.addColorStop(0, 'rgba(40,10,50,0.45)'); rs.addColorStop(0.55, 'rgba(255,220,200,0.05)'); rs.addColorStop(1, 'rgba(40,10,50,0.25)');
      ctx.fillStyle = rs; ctx.beginPath(); ctx.moveTo(cx - ew, wallTop); ctx.quadraticCurveTo(cx - ew * 0.5, (wallTop + peak) / 2 + H * 0.03, cx, peak); ctx.quadraticCurveTo(cx + ew * 0.5, (wallTop + peak) / 2 + H * 0.03, cx + ew, wallTop); ctx.closePath(); ctx.fill();
      // Scalloped valance along the eaves
      for (let k = 0; k < 18; k++) { const x = cx - ew + 2 * ew * (k + 0.5) / 18; ctx.fillStyle = k % 2 ? '#f0c040' : '#2a5ab0'; ctx.beginPath(); ctx.arc(x, wallTop, ew / 18, 0, PI); ctx.fill(); }
      bulbRow(Array.from({ length: 15 }, (_, k) => [cx - ew + 2 * ew * (k + 0.5) / 15, wallTop + 1]), 1.3);
      // Lit entrance with the flaps tied back
      const ex = cx + hw * 0.05, ew2 = W * 0.040;
      const eg = ctx.createLinearGradient(0, base - H * 0.070, 0, base); eg.addColorStop(0, '#ffe2a0'); eg.addColorStop(1, '#ff9a50');
      ctx.fillStyle = eg; ctx.beginPath(); ctx.moveTo(ex - ew2, base); ctx.lineTo(ex - ew2 * 0.35, base - H * 0.075); ctx.lineTo(ex + ew2 * 0.35, base - H * 0.075); ctx.lineTo(ex + ew2, base); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#a81e2a'; ctx.beginPath(); ctx.moveTo(ex - ew2, base); ctx.lineTo(ex - ew2 * 0.35, base - H * 0.075); ctx.lineTo(ex - ew2 * 1.2, base); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(ex + ew2, base); ctx.lineTo(ex + ew2 * 0.35, base - H * 0.075); ctx.lineTo(ex + ew2 * 1.2, base); ctx.closePath(); ctx.fill();
      glow(ex, base - H * 0.03, W * 0.07, 'rgba(255,190,110,0.35)');
      // Peak pole (its flag flutters in the animation)
      ctx.strokeStyle = '#d8c8a8'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx, peak); ctx.lineTo(cx, peak - H * 0.040); ctx.stroke();
      // Pennant bunting from the peak down to the ground either side
      [[-1, -0.02, 0.50], [1, 0.33, 0.52]].forEach(([sd, ex, ey]) => {
        const x0 = cx, y0 = peak - H * 0.010, x1 = W * ex, y1 = H * ey, n = 13;
        ctx.strokeStyle = 'rgba(240,220,220,0.55)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + H * 0.03, x1, y1); ctx.stroke();
        for (let k = 1; k < n; k++) { const u = k / n, x = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * (x0 + x1) / 2 + u * u * x1, y = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * ((y0 + y1) / 2 + H * 0.03) + u * u * y1;
          ctx.fillStyle = BULB[k % BULB.length]; ctx.beginPath(); ctx.moveTo(x - 2.2, y); ctx.lineTo(x + 2.2, y); ctx.lineTo(x, y + 4.5); ctx.closePath(); ctx.fill(); }
      });
      // Guy ropes
      ctx.strokeStyle = 'rgba(220,200,180,0.35)'; ctx.lineWidth = 0.6;
      [[-1.15, 0.12], [1.15, 0.12], [-1.05, 0.30], [1.05, 0.30]].forEach(([dx, f]) => { ctx.beginPath(); ctx.moveTo(cx + ew * dx * 0.88, wallTop + (base - wallTop) * f); ctx.lineTo(cx + ew * dx * 1.05, base + 2); ctx.stroke(); });
    }

    // ── Two little stalls in the middle distance ──
    const stall = (x0, x1, base, label, canopy, goods) => {
      const w = x1 - x0, h = H * 0.070;
      ctx.fillStyle = '#2a1a2a'; ctx.fillRect(x0, base - h, w, h);
      const lg = ctx.createLinearGradient(0, base - h, 0, base); lg.addColorStop(0, '#ffe2a8'); lg.addColorStop(1, '#ffa860');
      ctx.fillStyle = lg; ctx.fillRect(x0 + 2, base - h + H * 0.022, w - 4, h - H * 0.040);
      goods(x0 + 2, base - h + H * 0.022, w - 4, h - H * 0.040);
      ctx.fillStyle = '#5a2a3a'; ctx.fillRect(x0 - 1, base - H * 0.018, w + 2, H * 0.018);          // counter
      for (let k = 0; k < 8; k++) { ctx.fillStyle = k % 2 ? '#ffffff' : canopy; ctx.beginPath(); ctx.moveTo(x0 - 2 + (w + 4) * k / 8, base - h); ctx.lineTo(x0 - 2 + (w + 4) * (k + 1) / 8, base - h); ctx.lineTo(x0 - 2 + (w + 4) * (k + 0.5) / 8, base - h + H * 0.016); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = canopy; ctx.fillRect(x0 - 3, base - h - H * 0.022, w + 6, H * 0.022);
      ctx.fillStyle = '#ffffff'; ctx.font = FONT(800, H * 0.016); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, (x0 + x1) / 2, base - h - H * 0.011, w);
      glow((x0 + x1) / 2, base - h * 0.5, w * 0.8, 'rgba(255,190,110,0.22)');
    };
    stall(W * 0.255, W * 0.365, H * 0.600, 'HOOK-A-DUCK', '#2a8ad8', (x, y, w, h) => { for (let k = 0; k < 6; k++) { ctx.fillStyle = '#ffd030'; ctx.beginPath(); ctx.arc(x + 5 + k * (w - 10) / 5, y + h * 0.75, 2.2, 0, PI * 2); ctx.fill(); ctx.fillStyle = '#ff7a20'; ctx.fillRect(x + 6.5 + k * (w - 10) / 5, y + h * 0.70, 1.6, 1); } });
    // Dodgems: a low striped roof on poles, the cars hidden behind the stalls (sparks crackle in the animation)
    { const x0 = W * 0.705, x1 = W * 0.835, roof = H * 0.505;
      ctx.fillStyle = '#2a1a3a'; ctx.fillRect(x0, roof, x1 - x0, H * 0.055);
      ctx.fillStyle = 'rgba(120,200,255,0.35)'; ctx.fillRect(x0 + 2, roof + H * 0.012, x1 - x0 - 4, H * 0.040);
      for (let k = 0; k < 9; k++) { ctx.fillStyle = k % 2 ? '#ffd030' : '#2a5ab0'; ctx.fillRect(x0 - 2 + (x1 - x0 + 4) * k / 9, roof - H * 0.016, (x1 - x0 + 4) / 9 + 0.5, H * 0.016); }
      ctx.fillStyle = '#e83a4a'; ctx.fillRect(x0 + (x1 - x0) * 0.30, roof - H * 0.034, (x1 - x0) * 0.40, H * 0.018);
      ctx.fillStyle = '#ffffff'; ctx.font = FONT(900, H * 0.014); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('DODGEMS', (x0 + x1) / 2, roof - H * 0.025, (x1 - x0) * 0.38);
      ctx.strokeStyle = 'rgba(180,180,200,0.6)'; ctx.lineWidth = 0.4; for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.moveTo(x0 + (x1 - x0) * k / 6, roof + 1); ctx.lineTo(x0 + (x1 - x0) * k / 6, roof + H * 0.012); ctx.stroke(); }
      glow((x0 + x1) / 2, roof + H * 0.03, W * 0.07, 'rgba(120,190,255,0.20)'); }
    stall(W * 0.588, W * 0.680, H * 0.600, 'CANDY FLOSS', '#e8508a', (x, y, w, h) => { for (let k = 0; k < 5; k++) { ctx.fillStyle = k % 2 ? '#ffb8e0' : '#a8e0ff'; ctx.beginPath(); ctx.arc(x + 6 + k * (w - 12) / 4, y + h * 0.40, 3.5, 0, PI * 2); ctx.fill(); ctx.fillStyle = '#f2f2f2'; ctx.fillRect(x + 5.5 + k * (w - 12) / 4, y + h * 0.40, 1, h * 0.5); } });

    use('front');
    // ════════ FRONT LAYER — coconut shy, high striker, candy-striped stumps ════════
    // Coconut shy on the left (the second coconut is drawn in the animation so it can be knocked off)
    {
      const x0 = W * SHY.x0, x1 = W * SHY.x1, base = H * SHY.base, top = H * 0.495;
      ctx.fillStyle = 'rgba(10,5,20,0.45)'; ctx.beginPath(); ctx.ellipse((x0 + x1) / 2, base + 2, (x1 - x0) * 0.55, H * 0.012, 0, 0, PI * 2); ctx.fill();
      // Back curtain, lit from above
      const cg = ctx.createLinearGradient(0, top, 0, base); cg.addColorStop(0, '#8a1a2a'); cg.addColorStop(1, '#3a0a18');
      ctx.fillStyle = cg; ctx.fillRect(x0, top + H * 0.03, x1 - x0, base - top - H * 0.03);
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let k = 0; k < 12; k++) ctx.fillRect(x0 + (x1 - x0) * k / 12, top + H * 0.03, 1.5, base - top);
      // Posts with cups; coconuts on all but the second
      const posts = [0.16, 0.38, 0.60, 0.82];
      posts.forEach((f, i) => {
        const px = x0 + (x1 - x0) * f, py = H * 0.615;
        ctx.fillStyle = '#d8c8a8'; ctx.fillRect(px - 1.2, py, 2.4, H * 0.665 - py);
        ctx.fillStyle = '#c8a848'; ctx.beginPath(); ctx.moveTo(px - 4, py); ctx.lineTo(px + 4, py); ctx.lineTo(px + 2.5, py + 4); ctx.lineTo(px - 2.5, py + 4); ctx.closePath(); ctx.fill();
        if (i !== 1) {
          const r = H * 0.017;
          const ng = ctx.createRadialGradient(px - r * 0.3, py - r - r * 0.3, 0, px, py - r, r); ng.addColorStop(0, '#9a6a3a'); ng.addColorStop(1, '#4a2a12');
          ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(px, py - r + 1, r, 0, PI * 2); ctx.fill();
          ctx.strokeStyle = 'rgba(200,160,110,0.45)'; ctx.lineWidth = 0.5; for (let k = 0; k < 6; k++) { const a = rnd() * PI * 2; ctx.beginPath(); ctx.moveTo(px + Math.cos(a) * r * 0.5, py - r + 1 + Math.sin(a) * r * 0.5); ctx.lineTo(px + Math.cos(a) * r * 1.05, py - r + 1 + Math.sin(a) * r * 1.05); ctx.stroke(); }
        }
      });
      // Counter with a bucket of balls
      ctx.fillStyle = '#e8b830'; ctx.fillRect(x0, H * 0.662, x1 - x0, H * 0.016);
      ctx.fillStyle = '#c8303a'; ctx.fillRect(x0, H * 0.678, x1 - x0, base - H * 0.678);
      for (let k = 0; k < 6; k++) { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(x0 + (x1 - x0) * (k + 0.5) / 6, H * 0.697, 2.2, 0, PI * 2); ctx.fill(); }
      { const bx = x0 + (x1 - x0) * 0.86, by = H * 0.662; ctx.fillStyle = '#8a8a96'; ctx.beginPath(); ctx.moveTo(bx - 7, by); ctx.lineTo(bx - 5.5, by - 10); ctx.lineTo(bx + 5.5, by - 10); ctx.lineTo(bx + 7, by); ctx.closePath(); ctx.fill();
        ['#c82a2a', '#f2f2f2', '#c82a2a'].forEach((c, k) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(bx - 3.5 + k * 3.5, by - 11, 2.4, 0, PI * 2); ctx.fill(); }); }
      // Posts and the striped awning with its sign
      ctx.fillStyle = '#e8e0d0'; ctx.fillRect(x0 + 2, top, 3, base - top); ctx.fillRect(x1 - 5, top, 3, base - top);
      for (let k = 0; k < 10; k++) { ctx.fillStyle = k % 2 ? '#ffe040' : '#e83a3a'; ctx.beginPath(); ctx.moveTo(x0 - 3 + (x1 - x0 + 6) * k / 10, top + H * 0.030); ctx.lineTo(x0 - 3 + (x1 - x0 + 6) * (k + 1) / 10, top + H * 0.030); ctx.lineTo(x0 - 3 + (x1 - x0 + 6) * (k + 0.5) / 10, top + H * 0.052); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#1a2a6a'; ctx.fillRect(x0 - 3, top, x1 - x0 + 6, H * 0.032);
      ctx.fillStyle = '#ffe040'; ctx.font = FONT(900, H * 0.024); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('COCONUT SHY', (x0 + x1) / 2 + W * 0.01, top + H * 0.017, (x1 - x0) * 0.8);
      ctx.fillStyle = '#ffffff'; ctx.font = FONT(800, H * 0.014); ctx.fillText('3 BALLS £1', (x0 + x1) / 2 + W * 0.01, H * 0.6705, (x1 - x0) * 0.5);
    }
    // High striker on the right (the puck and bell are animated)
    {
      const x = W * STRIKER[0], base = H * STRIKER[1], top = H * STRIKER[2], pw = W * 0.020;
      ctx.fillStyle = 'rgba(10,5,20,0.45)'; ctx.beginPath(); ctx.ellipse(x, base + 2, W * 0.05, H * 0.010, 0, 0, PI * 2); ctx.fill();
      const bg = ctx.createLinearGradient(x - pw / 2, 0, x + pw / 2, 0); bg.addColorStop(0, '#8a1a2a'); bg.addColorStop(0.5, '#e83a4a'); bg.addColorStop(1, '#8a1a2a');
      ctx.fillStyle = bg; ctx.fillRect(x - pw / 2, top, pw, base - top - H * 0.02);
      ctx.fillStyle = '#2a1a1a'; ctx.fillRect(x - 1.2, top + 6, 2.4, base - top - H * 0.03);            // the puck's track
      ctx.fillStyle = '#ffe040'; ctx.font = FONT(900, H * 0.012); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ['HERO', 'STRONG', 'GOOD', 'WEAK'].forEach((s, k) => { const y = top + (base - top) * (0.15 + k * 0.20); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x - pw / 2, y - 3.5, pw, 7); ctx.fillStyle = '#ffe040'; ctx.fillText(s, x, y + 0.3, pw * 0.95); });
      for (let k = 0; k < 14; k++) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(x - pw / 2, top + 6 + k * (base - top - H * 0.03) / 14, 3, 0.8); }
      // Bell bracket and base with the target pad; a mallet leaning on it
      ctx.fillStyle = '#c8a040'; ctx.fillRect(x - pw * 0.7, top - 3, pw * 1.4, 3);
      ctx.fillStyle = '#2a1a2a'; ctx.fillRect(x - W * 0.030, base - H * 0.022, W * 0.060, H * 0.022);
      ctx.fillStyle = '#e8e0d0'; ctx.beginPath(); ctx.ellipse(x - W * 0.016, base - H * 0.022, W * 0.010, 2, 0, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = '#a8784a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + W * 0.034, base); ctx.lineTo(x + W * 0.020, base - H * 0.085); ctx.stroke();
      ctx.fillStyle = '#6a4a2a'; ctx.fillRect(x + W * 0.010, base - H * 0.095, W * 0.022, H * 0.016);
      // Sign
      ctx.fillStyle = '#1a2a6a'; ctx.fillRect(x - W * 0.050, base - H * 0.070, W * 0.034, H * 0.040);
      ctx.fillStyle = '#ffe040'; ctx.font = FONT(900, H * 0.012); ctx.fillText('TEST YOUR', x - W * 0.033, base - H * 0.058, W * 0.03); ctx.fillText('STRENGTH', x - W * 0.033, base - H * 0.042, W * 0.03);
    }
    // Balloon stand (the balloons bob in the animation): a striped pole in a weighted base
    { const x = W * BALLOONS[0], base = H * BALLOONS[1];
      ctx.fillStyle = 'rgba(10,5,20,0.45)'; ctx.beginPath(); ctx.ellipse(x, base + 2, W * 0.022, H * 0.008, 0, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#2a5ab0'; ctx.beginPath(); ctx.ellipse(x, base - 2, W * 0.016, H * 0.010, 0, 0, PI * 2); ctx.fill(); ctx.fillRect(x - W * 0.016, base - H * 0.022, W * 0.032, H * 0.018);
      ctx.fillStyle = '#f2f2f2'; ctx.fillRect(x - 1.3, H * 0.520, 2.6, base - H * 0.540);
      ctx.fillStyle = '#e02a3a'; for (let y = H * 0.525; y < base - H * 0.025; y += 6) ctx.fillRect(x - 1.3, y, 2.6, 2.5); }
    // Popcorn cart on the right: striped canopy, glass box of popcorn, big wheels
    { const x = W * CART[0], base = H * CART[1], w = W * 0.075, h = H * 0.060;
      ctx.fillStyle = 'rgba(10,5,20,0.45)'; ctx.beginPath(); ctx.ellipse(x, base + 2, w * 0.7, H * 0.010, 0, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#c8202e'; ctx.fillRect(x - w / 2, base - h * 0.75, w, h * 0.55);
      ctx.fillStyle = '#ffe080'; ctx.font = FONT(900, H * 0.018); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('POPCORN', x, base - h * 0.47, w * 0.9);
      const gx0 = x - w * 0.42, gw = w * 0.84, gy0 = base - h * 1.55, gh = h * 0.80;     // glass box
      ctx.fillStyle = 'rgba(255,240,200,0.25)'; ctx.fillRect(gx0, gy0, gw, gh);
      const pg = ctx.createLinearGradient(0, gy0 + gh * 0.4, 0, gy0 + gh); pg.addColorStop(0, '#fff6d8'); pg.addColorStop(1, '#f2d888');
      ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(gx0, gy0 + gh); for (let k = 0; k <= 12; k++) ctx.lineTo(gx0 + gw * k / 12, gy0 + gh * (0.45 + 0.08 * Math.sin(k * 2.1))); ctx.lineTo(gx0 + gw, gy0 + gh); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#d8b040'; ctx.lineWidth = 1.2; ctx.strokeRect(gx0, gy0, gw, gh);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(gx0 + 2, gy0 + 2, 1.5, gh - 4);
      for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#ffffff' : '#e02a3a'; ctx.beginPath(); ctx.moveTo(x - w * 0.55 + w * 1.1 * k / 6, gy0 - 2); ctx.lineTo(x - w * 0.55 + w * 1.1 * (k + 1) / 6, gy0 - 2); ctx.lineTo(x + (k < 3 ? -w * 0.05 : w * 0.05), gy0 - H * 0.032); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle = '#f0c040'; ctx.beginPath(); ctx.arc(x, gy0 - H * 0.034, 2.2, 0, PI * 2); ctx.fill();
      [-0.32, 0.32].forEach(o => { ctx.fillStyle = '#1a1a24'; ctx.beginPath(); ctx.arc(x + w * o, base - H * 0.014, H * 0.016, 0, PI * 2); ctx.fill(); ctx.strokeStyle = '#f0c040'; ctx.lineWidth = 0.8; for (let k = 0; k < 6; k++) { const a = k * PI / 3; ctx.beginPath(); ctx.moveTo(x + w * o, base - H * 0.014); ctx.lineTo(x + w * o + Math.cos(a) * H * 0.014, base - H * 0.014 + Math.sin(a) * H * 0.014); ctx.stroke(); } });
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createRadialGradient(x, gy0 + gh / 2, 0, x, gy0 + gh / 2, w); lg.addColorStop(0, 'rgba(255,220,150,0.30)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = lg; ctx.fillRect(x - w, gy0 - w / 2, w * 2, w * 1.5); ctx.restore(); }
    // Candy-striped stumps
    {
      const sx = W * STUMPS[0], base = H * STUMPS[1];
      ctx.fillStyle = 'rgba(10,5,20,0.45)'; ctx.beginPath(); ctx.ellipse(sx, base + 3, W * 0.034, H * 0.010, 0, 0, PI * 2); ctx.fill();
      [-1, 0, 1].forEach((k) => {
        const x = sx + k * W * 0.0135, h = H * 0.150, r = W * 0.0058;
        ctx.fillStyle = '#f6f0ea'; ctx.fillRect(x - r, base - h, r * 2, h);
        ctx.save(); ctx.beginPath(); ctx.rect(x - r, base - h, r * 2, h); ctx.clip();
        ctx.fillStyle = '#e8303e'; for (let y = base - h - 10; y < base; y += 9) { ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y - 5); ctx.lineTo(x + r, y - 1); ctx.lineTo(x - r, y + 4); ctx.closePath(); ctx.fill(); }
        const sg = ctx.createLinearGradient(x - r, 0, x + r, 0); sg.addColorStop(0, 'rgba(0,0,0,0.25)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.15)'); sg.addColorStop(1, 'rgba(0,0,0,0.30)');
        ctx.fillStyle = sg; ctx.fillRect(x - r, base - h, r * 2, h); ctx.restore();
        ctx.fillStyle = '#f0c040'; ctx.beginPath(); ctx.ellipse(x, base - h, r, r * 0.5, 0, 0, PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#f0c040'; ctx.fillRect(sx - W * 0.0195, base - H * 0.153, W * 0.018, 2.2); ctx.fillRect(sx + W * 0.0015, base - H * 0.153, W * 0.018, 2.2);
    }
  }

  // Twilight haze low down and a vignette
  function drawAtmos(ctx, W, H) {
    const haze = ctx.createLinearGradient(0, H * 0.40, 0, H * 0.56);
    haze.addColorStop(0, 'rgba(255,170,160,0)'); haze.addColorStop(1, 'rgba(255,170,160,0.10)');
    ctx.fillStyle = haze; ctx.fillRect(0, H * 0.40, W, H * 0.16);
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.42, W * 0.25, W * 0.5, H * 0.42, W * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(0.75, 'rgba(20,0,30,0.08)'); vig.addColorStop(1, 'rgba(20,0,30,0.32)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  }

  // ════════ THE FAIRGROUND CUP — gold, candy-striped, crowned with a carousel canopy, on a circus drum ════════
  // The striped enamel spirals like a barber's pole as it turns; marquee bulbs chase round the shoulder;
  // the canopy lid's stripes and scalloped valance turn with it. Gold C-scroll handles.
  function drawTrophy(ctx, W, H, phi, t) {
    const tx = W * 0.5, tb = H * 0.705, S = H * 0.390, K = 1.58, TILT = 0.10;
    const P = (r, y, a) => [tx + r * Math.sin(a), y + r * Math.cos(a) * TILT];
    const gold = (x0, x1) => {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, '#5a3a0a'); g.addColorStop(0.18, '#f6d070'); g.addColorStop(0.35, '#fff2b8');
      g.addColorStop(0.55, '#d8a030'); g.addColorStop(0.78, '#8a5a12'); g.addColorStop(0.9, '#c8902a'); g.addColorStop(1, '#4a2a06');
      return g;
    };
    const chase = Math.floor(t * 5);
    ctx.save(); ctx.translate(tx, tb); ctx.scale(K, K); ctx.translate(-tx, -tb);
    // Soft shadow pooled under the drum
    ctx.fillStyle = 'rgba(10,5,20,0.45)'; ctx.beginPath(); ctx.ellipse(tx, tb + 2, W * 0.090, H * 0.016, 0, 0, PI * 2); ctx.fill();

    // ── Circus drum pedestal: red with gold bands, stars and a row of bulbs ──
    const pR = W * 0.072, dH = S * 0.19, dTop = tb - dH, eR = pR * TILT * 1.6;
    const dg = ctx.createLinearGradient(tx - pR, 0, tx + pR, 0);
    dg.addColorStop(0, '#4a0a14'); dg.addColorStop(0.25, '#b81e2e'); dg.addColorStop(0.45, '#ff5a6a'); dg.addColorStop(0.65, '#c82434'); dg.addColorStop(1, '#4a0a14');
    ctx.fillStyle = dg; ctx.beginPath(); ctx.moveTo(tx - pR, dTop); ctx.lineTo(tx - pR, tb); ctx.ellipse(tx, tb, pR, eR, 0, PI, 0, true); ctx.lineTo(tx + pR, dTop); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d02838'; ctx.beginPath(); ctx.ellipse(tx, dTop, pR, eR, 0, 0, PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.beginPath(); ctx.ellipse(tx - pR * 0.2, dTop - eR * 0.2, pR * 0.6, eR * 0.5, 0, 0, PI * 2); ctx.fill();
    ctx.strokeStyle = gold(tx - pR, tx + pR); ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.ellipse(tx, dTop, pR, eR, 0, 0, PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(tx, tb - 2, pR, eR, 0, 0, PI); ctx.stroke();
    ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(tx, dTop + dH * 0.22, pR, eR, 0, 0, PI); ctx.stroke();
    // Name in gold across the front, stars either side
    ctx.fillStyle = '#ffe080'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    { const bw = pR * 1.62, bh = dH * 0.34, by = dTop + dH * 0.36, sag = dH * 0.06;
      const ribbon = (off) => { ctx.beginPath(); ctx.moveTo(tx - bw / 2 - 6, by + off); ctx.lineTo(tx - bw / 2, by + bh / 2 + off); ctx.lineTo(tx - bw / 2 - 6, by + bh + off);
        ctx.quadraticCurveTo(tx, by + bh + sag + off, tx + bw / 2 + 6, by + bh + off); ctx.lineTo(tx + bw / 2, by + bh / 2 + off); ctx.lineTo(tx + bw / 2 + 6, by + off); ctx.quadraticCurveTo(tx, by + sag + off, tx - bw / 2 - 6, by + off); ctx.closePath(); };
      ribbon(1.2); ctx.fillStyle = 'rgba(20,0,10,0.5)'; ctx.fill();
      ribbon(0); ctx.fillStyle = '#1a2a6a'; ctx.fill(); ctx.strokeStyle = gold(tx - bw / 2, tx + bw / 2); ctx.lineWidth = 1.4; ctx.stroke();
      ctx.font = FONT(900, bh * 0.66); ctx.lineJoin = 'round';
      ctx.strokeStyle = '#3a1a00'; ctx.lineWidth = 2; ctx.strokeText('FAIRGROUND CUP', tx, by + bh * 0.52 + sag * 0.5, bw * 0.92);
      ctx.fillStyle = '#ffe070'; ctx.fillText('FAIRGROUND CUP', tx, by + bh * 0.52 + sag * 0.5, bw * 0.92);
      ctx.font = FONT(900, dH * 0.12); ctx.strokeText('★  ROLL UP!  ★', tx, by + bh + sag + dH * 0.10, pR); ctx.fillStyle = '#fff2c0'; ctx.fillText('★  ROLL UP!  ★', tx, by + bh + sag + dH * 0.10, pR); }
    // Marquee bulbs round the top band, chasing
    for (let k = 0; k < 13; k++) {
      const a = -PI / 2 + PI * (k + 0.5) / 13, [x, y] = P(pR * 0.98, dTop + dH * 0.11, a);
      const on = (k + chase) % 3 === 0;
      ctx.fillStyle = on ? '#fff6c0' : '#c89a40'; ctx.beginPath(); ctx.arc(x, y, 1.4, 0, PI * 2); ctx.fill();
      if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, 5); g.addColorStop(0, 'rgba(255,230,150,0.7)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - 5, y - 5, 10, 10); ctx.restore(); }
    }

    // ── Foot and stem ──
    const footY = dTop - eR * 0.3, footW = W * 0.034;
    ctx.fillStyle = gold(tx - footW, tx + footW);
    ctx.beginPath(); ctx.ellipse(tx, footY, footW, S * 0.015, 0, 0, PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx - footW, footY); ctx.quadraticCurveTo(tx - footW * 0.6, footY - S * 0.030, tx - footW * 0.18, footY - S * 0.042);
    ctx.lineTo(tx + footW * 0.18, footY - S * 0.042); ctx.quadraticCurveTo(tx + footW * 0.6, footY - S * 0.030, tx + footW, footY); ctx.closePath(); ctx.fill();
    const stemTop = footY - S * 0.120;
    ctx.fillRect(tx - footW * 0.16, stemTop, footW * 0.32, footY - S * 0.04 - stemTop);
    ctx.beginPath(); ctx.ellipse(tx, footY - S * 0.080, footW * 0.42, S * 0.016, 0, 0, PI * 2); ctx.fill();

    // ── The bowl: gold, with a candy-stripe enamel band that spirals as it turns ──
    const cw = W * 0.062, yb = stemTop;
    const prof = [[0.30, 0.000], [0.65, 0.040], [0.92, 0.110], [1.02, 0.190], [0.98, 0.255], [1.04, 0.290]].map(([r, h]) => [r * cw, yb - h * S]);
    const lipY = prof[prof.length - 1][1], lipR = prof[prof.length - 1][0];
    const rAt = (y) => { for (let k = 0; k < prof.length - 1; k++) { const [r0, y0] = prof[k], [r1, y1] = prof[k + 1]; if (y <= y0 && y >= y1) return r0 + (r1 - r0) * (y0 - y) / (y0 - y1); } return cw; };
    const bowlPath = () => { ctx.beginPath(); prof.forEach(([r, y], k) => k ? ctx.lineTo(tx - r, y) : ctx.moveTo(tx - r, y)); for (let k = prof.length - 1; k >= 0; k--) ctx.lineTo(tx + prof[k][0], prof[k][1]); ctx.closePath(); };
    // Gold C-scroll handles
    const hy1 = yb - S * 0.055, hy2 = yb - S * 0.235;
    function scroll(a) {
      const pts = [];
      for (let k = 0; k <= 24; k++) { const u = k / 24, y = hy1 + (hy2 - hy1) * u, r = rAt(y) * 0.98 + cw * 0.36 * Math.sin(PI * Math.min(1, u * 1.1)); pts.push(P(r, y, a)); }
      const c = Math.cos(a);
      ctx.lineCap = 'round';
      // An inward curl at the top, in the same 3D frame so it turns with the handle
      const [rTop, yTop] = [rAt(hy2) * 0.98, hy2];
      for (let k = 1; k <= 14; k++) { const th = k / 14 * PI * 1.6, rr = cw * 0.10 * (1 - k / 22); pts.push(P(rTop + cw * 0.10 - rr * Math.cos(th), yTop - rr * Math.sin(th) - cw * 0.02, a)); }
      const line = () => { ctx.beginPath(); pts.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); };
      ctx.strokeStyle = c < 0 ? '#6a4410' : '#4a2a06'; ctx.lineWidth = 4.8; line(); ctx.stroke();
      ctx.strokeStyle = c < 0 ? '#b88a3a' : '#e8b850'; ctx.lineWidth = 3.2; line(); ctx.stroke();
      ctx.strokeStyle = c < 0 ? 'rgba(255,230,160,0.35)' : 'rgba(255,245,200,0.8)'; ctx.lineWidth = 1.0; line(); ctx.stroke();
      // Gold balls where the handle meets the bowl
      [pts[0], P(rAt(hy2) * 0.99, hy2, a)].forEach(([x, y]) => { const g = ctx.createRadialGradient(x - 1, y - 1, 0, x, y, 3.2); g.addColorStop(0, '#fff6c0'); g.addColorStop(0.5, '#e0a830'); g.addColorStop(1, '#6a4008'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 3, 0, PI * 2); ctx.fill(); });
    }
    const handles = [phi + PI / 2, phi - PI / 2];
    handles.filter(a => Math.cos(a) < 0).forEach(scroll);
    ctx.fillStyle = gold(tx - lipR, tx + lipR); bowlPath(); ctx.fill();
    // Spiral candy stripes
    {
      const ya = yb - S * 0.060, yc = yb - S * 0.220, NSEG = 10, NS = 10, twist = 2.4;
      const ys = Array.from({ length: NSEG + 1 }, (_, j) => ya + (yc - ya) * j / NSEG);
      ctx.save(); bowlPath(); ctx.clip();
      // White enamel base band
      ctx.beginPath();
      ys.forEach((y, j) => { const [x] = P(rAt(y), y, -PI / 2); j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      for (let k = 0; k <= 24; k++) { const a = -PI / 2 + PI * k / 24, [x, y] = P(rAt(yc), yc, a); ctx.lineTo(x, y); }
      for (let j = NSEG; j >= 0; j--) { const [x] = P(rAt(ys[j]), ys[j], PI / 2); ctx.lineTo(x, ys[j]); }
      for (let k = 24; k >= 0; k--) { const a = -PI / 2 + PI * k / 24, [x, y] = P(rAt(ya), ya, a); ctx.lineTo(x, y); }
      ctx.closePath(); ctx.fillStyle = '#fff4ec'; ctx.fill();
      for (let i = 0; i < NS; i++) for (let j = 0; j < NSEG; j++) {
        const tw0 = twist * j / NSEG, tw1 = twist * (j + 1) / NSEG;
        const a00 = phi + i * PI * 2 / NS + tw0, a01 = a00 + PI / NS, a10 = phi + i * PI * 2 / NS + tw1, a11 = a10 + PI / NS;
        const am = (a00 + a11) / 2; if (Math.cos(am) < -0.05) continue;
        const q = [P(rAt(ys[j]), ys[j], a00), P(rAt(ys[j]), ys[j], a01), P(rAt(ys[j + 1]), ys[j + 1], a11), P(rAt(ys[j + 1]), ys[j + 1], a10)];
        ctx.fillStyle = '#e02a3a'; ctx.beginPath(); q.forEach(([x, y], k) => k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill();
      }
      // Round the band off: darken towards both edges, a gloss line down the lit side
      const sh = ctx.createLinearGradient(tx - cw * 1.05, 0, tx + cw * 1.05, 0);
      sh.addColorStop(0, 'rgba(40,0,10,0.55)'); sh.addColorStop(0.25, 'rgba(40,0,10,0)'); sh.addColorStop(0.75, 'rgba(40,0,10,0)'); sh.addColorStop(1, 'rgba(40,0,10,0.55)');
      ctx.fillStyle = sh; ctx.fillRect(tx - cw * 1.1, yc - 2, cw * 2.2, ya - yc + 4);
      ctx.fillStyle = 'rgba(255,255,255,0.30)'; ctx.beginPath(); ctx.ellipse(tx - cw * 0.45, (ya + yc) / 2, cw * 0.07, (ya - yc) * 0.42, 0.05, 0, PI * 2); ctx.fill();
      ctx.restore();
      // Gold beads at the band edges
      ctx.strokeStyle = gold(tx - cw, tx + cw); ctx.lineWidth = 1.6;
      [ya, yc].forEach(y => { const r = rAt(y); ctx.beginPath(); ctx.ellipse(tx, y, r * 1.005, r * TILT, 0, 0, PI); ctx.stroke(); });
    }
    // Marquee bulbs round the shoulder, chasing
    {
      const y = yb - S * 0.258, r = rAt(y) * 1.01;
      ctx.strokeStyle = gold(tx - r, tx + r); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(tx, y, r, r * TILT, 0, 0, PI); ctx.stroke();
      for (let k = 0; k < 16; k++) {
        const a = phi + k * PI * 2 / 16, c = Math.cos(a); if (c < 0) continue;
        const [x, yy] = P(r, y, a), on = (k + chase) % 4 === 0 || (k + chase) % 4 === 2 && (Math.floor(t * 2.5) % 2);
        ctx.fillStyle = on ? BULB[k % BULB.length] : 'rgba(200,160,80,0.9)';
        ctx.beginPath(); ctx.ellipse(x, yy, 1.5 * Math.max(0.5, c), 1.5, 0, 0, PI * 2); ctx.fill();
        if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, yy, 0, x, yy, 5); g.addColorStop(0, 'rgba(255,230,160,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - 5, yy - 5, 10, 10); ctx.restore(); }
      }
    }
    // One soft highlight, warm fill from the lights in front
    ctx.save(); bowlPath(); ctx.clip();
    ctx.fillStyle = 'rgba(255,250,220,0.30)'; ctx.beginPath(); ctx.ellipse(tx - cw * 0.62, yb - S * 0.025, cw * 0.10, S * 0.020, 0, 0, PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,120,160,0.18)'; ctx.fillRect(tx + cw * 0.5, yb - S * 0.30, cw * 0.6, S * 0.30);    // pink sky in the metal
    ctx.restore();

    // ── Carousel canopy lid: striped cone, scalloped valance, gold star finial ──
    {
      const cR = lipR * 1.10, cy = lipY - S * 0.006, apexY = lipY - S * 0.115, NSg = 12;
      ctx.strokeStyle = gold(tx - cR, tx + cR); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(tx, lipY, lipR, lipR * TILT, 0, PI, PI * 2); ctx.stroke();   // lip behind
      const segs = [];
      for (let i = 0; i < NSg; i++) { const a0 = phi + i * PI * 2 / NSg, a1 = a0 + PI * 2 / NSg, am = (a0 + a1) / 2; segs.push([a0, a1, am, i]); }
      segs.sort((p, q) => Math.cos(p[2]) - Math.cos(q[2]));
      segs.forEach(([a0, a1, am, i]) => {
        const c = Math.cos(am); if (c < -0.2) return;
        const p0 = P(cR, cy, a0), p1 = P(cR, cy, a1);
        const shade = 0.55 + 0.45 * Math.max(0, c) - 0.15 * Math.max(0, Math.sin(am));
        const base = i % 2 ? [255, 244, 236] : [224, 42, 58];
        ctx.fillStyle = `rgb(${base.map(v => Math.round(v * shade)).join(',')})`;
        ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.quadraticCurveTo((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + 1.5, p1[0], p1[1]); ctx.lineTo(tx, apexY); ctx.closePath(); ctx.fill();
      });
      // Valance: a scallop hanging under each front segment, in alternating gold and blue
      segs.forEach(([a0, a1, am, i]) => {
        const c = Math.cos(am); if (c < 0.05) return;
        const [x, y] = P(cR, cy, am), wv = Math.abs(P(cR, cy, a1)[0] - P(cR, cy, a0)[0]) * 0.5;
        ctx.fillStyle = i % 2 ? '#2a5ab0' : '#f0c040'; ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.5, wv), S * 0.022, 0, 0, PI); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x - wv * 0.6, y + 0.5, wv * 1.2, 0.8);
      });
      ctx.strokeStyle = gold(tx - cR, tx + cR); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(tx, cy, cR, cR * TILT, 0, 0, PI); ctx.stroke();
      // Bulbs round the canopy edge
      for (let k = 0; k < 12; k++) { const a = phi + (k + 0.5) * PI * 2 / 12, c = Math.cos(a); if (c < 0.05) continue; const [x, y] = P(cR, cy, a), on = (k + chase) % 3 === 1;
        ctx.fillStyle = on ? '#fff6c0' : '#d8b060'; ctx.beginPath(); ctx.arc(x, y, 1.2, 0, PI * 2); ctx.fill(); }
      // Finial: gold pole, ball and star, with a little pennant
      const fTop = apexY - S * 0.060;
      ctx.fillStyle = gold(tx - 3, tx + 3); ctx.fillRect(tx - 1.2, fTop, 2.4, apexY - fTop + 1);
      ctx.beginPath(); ctx.arc(tx, apexY - 1, 3, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#ffd848'; ctx.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? 2.4 : 5.6, aa = k * PI / 5 - PI / 2; ctx.lineTo(tx + Math.cos(aa) * rr, fTop - 4 + Math.sin(aa) * rr); } ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(140,90,10,0.7)'; ctx.lineWidth = 0.5; ctx.stroke();
      ctx.fillStyle = '#2a8ad8'; ctx.beginPath(); ctx.moveTo(tx + 1.2, fTop + 4);
      for (let k = 1; k <= 5; k++) { const u = k / 5; ctx.lineTo(tx + 1.2 + u * 9, fTop + 4 + u * 1.5 + Math.sin(t * 6 + u * 4) * u); }
      for (let k = 5; k >= 0; k--) { const u = k / 5; ctx.lineTo(tx + 1.2 + u * 9, fTop + 8 - u * 1 + Math.sin(t * 6 + u * 4) * u); }
      ctx.closePath(); ctx.fill();
    }
    handles.filter(a => Math.cos(a) >= 0).forEach(scroll);
    ctx.restore();

    // A bat leaning on the drum, candy-striped grip, with a red ball (drawn unscaled)
    {
      const toeX = tx - W * 0.072 * K - W * 0.062, toeY = tb - H * 0.002, topX = tx - W * 0.072 * K + W * 0.004, topY = tb - H * 0.140;
      const ang = Math.atan2(topY - toeY, topX - toeX), len = Math.hypot(topX - toeX, topY - toeY);
      ctx.fillStyle = 'rgba(10,5,20,0.45)'; ctx.beginPath(); ctx.ellipse(toeX + W * 0.03, toeY + 2, W * 0.032, H * 0.007, 0.1, 0, PI * 2); ctx.fill();
      ctx.save(); ctx.translate(toeX, toeY); ctx.rotate(ang);
      const bw = W * 0.022, bl = len * 0.64;
      const g = ctx.createLinearGradient(0, -bw / 2, 0, bw / 2);
      g.addColorStop(0, '#f6dcb0'); g.addColorStop(0.45, '#d0a878'); g.addColorStop(1, '#7a5a3a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(0, -bw / 2, bl, bw, bw * 0.28); ctx.fill();
      ctx.fillStyle = '#2a5ab0'; ctx.fillRect(bl * 0.45, -bw / 2, bl * 0.20, bw);
      ctx.fillStyle = '#f0c040'; ctx.fillRect(bl * 0.47, -bw * 0.12, bl * 0.16, bw * 0.24);
      ctx.fillStyle = '#d0a878'; ctx.fillRect(bl, -bw * 0.16, bw * 0.6, bw * 0.32);
      ctx.save(); ctx.beginPath(); ctx.rect(bl + bw * 0.55, -bw * 0.17, len - bl - bw * 0.55, bw * 0.34); ctx.clip();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(bl, -bw, len, bw * 2);
      ctx.fillStyle = '#e02a3a'; for (let x = bl; x < len; x += 4) { ctx.beginPath(); ctx.moveTo(x, -bw * 0.17); ctx.lineTo(x + 2, -bw * 0.17); ctx.lineTo(x + 4, bw * 0.17); ctx.lineTo(x + 2, bw * 0.17); ctx.closePath(); ctx.fill(); }
      ctx.restore(); ctx.restore();
      const bx = toeX - W * 0.012, by = toeY - H * 0.012, r = H * 0.012;
      const bg = ctx.createRadialGradient(bx - r * 0.3, by - r * 0.4, r * 0.1, bx, by, r);
      bg.addColorStop(0, '#ff8a7a'); bg.addColorStop(0.6, '#c82a2a'); bg.addColorStop(1, '#6a1010');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(bx, by, r, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,240,220,0.8)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.ellipse(bx, by, r * 0.35, r, 0.3, 0, PI * 2); ctx.stroke();
    }
  }

  // ════════ AMBIENT ANIMATION ════════
  // Far layer (behind the stalls): twinkling stars, the Ferris wheel, the big-top flag, fireworks, the balloon
  function drawAmbientFar(ctx, W, H, t) {
    const m = t % SHOW;
    [[0.08, 0.04], [0.33, 0.09], [0.46, 0.03], [0.70, 0.06], [0.93, 0.03]].forEach(([fx, fy], i) => {
      const a = 0.35 + 0.35 * Math.sin(t * (1 + i * 0.4) + i);
      ctx.fillStyle = `rgba(255,240,255,${a.toFixed(3)})`; ctx.fillRect(W * fx - 1, H * fy, 3, 1); ctx.fillRect(W * fx, H * fy - 1, 1, 3);
    });
    // Big-top flag
    { const x = W * 0.180, y = H * 0.215 - H * 0.040;
      ctx.fillStyle = '#ffd030'; ctx.beginPath(); ctx.moveTo(x, y);
      for (let k = 1; k <= 6; k++) { const u = k / 6; ctx.lineTo(x + u * W * 0.028, y + Math.sin(t * 6 + u * 4) * 1.4 * u); }
      for (let k = 6; k >= 0; k--) { const u = k / 6; ctx.lineTo(x + u * W * 0.028, y + H * 0.020 + Math.sin(t * 6 + u * 4) * 1.4 * u); }
      ctx.closePath(); ctx.fill(); }
    // Firework shows across the whole sky: peonies, golden willows that droop, and crackling glitter
    FW_SHOWS.forEach(([s0, s1], V) => {
      const f = win(m, [s0, s1]); if (f < 0) return;
      const T = f * (s1 - s0);
      const hash = (n) => { const v = Math.sin(n * 127.1 + V * 31.7) * 43758.5453; return v - Math.floor(v); };
      const COLS = ['255,200,110', '255,110,190', '140,220,255', '180,255,140', '255,240,200', '200,140,255'];
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 18; k++) {
        const t0 = 0.05 + k * 0.24 + (k % 3) * 0.04, x = W * (0.04 + 0.92 * hash(k * 3.3)), yb = H * (0.05 + 0.20 * hash(k * 7.7));
        const kind = k % 4 === 3 ? 'willow' : (k % 5 === 4 ? 'crackle' : 'peony'), col = COLS[Math.floor(hash(k * 5.1) * COLS.length)];
        const dt = T - t0; if (dt < 0) continue;
        const rise = 0.40;
        if (dt < rise) { const u = dt / rise, y = H * 0.47 + (yb - H * 0.47) * (1 - (1 - u) * (1 - u)); for (let j = 0; j < 5; j++) { const yy = y + j * 3; ctx.fillStyle = `rgba(255,220,170,${(0.9 - j * 0.17).toFixed(3)})`; ctx.fillRect(x - 0.6, yy, 1.3, 1.6); } continue; }
        const db = dt - rise, life = kind === 'willow' ? 2.2 : 1.5; if (db > life) continue;
        const size = H * (0.075 + 0.04 * hash(k * 9.9)), R = size * (1 - Math.exp(-db * 3)), a = Math.pow(1 - db / life, 1.2);
        if (db < 0.3) { const g = ctx.createRadialGradient(x, yb, 0, x, yb, size * 1.6); g.addColorStop(0, `rgba(${col},${(0.35 * (1 - db / 0.3)).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - size * 1.6, yb - size * 1.6, size * 3.2, size * 3.2); }
        const n = kind === 'crackle' ? 30 : 40;
        for (let j = 0; j < n; j++) {
          const ang = j / n * PI * 2 + k, rr = R * (0.85 + 0.15 * hash(j + k * 11));
          if (kind === 'willow') {                           // long golden trails drooping down
            for (let tr = 0; tr < 6; tr++) { const q = 1 - tr * 0.07, px = x + Math.cos(ang) * rr * q, py = yb + Math.sin(ang) * rr * q * 0.9 + db * db * H * 0.06 * q + tr * 1.4;
              ctx.fillStyle = `rgba(255,205,120,${(a * (1 - tr / 6)).toFixed(3)})`; ctx.fillRect(px - 0.6, py - 0.6, 1.3, 1.3); }
          } else if (kind === 'crackle') {                   // glittering white points that flicker
            if (Math.sin(T * 40 + j * 7) < -0.2) continue;
            const px = x + Math.cos(ang) * rr, py = yb + Math.sin(ang) * rr + db * db * H * 0.03;
            ctx.fillStyle = `rgba(255,250,235,${a.toFixed(3)})`; ctx.fillRect(px - 0.8, py - 0.8, 1.7, 1.7);
          } else {
            for (let tr = 0; tr < 3; tr++) { const q = 1 - tr * 0.1, px = x + Math.cos(ang) * rr * q, py = yb + Math.sin(ang) * rr * q * 0.92 + db * db * H * 0.035 * q;
              ctx.fillStyle = `rgba(${col},${(a * (tr ? 0.35 / tr : 1)).toFixed(3)})`; ctx.fillRect(px - 0.9, py - 0.9, tr ? 1.3 : 2, tr ? 1.3 : 2); }
          }
        }
      }
      ctx.restore();
    });
    // ── Slingshot behind the big top: two lattice towers, bungee cords, a pod that's fired skywards ──
    {
      const xL = W * 0.022, xR = W * 0.118, topY = H * 0.075, footY = H * 0.50, cx = (xL + xR) / 2, rest = H * 0.47, r = H * 0.019;
      [xL, xR].forEach((x, i) => {
        ctx.strokeStyle = '#d8d0e8'; ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(x - 3, footY); ctx.lineTo(x - 1, topY); ctx.moveTo(x + 3, footY); ctx.lineTo(x + 1, topY); ctx.stroke();
        ctx.lineWidth = 0.5; ctx.beginPath(); for (let k = 0; k <= 16; k++) { const u = k / 16, y = footY + (topY - footY) * u, w = 3 - 2 * u; k ? ctx.lineTo(x + (k % 2 ? w : -w), y) : ctx.moveTo(x - w, y); } ctx.stroke();
        const on = Math.floor(t * 3 + i) % 2 === 0;
        ctx.fillStyle = on ? '#ff5aa0' : '#ffe080'; ctx.beginPath(); ctx.arc(x, topY - 2, 2, 0, PI * 2); ctx.fill();
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, topY - 2, 0, x, topY - 2, 9); g.addColorStop(0, on ? 'rgba(255,90,160,0.6)' : 'rgba(255,224,128,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - 9, topY - 11, 18, 18); ctx.restore();
      });
      let py = rest, spin = 0;
      SLING.forEach(([a0, a1]) => {
        const f = win(m, [a0, a1]); if (f < 0) return;
        const T = f * (a1 - a0), yEq = H * 0.15, top = H * 0.035;
        if (T < 0.40) { const u = T / 0.40; py = rest + (top - rest) * (1 - (1 - u) * (1 - u)); }
        else if (T < 4.4) { const u = T - 0.40; py = yEq + (top - yEq) * Math.exp(-u * 0.75) * Math.cos(u * 4.2); }
        else { const u = (T - 4.4) / (a1 - a0 - 4.4); py = yEq + (rest - yEq) * u * u * (3 - 2 * u); }
        spin = T * 6;
      });
      ctx.strokeStyle = 'rgba(255,200,230,0.75)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(xL, topY); ctx.lineTo(cx - r * 0.7, py); ctx.moveTo(xR, topY); ctx.lineTo(cx + r * 0.7, py); ctx.stroke();
      ctx.save(); ctx.translate(cx, py); ctx.rotate(spin);
      ctx.fillStyle = 'rgba(40,30,60,0.85)'; ctx.beginPath(); ctx.arc(0, 0, r, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffd030'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, r, 0, PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
      ctx.fillStyle = '#ffd8c0'; [-0.35, 0.35].forEach(dx => { ctx.beginPath(); ctx.arc(dx * r, -r * 0.2, r * 0.22, 0, PI * 2); ctx.fill(); });
      ctx.restore();
    }
    // ── Swing-chair spinner between the big top and the cup: chairs fly out as the canopy turns ──
    {
      const cx = W * 0.352, mastTop = H * 0.255, canY = H * 0.270, footY = H * 0.53;
      const spinA = t * 1.6, out = 0.85 + 0.15 * Math.sin(t * 0.4);
      const Rc = W * (0.024 + 0.026 * out), chairY = canY + H * (0.075 - 0.035 * out), canR = W * 0.032;
      const chairs = [];
      for (let k = 0; k < 10; k++) { const a = spinA + k * PI * 2 / 10; chairs.push([a, Math.cos(a)]); }
      const drawChair = ([a, c]) => {
        const x = cx + Rc * Math.sin(a), y = chairY + Rc * c * 0.22, ax = cx + canR * Math.sin(a), ay = canY + canR * c * 0.22;
        ctx.strokeStyle = c < 0 ? 'rgba(200,190,220,0.45)' : 'rgba(230,220,240,0.8)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = c < 0 ? '#8a3a6a' : BULB[Math.round((a % (PI * 2)) * 10) % BULB.length]; ctx.fillRect(x - 2, y, 4, 2.4);
        ctx.fillStyle = c < 0 ? '#5a3a5a' : '#ffd8c0'; ctx.beginPath(); ctx.arc(x, y - 1, 1.2, 0, PI * 2); ctx.fill();
      };
      chairs.filter(([, c]) => c < 0).forEach(drawChair);
      ctx.fillStyle = '#d8d0e8'; ctx.fillRect(cx - 1.5, mastTop, 3, footY - mastTop);
      // Canopy: a striped cone that turns
      for (let k = 0; k < 12; k++) {
        const a0 = spinA * 0.5 + k * PI / 6, a1 = a0 + PI / 6, c = Math.cos((a0 + a1) / 2); if (c < -0.1) continue;
        ctx.fillStyle = k % 2 ? '#fff4ec' : '#2a8ad8';
        ctx.beginPath(); ctx.moveTo(cx + canR * Math.sin(a0), canY + canR * Math.cos(a0) * 0.22); ctx.lineTo(cx + canR * Math.sin(a1), canY + canR * Math.cos(a1) * 0.22); ctx.lineTo(cx, mastTop - H * 0.020); ctx.closePath(); ctx.fill();
      }
      for (let k = 0; k < 10; k++) { const a = spinA * 0.5 + k * PI / 5, c = Math.cos(a); if (c < 0) continue; ctx.fillStyle = (k + Math.floor(t * 5)) % 2 ? '#fff2a0' : '#ff7ab0'; ctx.beginPath(); ctx.arc(cx + canR * Math.sin(a), canY + canR * c * 0.22, 1.2, 0, PI * 2); ctx.fill(); }
      ctx.fillStyle = '#f0c040'; ctx.beginPath(); ctx.arc(cx, mastTop - H * 0.022, 2, 0, PI * 2); ctx.fill();
      chairs.filter(([, c]) => c >= 0).forEach(drawChair);
    }
    // ── Pendulum ride on the far right: a giant arm swinging a spinning ring of seats ──
    {
      const px = W * 0.948, py = H * 0.150, L = H * 0.200, theta = 0.62 * Math.sin(t * PI * 2 / 6.6);
      ctx.strokeStyle = '#c8c0e0'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(W * 0.905, H * 0.53); ctx.moveTo(px, py); ctx.lineTo(W * 0.995, H * 0.53); ctx.stroke();
      const gx = px + L * Math.sin(theta), gy = py + L * Math.cos(theta);
      ctx.strokeStyle = '#f0c040'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(gx, gy); ctx.stroke();
      ctx.fillStyle = '#f0c040'; ctx.beginPath(); ctx.arc(px, py, 3.2, 0, PI * 2); ctx.fill();
      ctx.save(); ctx.translate(gx, gy); ctx.rotate(theta);
      const rx = W * 0.030, ry = H * 0.012;
      ctx.fillStyle = '#5a2a8a'; ctx.beginPath(); ctx.ellipse(0, 2, rx, ry, 0, 0, PI * 2); ctx.fill();
      for (let k = 0; k < 10; k++) { const a = t * 2.4 + k * PI / 5, c = Math.cos(a); const x = rx * Math.sin(a), y = 1 + ry * c;
        ctx.fillStyle = c > 0 ? '#ffd8c0' : 'rgba(255,216,192,0.4)'; ctx.beginPath(); ctx.arc(x, y - 2.2, 1.3, 0, PI * 2); ctx.fill();
        ctx.fillStyle = (k + Math.floor(t * 6)) % 2 ? '#7ae0ff' : '#ff6a8a'; ctx.fillRect(x - 0.8, y + 1.5, 1.6, 1.6); }
      ctx.strokeStyle = '#ffe080'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 2, rx, ry, 0, 0, PI * 2); ctx.stroke();
      ctx.restore();
    }
    // The Ferris wheel: turns slowly, gondolas stay level, the rim lights chase (and all flash on cue)
    {
      const cx = W * WHEEL[0], cy = H * WHEEL[1], R = H * WHEEL[2], rot = t * PI * 2 / 40;
      const flash = win(m, WHEEL_FLASH) > 0 ? (Math.floor(t * 8) % 2 === 0) : null;
      // A-frame legs
      ctx.strokeStyle = '#d8d0e8'; ctx.lineWidth = 2;
      [[-1, 1], [1, 1]].forEach(([sd]) => { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + sd * R * 0.55, H * 0.565); ctx.stroke(); });
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - R * 0.30, H * 0.45); ctx.lineTo(cx + R * 0.30, H * 0.45); ctx.stroke();
      // Spokes and rims
      ctx.strokeStyle = 'rgba(235,230,255,0.85)'; ctx.lineWidth = 0.8;
      for (let k = 0; k < 16; k++) { const a = rot + k * PI / 8; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }
      ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, PI * 2); ctx.stroke();
      ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(cx, cy, R * 0.86, 0, PI * 2); ctx.stroke();
      ctx.fillStyle = '#f0c040'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, PI * 2); ctx.fill();
      // Rim bulbs
      for (let k = 0; k < 32; k++) {
        const a = rot + k * PI / 16, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        const on = flash === null ? (k + Math.floor(t * 6)) % 4 < 2 : flash;
        ctx.fillStyle = on ? BULB[k % BULB.length] : 'rgba(180,160,200,0.6)'; ctx.beginPath(); ctx.arc(x, y, 1.3, 0, PI * 2); ctx.fill();
        if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, 5); g.addColorStop(0, 'rgba(255,220,170,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - 5, y - 5, 10, 10); ctx.restore(); }
      }
      // Spoke bulbs
      for (let k = 0; k < 8; k++) for (let j = 1; j <= 3; j++) { const a = rot + k * PI / 4, x = cx + Math.cos(a) * R * j / 4, y = cy + Math.sin(a) * R * j / 4;
        ctx.fillStyle = (flash ?? ((j + Math.floor(t * 4)) % 3 === 0)) ? '#fff2c0' : 'rgba(200,180,220,0.5)'; ctx.fillRect(x - 0.7, y - 0.7, 1.4, 1.4); }
      // Gondolas hanging level, swaying gently
      const cols = ['#e83a4a', '#2a8ad8', '#f0c040', '#5ac88a', '#e868b0', '#ff8a30'];
      for (let k = 0; k < 12; k++) {
        const a = rot + k * PI / 6, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R, sway = Math.sin(t * 1.3 + k) * 0.08;
        ctx.save(); ctx.translate(x, y); ctx.rotate(sway);
        ctx.strokeStyle = '#d8d0e8'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 4); ctx.stroke();
        ctx.fillStyle = cols[k % cols.length]; ctx.beginPath(); ctx.roundRect(-5, 4, 10, 7, 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,240,200,0.75)'; ctx.fillRect(-3.5, 5.5, 7, 2.5);
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(-5.5, 3.5, 11, 1.2);
        ctx.restore();
      }
    }
    // A lost balloon rising from behind the hook-a-duck stall and drifting away into the sky
    {
      const f = win(m, BALLOON);
      if (f > 0) {
        const x = W * (BALLOONS[0] + 0.01 + f * 0.10) + Math.sin(f * PI * 5) * W * 0.012, y = H * (0.415 - f * 0.53), r = H * 0.020 * (1 - f * 0.35);
        ctx.strokeStyle = 'rgba(240,230,240,0.6)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x, y + r * 1.15);
        ctx.quadraticCurveTo(x - 3 + Math.sin(t * 3) * 2, y + r * 2.2, x + Math.sin(t * 2) * 2, y + r * 3.5); ctx.stroke();
        const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, 0, x, y, r * 1.1); g.addColorStop(0, '#ff9ac0'); g.addColorStop(0.6, '#e8305a'); g.addColorStop(1, '#8a1030');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, r * 0.86, r, 0, 0, PI * 2); ctx.fill();
        ctx.fillStyle = '#c82048'; ctx.beginPath(); ctx.moveTo(x - 1.5, y + r * 1.05); ctx.lineTo(x + 1.5, y + r * 1.05); ctx.lineTo(x, y + r * 0.92); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(x - r * 0.3, y - r * 0.4, r * 0.16, r * 0.26, -0.4, 0, PI * 2); ctx.fill();
      }
    }
  }

  // Mid layer (after the stalls): festoon lights strung overhead, chasing
  function drawAmbientMid(ctx, W, H, t) {
    // People strolling through the fair in the middle distance, rim-lit by the stalls; a family, a couple, kids
    const person = (x, y, s, dir, col, step, prop) => {
      ctx.fillStyle = '#140c1e';
      ctx.beginPath(); ctx.arc(x, y - s * 0.88, s * 0.11, 0, PI * 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(x - s * 0.13, y - s * 0.76, s * 0.26, s * 0.44, s * 0.06); ctx.fill();
      ctx.strokeStyle = '#140c1e'; ctx.lineWidth = s * 0.08; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - s * 0.05, y - s * 0.34); ctx.lineTo(x - s * 0.05 - step * s * 0.09, y); ctx.moveTo(x + s * 0.05, y - s * 0.34); ctx.lineTo(x + s * 0.05 + step * s * 0.09, y); ctx.stroke();
      ctx.fillStyle = col; ctx.fillRect(x - s * 0.13, y - s * 0.74, s * 0.26, s * 0.05);
      ctx.fillStyle = 'rgba(255,170,190,0.40)'; ctx.fillRect(x + dir * s * 0.11, y - s * 0.74, 0.9, s * 0.40);
      if (prop === 'candy') { ctx.fillStyle = '#ffb8e0'; ctx.beginPath(); ctx.arc(x + dir * s * 0.22, y - s * 0.95, s * 0.12, 0, PI * 2); ctx.fill(); ctx.strokeStyle = '#eee'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x + dir * s * 0.20, y - s * 0.85); ctx.lineTo(x + dir * s * 0.16, y - s * 0.60); ctx.stroke(); }
      if (prop === 'balloon') { const bx = x + dir * s * 0.25, by = y - s * 1.55 + Math.sin(t * 2) * 1.5; ctx.strokeStyle = 'rgba(230,230,240,0.6)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(x + dir * s * 0.14, y - s * 0.62); ctx.lineTo(bx, by + s * 0.16); ctx.stroke(); ctx.fillStyle = '#ffd030'; ctx.beginPath(); ctx.ellipse(bx, by, s * 0.13, s * 0.16, 0, 0, PI * 2); ctx.fill(); }
      if (prop === 'shoulders') {                          // a child riding on their shoulders, arms up
        ctx.fillStyle = '#140c1e'; ctx.beginPath(); ctx.arc(x, y - s * 1.30, s * 0.09, 0, PI * 2); ctx.fill(); ctx.beginPath(); ctx.roundRect(x - s * 0.09, y - s * 1.20, s * 0.18, s * 0.22, s * 0.04); ctx.fill();
        ctx.strokeStyle = '#140c1e'; ctx.lineWidth = s * 0.06; const wave = Math.sin(t * 5) * s * 0.06;
        ctx.beginPath(); ctx.moveTo(x - s * 0.08, y - s * 1.15); ctx.lineTo(x - s * 0.20, y - s * 1.40 + wave); ctx.moveTo(x + s * 0.08, y - s * 1.15); ctx.lineTo(x + s * 0.20, y - s * 1.40 - wave); ctx.stroke();
        ctx.fillStyle = '#ffd030'; ctx.fillRect(x - s * 0.09, y - s * 1.19, s * 0.18, s * 0.04);
      }
    };
    [ // period, offset, y, direction, colour, prop, size
      [17.0, 0.0, 0.592, 1, '#e8508a', 'candy', 1.0], [23.0, 8.0, 0.606, -1, '#2a8ad8', 'balloon', 1.0], [19.0, 4.0, 0.578, 1, '#f0c040', '', 0.95],
      [29.0, 15.0, 0.614, -1, '#5ac88a', 'kid', 0.68], [21.0, 11.0, 0.584, -1, '#e83a4a', 'shoulders', 1.0], [26.0, 19.0, 0.600, 1, '#a87aff', 'couple', 1.0],
      [31.0, 6.0, 0.570, -1, '#ff8a30', '', 0.92], [27.0, 2.0, 0.596, 1, '#2ac0d0', 'kid', 0.66]
    ].forEach(([period, off, fy, dir, col, prop, sz], i) => {
      const u = ((t + off) % period) / period, x = dir > 0 ? W * (-0.06 + u * 1.12) : W * (1.06 - u * 1.12), y = H * fy;
      const s = H * 0.078 * sz * (0.9 + (fy - 0.57) * 2), step = Math.sin(t * 7 + i);
      if (prop === 'couple') { person(x, y, s, dir, col, step, ''); person(x - dir * s * 0.32, y + 1, s * 0.94, dir, '#e8508a', Math.sin(t * 7 + i + 1), '');
        ctx.strokeStyle = '#140c1e'; ctx.lineWidth = s * 0.06; ctx.beginPath(); ctx.moveTo(x - dir * s * 0.10, y - s * 0.50); ctx.lineTo(x - dir * s * 0.22, y - s * 0.50); ctx.stroke(); }
      else person(x, y, s, dir, col, step, prop === 'kid' ? '' : prop);
    });
    // Dodgem sparks crackling off the ceiling grid now and then
    { const x0 = W * 0.705, x1 = W * 0.835, roof = H * 0.505;
      for (let k = 0; k < 3; k++) {
        const cyc = (t * 1.3 + k * 0.41) % 1, live = cyc < 0.12;
        if (!live) continue;
        const x = x0 + (x1 - x0) * ((Math.floor(t * 1.3 + k * 0.41) * 0.37 + k * 0.29) % 1), a = 1 - cyc / 0.12;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(x, roof + 2, 0, x, roof + 2, 10); g.addColorStop(0, `rgba(160,220,255,${(0.9 * a).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 10, roof - 8, 20, 20);
        ctx.strokeStyle = `rgba(220,245,255,${a.toFixed(3)})`; ctx.lineWidth = 0.7;
        for (let j = 0; j < 4; j++) { const ang = j * 1.6 + k + t * 10; ctx.beginPath(); ctx.moveTo(x, roof + 2); ctx.lineTo(x + Math.cos(ang) * 5, roof + 2 + Math.abs(Math.sin(ang)) * 5); ctx.stroke(); }
        ctx.restore();
      } }
    const strings = [[-0.02, 0.040, 0.48, 0.075, 0.045], [0.52, 0.075, 1.02, 0.040, 0.045], [0.10, 0.000, 0.62, 0.020, 0.035]];
    strings.forEach(([x0, y0, x1, y1, sag], si) => {
      const pt = (u) => [W * (x0 + (x1 - x0) * u), H * (y0 + (y1 - y0) * u) + H * sag * 4 * u * (1 - u)];
      ctx.strokeStyle = 'rgba(30,20,40,0.8)'; ctx.lineWidth = 0.7;
      ctx.beginPath(); for (let k = 0; k <= 30; k++) { const [x, y] = pt(k / 30); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      const n = 16;
      for (let k = 0; k < n; k++) {
        const [x, y] = pt((k + 0.5) / n), on = (k + si + Math.floor(t * 3)) % 3 !== 0, col = BULB[(k + si) % BULB.length];
        ctx.fillStyle = on ? col : 'rgba(120,100,120,0.8)'; ctx.beginPath(); ctx.ellipse(x, y + 2.2, 1.4, 1.9, 0, 0, PI * 2); ctx.fill();
        if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y + 2, 0, x, y + 2, 7); g.addColorStop(0, 'rgba(255,220,170,0.40)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - 7, y - 5, 14, 14); ctx.restore(); }
      }
    });
  }

  // Front layer: the coconut that gets knocked off, the high striker's puck and bell, candy-floss steam
  function drawAmbientFront(ctx, W, H, t) {
    const m = t % SHOW;
    // The second coconut: sits on its cup; a ball flies in, knocks it flying, then it's quietly put back
    {
      const x0 = W * SHY.x0, x1 = W * SHY.x1, px = x0 + (x1 - x0) * 0.38, py = H * 0.615, r = H * 0.017;
      const f = win(m, COCONUT), T = f > 0 ? f * (COCONUT[1] - COCONUT[0]) : -1;
      let cx = px, cy = py - r + 1, rot = 0, alpha = 1;
      if (T >= 0) {
        if (T < 0.45) {                                     // the ball flies in from the bottom left
          const u = T / 0.45, bx = W * -0.02 + (px - W * -0.02) * u, by = H * 0.80 + (py - r - H * 0.80) * u - Math.sin(u * PI) * H * 0.06;
          ctx.fillStyle = '#c82a2a'; ctx.beginPath(); ctx.arc(bx, by, 2.6, 0, PI * 2); ctx.fill();
        } else if (T < 1.6) {                               // the coconut tumbles off the back
          const u = (T - 0.45) / 1.15; cx = px + u * W * 0.03; cy = py - r - Math.sin(u * PI) * H * 0.04 + u * u * H * 0.06; rot = u * 5; alpha = u > 0.6 ? 1 - (u - 0.6) / 0.4 : 1;
          if (u < 0.25) { ctx.fillStyle = `rgba(255,240,200,${(0.8 * (1 - u / 0.25)).toFixed(3)})`; for (let k = 0; k < 6; k++) { const a = k * PI / 3; ctx.fillRect(px + Math.cos(a) * (4 + u * 30), py - r + Math.sin(a) * (4 + u * 30), 1.4, 1.4); } }
        } else if (T < 2.4) alpha = 0;                       // gone
        else alpha = Math.min(1, (T - 2.4) / 0.4);          // back on its cup
      }
      if (alpha > 0) {
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.rotate(rot);
        const ng = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r); ng.addColorStop(0, '#9a6a3a'); ng.addColorStop(1, '#4a2a12');
        ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(0, 0, r, 0, PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(200,160,110,0.45)'; ctx.lineWidth = 0.5; for (let k = 0; k < 6; k++) { const a = k * 1.1; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5); ctx.lineTo(Math.cos(a) * r * 1.05, Math.sin(a) * r * 1.05); ctx.stroke(); }
        ctx.restore();
      }
    }
    // High striker: the puck shoots up, rings the bell (it flashes and rings), then drops back
    {
      const x = W * STRIKER[0], base = H * STRIKER[1], top = H * STRIKER[2];
      let py = base - H * 0.030, ring = 0;
      DINGS.forEach(range => {
        const f = win(m, range); if (f < 0) return;
        const T = f * (range[1] - range[0]);
        if (T < 0.35) py = base - H * 0.030 - (base - top - H * 0.04) * Math.sin(T / 0.35 * PI / 2);
        else if (T < 0.9) { py = top + 8; ring = 1 - (T - 0.35) / 1.4; }
        else if (T < 1.5) { const u = (T - 0.9) / 0.6; py = top + 8 + (base - H * 0.030 - top - 8) * u * u; ring = Math.max(0, 1 - (T - 0.35) / 1.4); }
        else ring = Math.max(0, 1 - (T - 0.35) / 1.4);
      });
      ctx.fillStyle = '#f2f2f2'; ctx.beginPath(); ctx.roundRect(x - 3, py - 3, 6, 6, 1.5); ctx.fill();
      ctx.fillStyle = '#c82a2a'; ctx.fillRect(x - 3, py - 0.5, 6, 1);
      // Bell
      const bx = x, by = top - 7;
      ctx.fillStyle = ring > 0 ? '#fff2a0' : '#e8b830'; ctx.beginPath(); ctx.moveTo(bx - 7, by + 4); ctx.quadraticCurveTo(bx - 6, by - 6, bx, by - 7); ctx.quadraticCurveTo(bx + 6, by - 6, bx + 7, by + 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#a87818'; ctx.fillRect(bx - 7.5, by + 3, 15, 1.6);
      if (ring > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, 26); g.addColorStop(0, `rgba(255,240,170,${(0.8 * ring).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(bx - 26, by - 26, 52, 52); ctx.restore();
        ctx.strokeStyle = `rgba(255,240,170,${ring.toFixed(3)})`; ctx.lineWidth = 1;
        [0, 1].forEach(k => { const rr = 10 + (1 - ring) * 14 + k * 6; [-1, 1].forEach(sd => { ctx.beginPath(); ctx.arc(bx, by, rr, sd < 0 ? PI * 0.85 : -PI * 0.15, sd < 0 ? PI * 1.15 : PI * 0.15); ctx.stroke(); }); });
      }
    }
    // The balloon seller's bunch, bobbing on their strings
    { const x = W * BALLOONS[0], ty = H * 0.520;
      const bal = [[-0.030, 0.395, '#e8305a'], [0.000, 0.375, '#ffd030'], [0.028, 0.395, '#2a8ad8'], [-0.015, 0.420, '#5ac88a'], [0.016, 0.418, '#e868b0'], [0.000, 0.440, '#ff8a30'], [-0.034, 0.440, '#a87aff']];
      bal.forEach(([dx, fy, col], i) => {
        const bx = x + W * dx + Math.sin(t * 1.4 + i * 1.3) * 1.6, by = H * fy + Math.sin(t * 1.9 + i) * 1.4, r = H * 0.017;
        ctx.strokeStyle = 'rgba(240,230,240,0.55)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(x, ty); ctx.quadraticCurveTo((x + bx) / 2, (ty + by) / 2 + 3, bx, by + r * 1.1); ctx.stroke();
        const g = ctx.createRadialGradient(bx - r * 0.35, by - r * 0.4, 0, bx, by, r * 1.1); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.25, col); g.addColorStop(1, 'rgba(40,0,40,0.9)');
        ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(bx, by, r * 0.86, r, 0, 0, PI * 2); ctx.fill();
        ctx.fillStyle = g; ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.ellipse(bx, by, r * 0.86, r, 0, 0, PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      }); }
    // Popcorn popping in the cart's glass box
    { const x = W * CART[0], base = H * CART[1], w = W * 0.075, h = H * 0.060, gy0 = base - h * 1.55, gh = h * 0.80;
      for (let k = 0; k < 8; k++) { const u = ((t * 1.7 + k * 0.37) % 1), px = x - w * 0.36 + w * 0.72 * ((k * 0.618) % 1), py = gy0 + gh * 0.50 - Math.sin(u * PI) * gh * 0.38;
        ctx.fillStyle = 'rgba(255,250,225,0.95)'; ctx.beginPath(); ctx.arc(px, py, 1.3, 0, PI * 2); ctx.fill(); } }
    // Wisps of sweet steam off the candy-floss stall
    { const sx = W * 0.634, sy = H * 0.545;
      for (let i = 0; i < 4; i++) { const life = (t * 0.4 + i / 4) % 1; ctx.fillStyle = `rgba(255,220,240,${(0.18 * Math.sin(life * PI)).toFixed(3)})`; ctx.beginPath(); ctx.arc(sx + Math.sin(life * 4 + i) * 3, sy - life * H * 0.07, 2 + life * 5, 0, PI * 2); ctx.fill(); } }
  }

  // ════════ PAINT — back → far ambient → mid → festoons → props → cup → front ambient → haze ════════
  // (canvas passed in)
  const ctx = cvs.getContext('2d');
  const SCRATCH = document.createElement('canvas').getContext('2d');
  const mk = () => { const c = document.createElement('canvas'); c.width = 620; c.height = 355; return c; };
  const back = mk(), mid = mk(), front = mk();
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function paintBase() {
    [[back, 'back'], [mid, 'mid'], [front, 'front']].forEach(([c, part]) => { const g = c.getContext('2d'); g.clearRect(0, 0, 620, 355); draw(g, 620, 355, part); });
  }
  function frame(ms) {
    const t = reduceMotion ? 0 : ms / 1000;
    ctx.clearRect(0, 0, 620, 355);
    ctx.drawImage(back, 0, 0);
    drawAmbientFar(ctx, 620, 355, t);
    ctx.drawImage(mid, 0, 0);
    drawAmbientMid(ctx, 620, 355, t);
    ctx.drawImage(front, 0, 0);
    drawTrophy(ctx, 620, 355, (t / TURN_SECONDS) * PI * 2, t);
    drawAmbientFront(ctx, 620, 355, t);
    drawAtmos(ctx, 620, 355);
  }
  function loop(ms) { if (!__running) return; __elapsed = ms - __t0; __frame(__elapsed); requestAnimationFrame(loop); }
  paintBase(); __frame(0);
  let repainted = false;
  const repaint = () => { if (!repainted) { repainted = true; paintBase(); __frame(__elapsed); } };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(repaint).catch(() => {});
  setTimeout(repaint, 2000);
  return {
    start() { if (__running) return; if (reduceMotion) { __frame(0); return; } __running = true; __t0 = performance.now() - __elapsed; requestAnimationFrame(loop); },
    stop() { __running = false; },
  };
}
function makeLeagueArt_ecl(cvs) {
  let __running = false, __t0 = 0, __elapsed = 0;
  // Soft fade at the foot of the art so it melts into the card's info panel
  function __fade() {
    const g = ctx.createLinearGradient(0, 355 * 0.78, 0, 355);
    g.addColorStop(0, 'rgba(8,8,18,0)'); g.addColorStop(1, 'rgba(8,8,18,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 355 * 0.78, 620, 355 * 0.22);
  }
  function __frame(ms) { frame(ms); __fade(); }
  const PI = Math.PI;
  // Shared schedule for the "moments" (seconds into SHOW), staggered so they never all stop together:
  // bus crosses the bridge 0.6–8.6 · rowing eight 1.5–10.0 · lamps come on 3.0–7.0 · bridge lifts for a tall ship 9.4–19.8 ·
  // the clock tower chimes 12.0–15.0 · pigeons sweep over the river 15.6–19.4 · lamps fade for the loop 20.8–21.9.
  // The cruiser (46s), police launch (29s), swans (83s), the Eye (60s) and the cup (9s) run on their own cycles.
  const SHOW = 22, BUS = [0.6, 8.6], ROWERS = [1.5, 10.0], CHIME = [12.0, 15.0], PIGEONS = [15.6, 19.4], BRIDGE = [9.4, 19.8];
  const LAMPS_ON = [3.0, 7.0], LAMPS_OFF = [20.8, 21.9];
  const BRIDGE_X = [0.065, 0.215], BRIDGE_TW = 0.046, BRIDGE_DECK = 0.372;
  const win = (m, [a, b]) => { const f = (m - a) / (b - a); return f > 0 && f < 1 ? f : -1; };

  function draw(ctxReal, W, H, part) {
    // part 'back' paints sky→river; part 'front' paints the embankment onwards on a transparent layer.
    // Both run the same code so the random details stay identical; the unused half goes to a scratch canvas.
    let ctx = part === 'sky' ? ctxReal : SCRATCH;      // sky → (the Eye, drawn each frame) → back → front
    let seed = 19;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const VX = W * 0.5;
    const VY = H * 0.440;                     // far bank waterline
    const WALL = H * 0.590;                   // top of the embankment wall
    const FONT = (wt, px) => `${wt} ${px}px 'Barlow Condensed', 'Arial Narrow', sans-serif`;
    const SIL = '#2c2442', SIL2 = '#3a2e52', RIM = 'rgba(255,175,110,0.55)';
    function limb(x1, y1, x2, y2, w, col) {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    function glow(x, y, r, col) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
      ctx.restore();
    }

    // ════════ SKY — golden hour over the Thames ════════
    const sky = ctx.createLinearGradient(0, 0, 0, VY);
    sky.addColorStop(0, '#22336e'); sky.addColorStop(0.35, '#6a4e8e');
    sky.addColorStop(0.68, '#e6806a'); sky.addColorStop(1, '#ffd08a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, VY + 2);
    // Low sun sitting on the skyline, straight down the river
    const sunX = W * 0.535, sunY = H * 0.405;
    const sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, W * 0.45);
    sg.addColorStop(0, 'rgba(255,245,200,1)'); sg.addColorStop(0.05, 'rgba(255,225,150,0.95)');
    sg.addColorStop(0.18, 'rgba(255,170,100,0.45)'); sg.addColorStop(1, 'rgba(255,150,100,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, VY);
    // Streaky sunset clouds lit from beneath
    [[0.20, 0.10, 0.34, 0.016], [0.72, 0.07, 0.30, 0.014], [0.50, 0.19, 0.42, 0.012], [0.86, 0.23, 0.22, 0.010], [0.10, 0.25, 0.20, 0.010]].forEach(([cx, cy, cw, ch]) => {
      const g = ctx.createLinearGradient(W * (cx - cw / 2), 0, W * (cx + cw / 2), 0);
      g.addColorStop(0, 'rgba(255,170,140,0)'); g.addColorStop(0.5, 'rgba(255,190,150,0.55)'); g.addColorStop(1, 'rgba(255,170,140,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(W * cx, H * cy, W * cw / 2, H * ch, 0, 0, PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(120,70,120,0.25)'; ctx.beginPath(); ctx.ellipse(W * cx, H * cy - H * ch * 0.5, W * cw / 2.4, H * ch * 0.5, 0, 0, PI * 2); ctx.fill();
    });
    for (let i = 0; i < 18; i++) { ctx.fillStyle = `rgba(255,255,255,${0.3 + rnd() * 0.4})`; ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H * 0.09, 0.5 + rnd() * 0.5, 0, PI * 2); ctx.fill(); }

    // ════════ SKYLINE ════════
    // Distant city band
    ctx.fillStyle = '#5a4466';
    ctx.beginPath(); ctx.moveTo(0, VY);
    for (let x = 0; x <= W; x += 7) ctx.lineTo(x, VY - H * (0.020 + rnd() * 0.035));
    ctx.lineTo(W, VY); ctx.closePath(); ctx.fill();
    // The glass shard in the distance, catching the sun
    {
      const x = W * 0.280, top = H * 0.130;
      const g = ctx.createLinearGradient(x - W * 0.03, 0, x + W * 0.03, 0);
      g.addColorStop(0, '#8a6a8a'); g.addColorStop(0.5, '#f0b890'); g.addColorStop(1, '#5a4466');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x - W * 0.032, VY); ctx.lineTo(x - W * 0.004, top); ctx.lineTo(x + W * 0.006, top + H * 0.02); ctx.lineTo(x + W * 0.030, VY); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 0.25; ctx.fillStyle = '#ffffff';
      for (let y = top + 10; y < VY; y += 5) ctx.fillRect(x - W * 0.03 * (y - top) / (VY - top), y, W * 0.058 * (y - top) / (VY - top), 0.5);
      ctx.globalAlpha = 1;
      glow(x - W * 0.002, top, 6, 'rgba(255,90,90,0.9)');   // aircraft warning light
    }
    // (The observation wheel sits here in depth; it's drawn every frame by drawEye so it can turn.)
    ctx = part === 'back' ? ctxReal : SCRATCH;
    // Parliament: a long Gothic river front with spiky pinnacles
    {
      const x0 = W * 0.800, x1 = W * 1.02, top = H * 0.345;
      ctx.fillStyle = SIL2; ctx.fillRect(x0, top, x1 - x0, VY - top);
      for (let x = x0; x < x1; x += 6) {
        ctx.fillStyle = SIL2;
        ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + 1.2, top - 6 - ((x / 6) % 3 === 0 ? 4 : 0)); ctx.lineTo(x + 2.4, top); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 3, top + 2, 1, VY - top - 2);
      }
      ctx.fillStyle = RIM; ctx.fillRect(x0, top, x1 - x0, 1);
      for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(255,210,130,0.75)'; ctx.fillRect(x0 + rnd() * (x1 - x0), top + 5 + rnd() * (VY - top - 8), 1.2, 1.6); }
    }
    // The clock tower — tall, gothic, clock faces glowing
    {
      const x = W * 0.928, base = VY, w = W * 0.034, shaftTop = H * 0.165;
      const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
      g.addColorStop(0, '#5a4466'); g.addColorStop(0.35, SIL2); g.addColorStop(1, SIL);
      ctx.fillStyle = g; ctx.fillRect(x - w / 2, shaftTop, w, base - shaftTop);
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; for (let k = 0; k < 6; k++) ctx.fillRect(x - w / 2 + w * (k + 0.5) / 6, shaftTop + 8, 0.7, base - shaftTop - 8);
      ctx.fillStyle = RIM; ctx.fillRect(x - w / 2, shaftTop, 1.2, base - shaftTop);
      // Clock stage
      const cTop = H * 0.112;
      ctx.fillStyle = SIL2; ctx.fillRect(x - w * 0.62, cTop, w * 1.24, shaftTop - cTop + 3);
      ctx.fillStyle = RIM; ctx.fillRect(x - w * 0.62, cTop, 1.2, shaftTop - cTop + 3);
      const cy = cTop + (shaftTop - cTop) * 0.52, cr = w * 0.44;
      glow(x, cy, cr * 4, 'rgba(255,220,140,0.55)');
      ctx.fillStyle = '#fff0c0'; ctx.beginPath(); ctx.arc(x, cy, cr, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = '#2c2442'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(x, cy, cr, 0, PI * 2); ctx.stroke();
      limb(x, cy, x, cy - cr * 0.75, 0.9, '#2c2442'); limb(x, cy, x + cr * 0.45, cy + cr * 0.30, 0.9, '#2c2442');
      // Belfry + spire
      const bTop = H * 0.080;
      ctx.fillStyle = SIL2; ctx.fillRect(x - w * 0.52, bTop, w * 1.04, cTop - bTop);
      ctx.fillStyle = 'rgba(255,200,120,0.6)'; [-0.25, 0.05].forEach(o => ctx.fillRect(x + o * w, bTop + 3, w * 0.18, cTop - bTop - 5));
      ctx.fillStyle = SIL2;
      ctx.beginPath(); ctx.moveTo(x - w * 0.58, bTop); ctx.lineTo(x, H * 0.015); ctx.lineTo(x + w * 0.58, bTop); ctx.closePath(); ctx.fill();
      ctx.fillStyle = RIM; ctx.beginPath(); ctx.moveTo(x - w * 0.58, bTop); ctx.lineTo(x, H * 0.015); ctx.lineTo(x - w * 0.50, bTop); ctx.closePath(); ctx.fill();
      [-0.62, 0.62].forEach(o => { ctx.fillStyle = SIL2; ctx.beginPath(); ctx.moveTo(x + o * w - 1.5, cTop); ctx.lineTo(x + o * w, cTop - 8); ctx.lineTo(x + o * w + 1.5, cTop); ctx.closePath(); ctx.fill(); });
    }
    // The great bascule bridge on the left: two towers, high walkways, suspension chains, a red bus crossing
    {
      const deck = H * 0.372, towers = [W * 0.065, W * 0.215], tw = W * 0.046, tTop = H * 0.135;
      // Suspension chains, outer spans
      ctx.strokeStyle = '#5a7aa8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(towers[0] - tw / 2, tTop + H * 0.06); ctx.quadraticCurveTo(towers[0] - W * 0.10, deck - H * 0.01, -W * 0.02, deck - H * 0.03); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(towers[1] + tw / 2, tTop + H * 0.06); ctx.quadraticCurveTo(towers[1] + W * 0.04, deck - H * 0.01, W * 0.304, deck - H * 0.024); ctx.stroke();
      ctx.strokeStyle = 'rgba(90,122,168,0.6)'; ctx.lineWidth = 0.5;
      for (let k = 1; k < 7; k++) {
        const x = towers[1] + tw / 2 + (W * 0.300 - towers[1] - tw / 2) * k / 7;
        ctx.beginPath(); ctx.moveTo(x, tTop + H * 0.06 + (deck - tTop - H * 0.06) * Math.pow(k / 7, 0.7) * 0.9); ctx.lineTo(x, deck); ctx.stroke();
      }
      // Road deck
      const gapL = towers[0] + tw / 2, gapR = towers[1] - tw / 2;          // the bascule leaves between them are animated
      ctx.fillStyle = '#4a5a80'; ctx.fillRect(-W * 0.02, deck, gapL + W * 0.02, H * 0.014); ctx.fillRect(gapR, deck, W * 0.302 - gapR, H * 0.014);
      ctx.fillStyle = 'rgba(255,200,140,0.5)'; ctx.fillRect(-W * 0.02, deck, gapL + W * 0.02, 0.9); ctx.fillRect(gapR, deck, W * 0.302 - gapR, 0.9);
      // South-bank abutment: the road lands on a granite pier with a gatehouse, and the chain anchors into it
      {
        const ax0 = W * 0.300, ax1 = W * 0.352, aTop = deck - H * 0.022;
        const ag = ctx.createLinearGradient(ax0, 0, ax1, 0);
        ag.addColorStop(0, '#6a5470'); ag.addColorStop(0.45, SIL2); ag.addColorStop(1, SIL);
        ctx.fillStyle = ag; ctx.fillRect(ax0, aTop, ax1 - ax0, VY - aTop);
        ctx.fillStyle = RIM; ctx.fillRect(ax0, aTop, 1.2, VY - aTop);
        ctx.fillStyle = 'rgba(0,0,0,0.20)'; for (let y = aTop + 4; y < VY; y += 4) ctx.fillRect(ax0, y, ax1 - ax0, 0.6);   // stone courses
        // Battlemented parapet and a squat gatehouse turret
        for (let x = ax0; x < ax1 - 2; x += 4) { ctx.fillStyle = SIL2; ctx.fillRect(x, aTop - 3, 2.4, 3); }
        ctx.fillStyle = SIL2; ctx.fillRect(ax0 + W * 0.008, aTop - H * 0.040, W * 0.020, H * 0.040);
        ctx.beginPath(); ctx.moveTo(ax0 + W * 0.006, aTop - H * 0.040); ctx.lineTo(ax0 + W * 0.018, aTop - H * 0.062); ctx.lineTo(ax0 + W * 0.030, aTop - H * 0.040); ctx.closePath(); ctx.fill();
        ctx.fillStyle = RIM; ctx.fillRect(ax0 + W * 0.008, aTop - H * 0.040, 1, H * 0.040);
        ctx.fillStyle = 'rgba(255,200,130,0.7)'; ctx.fillRect(ax0 + W * 0.016, aTop - H * 0.030, 2.5, 4);
        // Road disappearing into the arch through the pier
        ctx.fillStyle = '#1e1a30';
        ctx.beginPath(); ctx.moveTo(ax0, deck + H * 0.014); ctx.lineTo(ax0, deck - H * 0.004); ctx.quadraticCurveTo(ax0 + W * 0.006, deck - H * 0.016, ax0 + W * 0.014, deck - H * 0.016); ctx.lineTo(ax0 + W * 0.014, deck + H * 0.014); ctx.closePath(); ctx.fill();
        glow(ax0 + W * 0.007, deck - H * 0.002, 6, 'rgba(255,200,130,0.6)');
      }
      // High-level walkways between the towers
      [tTop + H * 0.040, tTop + H * 0.062].forEach(y => {
        ctx.fillStyle = '#5a7aa8'; ctx.fillRect(towers[0], y, towers[1] - towers[0], H * 0.014);
        ctx.strokeStyle = 'rgba(30,40,70,0.6)'; ctx.lineWidth = 0.5;
        for (let x = towers[0]; x < towers[1]; x += 4) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 4, y + H * 0.014); ctx.stroke(); }
      });
      // Towers
      towers.forEach(tx => {
        const g = ctx.createLinearGradient(tx - tw / 2, 0, tx + tw / 2, 0);
        g.addColorStop(0, '#6a5470'); g.addColorStop(0.4, SIL2); g.addColorStop(1, SIL);
        ctx.fillStyle = g; ctx.fillRect(tx - tw / 2, tTop, tw, VY - tTop);
        ctx.fillStyle = RIM; ctx.fillRect(tx - tw / 2, tTop, 1.2, VY - tTop);
        // Arched windows and the big arch the road passes through
        ctx.fillStyle = 'rgba(255,200,130,0.65)';
        [0.18, 0.40].forEach(f => [-0.22, 0.22].forEach(o => ctx.fillRect(tx + o * tw - 1.5, tTop + (deck - tTop) * f, 3, 6)));
        ctx.fillStyle = '#1e1a30';
        ctx.beginPath(); ctx.moveTo(tx - tw * 0.30, deck + H * 0.014); ctx.lineTo(tx - tw * 0.30, deck - H * 0.03); ctx.arc(tx, deck - H * 0.03, tw * 0.30, PI, 0); ctx.lineTo(tx + tw * 0.30, deck + H * 0.014); ctx.closePath(); ctx.fill();
        // Pyramid roof, corner turrets, gilded finial
        ctx.fillStyle = SIL2;
        ctx.beginPath(); ctx.moveTo(tx - tw * 0.55, tTop); ctx.lineTo(tx, tTop - H * 0.060); ctx.lineTo(tx + tw * 0.55, tTop); ctx.closePath(); ctx.fill();
        ctx.fillStyle = RIM; ctx.beginPath(); ctx.moveTo(tx - tw * 0.55, tTop); ctx.lineTo(tx, tTop - H * 0.060); ctx.lineTo(tx - tw * 0.45, tTop); ctx.closePath(); ctx.fill();
        [-0.5, 0.5].forEach(o => {
          ctx.fillStyle = SIL2; ctx.fillRect(tx + o * tw - 2.5, tTop - H * 0.012, 5, H * 0.012);
          ctx.beginPath(); ctx.moveTo(tx + o * tw - 3, tTop - H * 0.012); ctx.lineTo(tx + o * tw, tTop - H * 0.040); ctx.lineTo(tx + o * tw + 3, tTop - H * 0.012); ctx.closePath(); ctx.fill();
        });
        glow(tx, tTop - H * 0.062, 5, 'rgba(255,215,120,0.9)');
      });
      // String of lights along the deck
      for (let k = 0; k < 14; k++) { const x = W * 0.01 + W * 0.285 * k / 13; if (x > gapL && x < gapR) continue; glow(x, deck - 1.5, 3, 'rgba(255,220,150,0.7)'); }
    }

    // ════════ THE THAMES ════════
    const river = ctx.createLinearGradient(0, VY, 0, WALL);
    river.addColorStop(0, '#9a6a7a'); river.addColorStop(0.4, '#5a4a72'); river.addColorStop(1, '#2c2a4a');
    ctx.fillStyle = river; ctx.fillRect(0, VY, W, WALL - VY);
    // Sun's golden path down the river
    for (let i = 0; i < 200; i++) {
      const t = rnd(), y = VY + 1 + t * (WALL - VY - 2);
      const spread = W * 0.015 + t * W * 0.12, x = sunX + (rnd() - 0.5) * spread * (0.6 + rnd());
      ctx.fillStyle = `rgba(255,${200 + Math.floor(rnd() * 40)},140,${0.45 + rnd() * 0.5})`;
      ctx.fillRect(x, y, 2 + rnd() * 5 * (0.4 + t), 1);
    }
    // Light reflections wobbling under the clock tower, bridge and wheel
    [[0.928, 'rgba(255,220,140,0.55)'], [0.065, 'rgba(255,200,140,0.40)'], [0.215, 'rgba(255,200,140,0.40)'], [0.775, 'rgba(140,200,255,0.35)']].forEach(([rx, col]) => {
      for (let y = VY + 2; y < WALL - 2; y += 2.2) {
        ctx.fillStyle = col; const w = 2 + rnd() * 4;
        ctx.fillRect(W * rx - w / 2 + Math.sin(y * 0.7) * 2, y, w, 0.9);
      }
    });
    // Ripples
    ctx.strokeStyle = 'rgba(255,220,200,0.12)'; ctx.lineWidth = 0.6;
    for (let y = VY + 3; y < WALL; y += 3 + (y - VY) * 0.06) { ctx.beginPath(); for (let x = 0; x <= W; x += 8) ctx.lineTo(x, y + Math.sin(x * 0.08 + y) * 0.8); ctx.stroke(); }

    if (part === 'back' || part === 'sky') return;
    ctx = part === 'front' ? ctxReal : SCRATCH;

    // ════════ EMBANKMENT — stone balustrade, lamp standards, bunting ════════
    {
      const wallTop = WALL - H * 0.010;
      const wg = ctx.createLinearGradient(0, wallTop, 0, WALL + H * 0.040);
      wg.addColorStop(0, '#d8bca0'); wg.addColorStop(1, '#8a7488');
      ctx.fillStyle = wg; ctx.fillRect(0, wallTop, W, H * 0.050);
      ctx.fillStyle = '#e8d0b0'; ctx.fillRect(0, wallTop, W, 2.5);                                   // sunlit coping
      for (let x = 2; x < W; x += 7) { ctx.fillStyle = 'rgba(60,40,60,0.45)'; ctx.fillRect(x, wallTop + 4, 3.2, H * 0.024); ctx.fillStyle = 'rgba(255,220,180,0.25)'; ctx.fillRect(x, wallTop + 4, 1, H * 0.024); }   // balusters
      ctx.fillStyle = '#c8ac90'; ctx.fillRect(0, wallTop + 4 + H * 0.024, W, 2);
    }
    // Promenade paving
    const PAVE = WALL + H * 0.040;
    const pg = ctx.createLinearGradient(0, PAVE, 0, H);
    pg.addColorStop(0, '#b89a8a'); pg.addColorStop(0.5, '#8a7280'); pg.addColorStop(1, '#5a4c62');
    ctx.fillStyle = pg; ctx.fillRect(0, PAVE, W, H - PAVE);
    ctx.strokeStyle = 'rgba(40,30,50,0.30)'; ctx.lineWidth = 0.7;
    for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(VX + i * W * 0.05, PAVE); ctx.lineTo(VX + i * W * 0.22, H); ctx.stroke(); }
    for (let y = PAVE + 3, st = 4; y < H; y += st, st *= 1.25) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // Warm sunlight raking across the stones toward us
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const rake = ctx.createRadialGradient(sunX, PAVE, 0, sunX, PAVE, W * 0.5);
    rake.addColorStop(0, 'rgba(255,170,90,0.30)'); rake.addColorStop(1, 'rgba(255,170,90,0)');
    ctx.fillStyle = rake; ctx.fillRect(0, PAVE, W, H - PAVE);
    ctx.restore();
    // Lamp standards with glowing globes, St George bunting strung between
    const lamps = [W * 0.05, W * 0.27, W * 0.73, W * 0.95];
    lamps.forEach(lx => {
      const base = PAVE + H * 0.004, top = H * 0.425;
      ctx.fillStyle = 'rgba(30,20,40,0.35)'; ctx.beginPath(); ctx.ellipse(lx, base, 6, 1.5, 0, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#1e3a30'; ctx.fillRect(lx - 4, base - H * 0.03, 8, H * 0.03);
      limb(lx, base - H * 0.03, lx, top + 6, 2.6, '#1e3a30');
      ctx.fillStyle = '#c8a040'; ctx.fillRect(lx - 2.2, base - H * 0.12, 4.4, 2);
      ctx.fillStyle = '#1e3a30'; ctx.fillRect(lx - 3, top + 4, 6, 3);
      ctx.fillStyle = '#1e3a30'; ctx.fillRect(lx - 1, top - 6, 2, 2.5);      // (the globe itself is drawn each frame)
    });
    // (St George bunting between the lamps is drawn each frame so it can flutter.)
    if (part === 'front') return;

    ctx = ctxReal;
    // Red telephone box on the left of the promenade (bigger, closer to us)
    {
      const x = W * 0.128, base = H * 0.712, w = W * 0.066, h = H * 0.268;
      ctx.fillStyle = 'rgba(30,20,40,0.35)'; ctx.beginPath(); ctx.moveTo(x - w / 2, base); ctx.lineTo(x + w / 2, base); ctx.lineTo(x + w * 0.2, base + H * 0.06); ctx.lineTo(x - w * 0.9, base + H * 0.06); ctx.closePath(); ctx.fill();
      const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
      g.addColorStop(0, '#e8443a'); g.addColorStop(0.5, '#cc2a24'); g.addColorStop(1, '#8a1a1a');
      ctx.fillStyle = g; ctx.fillRect(x - w / 2, base - h, w, h);
      // Domed roof
      ctx.beginPath(); ctx.moveTo(x - w * 0.56, base - h); ctx.quadraticCurveTo(x, base - h - h * 0.12, x + w * 0.56, base - h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#b02420'; ctx.fillRect(x - w * 0.56, base - h, w * 1.12, 2.5);
      // Sign strip
      ctx.fillStyle = '#1a1414'; ctx.fillRect(x - w * 0.42, base - h + h * 0.04, w * 0.84, h * 0.06);
      ctx.save(); ctx.fillStyle = '#fff6e0'; ctx.font = FONT(800, h * 0.045); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('TELEPHONE', x, base - h + h * 0.072, w * 0.8); ctx.restore();
      // Glazed door: 8 rows x 3 panes, warm light inside
      const gx0 = x - w * 0.36, gx1 = x + w * 0.36, gy0 = base - h + h * 0.14, gy1 = base - h * 0.12;
      glow(x, (gy0 + gy1) / 2, w * 1.2, 'rgba(255,210,140,0.35)');
      ctx.fillStyle = 'rgba(255,225,170,0.75)'; ctx.fillRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
      ctx.strokeStyle = '#b02420'; ctx.lineWidth = 1.2;
      for (let r = 0; r <= 8; r++) { const y = gy0 + (gy1 - gy0) * r / 8; ctx.beginPath(); ctx.moveTo(gx0, y); ctx.lineTo(gx1, y); ctx.stroke(); }
      for (let c = 0; c <= 3; c++) { const xx = gx0 + (gx1 - gx0) * c / 3; ctx.beginPath(); ctx.moveTo(xx, gy0); ctx.lineTo(xx, gy1); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x - w / 2, base - h, 2, h);
    }

    // ════════ HERO — stumps and ball beside the plinth (the cup itself is drawn each frame) ════════
    {
      // --- Stumps, moved to the right ---
      const sx = W * 0.665, base = H * 0.700, sh = H * 0.165, top = base - sh;
      const gap = W * 0.021, r = W * 0.0058;
      const shg = ctx.createLinearGradient(0, base, 0, base + H * 0.10);
      shg.addColorStop(0, 'rgba(30,20,40,0.45)'); shg.addColorStop(1, 'rgba(30,20,40,0)');
      ctx.fillStyle = shg;
      ctx.beginPath(); ctx.moveTo(sx - gap * 1.2, base); ctx.lineTo(sx + gap * 1.2, base); ctx.lineTo(sx + gap * 1.8, base + H * 0.10); ctx.lineTo(sx - gap * 1.8, base + H * 0.10); ctx.closePath(); ctx.fill();
      [-gap, 0, gap].forEach(dx => {
        const x = sx + dx;
        const g = ctx.createLinearGradient(x - r, 0, x + r, 0);
        g.addColorStop(0, '#ffd8a0'); g.addColorStop(0.3, '#f8e2b8'); g.addColorStop(0.65, '#c89060'); g.addColorStop(1, '#7a4a28');
        ctx.fillStyle = g; ctx.fillRect(x - r, top, r * 2, sh);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(x - r, top + sh * 0.18, r * 2, sh * 0.10);
        ctx.fillStyle = '#d0202a'; ctx.fillRect(x - r, top + sh * 0.21, r * 2, sh * 0.04);
        ctx.fillStyle = '#fff2d8'; ctx.beginPath(); ctx.ellipse(x, top, r, r * 0.55, 0, 0, PI * 2); ctx.fill();
        ctx.fillStyle = '#2a2436'; ctx.fillRect(x - r * 1.6, base - 2, r * 3.2, 3);
      });
      ctx.fillStyle = '#2a2436'; ctx.fillRect(sx - gap - r * 2, base - 1, gap * 2 + r * 4, 2);
      const bh = H * 0.009;
      [[sx - gap - r * 0.6, sx - r * 0.2], [sx + r * 0.2, sx + gap + r * 0.6]].forEach(([b0, b1]) => {
        const bg = ctx.createLinearGradient(0, top - bh, 0, top + 1);
        bg.addColorStop(0, '#fff6e2'); bg.addColorStop(1, '#b08048');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(b0, top - bh * 0.8, b1 - b0, bh, bh * 0.45); ctx.fill();
      });
      // Red ball, between the cup and the stumps
      const bx = W * 0.718, by = base - H * 0.010, br = H * 0.018;
      ctx.fillStyle = 'rgba(30,20,40,0.40)'; ctx.beginPath(); ctx.ellipse(bx, by + br + 1, br * 1.1, br * 0.25, 0, 0, PI * 2); ctx.fill();
      const rg = ctx.createRadialGradient(bx - br * 0.25, by - br * 0.5, br * 0.1, bx, by, br);
      rg.addColorStop(0, '#ff8a6a'); rg.addColorStop(0.5, '#c81e1e'); rg.addColorStop(1, '#5a0a0a');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(bx, by, br, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,240,220,0.85)'; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.ellipse(bx, by, br * 0.30, br * 0.98, 0.35, 0, PI * 2); ctx.stroke();

    }


  }


  // Haze and vignette go over everything, the turning cup included
  function drawAtmos(ctx, W, H) {
    const VY = H * 0.440;
    // ════════ ATMOSPHERE ════════
    const haze = ctx.createLinearGradient(0, H * 0.30, 0, VY + H * 0.04);
    haze.addColorStop(0, 'rgba(255,190,140,0)'); haze.addColorStop(1, 'rgba(255,190,140,0.18)');
    ctx.fillStyle = haze; ctx.fillRect(0, H * 0.30, W, VY + H * 0.04 - H * 0.30);
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.42, W * 0.20, W * 0.5, H * 0.42, W * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(0.7, 'rgba(20,10,40,0.06)'); vig.addColorStop(1, 'rgba(20,10,40,0.30)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  }

  // ════════ THE BLAST CUP — drawn every frame, turning slowly on its plinth ════════
  // phi = turn angle (0 = St George shield facing us, handles at the sides); t = seconds, for twinkle
  function drawTrophy(ctx, W, H, phi, t) {
    const PI = Math.PI;
    const FONT = (wt, px) => `${wt} ${px}px 'Barlow Condensed', 'Arial Narrow', sans-serif`;
    const glow = (x, y, r, col) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    };
    const limb = (x1, y1, x2, y2, w, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    };
    const tx = W * 0.5, tb = H * 0.705, S = H * 0.390, K = 1.62;
    const TILT = 0.08;                     // we look down on it slightly: points nearer us sit lower
    ctx.save(); ctx.translate(tx, tb); ctx.scale(K, K); ctx.translate(-tx, -tb);

    // Light is fixed (the sunset behind and to the left), so silver gradients stay put in screen space
    const silver = (x0, x1) => {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, '#6a6a88'); g.addColorStop(0.12, '#ffe2b0'); g.addColorStop(0.30, '#fff6e8');
      g.addColorStop(0.48, '#d4d6e2'); g.addColorStop(0.68, '#7a7c9a'); g.addColorStop(0.86, '#c0c2d4'); g.addColorStop(1, '#4a4a68');
      return g;
    };
    glow(tx, tb - S * 0.62, W * 0.24, 'rgba(255,190,110,0.45)');
    glow(tx, tb - S * 0.62, W * 0.10, 'rgba(255,230,170,0.40)');
    const shg = ctx.createLinearGradient(0, tb, 0, tb + H * 0.10);
    shg.addColorStop(0, 'rgba(30,20,40,0.45)'); shg.addColorStop(1, 'rgba(30,20,40,0)');
    ctx.fillStyle = shg;
    ctx.beginPath(); ctx.moveTo(tx - W * 0.06, tb); ctx.lineTo(tx + W * 0.06, tb); ctx.lineTo(tx + W * 0.09, tb + H * 0.12); ctx.lineTo(tx - W * 0.09, tb + H * 0.12); ctx.closePath(); ctx.fill();

    // ── Plinth (stays still; the cup turns on a silver turntable plate on top) ──
    const pB = tb, pH = S * 0.22, pW = W * 0.068;
    const wd = ctx.createLinearGradient(tx - pW, 0, tx + pW, 0);
    wd.addColorStop(0, '#7a4428'); wd.addColorStop(0.35, '#4a2414'); wd.addColorStop(1, '#1a0c06');
    ctx.fillStyle = wd; ctx.beginPath(); ctx.roundRect(tx - pW, pB - pH, pW * 2, pH, 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,200,150,0.35)'; ctx.fillRect(tx - pW, pB - pH, pW * 2, 1.2);
    ctx.fillStyle = '#f6f2ea'; ctx.fillRect(tx - pW, pB - pH * 0.80, pW * 2, pH * 0.07);
    ctx.fillStyle = '#d0202a'; ctx.fillRect(tx - pW, pB - pH * 0.73, pW * 2, pH * 0.07);
    const plate = ctx.createLinearGradient(0, pB - pH * 0.55, 0, pB - pH * 0.12);
    plate.addColorStop(0, '#f6dc90'); plate.addColorStop(1, '#a8803a');
    ctx.fillStyle = plate; ctx.beginPath(); ctx.roundRect(tx - pW * 0.66, pB - pH * 0.56, pW * 1.32, pH * 0.42, 2); ctx.fill();
    ctx.save(); ctx.fillStyle = '#3a2408'; ctx.font = FONT(900, pH * 0.20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('THE BLAST CUP', tx, pB - pH * 0.42, pW * 1.2);
    ctx.font = FONT(700, pH * 0.13); ctx.fillText('ENGLAND CRICKET LEAGUE', tx, pB - pH * 0.24, pW * 1.2); ctx.restore();
    const p2W = pW * 0.74, p2H = pH * 0.30;
    ctx.fillStyle = wd; ctx.beginPath(); ctx.roundRect(tx - p2W, pB - pH - p2H, p2W * 2, p2H, 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,200,150,0.35)'; ctx.fillRect(tx - p2W, pB - pH - p2H, p2W * 2, 1.2);

    // ── Foot, stem, knop ──
    const footY = pB - pH - p2H, footW = W * 0.042;
    ctx.fillStyle = silver(tx - footW, tx + footW);
    ctx.beginPath(); ctx.ellipse(tx, footY, footW, S * 0.016, 0, PI, PI * 2); ctx.fill();
    ctx.fillRect(tx - footW, footY - S * 0.012, footW * 2, S * 0.012);
    const stemTop = footY - S * 0.20;
    ctx.beginPath(); ctx.moveTo(tx - footW * 0.85, footY - S * 0.012);
    ctx.bezierCurveTo(tx - footW * 0.25, footY - S * 0.03, tx - footW * 0.18, stemTop + S * 0.06, tx - footW * 0.22, stemTop);
    ctx.lineTo(tx + footW * 0.22, stemTop);
    ctx.bezierCurveTo(tx + footW * 0.18, stemTop + S * 0.06, tx + footW * 0.25, footY - S * 0.03, tx + footW * 0.85, footY - S * 0.012);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = silver(tx - footW * 0.45, tx + footW * 0.45);
    ctx.beginPath(); ctx.ellipse(tx, stemTop + S * 0.075, footW * 0.42, S * 0.018, 0, 0, PI * 2); ctx.fill();
    // Fluting on the foot dome, turning with the cup
    for (let k = 0; k < 16; k++) {
      const th = phi + k * PI / 8, c = Math.cos(th); if (c <= 0.05) continue;
      const s = Math.sin(th);
      ctx.strokeStyle = `rgba(60,60,90,${0.12 + 0.30 * c})`; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(tx + s * footW * 0.95, footY - S * 0.006 + c * footW * TILT); ctx.lineTo(tx + s * footW * 0.55, footY - S * 0.024 + c * footW * 0.55 * TILT); ctx.stroke();
    }

    // ── Bowl geometry: a cubic profile from rim to stem ──
    const rimY = stemTop - S * 0.31, cw = W * 0.060, bot = stemTop + S * 0.005, botR = footW * 0.22;
    const prof = (u) => {               // returns [radius, y] at parameter u (0 = rim, 1 = bottom)
      const a = (1 - u) ** 3, b = 3 * u * (1 - u) ** 2, c = 3 * u * u * (1 - u), d = u ** 3;
      return [a * cw + b * cw * 1.02 + c * cw * 0.55 + d * botR, a * rimY + b * (rimY + S * 0.18) + c * bot + d * bot];
    };
    const radiusAt = (y) => { let best = cw, bd = 1e9; for (let i = 0; i <= 60; i++) { const [r, yy] = prof(i / 60); const dd = Math.abs(yy - y); if (dd < bd) { bd = dd; best = r; } } return best; };

    // ── Handles + ribbons: each sits at angle phi ± 90° around the cup ──
    const handles = [
      { a: phi - PI / 2, ribbon: ['#d0202a', '#a8141c'] },
      { a: phi + PI / 2, ribbon: ['#f6f2ea', '#c8c2b8'] },
    ];
    const P = (r, y, a) => [tx + r * Math.sin(a), y + r * Math.cos(a) * TILT];
    function drawHandle(h) {
      const a = h.a, c = Math.cos(a), back = c < 0;
      const p0 = P(cw * 0.98, rimY + S * 0.035, a), p1 = P(cw * 1.75, rimY, a), p2 = P(cw * 1.70, rimY + S * 0.20, a), p3 = P(cw * 0.55, rimY + S * 0.22, a);
      ctx.lineCap = 'round';
      ctx.strokeStyle = silver(tx - cw * 1.8, tx + cw * 1.8); ctx.lineWidth = W * 0.008;
      ctx.beginPath(); ctx.moveTo(...p0); ctx.bezierCurveTo(...p1, ...p2, ...p3); ctx.stroke();
      if (back) { ctx.strokeStyle = 'rgba(30,25,50,0.35)'; ctx.stroke(); }
      // Ribbon tied at the outer curve, hanging straight down, turning edge-on as it passes the front
      const [hx, hy] = P(cw * 1.50, rimY + S * 0.085, a);
      let f = Math.sin(a); if (Math.abs(f) < 0.25) f = 0.25 * (f < 0 ? -1 : 1);
      ctx.fillStyle = h.ribbon[0];
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + f * W * 0.006, hy + S * 0.12, hx - f * W * 0.002, hy + S * 0.24);
      ctx.lineTo(hx + f * W * 0.008, hy + S * 0.21); ctx.lineTo(hx + f * W * 0.016, hy + S * 0.245);
      ctx.quadraticCurveTo(hx + f * W * 0.018, hy + S * 0.11, hx + f * W * 0.010, hy - S * 0.005); ctx.closePath(); ctx.fill();
      if (back) { ctx.fillStyle = 'rgba(30,25,50,0.30)'; ctx.fill(); }
      ctx.fillStyle = h.ribbon[1]; ctx.beginPath(); ctx.ellipse(hx + f * W * 0.005, hy, W * 0.008 * Math.max(0.4, Math.abs(f)), S * 0.015, 0, 0, PI * 2); ctx.fill();
    }
    handles.filter(h => Math.cos(h.a) < 0).forEach(drawHandle);

    // ── Bowl body ──
    ctx.fillStyle = silver(tx - cw, tx + cw);
    ctx.beginPath(); ctx.moveTo(tx - cw, rimY);
    ctx.bezierCurveTo(tx - cw * 1.02, rimY + S * 0.18, tx - cw * 0.55, bot, tx - botR, bot);
    ctx.lineTo(tx + botR, bot);
    ctx.bezierCurveTo(tx + cw * 0.55, bot, tx + cw * 1.02, rimY + S * 0.18, tx + cw, rimY);
    ctx.closePath(); ctx.fill();
    // Reflections: the bowl is a curved mirror, so the sunset sky, the dark skyline and the sun
    // wrap across it, bending down toward the edges. (A smooth round bowl's reflection doesn't move as it turns.)
    ctx.save();
    ctx.beginPath(); ctx.moveTo(tx - cw, rimY);
    ctx.bezierCurveTo(tx - cw * 1.02, rimY + S * 0.18, tx - cw * 0.55, bot, tx - botR, bot);
    ctx.lineTo(tx + botR, bot);
    ctx.bezierCurveTo(tx + cw * 0.55, bot, tx + cw * 1.02, rimY + S * 0.18, tx + cw, rimY);
    ctx.closePath(); ctx.clip();
    const yH = rimY + S * 0.135, bend = (x) => ((x - tx) / cw) ** 2 * S * 0.05;
    // Warm sunset band above the horizon
    ctx.fillStyle = 'rgba(255,165,105,0.32)';
    ctx.beginPath(); for (let x = tx - cw * 1.05; x <= tx + cw * 1.05; x += 2) ctx.lineTo(x, yH - S * 0.055 + bend(x));
    for (let x = tx + cw * 1.05; x >= tx - cw * 1.05; x -= 2) ctx.lineTo(x, yH + bend(x)); ctx.closePath(); ctx.fill();
    // Skyline silhouette: towers and spires squeezed toward the edges
    ctx.fillStyle = 'rgba(48,34,72,0.55)';
    ctx.beginPath(); ctx.moveTo(tx - cw * 1.05, yH + S * 0.03 + bend(tx - cw * 1.05));
    for (let x = tx - cw * 1.05; x <= tx + cw * 1.05; x += 1.5) {
      const u = (x - tx) / cw, sq = 1 - 0.55 * u * u;
      const bump = (Math.sin(u * 23.0) > 0.55 ? 0.026 : 0) + (Math.sin(u * 9.0 + 1) > 0.8 ? 0.040 : 0) + Math.abs(Math.sin(u * 41)) * 0.010;
      ctx.lineTo(x, yH + bend(x) - S * bump * sq);
    }
    ctx.lineTo(tx + cw * 1.05, yH + S * 0.03 + bend(tx + cw * 1.05));
    for (let x = tx + cw * 1.05; x >= tx - cw * 1.05; x -= 2) ctx.lineTo(x, yH + S * 0.03 + bend(x));
    ctx.closePath(); ctx.fill();
    // The promenade and river reflected darker underneath
    const lowG = ctx.createLinearGradient(0, yH + S * 0.03, 0, bot);
    lowG.addColorStop(0, 'rgba(60,40,80,0.30)'); lowG.addColorStop(1, 'rgba(60,40,80,0.05)');
    ctx.fillStyle = lowG; ctx.fillRect(tx - cw * 1.1, yH + S * 0.03, cw * 2.2, bot - yH);
    // The sun itself, a hot spot just left of centre
    const sunR = ctx.createRadialGradient(tx - cw * 0.22, yH - S * 0.02, 0, tx - cw * 0.22, yH - S * 0.02, cw * 0.30);
    sunR.addColorStop(0, 'rgba(255,250,225,0.60)'); sunR.addColorStop(0.35, 'rgba(255,210,140,0.28)'); sunR.addColorStop(1, 'rgba(255,200,140,0)');
    ctx.fillStyle = sunR; ctx.beginPath(); ctx.ellipse(tx - cw * 0.22, yH - S * 0.02, cw * 0.30, S * 0.05, 0, 0, PI * 2); ctx.fill();
    ctx.restore();

    // Gadrooning on the lower bowl: 16 vertical flutes that slide round as it turns
    for (let k = 0; k < 16; k++) {
      const th = phi + k * PI / 8 + PI / 16, c = Math.cos(th); if (c <= 0.04) continue;
      const s = Math.sin(th);
      ctx.strokeStyle = `rgba(55,55,85,${0.10 + 0.32 * c})`; ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let i = 0; i <= 10; i++) { const [r, y] = prof(0.52 + 0.46 * i / 10); const x = tx + r * s, yy = y + r * c * TILT; i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,250,235,${0.08 + 0.22 * c})`; ctx.lineWidth = 0.6;
      ctx.beginPath();
      for (let i = 0; i <= 10; i++) { const [r, y] = prof(0.52 + 0.46 * i / 10); const x = tx + r * Math.sin(th + 0.06), yy = y + r * c * TILT; i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
      ctx.stroke();
    }
    // Engraved band below the rim (round the whole cup, so it doesn't move)
    ctx.strokeStyle = 'rgba(80,80,110,0.55)'; ctx.lineWidth = 0.9;
    [0.06, 0.075].forEach(f => { ctx.beginPath(); ctx.moveTo(tx - cw * 0.98, rimY + S * f); ctx.quadraticCurveTo(tx, rimY + S * (f + 0.03), tx + cw * 0.98, rimY + S * f); ctx.stroke(); });

    // ── Emblems on the front and back of the bowl, foreshortened as they turn ──
    const ey = rimY + S * 0.165, er = radiusAt(ey) * 0.97, es = cw * 0.26;
    function emblem(a, drawFn) {
      const c = Math.cos(a); if (c <= 0) return;
      const x = tx + er * Math.sin(a), y = ey + er * c * TILT;
      ctx.save(); ctx.globalAlpha = Math.min(1, c * 3.5);
      ctx.translate(x, y); ctx.scale(c, 1);
      drawFn();
      ctx.restore();
    }
    emblem(phi, () => {                 // St George shield over crossed bats
      limb(-es * 1.15, es * 0.95, es * 1.15, -es * 0.95, es * 0.22, '#e8c070');
      limb(es * 1.15, es * 0.95, -es * 1.15, -es * 0.95, es * 0.22, '#e8c070');
      const shield = () => { ctx.beginPath(); ctx.moveTo(-es * 0.8, -es * 0.85); ctx.lineTo(es * 0.8, -es * 0.85); ctx.lineTo(es * 0.8, es * 0.05); ctx.quadraticCurveTo(es * 0.75, es * 0.75, 0, es * 1.05); ctx.quadraticCurveTo(-es * 0.75, es * 0.75, -es * 0.8, es * 0.05); ctx.closePath(); };
      ctx.fillStyle = '#f8f4ec'; shield(); ctx.fill();
      ctx.save(); shield(); ctx.clip();
      ctx.fillStyle = '#d0202a'; ctx.fillRect(-es * 0.16, -es, es * 0.32, es * 2.2); ctx.fillRect(-es, -es * 0.30, es * 2, es * 0.30);
      ctx.restore();
      ctx.strokeStyle = '#d8a838'; ctx.lineWidth = 1.2; shield(); ctx.stroke();
    });
    emblem(phi + PI, () => {            // Gold ECL roundel on the back
      const rr = es * 1.0;
      const g = ctx.createRadialGradient(-rr * 0.3, -rr * 0.3, 0, 0, 0, rr);
      g.addColorStop(0, '#fff0b0'); g.addColorStop(0.6, '#e0b038'); g.addColorStop(1, '#8a6010');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rr, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff4cc'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 0, rr * 0.82, 0, PI * 2); ctx.stroke();
      ctx.fillStyle = '#1a2a6a'; ctx.font = FONT(900, rr * 0.85); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ECL', 0, rr * 0.06);
    });

    // ── Rim, lid (with fluting that turns) and gold cricket-ball finial ──
    ctx.fillStyle = silver(tx - cw * 1.04, tx + cw * 1.04); ctx.beginPath(); ctx.ellipse(tx, rimY, cw * 1.04, S * 0.022, 0, 0, PI * 2); ctx.fill();
    ctx.fillStyle = '#3a3a58'; ctx.beginPath(); ctx.ellipse(tx, rimY, cw * 0.92, S * 0.014, 0, 0, PI * 2); ctx.fill();
    ctx.fillStyle = silver(tx - cw * 0.92, tx + cw * 0.92);
    ctx.beginPath(); ctx.moveTo(tx - cw * 0.92, rimY - S * 0.006); ctx.bezierCurveTo(tx - cw * 0.85, rimY - S * 0.11, tx + cw * 0.85, rimY - S * 0.11, tx + cw * 0.92, rimY - S * 0.006); ctx.closePath(); ctx.fill();
    for (let k = 0; k < 16; k++) {
      const th = phi + k * PI / 8, c = Math.cos(th); if (c <= 0.04) continue;
      const s = Math.sin(th);
      ctx.strokeStyle = `rgba(55,55,85,${0.10 + 0.30 * c})`; ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (let i = 0; i <= 8; i++) { const v = 0.08 + 0.80 * i / 8, r = cw * 0.90 * Math.sqrt(1 - v * v), y = rimY - S * 0.008 - S * 0.074 * Math.sin(v * PI / 2) + r * c * TILT * 0.5; const x = tx + r * s; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }
    ctx.fillStyle = silver(tx - cw * 0.2, tx + cw * 0.2); ctx.fillRect(tx - cw * 0.10, rimY - S * 0.11, cw * 0.20, S * 0.03);
    const fy = rimY - S * 0.145, fr = cw * 0.26;
    const fg = ctx.createRadialGradient(tx - fr * 0.35, fy - fr * 0.4, 0, tx, fy, fr);
    fg.addColorStop(0, '#fff2b8'); fg.addColorStop(0.55, '#e0b038'); fg.addColorStop(1, '#8a6010');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(tx, fy, fr, 0, PI * 2); ctx.fill();
    // The ball's seam is a great circle, so it swings round as the cup turns
    { ctx.save(); ctx.beginPath(); ctx.arc(tx, fy, fr, 0, PI * 2); ctx.clip();
      const cp = Math.cos(phi), sp = Math.sin(phi), EL = 0.30, ce = Math.cos(EL), se = Math.sin(EL);
      const turn = ([X, Y, Z]) => { const x = X * cp + Z * sp, z = Z * cp - X * sp; return [x, Y * ce - z * se, z * ce + Y * se]; };
      const ring = (off) => (u) => { const k = Math.sqrt(1 - off * off); return [off, Math.sin(u) * k, Math.cos(u) * k]; };
      const curve = (fn, col, lw) => { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; let prev = null;
        for (let k = 0; k <= 90; k++) { const [X, Y, Z] = turn(fn(k / 90 * PI * 2)), pt = [tx + X * fr, fy - Y * fr];
          if (Z > 0 && prev) { ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(pt[0], pt[1]); ctx.stroke(); } prev = Z > 0 ? pt : null; } };
      curve(ring(0), 'rgba(255,250,220,0.9)', fr * 0.12);
      curve(ring(0.16), 'rgba(140,90,20,0.65)', fr * 0.05);
      curve(ring(-0.16), 'rgba(140,90,20,0.65)', fr * 0.05);
      ctx.restore(); }

    // ── Handles and ribbons on the near side go in front of everything ──
    handles.filter(h => Math.cos(h.a) >= 0).forEach(drawHandle);

    // ── Fixed lighting: sun streak, sky reflection, rim light ──
    ctx.fillStyle = 'rgba(255,255,250,0.38)';
    ctx.beginPath(); ctx.moveTo(tx - cw * 0.70, rimY + S * 0.03); ctx.quadraticCurveTo(tx - cw * 0.78, rimY + S * 0.15, tx - cw * 0.40, rimY + S * 0.25);
    ctx.lineTo(tx - cw * 0.34, rimY + S * 0.24); ctx.quadraticCurveTo(tx - cw * 0.64, rimY + S * 0.14, tx - cw * 0.58, rimY + S * 0.03); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(140,160,220,0.35)';
    ctx.beginPath(); ctx.ellipse(tx + cw * 0.62, rimY + S * 0.12, cw * 0.10, S * 0.07, 0.15, 0, PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,200,130,0.55)'; ctx.lineWidth = 1.0;
    ctx.beginPath(); ctx.moveTo(tx - cw, rimY + S * 0.01); ctx.bezierCurveTo(tx - cw * 1.02, rimY + S * 0.18, tx - cw * 0.55, bot, tx - botR, bot); ctx.stroke();

    ctx.restore();

    // Two bats leaning against the left of the plinth, crossing as they rest on it
    const plinthL = tx - W * 0.068 * K;
    function bat(toeX, toeY, topX, topY, gripCol) {
      const ang = Math.atan2(topY - toeY, topX - toeX), len = Math.hypot(topX - toeX, topY - toeY);
      ctx.save(); ctx.translate(toeX, toeY); ctx.rotate(ang);
      const bw = W * 0.020, bl = len * 0.64;
      // Blade: face toward us, rim-lit on the sunset side
      const g = ctx.createLinearGradient(0, -bw / 2, 0, bw / 2);
      g.addColorStop(0, '#ffe0a8'); g.addColorStop(0.35, '#f0d4a0'); g.addColorStop(1, '#b08a58');
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(0, -bw / 2, bl, bw, bw * 0.28); ctx.fill();
      ctx.fillStyle = 'rgba(120,80,40,0.25)'; ctx.fillRect(bl * 0.12, -bw * 0.06, bl * 0.80, bw * 0.12);   // spine
      ctx.fillStyle = '#d0202a'; ctx.fillRect(bl * 0.55, -bw / 2, bl * 0.10, bw);                         // red sticker band
      ctx.fillStyle = '#f6f2ea'; ctx.fillRect(bl * 0.57, -bw / 2, bl * 0.06, bw);
      // Shoulders + handle with a ringed grip
      ctx.fillStyle = '#e8c890'; ctx.beginPath(); ctx.moveTo(bl, -bw / 2); ctx.quadraticCurveTo(bl + bw * 0.5, -bw * 0.2, bl + bw * 0.6, -bw * 0.17); ctx.lineTo(bl + bw * 0.6, bw * 0.17); ctx.quadraticCurveTo(bl + bw * 0.5, bw * 0.2, bl, bw / 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = gripCol; ctx.fillRect(bl + bw * 0.55, -bw * 0.17, len - bl - bw * 0.55, bw * 0.34);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let x = bl + bw * 0.8; x < len - 2; x += 3) ctx.fillRect(x, -bw * 0.17, 1, bw * 0.34);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(len, 0, bw * 0.19, 0, PI * 2); ctx.fill();
      ctx.restore();
      // Shadow on the paving, falling toward us
      ctx.fillStyle = 'rgba(30,20,40,0.30)'; ctx.beginPath(); ctx.ellipse(toeX + W * 0.012, toeY + 2, W * 0.020, H * 0.006, 0, 0, PI * 2); ctx.fill();
    }
    bat(plinthL - W * 0.085, tb - H * 0.002, plinthL + W * 0.004, tb - H * 0.150, '#d0202a');
    bat(plinthL - W * 0.040, tb + H * 0.000, plinthL - W * 0.004, tb - H * 0.168, '#1a2a6a');
  }

  // ════════ THE OBSERVATION WHEEL — turning slowly behind Parliament, capsules lit, rim lights twinkling ════════
  function drawEye(ctx, W, H, t) {
    const cx = W * 0.775, cy = H * 0.270, R = W * 0.092, VY = H * 0.440, rot = t * Math.PI * 2 / 60;
    // A-frame leg leaning back from the hub to the bank (stays put)
    ctx.strokeStyle = 'rgba(70,55,95,0.9)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - R * 0.6, VY); ctx.stroke();
    ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - R * 0.35, VY); ctx.stroke();
    // Rim and cable spokes, turning
    ctx.strokeStyle = 'rgba(70,55,95,0.85)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 0.6; ctx.beginPath(); ctx.arc(cx, cy, R * 0.93, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 0.5;
    for (let k = 0; k < 24; k++) { const a = rot + k * Math.PI / 12; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }
    ctx.fillStyle = '#4a3a62'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
    // Capsules mounted on the outside of the rim, lights twinkling in a slow chase
    for (let k = 0; k < 32; k++) {
      const a = rot + k * Math.PI / 16, px = cx + Math.cos(a) * R * 1.03, py = cy + Math.sin(a) * R * 1.03;
      ctx.save(); ctx.translate(px, py); ctx.rotate(a);
      ctx.fillStyle = '#4a3a62'; ctx.beginPath(); ctx.ellipse(0, 0, 1.6, 2.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,215,160,0.55)'; ctx.beginPath(); ctx.ellipse(0.3, 0, 0.8, 1.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      const lit = 0.35 + 0.65 * Math.max(0, Math.sin(t * 1.2 - k * 0.6));
      if (k % 2 === 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(px, py, 0, px, py, 3.8); g.addColorStop(0, `rgba(140,200,255,${(0.65 * lit).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(px - 4, py - 4, 8, 8); ctx.restore(); }
    }
  }

  // ════════ EMBANKMENT ANIMATION — lamp globes switching on, St George bunting fluttering ════════
  function drawEmbankment(ctx, W, H, t) {
    const m = t % SHOW, lamps = [W * 0.05, W * 0.27, W * 0.73, W * 0.95];
    const fadeOff = m > LAMPS_OFF[0] ? Math.max(0, 1 - (m - LAMPS_OFF[0]) / (LAMPS_OFF[1] - LAMPS_OFF[0])) : 1;
    lamps.forEach((lx, i) => {
      const top = H * 0.425;
      const onAt = LAMPS_ON[0] + i * (LAMPS_ON[1] - LAMPS_ON[0]) / 4, d = m - onAt;
      let lvl = d < 0 ? 0 : d < 0.6 ? (Math.sin(d * 40) > 0 ? 0.8 : 0.15) : 1;    // a little flicker as each one strikes up
      lvl *= fadeOff;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      if (lvl > 0.02) { const g = ctx.createRadialGradient(lx, top, 0, lx, top, 18); g.addColorStop(0, `rgba(255,215,140,${(0.65 * lvl).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(lx - 18, top - 18, 36, 36); }
      ctx.restore();
      const c0 = [150, 140, 150], c1 = [255, 242, 200], c = c0.map((v, k) => Math.round(v + (c1[k] - v) * lvl));
      ctx.fillStyle = `rgb(${c.join(',')})`; ctx.beginPath(); ctx.arc(lx, top, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(lx - 1.3, top - 1.3, 1.2, 0, Math.PI * 2); ctx.fill();
    });
    // Bunting fluttering in the breeze off the river
    [[0, 1], [2, 3]].forEach(([a, b], si) => {
      const x0 = lamps[a], x1 = lamps[b], y0 = H * 0.440, sag = H * 0.035;
      const pt = (u) => [x0 + (x1 - x0) * u, y0 + sag * 4 * u * (1 - u) + Math.sin(t * 1.3 + u * 4 + si) * 0.8];
      ctx.strokeStyle = 'rgba(30,20,40,0.7)'; ctx.lineWidth = 0.6;
      ctx.beginPath(); for (let k = 0; k <= 20; k++) { const [x, y] = pt(k / 20); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      for (let k = 0; k < 9; k++) {
        const [ax, ay] = pt((k + 0.15) / 9), [bx, by] = pt((k + 0.85) / 9), sway = Math.sin(t * 4 + k * 1.1 + si) * 2.2;
        ctx.fillStyle = k % 2 ? '#d0202a' : '#f6f2ea';
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo((ax + bx) / 2 + sway, (ay + by) / 2 + H * 0.024 - Math.abs(sway) * 0.3); ctx.closePath(); ctx.fill();
      }
    });
  }

  // ════════ MOVING DETAILS — the bus crossing the bridge and a river cruiser drifting downstream ════════
  function drawMovers(ctx, W, H, t) {
    const PI = Math.PI;
    const VY = H * 0.440, deck = H * 0.372;
    // Bus: left to right across the bridge, vanishing into the arch of the far pier; it passes
    // through the towers' arches, so the towers' masonry is cut out of the clip.
    {
      const span = W * 0.40, x0 = -W * 0.06;
      const fb = win(t % SHOW, BUS);
      const bx = fb < 0 ? -W : x0 + fb * span;   // off-stage between crossings
      const bw = W * 0.040, bh = H * 0.034;
      ctx.save();
      ctx.beginPath();
      ctx.rect(-W * 0.1, 0, W * 0.40, H);                         // nothing beyond the far pier
      [W * 0.065, W * 0.215].forEach(tx => {
        const tw = W * 0.046;
        ctx.rect(tx - tw / 2, H * 0.10, tw, VY - H * 0.10);       // tower (removed by even-odd)
        ctx.moveTo(tx - tw * 0.30, deck + H * 0.014); ctx.lineTo(tx - tw * 0.30, deck - H * 0.03);
        ctx.arc(tx, deck - H * 0.03, tw * 0.30, PI, 0); ctx.lineTo(tx + tw * 0.30, deck + H * 0.014); ctx.closePath();   // arch (added back)
      });
      ctx.clip('evenodd');
      ctx.fillStyle = '#d42a2a'; ctx.beginPath(); ctx.roundRect(bx - bw / 2, deck - bh, bw, bh, 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,225,160,0.85)';
      for (let k = 0; k < 5; k++) { ctx.fillRect(bx - bw / 2 + 2 + k * (bw - 4) / 5, deck - bh + 2, (bw - 4) / 5 - 1, bh * 0.25); ctx.fillRect(bx - bw / 2 + 2 + k * (bw - 4) / 5, deck - bh * 0.48, (bw - 4) / 5 - 1, bh * 0.22); }
      ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(bx - bw * 0.3, deck, 1.6, 0, PI * 2); ctx.arc(bx + bw * 0.3, deck, 1.6, 0, PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(bx - bw / 2, deck - bh, bw, 1);
      ctx.fillStyle = 'rgba(255,240,180,0.9)'; ctx.fillRect(bx + bw / 2 - 1, deck - bh * 0.25, 1.5, 2);   // headlamp
      ctx.restore();
    }
    // Cruiser: right to left, slowly, behind the lamp posts and the cup
    {
      const bx = W * 1.08 - ((t / 46 + 0.52) % 1) * W * 1.16, by = H * 0.512, bw = W * 0.070, bh = H * 0.022;
      ctx.fillStyle = 'rgba(20,15,30,0.35)'; ctx.fillRect(bx - bw * 0.55, by + 1, bw * 1.1, 2);
      ctx.fillStyle = '#f2ece4'; ctx.beginPath(); ctx.moveTo(bx - bw / 2, by - bh * 0.4); ctx.lineTo(bx + bw / 2, by - bh * 0.4); ctx.lineTo(bx + bw * 0.42, by); ctx.lineTo(bx - bw * 0.48, by); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2a3a6a'; ctx.fillRect(bx - bw * 0.48, by - bh * 0.12, bw * 0.92, 1.5);
      ctx.fillStyle = '#e8e2d8'; ctx.fillRect(bx - bw * 0.38, by - bh, bw * 0.70, bh * 0.6);
      ctx.fillStyle = 'rgba(255,220,150,0.85)'; for (let k = 0; k < 8; k++) ctx.fillRect(bx - bw * 0.36 + k * bw * 0.085, by - bh * 0.88, bw * 0.06, bh * 0.32);
      // Wake trailing behind, with a gentle shimmer
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 0.7;
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(bx + bw * (0.45 + k * 0.18), by + k * 0.6); ctx.lineTo(bx + bw * (0.62 + k * 0.18), by + 1.5 + k * 0.6 + Math.sin(t * 3 + k) * 0.5); ctx.stroke(); }
    }
    const m = t % SHOW;
    // ── The bridge lifts: the two leaves swing up, a tall ship comes through towards us, then they lower ──
    {
      const f = win(m, BRIDGE), T = f > 0 ? f * (BRIDGE[1] - BRIDGE[0]) : -1, dur = BRIDGE[1] - BRIDGE[0];
      const lift = T < 0 ? 0 : T < 2.0 ? (1 - Math.cos(T / 2.0 * PI)) / 2 : T < dur - 2.0 ? 1 : (1 + Math.cos((T - dur + 2.0) / 2.0 * PI)) / 2;
      const ang = lift * 1.25, deck = H * BRIDGE_DECK, tw = W * BRIDGE_TW, gL = W * BRIDGE_X[0] + tw / 2, gR = W * BRIDGE_X[1] - tw / 2, L = (gR - gL) / 2 + 0.5;
      // The ship: masts appear in the gap far off, then it grows as it sails through and on down the river towards us
      if (T > 1.6 && T < dur - 1.0) {
        const u = (T - 1.6) / (dur - 2.6), sc = 0.55 + u * 0.95, cx = W * (0.140 + u * u * 0.16), wl = H * (0.442 + u * u * 0.13);
        ctx.save();
        if (u < 0.45) { ctx.beginPath(); ctx.rect(gL + 1, 0, gR - gL - 2, H); ctx.rect(0, deck + H * 0.014, W, H); ctx.clip(); }   // still behind the bridge: only seen through the gap and below the deck
        const hl = W * 0.050 * sc, mh = H * 0.15 * sc;
        // Hull with a gold stripe and a bowsprit
        ctx.fillStyle = '#2a2240'; ctx.beginPath(); ctx.moveTo(cx - hl / 2, wl - H * 0.011 * sc); ctx.lineTo(cx + hl / 2, wl - H * 0.013 * sc); ctx.lineTo(cx + hl * 0.40, wl); ctx.lineTo(cx - hl * 0.42, wl); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(240,190,90,0.8)'; ctx.fillRect(cx - hl * 0.45, wl - H * 0.008 * sc, hl * 0.88, 0.8);
        ctx.strokeStyle = '#2a2240'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(cx + hl / 2, wl - H * 0.013 * sc); ctx.lineTo(cx + hl * 0.78, wl - H * 0.035 * sc); ctx.stroke();
        // Rigging lines from the bowsprit and stern to the mast tops
        const masts = [[-0.26, 0.82], [0.02, 1.0], [0.28, 0.86]];
        ctx.strokeStyle = 'rgba(42,34,64,0.55)'; ctx.lineWidth = 0.4;
        ctx.beginPath(); ctx.moveTo(cx + hl * 0.78, wl - H * 0.035 * sc); masts.slice().reverse().forEach(([o, hf]) => ctx.lineTo(cx + o * hl, wl - H * 0.011 * sc - mh * hf)); ctx.lineTo(cx - hl * 0.5, wl - H * 0.012 * sc); ctx.stroke();
        masts.forEach(([o, hf], k) => {
          const mx = cx + o * hl, foot = wl - H * 0.011 * sc, top = foot - mh * hf;
          ctx.strokeStyle = '#2a2240'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(mx, foot); ctx.lineTo(mx, top); ctx.stroke();
          // Three square sails per mast, narrowing towards the top, with small gaps between them
          for (let j = 0; j < 3; j++) {
            const y0 = top + mh * hf * (0.10 + j * 0.24), hh = mh * hf * 0.20, sw = hl * (0.075 + j * 0.016);
            ctx.strokeStyle = '#2a2240'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(mx - sw - 1, y0); ctx.lineTo(mx + sw + 1, y0); ctx.stroke();   // yard
            ctx.fillStyle = 'rgba(255,238,214,0.95)';
            ctx.beginPath(); ctx.moveTo(mx - sw, y0 + 0.5); ctx.lineTo(mx + sw, y0 + 0.5); ctx.quadraticCurveTo(mx + sw * 1.15, y0 + hh * 0.5, mx + sw * 1.05, y0 + hh); ctx.lineTo(mx - sw * 1.05, y0 + hh); ctx.quadraticCurveTo(mx - sw * 0.95, y0 + hh * 0.5, mx - sw, y0 + 0.5); ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(200,150,120,0.35)'; ctx.fillRect(mx - sw, y0 + hh * 0.55, sw * 0.6, hh * 0.4);     // shade on the sail's belly
          }
          ctx.fillStyle = '#d0202a'; ctx.beginPath(); ctx.moveTo(mx, top); ctx.lineTo(mx + 5 * sc, top + 1.2 * sc + Math.sin(t * 6 + k)); ctx.lineTo(mx, top + 2.6 * sc); ctx.closePath(); ctx.fill();
        });
        // Jib sail on the bowsprit
        ctx.fillStyle = 'rgba(255,238,214,0.9)'; ctx.beginPath(); ctx.moveTo(cx + hl * 0.30, wl - H * 0.011 * sc - mh * 0.75); ctx.lineTo(cx + hl * 0.72, wl - H * 0.033 * sc); ctx.lineTo(cx + hl * 0.32, wl - H * 0.016 * sc); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      // The two leaves, hinged at the towers
      [[gL, -1], [gR, 1]].forEach(([hx, sd]) => {
        ctx.save(); ctx.translate(hx, deck); ctx.rotate(sd * ang);
        const dir = -sd;
        ctx.fillStyle = '#4a5a80'; ctx.fillRect(dir > 0 ? 0 : -L, 0, L, H * 0.014);
        ctx.fillStyle = 'rgba(255,200,140,0.5)'; ctx.fillRect(dir > 0 ? 0 : -L, 0, L, 0.9);
        ctx.fillStyle = 'rgba(30,30,60,0.5)'; ctx.fillRect(dir > 0 ? 0 : -L, H * 0.014 - 1, L, 1);
        for (let k = 1; k <= 2; k++) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lx = dir * L * k / 3; const g = ctx.createRadialGradient(lx, -1.5, 0, lx, -1.5, 3); g.addColorStop(0, 'rgba(255,220,150,0.7)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(lx - 3, -4.5, 6, 6); ctx.restore(); }
        ctx.restore();
      });
    }
    // ── Clock hands on the tower: the minute hand creeps round, the hour hand barely moves ──
    {
      const x = W * 0.928, cy = H * (0.112 + 0.053 * 0.52), cr = W * 0.034 * 0.44;
      ctx.fillStyle = '#fff0c0'; ctx.beginPath(); ctx.arc(x, cy, cr * 0.92, 0, PI * 2); ctx.fill();
      const mA = (t / 60) * PI * 2 - PI / 2, hA = (t / 720) * PI * 2 + PI * 0.18;
      ctx.strokeStyle = '#2c2442'; ctx.lineCap = 'round';
      ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x + Math.cos(hA) * cr * 0.50, cy + Math.sin(hA) * cr * 0.50); ctx.stroke();
      ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x + Math.cos(mA) * cr * 0.80, cy + Math.sin(mA) * cr * 0.80); ctx.stroke();
    }
    // ── A police launch speeding downstream with a white wake (its own 29s cycle) ──
    {
      const u = (t % 29) / 29;
      if (u < 0.30) {
        const v = u / 0.30, x = W * (-0.06 + v * 1.12), y = H * 0.530, L = W * 0.040;
        ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.8;
        for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x - L / 2, y + 1); ctx.lineTo(x - L / 2 - W * (0.03 + k * 0.025), y + 0.5 + k * 1.2 + Math.sin(t * 8 + k) * 0.5); ctx.stroke(); }
        ctx.fillStyle = '#1a2a5a'; ctx.beginPath(); ctx.moveTo(x - L / 2, y - 2); ctx.lineTo(x + L / 2, y - 2); ctx.lineTo(x + L * 0.38, y + 1.5); ctx.lineTo(x - L / 2, y + 1.5); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f2f2f6'; ctx.fillRect(x - L * 0.25, y - 6, L * 0.40, 4);
        ctx.fillStyle = '#e8d030'; ctx.fillRect(x - L / 2, y - 1, L * 0.95, 1);
        if (Math.floor(t * 4) % 2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x - L * 0.05, y - 7, 0, x - L * 0.05, y - 7, 6); g.addColorStop(0, 'rgba(120,170,255,0.9)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - L * 0.05 - 6, y - 13, 12, 12); ctx.restore(); }
      }
    }
    // ── A pair of swans drifting slowly near the wall (an 83s cycle) ──
    {
      const u = (t % 83) / 83, x = W * (1.04 - u * 1.10), y = H * 0.566;
      [[0, 0], [W * 0.022, 1.2]].forEach(([dx, dy], k) => {
        const sx = x + dx, sy = y + dy + Math.sin(t * 1.2 + k) * 0.4;
        ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(sx - 5, sy + 2, 12, 0.7);
        ctx.fillStyle = '#f6f2ec'; ctx.beginPath(); ctx.ellipse(sx + 1, sy, 4.5, 2, 0, PI, 0); ctx.fill(); ctx.fillRect(sx - 3.5, sy - 0.2, 9, 1.5);
        ctx.strokeStyle = '#f6f2ec'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(sx - 2.5, sy - 1); ctx.quadraticCurveTo(sx - 5, sy - 4, sx - 4, sy - 6.5); ctx.stroke();
        ctx.fillStyle = '#f08030'; ctx.fillRect(sx - 6.2, sy - 6.6, 2, 1);
      });
    }
    // A rowing eight sculling upstream, left to right, oars dipping in time
    { const f = win(m, ROWERS);
      if (f > 0) {
        const x = W * (-0.08 + f * 1.16), y = H * 0.478, L = W * 0.075, stroke = Math.sin(t * 5.5);
        ctx.fillStyle = 'rgba(20,15,30,0.30)'; ctx.fillRect(x - L / 2, y + 1, L, 1.5);
        ctx.fillStyle = '#f2ece4'; ctx.beginPath(); ctx.moveTo(x - L / 2, y); ctx.lineTo(x + L / 2, y - 0.5); ctx.lineTo(x + L / 2 - 3, y + 1.5); ctx.lineTo(x - L / 2 + 2, y + 1.5); ctx.closePath(); ctx.fill();
        for (let k = 0; k < 8; k++) {
          const rx = x - L * 0.40 + k * L * 0.10;
          ctx.fillStyle = '#2a2a48'; ctx.fillRect(rx - 0.8, y - 4 + stroke * 0.6, 1.6, 4);
          ctx.strokeStyle = 'rgba(240,230,220,0.75)'; ctx.lineWidth = 0.5;
          const sd = k % 2 ? 1 : -1; ctx.beginPath(); ctx.moveTo(rx, y - 2); ctx.lineTo(rx - stroke * 4, y + 1 + sd * 2.2); ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x - L / 2 - 2, y + 1); ctx.lineTo(x - L / 2 - W * 0.04, y + 2); ctx.stroke();
      } }
    // The clock tower chimes: three slow, soft pulses of light from the clock face
    { const f = win(m, CHIME);
      if (f > 0) {
        const T = f * (CHIME[1] - CHIME[0]), x = W * 0.928, y = H * (0.112 + 0.053 * 0.52);
        const pulse = Math.max(0, Math.sin(T * PI)) ** 2;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(x, y, 0, x, y, W * 0.05); g.addColorStop(0, `rgba(255,225,150,${(0.50 * pulse).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(x - W * 0.05, y - W * 0.05, W * 0.1, W * 0.1);
        ctx.strokeStyle = `rgba(255,230,170,${(0.45 * pulse).toFixed(3)})`; ctx.lineWidth = 0.8;
        const rr = W * 0.012 + (T % 1) * W * 0.03; ctx.beginPath(); ctx.arc(x, y, rr, 0, PI * 2); ctx.stroke();
        ctx.restore();
      } }
    // A flock of pigeons sweeping across the river, right to left, wings flickering
    { const f = win(m, PIGEONS);
      if (f > 0) {
        for (let k = 0; k < 9; k++) {
          const lag = (k % 3) * 0.03 + Math.floor(k / 3) * 0.02, u = Math.min(1, Math.max(0, f - lag) / 0.9);
          const x = W * (1.05 - u * 1.15) + (k % 3) * 6, y = H * (0.30 + 0.05 * Math.sin(u * PI) + Math.floor(k / 3) * 0.012) - (k % 3) * 2;
          const flap = Math.sin(t * 16 + k * 1.3);
          ctx.strokeStyle = 'rgba(50,40,60,0.85)'; ctx.lineWidth = 1; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x - 3, y - flap * 2); ctx.lineTo(x, y); ctx.lineTo(x + 3, y - flap * 2); ctx.stroke();
        }
      } }
  }

  // The still scene is painted once into an offscreen canvas; each frame copies it,
  // draws the cup at its current angle, then lays the haze and vignette over the top.
  // (canvas passed in)
  const ctx = cvs.getContext('2d');
  const SCRATCH = document.createElement('canvas').getContext('2d');
  const skyL = document.createElement('canvas'); skyL.width = 620; skyL.height = 355;
  const back = document.createElement('canvas'); back.width = 620; back.height = 355;
  const front = document.createElement('canvas'); front.width = 620; front.height = 355;
  const front2 = document.createElement('canvas'); front2.width = 620; front2.height = 355;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TURN_SECONDS = 9;                 // one full turn of the cup
  function paintBase() {
    const k = skyL.getContext('2d'); k.clearRect(0, 0, 620, 355); draw(k, 620, 355, 'sky');
    const b = back.getContext('2d'); b.clearRect(0, 0, 620, 355); draw(b, 620, 355, 'back');
    const f = front.getContext('2d'); f.clearRect(0, 0, 620, 355); draw(f, 620, 355, 'front');
    const f2 = front2.getContext('2d'); f2.clearRect(0, 0, 620, 355); draw(f2, 620, 355, 'front2');
  }
  function frame(ms) {
    const t = reduceMotion ? 0 : ms / 1000;
    const phi = (t / TURN_SECONDS) * Math.PI * 2;
    ctx.clearRect(0, 0, 620, 355);
    ctx.drawImage(skyL, 0, 0);
    drawEye(ctx, 620, 355, t);
    ctx.drawImage(back, 0, 0);
    drawMovers(ctx, 620, 355, t);
    ctx.drawImage(front, 0, 0);
    drawEmbankment(ctx, 620, 355, t);
    ctx.drawImage(front2, 0, 0);
    drawTrophy(ctx, 620, 355, phi, t);
    drawAtmos(ctx, 620, 355);
  }
  function loop(ms) { if (!__running) return; __elapsed = ms - __t0; __frame(__elapsed); requestAnimationFrame(loop); }
  paintBase(); __frame(0);
  // Repaint the still layers once the Barlow font arrives (or after 2s if it stalls)
  let repainted = false;
  const repaint = () => { if (!repainted) { repainted = true; paintBase(); __frame(__elapsed); } };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(repaint).catch(() => {});
  setTimeout(repaint, 2000);
  return {
    start() { if (__running) return; if (reduceMotion) { __frame(0); return; } __running = true; __t0 = performance.now() - __elapsed; requestAnimationFrame(loop); },
    stop() { __running = false; },
  };
}
function makeLeagueArt_acl(cvs) {
  let __running = false, __t0 = 0, __elapsed = 0;
  // Soft fade at the foot of the art so it melts into the card's info panel
  function __fade() {
    const g = ctx.createLinearGradient(0, 355 * 0.78, 0, 355);
    g.addColorStop(0, 'rgba(8,8,18,0)'); g.addColorStop(1, 'rgba(8,8,18,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 355 * 0.78, 620, 355 * 0.22);
  }
  function __frame(ms) { frame(ms); __fade(); }
  const PI = Math.PI;
  const SHOW = 21;                                   // length of the shared schedule, seconds
  const KOOKA_LAUGHS = [3.5, 15.0, 19.2];            // when in the schedule the kookaburra laughs
  // Opera House shells: [left x, width, height, tip position, faces the sunset] (shared by the still scene and the light show)
  const OPERA_SHELLS = [[0.030, 0.110, 0.205, 0.30, 1], [0.072, 0.094, 0.160, 0.28, 1], [0.106, 0.075, 0.115, 0.26, 0],
    [0.162, 0.098, 0.172, 0.32, 1], [0.198, 0.082, 0.135, 0.30, 1], [0.230, 0.064, 0.098, 0.28, 0], [0.262, 0.046, 0.064, 0.26, 0]];

  // ════════ STILL SCENE — Sydney Harbour at dusk ════════
  // part 'back' paints sky → water; part 'front' paints the harbour wall onwards on a transparent layer.
  // Both run the same code so the random details match; the unused half goes to a scratch canvas.
  function draw(ctxReal, W, H, part) {
    let ctx = part === 'sky' ? ctxReal : SCRATCH;      // sky → (clouds, drawn each frame) → back → front
    let seed = 31;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const VX = W * 0.5, VY = H * 0.440, WALL = H * 0.590;
    const SIL = '#5a6a84', SIL2 = '#7a8aa4', RIM = 'rgba(255,255,250,0.65)';
    function limb(x1, y1, x2, y2, w, col) {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    function glow(x, y, r, col) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    }

    // ── Sky: a bright, clear Sydney midday ──
    const sky = ctx.createLinearGradient(0, 0, 0, VY);
    sky.addColorStop(0, '#1656b4'); sky.addColorStop(0.45, '#3a8ae0'); sky.addColorStop(0.85, '#8cc8f2'); sky.addColorStop(1, '#d4ecf8');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, VY + 2);
    const sunX = W * 0.16, sunY = H * 0.04;
    const sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, W * 0.40);
    sg.addColorStop(0, 'rgba(255,255,245,1)'); sg.addColorStop(0.06, 'rgba(255,252,225,0.9)');
    sg.addColorStop(0.22, 'rgba(255,250,220,0.30)'); sg.addColorStop(1, 'rgba(255,250,220,0)');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, VY);
    function cloud(x, y, w) {
      ctx.save();
      ctx.beginPath(); ctx.rect(x - w * 1.2, y - w, w * 2.4, w * 1.05); ctx.clip();
      ctx.translate(x, y); ctx.scale(1, 0.62);
      [[-0.62, 0.08, 0.30], [-0.32, -0.08, 0.40], [0, -0.22, 0.48], [0.32, -0.06, 0.38], [0.64, 0.08, 0.28], [-0.12, 0.10, 0.36], [0.24, 0.10, 0.33]].forEach(([dx, dy, r]) => {
        const g = ctx.createRadialGradient(dx * w - r * w * 0.3, dy * w - r * w * 0.3, 0, dx * w, dy * w, r * w);
        g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.65, 'rgba(250,252,255,0.85)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(dx * w, dy * w, r * w, 0, PI * 2); ctx.fill();
      });
      ctx.restore();
      const u = ctx.createLinearGradient(0, y - w * 0.12, 0, y + w * 0.05);
      u.addColorStop(0, 'rgba(150,180,215,0)'); u.addColorStop(1, 'rgba(150,180,215,0.35)');
      ctx.fillStyle = u; ctx.beginPath(); ctx.ellipse(x, y + w * 0.02, w * 0.80, w * 0.07, 0, PI, PI * 2); ctx.fill();
    }
    cloud(W * 0.40, H * 0.090, W * 0.11);
    cloud(W * 0.78, H * 0.060, W * 0.13);
    cloud(W * 0.93, H * 0.270, W * 0.07);
    cloud(W * 0.06, H * 0.300, W * 0.07);
    cloud(W * 0.58, H * 0.250, W * 0.06);

    ctx = part === 'back' ? ctxReal : SCRATCH;

    // ── Far shore: North Shore hills and the CBD skyline ──
    ctx.fillStyle = '#6a9a7a';
    ctx.beginPath(); ctx.moveTo(0, VY);
    for (let x = 0; x <= W; x += 6) ctx.lineTo(x, VY - H * 0.018 - Math.sin(x * 0.012) * H * 0.010 - rnd() * H * 0.006);
    ctx.lineTo(W, VY); ctx.closePath(); ctx.fill();
    // CBD towers (mostly behind the cup, peeking out either side)
    for (let i = 0; i < 26; i++) {
      const x = W * (0.25 + rnd() * 0.50), w = W * (0.014 + rnd() * 0.022), h = H * (0.05 + rnd() * 0.16);
      const gl = ctx.createLinearGradient(x, 0, x + w, 0);
      gl.addColorStop(0, rnd() < 0.5 ? '#d8e6f2' : '#c4d4e6'); gl.addColorStop(0.5, '#9ab4d0'); gl.addColorStop(1, '#6a84a6');
      ctx.fillStyle = gl; ctx.fillRect(x, VY - h, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.20)';
      for (let k = 0; k < h / 4; k++) if (rnd() < 0.5) { ctx.fillRect(x, VY - h + 2 + k * 4, w, 0.6); }
      ctx.fillStyle = 'rgba(140,200,240,0.35)'; ctx.fillRect(x + w * 0.15, VY - h, w * 0.2, h);
    }
    // Sydney Tower: a needle with a golden turret
    {
      const x = W * 0.680, top = H * 0.070, tur = H * 0.145;
      limb(x, VY, x, tur + H * 0.02, W * 0.010, '#9aa6b8');
      ctx.fillStyle = RIM; ctx.fillRect(x - W * 0.005, tur + H * 0.02, 1, VY - tur);
      // Support cables
      ctx.strokeStyle = 'rgba(120,130,150,0.6)'; ctx.lineWidth = 0.5;
      for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(x + k * 1.2, tur + H * 0.03); ctx.lineTo(x + k * W * 0.006, VY - H * 0.06); ctx.stroke(); }
      const tg = ctx.createLinearGradient(x - W * 0.020, 0, x + W * 0.020, 0);
      tg.addColorStop(0, '#ffd890'); tg.addColorStop(0.4, '#e8b048'); tg.addColorStop(1, '#7a5420');
      ctx.fillStyle = tg;
      ctx.beginPath(); ctx.moveTo(x - W * 0.012, tur + H * 0.022); ctx.lineTo(x - W * 0.020, tur + H * 0.010); ctx.lineTo(x - W * 0.020, tur - H * 0.010);
      ctx.lineTo(x - W * 0.012, tur - H * 0.020); ctx.lineTo(x + W * 0.012, tur - H * 0.020); ctx.lineTo(x + W * 0.020, tur - H * 0.010);
      ctx.lineTo(x + W * 0.020, tur + H * 0.010); ctx.lineTo(x + W * 0.012, tur + H * 0.022); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(90,60,20,0.6)'; ctx.lineWidth = 0.5;
      for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(x + k * W * 0.0055, tur - H * 0.018); ctx.lineTo(x + k * W * 0.0055, tur + H * 0.020); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,230,160,0.9)'; ctx.fillRect(x - W * 0.018, tur - H * 0.002, W * 0.036, 1.5);
      limb(x, tur - H * 0.020, x, top, 1.2, '#8a96a8');
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(x - W * 0.019, tur - H * 0.012, 1.4, H * 0.020);   // sun glint
    }

    // ── Harbour Bridge on the right: granite pylon, steel arch, deck, lights ──
    {
      const xc = W * 1.030, half = W * 0.300, deck = H * 0.382;
      const lowPeak = H * 0.205, lowBase = VY - H * 0.010, upPeak = H * 0.168, upBase = VY - H * 0.070;
      const yLow = (x) => lowPeak + (lowBase - lowPeak) * ((x - xc) / half) ** 2;
      const yUp = (x) => upPeak + (upBase - upPeak) * ((x - xc) / half) ** 2;
      const x0 = xc - half;
      // Arch chords
      ctx.strokeStyle = '#7a8498'; ctx.lineWidth = 2.4;
      [yLow, yUp].forEach(f => { ctx.beginPath(); for (let x = x0; x <= W + 4; x += 3) ctx.lineTo(x, f(x)); ctx.stroke(); });
      // Truss: verticals + diagonals between the chords
      ctx.strokeStyle = 'rgba(110,120,140,0.85)'; ctx.lineWidth = 0.8;
      let flip = 0;
      for (let x = x0 + 4; x <= W + 4; x += W * 0.018) {
        ctx.beginPath(); ctx.moveTo(x, yLow(x)); ctx.lineTo(x, yUp(x)); ctx.stroke();
        const xn = x + W * 0.018;
        ctx.beginPath(); flip ? (ctx.moveTo(x, yLow(x)), ctx.lineTo(xn, yUp(xn))) : (ctx.moveTo(x, yUp(x)), ctx.lineTo(xn, yLow(xn))); ctx.stroke(); flip = 1 - flip;
      }
      // Hangers from the arch down to the deck
      ctx.strokeStyle = 'rgba(110,120,140,0.65)'; ctx.lineWidth = 0.6;
      for (let x = x0; x <= W; x += W * 0.018) if (yLow(x) < deck) { ctx.beginPath(); ctx.moveTo(x, yLow(x)); ctx.lineTo(x, deck); ctx.stroke(); }
      // Rim light along the top chord + the famous string of lights
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); for (let x = x0; x <= W + 4; x += 3) ctx.lineTo(x, yUp(x) - 1.2); ctx.stroke();
      // (sun glints travel along the arch each frame)
      // Deck
      ctx.fillStyle = '#5a6478'; ctx.fillRect(W * 0.690, deck, W * 0.32, H * 0.016);
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(W * 0.690, deck, W * 0.32, 0.9);
      ctx.fillStyle = 'rgba(40,50,70,0.35)'; ctx.fillRect(W * 0.690, deck + H * 0.016, W * 0.32, 1.5);
      // Approach spans stepping down to the left shore
      ctx.fillStyle = '#6a7084'; ctx.fillRect(W * 0.66, deck, W * 0.04, H * 0.016);
      // Granite pylon at the southern end
      const px = W * 0.712, pw = W * 0.050, pTop = H * 0.245;
      const pg = ctx.createLinearGradient(px - pw / 2, 0, px + pw / 2, 0);
      pg.addColorStop(0, '#f0e2c8'); pg.addColorStop(0.35, '#d8c4a4'); pg.addColorStop(1, '#9a8a7a');
      ctx.fillStyle = pg; ctx.fillRect(px - pw / 2, pTop, pw, VY - pTop);
      ctx.fillStyle = RIM; ctx.fillRect(px - pw / 2, pTop, 1.2, VY - pTop);
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = pTop + 5; y < VY; y += 5) ctx.fillRect(px - pw / 2, y, pw, 0.6);
      ctx.fillStyle = '#d0bc9c'; ctx.fillRect(px - pw * 0.42, pTop - H * 0.022, pw * 0.84, H * 0.022);
      ctx.fillRect(px - pw * 0.30, pTop - H * 0.036, pw * 0.60, H * 0.014);
      ctx.fillStyle = RIM; ctx.fillRect(px - pw * 0.42, pTop - H * 0.022, 1, H * 0.022);
      ctx.fillStyle = '#4a4a5a';
      ctx.beginPath(); ctx.moveTo(px - pw * 0.30, deck + H * 0.016); ctx.lineTo(px - pw * 0.30, deck - H * 0.02); ctx.arc(px, deck - H * 0.02, pw * 0.30, PI, 0); ctx.lineTo(px + pw * 0.30, deck + H * 0.016); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(60,60,80,0.6)'; [0.30, 0.48].forEach(f => ctx.fillRect(px - 1.5, pTop + (deck - pTop) * f, 3, 7));
      // Flag on the crown of the arch
      const fx = xc - W * 0.05, fy = yUp(fx);
      limb(fx, fy, fx, fy - H * 0.035, 0.8, '#d8d8e0');
      ctx.fillStyle = '#1a3a8a'; ctx.fillRect(fx, fy - H * 0.035, W * 0.020, H * 0.016);
      ctx.fillStyle = '#ffffff'; [[0.4, 0.3], [0.75, 0.6], [0.6, 0.85]].forEach(([a, b]) => ctx.fillRect(fx + W * 0.020 * a, fy - H * 0.035 + H * 0.016 * b - 0.5, 1, 1));
    }

    // ── Opera House on the left: shells on a granite podium, glass walls glowing ──
    {
      const pod0 = W * 0.012, pod1 = W * 0.312, podTop = VY - H * 0.030;
      const pg = ctx.createLinearGradient(0, podTop, 0, VY + 2);
      pg.addColorStop(0, '#e8d4bc'); pg.addColorStop(1, '#a8927e');
      ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(pod0, VY + 2); ctx.lineTo(pod0 + W * 0.006, podTop); ctx.lineTo(pod1, podTop); ctx.lineTo(pod1 + W * 0.008, VY + 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(90,70,60,0.30)'; for (let k = 1; k < 5; k++) ctx.fillRect(pod0 + W * 0.006, podTop + (VY - podTop) * k / 5, pod1 - pod0, 0.6);
      // The monumental steps up to the podium, catching the sun on their treads
      { const s0 = W * 0.165, s1 = W * 0.300, n = 8;
        for (let k = 0; k < n; k++) { const y = podTop + (VY + 2 - podTop) * k / n, hh = (VY + 2 - podTop) / n;
          ctx.fillStyle = '#f4e6d2'; ctx.fillRect(s0 - k * 1.2, y, s1 - s0 + k * 2.4, hh * 0.45);
          ctx.fillStyle = '#c8b29a'; ctx.fillRect(s0 - k * 1.2, y + hh * 0.45, s1 - s0 + k * 2.4, hh * 0.55); } }
      function shell(x0, w, h, tipF, lit) {
        const yb = podTop, x1 = x0 + w, xt = x0 + w * tipF, yt = yb - h;
        const sail = () => {
          ctx.beginPath(); ctx.moveTo(x0, yb);
          ctx.quadraticCurveTo(x0 - w * 0.02, yt + h * 0.28, xt, yt);
          ctx.quadraticCurveTo(x1 - w * 0.02, yb - h * 0.62, x1, yb);
          ctx.closePath();
        };
        // Solid white shell: warm where the sunset catches it, cooler on the far facet
        const sg = ctx.createLinearGradient(x0, yt, x1, yb);
        sg.addColorStop(0, '#ffffff'); sg.addColorStop(0.5, lit ? '#f6f6f2' : '#e8ecf0'); sg.addColorStop(1, '#b4c0d0');
        ctx.fillStyle = sg; sail(); ctx.fill();
        // Ridge from the tip down the middle, with the shaded facet beyond it
        ctx.save(); sail(); ctx.clip();
        ctx.fillStyle = 'rgba(90,120,170,0.24)';
        ctx.beginPath(); ctx.moveTo(xt, yt); ctx.quadraticCurveTo(x0 + w * 0.62, yb - h * 0.45, x0 + w * 0.70, yb); ctx.lineTo(x1 + 2, yb); ctx.lineTo(x1 + 2, yt); ctx.closePath(); ctx.fill();
        // Chevron tile courses
        ctx.strokeStyle = 'rgba(150,160,180,0.40)'; ctx.lineWidth = 0.5;
        for (let k = 1; k < 12; k++) { const f = k / 12, y = yt + (yb - yt) * f; ctx.strokeStyle = `rgba(140,152,176,${k % 2 ? 0.38 : 0.22})`; ctx.beginPath(); ctx.moveTo(x0 - 2, y + h * 0.10 * f); ctx.lineTo(xt + w * 0.12 * f, y - h * 0.04); ctx.lineTo(x1 + 2, y + h * 0.12 * f); ctx.stroke(); }
        // Rib lines fanning down from the tip
        ctx.strokeStyle = 'rgba(160,172,196,0.22)'; ctx.lineWidth = 0.4;
        for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.moveTo(xt, yt); ctx.quadraticCurveTo(x0 + w * (0.15 + k * 0.16), yb - h * 0.45, x0 + w * (0.08 + k * 0.17), yb); ctx.stroke(); }
        ctx.restore();
        // Shadowed underside along the shell's open edge
        ctx.strokeStyle = 'rgba(70,90,130,0.55)'; ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(xt, yt); ctx.quadraticCurveTo(x1 - w * 0.02, yb - h * 0.62, x1, yb); ctx.stroke();
        ctx.strokeStyle = RIM; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(x0, yb); ctx.quadraticCurveTo(x0 - w * 0.02, yt + h * 0.28, xt, yt); ctx.stroke();
        // Glass wall glowing amber at the open foot of the shell
        const gw = ctx.createLinearGradient(0, yb - h * 0.22, 0, yb);
        gw.addColorStop(0, '#4a6a8a'); gw.addColorStop(0.5, '#8ab0d0'); gw.addColorStop(1, '#3a4a60');
        ctx.fillStyle = gw;
        ctx.beginPath(); ctx.moveTo(x0 + w * 0.55, yb); ctx.quadraticCurveTo(x0 + w * 0.70, yb - h * 0.22, x1 - w * 0.03, yb - h * 0.04); ctx.lineTo(x1, yb); ctx.closePath(); ctx.fill();

      }
      // Two clusters of nested shells, largest at the back, all pointing toward the harbour
      OPERA_SHELLS.forEach(([x, w, h, tf, lit]) => shell(W * x, W * w, H * h, tf, lit));
    }

    // ── Harbour water ──
    const water = ctx.createLinearGradient(0, VY, 0, WALL);
    water.addColorStop(0, '#4aa8d8'); water.addColorStop(0.4, '#1e7ab8'); water.addColorStop(1, '#0c4a84');
    ctx.fillStyle = water; ctx.fillRect(0, VY, W, WALL - VY);
    for (let i = 0; i < 200; i++) {
      const t = rnd(), y = VY + 1 + t * (WALL - VY - 2);
      const x = rnd() * W;
      ctx.fillStyle = `rgba(255,255,255,${(0.25 + rnd() * 0.45) * (1 - t * 0.4)})`;
      ctx.fillRect(x, y, 2 + rnd() * 5 * (0.4 + t), 1);
    }
    // Reflections: Opera House glow, Sydney Tower gold, bridge lights
    [[0.07, 'rgba(255,255,255,0.40)', 7], [0.20, 'rgba(255,255,255,0.40)', 7], [0.680, 'rgba(230,240,250,0.30)', 3], [0.712, 'rgba(240,230,210,0.35)', 4], [0.84, 'rgba(120,130,150,0.30)', 5], [0.94, 'rgba(120,130,150,0.30)', 5]].forEach(([rx, col, wmax]) => {
      for (let y = VY + 2; y < WALL - 2; y += 2.2) {
        ctx.fillStyle = col; const w = 2 + rnd() * wmax;
        ctx.fillRect(W * rx - w / 2 + Math.sin(y * 0.7) * 2, y, w, 0.9);
      }
    });
    ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 0.6;
    for (let y = VY + 3; y < WALL; y += 3 + (y - VY) * 0.06) { ctx.beginPath(); for (let x = 0; x <= W; x += 8) ctx.lineTo(x, y + Math.sin(x * 0.08 + y) * 0.8); ctx.stroke(); }

    if (part === 'back' || part === 'sky') return;
    ctx = ctxReal;

    // ════════ FRONT LAYER — sandstone harbour wall, iron railing, lamps, bunting, props ════════
    {
      const wallTop = WALL - H * 0.010;
      const wg = ctx.createLinearGradient(0, wallTop, 0, WALL + H * 0.040);
      wg.addColorStop(0, '#f0cc94'); wg.addColorStop(1, '#b08a64');
      ctx.fillStyle = wg; ctx.fillRect(0, wallTop, W, H * 0.050);
      ctx.fillStyle = 'rgba(90,60,40,0.30)'; for (let x = 0; x < W; x += 14) ctx.fillRect(x + ((x / 14) % 2) * 7, wallTop + 3, 0.7, H * 0.040);
      ctx.fillStyle = '#f0cc94'; ctx.fillRect(0, wallTop, W, 2.2);
      // Black iron railing with rings between the uprights
      const rTop = wallTop - H * 0.040;
      ctx.fillStyle = '#1a1622'; ctx.fillRect(0, rTop, W, 2); ctx.fillRect(0, rTop + H * 0.030, W, 1.4);
      ctx.strokeStyle = '#1a1622'; ctx.lineWidth = 1;
      for (let x = 3; x < W; x += 9) {
        ctx.beginPath(); ctx.moveTo(x, rTop); ctx.lineTo(x, wallTop); ctx.stroke();
        ctx.beginPath(); ctx.arc(x + 4.5, rTop + H * 0.016, 2.6, 0, PI * 2); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.40)'; ctx.fillRect(0, rTop, W, 0.7);
    }
    const PAVE = WALL + H * 0.040;
    const pv = ctx.createLinearGradient(0, PAVE, 0, H);
    pv.addColorStop(0, '#e2d2bc'); pv.addColorStop(0.5, '#b8a690'); pv.addColorStop(1, '#8a7a6a');
    ctx.fillStyle = pv; ctx.fillRect(0, PAVE, W, H - PAVE);
    ctx.strokeStyle = 'rgba(40,30,50,0.28)'; ctx.lineWidth = 0.7;
    for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(VX + i * W * 0.05, PAVE); ctx.lineTo(VX + i * W * 0.22, H); ctx.stroke(); }
    for (let y = PAVE + 3, st = 4; y < H; y += st, st *= 1.25) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const rake = ctx.createRadialGradient(W * 0.3, PAVE, 0, W * 0.3, PAVE, W * 0.6);
    rake.addColorStop(0, 'rgba(255,250,230,0.18)'); rake.addColorStop(1, 'rgba(255,250,230,0)');
    ctx.fillStyle = rake; ctx.fillRect(0, PAVE, W, H - PAVE);
    ctx.restore();
    // Quay lamp posts + green-and-gold bunting
    const lamps = [W * 0.05, W * 0.27, W * 0.73, W * 0.95];
    lamps.forEach(lx => {
      const base = PAVE + H * 0.004, top = H * 0.425;
      ctx.fillStyle = 'rgba(30,40,60,0.35)'; ctx.beginPath(); ctx.ellipse(lx + 6, base + 1, 8, 1.6, 0.15, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1622'; ctx.fillRect(lx - 4, base - H * 0.03, 8, H * 0.03);
      limb(lx, base - H * 0.03, lx, top + 6, 2.6, '#1a1622');
      limb(lx - 7, top + 3, lx + 7, top + 3, 1.4, '#1a1622');
      [-7, 7].forEach(o => { ctx.fillStyle = '#f4f4f0'; ctx.beginPath(); ctx.arc(lx + o, top, 3.2, 0, PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(150,160,180,0.6)'; ctx.beginPath(); ctx.arc(lx + o + 0.8, top + 0.8, 2.2, 0, PI * 2); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(lx + o - 1, top - 1, 1, 0, PI * 2); ctx.fill(); });
    });
    [[0, 1], [2, 3]].forEach(([a, b]) => {
      const x0 = lamps[a], x1 = lamps[b], y0 = H * 0.440, sag = H * 0.035;
      const pt = (t) => [x0 + (x1 - x0) * t, y0 + sag * 4 * t * (1 - t)];
      ctx.strokeStyle = 'rgba(30,40,60,0.7)'; ctx.lineWidth = 0.6;
      ctx.beginPath(); for (let k = 0; k <= 20; k++) { const [x, y] = pt(k / 20); ctx.lineTo(x, y); } ctx.stroke();
      for (let k = 0; k < 9; k++) {
        const [ax, ay] = pt((k + 0.15) / 9), [bx, by] = pt((k + 0.85) / 9);
        ctx.fillStyle = k % 2 ? '#0a7a40' : '#f2c440';
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo((ax + bx) / 2, (ay + by) / 2 + H * 0.024); ctx.closePath(); ctx.fill();
      }
    });
    // Two silver gulls perched on the railing, eyeing the cup
    [[0.352, 1], [0.652, -1]].forEach(([fx, dir]) => {
      const x = W * fx, y = WALL - H * 0.010 - H * 0.040;
      ctx.save(); ctx.translate(x, y); ctx.scale(dir * 1.2, 1.2);
      ctx.fillStyle = '#f4f4f6'; ctx.beginPath(); ctx.ellipse(0, -4.5, 5.2, 3.4, -0.15, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#a8b0bc'; ctx.beginPath(); ctx.ellipse(1.6, -5.2, 4.2, 2.1, -0.18, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.moveTo(4.6, -5.4); ctx.lineTo(7.6, -4.4); ctx.lineTo(4.6, -3.8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-4, -8.6, 2.3, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#e83a2a'; ctx.beginPath(); ctx.moveTo(-6, -8.8); ctx.lineTo(-9, -8.3); ctx.lineTo(-6, -7.8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-5, -9.4, 0.9, 0.9);
      ctx.strokeStyle = '#e8705a'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-0.8, -1.5); ctx.lineTo(-0.8, 0); ctx.moveTo(1.2, -1.5); ctx.lineTo(1.2, 0); ctx.stroke();
      ctx.restore();
    });
    // Surfboard leaning on the railing, with a cool box at its foot
    {
      const bx = W * 0.115, by = PAVE + H * 0.070;
      ctx.fillStyle = 'rgba(30,40,60,0.35)'; ctx.beginPath(); ctx.ellipse(bx + W * 0.02, by + 2, W * 0.035, H * 0.008, 0, 0, PI * 2); ctx.fill();
      ctx.save(); ctx.translate(bx, by); ctx.rotate(0.16);
      const L = H * 0.260, Wd = W * 0.030;
      const g = ctx.createLinearGradient(-Wd / 2, 0, Wd / 2, 0);
      g.addColorStop(0, '#fff2b0'); g.addColorStop(0.5, '#f2c440'); g.addColorStop(1, '#b8861c');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -L / 2, Wd / 2, L / 2, 0, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#0a7a40'; ctx.fillRect(-1.4, -L * 0.95, 2.8, L * 0.9);
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-Wd * 0.22, -L * 0.62, Wd * 0.08, L * 0.25, 0, 0, PI * 2); ctx.fill();
      ctx.restore();
      // Cool box
      const cx = W * 0.175, cb = PAVE + H * 0.080, cw2 = W * 0.060, ch = H * 0.065;
      ctx.fillStyle = 'rgba(30,40,60,0.35)'; ctx.beginPath(); ctx.ellipse(cx + 4, cb + 2, cw2 * 0.7, H * 0.010, 0, 0, PI * 2); ctx.fill();
      const cg = ctx.createLinearGradient(cx - cw2 / 2, 0, cx + cw2 / 2, 0);
      cg.addColorStop(0, '#4a9ae0'); cg.addColorStop(1, '#1a5aa8');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.roundRect(cx - cw2 / 2, cb - ch, cw2, ch, 3); ctx.fill();
      ctx.fillStyle = '#f6f6f2'; ctx.beginPath(); ctx.roundRect(cx - cw2 / 2 - 1.5, cb - ch - H * 0.016, cw2 + 3, H * 0.018, 3); ctx.fill();
      ctx.strokeStyle = '#f6f6f2'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cb - ch - H * 0.016, cw2 * 0.22, PI, 0); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(cx - cw2 / 2 + 2, cb - ch + 2, cw2 * 0.18, ch - 4);
      // Beach towel thrown over the lid and hanging down the side: red-and-yellow lifesaver stripes
      { const lidY = cb - ch - H * 0.016, tx0 = cx - cw2 * 0.15, tw2 = cw2 * 0.62, drop = ch * 0.78;
        ctx.save();
        ctx.beginPath(); ctx.moveTo(tx0, lidY - 1); ctx.quadraticCurveTo(tx0 + tw2 * 0.5, lidY - 3, tx0 + tw2, lidY - 1); ctx.lineTo(cx + cw2 / 2 + 2, lidY + 2);
        ctx.lineTo(cx + cw2 / 2 + 3, lidY + drop); ctx.quadraticCurveTo(cx + cw2 / 2 - 2, lidY + drop + 4, cx + cw2 / 2 - 6, lidY + drop - 1); ctx.lineTo(cx + cw2 / 2 - 6, lidY + 4); ctx.lineTo(tx0, lidY + 3); ctx.closePath();
        ctx.clip();
        for (let k = -4; k < 12; k++) { ctx.fillStyle = k % 2 ? '#f6c830' : '#e8302a'; ctx.fillRect(tx0 - 10 + k * 5, lidY - 6, 5, drop + 12); }
        const tsh = ctx.createLinearGradient(cx + cw2 / 2 - 6, 0, cx + cw2 / 2 + 3, 0); tsh.addColorStop(0, 'rgba(0,0,0,0)'); tsh.addColorStop(1, 'rgba(60,20,10,0.35)');
        ctx.fillStyle = tsh; ctx.fillRect(cx + cw2 / 2 - 6, lidY, 10, drop + 6);
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; for (let k = 0; k < 3; k++) ctx.fillRect(cx + cw2 / 2 - 5 + k * 3, lidY + drop + 1.5, 0.8, 2.5);   // fringe
      }
    }
    // A pair of thongs (flip-flops) kicked off beside the cool box
    {
      const fx = W * 0.232, fy = PAVE + H * 0.088;
      [[0, 0.10, '#0a7a40'], [W * 0.030, -0.22, '#f2c440']].forEach(([dx, rot, col]) => {
        ctx.save(); ctx.translate(fx + dx, fy - (dx ? H * 0.006 : 0)); ctx.rotate(rot);
        const L = W * 0.034, Wd = H * 0.016;
        ctx.fillStyle = 'rgba(30,40,60,0.30)'; ctx.beginPath(); ctx.ellipse(2.5, 1.5, L * 0.55, Wd * 0.62, 0, 0, PI * 2); ctx.fill();
        ctx.fillStyle = '#2a2a30'; ctx.beginPath(); ctx.ellipse(0, 0.8, L * 0.52, Wd * 0.58, 0, 0, PI * 2); ctx.fill();   // sole edge
        ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, L * 0.50, Wd * 0.55, 0, 0, PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(-L * 0.12, -Wd * 0.18, L * 0.25, Wd * 0.16, 0, 0, PI * 2); ctx.fill();
        ctx.strokeStyle = '#f4f4f0'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';   // the V strap
        ctx.beginPath(); ctx.moveTo(-L * 0.30, -Wd * 0.05); ctx.lineTo(-L * 0.05, -Wd * 0.35); ctx.lineTo(L * 0.10, Wd * 0.30); ctx.stroke();
        ctx.restore();
      });
    }
    // Sandstone bollard on the quay (the kookaburra on it is drawn each frame)
    {
      const bx = W * 0.865, bTop = H * 0.560, bW = W * 0.034, bBase = PAVE + H * 0.050;
      ctx.fillStyle = 'rgba(30,40,60,0.35)'; ctx.beginPath(); ctx.ellipse(bx + 3, bBase + 1, bW * 0.8, H * 0.008, 0, 0, PI * 2); ctx.fill();
      const sg = ctx.createLinearGradient(bx - bW / 2, 0, bx + bW / 2, 0);
      sg.addColorStop(0, '#f0c890'); sg.addColorStop(0.5, '#c89a68'); sg.addColorStop(1, '#7a5a50');
      ctx.fillStyle = sg; ctx.fillRect(bx - bW / 2, bTop, bW, bBase - bTop);
      ctx.fillStyle = '#f2d0a0'; ctx.fillRect(bx - bW * 0.58, bTop - 3, bW * 1.16, 4);
    }

    // ════════ HERO KIT — stumps and ball beside the plinth (the cup is drawn each frame) ════════
    {
      const sx = W * 0.665, base = H * 0.700, sh = H * 0.165, top = base - sh;
      const gap = W * 0.021, r = W * 0.0058;
      const shg = ctx.createLinearGradient(0, base, 0, base + H * 0.10);
      shg.addColorStop(0, 'rgba(30,40,60,0.45)'); shg.addColorStop(1, 'rgba(30,40,60,0)');
      ctx.fillStyle = shg;
      ctx.beginPath(); ctx.moveTo(sx - gap * 1.2, base); ctx.lineTo(sx + gap * 1.2, base); ctx.lineTo(sx + gap * 3.4, base + H * 0.08); ctx.lineTo(sx + gap * 0.6, base + H * 0.08); ctx.closePath(); ctx.fill();
      [-gap, 0, gap].forEach(dx => {
        const x = sx + dx;
        const g = ctx.createLinearGradient(x - r, 0, x + r, 0);
        g.addColorStop(0, '#ffd8a0'); g.addColorStop(0.3, '#f8e2b8'); g.addColorStop(0.65, '#c89060'); g.addColorStop(1, '#7a4a28');
        ctx.fillStyle = g; ctx.fillRect(x - r, top, r * 2, sh);
        ctx.fillStyle = '#f2c440'; ctx.fillRect(x - r, top + sh * 0.18, r * 2, sh * 0.10);
        ctx.fillStyle = '#0a7a40'; ctx.fillRect(x - r, top + sh * 0.21, r * 2, sh * 0.04);
        ctx.fillStyle = '#fff2d8'; ctx.beginPath(); ctx.ellipse(x, top, r, r * 0.55, 0, 0, PI * 2); ctx.fill();
        ctx.fillStyle = '#2a2436'; ctx.fillRect(x - r * 1.6, base - 2, r * 3.2, 3);
      });
      ctx.fillStyle = '#2a2436'; ctx.fillRect(sx - gap - r * 2, base - 1, gap * 2 + r * 4, 2);
      const bh = H * 0.009;
      [[sx - gap - r * 0.6, sx - r * 0.2], [sx + r * 0.2, sx + gap + r * 0.6]].forEach(([b0, b1]) => {
        const bg = ctx.createLinearGradient(0, top - bh, 0, top + 1);
        bg.addColorStop(0, '#fff6e2'); bg.addColorStop(1, '#b08048');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(b0, top - bh * 0.8, b1 - b0, bh, bh * 0.45); ctx.fill();
      });
      const bx = W * 0.718, by = base - H * 0.010, br = H * 0.018;
      ctx.fillStyle = 'rgba(30,40,60,0.40)'; ctx.beginPath(); ctx.ellipse(bx + br * 0.7, by + br + 1, br * 1.3, br * 0.28, 0.15, 0, PI * 2); ctx.fill();
      const rg = ctx.createRadialGradient(bx - br * 0.25, by - br * 0.5, br * 0.1, bx, by, br);
      rg.addColorStop(0, '#ff8a6a'); rg.addColorStop(0.5, '#c81e1e'); rg.addColorStop(1, '#5a0a0a');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(bx, by, br, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,240,220,0.85)'; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.ellipse(bx, by, br * 0.30, br * 0.98, 0.35, 0, PI * 2); ctx.stroke();
    }
  }

  // Haze and vignette over everything, the turning cup included
  function drawAtmos(ctx, W, H) {
    const VY = H * 0.440;
    const haze = ctx.createLinearGradient(0, H * 0.30, 0, VY + H * 0.04);
    haze.addColorStop(0, 'rgba(210,235,250,0)'); haze.addColorStop(1, 'rgba(210,235,250,0.22)');
    ctx.fillStyle = haze; ctx.fillRect(0, H * 0.30, W, VY + H * 0.04 - H * 0.30);
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.42, W * 0.20, W * 0.5, H * 0.42, W * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(0.7, 'rgba(10,30,60,0.04)'); vig.addColorStop(1, 'rgba(10,30,60,0.22)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  }

  // ════════ THE BLAZE CUP — a tall gold-and-green cone goblet, boomerang handles, leaping kangaroo ════════
  // Its own silhouette (the Blast Cup is a round tulip on a square plinth): a flared cone bowl on a slender
  // two-collar stem, standing on a round stepped plinth. phi = turn angle (0 = Southern Cross facing us).
  function drawTrophy(ctx, W, H, phi, t) {
    const FONT = (wt, px) => `${wt} ${px}px 'Barlow Condensed', 'Arial Narrow', sans-serif`;
    const glow = (x, y, r, col) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    };
    const limb = (x1, y1, x2, y2, w, col) => {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    };
    const star = (x, y, r, n) => {
      ctx.beginPath();
      for (let k = 0; k < n * 2; k++) { const a = -PI / 2 + k * PI / n, rr = k % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill();
    };
    const tx = W * 0.5, tb = H * 0.705, S = H * 0.390, K = 1.50;
    const TILT = 0.08;
    const GREEN = '#0a7a40', GREEN_D = '#065a2e', GOLD = '#f2c440';

    ctx.save(); ctx.translate(tx, tb); ctx.scale(K, K); ctx.translate(-tx, -tb);
    const gold = (x0, x1) => {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, '#6a4410'); g.addColorStop(0.12, '#ffe2a0'); g.addColorStop(0.30, '#fff6d8');
      g.addColorStop(0.48, '#f0c860'); g.addColorStop(0.68, '#9a6a1a'); g.addColorStop(0.86, '#d8a840'); g.addColorStop(1, '#5a3a08');
      return g;
    };
    glow(tx, tb - S * 0.58, W * 0.20, 'rgba(255,250,230,0.10)');
    const shg = ctx.createLinearGradient(0, tb, 0, tb + H * 0.10);
    shg.addColorStop(0, 'rgba(30,40,60,0.45)'); shg.addColorStop(1, 'rgba(30,40,60,0)');
    ctx.fillStyle = shg;
    ctx.beginPath(); ctx.moveTo(tx - W * 0.06, tb); ctx.lineTo(tx + W * 0.06, tb); ctx.lineTo(tx + W * 0.15, tb + H * 0.10); ctx.lineTo(tx + W * 0.01, tb + H * 0.10); ctx.closePath(); ctx.fill();

    // ── Round stepped plinth in dark jarrah, green-and-gold bands, curved brass plate ──
    const pB = tb, pH = S * 0.17, pW = W * 0.066, eR = S * 0.030;
    const wd = ctx.createLinearGradient(tx - pW, 0, tx + pW, 0);
    wd.addColorStop(0, '#9a4a2c'); wd.addColorStop(0.3, '#6a2a18'); wd.addColorStop(0.75, '#3a140a'); wd.addColorStop(1, '#1a0806');
    function drum(cy, h, r) {   // a cylinder: cy = bottom centre
      ctx.fillStyle = wd;
      ctx.beginPath(); ctx.moveTo(tx - r, cy - h); ctx.lineTo(tx - r, cy); ctx.ellipse(tx, cy, r, eR * r / pW, 0, PI, 0, true); ctx.lineTo(tx + r, cy - h); ctx.closePath(); ctx.fill();
      const top = ctx.createLinearGradient(tx - r, 0, tx + r, 0);
      top.addColorStop(0, '#b0603a'); top.addColorStop(1, '#4a1c10');
      ctx.fillStyle = top; ctx.beginPath(); ctx.ellipse(tx, cy - h, r, eR * r / pW, 0, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,190,150,0.45)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(tx, cy - h, r, eR * r / pW, 0, PI * 0.9, PI * 1.6); ctx.stroke();
    }
    drum(pB, pH, pW);
    // Bands wrap round the drum
    [[0.78, GOLD], [0.70, GREEN]].forEach(([f, col]) => {
      ctx.strokeStyle = col; ctx.lineWidth = pH * 0.075;
      ctx.beginPath(); ctx.ellipse(tx, pB - pH * f, pW, eR, 0, 0, PI); ctx.stroke();
    });
    const plate = ctx.createLinearGradient(0, pB - pH * 0.55, 0, pB - pH * 0.10);
    plate.addColorStop(0, '#f6dc90'); plate.addColorStop(1, '#a8803a');
    ctx.fillStyle = plate; ctx.beginPath();
    ctx.moveTo(tx - pW * 0.82, pB - pH * 0.60); ctx.quadraticCurveTo(tx, pB - pH * 0.60 + eR * 1.1, tx + pW * 0.82, pB - pH * 0.60);
    ctx.lineTo(tx + pW * 0.82, pB - pH * 0.10); ctx.quadraticCurveTo(tx, pB - pH * 0.10 + eR * 1.1, tx - pW * 0.82, pB - pH * 0.10); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(120,80,20,0.6)'; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.save(); ctx.fillStyle = '#3a2408'; ctx.font = FONT(900, pH * 0.22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('THE BLAZE CUP', tx, pB - pH * 0.42 + eR * 0.55, pW * 1.5);
    ctx.font = FONT(700, pH * 0.135); ctx.fillText('AUSTRALIAN CRICKET LEAGUE', tx, pB - pH * 0.22 + eR * 0.55, pW * 1.5); ctx.restore();
    const p2H = S * 0.065;
    drum(pB - pH, p2H, pW * 0.70);

    // ── Domed foot and a tall slender stem with two green collars ──
    const footY = pB - pH - p2H, footW = W * 0.038;
    ctx.fillStyle = gold(tx - footW, tx + footW);
    ctx.beginPath(); ctx.ellipse(tx, footY, footW, eR * 0.6, 0, 0, PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx - footW, footY); ctx.quadraticCurveTo(tx - footW * 0.9, footY - S * 0.04, tx - footW * 0.18, footY - S * 0.045);
    ctx.lineTo(tx + footW * 0.18, footY - S * 0.045); ctx.quadraticCurveTo(tx + footW * 0.9, footY - S * 0.04, tx + footW, footY); ctx.closePath(); ctx.fill();
    const stemBase = footY - S * 0.045, stemTop = stemBase - S * 0.175, sw = footW * 0.16;
    ctx.fillStyle = gold(tx - sw * 2, tx + sw * 2);
    ctx.beginPath(); ctx.moveTo(tx - sw * 1.3, stemBase); ctx.quadraticCurveTo(tx - sw * 0.8, (stemBase + stemTop) / 2, tx - sw * 1.2, stemTop);
    ctx.lineTo(tx + sw * 1.2, stemTop); ctx.quadraticCurveTo(tx + sw * 0.8, (stemBase + stemTop) / 2, tx + sw * 1.3, stemBase); ctx.closePath(); ctx.fill();
    const kg = ctx.createLinearGradient(tx - footW * 0.45, 0, tx + footW * 0.45, 0);
    kg.addColorStop(0, '#2aaa6a'); kg.addColorStop(0.4, GREEN); kg.addColorStop(1, '#033a1c');
    [0.30, 0.72].forEach(f => {
      const y = stemBase + (stemTop - stemBase) * f;
      ctx.fillStyle = kg; ctx.beginPath(); ctx.ellipse(tx, y, sw * 2.6, S * 0.014, 0, 0, PI * 2); ctx.fill();
      ctx.fillStyle = gold(tx - sw * 3, tx + sw * 3); ctx.fillRect(tx - sw * 2.6, y - S * 0.016, sw * 5.2, S * 0.004); ctx.fillRect(tx - sw * 2.6, y + S * 0.012, sw * 5.2, S * 0.004);
    });

    // ── Cone bowl geometry ──
    const bot = stemTop, rimY = stemTop - S * 0.27, cw = W * 0.064, botR = sw * 1.2;
    const prof = (u) => {
      const a = (1 - u) ** 3, b = 3 * u * (1 - u) ** 2, c = 3 * u * u * (1 - u), d = u ** 3;
      return [a * cw + b * cw * 0.90 + c * cw * 0.32 + d * botR, a * rimY + b * (rimY + S * 0.11) + c * (bot - S * 0.05) + d * bot];
    };
    const radiusAt = (y) => { let best = cw, bd = 1e9; for (let i = 0; i <= 80; i++) { const [r, yy] = prof(i / 80); const dd = Math.abs(yy - y); if (dd < bd) { bd = dd; best = r; } } return best; };
    const bowlPath = () => {
      ctx.beginPath(); ctx.moveTo(tx - cw, rimY);
      ctx.bezierCurveTo(tx - cw * 0.90, rimY + S * 0.11, tx - cw * 0.32, bot - S * 0.05, tx - botR, bot);
      ctx.lineTo(tx + botR, bot);
      ctx.bezierCurveTo(tx + cw * 0.32, bot - S * 0.05, tx + cw * 0.90, rimY + S * 0.11, tx + cw, rimY);
      ctx.closePath();
    };
    const P = (r, y, a) => [tx + r * Math.sin(a), y + r * Math.cos(a) * TILT];

    // ── Boomerang handles: a curved, banana-shaped blade, thick at the elbow, rounded tips ──
    const handles = [
      { a: phi - PI / 2, ribbon: [GREEN, GREEN_D] },
      { a: phi + PI / 2, ribbon: [GOLD, '#b8861c'] },
    ];
    function boomerangPts(a) {
      const yA = rimY + S * 0.035, yB = rimY + S * 0.185;
      const A = [radiusAt(yA) * 0.96, yA], B = [radiusAt(yB) * 0.96, yB];
      const E = [cw * 1.42, rimY + S * 0.100];
      const C1 = [cw * 1.28, rimY + S * 0.010], C2 = [cw * 1.32, rimY + S * 0.170];
      const q = (p0, c, p1, s) => [(1 - s) ** 2 * p0[0] + 2 * (1 - s) * s * c[0] + s * s * p1[0], (1 - s) ** 2 * p0[1] + 2 * (1 - s) * s * c[1] + s * s * p1[1]];
      const N = 28, cl = [];
      for (let i = 0; i <= N; i++) { const s = i / N; cl.push(s <= 0.5 ? q(A, C1, E, s * 2) : q(E, C2, B, (s - 0.5) * 2)); }
      const left = [], right = [];
      for (let i = 0; i <= N; i++) {
        const p = cl[i], pa = cl[Math.max(0, i - 1)], pb = cl[Math.min(N, i + 1)];
        let dx = pb[0] - pa[0], dy = pb[1] - pa[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
        const s = i / N, wHalf = S * (0.008 + 0.015 * Math.sin(PI * s));
        left.push([p[0] - dy * wHalf, p[1] + dx * wHalf]); right.push([p[0] + dy * wHalf, p[1] - dx * wHalf]);
      }
      return { outline: left.concat(right.reverse()).map(([r, y]) => P(r, y, a)), centre: cl.map(([r, y]) => P(r, y, a)), elbow: P(E[0], E[1], a) };
    }
    function drawHandle(h) {
      const a = h.a, back = Math.cos(a) < 0, b = boomerangPts(a);
      ctx.fillStyle = gold(tx - cw * 2.0, tx + cw * 2.0);
      ctx.beginPath(); b.outline.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(90,55,10,0.55)'; ctx.lineWidth = 0.6; ctx.stroke();
      // Green enamel inlay running along the blade
      ctx.strokeStyle = GREEN; ctx.lineWidth = W * 0.0022; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); b.centre.slice(3, -3).forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke();
      if (back) { ctx.fillStyle = 'rgba(30,20,50,0.35)'; ctx.beginPath(); b.outline.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); ctx.fill(); }
      // Ribbon tied at the elbow
      const [hx, hy] = b.elbow;
      let f = Math.sin(a); if (Math.abs(f) < 0.25) f = 0.25 * (f < 0 ? -1 : 1);
      ctx.fillStyle = h.ribbon[0];
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + f * W * 0.004, hy + S * 0.08, hx - f * W * 0.001, hy + S * 0.15);
      ctx.lineTo(hx + f * W * 0.005, hy + S * 0.13); ctx.lineTo(hx + f * W * 0.011, hy + S * 0.155);
      ctx.quadraticCurveTo(hx + f * W * 0.012, hy + S * 0.075, hx + f * W * 0.007, hy - S * 0.004); ctx.closePath(); ctx.fill();
      if (back) { ctx.fillStyle = 'rgba(30,20,50,0.30)'; ctx.fill(); }
      ctx.fillStyle = h.ribbon[1]; ctx.beginPath(); ctx.ellipse(hx + f * W * 0.003, hy, W * 0.006 * Math.max(0.4, Math.abs(f)), S * 0.011, 0, 0, PI * 2); ctx.fill();
    }
    handles.filter(h => Math.cos(h.a) < 0).forEach(drawHandle);

    // ── Bowl, reflections, fluting, enamel band ──
    ctx.fillStyle = gold(tx - cw, tx + cw); bowlPath(); ctx.fill();
    ctx.save(); bowlPath(); ctx.clip();
    const yH = rimY + S * 0.115, bend = (x) => ((x - tx) / cw) ** 2 * S * 0.04;
    ctx.fillStyle = 'rgba(90,160,230,0.30)';
    ctx.beginPath(); for (let x = tx - cw * 1.05; x <= tx + cw * 1.05; x += 2) ctx.lineTo(x, yH - S * 0.050 + bend(x));
    for (let x = tx + cw * 1.05; x >= tx - cw * 1.05; x -= 2) ctx.lineTo(x, yH + bend(x)); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(60,80,110,0.45)';
    ctx.beginPath(); ctx.moveTo(tx - cw * 1.05, yH + S * 0.03 + bend(tx - cw * 1.05));
    for (let x = tx - cw * 1.05; x <= tx + cw * 1.05; x += 1.5) {
      const u = (x - tx) / cw, sq = 1 - 0.55 * u * u;
      const bump = (u < -0.45 && u > -0.85 ? 0.032 * Math.max(0, Math.sin((u + 0.85) / 0.4 * PI)) : 0) + (Math.sin(u * 19.0) > 0.6 ? 0.020 : 0) + Math.abs(Math.sin(u * 37)) * 0.008;
      ctx.lineTo(x, yH + bend(x) - S * bump * sq);
    }
    ctx.lineTo(tx + cw * 1.05, yH + S * 0.03 + bend(tx + cw * 1.05));
    for (let x = tx + cw * 1.05; x >= tx - cw * 1.05; x -= 2) ctx.lineTo(x, yH + S * 0.03 + bend(x));
    ctx.closePath(); ctx.fill();
    const lowG = ctx.createLinearGradient(0, yH + S * 0.03, 0, bot);
    lowG.addColorStop(0, 'rgba(20,80,140,0.28)'); lowG.addColorStop(1, 'rgba(20,80,140,0.05)');
    ctx.fillStyle = lowG; ctx.fillRect(tx - cw * 1.1, yH + S * 0.03, cw * 2.2, bot - yH);
    const sunR = ctx.createRadialGradient(tx - cw * 0.55, rimY + S * 0.04, 0, tx - cw * 0.55, rimY + S * 0.04, cw * 0.30);
    sunR.addColorStop(0, 'rgba(255,250,235,0.45)'); sunR.addColorStop(0.35, 'rgba(255,240,210,0.18)'); sunR.addColorStop(1, 'rgba(255,200,140,0)');
    ctx.fillStyle = sunR; ctx.beginPath(); ctx.ellipse(tx - cw * 0.55, rimY + S * 0.04, cw * 0.30, S * 0.045, 0, 0, PI * 2); ctx.fill();
    ctx.restore();
    // Long vertical facets down the cone, turning with the cup
    for (let k = 0; k < 20; k++) {
      const th = phi + k * PI / 10 + PI / 20, c = Math.cos(th); if (c <= 0.04) continue;
      const s = Math.sin(th);
      ctx.strokeStyle = `rgba(90,55,10,${0.08 + 0.28 * c})`; ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (let i = 0; i <= 12; i++) { const [r, y] = prof(0.30 + 0.68 * i / 12); const x = tx + r * s, yy = y + r * c * TILT; i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(10,122,64,0.92)'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(tx - cw * 0.985, rimY + S * 0.030); ctx.quadraticCurveTo(tx, rimY + S * 0.058, tx + cw * 0.985, rimY + S * 0.030); ctx.stroke();

    // ── Emblems: Southern Cross shield on the front, ACL roundel on the back ──
    const ey = rimY + S * 0.115, er = radiusAt(ey) * 0.96, es = cw * 0.25;
    function emblem(a, drawFn) {
      const c = Math.cos(a); if (c <= 0) return;
      ctx.save(); ctx.globalAlpha = Math.min(1, c * 3.5);
      ctx.translate(tx + er * Math.sin(a), ey + er * c * TILT); ctx.scale(c, 1);
      drawFn(); ctx.restore();
    }
    emblem(phi, () => {
      const shield = () => { ctx.beginPath(); ctx.moveTo(-es * 0.82, -es * 0.88); ctx.lineTo(es * 0.82, -es * 0.88); ctx.lineTo(es * 0.82, es * 0.05); ctx.quadraticCurveTo(es * 0.78, es * 0.78, 0, es * 1.08); ctx.quadraticCurveTo(-es * 0.78, es * 0.78, -es * 0.82, es * 0.05); ctx.closePath(); };
      const sg2 = ctx.createLinearGradient(-es, -es, es, es);
      sg2.addColorStop(0, '#1aa060'); sg2.addColorStop(1, '#044a24');
      ctx.fillStyle = sg2; shield(); ctx.fill();
      ctx.fillStyle = '#fffaf0';
      star(0, -es * 0.50, es * 0.17, 7); star(-es * 0.42, -es * 0.02, es * 0.15, 7); star(es * 0.40, -es * 0.15, es * 0.15, 7);
      star(0, es * 0.52, es * 0.18, 7); star(es * 0.20, es * 0.12, es * 0.09, 5);
      ctx.strokeStyle = GOLD; ctx.lineWidth = 1.3; shield(); ctx.stroke();
    });
    emblem(phi + PI, () => {
      const rr = es * 1.0;
      ctx.fillStyle = GREEN; ctx.beginPath(); ctx.arc(0, 0, rr, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = GOLD; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, 0, rr * 0.86, 0, PI * 2); ctx.stroke();
      ctx.fillStyle = GOLD; ctx.font = FONT(900, rr * 0.82); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ACL', 0, rr * 0.06);
    });

    // ── Flared rim and a low lid ──
    ctx.fillStyle = gold(tx - cw * 1.10, tx + cw * 1.10); ctx.beginPath(); ctx.ellipse(tx, rimY, cw * 1.10, S * 0.024, 0, 0, PI * 2); ctx.fill();
    ctx.fillStyle = '#4a2a08'; ctx.beginPath(); ctx.ellipse(tx, rimY, cw * 0.96, S * 0.016, 0, 0, PI * 2); ctx.fill();
    ctx.fillStyle = gold(tx - cw * 0.96, tx + cw * 0.96);
    ctx.beginPath(); ctx.moveTo(tx - cw * 0.96, rimY - S * 0.004); ctx.bezierCurveTo(tx - cw * 0.80, rimY - S * 0.060, tx + cw * 0.80, rimY - S * 0.060, tx + cw * 0.96, rimY - S * 0.004); ctx.closePath(); ctx.fill();
    const domeY = rimY - S * 0.045;
    ctx.fillStyle = kg; ctx.beginPath(); ctx.ellipse(tx, domeY, cw * 0.34, S * 0.020, 0, PI, PI * 2); ctx.fill();
    ctx.fillStyle = gold(tx - cw * 0.36, tx + cw * 0.36); ctx.fillRect(tx - cw * 0.36, domeY, cw * 0.72, S * 0.010);

    // ── Leaping kangaroo: one clean silhouette, crouched to spring, tail sweeping back to the dome ──
    {
      const c = Math.cos(phi), sx = Math.abs(c) < 0.08 ? (c < 0 ? -0.08 : 0.08) : c;
      const u = cw * 0.60;
      ctx.save(); ctx.translate(tx + u * 0.05, domeY - S * 0.004); ctx.scale(sx, 1);
      const kgold = ctx.createLinearGradient(-u * 1.2, -u * 1.9, u * 0.8, 0);
      kgold.addColorStop(0, '#fff4c8'); kgold.addColorStop(0.35, '#f2c440'); kgold.addColorStop(0.75, '#b07c18'); kgold.addColorStop(1, '#5a3a08');
      const roo = () => {
        ctx.beginPath();
        ctx.moveTo(u * 0.46, -u * 0.01);                                  // toe tip
        ctx.lineTo(-u * 0.30, -u * 0.01);                                 // sole to heel
        ctx.quadraticCurveTo(-u * 0.42, -u * 0.06, -u * 0.40, -u * 0.20); // heel up the back of the leg
        ctx.quadraticCurveTo(-u * 0.48, -u * 0.34, -u * 0.58, -u * 0.40); // into the base of the tail
        ctx.quadraticCurveTo(-u * 1.00, -u * 0.30, -u * 1.42, -u * 0.02); // tail underside to the tip (resting on the dome)
        ctx.quadraticCurveTo(-u * 1.05, -u * 0.46, -u * 0.52, -u * 0.74); // tail top back to the rump
        ctx.quadraticCurveTo(-u * 0.38, -u * 1.08, -u * 0.05, -u * 1.28); // rump curving over the back
        ctx.quadraticCurveTo(u * 0.12, -u * 1.40, u * 0.18, -u * 1.52);   // shoulders to the back of the head
        ctx.quadraticCurveTo(u * 0.10, -u * 1.70, u * 0.10, -u * 1.86);   // back ear up
        ctx.quadraticCurveTo(u * 0.20, -u * 1.74, u * 0.24, -u * 1.60);
        ctx.quadraticCurveTo(u * 0.27, -u * 1.76, u * 0.31, -u * 1.88);   // front ear up
        ctx.quadraticCurveTo(u * 0.38, -u * 1.72, u * 0.36, -u * 1.60);
        ctx.quadraticCurveTo(u * 0.52, -u * 1.62, u * 0.66, -u * 1.50);   // forehead to the snout
        ctx.quadraticCurveTo(u * 0.62, -u * 1.42, u * 0.44, -u * 1.40);   // jaw
        ctx.quadraticCurveTo(u * 0.36, -u * 1.30, u * 0.36, -u * 1.16);   // throat
        ctx.quadraticCurveTo(u * 0.50, -u * 1.08, u * 0.56, -u * 0.94);   // forearm reaching forward
        ctx.quadraticCurveTo(u * 0.50, -u * 0.90, u * 0.36, -u * 0.98);
        ctx.quadraticCurveTo(u * 0.40, -u * 0.70, u * 0.26, -u * 0.46);   // belly down to the knee
        ctx.quadraticCurveTo(u * 0.20, -u * 0.22, u * 0.06, -u * 0.12);   // shin
        ctx.quadraticCurveTo(u * 0.30, -u * 0.08, u * 0.46, -u * 0.01);   // top of the long foot
        ctx.closePath();
      };
      ctx.fillStyle = kgold; roo(); ctx.fill();
      // Muscle and fur shading: thigh, chest; a warm rim of sunset along the back
      ctx.save(); roo(); ctx.clip();
      ctx.fillStyle = 'rgba(90,55,10,0.30)'; ctx.beginPath(); ctx.ellipse(-u * 0.12, -u * 0.55, u * 0.30, u * 0.36, -0.4, 0, PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,245,210,0.15)'; ctx.beginPath(); ctx.ellipse(-u * 0.20, -u * 0.62, u * 0.12, u * 0.22, -0.4, 0, PI * 2); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,240,200,0.45)'; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(-u * 0.52, -u * 0.76); ctx.quadraticCurveTo(-u * 0.38, -u * 1.08, -u * 0.05, -u * 1.28); ctx.quadraticCurveTo(u * 0.12, -u * 1.40, u * 0.18, -u * 1.52); ctx.stroke();
      ctx.fillStyle = '#3a2406'; ctx.beginPath(); ctx.arc(u * 0.42, -u * 1.52, u * 0.035, 0, PI * 2); ctx.fill();   // eye
      ctx.restore();
    }

    handles.filter(h => Math.cos(h.a) >= 0).forEach(drawHandle);

    // ── Fixed lighting + sparkles ──
    ctx.fillStyle = 'rgba(255,255,240,0.30)';
    ctx.beginPath(); ctx.moveTo(tx - cw * 0.74, rimY + S * 0.03); ctx.quadraticCurveTo(tx - cw * 0.70, rimY + S * 0.13, tx - cw * 0.30, rimY + S * 0.22);
    ctx.lineTo(tx - cw * 0.25, rimY + S * 0.21); ctx.quadraticCurveTo(tx - cw * 0.58, rimY + S * 0.12, tx - cw * 0.62, rimY + S * 0.03); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,245,0.45)'; ctx.lineWidth = 1.0;
    ctx.beginPath(); ctx.moveTo(tx - cw, rimY + S * 0.01); ctx.bezierCurveTo(tx - cw * 0.90, rimY + S * 0.11, tx - cw * 0.32, bot - S * 0.05, tx - botR, bot); ctx.stroke();
    const sparkle = (x, y, s) => {
      if (s < 0.6) return;
      glow(x, y, s * 3, 'rgba(255,235,190,0.7)');
      ctx.fillStyle = 'rgba(255,255,240,0.97)';
      ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.18, y - s * 0.18); ctx.lineTo(x + s, y); ctx.lineTo(x + s * 0.18, y + s * 0.18); ctx.lineTo(x, y + s); ctx.lineTo(x - s * 0.18, y + s * 0.18); ctx.lineTo(x - s, y); ctx.lineTo(x - s * 0.18, y - s * 0.18); ctx.closePath(); ctx.fill();
    };
    ctx.restore();

    // One bat leaning on the plinth (green grip, gold sticker)
    const plinthL = tx - W * 0.066 * K;
    function bat(toeX, toeY, topX, topY, gripCol) {
      const ang = Math.atan2(topY - toeY, topX - toeX), len = Math.hypot(topX - toeX, topY - toeY);
      ctx.save(); ctx.translate(toeX, toeY); ctx.rotate(ang);
      const bw = W * 0.020, bl = len * 0.64;
      const g = ctx.createLinearGradient(0, -bw / 2, 0, bw / 2);
      g.addColorStop(0, '#ffe0a8'); g.addColorStop(0.35, '#f0d4a0'); g.addColorStop(1, '#b08a58');
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(0, -bw / 2, bl, bw, bw * 0.28); ctx.fill();
      ctx.fillStyle = 'rgba(120,80,40,0.25)'; ctx.fillRect(bl * 0.12, -bw * 0.06, bl * 0.80, bw * 0.12);
      ctx.fillStyle = GREEN; ctx.fillRect(bl * 0.55, -bw / 2, bl * 0.10, bw);
      ctx.fillStyle = GOLD; ctx.fillRect(bl * 0.57, -bw / 2, bl * 0.06, bw);
      ctx.fillStyle = '#e8c890'; ctx.beginPath(); ctx.moveTo(bl, -bw / 2); ctx.quadraticCurveTo(bl + bw * 0.5, -bw * 0.2, bl + bw * 0.6, -bw * 0.17); ctx.lineTo(bl + bw * 0.6, bw * 0.17); ctx.quadraticCurveTo(bl + bw * 0.5, bw * 0.2, bl, bw / 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = gripCol; ctx.fillRect(bl + bw * 0.55, -bw * 0.17, len - bl - bw * 0.55, bw * 0.34);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let x = bl + bw * 0.8; x < len - 2; x += 3) ctx.fillRect(x, -bw * 0.17, 1, bw * 0.34);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.arc(len, 0, bw * 0.19, 0, PI * 2); ctx.fill();
      ctx.restore();
      ctx.fillStyle = 'rgba(30,40,60,0.30)'; ctx.beginPath(); ctx.ellipse(toeX + W * 0.024, toeY + 2.5, W * 0.026, H * 0.007, 0.12, 0, PI * 2); ctx.fill();
    }
    bat(plinthL - W * 0.058, tb - H * 0.002, plinthL + W * 0.006, tb - H * 0.140, GREEN);
  }

  // ════════ CLOUDS — soft cumulus painted once into sprites, gliding steadily across the sky ════════
  const CLOUDS = (() => {
    const make = (w, h, seed) => {
      let s = seed; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
      const a = document.createElement('canvas'); a.width = w; a.height = h; const g = a.getContext('2d');
      g.fillStyle = '#ffffff';
      const base = h * 0.78;
      for (let k = 0; k < 14; k++) { const u = k / 13, x = w * (0.12 + 0.76 * u + (r() - 0.5) * 0.05), rad = h * (0.18 + 0.30 * Math.sin(u * Math.PI) * (0.75 + r() * 0.4)); g.beginPath(); g.arc(x, Math.min(base - rad * 0.55, base - h * 0.05), rad, 0, Math.PI * 2); g.fill(); }
      g.fillRect(w * 0.10, base - h * 0.16, w * 0.80, h * 0.16);
      g.globalCompositeOperation = 'source-atop';
      const sh = g.createLinearGradient(0, h * 0.15, 0, base);
      sh.addColorStop(0, 'rgba(255,255,252,1)'); sh.addColorStop(0.6, 'rgba(242,248,255,1)'); sh.addColorStop(1, 'rgba(184,206,232,1)');
      g.fillStyle = sh; g.fillRect(0, 0, w, h);
      const lit = g.createRadialGradient(w * 0.25, h * 0.1, 0, w * 0.25, h * 0.1, w * 0.5);    // the sun is high on the left
      lit.addColorStop(0, 'rgba(255,252,235,0.6)'); lit.addColorStop(1, 'rgba(255,252,235,0)');
      g.fillStyle = lit; g.fillRect(0, 0, w, h);
      const b = document.createElement('canvas'); b.width = w; b.height = h; const gb = b.getContext('2d');
      gb.filter = 'blur(2px)'; gb.globalAlpha = 0.95; gb.drawImage(a, 0, 0);
      return b;
    };
    return [make(150, 60, 7), make(110, 46, 19), make(190, 70, 33)];
  })();
  function drawClouds(ctx, W, H, t) {
    // Same speed, evenly spread round the loop so they never bunch; the sun (top left) starts clear
    [[2, 0.025, 0.36, 0.95], [0, 0.140, 0.62, 0.80], [1, 0.060, 0.90, 0.70]].forEach(([i, fy, off, sc]) => {
      const spr = CLOUDS[i], w = spr.width * sc, h = spr.height * sc, span = W + 400;
      const x = W + 200 - ((t * 7 + off * span) % span), y = H * fy;
      ctx.drawImage(spr, x - w, y, w, h);
    });
  }

  // ════════ MOVING DETAILS — a harbour ferry and a yacht ════════
  function drawMovers(ctx, W, H, t) {
    // Green-and-cream ferry crossing left to right, behind the cup and the quay railing
    {
      const bx = -W * 0.10 + ((t / 31.7 + 0.62) % 1) * W * 1.20, by = H * 0.515, bw = W * 0.085, bh = H * 0.040;
      ctx.fillStyle = 'rgba(20,15,30,0.35)'; ctx.fillRect(bx - bw * 0.55, by + 1, bw * 1.1, 2);
      ctx.fillStyle = '#0a6a38'; ctx.beginPath(); ctx.moveTo(bx - bw / 2, by - bh * 0.30); ctx.lineTo(bx + bw / 2, by - bh * 0.30); ctx.lineTo(bx + bw * 0.44, by); ctx.lineTo(bx - bw * 0.44, by); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f2c440'; ctx.fillRect(bx - bw / 2, by - bh * 0.32, bw, 1.2);
      ctx.fillStyle = '#f4ecd6'; ctx.fillRect(bx - bw * 0.42, by - bh * 0.62, bw * 0.84, bh * 0.30);
      ctx.fillRect(bx - bw * 0.30, by - bh * 0.86, bw * 0.60, bh * 0.24);
      ctx.fillStyle = '#3a5a7a';
      for (let k = 0; k < 9; k++) ctx.fillRect(bx - bw * 0.40 + k * bw * 0.092, by - bh * 0.56, bw * 0.06, bh * 0.16);
      for (let k = 0; k < 5; k++) ctx.fillRect(bx - bw * 0.27 + k * bw * 0.11, by - bh * 0.80, bw * 0.07, bh * 0.12);
      ctx.fillStyle = '#0a6a38'; ctx.fillRect(bx - bw * 0.04, by - bh * 1.05, bw * 0.08, bh * 0.20);   // funnel
      ctx.fillStyle = '#f2c440'; ctx.fillRect(bx - bw * 0.04, by - bh * 1.05, bw * 0.08, bh * 0.05);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 0.7;
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(bx - bw * (0.45 + k * 0.18), by + k * 0.6); ctx.lineTo(bx - bw * (0.62 + k * 0.18), by + 1.5 + k * 0.6 + Math.sin(t * 3 + k) * 0.5); ctx.stroke(); }
    }
    // A yacht drifting slowly the other way, further out
    {
      const yx = W * 1.05 - ((t / 67.9 + 0.25) % 1) * W * 1.10, yy = H * 0.470, s = H * 0.050;
      ctx.fillStyle = '#f4f0ea'; ctx.beginPath(); ctx.moveTo(yx - s * 0.45, yy - s * 0.10); ctx.lineTo(yx + s * 0.45, yy - s * 0.10); ctx.lineTo(yx + s * 0.35, yy); ctx.lineTo(yx - s * 0.38, yy); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#d8d0c8'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(yx, yy - s * 0.10); ctx.lineTo(yx, yy - s * 1.05); ctx.stroke();
      ctx.fillStyle = 'rgba(255,235,215,0.95)'; ctx.beginPath(); ctx.moveTo(yx + 0.5, yy - s * 1.0); ctx.lineTo(yx + s * 0.42, yy - s * 0.14); ctx.lineTo(yx + 0.5, yy - s * 0.14); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,200,170,0.85)'; ctx.beginPath(); ctx.moveTo(yx - 0.5, yy - s * 0.85); ctx.lineTo(yx - s * 0.30, yy - s * 0.16); ctx.lineTo(yx - 0.5, yy - s * 0.16); ctx.closePath(); ctx.fill();
    }
  }


  // ════════ AMBIENT ANIMATION — six small touches that keep the harbour alive ════════
  // Each one is a pure function of t (seconds), so a frozen t (reduced motion) gives a calm still frame.
  function drawAmbient(ctx, W, H, t) {
    const VY = H * 0.440, WALL = H * 0.590;
    const glow = (x, y, r, col) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    };
    let seed = 77; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

    // 1 ── Sun sheen: every 12s a bright band of sunlight sweeps across the Opera House sails
    {
      const m = t % SHOW, f = (m - 9.0) / 5.5, env = f > 0 && f < 1 ? Math.sin(f * PI) : 0;   // sun sheen: 9.0–14.5s
      if (env > 0.01) {
        const podTop = VY - H * 0.030;
        ctx.save();
        ctx.beginPath();
        OPERA_SHELLS.forEach(([x, w, h, tf]) => {
          const x0 = W * x, ww = W * w, hh = H * h, x1 = x0 + ww, xt = x0 + ww * tf, yt = podTop - hh;
          ctx.moveTo(x0, podTop); ctx.quadraticCurveTo(x0 - ww * 0.02, yt + hh * 0.28, xt, yt); ctx.quadraticCurveTo(x1 - ww * 0.02, podTop - hh * 0.62, x1, podTop); ctx.closePath();
        });
        ctx.clip();
        ctx.globalCompositeOperation = 'lighter';
        const bx = W * (0.00 + f * 0.36);
        const g = ctx.createLinearGradient(bx - W * 0.05, 0, bx + W * 0.05, 0);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, `rgba(255,255,250,${(0.55 * env).toFixed(3)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.save(); ctx.translate(bx, podTop); ctx.transform(1, 0, -0.35, 1, 0, 0); ctx.translate(-bx, -podTop);
        ctx.fillRect(bx - W * 0.05, podTop - H * 0.25, W * 0.10, H * 0.26); ctx.restore();
        ctx.restore();
      }
    }

    // 2 ── Cockatoos: a little flock flapping lazily across the sky, right to left, then round again
    {
      const prog = ((t + 11) / 41.3) % 1, baseX = W * 1.10 - prog * W * 1.30, baseY = H * 0.135 + Math.sin(prog * PI * 2) * H * 0.02;
      [[0, 0], [0.028, 0.018], [-0.030, 0.020], [0.055, 0.004], [0.012, 0.036]].forEach(([dx, dy], i) => {
        const x = baseX + W * dx, y = baseY + H * dy + Math.sin(t * 1.3 + i) * 1.2;
        const flap = Math.sin(t * 7 + i * 1.7);                    // wings up (+1) to down (-1)
        ctx.fillStyle = 'rgba(255,250,240,0.92)';
        ctx.beginPath();
        ctx.moveTo(x - 5.5, y - 2.5 * flap); ctx.quadraticCurveTo(x - 2.5, y - 1.5 - 2 * flap, x, y);
        ctx.quadraticCurveTo(x + 2.5, y - 1.5 - 2 * flap, x + 5.5, y - 2.5 * flap);
        ctx.quadraticCurveTo(x + 2, y - 0.5, x, y + 1.4); ctx.quadraticCurveTo(x - 2, y - 0.5, x - 5.5, y - 2.5 * flap); ctx.fill();
        ctx.fillStyle = 'rgba(255,220,80,0.9)'; ctx.fillRect(x - 2.6, y - 1.2, 1.2, 0.9);   // yellow crest
      });
    }

    // 3 ── Sun glints travel along the steel arch of the Harbour Bridge
    {
      const xc = W * 1.030, half = W * 0.300, upPeak = H * 0.168, upBase = VY - H * 0.070;
      const yUp = (x) => upPeak + (upBase - upPeak) * ((x - xc) / half) ** 2;
      [0, 0.5].forEach(off => {
        const p = ((t + 3.4) / 9.7 + off) % 1, x = xc - half + 6 + p * (W - (xc - half) - 6), y = yUp(x) - 1;
        const a = Math.sin(p * PI);
        glow(x, y, 7, `rgba(255,255,240,${(0.8 * a).toFixed(3)})`);
        ctx.fillStyle = `rgba(255,255,255,${(0.95 * a).toFixed(3)})`;
        ctx.fillRect(x - 4 * a, y - 0.4, 8 * a, 0.8); ctx.fillRect(x - 0.4, y - 4 * a, 0.8, 8 * a);
      });
    }

    // 4 ── Sparkling water: glints along the sun's path flicker on and off and drift with the swell
    {
      for (let i = 0; i < 70; i++) {
        const tt = rnd(), y = VY + 2 + tt * (WALL - VY - 4);
        const x0 = rnd() * W;
        const ph = rnd() * PI * 2, rate = 1.5 + rnd() * 2.5;
        const a = Math.pow(Math.max(0, Math.sin(t * rate + ph)), 6);
        if (a < 0.05) continue;
        const x = x0 + Math.sin(t * 0.8 + ph) * 2;
        ctx.fillStyle = `rgba(255,255,255,${(0.9 * a).toFixed(3)})`;
        ctx.fillRect(x, y, 1.5 + tt * 3.5, 1);
        if (a > 0.7 && tt > 0.4) glow(x + 1, y, 4, `rgba(255,255,255,${(0.6 * a).toFixed(3)})`);
      }
    }

    // 5 ── A train glides across the bridge deck every 22s, appearing from behind the granite pylon
    {
      const cyc = t % SHOW, deck = H * 0.382;   // train: 0–9.5s
      if (cyc < 9.5) {
        const head = W * 0.70 + (cyc / 9.5) * W * 0.70, len = W * 0.24, h = H * 0.020;
        ctx.save(); ctx.beginPath(); ctx.rect(W * 0.737, 0, W, H); ctx.clip();
        for (let c = 0; c < 4; c++) {
          const x1 = head - c * (len / 4), x0 = x1 - len / 4 + 1.5;
          ctx.fillStyle = '#c8ccd8'; ctx.fillRect(x0, deck - h, x1 - x0, h);
          ctx.fillStyle = 'rgba(40,40,60,0.5)'; ctx.fillRect(x0, deck - h * 0.25, x1 - x0, h * 0.25);
          ctx.fillStyle = '#3a5470';
          for (let k = 0; k < 5; k++) ctx.fillRect(x0 + 2 + k * (x1 - x0 - 4) / 5, deck - h * 0.80, (x1 - x0 - 4) / 5 - 1.2, h * 0.32);
          ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(x0, deck - h, x1 - x0, 0.8);
        }
        ctx.fillStyle = '#f2c440'; ctx.fillRect(head - 2.5, deck - h, 2.5, h);
        glow(head + 1, deck - h * 0.4, 3, 'rgba(255,250,220,0.7)');
        ctx.restore();
      }
    }
  }

  // 6 ── The kookaburra: sits still, then every 7s throws its head back and laughs, bobbing, then flicks its tail
  function drawKookaburra(ctx, W, H, t) {
    const kx = W * 0.865, ky = H * 0.560 - 3, s = H * 0.060;
    const m = t % SHOW;
    let laugh = 0, flick = 0, d = 0;
    KOOKA_LAUGHS.forEach(st => {
      const dd = m - st;
      if (dd > 0 && dd < 1.6) { laugh = Math.sin(dd / 1.6 * PI); d = dd; }                  // 0 → 1 → 0
      if (dd > 1.6 && dd < 2.1) flick = Math.sin((dd - 1.6) / 0.5 * PI);
    });
    const chuckle = laugh * (0.5 + 0.5 * Math.sin(d * 34));                                  // quick beak chatter
    const bob = laugh * Math.sin(d * 17) * s * 0.03;
    const limb = (x1, y1, x2, y2, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
    limb(kx - s * 0.08, ky - s * 0.06, kx - s * 0.10, ky, 1.4, '#3a2a1a'); limb(kx + s * 0.06, ky - s * 0.06, kx + s * 0.05, ky, 1.4, '#3a2a1a');
    ctx.save(); ctx.translate(0, bob);
    // Tail (pivots at the rump when it flicks)
    ctx.save(); ctx.translate(kx + s * 0.14, ky - s * 0.21); ctx.rotate(-flick * 0.45);
    ctx.fillStyle = '#6a4a30'; ctx.beginPath(); ctx.moveTo(s * 0.06, -s * 0.09); ctx.lineTo(s * 0.48, s * 0.49); ctx.lineTo(s * 0.32, s * 0.55); ctx.lineTo(-s * 0.06, s * 0.09); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(30,20,10,0.35)'; for (let k = 1; k < 4; k++) ctx.fillRect(s * (0.06 + k * 0.09), s * (0.04 + k * 0.11), s * 0.10, 1);
    ctx.restore();
    ctx.fillStyle = '#5a3e28'; ctx.beginPath(); ctx.ellipse(kx + s * 0.06, ky - s * 0.50, s * 0.36, s * 0.48, 0.30, 0, PI * 2); ctx.fill();
    ctx.fillStyle = '#4a7ab8'; ctx.beginPath(); ctx.ellipse(kx + s * 0.16, ky - s * 0.58, s * 0.18, s * 0.09, 0.55, 0, PI * 2); ctx.fill();
    ctx.fillStyle = '#f4ece0'; ctx.beginPath(); ctx.ellipse(kx - s * 0.12, ky - s * 0.44, s * 0.27, s * 0.40, 0.22, 0, PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(kx - s * 0.30, ky - s * 0.46, s * 0.07, s * 0.28, 0.22, 0, PI * 2); ctx.fill();
    // Head tips back as it laughs (pivot at the neck)
    ctx.save(); ctx.translate(kx - s * 0.10, ky - s * 0.78); ctx.rotate(laugh * 0.55);
    const hx = -s * 0.06, hy = -s * 0.22;
    ctx.fillStyle = '#f4ece0'; ctx.beginPath(); ctx.arc(hx, hy, s * 0.26, 0, PI * 2); ctx.fill();
    ctx.fillStyle = '#5a3e28'; ctx.beginPath(); ctx.ellipse(hx + s * 0.08, hy - s * 0.16, s * 0.20, s * 0.10, 0.1, PI, PI * 2); ctx.fill();
    ctx.fillStyle = '#5a3e28'; ctx.beginPath(); ctx.ellipse(hx + s * 0.10, hy, s * 0.20, s * 0.05, 0, 0, PI * 2); ctx.fill();
    ctx.fillStyle = '#120c08'; ctx.beginPath(); ctx.arc(hx - s * 0.06, hy - s * 0.02, s * 0.045, 0, PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx - s * 0.075, hy - s * 0.035, s * 0.014, 0, PI * 2); ctx.fill();
    // Beak: upper half fixed, lower half drops open as it laughs
    const bx = hx - s * 0.20, by = hy - s * 0.02;
    ctx.fillStyle = '#2e2620'; ctx.beginPath(); ctx.moveTo(bx, by - s * 0.04); ctx.lineTo(bx - s * 0.50, by + s * 0.08); ctx.lineTo(bx, by + s * 0.06); ctx.closePath(); ctx.fill();
    if (chuckle > 0.05) { ctx.fillStyle = '#c84a4a'; ctx.beginPath(); ctx.moveTo(bx, by + s * 0.05); ctx.lineTo(bx - s * 0.30, by + s * 0.10 + chuckle * s * 0.06); ctx.lineTo(bx, by + s * 0.09 + chuckle * s * 0.04); ctx.closePath(); ctx.fill(); }
    ctx.save(); ctx.translate(bx, by + s * 0.06); ctx.rotate(-chuckle * 0.35);
    ctx.fillStyle = '#d8c8a8'; ctx.beginPath(); ctx.moveTo(0, -s * 0.01); ctx.lineTo(-s * 0.46, s * 0.02); ctx.lineTo(0, s * 0.05); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.restore();
    ctx.restore();
  }

  // ════════ PAINT — back layer → movers → front layer → cup → haze ════════
  // (canvas passed in)
  const ctx = cvs.getContext('2d');
  const SCRATCH = document.createElement('canvas').getContext('2d');
  const skyL = document.createElement('canvas'); skyL.width = 620; skyL.height = 355;
  const back = document.createElement('canvas'); back.width = 620; back.height = 355;
  const front = document.createElement('canvas'); front.width = 620; front.height = 355;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TURN_SECONDS = 9.4;
  function paintBase() {
    const k = skyL.getContext('2d'); k.clearRect(0, 0, 620, 355); draw(k, 620, 355, 'sky');
    const b = back.getContext('2d'); b.clearRect(0, 0, 620, 355); draw(b, 620, 355, 'back');
    const f = front.getContext('2d'); f.clearRect(0, 0, 620, 355); draw(f, 620, 355, 'front');
  }
  function frame(ms) {
    const t = reduceMotion ? 0 : ms / 1000;
    const phi = (t / TURN_SECONDS) * Math.PI * 2;
    ctx.clearRect(0, 0, 620, 355);
    ctx.drawImage(skyL, 0, 0);
    ctx.drawImage(back, 0, 0);
    drawMovers(ctx, 620, 355, t);
    drawAmbient(ctx, 620, 355, t);
    ctx.drawImage(front, 0, 0);
    drawKookaburra(ctx, 620, 355, t);
    drawTrophy(ctx, 620, 355, phi, t);
    drawAtmos(ctx, 620, 355);
  }
  function loop(ms) { if (!__running) return; __elapsed = ms - __t0; __frame(__elapsed); requestAnimationFrame(loop); }
  paintBase(); __frame(0);
  let repainted = false;
  const repaint = () => { if (!repainted) { repainted = true; paintBase(); __frame(__elapsed); } };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(repaint).catch(() => {});
  setTimeout(repaint, 2000);
  return {
    start() { if (__running) return; if (reduceMotion) { __frame(0); return; } __running = true; __t0 = performance.now() - __elapsed; requestAnimationFrame(loop); },
    stop() { __running = false; },
  };
}
function makeLeagueArt_desert(cvs) {
  let __running = false, __t0 = 0, __elapsed = 0;
  // Soft fade at the foot of the art so it melts into the card's info panel
  function __fade() {
    const g = ctx.createLinearGradient(0, 355 * 0.78, 0, 355);
    g.addColorStop(0, 'rgba(8,8,18,0)'); g.addColorStop(1, 'rgba(8,8,18,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 355 * 0.78, 620, 355 * 0.22);
  }
  function __frame(ms) { frame(ms); __fade(); }
  const PI = Math.PI;
  const SHOW = 23;                                   // length of the shared schedule, seconds
  // Scheduled moments (seconds into the SHOW loop) — spread out so they never all stop together
  const SHEEN = [0.8, 6.2];                          // first light sweeps down the big dune
  const BURNS = [[2.2, 3.4], [13.0, 14.1]];          // balloon burner flares
  const FALCON = [5.4, 13.2];                        // a falcon glides across the sky
  const DEVIL = [9.2, 16.4];                         // a dust devil spins across the far dune
  const GUST = [16.6, 21.8];                         // a breath of sandstorm blows through
  const JEEP = [10.4, 15.2];                         // a 4x4 hops the near dune and drops away
  const KNOCK = 18.2;                                // the gust knocks a bail off; it is back by the loop
  const EAR_TWITCH = [3.1, 14.6, 20.4];              // the resting camel flicks an ear
  const LIZ_IN = [6.6, 7.6], LIZ_BOB = [11.0, 12.6], LIZ_OUT = [19.0, 19.9];   // the lizard on the rock
  function win(m, [a, b]) { return m >= a && m <= b ? (m - a) / (b - a) : -1; }

  // Dune crests, shared by the still scene and the animation (sand blowing off the ridges, the caravan)
  // pX/pY = peak, D = drop to the shoulders, hl/hr = half-width on each side (fractions of W/H)
  const DUNES = {
    R:  { pX: 0.78, pY: 0.449, D: 0.050, hl: 0.53, hr: 0.30, x0: 0.24, x1: 1.06, wav: 0.005 },   // the caravan dune, under the sun
    L:  { pX: 0.22, pY: 0.488, D: 0.064, hl: 0.30, hr: 0.50, x0: -0.06, x1: 1.06, wav: 0.010 },  // the oasis dune
    NL: { pX: -0.05, pY: 0.566, D: 0.066, hl: 0.10, hr: 0.50, x0: -0.06, x1: 0.46, wav: 0.008 },
    NR: { pX: 0.95, pY: 0.538, D: 0.080, hl: 0.40, hr: 0.22, x0: 0.54, x1: 1.06, wav: 0.010 },
  };
  function crestY(d, x, W, H) {
    const dx = x / W - d.pX, h = dx < 0 ? d.hl : d.hr;
    const near = Math.min(1, Math.abs(dx) * 10);                     // keep the peak itself crisp
    return H * (d.pY + d.D * Math.pow(Math.min(1, Math.abs(dx) / h), 1.5) + 0.003 * Math.sin(x * 0.05) * near + (d.wav || 0) * Math.sin(dx * 14) * near);
  }
  const SUN = { x: 0.80, y: 0.440, r: 0.048 };
  // The city on the horizon: [x, width, height, kind, row] as fractions. kind 0 flat, 1 spire, 2 stepped, 3 slanted, 4 twin-blade
  // row 0 = far (paler), row 1 = near. A smaller town sits east of the sun.
  const SKYLINE = (() => {
    let s = 1234; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const out = [];
    for (let i = 0; i < 26; i++) out.push([0.004 + r() * 0.165, 0.006 + r() * 0.010, 0.020 + Math.pow(r(), 1.4) * 0.060, (r() * 4) | 0, 0]);
    for (let i = 0; i < 22; i++) out.push([0.010 + r() * 0.160, 0.008 + r() * 0.012, 0.016 + Math.pow(r(), 1.8) * 0.070, (r() * 4) | 0, 1]);
    for (let i = 0; i < 12; i++) out.push([0.905 + r() * 0.09, 0.006 + r() * 0.009, 0.010 + r() * 0.028, (r() * 4) | 0, 0]);
    return out;
  })();
  const PALMS = [[0.224, 0.574, 0.150, -0.06], [0.256, 0.579, 0.205, 0.02], [0.336, 0.576, 0.170, 0.13], [0.376, 0.582, 0.112, 0.24]];
  const POOL = { x: 0.300, y: 0.586, rx: 0.074, ry: 0.013 };

  // ════════ STILL SCENE — the Arabian desert at dawn ════════
  // part 'sky' → sky; 'back' → skyline, far ridge, big dunes, oasis pool; 'mid' → the near dunes; 'front' → the sand at our feet.
  // Every part runs the same code so the random details match; the unused parts go to a scratch canvas.
  function draw(ctxReal, W, H, part) {
    let ctx = part === 'sky' ? ctxReal : SCRATCH;
    let seed = 53;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const VY = H * 0.455;
    const limb = (x1, y1, x2, y2, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
    const glow = (x, y, r, col) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    };
    const SX = W * SUN.x, SY = H * SUN.y, SR = H * SUN.r;

    // ── Sky: indigo night draining away overhead, rose and apricot at the horizon ──
    const sky = ctx.createLinearGradient(0, 0, 0, VY);
    sky.addColorStop(0, '#1c1a46'); sky.addColorStop(0.28, '#41397a'); sky.addColorStop(0.55, '#a4648e');
    sky.addColorStop(0.78, '#ee9478'); sky.addColorStop(0.92, '#ffc488'); sky.addColorStop(1, '#ffe2b0');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, VY + 4);
    // Warmth pooling round the sun, cool lingering in the west
    const warm = ctx.createRadialGradient(SX, SY, 0, SX, SY, W * 0.62);
    warm.addColorStop(0, 'rgba(255,214,140,0.65)'); warm.addColorStop(0.35, 'rgba(255,170,120,0.22)'); warm.addColorStop(1, 'rgba(255,150,120,0)');
    ctx.fillStyle = warm; ctx.fillRect(0, 0, W, VY + 4);
    const cool = ctx.createLinearGradient(0, 0, W * 0.6, 0);
    cool.addColorStop(0, 'rgba(40,36,110,0.30)'); cool.addColorStop(1, 'rgba(40,36,110,0)');
    ctx.fillStyle = cool; ctx.fillRect(0, 0, W * 0.6, VY + 4);
    // Last stars, only in the dark west
    for (let i = 0; i < 46; i++) {
      const x = rnd() * W * 0.70, y = rnd() * H * 0.26, a = 0.75 * (1 - y / (H * 0.26)) * (1 - x / (W * 0.78));
      ctx.fillStyle = `rgba(255,250,240,${Math.max(0, a).toFixed(3)})`; ctx.fillRect(x, y, rnd() < 0.2 ? 1.4 : 0.9, rnd() < 0.2 ? 1.4 : 0.9);
    }
    // The morning star
    glow(W * 0.115, H * 0.095, 9, 'rgba(255,250,235,0.55)');
    ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.arc(W * 0.115, H * 0.095, 1.6, 0, PI * 2); ctx.fill();
    // High streaks of cloud, lit pink and gold from beneath
    ctx.save(); ctx.filter = 'blur(2.5px)';
    [[0.32, 0.200, 0.20, 0.013], [0.60, 0.140, 0.26, 0.014], [0.90, 0.265, 0.17, 0.011], [0.13, 0.300, 0.15, 0.008], [0.67, 0.320, 0.13, 0.008], [0.45, 0.075, 0.16, 0.009]].forEach(([fx, fy, fw, fh]) => {
      const x = W * fx, y = H * fy, w = W * fw, h = H * fh, near = Math.max(0, 1 - Math.hypot(x - SX, (y - SY) * 2) / (W * 0.55));
      const g = ctx.createLinearGradient(0, y - h, 0, y + h);
      g.addColorStop(0, `rgba(${110 + near * 80 | 0},${80 + near * 50 | 0},150,0.30)`);
      g.addColorStop(1, `rgba(255,${170 + near * 60 | 0},${140 - near * 30 | 0},${(0.55 + near * 0.35).toFixed(2)})`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(x, y, w / 2, h, 0, 0, PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + w * 0.18, y + h * 0.9, w * 0.30, h * 0.6, 0, 0, PI * 2); ctx.fill();
    });
    ctx.restore();
    // The sun, half risen behind the far ridge
    glow(SX, SY, W * 0.20, 'rgba(255,200,120,0.40)');
    glow(SX, SY, SR * 2.4, 'rgba(255,236,190,0.55)');
    const sd = ctx.createRadialGradient(SX - SR * 0.2, SY - SR * 0.3, 0, SX, SY, SR);
    sd.addColorStop(0, '#fffbe8'); sd.addColorStop(0.6, '#fff0c0'); sd.addColorStop(1, '#ffc870');
    ctx.fillStyle = sd; ctx.beginPath(); ctx.arc(SX, SY, SR, 0, PI * 2); ctx.fill();

    ctx = part === 'back' ? ctxReal : SCRATCH;

    // ── Distant city skyline on the horizon: rows of towers, the needle, twin blades, a twisting tower, the sail ──
    {
      const lit = 'rgba(255,190,160,0.80)';
      const tower = (fx, fw, fh, kind, row) => {
        const x = W * fx, w = W * fw, h = H * fh, top = VY - h;
        const g = ctx.createLinearGradient(x, 0, x + w, 0);
        if (row) { g.addColorStop(0, '#6a5080'); g.addColorStop(0.7, '#806494'); g.addColorStop(1, '#d89ca0'); }
        else { g.addColorStop(0, '#94789e'); g.addColorStop(0.7, '#a486aa'); g.addColorStop(1, '#e0b0aa'); }
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(x, VY + 2); ctx.lineTo(x, top);
        if (kind === 3) { ctx.lineTo(x + w, top - h * 0.12); }                                   // slanted roof
        else if (kind === 2) { ctx.lineTo(x + w * 0.2, top); ctx.lineTo(x + w * 0.2, top - h * 0.08); ctx.lineTo(x + w * 0.8, top - h * 0.08); ctx.lineTo(x + w * 0.8, top); ctx.lineTo(x + w, top); }
        else ctx.lineTo(x + w, top);
        ctx.lineTo(x + w, VY + 2); ctx.closePath(); ctx.fill();
        if (kind === 1) limb(x + w / 2, top, x + w / 2, top - h * 0.22, 0.8, row ? '#806494' : '#a486aa');
        ctx.fillStyle = lit; ctx.fillRect(x + w - 0.9, top - (kind === 3 ? h * 0.12 : 0), 0.9, h);
        // A few windows still lit from the night, and floor lines
        ctx.fillStyle = row ? 'rgba(60,40,80,0.30)' : 'rgba(80,60,100,0.20)';
        for (let y = top + 3; y < VY; y += 3) ctx.fillRect(x, y, w, 0.5);
        ctx.fillStyle = 'rgba(255,220,150,0.85)';
        for (let k = 0; k < 3; k++) if (rnd() < 0.5) ctx.fillRect(x + 0.8 + rnd() * Math.max(0.5, w - 2), top + 2 + rnd() * Math.max(1, h - 4), 0.9, 0.9);
      };
      SKYLINE.filter(b => b[4] === 0).forEach(b => tower(...b));
      // Twin blade towers with triangular tops
      [[0.150, 0.072], [0.166, 0.060]].forEach(([fx, fh]) => {
        const x = W * fx, w = W * 0.011, top = VY - H * fh;
        const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#6a5080'); g.addColorStop(1, '#e0a8a0');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, VY + 2); ctx.lineTo(x, top); ctx.lineTo(x + w, top - H * 0.022); ctx.lineTo(x + w, VY + 2); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = lit; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + w, top - H * 0.022); ctx.lineTo(x + w, VY); ctx.stroke();
      });
      // The twisting tower
      { const x = W * 0.050, w = W * 0.012, top = VY - H * 0.085;
        ctx.fillStyle = '#74588a'; ctx.fillRect(x, top, w, VY - top + 2);
        ctx.strokeStyle = 'rgba(255,200,170,0.55)'; ctx.lineWidth = 0.6;
        for (let y = top + 2; y < VY; y += 3.2) { ctx.beginPath(); ctx.moveTo(x, y + 1.6); ctx.lineTo(x + w, y - 1.6); ctx.stroke(); }
        ctx.fillStyle = lit; ctx.fillRect(x + w - 0.9, top, 0.9, VY - top); }
      SKYLINE.filter(b => b[4] === 1).forEach(b => tower(...b));
      // The needle: stepped setbacks tapering into a spire
      const bx = W * 0.135, top = H * 0.205;
      const tiers = [[0.024, 0.00], [0.020, 0.25], [0.015, 0.47], [0.011, 0.64], [0.007, 0.78], [0.004, 0.88]];
      const tall = VY - top;
      tiers.forEach(([fw, f0], i) => {
        const f1 = i < tiers.length - 1 ? tiers[i + 1][1] : 0.94, w = W * fw;
        const y0 = VY - tall * f0, y1 = VY - tall * f1;
        const g = ctx.createLinearGradient(bx - w / 2, 0, bx + w / 2, 0);
        g.addColorStop(0, '#62487c'); g.addColorStop(0.6, '#8a6a98'); g.addColorStop(1, '#f0b0a4');
        ctx.fillStyle = g; ctx.fillRect(bx - w / 2, y1, w, y0 - y1 + 1);
        ctx.fillStyle = 'rgba(255,220,200,0.35)'; ctx.fillRect(bx - w / 2, y1, w, 0.7);
      });
      limb(bx, VY - tall * 0.94, bx, top, 1, '#a080ac');
      ctx.fillStyle = lit; ctx.fillRect(bx + W * 0.002, VY - tall * 0.94, 0.8, tall * 0.9);
      // The sail-shaped hotel on its island: curved sail, cross-bracing, mast and helipad
      { const hx = W * 0.872, hb = VY, hh = H * 0.070, sw = W * 0.026;
        const sail = () => { ctx.beginPath(); ctx.moveTo(hx, hb); ctx.lineTo(hx, hb - hh); ctx.quadraticCurveTo(hx + sw * 1.15, hb - hh * 0.55, hx + sw, hb); ctx.closePath(); };
        const g = ctx.createLinearGradient(hx, 0, hx + sw, 0); g.addColorStop(0, '#8a6c9c'); g.addColorStop(1, '#f4c4b4');
        ctx.fillStyle = g; sail(); ctx.fill();
        ctx.save(); sail(); ctx.clip();
        ctx.strokeStyle = 'rgba(110,80,130,0.45)'; ctx.lineWidth = 0.5;
        for (let k = 1; k < 9; k++) { const y = hb - hh * k / 9; ctx.beginPath(); ctx.moveTo(hx, y); ctx.lineTo(hx + sw * 1.2, y + hh * 0.05); ctx.stroke(); }
        ctx.restore();
        ctx.strokeStyle = 'rgba(255,214,190,0.95)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(hx, hb - hh); ctx.quadraticCurveTo(hx + sw * 1.15, hb - hh * 0.55, hx + sw, hb); ctx.stroke();
        ctx.fillStyle = '#7a5c8e'; ctx.fillRect(hx - 1.6, hb - hh, 1.8, hh);
        limb(hx, hb - hh, hx, hb - hh - H * 0.020, 0.9, '#a080ac');
        ctx.fillStyle = '#a486aa'; ctx.beginPath(); ctx.ellipse(hx + sw * 0.62, hb - hh * 0.68, W * 0.006, 1.2, 0, 0, PI * 2); ctx.fill();
        ctx.fillStyle = '#8a6c9c'; ctx.fillRect(hx - W * 0.006, hb - 2, sw + W * 0.012, 3); }
    }

    // ── Far ridge of dunes, hazy rose, swallowing the lower half of the sun ──
    const farY = (x) => H * (0.447 - 0.010 * Math.sin(x / W * 7.0 + 0.6) - 0.004 * Math.sin(x / W * 19 + 1));
    {
      const g = ctx.createLinearGradient(0, H * 0.43, 0, H * 0.52);
      g.addColorStop(0, '#d48a86'); g.addColorStop(1, '#a8687e');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, H * 0.55);
      for (let x = 0; x <= W; x += 3) ctx.lineTo(x, farY(x));
      ctx.lineTo(W, H * 0.55); ctx.closePath(); ctx.fill();
      // Rim of light along the far crest, brightest under the sun
      for (let x = 0; x <= W; x += 2) {
        const a = 0.25 + 0.65 * Math.max(0, 1 - Math.abs(x - SX) / (W * 0.30));
        ctx.fillStyle = `rgba(255,226,170,${a.toFixed(3)})`; ctx.fillRect(x, farY(x) - 0.4, 2, 1.1);
      }
    }

    // ── Dune painter: crest from the shared table; west faces in violet shade, east faces lit apricot ──
    function dune(d, baseY, cols) {
      const x0 = W * d.x0, x1 = W * d.x1, pX = W * d.pX, pY = crestY(d, pX, W, H);
      const body = () => { ctx.beginPath(); ctx.moveTo(x0, baseY); for (let x = x0; x <= x1; x += 3) ctx.lineTo(x, crestY(d, x, W, H)); ctx.lineTo(x1, baseY); ctx.closePath(); };
      const g = ctx.createLinearGradient(0, pY, 0, baseY);
      g.addColorStop(0, cols.top); g.addColorStop(1, cols.bot);
      ctx.fillStyle = g; body(); ctx.fill();
      ctx.save(); body(); ctx.clip();
      // The slip-line: from the peak, a soft curve sweeping down and toward us; east of it is sunlit, west of it in shade
      const foot = pX - (pX - x0) * 0.32, c1X = pX - (pX - x0) * 0.20, c1Y = pY + (baseY - pY) * 0.30, c2X = pX - (pX - x0) * 0.04, c2Y = pY + (baseY - pY) * 0.66;
      ctx.filter = 'blur(1.6px)';
      const lg = ctx.createLinearGradient(foot, 0, x1, 0);
      lg.addColorStop(0, cols.lit); lg.addColorStop(1, cols.litFar);
      ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(pX, pY - 4);
      for (let x = pX; x <= x1 + 6; x += 3) ctx.lineTo(x, crestY(d, Math.min(x, x1), W, H) - 4);
      ctx.lineTo(x1 + 6, baseY + 4); ctx.lineTo(foot, baseY + 4);
      ctx.bezierCurveTo(c2X, c2Y, c1X, c1Y, pX, pY); ctx.closePath(); ctx.fill();
      const sg = ctx.createLinearGradient(0, pY, 0, baseY);
      sg.addColorStop(0, cols.shade); sg.addColorStop(1, 'rgba(90,40,80,0.05)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(pX, pY);
      ctx.bezierCurveTo(c1X, c1Y, c2X, c2Y, foot, baseY + 4);
      ctx.lineTo(x0 - 6, baseY + 4); ctx.lineTo(x0 - 6, crestY(d, x0, W, H) - 4);
      for (let x = x0; x <= pX; x += 3) ctx.lineTo(x, crestY(d, x, W, H) - 4);
      ctx.closePath(); ctx.fill();
      ctx.filter = 'none';
      // A thin bright seam where the slip-line meets the light
      ctx.strokeStyle = 'rgba(255,226,180,0.35)'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(pX, pY); ctx.bezierCurveTo(c1X, c1Y, c2X, c2Y, foot, baseY); ctx.stroke();
      // Wind ripples running across both faces
      for (let k = 0; k < cols.ripples; k++) {
        const f = (k + 1) / (cols.ripples + 1), sx0 = x0 + rnd() * (x1 - x0) * 0.6, len = (x1 - x0) * (0.18 + rnd() * 0.30);
        ctx.strokeStyle = `rgba(255,220,180,${(0.10 + 0.10 * f).toFixed(3)})`; ctx.lineWidth = 0.6;
        ctx.beginPath();
        for (let x = sx0; x <= sx0 + len; x += 3) { const cy = crestY(d, x, W, H), y = cy + (baseY - cy) * f + Math.sin(x * 0.06 + k) * 1.2; x === sx0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.restore();
      // Knife-edge crest catching the sun: gold on the east, a faint pink line on the west
      for (let x = x0; x <= x1; x += 2) {
        const east = x >= pX, dx = Math.abs(x / W - d.pX) / (east ? d.hr : d.hl);
        if (dx > 0.97) continue;                                     // no rim where the crest has flattened into the plain
        const a = (east ? 0.85 : 0.22 + 0.4 * Math.max(0, 1 - (pX - x) / (W * 0.10))) * Math.min(1, (0.97 - dx) * 8);
        ctx.fillStyle = east ? `rgba(255,232,180,${a.toFixed(3)})` : `rgba(255,200,180,${a.toFixed(3)})`;
        ctx.fillRect(x, crestY(d, x, W, H) - 0.5, 2, east ? 1.4 : 1);
      }
    }
    dune(DUNES.R, H * 0.62, { top: '#a66a8c', bot: '#7c4c74', lit: '#f6ae88', litFar: '#e09478', shade: 'rgba(90,56,120,0.55)', ripples: 6 });
    dune(DUNES.L, H * 0.64, { top: '#b47886', bot: '#8a5676', lit: '#fab886', litFar: '#e49474', shade: 'rgba(96,58,120,0.50)', ripples: 8 });
    // Aerial haze: the far dunes sink back into the dawn light
    { const hz = ctx.createLinearGradient(0, H * 0.44, 0, H * 0.64);
      hz.addColorStop(0, 'rgba(230,170,200,0.22)'); hz.addColorStop(1, 'rgba(200,150,200,0.06)');
      ctx.fillStyle = hz; ctx.fillRect(0, H * 0.44, W, H * 0.20); }

    // ── The oasis pool (its palms sway each frame) ──
    {
      const px = W * POOL.x, py = H * POOL.y, rx = W * POOL.rx, ry = H * POOL.ry;
      ctx.fillStyle = 'rgba(90,60,40,0.55)'; ctx.beginPath(); ctx.ellipse(px, py + 1, rx * 1.10, ry * 1.5, 0, 0, PI * 2); ctx.fill();
      const wg = ctx.createLinearGradient(0, py - ry, 0, py + ry);
      wg.addColorStop(0, '#ffd6a8'); wg.addColorStop(0.5, '#e89aa0'); wg.addColorStop(1, '#6a5a98');
      ctx.fillStyle = wg; ctx.beginPath(); ctx.ellipse(px, py, rx, ry, 0, 0, PI * 2); ctx.fill();
      // Reeds round the water's edge
      for (let i = 0; i < 28; i++) {
        const a = rnd() * PI * 2, x = px + Math.cos(a) * rx * (1.0 + rnd() * 0.1), y = py + Math.sin(a) * ry * 1.1;
        if (Math.sin(a) < -0.2 && rnd() < 0.5) continue;
        limb(x, y, x + (rnd() - 0.6) * 2.5, y - 3 - rnd() * 5, 0.7, rnd() < 0.5 ? '#4a5a2a' : '#6a7a34');
      }
    }

    if (part === 'back' || part === 'sky') return;
    ctx = part === 'mid' ? ctxReal : SCRATCH;

    // ── Near dunes framing the foreground ──
    dune(DUNES.NL, H, { top: '#e6965e', bot: '#b8644a', lit: '#ffcc84', litFar: '#f6aa66', shade: 'rgba(110,56,100,0.55)', ripples: 7 });
    dune(DUNES.NR, H, { top: '#d88a62', bot: '#a85a4a', lit: '#ffcc84', litFar: '#f6b070', shade: 'rgba(104,52,100,0.58)', ripples: 7 });

    if (part === 'mid') return;
    ctx = ctxReal;

    // ════════ FRONT LAYER — the sand at our feet, a majlis rug with coffee and a lantern, the stumps ════════
    const FG = (x) => H * (0.618 + 0.008 * Math.sin(x / W * 5 + 1));
    {
      const g = ctx.createLinearGradient(0, H * 0.61, 0, H);
      g.addColorStop(0, '#f8c27a'); g.addColorStop(0.35, '#e49a5a'); g.addColorStop(1, '#a85a40');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 4) ctx.lineTo(x, FG(x));
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,236,190,0.7)'; for (let x = 0; x <= W; x += 2) ctx.fillRect(x, FG(x) - 0.4, 2, 1);
      // Ripples marching toward us, each with a lit windward edge and a shaded lee
      for (let y = H * 0.630, st = 3.2; y < H; y += st, st *= 1.10) {
        const ph = rnd() * 6, amp = 0.8 + (y - H * 0.63) * 0.02;
        ctx.strokeStyle = 'rgba(120,50,70,0.20)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); for (let x = -4; x <= W + 4; x += 5) ctx.lineTo(x, y + 0.8 + Math.sin(x * 0.035 + ph) * amp); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,226,180,0.30)'; ctx.lineWidth = 0.7;
        ctx.beginPath(); for (let x = -4; x <= W + 4; x += 5) ctx.lineTo(x, y + Math.sin(x * 0.035 + ph) * amp); ctx.stroke();
      }
      // Low sun raking in from the right
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const rake = ctx.createRadialGradient(W * 0.95, H * 0.62, 0, W * 0.95, H * 0.62, W * 0.7);
      rake.addColorStop(0, 'rgba(255,200,140,0.22)'); rake.addColorStop(1, 'rgba(255,200,140,0)');
      ctx.fillStyle = rake; ctx.fillRect(0, H * 0.6, W, H * 0.4); ctx.restore();
    }
    // Long dawn shadows reach toward us and to the left
    const longShadow = (x, y, w, len) => {
      const g = ctx.createLinearGradient(x, y, x - len * 0.85, y + len * 0.28);
      g.addColorStop(0, 'rgba(80,30,70,0.42)'); g.addColorStop(1, 'rgba(80,30,70,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x - w / 2, y - 1);
      ctx.lineTo(x - len * 0.85 - w * 0.2, y + len * 0.26); ctx.lineTo(x - len * 0.85 + w * 0.6, y + len * 0.30); ctx.closePath(); ctx.fill();
    };

    // ── Majlis rug: crimson field, indigo border, cream lozenges, tasselled front edge ──
    {
      const A = [W * 0.050, H * 0.700], B = [W * 0.272, H * 0.700], C = [W * 0.246, H * 0.640], D = [W * 0.076, H * 0.640];
      const lerp = (p, q, f) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f];
      const at = (u, v) => lerp(lerp(D, C, u), lerp(A, B, u), v);       // u across, v toward us
      const quad = (u0, v0, u1, v1) => { ctx.beginPath(); ctx.moveTo(...at(u0, v0)); ctx.lineTo(...at(u1, v0)); ctx.lineTo(...at(u1, v1)); ctx.lineTo(...at(u0, v1)); ctx.closePath(); };
      ctx.fillStyle = 'rgba(80,30,60,0.35)'; ctx.beginPath(); ctx.moveTo(A[0] - 2, A[1] + 2); ctx.lineTo(B[0] - 6, B[1] + 2); ctx.lineTo(C[0] - 4, C[1]); ctx.lineTo(D[0] - 6, D[1]); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1e2a62'; quad(0, 0, 1, 1); ctx.fill();
      ctx.fillStyle = '#a8202c'; quad(0.07, 0.13, 0.93, 0.87); ctx.fill();
      ctx.fillStyle = '#f0dcb0';
      for (let k = 0; k < 5; k++) {
        const u = 0.18 + k * 0.16, [cx, cy] = at(u, 0.5), [ex] = at(u + 0.055, 0.5), [, ty] = at(u, 0.24), [, by] = at(u, 0.76);
        ctx.beginPath(); ctx.moveTo(cx, ty); ctx.lineTo(ex, cy); ctx.lineTo(cx, by); ctx.lineTo(cx - (ex - cx), cy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#1e2a62'; ctx.beginPath(); ctx.arc(cx, cy, 1.2, 0, PI * 2); ctx.fill(); ctx.fillStyle = '#f0dcb0';
      }
      ctx.strokeStyle = '#e8b040'; ctx.lineWidth = 0.6; quad(0.035, 0.065, 0.965, 0.935); ctx.stroke();
      ctx.fillStyle = 'rgba(30,14,40,0.18)'; quad(0, 0, 0.5, 1); ctx.fill();          // the shadowed half, away from the sun
      ctx.strokeStyle = '#f0dcb0'; ctx.lineWidth = 0.7;
      for (let k = 0; k <= 26; k++) { const [x, y] = at(k / 26, 1); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 0.6, y + 2.4); ctx.stroke(); }
      // Two bolster cushions along the back edge
      [[0.42, '#1e2a62', '#e8b040']].forEach(([u, c0, c1]) => {
        const [cx, cy] = at(u, 0.16), w = W * 0.058, h = H * 0.024;
        ctx.fillStyle = 'rgba(80,30,60,0.35)'; ctx.beginPath(); ctx.ellipse(cx - w * 0.15, cy + h * 0.5, w * 0.55, h * 0.35, 0, 0, PI * 2); ctx.fill();
        const g = ctx.createLinearGradient(0, cy - h, 0, cy + h * 0.3); g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, c0); g.addColorStop(1, c0);
        ctx.fillStyle = c0; ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h, w, h * 1.1, h * 0.5); ctx.fill();
        ctx.fillStyle = c1; for (let k = 1; k < 6; k++) ctx.fillRect(cx - w / 2 + w * k / 6 - 0.8, cy - h + 0.6, 1.6, h * 1.0);
        const sh = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); sh.addColorStop(0, 'rgba(30,10,40,0.40)'); sh.addColorStop(0.7, 'rgba(255,230,190,0)'); sh.addColorStop(1, 'rgba(255,230,190,0.30)');
        ctx.fillStyle = sh; ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h, w, h * 1.1, h * 0.5); ctx.fill();
        ctx.fillStyle = c1; [-1, 1].forEach(m => { ctx.beginPath(); ctx.arc(cx + m * w * 0.52, cy - h * 0.45, 1.3, 0, PI * 2); ctx.fill(); ctx.fillRect(cx + m * w * 0.52 - 0.4, cy - h * 0.45, 0.8, 3.5); });
      });
    }
    // ── Brass dallah coffee pot and two little cups on the rug ──
    {
      const x = W * 0.205, b = H * 0.676, s = H * 0.090;
      longShadow(x, b, s * 0.40, s * 0.9);
      const br = ctx.createLinearGradient(x - s * 0.25, 0, x + s * 0.25, 0);
      br.addColorStop(0, '#5a3a10'); br.addColorStop(0.45, '#b8862c'); br.addColorStop(0.75, '#ffe6a0'); br.addColorStop(1, '#c89038');
      ctx.fillStyle = br;
      // Flared foot, round belly, pinched waist, tall stepped lid with a finial
      ctx.beginPath(); ctx.moveTo(x - s * 0.20, b); ctx.lineTo(x + s * 0.20, b); ctx.lineTo(x + s * 0.13, b - s * 0.06);
      ctx.bezierCurveTo(x + s * 0.30, b - s * 0.14, x + s * 0.28, b - s * 0.38, x + s * 0.09, b - s * 0.46);
      ctx.lineTo(x + s * 0.11, b - s * 0.54); ctx.lineTo(x - s * 0.11, b - s * 0.54); ctx.lineTo(x - s * 0.09, b - s * 0.46);
      ctx.bezierCurveTo(x - s * 0.28, b - s * 0.38, x - s * 0.30, b - s * 0.14, x - s * 0.13, b - s * 0.06); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - s * 0.11, b - s * 0.54); ctx.lineTo(x - s * 0.06, b - s * 0.70); ctx.lineTo(x + s * 0.06, b - s * 0.70); ctx.lineTo(x + s * 0.11, b - s * 0.54); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - s * 0.06, b - s * 0.70); ctx.lineTo(x, b - s * 0.86); ctx.lineTo(x + s * 0.06, b - s * 0.70); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(x, b - s * 0.88, s * 0.025, 0, PI * 2); ctx.fill();
      // The long beaked spout, curving out to the left
      ctx.beginPath(); ctx.moveTo(x - s * 0.20, b - s * 0.22); ctx.quadraticCurveTo(x - s * 0.34, b - s * 0.30, x - s * 0.38, b - s * 0.62);
      ctx.lineTo(x - s * 0.47, b - s * 0.70); ctx.lineTo(x - s * 0.33, b - s * 0.64); ctx.quadraticCurveTo(x - s * 0.28, b - s * 0.38, x - s * 0.13, b - s * 0.32); ctx.closePath(); ctx.fill();
      // Handle on the right
      ctx.strokeStyle = '#b8862c'; ctx.lineWidth = s * 0.035;
      ctx.beginPath(); ctx.moveTo(x + s * 0.10, b - s * 0.50); ctx.bezierCurveTo(x + s * 0.40, b - s * 0.58, x + s * 0.42, b - s * 0.20, x + s * 0.22, b - s * 0.14); ctx.stroke();
      ctx.fillStyle = 'rgba(255,248,220,0.85)'; ctx.fillRect(x + s * 0.16, b - s * 0.38, 1.2, s * 0.20);
      ctx.fillStyle = 'rgba(90,50,10,0.45)'; [0.06, 0.46, 0.54, 0.70].forEach(f => ctx.fillRect(x - s * 0.14, b - s * f, s * 0.28, 0.7));
    }
    // ── Pierced brass lantern (its flame flickers each frame) ──
    {
      const x = W * 0.090, b = H * 0.668, s = H * 0.085;
      longShadow(x, b, s * 0.35, s * 0.9);
      const br = ctx.createLinearGradient(x - s * 0.2, 0, x + s * 0.2, 0);
      br.addColorStop(0, '#4a2e0c'); br.addColorStop(0.6, '#c8963a'); br.addColorStop(0.85, '#ffe2a0'); br.addColorStop(1, '#a0702a');
      ctx.fillStyle = br;
      ctx.fillRect(x - s * 0.20, b - s * 0.08, s * 0.40, s * 0.08);
      ctx.fillRect(x - s * 0.16, b - s * 0.12, s * 0.32, s * 0.04);
      ctx.fillStyle = 'rgba(255,200,120,0.30)'; ctx.fillRect(x - s * 0.15, b - s * 0.54, s * 0.30, s * 0.42);   // glass
      ctx.fillStyle = br;
      [-0.15, 0, 0.15].forEach(o => ctx.fillRect(x + s * o - 0.6, b - s * 0.54, 1.2, s * 0.42));
      ctx.beginPath(); ctx.moveTo(x - s * 0.20, b - s * 0.54); ctx.lineTo(x + s * 0.20, b - s * 0.54); ctx.lineTo(x + s * 0.10, b - s * 0.70); ctx.lineTo(x, b - s * 0.80); ctx.lineTo(x - s * 0.10, b - s * 0.70); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(60,30,10,0.6)'; for (let k = -2; k <= 2; k++) ctx.fillRect(x + k * s * 0.05 - 0.4, b - s * 0.66, 0.9, 0.9);
      ctx.strokeStyle = '#b8862c'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, b - s * 0.86, s * 0.06, 0, PI * 2); ctx.stroke();
    }
    // ── A bat leaning against the lantern, turquoise grip ──
    {
      const toeX = W * 0.026, toeY = H * 0.700, topX = W * 0.077, topY = H * 0.578;
      const ang = Math.atan2(topY - toeY, topX - toeX), len = Math.hypot(topX - toeX, topY - toeY);
      ctx.fillStyle = 'rgba(80,30,70,0.35)'; ctx.beginPath(); ctx.moveTo(toeX + 3, toeY); ctx.lineTo(toeX - len * 0.6, toeY + len * 0.18); ctx.lineTo(toeX - len * 0.6 + 4, toeY + len * 0.22); ctx.lineTo(toeX + 6, toeY + 1); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(toeX, toeY); ctx.rotate(ang);
      const bw = W * 0.0125, bl = len * 0.64;
      const g = ctx.createLinearGradient(0, -bw / 2, 0, bw / 2);
      g.addColorStop(0, '#b08a58'); g.addColorStop(0.55, '#f0d4a0'); g.addColorStop(1, '#ffe8b8');
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(0, -bw / 2, bl, bw, bw * 0.28); ctx.fill();
      ctx.fillStyle = 'rgba(120,80,40,0.25)'; ctx.fillRect(bl * 0.12, -bw * 0.06, bl * 0.80, bw * 0.12);
      ctx.fillStyle = '#1ab0a6'; ctx.fillRect(bl * 0.55, -bw / 2, bl * 0.10, bw);
      ctx.fillStyle = '#e8b040'; ctx.fillRect(bl * 0.57, -bw / 2, bl * 0.06, bw);
      ctx.fillStyle = '#e8c890'; ctx.beginPath(); ctx.moveTo(bl, -bw / 2); ctx.quadraticCurveTo(bl + bw * 0.5, -bw * 0.2, bl + bw * 0.6, -bw * 0.17); ctx.lineTo(bl + bw * 0.6, bw * 0.17); ctx.quadraticCurveTo(bl + bw * 0.5, bw * 0.2, bl, bw / 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1ab0a6'; ctx.fillRect(bl + bw * 0.55, -bw * 0.17, len - bl - bw * 0.55, bw * 0.34);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let x = bl + bw * 0.8; x < len - 2; x += 3) ctx.fillRect(x, -bw * 0.17, 1, bw * 0.34);
      ctx.restore();
    }
    // ── A dry desert shrub and a sandstone rock (a lizard visits it) ──
    [[0.372, 0.652, 0.8], [0.998, 0.650, 1.0]].forEach(([fx, fy, sc]) => {
      const x = W * fx, y = H * fy;
      longShadow(x, y, 10 * sc, 18 * sc);
      for (let k = 0; k < 13; k++) {
        const a = -PI / 2 + (k / 12 - 0.5) * 2.1, l = (9 + rnd() * 7) * sc;
        limb(x, y, x + Math.cos(a) * l, y + Math.sin(a) * l, 0.8, k % 3 ? '#7a6a3a' : '#a89058');
      }
      ctx.fillStyle = '#c8a860'; for (let k = 0; k < 5; k++) { const a = -PI / 2 + (rnd() - 0.5) * 1.8, l = (8 + rnd() * 6) * sc; ctx.fillRect(x + Math.cos(a) * l, y + Math.sin(a) * l, 1.2, 1.2); }
    });
    {
      const x = W * 0.948, y = H * 0.668, w = W * 0.050, h = H * 0.030;
      longShadow(x, y, w, w * 1.1);
      const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
      g.addColorStop(0, '#7a4a4a'); g.addColorStop(0.6, '#c88a62'); g.addColorStop(1, '#f2c08a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.quadraticCurveTo(x - w * 0.45, y - h, x - w * 0.05, y - h); ctx.quadraticCurveTo(x + w * 0.45, y - h * 1.05, x + w / 2, y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,230,190,0.6)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x - w * 0.05, y - h); ctx.quadraticCurveTo(x + w * 0.45, y - h * 1.05, x + w / 2, y); ctx.stroke();
    }

    // ════════ HERO KIT — stumps pitched in the sand, a ball beside them ════════
    {
      const sx = W * 0.700, base = H * 0.700, sh = H * 0.160, top = base - sh, gap = W * 0.021, r = W * 0.0058;
      [-gap, 0, gap].forEach(dx => longShadow(sx + dx, base, r * 2, sh * 1.25));
      // A little sand heaped round the base
      ctx.fillStyle = '#e8a272'; ctx.beginPath(); ctx.ellipse(sx, base, gap * 1.9, H * 0.010, 0, PI, 0); ctx.fill();
      [-gap, 0, gap].forEach(dx => {
        const x = sx + dx;
        const g = ctx.createLinearGradient(x - r, 0, x + r, 0);
        g.addColorStop(0, '#8a5a3a'); g.addColorStop(0.4, '#d8a878'); g.addColorStop(0.75, '#fff0d0'); g.addColorStop(1, '#e8b880');
        ctx.fillStyle = g; ctx.fillRect(x - r, top, r * 2, sh);
        ctx.fillStyle = '#1aa8a0'; ctx.fillRect(x - r, top + sh * 0.16, r * 2, sh * 0.06);
        ctx.fillStyle = '#e8b040'; ctx.fillRect(x - r, top + sh * 0.22, r * 2, sh * 0.03);
        ctx.fillStyle = '#fff2d8'; ctx.beginPath(); ctx.ellipse(x, top, r, r * 0.55, 0, 0, PI * 2); ctx.fill();
      });
      ctx.fillStyle = '#e8a272'; ctx.beginPath(); ctx.ellipse(sx, base + 1, gap * 1.6, H * 0.006, 0, 0, PI * 2); ctx.fill();
      // (the bails are drawn each frame)
      const bx = W * 0.770, by = base - H * 0.008, brr = H * 0.018;
      longShadow(bx, by + brr, brr * 1.6, brr * 3);
      const rg = ctx.createRadialGradient(bx + brr * 0.35, by - brr * 0.45, brr * 0.1, bx, by, brr);
      rg.addColorStop(0, '#ffa080'); rg.addColorStop(0.5, '#c81e1e'); rg.addColorStop(1, '#4a0610');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(bx, by, brr, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,240,220,0.85)'; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.ellipse(bx, by, brr * 0.30, brr * 0.98, -0.35, 0, PI * 2); ctx.stroke();
    }
  }

  // Dawn haze over everything, the turning cup included
  function drawAtmos(ctx, W, H) {
    const haze = ctx.createLinearGradient(0, H * 0.34, 0, H * 0.60);
    haze.addColorStop(0, 'rgba(255,190,160,0)'); haze.addColorStop(0.5, 'rgba(255,190,160,0.10)'); haze.addColorStop(1, 'rgba(255,190,160,0)');
    ctx.fillStyle = haze; ctx.fillRect(0, H * 0.34, W, H * 0.26);
    const vig = ctx.createRadialGradient(W * 0.55, H * 0.45, W * 0.22, W * 0.55, H * 0.45, W * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(0.7, 'rgba(40,10,50,0.05)'); vig.addColorStop(1, 'rgba(40,10,50,0.26)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  }

  // ════════ THE SANDSTORM CUP — a gold hourglass trophy with sand really running, crowned by a falcon ════════
  // Round sandalwood plinth → turning octagonal gold base → jewelled discs held apart by three twisted pillars
  // round a glass hourglass → dome, orb and a falcon with wings raised. phi = turn angle (0 = falcon facing us).
  function drawTrophy(ctx, W, H, phi, t) {
    const FONT = (wt, px) => `${wt} ${px}px 'Barlow Condensed', 'Arial Narrow', sans-serif`;
    const glow = (x, y, r, col) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    };
    const tx = W * 0.5, tb = H * 0.705, S = H * 0.390, K = 1.45, TILT = 0.10;
    const TURQ = '#1ab0a6', RUBY = '#c0202e', GOLD = '#f2c440';

    // Long dawn shadow on the sand, reaching forward-left (drawn before scaling, on the ground)
    {
      const g = ctx.createLinearGradient(tx, tb, tx - W * 0.28, tb + H * 0.08);
      g.addColorStop(0, 'rgba(80,30,70,0.50)'); g.addColorStop(1, 'rgba(80,30,70,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(tx + W * 0.07, tb + 1); ctx.lineTo(tx - W * 0.08, tb - 1);
      ctx.lineTo(tx - W * 0.32, tb + H * 0.065); ctx.lineTo(tx - W * 0.18, tb + H * 0.085); ctx.closePath(); ctx.fill();
    }

    ctx.save(); ctx.translate(tx, tb); ctx.scale(K, K); ctx.translate(-tx, -tb);
    // Gold lit from the right, where the sun is rising
    const gold = (x0, x1) => {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, '#4a2c08'); g.addColorStop(0.16, '#8a5a14'); g.addColorStop(0.38, '#d09a34');
      g.addColorStop(0.60, '#ffe8b0'); g.addColorStop(0.72, '#fff6dc'); g.addColorStop(0.86, '#e0a848'); g.addColorStop(1, '#7a4c10');
      return g;
    };
    const P = (r, y, a) => [tx + r * Math.sin(a), y + r * Math.cos(a) * TILT];
    const mix = (c0, c1, f) => `rgb(${c0.map((v, i) => Math.round(v + (c1[i] - v) * f)).join(',')})`;
    glow(tx, tb - S * 0.62, W * 0.20, 'rgba(255,220,180,0.10)');

    // ── Round sandalwood plinth with turquoise and gold bands and a curved brass plate ──
    const pB = tb, pH = S * 0.150, pW = W * 0.062, eR = pW * TILT;
    const wd = ctx.createLinearGradient(tx - pW, 0, tx + pW, 0);
    wd.addColorStop(0, '#1e0c08'); wd.addColorStop(0.45, '#4a2416'); wd.addColorStop(0.80, '#9a5a36'); wd.addColorStop(1, '#5a2e1c');
    function drum(cy, h, r) {
      ctx.fillStyle = wd;
      ctx.beginPath(); ctx.moveTo(tx - r, cy - h); ctx.lineTo(tx - r, cy); ctx.ellipse(tx, cy, r, r * TILT, 0, PI, 0, true); ctx.lineTo(tx + r, cy - h); ctx.closePath(); ctx.fill();
      const top = ctx.createLinearGradient(tx - r, 0, tx + r, 0);
      top.addColorStop(0, '#3a1a10'); top.addColorStop(1, '#b8724a');
      ctx.fillStyle = top; ctx.beginPath(); ctx.ellipse(tx, cy - h, r, r * TILT, 0, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,200,150,0.45)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(tx, cy - h, r, r * TILT, 0, -PI * 0.1, PI * 0.5); ctx.stroke();
    }
    drum(pB, pH, pW);
    [[0.86, GOLD, 0.06], [0.78, TURQ, 0.08], [0.06, GOLD, 0.05]].forEach(([f, col, w]) => {
      ctx.strokeStyle = col; ctx.lineWidth = pH * w;
      ctx.beginPath(); ctx.ellipse(tx, pB - pH * f, pW, eR, 0, 0, PI); ctx.stroke();
    });
    const plate = ctx.createLinearGradient(0, pB - pH * 0.66, 0, pB - pH * 0.14);
    plate.addColorStop(0, '#f6dc90'); plate.addColorStop(1, '#a8803a');
    ctx.fillStyle = plate; ctx.beginPath();
    ctx.moveTo(tx - pW * 0.80, pB - pH * 0.66); ctx.quadraticCurveTo(tx, pB - pH * 0.66 + eR * 1.1, tx + pW * 0.80, pB - pH * 0.66);
    ctx.lineTo(tx + pW * 0.80, pB - pH * 0.14); ctx.quadraticCurveTo(tx, pB - pH * 0.14 + eR * 1.1, tx - pW * 0.80, pB - pH * 0.14); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(120,80,20,0.6)'; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.save(); ctx.fillStyle = '#3a2408'; ctx.font = FONT(900, pH * 0.24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('THE SANDSTORM CUP', tx, pB - pH * 0.48 + eR * 0.55, pW * 1.5);
    ctx.font = FONT(700, pH * 0.15); ctx.fillText('DESERT LEAGUE', tx, pB - pH * 0.27 + eR * 0.55, pW * 1.5); ctx.restore();

    // ── Octagonal gold base: eight facets turning with the cup, each with a turquoise lozenge ──
    const oA = pB - pH, oH = S * 0.075, Ro = W * 0.050, Ro2 = W * 0.040;
    const DARK = [96, 60, 14], LIGHT = [255, 236, 186];
    for (let k = 0; k < 8; k++) {
      const a0 = phi + k * PI / 4 + PI / 8, a1 = a0 + PI / 4, n = a0 + PI / 8, c = Math.cos(n);
      if (c <= 0.001) continue;
      const lum = Math.min(1, 0.18 + 0.62 * Math.max(0, Math.sin(n)) + 0.30 * c);
      ctx.fillStyle = mix(DARK, LIGHT, lum);
      ctx.beginPath(); ctx.moveTo(...P(Ro, oA, a0)); ctx.lineTo(...P(Ro, oA, a1)); ctx.lineTo(...P(Ro2, oA - oH, a1)); ctx.lineTo(...P(Ro2, oA - oH, a0)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(80,46,8,0.45)'; ctx.lineWidth = 0.5; ctx.stroke();
      const [cx, cy] = P((Ro + Ro2) / 2 * Math.cos(PI / 8), oA - oH / 2, n), hw = Ro * 0.24 * c, hh = oH * 0.30;
      if (hw > 0.4) {
        ctx.fillStyle = TURQ; ctx.beginPath(); ctx.moveTo(cx, cy - hh); ctx.lineTo(cx + hw, cy); ctx.lineTo(cx, cy + hh); ctx.lineTo(cx - hw, cy); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = GOLD; ctx.lineWidth = 0.6; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(cx - hw * 0.2, cy - hh * 0.5, Math.max(0.5, hw * 0.25), hh * 0.4);
      }
    }
    ctx.fillStyle = gold(tx - Ro2, tx + Ro2);
    ctx.beginPath(); for (let k = 0; k < 8; k++) { const p = P(Ro2, oA - oH, phi + k * PI / 4 + PI / 8); k ? ctx.lineTo(...p) : ctx.moveTo(...p); } ctx.closePath(); ctx.fill();

    // ── Jewelled discs (bottom and top of the hourglass) ──
    const dT = S * 0.030, Rd = W * 0.052;
    function disc(yb) {
      ctx.fillStyle = gold(tx - Rd, tx + Rd);
      ctx.beginPath(); ctx.moveTo(tx - Rd, yb - dT); ctx.lineTo(tx - Rd, yb); ctx.ellipse(tx, yb, Rd, Rd * TILT, 0, PI, 0, true); ctx.lineTo(tx + Rd, yb - dT); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = TURQ; ctx.lineWidth = dT * 0.40; ctx.beginPath(); ctx.ellipse(tx, yb - dT * 0.5, Rd, Rd * TILT, 0, 0, PI); ctx.stroke();
      // Gems set round the rim: rubies and gold studs, turning with the cup
      for (let k = 0; k < 18; k++) {
        const a = phi + k * PI * 2 / 18, c = Math.cos(a); if (c < 0.05) continue;
        const [x, y] = P(Rd, yb - dT * 0.5, a);
        ctx.fillStyle = k % 3 === 0 ? RUBY : '#ffe6a0';
        ctx.beginPath(); ctx.ellipse(x, y, (k % 3 === 0 ? 1.3 : 0.8) * Math.max(0.35, c), k % 3 === 0 ? 1.3 : 0.8, 0, 0, PI * 2); ctx.fill();
        if (k % 3 === 0) { ctx.fillStyle = 'rgba(255,220,220,0.8)'; ctx.fillRect(x + 0.2, y - 0.8, 0.6, 0.6); }
      }
      const tg = ctx.createLinearGradient(tx - Rd, 0, tx + Rd, 0);
      tg.addColorStop(0, '#9a6a1c'); tg.addColorStop(0.7, '#fff0c0'); tg.addColorStop(1, '#d8a040');
      ctx.fillStyle = tg; ctx.beginPath(); ctx.ellipse(tx, yb - dT, Rd, Rd * TILT, 0, 0, PI * 2); ctx.fill();
    }
    const d0 = oA - oH;                       // bottom disc sits on the octagon
    disc(d0);
    const gB = d0 - dT, gHt = S * 0.42, gT = gB - gHt, gM = (gB + gT) / 2, gR = W * 0.040;
    // Hourglass profile: radius at height y (0.6 at the discs, swelling to ~0.92, pinched to a narrow neck)
    const glassR = (y) => {
      const v = 1 - Math.min(1, Math.abs(y - gM) / (gHt / 2));       // 0 at the discs, 1 at the neck
      return gR * (0.07 + 0.93 * Math.pow(Math.cos(PI / 2 * v), 1.3)) * (1 - 0.4 * Math.exp(-v * v / 0.012));
    };
    const glassPath = () => {
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) { const y = gB - gHt * i / 60; ctx.lineTo(tx - glassR(y), y); }
      for (let i = 60; i >= 0; i--) { const y = gB - gHt * i / 60; ctx.lineTo(tx + glassR(y), y); }
      ctx.closePath();
    };

    // ── Three twisted pillars between the discs ──
    const Rp = Rd * 0.84, pw = W * 0.0040;
    const pillars = [0, 1, 2].map(j => phi + PI / 3 + j * PI * 2 / 3);
    function pillar(a) {
      const c = Math.cos(a), [x, yb] = P(Rp, gB, a), [, yt] = P(Rp, gT, a);
      ctx.fillStyle = gold(x - pw, x + pw); ctx.fillRect(x - pw, yt, pw * 2, yb - yt);
      // Spiral flutes, sliding as the pillar turns
      ctx.strokeStyle = 'rgba(80,46,8,0.45)'; ctx.lineWidth = 0.7;
      const off = ((a * 2.2) % (PI * 2) + PI * 2) % (PI * 2) / (PI * 2) * 4.5;
      for (let y = yt + off; y < yb; y += 4.5) { ctx.beginPath(); ctx.moveTo(x - pw, y + 1.1); ctx.lineTo(x + pw, y - 1.1); ctx.stroke(); }
      [yt + 1.2, yb - 1.2].forEach(yy => {
        const kg = ctx.createRadialGradient(x + pw * 0.5, yy - pw * 0.5, 0, x, yy, pw * 1.25);
        kg.addColorStop(0, '#fff6d8'); kg.addColorStop(0.6, '#d8a040'); kg.addColorStop(1, '#6a4410');
        ctx.fillStyle = kg; ctx.beginPath(); ctx.arc(x, yy, pw * 1.25, 0, PI * 2); ctx.fill();
      });
      if (c < 0) { ctx.fillStyle = 'rgba(40,20,40,0.30)'; ctx.fillRect(x - pw * 1.3, yt - 1, pw * 2.6, yb - yt + 2); }
    }
    pillars.filter(a => Math.cos(a) < 0).forEach(pillar);

    // ── The glass, with sand running through it ──
    ctx.fillStyle = 'rgba(255,232,214,0.13)'; glassPath(); ctx.fill();
    ctx.save(); glassPath(); ctx.clip();
    const sandG = (y0, y1) => {
      const g = ctx.createLinearGradient(tx - gR, 0, tx + gR, 0);
      g.addColorStop(0, '#9a5428'); g.addColorStop(0.45, '#d88a44'); g.addColorStop(0.75, '#ffd08a'); g.addColorStop(1, '#e09a50');
      return g;
    };
    // Upper bulb: sand from the neck up to a level, dimpled where it drains
    const yU = gT + gHt * 0.27, rU = glassR(yU), dip = gHt * 0.05;
    ctx.fillStyle = sandG();
    ctx.beginPath(); ctx.moveTo(tx - gR * 1.2, yU); ctx.lineTo(tx - rU, yU);
    ctx.quadraticCurveTo(tx - rU * 0.25, yU + dip * 0.1, tx, yU + dip); ctx.quadraticCurveTo(tx + rU * 0.25, yU + dip * 0.1, tx + rU, yU);
    ctx.lineTo(tx + gR * 1.2, yU); ctx.lineTo(tx + gR * 1.2, gM + 1); ctx.lineTo(tx - gR * 1.2, gM + 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,230,180,0.35)'; ctx.beginPath(); ctx.ellipse(tx, yU, rU, rU * TILT, 0, PI, PI * 2); ctx.fill();
    // Lower bulb: a cone of sand building up under the stream
    const yL = gB - gHt * 0.15, rL = glassR(yL), yP = yL - gHt * 0.10;
    ctx.fillStyle = sandG();
    ctx.beginPath(); ctx.moveTo(tx - gR * 1.2, gB + 1); ctx.lineTo(tx - gR * 1.2, yL + rL * TILT); ctx.lineTo(tx - rL, yL + rL * TILT * 0.4);
    ctx.quadraticCurveTo(tx - rL * 0.35, yL - (yL - yP) * 0.55, tx, yP); ctx.quadraticCurveTo(tx + rL * 0.35, yL - (yL - yP) * 0.55, tx + rL, yL + rL * TILT * 0.4);
    ctx.lineTo(tx + gR * 1.2, yL + rL * TILT); ctx.lineTo(tx + gR * 1.2, gB + 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,236,190,0.30)';
    ctx.beginPath(); ctx.moveTo(tx, yP); ctx.quadraticCurveTo(tx + rL * 0.35, yL - (yL - yP) * 0.55, tx + rL, yL + rL * TILT * 0.4); ctx.lineTo(tx + rL * 0.4, yL + rL * TILT * 0.4); ctx.closePath(); ctx.fill();
    // The stream, and grains tumbling down it (it wavers while the gust blows)
    const gl = gustLevel(t), wob = Math.sin(t * 17) * gl * 1.2;
    ctx.strokeStyle = 'rgba(255,200,120,0.85)'; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(tx, gM - 1); ctx.quadraticCurveTo(tx + wob * 2, (gM + yP) / 2, tx + wob, yP); ctx.stroke();
    if (gl > 0.02) {               // grains lifted into a swirl in both bulbs
      for (let i = 0; i < 34; i++) {
        const low = i % 2 === 0, cy = low ? yL - gHt * 0.10 : yU + gHt * 0.06, ang = i * 2.39 + t * (4 + (i % 5)), rr = glassR(cy) * (0.25 + 0.6 * ((i * 0.37) % 1));
        const x = tx + Math.cos(ang) * rr, y = cy + Math.sin(ang) * rr * 0.35 - ((i * 0.53) % 1) * gHt * 0.06 * gl;
        ctx.fillStyle = `rgba(255,226,170,${(0.9 * gl * (Math.sin(ang) > 0 ? 1 : 0.5)).toFixed(3)})`; ctx.fillRect(x, y, 1.1, 1.1);
      }
    }
    for (let i = 0; i < 9; i++) {
      const f = ((t * 1.7 + i / 9) % 1), y = gM + f * (yP - gM), jx = Math.sin(i * 7.3 + t * 9) * 0.6 * f;
      ctx.fillStyle = 'rgba(255,236,190,0.95)'; ctx.fillRect(tx - 0.6 + jx, y, 1.2, 1.2);
    }
    // A puff where the grains land
    const puff = 0.5 + 0.5 * Math.sin(t * 6.1);
    ctx.fillStyle = `rgba(255,220,160,${(0.25 + 0.2 * puff).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(tx, yP + 0.5, 2 + puff, 0.9, 0, 0, PI * 2); ctx.fill();
    // Glass: a pink sky reflection on the shaded side, a bright window of sun on the lit side
    ctx.fillStyle = 'rgba(240,160,200,0.16)'; ctx.fillRect(tx - gR, gT, gR * 0.35, gHt);
    ctx.restore();
    const edge = (side, frac, col, w, y0, y1) => {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath();
      for (let y = y0; y <= y1; y += 1.5) { const x = tx + side * glassR(y) * frac; y === y0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
    };
    edge(1, 0.60, 'rgba(255,252,236,0.70)', 1.6, gT + gHt * 0.07, gM - gHt * 0.12);
    edge(1, 0.60, 'rgba(255,252,236,0.60)', 1.6, gM + gHt * 0.12, gB - gHt * 0.20);
    edge(-1, 0.80, 'rgba(255,230,240,0.25)', 0.8, gT + gHt * 0.05, gB - gHt * 0.05);
    ctx.strokeStyle = 'rgba(255,240,226,0.50)'; ctx.lineWidth = 0.7; glassPath(); ctx.stroke();
    // A slow glint drifting down the lit edge of the glass (the calm shine)
    {
      const f = (t / 7.9) % 1, y = gT + gHt * (0.08 + 0.84 * f), x = tx + glassR(y) * 0.60, a = Math.sin(f * PI);
      glow(x, y, 6, `rgba(255,250,230,${(0.55 * a).toFixed(3)})`);
    }

    disc(gT + dT);                            // the top disc caps the glass
    pillars.filter(a => Math.cos(a) >= 0).forEach(pillar);

    // ── Dome, turquoise collar and an orb for the falcon to stand on ──
    const dTop = gT, rc = Rd * 0.60, dH = S * 0.050;
    ctx.fillStyle = gold(tx - rc, tx + rc);
    ctx.beginPath(); ctx.moveTo(tx - rc, dTop); ctx.bezierCurveTo(tx - rc, dTop - dH * 0.8, tx - rc * 0.3, dTop - dH, tx, dTop - dH); ctx.bezierCurveTo(tx + rc * 0.3, dTop - dH, tx + rc, dTop - dH * 0.8, tx + rc, dTop); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = TURQ; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(tx, dTop - dH * 0.25, rc * 0.93, rc * 0.93 * TILT, 0, 0, PI); ctx.stroke();
    for (let k = 0; k < 8; k++) {           // fluting on the dome, turning
      const a = phi + k * PI / 4, c = Math.cos(a); if (c < 0.1) continue;
      ctx.strokeStyle = `rgba(90,55,10,${(0.15 + 0.3 * c).toFixed(3)})`; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(tx + rc * 0.92 * Math.sin(a), dTop - dH * 0.30); ctx.quadraticCurveTo(tx + rc * 0.7 * Math.sin(a), dTop - dH * 0.85, tx + rc * 0.15 * Math.sin(a), dTop - dH * 0.98); ctx.stroke();
    }
    const u = W * 0.030, ro = u * 0.17, oy = dTop - dH - ro * 0.8;
    const og = ctx.createRadialGradient(tx + ro * 0.4, oy - ro * 0.4, 0, tx, oy, ro);
    og.addColorStop(0, '#fff6dc'); og.addColorStop(0.5, '#e0a848'); og.addColorStop(1, '#5a3a08');
    ctx.fillStyle = og; ctx.beginPath(); ctx.arc(tx, oy, ro, 0, PI * 2); ctx.fill();

    // ── The falcon: broad raised wings with layered feathers, hooked beak — one gold silhouette turning with the cup ──
    {
      const c = Math.cos(phi), sx = Math.abs(c) < 0.06 ? (c < 0 ? -0.06 : 0.06) : c, sg = sx / Math.abs(sx);
      const v = W * 0.034;
      ctx.save(); ctx.translate(tx, oy - ro * 0.7); ctx.scale(sx, 1);
      // Light comes from the screen's right; flip the gradient when the bird is mirrored so it stays lit on that side
      const fg = ctx.createLinearGradient(-v * 1.2 * sg, 0, v * 1.2 * sg, 0);
      fg.addColorStop(0, '#6a4410'); fg.addColorStop(0.32, '#b8822a'); fg.addColorStop(0.62, '#ffeab8'); fg.addColorStop(0.78, '#fff6dc'); fg.addColorStop(0.9, '#e8b850'); fg.addColorStop(1, '#8a5a14');
      const cov = ctx.createLinearGradient(-v * sg, -2 * v, v * sg, -v);
      cov.addColorStop(0, '#8a5a14'); cov.addColorStop(0.6, '#ffe2a0'); cov.addColorStop(1, '#c8902c');
      const WING = [[1.04, -1.88], [1.13, -1.80], [0.98, -1.72], [1.07, -1.62], [0.92, -1.55], [0.99, -1.44], [0.84, -1.39], [0.89, -1.27], [0.74, -1.24], [0.75, -1.11], [0.63, -1.08], [0.59, -0.98], [0.47, -0.98], [0.41, -0.88], [0.29, -0.86], [0.21, -0.77], [0.12, -0.74]];
      const wing = (m) => {
        ctx.beginPath(); ctx.moveTo(m * 0.13 * v, -0.98 * v);
        ctx.quadraticCurveTo(m * 0.36 * v, -1.38 * v, m * 0.66 * v, -1.72 * v);
        ctx.quadraticCurveTo(m * 0.88 * v, -2.00 * v, m * 1.18 * v, -2.03 * v);
        WING.forEach(([x, y]) => ctx.lineTo(m * x * v, y * v)); ctx.closePath();
      };
      const coverts = (m) => {
        ctx.beginPath(); ctx.moveTo(m * 0.13 * v, -0.98 * v);
        ctx.quadraticCurveTo(m * 0.36 * v, -1.38 * v, m * 0.66 * v, -1.72 * v); ctx.lineTo(m * 0.74 * v, -1.80 * v);
        [[0.66, -1.62], [0.62, -1.58], [0.56, -1.48], [0.50, -1.44], [0.44, -1.34], [0.38, -1.30], [0.32, -1.18], [0.26, -1.14], [0.18, -1.02]].forEach(([x, y]) => ctx.lineTo(m * x * v, y * v));
        ctx.closePath();
      };
      [1, -1].forEach(m => {
        ctx.fillStyle = fg; wing(m); ctx.fill();
        ctx.strokeStyle = 'rgba(80,46,8,0.55)'; ctx.lineWidth = 0.5; ctx.stroke();
        // Flight feathers: separation lines running in from each notch
        ctx.strokeStyle = 'rgba(80,46,8,0.45)'; ctx.lineWidth = 0.45;
        for (let k = 1; k < WING.length - 1; k += 2) { const [x, y] = WING[k]; ctx.beginPath(); ctx.moveTo(m * x * v, y * v); ctx.lineTo(m * (x * 0.55 + 0.12) * v, (y * 0.6 - 0.62) * v); ctx.stroke(); }
        ctx.fillStyle = cov; coverts(m); ctx.fill();
        ctx.strokeStyle = 'rgba(90,55,10,0.55)'; ctx.lineWidth = 0.45; ctx.stroke();
        // Little scalloped feather rows on the coverts
        ctx.strokeStyle = 'rgba(90,55,10,0.35)';
        [[0.24, -1.12], [0.34, -1.26], [0.44, -1.40], [0.54, -1.52]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(m * x * v, y * v, v * 0.05, 0, PI); ctx.stroke(); });
      });
      // Tail fan with feather lines, feathered legs gripping the orb
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.moveTo(-0.11 * v, -0.44 * v); ctx.lineTo(0.11 * v, -0.44 * v); ctx.lineTo(0.22 * v, -0.06 * v);
      ctx.quadraticCurveTo(0, 0.03 * v, -0.22 * v, -0.06 * v); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(80,46,8,0.40)'; ctx.lineWidth = 0.4;
      [-0.12, -0.04, 0.04, 0.12].forEach(x => { ctx.beginPath(); ctx.moveTo(x * 0.5 * v, -0.40 * v); ctx.lineTo(x * v * 1.5, -0.06 * v); ctx.stroke(); });
      ctx.strokeStyle = '#8a5a14'; ctx.lineWidth = 0.9; ctx.lineCap = 'round';
      [-1, 1].forEach(m => { ctx.beginPath(); ctx.moveTo(m * 0.09 * v, -0.30 * v); ctx.lineTo(m * 0.12 * v, -0.02 * v); ctx.lineTo(m * 0.19 * v, 0.03 * v); ctx.moveTo(m * 0.12 * v, -0.02 * v); ctx.lineTo(m * 0.06 * v, 0.04 * v); ctx.stroke(); });
      ctx.fillStyle = fg; [-1, 1].forEach(m => { ctx.beginPath(); ctx.ellipse(m * 0.10 * v, -0.34 * v, 0.08 * v, 0.12 * v, 0, 0, PI * 2); ctx.fill(); });
      // Body: a deep chest with rows of chevron markings
      ctx.beginPath(); ctx.ellipse(0, -0.72 * v, 0.23 * v, 0.43 * v, 0, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(90,55,10,0.45)'; ctx.lineWidth = 0.45;
      for (let k = 0; k < 5; k++) { const y = -0.96 * v + k * 0.12 * v, w = 0.13 - Math.abs(k - 2) * 0.012; ctx.beginPath(); ctx.moveTo(-w * v, y); ctx.lineTo(0, y + 0.05 * v); ctx.lineTo(w * v, y); ctx.stroke(); }
      // Head: rounded crown, a strong brow, hooked beak
      ctx.fillStyle = fg; ctx.beginPath(); ctx.ellipse(0, -1.22 * v, 0.17 * v, 0.16 * v, 0, 0, PI * 2); ctx.fill();
      if (c > 0) {
        ctx.globalAlpha = Math.min(1, c * 3);
        ctx.strokeStyle = '#6a4410'; ctx.lineWidth = 0.8;
        [-1, 1].forEach(m => { ctx.beginPath(); ctx.moveTo(m * 0.02 * v, -1.30 * v); ctx.quadraticCurveTo(m * 0.08 * v, -1.33 * v, m * 0.14 * v, -1.27 * v); ctx.stroke(); });
        ctx.fillStyle = '#2a1804'; [-1, 1].forEach(m => { ctx.beginPath(); ctx.arc(m * 0.075 * v, -1.245 * v, 0.032 * v, 0, PI * 2); ctx.fill(); });
        ctx.fillStyle = '#fff6dc'; [-1, 1].forEach(m => ctx.fillRect(m * 0.075 * v + 0.15, -1.255 * v - 0.4, 0.6, 0.6));
        ctx.fillStyle = '#e0a848'; ctx.beginPath(); ctx.ellipse(0, -1.17 * v, 0.06 * v, 0.025 * v, 0, 0, PI * 2); ctx.fill();   // cere
        ctx.fillStyle = '#7a4c10'; ctx.beginPath(); ctx.moveTo(-0.05 * v, -1.16 * v); ctx.lineTo(0.05 * v, -1.16 * v);
        ctx.quadraticCurveTo(0.03 * v, -1.06 * v, 0, -1.03 * v); ctx.quadraticCurveTo(-0.03 * v, -1.06 * v, -0.05 * v, -1.16 * v); ctx.fill();
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = 'rgba(40,20,30,0.22)'; [1, -1].forEach(m => { wing(m); ctx.fill(); });
      }
      ctx.restore();
    }
    ctx.restore();
  }

  // ════════ SKY LIFE — twinkling stars, a hot-air balloon, a falcon on the wing ════════
  function drawSkyLife(ctx, W, H, t) {
    const m = t % SHOW;
    const glow = (x, y, r, col) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    };
    // A handful of stars twinkle
    let seed = 9; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < 9; i++) {
      const x = rnd() * W * 0.55, y = rnd() * H * 0.20, ph = rnd() * 6, rate = 0.7 + rnd() * 1.4;
      const a = Math.pow(Math.max(0, Math.sin(t * rate + ph)), 4) * (1 - y / (H * 0.24));
      if (a > 0.05) { glow(x, y, 4, `rgba(255,250,240,${(0.7 * a).toFixed(3)})`); ctx.fillStyle = `rgba(255,255,250,${a.toFixed(3)})`; ctx.fillRect(x - 0.6, y - 0.6, 1.3, 1.3); }
    }
    // The morning star breathes
    glow(W * 0.115, H * 0.095, 6 + 2 * Math.sin(t * 1.3), 'rgba(255,250,235,0.35)');

    // Hot-air balloon drifting west and slowly climbing; it fades in and out at the ends of its run
    {
      const f = ((t + 18) / 71.9) % 1, x = W * (0.36 - f * 0.30), y = H * (0.30 - f * 0.17), r = H * 0.036;
      const a = Math.min(1, f / 0.08, (1 - f) / 0.08);
      ctx.save(); ctx.globalAlpha = a;
      ctx.translate(x, y + Math.sin(t * 0.7) * 1.2);
      let burn = 0; BURNS.forEach(b => { const w = win(m, b); if (w >= 0) burn = Math.max(burn, Math.sin(w * PI)); });
      // Envelope: stripes, lit on the sunward side
      const env = () => { ctx.beginPath(); ctx.moveTo(-r * 0.30, r * 0.95); ctx.bezierCurveTo(-r * 1.15, r * 0.30, -r * 1.05, -r * 1.10, 0, -r * 1.12); ctx.bezierCurveTo(r * 1.05, -r * 1.10, r * 1.15, r * 0.30, r * 0.30, r * 0.95); ctx.closePath(); };
      ctx.save(); env(); ctx.clip();
      const cols = ['#d83a3a', '#f2c440', '#1ab0a6', '#f2c440', '#d83a3a', '#1ab0a6'];
      for (let k = 0; k < 6; k++) { ctx.fillStyle = cols[k]; ctx.fillRect(-r * 1.2 + k * r * 0.40, -r * 1.2, r * 0.40, r * 2.3); }
      const sh = ctx.createLinearGradient(-r, 0, r, 0);
      sh.addColorStop(0, 'rgba(50,20,70,0.55)'); sh.addColorStop(0.55, 'rgba(50,20,70,0.05)'); sh.addColorStop(0.85, 'rgba(255,230,190,0.30)'); sh.addColorStop(1, 'rgba(255,230,190,0.10)');
      ctx.fillStyle = sh; ctx.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4);
      if (burn > 0) { ctx.globalCompositeOperation = 'lighter'; const bg = ctx.createRadialGradient(0, r * 0.9, 0, 0, r * 0.9, r * 1.4); bg.addColorStop(0, `rgba(255,170,80,${(0.55 * burn).toFixed(3)})`); bg.addColorStop(1, 'rgba(255,170,80,0)'); ctx.fillStyle = bg; ctx.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4); }
      ctx.restore();
      // Ropes and basket
      ctx.strokeStyle = 'rgba(60,30,40,0.8)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(-r * 0.30, r * 0.95); ctx.lineTo(-r * 0.16, r * 1.30); ctx.moveTo(r * 0.30, r * 0.95); ctx.lineTo(r * 0.16, r * 1.30); ctx.stroke();
      ctx.fillStyle = '#6a3a24'; ctx.fillRect(-r * 0.18, r * 1.30, r * 0.36, r * 0.24);
      ctx.fillStyle = 'rgba(255,210,160,0.6)'; ctx.fillRect(r * 0.08, r * 1.30, r * 0.10, r * 0.24);
      if (burn > 0) { glow(0, r * 1.02, r * 0.5 * burn + 2, `rgba(255,190,90,${(0.9 * burn).toFixed(3)})`); ctx.fillStyle = `rgba(255,240,180,${burn.toFixed(3)})`; ctx.beginPath(); ctx.moveTo(-1.2, r * 1.20); ctx.quadraticCurveTo(0, r * (1.0 - 0.25 * burn), 1.2, r * 1.20); ctx.fill(); }
      ctx.restore();
    }

    // Falcon gliding in from the east, banking in one lazy circle, then away west
    {
      const w = win(m, FALCON);
      if (w >= 0) {
        const ease = w, ang = ease * PI * 2;
        const x = W * (1.06 - 1.18 * ease) + Math.sin(ang) * W * 0.05, y = H * (0.17 + 0.03 * Math.sin(ease * PI)) - (1 - Math.cos(ang)) * H * 0.025;
        const flap = (ease < 0.12 || (ease > 0.55 && ease < 0.66)) ? Math.sin(t * 13) : 0.25;     // a few beats, then a glide
        const s = H * 0.022;
        ctx.save(); ctx.translate(x, y); ctx.rotate(Math.cos(ang) * -0.15);
        ctx.fillStyle = 'rgba(52,26,40,0.92)';
        ctx.beginPath();
        ctx.moveTo(-s * 1.6, -s * 0.30 * flap + s * 0.10); ctx.quadraticCurveTo(-s * 0.7, -s * 0.45 - s * 0.35 * flap, -s * 0.15, -s * 0.05);
        ctx.lineTo(-s * 0.35, -s * 0.12); ctx.quadraticCurveTo(-s * 0.55, -s * 0.10, -s * 0.62, 0);   // head, facing west
        ctx.lineTo(-s * 0.15, s * 0.10); ctx.lineTo(s * 0.55, s * 0.08); ctx.lineTo(s * 0.80, s * 0.18); ctx.lineTo(s * 0.80, -s * 0.04); ctx.lineTo(s * 0.25, -s * 0.06);
        ctx.quadraticCurveTo(s * 0.7, -s * 0.45 - s * 0.35 * flap, s * 1.6, -s * 0.30 * flap + s * 0.10);
        ctx.quadraticCurveTo(s * 0.6, -s * 0.10, s * 0.10, s * 0.02); ctx.quadraticCurveTo(-s * 0.6, -s * 0.10, -s * 1.6, -s * 0.30 * flap + s * 0.10); ctx.fill();
        ctx.strokeStyle = 'rgba(255,190,140,0.55)'; ctx.lineWidth = 0.6;          // sun catching the trailing edges
        ctx.beginPath(); ctx.moveTo(s * 1.5, -s * 0.30 * flap + s * 0.12); ctx.quadraticCurveTo(s * 0.6, -s * 0.06, s * 0.10, s * 0.04); ctx.stroke();
        ctx.restore();
      }
    }
  }

  // ════════ BACK LIFE — skyline lights, first light on the dunes, the caravan, sand off the crests, a dust devil ════════
  function drawBackLife(ctx, W, H, t) {
    const m = t % SHOW;
    const glow = (x, y, r, col) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    };
    // Sunrise glinting off tower glass, one tower at a time
    SKYLINE.forEach(([fx, fw, fh, kind, row], i) => {
      if (fh < 0.035) return;
      const f = ((t + i * 1.37) / 6.7) % 1; if (f > 0.07) return;
      const a = Math.sin(f / 0.07 * PI), x = W * (fx + fw) - 0.5, y = H * (0.455 - fh * 0.75);
      glow(x, y, 6, `rgba(255,240,210,${(0.8 * a).toFixed(3)})`);
      ctx.fillStyle = `rgba(255,255,240,${a.toFixed(3)})`; ctx.fillRect(x - 3 * a, y - 0.4, 6 * a, 0.8); ctx.fillRect(x - 0.4, y - 3 * a, 0.8, 6 * a);
    });
    // Red aviation light on the needle's spire
    { const on = (t % 1.9) < 0.5 ? 1 : 0.15; glow(W * 0.135, H * 0.205, 4, `rgba(255,60,50,${(0.9 * on).toFixed(3)})`); ctx.fillStyle = `rgba(255,90,80,${on})`; ctx.fillRect(W * 0.135 - 0.7, H * 0.205 - 0.7, 1.4, 1.4); }

    // First light sweeping down the face of the big dune under the sun
    {
      const w = win(m, SHEEN);
      if (w >= 0) {
        const env = Math.sin(w * PI), d = DUNES.R;
        ctx.save();
        ctx.beginPath(); ctx.moveTo(W * d.x0, H * 0.62); for (let x = W * d.x0; x <= W * d.x1; x += 3) ctx.lineTo(x, crestY(d, x, W, H)); ctx.lineTo(W * d.x1, H * 0.62); ctx.closePath(); ctx.clip();
        ctx.globalCompositeOperation = 'lighter';
        const bx = W * (1.02 - w * 0.62), y0 = H * 0.44;
        const g = ctx.createLinearGradient(bx - W * 0.07, 0, bx + W * 0.07, 0);
        g.addColorStop(0, 'rgba(255,200,140,0)'); g.addColorStop(0.5, `rgba(255,214,160,${(0.40 * env).toFixed(3)})`); g.addColorStop(1, 'rgba(255,200,140,0)');
        ctx.fillStyle = g; ctx.save(); ctx.translate(bx, y0); ctx.transform(1, 0, 0.6, 1, 0, 0); ctx.translate(-bx, -y0);
        ctx.fillRect(bx - W * 0.07, y0, W * 0.14, H * 0.18); ctx.restore();
        ctx.restore();
      }
    }

    // Camel caravan plodding west along the crest, silhouetted against the sunrise
    {
      const d = DUNES.R, s = H * 0.040, f = ((t + 8) / 61.3) % 1;
      const lead = W * (1.10 - f * 0.66);
      // Hoof prints trailing along the crest, filling in with blown sand the further back they are
      { const lastX = lead + 3 * s * 1.30;
        for (let k = 0; k < 60; k++) { const x = lastX + s * 0.4 + k * 3.1, back = (x - lastX) / (W * 0.18); if (back > 1 || x > W * 1.06) break; if (x < W * 0.46) continue;
          ctx.fillStyle = `rgba(120,50,70,${(0.55 * (1 - back)).toFixed(3)})`; ctx.fillRect(x, crestY(d, x, W, H) + 1.4 + (k % 2) * 0.9, 1.6, 0.8); } }
      for (let i = 0; i < 4; i++) {
        const x = lead + i * s * 1.30, size = i === 3 ? 0.72 : 1;       // the last one is a calf
        if (x < W * 0.44 || x > W * 1.08) continue;
        const fade = Math.min(1, (x - W * 0.44) / (W * 0.06));
        camel(ctx, x, crestY(d, x, W, H) + 0.5, s * size, t * 4.2 + i * 1.3, fade, W);
      }
    }

    // Dust devil spinning across the far dune, west of the cup
    {
      const w = win(m, DEVIL);
      if (w >= 0) {
        const env = Math.min(1, w / 0.15, (1 - w) / 0.15), cx = W * (0.04 + 0.30 * w), base = H * 0.548, hgt = H * 0.13, lean = W * 0.012;
        let seed = 41; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
        const col = ctx.createLinearGradient(0, base - hgt, 0, base);
        col.addColorStop(0, 'rgba(240,180,140,0)'); col.addColorStop(1, `rgba(240,180,140,${(0.22 * env).toFixed(3)})`);
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(cx - 2, base); ctx.lineTo(cx - W * 0.020 + lean, base - hgt); ctx.lineTo(cx + W * 0.020 + lean, base - hgt); ctx.lineTo(cx + 2, base); ctx.closePath(); ctx.fill();
        for (let i = 0; i < 90; i++) {
          const h = rnd(), rad = W * (0.003 + 0.020 * h), a0 = rnd() * PI * 2, sp = 5 + rnd() * 3;
          const ang = a0 + t * sp, x = cx + lean * h + Math.cos(ang) * rad, y = base - h * hgt + Math.sin(ang) * rad * 0.22;
          const front = Math.sin(ang) > 0 ? 1 : 0.55;
          ctx.fillStyle = `rgba(255,${200 + 30 * front | 0},170,${(env * 0.55 * front * (1 - h * 0.6)).toFixed(3)})`;
          ctx.fillRect(x, y, 1 + (1 - h), 1);
        }
        ctx.fillStyle = `rgba(230,170,130,${(0.25 * env).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(cx, base, W * 0.016, H * 0.006, 0, 0, PI * 2); ctx.fill();
      }
    }
    spindrift(ctx, W, H, t, [DUNES.R, DUNES.L]);
  }

  // Heat shimmer: the horizon under the sun wavers as the sand warms (rows of the still layers redrawn with a sway)
  function heatShimmer(ctx, W, H, t) {
    const x0 = Math.round(W * 0.56), w = W - x0, yc = H * 0.442;
    for (let y = Math.round(H * 0.420); y < H * 0.464; y++) {
      const f = Math.max(0, 1 - Math.abs(y - yc) / (H * 0.022));
      const off = (Math.sin(y * 1.3 + t * 4.2) * 0.9 + Math.sin(y * 0.41 - t * 2.3) * 0.5) * f;
      ctx.drawImage(skyL, x0, y, w, 1, x0 + off, y, w, 1);
      ctx.drawImage(back, x0, y, w, 1, x0 + off, y, w, 1);
    }
  }

  // A white 4x4 bursts over the near dune's peak, catches a little air and runs off down the slope, trailing sand
  function drawJeep(ctx, W, H, t) {
    const w = win(t % SHOW, JEEP); if (w < 0) return;
    const d = DUNES.NR, pos = (f) => W * (1.08 - 0.50 * f);
    const x = pos(w), hop = Math.max(0, 1 - Math.abs(x - W * d.pX) / (W * 0.035)), air = H * 0.022 * hop * hop;
    const y = crestY(d, x, W, H) - air, slope = Math.atan2(crestY(d, x + 6, W, H) - crestY(d, x - 6, W, H), 12) * (1 - hop * 0.6);
    const L = W * 0.050, h = H * 0.030;
    // Sand plume left behind (to the east), thickest where it hit the peak
    let seed = 77; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < 40; i++) {
      const age = ((i / 40) + t * 1.4) % 1, back = pos(Math.max(0, w - age * 0.12));
      const px = back + L * 0.5 + age * W * 0.02 + (rnd() - 0.5) * 6, py = crestY(d, back, W, H) - age * H * 0.035 - rnd() * 4;
      const a = (1 - age) * 0.45 * Math.min(1, w * 8, (1 - w) * 6);
      const g = ctx.createRadialGradient(px, py, 0, px, py, 2 + age * 6);
      g.addColorStop(0, `rgba(250,206,160,${a.toFixed(3)})`); g.addColorStop(1, 'rgba(250,206,160,0)');
      ctx.fillStyle = g; ctx.fillRect(px - 8, py - 8, 16, 16);
    }
    ctx.save(); ctx.translate(x, y); ctx.rotate(slope); ctx.translate(0, Math.sin(t * 23) * 0.4);
    // Wheels with turning hubs
    [-L * 0.30, L * 0.30].forEach(wx => {
      ctx.fillStyle = '#2a1a22'; ctx.beginPath(); ctx.arc(wx, -h * 0.25, h * 0.26, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = '#b0a4a0'; ctx.lineWidth = 0.7; const sp = -t * 18;
      for (let k = 0; k < 3; k++) { const a = sp + k * PI / 3; ctx.beginPath(); ctx.moveTo(wx + Math.cos(a) * h * 0.13, -h * 0.25 + Math.sin(a) * h * 0.13); ctx.lineTo(wx - Math.cos(a) * h * 0.13, -h * 0.25 - Math.sin(a) * h * 0.13); ctx.stroke(); }
    });
    // Body (facing west), cabin, windows reflecting the dawn, roof rack, spare wheel on the tailgate
    const bg = ctx.createLinearGradient(0, -h, 0, -h * 0.2); bg.addColorStop(0, '#fffaf4'); bg.addColorStop(1, '#c8b8b8');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(-L * 0.50, -h * 0.30); ctx.lineTo(-L * 0.48, -h * 0.62); ctx.lineTo(-L * 0.22, -h * 0.66); ctx.lineTo(-L * 0.12, -h * 1.00);
    ctx.lineTo(L * 0.42, -h * 1.00); ctx.lineTo(L * 0.46, -h * 0.62); ctx.lineTo(L * 0.48, -h * 0.30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4a5478'; ctx.beginPath(); ctx.moveTo(-L * 0.18, -h * 0.66); ctx.lineTo(-L * 0.10, -h * 0.92); ctx.lineTo(L * 0.38, -h * 0.92); ctx.lineTo(L * 0.40, -h * 0.66); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,190,170,0.55)'; ctx.fillRect(-L * 0.06, -h * 0.90, L * 0.10, h * 0.22);
    ctx.fillStyle = bg; ctx.fillRect(L * 0.12, -h * 0.92, 1.2, h * 0.26);
    ctx.fillStyle = '#3a3040'; ctx.fillRect(-L * 0.08, -h * 1.10, L * 0.48, h * 0.08);
    ctx.fillStyle = '#2a1a22'; ctx.beginPath(); ctx.ellipse(L * 0.50, -h * 0.55, h * 0.10, h * 0.22, 0, 0, PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,230,190,0.9)'; ctx.fillRect(-L * 0.12, -h * 1.00, L * 0.54, 0.8);
    ctx.fillStyle = '#ffe6a0'; ctx.fillRect(-L * 0.50, -h * 0.55, 1.6, h * 0.12);
    ctx.restore();
  }

  // Sand smoking off the crests, blowing west; stronger while the gust passes
  function gustLevel(t) { const w = win(t % SHOW, GUST); return w >= 0 ? Math.sin(w * PI) : 0; }
  function spindrift(ctx, W, H, t, dunes) {
    const g = gustLevel(t);
    let seed = 23; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    dunes.forEach(d => {
      const pX = W * d.pX;
      for (let i = 0; i < 46; i++) {
        const sx = pX + (rnd() - 0.15) * W * 0.07, ph = rnd(), rate = 0.45 + rnd() * 0.35, big = rnd();
        if (big > 0.45 + 0.55 * g) continue;                 // only some streams run in calm air
        const f = (t * rate + ph) % 1;
        const x = sx - f * W * (0.05 + 0.05 * g), y = crestY(d, sx, W, H) - f * H * (0.012 + 0.01 * g) + Math.sin(f * 9 + i) * 0.8;
        const a = Math.sin(f * PI) * (0.30 + 0.35 * g);
        ctx.fillStyle = `rgba(255,224,180,${a.toFixed(3)})`; ctx.fillRect(x, y, 1.6 + f * 2.5, 0.9);
      }
    });
  }

  // A backlit camel: dark silhouette with the sun rimming its hump, neck and legs swinging in a slow walk (facing west)
  function camel(ctx, x, y, s, ph, alpha, W) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y);
    const DARK = '#3e1c2c';
    ctx.strokeStyle = DARK; ctx.lineCap = 'round'; ctx.lineWidth = s * 0.07;
    // Legs: each pair swings in counter-phase, knees bending as they lift
    [[-0.26, 0], [-0.20, PI], [0.24, PI * 0.5], [0.30, PI * 1.5]].forEach(([lx, o]) => {
      const sw = Math.sin(ph + o), lift = Math.max(0, Math.cos(ph + o)) * s * 0.05;
      const hipX = lx * s, hipY = -s * 0.50, footX = hipX + sw * s * 0.10, kneeX = hipX + sw * s * 0.03 - s * 0.02;
      ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.lineTo(kneeX, -s * 0.24 - lift); ctx.lineTo(footX, -lift); ctx.stroke();
    });
    ctx.fillStyle = DARK;
    ctx.beginPath(); ctx.ellipse(0, -s * 0.58, s * 0.40, s * 0.14, 0, 0, PI * 2); ctx.fill();          // barrel
    ctx.beginPath(); ctx.ellipse(s * 0.02, -s * 0.72, s * 0.20, s * 0.17, 0, PI, PI * 2); ctx.fill();   // hump
    // Neck dipping forward and up to the head, nodding with the stride
    const nod = Math.sin(ph * 2) * s * 0.02;
    ctx.lineWidth = s * 0.11;
    ctx.beginPath(); ctx.moveTo(-s * 0.32, -s * 0.60); ctx.quadraticCurveTo(-s * 0.58, -s * 0.62, -s * 0.60, -s * 0.90 + nod); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-s * 0.68, -s * 0.94 + nod, s * 0.11, s * 0.055, -0.15, 0, PI * 2); ctx.fill();
    ctx.lineWidth = s * 0.04; ctx.beginPath(); ctx.moveTo(s * 0.38, -s * 0.58); ctx.quadraticCurveTo(s * 0.46, -s * 0.50, s * 0.44, -s * 0.38); ctx.stroke();   // tail
    // Saddle blanket, a hint of colour
    ctx.fillStyle = 'rgba(160,40,50,0.85)'; ctx.fillRect(-s * 0.16, -s * 0.66, s * 0.30, s * 0.10);
    // Rim of sunrise along the top edges
    ctx.strokeStyle = 'rgba(255,214,150,0.85)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.ellipse(s * 0.02, -s * 0.72, s * 0.20, s * 0.17, 0, PI * 1.05, PI * 1.95); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.60, -s * 0.97 + nod); ctx.lineTo(-s * 0.74, -s * 0.98 + nod); ctx.stroke();
    ctx.restore();
  }

  // ════════ OASIS — date palms swaying over the pool, light shivering on the water ════════
  function drawOasis(ctx, W, H, t) {
    // Shimmer on the pool
    { const px = W * POOL.x, py = H * POOL.y;
      // Palms mirrored in the still water
      ctx.save(); ctx.beginPath(); ctx.ellipse(px, py, W * POOL.rx, H * POOL.ry, 0, 0, PI * 2); ctx.clip();
      PALMS.forEach(([fx, fy, fh, lean], i) => {
        const x0 = W * fx, y0 = H * fy, h = H * fh, sway = Math.sin(t * 0.95 + i * 1.7) * 0.035;
        ctx.strokeStyle = 'rgba(70,40,50,0.45)'; ctx.lineWidth = h * 0.035;
        ctx.beginPath(); for (let k = 0; k <= 8; k++) { const f = k / 8; ctx.lineTo(x0 + (lean + sway) * h * f * f + Math.sin(f * 9 + t * 2) * 0.6, y0 + h * f * 0.5); } ctx.stroke();
        ctx.fillStyle = 'rgba(50,70,50,0.35)'; ctx.beginPath(); ctx.ellipse(x0 + (lean + sway) * h * 0.25, y0 + h * 0.10, h * 0.12, 2, 0, 0, PI * 2); ctx.fill();
      });
      ctx.restore();
      for (let k = 0; k < 7; k++) { const a = 0.5 + 0.5 * Math.sin(t * (1.3 + k * 0.4) + k * 2.1); ctx.fillStyle = `rgba(255,236,200,${(0.6 * a).toFixed(3)})`; ctx.fillRect(px - W * 0.045 + k * W * 0.014 + Math.sin(t + k) * 2, py - 2 + (k % 3) * 1.6, 3 + a * 3, 0.8); } }
    PALMS.forEach(([fx, fy, fh, lean], i) => {
      const x0 = W * fx, y0 = H * fy, h = H * fh, sway = Math.sin(t * 0.95 + i * 1.7) * 0.035 + Math.sin(t * 2.3 + i) * 0.010;
      const topX = x0 + (lean + sway) * h, topY = y0 - h;
      // Trunk: a gently curving column of ringed segments, lit on its right
      const n = 14;
      for (let k = 0; k < n; k++) {
        const f = k / n, f2 = (k + 1) / n;
        const xa = x0 + (topX - x0) * f * f, ya = y0 + (topY - y0) * f, xb = x0 + (topX - x0) * f2 * f2, yb = y0 + (topY - y0) * f2;
        const w = h * (0.045 - 0.015 * f);
        ctx.strokeStyle = '#5a3424'; ctx.lineWidth = w; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(xa, ya); ctx.lineTo(xb, yb); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,190,130,0.75)'; ctx.lineWidth = w * 0.25; ctx.beginPath(); ctx.moveTo(xa + w * 0.3, ya); ctx.lineTo(xb + w * 0.3, yb); ctx.stroke();
        ctx.fillStyle = 'rgba(40,20,20,0.45)'; ctx.fillRect(xa - w / 2, ya - 0.5, w, 0.8);
      }
      // Date clusters under the crown
      ctx.fillStyle = '#c8602a'; ctx.beginPath(); ctx.arc(topX - 2, topY + 3, 1.8, 0, PI * 2); ctx.arc(topX + 2.5, topY + 3.5, 1.6, 0, PI * 2); ctx.fill();
      // Fronds: arching blades with leaflets, the sunward ones lit gold
      const fr = 9;
      for (let k = 0; k < fr; k++) {
        const a = -PI / 2 + (k / (fr - 1) - 0.5) * 3.2 + sway * 2.0 + Math.sin(t * 1.7 + k + i) * 0.03;
        const len = h * (0.36 + 0.10 * Math.sin(k * 2.3 + i)), droop = h * 0.20 * Math.abs(Math.cos(a));
        const ex = topX + Math.cos(a) * len, ey = topY + Math.sin(a) * len * 0.55 + droop;
        const cx = topX + Math.cos(a) * len * 0.5, cy = topY + Math.sin(a) * len * 0.55 - h * 0.05;
        const lit = Math.cos(a) > 0.1;
        ctx.strokeStyle = lit ? '#6a7a2a' : '#2e3a2a'; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(topX, topY); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.stroke();
        ctx.strokeStyle = lit ? 'rgba(170,170,70,0.9)' : 'rgba(46,58,44,0.95)'; ctx.lineWidth = 0.7;
        for (let j = 2; j < 11; j++) {
          const u = j / 11, bx = (1 - u) ** 2 * topX + 2 * (1 - u) * u * cx + u * u * ex, by = (1 - u) ** 2 * topY + 2 * (1 - u) * u * cy + u * u * ey;
          const ll = h * 0.07 * Math.sin(u * PI) + 1;
          ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - Math.sin(a) * ll * 0.4, by + ll); ctx.stroke();
        }
        if (lit) { ctx.strokeStyle = 'rgba(255,214,140,0.55)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(topX, topY - 0.5); ctx.quadraticCurveTo(cx, cy - 0.5, ex, ey - 0.5); ctx.stroke(); }
      }
    });
  }

  // ════════ FRONT LIFE — lantern flame, coffee steam, the lizard, sand off the near crests ════════
  function drawFrontLife(ctx, W, H, t) {
    const m = t % SHOW;
    const glow = (x, y, r, col) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    };
    // Lantern flame
    {
      const x = W * 0.090, b = H * 0.668, s = H * 0.085;
      const fl = 0.75 + 0.15 * Math.sin(t * 9.3) + 0.10 * Math.sin(t * 23.1 + 1);
      glow(x, b - s * 0.30, s * 0.8 * fl, `rgba(255,170,80,${(0.30 * fl).toFixed(3)})`);
      ctx.fillStyle = `rgba(255,${200 + 40 * fl | 0},120,0.95)`;
      ctx.beginPath(); ctx.moveTo(x, b - s * (0.40 + 0.08 * fl)); ctx.quadraticCurveTo(x + s * 0.05, b - s * 0.24, x, b - s * 0.18); ctx.quadraticCurveTo(x - s * 0.05, b - s * 0.24, x, b - s * (0.40 + 0.08 * fl)); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,230,0.9)'; ctx.beginPath(); ctx.ellipse(x, b - s * 0.24, s * 0.015, s * 0.04, 0, 0, PI * 2); ctx.fill();
    }
    // Steam curling from the dallah's spout
    {
      const sx = W * 0.205 - H * 0.090 * 0.45, sy = H * 0.676 - H * 0.090 * 0.70;
      for (let k = 0; k < 3; k++) {
        const f = ((t / 4.7) + k / 3) % 1, a = Math.sin(f * PI) * 0.35;
        ctx.strokeStyle = `rgba(255,245,235,${a.toFixed(3)})`; ctx.lineWidth = 1.2 + f * 1.5;
        ctx.beginPath();
        for (let j = 0; j <= 8; j++) { const u = j / 8, yy = sy - f * H * 0.05 - u * H * 0.035, xx = sx - f * 3 + Math.sin(u * 5 + t * 2 + k) * (1.5 + f * 2); j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
        ctx.stroke();
      }
    }
    // The lizard: dashes onto the rock, bobs its head, later darts away east
    {
      const rx = W * 0.952, ry = H * 0.668 - H * 0.030;
      let x = null, run = 0, bob = 0;
      const wi = win(m, LIZ_IN), wo = win(m, LIZ_OUT), wb = win(m, LIZ_BOB);
      if (wi >= 0) { x = W * 1.04 + (rx - W * 1.04) * (1 - (1 - wi) ** 2); run = 1 - wi; }
      else if (m > LIZ_IN[1] && m < LIZ_OUT[0]) x = rx;
      else if (wo >= 0) { x = rx + (W * 1.06 - rx) * wo * wo; run = wo; }
      if (wb >= 0) bob = Math.max(0, Math.sin(wb * PI * 6)) * Math.sin(wb * PI);
      if (x !== null) {
        const y = x > W * 0.985 ? H * 0.676 : ry + 0.5;
        const dir = wo >= 0 ? 1 : -1;      // faces the way it is running (west on arrival, east when leaving)
        ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
        ctx.fillStyle = 'rgba(80,30,70,0.35)'; ctx.beginPath(); ctx.ellipse(-6, 1, 9, 1.4, 0, 0, PI * 2); ctx.fill();
        const leg = Math.sin(t * 40) * run * 2;
        ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 0.9;
        [[3, leg], [-3, -leg]].forEach(([lx, o]) => { ctx.beginPath(); ctx.moveTo(lx, -1.5); ctx.lineTo(lx + 1.5 + o, 0.6); ctx.moveTo(lx, -1.5); ctx.lineTo(lx - 1.5 - o, 0.6); ctx.stroke(); });
        ctx.fillStyle = '#b08a5a';
        ctx.beginPath(); ctx.moveTo(-5, -1.5); ctx.quadraticCurveTo(-12, -0.5, -16, 0.4); ctx.quadraticCurveTo(-11, -2.2, -5, -3.2); ctx.closePath(); ctx.fill();   // tail
        ctx.beginPath(); ctx.ellipse(0, -2.2 - bob * 1.2, 5.2, 1.9, -bob * 0.15, 0, PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(5.6, -3.0 - bob * 2.2, 2.2, 1.4, -bob * 0.3, 0, PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,220,170,0.7)'; ctx.fillRect(-3, -4.0 - bob * 1.2, 6, 0.6);
        ctx.fillStyle = '#1a0e08'; ctx.fillRect(6.2, -3.8 - bob * 2.2, 0.8, 0.8);
        ctx.restore();
      }
    }
  }

  // A camel resting in the sand: legs folded, saddle blanket on, chewing, flicking an ear and its tail now and then
  function drawRestingCamel(ctx, W, H, t) {
    const m = t % SHOW, cx = W * 0.852, gy = H * 0.700, s = H * 0.112;
    let ear = 0; EAR_TWITCH.forEach(a => { const w = win(m, [a, a + 0.35]); if (w >= 0) ear = Math.sin(w * PI); });
    const tailF = Math.max(0, Math.sin(t * 0.9)) ** 12, nod = Math.sin(t * 0.55) * 0.05, chew = Math.sin(t * 5.4);
    // Long shadow to the west
    const sg = ctx.createLinearGradient(cx, gy, cx - s * 1.8, gy + s * 0.4); sg.addColorStop(0, 'rgba(80,30,70,0.42)'); sg.addColorStop(1, 'rgba(80,30,70,0)');
    ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(cx + s * 0.55, gy); ctx.lineTo(cx - s * 0.6, gy - 2); ctx.lineTo(cx - s * 2.0, gy + s * 0.32); ctx.lineTo(cx - s * 0.8, gy + s * 0.42); ctx.closePath(); ctx.fill();
    const fur = ctx.createLinearGradient(cx - s * 0.6, 0, cx + s * 0.6, 0);
    fur.addColorStop(0, '#7a4a3a'); fur.addColorStop(0.5, '#b8805a'); fur.addColorStop(0.85, '#f0c08a'); fur.addColorStop(1, '#d09a68');
    // Tail
    ctx.strokeStyle = '#8a5a40'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx + s * 0.52, gy - s * 0.30); ctx.quadraticCurveTo(cx + s * (0.62 + 0.10 * tailF), gy - s * (0.22 + 0.12 * tailF), cx + s * (0.58 + 0.14 * tailF), gy - s * (0.08 + 0.10 * tailF)); ctx.stroke();
    // Folded legs, knees poking out
    ctx.fillStyle = '#9a6a4a';
    [[-0.36, 0.10], [0.30, 0.10], [-0.10, 0.08]].forEach(([dx, r]) => { ctx.beginPath(); ctx.ellipse(cx + s * dx, gy - s * 0.05, s * r * 1.4, s * r * 0.6, 0, 0, PI * 2); ctx.fill(); });
    // Body and hump
    ctx.fillStyle = fur;
    ctx.beginPath(); ctx.ellipse(cx, gy - s * 0.24, s * 0.56, s * 0.24, 0, 0, PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + s * 0.04, gy - s * 0.44, s * 0.27, s * 0.22, 0, PI, PI * 2); ctx.fill();
    // Saddle blanket: crimson with a turquoise stripe and gold fringe, draped over the hump
    ctx.save(); ctx.beginPath(); ctx.ellipse(cx + s * 0.04, gy - s * 0.44, s * 0.27, s * 0.22, 0, PI, PI * 2); ctx.rect(cx - s * 0.23, gy - s * 0.44, s * 0.54, s * 0.22); ctx.clip();
    ctx.fillStyle = '#a8202c'; ctx.fillRect(cx - s * 0.25, gy - s * 0.70, s * 0.58, s * 0.50);
    ctx.fillStyle = '#1ab0a6'; ctx.fillRect(cx - s * 0.25, gy - s * 0.34, s * 0.58, s * 0.05);
    ctx.fillStyle = '#e8b040'; ctx.fillRect(cx - s * 0.25, gy - s * 0.40, s * 0.58, s * 0.02);
    const shd = ctx.createLinearGradient(cx - s * 0.25, 0, cx + s * 0.33, 0); shd.addColorStop(0, 'rgba(30,10,30,0.40)'); shd.addColorStop(1, 'rgba(255,220,180,0.15)');
    ctx.fillStyle = shd; ctx.fillRect(cx - s * 0.25, gy - s * 0.70, s * 0.58, s * 0.50);
    ctx.restore();
    ctx.fillStyle = '#e8b040'; for (let k = 0; k < 9; k++) ctx.fillRect(cx - s * 0.22 + k * s * 0.065, gy - s * 0.22, 0.8, 2.2);
    ctx.strokeStyle = 'rgba(255,230,190,0.6)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(cx, gy - s * 0.24, s * 0.56, s * 0.24, 0, -PI * 0.45, PI * 0.15); ctx.stroke();
    // Thick neck dipping forward from the chest then rising to the head, which nods slowly; jaw chews
    ctx.save(); ctx.translate(cx - s * 0.36, gy - s * 0.30); ctx.rotate(nod);
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.moveTo(s * 0.06, -s * 0.14);                                              // withers
    ctx.bezierCurveTo(-s * 0.14, -s * 0.10, -s * 0.22, -s * 0.22, -s * 0.24, -s * 0.40);   // top line of the neck
    ctx.quadraticCurveTo(-s * 0.25, -s * 0.50, -s * 0.30, -s * 0.54);
    ctx.lineTo(-s * 0.46, -s * 0.50);                                             // under the jaw
    ctx.bezierCurveTo(-s * 0.42, -s * 0.30, -s * 0.40, -s * 0.06, -s * 0.22, s * 0.06);   // throat curving back to the chest
    ctx.lineTo(s * 0.10, s * 0.10); ctx.closePath(); ctx.fill();
    // Head: long, with a drooping lip
    ctx.beginPath(); ctx.ellipse(-s * 0.44, -s * 0.58, s * 0.18, s * 0.085, 0.12, 0, PI * 2); ctx.fill();
    ctx.fillStyle = '#9a6a4a'; ctx.beginPath(); ctx.ellipse(-s * 0.57, -s * 0.52 + chew * s * 0.008, s * 0.07, s * 0.035, 0.1, 0, PI * 2); ctx.fill();   // jaw
    ctx.fillStyle = '#7a4a3a'; ctx.fillRect(-s * 0.62, -s * 0.585, 1.2, 0.9);                                                                          // nostril
    ctx.fillStyle = '#b8805a'; ctx.beginPath(); ctx.moveTo(-s * 0.30, -s * 0.64); ctx.lineTo(-s * (0.26 - 0.05 * ear), -s * (0.75 + 0.03 * ear)); ctx.lineTo(-s * 0.23, -s * 0.62); ctx.closePath(); ctx.fill();   // ear
    ctx.fillStyle = '#2a1408'; ctx.beginPath(); ctx.arc(-s * 0.40, -s * 0.62, s * 0.018, 0, PI * 2); ctx.fill();
    ctx.strokeStyle = '#5a3424'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.arc(-s * 0.40, -s * 0.625, s * 0.026, PI * 1.1, PI * 1.9); ctx.stroke();   // heavy lid
    ctx.strokeStyle = 'rgba(255,230,190,0.6)'; ctx.lineWidth = 0.8;              // sun on the back of the neck and head
    ctx.beginPath(); ctx.moveTo(s * 0.04, -s * 0.15); ctx.bezierCurveTo(-s * 0.14, -s * 0.11, -s * 0.22, -s * 0.22, -s * 0.24, -s * 0.40); ctx.quadraticCurveTo(-s * 0.25, -s * 0.52, -s * 0.36, -s * 0.66); ctx.stroke();
    ctx.restore();
  }

  // The bails: one is knocked off by the gust, tumbles onto the sand, and is back on top by the time the loop restarts
  function drawBails(ctx, W, H, t) {
    const m = t % SHOW, sx = W * 0.700, base = H * 0.700, top = base - H * 0.160, gap = W * 0.021, r = W * 0.0058, bh = H * 0.009;
    const bail = (cx, cy, len, rot, alpha) => {
      if (alpha <= 0) return;
      ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.rotate(rot);
      const bg = ctx.createLinearGradient(0, -bh / 2, 0, bh / 2); bg.addColorStop(0, '#fff6e2'); bg.addColorStop(1, '#b08048');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(-len / 2, -bh / 2, len, bh, bh * 0.45); ctx.fill();
      ctx.restore();
    };
    const R0 = [sx + r * 0.2, sx + gap + r * 0.6], L0 = [sx - gap - r * 0.6, sx - r * 0.2];
    const len = L0[1] - L0[0], y0 = top - bh * 0.3;
    bail((R0[0] + R0[1]) / 2, y0, len, 0, 1);
    const home = [(L0[0] + L0[1]) / 2, y0], land = [sx - gap * 3.8, base + H * 0.014];
    const back = m > SHOW - 0.8 ? (m - (SHOW - 0.8)) / 0.8 : 0;
    if (m < KNOCK) { const wob = m > KNOCK - 0.6 ? Math.sin((m - KNOCK + 0.6) * 30) * 0.08 : 0; bail(home[0], home[1], len, wob, 1); }
    else if (m < KNOCK + 0.9) {
      const f = (m - KNOCK) / 0.9;
      bail(home[0] + (land[0] - home[0]) * f, home[1] + (land[1] - home[1]) * f * f - H * 0.05 * Math.sin(f * PI), len, f * PI * 3, 1);
    } else {
      ctx.fillStyle = `rgba(80,30,70,${(0.35 * (1 - back)).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(land[0] - 3, land[1] + 2, len * 0.6, 1.2, 0, 0, PI * 2); ctx.fill();
      bail(land[0], land[1], len, PI * 3, 1 - back);
      bail(home[0], home[1], len, 0, back);
    }
  }

  // Sand whipped round the foot of the trophy while the gust blows (back half drawn behind the cup, front half in front)
  function baseSwirl(ctx, W, H, t, front) {
    const g = gustLevel(t); if (g < 0.02) return;
    let seed = 88; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < 70; i++) {
      const a0 = rnd() * PI * 2, sp = 2.2 + rnd() * 1.6, rx = W * (0.10 + rnd() * 0.05), ry = H * (0.012 + rnd() * 0.012), y0 = H * 0.705 - rnd() * H * 0.07;
      const ang = a0 + t * sp, isFront = Math.sin(ang) > 0; if (isFront !== front) continue;
      const x = W * 0.5 + Math.cos(ang) * rx, y = y0 + Math.sin(ang) * ry;
      ctx.fillStyle = `rgba(255,222,176,${(g * (front ? 0.65 : 0.35)).toFixed(3)})`; ctx.fillRect(x, y, 2.6, 0.9);
    }
  }

  // The sandstorm gust: a warm veil and streaks of sand racing west across the whole scene
  function drawGust(ctx, W, H, t) {
    const g = gustLevel(t);
    if (g < 0.01) return;
    ctx.fillStyle = `rgba(240,170,120,${(0.12 * g).toFixed(3)})`; ctx.fillRect(0, H * 0.30, W, H * 0.70);
    let seed = 61; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < 70; i++) {
      const y = H * (0.42 + rnd() * 0.36), sp = 0.9 + rnd() * 0.8, ph = rnd(), len = W * (0.03 + rnd() * 0.06);
      const x = W * 1.1 - ((t * sp * 0.6 + ph) % 1) * W * 1.3;
      const a = g * (0.18 + rnd() * 0.25);
      const sg = ctx.createLinearGradient(x, 0, x + len, 0);
      sg.addColorStop(0, `rgba(255,226,180,${a.toFixed(3)})`); sg.addColorStop(1, 'rgba(255,226,180,0)');
      ctx.fillStyle = sg; ctx.fillRect(x, y + Math.sin(t * 3 + i) * 1.5, len, 0.9);
    }
  }

  // ════════ PAINT — sky → sky life → back → back life → oasis → mid → front → front life → cup → gust → haze ════════
  // (canvas passed in)
  const ctx = cvs.getContext('2d');
  const SCRATCH = document.createElement('canvas').getContext('2d');
  const skyL = document.createElement('canvas'); skyL.width = 620; skyL.height = 355;
  const back = document.createElement('canvas'); back.width = 620; back.height = 355;
  const midL = document.createElement('canvas'); midL.width = 620; midL.height = 355;
  const front = document.createElement('canvas'); front.width = 620; front.height = 355;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TURN_SECONDS = 11.9;
  function paintBase() {
    const k = skyL.getContext('2d'); k.clearRect(0, 0, 620, 355); draw(k, 620, 355, 'sky');
    const b = back.getContext('2d'); b.clearRect(0, 0, 620, 355); draw(b, 620, 355, 'back');
    const mm = midL.getContext('2d'); mm.clearRect(0, 0, 620, 355); draw(mm, 620, 355, 'mid');
    const f = front.getContext('2d'); f.clearRect(0, 0, 620, 355); draw(f, 620, 355, 'front');
  }
  function frame(ms) {
    const t = reduceMotion ? 0 : ms / 1000;
    const phi = (t / TURN_SECONDS) * Math.PI * 2;
    ctx.clearRect(0, 0, 620, 355);
    ctx.drawImage(skyL, 0, 0);
    drawSkyLife(ctx, 620, 355, t);
    ctx.drawImage(back, 0, 0);
    heatShimmer(ctx, 620, 355, t);
    drawBackLife(ctx, 620, 355, t);
    drawOasis(ctx, 620, 355, t);
    ctx.drawImage(midL, 0, 0);
    spindrift(ctx, 620, 355, t, [DUNES.NL, DUNES.NR]);
    drawJeep(ctx, 620, 355, t);
    ctx.drawImage(front, 0, 0);
    drawRestingCamel(ctx, 620, 355, t);
    drawBails(ctx, 620, 355, t);
    drawFrontLife(ctx, 620, 355, t);
    baseSwirl(ctx, 620, 355, t, false);
    drawTrophy(ctx, 620, 355, phi, t);
    baseSwirl(ctx, 620, 355, t, true);
    drawGust(ctx, 620, 355, t);
    drawAtmos(ctx, 620, 355);
  }
  function loop(ms) { if (!__running) return; __elapsed = ms - __t0; __frame(__elapsed); requestAnimationFrame(loop); }
  paintBase(); __frame(0);
  let repainted = false;
  const repaint = () => { if (!repainted) { repainted = true; paintBase(); __frame(__elapsed); } };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(repaint).catch(() => {});
  setTimeout(repaint, 2000);
  return {
    start() { if (__running) return; if (reduceMotion) { __frame(0); return; } __running = true; __t0 = performance.now() - __elapsed; requestAnimationFrame(loop); },
    stop() { __running = false; },
  };
}
function makeLeagueArt_asian(cvs) {
  let __running = false, __t0 = 0, __elapsed = 0;
  // Soft fade at the foot of the art so it melts into the card's info panel
  function __fade() {
    const g = ctx.createLinearGradient(0, 355 * 0.78, 0, 355);
    g.addColorStop(0, 'rgba(8,8,18,0)'); g.addColorStop(1, 'rgba(8,8,18,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 355 * 0.78, 620, 355 * 0.22);
  }
  function __frame(ms) { frame(ms); __fade(); }
  const PI = Math.PI;
  const SHOW = 24;                                   // length of the shared schedule, seconds
  // Scheduled moments (seconds into the SHOW loop) — spread out so they never all stop together
  const SPRAYS = [1.8, 7.0, 11.6, 20.6];             // waves burst on the bastion rocks
  const EGRETS = [1.0, 8.4];                         // two egrets fly west over the sea
  const TUKTUK = [5.2, 11.0];                        // a tuk-tuk putters along the fort street
  const SCRATCH_T = [[9.6, 11.0], [19.4, 20.4]];     // the macaque scratches its head
  const SHOWER = [13.6, 18.6];                       // a sun-shower sweeps through
  const RAINBOW = [16.4, 23.6];                      // ...and leaves a rainbow over the sea
  function win(m, [a, b]) { return m >= a && m <= b ? (m - a) / (b - a) : -1; }
  const env = (w, k = 0.15) => w < 0 ? 0 : Math.min(1, w / k, (1 - w) / k);

  const VYF = 0.420;                                 // horizon
  const LH = { x: 0.228, base: 0.490 };              // the lighthouse on its round bastion at the end of the rampart
  const SUNP = { x: 0.88, y: 0.075 };
  const PALMS = [[0.668, 0.590, 0.290, 0.06], [0.982, 0.592, 0.290, -0.18]];

  // ════════ STILL SCENE — Galle Fort ramparts on a monsoon morning ════════
  // 'sky' → sky, sun, the rain-cloud bank; 'back' → the ocean; 'mid' → bastion, lighthouse, the old town;
  // 'front' → the rampart lawn, parapet and props. Same code for every part so the random details match.
  function draw(ctxReal, W, H, part) {
    let ctx = part === 'sky' ? ctxReal : SCRATCH;
    let seed = 71;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const VY = H * VYF;
    const limb = (x1, y1, x2, y2, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
    const glow = (x, y, r, col) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    };

    // ── Sky: rinsed tropical blue, humid haze low down, the storm still dark in the west ──
    const sky = ctx.createLinearGradient(0, 0, 0, VY);
    sky.addColorStop(0, '#2a78c0'); sky.addColorStop(0.45, '#5aa6dc'); sky.addColorStop(0.85, '#a8d4ea'); sky.addColorStop(1, '#d6ecf0');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, VY + 4);
    // Sun high on the right, breaking through
    glow(W * SUNP.x, H * SUNP.y, W * 0.32, 'rgba(255,250,225,0.45)');
    glow(W * SUNP.x, H * SUNP.y, H * 0.10, 'rgba(255,255,240,0.9)');
    ctx.fillStyle = '#fffff4'; ctx.beginPath(); ctx.arc(W * SUNP.x, H * SUNP.y, H * 0.030, 0, PI * 2); ctx.fill();

    ctx = part === 'back' ? ctxReal : SCRATCH;

    // ── The Indian Ocean: deep blue at the horizon to turquoise under the walls ──
    {
      const g = ctx.createLinearGradient(0, VY, 0, H * 0.64);
      g.addColorStop(0, '#2a5c98'); g.addColorStop(0.35, '#2a84a8'); g.addColorStop(1, '#36b0ac');
      ctx.fillStyle = g; ctx.fillRect(0, VY, W, H * 0.64 - VY);
      ctx.fillStyle = 'rgba(230,245,250,0.6)'; ctx.fillRect(0, VY - 0.5, W, 1);
      // Darker water under the storm, sun-glitter on the right
          for (let i = 0; i < 220; i++) {
        const tt = rnd(), y = VY + 1 + tt * (H * 0.64 - VY - 2), x = rnd() * W;
        ctx.fillStyle = `rgba(255,255,255,${((0.15 + rnd() * 0.35) * (0.4 + x / W * 0.6)).toFixed(3)})`;
        ctx.fillRect(x, y, 2 + rnd() * 5 * (0.4 + tt), 0.9);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 0.6;
      for (let y = VY + 3; y < H * 0.64; y += 3 + (y - VY) * 0.07) { ctx.beginPath(); for (let x = 0; x <= W; x += 8) ctx.lineTo(x, y + Math.sin(x * 0.07 + y) * 0.8); ctx.stroke(); }
    }

    if (part === 'back' || part === 'sky') return;
    ctx = part === 'mid' ? ctxReal : SCRATCH;

    const stone = (x0, x1) => {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, '#8a8068'); g.addColorStop(0.6, '#c8b892'); g.addColorStop(1, '#e8dab4');
      return g;
    };
    const blob = (x, y, r, c0, c1) => { const g = ctx.createRadialGradient(x + r * 0.35, y - r * 0.4, 0, x, y, r); g.addColorStop(0, c0); g.addColorStop(1, c1); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); };
    const p = ([fx, fy]) => [W * fx, H * fy];
    const poly = (pts) => { ctx.beginPath(); pts.forEach((q, i) => { const [x, y] = p(q); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); };
    // ── Misty tea hills on the far horizon, inland beyond the fort ──
    {
      const VY = H * VYF;
      [[0.355, 0.030, '#b4c8d4', 11, 0.3], [0.385, 0.026, '#9cbcb8', 15, 1.9]].forEach(([b, amp, col, fq, ph]) => {
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, VY + 1);
        for (let x = 0; x <= W * 0.36; x += 4) ctx.lineTo(x, Math.min(VY, H * (b - amp * Math.sin(x / W * fq + ph)) + Math.pow(x / (W * 0.36), 2.4) * H * 0.07));
        ctx.lineTo(W * 0.36, VY + 1); ctx.closePath(); ctx.fill();
      });
      ctx.strokeStyle = 'rgba(90,140,90,0.35)'; ctx.lineWidth = 0.6;          // a hint of terraced rows on the nearer one
      for (let k = 0; k < 5; k++) { ctx.beginPath(); for (let x = 0; x <= W * 0.22; x += 4) { const y = H * (0.392 + k * 0.006) + Math.sin(x * 0.05 + k) * 1.2; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    }
    // ── Inside the fort, beyond the wall: tree canopy and terracotta roofs ──
    {
      for (let i = 0; i < 18; i++) blob(W * (rnd() * 0.20), H * (0.475 + rnd() * 0.05), W * (0.014 + rnd() * 0.016), '#6aa04a', '#1e4a26');
      [[0.010, 0.060, 0.505], [0.070, 0.120, 0.512], [0.125, 0.170, 0.500]].forEach(([a, b, top]) => {
        const x0 = W * a, x1 = W * b, y0 = H * top;
        ctx.fillStyle = '#f0e6cc'; ctx.fillRect(x0, y0, x1 - x0, H * 0.04);
        ctx.fillStyle = '#b85a30'; ctx.beginPath(); ctx.moveTo(x0 - 2, y0 + 1); ctx.lineTo(x0 + (x1 - x0) * 0.2, y0 - H * 0.018); ctx.lineTo(x1 - (x1 - x0) * 0.2, y0 - H * 0.018); ctx.lineTo(x1 + 2, y0 + 1); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2a6a4a'; for (let x = x0 + 3; x < x1 - 3; x += 7) ctx.fillRect(x, y0 + H * 0.010, 3, H * 0.014);
      });
    }
    // ── The cove below the wall: sand, beached outrigger canoes, stilt-fishing poles standing in the shallows ──
    {
      ctx.fillStyle = '#ecd6a6'; poly([[0.27, 0.578], [0.62, 0.574], [0.62, 0.620], [0.27, 0.620]]); ctx.fill();
      ctx.fillStyle = 'rgba(160,120,70,0.25)'; poly([[0.27, 0.578], [0.62, 0.574], [0.62, 0.584], [0.27, 0.588]]); ctx.fill();   // wet sand
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; for (let x = W * 0.27; x < W * 0.62; x += 3) ctx.fillRect(x, H * 0.576 - (x / W - 0.27) * H * 0.011 + Math.sin(x * 0.2) * 0.8, 2.4, 1);
      // Stilt-fishing poles: a pole with a little cross-perch, each with a wavering reflection
      [[0.360, 0.560, 0.058, 0.10], [0.392, 0.566, 0.046, -0.08], [0.430, 0.562, 0.052, 0.14], [0.466, 0.568, 0.040, -0.12], [0.520, 0.563, 0.050, 0.08]].forEach(([fx, fy, fh, lean]) => {
        const x = W * fx, y = H * fy, h = H * fh, tx = x + lean * h;
        ctx.strokeStyle = 'rgba(40,50,60,0.30)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y + 1); ctx.lineTo(x - lean * h * 0.4, y + h * 0.35); ctx.stroke();
        limb(x, y, tx, y - h, 1.3, '#5a4632');
        const py = y - h * 0.34, px = x + lean * h * 0.34;
        limb(px - W * 0.002, py, px + W * 0.009, py + 0.6, 1.1, '#5a4632');            // the low perch
        limb(px + W * 0.008, py, px + W * 0.002, py + h * 0.20, 0.7, '#5a4632');        // its brace
        ctx.fillStyle = 'rgba(255,240,210,0.6)'; ctx.fillRect(tx + 0.3, y - h, 0.6, h * 0.95);
      });
      // Two outrigger canoes pulled up on the sand
      [[0.330, 0.600, '#2a6ab8', 1], [0.395, 0.606, '#c83a2a', -1]].forEach(([fx, fy, col, d]) => {
        const x = W * fx, y = H * fy, L = W * 0.050, h = H * 0.014;
        ctx.fillStyle = 'rgba(80,60,40,0.30)'; ctx.beginPath(); ctx.ellipse(x - 3, y + 2, L * 0.55, 1.6, 0, 0, PI * 2); ctx.fill();
        ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 0.8; [-0.2, 0.2].forEach(o => { ctx.beginPath(); ctx.moveTo(x + o * L, y - h * 0.8); ctx.lineTo(x + o * L + d * 2, y - h * 2.0); ctx.stroke(); });
        ctx.fillStyle = '#d8c8a8'; ctx.beginPath(); ctx.ellipse(x + d * 2, y - h * 2.0, L * 0.30, 1.4, 0, 0, PI * 2); ctx.fill();   // the float
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - L / 2, y - h); ctx.quadraticCurveTo(x - L * 0.52, y, x - L * 0.3, y); ctx.lineTo(x + L * 0.3, y); ctx.quadraticCurveTo(x + L * 0.52, y, x + L / 2, y - h); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f4f0e6'; ctx.fillRect(x - L * 0.46, y - h, L * 0.92, h * 0.28);
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x - L * 0.3, y - h * 0.55, L * 0.6, 0.8);
      });
    }
    // ── The rampart: a grassy walkway on thick coral-stone walls running from our feet out to the lighthouse bastion ──
    {
      // Battered sea face, lit by the sun, mould-streaked, rocks at its foot
      poly([[0.300, 0.616], [0.262, 0.489], [0.272, 0.542], [0.316, 0.584], [0.335, 0.616]]);
      ctx.fillStyle = stone(W * 0.26, W * 0.34); ctx.fill();
      ctx.save(); poly([[0.300, 0.616], [0.262, 0.489], [0.272, 0.542], [0.316, 0.584], [0.335, 0.616]]); ctx.clip();
      for (let i = 0; i < 30; i++) { const x = W * (0.262 + rnd() * 0.07); ctx.fillStyle = `rgba(60,64,48,${(0.10 + rnd() * 0.22).toFixed(3)})`; ctx.fillRect(x, H * 0.49, 1 + rnd() * 1.5, H * (0.03 + rnd() * 0.08)); }
      ctx.strokeStyle = 'rgba(90,80,60,0.30)'; ctx.lineWidth = 0.5; for (let y = H * 0.495; y < H * 0.616; y += 3) { ctx.beginPath(); ctx.moveTo(W * 0.25, y); ctx.lineTo(W * 0.34, y); ctx.stroke(); }
      ctx.restore();
      for (let i = 0; i < 9; i++) { const f = rnd(), x = W * (0.272 + f * 0.044), y = H * (0.542 + f * 0.042), r = W * (0.004 + rnd() * 0.006); ctx.fillStyle = '#3a3a3e'; ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.55, 0, PI, 0); ctx.fill(); }
      // The walkway: grass on top, a stone coping along the sea edge, narrowing into the distance
      const wg = ctx.createLinearGradient(0, H * 0.486, 0, H * 0.616); wg.addColorStop(0, '#78a858'); wg.addColorStop(1, '#6ab842');
      ctx.fillStyle = wg; poly([[-0.03, 0.616], [0.300, 0.616], [0.262, 0.489], [0.188, 0.487]]); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,230,0.18)'; poly([[0.20, 0.616], [0.300, 0.616], [0.262, 0.489], [0.240, 0.489]]); ctx.fill();
      const pg = ctx.createLinearGradient(0, H * 0.49, 0, H * 0.616); pg.addColorStop(0, '#c8b48a'); pg.addColorStop(1, '#e2ccA0');
      ctx.fillStyle = pg; poly([[0.105, 0.616], [0.215, 0.616], [0.236, 0.490], [0.214, 0.490]]); ctx.fill();          // the worn footpath
      ctx.strokeStyle = 'rgba(120,90,50,0.25)'; ctx.lineWidth = 0.5; for (let k = 1; k < 8; k++) { const f = k / 8, y = H * (0.490 + f * f * 0.126); ctx.beginPath(); ctx.moveTo(W * (0.214 - f * 0.109), y); ctx.lineTo(W * (0.236 - f * 0.021), y); ctx.stroke(); }
      ctx.fillStyle = '#d8caa8'; poly([[-0.03, 0.610], [0.188, 0.484], [0.190, 0.490], [-0.03, 0.622]]); ctx.fill();     // low kerb on the inner edge
      ctx.fillStyle = 'rgba(255,255,245,0.7)'; poly([[-0.03, 0.610], [0.188, 0.484], [0.189, 0.486], [-0.03, 0.613]]); ctx.fill();
      ctx.fillStyle = '#e4d6b4'; poly([[0.292, 0.616], [0.304, 0.616], [0.264, 0.488], [0.259, 0.488]]); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,245,0.8)'; poly([[0.300, 0.616], [0.304, 0.616], [0.264, 0.488], [0.262, 0.488]]); ctx.fill();
      // An old cannon on the walkway, aimed out to sea
      { const x = W * 0.215, y = H * 0.548, l = W * 0.028;
        ctx.fillStyle = 'rgba(30,50,20,0.35)'; ctx.beginPath(); ctx.ellipse(x - 2, y + 2, l * 0.5, 1.6, 0, 0, PI * 2); ctx.fill();
        ctx.strokeStyle = '#2a2a2e'; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - l * 0.4, y - 2); ctx.lineTo(x + l * 0.5, y - 4.5); ctx.stroke();
        ctx.strokeStyle = 'rgba(200,210,220,0.5)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(x - l * 0.35, y - 3.2); ctx.lineTo(x + l * 0.48, y - 5.6); ctx.stroke();
        ctx.fillStyle = '#5a3a20'; ctx.beginPath(); ctx.arc(x - l * 0.15, y, 2.2, 0, PI * 2); ctx.arc(x + l * 0.15, y - 0.5, 2.2, 0, PI * 2); ctx.fill(); }
      // Round bastion at the far end, carrying the lighthouse
      ctx.fillStyle = stone(W * 0.18, W * 0.28); ctx.beginPath(); ctx.ellipse(W * LH.x, H * 0.492, W * 0.046, H * 0.012, 0, 0, PI); ctx.lineTo(W * LH.x - W * 0.044, H * 0.520); ctx.ellipse(W * LH.x, H * 0.520, W * 0.044, H * 0.012, 0, PI, 0, true); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#78a858'; ctx.beginPath(); ctx.ellipse(W * LH.x, H * 0.490, W * 0.046, H * 0.011, 0, 0, PI * 2); ctx.fill();
    }

    // ── The lighthouse: tall, white, tapering; gallery, lantern room and dome ──
    {
      const x = W * LH.x, base = H * LH.base, top = H * 0.232, wb = W * 0.020, wt = W * 0.014, k = 0.82;
      const body = ctx.createLinearGradient(x - wb, 0, x + wb, 0);
      body.addColorStop(0, '#a8b0bc'); body.addColorStop(0.45, '#eef0f2'); body.addColorStop(0.78, '#ffffff'); body.addColorStop(1, '#d4d8de');
      ctx.fillStyle = body; ctx.beginPath(); ctx.moveTo(x - wb, base); ctx.lineTo(x - wt, top); ctx.lineTo(x + wt, top); ctx.lineTo(x + wb, base); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(80,90,110,0.30)'; [0.30, 0.55, 0.78].forEach(f => ctx.fillRect(x - 1, base - (base - top) * f, 2, 3.2));
      ctx.fillStyle = '#d8d0b8'; ctx.fillRect(x - wb * 1.3, base - H * 0.015, wb * 2.6, H * 0.015);
      ctx.fillStyle = '#f4f4f4'; ctx.fillRect(x - wt * 1.5, top - H * 0.005, wt * 3, H * 0.007);
      ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x - wt * 1.45, top - H * 0.017); ctx.lineTo(x + wt * 1.45, top - H * 0.017); ctx.stroke();
      for (let j = -4; j <= 4; j++) limb(x + j * wt * 0.36, top - H * 0.017, x + j * wt * 0.36, top - H * 0.005, 0.5, '#3a3a40');
      const lb = top - H * 0.007, lt = lb - H * 0.040 * k, lw = wt * 0.85;
      const gl = ctx.createLinearGradient(x - lw, 0, x + lw, 0); gl.addColorStop(0, '#5a7a94'); gl.addColorStop(0.7, '#c8e4f2'); gl.addColorStop(1, '#8aaac0');
      ctx.fillStyle = gl; ctx.fillRect(x - lw, lt, lw * 2, lb - lt);
      ctx.fillStyle = '#2a2a30'; [-1, -0.33, 0.33, 1].forEach(f => ctx.fillRect(x + f * lw - 0.5, lt, 1, lb - lt)); ctx.fillRect(x - lw, lt, lw * 2, 1);
      ctx.fillStyle = '#2a2e36'; ctx.beginPath(); ctx.ellipse(x, lt, lw * 1.1, H * 0.018, 0, PI, 0); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(x + lw * 0.4, lt - H * 0.008, lw * 0.25, H * 0.005, -0.4, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#2a2e36'; ctx.beginPath(); ctx.arc(x, lt - H * 0.020, 1.7, 0, PI * 2); ctx.fill();
      limb(x, lt - H * 0.022, x, lt - H * 0.034, 0.7, '#2a2e36');
      ctx.fillStyle = 'rgba(70,80,100,0.22)'; ctx.beginPath(); ctx.moveTo(x - wb, base); ctx.lineTo(x - wt, top); ctx.lineTo(x - wt * 0.3, top); ctx.lineTo(x - wb * 0.35, base); ctx.closePath(); ctx.fill();
    }

    // ── The old town on the right: colonial houses with clay-tile roofs and verandas, a big tree, the clock tower ──
    {
      const B = H * 0.585;
      // Dark canopy of shade trees behind the rooftops
      [[0.58, 0.425, 0.050], [0.70, 0.415, 0.045], [0.885, 0.420, 0.055], [0.995, 0.430, 0.040]].forEach(([fx, fy, fr]) => {
        for (let k = 0; k < 7; k++) { const x = W * fx + (rnd() - 0.5) * W * fr * 1.6, y = H * fy + (rnd() - 0.3) * H * fr, r = W * fr * (0.35 + rnd() * 0.3);
          const g = ctx.createRadialGradient(x + r * 0.3, y - r * 0.4, 0, x, y, r); g.addColorStop(0, '#5a9a44'); g.addColorStop(1, '#1e4a26');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); }
      });
      const houses = [[0.540, 0.648, 0.470, '#f2e6c4'], [0.648, 0.752, 0.452, '#f4f0e4'], [0.752, 0.785, 0.480, '#e8d0a0'], [0.818, 0.905, 0.458, '#dce8e0'], [0.905, 1.020, 0.470, '#f0dcb8']];
      houses.forEach(([a, b, top, col]) => {
        const x0 = W * a, x1 = W * b, y0 = H * top, w = x1 - x0;
        const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, col); g.addColorStop(1, '#ffffff');
        ctx.fillStyle = g; ctx.fillRect(x0, y0, w, B - y0);
        ctx.fillStyle = 'rgba(90,80,60,0.18)'; ctx.fillRect(x0, y0, w * 0.12, B - y0);
        // Hip roof of terracotta tiles, the eaves throwing a shadow
        const rh = H * 0.034;
        const rg = ctx.createLinearGradient(0, y0 - rh, 0, y0); rg.addColorStop(0, '#c86a3a'); rg.addColorStop(1, '#8a3a1e');
        ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(x0 - 3, y0 + 1); ctx.lineTo(x0 + w * 0.18, y0 - rh); ctx.lineTo(x1 - w * 0.18, y0 - rh); ctx.lineTo(x1 + 3, y0 + 1); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(80,30,10,0.45)'; ctx.lineWidth = 0.5; for (let x = x0; x < x1; x += 2.2) { ctx.beginPath(); ctx.moveTo(x, y0 + 1); ctx.lineTo(x + (x - (x0 + x1) / 2) * -0.15, y0 - rh * 0.9); ctx.stroke(); }
        ctx.fillStyle = 'rgba(255,220,180,0.55)'; ctx.fillRect(x1 - w * 0.18, y0 - rh, w * 0.18, 1);
        ctx.fillStyle = 'rgba(60,40,30,0.30)'; ctx.fillRect(x0, y0 + 1, w, 2);
        // Upper windows with green shutters
        for (let k = 0; k < Math.floor(w / 13); k++) { const wx = x0 + 5 + k * 13; ctx.fillStyle = '#2a6a4a'; ctx.fillRect(wx, y0 + H * 0.012, 6, H * 0.022); ctx.fillStyle = '#1a2a2a'; ctx.fillRect(wx + 2, y0 + H * 0.014, 2, H * 0.018); }
        // Ground-floor veranda: columns and arches in shade
        const vy = y0 + H * 0.048;
        ctx.fillStyle = 'rgba(70,60,50,0.40)'; ctx.fillRect(x0, vy, w, B - vy);
        ctx.fillStyle = col; for (let x = x0 + 2; x < x1 - 2; x += 9) { ctx.fillRect(x, vy, 2.4, B - vy); }
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(x0, vy - 1.5, w, 1.5);
      });
      // Clock tower: white shaft, clock faces, an arcaded belfry and a cupola
      const cx = W * 0.802, cw = W * 0.034;
      const tg = ctx.createLinearGradient(cx - cw / 2, 0, cx + cw / 2, 0); tg.addColorStop(0, '#b8bcc4'); tg.addColorStop(0.6, '#f6f6f2'); tg.addColorStop(1, '#ffffff');
      ctx.fillStyle = tg; ctx.fillRect(cx - cw / 2, H * 0.250, cw, B - H * 0.250);
      ctx.fillStyle = 'rgba(90,90,100,0.20)'; for (let y = H * 0.30; y < B; y += H * 0.05) ctx.fillRect(cx - cw / 2, y, cw, 1);
      ctx.fillStyle = tg; ctx.fillRect(cx - cw * 0.62, H * 0.212, cw * 1.24, H * 0.040);
      ctx.fillStyle = '#fbfbf6'; ctx.beginPath(); ctx.arc(cx, H * 0.232, cw * 0.34, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(cx, H * 0.232, cw * 0.34, 0, PI * 2); ctx.stroke();
      limb(cx, H * 0.232, cx - cw * 0.12, H * 0.232 - cw * 0.14, 0.9, '#1a1a20'); limb(cx, H * 0.232, cx + cw * 0.04, H * 0.232 - cw * 0.26, 0.7, '#1a1a20');
      ctx.fillStyle = tg; ctx.fillRect(cx - cw * 0.48, H * 0.168, cw * 0.96, H * 0.044);
      ctx.fillStyle = '#3a4048'; [-0.25, 0.25].forEach(f => { ctx.beginPath(); ctx.moveTo(cx + f * cw - 2.4, H * 0.208); ctx.lineTo(cx + f * cw - 2.4, H * 0.182); ctx.arc(cx + f * cw, H * 0.182, 2.4, PI, 0); ctx.lineTo(cx + f * cw + 2.4, H * 0.208); ctx.fill(); });
      ctx.fillStyle = '#f2f2ee'; ctx.fillRect(cx - cw * 0.58, H * 0.166, cw * 1.16, 2.5);
      const dg = ctx.createLinearGradient(cx - cw * 0.45, 0, cx + cw * 0.45, 0); dg.addColorStop(0, '#9aa0aa'); dg.addColorStop(0.7, '#f4f4f0'); dg.addColorStop(1, '#d0d4da');
      ctx.fillStyle = dg; ctx.beginPath(); ctx.moveTo(cx - cw * 0.45, H * 0.166); ctx.quadraticCurveTo(cx - cw * 0.45, H * 0.128, cx, H * 0.122); ctx.quadraticCurveTo(cx + cw * 0.45, H * 0.128, cx + cw * 0.45, H * 0.166); ctx.closePath(); ctx.fill();
      limb(cx, H * 0.122, cx, H * 0.100, 0.9, '#5a5a60');
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(cx + cw / 2 - 1, H * 0.25, 1, B - H * 0.25);
    }

    if (part === 'mid') return;
    ctx = ctxReal;

    // ════════ FRONT LAYER — the rampart lawn after rain, the parapet on the right, a puddle, coconuts, the kite spool ════════
    const LAWN = H * 0.612;
    {
      const g = ctx.createLinearGradient(0, LAWN, 0, H);
      g.addColorStop(0, '#6ab842'); g.addColorStop(0.4, '#3e8e30'); g.addColorStop(1, '#245a22');
      ctx.fillStyle = g; ctx.fillRect(0, LAWN, W, H - LAWN);
      // Stone lip where the lawn drops to the sea on the left
      ctx.fillStyle = '#b8a888'; ctx.fillRect(W * 0.300, LAWN - 2, W * 0.23, 3.2);
      ctx.fillStyle = 'rgba(255,250,230,0.6)'; ctx.fillRect(W * 0.300, LAWN - 2, W * 0.23, 0.8);
      // Mowing stripes and wet grass catching the sun
      for (let k = 0; k < 9; k++) {
        const x = -W * 0.2 + k * W * 0.16;
        ctx.fillStyle = k % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(0,40,0,0.06)';
        ctx.beginPath(); ctx.moveTo(x + W * 0.10, LAWN); ctx.lineTo(x + W * 0.18, LAWN); ctx.lineTo(x + W * 0.04, H); ctx.lineTo(x - W * 0.12, H); ctx.closePath(); ctx.fill();
      }
      for (let i = 0; i < 260; i++) { const x = rnd() * W, y = LAWN + 2 + rnd() * (H - LAWN), a = rnd() * 0.5; ctx.fillStyle = `rgba(220,255,200,${a.toFixed(3)})`; ctx.fillRect(x, y, 0.8, 1.6 + (y - LAWN) * 0.02); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const sheen = ctx.createRadialGradient(W * 0.85, LAWN, 0, W * 0.85, LAWN, W * 0.6);
      sheen.addColorStop(0, 'rgba(255,255,220,0.22)'); sheen.addColorStop(1, 'rgba(255,255,220,0)');
      ctx.fillStyle = sheen; ctx.fillRect(0, LAWN, W, H - LAWN); ctx.restore();
    }
    // Parapet along the fort street: coral stone, rounded coping, mould streaks
    {
      const x0 = W * 0.52, top = H * 0.572;
      ctx.fillStyle = stone(x0, W);
      ctx.beginPath(); ctx.moveTo(x0, LAWN + 1); ctx.lineTo(x0 + W * 0.012, top); ctx.lineTo(W + 2, top); ctx.lineTo(W + 2, LAWN + 1); ctx.closePath(); ctx.fill();
      for (let i = 0; i < 40; i++) { const x = x0 + rnd() * (W - x0); ctx.fillStyle = `rgba(56,62,46,${(0.10 + rnd() * 0.2).toFixed(3)})`; ctx.fillRect(x, top + 3, 1 + rnd() * 2, (LAWN - top) * (0.4 + rnd() * 0.6)); }
      ctx.fillStyle = '#e8dcbc'; ctx.beginPath(); ctx.roundRect(x0 + W * 0.010, top - 3, W, 5, 2.5); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,245,0.8)'; ctx.fillRect(x0 + W * 0.012, top - 3, W, 0.9);
      ctx.fillStyle = 'rgba(30,50,20,0.30)'; ctx.fillRect(x0, LAWN - 1, W - x0, 3);
    }
    const shadow = (x, y, w, len) => {          // sun high on the right: shadows short, down and to the left
      const g = ctx.createLinearGradient(x, y, x - len, y + len * 0.35);
      g.addColorStop(0, 'rgba(10,40,10,0.45)'); g.addColorStop(1, 'rgba(10,40,10,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x - w / 2, y - 1); ctx.lineTo(x - len - w * 0.3, y + len * 0.30); ctx.lineTo(x - len + w * 0.5, y + len * 0.40); ctx.closePath(); ctx.fill();
    };
    // A rain puddle reflecting the sky (ripples drawn each frame)
    {
      const px = W * 0.110, py = H * 0.668, rx = W * 0.065, ry = H * 0.016;
      ctx.fillStyle = 'rgba(40,70,30,0.6)'; ctx.beginPath(); ctx.ellipse(px, py + 1, rx * 1.06, ry * 1.3, 0, 0, PI * 2); ctx.fill();
      const g = ctx.createLinearGradient(0, py - ry, 0, py + ry); g.addColorStop(0, '#d8eef6'); g.addColorStop(0.5, '#7ab8e0'); g.addColorStop(1, '#3a7ab8');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(px, py, rx, ry, 0, 0, PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillRect(px + rx * 0.2, py - ry * 0.4, rx * 0.4, 0.9);
    }
    // King coconuts, one opened with a straw
    {
      const bx = W * 0.205, by = H * 0.688, r = H * 0.024;
      shadow(bx, by, r * 4, r * 3);
      [[-1.1, 0.1, 0.95], [1.0, 0.15, 0.9], [0, -0.35, 1]].forEach(([dx, dy, sc], i) => {
        const x = bx + dx * r, y = by - r * sc + dy * r, rr = r * sc;
        const g = ctx.createRadialGradient(x + rr * 0.4, y - rr * 0.4, rr * 0.1, x, y, rr * 1.1);
        g.addColorStop(0, '#ffd27a'); g.addColorStop(0.55, '#f0961e'); g.addColorStop(1, '#a8500e');
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rr, rr * 1.12, 0, 0, PI * 2); ctx.fill();
        if (i === 2) {
          ctx.fillStyle = '#f6eed6'; ctx.beginPath(); ctx.ellipse(x, y - rr * 0.95, rr * 0.38, rr * 0.14, 0, 0, PI * 2); ctx.fill();
          limb(x + 1, y - rr * 0.98, x + rr * 0.7, y - rr * 2.4, 1.6, '#e8303a');
          limb(x + rr * 0.7, y - rr * 2.4, x + rr * 0.95, y - rr * 2.5, 1.6, '#e8303a');
        }
      });
    }
    // Wooden kite spool (its string climbs to the kite, drawn each frame)
    {
      const x = W * 0.300, y = H * 0.690, r = H * 0.022;
      shadow(x, y, r * 3, r * 2.2);
      ctx.fillStyle = '#7a4a24'; ctx.beginPath(); ctx.ellipse(x, y - r, r * 1.1, r, 0, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#f4f0e6'; ctx.beginPath(); ctx.ellipse(x, y - r, r * 0.75, r * 0.70, 0, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(160,150,130,0.6)'; ctx.lineWidth = 0.5; for (let k = 1; k < 5; k++) { ctx.beginPath(); ctx.ellipse(x, y - r, r * 0.75 * k / 5, r * 0.70 * k / 5, 0, 0, PI * 2); ctx.stroke(); }
      ctx.fillStyle = '#c88a4a'; ctx.beginPath(); ctx.arc(x, y - r, r * 0.18, 0, PI * 2); ctx.fill();
      limb(x + r * 1.0, y - r * 1.4, x + r * 1.6, y - r * 2.0, 1.4, '#7a4a24');
    }
    // ════════ HERO KIT — stumps on the rampart lawn, a ball beside them ════════
    {
      const sx = W * 0.700, base = H * 0.700, sh = H * 0.160, top = base - sh, gap = W * 0.021, r = W * 0.0058;
      [-gap, 0, gap].forEach(dx => shadow(sx + dx, base, r * 2, sh * 0.5));
      [-gap, 0, gap].forEach(dx => {
        const x = sx + dx;
        const g = ctx.createLinearGradient(x - r, 0, x + r, 0);
        g.addColorStop(0, '#9a6a3a'); g.addColorStop(0.4, '#d8a878'); g.addColorStop(0.75, '#fff0d0'); g.addColorStop(1, '#e8b880');
        ctx.fillStyle = g; ctx.fillRect(x - r, top, r * 2, sh);
        ctx.fillStyle = '#20a840'; ctx.fillRect(x - r, top + sh * 0.16, r * 2, sh * 0.06);
        ctx.fillStyle = '#f2c440'; ctx.fillRect(x - r, top + sh * 0.22, r * 2, sh * 0.03);
        ctx.fillStyle = '#fff2d8'; ctx.beginPath(); ctx.ellipse(x, top, r, r * 0.55, 0, 0, PI * 2); ctx.fill();
      });
      const bh = H * 0.009;
      [[sx - gap - r * 0.6, sx - r * 0.2], [sx + r * 0.2, sx + gap + r * 0.6]].forEach(([b0, b1]) => {
        const bg = ctx.createLinearGradient(0, top - bh, 0, top + 1); bg.addColorStop(0, '#fff6e2'); bg.addColorStop(1, '#b08048');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(b0, top - bh * 0.8, b1 - b0, bh, bh * 0.45); ctx.fill();
      });
      // Grass tufts round the base
      for (let k = 0; k < 14; k++) { const x = sx - gap * 1.6 + k * gap * 0.23; limb(x, base + 1, x + (rnd() - 0.5) * 2, base - 2 - rnd() * 3, 0.8, k % 2 ? '#6ab842' : '#3e8e30'); }
      const bx = W * 0.770, by = base - H * 0.010, brr = H * 0.018;
      shadow(bx, by + brr, brr * 1.6, brr * 2);
      const rg = ctx.createRadialGradient(bx + brr * 0.35, by - brr * 0.45, brr * 0.1, bx, by, brr);
      rg.addColorStop(0, '#ff9a80'); rg.addColorStop(0.5, '#c81e1e'); rg.addColorStop(1, '#4a0610');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(bx, by, brr, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,240,220,0.85)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.ellipse(bx, by, brr * 0.30, brr * 0.98, -0.35, 0, PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(bx + brr * 0.4, by - brr * 0.45, 1.2, 0, PI * 2); ctx.fill();   // a raindrop on the ball
    }
  }

  // Humid haze and a soft vignette over everything
  function drawAtmos(ctx, W, H) {
    const haze = ctx.createLinearGradient(0, H * 0.34, 0, H * 0.60);
    haze.addColorStop(0, 'rgba(230,245,250,0)'); haze.addColorStop(0.5, 'rgba(230,245,250,0.12)'); haze.addColorStop(1, 'rgba(230,245,250,0)');
    ctx.fillStyle = haze; ctx.fillRect(0, H * 0.34, W, H * 0.26);
    const vig = ctx.createRadialGradient(W * 0.5, H * 0.44, W * 0.22, W * 0.5, H * 0.44, W * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(0.7, 'rgba(10,30,40,0.04)'); vig.addColorStop(1, 'rgba(10,30,40,0.24)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  }

  // ════════ THE HERITAGE CUP — a silver lotus chalice with fine teacup handles and a gold lotus-bud finial ════════
  // Teak plinth with brass bands → silver petalled foot → slender stem with a gold knop → a bowl wrapped in
  // gilt-edged lotus petals that turn with the cup → two slender teacup handles with thumb-rest scrolls → domed lid, lotus bud.
  function drawTrophy(ctx, W, H, phi, t) {
    const FONT = (wt, px) => `${wt} ${px}px 'Barlow Condensed', 'Arial Narrow', sans-serif`;
    const glow = (x, y, r, col) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    };
    const tx = W * 0.5, tb = H * 0.705, S = H * 0.390, K = 1.50, TILT = 0.10;
    const GREEN = '#20a840', RUBY = '#c0202e', GOLDC = '#f2c440';

    // Short shadow on the lawn, down and to the left (sun high on the right)
    {
      const g = ctx.createLinearGradient(tx, tb, tx - W * 0.16, tb + H * 0.06);
      g.addColorStop(0, 'rgba(10,40,10,0.50)'); g.addColorStop(1, 'rgba(10,40,10,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(tx + W * 0.07, tb + 1); ctx.lineTo(tx - W * 0.08, tb - 1);
      ctx.lineTo(tx - W * 0.20, tb + H * 0.055); ctx.lineTo(tx - W * 0.06, tb + H * 0.070); ctx.closePath(); ctx.fill();
    }
    ctx.save(); ctx.translate(tx, tb); ctx.scale(K, K); ctx.translate(-tx, -tb);
    const silver = (x0, x1) => {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, '#3e444c'); g.addColorStop(0.18, '#7a828c'); g.addColorStop(0.42, '#c4ccd6');
      g.addColorStop(0.64, '#f4f8fc'); g.addColorStop(0.74, '#ffffff'); g.addColorStop(0.88, '#a8b0ba'); g.addColorStop(1, '#5a626c');
      return g;
    };
    const gold = (x0, x1) => {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, '#5a3a08'); g.addColorStop(0.3, '#b8862c'); g.addColorStop(0.62, '#fff0c0'); g.addColorStop(0.8, '#f0c860'); g.addColorStop(1, '#7a5010');
      return g;
    };
    const P = (r, y, a) => [tx + r * Math.sin(a), y + r * Math.cos(a) * TILT];
    const mix = (c0, c1, f) => `rgb(${c0.map((v, i) => Math.round(v + (c1[i] - v) * f)).join(',')})`;
    glow(tx, tb - S * 0.70, W * 0.18, 'rgba(255,255,250,0.10)');

    // ── Teak plinth: brass bands, curved brass plate ──
    const pB = tb, pH = S * 0.150, pW = W * 0.056;
    const wd = ctx.createLinearGradient(tx - pW, 0, tx + pW, 0);
    wd.addColorStop(0, '#2a1006'); wd.addColorStop(0.45, '#5a2a10'); wd.addColorStop(0.80, '#a8602e'); wd.addColorStop(1, '#6a3414');
    function drum(cy, h, r) {
      ctx.fillStyle = wd;
      ctx.beginPath(); ctx.moveTo(tx - r, cy - h); ctx.lineTo(tx - r, cy); ctx.ellipse(tx, cy, r, r * TILT, 0, PI, 0, true); ctx.lineTo(tx + r, cy - h); ctx.closePath(); ctx.fill();
      const top = ctx.createLinearGradient(tx - r, 0, tx + r, 0); top.addColorStop(0, '#4a1c0a'); top.addColorStop(1, '#c07038');
      ctx.fillStyle = top; ctx.beginPath(); ctx.ellipse(tx, cy - h, r, r * TILT, 0, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,210,160,0.45)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(tx, cy - h, r, r * TILT, 0, -PI * 0.1, PI * 0.5); ctx.stroke();
    }
    drum(pB, pH, pW);
    [[0.88, GOLDC, 0.06], [0.80, GREEN, 0.06], [0.07, GOLDC, 0.05]].forEach(([f, col, w]) => {
      ctx.strokeStyle = col; ctx.lineWidth = pH * w; ctx.beginPath(); ctx.ellipse(tx, pB - pH * f, pW, pW * TILT, 0, 0, PI); ctx.stroke();
    });
    const plate = ctx.createLinearGradient(0, pB - pH * 0.68, 0, pB - pH * 0.14);
    plate.addColorStop(0, '#f6dc90'); plate.addColorStop(1, '#a8803a');
    ctx.fillStyle = plate; ctx.beginPath(); const eR = pW * TILT;
    ctx.moveTo(tx - pW * 0.80, pB - pH * 0.68); ctx.quadraticCurveTo(tx, pB - pH * 0.68 + eR * 1.1, tx + pW * 0.80, pB - pH * 0.68);
    ctx.lineTo(tx + pW * 0.80, pB - pH * 0.14); ctx.quadraticCurveTo(tx, pB - pH * 0.14 + eR * 1.1, tx - pW * 0.80, pB - pH * 0.14); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(120,80,20,0.6)'; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.save(); ctx.fillStyle = '#3a2408'; ctx.font = FONT(900, pH * 0.25); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('THE HERITAGE CUP', tx, pB - pH * 0.49 + eR * 0.55, pW * 1.5);
    ctx.font = FONT(700, pH * 0.15); ctx.fillText('LANKA CRICKET LEAGUE', tx, pB - pH * 0.27 + eR * 0.55, pW * 1.5); ctx.restore();
    drum(pB - pH, S * 0.045, pW * 0.72);

    // ── Silver foot with a ring of small petals turning, a slender stem and a gold lotus-bud knop ──
    const fY = pB - pH - S * 0.045, fW = W * 0.036;
    ctx.fillStyle = silver(tx - fW, tx + fW);
    ctx.beginPath(); ctx.ellipse(tx, fY, fW, fW * TILT, 0, 0, PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx - fW, fY); ctx.quadraticCurveTo(tx - fW * 0.85, fY - S * 0.05, tx - fW * 0.20, fY - S * 0.058);
    ctx.lineTo(tx + fW * 0.20, fY - S * 0.058); ctx.quadraticCurveTo(tx + fW * 0.85, fY - S * 0.05, tx + fW, fY); ctx.closePath(); ctx.fill();
    for (let k = 0; k < 12; k++) {
      const a = phi + k * PI / 6, c = Math.cos(a); if (c < 0.08) continue;
      const [x, y] = P(fW * 0.78, fY - S * 0.012, a), w = fW * 0.16 * c;
      ctx.fillStyle = `rgba(${c > 0.5 ? '255,255,255' : '200,206,214'},0.55)`;
      ctx.beginPath(); ctx.moveTo(x - w, y + 1); ctx.quadraticCurveTo(x - w, y - S * 0.024, x, y - S * 0.032); ctx.quadraticCurveTo(x + w, y - S * 0.024, x + w, y + 1); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(180,140,40,0.7)'; ctx.lineWidth = 0.5; ctx.stroke();
    }
    const sB = fY - S * 0.058, sT = sB - S * 0.150, sw = W * 0.0065;
    ctx.fillStyle = silver(tx - sw * 2, tx + sw * 2);
    ctx.beginPath(); ctx.moveTo(tx - sw * 1.3, sB); ctx.quadraticCurveTo(tx - sw * 0.8, (sB + sT) / 2, tx - sw * 1.4, sT); ctx.lineTo(tx + sw * 1.4, sT); ctx.quadraticCurveTo(tx + sw * 0.8, (sB + sT) / 2, tx + sw * 1.3, sB); ctx.closePath(); ctx.fill();
    { const ky = (sB + sT) / 2 + S * 0.01, kr = sw * 2.6;
      ctx.fillStyle = gold(tx - kr, tx + kr); ctx.beginPath(); ctx.ellipse(tx, ky, kr, S * 0.024, 0, 0, PI * 2); ctx.fill();
      for (let k = 0; k < 8; k++) { const a = phi + k * PI / 4, c = Math.cos(a); if (c < 0.1) continue; ctx.strokeStyle = `rgba(110,70,10,${(0.25 + 0.4 * c).toFixed(3)})`; ctx.lineWidth = 0.5; const x = tx + kr * 0.9 * Math.sin(a); ctx.beginPath(); ctx.moveTo(x, ky - S * 0.020); ctx.quadraticCurveTo(x + (x - tx) * 0.1, ky, x, ky + S * 0.020); ctx.stroke(); } }

    // ── Bowl geometry ──
    const bot = sT, rimY = sT - S * 0.250, cw = W * 0.050, botR = sw * 1.4;
    const prof = (u) => {                      // u: 0 = rim → 1 = bottom
      const a = (1 - u) ** 3, b = 3 * u * (1 - u) ** 2, c = 3 * u * u * (1 - u), d = u ** 3;
      return [a * cw + b * cw * 1.12 + c * cw * 0.70 + d * botR, a * rimY + b * (rimY + S * 0.12) + c * (bot - S * 0.01) + d * bot];
    };
    const bowlPath = () => { ctx.beginPath(); for (let i = 0; i <= 40; i++) { const [r, y] = prof(i / 40); ctx.lineTo(tx - r, y); } for (let i = 40; i >= 0; i--) { const [r, y] = prof(i / 40); ctx.lineTo(tx + r, y); } ctx.closePath(); };

    // Lotus petals: each is a patch on the bowl's surface, so it narrows and slides as the cup turns.
    // Two rows: an inner row whose tips rise above the rim, and an outer row of broad petals offset between them.
    const NP = 8, DARKS = [70, 78, 92], LIGHTS = [252, 253, 255];
    function petal(a, row, front) {
      const c = Math.cos(a), lum = Math.min(1, 0.28 + 0.42 * Math.max(0, Math.sin(a) * 0.8 + 0.2) + 0.30 * Math.max(0, c));
      const tipU = row ? 0.0 : 0.30, hw = PI / NP * (row ? 0.95 : 1.15), N = 14, pts = [];
      const at = (u, v) => {                   // u 0 = tip … 1 = base; v −1 … 1 across
        const uu = tipU + u * (0.96 - tipU), [r, y] = prof(uu);
        const lift = row ? (1 - u) ** 3 * S * 0.040 : 0, out = (1 - u) ** 2 * cw * (row ? 0.05 : 0.06);
        const wide = Math.pow(Math.sin(PI * Math.min(1, 0.04 + u * 0.80)), 0.7) * (1 - 0.35 * u * u);
        return P(r * (row ? 1.0 : 1.04) + out, y - lift, a + v * hw * wide);
      };
      for (let i = 0; i <= N; i++) pts.push(at(i / N, -1));
      for (let i = N; i >= 0; i--) pts.push(at(i / N, 1));
      const L = front ? lum : lum * 0.55;
      const g = ctx.createLinearGradient(0, at(0, 0)[1], 0, at(1, 0)[1]);
      g.addColorStop(0, mix(DARKS, LIGHTS, Math.min(1, L + 0.15))); g.addColorStop(1, mix(DARKS, LIGHTS, L * 0.75));
      ctx.fillStyle = g; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = front ? 'rgba(214,166,48,0.95)' : 'rgba(160,120,40,0.75)'; ctx.lineWidth = 0.8; ctx.stroke();       // gilt edge
      if (front && c > 0.15) {                 // centre vein and a soft sheen along it
        ctx.strokeStyle = `rgba(110,122,145,${(0.40 * c).toFixed(3)})`; ctx.lineWidth = 0.5;
        ctx.beginPath(); for (let i = 1; i < N - 1; i++) { const p = at(i / N, 0); i > 1 ? ctx.lineTo(...p) : ctx.moveTo(...p); } ctx.stroke();
      }
    }
    const inner = [], outer = [];
    for (let k = 0; k < NP; k++) { inner.push(phi + k * PI * 2 / NP); outer.push(phi + (k + 0.5) * PI * 2 / NP); }
    const byDepth = (arr) => arr.slice().sort((p, q) => Math.cos(p) - Math.cos(q));

    // ── Fine teacup handles: a slender silver loop edged in gold, with a little thumb-rest scroll on top ──
    const radiusAt = (y) => { let best = cw, bd = 1e9; for (let i = 0; i <= 60; i++) { const [r, yy] = prof(i / 60); const d = Math.abs(yy - y); if (d < bd) { bd = d; best = r; } } return best; };
    const handles = [phi + PI / 2, phi - PI / 2];
    function handle(a) {
      const c = Math.cos(a), yA = rimY + S * 0.040, yB = rimY + S * 0.175;
      const A = [radiusAt(yA) * 0.99, yA], B = [radiusAt(yB) * 0.99, yB];
      const C1 = [cw * 1.62, rimY - S * 0.030], C2 = [cw * 1.56, rimY + S * 0.205];
      const bz = (u) => { const m = 1 - u; return [m * m * m * A[0] + 3 * m * m * u * C1[0] + 3 * m * u * u * C2[0] + u * u * u * B[0], m * m * m * A[1] + 3 * m * m * u * C1[1] + 3 * m * u * u * C2[1] + u * u * u * B[1]]; };
      const pts = []; for (let i = 0; i <= 30; i++) { const [r, y] = bz(i / 30); pts.push(P(r, y, a)); }
      const scroll = []; for (let i = 0; i <= 14; i++) { const u = i / 14, ang = PI * 0.85 + u * PI * 1.5, rr = S * 0.024 * (1 - u * 0.6); scroll.push(P(cw * 1.22 + Math.cos(ang) * rr, rimY - S * 0.016 + Math.sin(ang) * rr, a)); }
      const path = (arr) => { ctx.beginPath(); arr.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); };
      const dim = c < 0;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = dim ? '#8a6a24' : '#c8962c'; ctx.lineWidth = 3.0; path(pts); ctx.stroke(); ctx.lineWidth = 2.2; path(scroll); ctx.stroke();
      ctx.strokeStyle = dim ? '#8a929c' : '#eef2f6'; ctx.lineWidth = 1.8; path(pts); ctx.stroke(); ctx.lineWidth = 1.2; path(scroll); ctx.stroke();
      if (!dim) { ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 0.6; path(pts.slice(3, 17)); ctx.stroke(); }
      [pts[0], pts[pts.length - 1]].forEach(p => { ctx.fillStyle = dim ? '#8a6a24' : '#e8b850'; ctx.beginPath(); ctx.arc(p[0], p[1], 1.5, 0, PI * 2); ctx.fill(); });
    }

    handles.filter(a => Math.cos(a) < 0).forEach(handle);
    byDepth(inner.filter(a => Math.cos(a) < 0)).forEach(a => petal(a, 1, false));     // back tips peeping over the rim
    ctx.fillStyle = silver(tx - cw * 1.1, tx + cw * 1.1); bowlPath(); ctx.fill();
    byDepth(inner.filter(a => Math.cos(a) >= 0)).forEach(a => petal(a, 1, true));
    byDepth(outer.filter(a => Math.cos(a) >= -0.05)).forEach(a => petal(a, 0, true));
    // Sky and lawn reflected in the silver
    ctx.save(); bowlPath(); ctx.clip();
    ctx.globalCompositeOperation = 'multiply';
    const refl = ctx.createLinearGradient(0, rimY, 0, bot); refl.addColorStop(0, 'rgba(170,210,240,1)'); refl.addColorStop(0.6, 'rgba(255,255,255,1)'); refl.addColorStop(1, 'rgba(150,200,130,1)');
    ctx.fillStyle = refl; ctx.fillRect(tx - cw * 1.3, rimY - S * 0.08, cw * 2.6, bot - rimY + S * 0.1);
    ctx.restore();

    // ── Rim and domed lid with a beaded edge; gold lotus-bud finial ──
    ctx.fillStyle = gold(tx - cw * 1.04, tx + cw * 1.04); ctx.beginPath(); ctx.ellipse(tx, rimY, cw * 1.04, cw * 1.04 * TILT + 1.2, 0, 0, PI * 2); ctx.fill();
    for (let k = 0; k < 28; k++) { const a = phi + k * PI * 2 / 28, c = Math.cos(a); if (c < 0) continue; const [x, y] = P(cw * 1.04, rimY + 0.5, a); ctx.fillStyle = k % 7 === 0 ? RUBY : '#fff4cc'; ctx.beginPath(); ctx.arc(x, y, k % 7 === 0 ? 1.2 : 0.7, 0, PI * 2); ctx.fill(); }
    const lidH = S * 0.070, lr = cw * 0.86;
    ctx.fillStyle = silver(tx - lr, tx + lr);
    ctx.beginPath(); ctx.moveTo(tx - lr, rimY - 0.5); ctx.bezierCurveTo(tx - lr, rimY - lidH * 0.9, tx - lr * 0.35, rimY - lidH, tx, rimY - lidH); ctx.bezierCurveTo(tx + lr * 0.35, rimY - lidH, tx + lr, rimY - lidH * 0.9, tx + lr, rimY - 0.5); ctx.closePath(); ctx.fill();
    for (let k = 0; k < 12; k++) {               // engraved ribs on the lid, turning
      const a = phi + k * PI / 6 + PI / 12, c = Math.cos(a); if (c < 0.1) continue;
      ctx.strokeStyle = `rgba(80,90,105,${(0.15 + 0.3 * c).toFixed(3)})`; ctx.lineWidth = 0.5; const s = Math.sin(a);
      ctx.beginPath(); ctx.moveTo(tx + lr * 0.96 * s, rimY - lidH * 0.10); ctx.quadraticCurveTo(tx + lr * 0.75 * s, rimY - lidH * 0.85, tx + lr * 0.2 * s, rimY - lidH * 0.98); ctx.stroke();
    }
    ctx.strokeStyle = GREEN; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(tx, rimY - lidH * 0.25, lr * 0.93, lr * 0.93 * TILT, 0, 0, PI); ctx.stroke();
    // Finial: a short stem, a cup of sepals, a closed lotus bud
    const fb = rimY - lidH, bh = S * 0.110, br = cw * 0.24;
    ctx.fillStyle = gold(tx - br, tx + br); ctx.fillRect(tx - 1.6, fb - S * 0.02, 3.2, S * 0.022);
    const by = fb - S * 0.02;
    ctx.beginPath(); ctx.moveTo(tx - br * 0.95, by - bh * 0.30); ctx.quadraticCurveTo(tx - br * 0.6, by, tx, by); ctx.quadraticCurveTo(tx + br * 0.6, by, tx + br * 0.95, by - bh * 0.30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = gold(tx - br, tx + br);
    ctx.beginPath(); ctx.moveTo(tx, by - bh); ctx.bezierCurveTo(tx + br * 1.05, by - bh * 0.62, tx + br * 0.95, by - bh * 0.12, tx, by - bh * 0.08); ctx.bezierCurveTo(tx - br * 0.95, by - bh * 0.12, tx - br * 1.05, by - bh * 0.62, tx, by - bh); ctx.closePath(); ctx.fill();
    // Bud petals: overlapping seams that rotate with the cup
    for (let k = 0; k < 5; k++) {
      const a = phi + k * PI * 2 / 5, c = Math.cos(a); if (c < 0) continue;
      const s = Math.sin(a); ctx.strokeStyle = `rgba(110,70,10,${(0.25 + 0.4 * c).toFixed(3)})`; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(tx + s * br * 0.9, by - bh * 0.15); ctx.quadraticCurveTo(tx + s * br * 0.95, by - bh * 0.6, tx + s * br * 0.1, by - bh * 0.96); ctx.stroke();
    }
    ctx.fillStyle = RUBY; ctx.beginPath(); ctx.arc(tx, by - bh * 1.02, 1.3, 0, PI * 2); ctx.fill();

    handles.filter(a => Math.cos(a) >= 0).forEach(handle);

    // Fixed highlights: a sun streak down the right of the bowl, a calm glint travelling round the rim
    ctx.save(); bowlPath(); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.30)'; ctx.beginPath(); ctx.ellipse(tx + cw * 0.48, rimY + S * 0.12, cw * 0.10, S * 0.09, -0.15, 0, PI * 2); ctx.fill();
    ctx.restore();
    { const f = (t / 8.3) % 1, a = -PI / 2 + f * PI, [x, y] = P(cw * 1.04, rimY + 0.5, a), k = Math.sin(f * PI); glow(x, y, 7, `rgba(255,255,245,${(0.6 * k).toFixed(3)})`); }
    ctx.restore();
  }

  // ════════ SKY LIFE — gliding clouds, the rainbow ════════
  const CLOUDS = (() => {
    const make = (w, h, seed) => {
      let s = seed; const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
      const a = document.createElement('canvas'); a.width = w; a.height = h; const g = a.getContext('2d');
      g.fillStyle = '#ffffff';
      const base = h * 0.78;
      for (let k = 0; k < 14; k++) { const u = k / 13, x = w * (0.12 + 0.76 * u + (r() - 0.5) * 0.05), rad = h * (0.18 + 0.30 * Math.sin(u * Math.PI) * (0.75 + r() * 0.4)); g.beginPath(); g.arc(x, Math.min(base - rad * 0.55, base - h * 0.05), rad, 0, Math.PI * 2); g.fill(); }
      g.fillRect(w * 0.10, base - h * 0.16, w * 0.80, h * 0.16);
      g.globalCompositeOperation = 'source-atop';
      const sh = g.createLinearGradient(0, h * 0.15, 0, base);
      sh.addColorStop(0, 'rgba(255,255,252,1)'); sh.addColorStop(0.6, 'rgba(236,242,248,1)'); sh.addColorStop(1, 'rgba(170,186,206,1)');
      g.fillStyle = sh; g.fillRect(0, 0, w, h);
      const lit = g.createRadialGradient(w * 0.8, h * 0.1, 0, w * 0.8, h * 0.1, w * 0.5);
      lit.addColorStop(0, 'rgba(255,252,235,0.6)'); lit.addColorStop(1, 'rgba(255,252,235,0)');
      g.fillStyle = lit; g.fillRect(0, 0, w, h);
      const b = document.createElement('canvas'); b.width = w; b.height = h; const gb = b.getContext('2d');
      gb.filter = 'blur(2px)'; gb.globalAlpha = 0.95; gb.drawImage(a, 0, 0);
      return b;
    };
    return [make(130, 52, 5), make(96, 40, 23), make(160, 60, 41)];
  })();
  function drawSkyLife(ctx, W, H, t) {
    const m = t % SHOW;
    // Rainbow over the sea once the shower has passed (opposite the sun), clipped to the sky
    {
      const a = env(win(m, RAINBOW), 0.2);
      if (a > 0) {
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H * VYF); ctx.clip();
        const cx = W * 0.20, cy = H * 0.66, R0 = W * 0.36;
        ['255,60,60', '255,150,40', '255,230,60', '80,200,80', '60,140,240', '90,70,200', '150,80,200'].forEach((col, i) => {
          ctx.strokeStyle = `rgba(${col},${(0.30 * a).toFixed(3)})`; ctx.lineWidth = 3.4;
          ctx.beginPath(); ctx.arc(cx, cy, R0 - i * 3.2, PI * 1.02, PI * 1.98); ctx.stroke();
        });
        ctx.strokeStyle = `rgba(255,255,255,${(0.10 * a).toFixed(3)})`; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, R0 - 30, PI * 1.05, PI * 1.95); ctx.stroke();
        ctx.restore();
      }
    }
    // Fair-weather clouds drifting slowly west, all at one speed and evenly spread
    [[2, 0.200, 0.10, 0.95], [0, 0.290, 0.43, 0.85], [1, 0.155, 0.76, 0.80]].forEach(([i, fy, off, sc]) => {
      const spr = CLOUDS[i], w = spr.width * sc, h = spr.height * sc, span = W + 360;
      const x = W + 180 - ((t * 6 + off * span) % span), y = H * fy;
      ctx.drawImage(spr, x - w, y, w, h);
    });
  }

  // ════════ SEA LIFE — the outrigger canoe (behind the bastion), surf and spray, egrets ════════
  function drawSeaLife(ctx, W, H, t) {
    // Oruwa: an outrigger canoe with a big rust-coloured sail, sailing slowly west
    {
      const f = ((t + 20) / 63.1) % 1, x = W * (0.60 - f * 0.70), y = H * 0.448, s = H * 0.040;
      const a = Math.min(1, f / 0.05, (1 - f) / 0.05);
      ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y + Math.sin(t * 1.4) * 0.6);
      ctx.fillStyle = '#3a2a1e'; ctx.fillRect(-s * 0.5, -s * 0.05, s, s * 0.07);
      ctx.strokeStyle = '#3a2a1e'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-s * 0.15, -s * 0.03); ctx.lineTo(-s * 0.10, s * 0.10); ctx.moveTo(s * 0.15, -s * 0.03); ctx.lineTo(s * 0.20, s * 0.10); ctx.stroke();
      ctx.fillStyle = '#4a3a2e'; ctx.fillRect(-s * 0.35, s * 0.09, s * 0.70, s * 0.03);
      ctx.strokeStyle = '#4a3a2e'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0, -s * 0.05); ctx.lineTo(0, -s * 0.85); ctx.stroke();
      const sg = ctx.createLinearGradient(-s * 0.4, 0, s * 0.4, 0); sg.addColorStop(0, '#8a3a1a'); sg.addColorStop(1, '#e88a4a');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(-s * 0.40, -s * 0.80); ctx.quadraticCurveTo(-s * 0.48, -s * 0.45, -s * 0.36, -s * 0.10); ctx.lineTo(s * 0.34, -s * 0.12); ctx.quadraticCurveTo(s * 0.44, -s * 0.48, s * 0.30, -s * 0.84); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(60,20,10,0.4)'; ctx.lineWidth = 0.4; [0.3, 0.55].forEach(k => { ctx.beginPath(); ctx.moveTo(-s * 0.44, -s * (0.80 - k * 0.7)); ctx.lineTo(s * 0.40, -s * (0.84 - k * 0.72)); ctx.stroke(); });
      ctx.restore();
    }
  }
  function drawSurf(ctx, W, H, t) {
    const m = t % SHOW, foot = H * 0.586;
    const glow = (x, y, r, col) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); };
    // Foam breathing in and out along the rocks
    for (let x = W * 0.27; x < W * 0.62; x += 3) {
      const a = 0.35 + 0.35 * Math.sin(t * 1.6 - x * 0.05);
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; ctx.fillRect(x, H * 0.573 - (x / W - 0.27) * H * 0.011 + Math.sin(x * 0.13 + t * 2) * 1.2, 2.2, 1);
    }
    for (let k = 0; k < 14; k++) {               // and along the foot of the sea wall
      const f = k / 13, a = 0.35 + 0.35 * Math.sin(t * 1.9 - k * 0.6);
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; ctx.fillRect(W * (0.270 + f * 0.044), H * (0.545 + f * 0.040), 2.4, 1);
    }
    // Spray bursts up the bastion wall
    SPRAYS.forEach((st, j) => {
      const d = m - st; if (d < 0 || d > 1.8) return;
      const cf = [0.15, 0.55, 0.30, 0.80][j], cx = W * (0.272 + cf * 0.044);
      let seed = 13 + j; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      const f = d / 1.8;
      for (let i = 0; i < 70; i++) {
        const fy = H * (0.545 + cf * 0.040), vx = (rnd() - 0.4) * W * 0.04, vy = H * (0.05 + rnd() * 0.06), x = cx + vx * f * 1.4, y = fy - vy * Math.sin(Math.min(1, f * 1.6) * PI * 0.5) + H * 0.08 * f * f;
        const a = (1 - f) * (0.5 + rnd() * 0.5);
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; ctx.fillRect(x, y, 1.4, 1.4);
      }
      glow(cx, H * (0.53 + cf * 0.04), H * 0.05 * (0.6 + f), `rgba(255,255,255,${(0.35 * (1 - f)).toFixed(3)})`);
    });
    // Egrets: two white birds flapping slowly west, low over the water
    {
      const w = win(m, EGRETS);
      if (w >= 0) {
        [[0, 0], [0.04, 0.012]].forEach(([dx, dy], i) => {
          const x = W * (0.58 - w * 0.70 + dx), y = H * (0.40 + dy) + Math.sin(w * 9 + i) * 2, s = H * 0.020, flap = Math.sin(t * 6 + i * 1.3);
          ctx.fillStyle = 'rgba(255,255,255,0.95)';
          ctx.beginPath(); ctx.ellipse(x, y, s * 0.55, s * 0.18, 0, 0, PI * 2); ctx.fill();
          ctx.beginPath(); ctx.moveTo(x - s * 0.5, y - s * 0.05); ctx.quadraticCurveTo(x - s * 0.8, y - s * 0.35, x - s * 0.95, y - s * 0.15); ctx.lineTo(x - s * 0.6, y); ctx.fill();   // neck & head
          ctx.strokeStyle = '#e8b830'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x - s * 0.95, y - s * 0.15); ctx.lineTo(x - s * 1.25, y - s * 0.10); ctx.stroke();
          ctx.fillStyle = 'rgba(245,248,250,0.95)';
          ctx.beginPath(); ctx.moveTo(x - s * 0.2, y); ctx.quadraticCurveTo(x, y - s * 1.1 * flap - s * 0.2, x + s * 0.3, y - s * 1.2 * flap); ctx.lineTo(x + s * 0.25, y); ctx.fill();
          ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(x + s * 0.5, y); ctx.lineTo(x + s * 1.0, y + s * 0.1); ctx.stroke();
        });
      }
    }
    // The lighthouse lantern flashes the sun now and then
    { const f = (t % 7.1) / 7.1; if (f < 0.08) { const a = Math.sin(f / 0.08 * PI); glow(W * LH.x + 2, H * 0.205, 7, `rgba(255,255,240,${(0.9 * a).toFixed(3)})`); } }
  }

  // ════════ TOWN LIFE — palms swaying behind the parapet, a tuk-tuk on the fort street ════════
  function drawTownLife(ctx, W, H, t) {
    const m = t % SHOW;
    PALMS.forEach(([fx, fy, fh, lean], i) => {
      const x0 = W * fx, y0 = H * fy, h = H * fh, sway = Math.sin(t * 0.85 + i * 2.1) * 0.03 + Math.sin(t * 2.1 + i) * 0.008;
      const topX = x0 + (lean + sway) * h, topY = y0 - h;
      for (let k = 0; k < 16; k++) {
        const f = k / 16, f2 = (k + 1) / 16;
        const xa = x0 + (topX - x0) * f * f, ya = y0 + (topY - y0) * f, xb = x0 + (topX - x0) * f2 * f2, yb = y0 + (topY - y0) * f2, w = h * (0.040 - 0.014 * f);
        ctx.strokeStyle = '#6a5a48'; ctx.lineWidth = w; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.moveTo(xa, ya); ctx.lineTo(xb, yb); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,240,210,0.6)'; ctx.lineWidth = w * 0.25; ctx.beginPath(); ctx.moveTo(xa + w * 0.3, ya); ctx.lineTo(xb + w * 0.3, yb); ctx.stroke();
        ctx.fillStyle = 'rgba(40,30,20,0.35)'; ctx.fillRect(xa - w / 2, ya - 0.5, w, 0.8);
      }
      ctx.fillStyle = '#e89a20'; [[-3, 3], [2, 4], [0, 6]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(topX + dx, topY + dy, 2.2, 0, PI * 2); ctx.fill(); });   // king coconuts
      for (let k = 0; k < 11; k++) {
        const a = -PI / 2 + (k / 10 - 0.5) * 3.4 + sway * 2 + Math.sin(t * 1.9 + k + i) * 0.035;
        const len = h * (0.34 + 0.08 * Math.sin(k * 2.3 + i)), droop = h * 0.22 * Math.abs(Math.cos(a));
        const ex = topX + Math.cos(a) * len, ey = topY + Math.sin(a) * len * 0.5 + droop, cx = topX + Math.cos(a) * len * 0.5, cy = topY + Math.sin(a) * len * 0.5 - h * 0.05;
        const lit = Math.cos(a) > 0;
        ctx.strokeStyle = lit ? '#5a9a32' : '#2a5a2a'; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(topX, topY); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.stroke();
        ctx.strokeStyle = lit ? 'rgba(120,190,70,0.95)' : 'rgba(40,90,40,0.95)'; ctx.lineWidth = 0.7;
        for (let j = 2; j < 12; j++) { const u = j / 12, bx = (1 - u) ** 2 * topX + 2 * (1 - u) * u * cx + u * u * ex, by = (1 - u) ** 2 * topY + 2 * (1 - u) * u * cy + u * u * ey, ll = h * 0.07 * Math.sin(u * PI) + 1; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - Math.sin(a) * ll * 0.4, by + ll); ctx.stroke(); }
      }
    });
    // Tuk-tuk: green with a black canopy, puttering west along the street behind the parapet
    {
      const w = win(m, TUKTUK);
      if (w >= 0) {
        const x = W * (1.06 - w * 0.50), y = H * 0.592, s = H * 0.060, a = Math.min(1, (x - W * 0.555) / (W * 0.04));
        if (a > 0) {
          ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y + Math.abs(Math.sin(t * 14)) * -0.5);
          ctx.fillStyle = '#1aa04a'; ctx.beginPath(); ctx.moveTo(-s * 0.50, 0); ctx.lineTo(-s * 0.50, -s * 0.45); ctx.quadraticCurveTo(-s * 0.48, -s * 0.62, -s * 0.30, -s * 0.66); ctx.lineTo(s * 0.50, -s * 0.66); ctx.lineTo(s * 0.55, 0); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#1a1a1e'; ctx.beginPath(); ctx.moveTo(-s * 0.36, -s * 0.66); ctx.quadraticCurveTo(-s * 0.30, -s * 0.92, 0, -s * 0.93); ctx.lineTo(s * 0.56, -s * 0.92); ctx.lineTo(s * 0.56, -s * 0.66); ctx.closePath(); ctx.fill();
          ctx.fillStyle = 'rgba(180,220,240,0.75)'; ctx.beginPath(); ctx.moveTo(-s * 0.46, -s * 0.46); ctx.lineTo(-s * 0.32, -s * 0.84); ctx.lineTo(-s * 0.16, -s * 0.84); ctx.lineTo(-s * 0.18, -s * 0.46); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#2a2a2e'; ctx.fillRect(-s * 0.05, -s * 0.62, s * 0.50, s * 0.30);
          ctx.fillStyle = '#f2c440'; ctx.fillRect(-s * 0.50, -s * 0.30, s * 1.05, s * 0.05);
          ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(-s * 0.36, -s * 0.93, s * 0.9, 0.8);
          ctx.fillStyle = '#fff6d0'; ctx.beginPath(); ctx.arc(-s * 0.50, -s * 0.40, 1.6, 0, PI * 2); ctx.fill();
          ctx.restore();
        }
      }
    }
  }

  // ════════ FRONT LIFE — the macaque on the parapet, kites, puddle ripples, steam off the lawn ════════
  function drawFrontLife(ctx, W, H, t) {
    const m = t % SHOW;
    // Toque macaque sitting on the parapet: looks about, scratches its head, tail swinging down the wall
    {
      const x = W * 0.928, y = H * 0.570, s = H * 0.072;
      let sc = 0; SCRATCH_T.forEach(b => { const w = win(m, b); if (w >= 0) sc = env(w, 0.2); });
      const look = Math.sin(t * 0.45) * 0.8 + Math.sin(t * 1.3) * 0.2;            // −1 west … +1 east
      ctx.strokeStyle = '#7a6a58'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x + s * 0.18, y - s * 0.05); ctx.quadraticCurveTo(x + s * 0.30, y + s * 0.30, x + s * (0.22 + 0.06 * Math.sin(t * 1.1)), y + s * 0.55); ctx.stroke();
      const fur = ctx.createLinearGradient(x - s * 0.3, 0, x + s * 0.3, 0); fur.addColorStop(0, '#6a5a48'); fur.addColorStop(0.7, '#a89070'); fur.addColorStop(1, '#c8b090');
      ctx.fillStyle = fur;
      ctx.beginPath(); ctx.ellipse(x, y - s * 0.30, s * 0.26, s * 0.32, 0, 0, PI * 2); ctx.fill();          // body, hunched
      ctx.beginPath(); ctx.ellipse(x - s * 0.08, y - s * 0.04, s * 0.20, s * 0.08, 0, 0, PI * 2); ctx.fill();  // folded legs
      // Arm: resting on the knee, or raised to scratch
      ctx.strokeStyle = '#8a7660'; ctx.lineWidth = s * 0.09;
      if (sc > 0.05) { const sw = Math.sin(t * 22) * 0.06 * s; ctx.beginPath(); ctx.moveTo(x + s * 0.12, y - s * 0.40); ctx.quadraticCurveTo(x + s * 0.32, y - s * 0.70, x + s * 0.10 + sw, y - s * (0.70 + 0.12 * sc)); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(x - s * 0.12, y - s * 0.40); ctx.quadraticCurveTo(x - s * 0.24, y - s * 0.16, x - s * 0.10, y - s * 0.08); ctx.stroke(); }
      // Head with the toque — the cap of hair parted in the middle — and a pink face that turns
      const hx = x + look * s * 0.03, hy = y - s * 0.70;
      ctx.fillStyle = '#a08a6c'; ctx.beginPath(); ctx.arc(hx, hy, s * 0.16, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#8a7258'; ctx.beginPath(); ctx.ellipse(hx - s * 0.06, hy - s * 0.15, s * 0.10, s * 0.06, -0.5, 0, PI * 2); ctx.ellipse(hx + s * 0.06, hy - s * 0.15, s * 0.10, s * 0.06, 0.5, 0, PI * 2); ctx.fill();
      const fx = hx + look * s * 0.07;
      ctx.fillStyle = '#e8a8a0'; ctx.beginPath(); ctx.ellipse(fx, hy + s * 0.03, s * 0.10 * (1 - Math.abs(look) * 0.25), s * 0.11, 0, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#2a1a14'; [-1, 1].forEach(k => { ctx.beginPath(); ctx.arc(fx + k * s * 0.040 + look * s * 0.02, hy, s * 0.016, 0, PI * 2); ctx.fill(); });
      ctx.fillStyle = 'rgba(120,60,60,0.6)'; ctx.fillRect(fx - s * 0.03 + look * s * 0.02, hy + s * 0.08, s * 0.06, 0.8);
    }
    // Kites: a big one on the spool's string, a smaller one far off — swaying, tails rippling
    const kite = (kx, ky, s, rot, cols, tailPh) => {
      ctx.save(); ctx.translate(kx, ky); ctx.rotate(rot);
      // Tail of ribbons
      ctx.strokeStyle = cols[2]; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, s * 0.9); for (let k = 1; k <= 12; k++) ctx.lineTo(Math.sin(t * 4 + k * 0.7 + tailPh) * s * 0.18 * (k / 12 + 0.3), s * 0.9 + k * s * 0.22); ctx.stroke();
      for (let k = 2; k <= 12; k += 2) { const px = Math.sin(t * 4 + k * 0.7 + tailPh) * s * 0.18 * (k / 12 + 0.3), py = s * 0.9 + k * s * 0.22; ctx.fillStyle = k % 4 ? cols[0] : cols[1]; ctx.beginPath(); ctx.moveTo(px - s * 0.10, py - s * 0.05); ctx.lineTo(px + s * 0.10, py + s * 0.05); ctx.lineTo(px + s * 0.10, py - s * 0.05); ctx.lineTo(px - s * 0.10, py + s * 0.05); ctx.fill(); }
      // Diamond sail in four panels, a spar cross, a lit edge
      const q = [[0, -s], [s * 0.70, 0], [0, s * 0.9], [-s * 0.70, 0]];
      [[0, 1], [1, 2], [2, 3], [3, 0]].forEach(([a, b], i) => { ctx.fillStyle = cols[i % 2]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(...q[a]); ctx.lineTo(...q[b]); ctx.closePath(); ctx.fill(); });
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(...q[0]); ctx.lineTo(...q[1]); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(60,40,20,0.7)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(...q[0]); ctx.lineTo(...q[2]); ctx.moveTo(...q[3]); ctx.lineTo(...q[1]); ctx.stroke();
      ctx.fillStyle = cols[2]; ctx.beginPath(); ctx.arc(0, 0, s * 0.14, 0, PI * 2); ctx.fill();
      ctx.restore();
    };
    {
      const kx = W * 0.290 + Math.sin(t * 0.62) * 9 + Math.sin(t * 1.7) * 2, ky = H * 0.150 + Math.sin(t * 0.91) * 5, rot = Math.sin(t * 0.8) * 0.22;
      const sx = W * 0.300 + H * 0.022 * 1.6, sy = H * 0.690 - H * 0.022 * 2.0;      // spool handle
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(kx + W * 0.06, (ky + sy) * 0.55, kx, ky + H * 0.01); ctx.stroke();
      kite(kx, ky, H * 0.040, rot, ['#e8303a', '#f2c440', '#20a840'], 0);
      const k2x = W * 0.915 + Math.sin(t * 0.55 + 2) * 6, k2y = H * 0.215 + Math.sin(t * 0.77 + 1) * 4;
      ctx.strokeStyle = 'rgba(255,255,255,0.40)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(k2x, k2y + H * 0.008); ctx.quadraticCurveTo(k2x + W * 0.05, H * 0.36, W * 1.02, H * 0.50); ctx.stroke();
      kite(k2x, k2y, H * 0.024, Math.sin(t * 0.9 + 1) * 0.25, ['#1a6ad0', '#ffffff', '#e8303a'], 2);
    }
    // Puddle: drips ring out now and then, many while the shower passes
    {
      const px = W * 0.110, py = H * 0.668, rx = W * 0.060, ry = H * 0.014, sh = env(win(m, SHOWER), 0.1);
      let seed = 5; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      for (let i = 0; i < 14; i++) {
        const ox = (rnd() - 0.5) * 1.6 * rx, oy = (rnd() - 0.5) * 1.4 * ry, ph = rnd(), rate = 0.35 + rnd() * 0.4, heavy = i < 3 ? 1 : sh;
        if (heavy <= 0) continue;
        const f = (t * rate * (i < 3 ? 1 : 3) + ph) % 1;
        ctx.strokeStyle = `rgba(255,255,255,${(0.6 * (1 - f) * heavy).toFixed(3)})`; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.ellipse(px + ox, py + oy, 1 + f * 8, (1 + f * 8) * 0.25, 0, 0, PI * 2); ctx.stroke();
      }
    }
    // Steam lifting off the sun-warmed lawn
    {
      let seed = 99; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      for (let i = 0; i < 9; i++) {
        const x0 = rnd() * W, ph = rnd(), f = (t / 9.7 + ph) % 1, x = x0 + Math.sin(f * 5 + i) * 6, y = H * (0.74 - f * 0.10);
        const g = ctx.createRadialGradient(x, y, 0, x, y, 10 + f * 14); g.addColorStop(0, `rgba(255,255,255,${(0.10 * Math.sin(f * PI)).toFixed(3)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.fillRect(x - 26, y - 26, 52, 52);
      }
    }
  }

  // The sun-shower: slanting rain over the whole scene, heaviest over the sea, sparkling where the sun catches it
  function drawShower(ctx, W, H, t) {
    const a = env(win(t % SHOW, SHOWER), 0.18);
    if (a <= 0) return;
    ctx.fillStyle = `rgba(160,180,200,${(0.10 * a).toFixed(3)})`; ctx.fillRect(0, 0, W, H);
    let seed = 31; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < 160; i++) {
      const x0 = rnd() * W * 1.2, sp = 0.9 + rnd() * 0.5, ph = rnd(), len = H * (0.03 + rnd() * 0.03);
      const f = (t * sp * 1.6 + ph) % 1, y = -len + f * (H + len), x = x0 - f * W * 0.12;
      const heavy = x < W * 0.5 ? 1 : 0.55, lit = x > W * 0.55 && rnd() < 0.5;
      ctx.strokeStyle = lit ? `rgba(255,255,240,${(0.55 * a).toFixed(3)})` : `rgba(220,232,245,${(0.40 * a * heavy).toFixed(3)})`;
      ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len * 0.18, y + len); ctx.stroke();
    }
  }

  // ════════ PAINT — sky → rainbow, clouds → sea → canoe → bastion/town → surf → palms, tuk-tuk → lawn → life → cup → shower → haze ════════
  // (canvas passed in)
  const ctx = cvs.getContext('2d');
  const SCRATCH = document.createElement('canvas').getContext('2d');
  const skyL = document.createElement('canvas'); skyL.width = 620; skyL.height = 355;
  const back = document.createElement('canvas'); back.width = 620; back.height = 355;
  const midL = document.createElement('canvas'); midL.width = 620; midL.height = 355;
  const front = document.createElement('canvas'); front.width = 620; front.height = 355;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TURN_SECONDS = 12.5;
  function paintBase() {
    const k = skyL.getContext('2d'); k.clearRect(0, 0, 620, 355); draw(k, 620, 355, 'sky');
    const b = back.getContext('2d'); b.clearRect(0, 0, 620, 355); draw(b, 620, 355, 'back');
    const mm = midL.getContext('2d'); mm.clearRect(0, 0, 620, 355); draw(mm, 620, 355, 'mid');
    const f = front.getContext('2d'); f.clearRect(0, 0, 620, 355); draw(f, 620, 355, 'front');
  }
  function frame(ms) {
    const t = reduceMotion ? 0 : ms / 1000;
    const phi = (t / TURN_SECONDS) * Math.PI * 2;
    ctx.clearRect(0, 0, 620, 355);
    ctx.drawImage(skyL, 0, 0);
    drawSkyLife(ctx, 620, 355, t);
    ctx.drawImage(back, 0, 0);
    drawSeaLife(ctx, 620, 355, t);
    ctx.drawImage(midL, 0, 0);
    drawSurf(ctx, 620, 355, t);
    drawTownLife(ctx, 620, 355, t);
    ctx.drawImage(front, 0, 0);
    drawFrontLife(ctx, 620, 355, t);
    drawTrophy(ctx, 620, 355, phi, t);
    drawShower(ctx, 620, 355, t);
    drawAtmos(ctx, 620, 355);
  }
  function loop(ms) { if (!__running) return; __elapsed = ms - __t0; __frame(__elapsed); requestAnimationFrame(loop); }
  paintBase(); __frame(0);
  let repainted = false;
  const repaint = () => { if (!repainted) { repainted = true; paintBase(); __frame(__elapsed); } };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(repaint).catch(() => {});
  setTimeout(repaint, 2000);
  return {
    start() { if (__running) return; if (reduceMotion) { __frame(0); return; } __running = true; __t0 = performance.now() - __elapsed; requestAnimationFrame(loop); },
    stop() { __running = false; },
  };
}
function makeLeagueArt_icl(cvs) {
  let __running = false, __t0 = 0, __elapsed = 0;
  // Soft fade at the foot of the art so it melts into the card's info panel
  function __fade() {
    const g = ctx.createLinearGradient(0, 355 * 0.78, 0, 355);
    g.addColorStop(0, 'rgba(8,8,18,0)'); g.addColorStop(1, 'rgba(8,8,18,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 355 * 0.78, 620, 355 * 0.22);
  }
  function __frame(ms) { frame(ms); __fade(); }
  const PI = Math.PI;
  const SHOW = 26;                                   // length of the shared schedule, seconds
  // Scheduled moments (seconds into the SHOW loop) — spread out so they never all stop together
  const LIGHTS_ON = [2.6, 5.2];                      // bulb strings and stadium floodlights ripple on as the sun goes down
  const LIGHTS_OFF = [24.2, 25.7];                   // ...and ripple off before the loop starts over
  const PARROTS = [4.4, 8.6];                        // a flock of parakeets skims the reflecting pool
  const KITE_FIGHT = [8.0, 16.5];                    // two kites cross strings; one is cut loose and drifts away
  const CUT_AT = 0.36;                               // when in the fight the string snaps
  const SEARCH = [17.6, 23.2];                       // searchlights sweep the sky from the stadium
  const SIX = [17.0, 19.4];                          // a ball is hit for six, clean out of the ground
  const FLASHES = [17.4, 21.4];                      // the crowd's camera flashes go wild
  function win(m, [a, b]) { return m >= a && m <= b ? (m - a) / (b - a) : -1; }
  const env = (w, k = 0.15) => w < 0 ? 0 : Math.min(1, w / k, (1 - w) / k);
  function lightLevel(m) {                           // 0 → 1 for the evening lights, with a ripple position
    const on = win(m, LIGHTS_ON), off = win(m, LIGHTS_OFF);
    if (on >= 0) return on; if (off >= 0) return 1 - off;
    return m > LIGHTS_ON[1] && m < LIGHTS_OFF[0] ? 1 : 0;
  }
  const VYF = 0.470;                                 // horizon / Taj terrace
  const SUNP = { x: 0.050, y: 0.355, r: 0.075 };     // the sun, low on the left
  const TAJ = { cx: 0.225 };
  const STADIUM = { x0: 0.635, x1: 1.050, top: 0.392 };
  function stadRim(x, W, H) { const u = Math.max(0, Math.min(1, (x - W * STADIUM.x0) / (W * (STADIUM.x1 - STADIUM.x0)))), s = Math.sin(u * PI); return H * (0.400 - 0.010 * s + 0.040 * Math.pow(1 - s, 3)); }
  function stadRoofB(x, W, H) { const u = Math.max(0, Math.min(1, (x - W * STADIUM.x0) / (W * (STADIUM.x1 - STADIUM.x0)))); return stadRim(x, W, H) - H * 0.052 * Math.pow(Math.sin(u * PI), 0.45); }
  const BILL = { x: 0.598, y: 0.448, w: 0.128, h: 0.064 };
  const TOWERS = [0.725, 0.850, 0.985];

  // ════════ STILL SCENE — the Taj at sunset on kite-festival day, the old city and a stadium beyond ════════
  // 'sky' → sky, sun, clouds; 'back' → Taj, pool, gardens, stadium and rooftops; 'front' → our rooftop.
  function draw(ctxReal, W, H, part) {
    let ctx = part === 'sky' ? ctxReal : SCRATCH;
    let seed = 131;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const VY = H * VYF;
    const limb = (x1, y1, x2, y2, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
    const glow = (x, y, r, col) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    };
    const SX = W * SUNP.x, SY = H * SUNP.y;

    // ── Sky: a blazing sunset — violet overhead, magenta, then saffron and molten gold at the horizon ──
    const sky = ctx.createLinearGradient(0, 0, 0, VY);
    sky.addColorStop(0, '#3a1a5e'); sky.addColorStop(0.30, '#8a2a78'); sky.addColorStop(0.58, '#e2486a'); sky.addColorStop(0.80, '#ff8a3a'); sky.addColorStop(1, '#ffc04a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, VY + 4);
    const warm = ctx.createRadialGradient(SX, SY, 0, SX, SY, W * 0.80);
    warm.addColorStop(0, 'rgba(255,220,120,0.75)'); warm.addColorStop(0.3, 'rgba(255,150,70,0.35)'); warm.addColorStop(1, 'rgba(255,120,80,0)');
    ctx.fillStyle = warm; ctx.fillRect(0, 0, W, VY + 4);
    // Long flaming streaks of cloud, lit from beneath
    ctx.save(); ctx.filter = 'blur(2px)';
    [[0.30, 0.120, 0.34, 0.016], [0.70, 0.075, 0.40, 0.018], [0.55, 0.205, 0.30, 0.012], [0.90, 0.250, 0.24, 0.011], [0.18, 0.255, 0.22, 0.010], [0.80, 0.160, 0.20, 0.010]].forEach(([fx, fy, fw, fh]) => {
      const x = W * fx, y = H * fy, w = W * fw, h = H * fh, near = Math.max(0, 1 - Math.hypot(x - SX, (y - SY) * 2) / (W * 0.8));
      const g = ctx.createLinearGradient(0, y - h, 0, y + h);
      g.addColorStop(0, 'rgba(110,40,110,0.55)'); g.addColorStop(1, `rgba(255,${150 + near * 80 | 0},${90 + near * 40 | 0},${(0.75 + near * 0.2).toFixed(2)})`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, w / 2, h, -0.03, 0, PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + w * 0.2, y + h * 1.0, w * 0.28, h * 0.6, -0.03, 0, PI * 2); ctx.fill();
    });
    ctx.restore();

    ctx = part === 'back' ? ctxReal : SCRATCH;

    // ── Distant city silhouette along the horizon ──
    ctx.fillStyle = '#9a4a7a';
    for (let x = 0; x < W;) { const w = W * (0.02 + rnd() * 0.04), h = H * (0.010 + rnd() * 0.030); ctx.fillRect(x, VY - h, w, h + 2); if (rnd() < 0.25) { ctx.beginPath(); ctx.arc(x + w / 2, VY - h, w * 0.32, PI, 0); ctx.fill(); } x += w; }
    ctx.fillStyle = 'rgba(255,170,110,0.35)'; ctx.fillRect(0, VY - H * 0.045, W, H * 0.045);

    // ── The stadium: a great modern bowl — white tensile roof with peaked spikes, the far stands packed, a glowing concourse ──
    {
      const x0 = W * STADIUM.x0, x1 = W * STADIUM.x1;
      const u = (x) => Math.max(0, Math.min(1, (x - x0) / (x1 - x0)));
      const rim = (x) => stadRim(x, W, H), roofB = (x) => stadRoofB(x, W, H), roofT = (x) => roofB(x) - H * 0.010 * Math.pow(Math.sin(u(x) * PI), 0.4);
      // Far stands under the roof: tier upon tier of crowd in team colours
      ctx.fillStyle = '#2a1838'; ctx.beginPath(); ctx.moveTo(x0, rim(x0)); for (let x = x0; x <= x1; x += 3) ctx.lineTo(x, roofB(x)); for (let x = x1; x >= x0; x -= 3) ctx.lineTo(x, rim(x)); ctx.closePath(); ctx.fill();
      const crowd = ['#1a5ad0', '#ff8a1a', '#ffd23a', '#e8303a', '#20a8a0', '#ffffff', '#c83a9a', '#1a5ad0'];
      for (let x = x0 + 4; x < x1 - 2; x += 2.4) { const yb = rim(x) - 2, yt = roofB(x) + 3; for (let y = yt; y < yb; y += 2.6) { if (rnd() < 0.25) continue; ctx.fillStyle = crowd[(rnd() * 8) | 0]; ctx.globalAlpha = 0.28 + 0.40 * ((y - yt) / Math.max(1, yb - yt)); ctx.fillRect(x, y, 1.4, 1.4); } }
      { const sh = ctx.createLinearGradient(0, H * 0.33, 0, H * 0.36); sh.addColorStop(0, 'rgba(10,4,20,0.55)'); sh.addColorStop(1, 'rgba(10,4,20,0)'); ctx.save(); ctx.beginPath(); for (let x = x0; x <= x1; x += 3) ctx.lineTo(x, roofB(x)); for (let x = x1; x >= x0; x -= 3) ctx.lineTo(x, rim(x)); ctx.closePath(); ctx.clip(); ctx.fillStyle = sh; ctx.fillRect(x0, H * 0.30, x1 - x0, H * 0.08); ctx.restore(); }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(20,8,30,0.5)'; ctx.lineWidth = 0.6; for (let k = 1; k < 4; k++) { ctx.beginPath(); for (let x = x0; x <= x1; x += 3) { const y = roofB(x) + (rim(x) - roofB(x)) * k / 4; x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }   // tier walkways
      // The roof: a thick white band, glowing under its lip, with tensile peaks along the crown
      const rg = ctx.createLinearGradient(x0, 0, x1, 0); rg.addColorStop(0, '#fff4ea'); rg.addColorStop(0.5, '#e8d8e8'); rg.addColorStop(1, '#a890b0');
      ctx.fillStyle = rg; ctx.beginPath(); for (let x = x0 - 2; x <= x1; x += 3) ctx.lineTo(x, roofT(x)); for (let x = x1; x >= x0 - 2; x -= 3) ctx.lineTo(x, roofB(x)); ctx.closePath(); ctx.fill();
      for (let x = x0 + W * 0.018; x < x1 - 4; x += W * 0.034) {
        const y = roofT(x), h = H * (0.012 + 0.008 * Math.sin(u(x) * PI));
        ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(x - W * 0.017, y + 1); ctx.quadraticCurveTo(x - W * 0.006, y - h * 0.3, x, y - h); ctx.quadraticCurveTo(x + W * 0.006, y - h * 0.3, x + W * 0.017, y + 1); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(120,90,130,0.5)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x, y + 1); ctx.stroke();
        ctx.strokeStyle = 'rgba(60,40,60,0.8)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x, y - h - H * 0.014); ctx.stroke();   // flagpole (flags fly each frame)
      }
      ctx.strokeStyle = 'rgba(255,240,220,0.9)'; ctx.lineWidth = 0.9; ctx.beginPath(); for (let x = x0 - 2; x <= x1; x += 3) ctx.lineTo(x, roofT(x)); ctx.stroke();
      ctx.strokeStyle = 'rgba(80,50,90,0.5)'; ctx.lineWidth = 0.6; for (let x = x0 + 4; x < x1; x += 6) { ctx.beginPath(); ctx.moveTo(x, roofT(x) + 1); ctx.lineTo(x + 3, roofB(x) - 0.5); ctx.stroke(); }   // the roof's ribs
      // Near facade below the rim: white fins with dark glass between (the concourse lights up each evening)
      ctx.fillStyle = '#3a2248'; ctx.beginPath(); ctx.moveTo(x0, VY + 4); for (let x = x0; x <= x1; x += 3) ctx.lineTo(x, rim(x) + 3); ctx.lineTo(x1, VY + 4); ctx.closePath(); ctx.fill();
      for (let x = x0 + 5; x < x1; x += 10) { const yt = rim(x) + 3, lit = 1 - u(x); ctx.fillStyle = `rgba(${190 + 60 * lit | 0},${170 + 50 * lit | 0},${190 + 30 * lit | 0},0.55)`; ctx.fillRect(x - 0.5, yt, 1, VY + 4 - yt); }
    }

    // ── The Taj Mahal: on its terrace, white marble flushed pink and gold by the sun ──
    {
      const cx = W * TAJ.cx, base = VY, lit = '#fff8ec', mid = '#f8d2bc', shade = '#a87aa0';
      const mg = (x0, x1) => { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, lit); g.addColorStop(0.55, mid); g.addColorStop(1, shade); return g; };
      // Terrace
      ctx.fillStyle = mg(cx - W * 0.135, cx + W * 0.135); ctx.fillRect(cx - W * 0.135, base - H * 0.022, W * 0.27, H * 0.024);
      ctx.fillStyle = 'rgba(140,80,100,0.35)'; for (let k = 0; k < 14; k++) ctx.fillRect(cx - W * 0.13 + k * W * 0.0195, base - H * 0.020, W * 0.012, H * 0.015);
      // Minarets at the four corners (the near pair taller), each with three balconies and a little cupola
      [[-0.118, 0.218, 0.0095], [0.118, 0.218, 0.0095], [-0.092, 0.262, 0.0070], [0.092, 0.262, 0.0070]].forEach(([dx, topF, w]) => {
        const x = cx + W * dx, t = H * topF, ww = W * w;
        ctx.fillStyle = mg(x - ww, x + ww); ctx.fillRect(x - ww, t, ww * 2, base - H * 0.022 - t);
        [0.25, 0.52, 0.78].forEach(f => { const y = t + (base - t) * f; ctx.fillStyle = lit; ctx.fillRect(x - ww * 1.7, y, ww * 3.4, 1.6); ctx.fillStyle = 'rgba(120,70,100,0.4)'; ctx.fillRect(x - ww * 1.7, y + 1.6, ww * 3.4, 0.8); });
        ctx.fillStyle = mg(x - ww * 1.5, x + ww * 1.5); ctx.beginPath(); ctx.moveTo(x - ww * 1.5, t); ctx.quadraticCurveTo(x - ww * 1.4, t - H * 0.022, x, t - H * 0.028); ctx.quadraticCurveTo(x + ww * 1.4, t - H * 0.022, x + ww * 1.5, t); ctx.closePath(); ctx.fill();
        limb(x, t - H * 0.028, x, t - H * 0.040, 0.8, '#e8b850');
      });
      // Main hall: chamfered block, a great central arch (pishtaq) and stacked side arches
      const hw = W * 0.076, hT = base - H * 0.128, hB = base - H * 0.022;
      ctx.fillStyle = mg(cx - hw, cx + hw); ctx.beginPath(); ctx.moveTo(cx - hw, hB); ctx.lineTo(cx - hw, hT + H * 0.012); ctx.lineTo(cx - hw * 0.86, hT); ctx.lineTo(cx + hw * 0.86, hT); ctx.lineTo(cx + hw, hT + H * 0.012); ctx.lineTo(cx + hw, hB); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(130,80,110,0.30)'; ctx.fillRect(cx + hw * 0.62, hT, hw * 0.38, hB - hT);
      const arch = (x, y0, y1, w, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - w, y1); ctx.lineTo(x - w, y0 + w * 0.9); ctx.quadraticCurveTo(x - w, y0, x, y0 - w * 0.25); ctx.quadraticCurveTo(x + w, y0, x + w, y0 + w * 0.9); ctx.lineTo(x + w, y1); ctx.closePath(); ctx.fill(); };
      ctx.fillStyle = mid; ctx.fillRect(cx - hw * 0.36, hT - H * 0.010, hw * 0.72, hB - hT + H * 0.010);
      arch(cx, hT + H * 0.010, hB, hw * 0.24, '#5a3a5a'); arch(cx, hT + H * 0.018, hB, hw * 0.18, '#3a2440');
      [-0.66, 0.66].forEach(f => { arch(cx + f * hw, hT + H * 0.012, hT + H * 0.046, hw * 0.12, '#6a4a6a'); arch(cx + f * hw, hT + H * 0.056, hB - 1, hw * 0.12, '#6a4a6a'); });
      ctx.strokeStyle = 'rgba(255,240,220,0.7)'; ctx.lineWidth = 0.6; ctx.strokeRect(cx - hw * 0.36, hT - H * 0.010, hw * 0.72, hB - hT + H * 0.010);
      // Corner chhatris on the roof
      [-0.62, 0.62].forEach(f => { const x = cx + f * hw, y = hT; ctx.fillStyle = mg(x - 6, x + 6); ctx.fillRect(x - W * 0.010, y - H * 0.022, W * 0.020, H * 0.022); ctx.beginPath(); ctx.moveTo(x - W * 0.013, y - H * 0.022); ctx.quadraticCurveTo(x - W * 0.012, y - H * 0.046, x, y - H * 0.050); ctx.quadraticCurveTo(x + W * 0.012, y - H * 0.046, x + W * 0.013, y - H * 0.022); ctx.closePath(); ctx.fill(); limb(x, y - H * 0.050, x, y - H * 0.060, 0.7, '#e8b850'); });
      // Drum and the great onion dome, its sunlit flank glowing
      const dY = hT - H * 0.020, dR = W * 0.046;
      ctx.fillStyle = mg(cx - dR * 0.8, cx + dR * 0.8); ctx.fillRect(cx - dR * 0.78, dY, dR * 1.56, H * 0.022);
      const dg = ctx.createRadialGradient(cx - dR * 0.45, dY - dR * 1.1, 0, cx, dY - dR * 0.8, dR * 1.5);
      dg.addColorStop(0, '#fffaf0'); dg.addColorStop(0.45, '#f8d8c8'); dg.addColorStop(1, '#a87898');
      // Onion profile: narrow neck at the drum, swelling wide, then curving in to a slender point
      const onion = (sd) => { ctx.bezierCurveTo(cx + sd * dR * 1.45, dY - dR * 0.35, cx + sd * dR * 1.30, dY - dR * 1.35, cx + sd * dR * 0.42, dY - dR * 1.75); ctx.quadraticCurveTo(cx + sd * dR * 0.10, dY - dR * 1.95, cx, dY - dR * 2.30); };
      ctx.fillStyle = dg; ctx.beginPath(); ctx.moveTo(cx - dR * 0.70, dY); onion(-1); ctx.lineTo(cx, dY - dR * 2.30);
      ctx.quadraticCurveTo(cx + dR * 0.10, dY - dR * 1.95, cx + dR * 0.42, dY - dR * 1.75); ctx.bezierCurveTo(cx + dR * 1.30, dY - dR * 1.35, cx + dR * 1.45, dY - dR * 0.35, cx + dR * 0.70, dY); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,250,240,0.85)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - dR * 0.70, dY); onion(-1); ctx.stroke();
      ctx.strokeStyle = 'rgba(150,100,130,0.35)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.ellipse(cx, dY - dR * 0.10, dR * 0.85, dR * 0.10, 0, 0, PI); ctx.stroke();   // the dome's lotus collar
      limb(cx, dY - dR * 2.30, cx, dY - dR * 2.85, 1.4, '#e8b850');
      ctx.fillStyle = '#f2c860'; [2.42, 2.56].forEach(f => { ctx.beginPath(); ctx.arc(cx, dY - dR * f, 1.7, 0, PI * 2); ctx.fill(); });
      ctx.beginPath(); ctx.moveTo(cx - 2.4, dY - dR * 2.78); ctx.quadraticCurveTo(cx, dY - dR * 2.95, cx + 2.4, dY - dR * 2.78); ctx.strokeStyle = '#e8b850'; ctx.lineWidth = 1; ctx.stroke();   // crescent-tipped finial
      glow(cx - dR * 0.5, dY - dR * 1.2, dR * 1.2, 'rgba(255,200,140,0.25)');
    }

    // ── The garden: lawns, a long reflecting pool reaching toward us, dark cypresses lining it ──
    {
      const cx = W * TAJ.cx, farY = VY + 1, nearY = H * 0.618;
      const lawn = ctx.createLinearGradient(0, farY, 0, nearY); lawn.addColorStop(0, '#6a7a3a'); lawn.addColorStop(1, '#3a5a2a');
      ctx.fillStyle = lawn; ctx.beginPath(); ctx.moveTo(cx - W * 0.16, farY); ctx.lineTo(cx + W * 0.16, farY); ctx.lineTo(cx + W * 0.32, nearY); ctx.lineTo(cx - W * 0.32, nearY); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,170,90,0.25)'; ctx.beginPath(); ctx.moveTo(cx - W * 0.16, farY); ctx.lineTo(cx, farY); ctx.lineTo(cx - W * 0.05, nearY); ctx.lineTo(cx - W * 0.32, nearY); ctx.closePath(); ctx.fill();
      // Walkways beside the pool
      ctx.fillStyle = '#e8b8a0'; ctx.beginPath(); ctx.moveTo(cx - W * 0.030, farY); ctx.lineTo(cx + W * 0.030, farY); ctx.lineTo(cx + W * 0.115, nearY); ctx.lineTo(cx - W * 0.115, nearY); ctx.closePath(); ctx.fill();
      // The pool: sky colours, the Taj's reflection laid in (the shimmer is drawn each frame)
      const pg = ctx.createLinearGradient(0, farY, 0, nearY); pg.addColorStop(0, '#ff9a5a'); pg.addColorStop(0.5, '#c24a72'); pg.addColorStop(1, '#5a2a6a');
      ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(cx - W * 0.016, farY); ctx.lineTo(cx + W * 0.016, farY); ctx.lineTo(cx + W * 0.070, nearY); ctx.lineTo(cx - W * 0.070, nearY); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.moveTo(cx - W * 0.016, farY); ctx.lineTo(cx + W * 0.016, farY); ctx.lineTo(cx + W * 0.070, nearY); ctx.lineTo(cx - W * 0.070, nearY); ctx.closePath(); ctx.clip();
      // The Taj upside down in the water: hall, then the great dome swelling below it, then its point
      ctx.fillStyle = 'rgba(255,240,226,0.50)'; ctx.fillRect(cx - W * 0.05, farY, W * 0.10, H * 0.045);
      ctx.fillStyle = 'rgba(90,50,90,0.45)'; ctx.fillRect(cx - W * 0.008, farY + H * 0.004, W * 0.016, H * 0.036);
      ctx.fillStyle = 'rgba(255,236,222,0.45)'; ctx.beginPath(); ctx.moveTo(cx - W * 0.032, farY + H * 0.050); ctx.bezierCurveTo(cx - W * 0.066, farY + H * 0.065, cx - W * 0.060, farY + H * 0.105, cx - W * 0.020, farY + H * 0.118); ctx.quadraticCurveTo(cx - W * 0.004, farY + H * 0.125, cx, farY + H * 0.140); ctx.quadraticCurveTo(cx + W * 0.004, farY + H * 0.125, cx + W * 0.020, farY + H * 0.118); ctx.bezierCurveTo(cx + W * 0.060, farY + H * 0.105, cx + W * 0.066, farY + H * 0.065, cx + W * 0.032, farY + H * 0.050); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#f6dccc'; ctx.fillRect(cx - W * 0.018, farY, W * 0.036, 1.4);
      // Cypress rows, growing toward us
      for (let k = 0; k < 8; k++) {
        const f = k / 7, y = farY + (nearY - farY) * f * f * 0.92 + 2, off = W * (0.040 + 0.105 * f * f + 0.012), h = H * (0.020 + 0.060 * f * f), w = h * 0.28;
        [-1, 1].forEach(sd => {
          const x = cx + sd * off;
          ctx.fillStyle = '#1e3a24'; ctx.beginPath(); ctx.moveTo(x, y - h); ctx.quadraticCurveTo(x + w, y - h * 0.4, x + w * 0.6, y); ctx.lineTo(x - w * 0.6, y); ctx.quadraticCurveTo(x - w, y - h * 0.4, x, y - h); ctx.fill();
          ctx.fillStyle = 'rgba(255,170,90,0.45)'; ctx.beginPath(); ctx.moveTo(x, y - h); ctx.quadraticCurveTo(x - w, y - h * 0.4, x - w * 0.6, y); ctx.lineTo(x - w * 0.2, y); ctx.quadraticCurveTo(x - w * 0.4, y - h * 0.5, x, y - h); ctx.fill();
          ctx.fillStyle = 'rgba(30,10,40,0.35)'; ctx.beginPath(); ctx.ellipse(x + h * 0.35, y, h * 0.4, 1.4, 0, 0, PI * 2); ctx.fill();   // long shadow to the right
        });
      }
    }

    // ── The river in front of the old city, catching the sunset ──
    {
      const r0 = H * 0.548, r1 = H * 0.600;
      const rg = ctx.createLinearGradient(0, r0, 0, r1); rg.addColorStop(0, '#f08a6a'); rg.addColorStop(0.5, '#b84a72'); rg.addColorStop(1, '#5a2a6a');
      ctx.fillStyle = rg; ctx.fillRect(W * 0.34, r0, W * 0.70, r1 - r0);
      for (let i = 0; i < 70; i++) { const x = W * (0.34 + rnd() * 0.66), y = r0 + 2 + rnd() * (r1 - r0 - 4); ctx.fillStyle = `rgba(255,220,180,${(0.2 + rnd() * 0.4).toFixed(2)})`; ctx.fillRect(x, y, 2 + rnd() * 5, 0.8); }
      ctx.fillStyle = 'rgba(255,230,200,0.6)'; ctx.fillRect(W * 0.34, r0, W * 0.70, 1);
    }
    // ── The old city on the far bank: painted houses in blue, saffron, turquoise and pink, balconies, little domes, washing ──
    {
      const pal = ['#3a7ac8', '#f0a030', '#2ab0a8', '#e86a8a', '#f2c440', '#5a9ae0', '#f4ece0', '#e8703a'];
      const house = (x, w, top, col, near) => {
        const base = H * 0.550;
        const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#fff0d0'); g.addColorStop(0.18, col); g.addColorStop(1, col);
        ctx.fillStyle = g; ctx.fillRect(x, top, w, base - top);
        ctx.fillStyle = 'rgba(40,10,50,0.30)'; ctx.fillRect(x + w * 0.70, top, w * 0.30, base - top);                 // shade side, away from the sun
        ctx.fillStyle = 'rgba(255,245,230,0.9)'; ctx.fillRect(x - 0.5, top - 1.8, w + 1, 2.2);
        const n = Math.max(1, Math.floor(w / (near ? 11 : 9)));
        for (let k = 0; k < n; k++) {
          const wx = x + (k + 0.5) * w / n, wy = top + H * 0.012, ww = near ? 4.5 : 3.5, wh = near ? 7 : 5;
          ctx.fillStyle = 'rgba(255,245,230,0.9)'; ctx.beginPath(); ctx.moveTo(wx - ww / 2 - 0.8, wy + wh); ctx.lineTo(wx - ww / 2 - 0.8, wy + ww / 2); ctx.arc(wx, wy + ww / 2, ww / 2 + 0.8, PI, 0); ctx.lineTo(wx + ww / 2 + 0.8, wy + wh); ctx.closePath(); ctx.fill();
          ctx.fillStyle = ['#2a1a30', '#1a6a5a', '#8a2a2a'][(rnd() * 3) | 0]; ctx.beginPath(); ctx.moveTo(wx - ww / 2, wy + wh); ctx.lineTo(wx - ww / 2, wy + ww / 2); ctx.arc(wx, wy + ww / 2, ww / 2, PI, 0); ctx.lineTo(wx + ww / 2, wy + wh); ctx.closePath(); ctx.fill();
        }
        if (near && w > W * 0.05 && rnd() < 0.6) {          // a carved balcony bay
          const bx = x + w * 0.45, bw = W * 0.022, by = top + H * 0.028;
          ctx.fillStyle = 'rgba(255,245,230,0.95)'; ctx.fillRect(bx - bw / 2, by, bw, H * 0.022); ctx.fillStyle = col; ctx.fillRect(bx - bw / 2 + 1, by + 1, bw - 2, H * 0.016);
          ctx.fillStyle = 'rgba(255,245,230,0.95)'; ctx.beginPath(); ctx.moveTo(bx - bw / 2 - 1.5, by); ctx.quadraticCurveTo(bx, by - H * 0.016, bx + bw / 2 + 1.5, by); ctx.fill();
          ctx.fillStyle = '#2a1a30'; for (let k = 0; k < 3; k++) ctx.fillRect(bx - bw * 0.35 + k * bw * 0.3, by + H * 0.006, bw * 0.15, H * 0.010);
        }
        if (rnd() < 0.30) { const cx2 = x + w * (0.25 + rnd() * 0.5), cw = W * 0.012; ctx.fillStyle = 'rgba(255,240,225,0.95)'; ctx.fillRect(cx2 - cw * 0.5, top - H * 0.012, cw, H * 0.012); ctx.beginPath(); ctx.moveTo(cx2 - cw * 0.6, top - H * 0.012); ctx.quadraticCurveTo(cx2 - cw * 0.5, top - H * 0.030, cx2, top - H * 0.034); ctx.quadraticCurveTo(cx2 + cw * 0.5, top - H * 0.030, cx2 + cw * 0.6, top - H * 0.012); ctx.fill(); }
        if (rnd() < 0.25) { ctx.fillStyle = '#4a4050'; ctx.fillRect(x + w * 0.7, top - H * 0.020, W * 0.012, H * 0.018); }
        if (rnd() < 0.20) { ctx.fillStyle = '#e8e4e8'; ctx.beginPath(); ctx.ellipse(x + w * 0.25, top - H * 0.010, 3.4, 2.4, -0.5, 0, PI * 2); ctx.fill(); ctx.strokeStyle = '#8a8490'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x + w * 0.25, top - H * 0.010); ctx.lineTo(x + w * 0.25 + 3, top - H * 0.016); ctx.stroke(); }   // satellite dish
        if (rnd() < 0.30) {                                   // washing on a line
          const lx0 = x + w * 0.1, lx1 = x + w * 0.9, ly = top - H * 0.016;
          ctx.strokeStyle = 'rgba(40,20,30,0.6)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(lx0, ly); ctx.lineTo(lx1, ly); ctx.stroke();
          for (let k = 0; k < 4; k++) { ctx.fillStyle = ['#e8303a', '#ffd23a', '#20a8a0', '#ffffff', '#c83a9a'][(rnd() * 5) | 0]; ctx.fillRect(lx0 + 2 + k * (lx1 - lx0 - 4) / 4, ly, 3.5, 5 + rnd() * 3); }
        }
      };
      for (let x = W * 0.38; x < W * 1.02;) { const w = W * (0.04 + rnd() * 0.05); house(x, w, H * (0.452 + rnd() * 0.035), pal[(rnd() * pal.length) | 0], false); x += w; }
      ctx.fillStyle = 'rgba(90,40,90,0.30)'; ctx.fillRect(W * 0.38, H * 0.44, W * 0.64, H * 0.11);
      for (let x = W * 0.395; x < W * 1.02;) { const w = W * (0.05 + rnd() * 0.06); house(x, w, H * (0.488 + rnd() * 0.030), pal[(rnd() * pal.length) | 0], true); x += w; }
      // A ghat of steps down to the water along the bank
      ctx.fillStyle = '#e8b890'; ctx.fillRect(W * 0.38, H * 0.546, W * 0.66, H * 0.006); ctx.fillStyle = 'rgba(120,60,60,0.4)'; for (let x = W * 0.38; x < W * 1.02; x += 5) ctx.fillRect(x, H * 0.548, 0.6, H * 0.004);
      // Trees softening the join between the Taj gardens and the city
      for (let k = 0; k < 7; k++) { const x = W * (0.345 + k * 0.011 + rnd() * 0.004), b = H * (0.552 + rnd() * 0.01), h = H * (0.045 + rnd() * 0.03), w = h * 0.26;
        ctx.fillStyle = '#24402a'; ctx.beginPath(); ctx.moveTo(x, b - h); ctx.quadraticCurveTo(x + w, b - h * 0.4, x + w * 0.6, b); ctx.lineTo(x - w * 0.6, b); ctx.quadraticCurveTo(x - w, b - h * 0.4, x, b - h); ctx.fill();
        ctx.fillStyle = 'rgba(255,170,90,0.45)'; ctx.beginPath(); ctx.moveTo(x, b - h); ctx.quadraticCurveTo(x - w, b - h * 0.4, x - w * 0.6, b); ctx.lineTo(x - w * 0.2, b); ctx.quadraticCurveTo(x - w * 0.4, b - h * 0.5, x, b - h); ctx.fill(); }
      // The billboard: hand-painted ICL poster on scaffold legs (its bulbs chase and it flashes "SIX!" each frame)
      const bx = W * BILL.x, by = H * BILL.y, bw = W * BILL.w, bh = H * BILL.h;
      ctx.strokeStyle = '#3a2a30'; ctx.lineWidth = 1.2; [0.15, 0.5, 0.85].forEach(f => { ctx.beginPath(); ctx.moveTo(bx + bw * f, by + bh); ctx.lineTo(bx + bw * f, by + bh + H * 0.05); ctx.stroke(); });
      const bg = ctx.createLinearGradient(bx, by, bx + bw, by + bh); bg.addColorStop(0, '#1a3a9a'); bg.addColorStop(1, '#0a1a5a');
      ctx.fillStyle = bg; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#ff8a1a'; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + bw * 0.38, by); ctx.lineTo(bx + bw * 0.26, by + bh); ctx.lineTo(bx, by + bh); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.font = `900 ${bh * 0.62}px 'Barlow Condensed', 'Arial Narrow', sans-serif`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff'; ctx.fillText('ICL', bx + bw * 0.42, by + bh * 0.47);
      ctx.font = `700 ${bh * 0.20}px 'Barlow Condensed', 'Arial Narrow', sans-serif`; ctx.fillStyle = '#ffd23a'; ctx.fillText('CHAMPIONS CUP', bx + bw * 0.42, by + bh * 0.85); ctx.restore();
      ctx.save(); ctx.translate(bx + bw * 0.15, by + bh * 0.55); ctx.rotate(-0.6);
      ctx.fillStyle = '#f6e2b0'; ctx.fillRect(-bh * 0.06, -bh * 0.38, bh * 0.12, bh * 0.52); ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-bh * 0.025, -bh * 0.60, bh * 0.05, bh * 0.24); ctx.restore();
      ctx.fillStyle = '#e8202a'; ctx.beginPath(); ctx.arc(bx + bw * 0.27, by + bh * 0.26, bh * 0.08, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,220,180,0.6)'; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
    }

    if (part === 'back' || part === 'sky') return;
    ctx = ctxReal;

    // ════════ FRONT LAYER — our rooftop: parapet, chai on the coals, spare kites, the spool, the stumps ════════
    const FL = H * 0.618, PAR = H * 0.596;
    {
      const g = ctx.createLinearGradient(0, PAR, 0, FL); g.addColorStop(0, '#d88a62'); g.addColorStop(1, '#a85a48');
      ctx.fillStyle = g; ctx.fillRect(0, PAR, W, FL - PAR + 1);
      ctx.fillStyle = '#f2b088'; ctx.fillRect(0, PAR - 2.5, W, 3.5);
      ctx.fillStyle = 'rgba(255,230,190,0.9)'; ctx.fillRect(0, PAR - 2.5, W, 0.9);
      const fg = ctx.createLinearGradient(0, FL, 0, H); fg.addColorStop(0, '#d89a72'); fg.addColorStop(0.5, '#b87a5a'); fg.addColorStop(1, '#7a4a42');
      ctx.fillStyle = fg; ctx.fillRect(0, FL, W, H - FL);
      ctx.strokeStyle = 'rgba(90,40,30,0.25)'; ctx.lineWidth = 0.7;
      for (let y = FL + 4, st = 5; y < H; y += st, st *= 1.22) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const rake = ctx.createLinearGradient(0, 0, W, 0); rake.addColorStop(0, 'rgba(255,160,80,0.30)'); rake.addColorStop(0.6, 'rgba(255,160,80,0)');
      ctx.fillStyle = rake; ctx.fillRect(0, FL, W, H - FL); ctx.restore();
    }
    const longShadow = (x, y, w, len) => {          // the sun is low on the left, so shadows stretch away to the right
      const g = ctx.createLinearGradient(x, y, x + len, y + len * 0.12);
      g.addColorStop(0, 'rgba(60,20,40,0.45)'); g.addColorStop(1, 'rgba(60,20,40,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x + w / 2, y - 1); ctx.lineTo(x + len, y + len * 0.08); ctx.lineTo(x + len - w * 0.4, y + len * 0.16); ctx.closePath(); ctx.fill();
    };
    // A rooftop gully-cricket corner: a well-loved bat against the wall, a taped tennis ball, a couple of spare kites
    {
      const toeX = W * 0.318, toeY = H * 0.704, topX = W * 0.352, topY = H * 0.575;
      const ang = Math.atan2(topY - toeY, topX - toeX), len = Math.hypot(topX - toeX, topY - toeY);
      longShadow(toeX, toeY, 8, len * 0.9);
      ctx.save(); ctx.translate(toeX, toeY); ctx.rotate(ang);
      const bw = W * 0.016, bl = len * 0.64;
      const g = ctx.createLinearGradient(0, -bw / 2, 0, bw / 2); g.addColorStop(0, '#fff2c8'); g.addColorStop(0.5, '#e8c890'); g.addColorStop(1, '#9a6a3a');
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(0, -bw / 2, bl, bw, bw * 0.28); ctx.fill();
      ctx.fillStyle = 'rgba(120,70,30,0.45)'; [0.15, 0.30, 0.42].forEach(f => ctx.fillRect(bl * f, -bw / 2, 1.2, bw * 0.6));          // dents from a thousand tape-ball shots
      ctx.fillStyle = '#1a3a9a'; ctx.fillRect(bl * 0.62, -bw / 2, bl * 0.12, bw); ctx.fillStyle = '#ff8a1a'; ctx.fillRect(bl * 0.64, -bw / 2, bl * 0.04, bw);
      ctx.fillStyle = '#e8c890'; ctx.fillRect(bl, -bw * 0.18, bw * 0.6, bw * 0.36);
      ctx.fillStyle = '#d81e3a'; ctx.fillRect(bl + bw * 0.55, -bw * 0.18, len - bl - bw * 0.55, bw * 0.36);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let x = bl + bw * 0.8; x < len - 2; x += 3) ctx.fillRect(x, -bw * 0.18, 1, bw * 0.36);
      ctx.restore();
      // Tennis ball wrapped in black electrical tape
      const tbx = W * 0.288, tby = H * 0.700, tr = H * 0.018;
      longShadow(tbx, tby + tr, tr * 2, tr * 4);
      const tg = ctx.createRadialGradient(tbx - tr * 0.4, tby - tr * 0.4, 0, tbx, tby, tr); tg.addColorStop(0, '#f6ff9a'); tg.addColorStop(0.6, '#c8e02a'); tg.addColorStop(1, '#6a7a10');
      ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(tbx, tby, tr, 0, PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(tbx, tby, tr, 0, PI * 2); ctx.clip(); ctx.fillStyle = '#16161a'; [-0.45, 0.05, 0.55].forEach(o => ctx.fillRect(tbx - tr, tby + o * tr - tr * 0.14, tr * 2, tr * 0.26)); ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(tbx - tr * 0.4, tby - tr * 0.45, tr * 0.18, 0, PI * 2); ctx.fill();
    }
    // A red plastic chair, the universal rooftop seat
    {
      const x = W * 0.862, b = H * 0.702, s = H * 0.105;
      longShadow(x, b, s * 0.5, s * 1.4);
      const red = '#d8202a', dark = '#8a0a14', lite = '#ff6a5a';
      ctx.strokeStyle = dark; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      [[-0.30, -0.20], [0.30, 0.22], [-0.16, -0.10], [0.18, 0.12]].forEach(([foot, top], i) => { ctx.strokeStyle = i < 2 ? red : dark; ctx.beginPath(); ctx.moveTo(x + s * foot, b); ctx.lineTo(x + s * top, b - s * 0.44); ctx.stroke(); });
      ctx.fillStyle = red; ctx.beginPath(); ctx.moveTo(x - s * 0.30, b - s * 0.44); ctx.lineTo(x + s * 0.30, b - s * 0.44); ctx.lineTo(x + s * 0.26, b - s * 0.50); ctx.lineTo(x - s * 0.26, b - s * 0.50); ctx.closePath(); ctx.fill();   // seat
      ctx.fillStyle = lite; ctx.fillRect(x - s * 0.26, b - s * 0.50, s * 0.52, 1);
      ctx.fillStyle = red; ctx.beginPath(); ctx.moveTo(x - s * 0.24, b - s * 0.52); ctx.lineTo(x - s * 0.27, b - s * 0.95); ctx.quadraticCurveTo(x, b - s * 1.04, x + s * 0.27, b - s * 0.95); ctx.lineTo(x + s * 0.24, b - s * 0.52); ctx.lineTo(x + s * 0.20, b - s * 0.52); ctx.lineTo(x + s * 0.21, b - s * 0.88); ctx.quadraticCurveTo(x, b - s * 0.94, x - s * 0.21, b - s * 0.88); ctx.lineTo(x - s * 0.20, b - s * 0.52); ctx.closePath(); ctx.fill();   // back frame
      ctx.fillStyle = dark; for (let k = 0; k < 3; k++) ctx.fillRect(x - s * 0.12 + k * s * 0.10, b - s * 0.86, s * 0.04, s * 0.30);  // slats
      ctx.fillStyle = red; for (let k = 0; k < 4; k++) ctx.fillRect(x - s * 0.17 + k * s * 0.10, b - s * 0.86, s * 0.055, s * 0.30);
      ctx.fillStyle = lite; ctx.fillRect(x - s * 0.27, b - s * 0.95, 1.2, s * 0.42);
    }
    // ════════ HERO KIT — stumps on the rooftop, a ball beside them ════════
    {
      const sx = W * 0.700, base = H * 0.700, sh = H * 0.160, top = base - sh, gap = W * 0.021, r = W * 0.0058;
      [-gap, 0, gap].forEach(dx => longShadow(sx + dx, base, r * 2, sh * 0.9));
      ctx.fillStyle = '#7a4a3a'; ctx.fillRect(sx - gap * 1.8, base - 2, gap * 3.6, 3);
      [-gap, 0, gap].forEach(dx => {
        const x = sx + dx;
        const g = ctx.createLinearGradient(x - r, 0, x + r, 0);
        g.addColorStop(0, '#fff2d0'); g.addColorStop(0.35, '#f0c890'); g.addColorStop(0.75, '#b07848'); g.addColorStop(1, '#7a4a2a');
        ctx.fillStyle = g; ctx.fillRect(x - r, top, r * 2, sh);
        ctx.fillStyle = '#ff8a1a'; ctx.fillRect(x - r, top + sh * 0.16, r * 2, sh * 0.06);
        ctx.fillStyle = '#1a3a9a'; ctx.fillRect(x - r, top + sh * 0.22, r * 2, sh * 0.03);
        ctx.fillStyle = '#fff2d8'; ctx.beginPath(); ctx.ellipse(x, top, r, r * 0.55, 0, 0, PI * 2); ctx.fill();
      });
      const bh = H * 0.009;
      [[sx - gap - r * 0.6, sx - r * 0.2], [sx + r * 0.2, sx + gap + r * 0.6]].forEach(([b0, b1]) => {
        const bg = ctx.createLinearGradient(0, top - bh, 0, top + 1); bg.addColorStop(0, '#fff6e2'); bg.addColorStop(1, '#b08048');
        ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(b0, top - bh * 0.8, b1 - b0, bh, bh * 0.45); ctx.fill();
      });
      const bx = W * 0.770, by = base - H * 0.012, brr = H * 0.018;
      longShadow(bx, by + brr, brr * 1.6, brr * 4);
      const rg = ctx.createRadialGradient(bx - brr * 0.35, by - brr * 0.45, brr * 0.1, bx, by, brr);
      rg.addColorStop(0, '#ffb08a'); rg.addColorStop(0.5, '#c81e1e'); rg.addColorStop(1, '#4a0610');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(bx, by, brr, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,240,220,0.85)'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.ellipse(bx, by, brr * 0.30, brr * 0.98, -0.35, 0, PI * 2); ctx.stroke();
    }
  }

  // Warm evening haze and a deep vignette over everything
  function drawAtmos(ctx, W, H) {
    const haze = ctx.createLinearGradient(0, H * 0.36, 0, H * 0.62);
    haze.addColorStop(0, 'rgba(255,170,110,0)'); haze.addColorStop(0.5, 'rgba(255,170,110,0.12)'); haze.addColorStop(1, 'rgba(255,170,110,0)');
    ctx.fillStyle = haze; ctx.fillRect(0, H * 0.36, W, H * 0.26);
    const vig = ctx.createRadialGradient(W * 0.45, H * 0.45, W * 0.22, W * 0.45, H * 0.45, W * 0.85);
    vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(0.7, 'rgba(40,10,40,0.06)'); vig.addColorStop(1, 'rgba(40,10,40,0.30)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H);
  }

  // ════════ THE CHAMPIONS CUP — granite and gold: a stem of three spiralling ribbons, a jewelled chalice whose rim is a crown,
  // a ruby cricket ball resting in its mouth beneath a sarpech plume, and two soaring handles curling into peacock eyes ════════
  function drawTrophy(ctx, W, H, phi, t) {
    const FONT = (wt, px) => `${wt} ${px}px 'Barlow Condensed', 'Arial Narrow', sans-serif`;
    const tx = W * 0.5, tb = H * 0.705, S = H * 0.390, K = 1.58, TILT = 0.10;
    const RED = '#c81e3a', GREEN = '#139a52', BLUE = '#1a5ad0';
    const glowAt = (x, y, r, col) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); };
    // Long sunset shadow across the roof
    { const g = ctx.createLinearGradient(tx, tb, tx + W * 0.30, tb + H * 0.03); g.addColorStop(0, 'rgba(60,20,40,0.50)'); g.addColorStop(1, 'rgba(60,20,40,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(tx - W * 0.07, tb + 1); ctx.lineTo(tx + W * 0.06, tb - 2); ctx.lineTo(tx + W * 0.36, tb + H * 0.02); ctx.lineTo(tx + W * 0.32, tb + H * 0.05); ctx.closePath(); ctx.fill(); }
    ctx.save(); ctx.translate(tx, tb); ctx.scale(K, K); ctx.translate(-tx, -tb);
    const gold = (x0, x1) => { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#c8802a'); g.addColorStop(0.12, '#fff4c4'); g.addColorStop(0.30, '#ffd070'); g.addColorStop(0.56, '#d0902e'); g.addColorStop(0.80, '#8a4a28'); g.addColorStop(1, '#4a2018'); return g; };
    const P = (r, y, a) => [tx + r * Math.sin(a), y + r * Math.cos(a) * TILT];

    // ── Black granite plinth, two tiers, gold bands, a curved gold plate ──
    const pB = tb, pH = S * 0.125, pW = W * 0.056;
    const gr = ctx.createLinearGradient(tx - pW, 0, tx + pW, 0); gr.addColorStop(0, '#6a5a6a'); gr.addColorStop(0.18, '#2a2230'); gr.addColorStop(0.6, '#140e18'); gr.addColorStop(1, '#0a060c');
    function drum(cy, h, r) {
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(tx - r, cy - h); ctx.lineTo(tx - r, cy); ctx.ellipse(tx, cy, r, r * TILT, 0, PI, 0, true); ctx.lineTo(tx + r, cy - h); ctx.closePath(); ctx.fill();
      const tg = ctx.createLinearGradient(tx - r, 0, tx + r, 0); tg.addColorStop(0, '#8a7888'); tg.addColorStop(1, '#1a121e');
      ctx.fillStyle = tg; ctx.beginPath(); ctx.ellipse(tx, cy - h, r, r * TILT, 0, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = '#e8b850'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(tx, cy - h, r, r * TILT, 0, 0, PI); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,200,150,0.55)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(tx - r + 1, cy - h + 1); ctx.lineTo(tx - r + 1, cy); ctx.stroke();
    }
    drum(pB, pH, pW);
    ctx.strokeStyle = '#e8b850'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(tx, pB - pH * 0.10, pW, pW * TILT, 0, 0, PI); ctx.stroke();
    const eR = pW * TILT;
    const plate = ctx.createLinearGradient(0, pB - pH * 0.72, 0, pB - pH * 0.22); plate.addColorStop(0, '#fff0b0'); plate.addColorStop(1, '#b8862c');
    ctx.fillStyle = plate; ctx.beginPath();
    ctx.moveTo(tx - pW * 0.80, pB - pH * 0.72); ctx.quadraticCurveTo(tx, pB - pH * 0.72 + eR * 1.1, tx + pW * 0.80, pB - pH * 0.72);
    ctx.lineTo(tx + pW * 0.80, pB - pH * 0.22); ctx.quadraticCurveTo(tx, pB - pH * 0.22 + eR * 1.1, tx - pW * 0.80, pB - pH * 0.22); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.fillStyle = '#2a1806'; ctx.font = FONT(900, pH * 0.27); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('THE CHAMPIONS CUP', tx, pB - pH * 0.52 + eR * 0.55, pW * 1.5);
    ctx.font = FONT(700, pH * 0.15); ctx.fillText('INDIAN CHAMPIONS LEAGUE', tx, pB - pH * 0.30 + eR * 0.55, pW * 1.5); ctx.restore();
    drum(pB - pH, S * 0.035, pW * 0.70);

    // ── Gold foot: a stepped dome with a ring of enamel ──
    const fY = pB - pH - S * 0.035, fW = W * 0.032;
    ctx.fillStyle = gold(tx - fW, tx + fW); ctx.beginPath(); ctx.ellipse(tx, fY, fW, fW * TILT, 0, 0, PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(tx - fW, fY); ctx.quadraticCurveTo(tx - fW * 0.9, fY - S * 0.040, tx - fW * 0.25, fY - S * 0.048); ctx.lineTo(tx + fW * 0.25, fY - S * 0.048); ctx.quadraticCurveTo(tx + fW * 0.9, fY - S * 0.040, tx + fW, fY); ctx.closePath(); ctx.fill();
    for (let k = 0; k < 16; k++) { const a = phi + k * PI / 8, c = Math.cos(a); if (c < 0.05) continue; const [x, y] = P(fW * 0.80, fY - S * 0.016, a); ctx.fillStyle = k % 2 ? RED : GREEN; ctx.beginPath(); ctx.ellipse(x, y, 1.3 * Math.max(0.35, c), 1.3, 0, 0, PI * 2); ctx.fill(); }

    // ── The stem: three gold ribbons spiralling round a slender core, twisting as the cup turns ──
    const sB = fY - S * 0.048, sT = sB - S * 0.290, coreR = W * 0.0055;
    const ribbonPts = (j) => { const out = []; for (let i = 0; i <= 36; i++) { const v = i / 36, y = sB + (sT - sB) * v, r = W * (0.007 + 0.013 * Math.sin(PI * v)), a = phi + j * PI * 2 / 3 + v * PI * 2.2; out.push([tx + r * Math.sin(a), y + r * Math.cos(a) * TILT, Math.cos(a)]); } return out; };
    const ribbons = [0, 1, 2].map(ribbonPts);
    const drawRibbonSegs = (front) => ribbons.forEach(pts => { for (let i = 0; i < pts.length - 1; i++) { const z = (pts[i][2] + pts[i + 1][2]) / 2; if ((z >= 0) !== front) continue;
      const lum = 0.45 + 0.35 * z + 0.2 * Math.max(0, -(pts[i + 1][0] - pts[i][0]));
      ctx.strokeStyle = z >= 0 ? `rgb(${Math.round(200 + 55 * lum)},${Math.round(140 + 90 * lum)},${Math.round(40 + 90 * lum)})` : '#7a4a20'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.stroke(); } });
    drawRibbonSegs(false);
    ctx.fillStyle = gold(tx - coreR * 2, tx + coreR * 2); ctx.fillRect(tx - coreR, sT, coreR * 2, sB - sT);
    drawRibbonSegs(true);
    [sB - S * 0.006, sT + S * 0.006].forEach(y => { ctx.fillStyle = gold(tx - W * 0.016, tx + W * 0.016); ctx.beginPath(); ctx.ellipse(tx, y, W * 0.016, S * 0.012, 0, 0, PI * 2); ctx.fill(); ctx.fillStyle = BLUE; ctx.beginPath(); ctx.ellipse(tx, y, W * 0.016, S * 0.004, 0, 0, PI); ctx.fill(); });

    // ── The chalice: flaring from a narrow base to a wide mouth ──
    const bot = sT - S * 0.006, rimY = bot - S * 0.165, cw = W * 0.058;
    const prof = (u) => { const a = (1 - u) ** 3, b = 3 * u * (1 - u) ** 2, c = 3 * u * u * (1 - u), d = u ** 3;   // u: 0 = rim → 1 = base
      return [a * cw + b * cw * 0.98 + c * W * 0.010 + d * W * 0.014, a * rimY + b * (rimY + S * 0.090) + c * (bot - S * 0.020) + d * bot]; };
    const rAt = (y) => { let best = cw, bd = 1e9; for (let i = 0; i <= 60; i++) { const [r, yy] = prof(i / 60); const d = Math.abs(yy - y); if (d < bd) { bd = d; best = r; } } return best; };
    const bowlPath = () => { ctx.beginPath(); for (let i = 0; i <= 40; i++) { const [r, y] = prof(i / 40); ctx.lineTo(tx - r, y); } for (let i = 40; i >= 0; i--) { const [r, y] = prof(i / 40); ctx.lineTo(tx + r, y); } ctx.closePath(); };

    // Soaring handles: from beneath the bowl, sweeping out and up past the rim, curling in to a peacock-feather eye
    const handles = [phi + PI / 2, phi - PI / 2];
    function handle(a) {
      const c = Math.cos(a), A = [W * 0.016, bot - S * 0.004], C1 = [W * 0.100, bot - S * 0.020], C2 = [W * 0.098, rimY - S * 0.080], B = [W * 0.070, rimY - S * 0.075];
      const bz = (u) => { const m = 1 - u; return [m * m * m * A[0] + 3 * m * m * u * C1[0] + 3 * m * u * u * C2[0] + u * u * u * B[0], m * m * m * A[1] + 3 * m * m * u * C1[1] + 3 * m * u * u * C2[1] + u * u * u * B[1]]; };
      const pts = []; for (let i = 0; i <= 34; i++) { const [r, y] = bz(i / 34); pts.push(P(r, y, a)); }
      const curl = []; for (let i = 0; i <= 16; i++) { const u = i / 16, ang = PI * 1.0 + u * PI * 1.4, rr = S * 0.026 * (1 - u * 0.6); curl.push(P(B[0] - S * 0.020 + Math.cos(ang) * rr * 0.8, B[1] + Math.sin(ang) * rr, a)); }
      const path = (arr) => { ctx.beginPath(); arr.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = c < 0 ? '#6a3a18' : '#a8641c'; ctx.lineWidth = 3.6; path(pts); ctx.stroke(); ctx.lineWidth = 2.6; path(curl); ctx.stroke();
      ctx.strokeStyle = c < 0 ? '#b8802c' : '#ffe08a'; ctx.lineWidth = 2.0; path(pts); ctx.stroke(); ctx.lineWidth = 1.3; path(curl); ctx.stroke();
      if (c >= 0) { ctx.strokeStyle = 'rgba(255,250,220,0.9)'; ctx.lineWidth = 0.6; path(pts.slice(4, 20)); ctx.stroke(); }
      const [ex, ey] = P(B[0] - S * 0.020, B[1], a), sx2 = Math.max(0.3, Math.abs(Math.sin(a))), er = S * 0.020;
      ctx.save(); ctx.translate(ex, ey); ctx.scale(sx2, 1);
      ctx.fillStyle = '#e8b830'; ctx.beginPath(); ctx.ellipse(0, 0, er, er * 1.35, 0, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#139a7a'; ctx.beginPath(); ctx.ellipse(0, 0, er * 0.75, er * 1.05, 0, 0, PI * 2); ctx.fill();
      ctx.fillStyle = BLUE; ctx.beginPath(); ctx.ellipse(0, er * 0.1, er * 0.45, er * 0.62, 0, 0, PI * 2); ctx.fill();
      ctx.fillStyle = '#0a1a3a'; ctx.beginPath(); ctx.arc(0, er * 0.15, er * 0.2, 0, PI * 2); ctx.fill();
      ctx.restore();
    }
    handles.filter(a => Math.cos(a) < 0).forEach(handle);
    ctx.fillStyle = gold(tx - cw, tx + cw); bowlPath(); ctx.fill();
    ctx.save(); bowlPath(); ctx.clip();
    // A band of tiny enamel arches round the bowl, turning
    { const yb = rimY + S * 0.085, ytp = rimY + S * 0.040, N = 14;
      for (let k = 0; k < N; k++) { const a = phi + (k + 0.5) * PI * 2 / N, c = Math.cos(a); if (c < 0.03) continue;
        const rm = rAt((yb + ytp) / 2), cx = tx + rm * Math.sin(a), hw = rm * Math.sin(PI / N) * 0.80 * c, y1 = yb + rm * c * TILT * 0.6, y0 = ytp + rm * c * TILT * 0.6;
        ctx.fillStyle = k % 2 ? RED : GREEN; ctx.beginPath(); ctx.moveTo(cx - hw, y1); ctx.lineTo(cx - hw, y0 + (y1 - y0) * 0.4); ctx.quadraticCurveTo(cx - hw, y0, cx, y0 - 1); ctx.quadraticCurveTo(cx + hw, y0, cx + hw, y0 + (y1 - y0) * 0.4); ctx.lineTo(cx + hw, y1); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,240,200,0.95)'; ctx.lineWidth = 0.5; ctx.stroke(); } }
    // Gold filigree fanning down the lower bowl, turning
    for (let k = 0; k < 20; k++) { const a = phi + k * PI / 10, c = Math.cos(a); if (c < 0.08) continue;
      const pts = []; for (let i = 0; i <= 10; i++) { const u = 0.55 + i * 0.04; const [r, y] = prof(u); pts.push(P(r, y, a)); }
      ctx.strokeStyle = `rgba(255,240,180,${(0.2 + 0.5 * c).toFixed(3)})`; ctx.lineWidth = 0.6; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke(); }
    const sheen = ctx.createLinearGradient(0, rimY, 0, bot); sheen.addColorStop(0, 'rgba(255,255,230,0)'); sheen.addColorStop(1, 'rgba(60,20,10,0.30)');
    ctx.fillStyle = sheen; ctx.fillRect(tx - cw * 1.2, rimY, cw * 2.4, bot - rimY);
    ctx.fillStyle = 'rgba(255,255,240,0.45)'; ctx.beginPath(); ctx.ellipse(tx - cw * 0.55, rimY + S * 0.05, cw * 0.10, S * 0.040, 0.2, 0, PI * 2); ctx.fill();
    ctx.restore();

    // ── The rim is a crown: jewelled points ring the mouth; the ruby ball rests inside with its gold seam turning ──
    const pts = 12, ch = S * 0.060;
    const point = (a, front) => {
      const c = Math.cos(a), hw = 0.15, pA = P(cw, rimY, a - hw), pB = P(cw, rimY, a + hw), tip = P(cw * 1.06, rimY - ch, a);
      ctx.fillStyle = front ? gold(tx - cw * 1.1, tx + cw * 1.1) : '#8a5a22';
      ctx.beginPath(); ctx.moveTo(...pA); ctx.quadraticCurveTo((pA[0] + tip[0]) / 2 - 1, (pA[1] + tip[1]) / 2, ...tip); ctx.quadraticCurveTo((pB[0] + tip[0]) / 2 + 1, (pB[1] + tip[1]) / 2, ...pB); ctx.closePath(); ctx.fill();
      if (front && c > 0.15) { ctx.fillStyle = '#fff4dc'; ctx.beginPath(); ctx.arc(tip[0], tip[1], 1.3, 0, PI * 2); ctx.fill(); const g = P(cw * 1.02, rimY - ch * 0.45, a); ctx.fillStyle = (Math.round((a - phi) / (PI * 2 / pts)) % 2) ? RED : GREEN; ctx.beginPath(); ctx.ellipse(g[0], g[1], 1.6 * Math.max(0.35, c), 1.9, 0, 0, PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(g[0] - 0.5, g[1] - 1.2, 0.8, 0.8); }
    };
    const angs = []; for (let k = 0; k < pts; k++) angs.push(phi + k * PI * 2 / pts);
    ctx.fillStyle = '#3a1a10'; ctx.beginPath(); ctx.ellipse(tx, rimY, cw * 0.96, cw * 0.96 * TILT, 0, 0, PI * 2); ctx.fill();          // the dark mouth
    angs.filter(a => Math.cos(a) < 0).forEach(a => point(a, false));
    ctx.fillStyle = gold(tx - cw * 1.04, tx + cw * 1.04); ctx.beginPath(); ctx.ellipse(tx, rimY, cw * 1.03, cw * 1.03 * TILT + 1.4, 0, 0, PI); ctx.lineTo(tx - cw * 1.03, rimY); ctx.fill();   // the front lip
    for (let k = 0; k < 24; k++) { const a = phi + k * PI / 12, c = Math.cos(a); if (c < 0.05) continue; const [x, y] = P(cw * 1.03, rimY + 1, a); ctx.fillStyle = '#fff8e8'; ctx.beginPath(); ctx.arc(x, y, 0.8, 0, PI * 2); ctx.fill(); }
    angs.filter(a => Math.cos(a) >= 0).sort((p, q) => Math.cos(p) - Math.cos(q)).forEach(a => point(a, true));
    handles.filter(a => Math.cos(a) >= 0).forEach(handle);
    // Calm shine: a glint travelling round the crown's points
    { const f = (t / 7.3) % 1, a = -PI / 2 + f * PI, [gx, gy] = P(cw * 1.04, rimY - ch * 0.6, a), k2 = Math.sin(f * PI); glowAt(gx, gy, 6, `rgba(255,250,225,${(0.6 * k2).toFixed(3)})`); }
    ctx.restore();
  }

  // ════════ KITES — the sky full of them; a kite fight; the hero kite on our own string ════════
  // [x, y, size, colour A, colour B, phase] — kept clear of the sun, the Taj's dome and the cup
  const KITES = [[0.340, 0.110, 0.018, '#1a8ad0', '#ffffff', 1.3], [0.120, 0.135, 0.016, '#ffd23a', '#e8303a', 0.0]];
  const FIGHT_A = [0.845, 0.215, 0.024, '#e8303a', '#ffffff'], FIGHT_B = [0.610, 0.205, 0.022, '#ffd23a', '#1a5ad0'];
  function drawKite(ctx, x, y, s, c0, c1, rot, alpha, t, ph, tail) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot);
    if (tail) { ctx.strokeStyle = c0; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, s * 0.9); for (let k = 1; k <= 8; k++) ctx.lineTo(Math.sin(t * 4 + k * 0.8 + ph) * s * 0.2 * (k / 8 + 0.3), s * 0.9 + k * s * 0.22); ctx.stroke(); }
    ctx.fillStyle = c0; ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.75, 0); ctx.lineTo(0, s * 0.9); ctx.lineTo(-s * 0.75, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.75, 0); ctx.lineTo(0, 0); ctx.lineTo(-s * 0.75, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c0; ctx.beginPath(); ctx.arc(0, -s * 0.15, s * 0.16, 0, PI * 2); ctx.fill();
    ctx.fillStyle = c1; ctx.beginPath(); ctx.moveTo(-s * 0.18, s * 0.9); ctx.lineTo(s * 0.18, s * 0.9); ctx.lineTo(0, s * 0.72); ctx.closePath(); ctx.fill();   // little tail flap
    ctx.strokeStyle = 'rgba(40,20,20,0.55)'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s * 0.9); ctx.moveTo(-s * 0.75, 0); ctx.quadraticCurveTo(0, -s * 0.35, s * 0.75, 0); ctx.stroke();
    ctx.fillStyle = 'rgba(255,220,160,0.30)'; ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(-s * 0.75, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();   // sun through the paper
    ctx.restore();
  }
  function drawKites(ctx, W, H, t) {
    const m = t % SHOW, string = (x, y, x2, y2, a) => { ctx.strokeStyle = `rgba(255,235,220,${a})`; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(x, y + 3); ctx.quadraticCurveTo((x + x2) / 2 + 10, (y + y2) / 2 + 20, x2, y2); ctx.stroke(); };
    KITES.forEach(([fx, fy, fs, c0, c1, ph], i) => {
      const x = W * fx + Math.sin(t * 0.55 + ph) * 6 + Math.sin(t * 1.6 + ph) * 1.5, y = H * fy + Math.sin(t * 0.82 + ph) * 4, s = H * fs;
      if (fs >= 0.026) string(x, y, W * fx + (i % 2 ? 30 : -20), H * 0.52, 0.22);
      drawKite(ctx, x, y, s, c0, c1, Math.sin(t * 0.7 + ph) * 0.25, 1, t, ph, s > H * 0.02);
    });
    // The kite fight: two kites close in, strings cross and spark — one is cut loose and drifts away spinning; it's back by the next cycle
    const w = win(m, KITE_FIGHT);
    const ax0 = W * FIGHT_A[0], ay0 = H * FIGHT_A[1], bx0 = W * FIGHT_B[0], by0 = H * FIGHT_B[1], mx = W * 0.735, my = H * 0.170;
    let ax = ax0, ay = ay0, bx = bx0, by = by0, bAlpha = 1, bRot = 0, cut = false, spark = 0;
    if (w >= 0) {
      const approach = Math.min(1, w / CUT_AT), e = approach * approach * (3 - 2 * approach);
      ax = ax0 + (mx + W * 0.02 - ax0) * e; ay = ay0 + (my - H * 0.01 - ay0) * e;
      bx = bx0 + (mx - W * 0.02 - bx0) * e; by = by0 + (my + H * 0.01 - by0) * e;
      ax += Math.sin(t * 7) * 2 * e; bx += Math.sin(t * 6.3 + 1) * 2 * e;
      if (w > CUT_AT * 0.75 && w < CUT_AT) spark = Math.sin((w - CUT_AT * 0.75) / (CUT_AT * 0.25) * PI);
      if (w >= CUT_AT) {
        cut = true; const d = (w - CUT_AT) / (1 - CUT_AT);
        bx = mx - W * 0.02 + d * W * 0.40; by = my + H * 0.01 - Math.sin(d * PI * 1.2) * H * 0.06 + d * d * H * 0.10; bRot = d * PI * 3; bAlpha = Math.max(0, 1 - d * 1.15);
        ay = my - H * 0.01 - d * H * 0.05; ax = mx + W * 0.02 + d * W * 0.03;                 // the winner climbs
      }
    } else {
      const since = m > KITE_FIGHT[1] ? m - KITE_FIGHT[1] : m + SHOW - KITE_FIGHT[1];
      bAlpha = Math.min(1, since / 1.2);
      if (m > KITE_FIGHT[1]) { ax = ax0 + (mx + W * 0.05 - ax0) * Math.max(0, 1 - since / 3); ay = ay0 + (my - H * 0.06 - ay0) * Math.max(0, 1 - since / 3); }
    }
    const bobA = Math.sin(t * 0.9) * 3, bobB = Math.sin(t * 0.75 + 2) * 3;
    string(ax, ay + bobA, W * 1.02, H * 0.50, 0.35);
    if (!cut) string(bx, by + bobB, W * 0.48, H * 0.52, 0.35); else { ctx.strokeStyle = `rgba(255,235,220,${(0.35 * bAlpha).toFixed(3)})`; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(bx, by + 3); ctx.quadraticCurveTo(bx - 14, by + 22, bx - 8 + Math.sin(t * 5) * 4, by + 40); ctx.stroke(); }
    if (spark > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(mx, my + H * 0.07, 0, mx, my + H * 0.07, 9); g.addColorStop(0, `rgba(255,250,200,${(0.9 * spark).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(mx - 9, my + H * 0.07 - 9, 18, 18); ctx.restore(); }
    drawKite(ctx, ax, ay + bobA, H * FIGHT_A[2], FIGHT_A[3], FIGHT_A[4], Math.sin(t * 0.8) * 0.2, 1, t, 0, true);
    if (bAlpha > 0) drawKite(ctx, bx, by + bobB, H * FIGHT_B[2], FIGHT_B[3], FIGHT_B[4], bRot + Math.sin(t * 0.8 + 1) * 0.2, bAlpha, t, 1, true);
  }

  // ════════ SEARCHLIGHTS — beams sweeping the sky from the stadium (drawn behind its silhouette) ════════
  function drawSearchlights(ctx, W, H, t) {
    const a = env(win(t % SHOW, SEARCH), 0.15); if (a <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    [[0.76, 0], [0.94, 2.1]].forEach(([fx, ph]) => {
      const x = W * fx, y = H * 0.335, ang = -PI / 2 + Math.sin(t * 0.9 + ph) * 0.55, L = H * 0.55, w = 0.05;
      const g = ctx.createLinearGradient(x, y, x + Math.cos(ang) * L, y + Math.sin(ang) * L);
      g.addColorStop(0, `rgba(255,245,220,${(0.32 * a).toFixed(3)})`); g.addColorStop(1, 'rgba(255,245,220,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang - w) * L, y + Math.sin(ang - w) * L); ctx.lineTo(x + Math.cos(ang + w) * L, y + Math.sin(ang + w) * L); ctx.closePath(); ctx.fill();
    });
    ctx.restore();
  }

  // ════════ STADIUM & CITY LIGHTS — floodlights blazing on, the crowd's flashes, bulb strings over the rooftops ════════
  function drawCityLights(ctx, W, H, t) {
    const m = t % SHOW, lv = lightLevel(m);
    const glow = (x, y, r, col) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); };
    // Floodlights along the roof's lip blaze on in a sweep; light pours up out of the bowl into the dusk
    { const x0 = W * STADIUM.x0, x1 = W * STADIUM.x1;
      const u = (x) => Math.max(0, Math.min(1, (x - x0) / (x1 - x0))), rim = (x) => stadRim(x, W, H), roofB = (x) => stadRoofB(x, W, H);
      if (lv > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(W * 0.85, H * 0.34, 0, W * 0.85, H * 0.34, W * 0.26); g.addColorStop(0, `rgba(255,245,215,${(0.32 * lv).toFixed(3)})`); g.addColorStop(1, 'rgba(255,240,200,0)');
        ctx.fillStyle = g; ctx.fillRect(W * 0.58, H * 0.08, W * 0.46, H * 0.42); ctx.restore();
      }
      for (let x = x0 + 6; x < x1 - 4; x += 8) {
        const on = Math.max(0, Math.min(1, lv * 1.8 - u(x) * 0.8)); const y = roofB(x) + 1;
        ctx.fillStyle = on > 0.05 ? `rgba(255,252,236,${(0.4 + 0.6 * on).toFixed(3)})` : 'rgba(90,70,90,0.8)'; ctx.fillRect(x - 1.6, y - 0.6, 3.2, 1.6);
        if (on > 0.05) glow(x, y + 1, 7 * on, `rgba(255,248,225,${(0.5 * on).toFixed(3)})`);
      }
      // LED ribbon round the rim: colour waves rolling along it, gold when the six goes up
      const sixA = env(win(m, [SIX[0], SIX[1] + 1.2]), 0.08);
      for (let x = x0 + 2; x < x1 - 2; x += 3) {
        const y = rim(x) + 1.2, h = (x / W * 9 - t * 1.6) % 1, hue = ['255,60,140', '255,140,40', '255,220,60', '40,200,160', '60,120,255'][Math.floor(((x / W * 9 - t * 1.6) % 5 + 5) % 5)];
        ctx.fillStyle = sixA > 0 ? `rgba(255,210,60,${(0.6 + 0.4 * sixA).toFixed(3)})` : `rgba(${hue},${(0.35 + 0.45 * Math.max(lv, 0.4)).toFixed(3)})`; ctx.fillRect(x, y, 3, 1.8); void h;
      }
      // Concourse windows warming up behind the fins
      if (lv > 0) for (let x = x0 + 7; x < x1 - 4; x += 10) { const y = rim(x) + H * 0.010; ctx.fillStyle = `rgba(255,190,110,${(0.45 * lv).toFixed(3)})`; ctx.fillRect(x, y, 6, H * 0.016); ctx.fillRect(x, y + H * 0.026, 6, H * 0.010); }
      // Flags on the roof peaks, flying in the evening breeze
      for (let x = x0 + W * 0.018, k = 0; x < x1 - 4; x += W * 0.034, k++) {
        if (k === 5) continue;
        const y = roofB(x) - H * 0.010 * Math.pow(Math.sin(u(x) * PI), 0.4) - H * (0.012 + 0.008 * Math.sin(u(x) * PI)) - H * 0.014, fl = Math.sin(t * 4 + k);
        ctx.fillStyle = ['#ff8a1a', '#ffffff', '#20a840', '#1a5ad0'][k % 4]; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 4, y + fl, x + 8, y + 1 + fl * 1.5); ctx.lineTo(x + 8, y + 4 + fl * 1.5); ctx.quadraticCurveTo(x + 4, y + 3.5 + fl, x, y + 4); ctx.closePath(); ctx.fill();
      } }

    // Camera flashes twinkling round the bowl — a frenzy during the big moment
    { const frenzy = env(win(m, FLASHES), 0.1), n = 6 + 40 * frenzy;
      let seed = 17; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      for (let i = 0; i < 46; i++) { const x = W * (0.68 + rnd() * 0.32), y = H * (0.338 + rnd() * 0.045), ph = rnd() * 10, r = rnd();
        if (i > n) continue; const a = Math.pow(Math.max(0, Math.sin(t * (3 + r * 4) + ph)), 12); if (a < 0.1) continue;
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; ctx.fillRect(x - 0.7, y - 0.7, 1.4, 1.4); glow(x, y, 3.5, `rgba(255,255,255,${(0.5 * a).toFixed(3)})`); } }
    // Bulb strings swagged across the rooftops, lighting up in a ripple
    const strings = [[0.400, 0.505, 0.560, 0.490], [0.565, 0.492, 0.700, 0.515], [0.705, 0.516, 0.790, 0.500], [0.930, 0.505, 1.020, 0.520]];
    strings.forEach(([a0, b0, a1, b1], si) => {
      const x0 = W * a0, y0 = H * b0, x1 = W * a1, y1 = H * b1, sag = H * 0.020;
      ctx.strokeStyle = 'rgba(40,20,30,0.6)'; ctx.lineWidth = 0.5; ctx.beginPath(); for (let k = 0; k <= 16; k++) { const u = k / 16; ctx.lineTo(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + sag * 4 * u * (1 - u)); } ctx.stroke();
      for (let k = 1; k < 12; k++) {
        const u = k / 12, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + sag * 4 * u * (1 - u) + 1.5, order = (x / W);
        const on = Math.max(0, Math.min(1, lv * 1.6 - order * 0.6)), col = ['255,210,120', '255,140,90', '255,240,180', '120,220,255'][(k + si) % 4];
        ctx.fillStyle = on > 0.05 ? `rgba(${col},${(0.5 + 0.5 * on).toFixed(3)})` : 'rgba(80,60,60,0.6)'; ctx.beginPath(); ctx.arc(x, y, 1.1, 0, PI * 2); ctx.fill();
        if (on > 0.05) glow(x, y, 4, `rgba(${col},${(0.45 * on).toFixed(3)})`);
      }
    });
  }

  // ════════ GARDEN LIFE — the pool shimmering, parakeets skimming it ════════
  function drawGardenLife(ctx, W, H, t) {
    const m = t % SHOW, cx = W * TAJ.cx, farY = H * VYF + 1, nearY = H * 0.618;
    for (let k = 0; k < 14; k++) {
      const f = ((k * 0.37) % 1), y = farY + (nearY - farY) * f, hw = W * (0.016 + 0.054 * f) * 0.8, a = 0.25 + 0.35 * Math.sin(t * (1.2 + k * 0.2) + k);
      const x = cx + Math.sin(t * 0.8 + k * 2.1) * hw * 0.6;
      ctx.fillStyle = `rgba(255,236,200,${Math.max(0, a).toFixed(3)})`; ctx.fillRect(x - hw * 0.25, y, hw * 0.5, 0.8);
    }
    const w = win(m, PARROTS);
    if (w >= 0) {
      for (let i = 0; i < 7; i++) {
        const lag = i * 0.04, f = Math.max(0, Math.min(1, w * 1.3 - lag)); if (f <= 0 || f >= 1) continue;
        const x = W * (0.62 - f * 0.70) + (i % 3) * 5, y = H * (0.525 + 0.03 * Math.sin(f * PI * 1.4) + (i % 4) * 0.008), s = H * 0.010, fl = Math.sin(t * 22 + i);
        ctx.fillStyle = '#3ac850'; ctx.beginPath(); ctx.ellipse(x, y, s, s * 0.35, -0.1, 0, PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x + s * 0.3, y); ctx.lineTo(x + s * 0.1, y - s * 1.3 * fl); ctx.lineTo(x - s * 0.4, y); ctx.fill();
        ctx.strokeStyle = '#3ac850'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(x + s, y); ctx.lineTo(x + s * 2.2, y + s * 0.2); ctx.stroke();
        ctx.fillStyle = '#e83a2a'; ctx.fillRect(x - s * 1.0, y - 0.5, 1.2, 1);
      }
    }
  }

  // ════════ FRONT LIFE — oil lamps along the parapet, bulbs, the chai's coals and steam, our kite on its string ════════
  function drawFrontLife(ctx, W, H, t) {
    const m = t % SHOW, lv = lightLevel(m), PAR = H * 0.596;
    const glow = (x, y, r, col) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); };
    // Diyas: little clay lamps with dancing flames
    for (let x = W * 0.030; x < W; x += W * 0.064) {
      if (x > W * 0.37 && x < W * 0.63) continue;
      const fl = 0.75 + 0.15 * Math.sin(t * 9 + x) + 0.10 * Math.sin(t * 23 + x * 2), y = PAR - 2.5;
      ctx.fillStyle = '#b8603a'; ctx.beginPath(); ctx.ellipse(x, y, 4, 1.8, 0, 0, PI); ctx.fill(); ctx.fillStyle = '#d8804a'; ctx.beginPath(); ctx.ellipse(x, y, 4, 1.2, 0, PI, 0); ctx.fill();
      glow(x + 1.5, y - 3, 9 * fl, `rgba(255,180,80,${(0.45 * fl).toFixed(3)})`);
      ctx.fillStyle = `rgba(255,${210 + 30 * fl | 0},120,0.95)`; ctx.beginPath(); ctx.moveTo(x + 1.5, y - 1); ctx.quadraticCurveTo(x + 3.5, y - 3.5, x + 1.5 + Math.sin(t * 8 + x) * 0.6, y - 4 - 3 * fl); ctx.quadraticCurveTo(x - 0.5, y - 3.5, x + 1.5, y - 1); ctx.fill();
    }

  }

  // ════════ THE SETTING SUN, THE RISING MOON, DUSK FALLING ════════
  function drawSun(ctx, W, H, t) {
    const lv = lightLevel(t % SHOW), x = W * SUNP.x, y = H * (SUNP.y + 0.075 * lv), r = H * SUNP.r;
    const glow = (gx, gy, gr, col) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2); ctx.restore(); };
    glow(x, y, W * 0.30, `rgba(255,200,110,${(0.55 - 0.25 * lv).toFixed(3)})`);
    glow(x, y, H * 0.16, 'rgba(255,240,190,0.70)');
    const sd = ctx.createRadialGradient(x, y, 0, x, y, r); sd.addColorStop(0, '#fffbe6'); sd.addColorStop(0.65, '#ffe8a0'); sd.addColorStop(1, lv > 0.5 ? '#ff9a40' : '#ffb850');
    ctx.fillStyle = sd; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill();
  }
  function drawMoon(ctx, W, H, t) {
    const lv = lightLevel(t % SHOW), a = 0.20 + 0.75 * lv, x = W * 0.885, y = H * 0.075, r = H * 0.024;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3); g.addColorStop(0, `rgba(255,250,230,${(0.35 * a).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.clip();
    ctx.beginPath(); ctx.rect(x - r - 1, y - r - 1, r * 2 + 2, r * 2 + 2); ctx.arc(x + r * 0.45, y - r * 0.18, r * 0.92, 0, PI * 2);
    ctx.fillStyle = `rgba(255,248,225,${a.toFixed(3)})`; ctx.fill('evenodd'); ctx.restore();
  }
  function drawDusk(ctx, W, H, t, y0, y1, k) {
    const lv = lightLevel(t % SHOW); if (lv <= 0) return;
    ctx.fillStyle = `rgba(40,14,70,${(k * lv).toFixed(3)})`; ctx.fillRect(0, H * y0, W, H * (y1 - y0));
  }
  // Black kites (the birds) wheeling high over the city
  function drawRaptors(ctx, W, H, t) {
    for (let i = 0; i < 5; i++) {
      const a = t * (0.28 + i * 0.03) + i * 1.3, x = W * 0.70 + Math.cos(a) * W * (0.09 + i * 0.012), y = H * 0.135 + Math.sin(a) * H * 0.035, s = H * 0.016;
      const tilt = Math.cos(a) * 0.3, flap = (Math.sin(t * 0.7 + i * 2) > 0.85) ? Math.sin(t * 9 + i) : 0.15;
      ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
      ctx.fillStyle = 'rgba(40,20,40,0.85)';
      ctx.beginPath(); ctx.moveTo(-s * 1.7, -s * 0.15 - s * 0.5 * flap); ctx.quadraticCurveTo(-s * 0.7, -s * 0.35 - s * 0.6 * flap, 0, 0); ctx.quadraticCurveTo(s * 0.7, -s * 0.35 - s * 0.6 * flap, s * 1.7, -s * 0.15 - s * 0.5 * flap);
      ctx.quadraticCurveTo(s * 0.7, s * 0.05, 0, s * 0.18); ctx.quadraticCurveTo(-s * 0.7, s * 0.05, -s * 1.7, -s * 0.15 - s * 0.5 * flap); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-s * 0.16, s * 0.1); ctx.lineTo(-s * 0.24, s * 0.65); ctx.lineTo(0, s * 0.50); ctx.lineTo(s * 0.24, s * 0.65); ctx.lineTo(s * 0.16, s * 0.1); ctx.fill();   // the forked tail
      ctx.restore();
    }
  }
  // Rowing boats drifting on the river
  function drawBoats(ctx, W, H, t) {
    [[47, 0.10, 0.566, 1, '#c8302a'], [61, 0.55, 0.584, -1, '#1a8ad0']].forEach(([per, ph, fy, dir, col]) => {
      const f = ((t / per) + ph) % 1, x = dir > 0 ? W * (0.36 + f * 0.70) : W * (1.06 - f * 0.70), y = H * fy + Math.sin(t * 1.3 + ph * 9) * 0.6, s = H * 0.030;
      const a = Math.min(1, (x - W * 0.36) / (W * 0.04), (W * 1.04 - x) / (W * 0.04)); if (a <= 0) return;
      ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.translate(x, y); ctx.scale(dir, 1);
      ctx.fillStyle = 'rgba(40,10,40,0.30)'; ctx.fillRect(-s * 0.8, 1, s * 1.6, 1.4);
      ctx.fillStyle = '#5a3018'; ctx.beginPath(); ctx.moveTo(-s * 0.9, -s * 0.18); ctx.lineTo(s * 0.9, -s * 0.22); ctx.quadraticCurveTo(s * 0.7, 0, s * 0.5, 0); ctx.lineTo(-s * 0.6, 0); ctx.quadraticCurveTo(-s * 0.8, 0, -s * 0.9, -s * 0.18); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-s * 0.35, -s * 0.20); ctx.quadraticCurveTo(-s * 0.1, -s * 0.62, s * 0.25, -s * 0.20); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,220,180,0.7)'; ctx.fillRect(-s * 0.9, -s * 0.20, s * 1.8, 0.7);
      ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 0.7; const row = Math.sin(t * 2.4 + ph * 5) * 0.4; ctx.beginPath(); ctx.moveTo(s * 0.4, -s * 0.2); ctx.lineTo(s * 0.4 + Math.cos(row + 0.6) * s * 0.7, Math.sin(row + 0.6) * s * 0.35); ctx.stroke();
      ctx.restore();
    });
  }
  // Sky lanterns: once the lights are on, glowing paper lanterns rise from the rooftops and drift up into the dusk
  function drawLanterns(ctx, W, H, t) {
    const m = t % SHOW;
    let seed = 53; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < 12; i++) {
      const st = 6.0 + i * 1.05, dur = 7.6, x0 = rnd() < 0.3 ? W * (0.04 + rnd() * 0.28) : W * (0.42 + rnd() * 0.56), ph = rnd() * 6, sz = 3 + rnd() * 2;
      const f = (m - st) / dur; if (f < 0 || f > 1) continue;
      const x = x0 - f * W * 0.06 + Math.sin(f * 7 + ph) * 4, y = H * (0.50 - f * 0.46), a = Math.min(1, f / 0.08, (1 - f) / 0.25), s = sz * (1 - f * 0.45);
      const fl = 0.8 + 0.2 * Math.sin(t * 7 + ph);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, s * 4.5); g.addColorStop(0, `rgba(255,170,70,${(0.55 * a * fl).toFixed(3)})`); g.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = g; ctx.fillRect(x - s * 4.5, y - s * 4.5, s * 9, s * 9); ctx.restore();
      ctx.fillStyle = `rgba(255,${200 + 40 * fl | 0},130,${a.toFixed(3)})`; ctx.beginPath(); ctx.moveTo(x - s * 0.7, y - s); ctx.lineTo(x + s * 0.7, y - s); ctx.lineTo(x + s * 0.5, y + s * 0.8); ctx.lineTo(x - s * 0.5, y + s * 0.8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgba(255,255,220,${(0.9 * a).toFixed(3)})`; ctx.fillRect(x - s * 0.25, y + s * 0.3, s * 0.5, s * 0.4);
    }
  }
  // THE SIX: a ball rockets up out of the floodlit bowl and sails out over the city, trailing light
  function drawSix(ctx, W, H, t) {
    const w = win(t % SHOW, SIX); if (w < 0) return;
    const P0 = [W * 0.84, H * 0.345], C = [W * 0.70, -H * 0.32], P1 = [W * 0.52, -H * 0.12];
    const at = (u) => [(1 - u) ** 2 * P0[0] + 2 * (1 - u) * u * C[0] + u * u * P1[0], (1 - u) ** 2 * P0[1] + 2 * (1 - u) * u * C[1] + u * u * P1[1]];
    const u = Math.min(1, w * 1.1);
    const glow = (gx, gy, gr, col) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2); ctx.restore(); };
    if (w < 0.12) glow(P0[0], P0[1], H * 0.12 * (1 - w / 0.12), 'rgba(255,250,220,0.85)');          // the crack of bat on ball, a flash in the bowl
    for (let k = 18; k >= 0; k--) {
      const uu = u - k * 0.012; if (uu < 0) continue;
      const [x, y] = at(uu), a = (1 - k / 18) * 0.8;
      ctx.fillStyle = `rgba(255,${200 + k * 2},${120 + k * 5},${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, 2.6 * (1 - k / 22), 0, PI * 2); ctx.fill();
    }
    const [bx, by] = at(u);
    if (by > -10) { glow(bx, by, 12, 'rgba(255,240,200,0.7)'); ctx.fillStyle = '#d82020'; ctx.beginPath(); ctx.arc(bx, by, 3, 0, PI * 2); ctx.fill(); ctx.strokeStyle = 'rgba(255,240,220,0.9)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.arc(bx, by, 2, -0.5, 1.8); ctx.stroke(); }
  }
  // The billboard comes alive: bulbs chasing round its edge after dark, and a flashing "SIX!" when the ball flies
  function drawBillboardLife(ctx, W, H, t) {
    const m = t % SHOW, lv = lightLevel(m), bx = W * BILL.x, by = H * BILL.y, bw = W * BILL.w, bh = H * BILL.h;
    const sixA = env(win(m, [SIX[0] + 0.3, SIX[1] + 1.4]), 0.08);
    if (sixA > 0 && Math.sin(t * 22) > -0.3) {
      ctx.save(); ctx.globalAlpha = sixA;
      ctx.fillStyle = '#0a1a5a'; ctx.fillRect(bx + bw * 0.30, by + 1, bw * 0.69, bh - 2);
      ctx.font = `900 ${bh * 0.78}px 'Barlow Condensed', 'Arial Narrow', sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffd23a'; ctx.fillText('SIX!', bx + bw * 0.65, by + bh * 0.54);
      ctx.restore();
    }
    if (lv <= 0) return;
    const per = 2 * (bw + bh), n = 30;
    for (let k = 0; k < n; k++) {
      let d = (k / n) * per, x, y;
      if (d < bw) { x = bx + d; y = by; } else if ((d -= bw) < bh) { x = bx + bw; y = by + d; } else if ((d -= bh) < bw) { x = bx + bw - d; y = by + bh; } else { d -= bw; x = bx; y = by + bh - d; }
      const on = ((k + Math.floor(t * 9)) % 3 === 0) ? 1 : 0.25, a = lv * on;
      ctx.fillStyle = `rgba(255,${on > 0.5 ? 230 : 160},120,${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(x, y, 1.1, 0, PI * 2); ctx.fill();
    }
  }
  // The Taj's dome breathes with the last of the sun
  function drawTajGlow(ctx, W, H, t) {
    const lv = lightLevel(t % SHOW), x = W * TAJ.cx - W * 0.02, y = H * 0.27, a = (0.22 + 0.06 * Math.sin(t * 0.9)) * (1 - 0.6 * lv);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, W * 0.09); g.addColorStop(0, `rgba(255,190,120,${a.toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - W * 0.09, y - W * 0.09, W * 0.18, W * 0.18); ctx.restore();
  }

  // ════════ THE TRICOLOUR — India's flag flying from a tall mast on the stadium's central roof peak ════════
  function drawIndiaFlag(ctx, W, H, t) {
    const px = W * 0.823, base = H * 0.326, top = H * 0.125, fw = W * 0.078, fh = fw * 2 / 3;
    ctx.strokeStyle = '#d8d0d8'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(px, base); ctx.lineTo(px, top - 3); ctx.stroke();
    ctx.fillStyle = '#f2c860'; ctx.beginPath(); ctx.arc(px, top - 3.5, 1.6, 0, PI * 2); ctx.fill();
    const N = 22, wave = (u) => Math.sin(u * 5.2 - t * 4.6) * fh * 0.10 * u, shade = (u) => 0.85 + 0.15 * Math.cos(u * 5.2 - t * 4.6);
    const bands = ['255,153,51', '255,255,255', '19,136,8'];
    for (let i = 0; i < N; i++) {
      const u0 = i / N, u1 = (i + 1) / N, x0 = px + fw * u0, x1 = px + fw * u1 + 0.6, k = shade((u0 + u1) / 2);
      bands.forEach((c, b) => {
        const y0a = top + fh * b / 3 + wave(u0), y1a = top + fh * (b + 1) / 3 + wave(u0), y0b = top + fh * b / 3 + wave(u1), y1b = top + fh * (b + 1) / 3 + wave(u1);
        const rgb = c.split(',').map(v => Math.round(+v * k)).join(',');
        ctx.fillStyle = `rgb(${rgb})`; ctx.beginPath(); ctx.moveTo(x0, y0a); ctx.lineTo(x1, y0b); ctx.lineTo(x1, y1b); ctx.lineTo(x0, y1a); ctx.closePath(); ctx.fill();
      });
    }
    // The Ashoka Chakra: a navy wheel of 24 spokes in the centre of the white band
    const cu = 0.5, cx = px + fw * cu, cy = top + fh / 2 + wave(cu), r = fh / 6 * 0.92;
    ctx.strokeStyle = '#06038d'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(cx, cy, r, 0, PI * 2); ctx.stroke();
    ctx.lineWidth = 0.35; for (let k = 0; k < 24; k++) { const a = k * PI / 12; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke(); }
    ctx.fillStyle = '#06038d'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.18, 0, PI * 2); ctx.fill();
  }

  // ════════ PAINT — sky → searchlights → Taj, garden, city → lights → pool life → kites → rooftop → lamps → cup → haze ════════
  // (canvas passed in)
  const ctx = cvs.getContext('2d');
  const SCRATCH = document.createElement('canvas').getContext('2d');
  const skyL = document.createElement('canvas'); skyL.width = 620; skyL.height = 355;
  const back = document.createElement('canvas'); back.width = 620; back.height = 355;
  const front = document.createElement('canvas'); front.width = 620; front.height = 355;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TURN_SECONDS = 13.1;
  function paintBase() {
    const k = skyL.getContext('2d'); k.clearRect(0, 0, 620, 355); draw(k, 620, 355, 'sky');
    const b = back.getContext('2d'); b.clearRect(0, 0, 620, 355); draw(b, 620, 355, 'back');
    const f = front.getContext('2d'); f.clearRect(0, 0, 620, 355); draw(f, 620, 355, 'front');
  }
  function frame(ms) {
    const t = reduceMotion ? 0 : ms / 1000;
    const phi = (t / TURN_SECONDS) * Math.PI * 2;
    ctx.clearRect(0, 0, 620, 355);
    ctx.drawImage(skyL, 0, 0);
    drawSun(ctx, 620, 355, t);
    drawDusk(ctx, 620, 355, t, 0, 0.62, 0.30);
    drawMoon(ctx, 620, 355, t);
    drawSearchlights(ctx, 620, 355, t);
    drawRaptors(ctx, 620, 355, t);
    ctx.drawImage(back, 0, 0);
    drawTajGlow(ctx, 620, 355, t);
    drawDusk(ctx, 620, 355, t, 0.36, 0.62, 0.18);
    drawBoats(ctx, 620, 355, t);
    drawCityLights(ctx, 620, 355, t);
    drawIndiaFlag(ctx, 620, 355, t);
    drawBillboardLife(ctx, 620, 355, t);
    drawGardenLife(ctx, 620, 355, t);
    drawLanterns(ctx, 620, 355, t);
    drawSix(ctx, 620, 355, t);
    drawKites(ctx, 620, 355, t);
    ctx.drawImage(front, 0, 0);
    drawDusk(ctx, 620, 355, t, 0.596, 1.0, 0.16);
    drawFrontLife(ctx, 620, 355, t);
    drawTrophy(ctx, 620, 355, phi, t);
    drawAtmos(ctx, 620, 355);
  }
  function loop(ms) { if (!__running) return; __elapsed = ms - __t0; __frame(__elapsed); requestAnimationFrame(loop); }
  paintBase(); __frame(0);
  let repainted = false;
  const repaint = () => { if (!repainted) { repainted = true; paintBase(); __frame(__elapsed); } };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(repaint).catch(() => {});
  setTimeout(repaint, 2000);
  return {
    start() { if (__running) return; if (reduceMotion) { __frame(0); return; } __running = true; __t0 = performance.now() - __elapsed; requestAnimationFrame(loop); },
    stop() { __running = false; },
  };
}
const LEAGUE_LIVE_ART = {
  'GULLY CUP': makeLeagueArt_gully,
  'FLOODLIT SERIES': makeLeagueArt_floodlit,
  'COASTAL CUP': makeLeagueArt_coastal,
  'FAIRGROUND CUP': makeLeagueArt_fairground,
  'ECL': makeLeagueArt_ecl,
  'ACL': makeLeagueArt_acl,
  'DESERT LEAGUE': makeLeagueArt_desert,
  'LCL': makeLeagueArt_asian,
  'ICL': makeLeagueArt_icl,
};
// Only the centred card animates; everything stops when the league screen is hidden or the app is backgrounded
window.__leagueArt = [];
function syncLeagueArt(activeIdx) {
  const scr = document.getElementById('leagueScreen');
  const visible = scr && !scr.classList.contains('hidden') && !document.hidden;
  window.__leagueArt.forEach((a, i) => { if (!a) return; if (visible && i === activeIdx) a.start(); else a.stop(); });
}
window.__leagueActiveIdx = 0;
document.addEventListener('visibilitychange', () => syncLeagueArt(window.__leagueActiveIdx));
(function () {
  const scr = document.getElementById('leagueScreen');
  if (scr && 'MutationObserver' in window) new MutationObserver(() => syncLeagueArt(window.__leagueActiveIdx)).observe(scr, { attributes: true, attributeFilter: ['class'] });
})();
