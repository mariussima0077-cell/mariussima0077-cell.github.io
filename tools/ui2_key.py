import numpy as np
from PIL import Image
def key(im):
    a=np.asarray(im.convert('RGB')).astype(np.float32)
    r,g,b=a[...,0],a[...,1],a[...,2]
    d=g-np.maximum(r,b)            # greenness
    al=np.clip(1-(d-25)/90,0,1)    # d<25 opaque, d>115 transparent
    # despill
    m=np.maximum(r,b);g2=np.where(g>m,m+(g-m)*0.15,g)
    o=np.dstack([r,g2,b,al*255]).clip(0,255).astype(np.uint8)
    return Image.fromarray(o,'RGBA')
def bbox(im,th=8):
    a=np.asarray(im)[...,3];ys,xs=np.where(a>th);return xs.min(),ys.min(),xs.max()+1,ys.max()+1
def key2(im):
    a=np.asarray(im.convert('RGB')).astype(np.float32)
    bg=np.median(a[:8].reshape(-1,3),0)
    d=np.sqrt(((a-bg)**2).sum(-1))
    al=np.clip((d-40)/110,0,1)
    r,g,b=a[...,0],a[...,1],a[...,2];m=np.maximum(r,b)
    sp=(1-al)>0.02
    g2=np.where(sp&(g>m),m+(g-m)*0.3,g)
    return Image.fromarray(np.dstack([r,g2,b,al*255]).clip(0,255).astype(np.uint8),'RGBA')
def key3(im):
    # like key2 but only for green connected to the outer border (keeps green buttons inside)
    from scipy import ndimage
    a=np.asarray(im.convert('RGB')).astype(np.float32)
    bg=np.median(a[:8].reshape(-1,3),0)
    d=np.sqrt(((a-bg)**2).sum(-1))
    near=d<150
    lab,n=ndimage.label(near)
    border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
    outside=np.isin(lab,list(border))
    outside=ndimage.binary_dilation(outside,iterations=2)
    al=np.where(outside,np.clip((d-40)/110,0,1),1.0)
    r,g,b=a[...,0],a[...,1],a[...,2];m=np.maximum(r,b)
    g2=np.where(outside&(g>m),m+(g-m)*0.3,g)
    return Image.fromarray(np.dstack([r,g2,b,al*255]).clip(0,255).astype(np.uint8),'RGBA')
