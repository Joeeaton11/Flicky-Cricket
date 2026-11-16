# Live game settings (config.json)

The game reads `https://flickycricket.com/live/config.json` when it opens, keeps the last good copy on the phone,
and uses it from the next launch. Edit `settings`, raise `version`, push. No app update or review needed.

Rules
- Only settings that already exist in the game's GAME_CONFIG can change. Unknown names are ignored.
- A value must be the same kind as before: number for number, true/false for true/false, list for list.
  Anything else is ignored, so a typo can't break the game.
- Leave out everything you don't want to change.

Useful settings (current values in brackets)

Ads
- shop.ads.interstitialEvery (3): show a full-screen ad every N matches
- shop.ads.noInterstitialFirstMatches (3): no full-screen ads in a player's first N matches
- shop.ads.interstitialMaxPerDay (99): cap on full-screen ads per day
- shop.ads.rewardedGemsPerDay (3) / shop.ads.rewardedGems (5): "watch an ad for gems"
- shop.ads.rewardedCoinsPerDay (3): "watch an ad for coins"

Economy
- shop.bagGemScale (0.3): share of gems inside bags
- shop.kitDeals: coin prices of kit deal cards
- shop.offers.starter / leagueUnlock / gemJar / noAds: offer contents (prices are set in the stores)
- daily.calendar: the 7 daily login rewards
- kit.boosterPack (count 3, gems 60)

Matches
- match.targets: chase target per league (list of 28)
- match.trophyLoss: trophies lost on a loss
- energy: drainRate, passiveRegen, etc.

Example: gentler ads for new players (the simulator's suggestion)
{
  "version": 2,
  "settings": {
    "shop": { "ads": { "interstitialEvery": 4, "noInterstitialFirstMatches": 8 } }
  }
}
