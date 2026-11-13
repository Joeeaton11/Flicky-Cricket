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
helmet=(Z>1.43)&~(skin&face)&~(skin&(Z<1.52))&~eyes&~((X>0.05)&(Z<1.66)&(np.abs(Y)<0.1)&(lum>0.75))
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
take(glove,'Gloves'); take(helmet,'Helmet')
for o in list(bpy.data.objects):
    if o.name not in ('Gloves','Helmet'): bpy.data.objects.remove(o)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('gh_only.blend'))
