// Torque Empire – v16-146 BUSINESS STREET EVENT (Marius, 21 nov 2026)
// "Car Wash, Gas Station and Car Factory get their own event: they produce a NEW event coin, a higher level produces more,
//  and a separate Shop sells Dungeon keys, tickets and Essence." + the Rail Terminal (index.html) gives tokens for every exported car.
// - The event runs 3 days, then 3 days off, again and again (same clock as the other events: E0 = 20 nov 2026).
// - While it runs, every built street building makes Street Tokens per hour (also while the game is closed, max 12 h at a time).
// - Tokens NEVER expire. The Street Shop is always open; its limits reset with every new event.
// - Milestone rewards for the tokens made in this event (no ranking for now – the server does not know this event yet).
(function(){
const T=()=>window.__TE;
const E0=Date.UTC(2026,10,20),DUR=3*864e5,MAXOFF=12*36e5;
const TOK='img/ui12/st_token.webp',TI=(e)=>'<img class="tki stTok" src="'+TOK+'" alt=""'+(e?' style="height:'+e+'"':'')+'>';
const B={wash:{n:'Car Wash',b:12},gas:{n:'Gas Station',b:16},factory:{n:'Car Factory',b:24}};
const rate=id=>{const G=T().G;if(!(G.lv[id]>0))return 0;return Math.round(B[id].b*(1+.08*(T().lvT(id)-1)));};
const rateAll=()=>Object.keys(B).reduce((a,k)=>a+rate(k),0);
const perCar=()=>{const G=T().G;return G.lv.rail>0?3+Math.floor(T().lvT('rail')/4):0;};
const win=t=>{const i=Math.floor(((t||Date.now())-E0)/DUR);return {i,on:i%2===0,start:E0+i*DUR,end:E0+(i+1)*DUR,cyc:Math.floor(i/2),id:'st'+i};};
const MS=[[400,{dm:40}],[1200,{tk:2}],[2500,{dm:80,ct:2}],[5000,{gt:3}],[8000,{dm:150,tk:3}],[12000,{dm:250,tk:5}]];
const DGN={vault:'Vault',mine:'Scrap Mine',forge:'Forge',lab:'Lab'};
const SHOP=[['k_vault',350,3],['k_mine',350,3],['k_forge',350,3],['k_lab',350,3],['tk',600,5],['gt',450,5],['ct',300,5],['ess',250,10]];
const essN=()=>Math.round((T().ESS_U?T().ESS_U():300)*2);
function itIcon(k){if(k[0]==='k')return '<img class="tki" src="img/dg/k_'+k.slice(2)+'.webp" alt="">';if(k==='tk')return '<img class="tki" src="img/ticket.webp" alt="">';if(k==='ct')return '<img class="tki" src="img/cticket.webp" alt="">';if(k==='gt')return '<img class="tki" src="img/gticket.webp" alt="">';return T().ESI;}
function itName(k){if(k[0]==='k')return DGN[k.slice(2)]+' Key';return {tk:'Recruit Ticket',gt:'Gear Ticket',ct:'Crew Ticket',ess:T().nf(essN())+' Essence'}[k];}
function S(){const G=T().G;if(!G.st)G.st={tok:0,last:Date.now(),eid:'',earn:0,cl:[],cyc:-1,got:{}};const s=G.st,w=win();
  if(s.eid!==w.id&&w.on){s.eid=w.id;s.earn=0;s.cl=[];}
  if(s.cyc!==w.cyc){s.cyc=w.cyc;s.got={};}
  return s;}
// production: credit the time since the last tick that falls inside an event window
function tick(){if(!T()||!T().G)return;const s=S(),now=Date.now();let a=Math.max(s.last||now,now-MAXOFF),add=0;const r=rateAll();
  while(a<now&&r>0){const w=win(a),b=Math.min(now,w.end);if(w.on){add+=r*(b-a)/36e5;}a=b;}
  s.last=now;if(add>0){s.part=(s.part||0)+add;const n=Math.floor(s.part);if(n>0){s.part-=n;give(n);}}}
function give(n){const s=S();s.tok+=n;if(win().on)s.earn+=n;dot();if(el&&el.classList.contains('open'))render();}
function rail(n){if(!win().on||!n)return 0;const t=n*perCar();if(t)give(t);return t;}
const canClaim=()=>{if(!T()||!T().G)return false;const s=S();return win().on&&MS.some((m,i)=>!s.cl.includes(i)&&s.earn>=m[0]);};
function dot(){if(window.EVT&&EVT.dot)try{EVT.dot();}catch(e){}}
// ---------------- page
const css=`#st{position:fixed;inset:0;z-index:59;display:none;flex-direction:column;background:linear-gradient(#08202b,#0a1018 40%,#070b11);color:#fff;font-family:Lilita,Game,system-ui;overflow:hidden}
#st.open{display:flex}#st .stTop{flex:none;display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top) + 6px) 8px 6px}
#st .stX{width:40px;height:40px;border:0;border-radius:12px;background:linear-gradient(#ffcf4a,#e08a00);font:900 20px Game,system-ui;color:#3a1c00;box-shadow:0 3px 0 #6b3d00}
#st .stTi{flex:1;text-align:center;margin-right:50px;font-size:min(6.5vw,28px);letter-spacing:1px;color:#ffe082;text-shadow:0 2px 0 #6b3d00,0 0 14px #ffb30088}
#st .stB{flex:1;overflow:auto;padding:0 10px calc(env(safe-area-inset-bottom) + 18px)}
#st .stBan{position:relative;border-radius:14px;overflow:hidden;box-shadow:0 6px 14px #000a,inset 0 0 0 2px #ffc10766}#st .stBan img{display:block;width:100%}
#st .stTm{position:absolute;left:50%;bottom:5%;transform:translateX(-50%);padding:5px 14px;border-radius:12px;background:#000c;font-size:15px;color:#ffd54a;white-space:nowrap;box-shadow:inset 0 0 0 1.5px #ffc10788}
#st .stBal{display:flex;align-items:center;justify-content:center;gap:10px;margin:12px 0 4px;padding:10px;border-radius:16px;background:linear-gradient(#123847,#0b1c26);box-shadow:inset 0 0 0 2px #4dd0e1aa,0 4px 10px #0008}
#st .stBal .stTok{height:46px}#st .stBal b{font-size:34px;font-weight:400;text-shadow:0 2px 0 #000,0 0 12px #4dd0e1}#st .stBal span{font-size:13px;color:#b2ebf2;line-height:1.2}
#st .stS{margin:16px 0 6px;text-align:center;font-size:15px;letter-spacing:1px;color:#ffe082;text-shadow:0 2px 0 #000}#st .stN{margin:-2px 0 8px;text-align:center;font:700 11.5px Game,system-ui;color:#90a4ae;line-height:1.4}
#st .stR{display:flex;align-items:center;gap:8px;margin:5px 0;padding:8px 12px;border-radius:12px;background:#13222e;box-shadow:inset 0 0 0 1px #2e4a5c;font-size:14px}#st .stR span{flex:1}#st .stR b{font-weight:400;color:#80deea}#st .stR.off{opacity:.55}
#st .tki{height:1.3em;width:auto;vertical-align:-.3em}
#st .stM{display:flex;align-items:center;gap:8px;margin:6px 0;padding:8px 8px 8px 12px;border-radius:14px;background:linear-gradient(#1d2f3d,#111c25);box-shadow:inset 0 0 0 1.5px #37586c}
#st .stM.ok{box-shadow:inset 0 0 0 2px #ffd54a}#st .stM.done{opacity:.5}#st .stM .g{min-width:74px;font-size:15px;color:#ffe082}#st .stM .r{flex:1;font-size:15px}#st .stM .r .tki{height:1.5em}
#st .stPb{height:7px;margin-top:4px;border-radius:4px;background:#0006;overflow:hidden}#st .stPb i{display:block;height:100%;background:linear-gradient(90deg,#26c6da,#ffe082)}
#st button.stG{--bh:38px;flex:none;width:86px;height:38px;padding:0 4px;border-style:solid;border-color:transparent;border-width:0;border-image:url(img/ui8/btn_green_s.webp) 0 100 fill/0 calc(var(--bh)*1.08) stretch;background:none;font:400 15px Lilita,Game,system-ui;color:#062b0c;text-shadow:0 1px 0 #fff6}
#st button.stG.dis{border-image-source:url(img/ui8/btn_grey_s.webp);color:#cfd8dc;text-shadow:0 2px 0 #000}
#st .stSh{display:grid;grid-template-columns:1fr 1fr;gap:8px}#st .stI{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px 8px;border-radius:14px;background:linear-gradient(#1a2c3a,#0f1922);box-shadow:inset 0 0 0 1.5px #3a5d72,0 4px 8px #0007}
#st .stI .ic .tki{height:52px;filter:drop-shadow(0 3px 3px #000)}#st .stI .nm{font-size:14px;text-align:center;line-height:1.1}#st .stI .lm{font:700 11px Game,system-ui;color:#90a4ae}
#st .stI button{width:100%;max-width:130px}#st .stI button .tki{height:1.25em}#st .stI.sold{opacity:.5}`;
let el;
function build(){if(el)return;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);el=document.createElement('div');el.id='st';
  el.innerHTML='<div class="stTop"><button class="stX" data-s="x">↩</button><div class="stTi">BUSINESS STREET</div></div><div class="stB" id="stBody"></div>';document.body.appendChild(el);
  el.addEventListener('click',e=>{const t=e.target.closest('[data-s]');if(!t)return;const a=t.dataset.s;
    if(a==='x'){el.classList.remove('open');dot();}
    else if(a==='cl')claim(+t.dataset.i);
    else if(a==='buy')buy(t.dataset.k);});}
const left=ms=>{const s=Math.max(0,ms/1000|0),d=s/86400|0,h=(s%86400)/3600|0,m=(s%3600)/60|0;return d?d+'d '+h+'h':h+'h '+String(m).padStart(2,'0')+'m';};
const rwH=r=>{const a=[],TK=k=>'<img class="tki" src="img/'+k+'.webp" alt="">';if(r.dm)a.push(T().DMI+' '+r.dm);if(r.tk)a.push(TK('ticket')+' '+r.tk);if(r.gt)a.push(TK('gticket')+' '+r.gt);if(r.ct)a.push(TK('cticket')+' '+r.ct);return a.join(' &nbsp;');};
function claim(i){const s=S(),m=MS[i];if(!m||!win().on||s.cl.includes(i)||s.earn<m[0])return;s.cl.push(i);T().giveRw(m[1]);T().save();T().toast('🎁 BUSINESS STREET: '+rwH(m[1]),2600);render();dot();}
function buy(k){const s=S(),it=SHOP.find(x=>x[0]===k);if(!it)return;const n=s.got[k]||0;
  if(n>=it[2])return T().toast('Sold out – the limit resets with the next Business Street event',2400);
  if(s.tok<it[1])return T().toast(TI()+' Not enough Street Tokens ('+T().nf(it[1])+')',2200);
  s.tok-=it[1];s.got[k]=n+1;
  if(k[0]==='k'){if(window.DGK)DGK.add(k.slice(2),1);}else if(k==='ess')T().giveRw({ess:essN()});else T().giveRw({[k]:1});
  T().save();T().toast(itIcon(k)+' +1 '+itName(k)+(k[0]==='k'?' (bonus key – it stacks)':''),2200);render();}
function render(){if(!el||!el.classList.contains('open'))return;tick();const s=S(),w=win(),G=T().G,body=document.getElementById('stBody');
  let h='<div class="stBan"><img src="img/ui12/street_ban.webp" alt=""><div class="stTm">'+(w.on?'⏳ ends in '+left(w.end-Date.now()):'💤 next event in '+left(w.end-Date.now()))+'</div></div>';
  h+='<div class="stBal">'+TI()+'<b>'+T().nf(s.tok)+'</b><span>STREET TOKENS<br>'+(w.on?'+'+T().nf(rateAll())+' / hour':'paused until the event')+'</span></div>';
  h+='<div class="stS">YOUR STREET</div><div class="stN">'+(w.on?'Your buildings make tokens every hour – also while the game is closed (max 12 h). Higher level = more tokens.':'Between events your buildings rest. Your tokens never expire – the shop stays open.')+'</div>';
  for(const k in B){const lv=G.lv[k]||0;h+='<div class="stR'+(lv?'':' off')+'"><span>'+B[k].n+(lv?' · LV '+T().lvT(k):' · not built')+'</span><b>'+(lv?'+'+rate(k)+' '+TI()+'/h':'—')+'</b></div>';}
  h+='<div class="stR'+(G.lv.rail>0?'':' off')+'"><span>Rail Terminal'+(G.lv.rail>0?' · LV '+T().lvT('rail'):' · not built')+'</span><b>'+(G.lv.rail>0?'+'+perCar()+' '+TI()+' per exported car':'—')+'</b></div>';
  if(w.on){h+='<div class="stS">EVENT REWARDS</div><div class="stN">Tokens made in this event: <b style="color:#fff">'+T().nf(s.earn)+'</b> (buying in the shop does not lower it)</div>';
    h+=MS.map((m,i)=>{const ok=s.earn>=m[0],got=s.cl.includes(i);return '<div class="stM'+(got?' done':ok?' ok':'')+'"><div class="g">'+TI()+' '+T().nf(m[0])+'</div><div class="r">'+rwH(m[1])+'<div class="stPb"><i style="width:'+Math.min(100,s.earn/m[0]*100)+'%"></i></div></div><button class="stG'+(ok&&!got?'':' dis')+'" data-s="cl" data-i="'+i+'">'+(got?'✓':'CLAIM')+'</button></div>';}).join('');}
  h+='<div class="stS">STREET SHOP</div><div class="stN">Limits reset with every new Business Street event.</div><div class="stSh">'+SHOP.map(([k,p,lim])=>{const n=s.got[k]||0,out=n>=lim;
    return '<div class="stI'+(out?' sold':'')+'"><div class="ic">'+itIcon(k)+'</div><div class="nm">'+itName(k)+'</div><div class="lm">'+n+' / '+lim+'</div><button class="stG'+(out||s.tok<p?' dis':'')+'" data-s="buy" data-k="'+k+'">'+(out?'SOLD OUT':TI()+' '+T().nf(p))+'</button></div>';}).join('')+'</div>';
  body.innerHTML=h;}
function open(){build();S();el.classList.add('open');render();clearInterval(open.t);open.t=setInterval(()=>{if(!el.classList.contains('open')){clearInterval(open.t);return;}render();},20000);}
// a row for the building panels (Car Wash, Gas Station, Car Factory, Rail Terminal)
function row(id){if(!T()||!T().G)return '';tick();const s=S(),w=win(),G=T().G,v=id==='rail'?(G.lv.rail>0?'+'+perCar()+' '+TI()+'/car':'—'):(G.lv[id]>0?'+'+rate(id)+' '+TI()+'/h':'—');
  return '<div class="row stRow" data-street="1"><span>'+TI()+' Street Tokens '+(w.on?'(event ON)':'(event off)')+'</span><b>'+v+'</b><em>you have '+T().nf(s.tok)+' · SHOP ›</em></div>';}
const tabHtml=()=>TI()+' BUSINESS STREET'+(win().on?'':' · '+left(win().end-Date.now()));
window.STREET={open,rail,tick,row,canClaim,on:()=>win().on,tabHtml,state:S};
function boot(){if(!T()||!T().G){setTimeout(boot,600);return;}S();tick();setInterval(tick,10000);
  document.addEventListener('click',e=>{if(e.target.closest('[data-street]'))open();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
