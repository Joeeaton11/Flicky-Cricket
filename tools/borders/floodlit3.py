import numpy as np, json, math, random
from PIL import Image, ImageDraw, ImageFilter
random.seed(3)
SS=2
CW,CH=861*SS,1452*SS
b=round(0.06*861)*SS
pad=b*4
FW,FH=CW+2*b+2*pad, CH+2*b+2*pad
x0,y0=pad+b,pad+b; x1,y1=x0+CW,y0+CH; cx=(x0+x1)/2
canvas=Image.new('RGBA',(FW,FH),(0,0,0,0)); gl=Image.new('RGBA',(FW,FH),(0,0,0,0)); fg=Image.new('RGBA',(FW,FH),(0,0,0,0)); shadow=Image.new('L',(FW,FH),0)
lx,ly=-0.55,-0.83
def addshadow(img,pos=(0,0)): shadow.paste(255,pos,img.split()[3])

def sphere(cx_,cy_,r,base,lite,dark):
    n=int(r*2)+4; Y,X=np.mgrid[0:n,0:n]-n/2
    dd=np.hypot(X,Y)/r; z=np.sqrt(np.clip(1-dd**2,0,1))
    li=np.clip(0.55+0.6*((X/r)*lx+(Y/r)*ly+z*0.5),0,1.25)
    c=np.array(base)*li[...,None]; c=np.where((dd>=0.9)[...,None],np.array(dark,float),c)
    s=np.clip(1-np.hypot(X+r*0.38,Y+r*0.42)/(r*0.3),0,1)**2; c=c+np.array(lite)*s[...,None]*0.8
    al=np.clip((1-dd)*r/1.2,0,1)
    im=Image.fromarray(np.dstack([np.clip(c,0,255),al*255]).astype(np.uint8),'RGBA')
    canvas.alpha_composite(im,(int(cx_-n/2),int(cy_-n/2))); addshadow(im,(int(cx_-n/2),int(cy_-n/2)))
def bolt(x,y,r): sphere(x,y,r,(170,180,200),(255,255,255),(50,56,72))

def tube(img,p0,p1,w,base,steps=9):
    d=ImageDraw.Draw(img); (ax,ay),(bx,by)=p0,p1; L=math.hypot(bx-ax,by-ay)+1e-6
    nx,ny=-(by-ay)/L,(bx-ax)/L
    for k in range(steps):
        f=k/(steps-1)-0.5; off=f*w
        shade=0.55+0.55*math.cos(f*math.pi)-0.25*f*(1 if (nx*lx+ny*ly)>0 else -1)
        if k==0 or k==steps-1: c=(18,20,30,255)
        else: c=tuple(int(min(255,v*shade)) for v in base)+(255,)
        d.line((ax+nx*off,ay+ny*off,bx+nx*off,by+ny*off),fill=c,width=max(2,int(w/steps)+2))
def glow(cx_,cy_,r,strength=1.0,col=(255,248,220)):
    n=int(r*2)+4; Y,X=np.mgrid[0:n,0:n]-n/2
    a_=np.clip(1-np.hypot(X,Y)/r,0,1)**1.8*strength
    im=Image.fromarray(np.dstack([np.full((n,n,3),col),a_*255]).astype(np.uint8),'RGBA')
    gl.alpha_composite(im,(int(cx_-n/2),int(cy_-n/2)))

# ---------- scaffold truss rail (6%) ----------
steel=(150,162,190); chord_w=b*0.26; brace_w=b*0.15
back=Image.new('RGBA',canvas.size,(0,0,0,0)); db=ImageDraw.Draw(back)
db.rectangle((x0-b,y0-b,x1+b,y1+b),fill=(20,26,46,238)); db.rectangle((x0,y0,x1,y1),fill=(0,0,0,0))
canvas.alpha_composite(back)
tr=Image.new('RGBA',canvas.size,(0,0,0,0))
co=chord_w/2
def side(p_out0,p_out1,p_in0,p_in1,n):
    # braces first, then chords on top
    for i in range(n):
        f0,f1=i/n,(i+1)/n
        A=(p_out0[0]+(p_out1[0]-p_out0[0])*f0, p_out0[1]+(p_out1[1]-p_out0[1])*f0)
        B=(p_out0[0]+(p_out1[0]-p_out0[0])*f1, p_out0[1]+(p_out1[1]-p_out0[1])*f1)
        C=(p_in0[0]+(p_in1[0]-p_in0[0])*f0, p_in0[1]+(p_in1[1]-p_in0[1])*f0)
        D=(p_in0[0]+(p_in1[0]-p_in0[0])*f1, p_in0[1]+(p_in1[1]-p_in0[1])*f1)
        tube(tr,C,B,brace_w,(132,144,172))
        tube(tr,A,C,brace_w*0.9,(110,120,148))
    tube(tr,p_out0,p_out1,chord_w,steel,11); tube(tr,p_in0,p_in1,chord_w,(226,184,84),11)
    joints.extend([(p_out0[0]+(p_out1[0]-p_out0[0])*k/n, p_out0[1]+(p_out1[1]-p_out0[1])*k/n) for k in range(1,n)])
