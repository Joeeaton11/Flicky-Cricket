import numpy as np, json, math, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont
random.seed(11); np.random.seed(11)
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
def addshadow(im,pos=(0,0)): shadow.paste(255,pos,im.split()[3])
def put(rgb,alpha,pos,dst=None):
    im=Image.fromarray(np.dstack([np.clip(rgb,0,255),np.clip(alpha,0,1)*255]).astype(np.uint8),'RGBA')
    (dst or canvas).alpha_composite(im,(int(pos[0]),int(pos[1]))); addshadow(im,(int(pos[0]),int(pos[1])))
def sdf_box(px,py,cx_,cy_,hx,hy,r):
    qx=np.abs(px-cx_)-hx+r; qy=np.abs(py-cy_)-hy+r
    return np.hypot(np.maximum(qx,0),np.maximum(qy,0))+np.minimum(np.maximum(qx,qy),0)-r
def glow(x,y,r,s=1.0,col=(255,214,120)):
    n=int(r*2)+4; Y,X=np.mgrid[0:n,0:n]-n/2
    a=np.clip(1-np.hypot(X,Y)/r,0,1)**1.8*s
    gl.alpha_composite(Image.fromarray(np.dstack([np.full((n,n,3),col),a*255]).astype(np.uint8),'RGBA'),(int(x-n/2),int(y-n/2)))
GOLD=np.array([240,190,70.]); GOLDD=np.array([150,96,24.]); RED=np.array([196,28,44.])

# ---------- marquee rail: gold beads framing a glossy red lacquer channel ----------
yy,xx=np.mgrid[0:FH,0:FW].astype(np.float32)
so=sdf_box(xx,yy,cx,cy,CW/2+b,CH/2+b,b*0.35)
si=sdf_box(xx,yy,cx,cy,CW/2,CH/2,2*SS)
t=np.clip(si/np.maximum(si-so,1e-3),0,1)
horiz=np.abs(yy-cy)-CH/2 > np.abs(xx-cx)-CW/2
sgn=np.where(horiz,np.sign(yy-cy),np.sign(xx-cx))
def bead(t0,t1):
    q=np.clip((t-t0)/(t1-t0),0,1); return q, np.sqrt(np.clip(1-(2*q-1)**2,0,1)), (2*q-1)
inner=(t<0.17); outer=(t>0.8)
qi,zi,ni=bead(0,0.17); qo,zo,no=bead(0.8,1.0); qm,zm,nm=bead(0.17,0.8)
def lit(n_,z_):
    nxl=np.where(horiz,0,1)*n_*sgn; nyl=np.where(horiz,1,0)*n_*sgn
    return np.clip(0.5+0.6*(nxl*lx+nyl*ly)+0.3*z_,0.15,1.35)
col=np.zeros(t.shape+(3,),np.float32)
li_i=lit(ni,zi); li_o=lit(no,zo)
g_i=GOLD*li_i[...,None]+np.array([255,250,220.])*(np.clip(1-np.abs(ni+0.3)/0.2,0,1)*0.6)[...,None]
g_o=GOLD*li_o[...,None]+np.array([255,250,220.])*(np.clip(1-np.abs(no+0.3)/0.2,0,1)*0.6)[...,None]
# red channel: concave (lit from the opposite side) with a glossy stripe
li_m=np.clip(0.75-0.35*lit(nm,zm)+0.35+0.15*zm,0.3,1.2)
uu_=np.where(horiz,xx,yy)
stp=(((uu_+nm*b*0.55)/(b*0.9))%1.0)
cream=np.array([252,240,220.]); edge_s=np.clip(np.minimum(np.abs(stp-0.5),np.minimum(stp,1-stp))*b*0.9/(1.2*SS),0,1)
basec=np.where((stp<0.5)[...,None],RED,cream)
r_m=RED*li_m[...,None]+np.array([255,230,230.])*(np.clip(1-np.abs(nm-0.45)/0.12,0,1)*0.5)[...,None]
del uu_,stp,edge_s,basec
col=np.where(inner[...,None],g_i,np.where(outer[...,None],g_o,r_m))
# thin dark grooves between parts
gr=(np.abs(t-0.17)<0.02)|(np.abs(t-0.8)<0.02)
col=np.where(gr[...,None],np.array([70,20,16.]),col)
edge=np.clip(1-np.minimum(np.abs(so),np.abs(si))/(2.0*SS),0,1)
col=col*(1-edge[...,None]*0.7)+np.array([70,30,10.])*edge[...,None]*0.7
aa=np.clip(-so/1.5,0,1)*np.clip(si/1.5,0,1)
railimg=Image.fromarray(np.dstack([np.clip(col,0,255),aa*255]).astype(np.uint8),'RGBA')
canvas.alpha_composite(railimg); addshadow(railimg)
del yy,xx,so,si,t,col,aa,g_i,g_o,r_m,li_m,qi,zi,ni,qo,zo,no,qm,zm,nm,horiz,sgn,li_i,li_o

# ---------- circus valance hanging under the top rail (red/cream scallops, gold trim) ----------
def valance(xa_,xb_):
    n_=max(2,round((xb_-xa_)/(b*0.95))); w_=(xb_-xa_)/n_
    L=Image.new('RGBA',canvas.size,(0,0,0,0)); d=ImageDraw.Draw(L)
    top_=y0-b*0.12; dep=b*0.62
    for k in range(n_):
        xa2=xa_+k*w_
        colr=(200,30,46,255) if k%2==0 else (250,238,212,255)
        d.rectangle((xa2,top_,xa2+w_,top_+dep*0.45),fill=colr)
        d.pieslice((xa2,top_+dep*0.45-w_*0.5*0.75,xa2+w_,top_+dep*0.45+w_*0.5*0.75),0,180,fill=colr)
    # outline pass
    a=np.array(L.split()[3]); ol=np.array(Image.fromarray(a).filter(ImageFilter.MaxFilter(5)))
    O=Image.new('RGBA',canvas.size,(80,14,14,0)); O.putalpha(Image.fromarray(ol))
    canvas.alpha_composite(O); canvas.alpha_composite(L); addshadow(O)
    d=ImageDraw.Draw(canvas)
    d.rectangle((xa_,top_,xb_,top_+b*0.14),fill=(240,190,70,255),outline=(120,70,16,255),width=SS)
    for k in range(n_):
        xm=xa_+(k+0.5)*w_; ym=top_+dep*0.45+w_*0.5*0.75
        d.ellipse((xm-b*0.1,ym-b*0.06,xm+b*0.1,ym+b*0.16),fill=(240,190,70,255),outline=(120,70,16,255),width=SS)
        # sheen
        d.line((xa_+k*w_+w_*0.25,top_+b*0.2,xa_+k*w_+w_*0.25,top_+dep*0.5),fill=(255,255,255,90) if k%2 else (255,140,150,140),width=SS*2)
valance(x0+b*1.8,cx-b*2.2); valance(cx+b*2.2,x1-b*1.8)

