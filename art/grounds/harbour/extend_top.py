# 3.c Harbour top fix (Joe, Nov 2: "fix the top"): the painting stops ~42 source rows short of the screen top and cuts through the
# cottage roofs and the hill. Extend it upward in source pixels before the fit, as a skyline: sky everywhere (the painted sky colour,
# deepening upward); roof columns get their ridge back (top 8 rows mirrored — a pitched roof seen from above is near-symmetric about
# its ridge); green hill columns rise into a gentle rolling crest. Writes raw/plate_ext.png (+E rows on top) for build.py.
import numpy as np, cv2
img=cv2.imread('raw/plate_388-191.png').astype(np.float32); H,W=img.shape[:2]; E=60
B,G,R=[img[0,:,i] for i in range(3)]
sky=((B>G+10)&(B>R+40)&(B>170))
green=(G>R+15)&(G>B+5)&~sky
rng=np.random.default_rng(7)
skycol=img[2:10,700:860].reshape(-1,3).mean(0); deep=skycol*np.array([1.0,.9,.8])   # deeper blue higher up
ext=np.zeros((E,W,3),np.float32)
for i in range(E): t=i/(E-1); ext[i]=deep*(1-t)+skycol*t
# sea-side columns: continue their own painted sky colour up, fading into the common sky
own=np.repeat(cv2.GaussianBlur(img[:6].mean(0,keepdims=True),(0,0),sigmaX=40,sigmaY=0.1),E,0)   # blurred sideways: no cloud streaks; f=np.linspace(0,1,E)[:,None,None]; ext=np.where(sky[None,:,None],own*f+ext*(1-f),ext)
# hill crest height per column (smooth), only where the top row is green
cr=cv2.GaussianBlur(rng.random((1,W)).astype(np.float32),(0,0),18)[0]; cr=(cr-cr.min())/(cr.max()-cr.min()+1e-6)
hgt=np.where(green,6+cr*16,0)
hgt=cv2.GaussianBlur(hgt[None].astype(np.float32),(0,0),3)[0]*(green|(cv2.dilate(green.astype(np.uint8)[None],np.ones((1,9),np.uint8))[0]>0))
for x in range(W):
  h=hgt[x]
  if h>0.5:
    n=int(np.ceil(h)); col=img[0,x]
    for j in range(n):
      a=np.clip(h-j,0,1); y=E-1-j; shade=1+0.04*j
      ext[y,x]=ext[y,x]*(1-a)+col*shade*a
# roof ridges: mirror the top 8 rows above every non-sky, non-green column (roofs, chimneys, walls)
M=8; roof=~sky&~green; mir=img[:M][::-1]
fade=np.linspace(1,.0,M)[:,None]   # soften the top of the mirrored band
for j in range(M):
  y=E-1-j; a=(roof*np.clip(1.6-j/M*1.6,0,1))[:,None]
  ext[y]=ext[y]*(1-a)+img[j][:,]*a if False else ext[y]*(1-a)+mir[M-1-j]*a
out=np.concatenate([ext,img],0)
cv2.imwrite('raw/plate_ext.png',out.clip(0,255).astype(np.uint8)); np.save('ext_rows.npy',np.array([E]))
cv2.imwrite('raw/ext_check.png',cv2.resize(out[:130].clip(0,255).astype(np.uint8),(1728,260)))
