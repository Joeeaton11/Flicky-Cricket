#!/usr/bin/env python3
"""Key a #00FF00 sheet and list / cut its pieces.
  python3 cut_sheet.py sheet.png                      -> lists pieces (index, box)
  python3 cut_sheet.py sheet.png outdir name0,name1,… -> writes outdir/<name>.png for each piece in list order ('-' skips)
Pieces are found as connected blobs (merged with --merge px), ordered top-to-bottom in rows, then left-to-right."""
import sys, os, numpy as np, cv2
from PIL import Image
src = sys.argv[1]
arg = lambda k, d: float(sys.argv[sys.argv.index(k) + 1]) if k in sys.argv else d
im = np.array(Image.open(src).convert('RGB')).astype(np.float32)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
if '--magenta' in sys.argv:   # key #FF00FF instead: swap channels so magenta behaves like green
    r, g, b = r, np.minimum(r, b), g
    spill = np.minimum(im[..., 0], im[..., 2]) - im[..., 1]
else:
    spill = g - np.maximum(r, b)
alpha = np.clip(1 - (spill - 40) / 60, 0, 1)          # strong green -> 0, little green -> 1
fg = im.copy(); m = spill > 0
if '--magenta' in sys.argv:
    lim = im[..., 1] + 0
    fg[..., 0] = np.where(m, np.minimum(fg[..., 0], np.maximum(lim, fg[..., 0] - spill)), fg[..., 0])
    fg[..., 2] = np.where(m, np.minimum(fg[..., 2], np.maximum(lim, fg[..., 2] - spill)), fg[..., 2])
else:
    fg[..., 1] = np.where(m, np.maximum(r, b) + np.minimum(spill, 0), g)   # despill: pull green down to max(r,b)
rgba = np.dstack([fg, alpha * 255]).clip(0, 255).astype(np.uint8)
mask = (alpha > 0.5).astype(np.uint8)
mg = int(arg('--merge', 10))
lab = cv2.connectedComponentsWithStats(cv2.dilate(mask, np.ones((mg, mg), np.uint8)), 8)
n, lbl, st = lab[0], lab[1], lab[2]
pieces = [(st[i, 0], st[i, 1], st[i, 2], st[i, 3], i) for i in range(1, n) if st[i, 4] > arg('--min', 400)]
rowh = arg('--row', 60)
pieces.sort(key=lambda p: (round((p[1] + p[3] / 2) / rowh), p[0]))
names = sys.argv[3].split(',') if len(sys.argv) > 3 and not sys.argv[2].startswith('--') else None
for k, (x, y, w, h, i) in enumerate(pieces):
    if not names: print(k, 'x', x, 'y', y, 'w', w, 'h', h); continue
    if k >= len(names) or names[k] == '-': continue
    pm = (lbl[y:y + h, x:x + w] == i)
    piece = rgba[y:y + h, x:x + w].copy(); piece[..., 3] = (piece[..., 3] * pm).astype(np.uint8)
    os.makedirs(sys.argv[2], exist_ok=True)
    Image.fromarray(piece).save(os.path.join(sys.argv[2], names[k] + '.png'))
if names: print('cut', sum(1 for n_ in names if n_ != '-'), 'pieces to', sys.argv[2])
