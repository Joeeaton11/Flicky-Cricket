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
- Kit: **done** and live (Golf Clash style bag, per-item art and crests for all 40 items).
- Gameplay HUD: **parked** (Oct 24). Every ground and its HUD gets redone in the painted style, which costs a lot of credits, so it waits until the rest is tied down. Gully Cup HUD concepts (truck-art board, chai-stall chalkboard, brick-wall plates) are on the Design canvas, Gameplay HUD page. Known bugs still to fix: a stray "null" under "BOWLED!"; some grounds draw no scoreboard (e.g. the Mumbai rooftop ground).
- Chests → **Kit Bags: done** and live (Oct 24).
- Stats: **done** and live (Oct 25).
- Popups + in-game commentary: **done** and live (Oct 25).
- Game loop review (Oct 25): Joe asked for the loop to be nailed down before the Leagues screen. Agreed plan (wireframe in chat): 1 fix loop basics ✅, 2 Leagues screen (option A: big card carousel) ✅, 3 Result screen ✅, 4 Player screen / character creation (cosmetics only, unlockables), 5 trophy road (reward every ~10 🏆), 6 daily missions + free daily bag, 7 season pass + events, 8 gameplay HUD + per-league skins (parked).

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

## Art standard (Oct 24, Joe)
- Joe's pirate-ground gameplay image is the quality bar for the whole game (not the pirate theme): painted top-down diorama ground, wooden flip-number RUNS/TARGET scoreboard, energy bar, BEST plaque, themed props and signs.
- Every stadium/scene gets its own bespoke HUD and pitch/stadium art in that style.

