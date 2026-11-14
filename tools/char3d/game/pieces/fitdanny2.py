"""Batter helmet: Danny's KUMU helmet, shape untouched, scaled evenly, seated like a real helmet, grille dropped on its clamps. Was the fit test: Danny's helmet, shape untouched, on our bald player's head. S from env."""
import bpy, bmesh, numpy as np, math, os
from mathutils import Vector, Matrix
D = os.path.dirname(os.path.abspath(__file__)); S = float(os.environ.get('S', '1.45')); DZ = float(os.environ.get('DZ', '-0.055')); DX = float(os.environ.get('DX', '-0.005'))
bpy.ops.wm.append(filepath=D + '/dhelmet_raw.blend/Object/DHelmet', directory=D + '/dhelmet_raw.blend/Object/', filename='DHelmet') if False else None
bpy.ops.wm.read_homefile(use_empty=True)
with bpy.data.libraries.load(D + '/dhelmet_raw.blend') as (a, b): b.objects = ['DHelmet']
ob = b.objects[0]; bpy.context.scene.collection.objects.link(ob); ob.parent = None; ob.matrix_world = Matrix.Identity(4)
for m in list(ob.modifiers): ob.modifiers.remove(m)
me = ob.data.copy(); ob.data = me
me.transform(Matrix(((0,0,1,0),(1,0,0,0),(0,1,0,0),(0,0,0,1))))
bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table(); seen=set(); comps=[]
for f in bm.faces:
    if f.index in seen: continue
    st=[f]; seen.add(f.index); c=[]
    while st:
        x=st.pop(); c.append(x)
        for e in x.edges:
            for y in e.link_faces:
                if y.index not in seen: seen.add(y.index); st.append(y)
    comps.append(c)
dome = max(comps, key=lambda c: max(v.co.z for f in c for v in f.verts))
for c in comps:
    P=np.array([v.co[:] for f in c for v in f.verts]); A=sum(f.calc_area() for f in c); ext=(P.max(0)-P.min(0)).max(); dens=A/max(ext,1e-4)
    k = 0 if c is dome else 3 if len(c)>2000 else 0 if (P[:,2].min()>1.70 and ext>0.2) else 3 if P[:,0].mean()<-0.05 else 2 if dens<0.048 else 3
    for f in c: f.material_index=k
Dm=np.array([v.co[:] for f in dome for v in f.verts]); cx,cy=(Dm[:,0].min()+Dm[:,0].max())/2,(Dm[:,1].min()+Dm[:,1].max())/2
print('dome w', round(np.ptp(Dm[:,1]),3), 'len', round(np.ptp(Dm[:,0]),3), 'h', round(np.ptp(Dm[:,2]),3))
T = Matrix.Translation((DX,0,1.664+DZ)) @ Matrix.Diagonal((S,S,S,1)) @ Matrix.Translation((-cx,-cy,-1.712))
PI=Vector((0,0,1.62)); T = Matrix.Translation(PI) @ Matrix.Rotation(math.radians(-float(os.environ.get('PITCH','4'))),4,'Y') @ Matrix.Translation(-PI) @ T
bmesh.ops.transform(bm, matrix=T, verts=bm.verts)
GD=float(os.environ.get('GDROP','0.028')); GF=float(os.environ.get('GFWD','0.01')); RIM=1.664+DZ
gv=set()
for c in comps:
    if c[0].material_index!=2: continue
    P=np.array([v.co[:] for f in c for v in f.verts])
    if P[:,2].min()<RIM and P[:,0].max()>0.02: gv|={v for f in c for v in f.verts}
print('grille verts', len(gv))
for v in gv: v.co.z-=GD; v.co.x+=GF
bm.to_mesh(me)
def mat(name, col, rough, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal; return m
# colours from helmet_clean.png: glossy navy shell, light silver grille, near-black pads and stem guards (slot 1 unused, kept so the classes line up)
MATS = [mat('helmet_shell', (0.026, 0.042, 0.090), 0.3), mat('helmet_stripe', (0.43, 0.25, 0.035), 0.55), mat('helmet_grille', (0.62, 0.64, 0.67), 0.35), mat('helmet_guard', (0.015, 0.018, 0.03), 0.6)]
idx = [p.material_index for p in me.polygons]; me.materials.clear()
for m in MATS: me.materials.append(m)
me.polygons.foreach_set('material_index', idx)
for p in me.polygons: p.use_smooth = True
o = bpy.data.objects.new('Helmet', me); bpy.context.scene.collection.objects.link(o)
for x in list(bpy.data.objects):
    if x is not o: bpy.data.objects.remove(x)
bpy.ops.wm.save_as_mainfile(filepath=D + '/dhelm.blend')
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(D + '/../../pads/gh_only.blend'))
if 'Helmet' in bpy.data.objects: bpy.data.objects.remove(bpy.data.objects['Helmet'])
with bpy.data.libraries.load(D + '/dhelm.blend') as (a, b): b.objects = ['Helmet']
bpy.context.scene.collection.objects.link(b.objects[0]); print('Helmet', len(b.objects[0].data.polygons))
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(D + '/../../pads/gh_only.blend'))
