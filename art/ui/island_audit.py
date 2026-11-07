exec(open('island.py').read().split('with sync_playwright')[0])
import json,sys
from playwright.sync_api import sync_playwright
CHECK = """() => { const out=[]; const vw=innerWidth;
  for (const e of document.querySelectorAll('body *')) {
    if (e.dataset.isl) continue; const cs=getComputedStyle(e); if (cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0) continue;
    const r=e.getBoundingClientRect(); if (r.width<2||r.height<2||r.bottom<=0||r.top>=59) continue;
    let p=e, hidden=false; while(p&&p!==document.body){ const c=getComputedStyle(p); if(c.display==='none'||c.visibility==='hidden'||+c.opacity===0){hidden=true;break} p=p.parentElement } if(hidden) continue;
    const own=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()); const tag=e.tagName;
    const interactive = tag==='BUTTON'||tag==='IMG'||tag==='CANVAS'&&r.width<vw*0.9||tag==='SVG'||e.onclick||cs.cursor==='pointer';
    if (!(own||interactive)) continue; if (r.width>=vw*0.9&&r.height>300) continue;
    if (tag==='CANVAS' && r.width>=vw*0.9) continue;
    out.push(`${tag}${e.id?'#'+e.id:''}.${String(e.className).slice(0,40)} top=${Math.round(r.top)} h=${Math.round(r.height)} '${(e.innerText||'').trim().slice(0,24)}'`); }
  return out.slice(0,12); }"""
ISL2 = ISL.replace("d.style.cssText","d.dataset.isl=1; d.style.cssText").replace("t.style.cssText","t.dataset.isl=1; t.style.cssText")
STEPS = [
 ('home', "()=>{ try{ showNav && showNav('home') }catch(e){} }"),
 ('events', "()=>{ renderCompete(); document.getElementById('competePanel').classList.add('show'); }"),
 ('pass', "()=>{ renderPass(); document.getElementById('passPanel').classList.add('show'); }"),
 ('today', "()=>{ openToday(); }"),
 ('shop', "()=>{ openShop('deals'); }"),
 ('gemshop', "()=>{ openGemShop(); }"),
 ('kit', "()=>{ const b=[...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='KIT'); b&&b.click(); }"),
 ('bags', "()=>{ const b=[...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='BAGS'); b&&b.click(); }"),
 ('player', "()=>{ openPlayerScreen(); }"),
 ('stats', "()=>{ const b=[...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='STATS'); b&&b.click(); }"),
 ('settings', "()=>{ const g=document.querySelector('#settingsBtn,[aria-label*=etting]'); g&&g.click(); }"),
 ('leagues', "()=>{ const b=document.querySelector('#leagueBtn,[class*=leagueCard],[class*=menuLeague]'); b&&b.click(); }"),
 ('daily', "()=>{ showDailyPop(); }"),
 ('tables', "()=>{ openDuelTables(); }"),
 ('cupdraw', "()=>{ const cs=cupState(); cs.run=cupNewDraw(1,'a1'); cs.run.path.push({round:0,me:27,them:19,res:'win'}); cs.run.round=1; openCupDraw(); }"),
 ('eventshop', "()=>{ openEventShop && openEventShop(); }"),
]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':393,'height':852},device_scale_factor=1)
    pg.route('**/flicky-cricket.html', lambda r: r.fulfill(status=200, content_type='text/html', body=SRC))
    pg.add_init_script(INIT); pg.goto('http://localhost:8765/flicky-cricket.html'); pg.wait_for_timeout(3500)
    pg.evaluate("() => { document.getElementById('dailyPop')&&document.getElementById('dailyPop').classList.remove('show'); SAVE.section('unlocks').compete=1; career.matchesPlayed=40; career.coins=12500; trophyState.best=45; trophyState.count=45; SAVE.save(); }"); pg.evaluate(ISL2)
    res={}
    for name,js in STEPS:
        try:
            pg.evaluate("() => { try{closeAllScreens()}catch(e){}; document.querySelectorAll('.show').forEach(x=>x.classList.remove('show')); }")
            pg.evaluate(js); pg.wait_for_timeout(1000)
            res[name]=pg.evaluate(CHECK); pg.screenshot(path=f'au_{name}.png')
        except Exception as ex: res[name]=['ERR '+str(ex)[:120]]
    # in-game + pause + result + versus + duel result
    pg.evaluate("() => { try{closeAllScreens()}catch(e){}; document.querySelectorAll('.show').forEach(x=>x.classList.remove('show')); }")
    for name,js,w in [('versus',"()=>{ duelState().table=1; playMode('duel'); }",900),('game',"()=>{}",4800),('pause',"()=>{ const b=document.querySelector('#pauseBtn,[aria-label*=ause]'); b&&b.click(); }",800)]:
        try: pg.evaluate(js); pg.wait_for_timeout(w); res[name]=pg.evaluate(CHECK); pg.screenshot(path=f'au_{name}.png')
        except Exception as ex: res[name]=['ERR '+str(ex)[:120]]
    pg.evaluate("() => { const pz=document.getElementById('pauseOverlay'); pz&&pz.classList.remove('show'); }")
    try:
        pg.evaluate("() => { const c=window.chase; c.used=12; c.log=[4,1,6,0,2,6,1,4,0,6,1,6]; c.rival.log=[1,4,6,0,6,1,2,4,1,0,6,1]; runs=37; duelAfterBall(false); }"); pg.wait_for_timeout(5000)
        res['duelresult']=pg.evaluate(CHECK); pg.screenshot(path='au_duelresult.png')
        pg.evaluate("() => document.getElementById('duelRes').className=''"); pg.wait_for_timeout(300); res['netsEnd']=pg.evaluate(CHECK); pg.screenshot(path='au_netsEnd.png')
    except Exception as ex: res['duelresult']=['ERR '+str(ex)[:120]]
    b.close()
for k,v in res.items(): print(k, len(v)); [print('   ',x) for x in v]
