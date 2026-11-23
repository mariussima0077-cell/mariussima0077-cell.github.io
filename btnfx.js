// Torque Empire – v16-253: button animations (Marius: "animations on every button we tap").
// Every button / tappable element gets: a soft squeeze while the finger is on it, a springy bounce when released,
// a short bright flash, and a golden ring + a few sparks where the finger tapped.
// Light on cheap phones: only transform/opacity/filter, one small overlay at a time, nothing runs when idle.
(function(){
'use strict';
if(window.__btnfx) return; window.__btnfx = 1;
const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const SCALE_OK = window.CSS && CSS.supports && CSS.supports('scale', '1');   // "scale" is separate from "transform" → no clash with the game's own transforms
const SKIP_SEL = 'input,textarea,select,canvas,[data-nofx]';
const TAP_SEL = 'button,[onclick],a[href],[role="button"],.btn,.buy,.pB,label[for]';

const st = document.createElement('style');
st.textContent =
  '.bfxR{position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:99995}'+
  '.bfxR i{position:absolute;left:0;top:0;border-radius:50%;will-change:transform,opacity}'+
  '.bfxR .r{width:60px;height:60px;margin:-30px 0 0 -30px;border:3px solid #ffd54a;box-shadow:0 0 10px #ffb300,inset 0 0 8px #fff6;}'+
  '.bfxR .g{width:34px;height:34px;margin:-17px 0 0 -17px;background:radial-gradient(circle,#fffbe6 0,#ffd54acc 35%,#ffb30000 70%)}'+
  '.bfxR .s{width:6px;height:6px;margin:-3px 0 0 -3px;background:#fff3b0;box-shadow:0 0 6px #ffcc33}';
document.head.appendChild(st);

function target(t){
  if(!t || !t.closest || t.closest(SKIP_SEL)) return null;
  let el = t.closest(TAP_SEL);
  if(!el){ // elements that got .onclick from code
    for(let e = t, n = 0; e && e !== document.body && n < 6; e = e.parentElement, n++) if(typeof e.onclick === 'function'){ el = e; break; }
  }
  if(!el || el.disabled || el.classList.contains('off')) return null;
  const r = el.getBoundingClientRect();
  if(!r.width || !r.height) return null;
  if(r.width * r.height > innerWidth * innerHeight * 0.35) return null;   // a whole page / backdrop – not a button
  return el;
}

let cur = null, sx = 0, sy = 0, moved = false;
function anim(el, kf, o){ try{ return el.animate(kf, o); }catch(e){ return null; } }

function press(el){
  if(!SCALE_OK || RM) return;
  if(el.__bfxA) el.__bfxA.cancel();
  el.__bfxA = anim(el, [{scale:'1'},{scale:'0.93'}], {duration:90, easing:'ease-out', fill:'forwards'});
}
function release(el, tap){
  if(el.__bfxA){ el.__bfxA.cancel(); el.__bfxA = null; }
  if(!SCALE_OK || RM) return;
  if(tap){
    anim(el, [{scale:'0.93'},{scale:'1.07', offset:.45},{scale:'0.98', offset:.75},{scale:'1'}], {duration:330, easing:'ease-out'});
    anim(el, [{filter:'brightness(1.35)'},{filter:'brightness(1)'}], {duration:260, easing:'ease-out'});
  } else {
    anim(el, [{scale:'0.93'},{scale:'1'}], {duration:140, easing:'ease-out'});
  }
}

let busy = 0;
function burst(x, y){
  if(RM || busy > 2) return;                 // never more than 3 bursts on screen
  busy++;
  const w = document.createElement('div'); w.className = 'bfxR';
  w.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  const r = document.createElement('i'); r.className = 'r';
  const g = document.createElement('i'); g.className = 'g';
  w.appendChild(g); w.appendChild(r);
  const N = 6, sp = [];
  for(let k = 0; k < N; k++){ const s = document.createElement('i'); s.className = 's'; w.appendChild(s); sp.push(s); }
  document.body.appendChild(w);
  anim(r, [{transform:'scale(.2)', opacity:1},{transform:'scale(1.15)', opacity:0}], {duration:420, easing:'cubic-bezier(.2,.7,.3,1)', fill:'forwards'});
  anim(g, [{transform:'scale(.4)', opacity:1},{transform:'scale(1.6)', opacity:0}], {duration:300, easing:'ease-out', fill:'forwards'});
  const a0 = Math.random() * Math.PI;
  sp.forEach((s, k) => {
    const a = a0 + k * (Math.PI * 2 / N), d = 26 + Math.random() * 14;
    anim(s, [{transform:'translate(0,0) scale(1)', opacity:1},{transform:'translate(' + (Math.cos(a)*d).toFixed(1) + 'px,' + (Math.sin(a)*d).toFixed(1) + 'px) scale(.2)', opacity:0}],
      {duration:380 + k * 12, easing:'cubic-bezier(.15,.8,.3,1)', fill:'forwards'});
  });
  setTimeout(() => { w.remove(); busy--; }, 520);
}

document.addEventListener('pointerdown', e => {
  if(e.button > 0) return;
  const el = target(e.target); if(!el) return;
  cur = el; sx = e.clientX; sy = e.clientY; moved = false;
  press(el);
}, {passive:true, capture:true});
document.addEventListener('pointermove', e => {
  if(cur && !moved && Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 12){ moved = true; release(cur, false); cur = null; }
}, {passive:true, capture:true});
document.addEventListener('pointerup', e => {
  if(!cur) return;
  const el = cur; cur = null;
  release(el, true);
  burst(e.clientX, e.clientY);
}, {passive:true, capture:true});
document.addEventListener('pointercancel', () => { if(cur){ release(cur, false); cur = null; } }, {passive:true, capture:true});
})();
