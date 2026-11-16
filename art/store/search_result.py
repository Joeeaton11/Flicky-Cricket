# App Store "Search Results" creative asset — 3:2, 3840x2560 (Apple spec: 1920x1280 to 3840x2560)
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageChops,ImageEnhance
W,H=3840,2560; K=W/1320*0.5
exec(open('comp5.py').read().split('def headline')[0].split('K=W/1320\n')[1])   # F, drop, word, (helpers)
exec('def card'+open('comp5.py').read().split('def card')[1].split('def art')[0])
# background: the gameplay stadium, blurred and darkened
s=Image.open('key_art/b1.png').convert('RGB')
bg=s.crop((0,int(s.height*0.08),s.width,int(s.height*0.08)+int(s.width*H/W))).resize((W,H),Image.LANCZOS).filter(ImageFilter.GaussianBlur(22))
bg=ImageEnhance.Brightness(bg).enhance(0.45).convert('RGBA')
v=Image.new('L',(W,H),0); ImageDraw.Draw(v).rectangle((0,0,int(W*0.55),H),fill=150); v=v.filter(ImageFilter.GaussianBlur(300))
bg.paste((8,14,40),(0,0),v); base=bg
# phones on the right: gameplay, with the duel result card in front
p1=card('app_store_6.9in/01',(0.125,0.222,0.874,0.96),1150,2380,-4)
drop(base,p1,int(W*0.50),int(H*0.5-p1.height/2),blur=40,off=(20,40),a=0.65)
p2=card('app_store_6.9in/02',(0.1,0.235,0.9,0.6),900,1200,5)
drop(base,p2,W-p2.width-40,int(H*0.50),blur=40,off=(20,40),a=0.7)
# headline on the left
icon=Image.open('app_store_6.9in/icon_1024.png').convert('RGBA').resize((520,520),Image.LANCZOS)
m=Image.new('L',icon.size,0); ImageDraw.Draw(m).rounded_rectangle((0,0,519,519),115,fill=255); icon.putalpha(m)
drop(base,icon,180,230,blur=30,off=(0,24),a=0.6)
d=ImageDraw.Draw(base); fn=F(150); d.text((760,330),'FLICKY',font=fn,fill=(255,255,255),stroke_width=12,stroke_fill=(12,18,40)); d.text((760,500),'CRICKET',font=F(118),fill=(255,201,58),stroke_width=10,stroke_fill=(12,18,40))
y=900; cols=[((255,255,255),(205,228,255)),((255,236,140),(255,160,20))]
for i,l in enumerate(['ONE SWIPE.','HUGE SIXES!']):
    L=word(l,300,*cols[i],1680); drop(base,L,150,y,blur=20,off=(0,28),a=0.75); y+=int(L.height*0.78)
fs=F(108); y+=40
for t in ['1v1 DUELS · 120+ GROUNDS','27 LEAGUES · 2-MINUTE MATCHES']:
    d.text((175,y),t,font=fs,fill=(255,248,225),stroke_width=10,stroke_fill=(12,18,40)); y+=150
base.convert('RGB').save('app_store_6.9in/search_result_3840x2560.png')
base.convert('RGB').resize((1200,800),Image.LANCZOS).save('/tmp/sr_prev.jpg',quality=88)
