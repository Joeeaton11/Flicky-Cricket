import sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
    errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m: errs.append('console:'+m.text) if m.type=='error' else None)
    pg.goto('file://'+__import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','..','..','flicky-cricket.html'))+''); pg.wait_for_timeout(2500)
    pg.evaluate("""() => { try { closeAllScreens(); } catch(e){}; trophyState.count = 999; const s=document.getElementById('leagueScreen'); s.classList.remove('hidden'); renderLeagueScreen(); }""")
    pg.wait_for_timeout(1500)
    for i in [15,16]:
        pg.evaluate(f"""() => {{ const t=document.getElementById('leagueCardsTrack'); const c=t.querySelectorAll('.leagueCard')[{i}]; t.scrollLeft = c.offsetLeft - (t.clientWidth - c.clientWidth)/2; }}""")
        pg.wait_for_timeout(4200 if i==1 else 1800)
        pg.screenshot(path=f'card{i}.png')
        print(i, pg.evaluate("() => window.__leagueArt.map((a,i)=>a?i:null).filter(x=>x!==null).length"), pg.evaluate("() => window.__leagueActiveIdx"))
    # hide screen -> all stopped?
    pg.evaluate("() => document.getElementById('leagueScreen').classList.add('hidden')")
    pg.wait_for_timeout(300)
    print('errors:', errs[:10])
    b.close()
