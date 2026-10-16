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
- BCL (Bengal river village at dawn: Sundarbans tiger, rickshaw, saris, paddy and mustard; the Tiger Shield)
- NZCL (Lake Tekapo afternoon: Aoraki, pōhutukawa, tree ferns, kiwi, kea, tūī, jet boat; the Silver Fern on a kōwhaiwhai plinth)
- Buccaneer Cup (file `pirate.html`, key `pirate`: treasure cove at sunset; an overflowing oak treasure chest *is* the trophy, plaque on its front; galleon firing broadsides and one cricket ball that clips the stumps — "HOWZAT!" from the parrot)

- PCL (file `pcl.html`, key `pcl`: Lahore at golden hour — Badshahi Mosque, Minar-e-Pakistan, the old city with a chai dhaba, Basant kite fight, truck art, a tanga, a Mughal garden with fountains, dusk lights; the Jade Lotus Cup, a carved Mughal jade wine cup that turns)

- Witches' Ashes (file `witches.html`, key `witches`: a witch's hollow at moonrise — haunted mansion on a terrace, ruined abbey on the far ridge under a detailed harvest moon, graveyard with an iron fence and a black cat, a scarecrow, jack-o'-lanterns, a dead oak with a raven; the Cauldron boils from 1s and erupts at 6.5s in glossy metaball slime that coats everything, then drains; the cauldron stops turning while the goo is out)
- Frontier Cup (file `frontier.html`, key `frontier`: looking straight down Main Street at high noon in one-point perspective — undertaker's with coffins, jail and general store in shade on the left; saloon with balcony, bank and hotel in sun on the right; the plain, red mesas, snowy blue mountains, a water tower and a steam train crossing beyond the town; the Sheriff's Star sways in the street. A 30-second shootout told as one story: tumbleweed clips the stumps, robbers burst from the bank, the sheriff behind barrels, the deputy in the jail door, a gunman on the balcony; the balcony gunman's hat is shot off and he falls head first into a hay cart; the leader is disarmed and the loot sack bursts into banknotes; the deputy marches them to jail as the train whistles)
- Frozen Ashes (file `frozen.html`, key `frozen`: a fjord at polar twilight — low pink sun between a sculpted pinnacle iceberg with an arch (left) and a big rock-banded peak (right), northern lights over all, water reflections, a red fishing hut with kayak and lantern on a snowy point, a polar bear on his own little berg, a husky sled crossing the far ice, ice stumps on a pressure-ridged shore; the Ice Urn, the Ashes urn carved from glacier ice, turns on a slate plinth. 24 s loop: aurora flare → snowflake swirl round the urn → the berg's second peak calves → frost creeps over the snow, snowfall, narwhals surface)
- Cosmos Cup (file `cosmos.html`, key `cosmos`, Tier 5 · Deep Fantasy, pip `#ff8ad8`: a moonbase at planetrise — nebula sky, small sun and Earth, a teal-violet ice giant rising on the right with a moon crossing it, glass domes with plants and people on a crater rim, a turning radar dish, a launch pad with floodlights; the Ringed Planet, a banded gas-giant globe in a tilted gold ring with gem moons. 28 s loop: countdown lights → lift-off in billowing exhaust that lights the scene orange → comet and shooting stars → the rocket drops back in and lands on its legs → the ball floats up in a low-gravity hop; an astronaut bounds to an original Cosmos Cup flag and back, a rover trundles across)
- Inferno Cup (file `inferno.html`, key `inferno`, Tier 5 · Deep Fantasy, pip `#ff8ad8`: an erupting mountain at night — ash-cloud ceiling lit red, a distant glowing volcano, a lavafall from a cleft in the left cliff, a lava river with drifting crust across a cracked-crust plain, a craggy basalt outcrop on the right, the main volcano with cooled flow tongues, steaming vents and a jagged crater rim spilling lava; the Molten Core, an obsidian sphere of Voronoi plates with molten cracks rendered per pixel, in a gold cradle of six flames on an engraved stem. 25.6 s loop: rumble → eruption with lightning in the ash (headline 1) → glowing boulders tumble down, the lavafall surges and a bright pulse runs down the river → one giant lava bomb arcs over and smashes into the plain: flash, shockwave, spray, a small screen shake, and the orb flares white-hot (headline 2). Stumps sit at x 0.225 here to clear the lavafall)
- Neon Series (file `neon.html`, key `neon`, Tier 5 · Deep Fantasy: a rain-soaked neon street at night in one-point perspective — towers of four facade styles stepping in and out, stacked blade and board signs (each prerendered lit/unlit with a shared glow), a hologram billboard with score ticker, lamps, cruising traffic with light trails, hover cars with searchlights, people under glowing umbrellas, steam, light shafts, fog banks, wet-road reflections and shimmer, rain tinted by the signs; the Holo Ball, a per-pixel hologram cricket ball with a tipped seam and stitch rows, spinning in the beam of a chrome projector on a plinth with sign-coloured rim light, reflected in the road. 20 s loop: HOWZAT shorts out in sparks and the street blacks out (only the trophy keeps pulsing), then the signs buzz back on from the far end (headline 1) → a hover car screams down the street and overhead (headline 2) → the billboard calls a SIX and the trophy and every sign pulse (headline 3))
- Jungle Cup (file `jungle.html`, key `jungle`, Tier 5 · Deep Fantasy, 'Lost World Cricket': morning in a lost valley — flat-topped mesas in the haze, drifting clouds, a ruined lost city that emerges as the mist thins, a long-necked dinosaur walking in the distance, giant kapok trees and palms, a stacked-slab rock cliff with orchids and a silky scrolling-texture waterfall into a lily-pad pool, a giant buttressed tree, a toppled carved stone with a toucan on it; butterflies, a hummingbird, a poison dart frog, dragonflies, fish leaps, fireflies, falling leaves. The Sun Temple: a stepped Aztec pyramid in stone, turquoise and gold that turns in true 3D (stairs on all four faces between feathered-serpent rails), moss on its corners, torchlit shrine, a golden ball in a sun disc on top, on a carved temple plinth with gold-bracketed fire bowls. 26 s loop: the dinosaur calls and a flock of macaws sweeps across the valley (headline 1) → the sun breaks through and the valley warms (headline 2) → a pteranodon glides over (headline 3) → spider monkeys swing across the canopy. A kingfisher dives in the pool at ~9 s)

**Next, in order (5 of 27 left):** Knight's Cup, Brass Cup, Wizard's Cup, Deep Cup, Eternal Cup. All are Tier 4+ fantasy themes (`--tier` for Tier 4 is still `#b884ff` in PCL; check `THEMED_LEAGUES` for each league's tier label).

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
- **Trophies were starting to feel samey** by BCL. A flat award (plate, shield, roundel) is a good alternative: it **sways** side to side on a stand rather than spinning, so it never goes side-on. Any glint or sheen on it must be driven by the sway angle, not its own timer, or it looks out of sync.
- **Animals should look like animals.** Joe called out a cartoon tiger face, stick legs and missing stripes. Build creatures as proper silhouettes (shoulders, haunches, jointed legs, a real head) and draw them large in a test harness first.
- **Keep moving props in view.** Anything that only crosses a small visible gap needs its loop timed around that gap. Stagger headline moments so two never play at once.
- **Clock can start just below zero in the game.** Every card now clamps `t` to ≥ 0 in `frame()` (a negative `%` gave a negative arc radius). Keep that line in new cards.
- **Make it scream the country.** NZCL's first pass (Alps, lupins, pines, sheep) read as Switzerland. Iconic native plants, animals and local details (tree ferns, pōhutukawa, kiwi, a bach with the flag) fixed it. Don't let any one element overpower the scene.
- **Respect cultural art.** Don't use tā moko (Māori tattoo); use kōwhaiwhai-style scrollwork instead. Same care for any sacred or personal motif.
- **The award can be the object itself.** For the Buccaneer Cup the trophy is just a big treasure chest with its plaque on the front, no plinth. Box-shaped awards must **not** sway or spin (Joe: the sway "didn't work").
- **Treasure must be detailed, not a blanket of colour.** Hundreds of individually shaded coins (rim, face, milled ring, a few silver, some on edge) over a warm gold bed, heaped right to the rim with coins tipping over a visible edge. Treasures (crown, goblet, ingots) need real metal shading.
- **Keep the left feature simple.** A cartoon skull island and a busy fort/wreck/waterfall headland were both rejected; a plain dark cave (empty, with a tiny campfire) worked.
- **Ships: hide the hull below the waterline**, or it reads as a bowl sitting on the sea. A galleon reads by its outline: long hull, high stern castle, forecastle, triangular lateen mizzen.
- **Effects must look organic, not formulaic.** Cannon fire went from neat round puffs to seeded per-shot variety: uneven timing, ragged flash and sparks, puffs with their own burst/drag/life drifting downwind, ragged splashes. Don't fire the moment the card appears; let wrapped smoke from the previous loop show only on later loops.
- **Palms: full, layered crowns.** Thin comb fronds looked cheap; dense drooping leaflets, back fronds darker, a gold rim light, ringed trunks, coconuts and dead fronds look right. Static palms can be drawn once into the back layer.
- **Cache heavy static props.** The chest (hundreds of coins) is drawn once to an offscreen canvas; only its twinkles and glints redraw each frame. Clear the cache in `paintBase()` so it repaints after fonts load.
- **Anything that turns must turn as one.** Every feature on a rotating cup (petals, beads, handles, medallions) must use the same angle convention: `x = sin(phi + offset)`, visible when `cos(...) > 0`. Mixing `cos`/`sin` made parts appear to spin opposite ways. Lighting (highlights, sheen) stays fixed to the sun, not to the cup.
- **Never `closePath()` a shape you then stroke as an outline** if the closing edge crosses the object — it drew a black line across the cup's mouth.
- **Movement must match direction.** For anything moving left, wheels turn anticlockwise (`rot = x / r`), and walking legs lift while swinging forward. Joe spots backwards gaits instantly.
- **Birds and props should leave the frame, not vanish mid-air.**
- **Offer options when Joe is unsure.** For a cup or flag, render 3 stills side by side in one artifact page and let him pick.

- **The trophy must fill the middle like the others.** A squat trophy at the standard size looked "not in the middle". Compare a frame side by side with PCL; scale it up (the cauldron uses `CK = 1.15`) and widen the plinth so its feet stand on it.
- **Liquid must look like liquid.** Drawn shapes (a mushroom of goo, even stripes running down) were called "terrible". What worked was metaballs: soft blobs added into a small offscreen field, thresholded and lit per pixel (normal from the field gradient, a sharp specular, a darker rim), so drops merge and flow. Only shade the area the blobs cover, and keep the field around half size, or phones will struggle.
- **An eruption should go everywhere.** A violent fountain of seeded drops with gravity: some fall back in, some slide down the pot, some splat on the plinth, grass and props (scarecrow, pumpkins, stones) and ooze down them. Overflow streams must be uneven (different widths, some stopping short), never evenly spaced bars.
- **Pause the turn for a big moment.** The cauldron eases to a stop at the blast and restarts when it clears. Do it by integrating the turn speed (`turnTime`) so the angle never jumps, across loops too.
- **Effects in moderation.** Big green lightning was "too much" (now just a small spark over the rim), and bats bursting out of the blast weren't wanted.
- **Every branch joins the trunk.** Root limbs inside the trunk; check a close-up crop for gaps.
- **Buildings stand on flat ground.** Give a house on a hill a level terrace.
- **Clean props.** Pumpkins: shaded lobes and soft creases, no outline rings, a proper stem, tidy leaves instead of tangled vines.
- **League names can contain apostrophes.** `build_modules.py` now JSON-quotes the `LEAGUE_LIVE_ART` keys.
- **Measure speed in the game.** After wiring, time a few seconds of frames in the carousel (calm and during the headline moment) and compare with a lighter card like PCL.
- **Story beats over whack-a-mole.** Frontier Cup's first shootout (gunmen popping up everywhere) read as whack-a-mole. What worked: four characters, one story with two headline gags, and an ending that resets the loop.
- **Depth makes people readable.** A one-point-perspective street (camera helper `PJ(W,H,X,Y,Z)`, figure scale `KZ`) lets the nearest characters be big and the far ones small. Keep the town short (ends at Z≈12) so the distance shows either side of the trophy.
- **Don't fast-forward.** Joe found the first shootout too quick. Space shots about 0.7 s apart, ease every pop-up and duck (0.4 s), and slow strides; 30 s was fine for a story card.
- **Draw characters large in a harness first.** The figure kit (`drawGunman` in frontier.html) was redesigned at 3× in a test page: profile face, shaped hat, boots, gun belt, duster coat, breathing, run lean, hands-up beside the head.
- **Theme suitability over the house rules.** The 'no players' rule is about cricketers; Joe explicitly wanted people in this scene. Ask when a theme seems to need them.
- **An iceberg, not a wall.** Two glacier fronts (a long cliff, then a row of ice towers) read as "a shed" and "organ pipes". What worked: one sculpted pinnacle berg with big flat facets (sunlit pink-white vs lavender-blue shade), a natural arch, a glowing blue foot and a turquoise submerged shelf. Bright veins must stay faint or they read as neon tubes.
- **Never speed an effect up by scaling time.** `sin(t × speed)` with a changing speed lurches forward, worse the longer the card runs. Integrate the phase instead (the aurora's `auroraPhase` uses a cumulative table).
- **Soft light, not rays.** Repeated sprites read as stripes. Draw glow effects (the aurora) into a quarter-size offscreen canvas with gentle variation and scale it up.
- **Animals: fewer tricks.** A walking, turning bear looked wrong; a well-proportioned bear (long neck, small head, heavy hindquarters, big paws) that only moves his head and breathes worked. Build the body in a 3× harness.
- **Mirror reflections** are baked once in `paintBase()`: flip the back layer about the horizon and each object about its own waterline, tint, then lay it on the water in 2 px strips nudged sideways. Clip out anything standing in the water (`clip('evenodd')`).
- **"Frozen" means original ice magic only.** No characters or signature designs from the film; frost growth, a snowflake swirl and snowfall gave the feel.
- **Match the trophy's size by measuring.** Render a frame with and without `drawTrophy` and diff the pixels for its bounding box; Frozen Ashes' urn runs from y≈58 to the plinth base at y≈257 (of 355). Cosmos needed `UK = 0.72` to match.
- **A turning sphere needs moving detail.** Bands alone look still; streaks in every band and storms placed by longitude (`x = sin(lon + phi) × r`, hidden when `cos < 0`) make the spin obvious.
- **Check the league's grounds before choosing a creature or set piece.** A dragon was built for Inferno Cup, but the only dragon ground belongs to Wizard's Cup; save it for that card. Joe also dropped the forge (one of the four Inferno grounds) as clutter: the grounds are a guide, not a checklist.
- **Not too dark.** Even a night eruption needs lifted mid-tones: lighter sky gradient, clouds lit underneath, a soft additive glow over the land, a light vignette (≈0.18).
- **Features turning round a trophy must crossfade, not switch.** The flame arms popped when they swapped from back to front colouring; fading the front styling in by `cos(angle)` fixed it. Joe didn't like floating shards orbiting the trophy.
- **A rich sphere: render it per pixel.** The Molten Core's shell is an 84×84 offscreen texture (Voronoi plates on the sphere, lit, with glowing cracks), cached and only re-rendered when it visibly changes. Hand-drawn seam lines looked like scribbles.
- **Heat haze from the still layer, never the live canvas.** Redrawing rows of the `back` canvas with small offsets is cheap; reading back the live canvas cost ~2.5 ms a frame.
- **Avoid regular textures.** Horizontal strata read as planks, evenly spaced joints as a fence, separate pillars as a skyline, a perspective grid as paving. Irregular, stepped, staggered shapes read as rock.
- **Close the loop with the story.** The rocket launches, then lands back on the pad before the loop ends, so nothing has to pop back into place.
- **Facade text in perspective.** `ftext` draws words in vertical slices so they foreshorten; pass `stretch` for short words (BANK) and keep text clear of nearer buildings that overlap it.
- **Neon needs light, not darkness.** Dark, sparse neon scenes (rooftop, canyon, synthwave) were rejected as bland; what landed was Joe's reference: a busy rainy street, big saturated signs, wet reflections, steam and blue fog.
- **Depth in a street: vary everything.** Buildings stepping in and out (`inset`), four facade styles, haze by distance, a slightly blurred far layer and out-of-focus bokeh in front fixed "all buildings are samey".
- **Keep the trophy readable against glare.** A soft dark pocket behind it, haze drawn behind rather than over it, and light shafts kept off-centre.
- **Overlapping glows must not stack.** Combine sign glows with `lighten` (max), not `lighter`, or neighbours wash each other out to white.
- **Cost on phones is full-canvas copies.** Flatten static layers into one canvas in `paintBase()`, cache the common all-lit state, and copy only a sign's own patch (`drawImage` with a source rect) rather than clipping a full-canvas draw. Neon is the heaviest card so far (~2.3 ms/frame on desktop; ~50 fps in headless software rendering vs ~58 for Inferno).
- **Trophy: be original, per league.** Joe rejected cup-on-a-stem ideas for Jungle ("each trophy is totally unique"); he picked an Aztec pyramid from his own suggestion. Offer genuinely different objects (an egg, a living plant, a fossil plate, a building), not variations on a cup.
- **A turning 3D trophy: draw each face with its own details, back to front.** Ledges first, then any just-hidden face's stairs, then each visible face (side-on first) followed by its staircase. Drawing all stairs after all faces made them pop in and out as faces turned edge-on. Check with a frame-to-frame diff over a full turn (scratchpad `jump.py`).
- **Things Joe disliked on Jungle:** light running down the trophy stairs, a fan of sun rays and white glare behind the trophy, a rain shower and big rainbow, thin waterfalls on the far mesas, fast-flickering lights (they read as flashing on a phone — keep glows slow and gentle), a liana-walking monkey redesign (he preferred swinging on separate vines). Dinosaurs, birds and pterosaurs need proper anatomy (profile silhouettes with real proportions), not quick shapes.
- **Rock and water that read well:** a cliff of randomly placed, overlapping ragged slabs sorted top to bottom (each lit on its upper edges with a shadow lip below) — a grid of blocks looks like brickwork. A waterfall as a pre-rendered strip of soft vertical strands scrolled down inside the fall's outline, darker at the edges, with a bright lip.

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
- `python3 art/league-cards/tools/scan.py /abs/path/card_test.html` runs `frame()` every 50 ms for 60 s and prints any errors (`[]` means clean).
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
- He's watching credit. **Start a new chat for each card** — long sessions get expensive because every step re-reads the whole conversation. Also:
  - Batch changes.
  - Use one combined screenshot per check.
  - Only push to main when he signs a card off.
- When he asks "how can we improve?", give a short numbered list with your top picks, then do what he chooses.
