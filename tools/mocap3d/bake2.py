"""Bake a retargeted clip (CLIP=seam|drive) to plain bone keys + prop bones, add props and pitch, export GLB."""
import os, sys
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'retarget.py')).read())
import bmesh
DEF = [b.name for b in rig.data.bones if b.use_deform]
order = sorted(DEF, key=lambda n: len(rig.data.bones[n].parent_recursive))
mats, hand = {}, {}
for k in range(NF + 1):
    pose_frame(k)
    mats[k] = {n: rig.pose.bones[n].matrix.copy() for n in DEF}
    hand[k] = rig.pose.bones['Hand.R'].matrix.copy()
    if FIELD: hand[k, 'L'] = rig.pose.bones['Hand.L'].matrix.copy()
# ---------------- props in world, per output frame
props = {}   # name -> {k: Matrix(loc/rot, unit scale)}
def LR(M):
    l, r, _ = M.decompose(); return Matrix.LocRotScale(l, r, None)
if BOWL:
    kr = int(round((CFG['rel'] - CFG['t0']) * FPS))
    BH = {k: (hand[k] @ Vector((0, 0.085, -0.04))) for k in range(kr + 1)}
    p0 = BH[kr]; land = Vector((13.2, -0.5, 0.036)); far = Vector((19.0, -0.42, 0.55)); TL, TF = 14, 20; LOOP = 0.25
    if CLIP != 'seam':   # spin: slower, loopier, a touch fuller; turns off the pitch (off spin into the right-hander, leg spin away)
        TL, TF, LOOP = 24, 32, 0.7; land = Vector((14.6, -0.5, 0.036)); far = Vector((19.0, -0.5 + (0.32 if CLIP == 'offspin' else -0.32), 0.45))
    props['Ball'] = {}
    for k in range(NF + 1):
        if k <= kr: p = BH[k]; s = 1
        elif k <= kr + TL: u = (k - kr) / TL; p = p0.lerp(land, u); p.z = p0.z + (land.z - p0.z) * u ** 1.15 + LOOP * math.sin(math.pi * u) * (1 - 0.35 * u); s = 1
        elif k <= kr + TF: u = (k - kr - TL) / (TF - TL); p = land.lerp(far, u); p.z = land.z + 0.5 * math.sin(math.pi * 0.5 * u); s = 1
        else: p = far; s = 0.001
        props['Ball'][k] = (Matrix.LocRotScale(p, Euler((0, -max(0, k - kr) * 0.9, 0) if CLIP == 'seam' else (max(0, k - kr) * (1.1 if CLIP == 'offspin' else -1.1), 0, 0)).to_quaternion(), Vector((s, s, s))))
elif FIELD:
    # ball: the captured path, and in his real hands whenever the capture has it in a hand
    props['Ball'] = {}; n = NF + 1
    def palm_my(k, s): M = hand[k] if s == 'R' else hand[k, 'L']; return M @ Vector((0, 0.06, 0))
    def palm_cap(t, s):
        S_ = 'Left' if s == 'L' else 'Right'; return X((mp(f'{S_}Hand', t, 0.004) + mp(f'{S_}HandMiddle1', t, 0.004)) / 2)
    cb = []
    for k in range(n):
        fr = int(round(tfr(times[k]))); fr = min(max(fr, min(smp)), max(smp)); cb.append(X(smp[fr]['ball']))
    D = [None] * n; held = 0
    for k in range(n):
        best = min(('L', 'R'), key=lambda s: (cb[k] - palm_cap(times[k], s)).length); dist = (cb[k] - palm_cap(times[k], best)).length
        if dist < 0.13: D[k] = palm_my(k, best) - palm_cap(times[k], best); held += 1
    have = [k for k in range(n) if D[k] is not None]
    if have:
        for k in range(n):
            if D[k] is None:
                a = max([j for j in have if j < k], default=None); b = min([j for j in have if j > k], default=None)
                D[k] = D[b] if a is None else D[a] if b is None else D[a].lerp(D[b], (k - a) / (b - a))
    else: D = [Vector()] * n
    print('ball in hand frames', held, 'of', n)
    for k in range(n):
        p = cb[k] + D[k]; p.z = max(p.z, 0.036)
        props['Ball'][k] = Matrix.LocRotScale(p, Euler((0, k * 0.4, 0)).to_quaternion(), None)
