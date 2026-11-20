# v16-100: Marius' pictures from PROMPTS_PROGRESS.md -> img/ui9/ (+ img/ui3/s_event.webp)
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from ui2_key import key3
from ui5_cut_lib import blobs,rows,pad
from PIL import Image,ImageDraw,ImageFont,ImageFilter
import numpy as np
D=os.path.dirname(__file__)+'/../';S=D+'img/sheets/ui9/';O=D+'img/ui9/'
os.makedirs(O,exist_ok=True)
def clean(im):
    F=np.asarray(im.convert('RGBA')).astype(float);r,g,b=F[...,0],F[...,1],F[...,2]
    k=(g>150)&(g-np.maximum(r,b)>100);F[k,3]=0
    sp=(g>np.maximum(r,b)+20)&~k&(F[...,3]>0);F[...,1]=np.where(sp,np.maximum(r,b)+20,g)
    return Image.fromarray(F.clip(0,255).astype(np.uint8),'RGBA')
def fit(im,w):
    im=clean(im);im=im.crop(im.getbbox())
    if w and max(im.size)>w:k=w/max(im.size);im=im.resize((round(im.size[0]*k),round(im.size[1]*k)),Image.LANCZOS)
    return im
def sv(im,n,w=None,q=88,d=O):
    im=fit(im,w);im.save(d+n+'.webp',quality=q,method=6);print(n,im.size);return im
def parts(n,minA=3000,it=3):
    im=key3(Image.open(S+n+'.webp'));W,H=im.size
    R=rows(blobs(im,minA,it),H);print(n,[len(r) for r in R]);return im,[[im.crop(pad(b,3,W,H)) for b in r] for r in R]
# 1-2 currency icons, 8 ascension badge
for n,w in [('essence',128),('gparts',128),('asc_badge',192)]:
    im,R=parts(n,it=10);big=max((b for r in R for b in r),key=lambda b:b.size[0]*b.size[1]);sv(big,n,w)
# 3 EVENTS side button: same round gold style as s_rank -> write EVENTS on the empty red ribbon (like RANK)
im,R=parts('event_btn',it=10);b=max((b for r in R for b in r),key=lambda b:b.size[0]*b.size[1]);b=fit(b,None)
W,H=b.size;A=np.asarray(b).astype(int);r,g,bl=A[...,0],A[...,1],A[...,2]
red=(r>150)&(g<90)&(bl<90)&(A[...,3]>0);ys,xs=np.where(red[int(H*.55):]);ys=ys+int(H*.55)
cy=int(np.median(ys));cx=W//2
F=ImageFont.truetype('/usr/share/fonts/truetype/google-fonts/ofl/montserrat/Montserrat[wght].ttf',int(H*.105))
try:F.set_variation_by_name('Black')
except Exception:pass
d=ImageDraw.Draw(b);d.text((cx,cy),'EVENTS',font=F,fill=(255,255,255,255),anchor='mm',stroke_width=max(3,int(H*.012)),stroke_fill=(70,10,10,255))
k=144/H;b=b.resize((round(W*k),144),Image.LANCZOS);b.save(D+'img/ui3/s_event.webp',quality=90,method=6);print('s_event',b.size)
# 4 page background (full picture) + the title plate on its own (top 22%)
bg=Image.open(S+'ev_bg.webp').convert('RGB');bg.save(O+'ev_bg.webp',quality=82,method=6)
# 5 banners (full pictures)
for k in ['hero','gear','crew','ess','dia','wheel']:
    im=Image.open(S+'evb_'+k+'.webp').convert('RGB');im=im.resize((900,round(900*im.size[1]/im.size[0])),Image.LANCZOS);im.save(O+'evb_'+k+'.webp',quality=82,method=6);print('evb_'+k,im.size)
