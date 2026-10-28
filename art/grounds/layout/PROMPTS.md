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
The game draws these on top, so keep the scenery behind them simple (no faces or key props hidden under them): scoreboard 7.0%–93.0% W, 5.6%–18.1% H; pause button 7.7%–19.6% W, 18.3%–24.0% H; last-six-balls strip 21.3%–52.5% W, 19.1%–22.9% H; BEST score sign 54.1%–80.0% W, 17.1%–26.4% H; name plate 2.6%–31.8% W, 94.3%–97.6% H.
```

## 2. HUD layer: scoreboard, energy bar, BEST score sign, pause, last-six strip
```
On flat #00FF00 green, each piece separate, nothing touching. All blank: no text or numbers.
- SCOREBOARD, 1007x318 px: two equal blank number panels, left (RUNS) and right (TARGET), each with a blank label strip above. A small themed crest may rise from the top centre.
- ENERGY BAR: an empty themed bar track built into the bottom of the scoreboard, 547x25 px, centred under the two panels (the game fills it).
- BEST SCORE SIGN, 303x236 px: a themed hanging sign with a blank panel, hangs under the TARGET panel.
- PAUSE BUTTON, 140 px round: themed badge with a pause symbol.
- LAST-SIX-BALLS STRIP, 365x96 px: themed holder with 6 empty round sockets in a row.
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

## 5. Fielders — 8 facing directions
```
On flat #00FF00, a grid. The same themed fielder [e.g. pirate deckhand] in each pose, drawn facing 5 directions: towards camera, 3/4 towards camera-left, side-on left, 3/4 away-left, away from camera (the game mirrors for the right = 8 directions).
Rows: ready crouch · run cycle 4 frames · dive · catch (hands up) · throw · celebrate.
Feet at the bottom centre of every cell, all the same scale.
```

## 6. Keeper, bowler, umpire
```
On flat #00FF00, same scale as the fielders.
KEEPER (from behind, facing up-screen): crouch · standing up · catching · appeal.
BOWLER (facing down-screen): run-up 4 frames · delivery stride · follow-through · appeal.
UMPIRE (facing down-screen): idle · OUT (one finger up) · FOUR (arm sweep, 3 frames) · SIX (both arms straight up).
```

## Where things stand in the game (for checking)
- HUD (measured from the live game): scoreboard 7.0%–93.0% W, 5.6%–18.1% H; energy bar 26.7%–73.4% W, 15.2%–16.2% H; BEST sign 54.1%–80.0% W, 17.1%–26.4% H; pause 7.7%–19.6% W, 18.3%–24.0% H; last six 21.3%–52.5% W, 19.1%–22.9% H; name plate 2.6%–31.8% W, 94.3%–97.6% H.
- Far stumps 50.0% H, batter's stumps 66.5% H, umpire 48.8% H, all at 50% W.
- Fielder spots — 17 places the game can put a fielder (10 on the field at once: keeper + 4 infield + 5 boundary, plus the bowler): mid-off (27.4%, 48.5%), cover (34.7%, 44.1%), extra-cover (43.5%, 42.2%), mid-wicket-in (56.5%, 42.2%), mid-on (65.3%, 44.1%), square-leg-in (73.4%, 48.1%), short-cover (27.8%, 55.7%), slip (62.7%, 76.0%), keeper (51.3%, 70.7%), long-off (31.3%, 30.9%), long-on (68.7%, 30.9%), point (6.8%, 60.0%), third-man (16.9%, 80.2%), square-leg (93.2%, 60.0%), fine-leg (83.1%, 80.2%), cover-boundary (14.6%, 41.9%), mid-wicket-boundary (85.4%, 41.9%).
