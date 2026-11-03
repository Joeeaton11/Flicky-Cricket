"""Render game sprite passes from a baked clip (CLIP=seam|drive|cover): colour (Cycles), class mask (flat), view normal + depth.
Same cameras/conventions as tools/mocap frames.py (batter) and bowlframes.py (bowler)."""
import bpy, os, sys, math, json, numpy as np
from mathutils import Vector, Matrix, Euler
W = os.path.dirname(os.path.abspath(__file__)); CLIP = os.environ['CLIP']; OUT = f'{W}/sp_{CLIP}'; os.makedirs(OUT, exist_ok=True)
FPS = 30
bpy.ops.wm.open_mainfile(filepath=f'{W}/{CLIP}.blend')
sc = bpy.context.scene; rig = bpy.data.objects['Rig']; body = bpy.data.objects['Body']
ball = bpy.data.objects.get('Ball'); bat = bpy.data.objects.get('Bat')
for o in bpy.data.objects:
    if o.type == 'MESH' and o not in (body, ball, bat): o.hide_render = True
BOWL = CLIP in ('seam', 'offspin', 'legspin')
T0 = {'seam': 0.55, 'offspin': 0.8, 'legspin': 1.15}.get(CLIP, 0.0)
TREL = {'seam': 3.25, 'offspin': 3.475, 'legspin': 3.84}.get(CLIP, 0.0)
def frame_of(t): return (t - T0) * FPS

# ---------------- sequences (times in the capture's own seconds)
if BOWL:   # the game's bowler set: 24 run frames over the last second, release, 21 follow-through frames at 50 ms, stand
    RUN = [round(TREL - 1.0 + i * (1.0 / 24), 4) for i in range(24)]; FOL = [round(TREL + 0.05 * (i + 1), 4) for i in range(21)]
    SEQ = [('run%d' % i, t) for i, t in enumerate(RUN)] + [('rel', TREL)] + [('fol%d' % i, t) for i, t in enumerate(FOL)] + [('stand', T0)]
else:
    TC = float(os.environ.get('TC') or {'drive': 1.50, 'cover': 1.367}[CLIP])          # contact
    SEQ = ([('stance', 0.0)] + [(f'lift{i}', round(TC - 0.42 + d, 3)) for i, d in enumerate([0, 0.08, 0.15, 0.22])] if CLIP == 'drive' else []) + \
          [(f'hit{i}', round(TC - 0.03 + i * 0.03, 3)) for i in range(17)]

# ---------------- colour classes (guide red = 8 + 16*id): 1 shirt 2 helmet 3 helmet accent 4 gloves 5 glove cuff 6 pads 7 straps
#                  8 shoes 9 soles 10 trousers 11 bat blade 12 grip 13 sticker; 0 = keep (skin, hair, face)
me = body.data
img = [n.image for n in me.materials[0].node_tree.nodes if n.type == 'TEX_IMAGE'][0]
iw, ih = img.size; px = np.array(img.pixels[:]).reshape(ih, iw, img.channels)[..., :3]
uv = me.uv_layers.active.data
def srgb(c): return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(np.clip(c, 0, 1), 1 / 2.4) - 0.055)
cls = np.zeros(len(me.polygons), int)
batter = not BOWL
for p in me.polygons:
    cs = [px[min(ih - 1, int(uv[li].uv[1] * ih)), min(iw - 1, int(uv[li].uv[0] * iw))] for li in p.loop_indices]
    c = np.mean(cs, 0); r, g, b = c; mx, mn = c.max(), c.min(); lum = c.mean(); sat = mx - mn
    z = p.center.z; ay = abs(p.center.y)
    skin = r > g > b and sat > 0.12 and r > 0.3
    navy = b > r + 0.03 and b >= g and lum < 0.45
    k = 0
    if skin: k = 0
    elif batter and z > 1.40:                      # helmet
        if r > b + 0.1 and sat > 0.15: k = 3      # gold stripe
        elif navy: k = 2
        elif lum > 0.3 and sat < 0.1: k = 3       # grille / ear guards
        else: k = 0
    elif batter and ay > 0.33 and 0.62 < z < 1.06:  # gloves
        k = 4 if lum > 0.5 else 5
    elif navy and z > 0.85: k = 1
    elif z < 0.035 and lum < 0.45: k = 9
    elif z < 0.14 and lum > 0.5: k = 8
    elif batter and 0.12 < z < 0.76 and ay < 0.36 and lum > 0.42: k = 6 if lum > 0.62 else 7
    elif lum < 0.42 and sat < 0.06 and 0.05 < z < 1.02: k = 10
    elif z < 0.14: k = 9 if lum < 0.45 else 8
    cls[p.index] = k
