#!/usr/bin/env python3
"""Read the gameplay layout straight from flicky-cricket.html and write:
  layout.json              every position, as fractions and as px at 1170x2532
  layout_1170x2532.png     template image (field, rope, inner ring, pitch, stumps, umpire, keeper, fielder spots, HUD zones)
  PROMPTS.md               the ground/asset prompts with these numbers filled in
Check a generated image against the layout:
  python3 layout_from_code.py --check some_ground.png   ->  some_ground_check.png
If the code changes shape and a value can't be found, the script stops with an error
instead of writing stale numbers."""
import re, json, sys, os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.join(HERE, '..', '..', '..', 'flicky-cricket.html')
W, H = 1170, 2532          # art size (3x a 390x844 phone)
SCALE = W / 390            # code px offsets are written at 390 wide
src = open(GAME, encoding='utf-8').read()

def find(pat, what):
    m = re.search(pat, src)
    if not m: sys.exit(f'LAYOUT NOT FOUND in code: {what}  (pattern {pat})')
    return [float(g) for g in m.groups()]

N = r'([0-9.]+)'
cy, = find(r'const FIELD_CY\s*=\s*' + N, 'FIELD_CY')
rx, = find(r'const FIELD_RX\s*=\s*' + N, 'FIELD_RX')
ry, = find(r'const FIELD_RY\s*=\s*' + N, 'FIELD_RY')
p_top, = find(r'const PITCH_TOP\s*=\s*\(\)\s*=>\s*H\s*\*\s*' + N, 'PITCH_TOP')
p_bot, = find(r'const PITCH_BOTTOM\s*=\s*\(\)\s*=>\s*H\s*\*\s*' + N, 'PITCH_BOTTOM')
p_tw, = find(r'const PITCH_TOP_W\s*=\s*\(\)\s*=>\s*W\s*\*\s*' + N, 'PITCH_TOP_W')
p_bw, = find(r'const PITCH_BOTTOM_W\s*=\s*\(\)\s*=>\s*W\s*\*\s*' + N, 'PITCH_BOTTOM_W')
r_dy, r_fx, r_fy = find(r'ctx\.ellipse\(W/2,\s*H\*\(FIELD_CY-' + N + r'\),\s*W\*FIELD_RX\*' + N + r',\s*H\*FIELD_RY\*' + N, 'inner ring')
ump_off, = find(r'drawUmpire\(W/2, PITCH_TOP\(\)-' + N + r'\)', 'umpire position')
s_far, = find(r'drawStumps\(W/2, PITCH_TOP\(\), ' + N + r'\)', 'far stumps size')
s_near, = find(r'drawStumps\(W/2, PITCH_BOTTOM\(\), ' + N + r'\)', 'near stumps size')

import math

# ---------- HUD for themed grounds: THEMED_HUD in the game code ----------
m = re.search(r'const THEMED_HUD\s*=\s*\{(.*?)\n\};', src, re.S)
if not m: sys.exit('LAYOUT NOT FOUND in code: THEMED_HUD')
HUD = {k: dict(left=float(l), top=float(t), right=float(r), bottom=float(b_)) for k, l, t, r, b_ in
       re.findall(r'(\w+):\s*\{\s*l:([0-9.]+),\s*t:([0-9.]+),\s*r:([0-9.]+),\s*b:([0-9.]+)', m.group(1))}
for k in ('scoreboard', 'energy_bar', 'pause_button', 'last_six_balls', 'best_score_sign', 'name_plate'):
    if k not in HUD: sys.exit(f'THEMED_HUD missing {k}')
ks = list(HUD)
for i in range(len(ks)):
    for j in range(i + 1, len(ks)):
        A, B = HUD[ks[i]], HUD[ks[j]]
        if A['left'] < B['right'] and B['left'] < A['right'] and A['top'] < B['bottom'] and B['top'] < A['bottom']:
            sys.exit(f'HUD OVERLAP: {ks[i]} and {ks[j]} — fix THEMED_HUD in the game code')


L = {
  'size': [W, H],
  'field_oval': dict(cx=0.5, cy=cy, rx=rx, ry=ry, left=0.5-rx, right=0.5+rx, top=cy-ry, bottom=cy+ry),
  'boundary_rope': 'on the field_oval edge',
  'inner_ring': dict(cx=0.5, cy=cy-r_dy, rx=rx*r_fx, ry=ry*r_fy, left=0.5-rx*r_fx, right=0.5+rx*r_fx, top=cy-r_dy-ry*r_fy, bottom=cy-r_dy+ry*r_fy),
  'pitch': dict(top=p_top, bottom=p_bot, top_w=p_tw, bottom_w=p_bw),
  'stumps_far': dict(x=0.5, y=p_top, height_px=s_far*SCALE), 'stumps_near': dict(x=0.5, y=p_bot, height_px=s_near*SCALE),
  'umpire': dict(x=0.5, y=p_top - ump_off/844),
  **HUD,
}
json.dump(L, open(os.path.join(HERE, 'layout.json'), 'w'), indent=1)

