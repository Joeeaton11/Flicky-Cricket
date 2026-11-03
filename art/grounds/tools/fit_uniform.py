# NO-STRETCH fit (Joe, Nov 3: "stop stretching the image — create it so it fits first time").
# The plate is the generated image scaled by ONE uniform factor and moved; nothing is warped, squashed or snapped.
# usage (in a ground folder, after fit_grass.py wrote ell.npy): python3 ../tools/fit_uniform.py raw/plate_X.png
# Prompt target in the 768x1792 frame (from the coded oval .5W/.6H, radii .46W/.335H on 1170x2532, scale 1170/768):
#   field width 92% of the image width (edges ~4% in), height ~62% of the image height, ratio 1.576, top ~28%, bottom ~90%.
import numpy as np, cv2, sys
W,H=1170,2532; cx,cy,ax,ay=.5*W,.6*H,.46*W,.335*H
img=cv2.imread(sys.argv[1]); h,w=img.shape[:2]; ex,ey,ew,eh=np.load('ell.npy')
kx,ky=2*ax/ew,2*ay/eh; k=np.sqrt(kx*ky)                          # ONE scale for both axes: splits the painted-ratio error evenly
ox,oy=cx-ex*k,cy-ey*k
M=np.float32([[k,0,ox],[0,k,oy]]); o=cv2.warpAffine(img,M,(W,H),flags=cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_CONSTANT,borderValue=0)
# if the scaled image is a little narrower than the screen, fill each side by repeating the neighbouring strip of stand (moved, not mirrored or stretched), feathered
L=max(0,int(np.ceil(ox))); R=max(0,int(np.ceil(W-(ox+w*k))))
for side,n in (('L',L),('R',R)):
  if n<=0: continue
  n2=n+12
  if side=='L': src=o[:,n:n+n2].copy(); dst=slice(0,n2)
  else: src=o[:,W-n-n2:W-n].copy(); dst=slice(W-n2,W)
  a=np.ones(n2); 
  if side=='L': a[n:]=np.linspace(1,0,12)
  else: a[:12]=np.linspace(0,1,12)
  o[:,dst]=(src*a[None,:,None]+o[:,dst]*(1-a[None,:,None])).astype(o.dtype)
print('side fill px L %d R %d'%(L,R))
gap_top=max(0,int(np.ceil(oy))); gap_bot=max(0,int(np.ceil(H-(oy+h*k))))
side=np.hypot(ew*k/2-ax, 0); end=abs(eh*k/2-ay)
print('ratio painted %.3f (target 1.576)  scale %.3f  side err %.1f px  end err %.1f px  centre err x %.1f y %.1f  uncovered top %d bottom %d'
      %(eh/ew,k,ew*k/2-ax,eh*k/2-ay,(ox+ex*k)-cx,(oy+ey*k)-cy,gap_top,gap_bot))
cv2.imwrite('plate.png',o)
