# v16-212 ARENA SHOP + ARENA MILESTONES pictures (Marius, 23 nov 2026) – green key like rw_cut.py
import sys,shutil,numpy as np
from PIL import Image
from scipy import ndimage
U='/mnt/user-data/uploads/';S='img/sheets/arshop/';O='img/arena/'
F={'bar':'a7d95afe','card':'13625897','chest':'441d3ecc','title':'3635e6af','medal':'e63985ca'}
def key(im):
  a=np.asarray(im.convert('RGB')).astype(np.float32);r,g,b=a[...,0],a[...,1],a[...,2]
  d=np.sqrt(r*r+(255-g)**2+b*b);al=np.clip((d-70)/70,0,1)
  m=np.maximum(r,b);g2=np.where((al<1)&(g>m),m+(g-m)*.3,g)
  lab,n=ndimage.label(al>.1);sz=ndimage.sum(np.ones_like(al),lab,range(1,n+1));big=max(sz) if n else 0
  for i,z in enumerate(sz,1):
    if z<big*.004:al[lab==i]=0
  return Image.fromarray(np.dstack([r,g2,b,al*255]).clip(0,255).astype(np.uint8),'RGBA')
def crop(o):return o.crop(o.getchannel('A').point(lambda v:255 if v>30 else 0).getbbox())
def fit(o,w=None,h=None):
  if w:return o.resize((w,round(o.height*w/o.width)),Image.LANCZOS)
  return o.resize((round(o.width*h/o.height),h),Image.LANCZOS)
def sv(o,n,q=90):o.save(O+n+'.webp','WEBP',quality=q,method=6);print(n,o.size)
for k,f in F.items():shutil.copy(U+f+'-image.png',S+k+'_src.png')
sv(fit(crop(key(Image.open(S+'medal_src.png'))),256),'am_medal')
sv(fit(crop(key(Image.open(S+'title_src.png'))),900),'as_title')
sv(fit(crop(key(Image.open(S+'card_src.png'))),300),'as_card')
sv(fit(crop(key(Image.open(S+'bar_src.png'))),900),'am_bar')
ch=key(Image.open(S+'chest_src.png'));al=np.asarray(ch.getchannel('A'))>30;cols=al.any(0)
xs=np.where(cols)[0];gaps=[];prev=xs[0];start=xs[0]
for x in xs[1:]:
  if x-prev>8:gaps.append((start,prev));start=x
  prev=x
gaps.append((start,prev));gaps=sorted(gaps,key=lambda g:g[1]-g[0])[-3:];gaps.sort()
for i,(a,b) in enumerate(gaps):sv(fit(crop(ch.crop((a,0,b+1,ch.height))),256),'am_chest'+str(i))
