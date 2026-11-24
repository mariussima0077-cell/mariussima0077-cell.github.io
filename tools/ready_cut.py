import sys, numpy as np
sys.path.insert(0,'tools')
from PIL import Image
from atlas_wide import unmix
a=np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(float)
F=unmix(a); r,g,b=F[...,0],F[...,1],F[...,2]
gr=g>np.maximum(r,b); fl=gr&(r>b+20)
F[...,1]=np.where(fl,np.minimum(g,r*.8),g)
al=F[...,3];lum=F[...,:3].max(2);hz=(al<235)&(lum<235);mx=np.maximum(F[...,0],F[...,1]);F[...,0]=np.where(hz,mx,F[...,0]);F[...,1]=np.where(hz,mx*.5,F[...,1]);F[...,2]=np.where(hz,0,F[...,2]);F[...,3]=np.where(hz,al*np.clip(lum/255,0,1)**1.5,al)
OW,OH=192,128; out=Image.new('RGBA',(OW*4,OH*4))
for i in range(16):
  c,rw=i%4,i//4; cell=F[rw*256:(rw+1)*256,c*384:(c+1)*384].copy(); E=8; rr=np.linspace(0,1,E)
  cell[:E,:,3]*=rr[:,None]; cell[-E:,:,3]*=rr[::-1][:,None]; cell[:,:E,3]*=rr[None,:]; cell[:,-E:,3]*=rr[::-1][None,:]
  out.paste(Image.fromarray(np.clip(cell,0,255).astype(np.uint8),'RGBA').resize((OW,OH),Image.LANCZOS),(c*OW,rw*OH))
out.save(sys.argv[2],'WEBP',quality=78,method=6)
bg=Image.new('RGBA',out.size,(40,40,60,255));bg.alpha_composite(out);bg.convert('RGB').save('/tmp/rchk.png')
