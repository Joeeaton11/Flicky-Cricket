import bpy, os, numpy as np
W=os.getcwd()
for clip in os.environ['CLIPS'].split():
    bpy.ops.wm.read_factory_settings(use_empty=True); bpy.context.scene.render.fps=30; bpy.ops.import_scene.gltf(filepath=f'{W}/{clip}.glb')
    sc=bpy.context.scene
    body=[o for o in bpy.data.objects if o.type=='MESH' and len(o.data.vertices)>20000][0]
    worst=(9,None,None)
    for f in range(0, 61 if clip!='seam' else 135, 1):
        sc.frame_set(f); ev=body.evaluated_get(bpy.context.evaluated_depsgraph_get())
        V=np.array([ev.matrix_world@v.co for v in ev.data.vertices])
        # ignore the soles (shoes are meant to touch): look at points above 4cm in rest = everything except feet
        z=V[:,2]
        if z.min()<worst[0]: worst=(z.min(), f, V[z.argmin()].round(2))
        if f%10==0: print(clip,'f',f,'lowest',round(z.min(),3))
    print(clip,'LOWEST',round(worst[0],3),'at frame',worst[1],worst[2])
