# The game draws pause2 into a SQUARE (drawMatchHud: pr*2.24 both ways), so a tall pause (pumpkin with stem, wheel with lantern)
# gets squashed. Pad each pause onto a transparent square canvas, centred. Usage: python3 pad_pause.py <theme dir> ...
import sys
from PIL import Image
for d in sys.argv[1:]:
  f=f'assets/themes/{d}/pause2.webp'; i=Image.open(f).convert('RGBA'); n=max(i.size)
  c=Image.new('RGBA',(n,n)); c.alpha_composite(i,((n-i.width)//2,(n-i.height)//2)); c.save(f,quality=92); print(d,i.size,'->',c.size)
