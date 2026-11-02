import asyncio,base64,io,math
from playwright.async_api import async_playwright
from PIL import Image, ImageOps, ImageDraw
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-unsafe-swiftshader']); pg=await b.new_page(viewport={'width':360,'height':480})
        await pg.goto('http://localhost:8765/rig.html'); await pg.wait_for_function('window.READY',timeout=120000)
        az,el,r=120,24,520; x=r*math.cos(math.radians(az))*math.cos(math.radians(el))-10; y=r*math.sin(math.radians(az))*math.cos(math.radians(el))+30; z=80+r*math.sin(math.radians(el))
        fr=[]
        for i in range(30):
            t=1.0+i/30
            await pg.evaluate(f'pose({t})'); d=await pg.evaluate(f'cam([{x},{y},{z}],[-10,30,80],24)')
            fr.append(ImageOps.mirror(Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGBA')))
        await b.close()
    bb=[f.getbbox() for f in fr]; x0=min(q[0] for q in bb)-10; y0=min(q[1] for q in bb)-10; x1=max(q[2] for q in bb)+10; y1=max(q[3] for q in bb)+10
    fr=[f.crop((x0,y0,x1,y1)) for f in fr]
    bg=Image.new('RGBA',fr[0].size,(70,128,62,255))
    gif=[]
    for f in fr: g=bg.copy(); g.alpha_composite(f); gif.append(g.convert('RGB'))
    seq=[gif[0]]*10+gif+[gif[-1]]*10
    seq[0].save('off_drive_3d.gif',save_all=True,append_images=seq[1:],duration=50,loop=0)
    for i,f in enumerate(fr): f.save(f'od3d_{i:02d}.png')
    picks=[fr[6],fr[15],fr[29]]
    cur=[Image.open('/root/Flicky-Cricket/art/players/gully/'+q).convert('RGBA') for q in ['refs/style_stance.png','shots5/shot_offdrive_c.webp','shots5/shot_offdrive.webp']]
    H=420; fit=lambda im: im.resize((int(im.width*H/im.height),H))
    r1=[fit(q) for q in picks]; r2=[fit(q) for q in cur]
    W=max(sum(i.width+10 for i in r1),sum(i.width+10 for i in r2))+20
    c=Image.new('RGB',(W,H*2+70),(70,128,62)); d=ImageDraw.Draw(c)
    d.text((10,6),'NEW: 3D cricketer + your motion (backlift / contact / finish)',fill='white',font_size=22)
    xx=10
    for i in r1: c.paste(i,(xx,32),i); xx+=i.width+10
    d.text((10,H+40),'NOW: painted frames in the game',fill='white',font_size=22)
    xx=10
    for i in r2: c.paste(i,(xx,H+66),i); xx+=i.width+10
    c.save('drive3d_compare.jpg',quality=85)
asyncio.run(main())
