import numpy as np
from PIL import Image
from scipy import ndimage
D='/home/claude/flicky-cricket/assets/themes/evening/'
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
biggest_in(P,(70,55,440,795),'pitch')
st=biggest_in(P,(560,50,610,445),'stump'); st.resize((round(st.width*360/st.height),360),Image.LANCZOS).save(D+'stump.webp',quality=92)
bl=biggest_in(P,(770,130,835,325),'bail').rotate(90,expand=True); bl.resize((212,round(bl.height*212/bl.width)),Image.LANCZOS).save(D+'bail.webp',quality=92)
biggest_in(P,(970,130,1165,325),'ball',208); biggest_in(P,(485,500,1040,540),'rope'); biggest_in(P,(1070,465,1175,570),'ring',120)
biggest_in(P,(490,615,670,755),'x_moth_up',160); biggest_in(P,(715,625,810,765),'x_moth_dn',160); biggest_in(P,(875,625,1020,770),'x_flag',160)
Wd=keyed('words_raw.png',M)
for name,box in [('w_four',(35,60,395,200)),('w_six',(420,30,815,235)),('w_caught',(820,70,1245,195)),('w_bowled',(35,275,455,400)),('w_out',(480,275,765,425))]:
  biggest_in(Wd,box,name,700,dil=4)
xs=[(45,165),(165,268),(268,388),(388,508),(508,638),(638,762),(762,882),(882,1002),(1002,1118),(1118,1235)]
for d,(a,b) in enumerate(xs):
  im=biggest_in(Wd,(a,635,b,805),'d%d'%d,dil=1); im.resize((round(im.width*130/im.height),130),Image.LANCZOS).save(D+'d%d.webp'%d,quality=90)
Hh=keyed('hud_raw.png',M)
fr=Hh[90:475,90:1175].copy(); Image.fromarray(fr).save('hudframe.png')
biggest_in(Hh,(510,520,755,765),'pause2',160)
print('ok')
