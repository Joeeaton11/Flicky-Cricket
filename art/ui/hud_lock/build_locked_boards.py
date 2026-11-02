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
import cv2
from PIL import Image

CW, CH, BODY = 760, 316, 300
BOX = (30, 20, 730, 281)
CREST = (95.7, 84.1, 40.0)   # crest centre + recess radius in canvas px (MATCH_HUD_CREST on screen; crest itself is 66px across)   # Gully's frame outline inside the canvas (760*.92 wide from x 30.4; body 283*.92 tall from y 20)
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
 'storm': dict(k=.921, spriteFile=True, topSprites=[((0, 0, 76, 58), (676, 16), 40)], Ri=(34, 30, 726, 270), mat=(120, 130, 160, 520), amp=.9, badgeRing=(89, 79, 40),
   chase=[0.1868, 0.0553, 0.7132, 0.1539], wk=[0.7263, 0.0566, 0.825, 0.1526], score=[0.0711, 0.1789, 0.396, 0.2671],
   sock=[0.4566, 0.2237, 0.0355], badge=[0.0684, 0.0553, 0.1671, 0.1539], eIcon=[0.1013, 0.3145, 0.0303], eBar=[0.1487, 0.2868, 0.9211, 0.3447]),
 'beachnight': dict(k=.921, spriteFile=True, topSprites=[((0, 196, 84, 315), (30, 262), 86)], Ri=(66, 46, 712, 266), mat=(205, 215, 360, 700), amp=.9, badgeRing=(112, 92, 40),
   chase=[0.2132, 0.0684, 0.7158, 0.1763], wk=[0.7263, 0.0684, 0.8211, 0.1763], score=[0.0974, 0.1895, 0.4579, 0.2711],
   sock=[0.5053, 0.2303, 0.0342], badge=[0.0987, 0.0724, 0.1961, 0.1697], eIcon=[0.1355, 0.3158, 0.0289], eBar=[0.1658, 0.2895, 0.9263, 0.3447]),
 'harbour': dict(k=.921, spriteFile=True, topSprites=[((0, 0, 63, 216), (726, 192), 128)], Ri=(24, 44, 738, 296), mat=(287, 293, 120, 700), amp=.9, badgeRing=(78, 88, 40), deco=[('rails', [(134, 147, 60, 700), (224, 235, 60, 700)], (54, 708))],
   chase=[0.1842, 0.0684, 0.7263, 0.1645], wk=[0.7526, 0.0658, 0.8474, 0.1684], score=[0.0579, 0.2, 0.3579, 0.2816],
   sock=[0.4289, 0.2408, 0.0368], badge=[0.0526, 0.0658, 0.1553, 0.1684], eIcon=[0.0816, 0.3474, 0.0263], eBar=[0.1342, 0.3184, 0.9447, 0.3763]),
 'rockpool': dict(k=.921, spriteFile=True, topSprites=[((0, 196, 106, 303), (40, 276), 60), ((612, 188, 760, 303), (712, 280), 66)], Ri=(45, 28, 712, 262), mat=(120, 130, 160, 540), amp=.9, badgeRing=(85, 75, 44), deco=[('rails', [(118, 133, 160, 540), (199, 212, 160, 540)], (40, 720))],
   chase=[0.1868, 0.0421, 0.7526, 0.1526], wk=[0.7697, 0.0592, 0.8447, 0.1382], score=[0.0645, 0.1789, 0.4197, 0.2592],
   sock=[0.4737, 0.2171, 0.0342], badge=[0.0592, 0.0434, 0.1671, 0.1539], eIcon=[0.1283, 0.3059, 0.0263], eBar=[0.1724, 0.2816, 0.8434, 0.3303]),
 'beach': dict(k=.921, spriteFile=True, Ri=(42, 42, 712, 300), mat=(300, 318, 350, 530), amp=.9, badgeRing=(95, 84, 40), deco=[('rails', [(128, 140, 300, 520), (222, 231, 300, 520)], (40, 720))],
   chase=[0.1868, 0.0579, 0.6947, 0.1658], wk=[0.6987, 0.0579, 0.8105, 0.1658], score=[0.0645, 0.1934, 0.4, 0.2868],
   sock=[0.4559, 0.2401, 0.048], badge=[0.0658, 0.0579, 0.1842, 0.1632], eIcon=[0.1105, 0.3388, 0.0329], eBar=[0.1474, 0.3092, 0.9105, 0.3711]),
 'coliseum': dict(k=.921, Ri=(41, 44, 717, 251), mat=(252, 261, 142, 326), amp=.9, badgeRing=(95, 88, 29), deco=[('rails', [(124, 134, 142, 529), (204, 214, 142, 529)], (40, 720))],
   chase=[0.1868, 0.0842, 0.9118, 0.15], wk=[0.7961, 0.0961, 0.8395, 0.1382], score=[0.0895, 0.1895, 0.3658, 0.2553],
   sock=[0.4329, 0.2224, 0.0356], badge=[0.0882, 0.0789, 0.1618, 0.1526], eIcon=[0.1132, 0.3105, 0.0204], eBar=[0.1553, 0.2961, 0.9118, 0.3237]),
 'bigground': dict(k=.921, Ri=(22, 23, 738, 293), mat=(204, 211, 286, 726), amp=.9, badgeRing=(82, 71, 33), deco=[('rails', [(113, 123, 140, 433), (213, 222, 140, 433)], (40, 720))],
   chase=[0.2066, 0.0618, 0.9289, 0.1303], wk=[0.8039, 0.0724, 0.8539, 0.1197], score=[0.0684, 0.1803, 0.3382, 0.2605],
   sock=[0.4158, 0.2211, 0.036], badge=[0.0658, 0.0513, 0.15, 0.1368], eIcon=[0.0974, 0.3342, 0.0308], eBar=[0.1579, 0.3158, 0.9303, 0.3579]),
 'dusk': dict(k=.921, spriteFile=True, Ri=(22, 22, 740, 352), mat=(40, 46, 300, 500), stripes=[((90, 211, 199), 173), ((255, 112, 92), 119), ((252, 222, 70), 37)], slope=0.9, badgeRing=(105, 95, 45), topSprites=[((0, 0, 81, 222), (722, 140), 200)], deco=[('rails', [(151, 164, 300, 520), (244, 257, 300, 520)], (36, 724))],
   chase=[0.2342, 0.0882, 0.925, 0.1711], wk=[0.7855, 0.1013, 0.8382, 0.1553], score=[0.0842, 0.2303, 0.3921, 0.3105],
   sock=[0.4566, 0.2697, 0.0355], badge=[0.0789, 0.0658, 0.1974, 0.1842], eIcon=[0.1263, 0.3895, 0.0355], eBar=[0.1868, 0.3724, 0.9171, 0.4092]),
 'fognight': dict(k=.921, Ri=(26, 22, 735, 300), mat=(199, 207, 300, 480), amp=.9, badgeRing=(118, 66, 38), deco=[('rails', [(108, 118, 300, 520), (210, 220, 300, 520)], (40, 720))],
   chase=[0.3132, 0.05, 0.9171, 0.1342], wk=[0.7947, 0.0632, 0.8421, 0.1132], score=[0.0789, 0.175, 0.2921, 0.2632],
   sock=[0.3711, 0.2171, 0.0408], badge=[0.1053, 0.0368, 0.2053, 0.1368], eIcon=[0.1224, 0.3408, 0.0237], eBar=[0.1632, 0.3132, 0.9171, 0.3605]),
 'afterglow': dict(k=.921, spriteFile=True, Ri=(30, 40, 730, 268), mat=(40, 50, 150, 700), amp=.9, badgeRing=(85, 85, 40), topSprites=[((346, 0, 414, 52), (380, 26), 44)], deco=[('rails', [(126, 137, 300, 560), (214, 225, 300, 560)], (40, 720))],
   chase=[0.1816, 0.0684, 0.9447, 0.1553], wk=[0.8053, 0.0895, 0.8526, 0.1368], score=[0.0579, 0.1908, 0.3645, 0.2737],
   sock=[0.4211, 0.2329, 0.0421], badge=[0.0592, 0.0592, 0.1645, 0.1645], eIcon=[0.0842, 0.325, 0.0237], eBar=[0.1263, 0.3079, 0.9421, 0.3447]),
 'twilight': dict(k=.921, spriteFile=True, topSprites=[((3, 6, 64, 70), (49, 39), 40), ((696, 6, 757, 70), (711, 39), 40)], Ri=(24, 22, 738, 290), mat=(277, 285, 300, 560), amp=.9, badgeRing=(110, 77, 45), deco=[('rails', [(132, 142, 300, 560), (221, 231, 300, 560)], (40, 720))],
   chase=[0.25, 0.0513, 0.9079, 0.1553], wk=[0.7368, 0.0658, 0.8079, 0.1395], score=[0.0816, 0.1987, 0.3855, 0.2803],
   sock=[0.4461, 0.2382, 0.0355], badge=[0.0855, 0.0421, 0.2039, 0.1605], eIcon=[0.1447, 0.3408, 0.0276], eBar=[0.2079, 0.3211, 0.9026, 0.3579]),
 'evening2': dict(k=.921, Ri=(28, 28, 732, 282), mat=(130, 137, 300, 560), amp=.9, badgeRing=(93, 77, 38), deco=[('rails', [(123, 130, 300, 560), (212, 219, 300, 560)], (40, 720))],
   chase=[0.2105, 0.0553, 0.9289, 0.1474], wk=[0.7632, 0.0684, 0.8316, 0.1368], score=[0.0605, 0.1842, 0.3566, 0.2697],
   sock=[0.4145, 0.2263, 0.0355], badge=[0.0724, 0.0526, 0.1724, 0.1513], eIcon=[0.1, 0.3276, 0.0224], eBar=[0.1553, 0.3079, 0.9303, 0.3487]),
 'railway2': dict(k=.921, topSprites=[((14, 14, 56, 58), (49, 39), 38), ((702, 14, 746, 58), (711, 39), 38)], Ri=(20, 58, 740, 298), mat=(104, 110, 300, 560), amp=.9, badgeRing=(104, 77, 50), deco=[('rails', [(110, 124, 300, 540), (215, 228, 300, 540)], (44, 716))],
   chase=[0.2566, 0.0421, 0.9211, 0.1342], wk=[0.7566, 0.0553, 0.8237, 0.125], score=[0.0487, 0.1816, 0.3237, 0.2697],
   sock=[0.3908, 0.2237, 0.0342], badge=[0.0658, 0.0316, 0.2079, 0.1711], eIcon=[0.1487, 0.3447, 0.0224], eBar=[0.3368, 0.3237, 0.9487, 0.3711]),
 'village2': dict(k=.921, Ri=(30, 27, 728, 290), mat=(139, 147, 380, 560), amp=.9, badgeRing=(110, 100, 55), chaseFrom='score', deco=[('rails', [(126, 140, 300, 560), (231, 245, 300, 560)], (48, 712))],
   chase=[0.2474, 0.0618, 0.9342, 0.1605], wk=[0.7697, 0.0816, 0.8289, 0.1421], score=[0.0684, 0.2237, 0.3947, 0.2895],
   sock=[0.4539, 0.2382, 0.0355], badge=[0.0724, 0.0592, 0.2171, 0.2039], eIcon=[0.1184, 0.3487, 0.0197], eBar=[0.1645, 0.3355, 0.8947, 0.3711]),
 'school2': dict(k=.921, Ri=(18, 30, 742, 284), mat=(108, 113, 200, 560), amp=.8, badgeRing=(86, 70, 37), deco=[('rails', [(114, 128, 200, 500), (212, 226, 200, 500)], (52, 708))],
   chase=[0.1974, 0.0421, 0.9474, 0.1395], wk=[0.7763, 0.0579, 0.8421, 0.1263], score=[0.0526, 0.1776, 0.4105, 0.2711],
   sock=[0.4697, 0.2237, 0.0276], badge=[0.0632, 0.0421, 0.1632, 0.1421], eIcon=[0.1105, 0.3316, 0.0171], eBar=[0.1658, 0.3132, 0.8526, 0.35]),
 'rooftop2': dict(k=.921, underLights=True, Ri=(52, 72, 722, 296), mat=(127, 133, 400, 560), badgeRing=(118, 84, 48), deco=[('rails', [(135, 147, 300, 500), (233, 245, 300, 500)], (55, 705))],
   chase=[0.2895, 0.0566, 0.9382, 0.1632], wk=[0.7566, 0.0724, 0.8276, 0.1461], score=[0.0566, 0.2053, 0.2632, 0.3],
   sock=[0.3447, 0.2513, 0.0355], badge=[0.0921, 0.0474, 0.2184, 0.1737], eIcon=[0.1592, 0.3579, 0.0224], eBar=[0.3053, 0.3368, 0.9368, 0.3763]),
 'maidan4': dict(k=.921, Ri=(32, 32, 728, 290), mat=(101, 108, 200, 680), amp=.8, badgeRing=(97, 67, 34), deco=[('rails', [(107, 116, 192, 480), (218, 227, 192, 480)], (58, 702))],
   chase=[0.2079, 0.0487, 0.9329, 0.1316], wk=[0.7579, 0.0618, 0.8184, 0.1211], score=[0.0684, 0.1658, 0.3, 0.2776],
   sock=[0.3658, 0.2184, 0.0342], badge=[0.0855, 0.0447, 0.1711, 0.1329], eIcon=[0.1816, 0.3408, 0.0237], eBar=[0.3237, 0.3171, 0.9303, 0.3645]),
 'maidan3': dict(k=.75, Ri=(36, 49, 724, 254), mat=(130, 193, 214, 226), deco=[('rails', [(111, 125, 300, 500), (194, 208, 300, 500)], (40, 720))],
   chase=[0.1829, 0.0711, 0.7566, 0.1395], wk=[0.7711, 0.0711, 0.8395, 0.1395], score=[0.0671, 0.1711, 0.2763, 0.2539],
   sock=[0.3434, 0.2132, 0.0355], badge=[0.0526, 0.0789, 0.0592, 0.0855], eIcon=[0.1171, 0.3053, 0.0197], eBar=[0.1803, 0.2842, 0.925, 0.3237]),
 'maidan2': dict(k=.6, Ri=(38, 56, 722, 300), mat=(141, 150, 150, 560), amp=.7, deco=[('rails', [(148, 162, 200, 420), (239, 254, 200, 420)], (31, 729))],
   chase=[.1473, .0853, .9457, .1843], wk=[.7717, .0965, .845, .1688], score=[.056, .2127, .5831, .3075],
   sock=[.6184, .2601, .0237], badge=[.0594, .0913, .1335, .1783], eIcon=[.0805, .3549, .0215], eBar=[.1146, .3342, .9457, .3773]),
 'rooftop': dict(k=.6, Ri=(40, 62, 722, 290), mat=(64, 84, 60, 700), sockPanel=(482, 160, 692, 218), deco=[('sections', [(58, 86, 700, 150), (58, 156, 700, 222), (58, 224, 700, 268)], 7, 8)], secFill=(124, 96, 129, 140),
   chase=[.1709, .1216, .9084, .1909], wk=[.7806, .1316, .8322, .1824], score=[.087, .2171, .6228, .2818],
   sock=[.6636, .2502, .0154], badge=[.087, .1216, .1609, .1909], eIcon=[.1089, .3233, .0131], eBar=[.1339, .3102, .8999, .3372]),
 'school': dict(k=1.0, Ri=(16, 16, 744, 220), mat=(99, 106, 150, 560), amp=.55,
   chase=[.149, .0428, .9529, .1293], wk=[.7723, .0488, .8493, .1224], score=[.0479, .1413, .5086, .2269],
   sock=[.5539, .1849, .0274], badge=[.0445, .0454, .1378, .1353], eIcon=[.0689, .2547, .0167], eBar=[.0976, .2406, .9486, .268]),
 'village': dict(k=.6, Ri=(46, 84, 714, 314), mat=(150, 172, 50, 710), flowersOver=True, deco=[('rails', [(150, 168, 150, 450), (256, 278, 150, 450)], (40, 720))],
   chase=[.1677, .1085, .9311, .1946], wk=[.7889, .1198, .8458, .1826], score=[.0749, .2298, .6145, .3174],
   sock=[.6647, .2713, .021], badge=[.0749, .1108, .1527, .1924], eIcon=[.0932, .3817, .0157], eBar=[.119, .3675, .9281, .396]),
 'railway': dict(k=.75, Ri=(48, 48, 712, 250), mat=(129, 140, 150, 560), amp=.55,
   chase=[.1817, .0683, .9317, .1676], wk=[.742, .0798, .8218, .1596], score=[.0691, .1871, .4938, .2819],
   sock=[.5598, .2349, .0244], badge=[.07, .0691, .1622, .1676], eIcon=[.0869, .316, .016], eBar=[.1206, .3005, .9309, .3307]),
 'evening': dict(k=.55, cropTop=74, clock=(330, 40, 432, 132), Ri=(80, 132, 682, 292), mat=(187, 194, 150, 560), amp=.6, sockPanel=(386, 193, 692, 246),
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
    if 'stripes' in P:   # diagonal painted stripes (carnival board): rebuilt procedurally so they stay continuous
        yy, xx = np.mgrid[:H0, :760]; per = sum(w for _, w in P['stripes']); u = (xx + yy * P.get('slope', 1.0)) % per
        mat = np.zeros((H0, 760, 3), np.float32); acc = 0
        for col, w in P['stripes']:
            m = (u >= acc) & (u < acc + w); mat[m] = col; acc += w
        mat = cv2.GaussianBlur(mat, (0, 0), 0.7)
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
    # every frame lives INSIDE the signed-off Gully outline (BOX) — never bigger (Joe, Nov 1)
    bx1, by1, bx2, by2 = BOX
    f = fit_axis(f, 1, bx2 - bx1); f = fit_axis(f, 0, by2 - by1)
    out = np.zeros((CH, CW, 4), np.float32); out[by1:by2, bx1:bx2] = f
    f = out.copy()
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
    put_panel(pr(P.get('chaseFrom', 'chase')), t['chase'], mirror=True)   # chaseFrom: borrow another panel's art when garlands hang over the original
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
    if P.get('underLights'):   # Joe's one exception to the box rule: fairy lights strung along the underside, hanging below the board
        out = under_lights(out)
    spr = np.array(Image.open(src.replace('_orig.webp', '_sprites.webp')).convert('RGBA')).astype(np.float32) if P.get('spriteFile') else a
    for (sx1, sy1, sx2, sy2), (cx, cy), size in P.get('topSprites', []):   # bits of the board's own art layered on top (e.g. corner signal lamps)
        piece = spr[sy1:sy2, sx1:sx2]; k2 = size / max(piece.shape[:2])
        pc = rs4(piece, piece.shape[1] * k2, piece.shape[0] * k2)
        paste(out, pc, cx - pc.shape[1] / 2, cy - pc.shape[0] / 2)
    if 'badgeRing' in P:   # the board's own round recess, centred on the crest spot (MATCH_HUD_CREST) so the crest sits in it
        bx, by, br = P['badgeRing']; R2 = br * 1.12
        pc = circ(rs4(a[int(by - R2):int(by + R2), int(bx - R2):int(bx + R2)], 2 * CREST[2] * 1.12, 2 * CREST[2] * 1.12), 0.9)
        paste(out, pc, CREST[0] - CREST[2] * 1.12, CREST[1] - CREST[2] * 1.12)
    if 'overBand' in P:   # e.g. a tent valance that drapes over the top panel: its green + cream stripes go back on top
        y1, y2, x1, x2 = P['overBand']; fr = f[:BODY]; rgb = fr[..., :3] / 255.0
        green = (rgb[..., 1] > rgb[..., 0] + .06) & (rgb[..., 1] > rgb[..., 2] + .06)
        cream = (rgb.min(-1) > .62) & (rgb.max(-1) - rgb.min(-1) < .28)
        if P.get('overKind') == 'toran':
            r_, g_, b_ = rgb[..., 0], rgb[..., 1], rgb[..., 2]
            leaf = (g_ > r_ + .05) & (g_ > b_ + .1) & (g_ > .3)
            mari = (r_ > .8) & (g_ > .35) & (b_ < .3) & ((r_ - b_) > .55)
            sel = leaf | mari
        else:
            sel = green | cream
        m = np.zeros(fr.shape[:2], bool); m[y1:y2, x1:x2] = sel[y1:y2, x1:x2]
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

def under_lights(out, y0=278, xs=(46, 160, 268, 380, 492, 604, 714), sag=17, step=27):
    from PIL import ImageDraw, ImageFilter
    SS = 4; H, W = out.shape[:2]
    wire = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0)); dw = ImageDraw.Draw(wire)
    glow = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0)); dg = ImageDraw.Draw(glow)
    bulbs = []
    for xa, xb in zip(xs[:-1], xs[1:]):
        pts = []
        for i in range(41):
            t = i / 40; x = xa + (xb - xa) * t; y = y0 + sag * 4 * t * (1 - t); pts.append((x * SS, y * SS))
        dw.line(pts, fill=(40, 34, 30, 255), width=2 * SS, joint='curve')
        n = max(2, round((xb - xa) / step))
        for j in range(1, n):
            t = j / n; bulbs.append((xa + (xb - xa) * t, y0 + sag * 4 * t * (1 - t)))
    for (x, y) in bulbs:
        cx, cy = x * SS, (y + 7) * SS
        dg.ellipse([cx - 11 * SS, cy - 11 * SS, cx + 11 * SS, cy + 11 * SS], fill=(255, 205, 110, 110))
        dw.rectangle([cx - 2.2 * SS, (y + 0.5) * SS, cx + 2.2 * SS, (y + 3.2) * SS], fill=(70, 62, 52, 255))
        dw.ellipse([cx - 3.4 * SS, cy - 4.4 * SS, cx + 3.4 * SS, cy + 4.6 * SS], fill=(255, 226, 140, 255))
        dw.ellipse([cx - 1.6 * SS, cy - 2.8 * SS, cx + 0.6 * SS, cy + 0.2 * SS], fill=(255, 252, 228, 255))
    glow = glow.filter(ImageFilter.GaussianBlur(5 * SS)).resize((W, H), Image.LANCZOS)
    wire = wire.resize((W, H), Image.LANCZOS)
    base = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    base.alpha_composite(glow); base.alpha_composite(wire)
    return np.array(base).astype(np.float32)

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
