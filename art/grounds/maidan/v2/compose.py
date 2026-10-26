# Maidan v2 (Figma 169:191): same recipe as Gully v12 - even scale to the screen width, nothing warped.
#   plate.png    the far band (Gothic buildings, rain trees, distant matches, tent, bikes) over a grass floor made
#                from the painting's own open grass (mirror-extended), tall enough for any phone
#   sprites      the trees/spectator groups along the sides and the corner props, cut from the painting with the
#                painting's own grass-shade around them; the game stands them outside the boundary (layout.py)
import cv2, numpy as np, json, sys
SRC = cv2.imread('src.png'); BIG = cv2.imread(sys.argv[1] if len(sys.argv) > 1 else '/tmp/claude-0/sp/m2_x4.png')
sh, sw = SRC.shape[:2]; K = 4
OW = 1170; S = OW / sw                    # out px per src px
OH = 2900                                  # taller than a 390x844 phone (2532) so tall screens are covered
EDGE, TOP = 492, 0.262 * 2532              # far band's front edge -> just above the oval top (plate px 663)
DY = TOP - EDGE * S

hsv = cv2.cvtColor(SRC, cv2.COLOR_BGR2HSV)
ground = (hsv[..., 0] >= 12) & (hsv[..., 0] <= 37) & (hsv[..., 2] >= 135) & (hsv[..., 1] >= 80)
obj = (~ground).astype(np.uint8)
obj = cv2.morphologyEx(obj, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)); obj = cv2.morphologyEx(obj, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))

