"""Shared helpers: load the rig, add IK controls, pose in world terms, render checks."""
import bpy, os, math
from mathutils import Vector, Matrix, Euler, Quaternion
W = os.path.dirname(os.path.abspath(__file__))

def load():
    bpy.ops.wm.open_mainfile(filepath=f'{W}/rig.blend')
    rig = bpy.data.objects['Rig']; body = bpy.data.objects['Body']
    add_controls(rig)
    return rig, body

def add_controls(rig):
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode='EDIT'); eb = rig.data.edit_bones
    def ctl(name, head, length=0.08):
        b = eb.new(name); b.head = head; b.tail = Vector(head) + Vector((0, 0, length)); b.roll = 0
        b.parent = eb['Root']; b.use_deform = False; return b
    for s, sg in (('L', 1), ('R', -1)):
        for src in ('Hand', 'Foot'):   # IK controls copy the driven bone's rest frame, so copied rotation is exact at rest
            b = eb.new(f'IK_{src}.{s}'); b.head, b.tail, b.roll = eb[f'{src}.{s}'].head.copy(), eb[f'{src}.{s}'].tail.copy(), eb[f'{src}.{s}'].roll
            b.parent = eb['Root']; b.use_deform = False
        ctl(f'Pole_Arm.{s}', eb[f'ForeArm.{s}'].head + Vector((-0.5, 0.0, 0)))
        ctl(f'Pole_Leg.{s}', eb[f'Shin.{s}'].head + Vector((0.5, 0, 0)))
    bpy.ops.object.mode_set(mode='POSE'); pb = rig.pose.bones
    for s in 'LR':
        for chainb, tgt, pole, end in ((f'ForeArm.{s}', f'IK_Hand.{s}', f'Pole_Arm.{s}', f'Hand.{s}'),
                                       (f'Shin.{s}', f'IK_Foot.{s}', f'Pole_Leg.{s}', f'Foot.{s}')):
            c = pb[chainb].constraints.new('IK'); c.target = rig; c.subtarget = tgt
            c.pole_target = rig; c.pole_subtarget = pole; c.chain_count = 2; c.pole_angle = 0
            r = pb[end].constraints.new('COPY_ROTATION'); r.target = rig; r.subtarget = tgt
            r.target_space = r.owner_space = 'POSE'
    bpy.ops.object.mode_set(mode='OBJECT')
    fix_poles(rig)

def _snap(rig):
    bpy.context.view_layer.update()
    return {b.name: b.matrix.copy() for b in rig.pose.bones}

def fix_poles(rig):
    """Pick each IK pole angle that leaves the rest pose untouched."""
    for s in 'LR':
        for chainb, up in ((f'ForeArm.{s}', f'UpperArm.{s}'), (f'Shin.{s}', f'Thigh.{s}')):
            c = rig.pose.bones[chainb].constraints['IK']; rest = rig.data.bones[up].matrix_local
            best = None
            for a in range(-180, 181, 1):
                c.pole_angle = math.radians(a); bpy.context.view_layer.update()
                m = rig.pose.bones[up].matrix; d = sum((m.col[i].to_3d() - rest.col[i].to_3d()).length for i in range(3))
                if best is None or d < best[0]: best = (d, a)
            c.pole_angle = math.radians(best[1]); print('pole', chainb, best[1], round(best[0], 4))
    bpy.context.view_layer.update()

# ---------- posing in world terms ----------
def rest_rot(rig, n): return rig.data.bones[n].matrix_local.to_quaternion()

def set_world_rot(rig, n, q):
    """Bone n gets absolute world orientation q @ rest (q = rotation applied to the rest pose)."""
    pb = rig.pose.bones[n]; bpy.context.view_layer.update()
    head = pb.head.copy() if pb.parent and rig.data.bones[n].use_connect else None
    m = (q @ rest_rot(rig, n)).to_matrix().to_4x4()
    m.translation = head if head is not None else pb.matrix.translation
    pb.matrix = m; bpy.context.view_layer.update()

def set_world(rig, n, loc=None, q=None):
    pb = rig.pose.bones[n]; bpy.context.view_layer.update()
    m = ((q or Quaternion()) @ rest_rot(rig, n)).to_matrix().to_4x4()
    m.translation = Vector(loc) if loc is not None else pb.matrix.translation
    pb.matrix = m; bpy.context.view_layer.update()

def E(x=0, y=0, z=0, order='ZYX'):
    """Rotation in degrees: about world X (forward), Y (his left), Z (up)."""
    return Euler((math.radians(x), math.radians(y), math.radians(z)), order).to_quaternion()

def key(rig, frame, names=None):
    for pb in rig.pose.bones:
        if names and pb.name not in names: continue
        pb.keyframe_insert('location', frame=frame); pb.rotation_mode = 'QUATERNION'
        pb.keyframe_insert('rotation_quaternion', frame=frame)

def reset(rig):
    for pb in rig.pose.bones:
        pb.location = (0, 0, 0); pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
    bpy.context.view_layer.update()

# ---------- rendering ----------
def setup_render(res=(640, 800)):
    sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'
    sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'TEXTURE'
    sc.display.shading.show_cavity = False
    sc.render.resolution_x, sc.render.resolution_y = res; sc.render.film_transparent = True
    for o in bpy.data.objects:
        if o.type == 'ARMATURE': o.hide_render = True

def shoot(path, az, el=8, target=(0, 0, 0.95), dist=5, ortho=2.3):
    sc = bpy.context.scene
    cam = bpy.data.objects.get('Cam')
    if not cam:
        cam = bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam')); sc.collection.objects.link(cam)
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = ortho
    a, e = math.radians(az), math.radians(el)
    t = Vector(target); cam.location = t + Vector((math.cos(a) * math.cos(e), math.sin(a) * math.cos(e), math.sin(e))) * dist
    cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = cam; sc.render.filepath = path; bpy.ops.render.render(write_still=True)
