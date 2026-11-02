# 5.b The Oval (Figma 403:192, sunburst; 403:191 too round 1.21). Painted field 1.92 tall vs game 1.576 -> CUT rows at the
# equator (sides ~vertical there, seam chosen where rows match best), then ONE even scale; scale/cut searched for the smallest
# max board-ring error (measure.py). ring.py then puts the boards exactly on the coded oval. Top: painted sky (Lord's 402:191) if short.
import numpy as np, cv2, sys
from measure import measure
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('raw/plate_405-191.png').astype(np.float32); ex,ey,ew,eh=np.load('ell.npy')
def cut(L):
  if L<0:   # field painted too SHORT: repeat -L rows at the equator (sides ~vertical there), seam where the side crowds match
    L=-L; F=30; w=np.linspace(0,1,F)[:,None,None]; best=None
    xl,xr=int(ex-ew/2),int(ex+ew/2); side=np.zeros(img.shape[1],np.float32); side[:max(xl-5,1)]=1; side[xr+5:]=1
    for a0 in range(int(ey)-L//2-120,int(ey)-L//2+121,2):
      d=(np.abs(img[a0+L:a0+L+F]-img[a0:a0+F]).mean(axis=(0,2))*(0.2+side)).sum()
      if best is None or d<best[0]: best=(d,a0)
    a0=best[1]; top=img[:a0+L+F]; seam=top[-F:]*(1-w)+img[a0:a0+F]*w
    return np.concatenate([top[:-F],seam,img[a0+F:]],0), ey+L/2
  if L==0: return img,ey
  F=30; w=np.linspace(0,1,F)[:,None,None]; best=None
  for a0 in range(int(ey)-L//2-80,int(ey)-L//2+81,2):
    d=np.abs(img[a0+L-F:a0+L]-img[a0-F:a0]).mean()   # rows a0..a0+L removed; compare what will meet
    if best is None or d<best[0]: best=(d,a0)
  a0=best[1]; A=img[:a0]; B=img[a0+L:]
  seam=A[-F:]*(1-w)+B[:F]*w
  return np.concatenate([A[:-F],seam,B[F:]],0), ey-(L+F)/2   # the crossfade also removes F rows
def make(L,s):
  im,ey2=cut(L); up=cv2.resize(im,(round(im.shape[1]*s),round(im.shape[0]*s)),interpolation=cv2.INTER_CUBIC)
  ox=int(round(ex*s-cx)); oy=int(round(ey2*s-cy))
  if oy<0:
    n=-oy; sky=cv2.imread('../lords/raw/sky_402-191.png').astype(np.float32)
    k=up.shape[1]/sky.shape[1]; sky=cv2.resize(sky,(up.shape[1],round(sky.shape[0]*k))); F2=90; need=n+F2
    if sky.shape[0]<need: sky=np.concatenate([np.repeat(sky[:1],need-sky.shape[0],0),sky],0)
    sky=sky[-need:]; gain=up[:12].reshape(-1,3).mean(0)/np.maximum(sky[-F2:-F2+12].reshape(-1,3).mean(0),1)
    sky=sky*(1+(gain-1)*(np.linspace(0,1,need)[:,None,None]**1.5)); w2=np.linspace(0,1,F2)[:,None,None]
    up[:F2]=sky[-F2:]*(1-w2)+up[:F2]*w2; up=np.concatenate([sky[:-F2],up],0); oy=0
  c=up[oy:oy+H,max(ox,0):max(ox,0)+W]
  if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
  return np.clip(c,0,255).astype(np.uint8), oy
# width-exact scale (so the painted field never runs past the screen sides, where there is no crowd to pull in); cut chosen so the
# height matches too; ring.py fixes the remaining small differences at the ends, where the stands are deep
sw=2*rx/ew; Lh=int(round(eh-2*ry/sw))-30
best=(np.abs(measure(make(Lh,sw)[0],9)[:,1]).max(),Lh,sw)
print('best',best)
o,oy=make(best[1],best[2]); cv2.imwrite('plate_v3fix.png',o); print('oy',oy)
