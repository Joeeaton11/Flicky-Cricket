"""Retarget Joe's KUMU captures onto the fresh rigs. CLIP=seam (base body + ball) | drive (batter + bat + ball).
World out: bowler runs +X; ball travels +X; up +Z. Output 30 fps."""
import bpy, os, sys, math
import numpy as np
from mathutils import Vector, Matrix, Quaternion, Euler
W = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, W)
import ctrl
CLIP = os.environ.get('CLIP', 'seam')
CFG = {'seam': dict(model='base', fbx='seam.fbx', props='seam_ball.fbx', src=120, t0=0.55, t1=5.0, rel=3.25),
       'offspin': dict(model='base', fbx='offspin.fbx', props='offspin_ball.fbx', src=120, t0=0.8, t1=5.0, rel=3.475),
       'legspin': dict(model='base', fbx='legspin.fbx', props='legspin_ball.fbx', src=120, t0=1.15, t1=5.0, rel=3.84),
       'drive': dict(model='batter', fbx='off_drive.fbx', props='ballbat.fbx', src=100, t0=0.0, t1=2.0, rel=None),
       'cover': dict(model='batter', fbx='cover.fbx', props='cover_ballbat.fbx', src=30, t0=0.0, t1=2.0, rel=None)}.get(CLIP) or \
      (dict(model='base', fbx=f'{CLIP}.fbx', props=f'{CLIP}_ball.fbx', src=None, t0=0.0, t1=None, rel=None) if CLIP.startswith('field_') else
       dict(model='batter', fbx=f'{CLIP}.fbx', props=f'{CLIP}_ballbat.fbx', src=None, t0=0.0, t1=None, rel=None))   # any KUMU batting shot: shot_<name>
BAT = CLIP in ('drive', 'cover') or CLIP.startswith('shot_')
BOWL = CLIP in ('seam', 'offspin', 'legspin')
FIELD = CLIP.startswith('field_')
FPS = 30
bpy.ops.wm.open_mainfile(filepath=f'{W}/rig_{CFG["model"]}.blend')
rig = bpy.data.objects['Rig']; body = bpy.data.objects['Body']
ctrl.add_controls(rig)
have = set(bpy.data.objects)
bpy.ops.import_scene.fbx(filepath=f'{W}/{CFG["fbx"]}')
BODY_FPS = bpy.context.scene.render.fps / bpy.context.scene.render.fps_base     # each file keeps its own frame rate
have2 = set(bpy.data.objects)
bpy.ops.import_scene.fbx(filepath=f'{W}/{CFG["props"]}')
PROP_FPS = bpy.context.scene.render.fps / bpy.context.scene.render.fps_base
prop_objs = [o for o in bpy.data.objects if o not in have2]
new = [o for o in bpy.data.objects if o not in have]
def nkeys(o):
    a = o.animation_data.action if o.animation_data else None
    return (a.frame_range[1] - a.frame_range[0]) if a else 0
mc = max([o for o in new if o.type == 'ARMATURE'], key=nkeys)   # the animated skeleton (some files also carry a static rig)
P = mc.data.bones[0].name.split('_')[0] + '_'
meshes = [o for o in new if o.type == 'MESH']
for o in new: o.hide_render = True
sc = bpy.context.scene
if CFG['src'] is None: CFG['src'] = BODY_FPS
sc.render.fps = FPS
act = mc.animation_data.action; SF0 = int(act.frame_range[0])
_pa = [o.animation_data.action for o in prop_objs if o.animation_data and o.animation_data.action]
PSF0 = int(min(a.frame_range[0] for a in _pa)) if _pa else SF0
PFPS = PROP_FPS if CLIP.startswith(('shot_', 'field_')) else CFG['src']    # older clips: props share the body's rate
print('body fps', CFG['src'], 'bat/ball fps', PFPS)
if CLIP.startswith('shot_') and (act.frame_range[1] - act.frame_range[0]) / CFG['src'] > 3.0:
    # some exports hold 120 fps data labelled 30 fps (Backfoot drive: 241 frames): every KUMU shot is a 2 s take
    CFG['src'] = (act.frame_range[1] - act.frame_range[0]) / 2.0; print('fps fixed to', CFG['src'])
