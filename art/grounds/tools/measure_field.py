# Boundary check for ANY surface: per angle, phone-px distance from the coded oval to the painted field edge
# (+ = surface beyond the coded oval). Outlier rays (props over the boards) are ignored. usage: python3 measure_field.py plate.png
import numpy as np, cv2, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from field_mask import edge_points
o = cv2.imread(sys.argv[1]); H, W = o.shape[:2]; cx, cy, rx, ry = .5 * W, .6 * H, .46 * W, .335 * H
small = cv2.resize(o, (W * 768 // 1170, H * 768 // 1170), interpolation=cv2.INTER_AREA); s = 1170 / 768
p = edge_points(small, (cx / s, cy / s), n=180) * s
a = np.arctan2((p[:, 1] - cy) / ry, (p[:, 0] - cx) / rx)
g = np.hypot(p[:, 0] - cx, p[:, 1] - cy) - np.hypot(np.cos(a) * rx, np.sin(a) * ry)
med = np.median(g); keep = np.abs(g - med) < max(15, 3 * np.median(np.abs(g - med)))
deg = np.degrees(a) % 360
print('per 30deg:', [(d, round(float(np.median(g[keep & (deg >= d) & (deg < d + 30)])), 1)) for d in range(0, 360, 30)])
print('max %.1f p90 %.1f (outlier rays dropped %d)' % (np.abs(g[keep]).max(), np.percentile(np.abs(g[keep]), 90), (~keep).sum()))
