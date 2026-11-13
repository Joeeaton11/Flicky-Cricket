import bpy, os, numpy as np, sys
master=sys.argv[-2]; out=sys.argv[-1]
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(master))
with bpy.data.libraries.load(os.path.abspath('pads_only.blend')) as (src,dst): dst.objects=['Pads']
po=dst.objects[0]; bpy.context.scene.collection.objects.link(po)
rig=bpy.data.objects['Rig']; body=bpy.data.objects['Body']
po.parent=rig; po.matrix_parent_inverse=rig.matrix_world.inverted()
for sd in 'LR':
    for b in ('Shin','Thigh'): po.vertex_groups.new(name=f'{b}.{sd}')
kz=rig.data.bones['Shin.L'].head_local.z
for v in po.data.vertices:
    sd='L' if v.co.y>0 else 'R'
    f=1-0.6*min(max((v.co.z-kz)/0.12,0),1)
    po.vertex_groups[f'Shin.{sd}'].add([v.index],f,'REPLACE')
    if f<1: po.vertex_groups[f'Thigh.{sd}'].add([v.index],1-f,'REPLACE')
m=po.modifiers.new('Armature','ARMATURE'); m.object=rig
for p in po.data.polygons: p.use_smooth=True
print('ok knee',round(kz,3),len(po.data.vertices))
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(out))
