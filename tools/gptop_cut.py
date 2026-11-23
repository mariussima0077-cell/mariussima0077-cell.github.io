# v16-230: Marius' Grand Prix Top 10 badges (green background removed) + GRAND PRIX FINISHERS banner (2.5:1)
import numpy as np
from PIL import Image
S='img/sheets/gptop/'
def key(src,dst,size=256):
    im=Image.open(S+src).convert('RGBA');a=np.array(im).astype(np.int16);r,g,b=a[...,0],a[...,1],a[...,2]
    gd=g-np.maximum(r,b);al=np.clip(255-(gd-40)*4,0,255);al[gd<40]=255
    sp=gd>20;a[...,1]=np.where(sp,np.maximum(r,b)+np.minimum(gd,20)//2,g)   # despill the green edge
    a[...,3]=np.minimum(a[...,3],al);im=Image.fromarray(a.clip(0,255).astype(np.uint8));bb=im.getbbox();im=im.crop(bb)
    w,h=im.size;m=max(w,h);c=Image.new('RGBA',(m,m));c.paste(im,((m-w)//2,(m-h)//2));c.resize((size,size),Image.LANCZOS).save(dst,quality=90);print(dst,bb)
for n in ['top1','top2','top3']:key(n+'_src.png','img/gp/'+n+'.webp')
im=Image.open(S+'finishers_src.png').convert('RGB');w,h=im.size;ch=round(w/2.5);y=int(h*0.44-ch/2)
im.crop((0,max(0,y),w,max(0,y)+ch)).resize((900,360),Image.LANCZOS).save('img/gp/finishers.webp',quality=85);print('banner',w,h,y,ch)
