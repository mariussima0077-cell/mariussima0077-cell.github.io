// v16-66 – MOVING THE GAME from the old Chrome version (TWA, Play) into the new app (Capacitor).
// The old version kept the game inside Chrome; the new app has its own storage, so it starts empty.
// How: the app makes a secret key → opens transfer.html in Chrome (Custom Tab, same storage as the old version)
// → that page uploads the game to Torque Guard under the key → the app downloads it (once) and restarts.
// Only runs inside the new app. In Chrome / the old version this file does nothing.
(()=>{
const SK = 'torqueEmpire_v15';
const isApp = () => !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) || /[?&]src=capapp/.test(location.search);
let hadSave = false; try{ hadSave = !!localStorage.getItem(SK); }catch(e){}
const LS = (k,v) => { try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } };
const api = () => (window.SEC && SEC.api && SEC.api()) || 'https://torque-guard.torqueempirehelp.workers.dev';
const P = n => window.Capacitor && Capacitor.Plugins && Capacitor.Plugins[n];
let key = null, poll = 0, box = null, until = 0, mode = 'xfer';   // v16-67: mode 'login' = Google sign-in through Chrome (glogin.html)

const css = 'position:fixed;inset:0;z-index:2147483000;background:#05070ce6;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui;color:#fff';
const card = h => '<div style="max-width:360px;width:100%;background:linear-gradient(#152033,#0b1420);border:2px solid #e0a82e;border-radius:18px;padding:16px 14px;box-shadow:0 8px 30px #000;text-align:center">'+h+'</div>';
const btn = (a,t,bg) => '<button data-xf="'+a+'" style="width:100%;margin-top:9px;padding:12px;border:0;border-radius:999px;background:'+bg+';color:#fff;font:900 15px system-ui;box-shadow:0 3px 0 #0006">'+t+'</button>';

function show(h){
  if(!box){ box = document.createElement('div'); box.style.cssText = css; box.addEventListener('click', onClick, true); document.body.appendChild(box); }
  box.innerHTML = card(h);
}
function close(){ if(box){ box.remove(); box = null; } stop(); }
function stop(){ if(poll){ clearInterval(poll); poll = 0; } }

function ask(){
  show('<div style="font-size:40px;line-height:1">📲</div>'+
    '<div style="font:900 19px system-ui;margin:6px 0 4px;color:#ffd54a">Played Torque Empire before?</div>'+
    '<div style="font-size:13px;color:#c8d2dc;line-height:1.45">The game got a new app. If you played the old version on this phone, bring your progress here – garage, heroes, VIP and packs.</div>'+
    (hadSave?'<div style="font-size:12px;color:#ffb74d;margin-top:6px">⚠️ This replaces the game you have in this app now.</div>':'')+
    btn('go','📲 TRANSFER MY PROGRESS','#2e7d32')+
    btn('new',hadSave?'CANCEL':'NEW GAME','#2b3a52')+
    '<div style="font-size:11px;color:#8b9aab;margin-top:8px">You can also do it later from the start screen.</div>');
}

