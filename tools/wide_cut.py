# v16-wide: Mythic WIDE skill sheets (2x4 cells of 768x256, green) → img/fx/wide_<id>.webp (8 frames stacked, 600x200 each)
import sys, numpy as np
sys.path.insert(0,'tools')
from PIL import Image
from atlas_wide import unmix
src,dst=sys.argv[1],sys.argv[2]
a=np.asarray(Image.open(src).convert('RGB')).astype(float)
F=unmix(a); r,g,b=F[...,0],F[...,1],F[...,2]
sp=g>np.maximum(r,b)
F[...,1]=np.where(sp,np.where(b>=r,b,r*.86),g)   # standard despill: no green left (cyan stays cyan, smoke turns grey)
OW,OH=600,200; out=Image.new('RGBA',(OW,OH*8))
for i in range(8):
  c,rw=i%2,i//2; cell=F[rw*256:(rw+1)*256,c*768:(c+1)*768].copy(); E=10; rr=np.linspace(0,1,E)
  cell[:E,:,3]*=rr[:,None]; cell[-4:,:,3]*=np.linspace(1,0,4)[:,None]; cell[:,:E,3]*=rr[None,:]; cell[:,-E:,3]*=rr[::-1][None,:]
  out.paste(Image.fromarray(np.clip(cell,0,255).astype(np.uint8),'RGBA').resize((OW,OH),Image.LANCZOS),(0,i*OH))
out.save(dst,'WEBP',quality=70,method=6)
bg=Image.new('RGBA',out.size,(40,40,60,255));bg.alpha_composite(out);bg.convert('RGB').resize((300,800)).save('/tmp/chk_'+dst.split('/')[-1]+'.png')
