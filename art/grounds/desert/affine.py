# Close-camera v3: the painted field is a clean ellipse (fit_grass dev < 2 px), so map it onto the coded oval with ONE affine scale
# (no local warp, no snap_ring -> boards and crowd stay undistorted). Rows above the painted top are reported for sky_top.py.
import numpy as np, cv2, sys
W,H=1170,2532; cx,cy,ax,ay=.5*W,.6*H,.46*W,.335*H
img=cv2.imread(sys.argv[1]); ex,ey,ew,eh=np.load('ell.npy')
sx,sy=2*ax/ew,2*ay/eh; M=np.float32([[sx,0,cx-ex*sx],[0,sy,cy-ey*sy]])
o=cv2.warpAffine(img,M,(W,H),flags=cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_REFLECT)
cv2.imwrite('plate.png',o); top=int(np.ceil(max(0,cy-ey*sy))); print('scale x %.3f y %.3f (y/x %.3f) empty top rows %d'%(sx,sy,sy/sx,top))
