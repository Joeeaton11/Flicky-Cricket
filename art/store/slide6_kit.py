import sys,random,math
exec(open('s567.py').read().split("# ── 5: CHALLENGE YOUR MATES")[0])
import numpy as np
RC={'legendary':((255,214,90),(226,128,16),'LEGENDARY'),'epic':((190,120,255),(104,44,214),'EPIC')}
def kcard(item,name,rar,wf,ang):
    w=int(W*wf); h=int(w*1.30); rc={'legendary':(255,201,58),'epic':(190,120,255),'rare':(96,180,255)}[rar]; r=int(w*0.09); bd_=max(4,int(w*0.035))
    C=Image.new('RGBA',(w,h),(0,0,0,0)); m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),r,fill=255)
    P=Image.new('RGBA',(w,h)); pd=ImageDraw.Draw(P)
    for y in range(h): t=y/h; pd.line((0,y,w,y),fill=(int(22-10*t),int(36-16*t),int(78-34*t),255))
    cx,cy=w/2,h*0.42; R_=Image.new('L',(w,h),0); rd=ImageDraw.Draw(R_)
    for k in range(14):
        an=k*math.pi/7; rd.polygon([(cx,cy),(cx+math.cos(an)*w,cy+math.sin(an)*w),(cx+math.cos(an+0.2)*w,cy+math.sin(an+0.2)*w)],fill=70)
    gl=Image.new('L',(w,h),0); ImageDraw.Draw(gl).ellipse((cx-w*0.36,cy-w*0.36,cx+w*0.36,cy+w*0.36),fill=150); gl=gl.filter(ImageFilter.GaussianBlur(w*0.10))
    fade=Image.new('L',(w,h),0); ImageDraw.Draw(fade).ellipse((cx-w*0.7,cy-w*0.7,cx+w*0.7,cy+w*0.7),fill=255); fade=fade.filter(ImageFilter.GaussianBlur(w*0.2))
    R_=Image.fromarray((np.maximum(np.asarray(R_),np.asarray(gl)).astype(float)*np.asarray(fade)/255).astype('uint8'))
    P.paste(rc+(255,),(0,0),R_); C.paste(P,(0,0),m)
    a=Image.open(f'kitart/{item}.webp').convert('RGBA'); sc=min(w*0.70/a.width,h*0.56/a.height); a=a.resize((int(a.width*sc),int(a.height*sc)),Image.LANCZOS)
    C.alpha_composite(a,(int(cx-a.width/2),int(cy-a.height/2)))
    d=ImageDraw.Draw(C); f=F(w*0.12); tw=f.getlength(name)
    if tw>w*0.9: f=F(w*0.12*w*0.9/tw); tw=f.getlength(name)
    d.text(((w-tw)/2,int(h*0.76)),name,font=f,fill=rc,stroke_width=max(2,int(w*0.014)),stroke_fill=(5,10,20))
    f2=F(w*0.07); lab=rar.upper(); t2=f2.getlength(lab); d.text(((w-t2)/2,int(h*0.885)),lab,font=f2,fill=(205,215,240))
    # NEW ITEM pill
    f3=F(w*0.08); t3='NEW ITEM'; w3=f3.getlength(t3); pw,ph=int(w3+w*0.14),int(w*0.13)
    O_=Image.new('RGBA',(w+2*bd_,h+2*bd_+ph//2),(0,0,0,0)); od=ImageDraw.Draw(O_)
    od.rounded_rectangle((0,ph//2,O_.width-1,O_.height-1),r+bd_,fill=(255,201,58,255)); O_.alpha_composite(C,(bd_,bd_+ph//2))
    od.rounded_rectangle(((O_.width-pw)//2,0,(O_.width+pw)//2,ph),int(ph*0.35),fill=(255,214,90,255),outline=(5,10,20,255),width=max(2,int(w*0.012)))
    od.text(((O_.width-w3)/2,ph*0.12),t3,font=f3,fill=(58,35,0))
    return O_.rotate(ang,Image.BICUBIC,expand=True)
def chip(im,t1,t2,cx,cy,s=0.036):
    f=F(W*s); w1=f.getlength(t1); w2=f.getlength(t2); aw=int(W*s*1.3); bh=int(W*s*1.9); bw=int(w1+w2+aw+W*s*2.0)
    T=Image.new('RGBA',(bw,bh),(0,0,0,0)); d=ImageDraw.Draw(T); d.rounded_rectangle((0,0,bw-1,bh-1),bh//2,fill=(34,197,94,255),outline=(8,40,20,255),width=int(5*K))
    x=W*s*0.7; d.text((x,bh*0.15),t1,font=f,fill=(255,255,255),stroke_width=int(3*K),stroke_fill=(8,40,20)); x+=w1+W*s*0.3
    my=bh/2; d.polygon([(x,my-bh*0.09),(x+aw*0.55,my-bh*0.09),(x+aw*0.55,my-bh*0.2),(x+aw,my),(x+aw*0.55,my+bh*0.2),(x+aw*0.55,my+bh*0.09),(x,my+bh*0.09)],fill=(255,226,122),outline=(8,40,20))
    x+=aw+W*s*0.3; d.text((x,bh*0.15),t2,font=f,fill=(255,226,122),stroke_width=int(3*K),stroke_fill=(8,40,20))
    drop(im,T,int(cx-bw/2),int(cy-bh/2),blur=int(10*K),off=(0,int(8*K)),a=0.5)
def chip(im,t1,t2,cx,cy,s=0.036):
    f=F(W*s); w1=f.getlength(t1); w2=f.getlength(t2); aw=int(W*s*1.3); bh=int(W*s*1.9); bw=int(w1+w2+aw+W*s*2.0)
    T=Image.new('RGBA',(bw,bh),(0,0,0,0)); d=ImageDraw.Draw(T); d.rounded_rectangle((0,0,bw-1,bh-1),bh//2,fill=(34,197,94,255),outline=(8,40,20,255),width=int(5*K))
    x=W*s*0.7; d.text((x,bh*0.15),t1,font=f,fill=(255,255,255),stroke_width=int(3*K),stroke_fill=(8,40,20)); x+=w1+W*s*0.3
    my=bh/2; d.polygon([(x,my-bh*0.09),(x+aw*0.55,my-bh*0.09),(x+aw*0.55,my-bh*0.2),(x+aw,my),(x+aw*0.55,my+bh*0.2),(x+aw*0.55,my+bh*0.09),(x,my+bh*0.09)],fill=(255,226,122),outline=(8,40,20))
    x+=aw+W*s*0.3; d.text((x,bh*0.15),t2,font=f,fill=(255,226,122),stroke_width=int(3*K),stroke_fill=(8,40,20))
    drop(im,T,int(cx-bw/2),int(cy-bh/2),blur=int(10*K),off=(0,int(8*K)),a=0.5)
import os
ZM=float(os.environ.get('ZM','1')); BB=float(os.environ.get('BB','0.886'))
b_=Image.open('bg3/locker5.png').convert('RGB'); sc_=W*ZM/b_.width; b_=b_.resize((int(W*ZM),int(b_.height*sc_)),Image.LANCZOS)
if ZM>1: b_=b_.crop(((b_.width-W)//2,0,(b_.width-W)//2+W,b_.height))
oy_=int(H*BB-b_.height*0.80)
col_=tuple(int(v) for v in np.asarray(b_.crop((0,0,W,int(b_.height*0.012)))).reshape(-1,3).mean(0))
base_=Image.new('RGB',(W,H),col_); mk_=Image.new('L',(1,256)); [mk_.putpixel((0,y),int(255*(y/255)**1.2)) for y in range(256)]
mk_=mk_.resize((W,int(b_.height*0.08))); fm_=Image.new('L',b_.size,255); fm_.paste(mk_,(0,0)); base_.paste(b_,(0,oy_),fm_)
base_.save(f'{OUT}/_lk.png'); im=scene(f'{OUT}/_lk.png',True)
top=head(im,'UNLOCK','LEGENDARY KIT','Win bags. Unlock rare bats, gloves and more.')

tall=H/W>2.1; k=1 if tall else 0.88
mouth=(W*0.50, oy_+b_.height*0.53)
ys=0 if tall else 0.012
cards=[('bat_diamond','THE DIAMOND','legendary',0.52,0.355,0.33,-5),
       ('helmet_eagle','THE HAWK-EYE','rare',0.19,0.49,0.24,-16),
       ('bat_maestro','THE PHOENIX','epic',0.82,0.48,0.24,13)]
for it,nm,rr,cx,cy,wf,ang in cards:
    T=kcard(it,nm,rr,wf*k,ang); drop(im,T,int(W*cx-T.width/2),int(H*(cy+ys)-T.height/2),blur=int(24*K),off=(0,int(20*K)),a=0.62)
# tilted chip
L2=Image.new('RGBA',im.size,(0,0,0,0)); chip(L2,'POWER 30','88',W*0.55,H*(0.355+ys)+int(W*0.33*k*1.30*0.5)+int(H*0.04),0.038)
bb=L2.getbbox(); piece=L2.crop(bb).rotate(4,Image.BICUBIC,expand=True); im.alpha_composite(piece,(bb[0]-(piece.width-(bb[2]-bb[0]))//2,bb[1]-(piece.height-(bb[3]-bb[1]))//2))
im.convert('RGB').save(f"{OUT}/06_kit2{os.environ.get('TAG','')}.png"); print('ok')
