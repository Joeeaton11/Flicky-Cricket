# Nov 2 (Joe: "more detail"): painted inner ink lines from normal / depth / part-boundary edges
import numpy as np, cv2
from PIL import Image
def ink(col, nrm, dep, msk, thick=3, ncrease=9.0, dstep=.012, strength=.8, colr=(40,26,28), minlen=40):
    c=np.asarray(col.convert('RGBA')).astype(np.float32)
    nr=np.asarray(nrm.convert('RGBA')); a=nr[...,3]>127
    af=a.astype(np.float32); W1=cv2.GaussianBlur(af,(0,0),1.6)+1e-6; W2=cv2.GaussianBlur(af,(0,0),1.0)+1e-6   # blur inside the figure only (no background bleed)
    n=cv2.GaussianBlur((nr[...,:3].astype(np.float32)/127.5-1)*af[...,None],(0,0),1.6)/W1[...,None]; n/=np.linalg.norm(n,axis=-1,keepdims=True)+1e-6
    d=cv2.GaussianBlur(np.asarray(dep.convert('L')).astype(np.float32)/255*af,(0,0),1.0)/W2
    m=np.asarray(msk.convert('RGBA')); cl=np.round((m[...,0].astype(np.float32)-8)/16).astype(np.uint8); cl[m[...,3]<128]=0
    cl=cv2.medianBlur(cl,7)
    ae=cv2.erode(a.astype(np.uint8),np.ones((7,7),np.uint8)).astype(bool)     # leave the silhouette to the outer outline
    E=np.zeros(a.shape,bool)
    for dy,dx in [(0,2),(2,0)]:
        n2=np.roll(n,(-dy,-dx),(0,1)); d2=np.roll(d,(-dy,-dx),(0,1)); c2=np.roll(cl,(-dy,-dx),(0,1))
        E|=(1-(n*n2).sum(-1))>ncrease            # creases and folds
        E|=(np.abs(d-d2)>dstep)&np.roll(ae,(-dy,-dx),(0,1))                     # one part in front of another (arm over body, leg over leg)
        E|=(c2!=cl)                               # shirt / trousers / skin boundaries
    E&=ae
    # keep only real strokes: drop specks
    k,lab,st,_=cv2.connectedComponentsWithStats(E.astype(np.uint8),8)
    keep=np.zeros(k,bool); keep[1:]=st[1:,cv2.CC_STAT_AREA]>=minlen; E=keep[lab]
    L=cv2.dilate(E.astype(np.uint8)*255,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(thick,thick)))
    L=cv2.GaussianBlur(L.astype(np.float32),(0,0),thick*.22)/255
    l=np.clip(L,0,1)*strength*a
    for ch in range(3): c[...,ch]=c[...,ch]*(1-l)+colr[ch]*l
    return Image.fromarray(c.astype(np.uint8),'RGBA')
