// Torque Empire – v16-64: page transitions.
// Every page / window that opens (gets the class "open") waits until its pictures are loaded and decoded
// (max 0.7 s, a small spinner after 0.15 s), then fades in. Before, a page appeared at once and some icons
// popped in a moment later on cheaper phones. Pictures already prepared once open instantly the next time.
(function(){
'use strict';
const SKIP = new Set(['sheet','bt','loader','updBox']);     // #sheet slides in by itself, the battle has its own start
const MAXW = 700, SPIN = 150, FADE = 180;
const ready = new Set();                                    // picture URLs already decoded
const st = document.createElement('style');
st.textContent = '.pgWait{opacity:0!important;pointer-events:none!important}'+
  '#pgSpin{position:fixed;left:50%;top:50%;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;z-index:99990;pointer-events:none;'+
  'border:4px solid rgba(255,213,74,.25);border-top-color:#ffd54a;animation:pgSp .7s linear infinite;display:none}'+
  '@keyframes pgSp{to{transform:rotate(360deg)}}';
document.head.appendChild(st);
const spin = document.createElement('div'); spin.id = 'pgSpin';
let spinN = 0;
function spinOn(){ spinN++; if(!spin.isConnected) document.body.appendChild(spin); spin.style.display = 'block'; }
function spinOff(){ spinN = Math.max(0, spinN-1); if(!spinN) spin.style.display = 'none'; }

const RX = /url\(\s*["']?([^"')]+)["']?\s*\)/g;
function urls(el){
  const out = new Set();
  const add = u => { if(!u || u.startsWith('data:')) return; try{ u = new URL(u, location.href).href; }catch(e){ return; } if(!ready.has(u)) out.add(u); };
  const css = e => { const s = getComputedStyle(e);
    for(const v of [s.backgroundImage, s.borderImageSource]) if(v && v !== 'none'){ let m; RX.lastIndex = 0; while((m = RX.exec(v))) add(m[1]); } };
  el.querySelectorAll('img').forEach(i => add(i.currentSrc || i.getAttribute('src')));
  css(el);
  const all = el.getElementsByTagName('*');
  for(let i = 0; i < all.length && i < 350; i++) css(all[i]);
  return [...out].slice(0, 60);
}
function load(u){
  return new Promise(res => {
    const im = new Image(); im.decoding = 'async';
    const ok = () => { ready.add(u); res(); };
    im.onload = () => { (im.decode ? im.decode() : Promise.resolve()).catch(()=>{}).then(ok); };
    im.onerror = ok; im.src = u;
  });
}
function fade(el){
  if(!el.animate) return;
  try{ const a = el.animate([{opacity:0},{opacity:1}], {duration:FADE, easing:'ease-out'}); a.id = 'pgfx'; }catch(e){}
}
function show(el){
  if(el.getAnimations) el.getAnimations().forEach(a => { if(a.id === 'pgfx') a.cancel(); });
  let list; try{ list = urls(el); }catch(e){ list = []; }
  if(!list.length){ fade(el); return; }
  const tok = (el.__pgTok = (el.__pgTok||0) + 1);
  el.classList.add('pgWait');
  let done = false, sp = false;
  const tm = setTimeout(() => { if(!done){ sp = true; spinOn(); } }, SPIN);
  const fin = () => {
    if(done) return; done = true; clearTimeout(tm); if(sp) spinOff();
    if(el.__pgTok !== tok) return;
    el.classList.remove('pgWait');
    if(el.classList.contains('open')) fade(el);
  };
  Promise.all(list.map(load)).then(fin); setTimeout(fin, MAXW);
}
new MutationObserver(ms => {
  for(const m of ms){
    const el = m.target;
    if(!el.classList || !el.classList.contains('open') || SKIP.has(el.id)) continue;
    if(/(^|\s)open(\s|$)/.test(m.oldValue || '')) continue;      // it was already open (re-render)
    show(el);
  }
}).observe(document.documentElement, {subtree:true, attributes:true, attributeFilter:['class'], attributeOldValue:true});
window.PAGEFX = {ready};
})();
