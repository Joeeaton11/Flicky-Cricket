# Ground prompts — generated from the game code
Do not edit by hand. Re-run `python3 art/grounds/layout/layout_from_code.py` after any layout change.
Replace [THEME] and the [e.g. …] parts per ground. Every result is checked with `--check` and aligned to the template before use.

## Shared block (top of every prompt)
```
BESPOKE (Joe): every ground is totally unique — its own architecture, materials, colour palette, landmarks, crowd look, scoreboard design, pause button, pitch, stumps, ball, rope, extras and lettering. Never reuse a look, layout idea or prop from another ground (e.g. not every night ground gets corner floodlight towers and gold rails).
STYLE LOCK (Joe, Nov 2 — art drifted realistic on gpt-image): a stylised 3D CARTOON mobile game exactly like Clash of Clans / Clash Royale / Boom Beach promo art: toy-like chunky shapes, smooth glossy plastic-like materials, chunky cute people with big round heads (no realistic faces), absolutely NOT realistic, NOT painterly, NOT a photo, no gritty fine detail. Put this FIRST in every prompt, especially for gpt-image-2.5-sunburst.
ART STYLE: glossy, ultra-vibrant 3D-rendered cartoon mobile-game key art, like Clash of Clans / Boom Beach promo art: hyper-saturated colours that pop (vivid turquoise water, lush emerald foliage, rich golds and reds), warm glowing lanterns and lights with soft bloom, strong rim lighting, deep ambient-occlusion shadows, crisp chunky detail, high contrast, everything polished and shiny. Chunky cute proportions (big heads, short bodies). Fantasy themes go big: fun, cool, over the top. Camera: high 3/4 top-down view looking straight up a cricket ground in portrait. CAMERA DISTANCE: [CAMERA — paste ONE of the 5 camera lines below, the one chosen for this ground].
THEME: [THEME].
LIGHT: soft sunlight from [LIGHT — chosen per ground, whatever looks best, e.g. top-left]. Use this same light direction on every asset for this ground.
SHADOWS: the ground and stadium may have painted shadows. Characters, props and HUD pieces have NO shadow under or behind them (the game adds those).
KEY BACKGROUND: separate pieces go on a flat pure #00FF00 green background and contain NO green at all. If the theme needs green on a piece (leaves, a parrot, green kit), use flat pure #FF00FF magenta instead and no magenta in the art.
SMALL ON SCREEN: characters show about 30 px tall on a phone, so bold simple silhouettes, chunky shapes, no fine detail. Kit colours must stand out clearly from the grass; the ball must stand out from the grass and the pitch.
LEFT/RIGHT: "picture-left" and "picture-right" mean the left and right of the image as you look at it.
No text, letters, numbers or logos anywhere unless asked.
```

## Camera distance — 5 levels (Joe, Nov 1). Pick ONE per ground, paste its line into [CAMERA]
The field oval is fixed by the layout, so the field, pitch and players are the same size at every level. The camera level only changes how big the world AROUND the rope looks. Each ground's level is recorded in themes/BIBLES.md and never changes between its generations.
```
1 CLOSE-UP: the camera is low and close. Only the first few rows of the crowd are visible, and they are big and detailed (faces, flags, banners readable), pressed right up against the boards. The stand fills every part of the picture outside the field, top to bottom. No sky, no roofline, no skyline.
2 MEDIUM-CLOSE: the camera is fairly close. A big crowd with chunky, readable people and big props fills the stands; the tops of the stands and a thin strip of roofline or sky show only along the very top edge.
3 MEDIUM: the camera is at middle distance. The whole ring of stands is visible with the crowd still readable as individual people, and a band of big landmarks or scenery shows above the far stand.
4 FAR: the camera is far away and high above. The whole stadium bowl is visible and grand, the crowd is small, and the wider scene beyond the far stand (coast, skyline, landscape, sky) is clearly visible.
5 FAR AWAY: the camera is very far away and very high. The stadium is a small part of a huge landscape: the stands are a thin ring, the crowd is tiny specks of colour, and city, countryside, coast or terrain fills most of the picture around the field, with sky only at the very top.
```
References in the game: 1 close-up = Rooftop (`tr_rooftop`) · 2 medium-close ≈ Gully 1a (`tg_gully`) · 3 medium = Wizard (`tw_wizard`), Pirate (`tp_pirate`) · 4 far = Chennai (`chennai_night`), T20 (`t20_night`) · 5 far away (none yet).

