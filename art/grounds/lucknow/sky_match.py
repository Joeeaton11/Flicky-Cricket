# fill the uncovered top rows with the painted sky's own colour (per column, slightly deeper upward) — for dusk/night skies where sky_top's blue would clash
import numpy as np, cv2, sys
p=cv2.imread('plate.png').astype(np.float32); T=int(sys.argv[1])
ref=cv2.GaussianBlur(p[T:T+24],(0,0),18).mean(0)
for y in range(T): p[y]=ref*(0.9+0.1*y/T)
a=np.linspace(1,0,30)[:,None,None]; p[T:T+30]=ref[None]*a*0.0+p[T:T+30]   # keep painted rows as-is
cv2.imwrite('plate.png',p.clip(0,255).astype(np.uint8))
