#!/usr/bin/env python3
"""Marius' UPDATE panel (img/sheets/upd/update_panel.png, chroma green) → img/ui/upd_panel.webp + position of the empty bar groove (%)"""
import os, numpy as np
from PIL import Image
from scipy import ndimage
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
im=np.array(Image.open(os.path.join(R,'img/sheets/upd/update_panel.png')).convert('RGB')).astype(int)
r,g,b=im[...,0],im[...,1],im[...,2]; gr=g-np.maximum(r,b)
a=np.clip(255-(gr-40)*255/80,0,255).astype(np.uint8); g2=np.where(gr>0,np.maximum(r,b),g)
ys,xs=np.where(a>20); y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
out=Image.fromarray(np.dstack([r,g2,b,a]).astype(np.uint8)).crop((x0,y0,x1,y1))
W,H=out.size; print('panel',W,H)
# groove: dark row band near the bottom (inner black part of the bar)
arr=np.array(out.convert('RGB')).astype(int); lum=arr.sum(2)
mid=lum[:,W//2]; cand=[y for y in range(int(H*.6),int(H*.9)) if mid[y]<120]
gy0,gy1=min(cand),max(cand)+1; row=lum[(gy0+gy1)//2]; xs2=[x for x in range(W) if row[x]<120]
# take the longest run around the middle
runs=[];s=None
for x in range(W):
    if row[x]<120 and s is None: s=x
    if (row[x]>=120 or x==W-1) and s is not None: runs.append((s,x)); s=None
gx0,gx1=max(runs,key=lambda z:z[1]-z[0])
print('groove %%: left %.2f top %.2f width %.2f height %.2f'%(100*gx0/W,100*gy0/H,100*(gx1-gx0)/W,100*(gy1-gy0)/H))
s=1000/W; out.resize((1000,round(H*s)),Image.LANCZOS).save(os.path.join(R,'img/ui/upd_panel.webp'),quality=88,method=6)
