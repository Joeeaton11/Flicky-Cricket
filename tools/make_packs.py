#!/usr/bin/env python3
"""Ground packs (Nov 16): splits the themed grounds into one download pack per league.
Writes www/assets/themes/packs.json: for every league, the theme folders and ground plates it uses, with each file and
its size. Leagues up to BUNDLED stay inside the app; the rest are downloaded from flickycricket.com/play when a player
gets near them. Run after adding or changing grounds:  python3 tools/make_packs.py
Then, in the app builds (after `npx cap sync`):        python3 tools/make_packs.py --strip <native public folder>"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WWW = os.path.join(ROOT, 'www'); TH = os.path.join(WWW, 'assets', 'themes')
BUNDLED = 3   # leagues 0..3 ship inside the app (Gully, Floodlit, Coastal)
src = open(os.path.join(WWW, 'index.html'), encoding='utf8').read()
art = dict(re.findall(r"\n\s*([a-z0-9_]+):\s*\{\s*dir:\s*'assets/themes/([a-z0-9_]+)/'", src))
res = dict(re.findall(r"([a-z0-9_]+):\s*'assets/themes/([a-z0-9_]+)/result\.webp'", src))
plates = set(f[:-5] for f in os.listdir(TH) if f.endswith('.webp'))
lg_src = src[src.index('THEMED_LEAGUES ='):]
lg_src = lg_src[:lg_src.index('\n];')] + '\n'
leagues = []
for m in re.finditer(r"\n  \{\n(.*?)\n  \},?(?=\n)", lg_src, re.S):
    block = m.group(1)
    name = re.search(r"\bname:\s*\"([^\"]+)\"", block)
    sc = re.search(r"\bscenes:\s*\[([^\]]*)\]", block); sk = re.search(r"\bsceneKey:\s*'([a-z0-9_]+)'", block)
    keys = re.findall(r"'([a-z0-9_]+)'", sc.group(1)) if sc else ([sk.group(1)] if sk else [])
    leagues.append({'name': name.group(1) if name else '?', 'scenes': keys})
packs, owner = [], {}
for i, L in enumerate(leagues):
    items = set()
    for k in L['scenes']:
        if k in art: items.add(art[k])
        if k in res: items.add(res[k])
        if k in plates: items.add(k + '.webp')
    files = []
    for it in sorted(items):
        p = os.path.join(TH, it)
        if os.path.isdir(p):
            for f in sorted(os.listdir(p)): files.append([it + '/' + f, os.path.getsize(os.path.join(p, f))])
        elif os.path.exists(p): files.append([it, os.path.getsize(p)])
        owner.setdefault(it, i)
    packs.append({'league': i, 'name': L['name'], 'scenes': L['scenes'], 'items': sorted(items), 'files': files, 'bytes': sum(s for _, s in files)})
out = {'version': 1, 'bundled': BUNDLED, 'base': 'https://flickycricket.com/play/assets/themes/', 'packs': packs}
if '--strip' in sys.argv:
    dest = os.path.join(sys.argv[sys.argv.index('--strip') + 1], 'assets', 'themes')
    keep = set(it for p in packs if p['league'] <= BUNDLED for it in p['items'])
    gone = 0
    for p in packs:
        if p['league'] <= BUNDLED: continue
        for it in p['items']:
            if it in keep or owner.get(it, 99) <= BUNDLED: continue
            q = os.path.join(dest, it)
            if os.path.isdir(q):
                for f in os.listdir(q): gone += os.path.getsize(os.path.join(q, f)); os.remove(os.path.join(q, f))
                os.rmdir(q)
            elif os.path.exists(q): gone += os.path.getsize(q); os.remove(q)
    print(f'stripped {gone / 1e6:.1f} MB of downloadable grounds from {dest}')
else:
    json.dump(out, open(os.path.join(TH, 'packs.json'), 'w'), separators=(',', ':'))
    # the game reads this one synchronously at start (it must know which grounds live in the app before any image loads)
    open(os.path.join(TH, 'packs.js'), 'w').write('window.FC_PACKS=' + json.dumps(out, separators=(',', ':')) + ';')
    inapp = sum(p['bytes'] for p in packs if p['league'] <= BUNDLED); dl = sum(p['bytes'] for p in packs if p['league'] > BUNDLED)
    print(f'{len(leagues)} leagues · in app {inapp / 1e6:.1f} MB · downloaded on demand {dl / 1e6:.1f} MB')
