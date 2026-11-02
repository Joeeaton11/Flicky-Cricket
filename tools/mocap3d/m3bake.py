"""Encode batter sprite passes (sp_<clip>/w_,n_,d_,m_*.png + meta.json) into GP_SRC entries like the old m3_* set:
ink lines, crop, scale so the stance stands the same height as before, 2 px outline, WebP + lossless class mask, back-foot anchor."""
import json, base64, io, os, sys
import numpy as np
from PIL import Image, ImageEnhance
W = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, W)
from ink import ink
from outline2d import add_outline
# clip -> key prefix ('m3_' for the off drive keeps the old names: stance, lift0-3, hit0-16)
CLIPS = {'drive': 'm3_', 'cover': 'm3_coverdrive_', 'shot_forward_defence': 'm3_defend_', 'shot_straight_drive': 'm3_drive_',
         'shot_on_drive': 'm3_ondrive_', 'shot_cut': 'm3_cut_', 'shot_pull': 'm3_pull_', 'shot_leg_glance': 'm3_flick_',
         'shot_reverse_sweep': 'm3_revsweep_', 'shot_sweep': 'm3_sweep_', 'shot_scoop': 'm3_scoop_', 'shot_backfoot_drive': 'm3_backfoot_'}
K = 0.8806; STANCE_H = 426            # old m3_stance figure height (px, before its outline), so the batter draws the same size
def b64(im, **kw):
    b = io.BytesIO(); im.save(b, 'WEBP', **kw); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
st = Image.open(f'{W}/sp_drive/w_stance.png'); bb = st.getbbox(); F = STANCE_H / (bb[3] - bb[1])
print('scale', round(F, 4))
out = {}; sheet = []
for clip, pre in CLIPS.items():
    D = f'{W}/sp_{clip}'
    if not os.path.exists(f'{D}/meta.json'): print('skip', clip); continue
    M = json.load(open(f'{D}/meta.json')); names = [n for n, _ in M['seq']]
    cols = []
    for n in names:
        c = ink(Image.open(f'{D}/w_{n}.png'), Image.open(f'{D}/n_{n}.png'), Image.open(f'{D}/d_{n}.png'), Image.open(f'{D}/m_{n}.png'), thick=3)
        cols.append(c)
    bbs = [c.getbbox() for c in cols]
    x0 = min(b[0] for b in bbs) - 6; y0 = min(b[1] for b in bbs) - 6; x1 = max(b[2] for b in bbs) + 6; y1 = max(b[3] for b in bbs) + 6
    sf = M['stance_feet']; back = max(sf.values(), key=lambda p: p[1])          # the foot nearer the camera = his back foot
    y1 = max(y1, int(back[1]) + 4)
    w, h = round((x1 - x0) * F), round((y1 - y0) * F)
    ax, ay = round((back[0] - x0) * F, 1), round((back[1] - y0) * F, 1)
    for n, c in zip(names, cols):
        s = c.crop((x0, y0, x1, y1)).resize((w, h), Image.LANCZOS)
        s = ImageEnhance.Color(s).enhance(1.15); s = ImageEnhance.Contrast(s).enhance(1.14); s = ImageEnhance.Brightness(s).enhance(0.96); s = add_outline(s, 2)
        mk = Image.open(f'{D}/m_{n}.png').convert('RGBA').crop((x0, y0, x1, y1)).resize((w, h), Image.NEAREST)
        out[pre + n] = {'src': b64(s, quality=86, method=6), 'mask': b64(mk, lossless=True), 'ax': ax, 'ay': ay, 'k': K}
        sheet.append((pre + n, s))
    print(clip, len(names), 'frames', (w, h), 'anchor', (ax, ay))
json.dump(out, open(f'{W}/m3_sprites.json', 'w'), separators=(',', ':'))
print('entries', len(out), 'KB', sum(len(v['src']) + len(v['mask']) for v in out.values()) // 1024)
# contact sheet: every frame on the Gully pitch colour, anchored at the back foot
cw, ch = 300, 470; per = 22
rows = (len(sheet) + per - 1) // per
sh = Image.new('RGBA', (cw * per // 2, ch * rows * 2), (205, 160, 105, 255))
for i, (k, s) in enumerate(sheet):
    t = s.copy(); t.thumbnail((cw, ch)); sh.alpha_composite(t, ((i % (per // 2)) * cw, (i // (per // 2)) * ch))
sh.convert('RGB').save(f'{W}/m3_sheet.jpg')
