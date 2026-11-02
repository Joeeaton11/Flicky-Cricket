import numpy as np, cv2
from PIL import Image
from scipy import ndimage
D='/home/claude/flicky-cricket/assets/themes/dusk/'
def keyed(src,key):
  im=np.array(Image.open(src).convert('RGB')).astype(float); a=np.clip((np.sqrt(((im-key)**2).sum(2))-45)/60,0,1)
  k=(a<1)&(a>0); f=im.copy()
  if key[1]==255: f[...,1]=np.where(k,np.minimum(f[...,1],np.maximum(f[...,0],f[...,2])),f[...,1])
  else:
    sp=np.clip(np.minimum(f[...,0],f[...,2])-f[...,1],0,None)*k; f[...,0]-=sp; f[...,2]-=sp
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
M=[255,0,255]; G=[0,255,0]
P=keyed('props_raw.png',M)
pc=biggest_in(P,(40,50,590,990),'pitch',save=False); pc.save(D+'pitch.webp',quality=90)
ys=np.where(P[50:990,40:590,3].max(1)>128)[0]; top=50+ys.min(); print('pitch top',top,'ct',163-top,'cb',783-top,'size',pc.size)
src=np.array(Image.open('props_raw.png').convert('RGB'))
quad=np.float32([[156,163],[463,163],[545,783],[74,783]]); Wr,Hr=200,523
Mx=cv2.getPerspectiveTransform(quad,np.float32([[0,0],[Wr,0],[Wr,Hr],[0,Hr]]))
Image.fromarray(cv2.warpPerspective(src,Mx,(Wr,Hr),flags=cv2.INTER_CUBIC)).save(D+'pitch_rect.webp',quality=92)
st=biggest_in(P,(620,70,700,270),'stump'); st.resize((44,360),Image.LANCZOS).save(D+'stump.webp',quality=92)
bl=biggest_in(P,(800,115,950,170),'bail',save=False); bl.resize((212,round(bl.height*212/bl.width)),Image.LANCZOS).save(D+'bail.webp',quality=92)
biggest_in(P,(590,315,730,450),'ball',208); biggest_in(P,(820,330,935,430),'ring',120)
biggest_in(P,(570,525,760,725),'x_parrot_up',160); biggest_in(P,(790,540,990,720),'x_parrot_dn',160); biggest_in(P,(600,775,780,950),'x_flag',160); biggest_in(P,(800,775,975,925),'x_confetti',160,dil=12)
Wd=keyed('words_raw.png',G)
for name,box in [('w_four',(40,35,490,175)),('w_six',(510,30,990,230)),('w_caught',(40,195,505,300)),('w_bowled',(60,320,505,425)),('w_out',(545,255,975,420))]:
  biggest_in(Wd,box,name,700,dil=3)
band=Wd[860:1000,20:1004,3]>128; cols=band.sum(0); segs=[]; inn=False
for x,c in enumerate(cols):
  if c>0 and not inn: s0=x; inn=True
  if c==0 and inn: segs.append((s0,x)); inn=False
if inn: segs.append((s0,len(cols)))
segs=[q for q in segs if q[1]-q[0]>20]; print('digit segs',len(segs),segs)
while len(segs)<10:   # split the widest (two touching digits)
  i=max(range(len(segs)),key=lambda j:segs[j][1]-segs[j][0]); a,b=segs[i]; m=(a+b)//2; segs[i:i+1]=[(a,m),(m,b)]
for d,(a,b) in enumerate(segs[:10]):
  im=biggest_in(Wd,(20+a,860,20+b,1000),'d%d'%d,dil=1,save=False); im.resize((round(im.width*130/im.height),130),Image.LANCZOS).save(D+'d%d.webp'%d,quality=90)
Pz=keyed('pause_raw.png',G); biggest_in(Pz,(0,0,640,640),'pause2',160)
print('ok')
