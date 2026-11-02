# 4.c Theme Park: cut the props (Figma 397:194), words (397:195) and pause (397:193) sheets into assets/themes/themepark/ (magenta key). Run in art/grounds/beach.
import numpy as np, cv2, os
from PIL import Image
from scipy import ndimage
D='/home/claude/flicky-cricket/assets/themes/themepark/'; os.makedirs(D,exist_ok=True)
def keyed(src,key=(255,0,255),despill=True):
  im=np.array(Image.open(src).convert('RGB')).astype(float); a=np.clip((np.sqrt(((im-key)**2).sum(2))-45)/60,0,1)
  k=(a<1)&(a>0); f=im.copy()
  sp=np.clip(np.minimum(f[...,0],f[...,2])-f[...,1],0,None)*k*despill; f[...,0]-=sp; f[...,2]-=sp
  rim=(cv2.dilate((a<1).astype(np.uint8),np.ones((5,5),np.uint8))>0)&(cv2.erode((a>=1).astype(np.uint8),np.ones((9,9),np.uint8))>0)
  sp=np.clip(np.minimum(f[...,0],f[...,2])-f[...,1]-20,0,None)*rim; sp=sp*despill; f[...,0]-=sp; f[...,2]-=sp   # despill the rim (pink fringe on dark outlines)
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
P=keyed('raw/props_397-194.png')
pc=biggest_in(P,(80,35,320,575),'pitch',save=False); pc.save(D+'pitch.webp',quality=90)
# rectified pitch between its scratched creases: edges per row from the alpha, creases found as pale rows near each end
al=P[35:575,80:320,3]>128; rows=np.where(al.any(1))[0]; top=35+rows.min()
def edges(y): xs=np.where(P[y,80:320,3]>128)[0]; return 80+xs.min()+6,80+xs.max()-6
src=P[...,:3]; g=cv2.cvtColor(src,cv2.COLOR_RGB2GRAY).astype(float)
def crease(y0,y1):
  best=None
  for y in range(y0,y1):
    l,r=edges(y); v=g[y,l+20:r-20].mean()
    if best is None or v>best[0]: best=(v,y)
  return best[1]
ct,cb=crease(110,130),crease(440,460); print('pitch top',top,'creases',ct,cb,'size',pc.size)
(l1,r1),(l2,r2)=edges(ct),edges(cb); quad=np.float32([[l1,ct],[r1,ct],[r2,cb],[l2,cb]]); Wr,Hr=200,523
Mx=cv2.getPerspectiveTransform(quad,np.float32([[0,0],[Wr,0],[Wr,Hr],[0,Hr]]))
Image.fromarray(cv2.warpPerspective(np.ascontiguousarray(src),Mx,(Wr,Hr),flags=cv2.INTER_CUBIC)).save(D+'pitch_rect.webp',quality=92)
st=biggest_in(P,(440,45,505,445),'stump'); c=Image.new('RGBA',(52,360)); c.alpha_composite(st.resize((26,360),Image.LANCZOS),(13,0)); c.save(D+'stump.webp',quality=92)   # slim, like Coliseum
bl=biggest_in(P,(640,260,860,355),'bail',save=False); bl.resize((212,round(bl.height*212/bl.width)),Image.LANCZOS).save(D+'bail.webp',quality=92)
biggest_in(keyed('raw/props_397-194.png',despill=False),(965,230,1125,390),'ball',208); biggest_in(P,(1235,230,1430,415),'ring',120)
biggest_in(P,(50,590,545,950),'x_splash',220,dil=8); biggest_in(P,(595,575,935,945),'x_smoke',200,dil=8)
biggest_in(P,(980,530,1160,930),'x_balloon',160); biggest_in(P,(1215,480,1495,705),'x_toucan_up',160); biggest_in(P,(1205,730,1495,950),'x_toucan_dn',160)
Wd=keyed('raw/words_397-195.png')
for name,box in [('w_four',(30,105,450,275)),('w_six',(450,55,990,315)),('w_caught',(1005,105,1515,275)),('w_bowled',(190,325,830,515)),('w_out',(865,320,1300,515))]:
  biggest_in(Wd,box,name,700,dil=3)
y0,y1=755,955; band=Wd[y0:y1,10:1526,3]>128; cols=band.sum(0); segs=[]; inn=False
for x,c in enumerate(cols):
  if c>0 and not inn: s0=x; inn=True
  if c==0 and inn: segs.append((s0,x)); inn=False
if inn: segs.append((s0,len(cols)))
segs=[q for q in segs if q[1]-q[0]>20]; print('digit segs',len(segs))
if len(segs)!=10:
  a0,b0=segs[0][0],segs[-1][1]; e=np.linspace(a0,b0,11).astype(int); segs=[(e[i],e[i+1]) for i in range(10)]
for d,(a,b) in enumerate(segs[:10]):
  im=biggest_in(Wd,(10+a,y0,10+b,y1),'d%d'%d,dil=1,save=False); im.resize((round(im.width*130/im.height),130),Image.LANCZOS).save(D+'d%d.webp'%d,quality=90)
Hd=keyed('raw/hud_397-193.png'); biggest_in(Hd,(1155,330,1505,690),'pause2',160)
print('ok')
# smoke + splash: magenta tinted the soft edges purple -> pull those pixels to neutral grey (keeps the orange glow, which has g<b)
for n in ['x_smoke','x_splash']:
  a=np.array(Image.open(D+n+'.webp').convert('RGBA')).astype(float); r,g,b=a[...,0],a[...,1],a[...,2]
  m=(r>g+8)&(b>g+8)&~((r>b+40)&(r>200)); grey=(r+g+b)/3
  for c in (0,2): a[...,c]=np.where(m,grey+(a[...,c]-grey)*0.15,a[...,c])
  Image.fromarray(a.clip(0,255).astype(np.uint8)).save(D+n+'.webp',quality=90)
