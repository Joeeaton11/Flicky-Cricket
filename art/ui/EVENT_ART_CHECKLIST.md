# Per-event art & colour checklist

Every seasonal event (Christmas, Halloween, Diwali, IPL-season, Easter…) needs ALL of these before it goes live.
`<theme>` = the event id without its year digits (e.g. `xmas26` → `xmas`). Style: Clash-style glossy 3D, ADULT characters.

| # | Piece | File / setting | Notes |
|---|-------|----------------|-------|
| 1 | Event poster (Events tab hero) | `assets/ui/events/ev_<theme>.webp` + `EV_KEY_ART.<theme>` | adult characters, no text |
| 2 | Duels poster for the event | `assets/ui/events/ev_duel_<theme>.webp` + `EV_KEY_ART.duel_<theme>` | |
| 3 | Cup poster for the event | `assets/ui/events/ev_cup_<theme>.webp` + `EV_KEY_ART.cup_<theme>` | |
| 4 | **Duel versus background** | `assets/ui/bg/vs_<theme>.webp` + `SCENE_ART.vs.<theme>` | 1000x2048; blue left / red right, gold crack centre; players stand in middle 40%; dark bottom 25% |
| 5 | **Cup draw background** | `assets/ui/bg/cup_<theme>.webp` + `SCENE_ART.cup.<theme>` | trophy on plinth top 12-30%; themed pillars down both sides; calm dark centre |
| 6 | **Cup draw colours** | `CUP_THEME.<theme>` (A/B/C banner, M1/M2 cards, Y1/Y2 your cards, G glass, L labels) | |
| 7 | Event currency icon | `assets/ui/events/<currency>.webp` | e.g. present |
| 8 | Shop shelf items | event `shop` list (bat wrap, celebration FX, trim, bag) | cosmetic art per item |
| 9 | Six celebration FX | `celebFx()` variant | e.g. snow, fireworks |
| 10 | Store screenshot #5 | `art/store/` builder (`comp4.py`) — swap the event slide | update before the event starts |

Done so far: Christmas (1–9 ✓; 10 uses Christmas already). Diwali: 1, 6–8 ✓; 4, 5 still needed. Halloween: 6 ✓ only.

League families (not events) need #4 only (`SCENE_ART.vs.<family>`); done: street, floodlit (+intl), coastal. Next: pirate, spooky, frozen, space.
