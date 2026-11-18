// =================== TUTORIAL (v16-72 preview) ===================
// Guided first minutes: a guide talks in a bubble, the screen dims, only the highlighted thing can be tapped,
// an animated hand shows where. Runs ONLY with ?tut=1 in the address (preview for Marius) until he approves it.
// Preview mode = no starter cash, no gift, nothing stored (G.tut is not written) → his real save is not touched.
(function(){
'use strict';
const Q=new URLSearchParams(location.search);
const FORCE=Q.has('tut');
if(!FORCE)return; // ⚠️ preview only for now – new players get it after Marius says OK
const GUIDE={name:'MAMA ROSA',role:'CHIEF MECHANIC',img:'img/hero/m4_1.webp'}; // placeholder until the ChatGPT guide picture arrives

// ---------- styles ----------
const css=document.createElement('style');css.textContent=`
#tut{position:fixed;inset:0;z-index:99990;pointer-events:none;font-family:inherit}
#tut .tb{position:absolute;pointer-events:auto;background:transparent;touch-action:none}
#tut .hole{position:absolute;border-radius:14px;box-shadow:0 0 0 9999px rgba(4,8,14,.68);transition:left .25s,top .25s,width .25s,height .25s,opacity .2s}
#tut .ring{position:absolute;border-radius:16px;border:3px solid #ffd54a;box-shadow:0 0 14px #ffb300,inset 0 0 10px rgba(255,213,74,.5);animation:tutR 1.1s ease-in-out infinite}
@keyframes tutR{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.07);opacity:.65}}
#tut .hand{position:absolute;width:58px;height:58px;margin:-6px 0 0 -14px;animation:tutH 1.1s ease-in-out infinite;filter:drop-shadow(0 4px 4px rgba(0,0,0,.6))}
@keyframes tutH{0%,100%{transform:translate(8px,14px) scale(1)}45%{transform:translate(0,0) scale(.9)}55%{transform:translate(0,0) scale(.9)}}
#tut .bub{position:absolute;left:10px;right:10px;pointer-events:auto;display:flex;align-items:flex-end;gap:0;transition:top .3s,bottom .3s;animation:tutIn .35s ease-out}
@keyframes tutIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
#tut .bub .pt{flex:0 0 92px;height:92px;border-radius:50%;border:3px solid #ffd54a;background:#2a1a00 center/cover;box-shadow:0 0 0 3px #5e3d00,0 6px 14px rgba(0,0,0,.6);position:relative;z-index:2;margin-right:-18px}
#tut .bub .bx{flex:1;min-height:92px;background:linear-gradient(#fff8e1,#ffe9b0);border:3px solid #5e3d00;border-radius:16px;padding:9px 12px 10px 28px;color:#2a1a00;box-shadow:0 6px 16px rgba(0,0,0,.55),inset 0 2px 0 #fff;position:relative}
#tut .bub .nm{display:inline-block;margin:-22px 0 4px -4px;background:linear-gradient(#ffcb3d,#ee7a00);color:#2a1a00;border:2px solid #5e3d00;border-radius:9px;padding:1px 9px;font-weight:900;font-size:12px;letter-spacing:.5px}
#tut .bub .nm small{font-weight:700;opacity:.75;font-size:10px;margin-left:4px}
#tut .bub .tx{font-size:15px;line-height:1.3;font-weight:700}
#tut .bub .tx b{color:#c62828}
#tut .bub .bt{display:flex;justify-content:space-between;align-items:center;margin-top:8px;min-height:30px}
#tut .bub .sk{white-space:nowrap;font-size:12px;color:#7a5a20;font-weight:800;text-decoration:underline;padding:6px 4px;background:none;border:0}
#tut .bub .nx{background:linear-gradient(180deg,#fff0a8 0,#ffcb3d 42%,#ff9d0d 56%,#ee7a00 100%);border:2px solid #5e3d00;border-radius:12px;padding:6px 18px;font-weight:900;font-size:15px;color:#2a1a00;box-shadow:0 3px 0 #8f4c00}
#tut .bub .nx:active{transform:translateY(2px);box-shadow:0 1px 0 #8f4c00}
#tut .bub .dots{white-space:nowrap;font-size:10px;color:#9a7a40;font-weight:900;letter-spacing:2px}
#tut .gift{display:flex;gap:10px;justify-content:center;margin-top:6px;font-weight:900;font-size:16px}
`;document.head.appendChild(css);

const HAND='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M22 6c3 0 5 2 5 5v18l2-1c2-1 4 0 5 1l1 2 2-1c2-1 4 0 5 2l1 1 2-1c2-1 5 1 5 3v12c0 8-5 15-14 15h-4c-6 0-10-3-13-8l-8-13c-1-2 0-5 2-6 2-1 4 0 5 1l3 4V11c0-3 2-5 5-5z" fill="#fff3e0" stroke="#3e2723" stroke-width="3" stroke-linejoin="round"/><path d="M29 32v8M37 33v7M45 35v6" stroke="#3e2723" stroke-width="2.5" stroke-linecap="round"/></svg>');

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
const heroCount=()=>Object.keys(G.h.own||{}).length;
const R=new Proxy({},{get:(o,k)=>()=>X().rect(k)});
const sel0=()=>X().sel(),closePanel=()=>X().closePanel(),fmt=n=>TE().fmt(n),save=()=>TE().save(),toast=(a,b)=>TE().toast(a,b),TOP=52;

// ---------- the steps ----------
let lv0=0,tk0=0,hc0=0,best0=0;
const S=[
 {t:`Welcome to <b>TORQUE EMPIRE</b>, boss! I'm Mama Rosa, your chief mechanic. Let me show you around – it only takes a minute.`,next:'LET\'S GO'},
 {w:'parking',t:`Customer cars arrive here, at the <b>ARRIVAL PARKING</b>. Valet drivers take them to the workshops by themselves.`,next:'NEXT'},
 {w:'inspect',t:`<b>INSPECTION</b> checks every car and decides what must be repaired and which workshop it visits.`,next:'NEXT'},
 {w:'office',t:`When a car is fixed, the <b>SALES OFFICE</b> sells it and you get the money. It all runs by itself – even while you are away!`,next:'NEXT'},
 {w:'service',tap:1,t:`Upgrades make your garage faster and richer. <b>Tap the SERVICE workshop.</b>`,done:()=>isOpen('sheet')&&sel0()==='service'},
 {el:()=>$('shBtn'),tap:1,enter:()=>{lv0=G.lv.service||0;},t:()=>`Tap <b>UPGRADE</b>: more mechanics, faster work and bigger pay.`+(G.money<upCost()?` <small>(you need ${fmt(upCost())} – wait a little, cars are being sold!)</small>`:''),done:()=>(G.lv.service||0)>lv0},
 {el:()=>$('smBtn'),tap:1,enter:()=>{try{closePanel();}catch(e){}},t:`Your mechanics are also <b>HEROES</b>! Open <b>SUMMON</b> – you have free Recruit Tickets.`,done:()=>isOpen('sm')},
 {el:()=>document.querySelector('#smBox [data-a="sum"][data-n="10"]')||document.querySelector('#smBox [data-a="sum"]'),tap:1,enter:()=>{tk0=G.h.tk;hc0=(G.h.hist||[]).length;},t:`Tap <b>×10</b> to recruit 11 heroes at once!`,done:()=>G.h.tk<tk0||(G.h.hist||[]).length!==hc0||isOpen('res')},
 {free:1,top:1,t:`Nice team! Heroes <b>work in your garage</b> and <b>fight in battles</b>. Now close these pages to continue.`,done:()=>!isOpen('sm')&&!isOpen('res')},
 {el:()=>$('cpBtn'),tap:1,t:`Monsters made of car parts are attacking the city! Tap <b>BATTLE</b>.`,done:()=>isOpen('hub')||isOpen('cp')},
 {el:()=>document.querySelector('#hub.open [data-hb="camp"]'),tap:1,t:`Open the <b>CAMPAIGN</b>.`,done:()=>vis(document.querySelector('#cpPath .node.cur'))&&!isOpen('hub')},
 {el:()=>document.querySelector('#cpPath .node.cur'),tap:1,enter:()=>{best0=G.cp.best;},t:`Tap your stage.`,done:()=>isOpen('cpCard')},
 {el:()=>document.querySelector('#cpCard.open .ppF'),tap:1,t:`Your best heroes are already in the team. Press <b>FIGHT!</b>`,done:()=>isOpen('bt')},
 {hide:1,done:()=>isOpen('cpRes')},
 {free:1,top:1,t:()=>G.cp.best>best0?`<b>VICTORY!</b> Battles give money, tickets, diamonds and gear. Now go back to your garage with <b>↩</b>.`:`So close! Make your heroes stronger with gear and try again. Go back to your garage with <b>↩</b>.`,done:()=>!isOpen('cp')&&!isOpen('hub')&&!isOpen('bt')&&!isOpen('cpRes')},
 {el:()=>$('dqBtn'),t:`<b>DAILY QUESTS</b>: finish them every day for VIP points, diamonds and tickets.`,next:'NEXT'},
 {el:()=>$('idBtn'),t:`<b>IDLE REWARDS</b>: your garage keeps earning while you are offline. Collect it here!`,next:'NEXT'},
 {t:()=>`That's it, boss! Here is a welcome gift. Now build your <b>TORQUE EMPIRE</b>!<div class="gift"><span>${TE().DMI} 100</span><span>${X().TKI()} 2</span></div>`,next:'START',gift:1},
];
function upCost(){try{return X().upCost('service');}catch(e){return 0;}}

// ---------- overlay ----------
const root=document.createElement('div');root.id='tut';root.innerHTML='<div class="hole"></div><div class="ring"></div><img class="hand" alt=""><div class="tb" id="tbT"></div><div class="tb" id="tbB"></div><div class="tb" id="tbL"></div><div class="tb" id="tbR"></div><div class="bub"><div class="pt"></div><div class="bx"><div class="nm"></div><div class="tx"></div><div class="bt"><button class="sk">SKIP TUTORIAL</button><span class="dots"></span><button class="nx">NEXT</button></div></div></div>';
const hole=root.querySelector('.hole'),ring=root.querySelector('.ring'),hand=root.querySelector('.hand'),bub=root.querySelector('.bub'),tx=root.querySelector('.tx'),nx=root.querySelector('.nx'),sk=root.querySelector('.sk'),dots=root.querySelector('.dots');
hand.src=HAND;root.querySelector('.pt').style.backgroundImage='url('+GUIDE.img+')';root.querySelector('.nm').innerHTML=GUIDE.name+'<small>'+GUIDE.role+'</small>';
const tb={T:$('tbT')||root.querySelector('#tbT'),B:root.querySelector('#tbB'),L:root.querySelector('#tbL'),R:root.querySelector('#tbR')};
let i=-1,cur=null,skipArm=0,lastTx='';
function place(L,T,Wd,H){const s=(e,a,b,c,d)=>{e.style.left=a+'px';e.style.top=b+'px';e.style.width=Math.max(0,c)+'px';e.style.height=Math.max(0,d)+'px';};
  s(tb.T,0,0,innerWidth,T);s(tb.B,0,T+H,innerWidth,innerHeight-T-H);s(tb.L,0,T,L,H);s(tb.R,L+Wd,T,innerWidth-L-Wd,H);}
function go(n){i=n;cur=S[i];skipArm=0;lastTx='';if(!cur){end();return;}
  if(cur.enter)try{cur.enter();}catch(e){}
  if(cur.w){camTo(R[cur.w]());try{if(sel0()&&!cur.tap)closePanel();}catch(e){}}
  nx.textContent=cur.next||'';nx.style.display=cur.next?'':'none';
  dots.textContent=(i+1)+' / '+S.length;sk.style.visibility=cur.gift?'hidden':'';
  bub.style.animation='none';void bub.offsetWidth;bub.style.animation='';}
function end(){root.remove();running=false;window.__TUTON=false;
  if(!FORCE){G.tut=1;try{save();}catch(e){}}}
nx.onclick=()=>{if(cur&&cur.gift&&!FORCE){G.dm=(G.dm||0)+100;G.h.tk+=2;try{save();toast('🎁 Welcome gift: 100 diamonds + 2 Recruit Tickets',3500);}catch(e){}}
  if(cur&&cur.gift&&FORCE){try{toast('Preview: the gift is not given (test only)',2500);}catch(e){}}
  go(i+1);};
sk.onclick=()=>{if(!skipArm){skipArm=1;sk.textContent='TAP AGAIN TO SKIP';setTimeout(()=>{skipArm=0;sk.textContent='SKIP TUTORIAL';},2500);return;}end();};
let running=true;
function loop(){if(!running)return;requestAnimationFrame(loop);if(!cur)return;
  camStep();
  if(cur.done){let ok=false;try{ok=cur.done();}catch(e){}if(ok){go(i+1);return;}}
  const t=typeof cur.t==='function'?cur.t():cur.t;if(t!==lastTx){tx.innerHTML=t||'';lastTx=t;}
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
const wait=setInterval(()=>{const ld=document.getElementById('loader');if(!ld||!ld.classList.contains('hide'))return;clearInterval(wait);
  setTimeout(()=>{window.__TUTON=true;document.body.appendChild(root);go(0);loop();},700);},200);
window.__TUT={go:n=>go(n),end};
})();
