# v16-55: Marius' 5 pictures for BATTLE HUB + CLASS TOWERS (logo, frame kit, hub background, 6 class towers, 5 mode banners)
import sys,os,numpy as np;sys.path.insert(0,os.path.dirname(__file__))
from ui2_key import key3
from PIL import Image
from ui5_cut_lib import blobs,rows,pad
S=os.path.join(os.path.dirname(__file__),'../img/sheets/ui7/');O=os.path.join(os.path.dirname(__file__),'../img/ui7/')
os.makedirs(O,exist_ok=True)
def sv(im,n,w=None,q=88):
    if w and max(im.size)>w:
        k=w/max(im.size);im=im.resize((round(im.size[0]*k),round(im.size[1]*k)),Image.LANCZOS)
    im.save(O+n+'.webp',quality=q,method=6);return im.size
def degreen(im):  # glows drawn over the green came out lemon-green -> warm them (pixels that are half transparent or yellow-green)
    A=np.asarray(im).astype(np.float32);r,g,b,a=A[...,0],A[...,1],A[...,2],A[...,3]
    m=(g>r*1.05)&(g>b*1.3)&(a<250)
    A[...,1]=np.where(m,np.minimum(g,r*.9+10),g)
    return Image.fromarray(A.clip(0,255).astype(np.uint8),'RGBA')
