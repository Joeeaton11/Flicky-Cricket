import numpy as np, cv2
from PIL import Image, ImageDraw
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('plate_raw.png').astype(np.float32)
fcx,fcy,fhw,fhh=385,735,247,340
s=rx/fhw; need=ry/s-fhh; ins=int(round(need*2)); print('scale',round(s,3),'insert rows',ins)
a0=fcy-ins//2; a1=a0+ins; F=20; w=np.linspace(0,1,F)[:,None,None]
band=img[a0:a1].copy(); band[:F]=img[a1-F:a1]*(1-w)+band[:F]*w
rest=img[a1:].copy(); rest[:F]=band[-F:]*(1-w)+rest[:F]*w
src=np.concatenate([img[:a1],band,rest],0)
up=cv2.resize(src,(round(src.shape[1]*s),round(src.shape[0]*s)),interpolation=cv2.INTER_CUBIC)
ncy=(fcy+ins/2)*s; ox=int(fcx*s-cx); oy=int(ncy-cy); print('oy',oy,'up h',up.shape[0])
if oy<0: up=np.concatenate([np.repeat(up[:1],-oy,0),up],0); oy=0
c=up[oy:oy+H,ox:ox+W]
if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
out=np.clip(c,0,255).astype(np.uint8); out=cv2.addWeighted(out,1.35,cv2.GaussianBlur(out,(0,0),2),-0.35,0)
cv2.imwrite('plate.png',out)
im=Image.fromarray(cv2.cvtColor(out,cv2.COLOR_BGR2RGB)); d=ImageDraw.Draw(im); d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],outline=(255,0,0),width=5)
im.resize((390,844)).save('plate_check.png')
