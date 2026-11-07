from playwright.sync_api import sync_playwright
exec(open('cap.py').read().split('with sync_playwright')[0])
with sync_playwright() as p:
    b,pg=page(p)
    pg.evaluate("() => { const x=[...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='KIT'); x && x.click(); }"); pg.wait_for_timeout(1800); pg.screenshot(path='r5.png')
    pg.evaluate("() => { try{closeAllScreens()}catch(e){}; const E=GAME_CONFIG.season.events; E[0].end='2026-11-01'; E[1].start='2026-11-01'; E[1].end='2026-12-31'; eventState(E[1]).cur=64; renderCompete(); document.getElementById('competePanel').classList.add('show'); }")
    pg.wait_for_timeout(800); pg.evaluate("() => document.querySelector('[data-pjump=event]').click()"); pg.wait_for_timeout(1500); pg.screenshot(path='r6.png')
    pg.evaluate("() => { document.getElementById('competePanel').classList.remove('show'); window._shopShelf='ev'; openShop('deals'); }"); pg.wait_for_timeout(1800); pg.screenshot(path='r8.png')
    b.close()
