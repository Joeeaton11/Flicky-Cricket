import bpy, os, math, mathutils, json
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('base_mat.blend'))
ob=[o for o in bpy.data.objects if o.type=='MESH'][0]
def setc(name,c):
    m=bpy.data.materials.get(name); n=m.node_tree.nodes.get('tint'); n.outputs[0].default_value=(c[0]**2.2,c[1]**2.2,c[2]**2.2,1)
NAVY=(0.11,0.18,0.42)
V=[dict(),
   dict(skin=(0.42,0.25,0.15),shirt=(0.55,0.09,0.13),straps=(0.55,0.09,0.13),wristband=(0.55,0.09,0.13),trousers=(0.96,0.96,0.94),shoe_stripe=(0.55,0.09,0.13)),
   dict(skin=(0.72,0.46,0.31),shirt=(0.10,0.45,0.22),straps=(0.10,0.45,0.22),wristband=(0.10,0.45,0.22),trim=(0.93,0.89,0.76),shoe_stripe=(0.10,0.45,0.22)),
   dict(skin=(0.97,0.79,0.68),shirt=(0.16,0.33,0.80),trim=(0.85,0.15,0.15),straps=(0.85,0.15,0.15),wristband=(0.85,0.15,0.15),trousers=(0.16,0.20,0.32),shoe_stripe=(0.85,0.15,0.15))]
sc=bpy.context.scene; sc.render.engine='CYCLES'; sc.cycles.samples=32; sc.cycles.device='CPU'; sc.cycles.use_denoising=False
sc.render.resolution_x,sc.render.resolution_y=420,800; sc.render.film_transparent=True; sc.view_settings.view_transform='Standard'
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; w.node_tree.nodes['Background'].inputs[0].default_value=(1,.97,.93,1); w.node_tree.nodes['Background'].inputs[1].default_value=0.8
for name,rot,e,col in [('key',(50,0,25),2.2,(1,.95,.88)),('fill',(65,0,-55),0.9,(.85,.9,1)),('rim',(105,0,180),1.6,(1,1,1))]:
    l=bpy.data.objects.new(name,bpy.data.lights.new(name,'SUN')); l.data.energy=e; l.data.color=col; l.rotation_euler=[math.radians(a) for a in rot]; sc.collection.objects.link(l)
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=2.05
r=math.radians(20); cam.location=(5*math.sin(r),-5*math.cos(r),0.05); cam.rotation_euler=(mathutils.Vector((0,0,0.05))-cam.location).to_track_quat('-Z','Y').to_euler()
for i,v in enumerate(V):
    for k,c in v.items(): setc(k,c)
    sc.render.filepath=os.path.abspath(f'var_{i}.png'); bpy.ops.render.render(write_still=True)
    for k in v: pass
    # reset to defaults for next
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath('base_mat.blend')) if False else None
    for k in v: setc(k,{'skin':(0.92,0.62,0.48),'shirt':NAVY,'trim':(0.95,0.72,0.16),'trousers':(0.93,0.89,0.76),'straps':NAVY,'wristband':NAVY,'shoe_stripe':NAVY}[k])
print('done')
