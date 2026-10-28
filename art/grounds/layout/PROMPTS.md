# Ground prompts — generated from the game code
Do not edit by hand. Re-run `python3 art/grounds/layout/layout_from_code.py` after any layout change.
Replace [THEME] and the [e.g. …] parts per ground. Every result is checked with `--check` and aligned to the template before use.

## Shared block (top of every prompt)
```
ART STYLE: stylised 2.5D cartoon mobile-game art, hand-painted like Supercell's Clash of Clans / Clash Royale. Chunky cute proportions (big heads, short bodies), thick dark outlines, saturated colours, soft painted lighting. Camera: high 3/4 top-down view looking straight up a cricket ground in portrait.
THEME: [THEME].
No text, letters, numbers or logos anywhere unless asked.
```

## 1. Ground — surroundings, themed field, boundary rope
```
Portrait background, exactly 1170x2532 px. It MUST correctly and accurately match the coded game layout below. Positions are exact, not suggestions. % of width (W) / height (H), pixels in brackets.
FIELD: one oval of themed grass, centre 50% W / 60.0% H (585, 1519). Left edge 4.0% W (47), right edge 96.0% W (1123), top 26.5% H (671), bottom 93.5% H (2367). Grass themed [e.g. lush tropical turf, mown stripes] but plain and low-contrast so a small ball stays visible.
BOUNDARY ROPE: a themed rope [e.g. thick ship's rope with small flag markers] laid exactly on that oval edge, all the way round.
INNER RING: a faint themed dotted ring, centre 50% W / 57.6% H, from 28.0% to 72.0% W and 39.7% to 75.5% H.
EMPTY: no pitch, stumps, players, umpire, ball or text on the field.
SURROUNDINGS: fill the whole canvas edge to edge, top to bottom, with themed stands, crowd and scenery, OUTSIDE the oval only. No empty bands at the top or bottom.
The game draws these on top, so keep the scenery behind them simple (no faces or key props hidden under them): scoreboard 7.0%–93.0% W, 5.6%–15.0% H; energy bar 20.0%–80.0% W, 15.6%–17.2% H; pause button 7.0%–18.0% W, 18.2%–23.3% H; last-six-balls strip 21.0%–55.0% W, 18.8%–22.7% H; BEST score sign 58.0%–93.0% W, 18.0%–24.0% H; name plate 2.6%–31.8% W, 94.3%–97.6% H.
```

## 2. HUD layer: scoreboard, energy bar, BEST score sign, pause, last-six strip
```
On flat #00FF00 green, each piece separate, nothing touching. All blank: no text or numbers.
- SCOREBOARD, 1006x238 px: two equal blank number panels, left (RUNS) and right (TARGET), each with a blank label strip above. A small themed crest may rise from the top centre.
- ENERGY BAR: an empty themed bar track, its own piece that sits just under the scoreboard, 702x41 px, centred under the two panels (the game fills it).
- BEST SCORE SIGN, 410x152 px: a themed hanging sign with a blank panel, hangs under the TARGET panel.
- PAUSE BUTTON, 129 px round: themed badge with a pause symbol.
- LAST-SIX-BALLS STRIP, 398x99 px: themed holder with 6 empty round sockets in a row.
```
A themed display font is chosen per ground; the game draws RUNS, TARGET, the numbers, the energy fill and BEST in it.

## 3. Props sheet: pitch, stump, bail, ball (one generation)
```
On flat #00FF00, each piece separate, evenly spaced, nothing touching:
- PITCH: a themed cricket pitch strip [e.g. ship's deck planks], top-down, trapezoid 89 px wide at the top, 136 px at the bottom, 418 px tall, painted crease lines at each end, nothing on it.
- ONE themed stump [e.g. carved wooden post, brass cap], upright, 3/4 view.
- ONE themed bail.
- ONE themed ball [e.g. dark red leather, gold seam], seen from above.
```
The game rotates, throws and spins the stump, bail and ball itself: no falling or spinning frames needed.

## 4. Fielders: one base fielder, 4 sheets
The game makes 4 players from this one fielder by recolouring the shirt (and later swapping headwear). If they look too alike, add a second body shape (4 more sheets).
Draw 5 directions; the game mirrors 3 of them for the other side.
```
On flat #00FF00, ONE row of evenly spaced cells, nothing touching. The same themed fielder [e.g. pirate deckhand in a red bandana] with a shirt in ONE flat plain colour (no stripes or pattern, so the game can recolour it), in the pose [POSE].
Feet at the bottom centre of every cell, all cells the same scale.
```
- Sheet 1, STANDING ready crouch, 5 cells: facing camera · 3/4 towards camera-left · side-on left · 3/4 away-left · away from camera.
- Sheet 2, RUNNING, 4-frame cycle × 5 directions, as a 5-row grid (rows = the 5 directions above, columns = frames 1–4).
- Sheet 3, PICK UP (bending to scoop the ball one-handed), 3 cells: facing camera · side-on left · away from camera.
- Sheet 4, CATCH (hands cupped up high), 3 cells: facing camera · side-on left · away from camera.

## 5. Bowler (own sheet)
```
On flat #00FF00, one row, same scale as the fielder. A themed bowler [e.g. pirate captain] seen from the batter's end, facing down-screen towards the camera: run-up 4 frames · gather/leap · delivery stride (arm high) · release · follow-through.
```

## 6. Keeper and umpire (one sheet)
```
On flat #00FF00, same scale as the fielder.
KEEPER (from behind, facing up-screen), themed gloves and pads: crouch · standing up · catching · appeal.
UMPIRE (facing down-screen), themed outfit: idle · OUT (one finger up) · FOUR (arm sweep, 3 frames) · SIX (both arms straight up).
```

## 7. Pop-up words (one generation) — NO starburst
Painted lettering in the ground's own style, like the Gully truck-art words. No burst, rays, bang or ribbon behind them. A small themed backing or props are fine if they suit the theme [e.g. a torn scroll, coins, a cannon puff].
```
On flat #00FF00, each word separate, nothing touching. Big chunky hand-painted 3D lettering in the theme's style [e.g. gold pirate lettering with rope outline], spelled exactly:
FOUR!   SIX!   CAUGHT!   BOWLED!   OUT!
and for the result screen:   YOU WON!   SO CLOSE!   NEW BEST!
SIX! the biggest and boldest. Each word on one line, letters fully visible, nothing cropped.
```

## Generations per theme
Ground 1 · HUD 1 · props 1 · fielder 4 · bowler 1 · keeper + umpire 1 · words 1 = **10**. A second ground in the same theme: **1** (just the background).

## Where things stand in the game (for checking)
- HUD (THEMED_HUD in the code): scoreboard 7.0%–93.0% W, 5.6%–15.0% H; energy bar 20.0%–80.0% W, 15.6%–17.2% H; BEST sign 58.0%–93.0% W, 18.0%–24.0% H; pause 7.0%–18.0% W, 18.2%–23.3% H; last six 21.0%–55.0% W, 18.8%–22.7% H; name plate 2.6%–31.8% W, 94.3%–97.6% H.
- Far stumps 50.0% H, batter's stumps 66.5% H, umpire 48.8% H, all at 50% W.
