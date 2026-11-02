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

# ---- legibility (Joe, Nov 2: "the scoreboard makes the text not legible"): the game writes white/pale text, so every text panel
# goes deep navy (own shading kept). Chase panel: the pink deckchair stripes become a navy plank panel with a thin striped valance on top.
import numpy as np
O=np.array(Image.open('../../ui/hud_lock/orig/beach_orig.webp').convert('RGBA')).astype(np.float32)
lab=cv2.cvtColor(O[...,:3].clip(0,255).astype(np.uint8),cv2.COLOR_RGB2LAB).astype(np.float32)
NAVY=cv2.cvtColor(np.uint8([[[16,44,86]]]),cv2.COLOR_RGB2LAB)[0,0].astype(np.float32)
def navy(mask):
  L=lab[...,0]; m=mask
  out=lab.copy(); mu=L[m].mean() if m.any() else 0
  out[...,0]=np.where(m,NAVY[0]+(L-mu)*0.45,L); out[...,1]=np.where(m,NAVY[1],lab[...,1]); out[...,2]=np.where(m,NAVY[2],lab[...,2])
  return out
H0=O.shape[0]; yy,xx=np.mgrid[:H0,:760]
cream=(lab[...,0]>150)&(lab[...,2]>136)
M=np.zeros((H0,760),bool)
def rect(x1,y1,x2,y2,inset): M[y1+inset:y2-inset,x1+inset:x2-inset]|=cream[y1+inset:y2-inset,x1+inset:x2-inset]
rect(49,147,304,218,7);  rect(50,44,140,124,10); rect(112,235,692,282,4)
for (x1_,y1_,x2_,y2_) in [(531,44,616,126),(620,44,705,126)]:   # wicket slots: whole recess inside the bolted frame
  sub=(lab[y1_+13:y2_-13,x1_+13:x2_-13,0]>110); M[y1_+13:y2_-13,x1_+13:x2_-13]|=sub
for sx in (346,425,503,582,662): M|=cream&(np.hypot(xx-sx,yy-182)<27)
M|=cream&(np.hypot(xx-84,yy-257)<20)   # energy icon: the snail shell stays, its cream backing goes navy
M=cv2.morphologyEx(M.astype(np.uint8),cv2.MORPH_CLOSE,np.ones((3,3),np.uint8)).astype(bool)
lab=navy(M)
# chase panel: navy planks from the board's own blue plank texture, valance of the original stripes along the top
x1,y1,x2,y2=142,44,528,126; v=11
pl=O[300:318,350:530,:3]; pl=np.concatenate([pl,pl[::-1]]*6,0); pl=np.concatenate([pl,pl[:,::-1]]*3,1)[:y2-y1-v,:x2-x1]
pll=cv2.cvtColor(pl.clip(0,255).astype(np.uint8),cv2.COLOR_RGB2LAB).astype(np.float32); mu=pll[...,0].mean()
pll[...,0]=NAVY[0]+(pll[...,0]-mu)*0.5; pll[...,1]=NAVY[1]; pll[...,2]=NAVY[2]
lab[y1+v:y2,x1:x2]=pll
for yy_ in range(y1+v-2,y1+v+3): lab[yy_,x1:x2,0]*=0.8   # small shadow line under the valance
O[...,:3]=cv2.cvtColor(lab.clip(0,255).astype(np.uint8),cv2.COLOR_LAB2RGB)
Image.fromarray(O.clip(0,255).astype(np.uint8)).save('../../ui/hud_lock/orig/beach_orig.webp',lossless=True)
print('navy panels done', M.sum())
