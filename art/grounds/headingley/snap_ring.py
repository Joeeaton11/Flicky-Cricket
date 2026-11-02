# Nudge the painted board ring onto the coded oval: per angle, the painted grass edge sits e(angle) px off the oval (+ beyond).
# A smooth radial shift of e, full at the ring and fading to 0 over 90 px inside (grass) and 90 px outside (crowd) — max ~20 px,
# so nothing visibly bends. Offsets smoothed round the ring.
import numpy as np, cv2, sys
o=cv2.imread(sys.argv[1]); H,W=o.shape[:2]; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
hsv=cv2.cvtColor(cv2.GaussianBlur(o,(0,0),2),cv2.COLOR_BGR2HSV).astype(int)
g=((hsv[...,0]>=34)&(hsv[...,0]<=46)&(hsv[...,1]>150)&(hsv[...,2]>95)).astype(np.uint8)
g=cv2.morphologyEx(g,cv2.MORPH_CLOSE,np.ones((7,7),np.uint8)); n,l=cv2.connectedComponents(g); grass=l==l[int(cy),int(cx)]
N=720; e=np.zeros(N)
for i in range(N):
  t=2*np.pi*i/N-np.pi; R=np.hypot(np.cos(t)*rx,np.sin(t)*ry); d=-80
  while d<80:
    X=int(cx+np.cos(t)*rx*(1+d/R)); Y=int(cy+np.sin(t)*ry*(1+d/R))
    if not(0<=X<W and 0<=Y<H) or not grass[Y,X]: break
    d+=1
  e[i]=d
k=np.exp(-0.5*(np.arange(-20,21)/7.0)**2); k/=k.sum()
e=np.convolve(np.concatenate([e[-20:],e,e[:20]]),k,'same')[20:-20]
yy,xx=np.mgrid[:H,:W].astype(np.float32); dxn,dyn=(xx-cx)/rx,(yy-cy)/ry; rho=np.sqrt(dxn**2+dyn**2)+1e-6
th=np.arctan2(dyn,dxn); Rr=np.hypot(np.cos(th)*rx,np.sin(th)*ry); dist=(rho-1)*Rr
ei=e[((th+np.pi)/(2*np.pi)*N).astype(int)%N]
F=90; wgt=np.clip(1-np.abs(dist)/F,0,1); wgt=wgt*wgt*(3-2*wgt)
src_dist=dist+ei*wgt          # sample from where the painted ring actually is
rs=1+src_dist/Rr; mx=(cx+dxn/rho*rs*rx).astype(np.float32); my=(cy+dyn/rho*rs*ry).astype(np.float32)
out=cv2.remap(o,mx,my,cv2.INTER_CUBIC,borderMode=cv2.BORDER_REFLECT_101)
cv2.imwrite(sys.argv[2],out); print('max shift px',round(float(np.abs(e).max()),1))
