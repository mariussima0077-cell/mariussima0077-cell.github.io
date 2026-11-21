// Torque Empire – v16-99 (20 nov 2026, Marius): TIME EVENTS that repeat.
// Two events always run at the same time, each lasts 3 days, then the next one starts:
//   track A: HERO SUMMON → GEAR SUMMON → CREW SUMMON → …   (count summons)
//   track B: ESSENCE SPEND → DIAMOND SPEND → LUCKY WHEEL → KEY ROULETTE → … (count what you spend / spins)
// v16-120 KEY ROULETTE (Marius, 21 nov): like the Lucky Wheel, but it wins ONLY Dungeon keys. Won keys = BONUS keys (G.dg.x): they stack, never expire, used after the daily keys.
// Every event: milestone rewards (diamonds + free summons …) + a live TOP 100 on the server (prizes by Mail when it ends).
// LUCKY WHEEL: wins ONLY diamonds; spins come ONLY from event quests (never sold, never paid with diamonds).
(function(){
const T=()=>window.__TE;
const E0=Date.UTC(2026,10,20),DUR=3*864e5;
const TRK={A:['hero','gear','crew'],B:['ess','dia','wheel','key','cash']};   // v16-129: CASH ROULETTE added at the end (same order as the server)
const TK='<img class="tki" src="img/ticket.webp" alt="">',CT='<img class="tki" src="img/cticket.webp" alt="">',GT='<img class="tki" src="img/gticket.webp" alt="">';
const DM=()=>T().DMI,ES=()=>T().ESI;
const EV={
 hero:{bn:'hero',n:'HERO SUMMON FESTIVAL',ic:'🎟️',col:'#ff7043',d:'Summon Mechanics (Recruit tickets or diamonds). Every summon counts.',u:'summons',tkk:'tk',
   m:[[10,{dm:50}],[30,{tk:2}],[60,{dm:100}],[100,{tk:3}],[150,{dm:200}],[250,{tk:5}],[400,{dm:400,tk:5}],[600,{dm:600,tk:8}]]},
 gear:{bn:'gear',n:'GEAR SUMMON FORGE',ic:'⚙️',col:'#42a5f5',d:'Summon gear (Gear tickets or diamonds). Every piece counts.',u:'summons',tkk:'gt',
   m:[[10,{dm:50}],[30,{gt:2}],[60,{dm:100}],[100,{gt:3}],[150,{dm:200}],[250,{gt:5}],[400,{dm:400,gt:5}],[600,{dm:600,gt:8}]]},
 crew:{bn:'crew',n:'CREW SUMMON RALLY',ic:'🎖️',col:'#ab47bc',d:'Summon Drivers + Guards (Crew tickets or diamonds). Every summon counts.',u:'summons',tkk:'ct',
   m:[[10,{dm:50}],[30,{ct:2}],[60,{dm:100}],[100,{ct:3}],[150,{dm:200}],[250,{ct:5}],[400,{dm:400,ct:5}],[600,{dm:600,ct:8}]]},
 ess:{bn:'ess',n:'ESSENCE RUSH',ic:'💜',col:'#b388ff',d:'Spend Essence on hero LEVEL UP and ASCENSION. Every Essence spent counts.',u:'essence',tkk:'tk',rel:1,
   m:[[5,{dm:50}],[15,{tk:2}],[30,{dm:100,ess:5}],[60,{tk:3}],[100,{dm:200,ess:10}],[160,{tk:5}],[250,{dm:400,ess:20}],[400,{dm:600,tk:8}]]},
 dia:{bn:'dia',n:'DIAMOND SPREE',ic:'💎',col:'#4dd0e1',d:'Spend diamonds anywhere (summons, name change …). Every diamond spent counts.',u:'diamonds',tkk:'tk',
   m:[[300,{tk:2}],[800,{dm:80}],[1500,{tk:3,gt:2}],[3000,{dm:250}],[5000,{tk:5,ct:3}],[8000,{dm:500}],[12000,{tk:8,gt:5}],[20000,{dm:1200,tk:10}]]},
 key:{bn:'key',n:'KEY ROULETTE',ic:'🔑',col:'#4fc3f7',d:'Spin the roulette – it gives ONLY Dungeon keys. Won keys are BONUS keys: they stack, never expire and wait for you (daily keys are used first). Free spins come only from the event quests below (no buying).',u:'spins',tkk:'dm',
   m:[[3,{tk:1}],[6,{dm:100}],[9,{tk:2,gt:1}],[12,{dm:250}],[15,{tk:3,ct:2}]]},
 // v16-129 (Marius 21 nov): CASH ROULETTE – NO quests: spins are bought with garage CASH, every spin costs more, max CW_MAX spins per event. Wins garage upgrade parts + Dungeon keys.
 cash:{bn:'cash',n:'CASH ROULETTE',ic:'💰',col:'#ffb300',d:'Spend your garage CASH on spins – win garage upgrade PARTS and Dungeon keys. No quests: every spin costs more than the one before, max 25 spins per event.',u:'spins',tkk:'tk',
   m:[[3,{tk:1}],[6,{dm:100}],[10,{tk:2,gt:1}],[15,{dm:250}],[20,{tk:3,ct:2}],[25,{dm:400,tk:5}]]},
 wheel:{bn:'wheel',n:'LUCKY WHEEL',ic:'🎡',col:'#ffd54a',d:'Spin the wheel – it gives ONLY diamonds. Free spins come from the event quests below (no buying).',u:'spins',tkk:'dm',
   m:[[3,{tk:1}],[6,{dm:100}],[9,{tk:2,gt:1}],[12,{dm:250}],[15,{tk:3,ct:2}]]}};
// ranking prizes (sent by Mail by the server when the event ends) – the same table is in server/online.js (EV_RW)
const MED=n=>n<=1?1:n<=3?2:n<=10?3:n<=50?4:5,MDL=(n,t)=>'<i class="rkm" style="background-image:url(img/ui10/rk_'+MED(n)+'.webp)">'+(t||n)+'</i>'; // v16-120 UI11 rank medals
const RANKRW=[[1,1,2000,20],[2,3,1500,15],[4,10,1000,10],[11,50,500,5],[51,100,250,3]];
const WHEEL=[[20,30],[30,25],[50,18],[80,12],[100,8],[150,4.5],[300,2],[1000,.5]];
// KEY ROULETTE slices: [dungeon ('any' = one random dungeon, 'all' = every dungeon), keys, chance %]
const KWH=[['vault',1,17],['mine',1,17],['forge',1,17],['lab',1,17],['any',2,14],['all',1,10],['any',3,6],['all',3,2]];
const KQ=[['login','Open the game today',1,1],['win','Win 5 battles in the campaign',5,1],['dgk','Use 3 Dungeon keys',3,1],['sum','Summon 10 times (heroes, crew or gear)',10,1],['idle','Collect Idle Rewards 2 times',2,1]];
const DGN={vault:'Vault',mine:'Scrap Mine',forge:'Forge',lab:'Lab'};
// CASH ROULETTE slices: [what, amount, chance %] – rp = random role parts, bk = Builder Kit (both × your campaign stage), key = 1 dungeon key (random), kall = 1 key in every dungeon, jack = parts jackpot
const CWH=[['rp',80,22],['bk',260,20],['rp',160,16],['key',1,14],['bk',520,12],['rp',320,9],['kall',1,5],['jack',600,2]],CW_MAX=25;
const cwBase=()=>{const t=T();return Math.max(5000,Math.round((t.idleRate?t.idleRate():20000)*.5/100)*100);};   // first spin = 30 min of your idle money
const cwPrice=w=>Math.round(((w.base||cwBase())*Math.pow(1.15,w.used||0))/100)*100;   // ×1.15 per spin → 25 spins ≈ 106 h of idle money
const isW=k=>k==='wheel'||k==='key'||k==='cash',QL=k=>k==='key'?KQ:k==='cash'?[]:WQ,SL=k=>k==='key'?KWH:k==='cash'?CWH:WHEEL;
const WQ=[['login','Open the game today',1,1],['win','Win 5 battles in the campaign',5,1],['sum','Summon 10 times (heroes, crew or gear)',10,1],['idle','Collect Idle Rewards 2 times',2,1],['lvl','Level up heroes 10 times',10,1]];
const cur=(tr,t)=>{const i=Math.floor(((t||Date.now())-E0)/DUR);return {i,k:TRK[tr][((i%TRK[tr].length)+TRK[tr].length)%TRK[tr].length],id:tr+i,end:E0+(i+1)*DUR,start:E0+i*DUR};};
const day=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
function S(){const G=T().G;if(!G.ev)G.ev={};const s=G.ev;
  for(const tr of ['A','B']){const c=cur(tr);if(!s[tr]||s[tr].id!==c.id){s[tr]={id:c.id,k:c.k,sc:0,cl:[],b:0,sent:0};}}
  const B=s.B;if(B.k==='ess'&&!B.b)B.b=T().ESS_U?T().ESS_U():300;  // essence goals grow with your stage (fixed for this event)
  if(isW(B.k)){if(!B.w)B.w={sp:0,used:0,won:0,d:'',q:{},got:{}};if(B.k==='cash'&&!B.w.base)B.w.base=cwBase();const w=B.w;if(w.d!==day()){w.d=day();w.q={login:1};w.got={};}}
  return s;}
const goal=(st,m)=>EV[st.k].rel?m*st.b:m;
function add(kind,n){if(!n||!T()||!T().G)return;const s=S();for(const tr of ['A','B']){const st=s[tr];if(st.k===kind){st.sc+=n;dirty();}}}
function q(kind,n){if(!T()||!T().G)return;const s=S(),B=s.B;if(!isW(B.k))return;B.w.q[kind]=(B.w.q[kind]||0)+n;dot();}
let dmL=null;
function tick(){const G=T()&&T().G;if(!G)return;const d=G.dm||0;if(dmL!=null&&d<dmL){const x=dmL-d;if(x<2e6)add('dia',x);}dmL=d;}
// ---------------- server: live ranking
let sendT=0,rk={};
function dirty(){dot();clearTimeout(sendT);sendT=setTimeout(send,15000);}
async function send(){if(!window.ONLINE||!ONLINE.call)return;const s=S();for(const tr of ['A','B']){const st=s[tr],sc=isW(st.k)?(st.w?st.w.used:0):st.sc;if(sc>0&&sc!==st.sent){const r=await ONLINE.call('evsc',{eid:st.id,k:st.k,sc});if(r&&r.ok){st.sent=sc;rk[st.id]={rank:r.rank,t:Date.now()};}}}}
async function rank(tr){const st=S()[tr];if(!window.ONLINE||!ONLINE.call)return null;await send();const r=await ONLINE.call('evrank',{eid:st.id,k:st.k});return r&&r.ok?r:null;}
// ---------------- rewards
// v16-125 (Marius: "nothing in the frames, only text"): rewards as big icons + gold number pictures, the event's own icon in the left box
const NH=(v,em)=>T().numH?T().numH(String(v),'gold',em||1.05):String(v);
const evTabIc=E=>['hero','gear','crew','ess','dia','key'].includes(E.bn)?evIc(E):E.ic; // v16-140: one icon per resource (no 🎟/💎 emoji)
const evIc=E=>E.u==='essence'?ES():E.u==='diamonds'?DM():E.bn==='key'?'<img class="tki" src="img/wb/key.webp" alt="">':E.tkk==='gt'?GT:E.tkk==='ct'?CT:TK;
function rwBig(r){const a=[];if(r.dm)a.push([DM(),r.dm]);if(r.tk)a.push([TK,r.tk]);if(r.gt)a.push([GT,r.gt]);if(r.ct)a.push([CT,r.ct]);if(r.ess)a.push([ES(),T().nf(r.ess)]);return a.map(([i,v])=>'<span class="evRw">'+i+NH((typeof v==='number'?'×':'')+v,1)+'</span>').join('');}
function rwHtml(r){const a=[];if(r.dm)a.push(DM()+' '+r.dm);if(r.tk)a.push(TK+' '+r.tk);if(r.gt)a.push(GT+' '+r.gt);if(r.ct)a.push(CT+' '+r.ct);if(r.ess)a.push(ES()+' '+T().nf(r.ess));return a.join(' ');}
function realRw(st,r){const o={...r};if(o.ess)o.ess=Math.round(o.ess*(st.b||300));return o;}
function claim(tr,i){const s=S(),st=s[tr],E=EV[st.k],m=E.m[i],sc=isW(st.k)?st.w.used:st.sc;if(!m||st.cl.includes(i)||sc<goal(st,m[0]))return;
  st.cl.push(i);const r=realRw(st,m[1]);T().giveRw(r);T().save();T().toast('🎁 '+E.n+': '+rwHtml(r),2800);render();}
function canClaim(){if(!T()||!T().G)return false;if(window.STREET&&STREET.canClaim())return true;const s=S();for(const tr of ['A','B']){const st=s[tr],E=EV[st.k],sc=isW(st.k)?st.w.used:st.sc;if(E.m.some((m,i)=>!st.cl.includes(i)&&sc>=goal(st,m[0])))return true;
  if(isW(st.k)){const w=st.w;if(w.sp>0)return true;if(QL(st.k).some(x=>!w.got[x[0]]&&(w.q[x[0]]||0)>=x[2]))return true;}}return false;}
function dot(){const d=document.getElementById('evDot');if(d)d.classList.toggle('on',canClaim());}
// ---------------- wheel
let spinning=0,ang=0;
function spin(){const st=S().B,w=st.w,CR=st.k==='cash';if(spinning)return;if(CR){const G=T().G,p=cwPrice(w);if(w.used>=CW_MAX)return T().toast('💰 Max '+CW_MAX+' spins in this event',2200);if(G.money<p)return T().toast('Not enough cash ('+T().fmt(p)+')',2200);G.money-=p;w.used++;dirty();}else{if(w.sp<1)return;w.sp--;w.used++;dirty();}const KR=st.k==='key',SW=SL(st.k),wi=SW[0].length-1;
  let kd=null,k=T().srun(KR?'kw':'w',()=>{let r=Math.random()*SW.reduce((a,x)=>a+x[wi],0),k=0;for(;k<SW.length;k++){r-=SW[k][wi];if(r<0)break;}k=Math.min(k,SW.length-1);kd=KR||CR?['vault','mine','forge','lab'][Math.floor(Math.random()*4)]:null;return k;}); // v16-101 anti-reroll (the random dungeon too)
  const n=SW.length,seg=360/n,target=360*6+(360-k*seg);const a0=ang%360,t0=performance.now(),D=3600;spinning=1;
  const cv=document.getElementById('evWh');
  const step=now=>{const p=Math.min(1,(now-t0)/D),e=1-Math.pow(1-p,3);ang=a0+(target-a0)*e;drawWheel(cv);if(p<1)requestAnimationFrame(step);else{spinning=0;if(CR){cwGive(SW[k],kd,w);return;}if(KR){const z=SW[k],L=z[0]==='all'?['vault','mine','forge','lab']:[z[0]==='any'?kd:z[0]];L.forEach(d=>{if(window.DGK)DGK.add(d,z[1]);});w.won+=z[1]*L.length;T().save();
      T().toast('🔑 KEY ROULETTE: '+(z[0]==='all'?'+'+z[1]+' key'+(z[1]>1?'s':'')+' in EVERY dungeon':'+'+z[1]+' '+DGN[L[0]]+' key'+(z[1]>1?'s':''))+'! (bonus keys, they stack)',3400);render();return;}
    const v=WHEEL[k][0];T().G.dm=(T().G.dm||0)+v;w.won+=v;dmL=T().G.dm;T().save();T().toast('🎡 LUCKY WHEEL: '+DM()+' +'+v+'!',3000);render();}};
  T().save();requestAnimationFrame(step);}
// v16-100: Marius' wheel picture – wheel.webp = frame (ring, bulbs, hub), wheel_disc.webp = the 8 slices (turns), wheel_pin.webp = pointer
// v16-129: Cash Roulette prize
function cwGive(z,kd,w){const t=T(),U=t.PART_U?t.PART_U():1,a=[];
  if(z[0]==='rp'){const o=t.pkRoles(z[1]*U);for(const q in o){t.pkAdd(q,o[q]);a.push(t.PKI(q)+' +'+t.nf(o[q]));}}
  else if(z[0]==='bk'){const n=Math.round(z[1]*U);t.pkAdd('bk',n);a.push(t.PKI('bk')+' +'+t.nf(n));}
  else if(z[0]==='key'){if(window.DGK)DGK.add(kd,1);a.push('🔑 +1 '+DGN[kd]+' key');}
  else if(z[0]==='kall'){['vault','mine','forge','lab'].forEach(d=>{if(window.DGK)DGK.add(d,1);});a.push('🔑 +1 key in EVERY dungeon');}
  else if(z[0]==='jack'){['tank','warrior','ranger','mage','support'].forEach(q=>t.pkAdd(q,Math.round(z[1]*U)));t.pkAdd('bk',Math.round(z[1]*3.25*U));a.push('JACKPOT! '+t.PKI('tank')+' +'+t.nf(Math.round(z[1]*U))+' of every part + '+t.PKI('bk')+' +'+t.nf(Math.round(z[1]*3.25*U)));}
  w.won++;t.save();t.toast('💰 CASH ROULETTE: '+a.join(' '),3600);render();}
const WI={};['wheel','wheel_disc','wheel_pin'].forEach(k=>{const i=new Image();i.onload=()=>{if(!spinning)drawWheel(document.getElementById('evWh'));};i.src='img/ui9/'+k+'.webp';WI[k]=i;});
const DMG=new Image();DMG.src='img/ui/diamond.svg';
const CWI={};['tank','warrior','ranger','mage','support','bk'].forEach(k=>{const i=new Image();i.src='img/ui12/pk_'+k+'.webp';CWI[k]=i;});
const KIM={};['vault','mine','forge','lab','pass'].forEach(k=>{const i=new Image();i.src='img/dg/k_'+k+'.webp';KIM[k]=i;});
// v16-120: Key Roulette pictures (optional – until Marius sends them the Lucky Wheel frame/disc are used)
const KWI={};['kwheel','kwheel_disc','kwheel_pin'].forEach(k=>{const i=new Image();i.onload=()=>{if(!spinning)drawWheel(document.getElementById('evWh'));};i.src='img/ui9/'+k+'.webp';KWI[k]=i;});
const WF={w:550,h:601,cx:275,cy:296,r:218.5,top:44};   // frame size + disc centre / radius in the frame picture
let wKind='wheel';
function drawWheel(cv){if(!cv)return;const KR=wKind==='key',SW=SL(wKind),okI=x=>x&&x.complete&&x.naturalWidth,FR=KR&&okI(KWI.kwheel)?KWI.kwheel:WI.wheel,DS=KR&&okI(KWI.kwheel_disc)?KWI.kwheel_disc:WI.wheel_disc;const d=Math.min(2,devicePixelRatio||1),cw=cv.clientWidth||260,ch=cw*(WF.h+WF.top)/WF.w;
  if(cv.width!==Math.round(cw*d)){cv.width=Math.round(cw*d);cv.height=Math.round(ch*d);}
  const g=cv.getContext('2d'),k=cv.width/WF.w,ok=x=>x&&x.complete&&x.naturalWidth;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);
  const n=SW.length,X=WF.cx*k,Y=(WF.cy+WF.top)*k,R=WF.r*k;
  g.save();g.translate(X,Y);g.rotate(ang*Math.PI/180);
  if(ok(DS)){const D=DS.naturalWidth*k;g.drawImage(DS,-D/2,-D/2,D,D);if(KR&&DS===WI.wheel_disc){g.save();g.globalCompositeOperation='hue';g.fillStyle='#1e88e5';g.beginPath();g.arc(0,0,D/2,0,7);g.fill();g.restore();}}
  else{const cols=['#ff7043','#ffca28','#66bb6a','#29b6f6','#ab47bc','#ef5350','#26c6da','#ffd54a'];for(let i=0;i<n;i++){const a=-Math.PI/2-Math.PI/n+i*2*Math.PI/n;g.beginPath();g.moveTo(0,0);g.arc(0,0,R,a,a+2*Math.PI/n);g.closePath();g.fillStyle=cols[i];g.fill();}}
  for(let i=0;i<n;i++){g.save();g.rotate(i*2*Math.PI/n);g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
    if(wKind==='cash'){const z=SW[i],lb=z[0]==='kall'?'ALL':z[0]==='jack'?'JACKPOT':'×'+(z[0]==='key'?1:T().nf(Math.round(z[1]*(T().PART_U?T().PART_U():1))));g.font='900 '+(R*(lb.length>5?.1:.14))+'px Game,system-ui';g.lineWidth=R*.045;g.strokeStyle='#1a0d00';g.fillStyle=z[0]==='jack'?'#ffe082':'#fff';g.strokeText(lb,0,-R*.74);g.fillText(lb,0,-R*.74);
      const s=R*.2,ic=z[0]==='key'||z[0]==='kall'?KIM.pass:z[0]==='bk'?CWI.bk:z[0]==='jack'?CWI.tank:CWI[['tank','warrior','ranger','mage','support'][i%5]];if(ok(ic))g.drawImage(ic,-s/2,-R*.5-s/2,s,s);g.restore();continue;}
    if(KR){const z=SW[i],lb=(z[0]==='all'?'ALL ':'')+'×'+z[1];g.font='900 '+(R*(z[0]==='all'?.12:.15))+'px Game,system-ui';g.lineWidth=R*.045;g.strokeStyle='#001a33';g.fillStyle=z[0]==='all'&&z[1]>1?'#ffe082':'#fff';g.strokeText(lb,0,-R*.74);g.fillText(lb,0,-R*.74);
      const s=R*.22,ic=z[0]==='all'||z[0]==='any'?KIM.pass:KIM[z[0]];if(ok(ic))g.drawImage(ic,-s/2,-R*.5-s/2,s,s);if(z[0]==='any'){g.font='900 '+(R*.12)+'px Game,system-ui';g.strokeText('?',R*.07,-R*.45);g.fillStyle='#ffe082';g.fillText('?',R*.07,-R*.45);}g.restore();continue;}
    g.font='900 '+(R*.17)+'px Game,system-ui';g.lineWidth=R*.045;g.strokeStyle='#1a0d00';g.fillStyle='#fff';g.strokeText(WHEEL[i][0],0,-R*.72);g.fillText(WHEEL[i][0],0,-R*.72);
    const s=R*.17;if(ok(DMG))g.drawImage(DMG,-s/2,-R*.53-s/2,s,s);else{g.font='900 '+(R*.1)+'px Game,system-ui';g.fillText('💎',0,-R*.53);}g.restore();}
  g.restore();
  if(ok(FR))g.drawImage(FR,0,WF.top*k,WF.w*k,WF.h*k);
  const PN=KR&&ok(KWI.kwheel_pin)?KWI.kwheel_pin:WI.wheel_pin; // v16-137: Key Roulette has its own key pointer
  if(ok(PN)){const pw=82*k,ph=pw*PN.naturalHeight/PN.naturalWidth;g.drawImage(PN,X-pw/2,4*k,pw,ph);}
  else{g.beginPath();g.moveTo(X-R*.09,Y-R*1.05);g.lineTo(X+R*.09,Y-R*1.05);g.lineTo(X,Y-R*.85);g.closePath();g.fillStyle='#ff1744';g.fill();}}
function shade(c){const n=parseInt(c.slice(1),16),f=v=>Math.round(v*.45);return 'rgb('+f(n>>16)+','+f(n>>8&255)+','+f(n&255)+')';}
// ---------------- page
const css=`#ev{position:fixed;inset:0;z-index:58;display:none;background:#0b0716 url(img/ui9/ev_bg.webp) top center/100% auto no-repeat;color:#fff;font-family:Game,system-ui;overflow:hidden}
#ev.open{display:flex;flex-direction:column}#ev:after{content:'';position:absolute;left:0;right:0;top:29vw;bottom:0;background:linear-gradient(#0b071600,#0b0716cc 30vw,#0b0716ee);pointer-events:none;z-index:0}#ev>*{position:relative;z-index:1}
#ev .evTop{position:relative;height:29vw;flex:none;display:flex;align-items:center;justify-content:center;padding-top:env(safe-area-inset-top)}#ev .evTop .evX{position:absolute;left:8px;top:calc(env(safe-area-inset-top) + 6px)}
#ev .evX{width:40px;height:40px;border:0;border-radius:12px;background:linear-gradient(#ffcf4a,#e08a00);font:900 20px Game,system-ui;color:#3a1c00;box-shadow:0 3px 0 #6b3d00}
#ev .evTi{margin-top:-3vw;font:900 min(7vw,34px) Game,system-ui;letter-spacing:1px;text-align:center;color:#ffe082;text-shadow:0 2px 0 #6b3d00,0 0 14px #ffb30088}
#ev .evTabs{display:flex;gap:6px;padding:0 10px}#ev .evTabs b{flex:1;text-align:center;padding:9px 4px;border-radius:12px 12px 4px 4px;background:#2a1e40;font:900 12px Game,system-ui;color:#b9a8d8;box-shadow:inset 0 0 0 1.5px #5d4a85}#ev .evTabs b.on{background:linear-gradient(#ffd54a,#e69500);color:#3a1c00;box-shadow:0 0 12px #ffb30077}
#ev .evB{flex:1;overflow:auto;padding:10px 10px calc(env(safe-area-inset-bottom) + 16px)}
#ev .evBan{position:relative;flex:none;box-sizing:border-box;aspect-ratio:900/360;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:0 50% 0 6.5%;background:linear-gradient(135deg,var(--c),#1a1030 75%) center/100% 100% no-repeat;filter:drop-shadow(0 6px 10px #000a)}
#ev .evBan.pic{background-image:var(--b)}#ev .evBan.pic:before{content:'';position:absolute;left:3%;top:9%;bottom:9%;width:52%;background:radial-gradient(farthest-side at 30% 50%,#000a,#0000);pointer-events:none}
#ev .evBan *{position:relative}#ev .evBan h3{margin:0;font:900 min(4.2vw,19px)/1.1 Game,system-ui;letter-spacing:.5px;text-shadow:0 2px 0 #000,0 0 8px #000}#ev .evD{margin:8px 2px 0;font:700 12px Game,system-ui;color:#f0e6ff;text-align:center;text-shadow:0 1px 2px #000}#ev .evBan p{margin:5px 0 0;font:700 12px Game,system-ui;color:#f0e6ff}
#ev .evT{display:inline-block;margin-top:7px;padding:3px 9px;border-radius:9px;background:#000a;font:900 12px Game,system-ui;color:#ffd54a}
#ev .evSc{margin:10px 0;text-align:center;font:900 15px Game,system-ui;color:#e8dcff}#ev .evSc b{font-size:26px;color:#fff;text-shadow:0 0 10px var(--c)}
#ev .evM{display:flex;align-items:center;gap:8px;margin:7px 0;padding:8px 8px 8px 10px;border-radius:14px;background:linear-gradient(#2a1f44,#150f24);box-shadow:inset 0 0 0 1.5px #6a55a0,0 4px 10px #0008}#ev .evM.ok{box-shadow:inset 0 0 0 2px #ffd54a;background:#2c2140}#ev .evM.done{opacity:.55}
#ev .evM .g{min-width:64px;font:900 13px Game,system-ui;color:#ffe082}#ev .evM .r{flex:1;font:800 13px Game,system-ui}#ev .evM .r .tki{height:1.3em;vertical-align:-.3em}
#ev .evM button{--bh:40px;flex:none;width:92px;height:40px;padding:0 4px;border-style:solid;border-color:transparent;border-width:0;border-image:url(img/ui8/btn_green_s.webp) 0 100 fill/0 calc(var(--bh)*1.08) stretch;background:none;font:900 italic 13px Game,system-ui;color:#062b0c;text-shadow:0 1px 0 #fff6}#ev .evM button.dis{border-image-source:url(img/ui8/btn_grey_s.webp);color:#cfd8dc;text-shadow:0 2px 0 #000}#ev .evM.done button{border-image-source:url(img/ui8/btn_gold_s.webp);color:#2a1600;font-size:16px}
#ev .evPb{height:20px;margin-top:3px;box-sizing:border-box;border-style:solid;border-color:transparent;border-width:6px 14px;border-image:url(img/ui8/bar_empty.webp) 30 72 fill/6px 14px stretch}#ev .evPb i{display:block;height:100%;border-radius:4px;background:linear-gradient(#fff8,#fff0 55%),linear-gradient(90deg,var(--c),#ffe082);box-shadow:0 0 6px var(--c)}
#ev .evRk{width:100%;margin:10px 0;border:0;border-radius:12px;padding:11px;font:900 14px Game,system-ui;background:linear-gradient(#64b5f6,#1565c0);color:#fff;box-shadow:0 3px 0 #0a2a52}
#ev .evL{margin:4px 0;display:flex;gap:8px;align-items:center;padding:6px 8px;border-radius:10px;background:#1e1530;font:800 13px Game,system-ui}#ev .evL i{min-width:30px;font-style:normal;color:#ffd54a;font-weight:900}#ev .evL span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#ev .evL.me{box-shadow:inset 0 0 0 2px #7CFC9A}
#ev .evS{margin:12px 0 4px;font:900 13px Game,system-ui;letter-spacing:1px;color:#c9b6ff}#ev .evP{font:700 11.5px Game,system-ui;color:#b9a8d8;line-height:1.45}#ev .evP .tki{height:1.25em;vertical-align:-.3em}
#ev .evW{display:flex;flex-direction:column;align-items:center}#ev #evWh{width:min(78vw,300px);height:calc(min(78vw,300px)*645/550);filter:drop-shadow(0 8px 16px #000)}
#ev .evSpin{margin:8px 0;border:0;border-radius:16px;padding:12px 40px;font:900 20px Game,system-ui;background:linear-gradient(#ffe27a,#ffb300 55%,#e08a00);color:#3a1c00;box-shadow:0 4px 0 #6b3d00,0 0 18px #ffb30088}#ev .evSpin.dis{filter:grayscale(1) brightness(.6)}
#ev .evSpin{--bh:52px;height:52px;min-width:220px;padding:0 26px;border-radius:0;box-shadow:none;border-style:solid;border-color:transparent;border-width:0;border-image:url(img/ui8/btn_gold_s.webp) 0 100 fill/0 calc(var(--bh)*1.08) stretch;background:none;color:#3a1c00;font-size:20px;text-shadow:0 1px 0 #fff8}#ev .evSpin.dis{border-image-source:url(img/ui8/btn_grey_s.webp);filter:none;color:#e8e8e8;text-shadow:0 2px 0 #000}   /* v16-126: Marius' button pictures */
#ev .evNx{margin-top:12px;font:800 12px Game,system-ui;color:#9d8cc0;text-align:center}
/* v16-120 UI11 – Marius' pictures (img/ui10) + game font */
#ev .evTi,#ev .evTabs b,#ev .evBan h3,#ev .evSc,#ev .evM .g,#ev .evM .r,#ev .evM button,#ev .evRk,#ev .evS,#ev .evPr,#ev .evL,#ev .evT,#ev .evSpin,#ev .evNx{font-family:Lilita,Game,system-ui;font-weight:400;letter-spacing:.3px}
#ev .evTabs{gap:4px;padding:0 6px}#ev .evTabs b{display:flex;align-items:center;justify-content:center;min-height:50px;box-sizing:border-box;padding:6px 18px 4px;border-radius:0;box-shadow:none;background:none;border-style:solid;border-color:transparent;border-width:14px 34px 10px;border-image:url(img/ui10/ev_tab_off.webp) 70 170 50 fill/14px 34px 10px stretch;margin:0;font-size:13px;line-height:1;color:#d9c8ff;text-shadow:0 2px 0 #000}
#ev .evTabs b{padding:0}#ev .evTabs b.on{border-image-source:url(img/ui10/ev_tab_on.webp);color:#3a1600;text-shadow:0 1px 0 #ffe9a0;filter:drop-shadow(0 0 8px #ffb30088)}
#ev .evSc{position:relative;margin:10px auto 6px;width:100%;aspect-ratio:860/166;display:flex;align-items:center;justify-content:center;gap:10px;background:url(img/ui10/ev_score.webp) center/100% 100% no-repeat;font-size:16px;color:#e8dcff;text-shadow:0 2px 0 #000}
#ev .evSc b{font-size:28px;color:#fff;text-shadow:0 2px 0 #000,0 0 12px var(--c);font-weight:400}
#ev .evS{display:flex;align-items:center;justify-content:center;height:34px;margin:14px 0 6px;box-sizing:border-box;border-style:solid;border-color:transparent;border-width:0 52px;border-image:url(img/ui10/ev_title.webp) 0 150 fill/0 52px stretch;font-size:15px;letter-spacing:1px;color:#ffe082;text-shadow:0 2px 0 #000}
#ev .evSn{margin:-3px 0 6px;text-align:center;font:700 11px Game,system-ui;color:#a998cf}
#ev .evM{position:relative;box-sizing:border-box;width:100%;aspect-ratio:860/182;margin:6px 0;padding:0 5.5% 0 28%;gap:6px;border-radius:0;box-shadow:none!important;opacity:1!important;background:url(img/ui10/ev_row_lock.webp) center/100% 100% no-repeat!important}
#ev .evM.ok{background-image:url(img/ui10/ev_row_ready.webp)!important}#ev .evM.done{background-image:url(img/ui10/ev_row_done.webp)!important}
#ev .evM .g{position:absolute;left:10.6%;width:15.4%;top:19%;bottom:18%;min-width:0;display:flex;align-items:center;justify-content:center;font-size:16px;color:#ffe082;text-shadow:0 2px 0 #000;white-space:nowrap}
#ev .evM .r{min-width:0;font-size:15px;text-shadow:0 2px 0 #000;white-space:nowrap}
#ev .evM .g{flex-direction:column;gap:1px;font-size:15px}#ev .evM .g .tki{height:1.55em;width:auto;filter:drop-shadow(0 2px 2px #000)}#ev .evM .g .numP{font-size:15px}
#ev .evRw{display:inline-flex;align-items:center;gap:3px;margin-right:10px;font-size:16px}#ev .evRw .tki{height:1.75em!important;width:auto;vertical-align:middle;filter:drop-shadow(0 2px 2px #000)}#ev .evRw .numP{font-size:16px}#ev .evM.done .r{opacity:.6}
#ev .evM button{width:84px;height:38px;font-size:15px;font-style:normal}#ev .evM.done button{visibility:hidden}
#ev .evRk{display:block;width:100%;aspect-ratio:860/183;height:auto;margin:12px 0 4px;padding:0 6% 0 24%;border-radius:0;box-shadow:none;background:url(img/ui10/ev_rank_btn.webp) center/100% 100% no-repeat;font-size:21px;color:#fff;text-shadow:0 2px 0 #062050,0 0 10px #4fc3ff}
#ev .evRk:active{transform:scale(.97)}
#ev .evPz{display:flex;flex-direction:column;gap:5px}#ev .evPr{display:flex;align-items:center;gap:10px;padding:4px 10px 4px 6px;border-radius:12px;background:linear-gradient(90deg,#2a1f44ee,#150f2499);box-shadow:inset 0 0 0 1px #5d4a8566;font-size:15px;color:#f0e6ff;text-shadow:0 2px 0 #000}
#ev .evPr .tki,#ev .evL .tki{height:1.25em;vertical-align:-.3em}
#ev .evM .r.two .evRw{font-size:13px;margin-right:5px}#ev .evM .r.two .evRw .tki{height:1.45em!important}#ev .evM .r.two .numP{font-size:13px}
#ev .evM .r{overflow:hidden}#ev .evM .r.qt .qtx{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;white-space:normal;font-size:12.5px;line-height:1.12}
#ev .evPz{gap:2px}#ev .evPr{position:relative;box-sizing:border-box;width:100%;aspect-ratio:860/150;padding:0 5% 0 28%;border-radius:0;box-shadow:none;background:url(img/ui10/ev_row_lock.webp) center/100% 100% no-repeat}
#ev .evPr .rkm{position:absolute;left:18.3%;top:50%;transform:translate(-50%,-50%) scale(1.15)}#ev .evPr .pz{display:flex;align-items:center;flex-wrap:nowrap}
#ev i.rkm{flex:none;display:flex;align-items:center;justify-content:center;width:46px;height:50px;min-width:0;background:center/contain no-repeat;font:400 13px Lilita,Game,system-ui;font-style:normal;color:#fff;text-shadow:0 0 3px #000,0 1px 0 #000,0 0 6px #000;padding-bottom:4px;box-sizing:border-box}
#ev .evL{padding:3px 10px 3px 4px;font-size:15px}#ev .evL b{font-weight:400;color:#ffe082}
#ev .evTabs b.stTab{font-size:12px}#ev .evTabs b.stTab .tki{height:1.5em;width:auto;margin-right:3px}`;
let el,tab='A',view='main';
function build(){if(el)return;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);el=document.createElement('div');el.id='ev';
  el.innerHTML='<div class="evTop"><button class="evX" data-e="x">↩</button><div class="evTi">EVENTS</div></div><div class="evTabs" id="evTabs"></div><div class="evB" id="evBody"></div>';document.body.appendChild(el);
  el.addEventListener('click',e=>{const t=e.target.closest('[data-e]');if(!t)return;const a=t.dataset.e;
    if(a==='x'){if(view!=='main'){view='main';render();return;}el.classList.remove('open');dot();}
    else if(a==='tab'){tab=t.dataset.t;view='main';render();}
    else if(a==='street'){if(window.STREET)STREET.open();}   // v16-146 Business Street (street.js)
    else if(a==='cl')claim(t.dataset.t,+t.dataset.i);
    else if(a==='rk'){view='rank';render();showRank();}
    else if(a==='spin')spin();
    else if(a==='wq'){const B=S().B,w=B.w,x=QL(B.k).find(z=>z[0]===t.dataset.q);if(!x||w.got[x[0]]||(w.q[x[0]]||0)<x[2])return;w.got[x[0]]=1;w.sp+=x[3];T().save();T().toast((B.k==='key'?'🔑':'🎡')+' +'+x[3]+' free spin',1800);render();}});}