# 1. CLASS TOWERS logo
im=degreen(key3(Image.open(S+'ct_logo.webp')));W,H=im.size;b=blobs(im,50000,6);x0=min(q[0] for q in b);y0=min(q[1] for q in b);x1=max(q[2] for q in b);y1=max(q[3] for q in b)
print('ct_logo',sv(im.crop(pad((x0,y0,x1,y1),4,W,H)),'ct_logo',1100))
# 2. hub background (no green)
print('hub_bg',sv(Image.open(S+'hub_bg.webp').convert('RGB'),'hub_bg',None,84))
# 3. 5 mode banners
im=degreen(key3(Image.open(S+'modes.webp')));W,H=im.size;R=rows(blobs(im,20000,2),H);print('modes',[len(r) for r in R])
for r,n in zip(R,['m_camp','m_arena','m_tower','m_cup','m_soon']):print(n,sv(im.crop(pad(r[0],2,W,H)),n,1100))
# 4. 6 class towers (Bruiser, Racer, Scanner / Medic, Sprayer, Shocker)
im=degreen(key3(Image.open(S+'towers.webp')));W,H=im.size
for i,n in enumerate(['engine','tuning','inspect','service','paint','elec']):
    c=im.crop((i%3*W//3,i//3*H//2,(i%3+1)*W//3,(i//3+1)*H//2));print(n,sv(c.crop(c.getbbox()),'ct_'+n,520))
# 5. frame kit: gold bar, grey bar / gold card, grey card, green / grey small / purple crown / long gear bar
im=degreen(key3(Image.open(S+'frames.webp')));W,H=im.size;bs=blobs(im,20000,3);print('frames',len(bs),sorted(bs))
names={(78,15):'bar_gold',(797,30):'bar_grey',(65,214):'card_gold',(547,214):'card_grey',(167,835):'bar_long',(1042,274):'btn_green',(1042,447):'btn_grey',(1042,618):'bar_crown'}
for b in bs:
    n=names[(b[0],b[1])];print(n,sv(im.crop(pad(b,3,W,H)),n,None if n.startswith('card') else 900))
# 6. tower cards: the card frames with the garage picture replaced by a dark glow in the class colour + the class tower
#    open = gold card, closed today = grey card + grey tower + the gold lock taken from the grey card
from scipy import ndimage
from PIL import ImageFilter,ImageEnhance
CC={'engine':(230,60,40),'tuning':(40,110,255),'inspect':(30,200,255),'service':(40,200,110),'paint':(240,60,200),'elec':(170,230,40)}
gold=Image.open(O+'card_gold.webp').convert('RGBA');grey=Image.open(O+'card_grey.webp').convert('RGBA');CW,CH=gold.size
WIN=(50,138,396,470)
def hole(card):
    A=np.asarray(card).copy();A[WIN[1]:WIN[3],WIN[0]:WIN[2],3]=0;return Image.fromarray(A,'RGBA')
G=np.asarray(grey).astype(int);r,g,b=G[...,0],G[...,1],G[...,2]
gm=(r>120)&(r-b>50)&(g>70);gm[:200]=False;gm[450:]=False;gm[:,:120]=False;gm[:,330:]=False
body=gm.copy();body[:300]=False;body=ndimage.binary_fill_holes(ndimage.binary_closing(body,iterations=3))
lockm=ndimage.binary_dilation(gm|body,iterations=1)
L=np.asarray(grey).copy();L[...,3]=np.where(lockm,255,0).astype(np.uint8);lock=Image.fromarray(L,'RGBA').filter(ImageFilter.SMOOTH)
lock.crop(lock.getbbox()).save(O+'lock_big.webp',quality=90)
fg,fr=hole(gold),hole(grey)
for k,c in CC.items():
    t=Image.open(O+'ct_'+k+'.webp').convert('RGBA');h=322;t=t.resize((round(t.size[0]*h/t.size[1]),h),Image.LANCZOS)
    for open_ in (1,0):
        bg=Image.new('RGBA',(CW,CH),(0,0,0,0));yy,xx=np.mgrid[0:CH,0:CW];d=np.hypot((xx-223)/190,(yy-300)/200)
        col=np.array(c if open_ else (120,120,130),float);k2=np.clip(1-d,0,1)[...,None]
        base=np.array([10,14,26],float)*(1-k2)+col*.55*k2;A=np.dstack([base,np.full((CH,CW),255)]).clip(0,255).astype(np.uint8)
        bg=Image.fromarray(A,'RGBA');tt=t if open_ else ImageEnhance.Brightness(ImageEnhance.Color(t).enhance(.05)).enhance(.55)
        bg.alpha_composite(tt,((CW-tt.size[0])//2,WIN[3]-6-h));m=Image.new('L',(CW,CH),0);m.paste(255,WIN);out=Image.new('RGBA',(CW,CH),(0,0,0,0));out.paste(bg,(0,0),m)
        out.alpha_composite(fg if open_ else fr)
        if not open_:out.alpha_composite(lock,(0,0))
        sv(out,('ct_c_' if open_ else 'ct_l_')+k,380)
print('cards ok')
# 7. lemon-green glow around the gold bar -> warm gold
def warm(n):
    A=np.asarray(Image.open(O+n+'.webp').convert('RGBA')).astype(np.float32);r,g,b=A[...,0],A[...,1],A[...,2]
    m=(g>r*.9)&(r>100)&(b<r*.55);A[...,1]=np.where(m,r*.78,g);A[...,2]=np.where(m,np.minimum(b,r*.2),b)
    Image.fromarray(A.clip(0,255).astype(np.uint8),'RGBA').save(O+n+'.webp',quality=88,method=6)
warm('bar_gold')
# 8. CLASS TOWERS banner for the hub (Marius sent no banner for it): the ARENA banner frame, dark inside, the logo on the left, the 6 towers on the right
fr=Image.open(O+'m_arena.webp').convert('RGBA');BW,BH=fr.size;ins=(22,16,BW-22,BH-16)
yy,xx=np.mgrid[0:BH,0:BW];k=np.clip(1-np.hypot((xx-760)/420,(yy-BH/2)/90),0,1)[...,None]
A=(np.array([12,16,34])*(1-k)+np.array([70,40,120])*k).clip(0,255);bg=Image.fromarray(np.dstack([A,np.full((BH,BW),255)]).astype(np.uint8),'RGBA')
for i,n in enumerate(['engine','tuning','inspect','service','paint','elec']):
    t=Image.open(O+'ct_'+n+'.webp').convert('RGBA');h=int(BH*.78);t=t.resize((round(t.size[0]*h/t.size[1]),h),Image.LANCZOS);bg.alpha_composite(t,(int(420+i*108),BH-16-h))
lg=Image.open(O+'ct_logo.webp').convert('RGBA');h=BH-10;lg=lg.resize((round(lg.size[0]*h/lg.size[1]),h),Image.LANCZOS)
out=fr.copy();m=Image.new('L',(BW,BH),0);m.paste(255,ins);out.paste(bg,(0,0),m)
F=np.asarray(fr);O2=np.asarray(out).copy();edge=np.zeros((BH,BW),bool);edge[:,:30]=1;edge[:,-30:]=1;edge[:13]=1;edge[-20:]=1
O2[edge]=F[edge];out=Image.fromarray(O2,'RGBA');out.alpha_composite(lg,(6,5));sv(out,'m_class')
print('m_class',out.size)
