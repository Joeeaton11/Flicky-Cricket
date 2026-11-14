import numpy as np, cv2, json
d=np.load('mesh.npz'); V,T=d['V'],d['T']; C=V[T].mean(1)
cls=np.load('cls_tex.npy'); idmap=np.load('idmap.npy')
ys,xs=np.where(np.isin(cls,[2,3,5])); f=idmap[ys,xs]; c=C[f]
brow=(c[:,0]>0.07)&(c[:,2]>1.605)&(c[:,2]<1.66)&(np.abs(c[:,1])<0.1)
eyed=(c[:,0]>0.07)&(c[:,2]>1.57)&(c[:,2]<=1.625)&(np.abs(c[:,1])<0.1)
new=np.full(len(f),2,np.uint8); new[eyed&(cls[ys,xs]==5)]=5; new[brow&~(eyed&(cls[ys,xs]==5))]=3
low=(c[:,0]>0.05)&(c[:,2]<1.57)&(c[:,2]>1.45); new[low]=5
cls[ys,xs]=new
ys,xs=np.where(cls==7); c=C[idmap[ys,xs]]; bad=~((c[:,0]>0.08)&(np.abs(c[:,1])<0.05)&(c[:,2]>1.2)); cls[ys[bad],xs[bad]]=6
m=(cls==0).astype(np.uint8)
dist,lab=cv2.distanceTransformWithLabels(m,cv2.DIST_L2,5,labelType=cv2.DIST_LABEL_PIXEL)
idx=np.zeros(lab.max()+1,np.int64); yy,xx=np.where(m==0); idx[lab[yy,xx]]=yy*cls.shape[1]+xx
fill=cls.ravel()[idx[lab]]; cls=np.where(m>0,fill.reshape(cls.shape),cls).astype(np.uint8)
np.save('cls_tex2.npy',cls); cv2.imwrite('classmap.png',np.flipud(cls))
tex=np.load('tex.npy')[...,:3]
NAMES=['unk','skin','hair','brows','eye_white','eye_dark','shirt','buttons','trousers','shoes','soles']
avg={n:list(map(float,np.median(tex[cls==i],0))) for i,n in enumerate(NAMES) if (cls==i).sum()>100}
for i,n in enumerate(NAMES):
    if n in avg: avg[n+'_lum']=float(np.median((tex[cls==i]**2.2)@np.array([0.2126,0.7152,0.0722])))
json.dump(avg,open('avg.json','w')); print('ok')
