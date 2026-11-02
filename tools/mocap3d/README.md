# mocap3d — KUMU captures on the Flicky characters (Blender pipeline, Nov 2)

Replaces the hand-built three.js rigs in `tools/mocap` (rig.html / bowl.html) for new work. Everything runs in Blender
as a Python module (`pip install bpy==5.2.2`, plus numpy, scipy, Pillow, opencv-python-headless).

## Why
The Tripo models are split along their texture seams. Skinning them as-is gave each side of a seam different weights,
so the shirt tore open at the shoulders and back ("pinching"). Here the body is skinned on a **welded copy** with
Blender's automatic (heat) weights, lightly smoothed, then copied back by position, so both copies of every seam
vertex get identical weights.

## Working folder
Run every script from one folder holding:
`base.glb`, `batter.glb` (tools/mocap/src), `seam.fbx`, `seam_ball.fbx`, `off_drive.fbx`, `ballbat.fbx`
(tools/mocap/src), and each batting shot as `shot_<name>.fbx` + `shot_<name>_ballbat.fbx` (src/shots here, renamed).

## Steps
1. `MODEL=base python3 rig.py` and `MODEL=batter python3 rig.py` → `rig_base.blend`, `rig_batter.blend`
   (skeleton traced from limb centre-lines; welded heat weights).
2. Batter pads: `python3 padfind.py` (writes padcols.npy, the texture colour of every face; a copy is here), then
   `cp rig_batter.blend rig_batter_prepad.blend && python3 padfix3.py`.
   The pad shells become their own layer, 100% on the shin, so the pad top comes away from the thigh as the knee
   bends; the leg underneath keeps its ORIGINAL skinning (original knee), ironed smooth, trouser coloured, pulled in.
   Back-of-leg straps above the knee stay on the thigh. (Joe: "use the original knee but the separate pad".)
3. Retarget + bake: `CLIP=seam|drive|cover|shot_<name> python3 bake2.py` → `<clip>.glb` (+ `.blend`).
   - World: ball/bowler travel +X, up +Z, 30 fps.
   - Rotations: world-delta retarget from the capture (rest directions aligned per bone); head aimed upright.
   - Scale by leg bone length (the same batter → 0.890 for every batting file; rest poses differ between files).
   - Legs: IK to the captured ankles, knees toward the captured knees; soles kept on the pitch using the real shoe
     vertices (`SOLE` in retarget.py).
   - Batter: bat = clean willow bat rebuilt to the captured bat's measurements (85 cm, 11.5 cm wide, raised spine),
     on the captured bat frame with its grip pulled in by the arm-length ratio; hands IK'd onto the handle where the
     capture holds it. Ball path rigid-transformed with the bat at contact (contact found automatically = closest
     ball-to-blade approach). Head turned onto the ball every frame.
   - Batter, shared stance (Joe): every shot starts in the reverse sweep's stance (`stance_pose.npz`, written when
     `shot_reverse_sweep` is baked — bake it first) and blends into its own action over TC−0.95…TC−0.6 s.
   - Batter head (Joe): eyes level all the way through (no roll), a few degrees down at the bowler in the stance,
     turned onto the ball and eased frame to frame (`HEADSTEP`, default 9°) so it follows quickly without snapping.
   - Exports holding 120 fps data labelled 30 fps (Backfoot drive) are detected (> 3 s) and read as a 2 s take.
   - Bowler: wrist bend capped at 40°; bowling arm filtered less than the rest; ball in the fingers until 3.25 s.
4. Sprites: `CLIP=... [TC=<contact s>] python3 sprites.py` → `sp_<clip>/` colour (Cycles), normal, depth, class mask
   (flat, no AA; same class ids as before: 1 shirt … 13 sticker). Cameras match frames.py / bowlframes.py
   (batter az 30 in this world = old az 120, el 22, fov 13.5, mirrored to right-handed; bowler front-on el 40, fov 18).
5. Encode: `python3 m3bake.py` → `m3_sprites.json` (m3_* off drive + m3_<code>_hit* per shot; same size and
   back-foot anchor as the old stance), `python3 b3wrap.py` → `b3work/b3_sprites.json` (runs tools/mocap/bowlbake.py,
   white shirt / maroon trousers on). Replace the two `Object.assign(GP_SRC, {...})` lines in flicky-cricket.html.

## Shot library (src/shots, Joe's KUMU files) and the game's shot types
defend ← forward_defence · drive ← straight_drive · offdrive ← off drive (m3_hit*) · coverdrive/slash ← cover_drive ·
ondrive ← on_drive · cut/latecut ← cut · pull/slog ← pull · flick ← leg_glance · revsweep ← reverse_sweep ·
scoop ← scoop · sweep ← sweep · backfoot_drive rendered (m3_backfoot_*) but not routed yet.
6. `python3 integrate.py` swaps both sprite blocks into flicky-cricket.html; then `npm run build`.
