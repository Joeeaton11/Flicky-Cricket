import numpy as np, json, math, random
from PIL import Image, ImageDraw, ImageFilter
random.seed(5); np.random.seed(5)
SS=2
CW,CH=861*SS,1452*SS
b=round(0.06*861)*SS
pad=b*4
FW,FH=CW+2*b+2*pad, CH+2*b+2*pad
x0,y0=pad+b,pad+b; x1,y1=x0+CW,y0+CH
cx,cy=(x0+x1)/2,(y0+y1)/2
canvas=Image.new('RGBA',(FW,FH),(0,0,0,0)); shadow=Image.new('L',(FW,FH),0)
lx,ly=-0.55,-0.83
def addshadow(im,pos=(0,0)): shadow.paste(255,pos,im.split()[3])
def put(arr_rgb,alpha,pos):
    im=Image.fromarray(np.dstack([np.clip(arr_rgb,0,255),np.clip(alpha,0,1)*255]).astype(np.uint8),'RGBA')
    canvas.alpha_composite(im,(int(pos[0]),int(pos[1]))); addshadow(im,(int(pos[0]),int(pos[1])))


def _offs(pts,o):
    out=[]
    for k,(x,y) in enumerate(pts):
        a=pts[max(k-1,0)]; c=pts[min(k+1,len(pts)-1)]; dx,dy=c[0]-a[0],c[1]-a[1]; L=math.hypot(dx,dy)+1e-6
        nx,ny=-dy/L,dx/L
        if nx*lx+ny*ly<0: nx,ny=-nx,-ny
        out.append((x+nx*o,y+ny*o))
    return out
def rope_curve(pts,w,img=None):
    L_=Image.new('RGBA',canvas.size,(0,0,0,0)); d=ImageDraw.Draw(L_)
    d.line(pts,fill=(60,38,16,255),width=int(w+SS*4),joint='curve')
    base=np.array([206,166,102.])
    for k in range(9):                                   # cylinder shading from parallel passes
        f=k/8-0.5; o_=f*w*0.86
        sh=0.45+0.7*math.cos(f*math.pi)*0.9-0.35*f
        c_=tuple(int(min(255,v*sh)) for v in base)+(255,)
        d.line(_offs(pts,-o_),fill=c_,width=max(2,int(w/7)+2),joint='curve')
    acc=0; step=w*0.62
    for k in range(1,len(pts)):
        (ax,ay),(bx,by_)=pts[k-1],pts[k]; seg=math.hypot(bx-ax,by_-ay); acc+=seg
        while acc>=step:
            acc-=step; f=1-acc/max(seg,1e-6); x_,y_=ax+(bx-ax)*f,ay+(by_-ay)*f
            tx,ty=(bx-ax)/max(seg,1e-6),(by_-ay)/max(seg,1e-6); nx,ny=-ty,tx
            p0=(x_-nx*w*0.46-tx*w*0.3,y_-ny*w*0.46-ty*w*0.3); p1=(x_+nx*w*0.46+tx*w*0.3,y_+ny*w*0.46+ty*w*0.3)
            d.line((p0,p1),fill=(78,50,22,255),width=max(2,int(SS*1.8)))
            d.line(((p0[0]+tx*SS*2.2,p0[1]+ty*SS*2.2),(p1[0]+tx*SS*2.2,p1[1]+ty*SS*2.2)),fill=(240,212,160,255),width=max(1,int(SS*1.1)))
    (img or canvas).alpha_composite(L_); addshadow(L_)

def sdf_box(px,py,cx_,cy_,hx,hy,r):
    qx=np.abs(px-cx_)-hx+r; qy=np.abs(py-cy_)-hy+r
    return np.hypot(np.maximum(qx,0),np.maximum(qy,0))+np.minimum(np.maximum(qx,qy),0)-r

