# 6.b SCG: cut the props (Figma 429:193, green), words (429:194, green); pause comes from compose_scg.py — all magenta — into assets/themes/scg/ (magenta key). Run in art/grounds/beach.
import numpy as np, cv2, os
from PIL import Image
from scipy import ndimage
D='/home/claude/flicky-cricket/assets/themes/scg/'; os.makedirs(D,exist_ok=True)
def keyed(src,key=(255,0,255),despill=True):
  if key==(0,255,0): return keyed_g(src)
  im=np.array(Image.open(src).convert('RGB')).astype(float); a=np.clip((np.sqrt(((im-key)**2).sum(2))-45)/60,0,1)
  k=(a<1)&(a>0); f=im.copy()
  sp=np.clip(np.minimum(f[...,0],f[...,2])-f[...,1],0,None)*k*despill; f[...,0]-=sp; f[...,2]-=sp
  rim=(cv2.dilate((a<1).astype(np.uint8),np.ones((5,5),np.uint8))>0)&(cv2.erode((a>=1).astype(np.uint8),np.ones((9,9),np.uint8))>0)
  sp=np.clip(np.minimum(f[...,0],f[...,2])-f[...,1]-20,0,None)*rim; sp=sp*despill; f[...,0]-=sp; f[...,2]-=sp   # despill the rim (pink fringe on dark outlines)
  A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8))
  return np.dstack([f,A]).clip(0,255).astype(np.uint8)
def keyed_g(src):
  im=np.array(Image.open(src).convert('RGB')).astype(float); a=np.clip((np.sqrt(((im-[0,255,0])**2).sum(2))-45)/60,0,1)
  ex=np.clip(im[...,1]-np.maximum(im[...,0],im[...,2]),0,None); a=a*np.clip(1-ex/90,0,1)
  f=im.copy(); f[...,1]=np.minimum(f[...,1],np.maximum(f[...,0],f[...,2]))
  A=cv2.erode((a*255).astype(np.uint8),np.ones((3,3),np.uint8)); return np.dstack([f,A]).clip(0,255).astype(np.uint8)
def biggest_in(rgba,box,name,maxd=None,dil=2,save=True):
  x0,y0,x1,y1=box; p=rgba[y0:y1,x0:x1].copy()
  lab,n=ndimage.label(ndimage.binary_dilation(p[...,3]>128,iterations=dil))
  sz=ndimage.sum(np.ones_like(lab),lab,range(1,n+1)); keep=np.argmax(sz)+1
  p[...,3]=p[...,3]*(lab==keep); im=Image.fromarray(p); im=im.crop(im.getbbox())
  if maxd and max(im.size)>maxd: k=maxd/max(im.size); im=im.resize((round(im.width*k),round(im.height*k)),Image.LANCZOS)
  if save: im.save(D+name+'.webp',quality=90)
  return im
P=keyed('raw/props_429-193.png',key=(0,255,0))
PB=(515,45,970,975)
pc=biggest_in(P,PB,'pitch',save=False); pc.save(D+'pitch.webp',quality=90)
al=P[PB[1]:PB[3],PB[0]:PB[2],3]>128; rows=np.where(al.any(1))[0]; top=PB[1]+rows.min()
def edges(y): xs=np.where(P[y,PB[0]:PB[2],3]>128)[0]; return PB[0]+xs.min()+6,PB[0]+xs.max()-6
src=P[...,:3]; g=cv2.cvtColor(src,cv2.COLOR_RGB2GRAY).astype(float)
def crease(y0,y1):
  best=None
  for y in range(y0,y1):
    l,r=edges(y); v=g[y,l+20:r-20].mean()
    if best is None or v>best[0]: best=(v,y)
  return best[1]
ct,cb=crease(125,155),crease(725,760); print('pitch top',top,'creases',ct,cb,'size',pc.size)
(l1,r1),(l2,r2)=edges(ct),edges(cb); quad=np.float32([[l1,ct],[r1,ct],[r2,cb],[l2,cb]]); Wr,Hr=200,523
Mx=cv2.getPerspectiveTransform(quad,np.float32([[0,0],[Wr,0],[Wr,Hr],[0,Hr]]))
Image.fromarray(cv2.warpPerspective(np.ascontiguousarray(src),Mx,(Wr,Hr),flags=cv2.INTER_CUBIC)).save(D+'pitch_rect.webp',quality=92)
a_=np.array(pc)[...,3]; print('widths', [int((lambda xs: xs.max()-xs.min())(np.where(a_[y-top]>128)[0])) for y in (ct,cb)], 'ct',ct-top,'cb',cb-top)
st=biggest_in(P,(120,70,195,495),'stump'); c=Image.new('RGBA',(52,360)); c.alpha_composite(st.resize((26,360),Image.LANCZOS),(13,0)); c.save(D+'stump.webp',quality=92)
bl=biggest_in(P,(285,135,470,210),'bail',save=False); bl.resize((212,round(bl.height*212/bl.width)),Image.LANCZOS).save(D+'bail.webp',quality=92)
biggest_in(P,(280,315,440,465),'ball',208); biggest_in(P,(295,530,420,620),'ring',120)
biggest_in(P,(95,620,430,950),'x_flag',160); biggest_in(P,(1020,500,1310,780),'x_beachball',140)
biggest_in(P,(1000,15,1370,315),'x_gull_up',180); biggest_in(P,(1040,285,1470,535),'x_gull_dn',180); biggest_in(P,(995,740,1475,975),'x_ferry',220)
Wd=keyed('raw/words_429-194.png',key=(0,255,0))
for name,box in [('w_four',(10,165,275,295)),('w_six',(285,130,610,320)),('w_caught',(620,165,925,290)),('w_bowled',(950,165,1280,290)),('w_out',(1295,165,1525,290))]:
  biggest_in(Wd,box,name,700,dil=3)
y0,y1=665,870; band=Wd[y0:y1,10:1526,3]>128; cols=band.sum(0); segs=[]; inn=False
for x,c in enumerate(cols):
  if c>0 and not inn: s0=x; inn=True
  if c==0 and inn: segs.append((s0,x)); inn=False
if inn: segs.append((s0,len(cols)))
segs=[q for q in segs if q[1]-q[0]>20]; print('digit segs',len(segs))
if len(segs)!=10:
  a0,b0=segs[0][0],segs[-1][1]; e=np.linspace(a0,b0,11).astype(int); segs=[(e[i],e[i+1]) for i in range(10)]
for d,(a,b) in enumerate(segs[:10]):
  im=biggest_in(Wd,(10+a,y0,10+b,y1),'d%d'%d,dil=1,save=False); im.resize((round(im.width*130/im.height),130),Image.LANCZOS).save(D+'d%d.webp'%d,quality=90)
print('ok')
