import numpy as np
from PIL import Image
from scipy import ndimage
D='/home/claude/flicky-cricket/assets/themes/school/'
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
biggest_in(P,(70,70,480,570),'pitch')
st=biggest_in(P,(590,60,670,530),'stump'); st.resize((round(st.width*360/st.height),360),Image.LANCZOS).save(D+'stump.webp',quality=92)
bl=biggest_in(P,(820,190,900,360),'bail').rotate(90,expand=True); bl.resize((212,round(bl.height*212/bl.width)),Image.LANCZOS).save(D+'bail.webp',quality=92)
biggest_in(P,(1000,180,1190,370),'ball',208)
r=Image.fromarray(P[680:752,35:440]); r.crop(r.getbbox()).save(D+'rope.webp',quality=90)
biggest_in(P,(465,690,555,745),'ring',120)
biggest_in(P,(605,640,715,750),'x_plane',160); biggest_in(P,(765,640,885,750),'x_flag',160)
biggest_in(P,(895,620,1060,760),'x_crow_up',160); biggest_in(P,(1055,640,1235,750),'x_crow_dn',160)
Wd=keyed('words_raw.png',G)
for name,box in [('w_four',(60,85,400,215)),('w_six',(460,55,800,235)),('w_caught',(825,100,1220,215)),('w_bowled',(60,290,470,400)),('w_out',(505,290,755,405))]:
  biggest_in(Wd,box,name,700,dil=4)
xs=[(50,170),(170,280),(280,395),(395,510),(510,640),(640,760),(760,880),(880,1000),(1000,1115),(1115,1230)]
for d,(a,b) in enumerate(xs):
  im=biggest_in(Wd,(a,630,b,795),'d%d'%d,dil=1); im.resize((round(im.width*130/im.height),130),Image.LANCZOS).save(D+'d%d.webp'%d,quality=90)
Hh=keyed('hud_raw.png',M)
fr=Hh[48:418,48:1218].copy(); Image.fromarray(fr).save('hudframe.png')
biggest_in(Hh,(925,475,1220,770),'pause2',160)
print('ok')
