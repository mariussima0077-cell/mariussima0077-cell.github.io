"""Torque Empire – player simulation (Claude test tool, NOT part of the game). v16-39 result: free 60 days = 7-7, paid = 7-19.
Runs the REAL game (copy of the repo) in headless Chrome with a fake clock:
each day = 2 h played (garage running + campaign battles) + 22 h offline (idle chest at next login).
usage: python3 tools/sim_player.py <free|paid> <days> <out.json>
"""
import asyncio, json, os, re, shutil, subprocess, sys, time
from playwright.async_api import async_playwright

MODE, DAYS, OUT = sys.argv[1], int(sys.argv[2]), sys.argv[3]
SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DST = f'/tmp/te_sim_{MODE}'
shutil.rmtree(DST, ignore_errors=True)
shutil.copytree(SRC, DST, ignore=shutil.ignore_patterns('.git', 'sheets', 'preregister'))
p = DST + '/battle.js'; s = open(p).read()
s = s.replace("window.CAMPAIGN={",
  "window.__BT={roleOf,simRun,finish,bestTeam,myMechs,autoPlan,equip,GR,GSLOT,gsummon,GSD,STAGES,NST,REWARD,pow,teamPower,heroOf,cleanGear,upCost,gMax,itemById,getB:()=>B,sLabel,CHAP};window.CAMPAIGN={",1)
open(p, 'w').write(s)
p = DST + '/index.html'; s = open(p).read()
i = s.rindex('})();\n</script>'); s = s[:i] + 'window.__EV=c=>eval(c);\n' + s[i:]; open(p, 'w').write(s)
# cloud / guard servers are not reachable here → harmless, but keep the page quiet
CLOCK = """
(()=>{const RD=Date,T0=RD.UTC(2026,10,16,7,0,0);let off=0;window.__adv=ms=>{off+=ms;};window.__now=()=>T0+off;
 class FD extends RD{constructor(...a){if(a.length===0)super(T0+off);else super(...a);} static now(){return T0+off;}}
 FD.UTC=RD.UTC;FD.parse=RD.parse;window.Date=FD;})();
"""

