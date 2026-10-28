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
if '--erase-vlines' in sys.argv:   # guide lines the model drew down the page
    for xv in [int(v) for v in sys.argv[sys.argv.index('--erase-vlines') + 1].split(',')]:
        mk = np.zeros((h0, w0), np.uint8); mk[:, max(0, xv - 4):xv + 5] = 255
        img = cv2.inpaint(img, mk, 6, cv2.INPAINT_TELEA)
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
c0x, c0y = w0 / 2, h0 * arg('--cy', 0.58)
# field = anything close in colour to the middle of the field (grass, sand, ice, deck...)
labf = cv2.cvtColor(cv2.GaussianBlur(img, (7, 7), 0), cv2.COLOR_BGR2LAB).astype(np.float32)
ref = np.median(labf[int(c0y) - 60:int(c0y) + 60, int(c0x) - 60:int(c0x) + 60].reshape(-1, 3), 0)
grass = np.linalg.norm(labf - ref, axis=2) < arg('--fdist', 24)
if '--edge-white' in sys.argv:   # the boundary is a painted white line on the field
    lr = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    rc = np.hypot(ref[1] - 128, ref[2] - 128)
    grass = ~((np.hypot(lr[..., 1] - 128, lr[..., 2] - 128) < rc * 0.55) & (lr[..., 0] > ref[0] - 25))
pts = []
for ang in np.linspace(0, 2 * np.pi, 720, endpoint=False):
    dx, dy = np.cos(ang), np.sin(ang); run = 0
    for r in range(int(min(w0, h0) * 0.12), int(max(w0, h0) * 0.7)):
        x, y = int(c0x + dx * r), int(c0y + dy * r)
        if not (0 <= x < w0 and 0 <= y < h0): break
        run = 0 if grass[y, x] else run + 1
        if run >= int(arg('--run', 7)): pts.append((c0x + dx * (r - run), c0y + dy * (r - run), ang)); break
pts = np.array(pts)
# extents along the four axes (works for ovals and racetrack shapes): median hit within ±12° of each axis
def axis(a0):
    d = np.abs((pts[:, 2] - a0 + np.pi) % (2 * np.pi) - np.pi)
    return np.median(pts[d < np.radians(12)][:, :2], 0)
R, B_, Lf, T = axis(0), axis(np.pi / 2), axis(np.pi), axis(3 * np.pi / 2)
cx, cy = (Lf[0] + R[0]) / 2, (T[1] + B_[1]) / 2
rx, ry = (R[0] - Lf[0]) / 2 + rope_out, (B_[1] - T[1]) / 2 + rope_out
if '--ellipse' in sys.argv:   # measured by eye when the field edge is too subtle to detect
    cx, cy, rx, ry = [float(v) for v in sys.argv[sys.argv.index('--ellipse') + 1].split(',')]
P = pts
cv = img.copy()
for x, y, _ in pts: cv2.circle(cv, (int(x), int(y)), 2, (0, 0, 255), -1)
for x, y, _ in P: cv2.circle(cv, (int(x), int(y)), 2, (0, 255, 255), -1)
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
if '--radial' in sys.argv:
    # field: exact ellipse fit; beyond the rope blend smoothly back to one uniform scale, so the stands
    # are never stretched (the ring just outside the field is gently squeezed instead)
    out_r = arg('--radial', 1.7)
    px_, py_ = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    rho = np.hypot((px_ - tcx) / trx, (py_ - tcy) / try_)
    t = np.clip((rho - 1) / (out_r - 1), 0, 1); wgt = 1 - t * t * (3 - 2 * t)
    qe_x, qe_y = cx + (px_ - tcx) * rx / trx, cy + (py_ - tcy) * ry / try_
    su = sx * arg('--outer-scale', 1.0)
    qu_x, qu_y = cx + (px_ - tcx) / su, cy + (py_ - tcy) / su
    if '--cut' in sys.argv:   # no blend: scenery at one scale, field cut in exactly (its plain surface can stretch unseen)
        wgt = np.clip((1.0 - rho) / 0.004, 0, 1)
    mx, my = wgt * qe_x + (1 - wgt) * qu_x, wgt * qe_y + (1 - wgt) * qu_y
    _rho = rho
    print(f'radial warp: uniform scale {su:.3f}, rows used {my.min():.0f}..{my.max():.0f} of {h0}')
res = cv2.remap(img, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
need_top = top_s - top_t / sx
print(f'x scale {sx:.3f}, oval-band y scale {sy_mid:.3f} (stretch {sy_mid/sx:.2f}x); source rows used {need_top:.0f}..{bot_s + (H-bot_t)/sx:.0f} of {h0}; cols {src_x[0]:.0f}..{src_x[-1]:.0f} of {w0}')
if need_top < 0: print('WARNING: top of the image runs out (edge pixels repeated)')
if '--cut' in sys.argv and '--radial' in sys.argv:   # seat the field: a soft contact shadow just outside the rope
    sh = np.clip(1 - (_rho - 1) / 0.035, 0, 1) * (_rho > 1)
    res = (res.astype(np.float32) * (1 - 0.35 * sh[..., None])).astype(np.uint8)
if '--clear-inner' in sys.argv:   # erase any painted inner ring / markings inside the field (the game draws its own)
    hs = cv2.cvtColor(res, cv2.COLOR_BGR2HSV)
    yy, xx = np.mgrid[0:H, 0:W]
    zf = arg('--inner-zone', 0.88)
    inside = ((xx - tcx) / (trx * zf)) ** 2 + ((yy - tcy) / (try_ * zf)) ** 2 < 1
    v = hs[..., 2]; th = cv2.subtract(v, cv2.morphologyEx(v, cv2.MORPH_OPEN, np.ones((17, 17), np.uint8)))
    mk = (inside & (((hs[..., 1] < arg('--inner-sat', 70)) & (v > 140)) | ((th > 28) & (hs[..., 0] >= 28) & (hs[..., 0] <= 70) & (hs[..., 1] > 60)))).astype(np.uint8) * 255
    mk = cv2.dilate(mk, np.ones((9, 9), np.uint8))
    res = cv2.inpaint(res, mk, 9, cv2.INPAINT_TELEA)
    print('cleared inner markings:', int((mk > 0).sum()), 'px')
Image.fromarray(cv2.cvtColor(res, cv2.COLOR_BGR2RGB)).save(out, 'WEBP', quality=88, method=6)
os.system(f'python3 {os.path.join(HERE, "layout_from_code.py")} --check {out} >/dev/null')
print('wrote', out)