# 6 wheel + pointer
# the GREEN slice is chroma-green too -> remove only the green connected to the picture edge; the pointer sits inside
# the wheel's bounding box -> split by connected parts. Wheel = static frame (ring + hub) + rotating disc (the 8 slices).
from scipy import ndimage as nd
a=np.asarray(Image.open(S+'wheel.webp').convert('RGB')).astype(int);r,g,bb=a[...,0],a[...,1],a[...,2]
bgm=(g>140)&(g-np.maximum(r,bb)>90);lab,n=nd.label(bgm);edge=set(np.unique(np.r_[lab[0],lab[-1],lab[:,0],lab[:,-1]]))-{0}
outm=np.isin(lab,list(edge));outm=nd.binary_dilation(outm,iterations=1)&(g-np.maximum(r,bb)>30)
l2,n2=nd.label(~outm);sz=nd.sum(~outm,l2,range(1,n2+1));o=np.argsort(-sz)
def part(i):
    m=l2==o[i]+1;A=np.dstack([a,np.where(m,255,0)]).astype(np.uint8)
    # despill the edge only
    e=m&~nd.binary_erosion(m,iterations=3);A[...,1]=np.where(e&(A[...,1]>np.maximum(A[...,0],A[...,2])+20),np.maximum(A[...,0],A[...,2])+20,A[...,1]);return A
W0=part(0);P0=part(1)
cx,cy,RO,RI,RH=605,608,549,437,101          # measured: ring centre, outer radius, slices end, hub radius
yy,xx=np.mgrid[:W0.shape[0],:W0.shape[1]];rr=np.hypot(xx-cx,yy-cy)
slice_like=((r>110)&(g<125)&(bb<70))|((bb>80)&(g<80))   # orange / purple slice (also its shadow)
orn=(np.abs(xx-cx)<75)&(rr>RI-40)&(rr<RI+10)&~slice_like  # gear-ornament teeth reaching inside the ring -> stay on the frame
fr=W0.copy();fr[...,3]=np.where((rr<RI)&(rr>RH)&~orn,0,fr[...,3])
fr=Image.fromarray(fr,'RGBA').crop((cx-RO-1,16,cx+RO+1,1218))   # frame keeps the top/bottom gear ornaments
k=.5;fr=fr.resize((round(fr.size[0]*k),round(fr.size[1]*k)),Image.LANCZOS);fr.save(O+'wheel.webp',quality=88,method=6);print('wheel frame',fr.size,'centre',(cx-(cx-RO-1))*k,(cy-16)*k,'disc r',RI*k)
dc=W0.copy();dc[...,3]=np.where((rr<RI+4)&~orn,dc[...,3],0)
# under the ornaments: copy the slice colour from just beside (it is hidden by the frame, but must not rotate as gold)
for y in range(dc.shape[0]):
    row=orn[y]&(rr[y]<RI+4)
    if row.any():
        xs=np.where(row)[0];dc[y,xs,:3]=dc[y,xs.min()-3,:3];dc[y,xs,3]=255
dc=Image.fromarray(dc,'RGBA').crop((cx-RI-4,cy-RI-4,cx+RI+4,cy+RI+4))
dc=dc.resize((round(dc.size[0]*k),)*2,Image.LANCZOS);dc.save(O+'wheel_disc.webp',quality=86,method=6);print('disc',dc.size)
pin=Image.fromarray(P0,'RGBA');pin=pin.crop(pin.getbbox());pin=pin.resize((round(pin.size[0]*.5),round(pin.size[1]*.5)),Image.LANCZOS);pin.save(O+'wheel_pin.webp',quality=90,method=6);print('pin',pin.size)
# 7 stars red / purple / rainbow (same size as img/ui8/star_on 96x92)
im,R=parts('stars',it=8);R=sorted([b for r in R for b in r],key=lambda b:b.size[0]*b.size[1])[-3:]
# order left->right
import itertools
for i,k in enumerate(['red','purple','rainbow']):pass
im=key3(Image.open(S+'stars.webp'));W,H=im.size
for i,k in enumerate(['red','purple','rainbow']):sv(im.crop((i*W//3,0,(i+1)*W//3,H)),'star_'+k,96)
