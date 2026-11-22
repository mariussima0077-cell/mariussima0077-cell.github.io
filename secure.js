// Torque Empire v15 – SECURE: real payments (Google Play Billing) + anti-cheat (client side).
// The online "bot" that checks players non-stop is server/worker.js (Cloudflare Worker, runs 24/7 with a cron).
(function(){
'use strict';
// ====== CONFIG – after you deploy the server, put its address here (see GOOGLE_PLAY.md) ======
const API = 'https://torque-guard.torqueempirehelp.workers.dev';            // e.g. 'https://torque-guard.YOURNAME.workers.dev'
const SALT = 'tE-v15-9c41f7';  // also set the same value as SAVE_SALT in the server
// SKUs = product IDs you create in Play Console (Monetize → Products)
const SKU = {car:'vip_car', vip:'vip_mechanic', spd2:'battle_speed_x2', sub:'vip_pass_monthly', dg:'dungeon_pass_30d',
  // v16-75 new Shop (shop2.js): Platinum subscription, one-time packs, consumable diamonds, campaign funds
  plat:'vip_pass_platinum', p1:'pack_starter', p2:'pack_rookie', p3:'pack_pro', p4:'pack_elite', p5:'pack_master', p6:'pack_legend', p7:'pack_titan',
  d1:'diamonds_300', d2:'diamonds_800', d3:'diamonds_1700', d4:'diamonds_3600', d5:'diamonds_9500', d6:'diamonds_20000',
  fn:'fund_normal', fh:'fund_hard',
  dia:'vip_pass_diamond', fdr:'founder_pass'};   // v16-122: Diamond Pass (subscription 14.99) · Founder Pass (one-time 4.99)
// v16-122 (Marius): every purchase gives VIP points – price in € × VIP_EUR (index.html, 20 points per €)
const EURO = {car:5.99, vip:3.99, spd2:2.99, sub:5.99, dg:2.99, plat:9.99, p1:.99, p2:2.99, p3:5.99, p4:9.99, p5:19.99, p6:49.99, p7:99.99, d1:1.99, d2:4.99, d3:9.99, d4:19.99, d5:49.99, d6:99.99, fn:9.99, fh:9.99, dia:14.99, fdr:4.99};
function vipBuy(k){ try{ const t=T(); if(!t||!t.addVip||!EURO[k]) return; const n=Math.round(EURO[k]*(t.VIP_EUR||20)); rebase(); t.addVip(n); rebase(); t.toast('👑 +'+n+' VIP points',2500); }catch(e){} }
const SUBS = k => k==='sub'||k==='plat'||k==='dia';                    // subscriptions
const CONS = k => k==='dg'||/^d\d$/.test(k);                // consumables (can be bought again) // v16-63: dg = DUNGEON PASS, consumable (30 days per purchase, no renewal)
const PLAY = 'https://play.google.com/billing';

const T = () => window.__TE;
const LS = (k,v) => { try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } };

// ---------- player id (anonymous) ----------
let PID = LS('te_pid');
if(!PID){ PID = (crypto.randomUUID ? crypto.randomUUID() : 'p'+Math.random().toString(36).slice(2)+Date.now().toString(36)); LS('te_pid',PID); }
// v16-104: every Player ID this phone has used (a cloud load changes the ID) – the server finds the purchases made under any of them
let PIDS = []; try{ PIDS = JSON.parse(LS('te_pids')||'[]'); }catch(e){}
if(!PIDS.includes(PID)){ PIDS.push(PID); PIDS = PIDS.slice(-5); LS('te_pids', JSON.stringify(PIDS)); }

// ---------- where are we running? ----------
// Inside the Google Play app (Trusted Web Activity) the page is opened with an android-app:// referrer.
const fromApp = document.referrer.startsWith('android-app://') || LS('te_twa')==='1';
if(document.referrer.startsWith('android-app://')) LS('te_twa','1');
// v16-68: the new native app (Capacitor) has its own payments plugin (TEBilling.java). Old test APKs without it → "update the app".
const isCap = !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
const NB = () => isCap && Capacitor.Plugins && Capacitor.Plugins.TEBilling;
const STORE_BUILD = fromApp || isCap;   // real money only in the Play app
// Test mode (packs free) ONLY for the owner: open the site once with ?dev=SECRET (?dev=off to turn it off).
const DEV_H = '8c6657646a1b238565301291ff80b48909c3bffdf73b274812a13040a6eb6458';
(function(){ const q = new URLSearchParams(location.search).get('dev'); if(q===null) return;
  const back = () => location.replace(location.pathname);
  if(q==='off'){ try{localStorage.removeItem('te_dev');}catch(e){} back(); return; }
  if(crypto.subtle) crypto.subtle.digest('SHA-256', new TextEncoder().encode(q)).then(b=>{
    const h=[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''); if(h===DEV_H) LS('te_dev',DEV_H); back(); });
})();
const TEST_MODE = !STORE_BUILD && LS('te_dev')===DEV_H;   // owner only – everyone else in the browser cannot unlock packs
// v16-91/92 (Marius): FULL TEST ACCOUNT – owner only. Works in the browser AND in the Play app:
//  • browser with TEST MODE: ?tacc=1 (on) / ?tacc=0 (off)
//  • anywhere (also the app): Shop → tap 'Player ID' 7 times → type the secret test key (same key as ?dev=…) → on. 'Back to my account' = off.
// Own player ID 'tst_…' + own save ('torqueEmpire_test') → the server hides it from every ranking and the anti-cheat bot ignores it.
(function(){ const q = new URLSearchParams(location.search), ta = q.get('tacc'); if(ta===null) return;
  if(ta==='1'){ if(LS('te_dev')===DEV_H) LS('te_tacc',DEV_H); else if(q.get('dev')!==null) LS('te_tacc_w','1'); }
  else { try{localStorage.removeItem('te_tacc');}catch(e){} }
  if(q.get('dev')===null) location.replace(location.pathname);
})();
if(LS('te_tacc_w')==='1' && LS('te_dev')===DEV_H){ LS('te_tacc',DEV_H); try{localStorage.removeItem('te_tacc_w');}catch(e){} }
const TEST_ACC = LS('te_tacc')===DEV_H;
if(TEST_ACC){ let tp = LS('te_tpid'); if(!tp || !tp.startsWith('tst_')){ tp = 'tst_' + (crypto.randomUUID ? crypto.randomUUID().replace(/-/g,'') : Math.random().toString(36).slice(2)+Date.now().toString(36)); LS('te_tpid',tp); } PID = tp; }
async function taccOn(code){ if(!crypto.subtle) return false; const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(code||'').trim()));
  const h = [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''); if(h!==DEV_H) return false;
  try{ const t=T(); if(t&&t.save) t.save(); }catch(e){} LS('te_tacc',DEV_H); location.reload(); return true; }
