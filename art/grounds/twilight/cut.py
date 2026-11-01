import numpy as np, cv2
from PIL import Image
from scipy import ndimage
D='/home/claude/flicky-cricket/assets/themes/twilight/'
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
P=keyed('props_raw.png',G)
pc=biggest_in(P,(50,50,470,975),'pitch',save=False); pc.save(D+'pitch.webp',quality=90)
# crop offset: pitch bbox top in sheet
ys=np.where(P[50:975,50:470,3].max(1)>128)[0]; top=50+ys.min(); print('pitch top',top,'ct',187-top,'cb',809-top,'size',pc.size)
# rectified strip between the popping creases
src=np.array(Image.open('props_raw.png').convert('RGB'))
quad=np.float32([[123,187],[393,187],[449,809],[68,809]]); Wr,Hr=200,523
dst=np.float32([[0,0],[Wr,0],[Wr,Hr],[0,Hr]]); Mx=cv2.getPerspectiveTransform(quad,dst)
r=cv2.warpPerspective(src,Mx,(Wr,Hr),flags=cv2.INTER_CUBIC); Image.fromarray(r).save(D+'pitch_rect.webp',quality=92)
st=biggest_in(P,(490,50,555,415),'stump'); st.resize((round(st.width*360/st.height),360),Image.LANCZOS).save(D+'stump.webp',quality=92)
bl=biggest_in(P,(640,95,705,260),'bail').rotate(90,expand=True); bl.resize((212,round(bl.height*212/bl.width)),Image.LANCZOS).save(D+'bail.webp',quality=92)
biggest_in(P,(780,90,955,265),'ball',208); biggest_in(P,(585,310,980,365),'rope'); biggest_in(P,(795,450,935,555),'ring',120)
biggest_in(P,(550,400,700,575),'x_lifering',160)
biggest_in(P,(510,585,705,760),'x_gull_up',160); biggest_in(P,(745,630,970,780),'x_gull_dn',160); biggest_in(P,(540,800,715,965),'x_flag',160)
Wd=keyed('words_raw.png',M)
for name,box in [('w_four',(35,35,505,170)),('w_six',(515,35,990,245)),('w_caught',(35,205,545,315)),('w_bowled',(35,335,620,455)),('w_out',(622,295,990,425))]:
  biggest_in(Wd,box,name,700,dil=3)
# digits: column gaps in the row band
band=Wd[875:1000,20:1004,3]>128; cols=band.sum(0); segs=[]; inn=False
for x,c in enumerate(cols):
  if c>0 and not inn: s=x; inn=True
  if c==0 and inn: segs.append((s,x)); inn=False
if inn: segs.append((s,len(cols)))
segs=[q for q in segs if q[1]-q[0]>20]; print('digit segs',len(segs),segs)
if len(segs)!=10:
  e=np.linspace(40,990,11).astype(int); segs=[(e[i]-20,e[i+1]-20) for i in range(10)]
for d,(a,b) in enumerate(segs):
  im=biggest_in(Wd,(20+a,875,20+b,1000),'d%d'%d,dil=1,save=False); im.resize((round(im.width*130/im.height),130),Image.LANCZOS).save(D+'d%d.webp'%d,quality=90)
Pz=keyed('pause_raw.png',M); biggest_in(Pz,(0,0,640,640),'pause2',160)
print('ok')
