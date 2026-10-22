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
- Joe then asked for the middle stump's base to sit properly between the others and for Flicky branding on the stumps. Rather than regenerate (which would change Flicky), the wicket was repainted in code: old stumps removed with a mask-aware background fill (OpenCV), three cylinder-shaded stumps redrawn (middle based in the middle, leaning ~4° back against the right one), each with its own decal: navy band, gold trims, Flicky badge and FLICKY reading up the stump. One logo spread across all three stumps doesn't work at this size — the gaps chop it up.

## Home polish pass (after Joe's review)

- Redo, don't patch: Joe wants elements remade properly rather than edited in place.
- Key art regenerated in one go (Figma node 39:191): smooth glossy Flicky (no leather texture), camera down the pitch with the wicket at the end of the pitch strip, three thin real stumps with the middle one between the others, turned bails, FLICKY decals on the stumps; navy sky and navy-fading grass so the art runs into the top bar and nav without seams. Offset slightly (`translateX(-44%)`) so Flicky isn't cut off.
- Top bar: no Flicky picture; trophies, gems and coins as three equal-width pills, icons inside the pills, numbers centred, + on gems/coins.
- How To Play removed from Home (`#howToPlayBtn` kept hidden for the existing code).
- Nav: four even tiles (same size, icon centred, badge on the tile's top-right corner), gold tile for the active tab, chest tile glows when a chest is ready; the bar fades up out of the art instead of a hard strip.
- Flicky replaced after review ("he looks weird"): new Flicky rendered on his own on a green screen (Figma node 42:191: smooth glossy ball, two big friendly eyes with one winking, big grin, fist up, facing the wicket), keyed out and placed where the old one was; the rest of the art (39:191) unchanged. To change only the character in future, render him on #00FF00 and swap him in — regenerating the whole scene changes everything else too.

## Art direction (agreed, before rebuilding the screens)
- Style: painted 2.5D casual-game look like Joe's pirate reference (Royal Match / Clash of Clans): saturated, warm, UI made of the league world's real materials. Concepts: Figma section "Style direction: painted league skins" (Gully Cup, Floodlit Series, Pirate League).
- **The UI skin changes per league** (Joe's call): same layout, different materials, signage and props per league.
- Home keeps a close-up of Flicky for now (may become the league ground from above later).
- Flicky is locked by the layer set in `art/flicky/` (see its README): both eyes open by default, smooth glossy red, no pads/gloves by default, always a separate layer.
- Next step: build the Gully Cup skin properly into Home (painted frame set + live text), then other leagues tier by tier.

