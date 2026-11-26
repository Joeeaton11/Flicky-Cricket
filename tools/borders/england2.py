import numpy as np, json, math, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont
random.seed(21); np.random.seed(21)
SS=2
CW,CH=861*SS,1452*SS
b=round(0.06*861)*SS
pad=b*4
FW,FH=CW+2*b+2*pad, CH+2*b+2*pad
x0,y0=pad+b,pad+b; x1,y1=x0+CW,y0+CH
cx,cy=(x0+x1)/2,(y0+y1)/2
canvas=Image.new('RGBA',(FW,FH),(0,0,0,0)); gl=Image.new('RGBA',(FW,FH),(0,0,0,0)); fg=Image.new('RGBA',(FW,FH),(0,0,0,0))
shadow=Image.new('L',(FW,FH),0)
lx,ly=-0.55,-0.83
GOLD=np.array([240,190,70.]); CRIM=np.array([170,20,36.])
def addshadow(im,pos=(0,0)): shadow.paste(255,pos,im.split()[3])
def put(rgb,alpha,pos,dst=None,sh=True):
    im=Image.fromarray(np.dstack([np.clip(rgb,0,255),np.clip(alpha,0,1)*255]).astype(np.uint8),'RGBA')
    (dst or canvas).alpha_composite(im,(int(pos[0]),int(pos[1])))
    if sh: addshadow(im,(int(pos[0]),int(pos[1])))
def sdf_box(px,py,cx_,cy_,hx,hy,r):
    qx=np.abs(px-cx_)-hx+r; qy=np.abs(py-cy_)-hy+r
    return np.hypot(np.maximum(qx,0),np.maximum(qy,0))+np.minimum(np.maximum(qx,qy),0)-r
def glow(x,y,r,s=1.0,col=(255,226,150)):
    n=int(r*2)+4; Y,X=np.mgrid[0:n,0:n]-n/2
    a=np.clip(1-np.hypot(X,Y)/r,0,1)**1.8*s
    gl.alpha_composite(Image.fromarray(np.dstack([np.full((n,n,3),col),a*255]).astype(np.uint8),'RGBA'),(int(x-n/2),int(y-n/2)))