o=b-co; i_=co
joints=[]
side((x0-b,y0-o),(x1+b,y0-o),(x0-b,y0-i_),(x1+b,y0-i_),int(CW/(b*1.25)))
side((x0-b,y1+o),(x1+b,y1+o),(x0-b,y1+i_),(x1+b,y1+i_),int(CW/(b*1.25)))
side((x0-o,y0-b),(x0-o,y1+b),(x0-i_,y0-b),(x0-i_,y1+b),int(CH/(b*1.25)))
side((x1+o,y0-b),(x1+o,y1+b),(x1+i_,y0-b),(x1+i_,y1+b),int(CH/(b*1.25)))
canvas.alpha_composite(tr); addshadow(tr)
for (jx,jy) in joints:
    if x0-b*1.1<jx<x1+b*1.1 and y0-b*1.1<jy<y1+b*1.1 and not (abs(jx-cx)<b*2.6 and (jy<y0 or jy>y1)):
        sphere(jx,jy,b*0.09,(232,190,90),(255,250,220),(120,84,26))
# corner gusset plates
for (px,py) in ((x0-b/2,y0-b/2),(x1+b/2,y0-b/2),(x0-b/2,y1+b/2),(x1+b/2,y1+b/2)):
    g=Image.new('RGBA',canvas.size,(0,0,0,0)); dg=ImageDraw.Draw(g)
    dg.rounded_rectangle((px-b*0.62,py-b*0.62,px+b*0.62,py+b*0.62),radius=int(b*0.14),fill=(78,88,116,255),outline=(16,18,28,255),width=SS*3)
    dg.line((px-b*0.5,py-b*0.52,px+b*0.5,py-b*0.52),fill=(190,200,225,255),width=SS*2)
    canvas.alpha_composite(g)
    for ox,oy in ((-0.38,-0.38),(0.38,-0.38),(-0.38,0.38),(0.38,0.38)): sphere(px+ox*b,py+oy*b,b*0.09,(232,190,90),(255,250,220),(120,84,26))


# ---------- power cables: coil round the rail, swag onto the card, plug into the lights ----------
def bez(p0,p1,p2,p3,n=60):
    return [((1-t)**3*p0[0]+3*(1-t)**2*t*p1[0]+3*(1-t)*t*t*p2[0]+t**3*p3[0],(1-t)**3*p0[1]+3*(1-t)**2*t*p1[1]+3*(1-t)*t*t*p2[1]+t**3*p3[1]) for t in np.linspace(0,1,n)]
def offs(pts,o):
    out=[]
    for k,(x,y) in enumerate(pts):
        a=pts[max(k-1,0)]; c=pts[min(k+1,len(pts)-1)]; dx,dy=c[0]-a[0],c[1]-a[1]; L=math.hypot(dx,dy)+1e-6
        nx,ny=-dy/L,dx/L
        if nx*lx+ny*ly<0: nx,ny=-nx,-ny
        out.append((x+nx*o,y+ny*o))
    return out
def cable(pts,w,base=(232,112,28)):
    L_=Image.new('RGBA',canvas.size,(0,0,0,0)); d=ImageDraw.Draw(L_)
    d.line(pts,fill=(8,8,12,255),width=int(w+SS*4),joint='curve')
    d.line(pts,fill=base+(255,),width=int(w),joint='curve')
    d.line(offs(pts,w*0.16),fill=tuple(min(255,int(v*1.18+30)) for v in base)+(255,),width=max(2,int(w*0.42)),joint='curve')
    d.line(offs(pts,w*0.24),fill=(255,236,200,255),width=max(2,int(w*0.13)),joint='curve')
    for q in (pts[0],pts[-1]): d.ellipse((q[0]-w/2,q[1]-w/2,q[0]+w/2,q[1]+w/2),fill=base+(255,))
    canvas.alpha_composite(L_); addshadow(L_)
