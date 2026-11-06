# Fit the painted field edge (any surface) -> ell.npy (replaces fit_grass.py)
# usage: python3 fit_field.py <plate.png>      (writes ell.npy in the current folder)
import numpy as np, cv2, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from field_mask import fit
img = cv2.imread(sys.argv[1])
((ex, ey), (ew, eh), an), dev, kept = fit(img)
print('ellipse', [round(v, 1) for v in (ex, ey, ew, eh)], 'angle', round(an, 1), 'ratio', round(eh / ew, 3),
      'contour dev px median/max', round(float(np.median(dev)), 1), round(float(np.percentile(dev, 90)), 1), 'kept', round(float(kept), 2))
np.save('ell.npy', np.array([ex, ey, ew, eh]))
