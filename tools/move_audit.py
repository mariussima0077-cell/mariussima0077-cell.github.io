#!/usr/bin/env python3
"""Torque Empire – automatic movement / attack audit (Claude's test tool, not part of the game).
Runs battles step by step inside the real game (Chrome, test account) and watches every unit each frame:
running on the spot, standing next to a target without attacking, out of the picture, teleports,
facing away while attacking, NaN, units inside each other, units that never attack, draw errors."""
import asyncio, json, os, re, shutil, socket, subprocess, sys, tempfile, time

REPO = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/game'
ONLY = sys.argv[2] if len(sys.argv) > 2 else ''

HOOK = r"""
window.__T={step,render,stop:()=>{running=false;cancelAnimationFrame(raf);},get B(){return B;},MON,bw,dist,nearest,alive,
 get W(){return W;},get S(){return S;},get FY0(){return FY0;},get FY1(){return FY1;},bossXM};
"""

CHECK = r"""
(cfg)=>{const T=window.__T;T.stop();const B=T.B,S=T.S,W=T.W,F=T.FY1-T.FY0;const ev=[];const st=new Map();
 const add=(u,k,info)=>{const id=(u.hero?'H:'+u.h.id+' '+u.h.n:'M:'+u.t)+(u.boss?' (boss)':'');const key=id+'|'+k;
   const e=ev.find(x=>x.key===key);if(e){e.n++;return;}ev.push({key,id,k,n:1,info:info||'',t:+B.t.toFixed(1)});};
 const C=(u,tg)=>{const o=x=>x?{id:x.hero?x.h.id:x.t,x:Math.round(x.x),d:+x.d.toFixed(3),st:x.st,rng:Math.round(x.rng),bw:Math.round(T.bw(x)),act:x.act&&x.act.k,stun:+(x.stun||0).toFixed(2),taunt:+(x.taunt||0).toFixed(1),cd:+(x.cd||0).toFixed(2)}:null;return JSON.stringify({u:o(u),tg:o(tg),near:[...B.heroes,...B.mons].filter(v=>v!==u&&!v.dead&&Math.abs(v.x-u.x)<80*S).map(o)});};const imm=cfg.imm;const tot={};const px0=new Map();let rerr=0,rmsg='';const N=Math.round(cfg.secs*60);const seen=new Set();
 for(let f=0;f<N;f++){
  if(imm){for(const u of [...B.heroes,...B.mons])if(!u.dead){if(!u._im){u._im=1;u.max*=1e12;u.hp=u.max;}else u.hp=Math.max(u.hp,u.max*.5);}}
  for(const m of B.mons)px0.set(m,[m.x,m.st,m.act]);
  try{T.step(1/60);}catch(e){add({hero:0,t:'STEP'},'EXCEPTION step',String(e&&e.stack||e).slice(0,300));break;}
  if(f%5===0){try{T.render();}catch(e){rerr++;rmsg=String(e&&e.stack||e).slice(0,300);}}
  if(B.phase!=='fight'){if(B.phase==='win'||B.phase==='lose'){if(!cfg.endT)cfg.endT=B.t;}for(const [u,s] of st){s.ws=0;s.is=0;s.x=u.x;s.d=u.d;s.fa=0;}continue;}
  const all=[...B.heroes,...B.mons];
  for(const u of all){if(u.dead)continue;seen.add(u);let s=st.get(u);if(!s){s={x:u.x,d:u.d,ws:0,is:0,atk:0,born:B.t,ot:0,lastSt:u.st};st.set(u,s);}
   const foes=u.hero?B.mons:B.heroes;const tg=T.nearest(u,foes);
   if(!(isFinite(u.x)&&isFinite(u.d)&&isFinite(u.hp)))add(u,'NaN position/HP');
   const mv=Math.hypot(u.x-s.x,(u.d-s.d)*F);
   if(mv>60*S&&!(u.act)&&!(u.st==='dash'||u.st==='leap')&&!(u.t&&T.MON[u.t]&&T.MON[u.t].pounce)&&B.t-s.born>.2)add(u,'TELEPORT >90px',`${Math.round(mv)}px st=${u.st}`);
   // running on the spot
   if((u.st==='walk'||u.st==='run')&&mv<.15*S&&!u.act){s.ws+=1/60;if(s.ws>.3){tot.rs=(tot.rs||0)+1/60;if(s.ws<.3+1/59)add(u,'RUNS ON THE SPOT',C(u,tg));}}else s.ws=0;
   // idle next to a target, not attacking
   const busy=u.stun>0||u.act||u.st==='cast'||u.st==='atk';
   if(tg&&!busy&&u.st==='idle'&&!tg.dead){s.is+=1/60;if(s.is>3.2){add(u,'IDLE >3s WITHOUT ATTACKING',`dist=${Math.round(T.dist(u,tg))} rng=${Math.round(u.rng)} cd=${(u.cd||0).toFixed(2)} stk=${(u.stk||0).toFixed(2)} x=${Math.round(u.x)} tg=${tg.hero?tg.h.id:tg.t}@${Math.round(tg.x)}`);s.is=-1e9;}}else if(s.is>0)s.is=0;
   if(u.st==='atk'&&s.lastSt!=='atk')s.atk++;if(u.st==='cast'||u.st==='pound'||u.st==='laser'||u.st==='dash'||u.st==='leap')s.atk++;
   // facing away while attacking
   if(u.st==='atk'&&tg&&Math.abs(tg.x-u.x)>20*S&&Math.sign(tg.x-u.x)!==u.face&&!u.wbB){s.fa=(s.fa||0)+1/60;if(s.fa>.25&&s.fa<.25+1/59)add(u,'ATTACKS FACING AWAY >0.25s',`face=${u.face}`);}else s.fa=0;
   // out of the picture
   const inside=u.hero||u.in||u.b==='titan'||u.wbB;
   if(inside&&B.t-s.born>1.5&&(u.x<-2||u.x>W+2||u.d<0||u.d>1)){s.ot+=1/60;if(s.ot>.5){add(u,'OUT OF THE PICTURE',`x=${Math.round(u.x)}/${W} d=${u.d.toFixed(2)} st=${u.st}`);s.ot=-1e9;}}
   if(!u.hero&&!u.in&&B.t-s.born>5&&u.b!=='titan'&&!u.wbB)add(u,'NEVER ENTERS THE PICTURE',`x=${Math.round(u.x)}`);
   // inside each other
   if(u.hero&&!u.act)for(const m of B.mons){if(m.dead||m.act||m.wbB||m.b==='titan')continue;if(Math.abs(m.d-u.d)*F<20*S&&Math.abs(m.x-u.x)<(T.bw(u)+T.bw(m))*.45)add(u,'INSIDE A MONSTER',C(u,m));}
   if(!['idle','walk','run','atk','cast','dash','leap','pound','laser','win','dead','cdmg'].includes(u.st))add(u,'UNKNOWN ANIM STATE',u.st);
   if(!u.hero){const p=px0.get(u);if(p&&!p[2]&&!u.act&&p[1]!=='walk'&&u.st!=='walk'){tot.net=(tot.net||0)+(u.x-p[0]);}}
   s.x=u.x;s.d=u.d;s.lastSt=u.st;}
 }
 const never=[];for(const [u,s] of st){if(u.dead&&B.t-s.born<4)continue;if(B.t-s.born>8&&s.atk===0)never.push((u.hero?'H:'+u.h.id+' '+u.h.n:'M:'+u.t)+' (alive '+Math.round(B.t-s.born)+'s, '+(u.dead?'dead':'alive')+')');}
 return {tot,ev:ev.map(e=>({id:e.id,k:e.k,n:e.n,info:e.info,t:e.t})),never,rerr,rmsg,phase:B.phase,endT:cfg.endT||0,t:+B.t.toFixed(1),heroes:B.heroes.map(h=>h.h.id),mons:[...seen].filter(u=>!u.hero).map(u=>u.t).filter((v,i,a)=>a.indexOf(v)===i)};}
"""

