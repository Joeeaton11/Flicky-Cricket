# Correct boundary check: per angle, distance (phone px) from the coded oval to the INNER edge of the painted boards
# (grass = bright green: G>R+20, G>B+60, R>95; the dark green boards are not grass). + = grass beyond the coded oval (gap).
import numpy as np, cv2, sys
def measure(o, step=3):
  H,W=o.shape[:2]; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
  hsv=cv2.cvtColor(cv2.GaussianBlur(o,(0,0),2),cv2.COLOR_BGR2HSV).astype(int)
  g=((hsv[...,0]>=34)&(hsv[...,0]<=46)&(hsv[...,1]>150)&(hsv[...,2]>95)).astype(np.uint8)   # grass hue 41-44 (boards ~50+, darker)
  g=cv2.morphologyEx(g,cv2.MORPH_CLOSE,np.ones((7,7),np.uint8)); n,l=cv2.connectedComponents(g); grass=l==l[int(cy),int(cx)]
  out=[]
  for a in range(0,360,step):
    t=np.radians(a); Rr=np.hypot(np.cos(t)*rx,np.sin(t)*ry); k=0.85
    while k<1.2:
      x=int(cx+np.cos(t)*rx*k); y=int(cy+np.sin(t)*ry*k)
      if not(0<=x<W and 0<=y<H): break
      if not grass[y,x]:
        # need 4 consecutive non-grass samples to count as the edge (skip specks)
        ok=True
        for j in range(1,5):
          xx=int(cx+np.cos(t)*rx*(k+j*.003)); yy=int(cy+np.sin(t)*ry*(k+j*.003))
          if 0<=xx<W and 0<=yy<H and grass[yy,xx]: ok=False; break
        if ok: break
      k+=0.0015
    out.append((a,(k-1)*Rr/3))
  return np.array(out)
if __name__=='__main__':
  r=measure(cv2.imread(sys.argv[1]))
  print('per 30deg (phone px, + = gap):',[(a,round(float(np.median(r[(r[:,0]>=a)&(r[:,0]<a+30),1])),1)) for a in range(0,360,30)])
  print('max',round(float(np.abs(r[:,1]).max()),1),'p90',round(float(np.percentile(np.abs(r[:,1]),90)),1))
