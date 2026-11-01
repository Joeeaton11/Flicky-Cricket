import numpy as np, cv2
from PIL import Image, ImageDraw
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('plate8_raw.png'); h0,w0=img.shape[:2]
lab=cv2.cvtColor(img,cv2.COLOR_BGR2LAB).astype(np.float32)
ref=np.median(lab[650:850,300:480].reshape(-1,3),0)
earth=(np.linalg.norm(lab-ref,axis=2)<24).astype(np.uint8); earth=cv2.morphologyEx(earth,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))
n,l,st,_=cv2.connectedComponentsWithStats(earth); fld=(l==l[750,390])
ys=np.where(fld.any(1))[0]; ftop,fbot=ys.min(),ys.max(); xs=np.where(fld[750])[0]; print('field',ftop,fbot,xs.min(),xs.max())
s=2*ry/(fbot-ftop); need=int(round(2*rx/s-(xs.max()-xs.min()))); print('scale',round(s,3),'seams',need)
g=cv2.cvtColor(img,cv2.COLOR_BGR2GRAY).astype(np.float32)
E=np.abs(cv2.Sobel(g,cv2.CV_32F,1,0))+np.abs(cv2.Sobel(g,cv2.CV_32F,0,1))
E=cv2.GaussianBlur(E,(0,0),2)+np.where(fld,0,8)                      # prefer the plain field
E[:, :xs.min()+15]+=1e4; E[:, xs.max()-15:]+=1e4
E[160:300,310:460]+=1e4      # station building
E[180:300,20:330]+=3e3; E[180:300,450:740]+=3e3   # footbridges + containers
E[1140:1376,:]+=0             # road: seams may duplicate asphalt
                      # never through the sides
def find_seam(E):
  h,w=E.shape; M=E.copy(); B=np.zeros((h,w),np.int8)
  for y in range(1,h):
    p=M[y-1]; l=np.r_[np.inf,p[:-1]]; r=np.r_[p[1:],np.inf]; st=np.vstack([l,p,r]); a=st.argmin(0); B[y]=a-1; M[y]+=st[a,np.arange(w)]
  x=int(M[-1].argmin()); seam=np.zeros(h,int)
  for y in range(h-1,-1,-1): seam[y]=x; x+=int(B[y,x])
  return seam
# find k seams on a shrinking copy, track original positions
idx=np.tile(np.arange(w0),(h0,1)); Ec=E.copy(); seams=[]
for k in range(need):
  sm=find_seam(Ec); seams.append(idx[np.arange(h0),sm].copy())
  keep=np.ones_like(Ec,bool); keep[np.arange(h0),sm]=False
  Ec=Ec[keep].reshape(h0,-1); idx=idx[keep].reshape(h0,-1)
# insert: duplicate each seam pixel (averaged with neighbour)
out=img.astype(np.float32); seams=np.array(seams)  # k x h
for y in range(h0):
  cols=np.sort(seams[:,y]); row=out[y]; parts=[]; prev=0
  for c in cols:
    parts.append(row[prev:c+1]); nb=row[min(c+1,w0-1)]; parts.append(((row[c]+nb)/2)[None]); prev=c+1
  parts.append(row[prev:]); out_row=np.concatenate(parts,0)
  if y==0: R=np.zeros((h0,out_row.shape[0],3),np.float32)
  R[y]=out_row
fcx=(xs.min()+xs.max())/2+need/2
up=cv2.resize(R,(round(R.shape[1]*s),round(h0*s)),interpolation=cv2.INTER_CUBIC)
ox=int(fcx*s-cx); oy=int((ftop+fbot)/2*s-cy); print('ox',ox,'oy',oy,up.shape)
ox=max(0,min(ox,up.shape[1]-W))
if oy<0: up=np.concatenate([np.repeat(up[:1],-oy,0),up],0); oy=0
c=np.clip(up[oy:oy+H,ox:ox+W],0,255).astype(np.uint8)
if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
o=cv2.addWeighted(c,1.3,cv2.GaussianBlur(c,(0,0),2),-0.3,0); cv2.imwrite('plate8.png',o)
im=Image.fromarray(cv2.cvtColor(o,cv2.COLOR_BGR2RGB)); d=ImageDraw.Draw(im); d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],outline=(255,0,0),width=4)
im.resize((390,844)).save('plate8_check.png')
