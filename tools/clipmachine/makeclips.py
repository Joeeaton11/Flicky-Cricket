import sys, os; sys.path.insert(0, '/home/claude/clips')
from cut import make_clip, events, end_card
R = '/home/claude/clips/runs'; O = '/home/claude/clips/out'; os.makedirs(O, exist_ok=True)
EC = '/home/claude/clips/assets/end.png'
if not os.path.exists(EC): end_card(EC)
def sixes(run, detail=False):
    r, s = events(f'{R}/{run}'); out = [e for e in r if e['n'] == 6]
    return out if detail else [e['t'] for e in out]
DRIVES = {'shot_drive', 'shot_offdrive', 'shot_ondrive', 'shot_coverdrive'}
used = set()   # (run, t) already in a clip, and shots already shown
used_shots = {}
def pick(run, n=1, spin=None):
    """n sixes from a run, each a different shot, sideways shots first, spin-bowled first when spin=True"""
    c = [e for e in sixes(run, True) if (run, e['t']) not in used]
    key = lambda e: ((spin is True and not str(e.get('bowl', '')).startswith(('b3o', 'b3l'))), (e.get('shot') in DRIVES), used_shots.get(e.get('shot'), 0))
    c.sort(key=key); out, seen = [], set()
    for e in c:
        if e.get('shot') in seen: continue
        out.append(e); seen.add(e.get('shot'))
        if len(out) == n: break
    print('PICK', run, [(e.get('shot','').replace('shot_',''), e.get('bowl')) for e in out])
    for e in out: used.add((run, e['t'])); used_shots[e.get('shot')] = used_shots.get(e.get('shot'), 0) + 1
    return [e['t'] for e in sorted(out, key=lambda e: e['t'])]
def first_result(run):
    r, s = events(f'{R}/{run}'); res = [e['t'] for e in s if e.get('s') == 'result']; return res[0] if res else None
def full(run): return f'{R}/{run}/full.mp4'
single = lambda t: [(t - 3.8, t + 1.8)]
three = lambda ts: [(t - 2.2, t + 1.4) for t in ts[:3]]
plan = [
  ('clip01', 'tg_gully', 'single', None, 'This should NOT have been a six'),
  ('clip02', 'te_coliseum', 'three', None, '3 sixes. 1 thumb.'),
  ('clip03', 'tc_beachnight', 'single', True, 'Rate this shot out of 10'),
  ('clip04', 'tf_funfair', 'single', None, 'Big moment. Big six.'),
  ('clip05', 'tc_beachnight', 'three', True, "POV: you're the bowler"),
  ('clip06', 'tr_rooftop', 'single', True, "Gully cricket rules, but it's a video game"),
  ('clip08', 'td_dubai', 'single', None, 'Swipe. Six. Repeat.'),
  ('clip09', 'ta_mcg', 'single', None, 'Comment your best score'),
  ('clip10', 'tg_gully', 'chase', None, 'Can you chase 34 off 12?'),
]
done = []
for name, run, kind, spin, hook in plan:
    if not os.path.exists(full(run)): print('skip (no recording)', name, run); continue
    try:
        if kind == 'single':
            ts = pick(run, 1, spin)
            if ts:
                _, st_ = events(f'{R}/{run}'); rd = [e['t'] for e in st_ if e.get('s') == 'ready' and e['t'] < ts[0] - 1.0]
                a = max(ts[0] - 4.2, (rd[-1] + 0.7) if rd else ts[0] - 3.8); segs = [(a, ts[0] + 1.8)]
            else: segs = None
        elif kind == 'three':
            ts = pick(run, 3, spin); segs = three(ts) if len(ts) >= 2 else None
        elif kind == 'chase':
            r, s_ = events(f'{R}/{run}'); fr = first_result(run) or 1e9
            sc = [e['t'] for e in r if e['t'] < fr and e['n'] >= 4][:5]; segs = [(t - 1.9, t + 1.0) for t in sc]
        if not segs: print('not enough sixes', name, run); continue
        make_clip(full(run), segs, hook, f'{O}/{name}.mp4', EC); done.append(name)
    except Exception as e: print('fail', name, e)
# clip07: one six from each ground
gr = [r for r in ['tg_gully', 'tr_rooftop', 'te_coliseum', 'tc_beachnight', 'tf_funfair', 'ti_mumbai', 'ta_mcg', 'td_dubai'] if os.path.exists(full(r)) and sixes(r)]
if len(gr) >= 4:
    # make_clip takes one source; build per-ground parts then join
    import subprocess
    parts = []
    for i, r in enumerate(gr):
        ts = pick(r, 1) or sixes(r)[:1]; t = ts[0]; p = f'{O}/_g{i}.mp4'
        make_clip(full(r), [(t - 2.0, t + 1.3)], f'Which ground is best? {i + 1} of {len(gr)}', p, EC); parts.append(p)
    # strip each part's end card (last 1.8 s), then one end card at the end
    trimmed = []
    for p in parts:
        d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))
        q = p.replace('.mp4', '_t.mp4'); subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', p, '-t', f'{d - 1.8:.2f}', '-c', 'copy', q], check=True); trimmed.append(q)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-loop', '1', '-t', '1.8', '-i', EC, '-f', 'lavfi', '-t', '1.8', '-i', 'anullsrc=r=44100:cl=stereo', '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-c:a', 'aac', '-shortest', f'{O}/_end.mp4'], check=True)
    lst = f'{O}/_l.txt'; open(lst, 'w').write(''.join(f"file '{p}'\n" for p in trimmed + [f'{O}/_end.mp4']))
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-c:a', 'aac', '-movflags', '+faststart', f'{O}/clip07.mp4'], check=True)
    subprocess.run('rm -f ' + O + '/_*', shell=True); done.append('clip07')
print('made', sorted(done))