function taccOff(){ try{ const t=T(); if(t&&t.save) t.save(); }catch(e){} try{localStorage.removeItem('te_tacc');}catch(e){} location.reload(); }

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
const rebase = () => { last = null; };   // v16-75: after a purchase the jump is allowed
function sane(){
  const t=T(); if(!t||!t.G) return; const G=t.G;
  const lvSum = Object.values(G.lv).reduce((a,b)=>a+b,0) + Object.values(G.lx||{}).reduce((a,b)=>a+b,0)*.5;   // v16-129: extra levels (11-100) earn +2% each
  const cur = {m:G.money, tk:G.h.tk, gt:(G.gear&&G.gear.tk)||0, vip:G.vip, t:performance.now()};
  if(last){ const dt=Math.max(1,(cur.t-last.t)/1000);
    // very generous ceilings: 40× the best possible income of these levels
    const ps = 40*172*Math.pow(1.0168,lvSum);   // 40× the best possible income per second at these levels
    const capM = 600*ps + ps*dt + (t.idleNow?t.idleNow().money:0);
    if(cur.m - last.m > capM) flag('money_jump');
    if(cur.tk - last.tk > 60 + dt/60) flag('ticket_jump');
    if(cur.gt - last.gt > 80 + dt/60) flag('gear_ticket_jump');
    if(cur.vip - last.vip > 400 && !PID.startsWith('160672a2')) flag('vip_jump');   // v16-71: gift VIP 20 from Marius is not cheating
  }
  last = cur;
}
setInterval(sane, 3000);

