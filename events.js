// Torque Empire – v16-99 (20 nov 2026, Marius): TIME EVENTS that repeat.
// Two events always run at the same time, each lasts 3 days, then the next one starts:
//   track A: HERO SUMMON → GEAR SUMMON → CREW SUMMON → …   (count summons)
//   track B: ESSENCE SPEND → DIAMOND SPEND → LUCKY WHEEL → … (count what you spend / spins)
// Every event: milestone rewards (diamonds + free summons …) + a live TOP 100 on the server (prizes by Mail when it ends).
// LUCKY WHEEL: wins ONLY diamonds; spins come ONLY from event quests (never sold, never paid with diamonds).
(function(){
const T=()=>window.__TE;
const E0=Date.UTC(2026,10,20),DUR=3*864e5;
const TRK={A:['hero','gear','crew'],B:['ess','dia','wheel']};
const TK='<img class="tki" src="img/ticket.webp" alt="">',CT='<img class="tki" src="img/cticket.webp" alt="">',GT='<img class="tki" src="img/gticket.webp" alt="">';
const DM=()=>T().DMI,ES=()=>T().ESI;
const EV={
 hero:{n:'HERO SUMMON FESTIVAL',ic:'🎟️',col:'#ff7043',d:'Summon Mechanics (Recruit tickets or diamonds). Every summon counts.',u:'summons',tkk:'tk',
   m:[[10,{dm:50}],[30,{tk:2}],[60,{dm:100}],[100,{tk:3}],[150,{dm:200}],[250,{tk:5}],[400,{dm:400,tk:5}],[600,{dm:600,tk:8}]]},
 gear:{n:'GEAR SUMMON FORGE',ic:'⚙️',col:'#42a5f5',d:'Summon gear (Gear tickets or diamonds). Every piece counts.',u:'summons',tkk:'gt',
   m:[[10,{dm:50}],[30,{gt:2}],[60,{dm:100}],[100,{gt:3}],[150,{dm:200}],[250,{gt:5}],[400,{dm:400,gt:5}],[600,{dm:600,gt:8}]]},
 crew:{n:'CREW SUMMON RALLY',ic:'🎖️',col:'#ab47bc',d:'Summon Drivers + Guards (Crew tickets or diamonds). Every summon counts.',u:'summons',tkk:'ct',
   m:[[10,{dm:50}],[30,{ct:2}],[60,{dm:100}],[100,{ct:3}],[150,{dm:200}],[250,{ct:5}],[400,{dm:400,ct:5}],[600,{dm:600,ct:8}]]},
 ess:{n:'ESSENCE RUSH',ic:'💜',col:'#b388ff',d:'Spend Essence on hero LEVEL UP and ASCENSION. Every Essence spent counts.',u:'essence',tkk:'tk',rel:1,
   m:[[5,{dm:50}],[15,{tk:2}],[30,{dm:100,ess:5}],[60,{tk:3}],[100,{dm:200,ess:10}],[160,{tk:5}],[250,{dm:400,ess:20}],[400,{dm:600,tk:8}]]},
 dia:{n:'DIAMOND SPREE',ic:'💎',col:'#4dd0e1',d:'Spend diamonds anywhere (summons, name change …). Every diamond spent counts.',u:'diamonds',tkk:'tk',
   m:[[300,{tk:2}],[800,{dm:80}],[1500,{tk:3,gt:2}],[3000,{dm:250}],[5000,{tk:5,ct:3}],[8000,{dm:500}],[12000,{tk:8,gt:5}],[20000,{dm:1200,tk:10}]]},
 wheel:{n:'LUCKY WHEEL',ic:'🎡',col:'#ffd54a',d:'Spin the wheel – it gives ONLY diamonds. Free spins come from the event quests below (no buying).',u:'spins',tkk:'dm',
   m:[[3,{tk:1}],[6,{dm:100}],[9,{tk:2,gt:1}],[12,{dm:250}],[15,{tk:3,ct:2}]]}};
// ranking prizes (sent by Mail by the server when the event ends) – the same table is in server/online.js (EV_RW)
const RANKRW=[[1,1,2000,20],[2,3,1500,15],[4,10,1000,10],[11,50,500,5],[51,100,250,3]];
const WHEEL=[[20,30],[30,25],[50,18],[80,12],[100,8],[150,4.5],[300,2],[1000,.5]];
const WQ=[['login','Open the game today',1,1],['win','Win 5 battles in the campaign',5,1],['sum','Summon 10 times (heroes, crew or gear)',10,1],['idle','Collect Idle Rewards 2 times',2,1],['lvl','Level up heroes 10 times',10,1]];
const cur=(tr,t)=>{const i=Math.floor(((t||Date.now())-E0)/DUR);return {i,k:TRK[tr][((i%3)+3)%3],id:tr+i,end:E0+(i+1)*DUR,start:E0+i*DUR};};
const day=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
function S(){const G=T().G;if(!G.ev)G.ev={};const s=G.ev;
  for(const tr of ['A','B']){const c=cur(tr);if(!s[tr]||s[tr].id!==c.id){s[tr]={id:c.id,k:c.k,sc:0,cl:[],b:0,sent:0};}}
  const B=s.B;if(B.k==='ess'&&!B.b)B.b=T().ESS_U?T().ESS_U():300;  // essence goals grow with your stage (fixed for this event)
  if(B.k==='wheel'){if(!B.w)B.w={sp:0,used:0,won:0,d:'',q:{},got:{}};const w=B.w;if(w.d!==day()){w.d=day();w.q={login:1};w.got={};}}
  return s;}
const goal=(st,m)=>EV[st.k].rel?m*st.b:m;
function add(kind,n){if(!n||!T()||!T().G)return;const s=S();for(const tr of ['A','B']){const st=s[tr];if(st.k===kind){st.sc+=n;dirty();}}}
function q(kind,n){if(!T()||!T().G)return;const s=S(),B=s.B;if(B.k!=='wheel')return;B.w.q[kind]=(B.w.q[kind]||0)+n;dot();}
let dmL=null;
function tick(){const G=T()&&T().G;if(!G)return;const d=G.dm||0;if(dmL!=null&&d<dmL){const x=dmL-d;if(x<2e6)add('dia',x);}dmL=d;}
// ---------------- server: live ranking
let sendT=0,rk={};
function dirty(){dot();clearTimeout(sendT);sendT=setTimeout(send,15000);}
async function send(){if(!window.ONLINE||!ONLINE.call)return;const s=S();for(const tr of ['A','B']){const st=s[tr],sc=st.k==='wheel'?(st.w?st.w.used:0):st.sc;if(sc>0&&sc!==st.sent){const r=await ONLINE.call('evsc',{eid:st.id,k:st.k,sc});if(r&&r.ok){st.sent=sc;rk[st.id]={rank:r.rank,t:Date.now()};}}}}
async function rank(tr){const st=S()[tr];if(!window.ONLINE||!ONLINE.call)return null;await send();const r=await ONLINE.call('evrank',{eid:st.id,k:st.k});return r&&r.ok?r:null;}
// ---------------- rewards
function rwHtml(r){const a=[];if(r.dm)a.push(DM()+' '+r.dm);if(r.tk)a.push(TK+' '+r.tk);if(r.gt)a.push(GT+' '+r.gt);if(r.ct)a.push(CT+' '+r.ct);if(r.ess)a.push(ES()+' '+T().nf(r.ess));return a.join(' ');}
function realRw(st,r){const o={...r};if(o.ess)o.ess=Math.round(o.ess*(st.b||300));return o;}
function claim(tr,i){const s=S(),st=s[tr],E=EV[st.k],m=E.m[i],sc=st.k==='wheel'?st.w.used:st.sc;if(!m||st.cl.includes(i)||sc<goal(st,m[0]))return;
  st.cl.push(i);const r=realRw(st,m[1]);T().giveRw(r);T().save();T().toast('🎁 '+E.n+': '+rwHtml(r),2800);render();}
function canClaim(){if(!T()||!T().G)return false;const s=S();for(const tr of ['A','B']){const st=s[tr],E=EV[st.k],sc=st.k==='wheel'?st.w.used:st.sc;if(E.m.some((m,i)=>!st.cl.includes(i)&&sc>=goal(st,m[0])))return true;
  if(st.k==='wheel'){const w=st.w;if(w.sp>0)return true;if(WQ.some(x=>!w.got[x[0]]&&(w.q[x[0]]||0)>=x[2]))return true;}}return false;}
function dot(){const d=document.getElementById('evDot');if(d)d.classList.toggle('on',canClaim());}
// ---------------- wheel
let spinning=0,ang=0;
function spin(){const st=S().B,w=st.w;if(spinning||w.sp<1)return;w.sp--;w.used++;dirty();
  let r=Math.random()*WHEEL.reduce((a,x)=>a+x[1],0),k=0;for(;k<WHEEL.length;k++){r-=WHEEL[k][1];if(r<0)break;}k=Math.min(k,WHEEL.length-1);
  const n=WHEEL.length,seg=360/n,target=360*6+(360-(k*seg+seg/2));const a0=ang%360,t0=performance.now(),D=3600;spinning=1;
  const cv=document.getElementById('evWh');
  const step=now=>{const p=Math.min(1,(now-t0)/D),e=1-Math.pow(1-p,3);ang=a0+(target-a0)*e;drawWheel(cv);if(p<1)requestAnimationFrame(step);else{spinning=0;const v=WHEEL[k][0];T().G.dm=(T().G.dm||0)+v;w.won+=v;dmL=T().G.dm;T().save();T().toast('🎡 LUCKY WHEEL: '+DM()+' +'+v+'!',3000);render();}};
  T().save();requestAnimationFrame(step);}
function drawWheel(cv){if(!cv)return;const d=Math.min(2,devicePixelRatio||1),S0=cv.clientWidth||260;if(cv.width!==S0*d){cv.width=cv.height=S0*d;}const g=cv.getContext('2d'),R=cv.width/2;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);
  const n=WHEEL.length,cols=['#ff7043','#ffca28','#66bb6a','#29b6f6','#ab47bc','#ef5350','#26c6da','#ffd54a'];g.save();g.translate(R,R);g.rotate(ang*Math.PI/180);
  for(let i=0;i<n;i++){const a=-Math.PI/2+i*2*Math.PI/n;g.beginPath();g.moveTo(0,0);g.arc(0,0,R*.94,a,a+2*Math.PI/n);g.closePath();const gr=g.createRadialGradient(0,0,R*.1,0,0,R);gr.addColorStop(0,'#fff');gr.addColorStop(.25,cols[i]);gr.addColorStop(1,shade(cols[i]));g.fillStyle=gr;g.fill();g.strokeStyle='#3a2200';g.lineWidth=R*.02;g.stroke();
    g.save();g.rotate(a+Math.PI/n+Math.PI/2);g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=R*.03;g.font='900 '+(R*.13)+'px system-ui';g.textAlign='center';g.strokeText(WHEEL[i][0],0,-R*.62);g.fillText(WHEEL[i][0],0,-R*.62);g.font='900 '+(R*.08)+'px system-ui';g.fillText('💎',0,-R*.45);g.restore();}
  g.restore();g.beginPath();g.arc(R,R,R*.95,0,7);g.lineWidth=R*.06;g.strokeStyle='#ffd54a';g.stroke();g.beginPath();g.arc(R,R,R*.13,0,7);g.fillStyle='#3a2200';g.fill();g.beginPath();g.arc(R,R,R*.09,0,7);g.fillStyle='#ffd54a';g.fill();
  g.beginPath();g.moveTo(R-R*.09,R*.02);g.lineTo(R+R*.09,R*.02);g.lineTo(R,R*.2);g.closePath();g.fillStyle='#ff1744';g.fill();g.strokeStyle='#fff';g.lineWidth=R*.015;g.stroke();}
function shade(c){const n=parseInt(c.slice(1),16),f=v=>Math.round(v*.45);return 'rgb('+f(n>>16)+','+f(n>>8&255)+','+f(n&255)+')';}
// ---------------- page
const css=`#ev{position:fixed;inset:0;z-index:58;display:none;background:radial-gradient(120% 80% at 50% 0%,#3b2a5c,#140c22 60%,#07040c);color:#fff;font-family:system-ui;overflow:hidden}
#ev.open{display:flex;flex-direction:column}#ev .evTop{display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top) + 8px) 10px 6px}
#ev .evX{width:40px;height:40px;border:0;border-radius:12px;background:linear-gradient(#ffcf4a,#e08a00);font:900 20px system-ui;color:#3a1c00;box-shadow:0 3px 0 #6b3d00}
#ev .evTi{flex:1;font:900 21px system-ui;letter-spacing:1px;text-align:center;color:#ffe082;text-shadow:0 2px 0 #6b3d00,0 0 14px #ffb30088}
#ev .evTabs{display:flex;gap:6px;padding:0 10px}#ev .evTabs b{flex:1;text-align:center;padding:9px 4px;border-radius:12px 12px 4px 4px;background:#2a1e40;font:900 12px system-ui;color:#b9a8d8;box-shadow:inset 0 0 0 1.5px #5d4a85}#ev .evTabs b.on{background:linear-gradient(#ffd54a,#e69500);color:#3a1c00;box-shadow:0 0 12px #ffb30077}
#ev .evB{flex:1;overflow:auto;padding:10px 10px calc(env(safe-area-inset-bottom) + 16px)}
#ev .evBan{position:relative;border-radius:16px;padding:14px 12px;background:linear-gradient(135deg,var(--c),#1a1030 75%);box-shadow:0 0 0 2px #ffd54a88,0 6px 18px #0008;overflow:hidden}
#ev .evBan:before{content:'';position:absolute;inset:-40%;background:conic-gradient(from 0deg,#fff0,#fff3,#fff0 20%);animation:evR 6s linear infinite}@keyframes evR{to{transform:rotate(1turn)}}
#ev .evBan *{position:relative}#ev .evBan h3{margin:0;font:900 20px system-ui;letter-spacing:.5px;text-shadow:0 2px 0 #000}#ev .evBan p{margin:5px 0 0;font:700 12px system-ui;color:#f0e6ff}
#ev .evT{display:inline-block;margin-top:7px;padding:3px 9px;border-radius:9px;background:#000a;font:900 12px system-ui;color:#ffd54a}
#ev .evSc{margin:10px 0;text-align:center;font:900 15px system-ui;color:#e8dcff}#ev .evSc b{font-size:26px;color:#fff;text-shadow:0 0 10px var(--c)}
#ev .evM{display:flex;align-items:center;gap:8px;margin:6px 0;padding:8px;border-radius:12px;background:#1e1530;box-shadow:inset 0 0 0 1.5px #4a3a6a}#ev .evM.ok{box-shadow:inset 0 0 0 2px #ffd54a;background:#2c2140}#ev .evM.done{opacity:.55}
#ev .evM .g{min-width:64px;font:900 13px system-ui;color:#ffe082}#ev .evM .r{flex:1;font:800 13px system-ui}#ev .evM .r .tki{height:1.3em;vertical-align:-.3em}
#ev .evM button{border:0;border-radius:10px;padding:8px 10px;font:900 12px system-ui;background:linear-gradient(#7CFC9A,#2e7d32);color:#062b0c}#ev .evM button.dis{background:#3a3150;color:#887}
#ev .evPb{height:7px;border-radius:5px;background:#000;margin-top:4px;overflow:hidden}#ev .evPb i{display:block;height:100%;background:linear-gradient(90deg,var(--c),#fff)}
#ev .evRk{width:100%;margin:10px 0;border:0;border-radius:12px;padding:11px;font:900 14px system-ui;background:linear-gradient(#64b5f6,#1565c0);color:#fff;box-shadow:0 3px 0 #0a2a52}
#ev .evL{margin:4px 0;display:flex;gap:8px;align-items:center;padding:6px 8px;border-radius:10px;background:#1e1530;font:800 13px system-ui}#ev .evL i{min-width:30px;font-style:normal;color:#ffd54a;font-weight:900}#ev .evL span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#ev .evL.me{box-shadow:inset 0 0 0 2px #7CFC9A}
#ev .evS{margin:12px 0 4px;font:900 13px system-ui;letter-spacing:1px;color:#c9b6ff}#ev .evP{font:700 11.5px system-ui;color:#b9a8d8;line-height:1.45}#ev .evP .tki{height:1.25em;vertical-align:-.3em}
#ev .evW{display:flex;flex-direction:column;align-items:center}#ev #evWh{width:min(78vw,300px);height:min(78vw,300px);filter:drop-shadow(0 8px 16px #000)}
#ev .evSpin{margin:8px 0;border:0;border-radius:16px;padding:12px 40px;font:900 20px system-ui;background:linear-gradient(#ffe27a,#ffb300 55%,#e08a00);color:#3a1c00;box-shadow:0 4px 0 #6b3d00,0 0 18px #ffb30088}#ev .evSpin.dis{filter:grayscale(1) brightness(.6)}
#ev .evNx{margin-top:12px;font:800 12px system-ui;color:#9d8cc0;text-align:center}`;
let el,tab='A',view='main';
function build(){if(el)return;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);el=document.createElement('div');el.id='ev';
  el.innerHTML='<div class="evTop"><button class="evX" data-e="x">↩</button><div class="evTi">⭐ EVENTS</div><div style="width:40px"></div></div><div class="evTabs" id="evTabs"></div><div class="evB" id="evBody"></div>';document.body.appendChild(el);
  el.addEventListener('click',e=>{const t=e.target.closest('[data-e]');if(!t)return;const a=t.dataset.e;
    if(a==='x'){if(view!=='main'){view='main';render();return;}el.classList.remove('open');dot();}
    else if(a==='tab'){tab=t.dataset.t;view='main';render();}
    else if(a==='cl')claim(t.dataset.t,+t.dataset.i);
    else if(a==='rk'){view='rank';render();showRank();}
    else if(a==='spin')spin();
    else if(a==='wq'){const w=S().B.w,x=WQ.find(z=>z[0]===t.dataset.q);if(!x||w.got[x[0]]||(w.q[x[0]]||0)<x[2])return;w.got[x[0]]=1;w.sp+=x[3];T().save();T().toast('🎡 +'+x[3]+' free spin',1800);render();}});}
