import bpy, os, sys, numpy as np
f=sys.argv[-1]; bpy.ops.wm.open_mainfile(filepath=os.path.abspath(f))
img=bpy.data.images['tex_det']; t=np.load('tex_sharp.npy'); img.pixels.foreach_set(t.ravel()); img.pack()
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(f)); print('ok',f)
