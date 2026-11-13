# MATES — invite a friend (Nov 13)

Two-sided referral in `flicky-cricket.html` (source copy: `mates.js`, the `<script>` before `</body>`).

**Friend (joins with a code):** 150 gems + 1,000 coins + gold bag + MATES BAT, instantly. Codes can be entered in the
first 14 days or first 40 matches. A link with `?r=CODE` (flickycricket.com/i/?r=CODE → play/?r=CODE) fills it in.

**Inviter (per mate who finishes a match):** 1 → 150 gems + MATES BAT · 2 → gold bag · 3 → 200 gems + MATES GREEN kit ·
5 → platinum bag + MATES COMET trail · 10 → 500 gems + CONFETTI SIXES · then 75 gems every mate.

**Asks:** green MATES button on home (badge when a reward is ready); a slim WhatsApp card after a new best (20+ runs),
a duel win or a promotion — never before match 3, at most once per 20 h; "Got a mate's code?" once after a new
player's first match. Every duel challenge link carries the code. Analytics: `mates_open / share / ask / ask_skip /
redeem / qualified / count / claim`.

## Turn on the server count (Firebase project `flicky-cricket`)
1. Authentication → Sign-in method → enable **Anonymous**.
2. Firestore Database → create (production mode) → Rules → paste `firestore.rules` → Publish.
3. Project settings → Your apps → add a **Web app** → copy its `apiKey` into `MATES_CFG.apiKey`.
Until then the friend's welcome pack works and the inviter's count waits (nothing breaks).
