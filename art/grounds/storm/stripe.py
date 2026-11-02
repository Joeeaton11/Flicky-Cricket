# 3.e: run after the 'storm' entry is in build_locked_boards.py. Builds the locked board and puts the navy lifeboat stripe back behind
# the middle row (the lock rebuild fills the inside with plain orange): orange pixels in that band -> the board's own navy, shading kept.
import os, sys
os.chdir('../../ui/hud_lock'); exec(open('build_locked_boards.py').read().split("if __name__")[0])
o=build('storm','orig/storm_orig.webp',B['storm'])
y1,y2=int(TPL['score'][1])-2,int(TPL['score'][3])+4
reg=o[y1:y2]; r,g,b=reg[...,0],reg[...,1],reg[...,2]
m=(r>180)&(g>70)&(g<170)&(b<80)
src=np.array(Image.open('orig/storm_orig.webp').convert('RGB')).astype(np.float32)
navy=np.median(src[140:180,300:316].reshape(-1,3),0); shade=(r+g+b)/3; shade=shade/np.median(shade[m])
for c in range(3): reg[...,c]=np.where(m,np.clip(navy[c]*shade,0,255),reg[...,c])
o[y1:y2]=reg; Image.fromarray(np.clip(o,0,255).astype(np.uint8)).save('../../../assets/themes/storm/hud2.webp',quality=92)
