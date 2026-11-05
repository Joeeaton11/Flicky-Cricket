import sys,json
T='''STYLE LOCK: a stylised 3D CARTOON mobile game exactly like Clash of Clans / Clash Royale / Boom Beach promo art: toy-like chunky shapes, smooth glossy plastic-like materials, chunky cute people with big round heads (no realistic faces), absolutely NOT realistic, NOT painterly, NOT a photo, no gritty fine detail.
ART STYLE: glossy, ultra-vibrant 3D-rendered cartoon mobile-game key art: hyper-saturated colours that pop, warm glowing lights with soft bloom, strong rim lighting, deep ambient-occlusion shadows, crisp chunky detail, high contrast. Camera: high 3/4 top-down view looking straight up a cricket ground in portrait.
FIELD SIZE AND SHAPE (most important, it must fit a game layout exactly): the playing field is a perfect smooth ELLIPSE standing on end, with NO straight sections anywhere (NOT a running track, NOT a pill, NOT a rounded rectangle). At its widest point (its middle) it leaves a wide strip of stands about one seventh of the picture's width between it and each side edge, crowded all the way to the picture edges. It is about one and three fifths times as tall as it is wide — a plump upright egg. Its top end is a little more than a quarter of the way down the picture. Its bottom end is nine tenths of the way down, leaving a band of about one tenth of the picture below it.
FIELD SURFACE: {surface}, very even and calm, one continuous material, low contrast so a small red ball shows clearly. No pattern, no tiles, no lines.
CAMERA CLOSE: the camera is pulled in tight. The crowd people are chunky with big round heads and waving arms, each fan's head about one twentieth of the picture's width, so four or five rows of fans fit across each side strip. Every spectator the SAME size everywhere including the far end and the very bottom edge. No tiny distant crowd, no wide view, no panorama.
THEME: {theme}
FAR END: {far}, reaching right up to the very top edge of the picture.
SIDES: {sides}
CROWD: {crowd}
LIGHT: {light}
TIGHT GROUND: the field's edge IS the foot of the stands. Only a thin ring of {ring}, clearly darker than the field, sits exactly on the field edge all the way round, with the front row of the crowd immediately behind it. Not a single strip of anything else outside it.
NO rope, NO markers, NO inner ring, NO lines on the field.
EMPTY: no pitch, stumps, players, umpire, ball or text on the field.
SCREEN ZONES: the top-left area (from the left edge to three fifths across, top fifth of the height) stays simple: sky, roofs or plain stand tops only. The very top-right corner is a small plain spot. The showpiece sits top-centre and right of the scoreboard area.
Background only: never paint any game interface, buttons, icons, panels, scoreboards, text, letters or logos.'''
G=json.load(open(sys.argv[1]))
for k,v in G.items(): open(f'{sys.argv[2]}/{k}.txt','w').write(T.format(**v))
