# 4.b Circus Big Top (Figma 396:195, v2 with more tent above; v1 396:191 ran out at the top, sunburst, Camera 2). Sand oval found by flood-fill from the centre, ellipse fitted to its edge
# (= foot of the windbreaks). Repeat rows at the widest band (crossfaded) to match the game ratio, then ONE even scale by width.
# Usage: python3 build.py  (run in art/grounds/beach)
import numpy as np, cv2
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('raw/plate_396-195.png'); h0,w0=img.shape[:2]
ex,ey,ew,eh=np.load('ell.npy')  # from find_ell (rays from the centre to the windbreak foot, robust fitEllipse)
print('sand ellipse',ex,ey,ew,eh,'ratio',round(eh/ew,3))
s=2*rx/ew; L=max(0,int(round(2*ry/s-eh))); print('scale',round(s,4),'rows',L)
img=img.astype(np.float32); F=24; w=np.linspace(0,1,F)[:,None,None]
if L>0:
  # repeat L rows as 4 short bands spread down the tall middle (not side by side, so no run of clones),
  # each cut where the rows match best (side strips weighted), crossfaded
  offs=[-330,-110,110,330]; nb=len(offs); per=L//nb; out=img; shift=0
  for i,o_ in enumerate(offs):
    k=per if i<nb-1 else L-per*(nb-1); yc=int(ey+o_+shift)
    best=None
    for a0 in range(yc-k//2-40,yc-k//2+41):
      d=np.abs(out[a0+k:a0+k+F]-out[a0:a0+F]); wcol=np.ones(out.shape[1]); wcol[int(ex-ew*.42):int(ex+ew*.42)]=0.05
      sc=(d.mean(axis=(0,2))*wcol).sum()
      if best is None or sc<best[0]: best=(sc,a0)
    a0=best[1]
    top=out[:a0+k+F]; seam=top[-F:]*(1-w)+out[a0:a0+F]*w
    out=np.concatenate([top[:-F],seam,out[a0+F:]],0); shift+=k
  img=out; ey=ey+L/2
up=cv2.resize(img,(round(img.shape[1]*s),round(img.shape[0]*s)),interpolation=cv2.INTER_CUBIC)
ox=int(round(ex*s-cx)); oy=int(round(ey*s-cy)); print('ox',ox,'oy',oy,up.shape)
if oy<0:  # only a few rows short: the striped tent canvas mirrored upward (top rows are plain canvas, no figures)
  n=-oy; up=np.concatenate([up[:n][::-1],up],0); oy=0
c=np.clip(up[oy:oy+H,max(0,ox):max(0,ox)+W],0,255).astype(np.uint8)
if c.shape[1]<W: c=cv2.copyMakeBorder(c,0,0,0,W-c.shape[1],cv2.BORDER_REFLECT)
if c.shape[0]<H: c=np.concatenate([c,np.repeat(c[-1:],H-c.shape[0],0)],0)
o=cv2.addWeighted(c,1.15,cv2.GaussianBlur(c,(0,0),2),-0.15,0); cv2.imwrite('plate.png',o)
v=o.copy(); cv2.ellipse(v,(int(cx),int(cy)),(int(rx),int(ry)),0,0,360,(255,0,255),3); cv2.imwrite('check.png',cv2.resize(v,(390,844),interpolation=cv2.INTER_AREA))
