"""Rebuild every painted scoreboard to ONE locked layout (Joe, Nov 1: "all locked in place, exactly the same positioning").

Template = the signed-off Gully board, placed at 0.92 inside a 760x316 canvas (body 760x300).
Every other board: its own frame (uniformly scaled by k, lengthened/shortened only by repeating or
cutting a band in the middle with a crossfade — no warping), its own board material filling the
inside, and its own painted panels 9-sliced onto the template rects. So the numbers, wicket slots,
ball sockets and energy bar sit in exactly the same place on every ground.

usage: python3 build_locked_boards.py <orig_dir> <out_dir>
  orig_dir holds <name>_orig.webp for each board (the untouched painted boards).
"""
import sys, json
import numpy as np
from PIL import Image

CW, CH, BODY = 760, 316, 300
GK, GOX, GOY = 0.92, 30.4, 20.0          # Gully placed at 0.92, offset (30.4, 20)

# Gully's signed-off slot fractions (of 760 width), from THEME_ART.tg_gully.hud2
G = dict(chase=[.1634, .038, .9602, .1449], wk=[[.7721, .0477, .8569, .136], [.8675, .0477, .9505, .136]],
         score=[.0389, .1723, .3975, .2721], sock=dict(xs=[.4527, .5455, .6374, .7301, .822, .9148], y=.2231, r=.034),
         eIcon=[.0746, .3216, .0212], eBar=[.1175, .3048, .9505, .3357])

def T(v):  # gully px -> template px
    return GOX + GK * v if True else None
def Tx(f): return GOX + GK * f * 760
def Ty(f): return GOY + GK * f * 760
def Tl(f): return GK * f * 760

TPL = dict(
    chase=[Tx(G['chase'][0]), Ty(G['chase'][1]), Tx(G['chase'][2]), Ty(G['chase'][3])],
    wk=[[Tx(a), Ty(b), Tx(c), Ty(d)] for a, b, c, d in G['wk']],
    score=[Tx(G['score'][0]), Ty(G['score'][1]), Tx(G['score'][2]), Ty(G['score'][3])],
    sock=dict(xs=[Tx(x) for x in G['sock']['xs']], y=Ty(G['sock']['y']), r=Tl(G['sock']['r'])),
    eIcon=[Tx(G['eIcon'][0]), Ty(G['eIcon'][1]), Tl(G['eIcon'][2])],
    eBar=[Tx(G['eBar'][0]), Ty(G['eBar'][1]), Tx(G['eBar'][2]), Ty(G['eBar'][3])])
# a sockets backing panel, for boards that paint one: from just right of the score panel to the chase panel's right edge
TPL['sockPanel'] = [TPL['score'][2] + 10, TPL['score'][1], TPL['chase'][2], TPL['score'][3]]

def frac_hud():
    f = lambda v: round(v / CW, 4)
    t = TPL
    return dict(aspect=round(CH / CW, 4), body=round(BODY / CW, 4),
                chase=[f(v) for v in t['chase']], wk=[[f(v) for v in w] for w in t['wk']],
                score=[f(v) for v in t['score']], sock=dict(xs=[f(v) for v in t['sock']['xs']], y=f(t['sock']['y']), r=f(t['sock']['r'])),
                eIcon=[f(v) for v in t['eIcon']], eBar=[f(v) for v in t['eBar']])

