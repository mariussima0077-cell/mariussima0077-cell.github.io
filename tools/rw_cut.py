# v16-146 RAIL WARS pictures (Marius, 21 nov 2026): trains per grade (locomotive top half, wagon bottom half), button, page + battle backgrounds
# green key by DISTANCE to pure green (the UNCOMMON train is green itself), despill only on the soft edge
import numpy as np
from PIL import Image
U='/mnt/user-data/uploads/'
def key(im,width=None):
  a=np.asarray(im.convert('RGB')).astype(np.float32);r,g,b=a[...,0],a[...,1],a[...,2]
  d=np.sqrt(r*r+(255-g)**2+b*b);al=np.clip((d-70)/70,0,1)
  m=np.maximum(r,b);edge=al<1;g2=np.where(edge&(g>m),m+(g-m)*.3,g)
  from scipy import ndimage   # drop small specks (ChatGPT left a few dark dots above the RARE wagon)
  lab,n=ndimage.label(al>.1);sz=ndimage.sum(np.ones_like(al),lab,range(1,n+1));big=max(sz) if n else 0
  for i,z in enumerate(sz,1):
    if z<big*.01:al[lab==i]=0
  out=Image.fromarray(np.dstack([r,g2,b,al*255]).clip(0,255).astype(np.uint8),'RGBA')
  out=out.crop(out.getchannel('A').point(lambda v:255 if v>30 else 0).getbbox())
  if width:out=out.resize((width,round(out.height*width/out.width)),Image.LANCZOS)
  return out
G={0:'c5c0c2a4',1:'b63e319c',2:'3c55a297',3:'7540eeb2',4:'1604b9b5',5:'7823cb39'}
for g,f in G.items():
  im=Image.open(U+f+'-image.png');w,h=im.size
  lo=key(im.crop((0,0,w,h//2)),480);wa=key(im.crop((0,h//2,w,h)),420)
  lo.save(f'img/rw/loco{g}.webp','WEBP',quality=88,method=6);wa.save(f'img/rw/wag{g}.webp','WEBP',quality=88,method=6);print(g,lo.size,wa.size)
key(Image.open(U+'43bf6102-image.png'),256).save('img/rw/rw_btn.webp','WEBP',quality=90,method=6)
Image.open(U+'0995616b-image.png').convert('RGB').resize((720,1080),Image.LANCZOS).save('img/rw/rw_bg.webp','WEBP',quality=82,method=6)
Image.open(U+'8c6e7055-image.png').convert('RGB').resize((1200,800),Image.LANCZOS).save('img/rw/rw_battle.webp','WEBP',quality=82,method=6)
