# v16-60: Marius' 6 pictures for WORLD BOSS (originals in img/sheets/wb/) -> img/wb/
# banner (hub tab) · page background · title plates · battle UI kit · battle arena · SCRAPZILLA sheet (atlas_mon.py ... fire)
import sys,os,numpy as np;sys.path.insert(0,os.path.dirname(__file__))
from ui2_key import key3
from ui5_cut_lib import blobs,pad
from PIL import Image
S=os.path.join(os.path.dirname(__file__),'../img/sheets/wb/');O=os.path.join(os.path.dirname(__file__),'../img/wb/')
os.makedirs(O,exist_ok=True)
def sv(im,n,w=None,q=88):
    if w and im.size[0]>w:
        k=w/im.size[0];im=im.resize((round(im.size[0]*k),round(im.size[1]*k)),Image.LANCZOS)
    im.save(O+n+'.webp',quality=q,method=6);print(n,im.size);return im
def warm(im):  # glows over the green came out lemon-green -> warm gold (green rows are left alone)
    A=np.asarray(im).astype(np.float32);r,g,b,a=A[...,0],A[...,1],A[...,2],A[...,3]
    m=(g>r*1.02)&(g>b*1.3)&(a<250)
    A[...,1]=np.where(m,np.minimum(g,r*.85+10),g)
    return Image.fromarray(A.clip(0,255).astype(np.uint8),'RGBA')
def one(n,box,name,w=None,warm_=True):
    im=key3(Image.open(S+n+'.webp'));W,H=im.size;c=im.crop(pad(box,3,W,H));c=warm(c) if warm_ else c;c=c.crop(c.getbbox());return sv(c,name,w)
sv(Image.open(S+'wb_bg.webp').convert('RGB'),'wb_bg',None,84)
sv(Image.open(S+'wb_arena.webp').convert('RGB'),'wb_arena',None,84)
one('banner',(1,327,1534,698),'m_boss',1100)
for b,n,w in [((86,19,1446,466),'t_title',1000),((236,491,1298,663),'t_rank',800),((236,683,1298,856),'t_daily',800),((436,860,1097,1021),'t_weak',420)]:one('titles',b,n,w)
for b,n,w,wm in [((47,6,1494,251),'bar',1200,1),((85,262,1453,331),'fill',1000,1),((117,349,869,529),'dmg',640,1),((1086,340,1365,704),'key',220,1),
              ((40,543,931,692),'row_l',900,1),((7,689,960,859),'row_r',900,1),((37,864,934,1015),'row_c',900,0),((949,737,1523,965),'atk',520,1)]:one('kit',b,n,w,wm)
