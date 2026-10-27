# Shots from Joe's reference poses (KUMU, mirrored to right-handed), redrawn in the game style via Nano Banana 2.1.
# Each sheet holds [contact, follow-through]. Cut, 320 px tall, size by helmet-to-shoe height vs the stance, anchor at the shoes.
import cv2, numpy as np, json, sys
from PIL import Image
SHEETS = {'coverdrive': 0.86, 'cut': 0.95, 'flick': 0.93, 'pull': 1.0, 'revsweep': 0.85, 'scoop': 0.80, 'drive': 0.92}
# Joe's picks for the pull: wind-up from the single sketch, contact from the first sheet (mirrored), finish from the second
# Joe's reverse-sweep refs run backlift (bat up on the leg side) -> contact -> finish (bat swept low out to the off side)
PICK = {'coverdrive': [('cd5_src.png', 0, '_c', False), ('cd5_src.png', 1, '', False)],
        'cut': [('cut_src.png', 0, '_c', False), ('cut_src.png', 1, '', False)],
        'scoop': [('scoop_src.png', 0, '_c', False), ('scoop_finish_src.png', 0, '', False)],
                'pull': [('pull_v1_src.png', 0, '_b', False), ('pull_v1_src.png', 1, '_c', True), ('pull_src.png', 2, '', False)]}
TAGS = {'pull': ['_b', '_c', ''], 'revsweep': ['_b', '_c', '']}       # three-frame shots: wind-up, contact, follow-through
FLIP = {'scoop': [1]}          # drawn kneeling on the wrong knee: mirrored = right knee down, swept to the off side                    # frames drawn on the wrong side, mirrored to match the reference          # name: how low the pose sits vs standing (lunge)
meta = json.load(open('meta.json')) if __import__('os').path.exists('meta.json') else {}
SC_S = 0.117 / 0.6262; OFF_S = (47 - 66.7) * SC_S; SHOT = 0.1485
def figures(path):
    sm = cv2.imread(path).astype(np.float32); b, g, r = sm[..., 0], sm[..., 1], sm[..., 2]
    al = np.clip(1 - (g - np.maximum(r, b) - 25) / 70, 0, 1)
    m = cv2.dilate((al > 0.5).astype(np.uint8), np.ones((15, 15), np.uint8)); n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    return sm, al, sorted([st[i] for i in range(1, n) if st[i][4] > 20000], key=lambda s: s[0])
for name, LOW in SHEETS.items():
    if len(sys.argv) > 1 and name not in sys.argv[1:]: continue
    if name in PICK: jobs = [(figures(p), i, tag, fl) for p, i, tag, fl in PICK[name]]
    else:
        F = figures(name + '_src.png'); jobs = [(F, i, tag, i in FLIP.get(name, [])) for i, tag in enumerate(TAGS.get(name, ['_c', '']))]
    for (sm, al, boxes), fi, tag, flip in jobs:
        x, y, w, h, a = boxes[fi]
        c = sm[y:y + h, x:x + w].copy(); A = al[y:y + h, x:x + w].copy()
        nn_, ll_, ss_, _ = cv2.connectedComponentsWithStats((A > 0.5).astype(np.uint8)); big_ = 1 + np.argmax(ss_[1:, 4])
        A *= cv2.dilate(np.isin(ll_, [i for i in range(1, nn_) if ss_[i][4] > 0.1 * ss_[big_][4]]).astype(np.uint8), np.ones((5, 5), np.uint8))
        cb, cg, cr = c[..., 0], c[..., 1], c[..., 2]; c[..., 1] = np.where(A < 1, np.minimum(cg, np.maximum(cr, cb) + 8), cg)
        rgba = np.dstack([c, A * 255]).clip(0, 255).astype(np.uint8)
        ys, xs = np.nonzero(rgba[..., 3] > 10); rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        s = 320 / rgba.shape[0]; rgba = cv2.resize(rgba, (round(rgba.shape[1] * s), 320), interpolation=cv2.INTER_AREA)
        if flip: rgba = np.ascontiguousarray(rgba[:, ::-1])
        p = rgba.astype(int); pb, pg, pr, pa = p[..., 0], p[..., 1], p[..., 2], p[..., 3]
        navy = (pb > pr + 18) & (pb > pg + 6) & (pa > 128); top = np.nonzero(navy.sum(1) > 3)[0].min()
        band = navy.copy(); band[:top] = False; band[top + 44:] = False          # the helmet: navy in the top ~44 px of the figure
        nn, ll, ss, _ = cv2.connectedComponentsWithStats(band.astype(np.uint8)); hl = 1 + np.argmax(ss[1:, 4]); hs = [i for i in range(1, nn) if ss[i][4] > 0.3 * ss[hl][4]]          # the gold stripe can split the helmet in two: join the halves
        hx0 = min(ss[i][0] for i in hs); hy0 = min(ss[i][1] for i in hs); hb = [hx0, hy0, max(ss[i][0] + ss[i][2] for i in hs) - hx0, max(ss[i][1] + ss[i][3] for i in hs) - hy0]
        mx, mn = np.maximum(np.maximum(pr, pg), pb), np.minimum(np.minimum(pr, pg), pb)
        shoe = (pa > 128) & (mn > 150) & (mx - mn < 40); shoe[:int(320 * 0.85)] = False
        fx = np.nonzero(shoe.any(0))[0]; fm = (fx.min() + fx.max()) / 2
        k = (319 - top) / (403 * LOW); sc = SHOT / k; ax = fm - OFF_S / sc
        key = 'shot_' + name + tag
        Image.fromarray(cv2.cvtColor(rgba, cv2.COLOR_BGRA2RGBA)).save(key + '.webp', quality=92, method=6)
        meta[key] = {'ax': round(float(ax), 1), 'ay': 319.3, 'k': round(float(k), 4), 'hb': [int(hb[0]), int(hb[1]), int(hb[0] + hb[2]), int(hb[1] + hb[3])]}
        print(key, rgba.shape, meta[key])
json.dump(meta, open('meta.json', 'w'))
