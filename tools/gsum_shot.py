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
            kw['device_scale_factor']=2;return await orig(**kw)
        br.new_context=nc
        c=G['Ctx'](br,0);await c.fresh();pg=c.pg
        await pg.evaluate("document.getElementById('smBtn').click()");await pg.wait_for_timeout(1200);await pg.evaluate("document.querySelector('[data-a=cat][data-c=gear]').click()");await pg.wait_for_timeout(1500)
        try:
            await pg.get_by_text('GOT IT').first.click(timeout=2000);await pg.wait_for_timeout(600)
        except Exception: pass
        await pg.screenshot(path='/tmp/cit/top_gs.png')
        await pg.evaluate("__DEV.card&&0");
        print('errors',c.errs);await br.close()
asyncio.run(run())
