// =================== TUTORIAL (v16-72 preview) ===================
// Guided first minutes: a guide talks in a bubble, the screen dims, only the highlighted thing can be tapped,
// an animated hand shows where. v16-73: starts by itself for NEW players (G.tut not set, no progress); players with
// progress never get it automatically. Shop → "Replay tutorial" or ?tut=1 = replay (no starter cash, no gift).
(function(){
'use strict';
const Q=new URLSearchParams(location.search);
let FORCE=Q.has('tut');
const GUIDE={name:'MAMA ROSA',role:'CHIEF MECHANIC'}; // v16-80: Marius' pictures (img/shop/rosa_*, dlg_*, hand0/1)
const POSE=k=>'img/shop/rosa_'+k+'.webp';

// ---------- styles ----------
const css=document.createElement('style');css.textContent=`
#tut{position:fixed;inset:0;z-index:99990;pointer-events:none;font-family:inherit}
#tut .tb{position:absolute;pointer-events:auto;background:transparent;touch-action:none}
#tut .hole{position:absolute;border-radius:14px;box-shadow:0 0 0 9999px rgba(4,8,14,.68);transition:left .25s,top .25s,width .25s,height .25s,opacity .2s}
#tut .ring{position:absolute;border-radius:16px;border:3px solid #ffd54a;box-shadow:0 0 14px #ffb300,inset 0 0 10px rgba(255,213,74,.5);animation:tutR 1.1s ease-in-out infinite}
@keyframes tutR{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.07);opacity:.65}}
#tut .hand{position:absolute;width:66px;height:72px;margin:-4px 0 0 -6px;animation:tutH 1.1s ease-in-out infinite;filter:drop-shadow(0 4px 4px rgba(0,0,0,.6))}
#tut .hand img{position:absolute;left:0;top:0;width:66px;height:auto}#tut .hand img.h1{left:-21px;top:-16px;width:79px}#tut .hand .h1{opacity:0;animation:tutP 1.1s steps(1) infinite}
@keyframes tutP{0%,38%{opacity:0}40%,62%{opacity:1}64%,100%{opacity:0}}
@keyframes tutH{0%,100%{transform:translate(10px,14px)}45%,55%{transform:translate(0,0)}}
#tut .bub{position:absolute;left:6px;right:8px;pointer-events:auto;display:flex;align-items:flex-end;gap:0;transition:top .3s,bottom .3s;animation:tutIn .35s ease-out}
@keyframes tutIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
#tut .bub .pt{flex:0 0 104px;height:150px;background:none;position:relative;z-index:2;margin:0 -16px -6px -6px}
#tut .bub .pt img{position:absolute;left:0;bottom:0;width:104px;height:auto;filter:drop-shadow(0 4px 6px rgba(0,0,0,.6))}
#tut .bub .bx{flex:1;min-width:0;min-height:96px;border:solid transparent;border-width:22px 22px 22px 26px;border-image:url(img/shop/dlg_box.webp) 74 74 74 80 fill / 22px 22px 22px 26px stretch;padding:4px 2px 0 12px;color:#2a1a00;filter:drop-shadow(0 6px 10px rgba(0,0,0,.55));position:relative}
#tut .bub .nm{display:inline-block;margin:-36px 0 4px -10px;background:url(img/shop/dlg_name.webp) center/100% 100% no-repeat;color:#fff;text-shadow:0 1px 0 #5e3d00,0 0 3px #5e3d00;padding:7px 22px 9px;font-weight:900;font-size:12px;letter-spacing:.5px;white-space:nowrap}
#tut .bub .nm small{font-weight:800;opacity:1;font-size:10.5px;margin-left:4px}
#tut .bub .tx{font-size:15px;line-height:1.3;font-weight:700}
#tut .bub .tx b{color:#c62828}
#tut .bub .bt{display:flex;justify-content:space-between;align-items:center;margin-top:8px;min-height:30px;padding-right:14px}
#tut .bub .sk{white-space:nowrap;font-size:12px;color:#7a5a20;font-weight:800;text-decoration:underline;padding:6px 4px;background:none;border:0}
#tut .bub .nx{background:url(img/shop/dlg_next.webp) center/100% 100% no-repeat;border:0;min-width:104px;padding:9px 40px 10px 14px;font-weight:900;font-size:13px;color:#fff;text-shadow:0 1px 0 #7a2e00,0 0 3px #7a2e00;margin:0 -6px -8px 0;white-space:nowrap}
#tut .bub .nx:active{transform:translateY(2px) scale(.97)}
#tut .bub .dots{white-space:nowrap;font-size:10px;color:#9a7a40;font-weight:900;letter-spacing:2px}
#tut .gift{display:flex;gap:10px;justify-content:center;margin-top:6px;font-weight:900;font-size:16px}
`;document.head.appendChild(css);


// ---------- helpers (game globals from index.html) ----------
const $=id=>document.getElementById(id);
const isOpen=id=>{const e=$(id);return !!(e&&e.classList.contains('open'));};
const vis=e=>{if(!e)return false;const r=e.getBoundingClientRect();return r.width>4&&r.height>4&&r.bottom>0&&r.top<innerHeight;};
const X=()=>window.__TUTX,TE=()=>window.__TE,G=new Proxy({},{get:(o,k)=>TE().G[k],set:(o,k,v)=>{TE().G[k]=v;return true;}});
const W2S=(x,y)=>{const c=X().cam();return{x:(x-c.x)*c.z,y:(y-c.y)*c.z+X().TOP};};
function worldRect(r){const a=W2S(r.x,r.y),b=W2S(r.x+r.w,r.y+r.h);return{left:a.x,top:a.y,width:b.x-a.x,height:b.y-a.y};}
let camT=null;
function camTo(r){camT={x:r.x+r.w/2,y:r.y+r.h/2};}
function camStep(){if(!camT)return;const c=X().cam(),T0=X().TOP,tx=camT.x-c.vw/c.z/2,ty=camT.y-(c.vh-T0)/c.z/2+(c.vh-T0)/c.z*.12;
  X().setCam(c.x+(tx-c.x)*.14,c.y+(ty-c.y)*.14);const d=X().cam();if(Math.abs(d.x-c.x)<.5&&Math.abs(d.y-c.y)<.5)camT=null;}
const isNew=()=>!G.tut&&!G.sold&&!(G.cp&&G.cp.best)&&(G.lv.service||1)<=1&&(G.lv.inspect||1)<=1;
// a save with progress came in (cloud / transfer) while the tutorial runs → stop it quietly
const progressed=()=>!FORCE&&((G.cp&&G.cp.best>4)||G.sold>60||(G.lv.inspect||1)>2||G.rep>=6);
const heroCount=()=>Object.keys(G.h.own||{}).length;
const R=new Proxy({},{get:(o,k)=>()=>X().rect(k)});
const sel0=()=>X().sel(),closePanel=()=>X().closePanel(),fmt=n=>TE().fmt(n),save=()=>TE().save(),toast=(a,b)=>TE().toast(a,b),TOP=52;

// ---------- the steps ----------
let lv0=0,tk0=0,hc0=0,best0=0;
// v16-122 (Marius): a BIG gift at the end so players don't skip – announced in the first bubble
const GIFT={dm:1000,tk:10};
const giftH=()=>`<div class="gift"><span>${TE().DMI} ${GIFT.dm}</span><span>${X().TKI()} ${GIFT.tk}</span><span><img class="tki" src="img/cticket.webp"> ${GIFT.tk}</span><span><img class="tki" src="img/gticket.webp"> ${GIFT.tk}</span></div>`;
const S=[
 {t:()=>`Welcome to <b>TORQUE EMPIRE</b>, boss! I'm Mama Rosa, your chief mechanic. Let me show you around – it only takes a minute.<br><b>Finish the tutorial for a big gift:</b>`+giftH(),next:'LET\'S GO'},
 {w:'parking',t:`Customer cars arrive here, at the <b>ARRIVAL PARKING</b>. Valet drivers take them to the workshops by themselves.`,next:'NEXT'},
 {w:'inspect',t:`<b>INSPECTION</b> checks every car and decides what must be repaired and which workshop it visits.`,next:'NEXT'},
 {w:'office',t:`When a car is fixed, the <b>SALES OFFICE</b> sells it and you get the money. It all runs by itself – even while you are away!`,next:'NEXT'},
 {w:'service',tap:1,t:`Upgrades make your garage faster and richer. <b>Tap the SERVICE workshop.</b>`,done:()=>isOpen('sheet')&&sel0()==='service'},
 {el:()=>$('shBtn'),tap:1,enter:function(){lv0=G.lv.service||0;this.next=FORCE?'NEXT':'';if(!FORCE){try{const n=X().upHave('service'),c=upCost();if(n<c){X().upGive('service',c-n);save();}}catch(e){}}},t:()=>`Tap <b>UPGRADE</b>: more mechanics, faster work and bigger pay. Buildings are upgraded with <b>PARTS</b> (not money) – you get them from battles, salvage and Idle Rewards.`+(FORCE?' <small>(replay: tap NEXT)</small>':''),done:()=>(G.lv.service||0)>lv0},
 {el:()=>$('smBtn'),tap:1,enter:()=>{try{closePanel();}catch(e){}},t:`Your mechanics are also <b>HEROES</b>! Open <b>SUMMON</b> – you have free Recruit Tickets.`,done:()=>isOpen('sm')},
 {el:()=>document.querySelector('#smBox [data-a="sum"][data-n="10"]')||document.querySelector('#smBox [data-a="sum"]'),tap:1,enter:function(){tk0=G.h.tk;hc0=(G.h.hist||[]).length;this.next=FORCE?'NEXT':'';},t:()=>`Tap <b>×10</b> to recruit 11 heroes at once!`+(FORCE?' <small>(replay: tap NEXT)</small>':''),done:()=>G.h.tk<tk0||(G.h.hist||[]).length!==hc0||isOpen('res')},
 {el:()=>isOpen('res')?null:document.querySelector('#smBox [data-a="back"]'),tap:1,top:1,p:'thumb',t:`Nice team! Heroes <b>work in your garage</b> and <b>fight in battles</b>. Now close these pages to continue.`,done:()=>!isOpen('sm')&&!isOpen('res')},
 {el:()=>$('cpBtn'),tap:1,t:`Monsters made of car parts are attacking the city! Tap <b>BATTLE</b>.`,done:()=>isOpen('hub')||isOpen('cp')},
 {el:()=>document.querySelector('#hub.open [data-hb="camp"]'),tap:1,t:`Open the <b>CAMPAIGN</b>.`,done:()=>vis(document.querySelector('#cpPath .node.cur'))&&!isOpen('hub')},
 {el:()=>document.querySelector('#cpPath .node.cur'),tap:1,enter:()=>{best0=G.cp.best;},t:`Tap your stage.`,done:()=>isOpen('cpCard')},
 {el:()=>document.querySelector('#cpCard.open .ppF'),tap:1,t:`Your best heroes are already in the team. Press <b>FIGHT!</b>`,done:()=>isOpen('bt')},
 {hide:1,done:()=>isOpen('cpRes')},
 {el:()=>isOpen('cpRes')?document.querySelector('#cpResBox [data-a="map"]'):isOpen('hub')?document.querySelector('#hub [data-hb="back"]'):isOpen('cp')?document.getElementById('cpBack'):null,tap:1,top:1,res:1,t:()=>(G.cp.best>best0?`<b>VICTORY!</b> Battles give money, tickets, diamonds and gear.`:`So close! Make your heroes stronger with gear and try again later.`)+(isOpen('cpRes')?` Tap <b>CAMPAIGN</b>, then <b>↩</b> to go back to your garage.`:` Tap <b>↩</b> to go back to your garage.`),done:()=>!isOpen('cp')&&!isOpen('hub')&&!isOpen('bt')&&!isOpen('cpRes')},
 {el:()=>$('dqBtn'),t:`<b>DAILY QUESTS</b>: finish them every day for VIP points, diamonds and tickets.`,next:'NEXT'},
 {el:()=>$('idBtn'),t:`<b>IDLE REWARDS</b>: your garage keeps earning while you are offline. Collect it here!`,next:'NEXT'},
 {t:()=>`That's it, boss! Here is your welcome gift. Now build your <b>TORQUE EMPIRE</b>!`+giftH(),next:'START',gift:1},
];
function upCost(){try{return X().upCost('service');}catch(e){return 0;}}

// ---------- overlay ----------
const root=document.createElement('div');root.id='tut';root.innerHTML='<div class="hole"></div><div class="ring"></div><div class="hand"><img class="h0" src="img/shop/hand0.webp" alt=""><img class="h1" src="img/shop/hand1.webp" alt=""></div><div class="tb" id="tbT"></div><div class="tb" id="tbB"></div><div class="tb" id="tbL"></div><div class="tb" id="tbR"></div><div class="bub"><div class="pt"><img alt=""></div><div class="bx"><div class="nm"></div><div class="tx"></div><div class="bt"><button class="sk">SKIP TUTORIAL</button><span class="dots"></span><button class="nx">NEXT</button></div></div></div>';
const hole=root.querySelector('.hole'),ring=root.querySelector('.ring'),hand=root.querySelector('.hand'),bub=root.querySelector('.bub'),tx=root.querySelector('.tx'),nx=root.querySelector('.nx'),sk=root.querySelector('.sk'),dots=root.querySelector('.dots');
const ptI=root.querySelector('.pt img');let pose='';function setPose(k){if(k!==pose){pose=k;ptI.src=POSE(k);}}root.querySelector('.nm').innerHTML=GUIDE.name+'<small>'+GUIDE.role+'</small>';
const tb={T:$('tbT')||root.querySelector('#tbT'),B:root.querySelector('#tbB'),L:root.querySelector('#tbL'),R:root.querySelector('#tbR')};
let i=-1,cur=null,skipArm=0,lastTx='';
function place(L,T,Wd,H){const s=(e,a,b,c,d)=>{e.style.left=a+'px';e.style.top=b+'px';e.style.width=Math.max(0,c)+'px';e.style.height=Math.max(0,d)+'px';};
  // v16-115: place(0,0,0,0) = no blockers at all (before, tbB covered the whole screen → "free" steps were stuck)
  if(Wd<=0&&H<=0){for(const k in tb)s(tb[k],0,0,0,0);return;}
  s(tb.T,0,0,innerWidth,T);s(tb.B,0,T+H,innerWidth,innerHeight-T-H);s(tb.L,0,T,L,H);s(tb.R,L+Wd,T,innerWidth-L-Wd,H);}
let L=S,MINI=null;
function go(n){i=n;cur=L[i];skipArm=0;lastTx='';if(!cur){end();return;}
  if(!MINI&&!FORCE&&G.tutS!==i){G.tutS=i;try{save();}catch(e){}}   // v16-122: remember that the tutorial was started
  if(cur.enter)try{cur.enter();}catch(e){}
  setPose(cur.p||(cur.gift?'cheer':i===0&&!MINI?'talk':(cur.el||cur.w)?'point':'talk'));
  if(cur.w){camTo(R[cur.w]());try{if(sel0()&&!cur.tap)closePanel();}catch(e){}}
  nx.textContent=cur.next||'';nx.style.display=cur.next?'':'none';
  dots.textContent=MINI?'':(i+1)+' / '+L.length;sk.style.visibility=cur.gift||MINI?'hidden':'';
  bub.style.animation='none';void bub.offsetWidth;bub.style.animation='';}
function end(){root.remove();running=false;window.__TUTON=false;
  if(MINI){(G.tutM=G.tutM||[]).push(MINI);MINI=null;L=S;try{save();}catch(e){}return;}
  if(!G.tutM&&!FORCE)G.tutM=[];
  if(!FORCE){G.tut=1;try{save();}catch(e){}}}
nx.onclick=()=>{if(FORCE&&cur&&!cur.gift&&isOpen('sm')&&cur.tap){const b=document.querySelector('#smBox [data-a="back"]');if(b)b.click();go(i+2);return;}if(cur&&cur.gift&&!FORCE){G.dm=(G.dm||0)+GIFT.dm;G.h.tk+=GIFT.tk;G.h.ct=(G.h.ct||0)+GIFT.tk;G.gear.tk=(G.gear.tk==null?10:G.gear.tk)+GIFT.tk;try{save();toast('🎁 Welcome gift: '+GIFT.dm+' diamonds + '+GIFT.tk+' Recruit, '+GIFT.tk+' Crew and '+GIFT.tk+' Gear Tickets',4000);}catch(e){}}
  if(cur&&cur.gift&&FORCE){try{toast('Preview: the gift is not given (test only)',2500);}catch(e){}}
  go(i+1);};
sk.onclick=()=>{if(!skipArm){skipArm=1;sk.textContent='SKIP = NO GIFT · TAP AGAIN';setTimeout(()=>{skipArm=0;sk.textContent='SKIP TUTORIAL';},2500);return;}end();};
let running=false;
function loop(){if(!running)return;requestAnimationFrame(loop);if(!cur)return;if(!MINI&&progressed()){G.tut=1;try{save();}catch(e){}root.remove();running=false;window.__TUTON=false;return;}
  camStep();
  if(cur.done){let ok=false;try{ok=cur.done();}catch(e){}if(ok){go(i+1);return;}}
  const t=typeof cur.t==='function'?cur.t():cur.t;if(t!==lastTx){tx.innerHTML=t||'';lastTx=t;}
  if(cur.res)setPose(G.cp.best>best0?'thumb':'think');
  // target rectangle on screen
  let r=null;
  if(cur.w)r=worldRect(R[cur.w]());
  else if(cur.el){const e=cur.el();if(vis(e)){const b=e.getBoundingClientRect();r={left:b.left,top:b.top,width:b.width,height:b.height};}}
  root.style.background='';const hidden=!!cur.hide;root.style.display=hidden?'none':'';
  bub.style.display=t?'':'none';
  if(r){const p=8;const L=r.left-p,T=r.top-p,Wd=r.width+p*2,H=r.height+p*2;
    hole.style.opacity=1;hole.style.left=L+'px';hole.style.top=T+'px';hole.style.width=Wd+'px';hole.style.height=H+'px';
    ring.style.display='';ring.style.left=L+'px';ring.style.top=T+'px';ring.style.width=Wd+'px';ring.style.height=H+'px';
    hand.style.display=cur.tap?'':'none';hand.style.left=(r.left+r.width*.55)+'px';hand.style.top=(r.top+r.height*.55)+'px';
    // taps: only inside the hole when the step wants a tap; NEXT steps block everything
    if(cur.tap)place(L,T,Wd,H);else place(0,0,0,0),tb.T.style.height=innerHeight+'px',tb.T.style.width=innerWidth+'px';
    const low=r.top+r.height/2>innerHeight*.5;bub.style.top=low?(Math.max(60,TOP+10))+'px':'auto';bub.style.bottom=low?'auto':'18px';
  }else{
    ring.style.display='none';hand.style.display='none';
    if(cur.free){hole.style.opacity=0;place(0,0,0,0);}            // the player moves freely, only the bubble shows
    else if(cur.el||cur.w){hole.style.opacity=0;place(0,0,0,0);}  // target not on screen yet (page opening) – don't block
    else{hole.style.opacity=0;root.style.background='rgba(4,8,14,.68)';place(0,0,0,0);tb.T.style.height=innerHeight+'px';tb.T.style.width=innerWidth+'px';}
    bub.style.top=cur.top?(TOP+10)+'px':'auto';bub.style.bottom=cur.top?'auto':'18px';
  }
}
// start after the loading screen
function start(replay){if(running)return;if(replay)FORCE=true;running=true;window.__TUTON=true;document.body.appendChild(root);go(0);loop();
  try{closePanel();}catch(e){}}
const wait=setInterval(()=>{const ld=document.getElementById('loader');if(!ld||!ld.classList.contains('hide')||!window.__TE)return;clearInterval(wait);
  // wait a moment: the cloud / transfer window may still bring an older save
  setTimeout(()=>{if(FORCE||isNew()||(!G.tut&&G.tutS!=null&&!progressed()))start();},1500);/* v16-122: app closed in the middle → the tutorial starts again (gift only once, at the end) */},200);
// ---------- mini-guides: one bubble the first time a battle mode is open in the Battle Hub ----------
const MG={arena:`<b>ARENA</b>: your battle team fights other players' teams. 5 fights a day – climb from BRONZE to LEGEND!`,
  cup:`<b>TORQUE CUP</b>: every weekend the best Arena players fight in a tournament for big prizes.`,
  tower:`<b>TORQUE TOWER</b> is open! Climb floor by floor – every floor is harder and gives better rewards.`,
  class:`<b>CLASS TOWERS</b> are open: a tower for every hero class. Build strong teams for each one!`,
  boss:`<b>WORLD BOSS</b> is open! 3 keys a day: hit the boss as hard as you can and climb the damage ranking.`,
  dg:`<b>DUNGEONS</b> are open! 2 free keys a day in each dungeon – unused keys stack up. Money, gear and NITRO BOOST.`};
let hubDone=false; // max one mini-guide each time the Battle Hub is opened
setInterval(()=>{if(!isOpen('hub')){hubDone=false;return;}if(running||hubDone||!window.__TE)return;
  const open=Object.keys(MG).filter(k=>vis(document.querySelector('#hub.open .hubM[data-hb="'+k+'"]:not(.lk)')));
  if(!G.tutM){G.tutM=open.slice();try{save();}catch(e){}return;} // players from before v16-73: what is already open counts as seen
  const k=open.find(k=>!G.tutM.includes(k));if(!k)return;
  hubDone=true;MINI=k;L=[{el:()=>document.querySelector('#hub.open .hubM[data-hb="'+k+'"]'),t:MG[k],next:'GOT IT'}];
  running=true;window.__TUTON=true;document.body.appendChild(root);go(0);loop();},700);
// ---------- v16-122 (Marius): mini-guides the FIRST time a page is opened (one bubble, once per player) ----------
const PG={
  heroes:{ok:()=>isOpen('cpGear')&&!isOpen('cpPop'),t:`<b>HEROES</b>: your <b>BATTLE TEAM</b> (5 heroes) fights here. Tap a hero to <b>LEVEL UP</b> with ${'<b>Essence</b>'} – every 20 levels = <b>ASCENSION</b>. <b>AUTO BEST</b> picks your strongest team.`},
  gear:{ok:()=>isOpen('cpPop')&&!!document.querySelector('#cpPopBox .iUp'),t:`<b>GEAR</b> makes heroes stronger in battle. <b>UPGRADE</b> with <b>Gear Parts</b> (salvage, campaign, Dungeons, Idle). Two identical pieces = <b>★ STAR UP</b>. A full class set gives extra bonuses.`},
  crew:{ok:()=>isOpen('ros'),t:`<b>MY CREW</b> = everybody who <b>works in your garage</b>: mechanics (heroes), guards and drivers. Each workshop takes only <b>its own class</b>. Better crew = faster work and more money. <b>AUTO BEST</b> fills every place.`},
  summon:{ok:()=>isOpen('sm')&&!isOpen('res'),t:`<b>SUMMON</b>: <b>HERO</b> = mechanics who work AND fight · <b>CREW</b> = drivers and guards for the garage · <b>GEAR</b> = equipment. <b>×10</b> gives 11. A <b>Legendary</b> is guaranteed every 100 summons.`},
  vip:{ok:()=>isOpen('sheet')&&sel0()==='vip',t:`<b>VIP</b> is free for everybody: <b>Daily Quests</b> give VIP points. Every VIP level makes your bonuses stronger (income, Idle time…). VIP Passes make them even bigger.`},
  events:{ok:()=>isOpen('ev'),t:`<b>EVENTS</b>: 2 events at the same time, 3 days each. Just play (summon, spend Essence…) to collect points → <b>milestone rewards</b> and <b>TOP 100</b> prizes.`},
  checkin:{ok:()=>isOpen('xp')&&!!document.getElementById('ciGo'),t:`<b>DAILY CHECK-IN</b>: come back every day for free tickets. Missing a day <b>never resets</b> your progress – you simply continue.`},
  // v16-143 (Marius 21 nov: "check the training for everything we added today") – one short guide the first time each new page opens
  roles:{ok:()=>isOpen('cpGear')&&!isOpen('cpPop'),t:`<b>TEAM ROLES</b>: every hero has a role – <b>TANK</b>, <b>WARRIOR</b>, <b>RANGER</b>, <b>MAGE</b>, <b>SUPPORT</b>. 3 different roles in your team = <b>+5%</b>, 4 = <b>+10%</b>, all 5 = <b>+15%</b> attack &amp; HP. ♻ <b>REBIRTH</b> gives back 100% of a hero's Essence.`},
  bld:{ok:()=>isOpen('sheet')&&document.getElementById('sheet').classList.contains('bldP')&&!['shop','vip','rep','inc','car'].includes(sel0()),t:`<b>BUILDINGS</b> upgrade with <b>PARTS</b>, not money: battle garages use the parts of their <b>role</b> (Engine = Tank, Tuning = Warrior…), all other buildings use the <b>Builder Kit</b>. Up to <b>LV 100</b> – a battle garage also makes its hero class stronger. Car money goes to the <b>Classic Collection</b>.`},
  dungeons:{ok:()=>isOpen('dg'),t:`<b>DUNGEONS</b>: free keys every day in each dungeon – a key is used only when you <b>win</b>. Keys you do not use <b>stack up</b> day after day (also keys from packs and the Key Roulette). Rewards are fixed: cash, gear, set pieces, NITRO BOOST.`},
  // v16-161 (Marius 22 nov: "a tutorial for everything new")
  pity2:{ok:()=>isOpen('sm')&&!isOpen('res')&&!!document.querySelector('#sm .smWish'),t:`<b>PITY</b>: a <b>Legendary</b> every <b>100</b> summons and a <b style="color:#ff6b6b">MYTHIC</b> every <b>1500</b> Hero summons. Tap the red <b>MYTHIC</b> bar = <b>WISH</b>: you choose which Mythic the pity gives.`},
  awaken:{ok:()=>isOpen('cpGear')&&!isOpen('cpPop'),t:`<b style="color:#ff6b6b">AWAKENING</b>: Mythic copies wake the hero up – <b>Awakened I → V</b> (9 copies). More power, skill levels, a battle aura, a glowing weapon. <b>Legendary</b> heroes now go to <b>+10</b> – every + after +5 is much stronger.`},
  starcoll:{ok:()=>vis(document.querySelector('#gcW .scT')),t:`<b>★ STAR COLLECTION</b>: when <b>all</b> your heroes of a color reach a step (+5, +10 … Legendary +2…+10, Mythic Awakened I…V), <b>every battle hero</b> gets the bonus.`},
  evcal:{ok:()=>isOpen('ev')&&!!document.querySelector('#ev .evSch'),t:`<b>📅 EVENT CALENDAR</b> (button under the event): see the next events with their exact dates. New event: <b>DUNGEON RUSH</b> – every Dungeon key you use counts.`},
  tw500:{ok:()=>isOpen('tw')||isOpen('ct'),t:`<b>TOWERS</b> now have <b>500 floors</b>. The higher the floor, the bigger every reward. Class Towers: a <b>Mythic set piece</b> every 20 floors after 100 and a full <b style="color:#2ef3ff">ASCENDED SET</b> at floors 350-500.`},
  classic:{ok:()=>isOpen('ccP'),t:`<b>CLASSIC COLLECTION</b>: buy classic cars with your <b>garage cash</b>. Every car gives tickets over time and makes <b>all heroes stronger</b> – forever.`}};
setInterval(()=>{if(running||!window.__TE||!G.h)return;if(!G.tut&&(isNew()||(G.tutS!=null&&!progressed())))return;  // not during / before the main tutorial            // only after the main tutorial (done or skipped)
  const seen=G.tutM||(G.tutM=[]);const k=Object.keys(PG).find(k=>!seen.includes('p_'+k)&&(()=>{try{return PG[k].ok();}catch(e){return false;}})());if(!k)return;
  MINI='p_'+k;L=[{t:PG[k].t,next:'GOT IT',top:k==='gear'?0:1}];
  running=true;window.__TUTON=true;document.body.appendChild(root);go(0);loop();},900);
window.__TUT={start:()=>{MINI=null;L=S;start(true);},go:n=>go(n),end};
})();
