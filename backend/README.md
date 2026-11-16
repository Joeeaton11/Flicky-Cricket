# Online play (Firebase)

Real duel rivals and real leaderboards. Without keys the game runs offline with practice rivals.

1. console.firebase.google.com → Add project "flicky-cricket" (Analytics optional).
2. Build → Authentication → Get started → Sign-in method → Anonymous → Enable.
3. Build → Firestore Database → Create database → production mode → location europe-west2 (London).
4. Firestore → Rules → paste `firestore.rules` → Publish.
5. Project settings → General → Your apps → Web app (</>) → register "Flicky web" → copy apiKey, authDomain, projectId, appId
   into `GAME_CONFIG.online.firebase` in www/index.html (these are public keys), or into site/live/config.json under
   `online.firebase` to switch it on without a new build.

Moderation: Firestore → `reports` lists reported names. To ban a player, add a document `banned/{uid}`.
SDK bundle: `www/assets/firebase.js` is built from `firebase_entry.js` with esbuild (firebase + firestore/lite).
