import cv2, numpy as np, sys
s=np.load('samples.npz'); tx,ty,P,N=s['tx'],s['ty'],s['P'],s['N']
tex=np.load('tex_pol.npy'); W,H=1300,1800; px=2.05/1800
def lin(a): return (a.astype(np.float32)/255)**2.2
X=W/2+P[:,0]/px; Y=H/2-(P[:,2]-0.05)/px; D=P[:,1]
xi=np.round(X).astype(int); yi=np.round(Y).astype(int); ok=(xi>=0)&(xi<W)&(yi>=0)&(yi<H)
zb=np.full(W*H,np.inf,np.float32); fi=yi.clip(0,H-1)*W+xi.clip(0,W-1)
for dx in (-1,0,1):
    for dy in (-1,0,1):
        f2=(yi+dy).clip(0,H-1)*W+(xi+dx).clip(0,W-1); np.minimum.at(zb,f2[ok],D[ok])
vis=ok&(D<=zb[fi]+0.01)&(-N[:,1]>0.25)
rend=cv2.imread('gb_front.png',cv2.IMREAD_UNCHANGED); alpha=rend[...,3]; rend=lin(rend[...,:3][...,::-1])
alb=lin(cv2.imread('alg_front.png')[...,::-1]); ai=lin(cv2.imread(sys.argv[1])[...,::-1])
m=cv2.erode((alpha>250).astype(np.uint8),np.ones((9,9),np.uint8)).astype(np.float32)
Sh=rend/np.maximum(alb,0.01); k=(0,0)
Shb=cv2.GaussianBlur(Sh*m[...,None],k,4)/np.maximum(cv2.GaussianBlur(m,k,4),1e-3)[...,None]
R=np.clip(ai/np.maximum(Shb,0.05)/np.maximum(alb,0.004),0.2,5)
Rb=cv2.GaussianBlur(R*m[...,None],k,25)/np.maximum(cv2.GaussianBlur(m,k,25),1e-3)[...,None]
Rh=np.clip(R/np.maximum(Rb,1e-3),0.2,5)
fm=np.zeros((H,W),np.float32); cv2.ellipse(fm,(652,380),(96,90),0,0,360,1,-1); fm=cv2.GaussianBlur(fm,(0,0),9)
yc,xc=yi.clip(0,H-1),xi.clip(0,W-1)
w=fm[yc,xc]*vis*m[yc,xc]
sel=w>0.01
import json
T=json.load(open('tints.json')); NAMES=['unk','skin','shirt','trim','trousers','pads','straps','shoes','shoe_stripe','wristband','face_dark','face_white']
tint=np.ones((256,3),np.float32)
for i,nm in enumerate(NAMES):
    if nm in T: tint[i]=T[nm]
cm=np.flipud(cv2.imread('classmap.png',cv2.IMREAD_UNCHANGED)); cm=cm if cm.ndim==2 else cm[...,0]
aial=ai/np.maximum(Shb,0.05)
bl=lambda x,sg: cv2.GaussianBlur(x*m[...,None],(0,0),sg)/np.maximum(cv2.GaussianBlur(m,(0,0),sg),1e-3)[...,None]
aial=aial*np.clip(bl(alb,6)/np.maximum(bl(aial,6),1e-3),0.5,2)
t2=tex.copy(); c=tex[ty[sel],tx[sel],:3]**2.2
kk=cm[ty[sel],tx[sel]]; bad=np.isin(kk,[2,3,4,5,6,7,8,9,255]); print('reclass',bad.sum(),np.unique(kk[bad]))
cm[ty[sel][bad],tx[sel][bad]]=1; cv2.imwrite('classmap.png',np.flipud(cm))
tn=tint[cm[ty[sel],tx[sel]]]
new=np.clip(aial[yc[sel],xc[sel]]/np.maximum(tn,1e-3),0,1)
ww=w[sel,None]
c2=c*(1-ww)+new*ww
t2[ty[sel],tx[sel],:3]=np.clip(c2,0,1)**(1/2.2)
np.save('tex_face.npy',t2); print('texels',sel.sum())
