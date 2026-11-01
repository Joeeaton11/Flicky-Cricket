import numpy as np, cv2
from PIL import Image, ImageDraw
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('p4_raw.png'); s=H/img.shape[0]
up=cv2.resize(img,(round(img.shape[1]*s),H),interpolation=cv2.INTER_CUBIC).astype(np.float32)
ox=(up.shape[1]-W)//2; ext=up[:,ox:ox+W].copy()
o=lambda x,y:(int((x)*s-ox),int(y*s))
erase=np.zeros((H,W),np.uint8)
for (x0,y0,x1,y1) in [(342,355,395,470),(362,325,415,405),(220,1048,336,1200)]:   # umpire + fielder on our field's tip, a runner on our field
  cv2.rectangle(erase,o(x0,y0),o(x1,y1),1,-1)
for (a,b,c,d) in [(600,705,700,765),(600,825,700,890),(470,1940,560,2160)]: cv2.rectangle(erase,(a,b),(c,d),1,-1)   # their shadows (out px)
out=np.clip(ext,0,255).astype(np.uint8)
n,lab,st,_=cv2.connectedComponentsWithStats(cv2.dilate(erase,np.ones((15,15),np.uint8)))
for i in range(1,n):
  x,y,w,h,_a=st[i]; dy=h+40 if y+2*h+40<H else -(h+40)      # plain grass right below (or above) the patch
  srcp=out[y+dy:y+dy+h, x:x+w].copy(); mk=(lab[y:y+h,x:x+w]==i).astype(np.uint8)*255
  out=cv2.seamlessClone(srcp,out,mk,(x+w//2,y+h//2),cv2.NORMAL_CLONE)
cv2.imwrite('maidan_v5.png',out)
im=Image.fromarray(cv2.cvtColor(out,cv2.COLOR_BGR2RGB)); d=ImageDraw.Draw(im)
d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],outline=(255,0,0),width=6)
im.resize((390,844)).save('v5_check.png')