## NO STRETCH — make the plate fit first time (Joe, Nov 3: "stop stretching the image")
The image model returns 768x1792 for a 1000x2048 request — narrower than the phone (1170x2532). The plate is that image scaled by ONE uniform factor (~1.52) and moved: nothing is stretched, squashed, warped or ring-snapped. So the FIELD must be painted at the size the game needs *inside the 768x1792 frame*: widest point ~92% of the width (strip ~4% each side), ratio 1.576, top ~28% down, bottom ~90% down.
Use this FIELD block instead of the screen-frame wording in section 1 (calibrated Nov 3 — it gave ratio 1.567 / 1.580 / 1.583 on three grounds; "1.6 times + one eighth in" gives 1.65–1.77, "one and a half + one twenty-fifth in" gives ~1.42 and full width):
```
FIELD SIZE AND SHAPE (most important, it must fit a game layout exactly): the playing field is a perfect smooth ELLIPSE standing on end, with NO straight sections anywhere (NOT a running track, NOT a pill, NOT a rounded rectangle). At its widest point (its middle) it leaves a strip of stands about one twelfth of the picture's width between it and each side edge, so the side stands are clearly visible. It is one and a half times as tall as it is wide — a fat egg. Its top end is a little more than a quarter of the way down the picture. Its bottom end is nine tenths of the way down, leaving a band of about one tenth of the picture below it.
```
Check: screen the 256 px thumbnail first (upscale to 768x1792, run fit_grass.py) — only fetch full size when ratio is 1.54–1.61 and the width is 88–94%. Then `python3 ../tools/fit_uniform.py raw/plate_X.png` (one scale; repeats a sliver of stand if the sides come up a few px short) and `sky_top.py <rows>` for the sky above the painted top. No build_clean, no snap_ring.

## 1. Ground — surroundings, themed field, boundary rope
```
Portrait background. It MUST match the game layout below exactly. The layout is described in words on purpose: never write any measurement, number, label or guide line in the image.
FIELD: one TALL oval playing surface — themed, not always grass [e.g. raked beach sand, ice, ship's deck, turf] — plain and calm so a small ball shows clearly. It is about 1.6 times as tall as it is wide. Its left and right edges sit one eighth of the picture's width in from each side. Its top edge is just over a quarter of the way down the picture; its bottom edge is very near the bottom, leaving only a thin band (about a fifteenth of the height) below it. Its centre is three fifths of the way down. The thin strips beyond its left and right edges get cropped, so keep only scenery there.
It is a true smooth ellipse, not a racetrack with straight sides.
TIGHT STADIUM, NO GAP (very important, Joe): the field's edge IS the foot of the stands. Only a thin ring of boards (or the theme's equivalent) separates the field from the crowd, and those boards sit EXACTLY on the field edge all the way round, especially on the four diagonals: not a single strip of grass, track, sand or walkway outside the boards. The front row of the crowd sits immediately behind the boards. No painted rope on the grass: the boards themselves are the boundary.
The field edge is a clean crisp line. NO rope, NO markers, NO inner ring, NO lines on the field: the game draws the themed rope and 30-yard ring markers from the props sheet, exactly on the coded oval.
EMPTY: no pitch, stumps, players, umpire, ball or text on the field.
PROP SCALE (Joe): keep props at a believable size — no giant oversized props unless the theme truly calls for one.
SURROUNDINGS: busy, fun and cool — packed with life, characters and detail, edge to edge and top to bottom, OUTSIDE the oval only. Real-world themes (e.g. an IPL ground) should look like the real thing, in the home team's colours. No empty bands at the top or bottom.
SCREEN ZONES (the game's interface sits on top of these; paint scenery there, just keep it simple):
- TOP-LEFT BLOCK: from the left edge to just over three fifths of the way across, and from the top down to about 19 percent of the height: a scoreboard covers it. Simple background only here (sky, roofs, plain stand tops); no faces, landmarks or key props.
- TOP-RIGHT CORNER: a small round button sits in the very top-right corner. Keep that small spot plain.
- THE REST OF THE TOP (right of the scoreboard and below it, down to the stands): this stays on show the whole match. Put the ground's showpiece here: its landmark, skyline highlight or most fun detail [e.g. a lighthouse, a ship's mast, a giant tree with kids in it].
- Nothing is ever drawn on the field, so the field stays fully visible.
This is a background only: never paint any game interface, buttons, icons, panels or scoreboards.
```

