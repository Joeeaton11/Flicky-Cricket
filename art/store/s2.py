import sys
exec(open('duelcard.py').read())
C=card(int(W*0.88)).convert('RGB'); C.save(f'{OUT}/_duelcard.png')
im=scene('bg/b2.webp',True); y=int(H*0.045)
for txt,cols in [('1v1 DUELS',((255,255,255),(205,228,255))),('WINNER TAKES ALL',((255,226,122),(244,163,10)))]:
    L=word(txt,W*0.13,*cols,W*0.9); drop(im,L,(W-L.width)//2,y,blur=int(8*K),off=(0,int(12*K)),a=0.7); y+=int(L.height*0.78)
d=ImageDraw.Draw(im); sub='Same 12 balls. Most runs wins the pot.'; fs=F(W*0.045); d.text(((W-fs.getlength(sub))/2,y+int(6*K)),sub,font=fs,fill=(255,248,225),stroke_width=int(6*K),stroke_fill=(5,10,20)); y+=int(W*0.07)
top=y+int(H*0.02)
M=Image.open('duel_pair.png').convert('RGBA'); mw=int(W*1.22); M=M.resize((mw,int(M.height*mw/M.width)),Image.LANCZOS)
drop(im,M,int(W*0.5-mw/2),H-M.height+int(H*0.02),blur=int(16*K),off=(0,int(14*K)),a=0.5)
P=floating(f'{OUT}/_duelcard.png',(0,0,1,1),0.86,-3,top,H*0.36)
drop(im,P,int(W*0.5-P.width/2),top,blur=int(28*K),off=(0,int(24*K)),a=0.6)
im.convert('RGB').save(f'{OUT}/02_new.png'); print('ok')
