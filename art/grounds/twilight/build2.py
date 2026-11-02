# 2.b Twilight v2 plate (Figma 365:191, gpt-image sunburst — painted a tall oval): one even scale + repeated equator rows,
# scale/rows/offset picked by fitsearch.py to keep the painted edge within ~12 px of the coded oval, then close_gap.py.
import numpy as np, cv2
W,H=1170,2532; cx,cy=.5*W,.6*H
s,mid,L,oy=1.5,890,180,-10
img=cv2.imread('plate_raw.png').astype(np.float32); ft,fb,fxc=434,1339,432
k=2; Lb=L//k; a0=mid-Lb//2; F=16; w=np.linspace(0,1,F)[:,None,None]
b=img[a0:a0+Lb].copy(); b[:F]=img[a0+Lb-F:a0+Lb]*(1-w)+b[:F]*w
rest=img[a0+Lb:].copy(); rest[:F]=b[-F:]*(1-w)+rest[:F]*w
src=np.concatenate([img[:a0+Lb]]+[b]*k+[rest],0)
up=cv2.resize(src,(round(src.shape[1]*s),round(src.shape[0]*s)),interpolation=cv2.INTER_CUBIC)
ox=int(round(fxc*s-cx)); oyy=int(round((ft+fb+L)/2*s-cy-oy)); print('ox',ox,'oy',oyy,up.shape)
if oyy<0: up=np.concatenate([np.repeat(up[:1],-oyy,0),up],0); oyy=0
c=np.clip(up[oyy:oyy+H,ox:ox+W],0,255).astype(np.uint8)
if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
o=cv2.addWeighted(c,1.25,cv2.GaussianBlur(c,(0,0),2),-0.25,0); cv2.imwrite('plate_fit.png',o)
