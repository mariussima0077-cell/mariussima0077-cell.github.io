// Torque Empire v15 – SECURE: real payments (Google Play Billing) + anti-cheat (client side).
// The online "bot" that checks players non-stop is server/worker.js (Cloudflare Worker, runs 24/7 with a cron).
(function(){
'use strict';
// ====== CONFIG – after you deploy the server, put its address here (see GOOGLE_PLAY.md) ======
const API = '';            // e.g. 'https://torque-guard.YOURNAME.workers.dev'
const SALT = 'tE-v15-9c41f7';  // also set the same value as SAVE_SALT in the server
// SKUs = product IDs you create in Play Console (Monetize → Products)
const SKU = {car:'vip_car', vip:'vip_mechanic', spd2:'battle_speed_x2', sub:'vip_pass_monthly'};
const PLAY = 'https://play.google.com/billing';

const T = () => window.__TE;
const LS = (k,v) => { try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } };

// ---------- player id (anonymous) ----------
let PID = LS('te_pid');
if(!PID){ PID = (crypto.randomUUID ? crypto.randomUUID() : 'p'+Math.random().toString(36).slice(2)+Date.now().toString(36)); LS('te_pid',PID); }

// ---------- where are we running? ----------
// Inside the Google Play app (Trusted Web Activity) the page is opened with an android-app:// referrer.
const fromApp = document.referrer.startsWith('android-app://') || LS('te_twa')==='1';
if(document.referrer.startsWith('android-app://')) LS('te_twa','1');
const STORE_BUILD = fromApp;            // real money only in the Play app
// Test mode (packs free) ONLY for the owner: open the site once with ?dev=SECRET (?dev=off to turn it off).
const DEV_H = '8c6657646a1b238565301291ff80b48909c3bffdf73b274812a13040a6eb6458';
(function(){ const q = new URLSearchParams(location.search).get('dev'); if(q===null) return;
  const back = () => location.replace(location.pathname);
  if(q==='off'){ try{localStorage.removeItem('te_dev');}catch(e){} back(); return; }
  if(crypto.subtle) crypto.subtle.digest('SHA-256', new TextEncoder().encode(q)).then(b=>{
    const h=[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''); if(h===DEV_H) LS('te_dev',DEV_H); back(); });
})();
const TEST_MODE = !STORE_BUILD && LS('te_dev')===DEV_H;   // owner only – everyone else in the browser cannot unlock packs

// ---------- save signature (stops editing the save file) ----------
function h32(s){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0).toString(36); }
function sign(json){ return h32(SALT+json+PID) + h32(json.length+SALT); }
const flags = new Set(JSON.parse(LS('te_flags')||'[]'));
function flag(f){ if(flags.has(f)) return; flags.add(f); LS('te_flags',JSON.stringify([...flags])); report(true); }

// ---------- time protection ----------
let srvOff = +(LS('te_off')||0);        // server time − device time (ms)
let tMax = +(LS('te_tmax')||0);
function now(){ return Date.now() + srvOff; }
function clockCheck(){
  const n = Date.now();
  if(tMax && n < tMax - 10*60e3){ flag('clock_back'); }       // device clock moved back > 10 min
  if(n > tMax){ tMax = n; LS('te_tmax', String(n)); }
}
// speed-hack: the game clock (performance.now) must run at the same speed as the real clock
let p0 = performance.now(), d0 = Date.now(), fastHits = 0;
setInterval(()=>{ const dp = performance.now()-p0, dd = Date.now()-d0; p0 = performance.now(); d0 = Date.now();
  if(dd > 2000 && dp > dd*1.6 + 1500){ if(++fastHits>=3) flag('speed_hack'); } else fastHits = Math.max(0,fastHits-1);
  clockCheck(); }, 5000);
clockCheck();

// ---------- value sanity (money / tickets can't jump more than the game can pay) ----------
let last = null;
function sane(){
  const t=T(); if(!t||!t.G) return; const G=t.G;
  const lvSum = Object.values(G.lv).reduce((a,b)=>a+b,0);
  const cur = {m:G.money, tk:G.h.tk, gt:(G.gear&&G.gear.tk)||0, vip:G.vip, t:performance.now()};
  if(last){ const dt=Math.max(1,(cur.t-last.t)/1000);
    // very generous ceilings: 40× the best possible income of these levels
    const ps = 40*172*Math.pow(1.0168,lvSum);   // 40× the best possible income per second at these levels
    const capM = 600*ps + ps*dt + (t.idleNow?t.idleNow().money:0);
    if(cur.m - last.m > capM) flag('money_jump');
    if(cur.tk - last.tk > 60 + dt/60) flag('ticket_jump');
    if(cur.gt - last.gt > 80 + dt/60) flag('gear_ticket_jump');
    if(cur.vip - last.vip > 400) flag('vip_jump');
  }
  last = cur;
}
setInterval(sane, 3000);

