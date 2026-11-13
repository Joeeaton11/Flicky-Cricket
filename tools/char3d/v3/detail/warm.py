import bpy, os, sys
f=sys.argv[-1]
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(f))
m=bpy.data.materials['flicky']; N=m.node_tree.nodes
for nm,mul in (('tint_skin',(0.92,1.0,1.12)),):
    n=N.get(nm)
    if n is None: print('missing',nm); continue
    c=n.outputs[0].default_value; n.outputs[0].default_value=(c[0]*mul[0],c[1]*mul[1],c[2]*mul[2],1)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(f)); print('ok',f)
