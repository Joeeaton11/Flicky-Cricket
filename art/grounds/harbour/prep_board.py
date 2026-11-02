# 3.c Harbour board (Figma 388:192): red boat-transom planks, rope frame, brass portholes, dark panels; the buoy hanging off the right
# side becomes a top sprite (outside the box otherwise). Key + crop to a 760-wide original.
import numpy as np, cv2
from PIL import Image
im=np.array(Image.open('raw/hud_388-192.png').convert('RGB')).astype(float); key=np.array([255,0,255.])
a=np.clip((np.sqrt(((im-key)**2).sum(2))-45)/60,0,1); k=(a<1)&(a>0)
sp=np.clip(np.minimum(im[...,0],im[...,2])-im[...,1],0,None)*k; im[...,0]-=sp; im[...,2]-=sp
A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8)); r=np.dstack([im,A]).clip(0,255).astype(np.uint8)
buoy=r[330:640,1062:1165].copy(); buoy[:,:8,3]=0
b=r[258:700,30:1072].copy()
o=Image.fromarray(b).resize((760,round(b.shape[0]*760/b.shape[1])),Image.LANCZOS); o.save('../../ui/hud_lock/orig/harbour_orig.webp',lossless=True)
kk=760/b.shape[1]; Bz=Image.fromarray(buoy); Bz=Bz.crop(Bz.getbbox()); sp_=Image.new('RGBA',o.size); sp_.alpha_composite(Bz.resize((round(Bz.width*kk),round(Bz.height*kk)),Image.LANCZOS),(0,0))
sp_.save('../../ui/hud_lock/orig/harbour_sprites.webp',lossless=True); print(o.size, sp_.getbbox())
