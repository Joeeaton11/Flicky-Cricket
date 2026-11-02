import bpy, os, sys
from mathutils import Vector
W = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)
MODEL = os.environ.get('MODEL', 'base')
bpy.ops.import_scene.gltf(filepath=f'{W}/{MODEL}.glb')
body = [o for o in bpy.data.objects if o.type == 'MESH'][0]
body.name = 'Body'
# 1.8 m tall, feet on the ground, transforms applied
zmin = min((body.matrix_world @ v.co).z for v in body.data.vertices)
body.scale = (1.8, 1.8, 1.8); body.location = (0, 0, -zmin * 1.8)
bpy.context.view_layer.objects.active = body; body.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bpy.ops.object.select_all(action='DESELECT')

# Joint positions (m). Body faces +X, his left = +Y, up = +Z. Traced from limb centre-lines.
C = {  # centre chain
 'Hips': ((-0.02, 0, 0.90), (-0.02, 0, 1.00)),
 'Spine': ((-0.02, 0, 1.00), (-0.03, 0, 1.13)),
 'Spine1': ((-0.03, 0, 1.13), (-0.04, 0, 1.26)),
 'Spine2': ((-0.04, 0, 1.26), (-0.04, 0, 1.37)),
 'Neck': ((-0.04, 0, 1.37), (-0.02, 0, 1.46)),
 'Head': ((-0.02, 0, 1.46), (-0.02, 0, 1.78)),
}
S = {  # left side (+Y); right side mirrored
 'Shoulder': ((-0.04, 0.045, 1.33), (-0.06, 0.215, 1.285), 'Spine2'),
 'UpperArm': ((-0.06, 0.215, 1.285), (-0.072, 0.35, 1.075), 'Shoulder'),
 'ForeArm': ((-0.072, 0.35, 1.075), (-0.05, 0.468, 0.87), 'UpperArm'),
 'Hand': ((-0.05, 0.468, 0.87), (-0.025, 0.53, 0.765), 'ForeArm'),
 'Fingers': ((-0.025, 0.53, 0.765), (-0.02, 0.565, 0.67), 'Hand'),
 'Thigh': ((-0.02, 0.10, 0.88), (-0.035, 0.165, 0.46), 'Hips'),
 'Shin': ((-0.035, 0.165, 0.46), (-0.07, 0.225, 0.12), 'Thigh'),
 'Foot': ((-0.07, 0.225, 0.12), (0.07, 0.25, 0.035), 'Shin'),
 'Toe': ((0.07, 0.25, 0.035), (0.16, 0.255, 0.03), 'Foot'),
}
arm = bpy.data.armatures.new('Rig'); rig = bpy.data.objects.new('Rig', arm)
bpy.context.scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig; rig.select_set(True)
bpy.ops.object.mode_set(mode='EDIT')
eb = arm.edit_bones
root = eb.new('Root'); root.head = (0, 0, 0); root.tail = (0, 0, 0.25)
for n, (h, t) in C.items():
    b = eb.new(n); b.head, b.tail = h, t; b.roll = 0
    b.parent = eb['Root'] if n == 'Hips' else eb[list(C)[list(C).index(n) - 1]]
    b.use_connect = n not in ('Hips',)
for side, sg in (('L', 1), ('R', -1)):
    for n, (h, t, p) in S.items():
        b = eb.new(f'{n}.{side}')
        b.head = (h[0], h[1] * sg, h[2]); b.tail = (t[0], t[1] * sg, t[2])
        b.parent = eb[p if p in C else f'{p}.{side}']
        b.use_connect = n not in ('Shoulder', 'Thigh')
    # rolls: arm bones bend forward at the elbow -> z axis points back; legs: z axis points forward (knee bends back... set via align)
    for n in ('UpperArm', 'ForeArm', 'Hand', 'Fingers'):
        eb[f'{n}.{side}'].align_roll(Vector((0, 0, 1)))
    for n in ('Thigh', 'Shin'):
        eb[f'{n}.{side}'].align_roll(Vector((1, 0, 0)))
    for n in ('Foot', 'Toe'):
        eb[f'{n}.{side}'].align_roll(Vector((0, 0, 1)))
    eb[f'Shoulder.{side}'].align_roll(Vector((0, 0, 1)))
for n in C: eb[n].align_roll(Vector((1, 0, 0)))
bpy.ops.object.mode_set(mode='OBJECT')
for b in arm.bones: b.use_deform = b.name != 'Root'

# automatic (heat) weights on a WELDED copy (the AI mesh is split along its texture seams;
# weighting the split mesh gives each side of a seam different weights and the seams tear open)
import bmesh
weld = body.copy(); weld.data = body.data.copy(); weld.name = 'Weld'; bpy.context.scene.collection.objects.link(weld)
bm = bmesh.new(); bm.from_mesh(weld.data); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=2e-5); bm.to_mesh(weld.data); bm.free()
print('welded verts', len(weld.data.vertices))
bpy.ops.object.select_all(action='DESELECT')
weld.select_set(True); rig.select_set(True); bpy.context.view_layer.objects.active = rig
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
# soften the weights a little (less pinching at shoulders, elbows, hips), keep 4 influences, normalise
bpy.ops.object.select_all(action='DESELECT'); weld.select_set(True); bpy.context.view_layer.objects.active = weld
bpy.ops.object.mode_set(mode='WEIGHT_PAINT')
bpy.ops.object.vertex_group_smooth(group_select_mode='ALL', factor=0.5, repeat=int(os.environ.get('SMOOTH', 3)), expand=0.0)
bpy.ops.object.vertex_group_limit_total(group_select_mode='ALL', limit=4)
bpy.ops.object.vertex_group_normalize_all(group_select_mode='ALL', lock_active=False)
bpy.ops.object.mode_set(mode='OBJECT')
# copy to the original mesh by position: both copies of a seam vertex get identical weights
import numpy as np
from mathutils import kdtree
kd = kdtree.KDTree(len(weld.data.vertices))
for v in weld.data.vertices: kd.insert(v.co, v.index)
kd.balance()
names = [g.name for g in weld.vertex_groups]
for n in names: body.vertex_groups.new(name=n)
wv = weld.data.vertices
for v in body.data.vertices:
    co, i, d = kd.find(v.co)
    for g in wv[i].groups:
        if g.weight > 1e-4: body.vertex_groups[names[g.group]].add([v.index], g.weight, 'REPLACE')
bpy.data.objects.remove(weld)
body.parent = rig
mod = body.modifiers.new('Armature', 'ARMATURE'); mod.object = rig
vg = {g.index: g.name for g in body.vertex_groups}
nz = sum(1 for v in body.data.vertices if not any(g.weight > 1e-3 for g in v.groups))
print('vertex groups', len(vg), 'unweighted verts', nz, 'of', len(body.data.vertices))
bpy.ops.wm.save_as_mainfile(filepath=f'{W}/rig_{MODEL}.blend')