else:
    props['Bat'] = {}; props['Ball'] = {}
    # contact = closest approach of ball to the bat's blade (captured)
    best = None
    for fr in smp:
        bl = smp[fr]['bat'].inverted() @ smp[fr]['ball']
        d = (Vector((bl.x, 0, bl.z)) - Vector((125.5, 0, 11.8))).length if -60 < bl.y - 106.8 < 5 else 1e9
        if best is None or d < best[0]: best = (d, fr)
    fc = best[1]; tc = (fc - SF0) / CFG['src']; kc = int(round((tc - CFG['t0']) * FPS)); print('contact t', round(tc, 3), 'frame', kc)
    Rigid = bat_info['M'][kc] @ smp[fc]['bat'].inverted()   # capture -> our world, rigid at the contact moment
    for k in range(NF + 1):
        M = bat_info['M'][k]; l, r, _ = M.decompose()
        props['Bat'][k] = Matrix.LocRotScale(M @ bat_info['grip_local'], r, None)   # bone sits on the grip; the mesh is built about the grip
        fr = int(round(tfr(times[k]))); b = Rigid @ smp[fr]['ball']; b.z = max(b.z, 0.036)
        props['Ball'][k] = Matrix.LocRotScale(b, Euler((0, k * 0.6, 0)).to_quaternion(), None)
# ---------------- batter: one shared stance, level eyes, head follows the ball smoothly
if BAT:
    def qof(M): return M.to_quaternion()
    def mix(M0, M1, w):   # blend two armature-space matrices (w = weight of M1)
        l0, r0, _ = M0.decompose(); l1, r1, _ = M1.decompose()
        return Matrix.LocRotScale(l0.lerp(l1, w), r0.slerp(r1, w), None)
    def smooth01(a, b, x): u = min(1, max(0, (x - a) / max(1e-6, b - a))); return u * u * (3 - 2 * u)
    TC = times[kc]
    # Joe: every shot starts in the reverse sweep's stance, then blends into its own action before the backlift
    SPATH = f'{W}/stance_pose.npz'
    if CLIP == 'shot_reverse_sweep':
        np.savez(SPATH, names=np.array(DEF), mats=np.array([np.array(mats[0][n]) for n in DEF]), bat=np.array(props['Bat'][0]))
    SP = np.load(SPATH); SM = {str(n): Matrix(m.tolist()) for n, m in zip(SP['names'], SP['mats'])}; SB = Matrix(SP['bat'].tolist())
    B0, B1 = max(0.0, TC - 0.95), max(0.25, TC - 0.6)
    for k in range(NF + 1):
        w = 1 - smooth01(B0, B1, times[k])          # 1 = shared stance
        if w > 0:
            mats[k] = {n: mix(mats[k][n], SM[n], w) if n in SM else mats[k][n] for n in DEF}
            props['Bat'][k] = mix(props['Bat'][k], SB, w)
    # head: level-eyed in the stance (looking down the pitch at the bowler, a little down), then onto the ball;
    # the turn is eased frame to frame so it follows the ball quickly at contact without snapping
    hrest = rig.data.bones['Head'].matrix_local.to_quaternion(); nrest = rig.data.bones['Neck'].matrix_local.to_quaternion()
    UP = Vector((0, 0, 1)); prev = None; MAXA = math.radians(75); STEP = math.radians(float(os.environ.get('HEADSTEP', 9)))
    for k in range(NF + 1):
        t = times[k]; Mh, Mn = mats[k]['Head'], mats[k]['Neck']
        qcap = qof(Mh) @ hrest.inverted(); qn = qof(Mn) @ nrest.inverted()
        eye = Mh.translation + qof(Mh) @ Vector((0, 0.11, 0)) + qcap @ Vector((0.08, 0, 0))
        d = (props['Ball'][k].translation - eye).normalized()
        lv = 1 - smooth01(TC - 0.75, TC - 0.35, t)       # 1 = level stance head
        # level look: forward = toward the ball, a few degrees down; eyes level (no roll)
        side = UP.cross(d).normalized(); dl = (Quaternion(side, math.radians(9 * lv)) @ d).normalized()
        f = Vector((dl.x, dl.y, dl.z)); upv = (UP - f * UP.dot(f)).normalized(); lf = upv.cross(f)
        Q_level = Matrix((f, lf, upv)).transposed().to_quaternion()
        # Joe: eyes level through the whole shot too (cut / pull / glance had the capture's sideways tilt)
        want = Q_level
        if qcap.dot(want) < 0: want = -want
        gap = qcap.rotation_difference(want).angle
        if gap > MAXA: want = qcap.slerp(want, MAXA / gap)   # never more than 75° from where the capture's head was
        if prev is None: q = want
        else:
            if prev.dot(want) < 0: want = -want
            a = prev.rotation_difference(want).angle
            frac = 1.0 if a < 1e-5 else min(0.55, (STEP + a * 0.15) / a)   # ease towards it, capped per frame
            q = prev.slerp(want, frac)
        prev = q
        change = q @ qcap.inverted()
        qneck = Quaternion().slerp(change, 0.4) @ qn
        mats[k]['Neck'] = Matrix.LocRotScale(Mn.translation, qneck @ nrest, None)
        mats[k]['Head'] = Matrix.LocRotScale(Mh.translation, q @ hrest, None)
