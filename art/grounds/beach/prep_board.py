# 3.a Beach board: key the HUD sheet (Figma 386:191), take the beach-hut gable roof + life ring off (Twilight has life rings;
# the locked box has no room for a roof), give it a flat white top beam made from its own side post, keep the seagull as a top sprite.
import numpy as np, cv2
from PIL import Image
im=np.array(Image.open('raw/hud_386-191.png').convert('RGB')).astype(float)
a=np.clip((np.sqrt(((im-[0,255,0])**2).sum(2))-45)/60,0,1); k=(a<1)&(a>0)
im[...,1]=np.where(k,np.minimum(im[...,1],np.maximum(im[...,0],im[...,2])),im[...,1])
A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8)); rgba=np.dstack([im,A]).clip(0,255).astype(np.uint8)
# seagull sprite
g=rgba[160:338,930:1125].copy(); g[110:,:75,3]=0; Image.fromarray(g).crop(Image.fromarray(g).getbbox()).save('raw/gull.png')
b=rgba.copy(); b[:390,:,3]=0
post=rgba[460:720,44:94].copy()                     # vertical white post -> horizontal beam
beam=np.rot90(post,1); beam=np.concatenate([beam,beam[:,::-1]]*6,1)
x0,x1,y0=38,1150,346; L=x1-x0; b[y0:y0+beam.shape[0],x0:x1]=beam[:,:L]
for (sx,dx) in [((38,102),38),((1086,1150),1086)]:  # corner caps = bottom caps flipped
  cap=rgba[764:826,sx[0]:sx[1]][::-1]; m=cap[...,3:]>0; reg=b[y0-6:y0-6+cap.shape[0],dx:dx+cap.shape[1]]
  reg[...]=np.where(m,cap,reg)
b=b[330:840,30:1160]; Image.fromarray(b).save('raw/board_flat.png')
o=Image.fromarray(b).resize((760,round(b.shape[0]*760/b.shape[1])),Image.LANCZOS); o.save('../../ui/hud_lock/orig/beach_orig.webp',lossless=True)
s=Image.open('raw/gull.png'); sp=Image.new('RGBA',(760,o.height)); sp.alpha_composite(s.resize((round(s.width*.6816),round(s.height*.6816)),Image.LANCZOS),(0,0)); sp.save('../../ui/hud_lock/orig/beach_sprites.webp',lossless=True)
# shells: lift them off, rebuild the bottom trim from its plain right part, put them back smaller so nothing hangs below the frame
O=np.array(o).astype(np.float32); y1,x1,x2=262,58,345
reg=O[y1:,x1:x2].copy(); sh=(reg[...,3]>40)&~(reg[...,2]>reg[...,0]+25)&(np.arange(reg.shape[0])[:,None]>18)
from scipy import ndimage
sh=ndimage.binary_opening(sh,iterations=1); lab,n=ndimage.label(sh); sz=ndimage.sum(sh,lab,range(1,n+1)); sh=np.isin(lab,[i+1 for i,v in enumerate(sz) if v>120])
pc=reg.copy(); pc[...,3]=pc[...,3]*sh
O[y1:,x1:x2]=O[y1:,x1+330:x2+330]
P=Image.fromarray(pc.astype(np.uint8)); P=P.crop(P.getbbox()); P=P.resize((round(P.width*.72),round(P.height*.72)),Image.LANCZOS)
Ob=Image.fromarray(O.clip(0,255).astype(np.uint8)); Ob.save('../../ui/hud_lock/orig/beach_orig.webp',lossless=True)  # shells left off: after the lock fit the energy bar covers them
print(o.size, s.size, P.size)