# ---------- twisted hemp rope rail (exactly 6%) ----------
yy,xx=np.mgrid[0:FH,0:FW].astype(np.float32)
so=sdf_box(xx,yy,cx,cy,CW/2+b,CH/2+b,b*0.5)
si=sdf_box(xx,yy,cx,cy,CW/2,CH/2,2*SS)
horiz=np.abs(yy-cy)-CH/2 > np.abs(xx-cx)-CW/2
u=np.where(horiz,xx,yy)
# gentle weave: the rope's centre line drifts in and out, and the rope is a touch thicker than the band,
# so it always covers the full 6% (never a gap at the card edge or the outer edge)
amp=b*0.09; wl=b*3.4
cen=b*0.5+amp*np.sin(2*math.pi*u/wl); hw=b*0.5+amp
n=np.clip((si-cen)/hw,-1.2,1.2)
t=(n+1)/2
period=b*0.72; tw=b*0.8
key=u+n*tw
ph=(key/period)%1.0; kid=np.floor(key/period)
sx_=2*ph-1; hs=np.sqrt(np.clip(1-sx_**2,0,1))                 # across one strand
nb=np.abs(n)/(1+0.05*hs)                                         # strands bulge just past the edge (outwards only)
z=np.sqrt(np.clip(1-nb**2,0,1))
sgn_y=np.sign(yy-cy); sgn_x=np.sign(xx-cx)
Nu=sx_*0.72; Nn=np.sign(n)*nb*0.82
Nz=np.sqrt(np.clip(1-Nu**2-Nn**2,0.04,1))
Nx=np.where(horiz,Nu,sgn_x*Nn); Ny=np.where(horiz,sgn_y*Nn,Nu)
Lx,Ly,Lz=lx*0.8,ly*0.8,0.62; Ln=math.sqrt(Lx*Lx+Ly*Ly+Lz*Lz); Lx,Ly,Lz=Lx/Ln,Ly/Ln,Lz/Ln
Hx,Hy,Hz=Lx,Ly,Lz+1; Hn=math.sqrt(Hx*Hx+Hy*Hy+Hz*Hz); Hx,Hy,Hz=Hx/Hn,Hy/Hn,Hz/Hn
dif=np.clip(Nx*Lx+Ny*Ly+Nz*Lz,0,1)
spc=np.clip(Nx*Hx+Ny*Hy+Nz*Hz,0,1)**22
ao=(0.3+0.7*hs**0.55)*(0.55+0.45*z**0.35)
jit=(np.sin(kid*12.9898)*43758.5453)%1.0
fib=0.5+0.5*np.sin(ph*period/(1.15*SS)*2*math.pi+jit*40+np.random.rand(FH,FW)*1.4)
base=np.array([214,174,108.])
alb=base*(0.9+0.14*jit[...,None])*(0.84+0.16*fib[...,None])
col=alb*(0.32+0.85*dif)[...,None]*ao[...,None]+np.array([255,244,214.])*(spc*0.45*hs)[...,None]
rim=np.clip(1-(1-nb)*hw/(1.8*SS),0,1)
col=col*(1-rim[...,None]*0.7)+np.array([60,38,16.])*rim[...,None]*0.7
aa=np.clip((1-nb)*hw/1.4,0,1)
# ---------- breaking wave behind the sign, splashing up onto the card ----------
pw,ph_=b*6.6,b*2.7; pcy=y1+b*1.3
span=pw/2+b*2.4; xa,xb=int(cx-span),int(cx+span)
Xs=np.arange(xa,xb).astype(float); ax_=np.abs(Xs-cx)
H=np.where(ax_<pw/2,b*2.2,b*2.2*np.clip(1-(ax_-pw/2)/(span-pw/2),0,1)**1.3)
per=b*1.25
top=y1+b*0.95-H*(0.72+0.28*np.abs(np.cos(math.pi*(Xs-cx)/per)))
yb0=int(top.min())-int(b*0.6); yb1=int(y1+b*2.0)
Y,X=np.mgrid[yb0:yb1,xa:xb].astype(float)
tp=top[None,:]
inside=Y>tp
depth=np.clip((Y-tp)/(b*1.6),0,1)
c=np.array([60,200,214.])*(1-depth[...,None])+np.array([16,104,150.])*depth[...,None]
stripe=0.5+0.5*np.sin((X-cx)/(b*0.55)+Y/(b*0.4))
c=c*(0.92+0.08*stripe[...,None])
c=np.where(((Y-tp)<b*0.2)[...,None],np.array([150,236,240.]),c)
put(c,np.clip((Y-tp)/1.5,0,1)*inside*np.clip((y1+b*1.25-Y)/(b*0.5),0,1),(xa,yb0))

railimg=Image.fromarray(np.dstack([np.clip(col,0,255),aa*255]).astype(np.uint8),'RGBA')
canvas.alpha_composite(railimg); addshadow(railimg)
del yy,xx,so,si,t,n,u,ph,hs,z,dif,spc,ao,fib,col,alb,rim,aa,Nx,Ny,Nz,Nu,Nn,key,kid,jit,cen,nb,sx_

# rope whipping bands (navy twine) at regular points, away from topper/plaque
def whip(x,y,horizontal):
    # proper whipping: tight, round turns of tarred twine with collars and a small knot
    n_=6; gap=b*0.085; tw_=b*0.085; ln=b*1.14
    L=Image.new('RGBA',canvas.size,(0,0,0,0)); d=ImageDraw.Draw(L)
    def seg_(o_,w_,cols):
        for j,(oo,cc) in enumerate(cols):
            if horizontal: d.line(((x+o_+oo,y-ln/2),(x+o_+oo+b*0.04,y+ln/2)),fill=cc,width=max(2,int(w_)))
            else: d.line(((x-ln/2,y+o_+oo),(x+ln/2,y+o_+oo+b*0.04)),fill=cc,width=max(2,int(w_)))
    span=(n_-1)*gap
    seg_(0,span+tw_+SS*4,[(0,(40,26,14,255))])
    for k in range(n_):
        o_=k*gap-span/2
        seg_(o_,tw_,[(0,(120,78,40,255))]); seg_(o_,tw_*0.5,[(-tw_*0.12,(176,124,70,255))]); seg_(o_,max(2,tw_*0.18),[(-tw_*0.25,(230,190,130,255))])
    canvas.alpha_composite(L); addshadow(L)
    kx,ky=(x+span/2+b*0.1,y+ln*0.42) if horizontal else (x+ln*0.42,y+span/2+b*0.1)
    d2=ImageDraw.Draw(canvas); r=b*0.11
    d2.ellipse((kx-r,ky-r,kx+r,ky+r),fill=(120,78,40,255),outline=(40,26,14,255),width=SS*2); d2.ellipse((kx-r*0.5,ky-r*0.6,kx,ky-r*0.1),fill=(220,180,120,255))
for f in (0.25,0.5,0.75):
    for xv in (x0-b/2,x1+b/2): whip(xv,y0+CH*f,False)

