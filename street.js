// Torque Empire – v16-146 RAIL WARS + STREET SHOP (Marius, 21 nov 2026)
// "New cars from the factory fuel at the gas station, get washed and go up on the train; about once an hour the train is full and I SEND it.
//  Other players can attack my train (a fight like the Arena, but separate). Grade from the Car Wash / Gas Station / Car Factory levels,
//  refresh for a higher grade = more coins for the Shop." Decisions: permanent mode, 3 trains a day, 5 attacks a day, 2 refreshes then locked.
// The map part (export cars, train, grade, refresh) is in index.html (rwSend, rwRefresh, RWS); the fights + limits are on the server (op rw*).
// Street Tokens (G.st.tok) never expire. Shop: all tickets + all Dungeon keys 500 each (Marius 21 nov); Essence 250 provisional.
// World Boss keys / Arena fights are NOT sold here: the server counts them per day for the rankings.
(function(){
const T=()=>window.__TE, O=()=>window.ONLINE;
const TOK='img/ui12/st_token.webp',TI=e=>'<img class="tki stTok" src="'+TOK+'" alt=""'+(e?' style="height:'+e+'"':'')+'>';
const DGN={vault:'Vault',mine:'Scrap Mine',forge:'Forge',lab:'Lab'};
const SHOP=[['tk',500],['gt',500],['ct',500],['k_vault',500],['k_mine',500],['k_forge',500],['k_lab',500],['ess',250]];   // Marius 21 nov: every ticket and every key = 500 (Essence still provisional)
const essN=()=>Math.round((T().ESS_U?T().ESS_U():300)*2);
function itIcon(k){if(k[0]==='k')return '<img class="tki" src="img/dg/k_'+k.slice(2)+'.webp" alt="">';if(k==='tk')return '<img class="tki" src="img/ticket.webp" alt="">';if(k==='ct')return '<img class="tki" src="img/cticket.webp" alt="">';if(k==='gt')return '<img class="tki" src="img/gticket.webp" alt="">';return T().ESI;}
function itName(k){if(k[0]==='k')return DGN[k.slice(2)]+' Key';return {tk:'Recruit Ticket',gt:'Gear Ticket',ct:'Crew Ticket',ess:T().nf(essN())+' Essence'}[k];}
function S(){const G=T().G;if(!G.st)G.st={tok:0};return G.st;}
function give(n){if(!(n>0))return;S().tok+=n;T().save();}
const left=ms=>{const s=Math.max(0,ms/1000|0),h=s/3600|0,m=(s%3600)/60|0,x=s%60;return h?h+'h '+String(m).padStart(2,'0')+'m':m+':'+String(x).padStart(2,'0');};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const GN=g=>T().RW_GN[g], GC=g=>T().RW_GC[g];
// v16-155 RAIL PASS (4.99 €/month): +1 train & +2 attacks a day (server), 3 refreshes, 45 min fill, ×1.3 tokens, robbed = lose half, golden loco
const RP=()=>!!(T().RPON&&T().RPON()), RFM=()=>T().rwRfMax?T().rwRfMax():2, SMX=()=>D&&D.ok?D.sendMax:(RP()?4:3), AMX=()=>D&&D.ok?D.atkMax:(RP()?7:5);
const RPV=()=>!!(window.SHOP2&&SHOP2.railVis&&SHOP2.railVis());
// ---------------- page
const css=`#st{position:fixed;inset:0;z-index:59;display:none;flex-direction:column;background:#060c1c url(img/rw/rw_bg.webp) center top/100% auto no-repeat;color:#fff;font-family:Lilita,Game,system-ui;overflow:hidden}
#st.open{display:flex}#st .stTop{flex:none;display:flex;align-items:center;padding:calc(env(safe-area-inset-top) + 8px) 8px 0}
#st .stX{width:42px;height:42px;border:0;border-radius:12px;background:linear-gradient(#ffcf4a,#e08a00);font:900 20px Game,system-ui;color:#3a1c00;box-shadow:0 3px 0 #6b3d00,0 0 0 2px #0008}
#st .stB{flex:1;overflow:auto;padding:min(36vw,190px) 10px calc(env(safe-area-inset-bottom) + 18px)}
#st .stBal{display:flex;align-items:center;justify-content:center;gap:10px;margin:0 0 6px;padding:8px;border-radius:16px;background:linear-gradient(#123847e8,#0b1c26e8);box-shadow:inset 0 0 0 2px #4dd0e1aa,0 4px 10px #0008}
#st .stBal .stTok{height:40px}#st .stBal b{font-size:30px;font-weight:400;text-shadow:0 2px 0 #000,0 0 12px #4dd0e1}#st .stBal span{font-size:12px;color:#b2ebf2;line-height:1.2}
#st .stS{margin:14px 0 6px;text-align:center;font-size:16px;letter-spacing:1px;color:#ffe082;text-shadow:0 2px 0 #000,0 0 8px #000}
#st .stN{margin:-2px 0 8px;text-align:center;font:700 11.5px Game,system-ui;color:#b0bec5;line-height:1.4;text-shadow:0 1px 2px #000}
#st .tki{height:1.3em;width:auto;vertical-align:-.3em}
#st .card{position:relative;padding:10px;border-radius:16px;background:linear-gradient(#18243cf0,#0c1322f0);box-shadow:inset 0 0 0 2px var(--gc,#3a5d72),0 6px 14px #000a}
#st .tr{display:block;width:100%;max-width:330px;margin:2px auto 0;filter:drop-shadow(0 4px 4px #000)}
#st .gr{text-align:center;font-size:22px;color:var(--gc);text-shadow:0 2px 0 #000,0 0 14px var(--gc)}
#st .card.rfSpin{animation:rfGlow .25s ease-in-out infinite alternate}#st .card.rfSpin .tr{animation:rfShake .09s linear infinite;filter:brightness(1.35) drop-shadow(0 0 12px var(--gc))}#st .card.rfSpin .gr{animation:rfBlink .12s linear infinite}
#st .card.rfLand .tr{animation:rfPop .45s cubic-bezier(.2,1.6,.4,1)}#st .card.rfUp .tr{animation:rfPop .6s cubic-bezier(.2,1.8,.4,1)}#st .card.rfUp .gr{animation:rfPop .6s .1s cubic-bezier(.2,1.8,.4,1) both}
#st .card.rfUp:after{content:"";position:absolute;inset:-6px;border-radius:18px;pointer-events:none;background:radial-gradient(circle at 50% 40%,#fff 0,var(--gc) 25%,transparent 65%);animation:rfBoom .9s ease-out forwards}
#st .rfTx{position:absolute;left:0;right:0;top:12%;text-align:center;font-size:30px;color:#fff;text-shadow:0 3px 0 #000,0 0 18px var(--gc),0 0 30px var(--gc);pointer-events:none;animation:rfTx 1.6s ease-out forwards}
@keyframes rfShake{0%{transform:translate(0,0)}25%{transform:translate(-3px,1px)}50%{transform:translate(2px,-1px)}75%{transform:translate(-1px,2px)}100%{transform:translate(0,0)}}
@keyframes rfGlow{from{box-shadow:inset 0 0 0 2px var(--gc),0 0 8px var(--gc)}to{box-shadow:inset 0 0 0 3px var(--gc),0 0 26px var(--gc)}}
@keyframes rfBlink{50%{opacity:.45;transform:scale(1.08)}}
@keyframes rfPop{0%{transform:scale(.7)}100%{transform:scale(1)}}
@keyframes rfBoom{0%{opacity:.95;transform:scale(.3)}100%{opacity:0;transform:scale(1.5)}}
@keyframes rfTx{0%{opacity:0;transform:scale(2.4)}15%{opacity:1;transform:scale(1)}70%{opacity:1;transform:translateY(-10px)}100%{opacity:0;transform:translateY(-34px)}}
#st .bar{height:14px;margin:6px 4px;border-radius:7px;background:#0008;overflow:hidden;box-shadow:inset 0 0 0 1px #fff3}#st .bar i{display:block;height:100%;background:linear-gradient(90deg,#26c6da,#ffe082)}
#st .ln{display:flex;justify-content:space-between;gap:6px;font-size:13.5px;padding:2px 4px}#st .ln b{font-weight:400;color:#80deea}
#st .btns{display:flex;gap:8px;margin-top:8px}#st .btns button{flex:1}
#st button.g,#st button.y,#st button.r{--bh:42px;height:42px;padding:0 6px;border-style:solid;border-color:transparent;border-width:0;border-image:url(img/ui8/btn_green_s.webp) 0 100 fill/0 calc(var(--bh)*1.08) stretch;background:none;font:400 16px Lilita,Game,system-ui;color:#062b0c;text-shadow:0 1px 0 #fff6}
#st button.y{border-image-source:url(img/ui8/btn_gold_s.webp);color:#3a2300}#st button.r{border-image-source:url(img/ui8/btn_red_s.webp);color:#fff;text-shadow:0 2px 0 #0008}
#st button.dis{border-image-source:url(img/ui8/btn_grey_s.webp)!important;color:#cfd8dc!important;text-shadow:0 2px 0 #000}
#st .rwr{display:flex;align-items:center;gap:8px;margin:6px 0;padding:8px;border-radius:14px;background:linear-gradient(#1d2f3df0,#111c25f0);box-shadow:inset 0 0 0 1.5px var(--gc,#37586c)}
#st .rwr .mini{width:74px;flex:none}#st .rwr .who{flex:1;min-width:0;font-size:14px;line-height:1.15}#st .rwr .who small{display:block;font:700 11px Game,system-ui;color:#b0bec5}
#st .rwr .who .gn{color:var(--gc)}#st .rwr button{width:92px;flex:none}
#st .hl{font:700 12px Game,system-ui;color:#cfd8dc;padding:5px 8px;border-bottom:1px solid #ffffff14}#st .hl b{color:#ff8a80}#st .hl b.ok{color:#a5d6a7}
#st .stCf{position:absolute;inset:0;z-index:5;background:#05070ccc;display:flex;align-items:center;justify-content:center;padding:20px}#st .stCf .box{width:100%;max-width:300px;display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 14px;border-radius:16px;background:linear-gradient(#1a2c3a,#0f1922);box-shadow:inset 0 0 0 2px #e0a82e,0 8px 20px #000a;color:#fff;text-align:center}#st .stCf .ic img{height:54px}#st .stCf b{font-size:16px}#st .stCf span{font-size:13px;color:#cfd8e3}#st .stCf .bt{display:flex;gap:10px;width:100%;margin-top:8px}#st .stCf .bt button{flex:1;padding:10px 4px;border:0;border-radius:999px;font:900 13px Game,system-ui;background:#2b3a52;color:#fff}#st .stCf .bt button.g{background:linear-gradient(#ffd54a,#ff9800);color:#1a1200}#st .stSh{display:grid;grid-template-columns:1fr 1fr;gap:8px}#st .stI{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px 8px;border-radius:14px;background:linear-gradient(#1a2c3af0,#0f1922f0);box-shadow:inset 0 0 0 1.5px #3a5d72,0 4px 8px #0007}
#st .stI .ic .tki{height:50px;filter:drop-shadow(0 3px 3px #000)}#st .stI .nm{font-size:14px;text-align:center;line-height:1.1}#st .stI button{width:100%;max-width:130px}#st .stI button .tki{height:1.25em}
#st .off{text-align:center;padding:16px;color:#ffcc80;font-size:15px}
#st .rpAd{position:relative;margin:0 0 6px;border-radius:16px;overflow:hidden;box-shadow:0 0 0 2px #ffd36b,0 6px 14px #000a}#st .rpAd img{display:block;width:100%;aspect-ratio:3/1;object-fit:cover;object-position:60% 55%}
#st .rpAd div{position:absolute;left:0;right:0;bottom:0;padding:16px 10px 6px;background:linear-gradient(#0000,#000c);text-align:center}#st .rpAd b{display:block;font-weight:400;font-size:15px;color:#ffe082;text-shadow:0 2px 0 #000}#st .rpAd em{font:700 12px Game,system-ui;font-style:normal;color:#fff}
#st .rpOn{display:flex;align-items:center;gap:8px;margin:0 0 6px;padding:6px 10px;border-radius:14px;background:linear-gradient(#5a1a10e8,#2a0d08e8);box-shadow:inset 0 0 0 2px #ffd36b}#st .rpOn img{width:46px;flex:none}#st .rpOn b{font-weight:400;color:#ffe082;font-size:15px}#st .rpOn small{display:block;font:700 11px Game,system-ui;color:#ffe0b2}`;
let el,D=null,busy=false;
function build(){if(el)return;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);el=document.createElement('div');el.id='st';
  el.innerHTML='<div class="stTop"><button class="stX" data-s="x">↩</button></div><div class="stB" id="stBody"></div>';document.body.appendChild(el);
  el.addEventListener('click',e=>{const t=e.target.closest('[data-s]');if(!t)return;const a=t.dataset.s;
    if(a==='x')close();else if(a==='rf')refresh();else if(a==='send')send();else if(a==='atk')attack(+t.dataset.i);else if(a==='list')load(true);else if(a==='buy')buy(t.dataset.k);else if(a==='rp'){close();if(window.SHOP2)SHOP2.open('tv');}});}
function close(){if(el)el.classList.remove('open');clearInterval(open.t);}
async function load(force){if(!O()){D={err:'offline'};render();return;}if(busy&&!force)return;busy=true;if(RP()&&!load.sy){load.sy=1;await O().sync();}const r=await O().call('rw',{});busy=false;D=r;if(r&&r.ok)await claimAll();render();}
async function claimAll(){if(!D||!D.mine)return;const now=Date.now();for(const t of D.mine.filter(t=>t.t1<=now)){const r=await O().call('rwclaim',{id:t.id});
  if(r&&r.ok){give(r.tok);{const G=T().G;G.st=G.st||{};G.st.ar=(G.st.ar||0)+1;}   // v16-174: trains sent (TRAIN TYCOON)
    T().toast('🚆 Your '+GN(r.g)+' train arrived: +'+T().nf(r.tok)+' '+TI()+(r.lost?' (robbed: −'+T().nf(r.lost)+')':''),3200);D.mine=D.mine.filter(x=>x.id!==t.id);}}}
// v16-186: REFRESH animation (Marius 22 nov) – the locomotive + grade spin like a slot machine, then land (burst + UPGRADE! when the grade goes up)
let rfBusy=false;
function refresh(){if(rfBusy)return;const s=T().RWS(),mx=RFM();if(s.rf>=mx)return T().toast('🔒 This train grade is locked ('+mx+' refreshes used)',2200);const g0=s.g;T().rwRefresh();const g1=s.g;
  const card=el&&el.querySelector('.card'),img=card&&card.querySelector('img.tr'),gr=card&&card.querySelector('.gr'),bt=el&&el.querySelector('[data-s="rf"]');
  const end=()=>{rfBusy=false;render();const c2=el&&el.querySelector('.card');if(c2){c2.classList.add(g1>g0?'rfUp':'rfLand');if(g1>g0)c2.insertAdjacentHTML('beforeend','<div class="rfTx">⬆ UPGRADE!</div>');}
    T().toast(g1>g0?'✨ Upgraded to '+GN(g1)+'!':'🔄 Still '+GN(g1)+' – '+(mx-s.rf)+' refresh left',2200);};
  if(!card){end();return;}
  rfBusy=true;if(bt){bt.classList.add('dis');bt.textContent='🎰 ...';}card.classList.add('rfSpin');
  const N=(T().RW_GN||[]).length||6,STEPS=14;let k=0;for(let g=0;g<N;g++){const im=new Image();im.src='img/rw/loco'+g+'.webp';}
  const tick=()=>{if(k>=STEPS){card.classList.remove('rfSpin');end();return;}k++;const g=k===STEPS?g1:(g0+k)%N;
    if(img&&!RP())img.src='img/rw/loco'+g+'.webp';if(gr)gr.textContent=GN(g);card.style.setProperty('--gc',GC(g));setTimeout(tick,40+k*k*1.1);};
  tick();}
async function send(){const s=T().RWS(),cap=T().rCap();if(s.n<cap)return T().toast('🚆 The train is not full yet ('+s.n+' / '+cap+' cars)',2200);
  if(D&&D.ok&&D.sends<=0)return T().toast('🚆 No trains left today ('+SMX()+' a day)',2200);if(busy)return;busy=true;
  await O().sync();const r=await O().call('rwsend',{g:s.g,tok:T().rwTok(s.g,s.n),cars:s.n});busy=false;
  if(!r||!r.ok)return T().toast({no_sends:'🚆 No trains left today ('+SMX()+' a day)',offline:'📶 Rail Wars needs internet',network:'📶 No connection',update:'⬆️ Update the game first'}[r&&r.err]||'⚠️ Could not send the train',2600);
  T().rwSend();D=r;T().toast('🚆 '+GN(r.mine[r.mine.length-1].g)+' train sent! Back in 30 min – keep it safe!',2600);render();}
async function attack(id){if(busy)return;if(D&&D.atks<=0)return T().toast('⚔️ No attacks left today ('+AMX()+' a day)',2200);busy=true;await O().sync();const r=await O().call('rwatk',{id});busy=false;
  if(!r||!r.ok){T().toast({no_atks:'⚔️ No attacks left today ('+AMX()+' a day)',gone:'🚆 That train is gone – pick another',no_team:'⚔️ You need a battle team first',network:'📶 No connection'}[r&&r.err]||'⚠️ Could not attack',2600);load(true);return;}
  if(r.win){const G=T().G;G.st=G.st||{};G.st.w=(G.st.w||0)+1;T().save();}   // v16-174: attacks won (RAIL RAIDER)
  if(r.steal)give(r.steal);
  r.bg='img/rw/rw_battle.webp';r.rwH=r.win?(r.steal?'<div class="rw2"><div>'+TI()+' +'+T().nf(r.steal)+' stolen</div></div>':''):'<div class="pts" style="font-size:15px;color:#ffab91">The train got away</div>';
  r.onEnd=()=>{open();load(true);};el.classList.remove('open');O().play(r,false);}
// v16-169 (Marius 22 nov, Alex 700→200): the Street Shop asks YES / NO before it spends, keeps the last 20 purchases
// (shown under the shop) and tells the server (event 'stshop' on the player card in /admin).
function buy(k){const s=S(),it=SHOP.find(x=>x[0]===k);if(!it)return;if(s.tok<it[1])return T().toast(TI()+' Not enough Street Tokens ('+T().nf(it[1])+')',2200);
  if(!el||el.querySelector('.stCf'))return;const c=document.createElement('div');c.className='stCf';
  c.innerHTML='<div class="box"><div class="ic">'+itIcon(k)+'</div><b>Buy 1 '+itName(k)+'?</b><span>for '+TI()+' '+T().nf(it[1])+' Street Tokens</span><div class="bt"><button data-c="0">NO</button><button class="g" data-c="1">YES, BUY</button></div></div>';
  c.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-c]');if(!b&&e.target!==c)return;c.remove();if(b&&b.dataset.c==='1')buyNow(k);});el.appendChild(c);}
function buyNow(k){const s=S(),it=SHOP.find(x=>x[0]===k);if(!it||s.tok<it[1])return;
  s.tok-=it[1];if(k[0]==='k'){if(window.DGK)DGK.add(k.slice(2),1);}else if(k==='ess')T().giveRw({ess:essN()});else T().giveRw({[k]:1});
  (s.log=s.log||[]).unshift([Date.now(),k,it[1],s.tok]);s.log=s.log.slice(0,20);
  T().save();T().toast(itIcon(k)+' +1 '+itName(k),2200);render();
  try{if(O())O().call('stbuy',{k,p:it[1],left:s.tok});}catch(e){}}
function logH(st){if(!st.log||!st.log.length)return '';const d=t=>new Date(t).toLocaleString([],{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
  return '<div class="stS">YOUR PURCHASES</div><div class="card">'+st.log.map(([t,k,p,l])=>'<div class="hl">'+d(t)+' · '+itName(k)+' · −'+TI()+' '+T().nf(p)+' <small>(left '+T().nf(l)+')</small></div>').join('')+'</div>';}
function trainImg(g,w,me){return '<img class="tr" src="img/rw/'+(me&&RP()?'loco_gold':'loco'+g)+'.webp" alt=""'+(w?' style="width:'+w+'"':'')+'>';}
function render(){if(!el||!el.classList.contains('open')||rfBusy)return;const G=T().G,body=document.getElementById('stBody'),now=Date.now(),st=S();let h='';
  h+='<div class="stBal">'+TI()+'<b>'+T().nf(st.tok)+'</b><span>STREET TOKENS<br>for the Street Shop</span></div>';
  if(RP())h+='<div class="rpOn"><img src="img/rw/rail_baron.webp" alt=""><div><b>RAIL PASS ACTIVE</b><small>4 trains · 7 attacks · 3 refreshes · 45 min fill · ×1.3 tokens · robbed = lose half</small></div></div>';
  else if(RPV())h+='<div class="rpAd" data-s="rp"><img src="img/rw/rail_pass_bnr.webp" alt=""><div><b>+1 TRAIN · +2 ATTACKS · ×1.3 TOKENS</b><em>RAIL PASS · €4.99 / month ›</em></div></div>';
  if(!(G.lv.rail>0)){body.innerHTML=h+'<div class="card off">🚆 Build the RAIL TERMINAL (next to the Car Factory) to join RAIL WARS.</div>'+shopH(st);return;}
  const s=T().RWS(),cap=T().rCap(),full=s.n>=cap,w=T().rwW(),ws=w.reduce((a,b)=>a+b,0);
  h+='<div class="stS">YOUR TRAIN</div><div class="card" style="--gc:'+GC(s.g)+'">'+trainImg(s.g,0,1)+'<div class="gr">'+GN(s.g)+'</div>';
  h+='<div class="bar"><i style="width:'+(s.n/cap*100)+'%"></i></div><div class="ln"><span>Cars</span><b>'+s.n+' / '+cap+(full?' · FULL':' · next: '+T().rwNextTxt())+'</b></div>';
  h+='<div class="ln"><span>Brings when full</span><b>'+TI()+' '+T().nf(T().rwTok(s.g,cap))+'</b></div>';
  h+='<div class="ln"><span>Sends today</span><b>'+(D&&D.ok?D.sends+' / '+D.sendMax:'–')+'</b></div>';
  const mx=RFM();h+='<div class="btns"><button class="y'+(s.rf>=mx?' dis':'')+'" data-s="rf">'+(s.rf>=mx?'🔒 LOCKED':'🔄 REFRESH '+(mx-s.rf)+'/'+mx)+'</button><button class="g'+(full&&!(D&&D.ok&&D.sends<=0)?'':' dis')+'" data-s="send">🚆 SEND</button></div>';
  h+='<div class="stN" style="margin:8px 0 0">Grade chances (Car Wash + Gas Station + Car Factory levels): '+w.map((x,i)=>'<span style="color:'+GC(i)+'">'+(x/ws*100).toFixed(i>3?1:0)+'%</span>').join(' · ')+'</div></div>';
  if(!D){body.innerHTML=h+'<div class="card off">📶 Loading…</div>'+shopH(st);return;}
  if(!D.ok){body.innerHTML=h+'<div class="card off">'+({offline:'📶 Rail Wars needs internet',update:'⬆️ Update the game to play Rail Wars',banned:'🚫 Account blocked'}[D.err]||'📶 No connection – try again later')+'</div>'+shopH(st);return;}
  if(D.mine.length){h+='<div class="stS">ON THE WAY</div>'+D.mine.map(t=>'<div class="rwr" style="--gc:'+GC(t.g)+'">'+trainImg(t.g,'74px').replace('class="tr"','class="mini"')+'<div class="who"><span class="gn">'+GN(t.g)+'</span> · '+TI()+' '+T().nf(t.tok-t.lost)+
    '<small>'+(t.t1>now?'arrives in '+left(t.t1-now):'arrived!')+(t.hits?' · robbed '+t.hits+'× (−'+T().nf(t.lost)+')':' · not robbed')+'</small></div></div>').join('');}
  h+='<div class="stS">ATTACK A TRAIN</div><div class="stN">Win the fight = steal '+Math.round(D.steal*100)+'% of what is on the train. Attacks today: <b style="color:#fff">'+D.atks+' / '+D.atkMax+'</b> · each train can be robbed '+D.hitMax+'×</div>';
  h+=D.targets.length?D.targets.map(t=>'<div class="rwr" style="--gc:'+GC(t.g)+'">'+trainImg(t.g,'74px').replace('class="tr"','class="mini"')+'<div class="who">'+esc(t.who.name)+'<small><span class="gn">'+GN(t.g)+'</span> · '+(window.PWI||'⚡')+' '+T().nf(t.who.pow||0)+' · '+left(t.t1-now)+'</small><small>'+TI()+' steal ~'+T().nf(Math.floor(t.left*D.steal))+'</small></div><button class="r'+(D.atks>0?'':' dis')+'" data-s="atk" data-i="'+t.id+'">⚔️ ATTACK</button></div>').join('')
    :'<div class="card off" style="font-size:13px">No trains on the way right now – try again in a few minutes.</div>';
  h+='<div class="btns"><button class="y" data-s="list">🔄 NEW TRAINS</button></div>';
  if(D.hits.length){h+='<div class="stS">ATTACKS ON YOUR TRAINS</div><div class="card">'+D.hits.map(x=>'<div class="hl">'+esc(x.an)+' attacked your <span style="color:'+GC(x.g)+'">'+GN(x.g)+'</span> train – '+(x.win?'<b>stole '+T().nf(x.steal)+'</b>':'<b class="ok">your team won</b>')+'</div>').join('')+'</div>';}
  body.innerHTML=h+shopH(st);}
function shopH(st){return '<div class="stS">STREET SHOP</div><div class="stSh">'+SHOP.map(([k,p])=>'<div class="stI"><div class="ic">'+itIcon(k)+'</div><div class="nm">'+itName(k)+'</div><button class="g'+(st.tok<p?' dis':'')+'" data-s="buy" data-k="'+k+'">'+TI()+' '+T().nf(p)+'</button></div>').join('')+'</div>'+logH(st);}
function open(){build();el.classList.add('open');render();load();clearInterval(open.t);open.t=setInterval(()=>{if(!el.classList.contains('open')){clearInterval(open.t);return;}
  const now=Date.now();if(D&&D.mine&&D.mine.some(t=>t.t1<=now))load(true);else render();},1000);}
// a row for the building panels (Car Wash, Gas Station, Car Factory, Rail Terminal)
function row(id){if(!T()||!T().G)return '';const s=S();return '<div class="row stRow" data-street="1"><span>🚆 RAIL WARS</span><b>'+TI()+' '+T().nf(s.tok)+'</b><em>OPEN ›</em></div>';}
window.STREET={open,row,give,state:S,canSend:()=>{try{const s=T().RWS(),cap=T().rCap();return s.n>=cap&&!(D&&D.ok&&D.sends<=0);}catch(e){return false;}}}; // v16-257: red dot SEND on the side button
function boot(){if(!T()||!T().G){setTimeout(boot,600);return;}S();document.addEventListener('click',e=>{if(e.target.closest('[data-street]'))open();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
