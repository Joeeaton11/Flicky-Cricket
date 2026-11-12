import numpy as np, math
from PIL import Image, ImageFilter
from scipy import ndimage
d=np.load('mesh2.npz'); V,N,T,UV,tex=d['V'],d['N'],d['T'],d['UV'],d['tex']; H,W=tex.shape[:2]
YAW=15; r=math.radians(YAW); C=np.array([0,0,0.74]); S=0.5/1024
right=np.array([math.cos(r),math.sin(r),0]); up=np.array([0,0,1.0]); view=np.array([-math.sin(r),math.cos(r),0])   # camera looks along +view
def to_px(p): q=p-C; return np.stack([512+(q@right)/S, 512-(q@up)/S],-1)
# art -> render frame similarity from landmarks (left eye, right eye, mouth)
A=np.array([[507,142],[567,140],[530,195]],float); B=np.array([[325,565],[545,565],[430,755]],float)
X=np.c_[A,np.ones(3)]; M,_,_,_=np.linalg.lstsq(X,B,rcond=None)   # affine 3x2
art=Image.open('../c3d/dl/caponly.png').convert('RGB'); aa=np.array(art).astype(float)/255
# art face mask: inside the head silhouette, no bat (wood), no dark outline at the rim
R_,G_,B_=aa[...,0],aa[...,1],aa[...,2]; mx=aa.max(2); mn=aa.min(2); sat=(mx-mn)/np.maximum(mx,1e-3)
hue=np.where(mx==R_,((G_-B_)/np.maximum(mx-mn,1e-3))/6,0.5)
wood=(hue>0.066)&(sat<0.5)&(mx>0.45)
yy,xx=np.mgrid[:1024,:1024]
headbox=(yy<215)&(yy>20)&(xx>440)&(xx<640)
skinish=(R_>G_)&(G_>=B_-0.03)&(R_>0.35)
face=headbox&~wood
face=ndimage.binary_fill_holes(face&(skinish|(mx<0.45)))
face=ndimage.binary_erosion(face,iterations=7); face&=(yy>88)
fm=np.array(Image.fromarray((face*255).astype('uint8')).filter(ImageFilter.GaussianBlur(9))).astype(float)/255
Minv=np.linalg.inv(np.r_[M.T,[[0,0,1]]])   # render px -> art px
# rasterise each UV triangle into texel positions with barycentric 3D position + normal
out=tex.copy(); wsum=np.zeros((H,W))
for t,uvt in zip(T,UV):
    P=V[t]; Nn=N[t]
    if P[:,2].mean()<0.55: continue                       # head only
    fn=np.cross(P[1]-P[0],P[2]-P[0]); fn/=np.linalg.norm(fn)+1e-9
    face_dot=-(fn@view)                                    # facing the camera
    if face_dot<0.15: continue
    uvp=uvt*[W,H]; x0,y0=np.floor(uvp.min(0)).astype(int); x1,y1=np.ceil(uvp.max(0)).astype(int)
    xs,ys=np.meshgrid(np.arange(x0,x1+1),np.arange(y0,y1+1)); pts=np.c_[xs.ravel()+0.5,ys.ravel()+0.5]
    a,b,c=uvp; v0=b-a; v1=c-a; den=v0[0]*v1[1]-v1[0]*v0[1]
    if abs(den)<1e-9: continue
    w1=((pts[:,0]-a[0])*v1[1]-v1[0]*(pts[:,1]-a[1]))/den; w2=(v0[0]*(pts[:,1]-a[1])-(pts[:,0]-a[0])*v0[1])/den; w0=1-w1-w2
    ins=(w0>=-0.01)&(w1>=-0.01)&(w2>=-0.01)
    if not ins.any(): continue
    pts=pts[ins]; bw=np.c_[w0[ins],w1[ins],w2[ins]]
    p3=bw@P; rp=to_px(p3)
    ap=np.c_[rp,np.ones(len(rp))]@Minv.T; ax,ay=ap[:,0],ap[:,1]
    ok=(ax>=0)&(ax<1023)&(ay>=0)&(ay<1023)
    tx=pts[ok,0].astype(int); ty=pts[ok,1].astype(int); ty=np.clip(ty,0,H-1); tx=np.clip(tx,0,W-1)
    axi=ax[ok].astype(int); ayi=ay[ok].astype(int)
    m=fm[ayi,axi]*np.clip((face_dot-0.15)/0.35,0,1)
    col=aa[ayi,axi]
    # texture rows are bottom-up in Blender pixel order
    out[ty,tx,:3]=out[ty,tx,:3]*(1-m[:,None])+col*m[:,None]
np.save('tex_proj.npy',out)
Image.fromarray((np.flipud(out)*255).clip(0,255).astype('uint8'),'RGBA').save('tex_proj.png')
print('done')
