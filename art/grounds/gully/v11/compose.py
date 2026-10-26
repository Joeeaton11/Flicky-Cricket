# Gully v11: built for the game's layout, not fitted after the fact.
# One painting (src.png, Figma 166:191), ONE even scale, no warping. It is split into:
#   plate.png  - the street: one continuous painted-sand floor + the far band (buildings, crowd, chai stall, rickshaw)
#   front.png  - the near-side props (fruit cart, cool-box/kit bags/chairs), transparent, drawn over the kerb
# Every object stays at the painting's own scale; the far band and the near props are only moved vertically
# so that nothing painted sits inside the game's oval (FIELD_CY .60, RX .46, RY .335).
import cv2, numpy as np, sys
SRC = cv2.imread('src.png'); BIG = cv2.imread(sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/sp/g11_x4.png')
sh, sw = SRC.shape[:2]
OW, OH = 1170, 2532                       # 3x of a 390x844 phone
S = 0.56 * 3                              # out px per src px (0.56 css)
DX = (OW - sw * S) / 2
TOP_FEET, TOP_FEET_OUT = 595, 0.252 * OH  # far crowd's feet land just above the far kerb
DY_TOP = TOP_FEET_OUT - TOP_FEET * S

hsv = cv2.cvtColor(SRC, cv2.COLOR_BGR2HSV)
sand = (hsv[..., 0] >= 9) & (hsv[..., 0] <= 22) & (hsv[..., 1] >= 115) & (hsv[..., 1] <= 178) & (hsv[..., 2] >= 222)
obj = (~sand).astype(np.uint8)
obj = cv2.morphologyEx(obj, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
obj = cv2.morphologyEx(obj, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
n, lab, st, _ = cv2.connectedComponentsWithStats(obj)

def pick(region_fn, min_area=60):
    m = np.zeros_like(obj)
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if a >= min_area and region_fn(x, y, w, h): m[lab == i] = 1
    return m

# far band: everything whose box starts above the open sand
far = pick(lambda x, y, w, h: y < 640)
far[700:] = 0
# near props: the cart (left) and the cool-box / kit bags / chairs (right); the kids in the middle would
# stand inside the field at this scale, so they are left out
near = pick(lambda x, y, w, h: y > 960 and x < 10 and w > 300) | pick(lambda x, y, w, h: y > 960 and x > 455 and w > 250)
yy, xx = np.mgrid[0:sh, 0:sw]
near[(xx > 455) & (xx < 470)] = 0                                  # keep the right group clear of the kid
near[(xx >= 282) & (xx < 455) & (yy < 1225)] = 0                   # cart: stop before the kids
near[(xx >= 291) & (xx < 455)] = 0                                 # crates end at x 290


def place(img, dy, interp=cv2.INTER_AREA):
    k = S / 4
    M = np.float32([[k, 0, DX], [0, k, dy]])
    return cv2.warpAffine(img, M, (OW, OH), flags=interp, borderMode=cv2.BORDER_CONSTANT)
def place_mask(m, dy):
    M = np.float32([[S, 0, DX], [0, S, dy]])
    big = cv2.warpAffine(cv2.dilate(m, np.ones((3, 3), np.uint8)) * 255, M, (OW, OH), flags=cv2.INTER_LINEAR)
    return cv2.GaussianBlur(big, (5, 5), 0).astype(np.float32) / 255.

# sand floor: the painting's own open sand, cleaned and repeated downward with feathered seams
# clean the open sand (pebbles, the odd edge figure) before it is used as floor
clean = obj.copy(); clean[:620] = 0; clean[1000:] = 0
bigm = cv2.resize(cv2.dilate(clean, np.ones((5, 5), np.uint8)) * 255, (sw * 4, sh * 4), interpolation=cv2.INTER_NEAREST)
sandsrc = cv2.inpaint(BIG[2400:4100], bigm[2400:4100], 9, cv2.INPAINT_TELEA)
base = place(np.concatenate([BIG[:2400] * 0, sandsrc, BIG[4100:] * 0]), DY_TOP).astype(np.float32)
a, b = int(650 * S + DY_TOP), int(990 * S + DY_TOP)     # rows of clean sand in output space
blk = base[a:b]; P = b - a; F = 80
floor = np.zeros((OH + P * 3, OW, 3), np.float32)
y = 0
while y < floor.shape[0]:
    seg = blk[:min(P, floor.shape[0] - y)]
    if y == 0: floor[:len(seg)] = seg
    else:
        w = np.clip(np.arange(len(seg)) / F, 0, 1)[:, None, None]
        floor[y - F:y - F + len(seg)] = floor[y - F:y - F + len(seg)] * (1 - w) + seg * w if y - F + len(seg) <= floor.shape[0] else floor[y - F:y - F + len(seg)]
    y += P - F
floor = floor[:OH]
floor = np.roll(floor, a, 0)   # line the repeats up with the painting's own sand rows

topimg = place(BIG, DY_TOP).astype(np.float32); ft = place_mask(far, DY_TOP)[..., None]
plate = floor * (1 - ft) + topimg * ft
# soft contact shade where the far band meets the floor (the painting's own shadows survive in the mask)
cv2.imwrite('plate.png', plate.clip(0, 255).astype(np.uint8))

# near props are exported as sprites (2x src px) and stood by the game outside the kerb, like the extras
lab2, _ = cv2.connectedComponents(near)
for name, sel in (('cart', lambda x: x < 300), ('camp', lambda x: x > 455)):
    m = near.copy(); m[:, :] = 0
    xs_ = np.arange(sw)[None, :].repeat(sh, 0); m[(near > 0) & sel(xs_)] = 1
    ys, xs = np.nonzero(m); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    al = cv2.resize(cv2.GaussianBlur(cv2.dilate(m, np.ones((3, 3), np.uint8)).astype(np.float32), (3, 3), 0), (sw * 2, sh * 2))[y0 * 2:y1 * 2, x0 * 2:x1 * 2]
    col = cv2.resize(BIG[y0 * 4:y1 * 4, x0 * 4:x1 * 4], ((x1 - x0) * 2, (y1 - y0) * 2), interpolation=cv2.INTER_AREA)
    cv2.imwrite('near_' + name + '.png', np.dstack([col, (al.clip(0, 1) * 255).astype(np.uint8)]))
pv = plate.clip(0, 255).astype(np.uint8)
cv2.ellipse(pv, (OW // 2, int(0.6 * OH)), (int(0.46 * OW), int(0.335 * OH)), 0, 0, 360, (255, 0, 255), 3)
cv2.imwrite('/tmp/claude-0/sp/g11prev.jpg', cv2.resize(pv, (585, 1266), interpolation=cv2.INTER_AREA))
