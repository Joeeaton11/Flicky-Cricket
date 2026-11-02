# 5.c Headingley board (Figma 407:192): Yorkshire gritstone frame, green iron rails with gold bolts, white roses in the corners, dark green panels.
import numpy as np, cv2
from PIL import Image
im=np.array(Image.open('raw/hud_407-192.png').convert('RGB')).astype(float); key=np.array([255,0,255.])
a=np.clip((np.sqrt(((im-key)**2).sum(2))-45)/60,0,1); k=(a<1)&(a>0)
sp=np.clip(np.minimum(im[...,0],im[...,2])-im[...,1],0,None)*k; im[...,0]-=sp; im[...,2]-=sp
A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8)); r=np.dstack([im,A]).clip(0,255).astype(np.uint8)
b=r[248:722,30:1128].copy()
o=Image.fromarray(b).resize((760,round(b.shape[0]*760/b.shape[1])),Image.LANCZOS); o.save('../../ui/hud_lock/orig/headingley_orig.webp',lossless=True); print(o.size)