function rnd(){ const a = new Uint8Array(24); crypto.getRandomValues(a); return Array.from(a, b => 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'[b % 57]).join(''); }

async function go(m){
  if(m) mode = m;
  const B = P('Browser');
  if(!B){ show('<div style="font:900 17px system-ui;color:#ff8a80">⚠️ Can\'t open Chrome</div><div style="font-size:13px;color:#c8d2dc;margin-top:6px">Please update the app and try again.</div>'+btn('close','OK','#2b3a52')); return; }
  key = rnd(); until = Date.now() + 10*60e3;
  waiting();
  try{ await B.open({url: location.origin + (mode==='login' ? '/glogin.html?k=' : '/transfer.html?k=') + key, toolbarColor:'#0b1420'}); }catch(e){}
  stop(); poll = setInterval(check, 2500);
}
function waiting(){
  if(mode === 'login'){
    show('<div style="font-size:36px;line-height:1">☁️</div>'+
      '<div style="font:900 17px system-ui;margin:6px 0 4px;color:#ffd54a">Signing in with Google…</div>'+
      '<div style="font-size:13px;color:#c8d2dc;line-height:1.45">Choose your Google account in Chrome.<br>Then tap <b>RETURN TO GAME</b> (or the ✕ at the top).</div>'+
      btn('again','OPEN CHROME AGAIN','#1f5fa8')+btn('cancel','CANCEL','#2b3a52'));
    return;
  }
  show('<div style="font-size:36px;line-height:1">⏳</div>'+
    '<div style="font:900 17px system-ui;margin:6px 0 4px;color:#ffd54a">Waiting for your old game…</div>'+
    '<div style="font-size:13px;color:#c8d2dc;line-height:1.45">Chrome opens and sends your progress here.<br>Then tap <b>RETURN TO GAME</b> (or the ✕ at the top).</div>'+
    btn('again','OPEN CHROME AGAIN','#1f5fa8')+btn('cancel','CANCEL','#2b3a52'));
}

let busy = false;
async function check(){
  if(!key || busy) return;
  if(Date.now() > until){ stop(); if(mode==='login'){ close(); return; } show('<div style="font:900 17px system-ui;color:#ff8a80">⌛ Time is up</div><div style="font-size:13px;color:#c8d2dc;margin-top:6px">Nothing arrived. Try again.</div>'+btn('go','TRY AGAIN','#2e7d32')+btn('cancel','CLOSE','#2b3a52')); return; }
  busy = true;
  try{
    const r = await (await fetch(api() + '/api/xfer/get', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({k:key})})).json();
    if(r && r.data) apply(r.data);
  }catch(e){}
  busy = false;
}

function apply(data){
  stop(); key = null;
  let o; try{ o = JSON.parse(data); }catch(e){ o = null; }
  if(mode === 'login' || (o && o.cred)){                 // Google sign-in → cloud.js does the rest (choose game, upload…)
    close(); mode = 'xfer';
    if(o && o.cred && window.CLOUD && CLOUD.cred) CLOUD.cred(o.cred);
    return;
  }
  if(!o || o.none){
    show('<div style="font-size:36px;line-height:1">🔍</div><div style="font:900 17px system-ui;margin:6px 0;color:#ffd54a">No old game found</div>'+
      '<div style="font-size:13px;color:#c8d2dc;line-height:1.45">Chrome on this phone has no Torque Empire progress. If you signed in with Google in the old version, sign in here too – your cloud save comes back.</div>'+
      btn('new','START A NEW GAME','#2e7d32')+btn('go','TRY AGAIN','#2b3a52'));
    return;
  }
  const keys = o.ls || {};
  if(!keys[SK]){ apply('{"none":1}'); return; }
  window.__noSave = true;                          // the empty new game must not overwrite what we bring
  try{ for(const k in keys) localStorage.setItem(k, keys[k]); }catch(e){}
  LS('te_xfer', 'done');
  show('<div style="font-size:42px;line-height:1">✅</div><div style="font:900 19px system-ui;margin:6px 0;color:#7ee787">Progress transferred!</div>'+
    '<div style="font-size:13px;color:#c8d2dc">Welcome back, boss. Restarting…</div>');
  setTimeout(() => location.reload(), 1300);
}

function onClick(e){
  const b = e.target.closest('[data-xf]'); e.stopPropagation(); if(!b) return;
  const a = b.dataset.xf;
  if(a === 'go' || a === 'again') go(a === 'go' ? 'xfer' : null);
  if(a === 'new'){ LS('te_xfer', 'new'); close(); }
  if(a === 'cancel' || a === 'close'){ key = null; mode = 'xfer'; close(); }
}

// back in the app (RETURN TO GAME / ✕ in Chrome) → look right away
function hooks(){
  const A = P('App'), B = P('Browser');
  try{ A && A.addListener('appUrlOpen', () => check()); }catch(e){}
  try{ A && A.addListener('resume', () => check()); }catch(e){}
  try{ B && B.addListener('browserFinished', () => check()); }catch(e){}
}

function start(){
  if(!isApp()) return;
  hooks();
  if(!hadSave && !LS('te_xfer')) setTimeout(ask, 400);
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

window.XFER = {isApp, open:() => { if(isApp()){ mode = 'xfer'; ask(); } }, login:() => { if(isApp()) go('login'); }};
})();
