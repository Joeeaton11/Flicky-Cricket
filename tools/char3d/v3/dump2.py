import bpy, numpy as np, os
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=os.path.abspath('meshyA.glb'))
ob=[o for o in bpy.data.objects if o.type=='MESH'][0]; me=ob.data; M=ob.matrix_world; Mn=M.to_3x3().inverted().transposed()
uv=me.uv_layers.active.data
V=np.array([M@v.co for v in me.vertices]); Nv=np.array([(Mn@v.normal).normalized() for v in me.vertices])
T=np.array([[me.loops[li].vertex_index for li in p.loop_indices] for p in me.polygons]); UV=np.array([[uv[li].uv[:] for li in p.loop_indices] for p in me.polygons])
img=[n for n in me.materials[0].node_tree.nodes if n.type=='TEX_IMAGE'][0].image
W,H=img.size; px=np.array(img.pixels[:],dtype=np.float32).reshape(H,W,4)
np.savez('mesh2.npz',V=V,N=Nv,T=T,UV=UV,tex=px)
print(V.shape,T.shape,W,H,img.colorspace_settings.name)
