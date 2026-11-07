from PIL import Image,ImageDraw,ImageFont,ImageFilter
import os,sys
OUT=sys.argv[1]; W,H=int(sys.argv[2]),int(sys.argv[3]); os.makedirs(OUT,exist_ok=True)
F=lambda n:ImageFont.truetype('lilita.ttf',n)
FL='/home/claude/flicky-cricket/art/flicky/'
S=[('r1',['ONE SWIPE.','HUGE SIXES.'],'Smash it out of the ground with one thumb',(8,30,90),'flicky'),
   ('r3',['2-MINUTE','DUELS'],'Same balls. Most runs wins the pot.',(110,16,26),None),
   ('grid',['120+ GROUNDS','GULLY TO THE MOON'],'28 leagues, every one hand-painted',(12,70,52),None),
   ('r4',['LIFT THE CUP','EVERY WEEKEND'],'32-player knockout. Lose and you\'re out.',(56,24,100),None),
   ('r6',['FESTIVE EVENTS','EXCLUSIVE KIT'],'New seasonal events all year round',(100,14,24),None),
   ('r5',['UNLOCK','LEGENDARY BATS'],'Collect, upgrade and smash further',(16,40,90),None)]
def grid():
    t=[Image.open(f'g{i}.png').convert('RGB') for i in range(4)]; tw=t[0].width; th=int(tw*1.85); y0=int(t[0].height*0.07)
    G=Image.new('RGB',(tw*2+24,th*2+24),(5,10,20))
    for i,x in enumerate(t): G.paste(x.crop((0,y0,tw,y0+th)),((i%2)*(tw+24),(i//2)*(th+24)))
    return G
def headline(d,lines,sub,top):
    y=top
    for i,l in enumerate(lines):
        sz=int(W*0.125); f=F(sz)
        while d.textlength(l,font=f)>W*0.92: sz-=4; f=F(sz)
        x=(W-d.textlength(l,font=f))/2; st=int(sz*0.075)
        d.text((x,y+sz*0.08),l,font=f,fill=(0,0,0),stroke_width=st,stroke_fill=(0,0,0))
        d.text((x,y),l,font=f,fill=(255,201,58) if i==1 else (255,255,255),stroke_width=st,stroke_fill=(10,16,32))
        y+=int(sz*1.02)
    fs=F(int(W*0.042)); x=(W-d.textlength(sub,font=fs))/2
    d.text((x,y+int(W*0.012)),sub,font=fs,fill=(235,226,200),stroke_width=3,stroke_fill=(10,16,32))
    return y+int(W*0.07)
for n,(src,lines,sub,c,mascot) in enumerate(S,1):
    im=Image.new('RGB',(W,H),c)
    shot=grid() if src=='grid' else Image.open(src+'.png').convert('RGB')
    sw=W; sh=int(shot.height*sw/shot.width); sc=shot.resize((sw,sh),Image.LANCZOS)
    top=int(H*0.20)
    im.paste(sc,(0,top))
    # band + fade over the top of the shot
    band=Image.new('RGBA',(W,H),(0,0,0,0)); bd=ImageDraw.Draw(band)
    for yy in range(0,top+int(H*0.09)):
        a=255 if yy<top else int(255*(1-(yy-top)/(H*0.09))**1.6)
        bd.line([(0,yy),(W,yy)],fill=c+(a,))
    im.paste(band,(0,0),band)
    glow=Image.new('L',(W,H),0); ImageDraw.Draw(glow).ellipse((-W*0.2,-H*0.1,W*1.2,H*0.25),fill=90); glow=glow.filter(ImageFilter.GaussianBlur(W*0.1))
    im.paste(Image.new('RGB',(W,H),tuple(min(255,v*2+40) for v in c)),(0,0),glow)
    d=ImageDraw.Draw(im); headline(d,lines,sub,int(H*0.035))
    if mascot:
        m=Image.open(FL+('flicky-celebrate.png' if mascot=='flicky' else 'flicky-wink.png')).convert('RGBA'); mw=int(W*0.42); m=m.resize((mw,int(m.height*mw/m.width)),Image.LANCZOS)
        sh_=Image.new('RGBA',m.size,(0,0,0,0)); sh_.putalpha(m.getchannel('A').point(lambda v:v*0.5)); sh_=sh_.filter(ImageFilter.GaussianBlur(20))
        px=int(W*0.56) if mascot=='flicky' else int(W*0.02); py=H-m.height-int(H*0.03)
        im.paste((0,0,0),(px+10,py+20),sh_); im.paste(m,(px,py),m)
    if n==1:
        d=ImageDraw.Draw(im); fs=F(int(W*0.04)); t='FREE TO PLAY'; tw=d.textlength(t,font=fs)
        x0=int(W*0.06); y0=H-int(H*0.075); d.rounded_rectangle((x0,y0,x0+tw+60,y0+int(W*0.075)),int(W*0.04),fill=(255,201,58),outline=(10,16,32),width=6)
        d.text((x0+30,y0+int(W*0.013)),t,font=fs,fill=(30,16,0))
    im.save(f'{OUT}/{n:02d}.png',optimize=True)
print('ok')
