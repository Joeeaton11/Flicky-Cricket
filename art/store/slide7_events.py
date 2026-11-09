import sys
exec(open('blend3.py').read().split("A=(0,0,1,1)")[0])
def head(im,l1,l2,sub=None):
    y=int(H*0.045)
    for txt,cols in [(l1,((255,255,255),(205,228,255))),(l2,((255,226,122),(244,163,10)))]:
        L=word(txt,W*0.13,*cols,W*0.9); drop(im,L,(W-L.width)//2,y,blur=int(8*K),off=(0,int(12*K)),a=0.7); y+=int(L.height*0.78)
    if sub:
        d=ImageDraw.Draw(im); fs=F(W*0.045); d.text(((W-fs.getlength(sub))/2,y+int(6*K)),sub,font=fs,fill=(255,248,225),stroke_width=int(6*K),stroke_fill=(5,10,20)); y+=int(W*0.07)
    return y
def evcard(src,title,sub,tag,wf,ang,crop=(0,0.04,1,0.96)):
    a=Image.open(src).convert('RGB'); a=a.crop((int(a.width*crop[0]),int(a.height*crop[1]),int(a.width*crop[2]),int(a.height*crop[3])))
    w=int(W*wf); a=a.resize((w,int(a.height*w/a.width)),Image.LANCZOS).convert('RGBA'); h=a.height
    g=Image.new('L',(1,256)); [g.putpixel((0,y),int(235*max(0,(y-120)/135)**1.4)) for y in range(256)]
    sh=Image.new('RGBA',(w,h),(6,12,32,255)); sh.putalpha(g.resize((w,h))); a.alpha_composite(sh)
    d=ImageDraw.Draw(a); f=F(w*0.095); d.text((int(w*0.05),int(h*0.70)),title,font=f,fill=(255,255,255),stroke_width=int(w*0.008),stroke_fill=(5,10,20))
    f2=F(w*0.042); d.text((int(w*0.055),int(h*0.70+w*0.105)),sub,font=f2,fill=(255,201,58),stroke_width=int(w*0.004),stroke_fill=(5,10,20))
    if tag:
        f3=F(w*0.038); tw=f3.getlength(tag); ph=int(w*0.075); pw=int(tw+w*0.06); x0=w-pw-int(w*0.035); y0=int(w*0.035)
        d.rounded_rectangle((x0,y0,x0+pw,y0+ph),ph//2,fill=(12,24,56,235),outline=(255,201,58,255),width=max(2,int(w*0.005))); d.text((x0+w*0.03,y0+ph*0.14),tag,font=f3,fill=(255,214,90))
    r=int(w*0.05); m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),r,fill=255); a.putalpha(m)
    b=int(w*0.014); O=Image.new('RGBA',(w+2*b,h+2*b),(0,0,0,0)); ImageDraw.Draw(O).rounded_rectangle((0,0,O.width-1,O.height-1),r+b,fill=(255,201,58,255)); O.alpha_composite(a,(b,b))
    return O.rotate(ang,Image.BICUBIC,expand=True)
tall=H/W>2.1
im=scene('bg/b1.png'); top=head(im,'NEW EVENTS','EVERY FEW WEEKS','Themed cups, exclusive kit and prizes.')
wf=0.66 if tall else 0.57
ys=[0.345,0.525,0.705,0.885] if tall else [0.35,0.525,0.70,0.875]
cards=[('evart4/summer.png','SUMMER CUP','Village green prizes',None,0.60,ys[3],4),
       ('evart4/diwali.png','DIWALI CUP','Firework sixes',None,0.40,ys[2],-4),
       ('evart4/halloween.png','HALLOWEEN CUP','Spooky kit and grounds',None,0.60,ys[1],4),
       ('evart4/xmas.png','CHRISTMAS CUP','Win the Christmas jumper kit','EVENT',0.40,ys[0],-4)]
for src,t,s_,tag,cx,cy,ang in cards:
    C=evcard(src,t,s_,tag,wf,ang); drop(im,C,int(W*cx-C.width/2),int(H*cy-C.height/2),blur=int(26*K),off=(0,int(20*K)),a=0.6)
im.convert('RGB').save(f'{OUT}/07_t4.png'); print('ok')
