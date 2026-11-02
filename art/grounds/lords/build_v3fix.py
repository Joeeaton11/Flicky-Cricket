# Joe preferred v3 (Figma 400:192) but: sides overlap (repeated crowd) + middle narrower than top/bottom (the 4 spread repeat
# bands sat where the edge slopes -> pinch). Try: ONE band repeated at the equator only (edge vertical there) with a seam chosen
# where the crowd rows match, then a scale search; report the ring error.
import numpy as np, cv2, sys
from measure import measure
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('raw/plate_399-191.png').astype(np.float32); ex,ey,ew,eh=np.load('ell.npy')
def stretch(L):
  if L<=0: return img, ey
  F=30; w=np.linspace(0,1,F)[:,None,None]; best=None
  xl,xr=int(ex-ew/2),int(ex+ew/2)
  side=np.zeros(img.shape[1],np.float32); side[:max(xl-5,1)]=1; side[xr+5:]=1
  wall=(img.min(-1)>200).astype(np.float32)   # bare white stand walls
  for a0 in range(int(ey)-L//2-200,int(ey)-L//2+201,2):
    d=(np.abs(img[a0+L:a0+L+F]-img[a0:a0+F]).mean(axis=(0,2))*(0.2+side)).sum()/ (0.2*len(side)+side.sum())
    wl=(wall[a0:a0+L]*side).sum()/(L*side.sum())
    # edge verticality: the painted grass edge should move little across the band (no notch at the joins)
    sc=d+wl*400
    if best is None or sc<best[0]: best=(sc,a0)
  a0=best[1]; top=img[:a0+L+F]; seam=top[-F:]*(1-w)+img[a0:a0+F]*w
  return np.concatenate([top[:-F],seam,img[a0+F:]],0), ey+L/2
def make(L,s):
  im,ey2=stretch(L); up=cv2.resize(im,(round(im.shape[1]*s),round(im.shape[0]*s)),interpolation=cv2.INTER_CUBIC)
  ox=int(round(ex*s-cx)); oy=int(round(ey2*s-cy))
  if oy<0:   # summer sky above the painting: painted sky colour deepening to clear blue, a few soft clouds
    n=-oy; top=cv2.GaussianBlur(up[:8].mean(0,keepdims=True),(0,0),sigmaX=80,sigmaY=0.1)[0]
    t=np.linspace(1,0,n)[:,None,None]; ext=top[None]*(1-t*0.7)+np.array([205,140,60.])*(t*0.7)
    rng=np.random.default_rng(5); cl=np.zeros(ext.shape[:2],np.float32)
    for _ in range(5):
      cx_,cy_=rng.integers(80,up.shape[1]-80),rng.integers(int(n*.25),int(n*.8))
      for k in range(6): cv2.ellipse(cl,(int(cx_+rng.integers(-60,60)),int(cy_+rng.integers(-12,12))),(int(rng.integers(30,70)),int(rng.integers(14,26))),0,0,360,1,-1)
    cl=cv2.GaussianBlur(cl,(0,0),6)[...,None]*0.85; ext=ext*(1-cl)+np.array([250,248,245.])*cl
    F2=24; w2=np.linspace(0,1,F2)[:,None,None]; up[:F2]=ext[-1:]*(1-w2)+up[:F2]*w2
    up=np.concatenate([ext,up],0); oy=0
  c=up[oy:oy+H,max(ox,0):max(ox,0)+W]
  if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
  return np.clip(c,0,255).astype(np.uint8)
best=None
for L in range(0,260,20):
  for s in np.arange(1.28,1.42,0.01):
    o=make(L,s); r=measure(o,9); e=np.abs(r[:,1]).max()
    if best is None or e<best[0]: best=(e,L,s)
print('best',best)
if len(sys.argv)>1:
  e,L,s=best; o=make(L,s); r=measure(o,3); print('final max',round(float(np.abs(r[:,1]).max()),1),'p90',round(float(np.percentile(np.abs(r[:,1]),90)),1))
  cv2.imwrite('plate_v3fix.png',o)
