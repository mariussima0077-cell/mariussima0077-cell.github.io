#!/usr/bin/env python3
"""Torque Empire – ENDGAME CALCULATOR (v16-161, Marius 22 nov 2026). For Claude's checks, NOT part of the game.

What it does (1-2 minutes, headless Chrome on a COPY of the repo with the full test account):
  1. measures the STRONGEST POSSIBLE TEAM (5 best heroes at their max: Lv 300 + 14 ascensions, max stars / Awakened V,
     a full ASCENDED ★20 class set, every garage LV 100, both hero collections complete),
  2. measures 2 normal teams (mid-game and strong) – the same copies / levels before and after a change,
  3. measures the FINALS: campaign NORMAL 1500, HARD 1500, Torque Tower 500, the hardest Class Tower 500, Dungeons floor 30 (+ floors 31-100, v16-179),
  4. proposes the EG values (battle.js `const EG=…`, the ENDGAME RAMP) so the finals stay above the max:
        NORMAL 1500 = 0.69 × max · HARD 1500 = 1.5 × max · Torque Tower 500 = 1.03 × max · Class Towers 500 = 0.63 × max
     (Marius 22 nov: 60 / 130 / 90 / 55 M when the max was ~87 M). Only campaign 1000-1500 and towers 300-500 change.

Usage:
  python3 tools/endgame.py                      # report for this repo
  python3 tools/endgame.py --apply              # + write the new EG values into battle.js
  python3 tools/endgame.py --compare /path/old  # + the same report for an older copy (before / after table)
After --apply: run tools/ept_table.py (anti-cheat table of the server) and the usual tests.
"""
import argparse, asyncio, json, os, re, shutil, socket, subprocess, sys, tempfile

RATIO = {'camp': 0.69, 'hard': 1.5, 'tw': 1.03, 'ct': 0.63}
RATIO2 = {'camp': 1.0, 'hard': 2.0}   # v16-203: the finals at stage 2250 (30 stages per chapter) – EG2 ramp 1500-2250
HOOK = ("window.__PW={ep:enemyPower,tw:twPower,ct:ctPower,dg:dgPower,tp:()=>teamPower(curTeamList()),pw:h=>pow(h),"
        "hm:v=>{HM=v?1:0;},ni:newItem,eqp:equip,GSLOT,GMAXR,rol:h=>roleOf(h),SETS,hof:id=>heroOf(id),gr:GR,"
        "EG:typeof EG!=='undefined'?EG:null,EG2:typeof EG2!=='undefined'?EG2:null,CT_K,DGK:DG_K,NST};")

