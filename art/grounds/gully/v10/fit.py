# Gully v10 (busy): ONE even scale (no warping). The game's field + kerb are drawn in code on the exact oval;
# painted sand/kerb that would show outside it is painted over with street paving.
import cv2, numpy as np
src=cv2.imread('plate.png'); sh,sw=src.shape[:2]; hsv=cv2.cvtColor(src,cv2.COLOR_BGR2HSV)
sand=((hsv[...,0]>=8)&(hsv[...,0]<=20)&(hsv[...,1]>90)&(hsv[...,2]>170)).astype(np.uint8)
n,lab=cv2.connectedComponents(sand); f=(lab==lab[780,384]).astype(np.uint8)
ys,xs=np.nonzero(f); pcx,pcy=(xs.min()+xs.max())/2,(ys.min()+ys.max())/2; print('painted field',xs.min(),xs.max(),ys.min(),ys.max())
yel=((hsv[...,0]>=15)&(hsv[...,0]<=38)&(hsv[...,1]>100)&(hsv[...,2]>130)); blk=(hsv[...,2]<80)&(hsv[...,1]<90)
ring=cv2.dilate(f,np.ones((61,61),np.uint8))>0
kerb=((yel|blk)&ring&(f==0)).astype(np.uint8)
n2,lab2,st2,_=cv2.connectedComponentsWithStats(cv2.dilate(kerb,np.ones((5,5),np.uint8)))
keep=np.zeros_like(kerb,bool)
for i in range(1,n2):
    if st2[i][4]>150: keep|=(lab2==i)
kerb=(keep&(kerb>0)).astype(np.uint8)
paint=cv2.dilate(((f>0)|(kerb>0)).astype(np.uint8),np.ones((7,7),np.uint8))
OW,OH=1170,2532; s=0.645*3                     # css scale 0.645 -> 3x output
dy=0.60*OH-pcy*s; dx=OW/2-pcx*s
big=cv2.imread('/tmp/claude-0/sp/g10_x4.png'); k=s/4
M=np.float32([[k,0,dx],[0,k,dy]])
out=cv2.warpAffine(big,M,(OW,OH),flags=cv2.INTER_AREA,borderMode=cv2.BORDER_REPLICATE)
pm=cv2.warpAffine(paint*255,np.float32([[s,0,dx],[0,s,dy]]),(OW,OH),flags=cv2.INTER_NEAREST)
yy,xx=np.mgrid[0:OH,0:OW]; cx,cy,rx,ry=OW/2,0.60*OH,0.46*OW+30,0.335*OH+30
inside=((xx-cx)/rx)**2+((yy-cy)/ry)**2<1
mask=(pm>0)&~inside
hs=cv2.cvtColor(out,cv2.COLOR_BGR2HSV); band=(~inside)&(((xx-cx)/(rx+60))**2+((yy-cy)/(ry+60))**2<1)&(hs[...,1]<45)&(hs[...,2]>90)&(hs[...,2]<200)
pav=np.median(out[band].reshape(-1,3),0); print('paving',pav, 'top/bottom painted field y%', (pcy*s-(pcy-ys.min())*s)/OH, ((ys.max()-pcy)*s+0.6*OH)/OH)
fill=np.zeros_like(out,np.float32)+pav; rs=np.random.RandomState(3)
for _ in range(60):
    x,y=rs.randint(0,OW),rs.randint(0,OH); cv2.ellipse(fill,(x,y),(rs.randint(16,50),rs.randint(6,16)),0,0,360,(pav*0.94).tolist(),-1)
m=cv2.GaussianBlur((cv2.dilate(mask.astype(np.uint8),np.ones((9,9),np.uint8))*255),(15,15),0)/255.
m[inside]=0; m=m[...,None]
res=(out*(1-m)+fill*m).clip(0,255).astype(np.uint8)
cv2.imwrite('plate_fit.png',res)
chk=cv2.resize(res,(390,844),interpolation=cv2.INTER_AREA); cv2.ellipse(chk,(195,int(0.6*844)),(int(0.46*390),int(0.335*844)),0,0,360,(255,0,255),1)
cv2.imwrite('/tmp/claude-0/sp/g10fit.jpg',chk)
