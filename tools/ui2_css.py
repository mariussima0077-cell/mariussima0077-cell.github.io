import json
M=json.load(open(__import__('os').path.join(__import__('os').path.dirname(__file__),'ui2_meta.json')))
PW='var(--pw)'
def css():
    o=[':root{--pw:min(100vw,480px)}',
       '.skP{position:fixed;inset:0;isolation:isolate;margin:0 auto;width:var(--pw);display:flex;flex-direction:column;background-size:cover;background-position:center}',
       '.skBg{position:fixed;inset:0;background-size:cover;background-position:center;filter:brightness(.55);z-index:-1}',
       '.skH{position:relative;flex:none;width:100%}.skH>img.hi{display:block;width:100%;height:auto;pointer-events:none}',
       '.skB{position:relative;flex:1;min-height:0;border-style:solid;box-sizing:border-box;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;touch-action:pan-y}']
    for n,m in M.items():
        if 'w' not in m:continue
        W=m['w'];t,b,L,R=m['t'],m['b'],m['L'],m['R']
        f=lambda v:f'calc({PW}*{v}/{W})'
        o.append(f'.sk-{n} .skB{{border-width:{f(t)} {f(R)} {f(b)} {f(L)};border-image:url(img/ui2/{n}_b.webp) {t} {R} {b} {L} round;background:url(img/ui2/{n}_i.webp) 0 0/100% 100% no-repeat;background-origin:padding-box;background-clip:padding-box}}')
        o.append(f'.sk-{n}>.skBg{{background-image:url(img/ui2/{n}_bl.webp)}}')
    return '\n'.join(o)
if __name__=='__main__':print(css())
