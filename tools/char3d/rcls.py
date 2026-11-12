import bpy, math, mathutils, os, sys
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('base_seg.blend'))
ob=[o for o in bpy.data.objects if o.type=='MESH'][0]
PAL={'unk':(1,0,1),'skin':(1,.6,.4),'shirt':(.1,.2,.8),'trim':(1,.8,0),'trousers':(.9,.9,.6),'pads':(1,1,1),'straps':(0,.6,.6),'shoes':(.6,.6,.6),'shoe_stripe':(1,0,0),'wristband':(0,1,0),'face_dark':(.1,.1,.1),'face_white':(.5,1,1)}
for m in ob.data.materials[1:]:
    m.use_nodes=True; nt=m.node_tree; nt.nodes.clear(); o=nt.nodes.new('ShaderNodeOutputMaterial'); e=nt.nodes.new('ShaderNodeEmission'); e.inputs[0].default_value=(*PAL.get(m.name,(1,0,1)),1); nt.links.new(e.outputs[0],o.inputs[0])
sc=bpy.context.scene; sc.render.engine='CYCLES'; sc.cycles.samples=4; sc.cycles.device='CPU'; sc.render.resolution_x,sc.render.resolution_y=400,800; sc.render.film_transparent=True; sc.view_settings.view_transform='Standard'
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=2.1
c=mathutils.Vector((0,0,0))
for i,a in enumerate((0,40,180)):
    r=math.radians(a); cam.location=(5*math.sin(r),-5*math.cos(r),0); cam.rotation_euler=(c-cam.location).to_track_quat('-Z','Y').to_euler()
    sc.render.filepath=os.path.abspath(f'cls_{i}.png'); bpy.ops.render.render(write_still=True)
