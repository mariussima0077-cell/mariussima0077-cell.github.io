// =====================================================================
//  TORQUE EMPIRE · THE FORGE (forge.js) · v16-388 (Marius 27 nov 2026)
//  "ne axăm doar pe armă… upgrade pe bază de nivel, la fiecare 10 nivele trece la alt grad până la Transcendent…
//   fiecare nivel puțin, la breakthrough mai mare, șanse mici care tot scad, fiecare eșec crește șansa…
//   Molten Core resursă generală, Blueprint pe culori… bonus de colecție când 2 arme de la 2 eroi diferiți au același grad"
//  • SIGNATURE TOOL for every MYTHIC hero: Lv 0-70, 7 grades (Common → Transcendent), slot on the hero page pedestal
//      normal level = Molten Core, high chance · BREAKTHROUGH (Lv 10/20…60) = Molten Core + a Blueprint of the next colour,
//      low chance that drops grade after grade, every failure adds chance (pity) · a failed try costs the Molten Core only
//      bonus = × ATK / HP / DEF / skill damage of that hero (battle.js unitStats → FORGE.mul)
//  • TOOL COLLECTION: 2 tools of different heroes at the same grade → a bonus for ALL heroes
//  • JUNKYARD: 3 idle trips (2h / 4h / 8h, the 3rd slot from VIP 3), your 3 best free heroes go → Molten Core + Blueprints
//  • SCRAP GOLEM: 3 tries a week, World Boss fight (battle.js fgGo/fgFinish) → Molten Core every fight + weekly damage tiers
//  v16-392 (Marius 27 nov): open for EVERYBODY from campaign stage 121 (chapter 5) – battle.js fgOK(); the test account always.
//  Save: G.fg = {lv:{heroId:L}, pt:{heroId:pity%}, mc:Molten Core, bp:[_,green,blue,purple,yellow,red,rainbow], ex:[trips], bw:{wk,n,dmg,cl}}
// =====================================================================
(function(){
'use strict';
const T=()=>window.__TE,$=id=>document.getElementById(id);
const ON=()=>!!(window.CAMPAIGN&&CAMPAIGN.fgOK&&CAMPAIGN.fgOK()); // v16-392: everybody from campaign stage 121 (chapter 5); the test account always
const MY=['m5_0','m5_1','m5_2','m5_3','m5_4','m5_5','m5_6','m5_7','m5_8','m5_9'];
const TOOL={m5_0:'Crown Wrench',m5_1:'Twin Turbo Fists',m5_2:'Phoenix Torch',m5_3:'Bulwark Hammer',m5_4:'Starfire Bow',m5_5:'Coil Railgun',m5_6:'Rainbow Spray Staff',m5_7:'Jump-Start Defibrillator',m5_8:'Ghost Wrenches',m5_9:'Crash Shield'};
const GN=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Transcendent'];
const GC=['#cfd8dc','#4cdc4c','#29b6f6','#d05cff','#ffd21a','#ff3b3b','#ff8cf0'];
const BPN=['','Green','Blue','Purple','Yellow','Red','Rainbow'];
const MAXL=70,BT=[0,40,25,15,8,4,1.5],PITY=[0,5,3,2,1,.5,.1],NORM=[100,95,90,85,80,75,70];
const cNorm=g=>10*(g+1)*(g+1),cBT=t=>100*t*t;              // Molten Core per try
const gOf=L=>Math.min(6,Math.floor(L/10));
const isBT=L=>L<MAXL&&(L+1)%10===0&&L+1<=60;
// bonus of one tool: every level +0.4% ATK/HP/DEF and +0.3% skill damage · every breakthrough k: +1.5%·k and +1%·k
function tb(L){const g=gOf(L);let a=L*.4,s=L*.3;for(let k=1;k<=g;k++){a+=1.5*k;s+=k;}return {a,s};}
const CB=[[2,'Rare','atk',2],[3,'Epic','hp',2],[4,'Legendary','def',3],[5,'Mythic','sd',3],[6,'Transcendent','all',5]];
const TRIP=[{h:2,mc:25,k:.25},{h:4,mc:55,k:.5},{h:8,mc:120,k:1}];
const BPCH=[0,50,25,10,4,1.5,.5]; // % per 8h trip (×k for shorter trips), × the heroes' bonus
const BW_T=[{b:10,mc:60,bp:[1,2]},{b:25,mc:120,bp:[2,1]},{b:40,mc:200,bp:[3,1]},{b:60,mc:300,bp:[4,1]}]; // weekly Golem damage tiers (HP bars)
const BW_TRY=3;
const MCI=(h)=>'<img class="fgI" src="img/forge/molten.webp" alt=""'+(h?' style="height:'+h+'"':'')+'>';
const BPI=(i,h)=>'<img class="fgI" src="img/forge/bp_'+i+'.webp" alt=""'+(h?' style="height:'+h+'"':'')+'>';
const now=()=>(window.SEC&&SEC.now)?SEC.now():Date.now();
const wk=()=>{const d=new Date(now());const u=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());const day=(d.getUTCDay()+6)%7;return String(u-day*864e5);};
function S(){const G=T().G;if(!G.fg)G.fg={lv:{},pt:{},mc:0,bp:[0,0,0,0,0,0,0],ex:[],bw:{}};const f=G.fg;
  if(!f.bp||f.bp.length<7)f.bp=[0,0,0,0,0,0,0];if(!f.ex)f.ex=[];if(!f.lv)f.lv={};if(!f.pt)f.pt={};
  if(!f.bw||f.bw.wk!==wk())f.bw={wk:wk(),n:0,dmg:0,cl:[]};
  if(window.SEC&&SEC.TEST_ACC&&!f.gift){f.gift=1;f.mc+=20000;[0,10,8,6,4,3,2].forEach((v,i)=>f.bp[i]+=v);} // test account: something to test with
  return f;}
const own=id=>!!T().G.h.own[id];
const lv=id=>S().lv[id]||0;
let MC=null,MCK='';
function mul(h){if(!ON()||!h||h.crew)return null;const f=S(),k=JSON.stringify(f.lv);if(k!==MCK){MCK=k;MC={};
    const n=[0,0,0,0,0,0,0];MY.forEach(id=>{if(own(id))for(let g=1;g<=gOf(f.lv[id]||0);g++)n[g]++;});
    const c={atk:0,hp:0,def:0,sd:0};CB.forEach(([g,,st,v])=>{if(n[g]>=2){if(st==='all'){c.atk+=v;c.hp+=v;c.def+=v;c.sd+=v;}else c[st]+=v;}});MC._c=c;}
  let r=MC[h.id];if(!r){const c=MC._c,b=MY.includes(h.id)&&own(h.id)?tb(lv(h.id)):{a:0,s:0};
    r=MC[h.id]={atk:(1+b.a/100)*(1+c.atk/100),hp:(1+b.a/100)*(1+c.hp/100),def:(1+b.a/100)*(1+c.def/100),sd:(1+b.s/100)*(1+c.sd/100)};}
  return r;}
function collN(){const n=[0,0,0,0,0,0,0];MY.forEach(id=>{if(own(id))for(let g=1;g<=gOf(lv(id));g++)n[g]++;});return n;}
function cost(id){const L=lv(id),b=isBT(L),t=b?gOf(L)+1:gOf(L);return {L,b,t,mc:b?cBT(t):cNorm(t),bp:b?t:0};}
function chance(id){const c=cost(id);if(c.L>=MAXL)return 0;return Math.min(100,(c.b?BT[c.t]:NORM[c.t])+(c.b?(S().pt[id]||0):0));}
function can(id){const c=cost(id),f=S();return own(id)&&c.L<MAXL&&f.mc>=c.mc&&(!c.bp||f.bp[c.bp]>0);}
function refresh(){MCK='';try{if(window.CAMPAIGN&&CAMPAIGN.gRefresh)CAMPAIGN.gRefresh();}catch(e){}}
function sfx(k){try{if(window.TE_SFX)TE_SFX(k);}catch(e){}}

// ---------------------------------------------------------------- styles + hosts
const css=document.createElement('style');css.textContent=`
.fgI{height:1.2em;vertical-align:-.28em;margin:0 1px}
#gMain .gTool{position:absolute;left:50%;top:calc(52% - 6px);width:52px;height:52px;margin-left:-26px;padding:0;border:0;background:url(img/forge/slot.webp) center/100% 100% no-repeat;pointer-events:auto;z-index:3;filter:drop-shadow(0 0 6px var(--gc))}
#gMain .gTool img{position:absolute;left:17%;top:19%;width:66%;height:66%;object-fit:contain}
#gMain .gTool b{position:absolute;left:50%;bottom:-13px;transform:translateX(-50%);font:900 9px Game,system-ui;color:var(--gc);text-shadow:0 1px 2px #000,0 0 3px #000;white-space:nowrap}
#gMain .gTool i{position:absolute;right:0;top:2px;width:11px;height:11px;border-radius:50%;background:#ff2b2b;border:2px solid #fff;box-shadow:0 0 4px #f00}
#gMain .gTool:active{transform:scale(.92)}
#fgP{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(2,3,6,.82);font-family:Game,system-ui,sans-serif;color:#fff}
#fgP.open{display:flex}
#fgPB{position:relative;width:min(94vw,360px);max-height:92vh;overflow:auto;background:none;padding:58px 22px 24px;filter:drop-shadow(0 0 14px var(--gc))}#fgPB::before{content:'';position:absolute;inset:0;border-style:solid;border-color:transparent;border-width:80px 48px 48px;border-image:url(img/forge/popup.webp) 118 70 70 fill/80px 48px 48px stretch;pointer-events:none;z-index:0}#fgPB>*{position:relative;z-index:1}#fgPB>.fgX{position:absolute;z-index:2} /* v16-391 Marius' popup frame */
.fgX{position:absolute;right:14px;top:14px;width:44px;height:30px;border:0;background:url(img/ui8/ic_close.webp) center/contain no-repeat;font-size:0}
.fgTop{display:flex;gap:12px;align-items:center;padding-right:34px}
.fgSl{position:relative;width:92px;height:92px;flex:none;background:url(img/forge/slot.webp) center/100% 100% no-repeat;filter:drop-shadow(0 0 8px var(--gc))}
.fgSl img{position:absolute;left:16%;top:18%;width:68%;height:68%;object-fit:contain}
.fgTn{font-size:11px;color:#9aa4ae}.fgTt{font-size:17px;font-weight:900;line-height:1.15}.fgG{font-size:13px;font-weight:900;color:var(--gc)}.fgL{font-size:12px;color:#cfd8dc}
.fgBar{height:8px;border-radius:4px;background:#2a2f36;overflow:hidden;margin:10px 0 8px}.fgBar i{display:block;height:100%;background:var(--gc)}
.fgSt{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}.fgSt div{background:#22272e;border-radius:8px;padding:5px 2px;text-align:center;font-size:10px;color:#9aa4ae}.fgSt b{display:block;font-size:13px;color:#fff}
.fgNx{margin-top:10px;border-radius:12px;border:1px solid #2a2f36;background:#161a20;padding:10px}.fgNx.bt{border-color:var(--nc);background:#24171a}
.fgNh{display:flex;justify-content:space-between;align-items:center;font-weight:900;font-size:14px}.fgNh span{color:var(--nc)}.fgNh b{font-size:20px}
.fgNd{font-size:11.5px;color:#c9d1d9;margin:5px 0;line-height:1.35}.fgCo{font-size:12px;color:#ffd9a0;margin-bottom:8px}
.fgGo{width:100%;height:48px;--bh:48px;border-style:solid;border-color:transparent;border-width:0;border-image:url(img/ui8/btn_gold_s.webp) 0 100 fill/0 calc(var(--bh)*1.08) stretch;background:none;box-shadow:none;border-radius:0;color:#3a2300;font:900 italic 16px Game,system-ui}
.fgGo.bt{border-image-source:url(img/ui8/btn_red_s.webp);color:#fff;text-shadow:0 2px 0 #0008}.fgGo.off{border-image-source:url(img/ui8/btn_grey_s.webp);color:#e8edf2;text-shadow:0 1px 0 #0008}
.fgMsg{min-height:18px;text-align:center;font-weight:900;font-size:13px;margin-top:6px}
.fgRes{display:flex;flex-wrap:wrap;gap:3px 5px;justify-content:center;font-size:11px;margin-top:8px;color:#ffe0b2}
#fg{position:fixed;inset:0;z-index:30;display:none;justify-content:center;background:#07090d;font-family:Game,system-ui,sans-serif;color:#fff}
#fg.open{display:flex}
#fgW{position:relative;width:min(100vw,480px);height:100%;background:url(img/forge/forge_bg.webp) center top/cover no-repeat;display:flex;flex-direction:column;overflow:hidden}
#fgW::before{content:'';position:absolute;inset:0;background:linear-gradient(#0008,#000b 45%,#000d);pointer-events:none}
.fgHd{position:relative;padding:calc(env(safe-area-inset-top) + 8px) 8px 4px;display:flex;align-items:center;gap:6px}
.fgHd img{flex:1;min-width:0;height:auto;max-height:62px;object-fit:contain}
.fgBk{width:56px;height:38px;flex:none;border:0;background:url(img/ui8/ic_back.webp) center/contain no-repeat;font-size:0}
.fgRb{position:relative;display:flex;flex-wrap:wrap;justify-content:center;gap:3px 9px;padding:4px 8px;font-size:12px;font-weight:900;background:#0009;border-top:1px solid #ffd54a33;border-bottom:1px solid #ffd54a33}
.fgTb{position:relative;display:flex;gap:6px;padding:8px 10px}
.fgTb button{flex:1;height:40px;--bh:40px;border-style:solid;border-color:transparent;border-width:0;border-image:url(img/ui8/btn_grey_s.webp) 0 100 fill/0 calc(var(--bh)*1.08) stretch;background:none;box-shadow:none;border-radius:0;color:#e8edf2;font:900 italic 13px Game,system-ui;text-shadow:0 1px 0 #0008;position:relative}
.fgTb button.on{border-image-source:url(img/ui8/btn_gold_s.webp);color:#3a2300;text-shadow:none}
.fgTb i{position:absolute;right:4px;top:4px;width:9px;height:9px;border-radius:50%;background:#ff2b2b;border:1.5px solid #fff}
.fgBd{position:relative;flex:1;overflow:auto;padding:4px 10px calc(env(safe-area-inset-bottom) + 18px)}
.fgGr{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.fgC{position:relative;text-align:center;font-size:9px;font-weight:900;color:#fff;text-shadow:0 1px 2px #000}
.fgC .fr{position:relative;width:100%;aspect-ratio:220/221;background:var(--fr) center/100% 100% no-repeat}.fgC .fr img{position:absolute;left:14%;top:14%;width:72%;height:72%;object-fit:contain}.fgC.lk{opacity:.4;filter:grayscale(1)}
.fgC small{display:block;color:var(--gc);font-size:9px}.fgC i{position:absolute;right:0;top:0;width:10px;height:10px;border-radius:50%;background:#ff2b2b;border:1.5px solid #fff}
.fgBx{margin-top:10px;border-style:solid;border-color:transparent;border-width:20px;border-image:url(img/forge/panel.webp) 104 fill/20px stretch;background:none;padding:0 2px} /* v16-390 Marius' 9-slice panel */
.fgBx h4{margin:0 0 4px;font-size:13px;color:#ffb347;letter-spacing:.5px}.fgBx p{margin:0 0 6px;font-size:11px;color:#9aa4ae;line-height:1.35}
.fgRow{display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:3px 0;color:#6c757d}.fgRow.on{color:#ffd54a}
.fgTr{border-style:solid;border-color:transparent;border-width:22px;border-image:url(img/forge/card.webp) 124 fill/22px stretch;background:none;padding:0 2px;margin-top:8px} /* v16-390 Junkyard card */
.fgTr .h{display:flex;justify-content:space-between;align-items:center;font-weight:900;font-size:14px}.fgTr .h span{font-size:12px;color:#ffb347}
.fgTr .m{font-size:11px;color:#9aa4ae;margin:4px 0}.fgTr .b{height:7px;border-radius:4px;background:#2a2f36;overflow:hidden}.fgTr .b i{display:block;height:100%;background:#5ec2ff}
.fgTr .a{display:flex;gap:6px;margin-top:8px}.fgTr .a button{flex:1;height:44px;--bh:44px;border-style:solid;border-color:transparent;border-width:0;border-image:url(img/ui8/btn_blue_s.webp) 0 100 fill/0 calc(var(--bh)*1.08) stretch;background:none;box-shadow:none;border-radius:0;color:#fff;font:900 italic 12px Game,system-ui;text-shadow:0 1px 0 #0008}
.fgTr .a button.off{border-image-source:url(img/ui8/btn_grey_s.webp);color:#cfd8dc}
.fgBs{position:relative;margin-top:4px;border-radius:12px;overflow:hidden;background:url(img/forge/stage.webp) center/cover no-repeat;border:2px solid #ffb74d;box-shadow:0 0 12px #ff6d0055;height:230px;display:flex;align-items:flex-end;justify-content:center}
.fgBs img{height:82%;margin-bottom:9%;object-fit:contain;filter:drop-shadow(0 6px 8px #000a)}.fgBs b{position:absolute;top:8px;left:0;right:0;text-align:center;font-size:22px;color:#ff9d3a;text-shadow:0 2px 4px #000,0 0 8px #000}
`;document.head.appendChild(css);
const P=document.createElement('div');P.id='fgP';P.innerHTML='<div id="fgPB"></div>';document.body.appendChild(P);
const PG=document.createElement('div');PG.id='fg';PG.innerHTML='<div id="fgW"></div>';document.body.appendChild(PG);
P.addEventListener('click',e=>{if(e.target===P){closeTool();return;}const el=e.target.closest('[data-f]');if(!el)return;const a=el.dataset.f;
  if(a==='x')closeTool();else if(a==='try')tryUp(PID);else if(a==='res')T().toast&&T().toast('Molten Core + Blueprints: JUNKYARD trips and the SCRAP GOLEM in THE FORGE (Battle)',3200);});

// ---------------------------------------------------------------- hero page slot + tool popup
function slot(id){if(!ON())return '';const L=lv(id),g=gOf(L),dot=can(id)&&L<MAXL;
  return '<button class="gTool" data-g="tool" style="--gc:'+GC[g]+'" aria-label="Signature Tool"><img src="img/forge/tool_'+id+'.webp" alt=""><b><span style="text-transform:uppercase">'+GN[g]+'</span> · Lv '+L+'</b>'+(dot?'<i></i>':'')+'</button>';}
let PID=null,MSG='',MOK=1;
function tool(id){if(!ON())return;PID=id;MSG='';renderTool();P.classList.add('open');sfx('open');}
function closeTool(){P.classList.remove('open');PID=null;refresh();if(PG.classList.contains('open'))renderPage();}
function renderTool(){const id=PID;if(!id)return;const H=T().HB[id],f=S(),L=lv(id),g=gOf(L),c=cost(id),ch=chance(id),b=tb(L),mx=L>=MAXL,ok=can(id);
  const nc=c.b?GC[c.t]:'#ffb74d';
  let h='<button class="fgX" data-f="x" aria-label="close">✕</button><div class="fgTop"><div class="fgSl" style="--gc:'+GC[g]+'"><img src="img/forge/tool_'+id+'.webp" alt=""></div><div><div class="fgTn"><span>'+(H?H.n:id)+'</span> · <span>SIGNATURE TOOL</span></div><div class="fgTt">'+TOOL[id]+'</div><div class="fgG">'+GN[g]+'</div><div class="fgL">Lv <b>'+L+'</b> / '+MAXL+'</div></div></div>';
  h+='<div class="fgBar"><i style="width:'+(mx?100:(L%10)*10)+'%"></i></div>';
  h+='<div class="fgSt"><div>ATK<b>+'+b.a.toFixed(1)+'%</b></div><div>DEF<b>+'+b.a.toFixed(1)+'%</b></div><div>HP<b>+'+b.a.toFixed(1)+'%</b></div><div>SKILL<b>+'+b.s.toFixed(1)+'%</b></div></div>';
  if(!own(id))h+='<div class="fgNx"><div class="fgNd">🔒 You don\'t own this hero yet.</div></div>';
  else if(mx)h+='<div class="fgNx"><div class="fgNh"><span style="color:'+GC[6]+'">MAX · TRANSCENDENT</span></div></div>';
  else{const pt=f.pt[id]||0;
    h+='<div class="fgNx'+(c.b?' bt':'')+'" style="--nc:'+nc+'"><div class="fgNh"><span>'+(c.b?'<span>BREAKTHROUGH →</span> <span style="text-transform:uppercase">'+GN[c.t]+'</span>':'LEVEL UP → Lv '+(L+1))+'</span><b>'+(+ch.toFixed(1))+'%</b></div>';
    h+='<div class="fgNd">'+(c.b?'<span>Base chance '+BT[c.t]+'%</span>'+(pt?' <span>+ '+(+pt.toFixed(1))+'% from failed tries</span>':'')+'. <span>Every failure: +'+PITY[c.t]+'% next time.</span> <span>A failed try costs only the Molten Core.</span>':'Small bonus every level. Every 10 levels: BREAKTHROUGH to the next grade – a big jump.')+'</div>';
    h+='<div class="fgCo">'+MCI()+' '+c.mc.toLocaleString()+' / '+f.mc.toLocaleString()+(c.bp?' &nbsp; '+BPI(c.bp)+' <span>'+BPN[c.bp]+' Blueprint</span> 1 / '+f.bp[c.bp]:'')+'</div>';
    h+='<button class="fgGo'+(ok?(c.b?' bt':''):' off')+'" data-f="'+(ok?'try':'res')+'">'+(ok?(c.b?'TRY BREAKTHROUGH':'UPGRADE'):'NOT ENOUGH · WHERE TO GET?')+'</button>';
    h+='<div class="fgMsg" style="color:'+(MOK?'#66ff99':'#ff6b6b')+'">'+MSG+'</div></div>';}
  h+='<div class="fgRes">'+MCI()+' '+f.mc.toLocaleString()+[1,2,3,4,5,6].map(i=>' '+BPI(i)+' '+f.bp[i]).join('')+'</div>';
  $('fgPB').style.setProperty('--gc',GC[g]);$('fgPB').innerHTML=h;}
function tryUp(id){if(!id||!can(id))return;const f=S(),c=cost(id),ch=chance(id),win=Math.random()*100<ch;
  f.mc-=c.mc;
  if(win){f.lv[id]=c.L+1;f.pt[id]=0;if(c.bp)f.bp[c.bp]--;MOK=1;MSG=c.b?'🔥 <span>BREAKTHROUGH!</span> <span style="text-transform:uppercase">'+GN[c.t]+'</span>':'✔ Lv '+(c.L+1);sfx(c.b?'levelup':'upgrade');}
  else{MOK=0;if(c.b){f.pt[id]=(f.pt[id]||0)+PITY[c.t];MSG='✖ <span>Failed</span> · <span>+'+PITY[c.t]+'% chance next time</span>';}else MSG='✖ Failed – try again';sfx('deny');}
  MCK='';T().save();renderTool();refresh();} // refresh(): the hero page behind the popup shows the new power at once (Marius)

// ---------------------------------------------------------------- THE FORGE page
let TAB='tools';
function open(tab){if(!ON())return;if(tab)TAB=tab;S();PG.classList.add('open');renderPage();sfx('open');}
function closePage(){PG.classList.remove('open');}
function vip(){try{return T().VLV?T().VLV():0;}catch(e){return 0;}}
function slots(){return vip()>=3?3:2;}
function busy(){const s=new Set();S().ex.forEach(e=>e&&(e.h||[]).forEach(id=>s.add(id)));return s;}
function heroK(ids){let k=1;ids.forEach(id=>{const h=T().HB[id];if(h)k+=[0,0,.02,.05,.1,.2][h.gr||0]||0;});return k;}
function pickTeam(){const b=busy(),HB=T().HB,O=T().G.h.own;return Object.keys(O).filter(id=>HB[id]&&HB[id].cat==='m'&&!HB[id].crew&&!b.has(id)).sort((a,c)=>(HB[c].gr||0)-(HB[a].gr||0)||(O[c].s||0)-(O[a].s||0)).slice(0,3);}
function send(i,d){const f=S();if(f.ex[i])return;const team=pickTeam();if(!team.length){T().toast('No free heroes for a trip',2200);return;}
  f.ex[i]={h:team,d,t:now(),e:now()+TRIP[d].h*36e5};T().save();sfx('tap');renderPage();}
function claim(i){const f=S(),e=f.ex[i];if(!e||now()<e.e)return;const tr=TRIP[e.d],k=heroK(e.h),got={mc:Math.round(tr.mc*k),bp:[0,0,0,0,0,0,0]};
  for(let c=1;c<=6;c++){const p=BPCH[c]*tr.k*k/100;let n=Math.floor(p);if(Math.random()<p-n)n++;got.bp[c]=n;}
  f.mc+=got.mc;got.bp.forEach((n,c)=>f.bp[c]+=n);f.ex[i]=null;T().save();sfx('reward');
  T().toast('🔩 JUNKYARD · +'+got.mc+' Molten Core'+(got.bp.some(n=>n)?' · +'+got.bp.reduce((a,b)=>a+b,0)+' Blueprints':''),3200);renderPage();}
function left(ms){ms=Math.max(0,ms);const h=Math.floor(ms/36e5),m=Math.floor(ms%36e5/6e4);return (h?h+'h ':'')+m+'m';}
function todo(){if(!ON())return false;const f=S(),n=now();for(let i=0;i<slots();i++){const e=f.ex[i];if(!e||n>=e.e)return true;}if(f.bw.n<BW_TRY)return true;return false;}
function sub(){if(!ON())return '';const f=S();return 'TOOLS · JUNKYARD · GOLEM '+(BW_TRY-f.bw.n)+'/'+BW_TRY;}
function renderPage(){const f=S(),W=$('fgW'),n=now();
  const jd=(()=>{for(let i=0;i<slots();i++){const e=f.ex[i];if(!e||n>=e.e)return 1;}return 0;})(),bd=f.bw.n<BW_TRY,td=MY.some(id=>can(id));
  let h='<div class="fgHd"><button class="fgBk" data-p="back" aria-label="back">↩</button><img src="img/ui7/m_forge.webp" alt="THE FORGE"></div>';
  h+='<div class="fgRb">'+MCI()+' '+f.mc.toLocaleString()+[1,2,3,4,5,6].map(i=>'<span>'+BPI(i)+' '+f.bp[i]+'</span>').join('')+'</div>';
  h+='<div class="fgTb">'+[['tools','TOOLS',td],['junk','JUNKYARD',jd],['boss','SCRAP GOLEM',bd]].map(([k,t,d])=>'<button data-p="tab" data-t="'+k+'" class="'+(TAB===k?'on':'')+'">'+t+(d?'<i></i>':'')+'</button>').join('')+'</div><div class="fgBd">';
  if(TAB==='tools'){
    h+='<div class="fgGr">'+MY.map(id=>{const L=lv(id),g=gOf(L),H=T().HB[id];return '<div class="fgC'+(own(id)?'':' lk')+'" data-p="tool" data-h="'+id+'" style="--gc:'+GC[g]+';--fr:url(img/fr'+g+'.webp)"><div class="fr"><img src="img/forge/tool_'+id+'.webp" alt=""></div>'+(H?String(H.n).split(',')[0]:id)+'<small>Lv '+L+'</small>'+(can(id)?'<i></i>':'')+'</div>';}).join('')+'</div>';
    const N=collN();
    h+='<div class="fgBx"><h4>TOOL COLLECTION</h4><p>2 tools of different heroes at the same grade → a bonus for ALL your heroes.</p>'+CB.map(([g,nm,st,v])=>'<div class="fgRow'+(N[g]>=2?' on':'')+'"><span style="color:'+(N[g]>=2?GC[g]:'')+'">2 × '+nm+' ('+Math.min(2,N[g])+'/2)</span><b>+'+v+'% '+(st==='all'?'ATK, HP, DEF &amp; skill':st==='sd'?'skill damage':st.toUpperCase())+'</b></div>').join('')+'</div>';
    h+='<div class="fgBx"><h4>HOW IT WORKS</h4><p>Every Mythic hero has a SIGNATURE TOOL (also on the hero page, under the hero). Lv 0 → 70 · every 10 levels a BREAKTHROUGH to the next grade: Common → Uncommon → Rare → Epic → Legendary → Mythic → Transcendent. Levels use Molten Core; a breakthrough also needs a Blueprint of the next colour. Chances get lower at every grade – every failed breakthrough adds chance.</p></div>';}
  else if(TAB==='junk'){
    h+='<div class="fgBx"><h4>JUNKYARD</h4><p>Send your 3 best free heroes to dig in the scrap. Longer trips bring more – rare colours only on long trips. Better heroes find more.</p></div>';
    for(let i=0;i<3;i++){const e=f.ex[i],lock=i>=slots();
      if(lock){h+='<div class="fgTr"><div class="h">TRIP '+(i+1)+'<span>🔒 VIP 3</span></div></div>';continue;}
      if(!e){h+='<div class="fgTr"><div class="h">TRIP '+(i+1)+'<span>FREE</span></div><div class="m"><span>Heroes:</span> '+pickTeam().map(id=>String(T().HB[id].n).split(',')[0]).join(', ')+'</div><div class="a">'+TRIP.map((t,d)=>'<button data-p="send" data-i="'+i+'" data-d="'+d+'">'+t.h+'h · '+MCI()+' +'+Math.round(t.mc*heroK(pickTeam()))+'</button>').join('')+'</div></div>';continue;}
      const done=n>=e.e,pc=Math.min(100,(n-e.t)/(e.e-e.t)*100);
      h+='<div class="fgTr"><div class="h">TRIP '+(i+1)+' · '+TRIP[e.d].h+'h<span>'+(done?'READY':left(e.e-n))+'</span></div><div class="m">'+e.h.map(id=>T().HB[id]?String(T().HB[id].n).split(',')[0]:id).join(', ')+'</div><div class="b"><i style="width:'+pc+'%"></i></div><div class="a"><button data-p="claim" data-i="'+i+'" class="'+(done?'':'off')+'">'+(done?'CLAIM':'DIGGING…')+'</button></div></div>';}}
  else{const L=window.CAMPAIGN&&CAMPAIGN.fgL?CAMPAIGN.fgL():1,fd=CAMPAIGN.fmtD;
    h+='<div class="fgBs"><b>SCRAP GOLEM</b><img src="img/forge/golem.webp" alt=""></div>';
    h+='<div class="fgBx"><h4><span>'+(BW_TRY-f.bw.n)+' / '+BW_TRY+' TRIES THIS WEEK</span> · <span>DAMAGE</span> <b>'+fd(f.bw.dmg)+'</b></h4><p>60 seconds with your battle team – the Golem cannot die, only the damage counts. Every fight gives Molten Core; weekly damage tiers give Blueprints. New tries every Monday.</p>'+
      BW_T.map((q,i)=>{const got=f.bw.cl.includes(i);return '<div class="fgRow'+(got?' on':'')+'"><span><b>'+fd(q.b*L)+'</b> <span>('+q.b+' bars)</span></span><b>'+MCI()+' '+q.mc+' + '+BPI(q.bp[0])+' '+q.bp[1]+(got?' ✓':'')+'</b></div>';}).join('')+'</div>';
    h+='<button class="fgGo'+(bd?'':' off')+'" style="margin-top:10px" data-p="fight">'+(bd?'ATTACK · 60 s':'NO TRIES · NEW ON MONDAY')+'</button>';}
  h+='</div>';W.innerHTML=h;}
PG.addEventListener('click',e=>{const el=e.target.closest('[data-p]');if(!el)return;const a=el.dataset.p;
  if(a==='back'){closePage();sfx('close');}
  else if(a==='tab'){TAB=el.dataset.t;sfx('tap');renderPage();}
  else if(a==='tool'){tool(el.dataset.h);}
  else if(a==='send')send(+el.dataset.i,+el.dataset.d);
  else if(a==='claim')claim(+el.dataset.i);
  else if(a==='fight')fight();});
setInterval(()=>{if(PG.classList.contains('open')&&TAB==='junk')renderPage();},30000);

// ---------------------------------------------------------------- SCRAP GOLEM
function fight(){const f=S();if(f.bw.n>=BW_TRY){T().toast('No tries left this week · new on Monday',2400);return;}
  if(!window.CAMPAIGN||!CAMPAIGN.fgGo)return;f.bw.n++;T().save();closePage();
  if(!CAMPAIGN.fgGo(CAMPAIGN.fgL())){f.bw.n--;T().save();open('boss');}}
function bossDone(dmg){const f=S(),L=window.CAMPAIGN&&CAMPAIGN.fgL?CAMPAIGN.fgL():1,bars=dmg/L,mc=Math.round(Math.min(150,bars*4));
  f.bw.dmg+=dmg;f.mc+=mc;const nt=[];BW_T.forEach((q,i)=>{if(!f.bw.cl.includes(i)&&f.bw.dmg>=q.b*L){f.bw.cl.push(i);f.mc+=q.mc;f.bp[q.bp[0]]+=q.bp[1];nt.push(q);}});T().save();
  const fd=CAMPAIGN.fmtD;
  return {html:'<div class="wbRL"><span>'+bars.toFixed(1)+' HP BARS</span> · '+MCI()+' <span>+'+mc+' Molten Core</span></div>'+nt.map(q=>'<div class="wbRN">🎁 <b>'+fd(q.b*L)+'</b> · '+MCI()+' +'+q.mc+' · '+BPI(q.bp[0])+' +'+q.bp[1]+'</div>').join('')+'<div class="wbRL"><span>THIS WEEK</span> <b>'+fd(f.bw.dmg)+'</b> · <span>'+(BW_TRY-f.bw.n)+'/'+BW_TRY+' tries left</span></div>'};}

window.TFORGE={on:ON,mul,slot,tool,open,todo,sub,bossDone,S,lv,tb,cost,chance};
})();
