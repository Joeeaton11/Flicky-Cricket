# Floodlit Series painted grounds

## Dusk Stadium (Oct 27) — first one
- Plate: Figma 268:191 (gemini-3.1-flash-image, 1024×2048 prompt → 768×1376). Two-tier floodlit stand with big screen, LED board ring, dugouts, sightscreen, camera crane, roller. `plate_raw.png`.
- Towers: Figma 269:191 on #00FF00 (`towers_raw.png`), keyed out and stood in the top corners (bases at x 120 / 1050, y 600 of the 1170×2532 plate) with a soft baked glow — the plate's own towers fall outside the phone crop.
- Build: Real-ESRGAN 4× (art/grounds/tools), ONE uniform scale (2.094) + offset so the painted white track line matches the game oval (FIELD_CY .60 / RX .46 / RY .335 at 1170×2532); the white line is inpainted away (the game draws its own rope). Result `plate_final.png` → `assets/floodlit/dusk_stadium.webp`.
- Code: `FLOOD_PLATES` / `floodPlate()` / `drawFloodPlateScene()` in drawStands — the plate is drawn to fill the screen (exact on 390×844 and 430×932; squashed ~18% vertically on 375×667). Pitch, rope, players and scoreboard are the game's own.
- Test: `flicky-cricket.html?scene=dusk_stadium`.
- Not done yet: own HUD skin / words, painted players, tan pitch, crowd animation, the other 6 Floodlit grounds.
