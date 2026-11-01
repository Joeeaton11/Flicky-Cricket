import numpy as np, cv2
from PIL import Image, ImageDraw
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('plate3_raw.png').astype(np.float32)
fcx,fcy,fhw,fhh=385,742,318,415
s=rx/fhw                                     # floor width = our oval width
need=ry/s-fhh                                # extra floor height (source px) to reach our oval's height
ins=int(round(need*2))-36; a0=fcy-ins//2-10; a1=a0+ins   # repeat a band through the middle of the floor
F=24; top=img[:a1]; band=img[a0:a1].copy(); rest=img[a1:]
# crossfade the seam at the start of the repeated band and at its end
w=np.linspace(0,1,F)[:,None,None]
band[:F]=img[a1-F:a1]*(1-w)+band[:F]*w
rest=rest.copy(); rest[:F]=band[-F:]*(1-w)+rest[:F]*w
src=np.concatenate([top,band,rest],0); print('scale',round(s,3),'inserted',ins,'source h',src.shape[0])
up=cv2.resize(src,(round(src.shape[1]*s),round(src.shape[0]*s)),interpolation=cv2.INTER_CUBIC)
ncy=(fcy+ins/2)*s; ox=int(fcx*s-cx); oy=int(ncy-cy)
canvas=np.zeros((H,W,3),np.float32)
if oy<0:                                     # extend the sky upward
  pad=-oy; sky=up[:8].mean(0,keepdims=True); grad=np.repeat(sky,pad,0)
  up=np.concatenate([grad,up],0); oy=0
canvas=up[oy:oy+H,ox:ox+W]
if canvas.shape[0]<H: canvas=np.concatenate([canvas,np.repeat(canvas[-1:],H-canvas.shape[0],0)],0)
out=np.clip(canvas,0,255).astype(np.uint8); out=cv2.addWeighted(out,1.35,cv2.GaussianBlur(out,(0,0),2),-0.35,0)
cv2.imwrite('plate.png',out)
im=Image.fromarray(cv2.cvtColor(out,cv2.COLOR_BGR2RGB)); d=ImageDraw.Draw(im); d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],outline=(255,0,0),width=5)
im.resize((390,844)).save('plate_check.png')