if FIELD:
    hrest = rig.data.bones['Head'].matrix_local.to_quaternion(); nrest = rig.data.bones['Neck'].matrix_local.to_quaternion()
    UP = Vector((0, 0, 1)); prev = None; MAXA = math.radians(70); STEP = math.radians(10)
    for k in range(NF + 1):
        Mh, Mn = mats[k]['Head'], mats[k]['Neck']; qcap = Mh.to_quaternion() @ hrest.inverted(); qn = Mn.to_quaternion() @ nrest.inverted()
        eye = Mh.translation + Mh.to_quaternion() @ Vector((0, 0.11, 0))
        d = props['Ball'][k].translation - eye
        if d.length < 0.35: d = (qcap @ Vector((1, 0, 0))) * 0.5 + d   # ball in the hands: don't stare cross-eyed at it
        f = d.normalized(); upv = (UP - f * UP.dot(f)).normalized(); want = Matrix((f, upv.cross(f), upv)).transposed().to_quaternion()
        if qcap.dot(want) < 0: want = -want
        gap = qcap.rotation_difference(want).angle
        if gap > MAXA: want = qcap.slerp(want, MAXA / gap)
        if prev is None: q = want
        else:
            if prev.dot(want) < 0: want = -want
            a = prev.rotation_difference(want).angle; q = prev.slerp(want, 1.0 if a < 1e-5 else min(0.6, (STEP + a * 0.2) / a))
        prev = q; change = q @ qcap.inverted(); qneck = Quaternion().slerp(change, 0.4) @ qn
        mats[k]['Neck'] = Matrix.LocRotScale(Mn.translation, qneck @ nrest, None)
        mats[k]['Head'] = Matrix.LocRotScale(Mh.translation, q @ hrest, None)