if CFG['t1'] is None and FIELD: CFG['t1'] = round((act.frame_range[1] - act.frame_range[0]) / CFG['src'] - 0.02, 3)
if CFG['t1'] is None: CFG['t1'] = min(2.5, round((act.frame_range[1] - act.frame_range[0]) / CFG['src'], 3))   # a shot is ~2 s; some files run on
print('clip', CLIP, 'src fps', CFG['src'], 'length', CFG['t1'])

MAP = {'Hips': 'Hips', 'Spine': 'Spine', 'Spine1': 'Spine1', 'Spine2': 'Spine2', 'Neck': 'Neck', 'Head': 'Head'}
CHILD = {'Hips': 'Spine', 'Spine': 'Spine1', 'Spine1': 'Spine2', 'Spine2': 'Neck', 'Neck': 'Head', 'Head': None}
for s, S in (('L', 'Left'), ('R', 'Right')):
    MAP.update({f'Shoulder.{s}': f'{S}Shoulder', f'UpperArm.{s}': f'{S}Arm', f'ForeArm.{s}': f'{S}ForeArm', f'Hand.{s}': f'{S}Hand',
                f'Fingers.{s}': f'{S}HandMiddle1', f'Thigh.{s}': f'{S}UpLeg', f'Shin.{s}': f'{S}Leg', f'Foot.{s}': f'{S}Foot', f'Toe.{s}': f'{S}ToeBase'})
    CHILD.update({f'{S}Shoulder': f'{S}Arm', f'{S}Arm': f'{S}ForeArm', f'{S}ForeArm': f'{S}Hand', f'{S}Hand': f'{S}HandMiddle1',
                  f'{S}HandMiddle1': f'{S}HandMiddle2', f'{S}UpLeg': f'{S}Leg', f'{S}Leg': f'{S}Foot', f'{S}Foot': f'{S}ToeBase', f'{S}ToeBase': f'{S}ToeBase1'})
MW = mc.matrix_world.copy()
def mrest_head(n): return MW @ mc.data.bones[P + n].head_local
def mrest_q(n): return (MW @ mc.data.bones[P + n].matrix_local).to_quaternion()
def mrest_dir(n):
    if n == 'Head': return Vector((0, 0, 1))   # no head-end joint in the capture: the rest head stands upright
    c = CHILD.get(n)
    if c and P + c in mc.data.bones: return (mrest_head(c) - mrest_head(n)).normalized()
    return (MW.to_3x3() @ (mc.data.bones[P + n].matrix_local.to_3x3() @ Vector((0, 1, 0)))).normalized()
# rest facing of the capture -> rotation from our rest frame (faces +X) into the capture's rest frame
left = mrest_head('LeftArm') - mrest_head('RightArm'); left.z = 0
fwd = left.cross(Vector((0, 0, 1))).normalized()
Rrest = Vector((1, 0, 0)).rotation_difference(fwd) if fwd.dot(Vector((1, 0, 0))) > -0.999 else Quaternion((0, 0, 0, 1))
A = {}
for mine, theirs in MAP.items():
    b = rig.data.bones[mine]; qr = b.matrix_local.to_quaternion()
    mydir = Rrest @ (b.tail_local - b.head_local).normalized()
    A[mine] = mrest_q(theirs).inverted() @ mydir.rotation_difference(mrest_dir(theirs)) @ Rrest @ qr
