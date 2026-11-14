"""Class-mask ids for the customisable 3D player (tools/char3d/game): the bald master body + swappable pieces.
Guide red = 8 + 16*id.  1 shirt 2 helmet/cap 3 helmet accent 4 gloves 5 glove cuff 6 pads 7 straps 8 shoes 9 soles
10 trousers 11 bat blade 12 grip 13 sticker 14 skin 15 hair · 0 keep (eyes, brows, buttons, mouth).
The body is classed from its classmap texture (tools/char3d/game/texcls.py), so skin and hair are exact; each piece
is classed by its object name (Hair, Pads, Gloves, Helmet) and its own texture colour."""
import numpy as np

# texcls classes: 0 unk 1 skin 2 hair 3 brows 4 eye_white 5 eye_dark 6 shirt 7 buttons 8 trousers 9 shoes 10 soles
TEX2GAME = {0: 0, 1: 14, 2: 15, 3: 0, 4: 0, 5: 0, 6: 1, 7: 0, 8: 10, 9: 8, 10: 9}


def write_cls(obj, per_face):
    m = obj.data
    a = m.color_attributes.get('cls') or m.color_attributes.new('cls', 'BYTE_COLOR', 'CORNER')
    vals = np.zeros((len(m.loops), 4), np.float32); vals[:, 3] = 1
    li = np.zeros(len(m.loops), int)
    for p in m.polygons: li[list(p.loop_indices)] = p.index
    v = (8 + 16 * np.asarray(per_face)[li]) / 255
    vals[:, 0] = np.where(v <= 0.04045, v / 12.92, ((v + 0.055) / 1.055) ** 2.4)   # API is linear; stored byte = v
    a.data.foreach_set('color', vals.ravel()); m.color_attributes.active_color = a


def _images(obj):
    out = {}
    for mat in obj.data.materials:
        if not mat or not mat.node_tree: continue
        for n in mat.node_tree.nodes:
            if n.type == 'TEX_IMAGE' and n.image:
                out['cls' if 'classmap' in n.image.name else 'col'] = out.get('cls' if 'classmap' in n.image.name else 'col') or n.image
    return out


def _px(img):
    w, h = img.size; return np.array(img.pixels[:], np.float32).reshape(h, w, img.channels)[..., :3]


def _face_samples(obj, px):
    """mean texel colour per face (corner UVs + centre)"""
    m = obj.data; h, w = px.shape[:2]; uv = np.zeros(len(m.loops) * 2); m.uv_layers.active.data.foreach_get('uv', uv); uv = uv.reshape(-1, 2)
    out = np.zeros((len(m.polygons), 3))
    for p in m.polygons:
        u = uv[list(p.loop_indices)]; u = np.vstack([u, u.mean(0)])
        out[p.index] = px[np.clip((u[:, 1] * h).astype(int), 0, h - 1), np.clip((u[:, 0] * w).astype(int), 0, w - 1)].mean(0)
    return out


def classify_body(body):
    im = _images(body)
    if 'cls' not in im: return None
    cm = _px(im['cls'])[..., 0]; h, w = cm.shape
    m = body.data; uv = np.zeros(len(m.loops) * 2); m.uv_layers.active.data.foreach_get('uv', uv); uv = uv.reshape(-1, 2)
    out = np.zeros(len(m.polygons), int)
    for p in m.polygons:
        u = uv[list(p.loop_indices)]; u = np.vstack([u, u.mean(0)])
        c = np.rint(cm[np.clip((u[:, 1] * h).astype(int), 0, h - 1), np.clip((u[:, 0] * w).astype(int), 0, w - 1)] * 255).astype(int)
        out[p.index] = TEX2GAME.get(int(np.bincount(c, minlength=11).argmax()), 0)
    return out


MAT_CLS = {'helmet_shell': 2, 'helmet_guard': 2, 'helmet_stripe': 3, 'helmet_grille': 3}


def classify_piece(obj):
    nm = obj.name.split('.')[0]
    mn = [(m.name.split('.')[0] if m else '') for m in obj.data.materials]
    if mn and all(n in MAT_CLS for n in mn):   # pieces built in 3D with named flat materials
        return np.array([MAT_CLS[mn[p.material_index]] for p in obj.data.polygons])
    if nm == 'Hair': return np.full(len(obj.data.polygons), 15)
    im = _images(obj)
    if 'col' not in im: return None
    c = _face_samples(obj, _px(im['col'])); r, g, b = c.T; lum = c.mean(1); sat = c.max(1) - c.min(1)
    if nm == 'Pads': return np.where(lum > 0.62, 6, 7)
    if nm == 'Gloves': return np.where(lum > 0.5, 4, 5)
    if nm == 'Helmet':
        navy = (b > r + 0.03) & (b >= g) & (lum < 0.45)
        return np.where((r > b + 0.1) & (sat > 0.15), 3, np.where(navy, 2, np.where((lum > 0.3) & (sat < 0.1), 3, 2)))
    return None


def classify_all(rig, body):
    """write cls on the body and every visible piece riding the rig; returns the pieces kept for rendering"""
    kc = classify_body(body)
    if kc is not None: write_cls(body, kc)
    kept = []
    for o in rig.children:
        if o.type != 'MESH' or o is body or o.hide_render: continue
        pc = classify_piece(o)
        if pc is not None: write_cls(o, pc); kept.append(o)
        elif o.data.color_attributes.get('cls'): kept.append(o)
    return kc is not None, kept
