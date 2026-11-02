# Lord's v3 fix: make the boundary a perfect ellipse on the coded oval without warping the crowd.
# 1) plate_v3fix.png = v3 plate (400:192) + one equator band, scaled (build_v3fix.py)
# 2) inside the coded oval: everything that isn't grass (old boards, specks) -> grass, rebuilt per column from the painted
#    stripes (stripes run top-to-bottom, so a column's grass colour is constant + gentle shading)
# 3) a new board ring drawn ON the coded oval: its cross-section (colour profile outward from the grass edge) is sampled from
#    the painted boards at the right-hand equator, so it looks exactly like the painted boards; crowd behind left untouched
import numpy as np, cv2
o=cv2.imread('plate_v3fix.png').astype(np.float32); H,W=o.shape[:2]; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
hsv=cv2.cvtColor(cv2.GaussianBlur(o.astype(np.uint8),(0,0),2),cv2.COLOR_BGR2HSV).astype(int)
grass=(hsv[...,0]>=34)&(hsv[...,0]<=46)&(hsv[...,1]>150)&(hsv[...,2]>95)
yy,xx=np.mgrid[:H,:W].astype(np.float32); dx,dy=(xx-cx)/rx,(yy-cy)/ry; rho=np.sqrt(dx*dx+dy*dy)
th=np.arctan2(dy,dx); Rr=np.hypot(np.cos(th)*rx,np.sin(th)*ry); dist=(rho-1)*Rr     # px outward from the coded oval
# --- 2) grass inside
inside=rho<1.0
core=grass&(rho<0.93)
colmed=np.full((W,3),np.nan,np.float32)
for x in range(W):
  m=core[:,x]
  if m.sum()>20: colmed[x]=np.median(o[m,x],0)
ok=np.where(~np.isnan(colmed[:,0]))[0]
for x in range(W):   # edge columns with no core grass: continue the stripe pattern by mirroring the nearest valid columns
  if np.isnan(colmed[x,0]):
    if x<ok[0]: colmed[x]=colmed[min(ok[0]+(ok[0]-x),W-1)] if not np.isnan(colmed[min(ok[0]+(ok[0]-x),W-1),0]) else colmed[ok[0]]
    elif x>ok[-1]: colmed[x]=colmed[max(ok[-1]-(x-ok[-1]),0)] if not np.isnan(colmed[max(ok[-1]-(x-ok[-1]),0),0]) else colmed[ok[-1]]
    else: colmed[x]=colmed[x-1]
colmed=cv2.GaussianBlur(colmed[None],(0,0),sigmaX=1.2,sigmaY=0.1)[0]
rowshade=np.ones(H,np.float32)
for y in range(H):
  m=core[y]
  if m.sum()>50: rowshade[y]=(o[y,m].mean()/colmed[m].mean())
rowshade=cv2.GaussianBlur(rowshade[None],(0,0),sigmaX=25,sigmaY=0.1)[0]
fake=colmed[None,:,:]*rowshade[:,None,None]
noise=cv2.GaussianBlur(np.random.default_rng(1).normal(0,1,(H,W)).astype(np.float32),(0,0),1.2)[...,None]*4
fake=fake+noise
fill=inside&~(grass&(rho<0.985))
fm=cv2.GaussianBlur(fill.astype(np.float32),(0,0),1.5)[...,None]
o=o*(1-fm)+fake*fm
# --- 3) board ring profile from the painted boards at the right equator (row = cy): first non-grass going right from the oval
y0=int(cy); xs=np.arange(int(cx+rx*0.9),W)
row=[x for x in xs if not grass[y0,x]]; x0=row[0]
T=18   # painted boards: dark face + light top edge + a little of their dark back edge
prof=np.median(cv2.imread('plate_v3fix.png').astype(np.float32)[y0-40:y0+40, x0:x0+T],0)   # T x 3, averaged over 80 rows
ring=(dist>=0)&(dist<T)
idx=np.clip(dist,0,T-1); i0=np.floor(idx).astype(int); fr=(idx-i0)[...,None]; i1=np.clip(i0+1,0,T-1)
col=prof[i0]*(1-fr)+prof[i1]*fr
# lighting: top-left sun -> the ring's face toward the light slightly brighter
light=1+0.06*(-np.cos(th)*0.7-np.sin(th)*0.7)
col=col*light[...,None]
a=np.clip(np.minimum(dist+1,T-dist),0,1)[...,None]*ring[...,None]
o=o*(1-a)+col*a
# leftover painted grass OUTSIDE the new boards (the straight equator band): the stands' concrete walkway colour, so nothing green shows beyond the boundary
walk=np.median(cv2.imread('plate_v3fix.png').astype(np.float32)[y0-40:y0+40, x0+18:x0+26].reshape(-1,3),0)
lg=(grass&(dist>=T-1)&(dist<T+60)).astype(np.uint8); lg=cv2.dilate(lg,np.ones((5,5),np.uint8))>0; lg&=(dist>=T-1)
lm=cv2.GaussianBlur(lg.astype(np.float32),(0,0),1.2)[...,None]
o=o*(1-lm)+walk*lm
# soft contact shadow of the boards onto the grass just inside
sh=np.clip(1-(-dist)/6,0,1)*(dist<0)*(dist>-6)
o=o*(1-0.25*sh[...,None])
out=np.clip(o,0,255).astype(np.uint8)
out=cv2.addWeighted(out,1.12,cv2.GaussianBlur(out,(0,0),2),-0.12,0)
cv2.imwrite('plate.png',out); print('board x0',x0,'profile ok')
