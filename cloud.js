// Torque Empire – Google sign-in + cloud save.
// The player can (optionally) sign in with Google in the Shop. The save is then kept on our server (Torque Guard, Cloudflare)
// and comes back on a new phone / after reinstall. The server keeps only a HASH of the Google account ID – never e-mail or name.
(function(){
'use strict';
// OAuth "Web application" client ID from Google Cloud Console (public, not a secret). Empty = sign-in hidden for players.
const CLIENT_ID = '1041720099519-ogooa4hblh8d4s96ieervv9rp7bqh2k5.apps.googleusercontent.com';
const SAVE_KEY = (window.SEC && SEC.SAVE_KEY) || 'torqueEmpire_v15';
const TACC = !!(window.SEC && SEC.TEST_ACC);   // v16-91: the test account never touches the cloud save
const T = () => window.__TE;
const LS = (k,v) => { try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){ return null; } };
const API = () => window.SEC && SEC.api();
// v16-44: game servers. Only S1 is open now. Each server = its own game; the cloud keeps one save per Google account per server.
// ⚠️ Before opening S2: give each server its own local save key (SAVE_KEY+'_s2') – see NEXT_STEPS.md.
const SERVERS = [
  {id:1, n:'S1 · Torque City', st:'open', open:Date.UTC(2026,10,19,17)},   // v16-193 open = opening date (Grand Prix = open + 3 days) – same in server/online.js SRV_OPEN; set it again at the launch reset
  {id:2, n:'S2 · Nitro Bay',   st:'soon', open:0},
];
let srv = +(LS('te_srv')||1); if(!SERVERS.find(x=>x.id===srv && x.st==='open')) srv = 1;
let sess = LS('te_sess'), syncedT = +(LS('te_cloud_t')||0), lastHash = '', lastOk = 0, busy = false, gisLoaded = false, delArm = 0, asking = false;

async function call(op, body, keep){
  if(!API() || TACC) return {err:'offline'};
  try{ const r = await fetch(API()+'/api/cloud/'+op,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),keepalive:!!keep}); const j = await r.json(); if(j && j.wipe && window.SEC && SEC.wipe) SEC.wipe(); return j; }
  catch(e){ return {err:'network'}; }
}
function h32(s){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0).toString(36); }
function sumOf(raw){ try{ const s=JSON.parse(raw); return {m:Math.round(s.money||0), s:s.sold||0, lv:Object.values(s.lv||{}).reduce((a,b)=>a+b,0), cp:(s.cp&&s.cp.best)||0, h:Object.keys((s.h&&s.h.own)||{}).length}; }catch(e){ return {}; } }
function local(){ const t=T(); if(t&&t.save) t.save(); return {raw:LS(SAVE_KEY)||'', sig:LS(SAVE_KEY+'_s')||''}; }
function setSess(s){ sess=s; LS('te_sess',s); }
function setSynced(t){ syncedT=t; LS('te_cloud_t',String(t)); }
const fmt = n => { const t=T(); return t&&t.fmt ? t.fmt(n) : '$'+n; };
const when = t => t ? new Date(t).toLocaleString([], {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—';
const toast = (m,d) => { const t=T(); if(t&&t.toast) t.toast(m,d||3000); };

// ---------- upload ----------
async function upload(force, keep){
  if(!sess || busy || asking) return;
  const {raw,sig} = local(); if(!raw) return;
  const hh = h32(raw); if(!force && hh===lastHash) return;
  busy = true; LS('te_cloud_pend', hh);                   // v16-64: remember what we sent (the answer can be lost when the app closes)
  const r = await call('save',{sess, pid:SEC.PID, save:raw, sig, sum:Object.assign(sumOf(raw),{hh}), base:syncedT}, keep);
  busy = false;
  if(r.ok){ lastHash=hh; lastOk=Date.now(); setSynced(r.t); refresh(); }
  else if(r.err==='conflict'){ if(sameGame({t:r.t, sum:r.sum})){ lastHash=''; upload(true); } else choose({t:r.t, sum:r.sum}, 'Your game was saved on another phone after this one.'); }
  else if(r.err==='signed_out'){ setSess(null); setSynced(0); refresh(); }
}

// v16-64: is the cloud save simply THIS phone's game? Then nothing is asked.
// Why the window came back again and again: when the app goes to the background the game sends the save (keepalive),
// the server stores it with a new time, but the phone closes the app before reading the answer → on the next start
// the cloud looked "newer" although it was the same game (same money, cars, levels…).
// Now: the save carries a fingerprint (hh). Same fingerprint / same progress / this phone further ahead → it's ours.
function sameGame(meta){
  const cs = (meta && meta.sum) || {}, raw = local().raw, ls = sumOf(raw);
  let ours = !!cs.hh && (cs.hh === LS('te_cloud_pend') || cs.hh === h32(raw));
  if(!ours){ const k = ['lv','cp','h','s','m'];               // the cloud is not ahead in anything → this phone has all of it
    ours = k.every(x => (ls[x]||0) >= (cs[x]||0)); }
  if(ours) setSynced(meta.t||0);
  return ours;
}

// ---------- the choice: this phone or the cloud (always shown side by side, the player decides) ----------
function card(title, s, t, btn, cls){
  s = s||{};
  return '<div style="flex:1;background:#141c2b;border:2px solid '+(cls?'#ffb300':'#2b3a52')+';border-radius:14px;padding:10px;min-width:0">'+
   '<b style="font-size:15px">'+title+'</b><div style="font-size:12px;color:#9fb0c0;margin:2px 0 8px">'+when(t)+'</div>'+
   '<div style="font-size:13px;line-height:1.6">💰 '+fmt(s.m||0)+'<br>🚗 '+(s.s||0)+' cars sold<br>🏗️ buildings LV '+(s.lv||0)+'<br>⚔️ stage '+(s.cp||0)+'<br>🧑‍🔧 '+(s.h||0)+' heroes</div>'+
   '<button data-cl="'+btn+'" style="margin-top:10px;width:100%;padding:10px 4px;border:0;border-radius:999px;font-weight:900;font-size:13px;background:'+(cls?'linear-gradient(#ffd54a,#ff9800)':'#2b3a52')+';color:'+(cls?'#1a1200':'#fff')+'">'+(btn==='local'?'KEEP THIS':'USE CLOUD')+'</button></div>';
}
function choose(cloudMeta, why){
  if(asking) return; asking = true;
  const {raw} = local(), ls = sumOf(raw), cs = cloudMeta.sum||{};
  const rank = s => [s.lv||0, s.cp||0, s.h||0, s.s||0, s.m||0];
  const rc = rank(cs), rl = rank(ls); let better = false;
  for(let i=0;i<rc.length;i++){ if(rc[i]!==rl[i]){ better = rc[i] > rl[i]; break; } }   // the cloud game is further ahead
  const d = document.createElement('div');
  d.style.cssText='position:fixed;inset:0;z-index:98;background:#05070cdd;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Game,system-ui;color:#fff';
  d.innerHTML='<div style="max-width:420px;width:100%;background:#0e1520;border:2px solid #e0a82e;border-radius:18px;padding:14px">'+
   '<div style="font-size:18px;font-weight:900;text-align:center">☁️ Which game do you keep?</div>'+
   '<div style="font-size:13px;color:#cfd8e3;text-align:center;margin:6px 0 12px">'+(why||'There is already a game saved in your Google account.')+' The other one will be replaced.</div>'+
   '<div style="display:flex;gap:8px">'+card('📱 This phone', ls, Date.now(), 'local', !better)+card('☁️ Google cloud', cs, cloudMeta.t, 'cloud', better)+'</div></div>';
  d.addEventListener('click', async e=>{
    const b = e.target.closest('[data-cl]'); if(!b) return;
    d.querySelectorAll('button').forEach(x=>x.disabled=true);
    if(b.dataset.cl==='cloud'){
      const r = await call('load',{sess});
      if(!r.ok || !r.save){ toast('⚠️ Could not download the cloud save. Try again later.',3500); d.remove(); asking=false; return; }
      window.__noSave = 1;                                   // stop the game from writing the old save over it
      LS(SAVE_KEY, r.save); LS(SAVE_KEY+'_s', r.sig||''); if(r.pid) LS('te_pid', r.pid); setSynced(r.t);
      location.reload();
    } else { d.remove(); asking=false; setSynced(cloudMeta.t||0); lastHash=''; await upload(true); toast('☁️ This phone\'s game is now saved in your Google account',3000); }
  });
  document.body.appendChild(d);
}

// ---------- Google sign-in ----------
async function onCred(resp){
  const r = await call('login',{cred:resp.credential, pid:SEC.PID, srv});
  if(!r.ok){ toast(r.err==='network'||r.err==='offline'?'⚠️ No internet – try again.':'⚠️ Google sign-in failed. Try again.',3500); return; }
  setSess(r.sess); toast('✓ Signed in with Google',2500);
  if(r.t && r.sum && !sameGame({t:r.t, sum:r.sum})) choose({t:r.t, sum:r.sum}); else { if(!r.t) setSynced(0); lastHash=''; await upload(true); }
  refresh();
}
function loadGis(cb){
  if(window.google && google.accounts && google.accounts.id){ cb(); return; }
  if(gisLoaded) return; gisLoaded = true;
  const s = document.createElement('script'); s.src='https://accounts.google.com/gsi/client'; s.async=true;
  s.onload = ()=>{ google.accounts.id.initialize({client_id:CLIENT_ID, callback:onCred, ux_mode:'popup', auto_select:false, use_fedcm_for_button:true}); cb(); };
  s.onerror = ()=>{ gisLoaded=false; };
  document.head.appendChild(s);
}

// ---------- v16-44: the box on the start screen (server + Google account) ----------
let sbox = null;
function mountStart(el){ sbox = el; el.addEventListener('click', e=>e.stopPropagation()); refreshStart(); }
function refreshStart(){
  if(!sbox) return;
  const S = SERVERS.find(x=>x.id===srv)||SERVERS[0];
  let acc;
  const app = !!(window.XFER && XFER.isApp());
  if(app && !sess) acc = '<button data-glo="1" style="width:100%;max-width:280px;margin:0 auto;display:flex;align-items:center;justify-content:center;gap:10px;padding:9px 12px;border:1px solid #dadce0;border-radius:999px;background:#fff;color:#3c4043;font:600 14px Game,system-ui"><svg width="18" height="18" viewBox="0 0 48 48" style="flex:none"><path fill="#EA4335" d="M24 9.5c3.5 0 6.7 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.8 6.1C6.6 42.6 14.6 48 24 48z"/></svg>Continue with Google</button>'+'<div style="font-size:11px;color:#c8d2dc;text-align:center;margin-top:5px">Optional · keeps your game safe on a new phone</div><button data-xfo="1" style="width:100%;margin-top:7px;padding:7px;border:0;border-radius:999px;background:#2e7d32;color:#fff;font:900 12px Game,system-ui">📲 TRANSFER FROM OLD VERSION</button>';
  else if(!CLIENT_ID) acc = '';
  else if(sess) acc = '<div style="display:flex;align-items:center;justify-content:center;gap:6px;font-size:13px;font-weight:800;color:#7ee787">✓ Google account · ☁️ Cloud save ON</div><div style="font-size:11px;color:#b8c4d0;text-align:center;margin-top:2px">Last saved: '+when(syncedT)+'</div>';
  else acc = '<div id="gsiStart" style="min-height:40px;display:flex;justify-content:center"></div><div style="font-size:11px;color:#c8d2dc;text-align:center;margin-top:5px">Optional · keeps your game safe on a new phone</div>';
  sbox.innerHTML = '<div style="width:min(88vw,330px);margin:0 auto;background:#0b1420d9;border:2px solid #e0a82e;border-radius:16px;padding:10px 12px;box-shadow:0 6px 20px #000a;font-family:Game,system-ui;color:#fff">'+
   '<button data-sv="open" style="width:100%;display:flex;align-items:center;gap:8px;background:#162235;border:1px solid #2b3a52;border-radius:12px;padding:8px 10px;color:#fff;font:800 14px Game,system-ui;margin-bottom:'+(acc?'9px':'0')+'">'+
   '<span style="font-size:18px">🌍</span><span style="flex:1;text-align:left"><span style="font-size:10px;color:#9fb0c0;display:block;letter-spacing:.5px">SERVER</span>'+S.n+'</span><span style="color:#7ee787;font-size:11px">● ONLINE</span><span style="color:#ffd54a;font-size:13px">▾</span></button>'+acc+'</div>';
  if(CLIENT_ID && !sess && !app) loadGis(()=>{ const b=document.getElementById('gsiStart'); if(b) google.accounts.id.renderButton(b,{theme:'outline',size:'large',shape:'pill',text:'continue_with',width:280}); });
}
function serverList(){
  const d = document.createElement('div');
  d.style.cssText='position:fixed;inset:0;z-index:98;background:#05070cdd;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Game,system-ui;color:#fff';
  d.innerHTML='<div style="max-width:360px;width:100%;background:#0e1520;border:2px solid #e0a82e;border-radius:18px;padding:14px">'+
   '<div style="font-size:18px;font-weight:900;text-align:center;margin-bottom:10px">🌍 Choose a server</div>'+
   SERVERS.map(x=>{ const on=x.st==='open', cur=x.id===srv;
     return '<button data-sv="'+(on?'pick':'')+'" data-id="'+x.id+'" style="width:100%;display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:11px 12px;border-radius:12px;font:800 14px Game,system-ui;color:'+(on?'#fff':'#7d8a99')+';background:'+(cur?'#2a2410':'#141c2b')+';border:2px solid '+(cur?'#ffb300':'#2b3a52')+'">'+
       '<span style="flex:1;text-align:left">'+x.n+'</span>'+(cur?'<span style="color:#ffd54a;font-size:11px">YOUR GAME</span>':on?'<span style="color:#7ee787;font-size:11px">● ONLINE</span>':'<span style="font-size:11px">🔒 COMING SOON</span>')+'</button>'; }).join('')+
   '<div style="font-size:11px;color:#9fb0c0;text-align:center;margin:2px 0 10px">Each server is a separate game. New servers open as more players join.</div>'+
   '<button data-sv="close" style="width:100%;padding:10px;border:0;border-radius:999px;background:#2b3a52;color:#fff;font:900 14px Game,system-ui">CLOSE</button></div>';
  d.addEventListener('click', e=>{ e.stopPropagation();
    const b=e.target.closest('[data-sv]'); if(!b){ if(e.target===d) d.remove(); return; }
    if(b.dataset.sv==='close'){ d.remove(); return; }
    if(b.dataset.sv==='pick'){ const id=+b.dataset.id; if(id!==srv){ srv=id; LS('te_srv',String(id)); } d.remove(); refreshStart(); }
  });
  document.body.appendChild(d);
}
document.addEventListener('click', e=>{ if(e.target.closest('[data-xfo]')){ e.stopPropagation(); window.XFER && XFER.open(); } }, true);
document.addEventListener('click', e=>{ if(e.target.closest('[data-glo]')){ e.stopPropagation(); window.XFER && XFER.login(); } }, true);   // v16-67: Google in the app → Chrome (glogin.html)
document.addEventListener('click', e=>{ const b=e.target.closest('[data-sv="open"]'); if(b){ e.stopPropagation(); serverList(); } }, true);

// ---------- the box at the bottom of the Shop ----------
let box = null;
function mount(el){ box = el; refresh(); }
function refresh(){
  refreshStart();
  if(!box || !document.body.contains(box)) return;
  const st = 'background:#141c2b;border:1px solid #e0a82e55;border-radius:14px;padding:12px;margin:10px 0;font-size:13px;line-height:1.45';
  if(!CLIENT_ID){ box.innerHTML = SEC.TEST_MODE ? '<div style="'+st+'">☁️ <b>Google sign-in</b> – waiting for the Client ID (see PLAY_RULES.md). Players don\'t see this box yet.</div>' : ''; return; }
  if(!sess && window.XFER && XFER.isApp()){ box.innerHTML = '<div style="'+st+'"><b style="font-size:15px">📲 Old version</b><br>Played before in the old (Chrome) version on this phone? Bring your progress here.<button data-xfo="1" style="width:100%;margin-top:10px;padding:10px;border:0;border-radius:999px;background:#2e7d32;color:#fff;font:900 13px Game,system-ui">TRANSFER MY PROGRESS</button></div>'+
    '<div style="'+st+'"><b style="font-size:15px">☁️ Cloud save</b><br>Sign in with Google to keep your progress safe and play on another phone. We only keep your game – not your e-mail or name.<div style="margin-top:10px">'+'<button data-glo="1" style="width:100%;max-width:260px;margin:0 auto;display:flex;align-items:center;justify-content:center;gap:10px;padding:9px 12px;border:1px solid #dadce0;border-radius:999px;background:#fff;color:#3c4043;font:600 14px Game,system-ui"><svg width="18" height="18" viewBox="0 0 48 48" style="flex:none"><path fill="#EA4335" d="M24 9.5c3.5 0 6.7 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.8 6.1C6.6 42.6 14.6 48 24 48z"/></svg>Continue with Google</button>'+'</div></div>'; return; }
  if(!sess){
    box.innerHTML = '<div style="'+st+'"><b style="font-size:15px">☁️ Cloud save</b><br>Sign in with Google to keep your progress safe and play on another phone. We only keep your game – not your e-mail or name.<div id="gsiBtn" style="margin-top:10px;min-height:44px;display:flex;justify-content:center"></div></div>';
    loadGis(()=>{ const b=document.getElementById('gsiBtn'); if(b) google.accounts.id.renderButton(b,{theme:'filled_black',size:'large',shape:'pill',text:'continue_with',width:260}); });
    return;
  }
  const bs = 'flex:1;padding:9px 4px;border:0;border-radius:999px;font-weight:800;font-size:12px;color:#fff;background:#2b3a52';
  box.innerHTML = '<div style="'+st+'"><b style="font-size:15px">☁️ Cloud save: ON</b> <span style="color:#7ee787">✓ Google</span><br><span style="color:#9fb0c0">Last saved: '+when(syncedT)+' · saves by itself every few minutes</span>'+
    '<div style="display:flex;gap:6px;margin-top:10px"><button data-cb="save" style="'+bs+';background:#2e7d32">SAVE NOW</button><button data-cb="out" style="'+bs+'">SIGN OUT</button><button data-cb="del" style="'+bs+';background:#7a1f1f">'+(delArm>Date.now()?'TAP AGAIN':'DELETE')+'</button></div>'+
    '<div style="font-size:11px;color:#9fb0c0;margin-top:6px">DELETE removes your cloud save and Google link from our server. The game on this phone stays.</div></div>';
}
document.addEventListener('click', async e=>{
  const b = e.target.closest('[data-cb]'); if(!b) return;
  const a = b.dataset.cb;
  if(a==='save'){ await upload(true); toast('☁️ Saved',1800); }
  if(a==='out'){ setSess(null); setSynced(0); if(window.google&&google.accounts) google.accounts.id.disableAutoSelect(); toast('Signed out. Your game stays on this phone.',2500); refresh(); }
  if(a==='del'){
    if(delArm < Date.now()){ delArm = Date.now()+4000; refresh(); setTimeout(refresh,4100); return; }
    const r = await call('delete',{sess}); delArm = 0;
    if(r.ok||r.err==='signed_out'){ setSess(null); setSynced(0); toast('🗑️ Cloud save and Google link deleted',3000); } else toast('⚠️ Could not delete – check internet.',3000);
    refresh();
  }
});

// ---------- start: did another phone save after this one? ----------
if(CLIENT_ID && sess){
  setTimeout(async ()=>{
    const r = await call('meta',{sess});
    if(r.err==='signed_out'){ setSess(null); setSynced(0); return; }
    if(r.ok && r.t && r.t > syncedT + 1000 && !sameGame({t:r.t, sum:r.sum})) choose({t:r.t, sum:r.sum}, 'Your Google account has a newer game from another phone.');
    else upload(false);
  }, 6000);
  setInterval(()=>upload(false), 3*60e3);
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') upload(false, true); });
}

window.CLOUD = {mount, mountStart, refresh, srv:()=>srv, srvOpen:id=>{const x=SERVERS.find(s=>s.id===id);return x&&x.open||0;}, on:()=>!!(CLIENT_ID&&sess), cred:c=>onCred({credential:c})};
})();
