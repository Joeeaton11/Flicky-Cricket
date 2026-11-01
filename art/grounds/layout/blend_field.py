#!/usr/bin/env python3
"""Tie a fitted field into its scene (Joe, Nov 1: the field must not look pasted on).
  python3 blend_field.py field.png scenery.png out.webp [--keep 0.4] [--stripes 0.45] [--feather 0.07]
field.png  = align_plate.py ... --radial --cut (field exact on the coded oval)
scenery.png = align_plate.py ... --radial --scenery-only (same scale, no field)
Colour-matches the field to the grass just outside it, softens mower stripes, adds gentle wear, sunlight falloff,
and feathers the edge into the surroundings (the game's boundary sits on top of the seam)."""
import sys, json, os, numpy as np, cv2
HERE = os.path.dirname(os.path.abspath(__file__)); L = json.load(open(os.path.join(HERE, 'layout.json')))
arg = lambda k, d: float(sys.argv[sys.argv.index(k) + 1]) if k in sys.argv else d
A = cv2.imread(sys.argv[1]).astype(np.float32); B = cv2.imread(sys.argv[2]).astype(np.float32); H, W = A.shape[:2]
fo = L['field_oval']
cx, cy = W * fo.get('cx', 0.5), H * fo.get('cy', 0.6); rx, ry = W * fo.get('rx', 0.46), H * fo.get('ry', 0.335)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32); rho = np.hypot((xx - cx) / rx, (yy - cy) / ry)
lab = lambda im: cv2.cvtColor(np.clip(im, 0, 255).astype(np.uint8), cv2.COLOR_BGR2LAB).astype(np.float32)
LA, LB = lab(A), lab(B)
inside = rho < 0.9
ring = (rho > 1.03) & (rho < 1.25)
g = (LB[..., 1] < 122) & (LB[..., 0] > 90) & ring          # green-ish grass just outside (not people/props)
mA = LA[inside].mean(0); mB = LB[g].mean(0) if g.sum() > 500 else mA
keep = arg('--keep', 0.4)                                   # how much of the field's own colour to keep (lusher than the outfield)
tgt = mB * (1 - keep) + mA * keep
LF = LA + (tgt - mA)
# soften stripes: keep low frequencies, damp the mid band
fine = cv2.GaussianBlur(LF, (0, 0), 2.5); low = cv2.GaussianBlur(LF, (0, 0), 40)
LF = low + (fine - low) * arg('--stripes', 0.45) + (LF - fine)      # damp the stripe band only; grass texture kept
# wear: low-frequency mottle, stronger towards the edge (worn ring), plus borrowed outfield texture detail
rng = np.random.default_rng(7); n = cv2.GaussianBlur(rng.standard_normal((H // 8, W // 8)).astype(np.float32), (0, 0), 3)
n = cv2.resize(n, (W, H)) ; n /= (np.abs(n).max() + 1e-6)
edge = np.clip((rho - 0.6) / 0.4, 0, 1)
LF[..., 0] += n * (4 + 8 * edge); LF[..., 2] += np.clip(n, 0, 1) * 6 * edge  # sun-bleached yellower patches near the edge
# light: sun from picture-left
LF[..., 0] *= (1.04 - 0.07 * xx / W)
F = cv2.cvtColor(np.clip(LF, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR).astype(np.float32)
fe = arg('--feather', 0.07)
w = np.clip((1.0 - rho) / fe, 0, 1); w = w * w * (3 - 2 * w)
out = F * w[..., None] + B * (1 - w[..., None])
cv2.imwrite(sys.argv[3], np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_WEBP_QUALITY, 88])
print('field', mA.round(1), '-> target', tgt.round(1))