def free_port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p

async def main(root):
    from playwright.async_api import async_playwright
    port = free_port()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port)], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1); out = []
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
            ctx = await b.new_context(viewport={'width': 360, 'height': 800}, device_scale_factor=1, is_mobile=True, has_touch=True, service_workers='block')
            pg = await ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
            await pg.goto(f'http://127.0.0.1:{port}/')
            for _ in range(160):
                try:
                    if await pg.evaluate("!!document.getElementById('loader')&&document.getElementById('loader').classList.contains('hide')&&!!window.__T"): break
                    await pg.mouse.click(180, 720)
                except Exception: pass
                await pg.wait_for_timeout(500)
            await pg.wait_for_timeout(3000)
            info = await pg.evaluate("(()=>{const HB=window.__TE.HB;return Object.keys(HB).map(k=>[k,HB[k].gr,HB[k].n,!!HB[k].crew])})()")
            mons = await pg.evaluate("Object.keys(window.__T.MON).map(k=>[k,!!window.__T.MON[k].boss,window.__T.MON[k].b||''])")
            heroes = [h for h in info if not h[3] and 'Coming soon' not in h[2]]
            scen = []
            small = [m for m, bo, _ in mons if not bo and '_' not in m]
            bosses = [m for m, bo, _ in mons if bo and '_' not in m]
            for m in small: scen.append(('mon', m, f"__DEV.towerW(['{m}','{m}','{m}','{m}'],1)", True, 20))
            for m in bosses: scen.append(('boss', m, f"__DEV.towerW(['{m}','imp','tire'],1)", True, 30))
            for w in range(4): scen.append(('wb', str(w), f"__DEV.wbSet({w});__DEV.wb()", True, 30))
            top = [h[0] for h in heroes if h[1] >= 4]
            low = [h[0] for h in heroes if h[1] < 4]
            mix = "['imp','snake','spider','brute','drone','crab']"
            for i in range(0, len(top), 5):
                ids = top[i:i+5]; scen.append(('heroes', ','.join(ids), f"__DEV.towerW({mix},1);", True, 30, ids))
            for i in range(0, len(low), 5):
                ids = low[i:i+5]; scen.append(('heroes-low', ','.join(ids), f"__DEV.towerW({mix},1);", True, 20, ids))
            for si in (0, 45, 130, 400, 900): scen.append(('stage', str(si), f"__DEV.startBattle({si})", False, 90))
            for fl in (1, 60, 250): scen.append(('tower', str(fl), f"__DEV.tower({fl})", False, 60))
            if ONLY: scen = [s for s in scen if ONLY in s[0] or ONLY == s[1]]
            for sc in scen:
                kind, name, js, imm, secs = sc[:5]
                if len(sc) > 5:  # custom team: start the wave with these heroes
                    js = f"(()=>{{const T=window.__T;__DEV.towerW({mix},1);const B=T.B;}})()"
                    ids = json.dumps(sc[5])
                    js = f"""(()=>{{__DEV.towerW({mix},1);}})();(()=>{{const ids={ids};const D=window.__DEV;const tw=D.twFloor(1);tw.w=[{mix}];tw.st.w=tw.w;tw.mod=-1;tw.mul=1;D.getB&&0;}})();"""
                    js = f"""(()=>{{const ids={ids};const tw=__DEV.twFloor(1);tw.w=[{mix}];tw.st.w=tw.w;tw.mod=-1;tw.st.n='TEST';tw.mul=1;window.__START(ids,tw);}})()"""
                errs.clear()
                try:
                    await pg.evaluate("document.querySelectorAll('.open').forEach(e=>0)")
                    await pg.evaluate(js)
                    r = await pg.evaluate(f"({CHECK})({{imm:{'true' if imm else 'false'},secs:{secs}}})")
                except Exception as e:
                    r = {'ev': [{'id': 'HARNESS', 'k': 'error', 'n': 1, 'info': str(e)[:300]}], 'never': []}
                r['kind'] = kind; r['name'] = name; r['pageerr'] = errs[:5]
                out.append(r)
                bad = len(r.get('ev', [])) + len(r.get('never', [])) + (1 if r.get('rerr') else 0) + len(errs)
                print(f"{kind:10s} {name[:40]:40s} t={r.get('t')} phase={r.get('phase')} issues={bad}", flush=True)
            await b.close()
    finally:
        srv.terminate()
    return out

