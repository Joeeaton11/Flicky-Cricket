# 1.e Village Camera 2 (Figma 376:191, sunburst). Fence ellipse fitted (centre 424,850; axes 671x1056) -> ONE even scale, no rows.
import numpy as np, cv2
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
ecx,ecy,ew,eh=424.3,850.2,670.9,1056.2
s=(2*rx)/ew; print('scale',round(s,4),'height match',round(eh*s/(2*ry),3))
img=cv2.imread('plate_raw.png')
up=cv2.resize(img,(round(img.shape[1]*s),round(img.shape[0]*s)),interpolation=cv2.INTER_CUBIC).astype(np.float32)
ox=int(round(ecx*s-cx)); oy=int(round(ecy*s-cy)); print('ox',ox,'oy',oy,up.shape)
if oy<0:   # extend the top by mirroring the painted top band (canopy continues as leaves, sky as sky), softly blurred
  n=-oy; top=up[1:n+1][::-1].copy(); top=cv2.GaussianBlur(top,(0,0),1.5)
  up=np.concatenate([top,up],0); oy=0
  # mirrored kids/flag would hang upside down: cover them with canopy leaves / sky from just below
  pass
c=np.clip(up[oy:oy+H,ox:ox+W],0,255).astype(np.uint8)
if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
# patch the upside-down bits in the mirrored band with nearby canopy leaves / sky (feathered)
def patch(dst,src_box,dst_xy):
  x1,y1,x2,y2=src_box; p=dst[y1:y2,x1:x2].astype(np.float32); h,w=p.shape[:2]; dx,dy=dst_xy
  m=np.ones((h,w),np.float32); m=cv2.GaussianBlur(cv2.copyMakeBorder(m[8:-8,8:-8],8,8,8,8,cv2.BORDER_CONSTANT,0),(0,0),5)[...,None]
  dst[dy:dy+h,dx:dx+w]=(dst[dy:dy+h,dx:dx+w]*(1-m)+p*m).astype(np.uint8)
patch(c,(840,95,1150,185),(700,0))
patch(c,(0,115,300,215),(0,-8)) if False else None
patch(c,(0,112,300,212),(0,0)); c[0:10,0:300]=c[10:20,0:300]; c[0:10,700:1020]=c[12:22,700:1020]
o=cv2.addWeighted(c,1.2,cv2.GaussianBlur(c,(0,0),2),-0.2,0); cv2.imwrite('plate.png',o)
v=o.copy(); cv2.ellipse(v,(int(cx),int(cy)),(int(rx),int(ry)),0,0,360,(255,0,255),2); cv2.imwrite('check.png',cv2.resize(v,(390,844)))