# ---------- shapes ----------
def starfish(px,py,R,rot,col=(240,112,58)):
    nn=int(R*2.4); Y,X=np.mgrid[0:nn,0:nn]-nn/2
    th=np.arctan2(Y,X)-rot; rr=np.hypot(X,Y)
    prof=R*(0.46+0.54*((1+np.cos(5*th))/2)**1.25)
    d=rr/prof; m=d<1
    hgt=np.sqrt(np.clip(1-d,0,1))
    gy,gx=np.gradient(hgt); li=np.clip(0.72+(-gx*lx-gy*ly)*R*0.9+0.2*hgt,0.3,1.35)
    c=np.array(col,float)*li[...,None]
    # bumpy dots along the arms
    dots=(np.sin(rr/(R*0.075))*np.sin(th*5*3.0))>0.72
    c=np.where((dots&(d<0.8))[...,None],np.array([255,214,150.]),c)
    c=np.where((d>0.9)[...,None],np.array([150,52,24.]),c)
    put(c,np.clip((1-d)*R/2,0,1),(px-nn/2,py-nn/2))
def scallop(px,py,R,ang,col=(248,150,118)):
    nn=int(R*2.6); Y,X=np.mgrid[0:nn,0:nn]-nn/2
    c_,s_=math.cos(ang),math.sin(ang); Xr=X*c_+Y*s_; Yr=-X*s_+Y*c_   # shell opens toward -Yr
    Yh=Yr-R*0.55
    th=np.arctan2(Xr,-Yh); rr=np.hypot(Xr,Yh)
    ribs=np.cos(th*13)
    rad=R*(1.0+0.05*ribs)*(np.abs(th)<1.15)
    d=np.where(np.abs(th)<1.15,rr/np.maximum(rad,1e-3),9)
    ear=(np.abs(Xr)<R*0.42)&(Yh>-R*0.2)&(Yh<R*0.12)
    m=(d<1)|ear
    li=np.clip(0.7+0.35*ribs*0.6+0.25*(1-d),0.4,1.3)
    c=np.array(col,float)*li[...,None]
    band=0.5+0.5*np.sin(rr/(R*0.11))
    c=c*(0.9+0.1*band[...,None])
    c=np.where(((d>0.93)&(d<1))[...,None],np.array([170,110,96.]),c)
    c=np.where(ear[...,None]&(d>=1)[...,None],np.array([236,196,170.]),c)
    put(c,m.astype(float),(px-nn/2,py-nn/2))
def pearl(px,py,r):
    nn=int(r*2)+4; Y,X=np.mgrid[0:nn,0:nn]-nn/2; dd=np.hypot(X,Y)/r
    z=np.sqrt(np.clip(1-dd**2,0,1)); li=np.clip(0.6+0.5*((X/r)*lx+(Y/r)*ly+z*0.6),0,1.3)
    c=np.array([238,236,246.])*li[...,None]+np.array([255,255,255.])*(np.clip(1-np.hypot(X+r*0.35,Y+r*0.4)/(r*0.35),0,1)**2)[...,None]
    c=np.where((dd>0.9)[...,None],np.array([140,136,160.]),c)
    put(c,np.clip((1-dd)*r/1.2,0,1),(px-nn/2,py-nn/2))


# ---------- fishing nets draped over the two bottom corners, with cork floats ----------
NETSH=[]
def qbez(a,c,b_,n=40): return [((1-t)**2*a[0]+2*(1-t)*t*c[0]+t*t*b_[0],(1-t)**2*a[1]+2*(1-t)*t*c[1]+t*t*b_[1]) for t in np.linspace(0,1,n)]
for sx in (1,-1):
    ox=(x0-b) if sx==1 else (x1+b); oy=y1+b
    P=lambda u,v:(ox+sx*u,oy-v)
    A=(b*4.1,b*0.15); B=(b*0.15,b*4.1); C=(b*3.1,b*3.1)
    edge=qbez(A,C,B,50)
    poly=[P(0,0)]+[P(*q) for q in edge]
    m=Image.new('L',canvas.size,0); ImageDraw.Draw(m).polygon(poly,fill=255)
    bx0,by0=int(min(p_[0] for p_ in poly))-4,int(min(p_[1] for p_ in poly))-4; bx1,by1=int(max(p_[0] for p_ in poly))+4,int(oy)+4
    Y,X=np.mgrid[by0:by1,bx0:bx1].astype(float)
    u=(X-ox)*sx; v=oy-Y
    sag=b*0.25*np.sin(np.clip(u+v,0,None)/(b*4.3)*math.pi)
    uu=u+sag*0.5; vv=v+sag
    sp=b*0.5; cwid=SS*2.6
    g1=((uu+vv)/sp)%1; g2=((uu-vv)/sp)%1
    d1=np.minimum(g1,1-g1)*sp; d2=np.minimum(g2,1-g2)*sp
    line=np.clip(1-(np.minimum(d1,d2)-cwid/2)/1.2,0,1)
    knot=np.clip(1-(np.hypot(d1,d2)-cwid*1.1)/1.2,0,1)
    a_=np.maximum(line,knot)*(np.array(m)[by0:by1,bx0:bx1]/255.)
    shade=np.where(d1<d2,1.0,0.82)
    c=np.dstack([np.full_like(X,252),np.full_like(X,240),np.full_like(X,208)])*shade[...,None]
    c=np.where((knot>0.5)[...,None],np.array([206,170,110.]),c)
    put(np.full_like(c,40)*np.array([1,0.8,0.6]),np.array(Image.fromarray((a_*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)))/255.*0.55,(bx0,by0))
    put(c,a_,(bx0,by0))
    NETSH.append((P(b*2.3,b*1.1),P(b*1.1,b*2.4)))
    # head rope along the draped edge
    hr=Image.new('RGBA',canvas.size,(0,0,0,0)); dh=ImageDraw.Draw(hr); pts=[P(*q) for q in edge]
    dh.line(pts,fill=(90,60,28,255),width=int(b*0.24),joint='curve'); dh.line(pts,fill=(222,188,128,255),width=int(b*0.15),joint='curve')
    dh.line([(x_-SS*2,y_-SS*2) for x_,y_ in pts],fill=(250,230,184,255),width=SS*2,joint='curve')
    canvas.alpha_composite(hr); addshadow(hr)
    # cork floats on the edge
    for k in (15,35):
        fx,fy=pts[k]; nn=int(b*1.2); Yc,Xc=np.mgrid[0:nn,0:nn]-nn/2
        ang=math.atan2(pts[k+1][1]-pts[k-1][1],pts[k+1][0]-pts[k-1][0])
        Xr=Xc*math.cos(ang)+Yc*math.sin(ang); Yr=-Xc*math.sin(ang)+Yc*math.cos(ang)
        dd=np.hypot(Xr/(b*0.42),Yr/(b*0.27)); z=np.sqrt(np.clip(1-dd**2,0,1))
        li=np.clip(0.55+0.55*((Xc/(b*0.42))*lx+(Yc/(b*0.27))*ly)*0.5+0.4*z,0.3,1.3)
        cc=np.array([240,120,40.])*li[...,None]
        band=np.abs(Xr)<b*0.07; cc=np.where(band[...,None],np.array([250,240,220.])*li[...,None],cc)
        cc=cc+np.array([255,255,255.])*(np.clip(1-np.hypot(Xc+b*0.12,Yc+b*0.1)/(b*0.1),0,1)**2)[...,None]*0.8
        cc=np.where((dd>0.88)[...,None],np.array([110,40,12.]),cc)
        put(cc,np.clip((1-dd)*b*0.27/1.5,0,1),(fx-nn/2,fy-nn/2))

