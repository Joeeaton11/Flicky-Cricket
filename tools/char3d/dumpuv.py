import bpy, numpy as np, os
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('base_mat.blend'))
ob=[o for o in bpy.data.objects if o.type=='MESH'][0]; me=ob.data; uv=me.uv_layers.active.data
tris=np.array([[uv[li].uv[:] for li in p.loop_indices][:3] for p in me.polygons],dtype=np.float32)
cls=np.array([p.material_index-1 for p in me.polygons])
img=[n for n in me.materials[1].node_tree.nodes if n.type=='TEX_IMAGE'][0].image
W,H=img.size; px=np.array(img.pixels[:],dtype=np.float32).reshape(H,W,4)
np.save('uvtris.npy',tris); np.save('polycls.npy',cls); np.save('tex.npy',px)
print(len(tris),W,H,set(len(p.vertices) for p in me.polygons))
