"""Game code for Joe's Nov 3 asks: spinners bowl every second over; fielding mocap on the Gully field. Idempotent."""
import os, json, sys
G = os.path.expanduser('~/Flicky-Cricket/flicky-cricket.html'); s = open(G).read()
FLD3 = float(sys.argv[1]) if len(sys.argv) > 1 else 0.3
def rep(old, new, count=1):
    global s
    if new in s: return
    assert s.count(old) == count, (old[:80], s.count(old)); s = s.replace(old, new)

# ---- 1. bowler sprite set: seam (b3_) or spinner (b3o_ off spin / b3l_ leg spin)
rep("function b3On() {", "function b3Pre() { const p = window._bowlPre; return p && GP_SRC[p + 'stand'] && GP[p + 'stand'] && GP[p + 'stand'].naturalWidth > 0 ? p : 'b3_'; }   // Nov 3 (Joe): spinners bowl some overs\nfunction b3On() {")
rep("  if (b3On()) { const m = GP_SRC.b3_rel, sc = GP_SCALE.bowl3 * u,", "  if (b3On()) { const m = GP_SRC[b3Pre() + 'rel'], sc = GP_SCALE.bowl3 * u,")
rep("function b3Place(fr) { const m = GP_SRC[fr === 'b3_stand' ? 'b3_fol20' : fr] || GP_SRC.b3_rel,",
    "function b3Place(fr) { const P = b3Pre(), m = GP_SRC[fr === P + 'stand' ? P + 'fol20' : fr] || GP_SRC[P + 'rel'],")
rep("  if (state === 'ready') { window._b3Rel = 0; return 'b3_run' + Math.max(0,", "  const P = b3Pre();\n  if (state === 'ready') { window._b3Rel = 0; return P + 'run' + Math.max(0,")
rep("  if (!window._b3Rel) return 'b3_stand';\n  const er = now - window._b3Rel; if (er < 45) return 'b3_rel';\n  const i = Math.floor((er - 45) / 50); return i < 21 ? 'b3_fol' + i : 'b3_stand';",
    "  if (!window._b3Rel) return P + 'stand';\n  const er = now - window._b3Rel; if (er < 45) return P + 'rel';\n  const i = Math.floor((er - 45) / 50); return i < 21 ? P + 'fol' + i : P + 'stand';")
rep("    const fr = b3Frame(), m = GP_SRC.b3_rel, sc = GP_SCALE.bowl3 * (W / 390);", "    const fr = b3Frame(), m = GP_SRC[b3Pre() + 'rel'], sc = GP_SCALE.bowl3 * (W / 390);")

# ---- 2. spinner overs: every second over (Joe: "spinner bowls some overs"); off or leg spin, picked per match
rep("""  ball.zoneCenter = Math.max(0.76, Math.min(1.02, ball.zoneCenter));
""", """  ball.zoneCenter = Math.max(0.76, Math.min(1.02, ball.zoneCenter));
  // Nov 3 (Joe): a spinner bowls every second over — slower, a touch fuller, and it turns after pitching.
  // Off spin (right-arm) turns into the right-hander, from off (screen right) to leg; leg spin turns away.
  ball.turn = 0; window._bowlPre = 'b3_';
  if (ballsBowled === 0 || !window._spinKind) window._spinKind = Math.random() < 0.5 ? 'off' : 'leg';
  if (Math.floor(ballsBowled / 6) % 2 === 1 && !firstMatch && GP_SRC.b3o_stand && GP_SRC.b3l_stand && gullyPaintedPeople() && b3On()) {
    const off = window._spinKind === 'off';
    window._bowlPre = off ? 'b3o_' : 'b3l_';
    ballSpeed = (baseSpeed + paceVariance) * (0.72 + Math.random() * 0.1);   // spin pace, whatever the seam pick was
    ball.targetX = 0.5 + (off ? 0.045 : -0.035) + (Math.random() - 0.5) * 0.07;
    ball.turn = (off ? -1 : 1) * (0.035 + Math.random() * 0.05);
    ball.lineSide = (ball.targetX + ball.turn) > 0.5 ? 1 : ((ball.targetX + ball.turn) < 0.5 ? -1 : 0);
    ball.zoneCenter = Math.max(0.76, Math.min(1.02, ball.zoneCenter + 0.02));
  }
""")
rep("""    px = lerp(W/2, W/2 + (ball.targetX-0.5)*PITCH_BOTTOM_W()*2, t);
    py = lerp(PITCH_TOP()+6, PITCH_BOTTOM()-8, Math.min(t,1));""",
"""    px = lerp(W/2, W/2 + (ball.targetX-0.5)*PITCH_BOTTOM_W()*2, t);
    if (ball.turn) { const u = Math.max(0, Math.min(1, (t - 0.6) / 0.32)); px += ball.turn * PITCH_BOTTOM_W() * 2 * u * u * (3 - 2 * u); }   // spin: turns off the pitch
    py = lerp(PITCH_TOP()+6, PITCH_BOTTOM()-8, Math.min(t,1));""")

