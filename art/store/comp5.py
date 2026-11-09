from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageChops
import os,sys
OUT=sys.argv[1]; W,H=int(sys.argv[2]),int(sys.argv[3]); os.makedirs(OUT,exist_ok=True)
K=W/1320
def F(n): return ImageFont.truetype('lilita.ttf',int(n))
def drop(base,im,x,y,blur=18,off=(10,22),a=0.55):
    sh=Image.new('RGBA',im.size,(0,0,0,0)); sh.putalpha(im.getchannel('A').point(lambda v:int(v*a)))
    pad=Image.new('RGBA',(im.width+blur*4,im.height+blur*4),(0,0,0,0)); pad.paste(sh,(blur*2,blur*2)); pad=pad.filter(ImageFilter.GaussianBlur(blur))
    base.paste((0,0,0),(int(x+off[0]-blur*2),int(y+off[1]-blur*2)),pad); base.paste(im,(int(x),int(y)),im)
def word(txt,size,top_col,bot_col,maxw):
    f=F(size)
    while f.getlength(txt)>maxw: size-=4; f=F(size)
    st=int(size*0.09); w=int(f.getlength(txt))+st*4; h=int(size*1.35)+st*4
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).text((st*2,st*2),txt,font=f,fill=255)
    out=Image.new('L',(w,h),0); ImageDraw.Draw(out).text((st*2,st*2),txt,font=f,fill=255,stroke_width=st,stroke_fill=255)
    g=Image.new('RGBA',(w,h)); gd=ImageDraw.Draw(g); bb=m.getbbox() or (0,0,w,h)
    for y in range(h):
        t=min(1,max(0,(y-bb[1])/max(1,bb[3]-bb[1]))); gd.line([(0,y),(w,y)],fill=tuple(int(top_col[i]*(1-t)+bot_col[i]*t) for i in range(3))+(255,))
    L=Image.new('RGBA',(w,h),(0,0,0,0)); L.paste((12,18,40,255),(0,0),out); L.paste(g,(0,0),m)
    shine=ImageChops.subtract(m,m.transform(m.size,Image.AFFINE,(1,0,0,0,1,-int(size*0.06)))); L.paste((255,255,255,170),(0,0),shine)
    return L
def headline(base,lines,sub,top):
    y=top; cols=[((255,255,255),(205,228,255)),((255,236,140),(255,160,20))]
    for i,l in enumerate(lines):
        L=word(l,W*0.135,*cols[i],W*0.92); drop(base,L,(W-L.width)//2,y,blur=int(10*K),off=(0,int(14*K)),a=0.75); y+=int(L.height*0.74)
    if sub:
        d=ImageDraw.Draw(base); fs=F(W*0.045); x=(W-fs.getlength(sub))/2
        d.text((x,y+int(10*K)),sub,font=fs,fill=(255,248,225),stroke_width=int(6*K),stroke_fill=(12,18,40)); y+=int(W*0.07)
    return y
def card(src,crop,w,maxh,ang):
    s=Image.open(src+'.png').convert('RGB'); x0,y0,x1,y1=crop
    s=s.crop((int(x0*s.width),int(y0*s.height),int(x1*s.width),int(y1*s.height)))
    w=int(w); h=int(s.height*w/s.width)
    if h>maxh: h=int(maxh); w=int(s.width*h/s.height)
    s=s.resize((w,h),Image.LANCZOS).convert('RGBA'); r=int(46*K); b=int(14*K); o=int(7*K)
    C=Image.new('RGBA',(w+2*(b+o),h+2*(b+o)),(0,0,0,0)); d=ImageDraw.Draw(C)
    d.rounded_rectangle((0,0,C.width-1,C.height-1),r+b+o,fill=(12,18,40,255))
    d.rounded_rectangle((o,o,C.width-1-o,C.height-1-o),r+b,fill=(255,201,58,255))
    d.rounded_rectangle((o,o,C.width-1-o,o+b),r,fill=(255,236,150,255))
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),r,fill=255); C.paste(s,(b+o,b+o),m)
    return C.rotate(ang,Image.BICUBIC,expand=True)
