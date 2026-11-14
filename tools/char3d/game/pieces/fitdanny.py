"""Danny's KUMU mocap helmet (shot fbx 'Danny_gear_rig_01:helmet') as the batter's helmet piece.
Danny frame (x left, y up, z fwd) -> rig frame, scaled to the cartoon skull, flat materials per part, gold centre stripe."""
import bpy, bmesh, numpy as np, math, os, sys
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
SX, SY, SZ = [float(v) for v in os.environ.get('HS', '1.28 1.30 1.02').split()]
DZ = float(os.environ.get('HDZ', '0')); DX = float(os.environ.get('HDX', '0'))
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('dhelmet_raw.blend'))
src = bpy.data.objects['DHelmet'].data.copy()
src.transform(Matrix(((0, 0, 1, 0), (1, 0, 0, 0), (0, 1, 0, 0), (0, 0, 0, 1))))
bm = bmesh.new(); bm.from_mesh(src); bm.faces.ensure_lookup_table()
seen = set(); comps = []
for f in bm.faces:
    if f.index in seen: continue
    st = [f]; seen.add(f.index); c = []
    while st:
        x = st.pop(); c.append(x)
        for e in x.edges:
            for y in e.link_faces:
                if y.index not in seen: seen.add(y.index); st.append(y)
    comps.append(c)
comps.sort(key=len, reverse=True)
# part of each component: dome (biggest above the rim), honeycomb stem guards, flat side plates, metal (grille, clamps, screws)
def info(c):
    P = np.array([v.co[:] for f in c for v in f.verts]); A = sum(f.calc_area() for f in c); ext = (P.max(0) - P.min(0)).max()
    return P, A, ext
dome = max(comps, key=lambda c: np.array([v.co.z for f in c for v in f.verts]).max())
CL = {}
for c in comps:
    P, A, ext = info(c); dens = A / max(ext, 1e-4)
    if c is dome: k = 0
    elif len(c) > 2000: k = 3                       # honeycomb stem guards
    elif P[:, 2].min() > 1.70 and ext > 0.2: k = 0  # peak + rim band
    elif P[:, 0].mean() < -0.05: k = 3              # anything at the back of the neck: stem guards
    elif dens < 0.048: k = 2                         # wire / bolts
    else: k = 3                                     # side plates, pads
    for f in c: f.material_index = k
    if len(c) > 30: print('comp', len(c), 'dens', round(dens, 4), 'ext', round(ext, 3), 'z', P[:, 2].min().round(3), P[:, 2].max().round(3), 'k', k)
    CL.setdefault(k, 0); CL[k] += len(c)
print('faces per part', CL)
# fit: dome centred on the skull, rim front at the brow
D = np.array([v.co[:] for f in dome for v in f.verts]); cx, cy = (D[:, 0].min() + D[:, 0].max()) / 2, (D[:, 1].min() + D[:, 1].max()) / 2
zr = 1.712                                           # Danny's rim height at the front
T = Matrix.Translation((DX, 0, 1.664 + DZ)) @ Matrix.Diagonal((SX, SY, SZ, 1)) @ Matrix.Translation((-cx, -cy, -zr))
bmesh.ops.transform(bm, matrix=T, verts=bm.verts)
SZL = float(os.environ.get('HSZL', '1.55')); RZ = 1.664 + DZ   # the cartoon face is long: stretch what hangs below the rim
# below the rim: Danny's eye slot (peak -> first bar) opens up to fit the big cartoon eyes, the rest reaches the chin
DK = [0.0, 0.024 * SZ, 0.141 * SZ, 0.3]; OK_ = [0.0, float(os.environ.get('HEYE', '0.098')), float(os.environ.get('HCHIN', '0.232')), 0.232 + (0.3 - 0.141 * SZ) * 1.1]
for v in bm.verts:
    if v.co.z < RZ:
        d = RZ - v.co.z; t = min(1.0, max(0.0, (v.co.x + 0.05) / 0.12)); t = t * t * (3 - 2 * t)   # front opens up, the back (neck guards) stays put
        v.co.z = RZ - ((1 - t) * d * 1.15 + t * float(np.interp(d, DK, OK_)))
bm.to_mesh(src)
# gold centre stripe: a band ray-projected onto the dome, front rim -> back
bv = BVHTree.FromBMesh(bm); sb = bmesh.new(); W = 0.019
xs = np.linspace(-0.24, 0.24, 160); L, R = [], []
for x in xs:
    for side, lst in ((W, L), (-W, R)):
        o = Vector((x, side, 2.3)); h = bv.ray_cast(o, Vector((0, 0, -1)))
        lst.append(h if h[0] is not None and bm.faces[h[2]].material_index == 0 else None)
fs = []
for i in range(len(xs) - 1):
    q = [L[i], R[i], R[i + 1], L[i + 1]]
    if any(h is None for h in q): continue
    fs.append([h[0] + h[1] * 0.0035 for h in q])
sv = {}
def V_(p):
    k = tuple(round(c, 6) for c in p)
    if k not in sv: sv[k] = sb.verts.new(p)
    return sv[k]
for q in fs:
    f = sb.faces.new([V_(p) for p in q]); f.normal_update()
    if f.normal.z < 0: f.normal_flip()
bmesh.ops.solidify(sb, geom=list(sb.faces), thickness=0.0022)
sm = bpy.data.meshes.new('stripe'); sb.to_mesh(sm)
bm.free(); sb.free()
# assemble Helmet with flat named materials
def mat(name, col, rough, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal; return m
NAVY = (0.026, 0.042, 0.080)
MATS = [mat('helmet_shell', NAVY, 0.55), mat('helmet_stripe', (0.43, 0.25, 0.035), 0.55), mat('helmet_grille', (0.50, 0.51, 0.53), 0.4, 0.0), mat('helmet_guard', (0.015, 0.022, 0.04), 0.7)]
mi = [p.material_index for p in src.polygons]
src.materials.clear(); [src.materials.append(m) for m in MATS]
for p, k in zip(src.polygons, mi): p.material_index = k
sm.materials.clear(); [sm.materials.append(m) for m in MATS]
for p in sm.polygons: p.material_index = 1
bm = bmesh.new(); bm.from_mesh(src); bm.from_mesh(sm); bm.to_mesh(src); bm.free()
for p in src.polygons: p.use_smooth = True
o = bpy.data.objects.new('Helmet', src); bpy.context.scene.collection.objects.link(o)
for x in list(bpy.data.objects):
    if x is not o: bpy.data.objects.remove(x)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('dhelm.blend'))
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('../../pads/gh_only.blend'))
if 'Helmet' in bpy.data.objects: bpy.data.objects.remove(bpy.data.objects['Helmet'])
with bpy.data.libraries.load(os.path.abspath('dhelm.blend')) as (a, b): b.objects = ['Helmet']
bpy.context.scene.collection.objects.link(b.objects[0]); print('Helmet', len(b.objects[0].data.polygons))
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('../../pads/gh_only.blend'))
