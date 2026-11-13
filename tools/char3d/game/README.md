# Game-model base (customisable)

Built from the in-game mocap character (`tools/mocap3d/rig_base.blend`), so it already matches the game and plays the mocap clips.

- `gm_base.blend`: original look, with the colour-mask material `player`.
- `gm_bald.blend`: bald base. Hair removed, scalp rebuilt, mesh welded. **This is the master for all looks.**
- Colour masks (`classmap.png` / `classmap_bald.png`, 1 byte per texel = class id):
  unk, skin, hair, brows, eye_white, eye_dark, shirt, buttons, trousers, shoes, soles.
- Material nodes `tint_<class>` set the colour:
  - `tint_skin` is a per-channel multiplier (1 = unchanged), which keeps the blush and lips.
  - Every other tint is the target colour in linear RGB, multiplied by the texture's own shading.
- Swappable pieces (hair, beards, caps, helmets, pads, gloves) are separate meshes parented to the rig's Head and Shin bones. They're built in 3D and fitted to this head.
- Rebuild the bald base from scratch: `python texcls.py && python post.py && python mat.py rig_base.blend gm_base.blend && python bald.py && python scalpfix.py && cp gm_bald2.blend gm_bald.blend`
