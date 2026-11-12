import bpy, numpy as np, sys, os, colorsys
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath('meshy.glb'))
ob=[o for o in bpy.data.objects if o.type=='MESH'][0]; me=ob.data
mat=me.materials[0]; tex=None
for n in mat.node_tree.nodes:
    if n.type=='TEX_IMAGE' and n.image and ('base' in n.image.name.lower() or tex is None): tex=n.image
print('tex',tex.name,tex.size[:])
W,H=tex.size; px=np.array(tex.pixels[:]).reshape(H,W,4)
uv=me.uv_layers.active.data
cols=np.zeros((len(me.polygons),3)); cent=np.zeros((len(me.polygons),3))
for p in me.polygons:
    us=np.array([uv[li].uv[:] for li in p.loop_indices]); u=us.mean(0)
    samp=[]
    for w in (0.0,):
        x=int((u[0]%1)*(W-1)); y=int((u[1]%1)*(H-1)); samp.append(px[y,x,:3])
    # also corners pulled toward centre
    for c in us:
        q=u*0.6+c*0.4; samp.append(px[int((q[1]%1)*(H-1)),int((q[0]%1)*(W-1)),:3])
    cols[p.index]=np.median(samp,0); cent[p.index]=ob.matrix_world @ p.center
np.save('facecols.npy',cols); np.save('facecent.npy',cent)
print('faces',len(cols),'z range',cent[:,2].min(),cent[:,2].max())
