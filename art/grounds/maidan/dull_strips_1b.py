import numpy as np, cv2
from PIL import Image
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('maidan_v12.png')
yy,xx=np.mgrid[0:H,0:W].astype(np.float32); rho=np.hypot((xx-cx)/rx,(yy-cy)/ry)
hsv=cv2.cvtColor(img,cv2.COLOR_BGR2HSV).astype(int); h,s,v=hsv[...,0],hsv[...,1],hsv[...,2]
lab=cv2.cvtColor(img,cv2.COLOR_BGR2LAB).astype(np.float32)
pale=(((h>=10)&(h<=36)&(s>=18)&(s<115)&(v>160))|((s<45)&(v>205)))&(rho>0.98)&(yy>560)
pale=cv2.morphologyEx(pale.astype(np.uint8),cv2.MORPH_CLOSE,np.ones((7,7),np.uint8))
wb=((s<30)&(v>225)).astype(np.uint8); wb=cv2.morphologyEx(wb,cv2.MORPH_OPEN,np.ones((9,9),np.uint8))   # solid white = tents, umbrellas, players
pale=pale&(1-cv2.dilate(wb,np.ones((13,13),np.uint8)))
n,lb,st,_=cv2.connectedComponentsWithStats(pale)
out=lab.copy(); rng=np.random.default_rng(5)
nz=cv2.resize(cv2.GaussianBlur(rng.standard_normal((H//5,W//5)).astype(np.float32),(0,0),1.2),(W,H))
mask_all=np.zeros((H,W),np.float32)
for i in range(1,n):
  x,y,w,hh,a=st[i]
  if a<500: continue
  comp=(lb==i).astype(np.uint8)
  cnts,_=cv2.findContours(comp,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE); (rcx,rcy),(rw,rh),ang=cv2.minAreaRect(max(cnts,key=cv2.contourArea))
  edge=y+hh>=H-2 or x<=1 or x+w>=W-1
  if (max(rw,rh)<1.8*max(1,min(rw,rh)) and not edge) or max(rw,rh)<60: continue    # strips are long; tents/umbrellas aren't
  ring=cv2.dilate(comp,np.ones((35,35),np.uint8))-cv2.dilate(comp,np.ones((15,15),np.uint8))
  er=(ring>0)&(hsv[...,1]>80)&(hsv[...,2]>80)          # dusty earth/grass only, no players
  if er.sum()<50: continue
  tgt=np.median(lab[er],0)
  m=cv2.GaussianBlur(cv2.dilate(comp,np.ones((5,5),np.uint8)).astype(np.float32),(0,0),4)
  m=np.clip(m*1.2+nz*0.3*(m>0.05),0,1)
  mask_all=np.maximum(mask_all,m)
  # dull: keep a little of the strip's lightness, take the earth's colour, add dusty mottling
  Lmix=lab[...,0]*0.45+tgt[0]*0.55+nz*6+4
  for c,val in ((0,Lmix),(1,lab[...,1]*0.3+tgt[1]*0.7),(2,lab[...,2]*0.3+tgt[2]*0.7)):
    out[...,c]=out[...,c]*(1-m*0.8)+val*(m*0.8)
res=cv2.cvtColor(np.clip(out,0,255).astype(np.uint8),cv2.COLOR_LAB2BGR)
cv2.imwrite('maidan_v13.png',res)
Image.fromarray(cv2.cvtColor(res,cv2.COLOR_BGR2RGB)).resize((390,844)).save('v13_check.png')
Image.fromarray((mask_all*255).astype(np.uint8)).resize((390,844)).save('strips_mask.png')