# ---- 3. 3D fielders on the Gully field (Joe: fielding actions on the overhead field)
rep("const GP_SCALE = { kid: 0.102,", "const GP_SCALE = { fld3: %s, kid: 0.102," % FLD3)
rep("function drawGullyKidSprite(x, y, chasing, diving, stridePhase, f) {\n",
"""// Nov 3 (Joe): the fielders are the 3D player now, playing the mocap fielding actions: ready stance facing the batter,
// run, two-handed pick-up and throw, dive, catch (ball in his hands). Each lad keeps his own shirt colours.
const F3_LOOK = [['#d8342c', '#2f2f38'], ['#f0c02c', '#2c3e66'], ['#ee7a22', '#4a3a2a'], ['#2f6fd6', '#2b2b30']];
function f3On() { return GP.f3_ready_d0_0 && GP.f3_ready_d0_0.naturalWidth > 0 && window.MOCAP_FIELD !== false; }
function f3Img(key, id) { const L = F3_LOOK[id % 4]; return m3Recolor(key, L[0], null, { trousers: L[1], shoes: '#f4f4ef', shoesA: '#58585c' }); }
function f3Face(dx, dy) {   // facing frame for a direction on screen (dx right, dy down): d0 front … d4 back, mirrored on the left
  const ang = Math.atan2(Math.abs(dx), dy) * 180 / Math.PI, toRight = dx >= 0;
  if (ang < 22.5) return [0, false]; if (ang < 67.5) return [1, !toRight]; if (ang < 112.5) return [2, !toRight];
  if (ang < 157.5) return [3, toRight]; return [4, false];
}
function f3Draw(key, x, y, flip, id) { if (!GP_SRC[key]) return false; gpDraw(key, x, y, 'fld3', flip, f3Img(key, id)); return true; }
function drawF3Fielder(x, y, chasing, diving, stridePhase, f) {
  const h = _gHash(f && f.name), id = h % 4, now = performance.now();
  const [fd, ff] = f3Face(W / 2 - x, PITCH_BOTTOM() - y);           // facing the batter
  if (window._gCatch && f && f.name === window._gCatch.name) {      // caught: the short-catch take, ball in his hands
    const e = now - window._gCatch.at, i = Math.min(10, Math.floor(e / 45)), key = 'f3_catch_d' + fd + '_' + i;
    gpShadow(x, y, 9); f3Draw(key, x, y, ff, id);
    const m = GP_SRC[key], sc = GP_SCALE.fld3 / m.k * (W / 390);
    if (i >= 6) gullyBallImg(x + (ff ? -1 : 1) * (m.hx - m.ax) * sc, y + (m.hy - m.ay) * sc, 2.6, 0.6);
    return;
  }
  if (diving) { const left = f && f.target && f.target.x < f.x; gpShadow(x, y + 2, 13); ctx.save(); ctx.translate(x, y + 3); ctx.rotate((left ? 1 : -1) * 0.45); ctx.translate(-x, -(y + 3));
    f3Draw('f3_dive_d2_0', x, y + 3, left, id); ctx.restore(); return; }
  if (f && f.reached && f.chasing) {                     // got to it: two-handed pick-up, then the throw back in
    if (!f._f3At) f._f3At = now;
    const i = Math.min(13, Math.floor((now - f._f3At) / 70)); gpShadow(x, y, 9); f3Draw('f3_pick_d' + fd + '_' + i, x, y, ff, id); return;
  }
  if (f) f._f3At = 0;
  if (stridePhase > 0) {                                           // running: direction of travel
    const tg = f && f.chasing && f.target ? f.target : { x: f ? f.baseX : x, y: f ? f.baseY : y }, tx = tg.x, ty = tg.y;   // chasing, or walking back to his spot
    const dx = tx - x, dy = ty - y, a = Math.atan2(Math.abs(dx), dy) * 180 / Math.PI;
    const d = a < 50 ? 0 : a < 130 ? 2 : 4, fl = d === 2 && dx < 0;
    const i = Math.floor(stridePhase / (Math.PI * 2) * 8) % 8;
    gpShadow(x, y, 9); f3Draw('f3_run_d' + d + '_' + i, x, y, fl, id); return;
  }
  gpShadow(x, y, 9); f3Draw('f3_ready_d' + fd + '_0', x, y + Math.sin(now / 600 + h) * 0.3, ff, id);
}
function drawGullyKidSprite(x, y, chasing, diving, stridePhase, f) {
  if (f3On()) return drawF3Fielder(x, y, chasing, diving, stridePhase, f);
""")
rep("""function drawGullyKeeperSprite(x, y) {
  gpShadow(x, y, 10);""", """function drawGullyKeeperSprite(x, y) {
  gpShadow(x, y, 10);
  if (f3On()) { const up = b3Pre() !== 'b3_', key = up ? 'f3_keepu_d4_0' : 'f3_keepb_d4_0';   // standing up to the spinners
    if (f3Draw(key, x, y - (up ? 6 : 0), false, 0)) return; }""")
open(G, 'w').write(s); print('patched', len(s) / 1e6, 'MB')
