# Joe (Nov 2): keep v4's ground, but the Birmingham skyline from v1 (raw 411:191) was brilliant. Take v1's raw skyline band
# (sky, telecom tower, glass towers, silver-disc building, red-brick rooftops; its floodlights patched out from beside them),
# scale it to the plate width and lay it over v4's top, fading into the trees behind v4's pavilion roof.
import numpy as np, cv2
cur=cv2.imread('plate_v4.png').astype(np.float32); raw=cv2.imread('raw/plate_411-191.png').astype(np.float32)
def patch(img,box,dx,F=8,dy=0):
  x0,y0,x1,y1=box; src=img[y0+dy:y1+dy,x0+dx:x1+dx].copy(); h,w=y1-y0,x1-x0
  m=np.minimum(np.minimum(np.arange(w)[None,:]+1,w-np.arange(w)[None,:])/F,np.minimum(np.arange(h)[:,None]+1,h-np.arange(h)[:,None])/F).clip(0,1)[...,None]
  img[y0:y1,x0:x1]=img[y0:y1,x0:x1]*(1-m)+src*m
patch(raw,(60,155,146,300),96); patch(raw,(662,222,698,340),-36); patch(raw,(640,157,724,225),0,dy=72)
band=raw[:285]; s=cur.shape[1]/band.shape[1]; band=cv2.resize(band,(cur.shape[1],round(band.shape[0]*s)),interpolation=cv2.INTER_CUBIC)
band=cv2.addWeighted(band,1.12,cv2.GaussianBlur(band,(0,0),2),-0.12,0)
dst_end,F=470,110; h=band.shape[0]; top=dst_end-h; out=cur.copy()
if top<0: band=band[-top:]; top=0; h=band.shape[0]
else: out[:top]=cv2.GaussianBlur(band[:6].mean(0,keepdims=True),(0,0),60)*np.linspace(0.93,1,top)[:,None,None]
w=np.ones((h,1,1),np.float32); w[h-F:]=np.linspace(1,0,F)[:,None,None]
out[top:top+h]=band*w+cur[top:top+h]*(1-w)
cv2.imwrite('plate.png',out.clip(0,255).astype(np.uint8)); print('band',h,'top',top)