const left=ms=>{const s=Math.max(0,ms/1000|0),d=s/86400|0,h=(s%86400)/3600|0,m=(s%3600)/60|0;return d?d+'d '+h+'h':h+'h '+String(m).padStart(2,'0')+'m';};
function render(){if(!el||!el.classList.contains('open'))return;const s=S();
  document.getElementById('evTabs').innerHTML=['A','B'].map(tr=>'<b data-e="tab" data-t="'+tr+'" class="'+(tab===tr?'on':'')+'">'+EV[s[tr].k].ic+' '+EV[s[tr].k].n+'</b>').join('');
  const st=s[tab],E=EV[st.k],c=cur(tab),sc=st.k==='wheel'?st.w.used:st.sc,body=document.getElementById('evBody');body.style.setProperty('--c',E.col);
  if(view==='rank'){body.innerHTML='<div class="evBan" style="--c:'+E.col+'"><h3>'+E.ic+' '+E.n+' · TOP 100</h3><div class="evT">⏳ ends in '+left(c.end-Date.now())+'</div></div><div id="evRkL"><div class="evP" style="text-align:center;margin:20px">Loading the ranking…</div></div>'+rkPrizes(st);return;}
  let h='<div class="evBan" style="--c:'+E.col+'"><h3>'+E.ic+' '+E.n+'</h3><p>'+E.d+'</p><div class="evT">⏳ ends in '+left(c.end-Date.now())+'</div></div>';
  h+='<div class="evSc">YOUR '+E.u.toUpperCase()+': <b>'+T().nf(sc)+'</b>'+(rk[st.id]&&rk[st.id].rank?' · RANK <b style="font-size:18px">#'+rk[st.id].rank+'</b>':'')+'</div>';
  if(st.k==='wheel'){const w=st.w,can=w.sp>0&&!spinning;h+='<div class="evW"><canvas id="evWh"></canvas><button class="evSpin'+(can?'':' dis')+'" data-e="spin">SPIN · '+w.sp+' left</button><div class="evP">Won in this event: '+DM()+' <b>'+T().nf(w.won)+'</b></div></div>';
    h+='<div class="evS">TODAY\'S QUESTS · FREE SPINS</div>'+WQ.map(x=>{const v=Math.min(x[2],w.q[x[0]]||0),ok=v>=x[2],got=w.got[x[0]];return '<div class="evM'+(got?' done':ok?' ok':'')+'"><div class="r">'+x[1]+'<div class="evPb"><i style="width:'+(v/x[2]*100)+'%"></i></div></div><div class="g">'+v+'/'+x[2]+'</div><button class="'+(ok&&!got?'':'dis')+'" data-e="wq" data-q="'+x[0]+'">'+(got?'✓':'+'+x[3]+' 🎡')+'</button></div>';}).join('');}
  h+='<div class="evS">MILESTONE REWARDS</div>'+E.m.map((m,i)=>{const g=goal(st,m[0]),ok=sc>=g,got=st.cl.includes(i);return '<div class="evM'+(got?' done':ok?' ok':'')+'"><div class="g">'+T().nf(g)+'</div><div class="r">'+rwHtml(realRw(st,m[1]))+'<div class="evPb"><i style="width:'+Math.min(100,sc/g*100)+'%"></i></div></div><button class="'+(ok&&!got?'':'dis')+'" data-e="cl" data-t="'+tab+'" data-i="'+i+'">'+(got?'✓':'CLAIM')+'</button></div>';}).join('');
  h+='<button class="evRk" data-e="rk">🏆 TOP 100 RANKING</button>'+rkPrizes(st);
  const nx=cur(tab,c.end+1000);h+='<div class="evNx">NEXT: '+EV[nx.k].ic+' '+EV[nx.k].n+' · starts in '+left(nx.start-Date.now())+'</div>';
  body.innerHTML=h;if(st.k==='wheel')drawWheel(document.getElementById('evWh'));}
