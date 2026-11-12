import cv2, numpy as np, sys
for v in ['front','tq','side']:
    ref=cv2.imread('kin_%s.png'%v); H,W=ref.shape[:2]
    ai=cv2.imread('../kout/k_%s.png'%v); ai=cv2.resize(ai,(W,H),interpolation=cv2.INTER_LANCZOS4)
    alpha=cv2.imread('b_%s.png'%v,cv2.IMREAD_UNCHANGED)[...,3]
    g1=cv2.cvtColor(ref,cv2.COLOR_BGR2GRAY); g2=cv2.cvtColor(ai,cv2.COLOR_BGR2GRAY)
    sift=cv2.SIFT_create(6000); k1,d1=sift.detectAndCompute(g1,(alpha>0).astype('uint8')); k2,d2=sift.detectAndCompute(g2,None)
    m=cv2.BFMatcher().knnMatch(d1,d2,k=2); good=[a for a,b in m if a.distance<0.75*b.distance]
    p1=np.float32([k1[a.queryIdx].pt for a in good]); p2=np.float32([k2[a.trainIdx].pt for a in good])
    A,inl=cv2.estimateAffinePartial2D(p2,p1,method=cv2.RANSAC,ransacReprojThreshold=4)
    print(v,len(good),inl.sum(),A.round(3).tolist())
    w=cv2.warpAffine(ai,A,(W,H),flags=cv2.INTER_LANCZOS4,borderValue=(236,236,236))
    # dense refinement
    dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    g2w=cv2.cvtColor(w,cv2.COLOR_BGR2GRAY)
    fl=dis.calc(g1,g2w,None)
    fl=cv2.GaussianBlur(fl,(0,0),6)
    yy,xx=np.mgrid[:H,:W].astype(np.float32)
    w2=cv2.remap(w,xx+fl[...,0],yy+fl[...,1],cv2.INTER_LANCZOS4,borderValue=(236,236,236))
    cv2.imwrite('aw_%s.png'%v,w2)
    print(' flow mean',np.abs(fl[alpha>0]).mean(0))
