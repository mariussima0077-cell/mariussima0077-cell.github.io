// Torque Empire – Google sign-in + cloud save.
// The player can (optionally) sign in with Google in the Shop. The save is then kept on our server (Torque Guard, Cloudflare)
// and comes back on a new phone / after reinstall. The server keeps only a HASH of the Google account ID – never e-mail or name.
(function(){
'use strict';
// OAuth "Web application" client ID from Google Cloud Console (public, not a secret). Empty = sign-in hidden for players.
const CLIENT_ID = '';
const SAVE_KEY = 'torqueEmpire_v15';
const T = () => window.__TE;
const LS = (k,v) => { try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){ return null; } };
const API = () => window.SEC && SEC.api();
let sess = LS('te_sess'), syncedT = +(LS('te_cloud_t')||0), lastHash = '', lastOk = 0, busy = false, gisLoaded = false, delArm = 0, asking = false;

async function call(op, body, keep){
  if(!API()) return {err:'offline'};
  try{ const r = await fetch(API()+'/api/cloud/'+op,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),keepalive:!!keep}); return await r.json(); }
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
  busy = true;
  const r = await call('save',{sess, pid:SEC.PID, save:raw, sig, sum:sumOf(raw), base:syncedT}, keep);
  busy = false;
  if(r.ok){ lastHash=hh; lastOk=Date.now(); setSynced(r.t); refresh(); }
  else if(r.err==='conflict') choose({t:r.t, sum:r.sum}, 'Your game was saved on another phone after this one.');
  else if(r.err==='signed_out'){ setSess(null); setSynced(0); refresh(); }
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
  d.style.cssText='position:fixed;inset:0;z-index:98;background:#05070cdd;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui;color:#fff';
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
  const r = await call('login',{cred:resp.credential, pid:SEC.PID});
  if(!r.ok){ toast(r.err==='network'||r.err==='offline'?'⚠️ No internet – try again.':'⚠️ Google sign-in failed. Try again.',3500); return; }
  setSess(r.sess); toast('✓ Signed in with Google',2500);
  if(r.t && r.sum) choose({t:r.t, sum:r.sum}); else { setSynced(0); await upload(true); }
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

// ---------- the box at the bottom of the Shop ----------
let box = null;
function mount(el){ box = el; refresh(); }
function refresh(){
  if(!box || !document.body.contains(box)) return;
  const st = 'background:#141c2b;border:1px solid #e0a82e55;border-radius:14px;padding:12px;margin:10px 0;font-size:13px;line-height:1.45';
  if(!CLIENT_ID){ box.innerHTML = SEC.TEST_MODE ? '<div style="'+st+'">☁️ <b>Google sign-in</b> – waiting for the Client ID (see PLAY_RULES.md). Players don\'t see this box yet.</div>' : ''; return; }
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
    if(r.ok && r.t && r.t > syncedT + 1000) choose({t:r.t, sum:r.sum}, 'Your Google account has a newer game from another phone.');
    else upload(false);
  }, 6000);
  setInterval(()=>upload(false), 3*60e3);
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') upload(false, true); });
}

window.CLOUD = {mount, refresh, on:()=>!!(CLIENT_ID&&sess)};
})();