# ---------- marquee bulbs all round the rail ----------
def bulb(x,y,r,on=True):
    d=ImageDraw.Draw(fg)
    d.ellipse((x-r*1.35,y-r*1.35,x+r*1.35,y+r*1.35),fill=(150,96,24,255),outline=(70,40,10,255),width=SS*2)
    d.ellipse((x-r*1.12,y-r*1.12,x+r*1.12,y+r*1.12),fill=(250,210,100,255))
    n=int(r*2)+4; Y,X=np.mgrid[0:n,0:n]-n/2; dd=np.hypot(X,Y)/r
    c=np.array([255,250,215.])*(1-dd[...,None]*0.12)+np.array([255,255,255.])*(np.clip(1-np.hypot(X+r*0.3,Y+r*0.35)/(r*0.35),0,1)**2)[...,None]
    c=np.where((dd>0.88)[...,None],np.array([230,150,40.]),c)
    im=Image.fromarray(np.dstack([np.clip(c,0,255),np.clip((1-dd)*r/1.2,0,1)*255]).astype(np.uint8),'RGBA')
    fg.alpha_composite(im,(int(x-n/2),int(y-n/2)))
    glow(x,y,r*5.5,0.85)
step=b*1.2; br=b*0.2
def run(p0,p1,skip=lambda x,y:False):
    L_=math.hypot(p1[0]-p0[0],p1[1]-p0[1]); n_=int(L_/step)
    for k in range(n_+1):
        f=k/n_; x=p0[0]+(p1[0]-p0[0])*f; y=p0[1]+(p1[1]-p0[1])*f
        if not skip(x,y): bulb(x,y,br)
m_=b/2+b*0.02
run((x0+b*1.4,y0-b/2),(x1-b*1.4,y0-b/2),lambda x,y:abs(x-cx)<b*1.9)
run((x0+b*1.4,y1+b/2),(x1-b*1.4,y1+b/2),lambda x,y:abs(x-cx)<b*3.4)
run((x1+b/2,y0+b*1.4),(x1+b/2,y1-b*1.4))

# ---------- corner flair: gold scrollwork + jewelled star (same at all four) ----------
def scroll(d,x,y,R,ang,sx,sy,w,fill):
    pts=[]
    for k in range(60):
        tt=k/59; th=ang+tt*4.2; rr=R*(1-tt*0.78)
        pts.append((x+math.cos(th)*rr*sx,y+math.sin(th)*rr*sy))
    d.line(pts,fill=fill,width=int(w),joint='curve')
def star(x,y,R,col=(240,190,70),inner=0.45,rot=-math.pi/2,dst=None):
    n=int(R*2.4); Y,X=np.mgrid[0:n,0:n]-n/2; th=np.arctan2(Y,X)-rot; rr=np.hypot(X,Y)
    k=(th%(2*math.pi/5))/(2*math.pi/5); prof=R*(inner+(1-inner)*np.abs(1-2*k)**1.6)
    d_=rr/prof; hgt=np.clip(1-d_,0,1)
    face=np.where(np.cos((th%(2*math.pi/5))*5/2*2)>0,1.0,0.0)
    li=np.clip(0.7+0.4*np.sin(th*5+0.9)*np.clip(d_,0,1)+0.25*hgt,0.35,1.35)
    c=np.array(col,float)*li[...,None]
    c=np.where((d_>0.9)[...,None],np.array([110,60,14.]),c)
    put(c,np.clip((1-d_)*R/2,0,1),(x-n/2,y-n/2),dst)
def jewel(x,y,r,col=(220,30,60),dst=None):
    n=int(r*2)+4; Y,X=np.mgrid[0:n,0:n]-n/2; dd=np.hypot(X,Y)/r; z=np.sqrt(np.clip(1-dd**2,0,1))
    c=np.array(col,float)*np.clip(0.5+0.6*((X/r)*lx+(Y/r)*ly)+0.4*z,0.2,1.3)[...,None]
    c=c+np.array([255,255,255.])*(np.clip(1-np.hypot(X+r*0.35,Y+r*0.4)/(r*0.3),0,1)**2)[...,None]
    c=np.where((dd>0.86)[...,None],np.array([240,190,70.]),c); c=np.where((dd>0.96)[...,None],np.array([110,60,14.]),c)
    put(c,np.clip((1-dd)*r/1.2,0,1),(x-n/2,y-n/2),dst)
CORN=[]
for sx,sy in ((-1,1),(-1,-1)):
    px=(x0 if sx==1 else x1)-sx*b/2; py=(y0 if sy==1 else y1)-sy*b/2
    L=Image.new('RGBA',canvas.size,(0,0,0,0)); d=ImageDraw.Draw(L)
    for w_,f_ in ((b*0.38,(110,60,14,255)),(b*0.25,(240,190,70,255))):
        scroll(d,px+sx*b*1.55,py-sy*b*0.05,b*0.75,math.pi,sx,sy,w_,f_)       # along the top/bottom rail
        scroll(d,px-sx*b*0.05,py+sy*b*1.55,b*0.75,-math.pi/2,sx,sy,w_,f_)    # along the side rail
    canvas.alpha_composite(L); addshadow(L)
    CORN.append((sx,sy,px,py))
    star(px,py,b*1.25,rot=-math.pi/2)
    jewel(px,py,b*0.36)


# ---------- four different fairground prizes, one per corner ----------
def bow(x,y,s_,col=(220,30,50)):
    d=ImageDraw.Draw(canvas); dk=tuple(int(v*0.45) for v in col)
    for sgn_ in (-1,1):
        d.polygon([(x,y),(x+sgn_*s_*0.95,y-s_*0.55),(x+sgn_*s_*1.05,y+s_*0.45)],fill=dk+(255,))
        d.polygon([(x+sgn_*s_*0.08,y),(x+sgn_*s_*0.85,y-s_*0.42),(x+sgn_*s_*0.93,y+s_*0.33)],fill=col+(255,))
        d.line((x,y,x+sgn_*s_*0.5,y+s_*1.1),fill=dk+(255,),width=int(s_*0.36)); d.line((x,y,x+sgn_*s_*0.5,y+s_*1.1),fill=col+(255,),width=int(s_*0.24))
    d.ellipse((x-s_*0.28,y-s_*0.28,x+s_*0.28,y+s_*0.28),fill=col+(255,),outline=dk+(255,),width=SS*2)
    d.ellipse((x-s_*0.12,y-s_*0.18,x+s_*0.02,y-s_*0.05),fill=(255,200,200,255))
