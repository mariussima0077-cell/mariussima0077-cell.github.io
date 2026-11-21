#!/usr/bin/env python3
"""Marius' number glyphs (img/sheets/num/gold.png + dmg.png, 5x4 on chroma green) → one atlas per set
img/num/<set>.webp (every glyph 100 px tall, same baseline) + img/num/<set>.json {char:[x,y,w,h,yoff]}"""
import os, json, numpy as np
from PIL import Image
from scipy import ndimage
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SETS={'gold':['0123456789','+−×%$','KMB,.'],'dmg':['0123456789','+−KM!','C']}   # dmg row 4 = the word CRIT (one glyph "C")
def key(path):
    im=np.array(Image.open(path).convert('RGB')).astype(int); r,g,b=im[...,0],im[...,1],im[...,2]; gr=g-np.maximum(r,b)
    a=np.clip(255-(gr-40)*255/80,0,255).astype(np.uint8); g2=np.where(gr>0,np.maximum(r,b),g)
    return np.dstack([r,g2,b,a]).astype(np.uint8),a
for name,rows in SETS.items():
    out,a=key(os.path.join(R,f'img/sheets/num/{name}.png')); H,W=a.shape
    lab,n=ndimage.label(ndimage.binary_dilation(a>40,iterations=3)); sl=ndimage.find_objects(lab)
    area=ndimage.sum(np.ones_like(lab),lab,range(1,n+1)); big=[k for k in range(n) if area[k]>600]
    boxes=[[sl[k][0].start,sl[k][0].stop,sl[k][1].start,sl[k][1].stop] for k in big]
    # rows by vertical centre
    rh=H/4; grid=[[] for _ in range(4)]
    for b in boxes: grid[min(3,int(((b[0]+b[1])/2)//rh))].append(b)
    chars=[]; 
    flat=''.join(rows[0][:5])+rows[0][5:]  # digits split over 2 rows in the sheet
    order=[rows[0][:5],rows[0][5:],rows[1],rows[2]]
    for ri,row in enumerate(grid):
        row.sort(key=lambda b:b[2])
        if name=='dmg' and ri==3:   # CRIT = all pieces of the last row together
            row=[[min(b[0] for b in row),max(b[1] for b in row),min(b[2] for b in row),max(b[3] for b in row)]]
        assert len(row)==len(order[ri]),(name,ri,len(row),order[ri])
        for ch,b in zip(order[ri],row): chars.append((ch,b))
    # row band (cap height) per sheet row: the digits' tallest box sets the scale + baseline
    DH=sorted(b[1]-b[0] for ch,b in chars if ch.isdigit())[5]; S=100/max(b[1]-b[0] for ch,b in chars if ch.isdigit())
    base={ri:max(b[1] for ch,b in chars if ch in order[ri] and (ch.isdigit() or ch in 'KMB$%+−×!C')) for ri in range(4)}
    tiles=[];meta={}
    x=0
    for ch,b in chars:
        ri=next(i for i in range(4) if ch in order[i]); t=Image.fromarray(out[b[0]:b[1],b[2]:b[3]])
        k=S*(DH/(b[1]-b[0]) if ch in 'KMB$%!' else 1)   # letters / $ / % were drawn smaller in the sheet → as tall as the digits
        t=t.resize((max(1,round(t.width*k)),max(1,round(t.height*k))),Image.LANCZOS)
        yoff=round((b[1]-base[ri])*S)   # >0: goes below the baseline (comma)
        tiles.append((ch,t,yoff))
    AW=sum(t.width+4 for _,t,_ in tiles); AH=max(t.height for _,t,_ in tiles)
    atlas=Image.new('RGBA',(AW,AH),(0,0,0,0))
    for ch,t,yoff in tiles:
        atlas.alpha_composite(t,(x,0)); meta[ch]=[x,0,t.width,t.height,yoff]; x+=t.width+4
    atlas.save(os.path.join(R,f'img/num/{name}.webp'),quality=90,method=6)
    json.dump(meta,open(os.path.join(R,f'img/num/{name}.json'),'w'))
    print(name,atlas.size,{k:v[2:] for k,v in list(meta.items())[:3]})
