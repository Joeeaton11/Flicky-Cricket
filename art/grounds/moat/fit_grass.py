# Fit the painted grass edge (grass hue mask, not colour distance) with fitEllipse on the SOURCE plate -> ell.npy
import numpy as np, cv2, sys
img=cv2.imread(sys.argv[1]); h,w=img.shape[:2]
hsv=cv2.cvtColor(cv2.GaussianBlur(img,(0,0),2),cv2.COLOR_BGR2HSV).astype(int)
g=((hsv[...,0]>=34)&(hsv[...,0]<=52)&(hsv[...,1]>150)&(hsv[...,2]>95)).astype(np.uint8)
g=cv2.morphologyEx(g,cv2.MORPH_CLOSE,np.ones((7,7),np.uint8)); n,l=cv2.connectedComponents(g); m=(l==l[int(h*.55),w//2]).astype(np.uint8)
m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((25,25),np.uint8))
cs,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE); c=max(cs,key=cv2.contourArea)[:,0,:].astype(np.float32)
e=cv2.fitEllipse(c); (ex,ey),(ew,eh),an=e; d=np.abs(np.hypot((c[:,0]-ex)/(ew/2),(c[:,1]-ey)/(eh/2))-1)
print('ellipse',[round(v,1) for v in (ex,ey,ew,eh)],'angle',round(an,1),'ratio',round(eh/ew,3),'contour dev px median/max',round(float(np.median(d))*ew/2,1),round(float(d.max())*ew/2,1))
np.save('ell.npy',np.array([ex,ey,ew,eh]))