def fishbag(x,y,s_):
    # clear water bag with a goldfish, tied with red ribbon
    n=int(s_*3); Y,X=np.mgrid[0:n,0:n].astype(float)-n/2; Xn=X/s_; Yn=Y/s_
    w=np.where(Yn<-0.55,0.18+0.06*(Yn+1.2),0.18+0.82*np.sqrt(np.clip(1-((Yn-0.35)/0.95)**2,0,1)))
    inside=(np.abs(Xn)<w)&(Yn>-1.2)&(Yn<1.3)
    water=inside&(Yn>-0.35)
    c=np.zeros((n,n,3))+np.array([210,240,252.]); a=np.where(inside,0.45,0)
    c=np.where(water[...,None],np.array([70,176,232.])*np.clip(1.1-0.25*(Yn+0.35),0.7,1.1)[...,None],c); a=np.where(water,0.82,a)
    edge=inside&~(np.abs(Xn)<w-0.07)
    c=np.where(edge[...,None],np.array([235,250,255.]),c); a=np.where(edge,0.9,a)
    surf=inside&(np.abs(Yn+0.35)<0.04); c=np.where(surf[...,None],np.array([240,252,255.]),c); a=np.where(surf,0.95,a)
    hl=inside&(np.hypot((Xn+0.45)/0.12,(Yn-0.25)/0.45)<1); c=np.where(hl[...,None],np.array([255,255,255.]),c); a=np.where(hl,0.85,a)
    put(c,a,(x-n/2,y-n/2))
    # goldfish
    d=ImageDraw.Draw(canvas); fx,fy=x+s_*0.05,y+s_*0.4
    d.polygon([(fx+s_*0.28,fy),(fx+s_*0.62,fy-s_*0.25),(fx+s_*0.55,fy),(fx+s_*0.62,fy+s_*0.25)],fill=(240,110,20,255),outline=(120,40,0,255))
    d.ellipse((fx-s_*0.42,fy-s_*0.22,fx+s_*0.34,fy+s_*0.22),fill=(250,140,30,255),outline=(120,40,0,255),width=SS*2)
    d.polygon([(fx-s_*0.05,fy-s_*0.2),(fx+s_*0.15,fy-s_*0.36),(fx+s_*0.2,fy-s_*0.16)],fill=(240,110,20,255))
    d.ellipse((fx-s_*0.3,fy-s_*0.1,fx-s_*0.18,fy+s_*0.02),fill=(255,255,255,255)); d.ellipse((fx-s_*0.27,fy-s_*0.07,fx-s_*0.21,fy-s_*0.01),fill=(20,20,30,255))
    d.arc((fx-s_*0.2,fy-s_*0.18,fx+s_*0.1,fy+s_*0.18),280,80,fill=(255,200,120,255),width=SS*2)
    for (bx_,by_,r_) in ((fx-s_*0.55,fy-s_*0.3,0.07),(fx-s_*0.62,fy-s_*0.52,0.05)): d.ellipse((bx_-r_*s_,by_-r_*s_,bx_+r_*s_,by_+r_*s_),outline=(240,252,255,255),width=SS*2)
    bow(x,y-s_*0.7,s_*0.35)
def toffee_apple(x,y,s_,stick_ang):
    d=ImageDraw.Draw(canvas); ex,ey=x+math.cos(stick_ang)*s_*1.6,y+math.sin(stick_ang)*s_*1.6
    d.line((x,y,ex,ey),fill=(110,70,30,255),width=int(s_*0.22)); d.line((x,y,ex,ey),fill=(236,206,150,255),width=int(s_*0.14))
    n=int(s_*2.4); Y,X=np.mgrid[0:n,0:n]-n/2; r=s_*0.92; Xn=X/r; Yn=Y/(r*0.95); dd=np.hypot(Xn,Yn); z=np.sqrt(np.clip(1-dd**2,0,1))
    c=np.array([200,20,30.])*np.clip(0.45+0.6*(Xn*lx+Yn*ly)+0.4*z,0.2,1.3)[...,None]
    # toffee coat drips over the top half
    drip=Yn<(-0.1+0.18*np.sin(Xn*7))
    c=np.where(drip[...,None],np.array([190,96,24.])*np.clip(0.5+0.6*(Xn*lx+Yn*ly)+0.4*z,0.2,1.3)[...,None],c)
    c=c+np.array([255,255,255.])*(np.clip(1-np.hypot(Xn+0.38,Yn+0.45)/0.25,0,1)**2)[...,None]
    c=np.where((dd>0.93)[...,None],np.array([70,10,10.]),c)
    put(c,np.clip((1-dd)*r/1.2,0,1),(x-n/2,y-n/2))
    # leaf
    d.ellipse((x+s_*0.05,y-r-s_*0.25,x+s_*0.5,y-r+s_*0.02),fill=(70,170,70,255),outline=(20,70,20,255),width=SS*2)
def lollipop(x,y,s_,stick_ang):
    d=ImageDraw.Draw(canvas); ex,ey=x+math.cos(stick_ang)*s_*1.7,y+math.sin(stick_ang)*s_*1.7
    d.line((x,y,ex,ey),fill=(150,150,160,255),width=int(s_*0.2)); d.line((x,y,ex,ey),fill=(252,252,252,255),width=int(s_*0.13))
    n=int(s_*2.4); Y,X=np.mgrid[0:n,0:n]-n/2; r=s_*1.0; rr=np.hypot(X,Y)/r; th=np.arctan2(Y,X)
    sw=((th/(2*math.pi)+rr*2.2)%1.0)
    pal=np.array([[236,40,120],[255,250,250],[250,200,40],[255,250,250],[60,160,240],[255,250,250]],float)
    c=pal[(sw*6).astype(int)%6]
    z=np.sqrt(np.clip(1-rr**2,0,1)); c=c*np.clip(0.75+0.3*z+0.2*(-(X/r)*0.55-(Y/r)*0.83),0.6,1.25)[...,None]
    c=c+np.array([255,255,255.])*(np.clip(1-np.hypot(X/r+0.4,Y/r+0.4)/0.25,0,1)**2)[...,None]*0.9
    c=np.where((rr>0.93)[...,None],np.array([120,20,60.]),c)
    put(c,np.clip((1-rr)*r/1.2,0,1),(x-n/2,y-n/2))


# ---------- left side: strongman "test your strength" high striker ----------
tx1=x0; TW=b*1.45; tx0=tx1-TW; ty0,ty1=y0-b*1.0,y1+b*0.55
pky=y0+(y1-y0)*0.27                                  # where the puck has flown to
seg=b*0.95
Y,X=np.mgrid[int(ty0):int(ty1),int(tx0):int(tx1)].astype(float)
fx=(X-tx0)/TW
stops=[(0.0,(232,30,44)),(0.25,(250,110,30)),(0.5,(252,206,40)),(0.75,(120,200,60)),(1.0,(40,170,90))]
def scale_col(f):
    f=np.clip(f,0,1); c=np.zeros(np.shape(f)+(3,))
    for (a0,c0),(a1,c1) in zip(stops[:-1],stops[1:]):
        m=(f>=a0)&(f<=a1); w_=((f-a0)/(a1-a0))[...,None]; c=np.where(m[...,None],np.array(c0)*(1-w_)+np.array(c1)*w_,c)
    return c