# grass floor: painted procedurally in the painting's own flat cel layers (light dirt, worn tan, yellow grass,
# green grass, sampled from the open grass) with crisp edges, a few tufts and pebbles - no repeats, no seams.
# Built in plate px at 2x, then halved for clean edges; placed in src px space so place() maps it like the rest.
def cel_floor(h, w, seed=7):
    rs = np.random.RandomState(seed); H2, W2 = h * 2, w * 2
    def field(sc, ax=3.2):
        n = rs.rand(H2 // 8 + 2, W2 // 8 + 2).astype(np.float32)
        n = cv2.GaussianBlur(n, (0, 0), sigmaX=sc * ax / 8, sigmaY=sc / 8)
        n = cv2.resize(n, (W2, H2), interpolation=cv2.INTER_CUBIC); return (n - n.mean()) / (n.std() + 1e-6)
    f1, f2, f3 = field(55), field(70), field(30, 2.4)
    col = np.zeros((H2, W2, 3), np.float32) + (103, 192, 228)          # light dirt (BGR)
    col[f1 > 0.55] = (90, 173, 215)                                     # worn tan
    g = f2 + 0.35 * f3
    col[g > 0.15] = (74, 183, 207)                                      # yellow grass
    col[g > 0.75] = (62, 174, 186)                                      # green grass
    col[(f1 > 1.5) & (g < 0.15)] = (84, 160, 205)                       # a few bare brown scuffs
    out = cv2.resize(col, (w, h), interpolation=cv2.INTER_AREA)
    gm = cv2.resize((g > 0.3).astype(np.uint8), (w, h), interpolation=cv2.INTER_NEAREST)
    for _ in range(int(h * w / 2600)):                                  # grass tufts on the grass
        y, x = rs.randint(4, h - 4), rs.randint(4, w - 4)
        if gm[y, x]:
            for dx in (-2, 0, 2): cv2.line(out, (x + dx, y), (x + dx + rs.randint(-1, 2), y - 4 - rs.randint(0, 3)), (40, 110, 110), 1, cv2.LINE_AA)
    for _ in range(int(h * w / 9000)):                                  # pebbles on the dirt
        y, x = rs.randint(4, h - 4), rs.randint(4, w - 4)
        if not gm[y, x]: cv2.ellipse(out, (x, y), (3, 2), 0, 0, 360, (70, 140, 190), -1, cv2.LINE_AA); cv2.ellipse(out, (x - 1, y - 1), (1, 1), 0, 0, 360, (190, 235, 250), -1)
    return out
floor_plate = cel_floor(OH, OW)
def place(img, h):
    return cv2.warpAffine(img, np.float32([[S / K, 0, 0], [0, S / K, DY]]), (OW, h), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_REFLECT)
floor = floor_plate.astype(np.float32)
far = place(BIG, OH).astype(np.float32)
# far band: everything above row EDGE (soft edge over 30 src rows)
yy = (np.arange(OH)[:, None] - DY) / S
a = np.clip((EDGE + 18 - yy) / 30, 0, 1)[..., None]
plate = floor * (1 - a) + far * a
cv2.imwrite('plate.png', plate.clip(0, 255).astype(np.uint8))

# sprites from the painting below the far band: [name, x0, y0, x1, y1] in src px, plus a merge for bags+jug
BOX = {'treeL': (0, 496, 106, 720), 'umbL': (0, 721, 90, 890), 'pairL': (8, 900, 92, 1033),
       'treeR': (668, 496, 768, 900), 'bigtree': (585, 893, 768, 1376), 'cart': (603, 1093, 724, 1230),
       'bench': (526, 1230, 714, 1360), 'bags': (8, 1183, 228, 1340)}
CUT = {'bigtree': [(603, 1093, 724, 1230), (526, 1230, 714, 1360)]}   # parts that are sprites of their own
spr = {}
for n, (x0, y0, x1, y1) in BOX.items():
    m = obj[y0:y1, x0:x1].copy()
    if y0 > 1000:   # the near grass is darker: tell it from the wood/canvas by hue instead
        hb = hsv[y0:y1, x0:x1]; m = (~((hb[..., 0] >= 20) & (hb[..., 0] <= 37) & (hb[..., 2] >= 40) & (hb[..., 1] >= 60))).astype(np.uint8)
        if n == 'cart': m[(hb[..., 0] >= 36) & (hb[..., 0] <= 60) & (hb[..., 2] < 150)] = 0     # the tree's leaves over it
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)); m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    for cx0, cy0, cx1, cy1 in CUT.get(n, []): m[max(0, cy0 - y0):cy1 - y0, max(0, cx0 - x0):cx1 - x0] = 0
    nn, lab, st, _ = cv2.connectedComponentsWithStats(m)
    keep = np.zeros_like(m)
    for i in range(1, nn):
        if st[i][4] > 60: keep[lab == i] = 1
    al = cv2.GaussianBlur(cv2.dilate(keep, np.ones((3, 3), np.uint8)).astype(np.float32), (3, 3), 0)
    # fade out toward the crop box (not at the painting's own edges) so ground shade never ends in a straight line
    fy_, fx_ = np.mgrid[0:y1 - y0, 0:x1 - x0].astype(np.float32); F = 14.
    fade = np.ones_like(al)
    if x0 > 0: fade = np.minimum(fade, fx_ / F)
    if x1 < sw: fade = np.minimum(fade, (x1 - x0 - 1 - fx_) / F)
    if y1 < sh: fade = np.minimum(fade, (y1 - y0 - 1 - fy_) / F)
    fade = np.minimum(fade, fy_ / F)
    al = cv2.resize(al * fade.clip(0, 1), ((x1 - x0) * 2, (y1 - y0) * 2))
    col = cv2.resize(BIG[y0 * K:y1 * K, x0 * K:x1 * K], ((x1 - x0) * 2, (y1 - y0) * 2), interpolation=cv2.INTER_AREA)
    rgba = np.dstack([col, (al.clip(0, 1) * 255).astype(np.uint8)])
    ys, xs = np.nonzero(rgba[..., 3] > 10)
    spr[n] = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    # where it stood in the painting (plate px, feet = bottom centre), for layout.py
    spr[n + '@'] = ((x0 + (xs.min() + xs.max()) / 4) * S, (y0 + ys.max() / 2) * S + DY)
W = 2048; xs = ys = rh = 0; meta = {}; atlas = np.zeros((4096, W, 4), np.uint8)
for k, im in sorted([(k, v) for k, v in spr.items() if '@' not in k], key=lambda t: -t[1].shape[0]):
    h, w = im.shape[:2]
    if xs + w > W: xs = 0; ys += rh + 4; rh = 0
    atlas[ys:ys + h, xs:xs + w] = im; meta[k] = [xs, ys, w, h, round(spr[k + '@'][0]), round(spr[k + '@'][1])]; xs += w + 4; rh = max(rh, h)
cv2.imwrite('atlas.png', atlas[:ys + rh]); json.dump(meta, open('atlas.json', 'w')); print(meta, 'plate px per atlas px', S / 2)
