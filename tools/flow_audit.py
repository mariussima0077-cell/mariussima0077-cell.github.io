#!/usr/bin/env python3
"""Torque Empire – FLOW AUDIT (v16-119, for Claude's tests, NOT part of the game).
Marius (20 nov 2026): "verifică tot tot tot, fără buguri sau glitch".
A robot plays on a 360x800 phone with the full test account: it taps every button on the map, then every
button of the page that opened, and so on (default 4 taps deep). After every tap it checks:
  OPENED BEHIND  – the new window is hidden behind an older page (the Summon results bug)
  CLOSE DOES NOTHING – the ✕ / ↩ of the new window does not close it
  JS ERROR, FREEZE (no answer 40 s), STUCK INVISIBLE (page stays faded), EMPTY WINDOW, SIDE SCROLL,
  BUTTON COVERED (something in the same window sits on top of a button).
Usage: python3 tools/flow_audit.py [depth=4] [workers=3]   → report in /tmp/flow_audit/report.json (~25 min)
Known false alarms: "covered by …gcA" (Collection hotspots), "#onl>div.modal" (chat rules window),
"#gMain opened empty" (canvas background). The Shop (#s2) is in a shadow DOM → not seen by the robot.
"""
import os, shutil, re as _re, subprocess, socket, sys as _sys
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = '/tmp/flow_audit/site'
def _prep():
    shutil.rmtree(ROOT, ignore_errors=True)
    shutil.copytree(REPO, ROOT, ignore=shutil.ignore_patterns('.git', 'store', 'server'))
    p = os.path.join(ROOT, 'secure.js'); t = open(p).read()
    t = _re.sub(r'^const TEST_MODE = .*$', 'const TEST_MODE = true;', t, flags=_re.M)
    t = _re.sub(r'^const TEST_ACC = .*$', 'const TEST_ACC = true;', t, flags=_re.M); open(p, 'w').write(t)
    p = os.path.join(ROOT, 'index.html'); t = open(p).read()
    t = t.replace("window.__TE={", "window.__AUD={openPanel,closePanel,STIDS,XIDS,get started(){return started;}};window.__TE={", 1); open(p, 'w').write(t)
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    subprocess.Popen([_sys.executable, '-m', 'http.server', str(port)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    import time; time.sleep(1); return port
_PORT = _prep()
import asyncio, json, sys, time, re, hashlib
from playwright.async_api import async_playwright

URL = f'http://127.0.0.1:{_PORT}/'
MAXD = int(sys.argv[1]) if len(sys.argv) > 1 else 3
WORKERS = int(sys.argv[2]) if len(sys.argv) > 2 else 4
OUT = '/tmp/flow_audit/report.json'

JS = r"""
(()=>{if(window.__A)return;
const VW=()=>innerWidth,VH=()=>innerHeight;
const IGN=new Set(['toast','pgSpin','loader','game','lcv']);
function vis(e){const s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||+s.opacity<0.05)return false;
  const r=e.getBoundingClientRect();return r.width>4&&r.height>4&&r.bottom>0&&r.right>0&&r.top<VH()&&r.left<VW();}
function isLayer(e){if(IGN.has(e.id))return false;const s=getComputedStyle(e);if(s.position!=='fixed'&&s.position!=='absolute')return false;
  if(!vis(e))return false;const r=e.getBoundingClientRect();
  const a=Math.max(0,Math.min(r.right,VW())-Math.max(r.left,0))*Math.max(0,Math.min(r.bottom,VH())-Math.max(r.top,0));
  if(e.classList.contains('open')&&a>=0.12*VW()*VH())return true;
  return a>=0.45*VW()*VH()&&(s.position==='fixed'||e.parentElement===document.body||e.id);}
function key(e){if(!e||e===document.body)return 'body';if(e.id)return '#'+e.id;
  const p=e.parentElement;const sib=[...p.children].filter(x=>x.tagName===e.tagName);
  return key(p)+'>'+e.tagName.toLowerCase()+(e.classList[0]?'.'+e.classList[0]:'')+(sib.length>1?':'+sib.indexOf(e):'');}
function layers(){const out=[];for(const e of document.querySelectorAll('body *')){if(e.closest('#toast'))continue;if(isLayer(e))out.push(e);}return out;}
function layerOf(e){while(e&&e!==document.body){if(isLayer(e))return e;e=e.parentElement;}return null;}
function hitLayer(x,y){const e=document.elementFromPoint(x,y);if(!e)return null;if(IGN.has(e.id)||e.closest('#toast'))return 'IGN';const l=layerOf(e);return l?key(l):'map';}
function topLayer(){const pts=[[.5,.5],[.5,.3],[.5,.7],[.3,.5],[.7,.5]];const c={};
  for(const [a,b] of pts){const h=hitLayer(VW()*a,VH()*b);if(h&&h!=='IGN')c[h]=(c[h]||0)+1;}
  let best='map',n=0;for(const k in c)if(c[k]>n){n=c[k];best=k;}return best;}
function sig(){const t=topLayer();let txt='';if(t!=='map'){const e=document.querySelector(t.startsWith('#')&&!t.includes('>')?t:'#__none');txt=e?(e.innerText||'').replace(/[0-9.,:%$+×x/]+/g,'').replace(/\s+/g,' ').slice(0,50):'';}
  return t+'|'+txt;}
function elByKey(k){if(k==='body')return document.body;if(/^#[^>]+$/.test(k))return document.getElementById(k.slice(1));
  // walk
  const parts=k.split('>');let e=parts[0]==='body'?document.body:document.getElementById(parts[0].slice(1));
  for(const p of parts.slice(1)){if(!e)return null;const m=p.match(/^([a-z0-9]+)(?:\.([^:]+))?(?::(\d+))?$/);if(!m)return null;
    const sib=[...e.children].filter(x=>x.tagName.toLowerCase()===m[1]);e=m[3]!=null?sib[+m[3]]:sib[0];}
  return e;}
const CL='button,a[href],[data-a],[data-p],[data-g],[data-r],[data-n],[data-k],[data-t],[data-tab],[data-crew],[onclick],[role=button],.cpGo,.stX';
function cands(){const t=topLayer();const root=t==='map'?document.body:elByKey(t);if(!root)return [];
  const seen=new Set(),out=[];
  for(const e of root.querySelectorAll('*')){
    const s=getComputedStyle(e);const hasD=Object.keys(e.dataset).some(k=>!/^(first|v|key|t0|src|i18n)$/.test(k));if(!(e.matches(CL)||s.cursor==='pointer'||hasD||e.__L))continue;if(!vis(e))continue;if(s.pointerEvents==='none')continue;
    if((e.__L||hasD)&&!e.matches(CL)){const rr=e.getBoundingClientRect();if(rr.width*rr.height>0.4*VW()*VH()||isLayer(e))continue;}
    if(e.parentElement&&e.parentElement.closest(CL)&&e.parentElement.closest(CL)!==root&&root.contains(e.parentElement.closest(CL)))continue;
    if(t==='map'&&layerOf(e))continue;
    const r=e.getBoundingClientRect();const x=Math.min(Math.max(r.left+r.width/2,2),VW()-2),y=Math.min(Math.max(r.top+r.height/2,2),VH()-2);
    if(r.top>VH()-2||r.bottom<2)continue;
    const h=document.elementFromPoint(x,y);let reach=!!h&&(h===e||e.contains(h)||h.contains(e));let cov='';
    if(!reach){if(!h||layerOf(h)!==layerOf(e))continue;cov=key(h);}
    const k=key(e);if(seen.has(k))continue;seen.add(k);
    const txt=(e.innerText||e.getAttribute('aria-label')||e.title||'').trim().replace(/\s+/g,' ').slice(0,40);
    out.push({k,x,y,txt,reach,cov,ds:JSON.stringify(e.dataset).slice(0,80),href:e.getAttribute('href')||''});}
  return out;}
function closers(){const t=topLayer();const root=t==='map'?null:elByKey(t);if(!root)return [];const out=[];
  for(const e of root.querySelectorAll('*')){if(!vis(e))continue;const tx=(e.innerText||e.getAttribute('aria-label')||'').trim();
    if(e.matches('.stX,[data-p=x],[data-a=x],[data-a=back],[data-a=close],[data-p=back],[aria-label=close],[aria-label=Close]')||/^(✕|×|x|X|CLOSE|Close|BACK|Back|↩|←|‹|OK)$/.test(tx)){
      const r=e.getBoundingClientRect();out.push({k:key(e),x:r.left+r.width/2,y:r.top+r.height/2,txt:tx.slice(0,10)});}}
  return out;}
function newCheck(before){ // layers that appeared and whether they are on top
  const L=layers(),bk=new Set(before),res=[];
  for(const e of L){const k=key(e);if(bk.has(k))continue;const r=e.getBoundingClientRect();
    const xs=[.5,.25,.75],ys=[.5,.3,.7];let mine=0,other={},n=0;
    for(const a of xs)for(const b of ys){const x=Math.min(Math.max(r.left+r.width*a,1),VW()-1),y=Math.min(Math.max(r.top+r.height*b,1),VH()-1);
      const el=document.elementFromPoint(x,y);if(!el||IGN.has(el.id)||el.closest('#toast'))continue;n++;
      if(e.contains(el)){mine++;continue;}const hl=layerOf(el);const hk=hl?key(hl):'map';
      if(hl&&((!bk.has(hk)&&hl!==e)||hl.contains(e)))mine++;else other[hk]=(other[hk]||0)+1;}
    res.push({k,mine,n,other,wait:e.classList.contains('pgWait'),
      empty:e.tagName!=='CANVAS'&&(e.innerText||'').trim().length<1&&!e.querySelector('img,canvas,svg')&&getComputedStyle(e).backgroundImage==='none',
      ox:(()=>{let m=0;for(const x of e.querySelectorAll('*')){const b=x.getBoundingClientRect();if(b.width>0&&b.height>0&&vis(x)&&!x.closest('[style*=overflow]'))m=Math.max(m,b.right-VW(),-b.left);}return /hidden|clip/.test(getComputedStyle(e).overflowX)?0:Math.round(m);})()});}
  return res;}
window.__A={layers:()=>layers().map(key),topLayer,sig,cands,closers,newCheck,stuck:()=>[...document.querySelectorAll('.pgWait')].filter(vis).map(key)};
})();
"""

LISTEN = r"""
(()=>{const T=new Set(['click','pointerdown','pointerup','touchstart','touchend','mousedown','mouseup']);
const o=EventTarget.prototype.addEventListener;EventTarget.prototype.addEventListener=function(t,f,x){try{if(T.has(t)&&this instanceof Element)this.__L=1;}catch(e){}return o.call(this,t,f,x);};
for(const ev of ['onclick','onpointerdown','onpointerup','ontouchstart','onmousedown']){const d=Object.getOwnPropertyDescriptor(HTMLElement.prototype,ev);
 if(d)Object.defineProperty(HTMLElement.prototype,ev,{configurable:true,get(){return d.get.call(this);},set(v){this.__L=1;d.set.call(this,v);}});}})();
"""
DANGER = re.compile(r'reset|delete|log ?out|sign ?out|tacc|unlink|disconnect|erase|wipe|transfer|privacy|report player|block', re.I)

class Ctx:
    def __init__(s, br, wid):
        s.br, s.wid = br, wid
    async def fresh(s):
        if getattr(s, 'c', None):
            try: await s.c.close()
            except: pass
        s.c = await s.br.new_context(viewport={'width': 360, 'height': 800}, device_scale_factor=1, is_mobile=True, has_touch=False)
        await s.c.route(re.compile(r'^(?!http://127\.0\.0\.1).*'), lambda r: r.abort())
        await s.c.add_init_script(LISTEN)
        s.pg = await s.c.new_page(); s.pg.set_default_timeout(20000); s.errs = []
        s.pg.on('pageerror', lambda e: s.errs.append('pageerror: ' + str(e)[:300]))
        s.pg.on('console', lambda m: s.errs.append('console.error: ' + m.text[:300]) if m.type == 'error' and 'Failed to load resource' not in m.text and 'net::' not in m.text else None)
        s.pg.on('dialog', lambda d: asyncio.ensure_future(d.dismiss()))
        await s.boot()
    async def boot(s):
        pg = s.pg
        await pg.goto(URL)
        for _ in range(3):
            for i in range(60):
                await pg.wait_for_timeout(300)
                try:
                    ok = await pg.evaluate("!!(window.__AUD)&&document.getElementById('loader')&&(document.getElementById('lpanel')||1)")
                    rd = await pg.evaluate("document.getElementById('loader').classList.contains('hide')")
                    if rd: break
                    await pg.mouse.click(180, 730)
                except Exception: pass
            try:
                if await pg.evaluate("window.__AUD&&__AUD.started"): break
            except Exception: pass
        await pg.wait_for_timeout(1500)
        # close tutorial / daily popups that open by themselves
        await pg.evaluate(JS)
        for _ in range(6):
            t = await pg.evaluate("__A.topLayer()")
            if t == 'map': break
            cl = await pg.evaluate("__A.closers()")
            if cl: await pg.mouse.click(cl[0]['x'], cl[0]['y'])
            else: await pg.keyboard.press('Escape')
            await pg.wait_for_timeout(700)
            await pg.evaluate(JS)
        s.errs.clear()
    async def replay(s, path):
        await s.fresh() if not getattr(s, 'c', None) else await s.reload()
        for st in path:
            ok = await s.do(st)
            if not ok: return False
        return True
    async def reload(s):
        await s.boot()
    async def do(s, st):
        pg = s.pg
        await pg.evaluate(JS)
        if st['k'].startswith('panel:'):
            await pg.evaluate(f"__AUD.openPanel({json.dumps(st['k'][6:])})")
        else:
            cs = await pg.evaluate("__A.cands()")
            c = [x for x in cs if x['k'] == st['k']] or [x for x in cs if st.get('txt') is not None and x['txt'] == st.get('txt') and x.get('ds') == st.get('ds')]
            if not c: return False
            await pg.mouse.click(c[0]['x'], c[0]['y'])
        await pg.wait_for_timeout(1000)
        await pg.evaluate(JS)
        return True

async def main():
    t0 = time.time()
    findings, seen, visited_sig = [], set(), {}
    dead, unreach = [], []
    q = asyncio.Queue()
    await q.put([])
    done_states = set()
    async with async_playwright() as p:
        br = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--disable-gpu', '--no-sandbox'])
        lock = asyncio.Lock()
        active = [0]
        def add(kind, path, st, msg):
            f = {'kind': kind, 'path': ' → '.join(x['txt'] or x['k'] for x in path + ([st] if st else [])), 'keys': [x['k'] for x in path + ([st] if st else [])], 'msg': msg}
            key = kind + '|' + (st['k'] if st else '') + '|' + msg[:80]
            if key in seen: return
            seen.add(key); findings.append(f); print('!!', kind, f['path'], msg, flush=True)
        async def worker(wid):
            cx = Ctx(br, wid); await cx.fresh()
            while True:
                try: path = await asyncio.wait_for(q.get(), 5)
                except asyncio.TimeoutError:
                    if active[0] == 0 and q.empty(): return
                    continue
                active[0] += 1
                try:
                    try: rp = await asyncio.wait_for(cx.replay(path), 120)
                    except asyncio.TimeoutError:
                        print(f'[w{wid}] replay timeout {[x["txt"] for x in path]}', flush=True); await cx.fresh(); rp = False
                    if not rp:
                        active[0] -= 1; continue
                    pg = cx.pg
                    sig0 = await pg.evaluate("__A.sig()")
                    async with lock:
                        if sig0 in done_states: active[0] -= 1; continue
                        done_states.add(sig0)
                    cands0 = await pg.evaluate("__A.cands()")
                    grp, cands = {}, []
                    for c in cands0:
                        g = re.sub(r':\d+', '', c['k']) + '|' + re.sub(r'\d+', '#', c.get('ds', ''))
                        grp[g] = grp.get(g, 0) + 1
                        if grp[g] <= 2: cands.append(c)
                    shape = sig0.split('|')[0] + '|' + hashlib.md5('|'.join(sorted(grp)).encode()).hexdigest()[:8]
                    async with lock:
                        if shape in done_states and path: active[0] -= 1; continue
                        done_states.add(shape)
                    if not path:
                        ids = await pg.evaluate("[...__AUD.STIDS,...__AUD.XIDS,'office','export','parking','parts','security','yard','trailer','collection','rail','race','shop','vip']")
                        cands += [{'k': 'panel:' + i, 'txt': 'map building ' + i, 'reach': True, 'href': '', 'ds': ''} for i in ids]
                    print(f'[w{wid}] {len(done_states)} states, q={q.qsize()}, path={[x["txt"] for x in path]} sig={sig0[:60]} cands={len(cands)} t={int(time.time()-t0)}s', flush=True)
                    for c in cands:
                        if c['href'] and not c['href'].startswith('#') and not c['href'].startswith('javascript'): continue
                        if DANGER.search(c['txt'] + ' ' + c['k'] + ' ' + c['ds']): continue
                        if not c['reach']:
                            add('BUTTON COVERED', path, c, 'covered by '+c['cov']); continue
                        cur = await pg.evaluate("__A.sig()")
                        if cur != sig0:
                            try:
                                if not await asyncio.wait_for(cx.replay(path), 120): break
                            except asyncio.TimeoutError: await cx.fresh(); break
                        before = await pg.evaluate("__A.layers()")
                        html0 = await pg.evaluate("document.body.innerHTML.length+'|'+(document.getElementById('toast')||{}).innerHTML")
                        cx.errs.clear()
                        try: ok = await asyncio.wait_for(cx.do(c), 40)
                        except asyncio.TimeoutError:
                            add('FREEZE', path, c, 'the game did not answer for 40 s after this tap'); await cx.fresh(); break
                        if not ok: continue
                        for e in cx.errs: add('JS ERROR', path, c, e)
                        res = await pg.evaluate(f"__A.newCheck({json.dumps(before)})")
                        for r in res:
                            if r['n'] and r['mine'] < r['n'] * 0.5:
                                add('OPENED BEHIND', path, c, f"window {r['k']} opened but is hidden behind {r['other']}")
                            if r['wait']:
                                await pg.wait_for_timeout(1200)
                                if await pg.evaluate("__A.stuck()"): add('STUCK INVISIBLE', path, c, f"window {r['k']} stays invisible (pgWait)")
                            if r['empty']: add('EMPTY WINDOW', path, c, f"window {r['k']} opened empty")
                            if r['ox'] > 4: add('SIDE SCROLL', path, c, f"window {r['k']} has something {r['ox']}px outside the screen")
                        sig1 = await pg.evaluate("__A.sig()")
                        if sig1 != sig0:
                            if len(path) + 1 < MAXD and sig1 not in done_states:
                                await q.put(path + [c])
                            # test the close button of the new top window
                            if sig1.split('|')[0] != sig0.split('|')[0] and sig1.split('|')[0] != 'map':
                                cl = await pg.evaluate("__A.closers()")
                                if cl:
                                    cx.errs.clear()
                                    await pg.mouse.click(cl[0]['x'], cl[0]['y']); await pg.wait_for_timeout(1000); await pg.evaluate(JS)
                                    for e in cx.errs: add('JS ERROR', path + [c], {'k': cl[0]['k'], 'txt': 'close ' + cl[0]['txt']}, e)
                                    s2 = await pg.evaluate("__A.sig()")
                                    if s2.split('|')[0] == sig1.split('|')[0]:
                                        add('CLOSE DOES NOTHING', path + [c], {'k': cl[0]['k'], 'txt': cl[0]['txt']}, 'pressed close but the window is still on top')
                        else:
                            h1 = await pg.evaluate("document.body.innerHTML.length+'|'+(document.getElementById('toast')||{}).innerHTML")
                            if h1 == html0: dead.append(' → '.join([x['txt'] for x in path] + [c['txt'] or c['k']]))
                except Exception as ex:
                    print(f'[w{wid}] EXC {ex}'[:300], flush=True)
                    try: await cx.fresh()
                    except Exception: pass
                active[0] -= 1
        await asyncio.gather(*[worker(i) for i in range(WORKERS)])
        await br.close()
    json.dump({'findings': findings, 'dead': dead, 'states': len(done_states), 'secs': int(time.time() - t0)}, open(OUT, 'w'), indent=1, ensure_ascii=False)
    print('DONE', len(findings), 'findings', len(done_states), 'states', int(time.time() - t0), 's')

asyncio.run(main())
