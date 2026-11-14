# Gina Gas (d1_2): rows 4-5 are drawn ~35% closer (legs cut). Scale upper body to idle size, put the idle legs under it.
from PIL import Image;import numpy as np,sys
F=Image.open('out/full_d1_2.png');CW=384
s=float(sys.argv[1]);B0=int(sys.argv[2]);BR={4:int(sys.argv[3]),5:int(sys.argv[4])}
idle=F.crop((0,0,CW,256))
def cx(im,y):
  a=np.asarray(im)[y-12:y,:,3]>128;xs=np.where(a.any(0))[0];return (xs.min()+xs.max())/2
icx=cx(idle,B0)
legs=idle.crop((0,B0,CW,256))
for r in (4,5):
  for c in range(4):
    fr=F.crop((c*CW,r*256,(c+1)*CW,(r+1)*256))
    by=BR[r];top=fr.crop((0,0,CW,by))
    t=top.resize((round(CW*s),round(by*s)),Image.LANCZOS)
    tc=cx(top,by)*s
    out=Image.new('RGBA',(CW,256))
    out.alpha_composite(legs,(0,B0))
    out.alpha_composite(t,(round(icx-tc),B0-t.height))
    F.paste(out,(c*CW,r*256))
F.save('out/full_d1_2.png')
cw2=288;A=Image.new('RGBA',(4*cw2,6*192))
for r in range(6):
  for c in range(4):A.alpha_composite(F.crop((c*CW,r*256,(c+1)*CW,(r+1)*256)).resize((cw2,192),Image.LANCZOS),(c*cw2,r*192))
A.save('out/sp_d1_2.webp',quality=88,method=6)
