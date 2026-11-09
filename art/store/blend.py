import sys
from PIL import Image,ImageDraw,ImageFilter,ImageEnhance
exec(open('brand.py').read().split("slide('01'")[0].replace("OUT,W,H=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])","OUT,W,H=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])"))
def scene(f,light=False):
    a=Image.open(f).convert('RGB'); s=max(W/a.width,H/a.height); a=a.resize((int(a.width*s)+1,int(a.height*s)+1),Image.LANCZOS)
    x=(a.width-W)//2; y=a.height-H; a=a.crop((x,y,x+W,y+H))
    a=a.filter(ImageFilter.GaussianBlur((0.8 if light else 3)*K)); a=ImageEnhance.Color(a).enhance(1.05 if light else 0.9)
    nav=Image.new('RGB',(W,H),(6,22,50)); m=Image.new('L',(W,H)); md=ImageDraw.Draw(m)
    for yy in range(H): md.line([(0,yy),(W,yy)],fill=int((120-110*(yy/H)) if light else (170-120*(yy/H))))   # darker at the top where the words are, more scene at the bottom
    a=Image.composite(nav,a,m)
    return Image.blend(bg().convert('RGB'),a,0.82).convert('RGBA')

def slide(n,l1,l2,bgf,shots,extra=None,sub=None,tilt=0,pop=False,pw=0.74,cx=0.5,light=False):
    im=scene(bgf,light); y=int(H*0.045)
    if pop:   # a warm glow behind the phone so a dark screen stands off a dark scene
        gl=Image.new('L',(W,H)); ImageDraw.Draw(gl).ellipse((int(W*0.02),int(H*0.20),int(W*0.98),int(H*0.92)),fill=210); gl=gl.filter(ImageFilter.GaussianBlur(110*K))
        im.paste((255,190,70),(0,0),gl.point(lambda v:int(v*0.62)))
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
        f,cr=shots[0]; P=phone(f,cr,W*pw,room)
        if pop:
            G=Image.new('RGBA',(P.width+int(16*K),P.height+int(16*K)),(0,0,0,0)); ImageDraw.Draw(G).rounded_rectangle((0,0,G.width-1,G.height-1),int(76*K),fill=(255,201,58,255)); G.alpha_composite(P,(int(8*K),int(8*K))); P=G
        if tilt: P=P.rotate(tilt,Image.BICUBIC,expand=True)
        drop(im,P,int(W*cx-P.width/2),top,blur=int(30*K),off=(0,int(26*K)),a=0.6)
    if extra:
        kind,f,x,wf,flip=extra
        M=Image.open(f).convert('RGBA'); mw=int(W*wf); M=M.resize((mw,int(M.height*mw/M.width)),Image.LANCZOS)
        if flip: M=M.transpose(Image.FLIP_LEFT_RIGHT)
        drop(im,M,int(W*x-mw/2),H-M.height+(int(H*0.02) if kind=='pair' else -int(H*0.03)),blur=int(16*K),off=(0,int(14*K)),a=0.5)
    im.convert('RGB').save(f'{OUT}/{n}.png')

def floating(src,crop,wf,ang,t,mh=None):
    s_=Image.open(src).convert('RGB'); x0,y0,x1,y1=crop; s_=s_.crop((int(x0*s_.width),int(y0*s_.height),int(x1*s_.width),int(y1*s_.height)))
    w=int(W*wf); h=int(s_.height*w/s_.width)
    if mh and h>mh: h=int(mh); w=int(s_.width*h/s_.height)
    s_=s_.resize((w,h),Image.LANCZOS).convert('RGBA'); r=int(44*K); b=int(12*K); o=int(6*K)
    C=Image.new('RGBA',(w+2*(b+o),h+2*(b+o)),(0,0,0,0)); d=ImageDraw.Draw(C)
    d.rounded_rectangle((0,0,C.width-1,C.height-1),r+b+o,fill=(5,10,20,255)); d.rounded_rectangle((o,o,C.width-1-o,C.height-1-o),r+b,fill=(255,201,58,255))
    m=Image.new('L',(w,h)); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),r,fill=255); C.paste(s_,(b+o,b+o),m)
    return C.rotate(ang,Image.BICUBIC,expand=True)
def poster(n,l1,l2,bgf,pieces,extra=None,sub=None):
    im=scene(bgf,True); y=int(H*0.045)
    for txt,cols in [(l1,((255,255,255),(205,228,255))),(l2,((255,226,122),(244,163,10)))]:
        L=word(txt,W*0.13,*cols,W*0.9); drop(im,L,(W-L.width)//2,y,blur=int(8*K),off=(0,int(12*K)),a=0.7); y+=int(L.height*0.78)
    if sub:
        d=ImageDraw.Draw(im); fs=F(W*0.045); d.text(((W-fs.getlength(sub))/2,y+int(6*K)),sub,font=fs,fill=(255,248,225),stroke_width=int(6*K),stroke_fill=(5,10,20)); y+=int(W*0.07)
    top=y+int(H*0.02)
    if extra:
        kind,f,x,wf,flip=extra
        M=Image.open(f).convert('RGBA'); mw=int(W*wf); M=M.resize((mw,int(M.height*mw/M.width)),Image.LANCZOS)
        drop(im,M,int(W*x-mw/2),H-M.height+int(H*0.02),blur=int(16*K),off=(0,int(14*K)),a=0.5)
    for (src,crop,wf,ang,cx,dy,mh) in pieces:
        P=floating(src,crop,wf,ang,top,H*mh if mh else None)
        drop(im,P,int(W*cx-P.width/2),top+int(H*dy),blur=int(28*K),off=(0,int(24*K)),a=0.6)
    im.convert('RGB').save(f'{OUT}/{n}.png')
A=(0,0,1,1)
slide('01','ONE SWIPE.','HUGE SIXES!','bg/b1.png',[('r1.png',A)])
poster('02','1v1 DUELS','WINNER TAKES ALL','bg/b2.webp',[('dw.png',(0,0.20,1,0.615),0.86,-3,0.5,0.0,0.36)],('pair','duel_pair.png',0.5,1.22,False),'Same 12 balls. Most runs wins the pot.')
slide('03','27 LEAGUES','CLIMB THE ROAD','bg/road.png',[('r9.png',(0,0.225,1,0.895))],None,None,4,False,0.66,0.62,True)
slide('04','120+ GROUNDS','BEACH TO THE MOON','bg/b3.png',[('g1.png',A),('g3.png',A),('g0.png',A)])
poster('05','LIFT THE CUP','EVERY WEEKEND','bg/b4.png',[('cupwin.png',(0.04,0.445,0.96,0.645),0.88,2,0.5,0.0,0.22)],None,'32-team knockout. Lose and you\'re out.')
poster('06','UNLOCK','LEGENDARY BATS','bg/b6.png',[('r5.png',(0,0.315,1,0.86),0.66,-3,0.5,0.0,0.34)])
slide('07','FESTIVE EVENTS','EXCLUSIVE KIT','bg/b5.png',[('r6.png',(0,0.545,1,1))])
print('ok')
