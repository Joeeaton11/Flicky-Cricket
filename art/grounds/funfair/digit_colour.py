# 4.a: recolour the red fill of the painted score digits (red on the dark maroon panel reads poorly). Usage: digit_colour.py gold|cream|blue
# Only the saturated red fill changes; gold outline, bulbs and maroon edge stay. Source = raw/digits_red/.
import sys, numpy as np, cv2
from PIL import Image
T={'gold':(24,0.95,1.15),'cream':(22,0.18,1.35),'blue':(100,0.85,1.2)}[sys.argv[1]]   # hue (OpenCV 0-180), sat mult, value mult
for d in range(10):
  a=np.array(Image.open('raw/digits_red/d%d.webp'%d).convert('RGBA')); hsv=cv2.cvtColor(a[...,:3],cv2.COLOR_RGB2HSV).astype(float)
  h,s,v=hsv[...,0],hsv[...,1],hsv[...,2]
  red=((h<=8)|(h>=170))&(s>140)&(v>90)
  m=cv2.GaussianBlur(red.astype(np.float32),(0,0),0.8)
  h2=np.full_like(h,T[0]); s2=np.clip(s*T[1],0,255); v2=np.clip(v*T[2],0,255)
  out=hsv.copy(); out[...,0]=np.where(m>0.5,h2,h); out[...,1]=s*(1-m)+s2*m; out[...,2]=v*(1-m)+v2*m
  a[...,:3]=cv2.cvtColor(out.astype(np.uint8),cv2.COLOR_HSV2RGB); Image.fromarray(a).save('../../../assets/themes/funfair/d%d.webp'%d,quality=90)
