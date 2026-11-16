import sys, os; sys.path.insert(0, '/home/claude/clips')
from cut import make_clip, events, end_card
R = '/home/claude/clips/runs'; O = '/home/claude/clips/out'; os.makedirs(O, exist_ok=True)
EC = '/home/claude/clips/assets/end.png'
if not os.path.exists(EC): end_card(EC)
def sixes(run): r, s = events(f'{R}/{run}'); return [e['t'] for e in r if e['n'] == 6]
def winning(run):   # last scoring ball before the first result
    r, s = events(f'{R}/{run}'); res = [e['t'] for e in s if e.get('s') == 'result']
    if not res: return None
    before = [e for e in r if e['t'] < res[0]]; return before[-1]['t'] if before else None
def first_result(run):
    r, s = events(f'{R}/{run}'); res = [e['t'] for e in s if e.get('s') == 'result']; return res[0] if res else None
def full(run): return f'{R}/{run}/full.mp4'
single = lambda t: [(t - 3.8, t + 1.8)]
three = lambda ts: [(t - 2.2, t + 1.4) for t in ts[:3]]
plan = [
  ('clip01', 'tg_gully', 'single', 0, 'This should NOT have been a six'),
  ('clip02', 'te_coliseum', 'three', 0, '3 sixes. 1 thumb.'),
  ('clip03', 'tc_beachnight', 'single', 0, 'Rate this shot out of 10'),
  ('clip04', 'tf_funfair', 'win', 0, 'Need 6. Swipe. Done.'),
  ('clip05', 'ti_mumbai', 'three', 0, "POV: you're the bowler"),
  ('clip06', 'tr_rooftop', 'single', 0, "Gully cricket rules, but it's a video game"),
  ('clip08', 'td_dubai', 'single', 0, 'Swipe. Six. Repeat.'),
  ('clip09', 'ta_mcg', 'single', 0, 'Comment your best score'),
  ('clip10', 'tg_gully', 'chase', 0, 'Can you chase 34 off 12?'),
]
done = []
for name, run, kind, k, hook in plan:
    if not os.path.exists(full(run)): print('skip (no recording)', name, run); continue
    s6 = sixes(run)
    try:
        if kind == 'single' and s6: segs = single(s6[min(k, len(s6) - 1)])
        elif kind == 'three' and len(s6) >= 2: segs = three(s6)
        elif kind == 'win':
            w = winning(run); segs = single(w) if w else single(s6[-1])
        elif kind == 'chase':   # whole first chase, sped up 1.6x is too fiddly: take the scoring balls only
            r, s = events(f'{R}/{run}'); fr = first_result(run) or 1e9
            sc = [e['t'] for e in r if e['t'] < fr and e['n'] >= 4][:5]; segs = [(t - 1.9, t + 1.0) for t in sc]
        else: print('not enough sixes', name, run); continue
        make_clip(full(run), segs, hook, f'{O}/{name}.mp4', EC); done.append(name)
    except Exception as e: print('fail', name, e)
# clip07: one six from each ground
gr = [r for r in ['tg_gully', 'tr_rooftop', 'te_coliseum', 'tc_beachnight', 'tf_funfair', 'ti_mumbai', 'ta_mcg', 'td_dubai'] if os.path.exists(full(r)) and sixes(r)]
if len(gr) >= 4:
    # make_clip takes one source; build per-ground parts then join
    import subprocess
    parts = []
    for i, r in enumerate(gr):
        t = sixes(r)[0]; p = f'{O}/_g{i}.mp4'
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
