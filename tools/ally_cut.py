# v16-297: Mythic ALLY effect sheets (ChatGPT 1536x1024, 4x2 cells of 384x512, green) → img/fx/ally_<id>.webp (4x2 atlas of 192x256)
import sys, numpy as np
sys.path.insert(0,'tools')
from PIL import Image
from atlas_wide import unmix
src,dst=sys.argv[1],sys.argv[2]
a=np.asarray(Image.open(src).convert('RGB')).astype(float)
F=unmix(a); r,g,b=F[...,0],F[...,1],F[...,2]
sp=g>np.maximum(r,b); F[...,1]=np.where(sp,np.where(b>=r,b,r*.86),g)
# warm (fire) glow halo: semi-transparent edges came out olive → orange, a bit more transparent
al=F[...,3]; warm=F[...,0]>=F[...,2]; lum=F[...,:3].max(2); hz=warm&((al<225)|(lum<190))&(F[...,1]>F[...,0]*.6)
F[...,1]=np.where(hz,np.minimum(F[...,1],F[...,0]*.55),F[...,1]); F[...,3]=np.where(hz,al*.8,al)
OW,OH=192,256; out=Image.new('RGBA',(OW*4,OH*2))
for i in range(8):
  c,rw=i%4,i//4; cell=F[rw*512:(rw+1)*512,c*384:(c+1)*384].copy(); E=10; rr=np.linspace(0,1,E)
  cell[:E,:,3]*=rr[:,None]; cell[-E:,:,3]*=rr[::-1][:,None]; cell[:,:E,3]*=rr[None,:]; cell[:,-E:,3]*=rr[::-1][None,:]
  out.paste(Image.fromarray(np.clip(cell,0,255).astype(np.uint8),'RGBA').resize((OW,OH),Image.LANCZOS),(c*OW,rw*OH))
out.save(dst,'WEBP',quality=75,method=6)
bg=Image.new('RGBA',out.size,(40,40,60,255));bg.alpha_composite(out);bg.convert('RGB').save('/tmp/chk_ally.png')
