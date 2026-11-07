import re
from playwright.sync_api import sync_playwright
SRC=open('/home/claude/flicky-cricket/flicky-cricket.html').read()
SRC=re.sub(r'env\(safe-area-inset-(top|bottom|left|right)(,[^)]*)?\)',lambda m:f'var(--sa-{m.group(1)})',SRC)
SRC=SRC.replace('<head>','<head><style>:root{--sa-top:59px;--sa-bottom:34px;--sa-left:0px;--sa-right:0px}</style>',1)
INIT="localStorage.setItem('flickyWelcomeChest','1');localStorage.setItem('flickyPlayer', JSON.stringify({g:'m',shirt:'navy',trim:'gold',name:'JOE',flag:'🇬🇧',team:''}));"
ISL="() => { const d=document.createElement('div'); d.style.cssText='position:fixed;z-index:2147483647;left:50%;top:11px;width:126px;height:37px;margin-left:-63px;border-radius:20px;background:#000;pointer-events:none'; document.body.appendChild(d); const t=document.createElement('div'); t.style.cssText='position:fixed;z-index:2147483647;left:24px;top:16px;font:600 17px -apple-system,Arial;color:#fff;pointer-events:none'; t.textContent='16:50'; document.body.appendChild(t); }"
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':393,'height':852},device_scale_factor=2)
    pg.route('**/flicky-cricket.html', lambda r: r.fulfill(status=200, content_type='text/html', body=SRC))
    pg.add_init_script(INIT); pg.goto('http://localhost:8765/flicky-cricket.html'); pg.wait_for_timeout(3500)
    pg.evaluate("() => { document.getElementById('dailyPop')&&(document.getElementById('dailyPop').style.display='none'); document.querySelectorAll('.fxToast').forEach(e=>e.remove()); SAVE.section('unlocks').compete=1; career.matchesPlayed=40; career.coins=12500; gems=860; trophyState.best=45; trophyState.count=45; duelState().trophies=120; SAVE.save(); try{updateMenuHUD()}catch(e){} }")
    pg.evaluate(ISL)
    def shot(n,w=900): pg.wait_for_timeout(w); pg.screenshot(path=f'i_{n}.png')
    shot('home')
    pg.evaluate("() => { renderCompete(); document.getElementById('competePanel').classList.add('show'); document.querySelector('[data-pjump=duel]').click(); }"); shot('events')
    pg.evaluate("() => openDuelTables()"); shot('tables')
    pg.evaluate("() => { document.getElementById('duelTables').classList.remove('show'); document.getElementById('competePanel').classList.remove('show'); const cs=cupState(); cs.run=cupNewDraw(1,'show1'); const r=cs.run; r.path.push({round:0,name:'',me:27,them:19,res:'win',sd:false}); r.round=1; SAVE.save(); openCupDraw(1); }"); shot('cup',1300)
    pg.evaluate("() => { document.getElementById('cupDraw').classList.remove('show'); playMode('duel'); }"); shot('versus')
    pg.wait_for_timeout(4500); shot('game',100)
    pg.evaluate("() => { const c=window.chase; c.used=12; c.log=[4,1,6,0,2,6,1,4,0,6,1,6]; c.rival.log=[1,4,6,0,6,1,2,4,1,0,6,1]; runs=37; duelAfterBall(false); }"); pg.wait_for_timeout(5000); pg.evaluate("() => document.querySelectorAll('.fxToast').forEach(e=>e.remove())"); shot('result',100)
    b.close()
