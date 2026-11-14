import bpy, os, sys
from mathutils import Vector
from mathutils.bvhtree import BVHTree
f=sys.argv[-2]; out=sys.argv[-1]
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(f))
body=bpy.data.objects['Body']; h=bpy.data.objects['Hair']
dg=bpy.context.evaluated_depsgraph_get(); bvh=BVHTree.FromObject(body.evaluated_get(dg),dg)
C=Vector((0,0,1.6)); n=0
for v in h.data.vertices:
    d=v.co-C
    if v.co.z<1.45 or v.co.x>0.04: continue
    dn=d.normalized(); o=C.copy(); far=None
    for _ in range(8):
        hit=bvh.ray_cast(o,dn,0.4)
        if hit[0] is None: break
        far=hit[0]; o=hit[0]+dn*1e-4
    if far is None: continue
    rb=(far-C).length
    if d.length<rb+0.004: v.co=C+dn*(rb+0.004); n+=1
h.data.update(); print('hair verts lifted',n)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(out))
