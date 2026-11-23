import sys
from PIL import Image,ImageDraw,ImageFont
R='/home/claude/mariussima0077-cell.github.io/store/'
FD='/usr/share/fonts/truetype/google-fonts/'
import os
TF=FD+('Poppins-ExtraBoldItalic.ttf' if os.path.exists(FD+'Poppins-ExtraBoldItalic.ttf') else 'Poppins-BoldItalic.ttf')
def make(base,shot,title,sub,out):
    im=Image.open(R+base).convert('RGB')
    for y in range(0,219):
        c=im.getpixel((5,y));ImageDraw.Draw(im).line([(0,y),(1079,y)],fill=c)
    sub_col=(255,200,120)
    d=ImageDraw.Draw(im)
    fs=74
    while True:
        f=ImageFont.truetype(TF,fs);w=d.textlength(title,font=f)
        if w<=1010: break
        fs-=2
    x=(1080-w)/2;y=137-f.getbbox(title)[3]+ (0)
    # baseline so caps bottom ~137
    bb=f.getbbox(title);y=137-bb[3]
    d.text((x+5,y+5),title,font=f,fill=(0,0,0))
    d.text((x,y),title,font=f,fill=(255,255,255))
    f2=ImageFont.truetype(FD+'Poppins-Medium.ttf',36);w2=d.textlength(sub,font=f2);b2=f2.getbbox(sub)
    d.text(((1080-w2)/2,204-b2[3]),sub,font=f2,fill=sub_col)
    s=Image.open(shot).convert('RGB').resize((754,1632),Image.LANCZOS)
    m=Image.new('L',(754,1632),0);ImageDraw.Draw(m).rounded_rectangle((0,0,753,1631),radius=24,fill=255)
    im.paste(s,(163,236),m)
    im.save(R+out)
if __name__=='__main__':
    make(*sys.argv[1:6])
