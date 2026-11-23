import os,sys,asyncio
H='/home/claude/mariussima0077-cell.github.io/tools'
src=open(H+'/flow_audit.py').read().replace('asyncio.run(main())','')
sys.argv=[sys.argv[0],'2','1'];G={'__file__':H+'/flow_audit.py','__name__':'fa'}
exec(compile(src,'flow_audit.py','exec'),G)
from playwright.async_api import async_playwright
async def run():
    async with async_playwright() as p:
        br=await p.chromium.launch()
        orig=br.new_context
        async def nc(**kw):
            kw['viewport']={'width':360,'height':780};kw['device_scale_factor']=752/360
            return await orig(**kw)
        br.new_context=nc
        c=G['Ctx'](br,0);await c.fresh();pg=c.pg
        await pg.add_style_tag(content="a[href='?tacc=0']{display:none!important}")
        # AWAKENING moment
        await pg.evaluate("__TE.awakenFx([{id:'m5_0',awk:5}])")
        for i,t in enumerate([600,900,1300,1800,2600]):
            await pg.wait_for_timeout(t if i==0 else t-[600,900,1300,1800,2600][i-1]);await pg.evaluate("document.querySelectorAll('#awkFx *').forEach(e=>{if(e.children.length===0&&/Tap to continue/i.test(e.textContent))e.style.visibility='hidden'})");await pg.screenshot(path=f'/tmp/shots/awk{i}.png')
        await pg.wait_for_timeout(4000)
        await pg.evaluate("document.getElementById('awkFx')&&document.getElementById('awkFx').remove()")
        # GRAND PRIX
        await pg.evaluate("const s=GPX.state();s.pts=1500*37;GPX.open()");await pg.wait_for_timeout(1500)
        await pg.evaluate("document.querySelectorAll('[data-g=ok]').forEach(b=>b.click())");await pg.wait_for_timeout(600)
        await pg.screenshot(path='/tmp/shots/gp_ev.png')
        await pg.evaluate("document.querySelector('[data-g=tab][data-t=rd]').click()");await pg.wait_for_timeout(1200)
        await pg.screenshot(path='/tmp/shots/gp_rd.png')
        await pg.evaluate("document.getElementById('gpS').scrollTop=400");await pg.wait_for_timeout(600)
        await pg.screenshot(path='/tmp/shots/gp_rd2.png')
        print('errors',c.errs)
        await br.close()
asyncio.run(run())
