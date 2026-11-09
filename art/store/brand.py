import sys,math
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageChops
OUT,W,H=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]); K=W/1320
import os; os.makedirs(OUT,exist_ok=True)
F=lambda n:ImageFont.truetype('lilita.ttf',int(n))
def bg():
    im=Image.new('RGB',(W,H)); px=ImageDraw.Draw(im)
    cx,cy=W/2,H*0.58; R=math.hypot(W,H)
    g=Image.new('L',(W,H)); gd=ImageDraw.Draw(g)
    for r in range(int(R),0,-6): v=int(255*max(0,1-r/(R*0.75))**1.3); gd.ellipse((cx-r,cy-r*0.8,cx+r,cy+r*0.8),fill=v)
    base=Image.new('RGB',(W,H),(1,22,44)); mid=Image.new('RGB',(W,H),(36,80,138)); im=Image.composite(mid,base,g)
    rays=Image.new('L',(W,H)); rd=ImageDraw.Draw(rays)
    for i in range(18):
        a0=i*2*math.pi/18; a1=a0+math.radians(7)
        rd.polygon([(cx,cy),(cx+R*math.cos(a0),cy+R*math.sin(a0)),(cx+R*math.cos(a1),cy+R*math.sin(a1))],fill=60)
    mask=Image.new('L',(W,H)); md=ImageDraw.Draw(mask)
    for r in range(int(R*0.7),0,-8): md.ellipse((cx-r,cy-r,cx+r,cy+r),fill=int(255*(1-r/(R*0.7))))
    rays=ImageChops.multiply(rays,mask)
    im.paste((255,214,120),(0,0),rays)
    return im.convert('RGBA')
def drop(base,im,x,y,blur=18,off=(0,22),a=0.55):
    sh=Image.new('RGBA',im.size,(0,0,0,0)); sh.putalpha(im.getchannel('A').point(lambda v:int(v*a)))
    pad=Image.new('RGBA',(im.width+blur*4,im.height+blur*4),(0,0,0,0)); pad.paste(sh,(blur*2,blur*2)); pad=pad.filter(ImageFilter.GaussianBlur(blur))
    base.paste((0,0,0),(int(x+off[0]-blur*2),int(y+off[1]-blur*2)),pad); base.paste(im,(int(x),int(y)),im)
def word(txt,size,top,bot,maxw):
    f=F(size)
    while f.getlength(txt)>maxw: size-=4; f=F(size)
    st=int(size*0.09); w=int(f.getlength(txt))+st*4; h=int(size*1.35)+st*4
    m=Image.new('L',(w,h)); ImageDraw.Draw(m).text((st*2,st*2),txt,font=f,fill=255)
    o=Image.new('L',(w,h)); ImageDraw.Draw(o).text((st*2,st*2),txt,font=f,fill=255,stroke_width=st,stroke_fill=255)
    g=Image.new('RGBA',(w,h)); gd=ImageDraw.Draw(g); bb=m.getbbox()
    for y in range(h): t=min(1,max(0,(y-bb[1])/max(1,bb[3]-bb[1]))); gd.line([(0,y),(w,y)],fill=tuple(int(top[i]*(1-t)+bot[i]*t) for i in range(3))+(255,))
    L=Image.new('RGBA',(w,h),(0,0,0,0)); L.paste((5,10,20,255),(0,0),o); L.paste(g,(0,0),m); return L
def phone(src,crop,w,maxh):
    s=Image.open(src).convert('RGB'); x0,y0,x1,y1=crop; s=s.crop((int(x0*s.width),int(y0*s.height),int(x1*s.width),int(y1*s.height)))
    w=int(w); h=int(s.height*w/s.width)
    if h>maxh: h=int(maxh); w=int(s.width*h/s.height)
    s=s.resize((w,h),Image.LANCZOS).convert('RGBA'); r=int(54*K); b=int(16*K)
    C=Image.new('RGBA',(w+2*b,h+2*b),(0,0,0,0)); d=ImageDraw.Draw(C)
    d.rounded_rectangle((0,0,C.width-1,C.height-1),r+b,fill=(5,10,20,255))
    m=Image.new('L',(w,h)); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),r,fill=255); C.paste(s,(b,b),m)
    return C
def slide(n,l1,l2,shot,crop,mascot=None,mx=0.78,flip=False):
    im=bg()
    y=int(H*0.045)
    for txt,cols in [(l1,((255,255,255),(205,228,255))),(l2,((255,226,122),(244,163,10)))]:
        L=word(txt,W*0.13,*cols,W*0.9); drop(im,L,(W-L.width)//2,y,blur=int(8*K),off=(0,int(12*K)),a=0.7); y+=int(L.height*0.78)
    top=y+int(H*0.02)
    P=phone(shot,crop,W*0.74,H-top-int(H*0.05))
    drop(im,P,(W-P.width)//2,top,blur=int(30*K),off=(0,int(26*K)),a=0.6)
    if mascot:
        M=Image.open(mascot).convert('RGBA'); mw=int(W*0.36); M=M.resize((mw,int(M.height*mw/M.width)),Image.LANCZOS)
        if flip: M=M.transpose(Image.FLIP_LEFT_RIGHT)
        drop(im,M,int(W*mx-mw/2),H-M.height-int(H*0.03),blur=int(16*K),off=(0,int(14*K)),a=0.5)
    im.convert('RGB').save(f'{OUT}/{n}.png')
slide('01','ONE SWIPE.','HUGE SIXES!','r1.png',(0,0,1,1),'flicky-celebrate.png',0.80)
slide('07','27 LEAGUES','CLIMB THE ROAD','r9.png',(0,0,1,1),'flicky-wink.png',0.20,True)
print('ok')
