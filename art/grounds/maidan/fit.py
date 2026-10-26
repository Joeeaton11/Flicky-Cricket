# Maidan: the painted ring of boundary stones is already close to the game's oval, so we scale evenly to cover
# the screen and nudge only the field area (a few px) so the stone ring sits exactly on the coded boundary.
import cv2, numpy as np
from scipy.ndimage import median_filter
src=cv2.imread('plate.png'); sh,sw=src.shape[:2]
hsv=cv2.cvtColor(src,cv2.COLOR_BGR2HSV)
white=((hsv[...,1]<50)&(hsv[...,2]>200)).astype(np.uint8)
cx0,cy0=384,806
N=720; th=np.linspace(0,2*np.pi,N,endpoint=False); g=np.zeros(N)
for i,t in enumerate(th):
    dx,dy=np.cos(t),np.sin(t); found=0
    for r in range(150,700):
        x,y=int(cx0+dx*r),int(cy0+dy*r)
        if not(0<=x<sw and 0<=y<sh): break
        if white[y,x]: found=r; break
    g[i]=found
g=median_filter(g,size=31,mode='wrap'); g=np.convolve(np.r_[g[-6:],g,g[:6]],np.ones(7)/7,'same')[6:-6]
g=g+5                                   # centre of the stone ring (stones ~10px wide)
print('ring radius range',g.min(),g.max())
big=cv2.imread('/tmp/claude-0/sp/maidan_x4.png'); S4=big.shape[0]/sh
OW,OH=1170,2532; sc=max(OW/sw,OH/sh); ox=(sw*sc-OW)/2; oy=(sh*sc-OH)/2
cx,cy=OW/2,0.60*OH; RX,RY=0.46*OW,0.335*OH
yy,xx=np.mgrid[0:OH,0:OW].astype(np.float32)
# plain even scale (source coords)
px=(xx+ox)/sc; py=(yy+oy)/sc
# where the painted ring centre lands on screen, per angle (around the painted centre mapped to screen)
pcx,pcy=cx0*sc-ox, cy0*sc-oy
dx,dy=xx-cx,yy-cy; ang=np.mod(np.arctan2(dy,dx),2*np.pi); rho=np.hypot(dx,dy)
e=1/np.sqrt((np.cos(ang)/RX)**2+(np.sin(ang)/RY)**2)
idx=(ang/(2*np.pi)*N).astype(int)%N; gs=g[idx]*sc     # painted ring radius in screen px (approx, around shifted centre)
u=rho/e; band=0.25
w=np.clip((u-1)/band,0,1); w=w*w*(3-2*w)
srad=np.where(u<=1,u*gs,gs+(rho-e)*((e*(1+band)-gs)/(e*band)))
qx=(pcx+np.cos(ang)*srad+ox)/sc; qy=(pcy+np.sin(ang)*srad+oy)/sc
mx=(qx*(1-w)+px*w)*S4; my=(qy*(1-w)+py*w)*S4
out=cv2.remap(big,mx.astype(np.float32),my.astype(np.float32),cv2.INTER_AREA if False else cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
cv2.imwrite('plate_fit.png',out)
chk=cv2.resize(out,(390,844),interpolation=cv2.INTER_AREA); cv2.ellipse(chk,(195,int(0.6*844)),(int(0.46*390),int(0.335*844)),0,0,360,(255,0,255),1)
cv2.imwrite('/tmp/claude-0/sp/mfit.jpg',chk); print('scale',sc,'max nudge %', float(np.abs(gs/e-1).max()*100))
