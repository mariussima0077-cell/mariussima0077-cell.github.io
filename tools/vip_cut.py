#!/usr/bin/env python3
"""Cut Marius' 10 VIP badges (img/sheets/vip/vip_badges.png, 5x2 on chroma green) → img/vip/v1..v10.webp"""
import os, numpy as np
from PIL import Image
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
im=np.array(Image.open(os.path.join(R,'img/sheets/vip/vip_badges.png')).convert('RGB')).astype(int)
r,g,b=im[...,0],im[...,1],im[...,2]
gr=(g-np.maximum(r,b))               # how green
a=np.clip(255-(gr-40)*255/80,0,255).astype(np.uint8)    # soft edge
# despill: green channel limited to max(r,b) where it is greener
g2=np.where(gr>0,np.maximum(r,b),g)
out=np.dstack([r,g2,b,a]).astype(np.uint8)
from scipy import ndimage
lab,n=ndimage.label(ndimage.binary_dilation(a>20,iterations=2))
sl=ndimage.find_objects(lab); area=ndimage.sum(np.ones_like(lab),lab,range(1,n+1))
big=[k for k in range(n) if area[k]>8000]; print('badges',len(big))
box=[[sl[k][0].start,sl[k][0].stop,sl[k][1].start,sl[k][1].stop] for k in big]
for k in range(n):                       # sparkles / small bits → the nearest badge
    if k in big: continue
    cy=(sl[k][0].start+sl[k][0].stop)/2; cx=(sl[k][1].start+sl[k][1].stop)/2
    j=min(range(len(box)),key=lambda j:(max(box[j][0]-cy,0,cy-box[j][1])**2+max(box[j][2]-cx,0,cx-box[j][3])**2))
    b=box[j]; d=max(b[0]-cy,0,cy-b[1])+max(b[2]-cx,0,cx-b[3])
    if d<45: b[0]=min(b[0],sl[k][0].start);b[1]=max(b[1],sl[k][0].stop);b[2]=min(b[2],sl[k][1].start);b[3]=max(b[3],sl[k][1].stop)
box.sort(key=lambda b:(b[0]>a.shape[0]/2,b[2]))
for k,b in enumerate(box):
    t=Image.fromarray(out[b[0]:b[1],b[2]:b[3]]); s=300/max(t.size); t=t.resize((round(t.width*s),round(t.height*s)),Image.LANCZOS)
    t.save(os.path.join(R,f'img/vip/v{k+1}.webp'),quality=90,method=6)
    print(k+1,t.size)
