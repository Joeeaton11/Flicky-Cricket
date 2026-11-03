"""Caps for the fielder (Joe, Nov 3): a baseball cap and a wide-brim sunhat, built to fit the base player's head and
riding rigidly on the Head bone. Class 2 in the colour guide (the game recolours it to the side's kit).
Rig space: forward = +X (toes), up = +Z, metres."""
import bpy, bmesh, math, numpy as np
from mathutils import Vector, Matrix

def head_shape(body):
    g = body.vertex_groups.get('Head'); gi = g.index
    pts = []
    for v in body.data.vertices:
        w = next((x.weight for x in v.groups if x.group == gi), 0)
        if w > 0.6: pts.append(body.matrix_world @ v.co)
    P = np.array([[p.x, p.y, p.z] for p in pts])
    top = P[:, 2].max(); bot = np.percentile(P[:, 2], 2); hh = top - bot
    up = P[P[:, 2] > top - 0.42 * hh]                       # skull above the brow
    cx, cy = np.median(up[:, 0]), np.median(up[:, 1])
    band = P[(P[:, 2] > top - 0.55 * hh) & (P[:, 2] < top - 0.30 * hh)]
    rx = np.percentile(np.abs(band[:, 0] - cx), 97); ry = np.percentile(np.abs(band[:, 1] - cy), 97)
    return dict(c=Vector((cx, cy, 0)), top=top, hh=hh, rx=rx, ry=ry, brow=top - 0.40 * hh)

def mat(name, col):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF'); b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = 0.85
    return m

def crown(bm, H, sc=1.08, seg=40, rings=10):
    """half-ellipsoid dome from the brow line up over the top of the head"""
    rx, ry, h = H['rx'] * sc, H['ry'] * sc, (H['top'] - H['brow']) * 1.16
    ring = []
    for j in range(rings + 1):
        t = j / rings * math.pi / 2; z = H['brow'] + math.sin(t) * h; s = math.cos(t)
        if j == rings: ring.append([bm.verts.new((H['c'].x, H['c'].y, z))]); break
        ring.append([bm.verts.new((H['c'].x + math.cos(a) * rx * s, H['c'].y + math.sin(a) * ry * s, z))
                     for a in [2 * math.pi * i / seg for i in range(seg)]])
    for j in range(rings - 1):
        A, B = ring[j], ring[j + 1]
        for i in range(seg): bm.faces.new((A[i], A[(i + 1) % seg], B[(i + 1) % seg], B[i]))
    A, c = ring[rings - 1], ring[rings][0]
    for i in range(seg): bm.faces.new((A[i], A[(i + 1) % seg], c))
    # a button on top and six panel seams are left to the shading
    return rx, ry

def brim_baseball(bm, H, rx, ry):
    """peak out the front (+X), curved, tipped down a touch"""
    n = 24; z0 = H['brow'] + 0.004; L = rx * 0.82; tilt = math.radians(10)
    inner, outer = [], []
    for i in range(n + 1):
        a = -math.radians(78) + math.radians(156) * i / n
        x, y = math.cos(a) * rx, math.sin(a) * ry
        k = math.cos(a * 0.9) ** 0.8                          # longest in the middle
        ox, oy = x + k * L, y * 1.06
        bend = (y / ry) ** 2 * 0.012                          # sides curve down
        inner.append(bm.verts.new((H['c'].x + x, H['c'].y + y, z0)))
        outer.append(bm.verts.new((H['c'].x + ox, H['c'].y + oy, z0 - math.tan(tilt) * (ox - x) - bend)))
    for i in range(n): bm.faces.new((inner[i], inner[i + 1], outer[i + 1], outer[i]))

def brim_wide(bm, H, rx, ry):
    """sunhat: a full brim all the way round, drooping at the edge"""
    seg = 40; z0 = H['brow'] + 0.004; R = 1.5
    inner, mid, outer = [], [], []
    for i in range(seg):
        a = 2 * math.pi * i / seg; x, y = math.cos(a) * rx, math.sin(a) * ry
        inner.append(bm.verts.new((H['c'].x + x, H['c'].y + y, z0)))
        mid.append(bm.verts.new((H['c'].x + x * 1.25, H['c'].y + y * 1.25, z0 - 0.005)))
        outer.append(bm.verts.new((H['c'].x + x * R, H['c'].y + y * R, z0 - 0.034)))
    for i in range(seg):
        j = (i + 1) % seg
        bm.faces.new((inner[i], inner[j], mid[j], mid[i])); bm.faces.new((mid[i], mid[j], outer[j], outer[i]))

def add_cap(rig, body, style):
    rig.data.pose_position = 'REST'; bpy.context.view_layer.update()
    H = head_shape(body)
    bm = bmesh.new()
    rx, ry = crown(bm, H, sc=1.14 if style == 'baseball' else 1.15)
    if style == 'wide':
        # sunhat: taller, rounder crown than a cap
        for v in bm.verts:
            if v.co.z > H['brow'] + 0.002: v.co.z = H['brow'] + (v.co.z - H['brow']) * 1.06
    (brim_baseball if style == 'baseball' else brim_wide)(bm, H, rx, ry)
    me = bpy.data.meshes.new('Cap'); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    cap = bpy.data.objects.new('Cap', me); bpy.context.scene.collection.objects.link(cap)
    sol = cap.modifiers.new('thick', 'SOLIDIFY'); sol.thickness = 0.010; sol.offset = 1.0
    cap.data.materials.append(mat('CapCloth', (0.20, 0.24, 0.36)))
    # class 2 (helmet / cap) in the colour guide, same encoding as the body
    a = me.color_attributes.new('cls', 'BYTE_COLOR', 'CORNER'); v = (8 + 16 * 2) / 255
    v = v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    a.data.foreach_set('color', np.tile([v, 0, 0, 1], len(me.loops)).astype(np.float32)); me.color_attributes.active_color = a
    # ride rigidly on the Head bone (bone parent space sits at the bone's tail)
    pb = rig.pose.bones['Head']
    M = rig.matrix_world @ pb.matrix @ Matrix.Translation((0, pb.length, 0))
    cap.parent = rig; cap.parent_type = 'BONE'; cap.parent_bone = 'Head'; cap.matrix_parent_inverse = M.inverted()
    rig.data.pose_position = 'POSE'; bpy.context.view_layer.update()
    print('cap', style, 'head', round(H['rx'], 3), round(H['ry'], 3), round(H['hh'], 3))
    return cap
