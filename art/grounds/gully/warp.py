import cv2, numpy as np
src=cv2.imread('plate2.png')
W,H=780,1688; sx=1.02; sy=H/src.shape[0]
img=cv2.resize(src,(round(src.shape[1]*sx),H),interpolation=cv2.INTER_LANCZOS4)
ox=(img.shape[1]-W)//2; img=img[:,ox:ox+W].copy()
cx,cy=W/2,0.60*H; RX,RY=0.46*W,0.335*H
# outer kerb boundary of painted field along each angle
hsv=cv2.cvtColor(img,cv2.COLOR_BGR2HSV)
sand=(hsv[...,0]>=5)&(hsv[...,0]<=25)&(hsv[...,1]>90)&(hsv[...,2]>150)
kerb=(hsv[...,1]<45)&(hsv[...,2]>185)
field=(sand|kerb).astype(np.uint8)
# keep the connected component at centre
n,lab=cv2.connectedComponents(field); field=(lab==lab[int(cy),int(cx)])
field=cv2.morphologyEx(field.astype(np.uint8),cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))
N=720; th=np.linspace(0,2*np.pi,N,endpoint=False); g=np.zeros(N)
for i,t in enumerate(th):
    dx,dy=np.cos(t),np.sin(t); last=0
    for r in range(5,1200):
        x,y=int(cx+dx*r),int(cy+dy*r)
        if not(0<=x<W and 0<=y<H): break
        if field[y,x]: last=r
        elif r-last>12: break
    g[i]=last
# robust: median then smooth
from scipy.ndimage import median_filter
g=median_filter(g,size=41,mode='wrap')
g=np.convolve(np.r_[g[-8:],g,g[:8]],np.ones(9)/9,'same')[8:-8]
# ellipse radius per angle (outer kerb edge ≈ coded boundary + 6px)
e=1/np.sqrt((np.cos(th)/(RX+6))**2+(np.sin(th)/(RY+6))**2)
np.save('/tmp/claude-0/sp/g.npy',g)
print('egg min/max',g.min(),g.max(),'ratio range',(g/e).min(),(g/e).max())
# dest -> source radial map
yy,xx=np.mgrid[0:H,0:W].astype(np.float32)
dx,dy=xx-cx,yy-cy; ang=np.mod(np.arctan2(dy,dx),2*np.pi); rho=np.hypot(dx,dy)
idx=(ang/(2*np.pi)*N).astype(int)%N
ee=e[idx]; gg=g[idx]
u=rho/ee
band=0.35
srad=np.where(u<=1, u*gg, np.where(u<1+band, gg+(rho-ee)*((ee*(1+band)-gg)/(ee*band)), rho))
mx=(cx+np.cos(ang)*srad).astype(np.float32); my=(cy+np.sin(ang)*srad).astype(np.float32)
out=cv2.remap(img,mx,my,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REFLECT)
cv2.imwrite('plate_fit.png',out)
chk=cv2.resize(out,(390,844)); cv2.ellipse(chk,(195,int(0.6*844)),(int(0.46*390),int(0.335*844)),0,0,360,(255,0,255),1)
cv2.imwrite('/tmp/claude-0/sp/fit2.jpg',chk)
