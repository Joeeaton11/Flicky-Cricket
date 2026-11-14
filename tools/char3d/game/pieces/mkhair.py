import bpy, os, numpy as np, bmesh
G='../gm/'
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(G+'gm_base.blend'))
body=bpy.data.objects['Body']; hairf=np.load(G+'hairf.npy')
h=body.copy(); h.data=body.data.copy(); h.name='Hair'; h.data.name='Hair'; bpy.context.scene.collection.objects.link(h)
m=bpy.data.materials['player']; m.name='player_hair'
bm=bmesh.new(); bm.from_mesh(h.data); bm.faces.ensure_lookup_table()
cls=np.load(G+'cls_tex2.npy'); S=cls.shape[0]; tex=np.load(G+'tex.npy')[...,:3]
d=np.load(G+'mesh.npz'); UV=d['UV']; C=d['V'][d['T']].mean(1)
pts=np.concatenate([UV,UV.mean(1,keepdims=True)],1)
yy=(pts[...,1]*(S-1)).astype(int); xx=(pts[...,0]*(S-1)).astype(int)
cs=tex[yy,xx]; lum=cs.mean(2); hairish=(lum<0.33)&(cs[...,0]>cs[...,2]+0.01)
anyhair=((cls[yy,xx]==2).sum(1)>=2)|(hairish.sum(1)>=3)
eye=(C[:,0]>0.06)&(C[:,2]<1.665)&(np.abs(C[:,1])<0.1)
keep=(hairf|anyhair)&(C[:,2]>1.475)&~eye
# fill pinholes: faces whose neighbours are mostly kept

# add the faces of the hair class that hairf missed (fringe edges), and grow one ring so the edge tucks onto the skin
bmesh.ops.delete(bm,geom=[f for f in bm.faces if not keep[f.index]],context='FACES')
bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=1e-4)
bm.normal_update()
for v in bm.verts: v.co+=v.normal*0.0015
bm.to_mesh(h.data); bm.free()
for p in h.data.polygons: p.use_smooth=True
# rigid on the head
for g in list(h.vertex_groups): h.vertex_groups.remove(g)
vg=h.vertex_groups.new(name='Head'); vg.add(list(range(len(h.data.vertices))),1.0,'REPLACE')
for o in list(bpy.data.objects):
    if o.name not in ('Hair',): bpy.data.objects.remove(o)
print('hair verts',len(h.data.vertices))
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('hair_only.blend'))
