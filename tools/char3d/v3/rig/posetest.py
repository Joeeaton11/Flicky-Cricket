import bpy, os, math, mathutils
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('rig_flicky.blend'))
rig=bpy.data.objects['Rig']; pb=rig.pose.bones
def rot(n,x=0,y=0,z=0):
    b=pb[n]; b.rotation_mode='XYZ'; b.rotation_euler=(math.radians(x),math.radians(y),math.radians(z))
POSES={
 'rest':{},
 'stance':{'Spine':(0,0,-10),'Spine1':(0,10,0),'Thigh.L':(0,0,0),'Thigh.R':(0,0,0),'Shin.L':(-25,0,0),'Shin.R':(-25,0,0),'Thigh.L':(20,0,0),'Thigh.R':(20,0,0),
           'UpperArm.L':(0,0,-40),'UpperArm.R':(0,0,40),'ForeArm.L':(0,0,-70),'ForeArm.R':(0,0,70),'Head':(0,0,-20)},
 'cheer':{'UpperArm.L':(0,0,110),'UpperArm.R':(0,0,-110),'ForeArm.L':(0,0,30),'ForeArm.R':(0,0,-30),'Spine1':(0,-8,0)},
}
sc=bpy.context.scene; sc.render.engine='CYCLES'; sc.cycles.samples=16; sc.cycles.device='CPU'; sc.render.resolution_x,sc.render.resolution_y=420,700; sc.render.film_transparent=True; sc.view_settings.view_transform='Standard'
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True; w.node_tree.nodes['Background'].inputs[1].default_value=0.8
for name,r_,e in [('key',(50,0,115),2.2),('fill',(65,0,35),0.9),('rim',(105,0,270),1.4)]:
    l=bpy.data.objects.new(name,bpy.data.lights.new(name,'SUN')); l.data.energy=e; l.rotation_euler=[math.radians(a) for a in r_]; sc.collection.objects.link(l)
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera=cam; cam.data.type='ORTHO'; cam.data.ortho_scale=2.1
for nm,P in POSES.items():
    for b in pb: b.rotation_mode='XYZ'; b.rotation_euler=(0,0,0)
    for k,v in P.items(): rot(k,*v)
    bpy.context.view_layer.update()
    a=math.radians(25); cam.location=(5*math.cos(a),5*math.sin(a),0.95); cam.rotation_euler=(mathutils.Vector((0,0,0.95))-cam.location).to_track_quat('-Z','Y').to_euler()
    sc.render.filepath=os.path.abspath(f'pose_{nm}.png'); bpy.ops.render.render(write_still=True)
print('done')
