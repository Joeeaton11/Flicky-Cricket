# 6.e Adelaide: the painted near-end crowd below the white stand wall is giant (close-up heads). Replace everything below the
# wall with the near stand's own white roof/canopy: per column, find the bottom of the white wall, then continue it down as a
# softly shaded white canopy with a navy trim line and faint panel seams, like the sail roofs on the sides.
import numpy as np, cv2
o=cv2.imread('plate_fit.png').astype(np.float32); H,W=o.shape[:2]
hsv=cv2.cvtColor(o.astype(np.uint8),cv2.COLOR_BGR2HSV)
white=(hsv[...,1]<40)&(hsv[...,2]>200)
cut=np.zeros(W,int)
for x in range(W):
  col=white[2330:2470,x]; ys=np.where(col)[0]
  cut[x]=2330+(ys.max() if len(ys) else 70)
xs=np.arange(W); p=np.polyfit(xs,cut,2); cut=(np.polyval(p,xs)).astype(int)+6
out=o.copy()
for x in range(W):
  y0=cut[x]; n=H-y0
  t=np.linspace(0,1,n)[:,None]
  base=np.array([245,242,240.])*(1-.22*t)+np.array([200,190,185.])*.22*t
  out[y0:,x]=base
  out[y0:y0+5,x]=[90,40,30]      # navy trim (BGR)
  for k in range(1,6):
    yy=y0+5+k*26
    if yy<H: out[yy:yy+2,x]=out[yy:yy+2,x]*.93   # curved panel seams following the roof edge
out[:, :]=np.where((np.arange(H)[:,None,None]>=cut[None,:,None]-3)&(np.arange(H)[:,None,None]<=cut[None,:,None]+8),cv2.GaussianBlur(out,(0,0),1.2),out)
cv2.imwrite('plate.png',out.clip(0,255).astype(np.uint8)); print(cut.min(),cut.max())
