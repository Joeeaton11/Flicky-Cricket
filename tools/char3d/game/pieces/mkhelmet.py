"""Batting helmet built in 3D around the bald master's skull (rig frame: +X front, +Y left, Z up, metres).
Shell (superellipsoid, like the skull), centre stripe, peak, ear guards and a steel grille. Writes Helmet into gh_only.blend."""
import bpy, bmesh, math, numpy as np, os
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('gh_only.blend'))
if 'Helmet' in bpy.data.objects: bpy.data.objects.remove(bpy.data.objects['Helmet'])
C = Vector((0.0, 0.0, 1.600)); NP = 2.4
AXF, AXB, AY, AZU = 0.142 + 0.024, 0.147 + 0.022, 0.127 + 0.040, 0.168 + 0.022
def rad(d):
    ax = AXF if d.x > 0 else AXB
    return (abs(d.x / ax) ** NP + abs(d.y / AY) ** NP + abs(d.z / (AZU if d.z > 0 else 0.16)) ** NP) ** (-1 / NP)
def zcut(az):       # rim height round the head: just above the brows at the front, over the ears, low at the back
    a = abs(math.degrees(az))
    pts = [(0, 1.660), (35, 1.655), (60, 1.60), (80, 1.53), (110, 1.49), (180, 1.475)]
    for (a0, z0), (a1, z1) in zip(pts, pts[1:]):
        if a <= a1: t = (a - a0) / (a1 - a0); t = t * t * (3 - 2 * t); return z0 + (z1 - z0) * t
    return pts[-1][1]
def surf(az, el):
    d = Vector((math.cos(el) * math.cos(az), math.cos(el) * math.sin(az), math.sin(el))); return C + d * rad(d)
def el_at(az, z):   # elevation where the shell reaches height z at this azimuth
    lo, hi = -1.2, 1.5
    for _ in range(40):
        m = (lo + hi) / 2
        if surf(az, m).z < z: lo = m
        else: hi = m
    return (lo + hi) / 2