def pct(v): return f'{v*100:.1f}%'
def px(v, axis): return round(v * (W if axis == 'x' else H))

# ---------- template image ----------
def draw_template(img, alpha=255, labels=True):
    d = ImageDraw.Draw(img, 'RGBA')
    fo, ir, pi = L['field_oval'], L['inner_ring'], L['pitch']
    def oval(o, col, w): d.ellipse([px(o['left'],'x'), px(o['top'],'y'), px(o['right'],'x'), px(o['bottom'],'y')], outline=col, width=w)
    def box(r, col): d.rectangle([px(r['left'],'x'), px(r['top'],'y'), px(r['right'],'x'), px(r['bottom'],'y')], outline=col+(alpha,), width=6)
    for k, col in HUD_BOXES: box(L[k], col)
    oval(fo, (255,255,255,alpha), 8); oval(ir, (255,255,255,int(alpha*.6)), 4)
    tl, tr = 0.5 - pi['top_w']/2, 0.5 + pi['top_w']/2; bl, br = 0.5 - pi['bottom_w']/2, 0.5 + pi['bottom_w']/2
    d.polygon([(px(tl,'x'),px(pi['top'],'y')),(px(tr,'x'),px(pi['top'],'y')),(px(br,'x'),px(pi['bottom'],'y')),(px(bl,'x'),px(pi['bottom'],'y'))], outline=(0,200,255,alpha), width=5)
    for s in ('stumps_far', 'stumps_near'):
        x, y, h = px(L[s]['x'],'x'), px(L[s]['y'],'y'), L[s]['height_px']
        d.rectangle([x-h*.35, y-h, x+h*.35, y], outline=(255,80,200,alpha), width=4)
    u = L['umpire']; d.ellipse([px(u['x'],'x')-18, px(u['y'],'y')-18, px(u['x'],'x')+18, px(u['y'],'y')+18], fill=(255,255,255,alpha))
    if labels:
        try: ft = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
        except Exception: ft = None
        try: fs = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 24)
        except Exception: fs = ft
        for k, col in HUD_BOXES:
            r = L[k]; d.text((px(r['left'],'x')+8, px(r['bottom'],'y')+4), k.replace('_',' ').upper(), fill=col+(alpha,), font=fs)
        d.text((px(fo['right'],'x')-330, px(fo['cy'],'y')), 'BOUNDARY ROPE', fill=(255,255,255,alpha), font=ft)
        d.text((px(0.5,'x')+60, px(u['y'],'y')-20), 'UMPIRE', fill=(255,255,255,alpha), font=ft)
        d.text((px(0.5,'x')+80, px((pi['top']+pi['bottom'])/2,'y')), 'PITCH', fill=(0,200,255,alpha), font=ft)
    return img

HUD_BOXES = [('scoreboard',(255,200,0)), ('energy_bar',(80,255,80)), ('pause_button',(255,140,0)),
             ('last_six_balls',(255,140,0)), ('best_score_sign',(255,90,90)), ('name_plate',(255,90,90))]

if '--check' in sys.argv:
    p = sys.argv[sys.argv.index('--check') + 1]
    im = Image.open(p).convert('RGBA').resize((W, H))
    out = os.path.splitext(p)[0] + '_check.png'
    draw_template(im, 230).convert('RGB').save(out); print('check image:', out); sys.exit()

tpl = Image.new('RGBA', (W, H), (40, 110, 50, 255))
draw_template(tpl).convert('RGB').save(os.path.join(HERE, 'layout_1170x2532.png'))