# ---- per-board source measurements (original px, 760 wide). slots = the board's own HUD fractions ----
B = {
 'maidan3': dict(k=1.0, Ri=(36, 49, 724, 254), mat=(130, 193, 214, 226), overBand=(14, 52, 30, 730), deco=[('rails', [(111, 125, 300, 500), (194, 208, 300, 500)], (36, 724))],
   chase=[0.1829, 0.0711, 0.7566, 0.1395], wk=[0.7711, 0.0711, 0.8395, 0.1395], score=[0.0671, 0.1711, 0.2763, 0.2539],
   sock=[0.3434, 0.2132, 0.0355], badge=[0.0526, 0.0789, 0.0592, 0.0855], eIcon=[0.1171, 0.3053, 0.0197], eBar=[0.1803, 0.2842, 0.925, 0.3237]),
 'maidan2': dict(k=.84, Ri=(38, 56, 722, 300), mat=(141, 150, 150, 560), amp=.7, deco=[('rails', [(148, 162, 200, 420), (239, 254, 200, 420)], (31, 729))],
   chase=[.1473, .0853, .9457, .1843], wk=[.7717, .0965, .845, .1688], score=[.056, .2127, .5831, .3075],
   sock=[.6184, .2601, .0237], badge=[.0594, .0913, .1335, .1783], eIcon=[.0805, .3549, .0215], eBar=[.1146, .3342, .9457, .3773]),
 'rooftop': dict(k=.82, Ri=(40, 62, 722, 290), mat=(64, 84, 60, 700), sockPanel=(482, 160, 692, 218), deco=[('sections', [(58, 86, 700, 150), (58, 156, 700, 222), (58, 224, 700, 268)], 7, 8)], secFill=(124, 96, 129, 140),
   chase=[.1709, .1216, .9084, .1909], wk=[.7806, .1316, .8322, .1824], score=[.087, .2171, .6228, .2818],
   sock=[.6636, .2502, .0154], badge=[.087, .1216, .1609, .1909], eIcon=[.1089, .3233, .0131], eBar=[.1339, .3102, .8999, .3372]),
 'school': dict(k=1.0, Ri=(16, 16, 744, 220), mat=(99, 106, 150, 560), amp=.55,
   chase=[.149, .0428, .9529, .1293], wk=[.7723, .0488, .8493, .1224], score=[.0479, .1413, .5086, .2269],
   sock=[.5539, .1849, .0274], badge=[.0445, .0454, .1378, .1353], eIcon=[.0689, .2547, .0167], eBar=[.0976, .2406, .9486, .268]),
 'village': dict(k=.75, Ri=(46, 84, 714, 314), mat=(150, 172, 50, 710), flowersOver=True, deco=[('rails', [(150, 168, 150, 450), (256, 278, 150, 450)], (34, 726))],
   chase=[.1677, .1085, .9311, .1946], wk=[.7889, .1198, .8458, .1826], score=[.0749, .2298, .6145, .3174],
   sock=[.6647, .2713, .021], badge=[.0749, .1108, .1527, .1924], eIcon=[.0932, .3817, .0157], eBar=[.119, .3675, .9281, .396]),
 'railway': dict(k=1.0, Ri=(48, 48, 712, 250), mat=(129, 140, 150, 560), amp=.55,
   chase=[.1817, .0683, .9317, .1676], wk=[.742, .0798, .8218, .1596], score=[.0691, .1871, .4938, .2819],
   sock=[.5598, .2349, .0244], badge=[.07, .0691, .1622, .1676], eIcon=[.0869, .316, .016], eBar=[.1206, .3005, .9309, .3307]),
 'evening': dict(k=.8, cropTop=74, clock=(330, 40, 432, 132), Ri=(80, 132, 682, 292), mat=(187, 194, 150, 560), amp=.6, sockPanel=(386, 193, 692, 246),
   chase=[.1678, .1804, .9098, .2445], wk=[.7808, .1847, .8356, .2411], score=[.0919, .2572, .4966, .3212],
   sock=[.5443, .2896, .0211], badge=[.0947, .1829, .1526, .2395], eIcon=[.11, .3478, .0131], eBar=[.1366, .3364, .9098, .36]),
}

def px(r): return [int(round(v * 760)) for v in r]

