import json,sys
SL='STYLE LOCK: a stylised 3D CARTOON mobile game exactly like Clash of Clans / Clash Royale promo art: toy-like chunky shapes, smooth glossy materials, rich saturated colours, soft studio light from the top-left. No shadows under or behind any piece.\n'
def key(k): return ('a perfectly flat solid pure #FF00FF magenta background, and there is NO magenta or pink anywhere in the art' if k=='m' else 'a perfectly flat solid pure #00FF00 green background, and there is NO green anywhere in the art')
def board(g):
  return SL+f'''On {key(g['key'])}. Two separate pieces, nothing touching, no text, letters or numbers anywhere.
1. SCOREBOARD across the upper part of the picture, wide and short (about three times as wide as it is tall): one themed frame made of {g['frame']}. Inside it three stacked bands of plain blank {g['panel']} panels with {g['rims']} rims:
- top band (the tallest): a small square slot on the left, then one wide blank panel, then two small square slots at the right end.
- middle band: a wide blank panel on the left (about two fifths of the width), then six empty round sockets in a row on the right.
- bottom band (thin): a small round icon slot at the left end, then one thin long empty track across the rest.
ONE single decoration only: {g['deco']}. Nothing else sticks out of the frame.
2. PAUSE BUTTON centred below the scoreboard, round, about a quarter of the picture's height: {g['pause']}, with a chunky cream pause symbol (two rounded bars) in the middle.'''
def props(g):
  return SL+f'''On {key(g['pkey'])}. Separate pieces, evenly spaced, nothing touching, no text anywhere, all seen at a slight top-down 3/4 view:
- LEFT, standing tall the whole height of the picture: the PITCH — a top-down cricket pitch strip, narrower at the top than the bottom (a long trapezoid), {g['pitch']}. Crease lines at each end. NOTHING standing on it: no stumps, no ball, no people, nothing on it at all.
- TOP ROW, left to right: ONE upright stump ({g['stump']}), slim and real-proportioned; ONE bail ({g['bail']}), lying sideways; ONE ball ({g['ball']}); ONE ring marker seen from above ({g['ring']}).
- BOTTOM ROW, left to right: a FLAG on a pole ({g['flag']}); {g['fly']} with {g['up']}; the same {g['flyn']} with {g['dn']}; a FAN: {g['fan']}, chunky cute cartoon person with a big round head, cheering, full body.'''
def words(g):
  return SL+f'''Lettering sheet on {key(g['wkey'])}. Nothing else on it, each word separate, nothing touching. Three rows, spelled exactly in capitals:
ROW 1:  FOUR!   SIX!   CAUGHT!
ROW 2:  BOWLED!   OUT!
ROW 3:  the digits  0 1 2 3 4 5 6 7 8 9  each separate, all the same height and width.
LETTERING STYLE (unique to this ground): {g['letters']}
Chunky, clean and readable at a glance, nothing spiky or scratchy. No burst, rays, banner, ribbon or backing behind the words. SIX! the biggest and boldest. Each word on one line, letters fully visible, nothing cropped.'''
G=json.load(open(sys.argv[1])); out=sys.argv[2]
for n,g in G.items():
  for f,fn in (('board',board),('props',props),('words',words)): open(f'{out}/{n}_{f}.txt','w').write(fn(g))
