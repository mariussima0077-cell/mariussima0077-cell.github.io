#!/usr/bin/env python3
"""Torque Empire – "budget phone" test (for Claude's tests, NOT part of the game).

NOTE: this sandbox has no graphics chip, so Chrome draws every pixel with the CPU and the CPU slow-down
also slows the drawing → "fps" in battle is much worse here than on a real phone (which draws on its GPU).
The reliable numbers are js_ms (game code per frame, budget target < 8 ms), slow frames on the map,
memory, errors, and battle_canvas_resized_midfight (must be 0).

Runs the game in Chrome made to behave like a cheap Android phone and prints a report:
FPS on the garage map and in a battle, slow frames, memory, errors + screenshots.

Profiles (pick with --phone):
  budget  ~ Galaxy A05 / A15 class: 360x800, DPR 2, CPU 6x slower than this PC   (default)
  low     ~ old 2-3 GB phone:       360x760, DPR 1.5, CPU 10x slower
  mid     ~ Galaxy A54 class:       393x873, DPR 2.75, CPU 3x slower

Usage:  python3 tools/budget_phone.py [--phone budget] [--stage 0] [--secs 15] [--out /tmp/phone]
Needs: playwright (python) + /usr/bin/google-chrome. Works on a COPY of the repo with test mode on
(the real secure.js / dev key are never changed or needed).
"""
import argparse, asyncio, json, os, shutil, subprocess, sys, tempfile, time, socket, re

PHONES = {
    'budget': dict(w=360, h=800, dpr=2, cpu=6, name='Budget phone (Galaxy A05/A15 class)'),
    'low':    dict(w=360, h=760, dpr=1.5, cpu=10, name='Low-end phone (old 2-3 GB)'),
    'mid':    dict(w=393, h=873, dpr=2.75, cpu=3, name='Mid-range phone (Galaxy A54 class)'),
    'pc':     dict(w=360, h=800, dpr=2, cpu=1, name='No slow-down (calibration)'),
}
UA = 'Mozilla/5.0 (Linux; Android 13; SM-A055F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36'

# frame counter injected in the page: records every frame's duration
FPS_JS = """
(()=>{const F=window.__F={on:false,d:[],js:[]};let last=0;
  // time spent in the game's own code each frame (what a real phone's CPU must do; drawing pixels is done by its GPU)
  const rAF=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>rAF(t=>{const a=performance.now();try{cb(t);}finally{if(F.on)F.js.push(performance.now()-a);}});
  function tick(t){if(F.on&&last)F.d.push(t-last);last=t;rAF(tick);}rAF(tick);
  // counts battle-canvas re-sizes after the first one (each one = a visible flash / "tear")
  const w=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,'width');let first=true;
  Object.defineProperty(HTMLCanvasElement.prototype,'width',{set(v){if(this.id==='btcv'&&window.__F.on){if(first)first=false;else(window.__RS=window.__RS||[]).push(v);}w.set.call(this,v);},get(){return w.get.call(this);}});})();
"""

def free_port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p

def renderer_mb():
    out = subprocess.run(['bash', '-c', "ps -C chrome -o rss=,args= | grep -- '--type=renderer' | awk '{s+=$1} END {print s}'"],
                         capture_output=True, text=True).stdout.strip()
    return int(out or 0) // 1024

def stats(r):
    d, js = r['d'], r['js']
    if not d: return dict(fps=0, slow=0, worst=0, n=0)
    d = d[2:]  # skip warm-up
    avg = sum(d) / len(d)
    # js_ms = game code per frame (scaled back to the phone: already includes the CPU slow-down)
    return dict(fps=round(1000 / avg, 1), slow=round(100 * sum(1 for x in d if x > 50) / len(d), 1), worst=round(max(d)), n=len(d),
                js_ms=round(sum(js) / max(1, len(js)), 1))

