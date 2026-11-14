import bpy, numpy as np, os, mathutils
SZ=float(os.environ.get('SZ','0.72')); SXY=float(os.environ.get('SXY','0.94'))
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('base_mat.blend'))
ob=[o for o in bpy.data.objects if o.type=='MESH'][0]; me=ob.data
co=np.array([ob.matrix_world @ v.co for v in me.vertices])
# brow line: top of the 'face_dark' faces (brows)
fd=[p for p in me.polygons if me.materials[p.material_index].name=='face_dark']
bz=max((ob.matrix_world @ p.center).z for p in fd)
top=co[:,2].max(); print('brow z',round(bz,3),'top',round(top,3),'cranium',round(top-bz,3))
headsel=co[:,2]>bz-0.02
cx,cy=np.median(co[headsel,0]),np.median(co[headsel,1])
z0=bz+0.005; blend=0.03
inv=ob.matrix_world.inverted()
for v,c in zip(me.vertices,co):
    if c[2]<=z0-blend: continue
    t=np.clip((c[2]-(z0-blend))/blend,0,1); t=t*t*(3-2*t)
    dz=max(c[2]-z0,0)
    nz=z0+dz*(1+(SZ-1)*t) if c[2]>z0 else c[2]
    # narrow the dome a little, more towards the top
    k=1+(SXY-1)*t*min(1,dz/max(top-z0,1e-6))
    q=mathutils.Vector((cx+(c[0]-cx)*k, cy+(c[1]-cy)*k, nz))
    v.co=inv@q
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('base_mat.blend'))
print('dome',SZ,SXY)
