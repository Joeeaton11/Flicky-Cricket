# 3.b Rock Pool board (Figma 387:193): slate slab, sea-glass + barnacles, crab bottom-left, anemones bottom-right, dark panels. Key + crop to a 760-wide original.
import numpy as np, cv2
from PIL import Image
im=np.array(Image.open('raw/hud_387-193.png').convert('RGB')).astype(float); key=np.array([255,0,255.])
a=np.clip((np.sqrt(((im-key)**2).sum(2))-45)/60,0,1); k=(a<1)&(a>0)
sp=np.clip(np.minimum(im[...,0],im[...,2])-im[...,1],0,None)*k; im[...,0]-=sp; im[...,2]-=sp
A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8)); r=np.dstack([im,A]).clip(0,255).astype(np.uint8)
b=r[295:730,40:1130]; o=Image.fromarray(b).resize((760,round(b.shape[0]*760/b.shape[1])),Image.LANCZOS)
o.save('../../ui/hud_lock/orig/rockpool_orig.webp',lossless=True); print(o.size)
# crab + anemones become top sprites (the lock fit would bury them under the energy slot/bar): cut by colour (saturated pixels
# in their corners), the frame underneath inpainted with slate, anything below/left of the frame made transparent
O=np.array(o).astype(np.uint8); S=np.zeros_like(O)
hsv=cv2.cvtColor(O[...,:3],cv2.COLOR_RGB2HSV); sat=(hsv[...,1]>90)&(O[...,3]>60)
M=np.zeros(O.shape[:2],np.uint8)
for (x1,y1,x2,y2) in [(0,196,106,303),(612,188,760,303)]:
  sub=sat[y1:y2,x1:x2].astype(np.uint8); sub=cv2.morphologyEx(sub,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8)); sub=cv2.dilate(sub,np.ones((7,7),np.uint8))
  M[y1:y2,x1:x2]=sub
S[M>0]=O[M>0]
# rebuild those two bottom corners from the matching top corners, mirrored about the frame's middle (top edge y 8 <-> bottom edge y 282);
# the board's own interior there is repainted by the lock build anyway
T=np.array(o).astype(np.uint8)
for (x1,y1,x2,y2) in [(0,196,106,303),(612,188,760,303)]:
  for y in range(y1,y2):
    src=290-y; O[y,x1:x2]=T[src,x1:x2] if src>=0 else 0
Image.fromarray(O[:283]).save('../../ui/hud_lock/orig/rockpool_orig.webp',lossless=True)   # frame only: overhang rows would shrink the board in the lock fit
Image.fromarray(S).save('../../ui/hud_lock/orig/rockpool_sprites.webp',lossless=True)
