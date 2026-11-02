# Railway Camera 2 (Figma 378:191): find the yellow sleeper wall (inner edge), pick ONE even scale + offset that best lands it on the game oval. No warping.
import numpy as np, cv2, sys
img=cv2.imread('plate_raw.png'); h,w=img.shape[:2]; B,G,R=[img[...,i].astype(int) for i in range(3)]
yel=((R>190)&(G>150)&(B<90)&(R-B>120)).astype(np.uint8); yel=cv2.morphologyEx(yel,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
cx0,cy0,ax,ay=432,840,300,560; pts=[]
for a in np.arange(0,360,1):
  t=np.radians(a)
  for k in np.arange(0.8,1.25,0.003):   # inner edge of the wall = first yellow going outward
    x=int(cx0+np.cos(t)*ax*k); y=int(cy0+np.sin(t)*ay*k)
    if not(0<=x<w and 0<=y<h): break
    if yel[max(0,y-2):y+3,max(0,x-2):x+3].sum()>=4: pts.append((x,y)); break
c=np.array(pts,float); (ex,ey),(ew,eh),ang=cv2.fitEllipse(c.astype(np.float32)); print('wall ellipse',round(ex),round(ey),round(ew),round(eh),'ratio',round(eh/ew,3),'target 1.576')
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H; best=None
for s in np.arange(1.3,1.9,0.0025):
  X=(c[:,0]-ex)*s+cx; Y=(c[:,1]-ey)*s+cy
  th=np.arctan2((Y-cy)/ry,(X-cx)/rx); Rr=np.hypot(np.cos(th)*rx,np.sin(th)*ry)
  d=(np.sqrt(((X-cx)/rx)**2+((Y-cy)/ry)**2)-1)*Rr
  sc=np.abs(d).mean()
  if best is None or sc<best[0]: best=(sc,s,d)
sc,s,d=best; print('scale',round(s,4),'mean |offset| plate px',round(sc,1),'range',round(d.min()),round(d.max()))
np.save('fit.npy',np.array([s,ex,ey]))
