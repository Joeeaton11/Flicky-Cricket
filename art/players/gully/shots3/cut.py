# All batting shots redone from behind (Figma 172:191). Key, cut the ten figures, mirror two for the leg side,
# size each so the HELMET matches the stance sprite's helmet on screen (pose-independent), and anchor each so the
# shoes land where the stance's shoes are (the batter stays planted). Writes shot_*.webp + meta.json.
import cv2, numpy as np, json, sys
from PIL import Image
BIG = cv2.imread(sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/sp/shots3_x4.png').astype(np.float32)
sm = cv2.imread('src.png').astype(int); gn = sm[..., 1] - np.maximum(sm[..., 0], sm[..., 2])
m = cv2.dilate((gn < 60).astype(np.uint8), np.ones((9, 9), np.uint8)); n, lab, st, _ = cv2.connectedComponentsWithStats(m)
boxes = sorted([st[i] for i in range(1, n) if st[i][4] > 4000], key=lambda s: (s[1] // 300, s[0]))
print(len(boxes))
ORDER = ['defend', 'drive', 'coverdrive', 'pull', 'latecut', 'dab', 'cut', 'slash', 'revsweep', 'slog']
# stance reference (from the game file): helmet 70 px wide, shoes centre 47, ax 66.7, k .6262, group 'bat' .117
SC_S = 0.117 / 0.6262; HW_S = 70 * SC_S; OFF_S = (47 - 66.7) * SC_S; SHOT = 0.1485
def figure(box):
    x, y, w, h, a = box
    c = BIG[y * 4:(y + h) * 4, x * 4:(x + w) * 4].copy(); b, g, r = c[..., 0], c[..., 1], c[..., 2]
    al = np.clip(1 - (g - np.maximum(r, b) - 25) / 70, 0, 1)
    mm = (al > 0.5).astype(np.uint8); nn, ll, ss, _ = cv2.connectedComponentsWithStats(mm); big = 1 + np.argmax(ss[1:, 4])
    keep = np.zeros_like(mm); bx, by, bw, bh = ss[big][:4]
    for i in range(1, nn):
        cx, cy = ss[i][0] + ss[i][2] / 2, ss[i][1] + ss[i][3] / 2
        if ss[i][4] > 0.2 * ss[big][4] or (bx <= cx <= bx + bw and by <= cy <= by + bh and ss[i][4] > 300): keep[ll == i] = 1
    al = al * cv2.dilate(keep, np.ones((5, 5), np.uint8))
    c[..., 1] = np.where(al < 1, np.minimum(g, np.maximum(r, b) + 8), g)
    rgba = np.dstack([c, al * 255]).clip(0, 255).astype(np.uint8)
    ys, xs = np.nonzero(rgba[..., 3] > 10); rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    s = 320 / rgba.shape[0]; return cv2.resize(rgba, (max(1, round(rgba.shape[1] * s)), 320), interpolation=cv2.INTER_AREA)
def measure(rgba):
    p = rgba.astype(int); bb, gg, rr, aa = p[..., 0], p[..., 1], p[..., 2], p[..., 3]
    navy = (bb > rr + 18) & (bb > gg + 6) & (aa > 128); top = np.nonzero(navy.sum(1) > 3)[0].min()
    band = navy[top:top + int(0.13 * 320)]
    nn, ll, ss, _ = cv2.connectedComponentsWithStats(band.astype(np.uint8)); hb = 1 + np.argmax(ss[1:, 4])
    hw = ss[hb][2]
    mn = np.minimum(np.minimum(rr, gg), bb); mx = np.maximum(np.maximum(rr, gg), bb)
    shoe = (aa > 128) & (mn > 150) & (mx - mn < 40); shoe[:int(320 * 0.86)] = False
    fx = np.nonzero(shoe.any(0))[0]; fm = (fx.min() + fx.max()) / 2
    return hw, fm
figs = {name: figure(b) for name, b in zip(ORDER, boxes)}
figs['flick'] = figs.pop('dab')[:, ::-1].copy()       # mirrored: the bat turns down to the LEG side by the pad
figs['sweep'] = figs['revsweep'][:, ::-1].copy()       # mirrored: down on one knee, swept to the leg side
meta = {}
for name, im in figs.items():
    hw, fm = measure(im); p = im.astype(int); navy = (p[..., 0] > p[..., 2] + 18) & (p[..., 0] > p[..., 1] + 6) & (p[..., 3] > 128)
    top = np.nonzero(navy.sum(1) > 3)[0].min()
    # helmet-to-shoes height matches the stance sprite on screen (59.8 css); a kneeling batter is ~72% as tall
    k = (319 - top) / (403 * (0.72 if 'sweep' in name else 1.0)); sc = SHOT / k; ax = fm - OFF_S / sc
    Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGRA2RGBA)).save(f'shot_{name}.webp', quality=92, method=6)
    meta[name] = {'ax': round(float(ax), 1), 'ay': 319.3, 'k': round(float(k), 4)}; print(name, im.shape, hw, fm, meta[name])
json.dump(meta, open('meta.json', 'w'))
