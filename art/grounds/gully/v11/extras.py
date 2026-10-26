# Cut the spectator/prop sprites (Figma 167:191, upscaled 4x) out of the green screen.
import cv2, numpy as np, json, sys
BIG = cv2.imread(sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/sp/g11x_x4.png').astype(np.float32)
BOX = {  # sheet px (1024 sheet): x, y, w, h
    'fansR': (42, 44, 398, 308), 'fansL': (612, 37, 370, 323), 'scooter': (430, 232, 212, 234),
    'cyclist': (70, 364, 246, 325), 'wallkids': (722, 415, 259, 271), 'dog': (604, 566, 100, 136),
    'cow': (357, 571, 213, 124), 'vendor': (764, 724, 208, 257), 'chairs': (566, 743, 168, 232),
    'backrow': (40, 740, 472, 252)}
OUTK = 0.5   # keep the sprites at half the 4x size (2x the sheet) - plenty for a 3x phone at this scale
out = {}
for k, (x, y, w, h) in BOX.items():
    p = 6; x0, y0, x1, y1 = (x - p) * 4, (y - p) * 4, (x + w + p) * 4, (y + h + p) * 4
    c = BIG[y0:y1, x0:x1].copy()
    b, g, r = c[..., 0], c[..., 1], c[..., 2]
    gn = g - np.maximum(r, b)
    a = np.clip(1 - (gn - 25) / 70, 0, 1)
    m = (a > 0.5).astype(np.uint8); n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    keep = np.zeros_like(m); big = 1 + np.argmax(st[1:, 4]); bx, by, bw, bh, ba = st[big]
    for i in range(1, n):
        cx, cy = st[i][0] + st[i][2] / 2, st[i][1] + st[i][3] / 2
        inside = bx <= cx <= bx + bw and by <= cy <= by + bh
        if st[i][4] > 0.15 * ba or (inside and st[i][4] > 60): keep[lab == i] = 1
    keep = cv2.dilate(keep, np.ones((5, 5), np.uint8))
    a = a * keep
    # despill: pull the green fringe back to the neighbouring colour
    g2 = np.minimum(g, np.maximum(r, b) + 8); c[..., 1] = np.where(a < 1, g2, g)
    rgba = np.dstack([c, a * 255]).clip(0, 255).astype(np.uint8)
    rgba = cv2.resize(rgba, None, fx=OUTK, fy=OUTK, interpolation=cv2.INTER_AREA)
    ys, xs = np.nonzero(rgba[..., 3] > 10); rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    out[k] = rgba
for k in ('cart', 'camp'): out[k] = cv2.imread('near_' + k + '.png', -1)
# pack into one atlas row-wise
W = 2048; xs = ys = rh = 0; meta = {}; atlas = np.zeros((4096, W, 4), np.uint8)
for k, im in sorted(out.items(), key=lambda t: -t[1].shape[0]):
    h, w = im.shape[:2]
    if xs + w > W: xs = 0; ys += rh + 4; rh = 0
    atlas[ys:ys + h, xs:xs + w] = im; meta[k] = [xs, ys, w, h]; xs += w + 4; rh = max(rh, h)
atlas = atlas[:ys + rh]
cv2.imwrite('extras_atlas.png', atlas); json.dump(meta, open('extras_atlas.json', 'w'))
print(atlas.shape, meta)
