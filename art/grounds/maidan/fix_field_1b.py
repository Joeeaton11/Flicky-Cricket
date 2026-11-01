import numpy as np, cv2
from PIL import Image
W,H=1170,2532; cx,cy,rx,ry=.5*W,.6*H,.46*W,.335*H
img=cv2.imread('W.png'); fld=cv2.imread('maidan_v10.png')     # pass 2 scene; painted worn maidan grass from the busy-frame pass
yy,xx=np.mgrid[0:H,0:W].astype(np.float32); rho=np.hypot((xx-cx)/rx,(yy-cy)/ry)
hf=cv2.cvtColor(fld,cv2.COLOR_BGR2HSV).astype(int)
gr=(hf[...,0]>=12)&(hf[...,0]<=50)&(hf[...,1]>45)&(hf[...,2]>80)
bad=(((~gr)|(hf[...,2]<150))&(rho<1.03)).astype(np.uint8); bad=cv2.morphologyEx(bad,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
bad=cv2.dilate(bad,np.ones((21,21),np.uint8))
fld=cv2.inpaint(fld,bad*255,21,cv2.INPAINT_TELEA)
L1=cv2.cvtColor(img,cv2.COLOR_BGR2LAB).astype(np.float32); L2=cv2.cvtColor(fld,cv2.COLOR_BGR2LAB).astype(np.float32)
hsv=cv2.cvtColor(img,cv2.COLOR_BGR2HSV)
ring=(rho>1.04)&(rho<1.35)&(hsv[...,0]>=22)&(hsv[...,0]<=50)&(hsv[...,1]>55)&(hsv[...,2]>90)
inside=rho<0.95
mo,so=L1[ring].mean(0),L1[ring].std(0); mi,si=L2[inside].mean(0),L2[inside].std(0)
F=(L2-mi)/np.maximum(si,1e-3)*so*np.array([0.9,0.9,0.9])+mo
F[...,0]+=6                                                    # a touch brighter: our ground is the best-kept patch
F=cv2.cvtColor(np.clip(F,0,255).astype(np.uint8),cv2.COLOR_LAB2BGR).astype(np.float32)
w=np.clip((1.015-rho)/0.05,0,1); w=(w*w*(3-2*w))[...,None]
res=F*w+img.astype(np.float32)*(1-w)
cv2.imwrite('pass2_fixed.png',np.clip(res,0,255).astype(np.uint8))
Image.fromarray(cv2.cvtColor(np.clip(res,0,255).astype(np.uint8),cv2.COLOR_BGR2RGB)).resize((390,844)).save('pass2_check.png')