// ---------- v16-104: memory-edit guard (GameGuardian / Cheat Engine) ----------
// money, diamonds, tickets and VIP points get a hidden coded copy that only the game itself updates.
// A memory editor changes the number but not the coded copy → 'mem_edit' (the game can never make them differ).
const K0 = (Math.random()*4294967295)>>>0, K1 = (Math.random()*4294967295)>>>0;
const gF = new Float64Array(1), gU = new Uint32Array(gF.buffer);
function guard(o, k){
  if(!o) return; const d = Object.getOwnPropertyDescriptor(o, k);
  if(d && d.get && d.get.__te) return; if(d && (d.get || d.set || d.configurable===false)) return;
  let v = o[k], m0 = 0, m1 = 0;
  const put = x => { v = x; gF[0] = typeof x==='number' ? x : NaN; m0 = gU[0]^K0; m1 = gU[1]^K1; };
  const get = () => v; get.__te = 1;
  get.ok = () => { gF[0] = typeof v==='number' ? v : NaN; return (gU[0]^K0)===m0 && (gU[1]^K1)===m1; };
  put(v); Object.defineProperty(o, k, {get, set:put, enumerable:true, configurable:true});
}
const GUARDS = G => [[G,'money'],[G,'dm'],[G,'vip'],[G.h,'tk'],[G.h,'ct'],[G.gear,'tk']];
function memCheck(){
  const t=T(); if(!t||!t.G||!t.G.h) return;
  for(const [o,k] of GUARDS(t.G)){ if(!o) continue; const d = Object.getOwnPropertyDescriptor(o,k);
    if(d && d.get && d.get.__te){ if(!d.get.ok()) flag('mem_edit'); } else guard(o,k); }
}
setInterval(memCheck, 2000);

