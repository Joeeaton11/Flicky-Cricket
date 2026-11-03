# desert close-camera redo: build_clean squash left 110 repeated rows at the top; replace them with a soft cartoon sky and fade into it.
import numpy as np, cv2, sys
p=cv2.imread('plate.png').astype(np.float32); H,W=p.shape[:2]; T=int(sys.argv[1]) if len(sys.argv)>1 else 226
y=np.linspace(0,1,T+60)[:,None,None]
top=np.array([255,175,80],np.float32); bot=np.array([255,230,185],np.float32)   # BGR: deep sky -> pale warm haze
sky=(top*(1-y)+bot*y)*np.ones((1,W,1),np.float32)
rng=np.random.default_rng(3)
for cx,cy,s in [(880,70,1.0),(1060,150,.7),(250,110,.9),(560,40,.6)]:
  for k in range(6):
    ox,oy,r=cx+rng.normal(0,60*s),cy+rng.normal(0,14*s),rng.uniform(34,56)*s
    m=np.zeros((T+60,W),np.float32); cv2.circle(m,(int(ox),int(oy)),int(r),1,-1); m=cv2.GaussianBlur(m,(0,0),6)[...,None]
    sky=sky*(1-m*.9)+np.array([255,252,250],np.float32)*m*.9
out=p.copy(); out[:T]=sky[:T]
a=np.linspace(1,0,60)[:,None,None]**1.5; out[T:T+60]=sky[T:T+60]*a+p[T:T+60]*(1-a)
cv2.imwrite('plate.png',out.clip(0,255).astype(np.uint8)); print('sky rows',T)
