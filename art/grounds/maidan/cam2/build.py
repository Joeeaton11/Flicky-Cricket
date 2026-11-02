# 1.b Maidan Camera 2 (Figma 383:191, sunburst). Grass ellipse 667x1031 (ratio 1.545 vs 1.576): repeat 20 rows at the widest band
# (sides near-vertical there, crossfaded), then ONE even scale by width, centred. Top filled with a plain evening-sky gradient.
import numpy as np, cv2
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
ex,ey,ew,eh=np.load('ell.npy'); s=2*rx/ew; L=int(round(2*ry/s-eh)); print('scale',round(s,4),'rows',L)
img=cv2.imread('plate_raw.png').astype(np.float32); a0=int(ey)-L//2; F=50; w=np.linspace(0,1,F)[:,None,None]
band=img[a0:a0+L+F].copy(); top=img[:a0+L+F].copy(); rest=img[a0+L:].copy()
seam=top[-F:]*(1-w)+img[a0:a0+F]*w
src=np.concatenate([top[:-F],seam,img[a0+F:]],0)   # rows a0..a0+L appear twice
ey2=ey+L/2
up=cv2.resize(src,(round(src.shape[1]*s),round(src.shape[0]*s)),interpolation=cv2.INTER_CUBIC)
ox=int(round(ex*s-cx)); oy=int(round(ey2*s-cy)); print('ox',ox,'oy',oy,up.shape)
if oy<0:
  n=-oy; sky=up[:12].reshape(-1,3); sky=sky[sky[:,0]>sky[:,1]+30]; edge=np.repeat(np.median(sky,0)[None],up.shape[1],0)   # sky-blue only (palm leaves excluded)
  t=np.linspace(1,0,n)[:,None,None]; tp=edge[None]*(1-t*0.35)+np.array([225,150,70.])*(t*0.35)
  F2=50; w2=np.linspace(0,1,F2)[:,None,None]; up[:F2]=tp[-1:]*(1-w2)+up[:F2]*w2
  up=np.concatenate([tp,up],0); oy=0
c=np.clip(up[oy:oy+H,max(0,ox):max(0,ox)+W],0,255).astype(np.uint8)
if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
o=cv2.addWeighted(c,1.15,cv2.GaussianBlur(c,(0,0),2),-0.15,0); cv2.imwrite('plate.png',o)
v=o.copy(); cv2.ellipse(v,(int(cx),int(cy)),(int(rx),int(ry)),0,0,360,(255,0,255),2); cv2.imwrite('check.png',cv2.resize(v,(390,844)))
# measure
B,G,R=[o[...,i].astype(int) for i in range(3)]; g=((G>R+25)&(G>B+25)).astype(np.uint8)
n_,l_=cv2.connectedComponents(cv2.morphologyEx(g,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))); f=(l_==l_[int(cy),int(cx)]).astype(np.uint8)
cs,_=cv2.findContours(cv2.morphologyEx(f,cv2.MORPH_CLOSE,np.ones((15,15),np.uint8)),cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE); cc=max(cs,key=len)[:,0,:].astype(float)
X,Y=cc[:,0],cc[:,1]; th=np.arctan2((Y-cy)/ry,(X-cx)/rx); Rr=np.hypot(np.cos(th)*rx,np.sin(th)*ry); d=(np.sqrt(((X-cx)/rx)**2+((Y-cy)/ry)**2)-1)*Rr/3
deg=np.degrees(th)%360; print('phone px off per 30deg:',[(a,round(float(np.median(d[(deg>=a)&(deg<a+30)])),1)) for a in range(0,360,30)])
(qx,qy),(qw,qh),_=cv2.fitEllipse(cc.astype(np.float32)); print('grass: centre %.3f %.3f width %.3f height %.3f (game .5 .6 .92 .67)'%(qx/W,qy/H,qw/W,qh/H))
