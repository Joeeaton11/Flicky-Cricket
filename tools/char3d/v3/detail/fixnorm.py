import bpy, os, sys, bmesh
f=sys.argv[-1]; bpy.ops.wm.open_mainfile(filepath=os.path.abspath(f))
ob=[o for o in bpy.data.objects if o.type=='MESH' and o.name!='Outline' and 'flicky' in [m.name for m in o.data.materials if m]][0]
src=ob.copy(); src.data=ob.data.copy(); src.name='NormSrc'; bpy.context.scene.collection.objects.link(src)
for mo in list(src.modifiers):
    if mo.type!='ARMATURE': src.modifiers.remove(mo)
bm=bmesh.new(); bm.from_mesh(src.data); bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=2e-4); bm.to_mesh(src.data); bm.free()
for p in src.data.polygons: p.use_smooth=True
src.hide_render=True
for p in ob.data.polygons: p.use_smooth=True
dt=ob.modifiers.new('normfix','DATA_TRANSFER'); dt.object=src; dt.use_loop_data=True; dt.data_types_loops={'CUSTOM_NORMAL'}; dt.loop_mapping='NEAREST_POLYNOR'
# keep armature first
while ob.modifiers.find('normfix')>0 and ob.modifiers[0].type!='ARMATURE': break
print('ok',f,[m.type for m in ob.modifiers])
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(f))
