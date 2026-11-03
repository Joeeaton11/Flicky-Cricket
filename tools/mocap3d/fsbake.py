"""Encode fs/ fielder renders into GP_SRC entries: f3_<action>_d<dir>_<i> {src, mask, ax, ay, hx, hy, k}."""
import json, os, io, base64
from PIL import Image
W = os.path.dirname(os.path.abspath(__file__)); D = f'{W}/fs'; M = json.load(open(f'{D}/meta.json'))
def b64(im, **kw):
    buf = io.BytesIO(); im.save(buf, 'WEBP', **kw); return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
out = {}; tot = 0
for key, mt in sorted(M.items()):
    w = Image.open(f'{D}/{key}_w.png').convert('RGBA'); m = Image.open(f'{D}/{key}_m.png').convert('RGBA')
    a = w.getchannel('A'); bb = a.point(lambda v: 255 if v > 8 else 0).getbbox()
    if not bb: continue
    x0, y0 = max(0, bb[0] - 2), max(0, bb[1] - 2); x1, y1 = min(w.width, bb[2] + 2), min(w.height, bb[3] + 2)
    wc = w.crop((x0, y0, x1, y1)); mc = m.crop((x0, y0, x1, y1))
    mr = Image.merge('RGBA', (mc.getchannel('R'), Image.new('L', mc.size, 0), Image.new('L', mc.size, 0), mc.getchannel('A').point(lambda v: 255 if v > 127 else 0)))
    s, mk = b64(wc, quality=82, method=6), b64(mr, lossless=True, method=6); tot += len(s) + len(mk)
    ax, ay = mt['anchor'][0] - x0, mt['anchor'][1] - y0; hx, hy = mt['palm'][0] - x0, mt['palm'][1] - y0
    out['f3_' + key] = {'src': s, 'mask': mk, 'ax': round(ax, 1), 'ay': round(ay, 1), 'hx': round(hx, 1), 'hy': round(hy, 1), 'k': 1}
r = out.get('f3_ready_d0_0')
if r:
    im = Image.open(io.BytesIO(base64.b64decode(r['src'].split(',')[1]))); print('ready d0 height px', im.height, '-> fld3 scale for 34 px:', round(34 / im.height, 4))
json.dump(out, open(f'{W}/f3_sprites.json', 'w'), separators=(',', ':'))
print('f3 entries', len(out), 'KB', tot // 1024)
