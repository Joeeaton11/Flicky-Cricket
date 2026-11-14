import bpy, numpy as np, os
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='base.glb')
o=[o for o in bpy.data.objects if o.type=='MESH'][0]; mw=np.array(o.matrix_world)
A=np.array([v.co[:] for v in o.data.vertices]); A=(np.c_[A,np.ones(len(A))]@mw.T)[:,:3]
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('../gm/rig_base.blend'))
B=np.array([v.co[:] for v in bpy.data.objects['Body'].data.vertices]); B=(np.c_[B,np.ones(len(B))]@np.array(bpy.data.objects['Body'].matrix_world).T)[:,:3]
print(len(A),len(B))
# similarity transform A->B (Umeyama)
ma,mb=A.mean(0),B.mean(0); Ac,Bc=A-ma,B-mb
U,S,Vt=np.linalg.svd(Bc.T@Ac/len(A)); D=np.eye(3); D[2,2]=np.sign(np.linalg.det(U@Vt))
R=U@D@Vt; s=np.trace(np.diag(S)@D)/Ac.var(0).sum(); t=mb-s*R@ma
err=np.linalg.norm((s*(R@A.T)).T+t-B,axis=1)
print('scale',s,'err max',err.max(),'R',R.round(3))
np.savez('xf.npz',R=R,s=s,t=t)
