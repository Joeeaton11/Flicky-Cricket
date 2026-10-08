"""Rebuild the live-art module from the card files and swap it into flicky-cricket.html.

Usage:  python3 art/league-cards/tools/update_game.py
(Add the new card to the `cards` list in build_modules.py first.)
"""
import os, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__))
mod = os.path.join(here, 'league_live_art.js')
game = os.path.abspath(os.path.join(here, '..', '..', '..', 'flicky-cricket.html'))
old = open(mod).read().rstrip('\n')            # the module currently installed in the game
subprocess.run([sys.executable, os.path.join(here, 'build_modules.py')], check=True)
new = open(mod).read().rstrip('\n')
g = open(game).read()
assert g.count(old) == 1, 'installed module not found verbatim in flicky-cricket.html — rebuild from the committed league_live_art.js'
open(game, 'w').write(g.replace(old, new))
print('flicky-cricket.html updated')
