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
# the two duel cricketers squaring up, waist-up, filling the bottom
P=Image.open('pair.png').convert('RGBA'); pw=int(W*(1.5 if H/W>2.1 else 1.42)); P=P.resize((pw,int(P.height*pw/P.width)),Image.LANCZOS)
ty=H-P.height
gl=Image.new('L',(W,H),0); ImageDraw.Draw(gl).ellipse((int(0.2*W),ty-int(0.02*H),int(0.8*W),H),fill=120); gl=gl.filter(ImageFilter.GaussianBlur(80*K))
im.paste((255,200,80),(0,0),gl.point(lambda v:int(v*0.5)))
g['drop'](im,P,int((W-pw)/2),ty,blur=int(20*K),off=(0,int(16*K)),a=0.55)
t,b=(0.205,0.49) if H/W>2.1 else (0.205,0.47)
C=g['card']('dw',(0.0,0.24,1,0.595),W*0.86,H*(b-t),-3)
g['drop'](im,C,int(W*0.5-C.width/2),int(H*t),blur=int(26*K),off=(0,int(22*K)),a=0.7)
g['headline'](im,['1v1 DUELS','WINNER TAKES ALL'],'Same 12 balls. Most runs wins the pot.',int(H*0.035))
import os; os.makedirs(OUTDIR,exist_ok=True); im.convert('RGB').save(f'{OUTDIR}/02.png',optimize=True); print('ok')
