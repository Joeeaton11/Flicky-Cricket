import bpy, numpy as np, os, sys, math, mathutils
from collections import Counter
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.abspath('meshy.glb'))
ob=[o for o in bpy.data.objects if o.type=='MESH'][0]; me=ob.data
cls=np.load('cls_raw.npy') if os.environ.get('RAW') else np.load('cls.npy')
# face adjacency via shared edges
ek={}
for p in me.polygons:
    for k in p.edge_keys: ek.setdefault(k,[]).append(p.index)
nb=[[] for _ in me.polygons]
for fs in ek.values():
    for a in fs:
        for b in fs:
            if a!=b: nb[a].append(b)
for it in range(int(os.environ.get('IT','6'))):
    new=cls.copy()
    for i in range(len(cls)):
        c=Counter(cls[j] for j in nb[i] if cls[j]!=0)
        if not c: continue
        top,n=c.most_common(1)[0]
        if cls[i]==0 or (top!=cls[i] and n>=len(nb[i])*0.67): new[i]=top
    cls=new
print(np.bincount(cls))
np.save('cls.npy',cls)
NAMES=['unk','skin','shirt','trim','trousers','pads','straps','shoes','shoe_stripe','wristband','face_dark','face_white']
base=me.materials[0]
for i,nm in enumerate(NAMES):
    m=base.copy(); m.name=nm; me.materials.append(m)
for p in me.polygons: p.material_index=1+int(cls[p.index])
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('base_seg.blend'))
