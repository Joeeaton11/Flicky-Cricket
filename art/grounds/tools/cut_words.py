# Cut ONLY a words sheet (5 pop-up words + 10 digits) into assets/themes/<dir>/ — used for the lettering redo.
# usage: python3 cut_words.py <dir> <words.png>   (env WDY=25 joins a detached "!" dot)
import sys, numpy as np, cv2, os
from PIL import Image
from scipy import ndimage
D_name, words = sys.argv[1:3]
D = f'/home/claude/flicky-cricket/assets/themes/{D_name}/'; os.makedirs(D, exist_ok=True)

def keyed(src):
  im = np.array(Image.open(src).convert('RGB')).astype(float)
  corners = np.concatenate([im[:8, :8].reshape(-1, 3), im[:8, -8:].reshape(-1, 3), im[-8:, :8].reshape(-1, 3), im[-8:, -8:].reshape(-1, 3)])
  key = np.median(corners, 0); green = key[1] > key[0] and key[1] > key[2]
  a = np.clip((np.sqrt(((im - key) ** 2).sum(2)) - 45) / 60, 0, 1); f = im.copy()
  if green:
    ex = np.clip(im[..., 1] - np.maximum(im[..., 0], im[..., 2]), 0, None); a = a * np.clip(1 - ex / 90, 0, 1)
    f[..., 1] = np.minimum(f[..., 1], np.maximum(f[..., 0], f[..., 2]))
  else:
    k = (a < 1) & (a > 0); sp = np.clip(np.minimum(f[..., 0], f[..., 2]) - f[..., 1], 0, None) * k; f[..., 0] -= sp; f[..., 2] -= sp
    rim = (cv2.dilate((a < 1).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0) & (cv2.erode((a >= 1).astype(np.uint8), np.ones((9, 9), np.uint8)) > 0)
    sp = np.clip(np.minimum(f[..., 0], f[..., 2]) - f[..., 1] - 20, 0, None) * rim; f[..., 0] -= sp; f[..., 2] -= sp
  A = cv2.erode((a * 255).astype(np.uint8), np.ones((3, 3), np.uint8))
  return np.dstack([f, A]).clip(0, 255).astype(np.uint8)

def pieces(rgba, dil=6, minpx=400):
  m = rgba[..., 3] > 128
  lab, n = ndimage.label(ndimage.binary_dilation(m, iterations=dil))
  out = []
  for i, sl in enumerate(ndimage.find_objects(lab)):
    if sl is None: continue
    sub = (lab[sl] == i + 1) & m[sl]
    if sub.sum() < minpx: continue
    out.append([sl[1].start, sl[0].start, sl[1].stop, sl[0].stop, sub.sum(), i + 1])
  return out, lab

def crop(rgba, lab, p, maxd=None):
  x0, y0, x1, y1, _, li = p; c = rgba[y0:y1, x0:x1].copy(); c[..., 3] = c[..., 3] * (lab[y0:y1, x0:x1] == li)
  im = Image.fromarray(c); im = im.crop(im.getbbox())
  if maxd and max(im.size) > maxd: k = maxd / max(im.size); im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
  return im

def reading_order(ps):
  ps = sorted(ps, key=lambda p: (p[1] + p[3]) / 2); rows = []
  for p in ps:
    cy = (p[1] + p[3]) / 2
    for r in rows:
      if abs(r[0] - cy) < 0.5 * max(p[3] - p[1], r[1]): r[2].append(p); break
    else: rows.append([cy, p[3] - p[1], [p]])
  return [p for r in rows for p in sorted(r[2], key=lambda q: q[0])]

# ---------- props ----------

# ---------- words ----------
W = keyed(words); m = W[..., 3] > 128
ys = np.where(m.any(1))[0]; prof = m.sum(1)
# digits = the lowest band of ink; split bands by empty rows
bands = []; inb = False
for y in range(W.shape[0]):
  if prof[y] > 0 and not inb: s0 = y; inb = True
  if prof[y] == 0 and inb: bands.append((s0, y)); inb = False
if inb: bands.append((s0, W.shape[0]))
bands = [b for b in bands if b[1] - b[0] > 30]; dy0, dy1 = bands[-1]
wm = W.copy(); wm[dy0:] = 0
lab2, n2 = ndimage.label(cv2.dilate((wm[..., 3] > 128).astype(np.uint8), np.ones((int(os.environ.get('WDY', 3)), 21), np.uint8)))   # WDY: taller joins a detached '!' dot
wps = []
for i, sl in enumerate(ndimage.find_objects(lab2)):
  if sl is None: continue
  wps.append([sl[1].start, sl[0].start, sl[1].stop, sl[0].stop, 0, i + 1])
wps = [p for p in wps if (p[2] - p[0]) * (p[3] - p[1]) > 4000]; wps = reading_order(wps)
if len(wps) != 5: print('words found', len(wps), [p[:4] for p in wps]); sys.exit(1)
for n_, p in zip(['w_four', 'w_six', 'w_caught', 'w_bowled', 'w_out'], wps):
  im = crop(W, lab2, p, 700); w_, h_ = im.size; lim = 2.4 if n_ == 'w_six' else 3.9
  if w_ / h_ > lim: c = Image.new('RGBA', (w_, round(w_ / lim))); c.alpha_composite(im, (0, (c.height - h_) // 2)); im = c
  im.save(D + n_ + '.webp', quality=90)
cols = m[dy0:dy1].sum(0); segs = []; inn = False
for x, c in enumerate(cols):
  if c > 0 and not inn: s0 = x; inn = True
  if c == 0 and inn: segs.append((s0, x)); inn = False
if inn: segs.append((s0, len(cols)))
segs = [q for q in segs if q[1] - q[0] > 20]
if len(segs) != 10: a0, b0 = segs[0][0], segs[-1][1]; e = np.linspace(a0, b0, 11).astype(int); segs = [(e[i], e[i + 1]) for i in range(10)]
for d, (a, b) in enumerate(segs):
  c = W[dy0:dy1, a:b]; im = Image.fromarray(c); im = im.crop(im.getbbox()); im.resize((round(im.width * 130 / im.height), 130), Image.LANCZOS).save(D + 'd%d.webp' % d, quality=90)
print('ok words 5 digits', len(segs))
