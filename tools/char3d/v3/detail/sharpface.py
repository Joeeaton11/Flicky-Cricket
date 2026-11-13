import cv2, numpy as np
s=np.load('samples.npz'); tx,ty,P,N=s['tx'],s['ty'],s['P'],s['N']
tex=np.load('tex_pol.npy'); W,H=1300,1800; px=2.05/1800
X=W/2+P[:,0]/px; Y=H/2-(P[:,2]-0.05)/px; D=P[:,1]
xi=np.round(X).astype(int); yi=np.round(Y).astype(int); ok=(xi>=0)&(xi<W)&(yi>=0)&(yi<H)
zb=np.full(W*H,np.inf,np.float32); fi=yi.clip(0,H-1)*W+xi.clip(0,W-1)
for dx in (-1,0,1):
    for dy in (-1,0,1):
        f2=(yi+dy).clip(0,H-1)*W+(xi+dx).clip(0,W-1); np.minimum.at(zb,f2[ok],D[ok])
vis=ok&(D<=zb[fi]+0.01)&(-N[:,1]>0.2)
alb=cv2.imread('alg_front.png').astype(np.float32)/255
# two-scale unsharp: crisp lines + a little local contrast
b1=cv2.GaussianBlur(alb,(0,0),1.4); b2=cv2.GaussianBlur(alb,(0,0),5)
sh=np.clip(alb+(alb-b1)*1.1+(alb-b2)*0.35,0,1)
R=(np.maximum(sh,1e-3)**2.2)/(np.maximum(alb,1e-3)**2.2); R=np.clip(R,0.4,1.18)
fm=np.zeros((H,W),np.float32); cv2.ellipse(fm,(650,375),(150,135),0,0,360,1,-1); fm=cv2.GaussianBlur(fm,(0,0),12)
yc,xc=yi.clip(0,H-1),xi.clip(0,W-1); w=fm[yc,xc]*vis; sel=w>0.01
t2=tex.copy(); c=tex[ty[sel],tx[sel],:3]**2.2
Rs=R[yc[sel],xc[sel]][...,::-1]
c2=c*(1-w[sel,None])+c*Rs*w[sel,None]
t2[ty[sel],tx[sel],:3]=np.clip(c2,0,1)**(1/2.2)
np.save('tex_sharp.npy',t2); print('texels',sel.sum())
