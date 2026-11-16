# v16-49: CHOOSE MECHANIC + AUTO BEST popups (Marius' pictures) -> 9-slice frames + row pictures in img/ui3/
import sys,os,numpy as np;sys.path.insert(0,os.path.dirname(__file__))
from ui2_key import key3
from PIL import Image
S=os.path.join(os.path.dirname(__file__),'../img/sheets/ui3/');O=os.path.join(os.path.dirname(__file__),'../img/ui3/')
def sv(i,n,q=85):i.save(O+n+'.webp',quality=q,method=6)
def frame(im,top,midy,bot,L,Rr,name):
    W=im.size[0];a=np.asarray(im.convert('RGB'))
    col=tuple(int(v) for v in a[midy,W//2-40:W//2+40].mean(0))+(255,)
    t=im.crop((0,0,W,top));m=im.crop((0,midy,W,midy+8)).copy();m.paste(col,(L,0,W-Rr,8));b=im.crop((0,bot,W,im.size[1]))
    o=Image.new('RGBA',(W,top+8+b.size[1]));o.paste(t,(0,0));o.paste(m,(0,top));o.paste(b,(0,top+8));sv(o,name);print(name,o.size,'slices',top,8,b.size[1],col)
ch=key3(Image.open(S+'choose.webp'))
frame(ch,282,455,1332,46,46,'ch_f')
sv(ch.crop((62,286,958,450)),'ch_row');sv(ch.crop((60,640,962,808)),'ch_rowon')
ab=key3(Image.open(S+'autob.webp'))
frame(ab,368,478,1242,52,52,'ab_f')
sv(ab.crop((76,370,947,477)),'ab_row')
