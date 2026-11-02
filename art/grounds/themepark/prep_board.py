# 4.c Theme Park board (Figma 397:193): rollercoaster front car — turquoise moulded body, lime stripes, chrome bolts and rings, dark
# panels. The padded lap bar on top becomes a 'roof' layer drawn behind/above the locked board (THEME_ART.hudRoof, like 3.a's gable).
import numpy as np, cv2
from PIL import Image
im=np.array(Image.open('raw/hud_397-193.png').convert('RGB')).astype(float); key=np.array([255,0,255.])
a=np.clip((np.sqrt(((im-key)**2).sum(2))-45)/60,0,1); k=(a<1)&(a>0)
sp=np.clip(np.minimum(im[...,0],im[...,2])-im[...,1],0,None)*k; im[...,0]-=sp; im[...,2]-=sp
A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8)); r=np.dstack([im,A]).clip(0,255).astype(np.uint8)
b=r[310:728,34:1102].copy()
o=Image.fromarray(b).resize((760,round(b.shape[0]*760/b.shape[1])),Image.LANCZOS); o=o.crop((0,8,760,o.height)); o.save('../../ui/hud_lock/orig/themepark_orig.webp',lossless=True)
roof=r[255:335,34:1102].copy(); roof[60:,:,3]=0   # lap bar + chrome clamps only (the body top below is the board's own)
R=Image.fromarray(roof); bbox=R.getbbox(); print('board',o.size,'roof bbox',bbox)
np.save('roof_src.npy',np.array(bbox))
Image.fromarray(roof).save('raw/roof_src.png')
# roof layer for the game: lap bar scaled like the locked board (board src 1068 px wide -> 697 px at x 31 in hud2), canvas 760 wide
kk=697/1068; R=Image.open('raw/roof_src.png'); R=R.crop((0,0,R.width,62))
Rs=R.resize((round(R.width*kk),round(R.height*kk)),Image.LANCZOS)
c=Image.new('RGBA',(760,Rs.height)); c.alpha_composite(Rs,(31,0)); c.save('../../../assets/themes/themepark/hud_roof.webp',quality=92)
print('roof h',Rs.height,'hudRoof.y',round((20+6-Rs.height)/760,4))
