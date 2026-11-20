# v16-100: TEAM page – Marius' new picture moved every panel a little (the game's buttons sit on the old positions)
# -> keep the old img/team.webp and take ONLY the new 4th tab (Essence crystal + arrow = LEVEL UP) from his picture;
# the bottom banner said "only from Fusion" (Fusion is closed) -> repainted "only from Summon"
import os
from PIL import Image,ImageDraw,ImageFont,ImageFilter
import numpy as np
D=os.path.dirname(__file__)+'/../';S=D+'img/sheets/ui9/'
old=Image.open(S+'team_old.webp' if os.path.exists(S+'team_old.webp') else D+'img/team.webp').convert('RGB')
if not os.path.exists(S+'team_old.webp'):old.save(S+'team_old.webp',quality=95,method=6)
new=Image.open(S+'team.webp').convert('RGB')
tab=new.crop((771,175,993,246)).resize((231,71),Image.LANCZOS)
m=Image.new('L',tab.size,0);ImageDraw.Draw(m).rounded_rectangle((0,0,230,70),12,fill=255);m=m.filter(ImageFilter.GaussianBlur(1.2))
old.paste(tab,(775,181),m)
# banner text
d=ImageDraw.Draw(old);x0,y0,x1,y1=502,1446,759,1492
reg=np.asarray(old.crop((x0,y0,x1,y1))).astype(float)
# fill with the plain banner colour sampled just left of the text (row-wise)
col=np.asarray(old.crop((x0-8,y0,x0-2,y1))).astype(float).mean(1,keepdims=True)
old.paste(Image.fromarray(np.repeat(col,x1-x0,1).astype(np.uint8)),(x0,y0))
F=ImageFont.truetype('/usr/share/fonts/truetype/google-fonts/ofl/montserrat/Montserrat-Italic[wght].ttf',25)
try:F.set_variation_by_name('ExtraBold Italic')
except Exception as e:print(e)
t='only from Summon';w=d.textlength(t,font=F);tx=x0+8;ty=y0+9
L=Image.new('L',old.size,0);ImageDraw.Draw(L).text((tx,ty),t,font=F,fill=255)
O=L.filter(ImageFilter.MaxFilter(3))
old.paste((20,12,0),(0,0),O)
gr=np.zeros((old.size[1],old.size[0],3),np.uint8);yy=np.arange(old.size[1])[:,None]
k=np.clip((yy-ty-6)/40,0,1);gr[...,0]=255;gr[...,1]=(236-90*k).astype(np.uint8)[:, :1];gr[...,2]=(120-110*k).astype(np.uint8)[:, :1]
old.paste(Image.fromarray(gr),(0,0),L)
old.save(D+'img/team.webp',quality=90,method=6);print('team ok')
