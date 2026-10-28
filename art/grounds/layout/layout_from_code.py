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

# ---------- HUD: measured from the running game (Gully Cup, the signed-off HUD layout) ----------
e_x0, e_y0, e_x1, e_y1 = find(r'sx = X\(' + N + r'\), sy = Y\(' + N + r'\), sw = X\(' + N + r'\) - sx, sh = Y\(' + N + r'\)', 'energy bar')
def measure_hud():
    from playwright.sync_api import sync_playwright
    hook = """(()=>{const o=CanvasRenderingContext2D.prototype.drawImage;window._hud={};
      CanvasRenderingContext2D.prototype.drawImage=function(img,...a){try{if(typeof GULLY_ART!=='undefined')for(const k of ['board3','pause','sign','strip'])if(GULLY_ART[k]===img&&a.length>=4)window._hud[k]=a.slice(-4)}catch(e){}return o.call(this,img,...a)}})()"""
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 390, 'height': 844}); pg.add_init_script(hook)
        pg.goto('file://' + os.path.abspath(GAME) + '?scene=gully'); pg.wait_for_timeout(5000)
        hud = pg.evaluate("JSON.parse(JSON.stringify(window._hud))")
        nm = pg.evaluate("(()=>{const m=document.getElementById('matchName');m.textContent='PLAYERNAME';m.classList.remove('hidden');const r=m.getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()")
        b.close()
    for k in ('board3', 'pause', 'sign', 'strip'):
        if k not in hud: sys.exit(f'HUD NOT FOUND in running game: {k}')
    f = lambda r: dict(left=r[0]/390, top=r[1]/844, right=(r[0]+r[2])/390, bottom=(r[1]+r[3])/844)
    bd = hud['board3']; k = bd[2] / 1265
    energy = [bd[0] + e_x0*k, bd[1] + e_y0*(bd[3]/455), bd[0] + e_x1*k, bd[1] + e_y1*(bd[3]/455)]
    return dict(scoreboard=f(bd), energy_bar=f([energy[0], energy[1], energy[2]-energy[0], energy[3]-energy[1]]),
                pause_button=f(hud['pause']), last_six_balls=f(hud['strip']), best_score_sign=f(hud['sign']),
                name_plate=dict(f(nm), note='bottom inset 0 in test; sits ~14px higher on iPhones with a home bar'))
HUD = measure_hud()

L = {
  'size': [W, H],
  'field_oval': dict(cx=0.5, cy=cy, rx=rx, ry=ry, left=0.5-rx, right=0.5+rx, top=cy-ry, bottom=cy+ry),
  'boundary_rope': 'on the field_oval edge',
  'inner_ring': dict(cx=0.5, cy=cy-r_dy, rx=rx*r_fx, ry=ry*r_fy, left=0.5-rx*r_fx, right=0.5+rx*r_fx, top=cy-r_dy-ry*r_fy, bottom=cy-r_dy+ry*r_fy),
  'pitch': dict(top=p_top, bottom=p_bot, top_w=p_tw, bottom_w=p_bw),
  'stumps_far': dict(x=0.5, y=p_top, height_px=s_far*SCALE), 'stumps_near': dict(x=0.5, y=p_bot, height_px=s_near*SCALE),
  'umpire': dict(x=0.5, y=p_top - ump_off/844),
  **HUD,
  'fielder_spots': fielders,
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
    for f in fielders:
        x, y = px(f['x'],'x'), px(f['y'],'y'); d.ellipse([x-16, y-16, x+16, y+16], outline=(255,230,0,alpha), width=5)
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
SURROUNDINGS: fill the whole canvas edge to edge, top to bottom, with themed stands, crowd and scenery, OUTSIDE the oval only. No empty bands at the top or bottom.
The game draws these on top, so keep the scenery behind them simple (no faces or key props hidden under them): scoreboard {area(sb)}; pause button {area(ps)}; last-six-balls strip {area(st)}; BEST score sign {area(bs)}; name plate {area(nm)}.
```

## 2. HUD layer: scoreboard, energy bar, BEST score sign, pause, last-six strip
```
On flat #00FF00 green, each piece separate, nothing touching. All blank: no text or numbers.
- SCOREBOARD, {px(sb['right']-sb['left'],'x')}x{px(sb['bottom']-sb['top'],'y')} px: two equal blank number panels, left (RUNS) and right (TARGET), each with a blank label strip above. A small themed crest may rise from the top centre.
- ENERGY BAR: an empty themed bar track built into the bottom of the scoreboard, {px(en['right']-en['left'],'x')}x{px(en['bottom']-en['top'],'y')} px, centred under the two panels (the game fills it).
- BEST SCORE SIGN, {px(bs['right']-bs['left'],'x')}x{px(bs['bottom']-bs['top'],'y')} px: a themed hanging sign with a blank panel, hangs under the TARGET panel.
- PAUSE BUTTON, {px(ps['right']-ps['left'],'x')} px round: themed badge with a pause symbol.
- LAST-SIX-BALLS STRIP, {px(st['right']-st['left'],'x')}x{px(st['bottom']-st['top'],'y')} px: themed holder with 6 empty round sockets in a row.
```
A themed display font is chosen per ground; the game draws RUNS, TARGET, the numbers, the energy fill and BEST in it.

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
- HUD (measured from the live game): scoreboard {area(sb)}; energy bar {area(en)}; BEST sign {area(bs)}; pause {area(ps)}; last six {area(st)}; name plate {area(nm)}.
- Far stumps {pct(pi['top'])} H, batter's stumps {pct(pi['bottom'])} H, umpire {pct(u['y'])} H, all at 50% W.
- Fielder spots — 17 places the game can put a fielder (10 on the field at once: keeper + 4 infield + 5 boundary, plus the bowler): {', '.join(f"{f['name']} ({pct(f['x'])}, {pct(f['y'])})" for f in fielders)}.
"""
open(os.path.join(HERE, 'PROMPTS.md'), 'w').write(P)
print('ok: layout.json, layout_1170x2532.png, PROMPTS.md')