# ---------- kelp fronds tucked behind every corner ----------
def frond(px,py,ang,L,w):
    pts=[]; 
    for k in range(24):
        t_=k/23; a=ang+0.35*math.sin(t_*5)
        if k==0: x_,y_=px,py
        else: x_+=math.cos(a)*L/23; y_+=math.sin(a)*L/23
        pts.append((x_,y_,w*(1-t_)**0.6*(0.7+0.3*math.sin(t_*12)**2)))
    im=Image.new('RGBA',canvas.size,(0,0,0,0)); d=ImageDraw.Draw(im)
    for x_,y_,r in pts: d.ellipse((x_-r-SS*2,y_-r-SS*2,x_+r+SS*2,y_+r+SS*2),fill=(18,70,40,255))
    for x_,y_,r in pts: d.ellipse((x_-r,y_-r,x_+r,y_+r),fill=(52,150,80,255))
    for x_,y_,r in pts: d.ellipse((x_-r*0.55-r*0.3,y_-r*0.55-r*0.3,x_+r*0.55-r*0.3,y_+r*0.55-r*0.3),fill=(120,206,120,255))
    canvas.alpha_composite(im); addshadow(im)


def beachball(px,py,r):
    nn=int(r*2)+6; Y,X=np.mgrid[0:nn,0:nn]-nn/2; x_=X/r; y_=Y/r; dd=np.hypot(x_,y_)
    z_=np.sqrt(np.clip(1-dd**2,0,1)); tl=math.radians(30)
    yr=y_*math.cos(tl)-z_*math.sin(tl); zr=y_*math.sin(tl)+z_*math.cos(tl)
    lon=np.arctan2(x_,zr)-1.45; gi=np.floor((lon+math.pi)/(2*math.pi/6)).astype(int)%6
    pal=np.array([[40,110,220],[232,44,48],[250,200,40],[250,250,246],[40,170,90],[250,250,246]],float)
    c=pal[gi]
    c=np.where((yr<-0.86)[...,None],np.array([250,250,246.]),c)
    li=np.clip(0.5+0.6*(x_*lx+y_*ly)+0.35*z_,0.25,1.25); c=c*li[...,None]
    c=c+np.array([255,255,255.])*(np.clip(1-np.hypot(x_+0.38,y_+0.42)/0.3,0,1)**2)[...,None]*0.9
    c=np.where((dd>0.93)[...,None],np.array([60,40,40.]),c)
    put(c,np.clip((1-dd)*r/1.2,0,1),(px-nn/2,py-nn/2))
