import asyncio,base64,io,math,os
from playwright.async_api import async_playwright
from PIL import Image, ImageOps
os.makedirs('anim',exist_ok=True)
def campos(az,el,r,look):
    return [look[0]+r*math.cos(math.radians(az))*math.cos(math.radians(el)), look[1]+r*math.sin(math.radians(az))*math.cos(math.radians(el)), look[2]+r*math.sin(math.radians(el))]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader']); pg=await b.new_page(viewport={'width':540,'height':720})
        await pg.goto('http://localhost:8765/rig.html?m=nopads&nogear&ol=0&w=540&h=720'); await pg.wait_for_function('window.READY',timeout=180000)
        look=[-10,30,85]; A=campos(120,20,420,look); B=campos(-90,8,470,[0,20,85])
        ts=[0.85+i/30 for i in range(34)]
        for i,t in enumerate(ts):
            await pg.evaluate(f'pose({t})')
            da=await pg.evaluate(f'cam({A},{look},32)'); db=await pg.evaluate(f'cam({B},[0,20,85],30)')
            ia=ImageOps.mirror(Image.open(io.BytesIO(base64.b64decode(da.split(',')[1]))).convert('RGBA')); ib=Image.open(io.BytesIO(base64.b64decode(db.split(',')[1]))).convert('RGBA')
            ia.save(f'anim/a_{i:03d}.png'); ib.save(f'anim/b_{i:03d}.png')
        await b.close()
asyncio.run(main())
