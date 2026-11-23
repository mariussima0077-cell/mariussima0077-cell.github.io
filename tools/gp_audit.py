import os,sys,asyncio,json
H='/home/claude/mariussima0077-cell.github.io/tools'
src=open(H+'/flow_audit.py').read().replace('asyncio.run(main())','')
sys.argv=[sys.argv[0],'2','1'];G={'__file__':H+'/flow_audit.py','__name__':'fa'}
exec(compile(src,'flow_audit.py','exec'),G)
from playwright.async_api import async_playwright
CHK=r"""(()=>{const out=[];const root=document.getElementById('gpx')||document.body;
const els=[...document.querySelectorAll('#gpS *, .gpPop *, .gpBan *, .gpTabs *, .gpCb *')];
for(const e of els){const r=e.getBoundingClientRect();if(r.width<2||r.height<2)continue;const s=getComputedStyle(e);if(s.visibility==='hidden'||s.display==='none')continue;
 const own=[...e.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).map(n=>n.textContent.trim()).join(' ');
 if(own){const fs=parseFloat(s.fontSize);if(fs<9.5)out.push(['small',fs,own.slice(0,50)]);
  if(e.scrollWidth>e.clientWidth+2&&s.overflow!=='visible'&&s.overflowX!=='auto'&&s.overflowX!=='scroll')out.push(['cut-x',own.slice(0,50)]);
  if(r.right>innerWidth+1||r.left<-1)if(!e.closest('.gpTr'))out.push(['off-screen',own.slice(0,50),Math.round(r.left),Math.round(r.right)]);
  if(/undefined|NaN|null|\[object/.test(own))out.push(['bad-text',own.slice(0,60)]);}}
return out;})()"""
async def run():
    async with async_playwright() as p:
        br=await p.chromium.launch()
        orig=br.new_context
        async def nc(**kw):
            kw['viewport']={'width':360,'height':800};kw['device_scale_factor']=2
            return await orig(**kw)
        br.new_context=nc
        c=G['Ctx'](br,0);await c.fresh();pg=c.pg
        await pg.add_style_tag(content="a[href='?tacc=0']{display:none!important}")
        await pg.evaluate("const s=GPX.state();s.pts=1500*23;s.tok=5200;GPX.open()");await pg.wait_for_timeout(1500)
        await pg.screenshot(path='/tmp/gpa/00_intro.png')
        await pg.evaluate("document.querySelectorAll('[data-g=ok]').forEach(b=>b.click())");await pg.wait_for_timeout(500)
        rep={}
        async def shot(name):
            h=await pg.evaluate("document.getElementById('gpS').scrollHeight");y=0;i=0
            while True:
                await pg.evaluate(f"document.getElementById('gpS').scrollTop={y}");await pg.wait_for_timeout(350)
                await pg.screenshot(path=f'/tmp/gpa/{name}_{i}.png');rep[f'{name}_{i}']=await pg.evaluate(CHK)
                y+=650;i+=1
                if y>=h-200 or i>6:break
        async def tab(t):
            await pg.evaluate(f"document.querySelector('[data-g=tab][data-t={t}]').click()");await pg.wait_for_timeout(900)
        for pre in ['a','b']:
            await tab('ev');await shot(pre+'_ev')
            await tab('ms')
            for sb in ['d','w','e']:
                await pg.evaluate(f"document.querySelector('[data-g=sub][data-s={sb}]').click()");await pg.wait_for_timeout(600);await shot(pre+'_ms'+sb)
            await tab('rd');await shot(pre+'_rd')
            await tab('rk');await pg.wait_for_timeout(1500);await shot(pre+'_rk')
            await tab('pt');await pg.wait_for_timeout(1000);await shot(pre+'_pt')
            await tab('ev');await tab('sh');await shot(pre+'_sh')
            if pre=='a':
                await pg.evaluate("document.querySelector('[data-g=pk][data-k=gp3]').click()");await pg.wait_for_timeout(2500)
        json.dump(rep,open('/tmp/gpa/rep.json','w'),indent=0)
        print('errors',c.errs)
        await br.close()
asyncio.run(run())
