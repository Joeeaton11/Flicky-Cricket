import bpy, os, math, numpy as np
from mathutils import Vector, kdtree
W=os.getcwd()
bpy.ops.wm.open_mainfile(filepath=f'{W}/base_det.blend')
body=[o for o in bpy.data.objects if o.type=='MESH'][0]; body.name='Body'
for o in list(bpy.data.objects):
    if o.type!='MESH': bpy.data.objects.remove(o)
# face +X, his left +Y, 1.8 m, feet on the ground
bpy.context.view_layer.objects.active=body; body.select_set(True)
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True); body.select_set(False)
from mathutils import Matrix
body.data.transform(Matrix.Rotation(math.radians(90),4,'Z')); body.data.update()
bpy.context.view_layer.update()
co=np.array([body.matrix_world@v.co for v in body.data.vertices]); s=1.8/np.ptp(co[:,2])
body.scale=[c*s for c in body.scale]; bpy.context.view_layer.update()
co=np.array([body.matrix_world@v.co for v in body.data.vertices]); body.location.z-=co[:,2].min(); body.location.x-=np.median(co[:,0]); body.location.y-=np.median(co[:,1])
bpy.context.view_layer.objects.active=body; body.select_set(True)
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True); bpy.ops.object.select_all(action='DESELECT')
me=body.data; co=np.array([v.co[:] for v in me.vertices]); X,Y,Z=co.T
cent=np.array([p.center[:] for p in me.polygons]); fcls=np.load(f'{W}/cls.npy')
def c_of(k): return cent[fcls==k]
print('ranges X',X.min().round(3),X.max().round(3),'Y',Y.min().round(3),Y.max().round(3),'Z',Z.max().round(3)); nf=len(me.polygons); print('faces',nf,len(fcls))
# crotch: lowest z where the centre column (|y|<0.02) has mesh
crotch=min(z for z in np.arange(0.5,1.2,0.005) if ((np.abs(Y)<0.02)&(np.abs(Z-z)<0.004)).sum()>3)
# neck: narrowest in y between 75% and 86% height
best=None
for z in np.arange(1.30,1.58,0.004):
    sel=(np.abs(Z-z)<0.004)&(np.abs(Y)<0.2)
    if sel.sum()<8: continue
    w=np.ptp(Y[sel])
    if best is None or w<best[0]: best=(w,z)
neck=best[1]; top=Z.max()
# shoulders height: top of the arm cluster
wb=c_of(9); wl=wb[wb[:,1]>0].mean(0)   # left wrist (band centre)
shoe=c_of(7); ankle_z=np.percentile(shoe[:,2],95)
armL=co[(Y>0.20)&(Z>0.75)&(Z<neck)]
sh_z=np.percentile(armL[:,2],97)-0.05
torso_half=np.percentile(np.abs(Y[(np.abs(Z-(neck-0.15))<0.01)]),90)
shoulderL=np.array([np.median(armL[np.abs(armL[:,1]-torso_half)<0.03,0]), torso_half-0.02, sh_z])
handend=armL[np.argmin(armL[:,2])]
elbow=(shoulderL+wl)/2; elbow[0]-=0.015
fing=wl+(handend-wl)*0.45
# legs
def leg_c(z,side):
    sel=(np.abs(Z-z)<0.006)&(Y*side>0.02); return np.array([np.median(X[sel]),np.median(Y[sel]),z])
hipL=np.array([0.0,0.095,crotch+0.06])
kneeL=leg_c(crotch*0.53,1); ankL=leg_c(ankle_z,1)
toeL=np.array([X[(Y>0.02)&(Z<0.05)].max()*0.98, ankL[1], 0.03]); ballL=np.array([ankL[0]+(toeL[0]-ankL[0])*0.62, ankL[1], 0.035])
print('crotch',round(crotch,3),'neck',round(neck,3),'top',round(top,3),'shoulder',shoulderL.round(3),'wrist',wl.round(3),'knee',kneeL.round(3),'ankle',ankL.round(3))
hz=crotch+0.10; sp=[hz+(neck-0.06-hz)*f for f in (0,0.33,0.66,1.0)]
C={'Hips':((0,0,crotch+0.06),(0,0,hz)),'Spine':((0,0,hz),(0,0,sp[1])),'Spine1':((0,0,sp[1]),(0,0,sp[2])),'Spine2':((0,0,sp[2]),(0,0,neck-0.06)),
   'Neck':((0,0,neck-0.06),(0,0,neck+0.03)),'Head':((0,0,neck+0.03),(0,0,top))}
S={'Shoulder':((0,0.04,neck-0.09),tuple(shoulderL),'Spine2'),'UpperArm':(tuple(shoulderL),tuple(elbow),'Shoulder'),'ForeArm':(tuple(elbow),tuple(wl),'UpperArm'),
   'Hand':(tuple(wl),tuple(fing),'ForeArm'),'Fingers':(tuple(fing),tuple(handend),'Hand'),
   'Thigh':(tuple(hipL),tuple(kneeL),'Hips'),'Shin':(tuple(kneeL),tuple(ankL),'Thigh'),'Foot':(tuple(ankL),tuple(ballL),'Shin'),'Toe':(tuple(ballL),tuple(toeL),'Foot')}
src=open(os.environ.get('RIGPY')).read()
a=src.index("arm = bpy.data.armatures.new('Rig')"); b=src.index("bpy.ops.wm.save_as_mainfile")
exec(src[a:b])
bpy.ops.wm.save_as_mainfile(filepath=f'{W}/rig_flicky.blend')
