#!/usr/bin/env python3
"""Torque Empire – TEXT AUDIT (Claude's test tool, NOT part of the game).
Marius (22 nov 2026): "verifică scrisul – culoarea nu se vede pe fundal, scris prea mic".
Boots the game like flow_audit.py (360x800 phone, full test account), opens every map button / panel and the
tabs inside them (depth 2), and for every visible text measures:
  size  – CSS px on a 360 px phone (≈ dp). < 10 px = TOO SMALL, < 11 px = small
  contrast – text colour vs the real background pixels behind it (from a screenshot), WCAG ratio.
             < 3 = BAD, < 4.5 = weak (a text shadow / outline makes it a bit better – noted)
Usage: python3 tools/text_audit.py [depth=2]  → /tmp/text_audit/report.json + screenshots /tmp/text_audit/*.png
"""
import os, sys, json, asyncio, re, statistics
HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'flow_audit.py')).read().replace('asyncio.run(main())', '')
sys.argv = [sys.argv[0]] + ['2', '1']
G = {'__file__': os.path.join(HERE, 'flow_audit.py'), '__name__': 'fa'}
exec(compile(src, 'flow_audit.py', 'exec'), G)
from PIL import Image
from playwright.async_api import async_playwright
OUTD = '/tmp/text_audit'; os.makedirs(OUTD, exist_ok=True)
DEPTH = int(os.environ.get('TA_DEPTH', '2'))

TXT = r"""
(()=>{const out=[];const seen=new Set();
function vis(e){const s=getComputedStyle(e);if(s.visibility==='hidden'||s.display==='none')return false;
 let o=1,x=e;while(x&&x.nodeType===1){const cs=getComputedStyle(x);o*=+cs.opacity;x=x.parentElement||(x.getRootNode()&&x.getRootNode().host);}return o>.35;}
function walk(root){const it=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT);let e=it.currentNode;
 while(e){if(e.shadowRoot)walk(e.shadowRoot);
  const own=[...e.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim().length>0).map(n=>n.textContent.trim()).join(' ');
  if(own&&/[A-Za-z0-9]/.test(own)&&vis(e)){const r=e.getBoundingClientRect();
   if(r.width>2&&r.height>2&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth){
    const top=(e.getRootNode().elementFromPoint||document.elementFromPoint).call(e.getRootNode().elementFromPoint?e.getRootNode():document,Math.min(innerWidth-1,Math.max(0,r.left+r.width/2)),Math.min(innerHeight-1,Math.max(0,r.top+r.height/2)));
    const covered=top&&top!==e&&!e.contains(top)&&!(top.contains&&top.contains(e));
    const s=getComputedStyle(e);const k=own.slice(0,40)+'|'+Math.round(r.left)+'|'+Math.round(r.top);
    if(!seen.has(k)&&!covered){seen.add(k);
     let p=e,path=[];while(p&&p.nodeType===1&&path.length<4){path.unshift(p.tagName.toLowerCase()+(p.id?'#'+p.id:'')+(p.classList&&p.classList.length?'.'+[...p.classList].slice(0,2).join('.'):''));p=p.parentElement;}
     out.push({t:own.slice(0,60),x:r.left,y:r.top,w:r.width,h:r.height,fs:parseFloat(s.fontSize),fw:s.fontWeight,col:s.color,sh:(s.textShadow!=='none')||(parseFloat(s.webkitTextStrokeWidth)>0),bgc:s.backgroundColor,path:path.join(' > ')});}}}
  e=it.nextNode();}}
walk(document.body);return out;})()
"""

def rgb(s):
    m = re.findall(r'[\d.]+', s); return tuple(float(v) for v in m[:3]) + ((float(m[3]),) if len(m) > 3 else (1.0,))
def lum(c):
    def ch(v):
        v /= 255; return v / 12.92 if v <= .03928 else ((v + .055) / 1.055) ** 2.4
    return .2126 * ch(c[0]) + .7152 * ch(c[1]) + .0722 * ch(c[2])
def ratio(a, b):
    la, lb = lum(a), lum(b); return (max(la, lb) + .05) / (min(la, lb) + .05)

