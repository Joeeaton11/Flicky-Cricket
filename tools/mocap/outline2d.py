from PIL import Image, ImageFilter
def add_outline(im, px, col=(11,19,34)):
    a=im.getchannel('A'); ring=a.filter(ImageFilter.MaxFilter(px*2+1)).point(lambda v: 255 if v>40 else 0).filter(ImageFilter.GaussianBlur(px*0.35))
    o=Image.new('RGBA',im.size,col+(0,)); o.putalpha(ring); o.alpha_composite(im); return o
