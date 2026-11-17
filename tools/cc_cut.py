# v16-61: Marius' CLASSIC COLLECTION pictures (kit on green + showroom background) -> img/cc/
# kit: header "CLASSIC COLLECTION" · MY GARAGE on/off · DEALER on/off · empty car card frame
import sys,os,numpy as np;sys.path.insert(0,os.path.dirname(__file__))
from ui2_key import key3
from PIL import Image
from scipy import ndimage
S=os.path.join(os.path.dirname(__file__),'../img/sheets/cc/');O=os.path.join(os.path.dirname(__file__),'../img/cc/')
os.makedirs(O,exist_ok=True)
def sv(im,n,w=None,q=88):
    if w and im.size[0]>w:
        k=w/im.size[0];im=im.resize((round(im.size[0]*k),round(im.size[1]*k)),Image.LANCZOS)
    im.save(O+n+'.webp',quality=q,method=6);return im.size
im=key3(Image.open(S+'cc_kit.png'));W,H=im.size
a=np.asarray(im)[...,3]>40;lab,n=ndimage.label(ndimage.binary_dilation(a,iterations=3))
bs=[(s[1].start,s[0].start,s[1].stop,s[0].stop) for s in ndimage.find_objects(lab)]
bs=[b for b in bs if (b[2]-b[0])*(b[3]-b[1])>20000]
pad=lambda b,p:(max(0,b[0]-p),max(0,b[1]-p),min(W,b[2]+p),min(H,b[3]+p))
head=min(bs,key=lambda b:b[1]);card=max(bs,key=lambda b:b[3]-b[1])
tabs=sorted([b for b in bs if b not in(head,card)],key=lambda b:b[1])
print(len(bs),head,card,tabs)
print('head',sv(im.crop(pad(head,3)),'head',900))
print('card',sv(im.crop(pad(card,3)),'card',420))
for b,nm in zip(tabs,['tg1','tg0','td1','td0']):print(nm,sv(im.crop(pad(b,3)),nm,420))
print('bg',sv(Image.open(S+'cc_bg.png').convert('RGB'),'bg',None,82))
