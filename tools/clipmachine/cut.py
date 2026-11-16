# Cut vertical social clips from an auto-played match: hook text burned in + end card
import json, subprocess, sys, os, textwrap
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H = 1080, 1920
FONT = '/home/claude/clips/assets/lilita.ttf'
ICON = '/home/claude/clips/assets/icon.png'

def text_overlay(path, hook, y_frac=0.165):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    size = 92; lines = textwrap.wrap(hook.upper(), 18)
    if len(lines) > 2: size = 78; lines = textwrap.wrap(hook.upper(), 22)
    f = ImageFont.truetype(FONT, size); lh = int(size * 1.08); y = int(H * y_frac)
    boxh = lh * len(lines) + 40; d.rounded_rectangle([60, y - 20, W - 60, y - 20 + boxh], 34, fill=(5, 10, 20, 170))
    for i, ln in enumerate(lines):
        tw = d.textlength(ln, font=f); x = (W - tw) / 2; yy = y + i * lh
        d.text((x, yy), ln, font=f, fill=(255, 255, 255), stroke_width=7, stroke_fill=(5, 10, 20))
    im.save(path)

def end_card(path, line2='PLAY FREE · FLICKYCRICKET.COM'):
    im = Image.new('RGB', (W, H), (11, 22, 48)); d = ImageDraw.Draw(im)
    for r in range(900, 0, -12):   # soft glow
        a = int(60 * (1 - r / 900)); d.ellipse([W/2 - r, 760 - r, W/2 + r, 760 + r], fill=(20 + a, 40 + a, 90 + a))
    ic = Image.open(ICON).resize((420, 420)); m = Image.new('L', (420, 420), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, 420, 420], 90, fill=255)
    im.paste(ic, (W // 2 - 210, 520), m)
    for txt, size, y, col in [('FLICKY CRICKET', 120, 1010, (255, 201, 58)), (line2, 54, 1170, (255, 255, 255)), ('FREE ON IPHONE & ANDROID', 46, 1250, (159, 179, 224))]:
        f = ImageFont.truetype(FONT, size); tw = d.textlength(txt, font=f)
        d.text(((W - tw) / 2, y), txt, font=f, fill=col, stroke_width=6 if size > 100 else 0, stroke_fill=(5, 10, 20))
    im.save(path)

def run(cmd): subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)

def make_clip(full, segs, hook, out, endcard):
    """segs: list of (start, end) seconds in full.mp4; hook burned in for the whole clip, then end card"""
    out = os.path.abspath(out); tmp = out + '.parts'; os.makedirs(tmp, exist_ok=True); ov = tmp + '/ov.png'; text_overlay(ov, hook)
    parts = []
    for i, (a, b) in enumerate(segs):
        p = f'{tmp}/p{i}.mp4'
        run(['ffmpeg', '-y', '-ss', f'{a:.2f}', '-t', f'{b - a:.2f}', '-i', full, '-i', ov, '-filter_complex', '[0:v][1:v]overlay=0:0,fps=30,format=yuv420p', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', p])
        parts.append(p)
    ec = f'{tmp}/end.mp4'
    run(['ffmpeg', '-y', '-loop', '1', '-t', '1.8', '-i', endcard, '-vf', 'fps=30,format=yuv420p,fade=t=in:st=0:d=0.25', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', ec])
    parts.append(ec)
    lst = tmp + '/list.txt'; open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
    run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest', '-c:v', 'copy', '-c:a', 'aac', '-movflags', '+faststart', out])
    subprocess.run(['rm', '-rf', tmp])

def events(run_dir):
    d = json.load(open(run_dir + '/meta.json')) if os.path.exists(run_dir + '/meta.json') else None
    f0 = d['frames'][0][0]
    ev = [dict(e, t=e['t'] - f0) for e in d['log']]
    return [e for e in ev if e['ev'] == 'runs'], [e for e in ev if e['ev'] == 'state']
