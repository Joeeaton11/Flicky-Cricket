import sys
exec(open('blend3.py').read().split("A=(0,0,1,1)")[0])
import numpy as np
DW=Image.open('dw.png').convert('RGB'); dw,dh=DW.size
def icon(x0,x1,y0,y1):
    c=DW.crop((int(dw*x0),int(dh*y0),int(dw*x1),int(dh*y1))); a=np.asarray(c).astype(float)
    lum=a.mean(2); sat=a.max(2)-a.min(2)
    al=np.clip((np.maximum(lum-34,sat-22))*5,0,255)
    m=Image.fromarray(al.astype('uint8')).filter(ImageFilter.GaussianBlur(1))
    o=c.convert('RGBA'); o.putalpha(m); return o.crop(o.getbbox())
ICONS=[icon(100/660,218/660,0.492,0.545),icon(272/660,390/660,0.498,0.545),icon(440/660,545/660,0.495,0.545)]
def card(cw):
    s=cw/1000; ch=int(860*s); C=Image.new('RGBA',(cw,ch),(0,0,0,0)); d=ImageDraw.Draw(C)
    g=Image.new('RGBA',(cw,ch)); gd=ImageDraw.Draw(g)
    for y in range(ch): t=y/ch; gd.line((0,y,cw,y),fill=(int(26-10*t),int(44-18*t),int(96-40*t),255))
    m=Image.new('L',(cw,ch),0); ImageDraw.Draw(m).rounded_rectangle((0,0,cw-1,ch-1),int(48*s),fill=255); C.paste(g,(0,0),m)
    T=word('DUEL WON!',cw*0.13,(255,226,122),(244,163,10),cw*0.8); drop(C,T,(cw-T.width)//2,int(40*s),blur=int(6*s),off=(0,int(8*s)),a=0.6)
    def tile(x,col,dark,name,flag,runs,wk,win):
        tw,th=int(380*s),int(200*s); y=int(230*s)
        if win: d.rounded_rectangle((x-int(10*s),y-int(10*s),x+tw+int(10*s),y+th+int(20*s)),int(40*s),fill=(255,201,58))
        d.rounded_rectangle((x,y,x+tw,y+th+int(10*s)),int(32*s),fill=dark); d.rounded_rectangle((x,y,x+tw,y+th),int(32*s),fill=col)
        fh=int(50*s); bd=Image.open(f'kitart/{flag}.webp').convert('RGBA'); bd=bd.resize((int(bd.width*fh/bd.height),fh),Image.LANCZOS)
        sh=Image.new('RGBA',bd.size,(0,0,0,0)); sh.putalpha(bd.split()[3].point(lambda v:int(v*0.45))); C.alpha_composite(sh,(0,0)) if False else None
        f=F(38*s); nw=f.getlength(name); gap=int(14*s); tot=bd.width+gap+nw; x0=x+(tw-tot)/2
        tb=f.getbbox(name); ty=y+int(46*s)-(tb[1]+tb[3])/2
        C.alpha_composite(bd,(int(x0),int(y+int(46*s)-bd.height/2)))
        d.text((x0+bd.width+gap,ty),name,font=f,fill=(255,255,255),stroke_width=int(3*s),stroke_fill=(10,20,50))
        fr=F(110*s); rt=str(runs); wt='/'+str(wk); fw=F(56*s)
        tot=fr.getlength(rt)+fw.getlength(wt); x1=x+(tw-tot)/2
        d.text((x1,y+int(68*s)),rt,font=fr,fill=(255,255,255),stroke_width=int(5*s),stroke_fill=(10,20,50))
        d.text((x1+fr.getlength(rt),y+int(112*s)),wt,font=fw,fill=(225,235,255),stroke_width=int(4*s),stroke_fill=(10,20,50))
    tile(int(70*s),(52,110,232),(30,64,160),'PLAYER 1','gb',27,1,True)
    tile(int(550*s),(226,58,58),(150,30,36),'PLAYER 2','in',24,0,False)
    fv=F(50*s); d.text(((cw-fv.getlength('v'))/2,int(300*s)),'v',font=fv,fill=(205,215,240))
    f=F(46*s); t='Won by 3 runs'; d.text(((cw-f.getlength(t))/2,int(475*s)),t,font=f,fill=(255,255,255),stroke_width=int(3*s),stroke_fill=(10,20,50))
    for i,(ic,big,small) in enumerate(zip(ICONS,['450','SILVER','+30'],['COINS','BAG','TROPHIES'])):
        x=int((90+i*285)*s); y=int(560*s); tw,th=int(250*s),int(260*s)
        d.rounded_rectangle((x,y,x+tw,y+th),int(28*s),fill=(14,26,60),outline=(255,201,58),width=max(2,int(4*s)))
        ih=int(110*s); ii=ic.resize((int(ic.width*ih/ic.height),ih),Image.LANCZOS)
        if ii.width>tw*0.8: ii=ic.resize((int(tw*0.8),int(ic.height*tw*0.8/ic.width)),Image.LANCZOS)
        C.alpha_composite(ii,(x+(tw-ii.width)//2,y+int(20*s)+(ih-ii.height)//2))
        fb=F(56*s); d.text((x+(tw-fb.getlength(big))/2,y+int(140*s)),big,font=fb,fill=(255,214,90),stroke_width=int(3*s),stroke_fill=(10,20,50))
        fs=F(30*s); d.text((x+(tw-fs.getlength(small))/2,y+int(206*s)),small,font=fs,fill=(205,215,240))
    return C
