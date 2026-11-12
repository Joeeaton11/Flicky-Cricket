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
