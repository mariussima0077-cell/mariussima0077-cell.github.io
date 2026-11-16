import sys,json;import os;sys.path.insert(0,os.path.dirname(__file__))
from ui2_key import *
from PIL import Image,ImageFilter
S=os.path.join(os.path.dirname(__file__),'../img/sheets/ui2/');O=os.path.join(os.path.dirname(__file__),'../img/ui2/')
def sv(im,n,q=82):im.save(O+n+'.webp',quality=q,method=6)
meta={}
# 9-slice skins: name:(x0,x1,hy,t,c0,c1,Bs,L,R)
SK={'vip':(40,985,520,80,900,915,1312,75,75),
    'shop':(50,975,380,24,636,644,1385,60,60),
    'bag':(8,1016,430,16,588,596,1360,70,70),
    'heroes':(0,941,470,70,700,710,1560,40,40),
    'mail':(0,941,230,40,700,710,1580,40,40),
    'rank':(0,941,540,40,800,810,1580,40,40),
    'chat':(0,941,230,0,230,1505,1505,40,40),
    'cup':(0,941,565,40,1250,1258,1580,40,40),
    'profile':(0,1024,610,60,1192,1222,1440,45,45)}
for n,(x0,x1,hy,t,c0,c1,Bs,L,R) in SK.items():
    im=Image.open(S+n+'.webp').convert('RGB');W,H=im.size
    if n=='bag':
        t2=im.crop((214,350,332,418)).resize((120,68));im.paste(t2,(84,350))
    hd=im.crop((x0,0,x1,hy));sv(hd,n+'_h')
    a=im.crop((x0,hy,x1,hy+t)) if t else None;b=im.crop((x0,c0,x1,c1));c=im.crop((x0,Bs,x1,H))
    hh=(t)+(c1-c0)+(H-Bs);body=Image.new('RGB',(x1-x0,hh));y=0
    for p in [a,b,c]:
        if p is None:continue
        body.paste(p,(0,y));y+=p.size[1]
    sv(body,n+'_b')
    inn=im.crop((x0+L,hy+t,x1-R,Bs)) if n not in ('shop','bag','cup','profile') else im.crop((x0+L,c0,x1-R,c1)).resize((x1-x0-L-R,Bs-hy-t));inn=inn.resize((max(8,inn.size[0]//3),max(8,inn.size[1]//3)),Image.LANCZOS);sv(inn,n+'_i',70)
    meta[n]=dict(w=x1-x0,hy=hy,t=t,m=c1-c0,b=H-Bs,L=L,R=R)
    bl=im.resize((W//8,H//8)).filter(ImageFilter.GaussianBlur(3));sv(bl,n+'_bl',60)
# full images
for n in ['salvage','equip','profile','cup','arena']:
    im=Image.open(S+n+'.webp').convert('RGB');sv(im,n+'_f',80)
it=key3(Image.open(S+'item.webp'));bb=bbox(it,30);it=it.crop(bb);sv(it,'item_f');meta['item']=dict(box=[int(v) for v in bb])
hu=key3(Image.open(S+'hud.webp'));bb=bbox(hu,30);hu=hu.crop(bb);sv(hu,'hud',85);meta['hud']=dict(box=[int(v) for v in bb])
# icons
ic=key2(Image.open(S+'icons.webp'));W,H=ic.size
names=[['coins','cash','scrap','crystal'],['forge','star1','energy','key']]
for r in range(2):
  for c in range(4):
    sub=ic.crop((c*W//4,r*H//2,(c+1)*W//4,(r+1)*H//2));x0,y0,x1,y1=bbox(sub,30)
    s=sub.crop((x0,y0,x1,y1));m=max(s.size);sq=Image.new('RGBA',(m,m));sq.paste(s,((m-s.size[0])//2,(m-s.size[1])//2))
    sv(sq.resize((128,128),Image.LANCZOS),'i_'+names[r][c],85)
# tiles from bag / shop / salvage
bag=Image.open(S+'bag.webp').convert('RGB');sv(bag.crop((90,441,252,588)),'slot')
shop=Image.open(S+'shop.webp').convert('RGB')
sv(shop.crop((640,500,884,596)),'btn_y')
sv(shop.crop((128,418,326,610)),'icbox')
row=shop.crop((104,398,916,632)).copy()
import numpy as np
A=np.asarray(row).copy();cl=A[:,300:302].mean(1,keepdims=True).astype(np.uint8)  # clean interior column
A[22:212,26:224]=cl[22:212];A[22:212,530:790]=cl[22:212]
sv(Image.fromarray(A),'row')
json.dump(meta,open(os.path.join(os.path.dirname(__file__),'ui2_meta.json'),'w'),indent=1);print(json.dumps(meta))
