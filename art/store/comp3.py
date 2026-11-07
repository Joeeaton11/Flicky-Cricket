from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageChops
import os,sys,random
OUT=sys.argv[1]; W,H=int(sys.argv[2]),int(sys.argv[3]); os.makedirs(OUT,exist_ok=True)
K=W/1320
FL='/home/claude/flicky-cricket/art/flicky/'; P='props/'
def F(n): return ImageFont.truetype('lilita.ttf',int(n))
def prop(name,w):
    im=Image.open((FL if name.startswith('flicky') else P)+name).convert('RGBA'); return im.resize((int(w),int(im.height*w/im.width)),Image.LANCZOS)
def drop(base,im,x,y,blur=18,off=(10,22),a=0.55):
    sh=Image.new('RGBA',im.size,(0,0,0,0)); sh.putalpha(im.getchannel('A').point(lambda v:int(v*a)))
    pad=Image.new('RGBA',(im.width+blur*4,im.height+blur*4),(0,0,0,0)); pad.paste(sh,(blur*2,blur*2)); pad=pad.filter(ImageFilter.GaussianBlur(blur))
    base.paste((0,0,0),(int(x+off[0]-blur*2),int(y+off[1]-blur*2)),pad); base.paste(im,(int(x),int(y)),im)
def word(txt,size,top_col,bot_col,maxw):
    f=F(size)
    while f.getlength(txt)>maxw: size-=4; f=F(size)
    st=int(size*0.085); w=int(f.getlength(txt))+st*4; h=int(size*1.35)+st*4
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).text((st*2,st*2),txt,font=f,fill=255)
    out=Image.new('L',(w,h),0); ImageDraw.Draw(out).text((st*2,st*2),txt,font=f,fill=255,stroke_width=st,stroke_fill=255)
    g=Image.new('RGBA',(w,h)); gd=ImageDraw.Draw(g)
    bb=m.getbbox() or (0,0,w,h)
    for y in range(h):
        t=min(1,max(0,(y-bb[1])/max(1,bb[3]-bb[1]))); gd.line([(0,y),(w,y)],fill=tuple(int(top_col[i]*(1-t)+bot_col[i]*t) for i in range(3))+(255,))
    L=Image.new('RGBA',(w,h),(0,0,0,0))
    L.paste((12,18,40,255),(0,0),out)                       # thick dark outline
    hi=m.filter(ImageFilter.GaussianBlur(1)); L.paste(g,(0,0),m)
    shine=ImageChops.subtract(m,m.transform(m.size,Image.AFFINE,(1,0,0,0,1,-int(size*0.06)))); L.paste((255,255,255,170),(0,0),shine)   # top-edge shine
    return L
def headline(base,lines,sub,top):
    y=top; cols=[((255,255,255),(200,225,255)),((255,236,140),(255,160,20))]
    for i,l in enumerate(lines):
        L=word(l,W*0.125,*cols[i],W*0.9); x=(W-L.width)//2
        drop(base,L,x,y,blur=int(10*K),off=(0,int(14*K)),a=0.7); y+=int(L.height*0.72)
    d=ImageDraw.Draw(base); fs=F(W*0.043); x=(W-fs.getlength(sub))/2
    d.text((x,y+int(8*K)),sub,font=fs,fill=(255,246,220),stroke_width=int(5*K),stroke_fill=(12,18,40))
    return y+int(W*0.075)
