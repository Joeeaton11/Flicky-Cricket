# Floodlit Series painted grounds

## Dusk Stadium (Oct 27) — first one
- Plate: Figma 268:191 (gemini-3.1-flash-image, 1024×2048 prompt → 768×1376). Two-tier floodlit stand with big screen, LED board ring, dugouts, sightscreen, camera crane, roller. `plate_raw.png`.
- Towers: Figma 269:191 on #00FF00 (`towers_raw.png`), keyed out and stood in the top corners (bases at x 120 / 1050, y 600 of the 1170×2532 plate) with a soft baked glow — the plate's own towers fall outside the phone crop.
- Build: Real-ESRGAN 4× (art/grounds/tools), ONE uniform scale (2.094) + offset so the painted white track line matches the game oval (FIELD_CY .60 / RX .46 / RY .335 at 1170×2532); the white line is inpainted away (the game draws its own rope). Result `plate_final.png` → `assets/floodlit/dusk_stadium.webp`.
- Code: `FLOOD_PLATES` / `floodPlate()` / `drawFloodPlateScene()` in drawStands — the plate is drawn to fill the screen (exact on 390×844 and 430×932; squashed ~18% vertically on 375×667). Pitch, rope, players and scoreboard are the game's own.
- Test: `flicky-cricket.html?scene=dusk_stadium`.
- v2 polish (Oct 27): towers re-placed so the lamp heads sit fully above the scoreboard (`plate_v2`), baked edge vignette; live in code (`FLOOD_INFO`): breathing light beams + lamp halos, camera flashes in the stands, LED ticker on the stand's big screen (league · runs · target), `drawFloodPitch` (tan strip on a lighter square, popping/return creases, worn ends).
- Not done yet: own HUD skin / words, painted players, the other 6 Floodlit grounds.

## Redesign: FRIDAY NIGHT LIGHTS (Oct 28) — replaces the plate above on `dusk_stadium`
- Joe's rule #1 (see art/ui/HANDOVER.md): designs follow the game layout exactly. Image models won't paint exact geometry, so the method is now: ART = surroundings only, CODE/BAKE = the field.
- Art: Figma 272:191 (`fnl/raw_272-191.png`) — night T20 party bowl: phone-light crowd, lasers, fireworks, DJ booth, flame cannons. Clean-ups: placeholder boxes bottom-left and two white rules across the top inpainted. Mapped to 1170×2532 by a phone-aspect crop and a piecewise vertical map (top kept 0–26.5%, middle 26.5–81% → 26.5–90%, bottom squeezed). Towers (269:191) re-added in the top corners, lamps at (0.081/0.918, 0.129).
- Baked on the exact oval: dark concourse apron (oval + 0.038W / 0.022H) with a soft shadow, striped floodlit grass, white rope. Template overlay check: `art/grounds/layout/layout_1170x2532.png`.
- Live in code: `drawFloodLed` LED board ring on the apron (44 boards) — idle colour chase, FOUR gold wave, SIX rainbow strobe + flame cannons + fireworks, OUT red flash (`window._floodFx`, set at the top of `fxBig`); beams, crowd flashes, tan pitch as before.
- Concepts that broke the layout rule (kept for reference only): concept_A_friday_night_lights.png, concept_B_colosseum.png.
