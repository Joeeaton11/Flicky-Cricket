# Fill the uncovered top rows with a soft sky gradient (sampled from the painted sky), and fade the painted top into it.
# Replaces the mirror fill, which flipped tall landmarks upside down (Joe, Nov 5 ECL v2). usage: sky_fade.py <plate.png> <T>
import numpy as np, cv2, sys
p=cv2.imread(sys.argv[1]).astype(np.float32); T=int(sys.argv[2]); H,W=p.shape[:2]
band=p[T:T+60].reshape(-1,3); b,g,r=band[:,0],band[:,1],band[:,2]
sky=band[(b>r+10)&(band.sum(1)>330)]
if len(sky)<200: sky=band[band.sum(1)>np.percentile(band.sum(1),70)]
c=np.median(sky,0); deep=c*np.array([1.0,.88,.78])   # deeper blue upward
F=int(T*0.8)+20
y=np.linspace(0,1,T+F)[:,None,None]
grad=(deep*(1-y)+c*y)*np.ones((1,W,1),np.float32)
out=p.copy(); out[:T]=grad[:T]
a=np.linspace(1,0,F)[:,None,None]**1.4
out[T:T+F]=grad[T:]*a+p[T:T+F]*(1-a)
cv2.imwrite(sys.argv[1],out.clip(0,255).astype(np.uint8))
