from PIL import Image,ImageDraw,ImageFont,ImageFilter
import os,sys
OUT=sys.argv[1]; W,H=int(sys.argv[2]),int(sys.argv[3]); os.makedirs(OUT,exist_ok=True)
FONT='lilita.ttf'
S=[('r1',['SWIPE TO','SMASH SIXES'],(10,40,110)),('r3',['HEAD-TO-HEAD','DUELS'],(120,20,30)),('grid',['120+ PAINTED','GROUNDS'],(16,80,60)),
   ('r4',['WIN THE','FLICKY CUP'],(60,30,110)),('r6',['SEASONAL','EVENTS'],(110,20,30)),('r5',['COLLECT','LEGENDARY KIT'],(20,50,100))]
def bg(c):
    im=Image.new('RGB',(W,H),c); d=ImageDraw.Draw(im)
    for i in range(H):
        t=i/H; d.line([(0,i),(W,i)],fill=tuple(int(c[k]*(1-t*0.75)+4*t) for k in range(3)))
    g=Image.new('L',(W,H),0); ImageDraw.Draw(g).ellipse((-W*0.3,-H*0.15,W*1.3,H*0.35),fill=110); g=g.filter(ImageFilter.GaussianBlur(W*0.12))
    im.paste(Image.new('RGB',(W,H),tuple(min(255,int(v*1.9)+30) for v in c)),(0,0),g); return im
def text(d,lines,top):
    sz=int(W*0.115); y=top
    for i,l in enumerate(lines):
        f=ImageFont.truetype(FONT,sz)
        while d.textlength(l,font=f)>W*0.9: sz-=4; f=ImageFont.truetype(FONT,sz)
        x=(W-d.textlength(l,font=f))/2
        d.text((x,y+sz*0.06),l,font=f,fill=(5,10,20)); d.text((x,y),l,font=f,fill=(255,201,58) if i==1 else (255,255,255),stroke_width=int(sz*0.06),stroke_fill=(5,10,20))
        y+=int(sz*1.05)
    return y
def phone(img,w):
    h=int(img.height*w/img.width); im=img.resize((w,h),Image.LANCZOS); r=int(w*0.08)
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),r,fill=255)
    fr=Image.new('RGBA',(w+int(w*0.05),h+int(w*0.05)),(0,0,0,0)); b=int(w*0.025)
    ImageDraw.Draw(fr).rounded_rectangle((0,0,fr.width-1,fr.height-1),r+b,fill=(10,14,24,255),outline=(255,201,58,255),width=max(4,b//3))
    fr.paste(im,(b,b),m); return fr
def grid():
    tiles=[Image.open(f'g{i}.png').convert('RGB') for i in range(4)]
    tw=tiles[0].width; th=int(tw*1.85); y0=int(tiles[0].height*0.07)
    G=Image.new('RGB',(tw*2+40,th*2+40),(10,14,24)); G=G
    for i,t in enumerate(tiles): G.paste(t.crop((0,y0,tw,y0+th)),((i%2)*(tw+40),(i//2)*(th+40)))
    return G
for n,(src,lines,c) in enumerate(S,1):
    im=bg(c); d=ImageDraw.Draw(im); y=text(d,lines,int(H*0.04))
    shot=grid() if src=='grid' else Image.open(src+'.png').convert('RGB')
    avail=H-y-int(H*0.02); w=int(W*0.86)
    if shot.height*w/shot.width*1.05>avail: w=int(avail/ (shot.height/shot.width) /1.05)
    p=phone(shot,w); sh=Image.new('RGBA',p.size,(0,0,0,0)); ImageDraw.Draw(sh).rounded_rectangle((0,0,p.width-1,p.height-1),int(w*0.1),fill=(0,0,0,150)); sh=sh.filter(ImageFilter.GaussianBlur(30))
    px=(W-p.width)//2; py=y+int(H*0.012)
    im.paste(sh,(px,py+25),sh); im.paste(p,(px,py),p)
    im.save(f'{OUT}/{n:02d}.png',optimize=True)
print('ok')
