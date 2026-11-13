import bpy, os, numpy as np, bmesh
W=os.getcwd()
bpy.ops.wm.open_mainfile(filepath=f'{W}/rig_flicky_prepad.blend')
for n in ('Outline','NormSrc'):
    if n in bpy.data.objects: bpy.data.objects.remove(bpy.data.objects[n])
body=bpy.data.objects['Body']; me=body.data; rig=bpy.data.objects['Rig']
for mo in list(body.modifiers):
    if mo.type!='ARMATURE': body.modifiers.remove(mo)
fcls=np.load(f'{W}/cls.npy')
kz=rig.data.bones['Shin.L'].head_local.z
cz=np.array([p.center.z for p in me.polygons])
cx_=np.array([p.center.x for p in me.polygons]); cy_=np.array([p.center.y for p in me.polygons])
ax_=rig.data.bones['Shin.L'].head_local.x
reg=(cz<kz+0.16)&(cz>0.06)&(np.abs(cy_)<0.3)&(fcls!=7)
pad=reg&(np.isin(fcls,[5,6,8])|((cx_>ax_-0.015)&np.isin(fcls,[0,4,11])))
# a trouser texel (classmap says trousers there)
import cv2
cm=np.flipud(cv2.imread(f'{W}/classmap.png',cv2.IMREAD_UNCHANGED)); cm=cm if cm.ndim==2 else cm[...,0]
uvl=me.uv_layers.active.data
cand=[p.index for p in me.polygons if fcls[p.index]==4 and kz+0.2<p.center.z<kz+0.3 and p.center.x>0]
best=None
for i in cand:
    u,v=uvl[me.polygons[i].loop_indices[0]].uv; tx,ty=int(u*2047),int(v*2047)
    if (cm[max(ty-3,0):ty+4,max(tx-3,0):tx+4]==4).all(): best=(u,v); break
print('trouser uv',best,len(cand))
# 1. Pads object: copy of the pad faces
padsob=body.copy(); padsob.data=me.copy(); padsob.name='Pads'; bpy.context.scene.collection.objects.link(padsob)
bm=bmesh.new(); bm.from_mesh(padsob.data); bm.faces.ensure_lookup_table()
bmesh.ops.delete(bm,geom=[f for f in bm.faces if not pad[f.index]],context='FACES')
bm.normal_update()
for v in bm.verts: v.co+=v.normal*0.002
bm.to_mesh(padsob.data); bm.free()
# 2. leg underneath: trouser colour, ironed, pulled in
bm=bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table(); uv=bm.loops.layers.uv.active
pl=bm.faces.layers.int.new('ispad')
for f in bm.faces: f[pl]=int(pad[f.index])
bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=2e-4)
sk_basis=bm.verts.layers.shape.new('Basis'); sk=bm.verts.layers.shape.new('UnderPads'); cls_l=bm.faces.layers.int.new('cls')
for v in bm.verts: v[sk]=v.co.copy()
bm.faces.ensure_lookup_table()
padf=[f for f in bm.faces if f[pl]]
from mathutils import Vector
zbot_min=min(rig.data.bones['Shin.'+s_].tail_local.z for s_ in 'LR')+0.035
inner=set()
for sd in ('L','R'):
    K=rig.data.bones['Shin.'+sd].head_local.copy(); A=rig.data.bones['Shin.'+sd].tail_local.copy()
    ztop=kz+0.17; zbot=A.z+0.05
    sg=1 if sd=='L' else -1
    zr=ztop+0.03
    ref=[v.co.copy() for v in bm.verts if v.co.y*sg>0.01 and abs(v.co.z-zr)<0.01 and abs(v.co.y-K.y)<0.2]
    import statistics
    cx=(max(p.x for p in ref)+min(p.x for p in ref))/2; cy=(max(p.y for p in ref)+min(p.y for p in ref))/2
    rx=(max(p.x for p in ref)-min(p.x for p in ref))/2; ry=(max(p.y for p in ref)-min(p.y for p in ref))/2
    print(sd,'ring',round(cx,3),round(cy,3),round(rx,3),round(ry,3))
    zt2=ztop+0.06
    for v in bm.verts:
        if v.co.y*sg<0.005 or v.co.z>zt2 or v.co.z<zbot-0.03: continue
        if v.co.z<zbot+0.02 and not any(f[pl] for f in v.link_faces): continue
        u=max(0,min(1,(zr-v.co.z)/(zr-zbot)))
        c=Vector((cx,cy,0)).lerp(Vector((A.x,A.y,0)),u)
        d=Vector((v.co.x-c.x,v.co.y-c.y,0))
        if d.length<1e-6 or d.length>0.25: continue
        sc=1-0.08*min(1,u*4)-0.2*u
        ex,ey=rx*sc,ry*sc; dn=d.normalized()
        r=ex*ey/((ey*dn.x)**2+(ex*dn.y)**2)**0.5
        wt=1.0
        if v.co.z>zr: wt=max(0,1-(v.co.z-zr)/(zt2-zr))
        if v.co.z<zbot: wt=max(0,1-(zbot-v.co.z)/0.03)
        newp=Vector((c.x+dn.x*r,c.y+dn.y*r,v.co.z))
        v.co=v.co.lerp(newp,wt); inner.add(v)
