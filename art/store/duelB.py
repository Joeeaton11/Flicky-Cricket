import sys
from PIL import Image,ImageDraw,ImageFilter
src=open('comp4.py').read(); head=src[:src.index('# (art, align, lines, sub, cards')]
OUTDIR,W_,H_=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])
g={}; exec(head.replace("OUT=sys.argv[1]; W,H=int(sys.argv[2]),int(sys.argv[3])",f"OUT={OUTDIR!r}; W,H={W_},{H_}"),g)
W,H,K=g['W'],g['H'],g['K']
bg=Image.open('vsfl.webp').convert('RGB'); s=max(W/bg.width,H/bg.height); bg=bg.resize((int(bg.width*s),int(bg.height*s)),Image.LANCZOS)
x0=(bg.width-W)//2; im=bg.crop((x0,bg.height-H,x0+W,bg.height)).convert('RGBA')
sh=Image.new('L',(W,H),0); sd=ImageDraw.Draw(sh)
for y in range(int(H*0.26)): sd.line([(0,y),(W,y)],fill=int(150*(1-y/(H*0.26))**1.4))
im.paste((6,10,30),(0,0),sh)
# players waist-up, big; the winner (left) lit gold, the rival a touch darker
import random
from PIL import ImageEnhance
ph=int(H*0.80 if H/W>2.1 else H*0.84)
def player(f,flip):
    p=Image.open(f).convert('RGBA'); p=p.resize((int(p.width*ph/p.height),ph),Image.LANCZOS)
    return p.transpose(Image.FLIP_LEFT_RIGHT) if flip else p
A=player('pA.png',False); B=player('pB.png',True)
top=int(H*(0.505 if H/W>2.1 else 0.45))
B=Image.merge('RGBA',(*ImageEnhance.Brightness(B.convert('RGB')).enhance(0.78).split(),B.getchannel('A')))
g['drop'](im,B,int(W*0.98-B.width*0.62),top+int(0.025*H),blur=int(20*K),off=(int(-10*K),int(18*K)),a=0.6)
# gold glow behind the winner
gl=Image.new('L',(W,H),0); ImageDraw.Draw(gl).ellipse((int(-0.25*W),top-int(0.06*H),int(0.75*W),top+int(0.42*H)),fill=170); gl=gl.filter(ImageFilter.GaussianBlur(90*K))
im.paste((255,196,60),(0,0),gl.point(lambda v:int(v*0.55)))
# confetti on the winner's side
d=ImageDraw.Draw(im); rnd=random.Random(7)
for i in range(70):
    x=rnd.uniform(0,W*0.62); y=rnd.uniform(H*0.40,H*0.98); w_=rnd.uniform(10,20)*K; h_=w_*rnd.uniform(1.3,1.9)
    if x>W*0.04 and x<W*0.52 and y>top and y<top+H*0.20: continue
    c=rnd.choice([(255,201,58),(255,255,255),(127,208,255),(255,106,138),(124,242,154)])
    pc=Image.new('RGBA',(int(w_*2),int(h_*2)),(0,0,0,0)); ImageDraw.Draw(pc).rounded_rectangle((w_/2,h_/2,w_*1.5,h_*1.5),int(3*K),fill=c+(235,))
    pc=pc.rotate(rnd.uniform(0,180),expand=True); im.alpha_composite(pc,(int(x),int(y)))
g['drop'](im,A,int(W*0.02-A.width*0.30),top,blur=int(20*K),off=(int(10*K),int(18*K)),a=0.6)
# the payout card, bigger, without the streak strip
t,b=(0.205,0.49) if H/W>2.1 else (0.205,0.46)
C=g['card']('dw',(0.0,0.24,1,0.595),W*0.86,H*(b-t),-3)
g['drop'](im,C,int(W*0.5-C.width/2),int(H*t),blur=int(26*K),off=(0,int(22*K)),a=0.7)
# celebration around the card: a confetti burst at its sides and top, coins spilling off its lower corners
cx0,cx1,cy0,cy1=W*0.5-C.width/2,W*0.5+C.width/2,H*t,H*b
for i in range(90):
    side=rnd.random()
    if side<0.35: x=rnd.uniform(0,cx0+40*K); y=rnd.uniform(cy0-60*K,cy1)
    elif side<0.7: x=rnd.uniform(cx1-40*K,W); y=rnd.uniform(cy0-60*K,cy1)
    else: x=rnd.uniform(cx0,cx1); y=rnd.uniform(cy0-110*K,cy0+10*K)
    if y<H*0.19: continue
    w_=rnd.uniform(11,22)*K; h_=w_*rnd.uniform(1.3,1.9); c=rnd.choice([(255,201,58),(255,255,255),(127,208,255),(255,106,138),(124,242,154)])
    pc=Image.new('RGBA',(int(w_*2),int(h_*2)),(0,0,0,0)); ImageDraw.Draw(pc).rounded_rectangle((w_/2,h_/2,w_*1.5,h_*1.5),int(3*K),fill=c+(240,))
    pc=pc.rotate(rnd.uniform(0,180),expand=True); im.alpha_composite(pc,(int(x),int(y)))
wide=H/W<2.1
for f,cx,sz,rot in ([('coins_l.png',W-cx0*0.55,0.20,-8),('coins_m.png',cx0*0.55,0.15,10)] if wide else [('coins_l.png',cx1-30*K,0.30,-8),('coins_m.png',cx0+20*K,0.20,10)]):
    cimg=Image.open(f).convert('RGBA'); w=int(W*sz); cimg=cimg.resize((w,int(cimg.height*w/cimg.width)),Image.LANCZOS).rotate(rot,expand=True,resample=Image.BICUBIC)
    g['drop'](im,cimg,int(cx-cimg.width/2),int((cy0+cy1)/2-cimg.height*0.2 if wide else cy1-cimg.height*0.55),blur=int(14*K),off=(0,int(12*K)),a=0.55)
g['headline'](im,['1v1 DUELS','WINNER TAKES ALL'],'Same 12 balls. Most runs wins the pot.',int(H*0.035))
import os; os.makedirs(OUTDIR,exist_ok=True); im.convert('RGB').save(f'{OUTDIR}/02.png',optimize=True); print('ok')
