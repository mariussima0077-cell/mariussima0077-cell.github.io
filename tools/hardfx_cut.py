# v16-138: Marius' HARD MODE fx (fire ring under the feet + ember aura behind) → img/fx/hm_ring.webp, hm_aura.webp
# green screen out with un-mixing (fire/smoke stays semi-transparent), cells trimmed to the same box, 8 frames in one row
import numpy as np, sys
from PIL import Image
def key(im):
    # fire is red/orange/yellow: its green part is about c×red (c grows for yellow-white cores, where blue is high).
    # Whatever green is ABOVE c×red comes from the green screen → that gives the alpha (smoke stays red, not olive).
    a=np.asarray(im.convert('RGB')).astype(np.float32)/255
    r,g,b=a[...,0],a[...,1],a[...,2];G=0.99
    c=np.clip(0.5+0.5*b/np.maximum(r,1e-3),0.5,1.0)
    al=np.clip(1-np.clip(g-c*r,0,1)/G,0,1)
    al=np.where(r>0.92,np.maximum(al,0.9),al)
    al0=np.maximum(al,1e-3);gf=np.clip((g-(1-al)*G)/al0,0,None)
    C=np.stack([r/al0,np.minimum(gf,c*r/al0),b/al0],-1)
    al=np.clip((al-0.1)/0.9,0,1)
    C=np.clip(C,0,1)
    out=np.dstack([C*255,al*255]).astype(np.uint8)
    return Image.fromarray(out,'RGBA')
def cut(src,cols,rows,dst,cw):
    im=key(Image.open(src));W,H=im.size;w,h=W/cols,H/rows
    cells=[im.crop((round(c*w),round(r*h),round((c+1)*w),round((r+1)*h))) for r in range(rows) for c in range(cols)]
    bb=[c.getchannel('A').point(lambda v:255 if v>10 else 0).getbbox() for c in cells]
    x0=min(b[0] for b in bb);y0=min(b[1] for b in bb);x1=max(b[2] for b in bb);y1=max(b[3] for b in bb)
    cells=[c.crop((x0,y0,x1,y1)) for c in cells];k=cw/(x1-x0);ch=round((y1-y0)*k)
    sheet=Image.new('RGBA',(cw*8,ch))
    for i,c in enumerate(cells):sheet.paste(c.resize((cw,ch),Image.LANCZOS),(i*cw,0))
    sheet.save(dst,'WEBP',quality=82,method=6);print(dst,cw,ch,'src box',x0,y0,x1,y1)
D='/home/claude/mariussima0077-cell.github.io/'
cut(D+'img/sheets/hardfx/ring_src.png',2,4,D+'img/fx/hm_ring.webp',300)
cut(D+'img/sheets/hardfx/aura_src.png',4,2,D+'img/fx/hm_aura.webp',200)
