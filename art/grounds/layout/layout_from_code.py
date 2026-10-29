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

# ---------- HUD: MATCH_HUD in the game code (locked Oct 29, option 11 corner scorebug) ----------
m = re.search(r'const MATCH_HUD\s*=\s*\{(.*?)\n\};', src, re.S)
if not m: sys.exit('LAYOUT NOT FOUND in code: MATCH_HUD')
HUD = {k: dict(left=float(l), top=float(t), right=float(r), bottom=float(b_)) for k, l, t, r, b_ in
       re.findall(r'(\w+):\s*\{\s*l:([0-9.]+),\s*t:([0-9.]+),\s*r:([0-9.]+),\s*b:([0-9.]+)', m.group(1))}
for k in ('scorebug', 'pause_button'):
    if k not in HUD: sys.exit(f'MATCH_HUD missing {k}')
def inside(A, B): return A['left'] >= B['left'] and A['right'] <= B['right'] and A['top'] >= B['top'] and A['bottom'] <= B['bottom']
for k in HUD:
    if k.startswith('sb_') and not inside(HUD[k], HUD['scorebug']): sys.exit(f'{k} sits outside the scorebug — fix MATCH_HUD')
for grp in ([k for k in HUD if not k.startswith('sb_')], [k for k in HUD if k.startswith('sb_') and k != 'sb_wickets']):
  ks = grp
  for i in range(len(ks)):
    for j in range(i + 1, len(ks)):
        A, B = HUD[ks[i]], HUD[ks[j]]
        if A['left'] < B['right'] and B['left'] < A['right'] and A['top'] < B['bottom'] and B['top'] < A['bottom']:
            sys.exit(f'HUD OVERLAP: {ks[i]} and {ks[j]} — fix MATCH_HUD in the game code')
if not inside(HUD['sb_wickets'], HUD['sb_chase_line']) and HUD['sb_wickets']['left'] < HUD['sb_chase_line']['right']:
    pass
if HUD['scorebug']['bottom'] >= cy - ry: sys.exit('HUD covers the field: scorebug reaches the rope')

# text spec + scaling rule (MATCH_HUD_TEXT / MATCH_HUD_SCALE in the code), evaluated with node
import subprocess
def js_const(name):
    m = re.search(r'const ' + name + r'\s*=\s*(\{[^\n]*\});', src) or re.search(r'const ' + name + r'\s*=\s*(\{.*?\n\});', src, re.S)
    if not m: sys.exit(f'LAYOUT NOT FOUND in code: {name}')
    return json.loads(subprocess.run(['node', '-e', 'console.log(JSON.stringify(' + m.group(1) + '))'], capture_output=True, text=True, check=True).stdout)
HUD_TEXT, HUD_SCALE = js_const('MATCH_HUD_TEXT'), js_const('MATCH_HUD_SCALE')
for k in HUD_TEXT:
    if k not in HUD: sys.exit(f'MATCH_HUD_TEXT has {k} but MATCH_HUD has no box for it')
for k in HUD:
    if k != 'scorebug' and k not in HUD_TEXT: sys.exit(f'MATCH_HUD_TEXT missing {k}')

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
# play zones from the game code (positions at 390x844)
pt, pb = p_top, p_bot
L['zones'] = {
  'safe_top':      dict(left=0, top=0, right=1, bottom=59/844, note='status bar / Dynamic Island: no UI, simple art'),
  'home_bar':      dict(left=0, top=1-34/844, right=1, bottom=1, note='iPhone home indicator'),
  'popup_words':   dict(left=0.08, top=HUD['scorebug']['bottom']+0.01, right=0.92, bottom=L['umpire']['y']-45/844, note='FOUR!/SIX!/OUT! pop-ups (brief, over the field)'),
  'bowler_runup':  dict(left=0.5, top=pt-62/844-0.03, right=0.58, bottom=pt+0.01, note='bowler run-up (drawGullyBowler)'),
  'batter':        dict(left=0.44, top=pb-0.065, right=0.56, bottom=pb, note='batter (drawBatsman)'),
  'keeper':        dict(left=0.45, top=pb+12/844-0.02, right=0.55, bottom=pb+50/844, note='keeper up/back range (drawWicketKeeper)'),
  'lastover_glow': dict(left=HUD['scorebug']['left']-0.012, top=HUD['scorebug']['top']-0.006, right=HUD['scorebug']['right']+0.012, bottom=HUD['scorebug']['bottom']+0.006, note='last-over glow round the scorebug (code)'),
}
json.dump(L, open(os.path.join(HERE, 'layout.json'), 'w'), indent=1)

