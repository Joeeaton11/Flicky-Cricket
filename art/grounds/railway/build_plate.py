import numpy as np, cv2, sys
from PIL import Image, ImageDraw
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('plate10_raw.png').astype(np.float32)
lab=cv2.cvtColor(img.astype(np.uint8),cv2.COLOR_BGR2LAB).astype(np.float32); ref=np.median(lab[750:900,300:470].reshape(-1,3),0)
e=(np.linalg.norm(lab-ref,axis=2)<24).astype(np.uint8); e=cv2.morphologyEx(e,cv2.MORPH_CLOSE,np.ones((7,7),np.uint8))
n,l,st,_=cv2.connectedComponentsWithStats(e); f=l==l[820,385]
fl,fr,ft,fb=58,712,480,1170; print('field',fl,fr,ft,fb)
s=2*rx/(fr-fl); L=int(round(2*ry/s-(fb-ft))); print('scale',round(s,3),'repeat rows',L)
k=4; Lb=int(round(L/k)); a0=825-Lb//2; F=20; w=np.linspace(0,1,F)[:,None,None]   # repeat a short band at the oval's equator (sides nearly vertical there) k times
band=img[a0:a0+Lb].copy(); b=band.copy(); b[:F]=img[a0+Lb-F:a0+Lb]*(1-w)+b[:F]*w
rest=img[a0+Lb:].copy(); rest[:F]=b[-F:]*(1-w)+rest[:F]*w
src=np.concatenate([img[:a0+Lb]]+[b]*k+[rest],0); fb2=fb+Lb*k
up=cv2.resize(src,(round(768*s),round(src.shape[0]*s)),interpolation=cv2.INTER_CUBIC)
ox=int((fl+fr)/2*s-cx); oy=int((ft+fb2)/2*s-cy); print('ox',ox,'oy',oy,up.shape)
if oy<0: up=np.concatenate([np.repeat(up[:1],-oy,0),up],0); oy=0
c=np.clip(up[oy:oy+H,max(0,ox):max(0,ox)+W],0,255).astype(np.uint8)
if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
o=cv2.addWeighted(c,1.3,cv2.GaussianBlur(c,(0,0),2),-0.3,0); cv2.imwrite('plate10.png',o)
im=Image.fromarray(cv2.cvtColor(o,cv2.COLOR_BGR2RGB)); d=ImageDraw.Draw(im); d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],outline=(255,0,0),width=4)
im.resize((390,844)).save('plate10_check.png')
