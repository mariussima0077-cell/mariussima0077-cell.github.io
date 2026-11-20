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

// v16-113: AUTO-FIT TEXT. Marius: "verifică tot scrisul peste tot". A one-line text (name, number, button label)
// that is wider than its box is no longer cut ("The Torque Ki…") or pushed out of its frame: its letters get a
// little smaller until it fits (never below 62% of the normal size). Runs only on the parts of the page that
// changed, at most 4 times a second, and skips everything inside the battle canvas.
(function(){
'use strict';
const MIN = .62, done = new WeakMap(), fitted = new WeakSet();
let q = new Set(), tm = 0;
const INL = new Set(['SPAN','B','I','EM','SMALL','STRONG','IMG','BR','U','SUP','SUB','svg','use']);
// a "text line": only text and inline pieces inside (name, number, label with an icon)
function leaf(el){ if(!el.textContent.trim()) return false; for(const c of el.querySelectorAll('*')) if(!INL.has(c.tagName)) return false; return true; }
function fit(el){
  if(!el.isConnected) return;
  if(!el.clientWidth) return;   // hidden (display:none) → checked again when its page opens
  const key = el.textContent + '|' + el.clientWidth;
  if(done.get(el) === key) return;
  const cs = getComputedStyle(el);
  if(cs.whiteSpace!=='nowrap' && cs.whiteSpace!=='pre') { done.set(el,key); return; }
  if(cs.display==='inline'){ done.set(el,key); return; }
  el.style.removeProperty('font-size');
  const base = parseFloat(getComputedStyle(el).fontSize), w = el.clientWidth, sw = el.scrollWidth;
  if(sw > w && base){ fitted.add(el); const f = Math.max(MIN, (w / sw) * .98); el.style.setProperty('font-size', (base*f).toFixed(2)+'px', 'important');
    if(el.scrollWidth > el.clientWidth && f > MIN) el.style.setProperty('font-size', (base*Math.max(MIN,f*.92)).toFixed(2)+'px', 'important'); }
  done.set(el, el.textContent + '|' + el.clientWidth);
}
function run(){ tm = 0; const roots = [...q]; q.clear(); let n = 0;
  for(const r of roots){ if(!r.isConnected || r.closest && r.closest('#bt')) continue;
    if(r.nodeType!==1 || hid(r)) continue;
    const tw = document.createTreeWalker(r, NodeFilter.SHOW_ELEMENT, {acceptNode: e => (SKIPT.has(e.tagName) || hid(e)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
    for(let el = r; el && ++n < 20000; el = tw.nextNode()){ if(!SKIPT.has(el.tagName) && leaf(el)) fit(el); } } }
const hid = e => !e.getClientRects().length && getComputedStyle(e).display!=='contents';
const SKIPT = new Set(['CANVAS','IMG','SVG','svg','SCRIPT','STYLE','VIDEO','INPUT','TEXTAREA','SELECT']);
function push(t){ if(t && t.nodeType===3) t = t.parentElement; if(!t || t===document.body || t===document.documentElement) return; q.add(t); if(!tm) tm = setTimeout(run, 250); }
function start(){
  new MutationObserver(ms => { for(const m of ms){ if(m.type==='characterData') push(m.target.parentElement); else if(m.type==='childList'){ if(m.addedNodes.length){ if(m.target===document.body) m.addedNodes.forEach(push); else push(m.target); } } else if(m.attributeName==='class') { const t=m.target; if(t.classList && t.classList.contains('open')) push(t); }
      else if(m.attributeName==='style' && fitted.has(m.target) && !m.target.style.fontSize){ done.delete(m.target); push(m.target); } } })  // the game's morph() redraw removed our size → fit again
    .observe(document.body, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['class','style']});
  addEventListener('resize', () => { push(document.body.firstElementChild); document.querySelectorAll('.open').forEach(push); });
}
if(document.body) start(); else addEventListener('DOMContentLoaded', start);
window.__FIT = {all:()=>{ document.querySelectorAll('body > *').forEach(e=>q.add(e)); run(); }};
})();
