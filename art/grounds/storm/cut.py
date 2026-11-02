# 3.e Beach Storm: cut the props (Figma 391:193), words (391:194) and pause (391:192) sheets into assets/themes/storm/ (magenta key). Run in art/grounds/beach.
import numpy as np, cv2, os
from PIL import Image
from scipy import ndimage
D='/home/claude/flicky-cricket/assets/themes/storm/'; os.makedirs(D,exist_ok=True)
def keyed(src,key=(255,0,255)):
  im=np.array(Image.open(src).convert('RGB')).astype(float); a=np.clip((np.sqrt(((im-key)**2).sum(2))-45)/60,0,1)
  k=(a<1)&(a>0); f=im.copy()
  sp=np.clip(np.minimum(f[...,0],f[...,2])-f[...,1],0,None)*k; f[...,0]-=sp; f[...,2]-=sp
  ex=np.clip(np.minimum(im[...,0],im[...,2])-im[...,1]-60,0,None); a=a*np.clip(1-ex/120,0,1)   # magenta glow halo (lightning, spray) -> transparent
  rim=(cv2.dilate((a<1).astype(np.uint8),np.ones((5,5),np.uint8))>0)&(cv2.erode((a>=1).astype(np.uint8),np.ones((9,9),np.uint8))>0)
  sp=np.clip(np.minimum(f[...,0],f[...,2])-f[...,1]-20,0,None)*rim; f[...,0]-=sp; f[...,2]-=sp   # despill the rim
  A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8))
  return np.dstack([f,A]).clip(0,255).astype(np.uint8)
def biggest_in(rgba,box,name,maxd=None,dil=2,save=True):
  x0,y0,x1,y1=box; p=rgba[y0:y1,x0:x1].copy()
  lab,n=ndimage.label(ndimage.binary_dilation(p[...,3]>128,iterations=dil))
  sz=ndimage.sum(np.ones_like(lab),lab,range(1,n+1)); keep=np.argmax(sz)+1
  p[...,3]=p[...,3]*(lab==keep); im=Image.fromarray(p); im=im.crop(im.getbbox())
  if maxd and max(im.size)>maxd: k=maxd/max(im.size); im=im.resize((round(im.width*k),round(im.height*k)),Image.LANCZOS)
  if save: im.save(D+name+'.webp',quality=90)
  return im
P=keyed('raw/props_391-193.png')
pc=biggest_in(P,(35,30,385,980),'pitch',save=False); pc.save(D+'pitch.webp',quality=90)
# rectified pitch between its scratched creases: edges per row from the alpha, creases found as pale rows near each end
al=P[30:980,35:385,3]>128; rows=np.where(al.any(1))[0]; top=30+rows.min()
def edges(y): xs=np.where(P[y,35:385,3]>128)[0]; return 35+xs.min()+6,35+xs.max()-6
src=P[...,:3]; g=cv2.cvtColor(src,cv2.COLOR_RGB2GRAY).astype(float)
def crease(y0,y1):
  best=None
  for y in range(y0,y1):
    l,r=edges(y); v=g[y,l+20:r-20].mean()
    if best is None or v>best[0]: best=(v,y)
  return best[1]
ct,cb=crease(100,140),crease(815,850); print('pitch top',top,'creases',ct,cb,'size',pc.size)
(l1,r1),(l2,r2)=edges(ct),edges(cb); quad=np.float32([[l1,ct],[r1,ct],[r2,cb],[l2,cb]]); Wr,Hr=200,523
Mx=cv2.getPerspectiveTransform(quad,np.float32([[0,0],[Wr,0],[Wr,Hr],[0,Hr]]))
Image.fromarray(cv2.warpPerspective(np.ascontiguousarray(src),Mx,(Wr,Hr),flags=cv2.INTER_CUBIC)).save(D+'pitch_rect.webp',quality=92)
st=biggest_in(P,(470,30,545,395),'stump'); c=Image.new('RGBA',(52,360)); c.alpha_composite(st.resize((26,360),Image.LANCZOS),(13,0)); c.save(D+'stump.webp',quality=92)   # slim, like Coliseum
bl=biggest_in(P,(670,150,845,250),'bail',save=False); bl.resize((212,round(bl.height*212/bl.width)),Image.LANCZOS).save(D+'bail.webp',quality=92)
biggest_in(P,(970,145,1115,285),'ball',208); biggest_in(P,(1265,130,1455,305),'ring',120)
biggest_in(P,(395,430,595,945),'x_bolt',260,dil=8); biggest_in(P,(600,460,1030,960),'x_spray',220,dil=8)
biggest_in(P,(895,350,1200,720),'x_brolly',160); biggest_in(P,(1240,350,1475,555),'x_hat',120)
biggest_in(P,(1240,580,1490,810),'x_gull_up',180); biggest_in(P,(1180,825,1510,965),'x_gull_dn',180)
Wd=keyed('raw/words_391-194.png')
for name,box in [('w_four',(25,95,465,265)),('w_six',(480,40,1020,320)),('w_caught',(1030,95,1525,265)),('w_bowled',(105,340,890,535)),('w_out',(965,340,1415,535))]:
  biggest_in(Wd,box,name,700,dil=3)
y0,y1=755,965; band=Wd[y0:y1,10:1526,3]>128; cols=band.sum(0); segs=[]; inn=False
for x,c in enumerate(cols):
  if c>0 and not inn: s0=x; inn=True
  if c==0 and inn: segs.append((s0,x)); inn=False
if inn: segs.append((s0,len(cols)))
segs=[q for q in segs if q[1]-q[0]>20]; print('digit segs',len(segs))
if len(segs)!=10:
  a0,b0=segs[0][0],segs[-1][1]; e=np.linspace(a0,b0,11).astype(int); segs=[(e[i],e[i+1]) for i in range(10)]
for d,(a,b) in enumerate(segs[:10]):
  im=biggest_in(Wd,(10+a,y0,10+b,y1),'d%d'%d,dil=1,save=False); im.resize((round(im.width*130/im.height),130),Image.LANCZOS).save(D+'d%d.webp'%d,quality=90)
Hd=keyed('raw/hud_391-192.png'); biggest_in(Hd,(1195,310,1515,710),'pause2',160)
print('ok')