def art(i,align):
    a=Image.open(f'bg/b{i}.png').convert('RGB'); h=int(a.height*W/a.width); a=a.resize((W,h),Image.LANCZOS)
    if h<H: a=a.resize((int(W*H/h),H),Image.LANCZOS); a=a.crop(((a.width-W)//2,0,(a.width-W)//2+W,H)); return a.convert('RGBA')
    y=int((h-H)*align); return a.crop((0,y,W,y+H)).convert('RGBA')
def pill(t):
    fs=F(W*0.06); tw=fs.getlength(t); p=Image.new('RGBA',(int(tw+70*K),int(W*0.115)),(0,0,0,0)); pd=ImageDraw.Draw(p)
    pd.rounded_rectangle((0,0,p.width-1,p.height-1),p.height//2,fill=(255,201,58),outline=(12,18,40),width=int(7*K)); pd.text((int(35*K),int(p.height*0.16)),t,font=fs,fill=(40,20,0)); return p
# (art, align, lines, sub, cards=[(src,crop,width_frac,cx_frac,top_frac,bottom_frac,angle)])
S=[(1,1,['ONE SWIPE.','HUGE SIXES!'],None,[('r1',(0,0.07,1,0.62),0.72,0.40,0.205,0.60,4)]),
   (2,1,['1v1 DUELS','WINNER TAKES ALL'],'Same 12 balls. Most runs wins the pot.',[('r3',(0,0.30,1,0.76),0.62,0.5,0.205,0.445,-3)]),
   (3,1,['120+ GROUNDS','BEACH TO THE MOON'],None,[('g1',(0,0.10,1,0.80),0.38,0.24,0.25,0.74,9),('g3',(0,0.10,1,0.80),0.38,0.76,0.25,0.74,-9),('g0',(0,0.08,1,0.80),0.44,0.5,0.22,0.76,0)]),
   (4,0,['LIFT THE CUP','EVERY WEEKEND'],'32-team knockout. Lose and you\'re out.',[('r4',(0,0.0,1,0.43),0.86,0.5,0.215,0.50,2)]),
   (5,1,['FESTIVE EVENTS','EXCLUSIVE KIT'],None,[('r6',(0,0.54,1,0.93),0.84,0.5,0.215,0.56,3)]),
   (6,0,['UNLOCK','LEGENDARY BATS'],None,[('r5',(0,0.30,1,0.86),0.80,0.5,0.205,0.60,-2)]),
   (3,1,['27 LEAGUES','CLIMB THE ROAD'],'From the gully to the moon.',[('r9',(0,0.13,1,0.89),0.80,0.5,0.225,0.72,2)])]
for n,(ai,al,lines,sub,cards) in enumerate(S,1):
    im=art(ai,al)
    sh=Image.new('L',(W,H),0); sd=ImageDraw.Draw(sh)
    for y in range(int(H*0.26)): sd.line([(0,y),(W,y)],fill=int(150*(1-y/(H*0.26))**1.4))
    im.paste((6,10,30),(0,0),sh)
    if n==2 and H/W<2.1: cards=[('r3',(0,0.30,1,0.76),0.50,0.5,0.205,0.395,-3)]   # shorter Play screen: keep faces clear
    for (src,crop,wf,cx,t,b,ang) in cards:
        C=card(src,crop,W*wf,H*(b-t),ang); drop(im,C,int(W*cx-C.width/2),int(H*t),blur=int(26*K),off=(0,int(22*K)),a=0.7)
    headline(im,lines,sub,int(H*0.035))
    if n==1: p=pill('FREE TO PLAY'); drop(im,p,int(W*0.05),int(H*0.885))
    im.convert('RGB').save(f'{OUT}/{n:02d}.png',optimize=True)
print('ok')
