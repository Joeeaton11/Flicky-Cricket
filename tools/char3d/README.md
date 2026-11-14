# char3d — the Flicky 3D base character (Nov 12)

One rigged-to-be 3D base per gender, built in parts so skin, kit and (later) hair and headwear change by setting a value.

1. `apose1.png` — our male player, bald, front-on base pose (Flux Kontext from art/characters/base_male_bald_1024.png).
2. `meshy.glb` — Meshy V6 model of it (A-pose, 57k tris, one 2K texture).
3. `seg.py` samples the texture colour of every face → `facecols.npy`, `facecent.npy`.
   `classify.py` → `cls_raw.npy` (skin, shirt, trim, trousers, pads, straps, shoes, shoe stripe, wristband, face dark/white).
   `apply.py` smooths the classes over neighbouring faces and gives each class its own material → `base_seg.blend`
   (`cls.npy` = the corrected classes: the invented number on the back is shirt, the hem is shirt).
4. `mat.py` paints over the back number and makes each class recolourable: texture light ÷ class average × a `tint`
   RGB node → `base_mat.blend`. `variants.py` renders colour sets to prove it.
Run with the Blender Python module (bpy 5.x): `python seg.py` etc. from this folder.
Next: texel-level class mask (smooth trim edges), rig with tools/mocap3d/rig.py, then hair / beard / headwear parts on a head socket.

## Nov 12 (later)
- Head: `dome.py` lowers the cranium above the brows (SZ 0.72 height, SXY 0.94 width at the crown); the face and head size stay.
  (`headscale.py` scales the whole head; not used: Joe wants the big head, just a less domed top.)
- Crisp part edges: `dumpuv.py` → `texcls.py` builds `classmap.png` (class per texel; boundaries settled by nearest class
  colour; highlights at the sides/back of the head → skin, eye whites/teeth kept). `mat2.py` makes one material `flicky`
  that reads the class map and tints each class (`tint_<class>` RGB nodes) → `base_mat2.blend`. `variants2.py` renders sets.
- Rig: `RIGPY=../mocap3d/rig.py python rig_flicky.py` → `rig_flicky.blend` (joints found from the mesh and the part
  classes: wristbands = wrists, shoe tops = ankles; same 25-bone skeleton and welded heat weights as tools/mocap3d,
  body faces +X, his left +Y, 1.8 m). `posetest.py` renders a few hand-set poses.
Next: retarget the KUMU captures with tools/mocap3d/bake2.py onto rig_flicky, hair / beard / headwear parts on the Head bone.
- Nov 12, matching the game art: `mat2.py` (pads light grey with deeper shading so the ridges read, darker navy), then
  copy `base_mat2.blend` → `base_mat2_pre.blend` and `FACE=1.12 EYE=1.35 ER=0.055 JAW=0.88 python reshape.py`
  (chest and shoulders 12% wider, 8% deeper; arms 18% thicker; face 12% wider; jaw shorter; legs 5% shorter).
  Rig again after reshaping (rig_flicky.py).