def grid():
    t=[Image.open(f'g{i}.png').convert('RGB') for i in range(4)]; tw=t[0].width; th=int(tw*1.85); y0=int(t[0].height*0.07)
    G=Image.new('RGB',(tw*2+24,th*2+24),(5,10,20))
    for i,x in enumerate(t): G.paste(x.crop((0,y0,tw,y0+th)),((i%2)*(tw+24),(i//2)*(th+24)))
    return G
S=[('r1',['ONE SWIPE.','HUGE SIXES.'],'Smash it out of the ground with one thumb',(20,50,140)),
   ('r3',['2-MINUTE','DUELS'],'Same balls. Most runs wins the pot.',(150,25,35)),
   ('grid',['120+ GROUNDS','GULLY TO THE MOON'],'28 leagues, every one hand-painted',(16,100,70)),
   ('r4',['LIFT THE CUP','EVERY WEEKEND'],'32-player knockout. Lose and you\'re out.',(80,36,140)),
   ('r6',['FESTIVE EVENTS','EXCLUSIVE KIT'],'New seasonal events all year round',(140,20,30)),
   ('r5',['UNLOCK','LEGENDARY BATS'],'Collect, upgrade and smash further',(24,60,130))]
random.seed(4)
for n,(src,lines,sub,c) in enumerate(S,1):
    shot=grid() if src=='grid' else Image.open(src+'.png').convert('RGB')
    # painted backdrop: the slide's own art, blurred and tinted, with rays
    bg=shot.resize((W,int(shot.height*W/shot.width))).crop((0,0,W,H)).filter(ImageFilter.GaussianBlur(int(38*K)))
    im=Image.blend(bg,Image.new('RGB',(W,H),c),0.62).convert('RGBA')
    rays=Image.new('L',(W,H),0); rd=ImageDraw.Draw(rays); cx,cy=W/2,-H*0.05
    import math
    for a in range(0,360,12): rd.polygon([(cx,cy),(cx+math.cos(math.radians(a))*H*1.4,cy+math.sin(math.radians(a))*H*1.4),(cx+math.cos(math.radians(a+5))*H*1.4,cy+math.sin(math.radians(a+5))*H*1.4)],fill=40)
    rays=rays.filter(ImageFilter.GaussianBlur(int(20*K))); im.paste((255,255,255),(0,0),rays)
    glow=Image.new('L',(W,H),0); ImageDraw.Draw(glow).ellipse((-W*0.1,-H*0.08,W*1.1,H*0.24),fill=120); glow=glow.filter(ImageFilter.GaussianBlur(int(W*0.08)))
    im.paste(tuple(min(255,v*2+60) for v in c),(0,0),glow)
    # gameplay, full width, rounded top corners, gold rim, fading in at the seam
    top=headline(Image.new('RGBA',(W,H)),lines,sub,int(H*0.03))+int(H*0.012); sc=shot.resize((W,int(shot.height*W/shot.width)),Image.LANCZOS).crop((0,0,W,H-top)).convert('RGBA')
    m=Image.new('L',sc.size,0); ImageDraw.Draw(m).rounded_rectangle((int(28*K),0,sc.width-1-int(28*K),sc.height+200),int(70*K),fill=255)
    rim=Image.new('RGBA',(W,H-top+40),(0,0,0,0)); ImageDraw.Draw(rim).rounded_rectangle((int(18*K),-int(10*K),W-1-int(18*K),H-top+300),int(80*K),fill=(255,201,58,255),outline=(12,18,40,255),width=int(8*K))
    drop(im,rim,0,top-int(10*K),blur=int(22*K),off=(0,int(16*K)),a=0.6)
    im.paste(sc,(0,top),m)
    y=headline(im,lines,sub,int(H*0.03))
    # props breaking the frame
    if n==1:
        f=prop('flicky-celebrate.png',W*0.44); drop(im,f,W*0.55,H-f.height-H*0.02)
        d=ImageDraw.Draw(im); fs=F(W*0.042); t='FREE TO PLAY'; tw=fs.getlength(t); x0=int(W*0.06); y0=H-int(H*0.075)
        pill=Image.new('RGBA',(int(tw+70*K),int(W*0.085)),(0,0,0,0)); pd=ImageDraw.Draw(pill); pd.rounded_rectangle((0,0,pill.width-1,pill.height-1),pill.height//2,fill=(255,201,58),outline=(12,18,40),width=int(7*K)); pd.text((int(35*K),int(pill.height*0.16)),t,font=fs,fill=(40,20,0))
        drop(im,pill,x0,y0)
    if n==2:
        drop(im,prop('REWA_coins_l.webp',W*0.34),W*0.33,H*0.73); drop(im,prop('icon_duel.webp',W*0.16),W*0.82,top-W*0.0)
    if n==3:
        for i,cr in enumerate(['gully','ecl_lords','pirate_cove','halloween','moon']):
            drop(im,prop(cr+'.webp',W*0.15),W*(0.075+i*0.18),top-W*0.01)
    if n==4:
        drop(im,prop('cup_trophy.webp',W*0.24),W*0.74,top-W*0.05)
    if n==5:
        drop(im,prop('present.webp',W*0.17),W*0.0,top-W*0.06); drop(im,prop('present_ball.webp',W*0.15),W*0.84,top-W*0.06)
        pass
    if n==6:
        drop(im,prop('X_platinum.webp',W*0.24),W*0.75,top-W*0.06); drop(im,prop('X_gems_l.webp',W*0.18),W*0.01,top+W*0.02)
    im.convert('RGB').save(f'{OUT}/{n:02d}.png',optimize=True)
print('ok')