// ---------- online check-in with the anti-cheat server ----------
let lastRep = 0, banned = false, pkChecking = false;   // pkChecking: the forced restore runs once per start
async function report(force){
  if(!API) return; const t=T(); if(!t||!t.G) return;
  if(!force && Date.now()-lastRep < 5*60e3) return; lastRep = Date.now();
  const G=t.G, own=Object.keys(G.h.own||{});
  const body = {pid:PID, v:15, app:STORE_BUILD?1:0, t:Date.now(),
    s:{money:Math.round(G.money), sold:G.sold, xp:G.xp, vip:G.vip, lv:Object.keys(G.lv).reduce((a,k)=>a+(k==="rail"?0:G.lv[k]),0), best:G.cp?G.cp.best:0,
       tk:G.h.tk, gtk:(G.gear&&G.gear.tk)||0, heroes:own.length, stars:own.reduce((a,id)=>a+(G.h.own[id].s||0),0), mythic:own.filter(id=>t.HB[id]&&t.HB[id].gr===5).length},
    flags:[...flags], pids:PIDS,
    // v16-104: packs this phone says it owns – the server compares them with the purchases Google confirmed
    pk:Object.keys(t.PK||{}).filter(k=>SKU[k] && !CONS(k) && (SUBS(k) ? +t.PK[k] > Date.now() : t.PK[k]===true))};
  try{
    const r = await fetch(API+'/api/report',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
    const j = await r.json();
    if(j.serverTime){ srvOff = j.serverTime - Date.now(); LS('te_off',String(srvOff)); }
    if(j.banned && !banned){ banned = true; showBan(j.msg); }
    if(j.pkCheck && !pkChecking){ pkChecking = true; await restore(true); setTimeout(()=>report(true), 2000); }   // v16-104: link the purchases to this ID
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
// the native plugin dressed like the Digital Goods service of the old (Chrome/TWA) version → the rest of the code stays the same
const nativeSvc = () => { const P = NB(); return P && {
  native:true,
  getDetails: async ids => ((await P.details({skus:ids})).items||[]).filter(x=>x.currency).map(x=>({itemId:x.itemId, price:{currency:x.currency, value:x.value}})),
  listPurchases: async () => ((await P.purchases()).items||[]).filter(x=>x.state===1),     // 1 = PURCHASED (2 = pending)
  consume: async token => P.consume({token}),
}; };
async function billing(){
  if(svc) return svc;
  if(isCap){ svc = nativeSvc(); return svc; }
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
  if(TEST_MODE){ t.toast('🧪 TEST MODE (browser): unlocked for free. In the Google Play app this is a real payment.',3500); vipBuy(pack); return true; }
  if(!STORE_BUILD){ t.toast('📱 Packs can be bought only in the Torque Empire app on Google Play.',3500); return false; }
  const s = await billing();
  if(!s){ t.toast(isCap?'📲 Please update Torque Empire from Google Play to buy packs.':'⚠️ Google Play payments are not available on this device.',3500); return false; }
  if(s.native) return buyNative(pack, sku, s);
  try{
    const req = new PaymentRequest([{supportedMethods:PLAY, data:{sku}}], {total:{label:'Total',amount:{currency:'EUR',value:'0'}}});
    t.toast('🛒 Opening Google Play…',2500);
    // v16-79: the old Chrome (TWA) app has no Play Billing → Google shows an error and show() may never return
    const res = await Promise.race([req.show(), new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),60e3))]);
    const token = res.details.purchaseToken || res.details.token;
    const v = await verify(sku, token, SUBS(pack)?'subs':'inapp');
    await res.complete(v.valid?'success':'fail');
    if(!v.valid){ t.toast('⚠️ Payment could not be verified. You were not charged twice – try again later.',4000); return false; }
    if(SUBS(pack) && v.expiry) t.PK[pack] = v.expiry;
    if(CONS(pack) && s.consume){ dgUsed(token); try{ await s.consume(token); }catch(e){} } // consumable → can be bought again
    vipBuy(pack); return true;
  }catch(e){ const n=(e&&(e.name||e.message))||''; if(n!=='AbortError') t.toast('📲 Payments work only in the new Torque Empire app from Google Play (this is the old Chrome version). Install the update from the Play Store.',6000); return false; }
}
async function buyNative(pack, sku, s){
  const t=T(), type = SUBS(pack)?'subs':'inapp';
  t.toast('🛒 Opening Google Play…',2500);
  // v16-78: never wait forever (a stuck call kept the Shop button dead – Marius 18 nov)
  let r; try{ r = await Promise.race([NB().buy({sku, type}), new Promise(res=>setTimeout(()=>res({err:'timeout'}),180e3))]); }
  catch(e){ t.toast('⚠️ Google Play payments are not available right now ('+((e&&(e.code||e.message))||'error')+').',4500); return false; }
  if(!r){ t.toast('⚠️ No answer from Google Play. Try again.',3500); return false; }
  if(r.cancelled) return false;
  if(r.owned){ t.toast('✓ You already own this – restoring it…',3000); await restore(); return false; }
  if(r.err){ const m={no_product:'product not found in Google Play',busy:'another payment is still open',timeout:'no answer from Google Play',no_offer:'no offer for this pass'};
    t.toast('⚠️ Payment failed ('+(m[r.err]||('code '+r.err+(r.msg?' – '+r.msg:'')))+'). You were not charged.',5000); return false; }
  if(r.pending){ t.toast('⏳ Payment pending – the pack arrives as soon as Google confirms it.',4500); return false; }
  const v = await verify(sku, r.token, type);
  if(!v.valid){ t.toast('⚠️ Payment could not be verified yet – it will be added automatically when you restart the game.',4500); return false; }
  if(SUBS(pack) && v.expiry) t.PK[pack] = v.expiry;
  if(CONS(pack)){ dgUsed(r.token); try{ await s.consume(r.token); }catch(e){} }
  vipBuy(pack); return true;
}
// DUNGEON PASS tokens already given (so a pass whose "consume" failed is not given twice)
const dgUsed = tok => { try{ const a=JSON.parse(LS('te_dgtok')||'[]'); if(tok){ a.push(tok); LS('te_dgtok',JSON.stringify(a.slice(-60))); } return a; }catch(e){ return []; } };
// prices from Play (in the player's currency)
async function prices(){
  const s = await billing(); if(!s) return null;
  try{ const d = await s.getDetails(Object.values(SKU)); const o={};
    d.forEach(it=>{ const k=Object.keys(SKU).find(k=>SKU[k]===it.itemId); if(k) o[k]=new Intl.NumberFormat(navigator.language,{style:'currency',currency:it.price.currency}).format(it.price.value); });
    return o; }catch(e){ return null; }
}
// restore purchases after reinstall / new phone
async function restore(force){   // force (v16-104): check every Play purchase again with the server, also packs already owned
  const s = await billing(); const t=T(); if(!s||!t) return;
  try{ const L = await s.listPurchases(); let ch=false;
    for(const p of L){ const k=Object.keys(SKU).find(k=>SKU[k]===p.itemId); if(!k) continue;
      if(k==='dg'){                                 // v16-68: a DUNGEON PASS that was pending / not finished → give it now
        if(!s.native) continue;
        if(!dgUsed().includes(p.purchaseToken)){ const v=await verify(p.itemId,p.purchaseToken,'inapp'); if(!v.valid) continue;
          t.PK.dg=Math.max(Date.now(),t.PK.dg||0)+30*864e5; dgUsed(p.purchaseToken); ch=true; }
        try{ await s.consume(p.purchaseToken); }catch(e){} continue; }
      if(/^d\d$/.test(k)){                          // v16-75: diamonds paid but not given yet (app closed during payment)
        if(!s.native) continue;
        if(!dgUsed().includes(p.purchaseToken)){ const v=await verify(p.itemId,p.purchaseToken,'inapp'); if(!v.valid) continue;
          dgUsed(p.purchaseToken); if(window.SHOP2) SHOP2.grant(k); }
        try{ await s.consume(p.purchaseToken); }catch(e){} continue; }
      if(SUBS(k)){ const v=await verify(p.itemId,p.purchaseToken,'subs'); if(v.valid&&v.expiry&&(!t.PK[k]||t.PK[k]<v.expiry)){ if(t.PK[k]&&t.PK[k]>Date.now()-40*864e5&&v.expiry-t.PK[k]>20*864e5) vipBuy(k); t.PK[k]=v.expiry; ch=true; if(window.SHOP2) SHOP2.grant(k,1); } }
      else if(!t.PK[k] || force){ const had=!!t.PK[k]; const v=await verify(p.itemId,p.purchaseToken,'inapp'); if(v.valid && !had){ t.PK[k]=true; ch=true; if(window.SHOP2&&/^(p\d|fn|fh)$/.test(k)) SHOP2.grant(k,1); } } }
    if(ch){ t.savePacks(); t.toast('✓ Purchases restored',2500); }
  }catch(e){}
}
setTimeout(restore, 4000);