# ---------------- bowler head: the capture's own head movement, its constant offset measured in the run-up and removed,
# eyes mostly level, and only a gentle pull toward the batter up to release (Joe: not rigid, not leaning)
if BOWL and not os.environ.get('NOHEAD'):
    hrest = rig.data.bones['Head'].matrix_local.to_quaternion(); nrest = rig.data.bones['Neck'].matrix_local.to_quaternion()
    UP = Vector((0, 0, 1)); TGT = Vector((19.0, -0.55, 0.6)); kr_ = int(round((CFG['rel'] - CFG['t0']) * FPS))
    def level(qq, down=0.0):
        f = qq @ Vector((1, 0, 0)); f = f.normalized()
        side = UP.cross(f); side = side.normalized() if side.length > 1e-4 else Vector((0, 1, 0))
        if down: f = (Quaternion(side, math.radians(down)) @ f).normalized()
        upv = (UP - f * UP.dot(f)).normalized(); return Matrix((f, upv.cross(f), upv)).transposed().to_quaternion()
    def look(eye):
        d = (TGT - eye); d.z = min(d.z, 0); d = d.normalized(); side = UP.cross(d).normalized()
        dl = (Quaternion(side, math.radians(4)) @ d).normalized(); upv = (UP - dl * UP.dot(dl)).normalized()
        return Matrix((dl, upv.cross(dl), upv)).transposed().to_quaternion()
    caps, looks = [], []
    for k in range(NF + 1):
        Mh = mats[k]['Head']; qcap = Mh.to_quaternion() @ hrest.inverted(); caps.append(qcap)
        looks.append(look(Mh.translation + Mh.to_quaternion() @ Vector((0, 0.11, 0))))
    # each capture's head sensor has its own fixed error. Measure it over the early run-up, where a bowler's head is
    # level and looking straight down the pitch (+X), then play the captured head movement as it is.
    fwd = level(Quaternion(), down=8.0)
    acc = np.zeros(4); ref = None
    for k in range(0, max(6, kr_ - 40)):
        o = caps[k].inverted() @ fwd; v = np.array(o[:]); ref = v if ref is None else ref; v = v if v.dot(ref) >= 0 else -v; acc += v
    OFF = Quaternion(acc / np.linalg.norm(acc)); print('head sensor offset removed (deg)', round(math.degrees(OFF.angle), 1))
    prev = None; HY = []
    for k in range(NF + 1):
        Mh = mats[k]['Head']; want = caps[k] @ OFF
        # keep the captured turn of the head, but a bowler never tips his head back or leans it right over
        f = (want @ Vector((1, 0, 0))).normalized(); yaw = math.atan2(f.y, f.x); pit = math.asin(max(-1, min(1, f.z)))
        sd0 = Vector((-math.sin(yaw), math.cos(yaw), 0)); upv0 = f.cross(sd0).normalized()
        uh = want @ Vector((0, 0, 1)); roll = math.atan2(uh.dot(sd0), uh.dot(upv0))
        pit = max(math.radians(-35), min(math.radians(4), pit)); roll = max(math.radians(-14), min(math.radians(14), roll))
        HY.append(round(math.degrees(yaw)))
        want = Quaternion((0, 0, 1), yaw) @ Quaternion((0, 1, 0), -pit) @ Quaternion((1, 0, 0), -roll)
        if prev is not None:
            if prev.dot(want) < 0: want = -want
            want = prev.slerp(want, 0.75)
        prev = want
        mats[k]['Head'] = Matrix.LocRotScale(Mh.translation, want @ hrest, None)
    print('head yaw every 6', HY[::6])
# ---------------- strip controls, add prop bones, write keys
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode='POSE')
for pb in rig.pose.bones:
    for c in list(pb.constraints): pb.constraints.remove(c)
bpy.ops.object.mode_set(mode='EDIT')
for b in list(rig.data.edit_bones):
    if b.name.startswith(('IK_', 'Pole_')): rig.data.edit_bones.remove(b)
for n in props:
    bb = rig.data.edit_bones.new(n + 'Bone'); bb.head = (0, 0, 0); bb.tail = (0, 0.1, 0); bb.roll = 0; bb.parent = rig.data.edit_bones['Root']
