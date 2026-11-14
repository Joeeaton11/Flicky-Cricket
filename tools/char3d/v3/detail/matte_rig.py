import bpy, os
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('rig_flicky.blend'))
for m in bpy.data.materials:
    if not m.use_nodes: continue
    for n in m.node_tree.nodes:
        if n.type=='BSDF_PRINCIPLED':
            n.inputs['Roughness'].default_value=0.72
            for k,v in (('Coat Weight',0.0),('Specular IOR Level',0.22),('Sheen Weight',0.15)):
                if k in n.inputs: n.inputs[k].default_value=v
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('rig_flicky.blend')); print('ok')