def shade(mask_img,col,soft=None,spec=0.6,edge=(80,30,10),ow=5,dst=None,tex=None):
    """emboss a flat PIL 'L' mask into a glossy, bevelled shape"""
    a=np.array(mask_img).astype(float)/255.
    ys,xs=np.nonzero(a>0.02)
    if len(ys)==0: return
    Y0,Y1,X0,X1=max(ys.min()-8,0),ys.max()+9,max(xs.min()-8,0),xs.max()+9
    a=a[Y0:Y1,X0:X1]
    soft=soft or b*0.12
    h=np.array(Image.fromarray((a*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(soft)))/255.
    gy,gx=np.gradient(h)
    k=soft*1.6
    li=np.clip(0.78+(-gx*lx-gy*ly)*k*2.2+0.12*(h-0.5),0.35,1.4)
    c=np.array(col,float)[None,None,:]*np.ones(a.shape+(1,))
    if tex is not None: c=tex(c,Y0,X0)
    c=c*li[...,None]+np.array([255,252,236.])*(np.clip((li-1.12)/0.25,0,1)*spec)[...,None]
    if ow:
        ol=np.array(Image.fromarray((a*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(ow)))/255.
        c=np.where(((ol>0.5)&(a<0.5))[...,None],np.array(edge,float),c); a=np.maximum(a,ol)
    put(c,a,(X0,Y0),dst)

BLUE=np.array([22,52,140.]); REDF=np.array([206,22,42.]); WHT=np.array([248,248,246.])
# ---------- rail: a glossy Union Flag ribbon with gold piping ----------
yy,xx=np.mgrid[0:FH,0:FW].astype(np.float32)
so=sdf_box(xx,yy,cx,cy,CW/2+b,CH/2+b,b*0.3)
si=sdf_box(xx,yy,cx,cy,CW/2,CH/2,2*SS)
t=np.clip(si/np.maximum(si-so,1e-3),0,1)
horiz=np.abs(yy-cy)-CH/2 > np.abs(xx-cx)-CW/2
sgn=np.where(horiz,np.sign(yy-cy),np.sign(xx-cx))
u=np.where(horiz,xx,yy)
q=np.clip((t-0.12)/0.76,0,1)                         # across the flag part (0..1)
# one big flag: the frame is a window cut from a single Union Flag the size of the whole frame
FWd,FHd=CW+2*b,CH+2*b
X=xx-cx; Yv=yy-cy
hyp=math.hypot(FWd,FHd)
d1=np.abs(X*FHd-Yv*FWd)/hyp; d2=np.abs(X*FHd+Yv*FWd)/hyp
U=FHd/30.0                                         # flag unit (flag width = 30 units across the short side)
U=min(FWd,FHd)/30.0*1.0
col=np.zeros(xx.shape+(3,),np.float32)+BLUE
dg=np.minimum(d1,d2)
col=np.where((dg<U*3)[...,None],WHT,col)
# counterchanged red saltire: offset to one side of each diagonal
sd1=(X*FHd-Yv*FWd)/hyp; sd2=(X*FHd+Yv*FWd)/hyp
s1=np.where(X*Yv>0,1,-1)
rs1=np.abs(sd1+np.sign(X)*U*1.0); rs2=np.abs(sd2-np.sign(X)*U*1.0)
red_d=np.where(d1<d2,rs1,rs2)
col=np.where((red_d<U*1.0)[...,None]&(dg<U*3)[...,None],REDF,col)
cr=(np.abs(Yv)<U*5)|(np.abs(X)<U*5)
col=np.where(cr[...,None],WHT,col)
crr=(np.abs(Yv)<U*3)|(np.abs(X)<U*3)
col=np.where(crr[...,None],REDF,col)
q=np.clip((t-0.12)/0.76,0,1)
# fabric ripple + satin gloss
rip=np.sin(u/(b*1.05))+0.5*np.sin(u/(b*0.47)+1.3)
li=0.86+0.13*rip+0.12*np.sin(np.pi*q)
gloss=np.clip(1-np.abs(q-0.3-0.06*rip)/0.08,0,1)*np.clip(0.5+0.5*rip,0,1)
col=col*li[...,None]+np.array([255,255,255.])*(gloss*0.35)[...,None]
# gold piping both edges
def pipe(t0,t1):
    qq=np.clip((t-t0)/(t1-t0),0,1); n_=2*qq-1; z=np.sqrt(np.clip(1-n_**2,0,1))
    nxl=np.where(horiz,0,1)*n_*sgn; nyl=np.where(horiz,1,0)*n_*sgn
    ph=((u+n_*b*0.1)/(b*0.2))%1.0; sb=np.sin(np.pi*ph)
    l_=np.clip(0.45+0.55*(nxl*lx+nyl*ly)+0.35*z,0.2,1.35)*(0.55+0.45*sb)
    return GOLD*l_[...,None]+np.array([255,250,220.])*(np.clip(1-np.abs(ph-0.35)/0.12,0,1)*z*0.5)[...,None]
col=np.where((t<0.12)[...,None],pipe(0,0.12),col)
col=np.where((t>0.88)[...,None],pipe(0.88,1.0),col)
edge=np.clip(1-np.minimum(np.abs(so),np.abs(si))/(2.0*SS),0,1)
col=col*(1-edge[...,None]*0.7)+np.array([40,20,10.])*edge[...,None]*0.7
aa=np.clip(-so/1.5,0,1)*np.clip(si/1.5,0,1)
railimg=Image.fromarray(np.dstack([np.clip(col,0,255),aa*255]).astype(np.uint8),'RGBA')
canvas.alpha_composite(railimg); addshadow(railimg)
del yy,xx,so,si,t,horiz,sgn,u,q,X,Yv,d1,d2,col,dg,red_d,cr,crr,rip,li,gloss,edge,aa,sd1,sd2,rs1,rs2,s1

# ---------- heraldic gold lion face ----------
def lion(x,y,R,dst=None):
    # outer mane: flame-like lobes
    m=Image.new('L',canvas.size,0); d=ImageDraw.Draw(m); pts=[]
    for k in range(361):
        th=math.radians(k); r=R*(0.84+0.16*abs(math.cos(th*7))**0.6)
        pts.append((x+math.cos(th)*r,y+R*0.05+math.sin(th)*r*1.02))
    d.polygon(pts,fill=255); shade(m,(214,140,40),soft=R*0.08,edge=(90,44,8),ow=5,dst=dst)
    # inner mane ring
    m=Image.new('L',canvas.size,0); d=ImageDraw.Draw(m); pts=[]
    for k in range(361):
        th=math.radians(k); r=R*(0.66+0.1*abs(math.cos(th*7+0.45))**0.6)
        pts.append((x+math.cos(th)*r,y+R*0.08+math.sin(th)*r))
    d.polygon(pts,fill=255); shade(m,(236,170,52),soft=R*0.07,edge=(110,60,14),ow=3,dst=dst)
    # mane strands
    dd=ImageDraw.Draw(dst or canvas)
    for k in range(14):
        th=k/14*2*math.pi+0.2
        dd.arc((x-R*0.78,y+R*0.05-R*0.78,x+R*0.78,y+R*0.05+R*0.78),math.degrees(th),math.degrees(th)+12,fill=(150,86,18,255),width=SS*2)
    # ears
    for s_ in (-1,1):
        m=Image.new('L',canvas.size,0); ImageDraw.Draw(m).ellipse((x+s_*R*0.36-R*0.14,y-R*0.46-R*0.14,x+s_*R*0.36+R*0.14,y-R*0.46+R*0.14),fill=255)
        shade(m,(246,190,72),soft=R*0.05,edge=(110,60,14),ow=3,dst=dst)
        dd.ellipse((x+s_*R*0.36-R*0.07,y-R*0.46-R*0.06,x+s_*R*0.36+R*0.07,y-R*0.46+R*0.07),fill=(170,100,24,255))
    # face
    m=Image.new('L',canvas.size,0); d=ImageDraw.Draw(m)
    d.ellipse((x-R*0.44,y-R*0.5,x+R*0.44,y+R*0.36),fill=255)
    d.polygon([(x-R*0.4,y+R*0.05),(x+R*0.4,y+R*0.05),(x+R*0.2,y+R*0.6),(x-R*0.2,y+R*0.6)],fill=255)
    shade(m,(252,206,96),soft=R*0.09,edge=(110,60,14),ow=3,dst=dst,spec=0.8)
    # muzzle
    m=Image.new('L',canvas.size,0); d=ImageDraw.Draw(m)
    for s_ in (-1,1): d.ellipse((x+s_*R*0.12-R*0.17,y+R*0.14-R*0.13,x+s_*R*0.12+R*0.17,y+R*0.14+R*0.15),fill=255)
    d.ellipse((x-R*0.14,y+R*0.28,x+R*0.14,y+R*0.5),fill=255)
    shade(m,(255,228,150),soft=R*0.05,edge=(150,96,24),ow=0,dst=dst)
    dd=ImageDraw.Draw(dst or canvas)
    # brow + eyes
    for s_ in (-1,1):
        ex,ey=x+s_*R*0.18,y-R*0.1
        dd.line((ex-s_*R*0.14,ey-R*0.14,ex+s_*R*0.1,ey-R*0.06),fill=(130,70,14,255),width=int(R*0.05))
        dd.ellipse((ex-R*0.09,ey-R*0.07,ex+R*0.09,ey+R*0.06),fill=(255,250,235,255),outline=(90,40,10,255),width=SS*2)
        dd.ellipse((ex-R*0.05,ey-R*0.05,ex+R*0.05,ey+R*0.05),fill=(60,30,10,255))
        dd.ellipse((ex-R*0.03,ey-R*0.04,ex,ey-R*0.01),fill=(255,255,255,255))
        for k in range(3): dd.ellipse((x+s_*R*(0.08+k*0.07)-R*0.015,y+R*0.15+k*R*0.03-R*0.015,x+s_*R*(0.08+k*0.07)+R*0.015,y+R*0.15+k*R*0.03+R*0.015),fill=(150,90,20,255))
    # nose bridge + nose
    dd.line((x-R*0.06,y-R*0.12,x-R*0.04,y+R*0.04),fill=(200,140,50,255),width=int(R*0.03)); dd.line((x+R*0.06,y-R*0.12,x+R*0.04,y+R*0.04),fill=(200,140,50,255),width=int(R*0.03))
    dd.polygon([(x-R*0.12,y+R*0.02),(x+R*0.12,y+R*0.02),(x,y+R*0.14)],fill=(80,36,10,255))
    dd.ellipse((x-R*0.06,y+R*0.02,x-R*0.01,y+R*0.05),fill=(180,120,90,255))
    dd.line((x,y+R*0.14,x,y+R*0.24),fill=(90,40,10,255),width=int(R*0.03))
    dd.arc((x-R*0.16,y+R*0.12,x,y+R*0.3),20,150,fill=(90,40,10,255),width=int(R*0.03)); dd.arc((x,y+R*0.12,x+R*0.16,y+R*0.3),30,160,fill=(90,40,10,255),width=int(R*0.03))
def laurel(x,y,ang,L,dirn,scale=1.0):
    pts=[]
    for k in range(9):
        t_=k/8; a=ang+dirn*0.9*t_
        pts.append((x+math.cos(ang+dirn*0.45*t_)*L*t_,y+math.sin(ang+dirn*0.45*t_)*L*t_))
    dd=ImageDraw.Draw(canvas); dd.line(pts,fill=(110,60,14,255),width=int(b*0.12*scale),joint='curve'); dd.line(pts,fill=(240,190,70,255),width=int(b*0.07*scale),joint='curve')
    for k in range(1,9):
        px_,py_=pts[k]; tang=math.atan2(pts[k][1]-pts[k-1][1],pts[k][0]-pts[k-1][0])
        for s_ in (-1,1):
            la=tang+s_*0.7; ll=b*0.5*scale*(1-k*0.05)
            m=Image.new('L',canvas.size,0); d=ImageDraw.Draw(m); q=[]
            for j in range(13):
                t_=j/12; w_=ll*0.28*math.sin(math.pi*t_)
                q.append((px_+math.cos(la)*ll*t_-math.sin(la)*w_,py_+math.sin(la)*ll*t_+math.cos(la)*w_))
            for j in range(12,-1,-1):
                t_=j/12; w_=ll*0.28*math.sin(math.pi*t_)
                q.append((px_+math.cos(la)*ll*t_+math.sin(la)*w_,py_+math.sin(la)*ll*t_-math.cos(la)*w_))
            d.polygon(q,fill=255); shade(m,(240,186,60),soft=ll*0.12,edge=(110,60,14),ow=3)

def sparkle(x,y,r):
    d=ImageDraw.Draw(fg)
    d.polygon([(x,y-r),(x+r*0.22,y-r*0.22),(x+r,y),(x+r*0.22,y+r*0.22),(x,y+r),(x-r*0.22,y+r*0.22),(x-r,y),(x-r*0.22,y-r*0.22)],fill=(255,250,220,255))
    glow(x,y,r*2,0.6)
for s_ in (-1,1): sparkle(cx+s_*b*2.6,y0-b*2.0,b*0.32); sparkle(cx+s_*b*3.3,y0-b*1.1,b*0.2)


def rosette(x,y,R,dst=None):
    for rr,c,n_ in ((1.0,(22,52,140),18),(0.74,(248,248,246),16),(0.52,(206,22,42),14)):
        m=Image.new('L',canvas.size,0); d=ImageDraw.Draw(m); pts=[]
        for k in range(n_*8+1):
            th=k/(n_*8)*2*math.pi; r=R*rr*(0.9+0.1*abs(math.cos(th*n_/2)))
            pts.append((x+math.cos(th)*r,y+math.sin(th)*r))
        d.polygon(pts,fill=255)
        def pleat(c_,Y0,X0,n_=n_):
            Yg,Xg=np.mgrid[Y0:Y0+c_.shape[0],X0:X0+c_.shape[1]].astype(float)
            th=np.arctan2(Yg-y,Xg-x); return c_*(0.8+0.25*np.cos(th*n_))[...,None]
        shade(m,c,soft=R*0.08,edge=(30,20,20),ow=3,tex=pleat,spec=0.5,dst=dst)
    m=Image.new('L',canvas.size,0); ImageDraw.Draw(m).ellipse((x-R*0.28,y-R*0.28,x+R*0.28,y+R*0.28),fill=255)
    shade(m,(244,196,74),soft=R*0.06,edge=(100,50,10),ow=3,spec=1.0,dst=dst)

# ---------- flair: red telephone box (bottom-left) and pillar box ----------
def phonebox(x,yb,W,H):
    m=Image.new('L',canvas.size,0); d=ImageDraw.Draw(m)
    d.rectangle((x-W/2,yb-H*0.88,x+W/2,yb),fill=255)
    d.rounded_rectangle((x-W*0.56,yb-H*0.94,x+W*0.56,yb-H*0.84),radius=int(W*0.04),fill=255)
    d.chord((x-W*0.5,yb-H*1.05,x+W*0.5,yb-H*0.86),180,360,fill=255)
    d.rectangle((x-W*0.6,yb-H*0.04,x+W*0.6,yb+H*0.02),fill=255)
    def panes(c,Y0,X0):
        Yg,Xg=np.mgrid[Y0:Y0+c.shape[0],X0:X0+c.shape[1]].astype(float)
        fx=(Xg-(x-W/2))/W; fy=(yb-Yg)/H
        win=(fy>0.2)&(fy<0.74)&(fx>0.14)&(fx<0.86)
        gx=((fx-0.14)/0.72*3)%1; gy=((fy-0.2)/0.54*6)%1
        glass=win&(gx>0.12)&(gx<0.88)&(gy>0.1)&(gy<0.9)
        sky=np.array([150,200,235.])*(0.8+0.3*((gx+gy*0.5)%1<0.3))[...,None]
        c=np.where(glass[...,None],sky,np.where(win[...,None],c*0.8,c))
        sign=(fy>0.77)&(fy<0.84)&(fx>0.12)&(fx<0.88)
        c=np.where(sign[...,None],np.array([250,250,240.]),c)
        return c
    shade(m,(212,26,36),soft=W*0.06,edge=(70,8,10),ow=5,tex=panes,spec=0.6)
    d=ImageDraw.Draw(canvas)
    fnt=ImageFont.truetype('/tmp/lilita.ttf',max(8,int(H*0.05)))
    d.text((x,yb-H*0.805),"TELEPHONE",font=fnt,fill=(30,30,30,255),anchor='mm')
    # little crown on top
    m=Image.new('L',canvas.size,0); ImageDraw.Draw(m).polygon([(x-W*0.16,yb-H*1.02),(x+W*0.16,yb-H*1.02),(x+W*0.16,yb-H*1.08),(x+W*0.06,yb-H*1.05),(x,yb-H*1.11),(x-W*0.06,yb-H*1.05),(x-W*0.16,yb-H*1.08)],fill=255)
    shade(m,(244,196,74),soft=W*0.02,edge=(100,50,10),ow=3)
def pillarbox(x,yb,W,H):
    m=Image.new('L',canvas.size,0); d=ImageDraw.Draw(m)
    d.rectangle((x-W/2,yb-H*0.78,x+W/2,yb-H*0.06),fill=255)
    d.ellipse((x-W*0.56,yb-H*1.0,x+W*0.56,yb-H*0.64),fill=255)
    d.rectangle((x-W*0.6,yb-H*0.08,x+W*0.6,yb),fill=255)
    def cyl(c,Y0,X0):
        Yg,Xg=np.mgrid[Y0:Y0+c.shape[0],X0:X0+c.shape[1]].astype(float)
        fx=(Xg-x)/(W/2); fy=(yb-Yg)/H
        c=c*np.clip(0.75+0.4*np.cos(np.clip(fx+0.35,-1.6,1.6)),0.45,1.25)[...,None]
        slot=(np.abs(fy-0.62)<0.02)&(np.abs(fx)<0.5); c=np.where(slot[...,None],np.array([20,10,10.]),c)
        plate=(fy>0.36)&(fy<0.52)&(np.abs(fx)<0.42); c=np.where(plate[...,None],np.array([250,248,240.]),c)
        band=(np.abs(fy-0.12)<0.03); c=np.where(band[...,None],c*0.6,c)
        return c
    shade(m,(212,26,36),soft=W*0.06,edge=(70,8,10),ow=5,tex=cyl,spec=0.7)
def bus(xf,yb,Lb,Hb):
    # side view, front facing left, emerging from behind the bottom-right corner
    m=Image.new('L',canvas.size,0); d=ImageDraw.Draw(m)
    d.rounded_rectangle((xf,yb-Hb,xf+Lb,yb-Hb*0.12),radius=int(Hb*0.12),fill=255)
    def livery(c,Y0,X0):
        Yg,Xg=np.mgrid[Y0:Y0+c.shape[0],X0:X0+c.shape[1]].astype(float)
        fx=(Xg-xf)/Lb; fy=(yb-Yg)/Hb
        c=c*np.clip(1.05-0.35*fy*0+0.2*(fy>0.5),0.7,1.2)[...,None]
        for (y0w,y1w) in ((0.6,0.86),(0.24,0.48)):
            win=(fy>y0w)&(fy<y1w)&(fx>0.08)
            pane=((fx-0.08)*Lb/(Hb*0.42))%1>0.1
            glass=np.array([60,90,130.])*(0.8+0.45*(((fx*Lb+fy*Hb*0.5)/(Hb*0.6))%1<0.25))[...,None]
            c=np.where((win&pane)[...,None],glass,np.where(win[...,None],c*0.75,c))
        ws=(fx<0.07)&(fy>0.24)&(fy<0.86); c=np.where(ws[...,None],np.array([90,130,170.]),c)
        stripe=np.abs(fy-0.53)<0.025; c=np.where(stripe[...,None],np.array([240,210,120.]),c)
        dest=(fx>0.08)&(fx<0.34)&(fy>0.88)&(fy<0.97); c=np.where(dest[...,None],np.array([30,30,30.]),c)
        return c
    shade(m,(214,24,34),soft=Hb*0.04,edge=(70,8,10),ow=5,tex=livery,spec=0.5)
    d=ImageDraw.Draw(canvas)
    fnt=ImageFont.truetype('/tmp/lilita.ttf',max(8,int(Hb*0.075)))
    d.text((xf+Lb*0.21,yb-Hb*0.925),"22 PAVILION",font=fnt,fill=(255,200,60,255),anchor='mm')
    d.ellipse((xf+Lb*0.012,yb-Hb*0.24,xf+Lb*0.045,yb-Hb*0.17),fill=(255,250,210,255),outline=(90,90,90,255))
    for wx in (xf+Lb*0.2,xf+Lb*0.75):
        r=Hb*0.15
        d.ellipse((wx-r,yb-r*1.6,wx+r,yb+r*0.4),fill=(30,30,34,255))
        d.ellipse((wx-r*0.5,yb-r*1.1,wx+r*0.5,yb-r*0.1),fill=(170,170,180,255),outline=(90,90,100,255),width=SS*2)

# ---------- topper: gold lion crest with crossed bats and a crown ----------
def bat(x,y,ang,Lb):
    im=Image.new('RGBA',canvas.size,(0,0,0,0)); d=ImageDraw.Draw(im)
    dx,dy=math.cos(ang),math.sin(ang); nx,ny=-dy,dx
    hx,hy=x-dx*Lb*0.5,y-dy*Lb*0.5; bx_,by_=x+dx*Lb*0.5,y+dy*Lb*0.5; mid=(x-dx*Lb*0.1,y-dy*Lb*0.1)
    d.line((hx,hy,mid[0],mid[1]),fill=(20,20,24,255),width=int(b*0.26)); d.line((hx,hy,mid[0],mid[1]),fill=(55,55,66,255),width=int(b*0.16))
    w=b*0.36
    blade=[(mid[0]+nx*w*0.6,mid[1]+ny*w*0.6),(bx_+nx*w,by_+ny*w),(bx_-nx*w,by_-ny*w),(mid[0]-nx*w*0.6,mid[1]-ny*w*0.6)]
    d.polygon(blade,fill=(90,50,18,255)); d.polygon([(px_*0.985+x*0.015,py_*0.985+y*0.015) for px_,py_ in blade],fill=(236,204,140,255))
    d.line((mid[0]+nx*w*0.3,mid[1]+ny*w*0.3,bx_+nx*w*0.5-dx*b*0.1,by_+ny*w*0.5-dy*b*0.1),fill=(252,232,180,255),width=SS*3)
    canvas.alpha_composite(im); addshadow(im)
tcy_=y0-b*1.0
bat(cx,tcy_+b*0.15,math.radians(-148),b*5.0); bat(cx,tcy_+b*0.15,math.radians(-32),b*5.0)
m=Image.new('L',canvas.size,0); ImageDraw.Draw(m).ellipse((cx-b*1.6,tcy_-b*1.6,cx+b*1.6,tcy_+b*1.6),fill=255)
shade(m,(240,190,70),soft=b*0.15,edge=(100,50,10),ow=5,spec=0.9)
m=Image.new('L',canvas.size,0); ImageDraw.Draw(m).ellipse((cx-b*1.36,tcy_-b*1.36,cx+b*1.36,tcy_+b*1.36),fill=255)
shade(m,(22,52,140),soft=b*0.12,edge=(150,96,24),ow=3)
lion(cx,tcy_+b*0.05,b*1.22)
glow(cx,tcy_,b*2.6,0.4)
for s_ in (-1,1): sparkle(cx+s_*b*2.3,y0-b*2.1,b*0.3)

# ---------- corners: gold-centred ribbon rosettes (same at all four), then the street icons ----------
bus(cx-b*3.4,y1+b*1.95,b*6.8,b*3.4)
for sx,sy in ((1,1),(-1,1),(1,-1),(-1,-1)):
    px=(x0 if sx==1 else x1)-sx*b/2; py=(y0 if sy==1 else y1)-sy*b/2
    rosette(px,py,b*0.95)
phonebox(x0-b*0.15,y1+b*1.05,b*1.45,b*3.3)
pillarbox(x0+b*1.55,y1+b*1.0,b*0.85,b*1.95)

# ---------- glow + shadows + output ----------
sh=shadow.filter(ImageFilter.GaussianBlur(7*SS))
shl=Image.new('RGBA',canvas.size,(20,8,12,0)); shl.putalpha(Image.fromarray((np.array(sh)*0.55).astype(np.uint8)))
shl=Image.fromarray(np.roll(np.array(shl),(5*SS,3*SS),(0,1)))
final=Image.new('RGBA',canvas.size,(0,0,0,0)); final.alpha_composite(shl); final.alpha_composite(canvas); final.alpha_composite(gl); final.alpha_composite(fg)
final=final.resize((FW//SS,FH//SS),Image.LANCZOS)
X0,Y0,X1,Y1=x0//SS,y0//SS,x1//SS,y1//SS
bb=final.getbbox(); final=final.crop(bb); X0-=bb[0];X1-=bb[0];Y0-=bb[1];Y1-=bb[1]
import slicer; slicer.save(final,X0,Y0,X1,Y1,b/SS,5,3.0,3.0,0.3)
