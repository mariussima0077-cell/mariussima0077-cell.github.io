# v16-62: Marius' general WORLD BOSS banner (silhouette boss, img/sheets/wb/banner2.webp) -> img/wb/m_boss.webp (Battle Hub tab)
# + TOW SERPENT sheet: python3 tools/atlas_mon.py img/sheets/wb/tow.webp tow 1 norm   (norm = every row scaled to the idle size)
import sys,os;sys.path.insert(0,os.path.dirname(__file__))
from ui2_key import key3
from ui5_cut_lib import pad
from PIL import Image
D=os.path.join(os.path.dirname(__file__),'..')
im=key3(Image.open(D+'/img/sheets/wb/banner2.webp'));W,H=im.size
c=im.crop(pad((4,354,1529,700),3,W,H));c=c.crop(c.getbbox())
k=1100/c.size[0];c=c.resize((1100,round(c.size[1]*k)),Image.LANCZOS)
c.save(D+'/img/wb/m_boss.webp',quality=88,method=6);print('m_boss',c.size)
