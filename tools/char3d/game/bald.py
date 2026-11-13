import bpy, os, numpy as np, bmesh, cv2
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('gm_base.blend'))
ob=bpy.data.objects['Body']; me=ob.data
hairf=np.load('hairf.npy')
c0=Vector((-0.005,0,1.60)); ax=Vector((0.147,0.127,0.168))
bm=bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table()
hl=bm.faces.layers.int.new('ishair')
for f in bm.faces: f[hl]=int(hairf[f.index])
nv0=len(bm.verts); bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=1e-4); print('welded',nv0,'->',len(bm.verts))
bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
hv=set(v for f in bm.faces if f[hl] for v in f.verts)
moved=[]; W={}
NP=2.6
def proj(p):
    d=p-c0; r=(abs(d.x/ax.x)**NP+abs(d.y/ax.y)**NP+abs(d.z/ax.z)**NP)**(1/NP); return c0+d/r if r>0 else p
def scalp_w(p):
    if p.z<1.585: return 0
    w=min(1,(p.z-1.585)/0.03)
    if p.x>0.085 and p.z<1.705: w*=max(0,min(1,(p.z-1.665)/0.04))   # forehead stays
    if abs(p.y)>0.105 and p.z<1.67 and p.x<0.035 and p.x>-0.06: w*=max(0,min(1,(p.z-1.64)/0.03))  # ears stay
    return w
def nape_w(p):
    # back of the skull down to the neck, behind the ears
    if p.x>-0.035 or p.z>1.6 or p.z<1.53 or abs(p.y)>0.13: return 0
    return min(1,(p.z-1.53)/0.05)*min(1,(-0.035-p.x)/0.03)
for v in bm.verts:
    w=max(scalp_w(v.co),nape_w(v.co))
    if w<=0: continue
    if v not in hv and w<1: continue
    v.co=v.co.lerp(proj(v.co),w); moved.append(v); W[v]=w
# soft-weighted smoothing over the whole scalp / temples / nape, then keep the top on the scalp shape
import numpy as np
bm.verts.index_update()
P=np.array([v.co[:] for v in bm.verts]); E=np.array([[e.verts[0].index,e.verts[1].index] for e in bm.edges])
def ss(x,a,b): return np.clip((x-a)/(b-a),0,1)
X,Y,Z=P[:,0],P[:,1],P[:,2]; AY=np.abs(Y)
top=ss(Z,1.6,1.635)*(1-(X>0.085)*(1-ss(Z,1.675,1.715)))
temple=(AY>0.05)*ss(X,-0.03,0.0)*(1-ss(X,0.12,0.14))*ss(Z,1.585,1.615)*(1-ss(Z,1.72,1.74))*0.85
nape=(1-ss(X,-0.04,-0.02))*ss(Z,1.455,1.5)*(1-ss(Z,1.62,1.65))*(1-ss(AY,0.12,0.14))
band=(1-ss(X,0.05,0.08))*ss(Z,1.53,1.56)*(1-ss(Z,1.67,1.70))
w=np.maximum(np.maximum(np.maximum(top,temple),nape),band)
ear=(AY>0.105)*ss(X,-0.07,-0.055)*(1-ss(X,0.03,0.045))*(1-ss(Z,1.655,1.675))
w=w*(1-ear)
deg=np.bincount(E.ravel(),minlength=len(P)).astype(float)
fixed=np.array([proj(Vector(p))[:] for p in P])
for it in range(150):
    acc=np.zeros_like(P); np.add.at(acc,E[:,0],P[E[:,1]]); np.add.at(acc,E[:,1],P[E[:,0]])
    avg=acc/np.maximum(deg,1)[:,None]
    P=P+(avg-P)*(0.5*w)[:,None]
    if it%30==29:
        pr=np.array([proj(Vector(p))[:] for p in P]); k=(top*(Z>1.64))[:,None]
        P=P*(1-k)+pr*k