kseg=np.floor((Y-y0)/seg); lyy=((Y-y0)/seg)-kseg; nseg=int((y1-y0)/seg)+1
segc=scale_col((kseg+0.5)/nseg)
inner=(fx>0.14)&(fx<0.86)
lx_=(fx-0.14)/0.72
c=segc.copy()
# bevelled panels: light top/left edge, dark bottom/right edge, gloss stripe
c=np.where(((lyy<0.1)|(lx_<0.08))[...,None],np.minimum(c*1.3+30,255),c)
c=np.where(((lyy>0.9)|(lx_>0.92))[...,None],c*0.62,c)
c=np.where(((lx_>0.14)&(lx_<0.24)&(lyy>0.12)&(lyy<0.88))[...,None],np.minimum(c*1.15+25,255),c)
dimmed=((Y-y0)<(pky-y0))[...,None]&inner[...,None]&(Y>=y0)[...,None]
c=np.where(dimmed,c*0.42+np.array([10,6,14.]),c)
# gold divider bars between panels
div=(lyy<0.07)|(lyy>0.97)
c=np.where(div[...,None],GOLD*np.where(lyy<0.035,1.2,0.8)[...,None],c)
# the centre track: dark recess with a chrome rod
rec=np.abs(fx-0.5)<0.08
c=np.where(rec[...,None],np.array([30,16,14.])*np.clip(1-np.abs(fx-0.5)/0.1,0.5,1)[...,None],c)
rod=np.abs(fx-0.5)<0.042; q=(fx-0.5)/0.042
chrome=np.array([200,206,220.])*np.clip(0.55+0.6*np.cos(np.clip(q+0.45,-1.5,1.5)*1.2),0.3,1.25)[...,None]
c=np.where(rod[...,None],chrome,c)
# the area below the card bottom is the plain foot of the tower
c=np.where((Y>y1)[...,None]&inner[...,None],np.array([120,60,30.])*np.clip(0.8+0.3*np.sin(np.pi*lx_),0.6,1.1)[...,None],c)
c=np.where((Y<y0)[...,None]&inner[...,None],np.array([150,20,34.]),c)
# gold side rails with rivets
side=~inner; qq=np.where(fx<=0.14,fx/0.14,(fx-0.86)/0.14); zz=np.sqrt(np.clip(1-(2*qq-1)**2,0,1))
gd=GOLD*np.clip(0.5+0.55*(-(2*qq-1))*0.55+0.4*zz,0.3,1.35)[...,None]
riv=(np.hypot((np.where(fx<0.5,fx-0.07,fx-0.93))*TW,((Y-ty0)%(b*0.6))-b*0.3)<b*0.045)
gd=np.where(riv[...,None],np.array([255,246,200.]),gd)
c=np.where(side[...,None],gd,c)
c=np.where(((fx<0.025)|(fx>0.975))[...,None],np.array([80,34,10.]),c)
put(c,np.ones(Y.shape),(int(tx0),int(ty0)))
# level meter: panels below the puck are lit, panels above are dark
for k in range(nseg):
    yc=y0+(k+0.5)*seg
    if yc>y1-b*0.3: break
    if yc>pky: glow(tx0+TW/2,yc,TW*0.7,0.38,(255,236,190))
# top "MAX" panel star
star(tx0+TW/2,y0+seg*0.5,TW*0.3,col=(255,226,110),dst=fg)
# the puck, with ghost trail and speed lines
pkx=tx0+TW/2
def puck(y,alpha):
    L=Image.new('RGBA',canvas.size,(0,0,0,0)); d=ImageDraw.Draw(L)
    d.rounded_rectangle((pkx-TW*0.42,y-b*0.24,pkx+TW*0.42,y+b*0.24),radius=int(b*0.16),fill=(70,10,10,255))
    d.rounded_rectangle((pkx-TW*0.37,y-b*0.19,pkx+TW*0.37,y+b*0.19),radius=int(b*0.13),fill=(224,32,44,255))
    d.rounded_rectangle((pkx-TW*0.37,y-b*0.19,pkx+TW*0.37,y-b*0.04),radius=int(b*0.08),fill=(255,110,110,255))
    d.rounded_rectangle((pkx-TW*0.42,y-b*0.05,pkx+TW*0.42,y+b*0.05),radius=int(b*0.04),fill=(230,232,240,255),outline=(90,90,110,255),width=SS)
    d.ellipse((pkx-TW*0.28,y-b*0.15,pkx-TW*0.16,y-b*0.08),fill=(255,230,230,255))
    if alpha<1:
        a=np.array(L); a[...,3]=(a[...,3]*alpha).astype(np.uint8); L=Image.fromarray(a)
    fg.alpha_composite(L)
for k,(off,al) in enumerate(((1.6,0.12),(1.05,0.22),(0.55,0.38))): puck(pky+b*off,al)
d=ImageDraw.Draw(fg)
for xo in (-0.62,0.62):
    d.line((pkx+xo*TW*0.72,pky+b*0.3,pkx+xo*TW*0.72,pky+b*1.9),fill=(255,255,235,170),width=int(b*0.06))
puck(pky,1.0)
glow(pkx,pky,b*1.8,0.65,(255,200,140))
for a_ in (-0.6,-0.3,0.3,0.6):
    d.line((pkx+math.sin(a_)*TW*0.45,pky-b*0.25-math.cos(a_)*b*0.1,pkx+math.sin(a_)*TW*0.7,pky-b*0.25-math.cos(a_)*b*0.45),fill=(255,236,120,255),width=int(b*0.07))

# ---------- crown: gold arch over the bell, with bulbs and a star ----------
bx_,by_=tx0+TW/2,y0-b*1.6; bs=b*1.6
arc=Image.new('RGBA',canvas.size,(0,0,0,0)); da=ImageDraw.Draw(arc); R=b*1.12
box=(bx_-R,by_-R*0.95,bx_+R,by_+R*1.15)
da.arc(box,180,360,fill=(90,40,10,255),width=int(b*0.3)); da.arc(box,180,360,fill=(240,190,70,255),width=int(b*0.2))
da.arc((box[0]+SS*2,box[1]+SS*2,box[2]-SS*2,box[3]),200,300,fill=(255,240,180,255),width=SS*2)
for s_ in (-1,1):
    da.line((bx_+s_*R,by_+R*0.1,bx_+s_*R*0.62,ty0+b*0.05),fill=(90,40,10,255),width=int(b*0.3))
    da.line((bx_+s_*R,by_+R*0.1,bx_+s_*R*0.62,ty0+b*0.05),fill=(240,190,70,255),width=int(b*0.2))
da.rectangle((bx_-b*0.06,box[1],bx_+b*0.06,by_-bs*0.4),fill=(120,70,16,255))
canvas.alpha_composite(arc); addshadow(arc)
for k in range(5):
    a=math.radians(200+k*35); bulb(bx_+math.cos(a)*R,by_+R*0.1+math.sin(a)*R*1.05,br*0.7)
star(bx_,box[1]-b*0.05,b*0.5,col=(250,206,80),dst=fg); jewel(bx_,box[1]-b*0.05,b*0.15,dst=fg)
# bell: polished brass with a strong highlight
m=Image.new('L',canvas.size,0); dm=ImageDraw.Draw(m); pts=[]
for k in range(31):
    t_=k/30; hwid=bs*(0.2+0.13*t_+0.27*t_**4); pts.append((bx_+hwid,by_-bs*0.42+t_*bs*0.82))