// ---------- online check-in with the anti-cheat server ----------
let lastRep = 0, banned = false;
async function report(force){
  if(!API) return; const t=T(); if(!t||!t.G) return;
  if(!force && Date.now()-lastRep < 5*60e3) return; lastRep = Date.now();
  const G=t.G, own=Object.keys(G.h.own||{});
  const body = {pid:PID, v:15, app:STORE_BUILD?1:0, t:Date.now(),
    s:{money:Math.round(G.money), sold:G.sold, xp:G.xp, vip:G.vip, lv:Object.values(G.lv).reduce((a,b)=>a+b,0), best:G.cp?G.cp.best:0,
       tk:G.h.tk, gtk:(G.gear&&G.gear.tk)||0, heroes:own.length, stars:own.reduce((a,id)=>a+(G.h.own[id].s||0),0), mythic:own.filter(id=>t.HB[id]&&t.HB[id].gr===5).length},
    flags:[...flags]};
  try{
    const r = await fetch(API+'/api/report',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    const j = await r.json();
    if(j.serverTime){ srvOff = j.serverTime - Date.now(); LS('te_off',String(srvOff)); }
    if(j.banned && !banned){ banned = true; showBan(j.msg); }
  }catch(e){}
}
function showBan(msg){
  const d=document.createElement('div');
  d.style.cssText='position:fixed;inset:0;z-index:99;background:#05070cee;color:#fff;display:flex;align-items:center;justify-content:center;font-family:system-ui;padding:24px;text-align:center';
  d.innerHTML='<div style="max-width:360px;border:2px solid #ff5252;border-radius:18px;padding:20px;background:#140a0a"><div style="font-size:42px">🚫</div><h2 style="color:#ff8a80;margin:6px 0">Account blocked</h2><p style="color:#ddd;line-height:1.45">'+(msg||'Our anti-cheat system found changes that are not possible in the game (edited save, money hack or speed hack).')+'</p><p style="color:#9fb0c0;font-size:12px">Player ID: '+PID+'<br>If you think this is a mistake, write to support with this ID.</p></div>';
  document.body.appendChild(d);
}
setInterval(()=>report(false), 60e3);
setTimeout(()=>report(true), 8000);
document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden') report(true); });

// ---------- Google Play Billing ----------
let svc = null;
async function billing(){
  if(svc) return svc;
  if(!('getDigitalGoodsService' in window)) return null;
  try{ svc = await window.getDigitalGoodsService(PLAY); }catch(e){ svc = null; }
  return svc;
}
async function verify(sku, token, type){
  // the server checks the purchase with Google and ACKNOWLEDGES it (otherwise Google refunds it after 3 days)
  if(!API) return {valid:true, offline:true};
  try{ const r = await fetch(API+'/api/purchase',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pid:PID, sku, token, type})}); return await r.json(); }
  catch(e){ return {valid:false, err:'network'}; }
}
// returns: true (bought) / false (cancelled or failed)
async function buy(pack){
  const sku = SKU[pack]; const t=T();
  if(TEST_MODE){ t.toast('🧪 TEST MODE (browser): unlocked for free. In the Google Play app this is a real payment.',3500); return true; }
  if(!STORE_BUILD){ t.toast('📱 Packs can be bought only in the Torque Empire app on Google Play.',3500); return false; }
  const s = await billing();
  if(!s){ t.toast('⚠️ Google Play payments are not available on this device.',3500); return false; }
  try{
    const req = new PaymentRequest([{supportedMethods:PLAY, data:{sku}}], {total:{label:'Total',amount:{currency:'EUR',value:'0'}}});
    const res = await req.show();
    const token = res.details.purchaseToken || res.details.token;
    const v = await verify(sku, token, pack==='sub'?'subs':'inapp');
    await res.complete(v.valid?'success':'fail');
    if(!v.valid){ t.toast('⚠️ Payment could not be verified. You were not charged twice – try again later.',4000); return false; }
    if(pack==='sub' && v.expiry) t.PK.sub = v.expiry;
    return true;
  }catch(e){ return false; }
}
// prices from Play (in the player's currency)
async function prices(){
  const s = await billing(); if(!s) return null;
  try{ const d = await s.getDetails(Object.values(SKU)); const o={};
    d.forEach(it=>{ const k=Object.keys(SKU).find(k=>SKU[k]===it.itemId); if(k) o[k]=new Intl.NumberFormat(navigator.language,{style:'currency',currency:it.price.currency}).format(it.price.value); });
    return o; }catch(e){ return null; }
}
// restore purchases after reinstall / new phone
async function restore(){
  const s = await billing(); const t=T(); if(!s||!t) return;
  try{ const L = await s.listPurchases(); let ch=false;
    for(const p of L){ const k=Object.keys(SKU).find(k=>SKU[k]===p.itemId); if(!k) continue;
      if(k==='sub'){ const v=await verify(p.itemId,p.purchaseToken,'subs'); if(v.valid&&v.expiry&&(!t.PK.sub||t.PK.sub<v.expiry)){ t.PK.sub=v.expiry; ch=true; } }
      else if(!t.PK[k]){ const v=await verify(p.itemId,p.purchaseToken,'inapp'); if(v.valid){ t.PK[k]=true; ch=true; } } }
    if(ch){ t.savePacks(); t.toast('✓ Purchases restored',2500); }
  }catch(e){}
}
setTimeout(restore, 4000);

window.SEC = {PID, TEST_MODE, STORE_BUILD, buy, prices, restore, sign, now, flag, flags:()=>[...flags], report:()=>report(true), api:()=>API};
})();
