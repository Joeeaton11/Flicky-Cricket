# Stand the painting's own side groups/props outside the boundary: start where they were painted, push each one
# clear of the oval (+ boundary stones) in its direction. Writes layout.json [name, x, footY, scale, flip, cheers].
import cv2, numpy as np, json
A = cv2.imread('atlas.png', -1); M = json.load(open('atlas.json')); PX = 1170 / 768 / 2   # plate px per atlas px
EX = [['treeL', 'L', 0], ['umbL', 'L', 1], ['pairL', 'L', 1], ['treeR', 'R', 1], ['bigtree', 'R', 0], ['bags', 'D', 0], ['cart', 'R', 0], ['bench', 'D', 0]]
START = {'cart': (1010, 2330), 'bench': (900, 2470)}   # moved into the bottom-right corner
plate = cv2.imread('plate.png').astype(np.float32); OH = plate.shape[0]
yy, xx = np.mgrid[0:OH, 0:1170]
field = ((xx - 585) / (0.46 * 1170 + 26)) ** 2 + ((yy - 0.6 * 2532) / (0.335 * 2532 + 26)) ** 2 < 1
out = plate.copy(); fitted = []
for n, d, cheer in EX:
    ax, ay, w, h, x, fy = M[n]; x, fy = START.get(n, (x, fy)); im = cv2.resize(A[ay:ay + h, ax:ax + w], None, fx=PX, fy=PX, interpolation=cv2.INTER_AREA)
    hh, ww = im.shape[:2]; al = im[..., 3] > 128
    for _ in range(600):
        X, Y = int(x - ww / 2), int(fy - hh); sub = np.zeros((OH, 1170), bool)
        X0, Y0, X1, Y1 = max(0, X), max(0, Y), min(1170, X + ww), min(OH, Y + hh)
        if X1 > X0 and Y1 > Y0: sub[Y0:Y1, X0:X1] = al[Y0 - Y:Y1 - Y, X0 - X:X1 - X]
        if (sub & field).sum() < 30: break
        x += -4 if d == 'L' else 4 if d == 'R' else 0; fy += 4 if d == 'D' else 0
    fitted.append([n, x, fy, 1, 0, cheer])
    X, Y = int(x - ww / 2), int(fy - hh); X0, Y0, X1, Y1 = max(0, X), max(0, Y), min(1170, X + ww), min(OH, Y + hh)
    s = im[Y0 - Y:Y1 - Y, X0 - X:X1 - X].astype(np.float32); a = s[..., 3:] / 255.; out[Y0:Y1, X0:X1] = out[Y0:Y1, X0:X1] * (1 - a) + s[..., :3] * a
json.dump(fitted, open('layout.json', 'w')); print(json.dumps(fitted))
o = out[:2532].clip(0, 255).astype(np.uint8); cv2.ellipse(o, (585, int(0.6 * 2532)), (int(0.46 * 1170), int(0.335 * 2532)), 0, 0, 360, (255, 0, 255), 3)
cv2.imwrite('/tmp/claude-0/sp/mlay.jpg', cv2.resize(o, (390, 844)))
