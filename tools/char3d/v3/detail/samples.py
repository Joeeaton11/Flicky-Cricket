import numpy as np
d=np.load('meshw.npz'); V,T,UV=d['V'],d['T'],d['UV']; S=2048
TX=[];TY=[];P=[];NN=[]
for t,uvt in zip(T,UV):
    Pt=V[t]; uvp=uvt*S
    x0,y0=np.floor(uvp.min(0)).astype(int); x1,y1=np.ceil(uvp.max(0)).astype(int)
    xs,ys=np.meshgrid(np.arange(x0,x1+1),np.arange(y0,y1+1)); pts=np.c_[xs.ravel()+0.5,ys.ravel()+0.5]
    a,b,c=uvp; v0=b-a; v1=c-a; den=v0[0]*v1[1]-v1[0]*v0[1]
    if abs(den)<1e-12: continue
    w1=((pts[:,0]-a[0])*v1[1]-v1[0]*(pts[:,1]-a[1]))/den; w2=(v0[0]*(pts[:,1]-a[1])-(pts[:,0]-a[0])*v0[1])/den; w0=1-w1-w2
    ins=(w0>=-0.02)&(w1>=-0.02)&(w2>=-0.02)
    if not ins.any(): continue
    bw=np.c_[w0[ins],w1[ins],w2[ins]]; P.append(bw@Pt)
    fn=np.cross(Pt[1]-Pt[0],Pt[2]-Pt[0]); fn/=np.linalg.norm(fn)+1e-12; NN.append(np.repeat(fn[None],ins.sum(),0))
    TX.append(np.clip(pts[ins,0].astype(int),0,S-1)); TY.append(np.clip(pts[ins,1].astype(int),0,S-1))
np.savez('samples.npz',tx=np.concatenate(TX),ty=np.concatenate(TY),P=np.concatenate(P).astype(np.float32),N=np.concatenate(NN).astype(np.float32))
print('ok',sum(len(x) for x in TX))
