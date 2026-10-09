import sys
from playwright.sync_api import sync_playwright
JS = r"""()=>{const out=[];for(let ms=0;ms<60000;ms+=50){try{frame(ms)}catch(e){out.push(ms+' '+e.message+' '+e.stack.split('\n').slice(1,3).join('|'));if(out.length>3)break;}}return out}"""
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page()
    pg.goto('file://'+sys.argv[1]);pg.wait_for_timeout(500)
    print(pg.evaluate(JS)); b.close()
