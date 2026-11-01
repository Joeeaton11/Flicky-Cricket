import numpy as np, cv2, sys
from PIL import Image, ImageDraw
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('plate2_raw.png'); s=float(sys.argv[1]); pcx,pcy,pw,ph=385,785,350,700
# 1) erase the painted white line in the source (thin pale ring)
hs=cv2.cvtColor(img,cv2.COLOR_BGR2HSV).astype(int); v=hs[...,2].astype(np.uint8)
th=cv2.morphologyEx(v,cv2.MORPH_TOPHAT,np.ones((11,11),np.uint8))
ring=np.zeros(v.shape,np.uint8); cv2.ellipse(ring,((pcx,pcy),(pw,ph),0),1,26)
line=((th>10)&(hs[...,1]<70)&(ring>0)).astype(np.uint8); line=cv2.dilate(line,np.ones((5,5),np.uint8))
img=cv2.inpaint(img,line*255,6,cv2.INPAINT_TELEA)
# 2) one uniform scale, painted floor centred on our oval
up=cv2.resize(img,(round(768*s),round(1376*s)),interpolation=cv2.INTER_CUBIC)
ox=int(pcx*s-cx); oy=int(pcy*s-cy); out=up[oy:oy+H,ox:ox+W].copy(); print('src x',ox/s,(ox+W)/s,'y',oy/s,(oy+H)/s)
yy,xx=np.mgrid[0:H,0:W].astype(np.float32); rho=np.hypot((xx-cx)/rx,(yy-cy)/ry)
hsv=cv2.cvtColor(out,cv2.COLOR_BGR2HSV).astype(int); sa,va=hsv[...,1],hsv[...,2]
med=cv2.cvtColor(cv2.medianBlur(out,61),cv2.COLOR_BGR2HSV).astype(int)
conc=(np.abs(sa-med[...,1])<30)&(np.abs(va-med[...,2])<35)&(sa<95)
inside=rho<0.985
obj=((~conc)&inside).astype(np.uint8)
obj=cv2.morphologyEx(obj,cv2.MORPH_OPEN,np.ones((3,3),np.uint8)); obj=cv2.dilate(obj,np.ones((13,13),np.uint8))*(rho<1.0).astype(np.uint8)
n,lab,st,_=cv2.connectedComponentsWithStats(obj); print('objects inside',n-1)
cleanmask=(conc&(rho<0.8)).astype(np.uint8)
for i in range(1,n):
  x0,y0,w,hh,a=st[i]
  if a<40: continue
  mk=(lab[y0:y0+hh,x0:x0+w]==i).astype(np.uint8); best=None
  for dy in range(-900,901,30):
    for dx in range(-400,401,30):
      X,Y=x0+dx,y0+dy
      if X<0 or Y<0 or X+w>W or Y+hh>H: continue
      if cleanmask[Y:Y+hh,X:X+w][mk>0].mean()>0.99:
        d=abs(dy)+abs(dx)
        if best is None or d<best[0]: best=(d,X,Y)
  if best is None: print('no src',x0,y0,w,hh); continue
  _,X,Y=best; out=cv2.seamlessClone(out[Y:Y+hh,X:X+w].copy(),out,mk*255,(x0+w//2,y0+hh//2),cv2.NORMAL_CLONE)
out=cv2.addWeighted(out,1.4,cv2.GaussianBlur(out,(0,0),2),-0.4,0)
cv2.imwrite('plate.png',out)
im=Image.fromarray(cv2.cvtColor(out,cv2.COLOR_BGR2RGB)); d=ImageDraw.Draw(im); d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],outline=(255,0,0),width=5)
im.resize((390,844)).save('plate_check.png')
