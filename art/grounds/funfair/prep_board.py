# 4.a Funfair board (Figma 395:192): gilded carousel-front frame, cherry-red panels, bulbs all round, dark maroon panels.
# Key + crop to 760 wide; the carousel horse on the bottom-left is dropped (energy icon lands there).
import numpy as np, cv2
from PIL import Image
im=np.array(Image.open('raw/hud_395-192.png').convert('RGB')).astype(float)
a=np.clip((np.sqrt(((im-[0,255,0])**2).sum(2))-45)/60,0,1); k=(a<1)&(a>0)
im[...,1]=np.where(k,np.minimum(im[...,1],np.maximum(im[...,0],im[...,2])),im[...,1])
ex=np.clip(im[...,1]-np.maximum(im[...,0],im[...,2]),0,None); a=a*np.clip(1-ex/90,0,1)   # bulb glow over green -> transparent
A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8)); r=np.dstack([im,A]).clip(0,255).astype(np.uint8)
b=r[248:705,40:1112].copy()
o=Image.fromarray(b).resize((760,round(b.shape[0]*760/b.shape[1])),Image.LANCZOS)
O=np.array(o); H=O.shape[0]
# horse dropped (it sat where the energy icon goes and can't be cut from the gold frame cleanly); its corner = bottom-right corner flipped
O[224:H,0:110]=O[224:H,650:760][:,::-1]   # below the score panel only
O[192:224,58:120]=O[192:224,160:222]   # horse ears poked into the score panel's bottom-left: panel copied over from further right
Image.fromarray(O).save('../../ui/hud_lock/orig/funfair_orig.webp',lossless=True)
print(o.size)
