from playwright.sync_api import sync_playwright
INIT="localStorage.setItem('flickyWelcomeChest','1');localStorage.setItem('flickyPlayer', JSON.stringify({g:'m',shirt:'navy',trim:'gold',name:'JOE',flag:'🇬🇧',team:''}));"
def page(p):
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':440,'height':956},device_scale_factor=3)
    pg.add_init_script(INIT); pg.goto('http://localhost:8765/flicky-cricket.html'); pg.wait_for_timeout(3500)
    pg.evaluate("() => { document.querySelectorAll('.fxToast').forEach(e=>e.remove()); const d=document.getElementById('dailyPop'); if(d) d.classList.remove('show'); SAVE.section('unlocks').compete=1; career.matchesPlayed=40; career.coins=12500; gems=860; SAVE.save(); try{updateMenuHUD()}catch(e){} }")
    return b,pg
with sync_playwright() as p:
    # 1 six in a stadium
    b,pg=page(p); pg.goto('http://localhost:8765/flicky-cricket.html?scene=te_bigground'); pg.wait_for_timeout(3000)
    pg.evaluate("() => { try{closeAllScreens()}catch(e){}; playLeague(2); }"); pg.wait_for_timeout(5500)
    pg.evaluate("() => { runs=24; fxBig('six',{word:'SIX!',runs:6}); }"); pg.wait_for_timeout(650); pg.screenshot(path='r1.png'); b.close()
    # 2 grounds (four)
    for i,k in enumerate(['tl_lords','tc_beach','tpi_galleon','tco_moon']):
        b,pg=page(p); pg.goto(f'http://localhost:8765/flicky-cricket.html?scene={k}'); pg.wait_for_timeout(3000)
        pg.evaluate("() => { try{closeAllScreens()}catch(e){}; playLeague(1); }"); pg.wait_for_timeout(5000); pg.screenshot(path=f'g{i}.png'); b.close()
    # 3 duel versus + 4 cup draw + 5 kit + 6 christmas + 7 home
    b,pg=page(p)
    pg.screenshot(path='r7.png')
    pg.evaluate("() => playMode('duel')"); pg.wait_for_timeout(900); pg.screenshot(path='r3.png')
    pg.wait_for_timeout(4000)
    pg.reload(); pg.wait_for_timeout(3500)
    pg.evaluate("""() => { document.querySelectorAll('.fxToast').forEach(e=>e.remove()); const d=document.getElementById('dailyPop'); if(d) d.classList.remove('show'); try{closeAllScreens()}catch(e){};
      const cs=cupState(); cs.run=cupNewDraw(9,'store1'); const r=cs.run; r.path.push({round:0,name:'',me:27,them:19,res:'win',sd:false}); r.round=1; r.path.push({round:1,name:'',me:22,them:22,res:'win',sd:true}); r.round=2; r.path.push({round:2,name:'',me:31,them:24,res:'win',sd:false}); r.round=3; SAVE.save(); openCupDraw(2); }""")
    pg.wait_for_timeout(1200); pg.screenshot(path='r4.png')
    pg.evaluate("() => { document.getElementById('cupDraw').classList.remove('show'); openEquipTab('kit'); }"); pg.wait_for_timeout(1500); pg.screenshot(path='r5.png')
    pg.evaluate("() => { try{closeAllScreens()}catch(e){}; const E=GAME_CONFIG.season.events; E[0].end='2026-11-01'; E[1].start='2026-11-01'; E[1].end='2026-12-31'; eventState(E[1]).cur=64; renderCompete(); document.getElementById('competePanel').classList.add('show'); const car=document.querySelector('#competePanel .evCarousel'), q=car.querySelector('[data-pk=event]'); car.scrollLeft=q.offsetLeft-car.offsetLeft; }")
    pg.wait_for_timeout(1200); pg.screenshot(path='r6.png'); b.close()
