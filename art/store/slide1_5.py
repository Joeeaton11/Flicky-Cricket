import sys,random,math
exec(open('s567.py').read().split("# ── 5: CHALLENGE YOUR MATES")[0])
def gpill(im,t,cx,cy,s=0.05,clock=False):
    f=F(W*s); tw=f.getlength(t); bh=int(W*s*2); bw=int(tw+W*s*(3.4 if clock else 1.6))
    Bp=Image.new('RGBA',(bw,bh),(0,0,0,0)); bd=ImageDraw.Draw(Bp); bd.rounded_rectangle((0,0,bw-1,bh-1),bh//2,fill=(255,201,58,255),outline=(12,24,56,255),width=int(6*K))
    tx=int(W*s*0.8)
    if clock:
        cx_,cy_,rr=int(W*s*1.3),bh//2,int(bh*0.30); bd.ellipse((cx_-rr,cy_-rr,cx_+rr,cy_+rr),outline=(40,22,0),width=int(6*K)); bd.line((cx_,cy_,cx_,cy_-rr*0.65),fill=(40,22,0),width=int(6*K)); bd.line((cx_,cy_,cx_+rr*0.5,cy_),fill=(40,22,0),width=int(6*K)); tx=int(W*s*2.4)
    bd.text((tx,bh*0.15),t,font=f,fill=(40,22,0))
    drop(im,Bp,int(cx-bw/2),int(cy-bh/2),blur=int(12*K),off=(0,int(10*K)),a=0.55)
SL='/home/claude/flicky-cricket/art/store/'+('app_store_6.9in' if H/W>2.1 else 'google_play')
# ── slide 1 + pill
im=Image.open(SL+'/01.png').convert('RGBA'); a=__import__('numpy').asarray(im.convert('L'))
gpill(im,'2-MINUTE MATCHES',W/2,H*(0.955 if H/W>2.1 else 0.952),0.042,True)
im.convert('RGB').save(f'{OUT}/01_pill.png')

# ── slide 5 challenge
im=scene('bg3/sydney.png',True); top=head(im,'CHALLENGE','YOUR MATES','Same 12 balls. Who scores more?')
tall=H/W>2.1; z=1 if tall else 0.88
Bb=bubble('SAM','Beat my 31 off 12 balls. Go on, I dare you.','flickycricket.com/play',0.82*z,3)
y1=int(H*(0.405 if tall else 0.42)); drop(im,Bb,int(W*0.97-Bb.width),y1,blur=int(22*K),off=(0,int(16*K)),a=0.5)
CH=Image.open('ch_in.png').convert('RGB')
dlg=rounded(crop(CH,0.1295,0.4085,0.8705,0.5915),0.72*z,62,-2)
y2=y1+Bb.height-int(H*0.035)
P=phone('bc_ta_scg.png',(0,0,1,0.70),W*0.46*z,H).rotate(-5,Image.BICUBIC,expand=True)
y3=y2+int(dlg.height*0.55)+int(H*0.047)
drop(im,P,int(W*0.24-P.width/2),y3,blur=int(26*K),off=(0,int(20*K)),a=0.6)
drop(im,dlg,int(W*0.60-dlg.width/2),y2,blur=int(28*K),off=(0,int(22*K)),a=0.65)
gpill(im,'YOUR TURN',W*0.24,min(H-int(H*0.045),y3+P.height*0.62),0.042)
im.convert('RGB').save(f'{OUT}/05_ch.png')

# ── slide 6 bats
im=bg().convert('RGBA'); top=head(im,'UNLOCK','LEGENDARY BATS',None)
avail=H-top-int(H*0.10)
C=phone('nk_bat_diamond.png',(0,0.17,1,0.80),W*(0.70 if H/W>2.1 else 0.60),avail)
cy0=top+(avail-C.height)//2+int(H*0.01)
for f,cx,ang in [('nk_bat_sovereign.png',0.17,-10),('nk_bat_maestro.png',0.83,10)]:
    Q=phone(f,(0,0.17,1,0.80),C.width*0.70,avail).rotate(ang,Image.BICUBIC,expand=True)
    drop(im,Q,int(W*cx-Q.width/2),cy0+int(C.height*0.10),blur=int(24*K),off=(0,int(18*K)),a=0.6)
glow(im,W/2,cy0+C.height*0.45,W*0.42,C.height*0.45,150)
drop(im,C,(W-C.width)//2,cy0,blur=int(30*K),off=(0,int(24*K)),a=0.65)
gpill(im,'8 BATS · 4 RARITIES',W/2,cy0+C.height+int(H*0.035),0.042)
im.convert('RGB').save(f'{OUT}/06_bats.png')
print('ok')
