import numpy as np
from PIL import Image
from scipy import ndimage
D='/home/claude/flicky-cricket/assets/themes/railway/'
def keyed(src,key):
  im=np.array(Image.open(src).convert('RGB')).astype(float); a=np.clip((np.sqrt(((im-key)**2).sum(2))-45)/60,0,1)
  k=(a<1)&(a>0); f=im.copy()
  if key[1]==255: f[...,1]=np.where(k,np.minimum(f[...,1],np.maximum(f[...,0],f[...,2])),f[...,1])
  else:
    f[...,0]=np.where(k,np.minimum(f[...,0],f[...,1]+(f[...,0]-f[...,1])*a),f[...,0]); f[...,2]=np.where(k,np.minimum(f[...,2],f[...,1]+(f[...,2]-f[...,1])*a),f[...,2])
  return np.dstack([f,a*255]).clip(0,255).astype(np.uint8)
def biggest_in(rgba,box,name,maxd=None,dil=2):
  x0,y0,x1,y1=box; p=rgba[y0:y1,x0:x1].copy()
  lab,n=ndimage.label(ndimage.binary_dilation(p[...,3]>128,iterations=dil))
  if n==0: return
  sz=ndimage.sum(np.ones_like(lab),lab,range(1,n+1)); keep=np.argmax(sz)+1
  p[...,3]=p[...,3]*(lab==keep); im=Image.fromarray(p); im=im.crop(im.getbbox())
  if maxd and max(im.size)>maxd: k=maxd/max(im.size); im=im.resize((round(im.width*k),round(im.height*k)),Image.LANCZOS)
  im.save(D+name+'.webp',quality=90); return im
M=[255,0,255]; G=[0,255,0]
P=keyed('props_raw.png',M)
biggest_in(P,(70,70,450,770),'pitch')
st=biggest_in(P,(535,65,595,535),'stump'); st.resize((round(st.width*360/st.height),360),Image.LANCZOS).save(D+'stump.webp',quality=92)
bl=biggest_in(P,(745,110,800,270),'bail').rotate(90,expand=True); bl.resize((212,round(bl.height*212/bl.width)),Image.LANCZOS).save(D+'bail.webp',quality=92)
biggest_in(P,(1010,115,1155,255),'ball',208)
biggest_in(P,(685,360,1085,440),'rope')
biggest_in(P,(495,605,640,760),'ring',120)
biggest_in(P,(700,570,885,760),'x_crow_up',160); biggest_in(P,(900,595,1040,765),'x_flag',160); biggest_in(P,(1065,540,1200,765),'x_steam',160)
# crow wings-down didn't come: flip the wings-up crow vertically-ish by squashing for a flap frame
cu=Image.open(D+'x_crow_up.webp'); cu.resize((cu.width,max(1,int(cu.height*0.6))),Image.LANCZOS).save(D+'x_crow_dn.webp',quality=90)
Wd=keyed('words_raw.png',G)
for name,box in [('w_four',(60,85,400,210)),('w_six',(430,45,820,265)),('w_caught',(840,95,1235,205)),('w_bowled',(50,295,470,410)),('w_out',(490,295,770,420))]:
  biggest_in(Wd,box,name,700,dil=4)
xs=[(40,170),(170,285),(285,395),(395,510),(510,640),(640,760),(760,880),(880,1000),(1000,1120),(1120,1240)]
for d,(a,b) in enumerate(xs):
  im=biggest_in(Wd,(a,650,b,800),'d%d'%d,dil=1); im.resize((round(im.width*130/im.height),130),Image.LANCZOS).save(D+'d%d.webp'%d,quality=90)
import cv2, glob
for f in glob.glob(D+'w_*.webp')+[D+'d%d.webp'%i for i in range(10)]:
  a=np.array(Image.open(f).convert('RGBA')).astype(np.float32); al=a[...,3]
  edge=cv2.dilate((al<250).astype(np.uint8),np.ones((7,7),np.uint8))>0; lim=np.maximum(a[...,0],a[...,2])
  a[...,1]=np.where(edge&(a[...,1]>lim),lim,a[...,1]); a[...,3]=cv2.erode(al,np.ones((2,2),np.uint8))
  Image.fromarray(a.clip(0,255).astype(np.uint8)).save(f,quality=92)
Hh=keyed('hud_raw.png',M)
fr=Hh[78:522,68:1198].copy(); Image.fromarray(fr).save('hudframe.png')
biggest_in(Hh,(510,555,760,800),'pause2',160)
print('ok')
