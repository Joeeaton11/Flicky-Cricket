import numpy as np, cv2
from PIL import Image
from scipy import ndimage
D='/home/claude/flicky-cricket/assets/themes/rooftop/'
def keyed(src):
  im=np.array(Image.open(src).convert('RGB')).astype(float); a=np.clip((np.sqrt(((im-[255,0,255])**2).sum(2))-45)/60,0,1)
  k=(a<1)&(a>0); f=im.copy()
  f[...,0]=np.where(k,np.minimum(f[...,0],f[...,1]+(f[...,0]-f[...,1])*a),f[...,0]); f[...,2]=np.where(k,np.minimum(f[...,2],f[...,1]+(f[...,2]-f[...,1])*a),f[...,2])
  return np.dstack([f,a*255]).clip(0,255).astype(np.uint8)
def blobs(rgba,dil=2):
  lab,n=ndimage.label(ndimage.binary_dilation(rgba[...,3]>128,iterations=dil))
  return lab,[s for s in ndimage.find_objects(lab)]
def save(rgba,lab,i,s,name,maxd=None):
  p=rgba[s].copy(); p[...,3]=p[...,3]*(lab[s]==i+1); im=Image.fromarray(p); im=im.crop(im.getbbox())
  if maxd and max(im.size)>maxd: k=maxd/max(im.size); im=im.resize((round(im.width*k),round(im.height*k)),Image.LANCZOS)
  im.save(D+name+'.webp',quality=90); return im
# props
P=keyed('props_raw.png'); lab,ss=blobs(P)
items=sorted([(i,s) for i,s in enumerate(ss) if (s[0].stop-s[0].start)*(s[1].stop-s[1].start)>1500],key=lambda t:(t[1][1].start))
for i,s in items: print(i,s[1].start,s[0].start,s[1].stop-s[1].start,s[0].stop-s[0].start)
byi=dict(items)
for i,name,m in [(1,'pitch',None),(0,'stump',None),(3,'bail',None),(2,'ball',208),(16,'ring',120),(15,'x_kite1',160),(18,'x_pigeon_up',160),(19,'x_pigeon_dn',160),(17,'x_sari',200)]:
  im=save(P,lab,i,byi[i],name,m)
st=Image.open(D+'stump.webp'); st.resize((round(st.width*360/st.height),360),Image.LANCZOS).save(D+'stump.webp',quality=92)
bl=Image.open(D+'bail.webp').rotate(90,expand=True); bl.resize((212,round(bl.height*212/bl.width)),Image.LANCZOS).save(D+'bail.webp',quality=92)
r=Image.fromarray(P[282:384,681:1224]); r=r.crop(r.getbbox()); r.save(D+'rope.webp',quality=90)
# pitch rect between creases
pi=np.array(Image.open(D+'pitch.webp').convert('RGBA')); H_,W_=pi.shape[:2]
wh=(pi[...,:3].min(2)>200)&(pi[...,3]>200); rows=[y for y in range(H_) if wh[y].sum()>W_*0.3]
g=[]
for y in rows:
  if g and y-g[-1][-1]<=3: g[-1].append(y)
  else: g.append([y])
print('crease groups',[(a[0],a[-1]) for a in g],H_)
