// =====================================================================
//  TORQUE EMPIRE · DYNO GARAGE + TUNING CHIPS (dyno.js) · v16-398 (Marius 28 nov 2026)
//  "mașini inventate… cu grade, fiecare grad trebuie să facem level up… să nu primim de la prima mașină chestii de ultimul grad…
//   sistem nou fără bătălii" · "fiecare Dyno test ne dă aleatorii chestii pentru upgrade"
//  PRIVATE: only the owner's FULL TEST ACCOUNT (SEC.TEST_ACC) until Marius says otherwise (rule 28 nov: everything new = private
//  until the GRAND RELEASE). For everybody later → change ON().
//  • 6 invented cars, one per grade (Common → Mythic): Rusty Pup, Street Sprout, Drift Fox, Thunder Mule, Viper Blade, Torque Phantom
//      6 parts per car (Engine, Turbo, Exhaust, ECU, Intercooler, Tires) Lv 0-10 → TUNE 0/60 · upgrades = cash + Dyno Parts
//      next car unlocks only at TUNE 60/60 + an unlock price · HP / Nm grow with the tune
//  • DYNO RUN: 3 free a day (+3 for diamonds) → wheels / rollers / fan spin, gauges climb, power curve drawn, then random rewards:
//      Dyno Parts, Tuning Oil and TUNING CHIPS · the CHIP GRADE IS CAPPED BY THE CAR GRADE (Common car → max Uncommon chips …
//      Legendary car → max Legendary, only the Mythic car drops Mythic chips) · more HP inside the grade = better odds
//  • TUNING CHIPS (hero power): 4 slots per hero – TURBO (ATK%), ECU (Crit), SUSPENSION (HP%), NITRO (Skill damage)
//      main stat fixed by the slot · 0-4 random sub stats by grade · +0 → +15 with Tuning Oil (every +3: a new sub or a sub grows)
//      RECALIBRATE a sub (new stat type, same roll) for diamonds · SALVAGE a chip → Tuning Oil
//      bonus goes into battle.js unitStats (TDYNO.bon) – same keys as gear (atk, hp, def, crit, cdmg, aspd, en)
//  Save: G.dy = {c:unlocked car, s:shown car, p:[[6 lv]×6], dp, oil, d:day, n:runs, x:extra runs, best:[6], ch:[chips], eq:{hid:[4 ids]}, id}
// =====================================================================
(function(){
'use strict';
const T=()=>window.__TE,$=id=>document.getElementById(id);
const ON=()=>!!(window.SEC&&SEC.TEST_ACC);
const GN=['Common','Uncommon','Rare','Epic','Legendary','Mythic'];
const GC=['#cfd8dc','#4cdc4c','#29b6f6','#d05cff','#ffd21a','#ff3b3b'];
const CAR=[
 {n:'RUSTY PUP',hp:[90,180],nm:1.45},{n:'STREET SPROUT',hp:[180,320],nm:1.3},{n:'DRIFT FOX',hp:[320,500],nm:1.35},
 {n:'THUNDER MULE',hp:[500,750],nm:1.7},{n:'VIPER BLADE',hp:[750,1100],nm:1.15},{n:'TORQUE PHANTOM',hp:[1100,2000],nm:1.25}];
// wheel centres + radius in the car picture (1000 px wide) – img/dyno/car<i>.webp, wheels w<i>_<0 rear|1 front>.webp
const GEO=[
 {h:497,w:[[202.9,396.9],[805.3,396.9]],r:93.6},{h:572,w:[[166,463.4],[766.5,463.4]],r:99.9},{h:373,w:[[213.8,276.1],[746,276.1]],r:91.8},
 {h:371,w:[[210.7,259.5],[767.9,259.5]],r:88.3},{h:324,w:[[178.4,225.8],[731.5,225.8]],r:91.5},{h:351,w:[[191.8,248.2],[765.8,248.2]],r:94.2}];
const PTI=i=>'<img src="img/dyno/part'+i+'.webp" alt="" style="width:42px;height:42px;object-fit:contain">'; // v16-401 Marius' part icons
const PART=[['ENGINE',PTI(0),.26],['TURBO',PTI(1),.24],['EXHAUST',PTI(2),.12],['ECU',PTI(3),.16],['INTERCOOLER',PTI(4),.12],['TIRES',PTI(5),.10]];
const PMAX=10,TMAX=PART.length*PMAX;
const CASH0=[1e3,6e3,30e3,150e3,7e5,3e6],DPK=[2,3,5,8,12,18]; // v16-401 (Marius: „mai greu de la început… pe bază de RNG… câteva luni”)
const PCH=(c,l)=>Math.max(25,100-l*7-c*4),PPITY=5; // part upgrade chance %, +5% after every fail (per part)
const CCH=(g,l)=>Math.max(20,100-l*5-g*3),CPITY=4; // chip upgrade chance %, +4% after every fail (per chip)
const pCash=(c,l)=>Math.round(CASH0[c]*Math.pow(l+1,1.6)/10)*10,pDp=(c,l)=>Math.ceil((l+1)*DPK[c]);
const unCash=c=>CASH0[c]*50,unDp=c=>DPK[c]*60;
const FREE=3,EXTRA=[100,200,300]; // v16-402 (Marius 28 nov): max 3 extra runs a day – 100 / 200 / 300 diamonds (600 in total)
// ---- chips
const CHI=i=>'<img class="dyI" src="img/dyno/chip'+i+'.webp" alt="">'; // v16-399 Marius' chip icons
const SL=[['TURBO',CHI(0),'atk'],['ECU',CHI(1),'crit'],['SUSPENSION',CHI(2),'hp'],['NITRO',CHI(3),'en']];
const DPI='<img class="dyI" src="img/dyno/dp.webp" alt="">',OILI='<img class="dyI" src="img/dyno/oil.webp" alt="">';
const MAINB={atk:[1.5,2.5,4,6,8.5,12],hp:[1.5,2.5,4,6,8.5,12],en:[1.5,2.5,4,6,8.5,12],crit:[.6,1,1.6,2.4,3.4,4.8]};
const SUBK=['atk','hp','def','crit','cdmg','aspd','en'];
const SUBB={atk:[.8,1.2,1.8,2.5,3.5,5],hp:[.8,1.2,1.8,2.5,3.5,5],def:[.8,1.2,1.8,2.5,3.5,5],cdmg:[1,1.5,2.2,3,4.2,6],en:[.8,1.2,1.8,2.5,3.5,5],crit:[.4,.6,.9,1.25,1.75,2.5],aspd:[.4,.6,.9,1.25,1.75,2.5]};
const SN={atk:'ATK',hp:'HP',def:'DEF',crit:'Crit Chance',cdmg:'Crit Damage',aspd:'Attack Speed',en:'Skill Damage'};
const SUB0=[0,1,1,2,2,3],CMAX=15,OILK=[4,6,10,16,25,40],RECAL=[20,30,50,80,120,200],SALV=[5,10,20,40,80,160];
const HSLOT=[1,60,140,220]; // hero level to open chip slot 1-4 (the test account: all open)
const mainV=c=>MAINB[SL[c.s][2]][c.g]*(1+c.l*.27); // v16-401: more stats per +level (+15 = ×5)
const subV=(c,i)=>SUBB[c.sub[i][0]][c.g]*c.sub[i][1];
const oilCost=c=>Math.ceil((c.l+1)*OILK[c.g]);
const fmtS=(k,v)=>'+'+(Math.round(v*10)/10)+'%';
const now=()=>(window.SEC&&SEC.now)?SEC.now():Date.now();
const dayK=()=>{const d=new Date(now());return d.getUTCFullYear()+'-'+(d.getUTCMonth()+1)+'-'+d.getUTCDate();};
const rnd=(a,b)=>a+Math.random()*(b-a);
function S(){const G=T().G;if(!G.dy)G.dy={c:0,s:0,p:[[0,0,0,0,0,0]],dp:0,oil:0,d:'',n:0,x:0,best:[0,0,0,0,0,0],ch:[],eq:{},id:1};const y=G.dy;
  while(y.p.length<6)y.p.push([0,0,0,0,0,0]);if(!y.best)y.best=[0,0,0,0,0,0];if(!y.ch)y.ch=[];if(!y.eq)y.eq={};
  if(y.d!==dayK()){y.d=dayK();y.n=0;y.x=0;}
  if(window.SEC&&SEC.TEST_ACC&&!y.gift){y.gift=1;y.dp+=500;y.oil+=2000;} // test account: something to test with
  return y;}
const tune=c=>S().p[c].reduce((a,b)=>a+b,0);
function carHP(c){const p=S().p[c],[a,b]=CAR[c].hp;let k=0;PART.forEach((q,i)=>k+=q[2]*(p[i]/PMAX));return Math.round(a+(b-a)*k);}
const carNm=(c,hp)=>Math.round((hp||carHP(c))*CAR[c].nm);
const capG=c=>c===5?5:Math.min(4,c+1);
const runsLeft=()=>{const y=S();return Math.max(0,FREE-y.n);};
function sfx(k){try{if(window.TE_SFX)TE_SFX(k);}catch(e){}}
function toast(t,ms){try{T().toast(t,ms||2200);}catch(e){}}
function refresh(){VER++;try{if(window.CAMPAIGN&&CAMPAIGN.gRefresh)CAMPAIGN.gRefresh();}catch(e){}}
const hName=id=>{const H=T().HB[id];return H?String(H.n).split(',')[0]:id;};
const hLv=id=>{try{return (T().lvOf&&T().lvOf(id))||1;}catch(e){return 1;}};
// ---------------------------------------------------------------- chips
function newChip(g,s){const y=S(),c={id:y.id++,s:s==null?Math.floor(Math.random()*4):s,g,l:0,sub:[]};for(let i=0;i<SUB0[g];i++)addSub(c);return c;}
function addSub(c){const main=SL[c.s][2],have=c.sub.map(q=>q[0]),pool=SUBK.filter(k=>k!==main&&!have.includes(k));const k=pool[Math.floor(Math.random()*pool.length)];c.sub.push([k,Math.round(rnd(.7,1)*100)/100]);}
function chipBon(c){const o={};const k=SL[c.s][2];o[k]=(o[k]||0)+mainV(c);c.sub.forEach((q,i)=>{o[q[0]]=(o[q[0]]||0)+subV(c,i);});return o;}
const chipById=id=>S().ch.find(c=>c.id===id);
function ownerOf(id){const e=S().eq;for(const h in e)if((e[h]||[]).includes(id))return h;return null;}
let VER=0,BC={},BV=-1;
function bon(h){if(!ON()||!h||h.crew)return null;if(BV!==VER){BV=VER;BC={};}let r=BC[h.id];if(r!==undefined)return r;
  const L=(S().eq[h.id]||[]).map(chipById).filter(Boolean);if(!L.length){BC[h.id]=null;return null;}
  r={};L.forEach(c=>{const o=chipBon(c);for(const k in o)r[k]=(r[k]||0)+o[k];});BC[h.id]=r;return r;}
function slotOpen(hid,s){return (window.SEC&&SEC.TEST_ACC)||hLv(hid)>=HSLOT[s];}
// ---------------------------------------------------------------- CSS + DOM
const css=document.createElement('style');css.textContent=`
#dy{position:fixed;inset:0;z-index:30;display:none;justify-content:center;align-items:flex-start;background:#05070b;font-family:Game,system-ui,sans-serif;color:#fff;overflow:hidden}
#dy.open{display:flex}
#dyS{position:relative;width:calc(var(--u)*1024);height:100%;min-height:calc(var(--u)*1536);background:url(img/dyno/room.webp) 0 0/100% auto no-repeat,linear-gradient(#2a303a,#10141a 60%);background-color:#10141a;overflow:hidden;flex:none}
.dyA{position:absolute;left:calc(var(--u)*var(--x));top:calc(var(--u)*var(--y));width:calc(var(--u)*var(--w));height:calc(var(--u)*var(--h))}
#dyHd{left:0;top:0;width:100%;height:calc(var(--u)*205);background:linear-gradient(#000d,#0009 70%,#0000);display:flex;flex-direction:column;align-items:center;padding-top:env(safe-area-inset-top)}
#dyHd .r1{display:flex;align-items:center;width:100%;height:calc(var(--u)*110);padding:0 calc(var(--u)*16)}
#dyHd .bk{width:calc(var(--u)*150);height:calc(var(--u)*100);border:0;background:url(img/ui8/ic_back.webp) center/contain no-repeat;font-size:0;flex:none}
#dyHd h1{flex:1;margin:0;text-align:center;font:900 calc(var(--u)*66) Game,system-ui;color:#ffd23a;text-shadow:0 calc(var(--u)*5) 0 #5a3000,0 0 calc(var(--u)*14) #000;letter-spacing:1px}
#dyHd .sp{width:calc(var(--u)*150);flex:none}
#dyHd .r2{display:flex;gap:calc(var(--u)*30);justify-content:center;font:900 calc(var(--u)*38) Game,system-ui;text-shadow:0 2px 3px #000}
#dyHd .r2 img{height:1.3em;vertical-align:-.25em;margin-right:3px}
.dyWh,.dyFan{position:absolute;border-radius:50%;background-size:100% 100%;will-change:transform}
.dyCar{position:absolute;will-change:transform}
.dyCar>img{position:absolute;left:0;top:0;width:100%;height:100%}
.dyCar.lk>img,.dyCar.lk .dyWh{filter:brightness(.08) saturate(0)}
.dyLk{position:absolute;left:0;right:0;top:38%;text-align:center;font:900 calc(var(--u)*60) Game,system-ui;color:#fff;text-shadow:0 2px 6px #000}
.dyG{position:absolute;text-align:center;font:900 calc(var(--u)*34) Game,system-ui;text-shadow:0 2px 4px #000;line-height:1}
.dyG small{display:block;font-size:.6em;color:#9fb3c8;margin-top:2px}
#dyScr{position:absolute}
.dyFl{left:0;top:calc(var(--u)*1108);bottom:0;width:100%;height:auto!important;background:linear-gradient(#0000,#000a calc(var(--u)*80),#0a0d12f0 calc(var(--u)*428));padding:0 calc(var(--u)*26) calc(env(safe-area-inset-bottom) + var(--u)*30);box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-start;gap:calc(var(--u)*26)}
.dyNm{display:flex;align-items:center;gap:calc(var(--u)*12);min-height:calc(var(--u)*96)}
.dyNm button{width:calc(var(--u)*84);height:calc(var(--u)*84);border-radius:50%;border:calc(var(--u)*4) solid #ffd54a;background:#1b2028;color:#ffd54a;font:900 calc(var(--u)*44) Game,system-ui;flex:none;padding:0}
.dyNm button:disabled{opacity:.3}
.dyNm .t{flex:1;text-align:center;line-height:1.05}
.dyNm .t>b{display:block;font-size:calc(var(--u)*50);letter-spacing:1px;text-shadow:0 3px 0 #000}
.dyNm .t span{font-size:calc(var(--u)*30);color:var(--gc);text-shadow:0 2px 2px #000}
.dyBar{height:calc(var(--u)*34);border-radius:calc(var(--u)*17);background:#1d232b;border:2px solid #3a434e;overflow:hidden;position:relative;flex:none}
.dyBar i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#ff8f00,#ffd54a)}
.dyBar b{position:relative;display:block;text-align:center;font:900 calc(var(--u)*24)/calc(var(--u)*27) Game,system-ui;text-shadow:0 1px 2px #000}
.dyBt{display:flex;gap:calc(var(--u)*16)}
.dyBt button{position:relative;flex:1;height:min(calc(var(--u)*170),64px);--bh:min(calc(var(--u)*170),64px);border-style:solid;border-color:transparent;border-width:0;border-image:url(img/ui8/btn_blue_s.webp) 0 100 fill/0 calc(var(--bh)*1.08) stretch;background:none;color:#fff;font:900 italic calc(var(--u)*38) Game,system-ui;text-shadow:0 2px 0 #0008;padding:0;line-height:1.05}
.dyBt button small{display:block;font-size:.62em;font-style:normal}
.dyBt button.go{flex:1.35;border-image-source:url(img/ui8/btn_red_s.webp);font-size:calc(var(--u)*48)}
.dyBt button.gd{border-image-source:url(img/ui8/btn_gold_s.webp);color:#3a2300;text-shadow:none}
.dyBt button.off{border-image-source:url(img/ui8/btn_grey_s.webp);color:#cfd8dc}
.dyBt button i{position:absolute;right:8%;top:10%;width:calc(var(--u)*24);height:calc(var(--u)*24);border-radius:50%;background:#ff2b2b;border:2px solid #fff}
.dyRec2{display:grid;grid-template-columns:1fr 1fr;gap:calc(var(--u)*6) calc(var(--u)*28);background:#0b0e13cc;border:2px solid #2a313b;border-radius:calc(var(--u)*24);padding:calc(var(--u)*18) calc(var(--u)*28);font:900 calc(var(--u)*27) Game,system-ui}
.dyRec2 .h{grid-column:1/-1;text-align:center;color:#ffd54a;font-size:calc(var(--u)*32)}
.dyRec2>div:not(.h){display:flex;justify-content:space-between;gap:8px}
.dyInf{text-align:center;line-height:1.5;font-size:calc(var(--u)*27);color:#b0bec5;text-shadow:0 1px 2px #000}
.dyInf b{color:var(--gc)}
#dy.run .dyCar{animation:dyShk .09s linear infinite}
@keyframes dyShk{0%{transform:translateY(0)}50%{transform:translateY(calc(var(--u)*2.5))}100%{transform:translateY(0)}}
.dyPf{position:absolute;width:calc(var(--u)*60);height:calc(var(--u)*60);border-radius:50%;background:radial-gradient(#cfd8dccc,#90a4ae55 60%,#0000 70%);pointer-events:none;animation:dyPf 1.1s ease-out forwards}
@keyframes dyPf{from{transform:translate(0,0) scale(.4);opacity:.9}to{transform:translate(calc(var(--u)*-160),calc(var(--u)*-90)) scale(2.4);opacity:0}}
#dyP{position:fixed;inset:0;z-index:62;display:none;align-items:center;justify-content:center;background:rgba(2,3,6,.82);font-family:Game,system-ui,sans-serif;color:#fff}
#dyP.open{display:flex}
#dyPB{position:relative;width:min(94vw,380px);max-height:90vh;overflow:auto;padding:58px 20px 22px;box-sizing:border-box}
#dyPB::before{content:'';position:absolute;inset:0;border-style:solid;border-color:transparent;border-width:80px 48px 48px;border-image:url(img/forge/popup.webp) 118 70 70 fill/80px 48px 48px stretch;pointer-events:none;z-index:0}
#dyPB>*{position:relative;z-index:1}
.dyX{position:absolute!important;right:14px;top:14px;width:44px;height:30px;border:0;background:url(img/ui8/ic_close.webp) center/contain no-repeat;font-size:0;z-index:2!important}
.dyPT{font:900 18px Game,system-ui;text-align:center;margin:-6px 30px 8px;color:#ffd54a;text-shadow:0 2px 0 #000}
.dyPD{font-size:11.5px;color:#b0bec5;text-align:center;margin-bottom:8px;line-height:1.35}
.dyRw{display:flex;align-items:center;gap:8px;background:#161a20cc;border:1px solid #2a2f36;border-radius:10px;padding:6px 8px;margin-bottom:6px}
.dyRw .ic{font-size:22px;width:44px;flex:none;text-align:center;display:flex;align-items:center;justify-content:center}
.dyRw .tx{flex:1;min-width:0;font-size:12px;line-height:1.25}.dyRw .tx b{font-size:13px}.dyRw .tx small{display:block;color:#9aa4ae;font-size:10.5px}
.dyRw .pl{display:flex;gap:2px;margin-top:3px}.dyRw .pl i{flex:1;height:5px;border-radius:2px;background:#2a2f36}.dyRw .pl i.on{background:#ffb300}
.dyUp{height:40px;min-width:84px;--bh:40px;border-style:solid;border-color:transparent;border-width:0;border-image:url(img/ui8/btn_gold_s.webp) 0 100 fill/0 calc(var(--bh)*1.08) stretch;background:none;color:#3a2300;font:900 11px/1.1 Game,system-ui;padding:0 4px}
.dyUp.off{border-image-source:url(img/ui8/btn_grey_s.webp);color:#e0e0e0}
.dyUp.bl{border-image-source:url(img/ui8/btn_blue_s.webp);color:#fff}
.dyUp.rd{border-image-source:url(img/ui8/btn_red_s.webp);color:#fff}
.dyGo{width:100%;height:48px;--bh:48px;margin-top:8px;border-style:solid;border-color:transparent;border-width:0;border-image:url(img/ui8/btn_gold_s.webp) 0 100 fill/0 calc(var(--bh)*1.08) stretch;background:none;color:#3a2300;font:900 italic 15px Game,system-ui}
.dyGo.off{border-image-source:url(img/ui8/btn_grey_s.webp);color:#e8edf2}
.dyGo.bl{border-image-source:url(img/ui8/btn_blue_s.webp);color:#fff}
.dyCI{display:inline-block;position:relative;width:64px;height:64px;flex:none;background:var(--fr) center/100% 100% no-repeat;text-align:center;font-size:28px;line-height:64px;vertical-align:middle}
.dyCI b{position:absolute;right:4px;bottom:2px;font:900 11px/1 Game,system-ui;color:#fff;text-shadow:0 1px 2px #000,0 0 3px #000}
.dyCI img.ci{position:absolute;left:15%;top:15%;width:70%;height:70%;object-fit:contain}
.dyCI img.po{position:absolute;left:-4px;top:-4px;width:24px;height:24px;border-radius:50%;border:2px solid #ffd54a;object-fit:cover}
.dyI{height:1.25em;width:auto;vertical-align:-.3em;margin-right:2px}
.dyRwd .bx .dyI{height:80%;margin:0}
.dyGr{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}
.dyGr .dyCI{width:100%;height:auto;aspect-ratio:1;line-height:normal;display:flex;align-items:center;justify-content:center}
.dyTb{display:flex;gap:4px;margin-bottom:8px}.dyTb button{flex:1;height:32px;border-radius:8px;border:1px solid #3a434e;background:#1b2028;color:#cfd8dc;font:900 10px Game,system-ui;padding:0}.dyTb button.on{background:#ffd54a;color:#3a2300;border-color:#ffd54a}
.dySt{font-size:12.5px;line-height:1.5}.dySt .mn{font-size:15px;font-weight:900;color:#ffd54a}
.dySt .sb{display:flex;align-items:center;justify-content:space-between;gap:6px;border-top:1px solid #2a2f36;padding:3px 0}
.dySt .sb button{height:26px;border-radius:7px;border:1px solid #7e57c2;background:#2a1d40;color:#e1bee7;font:900 10px Game,system-ui;padding:0 6px}
.dyHS{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}
.dyHS>div{text-align:center;font-size:9.5px;font-weight:900;color:#b0bec5;border-radius:10px;padding:4px 0;border:2px solid transparent}
.dyHS>div.on{border-color:#ffd54a;background:#ffd54a18}
.dyHS .dyCI{width:58px;height:58px;line-height:58px}
.dyHS .em{width:58px;height:58px;margin:0 auto;border-radius:10px;border:2px dashed #4a5561;display:flex;align-items:center;justify-content:center;font-size:24px;color:#6c7a89}
.dyRes{display:flex;justify-content:center;gap:14px;margin:6px 0 10px}
.dyRes div{text-align:center}.dyRes b{display:block;font-size:30px;line-height:1;text-shadow:0 2px 0 #000}.dyRes small{color:#9aa4ae;font-size:11px}
.dyRec{text-align:center;color:#ffd54a;font:900 15px Game,system-ui;animation:dyRec .6s ease-in-out infinite alternate}
@keyframes dyRec{from{transform:scale(1)}to{transform:scale(1.12)}}
.dyRwd{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px 0}
.dyRwd>div{text-align:center;font-size:10px;font-weight:900;animation:dyPop .45s cubic-bezier(.2,1.6,.4,1) both}
@keyframes dyPop{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
.dyRwd .bx{width:58px;height:58px;border-radius:10px;background:#1b2028;border:2px solid #3a434e;display:flex;align-items:center;justify-content:center;font-size:24px}
#gMain .gTune{position:absolute;right:2%;top:calc(.8% + 45px);width:40px;height:38px;border-radius:12px;border:2px solid #4fc3f7;background:linear-gradient(#81d4fa,#0277bd);color:#fff;font:900 18px/1 Game,system-ui;padding:0;pointer-events:auto;box-shadow:0 2px 0 #01385e,0 0 10px #0288d1;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center}
#gMain .gTune small{font:900 7.5px Game,system-ui;letter-spacing:.3px;margin-top:1px}
#gMain .gTune i{position:absolute;right:-3px;top:-3px;width:11px;height:11px;border-radius:50%;background:#ff2b2b;border:2px solid #fff}
`;document.head.appendChild(css);
const PG=document.createElement('div');PG.id='dy';PG.innerHTML='<div id="dyS"></div>';document.body.appendChild(PG);
const P=document.createElement('div');P.id='dyP';P.innerHTML='<div id="dyPB"></div>';document.body.appendChild(P);
// ---------------------------------------------------------------- page
let SH=0,RUN=null,LAST=null; // shown car, running animation, last result curve
function size(){const W=Math.min(innerWidth,480,innerHeight/1.25);PG.style.setProperty('--u',(W/1024)+'px');}
addEventListener('resize',()=>{if(PG.classList.contains('open'))size();});
function open(){if(!ON())return;const y=S();SH=Math.min(y.s||0,y.c);size();PG.classList.add('open');render();sfx('open');}
function close(){if(RUN)return;PG.classList.remove('open');P.classList.remove('open');sfx('close');}
const A=(x,y,w,h)=>'style="--x:'+x+';--y:'+y+';--w:'+w+';--h:'+h+'"';
// gauges: centre (140,390) and (885,390) · screen (290,238)-(735,478) · rollers top ≈ y 1048 · fan (118,740) r 100
const GA=[[140,390],[885,390]],GR=88;
function carHtml(c,lock){const g=GEO[c],w=1000,h=g.h,x=12,y=Math.round(1048-(g.w[0][1]+g.r)),U=v=>'calc(var(--u)*'+(+v).toFixed(1)+')';
  let s='<div class="dyCar'+(lock?' lk':'')+'" id="dyCar" style="left:'+U(x)+';top:'+U(y)+';width:'+U(w)+';height:'+U(h)+'"><img src="img/dyno/car'+c+'.webp" alt="">';
  g.w.forEach((p,i)=>{const r=g.r;s+='<i class="dyWh" data-w="'+i+'" style="left:'+U(p[0]-r)+';top:'+U(p[1]-r)+';width:'+U(2*r)+';height:'+U(2*r)+';background-image:url(img/dyno/w'+c+'_'+i+'.webp)"></i>';});
  if(lock)s+='<div class="dyLk">🔒</div>';
  return s+'</div>';}
function gauge(i,val,max,unit){const [cx,cy]=GA[i],a=-135+270*Math.max(0,Math.min(1,val/max));
  return '<svg class="dyA" '+A(cx-120,cy-120,240,240)+' viewBox="-120 -120 240 240" id="dyG'+i+'"><g stroke="#ffffff55" stroke-width="3">'+
    Array.from({length:11},(_,k)=>{const r=(-135+27*k-90)*Math.PI/180;return '<line x1="'+(Math.cos(r)*70).toFixed(1)+'" y1="'+(Math.sin(r)*70).toFixed(1)+'" x2="'+(Math.cos(r)*82).toFixed(1)+'" y2="'+(Math.sin(r)*82).toFixed(1)+'"/>';}).join('')+
    '</g><g id="dyN'+i+'" transform="rotate('+a.toFixed(1)+')"><polygon points="-5,0 5,0 0,-'+GR+'" fill="#ff5a3c"/><circle r="12" fill="#222" stroke="#ffd54a" stroke-width="3"/></g>'+
    '<text y="52" text-anchor="middle" font-family="Game,system-ui" font-weight="900" font-size="30" fill="#fff" stroke="#000" stroke-width="5" paint-order="stroke" id="dyV'+i+'">'+Math.round(val)+'</text>'+
    '<text y="76" text-anchor="middle" font-family="Game,system-ui" font-weight="900" font-size="17" fill="#9fb3c8">'+unit+'</text></svg>';}
// power curve: rpm 0..1 → share of peak (HP peaks late, torque in the middle)
const hpC=x=>Math.max(0,Math.sin(Math.min(1,x/.86)*Math.PI/2)*(x>.86?1-(x-.86)*1.2:1));
const nmC=x=>Math.max(0,.55+.45*Math.sin(Math.min(1,x/.55)*Math.PI/2)-(x>.55?(x-.55)*.7:0));
function curve(hp,nm,upto){const W=445,H=240,mx=Math.max(hp,nm)*1.12,pt=(f,v)=>{let s='';for(let k=0;k<=60*upto;k++){const x=k/60,yv=f(x)*v;s+=(k?'L':'M')+(14+x*(W-28)).toFixed(1)+','+(H-14-yv/mx*(H-34)).toFixed(1);}return s;};
  return '<g stroke="#29b6f622" stroke-width="1">'+[1,2,3,4,5].map(k=>'<line x1="14" x2="'+(W-14)+'" y1="'+(k*40)+'" y2="'+(k*40)+'"/>').join('')+[1,2,3,4,5,6,7].map(k=>'<line y1="10" y2="'+(H-14)+'" x1="'+(14+k*59)+'" x2="'+(14+k*59)+'"/>').join('')+'</g>'+
    (upto>0?'<path d="'+pt(nmC,nm)+'" fill="none" stroke="#29b6f6" stroke-width="4" stroke-linejoin="round"/><path d="'+pt(hpC,hp)+'" fill="none" stroke="#ff8f00" stroke-width="5" stroke-linejoin="round" style="filter:drop-shadow(0 0 4px #ff6d00)"/>':'')+
    '<text x="22" y="30" font-family="Game,system-ui" font-weight="900" font-size="20" fill="#ff8f00">HP</text><text x="62" y="30" font-family="Game,system-ui" font-weight="900" font-size="20" fill="#29b6f6">Nm</text>'+
    '<text x="'+(W-20)+'" y="30" text-anchor="end" font-family="Game,system-ui" font-weight="900" font-size="18" fill="#9fb3c8">'+(upto>0?Math.round(hp)+' HP · '+Math.round(nm)+' Nm':'RPM →')+'</text>';}
function render(){const y=S(),c=SH,lock=c>y.c,hp=carHP(c),nm=carNm(c,hp),gmax=CAR[c].hp[1]*1.1,t=tune(c),rl=runsLeft(),ex=y.x<EXTRA.length;
  const W=$('dyS');let h='<div class="dyA" id="dyHd" '+A(0,0,1024,205)+'><div class="r1"><button class="bk" data-d="back">↩</button><h1>DYNO GARAGE</h1><span class="sp"></span></div>'+
    '<div class="r2"><span><img src="img/ui2/i_coins.webp" alt="">'+T().fmt(T().G.money||0)+'</span><span>'+DPI+T().nf(y.dp)+'</span><span>'+OILI+T().nf(y.oil)+'</span></div></div>';
  h+='<img class="dyFan" id="dyFan" src="img/dyno/fan.webp" alt="" style="left:calc(var(--u)*18);top:calc(var(--u)*640);width:calc(var(--u)*200);height:calc(var(--u)*200)">';
  h+=gauge(0,lock?0:hp,gmax,'HP')+gauge(1,lock?0:nm,gmax*CAR[c].nm,'Nm');
  const L=LAST&&LAST.c===c?LAST:null;
  h+='<svg id="dyScr" class="dyA" '+A(290,238,445,240)+' viewBox="0 0 445 240">'+curve(L?L.hp:hp,L?L.nm:nm,L?1:0)+'</svg>';
  h+=carHtml(c,lock);
  h+='<div class="dyA dyFl" style="--gc:'+GC[c]+'">';
  h+='<div class="dyNm"><button data-d="prev"'+(c>0?'':' disabled')+'>❮</button><div class="t"><b>'+CAR[c].n+'</b><span><b>'+GN[c].toUpperCase()+'</b> · '+(lock?'🔒 LOCKED':hp+' HP · '+nm+' Nm')+'</span>'+(y.best[c]&&!lock?'<span> · BEST '+y.best[c]+' HP</span>':'')+'</div><button data-d="next"'+(c<5?'':' disabled')+'>❯</button></div>';
  if(lock){const ok=c===y.c+1&&tune(y.c)>=TMAX;
    h+='<div class="dyInf">'+(c===y.c+1?'Max out the tune of the car before ('+tune(y.c)+' / '+TMAX+') to unlock this car.':'Unlock the cars before this one first.')+'</div>';
    h+='<div class="dyBt"><button class="'+(ok?'gd':'off')+'" data-d="unlock">UNLOCK<small><img src="img/ui2/i_coins.webp" style="height:1em;vertical-align:-.15em"> '+T().fmt(unCash(c))+' · '+DPI+unDp(c)+'</small></button></div>';}
  else{h+='<div class="dyBar"><i style="width:'+(t/TMAX*100)+'%"></i><b>TUNE '+t+' / '+TMAX+'</b></div>';
    const pd=PART.some((q,i)=>canPart(c,i)),cd=chipTodo();
    h+='<div class="dyBt"><button data-d="parts">🔧<small>PARTS</small>'+(pd?'<i></i>':'')+'</button><button class="go'+(rl||ex?'':' off')+'" data-d="run">RUN<small>'+(rl?rl+' / '+FREE+' FREE':ex?'+1 · '+EXTRA[y.x]+' 💎':'0 / '+FREE+' · TOMORROW')+'</small>'+(rl?'<i></i>':'')+'</button><button data-d="chips">💾<small>CHIPS</small>'+(cd?'<i></i>':'')+'</button></div>';
    h+='<div class="dyInf">Chips from this car: up to <b style="color:'+GC[capG(c)]+'">'+GN[capG(c)].toUpperCase()+'</b> · more HP = better odds</div>'+oddsHtml(c);}
  h+='<div class="dyRec2"><div class="h">🏆 BEST RUNS</div>'+CAR.map((q,i)=>'<div style="color:'+(i<=y.c?GC[i]:'#5f6b78')+'"><span>'+q.n+'</span><b>'+(i>y.c?'🔒':y.best[i]?y.best[i]+' HP':'—')+'</b></div>').join('')+'</div>';
  h+='</div>';W.innerHTML=h;}
// ---------------------------------------------------------------- parts
function canPart(c,i){const y=S(),l=y.p[c][i];return c<=y.c&&l<PMAX&&(T().G.money||0)>=pCash(c,l)&&y.dp>=pDp(c,l);}
function partsPop(){const y=S(),c=SH,p=y.p[c];
  let h='<button class="dyX" data-q="x">x</button><div class="dyPT">🔧 '+CAR[c].n+' · PARTS</div><div class="dyPD">Every part goes from Lv 0 to '+PMAX+' – parts cost cash + 🔩 Dyno Parts (from dyno runs).</div>';
  PART.forEach((q,i)=>{const l=p[i],mx=l>=PMAX,ok=canPart(c,i),dh=mx?0:Math.round((CAR[c].hp[1]-CAR[c].hp[0])*q[2]/PMAX);
    h+='<div class="dyRw"><div class="ic">'+q[1]+'</div><div class="tx"><b>'+q[0]+'</b> · Lv '+l+'/'+PMAX+(mx?'':' <span style="color:#7cff7c">+'+dh+' HP</span>')+'<div class="pl">'+Array.from({length:PMAX},(_,k)=>'<i class="'+(k<l?'on':'')+'"></i>').join('')+'</div>'+(mx?'':'<small><img src="img/ui2/i_coins.webp" style="height:1em;vertical-align:-.15em"> '+T().fmt(pCash(c,l))+' · '+DPI+pDp(c,l)+'</small>')+'</div>'+
      '<button class="dyUp'+(mx||!ok?' off':'')+'" data-q="pu" data-i="'+i+'">'+(mx?'MAX':'UPGRADE<br>'+Math.min(100,PCH(c,l)+((y.pt||{})[c+'_'+i]||0))+'%')+'</button></div>';});
  if(tune(c)>=TMAX&&c<5&&y.c===c)h+='<button class="dyGo" data-q="tonext">✅ MAX TUNE · SEE THE NEXT CAR</button>';
  pop(h);}
function partUp(i){const y=S(),c=SH,l=y.p[c][i];if(l>=PMAX)return;const cs=pCash(c,l),dp=pDp(c,l);
  if((T().G.money||0)<cs){toast('Not enough cash',1800);sfx('deny');return;}if(y.dp<dp){toast('Not enough Dyno Parts – make dyno runs',2200);sfx('deny');return;}
  if(!y.pt)y.pt={};const k=c+'_'+i,ch=Math.min(100,PCH(c,l)+(y.pt[k]||0));T().G.money-=cs;y.dp-=dp;
  if(Math.random()*100<ch){y.p[c][i]++;y.pt[k]=0;T().save();sfx('upgrade');}else{y.pt[k]=(y.pt[k]||0)+PPITY;T().save();sfx('deny');toast('❌ Upgrade failed – next try +'+PPITY+'% chance',2200);}
  partsPop();render();}
function unlock(){const y=S(),c=SH;if(c!==y.c+1||tune(y.c)<TMAX){sfx('deny');return;}
  if((T().G.money||0)<unCash(c)){toast('Not enough cash',1800);sfx('deny');return;}if(y.dp<unDp(c)){toast('Not enough Dyno Parts',1800);sfx('deny');return;}
  T().G.money-=unCash(c);y.dp-=unDp(c);y.c=c;y.s=c;T().save();sfx('levelup');toast('🚗 New car unlocked!',2400);render();}
// ---------------------------------------------------------------- dyno run
function run(){if(RUN)return;const y=S(),c=SH;if(c>y.c)return;
  if(runsLeft()<=0){if(y.x>=EXTRA.length){toast('No runs left – 3 new free runs tomorrow',2400);sfx('deny');return;}
    const d=EXTRA[y.x];pop('<button class="dyX" data-q="x">x</button><div class="dyPT">EXTRA RUN</div><div class="dyPD">Free runs are used up for today. Buy one more run?</div><button class="dyGo" data-q="buyrun">'+d+' '+T().DMI+'</button>');return;}
  y.n++;start(c);}
function buyRun(){const y=S(),d=EXTRA[y.x];if((T().G.dm||0)<d){toast('Not enough diamonds',1800);sfx('deny');return;}T().G.dm-=d;y.x++;y.n=Math.max(0,y.n);closePop();start(SH,1);}
function start(c,paid){const y=S(),hp0=carHP(c),hp=Math.round(hp0*rnd(.965,1.025)),nm=Math.round(carNm(c,hp)*rnd(.98,1.02)),gmax=CAR[c].hp[1]*1.1,nmax=gmax*CAR[c].nm;
  T().save();render();PG.classList.add('run');sfx('cast');
  const wh=[...document.querySelectorAll('#dyCar .dyWh')],fan=$('dyFan'),scr=$('dyScr'),n0=$('dyN0'),n1=$('dyN1'),v0=$('dyV0'),v1=$('dyV1'),car=$('dyCar');
  const D=5200,t0=performance.now();let ang=0,fa=0,lt=t0,pf=0;
  RUN=1;
  const step=t=>{const k=Math.min(1,(t-t0)/D),dt=(t-lt)/1000;lt=t;const rpm=k<.08?k/.08*.15:.15+.85*Math.pow((k-.08)/.92,1.15);
    ang+=dt*(200+rpm*2600);fa+=dt*(120+rpm*900);wh.forEach(e=>e.style.transform='rotate('+ang+'deg)');fan.style.transform='rotate('+fa+'deg)';
    const hv=hpC(rpm)*hp,nv=nmC(rpm)*nm;
    n0.setAttribute('transform','rotate('+(-135+270*Math.min(1,hv/gmax)).toFixed(1)+')');n1.setAttribute('transform','rotate('+(-135+270*Math.min(1,nv/nmax)).toFixed(1)+')');
    v0.textContent=Math.round(hv);v1.textContent=Math.round(nv);scr.innerHTML=curve(hp,nm,rpm);
    if(t-pf>140&&car){pf=t;const p=document.createElement('i');p.className='dyPf';p.style.left='calc(var(--u)*'+(Math.random()*20)+')';p.style.top='calc(var(--u)*'+(GEO[c].h*.62+Math.random()*20)+')';car.appendChild(p);setTimeout(()=>p.remove(),1200);}
    if(k<1)requestAnimationFrame(step);else finish(c,hp,nm,paid);};
  requestAnimationFrame(step);}
function odds(c,q){const cap=capG(c),W=[];for(let g=Math.max(0,cap-2);g<=cap;g++){const k=cap-g;W.push([g,k===0?6*(1+2*q):k===1?30:64]);}if(c===0)W.splice(0,W.length,[0,80],[1,20*(1+q)]);const s=W.reduce((a,b)=>a+b[1],0);return W.map(([g,w])=>[g,w/s*100]);}
function oddsHtml(c){const [a,b]=CAR[c].hp,q=Math.max(0,Math.min(1,(carHP(c)-a)/(b-a)));return '<div class="dyInf">'+odds(c,q).map(([g,p])=>'<b style="color:'+GC[g]+'">'+GN[g]+'</b> <b style="color:'+GC[g]+'">'+(p<10?p.toFixed(1):Math.round(p))+'%</b>').join(' · ')+'</div>';}
function pickG(c,q){const cap=capG(c),W=[];for(let g=Math.max(0,cap-2);g<=cap;g++){const k=cap-g;W.push([g,k===0?6*(1+2*q):k===1?30:64]);}
  if(c===0)W.splice(0,W.length,[0,80],[1,20*(1+q)]);
  const s=W.reduce((a,b)=>a+b[1],0);let r=Math.random()*s;for(const [g,w] of W){if((r-=w)<0)return g;}return W[0][0];}
function finish(c,hp,nm,paid){const y=S(),[a,b]=CAR[c].hp,q=Math.max(0,Math.min(1,(hp-a)/(b-a)));
  const dp=Math.round((40+8*c)*rnd(.85,1.15)),oil=Math.round((c+1)*rnd(3,6)),chips=[newChip(pickG(c,q))];if(Math.random()<.08+.22*q)chips.push(newChip(pickG(c,q)));
  y.dp+=dp;y.oil+=oil;chips.forEach(ch=>y.ch.push(ch));const rec=hp>(y.best[c]||0);if(rec)y.best[c]=hp;
  LAST={c,hp,nm};T().save();RUN=null;PG.classList.remove('run');sfx('reward');
  let h='<div class="dyPT">DYNO RESULT</div><div class="dyRes"><div><b style="color:#ff8f00">'+hp+'</b><small>HP</small></div><div><b style="color:#29b6f6">'+nm+'</b><small>Nm</small></div></div>'+(rec?'<div class="dyRec">🏆 NEW RECORD!</div>':'');
  h+='<div class="dyRwd">'+chips.map((ch,i)=>'<div style="animation-delay:'+(i*.15)+'s;color:'+GC[ch.g]+'">'+chipIc(ch)+'<br>'+GN[ch.g]+'</div>').join('')+
    '<div style="animation-delay:.3s"><div class="bx">'+DPI+'</div>+'+dp+'</div><div style="animation-delay:.45s"><div class="bx">'+OILI+'</div>+'+oil+'</div></div>';
  h+='<button class="dyGo" data-q="x">CLAIM</button>';pop(h);render();}
// ---------------------------------------------------------------- chips UI
function chipIc(ch,own){const H=own&&T().HB[own];return '<span class="dyCI" style="--fr:url(img/fr'+ch.g+'.webp)"><img class="ci" src="img/dyno/chip'+ch.s+'.webp" alt=""><b>+'+ch.l+'</b>'+(H?'<img class="po" src="'+(window.CAMPAIGN&&CAMPAIGN.portraitURL?CAMPAIGN.portraitURL(H):'')+'" alt="" onerror="this.remove()">':'')+'</span>';}
function chipTodo(){return false;}
let BAG=-1,CHP=null,HID=null,HSL=0;
function bagPop(){const y=S();const L=y.ch.filter(ch=>BAG<0||ch.s===BAG).sort((a,b)=>b.g-a.g||b.l-a.l||a.s-b.s);
  let h='<button class="dyX" data-q="x">x</button><div class="dyPT">💾 TUNING CHIPS · '+y.ch.length+'</div><div class="dyPD">Equip chips on the HERO PAGE (button TUNE).<br>'+OILI+' <b>'+T().nf(y.oil)+'</b> Tuning Oil</div>';
  h+='<div class="dyTb">'+[[-1,'ALL']].concat(SL.map((s,i)=>[i,s[1]+' '+s[0]])).map(([k,t])=>'<button data-q="bag" data-i="'+k+'" class="'+(BAG===k?'on':'')+'">'+t+'</button>').join('')+'</div>';
  h+=L.length?'<div class="dyGr">'+L.map(ch=>'<div data-q="chip" data-i="'+ch.id+'">'+chipIc(ch,ownerOf(ch.id))+'</div>').join('')+'</div>':'<div class="dyPD">No chips yet – make dyno runs!</div>';
  pop(h);}
function chipPop(id){const ch=chipById(id);if(!ch){bagPop();return;}CHP=id;const y=S(),own=ownerOf(id),mx=ch.l>=CMAX,oc=oilCost(ch);
  let h='<button class="dyX" data-q="'+(HID?'hero':'bagb')+'">x</button><div class="dyPT" style="color:'+GC[ch.g]+'">'+SL[ch.s][0]+' CHIP</div><div class="dyPD" style="color:'+GC[ch.g]+';font-weight:900;margin-top:-6px">'+GN[ch.g].toUpperCase()+'</div>';
  h+='<div style="display:flex;gap:10px;align-items:center;margin-bottom:6px">'+chipIc(ch,own)+'<div class="dySt" style="flex:1"><div class="mn">'+SN[SL[ch.s][2]]+' <b>'+fmtS(0,mainV(ch))+'</b></div>Lv +'+ch.l+' / '+CMAX+(own?'<br><span style="color:#9aa4ae">🦸 <b>'+hName(own)+'</b></span>':'')+'</div></div>';
  h+='<div class="dySt">'+(ch.sub.length?ch.sub.map((s,i)=>'<div class="sb"><span>'+SN[s[0]]+' <b>'+fmtS(0,subV(ch,i))+'</b></span><button data-q="recal" data-i="'+i+'">🔄 '+RECAL[ch.g]+' 💎</button></div>').join(''):'<div class="sb"><span style="color:#9aa4ae">No sub stats yet – every +3 adds one (max 4).</span></div>')+'</div>';
  h+='<div class="dyPD" style="margin-top:6px">Every +3: a new sub stat (max 4) or one sub stat grows. 🔄 RECALIBRATE = a new stat type, same roll.</div>';
  h+='<div style="display:flex;gap:6px">'+(mx?'<button class="dyUp off" style="flex:1">MAX</button>':'<button class="dyUp'+(y.oil>=oc?'':' off')+'" style="flex:1" data-q="cup">UPGRADE · '+Math.min(100,CCH(ch.g,ch.l)+(ch.pt||0))+'%<br>'+OILI+' '+oc+'</button>')+
    (HID?(own===HID?'<button class="dyUp bl" style="flex:1" data-q="uneq">REMOVE</button>':'<button class="dyUp bl" style="flex:1" data-q="eq">EQUIP</button>'):'')+
    (own?'':'<button class="dyUp rd" data-q="salv">SALVAGE<br>'+OILI+' +'+salvV(ch)+'</button>')+'</div>';
  pop(h);}
const salvV=ch=>{let s=SALV[ch.g];for(let l=0;l<ch.l;l++)s+=Math.floor(Math.ceil((l+1)*OILK[ch.g])*.8);return s;};
function chipUp(){const ch=chipById(CHP),y=S();if(!ch||ch.l>=CMAX)return;const oc=oilCost(ch);if(y.oil<oc){toast('Not enough Tuning Oil – dyno runs and salvaged chips give oil',2400);sfx('deny');return;}
  y.oil-=oc;const pc=Math.min(100,CCH(ch.g,ch.l)+(ch.pt||0));
  if(Math.random()*100>=pc){ch.pt=(ch.pt||0)+CPITY;T().save();sfx('deny');toast('❌ Upgrade failed – next try +'+CPITY+'% chance',2200);chipPop(ch.id);return;}
  ch.pt=0;ch.l++;if(ch.l%3===0){if(ch.sub.length<4)addSub(ch);else{const s=ch.sub[Math.floor(Math.random()*ch.sub.length)];s[1]=Math.round((s[1]+rnd(.8,1.2))*100)/100;}}
  T().save();refresh();sfx(ch.l%3===0?'levelup':'upgrade');chipPop(ch.id);}
function recal(i){const ch=chipById(CHP),c=RECAL[ch.g];if((T().G.dm||0)<c){toast('Not enough diamonds',1800);sfx('deny');return;}
  const main=SL[ch.s][2],have=ch.sub.map(q=>q[0]),pool=SUBK.filter(k=>k!==main&&(k===ch.sub[i][0]||!have.includes(k))&&k!==ch.sub[i][0]);if(!pool.length)return;
  T().G.dm-=c;ch.sub[i][0]=pool[Math.floor(Math.random()*pool.length)];T().save();refresh();sfx('upgrade');chipPop(ch.id);}
function salvage(){const ch=chipById(CHP),y=S();if(!ch||ownerOf(ch.id))return;const v=salvV(ch);y.ch.splice(y.ch.indexOf(ch),1);y.oil+=v;T().save();sfx('coin');toast('🛢️ +'+v+' Tuning Oil',1600);CHP=null;if(HID)heroPop();else bagPop();}
// ---------------------------------------------------------------- hero page: TUNE button + 4 slots
function btn(id){if(!ON())return '';return '<button class="gTune" data-g="tune" aria-label="Tuning chips">💾<small>TUNE</small>'+(heroTodo(id)?'<i></i>':'')+'</button>';}
function heroTodo(id){const e=S().eq[id]||[];for(let s=0;s<4;s++)if(slotOpen(id,s)&&!e[s]&&S().ch.some(ch=>ch.s===s&&!ownerOf(ch.id)))return true;return false;}
function hero(id,sl){if(!ON())return;HID=id;HSL=sl!=null&&sl!==''?+sl:0;heroPop();sfx('open');}
function heroPop(){const id=HID,y=S(),e=y.eq[id]||[],b=bon(T().HB[id])||{};
  let h='<button class="dyX" data-q="hx">x</button><div class="dyPT">💾 TUNING</div><div class="dyPD" style="margin-top:-6px;font-weight:900;color:#fff">'+hName(id)+'</div>';
  h+='<div class="dyHS">'+SL.map((s,i)=>{const op=slotOpen(id,i),ch=e[i]&&chipById(e[i]);return '<div data-q="hs" data-i="'+i+'" class="'+(HSL===i?'on':'')+'">'+(ch?chipIc(ch):'<div class="em">'+(op?'+':'🔒')+'</div>')+'<br>'+s[1]+' '+s[0]+(op?'':'<br><span style="color:#ff8a80">Lv '+HSLOT[i]+'</span>')+'</div>';}).join('')+'</div>';
  const ks=Object.keys(b);h+='<div class="dyPD">'+(ks.length?ks.map(k=>'<span>'+SN[k]+'</span> <b style="color:#7cff7c">'+fmtS(k,b[k])+'</b>').join(' · '):'No chips yet. Get chips from DYNO runs (DYNO GARAGE in Battle).')+'</div>';
  const cur=e[HSL]&&chipById(e[HSL]);
  if(cur)h+='<button class="dyGo bl" data-q="chip" data-i="'+cur.id+'">'+SL[HSL][0]+': '+GN[cur.g].toUpperCase()+' +'+cur.l+' · OPEN</button>';
  const L=y.ch.filter(ch=>ch.s===HSL&&ch.id!==(cur&&cur.id)).sort((a,b)=>b.g-a.g||b.l-a.l);
  h+='<div class="dyPD" style="margin-top:8px"><b>'+SL[HSL][1]+' '+SL[HSL][0]+'</b> · <span>main stat</span> <b>'+SN[SL[HSL][2]]+'</b></div>';
  h+=L.length?'<div class="dyGr">'+L.map(ch=>'<div data-q="chip" data-i="'+ch.id+'">'+chipIc(ch,ownerOf(ch.id))+'</div>').join('')+'</div>':'<div class="dyPD">No chips of this type in the bag.</div>';
  pop(h);}
function equip(){const ch=chipById(CHP),id=HID,y=S();if(!ch||!id)return;if(!slotOpen(id,ch.s)){toast('🔒 This slot opens at hero Lv '+HSLOT[ch.s],2000);sfx('deny');return;}
  const o=ownerOf(ch.id);if(o)y.eq[o][ch.s]=0;if(!y.eq[id])y.eq[id]=[0,0,0,0];y.eq[id][ch.s]=ch.id;HSL=ch.s;T().save();refresh();sfx('upgrade');heroPop();}
function uneq(){const ch=chipById(CHP),id=HID,y=S();if(!ch||!id||!y.eq[id])return;y.eq[id][ch.s]=0;T().save();refresh();sfx('close');heroPop();}
// ---------------------------------------------------------------- v16-403 (Marius 28 nov): TUNING BAR on the hero page (under SKILLS)
// "bara separat pentru noul content tot pe pagina de erou" – Signature Tool (Mythic) + the 4 chip slots in one panel (code-drawn until Marius' picture)
function bar(h){if(!ON()||!h||h.crew)return '';const id=h.id,y=S(),e=y.eq[id]||[];
  // v16-404 (Marius: „bara nouă pentru următoarele content ca și ce am încercuit”) – same look as SKILLS (img/ui9/hs_panel.webp):
  // one round frame per system: SIGNATURE TOOL · TUNING · 2 free frames for the next content (COMING SOON)
  const X=[16.38,39.73,62.3,84.51],Yy=[46.9,46.4,46.4,45.2];
  const sl=(i,inner,name,sub,attr,lock,dot)=>'<div class="hsS'+(lock?' lk':'')+'" '+attr+' style="left:'+X[i]+'%;top:'+Yy[i]+'%">'+inner+(lock?'<u>🔒<small>'+lock+'</small></u>':'')+(dot?'<i class="tnD"></i>':'')+'</div><div class="hsN" style="left:'+X[i]+'%"><b>'+name+'</b><small>'+sub+'</small></div>';
  const TF=window.TFORGE&&TFORGE.on()&&h.gr===5;let x='<div class="hsP tnP2"><div class="hsT">UPGRADES</div>';
  if(TF){const L=TFORGE.lv(id),dot=TFORGE.slot(id).indexOf('<i></i>')>=0;x+=sl(0,'<img src="img/forge/tool_'+id+'.webp" alt="" style="object-fit:contain;padding:12%;box-sizing:border-box" onerror="this.remove()">','TOOL','Lv '+L,'data-g="tool"','',dot);}
  else x+=sl(0,'<i>🔧</i>','TOOL','&nbsp;','','MYTHIC',false);
  const n=e.filter(Boolean).length,op=[0,1,2,3].filter(k=>slotOpen(id,k)).length,dt=[0,1,2,3].some(k=>slotOpen(id,k)&&!e[k]&&y.ch.some(c=>c.s===k&&!ownerOf(c.id)));
  x+=sl(1,'<img src="img/dyno/chip0.webp" alt="" style="object-fit:contain;padding:14%;box-sizing:border-box">','TUNING',n+' / '+op+' CHIPS','data-g="tune" data-s="0"','',dt);
  x+=sl(2,'<i>❔</i>','SOON','&nbsp;','','SOON',false)+sl(3,'<i>❔</i>','SOON','&nbsp;','','SOON',false);
  return x+'</div>';}
const bcss=document.createElement('style');bcss.textContent=`
.tnP2 .hsS{overflow:visible}.tnP2 .hsT{letter-spacing:.5px;font-size:min(3.6vw,15px)}.tnP2 .hsN small{color:#ffd54a}.tnP2 .hsS>img{border-radius:50%}
.tnD{position:absolute;right:2%;top:2%;width:12px;height:12px;border-radius:50%;background:#ff2b2b;border:2px solid #fff;z-index:2}
.tnP{position:relative;margin:4px 2px 6px;padding:30px 6px 8px;border-radius:16px;background:radial-gradient(120% 90% at 50% 0%,#1c2d52,#0b1328 70%);border:3px solid #d9a227;box-shadow:inset 0 0 0 2px #5a3b07,inset 0 0 18px #000a,0 3px 8px #000a}
.tnT{position:absolute;left:12px;top:-2px;padding:3px 18px 4px;border-radius:0 0 12px 12px;background:linear-gradient(#ffe27a,#d99a17);border:2px solid #7a4b05;border-top:0;color:#3a1c00;font:900 min(4vw,16px) Game,system-ui;letter-spacing:2px;text-shadow:0 1px 0 #ffe9a8}
.tnR{display:flex;justify-content:space-around;gap:4px}
.tnS{flex:1;min-width:0;text-align:center;cursor:pointer;line-height:1.05}
.tnS b{display:block;margin-top:4px;color:#fff;font:900 min(2.7vw,11px) Game,system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px #000}
.tnS small{display:block;color:var(--gc);font:800 min(2.3vw,9.5px) Game,system-ui;text-transform:uppercase}
.tnB{position:relative;width:100%;max-width:64px;margin:0 auto;aspect-ratio:1;border-radius:12px;border:2px dashed #4a5a78;background:#0a1020 center/100% 100% no-repeat;display:flex;align-items:center;justify-content:center}
.tnB.on{border:0}.tnB.tool{border:3px solid var(--gc);border-radius:50%;box-shadow:0 0 10px var(--gc);background:#101a33}
.tnB>img{width:72%;height:72%;object-fit:contain}.tnB.tool>img{width:86%;height:86%}
.tnS:not(.lk) .tnB:not(.on):not(.tool)>img{opacity:.35;filter:grayscale(.5)}
.tnB>s{position:absolute;text-decoration:none;color:#ffd54a;font:900 min(6vw,26px) Game,system-ui;text-shadow:0 2px 3px #000}
.tnB>em{position:absolute;right:4px;bottom:2px;font:900 min(2.8vw,11px)/1 Game,system-ui;font-style:normal;color:#fff;text-shadow:0 1px 2px #000,0 0 3px #000}
.tnB>u{position:absolute;inset:0;text-decoration:none;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#000a;border-radius:10px;font-size:min(4.5vw,18px);line-height:1}
.tnB>u small{font:900 min(2.2vw,9px) Game,system-ui;color:#ffd54a;margin-top:2px}
.tnS.lk>.tnB>img{filter:grayscale(1) brightness(.45)}
.tnB>i{position:absolute;right:-3px;top:-3px;width:11px;height:11px;border-radius:50%;background:#ff2b2b;border:2px solid #fff}
`;document.head.appendChild(bcss);
// ---------------------------------------------------------------- popup plumbing
function pop(h){$('dyPB').innerHTML=h;P.classList.add('open');}
function closePop(){P.classList.remove('open');}
P.addEventListener('click',e=>{if(e.target===P){if(!RUN){closePop();if(HID&&!PG.classList.contains('open'))HID=null;}return;}const el=e.target.closest('[data-q]');if(!el)return;const a=el.dataset.q;sfx('tap');
  if(a==='x'){closePop();}
  else if(a==='hx'){closePop();HID=null;refresh();}
  else if(a==='pu')partUp(+el.dataset.i);
  else if(a==='tonext'){closePop();SH=Math.min(5,SH+1);render();}
  else if(a==='buyrun')buyRun();
  else if(a==='bag'){BAG=+el.dataset.i;bagPop();}
  else if(a==='bagb'){bagPop();}
  else if(a==='chip')chipPop(+el.dataset.i);
  else if(a==='cup')chipUp();
  else if(a==='recal')recal(+el.dataset.i);
  else if(a==='salv')salvage();
  else if(a==='hs'){HSL=+el.dataset.i;heroPop();}
  else if(a==='hero')heroPop();
  else if(a==='eq')equip();
  else if(a==='uneq')uneq();});
PG.addEventListener('click',e=>{if(RUN)return;const el=e.target.closest('[data-d]');if(!el)return;const a=el.dataset.d;
  if(a==='back')close();
  else if(a==='prev'){if(SH>0){SH--;S().s=Math.min(SH,S().c);LAST=null;sfx('tap');render();}}
  else if(a==='next'){if(SH<5){SH++;if(SH<=S().c)S().s=SH;LAST=null;sfx('tap');render();}}
  else if(a==='parts'){sfx('open');partsPop();}
  else if(a==='run')run();
  else if(a==='chips'){HID=null;BAG=-1;sfx('open');bagPop();}
  else if(a==='unlock')unlock();});
function todo(){if(!ON())return false;return runsLeft()>0;}
function sub(){if(!ON())return '';const y=S();return 'RUNS '+runsLeft()+' / '+FREE;}
// ---------------------------------------------------------------- v16-399 (Marius 28 nov): POWER POPUP
// "tot timpul când facem upgrade la ceva să ne apară pe ecran puterea veche plus puterea nouă… câteva secunde"
// After every save: if the open hero's power (hero page) or the battle team power changed → old ➜ new for ~2.6 s.
// Test account first (rule 28 nov: new things private until Marius says OK) → for everybody: PON = ()=>true
const PON=()=>true; // v16-400 (Marius 28 nov: „bagă live doar aia cu putere”) – for everybody
const pcss=document.createElement('style');pcss.textContent=`
#pwFx{position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 64px);z-index:95;pointer-events:none;transform:translate(-50%,-16px) scale(.9);opacity:0;transition:transform .25s cubic-bezier(.2,1.5,.4,1),opacity .2s;font-family:Game,system-ui,sans-serif;color:#fff;text-align:center;white-space:nowrap;
 background:linear-gradient(#2a2108f2,#120d03f2);border:2px solid #ffd54a;border-radius:16px;padding:6px 16px 7px;box-shadow:0 4px 16px #000c,0 0 14px #ffb30066}
#pwFx.on{opacity:1;transform:translate(-50%,0) scale(1)}
#pwFx.dn{border-color:#ff6b6b;box-shadow:0 4px 16px #000c,0 0 14px #ff3b3b55}
#pwFx small{display:block;font:900 10px Game,system-ui;color:#ffd54a;letter-spacing:.5px}
#pwFx small span{color:#fff}
#pwFx .r{font:900 17px Game,system-ui;display:flex;align-items:center;gap:7px;justify-content:center}
#pwFx .o{color:#9aa4ae;text-decoration:line-through;font-size:14px}
#pwFx .n{color:#7cff7c;text-shadow:0 0 8px #3cff3c88}
#pwFx.dn .n{color:#ff8a80;text-shadow:none}
#pwFx .p{font-size:12px;color:#7cff7c}#pwFx.dn .p{color:#ff8a80}
`;document.head.appendChild(pcss);
const PF=document.createElement('div');PF.id='pwFx';document.body.appendChild(PF);
let PB=null,PT=0,PH=0,PA=0;
const pfmt=(n,d)=>{const U=[[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']];for(const [v,u] of U)if(Math.abs(n)>=v)return (n/v).toFixed(d==null?2:d)+u;return String(Math.round(n));};
const pdec=(a,b)=>{for(let d=2;d<6;d++)if(pfmt(a,d)!==pfmt(b,d))return d;return 2;};
function psnap(){try{if(!window.CAMPAIGN||!CAMPAIGN.teamPower)return null;return {t:CAMPAIGN.teamPower(),h:CAMPAIGN.heroPow?CAMPAIGN.heroPow():null};}catch(e){return null;}}
function pshow(lbl,who,a,b){const up=b>a,pc=a>0?(b-a)/a*100:0,ps=(up?'+':'')+(Math.abs(pc)<.1?pc.toFixed(2):Math.abs(pc)<10?pc.toFixed(1):Math.round(pc))+'%';
  const D=pdec(a,b);PF.className=up?'':'dn';PF.innerHTML='<small>⚔️ '+lbl+(who?' · <span>'+who+'</span>':'')+'</small><div class="r"><span class="o">'+pfmt(a,D)+'</span><span>➜</span><span class="n" id="pwN">'+pfmt(a,D)+'</span><span class="p">'+ps+'</span></div>';
  requestAnimationFrame(()=>PF.classList.add('on'));cancelAnimationFrame(PA);const t0=performance.now(),el=$('pwN');
  const st=t=>{const k=Math.min(1,(t-t0)/600),e=1-Math.pow(1-k,3);el.textContent=pfmt(a+(b-a)*e,D);if(k<1)PA=requestAnimationFrame(st);};PA=requestAnimationFrame(st);
  clearTimeout(PH);PH=setTimeout(()=>PF.classList.remove('on'),2600);}
function pcheck(){const s=psnap();if(!s)return;const b=PB;PB=s;if(!b||(window.CAMPAIGN&&CAMPAIGN.inFight&&CAMPAIGN.inFight()))return;
  const ch=(x,y)=>x>0&&Math.abs(y-x)/x>1e-6;
  if(s.h&&b.h&&s.h.id===b.h.id&&ch(b.h.p,s.h.p)){pshow('HERO POWER',String(s.h.n).split(',')[0],b.h.p,s.h.p);return;}
  if(ch(b.t,s.t))pshow('TEAM POWER','',b.t,s.t);}
(function hook(){const T0=window.__TE;if(!T0||!T0.save||!window.CAMPAIGN){setTimeout(hook,1000);return;}if(!PON())return;
  const o=T0.save;T0.save=function(){const r=o.apply(this,arguments);clearTimeout(PT);PT=setTimeout(pcheck,180);return r;};
  PB=psnap();
  // the hero page: switching heroes is not an upgrade → refresh the snapshot on every tap there (no popup)
  document.addEventListener('click',()=>{setTimeout(()=>{const s=psnap();if(s&&PB&&s.h&&(!PB.h||s.h.id!==PB.h.id))PB.h=s.h;},0);},true);})();
window.TDYNO={on:ON,open,bon,btn,bar,hero,todo,sub,S,carHP,newChip};
})();
