"""Fielder sprites for the Gully field (Joe: fielding actions on the overhead field).
Renders colour + class mask from the game's high camera (EL 50, ortho) in the five facing directions the game uses
(d0 front · d1 3/4 front facing right · d2 side facing right · d3 3/4 back facing up-left · d4 back), for:
  ready (2-hand clip, first frame) · run (seam run-up stride, 8 frames) · pick (2-hand pick-up and throw) ·
  catch (short catch, fingers up) · dive (1-hand pick-up, lowest reach) · keeper (standing back / standing up).
Writes fs/<key>_{w,m}.png and fs/meta.json (anchor = ground under the hips at the action's first frame, palm point)."""
import bpy, os, math, json, numpy as np
from mathutils import Vector
W = os.path.dirname(os.path.abspath(__file__)); OUT = f'{W}/fs'; os.makedirs(OUT, exist_ok=True)
EL = 50.0; RES = (260, 260); OS = 2.6          # ortho: 2.6 m across -> 100 px per metre
DIRS = {0: 0.0, 1: -45.0, 2: -90.0, 3: 135.0, 4: 180.0}
def frames(a, b, n): return [int(round(a + (b - a) * i / (n - 1))) for i in range(n)]
JOBS = [  # (blend, action, frames, dirs, anchor per frame?)
    ('field_2hand', 'ready', [0], [0, 1, 2, 3, 4], False),
    ('seam', 'run', [19, 22, 25, 28, 30, 33, 36, 39], [0, 2, 4], True),
    ('field_2hand', 'pick', frames(56, 136, 14), [0, 1, 2, 3, 4], True),
    ('field_short_fu', 'catch', frames(8, 29, 11), [0, 1, 2, 3, 4], False),
    ('field_1hand', 'dive', None, [0, 2], False),
    ('field_keep_back', 'keepb', [0], [4], False),
    ('field_keep_up', 'keepu', [0], [4], False),
]
if os.environ.get('ONLYACT'): JOBS = [j for j in JOBS if j[1] in os.environ['ONLYACT'].split()]
meta = json.load(open(f'{OUT}/meta.json')) if os.path.exists(f'{OUT}/meta.json') else {}

def setup(blend):
    bpy.ops.wm.open_mainfile(filepath=f'{W}/{blend}.blend')
    sc = bpy.context.scene; rig = bpy.data.objects['Rig']; body = bpy.data.objects['Body']
    for o in bpy.data.objects:
        if o.type == 'MESH' and o is not body: o.hide_render = True
    me = body.data; img = [n.image for n in me.materials[0].node_tree.nodes if n.type == 'TEX_IMAGE'][0]
    iw, ih = img.size; px = np.array(img.pixels[:]).reshape(ih, iw, img.channels)[..., :3]; uv = me.uv_layers.active.data
    cls = np.zeros(len(me.polygons), int)
    for p in me.polygons:   # base body: 1 shirt · 8 shoes · 9 soles · 10 trousers · 0 skin/hair
        c = np.mean([px[min(ih - 1, int(uv[li].uv[1] * ih)), min(iw - 1, int(uv[li].uv[0] * iw))] for li in p.loop_indices], 0)
        r, g, b = c; sat = c.max() - c.min(); lum = c.mean(); z = p.center.z
        skin = r > g > b and sat > 0.12 and r > 0.3; navy = b > r + 0.03 and b >= g and lum < 0.45
        k = 0
        if skin: k = 0
        elif navy and z > 0.85: k = 1
        elif z < 0.035 and lum < 0.45: k = 9
        elif z < 0.14 and lum > 0.5: k = 8
        elif lum < 0.42 and sat < 0.06 and 0.05 < z < 1.02: k = 10
        elif z < 0.14: k = 9 if lum < 0.45 else 8
        cls[p.index] = k
    a = me.color_attributes.get('cls') or me.color_attributes.new('cls', 'BYTE_COLOR', 'CORNER')
    vals = np.zeros((len(me.loops), 4), np.float32)
    for p in me.polygons:
        v = (8 + 16 * cls[p.index]) / 255
        for li in p.loop_indices: vals[li] = (v, 0, 0, 1)
    vals[:, 0] = np.where(vals[:, 0] <= 0.04045, vals[:, 0] / 12.92, ((vals[:, 0] + 0.055) / 1.055) ** 2.4)
    a.data.foreach_set('color', vals.ravel()); me.color_attributes.active_color = a
    cam = bpy.data.objects.new('FC', bpy.data.cameras.new('FC')); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.type = 'ORTHO'; cam.data.ortho_scale = OS; cam.data.clip_start = 0.1; cam.data.clip_end = 60
    sc.render.resolution_x, sc.render.resolution_y = RES; sc.render.resolution_percentage = 100
    world = sc.world or bpy.data.worlds.new('W'); sc.world = world; world.use_nodes = True
    bg = world.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.86, 0.88, 1.0, 1); bg.inputs['Strength'].default_value = 0.9
    return sc, rig, body, cam

