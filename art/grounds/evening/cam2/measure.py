import numpy as np, cv2, sys
o=cv2.imread(sys.argv[1]); H,W=o.shape[:2]; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
B,G,R=[o[...,i].astype(int) for i in range(3)]; g=((G>R+10)&(G>B+40)&(B<120)).astype(np.uint8)
g=cv2.morphologyEx(g,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
pts=[]; rows=[]
for a in range(0,360,2):
  t=np.radians(a); last=None
  for k in np.arange(0.8,1.2,0.001):
    x=int(cx+np.cos(t)*rx*k); y=int(cy+np.sin(t)*ry*k)
    if not(0<=x<W and 0<=y<H): break
    if g[max(0,y-2):y+3,max(0,x-2):x+3].mean()<0.3: last=k; break
  if last: pts.append((cx+np.cos(t)*rx*last,cy+np.sin(t)*ry*last)); rows.append((a,(last-1)*np.hypot(np.cos(t)*rx,np.sin(t)*ry)/3))
(qx,qy),(qw,qh),_=cv2.fitEllipse(np.array(pts,np.float32))
print('grass edge: centre %.3f %.3f width %.3f height %.3f (game .500 .600 .920 .670)'%(qx/W,qy/H,qw/W,qh/H))
r=np.array(rows); print('phone px off per 30deg (+ = grass beyond boundary):',[(a,round(float(np.median(r[(r[:,0]>=a)&(r[:,0]<a+30),1])),1)) for a in range(0,360,30)])
