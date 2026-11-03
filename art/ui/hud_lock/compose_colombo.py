"""8.b Colombo scoreboard (Figma 446:193, green key): hot-pink lacquer frame, gold trim, twilight-purple panels, gold-ringed sockets, lotus crest on top.
OLD:: glossy Lancashire-red enamel frame with chrome edge, red roses on the
top corners, a Manchester worker bee on the top bar, dark charcoal chrome-rimmed bands. Composed straight onto the shared
template (like compose_edgbaston.py) so nothing gets squeezed.  usage: python3 compose_oldtrafford.py <sheet.png> <out.png> <pause.webp>"""
import sys, numpy as np, cv2
from PIL import Image
import build_locked_boards as m
im=np.array(Image.open(sys.argv[1]).convert('RGB')).astype(float)
al=np.clip((np.sqrt(((im-[0,255,0])**2).sum(2))-45)/60,0,1); ex=np.clip(im[...,1]-np.maximum(im[...,0],im[...,2]),0,None); al=al*np.clip(1-ex/90,0,1)
f=im.copy(); f[...,1]=np.minimum(f[...,1],np.maximum(f[...,0],f[...,2]))
a=np.dstack([f,cv2.erode((al*255).astype(np.uint8),np.ones((3,3),np.uint8))]).astype(np.float32)
T=m.TPL; X1,Y1,X2,Y2=m.BOX; W,H=m.CW,m.CH; rs=m.rs4
out=np.zeros((H,W,4),np.float32)
# inside: charcoal
mat=m.tile_material(a,(190,290,320,1080),W,H,.6)          # charcoal (inside the bands)
red=m.tile_material(a,(318,330,300,1400),W,H,.5)           # red enamel between the bands
out[Y1+6:Y2-6,X1+6:X2-6,:3]=red[Y1+6:Y2-6,X1+6:X2-6]; out[Y1+6:Y2-6,X1+6:X2-6,3]=255
# frame: red enamel top/bottom bars (with their chrome corners) and slim red sides
GT,GB,SW=34,24,18
side=a[330:450,66:110]; m.paste(out,rs(side,SW,Y2-Y1-GT-GB+8),X1,Y1+GT-4); m.paste(out,rs(side[:,::-1],SW,Y2-Y1-GT-GB+8),X2-SW,Y1+GT-4)
tb=a[118:166,280:670]; bar=rs(np.concatenate([tb,tb[:,::-1]],1),X2-X1,GT); yy,xx=np.mgrid[:GT,:X2-X1]; r_=8   # clean middle of the bar (roses + bee sit on the ends)
cm=np.ones((GT,X2-X1)); 
for cx_ in (r_,X2-X1-1-r_):
  d=np.hypot(xx-cx_,yy-r_); cm[(yy<r_)&(np.abs(xx-cx_)<=r_)&((xx<r_)|(xx>X2-X1-1-r_))&(d>r_)]=0
bar[...,3]*=cm; m.paste(out,bar,X1,Y1); m.paste(out,rs(a[526:560,110:1420],X2-X1,GB),X1,Y2-GB)
# chrome-rimmed bands on the template rows (rim only; clean rim = the top band's right end mirrored)
rim=a[163:318,268:700].copy(); hw=rim.shape[1]//2; rim[:,hw:]=rim[:,::-1][:,hw:]
L,R=T['score'][0],T['chase'][2]
for r1,r2 in [(T['chase'][1],T['chase'][3]),(T['score'][1],T['score'][3]),(T['eBar'][1],T['eBar'][3])]:
  pad=6; tr=[L-pad,r1-pad,R+pad,r2+pad]; i0,i1,j0,j1=int(tr[1])+3,int(tr[3])-3,int(tr[0])+3,int(tr[2])-3; out[i0:i1,j0:j1,:3]=mat[i0:i1,j0:j1]; pc=m.nine(rim,(0,0,rim.shape[1],rim.shape[0]),tr[2]-tr[0],tr[3]-tr[1],c=14); pc[14:-14,14:-14,3]=0; m.paste(out,pc,tr[0],tr[1])
# crest ring
bx,by,br=186,241,76*1.1; pc=m.circ(rs(a[int(by-br):int(by+br),int(bx-br):int(bx+br)],2*m.CREST[2]*1.1,2*m.CREST[2]*1.1),.93); m.paste(out,pc,m.CREST[0]-m.CREST[2]*1.1,m.CREST[1]-m.CREST[2]*1.1)
# wicket slots
for tw in T['wk']: m.paste(out,rs(a[1138-4:1138-4] if False else a[168:312,1136:1274],tw[2]-tw[0]+4,tw[3]-tw[1]+4),tw[0]-2,tw[1]-2)
# score panel
ts=T['score']; m.paste(out,m.nine(a,(113,333,702,444),ts[2]-ts[0],ts[3]-ts[1],c=14),ts[0],ts[1])
# sockets (left half of the first one, mirrored)
Rk=T['sock']['r']*1.3; s0=a[390-58:390+58,778-58:778+58].copy(); s0[:,58:]=s0[:,:58][:,::-1]; pc=m.circ(rs(s0,2*Rk,2*Rk),.9)
for x in T['sock']['xs']: m.paste(out,pc,x-Rk,T['sock']['y']-Rk)
# energy track + icon ring
te=T['eBar']; m.paste(out,m.nine(a,(213,460,1428,524),te[2]-te[0],te[3]-te[1],c=6),te[0],te[1])
ek=T['eIcon'][2]*1.45; ic=a[494-42:494+42,162-42:162+42].copy(); pc=m.circ(rs(ic,2*ek,2*ek),.88); m.paste(out,pc,T['eIcon'][0]-ek,T['eIcon'][1]-ek)
# roses on the top corners, bee on the top bar
from scipy import ndimage
def spr(box,h,cx,cy):
  x0,y0,x1,y1=box; p=a[y0:y1,x0:x1].copy(); lab,n=ndimage.label(p[...,3]>128); keep=np.argmax(ndimage.sum(np.ones_like(lab),lab,range(1,n+1)))+1; p[...,3]*=ndimage.binary_dilation(lab==keep,iterations=2); k=h/p.shape[0]; p=rs(p,p.shape[1]*k,h); m.paste(out,p,cx-p.shape[1]/2,cy-p.shape[0]/2)

spr((672,30,868,142),34,(X1+X2)/2,Y1+0)
Image.fromarray(np.clip(out,0,255).astype(np.uint8)).save(sys.argv[2])
p=Image.fromarray(a[562:995,520:1012].clip(0,255).astype(np.uint8)); p=p.crop(p.getbbox()); p.thumbnail((160,160),Image.LANCZOS)
c=Image.new('RGBA',(max(p.size),)*2); c.alpha_composite(p,((c.width-p.width)//2,(c.height-p.height)//2)); c.save(sys.argv[3],quality=92); print('ok')
