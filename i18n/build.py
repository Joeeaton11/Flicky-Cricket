#!/usr/bin/env python3
"""Builds www/assets/i18n.js from the translation sheets (i18n/*.tsv: English <TAB> Hindi <TAB> Urdu).
'#' stands for any number. Edit a sheet, then run:  python3 i18n/build.py"""
import glob, json, os, re
here = os.path.dirname(os.path.abspath(__file__))
D = {}
for f in sorted(glob.glob(os.path.join(here, '*.tsv'))):
    for line in open(f, encoding='utf8'):
        p = line.rstrip('\n').split('\t')
        if len(p) < 3 or not p[0].strip(): continue
        k = re.sub(r'\s+', ' ', p[0].strip().strip('"'))
        D[k] = [p[1].strip().strip('"'), p[2].strip().strip('"')]
        if re.search(r'[a-z]', k) is None and k != k.title():   # UPPER CASE lines also match Title Case text
            D.setdefault(k.title(), D[k])
out = os.path.join(here, '..', 'www', 'assets', 'i18n.js')
open(out, 'w', encoding='utf8').write('window.FC_I18N=' + json.dumps(D, ensure_ascii=False, separators=(',', ':')) + ';')
print(len(D), 'lines ->', os.path.relpath(out, os.path.join(here, '..')))
