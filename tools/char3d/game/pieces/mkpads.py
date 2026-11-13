import bpy, numpy as np, os, bmesh
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('batter_rigframe.blend'))
src=bpy.data.objects['Body']; me=src.data
img=[n for n in me.materials[0].node_tree.nodes if n.type=='TEX_IMAGE'][0].image
W=img.size[0]; px=np.array(img.pixels[:],dtype=np.float32).reshape(W,W,4)
uv=me.uv_layers.active.data
cols=[]; cen=[]
for p in me.polygons:
    u=np.mean([uv[li].uv[:] for li in p.loop_indices],0); cols.append(px[int(u[1]*(W-1)),int(u[0]*(W-1)),:3]); cen.append(p.center[:])
cols=np.array(cols); cen=np.array(cen); lum=cols.mean(1); sat=cols.max(1)-cols.min(1)
z=cen[:,2]; ay=np.abs(cen[:,1])
white=(lum>0.6)&(sat<0.14)&(z>0.115)&(z<0.74)&(ay<0.3)
strap=(lum>0.42)&(lum<=0.6)&(sat<0.09)&(z>0.15)&(z<0.62)&(ay<0.3)
pad=white|strap
# grow by one ring of faces sharing verts with >=2 pad neighbours to close gaps
bm=bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table()
for _ in range(2):
    add=[]
    for f in bm.faces:
        if pad[f.index]: continue
        if not (0.115<f.calc_center_median().z<0.74): continue
        n=sum(1 for e in f.edges for g in e.link_faces if g is not f and pad[g.index])
        if n>=2: add.append(f.index)
    pad[add]=True
bmesh.ops.delete(bm,geom=[f for f in bm.faces if not pad[f.index]],context='FACES')
bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=1e-5)
# drop loose bits that belong to the shoes (laces, tongue): small parts low down
bm.faces.ensure_lookup_table(); seen=set(); parts=[]
for f in bm.faces:
    if f.index in seen: continue
    st=[f]; seen.add(f.index); comp=[]
    while st:
        a=st.pop(); comp.append(a)
        for e in a.edges:
            for g in e.link_faces:
                if g.index not in seen: seen.add(g.index); st.append(g)
    parts.append(comp)
parts.sort(key=len,reverse=True)
drop=[]
for comp in parts:
    zc=sum(f.calc_center_median().z for f in comp)/len(comp)
    if len(comp)<400 and zc<0.2: drop+=comp
    elif len(comp)<40: drop+=comp
print('parts',[len(c) for c in parts[:8]],'dropped faces',len(drop))
bmesh.ops.delete(bm,geom=drop,context='FACES')
# and any remaining shoe faces: white, very low, in front of the shin
lo=[f for f in bm.faces if f.calc_center_median().z<0.165]
bmesh.ops.delete(bm,geom=lo,context='FACES'); print('low front faces removed',len(lo))
bm.normal_update()
for v in bm.verts: v.co+=v.normal*0.003
nb=bpy.data.meshes.new('Pads'); bm.to_mesh(nb); bm.free()
nb.materials.append(me.materials[0])
po=bpy.data.objects.new('Pads',nb); bpy.context.scene.collection.objects.link(po)
print('pad faces',pad.sum(),'white',white.sum(),'strap',strap.sum())
# bring into the bald master, rig to the shins
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('pads_only.blend'))
