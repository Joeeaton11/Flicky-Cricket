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
pad=np.isin(fcls,[5,6,8])&(cz<kz+0.16)&(cz>0.06)
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
bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=2e-4); bm.faces.ensure_lookup_table()
padf=[f for f in bm.faces if f[pl]]
from mathutils import Vector
cls_l=bm.faces.layers.int.new('cls'); zbot_min=min(rig.data.bones['Shin.'+s_].tail_local.z for s_ in 'LR')+0.035
inner=set()
for sd in ('L','R'):
    K=rig.data.bones['Shin.'+sd].head_local.copy(); A=rig.data.bones['Shin.'+sd].tail_local.copy()
    ztop=kz+0.17; zbot=A.z+0.05
    sg=1 if sd=='L' else -1
    # trouser radius just above the pad top
    ref=[v for v in bm.verts if v.co.y*sg>0.01 and abs(v.co.z-(ztop+0.03))<0.012]
    ax=K+(A-K)*((K.z-(ztop+0.03))/(K.z-A.z))
    def rad(v,p0):
        d=v.co-p0; d.z=0; return d.length
    r_top=sorted(rad(v,K+(A-K)*((K.z-v.co.z)/(K.z-A.z))) for v in ref)[len(ref)//2] if ref else 0.07
    r_top*=0.88; r_bot=r_top*0.6
    print(sd,'r_top',round(r_top,3))
    for v in bm.verts:
        if v.co.y*sg<0.005 or v.co.z>ztop+0.04 or v.co.z<zbot-0.03: continue
        if v.co.z<zbot+0.02 and not any(f[pl] for f in v.link_faces): continue
        t=(K.z-v.co.z)/(K.z-A.z); p0=K+(A-K)*t
        d=v.co-p0; d.z=0
        if d.length<1e-6 or d.length>0.22: continue
        r=r_top+(r_bot-r_top)*max(0,min(1,(ztop-v.co.z)/(ztop-zbot)))
        wt=1.0
        if v.co.z>ztop: wt=max(0,1-(v.co.z-ztop)/0.04)
        if v.co.z<zbot: wt=max(0,1-(zbot-v.co.z)/0.03)
        newp=p0+d.normalized()*r; newp.z=v.co.z
        v.co=v.co.lerp(newp,wt); inner.add(v)
for f in bm.faces:
    if f.calc_center_median().z<zbot_min: continue
    if f[pl] or all(v in inner for v in f.verts):
        for l in f.loops: l[uv].uv=best
for _ in range(4): bmesh.ops.smooth_vert(bm,verts=list(inner),factor=0.4,use_axis_x=True,use_axis_y=True,use_axis_z=False)
bm.normal_update()
print('pad faces',len(padf),'leg verts',len(inner))
bm.to_mesh(me); bm.free(); me.update()
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
print([o.name for o in bpy.data.objects])
bpy.ops.wm.save_as_mainfile(filepath=f'{W}/rig_flicky.blend')
