# Fit the painted field (sand + its kerb) onto the game's oval, output at 3x phone size (1170x2532)
import cv2, numpy as np
field=np.load('/tmp/claude-0/sp/field5.npy'); big=cv2.imread('plate_v5_x4.png')
sh,sw=field.shape; S4=big.shape[0]/sh
OW,OH=1170,2532
fcx,fcy=383.5,901.5
N=720; th=np.linspace(0,2*np.pi,N,endpoint=False); g=np.zeros(N)
for i,t in enumerate(th):
    dx,dy=np.cos(t),np.sin(t); last=0
    for r in range(5,700):
        x,y=int(fcx+dx*r),int(fcy+dy*r)
        if not(0<=x<sw and 0<=y<sh): break
        if field[y,x]: last=r
        elif r-last>10: break
    g[i]=last
from scipy.ndimage import median_filter
g=median_filter(g,size=31,mode='wrap'); g=np.convolve(np.r_[g[-6:],g,g[:6]],np.ones(7)/7,'same')[6:-6]
# target: coded oval in output pixels; the painted kerb (~13 src px wide) sits just outside it
cx,cy=OW/2,0.60*OH; RX,RY=0.46*OW,0.335*OH; kerb=13
yy,xx=np.mgrid[0:OH,0:OW].astype(np.float32)
dx,dy=xx-cx,yy-cy; ang=np.mod(np.arctan2(dy,dx),2*np.pi); rho=np.hypot(dx,dy)
idx=(ang/(2*np.pi)*N).astype(int)%N
e=1/np.sqrt((np.cos(ang)/RX)**2+(np.sin(ang)/RY)**2)          # coded boundary radius (out px)
gs=g[idx]                                                       # painted sand radius (src px)
# outside the field: global scale so the street keeps its proportions
gsx=OW/sw; gsy=OH/sh                                             # plain stretch of the whole image
band=0.45; u=rho/e
# inside: map coded oval -> painted sand edge; kerb band: e..e*(1+k) -> sand..sand+kerb ; beyond: blend to plain stretch
srcr_in=u*gs
kOut=e+kerb*gsx*1.0
plain_x=xx/gsx; plain_y=yy/gsy
mx_in=fcx+np.cos(ang)*srcr_in; my_in=fcy+np.sin(ang)*srcr_in
srk=gs+(rho-e)/(kOut-e)*kerb
mx_k=fcx+np.cos(ang)*srk; my_k=fcy+np.sin(ang)*srk
w=np.clip((rho-kOut)/(e*band),0,1); w=w*w*(3-2*w)
srb=gs+kerb+(rho-kOut)/gsx
mx_b=fcx+np.cos(ang)*srb; my_b=fcy+np.sin(ang)*srb
mx_o=mx_b*(1-w)+plain_x*w; my_o=my_b*(1-w)+plain_y*w
mx=np.where(rho<=e,mx_in,np.where(rho<=kOut,mx_k,mx_o)).astype(np.float32)*S4
my=np.where(rho<=e,my_in,np.where(rho<=kOut,my_k,my_o)).astype(np.float32)*S4
out=cv2.remap(big,mx,my,cv2.INTER_AREA if False else cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
cv2.imwrite('plate_fit_v5.png',out)
chk=cv2.resize(out,(390,844),interpolation=cv2.INTER_AREA)
cv2.ellipse(chk,(195,int(0.6*844)),(int(0.46*390),int(0.335*844)),0,0,360,(255,0,255),1)
cv2.imwrite('/tmp/claude-0/sp/fit5.jpg',chk); print('ok')