# scale: hip-to-ankle height
my_h = rig.data.bones['Hips'].head_local.z; my_a = rig.data.bones['Foot.L'].head_local.z
m_h = mrest_head('Hips').z; m_a = mrest_head('LeftFoot').z
S_hip = (my_h - my_a) / (m_h - m_a)
# scale by leg bone length (independent of the file's rest pose)
my_leg = sum((rig.data.bones[f'{n}.L'].tail_local - rig.data.bones[f'{n}.L'].head_local).length for n in ('Thigh', 'Shin'))
m_leg = (mrest_head('LeftLeg') - mrest_head('LeftUpLeg')).length + (mrest_head('LeftFoot') - mrest_head('LeftLeg')).length
S = my_leg / m_leg if os.environ.get('SCALE', 'leg') == 'leg' else S_hip
DZ = my_a - S * m_a   # refined from the planted feet once the capture is sampled
my_arm = sum((rig.data.bones[f'{n}.R'].tail_local - rig.data.bones[f'{n}.R'].head_local).length for n in ('UpperArm', 'ForeArm'))
m_arm = (mrest_head('RightForeArm') - mrest_head('RightArm')).length + (mrest_head('RightHand') - mrest_head('RightForeArm')).length
ARMR = my_arm / m_arm
print(f'scale {S:.3f} dz {DZ:.3f} arm ratio {ARMR:.3f} rest fwd {tuple(round(v,2) for v in fwd)}')

