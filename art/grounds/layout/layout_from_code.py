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
b_w, b_h = find(r'const bW\s*=\s*W \* ' + N + r', bH = H \* ' + N, 'scoreboard size')
b_top, = find(r'GULLY_BOARD_TOP \|\| ' + N + r'\)', 'scoreboard top (Gully standard)')
ump_off, = find(r'drawUmpire\(W/2, PITCH_TOP\(\)-' + N + r'\)', 'umpire position')
s_far, = find(r'drawStumps\(W/2, PITCH_TOP\(\), ' + N + r'\)', 'far stumps size')
s_near, = find(r'drawStumps\(W/2, PITCH_BOTTOM\(\), ' + N + r'\)', 'near stumps size')

def slots(name):
    m = re.search(name + r'\s*=\s*\[(.*?)\];', src, re.S)
    if not m: sys.exit(f'LAYOUT NOT FOUND in code: {name}')
    return [dict(angle=float(a), dist=float(d), name=n) for a, d, n in
            re.findall(r"angle:\s*(-?[0-9.]+),\s*dist:\s*([0-9.]+),\s*name:'([^']+)'", m.group(1))]
fielders = slots('INFIELD_SLOTS') + slots('BOUNDARY_SLOTS')
import math
for f in fielders:
    a = math.radians(f['angle'])
    f['x'] = 0.5 + math.sin(a) * rx * f['dist']
    f['y'] = cy - math.cos(a) * ry * f['dist']

L = {
  'size': [W, H],
  'field_oval': dict(cx=0.5, cy=cy, rx=rx, ry=ry, left=0.5-rx, right=0.5+rx, top=cy-ry, bottom=cy+ry),
  'boundary_rope': 'on the field_oval edge',
  'inner_ring': dict(cx=0.5, cy=cy-r_dy, rx=rx*r_fx, ry=ry*r_fy, left=0.5-rx*r_fx, right=0.5+rx*r_fx, top=cy-r_dy-ry*r_fy, bottom=cy-r_dy+ry*r_fy),
  'pitch': dict(top=p_top, bottom=p_bot, top_w=p_tw, bottom_w=p_bw),
  'stumps_far': dict(x=0.5, y=p_top, height_px=s_far*SCALE), 'stumps_near': dict(x=0.5, y=p_bot, height_px=s_near*SCALE),
  'umpire': dict(x=0.5, y=p_top - ump_off/844),
  'scoreboard': dict(left=(1-b_w)/2, right=(1+b_w)/2, top=b_top, bottom=b_top+b_h),
  'notch_clear': dict(top=0, bottom=0.05),
  'hud_bottom_clear': dict(top=0.94, bottom=1.0, note='BEST sign centre, name plate bottom-left'),
  'fielder_spots': fielders,
}
json.dump(L, open(os.path.join(HERE, 'layout.json'), 'w'), indent=1)

def pct(v): return f'{v*100:.1f}%'
def px(v, axis): return round(v * (W if axis == 'x' else H))

