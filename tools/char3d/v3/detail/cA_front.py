import bpy, os, math, mathutils, sys
f,out=sys.argv[-2],sys.argv[-1]
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(f))
for o in list(bpy.data.objects):
    if o.type in ('CAMERA','LIGHT'): bpy.data.objects.remove(o)
sc=bpy.context.scene; sc.render.engine='CYCLES'; sc.cycles.samples=64; sc.cycles.device='CPU'; sc.cycles.use_denoising=True
sc.render.resolution_x,sc.render.resolution_y=1300,1800; sc.render.film_transparent=True; sc.view_settings.view_transform='Standard'
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; w.node_tree.nodes['Background'].inputs[0].default_value=(1,.97,.93,1); w.node_tree.nodes['Background'].inputs[1].default_value=0.8
for name,rot,e,col in [('key',(50,0,25),2.2,(1,.95,.88)),('fill',(65,0,-55),0.9,(.85,.9,1)),('rim',(105,0,180),0.5,(1,1,1))]:
    l=bpy.data.objects.new(name,bpy.data.lights.new(name,'SUN')); l.data.energy=e; l.data.color=col; l.rotation_euler=[math.radians(a) for a in rot]; sc.collection.objects.link(l)
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=2.05
r=math.radians(0); cam.location=(5*math.sin(r),-5*math.cos(r),0.05); cam.rotation_euler=(mathutils.Vector((0,0,0.05))-cam.location).to_track_quat('-Z','Y').to_euler()

for m in bpy.data.materials:
    if not m.use_nodes: continue
    nt=m.node_tree; bs=[n for n in nt.nodes if n.type=='BSDF_PRINCIPLED']; oo=[n for n in nt.nodes if n.type=='OUTPUT_MATERIAL']
    if not bs or not oo: continue
    bs=bs[0]; em=nt.nodes.new('ShaderNodeEmission')
    lk=bs.inputs['Base Color'].links
    if lk: nt.links.new(lk[0].from_socket,em.inputs[0])
    else: em.inputs[0].default_value=bs.inputs['Base Color'].default_value
    nt.links.new(em.outputs[0],oo[0].inputs[0])
sc.world.node_tree.nodes['Background'].inputs[1].default_value=0
sc.cycles.samples=16; sc.cycles.use_denoising=False
sc.render.filepath=os.path.abspath(out); bpy.ops.render.render(write_still=True)
