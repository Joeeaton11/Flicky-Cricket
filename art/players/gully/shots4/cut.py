# Batter set v4 (Figma 173/174/175:191, gpt-image): realistic technique, all from behind. Key the green, cut each
# figure to 320 px tall, find its helmet (the navy blob holding the topmost navy pixel) for recolouring, size every
# pose so the helmet matches the stance's helmet on screen, and anchor so the shoes land where the stance's do.
import cv2, numpy as np, json
from PIL import Image
SHEETS = [('s1', ['shot_defend', 'shot_drive', 'shot_coverdrive', 'shot_cut', 'shot_latecut', 'shot_scoop']),
          ('s2', ['bat_stance', 'shot_flick', 'shot_pull', 'shot_sweep', 'shot_revsweep', 'shot_slog']),
          ('s3', ['bat_back', 'shot_hook', 'bat_raise', 'bat_out'])]
GROUP = lambda n: 0.1485 if n.startswith('shot_') else 0.126 if n in ('bat_raise', 'bat_out') else 0.117
def cut_sheet(tag, names):
    sm = cv2.imread(tag + '.png').astype(int); BIG = cv2.imread(f'/tmp/claude-0/sp/s4_{tag[1]}.png').astype(np.float32)
    gn = sm[..., 1] - np.maximum(sm[..., 0], sm[..., 2])
    m = cv2.dilate((gn < 60).astype(np.uint8), np.ones((9, 9), np.uint8)); n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    boxes = sorted([st[i] for i in range(1, n) if st[i][4] > 8000], key=lambda s: (s[1] // 420, s[0]))
    assert len(boxes) == len(names), (tag, len(boxes))
    out = {}
    for name, (x, y, w, h, a) in zip(names, boxes):
        c = BIG[y * 4:(y + h) * 4, x * 4:(x + w) * 4].copy(); b, g, r = c[..., 0], c[..., 1], c[..., 2]
        al = np.clip(1 - (g - np.maximum(r, b) - 25) / 70, 0, 1)
        mm = (al > 0.5).astype(np.uint8); nn, ll, ss, _ = cv2.connectedComponentsWithStats(mm); big = 1 + np.argmax(ss[1:, 4])
        keep = np.zeros_like(mm); bx, by, bw, bh = ss[big][:4]
        for i in range(1, nn):
            cx, cy = ss[i][0] + ss[i][2] / 2, ss[i][1] + ss[i][3] / 2
            if ss[i][4] > 0.2 * ss[big][4] or (bx <= cx <= bx + bw and by <= cy <= by + bh and ss[i][4] > 600): keep[ll == i] = 1
        al = al * cv2.dilate(keep, np.ones((5, 5), np.uint8))
        c[..., 1] = np.where(al < 1, np.minimum(g, np.maximum(r, b) + 8), g)
        rgba = np.dstack([c, al * 255]).clip(0, 255).astype(np.uint8)
        ys, xs = np.nonzero(rgba[..., 3] > 10); rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        s = 320 / rgba.shape[0]; out[name] = cv2.resize(rgba, (max(1, round(rgba.shape[1] * s)), 320), interpolation=cv2.INTER_AREA)
    return out
figs = {}
for tag, names in SHEETS: figs.update(cut_sheet(tag, names))
def measure(im):
    p = im.astype(int); bb, gg, rr, aa = p[..., 0], p[..., 1], p[..., 2], p[..., 3]
    mx, mn = np.maximum(np.maximum(rr, gg), bb), np.minimum(np.minimum(rr, gg), bb)
    navy = ((bb > rr + 18) & (bb > gg + 6) & (mx - mn > 25) & (mx < 200) & (aa > 10)).astype(np.uint8)
    nn, ll, ss, _ = cv2.connectedComponentsWithStats(cv2.morphologyEx(navy, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8)))
    cand = [i for i in range(1, nn) if ss[i][4] > 250 and 0.55 < ss[i][2] / max(1, ss[i][3]) < 2.2]   # helmet-shaped, not a wrist strap
    tlabel = min(cand, key=lambda i: ss[i][1]); hx, hy, hw, hh = ss[tlabel][:4]
    shoe = (aa > 128) & (mn > 150) & (mx - mn < 40); shoe[:int(320 * 0.85)] = False
    fx = np.nonzero(shoe.any(0))[0]; fm = (fx.min() + fx.max()) / 2 if len(fx) else im.shape[1] / 2
    return [int(hx), int(hy), int(hx + hw), int(hy + hh)], hw, fm
hb_s, hw_s, fm_s = measure(figs['bat_stance'])
K_S = 0.626; SC_S = 0.117 / K_S; OFF = -3.7          # stance drawn 59.8 css tall; shoes sit 3.7 css left of the anchor (as before)
meta = {}
for name, im in figs.items():
    hb, hw, fm = measure(im); G = GROUP(name)
    # helmet-to-shoes height matches the stance on screen (59.8 css), allowing for how low each pose is
    LOW = {'shot_sweep': 0.70, 'shot_revsweep': 0.70, 'shot_scoop': 0.72, 'shot_defend': 0.90, 'shot_coverdrive': 0.84,
           'shot_cut': 0.95, 'shot_latecut': 0.93, 'shot_flick': 0.92}.get(name, 1.0)
    k = (319 - hb[1]) * G / (59.8 * LOW); sc = G / k; ax = fm - OFF / sc
    Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGRA2RGBA)).save(f'{name}.webp', quality=92, method=6)
    meta[name] = {'ax': round(float(ax), 1), 'ay': 319.3, 'k': round(float(k), 4), 'hb': hb}
    print(name, im.shape[1], 'helmet', hb, hw, 'k', meta[name]['k'], 'ax', meta[name]['ax'])
json.dump(meta, open('meta.json', 'w'))
