# v16-146: Rail Terminal LV1-4 + Street Token + Business Street banner (Marius, 21 nov 2026) – green key, despill, trim
import sys
import numpy as np
from PIL import Image
def key(path,out,width=None,trim=True):
  a=np.asarray(Image.open(path).convert('RGB')).astype(np.float32);r,g,b=a[...,0],a[...,1],a[...,2]
  m=np.maximum(r,b);gr=g-m                       # how green a pixel is
  al=np.clip(1-(gr-40)/80,0,1)                   # >120 greener than r/b = background, <40 = keep
  al[(g>200)&(r<90)&(b<90)]=0
  g2=np.where(gr>0,np.minimum(g,m+ (g-m)*0.25),g) # despill the edges
  rgba=np.dstack([r,g2,b,al*255]).clip(0,255).astype(np.uint8);im=Image.fromarray(rgba,'RGBA')
  if trim:im=im.crop(im.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox())
  if width:im=im.resize((width,round(im.height*width/im.width)),Image.LANCZOS)
  im.save(out,'WEBP',quality=88,method=6);print(out,im.size)
if __name__=='__main__':
  key(sys.argv[1],sys.argv[2],int(sys.argv[3]) if len(sys.argv)>3 else None)