# ---------- prompts ----------
fo, ir, pi, sb, u = L['field_oval'], L['inner_ring'], L['pitch'], L['scoreboard'], L['umpire']
en, bs, ps, st, nm = L['energy_bar'], L['best_score_sign'], L['pause_button'], L['last_six_balls'], L['name_plate']
def area(r): return f"{pct(r['left'])}–{pct(r['right'])} W, {pct(r['top'])}–{pct(r['bottom'])} H"
pitch_h = px(pi['bottom'],'y') - px(pi['top'],'y')
P = f"""# Ground prompts — generated from the game code
Do not edit by hand. Re-run `python3 art/grounds/layout/layout_from_code.py` after any layout change.
Replace [THEME] and the [e.g. …] parts per ground. Every result is checked with `--check` and aligned to the template before use.

## Shared block (top of every prompt)
```
ART STYLE: glossy, ultra-vibrant 3D-rendered cartoon mobile-game key art, like Clash of Clans / Boom Beach promo art: hyper-saturated colours that pop (vivid turquoise water, lush emerald foliage, rich golds and reds), warm glowing lanterns and lights with soft bloom, strong rim lighting, deep ambient-occlusion shadows, crisp chunky detail, high contrast, everything polished and shiny. Chunky cute proportions (big heads, short bodies). Fantasy themes go big: fun, cool, over the top. Camera: high 3/4 top-down view looking straight up a cricket ground in portrait.
THEME: [THEME].
LIGHT: soft sunlight from [LIGHT — chosen per ground, whatever looks best, e.g. top-left]. Use this same light direction on every asset for this ground.
SHADOWS: the ground and stadium may have painted shadows. Characters, props and HUD pieces have NO shadow under or behind them (the game adds those).
KEY BACKGROUND: separate pieces go on a flat pure #00FF00 green background and contain NO green at all. If the theme needs green on a piece (leaves, a parrot, green kit), use flat pure #FF00FF magenta instead and no magenta in the art.
SMALL ON SCREEN: characters show about 30 px tall on a phone, so bold simple silhouettes, chunky shapes, no fine detail. Kit colours must stand out clearly from the grass; the ball must stand out from the grass and the pitch.
LEFT/RIGHT: "picture-left" and "picture-right" mean the left and right of the image as you look at it.
No text, letters, numbers or logos anywhere unless asked.
```

## 1. Ground — surroundings, themed field, boundary rope
```
Portrait background. It MUST match the game layout below exactly. The layout is described in words on purpose: never write any measurement, number, label or guide line in the image.
FIELD: one TALL oval playing surface — themed, not always grass [e.g. raked beach sand, ice, ship's deck, turf] — plain and calm so a small ball shows clearly. It is about 1.6 times as tall as it is wide. Its left and right edges sit one eighth of the picture's width in from each side. Its top edge is just over a quarter of the way down the picture; its bottom edge is very near the bottom, leaving only a thin band (about a fifteenth of the height) below it. Its centre is three fifths of the way down. The thin strips beyond its left and right edges get cropped, so keep only scenery there.
It is a true smooth ellipse, not a racetrack with straight sides.
TIGHT STADIUM: the stadium starts right at the field edge. Only a thin ring of boards (or the theme's equivalent) separates the field from the crowd and scenery: no wide band of bare outfield, track, sand or empty ground. The front row of the crowd sits immediately behind the boards: no grass, concourse or walkway between the boards and the seats.
The field edge is a clean crisp line. NO rope, NO markers, NO inner ring, NO lines on the field: the game draws the themed rope, boundary markers and 30-yard ring markers from the props sheet, exactly on the coded oval.
EMPTY: no pitch, stumps, players, umpire, ball or text on the field.
SURROUNDINGS: busy, fun and cool — packed with life, characters and detail, edge to edge and top to bottom, OUTSIDE the oval only. Real-world themes (e.g. an IPL ground) should look like the real thing, in the home team's colours. No empty bands at the top or bottom.
Keep the top quarter of the picture calm (sky, skyline, roofs; no faces or key props there) and the bottom-left corner simple. This is a background only: never paint any game interface, buttons, icons, panels or scoreboards.
```

## 2. HUD layer: scoreboard, energy bar, BEST score sign, pause, last-six strip
```
On the flat key background, each piece separate, nothing touching. All blank: no text or numbers.
- SCOREBOARD, {px(sb['right']-sb['left'],'x')}x{px(sb['bottom']-sb['top'],'y')} px: two equal blank number panels, left (RUNS) and right (TARGET), each with a blank label strip above. A small themed crest may rise from the top centre.
- ENERGY BAR: an empty themed bar track, its own piece that sits just under the scoreboard, {px(en['right']-en['left'],'x')}x{px(en['bottom']-en['top'],'y')} px, centred under the two panels (the game fills it).
- BEST SCORE SIGN, {px(bs['right']-bs['left'],'x')}x{px(bs['bottom']-bs['top'],'y')} px: a themed hanging sign with a blank panel, hangs under the TARGET panel.
- PAUSE BUTTON, {px(ps['right']-ps['left'],'x')} px round: themed badge with a pause symbol.
- LAST-SIX-BALLS STRIP, {px(st['right']-st['left'],'x')}x{px(st['bottom']-st['top'],'y')} px: themed holder with 6 empty round sockets in a row.
```
A themed display font is chosen per ground; the game draws RUNS, TARGET, the numbers, the energy fill and BEST in it.

## 3. Props sheet: pitch, stump, bail, ball (one generation)
```
On the flat key background, each piece separate, evenly spaced, nothing touching:
- PITCH: a themed cricket pitch strip [e.g. ship's deck planks], top-down, trapezoid {px(pi['top_w'],'x')} px wide at the top, {px(pi['bottom_w'],'x')} px at the bottom, {pitch_h} px tall, painted crease lines at each end, nothing on it.
- ONE themed stump [e.g. carved wooden post, brass cap], upright, 3/4 view.
- ONE themed bail.
- ONE themed ball [e.g. dark red leather, gold seam], seen from above.
- ROPE SEGMENT: a straight horizontal length of the themed boundary rope, evenly thick, both ends cut square so it tiles.
- BOUNDARY MARKER (optional): a small themed marker [e.g. skull flag on a post].
- RING MARKER: one small themed marker seen from above [e.g. a seashell, a white disc] — repeated by the game round the 30-yard circle.
- MOVING EXTRAS (3–5 small separate pieces the game animates): [e.g. a skull flag, a waving pirate fan, a parrot with wings up and wings down, a lantern flame].
```
The game rotates, throws and spins the stump, bail and ball itself: no falling or spinning frames needed.

## 4. Fielders: one base fielder, 4 sheets
The game makes 4 players from this one fielder by recolouring the shirt (and later swapping headwear). If they look too alike, add a second body shape (4 more sheets).
Draw 5 directions; the game mirrors 3 of them for the other side.
```
On the flat key background, ONE row of evenly spaced cells, nothing touching. The same themed fielder [e.g. pirate deckhand in a red bandana] with a shirt in ONE flat plain colour (no stripes or pattern, so the game can recolour it), in the pose [POSE].
Feet at the bottom centre of every cell, all cells the same scale.
```
- Sheet 1, STANDING ready crouch, 5 cells: facing camera · 3/4 towards camera, facing picture-left · side-on, facing picture-left · 3/4 away, facing picture-left · away from camera.
- Sheet 2, RUNNING, 4-frame cycle × 5 directions, as a 5-row grid (rows = the 5 directions above, columns = frames 1–4).
- Sheet 3, two rows of 3 cells (facing camera · side-on facing picture-left · away from camera): row 1 PICK UP (bending to scoop the ball one-handed); row 2 THROW (arm back, about to throw to the keeper).
- Sheet 4, two rows of 3 cells (same 3 directions): row 1 CATCH (hands cupped up high); row 2 DIVE (full-length dive, arms stretched out).

## 5. Bowler (own sheet)
```
On the flat key background, one row, same scale as the fielder. A themed bowler [e.g. pirate captain] seen from the batter's end, facing down-screen towards the camera: run-up 4 frames · gather/leap · delivery stride (arm high) · release · follow-through.
```

## 6. Keeper and umpire (one sheet)
```
On the flat key background, same scale as the fielder.
KEEPER (from behind, facing up-screen), themed gloves and pads: crouch · standing up · catching · appeal.
UMPIRE (facing down-screen), themed outfit: idle · OUT (one finger up) · FOUR (arm sweep, 3 frames) · SIX (both arms straight up).
```

## 7. Pop-up words + scoreboard digits (one generation) — NO starburst
Painted lettering in the ground's own style, like the Gully truck-art words. No burst, rays, bang or ribbon behind them. A small themed backing or props are fine if they suit the theme [e.g. a torn scroll, coins, a cannon puff].
```
On the flat key background, each word separate, nothing touching. Big chunky hand-painted 3D lettering in the theme's style [e.g. gold pirate lettering with rope outline], spelled exactly:
FOUR!   SIX!   CAUGHT!   BOWLED!   OUT!
and for the result screen:   YOU WON!   SO CLOSE!   NEW BEST!
and the scoreboard digits, each separate:   0 1 2 3 4 5 6 7 8 9
SIX! the biggest and boldest. Each word on one line, letters fully visible, nothing cropped. Digits all the same height and width.
```

## No extra generation needed
- League select card and result-screen backdrop: cut from the ground background.
- Shadows under characters and props: drawn by the game in this ground's light direction.

## Generations per theme
Ground 1 · HUD 1 · props 1 · fielder 4 · bowler 1 · keeper + umpire 1 · words 1 = **10**. A second ground in the same theme: **1** (just the background).

## Where things stand in the game (for checking)
- HUD (THEMED_HUD in the code): scoreboard {area(sb)}; energy bar {area(en)}; BEST sign {area(bs)}; pause {area(ps)}; last six {area(st)}; name plate {area(nm)}.
- Far stumps {pct(pi['top'])} H, batter's stumps {pct(pi['bottom'])} H, umpire {pct(u['y'])} H, all at 50% W.
"""
open(os.path.join(HERE, 'PROMPTS.md'), 'w').write(P)
print('ok: layout.json, layout_1170x2532.png, PROMPTS.md')