def coupler(x,y,ang,w):
    S_=int(w*3); C=Image.new('RGBA',(S_,S_),(0,0,0,0)); d=ImageDraw.Draw(C); h=w*0.5; o=S_/2
    d.rounded_rectangle((o-w/2,o-h/2,o+w/2,o+h/2),radius=int(h*0.3),fill=(46,110,214,255),outline=(10,22,50,255),width=SS*3)
    d.line((o-w/2+h*0.2,o-h*0.22,o+w/2-h*0.2,o-h*0.22),fill=(150,200,255,255),width=SS*3)
    for k in (-0.18,0.0,0.18): d.line((o+k*w,o-h/2+SS*3,o+k*w,o+h/2-SS*3),fill=(22,60,130,255),width=SS*2)
    C=C.rotate(-math.degrees(ang),resample=Image.BICUBIC); canvas.alpha_composite(C,(int(x-o),int(y-o))); addshadow(C,(int(x-o),int(y-o)))
cw=b*0.42
for top in ():
    for sgn in (1,-1):
        X=lambda u: (x0+u) if sgn==1 else (x1-u)
        Y=lambda v: (y0+v) if top else (y1-v)
        P=lambda u,v:(X(u),Y(v))
        wraps1=[b*0.3+k*b*0.55 for k in range(3)]; wraps2=[b*4.6+k*b*0.55 for k in range(2)]
        # light -> first wrap (along the outer edge)
        cable(bez(P(-b*0.9,-b*1.3),P(-b*0.3,-b*1.25),P(wraps1[0]-b*0.4,-b*1.15),P(wraps1[0],-b*1.08),30),cw)
        for u in wraps1+wraps2:
            cable(bez(P(u,-b*1.08),P(u+b*0.05,-b*0.6),P(u+b*0.32,-b*0.4),P(u+b*0.38,b*0.08),24),cw)
        # swag onto the card
        sa=P(wraps1[-1]+b*0.38,b*0.08); sb=P(wraps2[0],-b*1.08)
        dp=b*1.45 if top else b*1.25
        sw=bez(sa,P(wraps1[-1]+b*1.0,dp),P(wraps2[0]-b*1.2,dp),P(wraps2[0]-b*0.2,b*0.06),70)
        cable(sw,cw)
        mid=sw[len(sw)//2]; coupler(mid[0],mid[1],0,b*1.0)
        # last wrap -> light / scoreboard
        if top: end=P(cx-x0-b*1.9,-b*1.5)
        else:   end=P(cx-x0-b*2.4,-b*1.05)
        lu=wraps2[-1]+b*0.38
        cable(bez(P(wraps2[-1],-b*1.08),P(wraps2[-1]+b*0.1,-b*1.6),P(lu+b*0.4,-b*1.6),end,40),cw)

# ---------- floodlight heads ----------
def floodlight(cxl,cyl,w,h,ang,cols=4,rows=3,beam=False):
    S=int(max(w,h)*2.6); L=Image.new('RGBA',(S,S),(0,0,0,0)); d=ImageDraw.Draw(L)
    ox,oy=S/2-w/2,S/2-h/2
    d.rounded_rectangle((ox,oy,ox+w,oy+h),radius=int(h*0.14),fill=(52,58,78,255),outline=(14,16,24,255),width=SS*3)
    d.rounded_rectangle((ox+w*0.05,oy+h*0.07,ox+w*0.95,oy+h*0.93),radius=int(h*0.1),fill=(26,28,40,255))
    pw=(w*0.86)/cols; ph=(h*0.82)/rows; rr=min(pw,ph)*0.4
    halo=Image.new('RGBA',(S,S),(0,0,0,0))
    for i in range(cols):
        for j in range(rows):
            bx=ox+w*0.07+pw*(i+0.5); byy=oy+h*0.09+ph*(j+0.5)
            n=int(rr*5); Y,X=np.mgrid[0:n,0:n]-n/2
            ha=np.clip(1-np.hypot(X,Y)/(rr*2.4),0,1)**1.5*0.75
            hi=Image.fromarray(np.dstack([np.full((n,n,3),(255,226,140)),ha*255]).astype(np.uint8),'RGBA')
            halo.alpha_composite(hi,(int(bx-n/2),int(byy-n/2)))
            d.ellipse((bx-rr,byy-rr,bx+rr,byy+rr),fill=(255,236,170,255),outline=(214,160,60,255),width=SS)
            d.ellipse((bx-rr*0.55,byy-rr*0.55,bx+rr*0.55,byy+rr*0.55),fill=(255,252,232,255))
    L.alpha_composite(halo)
    d.line((ox+w*0.08,oy+h*0.04,ox+w*0.92,oy+h*0.04),fill=(150,160,190,255),width=SS*2)
    L=L.rotate(ang,resample=Image.BICUBIC,expand=False)
    pos=(int(cxl-S/2),int(cyl-S/2))
    R_=max(w,h)*1.7; n=int(R_*2); Y,X=np.mgrid[0:n,0:n]-n/2
    th=np.arctan2(Y,X); rr_=np.hypot(X,Y)/R_
    rays=(0.5+0.5*np.cos(th*9+ang*0.05))**6
    a_=np.clip(1-rr_,0,1)**1.6*(0.35+0.5*rays)*0.75
    ri=Image.fromarray(np.dstack([np.full((n,n,3),(255,232,160)),a_*255]).astype(np.uint8),'RGBA')
    gl.alpha_composite(ri,(int(cxl-n/2),int(cyl-n/2)))
    glow(cxl,cyl,max(w,h)*0.95,0.85,(255,240,190))
    fg.alpha_composite(L,pos)
    m2=L.split()[3].point(lambda v:255 if v>150 else 0); shadow.paste(255,pos,m2)

# corners: stadium light panels on short poles from the corner plates, tilted slightly outward
for sx,sy,px,py in ((1,1,x0-b/2,y0-b/2),(-1,1,x1+b/2,y0-b/2),(1,-1,x0-b/2,y1+b/2),(-1,-1,x1+b/2,y1+b/2)):
    hx,hy=px-sx*b*0.85,py-sy*b*1.1
    p=Image.new('RGBA',canvas.size,(0,0,0,0)); tube(p,(px,py),(hx,hy),b*0.2,steel); canvas.alpha_composite(p)
    floodlight(hx,hy,b*2.3,b*1.75,18*sx*sy,4,3)

# ---------- topper: floodlight tower head on a short lattice mast ----------
mast=Image.new('RGBA',canvas.size,(0,0,0,0))
mt=y0-b*1.5
for xx in (cx-b*0.55,cx+b*0.55): tube(mast,(xx,y0-b*0.6),(xx,mt),b*0.18,steel)
tube(mast,(cx-b*0.55,y0-b*0.6),(cx+b*0.55,mt),b*0.1,(120,132,160)); tube(mast,(cx+b*0.55,y0-b*0.6),(cx-b*0.55,mt),b*0.1,(120,132,160))
canvas.alpha_composite(mast); addshadow(mast)
floodlight(cx,y0-b*2.25,b*4.6,b*2.1,0,6,3)

# ---------- plaque: LED scoreboard on two posts ----------
dl=ImageDraw.Draw(fg)
def scoreboard(cx_,cy_,wd,ht):
    for side_ in (-1,1):
        p=Image.new('RGBA',canvas.size,(0,0,0,0)); tube(p,(cx_+side_*wd*0.32,cy_),(cx_+side_*wd*0.32,cy_+ht*0.95),b*0.2,steel); canvas.alpha_composite(p)
    dl.rounded_rectangle((cx_-wd/2,cy_-ht/2,cx_+wd/2,cy_+ht/2),radius=int(ht*0.16),fill=(46,50,66,255),outline=(14,16,24,255),width=SS*3)
    dl.rounded_rectangle((cx_-wd/2+ht*0.12,cy_-ht/2+ht*0.12,cx_+wd/2-ht*0.12,cy_+ht/2-ht*0.12),radius=int(ht*0.1),fill=(14,14,18,255))
    gw,gh=12,7; six=["01110","10000","10000","11110","10001","10001","01110"]
    on={(r,c) for r in range(gh) for c in range(5) if six[r][c]=="1"}|{(r,c) for r in range(gh) for c in range(gw) if (r-3)**2+(c-9)**2<=7}
    cell=min((wd-ht*0.4)/gw,(ht*0.72)/gh); gx0=cx_-gw*cell/2; gy0=cy_-gh*cell/2
    for r in range(gh):
        for c in range(gw):
            x=gx0+cell*(c+0.5); y=gy0+cell*(r+0.5); rr=cell*0.4
            dl.ellipse((x-rr,y-rr,x+rr,y+rr),fill=(255,196,60,255) if (r,c) in on else (52,34,18,255))
    glow(cx_,cy_,wd*0.75,0.6,(255,186,70))
    m=Image.new('L',canvas.size,0); ImageDraw.Draw(m).rounded_rectangle((cx_-wd/2,cy_-ht/2,cx_+wd/2,cy_+ht/2),radius=int(ht*0.16),fill=255); shadow.paste(255,mask=m)
scoreboard(cx,y1+b*1.15,b*5.3,b*2.4)

# ---------- bespoke flair: night-sky sparkles round the light heads ----------
def sparkle(x,y,r):
    d=ImageDraw.Draw(fg)
    d.polygon([(x,y-r),(x+r*0.22,y-r*0.22),(x+r,y),(x+r*0.22,y+r*0.22),(x,y+r),(x-r*0.22,y+r*0.22),(x-r,y),(x-r*0.22,y-r*0.22)],fill=(255,252,230,255))
    glow(x,y,r*2.2,0.7)
for side_ in (-1,1):
    sparkle(cx+side_*b*3.2,y0-b*1.9,b*0.42); sparkle(cx+side_*b*5.3,y0-b*2.3,b*0.26)


# ---------- light spilling onto the card ----------
glow(cx,y0+b*0.2,b*7.5,0.5,(255,236,180))
for gx in (x0+b*0.6,x1-b*0.6): glow(gx,y0+b*0.6,b*5.0,0.4,(255,236,180)); glow(gx,y1-b*0.6,b*4.2,0.3,(255,236,180))
glow(cx,y1-b*0.1,b*6.0,0.38,(255,190,90))
# ---------- glow spills onto the card, fading out softly before the stretch slice ----------
yy_=np.arange(FH)[:,None].astype(float)
def sstep(a,b_,x): t=np.clip((x-a)/(b_-a),0,1); return t*t*(3-2*t)
fade=(1-sstep(y0+b*1.2,y0+b*4.6,yy_))+sstep(y1-b*4.6,y1-b*1.2,yy_)
fade=np.clip(fade,0,1)
_g=np.array(gl).astype(float); _g[...,3]*=fade; gl=Image.fromarray(_g.astype(np.uint8))
# ---------- shadows + output ----------
sh=shadow.filter(ImageFilter.GaussianBlur(7*SS))
shl=Image.new('RGBA',canvas.size,(10,8,20,0)); shl.putalpha(Image.fromarray((np.array(sh)*0.6).astype(np.uint8)))
shl=Image.fromarray(np.roll(np.array(shl),(5*SS,3*SS),(0,1)))
yy,xx=np.mgrid[0:FH,0:FW]
si=np.minimum(np.minimum(xx-x0,x1-xx),np.minimum(yy-y0,y1-yy)).astype(float)
inner=np.where((si>-1)&(si<9*SS),np.clip(1-si/(9*SS),0,1)*0.35,0)
innerimg=Image.fromarray(np.dstack([np.zeros((FH,FW,3)),inner*255]).astype(np.uint8),'RGBA')
final=Image.new('RGBA',canvas.size,(0,0,0,0)); final.alpha_composite(shl); final.alpha_composite(innerimg); final.alpha_composite(canvas); final.alpha_composite(gl); final.alpha_composite(fg)
final=final.resize((FW//SS,FH//SS),Image.LANCZOS)
X0,Y0,X1,Y1=x0//SS,y0//SS,x1//SS,y1//SS
bb=final.getbbox(); final=final.crop(bb); X0-=bb[0];X1-=bb[0];Y0-=bb[1];Y1-=bb[1]; W2,H2=final.size
import slicer; slicer.save(final,X0,Y0,X1,Y1,b/SS,2,5,5)
