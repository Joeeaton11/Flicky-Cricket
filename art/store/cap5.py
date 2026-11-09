from playwright.sync_api import sync_playwright
INIT="localStorage.setItem('flickyWelcomeChest','1');localStorage.setItem('flickyPlayer', JSON.stringify({g:'m',shirt:'navy',trim:'gold',name:'JOE',flag:'🇬🇧',team:'',face:2}));"
def page(p):
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':440,'height':956},device_scale_factor=3)
    pg.add_init_script(INIT); pg.goto('http://localhost:8766/index.html'); pg.wait_for_timeout(3500)
    pg.evaluate("() => { document.querySelectorAll('.fxToast').forEach(e=>e.remove()); const d=document.getElementById('dailyPop'); if(d) d.classList.remove('show'); SAVE.section('unlocks').compete=1; career.matchesPlayed=40; career.coins=12500; gems=860; SAVE.save(); try{updateMenuHUD()}catch(e){} }")
    return b,pg
with sync_playwright() as p:
    b,pg=page(p)
    pg.evaluate("""() => { document.querySelectorAll('.fxToast').forEach(e=>e.remove()); const d=document.getElementById('dailyPop'); if(d) d.classList.remove('show'); try{closeAllScreens()}catch(e){};
      const cs=cupState(); cs.run=cupNewDraw(9,'store1'); const r=cs.run; r.path.push({round:0,name:'',me:27,them:19,res:'win',sd:false}); r.round=1; r.path.push({round:1,name:'',me:22,them:22,res:'win',sd:true}); r.round=2; r.path.push({round:2,name:'',me:31,them:24,res:'win',sd:false}); r.round=3; SAVE.save(); openCupDraw(2); }""")
    pg.wait_for_timeout(4200); pg.evaluate("() => { document.querySelectorAll('.cdThrough').forEach(e=>e.remove()); }"); pg.wait_for_timeout(400); pg.screenshot(path='r4.png'); b.close()
print('ok')
