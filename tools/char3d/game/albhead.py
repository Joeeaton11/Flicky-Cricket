import bpy, os, math, mathutils, sys
f,yaw,out=sys.argv[-3],float(sys.argv[-2]),sys.argv[-1]
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(f))
m=bpy.data.materials['player']; N=m.node_tree.nodes; L=m.node_tree.links
bs=[n for n in N if n.type=='BSDF_PRINCIPLED'][0]; src=bs.inputs['Base Color'].links[0].from_socket
e=N.new('ShaderNodeEmission'); L.new(src,e.inputs[0]); L.new(e.outputs[0],[n for n in N if n.type=='OUTPUT_MATERIAL'][0].inputs[0])
for o in list(bpy.data.objects):
    if o.type in ('CAMERA','LIGHT'): bpy.data.objects.remove(o)
sc=bpy.context.scene; sc.render.engine='CYCLES'; sc.cycles.samples=8; sc.render.resolution_x,sc.render.resolution_y=700,700; sc.view_settings.view_transform='Standard'
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; w.node_tree.nodes['Background'].inputs[1].default_value=0
a0=math.radians(yaw)
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=0.42
t=mathutils.Vector((0,0,1.6)); cam.location=t+mathutils.Vector((3*math.cos(a0),3*math.sin(a0),0.15)); cam.rotation_euler=(t-cam.location).to_track_quat('-Z','Y').to_euler()
sc.render.filepath=os.path.abspath(out); bpy.ops.render.render(write_still=True)
