# 5.b Oval board (Figma 404:191): riveted chocolate-brown gasholder girders, see-through iron lattice rails, copper rings, dark panels.
# Key (green; the lattice gaps become see-through) + crop to the frame (finials above the corner posts cut off).
import numpy as np, cv2
from PIL import Image
im=np.array(Image.open('raw/hud_404-191.png').convert('RGB')).astype(float)
a=np.clip((np.sqrt(((im-[0,255,0])**2).sum(2))-45)/60,0,1); k=(a<1)&(a>0)
im[...,1]=np.where(k,np.minimum(im[...,1],np.maximum(im[...,0],im[...,2])),im[...,1])
ex=np.clip(im[...,1]-np.maximum(im[...,0],im[...,2]),0,None); a=a*np.clip(1-ex/90,0,1)
A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8)); r=np.dstack([im,A]).clip(0,255).astype(np.uint8)
b=r[228:748,34:1182].copy()
o=Image.fromarray(b).resize((760,round(b.shape[0]*760/b.shape[1])),Image.LANCZOS); o.save('../../ui/hud_lock/orig/oval_orig.webp',lossless=True); print(o.size)
