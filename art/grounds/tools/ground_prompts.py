# Whole-ground plate prompts (Lord's v7 template, Joe Nov 5: "that will do... redo all following this").
# usage: ground_prompts.py <grounds.json> <outdir>   keys: name, far, left, right, near, crowd, flags, light, boards
import json,sys
T='''STYLE LOCK: a stylised 3D CARTOON mobile game exactly like Clash of Clans / Clash Royale / Boom Beach promo art: toy-like chunky shapes, smooth glossy plastic-like materials, chunky cute people with big round heads (no realistic faces), absolutely NOT realistic, NOT painterly, NOT a photo, no gritty fine detail.
ART STYLE: glossy, ultra-vibrant 3D-rendered cartoon mobile-game key art: hyper-saturated colours, warm glowing light with soft bloom, strong rim lighting, deep ambient-occlusion shadows, chunky detail, high contrast. Camera: high 3/4 top-down view looking straight up a cricket ground in portrait.
FIELD SIZE AND SHAPE (most important, it must fit a game layout exactly): the playing field is a perfect smooth EGG-SHAPED ELLIPSE standing on end. It has NO flat or straight parts anywhere: the top end is a narrow ROUNDED TIP and the bottom end is a rounded tip too; the sides curve all the way (NOT a running track, NOT a pill, NOT a rounded rectangle). At its widest point (its middle) it leaves a strip about one sixth of the picture's width between it and each side edge. It is {shape}. Its top tip is a little more than a quarter of the way down the picture; at that height the field is only about a third of the picture wide. Its bottom tip is nine tenths of the way down, leaving a band of about one tenth of the picture below it.
FIELD SURFACE: lush smooth emerald cricket turf with soft wide mowing stripes, calm and even so a small red ball shows clearly.
THEME: the whole of {name} as a cosy chunky cartoon stadium — recognisably the real ground all the way round.
FAR END (top): {far}, reaching the very top edge.
LEFT SIDE: {left}.
RIGHT SIDE: {right}.
NEAR END (bottom): {near}, sitting right behind the bottom tip of the field, its whole front clearly visible in the bottom band.
CROWD: every stand is packed with {crowd}, each head about one twentieth of the picture's width, the SAME size everywhere including the bottom edge, cheering. {flags} along the stand fronts.
LIGHT: {light}.
TIGHT GROUND: the field's edge IS the foot of the stands — only a thin ring of low {boards} boundary boards sits exactly on the curved field edge, with the front row of the stands immediately behind it. No grass, track or walkway outside the boards.
NO rope, NO markers, NO lines on the field. EMPTY: no pitch, stumps, players, umpire, ball or text on the field.
SCREEN ZONES: the top-left area (left edge to three fifths across, top fifth of the height) stays simple: sky, trees or roofs. The very top-right corner is a small plain spot.
Background only: never paint any game interface, buttons, icons, panels, scoreboards, text, letters or logos.'''
G=json.load(open(sys.argv[1]))
for k,v in G.items():
  v.setdefault('shape','exactly one and a half times as tall as it is wide — a plump egg')
  open(f'{sys.argv[2]}/{k}.txt','w').write(T.format(**v))
