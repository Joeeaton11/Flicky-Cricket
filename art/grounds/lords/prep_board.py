# 5.a Lord's board (Figma 399:192): red-brick pavilion front, cream stone pillars + top ledge, red/yellow tie-stripe band, brass-ringed
# dark green panels. Key + crop to the frame (the ball finials on the pillars sit above the box -> cut off).
import numpy as np, cv2
from PIL import Image
im=np.array(Image.open('raw/hud_399-192.png').convert('RGB')).astype(float); key=np.array([255,0,255.])
a=np.clip((np.sqrt(((im-key)**2).sum(2))-45)/60,0,1); k=(a<1)&(a>0)
sp=np.clip(np.minimum(im[...,0],im[...,2])-im[...,1],0,None)*k; im[...,0]-=sp; im[...,2]-=sp
A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8)); r=np.dstack([im,A]).clip(0,255).astype(np.uint8)
b=r[290:720,36:1110].copy()
o=Image.fromarray(b).resize((760,round(b.shape[0]*760/b.shape[1])),Image.LANCZOS); o.save('../../ui/hud_lock/orig/lords_orig.webp',lossless=True); print(o.size)
