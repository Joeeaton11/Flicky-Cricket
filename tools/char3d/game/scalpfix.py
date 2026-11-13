import bpy, os, numpy as np, bmesh
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('gm_bald.blend'))
ob=bpy.data.objects['Body']; me=ob.data
P=np.array([v.co[:] for v in me.vertices]); X,Y,Z=P.T; AY=np.abs(Y)
def ss(x,a,b): return np.clip((x-a)/(b-a),0,1)
top=ss(Z,1.6,1.635)*(1-(X>0.085)*(1-ss(Z,1.675,1.715)))
temple=(AY>0.05)*ss(X,-0.03,0.0)*(1-ss(X,0.12,0.14))*ss(Z,1.585,1.615)*(1-ss(Z,1.72,1.74))*0.9
nape=(1-ss(X,-0.04,-0.02))*ss(Z,1.455,1.5)*(1-ss(Z,1.62,1.65))*(1-ss(AY,0.12,0.14))
band=(1-ss(X,0.05,0.08))*ss(Z,1.5,1.54)*(1-ss(Z,1.67,1.70))
w=np.maximum.reduce([top,temple,nape,band])
ear=(AY>0.105)*ss(X,-0.07,-0.055)*(1-ss(X,0.03,0.045))*(1-ss(Z,1.655,1.675))
w=w*(1-ear)
# head copy -> voxel remesh -> smooth = clean outer skin
h=ob.copy(); h.data=me.copy(); h.name='HeadProxy'; bpy.context.scene.collection.objects.link(h)
h.modifiers.clear(); h.parent=None; h.matrix_world=ob.matrix_world.copy()
bm=bmesh.new(); bm.from_mesh(h.data); bmesh.ops.holes_fill(bm,edges=bm.edges,sides=0); bmesh.ops.delete(bm,geom=[v for v in bm.verts if v.co.z<1.0],context='VERTS'); bmesh.ops.holes_fill(bm,edges=bm.edges,sides=0); bm.to_mesh(h.data); bm.free()
r=h.modifiers.new('rm','REMESH'); r.mode='VOXEL'; r.voxel_size=0.007
sm=h.modifiers.new('sm','SMOOTH'); sm.factor=0.7; sm.iterations=70
bpy.context.view_layer.objects.active=h
for m in list(h.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)
from mathutils.bvhtree import BVHTree
from mathutils import Vector
dg=bpy.context.evaluated_depsgraph_get(); he=h.evaluated_get(dg)
bvh=BVHTree.FromObject(he,dg)
for i,wi in enumerate(w):
    if wi<=0.001: continue
    co=me.vertices[i].co; loc,n,idx,d=bvh.find_nearest(co)
    if loc is not None: me.vertices[i].co=co.lerp(loc,float(wi))
me.update(); bpy.data.objects.remove(h)
print('ok',int((w>0.01).sum()))
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('gm_bald2.blend'))
