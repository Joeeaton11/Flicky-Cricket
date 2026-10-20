# UI redesign — handover

Joe wants every screen of Flicky Cricket redesigned, **one screen per chat**, designed visually first and only then built into the game. The 27 animated league cards are finished (see `art/league-cards/HANDOVER.md`); the redesigned UI should feel like it belongs with them: rich, polished, premium.

## The screens, in order

1. **Home** — `#overlay`: logo, the pitch scene behind, best score / current league / chest line, PLAY, Remove Ads, and the bottom nav (`#bottomNav`: Kit, Chests, League, Stats). ← start here
2. **Gameplay HUD** — the in-match screen.
3. **Result** — `#resultScreen` (`showResultScreen`).
4. **Leagues** — `#leagueScreen` (`renderLeagueScreen`), carousel of the league cards.
5. **Kit** — `#customiseScreen` (`renderKitBagTab`, `renderEquipSlotTab`, `renderGemShopTab`, popups).
6. **Chests** — chest tab (`renderChestTab`) and the opening (`#chestRevealScreen`, `showChestOpenAnimation`, `showChestReward`).
7. **Stats** — `#statsScreen` (`renderStatsScreen`).

Also: popups/overlays (`showMessage`, `#milestoneOverlay`, `#upgradeFlashOverlay`, stat/kit info popups).

## How each screen goes

1. **Capture** the current screen at phone size (390×844) with Playwright from `flicky-cricket.html`. One combined image per check. Read the screen's HTML/CSS/JS so the design keeps every real element and number.
2. **Design** it on the Design artifact canvas (Artifact quickstart, intent `design`): the current screen beside 2–3 redesign options at phone size. Joe picks, comments and iterates there.
3. **Build** the signed-off design into `flicky-cricket.html`, matching the canvas. Change only that screen. Check it at phone size, no console errors, then commit and push to **main** (GitHub Pages deploys only from main; check with `gh run list -R Joeeaton11/Flicky-Cricket`).
4. Note decisions and lessons in this file.

## Working with Joe

- Founder; reviews on his phone; wants short, plain answers.
- Watching credit: batch changes, one combined screenshot per check, a new chat per screen.
- Change only what he asks; don't restyle things he didn't mention.
- When he asks "how can we improve?", give a short numbered list of top picks, then do what he chooses.
- Only push to main when he signs a screen off.

## Progress

- Home: not started.
