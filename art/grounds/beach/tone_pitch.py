# 3.a: the painted pitch came out dark brown and crisp; pull it to damp packed sand just a shade darker than the field, softer contrast,
# paler dust at both ends, so it sits into the beach. Writes assets/themes/beach/pitch_rect.webp and pitch.webp (from cut.py's originals in raw/).
import numpy as np, cv2, shutil, os
from PIL import Image
D='../../../assets/themes/beach/'
for n in ['pitch_rect','pitch']:
  if not os.path.exists('raw/%s_orig.webp'%n): shutil.copy(D+n+'.webp','raw/%s_orig.webp'%n)
plate=cv2.imread('plate.png'); H,W=plate.shape[:2]
field=cv2.cvtColor(plate[int(.45*H):int(.8*H),int(.3*W):int(.7*W)],cv2.COLOR_BGR2LAB).reshape(-1,3).astype(float)
tm=np.median(field,0); tm[0]-=24   # damp = a little darker
for n in ['pitch_rect','pitch']:
  im=np.array(Image.open('raw/%s_orig.webp'%n).convert('RGBA')); rgb=im[...,:3]; a=im[...,3]
  lab=cv2.cvtColor(rgb,cv2.COLOR_RGB2LAB).astype(float); m=a>128 if n=='pitch' else np.ones(a.shape,bool)
  mu=lab[m].mean(0); sd=lab[m].std(0)
  out=(lab-mu)*np.array([.55,.6,.6])+tm
  h=out.shape[0]; yy=np.linspace(0,1,h)[:,None]; dust=np.clip(1-np.minimum(yy,1-yy)/.12,0,1)*8; out[...,0]+=dust
  rgb2=cv2.cvtColor(out.clip(0,255).astype(np.uint8),cv2.COLOR_LAB2RGB)
  if n=='pitch_rect':   # ragged soft side edges
    w=rgb2.shape[1]; xx=np.linspace(0,1,w)[None,:]; e=np.clip(np.minimum(xx,1-xx)/.06,0,1)[...,None]
    rgb2=(rgb2*e+np.array(cv2.cvtColor(np.uint8([[tm]]),cv2.COLOR_LAB2RGB)[0,0])*(1-e)*1.0).astype(np.uint8)
  Image.fromarray(np.dstack([rgb2,a])).save(D+n+'.webp',quality=92)
print('target lab',tm)
