import numpy as np
from scipy import ndimage
def blobs(im,minA=3000,it=3):
    a=np.asarray(im)[...,3]>40;lab,n=ndimage.label(ndimage.binary_dilation(a,iterations=it))
    bs=[(s[1].start,s[0].start,s[1].stop,s[0].stop) for s in ndimage.find_objects(lab)]
    return [b for b in bs if (b[2]-b[0])*(b[3]-b[1])>=minA]
def rows(bs,H):
    bs=sorted(bs,key=lambda b:b[1]);out=[];cur=[]
    for b in bs:
        if cur and b[1]>max(c[3] for c in cur)-10:out.append(sorted(cur));cur=[]
        cur.append(b)
    if cur:out.append(sorted(cur))
    return out
def pad(b,p,W,H):return (max(0,b[0]-p),max(0,b[1]-p),min(W,b[2]+p),min(H,b[3]+p))
