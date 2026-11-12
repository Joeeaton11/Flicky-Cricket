import bpy, numpy as np, os
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('base_mat2_pre.blend'))
ob=[o for o in bpy.data.objects if o.type=='MESH'][0]
dg=bpy.context.evaluated_depsgraph_get(); e=ob.evaluated_get(dg); me=e.to_mesh()
mw=np.array(ob.matrix_world)
V=np.array([v.co[:] for v in me.vertices]); V=(np.c_[V,np.ones(len(V))]@mw.T)[:,:3]
uv=me.uv_layers.active.data
T=np.array([p.vertices[:3] for p in me.polygons]); UV=np.array([[uv[li].uv[:] for li in p.loop_indices][:3] for p in me.polygons])
np.savez('meshw.npz',V=V,T=T,UV=UV); print('ok',V.min(0),V.max(0),len(T))
