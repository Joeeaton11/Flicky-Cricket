import bpy, os, math, mathutils, json
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('gm_base.blend'))
avg=json.load(open('avg.json'))
sc=bpy.context.scene
for o in list(bpy.data.objects):
    if o.type in ('CAMERA','LIGHT'): bpy.data.objects.remove(o)
sc.render.engine='CYCLES'; sc.cycles.samples=40; sc.cycles.device='CPU'; sc.cycles.use_denoising=True
sc.render.resolution_x,sc.render.resolution_y=700,1300; sc.render.film_transparent=True; sc.view_settings.view_transform='Standard'
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; w.node_tree.nodes['Background'].inputs[1].default_value=0.6
for name,rot,e in [('key',(50,0,115),2.4),('fill',(65,0,35),0.5),('rim',(105,0,250),1.4)]:
    l=bpy.data.objects.new(name,bpy.data.lights.new(name,'SUN')); l.data.energy=e; l.rotation_euler=[math.radians(a) for a in rot]; sc.collection.objects.link(l)
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=1.95
a=math.radians(15); cam.location=(5*math.cos(a),5*math.sin(a),0.92); cam.rotation_euler=(mathutils.Vector((0,0,0.92))-cam.location).to_track_quat('-Z','Y').to_euler()
N=bpy.data.materials['player'].node_tree.nodes
lin=lambda c: (c/255.0)**2.2
V=[('original',{}),
   ('whites',{'skin':(240,196,160),'hair':(200,155,85),'brows':(150,110,60),'shirt':(235,232,222),'trousers':(232,224,200)}),
   ('dark',{'skin':(115,70,45),'hair':(22,18,16),'brows':(22,18,16),'shirt':(170,32,38),'trousers':(235,235,235)}),
   ('red',{'skin':(205,140,105),'hair':(165,70,30),'brows':(140,65,30),'shirt':(20,110,70),'trousers':(40,45,70)})]
for nm,t in V:
    for n in N:
        if n.name=='tint_skin': n.outputs[0].default_value=(1,1,1,1)
        elif n.name.startswith('tint_'): k=n.name[5:]; n.outputs[0].default_value=(*[x**2.2 for x in avg[k]],1)
    for k,c in t.items():
        av=avg[k]
        if k=='skin': N['tint_'+k].outputs[0].default_value=(*[lin(c[i])/max(av[i]**2.2,1e-3) for i in range(3)],1)
        else: N['tint_'+k].outputs[0].default_value=(*[lin(c[i]) for i in range(3)],1)
    sc.render.filepath=os.path.abspath(f'var_{nm}.png'); bpy.ops.render.render(write_still=True)
print('ok')
