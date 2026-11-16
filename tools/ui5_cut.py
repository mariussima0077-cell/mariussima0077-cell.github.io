# v16-53: Marius' 5 pictures (CREW class icon, SMALL UI kit, GEAR SUMMON background, INFO WINDOW kit, SET PANEL kit)
import sys,os,numpy as np;sys.path.insert(0,os.path.dirname(__file__))
from ui2_key import key3
from PIL import Image
from scipy import ndimage
S=os.path.join(os.path.dirname(__file__),'../img/sheets/ui5/');O=os.path.join(os.path.dirname(__file__),'../img/ui5/')
os.makedirs(O,exist_ok=True)
def sv(im,n,w=None,q=88):
    if w and max(im.size)>w:
        k=w/max(im.size);im=im.resize((round(im.size[0]*k),round(im.size[1]*k)),Image.LANCZOS)
    im.save(O+n+'.webp',quality=q,method=6);return im.size
def blobs(im,minA=3000,it=3):
    a=np.asarray(im)[...,3]>40;lab,n=ndimage.label(ndimage.binary_dilation(a,iterations=it))
    bs=[(s[1].start,s[0].start,s[1].stop,s[0].stop) for s in ndimage.find_objects(lab)]
    return [b for b in bs if (b[2]-b[0])*(b[3]-b[1])>=minA]
def rows(bs,H):
    bs=sorted(bs,key=lambda b:b[1]);out=[];cur=[]
    for b in bs:
        if cur and b[1]>max(c[3] for c in cur)-10:out.append(sorted(cur));cur=[]
        cur.append(b)
    if cur:out.append(sorted(cur))
    return out
def pad(b,p,W,H):return (max(0,b[0]-p),max(0,b[1]-p),min(W,b[2]+p),min(H,b[3]+p))
# 1. CREW class icon (same size as the other class icons: square, 160)
im=key3(Image.open(S+'crew.webp'));W,H=im.size;b=blobs(im,20000)[0]
c=im.crop(pad(b,4,W,H));s=max(c.size);sq=Image.new('RGBA',(s,s));sq.paste(c,((s-c.size[0])//2,(s-c.size[1])//2))
print('cls_crew',sv(sq,'cls_crew',160))
# 2. SMALL UI kit: row1 coin plate · check · lock · FUSION ribbon; then bar frame, gold fill, rainbow fill
im=key3(Image.open(S+'small.webp'));W,H=im.size;R=rows(blobs(im),H);print([len(r) for r in R])
for b,n,w in zip(R[0],['coin','ok','lock','fusion'],[300,120,120,360]):print(n,sv(im.crop(pad(b,3,W,H)),n,w))
for r,n in zip(R[1:],['bar','fill_g','fill_r']):print(n,sv(im.crop(pad(r[0],3,W,H)),n,900))
# 3. GEAR SUMMON background (no green)
print('gsum_bg',sv(Image.open(S+'gsum.webp').convert('RGB'),'gsum_bg',None,84))
# 4. INFO WINDOW kit: window frame + 7 rows (Common..Mythic + neutral)
im=key3(Image.open(S+'info.webp'));W,H=im.size;R=rows(blobs(im,5000),H);print([len(r) for r in R])
print('win',sv(im.crop(pad(R[0][0],2,W,H)),'win',1000))
for r,n in zip(R[1:],['r0','r1','r2','r3','r4','r5','rn']):print(n,sv(im.crop(pad(r[0],2,W,H)),n,1000))
# 5. SET PANEL kit: slot empty / slot lit, bonus row locked / active
im=key3(Image.open(S+'setp.webp'));W,H=im.size;R=rows(blobs(im,5000,2),H);print([len(r) for r in R])
for b,n in zip(R[0],['slot0','slot1']):print(n,sv(im.crop(pad(b,3,W,H)),n,200))
for r,n in zip(R[1:],['srow0','srow1']):print(n,sv(im.crop(pad(r[0],3,W,H)),n,1000))
# the gold glow around the lit slot / active row was drawn over the green -> came out lemon-green: make it warm gold (not the green check)
def warm(n,skip=None):
    A=np.asarray(Image.open(O+n+'.webp').convert('RGBA')).astype(np.float32);H,W=A.shape[:2];r,g,b=A[...,0],A[...,1],A[...,2]
    m=(g>r*.82)&(r>110)
    if skip:yy,xx=np.mgrid[0:H,0:W];m&=~((xx>skip[0]*W)&(xx<skip[2]*W)&(yy>skip[1]*H)&(yy<skip[3]*H))
    A[...,1]=np.where(m,r*.74,g);A[...,2]=np.where(m,np.minimum(b,r*.25),b)
    Image.fromarray(A.clip(0,255).astype(np.uint8),'RGBA').save(O+n+'.webp',quality=88,method=6)
warm('slot1');warm('srow1',(.76,.15,.92,.85))
