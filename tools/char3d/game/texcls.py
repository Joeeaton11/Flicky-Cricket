import numpy as np, cv2
d=np.load('mesh.npz'); V,T,UV=d['V'],d['T'],d['UV']
tex=np.load('tex.npy')[...,:3]; S=tex.shape[0]
C=V[T].mean(1)  # face centroids (x fwd, y left, z up)
NAMES=['unk','skin','hair','brows','eye_white','eye_dark','shirt','buttons','trousers','shoes','soles']
P={'skin':(230,140,80),'hair':(80,52,38),'brows':(60,40,30),'eye_white':(235,230,225),'eye_dark':(40,30,25),'shirt':(42,50,72),'buttons':(230,230,230),
   'trousers':(78,78,78),'shoes':(235,235,235),'soles':(30,30,30)}
def region(c):
    x,y,z=c
    if abs(y)>0.3 and z>0.4: return ['skin','shirt']          # arms and hands
    if z>1.42: return ['skin','hair','brows','eye_white','eye_dark','shirt']
    if z>1.0: return ['shirt','buttons','skin']
    if z>0.875: return ['shirt','trousers']
    if z>0.2: return ['trousers']
    return ['shoes','soles','trousers']
cls=np.zeros((S,S),np.uint8); cls[:]=0
# rasterise each face's allowed set, pick nearest prototype per texel
lab=lambda rgb: cv2.cvtColor(np.uint8(rgb).reshape(-1,1,3),cv2.COLOR_RGB2LAB).reshape(-1,3).astype(np.float32)
texlab=cv2.cvtColor((tex*255).astype(np.uint8),cv2.COLOR_RGB2LAB).astype(np.float32)
protolab={k:lab([v])[0] for k,v in P.items()}
faceset=[]
for i,c in enumerate(C):
    faceset.append(region(c))
# per-face rasterisation
idmap=np.full((S,S),-1,np.int32)
for i,uvt in enumerate(UV):
    pts=np.round(uvt*[S-1,S-1]).astype(np.int32)
    cv2.fillConvexPoly(idmap,pts,i)   # rows are v (blender order: row 0 = v 0)
ys,xs=np.where(idmap>=0); fi=idmap[ys,xs]
out=np.zeros(len(fi),np.uint8)
sets={}
for i,s in enumerate(faceset): sets.setdefault(tuple(s),[]).append(i)
fmask_of=np.zeros(len(C),np.int32)
keys=list(sets.keys())
for k,(s,idx) in enumerate(sets.items()): fmask_of[idx]=k
fk=fmask_of[fi]
for k,s in enumerate(keys):
    sel=fk==k
    L=texlab[ys[sel],xs[sel]]
    D=np.stack([np.linalg.norm(L-protolab[n],axis=1) for n in s],1)
    out[sel]=np.array([NAMES.index(n) for n in s])[D.argmin(1)]
cls[ys,xs]=out
# shirt vs trousers by blueness in the waist band
wb=(C[fi][:,2]>0.875)&(C[fi][:,2]<1.0)&(np.abs(C[fi][:,1])<0.3)
rgb=tex[ys[wb],xs[wb]]*255; blue=(rgb[:,2]-rgb[:,0])>9
cls[ys[wb],xs[wb]]=np.where(blue,6,8)
# brows vs hair: dark-brown on the face front below the hairline -> brows; eye dark only near eye whites
np.save('cls_tex.npy',cls); np.save('idmap.npy',idmap)
pal=np.array([(255,0,255),(240,150,90),(90,50,20),(200,0,0),(255,255,255),(0,0,0),(40,60,160),(255,255,0),(120,120,120),(0,220,0),(0,120,120)]+[(0,0,0)]*245,np.uint8)
cv2.imwrite('cls_view.png',cv2.resize(np.flipud(pal[cls])[...,::-1],(1024,1024),interpolation=cv2.INTER_NEAREST))
print(np.bincount(cls.ravel(),minlength=11))
