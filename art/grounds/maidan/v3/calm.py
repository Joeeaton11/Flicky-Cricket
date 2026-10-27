# Calmer grass inside the boundary: bigger, softer-toned patches so the players read; the busy patchwork stays
# outside the stones. Writes ../v2/plate_calm.png (build.py then pops it into assets/maidan/plate.webp).
import cv2, numpy as np, sys
def calm_floor(h, w, seed=11):
    rs = np.random.RandomState(seed); H2, W2 = h * 2, w * 2
    def field(sc, ax=3.0):
        n = rs.rand(H2 // 8 + 2, W2 // 8 + 2).astype(np.float32)
        n = cv2.GaussianBlur(n, (0, 0), sigmaX=sc * ax / 8, sigmaY=sc / 8)
        n = cv2.resize(n, (W2, H2), interpolation=cv2.INTER_CUBIC); return (n - n.mean()) / (n.std() + 1e-6)
    f1, f2 = field(120), field(150)
    col = np.zeros((H2, W2, 3), np.float32) + (80, 182, 212)              # mown yellow-green
    col[f2 > 0.45] = (70, 178, 200)                                        # greener drifts
    col[f1 > 0.95] = (96, 186, 224)                                        # a few dry light patches
    out = cv2.resize(col, (w, h), interpolation=cv2.INTER_AREA)
    for _ in range(int(h * w / 5200)):
        y, x = rs.randint(4, h - 4), rs.randint(4, w - 4)
        for dx in (-2, 0, 2): cv2.line(out, (x + dx, y), (x + dx + rs.randint(-1, 2), y - 3 - rs.randint(0, 3)), (45, 120, 125), 1, cv2.LINE_AA)
    return out
busy = cv2.imread('../v2/plate.png').astype(np.float32); OH, OW = busy.shape[:2]
calm = calm_floor(OH, OW)
yy, xx = np.mgrid[0:OH, 0:OW]
e = ((xx - 585) / (0.46 * 1170 - 22)) ** 2 + ((yy - 0.6 * 2532) / (0.335 * 2532 - 22)) ** 2
m = np.clip((1.0 - e) / 0.06, 0, 1)
m[:700] *= np.clip((yy[:700] - 640) / 60, 0, 1)                            # never over the far band
out = busy * (1 - m[..., None]) + calm * m[..., None]
cv2.imwrite('../v2/plate_calm.png', out.clip(0, 255).astype(np.uint8))
