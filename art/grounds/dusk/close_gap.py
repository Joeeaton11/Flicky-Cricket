# Close the grass gap between the coded field edge (rope) and the painted boards (Joe: no gap between boundary and stadium).
# Per angle, measure the gap g; pull the boards ring in by g (kept rigid for T px) and ease the stand back over D px.
import numpy as np, cv2, sys
src, dst = sys.argv[1], sys.argv[2]; T, D = 60, 600
MODE = sys.argv[3] if len(sys.argv) > 3 else 'copy'; BW = 26   # BW: painted boards thickness in px
img = cv2.imread(src); H, W = img.shape[:2]; cx, cy, rx, ry = .5*W, .6*H, .46*W, .335*H
hs = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(int)
Bc, Gc, Rc = [img[..., i].astype(int) for i in range(3)]
green0 = ((Gc > Rc + 15) & (Gc > Bc + 40)).astype(np.uint8)   # grass only (painted teal boards are not grass)
n_, lab_ = cv2.connectedComponents(cv2.morphologyEx(green0, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)))
green = lab_ == lab_[int(cy), int(cx)]
N = 720; g = np.zeros(N)
for i in range(N):
    t = 2*np.pi*i/N; R = np.hypot(np.cos(t)*rx, np.sin(t)*ry); s = 0
    while s < 260:
        x = int(cx + np.cos(t)*(rx + 0)*(1 + s/R)); y = int(cy + np.sin(t)*ry*(1 + s/R))
        if not (0 <= x < W and 0 <= y < H) or not green[y, x]: break
        s += 1
    g[i] = s + 3 if s > 0 else 0   # +3: also tuck the soft grass/board seam under the rope
k = np.exp(-0.5*(np.arange(-30, 31)/10.0)**2); k /= k.sum()
g = np.convolve(np.concatenate([g[-30:], g, g[:30]]), k, 'same')[30:-30]
yy, xx = np.mgrid[:H, :W].astype(np.float32)
dx, dy = (xx - cx)/rx, (yy - cy)/ry; rho = np.sqrt(dx*dx + dy*dy) + 1e-6
th = np.arctan2(dy, dx) % (2*np.pi); gi = g[(th/(2*np.pi)*N).astype(int) % N]
R = np.hypot(np.cos(th)*rx, np.sin(th)*ry); s = (rho - 1)*R
# boards ring pulled in rigidly (T px), the stand behind eased back over up to D px — never past the picture edge
smax = np.zeros(N)
for i in range(N):
    t = 2*np.pi*i/N; Rr = np.hypot(np.cos(t)*rx, np.sin(t)*ry); q = 0
    while q < 2000:
        x = cx + np.cos(t)*rx*(1 + q/Rr); y = cy + np.sin(t)*ry*(1 + q/Rr)
        if not (0 <= x < W and 0 <= y < H): break
        q += 2
    smax[i] = q
idx = (th/(2*np.pi)*N).astype(int) % N
Dd = np.clip(smax[idx] - T - gi - 4, 30, D)
if MODE == 'copy':   # copy the painted boards in over the grass gap; crowd and stands left exactly as painted (no warp)
    disp = np.where((s >= -2) & (s < gi + 2), gi + 2, 0)
else:
    disp = np.where(s < 0, 0, np.where(s <= T, gi, np.where(s <= T + Dd, gi*(1 - (s - T)/Dd), 0)))
# never sample from outside the picture: cap the pull so it fades out toward the picture edge
redge = (smax[idx] + R) / R   # rho at the picture edge along this ray
disp = np.minimum(disp, np.maximum(0, (redge - rho) * R * 0.5))
rs = rho + disp/R
mx = (cx + dx/rho*rs*rx).astype(np.float32); my = (cy + dy/rho*rs*ry).astype(np.float32)
out = cv2.remap(img, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
cv2.imwrite(dst, out); print('max gap', round(g.max(), 1))
