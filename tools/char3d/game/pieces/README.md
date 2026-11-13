# Swappable pieces for the game-model base

All pieces come from the game's own batter model (`tools/mocap/src/batter.glb`), so they match the art exactly.
`batter.glb` sits in the same frame as `base.glb` (rig = glb × 1.8; `align.py` → `xf.npz`).

- **Pads** (`pads_only.blend`, object `Pads`):
  - `mkpads.py` takes the white shell and the grey straps, drops the shoe bits and nudges the pad 3 mm out.
  - `addpads.py <master> <out>` parents the pads to `Rig` and weights them 100% to the shin. The top above the knee blends to the thigh.
  - To toggle the pads, show or hide the `Pads` object.
- `bake2.py` (mocap3d) now exports any mesh parented to `Rig`, so worn pieces animate with the clip.
