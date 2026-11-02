# 4.d Fright Fair: cut the props (Figma 398:193, magenta), words (398:194, green) and pause (398:192, green) into assets/themes/fright/ (magenta key). Run in art/grounds/beach.
import numpy as np, cv2, os
from PIL import Image
from scipy import ndimage
D='/home/claude/flicky-cricket/assets/themes/fright/'; os.makedirs(D,exist_ok=True)
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
P=keyed('raw/props_398-193.png')
pc=biggest_in(P,(25,25,420,995),'pitch',save=False); pc.save(D+'pitch.webp',quality=90)
# rectified pitch between its scratched creases: edges per row from the alpha, creases found as pale rows near each end
al=P[25:995,25:420,3]>128; rows=np.where(al.any(1))[0]; top=25+rows.min()
def edges(y): xs=np.where(P[y,25:420,3]>128)[0]; return 25+xs.min()+6,25+xs.max()-6
src=P[...,:3]; g=cv2.cvtColor(src,cv2.COLOR_RGB2GRAY).astype(float)
def crease(y0,y1):
  best=None
  for y in range(y0,y1):
    l,r=edges(y); v=g[y,l+20:r-20].mean()
    if best is None or v>best[0]: best=(v,y)
  return best[1]
ct,cb=crease(125,180),crease(720,770); print('pitch top',top,'creases',ct,cb,'size',pc.size)
(l1,r1),(l2,r2)=edges(ct),edges(cb); quad=np.float32([[l1,ct],[r1,ct],[r2,cb],[l2,cb]]); Wr,Hr=200,523
Mx=cv2.getPerspectiveTransform(quad,np.float32([[0,0],[Wr,0],[Wr,Hr],[0,Hr]]))
Image.fromarray(cv2.warpPerspective(np.ascontiguousarray(src),Mx,(Wr,Hr),flags=cv2.INTER_CUBIC)).save(D+'pitch_rect.webp',quality=92)
st=biggest_in(P,(500,25,560,390),'stump'); c=Image.new('RGBA',(52,360)); c.alpha_composite(st.resize((26,360),Image.LANCZOS),(13,0)); c.save(D+'stump.webp',quality=92)   # slim, like Coliseum
bl=biggest_in(P,(690,150,890,260),'bail',save=False); bl.resize((212,round(bl.height*212/bl.width)),Image.LANCZOS).save(D+'bail.webp',quality=92)
biggest_in(P,(995,115,1195,310),'ball',208); biggest_in(P,(1305,145,1480,310),'ring',120)
biggest_in(P,(430,430,810,670),'x_bat_up',160); biggest_in(P,(815,470,1165,710),'x_bat_dn',160)
biggest_in(P,(1195,420,1485,730),'x_ghost',140); biggest_in(P,(520,730,890,990),'x_cauldron',200,dil=8); biggest_in(P,(940,760,1440,975),'x_fog',260,dil=8)
Wd=keyed('raw/words_398-194.png',(0,255,0))
for name,box in [('w_four',(30,90,440,280)),('w_six',(455,40,975,325)),('w_caught',(985,90,1505,280)),('w_bowled',(165,325,845,530)),('w_out',(930,320,1370,530))]:
  biggest_in(Wd,box,name,700,dil=3)
y0,y1=770,960; band=Wd[y0:y1,10:1526,3]>128; cols=band.sum(0); segs=[]; inn=False
for x,c in enumerate(cols):
  if c>0 and not inn: s0=x; inn=True
  if c==0 and inn: segs.append((s0,x)); inn=False
if inn: segs.append((s0,len(cols)))
segs=[q for q in segs if q[1]-q[0]>20]; print('digit segs',len(segs))
if len(segs)!=10:
  a0,b0=segs[0][0],segs[-1][1]; e=np.linspace(a0,b0,11).astype(int); segs=[(e[i],e[i+1]) for i in range(10)]
for d,(a,b) in enumerate(segs[:10]):
  im=biggest_in(Wd,(10+a,y0,10+b,y1),'d%d'%d,dil=1,save=False); im.resize((round(im.width*130/im.height),130),Image.LANCZOS).save(D+'d%d.webp'%d,quality=90)
Hd=keyed('raw/hud_398-192.png',(0,255,0)); biggest_in(Hd,(1185,280,1440,650),'pause2',160)
print('ok')
# smoke + splash: magenta tinted the soft edges purple -> pull those pixels to neutral grey (keeps the orange glow, which has g<b)
for n in ['x_fog']:
  a=np.array(Image.open(D+n+'.webp').convert('RGBA')).astype(float); r,g,b=a[...,0],a[...,1],a[...,2]
  m=(r>g+8)&(b>g+8)&~((r>b+40)&(r>200)); grey=(r+g+b)/3
  for c in (0,2): a[...,c]=np.where(m,grey+(a[...,c]-grey)*0.15,a[...,c])
  Image.fromarray(a.clip(0,255).astype(np.uint8)).save(D+n+'.webp',quality=90)
# fog + cauldron smoke: soft magenta-tinted edges. Alpha from how far each pixel is from the key; colour pulled off the magenta.
def unmix(n,base):
  im=np.array(Image.open('raw/props_398-193.png').convert('RGB')).astype(float)
  b=Image.open(D+n+'.webp')   # only to know size; recompute from the source box
  return im
for n,box,tint in [('x_fog',(940,760,1440,975),None),('x_cauldron',(520,730,890,990),'g')]:
  x0,y0,x1,y1=box; im=np.array(Image.open('raw/props_398-193.png').convert('RGB')).astype(float)[y0:y1,x0:x1]
  key=np.array([255,0,255.]); mag=np.clip((np.minimum(im[...,0],im[...,2])-im[...,1])/255,0,1)   # how magenta
  al=np.clip(1-mag*1.35,0,1)
  fg=im.copy()
  # remove the key contribution: fg = (im - key*(1-al)) / al
  safe=np.maximum(al,0.05)[...,None]; fg=(im-key*(1-al)[...,None])/safe
  if tint is None: g_=fg.mean(-1,keepdims=True); fg=g_*np.array([0.96,1.0,1.06])
  out=np.dstack([fg.clip(0,255),al*255]).astype(np.uint8)
  I=Image.fromarray(out); I=I.crop(I.getbbox()); k=260/max(I.size) if n=='x_fog' else 200/max(I.size); I=I.resize((round(I.width*k),round(I.height*k)),Image.LANCZOS); I.save(D+n+'.webp',quality=90)
