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

## 3. Pitch
```
On flat #00FF00. A themed cricket pitch strip [e.g. ship's deck planks], top-down, trapezoid: 89 px wide at the top, 136 px at the bottom, 418 px tall. Painted crease lines at each end. Nothing on it.
```

## 4. Stumps, bails, ball
```
On flat #00FF00, evenly spaced, nothing touching:
- ONE themed stump on its own [e.g. carved wooden post, brass cap], upright, 3/4 view
- ONE themed bail on its own
- the same stump tilted/falling at 3 angles
- the themed ball [e.g. dark red leather, gold seam] from above, 4 rotation frames
```

## 5. Fielders — 4 themed players, 8 directions each
One prompt per player per pose (4 players × 6 poses = 24 sheets). Swap [PLAYER] and [POSE].
```
On flat #00FF00, ONE row of 8 cells, evenly spaced, nothing touching. The same themed fielder [PLAYER — e.g. 1: tall pirate in a striped shirt and red bandana; 2: stocky pirate with an eyepatch; 3: young deckhand in a blue bandana; 4: bearded pirate in a tricorn hat] in the pose [POSE], drawn facing 8 directions, in this order: towards camera (S), towards camera-left (SW), left (W), away-left (NW), away from camera (N), away-right (NE), right (E), towards camera-right (SE).
Feet at the bottom centre of every cell, all cells the same scale. Each player looks clearly different from the other three.
```
Poses: ready crouch · running (4-frame cycle — one sheet per frame) · dive · catch (hands up) · throw · celebrate.

## 6. Keeper, bowler, umpire
```
On flat #00FF00, same scale as the fielders.
KEEPER (from behind, facing up-screen): crouch · standing up · catching · appeal.
BOWLER (facing down-screen): run-up 4 frames · delivery stride · follow-through · appeal.
UMPIRE (facing down-screen): idle · OUT (one finger up) · FOUR (arm sweep, 3 frames) · SIX (both arms straight up).
```

## 7. Pop-ups — FOUR, SIX, OUT and the rest
```
On flat #00FF00, each piece separate, nothing touching. Themed burst-style banner plates [e.g. torn treasure-map scroll with a cannon-smoke burst and gold coins], each about 878 px wide, with a BLANK centre panel for the word (the game writes it in the ground's font) and a small blank strip underneath for a subtitle:
- FOUR! — energetic, gold
- SIX! — the biggest and loudest, with extra flourish
- BOWLED! — stumps-and-bails motif, red
- CAUGHT! — hands/glove motif, red
- OUT — plain red plate (run out, LBW and other dismissals)
- TARGET! — target reached / win, green and gold
- small DOT BALL tag — quiet, about 410 px wide
No text or numbers.
```

## Where things stand in the game (for checking)
- HUD (measured from the live game): scoreboard 7.0%–93.0% W, 5.6%–15.0% H; energy bar 20.0%–80.0% W, 15.6%–17.2% H; BEST sign 58.0%–93.0% W, 18.0%–24.0% H; pause 7.0%–18.0% W, 18.2%–23.3% H; last six 21.0%–55.0% W, 18.8%–22.7% H; name plate 2.6%–31.8% W, 94.3%–97.6% H.
- Far stumps 50.0% H, batter's stumps 66.5% H, umpire 48.8% H, all at 50% W.