const left=ms=>{const s=Math.max(0,ms/1000|0),d=s/86400|0,h=(s%86400)/3600|0,m=(s%3600)/60|0;return d?d+'d '+h+'h':h+'h '+String(m).padStart(2,'0')+'m';};
function render(){if(!el||!el.classList.contains('open'))return;const s=S();
  document.getElementById('evTabs').innerHTML=['A','B'].map(tr=>'<b data-e="tab" data-t="'+tr+'" class="'+(tab===tr?'on':'')+'">'+evTabIc(EV[s[tr].k])+' '+EV[s[tr].k].n+'</b>').join('')+(window.STREET?'<b data-e="street" class="stTab">'+STREET.tabHtml()+'</b>':'');
  const st=s[tab],E=EV[st.k],c=cur(tab),sc=isW(st.k)?st.w.used:st.sc,body=document.getElementById('evBody');body.style.setProperty('--c',E.col);
  if(view==='rank'){body.innerHTML='<div class="evBan pic" style="--c:'+E.col+';--b:url(img/ui9/evb_'+E.bn+'.webp)"><h3>'+E.n+'<br>TOP 100</h3><div class="evT">⏳ ends in '+left(c.end-Date.now())+'</div></div><div id="evRkL"><div class="evP" style="text-align:center;margin:20px">Loading the ranking…</div></div>'+rkPrizes(st);return;}
  let h='<div class="evBan pic" style="--c:'+E.col+';--b:url(img/ui9/evb_'+E.bn+'.webp)"><h3>'+E.n+'</h3><div class="evT">⏳ ends in '+left(c.end-Date.now())+'</div></div><div class="evD">'+E.d+'</div>';
  h+='<div class="evSc"><span>YOUR '+E.u.toUpperCase()+'</span> <b>'+NH(T().nf(sc),1.25)+'</b>'+(rk[st.id]&&rk[st.id].rank?' · RANK <b style="font-size:18px">#'+rk[st.id].rank+'</b>':'')+'</div>';
  if(st.k==='cash'){const w=st.w,p=cwPrice(w),can=!spinning&&w.used<CW_MAX&&T().G.money>=p;h+='<div class="evW"><canvas id="evWh"></canvas><button class="evSpin'+(can?'':' dis')+'" data-e="spin">'+(w.used>=CW_MAX?'MAX SPINS':'SPIN · '+T().fmt(p))+'</button><div class="evP">Spins: <b>'+w.used+' / '+CW_MAX+'</b> · your cash: <b>'+T().fmt(T().G.money)+'</b> · next spin costs ×1.15</div><div class="evP">Prizes grow with your campaign stage. Parts upgrade your garages (LV 1-100).</div></div>';}
  else if(isW(st.k)){const w=st.w,can=w.sp>0&&!spinning,KR=st.k==='key';h+='<div class="evW"><canvas id="evWh"></canvas><button class="evSpin'+(can?'':' dis')+'" data-e="spin">SPIN · '+w.sp+' left</button><div class="evP">Won in this event: '+(KR?'🔑':DM())+' <b>'+T().nf(w.won)+'</b>'+(KR?' keys':'')+'</div>'+(KR&&window.DGK?'<div class="evP">Your bonus keys: '+DGK.K.map(d=>'<img class="tki" src="img/dg/k_'+d+'.webp" alt=""> <b>'+DGK.bon(d)+'</b>').join(' &nbsp;')+(DGK.ok()?'':'<br>🔒 Dungeons open at stage 15 – your keys wait for you')+'</div>':'')+'</div>';
    h+='<div class="evS">TODAY\'S QUESTS · FREE SPINS</div>'+QL(st.k).map(x=>{const v=Math.min(x[2],w.q[x[0]]||0),ok=v>=x[2],got=w.got[x[0]];return '<div class="evM'+(got?' done':ok?' ok':'')+'"><div class="g">'+NH(v+'/'+x[2],1)+'</div><div class="r qt"><span class="qtx">'+x[1]+'</span><div class="evPb"><i style="width:'+(v/x[2]*100)+'%"></i></div></div><button class="'+(ok&&!got?'':'dis')+'" data-e="wq" data-q="'+x[0]+'">'+(got?'✓':'+'+x[3]+(st.k==='key'?' 🔑':' 🎡'))+'</button></div>';}).join('');}
  h+='<div class="evS">MILESTONE REWARDS</div>'+E.m.map((m,i)=>{const g=goal(st,m[0]),ok=sc>=g,got=st.cl.includes(i);return '<div class="evM'+(got?' done':ok?' ok':'')+'"><div class="g">'+evIc(E)+NH(T().nf(g),T().nf(g).length>5?.85:1.1)+'</div><div class="r'+(Object.values(realRw(st,m[1])).filter(Boolean).length>1?' two':'')+'">'+rwBig(realRw(st,m[1]))+'<div class="evPb"><i style="width:'+Math.min(100,sc/g*100)+'%"></i></div></div><button class="'+(ok&&!got?'':'dis')+'" data-e="cl" data-t="'+tab+'" data-i="'+i+'">'+(got?'✓':'CLAIM')+'</button></div>';}).join('');
  h+='<button class="evRk" data-e="rk">TOP 100 RANKING</button>'+rkPrizes(st);
  const nx=cur(tab,c.end+1000);h+='<div class="evNx">NEXT: '+evTabIc(EV[nx.k])+' '+EV[nx.k].n+' · starts in '+left(nx.start-Date.now())+'</div>';
  body.innerHTML=h;if(isW(st.k)){wKind=st.k;drawWheel(document.getElementById('evWh'));}}
