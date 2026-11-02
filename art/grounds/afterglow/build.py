import numpy as np, cv2, sys
from PIL import Image, ImageDraw
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('plate_raw.png')
hs=cv2.cvtColor(img,cv2.COLOR_BGR2HSV).astype(int)
green=((hs[...,0]>=28)&(hs[...,0]<=60)&(hs[...,1]>90)).astype(np.uint8)
n,l,st,_=cv2.connectedComponentsWithStats(cv2.morphologyEx(green,cv2.MORPH_CLOSE,np.ones((11,11),np.uint8))); f=(l==l[850,432]).astype(np.uint8)
ys=np.where(f[:,432])[0]; xs=np.where(f[850])[0]; fl,fr,ft,fb=xs.min(),xs.max(),ys.min(),ys.max(); print('field',fl,fr,ft,fb)
# remove the painted white boundary line: pale low-saturation pixels in a ring just inside/at the field edge
gd=cv2.blur(green.astype(np.float32),(15,15))
v=hs[...,2].astype(np.uint8); th=cv2.morphologyEx(v,cv2.MORPH_TOPHAT,np.ones((9,9),np.uint8)).astype(int)
pale=((th>18)&(hs[...,1]<120)&(gd>0.45)).astype(np.uint8)
n2,l2,s2,_=cv2.connectedComponentsWithStats(cv2.dilate(pale,np.ones((3,3),np.uint8))); keep=np.zeros_like(pale)
for i in range(1,n2):
  x,y,w_,h_,a=s2[i]
  if max(w_,h_)>60 and a<0.3*w_*h_: keep|=(l2==i).astype(np.uint8)
pale=keep
img=cv2.inpaint(img,cv2.dilate(pale,np.ones((5,5),np.uint8))*255,7,cv2.INPAINT_TELEA).astype(np.float32)
s=2*rx/(fr-fl); L=int(round(2*ry/s-(fb-ft))); print('scale',round(s,3),'repeat',L)
L=0 if L<40 else L   # tall-oval plate: no rows needed
mid=(ft+fb)//2; k=max(1,int(np.ceil(L/90))); Lb=int(round(L/k)); a0=mid-Lb//2; F=16; w=np.linspace(0,1,F)[:,None,None]
if L==0: src=img; fb2=fb
else:
  b=img[a0:a0+Lb].copy(); b[:F]=img[a0+Lb-F:a0+Lb]*(1-w)+b[:F]*w
  rest=img[a0+Lb:].copy(); rest[:F]=b[-F:]*(1-w)+rest[:F]*w
  src=np.concatenate([img[:a0+Lb]]+[b]*k+[rest],0); fb2=fb+Lb*k
up=cv2.resize(src,(round(img.shape[1]*s),round(src.shape[0]*s)),interpolation=cv2.INTER_CUBIC)
ox=int((fl+fr)/2*s-cx); oy=int((ft+fb2)/2*s-cy); print('ox',ox,'oy',oy,up.shape)
if oy<0: up=np.concatenate([np.repeat(up[:1],-oy,0),up],0); oy=0
c=np.clip(up[oy:oy+H,max(0,ox):max(0,ox)+W],0,255).astype(np.uint8)
if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
o=cv2.addWeighted(c,1.3,cv2.GaussianBlur(c,(0,0),2),-0.3,0); cv2.imwrite('plate.png',o)
im=Image.fromarray(cv2.cvtColor(o,cv2.COLOR_BGR2RGB)); d=ImageDraw.Draw(im); d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],outline=(255,0,0),width=4)
im.resize((390,844)).save('check.png')
