"""5.d Edgbaston scoreboard, locked to the shared template (Joe, Nov 2: 'new pass, it got worse over passes').
The generic builder squeezes this board's chunky frame (thick girders, wide brick pillars) and leaves fragments, so this one is
composed directly: frame rebuilt to the template box from the board's own girders + slim brick pilasters, dark navy inside,
the board's own gold-rimmed bands, crest ring, wicket slots, score panel, sockets, energy track and icon placed on the
template rects, and the gold bear on the top girder.  usage: python3 compose_edgbaston.py <out.png>"""
import sys, numpy as np, cv2
from PIL import Image
import build_locked_boards as m
a=np.array(Image.open('orig/edgbaston_orig.webp').convert('RGBA')).astype(np.float32)   # 760x389, slim pilasters
bear=np.array(Image.open('orig/edgbaston_sprites.webp').convert('RGBA')).astype(np.float32)
T=m.TPL; X1,Y1,X2,Y2=m.BOX; W,H=m.CW,m.CH
out=np.zeros((H,W,4),np.float32)
rs=lambda p,w,h: m.rs4(p,w,h)
# 1. inside: the board's own dark navy, tiled without stripes
mat=m.tile_material(a,(75,158,172,522),W,H,.6)
out[Y1+8:Y2-8,X1+8:X2-8,:3]=mat[Y1+8:Y2-8,X1+8:X2-8]; out[Y1+8:Y2-8,X1+8:X2-8,3]=255
# 2. frame: top + bottom riveted girders (scaled to the box width, slimmed in height), brick pilasters each side
GT,GB=24,26
tg=a[0:46].copy(); tg[:,602:742]=tg[:,477:617]   # bear's feet off the girder (two rivet periods along)
top=rs(tg,X2-X1,GT); bot=rs(a[342:389],X2-X1,GB)
PW=26; ph=Y2-Y1-GT-GB+12
def pil(x0,x1):
  p=a[46:342,x0:x1]; k=PW/p.shape[1]; p=rs(p,PW,p.shape[0]*k)
  c=(p.shape[0]-ph)//2; return p[c:c+ph] if p.shape[0]>=ph else rs(p,PW,ph)
m.paste(out,pil(0,28),X1,Y1+GT-6); m.paste(out,pil(732,760),X2-PW,Y1+GT-6)
m.paste(out,top,X1,Y1); m.paste(out,bot,X1,Y2-GB)
# 3. the three gold-rimmed bands (rims only) on the template rows
L,R=T['score'][0],T['chase'][2]
rows=[(T['chase'][1],T['chase'][3]),(T['score'][1],T['score'][3]),(T['eBar'][1],T['eBar'][3])]
rim=a[50:178,27:733].copy(); hw=rim.shape[1]//2; rim[:,:hw]=rim[:,::-1][:,:hw]   # clean rim: the top band's right end mirrored (the left end has the crest ring in its corner)
for r1,r2 in rows:
  pad=6; tr=[L-pad,r1-pad,R+pad,r2+pad]; pc=m.nine(rim,(0,0,rim.shape[1],rim.shape[0]),tr[2]-tr[0],tr[3]-tr[1],c=14); pc[14:-14,14:-14,3]=0; m.paste(out,pc,tr[0],tr[1])
# 4. crest ring (round recess) on the crest spot
bx,by,br=94.5,115.1,51.8; R2=br*1.08
pc=m.circ(rs(a[int(by-R2):int(by+R2),int(bx-R2):int(bx+R2)],2*m.CREST[2]*1.08,2*m.CREST[2]*1.08),.92); m.paste(out,pc,m.CREST[0]-m.CREST[2]*1.08,m.CREST[1]-m.CREST[2]*1.08)
# 5. wicket slots
f=lambda r: [int(round(v*760)) for v in r]
w=f([0.7121,0.0983,0.8225,0.2106])
for tw in T['wk']: m.paste(out,rs(a[w[1]-2:w[3]+2,w[0]-2:w[2]+2],tw[2]-tw[0]+4,tw[3]-tw[1]+4),tw[0]-2,tw[1]-2)
# 6. score panel (its own gold rim)
sr=f([0.0421,0.2487,0.4012,0.3641]); ts=T['score']; m.paste(out,m.nine(a,sr,ts[2]-ts[0],ts[3]-ts[1],c=14),ts[0],ts[1])
# 7. sockets: the board's first socket, isolated
sx,sy,srr=0.4634*760,0.3049*760,0.038*760; Rk=T['sock']['r']*1.3
s0=a[int(sy-srr*1.3):int(sy+srr*1.3),int(sx-srr*1.3):int(sx+srr*1.3)].copy(); hw=s0.shape[1]//2; s0[:,-hw:]=s0[:,:hw][:,::-1]   # left half mirrored: the right side touches the next socket
pc=m.circ(rs(s0,2*Rk,2*Rk),.9)
for x in T['sock']['xs']: m.paste(out,pc,x-Rk,T['sock']['y']-Rk)
# 8. energy track (inside only, no end caps) + icon ring
eb=f([0.13,0.3871,0.94,0.4233]); te=T['eBar']; m.paste(out,m.nine(a,eb,te[2]-te[0],te[3]-te[1],c=6),te[0],te[1])
ex,ey,er=0.0712*760,0.4042*760,0.0301*760; ek=T['eIcon'][2]*1.45
ic=a[int(ey-er*1.2):int(ey+er*1.2),int(ex-er*1.2):int(ex+er*1.2)].copy(); hw=ic.shape[1]//2; ic[:,:hw]=ic[:,::-1][:,:hw]   # right half mirrored: the left side touches the band rim
pc=m.circ(rs(ic,2*ek,2*ek),.88); m.paste(out,pc,T['eIcon'][0]-ek,T['eIcon'][1]-ek)
# 9. gold bear standing on the top girder, right of centre
k=40/bear.shape[0]; b=rs(bear,bear.shape[1]*k,40); m.paste(out,b,640-b.shape[1]/2,Y1+GT-4-40+6) if Y1+GT-38>=0 else None
Image.fromarray(np.clip(out,0,255).astype(np.uint8)).save(sys.argv[1]); print('ok')
