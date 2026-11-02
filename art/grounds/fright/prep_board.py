# 4.d Fright Fair board (Figma 398:192): crooked purple boards, iron brackets, cobwebs, glowing orange pumpkin-rim sockets, dark panels;
# the bat hanging under the bottom edge becomes a top sprite. Key + crop to 760 wide.
import numpy as np, cv2
from PIL import Image
im=np.array(Image.open('raw/hud_398-192.png').convert('RGB')).astype(float)
a=np.clip((np.sqrt(((im-[0,255,0])**2).sum(2))-45)/60,0,1); k=(a<1)&(a>0)
im[...,1]=np.where(k,np.minimum(im[...,1],np.maximum(im[...,0],im[...,2])),im[...,1])
ex=np.clip(im[...,1]-np.maximum(im[...,0],im[...,2]),0,None); a=a*np.clip(1-ex/90,0,1)
A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8)); r=np.dstack([im,A]).clip(0,255).astype(np.uint8)
bat=r[660:815,945:1015].copy()
b=r[238:692,32:1122].copy(); b[425:,905:985,3]=np.where(b[425:,905:985,3]>0,b[425:,905:985,3],0)
b[428:,:,3]=0   # nothing below the frame (bat top) — frame bottom edge is ~row 452 in the sheet
o=Image.fromarray(b).resize((760,round(b.shape[0]*760/b.shape[1])),Image.LANCZOS); o=o.crop((0,0,760,300)); o.save('../../ui/hud_lock/orig/fright_orig.webp',lossless=True)
print(o.size)   # the bat under the frame was dropped (nothing may hang below the locked box except Rooftop's lights)

