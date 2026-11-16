# frames + timestamps -> constant 30fps mp4
import json, sys, subprocess
run = sys.argv[1]; d = json.load(open(run + '/meta.json')); fr = d['frames']
with open(run + '/concat.txt', 'w') as f:
    for i, (ts, fn) in enumerate(fr):
        dur = (fr[i + 1][0] - ts) if i + 1 < len(fr) else 0.033
        f.write(f"file '{fn}'\nduration {max(dur, 0.001):.4f}\n")
    f.write(f"file '{fr[-1][1]}'\n")
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', run + '/concat.txt', '-vf', 'fps=30,scale=1080:1920:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', run + '/full.mp4'], check=True)
print(run + '/full.mp4', 'start', fr[0][0])
