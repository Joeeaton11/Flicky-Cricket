import bpy, os, math, mathutils, sys
f,pads,yaw,out=sys.argv[-4],sys.argv[-3]=='1',float(sys.argv[-2]),sys.argv[-1]
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(f))
for n in ('Pads','Pads_Outline'):
    if n in bpy.data.objects: bpy.data.objects[n].hide_render=not pads
for o in list(bpy.data.objects):
    if o.type in ('CAMERA','LIGHT'): bpy.data.objects.remove(o)
sc=bpy.context.scene; sc.render.engine='CYCLES'; sc.cycles.samples=48; sc.cycles.device='CPU'; sc.cycles.use_denoising=True
sc.render.resolution_x,sc.render.resolution_y=900,1500; sc.render.film_transparent=True; sc.view_settings.view_transform='Standard'; sc.view_settings.exposure=-0.15
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; w.node_tree.nodes['Background'].inputs[0].default_value=(1,.97,.93,1); w.node_tree.nodes['Background'].inputs[1].default_value=0.5
a0=math.radians(yaw)
for name,rot,e,col in [('key',(50,0,25),2.4,(1,.95,.88)),('fill',(65,0,-55),0.45,(.85,.9,1)),('rim',(105,0,160),1.6,(1,1,1))]:
    l=bpy.data.objects.new(name,bpy.data.lights.new(name,'SUN')); l.data.energy=e; l.data.color=col; l.rotation_euler=(math.radians(rot[0]),0,math.radians(rot[2])+a0+math.radians(90)); sc.collection.objects.link(l)
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=2.0
cam.location=(5*math.cos(a0),5*math.sin(a0),0.92); cam.rotation_euler=(mathutils.Vector((0,0,0.92))-cam.location).to_track_quat('-Z','Y').to_euler()
sc.render.filepath=os.path.abspath(out); bpy.ops.render.render(write_still=True)
