# v16-49: cuts Marius' 20 UI sheets (img/sheets/ui3, green background) into img/ui3/*.webp
import sys,os,numpy as np;sys.path.insert(0,os.path.dirname(__file__))
from ui2_key import key2,key3,bbox
from PIL import Image
from scipy import ndimage
S=os.path.join(os.path.dirname(__file__),'../img/sheets/ui3/');O=os.path.join(os.path.dirname(__file__),'../img/ui3/')
def parts(im,minA=2000,dil=6):
    a=np.asarray(im)[...,3]>40
    lab,n=ndimage.label(ndimage.binary_dilation(a,iterations=dil))
    out=[]
    for sl in ndimage.find_objects(lab):
        ys,xs=sl;h=ys.stop-ys.start;w=xs.stop-xs.start
        if h*w<minA:continue
        out.append((xs.start,ys.start,xs.stop,ys.stop))
    # rows then columns
    out.sort(key=lambda b:(round(((b[1]+b[3])/2)/ (im.size[1]/8)),b[0]))
    return out
def sv(im,n,w=None,q=85):
    if w and im.size[0]>w: im=im.resize((w,round(im.size[1]*w/im.size[0])),Image.LANCZOS)
    im.save(O+n+'.webp',quality=q,method=6)
def sheet(name,names,w=None,k=key3,dil=6,minA=2000,sq=False):
    im=k(Image.open(S+name+'.webp'));ps=parts(im,minA,dil)
    if len(ps)!=len(names):print('!!',name,len(ps),ps);return
    for b,n in zip(ps,names):
        c=im.crop(b)
        if sq:
            m=max(c.size);s=Image.new('RGBA',(m,m));s.paste(c,((m-c.size[0])//2,(m-c.size[1])//2));c=s
        sv(c,n,w)
def whole(name,n,w):
    im=key3(Image.open(S+name+'.webp'));sv(im.crop(bbox(im,30)),n,w)
whole('gsum','gsum_h',900);whole('camp','camp_h',900);whole('crew','crew_h',900)
whole('prep','prep',720)
sheet('ci',['ci_n','ci_c','ci_d','ci_g'],200,dil=3)
sheet('bctl',['b_pause','b_x1','b_x15','b_x2','b_aoff','b_aon'],150,dil=2)
sheet('shopic',['sp_truck','sp_vip','sp_speed','sp_crew','sp_chest','sp_dm'],200,dil=2)
sheet('vipic',['v_coins','v_sec','v_fast','v_disc','v_idle','v_sell','v_gift','v_crown','v_ticket','v_dm','v_timer','v_garage'],140,dil=2)
sheet('qic',['q_inspect','q_upg','q_repair','q_money','q_police','q_sell','q_trophy','q_ticket'],140,dil=2)
sheet('gic',['g_inspect','g_service','g_paint','g_elec','g_engine','g_tuning','g_mech','g_guard','g_driver','g_book','g_swap','g_edit'],128,dil=4,sq=True)
sheet('arena2',['ar_row','ar_fight','ar_fightg'],720,dil=3)
sheet('league',['lg0','lg1','lg2','lg3','lg4','lg5'],160,dil=2)
sheet('rank2',['rk1','rk2','rk3','rk4'],720,dil=2)
sheet('arme',['ar_me','ar_b1','ar_b2','ar_tabs'],720,dil=3)
sheet('arrow',['ar_r','ar_rme','ar_rup','ar_rdn'],720,dil=2)
sheet('nav',['n_summon','n_crew','n_upg','n_quests','n_idle'],150,dil=2)
sheet('cupf',['cup_me','cup_op','cup_po','cup_pb'],720,dil=3)
def split(name,xs,names,w,k=key3):
    im=k(Image.open(S+name+'.webp'));W=im.size[0];xs=[0]+xs+[W]
    for i,n in enumerate(names):
        c=im.crop((xs[i],0,xs[i+1],im.size[1]));c=c.crop(bbox(c,30));sv(c,n,w)
split('ci',[392,768,1135],['ci_n','ci_c','ci_d','ci_g'],200)
split('bctl',[370,728,1087,1446,1805],['b_pause','b_x1','b_x15','b_x2','b_aoff','b_aon'],150)
split('league',[282,557,852,1136,1452],['lg0','lg1','lg2','lg3','lg4','lg5'],160)
split('nav',[312,617,920,1220],['n_summon','n_crew','n_upg','n_quests','n_idle'],150)
