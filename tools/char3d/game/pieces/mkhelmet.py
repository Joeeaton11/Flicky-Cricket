"""Cricket batting helmet built in 3D around the bald master's skull (rig frame: +X front, +Y left, Z up, metres).
Shell down to the brow with a short wide peak, gold centre stripe and gold piping on the rim, ear flaps, grille clamps
at the temples and a boxy steel grille from under the nose to the chin. Writes Helmet into gh_only.blend."""
import bpy, bmesh, math, numpy as np, os
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('gh_only.blend'))
if 'Helmet' in bpy.data.objects: bpy.data.objects.remove(bpy.data.objects['Helmet'])
C = Vector((0.0, 0.0, 1.600)); NP = 2.4
AXF, AXB, AY, AZU, AZD = 0.142 + 0.026, 0.147 + 0.024, 0.127 + 0.036, 0.168 + 0.022, 0.175
def rad(d):
    return (abs(d.x / (AXF if d.x > 0 else AXB)) ** NP + abs(d.y / AY) ** NP + abs(d.z / (AZU if d.z > 0 else AZD)) ** NP) ** (-1 / NP)
RIM = [(0, 1.662), (45, 1.655), (68, 1.612), (100, 1.590), (128, 1.535), (180, 1.478)]
def zcut(az):
    a = abs(math.degrees(az))
    for (a0, z0), (a1, z1) in zip(RIM, RIM[1:]):
        if a <= a1: t = (a - a0) / (a1 - a0); t = t * t * (3 - 2 * t); return z0 + (z1 - z0) * t
    return RIM[-1][1]
def surf(az, el):
    d = Vector((math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), math.sin(el))); return C + d * rad(d)
def el_at(az, z):
    lo, hi = -1.3, 1.5
    for _ in range(40):
        m = (lo + hi) / 2
        if surf(az, m).z < z: lo = m
        else: hi = m
    return (lo + hi) / 2