dm.polygon(pts+[(2*bx_-x_,y_) for x_,y_ in reversed(pts)],fill=255); dm.ellipse((bx_-bs*0.2,by_-bs*0.58,bx_+bs*0.2,by_-bs*0.28),fill=255)
a_=np.array(m).astype(float)/255.; ys_,xs_=np.nonzero(a_); Y0_,Y1_,X0_,X1_=ys_.min()-4,ys_.max()+4,xs_.min()-4,xs_.max()+4
a_=a_[Y0_:Y1_,X0_:X1_]
rowsw=np.maximum(a_.sum(axis=1,keepdims=True)/2,1)
Xl=(np.arange(X0_,X1_)[None,:]-bx_)/rowsw
sh=np.clip(0.62+0.5*np.cos(np.clip(Xl+0.25,-1.6,1.6)*1.1)-0.15,0.3,1.25)
cb=np.array([236,178,52.])*sh[...,None]
cb=cb+np.array([255,252,220.])*(np.clip(1-np.abs(Xl+0.48)/0.12,0,1)**1.5*0.9)[...,None]
cb=cb+np.array([255,230,150.])*(np.clip(1-np.abs(Xl-0.62)/0.1,0,1)*0.35)[...,None]
ol=np.array(Image.fromarray((a_*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)))/255.
cb=np.where(((ol>0)&(a_<0.5))[...,None],np.array([90,40,10.]),cb)
put(cb,np.maximum(a_,ol),(X0_,Y0_),fg)
d2=ImageDraw.Draw(fg)
d2.ellipse((bx_-bs*0.56,by_+bs*0.32,bx_+bs*0.56,by_+bs*0.48),fill=(176,116,30,255),outline=(90,40,10,255),width=SS*2)
d2.arc((bx_-bs*0.5,by_+bs*0.33,bx_+bs*0.5,by_+bs*0.45),190,340,fill=(255,236,170,255),width=SS*2)
d2.ellipse((bx_-bs*0.09,by_+bs*0.4,bx_+bs*0.09,by_+bs*0.56),fill=(110,60,16,255))
for k in range(9):
    a=math.radians(-200+k*27.5)
    if -95<math.degrees(a)<-85: continue
    r0,r1=bs*0.78,bs*0.98+(b*0.14 if k%2 else 0)
    d2.line((bx_+math.cos(a)*r0,by_+math.sin(a)*r0,bx_+math.cos(a)*r1,by_+math.sin(a)*r1),fill=(255,236,120,255),width=int(b*0.09))
glow(bx_,by_,bs*1.5,0.9,(255,226,140))

# ---------- base: wooden platform, bold striker pad, and the mallet landing with a POW ----------
tcx=tx0+TW/2
P=Image.new('RGBA',canvas.size,(0,0,0,0)); dp=ImageDraw.Draw(P)
px0,px1,py0,py1=tx0-b*0.3,tx1+b*0.3,y1+b*0.55,y1+b*1.35
dp.rounded_rectangle((px0,py0,px1,py1),radius=int(b*0.12),fill=(70,36,14,255))
for k in range(3):
    yk=py0+SS*2+k*(py1-py0-SS*4)/3
    dp.rectangle((px0+SS*2,yk,px1-SS*2,yk+(py1-py0-SS*4)/3-SS*2),fill=(176,112,58,255) if k%2==0 else (160,98,48,255))
    dp.line((px0+SS*4,yk+SS*3,px1-SS*4,yk+SS*3),fill=(214,150,90,255),width=SS*2)
for xx_ in (px0+b*0.18,px1-b*0.18):
    for yy_ in (py0+b*0.18,py1-b*0.18): dp.ellipse((xx_-b*0.06,yy_-b*0.06,xx_+b*0.06,yy_+b*0.06),fill=(220,200,170,255))
# striker pad
pdx0,pdx1,pdy0,pdy1=tcx-b*0.85,tcx+b*0.85,py0-b*0.5,py0+b*0.06
dp.rounded_rectangle((pdx0-SS*2,pdy0-SS*2,pdx1+SS*2,pdy1+SS*2),radius=int(b*0.14),fill=(70,14,14,255))
dp.rounded_rectangle((pdx0,pdy0,pdx1,pdy1),radius=int(b*0.12),fill=(226,36,48,255))
for k in range(4):
    xk=pdx0+b*0.22+k*b*0.4; dp.rectangle((xk,pdy0+b*0.16,xk+b*0.16,pdy1-SS*2),fill=(252,244,230,255))
dp.rounded_rectangle((pdx0,pdy0,pdx1,pdy0+b*0.16),radius=int(b*0.08),fill=(240,190,70,255),outline=(110,60,14,255),width=SS*2)
dp.line((pdx0+b*0.1,pdy0+SS*3,pdx1-b*0.1,pdy0+SS*3),fill=(255,244,200,255),width=SS*2)
canvas.alpha_composite(P); addshadow(P)
# POW burst behind the mallet head
pcx_,pcy_=tcx+b*1.75,pdy0-b*0.9; pr=b*1.3
bp=[]
for k in range(24):
    a=k/24*2*math.pi; r=pr*(1.0 if k%2==0 else 0.62)*(1+0.12*math.sin(k*2.3)); bp.append((pcx_+math.cos(a)*r,pcy_+math.sin(a)*r*0.85))
dP=ImageDraw.Draw(fg)
dP.polygon(bp,fill=(200,30,40,255)); dP.polygon([(pcx_+(x_-pcx_)*0.86,pcy_+(y_-pcy_)*0.86) for x_,y_ in bp],fill=(255,214,40,255))
fnt=ImageFont.truetype('/tmp/lilita.ttf',int(b*0.68))
for dx_,dy_,cc in ((SS*2,SS*3,(150,20,20,255)),(0,0,(255,255,255,255))):
    dP.text((pcx_+b*0.12+dx_,pcy_+dy_),"POW!",font=fnt,fill=cc,anchor='mm',stroke_width=SS*2 if cc[0]==255 else 0,stroke_fill=(170,20,30,255))
glow(pcx_,pcy_,b*1.4,0.5,(255,220,120))
# mallet: handle rising up and to the left, head landing on the pad
hd=(tcx-b*0.1,pdy0-b*0.62); h1=(tx0-b*0.75,y1-b*3.4)
L_=math.hypot(h1[0]-hd[0],h1[1]-hd[1]); ux_,uy_=(h1[0]-hd[0])/L_,(h1[1]-hd[1])/L_; nx_,ny_=-uy_,ux_
ml=Image.new('RGBA',canvas.size,(0,0,0,0)); dmm=ImageDraw.Draw(ml)
hs_=(hd[0]+ux_*b*0.45,hd[1]+uy_*b*0.45)
for k in range(9):
    f=k/8-0.5; shd=0.6+0.5*math.cos(f*math.pi)-0.3*f; o_=f*b*0.38
    cc=(70,36,14,255) if k in (0,8) else (int(min(255,222*shd)),int(min(255,164*shd)),int(min(255,100*shd)),255)
    dmm.line((hs_[0]+nx_*o_,hs_[1]+ny_*o_,h1[0]+nx_*o_,h1[1]+ny_*o_),fill=cc,width=max(2,int(b*0.3/8)+2))
for k in range(5):
    f=0.98-k*0.05; xk=hd[0]+ux_*L_*f; yk=hd[1]+uy_*L_*f
    dmm.line((xk-nx_*b*0.17,yk-ny_*b*0.17,xk+nx_*b*0.17,yk+ny_*b*0.17),fill=(30,30,36,255),width=int(b*0.12))
