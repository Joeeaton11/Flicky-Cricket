import bpy, os, math, mathutils, numpy as np
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('gm_base.blend'))
pal=np.array([(255,0,255),(240,150,90),(90,50,20),(200,0,0),(255,255,255),(0,0,0),(40,60,160),(255,255,0),(120,120,120),(0,220,0),(0,120,120)]+[(0,0,0)]*245,np.float32)/255
from PIL import Image
cl=np.array(Image.open('classmap.png')); rgb=pal[np.flipud(cl)]
img=bpy.data.images.new('clsview',cl.shape[1],cl.shape[0]); img.pixels.foreach_set(np.dstack([rgb,np.ones(cl.shape)]).astype(np.float32).ravel())
m=bpy.data.materials['player']; N=m.node_tree.nodes; L=m.node_tree.links
t=N.new('ShaderNodeTexImage'); t.image=img; t.interpolation='Closest'; e=N.new('ShaderNodeEmission'); L.new(t.outputs[0],e.inputs[0])
L.new(e.outputs[0],[n for n in N if n.type=='OUTPUT_MATERIAL'][0].inputs[0])
sc=bpy.context.scene
for o in list(bpy.data.objects):
    if o.type in ('CAMERA','LIGHT'): bpy.data.objects.remove(o)
sc.render.engine='CYCLES'; sc.cycles.samples=4; sc.render.resolution_x,sc.render.resolution_y=700,1300; sc.view_settings.view_transform='Standard'
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=1.95
for nm,a in (('f',15),('b',200)):
    a=math.radians(a); cam.location=(5*math.cos(a),5*math.sin(a),0.92); cam.rotation_euler=(mathutils.Vector((0,0,0.92))-cam.location).to_track_quat('-Z','Y').to_euler()
    sc.render.filepath=os.path.abspath(f'cls_{nm}.png'); bpy.ops.render.render(write_still=True)
