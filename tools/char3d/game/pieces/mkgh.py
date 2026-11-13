import bpy, numpy as np, os, bmesh
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('batter_rigframe.blend'))
src=bpy.data.objects['Body']; me=src.data
img=[n for n in me.materials[0].node_tree.nodes if n.type=='TEX_IMAGE'][0].image
W=img.size[0]; px=np.array(img.pixels[:],dtype=np.float32).reshape(W,W,4)
uv=me.uv_layers.active.data
cen=np.array([p.center[:] for p in me.polygons]); cols=[]
for p in me.polygons:
    u=np.mean([uv[li].uv[:] for li in p.loop_indices],0); cols.append(px[int(u[1]*(W-1)),int(u[0]*(W-1)),:3])
cols=np.array(cols); lum=cols.mean(1); sat=cols.max(1)-cols.min(1)
X,Y,Z=cen.T
# gloves: everything past the wrist along the forearm (both hands)
glove=np.zeros(len(cen),bool)
for sg in (1,-1):
    wr=np.array([-0.05,0.468*sg,0.87]); el=np.array([-0.072,0.35*sg,1.075]); d=(wr-el)/np.linalg.norm(wr-el)
    t=(cen-wr)@d
    glove|=(t>-0.035)&(Y*sg>0.3)&(Z<1.0)
# helmet: above the neck, not skin (face) — navy shell, gold stripe, grille, ear guards
skin=(cols[:,0]>cols[:,1])&(cols[:,1]>cols[:,2])&(sat>0.12)&(cols[:,0]>0.3)
eyes=(X>0.06)&(Z<1.66)&(Z>1.55)&(np.abs(Y)<0.1)&(lum<0.25)
face=(X>0.0)&(Z<1.70)&(np.abs(Y)<0.12)
# helmet by geometry: what stands off the bald head (shell, peak, grille, ear guards), not hair/face lying on it
from mathutils.bvhtree import BVHTree
with bpy.data.libraries.load(os.path.abspath('../gm/gm_bald.blend')) as (a_,b_): b_.objects=['Body']
bm0=bmesh.new(); bm0.from_mesh(b_.objects[0].data); bvh=BVHTree.FromBMesh(bm0)
off=np.zeros(len(cen))
for i,c in enumerate(cen):
    if c[2]<1.40: continue
    h=bvh.find_nearest(Vector(c));
    if h[0] is None: continue
    off[i]=(Vector(c)-h[0]).dot(h[1])
r_,g_,b_c=cols.T[:3]
gold=(r_>0.5)&(g_>0.72*r_)&(b_c<0.36*r_)
navy=(b_c>r_+0.03)&(b_c>=g_)&(lum<0.45)
grille=(lum>0.3)&(sat<0.1)
fz=(X>0.03)&(Z<1.71)&(np.abs(Y)<0.13)   # face + fringe zone: only what stands off the head
hairish=(r_>b_c+0.02)&(lum<0.42)&~gold
helmet=(Z>1.43)&~(skin&face)&~(skin&(Z<1.52))&~eyes&~((X>0.05)&(Z<1.66)&(np.abs(Y)<0.1)&(lum>0.75))&~hairish
# tidy the outline on the face graph: close small gaps, drop slivers and specks
nb=[[] for _ in range(len(cen))]
emap={}
for p in me.polygons:
    for ek in p.edge_keys: emap.setdefault(ek,[]).append(p.index)
for fs in emap.values():
    for a in fs:
        for b in fs:
            if a!=b: nb[a].append(b)
cand=(Z>1.43)&~skin&~hairish&~eyes
for it in range(4):
    cnt=np.array([sum(helmet[j] for j in nb[i]) for i in range(len(cen))])
    helmet|=cand&(cnt>=2)
for it in range(3):
    cnt=np.array([sum(helmet[j] for j in nb[i]) for i in range(len(cen))])
    helmet&=~(cnt<=1)
print('helmet faces',helmet.sum(),'off>7mm',(off>0.007).sum())
def take(mask,name):
    o=src.copy(); o.data=me.copy(); o.name=name; o.data.name=name; bpy.context.scene.collection.objects.link(o)
    bm=bmesh.new(); bm.from_mesh(o.data); bm.faces.ensure_lookup_table()
    bmesh.ops.delete(bm,geom=[f for f in bm.faces if not mask[f.index]],context='FACES')
    bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=1e-5); bmesh.ops.holes_fill(bm,edges=bm.edges,sides=16)
    bm.normal_update()
    for v in bm.verts: v.co+=v.normal*0.0015
    bm.to_mesh(o.data); bm.free()
    for p in o.data.polygons: p.use_smooth=True
    print(name,len(o.data.polygons)); return o
take(glove,'Gloves'); H=take(helmet,'Helmet')
# drop tiny loose islands
bm=bmesh.new(); bm.from_mesh(H.data); bm.faces.ensure_lookup_table(); seen=set(); isl=[]
for f in bm.faces:
    if f.index in seen: continue
    st=[f]; comp=[]; seen.add(f.index)
    while st:
        x=st.pop(); comp.append(x)
        for e in x.edges:
            for y in e.link_faces:
                if y.index not in seen: seen.add(y.index); st.append(y)
    isl.append(comp)
big=max(len(c) for c in isl); kill=[f for c in isl if len(c)<max(40,0.01*big) for f in c]
bmesh.ops.delete(bm,geom=kill,context='FACES'); bm.to_mesh(H.data); bm.free()
print('islands',len(isl),'killed faces',len(kill))
for o in list(bpy.data.objects):
    if o.name not in ('Gloves','Helmet'): bpy.data.objects.remove(o)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('gh_only.blend'))
