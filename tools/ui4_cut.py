# v16-52: Marius' 11 pictures (7 class sets, 7 class icons, summon background, HERO SUMMON header, HERO COLLECTION page)
import sys,os,numpy as np;sys.path.insert(0,os.path.dirname(__file__))
from ui2_key import key,key3,bbox
from PIL import Image
from scipy import ndimage
S=os.path.join(os.path.dirname(__file__),'../img/sheets/ui4/');O=os.path.join(os.path.dirname(__file__),'../img/ui4/')
def sv(im,n,w=None,q=86):
    if w and max(im.size)>w:
        k=w/max(im.size);im=im.resize((round(im.size[0]*k),round(im.size[1]*k)),Image.LANCZOS)
    im.save(O+n+'.webp',quality=q,method=6);return im.size
def square(im,pad=.04):
    W,H=im.size;s=int(max(W,H)*(1+pad*2));o=Image.new('RGBA',(s,s));o.paste(im,((s-W)//2,(s-H)//2));return o
def comps(im,cell):
    # biggest blob of the cell + every blob that is close to it (sparks, lightning, spray)
    a=np.asarray(im)[...,3]>40;lab,n=ndimage.label(ndimage.binary_dilation(a,iterations=6))
    if not n:return None
    sz=ndimage.sum(np.ones_like(lab),lab,range(1,n+1));keep=[i+1 for i,s in enumerate(sz) if s>=1500]
    m=np.isin(lab,keep)&a;ys,xs=np.where(m);return xs.min(),ys.min(),xs.max()+1,ys.max()+1
SLOT=['tool','helm','vest','glove','boots','chip']
def fade_left(im,w=60):
    # the spray of the Color Storm gun touches the left border of Marius' picture: soften it so it does not end in a hard cut
    a=np.asarray(im).copy();r=np.linspace(0,1,w)**1.4;a[:,:w,3]=(a[:,:w,3]*r[None,:]).astype(np.uint8);return Image.fromarray(a,'RGBA')
def holes(src,im,th=70):
    # pure background green trapped between two boots / inside a glove (not touching the border) -> transparent too
    a=np.asarray(src.convert('RGB')).astype(np.float32);bg=np.median(a[:8].reshape(-1,3),0);d=np.sqrt(((a-bg)**2).sum(-1))
    A=np.asarray(im).copy();al=np.clip((d-35)/(th-35),0,1);A[...,3]=np.minimum(A[...,3],(al*255).astype(np.uint8))
    g=A[...,1].astype(np.float32);m=np.maximum(A[...,0],A[...,2]).astype(np.float32);A[...,1]=np.where((al<1)&(g>m),m+(g-m)*.3,g).astype(np.uint8)
    return Image.fromarray(A,'RGBA')
def pieces(im):
    # 6 big blobs (the pieces); small blobs (sparks, lightning, paint drops) go to the nearest piece
    a=np.asarray(im)[...,3]>40;lab,n=ndimage.label(ndimage.binary_dilation(a,iterations=3))
    sz=ndimage.sum(np.ones_like(lab),lab,range(1,n+1));cm=ndimage.center_of_mass(np.ones_like(lab),lab,range(1,n+1))
    big=sorted(range(n),key=lambda i:-sz[i])[:6];big.sort(key=lambda i:(cm[i][0]>im.size[1]/2,cm[i][1]))
    own={i:[i] for i in big}
    for i in range(n):
        if i in big or sz[i]<30:continue
        j=min(big,key=lambda k:(cm[k][0]-cm[i][0])**2+(cm[k][1]-cm[i][1])**2);own[j].append(i)
    out=[]
    for k in big:
        m=np.isin(lab,[i+1 for i in own[k]])&a;ys,xs=np.where(m);b=(xs.min(),ys.min(),xs.max()+1,ys.max()+1)
        A=np.asarray(im).copy();A[...,3]=np.where(m,A[...,3],0);out.append((b,Image.fromarray(A,'RGBA').crop(b)))
    return out
for c in ['engine','tuning','inspect','service','paint','elec','all']:
    src=Image.open(S+'set_'+c+'.webp');im=holes(src,key3(src));W,H=im.size
    for i,(sl,(b,p)) in enumerate(zip(SLOT,pieces(im))):
        if c=='paint' and sl=='tool':p=fade_left(p)
        print(c,sl,b,sv(square(p),'st_'+c+'_'+sl,200))
# class icons: 4 on the first row, 3 on the second
im=key3(Image.open(S+'cls.webp'));a=np.asarray(im)[...,3]>40;lab,n=ndimage.label(ndimage.binary_dilation(a,iterations=4))
bs=[(s[1].start,s[0].start,s[1].stop,s[0].stop) for s in ndimage.find_objects(lab) if (s[0].stop-s[0].start)*(s[1].stop-s[1].start)>20000]
bs.sort(key=lambda b:(b[1]>im.size[1]/2,b[0]))
if len(bs)==4:  # the 4 icons of the first row touch each other: split that blob in 4 equal columns
    x0,y0,x1,y1=bs[0];w=(x1-x0)/4;row=[]
    for k in range(4):
        c=im.crop((round(x0+k*w),y0,round(x0+(k+1)*w),y1));bb=bbox(c,40);row.append((round(x0+k*w)+bb[0],y0+bb[1],round(x0+k*w)+bb[2],y0+bb[3]))
    bs=row+bs[1:]
print(len(bs),bs)
for b,c in zip(bs,['engine','tuning','inspect','service','paint','elec','all']):print(c,sv(square(im.crop(b),.02),'cls_'+c,160))
print('sum_bg',sv(Image.open(S+'sum_bg.webp').convert('RGB'),'sum_bg',None,84))
print('coll',sv(Image.open(S+'coll.webp').convert('RGB'),'coll',None,84))
print('hsum_h',sv(Image.open(S+'hsum.webp').convert('RGB'),'hsum_h',1100,86))
