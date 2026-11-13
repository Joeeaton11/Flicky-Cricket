import bpy, os, math, mathutils, sys
f,yaw,out=sys.argv[-3],float(sys.argv[-2]),sys.argv[-1]
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(f))
for o in list(bpy.data.objects):
    if o.type in ('CAMERA','LIGHT'): bpy.data.objects.remove(o)
sc=bpy.context.scene; sc.render.engine='CYCLES'; sc.cycles.samples=48; sc.cycles.device='CPU'; sc.cycles.use_denoising=True
sc.render.resolution_x,sc.render.resolution_y=700,700; sc.render.film_transparent=True; sc.view_settings.view_transform='Standard'
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; w.node_tree.nodes['Background'].inputs[1].default_value=0.6
a0=math.radians(yaw)
for name,rot,e in [('key',(50,0,25),2.4),('fill',(65,0,-55),0.5),('rim',(105,0,160),1.4)]:
    l=bpy.data.objects.new(name,bpy.data.lights.new(name,'SUN')); l.data.energy=e; l.rotation_euler=(math.radians(rot[0]),0,math.radians(rot[2])+a0+math.radians(90)); sc.collection.objects.link(l)
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=0.42
t=mathutils.Vector((0,0,1.6)); cam.location=t+mathutils.Vector((3*math.cos(a0),3*math.sin(a0),0.15)); cam.rotation_euler=(t-cam.location).to_track_quat('-Z','Y').to_euler()
sc.render.filepath=os.path.abspath(out); bpy.ops.render.render(write_still=True)