for v,p in zip(bm.verts,P): v.co=Vector(p)
print('smoothed verts',int((w>0.01).sum()))
bm.to_mesh(me); bm.free(); me.update()
print('hair verts',len(hv),'moved',len(moved),'custom normals',me.has_custom_normals)
bpy.context.view_layer.objects.active=ob; ob.select_set(True)
if me.has_custom_normals:
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.customdata_custom_splitnormals_clear(); bpy.ops.object.mode_set(mode='OBJECT')
for p in me.polygons: p.use_smooth=True
print('custom normals after',me.has_custom_normals)
# texture: hair -> skin colour, classmap: hair -> skin
img=[n for n in bpy.data.materials['player'].node_tree.nodes if n.type=='TEX_IMAGE' and 'classmap' not in n.image.name][0].image
tex=np.load('tex.npy'); cls=np.load('cls_tex2.npy')
idm0=np.load('idmap.npy'); d0=np.load('mesh.npz'); Cf0=d0['V'][d0['T']].mean(1)
fz0=np.where(idm0>=0,Cf0[np.maximum(idm0,0),2],0); fx0=np.where(idm0>=0,Cf0[np.maximum(idm0,0),0],0)
headskin=(cls==1)&(fz0>1.5)&(fz0<1.72)&(fx0<0.08)
skin=np.median(tex[headskin],0); print('head skin',np.round(skin[:3]*255))
idm=np.load('idmap.npy'); hm=(cls==2)|((idm>=0)&hairf[np.maximum(idm,0)]&np.isin(cls,[2,3,5]))
d_=np.load('mesh.npz'); Cf=d_['V'][d_['T']].mean(1)
fz=np.where(idm>=0,Cf[np.maximum(idm,0),2],0); fx=np.where(idm>=0,Cf[np.maximum(idm,0),0],0)
fy=np.where(idm>=0,Cf[np.maximum(idm,0),1],0)
eyez=(idm>=0)&(fx>0.07)&(fz<1.665)&(np.abs(fy)<0.075)
hm=cv2.dilate(hm.astype(np.uint8),np.ones((25,25),np.uint8)).astype(bool)&(np.isin(cls,[1,2,3,5])|(idm<0))&~eyez&~((idm>=0)&(fz<1.47))
# keep real brows / eyes
hm&=~((cls==3)|(cls==4))
hm&=~(tex[...,2]>tex[...,0]+0.02)   # navy collar stays
hm|=(idm>=0)&(fz>1.69)&np.isin(cls,[1,2,5])   # upper forehead: even out the old hairline shadow
lum_=tex[...,:3].mean(2)
spk=(idm>=0)&(fz>1.5)&(lum_<0.33)&~eyez&(cls!=3)&(cls!=4)&~(tex[...,2]>tex[...,0]+0.02)
hm|=cv2.dilate(spk.astype(np.uint8),np.ones((5,5),np.uint8)).astype(bool)&(fz>1.5)&~eyez&(cls!=3)&(cls!=4)
nearbrow=cv2.dilate((cls==3).astype(np.uint8),np.ones((13,13),np.uint8)).astype(bool)&(fz<1.69)
hm&=~nearbrow
# soft skin fill with a little variation borrowed from forehead tone
tex2=tex.copy()
# colour each filled texel from the nearest real skin in 3D, so the scalp continues the forehead/neck tone
from scipy.spatial import cKDTree
UVc=d0['UV']; S_=tex.shape[0]
fcol=tex[(UVc[:,:,1].mean(1)*(S_-1)).astype(int),(UVc[:,:,0].mean(1)*(S_-1)).astype(int),:3]
fcls=cls[(UVc[:,:,1].mean(1)*(S_-1)).astype(int),(UVc[:,:,0].mean(1)*(S_-1)).astype(int)]
src=(fcls==1)&(Cf0[:,2]>1.45)&~hairf
tree=cKDTree(Cf0[src]); scol=fcol[src]
ys_,xs_=np.where(hm); fid=idm0[ys_,xs_]; ok_=fid>=0
q=Cf0[np.maximum(fid,0)]
dd,ii=tree.query(q,k=24)
wgt=1/np.maximum(dd,0.004)**2; local=(scol[ii]*wgt[...,None]).sum(1)/wgt.sum(1)[:,None]
far=np.clip((dd[:,0]-0.01)/0.05,0,1)[:,None]
colr=local*(1-far)+np.array(skin[:3])*far
colr[~ok_]=skin[:3]
fillimg=np.zeros_like(tex[...,:3]); fillimg[ys_,xs_]=colr
tex2[...,:3]=np.where(hm[...,None],fillimg,tex[...,:3])
# feather the hairline edge on the texture
m8=hm.astype(np.uint8)*255; edge=cv2.GaussianBlur(m8,(0,0),2.0).astype(np.float32)/255
tex2[...,:3]=tex[...,:3]*(1-edge[...,None])+tex2[...,:3]*edge[...,None]
tex2[...,3]=1
img.pixels.foreach_set(tex2.astype(np.float32).ravel()); img.pack()
cls2=cls.copy(); cls2[hm]=1; cv2.imwrite('classmap_bald.png',np.flipud(cls2))
cmi=[n for n in bpy.data.materials['player'].node_tree.nodes if n.type=='TEX_IMAGE' and 'classmap' in n.image.name][0].image
a=np.flipud(cls2).astype(np.float32)[::-1]/255
cmi.pixels.foreach_set(np.stack([a,a,a,np.ones_like(a)],-1).ravel()); cmi.pack()
np.save('tex_bald.npy',tex2); np.save('cls_bald.npy',cls2)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('gm_bald.blend')); print('ok')
