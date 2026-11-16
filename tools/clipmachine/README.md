# Clip machine (Nov 16)

Auto-plays Flicky Cricket in headless Chrome and cuts vertical 1080x1920 social clips with the hook text burned in and an end card.

- `autoplay.js` injected into the page: skips the tutorial, keeps the game unpaused, starts a match in league `?lg=N`, swipes at the sweet spot every ball, logs runs with timestamps.
- `rec3.py SCENE OUTDIR` records one run (720x1280 screencast at ~52 fps, `SECS` long). Needs the game served at http://localhost:8765 (`cd www && python3 -m http.server 8765`).
- `build.py OUTDIR` turns the frames into a 30 fps 1080x1920 `full.mp4`.
- `batch.sh` records a list of grounds; `makeclips.py` cuts clip01–clip10 (hooks in its plan list).
- `cut.py` makes the hook overlay and end card (needs `assets/lilita.ttf` = site/lilita.ttf and `assets/icon.png` = the 1024 app icon).

Paths assume /home/claude/clips as the working folder. Clips are silent on purpose: add a trending sound in each app when posting.
No mascot anywhere, no real player names or logos.
