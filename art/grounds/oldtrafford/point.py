# Joe (Nov 2): the boxy red Point block on the right was terrible. A cartoon Point (Figma 419:191: red wedge roof rising to a
# sharp point, curved glass, balcony) keyed off green and laid over the old block, its base tucked behind the right stand roof.
import numpy as np, cv2, sys
from PIL import Image
im=np.array(Image.open('raw/point_419-191.png').convert('RGB')).astype(float)
a=np.clip((np.sqrt(((im-[0,255,0])**2).sum(2))-45)/60,0,1); ex=np.clip(im[...,1]-np.maximum(im[...,0],im[...,2]),0,None); a=a*np.clip(1-ex/90,0,1)
f=im.copy(); f[...,1]=np.minimum(f[...,1],np.maximum(f[...,0],f[...,2]))
sp=Image.fromarray(np.dstack([f,cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8))]).clip(0,255).astype(np.uint8)); sp=sp.crop(sp.getbbox())
x0,yb,w,cut=[int(v) for v in sys.argv[1:5]]          # left edge, bottom line on the plate, width, rows trimmed off the sprite bottom (pillars)
k=w/sp.width; sp=sp.resize((w,round(sp.height*k)),Image.LANCZOS); sp=sp.crop((0,0,sp.width,sp.height-cut))
A=np.array(sp).astype(float); F=18; A[-F:,:,3]*=np.linspace(1,0,F)[:,None]; sp=Image.fromarray(A.astype(np.uint8))
base=np.array(Image.open('plate_v1.png').convert('RGB')).astype(float)
# clear the old block first: the viaduct, canal and houses beside it continued to the right (copied 200 px along), feathered
X0,Y0,Y1,D,FF=940,140,520,200,30
WW=base.shape[1]; src=base[Y0:Y1,X0-D:WW-D].copy(); h,w=src.shape[:2]
wx=np.clip(np.arange(w)/FF,0,1)[None,:]; wy=np.clip(np.arange(h)/FF,0,1)[:,None]; wgt=(wx*wy)[...,None]
base[Y0:Y1,X0:WW]=base[Y0:Y1,X0:WW]*(1-wgt)+src*wgt
p=Image.fromarray(base.astype(np.uint8)).convert('RGBA'); p.alpha_composite(sp,(x0,yb-sp.height)); p.convert('RGB').save('plate.png'); print(sp.size,(x0,yb-sp.height))