BOT = r"""
window.__BOT={
 log:[],
 setup(paid){
   if(paid){PK.car=true;PK.vip=true;PK.spd2=true;PK.sub=Date.now()+400*864e5;try{savePacks();}catch(e){}try{vipRefresh();}catch(e){}}
   // the one-time mail gifts every player gets
   for(const m of MAIL)if(m.g&&!G.ml.c.includes(m.id)){giveRw(m.g);G.ml.c.push(m.id);}
   save();
 },
 run(sec){ // garage running for sec game-seconds (fake clock moves with it)
   let left=sec;while(left>0){const s=Math.min(.05,left);update(s);__adv(s*1000);left-=s;}
 },
 bestUpgrade(){ // cheapest affordable building step, buildings first opened by reputation
   let best=null;for(const id in BLD){const B=BLD[id];if(!B.cost||NOUP(id))continue;const lv=G.lv[id];if(lv>=MAXLV||G.rep<(B.rep||0))continue;
     const c=costOf(id,lv);if(c<=G.money&&(!best||c<best.c))best={id,c};}
   return best;},
 buyAll(){let n=0,spent=0;for(let k=0;k<60;k++){const b=this.bestUpgrade();if(!b)break;sel=b.id;$('shBtn').onclick();n++;spent+=b.c;(this.up=this.up||[]).push([Math.round((Date.now()-1794812400000)/36e5*10)/10,b.id,G.lv[b.id],b.c]);}sel=null;try{closePanel();}catch(e){}return n;},
 gearUp(){ // balanced player: half of the money goes to gear levels of the battle team (cheapest step first)
   const T=__BT,g=T.GR();let budget=G.money*.5,n=0;
   for(let k=0;k<400;k++){let best=null;for(const id of G.cp.team||[]){const eq=g.eq[id];if(!eq)continue;for(const s in eq){const it=T.itemById(eq[s]);if(!it||it.lv>=T.gMax(it))continue;const c=T.upCost(it);if(!best||c<best.c)best={it,c};}}
     if(!best||best.c>budget)break;G.money-=best.c;budget-=best.c;best.it.lv++;n++;}
   if(n)save();return n;},
 team(){ // like a real player: best tank (Bruiser/Legend) + best Medic, then the strongest others
   const T=__BT,L=T.myMechs(),out=[];const take=f=>{const h=L.find(x=>!out.includes(x.id)&&f(T.roleOf(x)));if(h)out.push(h.id);};
   take(r=>r==='engine'||r==='all');take(r=>r==='service');for(const h of L){if(out.length>=5)break;if(!out.includes(h.id))out.push(h.id);}
   let k=0;while(out.length<5)out.push('crew'+(k++));return out;},
 daily(){
   try{dqCheck();}catch(e){}
   // check-in (5000 free summons)
   try{xpOpen('ci');const g=$('ciGo');if(g)g.onclick();xpClose();}catch(e){this.log.push('ci '+e);}
   // idle chest
   try{claimIdle();}catch(e){this.log.push('idle '+e);}
 },
 quests(){try{openDQ();const a=document.querySelector('.dqAll');if(a)a.click();closeDQ();}catch(e){this.log.push('dq '+e);}},
 summons(){const r={m:0,c:0,g:0,dm:0};
   while(G.h.tk>=10){G.h.tk-=10;summon('m',11);r.m+=11;}
   while(G.h.tk>=1){G.h.tk-=1;summon('m',1);r.m++;}
   while((G.dm||0)>=1000){G.dm-=1000;summon('m',11);r.m+=11;r.dm+=1000;}
   while(G.h.ct>=10){G.h.ct-=10;summon('c',11);r.c+=11;}
   while(G.h.ct>=1){G.h.ct-=1;summon('c',1);r.c++;}
   const g=__BT.GSD();while(g.tk>=10){try{__BT.gsummon(10);}catch(e){this.log.push('gs '+e);break;}r.g+=11;}
   // fusion: 3 Legendary +5 mechanics -> 1 Mythic
   for(const cat of ['m','d','g']){for(;;){const Y=Object.keys(G.h.own).filter(id=>HB[id].cat===cat&&HB[id].gr===4&&G.h.own[id].s>=FUSE_S);if(Y.length<3)break;
     Y.slice(0,3).forEach(id=>{const w=whereIs(id);if(w)delete G.h.as[w];delete G.h.own[id];});gain(pick(heroesOf(cat,5)).id);r.fuse=(r.fuse||0)+1;}}
   // best places in the garage
   for(const cat of ['m','d','g']){try{const plan=autoPlan(cat);for(const k of slotsOf(cat)){if(plan[k]&&G.h.as[k]!==plan[k])assign(k,plan[k]);}}catch(e){this.log.push('as '+cat+' '+e);}}
   // battle team + gear
   const T=__BT;G.cp.team=this.team();T.cleanGear();const g2=T.GR();
   for(const id of G.cp.team){const h=HB[id];if(!h)continue;const ov=T.autoPlan(h);if(!g2.eq[h.id])g2.eq[h.id]={};for(const sl of T.GSLOT){if(ov[sl.k])T.equip(h.id,ov[sl.k]);}}
   try{closePop&&closePop();}catch(e){}
   document.querySelectorAll('.open').forEach(e=>{if(e.id!=='game')e.classList.remove('open');});
   save();return r;},
 battle(speed){ // one campaign battle at the next stage; returns game seconds used (real time = t/speed)
   const T=__BT,si=G.cp.best;if(si>=T.NST)return null;const list=this.team().map(T.heroOf);
   const r=T.simRun(si,list,600);const B=T.getB();B.sim=0;try{T.finish(r.win);}catch(e){this.log.push('fin '+e);}
   try{document.querySelectorAll('.open').forEach(e=>{if(e.id!=='game')e.classList.remove('open');});window.__BATTLE_ON=false;}catch(e){}
   return {win:r.win,t:r.t,si};},
 state(){const own=G.h.own,gr=[0,0,0,0,0,0];for(const id in own){const h=HB[id];if(h&&h.cat==='m')gr[h.gr]++;}
   const team=this.team().map(id=>id.startsWith('crew')?'crew':HB[id].n+' '+['C','U','R','E','L','M'][HB[id].gr]+'+'+own[id].s);
   let lv=0,lvMax=0,n=0;for(const id in BLD){if(!BLD[id].cost||NOUP(id))continue;lv+=G.lv[id];n++;lvMax+=MAXLV;}
   return {money:Math.round(G.money),rep:G.rep,vip:VLV,stage:G.cp.best,label:G.cp.best<__BT.NST?__BT.sLabel(G.cp.best):'END',
     bld:Object.fromEntries(Object.keys(BLD).filter(id=>BLD[id].cost&&!NOUP(id)).map(id=>[id,G.lv[id]])),bldSum:lv+'/'+lvMax,
     mechs:gr,team,power:Math.round(__BT.teamPower(this.team().map(__BT.heroOf))),
     dm:G.dm||0,tk:G.h.tk,sold:G.sold||0};}
};
"""