function rkPrizes(st){const k=EV[st.k].tkk,ic=k==='gt'?GT:k==='ct'?CT:k==='tk'?TK:'';return '<div class="evS">RANKING PRIZES</div><div class="evSn">sent by Mail when the event ends</div><div class="evPz">'+RANKRW.map(r=>'<div class="evPr">'+MDL(r[0],r[0]===r[1]?r[0]:r[0]+'-'+r[1])+'<span class="pz">'+rwBig(Object.assign({dm:k==='dm'?r[2]*1.5:r[2]},ic?{[k]:r[3]}:{}))+'</span></div>').join('')+'</div>';}
async function showRank(){const r=await rank(tab),L=document.getElementById('evRkL');if(!L)return;if(!r){L.innerHTML='<div class="evP" style="text-align:center;margin:20px">The ranking needs internet. Your score is saved and sent later.</div>';return;}
  rk[S()[tab].id]={rank:r.rank,t:Date.now()};
  L.innerHTML=(r.top.length?r.top.map((p,i)=>'<div class="evL'+(p.uid===r.me?' me':'')+'">'+MDL(i+1)+'<span>'+esc(p.name||'Mechanic')+'</span><b>'+T().nf(p.sc)+'</b></div>').join(''):'<div class="evP" style="text-align:center;margin:20px">Nobody yet – be the first!</div>')+(r.rank?'<div class="evL me">'+MDL(r.rank)+'<span>YOU</span><b>'+T().nf(r.sc)+'</b></div>':'');}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function open(){build();S();view='main';el.classList.add('open');render();clearInterval(open.t);open.t=setInterval(()=>{if(!el.classList.contains('open')){clearInterval(open.t);return;}if(!spinning&&view==='main')render();},30000);}
window.EVT={add,q,tick,open,dot,state:S,cur};
function boot(){if(!T()||!T().G){setTimeout(boot,500);return;}S();dmL=T().G.dm||0;const b=document.getElementById('evBtn');if(b)b.onclick=open;dot();setInterval(()=>{S();dot();},60000);setTimeout(send,8000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
