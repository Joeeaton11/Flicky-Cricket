import bpy, numpy as np, os, math, mathutils, json, sys
from PIL import Image, ImageDraw
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('base_seg.blend'))
ob=[o for o in bpy.data.objects if o.type=='MESH'][0]; me=ob.data
raw=np.load('cls_raw.npy'); fx=np.load('cls.npy')
img=None
for n in me.materials[0].node_tree.nodes:
    if n.type=='TEX_IMAGE': img=n.image
W,H=img.size; px=np.array(img.pixels[:]).reshape(H,W,4)
uv=me.uv_layers.active.data
# 1) paint over the invented back number: faces moved trim -> shirt
shirt_cols=[]; fill=[]
for p in me.polygons:
    us=[uv[li].uv[:] for li in p.loop_indices]
    if fx[p.index]==2 and raw[p.index]!=3: shirt_cols.append(p.index)
    if fx[p.index]==2 and raw[p.index]==3: fill.append(us)
cols=np.load('facecols.npy'); navy=np.median(cols[np.array(shirt_cols)],0)
pim=Image.fromarray((np.flipud(px[...,:3])*255).astype('uint8')); d=ImageDraw.Draw(pim)
for us in fill: d.polygon([(u*W,(1-v)*H) for u,v in us],fill=tuple(int(c*255) for c in navy))
arr=np.flipud(np.array(pim).astype(float)/255); px[...,:3]=arr; img.pixels[:]=px.ravel(); img.pack()
# 2) recolourable materials: lum of the texture / class average lum * tint
lum=lambda c: c[...,0]*.3+c[...,1]*.59+c[...,2]*.11
DEF={'skin':(0.92,0.62,0.48),'shirt':(0.11,0.18,0.42),'trim':(0.95,0.72,0.16),'trousers':(0.93,0.89,0.76),'pads':(0.97,0.97,0.97),
     'straps':(0.11,0.18,0.42),'shoes':(0.97,0.97,0.97),'shoe_stripe':(0.11,0.18,0.42),'wristband':(0.11,0.18,0.42)}
avg={}
for k,nm in enumerate(['unk','skin','shirt','trim','trousers','pads','straps','shoes','shoe_stripe','wristband','face_dark','face_white']):
    sel=fx==k
    if sel.any(): avg[nm]=float(np.median(lum(cols[sel])))
for m in me.materials[1:]:
    nt=m.node_tree; bs=[n for n in nt.nodes if n.type=='BSDF_PRINCIPLED'][0]
    tx=[n for n in nt.nodes if n.type=='TEX_IMAGE' and n.image==img][0]
    for inp in ('Metallic',):
        for l in list(bs.inputs[inp].links): nt.links.remove(l)
        bs.inputs[inp].default_value=0
    for l in list(bs.inputs['Roughness'].links): nt.links.remove(l)
    bs.inputs['Roughness'].default_value=0.38
    if 'Coat Weight' in bs.inputs: bs.inputs['Coat Weight'].default_value=0.2
    if m.name in DEF:
        bw=nt.nodes.new('ShaderNodeRGBToBW'); nt.links.new(tx.outputs['Color'],bw.inputs[0])
        dv=nt.nodes.new('ShaderNodeMath'); dv.operation='DIVIDE'; dv.inputs[1].default_value=max(avg.get(m.name,0.5)**2.2,0.01)  # texture is sRGB-decoded to linear
        nt.links.new(bw.outputs[0],dv.inputs[0])
        cl=nt.nodes.new('ShaderNodeMath'); cl.operation='POWER'; cl.inputs[1].default_value=0.8; nt.links.new(dv.outputs[0],cl.inputs[0])
        tint=nt.nodes.new('ShaderNodeRGB'); tint.name='tint'; c=DEF[m.name]; tint.outputs[0].default_value=(c[0]**2.2,c[1]**2.2,c[2]**2.2,1)
        mx=nt.nodes.new('ShaderNodeMix'); mx.data_type='RGBA'; mx.blend_type='MULTIPLY'; mx.inputs['Factor'].default_value=1
        nt.links.new(tint.outputs[0],mx.inputs[6]); nt.links.new(cl.outputs[0],mx.inputs[7])
        nt.links.new(mx.outputs[2],bs.inputs['Base Color'])
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('base_mat.blend'))
json.dump(avg,open('avg.json','w')); print('ok',avg)