canvas.alpha_composite(ml); addshadow(ml)
# swing arcs
dS=ImageDraw.Draw(fg)
for k,rr in enumerate((L_*0.75,L_*0.95)):
    a0=math.degrees(math.atan2(uy_,ux_))
    dS.arc((hd[0]-rr,hd[1]-rr,hd[0]+rr,hd[1]+rr),a0+12+k*4,a0+34+k*4,fill=(255,255,240,220-k*50),width=int(b*0.09))
hw_,hh_=b*2.5,b*1.2; HS=int(b*4.2); Hn=np.zeros((HS,HS,4))
Yh,Xh=np.mgrid[0:HS,0:HS].astype(float)-HS/2
inside=(np.abs(Xh)<hw_/2)&(np.abs(Yh)<hh_/2)
qy=Yh/(hh_/2); qx=Xh/(hw_/2); zc=np.sqrt(np.clip(1-qy**2,0,1))
cH=np.array([214,34,44.])*np.clip(0.45+0.55*zc-0.35*qy,0.25,1.25)[...,None]
cH=cH+np.array([255,220,220.])*(np.clip(1-np.abs(qy+0.45)/0.12,0,1)*0.55)[...,None]
bandm=(np.abs(np.abs(qx)-0.78)<0.1)
cH=np.where(bandm[...,None],GOLD*np.clip(0.45+0.6*zc-0.3*qy,0.3,1.3)[...,None],cH)
cap=np.abs(qx)>0.95; cH=np.where(cap[...,None],np.array([150,24,30.])*np.clip(0.5+0.5*zc,0.3,1)[...,None],cH)
cH=np.where(((np.abs(qy)>0.93)|(np.abs(qx)>0.985))[...,None]&inside[...,None],np.array([70,12,12.]),cH)
Hn[...,:3]=cH; Hn[...,3]=inside*255
H_=Image.fromarray(np.clip(Hn,0,255).astype(np.uint8),'RGBA')
H_=H_.rotate(-math.degrees(math.atan2(uy_,ux_))-90,resample=Image.BICUBIC)
ml2=Image.new('RGBA',canvas.size,(0,0,0,0)); ml2.alpha_composite(H_,(int(hd[0]-HS/2),int(hd[1]-HS/2)))
fg.alpha_composite(ml2); addshadow(ml2)

# ---------- balloons tied to the top-left corner ----------
def balloon(x,y,r,col):
    n=int(r*3); Y,X=np.mgrid[0:n,0:n]-n/2
    Xn=X/r; Yn=Y/(r*1.18); Yn=np.where(Yn>0,Yn*(1+0.25*Yn),Yn); dd=np.hypot(Xn,Yn); z=np.sqrt(np.clip(1-dd**2,0,1))
    c=np.array(col,float)*np.clip(0.5+0.55*(Xn*lx+Yn*ly)+0.4*z,0.25,1.3)[...,None]
    c=c+np.array([255,255,255.])*(np.clip(1-np.hypot(Xn+0.38,Yn+0.45)/0.28,0,1)**2)[...,None]*0.9
    c=np.where((dd>0.93)[...,None],np.array(col,float)*0.35,c)
    put(c,np.clip((1-dd)*r/1.5,0,1),(x-n/2,y-n/2))
    d=ImageDraw.Draw(canvas); ky=y+r*1.18*0.92
    d.polygon([(x,ky-r*0.05),(x-r*0.16,ky+r*0.2),(x+r*0.16,ky+r*0.2)],fill=tuple(int(v*0.7) for v in col)+(255,))
    return (x,ky+r*0.2)
for sx in (-1,):
    px=(x0 if sx==1 else x1)-sx*b/2; py=y0-b/2
    S=Image.new('RGBA',canvas.size,(0,0,0,0)); ds=ImageDraw.Draw(S)
    spec=[(1.0,-1.75,0.62,(230,40,50)),(2.2,-1.35,0.55,(250,196,40)),(-0.25,-1.3,0.54,(50,120,230))]
    knots=[]
    for (u,v,rr,c) in spec:
        knots.append(((px+sx*u*b,py+v*b+rr*b*1.25),rr,c))
    for (kx,ky),rr,c in knots:
        ds.line([(kx,ky),(kx+(px-kx)*0.5+sx*b*0.15,ky+(py-ky)*0.5),(px,py)],fill=(250,250,250,255),width=SS*2,joint='curve')
    canvas.alpha_composite(S)
    for (kx,ky),rr,c in knots: balloon(kx,ky-rr*b*1.25,rr*b,c)

# ---------- topper: spinning prize wheel on a gold stand ----------
wR=b*1.75; wcx,wcy=cx,y0-b*1.2
st=Image.new('RGBA',canvas.size,(0,0,0,0)); dst_=ImageDraw.Draw(st)
for s_ in (-1,1):
    dst_.line((wcx+s_*b*1.4,y0-b*0.2,wcx,wcy),fill=(110,60,14,255),width=int(b*0.34))
    dst_.line((wcx+s_*b*1.4,y0-b*0.2,wcx,wcy),fill=(240,190,70,255),width=int(b*0.22))
    dst_.ellipse((wcx+s_*b*1.4-b*0.22,y0-b*0.42,wcx+s_*b*1.4+b*0.22,y0+b*0.02),fill=(240,190,70,255),outline=(110,60,14,255),width=SS*2)
canvas.alpha_composite(st); addshadow(st)
n_=int(wR*2)+10; Y,X=np.mgrid[0:n_,0:n_]-n_/2; rr=np.hypot(X,Y); th=np.arctan2(Y,X)+math.pi/12
segc=np.array([[226,36,54],[250,206,50],[40,120,226],[250,250,240],[150,60,200],[40,180,110]],float)
si_=(np.floor(th/(2*math.pi/12))%6).astype(int); c=segc[si_]
rim0=wR*0.8
z=np.sqrt(np.clip(1-(rr/wR)**2,0,1))
c=c*np.clip(0.85+0.25*(-(X/wR)*0.55-(Y/wR)*0.83)+0.1,0.6,1.2)[...,None]
spoke=np.abs(((th/(2*math.pi/12))%1)-0)<0.03
c=np.where(((rr<rim0)&(np.minimum((th/(2*math.pi/12))%1,1-(th/(2*math.pi/12))%1)*rr*2*math.pi/12<SS*1.5))[...,None],np.array([120,70,16.]),c)
rimz=np.clip((rr-rim0)/(wR-rim0),0,1); rimsh=np.sqrt(np.clip(1-(2*rimz-1)**2,0,1))
gold=GOLD*np.clip(0.55+0.6*(-(X/rr.clip(1))*0.55-(Y/rr.clip(1))*0.83)*(2*rimz-1)+0.35*rimsh,0.3,1.35)[...,None]
c=np.where((rr>=rim0)[...,None],gold,c)
c=np.where((rr>wR*0.96)[...,None],np.array([90,40,10.]),c)
c=np.where((np.abs(rr-rim0)<SS*1.2)[...,None],np.array([90,40,10.]),c)
c=c+np.array([255,255,255.])*(np.clip(1-np.hypot(X+wR*0.35,Y+wR*0.45)/(wR*0.35),0,1)**2*0.35)[...,None]
put(c,np.clip((wR-rr)/1.5,0,1),(wcx-n_/2,wcy-n_/2))
for k in range(12):
    a=k*2*math.pi/12; bulb(wcx+math.cos(a)*(rim0+wR)/2,wcy+math.sin(a)*(rim0+wR)/2,br*0.72)
