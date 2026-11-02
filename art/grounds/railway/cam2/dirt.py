# Turn the grass field into dusty packed earth: grass mask (green, inside the sleeper wall) -> keep the painted light/shade + texture,
# map it to a warm dirt palette, add soft grey cinder patches and a few darker oil spots. Everything outside the field untouched.
import numpy as np, cv2
img=cv2.imread('plate.png').astype(np.float32); H,W=img.shape[:2]; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
B,G,R=img[...,0],img[...,1],img[...,2]
yy,xx=np.mgrid[:H,:W]; rho=np.sqrt(((xx-cx)/rx)**2+((yy-cy)/ry)**2)
wall=(((R>185)&(G>150)&(B<110))|(np.maximum(np.maximum(R,G),B)<75))&(rho>0.93)
grass=(((G>B+50)&(np.abs(R-G)<60)&~wall&(rho<1.03))|(rho<0.93)).astype(np.uint8)
n_,lab_=cv2.connectedComponents(grass); core=lab_[(rho<0.6)&(grass>0)]; keep=np.bincount(core).argmax()
grass=(lab_==keep).astype(np.uint8); grass=cv2.morphologyEx(grass,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8)); print('grass px',grass.sum())
grass=cv2.morphologyEx(grass,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
m=cv2.GaussianBlur(grass.astype(np.float32),(0,0),1.2)[...,None]
L=(0.2*R+0.7*G+0.1*B)            # painted brightness (keeps mowing/shadow/texture)
Lm=cv2.GaussianBlur(L,(0,0),40); detail=(L-Lm)
rng=np.random.default_rng(11)
def blobs(n,smin,smax,seed):
  r=np.random.default_rng(seed); f=np.zeros((H,W),np.float32)
  for _ in range(n): cv2.ellipse(f,(int(r.integers(80,W-80)),int(r.integers(int(cy-ry),int(cy+ry)))),(int(r.integers(smin,smax)),int(r.integers(smin,smax)*0.7)),float(r.integers(0,180)),0,360,1.0,-1)
  return cv2.GaussianBlur(f,(0,0),smax*0.5)
cinder=np.clip(blobs(12,70,170,3)*1.8,0,1); oil=np.clip(blobs(6,15,40,8)*1.2,0,1)
base=np.array([58,104,168.])     # BGR warm dusty earth
grey=np.array([118,122,128.])
col=base*(1-cinder[...,None]*0.45)+grey*(cinder[...,None]*0.45)
shade=(Lm/ max(Lm[grass>0].mean(),1))[...,None]
dirt=col*np.clip(shade,0.7,1.25)+detail[...,None]*0.9
dirt=dirt*(1-oil[...,None]*0.28)
grain=rng.normal(0,5,(H,W,1)).astype(np.float32); grain=cv2.GaussianBlur(grain,(0,0),0.6)[...,None] if grain.ndim==2 else cv2.GaussianBlur(grain[...,0],(0,0),0.6)[...,None]
dirt=dirt+grain
out=img*(1-m)+dirt*m
cv2.imwrite('plate_dirt.png',np.clip(out,0,255).astype(np.uint8))
cv2.imwrite('dirt_check.png',cv2.resize(np.clip(out,0,255).astype(np.uint8),(390,844)))
