"""Feed the Blender bowler passes (sp_seam) to the game's own bowlbake.py, with the white shirt / maroon trousers recolour on."""
import json, os, shutil, subprocess
W = os.path.dirname(os.path.abspath(__file__)); S = f'{W}/sp_seam'; B = f'{W}/b3work'
shutil.rmtree(B, ignore_errors=True); os.makedirs(B)
M = json.load(open(f'{S}/meta.json'))
for n, _ in M['seq']:
    for src, dst in (('w', 'bw'), ('m', 'bm'), ('n', 'bn'), ('d', 'bd')): shutil.copy(f'{S}/{src}_{n}.png', f'{B}/{dst}_{n}.png')
json.dump({'seq': M['seq'], 'meta': M['meta']}, open(f'{B}/bowl_meta.json', 'w'))
code = open(f'{W}/bowlbake.py').read().replace("T={}   # cloth colours are painted into the texture in bowl.html now", "T={1:SHIRT,10:TROU}   # Blender renders keep the model's own cloth: recolour shirt/trousers here")
open(f'{B}/bake.py', 'w').write(code)
subprocess.run(['python3', 'bake.py'], cwd=B, env=dict(os.environ, PYTHONPATH=W), check=True)
