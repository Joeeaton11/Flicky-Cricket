import numpy as np, json, math, random
from PIL import Image, ImageDraw, ImageFilter
random.seed(7); np.random.seed(7)
SS=2
CW,CH=861*SS,1452*SS              # card, 3x css * supersample
b=round(0.06*861)*SS               # rail = 6% of card width
pad=b*4
FW,FH=CW+2*b+2*pad, CH+2*b+2*pad
x0,y0=pad+b,pad+b; x1,y1=x0+CW,y0+CH
canvas=Image.new('RGBA',(FW,FH),(0,0,0,0))
shadow=Image.new('L',(FW,FH),0)

def sdf_box(px,py,cx,cy,hx,hy,r):
    qx=np.abs(px-cx)-hx+r; qy=np.abs(py-cy)-hy+r
    return np.hypot(np.maximum(qx,0),np.maximum(qy,0))+np.minimum(np.maximum(qx,qy),0)-r
def smooth_noise(n,scale):
    a=np.random.rand(n//scale+3); xs=np.arange(n)/scale; i=xs.astype(int); f=xs-i; f=f*f*(3-2*f)
    return a[i]*(1-f)+a[i+1]*f

# ---------- wood rail ----------
yy,xx=np.mgrid[0:FH,0:FW].astype(np.float32)
cx,cy=(x0+x1)/2,(y0+y1)/2
so=sdf_box(xx,yy,cx,cy,CW/2+b,CH/2+b,b*0.9)
si=sdf_box(xx,yy,cx,cy,CW/2,CH/2,6*SS)
ring=(so<0)&(si>0)
t=np.clip(si/np.maximum(si-so,1e-3),0,1)           # 0 inner -> 1 outer
gx,gy=np.gradient(so)
nl=np.hypot(gx,gy)+1e-6; nx,ny=gx/nl,gy/nl
h=np.sin(np.pi*t)**0.7
slope=np.cos(np.pi*t)                              # +inner half faces inward, -outer half faces outward
tx,ty=-slope*nx,-slope*ny
lx,ly=-0.55,-0.83
light=np.clip(0.62+0.45*(tx*lx+ty*ly)+0.18*h,0,1.3)
horiz=np.abs(ny)>=np.abs(nx)
u=np.where(horiz,xx,yy)
nu=smooth_noise(int(max(FW,FH))+10,60*SS)
wob=nu[u.astype(int)]*6
grain=0.5+0.5*np.sin(t*34+wob+np.where(horiz,0,1.7))
grain2=0.5+0.5*np.sin(t*90+wob*2.3)
base=np.array([222,146,62.]); dark=np.array([156,86,34.]); lite=np.array([250,196,112.])
mix=(0.55*grain+0.15*grain2)[...,None]
col=base*(1-mix)+dark*mix*0.9+lite*0.1*mix
col=col*light[...,None]
spec=np.clip((t-0.62)/0.1,0,1)*np.clip((0.82-t)/0.1,0,1)*np.clip(-(nx*lx+ny*ly),0,1)
col=col+np.array([255,236,190.])*spec[...,None]*0.45
edge=np.clip(1-np.minimum(np.abs(so),np.abs(si))/(2.2*SS),0,1)
col=col*(1-edge[...,None]*0.75)+np.array([70,34,12.])*edge[...,None]*0.75
a=np.where(ring,1.0,0.0)
aa=np.clip(-so/1.5,0,1)*np.clip(si/1.5,0,1)
rail=np.dstack([np.clip(col,0,255),aa*255]).astype(np.uint8)
railimg=Image.fromarray(rail,'RGBA')
shadow.paste(255,mask=railimg.split()[3])
canvas.alpha_composite(railimg)
d=ImageDraw.Draw(canvas)

# ---------- helpers ----------
def sphere(cx,cy,r,base,lite,dark,hl=True):
    n=int(r*2)+4; Y,X=np.mgrid[0:n,0:n]-n/2
    dd=np.hypot(X,Y)/r; m=dd<1
    z=np.sqrt(np.clip(1-dd**2,0,1)); nxx,nyy=X/r,Y/r
    li=np.clip(0.55+0.6*(nxx*lx+nyy*ly+z*0.5),0,1.25)
    c=np.array(base)[None,None,:]*li[...,None]
    c=c*(dd<0.94)[...,None]+np.array(dark)*(dd>=0.94)[...,None]
    if hl:
        s=np.clip(1-np.hypot(X+r*0.38,Y+r*0.42)/(r*0.28),0,1)**2
        c=c+np.array(lite)*s[...,None]*0.8
    al=np.clip((1-dd)*r/1.2,0,1)
    im=Image.fromarray(np.dstack([np.clip(c,0,255),al*255]).astype(np.uint8),'RGBA')
    canvas.alpha_composite(im,(int(cx-n/2),int(cy-n/2))); shadow.paste(255,(int(cx-n/2),int(cy-n/2)),im.split()[3])

def tennis(cx,cy,r):
    sphere(cx,cy,r,(196,222,70),(255,255,220),(96,120,20))
    dl=ImageDraw.Draw(canvas)
    w=max(2,int(r*0.12))
    dl.arc((cx-r*1.75,cy-r*1.0,cx-r*0.35,cy+r*1.0),-48,48,fill=(250,250,240),width=w)
    dl.arc((cx+r*0.35,cy-r*1.0,cx+r*1.75,cy+r*1.0),132,228,fill=(250,250,240),width=w)
    # tape band
    tape=Image.new('RGBA',canvas.size,(0,0,0,0)); dt=ImageDraw.Draw(tape)
    pts=[(cx-r*0.95,cy-r*0.25),(cx+r*0.95,cy-r*0.05),(cx+r*0.95,cy+r*0.28),(cx-r*0.95,cy+r*0.08)]
    dt.polygon(pts,fill=(235,232,222,235))
    for k in range(6):
        xk=cx-r*0.8+k*r*0.32; dt.line((xk,cy-r*0.2+k*0.02*r,xk+r*0.1,cy+r*0.18),fill=(205,200,188,200),width=max(1,SS))
    m=Image.new('L',canvas.size,0); ImageDraw.Draw(m).ellipse((cx-r+1,cy-r+1,cx+r-1,cy+r-1),fill=255)
    tape.putalpha(Image.fromarray(np.minimum(np.array(tape.split()[3]),np.array(m))))
    canvas.alpha_composite(tape)

def _disc(cx,cy,r,o,yl,seed,lob,amp):
    n=int(r*2.4)+4; Y,X=np.mgrid[0:n,0:n]-n/2
    rho=np.hypot(X,Y)/r; th=np.arctan2(Y,X)
    edge=1+amp*np.sin(th*lob+seed)+amp*0.5*np.sin(th*lob*2.3+seed*2)
    m=rho<edge
    ruf=0.5+0.5*np.sin(rho*16+1.8*np.sin(th*lob*0.7+seed))
    z=np.sqrt(np.clip(1-(rho/edge)**2,0,1))
    li=np.clip(0.8+0.32*((X/r)*lx+(Y/r)*ly+z*0.4),0,1.15)
    k=np.clip(1-rho,0,1)[...,None]**0.8
    c=(np.array(o)*(1-k)+np.array(yl)*k)*(0.9+0.1*ruf)[...,None]*li[...,None]
    tip=np.clip((rho-edge*0.78)/(edge*0.22),0,1)[...,None]
    c=c*(1-tip*0.12)+np.array([255,226,140.])*tip*0.12
    al=np.clip((edge-rho)*r/1.2,0,1)
    im=Image.fromarray(np.dstack([np.clip(c,0,255),al*255]).astype(np.uint8),'RGBA')
    canvas.alpha_composite(im,(int(cx-n/2),int(cy-n/2))); shadow.paste(255,(int(cx-n/2),int(cy-n/2)),im.split()[3])
def marigold(cx,cy,r):
    sd=(cx*0.013+cy*0.007)
    _disc(cx,cy+r*0.04,r,(214,96,14),(240,138,28),sd,22,0.05)
    _disc(cx-r*0.03,cy-r*0.02,r*0.76,(238,126,22),(252,168,40),sd+1,19,0.06)
    _disc(cx-r*0.05,cy-r*0.05,r*0.5,(250,156,34),(255,196,64),sd+2,15,0.07)
    _disc(cx-r*0.06,cy-r*0.07,r*0.24,(255,184,52),(255,214,98),sd+3,11,0.08)

def leaf(cx,cy,L,ang):
    w=L*0.38; ca,sa=math.cos(ang),math.sin(ang)
    pts=[]
    for i in range(21):
        s=i/20; x=s*L; y=w*math.sin(math.pi*s)*0.5
        pts.append((cx+x*ca-y*sa, cy+x*sa+y*ca))
    for i in range(20,-1,-1):
        s=i/20; x=s*L; y=-w*math.sin(math.pi*s)*0.5
        pts.append((cx+x*ca-y*sa, cy+x*sa+y*ca))
    dl=ImageDraw.Draw(canvas)
    dl.polygon(pts,fill=(70,150,52,255),outline=(30,80,24,255))
    dl.line((cx,cy,cx+L*0.9*ca,cy+L*0.9*sa),fill=(150,210,110,255),width=max(1,SS))
    m=Image.new('L',canvas.size,0); ImageDraw.Draw(m).polygon(pts,fill=255); shadow.paste(255,mask=m)

def corner(cx,cy,sx,sy):
    s=b/52; b_=b; K=1.35
    for ang,L in ((-0.15,1.3),(0.75,1.2),(1.7,1.25),(2.6,1.0)):
        a2=ang if sx>0 else math.pi-ang
        a2=a2 if sy>0 else -a2
        leaf(cx,cy,b*K*L*1.15,a2)
    marigold(cx+sx*b*K*1.75,cy-sy*b*K*0.05,b*K*0.3)
    marigold(cx-sx*b*K*0.05,cy+sy*b*K*1.75,b*K*0.3)
    marigold(cx+sx*b*K*1.0,cy-sy*b*K*0.1,b*K*0.44)
    marigold(cx-sx*b*K*0.1,cy+sy*b*K*1.0,b*K*0.44)
    marigold(cx+sx*b*K*0.08,cy+sy*b*K*0.08,b*K*0.7)

def tape_band(xc,yc,horizontal,colr):
    L=int(b*1.7); xa=int(xc-b/2); ya=int(yc-L/2)
    reg=np.array(canvas.crop((xa,ya,xa+b,ya+L))).astype(float)
    Y,X=np.mgrid[0:L,0:b].astype(float)
    tt=X/(b-1)
    prof=0.62+0.5*np.sin(np.pi*tt)**0.8-0.12*(tt-0.3)
    stripe=0.5+0.5*np.sin((X*0.9+Y)/(b*0.16)*np.pi)
    c=np.array(colr,float)[None,None,:]*(prof*(0.82+0.18*stripe))[...,None]
    seam=np.abs(((X*0.9+Y)/(b*0.32))%1-0.5)<0.04
    c=np.where(seam[...,None],c*0.7,c)
    endsh=np.clip(np.minimum(Y,L-1-Y)/(b*0.08),0,1)[...,None]
    c=c*(0.55+0.45*endsh)
    hl=np.clip(1-np.abs(tt-0.32)/0.08,0,1)[...,None]*0.35
    c=c+255*hl
    out=reg.copy(); out[...,:3]=np.clip(c,0,255); out[...,3]=np.maximum(reg[...,3],230)
    canvas.paste(Image.fromarray(out.astype(np.uint8),'RGBA'),(xa,ya))

# side rail tape wraps (subtle detail)
for f,colr in ((0.36,(196,52,46)),(0.64,(52,96,186))):
    tape_band(x0-b/2,y0+CH*f,True,colr); tape_band(x1+b/2,y0+CH*f,True,colr)

# brass bolts along the rails
for f in (0.2,0.8):
    for (px,py) in ((x0+CW*f,y0-b/2),(x0+CW*f,y1+b/2)):
        sphere(px,py,b*0.13,(212,170,70),(255,245,200),(120,84,26))
for f in (0.18,0.5,0.82):
    for (px,py) in ((x0-b/2,y0+CH*f),(x1+b/2,y0+CH*f)):
        sphere(px,py,b*0.13,(212,170,70),(255,245,200),(120,84,26))

# bunting on top rail (string across rail; flags tip just onto the card)
cols=[(220,52,52),(250,196,40),(60,170,80),(50,110,210),(230,90,170)]
def bunting(xa,xb,yb,sag,down=True):
    dl=ImageDraw.Draw(canvas); N=max(1,int((xb-xa)/(b*0.9))); pts=[]
    for i in range(N+1):
        s=i/N; x=xa+(xb-xa)*s; y=yb+sag*4*s*(1-s); pts.append((x,y))
    dl.line(pts,fill=(245,235,210,255),width=SS*3)
    for i in range(N):
        (xa_,ya_),(xb_,yb_)=pts[i],pts[i+1]; mx=(xa_+xb_)/2; my=(ya_+yb_)/2
        hgt=b*0.78*(1 if down else -1)
        tri=[(xa_+b*0.06,ya_),(xb_-b*0.06,yb_),(mx,my+hgt)]
        c=cols[i%len(cols)]
        dl.polygon(tri,fill=c+(255,),outline=(60,24,10,255))
        dl.line((xa_+b*0.12,ya_+b*0.03,mx,my+hgt*0.8),fill=tuple(min(255,int(v*1.25)) for v in c)+(255,),width=SS)
        m=Image.new('L',canvas.size,0); ImageDraw.Draw(m).polygon(tri,fill=255); shadow.paste(255,mask=m)
gap=b*2.4
bunting(x0+b*0.9,cx-gap,y0-b*0.42,b*0.35); bunting(cx+gap,x1-b*0.9,y0-b*0.42,b*0.35)
bunting(x0+b*0.9,cx-gap*0.9,y1+b*0.35,b*0.3); bunting(cx+gap*0.9,x1-b*0.9,y1+b*0.35,b*0.3)

# corners: identical marigold + leaf clusters, flush with outer edge
for sx,sy,px,py in ((1,1,x0-b*0.55,y0-b*0.55),(-1,1,x1+b*0.55,y0-b*0.55),(1,-1,x0-b*0.55,y1+b*0.55),(-1,-1,x1+b*0.55,y1+b*0.55)):
    corner(px,py,sx,sy)


def garland(x,ya,yb,side):
    n=max(1,int(abs(yb-ya)/(b*0.6)))
    for i in range(n):
        yk=ya+(yb-ya)*i/n; xk=x+side*b*0.08*math.sin(i*1.3)
        marigold(xk,yk,b*0.33)
        if i%2==1: leaf(xk,yk,b*0.55,math.pi if side<0 else 0)
for (gx,side) in ((x0-b*0.62,-1),(x1+b*0.62,1)):
    garland(gx,y0+b*1.2,y0+CH*0.22,side)
    garland(gx,y1-b*1.2,y1-CH*0.22,side)
def bat(cx,cy,L,ang):
    lay=Image.new('RGBA',canvas.size,(0,0,0,0)); dl=ImageDraw.Draw(lay); ca,sa=math.cos(ang),math.sin(ang)
    def P(u,v): return (cx+u*ca-v*sa, cy+u*sa+v*ca)
    bw=L*0.13
    blade=[P(0,-bw/2),P(L*0.68,-bw/2),P(L*0.72,0),P(L*0.68,bw/2),P(0,bw/2)]
    dl.polygon(blade,fill=(236,206,150,255),outline=(96,60,24,255))
    dl.line((P(L*0.05,-bw*0.25),P(L*0.62,-bw*0.25)),fill=(255,236,190,255),width=SS*2)
    dl.line((P(-L*0.28,0),P(0,0)),fill=(40,40,44,255),width=int(bw*0.45))
    for k in range(4): dl.line((P(-L*0.26+k*L*0.07,-bw*0.22),P(-L*0.24+k*L*0.07,bw*0.22)),fill=(200,40,40,255),width=SS*2)
    canvas.alpha_composite(lay); shadow.paste(255,mask=lay.split()[3])

# topper: brick arch holding a taped tennis ball
def brick_arch(cx,base_y,R):
    dl=ImageDraw.Draw(canvas); r0=R*0.62; N=9
    # back fill
    dl.pieslice((cx-r0,base_y-r0,cx+r0,base_y+r0),180,360,fill=(96,40,26,255))
    for i in range(N):
        a0=math.pi+math.pi*i/N; a1=math.pi+math.pi*(i+1)/N; g=0.025
        pts=[(cx+math.cos(a0+g)*R,base_y+math.sin(a0+g)*R),(cx+math.cos(a1-g)*R,base_y+math.sin(a1-g)*R),(cx+math.cos(a1-g)*r0,base_y+math.sin(a1-g)*r0),(cx+math.cos(a0+g)*r0,base_y+math.sin(a0+g)*r0)]
        tone=random.choice([(184,84,54),(170,74,46),(198,98,62),(160,70,44)])
        dl.polygon(pts,fill=tone+(255,),outline=(70,28,16,255))
        hx=(pts[0][0]+pts[1][0])/2; hy=(pts[0][1]+pts[1][1])/2
        dl.line((pts[0],pts[1]),fill=(232,150,110,255),width=SS*2)
    # pillars
    for side in (-1,1):
        for k in range(2):
            bx0=cx+side*(r0+ (R-r0)*0.0) if side>0 else cx-R
            bx1=bx0+(R-r0)
            by0=base_y+k*(b*0.42); by1=by0+b*0.4
            dl.rectangle((bx0,by0,bx1,by1),fill=(180,80,50,255),outline=(70,28,16,255))
            dl.line((bx0+2,by0+2,bx1-2,by0+2),fill=(232,150,110,255),width=SS*2)
    m=Image.new('L',canvas.size,0); ImageDraw.Draw(m).pieslice((cx-R,base_y-R,cx+R,base_y+R),180,360,fill=255)
    ImageDraw.Draw(m).rectangle((cx-R,base_y,cx+R,base_y+b*0.84),fill=255); shadow.paste(255,mask=m)
R=b*1.95; by=y0+b*0.15
brick_arch(cx,by,R)
tennis(cx,by-R*0.18,R*0.5)
for side in (-1,1):
    leaf(cx+side*R*1.05,by+b*0.1,b*1.0,math.pi*(1 if side<0 else 0)-side*0.35)
    marigold(cx+side*R*1.08,by+b*0.25,b*0.45)
    marigold(cx+side*R*1.45,by+b*0.35,b*0.32)

# plaque: wooden plank with a chalk wicket
def plank(cx,cy,w,hh):
    pl=Image.new('RGBA',canvas.size,(0,0,0,0)); dp=ImageDraw.Draw(pl)
    box=(cx-w/2,cy-hh/2,cx+w/2,cy+hh/2)
    dp.rounded_rectangle(box,radius=int(hh*0.18),fill=(150,96,52,255),outline=(64,34,14,255),width=SS*3)
    for k in range(5):
        yk=box[1]+hh*(0.2+0.15*k); dp.line((box[0]+w*0.06,yk,box[2]-w*0.06,yk+random.uniform(-3,3)*SS),fill=(122,74,38,255),width=SS*2)
    dp.line((box[0]+8,box[1]+6,box[2]-8,box[1]+6),fill=(204,150,98,255),width=SS*3)
    for nx_ in (box[0]+hh*0.25,box[2]-hh*0.25):
        dp.ellipse((nx_-hh*0.07,cy-hh*0.07,nx_+hh*0.07,cy+hh*0.07),fill=(110,110,120,255),outline=(50,50,56,255))
    # chalk stumps
    for k in (-1,0,1):
        xs=cx+k*hh*0.22
        for j in range(3):
            dp.line((xs+random.uniform(-2,2)*SS,cy-hh*0.3,xs+random.uniform(-2,2)*SS,cy+hh*0.32),fill=(250,250,245,210),width=SS*3)
    dp.line((cx-hh*0.3,cy-hh*0.34,cx-hh*0.02,cy-hh*0.34),fill=(250,250,245,220),width=SS*3)
    dp.line((cx+hh*0.02,cy-hh*0.34,cx+hh*0.3,cy-hh*0.34),fill=(250,250,245,220),width=SS*3)
    canvas.alpha_composite(pl); shadow.paste(255,mask=pl.split()[3])
bat(cx-b*0.25,y1+b*0.7,b*4.3,math.radians(200))
bat(cx+b*0.25,y1+b*0.7,b*4.3,math.radians(-20))
plank(cx,y1+b*0.7,b*4.0,b*1.95)
for side in (-1,1): marigold(cx+side*b*2.05,y1+b*0.3,b*0.4)

# soft drop shadow under the whole frame + a faint inner shadow onto the card edge
sh=shadow.filter(ImageFilter.GaussianBlur(7*SS))
shl=Image.new('RGBA',canvas.size,(20,8,0,0)); shl.putalpha(Image.fromarray((np.array(sh)*0.62).astype(np.uint8)))
shl=Image.fromarray(np.roll(np.array(shl),(5*SS,3*SS),(0,1)))
inner=np.zeros((FH,FW),np.float32); dist=np.clip(si,0,None)
inner=np.where((si>-1)&(si<9*SS)&(so<0),np.clip(1-si/(9*SS),0,1)*0.35,0)
innerimg=Image.fromarray(np.dstack([np.zeros((FH,FW,3)),inner*255]).astype(np.uint8),'RGBA')
final=Image.new('RGBA',canvas.size,(0,0,0,0))
final.alpha_composite(shl); final.alpha_composite(innerimg); final.alpha_composite(canvas)
# card opening must be clear apart from the inner shadow and the small flair that tips onto it
final=final.resize((FW//SS,FH//SS),Image.LANCZOS)
X0,Y0,X1,Y1=x0//SS,y0//SS,x1//SS,y1//SS
bb=final.getbbox(); final=final.crop(bb); X0-=bb[0];X1-=bb[0];Y0-=bb[1];Y1-=bb[1]; W2,H2=final.size
final.save('gully_frame.png')
import slicer; slicer.save(final,X0,Y0,X1,Y1,b/SS,1,2.2,2.2)
g=Image.new('RGBA',final.size,(40,90,40,255)); g.alpha_composite(final); g.convert('RGB').resize((W2//2,H2//2)).save('/tmp/v22/codeframe.jpg')
