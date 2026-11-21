# UI11: chroma-key cut of Marius' ChatGPT pictures (img/sheets/ui10) -> img/ui10
import sys,numpy as np
from PIL import Image
from scipy import ndimage
S='img/sheets/ui10/';D='img/ui10/'
def key(p):
    a=np.asarray(Image.open(S+p).convert('RGB')).astype(int);r,g,b=a[...,0],a[...,1],a[...,2]
    green=(g>150)&(g>r+60)&(g>b+60)
    al=np.where(green,0,255).astype(np.uint8)
    # despill edges
    sp=(g>np.maximum(r,b));a[...,1]=np.where(sp,np.maximum(r,b),g)
    return np.dstack([a.clip(0,255).astype(np.uint8),al])
def parts(p,minpx=4000):
    im=key(p);lab,n=ndimage.label(ndimage.binary_closing(im[...,3]>0,iterations=3))
    out=[]
    for i,sl in enumerate(ndimage.find_objects(lab)):
        h=sl[0].stop-sl[0].start;w=sl[1].stop-sl[1].start
        if h*w<minpx:continue
        out.append((sl[0].start,sl[1].start,Image.fromarray(im[sl])))
    return sorted(out,key=lambda t:(t[0]//150,t[1]))
def save(img,n,q=90):img.save(D+n+'.webp',quality=q,method=6);print(n,img.size)
p=parts('p8_team_coll.png');save(p[0][2],'bt_panel');save(p[1][2],'hc_btn')
save(parts('p5_title.png')[0][2],'ev_title')
save(parts('p3_rank_btn.png')[0][2],'ev_rank_btn')
for i,(_,_,m) in enumerate(parts('p4_medals.png')):m.thumbnail((160,160));save(m,'rk_%d'%(i+1))
