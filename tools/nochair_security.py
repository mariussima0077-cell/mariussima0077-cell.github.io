# remove the office chair from the Security pictures: fill the chair box with pixels shifted left/right from the empty knee space
import numpy as np, sys
from PIL import Image
from scipy import ndimage as nd
TOP={'1':(492,586,552,572),'2':(500,595,575,592),'3':(494,556,337,346),'4':(522,584,284,292)}
P={ # level: (x0,x1,y0,y1, left shift, right shift)
 '1':(480,596,570,702,-120,120),
 '2':(487,607,584,742,-80,82),
 '3':(484,566,338,412,-82,80),
 '4':(514,590,283,362,-40,44)}
def run(src,dst,lv):
  a=np.asarray(Image.open(src).convert('RGBA')).astype(float);o=a.copy()
  x0,x1,y0,y1,sl,sr=P[lv];xm=(x0+x1)//2
  for x in range(x0,x1):
    s=x+sl if x<xm else x+sr
    o[y0:y1,x]=a[y0:y1,s]
  # soft edges
  m=np.zeros(a.shape[:2]);m[y0:y1,x0:x1]=1;m=nd.gaussian_filter(m,3)[...,None]
  m=np.clip(m*1.6,0,1)
  # blend the seam in the middle
  b=o.copy();b[y0:y1,xm-6:xm+6]=nd.uniform_filter(o[y0:y1,xm-10:xm+10],(1,9,1))[:,4:16]
  r=a*(1-m)+b*m
  import cv2
  u=r.clip(0,255).astype(np.uint8);X0,X1,Y0,Y1=TOP[lv];mk=np.zeros(u.shape[:2],np.uint8);mk[Y0:Y1,X0:X1]=255
  # only the chair-back pixels (grey/dark), keep the yellow desk + items
  rgb=u[...,:3].astype(int);sat=rgb.max(2)-rgb.min(2);mk[(sat>60)]=0
  v=u.astype(float)
  mk[Y0:Y1,X0:X1]=255;mk[(sat>90)]=0  # desk band: everything not strongly yellow
  for x in range(X0,X1):
    col=mk[:,x]>0;ys=np.where(col[Y0-2:Y1+6])[0]+Y0-2
    if not len(ys):continue
    a0,a1=ys.min()-1,ys.max()+1
    for y in ys:
      t=(y-a0)/(a1-a0);v[y,x,:3]=v[a0,x,:3]*(1-t)+v[a1,x,:3]*t
  v[Y0-2:Y1+6,X0-3:X1+3]=nd.gaussian_filter(v[Y0-2:Y1+6,X0-3:X1+3],(1,2,0));r=v
  Image.fromarray(r.clip(0,255).astype(np.uint8)).save(dst,quality=92) if dst.endswith('webp') else Image.fromarray(r.clip(0,255).astype(np.uint8)).save(dst)
if __name__=='__main__':run(sys.argv[1],sys.argv[2],sys.argv[3])
