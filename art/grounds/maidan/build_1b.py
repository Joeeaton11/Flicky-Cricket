import numpy as np, cv2
from PIL import Image, ImageDraw
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('p7_raw.png'); s=2.1
up=cv2.resize(img,(round(768*s),round(1376*s)),interpolation=cv2.INTER_CUBIC); ox=234
out=up[161:161+H, ox:ox+W].copy()
yy,xx=np.mgrid[0:H,0:W].astype(np.float32); rho=np.hypot((xx-cx)/rx,(yy-cy)/ry)
hsv=cv2.cvtColor(out,cv2.COLOR_BGR2HSV); hh,ss,vv=[hsv[...,i].astype(int) for i in range(3)]
ground=(hh>=12)&(hh<=50)&(ss>45)&(vv>80)
obj=((~ground)&(rho<1.02)).astype(np.uint8)
obj=cv2.morphologyEx(obj,cv2.MORPH_OPEN,np.ones((3,3),np.uint8)); obj=cv2.dilate(obj,np.ones((15,15),np.uint8))
n,lab,st,cen=cv2.connectedComponentsWithStats(obj)
erase=np.zeros((H,W),np.uint8)
for i in range(1,n):
  if st[i][4]<120: continue
  comp=lab==i
  py=cen[i][1]; px=cen[i][0]
  if np.hypot((px-cx)/rx,(py-cy)/ry)<0.9: erase|=comp.astype(np.uint8)
r=np.zeros_like(erase); cv2.rectangle(r,(425,660),(845,775),1,-1); erase|=r   # the three fielders standing on our top boundary
sh=np.zeros_like(erase); sh[8:,16:]=erase[:-8,:-16]; erase=cv2.dilate(erase|sh,np.ones((11,11),np.uint8))*(rho<1.0)
erase[660:775,425:845]|=1
hb=((hh>=95)&(hh<=135)&(ss>70)); hb[:630]=False; hb[672:]=False; hb[:,:425]=False; hb[:,845:]=False   # helmet tops poking above the patch
erase|=cv2.dilate(hb.astype(np.uint8),np.ones((9,9),np.uint8))
clean=(ground&(rho<0.9)&(erase==0)).astype(np.uint8)
n,lab,st,_=cv2.connectedComponentsWithStats(erase)
for i in range(1,n):
  x,y,w,h,_a=st[i]; mk=(lab[y:y+h,x:x+w]==i).astype(np.uint8)
  best=None
  for dy in range(-700,701,35):
    for dx in range(-500,501,35):
      X,Y=x+dx,y+dy
      if X<0 or Y<0 or X+w>W or Y+h>H: continue
      if clean[Y:Y+h,X:X+w][mk>0].mean()>0.995:
        d=abs(dy)+abs(dx)
        if best is None or d<best[0]: best=(d,X,Y)
  if best is None: print('no source for',x,y,w,h); continue
  _,X,Y=best; src=out[Y:Y+h,X:X+w].copy()
  out=cv2.seamlessClone(src,out,mk*255,(x+w//2,y+h//2),cv2.NORMAL_CLONE)
hs2=cv2.cvtColor(out,cv2.COLOR_BGR2HSV).astype(int)
bump=np.zeros((H,W),np.uint8); reg=hs2[625:680,425:845]
g2=(reg[...,0]>=20)&(reg[...,0]<=50)&(reg[...,1]>60)&(reg[...,2]>110)
fence=(reg[...,1]<70)&(reg[...,2]>150)
bump[625:680,425:845]=((~g2)&(~fence)).astype(np.uint8)
bump[:640]=0   # never touch the fence posts' bases above this
bump=cv2.dilate(bump,np.ones((7,7),np.uint8))*255
out=cv2.inpaint(out,bump,7,cv2.INPAINT_TELEA)
cv2.imwrite('maidan_v10.png',out)
im=Image.fromarray(cv2.cvtColor(out,cv2.COLOR_BGR2RGB)); d=ImageDraw.Draw(im); d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],outline=(255,0,0),width=6)
im.resize((390,844)).save('v10_check.png'); print('patched',n-1)
