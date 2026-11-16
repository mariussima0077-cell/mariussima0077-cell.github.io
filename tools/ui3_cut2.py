# v16-50: Marius' 4 pictures (crew summon header, online nav icons, dialog frame + buttons + toast bar, right side buttons)
import sys,os,numpy as np;sys.path.insert(0,os.path.dirname(__file__))
from ui2_key import key2,key3,bbox
from PIL import Image
from scipy import ndimage
S=os.path.join(os.path.dirname(__file__),'../img/sheets/ui3/');O=os.path.join(os.path.dirname(__file__),'../img/ui3/')
def sv(im,n,w=None,q=85):
    if w and im.size[0]>w: im=im.resize((w,round(im.size[1]*w/im.size[0])),Image.LANCZOS)
    im.save(O+n+'.webp',quality=q,method=6);print(n,im.size)
def parts(im,dil=3,minA=4000):
    a=np.asarray(im)[...,3]>40;lab,n=ndimage.label(ndimage.binary_dilation(a,iterations=dil))
    out=[(s[1].start,s[0].start,s[1].stop,s[0].stop) for s in ndimage.find_objects(lab) if (s[0].stop-s[0].start)*(s[1].stop-s[1].start)>=minA]
    out.sort(key=lambda b:(round(((b[1]+b[3])/2)/(im.size[1]/6)),b[0]));return out
def sheet(name,names,w,dil=3,k=key3):
    im=k(Image.open(S+name+'.webp'));ps=parts(im,dil)
    if len(ps)!=len(names):print('!!',name,len(ps),ps);return
    for b,n in zip(ps,names):sv(im.crop(b),n,w)
im=key3(Image.open(S+'crewsum.webp'));print('crewsum bbox',bbox(im,30),im.size);sv(im.crop(bbox(im,30)),'csum_h',900)
sheet('onav',['on_rank','on_chat','on_arena','on_cup','on_prof'],128,k=key2)
sheet('dlg',['dlg_f','dlg_g','dlg_r','dlg_bar'],None)
def split(name,xs,names,w):
    im=key3(Image.open(S+name+'.webp'));W=im.size[0];xs=[0]+xs+[W]
    for i,n in enumerate(names):
        c=im.crop((xs[i],0,xs[i+1],im.size[1]));sv(c.crop(bbox(c,30)),n,w)
split('side',[447,872,1297,1724],['s_rank','s_chat','s_ci','s_news','s_mail'],130)
# dialog frame: fill the green holes in the gears, then 9-slice (top 200 · 10 px middle · bottom 131)
src=Image.open(S+'dlg.webp');k3=key3(src);k2=key2(src);bb=None
a=np.asarray(k3)[...,3]>40;lab,n=ndimage.label(ndimage.binary_dilation(a,iterations=3))
sl=max(ndimage.find_objects(lab),key=lambda s:(s[0].stop-s[0].start)*(s[1].stop-s[1].start));x0,y0,x1,y1=sl[1].start,sl[0].start,sl[1].stop,sl[0].stop
k3.paste(k2.crop((x0,y0,x1,y0+90)),(x0,y0))
f=k3.crop((x0,y0,x1,y1));W,H=f.size
o=Image.new('RGBA',(W,200+10+131));o.paste(f.crop((0,0,W,200)),(0,0));o.paste(f.crop((0,200,W,210)),(0,200));o.paste(f.crop((0,H-131,W,H)),(0,210))
sv(o,'dlg_f');print('dlg frame',W,H)