star(wcx,wcy,b*0.55,col=(250,206,80),dst=fg); jewel(wcx,wcy,b*0.18,dst=fg)
# pointer clicker at the top
d=ImageDraw.Draw(fg); py_=wcy-wR
d.polygon([(wcx-b*0.32,py_-b*0.32),(wcx+b*0.32,py_-b*0.32),(wcx,py_+b*0.42)],fill=(110,30,14,255))
d.polygon([(wcx-b*0.22,py_-b*0.25),(wcx+b*0.22,py_-b*0.25),(wcx,py_+b*0.28)],fill=(226,36,54,255))
d.ellipse((wcx-b*0.14,py_-b*0.42,wcx+b*0.14,py_-b*0.14),fill=(240,190,70,255),outline=(110,60,14,255),width=SS)
# motion swooshes either side of the wheel
for s_ in (-1,1):
    for k,r_ in enumerate((wR*1.18,wR*1.36)):
        d.arc((wcx-r_,wcy-r_,wcx+r_,wcy+r_),(200 if s_<0 else 300)+k*6,(235 if s_<0 else 335)+k*6,fill=(255,250,220,200-k*60),width=SS*3)
# sparkles
def sparkle(x,y,r,col=(255,250,220)):
    dd_=ImageDraw.Draw(fg)
    dd_.polygon([(x,y-r),(x+r*0.22,y-r*0.22),(x+r,y),(x+r*0.22,y+r*0.22),(x,y+r),(x-r*0.22,y+r*0.22),(x-r,y),(x-r*0.22,y-r*0.22)],fill=col+(255,))
    glow(x,y,r*2,0.6)
for s_ in (-1,1):
    sparkle(wcx+s_*b*2.6,wcy-b*1.0,b*0.36); sparkle(wcx+s_*b*3.4,wcy-b*0.1,b*0.22)

# ---------- streamers curling down from the top corners onto the card ----------
def streamer(x,y,dx,dy,L,col,ph):
    n=60; pts=[]
    for k in range(n):
        t_=k/(n-1); w_=math.sin(t_*math.pi*5+ph)
        pts.append((x+dx*t_*L+(-dy)*w_*b*0.35,y+dy*t_*L+(dx)*w_*b*0.35,abs(math.cos(t_*math.pi*5+ph))))
    im=Image.new('RGBA',canvas.size,(0,0,0,0)); d_=ImageDraw.Draw(im)
    for k in range(n-1):
        x_,y_,wf=pts[k]; x2,y2,_=pts[k+1]; w_=b*0.08+b*0.2*wf
        d_.line((x_,y_,x2,y2),fill=tuple(int(v*0.45) for v in col)+(255,),width=int(w_+SS*3))
    for k in range(n-1):
        x_,y_,wf=pts[k]; x2,y2,_=pts[k+1]; w_=b*0.08+b*0.2*wf
        sh=0.75+0.35*wf; d_.line((x_,y_,x2,y2),fill=tuple(min(255,int(v*sh)) for v in col)+(255,),width=int(w_))
    canvas.alpha_composite(im); addshadow(im)
for sx in (1,-1):
    px=(x0 if sx==1 else x1)-sx*b/2; py=y0-b/2
    if sx==1: continue
    streamer(px+sx*b*0.2,py+b*0.4,sx*0.32,0.95,b*3.0,(240,80,170),0.0)
    streamer(px+sx*b*0.5,py+b*0.2,sx*0.85,0.5,b*3.0,(40,200,210),1.3)

# ---------- confetti around the top ----------
cf=ImageDraw.Draw(fg); cols=[(240,60,80),(250,206,50),(40,140,240),(60,200,120),(240,120,220),(255,255,255)]
for k in range(46):
    x=random.uniform(x0-b*0.8,x1+b*0.8); y=random.uniform(y0-b*2.8,y0+b*1.4)
    if abs(x-cx)<wR*1.25 and y<y0: continue
    if x<x0+b*0.8 and y<y0+b*0.6: continue
    if y>y0+b*0.3 and x0+b*1.5<x<x1-b*1.5: continue
    c_=random.choice(cols); a=random.uniform(0,math.pi); w_=b*random.uniform(0.12,0.2); h_=b*random.uniform(0.06,0.1)
    pts=[(x+math.cos(a)*w_-math.sin(a)*h_,y+math.sin(a)*w_+math.cos(a)*h_),(x-math.cos(a)*w_-math.sin(a)*h_,y-math.sin(a)*w_+math.cos(a)*h_),
         (x-math.cos(a)*w_+math.sin(a)*h_,y-math.sin(a)*w_-math.cos(a)*h_),(x+math.cos(a)*w_+math.sin(a)*h_,y+math.sin(a)*w_-math.cos(a)*h_)]
    cf.polygon(pts,fill=c_+(255,),outline=tuple(int(v*0.5) for v in c_)+(255,))

# ---------- plaque: golden admission ticket ----------
tw,th_=b*6.0,b*2.4; tcy=y1+b*1.2
T=Image.new('RGBA',(int(tw+b),int(th_+b)),(0,0,0,0)); dT=ImageDraw.Draw(T); o=(b/2,b/2)
def ticket_shape(dd,grow,fill):
    g=grow; dd.rounded_rectangle((o[0]-g,o[1]-g,o[0]+tw+g,o[1]+th_+g),radius=int(b*0.18),fill=fill)
ticket_shape(dT,SS*3,(90,30,14,255)); ticket_shape(dT,0,(246,200,80,255))
# notches
ta=np.array(T.split()[3]).copy()
ring=Image.new('L',T.size,0); dr_=ImageDraw.Draw(ring)
for xx_ in (o[0],o[0]+tw): dr_.ellipse((xx_-b*0.44,o[1]+th_/2-b*0.44,xx_+b*0.44,o[1]+th_/2+b*0.44),fill=255)
ra=(np.array(ring)>0)&(ta>0)
tarr=np.array(T); tarr[ra,0:3]=(90,30,14); T=Image.fromarray(tarr); dT=ImageDraw.Draw(T)
for xx_ in (o[0],o[0]+tw): dT.ellipse((xx_-b*0.38,o[1]+th_/2-b*0.38,xx_+b*0.38,o[1]+th_/2+b*0.38),fill=(0,0,0,0))
# inner red panel + perforation
dT.rounded_rectangle((o[0]+b*0.55,o[1]+b*0.25,o[0]+tw-b*0.55,o[1]+th_-b*0.25),radius=int(b*0.12),fill=(196,28,44,255),outline=(120,14,20,255),width=SS*2)
px_=o[0]+tw*0.27
for k in range(9): yk=o[1]+b*0.3+k*(th_-b*0.6)/8; dT.ellipse((px_-SS*3,yk-SS*3,px_+SS*3,yk+SS*3),fill=(246,200,80,255))
font=ImageFont.truetype('/tmp/lilita.ttf',int(b*0.78)); font2=ImageFont.truetype('/tmp/lilita.ttf',int(b*0.5))
tx=o[0]+tw*0.63; ty=o[1]+th_*0.5
for dx_,dy_,cc in ((SS*2,SS*3,(90,14,14,255)),(0,0,(255,236,170,255))):
    dT.text((tx+dx_,ty-b*0.25+dy_),"ADMIT",font=font,fill=cc,anchor='mm')
    dT.text((tx+dx_,ty+b*0.48+dy_),"ONE",font=font2,fill=cc,anchor='mm')