bpy.ops.object.mode_set(mode='OBJECT')
rig.data.bones['Root'].use_deform = True
for n in props: rig.data.bones[n + 'Bone'].use_deform = True
rig.animation_data_create(); rig.animation_data.action = bpy.data.actions.new({'seam': 'Seam', 'offspin': 'OffSpin', 'legspin': 'LegSpin', 'drive': 'OffDrive', 'cover': 'CoverDrive'}.get(CLIP, CLIP))
for o in new: bpy.data.objects.remove(o) if o.name in bpy.data.objects else None
for k in range(NF + 1):
    ctrl.reset(rig)
    for n in order:
        rig.pose.bones[n].matrix = mats[k][n]; bpy.context.view_layer.update()
    for n in DEF:
        pb = rig.pose.bones[n]; pb.rotation_mode = 'QUATERNION'; pb.keyframe_insert('rotation_quaternion', frame=k)
        if n == 'Hips': pb.keyframe_insert('location', frame=k)
    for n, d in props.items():
        pb = rig.pose.bones[n + 'Bone']; pb.rotation_mode = 'QUATERNION'; pb.matrix = d[k]; bpy.context.view_layer.update()
        for prop in ('location', 'rotation_quaternion', 'scale'): pb.keyframe_insert(prop, frame=k)
sc.frame_start, sc.frame_end = 0, NF
for o in list(bpy.data.objects):          # only our rig and body go out
    if o not in (rig, body): bpy.data.objects.remove(o, do_unlink=True)
mine = rig.animation_data.action
for a in list(bpy.data.actions):
    if a != mine: bpy.data.actions.remove(a)
# ---------------- prop meshes
def mat(name, rgb, rough=0.5):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough
    return m
