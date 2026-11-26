import numpy as np, json
DD='/home/claude/flicky-cricket/www/assets/ui/frames/'
def save(final,X0,Y0,X1,Y1,bpx,n,mintop=3.0,minbot=3.0,margin=0.1):
    W2,H2=final.size; a=np.array(final)[...,3]
    # anything (flair, shadow, glow) that reaches onto the card must sit in the top/bottom pieces, never the stretched middle
    inner=a[:,int(X0+margin*bpx):int(X1-margin*bpx)]
    mid=(Y0+Y1)//2
    base=inner[mid-20:mid+20].max(axis=0).astype(int)   # what runs the full length (edge shading, side glow)
    rows=np.nonzero(((inner.astype(int)-base[None,:])>6).any(axis=1))[0]
    tr=rows[(rows<mid)&(rows>=Y0)]; br=rows[(rows>mid)&(rows<=Y1)]
    tc=int(max(Y0+round(mintop*bpx),(tr.max()+4) if len(tr) else 0))
    bc=int(min(Y1-round(minbot*bpx),(br.min()-4) if len(br) else H2))
    e=round(0.006*W2)
    final.crop((0,0,W2,tc)).save(DD+'f%dt.webp'%n,quality=92)
    final.crop((0,tc-e,W2,bc+e)).save(DD+'f%dm.webp'%n,quality=92)
    final.crop((0,bc,W2,H2)).save(DD+'f%db.webp'%n,quality=92)
    v=dict(fr1=round(float(tc)/W2,5),fr2=round(float(H2-bc)/W2,5),fe=round(e/W2,5),hl=round(X0/W2,4),hr=round(X1/W2,4),ht=round(Y0/W2,4),hb=round((H2-Y1)/W2,4))
    json.dump(v,open('/tmp/v22/code%d.json'%n,'w')); print(n,v,'tc/b',round((tc-Y0)/bpx,2),'bc/b',round((Y1-bc)/bpx,2))
    return v
