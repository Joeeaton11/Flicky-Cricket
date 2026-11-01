import numpy as np, cv2
from PIL import Image, ImageDraw
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('plate_raw.png')
# 1) erase the painted track line (thin pale ring) in the source
lcx,lcy,lw,lh=390,835,640,820
hs=cv2.cvtColor(img,cv2.COLOR_BGR2HSV).astype(int); v=hs[...,2].astype(np.uint8)
th=cv2.morphologyEx(v,cv2.MORPH_TOPHAT,np.ones((11,11),np.uint8))
ring=np.zeros(v.shape,np.uint8); cv2.ellipse(ring,((lcx,lcy),(lw,lh),0),1,56)
line=((th>7)&(hs[...,1]<120)&(ring>0)).astype(np.uint8); line=cv2.dilate(line,np.ones((5,5),np.uint8))
img=cv2.inpaint(img,line*255,7,cv2.INPAINT_TELEA).astype(np.float32)
# 2) scale so the playground width = our oval width; repeat a band through the middle to make it as tall as our oval
s=rx/(lw/2); need=ry/s-lh/2; ins=int(round(need*2)); a0=lcy-ins//2+40; a1=a0+ins
F=24; w=np.linspace(0,1,F)[:,None,None]
band=img[a0:a1].copy(); band[:F]=img[a1-F:a1]*(1-w)+band[:F]*w
rest=img[a1:].copy(); rest[:F]=band[-F:]*(1-w)+rest[:F]*w
src=np.concatenate([img[:a1],band,rest],0); print('scale',round(s,3),'insert',ins)
up=cv2.resize(src,(round(src.shape[1]*s),round(src.shape[0]*s)),interpolation=cv2.INTER_CUBIC)
ncy=(lcy+ins/2)*s; ox=int(lcx*s-cx); oy=int(ncy-cy)
if oy<0: up=np.concatenate([np.repeat(up[:1],-oy,0),up],0); oy=0
c=up[oy:oy+H,ox:ox+W]
if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
out=np.clip(c,0,255).astype(np.uint8); out=cv2.addWeighted(out,1.35,cv2.GaussianBlur(out,(0,0),2),-0.35,0)
cv2.imwrite('plate.png',out)
im=Image.fromarray(cv2.cvtColor(out,cv2.COLOR_BGR2RGB)); d=ImageDraw.Draw(im); d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],outline=(255,0,0),width=5)
im.resize((390,844)).save('plate_check.png')
