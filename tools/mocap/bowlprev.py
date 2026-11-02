import asyncio,base64,io,math,sys,json
from playwright.async_api import async_playwright
from PIL import Image
TS=[float(x) for x in sys.argv[1].split(',')]; OUT=sys.argv[2]; VIEW=sys.argv[3] if len(sys.argv)>3 else 'front'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader']); pg=await b.new_page(viewport={'width':360,'height':480})
        pg.on('console',lambda m: print('LOG',m.text[:200]))
        await pg.goto('http://localhost:8765/bowl.html?w=360&h=480'); await pg.wait_for_function('window.READY',timeout=180000)
        ims=[]
        for t in TS:
            h=await pg.evaluate(f'pose({t})')
            ax,ay=h[0],h[1]
            if VIEW=='front': az,el=90,22
            else: az,el=0,8
            r=900; C=[ax+r*math.cos(math.radians(az))*math.cos(math.radians(el)), ay+r*math.sin(math.radians(az))*math.cos(math.radians(el)), 90+r*math.sin(math.radians(el))]
            d=await pg.evaluate(f'cam({json.dumps(C)},[{ax},{ay},90],15)')
            im=Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA').resize((240,320))
            bg=Image.new('RGBA',im.size,(200,170,120,255)); bg.alpha_composite(im); ims.append(bg)
        await b.close()
    n=len(ims); cols=min(n,8); rows=(n+cols-1)//cols
    o=Image.new('RGB',(cols*240,rows*320))
    for i,im in enumerate(ims): o.paste(im.convert('RGB'),((i%cols)*240,(i//cols)*320))
    o.save(OUT)
asyncio.run(main())
