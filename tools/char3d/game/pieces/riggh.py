import bpy, os, sys, numpy as np
from mathutils import kdtree
master,out=sys.argv[-2:]
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(master))
with bpy.data.libraries.load(os.path.abspath('gh_only.blend')) as (src,dst): dst.objects=['Gloves','Helmet']
rig=bpy.data.objects['Rig']; body=bpy.data.objects['Body']
bv=body.data.vertices; kd=kdtree.KDTree(len(bv))
for v in bv: kd.insert(v.co,v.index)
kd.balance(); gname={g.index:g.name for g in body.vertex_groups}
for o in dst.objects:
    bpy.context.scene.collection.objects.link(o); o.parent=rig; o.matrix_parent_inverse=rig.matrix_world.inverted()
    o.modifiers.clear(); m=o.modifiers.new('Armature','ARMATURE'); m.object=rig
    for g in list(o.vertex_groups): o.vertex_groups.remove(g)
    if o.name=='Helmet':
        g=o.vertex_groups.new(name='Head'); g.add(list(range(len(o.data.vertices))),1.0,'REPLACE'); continue
    # gloves: copy the hand/finger weights of the nearest skin (averaged over a few neighbours)
    for v in o.data.vertices:
        acc={}
        for co,i,d in kd.find_n(v.co,6):
            w=1/max(d,1e-4)
            for gg in bv[i].groups:
                acc[gname[gg.group]]=acc.get(gname[gg.group],0)+gg.weight*w
        tot=sum(acc.values())
        for n,w in acc.items():
            if w/tot<0.02: continue
            g=o.vertex_groups.get(n) or o.vertex_groups.new(name=n); g.add([v.index],w/tot,'REPLACE')
# hands shrink inside the gloves (shape key 'UnderGloves', on for batting)
import numpy as np
from mathutils import Vector
if not body.data.shape_keys: body.shape_key_add(name='Basis')
kb=body.shape_key_add(name='UnderGloves'); kb.value=0
gi={g.name:g.index for g in body.vertex_groups}
segs={}
for sd in 'LR':
    segs[sd]=[(rig.data.bones[f'Hand.{sd}'].head_local,rig.data.bones[f'Hand.{sd}'].tail_local),(rig.data.bones[f'Fingers.{sd}'].head_local,rig.data.bones[f'Fingers.{sd}'].tail_local)]
n=0
for v in body.data.vertices:
    w=sum(g.weight for g in v.groups if body.vertex_groups[g.group].name.split('.')[0] in ('Hand','Fingers'))
    if w<0.3: continue
    sd='L' if v.co.y>0 else 'R'; best=None
    for a,b in segs[sd]:
        ab=b-a; t=max(0,min(1,(v.co-a).dot(ab)/ab.length_squared)); p=a+ab*t
        if best is None or (v.co-p).length<(v.co-best).length: best=p
    kb.data[v.index].co=v.co.lerp(best,0.45*min(1,w)); n+=1
print('ok hand verts',n)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(out))

# skull tucks inside the helmet (shape key 'UnderHelmet', on for batting)
from mathutils.bvhtree import BVHTree
import bmesh
H=bpy.data.objects['Helmet']; bmh=bmesh.new(); bmh.from_mesh(H.data); hv=BVHTree.FromBMesh(bmh)
kh=body.shape_key_add(name='UnderHelmet',from_mix=False); kh.value=0
C=Vector((0,0,1.60)); hg=body.vertex_groups['Head'].index; n=0
for v in body.data.vertices:
    w=next((g.weight for g in v.groups if g.group==hg),0)
    if w<0.5 or v.co.z<1.45: continue
    if v.co.x>0.04 and v.co.z<1.70 and abs(v.co.y)<0.115: continue   # the face
    d=v.co-C; L=d.length; dn=d.normalized(); hit=hv.ray_cast(C,dn)
    if hit[0] is None: continue
    hd=(hit[0]-C).length
    if hd<L+0.008: kh.data[v.index].co=C+dn*max(0.02,hd-0.008); n+=1
print('ok skull verts',n)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(out))
