# 3.d Beach Night board (Figma 389:192): lashed bamboo frame over woven palm, dark indigo panels, neon-orange sockets, fairy lights
# under the bottom pole, tiki mask on the bottom-left. Key + crop to a 760-wide original; tiki mask -> top sprite (it hangs off the frame).
import numpy as np, cv2
from PIL import Image
im=np.array(Image.open('raw/hud_389-192.png').convert('RGB')).astype(float)
a=np.clip((np.sqrt(((im-[0,255,0])**2).sum(2))-45)/60,0,1); k=(a<1)&(a>0)
im[...,1]=np.where(k,np.minimum(im[...,1],np.maximum(im[...,0],im[...,2])),im[...,1])
A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8)); r=np.dstack([im,A]).clip(0,255).astype(np.uint8)
b=r[250:745,10:1205].copy()
f=b[...,:3].astype(float); gr=(f[...,1]>f[...,0])&(f[...,1]>f[...,2]+30)   # green key bled into the fairy-light glow: warm it back up
f[...,1]=np.where(gr,np.minimum(f[...,1],f[...,0]*0.92),f[...,1]); b[...,:3]=f.clip(0,255).astype(np.uint8)
o=Image.fromarray(b).resize((760,round(b.shape[0]*760/b.shape[1])),Image.LANCZOS); o.save('../../ui/hud_lock/orig/beachnight_orig.webp',lossless=True); print(o.size)
# tiki mask -> top sprite (else the lock fit puts the energy icon over its face); its corner rebuilt from the top-left corner, flipped
O=np.array(o); S=np.zeros_like(O); x1,y1,x2,y2=0,196,84,315
hsv=cv2.cvtColor(O[...,:3],cv2.COLOR_RGB2HSV)
S[y1:y2,x1:x2]=O[y1:y2,x1:x2]
for y in range(y1,y2):
  src=315-1-y+ (0); O[y,x1:x2]=O[min(314,max(0,src)),x1:x2] if src<y1 else O[y,x1:x2]
Image.fromarray(O).save('../../ui/hud_lock/orig/beachnight_orig.webp',lossless=True)
Image.fromarray(S).save('../../ui/hud_lock/orig/beachnight_sprites.webp',lossless=True)