## 2. HUD layer: corner scoreboard + pause (locked Oct 29, option 11)
Ball-limited chase (12 balls, 2 wickets). One compact scoreboard top-left, pause top-right, nothing else above the rope, nothing on the field.
```
On the flat key background, each piece separate, nothing touching. All blank: no text or numbers.
- SCOREBOARD, 690x296 px, three stacked bands in one themed frame:
  · top band (about 55%): a small square badge slot on the left (league crest), then a wide blank panel for the chase line, with TWO empty wicket slots at its right end.
  · middle band (about 35%): a blank area on the left for score and target, then 6 empty round sockets in a row on the right (this over).
  · bottom band (about 10%): a thin empty energy track across the full width, with a small icon slot at its left end for a themed energy symbol.
  · Extra props on the board are fine, but vary them per ground — never the same props in the same spot (e.g. not always something on both top corners) (Joe). The crest is drawn over the top-left corner by the game.
  · Describe this layout in WORDS only in the prompt — numbers/percentages get printed onto the art.
- PAUSE BUTTON, 132 px round: themed badge with a pause symbol.
```
A themed display font is chosen per ground; the game draws the chase line ("14 TO WIN · OFF 9 BALLS"), score, target, ball results, stumps (greyed when lost) and energy fill in it.
Last over / close finish is done by code, not art: a pulsing glow round the scoreboard and the chase panel tinted to an alert colour. Paint the frame so a glow round its outline reads well.
BEST score is not on the match screen; it shows on the result screen.

### Scoreboard text spec (MATCH_HUD_TEXT in the code; sizes at the 230 px-wide scoreboard, scale with its width)
Scaling: the scoreboard keeps its shape on every phone — width 59% of the screen, height from the 230:98 shape, top-left, 3 px under the safe area. Digits are fixed-width so ticking numbers don't jiggle.

| Slot | Content (size) | Alignment | Longest / states |
|---|---|---|---|
| Chase line | 14 (28px) + TO WIN (12px) + OFF 9 BALLS (13px) | left, vertically centred, the two small lines stacked right of the big number | 102 TO WIN · OFF 24 BALLS · normal: league colour · close (≤6 balls left or ≤6 needed): alert colour + scorebug glow · last ball: LAST BALL replaces OFF 1 BALLS · won: WON! |
| Wickets | 2 stumps (22px) | right, vertically centred; always 2 sets | standing = wicket in hand · lost = knocked over / 30% opacity, lost from the left |
| Score + target | 10-1 (20px) + TGT 24 (13px) | left, baseline aligned | 98-1 TGT 102 |
| This over | 6 sockets (14px) | right, evenly spaced | empty = outline · dot = • · 1/2/3 = cream · 4 = gold · 6 = orange · W = red with white W · resets after 6 balls (12 balls = 2 overs) |
| Energy icon | bolt icon (13px) | left | pulses red when energy < 25% |
| Energy bar | fill (6px) | fills left to right | green > 50% · amber 25–50% · red < 25% with pulse |
| Badge | league crest image (30px) | centred, no text |  |
| Pause | pause icon (16px) | centred, 44px tap target |  |

## 3. Props sheet: pitch, stump, bail, ball (one generation)
```
On the flat key background, each piece separate, evenly spaced, nothing touching:
- PITCH (the playing strip / wicket — ALWAYS made for this scene, never generic): a cricket pitch strip in the same material, colour, light and wear as this ground's surface [e.g. chalk-drawn on sun-faded concrete for a rooftop, dusty worn clay for a maidan, cracked concrete for a gully, ship's deck planks for a pirate ship], scuffed and used so it sits INTO the ground rather than looking clean and crisp, top-down, trapezoid 89 px wide at the top, 136 px at the bottom, 418 px tall, crease lines at each end in the scene's style (chalk, paint, scratched, roped…) and slightly worn, nothing on it.
The stumps and bails are also made for the scene [e.g. taped sticks, bamboo, weathered club stumps], in real slender proportions.
- ONE themed stump [e.g. carved wooden post, brass cap], upright, 3/4 view.
- ONE themed bail.
- ONE themed ball [e.g. dark red leather, gold seam], seen from above.
- ROPE SEGMENT: a straight horizontal length of the themed boundary rope, evenly thick, both ends cut square so it tiles.
- RING MARKER: one small themed marker seen from above [e.g. a seashell, a white disc] — repeated by the game round the 30-yard circle.
- MOVING EXTRAS (3–5 small separate pieces the game animates): [e.g. a skull flag, a waving pirate fan, a parrot with wings up and wings down, a lantern flame].
```
The game rotates, throws and spins the stump, bail and ball itself: no falling or spinning frames needed.