def attach(o, bone):
    o.parent = rig; o.parent_type = 'BONE'; o.parent_bone = bone; o.matrix_parent_inverse.identity(); o.location = (0, -0.1, 0)
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.036, segments=24, ring_count=12); ball = bpy.context.active_object; ball.name = 'Ball'
ball.data.materials.append(mat('Leather', (0.55, 0.03, 0.03), 0.35)); bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_torus_add(major_radius=0.0362, minor_radius=0.0032, major_segments=32, minor_segments=6); seam = bpy.context.active_object
seam.data.materials.append(mat('Seam', (0.95, 0.93, 0.85))); seam.rotation_euler = (math.radians(90), 0, 0)
bpy.ops.object.select_all(action='DESELECT'); seam.select_set(True); ball.select_set(True); bpy.context.view_layer.objects.active = ball
bpy.ops.object.transform_apply(rotation=True); bpy.ops.object.join(); attach(ball, 'BallBone')
if BAT:
    # clean bat built to the captured bat's measurements, in the captured bat's own axes (cm, then to metres about the grip)
    C0 = Vector((125.5, 106.8, 11.8)); AX0, AX1, AX2 = Vector((0, 1, 0.002)), Vector((1, 0, 0)), Vector((0, 0.002, -1))
    G = bat_info['grip_local']
    PROF = [(-51.6, 10.9, 3.0), (-45.6, 11.3, 3.9), (-39.6, 11.5, 5.0), (-33.6, 11.5, 5.8), (-27.6, 11.5, 6.3), (-21.6, 11.5, 5.7),
            (-15.6, 11.5, 5.1), (-9.6, 11.5, 4.8), (-3.6, 11.5, 4.1), (2.4, 11.5, 4.0)]
    NP = 28; FACE = -2.8; EDGE = 1.7
    def blade_ring(w, t):
        pts = []
        for i in range(NP // 2):   # back: rounded spine, edge to edge
            th = math.pi * i / (NP // 2 - 1); pts.append((w / 2 * math.cos(th), FACE + EDGE + (t - EDGE) * max(0.0, math.sin(th)) ** 0.8))
        for i in range(NP // 2):   # flat face, edge to edge
            x = -w / 2 + w * i / (NP // 2 - 1); pts.append((x, FACE))
        return pts
    def circ(r, zc):
        return [(r * math.cos(2 * math.pi * i / NP + math.pi / 2 * 0), zc + r * math.sin(2 * math.pi * i / NP)) for i in range(NP)]
    rings = [(a, blade_ring(w, t)) for a, w, t in PROF]
    hz = 0.4
    for a, f in ((5.5, 0.35), (8.4, 0.75), (11.0, 1.0)):
        br = blade_ring(11.5 * (1 - f) + 3.4 * f, 4.0 * (1 - f) + 3.4 * f); cr = circ(1.7, hz)
        rings.append((a, [(bx * (1 - f) + cx * f, bz * (1 - f) + cz * f) for (bx, bz), (cx, cz) in zip(br, cr)]))
    for a in (14, 20, 26, 31): rings.append((a, circ(1.75, hz)))
    rings.append((33.4, circ(1.95, hz)))
    bm = bmesh.new(); vrows = []
    for a, pts in rings:
        row = [bm.verts.new(0.01 * (C0 + AX0 * a + AX1 * x + AX2 * z - G)) for x, z in pts]; vrows.append((a, row))
    grip_m, wood_m, cap_m = mat('Grip', (0.10, 0.17, 0.42), 0.8), mat('Willow', (0.86, 0.72, 0.47), 0.55), mat('Cap', (0.06, 0.07, 0.1), 0.6)
    for (a0, r0), (a1, r1) in zip(vrows, vrows[1:]):
        for i in range(NP):
            f = bm.faces.new((r0[i], r0[(i + 1) % NP], r1[(i + 1) % NP], r1[i])); f.material_index = 1 if a0 >= 11 else 0
    f = bm.faces.new(list(reversed(vrows[0][1]))); f.material_index = 0
    f = bm.faces.new(vrows[-1][1]); f.material_index = 2
    me = bpy.data.meshes.new('Bat'); bm.normal_update(); bm.to_mesh(me); bm.free()
    bat = bpy.data.objects.new('Bat', me); sc.collection.objects.link(bat)
    for m in (wood_m, grip_m, cap_m): me.materials.append(m)
    bpy.context.view_layer.objects.active = bat; bat.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode='OBJECT')
    attach(bat, 'BatBone')
# ---------------- ground, pitch, creases, stumps
def box(name, size, loc, m, rz=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o = bpy.context.active_object; o.name = name
    o.scale = size; o.rotation_euler = (0, 0, rz); bpy.ops.object.transform_apply(scale=True, rotation=True); o.data.materials.append(m); return o
grass, strip, chalk, wood = mat('Grass', (0.13, 0.30, 0.10), .9), mat('Strip', (0.55, 0.47, 0.30), .9), mat('Chalk', (0.95, 0.95, 0.92), .9), mat('Stump', (0.88, 0.80, 0.62), .6)
bpy.ops.mesh.primitive_circle_add(vertices=64, radius=12, fill_type='NGON', location=(0, 0, -0.012)); g = bpy.context.active_object; g.data.materials.append(grass)
if FIELD: pass
elif BOWL:
    PY = -0.55; X0, X1, XP, XS = -8, 20, 0.1, -1.12
else:
    # pitch line under the ball's approach; batter's stumps just behind him
    bl = props['Ball'][max(0, kc - 6)].translation; PY = bl.y; X0, X1, XP, XS = -20, 3, -0.15, 1.07
if not FIELD:
    box('Strip', (X1 - X0, 3.05, 0.01), ((X0 + X1) / 2, PY, -0.005), strip)
    box('Popping', (0.05, 3.05, 0.004), (XP, PY, 0.002), chalk); box('Bowling', (0.05, 2.64, 0.004), (XS, PY, 0.002), chalk)
    for y in (1.32, -1.32): box('Return', (2.44, 0.05, 0.004), ((XP + XS) / 2 + (0 if CLIP == 'seam' else 0), PY + y, 0.002), chalk)
    for dy in (-0.11, 0, 0.11):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.018, depth=0.71, location=(XS, PY + dy, 0.355), vertices=10); bpy.context.active_object.data.materials.append(wood)
sc.frame_set(0)
for o in bpy.data.objects: o.select_set(False)
out = f'{W}/{CLIP}{os.environ.get("OUTTAG", "")}.glb'
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_animations=True, export_animation_mode='ACTIVE_ACTIONS', export_def_bones=True, export_frame_range=True,
                          export_force_sampling=True, export_optimize_animation_size=True, export_yup=True)
print('GLB', CLIP, round(os.path.getsize(out) / 1e6, 2), 'MB', NF + 1, 'frames')
bpy.ops.wm.save_as_mainfile(filepath=f'{W}/{CLIP}{os.environ.get("OUTTAG", "")}.blend')