def pct(v): return f'{v*100:.1f}%'
def px(v, axis): return round(v * (W if axis == 'x' else H))

# ---------- template image (PNG) + Figma layers (SVG) ----------
COL = {'scorebug':(255,200,0), 'pause_button':(255,140,0), 'name_plate':(255,90,90),
       'sb_badge':(255,235,120), 'sb_chase_line':(255,120,120), 'sb_wickets':(255,255,255), 'sb_score_target':(120,220,255),
       'sb_this_over':(190,160,255), 'sb_energy_icon':(120,255,140), 'sb_energy_track':(80,255,80),
       'safe_top':(160,160,160), 'home_bar':(160,160,160), 'popup_words':(255,120,220), 'bowler_runup':(255,255,255),
       'batter':(255,255,255), 'keeper':(255,255,255), 'lastover_glow':(255,70,70)}
NAMES = {'scorebug':'SCOREBOARD', 'pause_button':'PAUSE', 'name_plate':'NAME TAG', 'sb_badge':'BADGE', 'sb_chase_line':'CHASE: 14 TO WIN OFF 9',
         'sb_wickets':'WKTS', 'sb_score_target':'SCORE + TGT', 'sb_this_over':'THIS OVER x6', 'sb_energy_icon':'', 'sb_energy_track':'ENERGY',
         'safe_top':'SAFE AREA (status bar)', 'home_bar':'HOME BAR', 'popup_words':'POP-UP WORDS (FOUR! SIX! OUT!)', 'bowler_runup':'BOWLER RUN-UP',
         'batter':'BATTER', 'keeper':'KEEPER', 'lastover_glow':''}
DASHED = {'safe_top', 'home_bar', 'popup_words', 'lastover_glow', 'bowler_runup'}
def all_boxes():
    for k in L['zones']: yield k, L['zones'][k]
    for k in HUD: yield k, HUD[k]

def dashed_rect(d, x0, y0, x1, y1, col, w, dash=18):
    for x in range(int(x0), int(x1), dash*2): d.line([(x, y0), (min(x+dash, x1), y0)], fill=col, width=w); d.line([(x, y1), (min(x+dash, x1), y1)], fill=col, width=w)
    for y in range(int(y0), int(y1), dash*2): d.line([(x0, y), (x0, min(y+dash, y1))], fill=col, width=w); d.line([(x1, y), (x1, min(y+dash, y1))], fill=col, width=w)

