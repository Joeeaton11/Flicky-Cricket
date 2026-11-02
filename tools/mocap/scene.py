import asyncio,base64,io,math,os
from playwright.async_api import async_playwright
from PIL import Image, ImageOps
os.makedirs('scene',exist_ok=True)
W,H=1280,720
def C(az,el,r,look): return [look[0]+r*math.cos(math.radians(az))*math.cos(math.radians(el)), look[1]+r*math.sin(math.radians(az))*math.cos(math.radians(el)), look[2]+r*math.sin(math.radians(el))]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader']); pg=await b.new_page(viewport={'width':W,'height':H})
        await pg.goto(f'http://localhost:8765/rig.html?m=nopads&nogear&scene&ol=0&w={W//2}&h={H//2}'); await pg.wait_for_function('window.READY',timeout=240000)
        shots=[]
        # 1: game camera, behind the batter, real speed (whole delivery)
        shots+= [('game',0.2+i/30,C(115,17,900,[-10,-200,60]),[-10,-200,60],40,True) for i in range(54)]
        # 2: bowler's end replay, slow motion
        shots+= [('bowler',1.25+i/90,C(-90,6,520,[0,30,95]),[0,30,95],32,False) for i in range(64)]
        # 3: side-on, real speed, follow-through held
        shots+= [('side',1.1+i/30,C(-10,8,560,[0,10,90]),[0,10,90],32,False) for i in range(27)]+[('side',1.95,C(-10,8,560,[0,10,90]),[0,10,90],32,False)]*18
        for k,(nm,t,pos,look,fov,mir) in enumerate(shots):
            await pg.evaluate(f'pose({t})'); d=await pg.evaluate(f'cam({pos},{look},{fov})')
            im=Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGB')
            if mir: im=ImageOps.mirror(im)
            im.save(f'scene/f_{k:04d}.png')
        await b.close()
asyncio.run(main())
