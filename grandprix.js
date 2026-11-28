// Torque Empire v16-185 (22 nov 2026, Marius) · v16-188: animations on the LEGENDS prizes + Royal Entrance / Diamond Rain previews · v16-186: the page opens ABOVE the Events page (z-index; Marius: "LET'S RACE → nothing opens"): TORQUE GRAND PRIX – a ONE-TIME big event, 28 days (4 themed weeks).
// Everyone earns GP TOKENS from missions (daily / weekly / event) → GRAND PRIX ROAD (50 tiers, FREE lane: a MYTHIC of your choice at tier 50)
// + GP SHOP (tokens → tickets, keys, Essence, Builder Kits, weekly limits) + a FREE weekly Pit-Stop chest.
// LEGENDS = live TOP 100 of the server (Road points). PATRONS = SERVER GOAL: every player's points add up, each step = a gift for ALL.
// FIRST OVER THE LINE: the first 10 players of a server who finish the ULTIMATE mission get prizes by Mail (server: op gpfin).
// PREMIUM lanes (Silver 4.99 / Gold 9.99 / Platinum 19.99) are shown but locked until the products exist in Play Console (GPP()).
// Champion rewards (golden statue, trophy #1, Royal Entrance, Diamond Rain, Legend Car) are given when the event ends.
// Progress of the event missions = what you do DURING the event (new stages, new floors …) → fair for new and old players.
(function(){
const T=()=>window.__TE;
const DAY=864e5,WEEK=7*DAY,GP_DELAY=3*DAY,GP_LEN=28*DAY,GP_MAX=90*DAY;
// v16-193 (Marius 23 nov): the Grand Prix happens ONCE PER SERVER – it starts 3 days after the server opens (players first see how the game works)
// and lasts 28 days. Opening date: the server sends it at every sync (gp0, server/online.js SRV_OPEN); until then cloud.js SERVERS[].open.
function T0(){const sv=window.CLOUD?CLOUD.srv():1;let v=0;try{v=+localStorage.getItem('te_gp0_'+sv)||0;}catch(e){}
  if(!v&&window.CLOUD&&CLOUD.srvOpen){const o=CLOUD.srvOpen(sv);if(o)v=o+GP_DELAY;}return v||Infinity;}   // Infinity = server not opened yet → no event
// v16-228 (Marius 23 nov): NO TIME LIMIT – open until 10 players finished ALL event missions, then 7 more days (the server sends the end: gp1); safety cap 90 days
function T1(){const t0=T0();if(t0===Infinity)return Infinity;let v=0;try{v=+localStorage.getItem('te_gp1_'+SRV())||0;}catch(e){}return v&&v>t0?v:t0+GP_MAX;}
const OPENEND=()=>T1()-T0()>=GP_MAX-DAY;   // true while the 10 places are not all taken
const GPP=()=>true;   // v16-192 (23 nov): gp_silver / gp_gold / gp_plat are active in Play Console
// PREMIUM level = best pack owned (secure.js SKU gp1/gp2/gp3): 1 Silver · 2 Gold · 3 Platinum
const PKS=[['gp1','SILVER','€4.99'],['gp2','GOLD','€9.99'],['gp3','PLATINUM','€19.99']];
// v16-194 (Marius): the packs can be bought on EVERY server → stored per server: PK.gp1_s1, PK.gp2_s2 … (consumable in Play)
const SRV=()=>window.CLOUD?CLOUD.srv():1,PKK=k=>k+'_s'+SRV();
function pkMig(){const P=(T()&&T().PK);if(!P)return;let ch=0;['gp1','gp2','gp3'].forEach(k=>{if(P[k]===true){P[k+'_s1']=true;delete P[k];ch=1;}});if(ch)T().savePacks();}   // v16-192 bought as one-time → server 1
// v16-225 (Marius 23 nov): the packs STACK – Silver ×1 + Gold ×2 + Platinum ×3 → up to PREMIUM ×6 (before: only the best pack counted)
const OWN=k=>{pkMig();const p=(T()&&T().PK)||{};return !!p[PKK(k)];};
const PREM=()=>(OWN('gp1')?1:0)+(OWN('gp2')?2:0)+(OWN('gp3')?3:0),P_ASC=()=>OWN('gp2')||OWN('gp3'),P_MY=()=>OWN('gp3');
const PNAME=()=>PKS.filter(x=>OWN(x[0])).map(x=>x[1]).join(' + ');
function grant(k){const t=T();if(!t||!t.PK||!PKS.find(x=>x[0]===k))return;t.PK[PKK(k)]=true;patSend(k);t.savePacks();t.save();t.toast('👑 Grand Prix '+PKS.find(x=>x[0]===k)[1]+' unlocked on this server!',3500);try{render();dot();}catch(e){}}
const TOKB=()=>1+.1*PREM();   // +10/20/30% GP Tokens (Shop currency only – Road points and LEGENDS stay the same for everyone)
const TIER=1500,TIERS=100,MID=50;   // v16-228: 100 tiers (was 50) · tier 50 = the MYTHIC of your choice · tier 100 = the final Road prize
const now=()=>Date.now(),live=()=>now()>=T0()&&now()<T1(),wkN=()=>Math.max(0,Math.floor((now()-T0())/WEEK)),wk=()=>Math.min(3,wkN());   // wkN = real week (weekly reset, shop, chest) · wk = theme 0-3
const dKey=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
const TOKI='<img class="gpTk" src="img/gp/token.webp" alt="">';
// ---------------------------------------------------------------- missions
// k = counter: win (campaign wins + sweeps), sum (summons), dgk (Dungeon keys), lvl (level ups / ascensions), idle, sold (cars sold), login
const MD=[['d1','Sell 60 cars','sold',60,190],['d2','Win 20 campaign battles','win',20,250],['d3','Summon 30 times (any)','sum',30,310],['d4','Use 3 Dungeon keys','dgk',3,250],
 ['d5','Level up heroes 10 times','lvl',10,190],['d6','Collect Idle Rewards 2 times','idle',2,190],['d7','Open the game today','login',1,130]];
const MW=[['w1','Summon 150 times','sum',150,1900],['w2','Win 100 campaign battles','win',100,1500],['w3','Use 20 Dungeon keys','dgk',20,1500],
 ['w4','Level up heroes 60 times','lvl',60,1300],['w5','Sell 400 cars','sold',400,1300],['w6','Collect Idle Rewards 10 times','idle',10,1300]];
// event missions: progress since the start of the event (b = snapshot when the player joined)
// [id, text, counter, target, tokens, week it opens (0-3)] – v16-228: CHAMPION missions open week by week; the Top 10 = the first who finish ALL of them
const ME=[['ult','40 NEW campaign stages + 50 NEW Tower floors','ult',90,8000],['e2','Summon 600 times during the event','esum',600,3500],
 ['e3','Clear 80 NEW campaign stages','stg',80,3000],['e4','Climb 30 NEW floors in the Class Towers','ctw',30,3000],['e5','Upgrade buildings +5 levels in total','bld',5,3000],
 ['e6','Collect 8 NEW heroes','hero',8,2500],['e7','Use 60 Dungeon keys during the event','edgk',60,2500],
 ['c1','WEEK 2 · Clear campaign stage 350','abst',350,4000,1],['c2','WEEK 2 · Own a LEGENDARY hero at +3','leg3',1,4000,1],
 ['c3','WEEK 3 · Reach Torque Tower floor 120','atw',120,5000,2],['c4','WEEK 3 · Own 1 ASCENDED gear piece','asc',1,5000,2],
 ['c5','WEEK 4 · Own a LEGENDARY hero at +5','leg5',1,6000,3],['fin','🏆 CHAMPION · Own 2 MYTHIC heroes AWAKENED I','awk',2,10000,3]];
const mWk=m=>m[5]||0,mOpen=m=>wkN()>=mWk(m);
const MIC={sold:'🛠️',win:'⚔️',sum:'🎰',dgk:'🗝️',lvl:'⬆️',idle:'💤',login:'📅',ult:'🏁',esum:'🎰',stg:'⚔️',ctw:'🗼',bld:'🏭',hero:'🧩',edgk:'🗝️',abst:'⚔️',leg3:'⭐',leg5:'⭐',atw:'🗼',asc:'✦',leg10:'🌟',awk:'👑'};
// ---------------------------------------------------------------- road (free lane) – rewards cycle every 10 tiers; tier 50 = MYTHIC of your choice
const RD=[{dm:300},{tk:8},{essU:6},{key:5},{gt:8},{bkU:6},{ct:8},{dm:450},{tk:15},{essU:12}];
const MYTH=['m5_0','m5_2','m5_3','m5_4','m5_5','m5_1','m5_6','m5_7','m5_8','m5_9'];
const FINAL_BONUS={dm:1500,tk:15,key:10};
const FINAL2={dm:3000,tk:25,gt:15,key:15};   // v16-228 tier 100
const rdOf=i=>{const r=RD[(i-1)%10];return i>MID?mul(r,1.5):r;};   // tiers 51-99 = ×1.5
// shop: [id, name, icon, cost, weekly limit, reward]
const SH=[['tk','Hero Ticket','img/ticket.webp',600,20,{tk:1}],['gt','Gear Ticket','img/gticket.webp',500,20,{gt:1}],['ct','Crew Ticket','img/cticket.webp',400,20,{ct:1}],
 ['key','Dungeon Key','img/ui2/i_key.webp',500,10,{key:1}],['ess','Essence ×3','img/ui9/essence.webp',800,5,{essU:3}],['bk','Builder Kit ×3','img/ui9/gparts.webp',700,5,{bkU:3}]];
const CHEST={dm:300,tk:5,key:2};
// server goal (sum of everybody's Road points on your server) → a gift for ALL
const GOAL=[[150e3,{dm:200}],[400e3,{tk:10}],[800e3,{key:5}],[1.4e6,{dm:300}],[2.2e6,{dm:500,tk:10}]];
const WEEKS=[['summon','Days 1-7 · Hero, Crew & Gear summons'],['essence','Days 8-14 · Level up & Ascend your heroes'],['dungeon','Days 15-21 · Dungeons – your bonus keys stack'],['rail','Days 22-28 · Trains, Rail Wars & the final sprint']];
// ---------------------------------------------------------------- state
// v16-396 (Marius 28 nov, bug): building levels = LV1-10 (G.lv) + LV11-100 (G.lx) – before, a player with all buildings at LV10 could never finish 'Upgrade buildings +5 levels'
const bldSum=G=>[G.lv,G.lx].reduce((t,o)=>t+(o?Object.values(o).reduce((a,b)=>a+(+b||0),0):0),0);
function snap(){const G=T().G;return {best:(G.cp&&G.cp.best)||0,tw:(G.tw&&G.tw.b)||0,ct:G.ct?Object.values(G.ct).reduce((a,b)=>a+(+b||0),0):0,
  bld:bldSum(G),hero:G.h&&G.h.own?Object.keys(G.h.own).length:0,sold:G.sold||0};}
function S(){const G=T().G;if(!G.gpx)G.gpx={tok:0,pts:0,b:snap(),e:{c:{},got:[]},rf:[],gs:[],fin:0};const s=G.gpx;
  const dk=dKey();if(!s.d||s.d.k!==dk)s.d={k:dk,c:{login:1},got:[],s0:G.sold||0};
  const wi=wkN();if(!s.w||s.w.k!==wi)s.w={k:wi,c:{},got:[],s0:G.sold||0};
  if(!s.sh||s.sh.k!==wi)s.sh={k:wi,n:{}};if(!s.e)s.e={c:{},got:[]};return s;}
function q(k,n){if(!live()||!T()||!T().G)return;const s=S();n=+n||1;
  s.d.c[k]=(s.d.c[k]||0)+n;s.w.c[k]=(s.w.c[k]||0)+n;if(k==='sum'||k==='dgk')s.e.c[k]=(s.e.c[k]||0)+n;dot();}
function prog(list,m){const s=S(),G=T().G,k=m[2],B=s.b,c=snap();
  if(list==='d')return k==='sold'?(G.sold||0)-s.d.s0:(s.d.c[k]||0);
  if(list==='w')return k==='sold'?(G.sold||0)-s.w.s0:(s.w.c[k]||0);
  if(k==='ult')return Math.min(40,c.best-B.best)+Math.min(50,c.tw-B.tw);
  if(k==='esum')return s.e.c.sum||0;if(k==='edgk')return s.e.c.dgk||0;
  if(k==='abst')return c.best;if(k==='atw')return c.tw;if(k==='asc'){const g=G.gear;return g&&g.inv?g.inv.filter(x=>x&&x.r>=6).length:0;}
  // v16-396 (Marius 28 nov): Legendary +3 (week 2) / +5 (week 4, was +10 = pure luck) · CHAMPION = 2 Mythic heroes AWAKENED I (counted)
  if(k==='leg3'||k==='leg5'||k==='leg10'||k==='awk'){const H=T().HEROES||[],O=(G.h&&G.h.own)||{},mt=T().mTier;const n=H.filter(h=>{const o=O[h.id];if(!o||h.cat!=='m')return false;
    return k==='awk'?(h.gr===5&&mt&&mt(o.s)>=1):(h.gr===4&&(o.s||0)>=(k==='leg3'?3:k==='leg5'?5:10));}).length;return k==='awk'?n:Math.min(1,n);}
  if(k==='stg')return c.best-B.best;if(k==='ctw')return c.ct-B.ct;if(k==='bld')return c.bld-B.bld;if(k==='hero')return c.hero-B.hero;return 0;}
const LISTS={d:MD,w:MW,e:ME};
function mState(list,m){const s=S(),got=(list==='d'?s.d:list==='w'?s.w:s.e).got;if(got.includes(m[0]))return 'done';if(list==='e'&&!mOpen(m))return 'lock';return Math.max(0,prog(list,m))>=m[3]?'ready':'go';}
function claimM(list,id){if(!live())return;const s=S(),m=LISTS[list].find(x=>x[0]===id);if(!m||mState(list,m)!=='ready')return;
  (list==='d'?s.d:list==='w'?s.w:s.e).got.push(id);const tk=Math.round(m[4]*TOKB());s.tok+=tk;s.pts+=m[4];T().save();T().toast(TOKI+' +'+T().nf(tk)+' GP Tokens',1800);
  if(list==='e')finChk();sendSc();render();dot();}
function claimAll(list){const s=S();let n=0,t=0;for(const m of LISTS[list]){if(mState(list,m)==='ready'){(list==='d'?s.d:list==='w'?s.w:s.e).got.push(m[0]);const tk=Math.round(m[4]*TOKB());s.tok+=tk;s.pts+=m[4];t+=tk;n++;}}
  if(n){if(list==='e')finChk();T().save();T().toast(TOKI+' +'+T().nf(t)+' GP Tokens',1800);sendSc();render();dot();}}
// ---------------------------------------------------------------- rewards
function real(r){const t=T(),o={};for(const k in r){if(k==='essU')o.ess=Math.round(r[k]*t.ESS_U());else if(k==='bkU')o.pk={r:0,bk:Math.round(r[k]*300*(t.PART_U?t.PART_U():1))};else o[k]=r[k];}return o;}
function give(r){const t=T(),o=real(r);if(o.key){const K=window.DGK?DGK.K:[];for(let i=0;i<o.key;i++)if(K.length)DGK.add(K[i%K.length],1);delete o.key;}t.giveRw(o);t.save();}
function rwTxt(r){const t=T(),o=real(r),a=[];if(o.dm)a.push(t.DMI+' '+t.nf(o.dm));if(o.tk)a.push('<img class="gpTk" src="img/ticket.webp"> '+o.tk);if(o.gt)a.push('<img class="gpTk" src="img/gticket.webp"> '+o.gt);
  if(o.ct)a.push('<img class="gpTk" src="img/cticket.webp"> '+o.ct);if(o.key)a.push('<img class="gpTk" src="img/ui2/i_key.webp"> '+o.key);if(o.ess)a.push(t.ESI+' '+t.nf(o.ess));if(o.pk)a.push('<img class="gpTk" src="img/ui9/gparts.webp"> '+t.nf(o.pk.bk));return a.join(' · ');}
function rwIc(r){return r.dm?'img/ui/diamond.svg':r.tk?'img/ticket.webp':r.gt?'img/gticket.webp':r.ct?'img/cticket.webp':r.key?'img/ui2/i_key.webp':r.essU?'img/ui9/essence.webp':'img/ui9/gparts.webp';}
function rwN(r){const t=T(),o=real(r);return o.dm?t.nf(o.dm):o.tk||o.gt||o.ct||o.key||(o.ess?t.nf(o.ess):o.pk?t.nf(o.pk.bk):'');}
const tierOf=()=>Math.min(TIERS,Math.floor(S().pts/TIER));
function claimTier(i){const s=S();if(i>tierOf()||s.rf.includes(i))return;if(i===MID){pick();return;}if(i===TIERS){s.rf.push(i);give(FINAL2);T().toast('🏁 Tier 100 – END OF THE ROAD: '+rwTxt(FINAL2),3600);render();dot();return;}s.rf.push(i);give(rdOf(i));T().toast('🎖️ Tier '+i+': '+rwTxt(rdOf(i)),2200);render();dot();}
function mul(r,k){const o={};for(const x in r)o[x]=Math.round(r[x]*k);return o;}
// v16-192 PREMIUM lane: tier i gives the FREE reward × premium level; buying a bigger pack later gives the difference
// v16-230 (Marius 23 nov): DIAMOND PASS – a Road lane bought with DIAMONDS (no real money) → free players get more.
// Difference with the € packs: ×0.5 of the FREE lane and NO diamonds back (only tickets, keys, Essence, kits); no Ascended, no Mythic copy, no Patron, no Token bonus.
// v16-232 (Marius): 2 levels – DIAMOND PASS 💎2,500 (×0.5) and DIAMOND PASS+ 💎6,000 (×0.8, just under the €4.99 Silver pack which is ×1 WITH diamonds).
// Upgrade PASS → PASS+ costs only the difference (3,500); tiers already claimed give the difference too. s.dp = 0/1/2, s.dl[i] = level claimed.
const DPL=[[0,0,''],[2500,.5,'DIAMOND PASS'],[6000,.8,'DIAMOND PASS+']],DP_COST=DPL[1][0];
const noDm=r=>{const o={};for(const x in r)if(x!=='dm')o[x]=r[x];if(r.dm)o.tk=(o.tk||0)+r.dm/100;return o;};   // diamonds → Hero Tickets (100 💎 = 1 ticket) – the Diamond Pass never gives diamonds back
const dpBase=i=>i===MID?FINAL_BONUS:i===TIERS?FINAL2:rdOf(i),dpR=(i,k)=>{const o=mul(noDm(dpBase(i)),k==null?DPL[1][1]:k);for(const x in o)if(!o[x])o[x]=1;return o;};
// v16-234 (Marius 23 nov): tier 1 of the Diamond Pass gives ALL the diamonds paid back (PASS 2,500 / PASS+ 6,000; upgrade → the 3,500 difference); tiers 2-100 = the rest of the rewards.
const dpG=(i,had,L)=>i===1?{dm:DPL[L][0]-DPL[had][0]}:dpR(i,dpK(L,had));
const DPO=()=>{const s=S();return !!s.dp;},dlv=(s,i)=>{const v=(s.dl||{})[i];return v===true?1:(+v||0);},dpK=(a,b)=>DPL[a][1]-DPL[b][1];
function buyDp(l){if(!live())return;const t=T(),s=S();l=l===2?2:1;const cur=s.dp|0;if(cur>=l)return;const cost=DPL[l][0]-DPL[cur][0];
  if((t.G.dm||0)<cost){t.toast('Not enough diamonds ('+t.nf(cost)+' needed)',2000);return;}
  t.G.dm-=cost;s.dp=l;if(!s.dl)s.dl={};t.save();try{t.hud&&t.hud();}catch(e){}closePop();t.toast('💎 '+DPL[l][2]+' unlocked! Claim the blue lane on the Road.',3200);render();dot();}
function dpTot(l){const o={};for(let i=1;i<=TIERS;i++){const r=dpG(i,0,l);for(const x in r)o[x]=(o[x]||0)+r[x];}return o;}
function dpInfo(){const t=T(),s=S(),cur=s.dp|0,bt=l=>{if(cur>=l)return '<button class="gpBtn x" style="padding:8px 14px">OWNED ✓</button>';const c=DPL[l][0]-DPL[cur][0];return '<button class="gpBtn g" data-g="dpbuy" data-l="'+l+'" style="padding:8px 14px">'+t.DMI+' '+t.nf(c)+'</button>';};
  pop('<div class="gpH">💎 DIAMOND PASS</div><p>A blue reward lane on the Road, paid with <b>diamonds</b> (no real money). <b>Tier 1 gives ALL your diamonds back</b> 💎, then every tier gives a bonus (tickets, keys, Essence, kits).</p>'+
   [1,2].map(l=>'<div class="gpDp" style="margin:8px 0"><div class="t"><span class="h">'+(l===2?'💎💎 ':'💎 ')+DPL[l][2]+' · ×'+DPL[l][1]+'</span>'+rwTxt(dpTot(l))+'<br><small>total, tiers 1-'+TIERS+'</small></div>'+bt(l)+'</div>').join('')+
   '<p style="font-size:12px;opacity:.85">'+(cur===1?'You own the DIAMOND PASS → PASS+ costs only the difference and your claimed tiers give the rest.<br>':'')+'€ Packs: Silver ×1 · Gold ×2 · Platinum ×3, each on its own lane <b>with diamonds</b> + Ascended gear, Mythic copy, Patron badge, +GP Tokens.</p>');}
function claimDp(i){const s=S();if(!s.dp){dpInfo();return;}if(!s.dl)s.dl={};const had=dlv(s,i);if(i>tierOf()||had>=s.dp)return;if(i===MID&&!s.rf.includes(MID)){T().toast('🏆 Choose your Mythic (FREE lane) first',2200);return;}
  s.dl[i]=s.dp;if(i===1)s.dpRf=1;const r=dpG(i,had,s.dp);give(r);T().toast('💎 '+DPL[s.dp][2]+' tier '+i+': '+rwTxt(r),2200);render();dot();}
function dpAll(){const s=S();if(!s.dp)return;if(!s.dl)s.dl={};const tr=tierOf(),sum={};let n=0;
  for(let i=1;i<=Math.min(tr,TIERS);i++){const had=dlv(s,i);if(had>=s.dp||(i===MID&&!s.rf.includes(MID)))continue;s.dl[i]=s.dp;if(i===1)s.dpRf=1;const r=dpG(i,had,s.dp);for(const x in r)sum[x]=(sum[x]||0)+r[x];n++;}
  if(n){give(sum);T().toast('💎 '+n+' Diamond Pass tiers: '+rwTxt(sum),3200);render();dot();}}
const dpTodo=()=>{const s=S();if(!s.dp)return false;const tr=tierOf();for(let i=1;i<=Math.min(tr,TIERS);i++)if(dlv(s,i)<s.dp&&!(i===MID&&!s.rf.includes(MID)))return true;return false;};
function dpTile(i){const s=S(),L=s.dp|0,had=dlv(s,i),r=i===1?{dm:DPL[Math.max(1,L)][0]-(had<L?DPL[had][0]:0)}:dpR(i,DPL[Math.max(1,L)][1]),on=L>0,got=on&&had>=L,ok=on&&!got&&i<=tierOf()&&!(i===MID&&!s.rf.includes(MID));
  return '<div class="gpC dp'+(on?' on':'')+(got?' got':ok?' rd':'')+'" data-g="'+(on?(ok?'dp':'dpi'):'dpi')+'" data-i="'+i+'"><img src="'+rwIc(r)+'"><span class="n">×'+rwN(r)+'</span></div>';}
// v16-247 (Marius 23 nov): EVERY PASS HAS ITS OWN LANE on the Road – SILVER ×1 · GOLD ×2 · PLATINUM ×3 · DIAMOND (before: one combined PREMIUM lane ×1-×6)
// s.rq.gp1/gp2/gp3[tier] = 1 when that lane's tier is claimed. Old saves (s.rp[tier] = premium level claimed) are split per pack once.
const LN=[['gp1','SILVER',1],['gp2','GOLD',2],['gp3','PLATINUM',3]],LNM={gp1:1,gp2:2,gp3:3};
function rq(){const s=S();if(!s.rq){s.rq={gp1:{},gp2:{},gp3:{}};const o=s.rp||{};
  if(o[MID]>=2&&s.pa==null)s.pa=1;if(o[MID]>=3&&s.pm==null)s.pm=1;
  for(const i in o){let h=+o[i]||0;for(const k of ['gp3','gp2','gp1'])if(h>=LNM[k]&&OWN(k)){s.rq[k][i]=1;h-=LNM[k];}}}return s.rq;}
const lgot=(k,i)=>!!(rq()[k]||{})[i],laneR=(i,m)=>mul(i===TIERS?FINAL2:i===MID?FINAL_BONUS:rdOf(i),m);
const lOk=(k,i)=>OWN(k)&&!lgot(k,i)&&i<=tierOf()&&!(i===MID&&!S().rf.includes(MID));
function midX(k){const s=S();let x='';   // tier 50 extras: Ascended gear once (Gold or Platinum lane, first one claimed) · Mythic copy (Platinum lane)
  if(k!=='gp1'&&!s.pa&&window.CAMPAIGN&&CAMPAIGN.ascOne){s.pa=1;CAMPAIGN.ascOne();x+=' + ✦ ASCENDED gear';}
  if(k==='gp3'&&!s.pm&&s.my){s.pm=1;T().gain(s.my);try{T().heroRefresh();}catch(e){}x+=' + 1 copy of '+(T().HB[s.my]?T().HB[s.my].n:'your Mythic');}return x;}
function claimLane(k,i){const s=S(),L=LN.find(x=>x[0]===k);if(!L)return;if(!OWN(k)){T().toast('🔒 Buy the Grand Prix '+L[1]+' pack to open this lane',2200);return;}
  if(i===MID&&!s.rf.includes(MID)){T().toast('🏆 Choose your Mythic (FREE lane) first',2200);return;}if(!lOk(k,i))return;
  rq()[k][i]=1;const r=laneR(i,L[2]);give(r);const x=i===MID?midX(k):'';T().save();T().toast('👑 '+L[1]+' tier '+i+': '+rwTxt(r)+x,i===MID?4200:2200);render();dot();}
function premAll(){const tr=tierOf(),sum={};let n=0,x='';
  for(const L of LN){if(!OWN(L[0]))continue;for(let i=1;i<=Math.min(tr,TIERS);i++){if(!lOk(L[0],i))continue;rq()[L[0]][i]=1;const r=laneR(i,L[2]);for(const z in r)sum[z]=(sum[z]||0)+r[z];if(i===MID)x+=midX(L[0]);n++;}}
  if(n){give(sum);T().save();T().toast('👑 '+n+' pass rewards: '+rwTxt(sum)+x,3600);render();dot();}}
const laneTodo=()=>{const tr=tierOf();for(const L of LN){if(!OWN(L[0]))continue;for(let i=1;i<=Math.min(tr,TIERS);i++)if(lOk(L[0],i))return true;}return false;};
function lnTile(k,m,i){const on=OWN(k),got=on&&lgot(k,i),ok=lOk(k,i),r=laneR(i,m);
  return '<div class="gpC ln '+k+(on?' on':'')+(got?' got':ok?' rd':'')+'"'+(!on?' data-g="pack"':ok?' data-g="ln" data-k="'+k+'" data-i="'+i+'"':'')+'><span class="tg">'+(on?'':'🔒')+LN.find(x=>x[0]===k)[1]+'</span><img src="'+rwIc(r)+'"><span class="n">×'+rwN(r)+'</span></div>';}
// v16-196 PATRONS: every pack bought on the server → a gift for EVERYBODY (max 300 diamonds + 6 tickets a day per player)
const PGIFT={gp1:{dm:30},gp2:{dm:60},gp3:{dm:100,tk:2}},PCAP={dm:300,tk:6};
function patSend(k){try{if(window.ONLINE&&ONLINE.call)ONLINE.call('gppat',{k,pids:window.SEC&&SEC.pids?SEC.pids():undefined});}catch(e){}}
function pat(list){if(!Array.isArray(list)||!T()||!T().G)return;const s=S();s.pl=list.slice(0,30);if(!s.pg)s.pg=[];const dk=dKey();if(!s.pd||s.pd.k!==dk)s.pd={k:dk,dm:0,tk:0};
  const sum={},who=[];for(const x of list.slice().reverse()){if(s.pg.includes(x.id))continue;s.pg.push(x.id);if(!live()||x.t<now()-2*DAY)continue;const r=PGIFT[x.k];if(!r)continue;
    for(const k in r){const m=Math.min(r[k],PCAP[k]-s.pd[k]);if(m>0){s.pd[k]+=m;sum[k]=(sum[k]||0)+m;}}who.push(x.n);}
  s.pg=s.pg.slice(-200);if(Object.keys(sum).length){give(sum);patNote(list.find(x=>x.n===who[who.length-1])||{},who.length,sum);}else T().save();try{render();}catch(e){}}
// v16-198 (Marius chose design C): small golden pill at the top – patron badge · name · gift
let patT=0;function patNote(x,n,sum){let el=document.getElementById('gpNot');if(!el){el=document.createElement('div');el.id='gpNot';document.body.appendChild(el);el.onclick=()=>el.classList.remove('on');}
  const nm=String(x.n||'Mechanic').replace(/[<>&]/g,'').slice(0,16),tier={gp1:'SILVER',gp2:'GOLD',gp3:'PLATINUM'}[x.k]||'';
  const gi=(sum.dm?'<img src="img/ui/diamond.svg" alt="">'+T().nf(sum.dm):'')+(sum.tk?'<img class="t" src="img/ticket.webp" alt="">'+sum.tk:'');
  el.innerHTML='<img class="b" src="img/gp/patron.webp" alt=""><div class="x"><b>'+nm+'</b>'+(n>1?' <small>+'+(n-1)+'</small>':'')+'<br>new '+tier+' Patron</div><div class="g">🎁 '+gi+'</div>';
  el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(patT);patT=setTimeout(()=>el.classList.remove('on'),5000);}
let pkBusy=0;
async function buyPk(k){if(pkBusy||!window.SEC||!live())return;const P=T().PK;if(P[PKK(k)])return;pkBusy=1;
  try{const ok=await SEC.buy(k);if(!ok)return;P[PKK(k)]=true;T().savePacks();T().save();patSend(k);
    T().toast('👑 Grand Prix '+PKS.find(x=>x[0]===k)[1]+' unlocked! Open the ROAD to claim your PREMIUM rewards.',4200);render();dot();}
  finally{pkBusy=0;}}
// v16-219 (Marius): pack cards = his ChatGPT frames + EVERYTHING the Premium Road gives (all 50 tiers × pack level, 100 tiers since v16-228)
function roadSum(L){const o={},ad=r=>{for(const x in r)o[x]=(o[x]||0)+r[x];};for(let i=1;i<TIERS;i++)if(i!==MID)ad(rdOf(i));ad(FINAL_BONUS);ad(FINAL2);return mul(o,L);}
function pkCard(L){const t=T(),o=real(roadSum(L)),c=['s','g','p'][L-1],k='gp'+L,nm=PKS[L-1][1];
  const it=[['img/ui/diamond.svg',o.dm],['img/ticket.webp',o.tk],['img/gticket.webp',o.gt],['img/cticket.webp',o.ct],['img/ui2/i_key.webp',o.key],['img/ui9/essence.webp',o.ess],['img/ui9/gparts.webp',o.pk&&o.pk.bk]].filter(x=>x[1]);
  const pk=['<b>+'+(L*10)+'%</b> Tokens','Patron Badge'];if(L>=2)pk.push('<b>✦</b> Ascended');if(L>=3)pk.push('<b>+1</b> Mythic copy');
  const f=v=>v>=1e6?(v/1e6).toFixed(v>=1e7?0:1)+'M':v>=1e5?Math.round(v/1e3)+'K':v>=1e4?(v/1e3).toFixed(1).replace('.0','')+'K':t.nf(v);
  return '<div class="'+c+'"><div class="n">'+nm+'</div><div class="rl">ROAD +×'+L+'</div><div class="gpPg">'+it.map(x=>'<span><img src="'+x[0]+'" alt="">'+f(x[1])+'</span>').join('')+'</div><ul>'+pk.map(x=>'<li>'+x+'</li>').join('')+'</ul><div class="bt">'+pkBtn(k)+'</div></div>';}
// v16-226 (Marius 23 nov): the € packs must be easy to see – HIS pictures only (pack.webp banner + pk_s/pk_g/pk_p frames), on top of EVENT, ROAD and SHOP
function pkBlock(){let h='';h+='<div class="gpPack"><img src="img/gp/pack.webp" alt="GRAND PRIX PACKS"><div class="gpPks">'+pkCard(1)+pkCard(2)+pkCard(3)+'</div></div>';h+='<div class="gpNote">👑 Every pack opens <b>its own lane</b> on the Road: Silver ×1 · Gold ×2 · Platinum ×3. Buy several packs → several lanes, all tiers you already reached are ready to claim.</div>';return h;}
function pkBtn(k){pkMig();const P=(T()&&T().PK)||{},x=PKS.find(z=>z[0]===k);if(P[PKK(k)])return '<button class="gpBtn x">OWNED ✓</button>';if(now()>=T1())return '<button class="gpBtn x">ENDED</button>';if(now()<T0())return '<button class="gpBtn x">SOON</button>';return '<button class="gpBtn g" data-g="pk" data-k="'+k+'">'+x[2]+'</button>';}
function pick(){const t=T(),s=S();if(s.rf.includes(MID)||tierOf()<MID)return;pop('<div class="gpH">🏆 CHOOSE 1 MYTHIC</div><div class="gpPk">'+MYTH.map(id=>'<div class="gpPi" data-g="myth" data-id="'+id+'" style="background-image:url(img/hero/splash_'+id+'.webp)"><span>'+(t.HB[id]?t.HB[id].n:id)+'</span></div>').join('')+'</div><div class="gpSm">+ FREE bonus: '+rwTxt(FINAL_BONUS)+'</div>');}
function takeMyth(id){const t=T(),s=S();if(s.rf.includes(MID)||tierOf()<MID||!MYTH.includes(id))return;s.rf.push(MID);s.my=id;t.gain(id);give(FINAL_BONUS);try{t.heroRefresh();}catch(e){}closePop();
  t.toast('🏆 '+(t.HB[id]?t.HB[id].n:'Mythic')+' joined your team! + '+rwTxt(FINAL_BONUS),3600);render();dot();}
function buy(id){if(!live())return;const s=S(),x=SH.find(z=>z[0]===id);if(!x)return;const n=s.sh.n[id]||0;if(n>=x[4])return T().toast('Weekly limit reached',1600);if(s.tok<x[3])return T().toast('Not enough GP Tokens',1600);
  s.tok-=x[3];s.sh.n[id]=n+1;give(x[5]);T().toast('🛒 '+x[1]+' · '+rwTxt(x[5]),1800);render();}
function chest(){if(!live())return;const s=S();if(s.ch===wkN())return;s.ch=wkN();give(CHEST);T().toast('🎁 Pit-Stop Chest: '+rwTxt(CHEST),2400);render();dot();}
// ---------------------------------------------------------------- online (ranking, server goal, first finishers)
let RK=null,sendT=0,sentPts=-1;
async function sendSc(){if(!window.ONLINE||!ONLINE.call)return;const s=S();if(s.pts===sentPts)return;const r=await ONLINE.call('gpsc',{sc:s.pts});if(r&&r.ok){sentPts=s.pts;keepEnd(r.end);RK=Object.assign(RK||{},{rank:r.rank,tot:r.tot});}}
const keepEnd=e=>{if(e)try{localStorage.setItem('te_gp1_'+SRV(),String(e));}catch(x){}};
async function loadRank(){if(!window.ONLINE||!ONLINE.call)return null;await sendSc();const r=await ONLINE.call('gprank',{});if(r&&r.ok){RK=r;keepEnd(r.end);return r;}return null;}
function allDone(){const s=S();return ME.every(m=>s.e.got.includes(m[0]));}
function finChk(){if(allDone())finish();}
async function finish(){const s=S();if(s.fin>0||s.fin===-1||!allDone()||!window.ONLINE||!ONLINE.call)return;await sendSc();const r=await ONLINE.call('gpfin',{sc:s.pts});if(r&&r.ok){s.fin=r.pos||-1;T().save();if(r.pos>0&&r.pos<=10)T().toast('🏁 FIRST OVER THE LINE: you are #'+r.pos+'! Your prize is in the Mail.',4200);loadRank().then(render);render();}}
function claimGoal(i){const s=S(),g=GOAL[i];if(!g||s.gs.includes(i)||!RK||(RK.tot||0)<g[0])return;s.gs.push(i);give(g[1]);T().toast('🌍 Server Goal gift: '+rwTxt(g[1]),2400);render();dot();}
// ---------------------------------------------------------------- dot (red point on the Events button)
// v16-226 (Marius): red dots INSIDE the Grand Prix – where exactly there is something to take
const RD_=' <i class="rdd"></i>';
function todo(){const o={};if(!live()||!T()||!T().G)return o;const s=S(),tr=tierOf(),L=PREM();o.ch=s.ch!==wkN();for(const l of ['d','w','e'])o[l]=LISTS[l].some(m=>mState(l,m)==='ready');o.ms=o.d||o.w||o.e;
  for(let i=1;i<=TIERS&&i<=tr;i++){if(!s.rf.includes(i)){o.rd=true;break;}}if(laneTodo()||dpTodo())o.rd=true;o.ev=o.ch;o.sh=SH.some(x=>(s.sh.n[x[0]]||0)<x[4]&&s.tok>=x[3]);return o;}
function canClaim(){const o=todo();if(o.rd)return true;if(live()&&T()&&T().G&&dpTodo())return true;if(!live()||!T()||!T().G)return false;const s=S();if(s.ch!==wkN())return true;for(const l of ['d','w','e'])if(LISTS[l].some(m=>mState(l,m)==='ready'))return true;
  for(let i=1;i<=tierOf();i++)if(!s.rf.includes(i))return true;return false;}
function dot(){const d=document.getElementById('evDot');if(d&&canClaim())d.classList.add('on');}
// ---------------------------------------------------------------- UI
let el=null,tab='ev',sub='d',popEl=null;
const css=`#gpx{position:fixed;inset:0;z-index:59;display:none;background:#0b0f18;overflow:hidden;font-family:Game,system-ui,sans-serif;color:#e8ecf2}
#gpx.open{display:block}#gpx .gpS{position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;background:linear-gradient(180deg,#2a1240 0,#141024 30%,#0b0f18 100%);padding-bottom:60px}
#gpx .gpIn{max-width:520px;margin:0 auto}
.gpBan{position:relative;height:clamp(250px,72vw,340px);overflow:hidden}.gpBan .bg{position:absolute;inset:0;background:url(img/gp/bg.webp) center 30%/cover}
.gpBan::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,#0a061400 40%,#141024 100%)}
.gpBan .lg{position:absolute;left:50%;bottom:44px;width:78%;transform:translateX(-50%);z-index:2;filter:drop-shadow(0 6px 10px #000a)}
.gpX{position:absolute;left:10px;top:calc(10px + env(safe-area-inset-top));z-index:5;width:44px;height:44px;border-radius:12px;border:0;background:#0c0716cc;color:#ffd54a;font-size:22px;box-shadow:0 0 0 2px #ffcf5a}
.gpTm{position:absolute;left:50%;transform:translateX(-50%);bottom:10px;z-index:2;background:#0c0716dd;border:1.5px solid #ffcf5a;border-radius:999px;padding:5px 14px;font:900 13px system-ui;color:#fff;white-space:nowrap}.gpTm b{color:#ffd54a}
.gpCb{display:flex;justify-content:center;gap:5px;margin:10px 6px 4px;flex-wrap:wrap}.gpCu{display:flex;align-items:center;gap:4px;background:#0d0a18;border:1.5px solid #e0aa25;border-radius:999px;padding:3px 9px 3px 3px;font:900 13.5px system-ui;white-space:nowrap}
.gpTk{width:20px;height:20px;object-fit:contain;vertical-align:-5px}.gpCu .gpTk{width:22px;height:22px}
.gpTabs{display:grid;grid-template-columns:repeat(6,1fr);gap:3px;padding:6px 6px 8px;position:sticky;top:0;z-index:9;background:#120d20f0}
.gpTabs button{border:0;border-radius:11px;padding:6px 1px 5px;font:10px Game,system-ui;color:#cfc6e6;background:linear-gradient(#33284a,#18122a);box-shadow:0 0 0 1.5px #08060f,0 0 0 3px #5e4a20;display:flex;flex-direction:column;align-items:center;gap:2px}
.gpTabs button img{width:30px;height:30px;object-fit:contain}.gpTabs button.on{background:linear-gradient(#6b4a10,#2a1c05);color:#ffd54a;box-shadow:0 0 0 1.5px #08060f,0 0 0 3px #ffcf5a,0 0 12px #ffb30066}
.gpP{padding:0 12px}.gpSec{display:flex;align-items:center;gap:8px;margin:16px 2px 8px;font:15px Game,system-ui;letter-spacing:1.5px;color:#ffd54a}.gpSec::after{content:'';flex:1;height:1.5px;background:linear-gradient(90deg,rgba(255,179,0,.6),transparent)}
.gpNote{font:12px system-ui;color:#bfe0ff;background:#0b2450aa;border:1px solid #4aa3ff66;border-radius:12px;padding:8px 10px;line-height:1.45;margin:10px 0}.gpNote b{color:#fff}
.gpRow{position:relative;margin:0 0 6px;aspect-ratio:860/210;background:url(img/ui10/ev_row_ready.webp) center/100% 100%;display:flex;align-items:center;padding:0 4% 0 3%}
.gpRow.done{background-image:url(img/ui10/ev_row_done.webp)}.gpRow .ic{width:17%;aspect-ratio:1;display:grid;place-items:center;font-size:26px;flex:none;margin-left:.5%}.gpRow .ic img{width:78%;height:78%;object-fit:contain}
.gpRow .tx{flex:1;min-width:0;padding-left:3%}.gpRow .a{font:12px Game,system-ui;color:#fff;line-height:1.08;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.gpRow .b{display:flex;gap:5px;align-items:center;font:800 11px system-ui;color:#ffd54a;margin-top:2px;flex-wrap:nowrap;white-space:nowrap;overflow:hidden}.gpRow .gpBar{height:5px;margin-top:3px}.gpRow .tx{padding-top:1px;padding-bottom:1px}
.gpRow.ult{filter:drop-shadow(0 0 8px #ff6a00)}.gpRow.ult .a{color:#ffd54a}
.gpBar{height:7px;border-radius:9px;background:#0007;margin-top:4px;overflow:hidden;box-shadow:inset 0 0 0 1px #fff2}.gpBar i{display:block;height:100%;background:linear-gradient(90deg,#43e97b,#38f9d7);border-radius:9px}
.gpBtn{border:0;background:url(img/ui8/btn_gold.webp) center/100% 100%;font:13px Game,system-ui;color:#3a1c00;padding:8px 10px;min-width:70px}.gpBtn.g{background-image:url(img/ui8/btn_green.webp);color:#fff}.gpBtn.x{background-image:url(img/ui8/btn_grey.webp);color:#ddd}
.gpSub{display:flex;gap:5px;margin:4px 0 10px}.gpSub button{flex:1;border:0;aspect-ratio:860/199;max-height:46px;background:url(img/ui10/ev_tab_off.webp) center/100% 100%;font:13px Game,system-ui;color:#e6dcff}.gpSub button.on{background-image:url(img/ui10/ev_tab_on.webp);color:#3a1c00}
.gpWk{display:grid;grid-template-columns:1fr 1fr;gap:8px}.gpW{border-radius:14px;padding:8px 8px 10px;background:linear-gradient(160deg,#2c2148,#140f24);box-shadow:inset 0 0 0 1.5px #5e4a20;position:relative;text-align:center;font:11.5px system-ui;color:#c9c0e0;line-height:1.35}
.gpW img{width:100%;display:block;margin-bottom:4px}.gpW:not(.now) img{filter:saturate(.55) brightness(.75)}.gpW.now{box-shadow:inset 0 0 0 2px #ffcf5a,0 0 14px #ffb30055}
.gpW .lv{position:absolute;right:6px;top:6px;font:900 10px system-ui;background:#e2213b;color:#fff;border-radius:6px;padding:2px 6px}
.gpScore{aspect-ratio:860/166;background:url(img/ui10/ev_score.webp) center/100% 100%;display:flex;align-items:center;justify-content:center;flex-direction:column}.gpScore .a{font:12px Game,system-ui;color:#e6dcff;letter-spacing:2px}.gpScore .b{font:24px Game,system-ui;color:#fff}
.gpTr{display:flex;gap:8px;overflow-x:auto;padding:8px 2px 12px}.gpT{flex:none;width:84px;text-align:center}.gpT .lv{font:13px Game,system-ui;color:#ffd54a;margin-bottom:4px}
.gpC{height:74px;border-radius:12px;display:grid;place-items:center;position:relative;background:linear-gradient(#2a2140,#171126);box-shadow:inset 0 0 0 1.5px #4b3d6e;margin-bottom:6px}.gpC img{width:42px;height:42px;object-fit:contain}
.gpC .n{position:absolute;bottom:3px;right:6px;font:900 11px system-ui;color:#fff;text-shadow:0 1px 2px #000}.gpC.rd{box-shadow:inset 0 0 0 2px #43e97b,0 0 10px #43e97b88;animation:gpPl 1.2s infinite}.gpC.rd::before{content:'';position:absolute;right:3px;top:3px;width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff8a80,#ff1744 45%,#b0001e);box-shadow:0 0 0 2px #fff,0 0 8px #ff1744;z-index:2}@keyframes gpPl{50%{transform:scale(1.05)}}
.gpC.dp{background:linear-gradient(#0c3a5c,#0a1a2e);box-shadow:inset 0 0 0 1.5px #4fc3ff;opacity:.6}.gpC.dp.on{opacity:1}.gpC.dp::before{content:'💎';position:absolute;top:3px;left:5px;font-size:11px}.gpC.dp.rd{box-shadow:inset 0 0 0 2px #4fc3ff,0 0 10px #4fc3ff88}
.gpDp{display:flex;align-items:center;gap:10px;border-radius:14px;padding:10px;margin:10px 0;background:linear-gradient(120deg,#0b3c63,#101a33);box-shadow:inset 0 0 0 2px #4fc3ff}.gpDp .t{flex:1;font:12px system-ui;color:#cfeaff;line-height:1.4}.gpDp .t b{color:#fff}.gpDp .h{font:15px Game,system-ui;color:#8fdcff;display:block}
.gpBdg{width:30px;height:30px;object-fit:contain;flex:none}.gpFinB{width:100%;display:block;border-radius:12px;margin:12px 0 6px;box-shadow:0 0 0 2px #ffcf5a}
.gpC.got::after{content:'✓';position:absolute;inset:0;display:grid;place-items:center;background:#0009;border-radius:12px;font:900 28px system-ui;color:#43e97b}
#gpNot{position:fixed;left:50%;top:calc(8px + env(safe-area-inset-top));z-index:9999;width:min(94vw,380px);transform:translate(-50%,-140%);transition:transform .45s cubic-bezier(.2,1.3,.4,1);display:flex;align-items:center;gap:8px;padding:6px 12px 6px 6px;border-radius:999px;background:linear-gradient(90deg,#ffcf5a,#ff9800);color:#1a1006;box-shadow:0 4px 14px #000a,inset 0 0 0 1.5px #fff6;pointer-events:auto}#gpNot.on{transform:translate(-50%,0)}#gpNot img.b{width:36px;height:36px;object-fit:contain;flex:none}#gpNot .x{flex:1;min-width:0;font:900 12.5px system-ui;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#gpNot .x b{font:15px Game,system-ui}#gpNot .x small{font:900 11px system-ui}#gpNot .g{flex:none;font:900 13px system-ui;background:#1a1006;color:#ffd54a;border-radius:999px;padding:4px 10px;display:flex;gap:5px;align-items:center}#gpNot .g img{width:16px;height:16px;object-fit:contain}#gpNot .g img.t{width:20px;height:17px;margin-left:4px}
.gpPl{display:flex;flex-direction:column;gap:5px}.gpPr{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:12px;background:linear-gradient(90deg,#2a1a08,#171126);box-shadow:inset 0 0 0 1.5px #e0aa2588}.gpPr img{width:28px;height:28px;object-fit:contain}.gpPr .n{flex:1;min-width:0;font:13px Game,system-ui;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gpPr .k{font:900 11px system-ui;padding:2px 8px;border-radius:999px;color:#1a1006}.gpPr .kgp1{background:#d9e2ec}.gpPr .kgp2{background:#ffd54a}.gpPr .kgp3{background:#c9a8ff}
.gpC.ln{opacity:.55}.gpC.ln.on{opacity:1}.gpC.ln .tg{position:absolute;top:3px;left:5px;font:900 8.5px system-ui;letter-spacing:.3px;text-shadow:0 1px 2px #000}
.gpC.gp1{background:linear-gradient(#3e4650,#1b1f26);box-shadow:inset 0 0 0 1.5px #cfd8e3}.gpC.gp1 .tg{color:#e8eef5}.gpC.gp1.rd{box-shadow:inset 0 0 0 2px #fff,0 0 10px #cfd8e399}
.gpC.gp2{background:linear-gradient(#5a3c08,#24170a);box-shadow:inset 0 0 0 1.5px #ffcf5a}.gpC.gp2 .tg{color:#ffd54a}.gpC.gp2.rd{box-shadow:inset 0 0 0 2px #ffd54a,0 0 10px #ffb30088}
.gpC.gp3{background:linear-gradient(#3d2660,#1a1030);box-shadow:inset 0 0 0 1.5px #c9a8ff}.gpC.gp3 .tg{color:#e0ccff}.gpC.gp3.rd{box-shadow:inset 0 0 0 2px #d4b8ff,0 0 10px #b388ff99}
.gpLg{width:30px;position:sticky;left:-2px;z-index:3;background:#140f24;box-shadow:6px 0 8px -4px #000}.gpC.lg{writing-mode:vertical-rl;transform:rotate(180deg);font:900 10px system-ui;letter-spacing:1px;color:#fff;opacity:1;animation:none}.gpC.lg.fr{color:#43e97b}.gpC.lg.dp::before{content:none}.gpC.lg.dp{writing-mode:horizontal-tb;transform:none;font-size:15px}
.gpC.pr{background:linear-gradient(#5a3c08,#24170a);box-shadow:inset 0 0 0 1.5px #ffcf5a;opacity:.6}.gpC.pr.on{opacity:1}.gpC.pr.on::before{content:'👑'}.gpC.pr.rd{box-shadow:inset 0 0 0 2px #ffd54a,0 0 10px #ffb30088}.gpC.pr::before{content:'🔒';position:absolute;top:3px;left:5px;font-size:12px}
.gpFin{border-radius:16px;padding:12px;background:radial-gradient(circle at 50% 0,#ff5a2a55,transparent 60%),linear-gradient(#3a1408,#160a10);box-shadow:inset 0 0 0 2px #ffcf5a;text-align:center}
.gpFin .h,.gpH{font:20px Game,system-ui;color:#ffd54a;text-align:center}
.gpPk{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}.gpPi{border-radius:10px;overflow:hidden;position:relative;aspect-ratio:2/3;box-shadow:0 0 0 2px #ff3b3b;background:#000 center/cover}
.gpPi span{position:absolute;left:0;right:0;bottom:0;padding:12px 2px 4px;background:linear-gradient(transparent,#000d);font:11px Game,system-ui;color:#fff;text-align:center}
.gpSm{font:12px system-ui;color:#c8f5d0;margin-top:8px;text-align:center}
.gpRk{display:flex;align-items:center;gap:8px;padding:7px 9px;border-radius:12px;margin-bottom:5px;background:linear-gradient(90deg,#251c3c,#16111f);box-shadow:inset 0 0 0 1px #4b3d6e}.gpRk.me{box-shadow:inset 0 0 0 2px #43e97b}
.gpRk img{width:32px;height:35px;object-fit:contain}.gpRk .num{width:32px;text-align:center;font:17px Game,system-ui;color:#9b8fbf}.gpRk .nm{flex:1;min-width:0;font:14px Game,system-ui;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gpRk .nm.g{color:#ffd54a}.gpRk .pt{font:14px Game,system-ui;color:#ffd54a}
.gpRw{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.gpRw>div{border-radius:12px;padding:8px 4px;text-align:center;background:linear-gradient(#2a2140,#171126);box-shadow:inset 0 0 0 1.5px #4b3d6e;font:11px system-ui;color:#c9c0e0;line-height:1.3}
.gpRw b{display:block;font:12.5px Game,system-ui;color:#fff}.gpRw .e{font-size:28px;display:block;margin-bottom:3px}.gpRw img{height:46px;display:block;margin:0 auto 3px}
.gpGoal{border-radius:14px;padding:12px;background:linear-gradient(#1d2a48,#0f1628);box-shadow:inset 0 0 0 1.5px #4aa3ff88}.gpGoal .h{font:15px Game,system-ui;color:#9fd3ff;display:flex;justify-content:space-between}
.gpGr{display:flex;align-items:center;gap:8px;margin-top:7px;font:12px system-ui;color:#cfe0f5}.gpGr .t{flex:1}.gpGr .gpBtn{min-width:64px;padding:6px 8px;font-size:12px}
.gpShop{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.gpIt{border-radius:12px;padding:8px 4px 7px;text-align:center;background:linear-gradient(#2a2140,#171126);box-shadow:inset 0 0 0 1.5px #4b3d6e}
.gpIt img{width:40px;height:40px;object-fit:contain}.gpIt .n{font:12px Game,system-ui;color:#fff;margin:2px 0}.gpIt .l{font:10px system-ui;color:#a99bd0;margin-bottom:5px}.gpIt .gpBtn{min-width:0;width:94%;padding:6px 0;font-size:12px}.gpIt .gpBtn img{width:18px;height:18px;vertical-align:-4px}
.gpPack{margin-top:12px;border-radius:16px;padding:10px;background:linear-gradient(120deg,#5a2a00,#2a0f1a 60%,#1a0a24);box-shadow:inset 0 0 0 2px #ffcf5a}.gpPack>img{width:100%;display:block}
.gpPks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:8px;container-type:inline-size;--w:calc((100cqw - 12px)/3)}
.gpPks>div{position:relative;display:flex;flex-direction:column;color:#eee;font:10px system-ui;line-height:1.25;border-style:solid;border-color:transparent;min-height:calc(var(--w)*1.5)}
.gpPks .s{border-image:url(img/gp/pk_s.webp) 79 25 108 25 fill stretch;border-width:calc(var(--w)*225/1024) calc(var(--w)*72/1024) calc(var(--w)*306/1024)}
.gpPks .g{border-image:url(img/gp/pk_g.webp) 81 26 116 26 fill stretch;border-width:calc(var(--w)*230/1024) calc(var(--w)*75/1024) calc(var(--w)*331/1024)}
.gpPks .p{border-image:url(img/gp/pk_p.webp) 105 37 129 37 fill stretch;border-width:calc(var(--w)*300/1024) calc(var(--w)*105/1024) calc(var(--w)*366/1024)}
.gpPks .n{font:14px Game,system-ui;text-align:center;margin:2px 0 1px;text-shadow:0 1px 2px #000}.gpPks .s .n{color:#eef3f8}.gpPks .g .n{color:#ffd54a}.gpPks .p .n{color:#e3d2ff}
.gpPks .rl{font:800 10px system-ui;text-align:center;color:#ffe9a8;letter-spacing:.2px;margin-bottom:3px}
.gpPg{display:grid;grid-template-columns:1fr 1fr;gap:3px 2px;padding:0 2px 4px;border-bottom:1px solid #fff2}.gpPg span{display:flex;align-items:center;gap:2px;font:800 10px system-ui;color:#fff;white-space:nowrap;text-shadow:0 1px 1px #000}.gpPg img{width:15px;height:15px;object-fit:contain;flex:none}
.gpPks ul{list-style:none;margin:3px 0 0;padding:0 2px;flex:1}.gpPks li{padding:1px 0;font:600 10px system-ui;color:#e8e8e8}.gpPks li b{color:#ffd54a}
.gpPks .bt{position:absolute;left:0;right:0;bottom:0;height:0}
.gpPks .bt .gpBtn{position:absolute;top:calc(var(--w)*var(--st)/1024);height:calc(var(--w)*var(--sh)/1024);left:calc(var(--w)*var(--sx)/1024 - var(--bl));width:calc(var(--w)*var(--sw)/1024);min-width:0;padding:0;background:none!important;font:14px Game,system-ui;color:#ffe9a8;text-shadow:0 1px 2px #000}
.gpPks .bt .gpBtn.x{color:#bbb;font-size:12px}
.gpPks .s .bt{--st:10;--sh:205;--sx:170;--sw:685;--bl:calc(var(--w)*72/1024)}.gpPks .g .bt{--st:5;--sh:210;--sx:158;--sw:707;--bl:calc(var(--w)*75/1024)}.gpPks .p .bt{--st:5;--sh:170;--sx:160;--sw:705;--bl:calc(var(--w)*105/1024)}
.gpChamp{display:flex;gap:10px;align-items:center;border-radius:16px;padding:10px;background:linear-gradient(#2a1a08,#140d18);box-shadow:inset 0 0 0 2px #ffcf5a}.gpChamp .st{width:120px;flex:none;position:relative}
.gpChamp .fig{position:relative;z-index:1;height:140px;background:url(img/hero/splash_m5_0.webp) center 15%/cover;filter:sepia(1) saturate(4) hue-rotate(-8deg) contrast(1.25);-webkit-mask:radial-gradient(ellipse 60% 70% at 50% 55%,#000 60%,transparent 72%);mask:radial-gradient(ellipse 60% 70% at 50% 55%,#000 60%,transparent 72%)}
.gpChamp .ped{margin-top:-26px;aspect-ratio:400/177;background:url(img/gp/ped.webp) center/100% 100% no-repeat}.gpChamp .tx{font:12px system-ui;color:#ffe9c8;line-height:1.45}.gpChamp .tx b{color:#ffd54a}
#gpPop{position:fixed;inset:0;z-index:62;display:none;place-items:center;background:#000b}#gpPop.on{display:grid}#gpPop .box{width:90%;max-width:400px;max-height:86vh;overflow-y:auto;border-radius:18px;padding:16px;background:linear-gradient(#2c2148,#140f24);box-shadow:0 0 0 2px #ffcf5a}
#gpPop p{font:13px system-ui;color:#ddd;line-height:1.5}#gpPop p b{color:#ffd54a}
.gpChamp .st{overflow:visible}.gpChamp .fig{animation:gpGold 3s ease-in-out infinite}
@keyframes gpGold{50%{filter:sepia(1) saturate(4) hue-rotate(-8deg) contrast(1.25) brightness(1.25)}}
.gpChamp .sw{position:absolute;left:0;right:0;top:0;height:140px;z-index:2;pointer-events:none;overflow:hidden;-webkit-mask:radial-gradient(ellipse 60% 70% at 50% 55%,#000 60%,transparent 72%);mask:radial-gradient(ellipse 60% 70% at 50% 55%,#000 60%,transparent 72%)}
.gpChamp .sw::after{content:'';position:absolute;top:-20%;bottom:-20%;width:40%;left:-60%;background:linear-gradient(100deg,transparent,#fff8 50%,transparent);transform:skewX(-15deg);animation:gpSweep 3.2s ease-in-out infinite}
@keyframes gpSweep{0%,40%{left:-60%}80%,100%{left:130%}}
.gpChamp .rays{position:absolute;left:50%;top:70px;width:170px;height:170px;margin:-85px 0 0 -85px;z-index:0;background:repeating-conic-gradient(#ffd54a33 0 10deg,transparent 10deg 30deg);border-radius:50%;-webkit-mask:radial-gradient(circle,#000 30%,transparent 70%);mask:radial-gradient(circle,#000 30%,transparent 70%);animation:gpSpin 14s linear infinite}
@keyframes gpSpin{to{transform:rotate(360deg)}}
.gpRw>div{position:relative;overflow:hidden}.gpRw>div[data-g]{cursor:pointer}.gpRw u{color:#ffd54a;font:800 10.5px system-ui;display:block;margin-top:3px}
.gpAn-sw{animation:gpSwing 2s ease-in-out infinite;transform-origin:50% 90%}@keyframes gpSwing{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg) scale(1.06)}}
.gpAn-pu{animation:gpPuls 1.6s ease-in-out infinite}@keyframes gpPuls{50%{transform:scale(1.12);filter:drop-shadow(0 0 8px #ffd54a)}}
.gpAn-bo{animation:gpBob 1.4s ease-in-out infinite}@keyframes gpBob{50%{transform:translateY(-6px)}}
.gpAn-sh{animation:gpShk 3s ease-in-out infinite}@keyframes gpShk{0%,80%,100%{transform:rotate(0)}84%{transform:rotate(-12deg)}88%{transform:rotate(12deg)}92%{transform:rotate(-8deg)}96%{transform:rotate(6deg)}}
.gpAn-fl{animation:gpFlag 1s ease-in-out infinite;transform-origin:20% 90%}@keyframes gpFlag{50%{transform:rotate(-10deg) skewY(-6deg)}}
.gpCar{position:relative;height:34px;margin-bottom:3px}.gpCar i{position:absolute;top:2px;font-size:26px;font-style:normal;animation:gpDrive 3s linear infinite}
.gpCar i::after{content:'💨';position:absolute;left:100%;top:4px;font-size:14px;opacity:.7}
@keyframes gpDrive{0%{left:110%}100%{left:-40%}}
.gpGn{font:15px Game,system-ui;background:linear-gradient(90deg,#fff3a8,#ffbf1a,#fff8d0,#ffbf1a,#fff3a8);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:gpShine 2.2s linear infinite;display:block;margin:4px 0 6px}
@keyframes gpShine{to{background-position:-250% 0}}
.gpFr{position:relative;width:52px;height:57px;margin:0 auto 3px}.gpFr::before{content:'';position:absolute;left:13%;right:13%;top:21%;bottom:15%;border-radius:6px;background:url(img/hero/splash_m5_0.webp) center 18%/cover}
.gpFr img{position:absolute;inset:0;width:100%;height:100%!important;margin:0!important;animation:gpFrG 1.6s ease-in-out infinite}@keyframes gpFrG{50%{filter:drop-shadow(0 0 7px #ffd54a) brightness(1.25)}}
.gpDr{position:absolute;inset:0;pointer-events:none}.gpDr i{position:absolute;top:-20px;width:14px;height:14px;background:url(img/ui/diamond.svg) center/contain no-repeat;animation:gpFall 2.4s linear infinite}
@keyframes gpFall{to{transform:translateY(150px) rotate(200deg)}}
#gpEnt{position:fixed;left:50%;top:-160px;transform:translateX(-50%);width:94%;max-width:450px;aspect-ratio:860/183;background:url(img/ui10/ev_rank_btn.webp) center/100% 100%;z-index:66;display:flex;align-items:center;padding-left:24%;font:16px Game,system-ui;color:#fff;text-shadow:0 2px 0 #001a5a;transition:top .5s cubic-bezier(.2,1.5,.4,1);pointer-events:none}
#gpEnt.on{top:80px}#gpEnt small{display:block;font:800 11px system-ui;color:#ffe9a8;text-shadow:none}
.gpCf{position:fixed;top:70px;width:7px;height:12px;z-index:65;pointer-events:none;animation:gpCf linear forwards}@keyframes gpCf{to{transform:translateY(105vh) rotate(540deg)}}
.gpDia{position:fixed;top:-40px;width:34px;height:34px;background:url(img/ui/diamond.svg) center/contain no-repeat;z-index:65;filter:drop-shadow(0 0 6px #6cf);animation:gpCf linear forwards}
#gpRc{position:fixed;left:50%;top:42%;transform:translate(-50%,-50%);z-index:67;white-space:nowrap;font:22px Game,system-ui;color:#9fe8ff;text-shadow:0 2px 0 #003,0 0 14px #4af;pointer-events:none;display:none}
@media (prefers-reduced-motion:reduce){#gpx *{animation:none!important}}
body:has(#gpx.open) #toast{z-index:65}
.gpTabs button,.gpSub button,.gpRow .gpBtn{position:relative}.gpC .rdd{right:2px;top:2px}
.gpEntry{position:relative;display:block;margin:6px 0 10px;border-radius:14px;overflow:hidden;height:96px;background:url(img/gp/bg.webp) center 30%/cover;box-shadow:0 0 0 2px #ffcf5a,0 0 14px #ffb30066;cursor:pointer}
.gpEntry img{position:absolute;left:50%;top:50%;height:86%;transform:translate(-50%,-50%);filter:drop-shadow(0 3px 6px #000)}.gpEntry span{position:absolute;right:6px;bottom:5px;font:900 10px system-ui;background:#e2213b;color:#fff;border-radius:6px;padding:2px 6px}`;
function build(){if(el)return;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  el=document.createElement('div');el.id='gpx';el.innerHTML='<div class="gpS" id="gpS"></div>';document.body.appendChild(el);
  popEl=document.createElement('div');popEl.id='gpPop';popEl.innerHTML='<div class="box" id="gpPopB"></div>';document.body.appendChild(popEl);
  popEl.addEventListener('click',e=>{if(e.target===popEl)closePop();const t=e.target.closest('[data-g]');if(t)act(t);});
  el.addEventListener('click',e=>{const t=e.target.closest('[data-g]');if(t)act(t);});}
function act(t){const a=t.dataset.g;
  if(a==='x')close();else if(a==='tab'){tab=t.dataset.t;render();if(tab==='rk'||tab==='pt')loadRank().then(render);}
  else if(a==='sub'){sub=t.dataset.s;render();if(sub==='e')loadRank().then(render);}else if(a==='cm')claimM(t.dataset.l,t.dataset.id);else if(a==='ca')claimAll(t.dataset.l);
  else if(a==='go')goM(t.dataset.l,t.dataset.id);
  else if(a==='tier')claimTier(+t.dataset.i);else if(a==='pick')pick();else if(a==='myth')takeMyth(t.dataset.id);
  else if(a==='buy')buy(t.dataset.id);else if(a==='chest')chest();else if(a==='goal')claimGoal(+t.dataset.i);
  else if(a==='pack'){tab='sh';render();const e=document.querySelector('.gpPack');if(e)e.scrollIntoView({block:'center'});}else if(a==='pk')buyPk(t.dataset.k);else if(a==='ln')claimLane(t.dataset.k,+t.dataset.i);else if(a==='pall')premAll();else if(a==='ok')closePop();else if(a==='info')intro(1);else if(a==='entry')entryFx();else if(a==='rain')rainFx();else if(a==='dp')claimDp(+t.dataset.i);else if(a==='dpi')dpInfo();else if(a==='dpbuy')buyDp(+t.dataset.l||1);else if(a==='dpall')dpAll();}
// v16-214 (Marius 23 nov): GO → the page where the mission is done (index.html GOTO); when you close that page you are back here, on the same tab
function goM(l,id){const m=(LISTS[l]||[]).find(x=>x[0]===id);if(!m)return;const ev=document.getElementById('ev'),evOn=!!(ev&&ev.classList.contains('open')),tb=tab,sb=sub;
  if(!window.GOTO){T().toast('Play the game – it counts by itself',1800);return;}
  const w=GOTO(m[2],()=>{if(evOn&&window.EVT)EVT.open();open();tab=tb;sub=sb;render();});if(!w)return;
  close();if(ev)ev.classList.remove('open');}
function pop(h){build();document.getElementById('gpPopB').innerHTML=h;popEl.classList.add('on');}
function closePop(){if(popEl)popEl.classList.remove('on');}
const left=ms=>{const s=Math.max(0,ms/1000|0),d=s/86400|0,h=(s%86400)/3600|0,m=(s%3600)/60|0;return d?d+'d '+h+'h':h+'h '+String(m).padStart(2,'0')+'m';};
// v16-228 TOP 10 = the first 10 of the server who finish ALL event missions (first come, first served)
function top10(){const t=T(),s=S(),F=(RK&&RK.fins)||[],nd=ME.filter(m=>s.e.got.includes(m[0])).length;
  let h='<img class="gpFinB" src="img/gp/finishers.webp" alt="GRAND PRIX FINISHERS"><div class="gpNote">Finish <b>ALL '+ME.length+' event missions</b> (the last one: <b>2 MYTHIC heroes AWAKENED I</b>). The first <b>10 players</b> of your server win – checked by Torque Guard:<br>'+
   '<img class="gpTk" src="img/gp/top1.webp"> #1 <b class="gpN1">GP CHAMPION</b> – Golden Statue, Trophy #1, Royal Entrance, Diamond Rain, Legend Car + '+t.DMI+' 10,000 + 30 Hero, 20 Gear Tickets, 10 keys + <b>gold name</b><br>'+
   '<img class="gpTk" src="img/gp/top2.webp"> #2-3 <b class="gpN2">GP PODIUM</b> – '+t.DMI+' 6,000 / 5,000 + Tickets + <b>silver name</b><br><img class="gpTk" src="img/gp/top3.webp"> #4-10 <b class="gpN3">GP FINISHER</b> – '+t.DMI+' 2,500 + Tickets + <b>purple name</b><br>'+
   'When the 10th player finishes, the event closes <b>7 days later</b> – everybody can still claim the Road.<br><b>Your missions: '+nd+' / '+ME.length+'</b>'+
   (s.fin>0?'<br><b style="color:#43e97b">You finished #'+s.fin+'!</b>':s.fin===-1?'<br>You finished – the 10 places were already taken.':s.fin===-2?'<br>Your finish is being checked.':'')+'</div>';
  h+='<div class="gpPl">';for(let i=1;i<=10;i++){const x=F.find(z=>z.pos===i);h+='<div class="gpPr"><img class="gpBdg" src="img/gp/top'+(i===1?1:i<=3?2:3)+'.webp" alt=""><span class="n" style="flex:none;width:28px;color:#ffd54a">#'+i+'</span><span class="n'+(x?' gpN'+(i===1?1:i<=3?2:3):'')+'">'+(x?String(x.name||'Mechanic').replace(/[<>&]/g,''):'<span style="opacity:.5">— free place —</span>')+'</span></div>';}
  return h+'</div>';}
function rowH(l,m){const st=mState(l,m),p=Math.max(0,Math.min(m[3],prog(l,m))),ult=m[0]==='fin';
  if(st==='lock'){const d=T0()+mWk(m)*WEEK-now();return '<div class="gpRow done"><div class="ic">🔒</div><div class="tx"><div class="a">'+m[1]+'</div><div class="b">'+TOKI+' +'+T().nf(m[4])+' · opens in '+left(d)+'</div></div><button class="gpBtn x">LOCKED</button></div>';}
  const b=st==='done'?'<button class="gpBtn x">DONE</button>':st==='ready'?'<button class="gpBtn g" data-g="cm" data-l="'+l+'" data-id="'+m[0]+'">CLAIM'+RD_+'</button>':'<button class="gpBtn" data-g="go" data-l="'+l+'" data-id="'+m[0]+'">GO</button>';
  return '<div class="gpRow'+(st==='done'?' done':'')+(ult?' ult':'')+'"><div class="ic">'+MIC[m[2]]+'</div><div class="tx"><div class="a">'+m[1]+'</div>'+(st==='done'?'':'<div class="gpBar"><i style="width:'+(p/m[3]*100)+'%"></i></div>')+'<div class="b">'+TOKI+' +'+T().nf(m[4])+(st==='done'?'':' · '+p+'/'+m[3])+'</div></div>'+b+'</div>';}
// v16-234: players who claimed tier 1 BEFORE the refund rule get their diamonds back once (s.dpRf)
function dpFix(){const s=S();if(!s||!s.dp||s.dpRf)return;const had=dlv(s,1);if(!had)return;s.dpRf=1;const d=DPL[had][0];give({dm:d});T().toast('💎 Diamond Pass: '+T().nf(d)+' diamonds back!',3200);}
function render(){if(!el||!el.classList.contains('open'))return;try{dpFix();}catch(e){}const t=T(),s=S(),sc=document.getElementById('gpS'),y=sc.scrollTop,x0=document.getElementById('gpTr')?document.getElementById('gpTr').scrollLeft:null,tr=tierOf(),W=wk(),TD=todo();
  let h='<div class="gpIn"><div class="gpBan"><div class="bg"></div><img class="lg" src="img/gp/logo.webp" alt="TORQUE GRAND PRIX"><div class="gpTm">'+(now()<T0()?'⏳ Starts in <b>'+left(T0()-now())+'</b>':now()>=T1()?'🏁 <b>FINISHED</b>':OPENEND()?'♾️ <b>NO TIME LIMIT</b> · until 10 finish · <b style="color:#ff6b6b">ONE TIME ONLY</b>':'⏱ Closes in <b>'+left(T1()-now())+'</b> · <b style="color:#ff6b6b">TOP 10 FULL</b>')+'</div></div>'+
   '<button class="gpX" data-g="x">↩</button><div class="gpCb"><div class="gpCu">'+TOKI+' '+t.nf(s.tok)+'</div><div class="gpCu">🎖️ Tier '+tr+'/'+TIERS+'</div>'+(PREM()?'<div class="gpCu"><img class="gpTk" src="img/gp/patron.webp" alt="">'+'×'+PREM()+'</div>':'')+'<div class="gpCu" data-g="info">ℹ️</div></div>'+
   '<div class="gpTabs">'+[['ev','tab_ev','EVENT'],['ms','tab_ms','MISSIONS'],['rd','tab_road','ROAD'],['sh','tab_shop','SHOP'],['rk','tab_leg','LEGENDS'],['pt','tab_patron','PATRONS']].map(x=>'<button data-g="tab" data-t="'+x[0]+'" class="'+(tab===x[0]?'on':'')+'"><img src="img/gp/'+x[1]+'.webp" alt="">'+x[2]+(TD[x[0]]?RD_:'')+'</button>').join('')+'</div><div class="gpP">';
  if((tab==='ev'||tab==='rd')&&now()<T1()&&PREM()<6)h+=pkBlock();   // v16-232: in SHOP the token shop comes FIRST, the € packs under it
  if(tab==='ev'){h+='<div class="gpSec">THE 4 RACE WEEKS</div><div class="gpWk">'+WEEKS.map((w,i)=>'<div class="gpW'+(i===W&&wkN()<4&&live()?' now':'')+'"><img src="img/gp/wk_'+w[0]+'.webp" alt="">'+w[1]+(i===W&&wkN()<4&&live()?'<span class="lv">LIVE</span>':'')+'</div>').join('')+'</div>'+(wkN()>=4&&live()?'<div class="gpNote">🏁 <b>OVERTIME</b> – all missions are open. Daily &amp; weekly missions keep coming until the Top 10 is full.</div>':'')+'<div class="gpSec">YOUR RACE</div>';
    h+='<div class="gpRow'+(s.ch===W?' done':'')+'"><div class="ic"><img src="img/gp/tab_patron.webp"></div><div class="tx"><div class="a">Free weekly Pit-Stop Chest</div><div class="b">'+rwTxt(CHEST)+'</div></div>'+(s.ch===W?'<button class="gpBtn x">TAKEN</button>':'<button class="gpBtn g" data-g="chest">FREE'+RD_+'</button>')+'</div>';
    h+='<div class="gpRow"><div class="ic"><img src="img/gp/tab_road.webp"></div><div class="tx"><div class="a">Grand Prix Road – Tier '+tr+' / '+TIERS+'</div><div class="gpBar"><i style="width:'+(tr/TIERS*100)+'%"></i></div><div class="b">'+t.nf(s.pts)+' pts · 50 = MYTHIC · 100 = END</div></div><button class="gpBtn" data-g="tab" data-t="rd">OPEN'+(TD.rd?RD_:'')+'</button></div>';
    h+='<div class="gpRow"><div class="ic"><img src="img/gp/tab_ms.webp"></div><div class="tx"><div class="a">Missions – daily, weekly &amp; event</div><div class="b">earn '+TOKI+' GP Tokens</div></div><button class="gpBtn" data-g="tab" data-t="ms">GO'+(TD.ms?RD_:'')+'</button></div>';
    h+='<div class="gpRow"><div class="ic"><img src="img/gp/tab_shop.webp"></div><div class="tx"><div class="a">Grand Prix Shop</div><div class="b">Tickets · Keys · Essence · Kits</div></div><button class="gpBtn" data-g="tab" data-t="sh">SHOP</button></div>';}
  else if(tab==='ms'){h+='<div class="gpSub">'+[['d','DAILY'],['w','WEEKLY'],['e','EVENT']].map(x=>'<button data-g="sub" data-s="'+x[0]+'" class="'+(sub===x[0]?'on':'')+'">'+x[1]+(TD[x[0]]?RD_:'')+'</button>').join('')+'</div>';
    const L=LISTS[sub];if(L.some(m=>mState(sub,m)==='ready'))h+='<div style="text-align:center;margin-bottom:8px"><button class="gpBtn g" data-g="ca" data-l="'+sub+'" style="padding:9px 22px">CLAIM ALL</button></div>';
    h+=L.map(m=>rowH(sub,m)).join('');
    if(sub==='e')h+=top10();
    h+='<div class="gpNote">'+(sub==='d'?'Daily missions reset at midnight.':sub==='w'?'Weekly missions reset every 7 days of the event.':'The first 7 missions count what you do <b>during the event</b>. The <b>CHAMPION</b> missions open week by week (week 2, 3, 4). Finish <b>ALL</b> of them to race for the Top 10 – no time limit.')+'</div>';}
  else if(tab==='rd'){h+='<div class="gpScore"><div class="a">GRAND PRIX ROAD · '+t.nf(s.pts)+' POINTS</div><div class="b">TIER '+tr+' / '+TIERS+'</div></div><div class="gpNote">'+TIERS+' tiers · every '+t.nf(TIER)+' points = 1 tier · tiers 51-99 give <b>×1.5</b> · tier 100 = '+rwTxt(FINAL2)+'. Points = all GP Tokens you earned (spending in the Shop does not lower them).</div>'+
     '<div class="gpDp"><img src="img/ui/diamond.svg" style="width:38px;height:38px" alt=""><div class="t"><span class="h">💎 '+(s.dp?DPL[s.dp][2]+' ✓':'DIAMOND PASS')+'</span>'+(s.dp===2?'Blue lane ×0.8 on every tier.':s.dp===1?'Blue lane ×0.5 · <b data-g="dpi" style="color:#8fdcff;text-decoration:underline">upgrade to PASS+ ×0.8</b>':'Buy it with <b>diamonds</b>: PASS ×0.5 ('+t.nf(DPL[1][0])+') or PASS+ ×0.8 ('+t.nf(DPL[2][0])+').')+'</div>'+(s.dp&&dpTodo()?'<button class="gpBtn g" data-g="dpall">CLAIM ALL'+RD_+'</button>':s.dp===2?'<button class="gpBtn x">OWNED ✓</button>':'<button class="gpBtn g" data-g="dpi">'+(s.dp?'PASS+':'SEE')+'</button>')+'</div><div class="gpTr" id="gpTr"><div class="gpT gpLg"><div class="lv">&nbsp;</div><div class="gpC lg fr">FREE</div><div class="gpC lg gp1">SILVER</div><div class="gpC lg gp2">GOLD</div><div class="gpC lg gp3">PLAT</div><div class="gpC lg dp">💎</div></div>';
    for(let i=1;i<=TIERS;i++){if(i===MID){const got=s.rf.includes(MID),rd=!got&&tr>=MID;h+='<div class="gpT"><div class="lv">🏆 '+MID+'</div><div class="gpC'+(got?' got':rd?' rd':'')+'"'+(rd?' data-g="pick"':'')+' style="background:url(img/hero/splash_m5_0.webp) center 20%/cover;box-shadow:inset 0 0 0 2px #ff3b3b"><span class="n">MYTHIC</span></div>'+LN.map(L=>lnTile(L[0],L[2],i)).join('')+dpTile(i)+'</div>';continue;}
      const r=i===TIERS?FINAL2:rdOf(i),got=s.rf.includes(i),rd=!got&&i<=tr;h+='<div class="gpT"><div class="lv">'+(i%5?'':'⭐ ')+i+'</div><div class="gpC'+(got?' got':rd?' rd':'')+'"'+(rd?' data-g="tier" data-i="'+i+'"':'')+'><img src="'+rwIc(r)+'"><span class="n">×'+rwN(r)+'</span></div>'+LN.map(L=>lnTile(L[0],L[2],i)).join('')+dpTile(i)+'</div>';}
    h+='</div><div class="gpNote" style="margin-top:0">Every pass has <b>its own lane</b>: <b>FREE</b> for everyone · <b style="color:#dfe7ef">SILVER</b> ×1 · <b style="color:#ffd54a">GOLD</b> ×2 · <b style="color:#d4b8ff">PLATINUM</b> ×3 (€ packs – tap a 🔒 lane to see them) · <b style="color:#8fdcff">💎 DIAMOND PASS</b> (tier 1 = diamonds back).</div>';
    if(laneTodo())h+='<div style="text-align:center;margin:-4px 0 10px"><button class="gpBtn g" data-g="pall" style="padding:9px 20px">👑 CLAIM ALL PASSES</button></div>';
    const fg=s.rf.includes(MID);h+='<div class="gpFin"><div class="h">🏆 TIER '+MID+' – CHOOSE 1 MYTHIC</div><div class="gpSm" style="color:#ffd0b0">FREE lane – reachable by playing every day.<br><b style="color:#43e97b">+ FREE bonus: '+rwTxt(FINAL_BONUS)+'</b></div>';
    h+='<div class="gpPk">'+MYTH.map(id=>'<div class="gpPi" style="background-image:url(img/hero/splash_'+id+'.webp)"><span>'+(t.HB[id]?t.HB[id].n:id)+'</span></div>').join('')+'</div><div style="margin-top:10px">'+(fg?'<button class="gpBtn x" style="padding:9px 18px">TAKEN</button>':tr>=MID?'<button class="gpBtn g" data-g="pick" style="padding:9px 18px">CHOOSE</button>':'<button class="gpBtn x" style="padding:9px 18px">LOCKED · TIER '+MID+'</button>')+'</div>'+
      '<div class="gpSm" style="margin-top:10px;color:#ffe9a8">Pass lanes at tier '+MID+': <b style="color:#dfe7ef">SILVER</b> '+rwTxt(laneR(MID,1))+' · <b style="color:#ffd54a">GOLD</b> '+rwTxt(laneR(MID,2))+' + ✦ Ascended gear · <b style="color:#d4b8ff">PLATINUM</b> '+rwTxt(laneR(MID,3))+' + ✦ Ascended gear + 1 copy of your Mythic <small>(Ascended gear: 1 piece, from the first lane you claim)</small></div>'+'</div>';}
  else if(tab==='rk'){h+='<div class="gpScore"><div class="a">GRAND PRIX LEGENDS</div><div class="b">TOP 100</div></div>';
    if(!RK)h+='<div class="gpNote" style="text-align:center">'+(window.ONLINE&&ONLINE.call?'Loading the ranking…':'Go online to see the ranking.')+'</div>';
    else{h+=(RK.top||[]).slice(0,100).map((r,i)=>'<div class="gpRk'+(r.uid===RK.me?' me':'')+'">'+(i<4?'<img src="img/ui10/rk_'+(i+1)+'.webp">':'<div class="num">'+(i+1)+'</div>')+'<div class="nm'+(i<10?' g':'')+'">'+String(r.name||'Mechanic').replace(/[<>&]/g,'')+'</div><div class="pt">'+t.nf(r.sc)+'</div></div>').join('');
      if(RK.rank>100)h+='<div class="gpRk me"><div class="num">'+RK.rank+'</div><div class="nm">You</div><div class="pt">'+t.nf(s.pts)+'</div></div>';}
    const nm=String((window.ONLINE&&ONLINE.name&&ONLINE.name())||'Your Name').replace(/[<>&]/g,'');
    h+='<div class="gpSec">👑 CHAMPION · #1 OVER THE LINE</div><div class="gpChamp"><div class="st"><div class="rays"></div><div class="fig"></div><div class="sw"></div><div class="ped"></div></div><div class="tx"><b style="font:16px Game,system-ui;display:block">Golden Statue</b>Your favourite hero as a gold statue in the Arena &amp; Battle Hub – <b>forever</b>, seen by every player.</div></div>';
    h+='<div class="gpRw" style="margin-top:8px"><div><img class="gpAn-sw" src="img/gp/trophy.webp"><b>Trophy #1</b>“The only Grand Prix Champion”</div>'+
      '<div data-g="entry"><span class="e gpAn-pu">📣</span><b>Royal Entrance</b>the whole server sees you log in<u>▶ preview</u></div>'+
      '<div data-g="rain"><div class="gpDr"><i style="left:15%"></i><i style="left:45%;animation-delay:.8s"></i><i style="left:75%;animation-delay:1.6s"></i></div><span class="e gpAn-bo">💎</span><b>Diamond Rain</b>1× a day you rain gifts in chat<u>▶ preview</u></div></div>';
    h+='<div class="gpSec">PRESTIGE REWARDS</div><div class="gpRw"><div><div class="gpFr"><img src="img/gp/frame.webp" alt=""></div><b>Grand Prix Frame</b>animated · TOP 1-3</div><div><div class="gpCar"><i>🏎️</i></div><b>Legend Car</b>“1 of 1” · your name · TOP 1-3</div><div><span class="gpGn">'+nm+'</span><b>Name Colour</b>gold #1 · silver #2-3 · purple #4-10</div>'+
      '<div><img class="gpAn-bo" src="img/gp/top1.webp"><b>GP Titles</b>CHAMPION · PODIUM · FINISHER</div><div><img class="gpAn-bo" src="img/gp/patron.webp"><b>Patron Badge</b>'+(PREM()?'<span style="color:#43e97b">yours ✓</span>':'with any Grand Prix Pack')+'</div><div><span class="e gpAn-sh">🔒</span><b>Never again</b>one-time event</div></div><div class="gpNote">Prizes go to the <b>first 10 players</b> who finish ALL event missions. Nothing here gives battle power.</div>';}
  else if(tab==='pt'){const tot=RK?RK.tot||0:0,mx=GOAL[GOAL.length-1][0];h+='<div class="gpGoal"><div class="h"><span>🌍 SERVER GOAL</span><span style="color:#fff">'+t.nf(tot)+' / '+t.nf(mx)+'</span></div><div class="gpBar" style="height:12px;margin:10px 0"><i style="width:'+Math.min(100,tot/mx*100)+'%;background:linear-gradient(90deg,#4aa3ff,#a76bff)"></i></div>'+
      GOAL.map((g,i)=>{const got=s.gs.includes(i),ok=tot>=g[0];return '<div class="gpGr"><span>'+(got?'✅':ok?'🎁':'🔒')+'</span><span class="t">'+t.nf(g[0])+' pts · '+rwTxt(g[1])+'</span>'+(got?'<button class="gpBtn x">TAKEN</button>':ok?'<button class="gpBtn g" data-g="goal" data-i="'+i+'">CLAIM</button>':'')+'</div>';}).join('')+
      '<div class="gpNote" style="margin-bottom:0">Every player’s Road points on your server add up. Each step unlocks a gift for <b>ALL players</b>.</div></div>';
    h+='<div class="gpSec">👑 PATRONS</div><div class="gpNote">Every player who buys a <b>Grand Prix Pack</b> becomes a <b>Patron</b> – the whole server is told in the chat and <b>everybody</b> gets a gift: Silver '+rwTxt(PGIFT.gp1)+' · Gold '+rwTxt(PGIFT.gp2)+' · Platinum '+rwTxt(PGIFT.gp3)+'.<br><small style="opacity:.8">Max '+rwTxt(PCAP)+' per day from Patron gifts.</small></div>';
    const PL=s.pl||[];h+=PL.length?'<div class="gpPl">'+PL.map(x=>'<div class="gpPr"><img src="img/gp/patron.webp" alt=""><span class="n">'+String(x.n||'Mechanic').replace(/[<>&]/g,'')+'</span><span class="k k'+x.k+'">'+({gp1:'SILVER',gp2:'GOLD',gp3:'PLATINUM'}[x.k]||'')+'</span></div>').join('')+'</div>':'<div class="gpNote" style="text-align:center">No Patron yet on this server – be the first! '+(PREM()?'':'<button class="gpBtn g" data-g="pack" style="margin-top:6px">SEE THE PACKS</button>')+'</div>';}
  else if(tab==='sh'){h+='<div class="gpScore"><div class="a">GRAND PRIX SHOP</div><div class="b">'+TOKI+' '+t.nf(s.tok)+'</div></div><div class="gpShop">'+SH.map(x=>{const n=s.sh.n[x[0]]||0;return '<div class="gpIt"><img src="'+x[2]+'"><div class="n">'+x[1]+'</div><div class="l">'+n+' / '+x[4]+' this week</div><button class="gpBtn'+(n>=x[4]||s.tok<x[3]?' x':'')+'" data-g="buy" data-id="'+x[0]+'">'+TOKI+' '+x[3]+'</button></div>';}).join('')+'</div><div class="gpNote">Spend the '+TOKI+' GP Tokens you get from missions. Limits reset every week.</div>'+(now()<T1()&&PREM()<6?pkBlock():'');
    }
  h+='</div></div>';sc.innerHTML=h;sc.scrollTop=y;
  if(tab==='rd'){const r=document.getElementById('gpTr');if(r){if(!render.rdS||x0==null){render.rdS=1;r.scrollLeft=Math.max(0,(Math.min(tr,TIERS-1)-2)*92);}else r.scrollLeft=x0;}}} // v16-243 (Marius): after a claim the Road stays where it was (no jump back to tier 1)
let fxT=0;function entryFx(){if(fxT)return;fxT=1;const nm=String((window.ONLINE&&ONLINE.name&&ONLINE.name())||'Champion').replace(/[<>&]/g,'');let e=document.getElementById('gpEnt');if(!e){e=document.createElement('div');e.id='gpEnt';document.body.appendChild(e);}
  e.innerHTML='<div>👑 '+nm+' entered the server!<small>Grand Prix Champion</small></div>';requestAnimationFrame(()=>e.classList.add('on'));
  for(let i=0;i<30;i++){const c=document.createElement('div');c.className='gpCf';c.style.left=Math.random()*100+'vw';c.style.background=['#ffd54a','#ff6a00','#a76bff','#fff'][i%4];c.style.animationDuration=(1.5+Math.random()*1.5)+'s';c.style.animationDelay=Math.random()*.6+'s';document.body.appendChild(c);setTimeout(()=>c.remove(),3600);}
  setTimeout(()=>{e.classList.remove('on');fxT=0;},3200);}
function rainFx(){if(fxT)return;fxT=1;let n=0,r=document.getElementById('gpRc');if(!r){r=document.createElement('div');r.id='gpRc';document.body.appendChild(r);}r.style.display='block';r.textContent='💎 Diamond Rain!';
  for(let i=0;i<22;i++){const d=document.createElement('div');d.className='gpDia';d.style.left=(5+Math.random()*85)+'vw';d.style.animationDuration=(2.2+Math.random()*1.8)+'s';d.style.animationDelay=Math.random()*2.5+'s';
    d.style.pointerEvents='auto';d.onclick=()=>{n+=5;r.textContent='+'+n+' 💎 (preview)';d.remove();};document.body.appendChild(d);setTimeout(()=>d.remove(),7000);}
  setTimeout(()=>{r.style.display='none';fxT=0;},6500);}
function intro(force){const s=S();if(s.intro&&s.i228&&s.i230&&!force)return;s.intro=1;s.i228=1;s.i230=1;T().save();   // v16-228: shown again once (new rules = new mini-guide)
  pop('<img src="img/gp/logo.webp" style="width:80%;display:block;margin:0 auto">'+
   '<p>🏁 A <b>ONE-TIME</b> event with <b>NO TIME LIMIT</b>: it stays open until 10 players finish ALL the event missions (+7 days), then it never comes back.</p><p>📋 Do <b>missions</b> (daily, weekly, event) → earn '+TOKI+' <b>GP Tokens</b>.</p>'+
   '<p>🎖️ Your tokens move you up the <b>Grand Prix Road</b> (<b>100 tiers</b>). Tier 50 = <b>a MYTHIC hero of your choice</b> – free! Tier 100 = the big final prize.</p><p>🔓 New <b>CHAMPION missions</b> open every week (week 2, 3, 4). The last one: <b>2 MYTHIC heroes AWAKENED I</b>.</p><p>🏆 <b>TOP 10</b>: the first 10 who finish ALL event missions win titles, name colours and big prizes – #1 is the <b>GP CHAMPION</b>.</p><p>💎 <b>DIAMOND PASS</b>: buy it with diamonds → a bonus lane on every tier of the Road.</p><p>🛒 Spend tokens in the <b>GP Shop</b> · 🎁 a free <b>Pit-Stop Chest</b> every week.</p>'+
   '<p>👑 <b>LEGENDS</b>: the live ranking of your server · 🌍 <b>SERVER GOAL</b>: gifts for everybody.</p><div style="text-align:center"><button class="gpBtn g" data-g="ok" style="padding:10px 30px">LET’S RACE!</button></div>');}
function open(){if(!T()||!T().G)return;build();S();el.classList.add('open');tab='ev';render.rdS=0;render();intro();if(live())sendSc();
  clearInterval(open.t);open.t=setInterval(()=>{if(!el.classList.contains('open')){clearInterval(open.t);return;}if(tab!=='rd'&&tab!=='ms')render();},30000);}
function close(){if(el)el.classList.remove('open');closePop();try{const d=document.getElementById('evDot');if(d&&window.EVT)EVT.dot();}catch(e){}dot();}
function entry(){if(T0()===Infinity||now()>=T1()+7*DAY)return '';return '<div class="gpEntry" onclick="GPX.open()"><img src="img/gp/logo.webp" alt="TORQUE GRAND PRIX">'+(live()?'<span>'+(canClaim()?'🎁 ':'')+'LIVE · '+(OPENEND()?'NO LIMIT':left(T1()-now()))+'</span>':'')+(canClaim()?'<i class="rdd" style="right:8px;top:8px;width:16px;height:16px"></i>':'')+'</div>';}
function hook(){if(!window.EVT||EVT.__gp)return false;const o=EVT.q;EVT.q=function(k,n){try{o.apply(EVT,arguments);}catch(e){}try{q(k,n);}catch(e){}};
  const od=EVT.dot;EVT.dot=function(){try{od.apply(EVT,arguments);}catch(e){}dot();};EVT.__gp=1;return true;}
function boot(){if(!T()||!T().G||!window.EVT){setTimeout(boot,600);return;}build();hook();if(live())S();dot();
  setInterval(()=>{if(live()&&T()&&T().G){S();dot();}},20000);setInterval(()=>{if(live()&&T()&&T().G){sendSc();finChk();}},300000);}
window.GPX={open,close,entry,todo:()=>{try{return canClaim();}catch(e){return false;}},state:()=>S(),live,q,grant,pat,get T0(){return T0();},get T1(){return T1();}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
