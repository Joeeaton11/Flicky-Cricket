import asyncio,base64,io,math,sys
from playwright.async_api import async_playwright
from PIL import Image, ImageOps
q=sys.argv[1] if len(sys.argv)>1 else 'nogear'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader']); pg=await b.new_page(viewport={'width':720,'height':960})
        pg.on('pageerror',lambda e: print('ERR',e))
        await pg.goto(f'http://localhost:8765/rig.html?{q}'); await pg.wait_for_function('window.READY',timeout=180000)
        az,el,r=120,22,330; x=r*math.cos(math.radians(az))*math.cos(math.radians(el))-10; y=r*math.sin(math.radians(az))*math.cos(math.radians(el))+30; z=85+r*math.sin(math.radians(el))
        fr=[]
        for i in range(24):
            t=1.08+i*0.035
            await pg.evaluate(f'pose({t})'); d=await pg.evaluate(f'cam([{x},{y},{z}],[-10,30,85],38)')
            fr.append(ImageOps.mirror(Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA')))
        await b.close()
    bb=[f.getbbox() for f in fr]; x0=min(v[0] for v in bb)-12; y0=min(v[1] for v in bb)-12; x1=max(v[2] for v in bb)+12; y1=max(v[3] for v in bb)+12
    fr=[f.crop((x0,y0,x1,y1)) for f in fr]; print('frame px',fr[0].size)
    bg=Image.new('RGBA',fr[0].size,(84,140,72,255)); out=[]
    for f in fr: g=bg.copy(); g.alpha_composite(f); out.append(g.convert('RGB'))
    sm=[o.resize((o.width//2,o.height//2),Image.LANCZOS) for o in out]
    seq=[sm[0]]*8+sm+[sm[-1]]*8; seq[0].save(f'big_{q}.gif',save_all=True,append_images=seq[1:],duration=55,loop=0)
    for k,i in enumerate([4,12,23]): out[i].save(f'big_{q}_{k}.png')
asyncio.run(main())
