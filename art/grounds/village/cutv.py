import numpy as np
from PIL import Image
from scipy import ndimage
D='/home/claude/flicky-cricket/assets/themes/village/'
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
biggest_in(P,(85,60,395,585),'pitch')
st=biggest_in(P,(515,45,580,540),'stump'); st.resize((round(st.width*360/st.height),360),Image.LANCZOS).save(D+'stump.webp',quality=92)
bl=biggest_in(P,(755,160,805,370),'bail').rotate(90,expand=True); bl.resize((212,round(bl.height*212/bl.width)),Image.LANCZOS).save(D+'bail.webp',quality=92)
biggest_in(P,(935,180,1175,390),'ball',208)
biggest_in(P,(40,690,420,740),'rope')
biggest_in(P,(490,670,595,740),'ring',120)
biggest_in(P,(670,460,880,640),'x_egret_up',160); biggest_in(P,(665,645,880,775),'x_egret_dn',160)
biggest_in(P,(920,525,1040,765),'x_flag',160); biggest_in(P,(1080,510,1215,760),'x_smoke',160)
Wd=keyed('words_raw.png',G)
for name,box in [('w_four',(50,90,410,230)),('w_six',(430,55,815,265)),('w_caught',(835,105,1235,220)),('w_bowled',(55,300,475,415)),('w_out',(495,295,770,430))]:
  biggest_in(Wd,box,name,700,dil=4)
xs=[(55,175),(175,280),(280,395),(395,510),(510,640),(640,755),(755,880),(880,990),(990,1110),(1110,1230)]
for d,(a,b) in enumerate(xs):
  im=biggest_in(Wd,(a,640,b,800),'d%d'%d,dil=1); im.resize((round(im.width*130/im.height),130),Image.LANCZOS).save(D+'d%d.webp'%d,quality=90)
# despill rim on green-keyed words/digits
import cv2, glob
for f in glob.glob(D+'w_*.webp')+[D+'d%d.webp'%i for i in range(10)]:
  a=np.array(Image.open(f).convert('RGBA')).astype(np.float32); al=a[...,3]
  edge=cv2.dilate((al<250).astype(np.uint8),np.ones((7,7),np.uint8))>0; lim=np.maximum(a[...,0],a[...,2])
  a[...,1]=np.where(edge&(a[...,1]>lim),lim,a[...,1]); a[...,3]=cv2.erode(al,np.ones((2,2),np.uint8))
  Image.fromarray(a.clip(0,255).astype(np.uint8)).save(f,quality=92)
Hh=keyed('hud_raw.png',M)
fr=Hh[50:700,40:980].copy()
x0,x1=300,380; reps=5
fr=np.concatenate([fr[:,:x1]]+[fr[:,x0:x1]]*reps+[fr[:,x1:]],1)
Image.fromarray(fr).save('hudframe.png')
biggest_in(Hh,(975,520,1220,765),'pause2',160)
print('ok', fr.shape)
