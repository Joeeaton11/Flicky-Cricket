from playwright.sync_api import sync_playwright
INIT="localStorage.setItem('flickyWelcomeChest','1');localStorage.setItem('flickyPlayer', JSON.stringify({g:'m',shirt:'navy',trim:'gold',name:'JOE',flag:'🇬🇧',team:'',face:2}));"
U='http://localhost:8766/index.html'
def page(p):
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':440,'height':956},device_scale_factor=3)
    pg.add_init_script(INIT); pg.goto(U); pg.wait_for_timeout(3500)
    pg.evaluate("() => { document.querySelectorAll('.fxToast').forEach(e=>e.remove()); const d=document.getElementById('dailyPop'); if(d) d.classList.remove('show'); SAVE.section('unlocks').compete=1; career.matchesPlayed=40; career.coins=12500; gems=860; trophyState.count=210; SAVE.save(); state='over'; try{closeAllScreens()}catch(e){}; goHomeTab(); }")
    pg.wait_for_timeout(1500); pg.evaluate("() => { const d=document.getElementById('dailyPop'); if(d) d.classList.remove('show'); document.querySelectorAll('.fxToast').forEach(e=>e.remove()); }"); pg.wait_for_timeout(300); return b,pg
with sync_playwright() as p:
    b,pg=page(p)
    # kit (Locker)
    pg.evaluate("() => document.getElementById('customiseBtn').click()"); pg.wait_for_timeout(1800); pg.screenshot(path='r5.png')
    # Christmas event in the events list
    pg.evaluate("() => { const E=GAME_CONFIG.season.events; E[0].end='2026-11-01'; E[1].start='2026-11-01'; E[1].end='2026-12-31'; eventState(E[1]).cur=64; goHomeTab(); document.getElementById('eventsNavBtn').click(); }")
    pg.wait_for_timeout(1500)
    pg.evaluate("() => { const q=document.querySelector('#competePanel article[data-pk=event]'); const s=document.querySelector('#competePanel .sheet'); if(q&&s) s.scrollTop=q.offsetTop-90; }"); pg.wait_for_timeout(900); pg.screenshot(path='r6.png')
    # leagues road
    pg.evaluate("() => { goHomeTab(); setSelectedLeague(6); document.getElementById('homeLeagueCard').click(); }"); pg.wait_for_timeout(2600); pg.screenshot(path='r9.png')
    # home with new bar
    pg.evaluate("() => { goHomeTab(); }"); pg.wait_for_timeout(1500); pg.screenshot(path='r7.png')
    b.close()
print('ok')
