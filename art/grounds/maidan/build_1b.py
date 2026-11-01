import numpy as np, cv2, sys
from PIL import Image, ImageDraw
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
r0=int(sys.argv[1]) if len(sys.argv)>1 else 40
img=cv2.imread('p3_raw.png')[r0:]; s=W/img.shape[1]
up=cv2.resize(img,(W,round(img.shape[0]*s)),interpolation=cv2.INTER_CUBIC).astype(np.float32); h=up.shape[0]; need=H-h
ext=np.zeros((H,W,3),np.float32); ext[:h]=up
band=up[h-need-140:h][::-1]; a=np.linspace(0,1,140)[:,None,None]
ext[h-140:h]=up[h-140:h]*(1-a)+band[:140]*a; ext[h:]=band[140:140+need]
yy,xx=np.mgrid[0:H,0:W].astype(np.float32); rho=np.hypot((xx-cx)/rx,(yy-cy)/ry)
erase=np.zeros((H,W),np.uint8)
for (x0,y0,x1,y1) in [(525,612,628,740),(668,632,728,735),(385,655,492,742),(626,672,672,740)]:   # scorer's table, water cooler, red bike: they sat on our field
  cv2.rectangle(erase,(x0,y0),(x1,y1),1,-1)
# also their shadows: dilate downward-right a bit (sun from the left)
sh=np.zeros_like(erase); sh[12:,8:]=erase[:-12,:-8]; erase=np.maximum(erase,sh)
m=cv2.GaussianBlur(erase.astype(np.float32),(0,0),6); m=np.clip(m*1.4,0,1)[...,None]
srcg=np.roll(ext,320,axis=0)   # clean grass from further down... (rolled up: take rows below)
srcg=np.concatenate([ext[320:],ext[-320:]],0)
out=ext*(1-m)+srcg*m
out[612:662,548:624]=ext[562:612,548:624]   # rebuild the end of the middle match's pitch that was under the umbrella
cv2.imwrite('maidan_fit.png',np.clip(out,0,255).astype(np.uint8))
im=Image.fromarray(cv2.cvtColor(np.clip(out,0,255).astype(np.uint8),cv2.COLOR_BGR2RGB)); d=ImageDraw.Draw(im)
d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],outline=(255,0,0),width=4)
im.crop((0,400,1170,1100)).resize((585,350)).save('top_check2.png')
print('erased px',int(erase.sum()))