def bucket(px,py,s_):
    im=Image.new('RGBA',canvas.size,(0,0,0,0)); d=ImageDraw.Draw(im)
    tw_,bw_,h_=s_*1.35,s_*1.0,s_*1.15; top_=py-h_*0.5; bot=py+h_*0.5
    poly=[(px-tw_/2,top_),(px+tw_/2,top_),(px+bw_/2,bot),(px-bw_/2,bot)]
    d.polygon(poly,fill=(30,10,10,255))
    # shaded body
    nn_w=int(tw_)+4; nn_h=int(h_)+4
    Y,X=np.mgrid[0:nn_h,0:nn_w].astype(float); fy=Y/h_; half=(tw_/2)*(1-fy)+(bw_/2)*fy
    xr=(X-nn_w/2)/np.maximum(half,1); m=(np.abs(xr)<0.96)&(fy<=1)
    li=np.clip(0.55+0.5*np.sqrt(np.clip(1-xr**2,0,1))-0.3*xr*0.6,0.3,1.3)
    cc=np.array([226,46,40.])*li[...,None]+np.array([255,255,255.])*(np.clip(1-np.abs(xr+0.45)/0.1,0,1)*0.5)[...,None]
    band=(np.abs(fy-0.55)<0.07); cc=np.where(band[...,None],np.array([250,250,240.])*li[...,None],cc)
    body=Image.fromarray(np.dstack([np.clip(cc,0,255),m*255]).astype(np.uint8),'RGBA')
    im.alpha_composite(body,(int(px-nn_w/2),int(top_)))
    d=ImageDraw.Draw(im)
    d.ellipse((px-tw_/2,top_-s_*0.17,px+tw_/2,top_+s_*0.17),fill=(150,24,24,255),outline=(40,8,8,255),width=SS*3)
    d.ellipse((px-tw_/2+s_*0.1,top_-s_*0.1,px+tw_/2-s_*0.1,top_+s_*0.12),fill=(236,200,128,255))
    d.ellipse((px-s_*0.32,top_-s_*0.2,px+s_*0.38,top_+s_*0.06),fill=(246,214,146,255))   # sand mound
    # spade: shaft rising out of the sand at an angle, T-grip on top
    sx0,sy0=px+s_*0.05,top_-s_*0.05; sx1,sy1=px-s_*0.62,top_-s_*1.05
    L_=math.hypot(sx1-sx0,sy1-sy0); ux_,uy_=(sx1-sx0)/L_,(sy1-sy0)/L_; nx_,ny_=-uy_,ux_
    for k in range(7):
        f=k/6-0.5; sh=0.62+0.48*math.cos(f*math.pi)-0.3*f
        c_=(110,70,8,255) if k in (0,6) else (int(min(255,250*sh)),int(min(255,200*sh)),int(min(255,48*sh)),255)
        o_=f*s_*0.16; d.line((sx0+nx_*o_,sy0+ny_*o_,sx1+nx_*o_,sy1+ny_*o_),fill=c_,width=max(2,int(s_*0.16/6)+2))
    gx0,gy0=sx1-nx_*s_*0.26,sy1-ny_*s_*0.26; gx1,gy1=sx1+nx_*s_*0.26,sy1+ny_*s_*0.26
    d.line((gx0,gy0,gx1,gy1),fill=(110,70,8,255),width=int(s_*0.2)); d.line((gx0,gy0,gx1,gy1),fill=(250,206,50,255),width=int(s_*0.13))
    d.line((gx0-ux_*SS*2,gy0-uy_*SS*2,gx1-ux_*SS*2,gy1-uy_*SS*2),fill=(255,240,170,255),width=SS*2)
    d.ellipse((sx0-s_*0.16,sy0-s_*0.05,sx0+s_*0.16,sy0+s_*0.09),fill=(232,196,124,255))
    d.arc((px-tw_/2,top_-s_*0.17,px+tw_/2,top_+s_*0.17),5,175,fill=(150,24,24,255),width=int(s_*0.09))
    d.arc((px-tw_*0.55,top_-s_*0.85,px+tw_*0.55,top_+s_*0.5),195,345,fill=(40,8,8,255),width=int(s_*0.1))
    d.arc((px-tw_*0.55,top_-s_*0.85,px+tw_*0.55,top_+s_*0.5),195,345,fill=(250,206,50,255),width=int(s_*0.06))
    canvas.alpha_composite(im); addshadow(im)

for (p1_,p2_) in NETSH:
    scallop(p1_[0],p1_[1],b*0.5,math.radians(160)); pearl(p2_[0],p2_[1],b*0.2)

# ---------- corner flair: scallop shell + starfish + pearl, same at all four ----------
for sx,sy in ((1,1),(-1,1),(1,-1),(-1,-1)):
    px=(x0 if sx==1 else x1)-sx*b/2; py=(y0 if sy==1 else y1)-sy*b/2
    a=math.atan2(-sy,-sx)+math.pi/2   # shell fans outward from the corner
    # the rope finishes each corner with a loop and a frayed tail
    lcx,lcy=px-sx*b*0.75,py-sy*b*0.75; lr=b*0.62
    rope_curve([(lcx+math.cos(t_)*lr,lcy+math.sin(t_)*lr) for t_ in np.linspace(0,2*math.pi*1.02,60)],b*0.32)
    ta=math.atan2(0.9,-sx*0.45); t0=(lcx+math.cos(ta)*lr,lcy+math.sin(ta)*lr); t1=(t0[0]+math.cos(ta)*b*1.0,t0[1]+math.sin(ta)*b*1.0)
    rope_curve([(t0[0]+(t1[0]-t0[0])*f,t0[1]+(t1[1]-t0[1])*f+math.sin(f*3)*b*0.08) for f in np.linspace(0,1,14)],b*0.28)
    dF=ImageDraw.Draw(canvas)
    for k in range(7):
        aa=ta+(k-3)*0.16; ln=b*(0.28+0.1*(k%3))
        dF.line((t1[0],t1[1],t1[0]+math.cos(aa)*ln,t1[1]+math.sin(aa)*ln),fill=(226,192,132,255) if k%2 else (176,134,80,255),width=SS*2)
    frond(px,py,math.atan2(0,sx)-sx*sy*0.0+(-0.25*sy if sx==1 else 0.25*sy),b*2.6,b*0.26)
    frond(px,py,math.atan2(sy,0)+(0.25*sx if sy==1 else -0.25*sx),b*2.4,b*0.24)
    scallop(px-sx*b*0.35,py-sy*b*0.35,b*1.6,a)
    if sy==1 and sx==1: beachball(px+sx*b*0.4,py+sy*b*0.4,b*1.15)
    elif sy==1: bucket(px+sx*b*0.4,py+sy*b*0.55,b*1.3)
    else: starfish(px+sx*b*0.4,py+sy*b*0.4,b*1.3,(0.25 if sx*sy>0 else -0.25))
    pearl(px+sx*b*1.55,py-sy*b*0.1,b*0.24); pearl(px-sx*b*0.1,py+sy*b*1.55,b*0.2)