def draw_template(img, alpha=255, labels=True):
    d = ImageDraw.Draw(img, 'RGBA')
    fo, ir, pi = L['field_oval'], L['inner_ring'], L['pitch']
    try: fs = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22); ft = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
    except Exception: fs = ft = None
    def oval(o, col, w): d.ellipse([px(o['left'],'x'), px(o['top'],'y'), px(o['right'],'x'), px(o['bottom'],'y')], outline=col, width=w)
    oval(fo, (255,255,255,alpha), 8); oval(ir, (255,255,255,int(alpha*.6)), 4)
    tl, tr = 0.5 - pi['top_w']/2, 0.5 + pi['top_w']/2; bl, br = 0.5 - pi['bottom_w']/2, 0.5 + pi['bottom_w']/2
    d.polygon([(px(tl,'x'),px(pi['top'],'y')),(px(tr,'x'),px(pi['top'],'y')),(px(br,'x'),px(pi['bottom'],'y')),(px(bl,'x'),px(pi['bottom'],'y'))], outline=(0,200,255,alpha), width=5)
    for st in ('stumps_far', 'stumps_near'):
        x, y, h = px(L[st]['x'],'x'), px(L[st]['y'],'y'), L[st]['height_px']
        d.rectangle([x-h*.35, y-h, x+h*.35, y], outline=(255,80,200,alpha), width=4)
    u = L['umpire']; d.ellipse([px(u['x'],'x')-18, px(u['y'],'y')-18, px(u['x'],'x')+18, px(u['y'],'y')+18], fill=(255,255,255,alpha))
    for k, r in all_boxes():
        c = COL[k] + (alpha,); x0, y0, x1, y1 = px(r['left'],'x'), px(r['top'],'y'), px(r['right'],'x'), px(r['bottom'],'y')
        if k in DASHED: dashed_rect(d, x0, y0, x1, y1, c, 4)
        else: d.rectangle([x0, y0, x1, y1], outline=c, width=6 if k in ('scorebug','pause_button','name_plate') else 3)
    if labels:
        lab = {'scorebug':('right',), 'name_plate':('above',), 'home_bar':('inside',), 'safe_top':('inside',)}
        for k, r in all_boxes():
            t = NAMES[k]
            if not t: continue
            c = COL[k] + (alpha,); x0, y0, x1, y1 = px(r['left'],'x'), px(r['top'],'y'), px(r['right'],'x'), px(r['bottom'],'y')
            where = lab.get(k, ('inside',))[0]
            if k == 'pause_button': d.text((x0-4, y1+6), t, fill=c, font=fs); continue
            if k == 'sb_energy_track': d.text((x0+10, y0-1), t, fill=c, font=fs); continue
            if k in ('batter','keeper','bowler_runup'): d.text((x1+10, (y0+y1)//2-11), t, fill=c, font=fs); continue
            if where == 'right': d.text((x1+12, y1-26), t, fill=c, font=fs)
            elif where == 'below': d.text((x0+4, y1+10), t, fill=c, font=fs)
            elif where == 'above': d.text((x0+4, y0-30), t, fill=c, font=fs)
            else: d.text((x0+6, y0+5), t, fill=c, font=fs)
        d.text((px(fo['right'],'x')-330, px(fo['cy'],'y')), 'BOUNDARY ROPE', fill=(255,255,255,alpha), font=ft)
        d.text((px(ir['left'],'x')+30, px(ir['top'],'y')+40), '30-YARD RING', fill=(255,255,255,alpha), font=fs)
        d.text((px(0.5,'x')+30, px(u['y'],'y')-48), 'UMPIRE', fill=(255,255,255,alpha), font=fs)
        d.text((px(0.5,'x')-200, px((pi['top']+pi['bottom'])/2,'y')), 'PITCH', fill=(0,200,255,alpha), font=ft)
        d.text((px(fo['left'],'x')+90, px(ir['bottom'],'y')+60), 'FIELDERS: anywhere inside the rope (they move)', fill=(255,255,255,alpha), font=fs)
    return img

def write_svg(path):
    fo, ir, pi = L['field_oval'], L['inner_ring'], L['pitch']
    def hx(c): return '#%02x%02x%02x' % c
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">', f'<rect id="phone 1170x2532" width="{W}" height="{H}" fill="#2a6e33"/>']
    o.append('<g id="FIELD">')
    for nm, e, w in (('boundary rope', fo, 8), ('30-yard ring', ir, 4)):
        o.append(f'<ellipse id="{nm}" cx="{px(e["cx"],"x")}" cy="{px(e["cy"],"y")}" rx="{px(e["rx"],"x")}" ry="{px(e["ry"],"y")}" fill="none" stroke="#fff" stroke-width="{w}"/>')
    tl, tr = 0.5 - pi['top_w']/2, 0.5 + pi['top_w']/2; bl, br = 0.5 - pi['bottom_w']/2, 0.5 + pi['bottom_w']/2
    o.append(f'<polygon id="pitch" points="{px(tl,"x")},{px(pi["top"],"y")} {px(tr,"x")},{px(pi["top"],"y")} {px(br,"x")},{px(pi["bottom"],"y")} {px(bl,"x")},{px(pi["bottom"],"y")}" fill="none" stroke="#00c8ff" stroke-width="5"/>')
    for st in ('stumps_far', 'stumps_near'):
        x, y, h = px(L[st]['x'],'x'), px(L[st]['y'],'y'), L[st]['height_px']
        o.append(f'<rect id="{st.replace("_"," ")}" x="{x-h*.35:.0f}" y="{y-h:.0f}" width="{h*.7:.0f}" height="{h:.0f}" fill="none" stroke="#ff50c8" stroke-width="4"/>')
    u = L['umpire']; o.append(f'<circle id="umpire" cx="{px(u["x"],"x")}" cy="{px(u["y"],"y")}" r="18" fill="#fff"/>')
    o.append('</g>')
    for grp, keys in (('PLAY ZONES', list(L['zones'])), ('HUD', [k for k in HUD if not k.startswith('sb_')]), ('SCOREBOARD PARTS', [k for k in HUD if k.startswith('sb_')])):
        o.append(f'<g id="{grp}">')
        for k in keys:
            r = L['zones'].get(k) or HUD[k]
            x0, y0, x1, y1 = px(r['left'],'x'), px(r['top'],'y'), px(r['right'],'x'), px(r['bottom'],'y')
            dash = ' stroke-dasharray="18 18"' if k in DASHED else ''
            o.append(f'<rect id="{NAMES[k] or k}" x="{x0}" y="{y0}" width="{x1-x0}" height="{y1-y0}" fill="none" stroke="{hx(COL[k])}" stroke-width="4"{dash}/>')
            t = HUD_TEXT.get(k)
            if t:
                f3 = SCALE * (390 * HUD_SCALE['widthOfW']) / HUD_SCALE['baseW']   # px at 1170 wide
                cx = x0 + 10
                if k == 'sb_chase_line':
                    big, l1, l2 = t['parts']; fb, f1, f2 = big['px']*f3, l1['px']*f3, l2['px']*f3; mid = (y0+y1)/2
                    o.append(f'<text id="{k} · {big["text"]} · {big["px"]}px" x="{cx:.0f}" y="{mid + fb*0.35:.0f}" font-family="Lilita One, Arial" font-size="{fb:.0f}" fill="#fff">{big["text"]}</text>')
                    lx = cx + fb*0.62*len(big['text']) + 12
                    o.append(f'<text id="{k} · {l1["text"]} · {l1["px"]}px" x="{lx:.0f}" y="{mid - 4:.0f}" font-family="Lilita One, Arial" font-size="{f1:.0f}" fill="#ffd2d2">{l1["text"]}</text>')
                    o.append(f'<text id="{k} · {l2["text"]} · {l2["px"]}px" x="{lx:.0f}" y="{mid + f2 + 2:.0f}" font-family="Lilita One, Arial" font-size="{f2:.0f}" fill="#fff">{l2["text"]}</text>')
                    continue
                if k == 'sb_this_over':
                    rr = t['parts'][0]['px']*f3/2; n = 6; gap = ((x1-x0) - n*2*rr)/(n-1)
                    for i in range(n): o.append(f'<circle id="ball {i+1}" cx="{x0+rr+i*(2*rr+gap):.0f}" cy="{(y0+y1)/2:.0f}" r="{rr:.0f}" fill="none" stroke="#b4c2dd" stroke-width="3"/>')
                    continue
                if k == 'sb_wickets':
                    hh = t['parts'][0]['px']*f3; ww = hh*0.7
                    for i in range(2):
                        sx = x1 - (2-i)*(ww+10)
                        o.append(f'<g id="stump set {i+1}" opacity="{0.3 if i == 0 else 1}">' + ''.join(f'<rect x="{sx + j*ww*0.38:.0f}" y="{(y0+y1)/2-hh/2+6:.0f}" width="{ww*0.18:.0f}" height="{hh-6:.0f}" fill="#fff"/>' for j in range(3)) + f'<rect x="{sx:.0f}" y="{(y0+y1)/2-hh/2:.0f}" width="{ww:.0f}" height="5" fill="#ffc93a"/></g>')
                    continue
                for part in t['parts']:
                    if part['text'] in ('2 stumps', '6 sockets', 'fill', 'bolt icon', 'league crest image', 'pause icon'): continue
                    fs_ = part['px'] * f3
                    o.append(f'<text id="{k} · {part["text"]} · {part["px"]}px" x="{cx:.0f}" y="{(y0+y1)/2 + fs_*0.35:.0f}" font-family="Lilita One, Arial" font-size="{fs_:.0f}" fill="#fff">{part["text"]}</text>')
                    cx += fs_ * 0.6 * len(part['text']) + 14
        o.append('</g>')
    o.append('</svg>')
    open(path, 'w').write('\n'.join(o))

if '--check' in sys.argv:
    p = sys.argv[sys.argv.index('--check') + 1]
    im = Image.open(p).convert('RGBA').resize((W, H))
    out = os.path.splitext(p)[0] + '_check.png'
    draw_template(im, 230).convert('RGB').save(out); print('check image:', out); sys.exit()

tpl = Image.new('RGBA', (W, H), (40, 110, 50, 255))
draw_template(tpl).convert('RGB').save(os.path.join(HERE, 'layout_1170x2532.png'))
write_svg(os.path.join(HERE, 'layout_1170x2532.svg'))

# ---------- prompts ----------
fo, ir, pi, sb, u = L['field_oval'], L['inner_ring'], L['pitch'], L['scorebug'], L['umpire']
ps = L['pause_button']
def frac(v):
    for n, w in ((0.5,'half'),(0.6,'three fifths'),(0.62,'just over three fifths'),(0.66,'two thirds')):
        if abs(v-n) < 0.015: return w
    return f'{round(v*100)} percent'
def area(r): return f"{pct(r['left'])}–{pct(r['right'])} W, {pct(r['top'])}–{pct(r['bottom'])} H"
pitch_h = px(pi['bottom'],'y') - px(pi['top'],'y')
def text_spec():
    sc = HUD_SCALE
    out = ['### Scoreboard text spec (MATCH_HUD_TEXT in the code; sizes at the 230 px-wide scoreboard, scale with its width)',
           f"Scaling: the scoreboard keeps its shape on every phone — width {round(sc['widthOfW']*100)}% of the screen, height from the {sc['baseW']}:{round(sc['baseW']/sc['aspect'])} shape, top-left, {sc['gapUnderSafeTop']} px under the safe area. Digits are fixed-width so ticking numbers don't jiggle.",
           '', '| Slot | Content (size) | Alignment | Longest / states |', '|---|---|---|---|']
    for k, t in HUD_TEXT.items():
        parts = ' + '.join(f"{p_['text']} ({p_['px']}px)" for p_ in t['parts'])
        extra = ' · '.join(x for x in (t.get('longest',''), t.get('states','')) if x)
        nm_ = {'sb_chase_line':'Chase line','sb_wickets':'Wickets','sb_score_target':'Score + target','sb_this_over':'This over','sb_energy_icon':'Energy icon','sb_energy_track':'Energy bar','sb_badge':'Badge','pause_button':'Pause'}.get(k, k)
        out.append(f"| {nm_} | {parts} | {t['align']} | {extra} |")
    return '\n'.join(out)
TEXT_SPEC = text_spec()
P = f"""# Ground prompts — generated from the game code
Do not edit by hand. Re-run `python3 art/grounds/layout/layout_from_code.py` after any layout change.
Replace [THEME] and the [e.g. …] parts per ground. Every result is checked with `--check` and aligned to the template before use.

## Shared block (top of every prompt)
```
ART STYLE: glossy, ultra-vibrant 3D-rendered cartoon mobile-game key art, like Clash of Clans / Boom Beach promo art: hyper-saturated colours that pop (vivid turquoise water, lush emerald foliage, rich golds and reds), warm glowing lanterns and lights with soft bloom, strong rim lighting, deep ambient-occlusion shadows, crisp chunky detail, high contrast, everything polished and shiny. Chunky cute proportions (big heads, short bodies). Fantasy themes go big: fun, cool, over the top. Camera: high 3/4 top-down view from far away and high above, looking straight up a cricket ground in portrait: a wide view where the stadium is big and grand and the wider scene around it (skyline, landscape, sky) is visible beyond the stands.
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
TIGHT STADIUM (very important): the field's edge IS the foot of the stands. The stadium starts right at the field edge. Only a thin ring of boards (or the theme's equivalent) separates the field from the crowd and scenery: no wide band of bare outfield, track, sand or empty ground. The front row of the crowd sits immediately behind the boards: no grass, concourse or walkway between the boards and the seats. The grass stops at the boards: no grass anywhere outside the boards, all the way round, including at the top and bottom.
The field edge is a clean crisp line. NO rope, NO markers, NO inner ring, NO lines on the field: the game draws the themed rope, boundary markers and 30-yard ring markers from the props sheet, exactly on the coded oval.
EMPTY: no pitch, stumps, players, umpire, ball or text on the field.
SURROUNDINGS: busy, fun and cool — packed with life, characters and detail, edge to edge and top to bottom, OUTSIDE the oval only. Real-world themes (e.g. an IPL ground) should look like the real thing, in the home team's colours. No empty bands at the top or bottom.
SCREEN ZONES (the game's interface sits on top of these; paint scenery there, just keep it simple):
- TOP-LEFT BLOCK: from the left edge to {frac(sb['right'])} of the way across, and from the top down to about {round(sb['bottom']*100)} percent of the height: a scoreboard covers it. Simple background only here (sky, roofs, plain stand tops); no faces, landmarks or key props.
- TOP-RIGHT CORNER: a small round button sits in the very top-right corner. Keep that small spot plain.
- THE REST OF THE TOP (right of the scoreboard and below it, down to the stands): this stays on show the whole match. Put the ground's showpiece here: its landmark, skyline highlight or most fun detail [e.g. a lighthouse, a ship's mast, a giant tree with kids in it].
- Nothing is ever drawn on the field, so the field stays fully visible.
This is a background only: never paint any game interface, buttons, icons, panels or scoreboards.
```

## 2. HUD layer: corner scoreboard + pause (locked Oct 29, option 11)
Ball-limited chase (12 balls, 2 wickets). One compact scoreboard top-left, pause top-right, nothing else above the rope, nothing on the field.
```
On the flat key background, each piece separate, nothing touching. All blank: no text or numbers.
- SCOREBOARD, {px(sb['right']-sb['left'],'x')}x{px(sb['bottom']-sb['top'],'y')} px, three stacked bands in one themed frame:
  · top band (about 55%): a small square badge slot on the left (league crest), then a wide blank panel for the chase line, with TWO empty wicket slots at its right end.
  · middle band (about 35%): a blank area on the left for score and target, then 6 empty round sockets in a row on the right (this over).
  · bottom band (about 10%): a thin empty energy track across the full width, with a small icon slot at its left end for a themed energy symbol.
- PAUSE BUTTON, {px(ps['right']-ps['left'],'x')} px round: themed badge with a pause symbol.
```
A themed display font is chosen per ground; the game draws the chase line ("14 TO WIN · OFF 9 BALLS"), score, target, ball results, stumps (greyed when lost) and energy fill in it.
Last over / close finish is done by code, not art: a pulsing glow round the scoreboard and the chase panel tinted to an alert colour. Paint the frame so a glow round its outline reads well.
BEST score is not on the match screen; it shows on the result screen.

{TEXT_SPEC}

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
- HUD (MATCH_HUD in the code): scoreboard {area(sb)}; pause {area(ps)}.
- Far stumps {pct(pi['top'])} H, batter's stumps {pct(pi['bottom'])} H, umpire {pct(u['y'])} H, all at 50% W.
"""
open(os.path.join(HERE, 'PROMPTS.md'), 'w').write(P)
print('ok: layout.json, layout_1170x2532.png, layout_1170x2532.svg, PROMPTS.md')
