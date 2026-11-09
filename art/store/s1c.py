import sys
exec(open('blend3.py').read().split("A=(0,0,1,1)")[0])
A=(0,0,1,1)
def gpill(im,t,cx,cy,s=0.05,clock=False):
    f=F(W*s); tw=f.getlength(t); bh=int(W*s*2); bw=int(tw+W*s*(3.4 if clock else 1.6))
    Bp=Image.new('RGBA',(bw,bh),(0,0,0,0)); bd=ImageDraw.Draw(Bp); bd.rounded_rectangle((0,0,bw-1,bh-1),bh//2,fill=(255,201,58,255),outline=(12,24,56,255),width=int(6*K))
    tx=int(W*s*0.8)
    if clock:
        cx_,cy_,rr=int(W*s*1.3),bh//2,int(bh*0.30); bd.ellipse((cx_-rr,cy_-rr,cx_+rr,cy_+rr),outline=(40,22,0),width=int(6*K)); bd.line((cx_,cy_,cx_,cy_-rr*0.65),fill=(40,22,0),width=int(6*K)); bd.line((cx_,cy_,cx_+rr*0.5,cy_),fill=(40,22,0),width=int(6*K)); tx=int(W*s*2.4)
    bd.text((tx,bh*0.15),t,font=f,fill=(40,22,0))
    drop(im,Bp,int(cx-bw/2),int(cy-bh/2),blur=int(12*K),off=(0,int(10*K)),a=0.55)

slide('01c','ONE SWIPE.','HUGE SIXES!','bg/b1.png',[('r1_clean.png',A)])
im=Image.open(f'{OUT}/01c.png').convert('RGBA')
gpill(im,'2-MINUTE MATCHES',W/2,H*(0.955 if H/W>2.1 else 0.952),0.042,True)
im.convert('RGB').save(f'{OUT}/01_clean.png'); print('ok')
