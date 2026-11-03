# Joe (Nov 3): add the media centre at the bottom (Nursery End). Standalone cartoon pod (Figma 427:191, green key), scaled evenly,
# its roof just below the near boards and the rest running off the bottom of the screen.
import numpy as np, cv2, sys
from PIL import Image
im=np.array(Image.open('raw/media_427-191.png').convert('RGB')).astype(float)
a=np.clip((np.sqrt(((im-[0,255,0])**2).sum(2))-45)/60,0,1); ex=np.clip(im[...,1]-np.maximum(im[...,0],im[...,2]),0,None); a=a*np.clip(1-ex/90,0,1)
f=im.copy(); f[...,1]=np.minimum(f[...,1],np.maximum(f[...,0],f[...,2]))
sp=Image.fromarray(np.dstack([f,cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8))]).clip(0,255).astype(np.uint8)); sp=sp.crop(sp.getbbox())
w,cx,top=[int(v) for v in sys.argv[1:4]]
sp=sp.resize((w,round(sp.height*w/sp.width)),Image.LANCZOS)
p=Image.open('plate_v8.png').convert('RGBA')
# soft contact shadow under it
sh=Image.new('L',sp.size,0); sh.paste(sp.split()[3]); sh=Image.fromarray(cv2.GaussianBlur(np.array(sh),(0,0),12)//2)
shadow=Image.new('RGBA',sp.size,(20,10,30,0)); shadow.putalpha(sh); p.alpha_composite(shadow,(cx-w//2+10,top+14))
p.alpha_composite(sp,(cx-w//2,top)); p.convert('RGB').save('plate.png'); print(sp.size)
