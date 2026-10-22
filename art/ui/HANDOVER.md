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

- Home: **done** (built from Figma frame "Home — Flicky v3").
- Next: pick the next screen (Gameplay HUD is next in the list).

## Design file & brand (from the Home round)

- Figma: https://www.figma.com/design/WjYzgtNxSxMY4XIT8Oaqem ("Flicky Cricket — Logo & Mascot", Kumu team). Holds the mascot concepts, the Home iterations (v1 → v3) and reusable components in "Components — Flicky Home": `art/*` icon components, Rail Button, Nav Tile — art, Currency Pill — art.
- Mascot: **Flicky**, a cheeky, friendly red cricket ball (winks, grins, little red arms and feet). Red, not white (reads as cricket worldwide, pops on green). No pads/gloves/bat by default; kit is better as unlockable cosmetics (cap, shades, helmet, white-ball skin).
- Look: deep navy (#01162C) with gold, chunky "game" UI — thick dark outlines (#050A14), 3D bases, top shine, Lilita One for UI type, illustrated 3D icons (no emoji, no line icons). Yellow is only for the main action (PLAY); red only for alerts/badges.
- Artwork is generated in Figma (generate_image, uses Joe's Figma AI credits — ask before spending). Ask for a plain #06152C/#01162C background so it can be keyed out; icons came from one 4×2 icon sheet.

## How the Home build works (lessons)

- This session can't download from figma.com or upload into Figma (proxy blocks both). Workaround that works: `get_screenshot` with `enableBase64Response:true` on the image node saves a full-size PNG locally.
- Icons/wordmark: navy background keyed out in PIL to real transparency, saved as WebP and embedded as data URIs in CSS classes (`.hi-trophy`, `.hi-coin`, …) so each image is in the file once. Lilita One is embedded as base64 woff2.
- Kept every original ID and JS hook (`menuGemCount`, `menuCoinCount`, `menuTrophyVal`, `menuBestVal`, `nextOpponentDisplay`, `menuChestAlert`, `startBtn`, `removeAdsBtn`, `removeAdsGemBundleBtn`, `howToPlayBtn`, `introText`, result panel, nav IDs). `#nextOpponentDisplay` is kept as screen-reader text.
- New JS (Home only): `updateHomeLeagueCard()` draws the current league's real card art (`lg.drawArt`) plus entry cost and trophy progress; taps on the chest button → Chests, league card → Leagues, gem pill → gem shop; How-to-play opens a popup (tap to close). `PLAY AGAIN` keeps the new button styling.
- Playwright: the PLAY button pulses, so click it with `force=True`.
- Wide screens keep the phone layout as a centred column.
- Tidy-up after launch (Joe: no duplicate options): one place per job. Chests only in the nav (tab glows/wiggles with an OPEN! badge when ready); no LEAGUE tab — the league card opens Leagues (`#leagueBtn` stays as a hidden button for its handler); no HOME tab — Joe prefers a back button top-left (`#navBackBtn`, shown by `showNav(tab)` on Kit/Chests/gem shop/Stats, hidden on Home and on Leagues, which has its own BACK); the two ad buttons moved into a SHOP panel (`#homeShop`) opened by the SHOP tab and the gem/coin + buttons, with a link to the Kit gem shop. Nav: KIT · CHESTS · SHOP · STATS, with `data-tab` so the active tab highlights.
- Stumps must look real (Joe): thin, straight, polished pale wood, ~19× taller than wide, almost touching; bails short, smooth turned wood. Image models default to fat cartoon posts and corn-cob bails, so spell out the proportions. The Home art was regenerated with a realistic wicket (Flicky mid-leap on the left, wicket on the right); How To Play moved to the left so the wicket stays clear.
