import bpy, os, json
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('base_mat.blend'))
ob=[o for o in bpy.data.objects if o.type=='MESH'][0]; me=ob.data
avg=json.load(open('avg.json'))
NAMES=['unk','skin','shirt','trim','trousers','pads','straps','shoes','shoe_stripe','wristband','face_dark','face_white']
DEF={'skin':(0.92,0.62,0.48),'shirt':(0.11,0.18,0.42),'trim':(0.95,0.72,0.16),'trousers':(0.93,0.89,0.76),'pads':(0.97,0.97,0.97),
     'straps':(0.11,0.18,0.42),'shoes':(0.97,0.97,0.97),'shoe_stripe':(0.11,0.18,0.42),'wristband':(0.11,0.18,0.42)}
tex=[n for n in me.materials[1].node_tree.nodes if n.type=='TEX_IMAGE'][0].image
cmimg=bpy.data.images.load(os.path.abspath('classmap.png')); cmimg.colorspace_settings.name='Non-Color'; cmimg.pack()
m=bpy.data.materials.new('flicky'); m.use_nodes=True; nt=m.node_tree; N=nt.nodes; L=nt.links
bs=N['Principled BSDF']; bs.inputs['Roughness'].default_value=0.38
if 'Coat Weight' in bs.inputs: bs.inputs['Coat Weight'].default_value=0.2
tx=N.new('ShaderNodeTexImage'); tx.image=tex
cm=N.new('ShaderNodeTexImage'); cm.image=cmimg; cm.interpolation='Closest'
idx=N.new('ShaderNodeMath'); idx.operation='MULTIPLY'; idx.inputs[1].default_value=255; L.new(cm.outputs['Color'],idx.inputs[0])   # Non-Color → raw 0..1 → class id
# Non-Color image colour output is channel value; use separate RGB R
sep=N.new('ShaderNodeSeparateColor'); L.new(cm.outputs['Color'],sep.inputs[0]); L.new(sep.outputs[0],idx.inputs[0])
bw=N.new('ShaderNodeRGBToBW'); L.new(tx.outputs['Color'],bw.inputs[0])
cur=tx.outputs['Color']
for k,nm in enumerate(NAMES):
    if nm not in DEF: continue
    cmp=N.new('ShaderNodeMath'); cmp.operation='COMPARE'; cmp.inputs[1].default_value=k; cmp.inputs[2].default_value=0.4; L.new(idx.outputs[0],cmp.inputs[0])
    dv=N.new('ShaderNodeMath'); dv.operation='DIVIDE'; dv.inputs[1].default_value=max(avg.get(nm,0.5)**2.2,0.01); L.new(bw.outputs[0],dv.inputs[0])
    pw=N.new('ShaderNodeMath'); pw.operation='POWER'; pw.inputs[1].default_value=0.8; L.new(dv.outputs[0],pw.inputs[0])
    tint=N.new('ShaderNodeRGB'); tint.name='tint_'+nm; c=DEF[nm]; tint.outputs[0].default_value=(c[0]**2.2,c[1]**2.2,c[2]**2.2,1)
    mul=N.new('ShaderNodeMix'); mul.data_type='RGBA'; mul.blend_type='MULTIPLY'; mul.inputs['Factor'].default_value=1
    L.new(tint.outputs[0],mul.inputs[6]); L.new(pw.outputs[0],mul.inputs[7])
    mix=N.new('ShaderNodeMix'); mix.data_type='RGBA'; L.new(cmp.outputs[0],mix.inputs['Factor']); L.new(cur,mix.inputs[6]); L.new(mul.outputs[2],mix.inputs[7])
    cur=mix.outputs[2]
L.new(cur,bs.inputs['Base Color'])
# keep the per-face class slots for reference, but render with the one texture-masked material
me.materials.append(m); mi=len(me.materials)-1
for p in me.polygons: p.material_index=mi
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('base_mat2.blend'))
print('ok')
