# 3.d Beach Night: cut the props (Figma 389:193), words (389:194) and pause (389:192) sheets into assets/themes/beachnight/. Run in art/grounds/beach.
import numpy as np, cv2, os
from PIL import Image
from scipy import ndimage
D='/home/claude/flicky-cricket/assets/themes/beachnight/'; os.makedirs(D,exist_ok=True)
def keyed(src,key=(0,255,0)):
  im=np.array(Image.open(src).convert('RGB')).astype(float); a=np.clip((np.sqrt(((im-key)**2).sum(2))-45)/60,0,1)
  k=(a<1)&(a>0); f=im.copy()
  f[...,1]=np.where(k,np.minimum(f[...,1],np.maximum(f[...,0],f[...,2])),f[...,1])
  rim=(cv2.dilate((a<1).astype(np.uint8),np.ones((5,5),np.uint8))>0)&(cv2.erode((a>=1).astype(np.uint8),np.ones((9,9),np.uint8))>0)
  f[...,1]=np.where(rim,np.minimum(f[...,1],np.maximum(f[...,0],f[...,2])),f[...,1])   # despill the rim (green fringe on dark outlines)
  # night glow pieces: green key showed through every glow -> treat the green excess as transparency everywhere, then despill
  ex=np.clip(im[...,1]-np.maximum(im[...,0],im[...,2]),0,None); a=a*np.clip(1-ex/90,0,1)
  f[...,1]=np.minimum(f[...,1],np.maximum(f[...,0],f[...,2]))
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
P=keyed('raw/props_389-193.png')
pc=biggest_in(P,(405,40,830,975),'pitch',save=False); pc.save(D+'pitch.webp',quality=90)
# rectified pitch between its scratched creases: edges per row from the alpha, creases found as pale rows near each end
al=P[40:975,405:830,3]>128; rows=np.where(al.any(1))[0]; top=40+rows.min()
def edges(y): xs=np.where(P[y,405:830,3]>128)[0]; return 405+xs.min()+6,405+xs.max()-6
src=P[...,:3]; g=cv2.cvtColor(src,cv2.COLOR_RGB2GRAY).astype(float)
def crease(y0,y1):
  best=None
  for y in range(y0,y1):
    l,r=edges(y); v=g[y,l+20:r-20].mean()
    if best is None or v>best[0]: best=(v,y)
  return best[1]
ct,cb=crease(90,160),crease(820,880); print('pitch top',top,'creases',ct,cb,'size',pc.size)
(l1,r1),(l2,r2)=edges(ct),edges(cb); quad=np.float32([[l1,ct],[r1,ct],[r2,cb],[l2,cb]]); Wr,Hr=200,523
Mx=cv2.getPerspectiveTransform(quad,np.float32([[0,0],[Wr,0],[Wr,Hr],[0,Hr]]))
Image.fromarray(cv2.warpPerspective(np.ascontiguousarray(src),Mx,(Wr,Hr),flags=cv2.INTER_CUBIC)).save(D+'pitch_rect.webp',quality=92)
st=biggest_in(P,(60,120,150,905),'stump'); c=Image.new('RGBA',(52,360)); c.alpha_composite(st.resize((26,360),Image.LANCZOS),(13,0)); c.save(D+'stump.webp',quality=92)   # slim, like Coliseum
bl=biggest_in(P,(235,170,410,235),'bail',save=False); bl.resize((212,round(bl.height*212/bl.width)),Image.LANCZOS).save(D+'bail.webp',quality=92)
biggest_in(P,(220,390,370,535),'ball',208); biggest_in(P,(195,690,360,840),'ring',120)
biggest_in(P,(830,100,1200,480),'x_firework',220,dil=8); biggest_in(P,(1250,55,1515,505),'x_flame',200,dil=8)
biggest_in(P,(890,555,1150,895),'x_lantern',160); biggest_in(P,(1265,570,1455,745),'x_moth_up',120); biggest_in(P,(1250,770,1465,910),'x_moth_dn',120)
Wd=keyed('raw/words_389-194.png')
for name,box in [('w_four',(25,95,450,260)),('w_six',(465,50,975,305)),('w_caught',(975,95,1520,270)),('w_bowled',(140,325,885,520)),('w_out',(920,325,1405,520))]:
  biggest_in(Wd,box,name,700,dil=3)
y0,y1=750,965; band=Wd[y0:y1,10:1526,3]>128; cols=band.sum(0); segs=[]; inn=False
for x,c in enumerate(cols):
  if c>0 and not inn: s0=x; inn=True
  if c==0 and inn: segs.append((s0,x)); inn=False
if inn: segs.append((s0,len(cols)))
segs=[q for q in segs if q[1]-q[0]>20]; print('digit segs',len(segs))
if len(segs)!=10:
  a0,b0=segs[0][0],segs[-1][1]; e=np.linspace(a0,b0,11).astype(int); segs=[(e[i],e[i+1]) for i in range(10)]
for d,(a,b) in enumerate(segs[:10]):
  im=biggest_in(Wd,(10+a,y0,10+b,y1),'d%d'%d,dil=1,save=False); im.resize((round(im.width*130/im.height),130),Image.LANCZOS).save(D+'d%d.webp'%d,quality=90)
Hd=keyed('raw/hud_389-192.png'); biggest_in(Hd,(1240,380,1520,660),'pause2',160)
print('ok')
# digits alternate orange/violet on the sheet; the scoreboard number reads better in one colour -> violet tubes turned orange
import glob, colorsys
for d in range(10):
  f=D+'d%d.webp'%d; a=np.array(Image.open(f).convert('RGBA')); hsv=cv2.cvtColor(a[...,:3],cv2.COLOR_RGB2HSV).astype(int)
  m=(hsv[...,0]>=118)&(hsv[...,0]<=165)&(hsv[...,1]>70)&(hsv[...,2]>120)
  hsv[...,0]=np.where(m,(hsv[...,0]+52)%180,hsv[...,0])   # violet (~140) -> orange (~12)
  a[...,:3]=cv2.cvtColor(hsv.astype(np.uint8),cv2.COLOR_HSV2RGB); Image.fromarray(a).save(f,quality=90)
print('digits one colour')
