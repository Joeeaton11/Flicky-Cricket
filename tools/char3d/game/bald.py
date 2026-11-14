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
    if abs(p.y)>0.105 and p.z<1.67 and p.x<0.035: w*=max(0,min(1,(p.z-1.64)/0.03))  # ears stay
    return w
for v in bm.verts:
    w=scalp_w(v.co)
    if w<=0: continue
    if v not in hv and w<1: continue
    v.co=v.co.lerp(proj(v.co),w); moved.append(v); W[v]=w
ring=set(moved)
for _ in range(2):
    for v in list(ring):
        for e in v.link_edges: ring.add(e.other_vert(v))
for it in range(30):
    bmesh.ops.smooth_vert(bm,verts=list(ring),factor=0.5,use_axis_x=True,use_axis_y=True,use_axis_z=True)
    if it%10==9 or it==29:
        for v in moved: v.co=v.co.lerp(proj(v.co),W[v])
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
skin=np.median(tex[(cls==1)],0)
idm=np.load('idmap.npy'); hm=(cls==2)|((idm>=0)&hairf[np.maximum(idm,0)]&np.isin(cls,[2,3,5]))
d_=np.load('mesh.npz'); Cf=d_['V'][d_['T']].mean(1)
fz=np.where(idm>=0,Cf[np.maximum(idm,0),2],0); fx=np.where(idm>=0,Cf[np.maximum(idm,0),0],0)
eyez=(idm>=0)&(fx>0.07)&(fz<1.665)
hm=cv2.dilate(hm.astype(np.uint8),np.ones((25,25),np.uint8)).astype(bool)&(np.isin(cls,[1,2,3,5])|(idm<0))&~eyez&~((idm>=0)&(fz<1.4))
# keep real brows / eyes
hm&=~((cls==3)|(cls==4))
# soft skin fill with a little variation borrowed from forehead tone
tex2=tex.copy(); tex2[hm]=skin
# feather the hairline edge on the texture
m8=hm.astype(np.uint8)*255; edge=cv2.GaussianBlur(m8,(0,0),2.0).astype(np.float32)/255
tex2[...,:3]=tex[...,:3]*(1-edge[...,None])+np.array(skin[:3])*edge[...,None]
tex2[...,3]=1
img.pixels.foreach_set(tex2.astype(np.float32).ravel()); img.pack()
cls2=cls.copy(); cls2[hm]=1; cv2.imwrite('classmap_bald.png',np.flipud(cls2))
cmi=[n for n in bpy.data.materials['player'].node_tree.nodes if n.type=='TEX_IMAGE' and 'classmap' in n.image.name][0].image
a=np.flipud(cls2).astype(np.float32)[::-1]/255
cmi.pixels.foreach_set(np.stack([a,a,a,np.ones_like(a)],-1).ravel()); cmi.pack()
np.save('tex_bald.npy',tex2); np.save('cls_bald.npy',cls2)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('gm_bald.blend')); print('ok')