PAGE_JS = r"""async()=>{const P=__PW,T=__TE,G=T.G,g=P.gr(),out={};
 let seed=12345;const R0=Math.random;Math.random=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
 const own=id=>G.h.own[id]||(G.h.own[id]={s:0,lv:1,a:0});
 const mech=T.HEROES.filter(h=>h.cat==='m'&&!h.soon);
 const maxS=h=>T.hMaxS?T.hMaxS(h):(h.gr===5?20:50);
 const dress=(ids,r,sr,lv)=>{g.eq={};g.inv=[];ids.forEach(id=>{const h=P.hof(id);P.GSLOT.forEach(sl=>{const it=P.ni(sl.k,r,P.SETS[P.rol(h)]?P.rol(h):'all');it.lv=lv||P.GMAXR[r];it.sr=sr;
   if(r>=6)for(let k=5;k<sr;k++){if((k+1)%5===0){const ks=['crit','aspd','en','atk','hp','def'].filter(q=>!it.sub.some(z=>z[0]===q));if(ks.length)it.sub.push([ks[0],0]);}}
   g.inv.push(it);P.eqp(id,it);});});};
 const team=ids=>{G.cp.team=ids.slice(0,5);};
 const lv=(n,a)=>mech.forEach(h=>{const o=own(h.id);o.lv=n;o.a=a;});
 // ---- MAX
 for(const k in G.lv)G.lv[k]=100;
 mech.forEach(h=>{const o=own(h.id);o.s=maxS(h);G.h.disc[h.id]=1;});lv(300,14);
 g.eq={};const best=mech.slice().sort((a,b)=>P.pw(b)-P.pw(a)).slice(0,5).map(h=>h.id);team(best);dress(best,6,20);
 out.max=P.tp();out.maxTeam=best.map(id=>T.HB[id].n);
 // ---- MID-GAME: 5 Epic +10, Lv 100 (asc 4), Legendary gear ★0 Lv 40, garages LV 20, Legendary +2 / Mythic none
 const ep=mech.filter(h=>h.gr===3).slice(0,5).map(h=>h.id);mech.forEach(h=>{const o=own(h.id);o.s=h.gr===3?10:h.gr===4?2:0;});
 mech.filter(h=>h.gr===5).forEach(h=>{delete G.h.own[h.id];});lv(100,4);for(const k in G.lv)G.lv[k]=20;team(ep);dress(ep,4,0,40);out.mid=P.tp();
 // ---- STRONG: 3 Legendary +10 + 2 Mythic with 2 copies, Lv 250 (asc 12), Mythic gear ★3, garages LV 60
 const lg=mech.filter(h=>h.gr===4).slice(0,3).map(h=>h.id),my=mech.filter(h=>h.gr===5).slice(0,2).map(h=>h.id);
 mech.forEach(h=>{const o=own(h.id);o.s=h.gr===4?10:h.gr===5?2:h.gr===3?20:30;});lv(250,12);for(const k in G.lv)G.lv[k]=60;team([...lg,...my]);dress([...lg,...my],5,3);out.strong=P.tp();
 // ---- FINALS
 const I5=Math.min(1499,P.NST-1);P.hm(0);out.camp=P.ep(I5);out.camp2=P.ep(P.NST-1);P.hm(1);out.hard=P.ep(I5);out.hard2=P.ep(P.NST-1);P.hm(0);
 out.tw=P.tw(500);out.ct={};P.CT_K.forEach(k=>out.ct[k]=P.ct(k,500));out.dg={};P.DGK.forEach(k=>out.dg[k]=P.dg(k,30));out.dg100=[31,40,50,60,70,80,90,100].map(f=>Math.max(...P.DGK.map(k=>P.dg(k,f))));
 out.EG=P.EG?Object.assign({},P.EG):null;out.EG2=P.EG2?Object.assign({},P.EG2):null;out.NST=P.NST;Math.random=R0;return out;}"""


def free_port():
    s = socket.socket(); s.bind(('', 0)); p = s.getsockname()[1]; s.close(); return p


def prep(repo):
    root = tempfile.mkdtemp(prefix='te_eg_')
    shutil.copytree(repo, root, dirs_exist_ok=True, ignore=shutil.ignore_patterns('.git', 'store', 'server', 'img/sheets'))
    sp = os.path.join(root, 'secure.js'); s = open(sp).read()
    s = re.sub(r'^const TEST_MODE = .*$', 'const TEST_MODE = true;', s, flags=re.M)
    s = re.sub(r'^const TEST_ACC = .*$', 'const TEST_ACC = true;', s, flags=re.M); open(sp, 'w').write(s)
    bp = os.path.join(root, 'battle.js'); b = open(bp).read()
    if 'window.__PW=' not in b:
        b = b.replace('if(window.SEC&&SEC.TEST_MODE)window.__DEV=', HOOK + 'if(window.SEC&&SEC.TEST_MODE)window.__DEV=', 1); open(bp, 'w').write(b)
    return root


async def measure(repo):
    from playwright.async_api import async_playwright
    root = prep(repo); port = free_port()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port)], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
            pg = await b.new_page(viewport={'width': 360, 'height': 800}); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.add_init_script("try{localStorage.setItem('te_tacc',localStorage.getItem('te_tacc')||'')}catch(e){}")
            await pg.goto(f'http://localhost:{port}/'); await pg.wait_for_timeout(9000)
            if not await pg.evaluate("()=>!!(window.__PW&&window.__TE&&__TE.G)"):
                await pg.wait_for_timeout(6000)
            r = await pg.evaluate(PAGE_JS); r['errors'] = errs
            await b.close(); return r
    finally:
        srv.kill(); shutil.rmtree(root, ignore_errors=True)


M = lambda v: f'{v/1e6:,.1f} M' if v >= 1e6 else f'{v/1e3:,.0f} K'


