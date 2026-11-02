import json,sys
from PIL import Image, ImageEnhance
import numpy as np
from outline2d import add_outline
M=json.load(open('bowl_meta.json')); SEQ=M['seq']; meta=M['meta']
SHIRT=(236,234,226); TROU=(118,30,46)
T={1:SHIRT,10:TROU}
cols=[np.asarray(Image.open(f'bw_{n}.png').convert('RGBA')).astype(np.float32) for n,_ in SEQ]
msks=[np.asarray(Image.open(f'bm_{n}.png').convert('RGBA')) for n,_ in SEQ]
def cls(m): c=np.clip(np.round((m[...,0].astype(np.float32)-8)/16),0,13).astype(int); c[m[...,3]<128]=0; return c
L=lambda a: a[...,0]*.3+a[...,1]*.59+a[...,2]*.11
avg={}
for k in T:
    s=0;n=0
    for c,m in zip(cols,msks):
        sel=(cls(m)==k)&(c[...,3]>10); s+=L(c)[sel].sum(); n+=sel.sum()
    avg[k]=s/max(1,n)
print('avg',avg)
outs=[]
for c,m in zip(cols,msks):
    o=c.copy(); cl=cls(m); l=L(c)
    blu=(c[...,2]>c[...,0]+10)&(c[...,2]>=c[...,1]-2)&(c[...,3]>10)&(cl!=10); cl[blu]=1
    for k,t in T.items():
        sel=(cl==k)&(c[...,3]>10); r=(l/avg[k])
        if k==1: r=0.72+0.28*r          # white cloth: keep it white, soften the shading
        for ch in range(3): o[...,ch][sel]=np.minimum(255,t[ch]*r[sel])
    outs.append(Image.fromarray(o.astype(np.uint8),'RGBA'))
bb=[im.getbbox() for im in outs]; x0=min(b[0] for b in bb)-16; y0=min(b[1] for b in bb)-16; x1=max(b[2] for b in bb)+16; y1=max(b[3] for b in bb)+16
gx,gy=meta['stand'][0]; top=meta['stand'][3][1]; k=190/(gy-top)
print('crop',x0,y0,x1,y1,'k',k)
W=round((x1-x0)*k); H=round((y1-y0)*k)
res={}
import base64,io
for (n,_),im in zip(SEQ,outs):
    s=im.crop((x0,y0,x1,y1)).resize((W,H),Image.LANCZOS)
    s=ImageEnhance.Color(s).enhance(1.12); s=ImageEnhance.Contrast(s).enhance(1.05)
    s=add_outline(s,2)
    s.save(f'bf_{n}.png'); bio=io.BytesIO(); s.save(bio,'WEBP',quality=86,method=6)
    hand=meta[n][1]
    res['b3_'+n]={'src':'data:image/webp;base64,'+base64.b64encode(bio.getvalue()).decode(),'ax':round((gx-x0)*k,1),'ay':round((gy-y0)*k,1),'k':1,'hx':round((hand[0]-x0)*k,1),'hy':round((hand[1]-y0)*k,1)}
json.dump(res,open('b3_sprites.json','w'))
print(W,H,sum(len(v['src']) for v in res.values())//1024,'KB', res['b3_rel']['hx'],res['b3_rel']['hy'],res['b3_rel']['ax'],res['b3_rel']['ay'])
# contact sheet
sh=Image.new('RGBA',(W*14,H*2),(222,170,110,255))
for i,(n,_) in enumerate(SEQ[:28]):
    im=Image.open(f'bf_{n}.png'); sh.alpha_composite(im,((i%14)*W,(i//14)*H))
sh.convert('RGB').save('bowl_sheet.jpg')
