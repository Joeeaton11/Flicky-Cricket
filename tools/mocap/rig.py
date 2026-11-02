import asyncio,base64,io,json,sys
from playwright.async_api import async_playwright
from PIL import Image
TS=[0,1.0,1.2,1.3,1.4,1.45,1.5,1.55,1.6,1.7,1.8,1.95]
CAMS=json.loads(sys.argv[1])
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader']); pg=await b.new_page(viewport={'width':360,'height':480})
        pg.on('pageerror',lambda e: print('ERR',e)); pg.on('console',lambda m: m.type=='error' and print('CON',m.text[:300]))
        await pg.goto('http://localhost:8765/rig.html'); await pg.wait_for_function('window.READY',timeout=120000)
        d=await pg.evaluate("bindView([400,0,100],[0,0,90])"); Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).save('rig_bind.png')
        for v,(pos,look) in CAMS.items():
            ims=[]
            for t in TS:
                await pg.evaluate(f'pose({t})'); d=await pg.evaluate(f'cam({pos},{look},30)')
                ims.append(Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA').resize((180,240)))
            c=Image.new('RGBA',(180*6,240*2),(70,128,62,255))
            for i,im in enumerate(ims): c.alpha_composite(im,((i%6)*180,(i//6)*240))
            c.convert('RGB').save(f'rig_{v}.jpg',quality=85)
        await b.close()
asyncio.run(main())