# ---------- template image ----------
def draw_template(img, alpha=255, labels=True):
    d = ImageDraw.Draw(img, 'RGBA')
    fo, ir, pi, sb = L['field_oval'], L['inner_ring'], L['pitch'], L['scoreboard']
    def oval(o, col, w): d.ellipse([px(o['left'],'x'), px(o['top'],'y'), px(o['right'],'x'), px(o['bottom'],'y')], outline=col, width=w)
    d.rectangle([0, 0, W, px(0.05,'y')], fill=(255,0,0,70))
    d.rectangle([0, px(0.94,'y'), W, H], fill=(255,0,0,50))
    d.rectangle([px(sb['left'],'x'), px(sb['top'],'y'), px(sb['right'],'x'), px(sb['bottom'],'y')], outline=(255,200,0,alpha), width=6)
    oval(fo, (255,255,255,alpha), 8); oval(ir, (255,255,255,int(alpha*.6)), 4)
    tl, tr = 0.5 - pi['top_w']/2, 0.5 + pi['top_w']/2; bl, br = 0.5 - pi['bottom_w']/2, 0.5 + pi['bottom_w']/2
    d.polygon([(px(tl,'x'),px(pi['top'],'y')),(px(tr,'x'),px(pi['top'],'y')),(px(br,'x'),px(pi['bottom'],'y')),(px(bl,'x'),px(pi['bottom'],'y'))], outline=(0,200,255,alpha), width=5)
    for s in ('stumps_far', 'stumps_near'):
        x, y, h = px(L[s]['x'],'x'), px(L[s]['y'],'y'), L[s]['height_px']
        d.rectangle([x-h*.35, y-h, x+h*.35, y], outline=(255,80,200,alpha), width=4)
    u = L['umpire']; d.ellipse([px(u['x'],'x')-18, px(u['y'],'y')-18, px(u['x'],'x')+18, px(u['y'],'y')+18], fill=(255,255,255,alpha))
    for f in fielders:
        x, y = px(f['x'],'x'), px(f['y'],'y'); d.ellipse([x-16, y-16, x+16, y+16], outline=(255,230,0,alpha), width=5)
    if labels:
        try: ft = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
        except Exception: ft = None
        d.text((20, px(0.012,'y')), 'NOTCH - KEEP CLEAR', fill=(255,255,255,alpha), font=ft)
        d.text((px(sb['left'],'x')+16, px(sb['top'],'y')+12), 'SCOREBOARD LAYER', fill=(255,200,0,alpha), font=ft)
        d.text((20, px(0.95,'y')), 'HUD - KEEP LOW DETAIL', fill=(255,255,255,alpha), font=ft)
        d.text((px(fo['right'],'x')-330, px(fo['cy'],'y')), 'BOUNDARY ROPE', fill=(255,255,255,alpha), font=ft)
        d.text((px(0.5,'x')+60, px(u['y'],'y')-20), 'UMPIRE', fill=(255,255,255,alpha), font=ft)
        d.text((px(0.5,'x')+80, px((pi['top']+pi['bottom'])/2,'y')), 'PITCH', fill=(0,200,255,alpha), font=ft)
    return img

if '--check' in sys.argv:
    p = sys.argv[sys.argv.index('--check') + 1]
    im = Image.open(p).convert('RGBA').resize((W, H))
    out = os.path.splitext(p)[0] + '_check.png'
    draw_template(im, 230).convert('RGB').save(out); print('check image:', out); sys.exit()

tpl = Image.new('RGBA', (W, H), (40, 110, 50, 255))
draw_template(tpl).convert('RGB').save(os.path.join(HERE, 'layout_1170x2532.png'))

