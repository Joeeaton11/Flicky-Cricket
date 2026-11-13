import bpy, os, numpy as np, sys
master=sys.argv[-2]; out=sys.argv[-1]
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(master))
with bpy.data.libraries.load(os.path.abspath('pads_only.blend')) as (src,dst): dst.objects=['Pads']
po=dst.objects[0]; bpy.context.scene.collection.objects.link(po)
rig=bpy.data.objects['Rig']; body=bpy.data.objects['Body']
po.parent=rig; po.matrix_parent_inverse=rig.matrix_world.inverted()
for sd in 'LR':
    for b in ('Shin','Thigh','Foot'): po.vertex_groups.new(name=f'{b}.{sd}')
kz=rig.data.bones['Shin.L'].head_local.z
# pull the pad shell in towards the shin (front and sides), straps at the back stay on the leg
import os as _o
TIGHT=float(_o.environ.get('TIGHT','0.12'))
for v in po.data.vertices:
    sd='L' if v.co.y>0 else 'R'; b=rig.data.bones['Shin.'+sd]; K,A=b.head_local,b.tail_local
    t=(K.z-v.co.z)/(K.z-A.z); ax=K+(A-K)*t
    dx,dy=v.co.x-ax.x,v.co.y-ax.y
    front=min(max((dx+0.01)/0.04,0),1)
    k=1-TIGHT*front
    v.co.x=ax.x+dx*k; v.co.y=ax.y+dy*(1-TIGHT*0.5*front)
for v in po.data.vertices:
    sd='L' if v.co.y>0 else 'R'
    th=0.0   # pads are rigid on the shin: the top never follows the thigh
    ft=0.55*min(max((0.175-v.co.z)/0.05,0),1)
    sh=1-th-ft
    po.vertex_groups[f'Shin.{sd}'].add([v.index],sh,'REPLACE')
    if th>0: po.vertex_groups[f'Thigh.{sd}'].add([v.index],th,'REPLACE')
    if ft>0: po.vertex_groups[f'Foot.{sd}'].add([v.index],ft,'REPLACE')
m=po.modifiers.new('Armature','ARMATURE'); m.object=rig
for p in po.data.polygons: p.use_smooth=True
print('ok knee',round(kz,3),len(po.data.vertices))
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(out))
