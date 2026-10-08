import sys
import os
SP=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','')
cards=[('gully','GULLY CUP'),('floodlit','FLOODLIT SERIES'),('coastal','COASTAL CUP'),('fairground','FAIRGROUND CUP'),('ecl','ECL'),('acl','ACL'),('desert','DESERT LEAGUE'),('asian','LCL'),('icl','ICL')]
out=["// ═══════════════════════════════════════════════════════════════════════════",
"// LIVE LEAGUE ART — animated card scenes (Tier 1 + Tier 2 rebuilds).",
"// Each factory paints into a 620×355 canvas and returns { start(), stop() }; only the",
"// card in the middle of the carousel animates, the rest show a still frame.",
"// ═══════════════════════════════════════════════════════════════════════════"]
for key,name in cards:
    s=open(SP+key+'.html').read(); s=s[s.index('<script>')+8:s.rindex('</script>')]
    def R(a,b):
        global s
        assert s.count(a)==1,(key,a); s=s.replace(a,b)
    R("const cvs = document.getElementById('c');","// (canvas passed in)")
    R("function loop(ms) { frame(ms); if (!reduceMotion) requestAnimationFrame(loop); }",
      "function loop(ms) { if (!__running) return; __elapsed = ms - __t0; __frame(__elapsed); requestAnimationFrame(loop); }")
    R("paintBase(); frame(0);\nif (!reduceMotion) requestAnimationFrame(loop);","paintBase(); __frame(0);")
    R("const repaint = () => { if (!repainted) { repainted = true; paintBase(); if (reduceMotion) frame(0); } };",
      "const repaint = () => { if (!repainted) { repainted = true; paintBase(); __frame(__elapsed); } };")
    body='\n'.join('  '+l if l.strip() else l for l in s.strip('\n').split('\n'))
    out.append(f"""function makeLeagueArt_{key}(cvs) {{
  let __running = false, __t0 = 0, __elapsed = 0;
  // Soft fade at the foot of the art so it melts into the card's info panel
  function __fade() {{
    const g = ctx.createLinearGradient(0, 355 * 0.78, 0, 355);
    g.addColorStop(0, 'rgba(8,8,18,0)'); g.addColorStop(1, 'rgba(8,8,18,0.92)');
    ctx.fillStyle = g; ctx.fillRect(0, 355 * 0.78, 620, 355 * 0.22);
  }}
  function __frame(ms) {{ frame(ms); __fade(); }}
{body}
  return {{
    start() {{ if (__running) return; if (reduceMotion) {{ __frame(0); return; }} __running = true; __t0 = performance.now() - __elapsed; requestAnimationFrame(loop); }},
    stop() {{ __running = false; }},
  }};
}}""")
out.append("const LEAGUE_LIVE_ART = {\n"+",\n".join(f"  '{name}': makeLeagueArt_{key}" for key,name in cards)+",\n};")
out.append("""// Only the centred card animates; everything stops when the league screen is hidden or the app is backgrounded
window.__leagueArt = [];
function syncLeagueArt(activeIdx) {
  const scr = document.getElementById('leagueScreen');
  const visible = scr && !scr.classList.contains('hidden') && !document.hidden;
  window.__leagueArt.forEach((a, i) => { if (!a) return; if (visible && i === activeIdx) a.start(); else a.stop(); });
}
window.__leagueActiveIdx = 0;
document.addEventListener('visibilitychange', () => syncLeagueArt(window.__leagueActiveIdx));
(function () {
  const scr = document.getElementById('leagueScreen');
  if (scr && 'MutationObserver' in window) new MutationObserver(() => syncLeagueArt(window.__leagueActiveIdx)).observe(scr, { attributes: true, attributeFilter: ['class'] });
})();""")
open(SP+'tools/league_live_art.js','w').write('\n'.join(out)+'\n')
print(len('\n'.join(out)))
