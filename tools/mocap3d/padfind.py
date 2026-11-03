import bpy, os, numpy as np, bmesh
W=os.getcwd()
bpy.ops.wm.open_mainfile(filepath=f'{W}/rig_batter.blend')
body=bpy.data.objects['Body']; me=body.data
img=[n.image for n in me.materials[0].node_tree.nodes if n.type=='TEX_IMAGE'][0]
w,h=img.size; px=np.array(img.pixels[:]).reshape(h,w,img.channels)[...,:3]
uv=me.uv_layers.active.data; NF=len(me.polygons)
col=np.zeros((NF,3)); cz=np.zeros(NF); cy=np.zeros(NF)
for p in me.polygons:
    cs=[]
    for li in p.loop_indices:
        u,v=uv[li].uv; cs.append(px[min(h-1,int(v*h)),min(w-1,int(u*w))])
    col[p.index]=np.mean(cs,0); c=p.center; cz[p.index]=c.z; cy[p.index]=c.y
lum=col.mean(1); sat=col.max(1)-col.min(1)
np.save('padcols.npy',np.c_[col,cz,cy])
for z0 in np.arange(0.1,0.8,0.05):
    m=(cz>=z0)&(cz<z0+0.05)
    if m.sum(): print(round(z0,2),'n',m.sum(),'lum pct',np.percentile(lum[m],[10,50,90]).round(2),'sat med',np.median(sat[m]).round(2))
