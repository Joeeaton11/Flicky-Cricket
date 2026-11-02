# 5.d Edgbaston (416:191): the near-end clock tower rises over the bottom of the coded field. Replace the tower's upper part
# with the scene one grass-stripe period (221 px) to the side, shifted to follow the PAINTED grass edge (parabola fitted
# on the columns either side of the tower), feathered. Run on the un-snapped build_clean output, then snap_ring.
import numpy as np, cv2
o=cv2.imread('plate.png').astype(np.float32); out=o.copy(); H,W=o.shape[:2]
hsv=cv2.cvtColor(o.astype(np.uint8),cv2.COLOR_BGR2HSV).astype(int)
g=(hsv[...,0]>=34)&(hsv[...,0]<=46)&(hsv[...,1]>150)&(hsv[...,2]>95)
xs=[x for x in range(250,920,5) if not 515<x<665]; ys=[2000+np.where(g[2000:,x])[0].max() for x in xs]
p=np.polyfit(xs,ys,2); edge=lambda x: np.polyval(p,x)
x0,x1,y0,y1,F,P=520,656,2110,2445,16,221
for x in range(x0,x1):
  sx=x-P if x<W/2 else x+P
  dy=int(round(edge(x)-edge(sx)))
  col=o[y0-dy:y1-dy,sx]
  w=min(1,(x-x0)/F,(x1-1-x)/F)
  vy=np.minimum(1,np.minimum(np.arange(y1-y0)/F,(y1-y0-1-np.arange(y1-y0))/F))[:,None]
  ww=w*np.maximum(vy,(np.arange(y1-y0)[:,None]<(y1-y0-F))*1.0) if False else w*np.clip(np.minimum(np.arange(y1-y0)/F,1),0,1)[:,None]
  out[y0:y1,x]=o[y0:y1,x]*(1-ww)+col*ww
m=np.zeros((H,W),np.float32); m[y0:y1,W//2-8:W//2+8]=1; m=cv2.GaussianBlur(m,(0,0),4)[...,None]
out=out*(1-m)+cv2.GaussianBlur(out,(0,0),2.5)*m
cv2.imwrite('plate.png',out.clip(0,255).astype(np.uint8))
