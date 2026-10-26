# Maidan v3: the painting's trees/spectator groups (v2) + the new bespoke props (props.py), all brought to plate
# scale, stood outside the boundary (pushed clear of it in their direction), packed into one atlas for the game.
import cv2, numpy as np, json
from PIL import Image
V2A = cv2.imread('../v2/atlas.png', -1); V2M = json.load(open('../v2/atlas.json')); V2PX = 1170 / 768 / 2   # plate px per v2 atlas px
PA = cv2.imread('props_atlas.png', -1); PM = json.load(open('props_atlas.json')); PPX = 0.29                # plate px per prop atlas px at k=1
OUT_PX = 1.0                                      # plate px per final atlas px
# name, source, k (size), start x, start footY, push, cheers
EX = [['treeL', 'v2', 1.0, 78, 1006, 'L', 0], ['umbL', 'v2', 1.0, 12, 1265, 'L', 1], ['treeR', 'v2', 1.0, 1164, 1278, 'R', 1],
      ['vadapav', 'p', 1.05, 1110, 1130, 'R', 0], ['kids', 'p', 1.0, 1130, 1700, 'R', 1],
      ['team', 'p', 1.0, 130, 2300, 'L', 1], ['scorer', 'p', 1.0, 1060, 2300, 'R', 0], ['sightscreen', 'p', 1.3, 600, 2560, 'D', 0],
      ['kit', 'p', 1.0, 365, 2528, 'D', 0], ['coconut', 'p', 1.0, 845, 2528, 'D', 1], ['bikes', 'p', 1.0, 1090, 2535, 'D', 0]]
def pop(im):   # make the painting pop like the new props: richer saturation, a little contrast
    c = im[..., :3]; hsv = cv2.cvtColor(c, cv2.COLOR_BGR2HSV).astype(np.float32); hsv[..., 1] = np.clip(hsv[..., 1] * 1.16, 0, 255)
    c = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR).astype(np.float32); c = np.clip((c - 128) * 1.07 + 132, 0, 255).astype(np.uint8)
    return np.dstack([c, im[..., 3]]) if im.shape[2] == 4 else c
plate = pop(cv2.imread('../v2/plate.png')); Image.fromarray(cv2.cvtColor(plate, cv2.COLOR_BGR2RGB)).save('../../../../assets/maidan/plate.webp', quality=88, method=6)
plate = plate.astype(np.float32); OH = plate.shape[0]
yy, xx = np.mgrid[0:OH, 0:1170]
field = ((xx - 585) / (0.46 * 1170 + 26)) ** 2 + ((yy - 0.6 * 2532) / (0.335 * 2532 + 26)) ** 2 < 1
out = plate.copy(); fitted = []; imgs = {}
for n, src, k, x, fy, d, cheer in EX:
    if src == 'v2': ax, ay, w, h = V2M[n][:4]; im = pop(V2A[ay:ay + h, ax:ax + w]); f = V2PX * k
    else: ax, ay, w, h = PM[n]; im = PA[ay:ay + h, ax:ax + w]; f = PPX * k
    im = cv2.resize(im, None, fx=f / OUT_PX, fy=f / OUT_PX, interpolation=cv2.INTER_AREA); imgs[n] = im
    hh, ww = im.shape[:2]; al = im[..., 3] > 128
    for _ in range(600):
        X, Y = int(x - ww / 2), int(fy - hh); sub = np.zeros((OH, 1170), bool)
        X0, Y0, X1, Y1 = max(0, X), max(0, Y), min(1170, X + ww), min(OH, Y + hh)
        if X1 > X0 and Y1 > Y0: sub[Y0:Y1, X0:X1] = al[Y0 - Y:Y1 - Y, X0 - X:X1 - X]
        if (sub & field).sum() < 30: break
        x += -4 if d == 'L' else 4 if d == 'R' else 0; fy += 4 if d == 'D' else 0
    fitted.append([n, x, fy, 1, 0, cheer, 0 if src == 'v2' else 1])
    X, Y = int(x - ww / 2), int(fy - hh); X0, Y0, X1, Y1 = max(0, X), max(0, Y), min(1170, X + ww), min(OH, Y + hh)
    sh_ = np.zeros_like(out[..., 0]); cv2.ellipse(sh_, (int(x - ww * 0.1), int(fy)), (int(ww * 0.46), max(4, int(ww * 0.07))), 0, 0, 360, 1, -1)
    out = out * (1 - 0.25 * sh_[..., None])
    s = im[Y0 - Y:Y1 - Y, X0 - X:X1 - X].astype(np.float32); a = s[..., 3:] / 255.; out[Y0:Y1, X0:X1] = out[Y0:Y1, X0:X1] * (1 - a) + s[..., :3] * a
W = 2048; xs = ys = rh = 0; meta = {}; atlas = np.zeros((4096, W, 4), np.uint8)
for k_, im in sorted(imgs.items(), key=lambda t: -t[1].shape[0]):
    h, w = im.shape[:2]
    if xs + w > W: xs = 0; ys += rh + 4; rh = 0
    atlas[ys:ys + h, xs:xs + w] = im; meta[k_] = [xs, ys, w, h]; xs += w + 4; rh = max(rh, h)
Image.fromarray(cv2.cvtColor(atlas[:ys + rh], cv2.COLOR_BGRA2RGBA)).save('../../../../assets/maidan/sprites.webp', quality=90, method=6)
print('atlas:' + json.dumps(meta, separators=(',', ':'))); print('sprites:' + json.dumps(fitted, separators=(',', ':')))
o = out[:2532].clip(0, 255).astype(np.uint8); cv2.ellipse(o, (585, int(0.6 * 2532)), (int(0.46 * 1170), int(0.335 * 2532)), 0, 0, 360, (255, 0, 255), 3)
cv2.imwrite('/tmp/claude-0/sp/m3lay.jpg', cv2.resize(o, (390, 844)))
