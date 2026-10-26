# Plant the batter's back foot: for every batter sprite (bat_*, shot_*) find the back foot (the white shoe nearest the
# camera = lowest on screen) and set ax/ay so that foot lands exactly where the stance's back foot is, every pose.
import re, base64, io, json, numpy as np, cv2
from PIL import Image
P = 'flicky-cricket.html'; s = open(P).read()
GS = {'bat': 0.117, 'shot': 0.1485, 'react': 0.126}
def grp(n): return 'react' if n in ('bat_out', 'bat_raise') else 'shot' if n.startswith('shot_') else 'bat'
ENT = re.compile(r'"((?:bat|shot)_[a-z_]+)": \{"src": "data:image/webp;base64,([^"]*)", "ax": ([0-9.]+), "ay": ([0-9.]+), "k": ([0-9.]+)')
RIGHTMOST = False
LEVEL = {'shot_pull_b', 'shot_revsweep_b', 'shot_revsweep_c', 'shot_revsweep'}   # feet level or kneeling: use the rightmost (back) shoe                                     # poses with both feet level
def backfoot(b64, rightmost=False):
    global RIGHTMOST; RIGHTMOST = rightmost
    im = np.array(Image.open(io.BytesIO(base64.b64decode(b64))).convert('RGBA')).astype(int); h = im.shape[0]
    r, g, b, a = im[..., 0], im[..., 1], im[..., 2], im[..., 3]; mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
    shoe = ((a > 128) & (mn > 140) & (mx - mn < 45)).astype(np.uint8); shoe[:int(h * 0.75)] = 0
    n, l, st, _ = cv2.connectedComponentsWithStats(shoe)
    c = [i for i in range(1, n) if st[i][4] > 60]
    i = max(c, key=lambda i: st[i][1] + st[i][3])            # lowest blob = nearest the camera = back foot
    if RIGHTMOST: i = max(c, key=lambda i: st[i][0] + st[i][2])   # feet level: the standing (right) foot
    ys, xs = np.nonzero(l == i); bot = ys.max(); x = xs[ys >= bot - 6].mean()
    return float(x), float(bot)
found = {m.group(1): m for m in ENT.finditer(s)}
sx, sy = backfoot(found['bat_stance'].group(2)); m = found['bat_stance']
scS = GS['bat'] / float(m.group(5)); ax0, ay0 = float(m.group(3)), float(m.group(4))
tdx, tdy = (sx - ax0) * scS, (sy - ay0) * scS              # stance back foot relative to the anchor, in screen units (per H)
out = {}
for n, m in found.items():
    if n in ('bat_out', 'bat_raise'): continue             # the walk-off / celebration move on their own
    x, y = backfoot(m.group(2), n in LEVEL); sc = GS[grp(n)] / float(m.group(5))
    out[n] = (round(x - tdx / sc, 1), round(y - tdy / sc, 1))
def fix(mm):
    n = mm.group(1)
    if n not in out: return mm.group(0)
    return f'"{n}": {{"src": "data:image/webp;base64,{mm.group(2)}", "ax": {out[n][0]}, "ay": {out[n][1]}, "k": {mm.group(5)}'
s = ENT.sub(fix, s); open(P, 'w').write(s); print(json.dumps(out))
