# Gully v9: even 'cover' scale for the scene; only the field + kerb are mapped onto the game's oval,
# with the painted kerb slimmed to ~12 css px; the street blends back to the plain even scale.
import cv2, numpy as np
from scipy.ndimage import median_filter
f=np.load('/tmp/claude-0/sp/g9field.npy'); sh,sw=f.shape
ys,xs=np.nonzero(f); cx0,cy0=(xs.min()+xs.max())/2,(ys.min()+ys.max())/2
N=720; th=np.linspace(0,2*np.pi,N,endpoint=False); g=np.zeros(N)
for i,t in enumerate(th):
    dx,dy=np.cos(t),np.sin(t); last=0
    for r in range(50,800):
        x,y=int(cx0+dx*r),int(cy0+dy*r)
        if not(0<=x<sw and 0<=y<sh): break
        if f[y,x]: last=r
        elif r-last>6: break
    g[i]=last
g=median_filter(g,size=25,mode='wrap'); g=np.convolve(np.r_[g[-6:],g,g[:6]],np.ones(7)/7,'same')[6:-6]
KS=40.0                                   # painted kerb thickness (source px)
big=cv2.imread('/tmp/claude-0/sp/g9_x4.png'); S4=big.shape[0]/sh
OW,OH=1170,2532; sc=max(OW/sw,OH/sh); ox=(sw*sc-OW)/2; oy=(sh*sc-OH)/2
cx,cy=OW/2,0.60*OH; RX,RY=0.46*OW,0.335*OH; K=36.0      # slim kerb on screen (out px = 12 css px)
yy,xx=np.mgrid[0:OH,0:OW].astype(np.float32)
px=(xx+ox)/sc; py=(yy+oy)/sc
dx,dy=xx-cx,yy-cy; ang=np.mod(np.arctan2(dy,dx),2*np.pi); rho=np.hypot(dx,dy)
e=1/np.sqrt((np.cos(ang)/RX)**2+(np.sin(ang)/RY)**2)
gs=g[(ang/(2*np.pi)*N).astype(int)%N]
band=0.30*e
r_src=np.where(rho<=e, rho/e*gs, np.where(rho<=e+K, gs+(rho-e)/K*KS, gs+KS+(rho-e-K)/sc))
qx=cx0+np.cos(ang)*r_src; qy=cy0+np.sin(ang)*r_src
w=np.clip((rho-e-K)/band,0,1); w=w*w*(3-2*w)
mx=(qx*(1-w)+px*w)*S4; my=(qy*(1-w)+py*w)*S4
out=cv2.remap(big,mx.astype(np.float32),my.astype(np.float32),cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
cv2.imwrite('plate_fit.png',out)
chk=cv2.resize(out,(390,844),interpolation=cv2.INTER_AREA); cv2.ellipse(chk,(195,int(0.6*844)),(int(0.46*390),int(0.335*844)),0,0,360,(255,0,255),1)
cv2.imwrite('/tmp/claude-0/sp/g9fit.jpg',chk); print('ok', cx0, cy0, g.min(), g.max())
