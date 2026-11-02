# try different repeated-row counts / scale tweaks, measure the painted grass edge vs the coded oval, keep the best (max error per 30deg)
import numpy as np, cv2, subprocess, re, itertools
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
src=open('build.py').read()
def measure(o):
  lab=cv2.cvtColor(cv2.GaussianBlur(o,(0,0),5),cv2.COLOR_BGR2LAB).astype(float); ref=np.median(lab[1300:1700,400:800].reshape(-1,3),0); rows=[]
  for a in range(0,360,3):
    t=np.radians(a)
    for k in np.arange(0.8,1.15,0.001):
      x=int(cx+np.cos(t)*rx*k); y=int(cy+np.sin(t)*ry*k)
      if not(0<=x<W and 0<=y<H): break
      if np.linalg.norm(lab[y,x]-ref)>50: rows.append((a,(k-1)*np.hypot(np.cos(t)*rx,np.sin(t)*ry)/3)); break
  r=np.array(rows); m=[float(np.median(r[(r[:,0]>=a)&(r[:,0]<a+30),1])) for a in range(0,360,30)]; return max(abs(v) for v in m), [round(v,1) for v in m]
best=None
import sys
for frac in [0.55,0.7,0.85,1.0]:
  for sk in [0.98,1.0,1.02]:
    s=src.replace("s=2*rx/ew; L=max(0,int(round(2*ry/s-eh)))",f"s=2*rx/ew*{sk}; L=max(0,int(round((2*ry/s-eh)*{frac})))")
    open('_try.py','w').write(s); subprocess.run(['python3','_try.py'],capture_output=True)
    e,m=measure(cv2.imread('plate.png')); print(frac,sk,round(e,1),m)
    if best is None or e<best[0]: best=(e,frac,sk)
print('best',best)
