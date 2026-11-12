import numpy as np, colorsys
cols=np.load('facecols.npy'); cent=np.load('facecent.npy')
h=(cent[:,2]-cent[:,2].min())/(np.ptp(cent[:,2])); x=cent[:,0]
hsv=np.array([colorsys.rgb_to_hsv(*c) for c in np.clip(cols,0,1)]); H,S,V=hsv.T
cls=np.zeros(len(cols),int)
SKIN,SHIRT,TRIM,TROUS,PAD,STRAP,SHOE,SHOESTRIPE,BAND,FACEDARK,FACEWHITE=1,2,3,4,5,6,7,8,9,10,11
navy=(H>0.5)&(H<0.75)&(V<0.6)&(S>0.2)
gold=(H>0.07)&(H<0.17)&(S>0.45)&(V>0.45)
white=(S<0.14)&(V>0.68)
cream=(S>=0.08)&(S<0.38)&(V>0.7)&(H>0.08)&(H<0.2)
skin=(H<0.09)|(H>0.95)
skin&=(S>0.15)&(V>0.35)
head=h>0.80
cls[skin]=SKIN
cls[navy&(h>0.5)]=SHIRT
cls[navy&(h<=0.5)&(h>0.06)]=STRAP
cls[navy&(h>0.4)&(h<0.56)&(np.abs(x)>0.22)]=BAND
cls[gold&(h>0.5)]=TRIM
cls[cream&(h<0.6)&(h>0.06)]=TROUS
cls[white&(h<0.40)&(h>0.06)]=PAD
cls[(h<=0.07)&(white|cream)]=SHOE
cls[(h<=0.07)&(navy|gold)]=SHOESTRIPE
cls[head&(V<0.35)]=FACEDARK
cls[head&white]=FACEWHITE
print('unassigned',(cls==0).sum(), np.bincount(cls))
np.save('cls_raw.npy',cls)