def rimpt(az, out=0.0): p = surf(az, el_at(az, zcut(az))); return p + Vector((math.cos(az), math.sin(az), 0)) * out
def mat(name, col, rough, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal; return m
NAVY = (0.026, 0.042, 0.080); GOLD = (0.43, 0.25, 0.035)
M = [mat('helmet_shell', NAVY, 0.6), mat('helmet_stripe', GOLD, 0.55), mat('helmet_grille', (0.42, 0.43, 0.45), 0.45, 0.3), mat('helmet_guard', NAVY, 0.6)]
bm = bmesh.new()
# ---- shell
NA, NE = 128, 40; top = math.radians(89.5); rows = []
for j in range(NE + 1):
    rows.append([bm.verts.new(surf(az, el_at(az, zcut(az)) + (top - el_at(az, zcut(az))) * (j / NE) ** 0.9))
                 for az in [-math.pi + 2 * math.pi * i / NA for i in range(NA)]])
shell = [bm.faces.new((rows[j][i], rows[j][(i + 1) % NA], rows[j + 1][(i + 1) % NA], rows[j + 1][i])) for j in range(NE) for i in range(NA)]
shell.append(bm.faces.new(rows[NE][::-1]))
bmesh.ops.recalc_face_normals(bm, faces=shell)
bmesh.ops.solidify(bm, geom=shell, thickness=0.008)
# ---- centre stripe (front rim -> top -> back rim)
def band(az, w=0.02, lift=0.0012, n=90):
    L, R_ = [], []
    for el in np.linspace(el_at(az, zcut(az)), math.pi / 2, n):
        p = surf(az, el); t = Vector((-math.sin(az), math.cos(az), 0))
        nrm = (surf(az, el + 1e-3) - surf(az, el - 1e-3)).cross(t).normalized()
        if nrm.dot(p - C) < 0: nrm = -nrm
        L.append(bm.verts.new(p + nrm * lift + t * w)); R_.append(bm.verts.new(p + nrm * lift - t * w))
    fs = [bm.faces.new((L[k], R_[k], R_[k + 1], L[k + 1])) for k in range(n - 1)]
    for f in fs:
        f.material_index = 1; f.normal_update()
        if f.normal.dot(f.calc_center_median() - C) < 0: f.normal_flip()
    bmesh.ops.solidify(bm, geom=fs, thickness=0.0025)
band(0.0); band(math.pi)
def tube(pts, rr, mi, seg=10, closed=False):
    pts = [Vector(p) for p in pts]; n = len(pts); vs = []
    for k, p in enumerate(pts):
        a_, b_ = (pts[(k - 1) % n], pts[(k + 1) % n]) if closed else (pts[max(k - 1, 0)], pts[min(k + 1, n - 1)])
        t = (b_ - a_).normalized(); u = t.cross(Vector((0, 0, 1)) if abs(t.z) < 0.9 else Vector((1, 0, 0))).normalized(); v = t.cross(u)
        vs.append([bm.verts.new(p + (u * math.cos(2 * math.pi * s / seg) + v * math.sin(2 * math.pi * s / seg)) * rr) for s in range(seg)])
    for k in range(n if closed else n - 1):
        for s in range(seg):
            f = bm.faces.new((vs[k][s], vs[k][(s + 1) % seg], vs[(k + 1) % n][(s + 1) % seg], vs[(k + 1) % n][s])); f.material_index = mi
    if not closed:
        for ring in (vs[0], vs[-1][::-1]): f = bm.faces.new(ring); f.material_index = mi
# ---- peak: short, wide and flat, rounded corners, gold piping on its edge
PA = 74; NPK = 48; inner, outer = [], []
for i in range(NPK + 1):
    az = math.radians(-PA + 2 * PA * i / NPK); p = rimpt(az) + Vector((0, 0, 0.003))
    u = abs(math.degrees(az)) / PA; w = 0.046 * math.sqrt(max(0.0, 1 - u ** 4)) + 0.002
    inner.append(bm.verts.new(p)); outer.append(bm.verts.new(p + Vector((math.cos(az), math.sin(az), 0)) * w + Vector((0, 0, -0.010 * w / 0.048))))
pk = [bm.faces.new((inner[i], outer[i], outer[i + 1], inner[i + 1])) for i in range(NPK)]
bmesh.ops.recalc_face_normals(bm, faces=pk); bmesh.ops.solidify(bm, geom=pk, thickness=0.011)
# gold piping round the rest of the rim (sides and back)
tube([rimpt(math.radians(a), 0.004) + Vector((0, 0, 0.002)) for a in np.linspace(PA - 2, 360 - PA + 2, 120)], 0.0045, 1, seg=8)
# ---- ear flaps: rounded navy covers over the ears, under the rim
EAR = []
for sg in (1, -1):
    az = sg * math.radians(95); top_z = zcut(az) + 0.006; ctr = Vector((-0.012, sg * (AY + 0.006), top_z - 0.042)); EAR.append(ctr)
    n = Vector((0, sg, 0)); ring0, ring1 = [], []
    for s in range(32):
        a = 2 * math.pi * s / 32; q = ctr + Vector((math.cos(a) * 0.040, 0, math.sin(a) * 0.046))
        q.y = sg * (AY + 0.004 - 0.010 * (1 - math.cos(a)) * 0.5 * (q.z < ctr.z)); ring0.append(bm.verts.new(q)); ring1.append(bm.verts.new(q + n * 0.012))
    for s in range(32):
        f = bm.faces.new((ring0[s], ring0[(s + 1) % 32], ring1[(s + 1) % 32], ring1[s])); f.material_index = 3
    f = bm.faces.new(ring1 if sg < 0 else ring1[::-1]); f.material_index = 3; f = bm.faces.new(ring0[::-1] if sg < 0 else ring0); f.material_index = 3
# ---- grille clamps at the temples (grey knobs)
KN = []
for sg in (1, -1):
    az = sg * math.radians(80); zc = 1.618; p = surf(az, el_at(az, zc)); n = Vector((math.cos(az), math.sin(az), 0)); KN.append(p + n * 0.022)
    tube([p - n * 0.002, p + n * 0.020], 0.016, 2, seg=20)
# ---- grille: boxy front (superellipse plan), bars under the nose, mid and chin, uprights, arms back to the clamps
GX, GY, GE = 0.236, 0.150, 3.0
def gp(a, z, shrink=0.0):
    a = math.radians(a); c, s = math.cos(a), math.sin(a)
    r = (abs(c) ** GE + abs(s) ** GE) ** (-1 / GE)
    return Vector((-0.012 + (GX - shrink) * c * r, (GY - shrink * 0.5) * s * r, z))
ZT, ZM, ZB = 1.530, 1.480, 1.432
def zsh(z): t = (ZT - z) / (ZT - ZB); return 0.034 * t ** 1.3          # tucks in towards the chin (U from the front)
SPAN = {ZT: 72, ZM: 58, ZB: 36}
for z, a0 in SPAN.items():
    tube([gp(a, z, zsh(z)) for a in np.linspace(-a0, a0, 40)], 0.0052, 2)
for a in (0, -20, 20):
    tube([gp(a, z, zsh(z)) for z in np.linspace(ZT, ZB, 10)], 0.0048, 2)
for sg in (1, -1):
    tube([gp(sg * 42, z, zsh(z)) for z in np.linspace(ZT, ZM, 6)], 0.0048, 2)
    tube([gp(sg * a, z, zsh(z)) for a, z in zip(np.linspace(60, 36, 8), np.linspace(ZM, ZB, 8))], 0.0050, 2)   # side of the U
for sg, k in zip((1, -1), KN):
    e = gp(sg * SPAN[ZT], ZT); tube([k.lerp(e, t) for t in np.linspace(0, 1, 10)], 0.0055, 2)                  # clamp -> top bar
    m = gp(sg * SPAN[ZM], ZM, zsh(ZM)); tube([k.lerp(m, t) for t in np.linspace(0, 1, 12)], 0.0055, 2)         # clamp -> mid bar
me = bpy.data.meshes.new('Helmet'); bm.to_mesh(me); bm.free()
for m in M: me.materials.append(m)
for p in me.polygons: p.use_smooth = True
o = bpy.data.objects.new('Helmet', me); bpy.context.scene.collection.objects.link(o)
print('Helmet', len(me.polygons))
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('gh_only.blend'))
