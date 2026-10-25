import base64
D='/tmp/claude-0/sp/pir/'
def u(f,mime='image/webp'): return f'data:{mime};base64,'+base64.b64encode(open(D+f,'rb').read()).decode()
from PIL import Image
Image.open(D+'nobails.png').save(D+'nobails.webp','WEBP',quality=90)
bb=eval(open(D+'palm_bbox.txt').read())
js = r'''
const PI = Math.PI;
const SHOW = 24.0;                         // shared schedule length, seconds
const BROADSIDE = [2.0, 4.2];              // headline 1: the galleon fires a rolling broadside
const BALL = [12.6, 13.55];                // headline 2: one cannon fires a cricket ball that clips the stumps
const HOWZAT = [13.55, 16.4];
const BAILS_BACK = [21.0, 21.6];
const GLINT = [18.2, 19.6];                // the sun catches the hoard
const GULLS = [6.0, 15.0];
const W = 620, H = 355, S = 355 / 768, OX = (620 - 1376 * S) / 2;
const px = x => OX + x * S, py = y => y * S;          // painted-plate pixels → card
const win = (m, [a, b]) => m >= a && m <= b ? (m - a) / (b - a) : -1;
const env = (w, k = 0.15) => w < 0 ? 0 : Math.min(1, w / k, (1 - w) / k);
const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const SRC = { bg:'@BG@', ship:'@SHIP@', chest:'@CHEST@', parrot:'@PARROT@', palm:'@PALM@', nob:'@NOB@' };
const IM = {}; let __loaded = 0, __last = 0;
Object.keys(SRC).forEach(k => { const i = new Image(); i.onload = () => { if (++__loaded === 6) { try { (typeof __frame === 'function' ? __frame : frame)(__last); } catch (e) {} } }; i.src = SRC[k]; IM[k] = i; });
const ok = i => i && i.complete && i.naturalWidth;

// layout (card px)
const SHIP = { cx: 458, wl: 190, w: 168 };                  // galleon, anchored out in the cove
SHIP.h = SHIP.w * 722 / 1070;
const CHEST = { cx: 306, by: 268, w: 186 }; CHEST.h = CHEST.w * 936 / 928;
const PALM = { x: px(@PX0@), y: py(@PY0@), w: (@PX1@ - @PX0@) * S, h: (@PY1@ - @PY0@) * S };
const STUMPS = [342, 369, 399].map(px), STUMP_TOP = py(538), BAIL_Y = py(533);
const SUNP = { x: px(965), y: py(300) }, HZ = py(340);
const SHORE = [[600,472],[700,490],[800,503],[900,515],[1000,522],[1100,530],[1200,540],[1300,545],[1380,548]].map(([x, y]) => [px(x), py(y)]);
const FIRE = { x: px(275), y: py(442) }, FALL = { x0: px(533), x1: px(566), y0: py(232), y1: py(420) };

const cvs = document.getElementById('c');
const ctx = cvs.getContext('2d');
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function paintBase() {}

// seeded bits
const R = rnd(7);
const SPARK = Array.from({ length: 46 }, () => { const nearSun = R() < 0.65; return { x: nearSun ? SUNP.x - 60 + R() * 120 * (0.6 + R()) : 320 + R() * 300, y: HZ + 2 + R() * (nearSun ? 70 : 60), f: 1.5 + R() * 3, p: R() * 9, s: 0.6 + R() * 1.2 }; });
const COINT = Array.from({ length: 14 }, () => ({ x: 0.18 + R() * 0.72, y: 0.37 + R() * 0.21, f: 0.7 + R() * 1.4, p: R() * 9, s: 0.7 + R() * 0.8 }));
const PORTS = [0.407, 0.475, 0.540, 0.613, 0.675, 0.733, 0.793];
const SHOTS = PORTS.map((x, i) => ({ x, at: BROADSIDE[0] + i * 0.28 + (R() - 0.5) * 0.12, drift: 8 + R() * 10, rise: 10 + R() * 12, big: 1.3 + R() * 0.7, sx: SHIP.cx - 150 - R() * 120, sy: HZ + 12 + R() * 20 }));
const PUFFS = SHOTS.map(s => Array.from({ length: 8 }, () => ({ dx: (R() - 0.5) * 14, dy: (R() - 0.5) * 8, r: 6 + R() * 7, life: 2.2 + R() * 1.6, dl: R() * 0.25 })));
const EMB = Array.from({ length: 7 }, () => ({ p: R(), x: (R() - 0.5) * 8, sp: 0.7 + R() * 0.6 }));

function shipXY(t) { return { y: Math.sin(t * 1.25) * 1.1, r: Math.sin(t * 0.9 + 0.6) * 0.010 }; }
function shipPt(rx, ry, t) {   // a point on the ship sprite (0..1) → card, following the bob
  const b = shipXY(t), x0 = -SHIP.w / 2 + rx * SHIP.w, y0 = -SHIP.h * 0.94 + ry * SHIP.h;
  return { x: SHIP.cx + x0 * Math.cos(b.r) - y0 * Math.sin(b.r), y: SHIP.wl + b.y + x0 * Math.sin(b.r) + y0 * Math.cos(b.r) };
}
function drawShip(t) {
  if (!ok(IM.ship)) return;
  const b = shipXY(t);
  // reflection: flipped, squashed, in wavy strips
  ctx.save(); ctx.beginPath(); ctx.rect(SHIP.cx - SHIP.w, SHIP.wl, SHIP.w * 2, 40); ctx.clip(); ctx.globalAlpha = 0.22;
  for (let k = 0; k < 14; k++) {
    const sy = SHIP.h * (0.94 - k * 0.05), hh = SHIP.h * 0.05, off = Math.sin(t * 2.2 + k * 0.9) * 1.6;
    if (sy < 0) break;
    ctx.drawImage(IM.ship, 0, (sy / SHIP.h) * IM.ship.naturalHeight, IM.ship.naturalWidth, (hh / SHIP.h) * IM.ship.naturalHeight,
      SHIP.cx - SHIP.w / 2 + off, SHIP.wl + k * hh * 0.5, SHIP.w, hh * 0.5);
  }
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, SHIP.wl + b.y + 0.5); ctx.clip();
  ctx.translate(SHIP.cx, SHIP.wl + b.y); ctx.rotate(b.r);
  ctx.drawImage(IM.ship, -SHIP.w / 2, -SHIP.h * 0.94, SHIP.w, SHIP.h);
  ctx.restore();
  // foam where the hull meets the sea
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) { const ph = t * 1.6 + k * 2; ctx.globalAlpha = 0.35 + 0.25 * Math.sin(ph);
    ctx.beginPath(); const a = SHIP.cx - SHIP.w * 0.36 + k * 6, bx = SHIP.cx + SHIP.w * 0.42 - k * 5;
    for (let x = a; x <= bx; x += 4) ctx.lineTo(x, SHIP.wl + b.y + 1 + k * 1.6 + Math.sin(x * 0.35 + ph) * 0.6); ctx.stroke(); }
  ctx.restore();
  // stern lanterns flicker
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  [[0.954, 0.533], [0.987, 0.568], [0.917, 0.555]].forEach(([rx, ry], i) => {
    const p = shipPt(rx, ry, t), a = 0.45 + 0.25 * Math.sin(t * 7 + i * 2) * Math.sin(t * 3.1 + i);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 7); g.addColorStop(0, `rgba(255,210,120,${a})`); g.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = g; ctx.fillRect(p.x - 7, p.y - 7, 14, 14); });
  ctx.restore();
}
function drawCannon(t, m, loops) {
  ctx.save();
  SHOTS.forEach((s, i) => {
    let dt = m - s.at; if (dt < 0 && loops > 0) dt += SHOW;    // smoke from last loop's broadside keeps drifting
    if (dt < 0) return;
    const p = shipPt(s.x, 0.897, t);
    if (dt < 0.18) {   // muzzle flash
      const a = 1 - dt / 0.18; ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16 * s.big); g.addColorStop(0, `rgba(255,250,210,${a})`); g.addColorStop(0.35, `rgba(255,170,60,${a * 0.8})`); g.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x - 6, p.y, 16 * s.big, 0, PI * 2); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
    }
    PUFFS[i].forEach(q => {   // smoke drifts downwind (left) and rises
      const u = (dt - q.dl) / q.life; if (u < 0 || u > 1) return;
      const r = q.r * s.big * (0.6 + u * 2.4), x = p.x - 8 + q.dx - s.drift * u * 3 - u * 14, y = p.y + q.dy - s.rise * u * 1.4;
      const a = 0.8 * (1 - u) * Math.min(1, u * 8);
      const g = ctx.createRadialGradient(x, y - r * 0.3, 0, x, y, r); g.addColorStop(0, `rgba(255,244,230,${a})`); g.addColorStop(0.6, `rgba(225,205,200,${a * 0.75})`); g.addColorStop(1, 'rgba(200,180,190,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill();
    });
    const su = (dt - 0.7) / 0.9;   // splash out in the cove
    if (su > 0 && su < 1 && dt < SHOW) { const a = (1 - su) * 0.8, hgt = 14 * Math.sin(su * PI) * s.big;
      ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.beginPath(); ctx.ellipse(s.sx, s.sy - hgt / 2, 2.5 + su * 3, hgt / 2 + 0.5, 0, 0, PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${a * 0.7})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(s.sx, s.sy, 4 + su * 14, 1 + su * 3, 0, 0, PI * 2); ctx.stroke(); }
  });
  ctx.restore();
}
function drawSea(t) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const sg = 0.16 + 0.06 * Math.sin(t * 0.7);   // sun breathes
  const g = ctx.createRadialGradient(SUNP.x, SUNP.y, 0, SUNP.x, SUNP.y, 90); g.addColorStop(0, `rgba(255,230,170,${sg})`); g.addColorStop(1, 'rgba(255,160,80,0)');
  ctx.fillStyle = g; ctx.fillRect(SUNP.x - 90, SUNP.y - 90, 180, 180);
  SPARK.forEach(s => { const a = Math.pow(Math.max(0, Math.sin(t * s.f + s.p)), 10); if (a < 0.02) return;
    const k = s.s * (1 + (s.y - HZ) / 60); ctx.fillStyle = `rgba(255,245,215,${a * 0.9})`;
    ctx.fillRect(s.x - 3 * k, s.y - 0.4, 6 * k, 0.8); ctx.fillRect(s.x - 0.4, s.y - 1.6 * k, 0.8, 3.2 * k); });
  ctx.restore();
  // swell lines rolling in toward the beach
  ctx.save(); ctx.beginPath(); ctx.moveTo(px(700), HZ + 1); ctx.lineTo(W, HZ + 1); SHORE.slice().reverse().forEach(([x, y]) => ctx.lineTo(x, y - 3)); ctx.closePath(); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.20)'; ctx.lineWidth = 1;
  for (let k = 0; k < 5; k++) { const u = ((t * 0.045 + k / 5) % 1), y = HZ + 6 + u * u * 70, a = Math.sin(u * PI) * 0.35;
    ctx.globalAlpha = a; ctx.beginPath(); for (let x = 300; x <= W; x += 6) ctx.lineTo(x, y + Math.sin(x * 0.04 + k * 2 + t * 0.6) * (1 + u * 2)); ctx.stroke(); }
  ctx.restore();
}
function drawShore(t) {   // the wash runs up the sand and slides back
  const u = (Math.sin(t * 0.9) + 1) / 2, reach = 2 + u * 7;
  ctx.save();
  ctx.beginPath(); SHORE.forEach(([x, y], i) => i ? ctx.lineTo(x, y - 2) : ctx.moveTo(x, y - 2));
  for (let i = SHORE.length - 1; i >= 0; i--) { const [x, y] = SHORE[i]; ctx.lineTo(x, y + reach + Math.sin(x * 0.07 + t) * 1.2); }
  ctx.closePath(); ctx.fillStyle = `rgba(120,215,220,${0.22 + 0.12 * u})`; ctx.fill();
  ctx.beginPath(); SHORE.forEach(([x, y], i) => { const yy = y + reach + Math.sin(x * 0.07 + t) * 1.2; i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); });
  ctx.strokeStyle = `rgba(255,255,255,${0.45 + 0.3 * (1 - u)})`; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.restore();
}
function drawFall(t) {   // waterfall streaks and mist
  ctx.save(); ctx.beginPath(); ctx.rect(FALL.x0 + 2, FALL.y0, FALL.x1 - FALL.x0 - 6, FALL.y1 - FALL.y0); ctx.clip();
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.1;
  for (let k = 0; k < 9; k++) { const x = FALL.x0 + 3 + (k * 7.3) % (FALL.x1 - FALL.x0 - 7), L = FALL.y1 - FALL.y0, y = FALL.y0 + ((t * 55 + k * 23) % (L + 20)) - 10;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.4, y + 9); ctx.stroke(); }
  ctx.restore();
  ctx.save(); for (let k = 0; k < 5; k++) { const u = (t * 0.6 + k / 5) % 1, x = (FALL.x0 + FALL.x1) / 2 + 4 + (k - 2) * 4 + u * 6, y = FALL.y1 - u * 8, r = 3 + u * 7;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,255,255,${0.35 * (1 - u)})`); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  ctx.restore();
}
function drawFire(t) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const f = 0.55 + 0.2 * Math.sin(t * 9) * Math.sin(t * 5.3 + 1) + 0.1 * Math.sin(t * 17);
  let g = ctx.createRadialGradient(FIRE.x, FIRE.y - 3, 0, FIRE.x, FIRE.y - 3, 34); g.addColorStop(0, `rgba(255,170,70,${0.42 * f})`); g.addColorStop(1, 'rgba(255,100,30,0)');
  ctx.fillStyle = g; ctx.fillRect(FIRE.x - 34, FIRE.y - 37, 68, 68);
  EMB.forEach(e => { const u = (t * 0.5 * e.sp + e.p) % 1, x = FIRE.x + e.x + Math.sin(u * 9 + e.p * 9) * 3, y = FIRE.y - 4 - u * 26;
    ctx.fillStyle = `rgba(255,200,110,${(1 - u) * 0.9})`; ctx.fillRect(x, y, 1.2, 1.2); });
  ctx.restore();
}
function drawGulls(m) {
  const w = win(m, GULLS); if (w < 0) return;
  ctx.save(); ctx.strokeStyle = 'rgba(70,45,60,0.75)'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
  [[0, 0, 1], [14, 7, 0.8]].forEach(([dx, dy, s], i) => {
    const x = -20 + w * (W + 60) * 0.98 - dx, y = 52 + dy + Math.sin(w * 7 + i) * 4, f = Math.sin(m * 9 + i * 1.7) * 3.2 * s;   // both wings rise and fall together
    ctx.beginPath(); ctx.moveTo(x - 7 * s, y - f); ctx.quadraticCurveTo(x - 3 * s, y - 1 - f * 0.4, x, y); ctx.quadraticCurveTo(x + 3 * s, y - 1 - f * 0.4, x + 7 * s, y - f); ctx.stroke(); });
  ctx.restore();
}
function drawBallAndWicket(t, m, part) {
  const w = part === 'ball' ? win(m, BALL) : -1;
  const p0 = shipPt(0.277, 0.717, t), p1 = { x: STUMPS[1] + 2, y: STUMP_TOP + 3 };
  if (w >= 0) {
    if (w < 0.08) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const a = 1 - w / 0.08;
      const g = ctx.createRadialGradient(p0.x, p0.y, 0, p0.x, p0.y, 14); g.addColorStop(0, `rgba(255,250,210,${a})`); g.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = g; ctx.fillRect(p0.x - 14, p0.y - 14, 28, 28); ctx.restore(); }
    const x = p0.x + (p1.x - p0.x) * w, y = p0.y + (p1.y - p0.y) * w - Math.sin(w * PI) * 95, r = 2.6 + w * 3.4;
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = r * 0.8; ctx.lineCap = 'round';
    const wb = Math.max(0, w - 0.06), xb = p0.x + (p1.x - p0.x) * wb, yb = p0.y + (p1.y - p0.y) * wb - Math.sin(wb * PI) * 95;
    ctx.beginPath(); ctx.moveTo(xb, yb); ctx.lineTo(x, y); ctx.stroke();
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 0, x, y, r); g.addColorStop(0, '#ff7a6a'); g.addColorStop(0.6, '#c21a1a'); g.addColorStop(1, '#6e0909');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill();
    ctx.strokeStyle = '#f3e6c8'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(x, y, r * 0.8, m * 14, m * 14 + 1.6); ctx.stroke();
    ctx.restore();
  }
  if (part === 'ball') return;
  // bails off from the hit until they're put back
  const hit = m >= BALL[1] && m < BAILS_BACK[1];
  if (hit) {
    if (ok(IM.nob)) { const bw = 100 * S, bh = 36 * S; const fade = m < BAILS_BACK[0] ? 1 : 1 - (m - BAILS_BACK[0]) / (BAILS_BACK[1] - BAILS_BACK[0]);
      ctx.save(); ctx.globalAlpha = fade; ctx.drawImage(IM.nob, px(318), py(520), bw, bh);
      STUMPS.forEach(x => { const g = ctx.createLinearGradient(x - 2, 0, x + 2, 0); g.addColorStop(0, '#d8c08e'); g.addColorStop(0.5, '#fff2d2'); g.addColorStop(1, '#b8996a');
        ctx.fillStyle = g; ctx.fillRect(x - 2.1, STUMP_TOP - 0.5, 4.2, py(548) - STUMP_TOP + 1); ctx.fillStyle = '#fff6dd'; ctx.beginPath(); ctx.ellipse(x, STUMP_TOP - 0.5, 2.1, 0.9, 0, 0, PI * 2); ctx.fill(); });
      ctx.restore(); }
    const dt = m - BALL[1];
    if (dt < 2.2) {   // the bails cartwheel away, dust puffs
      [[-1, 46, 70], [1, 38, 82]].forEach(([dir, vx, vy], i) => {
        const x = (i ? STUMPS[2] - 6 : STUMPS[0] + 6) + dir * vx * dt, y = BAIL_Y - vy * dt + 160 * dt * dt, ground = py(640) - i * 6;
        if (y > ground) return;
        ctx.save(); ctx.translate(x, y); ctx.rotate(dir * dt * 11); ctx.fillStyle = '#f4e3bd'; ctx.strokeStyle = '#8a6a3c'; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-5.5, -1.3, 11, 2.6, 1.3) : ctx.rect(-5.5, -1.3, 11, 2.6); ctx.fill(); ctx.stroke(); ctx.restore(); });
      if (dt < 0.9) { ctx.save(); const u = dt / 0.9; for (let k = 0; k < 6; k++) { const a = (k / 6) * PI * 2, x = STUMPS[1] + Math.cos(a) * 10 * u, y = STUMP_TOP + 4 + Math.sin(a) * 4 * u - 4 * u, r = 3 + u * 5;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(255,236,190,${0.6 * (1 - u)})`); g.addColorStop(1, 'rgba(255,236,190,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); } ctx.restore(); }
    }
  } else if (m >= BAILS_BACK[1] && m < BAILS_BACK[1] + 0.5) {   // a little twinkle as they're replaced
    const a = 1 - (m - BAILS_BACK[1]) / 0.5; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,240,200,${a})`;
    STUMPS.forEach(x => { ctx.fillRect(x - 3, BAIL_Y, 6, 0.8); ctx.fillRect(x - 0.4, BAIL_Y - 3, 0.8, 6.8); }); ctx.restore();
  }
}
function drawChest(t, m) {
  if (!ok(IM.chest)) return;
  const x0 = CHEST.cx - CHEST.w / 2, y0 = CHEST.by - CHEST.h;
  ctx.save(); const sg = ctx.createRadialGradient(CHEST.cx + 8, CHEST.by - 4, 2, CHEST.cx + 8, CHEST.by - 4, CHEST.w * 0.62);
  sg.addColorStop(0, 'rgba(60,28,6,0.55)'); sg.addColorStop(1, 'rgba(60,28,6,0)'); ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(CHEST.cx + 10, CHEST.by - 4, CHEST.w * 0.66, 16, 0, 0, PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(45,20,4,0.55)'; ctx.filter = 'blur(3px)'; ctx.beginPath(); ctx.ellipse(CHEST.cx + 4, CHEST.by - 7, CHEST.w * 0.44, 6, 0, 0, PI * 2); ctx.fill(); ctx.filter = 'none'; ctx.restore();
  ctx.drawImage(IM.chest, x0, y0, CHEST.w, CHEST.h);
  // plaque
  const pl = { x: x0 + 0.546 * CHEST.w, y: y0 + 0.69 * CHEST.h, w: 0.27 * CHEST.w, h: 0.144 * CHEST.h };
  ctx.save(); ctx.translate(pl.x + pl.w / 2, pl.y + pl.h / 2); ctx.rotate(-0.045); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#4a2a0c';
  const fit = (txt, sz, maxw) => { ctx.font = `800 ${sz}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`; const w = ctx.measureText(txt).width; if (w > maxw) { sz *= maxw / w; ctx.font = `800 ${sz}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`; } };
  fit('BUCCANEER', pl.h * 0.42, pl.w * 0.82); ctx.fillText('BUCCANEER', 0, -pl.h * 0.16);
  fit('CUP', pl.h * 0.42, pl.w * 0.82); ctx.fillText('CUP', 0, pl.h * 0.25); ctx.restore();
  // calm twinkles on the coins
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  COINT.forEach(c => { const a = Math.pow(Math.max(0, Math.sin(t * c.f + c.p)), 14); if (a < 0.03) return; const x = x0 + c.x * CHEST.w, y = y0 + c.y * CHEST.h, k = 3.5 * c.s * a;
    ctx.fillStyle = `rgba(255,250,225,${a})`; ctx.beginPath(); ctx.moveTo(x, y - k * 1.6); ctx.lineTo(x + k * 0.3, y - k * 0.3); ctx.lineTo(x + k * 1.6, y); ctx.lineTo(x + k * 0.3, y + k * 0.3);
    ctx.lineTo(x, y + k * 1.6); ctx.lineTo(x - k * 0.3, y + k * 0.3); ctx.lineTo(x - k * 1.6, y); ctx.lineTo(x - k * 0.3, y - k * 0.3); ctx.fill(); });
  ctx.restore();
  const gw = win(m, GLINT);   // a slow sheen sweeps the hoard, clipped to the treasure
  if (gw >= 0) {
    const off = drawChest.off || (drawChest.off = document.createElement('canvas')); off.width = Math.ceil(CHEST.w); off.height = Math.ceil(CHEST.h);
    const o = off.getContext('2d'); o.clearRect(0, 0, off.width, off.height); o.drawImage(IM.chest, 0, 0, CHEST.w, CHEST.h); o.globalCompositeOperation = 'source-in';
    const gx = -CHEST.w * 0.4 + ease(gw) * CHEST.w * 1.8, gr = o.createLinearGradient(gx - 26, 0, gx + 26, 0);
    gr.addColorStop(0, 'rgba(255,255,230,0)'); gr.addColorStop(0.5, `rgba(255,255,230,${0.32 * env(gw, 0.2)})`); gr.addColorStop(1, 'rgba(255,255,230,0)');
    o.fillStyle = gr; o.fillRect(0, 0, off.width, off.height);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(off, x0, y0); ctx.restore();
  }
}
function drawParrot(t, m) {
  if (!ok(IM.parrot)) return;
  const pw = 30, ph = pw * 841 / 339, fx = CHEST.cx + CHEST.w * 0.43, fy = CHEST.by - CHEST.h * 0.465;   // feet on the chest's top corner
  const hz = win(m, HOWZAT), hop = hz >= 0 && hz < 0.25 ? Math.sin(hz / 0.25 * PI) * 9 : 0;
  const tilt = Math.sin(t * 1.3) * 0.035 + (Math.sin(t * 0.37) > 0.92 ? Math.sin(t * 14) * 0.06 : 0);
  ctx.save(); ctx.translate(fx, fy - hop); ctx.rotate(tilt); ctx.scale(1, 1 + Math.sin(t * 2.1) * 0.012);
  ctx.drawImage(IM.parrot, -pw * 0.38, -ph * 0.55, pw, ph); ctx.restore();
  if (hz >= 0) {   // HOWZAT!
    const a = env(hz, 0.12), sc = 0.6 + 0.4 * ease(Math.min(1, hz / 0.12)), bx = fx - 46, by = fy - ph * 0.56 - 6;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(bx, by); ctx.scale(sc, sc);
    ctx.font = '900 15px "Barlow Condensed", "Arial Narrow", Arial, sans-serif'; const tw = ctx.measureText('HOWZAT!').width + 14;
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#2a1606'; ctx.lineWidth = 2; ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-tw / 2, -12, tw, 22, 9) : ctx.rect(-tw / 2, -12, tw, 22); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tw / 2 - 16, 9); ctx.lineTo(tw / 2 - 2, 17); ctx.lineTo(tw / 2 - 8, 8); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c21a1a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('HOWZAT!', 0, -0.5); ctx.restore();
  }
}
function frame(ms) {
  __last = ms;
  const t = reduceMotion ? 0 : Math.max(0, ms) / 1000;   // the game's clock can start a hair below zero
  const m = t % SHOW, loops = Math.floor(t / SHOW);
  ctx.clearRect(0, 0, W, H);
  if (!ok(IM.bg)) { ctx.fillStyle = '#f0a070'; ctx.fillRect(0, 0, W, H); return; }
  ctx.drawImage(IM.bg, OX, 0, 1376 * S, H);
  drawSea(t); drawGulls(m); drawFall(t); drawFire(t);
  drawShip(t); drawCannon(t, m, loops);
  if (ok(IM.palm)) ctx.drawImage(IM.palm, PALM.x, PALM.y, PALM.w, PALM.h);
  drawShore(t);
  drawBallAndWicket(t, m, 'wicket');
  drawChest(t, m); drawParrot(t, m);
  drawBallAndWicket(t, m, 'ball');
}
function loop(ms) { frame(ms); if (!reduceMotion) requestAnimationFrame(loop); }
paintBase(); frame(0);
if (!reduceMotion) requestAnimationFrame(loop);
let repainted = false;
const repaint = () => { if (!repainted) { repainted = true; paintBase(); if (reduceMotion) frame(0); } };
if (document.fonts && document.fonts.ready) document.fonts.ready.then(repaint).catch(() => {});
setTimeout(repaint, 2000);
'''
for k,f in [('@BG@','bg.webp'),('@SHIP@','ship.webp'),('@CHEST@','chest.webp'),('@PARROT@','parrot.webp'),('@PALM@','palm.webp'),('@NOB@','nobails.webp')]:
    js=js.replace(k,u(f))
js=js.replace('@PX0@',str(bb[0])).replace('@PY0@',str(bb[1])).replace('@PX1@',str(bb[2])).replace('@PY1@',str(bb[3]))
html=f'''<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800;900&display=swap');body{{margin:0;background:#070810}}canvas{{display:block;width:620px;height:355px}}</style>
<canvas id="c" width="620" height="355" aria-label="Buccaneer Cup: a painted treasure cove at sunset with a galleon firing a broadside and a cricket ball that clips the stumps"></canvas>
<script>{js}</script><title>Buccaneer Cup</title>'''
open('/home/claude/flicky-cricket/art/league-cards/pirate-painted.html','w').write(html)
print(len(html))
