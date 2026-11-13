import numpy as np, math
s=np.load('samples.npz'); tx,ty,P,N=s['tx'],s['ty'],s['P'],s['N']
t=np.load('tex_det.npy'); W,H=1300,1800; px=2.05/1800
X=W/2+P[:,0]/px; Y=H/2-(P[:,2]-0.05)/px; D=P[:,1]
xi=np.round(X).astype(int); yi=np.round(Y).astype(int)
zb=np.full(W*H,np.inf); ok=(xi>=0)&(xi<W)&(yi>=0)&(yi<H); fi=yi.clip(0,H-1)*W+xi.clip(0,W-1)
for dx in (-1,0,1):
    for dy in (-1,0,1):
        f2=(yi+dy).clip(0,H-1)*W+(xi+dx).clip(0,W-1); np.minimum.at(zb,f2[ok],D[ok])
vis=ok&(D<=zb[fi]+0.01)&(-N[:,1]>0.3)
c=t[ty,tx,:3].copy()
# brows: lighter warm brown with a soft top-to-bottom gradient
lum=c.mean(1)
br=vis&(Y>262)&(Y<302)&(X>540)&(X<760)&(lum<0.42)
k=np.clip((0.42-lum[br])/0.2,0,1)[:,None]
g=np.clip((Y[br]-262)/40,0,1)[:,None]
target=np.array([0.40,0.25,0.16])*(0.85+0.3*g)
c[br]=c[br]*(1-k)+target*k
# bigger catchlights
for cx,cy in ((596+6,336-9),(699+6,335-9)):
    d=np.hypot(X-cx,Y-cy); m=vis&(d<6.5)
    a=np.clip((6.5-d[m])/2.0,0,1)[:,None]; c[m]=c[m]*(1-a)+np.array([1,1,1])*a
t2=t.copy(); t2[ty[vis],tx[vis],:3]=c[vis]
np.save('tex_pol.npy',t2); print('brow',br.sum())
