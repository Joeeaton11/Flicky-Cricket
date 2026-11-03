"""Put the capped fielder sprites into the game: f3_sprites.json (baseball, replaces the old f3_* frames) and
f3w_sprites.json (wide-brim sunhat, new f3w_* frames). Each frame's colour goes to assets/gully/<key>.webp (as the
other 3D players), the colour-guide mask stays inline; one Object.assign(GP_SRC, …) line per set."""
import json, base64, os, sys, re
W = os.path.dirname(os.path.abspath(__file__)); REPO = sys.argv[1]
H = f'{REPO}/flicky-cricket.html'; A = f'{REPO}/assets/gully'
s = open(H).read()
lines = s.split('\n')
def block(pre):
    d = json.load(open(f'{W}/{pre}sprites.json'))
    for k, v in d.items():
        raw = base64.b64decode(v['src'].split(',', 1)[1]); open(f'{A}/{k}.webp', 'wb').write(raw); v['src'] = f'assets/gully/{k}.webp'
    return 'Object.assign(GP_SRC, ' + json.dumps(d, separators=(',', ':')) + ');', len(d)
# old plain f3 block: the line that starts with the f3_ entries
idx = [i for i, l in enumerate(lines) if l.startswith('Object.assign(GP_SRC, {"f3_')]
assert len(idx) == 1, idx
b, nb = block('f3_'); w, nw = block('f3w_')
old_w = [i for i, l in enumerate(lines) if l.startswith('Object.assign(GP_SRC, {"f3w_')]
lines[idx[0]] = b
if old_w: lines[old_w[0]] = w
else: lines.insert(idx[0] + 1, w)
open(H, 'w').write('\n'.join(lines))
print('baseball', nb, 'wide', nw)