def report(name, r):
    ct = max(r['ct'].values())
    print(f"\n== {name} ==")
    print(f"  strongest team (max)   {M(r['max'])}   {', '.join(r['maxTeam'])}")
    print(f"  strong team            {M(r['strong'])}   (3 Legendary +10, 2 Mythic 2 copies, Lv 250, Mythic gear ★3)")
    print(f"  mid-game team          {M(r['mid'])}   (5 Epic +10, Lv 100, Legendary gear ★0)")
    print(f"  campaign NORMAL 1500   {M(r['camp'])}  = {r['camp']/r['max']:.2f} × max")
    print(f"  campaign HARD 1500     {M(r['hard'])}  = {r['hard']/r['max']:.2f} × max")
    if r.get('camp2'): print(f"  campaign NORMAL {r['NST']}   {M(r['camp2'])}  = {r['camp2']/r['max']:.2f} × max\n  campaign HARD {r['NST']}     {M(r['hard2'])}  = {r['hard2']/r['max']:.2f} × max")
    print(f"  Torque Tower 500       {M(r['tw'])}  = {r['tw']/r['max']:.2f} × max")
    print(f"  Class Towers 500 (max) {M(ct)}  = {ct/r['max']:.2f} × max")
    print(f"  Dungeons floor 30      {M(min(r['dg'].values()))} – {M(max(r['dg'].values()))}")
    print('  Dungeons 31..100', [M(x) for x in r.get('dg100',[])])
    if r.get('EG'): print(f"  EG now                 {r['EG']}")
    if r['errors']: print('  ERRORS:', r['errors'][:5])


def propose(r):
    e = r['EG'] or {'camp': 1, 'hard': 1, 'tw': 1, 'ct': 1}; mx = r['max']; ct = max(r['ct'].values())
    camp = RATIO['camp'] * mx / (r['camp'] / e['camp'])
    hard = RATIO['hard'] * mx / (r['hard'] / (e['camp'] * e['hard']) * camp)
    tw = RATIO['tw'] * mx / (r['tw'] / e['tw']); cc = RATIO['ct'] * mx / (ct / e['ct'])
    out = {k: round(max(.5 if k == 'hard' else 1, v), 3) for k, v in (('camp', camp), ('hard', hard), ('tw', tw), ('ct', cc))}  # hard may go below 1: HARD = NORMAL × 2.5 already
    e2 = r.get('EG2')
    if e2 and r.get('NST', 0) > 1500:   # v16-203: EG2 = the ramp 1500 → NST on top of EG (the stage 1500 values do not change)
        c2 = RATIO2['camp'] * mx / (r['camp2'] / e2['camp'] / e['camp'] * out['camp'])
        h2 = RATIO2['hard'] * mx / (r['hard2'] / (e2['camp'] * e2['hard'] * e['camp'] * e['hard']) * out['camp'] * out['hard'] * c2)
        out['eg2'] = {'camp': round(max(1, c2), 3), 'hard': round(max(.5, h2), 3)}
    return out


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--repo', default='.'); ap.add_argument('--apply', action='store_true'); ap.add_argument('--compare', default='')
    a = ap.parse_args(); repo = os.path.abspath(a.repo)
    res = {}
    if a.compare: res['before'] = asyncio.run(measure(os.path.abspath(a.compare))); report('BEFORE (' + a.compare + ')', res['before'])
    res['now'] = asyncio.run(measure(repo)); report('NOW', res['now'])
    eg = propose(res['now']); print('\n  proposed EG', eg, '→ finals:', {k: M(RATIO[k] * res['now']['max']) for k in RATIO})
    if a.apply:
        bp = os.path.join(repo, 'battle.js'); s = open(bp).read()
        line = 'const EG={camp:%g,hard:%g,tw:%g,ct:%g}; // EG-LINE (written by tools/endgame.py)' % (eg['camp'], eg['hard'], eg['tw'], eg['ct'])
        s2 = re.sub(r'const EG=\{[^}]*\}; // EG-LINE \(written by tools/endgame\.py\)', line, s)
        assert s2 != s or line in s, 'EG line not found'
        if 'eg2' in eg:
            l2 = 'const EG2={camp:%g,hard:%g}; // EG2-LINE (written by tools/endgame.py)' % (eg['eg2']['camp'], eg['eg2']['hard'])
            s2 = re.sub(r'const EG2=\{[^}]*\}; // EG2-LINE \(written by tools/endgame\.py\)', l2, s2); print('  written:', l2)
        open(bp, 'w').write(s2); print('  written:', line)
    json.dump(res, open('/tmp/endgame.json', 'w'), indent=1)


if __name__ == '__main__':
    main()
