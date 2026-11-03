# 5.b Oval boundary fix (Joe: 'sort the boundary out'): redrawn rings left double boards / dotted bands. Instead keep the PAINTED
# boards: the plate (406:193, ellipse 1.48) is scaled to the coded width and stretched vertically by the small ratio difference
# (~6%, invisible on chunky cartoon art), so the painted board ring lands exactly on the coded oval. Search sx, sy, offsets for the
# smallest max error. No ring repaint.
import numpy as np, cv2
from measure import measure
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('raw/plate_438-192.png').astype(np.float32); ex,ey,ew,eh=np.load('ell.npy')
def make(sx,sy,dx=0,dy=0):
  up=cv2.resize(img,(round(img.shape[1]*sx),round(img.shape[0]*sy)),interpolation=cv2.INTER_CUBIC)
  ox=int(round(ex*sx-cx+dx)); oy=int(round(ey*sy-cy+dy))
  if oy<0:
    n=-oy; F2=90; need=n+F2   # own sky: the plate's top rows, blurred sideways, fading up into a deeper evening tone
    edge=cv2.GaussianBlur(up[:16].mean(0,keepdims=True),(0,0),80)[0]
    t=np.linspace(1,0,need)[:,None,None]**1.3; deep=np.array([150,120,95.])   # BGR: dusky lilac-blue
    sky=edge[None]*(1-t*0.55)+deep*(t*0.55)
    w2=np.linspace(0,1,F2)[:,None,None]
    up[:F2]=sky[-F2:]*(1-w2)+up[:F2]*w2; up=np.concatenate([sky[:-F2],up],0); oy=0
  c=up[oy:oy+H,max(ox,0):max(ox,0)+W]
  if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
  return np.clip(c,0,255).astype(np.uint8)
sx0=2*rx/ew; sy0=2*ry/eh; best=None
for a in np.arange(0.95,1.04,0.01):
  for b in np.arange(0.97,1.03,0.01):
    for dx in (-6,0,6):
      for dy in (-20,-10,0,10,20):
        r=measure(make(sx0*a,sy0*b,dx,dy),12); e=np.abs(r[:,1]).max()
        if best is None or e<best[0]: best=(e,a,b,dx,dy)
print('best',best,'stretch y/x',round(sy0*best[2]/(sx0*best[1]),3))
o=make(sx0*best[1],sy0*best[2],best[3],best[4])
cv2.imwrite("plate_raw_fit.png",o); o=cv2.addWeighted(o,1.12,cv2.GaussianBlur(o,(0,0),2),-0.12,0); cv2.imwrite('plate.png',o)
