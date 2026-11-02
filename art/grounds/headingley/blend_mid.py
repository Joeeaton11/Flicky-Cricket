# Joe: keep the v1 layout (top + bottom), fix the middle. Both plates are snapped to the same coded oval, so the side stands +
# boards from v2 (even crowd scale, clean boards) drop straight into v1 outside the grass, feathered top and bottom.
import numpy as np, cv2, sys
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
v1=cv2.imread('plate_v1.png').astype(np.float32); v2=cv2.imread('plate_v2.png').astype(np.float32)
y0,y1,F=int(sys.argv[1]),int(sys.argv[2]),int(sys.argv[3])
yy,xx=np.mgrid[0:H,0:W]; r=np.hypot((xx-cx)/rx,(yy-cy)/ry)
side=np.clip((r-0.975)/0.01,0,1)                       # outside the grass (boards + crowd); grass keeps v1
vert=np.clip(np.minimum(yy-y0,y1-yy)/F,0,1); vert=vert*vert*(3-2*vert)
m=(side*vert)[...,None]
o=v1*(1-m)+v2*m; cv2.imwrite('plate.png',o.clip(0,255).astype(np.uint8))
