"""Swap all 3D sprite blocks into the game: colour frames to assets/gully/<key>.webp, masks inline, one GP_SRC line per set."""
import json, base64, os, sys
W = os.path.dirname(os.path.abspath(__file__)); REPO = sys.argv[1]; H = f'{REPO}/flicky-cricket.html'; A = f'{REPO}/assets/gully'
BLOCKS = [('m3_', 'm3_sprites.json'), ('b3_', 'b3work/b3_sprites.json'), ('b3o_', 'b3work_offspin/b3_sprites.json'),
          ('b3l_', 'b3work_legspin/b3_sprites.json'), ('f3_', 'f3_sprites.json'), ('f3b_', 'f3b_sprites.json'), ('f3w_', 'f3w_sprites.json')]
s = open(H).read(); lines = s.split('\n')
for pre, p in BLOCKS:
    d = json.load(open(f'{W}/{p}'))
    old = json.loads(next(l for l in lines if l.startswith('Object.assign(GP_SRC, {"' + pre))[len('Object.assign(GP_SRC, '):-2])
    for k in old:
        if k not in d and os.path.exists(f'{A}/{k}.webp'): os.remove(f'{A}/{k}.webp')
    for k, v in d.items():
        if v['src'].startswith('data:'):
            open(f'{A}/{k}.webp', 'wb').write(base64.b64decode(v['src'].split(',', 1)[1])); v['src'] = f'assets/gully/{k}.webp'
    i = next(i for i, l in enumerate(lines) if l.startswith('Object.assign(GP_SRC, {"' + pre))
    lines[i] = 'Object.assign(GP_SRC, ' + json.dumps(d, separators=(',', ':')) + ');'
    print(pre, len(old), '->', len(d), 'missing', sorted(set(old) - set(d))[:5])
out = '\n'.join(lines); open(H, 'w').write(out); print('MB', round(len(s) / 1e6, 2), '->', round(len(out) / 1e6, 2))
