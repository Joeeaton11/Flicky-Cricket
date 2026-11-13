import bpy, sys
R='/home/claude/flicky-cricket/tools/mocap3d/'
bpy.ops.wm.open_mainfile(filepath=R+'rig_base.blend')
old={o.name:(o.type,len(o.data.vertices) if o.type=='MESH' else len(o.data.bones) if o.type=='ARMATURE' else 0) for o in bpy.data.objects}
ob=sorted(b.name for b in bpy.data.objects['Rig'].data.bones); print('OLD',old, bpy.context.scene.render.fps)
for tag,drop,ug in (('base',('Pads','Gloves','Helmet'),0),('batter',('Hair',),1)):
    bpy.ops.wm.open_mainfile(filepath='../pads/gm_batter.blend')
    for n in drop: bpy.data.objects.remove(bpy.data.objects[n])
    b=bpy.data.objects['Body']; kb=b.data.shape_keys.key_blocks; kb['UnderGloves'].value=ug; kb['UnderHelmet'].value=ug
    nb=sorted(x.name for x in bpy.data.objects['Rig'].data.bones); print(tag,'bones same',nb==ob,[o.name for o in bpy.data.objects], bpy.context.scene.render.fps)
    bpy.data.orphans_purge(do_recursive=True)
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=f'rig_{tag}.blend',compress=True)
