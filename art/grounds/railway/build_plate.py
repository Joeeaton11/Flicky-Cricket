import numpy as np, cv2, sys
from PIL import Image, ImageDraw
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('plate7_raw.png').astype(np.float32)
fcx,fhw,ftop,fbot=388,235,400,1238
s=2*ry/(fbot-ftop)                      # height decides the scale
insc=int(round(rx/s-fhw))*2+int(sys.argv[1])   # widen the plot by repeating a strip of straight tracks/earth/road
x0=int(sys.argv[2]); F=16; w=np.linspace(0,1,F)[None,:,None]
strip=img[:,x0:x0+insc].copy(); strip[:,:F]=img[:,x0+insc-F:x0+insc]*(1-w)+strip[:,:F]*w
right=img[:,x0+insc:].copy(); right[:,:F]=strip[:,-F:]*(1-w)+right[:,:F]*w
img=np.concatenate([img[:,:x0+insc],strip,right],1); fcx+=insc/2; cut=0
print('scale',round(s,3),'insert cols',insc)
if cut>0:   # drop plain rows from the middle of the plot (straight sidings either side), crossfaded
  a0=820-cut//2; a1=a0+cut; F=24; w=np.linspace(0,1,F)[:,None,None]
  top=img[:a0].copy(); rest=img[a1:].copy(); rest[:F]=img[a0-F:a0]*(1-w)+rest[:F]*w
  img=np.concatenate([top[:-F],rest],0); fbot-=cut
up=cv2.resize(img,(round(img.shape[1]*s),round(img.shape[0]*s)),interpolation=cv2.INTER_CUBIC)
fcy=(ftop+fbot)/2; ox=int(fcx*s-cx); oy=int(fcy*s-cy); print('src top row',round(oy/s),'src x',round(ox/s),round((ox+W)/s))
if oy<0: up=np.concatenate([np.repeat(up[:1],-oy,0),up],0); oy=0
c=np.clip(up[oy:oy+H,ox:ox+W],0,255).astype(np.uint8)
if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
out=c.copy()
# clear anything inside our oval that isn't plot earth (barrier arm, kids, shadows' edges) by cloning clean earth
yy,xx=np.mgrid[0:H,0:W].astype(np.float32); rho=np.hypot((xx-cx)/rx,(yy-cy)/ry)
lab=cv2.cvtColor(out,cv2.COLOR_BGR2LAB).astype(np.float32); ref=np.median(lab[rho<0.5],0)
earth=np.linalg.norm(lab-ref,axis=2)<34
obj=((~earth)&(rho<0.97)).astype(np.uint8); obj=cv2.morphologyEx(obj,cv2.MORPH_OPEN,np.ones((3,3),np.uint8)); obj=cv2.dilate(obj,np.ones((13,13),np.uint8))*(rho<1.0).astype(np.uint8)
clean=(earth&(rho<0.8)).astype(np.uint8)
n,lb,st,_=cv2.connectedComponentsWithStats(obj); print('pieces',n-1)
for i in range(1,n):
  x0,y0,w_,h_,a=st[i]
  if a<40: continue
  mk=(lb[y0:y0+h_,x0:x0+w_]==i).astype(np.uint8); best=None
  for dy in range(-900,901,30):
    for dx in range(-400,401,30):
      X,Y=x0+dx,y0+dy
      if X<0 or Y<0 or X+w_>W or Y+h_>H: continue
      if clean[Y:Y+h_,X:X+w_][mk>0].mean()>0.99:
        d=abs(dx)+abs(dy)
        if best is None or d<best[0]: best=(d,X,Y)
  if best is None: print('no src',x0,y0,w_,h_); continue
  _,X,Y=best; out=cv2.seamlessClone(out[Y:Y+h_,X:X+w_].copy(),out,mk*255,(x0+w_//2,y0+h_//2),cv2.NORMAL_CLONE)
out=cv2.addWeighted(out,1.3,cv2.GaussianBlur(out,(0,0),2),-0.3,0)
cv2.imwrite('plate7.png',out)
im=Image.fromarray(cv2.cvtColor(out,cv2.COLOR_BGR2RGB)); d=ImageDraw.Draw(im); d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],outline=(255,0,0),width=4)
im.resize((390,844)).save('plate7_check.png')