# ---------- topper: lifebuoy with crossed oars ----------
def tube(img,p0,p1,w,base_,steps=9):
    d=ImageDraw.Draw(img); (ax,ay),(bx,by)=p0,p1; L=math.hypot(bx-ax,by-ay)+1e-6; nx,ny=-(by-ay)/L,(bx-ax)/L
    for k in range(steps):
        f=k/(steps-1)-0.5; off=f*w; shade=0.55+0.55*math.cos(f*math.pi)-0.25*f*(1 if (nx*lx+ny*ly)>0 else -1)
        c=(60,34,14,255) if k in (0,steps-1) else tuple(int(min(255,v*shade)) for v in base_)+(255,)
        d.line((ax+nx*off,ay+ny*off,bx+nx*off,by+ny*off),fill=c,width=max(2,int(w/steps)+2))
def oar(cx_,cy_,ang,L,hf=0.45):
    # oar along local +x: handle at 0, blade at L. crossing point at hf*L
    S=int(L+b*2); H_=int(b*2); O=Image.new('RGBA',(S,H_),(0,0,0,0)); d=ImageDraw.Draw(O); my=H_/2; x_s=b*0.5
    shaft_end=x_s+L*0.62
    # blade outline
    bl=[]
    for k in range(41):
        t_=k/40; xx_=shaft_end+t_*(L*0.38); w_=b*0.12+(b*0.48)*min(1,(t_/0.55))**0.8
        if t_>0.8: w_*=math.sqrt(max(0,1-((t_-0.8)/0.2)**2))*0.6+0.4*w_/w_ if False else math.sqrt(max(0.02,1-((t_-0.8)/0.2)**2))
        bl.append((xx_,w_))
    up=[(x,my-w) for x,w in bl]; dn=[(x,my+w) for x,w in reversed(bl)]
    d.polygon(up+dn,fill=(20,24,40,255))
    up2=[(x,my-max(0,w-SS*3)) for x,w in bl[:-1]]; dn2=[(x,my+max(0,w-SS*3)) for x,w in reversed(bl[:-1])]
    d.polygon(up2+dn2,fill=(246,244,236,255))
    # red tip band
    tip=[p for p in bl if p[0]>shaft_end+L*0.38*0.72]
    d.polygon([(x,my-max(0,w-SS*3)) for x,w in tip]+[(x,my+max(0,w-SS*3)) for x,w in reversed(tip)],fill=(222,44,44,255))
    d.line((shaft_end+b*0.1,my,shaft_end+L*0.36,my),fill=(196,196,200,255),width=SS*3)
    d.line((shaft_end+b*0.2,my-b*0.22,shaft_end+L*0.3,my-b*0.3),fill=(255,255,255,255),width=SS*3)
    # shaft (wood), grip, leather collar
    for k in range(9):
        f=k/8-0.5; w_=b*0.24; sh=0.6+0.5*math.cos(f*math.pi)-0.3*f
        c=(70,40,14,255) if k in (0,8) else (int(min(255,214*sh)),int(min(255,156*sh)),int(min(255,90*sh)),255)
        d.line((x_s,my+f*w_,shaft_end+b*0.15,my+f*w_*(0.8)),fill=c,width=max(2,int(w_/8)+2))
    d.rounded_rectangle((x_s-b*0.05,my-b*0.17,x_s+b*0.9,my+b*0.17),radius=int(b*0.12),fill=(150,92,40,255),outline=(60,30,10,255),width=SS*2)
    d.line((x_s+b*0.1,my-b*0.08,x_s+b*0.8,my-b*0.08),fill=(210,150,90,255),width=SS*2)
    cl=x_s+L*0.33; d.rounded_rectangle((cl-b*0.35,my-b*0.17,cl+b*0.35,my+b*0.17),radius=int(b*0.06),fill=(58,72,120,255),outline=(16,20,40,255),width=SS*2)
    for k in (-0.2,0,0.2): d.line((cl+k*b,my-b*0.15,cl+k*b,my+b*0.15),fill=(30,40,80,255),width=SS)
    R=O.rotate(-math.degrees(ang),resample=Image.BICUBIC,expand=True)
    # place so the crossing point (x_s+hf*L, my) lands on (cx_,cy_)
    lx_=x_s+hf*L-S/2; ly_=0
    ca,sa=math.cos(ang),math.sin(ang); rx=lx_*ca-ly_*sa; ry=lx_*sa+ly_*ca
    pos=(int(cx_-R.size[0]/2-rx),int(cy_-R.size[1]/2-ry))
    canvas.alpha_composite(R,pos); addshadow(R,pos)