async def main():
    port = 8770 + (1 if MODE == 'paid' else 0)
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port)], cwd=DST, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1); errs = []; days = []
    paid = MODE == 'paid'; speed = 2.0 if paid else 1.5
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
            ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, service_workers='block')
            pg = await ctx.new_page()
            pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
            await pg.add_init_script(CLOCK)
            await pg.goto(f'http://127.0.0.1:{port}/')
            for _ in range(120):
                if await pg.evaluate("document.getElementById('loader').classList.contains('hide')"): break
                await pg.mouse.click(195, 760); await pg.wait_for_timeout(500)
            await pg.wait_for_timeout(1500)
            # stop drawing: the bot moves the game itself
            await pg.evaluate("window.requestAnimationFrame=()=>0;")
            await pg.wait_for_timeout(300)
            print("load errors", errs[:5], flush=True)
            await pg.evaluate("c=>__EV(c)", BOT)
            await pg.evaluate(f"__BOT.setup({'true' if paid else 'false'})")
            print('START', await pg.evaluate("JSON.stringify(__BOT.state())"), flush=True)
            if os.environ.get('DBG'):
                for h in range(4):
                    await pg.evaluate("__BOT.run(900)")
                    print('after', (h+1)*15, 'min', await pg.evaluate("__EV(\"JSON.stringify({m:Math.round(G.money),rep:G.rep,xp:G.xp,sold:G.sold,lv:G.lv})\")"), flush=True)
                return
            t0 = time.time()
            for d in range(1, DAYS + 1):
                await pg.evaluate("__BOT.daily()")
                sm = await pg.evaluate("__BOT.summons()")
                bt_budget = 2 * 3600.0          # 2 h played
                wins = losses = 0; fails = 0; bt_time = 0.0
                # play: garage runs the whole 2 h; battles are fought in between (AUTO NEXT), max 3 losses a day
                played = 0.0
                while played < bt_budget:
                    chunk = 300.0
                    await pg.evaluate(f"__BOT.run({chunk})"); played += chunk
                    await pg.evaluate("__BOT.buyAll()")
                    await pg.evaluate("__BOT.gearUp()")
                    await pg.evaluate("__BOT.quests()")
                    # battles during these 5 min (time of the fights at battle speed + 6 s between)
                    used = 0.0
                    while fails < 3 and used < chunk:
                        r = await pg.evaluate(f"__BOT.battle({speed})")
                        if not r: break
                        used += r['t'] / speed + 6
                        if r['win']: wins += 1
                        else:
                            losses += 1; fails += 1
                            await pg.evaluate("__BOT.summons()")
                    bt_time += used
                await pg.evaluate("__BOT.quests()")
                sm2 = await pg.evaluate("__BOT.summons()")
                st = await pg.evaluate("__BOT.state()")
                st.update(day=d, wins=wins, losses=losses, battle_min=round(bt_time / 60), summons={k: sm.get(k, 0) + sm2.get(k, 0) for k in set(sm) | set(sm2)})
                days.append(st)
                print(f"[{MODE}] day {d}: stage {st['label']} rep {st['rep']} vip {st['vip']} bld {st['bldSum']} money {st['money']} power {st['power']} mechs {st['mechs']} ({time.time()-t0:.0f}s)", flush=True)
                json.dump(dict(mode=MODE, days=days, errors=errs[:20], log=await pg.evaluate('__BOT.log.slice(0,30)'), up=await pg.evaluate('__BOT.up||[]')), open(OUT, 'w'), indent=1)
                # offline until tomorrow (22 h)
                await pg.evaluate("__adv(22*3600*1000)")
            await b.close()
    finally:
        srv.terminate()
    print('errors', errs[:10])

asyncio.run(main())
