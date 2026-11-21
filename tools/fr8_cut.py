#!/usr/bin/env python3
"""Marius' VIP 10 profile frame (img/sheets/vip/frame_vip10.png, chroma green) → img/fr8.webp 300x300 + hole position in %"""
import os, numpy as np
from PIL import Image
from scipy import ndimage
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
im=np.array(Image.open(os.path.join(R,'img/sheets/vip/frame_vip10.png')).convert('RGB')).astype(int)
r,g,b=im[...,0],im[...,1],im[...,2]; gr=g-np.maximum(r,b)
a=np.clip(255-(gr-40)*255/80,0,255).astype(np.uint8); g2=np.where(gr>0,np.maximum(r,b),g)
out=Image.fromarray(np.dstack([r,g2,b,a]).astype(np.uint8)); H,W=a.shape
lab,n=ndimage.label(a<20); hole=lab==lab[H//2,W//2]; ys,xs=np.where(hole)
print('hole: left %.1f right %.1f top %.1f bottom %.1f'%(100*xs.min()/W,100*(1-(xs.max()+1)/W),100*ys.min()/H,100*(1-(ys.max()+1)/H)))
out.resize((300,300),Image.LANCZOS).save(os.path.join(R,'img/fr8.webp'),quality=90,method=6)