print('class counts', {i: int((cls == i).sum()) for i in range(14) if (cls == i).sum()})
def set_cls(obj, per_face):
    m = obj.data
    a = m.color_attributes.get('cls') or m.color_attributes.new('cls', 'BYTE_COLOR', 'CORNER')
    vals = np.zeros((len(m.loops), 4), np.float32)
    for p in m.polygons:
        v = (8 + 16 * per_face[p.index]) / 255
        for li in p.loop_indices: vals[li] = (v, 0, 0, 1)
    # BYTE_COLOR stores sRGB bytes but the API speaks linear: hand it linear so the stored byte is exactly v
    lin = np.where(vals[:, 0] <= 0.04045, vals[:, 0] / 12.92, ((vals[:, 0] + 0.055) / 1.055) ** 2.4)
    vals[:, 0] = lin
    a.data.foreach_set('color', vals.ravel()); m.color_attributes.active_color = a
set_cls(body, cls)
if bat:
    bc = [11 if bat.data.materials[p.material_index].name.startswith('Willow') else 12 for p in bat.data.polygons]; set_cls(bat, bc)
if ball: set_cls(ball, [0] * len(ball.data.polygons))
if ball and BOWL:   # Gully tape ball in his hand
    for m in ball.data.materials:
        if m.name.startswith('Leather'): m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.62, 0.78, 0.12, 1)