## Art direction (agreed, before rebuilding the screens)
- Style: painted 2.5D casual-game look like Joe's pirate reference (Royal Match / Clash of Clans): saturated, warm, UI made of the league world's real materials. Concepts: Figma section "Style direction: painted league skins" (Gully Cup, Floodlit Series, Pirate League).
- **The UI skin changes per league** (Joe's call): same layout, different materials, signage and props per league.
- Home keeps a close-up of Flicky for now (may become the league ground from above later).
- Flicky is locked by the layer set in `art/flicky/` (see its README): both eyes open by default, smooth glossy red, no pads/gloves by default, always a separate layer.
- Next step: build the Gully Cup skin properly into Home (painted frame set + live text), then other leagues tier by tier.


## Kit icons
- Category icons in `art/kit-icons/` (bat, gloves, pads, helmet, shoes): navy, gold and white, chunky glossy. Joe prefers these to a Flicky-branded version: do not put the red ball / seam motif on everything. Shoe redrawn with two stripes (navy + gold) instead of three, so it no longer looks like a sports brand.

## Kit screen build (Golf Clash style)
- Design on the Design canvas ("Kit" page): bag, showroom, compare, upgrade. Joe liked Golf Clash's golf bag; no Flicky on this screen.
- Bag: kit types down the left (category icons from `art/kit-icons/`, green ▲ when the equipped item can upgrade), equipped item card with 10-segment stat bars + cards bar + upgrade button, then every item in that type as a 2-column grid (locked = greyed icon + padlock + "SEASON N" / "IN CHESTS" / gem price). Kit rating strip on top.
- Showroom (tap any item): item on a pedestal, arrows + swipe + dots through the type, stats with green upgrade gains, COMPARE + EQUIP / UPGRADE / UNLOCK (gems) / FIND IN CHESTS.
- Compare: equipped vs chosen item, green better / red worse. Upgrade popup: LV n → n+1, gains, coin cost.
- Code: `renderKitBag()`, `kbShowroom()`, `kbCompare()`, `kbUpgrade()` replace the old Kit Bag and per-slot tabs; they call the existing `upgradeItem`, `unlockPremiumItem`, `saveEquipmentState`. The old tab row and DONE button are hidden (nav + back button do that job); Chests and Gem Shop still render in the same screen. `renderKitBagTab` / `renderEquipSlotTab` are left in place but unused.
- Every item in a type shows the same category icon for now. Next chat: new list of equipment styles per category, then redesign each item's art and wire it in.


## Kit item art + Home background (Oct 23)
- Item names renamed per the agreed list (IDs unchanged). Per-item art in `EQUIP_ART` (WebP data URIs), one `.ka-<id>` CSS class each; `kbTile` uses it when present, else the category icon. Epics/legendaries are in; commons/rares were regenerated more detailed (Figma nodes 63–67:191) but only the bats sheet could be fetched before the Starter plan's MCP limit hit.
- Style rules Joe agreed: medium boldness (themed paint/decals, obvious logos) placed where real branding goes; shaped bat-face decals like real pro bats on some items; no real brand marks (no swoosh, three stripes or formstrip); same size and angle per slot; better image model (gemini-3.1-flash-image).
- Home for now: floodlit stadium background with the gold/cream "Flicky Cricket" logo (Joe's images), replacing the Flicky key art. Everything else from the polish pass stays.
- All 40 items now have art (8 per slot). Gloves and pads gained gem-only legendaries: The Kohinoor (gloves) and The Wall (pads), 349 gems each. Common/rare gloves regenerated with a strict "four fingers + one thumb" rule after extra digits crept in. Figma upgraded to Professional, which lifted the MCP call limit.
- Kit polish (Oct 24): every item has a crest (`EQUIP_CREST`, `.kc-<id>`) on the top-right corner of its box and beside its name in the showroom; rim colour = rarity. Bigger item art in the list (64px). NEW tags + shine on items you have but haven't opened in the showroom (`flickySeenKit` in localStorage; first run marks everything owned as seen), NEW badge on slot tabs. Showroom: rarity-coloured glow, gentle float + glint, pop-in for new items, sparkle burst on equip/upgrade. Next-level gains shown on the equipped card too.
- Kit sets (`KIT_SETS`): CLASSIC, WILD, STORM, FORTRESS, ROYAL. Wearing 2/3/4/5 items from one set adds +2/+4/+6/+8 to every stat on those items (`kitSetBonus`, applied in `getEquipStat`, capped at 100). Set chips under the kit rating; set line with tiers on the equipped card and showroom.
- Parked: locked items as silhouettes (Joe: maybe later).
- More kit (Oct 24): tap any stat name (with "?") for what it does (`showStatInfoPopup`, emoji icon hidden). BEST KIT button on the rating strip tries every owned combination, set bonuses included (`kbBestLoadout`). Sets strip opens a KIT SETS view (`kbSetsView`): each set's items, owned/worn counts and bonus tiers; tap an item for its showroom. The in-match batter wears the equipped kit: helmet + grille, gloves + trim, pads + straps, boots + soles, bat blade + grip + sticker (`KIT_LOOK` colours per item, in `drawBatsman`). Shirt, trousers and face still come from the old colour customiser.
- Set bonuses switched OFF (Joe: cluttered, not adding much): `KIT_SETS_ON = false` hides the set chips, set lines and Kit Sets view and removes the bonus from `getEquipStat`. Data and code kept; flip the flag to bring them back. BEST KIT now just picks the highest-rated owned items.



## Kit Bags screen (was Chests), Oct 24
- Joe's calls: cricket **kit bags**, not treasure chests; **changing room**, not trophy room; **5 tiers**: WOODEN, BRONZE, SILVER, GOLD, PLATINUM. Platinum replaces Elite and Legendary (`CHEST_TYPES.elite/legendary` alias to platinum, and old saves are converted on load). This also fixes the top 9 leagues, which awarded a `platinum` chest that didn't exist.
- Bags are an upgrade path in real cricket bag shapes, long and low, each opening its own way: wooden = junior canvas duffle (zip), bronze = maroon club holdall (red-ball zip pull), silver = bottle-green wheelie with a cream stripe (flap), gold = navy and cream pro leather bag (stumps-and-bails buckles), platinum = ivory hard-shell kit trunk (latches). Joe kept the wooden bag and asked for cricket club colours on the rest. No bat on the lid. The kit trunk must not look like a funeral casket.
- Art is in `CHEST_IMG_SRC` / `CHEST_OPEN_SRC` (closed and open WebP, all on the same 320×240 canvas with the bag the same length so every tier draws the same size); `drawChestArt(canvas, type, pct, open)` draws them. Old canvas chest drawing is kept as `drawChestArtLegacy` (unused).
- Screen: changing-room background (Figma 103:191); each bag sits in an open wooden locker (102:191) with a tier-coloured name tag (`--tc/--tt/--tg` per `data-tier`), and the button sits on the bench. A ready bag's locker lights up. Locked 5th locker with a 200-gem unlock. "Free bags in …" pill. Tap a bag (the "i") for contents, unlock time and rarity odds (`showBagInfo`).
- Rules: **one bag unlocks at a time** (`bagUnlockingIdx`; others show WAITING). Gem spends over 20 ask first (`bagConfirm`). Free daily bags wait for an empty locker instead of being lost.
- Opening: room dims, the bag shakes, then the open-lid art pops with its own sound (`playBagOpenSound`). Coins/gems and item cards share one 352px frame. Cards: rarity-coloured frame, painted backdrop per rarity (nets / village green / county ground / floodlit stadium), flip-in, foil on epic and legendary, painted item art. Epic and legendary get a build-up ("SOMETHING LEGENDARY…", shake, rising notes, flash). SKIP goes to the summary (YOU RECEIVED + COLLECT).
- Earned bags fly from Home into the BAGS tab (`window._pendingBagFly`, `flyBagToTab`). Nav tile renamed BAGS with a painted bag icon (`.hi-chest`).
- Ready notifications use `window.Capacitor.Plugins.LocalNotifications` (does nothing in the browser). `@capacitor/local-notifications` is in package.json; run `npm install && npm run sync` and rebuild the app to turn it on. Note: `initAds` uses `import('@capacitor-community/admob')`, which can't resolve in a plain HTML file; it probably needs `window.Capacitor.Plugins.AdMob` instead (not changed).
- Bug fixed: the hidden COLLECT button sat over SKIP during the opening (`#chestOpenDoneBtn:not(.visible) { pointer-events:none }`).
- Lessons: generate each tier's closed and open art in ONE image (same design, angle and size), then cut it out by connected blobs and normalise sizes in code. Ask for flat #01162C or #00FF00 backgrounds. Test taps with real clicks at the element centre (not `force`) to catch invisible overlays.


## Stats screen (Oct 25)
- Joe's calls: three tabs (CAREER · RECORDS · AWARDS) in the blue game UI, no scrolling where possible; the **wooden honours board only for the "fastest to" milestones** (Records tab). Coin/gem pills in the header like Kit; old "STATS & COINS" box and DONE button hidden (kept in the DOM for old code).
- Working method this round: Joe asked not to see artifacts/canvas. Mockups were plain HTML rendered with Playwright and sent as one image (a "Stats" page was also started on the Design canvas but not used).
- Career: best innings + average, runs / win rate / fours / sixes, matches bar, league card (trophies, current league, highest league reached in `career.highestLeague`, trophies to next), recent form (last 10 innings in `career.recent`, gold = won; fills from now on).
- Records: fastest-to 50…500 on the wooden board, next milestone marked NEXT.
- Awards: 24 achievements (14 new tiers: 150/200 innings, 25/50 wins, 50/100 played, 1k/5k/10k runs, 100/500 fours, 25/100/250 sixes). Every locked one shows a progress bar (`prog(c)` on each achievement; per-innings ones use bests: `career.bestScore`, `bestSixesInnings`, `bestBeatBy`). Order: to-claim, closest to done, then a folded "COMPLETED (n)" row.
- Gems are **no longer auto-granted** on unlock: they wait in Stats; one CLAIM button collects all. Existing players unlock what they already qualify for on load (`checkAchievements` with an empty innings). New tier rewards were halved by Joe (all 24 total ~440 gems).
- NEW flags (`flickyStatsNew` in localStorage): beating best innings or a fastest-to milestone sets a flag; shown as a pulsing NEW tag the next time that tab opens, then cleared. STATS nav tile badge (`#menuStatsBadge`) shows the number of rewards to claim, else NEW (`updateStatsNavBadge`, also called from `updateMenuHUD`).


## Popups & in-game commentary (Oct 25)
- Joe: **no Flicky on these** (he's in use in the game); liked the 3D-letter burst style (explosion burst, confetti, tilt) for FOUR / SIX / OUT and the TV-broadcast player card for milestones. He was shown 10 SIX styles (flip board, stamp, slash banner, TV bar, LED screen, fireworks, distance tracker…) and chose the burst "for now".
- All drawn in DOM in `#fxLayer` (fixed, z 8400, pointer-events none), not on the canvas. `#message` is hidden; `showMessage(text, color, duration)` now routes: **in play** (`fxInPlay()`: state ≠ menu and Home hidden) → ball-by-ball pill (`.fxPill`, tilted; DOT BALL grey; CROSS-BAT/TIRED as a red tag) with a random commentary line (`FX_LINES`); "N RUNS TO M" → `.fxChase` banner at the **bottom** of the screen (own slot, shown once when within 10 runs, `checkMilestone`). **In menus** → toast (`.fxToast`) coloured by colour/emoji (gem purple, coin gold, ok green, no red, info navy), stacking. This fixed toasts being invisible behind menu screens.
- `fxBig('four'|'six'|'out', {word, runs, caught})`: rays + spinning burst SVG + 3D word (stroke/extrude layer, gradient fill, shine) + ribbon (BOUNDARY · +4 / MAXIMUM · +6 / OUT · N RUNS) + commentary line + confetti. FOUR smaller than SIX. SIX is gold (purple means gems). **Positioned in the band between the scoreboard and the umpire** (computed from `canvas` rect and `PITCH_TOP()`; burst squashed to fit) so the umpire's signal stays visible — Joe flagged that. Canvas pop text for these is suppressed with `popText.dom = true`; flash/shake/particles unchanged. Whoosh-pop sound `fxBurstSound`; "+4/+6" flies to the scoreboard (`fxFlyToScore`, lands at ~35% across / 10% down — scoreboards differ per ground).
- Milestones: `showMilestonePause` fills a TV card (`#msHead/#msNum/#msGrid…`): HALF CENTURY blue, CENTURY gold, DOUBLE CENTURY red; runs, balls, 4s, 6s, SR, best; NEW RECORD when `flickyStatsNew` has `ft<score>`; random line `MS_LINES`. Still pauses at every milestone (Joe didn't pick the "don't stop at 50" idea).
- Stat info popup: blue card, stat short-name badge instead of emoji, tap anywhere to close.
- Fixed: stray "null" under BOWLED (wicket theme had no sub-text).
- Not done (offered): combos ("2 IN A ROW"), auto-dismiss 50. Per-league skins for these come with the HUD work.


## Game loop rules (Oct 25, step 1)
- **Target = the league's target** (`leagueTarget(lg)` = `targetFloor`, 24 Gully … 76 Eternal). The ever-rising personal target (+20 per win) is gone; `target` is set by `playLeague` and on load.
- **Trophies by margin** (`trophyChangeFor`): win = `winTrophy` +1 at 20+ margin, +2 at 40+; loss −1, never below the unlock of your highest league reached (`trophyState.best`). Playing an **older league** (below the one your trophies put you in) gives coins and its bag but no trophies won or lost.
- **One bag per win** (the league's bag); the random `earnChest()` after every match was removed. Free daily bags and welcome bag unchanged.
- **PLAY on Home starts your selected league in one tap** (`playLeague(selectedLeagueIdx())`; `flickySelectedLeague`). Selecting PLAY on a Leagues card makes it your league; unlocking a new league selects it. Not enough coins → gem confirm (15 gems) or opens Leagues. PLAY AGAIN replays your selected league.
- **Hidden 10-team season table retired**: `recordLeagueMatch` no longer called; kit rarities unlock by league (`RARITY_UNLOCK_LEAGUE`: rare at Coastal Cup, epic at ECL, legendary at ICL; kit tiles show the league name instead of "SEASON N"); bowling season ramp removed (difficulty = league). Result screen's "RD n/14" bar now shows trophies to the next league ("NEW LEAGUE UNLOCKED!" when one opens).

## Leagues screen (Oct 25, step 2)
- Option A built: blue game UI, round back button + trophy/coin pills, trophy bar to the next league (`#leagueRoad`), one big card per league (`renderLeagueScreen`). Opens on your selected league (scrolls to it). Card: art with "LEAGUE n / 27" chip and YOUR LEAGUE / COINS ONLY chip, name, subtitle, rewards (coin, trophies +winTrophy–+2 or "NO TROPHIES" for older leagues, bag art from `CHEST_IMG_SRC`), target + difficulty balls, a dashed note when the league brings a new kit rarity or bag tier, yellow PLAY with entry. Locked: padlock over the art, "WIN n MORE", "UNLOCKS AT n". PLAY calls `playLeague(idx)`. Small dots (unlocked lighter). New CSS sits after the old league rules (the old ones are still in the file and would otherwise win).

## Result screen (Oct 25, step 3)
- New `#resultScreen.r2` markup (`r2*` ids; kept `rs-playAgainBtn`, `rs-menuBtn`, `rs-playCost`, `.rs-playLabel`, sparkle canvas). Painted league art header (same live-art still frame as the Leagues card; league name shown once, which fixed the doubled "GULLY CUP"), gem/coin pills, outcome ribbon (YOU WON! / SO CLOSE! / OUT!), score card (runs count-up, target badge, margin line, 4s/6s/balls/SR), three reward tiles (coins; trophies with reason or OLDER LEAGUE / LEAGUE FLOOR; bag art or LOCKERS FULL / NO BAG), trophy road bar animating to the new total + gold "NEW LEAGUE UNLOCKED!" card, extras as one row of badges, buttons HOME · SHARE · PLAY AGAIN (entry of your selected league; "PLAY <league>" after an unlock). Staggered pop-in via `--d`.
- Joe's add-ons: coins/first-win gems fly into the pills (`r2Fly`); losses show the net coin change in red ("−153 · 347 BACK"); Share button uses `generateShareCard` (card now shows league + trophies); WATCH AD · 2× COINS on wins (`showRewardedVideo`, 5 a day via `flickyDoubleAds`; uses `window.Capacitor.Plugins.AdMob`, placeholder ad unit id still to be set; grants without an ad only on file:/localhost for testing). Rejected: delaying PLAY AGAIN.
- `showResultScreen` clears any in-game burst/pill first (a BOWLED! burst could sit over the result).

## Balance pass + tidy-up (Oct 25) — live
- Simulator (scratch, not in repo) of the batting rules: league difficulty barely moves scores (~31 → 27 runs), targets do the work; old prizes (1.2× entry) drained coins in every league above the first.
- Changes: targets 20 → 101 (`leagueTarget` = 20 + idx×3.1); prize = 2× entry (`winCoins` set at load); loss refund cap 50%; trophies win +winTrophy+1 (+1 at 20+, +2 at 40+), loss −1.
- Ads: plugins via `window.Capacitor.Plugins` (`capAdMob`, `capPlatform`, `admobId`); `ADMOB_CONFIG` has interstitial + rewarded ids (Google test ids — replace before release); `watchAdForGems` and 2× coins both use `showRewardedVideo`; free grant only in a desktop browser.
- Notifications: run `npm install && npm run sync` on Joe's Mac, then rebuild (ios/android are not in the repo).
- Removed 32 unused functions (old season table, old Kit tabs, old colour customiser, legacy chest drawing…), ~57 KB.
