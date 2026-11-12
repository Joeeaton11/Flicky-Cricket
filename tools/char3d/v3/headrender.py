import bpy, os, math, mathutils, sys
yaws=[int(a) for a in os.environ.get('YAWS','0').split(',')]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath('meshyA.glb'))
sc=bpy.context.scene; sc.render.engine='CYCLES'; sc.cycles.samples=8; sc.cycles.device='CPU'
sc.render.resolution_x=sc.render.resolution_y=1024; sc.render.film_transparent=True; sc.view_settings.view_transform='Standard'
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; w.node_tree.nodes['Background'].inputs[1].default_value=3.5
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=0.5
C=mathutils.Vector((0,0,0.74))
for a in yaws:
    r=math.radians(a); cam.location=C+mathutils.Vector((3*math.sin(r),-3*math.cos(r),0)); cam.rotation_euler=(C-cam.location).to_track_quat('-Z','Y').to_euler()
    sc.render.filepath=os.path.abspath(f'hy_{a}.png'); bpy.ops.render.render(write_still=True)
