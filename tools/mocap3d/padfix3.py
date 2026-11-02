"""Pads as their own layer, strapped to the shin.
- The leg underneath keeps its ORIGINAL skinning (original knee and trousers); where the pad used to be, that surface is
  pulled in a little and coloured as trousers.
- A copy of each pad shell sits on top, weighted 100% to its shin, so its top comes away from the thigh as the knee bends."""
import bpy, os, numpy as np, bmesh
W = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.open_mainfile(filepath=f'{W}/rig_batter_prepad.blend')
body = bpy.data.objects['Body']; me = body.data
d = np.load(f'{W}/padcols.npy'); col, cz, cy = d[:, :3], d[:, 3], d[:, 4]
cx = np.array([p.center.x for p in me.polygons]); lum = col.mean(1)
pad = (cz > 0.13) & (cz < 0.74) & (np.abs(cy) < 0.36) & (lum > 0.42) & ~((cz > 0.45) & (cx < -0.085))
# a plain trouser texel: dark face on the front of the thigh
sat = col.max(1) - col.min(1)
cand = np.where((cz > 0.78) & (cz < 0.92) & (np.abs(cy) < 0.2) & (cx > 0) & (lum > 0.2) & (lum < 0.34) & (sat < 0.02))[0]
print('trouser texel', col[cand].mean(0).round(3), len(cand))
tro = cand[np.argmin(np.abs(lum[cand] - np.median(lum[cand])))]
bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table()
uvl = bm.loops.layers.uv.active; dl = bm.verts.layers.deform.verify()
TUV = bm.faces[int(tro)].loops[0][uvl].uv.copy()
padf = [f for f in bm.faces if pad[f.index]]
gi = {g.name: g.index for g in body.vertex_groups}
# 1. the separate pad: a copy of the pad faces, rigid to the shin, nudged out a hair so it always sits on top
dup = bmesh.ops.duplicate(bm, geom=padf)
dv = [g for g in dup['geom'] if isinstance(g, bmesh.types.BMVert)]
bm.normal_update()
for v in dv:
    side = 'L' if v.co.y > 0 else 'R'
    v[dl].clear(); v[dl][gi[f'Shin.{side}']] = 1.0
    v.co += v.normal * 0.002
# 2. the leg underneath: original weights, trouser colour, pulled in under the pad (border verts stay put)
inner = set(v for f in padf for v in f.verts if all(pad[lf.index] for lf in v.link_faces if lf.index < len(pad)))
for f in padf:
    for l in f.loops: l[uvl].uv = TUV
for _ in range(12):   # iron out the pad's ribs so the leg underneath is a plain trouser knee
    bmesh.ops.smooth_vert(bm, verts=list(inner), factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
bm.normal_update()
for v in inner: v.co -= v.normal * 0.02
print('pad faces', len(padf), 'pad copy verts', len(dv), 'leg verts pulled in', len(inner))
bm.to_mesh(me); bm.free(); me.update()
bpy.ops.wm.save_as_mainfile(filepath=f'{W}/rig_batter.blend')
