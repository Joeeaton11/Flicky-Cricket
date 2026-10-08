import sys
from playwright.sync_api import sync_playwright
times=[int(x) for x in sys.argv[2].split(',')]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':700,'height':800},device_scale_factor=2)
    pg.on('pageerror',lambda e:print('ERR',e))
    pg.goto('file://'+sys.argv[1]); pg.wait_for_timeout(500)
    pg.evaluate("window.requestAnimationFrame=()=>0"); pg.wait_for_timeout(200)
    card=pg.query_selector('.card')
    for i,ms in enumerate(times):
        pg.evaluate(f"frame({ms})")
        card.screenshot(path=f'g{i}.png')
    b.close()
