import bpy, os, sys
master,piece,name,out=sys.argv[-4:]
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(master))
with bpy.data.libraries.load(os.path.abspath(piece)) as (src,dst): dst.objects=[name]
o=dst.objects[0]; bpy.context.scene.collection.objects.link(o)
rig=bpy.data.objects['Rig']; o.parent=rig; o.matrix_parent_inverse=rig.matrix_world.inverted()
o.modifiers.clear(); m=o.modifiers.new('Armature','ARMATURE'); m.object=rig
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(out)); print('ok',name)
