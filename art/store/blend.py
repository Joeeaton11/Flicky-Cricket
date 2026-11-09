import sys
from PIL import Image,ImageDraw,ImageFilter,ImageEnhance
exec(open('brand.py').read().split("slide('01'")[0].replace("OUT,W,H=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])","OUT,W,H=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])"))
def scene(f):
    a=Image.open(f).convert('RGB'); s=max(W/a.width,H/a.height); a=a.resize((int(a.width*s)+1,int(a.height*s)+1),Image.LANCZOS)
    x=(a.width-W)//2; y=a.height-H; a=a.crop((x,y,x+W,y+H))
    a=a.filter(ImageFilter.GaussianBlur(3*K)); a=ImageEnhance.Color(a).enhance(0.9)
    nav=Image.new('RGB',(W,H),(6,22,50)); m=Image.new('L',(W,H)); md=ImageDraw.Draw(m)
    for yy in range(H): md.line([(0,yy),(W,yy)],fill=int(170-120*(yy/H)))   # darker at the top where the words are, more scene at the bottom
    a=Image.composite(nav,a,m)
    return Image.blend(bg().convert('RGB'),a,0.82).convert('RGBA')

def slide(n,l1,l2,bgf,shots,extra=None,sub=None,tilt=0):
    im=scene(bgf); y=int(H*0.045)
    for txt,cols in [(l1,((255,255,255),(205,228,255))),(l2,((255,226,122),(244,163,10)))]:
        L=word(txt,W*0.13,*cols,W*0.9); drop(im,L,(W-L.width)//2,y,blur=int(8*K),off=(0,int(12*K)),a=0.7); y+=int(L.height*0.78)
    if sub:
        d=ImageDraw.Draw(im); fs=F(W*0.045); d.text(((W-fs.getlength(sub))/2,y+int(6*K)),sub,font=fs,fill=(255,248,225),stroke_width=int(6*K),stroke_fill=(5,10,20)); y+=int(W*0.07)
    top=y+int(H*0.02)
    room=H-top-int(H*(0.20 if extra and extra[0]=='pair' else 0.05))
    if len(shots)==3:
        for (f,cr),(cx,wf,ang,dy) in zip(shots,[(0.17,0.40,7,0.07),(0.83,0.40,-7,0.07),(0.5,0.46,0,0)]):
            P=phone(f,cr,W*wf,room*(0.86 if ang else 0.97)).rotate(ang,Image.BICUBIC,expand=True)
            drop(im,P,int(W*cx-P.width/2),top+int(H*dy),blur=int(26*K),off=(0,int(22*K)),a=0.6)
    else:
        f,cr=shots[0]; P=phone(f,cr,W*0.74,room)
        if tilt: P=P.rotate(tilt,Image.BICUBIC,expand=True)
        drop(im,P,(W-P.width)//2,top,blur=int(30*K),off=(0,int(26*K)),a=0.6)
    if extra:
        kind,f,x,wf,flip=extra
        M=Image.open(f).convert('RGBA'); mw=int(W*wf); M=M.resize((mw,int(M.height*mw/M.width)),Image.LANCZOS)
        if flip: M=M.transpose(Image.FLIP_LEFT_RIGHT)
        drop(im,M,int(W*x-mw/2),H-M.height+(int(H*0.02) if kind=='pair' else -int(H*0.03)),blur=int(16*K),off=(0,int(14*K)),a=0.5)
    im.convert('RGB').save(f'{OUT}/{n}.png')
A=(0,0,1,1)
slide('01','ONE SWIPE.','HUGE SIXES!','bg/b1.png',[('r1.png',A)],('m','flicky-celebrate.png',0.80,0.36,False))
slide('02','1v1 DUELS','WINNER TAKES ALL','bg/b2.webp',[('dw.png',(0,0.06,1,0.74))],('pair','duel_pair.png',0.5,1.05,False),'Same 12 balls. Most runs wins the pot.')
slide('03','27 LEAGUES','CLIMB THE ROAD','bg/b3.png',[('r9.png',A)],('m','flicky-wink.png',0.20,0.36,True))
slide('04','120+ GROUNDS','BEACH TO THE MOON','bg/b3.png',[('g1.png',A),('g3.png',A),('g2.png',A)])
slide('05','LIFT THE CUP','EVERY WEEKEND','bg/b4.png',[('cupwin.png',(0,0.17,1,0.82))],None,'32-team knockout. Lose and you\'re out.')
slide('06','UNLOCK','LEGENDARY BATS','bg/b6.png',[('r5.png',A)],None,None,-3)
slide('07','FESTIVE EVENTS','EXCLUSIVE KIT','bg/b5.png',[('r6.png',(0,0.545,1,1))])
print('ok')
