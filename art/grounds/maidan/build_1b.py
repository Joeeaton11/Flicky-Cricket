import numpy as np, cv2
from PIL import Image, ImageDraw
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('p5_raw.png'); s=W/img.shape[1]
up=cv2.resize(img,(W,round(img.shape[0]*s)),interpolation=cv2.INTER_CUBIC); h=up.shape[0]; need=H-h
yy,xx=np.mgrid[0:H,0:W].astype(np.float32); rho=np.hypot((xx-cx)/rx,(yy-cy)/ry)
# bottom: continue the field with plain grass copied from the empty middle, blended over a soft seam
ext=np.zeros((H,W,3),np.uint8); ext[:h]=up
g=up[1450:1450+need+160,300:880]                      # plain grass from the empty middle (no props)
blk=np.concatenate([g,g[:,::-1],g],1)[:,:W]           # tile it across with mirrored joins
a=np.linspace(0,1,160)[:,None,None]
ext[h-160:h]=(up[h-160:h]*(1-a)+blk[:160]*a).astype(np.uint8); ext[h:]=blk[160:160+need]
hsv=cv2.cvtColor(ext,cv2.COLOR_BGR2HSV); hh,ss,vv=[hsv[...,i].astype(int) for i in range(3)]
ground=(hh>=12)&(hh<=50)&(ss>45)&(vv>70)
obj=((~ground)&(yy>560)).astype(np.uint8)
obj=cv2.morphologyEx(obj,cv2.MORPH_OPEN,np.ones((3,3),np.uint8)); obj=cv2.dilate(obj,np.ones((13,13),np.uint8))
n,lab,st,cen=cv2.connectedComponentsWithStats(obj)
erase=np.zeros((H,W),np.uint8)
for i in range(1,n):
  x,y,w,hh2,ar=st[i]
  if ar<150: continue
  px,py=cen[i]
  if np.hypot((px-cx)/rx,(py-cy)/ry)<0.95: erase|=(lab==i).astype(np.uint8)
# the middle game's pitch strip (its players are gone) and shadows (sun from the left -> shadows to the right)
mid=np.zeros_like(erase); cv2.rectangle(mid,(495,740),(680,905),1,-1); erase|=(mid&(rho<1.0).astype(np.uint8))
sh=np.zeros_like(erase); sh[6:,10:]=erase[:-6,:-10]; sh2=np.zeros_like(erase); sh2[10:,22:]=erase[:-10,:-22]; erase=erase|sh|sh2
dark=((vv<95)&(rho<0.95)&(yy>600)&(yy<1000)).astype(np.uint8)   # leftover cast shadows near the top of our field
erase|=cv2.dilate(dark,np.ones((7,7),np.uint8))
cv2.rectangle(erase,(250,1950),(360,2110),1,-1); cv2.rectangle(erase,(140,1925,),(235,2015),1,-1)   # half a kid cut by the old bottom edge
erase=cv2.dilate(erase,np.ones((9,9),np.uint8))
out=ext.copy()
n,lab,st,_=cv2.connectedComponentsWithStats(erase)
for i in range(1,n):
  x,y,w,hh2,_a=st[i]; dy=hh2+60 if y+2*hh2+60<H and y<1900 else -(hh2+60)
  srcp=out[y+dy:y+dy+hh2,x:x+w].copy(); mk=(lab[y:y+hh2,x:x+w]==i).astype(np.uint8)*255
  x0=max(1,x); 
  try: out=cv2.seamlessClone(srcp,out,mk,(x+w//2,y+hh2//2),cv2.NORMAL_CLONE)
  except Exception as e: print('skip',x,y,w,hh2,e)
cv2.imwrite('maidan_v6.png',out)
im=Image.fromarray(cv2.cvtColor(out,cv2.COLOR_BGR2RGB)); d=ImageDraw.Draw(im); d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],outline=(255,0,0),width=6)
im.resize((390,844)).save('v6_check.png'); print('erased',n-1,'areas')
