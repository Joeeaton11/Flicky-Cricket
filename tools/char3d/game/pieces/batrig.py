import bpy, numpy as np, os
xf=np.load('xf.npz'); R,s,t=xf['R'],float(xf['s']),xf['t']
from mathutils import Matrix
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='batter.glb')
o=[o for o in bpy.data.objects if o.type=='MESH'][0]
M=np.eye(4); M[:3,:3]=s*R; M[:3,3]=t
o.matrix_world=Matrix(M.tolist())@o.matrix_world
bpy.context.view_layer.objects.active=o; o.select_set(True); bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
for ob in list(bpy.data.objects):
    if ob!=o: bpy.data.objects.remove(ob)
o.name='Body'
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('batter_rigframe.blend')); print('ok')