def lifebuoy(px,py,Ro,Ri):
    nn=int(Ro*2)+6; Y,X=np.mgrid[0:nn,0:nn]-nn/2
    rho=np.hypot(X,Y); Rc=(Ro+Ri)/2; r=(Ro-Ri)/2
    q=(rho-Rc)/r; m=np.abs(q)<1
    z=np.sqrt(np.clip(1-q**2,0,1)); ux,uy=X/np.maximum(rho,1),Y/np.maximum(rho,1)
    nx,ny=q*ux,q*uy
    li=np.clip(0.5+0.62*(nx*lx+ny*ly)+0.35*z,0.2,1.3)
    th=np.arctan2(Y,X)
    seg=(np.floor((th+math.pi/4)/(math.pi/2))%2)==0
    c=np.where(seg[...,None],np.array([226,40,44.]),np.array([246,244,238.]))*li[...,None]
    spec=np.clip(1-np.hypot(nx+0.5,ny+0.62)/0.32,0,1)**2*(z>0.3)
    c=c+np.array([255,255,255.])*spec[...,None]*0.8
    c=np.where((np.abs(q)>0.9)[...,None],np.array([60,20,22.]),c)
    put(c,np.clip((1-np.abs(q))*r/1.2,0,1),(px-nn/2,py-nn/2))
    # rope grab-line wraps at the four colour joins
    for k in range(4):
        a=math.pi/4+k*math.pi/2; wx,wy=px+math.cos(a)*Rc,py+math.sin(a)*Rc
        W=Image.new('RGBA',(int(r*3),int(r*3)),(0,0,0,0)); d=ImageDraw.Draw(W); o=r*1.5
        for j in (-1,0,1):
            d.rounded_rectangle((o-r*1.12,o+j*r*0.3-r*0.13,o+r*1.12,o+j*r*0.3+r*0.13),radius=int(r*0.12),fill=(220,186,124,255),outline=(96,64,30,255),width=SS*2)
        W=W.rotate(-math.degrees(a)+90,resample=Image.BICUBIC); canvas.alpha_composite(W,(int(wx-o),int(wy-o)))
    # outer rope loop between the wraps
    rl=Image.new('RGBA',canvas.size,(0,0,0,0)); d=ImageDraw.Draw(rl)
    for k in range(4):
        a0=45+k*90; d.arc((px-Ro*1.08,py-Ro*1.08,px+Ro*1.08,py+Ro*1.08),a0+8,a0+82,fill=(96,64,30,255),width=int(b*0.2))
        d.arc((px-Ro*1.08,py-Ro*1.08,px+Ro*1.08,py+Ro*1.08),a0+8,a0+82,fill=(222,190,130,255),width=int(b*0.12))
    canvas.alpha_composite(rl); addshadow(rl)
by=y0-b*1.35
oar(cx,by+b*0.15,math.radians(-148),b*6.4,0.42); oar(cx,by+b*0.15,math.radians(-32),b*6.4,0.42)
def cbez(p0,p1,p2,p3,n=40): return [((1-t)**3*p0[0]+3*(1-t)**2*t*p1[0]+3*(1-t)*t*t*p2[0]+t**3*p3[0],(1-t)**3*p0[1]+3*(1-t)**2*t*p1[1]+3*(1-t)*t*t*p2[1]+t**3*p3[1]) for t in np.linspace(0,1,n)]
for s_ in (-1,1):
    a0=(cx+s_*b*1.2,by+b*0.9); a3=(cx+s_*b*4.4,y0-b*0.55)
    rope_curve(cbez(a0,(cx+s_*b*1.9,y0+b*0.9),(cx+s_*b*3.6,y0+b*0.7),a3),b*0.2)
    whip(a3[0],a3[1],True)
lifebuoy(cx,by,b*1.75,b*0.9)


# foam crest: one rolling band of foam along the top, with curl swirls on the wave face
fm=Image.new('L',canvas.size,0); dfm=ImageDraw.Draw(fm)
for xi in range(0,len(Xs),int(b*0.16)):
    if H[xi]<b*0.12: continue
    r=b*(0.12+0.16*H[xi]/(b*2.2))*(0.85+0.3*random.random())
    xc_,yc_=Xs[xi],top[xi]+r*0.35
    dfm.ellipse((xc_-r,yc_-r,xc_+r,yc_+r),fill=255)
fa=np.array(fm).astype(float)/255.
ys_,xs_=np.nonzero(fa>0); fy0,fy1,fx0,fx1=ys_.min()-6,ys_.max()+6,xs_.min()-6,xs_.max()+6
fa=fa[fy0:fy1,fx0:fx1]
ol=np.array(Image.fromarray((fa*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)))/255.
er=np.array(Image.fromarray((fa*255).astype(np.uint8)).filter(ImageFilter.MinFilter(7)))/255.
Yl=np.arange(fy0,fy1)[:,None]
cc=np.zeros(fa.shape+(3,))+np.array([255,255,255.])
cc=np.where((er<0.5)[...,None]&(fa>0.5)[...,None],np.array([214,242,250.]),cc)   # soft blue rim
cc=np.where(((ol>0)&(fa<0.5))[...,None],np.array([36,120,150.]),cc)
put(cc,np.maximum(fa,ol),(fx0,fy0))
dsw=ImageDraw.Draw(canvas)
for k in (-3,-2,-1,1,2,3):
    xk=cx+k*b*1.55; i_=int(np.clip(xk-xa,0,len(Xs)-1))
    if H[i_]<b*0.9: continue
    ty=top[i_]+b*0.75; r=b*0.26; dr=1 if k>0 else -1
    box=(xk-r,ty-r,xk+r,ty+r)
    if dr>0: dsw.arc(box,150,420,fill=(240,252,255,255),width=SS*3); dsw.arc((xk-r*0.45,ty-r*0.6,xk+r*0.35,ty+r*0.2),180,400,fill=(240,252,255,255),width=SS*2)
    else: dsw.arc(box,120,390,fill=(240,252,255,255),width=SS*3); dsw.arc((xk-r*0.35,ty-r*0.6,xk+r*0.45,ty+r*0.2),140,360,fill=(240,252,255,255),width=SS*2)
# spray droplets
for k in range(14):
    side=random.choice((-1,1)); xx_=cx+side*(pw*0.35+random.random()*b*3.0)
    i_=int(np.clip(xx_-xa,0,len(Xs)-1)); yy_=top[i_]-b*(0.3+random.random()*0.8)
    r=b*(0.07+random.random()*0.09)
    ImageDraw.Draw(canvas).ellipse((xx_-r,yy_-r,xx_+r,yy_+r),fill=(226,250,255,255),outline=(90,170,200,255),width=SS)