// ---------- v16-105: Google Play Integrity (real app from Play + real phone, not rooted / emulator / modded APK) ----------
// The app asks Google for a sealed token; only our server can open it (server/worker.js → integrity). Once per 12 h.
async function integ(force){
  if(!isCap || !API || TEST_ACC) return; const P = Capacitor.Plugins && Capacitor.Plugins.TEIntegrity;
  const last = +(LS('te_integ_t')||0); if(!force && Date.now()-last < 12*3600e3) return;
  let r = {err:'no plugin (old app)'};
  const nonce = (PID.replace(/[^A-Za-z0-9]/g,'').slice(0,12) + Date.now().toString(36) + Math.random().toString(36).slice(2,12)).padEnd(24,'x');
  if(P){ try{ r = await P.token({nonce}); }catch(e){ r = {err:String((e&&e.message)||e)}; } }
  try{ const a = await fetch(API+'/api/integrity',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pid:PID, nonce, token:r.token||'', err:r.err||''})});
    const j = await a.json(); if(j.ok) LS('te_integ_t', String(Date.now())); }catch(e){}
}
setTimeout(integ, 6000);

// ---------- v16-154: KEEP THE SCREEN ON while the game is open (tester Wazza4ever, 22 nov: the phone went to sleep on the game) ----------
// Chrome / TWA: Screen Wake Lock API (released by the browser when the game is hidden → asked again when it comes back).
// Capacitor app: the next APK/AAB sets FLAG_KEEP_SCREEN_ON in MainActivity (branch `capacitor`); the WebView may not have wakeLock.
let wakeL = null;
async function keepAwake(){
  try{ if(document.visibilityState!=='visible' || wakeL || !('wakeLock' in navigator)) return;
    wakeL = await navigator.wakeLock.request('screen'); wakeL.addEventListener('release', ()=>{ wakeL = null; }); }catch(e){ wakeL = null; }
}
document.addEventListener('visibilitychange', keepAwake);
addEventListener('pointerdown', keepAwake, {passive:true});
keepAwake();

window.SEC = {integ:()=>integ(true), PID, pids:()=>PIDS.slice(), TEST_MODE, TEST_ACC, taccOn, taccOff, SAVE_KEY:TEST_ACC?'torqueEmpire_test':'torqueEmpire_v15', STORE_BUILD, buy, prices, restore, rebase, sign, now, flag, flags:()=>[...flags], report:()=>report(true), api:()=>API};
})();
