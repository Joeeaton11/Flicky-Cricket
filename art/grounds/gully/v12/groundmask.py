# Where a passing rickshaw may show: open sand (lit or shaded) and plain pavement in the band behind the far kerb,
# minus the painted objects it must pass behind (chai stall, stool, fruit cart, crates, scooter, lamp post).
import cv2, numpy as np
from PIL import Image
p = cv2.imread('plate.png'); h = cv2.cvtColor(p, cv2.COLOR_BGR2HSV)
sand = (h[..., 0] >= 6) & (h[..., 0] <= 24) & (h[..., 1] >= 90) & (h[..., 2] >= 120)
pave = (h[..., 1] < 38) & (h[..., 2] > 110) & (h[..., 2] < 235)
m = (sand | pave).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
for x0, y0, x1, y1 in [(205, 440, 380, 670), (200, 630, 265, 700), (785, 470, 1005, 700), (940, 620, 1095, 745), (722, 320, 750, 470)]:
    m[y0:y1, x0:x1] = 0
m[:430] = 0; m[900:] = 0
m[:, :205] = 0; m[:, 1005:] = 0          # it comes out from behind the fruit cart and goes behind the chai stall
a = cv2.GaussianBlur(m.astype(np.float32) * 255, (3, 3), 0).astype(np.uint8)
small = cv2.resize(a, (585, 1266), interpolation=cv2.INTER_AREA)
rgba = np.zeros((1266, 585, 4), np.uint8); rgba[..., 3] = small
Image.fromarray(rgba).save('../../../../assets/gully/art_groundmask.webp', lossless=True)
cv2.imwrite('/tmp/claude-0/sp/mask.jpg', np.dstack([small] * 3)[200:470])
