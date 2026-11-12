import bpy, numpy as np, os, mathutils
P=dict(SX=float(os.environ.get('SX',1.12)),SD=float(os.environ.get('SD',1.08)),ARM=float(os.environ.get('ARM',1.18)),FACE=float(os.environ.get('FACE',1.07)),EYE=float(os.environ.get('EYE',1.12)),LEG=float(os.environ.get('LEG',0.95)),JAW=float(os.environ.get('JAW',0.88)))
bpy.ops.wm.open_mainfile(filepath=os.path.abspath('base_mat2_pre.blend'))
ob=[o for o in bpy.data.objects if o.type=='MESH'][0]; me=ob.data
M=ob.matrix_world; inv=M.inverted()
co=np.array([M@v.co for v in me.vertices]); X,Y,Z=co.T
cent=np.array([M@p.center for p in me.polygons]); fcls=np.load('cls.npy')
# vertex class = class of a face that uses it
vcls=np.zeros(len(co),int)
for p in me.polygons:
    for vi in p.vertices: vcls[vi]=fcls[p.index]
sh=cent[fcls==2]; zs0,zs1=np.percentile(sh[:,2],2),np.percentile(sh[:,2],99)   # shirt span
zb=cent[fcls==10][:,2].max()  # brow
chin=zs1+0.02
def sm(t): t=np.clip(t,0,1); return t*t*(3-2*t)
new=co.copy()
# 1) torso + shoulders wider and deeper (weight peaks across the chest, fades at the waist and neck)
wt=sm((Z-zs0)/0.15)*sm((chin+0.02-Z)/0.06)
new[:,0]=X*(1+(P['SX']-1)*wt); new[:,1]=Y*(1+(P['SD']-1)*wt)
# 2) thicker arms: per side, push away from the arm's centre line
for s in (1,-1):
    arm=(X*s>0.19)&(Z>zs0-0.35)&(Z<chin)
    if arm.sum()<50: continue
    pts=co[arm]; c=pts.mean(0); u,sv,vt=np.linalg.svd(pts-c); d=vt[0]
    rel=co[arm]-c; along=rel@d; radial=rel-np.outer(along,d)
    w=sm((np.abs(X[arm])-0.19)/0.05)
    new[arm]+=radial*((P['ARM']-1)*w)[:,None]
    new[arm,0]+= (new[arm,0]-co[arm,0])*0  # keep
# 3) face a little wider, eyes a little bigger
head=Z>chin
hc=np.array([np.median(X[head]),np.median(Y[head]),0])
fw=sm((Z-chin)/0.04)*sm((zb+0.03-Z)/0.04)
new[:,0]=np.where(head,hc[0]+(new[:,0]-hc[0])*(1+(P['FACE']-1)*fw),new[:,0])
eyes=cent[(fcls==11)&(cent[:,2]>zb-0.08)]
for s in (1,-1):
    e=eyes[eyes[:,0]*s>0]
    if len(e)<3: continue
    ec=e.mean(0); r=float(os.environ.get('ER','0.06'))
    d=np.linalg.norm(co-ec,axis=1); w=sm((r-d)/r)*(Y<ec[1]+0.03)
    new+= (co-ec)*((P['EYE']-1)*w)[:,None]
# 3b) shorter jaw: lower face pulled up toward the nose line, chin rounder
nose=zb-0.075
jw=sm((nose-Z)/0.03)*head
new[:,2]=np.where(head&(Z<nose), nose+(new[:,2]-nose)*(1-(1-P.get('JAW',0.88))*jw), new[:,2])
# 4) legs a touch shorter (scale below the waist about the floor, lift nothing above: shift upper body down)
zmin=Z.min(); crotch=zs0-0.08
legs=Z<crotch
new[:,2]=np.where(legs, zmin+(Z-zmin)*P['LEG'], Z-(crotch-zmin)*(1-P['LEG']))
for v,c in zip(me.vertices,new): v.co=inv@mathutils.Vector(c)
bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath('base_mat2.blend'))
print('reshaped',P,'shirt',round(zs0,3),round(zs1,3),'brow',round(zb,3))
