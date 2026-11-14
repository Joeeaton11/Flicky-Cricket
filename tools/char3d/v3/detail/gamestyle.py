import bpy, os, sys
f=sys.argv[-1]; bpy.ops.wm.open_mainfile(filepath=os.path.abspath(f))
m=bpy.data.materials['flicky']; N=m.node_tree.nodes; L=m.node_tree.links
for nm,mul in (('tint_skin',(0.96,1.10,1.16)),('tint_shirt',(0.55,0.70,0.80)),('tint_straps',(0.55,0.7,0.8)),('tint_wristband',(0.55,0.7,0.8))):
    n=N.get(nm); c=n.outputs[0].default_value; n.outputs[0].default_value=(c[0]*mul[0],c[1]*mul[1],c[2]*mul[2],1)
for n in N:
    if n.type=='BSDF_PRINCIPLED':
        n.inputs['Roughness'].default_value=0.5; n.inputs['Specular IOR Level'].default_value=0.35
# outline: inverted hull
ob=[o for o in bpy.data.objects if o.type=='MESH' and o.data.materials and 'flicky' in [x.name for x in o.data.materials if x]][0]
ol=bpy.data.materials.new('outline'); ol.use_nodes=True; t=ol.node_tree; t.nodes.clear()
out=t.nodes.new('ShaderNodeOutputMaterial'); em=t.nodes.new('ShaderNodeEmission'); em.inputs[0].default_value=(0.02,0.025,0.05,1); em.inputs[1].default_value=1
tr=t.nodes.new('ShaderNodeBsdfTransparent'); geo=t.nodes.new('ShaderNodeNewGeometry'); mix=t.nodes.new('ShaderNodeMixShader')
t.links.new(geo.outputs['Backfacing'],mix.inputs[0]); t.links.new(em.outputs[0],mix.inputs[1]); t.links.new(tr.outputs[0],mix.inputs[2]); t.links.new(mix.outputs[0],out.inputs[0])
import bmesh
hull=ob.copy(); hull.data=ob.data.copy(); hull.name='Outline'; bpy.context.scene.collection.objects.link(hull)
for mo in list(hull.modifiers):
    if mo.type!='ARMATURE': hull.modifiers.remove(mo)
bm=bmesh.new(); bm.from_mesh(hull.data); bmesh.ops.remove_doubles(bm,verts=bm.verts,dist=2e-4); bmesh.ops.reverse_faces(bm,faces=bm.faces); bm.to_mesh(hull.data); bm.free()
hull.data.materials.clear(); hull.data.materials.append(ol)
sd=hull.modifiers.new('outline','DISPLACE'); sd.direction='NORMAL'; sd.strength=-0.009; sd.mid_level=0
idx=fi=0
for a in ('visible_shadow','visible_diffuse','visible_glossy','visible_transmission','visible_volume_scatter'): setattr(hull,a,False)
print('ok',f,ob.name,idx,fi)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(f))
