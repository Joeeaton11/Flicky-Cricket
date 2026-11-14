import bpy, os, math, mathutils
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('seam.blend'))
sc=bpy.context.scene
for o in list(bpy.data.objects):
    if o.type in ('CAMERA','LIGHT'): bpy.data.objects.remove(o)
sc.render.engine='CYCLES'; sc.cycles.samples=16; sc.cycles.device='CPU'; sc.render.resolution_x,sc.render.resolution_y=500,600; sc.render.film_transparent=True; sc.view_settings.view_transform='Standard'
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; w.node_tree.nodes['Background'].inputs[1].default_value=0.8
for name,r_,e in [('key',(50,0,115),2.2),('fill',(65,0,35),0.9)]:
    l=bpy.data.objects.new(name,bpy.data.lights.new(name,'SUN')); l.data.energy=e; l.rotation_euler=[math.radians(a) for a in r_]; sc.collection.objects.link(l)
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=2.6
rig=[o for o in bpy.data.objects if o.type=='ARMATURE'][0]
for f in [5,45,70,81,95,120]:
    sc.frame_set(f); hp=rig.matrix_world@rig.pose.bones['Hips'].head
    t=mathutils.Vector((hp.x,hp.y,1.0)); cam.location=t+mathutils.Vector((1.5,-5,0.3)); cam.rotation_euler=(t-cam.location).to_track_quat('-Z','Y').to_euler()
    sc.render.filepath=os.path.abspath(f'rf_{f:03d}.png'); bpy.ops.render.render(write_still=True)
