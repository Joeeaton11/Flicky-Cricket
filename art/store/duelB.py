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
# players, big, from the bottom corners, leaning in
ph=int(H*0.56)
def player(f,flip):
    p=Image.open(f).convert('RGBA'); p=p.resize((int(p.width*ph/p.height),ph),Image.LANCZOS)
    return p.transpose(Image.FLIP_LEFT_RIGHT) if flip else p
A=player('pA.png',False); B=player('pB.png',True)
# soft floor shadow
fl=Image.new('L',(W,H),0); ImageDraw.Draw(fl).ellipse((int(-0.1*W),int(H*0.9),int(1.1*W),int(H*1.08)),fill=150); fl=fl.filter(ImageFilter.GaussianBlur(40*K)); im.paste((0,0,0),(0,0),fl)
g['drop'](im,A,int(-0.06*W),H-ph+int(0.05*H),blur=int(20*K),off=(int(10*K),int(18*K)),a=0.6)
g['drop'](im,B,W-B.width+int(0.06*W),H-ph+int(0.06*H),blur=int(20*K),off=(int(-10*K),int(18*K)),a=0.6)
# the payout card
t,b=(0.205,0.46) if H/W>2.1 else (0.205,0.43)
C=g['card']('dw',(0.0,0.24,1,0.64),W*0.70,H*(b-t),3)
g['drop'](im,C,int(W*0.5-C.width/2),int(H*t),blur=int(26*K),off=(0,int(22*K)),a=0.7)
g['headline'](im,['1v1 DUELS','WINNER TAKES ALL'],'Same 12 balls. Most runs wins the pot.',int(H*0.035))
import os; os.makedirs(OUTDIR,exist_ok=True); im.convert('RGB').save(f'{OUTDIR}/02.png',optimize=True); print('ok')