# ---------------------------------------------------------------- sample the capture at native rate
def geo_center(o):
    vs = o.data.vertices; idx = range(0, len(vs), max(1, len(vs) // 400))
    return sum((o.matrix_world @ vs[i].co for i in idx), Vector()) / len(idx)
N0 = SF0 + int(round(CFG['t0'] * CFG['src'])) - 8; N1 = SF0 + int(round(CFG['t1'] * CFG['src'])) + 8
smp = {}
ballo = [o for o in meshes if o.name.startswith(('Ball', 'polySurface178'))]
bato = [o for o in meshes if o.name.startswith('polySurface177') or o.name == 'bat' or o.name.startswith('bat.')]
for fr in range(N0, N1 + 1):
    sc.frame_set(fr)
    d = {'q': {n: (MW @ mc.pose.bones[P + n].matrix).to_quaternion() for n in set(MAP.values())},
         'p': {n: MW @ mc.pose.bones[P + n].head for n in ('Hips', 'LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg', 'LeftFoot', 'RightFoot',
                                                           'LeftHand', 'RightHand', 'LeftForeArm', 'RightForeArm', 'LeftHandMiddle1', 'RightHandMiddle1', 'LeftArm', 'RightArm', 'Spine2')}}
    if os.environ.get('PALL'): d['p_all'] = {b.name[len(P):]: MW @ b.head for b in mc.pose.bones if b.name.startswith(P)}
    smp[fr] = d
for fr in range(N0, N1 + 1):   # bat and ball at the same moments, on their own frame rate
    pf = PSF0 + (fr - SF0) / CFG['src'] * PFPS; pi = int(math.floor(pf)); sc.frame_set(pi, subframe=pf - pi)
    if ballo: smp[fr]['ball'] = geo_center(ballo[0])
    if bato: smp[fr]['bat'] = bato[0].matrix_world.copy()
# ground: the lowest the ankles get in the clip sits at our ankle height
lowest = min(min(d['p']['LeftFoot'].z, d['p']['RightFoot'].z) for d in smp.values())
DZ = my_a - S * lowest
print(f'leg scale {S:.3f} (hip-height scale was {S_hip:.3f}) dz {DZ:.3f}')
def tfr(t): return SF0 + t * CFG['src']
def qavg(qs, ws):
    ref = qs[0]; acc = np.zeros(4)
    for q, w in zip(qs, ws):
        v = np.array(q[:]); v = v if np.dot(v, ref[:]) >= 0 else -v; acc += w * v
    acc /= np.linalg.norm(acc); return Quaternion(acc)
def sample(t, sig):   # gaussian-filtered capture around time t (sig in seconds; 0 = nearest)
    c = tfr(t); r = int(math.ceil(2 * sig * CFG['src'])) if sig > 0 else 0
    frs = [f for f in range(int(round(c)) - r, int(round(c)) + r + 1) if f in smp]
    ws = [math.exp(-0.5 * ((f - c) / max(1e-6, sig * CFG['src'])) ** 2) if sig > 0 else 1.0 for f in frs]
    return frs, ws
FAST = {'UpperArm.R', 'ForeArm.R', 'Hand.R', 'Fingers.R'} if BOWL else set()
def mq(mine, t):
    frs, ws = sample(t, 0.008 if mine in FAST else 0.03)
    return qavg([smp[f]['q'][MAP[mine]] for f in frs], ws)
def mp(n, t, sig=0.02):
    frs, ws = sample(t, sig); tw = sum(ws)
    return sum((smp[f]['p'][n] * w for f, w in zip(frs, ws)), Vector()) / tw

# ---------------------------------------------------------------- global placement
def yaw_to(v_from, v_to):
    a = math.atan2(v_to.y, v_to.x) - math.atan2(v_from.y, v_from.x); return Euler((0, 0, a)).to_quaternion()
if BOWL:
    run = mp('Hips', CFG['rel'] - 0.25) - mp('Hips', CFG['rel'] - 1.75); run.z = 0
    RZ = yaw_to(run, Vector((1, 0, 0)))
    O = mp('LeftFoot', CFG['rel']); O.z = 0; T = Vector((0.0, 0.0, 0.0))
elif FIELD:   # fielder faces +X at the start, feet centred on the origin
    l0 = mp('LeftUpLeg', 0) - mp('RightUpLeg', 0); l0.z = 0
    RZ = yaw_to(l0.cross(Vector((0, 0, 1))), Vector((1, 0, 0)))
    O = (mp('LeftFoot', 0) + mp('RightFoot', 0)) / 2; O.z = 0; T = Vector((0, 0, 0))
else:
    def bladed(fr):   # ball's distance from the blade's centre line (bat space, cm)
        bl = smp[fr]['bat'].inverted() @ smp[fr]['ball']
        return (Vector((bl.x, 0, bl.z)) - Vector((125.5, 0, 11.8))).length if -60 < bl.y - 106.8 < 5 else 1e9
    FC = min(smp, key=bladed); print('contact (capture frame)', FC, 't', round((FC - SF0) / CFG['src'], 3))
    bv = smp[FC]['ball'] - smp[min(smp)]['ball']; bv.z = 0
    RZ = yaw_to(bv, Vector((1, 0, 0)))
    O = (mp('LeftFoot', 0) + mp('RightFoot', 0)) / 2; O.z = 0; T = Vector((0, 0, 0))
def X(p): v = RZ @ ((p - O) * S) + T; v.z = p.z * S + DZ; return v
def Xr(p): v = RZ @ (p - O) + T; return v              # real-size (props)

# ---------------------------------------------------------------- per frame
NF = int(round((CFG['t1'] - CFG['t0']) * FPS))
times = [CFG['t0'] + k / FPS for k in range(NF + 1)]
for c in ('ForeArm.L', 'ForeArm.R'):
    rig.pose.bones[c].constraints['IK'].influence = 1.0 if BAT else 0.0
for c in ('Hand.L', 'Hand.R'):
    rig.pose.bones[c].constraints['Copy Rotation'].influence = 1.0 if BAT else 0.0
WRIST_MAX = math.radians(40)
bat_info = {}
if BAT:
    bob = bato[0]; bverts = [v.co.copy() for v in bob.data.vertices]
    # grip point in the bat's own space: mean of the two hands (captured) at the start
    Mb = smp[int(tfr(0.2))]['bat']; gm = (smp[int(tfr(0.2))]['p']['LeftHandMiddle1'] + smp[int(tfr(0.2))]['p']['RightHandMiddle1']) / 2
    bat_info['grip_local'] = Mb.inverted() @ gm

# shoe vertices per foot (rest positions + skin weights), for keeping soles on the pitch
SOLE = {}
_gn = {g.index: g.name for g in body.vertex_groups}
for s in 'LR':
    sg = 1 if s == 'L' else -1; idx = [];
    for v in body.data.vertices:
        if v.co.z < 0.16 and v.co.y * sg > 0.05: idx.append(v.index)
    bns = sorted({_gn[g.group] for i in idx for g in body.data.vertices[i].groups if g.weight > 1e-3})
    vs = np.array([body.data.vertices[i].co[:] for i in idx]); ws = np.zeros((len(idx), len(bns)))
    for r, i in enumerate(idx):
        for g in body.data.vertices[i].groups:
            if _gn[g.group] in bns: ws[r, bns.index(_gn[g.group])] = g.weight
    ws /= np.maximum(ws.sum(1, keepdims=True), 1e-6)
    SOLE[s] = (vs, ws, bns)

POLEPREV = {}
def pose_frame(k):
    t = times[k]; ctrl.reset(rig)
    hp = X(mp('Hips', t)); q = {n: RZ @ mq(n, t) @ A[n] for n in MAP}
    ctrl.set_world(rig, 'Hips', hp, q['Hips'] @ rig.data.bones['Hips'].matrix_local.to_quaternion().inverted())
    for n in ('Spine', 'Spine1', 'Spine2', 'Neck', 'Head', 'Shoulder.L', 'Shoulder.R'):
        ctrl.set_world_rot(rig, n, q[n] @ rig.data.bones[n].matrix_local.to_quaternion().inverted())
    if BOWL or FIELD:
        for s in 'LR':
            for n in ('UpperArm', 'ForeArm', 'Hand', 'Fingers'):
                nm = f'{n}.{s}'; qq = q[nm]
                if n == 'Hand':   # cap the wrist bend (no wrung wrist at release)
                    fa = rig.pose.bones[f'ForeArm.{s}'].matrix.to_quaternion()
                    rel = rig.data.bones[f'ForeArm.{s}'].matrix_local.to_quaternion().inverted() @ rig.data.bones[nm].matrix_local.to_quaternion()
                    neutral = fa @ rel; ang = neutral.rotation_difference(qq).angle
                    wm = math.radians(70) if FIELD else WRIST_MAX
                    if ang > wm: qq = neutral.slerp(qq, wm / ang)
                ctrl.set_world_rot(rig, nm, qq @ rig.data.bones[nm].matrix_local.to_quaternion().inverted())
    else:
        # bat: captured orientation, grip moved in towards the chest by the arm-length ratio
        frs, ws = sample(t, 0.004); Mb = smp[min(frs, key=lambda f: abs(f - tfr(t)))]['bat']
        Rb = Mb.to_quaternion(); gm_w = Mb @ bat_info['grip_local']
        shm = (mp('LeftArm', t) + mp('RightArm', t)) / 2
        my_shm = (rig.pose.bones['UpperArm.L'].head + rig.pose.bones['UpperArm.R'].head) / 2
        grip_target = my_shm + RZ @ (gm_w - shm) * (ARMR * 0.97)
        # simpler: express bat as rotation about its grip
        Mfin = Matrix.Translation(grip_target) @ (RZ @ Rb).to_matrix().to_4x4() @ Matrix.Diagonal(Mb.to_scale()).to_4x4() @ Matrix.Translation(-bat_info['grip_local'])
        bat_info.setdefault('M', {})[k] = Mfin
        for s, S_ in (('L', 'Left'), ('R', 'Right')):
            hw = mp(f'{S_}Hand', t, 0.004); hl = Mb.inverted() @ hw          # hand in bat space (captured)
            ctrl.set_world(rig, f'IK_Hand.{s}', Mfin @ hl, q[f'Hand.{s}'] @ rig.data.bones[f'Hand.{s}'].matrix_local.to_quaternion().inverted())
            sh = rig.pose.bones[f'UpperArm.{s}'].head; ht = Mfin @ hl
            ms, me_, mh = mp(f'{S_}Arm', t), mp(f'{S_}ForeArm', t), hw
            out = RZ @ (me_ - (ms + mh) / 2)
            ctrl.set_world(rig, f'Pole_Arm.{s}', (sh + ht) / 2 + (out.normalized() if out.length > 1e-3 else Vector((0, 0, -1))) * 0.6)
            ctrl.set_world_rot(rig, f'Fingers.{s}', q[f'Fingers.{s}'] @ rig.data.bones[f'Fingers.{s}'].matrix_local.to_quaternion().inverted())
    # legs: IK to the captured ankles, knees toward the captured knees, feet turned as captured
    for s, S_ in (('L', 'Left'), ('R', 'Right')):
        an = X(mp(f'{S_}Foot', t)); kn = X(mp(f'{S_}Leg', t)); hi = X(mp(f'{S_}UpLeg', t))
        if BOWL and LEGPLAN:   # faithful legs: captured joint angles from OUR hip, feet pinned while planted
            an, kn = LEGPLAN[s][k]
            if PUSH: an = an + PUSH[s][k] * (1.0 - PINW[s][k]); kn = kn + PUSH[s][k] * 1.15   # cartoon clearance: swing leg passes wide
        ctrl.set_world(rig, f'IK_Foot.{s}', an, q[f'Foot.{s}'] @ rig.data.bones[f'Foot.{s}'].matrix_local.to_quaternion().inverted())
        bend = kn - (hi + an) / 2
        if BOWL:
            hi = rig.pose.bones[f'Thigh.{s}'].head.copy(); bend = kn - (hi + an) / 2
            pole = kn + (bend.normalized() if bend.length > 1e-4 else q[f'Foot.{s}'] @ Vector((1, 0, 0))) * 0.6
        else:
            pole = kn + (bend.normalized() if bend.length > 1e-3 else RZ @ Vector((1, 0, 0))) * 0.6
        ctrl.set_world(rig, f'Pole_Leg.{s}', pole)
    bpy.context.view_layer.update()
    for s in 'LR':
        ctrl.set_world_rot(rig, f'Toe.{s}', q[f'Toe.{s}'] @ rig.data.bones[f'Toe.{s}'].matrix_local.to_quaternion().inverted())
    bpy.context.view_layer.update()
    # keep every sole on top of the pitch: if heel, ball or toe tip goes below the ground, lift that foot
    for s in 'LR':
        sg = 1 if s == 'L' else -1
        def sole_low():   # the real shoe: skin this foot's lowest rest vertices with the current bone matrices
            vs, ws, bns = SOLE[s]; Z = np.zeros(len(vs))
            for j, bn in enumerate(bns):
                pb = rig.pose.bones[bn]; M = np.array(pb.matrix @ rig.data.bones[bn].matrix_local.inverted())
                Z += ws[:, j] * (vs @ M[2, :3] + M[2, 3])
            return float(Z.min())
        low = sole_low()
        if low < 0:
            ik = rig.pose.bones[f'IK_Foot.{s}']; m = ik.matrix.copy(); m.translation.z -= low; ik.matrix = m
            bpy.context.view_layer.update()
            ctrl.set_world_rot(rig, f'Toe.{s}', q[f'Toe.{s}'] @ rig.data.bones[f'Toe.{s}'].matrix_local.to_quaternion().inverted())
            bpy.context.view_layer.update()

# ---------------------------------------------------------------- bowler legs: FK shape + planted-foot pinning
LEGPLAN = {}; PINW = {}; PUSH = {}
def _plan_legs():
    fk = {'L': [], 'R': []}; capz = {'L': [], 'R': []}; caph = {'L': [], 'R': []}
    for k in range(len(times)):
        t = times[k]; ctrl.reset(rig); hp = X(mp('Hips', t)); qh = RZ @ mq('Hips', t) @ A['Hips']
        ctrl.set_world(rig, 'Hips', hp, qh @ rig.data.bones['Hips'].matrix_local.to_quaternion().inverted()); bpy.context.view_layer.update()
        for s, S_ in (('L', 'Left'), ('R', 'Right')):
            th = rig.pose.bones[f'Thigh.{s}'].head.copy()
            kn = th + (RZ @ mq(f'Thigh.{s}', t) @ A[f'Thigh.{s}']) @ Vector((0, rig.data.bones[f'Thigh.{s}'].length, 0))
            an = kn + (RZ @ mq(f'Shin.{s}', t) @ A[f'Shin.{s}']) @ Vector((0, rig.data.bones[f'Shin.{s}'].length, 0))
            ca = X(mp(f'{S_}Foot', t)); fk[s].append((an, kn)); capz[s].append(ca.z); caph[s].append(ca)
    n = len(times); out = {}
    for s in 'LR':
        zmin = min(capz[s]); pl = []
        for k in range(n):
            v = (caph[s][min(n - 1, k + 1)] - caph[s][max(0, k - 1)]) / ((min(n - 1, k + 1) - max(0, k - 1)) / FPS); v.z = 0
            pl.append(v.length < 0.45 and capz[s][k] < zmin + 0.05)
        # runs of planted frames (ignore 1-2 frame blips)
        runs = []; k = 0
        while k < n:
            if pl[k]:
                j = k
                while j + 1 < n and pl[j + 1]: j += 1
                if j - k >= 2: runs.append((k, j))
                k = j + 1
            else: k += 1
        w = [0.0] * n; pin = [None] * n
        for (a, b) in runs:
            P0 = sum((fk[s][i][0] for i in range(a, b + 1)), Vector()) / (b - a + 1)
            for i in range(max(0, a - 3), min(n, b + 4)):
                wi = 1.0 if a <= i <= b else max(0.0, 1 - (a - i) / 4 if i < a else 1 - (i - b) / 4)
                if wi > w[i]: w[i] = wi; pin[i] = P0
        res = []
        for k in range(n):
            an, kn = fk[s][k]
            tgt = an.copy() if pin[k] is None else an.lerp(Vector((pin[k].x, pin[k].y, an.z)), w[k])
            d = tgt - an; d.z = 0
            res.append((tgt, kn + d * 0.5))
        out[s] = res; PINW[s] = w
        print('plants', s, runs)
    return out
if BOWL: LEGPLAN = _plan_legs()

# ---------------------------------------------------------------- cartoon leg clearance (his legs are thin, ours aren't)
GAPMIN = float(os.environ.get('GAPMIN', 0.155))
def _lowgap():
    pb = rig.pose.bones
    def pts(s):
        th, kn, an = pb[f'Thigh.{s}'].head, pb[f'Shin.{s}'].head, pb[f'Shin.{s}'].tail
        return [th.lerp(kn, 0.45 + 0.55 * i / 6) for i in range(7)] + [kn.lerp(an, i / 8) for i in range(1, 9)]
    return min((a - b).length for a in pts('L') for b in pts('R'))
def _plan_push():
    n = len(times); amt = {'L': np.zeros(n), 'R': np.zeros(n)}
    for it in range(4):
        need = np.zeros(n); side = []
        for k in range(n):
            PUSH.clear()
            if it: PUSH.update({s: [side_v[s][j] * amt[s][j] for j in range(n)] for s in 'LR'})
            pose_frame(k); bpy.context.view_layer.update(); g = _lowgap(); need[k] = max(0.0, GAPMIN - g)
            sd = rig.pose.bones['Thigh.L'].head - rig.pose.bones['Thigh.R'].head; sd.z = 0; sd.normalize(); side.append(sd)
        if it == 0: side_v = {'L': side, 'R': [-v for v in side]}
        # who moves: the leg that isn't planted (both in the air: half each)
        for s in 'LR':
            o = 'R' if s == 'L' else 'L'
            for k in range(n):
                ws, wo = PINW[s][k], PINW[o][k]; share = 0.5 if abs(ws - wo) < 1e-3 else (1.0 - ws) / max(1e-3, (1.0 - ws) + (1.0 - wo))
                amt[s][k] += need[k] * share * 0.8
        print('clearance pass', it, 'frames short', int((need > 0.005).sum()), 'worst', round(float(need.max()), 3))
    ker = np.exp(-0.5 * (np.arange(-3, 4) / 1.2) ** 2); ker /= ker.sum()
    for s in 'LR':   # ease in and out (never less than what's needed)
        a = amt[s]; amt[s] = np.maximum(a, np.convolve(np.pad(a, 3, mode='edge'), ker, mode='valid'))
    PUSH.clear(); PUSH.update({s: [side_v[s][j] * float(amt[s][j]) for j in range(n)] for s in 'LR'})
    for k in range(n): pose_frame(k); bpy.context.view_layer.update(); need[k] = max(0.0, GAPMIN - _lowgap())
    print('clearance final: frames short', int((need > 0.005).sum()), 'worst', round(float(need.max()), 3), 'max push', round(float(max(amt['L'].max(), amt['R'].max())), 3))
if BOWL and os.environ.get('NOPUSH') is None: _plan_push()
