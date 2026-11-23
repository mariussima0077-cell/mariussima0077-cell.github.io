# v16-200 (Marius 23 nov): Gear Summon – ASCENDED as a 7th tile next to the 6 others (frames copied from the picture, Mythic frame recoloured cyan)
import colorsys
from PIL import Image, ImageFilter, ImageDraw, ImageFont, ImageChops
import numpy as np
R='/home/claude/mariussima0077-cell.github.io/'
src=Image.open(R+'img/sheets/gsum/gsum_bg2_orig.webp').convert('RGB')
A=np.array(src).astype(float)
C=[125,283,438,590,745,903]
# 1) erase the row: per-row colour taken from the gaps between the old tiles (median) + a little noise
gx=[x for g in [(40,60),(190,214),(345,372),(505,522),(659,676),(814,836),(972,988)] for x in range(*g)]
rng=np.random.default_rng(3)
for yy in range(690,893):
    col=np.median(A[yy,gx],axis=0)
    A[yy,38:990]=col+rng.normal(0,1.6,(952,3))
out=Image.fromarray(A.clip(0,255).astype('uint8'))
m=Image.new('L',src.size,0);ImageDraw.Draw(m).rectangle((44,694,984,889),fill=255);m=m.filter(ImageFilter.GaussianBlur(4))
out=Image.composite(out,src,m)
def frame(c):return src.crop((c-74,697,c+74,847))
LW=[124,152,84,70,154,112]
def label(c,w=168):return src.crop((int(c-w/2),847,int(c+w/2),891))
def cyan(img):
    a=np.array(img.convert('RGB')).astype(float)/255;o=a.copy()
    for yy in range(a.shape[0]):
        for xx in range(a.shape[1]):
            r,g,b=a[yy,xx];h,l,s=colorsys.rgb_to_hls(r,g,b)
            if s>.25 and (h<.08 or h>.9):h=.5;r,g,b=colorsys.hls_to_rgb(h,l,s)
            o[yy,xx]=(r,g,b)
    return Image.fromarray((o*255).astype('uint8'))
fr=[frame(c) for c in C]+[cyan(frame(C[5]))]
lb=[label(c,LW[i]+8) for i,c in enumerate(C)]
# ASCENDED label: Lilita, cyan gradient, dark outline (like the others)
f=ImageFont.truetype('/tmp/lilita.ttf',34)
L=Image.new('RGBA',(168,44),(0,0,0,0));d=ImageDraw.Draw(L)
w=d.textlength('ASCENDED',font=f);x=(168-w)/2
d.text((x,4),'ASCENDED',font=f,fill=(0,0,0,255),stroke_width=3,stroke_fill=(8,20,32,255))
g=Image.new('RGBA',L.size);gd=ImageDraw.Draw(g)
for yy in range(44):
    t=yy/44;gd.line([(0,yy),(168,yy)],fill=(int(170+80*(1-t)),255,255,255) if t<.45 else (int(46+30*(1-t)),int(220+20*(1-t)),255,255))
mask=Image.new('L',L.size,0);ImageDraw.Draw(mask).text((x,4),'ASCENDED',font=f,fill=255)
L.paste(g,(0,0),mask)
# 2) place 7 tiles evenly: x 52..976
N=7;x0,x1=52,976;sp=(x1-x0)/N;S=0.80
cent=[x0+sp/2+i*sp for i in range(N)]
fm=Image.new('L',(148,150),0);ImageDraw.Draw(fm).rounded_rectangle((6,6,141,143),radius=18,fill=255);fm=fm.filter(ImageFilter.GaussianBlur(5))
for i,cx in enumerate(cent):
    t=fr[i].resize((int(148*S),int(150*S)),Image.LANCZOS);mk=fm.resize(t.size)
    out.paste(t,(int(cx-t.width/2),712),mk)
    if i<6:
        l=lb[i].resize((int(lb[i].width*.74),int(44*.74)),Image.LANCZOS)
        lm=Image.fromarray((np.abs(np.array(l).astype(int)-np.array(lb[i].resize(l.size)).astype(int)).sum(2)*0).astype('uint8'))
        # mask: keep bright/saturated text pixels only
        a=np.array(l).astype(int);bg=np.array([22,34,60]);dist=np.abs(a-bg).sum(2);lm=Image.fromarray(np.clip((dist-60)*3,0,255).astype('uint8')).filter(ImageFilter.GaussianBlur(.6))
        out.paste(l,(int(cx-l.width/2),844),lm)
    else:
        l=L.resize((int(168*.66),int(44*.66)),Image.LANCZOS);out.paste(l,(int(cx-l.width/2),847),l)
out.save(R+'img/ui5/gsum_bg2.webp','WEBP',quality=90)
out.crop((0,560,1024,1000)).save('/tmp/cit/row3.png')
print([round(c*921/1024,1) for c in cent])
