# v16-80: Marius' 7 pictures (Shop packs, VIP Pass, Campaign Fund, NORMAL/HARD, tutorial) -> img/shop/
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from ui2_key import key3
from ui5_cut_lib import blobs,rows,pad
from PIL import Image
S=os.path.join(os.path.dirname(__file__),'../img/sheets/shop/');O=os.path.join(os.path.dirname(__file__),'../img/shop/')
os.makedirs(O,exist_ok=True)
import numpy as np
from scipy import ndimage as nd
def pockets(im):  # bright key green trapped inside (ring centre, between arm and body) -> transparent + despill
    F=np.asarray(im.convert('RGBA')).astype(float);r,g,b=F[...,0],F[...,1],F[...,2]
    k=(g>175)&(g-np.maximum(r,b)>110);k=nd.binary_dilation(k,iterations=1)&(g-np.maximum(r,b)>50);F[k,3]=0
    sp=(g>np.maximum(r,b)+25)&~k;F[...,1]=np.where(sp,np.maximum(r,b)+25,g)
    return Image.fromarray(F.clip(0,255).astype(np.uint8),'RGBA')
def sv(im,n,w=None,q=88):
    if n!='fund_n':im=pockets(im)
    if w and im.size[0]>w:
        k=w/im.size[0];im=im.resize((round(im.size[0]*k),round(im.size[1]*k)),Image.LANCZOS)
    im.save(O+n+'.webp',quality=q,method=6);print(n,im.size);return im
def parts(n,minA=6000,it=3):
    im=key3(Image.open(S+n+'.webp'));W,H=im.size
    R=rows(blobs(im,minA,it),H);print(n,[len(r) for r in R]);return im,[[im.crop(pad(b,3,W,H)) for b in r] for r in R]
im=key3(Image.open(S+'packs.webp'));W=im.size[0]
cut=[0,262,496,742,1024]  # chests of PRO/ELITE rise above their frame and touch the banner above -> fixed cuts
for i,k in enumerate(['starter','rookie','pro','elite']):
    c=im.crop((0,cut[i],W,cut[i+1]));sv(c.crop(c.getbbox()),'pk_'+k,1000)
im,R=parts('vip',it=14)
for i,k in enumerate(['sil','gold','plat']):sv(R[0][i],'vp_'+k,240)
im,R=parts('fund',it=6)
for i,k in enumerate(['n','h']):sv(R[0][i],'fund_'+k,260)
im,R=parts('hm')
sv(R[0][0],'hm_n1',420);sv(R[0][1],'hm_n0',420);sv(R[1][0],'hm_h1',420);sv(R[1][1],'hm_h0',420);sv(R[2][0],'hm_box',900)
# poses 3/4 and 4/5 overlap horizontally (oil can) -> each connected piece goes to the nearest of the 5 bodies
import numpy as np
from scipy import ndimage
im=key3(Image.open(S+'rosa.webp'));A=np.asarray(im);lab,n=ndimage.label(A[...,3]>40)
sz=ndimage.sum(A[...,3]>40,lab,range(1,n+1));cm=ndimage.center_of_mass(A[...,3]>40,lab,range(1,n+1))
big=sorted(np.argsort(-sz)[:5],key=lambda i:cm[i][1])
for j,k in enumerate(['talk','point','thumb','think','cheer']):
    keep=[i+1 for i in range(n) if sz[i]>=20 and min(big,key=lambda b:abs(cm[b][1]-cm[i][1])+abs(cm[b][0]-cm[i][0])*.3)==big[j]]
    B=A.copy();B[...,3]=np.where(np.isin(lab,keep),A[...,3],0);c=Image.fromarray(B);sv(c.crop(c.getbbox()),'rosa_'+k,300)
im,R=parts('dialog')
sv(R[0][0],'dlg_box',1000);sv(R[1][0],'dlg_name',360);sv(R[1][1],'dlg_ring',260);sv(R[1][2],'dlg_next',300)
im,R=parts('hand',it=10)
sv(R[0][0],'hand0',200);sv(R[0][1],'hand1',200)
