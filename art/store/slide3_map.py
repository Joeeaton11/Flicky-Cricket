import sys,random
exec(open('blend3.py').read().split("A=(0,0,1,1)")[0])
from PIL import ImageEnhance
def headline(im,l1,l2,sub=None):
    y=int(H*0.045)
    for txt,cols in [(l1,((255,255,255),(205,228,255))),(l2,((255,226,122),(244,163,10)))]:
        L=word(txt,W*0.13,*cols,W*0.9); drop(im,L,(W-L.width)//2,y,blur=int(8*K),off=(0,int(12*K)),a=0.7); y+=int(L.height*0.78)
    if sub:
        d=ImageDraw.Draw(im); fs=F(W*0.045); d.text(((W-fs.getlength(sub))/2,y+int(6*K)),sub,font=fs,fill=(255,248,225),stroke_width=int(6*K),stroke_fill=(5,10,20)); y+=int(W*0.07)
    return y
def cup(i,h):
    c=Image.open(f'cups/lg_{i}_cup.webp').convert('RGBA'); c=c.crop(c.getbbox()); return c.resize((int(c.width*h/c.height),int(h)),Image.LANCZOS)
def shelf(im,y,x0,x1):
    d=ImageDraw.Draw(im); t=int(26*K)
    d.rounded_rectangle((x0,y,x1,y+t),int(8*K),fill=(122,72,30)); d.rectangle((x0,y,x1,y+int(8*K)),fill=(212,150,70)); d.rectangle((x0,y+t-int(6*K),x1,y+t),fill=(70,38,14))
    sh=Image.new('L',im.size); ImageDraw.Draw(sh).rectangle((x0,y+t,x1,y+t+int(40*K)),fill=90); sh=sh.filter(ImageFilter.GaussianBlur(14*K)); im.paste((0,0,0),(0,0),sh)
def row(im,ids,y,x0,x1,h):
    shelf(im,y,x0,x1); n=len(ids)
    for k,i in enumerate(ids):
        c=cup(i,h); cx=x0+(x1-x0)*(k+0.5)/n
        gl=Image.new('L',im.size); ImageDraw.Draw(gl).ellipse((cx-h*0.55,y-h*0.95,cx+h*0.55,y),fill=110); gl=gl.filter(ImageFilter.GaussianBlur(30*K)); im.paste((255,200,90),(0,0),gl)
        im.alpha_composite(c,(int(cx-c.width/2),int(y-c.height+6*K)))

def hero(im,ids,hs,y,x0,x1,sh=True):
    if sh: shelf(im,y,x0,x1)
    n=len(ids)
    for k,(i,h) in enumerate(zip(ids,hs)):
        c=cup(i,h); cx=x0+(x1-x0)*(k+0.5)/n
        gl=Image.new('L',im.size); ImageDraw.Draw(gl).ellipse((cx-h*0.6,y-h*1.0,cx+h*0.6,y+h*0.05),fill=130); gl=gl.filter(ImageFilter.GaussianBlur(40*K)); im.paste((255,200,90),(0,0),gl)
        drop(im,c,int(cx-c.width/2),int(y-c.height+6*K),blur=int(16*K),off=(0,int(10*K)),a=0.45)

def cover(path,blur=0,dark=0.0):
    b=Image.open(path).convert('RGB'); sc=max(W/b.width,H/b.height); b=b.resize((int(b.width*sc)+1,int(b.height*sc)+1),Image.LANCZOS)
    b=b.crop(((b.width-W)//2,(b.height-H)//2,(b.width-W)//2+W,(b.height-H)//2+H))
    if blur: b=b.filter(ImageFilter.GaussianBlur(blur*K))
    if dark: b=ImageEnhance.Brightness(b).enhance(1-dark)
    im=b.convert('RGBA')
    g=Image.new('L',(1,256)); [g.putpixel((0,y),int(170*max(0,1-y/255)**1.6)) for y in range(256)]
    g=g.resize((W,int(H*0.30))); top=Image.new('RGBA',(W,H),(0,0,0,0)); m=Image.new('L',(W,H)); m.paste(g,(0,0)); top.putalpha(m); im.alpha_composite(Image.new('RGBA',(W,H),(6,14,36,255)).crop((0,0,W,H)) if False else top)
    return im
def place(im,ids,hs,xs,ys):
    for i,h,x,y in zip(ids,hs,xs,ys):
        c=cup(i,h)
        gl=Image.new('L',im.size); ImageDraw.Draw(gl).ellipse((x-h*0.55,y-h*0.95,x+h*0.55,y),fill=110); gl=gl.filter(ImageFilter.GaussianBlur(40*K)); im.paste((255,200,90),(0,0),gl)
        drop(im,c,int(x-c.width/2),int(y-c.height+4*K),blur=int(16*K),off=(0,int(10*K)),a=0.5)
def card(im,w,y):
    C=floating('r9.png',(0.02,0.37,0.98,0.815),w,0,0); drop(im,C,int(W/2-C.width/2),int(y),blur=int(28*K),off=(0,int(24*K)),a=0.65); return C.height

m=Image.open('bg3/map2.png').convert('RGB'); m=m.crop((0,8,m.width,m.height)); sc=W/m.width; m=m.resize((W,int(m.height*sc)),Image.LANCZOS)
oy=H-m.height
im=Image.new('RGB',(W,H))
# top fill: stretch the plain ocean strip at the very top of the map
import numpy as np
col=tuple(int(v) for v in np.asarray(m.crop((0,0,W,int(m.height*0.02)))).reshape(-1,3).mean(0))
im=Image.new('RGB',(W,H),col)

mask=Image.new('L',(1,256)); [mask.putpixel((0,y),int(255*(y/255)**1.3)) for y in range(256)]
mask=mask.resize((W,int(m.height*0.20))); full=Image.new('L',m.size,255); full.paste(mask,(0,0))
im.paste(m,(0,oy),full)
im=im.convert('RGBA')
g=Image.new('L',(1,256)); [g.putpixel((0,y),int(150*max(0,1-y/255)**1.5)) for y in range(256)]
g=g.resize((W,int(H*0.30))); mm=Image.new('L',(W,H)); mm.paste(g,(0,0)); im.paste((4,10,30),(0,0),mm)
top=headline(im,'27 LEAGUES','PLAY THE WORLD')
C=floating('r9.png',(0.02,0.37,0.98,0.815),0.73,0,0)
a,b=oy+int(m.height*0.25),oy+int(m.height*0.76)
y=a+(b-a-C.height)//2
drop(im,C,int(W/2-C.width/2),y,blur=int(28*K),off=(0,int(24*K)),a=0.6)
im.convert('RGB').save(f'{OUT}/S6_map2.png'); print(oy/H, C.height/H)
