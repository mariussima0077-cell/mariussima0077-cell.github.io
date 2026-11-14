import numpy as np, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
# grade background colours (centre, middle)
GBG={0:([110,130,138],[32,42,50]),1:([60,150,70],[14,45,18]),2:([50,120,200],[10,30,70]),3:([150,60,200],[40,10,60]),4:([200,150,40],[70,45,5]),5:([200,50,50],[70,8,8])}
def avatar(hid,gr=3):
    full=Image.open(f'out/full_{hid}.png')
    cell=full.crop((0,0,384,256))
    a=np.asarray(cell)[...,3]>100
    ys,xs=np.where(a);top=ys.min()
    # head x = centre of the top 40 px
    hx=int(np.median(xs[ys<top+40]))
    S=150;x0=hx-S//2;y0=max(0,top-12)
    bust=cell.crop((x0,y0,x0+S,y0+S)).resize((256,256),Image.LANCZOS)
    yy,xx=np.mgrid[0:256,0:256]
    d=np.sqrt((xx-128)**2+((yy-70)*1.0)**2)/200
    c0=np.array(GBG[gr][0],float);c1=np.array(GBG[gr][1],float);c2=np.array([6,4,10.])
    t=np.clip(d,0,1)[...,None]
    bg=np.where(t<.55,c0+(c1-c0)*(t/.55),c1+(c2-c1)*((t-.55)/.45))
    bg=bg*(1-np.clip((yy-150)/106,0,1)[...,None]*.85)
    B=Image.fromarray(bg.clip(0,255).astype(np.uint8)).convert('RGBA')
    B.alpha_composite(bust);B.convert('RGB').save(f'out/{hid}.webp',quality=90)
    # silhouette
    g=np.zeros((256,256,3));g[:]=[25,35,46];g+=np.linspace(0,4,256)[:,None,None]
    S2=Image.fromarray(g.astype(np.uint8)).convert('RGBA')
    m=np.asarray(bust)[...,3]
    sil=np.zeros((256,256,4),np.uint8);sil[...,:3]=[34,46,58];sil[...,3]=m
    S2.alpha_composite(Image.fromarray(sil).filter(ImageFilter.GaussianBlur(2)))
    dr=ImageDraw.Draw(S2);f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',110)
    dr.text((128,128),'?',font=f,fill=(74,86,98),anchor='mm')
    S2.convert('RGB').save(f'out/{hid}s.webp',quality=90)
if __name__=='__main__':
    # usage: python3 avatar.py <grade> <id> [<id> ...]   (reads out/full_<id>.png, writes out/<id>.webp + out/<id>s.webp)
    import sys
    for h in sys.argv[2:]:avatar(h,int(sys.argv[1]))
