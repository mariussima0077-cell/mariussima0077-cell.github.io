# v16-63: Marius' 10 pictures for DUNGEONS (originals in img/sheets/dg/) -> img/dg/
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from ui2_key import key3
from ui5_cut_lib import blobs,rows,pad
from PIL import Image
S=os.path.join(os.path.dirname(__file__),'../img/sheets/dg/');O=os.path.join(os.path.dirname(__file__),'../img/dg/')
os.makedirs(O,exist_ok=True)
def sv(im,n,w=None,q=88):
    if w and im.size[0]>w:
        k=w/im.size[0];im=im.resize((round(im.size[0]*k),round(im.size[1]*k)),Image.LANCZOS)
    im.save(O+n+'.webp',quality=q,method=6);print(n,im.size);return im
def parts(n,minA=6000):
    im=key3(Image.open(S+n+'.webp'));W,H=im.size
    R=rows(blobs(im,minA),H);return im,[[im.crop(pad(b,3,W,H)) for b in r] for r in R]
for n in ['dg_bg','bt_vault','bt_mine','bt_forge','bt_lab']:sv(Image.open(S+n+'.webp').convert('RGB'),n,None,84)
im,R=parts('banner');print('banner',[len(r) for r in R]);sv(R[0][0],'m_dg',1100)
im,R=parts('btns');print('btns',[len(r) for r in R])
sv(R[0][0],'title',1000);sv(R[1][0],'b_enter',420);sv(R[1][1],'b_lock',420);sv(R[2][0],'b_sweep',420);sv(R[2][1],'b_pass',560);sv(R[3][0],'bar',900)
im,R=parts('cards');print('cards',[len(r) for r in R])
for i,k in enumerate(['vault','mine','forge','lab']):sv(R[0][i],'c_'+k,360)
im,R=parts('keys');print('keys',[len(r) for r in R])
for i,k in enumerate(['vault','mine','forge','lab','pass']):sv(R[0][i],'k_'+k,160)
import numpy as np
from scipy import ndimage
cuts=[282,430,574,716,860,1012]
for i,k in enumerate(['norm','cur','done','lock','boss']):
    c=im.crop((0,cuts[i],im.size[0],cuts[i+1]));A=np.asarray(c).copy();lab,n=ndimage.label(A[...,3]>20)
    big=np.argmax(ndimage.sum(np.ones_like(lab),lab,range(1,n+1)))+1;A[...,3]=np.where(lab==big,A[...,3],0)
    c=Image.fromarray(A);sv(c.crop(c.getbbox()),'f_'+k,900)
im,R=parts('pass');print('pass',[len(r) for r in R]);sv(R[0][0],'pass_w',900)
