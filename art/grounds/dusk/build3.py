# 2.e Dusk Stadium plate (Figma 375:192): one even scale by field width + equator rows, picked by search; then close_gap pull.
import numpy as np, cv2
W,H=1170,2532; cx,cy=.5*W,.6*H
s,mid,L,oy=1.44,870,60,0
img=cv2.imread('plate_raw.png').astype(np.float32); ft,fb,fxc=353,1407,426
k=2; Lb=L//k; a0=mid-Lb//2; F=16; w=np.linspace(0,1,F)[:,None,None]
b=img[a0:a0+Lb].copy(); b[:F]=img[a0+Lb-F:a0+Lb]*(1-w)+b[:F]*w
rest=img[a0+Lb:].copy(); rest[:F]=b[-F:]*(1-w)+rest[:F]*w
src=np.concatenate([img[:a0+Lb]]+[b]*k+[rest],0)
up=cv2.resize(src,(round(src.shape[1]*s),round(src.shape[0]*s)),interpolation=cv2.INTER_CUBIC)
ox=int(round(fxc*s-cx)); oyy=int(round((ft+fb+L)/2*s-cy-oy)); print('ox',ox,'oy',oyy,up.shape)
c=np.clip(up[max(0,oyy):max(0,oyy)+H,ox:ox+W],0,255).astype(np.uint8)
if oyy<0:   # plain night sky above the painted sky (colour taken from the painted top edge, darkening upward, a few stars)
  n=-oyy; edge=cv2.GaussianBlur(c[:20].astype(np.float32).mean(0,keepdims=True),(0,0),30)[0]
  t=np.linspace(1,0,n)[:,None,None]; top=edge[None]*(1-t*0.45)+np.array([38,20,14.])*(t*0.45)
  rng=np.random.default_rng(5)
  for _ in range(25): cv2.circle(top,(int(rng.integers(0,W)),int(rng.integers(0,n-40))),int(rng.integers(1,3)),(230,230,250),-1)
  top=cv2.GaussianBlur(top,(0,0),0.8); F=50; w2=np.linspace(0,1,F)[:,None,None]
  cf=c.astype(np.float32); cf[:F]=top[-1:]*(1-w2)+cf[:F]*w2
  c=np.clip(np.concatenate([top,cf],0),0,255).astype(np.uint8)[:H]
if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
o=cv2.addWeighted(c,1.2,cv2.GaussianBlur(c,(0,0),2),-0.2,0); cv2.imwrite('plate_fit.png',o)
