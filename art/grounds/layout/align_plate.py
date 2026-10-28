#!/usr/bin/env python3
"""Fit a generated ground image to the coded field oval.
  python3 align_plate.py raw.png out.webp [--rope-out PX] [--tol N]
Finds the painted field (flood fill from the oval centre over grass), fits an ellipse to it by moments,
then maps it so the painted rope sits exactly on the game's oval (layout.json):
  x: one uniform scale about the oval centre (sides cropped)
  y: top band and bottom band keep the x scale (no stretch; bottom is cropped), the oval band is scaled to fit exactly.
Writes out.webp at 1170x2532 and out_check.png with the template overlaid."""
import sys, json, os, numpy as np, cv2
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(os.path.join(HERE, 'layout.json')))
W, H = L['size']; fo = L['field_oval']
raw, out = sys.argv[1], sys.argv[2]
arg = lambda k, d: float(sys.argv[sys.argv.index(k) + 1]) if k in sys.argv else d
rope_out, tol = arg('--rope-out', 6), arg('--tol', 26)
img = cv2.imread(raw); h0, w0 = img.shape[:2]
if '--erase-box' in sys.argv:   # a placeholder box the model drew: lift its tint and paint out its border
    x0, y0, x1, y1 = [int(v) for v in sys.argv[sys.argv.index('--erase-box') + 1].split(',')]
    f = img.astype(np.float32)
    ins = f[y0 + 8:y1 - 8, x0 + 8:x1 - 8]
    outer = np.concatenate([f[y0 + 8:y1 - 8, max(0, x0 - 14):x0 - 6].reshape(-1, 3), f[y0 + 8:y1 - 8, x1 + 6:x1 + 14].reshape(-1, 3), f[y1 + 6:y1 + 14, x0:x1].reshape(-1, 3)])
    edge_in = np.concatenate([ins[:, :6].reshape(-1, 3), ins[:, -6:].reshape(-1, 3), ins[-6:].reshape(-1, 3)])
    ratio = (outer.mean(0) + 1) / (edge_in.mean(0) + 1)
    f[y0 + 4:y1 - 4, x0 + 4:x1 - 4] *= ratio
    img = np.clip(f, 0, 255).astype(np.uint8)
    mk = np.zeros((h0, w0), np.uint8); cv2.rectangle(mk, (x0, y0), (x1, y1), 255, 12)
    img = cv2.inpaint(img, mk, 7, cv2.INPAINT_TELEA)
    print('erased box, tint ratio', ratio.round(2))
# find the rope: rays from the field centre; the rope is the first solid run of non-grass pixels
hsv = cv2.cvtColor(cv2.GaussianBlur(img, (5, 5), 0), cv2.COLOR_BGR2HSV)
grass = (hsv[..., 0] >= 28) & (hsv[..., 0] <= 95) & (hsv[..., 1] >= 50) & (hsv[..., 2] >= 40)
c0x, c0y = w0 / 2, h0 * arg('--cy', 0.58)
pts = []
for ang in np.linspace(0, 2 * np.pi, 720, endpoint=False):
    dx, dy = np.cos(ang), np.sin(ang); run = 0
    for r in range(int(min(w0, h0) * 0.12), int(max(w0, h0) * 0.7)):
        x, y = int(c0x + dx * r), int(c0y + dy * r)
        if not (0 <= x < w0 and 0 <= y < h0): break
        run = 0 if grass[y, x] else run + 1
        if run >= int(arg('--run', 7)): pts.append((c0x + dx * (r - run), c0y + dy * (r - run))); break
pts = np.array(pts)
def fit(P):   # axis-aligned ellipse: A x^2 + B y^2 + C x + D y = 1
    X = np.c_[P[:, 0] ** 2, P[:, 1] ** 2, P[:, 0], P[:, 1]]
    A, B, C, D = np.linalg.lstsq(X, np.ones(len(P)), rcond=None)[0]
    cx, cy = -C / (2 * A), -D / (2 * B); k = 1 + C * C / (4 * A) + D * D / (4 * B)
    return cx, cy, np.sqrt(k / A), np.sqrt(k / B)
P = pts
for _ in range(4):   # drop flags, gaps and stray hits, refit
    cx, cy, rx, ry = fit(P)
    e = np.abs(np.hypot((P[:, 0] - cx) / rx, (P[:, 1] - cy) / ry) - 1)
    P = P[e < max(0.02, np.percentile(e, 70))]
cx, cy, rx, ry = fit(P); rx += rope_out; ry += rope_out
cv = img.copy()
for x, y in pts: cv2.circle(cv, (int(x), int(y)), 2, (0, 0, 255), -1)
for x, y in P: cv2.circle(cv, (int(x), int(y)), 2, (0, 255, 255), -1)
cv2.ellipse(cv, (int(cx), int(cy)), (int(rx), int(ry)), 0, 0, 360, (255, 0, 255), 2)
cv2.imwrite(os.path.splitext(out)[0] + '_fit.png', cv)
print(f'painted oval: centre ({cx:.0f},{cy:.0f}) radii ({rx:.0f},{ry:.0f}) of {w0}x{h0}; {len(P)}/{len(pts)} rope points kept')
# target oval in px
tcx, tcy, trx, try_ = W * 0.5, H * fo['cy'], W * fo['rx'], H * fo['ry']
sx = trx / rx                        # uniform x scale
sy_mid = try_ / ry                   # oval band y scale
top_s, bot_s = cy - ry, cy + ry      # source rope top / bottom
top_t, bot_t = tcy - try_, tcy + try_
# y map target -> source (inverse), piecewise: above the oval use sx, inside sy_mid, below sx
ty = np.arange(H, dtype=np.float32)
src_y = np.where(ty < top_t, top_s - (top_t - ty) / sx,
         np.where(ty > bot_t, bot_s + (ty - bot_t) / sx, top_s + (ty - top_t) / sy_mid))
tx = np.arange(W, dtype=np.float32)
src_x = cx + (tx - tcx) / sx
mx, my = np.meshgrid(src_x, src_y)
res = cv2.remap(img, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
need_top = top_s - top_t / sx
print(f'x scale {sx:.3f}, oval-band y scale {sy_mid:.3f} (stretch {sy_mid/sx:.2f}x); source rows used {need_top:.0f}..{bot_s + (H-bot_t)/sx:.0f} of {h0}; cols {src_x[0]:.0f}..{src_x[-1]:.0f} of {w0}')
if need_top < 0: print('WARNING: top of the image runs out (edge pixels repeated)')
if '--clear-inner' in sys.argv:   # erase any painted inner ring / markings inside the field (the game draws its own)
    hs = cv2.cvtColor(res, cv2.COLOR_BGR2HSV)
    yy, xx = np.mgrid[0:H, 0:W]
    inside = ((xx - tcx) / (trx * 0.88)) ** 2 + ((yy - tcy) / (try_ * 0.88)) ** 2 < 1
    mk = (inside & (hs[..., 1] < arg('--inner-sat', 70)) & (hs[..., 2] > 140)).astype(np.uint8) * 255
    mk = cv2.dilate(mk, np.ones((9, 9), np.uint8))
    res = cv2.inpaint(res, mk, 9, cv2.INPAINT_TELEA)
    print('cleared inner markings:', int((mk > 0).sum()), 'px')
Image.fromarray(cv2.cvtColor(res, cv2.COLOR_BGR2RGB)).save(out, 'WEBP', quality=88, method=6)
os.system(f'python3 {os.path.join(HERE, "layout_from_code.py")} --check {out} >/dev/null')
print('wrote', out)
