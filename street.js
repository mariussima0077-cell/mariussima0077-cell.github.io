// Torque Empire – v16-146 RAIL WARS + STREET SHOP (Marius, 21 nov 2026)
// "New cars from the factory fuel at the gas station, get washed and go up on the train; about once an hour the train is full and I SEND it.
//  Other players can attack my train (a fight like the Arena, but separate). Grade from the Car Wash / Gas Station / Car Factory levels,
//  refresh for a higher grade = more coins for the Shop." Decisions: permanent mode, 3 trains a day, 5 attacks a day, 2 refreshes then locked.
// The map part (export cars, train, grade, refresh) is in index.html (rwSend, rwRefresh, RWS); the fights + limits are on the server (op rw*).
// Street Tokens (G.st.tok) never expire. Shop prices are PROVISIONAL – Marius sets them later.
(function(){
const T=()=>window.__TE, O=()=>window.ONLINE;
const TOK='img/ui12/st_token.webp',TI=e=>'<img class="tki stTok" src="'+TOK+'" alt=""'+(e?' style="height:'+e+'"':'')+'>';
const DGN={vault:'Vault',mine:'Scrap Mine',forge:'Forge',lab:'Lab'};
const SHOP=[['k_vault',350],['k_mine',350],['k_forge',350],['k_lab',350],['tk',600],['gt',450],['ct',300],['ess',250]];   // PROVISIONAL prices
const essN=()=>Math.round((T().ESS_U?T().ESS_U():300)*2);
function itIcon(k){if(k[0]==='k')return '<img class="tki" src="img/dg/k_'+k.slice(2)+'.webp" alt="">';if(k==='tk')return '<img class="tki" src="img/ticket.webp" alt="">';if(k==='ct')return '<img class="tki" src="img/cticket.webp" alt="">';if(k==='gt')return '<img class="tki" src="img/gticket.webp" alt="">';return T().ESI;}
function itName(k){if(k[0]==='k')return DGN[k.slice(2)]+' Key';return {tk:'Recruit Ticket',gt:'Gear Ticket',ct:'Crew Ticket',ess:T().nf(essN())+' Essence'}[k];}
function S(){const G=T().G;if(!G.st)G.st={tok:0};return G.st;}
function give(n){if(!(n>0))return;S().tok+=n;T().save();}
const left=ms=>{const s=Math.max(0,ms/1000|0),h=s/3600|0,m=(s%3600)/60|0,x=s%60;return h?h+'h '+String(m).padStart(2,'0')+'m':m+':'+String(x).padStart(2,'0');};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const GN=g=>T().RW_GN[g], GC=g=>T().RW_GC[g];
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
#st .stSh{display:grid;grid-template-columns:1fr 1fr;gap:8px}#st .stI{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px 8px;border-radius:14px;background:linear-gradient(#1a2c3af0,#0f1922f0);box-shadow:inset 0 0 0 1.5px #3a5d72,0 4px 8px #0007}
#st .stI .ic .tki{height:50px;filter:drop-shadow(0 3px 3px #000)}#st .stI .nm{font-size:14px;text-align:center;line-height:1.1}#st .stI button{width:100%;max-width:130px}#st .stI button .tki{height:1.25em}
#st .off{text-align:center;padding:16px;color:#ffcc80;font-size:15px}`;
let el,D=null,busy=false;
function build(){if(el)return;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);el=document.createElement('div');el.id='st';
  el.innerHTML='<div class="stTop"><button class="stX" data-s="x">↩</button></div><div class="stB" id="stBody"></div>';document.body.appendChild(el);
  el.addEventListener('click',e=>{const t=e.target.closest('[data-s]');if(!t)return;const a=t.dataset.s;
    if(a==='x')close();else if(a==='rf')refresh();else if(a==='send')send();else if(a==='atk')attack(+t.dataset.i);else if(a==='list')load(true);else if(a==='buy')buy(t.dataset.k);});}
function close(){if(el)el.classList.remove('open');clearInterval(open.t);}
async function load(force){if(!O()){D={err:'offline'};render();return;}if(busy&&!force)return;busy=true;const r=await O().call('rw',{});busy=false;D=r;if(r&&r.ok)await claimAll();render();}
async function claimAll(){if(!D||!D.mine)return;const now=Date.now();for(const t of D.mine.filter(t=>t.t1<=now)){const r=await O().call('rwclaim',{id:t.id});
  if(r&&r.ok){give(r.tok);T().toast('🚆 Your '+GN(r.g)+' train arrived: +'+T().nf(r.tok)+' '+TI()+(r.lost?' (robbed: −'+T().nf(r.lost)+')':''),3200);D.mine=D.mine.filter(x=>x.id!==t.id);}}}
function refresh(){const s=T().RWS();if(s.rf>=2)return T().toast('🔒 This train grade is locked (2 refreshes used)',2200);const g0=s.g;T().rwRefresh();
  T().toast(s.g>g0?'✨ Upgraded to '+GN(s.g)+'!':'🔄 Still '+GN(s.g)+' – '+(2-s.rf)+' refresh left',2200);render();}
async function send(){const s=T().RWS(),cap=T().rCap();if(s.n<cap)return T().toast('🚆 The train is not full yet ('+s.n+' / '+cap+' cars)',2200);
  if(D&&D.ok&&D.sends<=0)return T().toast('🚆 No trains left today (3 a day)',2200);if(busy)return;busy=true;
  await O().sync();const r=await O().call('rwsend',{g:s.g,tok:T().rwTok(s.g,s.n),cars:s.n});busy=false;
  if(!r||!r.ok)return T().toast({no_sends:'🚆 No trains left today (3 a day)',offline:'📶 Rail Wars needs internet',network:'📶 No connection',update:'⬆️ Update the game first'}[r&&r.err]||'⚠️ Could not send the train',2600);
  T().rwSend();D=r;T().toast('🚆 '+GN(r.mine[r.mine.length-1].g)+' train sent! Back in 30 min – keep it safe!',2600);render();}
async function attack(id){if(busy)return;if(D&&D.atks<=0)return T().toast('⚔️ No attacks left today (5 a day)',2200);busy=true;await O().sync();const r=await O().call('rwatk',{id});busy=false;
  if(!r||!r.ok){T().toast({no_atks:'⚔️ No attacks left today (5 a day)',gone:'🚆 That train is gone – pick another',no_team:'⚔️ You need a battle team first',network:'📶 No connection'}[r&&r.err]||'⚠️ Could not attack',2600);load(true);return;}
  if(r.steal)give(r.steal);
  r.bg='img/rw/rw_battle.webp';r.rwH=r.win?(r.steal?'<div class="rw2"><div>'+TI()+' +'+T().nf(r.steal)+' stolen</div></div>':''):'<div class="pts" style="font-size:15px;color:#ffab91">The train got away</div>';
  r.onEnd=()=>{open();load(true);};el.classList.remove('open');O().play(r,false);}
function buy(k){const s=S(),it=SHOP.find(x=>x[0]===k);if(!it)return;if(s.tok<it[1])return T().toast(TI()+' Not enough Street Tokens ('+T().nf(it[1])+')',2200);
  s.tok-=it[1];if(k[0]==='k'){if(window.DGK)DGK.add(k.slice(2),1);}else if(k==='ess')T().giveRw({ess:essN()});else T().giveRw({[k]:1});
  T().save();T().toast(itIcon(k)+' +1 '+itName(k),2200);render();}
function trainImg(g,w){return '<img class="tr" src="img/rw/loco'+g+'.webp" alt=""'+(w?' style="width:'+w+'"':'')+'>';}
function render(){if(!el||!el.classList.contains('open'))return;const G=T().G,body=document.getElementById('stBody'),now=Date.now(),st=S();let h='';
  h+='<div class="stBal">'+TI()+'<b>'+T().nf(st.tok)+'</b><span>STREET TOKENS<br>for the Street Shop</span></div>';
  if(!(G.lv.rail>0)){body.innerHTML=h+'<div class="card off">🚆 Build the RAIL TERMINAL (next to the Car Factory) to join RAIL WARS.</div>'+shopH(st);return;}
  const s=T().RWS(),cap=T().rCap(),full=s.n>=cap,w=T().rwW(),ws=w.reduce((a,b)=>a+b,0);
  h+='<div class="stS">YOUR TRAIN</div><div class="card" style="--gc:'+GC(s.g)+'">'+trainImg(s.g)+'<div class="gr">'+GN(s.g)+'</div>';
  h+='<div class="bar"><i style="width:'+(s.n/cap*100)+'%"></i></div><div class="ln"><span>Cars</span><b>'+s.n+' / '+cap+(full?' · FULL':' · next in ~'+Math.max(1,Math.round((60/cap)))+' min')+'</b></div>';
  h+='<div class="ln"><span>Brings when full</span><b>'+TI()+' '+T().nf(T().rwTok(s.g,cap))+'</b></div>';
  h+='<div class="ln"><span>Sends today</span><b>'+(D&&D.ok?D.sends+' / '+D.sendMax:'–')+'</b></div>';
  h+='<div class="btns"><button class="y'+(s.rf>=2?' dis':'')+'" data-s="rf">'+(s.rf>=2?'🔒 LOCKED':'🔄 REFRESH '+(2-s.rf)+'/2')+'</button><button class="g'+(full&&!(D&&D.ok&&D.sends<=0)?'':' dis')+'" data-s="send">🚆 SEND</button></div>';
  h+='<div class="stN" style="margin:8px 0 0">Grade chances (Car Wash + Gas Station + Car Factory levels): '+w.map((x,i)=>'<span style="color:'+GC(i)+'">'+(x/ws*100).toFixed(i>3?1:0)+'%</span>').join(' · ')+'</div></div>';
  if(!D){body.innerHTML=h+'<div class="card off">📶 Loading…</div>'+shopH(st);return;}
  if(!D.ok){body.innerHTML=h+'<div class="card off">'+({offline:'📶 Rail Wars needs internet',update:'⬆️ Update the game to play Rail Wars',banned:'🚫 Account blocked'}[D.err]||'📶 No connection – try again later')+'</div>'+shopH(st);return;}
  if(D.mine.length){h+='<div class="stS">ON THE WAY</div>'+D.mine.map(t=>'<div class="rwr" style="--gc:'+GC(t.g)+'">'+trainImg(t.g,'74px').replace('class="tr"','class="mini"')+'<div class="who"><span class="gn">'+GN(t.g)+'</span> · '+TI()+' '+T().nf(t.tok-t.lost)+
    '<small>'+(t.t1>now?'arrives in '+left(t.t1-now):'arrived!')+(t.hits?' · robbed '+t.hits+'× (−'+T().nf(t.lost)+')':' · not robbed')+'</small></div></div>').join('');}
  h+='<div class="stS">ATTACK A TRAIN</div><div class="stN">Win the fight = steal '+Math.round(D.steal*100)+'% of what is on the train. Attacks today: <b style="color:#fff">'+D.atks+' / '+D.atkMax+'</b> · each train can be robbed '+D.hitMax+'×</div>';
  h+=D.targets.length?D.targets.map(t=>'<div class="rwr" style="--gc:'+GC(t.g)+'">'+trainImg(t.g,'74px').replace('class="tr"','class="mini"')+'<div class="who">'+esc(t.who.name)+'<small><span class="gn">'+GN(t.g)+'</span> · ⚡ '+T().nf(t.who.pow||0)+' · '+left(t.t1-now)+'</small><small>'+TI()+' steal ~'+T().nf(Math.floor(t.left*D.steal))+'</small></div><button class="r'+(D.atks>0?'':' dis')+'" data-s="atk" data-i="'+t.id+'">⚔️ ATTACK</button></div>').join('')
    :'<div class="card off" style="font-size:13px">No trains on the way right now – try again in a few minutes.</div>';
  h+='<div class="btns"><button class="y" data-s="list">🔄 NEW TRAINS</button></div>';
  if(D.hits.length){h+='<div class="stS">ATTACKS ON YOUR TRAINS</div><div class="card">'+D.hits.map(x=>'<div class="hl">'+esc(x.an)+' attacked your <span style="color:'+GC(x.g)+'">'+GN(x.g)+'</span> train – '+(x.win?'<b>stole '+T().nf(x.steal)+'</b>':'<b class="ok">your team won</b>')+'</div>').join('')+'</div>';}
  body.innerHTML=h+shopH(st);}
function shopH(st){return '<div class="stS">STREET SHOP</div><div class="stSh">'+SHOP.map(([k,p])=>'<div class="stI"><div class="ic">'+itIcon(k)+'</div><div class="nm">'+itName(k)+'</div><button class="g'+(st.tok<p?' dis':'')+'" data-s="buy" data-k="'+k+'">'+TI()+' '+T().nf(p)+'</button></div>').join('')+'</div>';}
function open(){build();el.classList.add('open');render();load();clearInterval(open.t);open.t=setInterval(()=>{if(!el.classList.contains('open')){clearInterval(open.t);return;}
  const now=Date.now();if(D&&D.mine&&D.mine.some(t=>t.t1<=now))load(true);else render();},1000);}
// a row for the building panels (Car Wash, Gas Station, Car Factory, Rail Terminal)
function row(id){if(!T()||!T().G)return '';const s=S();return '<div class="row stRow" data-street="1"><span>🚆 RAIL WARS · '+TI()+' '+T().nf(s.tok)+'</span><b>OPEN ›</b></div>';}
window.STREET={open,row,give,state:S};
function boot(){if(!T()||!T().G){setTimeout(boot,600);return;}S();document.addEventListener('click',e=>{if(e.target.closest('[data-street]'))open();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
