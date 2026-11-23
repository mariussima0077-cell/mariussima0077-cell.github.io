import sys
from PIL import Image, ImageFilter
import numpy as np
src=sys.argv[1]; out=sys.argv[2]
im=np.array(Image.open(src).convert('RGB')).astype(float)
def erase(a,x0,y0,x1,y1,k=3):
    for y in range(y0,y1):
        L=a[y,x0-k:x0].mean(0);R=a[y,x1:x1+k].mean(0)
        t=np.linspace(0,1,x1-x0)[:,None]
        a[y,x0:x1]=L*(1-t)+R*t
def verase(a,x0,y0,x1,y1,k=3):
    for x in range(x0,x1):
        T=a[y0-k:y0,x].mean(0);B=a[y1:y1+k,x].mean(0)
        t=np.linspace(0,1,y1-y0)[:,None]
        a[y0:y1,x]=T*(1-t)+B*t
def both(a,x0,y0,x1,y1):
    h=a.copy();erase(h,x0,y0,x1,y1);v=a.copy();verase(v,x0,y0,x1,y1)
    a[y0:y1,x0:x1]=(h[y0:y1,x0:x1]+v[y0:y1,x0:x1])/2
def lfill(a,x0,y0,x1,y1,k=4,r=None,bad=None):
    P={y:a[y,x0-k:x0].mean(0) for y in range(y0,y1)}
    if bad:
        b0,b1=bad
        for y in range(b0,b1):
            t=(y-b0+1)/(b1-b0+1);P[y]=P[b0-1]*(1-t)+P[b1]*t
    for y in range(y0,y1):
        L=P[y]
        R=a[y,x1:x1+k].mean(0) if r else L
        t=np.linspace(0,1,x1-x0)[:,None]
        a[y,x0:x1]=L*(1-t)+R*t
def feather(w,h,f):
    m=Image.new('L',(w,h),0)
    from PIL import ImageDraw
    ImageDraw.Draw(m).rectangle((f,f,w-1-f,h-1-f),fill=255)
    return np.array(m.filter(ImageFilter.GaussianBlur(f/2)))[:,:,None]/255.0
def fpaste(a,patch,x,y,f=8):
    h,w=patch.shape[:2];m=feather(w,h,f)
    a[y:y+h,x:x+w]=patch*m+a[y:y+h,x:x+w]*(1-m)
def save(a,box,name,w=None):
    i=Image.fromarray(a.clip(0,255).astype('uint8')).crop(box)
    if w:i=i.resize((w,round(i.height*w/i.width)),Image.LANCZOS)
    i.save(out+'/'+name+'.webp',quality=88);i.save('/tmp/ci/'+name+'.png')
a=im.copy()
# cards
lfill(a,321,1051,423,1229,bad=(1116,1152)); save(a,(310,1041,436,1236),'c5_n')
lfill(a,56,1050,170,1226,bad=(1116,1152)); save(a,(37,1034,186,1241),'c5_c')
# header banner (logo + title + ribbon)
save(im.copy(),(96,246,928,526),'c5_hero')
# TODAY panel
b=im.copy()
x0,y0,x1,y1=165,620,866,884
reg=np.array(Image.fromarray(b[y0:y1,x0:x1].astype('uint8')).filter(ImageFilter.GaussianBlur(26))).astype(float)*0.5
fpaste(b,reg,x0,y0,f=14)
lfill(b,368,898,694,974,k=6,r=True)
save(b,(130,545,895,1012),'c5_today')
# progress panel
p=im.copy()
lfill(p,268,1281,752,1323,k=4,r=True); lfill(p,262,1270,350,1281,k=4,r=True); lfill(p,262,1318,360,1334,k=4,r=True)
p[1362:1400,88:276]=p[1362:1400,458:646].copy()
c=p[1400:1462,258:322].copy()
fpaste(p,c,85,1400,f=10); fpaste(p,c,173,1400,f=10)
save(p,(28,1265,1000,1505),'c5_prog')
