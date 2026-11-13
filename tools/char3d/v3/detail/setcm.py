import bpy, os, sys, numpy as np
f=sys.argv[-1]; bpy.ops.wm.open_mainfile(filepath=os.path.abspath(f))
im=[i for i in bpy.data.images if 'classmap' in i.name][0]
from PIL import Image
a=np.array(Image.open('classmap.png')); a=a if a.ndim==2 else a[...,0]
a=np.flipud(a).astype(np.float32)/255; px=np.stack([a,a,a,np.ones_like(a)],-1)
im.pixels.foreach_set(px.ravel()); im.pack()
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(f)); print('ok',im.name,im.size[:])
