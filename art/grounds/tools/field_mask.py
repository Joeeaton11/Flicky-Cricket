# Field edge for ANY surface (grass, sand, deck planks, stone, ice, lava rock...).
# Rays are cast from the field centre; each ray walks outward comparing the (blurred, Lab) colour with a running average
# of the surface it has just crossed, so gentle shading / mowing stripes / plank grain are followed, and the edge is the
# first SUSTAINED jump (the boards ring, which prompts ask to be a clearly different colour). Outlier rays (a sword or a
# fan's arm over the boards) are dropped and the ellipse refitted.
import numpy as np, cv2

def edge_points(img, seed=None, n=360, blur=3, jump=26, run=4, wl=0.6):
  h, w = img.shape[:2]
  sx, sy = seed if seed else (w / 2, h * .55)
  lab = cv2.cvtColor(cv2.GaussianBlur(img, (0, 0), blur), cv2.COLOR_BGR2LAB).astype(np.float32)
  lab[..., 0] *= wl
  pts = []
  for a in np.linspace(0, 2 * np.pi, n, endpoint=False):
    dx, dy = np.cos(a), np.sin(a); hist = []; bad = 0; r = 30
    while True:
      x, y = int(sx + dx * r), int(sy + dy * r)
      if not (0 <= x < w and 0 <= y < h): break
      c = lab[y, x]
      if len(hist) > 8:
        ref = np.mean(hist[-12:], 0)
        if np.linalg.norm(c - ref) > jump:
          bad += 1
          if bad >= run: pts.append((sx + dx * (r - run * 2), sy + dy * (r - run * 2))); break
        else:
          bad = 0; hist.append(c)
      else:
        hist.append(c)
      r += 2
  return np.array(pts, np.float32)

def fit(img, seed=None):
  p = edge_points(img, seed)
  e = cv2.fitEllipse(p)
  for _ in range(3):
    (ex, ey), (ew, eh), an = e
    d = np.abs(np.hypot((p[:, 0] - ex) / (ew / 2), (p[:, 1] - ey) / (eh / 2)) - 1)
    keep = d < max(0.02, np.percentile(d, 80) * 1.5)
    e = cv2.fitEllipse(p[keep])
  (ex, ey), (ew, eh), an = e
  d = np.abs(np.hypot((p[:, 0] - ex) / (ew / 2), (p[:, 1] - ey) / (eh / 2)) - 1)
  return e, d * ew / 2, keep.mean()

def field_mask(img, seed=None):
  (ex, ey), (ew, eh), an = fit(img, seed)[0]
  m = np.zeros(img.shape[:2], np.uint8); cv2.ellipse(m, ((ex, ey), (ew, eh), an), 1, -1)
  return m, 0
