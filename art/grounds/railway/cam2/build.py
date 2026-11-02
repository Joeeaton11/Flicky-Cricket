# 1.f Railway Camera 2 (Figma 378:191): wall ellipse 631x1168 (ratio 1.85, too tall) -> cut 210 rows at the widest band (y 760-970,
# crossfaded), ONE even scale 1.785, centred. Search in-line above (max 30 px off the game oval, mean ~12).
import numpy as np, cv2
W,H=1170,2532; cx,cy=.5*W,.6*H
s,mid,L,oy,fy,fx=1.785,760,210,0,735.5,432
img=cv2.imread('plate_raw.png').astype(np.float32); F=24; w=np.linspace(0,1,F)[:,None,None]
top=img[:mid+F//2].copy(); bot=img[mid+L-F//2:].copy()
seam=top[-F:]*(1-w)+bot[:F]*w
src=np.concatenate([top[:-F],seam,bot[F:]],0)
up=cv2.resize(src,(round(src.shape[1]*s),round(src.shape[0]*s)),interpolation=cv2.INTER_CUBIC)
ox=int(round(fx*s-cx)); oyy=int(round(fy*s-cy-oy)); print('ox',ox,'oy',oyy,up.shape)
if oyy<0:
  # sky above the painted sky: a plain sunset gradient from the painted top-edge colours, deepening to violet upward, a few stars
  n=-oyy; edge=cv2.GaussianBlur(up[:12].mean(0,keepdims=True),(0,0),40)[0]
  t=np.linspace(1,0,n)[:,None,None]; top=edge[None]*(1-t*0.7)+np.array([90,40,60.])*(t*0.7)
  rng=np.random.default_rng(7)
  for _ in range(18): cv2.circle(top,(int(rng.integers(0,top.shape[1])),int(rng.integers(0,int(n*0.6)))),int(rng.integers(1,3)),(235,235,255),-1)
  top=cv2.GaussianBlur(top,(0,0),0.8); F2=60; w2=np.linspace(0,1,F2)[:,None,None]; up[:F2]=top[-1:]*(1-w2)+up[:F2]*w2
  up=np.concatenate([top,up],0); oyy=0
c=np.clip(up[oyy:oyy+H,ox:ox+W],0,255).astype(np.uint8)
if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
o=cv2.addWeighted(c,1.15,cv2.GaussianBlur(c,(0,0),2),-0.15,0); cv2.imwrite('plate.png',o)
v=o.copy(); cv2.ellipse(v,(int(cx),int(cy)),(int(.46*W),int(.335*H)),0,0,360,(255,0,255),2); cv2.imwrite('check.png',cv2.resize(v,(390,844)))
