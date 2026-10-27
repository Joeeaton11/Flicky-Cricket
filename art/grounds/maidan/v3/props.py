# Maidan v3 props (Figma 170:191, green screen, upscaled 4x): key, find the eight items, pack an atlas.
import cv2, numpy as np, json, sys
BIG = cv2.imread(sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/sp/m3p_x4.png').astype(np.float32)
small = cv2.imread('props_src.png').astype(int); gn = small[..., 1] - np.maximum(small[..., 0], small[..., 2])
m = (gn < 60).astype(np.uint8); m = cv2.dilate(m, np.ones((11, 11), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
items = sorted([st[i] for i in range(1, n) if st[i][4] > 3000], key=lambda s: (s[1] // 300, s[0]))
NAMES = ['sightscreen', 'scorer', 'team', 'coconut', 'vadapav', 'bikes', 'kids', 'kit']
out = {}
for name, (x, y, w, h, a) in zip(NAMES, items):
    x0, y0, x1, y1 = x * 4, y * 4, (x + w) * 4, (y + h) * 4
    c = BIG[y0:y1, x0:x1].copy(); b, g, r = c[..., 0], c[..., 1], c[..., 2]
    al = np.clip(1 - (g - np.maximum(r, b) - 25) / 70, 0, 1)
    mm = (al > 0.5).astype(np.uint8); nn, ll, ss, _ = cv2.connectedComponentsWithStats(mm)
    big = 1 + np.argmax(ss[1:, 4]); keep = np.zeros_like(mm)
    for i in range(1, nn):
        bx, by, bw, bh = ss[big][:4]; cx, cy = ss[i][0] + ss[i][2] / 2, ss[i][1] + ss[i][3] / 2
        if ss[i][4] > 0.2 * ss[big][4] or (bx <= cx <= bx + bw and by <= cy <= by + bh and ss[i][4] > 1500): keep[ll == i] = 1
    al = al * cv2.dilate(keep, np.ones((5, 5), np.uint8))
    LIM = {'team': (None, 404), 'coconut': (417, None)}     # the rug and the coconut pile nearly touch in the sheet
    if name in LIM:
        lo, hi = LIM[name]; X = np.arange(al.shape[1])[None, :] / 4 + x
        if lo: al = al * (X >= lo)
        if hi: al = al * (X <= hi)
    c[..., 1] = np.where(al < 1, np.minimum(g, np.maximum(r, b) + 8), g)
    # pop: a touch more saturation and contrast
    hsv = cv2.cvtColor(c.clip(0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
    hsv[..., 1] = np.clip(hsv[..., 1] * 1.12, 0, 255); c = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32)
    c = np.clip((c - 128) * 1.06 + 128, 0, 255)
    rgba = cv2.resize(np.dstack([c, al * 255]).clip(0, 255).astype(np.uint8), None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
    ys, xs = np.nonzero(rgba[..., 3] > 10); out[name] = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    print(name, x, y, w, h, out[name].shape)
W = 2048; xs = ys = rh = 0; meta = {}; atlas = np.zeros((4096, W, 4), np.uint8)
for k, im in sorted(out.items(), key=lambda t: -t[1].shape[0]):
    h, w = im.shape[:2]
    if xs + w > W: xs = 0; ys += rh + 4; rh = 0
    atlas[ys:ys + h, xs:xs + w] = im; meta[k] = [xs, ys, w, h]; xs += w + 4; rh = max(rh, h)
cv2.imwrite('props_atlas.png', atlas[:ys + rh]); json.dump(meta, open('props_atlas.json', 'w')); print(meta)
