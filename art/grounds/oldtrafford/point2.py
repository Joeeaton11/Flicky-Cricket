# Joe (Nov 2, cam3 plate): the painted Point roof was a smeared slab. Lay the standalone cartoon Point (Figma 419:191) over it,
# its lower floors fading into the plate's own glass stand + fans, and the red-roofed corner tower put back on top.
import numpy as np, cv2, sys
from PIL import Image
im=np.array(Image.open((sys.argv[5] if len(sys.argv)>5 else 'raw/point_419-191.png')).convert('RGB')).astype(float)
a=np.clip((np.sqrt(((im-[0,255,0])**2).sum(2))-45)/60,0,1); ex=np.clip(im[...,1]-np.maximum(im[...,0],im[...,2]),0,None); a=a*np.clip(1-ex/90,0,1)
f=im.copy(); f[...,1]=np.minimum(f[...,1],np.maximum(f[...,0],f[...,2]))
sp=Image.fromarray(np.dstack([f,cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8))]).clip(0,255).astype(np.uint8)); sp=sp.crop(sp.getbbox())
x0,yb,w,keep=[int(v) for v in sys.argv[1:5]]   # left, bottom line, width, fraction*100 of sprite height kept (top part)
k=w/sp.width; sp=sp.resize((w,round(sp.height*k)),Image.LANCZOS); sp=sp.crop((0,0,w,round(sp.height*keep/100)))
A=np.array(sp).astype(float); F=40; A[-F:,:,3]*=np.linspace(1,0,F)[:,None]; sp=Image.fromarray(A.astype(np.uint8))
base=Image.open('plate_cam3.png').convert('RGBA'); orig=np.array(base).astype(float)
b=orig.copy(); X0,X1,Y0,Y1,D,FF=800,880,160,250,90,12   # old painted roof tip poking out left of the new building: houses/sky from beside it
src=b[Y0:Y1,X0-D:X1-D]; h,w=src.shape[:2]; wg=np.minimum(np.minimum(np.arange(w)[None,:]+1,w-np.arange(w)[None,:])/FF,np.minimum(np.arange(h)[:,None]+1,h-np.arange(h)[:,None])/FF).clip(0,1)[...,None]
b[Y0:Y1,X0:X1]=b[Y0:Y1,X0:X1]*(1-wg)+src*wg; base=Image.fromarray(b.astype(np.uint8))
base.alpha_composite(sp,(x0,yb-sp.height)); out=np.array(base).astype(float)
# corner tower back on top (its red cone + brick shaft), from the original plate
tm=np.zeros(out.shape[:2],np.float32); cv2.fillPoly(tm,[np.array([[1065,440],[1020,560],[1020,780],[1125,780],[1125,560]])],1); tm=cv2.GaussianBlur(tm,(0,0),2)[...,None]
out=out*(1-tm)+orig*tm
Image.fromarray(out.astype(np.uint8)).convert('RGB').save('plate.png'); print(sp.size,(x0,yb-sp.height))
