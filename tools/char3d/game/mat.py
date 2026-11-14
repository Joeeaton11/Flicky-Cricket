import bpy, os, json, sys
src,dst=sys.argv[-2],sys.argv[-1]
bpy.ops.wm.open_mainfile(filepath=os.path.abspath(src))
ob=bpy.data.objects['Body']; me=ob.data; avg=json.load(open('avg.json'))
NAMES=['unk','skin','hair','brows','eye_white','eye_dark','shirt','buttons','trousers','shoes','soles']
MUL=['skin']                                   # keep blush/lips: per-channel multiply
LUM=['hair','brows','shirt','buttons','trousers','shoes','soles']   # recolour: target colour x texture shading
old=me.materials[0]; tex=[n for n in old.node_tree.nodes if n.type=='TEX_IMAGE'][0].image
cm=bpy.data.images.load(os.path.abspath('classmap.png')); cm.colorspace_settings.name='Non-Color'; cm.pack()
m=bpy.data.materials.new('player'); m.use_nodes=True; N=m.node_tree.nodes; L=m.node_tree.links
bs=N['Principled BSDF']; bs.inputs['Roughness'].default_value=0.6; bs.inputs['Specular IOR Level'].default_value=0.3
tx=N.new('ShaderNodeTexImage'); tx.image=tex
ci=N.new('ShaderNodeTexImage'); ci.image=cm; ci.interpolation='Closest'
sep=N.new('ShaderNodeSeparateColor'); L.new(ci.outputs['Color'],sep.inputs[0])
idx=N.new('ShaderNodeMath'); idx.operation='MULTIPLY'; idx.inputs[1].default_value=255; L.new(sep.outputs[0],idx.inputs[0])
bw=N.new('ShaderNodeRGBToBW'); L.new(tx.outputs['Color'],bw.inputs[0])
cur=tx.outputs['Color']
for nm in MUL+LUM:
    k=NAMES.index(nm)
    c=N.new('ShaderNodeMath'); c.operation='COMPARE'; c.inputs[1].default_value=k; c.inputs[2].default_value=0.4; L.new(idx.outputs[0],c.inputs[0])
    t=N.new('ShaderNodeRGB'); t.name='tint_'+nm; t.label=nm
    if nm in MUL:
        t.outputs[0].default_value=(1,1,1,1)
        mu=N.new('ShaderNodeMix'); mu.data_type='RGBA'; mu.blend_type='MULTIPLY'; mu.inputs['Factor'].default_value=1
        L.new(tx.outputs['Color'],mu.inputs[6]); L.new(t.outputs[0],mu.inputs[7]); res=mu.outputs[2]
    else:
        a=[x**2.2 for x in avg[nm]]; t.outputs[0].default_value=(*a,1)       # default = the original average colour
        r=N.new('ShaderNodeMath'); r.operation='DIVIDE'; L.new(bw.outputs[0],r.inputs[0]); r.inputs[1].default_value=avg[nm+'_lum']
        mu=N.new('ShaderNodeVectorMath'); mu.operation='SCALE'; L.new(t.outputs[0],mu.inputs[0]); L.new(r.outputs[0],mu.inputs['Scale'])
        # keep a little of the original colour variation so the default looks exactly like before
        keep=N.new('ShaderNodeMix'); keep.data_type='RGBA'; keep.name='keep_'+nm; keep.inputs['Factor'].default_value=0.0
        L.new(mu.outputs[0],keep.inputs[6]); L.new(tx.outputs['Color'],keep.inputs[7]); res=keep.outputs[2]
    mx=N.new('ShaderNodeMix'); mx.data_type='RGBA'; L.new(c.outputs[0],mx.inputs['Factor']); L.new(cur,mx.inputs[6]); L.new(res,mx.inputs[7]); cur=mx.outputs[2]
L.new(cur,bs.inputs['Base Color'])
me.materials.clear(); me.materials.append(m)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(dst)); print('ok')
