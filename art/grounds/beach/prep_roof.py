# 3.a Beach roof (Joe, Nov 2: "add the gabled roof, see what it looks like"): the beach-hut gable from the HUD sheet (Figma 386:191),
# life ring planked over, seagull kept on the right eave. Drawn by the game BEHIND the locked board, sitting on its top beam
# (THEME_ART.tc_beach.hudRoof) — the one thing allowed above the box on this ground.
import numpy as np, cv2
from PIL import Image
im=np.array(Image.open('raw/hud_386-191.png').convert('RGB')).astype(float)
a=np.clip((np.sqrt(((im-[0,255,0])**2).sum(2))-45)/60,0,1); k=(a<1)&(a>0)
im[...,1]=np.where(k,np.minimum(im[...,1],np.maximum(im[...,0],im[...,2])),im[...,1])
A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8)); r=np.dstack([im,A]).clip(0,255).astype(np.uint8)
# plank over the life ring: each row takes the colour of the planks just left/right of the ring on that row (planks run across),
# plus fine grain from a clean patch; only blue plank pixels are replaced, the white eave beams stay
x1,y1,x2,y2=536,232,684,376; rgbf=r[...,:3].astype(np.float32)
blue=(rgbf[...,2]>rgbf[...,0]+45)
grain=r[300:360,380:540,:3].astype(np.float32); grain=grain-cv2.GaussianBlur(grain,(0,0),4); grain=np.concatenate([grain]*3,0)[:y2-y1]
ring=np.zeros(r.shape[:2],bool); yy,xx=np.mgrid[:r.shape[0],:r.shape[1]]; ring=(np.hypot(xx-610,yy-304)<72)&~((rgbf.min(-1)>175)&(yy<250))
for y in range(y2-1,y1-1,-1):
  side=[x for x in list(range(x1-30,x1))+list(range(x2,x2+30)) if blue[y,x] and not ring[y,x]]
  if side: col=np.median(rgbf[y,side],0)
  elif 'col' not in dir(): continue
  for x in range(x1,x2):
    if ring[y,x] and r[y,x,3]>0:
      t=np.clip((72-np.hypot(x-610,y-304))/8,0,1)   # feathered rim
      r[y,x,:3]=np.clip((col+grain[y-y1,x-x1])*t+rgbf[y,x]*(1-t),0,255)
orig=np.array(Image.open('raw/hud_386-191.png').convert('RGB')).astype(float)
# roof only: from the seagull's head down to just under the new top beam; the side caps belong to the board
Y0,Y1,X0,X1=160,372,30,1160; roof=r[Y0:Y1,X0:X1].copy()
roof[...,3]=np.where(np.arange(roof.shape[1])[None,:]<0,0,roof[...,3])
s=Image.fromarray(roof); bx0,bx1=38-X0,1150-X0
B=np.array(Image.open('../../../assets/themes/beach/hud2.webp').convert('RGBA'))[...,3]; cols=np.where(B[150]>128)[0]
k=(cols.max()-cols.min())/(bx1-bx0); out=s.resize((round(s.width*k),round(s.height*k)),Image.LANCZOS)
c=Image.new('RGBA',(760,out.height)); left=cols.min()-round(bx0*k); c.alpha_composite(out,(left,0)); c.save('../../../assets/themes/beach/hud_roof.webp',quality=92)
beamTop=30; off=(beamTop-(346-Y0)*k)/760
print('k',round(k,4),'roof h',out.height,'left',left,'top offset (frac of board width)',round(off,4))
