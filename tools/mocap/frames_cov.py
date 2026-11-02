import asyncio,base64,io,math,json,re
from playwright.async_api import async_playwright
from PIL import Image, ImageOps
SEQ=[('stance',0.0)]+[(f'lift{i}',t) for i,t in enumerate([1.08,1.16,1.23,1.3])]+[(f'hit{i}',round(1.47+i*0.03,3)) for i in range(17)]
import sys
MASK='mask' in sys.argv
PASS='normal' if 'normal' in sys.argv else 'depth' if 'depth' in sys.argv else None
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader']); pg=await b.new_page(viewport={'width':1000,'height':960})
        await pg.goto('http://localhost:8765/rig.html?m=nopads&nogear&ol=0&cover=38&w=1000'+('&mask' if MASK else '')+('&pass='+PASS if PASS else '')); await pg.wait_for_function('window.READY',timeout=180000)
        if PASS=='depth': await pg.evaluate('window.CAMNF=[700,1200]')
        az,el,r=120,22,950; x=r*math.cos(math.radians(az))*math.cos(math.radians(el))-10; y=r*math.sin(math.radians(az))*math.cos(math.radians(el))+30; z=85+r*math.sin(math.radians(el))
        C=f'[{x},{y},{z}],[-10,30,85],13.5'
        await pg.evaluate('pose(0)'); feet=await pg.evaluate('footPt()')
        fr=[]; hbs=[]
        for name,t in SEQ:
            await pg.evaluate(f'pose({t})'); d=await pg.evaluate(f'cam({C})')
            im=Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA'); W=im.width
            hp=await pg.evaluate(f'proj({C}, headPts())')
            xs=[W-1-q[0] for q in hp]; ys=[q[1] for q in hp]; hbs.append([min(xs),min(ys),max(xs),max(ys)])
            fr.append((name,ImageOps.mirror(im)))
        fp=await pg.evaluate(f'proj({C}, {json.dumps(feet)})')
        await b.close()
    W=fr[0][1].width
    # back foot after mirroring: the foot that stays put (mocap left = his front foot? pick the one whose ground point barely moves) -> use stance frame lowest foot nearer the stumps (larger y on screen)
    fpm=[(W-1-q[0],q[1]) for q in fp]
    bb=[f.getbbox() for _,f in fr]; x0=min(v[0] for v in bb)-6; y0=min(v[1] for v in bb)-6; x1=max(v[2] for v in bb)+6; y1=max(v[3] for v in bb)+6
    print('feet px',[tuple(round(c) for c in q) for q in fpm],'crop',x0,y0,x1,y1)
    if MASK or PASS:
        M0=json.load(open('frames_meta.json')); x0,y0,x1,y1=M0['crop']; pre={'normal':'fn','depth':'fd'}.get(PASS,'mk')
        for (n,f) in fr: f.crop((x0,y0,x1,y1)).save(f'{pre}_{n}.png')
        return
    json.dump({'crop':[x0,y0,x1,y1],'feet':fpm,'hb':hbs,'names':[n for n,_ in fr]},open('frames_meta.json','w'))
    for (n,f),hb in zip(fr,hbs): f.crop((x0,y0,x1,y1)).save(f'fr_{n}.png')
asyncio.run(main())
