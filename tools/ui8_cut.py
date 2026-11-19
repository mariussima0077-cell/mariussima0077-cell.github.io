# v16-93: Marius' 5 pictures from PROMPTS_UI8.md -> img/ui8/ (+ img/ui5/gsum_bg2.webp)
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from ui2_key import key3
from ui5_cut_lib import blobs,rows,pad
from PIL import Image
import numpy as np
from scipy import ndimage as nd
D=os.path.dirname(__file__);S=D+'/../img/sheets/ui8/';O=D+'/../img/ui8/'
os.makedirs(O,exist_ok=True)
def clean(im):  # key green trapped inside (between star sparkles, behind rims) -> transparent + despill
    F=np.asarray(im.convert('RGBA')).astype(float);r,g,b=F[...,0],F[...,1],F[...,2]
    k=(g>150)&(g-np.maximum(r,b)>100);F[k,3]=0
    sp=(g>np.maximum(r,b)+20)&~k&(F[...,3]>0);F[...,1]=np.where(sp,np.maximum(r,b)+20,g)
    return Image.fromarray(F.clip(0,255).astype(np.uint8),'RGBA')
def sv(im,n,w=None,q=88):
    im=clean(im);im=im.crop(im.getbbox())
    if w and im.size[0]>w:
        k=w/im.size[0];im=im.resize((round(im.size[0]*k),round(im.size[1]*k)),Image.LANCZOS)
    im.save(O+n+'.webp',quality=q,method=6);print(n,im.size);return im
def parts(n,minA=3000,it=3):
    im=key3(Image.open(S+n+'.webp'));W,H=im.size
    R=rows(blobs(im,minA,it),H);print(n,[len(r) for r in R]);return im,[[im.crop(pad(b,3,W,H)) for b in r] for r in R]
im,R=parts('win');sv(R[0][0],'win',700)
im,R=parts('btns')
# buttons touch each other at the gear ornaments -> fixed cuts between them
im=key3(Image.open(S+'btns.webp'));W,H=im.size
cut=[0,212,412,613,815,H]
for i,k in enumerate(['gold','blue','grey','red','green']):
    c=im.crop((0,cut[i],W,cut[i+1]));sv(c,'btn_'+k,560)
im,R=parts('stars',it=8)
for i,k in enumerate(['on','off','asc']):sv(R[0][i],'star_'+k,96)
im,R=parts('bar');sv(R[0][0],'bar_empty',900)
Image.open(S+'gsum_bg2.webp').convert('RGB').save(D+'/../img/ui5/gsum_bg2.webp',quality=86,method=6)
# GREEN button: its glass is chroma-green too -> remove only the green connected to the outside of the rim
src=np.asarray(Image.open(S+'btns.webp').convert('RGB')).astype(int)[cut[4]:cut[5]]
r,g,b=src[...,0],src[...,1],src[...,2]
bg=(g>140)&(g-np.maximum(r,b)>90)
lab,n=nd.label(bg);edge=set(np.unique(np.r_[lab[0],lab[-1],lab[:,0],lab[:,-1]]))-{0}
out=np.isin(lab,list(edge));out=nd.binary_dilation(out,iterations=1)&(g-np.maximum(r,b)>40)
A=np.dstack([src,np.where(out,0,255)]).astype(np.uint8)
im=Image.fromarray(A,'RGBA');im=im.crop(im.getbbox())
k=560/im.size[0];im=im.resize((560,round(im.size[1]*k)),Image.LANCZOS);im.save(O+'btn_green.webp',quality=88,method=6);print('btn_green fixed',im.size)
# GEAR background: ChatGPT changed the lower panels (they don't match the game's buttons) -> keep ONLY the forge scene
# from the new picture and put it over the top of the Hero Summon background (same panels = buttons stay aligned)
def gear_bg(s=1.25,dy=-40,cut=450,f0=470,f1=540):
    base=Image.open(D+'/../img/ui4/sum_bg.webp').convert('RGB');W,H=base.size
    new=Image.open(S+'gsum_bg2.webp').convert('RGB').crop((0,0,1024,cut))
    new=new.resize((round(1024*s),round(cut*s)),Image.LANCZOS);cx=round(511*s)-512
    top=Image.new('RGB',(W,H));top.paste(new.crop((cx,0,cx+W,new.size[1])),(0,dy))
    y=np.arange(H)[:,None];m=np.clip((f1-y)/(f1-f0),0,1)*np.ones((1,W))
    m[y[:,0]>=new.size[1]+dy]=0
    out=Image.composite(top,base,Image.fromarray((m*255).astype(np.uint8)))
    out.save(D+'/../img/ui5/gsum_bg2.webp',quality=88,method=6);return out
gear_bg()
# stretchable buttons (9-slice): the gear ornaments in the middle would squash on narrow buttons ->
# btn_*_s = same button with the middle rebuilt from the plain rim; the ornaments go on top separately (btn_ot / btn_ob)
for k in ['gold','blue','grey','red','green']:
    a=np.asarray(Image.open(O+'btn_'+k+'.webp').convert('RGBA')).copy();H,W=a.shape[:2]
    a[:,100:460]=np.repeat(a[:,150:151],360,axis=1);Image.fromarray(a).save(O+'btn_'+k+'_s.webp',quality=88,method=6)  # uniform middle = no seam when stretched
# ornaments = only the pixels that differ from the plain stretched button – taken from the BLUE button
# (its blue glass is easy to tell apart from the grey/gold ornament), connected to the top / bottom edge
g=np.asarray(Image.open(O+'btn_blue.webp').convert('RGBA')).astype(int);p0=np.asarray(Image.open(O+'btn_blue_s.webp').convert('RGBA')).astype(int);H=g.shape[0]
r,gg,b=g[...,0],g[...,1],g[...,2]
d=(np.abs(g-p0).sum(2)>60)&~(b>np.maximum(r,gg)+40)&(g[...,3]>0)
for nm,y0,y1 in [('btn_ot',0,24),('btn_ob',H-24,H)]:
    m=d[y0:y1,206:354];lab,n=nd.label(m);e=lab[0] if nm=='btn_ot' else lab[-1]
    keep=np.isin(lab,list(set(np.unique(e))-{0}));keep=nd.binary_fill_holes(keep)
    o=g[y0:y1,206:354].copy();o[...,3]=np.where(keep,o[...,3],0)
    im=Image.fromarray(o.astype(np.uint8),'RGBA');im.save(O+nm+'.webp',quality=90,method=6);print(nm,im.size)
