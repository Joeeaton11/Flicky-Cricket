# field edge: rays from the centre until the colour leaves the field's own (Lab distance), robust ellipse fit -> ell.npy
import numpy as np, cv2, sys
img=cv2.imread(sys.argv[1]); h,w=img.shape[:2]; thr=float(sys.argv[2]) if len(sys.argv)>2 else 28
lab=cv2.cvtColor(cv2.GaussianBlur(img,(0,0),7),cv2.COLOR_BGR2LAB).astype(float)
c=(w//2,int(h*.56)); ref=np.median(lab[int(h*.45):int(h*.65),int(w*.3):int(w*.7)].reshape(-1,3),0)
pts=[]
for a in range(0,360,3):
  t=np.radians(a)
  for r in range(100,900):
    x=int(c[0]+np.cos(t)*r*0.5); y=int(c[1]+np.sin(t)*r*0.8)
    if not(0<=x<w and 0<=y<h): break
    if np.linalg.norm(lab[y,x]-ref)>thr: pts.append((x,y)); break
pts=np.array(pts,np.float32); e=cv2.fitEllipse(pts)
for _ in range(2):
  (ex,ey),(ew,eh),an=e; d=np.abs(np.hypot((pts[:,0]-ex)/(ew/2),(pts[:,1]-ey)/(eh/2))-1); e=cv2.fitEllipse(pts[d<np.quantile(d,.85)])
print(e,'ratio',e[1][1]/e[1][0]); np.save('ell.npy',np.array([e[0][0],e[0][1],e[1][0],e[1][1]]))
v=img.copy(); cv2.ellipse(v,e,(255,0,255),2); [cv2.circle(v,(int(x),int(y)),3,(0,0,255),-1) for x,y in pts]; cv2.imwrite('raw/ellcheck.jpg',cv2.resize(v,(w//2,h//2)))