def suns(sc, az):
    for o in [o for o in bpy.data.objects if o.type == 'LIGHT']: bpy.data.objects.remove(o, do_unlink=True)
    for name, en, col, da, de in (('Key', 3.2, (1, .95, .86), az - 70, 48), ('Rim', 2.2, (1, .94, .8), az + 140, 30), ('Fill', 0.6, (.85, .9, 1), az + 60, 15)):
        l = bpy.data.objects.new(name, bpy.data.lights.new(name, 'SUN')); sc.collection.objects.link(l); l.data.energy = en; l.data.color = col; l.data.angle = math.radians(8)
        a, e = math.radians(da), math.radians(de); d = Vector((math.cos(a) * math.cos(e), math.sin(a) * math.cos(e), math.sin(e)))
        l.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()

def png(sc):
    ims = sc.render.image_settings
    if hasattr(ims, 'media_type'): ims.media_type = 'IMAGE'
    ims.file_format = 'PNG'; ims.color_mode = 'RGBA'; ims.color_depth = '8'
    sc.render.film_transparent = True; sc.render.use_compositing = False; sc.render.use_sequencer = False
    sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'

from bpy_extras.object_utils import world_to_camera_view
for blend, act, frs, dirs, per_frame in JOBS:
    sc, rig, body, cam = setup(blend)
    if frs is None:   # dive: the frame where a hand is lowest
        lows = []
        for f in range(sc.frame_start, sc.frame_end + 1):
            sc.frame_set(f); lows.append((min((rig.matrix_world @ rig.pose.bones[f'Hand.{s}'].head).z for s in 'LR'), f))
        frs = [min(lows)[1]]
    sc.frame_set(frs[0]); hip0 = rig.matrix_world @ rig.pose.bones['Hips'].head; A0 = Vector((hip0.x, hip0.y, 0.0))
    for d in dirs:
        az = DIRS[d]; suns(sc, az)
        for i, f in enumerate(frs):
            sc.frame_set(f)
            hip = rig.matrix_world @ rig.pose.bones['Hips'].head; anc = Vector((hip.x, hip.y, 0.0)) if per_frame else A0
            a, e = math.radians(az), math.radians(EL); tgt = anc + Vector((0, 0, 0.75))
            cam.location = tgt + Vector((math.cos(a) * math.cos(e), math.sin(a) * math.cos(e), math.sin(e))) * 20
            cam.rotation_euler = (tgt - cam.location).to_track_quat('-Z', 'Y').to_euler(); bpy.context.view_layer.update()
            key = f'{act}_d{d}_{i}'
            png(sc); sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(os.environ.get('SPP', 10)); sc.cycles.use_denoising = True
            sc.render.filter_size = 1.5; sc.render.filepath = f'{OUT}/{key}_w.png'; bpy.ops.render.render(write_still=True)
            sc.render.engine = 'BLENDER_WORKBENCH'; ds = sc.display.shading; ds.light = 'FLAT'; ds.color_type = 'VERTEX'
            sc.display.render_aa = 'OFF'; sc.render.filter_size = 0.0; sc.render.filepath = f'{OUT}/{key}_m.png'; bpy.ops.render.render(write_still=True)
            def P(p): v = world_to_camera_view(sc, cam, Vector(p)); return [v.x * RES[0], (1 - v.y) * RES[1]]
            palm = (rig.matrix_world @ rig.pose.bones['Hand.L'].head + rig.matrix_world @ rig.pose.bones['Hand.R'].head) / 2
            meta[key] = {'anchor': P(anc), 'palm': P(palm)}
            print('rendered', key, flush=True)
    json.dump(meta, open(f'{OUT}/meta.json', 'w'))
print('FIELD SPRITES DONE', len(meta))