def measure(img, items):
    W, H = img.size; px = img.load(); res = []
    for it in items:
        tc = rgb(it['col'])
        x0, y0 = max(0, int(it['x'])), max(0, int(it['y'])); x1, y1 = min(W, int(it['x'] + it['w'])), min(H, int(it['y'] + it['h']))
        if x1 - x0 < 2 or y1 - y0 < 2: continue
        bg = []
        step = max(1, int(((x1 - x0) * (y1 - y0) / 1500) ** .5))
        for yy in range(y0, y1, step):
            for xx in range(x0, x1, step):
                p = px[xx, yy][:3]
                if sum((p[i] - tc[i]) ** 2 for i in range(3)) > 70 ** 2: bg.append(p)
        if len(bg) < 5: continue
        # worst realistic background = the 25 % of background pixels closest in brightness to the text
        L = lum(tc); bg.sort(key=lambda p: abs(lum(p) - L))
        part = bg[:max(3, len(bg) // 4)]
        med = tuple(statistics.median(p[i] for p in part) for i in range(3))
        allm = tuple(statistics.median(p[i] for p in bg) for i in range(3))
        it['cr'] = round(ratio(tc, med), 2); it['cr_med'] = round(ratio(tc, allm), 2); it['bg'] = '#%02x%02x%02x' % tuple(int(v) for v in allm)
        res.append(it)
    return res

async def main():
    report = []
    async with async_playwright() as p:
        br = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--disable-gpu', '--no-sandbox'])
        cx = G['Ctx'](br, 0); await cx.fresh(); pg = cx.pg
        n = [0]
        async def snap(label):
            await pg.wait_for_timeout(900)
            try: items = await pg.evaluate(TXT)
            except Exception as e: print('eval fail', label, e); return
            n[0] += 1; fn = f'{OUTD}/{n[0]:03d}.png'; await pg.screenshot(path=fn)
            res = measure(Image.open(fn).convert('RGB'), items)
            report.append({'screen': label, 'png': fn, 'texts': res}); print(n[0], label, len(res), flush=True)
        await snap('map')
        await pg.evaluate(G['JS'])
        top = await pg.evaluate("__A.cands()")
        keys = [('c', c) for c in top] + [('p', k) for k in await pg.evaluate("[...__AUD.STIDS,...__AUD.XIDS,'office','export','parking','parts','security','yard','collection','rail','shop','vip']")]
        done = set()
        for kind, c in keys:
            lab = ('panel:' + c) if kind == 'p' else (c.get('txt') or c['k'])
            if lab in done: continue
            done.add(lab)
            try:
                await cx.reload()
                await pg.evaluate(G['JS'])
                if kind == 'p': await pg.evaluate(f"__AUD.openPanel({json.dumps(c)})")
                else:
                    cs = await pg.evaluate("__A.cands()"); m = [x for x in cs if x['k'] == c['k']]
                    if not m: continue
                    await pg.mouse.click(m[0]['x'], m[0]['y'])
                await pg.wait_for_timeout(1200); await pg.evaluate(G['JS'])
                sig = await pg.evaluate("__A.topLayer()")
                if sig == 'map' and kind == 'c': continue
                await snap(lab)
                if DEPTH >= 2 and sig != 'map':
                    sub = await pg.evaluate("__A.cands()")
                    base = await pg.evaluate("__A.sig()")
                    for s2 in sub[:14]:
                        cs = await pg.evaluate("__A.cands()"); m = [x for x in cs if x['k'] == s2['k']]
                        if not m: break
                        await pg.mouse.click(m[0]['x'], m[0]['y']); await pg.wait_for_timeout(1000); await pg.evaluate(G['JS'])
                        s = await pg.evaluate("__A.sig()")
                        if s != base and (lab + '>' + s[:30]) not in done:
                            done.add(lab + '>' + s[:30]); await snap(lab + ' > ' + (s2.get('txt') or s2['k']))
                            base = s
            except Exception as e:
                print('skip', lab, str(e)[:120])
        await br.close()
    json.dump(report, open(f'{OUTD}/report.json', 'w'), indent=1, ensure_ascii=False)
asyncio.run(main())
