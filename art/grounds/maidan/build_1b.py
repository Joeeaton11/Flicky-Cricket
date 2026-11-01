import numpy as np, cv2
from PIL import Image, ImageDraw
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('p10_raw.png')
# 1) remove the faint painted line round the empty area (pale thin ring) in the source
pcx,pcy,prx,pry=388,760,272,330
y,x=np.mgrid[0:img.shape[0],0:img.shape[1]].astype(np.float32); pr=np.hypot((x-pcx)/prx,(y-pcy)/pry)
hs=cv2.cvtColor(img,cv2.COLOR_BGR2HSV).astype(int)
v=hs[...,2].astype(np.uint8); tophat=cv2.morphologyEx(v,cv2.MORPH_TOPHAT,np.ones((9,9),np.uint8))
line=((tophat>14)&(hs[...,1]<150)&(pr>0.9)&(pr<1.1)).astype(np.uint8)
line=cv2.dilate(line,np.ones((5,5),np.uint8))
img=cv2.inpaint(img,line*255,7,cv2.INPAINT_TELEA)
# 2) one uniform scale, no stretching
s=2.2; up=cv2.resize(img,(round(768*s),round(1376*s)),interpolation=cv2.INTER_CUBIC)
oy=int(pcy*s-cy); ox=int(pcx*s-cx)+55
out=up[oy:oy+H,ox:ox+W].copy()
yy,xx=np.mgrid[0:H,0:W].astype(np.float32); rho=np.hypot((xx-cx)/rx,(yy-cy)/ry)
# 3) clear anything standing inside our boundary (other matches poking in at the top and bottom tips)
hsv=cv2.cvtColor(out,cv2.COLOR_BGR2HSV); hh,ss,vv=[hsv[...,i].astype(int) for i in range(3)]
earth=(hh<=50)&(ss>45)&(vv>70)&(vv<245)
obj=((~earth)&(rho<1.0)).astype(np.uint8)
obj=cv2.morphologyEx(obj,cv2.MORPH_OPEN,np.ones((3,3),np.uint8)); obj=cv2.dilate(obj,np.ones((17,17),np.uint8))
n,lab,st,cen=cv2.connectedComponentsWithStats(obj); erase=np.zeros((H,W),np.uint8)
for i in range(1,n):
  if st[i][4]<100: continue
  comp=lab==i
  if (rho[comp]<1.0).mean()>0.4 and st[i][4]<60000: erase|=comp.astype(np.uint8)
  elif (rho[comp]<1.0).mean()>0.05 and st[i][1]<900: erase|=(comp&(rho<1.04)).astype(np.uint8)   # top matches poking over our boundary: clear the part inside
sh=np.zeros_like(erase); sh[8:,16:]=erase[:-8,:-16]; erase=cv2.dilate(erase|sh,np.ones((9,9),np.uint8))
clean=(earth&(rho<0.85)&(erase==0)).astype(np.uint8)
n,lab,st,_=cv2.connectedComponentsWithStats(erase)
for i in range(1,n):
  x0,y0,w,h,_a=st[i]; mk=(lab[y0:y0+h,x0:x0+w]==i).astype(np.uint8)
  best=None
  for dy in range(-900,901,30):
    for dx in range(-500,501,30):
      X,Y=x0+dx,y0+dy
      if X<0 or Y<0 or X+w>W or Y+h>H: continue
      if clean[Y:Y+h,X:X+w][mk>0].mean()>0.995:
        d=abs(dy)+abs(dx)
        if best is None or d<best[0]: best=(d,X,Y)
  if best is None: best=(0,x0,min(H-h,y0+h+60)); print('fallback below',x0,y0,w,h)
  _,X,Y=best; out=cv2.seamlessClone(out[Y:Y+h,X:X+w].copy(),out,mk*255,(x0+w//2,y0+h//2),cv2.NORMAL_CLONE)
# erase the old painted line (traced by eye on the fitted plate: it shows as an arc below our boundary)
pts=np.array([[15,1965],[180,2130],[570,2250],[900,2160],[1050,2010],[1150,1830],[0,1800]],np.float32)
pts=np.array([[15,1890],[180,2070],[390,2190],[600,2235],[840,2205],[1020,2100],[1155,1950]],np.float32); el=cv2.fitEllipse(pts)   # traced on the fitted plate
band=np.zeros((H,W),np.uint8); cv2.ellipse(band,el,1,34)
hs3=cv2.cvtColor(out,cv2.COLOR_BGR2HSV).astype(int)
dirt=(hs3[...,0]<=50)&(hs3[...,1]>60)&(hs3[...,2]>80)&(hs3[...,2]<240)
wide=np.zeros((H,W),np.uint8); cv2.ellipse(wide,el,1,150)
hs3=cv2.cvtColor(out,cv2.COLOR_BGR2HSV).astype(np.float32); med=cv2.medianBlur(out,41); hm=cv2.cvtColor(med,cv2.COLOR_BGR2HSV).astype(np.float32)
pale=((hm[...,1]-hs3[...,1]>14)|(hs3[...,2]-hm[...,2]>10))&(wide>0)&(hs3[...,1]>25)
pale=cv2.morphologyEx(pale.astype(np.uint8),cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
n3,l3,s3,_=cv2.connectedComponentsWithStats(cv2.dilate(pale,np.ones((5,5),np.uint8)))
keep=np.zeros((H,W),np.uint8)
for i in range(1,n3):
  x0,y0,w,h,a=s3[i]
  if max(w,h)>60 and a<0.35*w*h: keep|=(l3==i).astype(np.uint8)   # long thin curve pieces only
keep=cv2.dilate(keep,np.ones((9,9),np.uint8))
out=cv2.inpaint(out,keep*255,11,cv2.INPAINT_TELEA)
(ecx,ecy),(ew,eh),ea=el; b2=np.zeros((H,W),np.uint8); cv2.ellipse(b2,((ecx,ecy+12),(ew+10,eh+10),ea),1,30); b2&=(rho>1.02).astype(np.uint8)
out=cv2.inpaint(out,b2*255,13,cv2.INPAINT_TELEA)
out=cv2.addWeighted(out,1.5,cv2.GaussianBlur(out,(0,0),2),-0.5,0)
cv2.imwrite('maidan_v12.png',out)
im=Image.fromarray(cv2.cvtColor(out,cv2.COLOR_BGR2RGB)); d=ImageDraw.Draw(im); d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],outline=(255,0,0),width=5)
im.resize((390,844)).save('v12_check.png'); print('scale',s,'patched',n-1)
