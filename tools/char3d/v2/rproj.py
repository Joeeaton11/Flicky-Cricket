import bpy, numpy as np, os, math, mathutils, sys
src=sys.argv[-2]; out=sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath('meshy2.glb'))
ob=[o for o in bpy.data.objects if o.type=='MESH'][0]
img=[n for n in ob.data.materials[0].node_tree.nodes if n.type=='TEX_IMAGE'][0].image
if src!='none': img.pixels[:]=np.load(src).ravel()
for m in bpy.data.materials:
    if not m.use_nodes: continue
    for n in m.node_tree.nodes:
        if n.type=='BSDF_PRINCIPLED':
            for k in ('Metallic','Roughness'):
                for l in list(n.inputs[k].links): m.node_tree.links.remove(l)
            n.inputs['Metallic'].default_value=0; n.inputs['Roughness'].default_value=0.42
sc=bpy.context.scene; sc.render.engine='CYCLES'; sc.cycles.samples=32; sc.cycles.device='CPU'; sc.cycles.use_denoising=False
sc.render.resolution_x,sc.render.resolution_y=500,900; sc.render.film_transparent=True; sc.view_settings.view_transform='Standard'
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; w.node_tree.nodes['Background'].inputs[0].default_value=(1,.97,.93,1); w.node_tree.nodes['Background'].inputs[1].default_value=0.8
for name,rot,e,col in [('key',(50,0,25),2.2,(1,.95,.88)),('fill',(65,0,-55),0.9,(.85,.9,1)),('rim',(105,0,180),0.8,(1,1,1))]:
    l=bpy.data.objects.new(name,bpy.data.lights.new(name,'SUN')); l.data.energy=e; l.data.color=col; l.rotation_euler=[math.radians(a) for a in rot]; sc.collection.objects.link(l)
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=2.05
for i,a in enumerate((15,0,40)):
    r=math.radians(a); cam.location=(5*math.sin(r),-5*math.cos(r),0.05); cam.rotation_euler=(mathutils.Vector((0,0,0.05))-cam.location).to_track_quat('-Z','Y').to_euler()
    sc.render.filepath=os.path.abspath(f'{out}_{i}.png'); bpy.ops.render.render(write_still=True)