## 4. Fielders: one base fielder, 4 sheets
The game makes 4 players from this one fielder by recolouring the shirt (and later swapping headwear). If they look too alike, add a second body shape (4 more sheets).
Draw 5 directions; the game mirrors 3 of them for the other side.
```
On the flat key background, ONE row of evenly spaced cells, nothing touching. The same themed fielder [e.g. pirate deckhand in a red bandana] with a shirt in ONE flat plain colour (no stripes or pattern, so the game can recolour it), in the pose [POSE].
Feet at the bottom centre of every cell, all cells the same scale.
```
- Sheet 1, STANDING ready crouch, 5 cells: facing camera · 3/4 towards camera, facing picture-left · side-on, facing picture-left · 3/4 away, facing picture-left · away from camera.
- Sheet 2, RUNNING, 4-frame cycle × 5 directions, as a 5-row grid (rows = the 5 directions above, columns = frames 1–4).
- Sheet 3, two rows of 3 cells (facing camera · side-on facing picture-left · away from camera): row 1 PICK UP (bending to scoop the ball one-handed); row 2 THROW (arm back, about to throw to the keeper).
- Sheet 4, two rows of 3 cells (same 3 directions): row 1 CATCH (hands cupped up high); row 2 DIVE (full-length dive, arms stretched out).

## 5. Bowler (own sheet)
```
On the flat key background, one row, same scale as the fielder. A themed bowler [e.g. pirate captain] seen from the batter's end, facing down-screen towards the camera: run-up 4 frames · gather/leap · delivery stride (arm high) · release · follow-through.
```

## 6. Keeper and umpire (one sheet)
```
On the flat key background, same scale as the fielder.
KEEPER (from behind, facing up-screen), themed gloves and pads: crouch · standing up · catching · appeal.
UMPIRE (facing down-screen), themed outfit: idle · OUT (one finger up) · FOUR (arm sweep, 3 frames) · SIX (both arms straight up).
```

## 7. Pop-up words + scoreboard digits (one generation) — NO starburst
Painted lettering in the ground's own style, like the Gully truck-art words. No burst, rays, bang or ribbon behind them. A small themed backing or props are fine if they suit the theme [e.g. a torn scroll, coins, a cannon puff].
```
On the flat key background, each word separate, nothing touching. Big chunky hand-painted 3D lettering in the theme's style [e.g. gold pirate lettering with rope outline], spelled exactly:
FOUR!   SIX!   CAUGHT!   BOWLED!   OUT!
and for the result screen:   YOU WON!   SO CLOSE!   NEW BEST!
and the scoreboard digits, each separate:   0 1 2 3 4 5 6 7 8 9
SIX! the biggest and boldest. Each word on one line, letters fully visible, nothing cropped. Digits all the same height and width.
```

## No extra generation needed
- League select card and result-screen backdrop: cut from the ground background.
- Shadows under characters and props: drawn by the game in this ground's light direction.

## Generations per theme
Ground 1 · HUD 1 · props 1 · fielder 4 · bowler 1 · keeper + umpire 1 · words 1 = **10**. A second ground in the same theme: **1** (just the background).

## Where things stand in the game (for checking)
- HUD (MATCH_HUD in the code): scoreboard 3.1%–62.1% W, 7.3%–19.0% H; pause 85.1%–96.4% W, 7.6%–12.8% H.
- Far stumps 50.0% H, batter's stumps 66.5% H, umpire 48.8% H, all at 50% W.

## CROWD SIZE camera (Joe, Nov 3: Chattogram "crowd gone small again", Sylhet v1 "too big now")
The right size sits in between — Sylhet v2 (Figma 475:191). Use this CAMERA block on every ground:
```
CAMERA: CLOSE — the camera is pulled in tight. The crowd people are chunky with big round heads and waving arms, each fan's head about one twentieth of the picture's width, so four or five rows of fans fit across each side strip. Every spectator the SAME size everywhere including the far end and the very bottom edge. The stands run straight OFF the edges of the picture: we only see their lower tiers packed with chunky fans. No tiny distant crowd, no wide view, no panorama.
```
Too small = tiers of tiny people (Chattogram, Mirpur). Too big = only 2–3 rows of huge heads (head 1/12 width, Sylhet v1).
Pair with FIELD "one tenth strip, about one and a half times as tall as it is wide, top a fifth of the way down" (screened 1.577).