def mat(name, col, rough, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal; return m
M = [mat('helmet_shell', (0.026, 0.042, 0.080), 0.6), mat('helmet_stripe', (0.43, 0.25, 0.035), 0.6),
     mat('helmet_grille', (0.30, 0.31, 0.33), 0.35, 0.6), mat('helmet_guard', (0.026, 0.042, 0.080), 0.55)]
bm = bmesh.new()
# ---- shell: grid over azimuth x elevation, rim follows zcut
NA, NE = 128, 40; top = math.radians(89.5); rows = []
for j in range(NE + 1):
    row = []
    for i in range(NA):
        az = -math.pi + 2 * math.pi * i / NA; e0 = el_at(az, zcut(az)); el = e0 + (top - e0) * (j / NE) ** 0.9
        row.append(bm.verts.new(surf(az, el)))
    rows.append(row)
shell = []
for j in range(NE):
    for i in range(NA):
        f = bm.faces.new((rows[j][i], rows[j][(i + 1) % NA], rows[j + 1][(i + 1) % NA], rows[j + 1][i])); shell.append(f)
cap = bm.faces.new(rows[NE][::-1]); shell.append(cap)
for f in shell:
    f.material_index = 0
bmesh.ops.recalc_face_normals(bm, faces=shell)
r = bmesh.ops.solidify(bm, geom=shell, thickness=0.008)
# ---- centre stripe: a clean band laid over the shell, front rim -> over the top -> back rim
def band(az, w=0.019, lift=0.0012, n=90):
    e0 = el_at(az, zcut(az)); L, R_ = [], []
    for el in np.linspace(e0, math.pi / 2, n):
        p = surf(az, el); t = Vector((-math.sin(az), math.cos(az), 0))
        nrm = (surf(az, el + 1e-3) - surf(az, el - 1e-3)).cross(t).normalized()
        if nrm.dot(p - C) < 0: nrm = -nrm
        L.append(bm.verts.new(p + nrm * lift + t * w)); R_.append(bm.verts.new(p + nrm * lift - t * w))
    return L, R_
for az in (0.0, math.pi):
    L, R_ = band(az)
    fs = [bm.faces.new((L[k], R_[k], R_[k + 1], L[k + 1])) for k in range(len(L) - 1)]
    for f in fs: f.material_index = 1
    for f in fs:
        f.normal_update()
        if f.normal.dot(f.calc_center_median() - C) < 0: f.normal_flip()
    bmesh.ops.solidify(bm, geom=fs, thickness=0.0025)
# ---- peak: a brim out of the front rim
NP_ = 40; inner, outer = [], []
for i in range(NP_ + 1):
    az = math.radians(-62 + 124 * i / NP_); z = zcut(az); p = surf(az, el_at(az, z)) + Vector((0, 0, 0.004))
    w = math.cos(math.radians(abs(math.degrees(az)) * 90 / 62)) ** 0.6 * 0.066
    out = p + Vector((math.cos(az), math.sin(az), 0)) * w + Vector((0, 0, -0.016 * w / 0.066))
    inner.append(bm.verts.new(p)); outer.append(bm.verts.new(out))
pk = [bm.faces.new((inner[i], outer[i], outer[i + 1], inner[i + 1])) for i in range(NP_)]
for f in pk: f.material_index = 0
bmesh.ops.recalc_face_normals(bm, faces=pk)
bmesh.ops.solidify(bm, geom=pk, thickness=0.008)
bm.normal_update()
def tube(pts, rr, mi, seg=10):
    vs = []
    for k, p in enumerate(pts):
        p = Vector(p); t = (Vector(pts[min(k + 1, len(pts) - 1)]) - Vector(pts[max(k - 1, 0)])).normalized()
        a = t.cross(Vector((0, 0, 1)) if abs(t.z) < 0.9 else Vector((1, 0, 0))).normalized(); b = t.cross(a)
        vs.append([bm.verts.new(p + (a * math.cos(2 * math.pi * s / seg) + b * math.sin(2 * math.pi * s / seg)) * rr) for s in range(seg)])
    for k in range(len(vs) - 1):
        for s in range(seg):
            f = bm.faces.new((vs[k][s], vs[k][(s + 1) % seg], vs[k + 1][(s + 1) % seg], vs[k + 1][s])); f.material_index = mi
    for ring in (vs[0], vs[-1][::-1]):
        f = bm.faces.new(ring); f.material_index = mi
# ---- ear guards: discs over the ears, grille posts come out of them
EG = []
for sg in (1, -1):
    az = sg * math.radians(84); zc = 1.585; e = el_at(az, zc); p = surf(az, e); n = Vector((math.cos(az), math.sin(az), 0))
    EG.append(p + n * 0.006)
    ring0 = [bm.verts.new(p + n * -0.004 + (Vector((0, 0, 1)) * math.cos(2 * math.pi * s / 24) + n.cross(Vector((0, 0, 1))) * math.sin(2 * math.pi * s / 24)) * 0.036) for s in range(24)]
    ring1 = [bm.verts.new(v.co + n * 0.016) for v in ring0]
    for s in range(24):
        f = bm.faces.new((ring0[s], ring0[(s + 1) % 24], ring1[(s + 1) % 24], ring1[s])); f.material_index = 3
    f = bm.faces.new(ring1); f.material_index = 3; f = bm.faces.new(ring0[::-1]); f.material_index = 3
# ---- grille: two arcs in front of the face, centre and side uprights, posts back to the ear guards
GX, GY, CY = 0.212, 0.168, -0.005
def arc(z, a0=-80, a1=80, n=40, gx=GX):
    return [(CY + gx * math.cos(math.radians(a)), GY * math.sin(math.radians(a)), z) for a in np.linspace(a0, a1, n)]
ZT, ZB = 1.548, 1.455
tube(arc(ZT), 0.0055, 2); tube(arc(ZB, -72, 72, 36, GX - 0.012), 0.0055, 2)
for a in (0, -30, 30):
    zt = ZT
    ptop = surf(math.radians(a), el_at(math.radians(a), zt + 0.004)); ptop = Vector((CY + (GX - 0.004) * math.cos(math.radians(a)), GY * math.sin(math.radians(a)), zt)) if a == 0 else Vector((CY + GX * math.cos(math.radians(a)), GY * math.sin(math.radians(a)), ZT))
    pb = Vector((CY + (GX - 0.012) * math.cos(math.radians(a)), GY * math.sin(math.radians(a)), ZB))
    if a == 0: tube([tuple(ptop.lerp(pb, t)) for t in np.linspace(0, 1, 12)], 0.0055, 2)
    else: tube([tuple(ptop.lerp(pb, t)) for t in np.linspace(0, 1, 8)], 0.005, 2)
for sg, g in zip((1, -1), EG):
    e1 = Vector(arc(ZT)[-1 if sg > 0 else 0]); e2 = Vector(arc(ZB, -72, 72, 36, GX - 0.012)[-1 if sg > 0 else 0])
    tube([tuple(e1.lerp(g, t)) for t in np.linspace(0, 1, 10)], 0.0055, 2)
    tube([tuple(e2.lerp(g + Vector((0, 0, -0.02)), t)) for t in np.linspace(0, 1, 10)], 0.0055, 2)
me = bpy.data.meshes.new('Helmet'); bm.to_mesh(me); bm.free()
for m in M: me.materials.append(m)
for p in me.polygons: p.use_smooth = True
o = bpy.data.objects.new('Helmet', me); bpy.context.scene.collection.objects.link(o)
mod = o.modifiers.new('ws', 'WEIGHTED_NORMAL'); 
print('Helmet', len(me.polygons))
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('gh_only.blend'))
