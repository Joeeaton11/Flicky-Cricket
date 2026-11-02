# Lord's: make the boundary an exact ellipse on the coded oval, never warping the crowd.
# Input plate_v3fix.png (plate + one equator band, scaled). Steps:
#  a) inside the coded oval, any non-grass pixel (field drawn too small there) <- the nearest painted grass pixel in the same
#     column, moving inward (stripes run top-to-bottom, so this keeps the stripes and the painted light/shadow)
#  b) just outside the new boards, any grass pixel (field drawn too big there) <- the first non-grass pixel further out along
#     the same ray (the stand front is copied in a few px; nothing is stretched)
#  c) new boards drawn exactly on the coded oval from the painted boards' own cross-section (right equator)
import numpy as np, cv2
src=cv2.imread('plate_v3fix.png'); o=src.astype(np.float32); H,W=o.shape[:2]; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
hsv=cv2.cvtColor(cv2.GaussianBlur(src,(0,0),2),cv2.COLOR_BGR2HSV).astype(int)
g=((hsv[...,0]>=34)&(hsv[...,0]<=46)&(hsv[...,1]>150)&(hsv[...,2]>95)).astype(np.uint8)
g=cv2.morphologyEx(g,cv2.MORPH_CLOSE,np.ones((7,7),np.uint8)); n,l=cv2.connectedComponents(g); grass=l==l[int(cy),int(cx)]
grass=cv2.morphologyEx(grass.astype(np.uint8),cv2.MORPH_CLOSE,np.ones((15,15),np.uint8))>0
yy0,xx0=np.mgrid[:H,:W].astype(np.float32); rho0=np.sqrt(((xx0-cx)/rx)**2+((yy0-cy)/ry)**2)
shadow=(hsv[...,0]>=30)&(hsv[...,0]<=60)&(hsv[...,1]>120)&(hsv[...,2]>25)&(rho0<0.985)   # painted tree/stand shadows on the grass count as grass
grass=grass|shadow
yy,xx=np.mgrid[:H,:W].astype(np.float32); dx,dy=(xx-cx)/rx,(yy-cy)/ry; rho=np.sqrt(dx*dx+dy*dy)
th=np.arctan2(dy,dx); Rr=np.hypot(np.cos(th)*rx,np.sin(th)*ry); dist=(rho-1)*Rr
T=18
# board cross-section, sampled before any edits
y0=int(cy); x0=[x for x in range(int(cx+rx*0.9),W) if not grass[y0,x]][0]
prof=np.median(o[y0-40:y0+40, x0:x0+T],0)
grass_core=cv2.erode(grass.astype(np.uint8),np.ones((9,9),np.uint8))>0   # skip the soft painted edge
# a) fill inside
need=(rho<1.0)&~grass_core
out=o.copy()
for x in range(W):
  col=np.where(need[:,x])[0]
  if len(col)==0: continue
  gy=np.where(grass_core[:,x])[0]
  if len(gy)==0:   # column with no grass at all (far sides): use the nearest column that has grass
    xx2=x+1 if x<cx else x-1
    while 0<=xx2<W and not grass_core[:,xx2].any(): xx2+=1 if x<cx else -1
    srcx=min(W-1,max(0,xx2+(xx2-x))); 
    if not grass_core[:,srcx].any(): srcx=xx2
    gy=np.where(grass_core[:,srcx])[0]
  else: srcx=x
  top,bot=gy.min(),gy.max()
  for y in col:
    if y<top: sy=min(top+8+((y*7+x*13)%23), bot)        # grass texture from just inside the painted edge (no repeating blocks)
    elif y>bot: sy=max(bot-8-((y*7+x*13)%23), top)
    else: sy=gy[np.argmin(np.abs(gy-y))]
    out[y,x]=o[sy,srcx]
# b) NO pulling (Joe: distortion). Leftover painted grass / old boards just outside the new ring are covered by making the boards
#    locally thicker (their own dark back-edge colour), so no stand is moved or bent.
fieldish=grass   # grass only (brown boards look like the brown crowd); painted boards just outside read as the boards' own depth
N=1440; e=np.zeros(N)
for i in range(N):
  t=2*np.pi*i/N-np.pi; R=np.hypot(np.cos(t)*rx,np.sin(t)*ry); d=T; last=T
  while d<T+40:
    X=int(cx+np.cos(t)*rx*(1+d/R)); Y=int(cy+np.sin(t)*ry*(1+d/R))
    if not(0<=X<W and 0<=Y<H): break
    if fieldish[Y,X]: last=d+1
    d+=1
  e[i]=last-T
k=np.exp(-0.5*(np.arange(-24,25)/8.0)**2); k/=k.sum()
e=np.convolve(np.concatenate([e[-24:],e,e[:24]]),k,'same')[24:-24]
bi=((th+np.pi)/(2*np.pi)*N).astype(int)%N; ext=e[bi]+3
back=prof[-3:].mean(0)
m=(dist>=T-1)&(dist<T+ext)
mm=cv2.GaussianBlur(m.astype(np.float32),(0,0),1.0)[...,None]
out=out*(1-mm)+back*mm
print('max board thickening px',round(float(e.max()),1))
# c) boards
ring=(dist>=0)&(dist<T)
idx=np.clip(dist,0,T-1); i0=np.floor(idx).astype(int); fr=(idx-i0)[...,None]; i1=np.clip(i0+1,0,T-1)
colr=prof[i0]*(1-fr)+prof[i1]*fr
a=np.clip(np.minimum(dist+1,T-dist),0,1)[...,None]*ring[...,None]
out=out*(1-a)+colr*a
sh=np.clip(1-(-dist)/6,0,1)*(dist<0)*(dist>-6); out=out*(1-0.22*sh[...,None])
res=np.clip(out,0,255).astype(np.uint8); res=cv2.addWeighted(res,1.12,cv2.GaussianBlur(res,(0,0),2),-0.12,0)
cv2.imwrite('plate.png',res); print('ok x0',x0)
