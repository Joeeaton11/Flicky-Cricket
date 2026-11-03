"""Nov 3 (Joe): every scene gets the 3D batter, bowlers (seam + spin) and fielders. Gully-ground art (lungi umpire,
painted stumps, taped tennis ball) stays Gully-only. Idempotent."""
import os
G = os.path.expanduser('~/Flicky-Cricket/flicky-cricket.html'); s = open(G).read()
E = [
("function gullyPaintedPeople() { return gullyPainted() && gpReady() && !window.GULLY_CODE_PEOPLE; }",
 "// Nov 3 (Joe): the 3D players (batter, seam + spin bowlers, fielders, keeper) in every scene, not just the Gully ground\nfunction gullyPaintedPeople() { return gpReady() && !window.GULLY_CODE_PEOPLE && window.PEOPLE_3D !== false; }"),
("if (window._gullyArtLoading) { window._gullyArtLoading = false; gullyLoadArt(); }",
 "if (window._gullyArtLoading) { window._gullyArtLoading = false; gullyLoadArt(); }\nsetTimeout(() => Object.keys(GP_SRC).forEach(k => { if (!GP[k].src) GP[k].src = GP_SRC[k].src; }), 0);   // the 3D players load in every scene"),
("  if (gullyPaintedPeople()) return drawGullyUmpireSprite(x, y);", "  if (gullyPaintedPeople() && gullyPainted()) return drawGullyUmpireSprite(x, y);   // the lungi umpire is the Gully ground's"),
("  if (themeArt() && drawThemedStumps(cx, cy, w)) return;\n  if (gullyPaintedPeople()) {", "  if (themeArt() && drawThemedStumps(cx, cy, w)) return;\n  if (gullyPaintedPeople() && gullyPainted()) {"),
("""  if (gullyPaintedPeople()) {
    if (window._gCatch) return;                              // caught: it's in the fielder's hands
    const r = Math.min(6, Math.max(size, 1) * 0.75);
    gullyBallImg(px, py, r, gullyBallSpin(px, py, r)); return; }""",
 """  if (gullyPaintedPeople()) {
    if (window._gCatch) return;                              // caught: it's in the fielder's hands
    if (gullyPainted()) { const r = Math.min(6, Math.max(size, 1) * 0.75);
      gullyBallImg(px, py, r, gullyBallSpin(px, py, r)); return; } }   // taped tennis ball on the Gully ground; other scenes keep their own ball"""),
]
for a, b in E:
    if b in s: continue
    assert s.count(a) == 1, a[:70]; s = s.replace(a, b)
open(G, 'w').write(s); print('all scenes: ok')
