# Where the extra spectators/props stand, in plate px (1170x2532 frame). Feet anchored: [name, x, footY, scale, flip, bob]
# Shared with the game (GULLY_EXTRAS in flicky-cricket.html) - keep the two in step.
import cv2, numpy as np, json
EX = [   # name, x, footY, scale, flip, bob, push-direction (fit.py pushes it clear of the kerb that way)
    ['cow',       95,  930, 0.95, 0, 0, 'L'],
    ['scooter',   60, 1150, 1.00, 0, 1, 'L'],
    ['cyclist',   60, 2120, 1.10, 0, 0, 'L'],
    ['cart',     130, 2560, 1.68, 0, 0, 'D'],
    ['dog',      330, 2525, 1.10, 0, 0, 'D'],
    ['backrow',  600, 2600, 1.15, 0, 1, 'D'],
    ['camp',     990, 2560, 1.68, 0, 0, 'D'],
    ['vendor',  1100, 2170, 1.10, 1, 0, 'R'],
    ['wallkids',1110, 1130, 1.00, 0, 1, 'R'],
]
PX = 0.5   # plate px per atlas px at scale 1
if __name__ == '__main__':
    A = cv2.imread('extras_atlas.png', -1); M = json.load(open('extras_atlas.json'))
    plate = cv2.imread('plate.png').astype(np.float32)
    def over(dst, im, x, y):
        h, w = im.shape[:2]; X0, Y0 = max(0, x), max(0, y); X1, Y1 = min(dst.shape[1], x + w), min(dst.shape[0], y + h)
        if X1 <= X0 or Y1 <= Y0: return
        s = im[Y0 - y:Y1 - y, X0 - x:X1 - x].astype(np.float32); a = s[..., 3:] / 255.
        dst[Y0:Y1, X0:X1] = dst[Y0:Y1, X0:X1] * (1 - a) + s[..., :3] * a
    out = plate.copy()
    yy, xx = np.mgrid[0:2532, 0:1170]
    field = ((xx - 585) / (0.46 * 1170 + 34)) ** 2 + ((yy - 0.6 * 2532) / (0.335 * 2532 + 34)) ** 2 < 1
    fitted = []
    for n, x, fy, sc, fl, bob, d in EX:
        ax, ay, w, h = M[n]; im = A[ay:ay + h, ax:ax + w]
        if fl: im = im[:, ::-1]
        k = PX * sc; im = cv2.resize(im, None, fx=k, fy=k, interpolation=cv2.INTER_AREA)
        hh, ww = im.shape[:2]; al = im[..., 3] > 128
        for step in range(400):
            X, Y = int(x - ww / 2), int(fy - hh)
            sub = np.zeros((2532, 1170), bool)
            X0, Y0, X1, Y1 = max(0, X), max(0, Y), min(1170, X + ww), min(2532, Y + hh)
            if X1 > X0 and Y1 > Y0: sub[Y0:Y1, X0:X1] = al[Y0 - Y:Y1 - Y, X0 - X:X1 - X]
            if (sub & field).sum() < 40: break
            if d == 'L': x -= 4
            elif d == 'R': x += 4
            else: fy += 4
        fitted.append([n, x, fy, sc, fl, bob]); over(out, im, int(x - ww / 2), int(fy - hh))
    json.dump(fitted, open('extras_layout.json', 'w')); print(fitted)
    o = out.clip(0, 255).astype(np.uint8)
    cv2.imwrite('/tmp/claude-0/sp/g11full.png', o)
    cv2.ellipse(o, (585, int(0.6 * 2532)), (int(0.46 * 1170), int(0.335 * 2532)), 0, 0, 360, (255, 0, 255), 3)
    cv2.rectangle(o, (int(0.12 * 1170), int(0.091 * 2532)), (int(0.88 * 1170), int(0.235 * 2532)), (255, 255, 255), 3)
    cv2.imwrite('/tmp/claude-0/sp/g11lay.jpg', cv2.resize(o, (585, 1266), interpolation=cv2.INTER_AREA))
