// Torque Empire v16-75 – NEW SHOP (Marius, 18 nov 2026): one-time packs in a chain, diamonds, VIP Pass Silver / Gold / Platinum, Campaign Funds.
// ⚠️ Sells diamonds + tickets for real money → Play "random items" = YES. LIVE stays false until Play Console is updated (see PLAY_RULES.md).
// Until then only the owner's TEST MODE (browser, ?dev=…) sees it.
(function(){
'use strict';
const LIVE = true;                         // ← true only after: Classification "random items" = Oui, IARC redone, Belgium removed, products created
const T = () => window.__TE;
const DMh='<img class="tki" src="img/ui/diamond.svg" alt="">'; // v16-140: the game's diamond icon instead of the 💎 emoji
const DAY = 864e5;
const now = () => (window.SEC && SEC.now ? SEC.now() : Date.now());
const today = () => { const d = new Date(now()); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); };

// ---------------- what is sold ----------------
// one-time packs, in a chain (the next opens after the previous one is bought)
const PACKS = [
  {k:'p1', n:'STARTER PACK', rib:'BEST START', cls:'st0', price:'€0.99', val:10, hero:'m3_1', dm:300,  tk:10, pk:{r:300,bk:1000}},   // v16-129: no more cash in packs (cash buys Cash Roulette spins) → garage parts
  {k:'p2', n:'ROOKIE PACK',  cls:'st1', price:'€2.99', val:8, hero:'m3_5', dm:800,  tk:20, gt:10, pk:{r:600,bk:2000}},
  {k:'p3', n:'PRO PACK',     cls:'st2', price:'€5.99', val:7, hero:'m4_0', dm:1500, tk:30, gt:20, pk:{r:1200,bk:4000}},
  {k:'p4', n:'ELITE PACK',   cls:'st3', price:'€9.99', val:6, hero:'m4_5', dm:3000, tk:50, gt:30, ct:20, pk:{r:2500,bk:8000}},
];
const DIAMONDS = [
  {k:'d1', dm:300,   price:'€1.99',  ic:'ui3/v_dm'},
  {k:'d2', dm:800,   price:'€4.99',  ic:'ui3/v_dm'},
  {k:'d3', dm:1700,  price:'€9.99',  ic:'ui3/sp_dm'},
  {k:'d4', dm:3600,  price:'€19.99', ic:'ui3/sp_dm', big:1},
  {k:'d5', dm:9500,  price:'€49.99', ic:'ui3/sp_dm', big:1},
  {k:'d6', dm:20000, price:'€99.99', ic:'ui3/sp_chest', big:1},
];
// VIP Pass tiers – v16-84: they STACK (one of each can be active at once, bonuses add up). gold = the old subscription product vip_pass_monthly (PK.sub = expiry)
const PASS = {
  sil:  {n:'SILVER PASS',   mult:1.2, idle:1, cost:1500, day:{tk:1}},
  gold: {n:'GOLD PASS',     mult:1.5, idle:2, price:'€5.99', start:300, day:{dm:100, tk:2}, spd:1},
  plat: {n:'PLATINUM PASS', mult:2,   idle:4, price:'€9.99', start:600, day:{dm:200, tk:3, gt:2}, spd:1, auto:1},
  dia:  {n:'DIAMOND PASS',  mult:1,   idle:0, price:'€14.99', start:900, day:{dm:300, tk:2}},   // v16-122 (Marius, 21 nov 2026): diamonds only – 9,900 💎 / 30 days, no VIP bonus (same 💎 per € as Platinum)
};
// Campaign Funds: rewards at every 5th chapter (NORMAL / HARD)
const FUND = {
  fn: {n:'CAMPAIGN FUND · NORMAL', price:'€9.99', hard:0, ms:[800,800,1000,1000,1000,1200,1200,1200,1500,1500].map((dm,i)=>({dm, tk:i===9?10:5}))},
  fh: {n:'CAMPAIGN FUND · HARD',   price:'€9.99', hard:1, ms:[1200,1200,1500,1500,1500,1800,1800,1800,2200,2200].map((dm,i)=>({dm, tk:i===9?10:5, gt:i===9?5:3}))},
};
const SPC = 20;                           // stages per chapter (battle.js)

// ---------------- state ----------------
const PK = () => T().PK;
const S = () => { const G=T().G; if(!G.shop) G.shop={fx:{}, day:'', ge:0, pe:0, fn:[], fh:[]}; const s=G.shop; s.fx=s.fx||{}; s.fn=s.fn||[]; s.fh=s.fh||[]; return s; };
const on = k => (PK()[k]||0) > now();
// v16-123: Diamond Pass + Founder Pass are shown only after their products exist in Play Console (Marius does it before the opening)
const NEWP = () => !!(window.SEC && SEC.TEST_MODE) || !!window.TE_NEWP;
const expKey = {sil:'sil', gold:'sub', plat:'plat', dia:'dia'};
function tier(){ if(on('plat')) return 'plat'; if(on('sub')) return 'gold'; if(on('sil')) return 'sil'; if(on('dia')) return 'dia'; return null; }   // the best active one (name / colour)
const actv = () => ['sil','gold','plat','dia'].filter(k=>on(expKey[k]));                       // v16-84: every active pass
const stackMult = () => { const a=actv(); return a.length ? Math.round((1+a.reduce((x,k)=>x+PASS[k].mult-1,0))*10)/10 : PASS.gold.mult; };  // +20% / +50% / +100% add up
const daysLeft = k => Math.max(1, Math.ceil(((PK()[k]||0)-now())/DAY));

// ---------------- giving things ----------------
function rwText(r){ const a=[];
  if(r.hero){ const h=T().HB[r.hero]; a.push((h?h.n:'Hero')); }
  if(r.dm) a.push(DMh+' '+r.dm.toLocaleString('en')); if(r.tk) a.push(r.tk+' Recruit'); if(r.gt) a.push(r.gt+' Gear'); if(r.ct) a.push(r.ct+' Crew');
  if(r.money) a.push(T().fmt(r.money)); if(r.pk) a.push(r.pk.r+' of each role part + '+r.pk.bk+' Builder Kit'); return a.join(' + '); }
function give(r, why){
  const t=T(), G=t.G;
  if(r.hero && t.gain){ t.gain(r.hero); if(t.heroRefresh) t.heroRefresh(); }
  t.giveRw({dm:r.dm||0, tk:r.tk||0, gt:r.gt||0, ct:r.ct||0, money:r.money||0, pk:r.pk||null});
  if(window.SEC && SEC.rebase) SEC.rebase();          // big jumps from a purchase are not cheating
  t.save(); if(why) t.toast('🎁 '+why+': '+rwText(r), 4500);
  render();
}
// called after a successful payment (and by SEC.restore for purchases found again)
function grant(k, quiet){
  const p=PACKS.find(x=>x.k===k); if(p){ PK()[k]=true; t_save(); give(p, quiet?'Restored '+p.n:p.n); return; }
  const d=DIAMONDS.find(x=>x.k===k); if(d){ const s=S(), x2=!s.fx[k]; s.fx[k]=1; give({dm:d.dm*(x2?2:1)}, x2?'Diamonds ×2 (first time)':'Diamonds'); return; }
  if(k==='fn'||k==='fh'){ PK()[k]=true; t_save(); if(!quiet) T().toast('🏁 '+FUND[k].n+' unlocked! Claim your rewards.',4000); render(); return; }
  if(k==='plat'||k==='sub'||k==='dia'){ passTick(); T().vipRefresh(); render(); return; }
}
const t_save = () => T().savePacks();

// the pass: start bonus once per new period + daily gift + Platinum auto-collect
function passTick(){
  const t=T(); if(!t||!t.G||!api.live) return; const s=S(), tr=tier();
  for(const [k,key,f] of [['gold','sub','ge'],['plat','plat','pe'],['dia','dia','de']]){
    const e=PK()[key]||0; if(e>now() && e!==s[f]){ s[f]=e; give({dm:PASS[k].start}, PASS[k].n); } }
  for(const k of actv()){ s.dd=s.dd||{}; if(s.dd[k]!==today()){ s.dd[k]=today(); if(s.day!==today()+k) give(PASS[k].day, PASS[k].n+' · daily gift'); } }   // v16-84: every active pass gives its own gift (s.day = old one-gift key, so no double gift today)
  if(on('plat') && t.idleNow && t.claimIdle && t.idleMax){ const I=t.idleNow(); if(I.hrs>=t.idleMax()-0.01 && I.money>0){ t.claimIdle(); t.toast('🧰 Platinum Pass: Idle Rewards collected automatically',3000); } }
}

// ---------------- buying ----------------
let busy=false;
async function buy(k){
  if(busy) return; busy=true;
  try{
    if(k==='sil'){                                       // paid with diamonds earned in the game
      const G=T().G, c=PASS.sil.cost;
      if(on('sil')){ T().toast('Silver Pass is already active.',2500); return; }
      if((G.dm||0)<c){ T().toast(DMh+' Not enough diamonds ('+(G.dm||0).toLocaleString('en')+' / '+c.toLocaleString('en')+')',3000); return; }
      if(conf!=='sil'){ conf='sil'; render(); setTimeout(()=>{ if(conf==='sil'){ conf=''; render(); } },4000); return; }
      conf=''; G.dm-=c; PK().sil=now()+30*DAY; t_save(); T().save(); T().vipRefresh(); T().toast('🥈 Silver Pass active for 30 days!',3500); passTick(); render(); return;
    }
    if((k==='sub'||k==='plat'||k==='dia') && on(k)){ T().toast('This VIP Pass is already active.',3000); return; }   // v16-84: other passes may be active
    const ok = await Promise.race([SEC.buy(k), new Promise(res=>setTimeout(()=>res(false),200e3))]);   // v16-78: the button never stays dead
    if(!ok) return;
    if((k==='sub'||k==='plat'||k==='dia') && !(PK()[k]>now())) PK()[k]=now()+30*DAY;   // test mode / missing expiry
    t_save(); grant(k);
  } finally { busy=false; }
}
let conf='';

// ---------------- campaign funds ----------------
function chDone(hard){ const G=T().G; const b=hard?((G.cph&&G.cph.best)||0):((G.cp&&G.cp.best)||0); return Math.floor(b/SPC); }
function claimFund(k, i){
  const F=FUND[k], s=S(); if(!PK()[k]||s[k].includes(i)||chDone(F.hard)<(i+1)*5) return;
  s[k].push(i); give(F.ms[i], F.n+' · '+(F.hard?'H ':'CH ')+((i+1)*5));
}
const fundReady = k => PK()[k] ? FUND[k].ms.filter((m,i)=>!S()[k].includes(i)&&chDone(FUND[k].hard)>=(i+1)*5).length : 0;

// ---------------- page ----------------
const IMG = p => 'img/'+p+'.webp';
const cssDoc = '#s2{position:fixed;inset:0;z-index:20;display:none;background:linear-gradient(180deg,#1e2a38 0,#111922 30%,#0b1118 100%);overflow-y:auto;-webkit-overflow-scrolling:touch}#s2.open{display:block}#s2 .s2f{max-width:520px;margin:0 auto;padding:0 12px 40px}';
const css0 = `
:host{all:initial;display:block;font-family:Game,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#e8ecf2}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
button{font-family:inherit;cursor:pointer}
#s2 .w{max-width:520px;margin:0 auto;padding-bottom:40px;position:relative}
#s2 .x{position:fixed;left:10px;top:10px;z-index:3;width:51px;height:34px;border:0;padding:0;background:url(img/ui8/ic_back.webp) center/contain no-repeat;color:transparent;font-size:0;filter:drop-shadow(0 2px 3px #000a)}#s2 .x:active{transform:scale(.92)}
#s2 .hd img{display:block;width:100%}
#s2 .bar{display:flex;justify-content:center;gap:8px;margin:-6px 10px 6px;flex-wrap:wrap}
#s2 .cur{display:flex;align-items:center;gap:6px;background:#0d151e;border:1.5px solid #e0aa25;border-radius:999px;padding:4px 12px 4px 6px;font:900 14px Game,system-ui;color:#fff}
#s2 .cur img{width:22px;height:22px;object-fit:contain}
#s2 .tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;padding:6px 60px 10px 10px;position:sticky;top:0;z-index:2;background:#141d27ee}
#s2 .tabs button{position:relative;border:0;border-radius:12px;padding:8px 2px 6px;font:900 11px Game,system-ui;color:#cfd8e3;background:linear-gradient(#2a3644,#141c26);box-shadow:0 0 0 1.5px #0a0f15,0 0 0 3px #5e4a20;display:flex;flex-direction:column;align-items:center;gap:3px}
#s2 .tabs button img{width:30px;height:30px;object-fit:contain}
#s2 .tabs button.on{background:linear-gradient(#5a4210,#2a1c05);color:#ffd54a;box-shadow:0 0 0 1.5px #0a0f15,0 0 0 3px #ffcf5a,0 0 12px #ffb30066}
#s2 .tabs i{position:absolute;right:-4px;top:-4px;min-width:17px;height:17px;border-radius:9px;background:radial-gradient(#ff6b5b,#d01b0b);box-shadow:0 0 0 1.5px #fff;font:900 10px/17px Game,system-ui;color:#fff;font-style:normal}
#s2 .pg{padding:0 12px}
#s2 .sec{display:flex;align-items:center;gap:8px;margin:14px 2px 8px;font:900 12px Game,system-ui;letter-spacing:1.5px;color:#ffd54a}
#s2 .sec::after{content:'';flex:1;height:1.5px;background:linear-gradient(90deg,rgba(255,179,0,.55),transparent)}
#s2 .note{font-size:11.5px;color:#9fd3ff;background:#0b2450aa;border:1px solid #4aa3ff66;border-radius:12px;padding:8px 10px;line-height:1.4;margin:10px 0}
#s2 .note a{color:#ffd54a}
#s2 .buy{border:0;border-radius:14px;min-width:84px;padding:10px;font:900 15px Game,system-ui;color:#3a1c00;background:linear-gradient(180deg,#fff0a8 0,#ffcb3d 42%,#ff9d0d 56%,#ee7a00 100%);box-shadow:0 4px 0 #8f4c00,0 8px 14px rgba(0,0,0,.5),inset 0 1.5px 0 rgba(255,255,255,.8)}
#s2 .buy:active{transform:translateY(3px);box-shadow:0 1px 0 #8f4c00}
#s2 .buy.dm{background:linear-gradient(180deg,#bfe9ff,#3fa9ff 55%,#1567d6);color:#fff;box-shadow:0 4px 0 #0d3c78,0 8px 14px rgba(0,0,0,.5);display:flex;align-items:center;gap:4px;justify-content:center}
#s2 .buy.dm img{width:18px;height:18px}
#s2 .buy.cf{background:linear-gradient(#ff8a65,#e53935);color:#fff;box-shadow:0 4px 0 #7a1010}
#s2 .buy.own{background:#1d3b25;color:#7CFC9A;box-shadow:inset 0 0 0 1.5px #3c7a4c;font-size:13px}
#s2 .buy.lock{background:#2a313a;color:#7d8996;box-shadow:inset 0 0 0 1.5px #3d4a5e;font-size:12px}
#s2 .pack{display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid #1f2a35}
#s2 .pack .th{flex:none;width:74px;height:70px;border-radius:12px;background:#1d2935;border:1.5px solid #ffcf5a;display:flex;align-items:center;justify-content:center}
#s2 .pack .th img{width:62px;height:62px;object-fit:contain}
#s2 .pack .tx{flex:1;font-size:12.5px;color:#a9b8c6;line-height:1.3}#s2 .pack .tx b{display:block;color:#fff;font-size:15px;margin-bottom:3px}
#s2 .pack .tx ins{text-decoration:none;color:#7CFC9A;font-weight:800}
#s2 .card{position:relative;border-radius:18px;margin:0 0 12px;padding:12px;overflow:hidden;box-shadow:0 0 0 1.5px #0a0f15,0 0 0 3px var(--c,#e0aa25),0 8px 18px rgba(0,0,0,.55)}
#s2 .card h3{margin:0;font:900 19px Game,system-ui;color:#fff;text-shadow:0 2px 0 #000}
#s2 .card .sub{font-size:11.5px;color:#d7e2ee;opacity:.85;margin:2px 0 8px}
#s2 .rib{position:absolute;right:-34px;top:14px;transform:rotate(35deg);background:#e53935;color:#fff;font:900 10.5px Game,system-ui;padding:3px 40px;box-shadow:0 2px 6px #000}
#s2 .items{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px}
#s2 .it{position:relative;width:62px;height:66px;border-radius:12px;background:rgba(0,0,0,.35);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font:900 11.5px Game,system-ui;color:#fff;text-shadow:0 1px 2px #000}
#s2 .it img{width:38px;height:38px;object-fit:contain}#s2 .it.hero img{width:56px;height:56px;margin-top:-4px}
#s2 .it .lbl{position:absolute;left:0;right:0;bottom:2px;text-align:center;font-size:11px;white-space:nowrap;overflow:hidden}
#s2 .it.ep{box-shadow:inset 0 0 0 2px #b46cff,0 0 8px #b46cff88}#s2 .it.lg{box-shadow:inset 0 0 0 2px #ffb300,0 0 10px #ffb30099}
#s2 .foot{display:flex;align-items:center;justify-content:space-between;gap:10px}
#s2 .val{font:900 12px Game,system-ui;color:#ffe08a}#s2 .val b{font-size:18px;color:#ff5a5a;display:block;line-height:1}
#s2 .st0{--c:#7CFC9A;background:linear-gradient(135deg,#17442a,#0d1c14 70%)}#s2 .st1{--c:#4aa3ff;background:linear-gradient(135deg,#123a66,#0b1626 70%)}
#s2 .st2{--c:#b46cff;background:linear-gradient(135deg,#3d1d6b,#150c26 70%)}#s2 .st3{--c:#ffb300;background:linear-gradient(135deg,#6b4a0a,#231705 70%)}
#s2 .locked{filter:grayscale(.75) brightness(.6)}
#s2 .chain{display:flex;justify-content:center;gap:6px;margin:4px 0 10px}#s2 .chain i{width:30px;height:6px;border-radius:3px;background:#2a3644}#s2 .chain i.on{background:#ffd54a;box-shadow:0 0 6px #ffb300}
#s2 .dgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding-top:4px}
#s2 .dp{position:relative;border-radius:16px;padding:10px 4px 8px;text-align:center;background:linear-gradient(#1b3150,#0c1626);box-shadow:0 0 0 1.5px #0a0f15,0 0 0 3px #3fa9ff,0 6px 12px rgba(0,0,0,.5)}
#s2 .dp img{width:56px;height:56px;object-fit:contain;filter:drop-shadow(0 3px 6px #000)}#s2 .dp.big img{width:66px;height:66px}
#s2 .dp b{display:block;font:900 18px Game,system-ui;color:#fff;margin:2px 0}
#s2 .dp .x2{position:absolute;left:-4px;top:-6px;background:linear-gradient(#ff6b5b,#d01b0b);color:#fff;font:900 11px Game,system-ui;border-radius:8px;padding:2px 6px;box-shadow:0 0 0 1.5px #fff}
#s2 .dp small{display:block;font-size:10px;color:#9fd3ff;margin-bottom:6px;min-height:12px}
#s2 .dp .buy{min-width:0;width:92%;padding:7px 0;font-size:14px}
#s2 .vp{--c:#9fb0c0;background:linear-gradient(135deg,#2c3542,#11161d 70%)}#s2 .vp.g{--c:#ffcf5a;background:linear-gradient(135deg,#5e430c,#1e1504 70%)}
#s2 .vp.p{--c:#e9c8ff;background:linear-gradient(135deg,#43275e,#170d24 60%,#0d1a2a)}#s2 .vp.d{--c:#7fe8ff;background:linear-gradient(135deg,#0d4a63,#06202e 60%,#0a1424)}
#s2 .card .top{display:flex;gap:10px;align-items:center}#s2 .card .top img{width:64px;height:64px;object-fit:contain;flex:none;filter:drop-shadow(0 3px 5px #000)}
#s2 .fund .top img{width:72px;height:72px;margin:-4px 0 -2px}
#s2 .bn{position:relative;margin:-12px -12px 8px;line-height:0}#s2 .bn>img{display:block;width:100%}
#s2 .bn .hp{position:absolute;left:41%;bottom:6%;height:84%;width:auto;filter:drop-shadow(0 2px 4px #000)}
#s2 .card.pk .rib{top:auto;bottom:-2px;right:6px;transform:none;padding:2px 8px;border-radius:8px 8px 0 0;font-size:10px}
#s2 .bl{list-style:none;margin:8px 0 10px;padding:0;font-size:12.5px;line-height:1.35}
#s2 .bl li{display:flex;gap:8px;align-items:center;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.07)}
#s2 .bl li img{width:20px;height:20px;object-fit:contain;flex:none}#s2 .bl li b{margin-left:auto;color:#7CFC9A;white-space:nowrap}
#s2 .bl li.no{opacity:.4}#s2 .bl li.no b{color:#9fb0c0}
#s2 .tot{font:800 11.5px Game,system-ui;color:#ffe08a;margin-bottom:8px}
#s2 .act{display:inline-block;background:#1d3b25;color:#7CFC9A;border-radius:8px;padding:2px 8px;font:900 11px Game,system-ui;margin-left:6px;vertical-align:middle}
#s2 .fund{--c:#4aa3ff;background:linear-gradient(135deg,#123a66,#0b1626 70%)}#s2 .fund.h{--c:#ff5a5a;background:linear-gradient(135deg,#5e1414,#1e0707 70%)}
#s2 .ms{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin:8px 0 10px}
#s2 .ms div{position:relative;border-radius:10px;background:rgba(0,0,0,.35);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.15);text-align:center;padding:4px 1px;font:900 10px Game,system-ui;color:#cfd8e3}
#s2 .ms div b{display:flex;justify-content:center;align-items:center;gap:1px;font-size:12.5px;color:#fff}#s2 .ms div b img{width:13px;height:13px;object-fit:contain}#s2 .ms div small{display:flex;justify-content:center;align-items:center;gap:2px;color:#9fd3ff;font-size:9.5px;flex-wrap:wrap}
#s2 .ms div small img{width:12px;height:12px;object-fit:contain}
#s2 .ms div.rd{box-shadow:inset 0 0 0 2px #7CFC9A;color:#7CFC9A}
#s2 .ms div.cl{background:linear-gradient(#ffcb3d,#ee7a00);color:#3a1c00;box-shadow:0 0 10px #ffb300;animation:s2p 1s infinite alternate}#s2 .ms div.cl b{color:#3a1c00}#s2 .ms div.cl small{color:#3a1c00}
#s2 .ms div.dn{opacity:.45}#s2 .ms div.dn::after{content:'✓';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:26px;color:#7CFC9A;text-shadow:0 2px 3px #000}
@keyframes s2p{to{transform:scale(1.06)}}
`;
const css = css0.replace(/#s2 /g,'').replace(/padding-bottom:40px;/,'');
const st=document.createElement('style'); st.textContent=cssDoc; document.head.appendChild(st);
const el=document.createElement('div'); el.id='s2'; document.body.appendChild(el);
const host=document.createElement('div'); el.appendChild(host); const root=host.attachShadow({mode:'open'});
const foot=document.createElement('div'); foot.className='s2f'; el.appendChild(foot);
let tab='tp', price={};
const IC = {dm:'<img src="'+IMG('ui3/v_dm')+'" alt="">', tk:'<img src="img/ticket.webp" alt="">', gt:'<img src="img/gticket.webp" alt="">', ct:'<img src="img/cticket.webp" alt="">'};
const P = (k,def) => price[k]||def;
function item(img,lbl,cls){ return '<div class="it '+(cls||'')+'"><img src="'+img+'" alt=""><span class="lbl">'+lbl+'</span></div>'; }

function render(){
  if(!el.classList.contains('open')) return;
  const t=T(), G=t.G, pk=PK(), tr=tier(), sc=el.scrollTop;
  let h='<div class="w"><button class="x" data-a="close">✕</button><div class="hd"><img src="img/ui2/shop_h.webp" alt=""></div>';
  h+='<div class="bar"><span class="cur">'+IC.dm+(G.dm||0).toLocaleString('en')+'</span><span class="cur">'+IC.tk+G.h.tk+'</span><span class="cur">'+IC.gt+((G.gear&&G.gear.tk)||0)+'</span><span class="cur"><img src="'+IMG('ui3/v_crown')+'" alt="">'+(tr?PASS[tr].n.split(' ')[0]:'VIP')+'</span></div>';
  const fr=fundReady('fn')+fundReady('fh');
  h+='<div class="tabs">'+[['tp','ui3/sp_chest','PACKS'],['td','ui3/sp_dm','DIAMONDS'],['tv','ui3/sp_vip','VIP PASS'],['tf','ui3/v_gift','FUNDS']].map(([k,i,n])=>'<button data-t="'+k+'" class="'+(tab===k?'on':'')+'"><img src="'+IMG(i)+'" alt="">'+n+(k==='tf'&&fr?'<i>'+fr+'</i>':'')+'</button>').join('')+'</div><div class="pg">';
  if(tab==='tp'){
    const nxt=PACKS.findIndex(p=>!pk[p.k]);
    if(nxt>=0){
      h+='<div class="sec">SPECIAL OFFERS · ONE TIME ONLY</div><div class="chain">'+PACKS.map((p,i)=>'<i class="'+(i<=nxt?'on':'')+'"></i>').join('')+'</div>';
      PACKS.forEach((p,i)=>{ if(pk[p.k]) return; const lk=i>nxt, hb=t.HB[p.hero];
        h+='<div class="card pk '+p.cls+(lk?' locked':'')+'"><div class="bn"><img src="'+IMG('shop/pk_'+['starter','rookie','pro','elite'][i])+'" alt="'+p.n+'"><img class="hp" src="img/hero/'+p.hero+'.webp" alt="">'+(p.rib&&!lk?'<div class="rib">'+p.rib+'</div>':'')+'</div><div class="sub">'+(lk?'🔒 Opens after the '+PACKS[i-1].n.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()):(i===3?'The last offer – buy it once.':'Buy it once – then the next pack opens.'))+'</div><div class="items">'+
          item('img/hero/'+p.hero+'.webp', hb?hb.n.split(' ')[0]+(hb.n.split(' ')[1]&&hb.n.split(' ')[0].length<5?' '+hb.n.split(' ')[1]:''):'Hero', p.hero[1]==='4'?'hero lg':'hero ep')+
          item(IMG('ui3/v_dm'),p.dm.toLocaleString('en'))+item('img/ticket.webp','×'+p.tk)+(p.gt?item('img/gticket.webp','×'+p.gt):'')+(p.ct?item('img/cticket.webp','×'+p.ct):'')+(p.money?item(IMG('ui3/v_coins'),t.fmt(p.money)):'')+(p.pk?item('img/ui12/pk_tank.webp','×'+p.pk.r+' each')+item('img/ui12/pk_bk.webp','×'+p.pk.bk):'')+
          '</div><div class="foot"><span class="val"><b>×'+p.val+'</b>VALUE</span>'+(lk?'<button class="buy lock">🔒 '+P(p.k,p.price)+'</button>':'<button class="buy" data-b="'+p.k+'">'+P(p.k,p.price)+'</button>')+'</div></div>'; });
    } else h+='<div class="note">✓ You bought all special offers – thank you!</div>';
    h+='<div class="sec">FOREVER PACKS</div>'+[
      ...(NEWP()?[['fdr','shop/founder','Founder Pass','Forever: Battle Speed ×3 + the FOUNDER frame &amp; title on your profile (ranking, chat, Arena).','€4.99']]:[]),
      ['fdr_old','shop/founder','Founder Pass','Forever: Battle Speed ×3 + the FOUNDER frame &amp; title on your profile (ranking, chat, Arena).','€4.99'],
      ['car','ui3/sp_truck','VIP Truck · Rich Clients','Forever: rich clients, priority in every garage, pay ×2.','€5.99'],
      ['vip','ui3/sp_crew','VIP Crew Boost','Forever: every mechanic +25% speed &amp; money.','€3.99'],
      ['spd2','ui3/sp_speed','Battle Speed ×3','Forever. <ins>Included in the Gold &amp; Platinum Pass.</ins>','€2.99'],
    ].filter(r=>r[0]!=='fdr_old').map(([k,i,n,d,pr])=>'<div class="pack"><div class="th"><img src="'+IMG(i)+'" alt=""></div><div class="tx"><b>'+n+'</b>'+d+'</div>'+(pk[k]?'<button class="buy own">OWNED ✓</button>':'<button class="buy" data-b="'+k+'">'+P(k,pr)+'</button>')+'</div>').join('')+
      '<div class="pack"><div class="th"><img src="img/ui2/i_key.webp" alt=""></div><div class="tx"><b>Dungeon Pass · 30 days</b>+2 keys a day in every dungeon + SWEEP.'+(on('dg')?' <ins>Active – '+daysLeft('dg')+' days left.</ins>':'')+'</div><button class="buy" data-a="dg">'+P('dg','€2.99')+'</button></div>';
    h+=(SEC.TEST_MODE?'<div class="note">🧪 TEST MODE (owner): tapping a price gives it without payment.<br>'+(SEC.TEST_ACC?'<a href="?tacc=0" style="color:#ffd54a">↩ Back to my normal account</a>':'<a href="?tacc=1" style="color:#ffd54a">🧪 Open the FULL TEST ACCOUNT (hidden from rankings)</a>')+'</div>':!SEC.STORE_BUILD?'<div class="note">📱 Packs are available in the Torque Empire app on Google Play.</div>':'<div class="note">Payments by Google Play. Bought on another phone? Purchases come back by themselves with the same Google account.</div>');
  }
  if(tab==='td'){
    h+='<div class="sec">DIAMONDS</div><div class="dgrid">'+DIAMONDS.map(d=>{ const x2=!S().fx[d.k];
      return '<div class="dp'+(d.big?' big':'')+'">'+(x2?'<span class="x2">×2</span>':'')+'<img src="'+IMG(d.ic)+'" alt=""><b>'+d.dm.toLocaleString('en')+'</b><small>'+(x2?'first time: '+(d.dm*2).toLocaleString('en'):'')+'</small><button class="buy" data-b="'+d.k+'">'+P(d.k,d.price)+'</button></div>'; }).join('')+'</div>';
    h+='<div class="note">100 '+DMh+' = 1 summon (you are always asked first). Rate Info and the Legendary pity (every 500 summons) stay the same.</div>';
  }
  if(tab==='tv'){
    const row=(ic,n,v,no)=>'<li'+(no?' class="no"':'')+'><img src="'+ic+'" alt="">'+n+'<b>'+v+'</b></li>';
    const btn=(k,label,dm)=>{ const key=expKey[k];
      if(on(key)) return '<span class="tot">Active – '+daysLeft(key)+' days left</span><button class="buy own">ACTIVE ✓</button>';
      if(dm) return '<span class="tot">30 days · no renewal</span><button class="buy dm'+(conf==='sil'?' cf':'')+'" data-b="sil">'+(conf==='sil'?'CONFIRM?':IC.dm+PASS.sil.cost.toLocaleString('en'))+'</button>';
      return '<span class="tot">'+label+' / month · cancel anytime</span><button class="buy" data-b="'+key+'">'+P(key,label)+'</button>'; };
    h+='<div class="sec">VIP PASS · 30 DAYS'+(actv().length?' · <span style="color:#7CFC9A">'+(actv().length>1?actv().length+' ACTIVE · ×'+stackMult().toFixed(1).replace(/\.0$/,''):PASS[tr].n)+'</span>':'')+'</div>';
    h+='<div class="card vp s"><div class="top"><img src="'+IMG('shop/vp_sil')+'" alt=""><div><h3>SILVER PASS</h3><div class="sub">Free to play – paid with diamonds you earn</div></div></div><ul class="bl">'+
      row(IMG('ui3/v_crown'),'VIP benefits','×1.2')+row(IMG('ui3/v_idle'),'Idle Rewards','+1 h')+row('img/ticket.webp','Recruit Ticket every day','+1')+row(IMG('ui3/v_dm'),'Diamonds every day','–',1)+row(IMG('ui3/sp_speed'),'Battle Speed ×3','–',1)+
      '</ul><div class="foot">'+btn('sil','',1)+'</div></div>';
    h+='<div class="card vp g"><div class="rib">POPULAR</div><div class="top"><img src="'+IMG('shop/vp_gold')+'" alt=""><div><h3>GOLD PASS</h3><div class="sub">Monthly subscription</div></div></div><ul class="bl">'+
      row(IMG('ui3/v_dm'),'Diamonds right away','300')+row(IMG('ui3/v_dm'),'Diamonds every day','+100')+row('img/ticket.webp','Recruit Tickets every day','+2')+row(IMG('ui3/v_crown'),'VIP benefits','×1.5')+row(IMG('ui3/v_idle'),'Idle Rewards','+2 h')+row(IMG('ui3/sp_speed'),'Battle Speed ×3','✓')+
      '</ul><div class="tot">In 30 days: 3,300 '+DMh+' + 60 tickets ≈ 93 summons</div><div class="foot">'+btn('gold','€5.99')+'</div></div>';
    h+='<div class="card vp p"><div class="rib">BEST</div><div class="top"><img src="'+IMG('shop/vp_plat')+'" alt=""><div><h3>PLATINUM PASS</h3><div class="sub">Monthly subscription · everything from Gold, and more</div></div></div><ul class="bl">'+
      row(IMG('ui3/v_dm'),'Diamonds right away','600')+row(IMG('ui3/v_dm'),'Diamonds every day','+200')+row('img/ticket.webp','Recruit Tickets every day','+3')+row('img/gticket.webp','Gear Tickets every day','+2')+row(IMG('ui3/v_crown'),'VIP benefits','×2')+row(IMG('ui3/v_idle'),'Idle Rewards','+4 h')+row(IMG('ui3/sp_speed'),'Battle Speed ×3','✓')+row(IMG('ui3/v_garage'),'Idle Rewards collected by themselves','✓')+
      '</ul><div class="tot">In 30 days: 6,600 '+DMh+' + 150 tickets ≈ 216 summons</div><div class="foot">'+btn('plat','€9.99')+'</div></div>';
    if(NEWP())h+='<div class="card vp d"><div class="rib">MOST DIAMONDS</div><div class="top"><img src="'+IMG('shop/vp_dia')+'" alt=""><div><h3>DIAMOND PASS</h3><div class="sub">Monthly subscription · for summoners – the most diamonds</div></div></div><ul class="bl">'+
      row(IMG('ui3/v_dm'),'Diamonds right away','900')+row(IMG('ui3/v_dm'),'Diamonds every day','+300')+row('img/ticket.webp','Recruit Tickets every day','+2')+row(IMG('ui3/v_crown'),'VIP benefits','–',1)+row(IMG('ui3/v_idle'),'Idle Rewards','–',1)+
      '</ul><div class="tot">In 30 days: 9,900 '+DMh+' + 60 tickets ≈ 159 summons</div><div class="foot">'+btn('dia','€14.99')+'</div></div>';
    h+='<div class="note">VIP Passes stack: you can have Silver, Gold, Platinum'+(NEWP()?' and Diamond':'')+' at the same time – every pass gives its own daily gift, and the bonuses add up (VIP benefits +20% / +50% / +100%, Idle +1 h / +2 h / +4 h). The daily gifts arrive the first time you open the game each day. VIP points still come only from Daily Quests.</div>';
  }
  if(tab==='tf'){
    h+='<div class="sec">CAMPAIGN FUNDS · BUY ONCE</div>';
    for(const k of ['fn','fh']){ const F=FUND[k], own=pk[k], done=chDone(F.hard), s=S()[k];
      const tot=F.ms.reduce((a,m)=>({dm:a.dm+m.dm,tk:a.tk+m.tk,gt:a.gt+(m.gt||0)}),{dm:0,tk:0,gt:0});
      h+='<div class="card fund'+(F.hard?' h':'')+'">'+(F.hard?'<div class="rib">HARD ×1.5</div>':'')+'<div class="top"><img src="'+IMG('shop/fund_'+(F.hard?'h':'n'))+'" alt=""><div><h3>'+F.n+(own?'<span class="act">OWNED</span>':'')+'</h3><div class="sub">'+(F.hard?'Rewards at every 5th chapter of HARD MODE – bigger rewards.':'Rewards at every 5th chapter of the NORMAL campaign.')+' Already passed? Claim at once.'+(own?' Tap a glowing reward to claim it.':'')+'</div></div></div><div class="ms">'+
        F.ms.map((m,i)=>{ const rd=done>=(i+1)*5, dn=s.includes(i), cl=own&&rd&&!dn;
          return '<div class="'+(dn?'dn':cl?'cl':rd?'rd':'')+'"'+(cl?' data-c="'+k+':'+i+'"':'')+'>'+(F.hard?'H ':'CH ')+((i+1)*5)+'<b>'+m.dm+IC.dm+'</b><small>+'+m.tk+IC.tk+(m.gt?' +'+m.gt+IC.gt:'')+'</small></div>'; }).join('')+
        '</div><div class="tot">Total: '+tot.dm.toLocaleString('en')+' '+DMh+' + '+tot.tk+' Recruit'+(tot.gt?' + '+tot.gt+' Gear':'')+' · your progress: '+(F.hard?'H ':'CH ')+done+'</div><div class="foot"><span class="val"><b>×'+(F.hard?9:6)+'</b>VALUE</span>'+(own?'<button class="buy own">OWNED ✓</button>':'<button class="buy" data-b="'+k+'">'+P(k,F.price)+'</button>')+'</div></div>'; }
  }
  h+='</div></div>';
  root.innerHTML='<style>'+css+'</style>'+h; el.scrollTop=sc;
  if(tab==='tp'){ if(!foot.firstChild){ foot.innerHTML='<div id="s2cloud"></div><div style="opacity:.7;font:11.5px Game,system-ui;color:#9fd3ff;margin:10px 0;line-height:1.4"><span data-a="pid">Player ID: '+SEC.PID.slice(0,8)+'</span> · '+(SEC.TEST_ACC?'<a href="#" data-a="taccoff" style="color:#ffd54a">↩ Back to my account</a> · ':'')+'<a href="privacy.html" target="_blank" style="color:#ffd54a">Privacy policy</a> · <a href="#" data-a="tut" style="color:#ffd54a">Replay tutorial</a></div>'; if(window.CLOUD) CLOUD.mount(document.getElementById('s2cloud')); } foot.style.display=''; }
  else foot.style.display='none';
}
const onClick=e=>{
  const a=e.target.closest('[data-a]'), tb=e.target.closest('[data-t]'), b=e.target.closest('[data-b]'), c=e.target.closest('[data-c]');
  if(a){ e.preventDefault(); const v=a.dataset.a;
    if(v==='close') close();
    else if(v==='tut'){ close(); if(window.__TUT) __TUT.start(); }
    else if(v==='taccoff'){ SEC.taccOff(); }
    else if(v==='pid'){ const n=(onClick.pid=(Date.now()-(onClick.pt||0)<1500?(onClick.pid||0)+1:1)); onClick.pt=Date.now();   // v16-92: 7 taps = owner test account
      if(n>=7){ onClick.pid=0; if(SEC.TEST_ACC){ SEC.taccOff(); return; } const k=window.prompt('Test key'); if(k) SEC.taccOn(k).then(ok=>{ if(!ok) T().toast('✖ Wrong key',2000); }); } }
    else if(v==='dg'){ close(); if(window.CAMPAIGN&&CAMPAIGN.openDG) CAMPAIGN.openDG(); else T().toast('Battle → Dungeons → DUNGEON PASS',3000); }
    return; }
  if(tb){ tab=tb.dataset.t; conf=''; render(); el.scrollTop=0; return; }
  if(c){ const [k,i]=c.dataset.c.split(':'); claimFund(k,+i); return; }
  if(b){ const k=b.dataset.b; if(k==='car'||k==='vip'||k==='spd2'||k==='fdr'){ buyForever(k); return; } buy(k); }
};
root.addEventListener('click',onClick); foot.addEventListener('click',e=>{ if(e.target.closest('[data-a]')) onClick(e); });
// the old forever packs (same logic as the old shop)
async function buyForever(k){ if(busy||PK()[k]) return; busy=true;
  try{ const ok=await SEC.buy(k); if(!ok) return; PK()[k]=true; t_save();
    if(k==='car'&&T().vtStart) T().vtStart();
    T().toast(k==='fdr'?'🏅 Founder Pass: Battle Speed ×3 + FOUNDER frame & title!':k==='vip'?'👑 VIP Crew Boost active – every mechanic +25%!':k==='spd2'?'⏩ Battle Speed ×3 unlocked forever!':'🚚 VIP Truck unlocked! The first rich clients are on their way.',4000); render(); }
  finally{ busy=false; } }

function open(t){ if(t) tab=t; conf=''; el.classList.add('open'); render(); el.scrollTop=0;
  if(SEC.STORE_BUILD && !Object.keys(price).length) SEC.prices().then(o=>{ if(o){ price=o; render(); } }); }
function close(){ el.classList.remove('open'); }

const api = window.SHOP2 = {
  live: LIVE || !!(window.SEC && SEC.TEST_MODE),
  open, close, render, grant, tier,
  mult: stackMult,
  idleH: () => actv().reduce((x,k)=>x+PASS[k].idle,0),
  PASSN: () => actv().map(k=>PASS[k].n.replace(' PASS','')).join(' + ')+(actv().length>1?' PASS':(actv().length?' PASS':'')),
  days: () => { const a=actv(); return a.length?Math.min(...a.map(k=>daysLeft(expKey[k]))):0; },
  spd: () => actv().some(k=>PASS[k].spd),
};
// start: first check after the save is loaded, then every minute (new day, new subscription period, Platinum auto-collect)
function boot(){ if(!T()||!T().G){ setTimeout(boot,500); return; } if(!api.live) return; T().vipRefresh(); setTimeout(passTick,3000); setInterval(()=>{ passTick(); if(el.classList.contains('open')) render(); },60e3); }
boot();
})();
