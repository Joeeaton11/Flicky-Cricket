import bpy, os, numpy as np
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('base_mat2_pre.blend'))
m=bpy.data.materials['flicky']
tn=[n for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and 'classmap' not in n.image.name][0]
t=np.load('tex_det.npy'); S=t.shape[0]
img=bpy.data.images.new('tex_det',S,S,alpha=True); img.colorspace_settings.name=tn.image.colorspace_settings.name
img.pixels.foreach_set(t.ravel()); img.pack(); tn.image=img
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('base_det.blend')); print('ok',tn.image.name)