if __name__ == '__main__':
    tmp = tempfile.mkdtemp(prefix='te_audit_'); root = os.path.join(tmp, 'site')
    shutil.copytree(REPO, root, ignore=shutil.ignore_patterns('.git', 'store', 'server', 'preview', 'preregister'))
    s = open(os.path.join(root, 'secure.js')).read()
    s = re.sub(r'^const TEST_MODE = .*$', 'const TEST_MODE = true;', s, flags=re.M)
    s = re.sub(r'^const TEST_ACC = .*$', 'const TEST_ACC = true;', s, flags=re.M)
    open(os.path.join(root, 'secure.js'), 'w').write(s)
    bj = open(os.path.join(root, 'battle.js')).read()
    i = bj.index('if(window.SEC&&SEC.TEST_MODE)window.__DEV=')
    j = bj.index('\n', i)
    hook = HOOK + "window.__START=(ids,tw)=>{root.classList.add('open');window.__BATTLE_ON=true;startBattle(tw.eq,ids.map(heroOf),tw);};\n"
    bj = bj[:j+1] + hook + bj[j+1:]
    open(os.path.join(root, 'battle.js'), 'w').write(bj)
    res = asyncio.run(main(root))
    json.dump(res, open('/home/claude/audit/result.json', 'w'), indent=1)
    shutil.rmtree(tmp, ignore_errors=True)
