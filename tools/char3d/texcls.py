import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
tris=np.load('uvtris.npy'); cls=np.load('polycls.npy'); px=np.load('tex.npy'); H,W=px.shape[:2]
rgb=np.flipud(px[...,:3])  # image rows top-down
cm=Image.new('L',(W,H),255); d=ImageDraw.Draw(cm)
for t,c in zip(tris,cls):
    d.polygon([(u*W,(1-v)*H) for u,v in t],fill=int(c))
cm=np.array(cm).astype(int)
covered=cm!=255
# reference colour per class (median of texels painted that class)
ref={}
for k in np.unique(cm[covered]):
    sel=cm==k
    if sel.sum()>50: ref[k]=np.median(rgb[sel],0)
# refine boundaries between recolourable classes: within a 9px window, choose the nearest class colour among the classes present
REC={1,2,3,4,5,6,7,8,9}   # skin..wristband
out=cm.copy()
pad=4
cands={}
for k in ref:
    m=ndimage.binary_dilation(cm==k,iterations=pad); cands[k]=m
bound=np.zeros_like(covered)
for k in ref:
    for j in ref:
        if j<=k: continue
        bound|=cands[k]&cands[j]
bound&=covered
ys,xs=np.where(bound)
best=np.full(len(ys),-1); bd=np.full(len(ys),1e9)
for k,col in ref.items():
    if k not in REC: continue
    ok=cands[k][ys,xs]; dist=((rgb[ys,xs]-col)**2).sum(1)
    upd=ok&(dist<bd); best[upd]=k; bd[upd]=dist[upd]
keep=np.isin(cm[ys,xs],list(REC))&(best>=0)
out[ys[keep],xs[keep]]=best[keep]
# majority filter 3x3 to drop single-texel speckle
from scipy.ndimage import generic_filter
def mode(v): 
    v=v.astype(int); return np.bincount(v).argmax()
small=out.copy(); small[small==255]=0
o2=generic_filter(small,mode,size=3) if False else small
Image.fromarray(out.astype('uint8')).save('classmap.png')
print('classes',sorted(ref.keys()),'boundary texels',len(ys))
# pass 2: texels left as face detail / unknown whose colour is really skin become skin
o=np.array(Image.open('classmap.png')).astype(int)
sk=ref[1]
cand=np.isin(o,[0,10,11])
dsk=((rgb-sk)**2).sum(1 if False else -1)
own=np.full(o.shape,1e9)
for k in (10,11):
    if k in ref: own=np.where(o==k,((rgb-ref[k])**2).sum(-1),own)
lum=rgb[...,0]*.3+rgb[...,1]*.59+rgb[...,2]*.11
skinlike=(rgb[...,0]>rgb[...,1])&(rgb[...,1]>=rgb[...,2]-0.03)&(rgb[...,0]-rgb[...,2]>0.12)
to=cand&skinlike&((o==0)|(dsk<own))
# only near existing skin
near=ndimage.binary_dilation(o==1,iterations=6)
o[to&near]=1
Image.fromarray(o.astype('uint8')).save('classmap.png'); print('pass2 to skin',int((to&near).sum()))
# pass 3: light patches on the sides and back of the head (baked highlights) are skin; eye whites and teeth (front of the face) stay
o=np.array(Image.open('classmap.png')).astype(int)
cent=np.load('facecent.npy')
fid=Image.new('I',(W,H),-1); dd=ImageDraw.Draw(fid)
for i,t in enumerate(tris): dd.polygon([(u*W,(1-v)*H) for u,v in t],fill=i)
fid=np.array(fid)
cand=np.isin(o,[0,11])&(fid>=0)
c3=cent[np.clip(fid,0,None)]
side=(np.abs(c3[...,0])>0.075)|(c3[...,1]>-0.05)   # off the front of the face
to=cand&side&ndimage.binary_dilation(o==1,iterations=8)
o[to]=1
Image.fromarray(o.astype('uint8')).save('classmap.png'); print('pass3 to skin',int(to.sum()))
