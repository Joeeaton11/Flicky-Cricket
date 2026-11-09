import sys,math
exec(open('blend3.py').read().split("A=(0,0,1,1)")[0])
import numpy as np
CR=(0,0,1,0.80)
ROAD=[(585,198),(640,240),(660,262),(640,290),(560,318),(487,340),(470,360),(481,380),(533,400),(561,420),(574,440),(560,460),(506,480),(416,500),(360,520),(342,540),(344,560),(371,580),(415,600),(465,620),(496,640),(541,660),(559,680),(571,700),(574,720),(570,740),(548,760),(502,780),(435,800),(380,820),(352,840),(341,860),(373,880),(418,900),(448,920),(474,940),(492,960),(504,980),(502,1000),(492,1020),(488,1040),(457,1060),(421,1080),(361,1100),(320,1120),(306,1145),(304,1175),(330,1215)]
def head(im,l1,l2):
    y=int(H*0.045)
    for txt,cols in [(l1,((255,255,255),(205,228,255))),(l2,((255,226,122),(244,163,10)))]:
        L=word(txt,W*0.13,*cols,W*0.9); drop(im,L,(W-L.width)//2,y,blur=int(8*K),off=(0,int(12*K)),a=0.7); y+=int(L.height*0.78)
    return y
def icon(kind,s):
    I=Image.new('RGBA',(s,s),(0,0,0,0)); d=ImageDraw.Draw(I); g=(255,214,90,255); w=max(2,int(s*0.09))
    if kind=='sun':
        c=s/2; d.ellipse((c-s*0.2,c-s*0.2,c+s*0.2,c+s*0.2),fill=g)
        for k in range(8):
            a=k*math.pi/4; d.line((c+math.cos(a)*s*0.3,c+math.sin(a)*s*0.3,c+math.cos(a)*s*0.45,c+math.sin(a)*s*0.45),fill=g,width=w)
    elif kind=='tower':
        d.rectangle((s*0.36,s*0.30,s*0.64,s*0.95),fill=g); d.polygon([(s*0.30,s*0.32),(s*0.5,s*0.04),(s*0.70,s*0.32)],fill=g)
        d.ellipse((s*0.41,s*0.40,s*0.59,s*0.58),fill=(12,24,56,255))
    else:
        d.ellipse((s*0.1,s*0.1,s*0.9,s*0.9),fill=g); d.ellipse((s*0.32,s*0.0,s*1.05,s*0.75),fill=(0,0,0,0))
    return I
def tag(im,txt,kind,cx,y,s=0.040):
    f=F(W*s); tw=f.getlength(txt); ph=int(W*s*1.6); ic=int(ph*0.72); pw=int(tw+ic+W*s*1.6)
    T=Image.new('RGBA',(pw,ph),(0,0,0,0)); d=ImageDraw.Draw(T)
    d.rounded_rectangle((0,0,pw-1,ph-1),ph//2,fill=(12,24,56,255),outline=(255,201,58,255),width=max(2,int(5*K)))
    T.alpha_composite(icon(kind,ic),(int(W*s*0.55),(ph-ic)//2))
    d.text((int(W*s*0.55)+ic+int(W*s*0.25),ph*0.17),txt,font=f,fill=(255,214,90))
    drop(im,T,int(cx-pw/2),int(y),blur=int(10*K),off=(0,int(8*K)),a=0.55)
def dots(im,P,r,step,col=(255,214,90)):
    L=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(L); acc=step; last=P[0]
    dense=[]
    for (x0,y0),(x1,y1) in zip(P,P[1:]):
        n=max(1,int(math.dist((x0,y0),(x1,y1))/2))
        for t in range(n): dense.append((x0+(x1-x0)*t/n,y0+(y1-y0)*t/n))
    for p in dense:
        acc+=math.dist(last,p); last=p
        if acc>=step: acc=0; d.ellipse((p[0]-r,p[1]-r,p[0]+r,p[1]+r),fill=col+(255,))
    g=L.filter(ImageFilter.GaussianBlur(r*1.4)); im.alpha_composite(g); im.alpha_composite(g); im.alpha_composite(L)
def ball(im,x,y,r):
    B=Image.new('RGBA',(int(r*6),int(r*6)),(0,0,0,0)); c=r*3
    gl=Image.new('L',B.size); ImageDraw.Draw(gl).ellipse((c-r*2.2,c-r*2.2,c+r*2.2,c+r*2.2),fill=200); gl=gl.filter(ImageFilter.GaussianBlur(r*0.8)); B.paste((255,210,90,255),(0,0),gl)
    d=ImageDraw.Draw(B); d.ellipse((c-r,c-r,c+r,c+r),fill=(200,30,36,255),outline=(120,10,16,255),width=max(1,int(r*0.08)))
    d.arc((c-r*0.55,c-r*1.1,c+r*1.6,c+r*1.1),120,240,fill=(255,240,225,255),width=max(2,int(r*0.12)))
    d.ellipse((c-r*0.55,c-r*0.6,c-r*0.15,c-r*0.25),fill=(255,150,150,200))
    im.alpha_composite(B,(int(x-c),int(y-c)))
def pill(im,txt,cx,cy,s=0.036):
    f=F(W*s); tw=f.getlength(txt); ph=int(W*s*1.7); pw=int(tw+W*s*1.6)
    T=Image.new('RGBA',(pw,ph),(0,0,0,0)); d=ImageDraw.Draw(T)
    d.rounded_rectangle((0,0,pw-1,ph-1),ph//2,fill=(255,201,58,255),outline=(12,24,56,255),width=max(2,int(5*K)))
    d.text(((pw-tw)/2,ph*0.18),txt,font=f,fill=(40,22,0))
    drop(im,T,int(cx-pw/2),int(cy-ph/2),blur=int(10*K),off=(0,int(8*K)),a=0.55)

src=Image.open('bg3/road2.png').convert('RGB'); sc=W/src.width; src=src.resize((W,int(src.height*sc)),Image.LANCZOS); oy=H-src.height
col=tuple(int(v) for v in np.asarray(src.crop((0,0,W,int(src.height*0.015)))).reshape(-1,3).mean(0))
im=Image.new('RGB',(W,H),col)
mask=Image.new('L',(1,256)); [mask.putpixel((0,y),int(255*(y/255)**1.3)) for y in range(256)]
mask=mask.resize((W,int(src.height*0.10))); full=Image.new('L',src.size,255); full.paste(mask,(0,0)); im.paste(src,(0,oy),full)
im=im.convert('RGBA')
# a few stars in the extended sky
rnd=__import__('random').Random(4); d=ImageDraw.Draw(im)
for _ in range(70):
    x=rnd.random()*W; y=rnd.random()*(oy+src.height*0.05); r=rnd.choice([1,1,1.5,2])*K*1.6; d.ellipse((x-r,y-r,x+r,y+r),fill=(255,255,240,int(150+rnd.random()*100)))
g=Image.new('L',(1,256)); [g.putpixel((0,y),int(120*max(0,1-y/255)**1.5)) for y in range(256)]
g=g.resize((W,int(H*0.24))); mm=Image.new('L',(W,H)); mm.paste(g,(0,0)); im.paste((4,8,24),(0,0),mm)
P=[(x*sc,oy+y*sc) for x,y in ROAD]
dots(im,P,int(8*K),int(30*K))
head(im,'120+ GROUNDS','BEACH TO THE MOON')
# phones: (shot, label, icon, cx, centre-y in source px, angle)
pw=W*(0.37 if H/W>2.1 else 0.33)
for f,lab,kind,cx,syc,ang in [('act_tc_beach_380.png','THE BEACH','sun',0.24,1270,5),("act_tl_lords_380.png","ST JOHN'S WOOD",'tower',0.76,850,-5),('act_tco_moon_380.png','MOON BASE','moon',0.25,470,5)]:
    Pp=phone(f,CR,pw,H).rotate(ang,Image.BICUBIC,expand=True)
    y=int(oy+syc*sc-Pp.height/2); y=min(y,H-Pp.height-int(H*0.035))
    drop(im,Pp,int(W*cx-Pp.width/2),y,blur=int(26*K),off=(0,int(22*K)),a=0.62)
    tag(im,lab,kind,W*cx,y+Pp.height-int(H*0.022))
# ball on the road between beach and London
bx,by=P[34]; ball(im,bx,by,int(22*K))
pill(im,'+117 MORE',W*0.80,oy+src.height*0.215)
im.convert('RGB').save(f'{OUT}/04_95.png'); print(oy/H)