function rkPrizes(st){const k=EV[st.k].tkk,ic=k==='gt'?GT:k==='ct'?CT:k==='tk'?TK:'';return '<div class="evS">RANKING PRIZES (by Mail when the event ends)</div><div class="evP">'+RANKRW.map(r=>'#'+(r[0]===r[1]?r[0]:r[0]+'-'+r[1])+': '+DM()+' '+(k==='dm'?r[2]*1.5:r[2])+(ic?' + '+ic+' '+r[3]:'')).join('<br>')+'</div>';}
async function showRank(){const r=await rank(tab),L=document.getElementById('evRkL');if(!L)return;if(!r){L.innerHTML='<div class="evP" style="text-align:center;margin:20px">The ranking needs internet. Your score is saved and sent later.</div>';return;}
  rk[S()[tab].id]={rank:r.rank,t:Date.now()};
  L.innerHTML=(r.top.length?r.top.map((p,i)=>'<div class="evL'+(p.uid===r.me?' me':'')+'"><i>#'+(i+1)+'</i><span>'+esc(p.name||'Mechanic')+'</span><b>'+T().nf(p.sc)+'</b></div>').join(''):'<div class="evP" style="text-align:center;margin:20px">Nobody yet – be the first!</div>')+(r.rank?'<div class="evL me"><i>#'+r.rank+'</i><span>YOU</span><b>'+T().nf(r.sc)+'</b></div>':'');}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function open(){build();S();view='main';el.classList.add('open');render();clearInterval(open.t);open.t=setInterval(()=>{if(!el.classList.contains('open')){clearInterval(open.t);return;}if(!spinning&&view==='main')render();},30000);}
window.EVT={add,q,tick,open,dot,state:S,cur};
function boot(){if(!T()||!T().G){setTimeout(boot,500);return;}S();dmL=T().G.dm||0;const b=document.getElementById('evBtn');if(b)b.onclick=open;dot();setInterval(()=>{S();dot();},60000);setTimeout(send,8000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
