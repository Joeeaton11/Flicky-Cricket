"""Swap every 3D sprite block into flicky-cricket.html: m3_ batter, b3_ seam, b3o_ off spin, b3l_ leg spin, f3_ fielders."""
import json, os
W = os.path.dirname(os.path.abspath(__file__)); G = os.path.expanduser('~/Flicky-Cricket/flicky-cricket.html')
BLOCKS = [('m3_', f'{W}/m3_sprites.json'), ('b3_', f'{W}/b3work/b3_sprites.json'), ('b3o_', f'{W}/b3work_offspin/b3_sprites.json'),
          ('b3l_', f'{W}/b3work_legspin/b3_sprites.json'), ('f3_', f'{W}/f3_sprites.json')]
s = open(G).read(); lines = s.split('\n')
for pre, path in BLOCKS:
    if not os.path.exists(path): print('skip', pre, '(not built)'); continue
    J = json.load(open(path)); new = 'Object.assign(GP_SRC, ' + json.dumps(J, separators=(',', ':')) + ');'
    at = [i for i, l in enumerate(lines) if l.startswith('Object.assign(GP_SRC, {"' + pre)]
    if at: lines[at[0]] = new
    else:
        last = max(i for i, l in enumerate(lines) if l.startswith('Object.assign(GP_SRC, {"'))
        lines.insert(last + 1, new)
    print(pre, len(J), 'entries')
out = '\n'.join(lines); open(G, 'w').write(out); print('file MB', round(len(out) / 1e6, 2), '(was', round(len(s) / 1e6, 2), ')')
