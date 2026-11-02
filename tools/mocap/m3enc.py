import json,base64,io,sys
import numpy as np
from PIL import Image, ImageEnhance
from ink import ink
from outline2d import add_outline
def enc(dirp,n,crop,W=294,H=452,ol=2,col=1.0,con=1.0,useink=True):
    x0,y0,x1,y1=crop
    c=Image.open(f'{dirp}/fr_{n}.png')
    if useink: c=ink(c,Image.open(f'{dirp}/fn_{n}.png'),Image.open(f'{dirp}/fd_{n}.png'),Image.open(f'{dirp}/mk_{n}.png'))
    if c.size!=(x1-x0,y1-y0): c=c.crop((x0,y0,x1,y1))
    s=c.resize((W,H),Image.LANCZOS)
    if col!=1: s=ImageEnhance.Color(s).enhance(col)
    if con!=1: s=ImageEnhance.Contrast(s).enhance(con)
    if ol: s=add_outline(s,ol)
    mk=Image.open(f'{dirp}/mk_{n}.png').convert('RGBA'); 
    if mk.size!=(x1-x0,y1-y0): mk=mk.crop((x0,y0,x1,y1))
    mk=mk.resize((W,H),Image.NEAREST)
    return s,mk