# ---------- prompts ----------
fo, ir, pi, sb, u = L['field_oval'], L['inner_ring'], L['pitch'], L['scoreboard'], L['umpire']
pitch_h = px(pi['bottom'],'y') - px(pi['top'],'y')
P = f"""# Ground prompts — generated from the game code
Do not edit by hand. Re-run `python3 art/grounds/layout/layout_from_code.py` after any layout change.
Replace [THEME] and the [e.g. …] parts per ground. Every result is checked with `--check` and aligned to the template before use.

## Shared block (top of every prompt)
```
ART STYLE: stylised 2.5D cartoon mobile-game art, hand-painted like Supercell's Clash of Clans / Clash Royale. Chunky cute proportions (big heads, short bodies), thick dark outlines, saturated colours, soft painted lighting. Camera: high 3/4 top-down view looking straight up a cricket ground in portrait.
THEME: [THEME].
No text, letters, numbers or logos anywhere unless asked.
```

## 1. Ground — surroundings, themed field, boundary rope
```
Portrait background, exactly {W}x{H} px. It MUST correctly and accurately match the coded game layout below. Positions are exact, not suggestions. % of width (W) / height (H), pixels in brackets.
FIELD: one oval of themed grass, centre 50% W / {pct(fo['cy'])} H ({px(.5,'x')}, {px(fo['cy'],'y')}). Left edge {pct(fo['left'])} W ({px(fo['left'],'x')}), right edge {pct(fo['right'])} W ({px(fo['right'],'x')}), top {pct(fo['top'])} H ({px(fo['top'],'y')}), bottom {pct(fo['bottom'])} H ({px(fo['bottom'],'y')}). Grass themed [e.g. lush tropical turf, mown stripes] but plain and low-contrast so a small ball stays visible.
BOUNDARY ROPE: a themed rope [e.g. thick ship's rope with small flag markers] laid exactly on that oval edge, all the way round.
INNER RING: a faint themed dotted ring, centre 50% W / {pct(ir['cy'])} H, from {pct(ir['left'])} to {pct(ir['right'])} W and {pct(ir['top'])} to {pct(ir['bottom'])} H.
EMPTY: no pitch, stumps, players, umpire, ball or text on the field.
SCOREBOARD AREA: {pct(sb['left'])}–{pct(sb['right'])} W, {pct(sb['top'])}–{pct(sb['bottom'])} H: calm, low-detail scenery only (the board is a separate layer).
TOP 5% H: plain sky/scenery (phone notch). BOTTOM 94–100% H: low detail (BEST sign centre, name plate left).
SURROUNDINGS: all themed stands, crowd and scenery OUTSIDE the oval only.
```

## 2. Scoreboard + BEST sign (separate layer)
```
On flat #00FF00 green. A themed empty scoreboard, {px(sb['right']-sb['left'],'x')}x{px(sb['bottom']-sb['top'],'y')} px. Two equal blank number panels, left (RUNS) and right (TARGET), each with a blank label strip above, and a blank thin energy bar along the bottom. A small themed crest may rise from the top centre. Separately: a small themed BEST sign plate, blank. No text or numbers.
```

## 3. Pitch
```
On flat #00FF00. A themed cricket pitch strip [e.g. ship's deck planks], top-down, trapezoid: {px(pi['top_w'],'x')} px wide at the top, {px(pi['bottom_w'],'x')} px at the bottom, {pitch_h} px tall. Painted crease lines at each end. Nothing on it.
```

## 4. Stumps, bails, ball
```
On flat #00FF00, evenly spaced, nothing touching:
- ONE themed stump on its own [e.g. carved wooden post, brass cap], upright, 3/4 view
- ONE themed bail on its own
- the same stump tilted/falling at 3 angles
- the themed ball [e.g. dark red leather, gold seam] from above, 4 rotation frames
```

## 5. Fielders — 8 facing directions
```
On flat #00FF00, a grid. The same themed fielder [e.g. pirate deckhand] in each pose, drawn facing 5 directions: towards camera, 3/4 towards camera-left, side-on left, 3/4 away-left, away from camera (the game mirrors for the right = 8 directions).
Rows: ready crouch · run cycle 4 frames · dive · catch (hands up) · throw · celebrate.
Feet at the bottom centre of every cell, all the same scale.
```

## 6. Keeper, bowler, umpire
```
On flat #00FF00, same scale as the fielders.
KEEPER (from behind, facing up-screen): crouch · standing up · catching · appeal.
BOWLER (facing down-screen): run-up 4 frames · delivery stride · follow-through · appeal.
UMPIRE (facing down-screen): idle · OUT (one finger up) · FOUR (arm sweep, 3 frames) · SIX (both arms straight up).
```

## Where things stand in the game (for checking)
- Far stumps {pct(pi['top'])} H, batter's stumps {pct(pi['bottom'])} H, umpire {pct(u['y'])} H, all at 50% W.
- Fielder spots: {', '.join(f"{f['name']} ({pct(f['x'])}, {pct(f['y'])})" for f in fielders)}.
"""
open(os.path.join(HERE, 'PROMPTS.md'), 'w').write(P)
print('ok: layout.json, layout_1170x2532.png, PROMPTS.md')
