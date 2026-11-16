# v16-49: building popup skin from Marius' image (img/sheets/ui3/bpan.webp) -> img/ui3/bld_*.webp
import sys,os,numpy as np;sys.path.insert(0,os.path.dirname(__file__))
from ui2_key import key2,key3
from PIL import Image
S=os.path.join(os.path.dirname(__file__),'../img/sheets/ui3/');O=os.path.join(os.path.dirname(__file__),'../img/ui3/')
src=Image.open(S+'bpan.webp');im=key3(src);k2=key2(src)
im.paste(k2.crop((380,40,740,110)),(380,40))      # green hole inside the handle
def sv(i,n,q=85):i.save(O+n+'.webp',quality=q,method=6)
DX=[248,317,385,454,522,591,660,729,798,867];DY=338;R=31
on=im.crop((DX[0]-R,DY-R,DX[0]+R,DY+R));off=im.crop((DX[5]-R,DY-R,DX[5]+R,DY+R))
h=im.crop((0,0,1113,392)).copy()
for x in DX[:4]:h.paste(off,(x-R,DY-R))
sv(h,'bld_h');sv(on,'bld_dot')
W=1113
top=im.crop((0,392,W,400));mid=im.crop((0,896,W,906)).copy();mid.paste((21,43,76,255),(62,0,W-62,10));bot=im.crop((0,1200,W,1413))
b=Image.new('RGBA',(W,8+10+213));b.paste(top,(0,0));b.paste(mid,(0,8));b.paste(bot,(0,18));sv(b,'bld_b')
sv(im.crop((82,400,1032,490)),'bld_row');sv(im.crop((55,900,1060,1012)),'bld_crew')
c=np.asarray(src.convert('RGB'))[905,300:800].mean(0).astype(int);print('navy',c)
