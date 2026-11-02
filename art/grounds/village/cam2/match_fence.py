# Move the painted fence ring exactly onto the game oval. Per angle: fence at rho=f(t). Inside: source rho = r*f (plain grass, imperceptible).
# Outside: ease back to identity over D px so the crowd barely moves.
import numpy as np, cv2, sys
img=cv2.imread(sys.argv[1]); H,W=img.shape[:2]; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
B,G,R=[img[...,i].astype(int) for i in range(3)]
orange=((R>200)&(G>80)&(G<175)&(B<70)&(R-G>50)).astype(np.uint8); orange=cv2.morphologyEx(orange,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
N=360; f=np.ones(N)
for i in range(N):
  t=2*np.pi*i/N
  for k in np.arange(0.85,1.15,0.001):
    x=int(cx+np.cos(t)*rx*k); y=int(cy+np.sin(t)*ry*k)
    if not(0<=x<W and 0<=y<H): break
    if orange[max(0,y-2):y+3,max(0,x-2):x+3].sum()>=4: f[i]=k; break
k=np.exp(-0.5*(np.arange(-20,21)/7.0)**2); k/=k.sum(); f=np.convolve(np.concatenate([f[-20:],f,f[:20]]),k,'same')[20:-20]
f=np.clip(f,0.9,1.1); print('fence rho min/max',f.min().round(3),f.max().round(3))
yy,xx=np.mgrid[:H,:W].astype(np.float32); dx,dy=(xx-cx)/rx,(yy-cy)/ry; rho=np.sqrt(dx*dx+dy*dy)+1e-6
th=np.arctan2(dy,dx)%(2*np.pi); fi=f[(th/(2*np.pi)*N).astype(int)%N]
Rr=np.hypot(np.cos(th)*rx,np.sin(th)*ry); D=350.0/Rr
src=np.where(rho<=1, rho*fi, np.where(rho<=1+D, fi+(rho-1)*(1+D-fi)/D, rho))
mx=(cx+dx/rho*src*rx).astype(np.float32); my=(cy+dy/rho*src*ry).astype(np.float32)
out=cv2.remap(img,mx,my,cv2.INTER_CUBIC,borderMode=cv2.BORDER_REPLICATE); cv2.imwrite(sys.argv[2],out)
