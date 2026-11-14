# char3d v2 — built straight from the game art (Nov 12)
- `meshy2.glb`: Meshy V6 from art/characters/base_male_bald_1024.png (the bald game art itself), Meshy put him in A-pose.
- Real face: `dump2.py` dumps the mesh + texture; `project.py` paints the game art's face onto the head texture from a
  camera matching the art's angle (yaw 15°, landmarks: both eyes and the mouth), only on faces turned to that camera,
  inside the art's face (no bat, no rim line), feathered → `tex_proj.png`. `rproj.py tex_proj.npy <out>` renders it.
Next: split into parts (same as ../), rig, hair / headwear.
