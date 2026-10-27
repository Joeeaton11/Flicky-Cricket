# Match a sprite's trousers to the stance sprite's trousers (colour + shading), so legs don't change colour between frames.
# Trouser pixels = low-saturation dark greys below the shirt hem. Luminance is histogram-matched to the stance's trousers
# and the stance's blue-grey tint is applied. Usage: python3 trousers.py shot_drive shot_drive_c
import re, base64, io, sys, numpy as np
from PIL import Image
P = 'flicky-cricket.html'; s = open(P).read()
def load(n):
    m = re.search(r'"' + n + r'": \{"src": "data:image/webp;base64,([^"]*)"', s); return m, np.array(Image.open(io.BytesIO(base64.b64decode(m.group(1)))).convert('RGBA')).astype(np.float32)
def mask(a):
    h = a.shape[0]; r, g, b, al = [a[..., i] for i in range(4)]; mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b)
    navy = (b > r + 18) & (b > g + 6) & (al > 128); cnt = navy.sum(1); rows = np.nonzero(cnt > 0.45 * cnt.max())[0]; hem = rows.max() if len(rows) else int(h * .4)
    m = (al > 10) & (mx < 150) & (mx > 6) & ((mx - mn < 40) | (b > r + 18)); m[:hem - 4] = False; return m
_, st = load('bat_stance'); sm = mask(st); sl = st[..., :3][sm].mean(1); tint = st[..., :3][sm].mean(0) / max(1, st[..., :3][sm].mean())
for n in sys.argv[1:]:
    m, a = load(n); k = mask(a); L = a[..., :3][k].mean(1)
    q = np.argsort(np.argsort(L)) / max(1, len(L) - 1); newL = np.quantile(sl, q)
    v = newL[:, None] * np.array([0.90, 0.97, 1.18])[None, :]          # the stance's slate-navy cast (RGB)
    v[:, 2] = np.minimum(v[:, 2], v[:, 0] + 17)                        # stay under the game's navy-shirt recolour test
    a[..., :3][k] = v.clip(0, 255)
    buf = io.BytesIO(); Image.fromarray(a.astype(np.uint8)).save(buf, 'WEBP', quality=92, method=6)
    s = s[:m.start(1)] + base64.b64encode(buf.getvalue()).decode() + s[m.end(1):]
    print(n, int(k.sum()), 'px re-toned')
open(P, 'w').write(s)
