import bpy, os, numpy as np, bmesh, cv2
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('gm_base.blend'))
ob=bpy.data.objects['Body']; me=ob.data
hairf=np.load('hairf.npy')
bm=bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table()
hl=bm.faces.layers.int.new('ishair')
for f in bm.faces: f[hl]=int(hairf[f.index])
bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=1e-4); bm.verts.ensure_lookup_table(); bm.verts.index_update()
P=np.array([v.co[:] for v in bm.verts]); E=np.array([[e.verts[0].index,e.verts[1].index] for e in bm.edges])
ishv=np.zeros(len(P),bool)
for f in bm.faces:
    if f[hl]:
        for v in f.verts: ishv[v.index]=True
X,Y,Z=P.T; AY=np.abs(Y)
# ---- target skull: asymmetric super-ellipsoid, radial projection
C=np.array([0.0,0.0,1.60]); NP=2.4
def proj(Q):
    d=Q-C
    ax=np.where(d[:,0]>0,0.142,0.147); az=np.where(d[:,2]>0,0.168,0.160)
    F=(np.abs(d[:,0]/ax)**NP+np.abs(d[:,1]/0.127)**NP+np.abs(d[:,2]/az)**NP)**(1/NP)
    return C+d/np.maximum(F,1e-6)[:,None]
ear=(AY>0.103)&(X>-0.08)&(X<0.05)&(Z<1.672)&~ishv
face=(X>0.08)&(Z<1.70)&(AY<0.11)
full=((Z>1.635)&~face)|((X<-0.05)&(Z>1.50)&(AY<0.115))|((AY>0.085)&(Z>1.665)&(X<0.09))
full|=ishv&(Z>1.5)&~((X>0.055)&(AY<0.105)&(Z<1.70))
sideburn=(AY>0.07)&(X>-0.03)&(Z<1.645)&(Z>1.48)
full&=~sideburn
full&=~ear
# transition: rings around full + temples/sideburns + nape
adj=[[] for _ in range(len(P))]
for a,b in E: adj[a].append(b); adj[b].append(a)
trans=full.copy()
for _ in range(4):
    nt=trans.copy()
    for i in np.where(trans)[0]:
        for j in adj[i]: nt[j]=True
    trans=nt
trans|=((AY>0.06)&(X>-0.03)&(X<0.12)&(Z>1.48)&(Z<1.70)&ishv)
trans|=((X<-0.03)&(Z>1.47)&(Z<1.53)&(AY<0.12))
trans&=~((Z<1.5)&(X<-0.1))
trans|=ishv&(Z>1.6)
# skin just around the old hairline too, so the fringe edge relaxes into the forehead
hv_idx=np.where(ishv&(Z>1.6))[0]; ring=np.zeros(len(P),bool); ring[hv_idx]=True
for _ in range(3):
    nr=ring.copy()
    for i in np.where(ring)[0]:
        for j in adj[i]: nr[j]=True
    ring=nr
trans|=ring&(Z>1.66)
trans|=(X>0.0)&(Z>1.672)&(AY<0.13)
trans|=(AY>0.085)&(Z>1.6)&(X>-0.02)&(X<0.085)
trans|=(AY>0.075)&(AY<0.118)&(X>0.02)&(X<0.095)&(Z>1.585)&(Z<1.70)
trans&=~ear; trans&=~(face&(Z<1.67)&~ishv&((X>0.095)|(AY<0.075)))

mov=trans|full
print('full',full.sum(),'trans',trans.sum())
deg=np.bincount(E.ravel(),minlength=len(P)).astype(float)
P[full]=proj(P[full])
for it in range(400):
    acc=np.zeros_like(P); np.add.at(acc,E[:,0],P[E[:,1]]); np.add.at(acc,E[:,1],P[E[:,0]])
    avg=acc/np.maximum(deg,1)[:,None]
    P[mov]+= (avg[mov]-P[mov])*0.6
    P[full]=proj(P[full])
# gentle relax of the forehead band just above the brows (old hairline ridge)
band=(X>0.05)&(Z>1.655)&(Z<1.69)&(AY<0.125)&~mov
for it in range(30):
    acc=np.zeros_like(P); np.add.at(acc,E[:,0],P[E[:,1]]); np.add.at(acc,E[:,1],P[E[:,0]])
    avg=acc/np.maximum(deg,1)[:,None]
    wz=np.clip((Z[band]-1.655)/0.012,0,1)[:,None]
    P[band]+=(avg[band]-P[band])*0.5*wz