# small star on the stub
TS=T.rotate(0)
canvas_t=Image.new('RGBA',T.size,(0,0,0,0)); canvas_t.alpha_composite(T)
R=canvas_t.rotate(-3,resample=Image.BICUBIC,expand=True)
pos=(int(cx-R.size[0]/2),int(tcy-R.size[1]/2)); canvas.alpha_composite(R,pos); addshadow(R,pos)
star(cx-tw*0.5+tw*0.135+b*0.1,tcy+b*0.08,b*0.5,col=(255,236,170))
# gloss stripe
gs=Image.new('RGBA',canvas.size,(0,0,0,0)); dg=ImageDraw.Draw(gs)
dg.line((cx-tw*0.42,tcy-th_*0.38,cx+tw*0.42,tcy-th_*0.43),fill=(255,250,220,120),width=SS*3)
canvas.alpha_composite(gs)


# ---------- fairground treats either side of the ticket ----------
def popcorn(x,y,s_):
    im=Image.new('RGBA',canvas.size,(0,0,0,0)); d_=ImageDraw.Draw(im)
    tw_,bw_,h_=s_*1.1,s_*0.8,s_*1.25; top_=y-h_
    for k in range(9):
        xc_=x+random.uniform(-tw_*0.5,tw_*0.5); yc_=top_-random.uniform(-s_*0.05,s_*0.4); r=s_*random.uniform(0.15,0.22)
        d_.ellipse((xc_-r-SS*2,yc_-r-SS*2,xc_+r+SS*2,yc_+r+SS*2),fill=(120,80,20,255))
    for k in range(14):
        xc_=x+random.uniform(-tw_*0.48,tw_*0.48); yc_=top_-random.uniform(-s_*0.02,s_*0.38); r=s_*random.uniform(0.14,0.21)
        d_.ellipse((xc_-r,yc_-r,xc_+r,yc_+r),fill=(255,244,200,255)); d_.ellipse((xc_-r*0.5,yc_-r*0.7,xc_+r*0.1,yc_-r*0.1),fill=(255,255,240,255))
        d_.arc((xc_-r,yc_-r,xc_+r,yc_+r),20,120,fill=(236,190,90,255),width=SS*2)
    poly=[(x-tw_/2,top_),(x+tw_/2,top_),(x+bw_/2,y),(x-bw_/2,y)]
    d_.polygon(poly,fill=(90,14,14,255))
    n=5
    for k in range(n):
        f0,f1=k/n,(k+1)/n
        q=[(x-tw_/2+tw_*f0+SS*2,top_+SS*2),(x-tw_/2+tw_*f1-SS*2*0,top_+SS*2),(x-bw_/2+bw_*f1,y-SS*2),(x-bw_/2+bw_*f0+SS*2,y-SS*2)]
        d_.polygon(q,fill=(220,30,46,255) if k%2==0 else (252,244,230,255))
    d_.rectangle((x-tw_*0.3,top_+h_*0.35,x+tw_*0.3,top_+h_*0.62),fill=(250,206,50,255),outline=(110,60,14,255),width=SS*2)
    d_.line((x-tw_*0.42,top_+SS*4,x-bw_*0.32,y-SS*4),fill=(255,255,255,140),width=SS*3)
    canvas.alpha_composite(im); addshadow(im)
def candyfloss(x,y,s_):
    im=Image.new('RGBA',canvas.size,(0,0,0,0)); d_=ImageDraw.Draw(im)
    d_.line((x,y,x+s_*0.08,y-s_*1.0),fill=(110,70,30,255),width=int(s_*0.2)); d_.line((x,y,x+s_*0.08,y-s_*1.0),fill=(252,246,236,255),width=int(s_*0.12))
    canvas.alpha_composite(im)
    blobs=[(0,-1.45,0.46),(-0.4,-1.3,0.34),(0.42,-1.32,0.34),(-0.22,-1.78,0.32),(0.26,-1.76,0.32),(0,-1.08,0.28),(-0.5,-1.6,0.24),(0.52,-1.62,0.24),(0.02,-1.98,0.24),(-0.3,-1.05,0.2),(0.32,-1.06,0.2)]
    m=Image.new('L',canvas.size,0); dm=ImageDraw.Draw(m)
    for u,v,r in blobs: dm.ellipse((x+u*s_-r*s_,y+v*s_-r*s_,x+u*s_+r*s_,y+v*s_+r*s_),fill=255)
    a=np.array(m).astype(float)/255.; ys_,xs_=np.nonzero(a); Y0_,Y1_,X0_,X1_=ys_.min()-6,ys_.max()+6,xs_.min()-6,xs_.max()+6
    a=a[Y0_:Y1_,X0_:X1_]; Yl=np.arange(Y0_,Y1_)[:,None]-(y-s_*1.4); Xl=np.arange(X0_,X1_)[None,:]-x
    li=np.clip(0.95-0.35*(Xl*0.55+Yl*0.83)/(s_*0.9),0.6,1.25)
    tex=0.9+0.1*np.random.rand(*a.shape)
    tex=np.array(Image.fromarray((tex*200).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)))/200.
    c=np.array([250,150,200.])*(li*tex)[...,None]
    ol=np.array(Image.fromarray((a*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)))/255.
    c=np.where(((ol>0)&(a<0.5))[...,None],np.array([150,50,100.]),c)
    put(c,np.maximum(a,ol),(X0_,Y0_))

# ---------- glow: spills softly onto the card ----------
_g=np.array(gl).astype(float); _g[...,3]*=1.0; gl=Image.fromarray(_g.astype(np.uint8))
# ---------- shadows + output ----------
sh=shadow.filter(ImageFilter.GaussianBlur(7*SS))
shl=Image.new('RGBA',canvas.size,(20,8,20,0)); shl.putalpha(Image.fromarray((np.array(sh)*0.55).astype(np.uint8)))
shl=Image.fromarray(np.roll(np.array(shl),(5*SS,3*SS),(0,1)))
final=Image.new('RGBA',canvas.size,(0,0,0,0)); final.alpha_composite(shl); final.alpha_composite(canvas); final.alpha_composite(gl); final.alpha_composite(fg)
final=final.resize((FW//SS,FH//SS),Image.LANCZOS)
X0,Y0,X1,Y1=x0//SS,y0//SS,x1//SS,y1//SS
bb=final.getbbox(); final=final.crop(bb); X0-=bb[0];X1-=bb[0];Y0-=bb[1];Y1-=bb[1]; W2,H2=final.size
import slicer; slicer.save(final,X0,Y0,X1,Y1,b/SS,4,3.0,3.0)
