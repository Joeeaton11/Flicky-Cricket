# League card art — handover

We are rebuilding every league card on the league-select screen as an **animated, illustrated 620×355 canvas scene**, one league at a time. Joe reviews each card, it's iterated, and once signed off it's wired into the game on `main`.

## Status

**Live in the game (signed off):**
- Gully Cup, Floodlit Series, Coastal Cup, Fairground Cup
- ECL, ACL, Desert League
- LCL (formerly Asian Classics; its file is `asian.html`, key `asian`)
- ICL
- CCL (the Pitons over a Caribbean bay; steel-pan Calypso Cup)
- SAL (bushveld with Table Mountain on the horizon; gold king-protea Rainbow Cup)

**Next, in order:**
- BCL (Bangladesh, the Tiger Cup; placeholder art for now)
- NZCL (New Zealand, the Silver Fern Cup; placeholder art for now)
- Buccaneer Cup
- then Tier 4 onwards: PCL, Witches' Ashes, Frontier Cup, and so on

Each league's name, subtitle, cup name, stats and colours live in `THEMED_LEAGUES` in `flicky-cricket.html`. Read the entry before designing.

## The rules Joe has agreed

- **Theme-first postcard.** No players and no pitch. Landmarks and scenery tell the story. Stumps plus a ball in the foreground are fine.
- **Avoid sameness.** Joe dislikes "another waterfront skyline with a boat crossing" and collages of separate panels. Each card should be one coherent view with depth, and its own palette and mood.
- **A unique full-size trophy turning centre stage.** It's a body of revolution, with emblems, gems and handles placed by angle `phi`, so it reads at every angle. Avoid flat cut-outs that become slivers side-on. It stands on a plinth with a curved plate showing the cup name and league.
- **Calm shine only:** a slow travelling glint. No big sun rays or starburst sparkles.
- **Staggered animation.** A shared `SHOW` schedule (about 19 to 26 seconds, a different length per card) with timed events, plus continuous loops of unrelated lengths, so nothing stops all at once. Joe likes one or two clear headline moments.
- **A distinct time of day per card**, and shadows that follow the light.
- **Keep key props above about 0.70 of the height.** The game fades the bottom of the art into the info panel.
- **No frames or borders, and no overlays** that box the scene in.
- **Don't over-fill.** Joe called out too many kites. Fewer, bigger, readable elements beat lots of tiny ones. Remember the card shows at about 340px wide on a phone.
- **Clouds:** soft sprite clouds, never cartoon circles.
- **Avoid restricted national emblems.** For example, India's Ashoka lion capital. Flags are fine when drawn correctly.
- **No real team or board logos** (e.g. the West Indies cricket flag is Cricket West Indies' emblem). Use an original flag in the right colours instead; for CCL that's maroon with gold CCL over sea-and-sand stripes.
- **Vibrant and alive, not grey or hazy.** SAL took many rounds: a stormy palette "pushed him towards depression", golden-hour haze read as flat, and too many animals felt congested. What landed: bright saturated daylight, a clear winding river, colour in the foreground (daisy carpet), and three clear animal "stars" with space around each.
- **Clouds:** faint and wispy, kept out of the way; no flat-bottomed puffs.
- **Bird wings must flap, not flip:** both wings rise and fall together; never swing a wing through the body.
- **Offer options when Joe is unsure.** For a cup or flag, render 3 stills side by side in one artifact page and let him pick.

## How a card file works

Each `<key>.html` is a standalone page: a card shell plus one `<script>`.

**Structure:**
- `draw(ctx, W, H, part)` paints the still layers: `'sky' | 'back' | ('mid') | 'front'`.
  - Unused parts are drawn to `SCRATCH`, so the seeded `rnd()` stays deterministic across layers.
- `paintBase()` renders the layers once to offscreen canvases.
- `frame(ms)` composites the layers, then calls per-frame `draw…Life()` functions, `drawTrophy(ctx, W, H, phi, t)` and `drawAtmos()`.
- `win(m, [a, b])` returns 0–1 progress through a scheduled window, where `m = t % SHOW`.

**The tail must stay exactly in this form,** because the build script rewrites it:
```js
const cvs = document.getElementById('c');
...
function loop(ms) { frame(ms); if (!reduceMotion) requestAnimationFrame(loop); }
paintBase(); frame(0);
if (!reduceMotion) requestAnimationFrame(loop);
let repainted = false;
const repaint = () => { if (!repainted) { repainted = true; paintBase(); if (reduceMotion) frame(0); } };
```

**To start a new card:** copy the `<head>` and `.card` markup from an existing file, such as `icl.html`, up to `<script>`. Then change:
- the title
- `--tier`: Tier 1 `#f09040`, Tier 2 `#4ab4f0`, Tier 3 `#b884ff`
- `--eng`
- the aria-label
- the pip text, the name, the subtitle and the four stats

## Tools (run from a scratch directory)

- `python3 art/league-cards/tools/shot.py /abs/path/test.html 0,3000,9000` renders frames at those milliseconds to `g0.png`, `g1.png` and so on.
  - First make a test copy with a charset line: `(printf '<meta charset="utf-8">\n'; cat card.html) > card_test.html`.
  - To save credit, crop or combine the frames into **one image per check**.
- `node --check` on the extracted script catches syntax errors.
- Publish each draft as an artifact for Joe to review, and re-publish the same file path to update it.

## Wiring a signed-off card into the game

1. Copy the final card into this folder as `<key>.html`.
2. Add `('<key>', '<EXACT LEAGUE NAME>')` to the `cards` list in `tools/build_modules.py`.
3. Run `python3 art/league-cards/tools/update_game.py`. It wraps every card as `makeLeagueArt_<key>(cvs)` → `{start, stop}`, rebuilds `LEAGUE_LIVE_ART` and swaps the module into `flicky-cricket.html`. Only the centred carousel card animates, and reduced motion gives a still frame.
4. Check the card in the game. Run `tools/gametest.py`, editing the card indices in its loop; it screenshots the league carousel at phone size and reports console errors.
5. Commit `flicky-cricket.html`, the card file, `build_modules.py` and `league_live_art.js`, and push to **main**.
   - The GitHub Pages deploy only succeeds from `main`.
   - Pushing another branch at the same moment can cancel the main deploy (concurrency group `pages`). If it does, re-run it with `gh api -X POST repos/Joeeaton11/Flicky-Cricket/actions/runs/<id>/rerun`.

## Working with Joe

- He's the founder, reviews on his phone, and likes short, plain answers.
- He's watching credit:
  - Batch changes.
  - Use one combined screenshot per check.
  - Only push to main when he signs a card off.
- When he asks "how can we improve?", give a short numbered list with your top picks, then do what he chooses.
