import numpy as np, cv2
img=cv2.imread('plate_raw.png'); hs=cv2.cvtColor(img,cv2.COLOR_BGR2HSV).astype(int)
g=((hs[...,0]>=26)&(hs[...,0]<=62)&(hs[...,1]>70)).astype(np.uint8)
n,l=cv2.connectedComponents(cv2.morphologyEx(g,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))); f=(l==l[890,432]).astype(np.uint8)
cs,_=cv2.findContours(f,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE); c=max(cs,key=len)[:,0,:].astype(float)
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
best=[]
for s in np.arange(1.45,1.75,0.01):
  for mid in [850,890,930]:
    for L in range(0,400,10):
      p=c.copy(); p[p[:,1]>mid,1]+=L
      for oy in np.arange(-40,41,10):
        X=(p[:,0]-432)*s+cx; Y=(p[:,1]-(434+1339+L)/2)*s+cy+oy
        rho=np.sqrt(((X-cx)/rx)**2+((Y-cy)/ry)**2)
        dev=(rho-1)*np.hypot(rx,ry)/1.4   # ~px
        best.append((np.abs(dev).max(),dev.max(),dev.min(),s,mid,L,oy))
best.sort(); print(*best[:5],sep='\n')
