# Builds the /grounds/ pages (Nov 20): one hub + one page per league, for search ("pirate cricket game", "space cricket game"...).
# Run from the repo root: python3 tools/seo/grounds.py   (needs Pillow; reads ground art from assets/themes)
import re, json, os, html
from string import capwords
from PIL import Image
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
game = open(f'{R}/flicky-cricket.html', encoding='utf8').read()
names = dict(re.findall(r'(\w+): "([^"]+)"', game[game.index('const GROUND_NAMES'):game.index('function sceneName')]))
leagues = []
for m in re.finditer(r'scenes:\s*\[([^\]]*)\][\s\S]{0,200}?name:\s*"([^"]*)",\s*\n\s*subtitle:\s*"([^"]*)"', game):
    if m.group(2) == 'SCENE TEST': continue
    leagues.append((m.group(2), m.group(3), [k.strip(" '\n") for k in m.group(1).split(',') if k.strip(" '\n")]))
BLURB = {  # league name -> (slug, search-friendly H1, one paragraph in our own words)
 'GULLY CUP': ('street-cricket', 'Street cricket game', 'Where most of us learned the game: tennis-ball cricket in the gully, on the maidan, on a flat roof and in the railway yard. Tight boundaries, washing lines, and the neighbours watching every shot.'),
 'FLOODLIT SERIES': ('night-cricket', 'Floodlit night cricket game', 'Cricket under the lights. Evening grounds, a twilight pier, fog rolling over the outfield and a packed coliseum, with flame bursts on the rope every time you clear it.'),
 'COASTAL CUP': ('beach-cricket', 'Beach cricket game', 'Bat on the sand with the sea behind the bowler. Rock pools, a busy harbour, a beach party at night and a proper storm rolling in.'),
 'FAIRGROUND CUP': ('funfair-cricket', 'Funfair cricket game', 'Hit it over the big wheel. A funfair, a circus big top, a theme park and a fright fair, all with a crowd that loves a six.'),
 'LIONHEART CUP': ('england-cricket-game', 'English county cricket game', 'Six grounds styled on the great English cricket cities, from St John\'s Wood and Kennington to Leeds, Birmingham, Manchester and Nottingham.'),
 'BLAZE CUP': ('australia-cricket-game', 'Australian cricket game', 'Big Aussie bowls in Melbourne, Sydney, Brisbane, Perth and Adelaide. Hard, fast and with a long way to the rope.'),
 'DESERT LEAGUE': ('desert-cricket', 'Desert cricket game', 'Floodlit nights in Dubai and Sharjah, then out into the dunes and an oasis for cricket in the sand.'),
 'HERITAGE CUP': ('sri-lanka-cricket-game', 'Sri Lanka cricket game', 'Galle Fort by the ocean, Colombo, Kandy in the hills and Dambulla. Four grounds full of colour and noise.'),
 'CHAMPIONS CUP': ('india-cricket-game', 'Indian cricket game', 'Ten grounds styled on India\'s great cricket cities: Mumbai, Chennai, Kolkata, Bengaluru, Delhi, Jaipur, Hyderabad, Ahmedabad, Mohali and Lucknow.'),
 'CALYPSO CUP': ('caribbean-cricket-game', 'Caribbean cricket game', 'Bridgetown, Port of Spain and Kingston. Steel drums in the stands and the sea breeze on the boundary.'),
 'PROTEA CUP': ('south-africa-cricket-game', 'South Africa cricket game', 'Cape Town under the mountain, Johannesburg, Durban and Pretoria.'),
 'TIGER CUP': ('bangladesh-cricket-game', 'Bangladesh cricket game', 'Dhaka, Chattogram and Sylhet, three grounds with some of the loudest crowds in the game.'),
 'SILVER FERN CUP': ('new-zealand-cricket-game', 'New Zealand cricket game', 'Wellington, Christchurch, Auckland and Mount Maunganui, with short boundaries and a long way to travel between them.'),
 'BUCCANEER CUP': ('pirate-cricket', 'Pirate cricket game', 'Cricket on a pirate galleon, in a smuggler\'s cove, on treasure island and at the pirate fort. Mind the cannons.'),
 'MARKHOR CUP': ('pakistan-cricket-game', 'Pakistan cricket game', 'Lahore, Karachi, Rawalpindi and Multan. Four grounds built for fast bowling and big hitting.'),
 "WITCHES' ASHES": ('halloween-cricket', 'Halloween cricket game', 'A pumpkin festival, a graveyard, a crypt, a haunted mansion and a dark forest. The spookiest cricket you will ever play.'),
 'FRONTIER CUP': ('wild-west-cricket', 'Wild West cricket game', 'A frontier town, a canyon, a ghost town and the rodeo. Hit it clean over the saloon.'),
 'FROZEN ASHES': ('ice-cricket', 'Snow and ice cricket game', 'Cricket in the Arctic, on a glacier, across the tundra and inside an ice palace.'),
 'COSMOS CUP': ('space-cricket', 'Space cricket game', 'A moon base, Mars, a space station, an asteroid and an alien world. Low gravity, huge sixes.'),
 'INFERNO CUP': ('volcano-cricket', 'Volcano cricket game', 'The volcano, a lava lake, a tiki island and the forge. It gets hot out there.'),
 'NEON SERIES': ('cyberpunk-cricket', 'Neon cyberpunk cricket game', 'Neon city streets, a neon rooftop, an esports arena and the subway.'),
 'JUNGLE CUP': ('jungle-cricket', 'Jungle cricket game', 'A lost temple, the jungle canopy, a riverbank and a valley full of dinosaurs.'),
 "KNIGHT'S CUP": ('medieval-cricket', 'Medieval knights cricket game', 'A castle, the jousting lists, a siege, the great hall and the moat.'),
 'BRASS CUP': ('steampunk-cricket', 'Steampunk cricket game', 'Brass city, an airship, a factory floor and the docks, all cogs and steam.'),
 "WIZARD'S CUP": ('wizard-cricket', 'Wizard cricket game', 'A wizard\'s hall, an enchanted forest, floating isles, a dragon\'s lair and a sunken school.'),
 'DEEP CUP': ('underwater-cricket', 'Underwater cricket game', 'Cricket on a coral reef, in a lagoon, around a shipwreck and in lost Atlantis.'),
 'ETERNAL CUP': ('ancient-worlds-cricket', 'Ancient worlds cricket game', 'Ancient Rome, Egypt and Greece, an Aztec temple and a Viking hall.'),
}
head = open(f'{R}/site/support.html', encoding='utf8').read()
ga = head[head.index('<!-- Google Analytics'):head.index('<!-- End Google Analytics -->') + len('<!-- End Google Analytics -->')]
GET = '/get/?src=grounds'
STYLE = '''<style>
.gl{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin:18px 0}
.gl a,.gl figure{display:block;margin:0;color:inherit;text-decoration:none;background:#13213f;border:2px solid #2a3d66;border-radius:14px;overflow:hidden}
.gl img{width:100%;height:auto;display:block;aspect-ratio:600/462;object-fit:cover}
.gl b,.gl figcaption{display:block;padding:8px 10px;font-weight:700;letter-spacing:.02em}
.gl small{display:block;padding:0 10px 10px;opacity:.75}
.ctaRow{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}
</style>'''
def page(path, title, desc, body, crumbs):
    canon = 'https://flickycricket.com' + path
    ld = [{'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': 'https://flickycricket.com' + u} for i, (n, u) in enumerate(crumbs)]}]
    return f'''<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{canon}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Flicky Cricket">
<meta property="og:title" content="{html.escape(title)}"><meta property="og:description" content="{html.escape(desc)}">
<meta property="og:image" content="https://flickycricket.com/img/og.jpg"><meta property="og:url" content="{canon}">
<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#0b1630">
<link rel="icon" href="/favicon.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/site.css">
{STYLE}
<script type="application/ld+json">{json.dumps(ld)}</script>
{ga}
</head>
<body>
<header class="top">
  <a class="brand" href="/"><img src="/img/icon.webp" alt="" width="40" height="40"><span>Flicky Cricket</span></a>
  <nav><a href="/grounds/">Grounds</a><a href="/support.html">Support</a><a class="play topPlay on" href="/play/">▶ PLAY FREE</a></nav>
</header>
<main class="page">
{body}
<div class="ctaRow"><a class="cta" href="/play/">▶ Play free in your browser</a><a class="cta" href="{GET}">Get the free app</a></div>
<p class="muted">Flicky Cricket is a free arcade cricket game for iPhone and Android. You bat with one thumb: swipe as the ball arrives, time it right and clear the rope. Chase targets in 2-minute matches, play 1v1 duels against your mates and enter weekend knockout cups.</p>
</main>
<footer class="foot">
  <p><a href="/">Home</a> · <a href="/grounds/">All grounds</a> · <a href="/play/">Play free</a> · <a href="/press.html">Press kit</a> · <a href="/support.html">Support</a> · <a href="/privacy.html">Privacy Policy</a> · <a href="/terms.html">Terms</a></p>
  <p class="muted">© 2026 Flicky Cricket. Ground names are our own; no real stadiums, teams or players are shown.</p>
</footer>
</body>
</html>
'''
os.makedirs(f'{R}/site/grounds/img', exist_ok=True)
def thumb(k):
    out = f'{R}/site/grounds/img/{k}.webp'
    if not os.path.exists(out):
        im = Image.open(f'{R}/assets/themes/{k}.webp').convert('RGB').crop((0, 0, 1170, 900)).resize((600, 462), Image.LANCZOS)
        im.save(out, 'WEBP', quality=72)
    return f'/grounds/img/{k}.webp'
