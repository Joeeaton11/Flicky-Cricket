import bpy, numpy as np, os, sys, mathutils
S=float(os.environ.get('S','0.83'))
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('base_mat.blend'))
ob=[o for o in bpy.data.objects if o.type=='MESH'][0]; me=ob.data
co=np.array([ob.matrix_world @ v.co for v in me.vertices])
z=co[:,2]; zmin,zmax=z.min(),z.max(); H=zmax-zmin
# neck: narrowest |x| spread between 70% and 85% height, central verts only
best=None
for f in np.linspace(0.72,0.86,57):
    zz=zmin+f*H; sel=(np.abs(z-zz)<0.006)&(np.abs(co[:,0])<0.2)
    if sel.sum()<10: continue
    wdt=np.ptp(co[sel,0])
    if best is None or wdt<best[0]: best=(wdt,zz)
nz=best[1]; print('neck z',round(nz,3),'frac',round((nz-zmin)/H,3),'width',round(best[0],3))
piv=mathutils.Vector((float(np.median(co[np.abs(z-nz)<0.01,0])),float(np.median(co[np.abs(z-nz)<0.01,1])),nz))
blend=0.05
inv=ob.matrix_world.inverted()
for v,c in zip(me.vertices,co):
    t=np.clip((c[2]-(nz-blend))/blend,0,1); t=t*t*(3-2*t)
    if t<=0: continue
    s=1+(S-1)*t; p=mathutils.Vector(c); q=piv+(p-piv)*s
    v.co=inv@q
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('base_mat.blend'))
print('head scaled',S)
