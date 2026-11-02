# 4.b Circus board (Figma 396:192): purple circus-wagon frame, gold stars + studs, sequins, red-and-gold swag along the top, dark panels;
# the ringmaster's top hat on the top-right becomes a top sprite. Key + crop to 760 wide.
import numpy as np, cv2
from PIL import Image
im=np.array(Image.open('raw/hud_396-192.png').convert('RGB')).astype(float)
a=np.clip((np.sqrt(((im-[0,255,0])**2).sum(2))-45)/60,0,1); k=(a<1)&(a>0)
im[...,1]=np.where(k,np.minimum(im[...,1],np.maximum(im[...,0],im[...,2])),im[...,1])
A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8)); r=np.dstack([im,A]).clip(0,255).astype(np.uint8)
hat=r[158:285,968:1122].copy()
b=r[212:735,32:1110].copy(); b[:68,920:]=0     # hat removed from the board crop (hat spans the corner star above the frame)
# corner star under the hat: copy the top-left star, flipped
b[30:96,1005:1078]=r[242:308,37:110][:, ::-1]
o=Image.fromarray(b).resize((760,round(b.shape[0]*760/b.shape[1])),Image.LANCZOS)
O=np.array(o)
O[26:52,640:712]=O[26:52,520:592]          # beam under the removed hat, copied from further left
crest=O[0:64,305:455].copy(); crest[50:,:,3]=0   # the gold crest that pokes above the frame -> its own sprite
O=O[26:]                                   # frame starts at its top beam (overhang would shrink the board in the lock fit)
O[:40,305:455]=O[:40,170:320]              # crest dropped: beam + swag under it copied from the left
o=Image.fromarray(O); o.save('../../ui/hud_lock/orig/circus_orig.webp',lossless=True)
kk=760/b.shape[1]; Hz=Image.fromarray(hat); Hz=Hz.crop(Hz.getbbox()); sp=Image.new('RGBA',o.size); sp.alpha_composite(Hz.resize((round(Hz.width*kk),round(Hz.height*kk)),Image.LANCZOS),(0,0))
C=Image.fromarray(crest); C=C.crop(C.getbbox()); sp.alpha_composite(C,(200,180))   # second sprite: crest at (200,180) in the sprite sheet
sp.save('../../ui/hud_lock/orig/circus_sprites.webp',lossless=True); print(o.size, Hz.size, C.size)