def tile_material(a, mat, w, h, amp=1.0):
    """board material: its mean colour + its fine texture, with the strip's row/column shading removed (no stripes)."""
    r1, r2, c1, c2 = mat
    s = a[r1:r2, c1:c2, :3].astype(np.float32)
    g = s.mean((0, 1), keepdims=True)
    tex = s - s.mean(0, keepdims=True) - s.mean(1, keepdims=True) + 2 * g
    tex = (tex - g) * amp + g
    tex = np.concatenate([tex, tex[::-1]], 0); tex = np.concatenate([tex, tex[:, ::-1]], 1)
    ry, rx = -(-h // tex.shape[0]), -(-w // tex.shape[1])
    return np.tile(tex, (ry, rx, 1))[:h, :w]

def circ(piece, rfrac=0.8):
    h, w = piece.shape[:2]; yy, xx = np.mgrid[:h, :w]
    d = np.hypot(xx - (w - 1) / 2, yy - (h - 1) / 2) / (min(w, h) / 2)
    m = np.clip((1.0 - d) / (1.0 - rfrac), 0, 1)
    out = piece.copy(); out[..., 3] = out[..., 3] * m
    return out

def fit_axis(img, axis, target, ov=24):
    """Lengthen by repeating the middle band / shorten by cutting the middle, crossfaded. No stretching."""
    img = img.astype(np.float32)
    n = img.shape[axis]
    while n < target:
        c = n // 2; band = min(n // 6, target - n + ov)
        a = np.take(img, range(0, c + ov), axis)               # left incl. overlap
        mid = np.take(img, range(c - band, c + ov), axis)     # band to insert (+overlap)
        b = np.take(img, range(c, n), axis)
        img = _xcat(_xcat(a, mid, ov, axis), np.take(b, range(0, b.shape[axis]), axis), ov, axis, pre_overlap=True) if False else _insert(img, c, band, ov, axis)
        n = img.shape[axis]
    if n > target:
        cut = n - target; c = n // 2
        a = np.take(img, range(0, c - cut // 2 + ov // 2), axis)
        b = np.take(img, range(c - cut // 2 + cut - ov // 2, n), axis)
        img = _blendcat(a, b, ov, axis)
    return img

def _blendcat(a, b, ov, axis):
    """concat a and b where a's last ov and b's first ov overlap and are crossfaded."""
    la = a.shape[axis]
    wgt = np.linspace(0, 1, ov, dtype=np.float32)
    shp = [1] * a.ndim; shp[axis] = ov; wgt = wgt.reshape(shp)
    oa = np.take(a, range(la - ov, la), axis); ob = np.take(b, range(0, ov), axis)
    mid = oa * (1 - wgt) + ob * wgt
    return np.concatenate([np.take(a, range(0, la - ov), axis), mid, np.take(b, range(ov, b.shape[axis]), axis)], axis)

def _insert(img, c, band, ov, axis):
    """duplicate the band [c-band, c) so it appears twice: img[:c] + img[c-band:] (crossfaded seam)."""
    a = np.take(img, range(0, c + ov // 2), axis)
    b = np.take(img, range(c - band - ov // 2, img.shape[axis]), axis)
    return _blendcat(a, b, ov, axis)

def nine(src, rect, tw, th, c=12, mirror_right=False):
    x1, y1, x2, y2 = [int(round(v)) for v in rect]
    p = src[y1:y2, x1:x2].astype(np.float32)
    h, w = p.shape[:2]; c = min(c, w // 3, h // 3)
    tw, th = int(round(tw)), int(round(th))
    if mirror_right:
        left = p[:, :w // 2]; p = np.concatenate([left, left[:, ::-1]], 1); h, w = p.shape[:2]
    def rs(a, W, H):
        W, H = max(1, W), max(1, H)
        return np.array(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((W, H), Image.LANCZOS)).astype(np.float32)
    mw, mh = tw - 2 * c, th - 2 * c
    rows = []
    for (ys, ye, hh) in [(0, c, c), (c, h - c, mh), (h - c, h, c)]:
        row = [rs(p[ys:ye, 0:c], c, hh), rs(p[ys:ye, c:w - c], mw, hh), rs(p[ys:ye, w - c:w], c, hh)]
        rows.append(np.concatenate(row, 1))
    return np.concatenate(rows, 0)

def paste(dst, piece, x, y):
    x, y = int(round(x)), int(round(y)); h, w = piece.shape[:2]
    al = piece[..., 3:4] / 255.0
    dst[y:y + h, x:x + w, :3] = dst[y:y + h, x:x + w, :3] * (1 - al) + piece[..., :3] * al
    dst[y:y + h, x:x + w, 3:4] = np.maximum(dst[y:y + h, x:x + w, 3:4], piece[..., 3:4])

def rs4(a, W, H):
    return np.array(Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).resize((int(round(W)), int(round(H))), Image.LANCZOS)).astype(np.float32)

def build(name, src, P):
    a = np.array(Image.open(src).convert('RGBA')).astype(np.float32)
    H0 = a.shape[0]
    pr = lambda key: px(P[key])
    # 1. frame + material: wipe the inside (Ri + every panel, padded) with the board's own material
    f = a.copy()
    mask = np.zeros(a.shape[:2], bool)
    x1, y1, x2, y2 = P['Ri']; mask[y1:y2, x1:x2] = True
    for key in ['chase', 'score', 'badge', 'eBar', 'wk']:
        r = pr(key); mask[max(0, r[1] - 5):r[3] + 5, max(0, r[0] - 5):r[2] + 5] = True
    cx, cy, rr = P['eIcon'][0] * 760, P['eIcon'][1] * 760, P['eIcon'][2] * 760 + 6
    mask[int(cy - rr):int(cy + rr), int(cx - rr):int(cx + rr)] = True
    if 'sockPanel' in P:
        r = P['sockPanel']; mask[r[1] - 4:r[3] + 4, r[0] - 4:r[2] + 4] = True
    sx, sy, sr = P['sock']; sr *= 760
    mask[int(sy * 760 - sr - 6):int(sy * 760 + sr + 6), int(sx * 760 - sr - 6):760 - 40] = True
    mat = tile_material(a, P['mat'], 760, H0, P.get('amp', 1.0))
    f[mask, :3] = mat[mask]; f[mask, 3] = 255
    if 'clock' in P:   # take the clock + pennant off the top: copy the bulb rail from the left over it
        cx1, cy1, cx2, cy2 = P['clock']; wdt = cx2 - cx1
        f[:cy2, cx1:cx2] = f[:cy2, cx1 - wdt - 8:cx2 - wdt - 8]
    if 'cropTop' in P:
        f = f[P['cropTop']:]
    # 2. frame scaled uniformly, then lengthened/shortened in the middle to 760 x 300
    k = P['k']
    if k != 1:
        f = rs4(f, f.shape[1] * k, f.shape[0] * k)
    f = fit_axis(f, 1, CW); f = fit_axis(f, 0, BODY)
    out = np.zeros((CH, CW, 4), np.float32); out[:BODY] = f
    # 3. the board's own panels, 9-sliced onto the locked template rects
    t = TPL
    def put_panel(srcrect, trect, mirror=False, c=12):
        pc = nine(a, srcrect, trect[2] - trect[0], trect[3] - trect[1], c=c, mirror_right=mirror)
        paste(out, pc, trect[0], trect[1])
    # board details between the panels (section boxes, divider rails) — the board's own, re-laid to the template
    L, R_ = t['score'][0], t['chase'][2]
    rows = [(t['chase'][1], t['chase'][3]), (t['score'][1], t['score'][3]), (t['eBar'][1], t['eBar'][3])]
    for kind, *args in P.get('deco', []):
        if kind == 'sections':     # args: list of 3 source section boxes (top row, middle row, energy row); pad, corner
            boxes, pad, c = args
            for sb, (ry1, ry2) in zip(boxes, rows):
                tr = [L - pad, ry1 - pad, R_ + pad, ry2 + pad]
                pc = nine(a, sb, tr[2] - tr[0], tr[3] - tr[1], c=c)
                ix1, iy1, ix2, iy2 = P['secFill']; inner = np.median(a[iy1:iy2, ix1:ix2].reshape(-1, 4), 0)
                pc[c:-c, c:-c, 3] = 0   # rim only — the board material shows inside, as on the original
                paste(out, pc, tr[0], tr[1])
        if kind == 'rails':        # args: list of 2 source strips (y1, y2, x1, x2) placed in the two gaps between rows; x span
            strips, (sx1, sx2) = args
            for (y1, y2, x1, x2), gy in zip(strips, [(rows[0][1] + rows[1][0]) / 2, (rows[1][1] + rows[2][0]) / 2]):
                st = a[y1:y2, x1:x2]
                reps = -(-(int(sx2 - sx1)) // st.shape[1]) + 1
                st = np.concatenate([st, st[:, ::-1]] * reps, 1)[:, :int(sx2 - sx1)]
                paste(out, st, sx1, gy - st.shape[0] / 2)
    if 'sockPanel' in P:
        put_panel(P['sockPanel'], t['sockPanel'])
    put_panel(pr('chase'), t['chase'], mirror=True)
    put_panel(pr('score'), t['score'])
    put_panel(pr('eBar'), t['eBar'], c=10)
    w = pr('wk')
    for tw in t['wk']:
        pc = rs4(a[w[1] - 1:w[3] + 1, w[0] - 1:w[2] + 1], tw[2] - tw[0] + 2, tw[3] - tw[1] + 2); paste(out, pc, tw[0] - 1, tw[1] - 1)
    # sockets: the board's own first socket, scaled to the template socket size
    s0 = a[int(sy * 760 - sr * 1.3):int(sy * 760 + sr * 1.3), int(sx * 760 - sr * 1.3):int(sx * 760 + sr * 1.3)]
    R = t['sock']['r'] * 1.3
    pc = circ(rs4(s0, 2 * R, 2 * R), 0.9)
    for x in t['sock']['xs']:
        paste(out, pc, x - R, t['sock']['y'] - R)
    ex, ey, er = [v * 760 for v in P['eIcon']]; er2 = er * 1.45
    pc = rs4(a[int(ey - er2):int(ey + er2), int(ex - er2):int(ex + er2)], 2 * t['eIcon'][2] * 1.45, 2 * t['eIcon'][2] * 1.45); pc = circ(pc, 0.86)
    paste(out, pc, t['eIcon'][0] - t['eIcon'][2] * 1.45, t['eIcon'][1] - t['eIcon'][2] * 1.45)
    if 'overBand' in P:   # e.g. a tent valance that drapes over the top panel: its green + cream stripes go back on top
        y1, y2, x1, x2 = P['overBand']; fr = f[:BODY]; rgb = fr[..., :3] / 255.0
        green = (rgb[..., 1] > rgb[..., 0] + .06) & (rgb[..., 1] > rgb[..., 2] + .06)
        cream = (rgb.min(-1) > .62) & (rgb.max(-1) - rgb.min(-1) < .28)
        m = np.zeros(fr.shape[:2], bool); m[y1:y2, x1:x2] = (green | cream)[y1:y2, x1:x2]
        from PIL import ImageFilter
        mi = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(.8))
        al = np.array(mi).astype(np.float32)[..., None] / 255.0
        out[:BODY, :, :3] = out[:BODY, :, :3] * (1 - al) + fr[..., :3] * al
    if P.get('flowersOver'):   # marigolds hang over the top panel, as on the original
        import colorsys
        fr = f[:BODY].copy(); rgb = fr[..., :3] / 255.0
        mx, mn = rgb.max(-1), rgb.min(-1); sat = (mx - mn) / np.maximum(mx, 1e-3)
        m = (rgb[..., 0] > .85) & (rgb[..., 1] > .42) & (rgb[..., 1] < .8) & (rgb[..., 2] < .25) & (sat > .75)
        m[int(t['chase'][1] + 22):] = False
        from PIL import ImageFilter
        mi = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
        al = np.array(mi).astype(np.float32)[..., None] / 255.0
        out[:BODY, :, :3] = out[:BODY, :, :3] * (1 - al) + fr[..., :3] * al
    return out

def build_gully(src):
    a = Image.open(src).convert('RGBA')
    a = a.resize((round(760 * GK), round(a.size[1] * GK)), Image.LANCZOS)
    out = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); out.alpha_composite(a, (round(GOX), round(GOY)))
    return np.array(out).astype(np.float32)

if __name__ == '__main__':
    od, outd = sys.argv[1], sys.argv[2]
    Image.fromarray(build_gully(f'{od}/gully_orig.webp').astype(np.uint8)).save(f'{outd}/gully.png')
    for n, P in B.items():
        Image.fromarray(np.clip(build(n, f'{od}/{n}_orig.webp', P), 0, 255).astype(np.uint8)).save(f'{outd}/{n}.png')
    print(json.dumps(frac_hud()))
