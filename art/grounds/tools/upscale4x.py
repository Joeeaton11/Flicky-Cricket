import sys, numpy as np, onnxruntime as ort
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
sess=ort.InferenceSession('animev3.onnx', providers=['CPUExecutionProvider'])
im=np.asarray(Image.open(src).convert('RGB')).astype(np.float32)/255.
H,W,_=im.shape; T=192; P=12; out=np.zeros((H*4,W*4,3),np.float32)
for y in range(0,H,T):
    for x in range(0,W,T):
        y0,x0=max(0,y-P),max(0,x-P); y1,x1=min(H,y+T+P),min(W,x+T+P)
        t=im[y0:y1,x0:x1].transpose(2,0,1)[None]
        r=sess.run(None,{'input':t})[0][0].transpose(1,2,0)
        oy,ox=(y-y0)*4,(x-x0)*4; h=min(T,H-y)*4; w=min(T,W-x)*4
        out[y*4:y*4+h,x*4:x*4+w]=r[oy:oy+h,ox:ox+w]
Image.fromarray((out.clip(0,1)*255+0.5).astype(np.uint8)).save(dst); print(out.shape)