for v,p in zip(bm.verts,P): v.co=Vector(p)
bm.to_mesh(me); bm.free(); me.update()
bpy.context.view_layer.objects.active=ob; ob.select_set(True)
if me.has_custom_normals:
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.customdata_custom_splitnormals_clear(); bpy.ops.object.mode_set(mode='OBJECT')
for p in me.polygons: p.use_smooth=True
# ---- texture: old hair -> skin, coloured from the nearest real skin
img=[n for n in bpy.data.materials['player'].node_tree.nodes if n.type=='TEX_IMAGE' and 'classmap' not in n.image.name][0].image
tex=np.load('tex.npy'); cls=np.load('cls_tex2.npy'); idm=np.load('idmap.npy')
d0=np.load('mesh.npz'); Cf=d0['V'][d0['T']].mean(1); UVc=d0['UV']; S=tex.shape[0]
fz=np.where(idm>=0,Cf[np.maximum(idm,0),2],0); fx=np.where(idm>=0,Cf[np.maximum(idm,0),0],0); fy=np.where(idm>=0,Cf[np.maximum(idm,0),1],0)
eyez=(idm>=0)&(fx>0.07)&(fz<1.665)&(np.abs(fy)<0.075)
navy=(tex[...,2]>tex[...,0]+0.06)|((tex[...,2]>tex[...,0]+0.02)&((idm<0)|(fz<1.5)))
hm=(cls==2)|((idm>=0)&hairf[np.maximum(idm,0)]&np.isin(cls,[2,3,5]))
hm=cv2.dilate(hm.astype(np.uint8),np.ones((25,25),np.uint8)).astype(bool)&(np.isin(cls,[1,2,3,5])|(idm<0))&~eyez&~((idm>=0)&(fz<1.47))
hm&=~((cls==3)|(cls==4)); hm&=~navy
lum_=tex[...,:3].mean(2)
earz=(np.abs(fy)>0.123)&(fx<0.035)&(fx>-0.075)&(fz<1.675)&~hairf[np.maximum(idm,0)]
spk=(idm>=0)&(fz>1.47)&(lum_<0.42)&~eyez&~earz&(cls!=3)&(cls!=4)&~navy
hm|=cv2.dilate(spk.astype(np.uint8),np.ones((11,11),np.uint8)).astype(bool)&(fz>1.47)&~eyez&~earz&(cls!=3)&(cls!=4)&~navy
hm|=(idm>=0)&((fz>1.69)|((fz>1.665)&(np.abs(fy)>0.035)))&np.isin(cls,[1,2,5])
nearbrow=cv2.dilate((cls==3).astype(np.uint8),np.ones((13,13),np.uint8)).astype(bool)&(fz<1.69); hm&=~nearbrow
from scipy.spatial import cKDTree
uc=UVc.mean(1); fcol=tex[(uc[:,1]*(S-1)).astype(int),(uc[:,0]*(S-1)).astype(int),:3]; fcl=cls[(uc[:,1]*(S-1)).astype(int),(uc[:,0]*(S-1)).astype(int)]
htree=cKDTree(Cf[hairf]); dh,_=htree.query(Cf,k=1)
near=(dh<0.022)&~hairf&(Cf[:,2]>1.47)
src=(fcl==1)&(Cf[:,2]>1.45)&~hairf&(dh>0.03)
# repaint the skin texels that carried the hair's shadow (old hairline band), but never eyes, brows or the ear
nf=near[np.maximum(idm,0)]&(idm>=0)&~eyez&~earz&(cls!=3)&(cls!=4)&~nearbrow&~navy
hm|=nf
sp2=(idm>=0)&(fz>1.47)&(fz<1.72)&(np.abs(fy)>0.075)&(lum_<0.45)&~earz&~eyez&~nearbrow&(cls!=3)&(cls!=4)&~navy
hm|=cv2.dilate(sp2.astype(np.uint8),np.ones((9,9),np.uint8)).astype(bool)&~earz&~eyez&~nearbrow&(cls!=3)&(cls!=4)&~navy&((idm<0)|(fz>1.47))
hm|=cv2.dilate(hm.astype(np.uint8),np.ones((5,5),np.uint8)).astype(bool)&(idm<0)
ys,xs=np.where(hm); fid=idm[ys,xs]; ok=fid>=0
tree=cKDTree(Cf[src]); scol=fcol[src]; skin=np.median(scol,0)
dd,ii=tree.query(Cf[np.maximum(fid,0)],k=24); w=1/np.maximum(dd,0.004)**2
local=(scol[ii]*w[...,None]).sum(1)/w.sum(1)[:,None]; far=np.clip((dd[:,0]-0.01)/0.05,0,1)[:,None]
col=local*(1-far)+skin*far; col[~ok]=skin
fill=tex[...,:3].copy(); fill[ys,xs]=col
edge=cv2.GaussianBlur(hm.astype(np.float32),(0,0),2.0)[...,None]
t2=tex.copy(); t2[...,:3]=tex[...,:3]*(1-edge)+fill*edge; t2[...,3]=1
img.pixels.foreach_set(t2.astype(np.float32).ravel()); img.pack()
cls2=cls.copy(); cls2[hm&(cls!=3)]=1
cmi=[n for n in bpy.data.materials['player'].node_tree.nodes if n.type=='TEX_IMAGE' and 'classmap' in n.image.name][0].image
a=cls2.astype(np.float32)/255; cmi.pixels.foreach_set(np.stack([a,a,a,np.ones_like(a)],-1).ravel()); cmi.pack()
cv2.imwrite('classmap_bald.png',np.flipud(cls2))
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('gm_bald3.blend')); print('ok')
