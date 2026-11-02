# 5.d Edgbaston board, new pass (Figma 417:191, green key): chunky red-brick pillars with gold caps, riveted navy girders with
# gold rivets, three gold-rimmed dark navy bands, round crest recess, gold bear on top (kept as a sprite).
import numpy as np, cv2
from PIL import Image
im=np.array(Image.open('raw/hud_417-191.png').convert('RGB')).astype(float)
a=np.clip((np.sqrt(((im-[0,255,0])**2).sum(2))-45)/60,0,1)
ex=np.clip(im[...,1]-np.maximum(im[...,0],im[...,2]),0,None); a=a*np.clip(1-ex/90,0,1)
f=im.copy(); f[...,1]=np.minimum(f[...,1],np.maximum(f[...,0],f[...,2]))
A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8)); r=np.dstack([f,A]).clip(0,255).astype(np.uint8)
b=np.concatenate([r[262:772,25:60],r[262:772,140:1067],r[262:772,1147:1182]],1)   # slim brick pilasters: the template panels reach close to the frame edge
o=Image.fromarray(b).resize((760,round(b.shape[0]*760/b.shape[1])),Image.LANCZOS); o.save('../../ui/hud_lock/orig/edgbaston_orig.webp',lossless=True); print(o.size)
from scipy import ndimage
s=r[95:258,895:1075].copy(); lab,n=ndimage.label(s[...,3]>128); keep=np.argmax(ndimage.sum(np.ones_like(lab),lab,range(1,n+1)))+1
s[...,3]=s[...,3]*ndimage.binary_dilation(lab==keep,iterations=2); s=Image.fromarray(s); s=s.crop(s.getbbox()); s.save('../../ui/hud_lock/orig/edgbaston_sprites.webp',lossless=True); print('bear',s.size)
p=Image.fromarray(r[340:670,1200:1530].copy()); p=p.crop(p.getbbox()); p.thumbnail((160,160),Image.LANCZOS)
c=Image.new('RGBA',(max(p.size),)*2); c.alpha_composite(p,((c.width-p.width)//2,(c.height-p.height)//2)); c.save('../../../assets/themes/edgbaston/pause2.webp',quality=92); print('pause',c.size)
