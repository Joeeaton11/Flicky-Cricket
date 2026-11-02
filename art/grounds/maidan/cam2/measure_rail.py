import numpy as np, cv2, sys
o=cv2.imread(sys.argv[1]); H,W=o.shape[:2]; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H; B,G,R=[o[...,i].astype(int) for i in range(3)]
rail=(((R>120)&(G<80)&(B<90)&(R-G>60))|((R>215)&(G>215)&(B>210))).astype(np.uint8)
rows=[]; pts=[]
for a in range(0,360,2):
  t=np.radians(a)
  for k in np.arange(0.88,1.12,0.001):
    x=int(cx+np.cos(t)*rx*k); y=int(cy+np.sin(t)*ry*k)
    if not(0<=x<W and 0<=y<H): break
    if rail[max(0,y-1):y+2,max(0,x-1):x+2].sum()>=3: rows.append((a,(k-1)*np.hypot(np.cos(t)*rx,np.sin(t)*ry)/3)); pts.append((x,y)); break
(qx,qy),(qw,qh),_=cv2.fitEllipse(np.array(pts,np.float32)); print('rail: centre %.3f %.3f width %.3f height %.3f (game .500 .600 .920 .670)'%(qx/W,qy/H,qw/W,qh/H))
r=np.array(rows); print('phone px off per 30deg:',[(a,round(float(np.median(r[(r[:,0]>=a)&(r[:,0]<a+30),1])),1)) for a in range(0,360,30)])
