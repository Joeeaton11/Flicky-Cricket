# New batting shots (Figma 171:191): key the green, cut each figure, height 320 like the other shot sprites,
# anchor (ax) between the feet, ay at the soles. Writes shot_<name>.webp + meta.json.
import cv2, numpy as np, json, sys
from PIL import Image
BIG = cv2.imread(sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/sp/shots_x4.png').astype(np.float32)
sm = cv2.imread('src.png').astype(int); gn = sm[..., 1] - np.maximum(sm[..., 0], sm[..., 2])
m = cv2.dilate((gn < 60).astype(np.uint8), np.ones((9, 9), np.uint8)); n, lab, st, _ = cv2.connectedComponentsWithStats(m)
boxes = sorted([st[i] for i in range(1, n) if st[i][4] > 5000], key=lambda s: (s[1] // 400, s[0]))
NAMES = ['slog', 'coverdrive', 'flick', 'loft', 'slash', None]
meta = {}
for name, (x, y, w, h, a) in zip(NAMES, boxes):
    if not name: continue
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
    s = 320 / rgba.shape[0]; rgba = cv2.resize(rgba, (max(1, round(rgba.shape[1] * s)), 320), interpolation=cv2.INTER_AREA)
    # feet: non-wood opaque pixels in the bottom 9% rows; anchor = middle of the leftmost and rightmost foot clusters
    hsv = cv2.cvtColor(rgba[..., :3], cv2.COLOR_BGR2HSV); wood = (hsv[..., 0] >= 8) & (hsv[..., 0] <= 25) & (hsv[..., 1] > 60)
    foot = (rgba[..., 3] > 128) & ~wood; foot[:int(320 * 0.91)] = False
    fx = np.nonzero(foot.any(0))[0]; ax = float((fx.min() + fx.max()) / 2)
    Image.fromarray(cv2.cvtColor(rgba, cv2.COLOR_BGRA2RGBA)).save(f'shot_{name}.webp', quality=92, method=6)
    meta[name] = {'ax': round(ax, 1), 'ay': 319.3, 'w': rgba.shape[1]}
    print(name, rgba.shape, meta[name])
json.dump(meta, open('meta.json', 'w'))
