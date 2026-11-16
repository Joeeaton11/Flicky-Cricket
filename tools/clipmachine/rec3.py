# Records one auto-played match via CDP screencast at full phone resolution (1080x1920), frames + wall-clock timestamps
import asyncio, json, sys, os, base64, time
from playwright.async_api import async_playwright
scene, outdir = sys.argv[1], sys.argv[2]
secs = int(os.environ.get('SECS', 70))
os.makedirs(outdir + '/frames', exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': int(os.environ.get('VW',720)), 'height': int(os.environ.get('VH',1280))}, device_scale_factor=1, is_mobile=True, has_touch=True)
        await ctx.add_init_script(path='/home/claude/clips/autoplay.js')
        pg = await ctx.new_page()
        cdp = await ctx.new_cdp_session(pg)
        frames = []
        async def on_frame(ev):
            ts = ev['metadata'].get('timestamp', time.time()); fn = f"{outdir}/frames/{len(frames):05d}.jpg"
            open(fn, 'wb').write(base64.b64decode(ev['data'])); frames.append((ts, fn))
            try: await cdp.send('Page.screencastFrameAck', {'sessionId': ev['sessionId']})
            except Exception: pass
        cdp.on('Page.screencastFrame', lambda ev: asyncio.ensure_future(on_frame(ev)))
        await pg.goto(f'http://localhost:8765/index.html?scene={scene}&lg=7', wait_until='load')
        await cdp.send('Page.startScreencast', {'format': 'jpeg', 'quality': 88, 'maxWidth': 1080, 'maxHeight': 1920, 'everyNthFrame': 1})
        await pg.wait_for_timeout(secs * 1000)
        log = await pg.evaluate('window._clipLog')
        await cdp.send('Page.stopScreencast'); await asyncio.sleep(0.5)
        await b.close()
        json.dump({'scene': scene, 'log': log, 'frames': frames}, open(outdir + '/meta.json', 'w'))
        runs = [e for e in log if e['ev'] == 'runs']
        span = frames[-1][0] - frames[0][0] if frames else 0
        print(scene, 'frames', len(frames), 'fps≈', round(len(frames) / max(span, 1), 1), 'runs events', [(round(e['t'] - frames[0][0], 1), e['n']) for e in runs])
asyncio.run(main())
