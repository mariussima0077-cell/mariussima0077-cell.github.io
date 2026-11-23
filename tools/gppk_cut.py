# Grand Prix pack cards (Marius' ChatGPT frames) -> img/gp/pk_{s,g,p}.webp, dark background around the card removed
import sys,numpy as np
from PIL import Image
from scipy import ndimage
for src,dst in [('silver','pk_s'),('gold','pk_g'),('plat','pk_p')]:
    im=Image.open('img/sheets/gppk/'+src+'.png').convert('RGB');a=np.asarray(im).astype(int)
    mx=a.max(2);dark=mx<52
    lab,_=ndimage.label(dark);edge=set(np.unique(np.r_[lab[0],lab[-1],lab[:,0],lab[:,-1]]))-{0}
    bg=np.isin(lab,list(edge))
    # soft edge: 1px ring + glow pixels outside the frame fade by brightness
    ring=ndimage.binary_dilation(bg,iterations=3)&~bg
    al=np.full(mx.shape,255.);al[bg]=0
    al[ring]=np.clip((mx[ring]-40)/60*255,0,255)
    out=np.dstack([a,al]).astype(np.uint8);o=Image.fromarray(out,'RGBA')
    bb=o.getbbox();print(dst,bb)
    o.resize((360,540),Image.LANCZOS).save('img/gp/'+dst+'.webp',quality=88,method=6)
