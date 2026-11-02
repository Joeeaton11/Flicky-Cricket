"""Swap the m3_* and b3_* sprite blocks in flicky-cricket.html for the new Blender renders."""
import json, os, re
W = os.path.dirname(os.path.abspath(__file__)); G = os.path.expanduser('~/Flicky-Cricket/flicky-cricket.html')
s = open(G).read(); lines = s.split('\n')
m3 = json.load(open(f'{W}/m3_sprites.json')); b3 = json.load(open(f'{W}/b3work/b3_sprites.json'))
done = {'m3': False, 'b3': False}
for i, l in enumerate(lines):
    if l.startswith('Object.assign(GP_SRC, {"m3_'):
        lines[i] = 'Object.assign(GP_SRC, ' + json.dumps(m3, separators=(',', ':')) + ');'; done['m3'] = True
    elif l.startswith('Object.assign(GP_SRC, {"b3_'):
        lines[i] = 'Object.assign(GP_SRC, ' + json.dumps(b3, separators=(',', ':')) + ');'; done['b3'] = True
assert all(done.values()), done
out = '\n'.join(lines); open(G, 'w').write(out)
print('m3 entries', len(m3), 'b3 entries', len(b3), 'file MB', round(len(out) / 1e6, 2), '(was', round(len(s) / 1e6, 2), ')')
