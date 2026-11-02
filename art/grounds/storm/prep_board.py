# 3.e Beach Storm board (Figma 391:192): safety-orange lifeboat hull, navy stripe, grey rubber fender frame + rope lashings, steel
# portholes, dark panels; the beacon on the top-right becomes a top sprite (outside the box otherwise). Key + crop to 760 wide.
import numpy as np, cv2
from PIL import Image
im=np.array(Image.open('raw/hud_391-192.png').convert('RGB')).astype(float); key=np.array([255,0,255.])
a=np.clip((np.sqrt(((im-key)**2).sum(2))-45)/60,0,1); k=(a<1)&(a>0)
sp=np.clip(np.minimum(im[...,0],im[...,2])-im[...,1],0,None)*k; im[...,0]-=sp; im[...,2]-=sp
A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8)); r=np.dstack([im,A]).clip(0,255).astype(np.uint8)
beacon=r[180:270,990:1105].copy()
b=r[266:712,28:1160].copy()
o=Image.fromarray(b).resize((760,round(b.shape[0]*760/b.shape[1])),Image.LANCZOS); o.save('../../ui/hud_lock/orig/storm_orig.webp',lossless=True)
kk=760/b.shape[1]; Bz=Image.fromarray(beacon); Bz=Bz.crop(Bz.getbbox()); sp_=Image.new('RGBA',o.size); sp_.alpha_composite(Bz.resize((round(Bz.width*kk),round(Bz.height*kk)),Image.LANCZOS),(0,0))
sp_.save('../../ui/hud_lock/orig/storm_sprites.webp',lossless=True); print(o.size, sp_.getbbox())
# after build_locked_boards: the navy lifeboat stripe is put back behind the middle row (see HANDOVER 3.e) — orange pixels in that band -> navy