async def run(a, root):
    from playwright.async_api import async_playwright
    P = PHONES[a.phone]; os.makedirs(a.out, exist_ok=True)
    port = free_port()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port)], cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    rep = dict(phone=P['name'], cpu_slowdown=P['cpu'], screen=f"{P['w']}x{P['h']} @{P['dpr']}x")
    errs = []
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--enable-precise-memory-info'])
            ctx = await b.new_context(viewport={'width': P['w'], 'height': P['h']}, device_scale_factor=P['dpr'],
                                      is_mobile=True, has_touch=True, user_agent=UA, service_workers='block')
            pg = await ctx.new_page()
            pg.on('pageerror', lambda e: errs.append('PAGE: ' + str(e)[:200]))
            pg.on('console', lambda m: m.type == 'error' and 'ERR_' not in m.text and errs.append('CONSOLE: ' + m.text[:200]))
            await pg.add_init_script(FPS_JS)
            cdp = await ctx.new_cdp_session(pg)
            await cdp.send('Emulation.setCPUThrottlingRate', {'rate': P['cpu']})
            t0 = time.time()
            await pg.goto(f'http://127.0.0.1:{port}/')
            # loading screen → "TAP TO PLAY"
            for _ in range(120):
                if await pg.evaluate("document.getElementById('loader').classList.contains('hide')"): break
                await pg.mouse.click(P['w'] / 2, P['h'] * .9); await pg.wait_for_timeout(500)
            rep['load_s'] = round(time.time() - t0, 1)
            await pg.wait_for_timeout(2000)
            await pg.screenshot(path=f'{a.out}/1_map.png')
            # garage map: idle + a few drags
            await pg.evaluate('__F.d=[];__F.js=[];__F.on=true')
            for k in range(a.secs):
                await pg.mouse.move(P['w'] * .5, P['h'] * .5); await pg.mouse.down()
                await pg.mouse.move(P['w'] * (.3 if k % 2 else .7), P['h'] * .45, steps=8); await pg.mouse.up()
                await pg.wait_for_timeout(1000)
            rep['map'] = stats(await pg.evaluate('__F.on=false;({d:__F.d,js:__F.js})'))
            rep['mem_map_MB'] = renderer_mb()
            # battle
            await pg.evaluate(f'__F.d=[];__F.js=[];__F.on=true;window.__DEV.startBattle({a.stage})')
            await pg.wait_for_timeout(1500); await pg.screenshot(path=f'{a.out}/2_battle_start.png')
            await pg.wait_for_timeout(a.secs * 1000); await pg.screenshot(path=f'{a.out}/3_battle.png')
            rep['battle'] = stats(await pg.evaluate('__F.on=false;({d:__F.d,js:__F.js})'))
            rep['battle_canvas_resized_midfight'] = await pg.evaluate("(window.__RS||[]).length")
            rep['mem_battle_MB'] = renderer_mb()
            heap = await pg.evaluate('performance.memory?Math.round(performance.memory.usedJSHeapSize/1048576):null')
            rep['js_heap_MB'] = heap
            await b.close()
    finally:
        srv.terminate()
    rep['errors'] = errs[:10]
    return rep

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--phone', default='budget', choices=PHONES)
    ap.add_argument('--stage', type=int, default=0)
    ap.add_argument('--secs', type=int, default=15)
    ap.add_argument('--out', default='/tmp/phone')
    ap.add_argument('--repo', default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    a = ap.parse_args()
    tmp = tempfile.mkdtemp(prefix='te_phone_')
    root = os.path.join(tmp, 'site')
    shutil.copytree(a.repo, root, ignore=shutil.ignore_patterns('.git', 'store', 'server'))
    sec = os.path.join(root, 'secure.js'); s = open(sec).read()
    s = re.sub(r'^const TEST_MODE = .*$', 'const TEST_MODE = true;', s, flags=re.M); open(sec, 'w').write(s)
    try:
        rep = asyncio.run(run(a, root))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print(json.dumps(rep, indent=2))

if __name__ == '__main__':
    main()