# ---------------- camera + lights
cam = bpy.data.objects.new('SpriteCam', bpy.data.cameras.new('SpriteCam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.sensor_fit = 'VERTICAL'; cam.data.clip_start = 1; cam.data.clip_end = 40
if batter:
    AZ, EL, R, FOV = 30, 22, 9.5, 13.5; RES = (600, 800); MIRROR = True
else:
    AZ, EL, R, FOV = 0, 40, 9.5, 18; RES = (600, 800); MIRROR = False
cam.data.angle_y = math.radians(FOV)
sc.render.resolution_x, sc.render.resolution_y = RES; sc.render.resolution_percentage = 100
def place_cam(tx, ty, tz):
    a, e = math.radians(AZ), math.radians(EL)
    t = Vector((tx, ty, tz)); cam.location = t + Vector((math.cos(a) * math.cos(e), math.sin(a) * math.cos(e), math.sin(e))) * R
    cam.rotation_euler = (t - cam.location).to_track_quat('-Z', 'Y').to_euler()
world = sc.world or bpy.data.worlds.new('W'); sc.world = world; world.use_nodes = True
bg = world.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.86, 0.88, 1.0, 1); bg.inputs['Strength'].default_value = 0.9
def sun(name, energy, color, dir_az, dir_el):
    l = bpy.data.objects.new(name, bpy.data.lights.new(name, 'SUN')); sc.collection.objects.link(l)
    l.data.energy = energy; l.data.color = color; l.data.angle = math.radians(8)
    a, e = math.radians(dir_az), math.radians(dir_el); d = Vector((math.cos(a) * math.cos(e), math.sin(a) * math.cos(e), math.sin(e)))
    l.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler(); return l
# key from the camera's left (screen left, like the painted art) and above; warm rim from behind; soft fill
side = -1 if not MIRROR else 1      # the batter image is mirrored afterwards, so his key is placed on the other side
sun('Key', 3.2, (1.0, 0.95, 0.86), AZ + 70 * side, 48)
sun('Rim', 2.2, (1.0, 0.94, 0.8), AZ + 180 - 40 * side, 30)
sun('Fill', 0.6, (0.85, 0.9, 1.0), AZ - 60 * side, 15)

def project(p):
    from bpy_extras.object_utils import world_to_camera_view
    v = world_to_camera_view(sc, cam, Vector(p)); x = v.x * RES[0]; y = (1 - v.y) * RES[1]
    return [RES[0] - 1 - x if MIRROR else x, y]

# ---------------- render passes
from PIL import Image, ImageOps
def png_settings(raw=False):
    ims = sc.render.image_settings
    if hasattr(ims, 'media_type'): ims.media_type = 'IMAGE'
    ims.file_format = 'PNG'; ims.color_mode = 'RGBA'; ims.color_depth = '8'
    sc.render.film_transparent = True; sc.render.use_compositing = False; sc.render.use_sequencer = False
    sc.view_settings.view_transform = 'Raw' if raw else 'Standard'; sc.view_settings.look = 'None'
def setup_color():
    vl.material_override = None
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = int(os.environ.get('SPP', 32)); sc.cycles.use_denoising = True
    sc.render.filter_size = 1.5; png_settings()
def setup_mask():
    vl.material_override = None
    sc.render.engine = 'BLENDER_WORKBENCH'; d = sc.display.shading; d.light = 'FLAT'; d.color_type = 'VERTEX'
    sc.display.render_aa = 'OFF'; sc.render.filter_size = 0.0; png_settings()
vl = sc.view_layers[0]
def override(kind):
    m = bpy.data.materials.new('ovr_' + kind); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links
    for n in list(N): N.remove(n)
    out = N.new('ShaderNodeOutputMaterial'); em = N.new('ShaderNodeEmission'); L.new(em.outputs[0], out.inputs[0])
    if kind == 'normal':   # view-space normal packed like three's MeshNormalMaterial
        g = N.new('ShaderNodeNewGeometry'); vt = N.new('ShaderNodeVectorTransform'); vt.vector_type = 'NORMAL'; vt.convert_from = 'WORLD'; vt.convert_to = 'CAMERA'
        mul = N.new('ShaderNodeVectorMath'); mul.operation = 'MULTIPLY_ADD'; mul.inputs[1].default_value = (0.5, 0.5, -0.5); mul.inputs[2].default_value = (0.5, 0.5, 0.5)
        L.new(g.outputs['Normal'], vt.inputs[0]); L.new(vt.outputs[0], mul.inputs[0]); L.new(mul.outputs[0], em.inputs['Color'])
    else:                  # depth: near = white, over R +- 2.6 m
        cd = N.new('ShaderNodeCameraData'); mr = N.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = R - 2.6; mr.inputs['From Max'].default_value = R + 2.6
        mr.inputs['To Min'].default_value = 1; mr.inputs['To Max'].default_value = 0; mr.clamp = True
        L.new(cd.outputs['View Z Depth'], mr.inputs['Value']); L.new(mr.outputs[0], em.inputs['Color'])
    return m
OVR = {k: override(k) for k in ('normal', 'depth')}
def setup_pass(kind):
    vl.material_override = OVR[kind]
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 4; sc.cycles.use_denoising = False; sc.render.filter_size = 0.01; png_settings(raw=True)
def mirror_file(p):
    if MIRROR: ImageOps.mirror(Image.open(p)).save(p)
if os.environ.get('ONLY'): SEQ = [q for q in SEQ if q[0] in os.environ['ONLY'].split()]
meta = {}; hands = {}
if batter:   # camera target and the back-foot anchor come from the stance (t = 0), rendered or not
    sc.frame_set(int(frame_of(0.0))); hip0 = rig.matrix_world @ rig.pose.bones['Hips'].head; BT = (hip0.x, hip0.y); place_cam(BT[0], BT[1], 0.85)
    bpy.context.view_layer.update(); an0 = {s_: rig.matrix_world @ rig.pose.bones[f'Foot.{s_}'].head for s_ in 'LR'}
    STANCE_FEET = {s_: project((an0[s_].x, an0[s_].y, 0)) for s_ in 'LR'}
camrot = None
for name, t in SEQ:
    f = frame_of(t); fi = int(math.floor(f)); sc.frame_set(fi, subframe=f - fi)
    if ball: ball.hide_render = not (BOWL and t <= TREL + 1e-6)
    hip = rig.matrix_world @ rig.pose.bones['Hips'].head
    if batter:
        place_cam(BT[0], BT[1], 0.85)
    else:
        place_cam(hip.x, hip.y, 0.85)
    bpy.context.view_layer.update()
    # colour, normal, depth, class mask
    for kind, pre in (('color', 'w'), ('normal', 'n'), ('depth', 'd'), ('mask', 'm')):
        {'color': setup_color, 'mask': setup_mask}.get(kind, lambda: setup_pass(kind))()
        sc.render.filepath = f'{OUT}/{pre}_{name}.png'; bpy.ops.render.render(write_still=True); mirror_file(f'{OUT}/{pre}_{name}.png')
    # anchors
    hd = rig.matrix_world @ rig.pose.bones['Head'].head; hr = rig.matrix_world @ rig.pose.bones['Hand.R'].head
    if batter:
        an = {s: rig.matrix_world @ rig.pose.bones[f'Foot.{s}'].head for s in 'LR'}
        meta[name] = {'feet': {s: project((an[s].x, an[s].y, 0)) for s in 'LR'}, 'head': project(hd)}
    else:
        meta[name] = [project((hip.x, hip.y, 0)), project(hr), project(hd), project((hip.x, hip.y, 1.75)), project((0.0, 0.0, 0.0))]
    print('rendered', name, flush=True)
json.dump({'seq': SEQ, 'meta': meta, 'res': RES, 'mirror': MIRROR, 'stance_feet': STANCE_FEET if batter else None}, open(f'{OUT}/meta.json', 'w'))
