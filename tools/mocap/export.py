import asyncio,base64
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader']); pg=await b.new_page()
        pg.on('console',lambda m: print('LOG',m.text[:200]) if 'GPU' not in m.text else None)
        await pg.goto('http://localhost:8765/bowl.html?w=100&h=100'); await pg.wait_for_function('window.READY',timeout=180000)
        d=await pg.evaluate('maskShot()'); open('char_mask.png','wb').write(base64.b64decode(d.split(',')[1]))
        g=await pg.evaluate('exportGLB()'); 
        if g.startswith('ERR'): print(g)
        else: open('kumu_player.glb','wb').write(base64.b64decode(g))
        await b.close()
asyncio.run(main())