total = sum(len(s) for _, _, s in leagues); cards = []; urls = ['/grounds/']
for name, sub, scenes in leagues:
    slug, h1, blurb = BLURB[name]; path = f'/grounds/{slug}/'; urls.append(path)
    league = capwords(name.lower())
    figs = ''.join(f'<figure><img src="{thumb(k)}" alt="{html.escape(capwords(names.get(k, k).lower()))}: a {h1.lower().replace(" game", "")} ground in Flicky Cricket" loading="lazy" width="600" height="462"><figcaption>{html.escape(capwords(names.get(k, k).lower()))}</figcaption></figure>' for k in scenes)
    body = f'<p class="muted"><a href="/grounds/">All grounds</a> › {html.escape(league)}</p><h1>{html.escape(h1)}: the {html.escape(league)}</h1><p>{html.escape(blurb)}</p><p>The {html.escape(league)} is one of 27 leagues in Flicky Cricket, with {len(scenes)} grounds to play. Every ground has its own crowd, sounds and celebrations, and you can play them all free.</p><div class="gl">{figs}</div>'
    title = f'{h1} – {len(scenes)} grounds in the {league} | Flicky Cricket'
    desc = f'{h1}: play the {league} free in Flicky Cricket. {blurb[:110].rstrip(". ")}. Free on iPhone, Android and in your browser.'
    os.makedirs(f'{R}/site{path}', exist_ok=True)
    open(f'{R}/site{path}index.html', 'w', encoding='utf8').write(page(path, title, desc, body, [('Flicky Cricket', '/'), ('Grounds', '/grounds/'), (league, path)]))
    cards.append(f'<a href="{path}"><img src="{thumb(scenes[0])}" alt="{html.escape(h1)}" loading="lazy" width="600" height="462"><b>{html.escape(h1)}</b><small>{html.escape(league)} · {len(scenes)} grounds</small></a>')
hub = f'<h1>Every cricket ground in Flicky Cricket</h1><p>{total} grounds across {len(leagues)} leagues, from street cricket in the gully to the moon, a pirate galleon and lost Atlantis. Pick a league to see its grounds.</p><div class="gl">{"".join(cards)}</div>'
open(f'{R}/site/grounds/index.html', 'w', encoding='utf8').write(page('/grounds/', f'All {total} cricket grounds – Flicky Cricket, the free arcade cricket game', f'See all {total} grounds and {len(leagues)} leagues in Flicky Cricket: street, beach, night, pirate, space, Halloween and more. Free on iPhone, Android and in your browser.', hub, [('Flicky Cricket', '/'), ('Grounds', '/grounds/')]))
json.dump(urls, open(f'{R}/tools/seo/grounds_urls.json', 'w'))
print(total, 'grounds,', len(leagues), 'leagues')
