# 5.a Lord's clean pass 2 (Figma 401:192, sunburst): painted field is a true ellipse at ratio 1.62 (game 1.576), so the fit is
# ONE even scale + shift — no repeated rows, no warp (repeated bands put kinks in the board ring on v3; Joe: 'not aligned').
# Scale chosen to minimise the max board-ring error round the whole oval (search over scale), centred on the coded oval.
# Field edge from fit_grass.py (grass-hue mask). Sky above the painting (if any): painted sky colour, blurred sideways.
import numpy as np, cv2
from measure import measure
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('raw/plate_401-192.png').astype(np.float32)
ex,ey,ew,eh=np.load('ell.npy')
def make(s):
  up=cv2.resize(img,(round(img.shape[1]*s),round(img.shape[0]*s)),interpolation=cv2.INTER_CUBIC)
  ox=int(round(ex*s-cx)); oy=int(round(ey*s-cy))
  if oy<0:
    n=-oy; top=cv2.GaussianBlur(up[:6].mean(0,keepdims=True),(0,0),sigmaX=80,sigmaY=0.1)[0]
    up=np.concatenate([np.repeat(top[None],n,0),up],0); oy=0
  c=up[oy:oy+H,ox:ox+W]
  if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
  return np.clip(c,0,255).astype(np.uint8), (ox,oy)
best=None
for s in np.arange(2*rx/ew*0.97, 2*ry/eh*1.03, 0.004):
  o,_=make(s); r=measure(o,6); e=np.abs(r[:,1]).max()
  if best is None or e<best[0]: best=(e,s)
o,(ox,oy)=make(best[1]); print('scale',round(best[1],4),'max err',round(best[0],1),'ox,oy',ox,oy)
o=cv2.addWeighted(o,1.15,cv2.GaussianBlur(o,(0,0),2),-0.15,0); cv2.imwrite('plate.png',o)
v=o.copy(); cv2.ellipse(v,(int(cx),int(cy)),(int(rx),int(ry)),0,0,360,(255,0,255),3); cv2.imwrite('check.png',cv2.resize(v,(390,844),interpolation=cv2.INTER_AREA))