# ---------- plaque: driftwood sign with brass anchor, hung on rope ----------
hang=Image.new('RGBA',canvas.size,(0,0,0,0))
for s_ in (-1,1):
    tube(hang,(cx+s_*pw*0.34,y1+b*0.5),(cx+s_*pw*0.3,pcy-ph_*0.3),b*0.22,(214,178,118))
canvas.alpha_composite(hang); addshadow(hang)
nn_w,nn_h=int(pw)+8,int(ph_)+8
Y,X=np.mgrid[0:nn_h,0:nn_w].astype(float)
sd=sdf_box(X,Y,nn_w/2,nn_h/2,pw/2,ph_/2,b*0.35)
tt=np.clip(-sd/(b*0.25),0,1)
gy_,gx_=np.gradient(tt); li=np.clip(0.8+(-gx_*lx-gy_*ly)*b*0.25+0.15*tt,0.4,1.3)
plank=(Y-4)//(ph_/3)
grain=0.5+0.5*np.sin(X/(b*0.18)+np.sin(Y/(b*0.3)+plank*2.1)*2.2+plank)
c=np.array([84,160,182.])*(0.84+0.14*grain[...,None])*li[...,None]
seam=np.abs(((Y-4)%(ph_/3)))<SS*1.5
c=np.where((seam&(sd<-SS*3))[...,None],np.array([70,96,104.]),c)
c=np.where((sd>-SS*3)[...,None],np.array([46,62,70.]),c)
put(c,np.clip(-sd/1.5,0,1),(cx-nn_w/2,pcy-nn_h/2))
# rope edge round the sign
rr_=b*0.35; per_pts=[]
for k in range(240):
    t_=k/240*2*math.pi; c_,s2=math.cos(t_),math.sin(t_)
    ex=math.copysign(abs(c_)**0.18,c_); ey=math.copysign(abs(s2)**0.18,s2)
    per_pts.append((cx+ex*(pw/2-b*0.02),pcy+ey*(ph_/2-b*0.02)))
per_pts.append(per_pts[0])
rope_curve(per_pts,b*0.26)
# nails
for nx_ in (-1,1):
    for ny_ in (-1,1):
        x_,y_=cx+nx_*pw*0.4,pcy+ny_*ph_*0.3
        ImageDraw.Draw(canvas).ellipse((x_-b*0.1,y_-b*0.1,x_+b*0.1,y_+b*0.1),fill=(200,160,80,255),outline=(90,60,20,255),width=SS)
# brass anchor emblem
A=Image.new('RGBA',(int(b*3),int(b*3)),(0,0,0,0)); d=ImageDraw.Draw(A); o=b*1.5; sc=b*1.05
gold=(242,192,72,255); gd=(110,70,20,255)
def anchor(dd,fill,grow):
    g=grow
    dd.ellipse((o-sc*0.32-g,o-sc*1.18-g,o+sc*0.32+g,o-sc*0.56+g),outline=fill,width=int(sc*0.17+2*g))
    dd.rounded_rectangle((o-sc*0.11-g,o-sc*0.62-g,o+sc*0.11+g,o+sc*0.98+g),radius=int(sc*0.08),fill=fill)
    dd.rounded_rectangle((o-sc*0.62-g,o-sc*0.44-g,o+sc*0.62+g,o-sc*0.28+g),radius=int(sc*0.07),fill=fill)
    dd.arc((o-sc*0.95-g,o-sc*0.05-g,o+sc*0.95+g,o+sc*1.05+g),20,160,fill=fill,width=int(sc*0.18+2*g))
    for s_ in (-1,1):
        bx_,by_=o+s_*sc*0.89,o+sc*0.68
        dd.polygon([(bx_-s_*g*0.5,by_-sc*0.42-g),(bx_+s_*sc*0.24+s_*g,by_+sc*0.02),(bx_-s_*sc*0.2,by_+sc*0.12+g)],fill=fill)
anchor(d,gd,SS*3); anchor(d,gold,0)
d.line((o-sc*0.05,o-sc*0.55,o-sc*0.05,o+sc*0.85),fill=(255,240,180,255),width=SS*2)
canvas.alpha_composite(A,(int(cx-o),int(pcy-o+b*0.05)))
# little starfish + shell on the sign corners
starfish(cx+pw*0.5-b*0.2,pcy-ph_*0.42,b*0.85,0.4)
scallop(cx-pw*0.5+b*0.25,pcy-ph_*0.4,b*1.0,math.radians(-30))

# ---------- shadows + output ----------
sh=shadow.filter(ImageFilter.GaussianBlur(7*SS))
shl=Image.new('RGBA',canvas.size,(10,20,30,0)); shl.putalpha(Image.fromarray((np.array(sh)*0.55).astype(np.uint8)))
shl=Image.fromarray(np.roll(np.array(shl),(5*SS,3*SS),(0,1)))
final=Image.new('RGBA',canvas.size,(0,0,0,0)); final.alpha_composite(shl); final.alpha_composite(canvas)
final=final.resize((FW//SS,FH//SS),Image.LANCZOS)
X0,Y0,X1,Y1=x0//SS,y0//SS,x1//SS,y1//SS
bb=final.getbbox(); final=final.crop(bb); X0-=bb[0];X1-=bb[0];Y0-=bb[1];Y1-=bb[1]; W2,H2=final.size
import slicer; slicer.save(final,X0,Y0,X1,Y1,b/SS,3,3.0,3.0,0.35)
