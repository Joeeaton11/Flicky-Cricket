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

## Nov 3 — bowlers' legs, spinners in the game, fielding
- Bowlers: `KNEEFIX=1 OUTTAG=_knees CLIP=seam|offspin|legspin python3 bake2.py` (Joe's "knees fixed" versions). Legs keep the
  capture's joint angles; each foot lands on its own side of the line (the capture runs on a tightrope), knees stay outside
  the hip–foot line, feet flat and pointing down the run in the run-up, planted feet pinned (and set on the ground), hips
  sink a little when a planted leg can't reach, swing leg passes wide of the standing one, hand/finger pops smoothed.
  Leg spin measures "own side" from the running line in the run-up (`RUNAXIS`: his hips are 42° open).
  For sprites copy `<clip>_knees.blend` to `<clip>.blend`, then `CLIP=<clip> python3 sprites.py`.
- Spinners: `CLIP=offspin PREFIX=b3o_ python3 b3wrap.py`, `CLIP=legspin PREFIX=b3l_ python3 b3wrap.py`.
  Game: every second over is a spinner (off or leg, picked per match) in the Gully scenes — slower, a touch fuller,
  turning off the pitch (off spin into the right-hander, leg spin away); the keeper stands up to him.
- Fielding (src/fielding, Joe's KUMU files): `CLIP=field_<name> python3 bake2.py` (field_1hand, field_2hand, field_high_fd,
  field_high_fu, field_long_barrier, field_short_fd, field_short_fu, field_keep_back, field_keep_up). Head: the capture's own
  (it's genuine), pulled towards the ball through the approach and take, then eased back; hands kept clear of the big head.
  Game sprites: `python3 fieldsprites.py` (EL 50 ortho, five facings) → `python3 fsbake.py` → f3_* (ready, run, pick, catch,
  dive, keeper back / up). The Gully fielders are the 3D player in each lad's colours.
- `python3 gamepatch.py 0.26` applies the game code (idempotent); `python3 integrate2.py` swaps in every sprite block.
