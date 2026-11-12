import cv2, numpy as np, math
s=np.load('samples.npz'); tx,ty,P,N=s['tx'],s['ty'],s['P'],s['N']
tex=np.load('tex.npy'); S=tex.shape[0]
W,H=1300,1800; px_sz=2.05/1800
def lin(a): return (a.astype(np.float32)/255)**2.2
acc=np.zeros((S,S,3),np.float32); ws=np.zeros((S,S),np.float32); accF=np.zeros((S,S,3),np.float32); wsF=np.zeros((S,S),np.float32)
for v,yaw in [('front',0),('tq',35),('side',90)]:
    r=math.radians(yaw); tocam=np.array([math.sin(r),-math.cos(r),0]); right=np.array([math.cos(r),math.sin(r),0])
    X=W/2+(P@right)/px_sz; Y=H/2-(P[:,2]-0.05)/px_sz; D=-(P@tocam)
    xi=np.round(X).astype(int); yi=np.round(Y).astype(int); ok=(xi>=0)&(xi<W)&(yi>=0)&(yi<H)
    zb=np.full(W*H,np.inf,np.float32); fi=yi.clip(0,H-1)*W+xi.clip(0,W-1)
    # splat with 3x3 to close holes
    for dx in (-1,0,1):
        for dy in (-1,0,1):
            f2=(yi+dy).clip(0,H-1)*W+(xi+dx).clip(0,W-1); np.minimum.at(zb,f2[ok],D[ok])
    vis=ok&(D<=zb[fi]+0.012)
    rend=cv2.imread('b_%s.png'%v,cv2.IMREAD_UNCHANGED); alpha=rend[...,3]; rend=lin(rend[...,:3][...,::-1])
    alb=lin(cv2.imread('al_%s.png'%v)[...,::-1])
    ai=lin(cv2.imread('aw_%s.png'%v)[...,::-1])
    m=cv2.erode((alpha>250).astype(np.uint8),np.ones((9,9),np.uint8)).astype(np.float32)
    Sh=rend/np.maximum(alb,0.01)
    k=(0,0); sig=4
    Shb=cv2.GaussianBlur(Sh*m[...,None],k,sig)/np.maximum(cv2.GaussianBlur(m,k,sig),1e-3)[...,None]
    aial=ai/np.maximum(Shb,0.05)
    R=np.clip(aial/np.maximum(alb,0.004),0.25,4)
    Rb=cv2.GaussianBlur(R*m[...,None],k,6)/np.maximum(cv2.GaussianBlur(m,k,6),1e-3)[...,None]
    Rh=np.clip(R/np.maximum(Rb,1e-3),0.25,4)
    lg=np.log(Rh).mean(2,keepdims=True); sel=np.clip((np.abs(lg)-0.12)/0.15,0,1)
    sel=cv2.GaussianBlur(cv2.dilate(sel,np.ones((3,3),np.uint8)),(0,0),1.2)[...,None] if sel.ndim==3 else sel
    Rh=Rh**sel
    fd=np.clip(N@tocam,0,1)
    yc,xc=yi.clip(0,H-1),xi.clip(0,W-1); mm=m[yc,xc]*vis
    z=P[:,2]; head=np.clip((z-0.50)/0.04,0,1)
    if v=='front':
        def box(x0,y0,x1,y1,sg):
            f=np.zeros((H,W),np.float32); f[y0:y1,x0:x1]=1; return cv2.GaussianBlur(f,(0,0),sg)
        fb=box(540,258,760,305,4); fe_=box(548,300,752,360,4); fn=box(615,345,685,392,3)
        Rf=Rh.copy()
        Rf=np.where(fb[...,None]>0.01,np.minimum(Rh,1.0)**1.0,Rf)          # brows: darken only, no light halo
        Rf=np.where(fn[...,None]>0.01,np.clip(Rh,0.8,1.15)**0.6,Rf)          # nose: softer
        Rh=np.where((fb+fe_+fn)[...,None]>0.01,Rf,Rh**1.35)                  # body: stronger detail
        fm=np.clip(fb+fe_+fn,0,1); fe=fm[yc,xc]
        w=(fd**6*(1-head)+head*fe*(fd>0.25)*20)*mm
    else:
        Rh=Rh**1.35
        w=fd**6*(1-head)*mm
    np.add.at(acc,(ty,tx),Rh[yc,xc]*w[:,None]); np.add.at(ws,(ty,tx),w)
    print(v,vis.mean(),w.mean())
Rt=acc/np.maximum(ws,1e-6)[...,None]
bl=np.clip(ws/0.05,0,1)[...,None]
Rt=Rt*bl+(1-bl)

tl=tex[...,:3]**2.2
new=(tl*Rt).clip(0,1)**(1/2.2)
out=tex.copy(); out[...,:3]=new
np.save('tex_det.npy',out)
cv2.imwrite('tex_det.png',(np.flipud(out[...,:3])[...,::-1]*255).round().astype(np.uint8))
print('cover',(ws>0.05).mean())