for f in bm.faces:
    if f.calc_center_median().z<zbot_min: continue
    if f[pl] or all(v in inner for v in f.verts):
        for l in f.loops: l[uv].uv=best
for _ in range(8): bmesh.ops.smooth_vert(bm,verts=list(inner),factor=0.5,use_axis_x=True,use_axis_y=True,use_axis_z=False)
bm.normal_update()
print('pad faces',len(padf),'leg verts',len(inner))
# shape key for when pads are worn: lower leg pulled in under the pad shell
for v in bm.verts:
    v[sk_basis]=v.co.copy()
    if v not in inner: v[sk]=v.co.copy()
bm.verts.index_update(); under=[tuple(v[sk]) for v in bm.verts]
bm.to_mesh(me); bm.free(); me.update()
body.shape_key_add(name='Basis'); kk=body.shape_key_add(name='UnderPads')
for i,c in enumerate(under): kk.data[i].co=c
kk.value=0.0
print('shape keys ok')
print('pad faces',int(pad.sum()),'pulled',len(inner))
# outline hull + smooth normals for each
ol=bpy.data.materials['outline']
def finish(ob):
    for n2 in (ob.name+'_Outline',ob.name+'_NormSrc'):
        if n2 in bpy.data.objects: bpy.data.objects.remove(bpy.data.objects[n2])
    src=ob.copy(); src.data=ob.data.copy(); src.name=ob.name+'_NormSrc'; bpy.context.scene.collection.objects.link(src)
    for mo in list(src.modifiers):
        if mo.type!='ARMATURE': src.modifiers.remove(mo)
    b=bmesh.new(); b.from_mesh(src.data); bmesh.ops.remove_doubles(b,verts=b.verts,dist=2e-4); b.to_mesh(src.data); b.free()
    for p in src.data.polygons: p.use_smooth=True
    src.hide_render=True
    for p in ob.data.polygons: p.use_smooth=True
    dt=ob.modifiers.new('normfix','DATA_TRANSFER'); dt.object=src; dt.use_loop_data=True; dt.data_types_loops={'CUSTOM_NORMAL'}; dt.loop_mapping='NEAREST_POLYNOR'
    h=ob.copy(); h.data=ob.data.copy(); h.name=ob.name+'_Outline'; bpy.context.scene.collection.objects.link(h)
    for mo in list(h.modifiers):
        if mo.type!='ARMATURE': h.modifiers.remove(mo)
    b=bmesh.new(); b.from_mesh(h.data); bmesh.ops.remove_doubles(b,verts=b.verts,dist=2e-4); bmesh.ops.reverse_faces(b,faces=b.faces); b.to_mesh(h.data); b.free()
    h.data.materials.clear(); h.data.materials.append(ol)
    d=h.modifiers.new('outline','DISPLACE'); d.direction='NORMAL'; d.strength=-0.009; d.mid_level=0
    for a in ('visible_shadow','visible_diffuse','visible_glossy','visible_transmission','visible_volume_scatter'): setattr(h,a,False)
finish(body); finish(padsob)
# outline + normal source follow the body's UnderPads key
for n2 in ('Body_Outline','Body_NormSrc'):
    o2=bpy.data.objects[n2]; kb=o2.data.shape_keys.key_blocks['UnderPads']; kb.value=0
    fc=kb.driver_add('value'); dr=fc.driver; dr.type='AVERAGE'; var=dr.variables.new(); var.type='SINGLE_PROP'
    var.targets[0].id_type='KEY'; var.targets[0].id=body.data.shape_keys; var.targets[0].data_path='key_blocks["UnderPads"].value'
print([o.name for o in bpy.data.objects])
bpy.ops.wm.save_as_mainfile(filepath=f'{W}/rig_flicky.blend')
