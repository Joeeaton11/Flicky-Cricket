import asyncio,base64,io,math,json,sys
from playwright.async_api import async_playwright
from PIL import Image
RUN=[round(2.25+i*(1.0/24),4) for i in range(24)]          # 2.25 .. 3.21, real speed over 1 s
REL=[3.25]
FOL=[round(3.25+0.05*(i+1),4) for i in range(21)]         # 3.30 .. 4.30, real speed
SEQ=[('run%d'%i,t) for i,t in enumerate(RUN)]+[('rel',3.25)]+[('fol%d'%i,t) for i,t in enumerate(FOL)]+[('stand',0.0)]
AZ,EL,R,FOV=90,40,950,18   # Nov 2: front-on, looking down like the game camera; 90 puts his on-screen run at ~11° (in past the umpire), body and path agree
async def render(mode):
    mask = mode == 'mask'
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader']); pg=await b.new_page(viewport={'width':360,'height':480})
        await pg.goto('http://localhost:8765/bowl.html?w=360&h=480'+({'mask':'&mask','normal':'&pass=normal','depth':'&pass=depth'}.get(mode,''))); await pg.wait_for_function('window.READY',timeout=180000)
        if mode == 'depth': await pg.evaluate(f'window.CAMNF=[{R-260},{R+260}]')
        out=[]; meta={}
        FF=await pg.evaluate('(()=>{const p=JSON.parse(prepLock()).Left.find(l=>l.t0<3.25&&l.t1>3.25).p; return [p.x,p.y,0]})()') if mode=='color' else None   # front-foot landing spot (toe), world-fixed
        for n,t in SEQ:
            h=await pg.evaluate(f'pose({t})'); ax,ay=h[0],h[1]
            C=[ax+R*math.cos(math.radians(AZ))*math.cos(math.radians(EL)), ay+R*math.sin(math.radians(AZ))*math.cos(math.radians(EL)), 85+R*math.sin(math.radians(EL))]
            d=await pg.evaluate(f'cam({json.dumps(C)},[{ax},{ay},85],{FOV})')
            out.append((n,Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA')))
            if mode == 'color':
                pts=await pg.evaluate(f"proj({json.dumps(C)},[{ax},{ay},85],{FOV},[[{ax},{ay},0],bpos('RightHand'),bpos('Head'),[{ax},{ay},175],{json.dumps(FF)}])")
                meta[n]=pts
        await b.close(); return out,meta
async def main():
    import asyncio as A
    (col,meta),(msk,_),(nor,_),(dep,_)=await A.gather(render('color'),render('mask'),render('normal'),render('depth'))
    json.dump({'seq':SEQ,'meta':meta},open('bowl_meta.json','w'))
    for (n,c),(_,m),(_,nn),(_,dd) in zip(col,msk,nor,dep): c.save(f'bw_{n}.png'); m.save(f'bm_{n}.png'); nn.save(f'bn_{n}.png'); dd.save(f'bd_{n}.png')
    print(meta['stand'], meta['rel'])
asyncio.run(main())
