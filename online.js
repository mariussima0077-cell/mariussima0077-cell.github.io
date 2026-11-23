// Torque Empire v16-45 – ONLINE: live battle ranking · world chat (auto-translated) · ARENA PvP · TORQUE CUP · player profile.
// Everything is decided by the Torque Guard bot (server/online.js). Here: the pages, the polling and the arena fight animation.
(function(){
'use strict';
const T=()=>window.__TE, C=()=>window.CAMPAIGN, $=id=>document.getElementById(id);
// v16-140: the game's icons instead of 💎 / 🎟 / ⚙️ / 🎫 emoji (one icon per resource everywhere)
const PWh=window.PWI||'⚡';
const DMh='<img class="tki" src="img/ui/diamond.svg" alt="">',TKh='<img class="tki" src="img/ticket.webp" alt="">',GTh='<img class="tki" src="img/gticket.webp" alt="">',CTh='<img class="tki" src="img/cticket.webp" alt="">';
const API=()=>window.SEC&&SEC.api(), PID=()=>window.SEC&&SEC.PID;
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){return null;}};
const LANG=(navigator.language||'en');
const esc=s=>String(s??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
const onD=p=>p&&p.on?'<i class="ond" title="online now"></i>':'';   // v16-189: green dot = online now (active in the last 10 min)
const flag=cc=>cc&&/^[A-Z]{2}$/.test(cc)?String.fromCodePoint(...[...cc].map(c=>127397+c.charCodeAt(0))):'';
const fmtN=n=>n>=1e9?(n/1e9).toFixed(n>=1e10?0:1)+'B':n>=1e6?(n/1e6).toFixed(n>=1e7?0:1)+'M':n>=1e4?Math.round(n/1e3)+'K':String(Math.round(n||0)).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
const toast=(m,d)=>{const t=T();if(t&&t.toast)t.toast(m,d||2600);};
const HI=id=>'img/hero/'+(/^m\d_\d+$/.test(id||'')?id:'m0_0')+'.webp';
const gradeOf=id=>{const m=/^[mdg](\d)_/.exec(id||'');return m?+m[1]:0;};
const dur=ms=>{ms=Math.max(0,ms);const h=Math.floor(ms/36e5),m=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);return h>=24?Math.floor(h/24)+'d '+h%24+'h':h?h+'h '+String(m).padStart(2,'0')+'m':m+'m '+String(s).padStart(2,'0')+'s';};
// v16-88: CV = this game version (number). The server refuses older versions (MIN_CV in server/online.js) → window 'UPDATE REQUIRED'.
const CV=232;
async function call(op,b){if(!API())return {err:'offline'};try{const r=await fetch(API()+'/api/on/'+op,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pid:PID(),cv:CV,...b})});const j=await r.json();if(j&&j.err==='update')needUpd();if(j&&j.err==='integrity')integMsg();if(j&&j.wipe&&window.SEC&&SEC.wipe)SEC.wipe();return j;}catch(e){return {err:'network'};}}
// v16-105: online modes only in the official app from Google Play on a real phone (Play Integrity) – the game itself stays playable
let integShown=0;function integMsg(){if(integShown)return;integShown=1;if(window.SEC&&SEC.integ)SEC.integ();const t=window.__TE;if(t&&t.toast)t.toast('🔒 Online modes work only in the official Torque Empire app from Google Play on a real (not rooted) phone.',5000);}
function needUpd(){if(document.getElementById('updNeed'))return;const d=document.createElement('div');d.id='updNeed';
  d.style.cssText='position:fixed;inset:0;z-index:100000;background:#000c;display:flex;align-items:center;justify-content:center;font-family:Game,system-ui';
  d.innerHTML='<div style="width:min(88vw,340px);background:linear-gradient(#2a1a10,#160d07);border:2px solid #ffb300;border-radius:18px;padding:18px 16px;text-align:center;color:#fff;box-shadow:0 10px 40px #000"><div style="font-size:34px">🔄</div><div style="font:900 19px Game,system-ui;color:#ffd54a;margin:4px 0">UPDATE REQUIRED</div><div style="font:700 13.5px Game,system-ui;color:#e0c6ad;margin-bottom:14px">A new version of Torque Empire is out.<br>Update to play online (Arena, Ranking, Chat, Cup).<br>Your progress is saved.</div><button id="updGo" style="width:100%;padding:13px;border:0;border-radius:14px;background:#66bb6a;color:#10240f;font:900 17px Game,system-ui">UPDATE NOW</button></div>';
  document.body.appendChild(d);
  d.querySelector('#updGo').onclick=()=>{const b=d.querySelector('#updGo');b.textContent='UPDATING…';b.disabled=true;try{window.TE&&TE().save&&TE().save();}catch(e){}try{(window.__TE&&__TE.save)&&__TE.save();}catch(e){}
    const go=()=>location.reload();if(!('serviceWorker' in navigator)){go();return;}
    navigator.serviceWorker.getRegistration().then(r=>{if(!r){go();return;}navigator.serviceWorker.addEventListener('controllerchange',go);r.update().then(()=>{if(!r.installing&&!r.waiting)go();}).catch(go);setTimeout(go,8000);}).catch(go);};}

// ------------------------------------------------------------------ titles, frames, leagues
const TT={gpc:['t5','GP CHAMPION','Grand Prix: #1 to finish all missions'],gpp:['t5','GP PODIUM','Grand Prix: #2-3 to finish all missions'],gpf:['t4','GP FINISHER','Grand Prix: Top 10 to finish all missions'],vip10:['t5','VIP LEGEND','Reach VIP 10'],vip5:['t3','VIP STAR','Reach VIP 5'],fdr:['t5','FOUNDER','Founder Pass (Shop)'],rail:['t4','RAIL BARON','Rail Pass active (Shop)'],king:['t5','TORQUE KING','Be #1 of the campaign on your server'],cup:['t5','CUP CHAMPION','Win a Weekend Cup'],leg:['t4','ARENA LEGEND','Reach LEGEND in the Arena'],glad:['t4','ARENA GLADIATOR','Reach GOLD in the Arena'],awl:['t5','ARENA WARLORD','Arena Shop (2,000 medals)'],
 boss:['t3','BOSS SLAYER','Reach campaign stage 3-21'],gear:['t3','GEAR GURU','Own a Legendary gear item'],speed:['t2','SPEED DEMON','Reach Reputation 10'],chat:['t2','GARAGE TALKER','Write 100 chat messages'],wr:['t1','WRENCH MASTER','Reach campaign stage 2-11'],rook:['t0','ROOKIE','Start the game'],
 // v16-174: 12 new titles (Marius: more titles on the profile) – kept forever once reached (G.ttl)
 sky:['t5','SKY BREAKER','Reach floor 500 in Torque Tower'],awk:['t5','AWAKENED','Awaken a Mythic hero'],bhunt:['t4','BOSS HUNTER','Claim the last World Boss reward of a day'],dgm:['t4','DUNGEON MASTER','Reach floor 50 in all 4 Dungeons'],
 trny:['t4','TRAIN TYCOON','Send 100 trains in Rail Wars'],raid:['t4','RAIL RAIDER','Win 50 train attacks in Rail Wars'],hard:['t4','HARDCORE','Reach HARD MODE stage 4-10'],coll:['t3','COLLECTOR','Own 10 classic cars in the Collection Garage'],
 lucky:['t3','LUCKY STAR','Own a Mythic hero'],twr:['t3','TOWER CLIMBER','Reach floor 100 in Torque Tower'],gty:['t3','GARAGE TYCOON','Get a building to level 50'],daily:['t2','DAILY GRINDER','Check in 30 days']};
const TORD=['gpc','gpp','gpf','fdr','rail','king','cup','awl','sky','awk','leg','bhunt','dgm','trny','raid','hard','glad','coll','lucky','twr','gty','boss','gear','speed','daily','chat','wr','rook'];
const GPB={gpc:1,gpp:2,gpf:3};   // v16-230: Grand Prix Top 10 badges (Marius' pictures) in front of the title
const tt=k=>{const x=TT[k]||TT.rook;return `<i class="tt ${x[0]}">${GPB[k]?`<img src="img/gp/top${GPB[k]}.webp" alt="" style="width:1.3em;height:1.3em;vertical-align:-.3em;margin-right:2px">`:''}${x[1]}</i>`;};
// v16-228 Grand Prix Top 10 name colours: 1 gold (#1) · 2 silver (#2-3) · 3 purple (#4-10)
const nmc=p=>p&&p.nc?`<span class="gpN gpN${p.nc|0}">${esc(p.name)}</span>`:esc(p&&p.name);
(function(){try{const st=document.createElement('style');st.textContent='.gpN1{background:linear-gradient(90deg,#fff3a8,#ffbf1a,#fff8d0,#ffbf1a);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent!important;animation:gpNs 2.4s linear infinite;font-weight:900}.gpN2{color:#dfe7ef!important;text-shadow:0 0 6px #b8c7d6;font-weight:900}.gpN3{color:#c99bff!important;text-shadow:0 0 6px #8a4dff;font-weight:900}@keyframes gpNs{to{background-position:-250% 0}}';document.head.appendChild(st);}catch(e){}})();
const FR=[[0,'Common','Free'],[1,'Uncommon','Reputation 5'],[2,'Rare','VIP 3'],[3,'Epic','Arena GOLD or Arena Shop'],[4,'Legendary','VIP 7 or Arena DIAMOND'],[5,'Mythic','Arena LEGEND or a Cup win'],[7,'Founder','Founder Pass (Shop)'],[8,'VIP 10','Reach VIP 10'],
 [9,'Rail Baron','Win 50 train attacks in Rail Wars'],[10,'Tower Climber','Reach floor 300 in Torque Tower'],[11,'Boss Hunter','Claim the last World Boss reward of a day'],[12,'Dungeon Master','Reach floor 50 in all 4 Dungeons'],[13,'Collector','Own all 12 classic cars'],[14,'Awakened','Awaken a Mythic hero']];   // v16-174: 6 new frames (Marius' pictures, img/fr9-14)   // v16-122: 8 = VIP 10 frame (Marius' picture, img/fr8)
//   // v16-122: 7 = FOUNDER (img/fr7 – 6 is the Ascended gear frame)
const LG=[['BRONZE','#ffd8b0','#d0864a','#5a2a08','#e07a3a'],['SILVER','#ffffff','#b8c4d2','#4a5462','#7fd0ff'],['GOLD','#fffbe6','#ffc23a','#6a3a00','#ff3b3b'],['PLATINUM','#e8fffb','#5fe0c8','#0a4a44','#3fa7ff'],['DIAMOND','#e8f4ff','#5aa8ff','#0a2a6a','#c35cff'],['LEGEND','#fff1d0','#ff5a3c','#5a0a0a','#ffd54a']];
let bid=0;
function badge(i,num){i=Math.max(0,Math.min(5,i|0));return `<span class="lgb"><img src="img/ui3/lg${i}.webp" alt="${LG[i][0]}">${num!=null?`<b>${num}</b>`:''}</span>`;} // v16-49: Marius' league shields (img/ui3/lg0-5)
const medal=n=>{const g=['url(#olGold)','url(#olSilv)','url(#olBron)'][n-1];return `<svg class="md" viewBox="0 0 40 40"><path d="M12 0h7l1 14-6 2zM28 0h-7l-1 14 6 2z" fill="${['#ff3b3b','#3fa7ff','#4cd964'][n-1]}"/><circle cx="20" cy="24" r="14" fill="${g}" stroke="#3a1d00" stroke-width="2.5"/><text x="20" y="30" text-anchor="middle" font-family="Game,system-ui" font-weight="900" font-size="16" fill="#3a1d00">${n}</text></svg>`;};
const ring=(id,extra='')=>`<div class="ring r${gradeOf(id)} ${extra}" style="background-image:url(${HI(id)})"></div>`;
// v16-84: hero in Marius' grade frame (img/fr0-5, same window as the Team page) – opponent profile + My Arena team
const FIN5=[[8.5,17.5,83,61.5],[8.5,17.5,83,61.5],[8.5,18,83,61],[15.5,17.5,69,55],[14.5,20.5,71,50],[17.8,21.5,64.4,46.5]],FPL5=[[81,11],[81,11],[81,11],[73.5,9.5],[74.5,9.5],[74.5,9]];
const GRN=['Common','Uncommon','Rare','Epic','Legendary','Mythic'],GRC=['#b8c2cf','#6fe08a','#5fb6ff','#d48cff','#ffc23a','#ff5a5a'];
const hName=id=>{const t=T(),h=t&&t.HB&&t.HB[id];return h&&h.n?h.n:'';};
const fcard=(id,s,w=60)=>{const g=Math.max(0,Math.min(5,gradeOf(id))),r=FIN5[g],p=FPL5[g];
  return `<div class="hfc" style="width:${w}px"><div style="position:relative;width:100%;aspect-ratio:220/236"><img src="img/fr${g}.webp" alt="" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"><img src="${HI(id)}" alt="" style="position:absolute;left:${r[0]}%;top:${r[1]}%;width:${r[2]}%;height:${r[3]}%;object-fit:cover;border-radius:5%">${s?`<span style="position:absolute;left:20%;right:20%;top:${p[0]}%;height:${p[1]}%;display:flex;align-items:center;justify-content:center;font:900 10px Game,system-ui;color:#fff;text-shadow:0 1px 2px #000,0 0 4px #000">+${s}</span>`:''}</div><small style="display:block;font:800 9px/1.15 Game,system-ui;color:#fff;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(hName(id))}</small><small style="display:block;font:800 8px Game,system-ui;color:${GRC[g]}">${GRN[g].toUpperCase()}</small></div>`;};
const avf=(id,f)=>`<div class="f" style="background-image:url(img/fr${(f|0)>=7&&(f|0)<=14?f|0:Math.max(0,Math.min(5,f|0))}.webp)"></div><div class="p${(f|0)>=7&&(f|0)<=14?' p'+(f|0):''}" style="background-image:url(${HI(id)})"></div>`;
// v16-186: the chosen frame everywhere (Marius 22 nov: "am pus cadrul, nu îl văd nicăieri") – profile header, ranking, chat, Arena ranking, Cup
const FWIN={7:[17.5,17.5,23.5,28.5],8:[21.6,21.6,27.6,31.6],9:[21,21.3,28.3,29.7],10:[22,22.3,27,31.3],11:[19,19.3,29.7,27],12:[20,20.3,28.3,30.7],13:[19.7,20,28,29.7],14:[21,22,33.3,30]};
const fav=(id,f)=>`<div class="av fav">${avf(id,f)}</div>`;
const hdrAv=(id,f)=>{f=f|0;if(!f)return `<div class="pa">${avf(id,0)}</div>`;const fi=f>=7&&f<=14?f:Math.max(0,Math.min(5,f)),o=FWIN[fi]||[15,15,18,27],w=100-o[0]-o[1],h=100-o[2]-o[3],F=88*100/w,H=fi>=7?F:F*235/220,L=48-F*(o[0]+w/2)/100,Tp=50-H*(o[2]+h/2)/100;
  return `<div class="pa paf"><img class="hf" src="img/fr${fi}.webp" alt="" style="left:${L.toFixed(2)}%;top:${Tp.toFixed(2)}%;width:${F.toFixed(2)}%;height:${H.toFixed(2)}%"><div class="hp" style="left:${(L+F*o[0]/100).toFixed(2)}%;top:${(Tp+H*o[2]/100).toFixed(2)}%;width:${(F*w/100).toFixed(2)}%;height:${(H*h/100).toFixed(2)}%;background-image:url(${HI(id)})"></div></div>`;};
const stLab=b=>C()&&C().sLabel?C().sLabel(b):String(b);
const ICON={trophy:'<svg viewBox="0 0 64 64"><use href="#olTrophy"/></svg>',chat:'<svg viewBox="0 0 64 64"><use href="#olChat"/></svg>',arena:'<svg viewBox="0 0 64 64"><use href="#olSwords"/></svg>',cup:'<svg viewBox="0 0 64 64"><use href="#olCup"/></svg>',user:'<svg viewBox="0 0 64 64"><use href="#olUser"/></svg>'};

// ------------------------------------------------------------------ CSS
const css=`
#onl{position:fixed;inset:0;z-index:13;display:none;background:#05060a;color:#fff;font-family:Game,system-ui,-apple-system,Roboto,sans-serif;overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:pan-y}
#onl.open{display:block}#onl.solo .nav{display:none}#onl.solo .scr{bottom:0;padding-bottom:env(safe-area-inset-bottom)}
#onl *{box-sizing:border-box}
#onl .scr{position:absolute;top:0;left:0;right:0;bottom:calc(52px + env(safe-area-inset-bottom));display:none;flex-direction:column;overflow:hidden;padding-top:env(safe-area-inset-top)}
#onl .scr.on{display:flex;animation:olIn .3s cubic-bezier(.2,.9,.3,1.2)}
@keyframes olIn{from{opacity:0;transform:translateY(12px)}}
#onl .scr:before{content:"";position:absolute;inset:-40%;z-index:-1;background:conic-gradient(from 0deg,transparent 0 8%,var(--ray) 10% 13%,transparent 15% 25%,var(--ray) 27% 30%,transparent 32% 45%,var(--ray) 47% 50%,transparent 52% 64%,var(--ray) 66% 69%,transparent 71% 83%,var(--ray) 85% 88%,transparent 90%);animation:olSpin 40s linear infinite;-webkit-mask:radial-gradient(circle at 50% 30%,#000 0,transparent 55%);mask:radial-gradient(circle at 50% 30%,#000 0,transparent 55%)}
#onl .scr:after{content:"";position:absolute;inset:0;z-index:-2;background:var(--bg)}
@keyframes olSpin{to{transform:rotate(360deg)}}
#onl #olRank{--bg:radial-gradient(ellipse at 50% -10%,#5a3d0c,#1a1206 45%,#06070a);--ray:#ffc23a14}
#onl #olChat{--bg:radial-gradient(ellipse at 50% -10%,#0c3a5a,#071420 45%,#05070b);--ray:#3ac8ff10}
#onl #olArena{--bg:radial-gradient(ellipse at 50% -10%,#4b1c78,#160a26 45%,#06050b);--ray:#b77cff18}
#onl #olCupS{--bg:radial-gradient(ellipse at 50% -10%,#6a1414,#200808 45%,#070505);--ray:#ff5a3c16}
#onl #olProf{--bg:radial-gradient(ellipse at 50% -10%,#3a2a10,#14100a 45%,#06070a);--ray:#ffc23a14}
#onl .top{position:relative;display:flex;align-items:center;gap:7px;padding:10px 10px 9px;background:linear-gradient(#0009,#0000)}
#onl .top:after{content:"";position:absolute;left:8px;right:8px;bottom:0;height:2px;background:linear-gradient(90deg,transparent,#ffd54a,#fff6c8,#ffd54a,transparent);box-shadow:0 0 10px #ffc23a}
#onl .ttl{flex:1;display:flex;align-items:center;gap:7px;min-width:0}
#onl .ttl svg{width:32px;height:32px;flex:none;filter:drop-shadow(0 2px 3px #000)}
#onl .ttl h1{margin:0;white-space:nowrap;font:900 19px/1 Game,system-ui;letter-spacing:1px;background:linear-gradient(#fffbe6,#ffd54a 45%,#e08a00 60%,#ffcf5a);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 2px 0 #3a2200)}
#onl .ttl h1 small{display:block;font:800 9px Game,system-ui;letter-spacing:2px;-webkit-text-fill-color:#9fe3ff;margin-top:3px}
#onl .x{width:34px;height:34px;flex:none;border-radius:11px;border:0;background:linear-gradient(#ff7b6b,#c4180a 60%,#8a0c02);color:#fff;font:900 15px Game,system-ui;box-shadow:0 0 0 2px #0a0f15,0 0 0 3.5px #e0aa25,0 3px 6px #000,inset 0 1.5px 0 #fff6}
#onl .srv{font:900 10px Game,system-ui;color:#bff0ff;background:linear-gradient(#123a52,#0a1b28);border:1px solid #3fa7d6;border-radius:9px;padding:4px 7px;white-space:nowrap}
#onl .o-gift{position:relative;width:34px;height:34px;flex:none;border-radius:11px;border:0;background:linear-gradient(#fff1a8,#ffb300);box-shadow:0 0 0 2px #0a0f15,0 0 0 3.5px #e0aa25;font-size:18px;display:none;animation:olPulse 1.4s infinite}
#onl .o-gift.on{display:block}
#onl .o-gift i{position:absolute;right:-6px;top:-6px;min-width:17px;height:17px;border-radius:9px;background:#e53935;font:900 10px/17px Game,system-ui;color:#fff;font-style:normal;box-shadow:0 0 0 1.5px #fff}
#onl .tabs{display:flex;gap:6px;padding:9px 10px 6px}
#onl .tabs b{flex:1;position:relative;text-align:center;padding:8px 0;border-radius:11px;font:900 11px Game,system-ui;letter-spacing:.4px;background:linear-gradient(#25303f,#141b25);color:#8fa0b4;box-shadow:0 0 0 1px #33404f,inset 0 1px 0 #fff1;overflow:hidden;white-space:nowrap}
#onl .tabs b.on{background:linear-gradient(#fff1a8,#ffc928 45%,#e59400);color:#3a1d00;box-shadow:0 0 0 1.5px #7a4a00,0 0 12px #ffb30066,inset 0 1.5px 0 #fff9}
#onl .tabs b.on:after,#onl .shine:after{content:"";position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,#fff8,transparent);animation:olSh 3.2s ease-in-out infinite;pointer-events:none}
@keyframes olSh{0%,55%{left:-60%}100%{left:130%}}
/* v16-212 ARENA SHOP + REWARDS */
#onl #olArT{gap:4px}#onl #olArT b{font-size:10px;letter-spacing:.2px}
#onl #olAmDot{position:absolute;top:3px;right:4px;width:8px;height:8px;border-radius:50%;background:#ff3d3d;box-shadow:0 0 6px #f00;display:none}#onl #olAmDot.on{display:block}
#onl .asT{display:block;width:96%;max-width:440px;margin:4px auto 2px}
#onl .asHd{display:flex;flex-direction:column;align-items:center;gap:2px;margin:2px 10px 8px;padding:7px 10px;border-radius:12px;background:linear-gradient(#2a1546ee,#150a26ee);box-shadow:0 0 0 1.5px #e0a82e,inset 0 1px 0 #fff2}
#onl .asHd span{font:900 15px Game,system-ui;color:#ffe27a;text-shadow:0 2px 0 #000}#onl .asHd span .tki{width:26px;height:26px;vertical-align:-7px}#onl .asHd small{font:700 10.5px system-ui;color:#d9c8ff}
#onl .asG{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;padding:0 9px}
#onl .asC{position:relative;aspect-ratio:300/384;background:url(img/arena/as_card.webp) center/100% 100% no-repeat;display:flex;flex-direction:column;align-items:center;padding:13% 7% 0;text-align:center;animation:olIn .35s both}
#onl .asC .ic{width:46%;aspect-ratio:1;object-fit:contain;filter:drop-shadow(0 3px 3px #000a)}
#onl .asC b{font:900 10px/1.12 Game,system-ui;color:#fff;margin-top:3px;min-height:23px;display:flex;align-items:center;text-shadow:0 1px 0 #000}
#onl .asC small{font:700 9.5px system-ui;color:#d2b8ff;margin-top:1px}
#onl .asC button{position:absolute;left:12%;right:12%;bottom:8.5%;height:15%;border:0;border-radius:8px;font:900 11.5px Game,system-ui;color:#3a1d00;background:linear-gradient(#fff1a8,#ffc928 45%,#e59400);box-shadow:0 0 0 1.5px #7a4a00,inset 0 1px 0 #fff9;display:flex;align-items:center;justify-content:center;gap:2px;padding:0}
#onl .asC button .tki{width:15px;height:15px}#onl .asC button.off{filter:grayscale(.8) brightness(.75)}#onl .asC.sold{opacity:.6}
#onl .asLeg{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:8px 0;max-height:52vh;overflow:auto}#onl .asLeg div{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer}#onl .asLeg .ring{width:54px;height:54px}#onl .asLeg small{font:800 9.5px system-ui;color:#fff;text-align:center}
#onl .amTr{position:relative;margin:4px 8px 10px}#onl .amTr img{width:100%;display:block}#onl .amTr i{position:absolute;left:11.5%;top:31%;height:38%;border-radius:6px;background:linear-gradient(#ffe98a,#ffb300 55%,#d07a00);box-shadow:0 0 10px #ffc40099;transition:width .8s}
#onl .amTr span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding-left:8%;font:900 12px Game,system-ui;color:#fff;text-shadow:0 0 3px #000,0 2px 0 #000}
#onl .amR{display:flex;align-items:center;gap:8px;margin:0 10px 7px;padding:6px 9px;border-radius:13px;background:linear-gradient(#2a1546,#150a26);box-shadow:0 0 0 1.5px #6b4a9a,inset 0 1px 0 #fff1;animation:olIn .35s both}
#onl .amR.rdy{box-shadow:0 0 0 2px #ffc928,0 0 14px #ffb30077}#onl .amR.got{opacity:.55}
#onl .amR .ch{width:52px;height:44px;object-fit:contain;filter:drop-shadow(0 3px 3px #000a)}#onl .amR.rdy .ch{animation:amBob 1.2s ease-in-out infinite}
@keyframes amBob{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-4px) rotate(3deg)}}
#onl .amR .t{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}#onl .amR .t b{font:900 13px Game,system-ui;color:#ffe27a}#onl .amR .t small{font:700 11px system-ui;color:#fff}#onl .amR .t .tki{width:15px;height:15px;vertical-align:-3px}
#onl .amR button{min-width:68px;height:32px;border:0;border-radius:9px;font:900 12px Game,system-ui;color:#3a1d00;background:linear-gradient(#fff1a8,#ffc928 45%,#e59400);box-shadow:0 0 0 1.5px #7a4a00}#onl .amR button.off{background:linear-gradient(#3b4656,#222a36);color:#aab6c6;box-shadow:0 0 0 1px #4a5668}
#onl .body{flex:1;overflow:auto;padding:0 10px 12px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
#onl .body::-webkit-scrollbar{display:none}
#onl .ond{display:inline-block;width:9px;height:9px;border-radius:50%;background:#3dff5a;box-shadow:0 0 6px #3dff5a;margin-right:4px;vertical-align:1px;animation:olPl 1.6s infinite}
#onl .live{display:inline-flex;align-items:center;gap:5px;font:900 10px Game,system-ui;color:#7dff8a;letter-spacing:1px}
#onl .live:before{content:"";width:8px;height:8px;border-radius:50%;background:#3dff5a;box-shadow:0 0 8px #3dff5a;animation:olPl 1.2s infinite}
@keyframes olPl{50%{opacity:.25;transform:scale(.7)}}
#onl .o-sub{white-space:nowrap;letter-spacing:0;display:flex;justify-content:space-between;align-items:center;padding:0 12px 2px;font:700 10px Game,system-ui;color:#8fa0b4}
#onl .av{position:relative;flex:none}
#onl .av .p{position:absolute;left:15%;right:15%;top:18%;bottom:27%;border-radius:6px;background:#111 center/cover;z-index:1}.av .p.p7{left:17.5%;right:17.5%;top:23.5%;bottom:28.5%}.av .p.p8{left:21.6%;right:21.6%;top:27.6%;bottom:31.6%;border-radius:9%}.av .p.p9{left:21%;right:21.3%;top:28.3%;bottom:29.7%;border-radius:9%}.av .p.p10{left:22%;right:22.3%;top:27%;bottom:31.3%;border-radius:9%}.av .p.p11{left:19%;right:19.3%;top:29.7%;bottom:27%;border-radius:9%}.av .p.p12{left:20%;right:20.3%;top:28.3%;bottom:30.7%;border-radius:9%}.av .p.p13{left:19.7%;right:20%;top:28%;bottom:29.7%;border-radius:9%}.av .p.p14{left:21%;right:22%;top:33.3%;bottom:30%;border-radius:9%}
#onl .av .f{position:absolute;inset:0;background:center/100% 100% no-repeat}
#onl .fav{width:46px;height:49px}#onl .m .fav{width:40px;height:43px}#onl .mt .sd div.cf .fav{width:15%;height:auto;aspect-ratio:220/235}#onl .fav .p{border-radius:4px}
#onl .ring{position:relative;flex:none;border-radius:11px;background:#111 center/cover;box-shadow:0 0 0 2px var(--c,#555),0 0 8px var(--c,#0000)}
#onl .ring.r5{--c:#ff3b3b}#onl .ring.r4{--c:#ffc23a}#onl .ring.r3{--c:#c35cff}#onl .ring.r2{--c:#3fa7ff}#onl .ring.r1{--c:#4cd964}#onl .ring.r0{--c:#8a96a5}
#onl .ring.r5,#onl .ring.r4{animation:olRg 2s ease-in-out infinite}
@keyframes olRg{50%{box-shadow:0 0 0 2px var(--c),0 0 14px var(--c)}}
#onl .tt{display:inline-block;position:relative;overflow:hidden;font:900 8.5px/1 Game,system-ui;font-style:normal;letter-spacing:.8px;padding:3px 6px;border-radius:5px;color:#fff;text-shadow:0 1px 0 #0008;vertical-align:middle;white-space:nowrap}
#onl .tt:after{content:"";position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,#fff9,transparent);animation:olSh 2.6s ease-in-out infinite}
#onl .t5{background:linear-gradient(90deg,#7a0000,#ff3b3b,#ff9a3b);box-shadow:0 0 6px #ff3b3b88}
#onl .t4{background:linear-gradient(90deg,#7a4a00,#ffc23a,#fff1a8);color:#3a1d00;text-shadow:none;box-shadow:0 0 6px #ffc23a88}
#onl .t3{background:linear-gradient(90deg,#4a0a7a,#c35cff,#f0b8ff);box-shadow:0 0 6px #c35cff66}
#onl .t2{background:linear-gradient(90deg,#0a3a7a,#3fa7ff,#b8e4ff)}
#onl .t1{background:linear-gradient(90deg,#14532a,#4cd964)}
#onl .t0{background:linear-gradient(90deg,#3a4452,#7d8b9c)}
#onl .vipB{height:1.55em;width:auto;vertical-align:-.45em;filter:drop-shadow(0 1px 1px #000)}#onl .pvip{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;margin:4px 0;font:900 12px Game,system-ui;color:#ffd54a}#onl .pvip .vipB{height:34px}#onl .pvip small{width:100%;text-align:center;font:700 10px Game,system-ui;color:#9fb0c0}#onl .hvB{border:1px solid #d79b22;background:#1d1430;color:#e8dcff;border-radius:10px;padding:4px 10px;font:900 11px Game,system-ui}
#onl .vip{font:900 8.5px Game,system-ui;color:#3a1d00;background:linear-gradient(#fff1a8,#ffb300);border-radius:4px;padding:1px 4px;vertical-align:middle}
#onl .ai{font:900 8.5px Game,system-ui;color:#fff;background:#56657a;border-radius:4px;padding:1px 4px;vertical-align:middle}
#onl .pod{position:relative;display:flex;align-items:flex-end;justify-content:center;gap:6px;padding:42px 0 10px}
#onl .pod>.g{position:relative;width:32%;text-align:center;border-radius:16px 16px 8px 8px;padding:6px 4px 8px;animation:olPod .7s cubic-bezier(.2,1.4,.4,1) both}
#onl .pod>.g1{animation-delay:.2s}#onl .pod>.g3{animation-delay:.35s}
@keyframes olPod{from{transform:translateY(60px) scale(.6);opacity:0}}
#onl .pod .av{width:90px;height:96px;margin:0 auto -4px}
#onl .pod .o-n{font:900 11.5px Game,system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:2px 0 3px}
#onl .pod .o-st{font:900 20px Game,system-ui;background:linear-gradient(#fffbe6,#ffd54a 50%,#e08a00);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 2px 0 #000);margin-top:2px}
#onl .pod .ps{font:800 9.5px Game,system-ui;color:#c9b88a}
#onl .g1{height:218px;background:linear-gradient(#7a5200,#3a2705 60%,#1a1205);box-shadow:0 0 0 2px #ffd54a,0 0 26px #ffc23a88,inset 0 2px 0 #fff6}
#onl .g2{height:196px;background:linear-gradient(#5e6a7a,#262c35 60%,#13171c);box-shadow:0 0 0 2px #dfe8f2,0 0 14px #cfd8e355,inset 0 2px 0 #fff6}
#onl .g3{height:188px;background:linear-gradient(#7a4520,#2e1a0c 60%,#170d06);box-shadow:0 0 0 2px #e09a5a,0 0 14px #d08a4a55,inset 0 2px 0 #fff5}
#onl .pod .md{position:absolute;top:-18px;left:-6px;width:34px;height:34px;z-index:3;filter:drop-shadow(0 3px 3px #000)}
#onl .crown{position:absolute;top:-38px;left:50%;width:46px;margin-left:-23px;z-index:4;animation:olBob 1.8s ease-in-out infinite;filter:drop-shadow(0 0 8px #ffc23a)}
@keyframes olBob{50%{transform:translateY(-6px) rotate(-4deg)}}
#onl .rays{position:absolute;left:50%;top:70px;width:320px;height:320px;margin:-160px 0 0 -160px;background:repeating-conic-gradient(#ffd54a33 0 6deg,transparent 6deg 18deg);border-radius:50%;-webkit-mask:radial-gradient(#000 10%,transparent 65%);mask:radial-gradient(#000 10%,transparent 65%);animation:olSpin 14s linear infinite;pointer-events:none}
#onl .o-row{position:relative;display:flex;align-items:center;gap:9px;padding:7px 9px;margin-bottom:7px;border-radius:14px;background:linear-gradient(90deg,#1f2937e6,#111820e6);box-shadow:0 0 0 1px #2f3b4b,inset 0 1px 0 #fff1;overflow:hidden}
#onl .o-row.in{animation:olRow .45s both}
@keyframes olRow{from{transform:translateX(40px);opacity:0}}
#onl .o-row .k{width:30px;text-align:center;font:italic 900 15px Game,system-ui;color:#c9d4e2}
#onl .o-row .ring{width:42px;height:42px}
#onl .o-row .o-nm{flex:1;min-width:0}
#onl .o-row .o-nm b{display:block;font:800 13px Game,system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#onl .o-row .o-nm small{display:block;font:700 10px Game,system-ui;color:#8fa0b4;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#onl .o-row .v{text-align:right;font:900 16px Game,system-ui;color:#ffe27a;text-shadow:0 0 8px #ffb30055;white-space:nowrap}
#onl .o-row .v small{display:block;font:800 9.5px Game,system-ui;color:#8fa0b4;text-shadow:none}
#onl .o-row.me{background:linear-gradient(90deg,#4a3406,#1c1408);box-shadow:0 0 0 1.5px #ffc23a,0 0 14px #ffb30044,inset 0 1px 0 #fff3}
#onl .o-row.flash{animation:olFl 1.4s}
@keyframes olFl{0%{box-shadow:0 0 0 2px #3dff5a,0 0 22px #3dff5a}100%{box-shadow:0 0 0 1px #2f3b4b}}
#onl .o-up{color:#3dff5a}
#onl .pin{padding:6px 10px 8px;background:linear-gradient(#0000,#000c 30%)}
#onl .pin .o-row{margin:0}
#onl .o-note{font:700 10.5px/1.45 Game,system-ui;color:#8fa0b4;text-align:center;padding:6px 4px 8px}
#onl .empty{font:800 13px/1.5 Game,system-ui;color:#ffe7b0;text-align:center;padding:12px 16px;margin:20px auto;width:fit-content;max-width:86%;background:#0a0f1ae6;border:1px solid #e0a82e88;border-radius:12px;position:relative;z-index:2}
#onl .msgs{flex:1;overflow:auto;padding:8px 10px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
#onl .m{display:flex;gap:8px;margin-bottom:11px;animation:olM .4s cubic-bezier(.2,1.3,.4,1) both}
@keyframes olM{from{transform:translateY(14px) scale(.92);opacity:0}}
#onl .m .ring{width:38px;height:38px}
#onl .bub{position:relative;max-width:78%;background:linear-gradient(#223042,#151e2a);box-shadow:0 0 0 1px #33465c,inset 0 1px 0 #fff2;border-radius:4px 15px 15px 15px;padding:6px 10px}
#onl .bub .h{font:800 11px Game,system-ui;color:#9fe3ff;display:flex;gap:5px;align-items:center;flex-wrap:wrap}
#onl .bub p{margin:3px 0 2px;font:500 14px/1.35 Game,system-ui;word-wrap:break-word;overflow-wrap:anywhere;user-select:text;-webkit-user-select:text}
#onl .bub .tr{font:700 9.5px Game,system-ui;color:#7d8b9c}
#onl .bub .tr u{color:#9fe3ff;text-decoration:none}
#onl .bub .tm{font:700 9px Game,system-ui;color:#6e7c8c;margin-left:auto}
#onl .m.me{flex-direction:row-reverse}
#onl .m.me .bub{background:linear-gradient(#5a3f08,#2a1d08);box-shadow:0 0 0 1px #e0aa25,inset 0 1px 0 #fff3;border-radius:15px 4px 15px 15px}
#onl .sys{text-align:center;margin:4px 0 12px;animation:olM .4s both}
#onl .sys span{display:inline-block;position:relative;overflow:hidden;font:900 10.5px Game,system-ui;color:#3a1d00;background:linear-gradient(90deg,#ffb300,#fff1a8,#ffb300);border-radius:10px;padding:4px 10px;box-shadow:0 0 12px #ffb30077}
#onl .inp{display:flex;gap:7px;padding:8px 10px 10px;background:#000a}
#onl .inp input{flex:1;min-width:0;background:#141c27;box-shadow:0 0 0 1px #33465c;border:0;border-radius:13px;padding:11px;font:500 15px Game,system-ui;color:#fff;outline:none;user-select:text;-webkit-user-select:text}
#onl .btn{position:relative;overflow:hidden;border:0;border-radius:13px;padding:0 15px;font:900 13px Game,system-ui;background:linear-gradient(#fff1a8,#ffc928 45%,#e59400);color:#3a1d00;box-shadow:0 3px 0 #7a4a00,inset 0 1.5px 0 #fff9}
#onl .btn:active,#onl .fight:active,#onl .btns>div:active{transform:scale(.95)}
#onl .btn.gray{background:linear-gradient(#56657a,#334);color:#fff;box-shadow:0 3px 0 #111}
#onl .menu{position:absolute;background:linear-gradient(#18222e,#0b1118);border:1.5px solid #e0aa25;border-radius:13px;overflow:hidden;box-shadow:0 10px 24px #000d;z-index:5;animation:olPop .25s cubic-bezier(.2,1.5,.4,1)}
@keyframes olPop{from{transform:scale(.6);opacity:0}}
#onl .menu div{padding:10px 18px;font:800 13px Game,system-ui;border-bottom:1px solid #2a3442}
#onl .menu div:last-child{border:0;color:#ff6b5b}
#onl .ahero{position:relative;margin:4px 0 10px;border-radius:18px;padding:12px;background:linear-gradient(135deg,#4a2280,#1a0f30 60%,#120a22);box-shadow:0 0 0 2px #c79bff,0 0 24px #8a3cff77,inset 0 2px 0 #fff3;display:flex;gap:12px;align-items:center;overflow:hidden}
#onl .ahero:before{content:"";position:absolute;inset:-50%;background:repeating-conic-gradient(#ffffff08 0 8deg,transparent 8deg 20deg);animation:olSpin 30s linear infinite}
#onl .badge{position:relative;width:84px;height:94px;flex:none;animation:olBob 2.4s ease-in-out infinite}
#onl .badge svg{width:100%;height:100%;filter:drop-shadow(0 0 10px #ffc23a99) drop-shadow(0 4px 4px #000)}
#onl .ahero .t{position:relative;flex:1;min-width:0}
#onl .ahero .t b{display:block;font:900 21px Game,system-ui;background:linear-gradient(#fffbe6,#ffd54a 55%,#e08a00);-webkit-background-clip:text;background-clip:text;color:transparent}
#onl .ahero .t small{display:block;font:700 11px Game,system-ui;color:#e2d4ff;margin-top:2px}
#onl .o-bar{position:relative;height:10px;border-radius:6px;background:#0008;margin-top:7px;overflow:hidden;box-shadow:inset 0 1px 2px #000}
#onl .o-bar i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:linear-gradient(90deg,#9a4cff,#ff7af0,#ffe27a);transition:width 1.2s cubic-bezier(.2,.9,.3,1)}
#onl .o-bar i:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(-45deg,#fff3 0 6px,transparent 6px 12px)}
#onl .tk{display:flex;justify-content:space-between;font:800 11px Game,system-ui;color:#d8cdf0;margin:0 2px 9px}
#onl .opp{position:relative;display:flex;align-items:center;gap:6px;padding:9px;margin-bottom:9px;border-radius:16px;background:linear-gradient(90deg,#2a1e40e6,#141022e6);box-shadow:0 0 0 1px #4a3a6a,inset 0 1px 0 #fff2;animation:olRow .45s both}
#onl .opp .bd{width:32px;flex:none}
#onl .opp .tm{display:flex;flex:none}
#onl .opp .tm .ring{width:26px;height:26px;margin-right:-5px;border-radius:7px}
#onl .opp .o-nm{flex:1;min-width:0;padding-left:8px}
#onl .opp .o-nm b{display:block;font:800 12.5px Game,system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#onl .opp .o-nm small{display:block;font:700 10px Game,system-ui;color:#a99cc4;margin-top:2px}
#onl .fight{position:relative;overflow:hidden;flex:none;border:0;border-radius:12px;padding:8px 11px;font:900 13px Game,system-ui;background:linear-gradient(#ffb070,#ff5a1a 50%,#c22a00);color:#fff;box-shadow:0 3px 0 #6a1a00,0 0 14px #ff5a1a66,inset 0 1.5px 0 #fff8;text-align:center;text-shadow:0 1px 0 #0006;animation:olPulse 1.6s ease-in-out infinite}
#onl .fight.off{filter:grayscale(1);animation:none;opacity:.6}
@keyframes olPulse{50%{transform:scale(1.06)}}
#onl .fight small{display:block;font:900 9px Game,system-ui;color:#fff1a8}
#onl .btns{display:flex;gap:8px;margin-top:4px}
#onl .btns>div{position:relative;overflow:hidden;flex:1;text-align:center;padding:11px 0;border-radius:13px;font:900 12px Game,system-ui;background:linear-gradient(#26313f,#141b25);box-shadow:0 0 0 1.5px #e0aa25,inset 0 1px 0 #fff2;color:#ffe27a}
#onl .leag{display:flex;gap:3px;margin:14px 0 4px}
#onl .leag>div{flex:1;text-align:center;font:800 7.5px Game,system-ui;color:#8fa0b4;opacity:.5}
#onl .leag>div svg{width:100%;height:40px}
#onl .leag>div.on{opacity:1;color:#ffe27a;transform:scale(1.15)}
#onl .hrow{display:flex;align-items:center;gap:8px;padding:9px;margin-bottom:7px;border-radius:13px;background:linear-gradient(90deg,#1f2937e6,#111820e6);box-shadow:0 0 0 1px #2f3b4b;font:700 12px Game,system-ui}
#onl .hrow .w{font:900 12px Game,system-ui;padding:3px 7px;border-radius:7px}
#onl .hrow .w.o-y{background:#1f5a2a;color:#9dffb0}#onl .hrow .w.o-n{background:#5a1f1f;color:#ffb0a8}
#onl .hrow span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#onl .hrow small{color:#8fa0b4;font-size:10px}
#onl .play{border:0;border-radius:10px;padding:6px 10px;font:900 11px Game,system-ui;background:linear-gradient(#3fa7ff,#0a5ab0);color:#fff;box-shadow:0 2px 0 #052a52}
#onl .tw{position:relative;margin:4px 0 10px;border-radius:18px;padding:12px 12px 12px 92px;min-height:108px;background:linear-gradient(135deg,#7a1a1a,#2a0b0b 65%);box-shadow:0 0 0 2px #ff8a7a,0 0 24px #ff3c3c66,inset 0 2px 0 #fff3;overflow:hidden}
#onl .tw .tro{position:absolute;left:8px;top:10px;width:80px;height:88px;animation:olBob 2.2s ease-in-out infinite;filter:drop-shadow(0 0 12px #ffc23a)}
#onl .tw b{display:block;font:900 19px Game,system-ui;background:linear-gradient(#fffbe6,#ffd54a 55%,#e08a00);-webkit-background-clip:text;background-clip:text;color:transparent}
#onl .tw small{display:block;font:700 10.5px/1.4 Game,system-ui;color:#ffd0c8;margin-top:2px}
#onl .cd{display:inline-flex;gap:4px;margin-top:7px}
#onl .cd span{font:900 15px Game,system-ui;background:#000a;border-radius:7px;padding:4px 7px;box-shadow:inset 0 0 0 1px #ff8a7a66}
#onl .mt{position:relative;margin-bottom:8px;background:linear-gradient(#1f2937,#111820);box-shadow:0 0 0 1px #3a4656;border-radius:12px;overflow:hidden;display:flex;align-items:stretch;animation:olPop .35s both}
#onl .mt .sd{flex:1;min-width:0}
#onl .mt .sd div{display:flex;align-items:center;gap:6px;padding:5px 8px;font:800 12px Game,system-ui;white-space:nowrap;overflow:hidden;height:34px}
#onl .mt .sd div .ring{width:24px;height:24px;border-radius:6px}
#onl .mt .sd div.w{background:linear-gradient(90deg,#1f4a1f,#14301400);color:#c8ffc8}
#onl .mt .sd div.l{color:#6e7a88;text-decoration:line-through}
#onl .mt .sd div.me{color:#ffe27a}
#onl .mt.me{box-shadow:0 0 0 1.5px #ffc23a,0 0 10px #ffb30088}
#onl .mt .wb{display:flex;align-items:center;padding:0 8px}
#onl .o-rw{display:grid;grid-template-columns:auto 1fr;gap:7px 8px;align-items:center;font:800 11.5px Game,system-ui;background:linear-gradient(#1f2937,#111820);box-shadow:0 0 0 1px #3a4656;border-radius:14px;padding:10px}
#onl .o-rw span:nth-child(even){color:#ffe27a;text-align:right}
#onl .pcard{position:relative;margin:4px 0 10px;border-radius:20px;padding:14px 12px 12px;text-align:center;background:linear-gradient(#3a2a10,#16110a);box-shadow:0 0 0 2px #ffd54a,0 0 22px #ffb30055,inset 0 2px 0 #fff3;overflow:hidden}
#onl .pcard .rays{top:84px}
#onl .pcard .av{width:132px;height:141px;margin:0 auto}
#onl .pname{position:relative;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:2px}
#onl .pname b{font:900 22px Game,system-ui;text-shadow:0 2px 0 #000}
#onl .edit{width:30px;height:30px;border-radius:9px;border:0;background:linear-gradient(#fff1a8,#ffb300);box-shadow:0 2px 0 #7a4a00;font-size:14px}
#onl .pid{position:relative;font:700 10px Game,system-ui;color:#c9b88a;margin-top:5px}
#onl .stats{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:7px;margin-bottom:6px}
#onl .stats div{background:linear-gradient(#1f2937,#111820);box-shadow:0 0 0 1px #3a4656;border-radius:12px;padding:8px 10px;font:700 10px Game,system-ui;color:#8fa0b4}
#onl .stats div b{display:block;font:900 16px Game,system-ui;color:#ffe27a;margin-top:2px}
#onl h3{margin:14px 2px 8px;font:900 12px Game,system-ui;letter-spacing:1.5px;color:#ffd54a;display:flex;align-items:center;gap:6px}
#onl h3:after{content:"";flex:1;height:1px;background:linear-gradient(90deg,#ffd54a88,transparent)}
#onl .grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;padding:2px}
#onl .grid .ring{aspect-ratio:1;width:100%}
#onl .grid .ring.sel{box-shadow:0 0 0 2.5px #fff,0 0 0 4.5px #ffc23a,0 0 14px #ffc23a}
#onl .frames{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
#onl .frames .av{width:100%;aspect-ratio:220/235;height:auto}
#onl .frames .sel .av{filter:drop-shadow(0 0 8px #ffc23a)}
#onl .frames .o-lock .av{filter:grayscale(1) brightness(.45)}
#onl .frames small{display:block;text-align:center;font:800 9px/1.3 Game,system-ui;color:#8fa0b4;margin-top:2px}
#onl .tlist{display:flex;flex-direction:column;gap:6px}
#onl .tlist div{display:flex;align-items:center;gap:8px;background:linear-gradient(#1f2937,#111820);box-shadow:0 0 0 1px #3a4656;border-radius:11px;padding:8px 9px;font:700 10.5px Game,system-ui;color:#8fa0b4}
#onl .tlist div .tt{font-size:10px;padding:4px 8px}
#onl .tlist div span{flex:1}
#onl .tlist div.sel{box-shadow:0 0 0 1.5px #ffc23a,0 0 10px #ffb30055}
#onl .tlist div.o-lock .tt{filter:grayscale(1) brightness(.6)}
#onl .modal{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:#000b}
#onl .modal .box .mX{position:sticky;top:0;float:right;z-index:6;width:36px;height:36px;margin:-6px -6px 4px 8px;border:2px solid #ffd54a;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff7a6a,#c62828 60%,#6d0f0f);color:#fff;font:900 17px/1 Game,system-ui;padding:0}
#onl .modal .box{width:88%;max-height:84%;overflow:auto;border-radius:18px;padding:16px;background:linear-gradient(#2a2010,#120e08);box-shadow:0 0 0 2px #ffd54a,0 0 30px #ffb30066;text-align:center;animation:olPop .3s cubic-bezier(.2,1.5,.4,1)}
#onl .modal h4{margin:0 0 10px;font:900 17px Game,system-ui;color:#ffe27a}
#onl .modal input{width:100%;background:#0b0f15;box-shadow:0 0 0 1.5px #e0aa25;border:0;border-radius:12px;padding:12px;font:800 16px Game,system-ui;color:#fff;outline:none;user-select:text;-webkit-user-select:text}
#onl .modal p{font:700 11.5px/1.5 Game,system-ui;color:#c9b88a;margin:10px 0;text-align:left}
#onl .modal .ok{display:flex;gap:8px;margin-top:10px}#onl .modal .ok .btn{flex:1;padding:11px 0}
#onl .ib{display:flex;gap:9px;align-items:center;text-align:left;background:#0007;border:1px solid #e0aa2566;border-radius:12px;padding:9px;margin-bottom:7px}
#onl .ib .o-ic{font-size:24px}
#onl .ib div{flex:1;min-width:0;font:700 11px/1.35 Game,system-ui;color:#c9b88a}
#onl .ib div b{display:block;color:#fff;font-size:13px}
#onl .ib .rw2{color:#ffe27a;font-weight:900}
#onl .nav{position:absolute;left:0;right:0;bottom:0;height:calc(52px + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);display:flex;background:linear-gradient(#1a1406,#000);z-index:10;box-shadow:0 -2px 0 #e0aa25,0 -6px 14px #000}
#onl .nav b{position:relative;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;font:900 9px Game,system-ui;color:#8fa0b4;letter-spacing:.3px}
#onl .nav b svg{width:24px;height:24px;transition:transform .2s}
#onl .nav b.on{color:#ffe27a;background:radial-gradient(ellipse at 50% 100%,#ffb30044,transparent 70%)}
#onl .nav b img{width:30px;height:30px;object-fit:contain;transition:transform .2s;filter:drop-shadow(0 2px 2px #000)}#onl .nav b.on img{transform:translateY(-4px) scale(1.2);filter:drop-shadow(0 0 6px #ffb300)}
#onl .nav b.on svg{transform:translateY(-3px) scale(1.18);filter:drop-shadow(0 0 6px #ffb300)}
#onl .nav b i{position:absolute;top:5px;right:calc(50% - 20px);width:9px;height:9px;border-radius:50%;background:#e53935;box-shadow:0 0 0 1.5px #fff;display:none}
#onl .nav b i.on{display:block}
#olFx{position:absolute;inset:0;z-index:30;display:none;background:#000}
#olFx.on{display:block}
#olFx canvas{position:absolute;inset:0;width:100%;height:100%}
#olFx .vs{position:absolute;inset:0;display:flex;flex-direction:column;pointer-events:none}
#olFx .vs .side{flex:1;display:flex;align-items:center;gap:10px;padding:0 16px;font:900 17px Game,system-ui;color:#fff;text-shadow:0 2px 4px #000}
#olFx .vs .a{background:linear-gradient(100deg,#0a3a8a,#1e6bff 60%,#1e6bff00);clip-path:polygon(0 0,100% 0,82% 100%,0 100%);animation:olSl .5s cubic-bezier(.2,1.2,.4,1) both}
#olFx .vs .b{background:linear-gradient(-100deg,#8a0a0a,#ff2a1e 60%,#ff2a1e00);clip-path:polygon(18% 0,100% 0,100% 100%,0 100%);justify-content:flex-end;text-align:right;animation:olSr .5s cubic-bezier(.2,1.2,.4,1) both}
@keyframes olSl{from{transform:translateX(-100%)}}@keyframes olSr{from{transform:translateX(100%)}}
#olFx .vs .side .av{width:80px;height:86px}
#olFx .vs .side small{display:block;font:800 11px Game,system-ui;opacity:.9;margin-top:3px}
#olFx .vs .mid{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:italic 900 92px/1 Game,system-ui;background:linear-gradient(#fff,#ffe27a 50%,#ff8a00);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 18px #ffb300) drop-shadow(0 4px 0 #6a3a00);animation:olVs .6s .35s cubic-bezier(.2,1.8,.4,1) both}
@keyframes olVs{from{transform:translate(-50%,-50%) scale(4);opacity:0}}
#olFx .ctl{position:absolute;right:10px;bottom:calc(14px + env(safe-area-inset-bottom));display:flex;gap:8px;z-index:4}
#olFx .ctl button{-webkit-appearance:none;appearance:none;border:0;border-radius:11px;padding:8px 12px;font:900 12px Game,system-ui;background:rgba(0,0,0,.72);background-image:none;color:#ffe27a;opacity:1;box-shadow:0 0 0 1.5px #e0aa25}
#olFx.end .ctl{display:none}
#olFx .res{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(#0008,#000d);z-index:5;overflow:hidden;color:#fff}
#olFx .res.on{display:flex}
#olFx .res .rr{position:absolute;width:560px;height:560px;background:repeating-conic-gradient(#ffd54a40 0 7deg,transparent 7deg 20deg);border-radius:50%;-webkit-mask:radial-gradient(#000 5%,transparent 62%);mask:radial-gradient(#000 5%,transparent 62%);animation:olSpin 10s linear infinite}
#olFx .res.lose .rr{background:repeating-conic-gradient(#7a8aa030 0 7deg,transparent 7deg 20deg)}
#olFx .res h2{position:relative;margin:0;font:italic 900 52px/1 Game,system-ui;letter-spacing:2px;background:linear-gradient(#fffbe6,#ffd54a 50%,#e07a00);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 4px 0 #5a2f00) drop-shadow(0 0 20px #ffb300);animation:olPopB .7s cubic-bezier(.2,1.8,.4,1) both}
#olFx .res.lose h2{background:linear-gradient(#fff,#b8c4d2 50%,#5a6472);-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 4px 0 #222)}
@keyframes olPopB{from{transform:scale(3);opacity:0}}
#olFx .res .o-rb{position:relative;width:120px;height:134px;margin-bottom:6px;animation:olPopB .7s .2s cubic-bezier(.2,1.8,.4,1) both}
#olFx .res .o-rb svg{width:100%;height:100%;filter:drop-shadow(0 0 16px #ffc23a)}
#olFx .res .pts{position:relative;margin-top:12px;font:900 30px Game,system-ui;color:#7dff8a;text-shadow:0 0 14px #3dff5a}
#olFx .res.lose .pts{color:#ff8a7a;text-shadow:0 0 14px #ff3b3b}
#olFx .res .lg{position:relative;width:230px;margin-top:10px}
#olFx .res .lg small{display:block;text-align:center;font:800 11px Game,system-ui;color:#e2d4ff;margin-top:5px}
#olFx .res .o-bar{position:relative;height:10px;border-radius:6px;background:#0008;overflow:hidden}
#olFx .res .o-bar i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:linear-gradient(90deg,#9a4cff,#ff7af0,#ffe27a);transition:width 1.2s}
#olFx .res .rw2{position:relative;display:flex;gap:10px;margin-top:14px}
#olFx .res .rw2 div{background:#0009;border:1px solid #e0aa25;border-radius:12px;padding:8px 12px;font:900 13px Game,system-ui;color:#ffe27a;animation:olPop .4s 1s both}
#olFx .res .btn{position:relative;margin-top:20px;padding:12px 40px;font:900 15px Game,system-ui;border:0;border-radius:13px;background:linear-gradient(#fff1a8,#ffc928 45%,#e59400);color:#3a1d00;box-shadow:0 3px 0 #7a4a00}
#side2 #rkBtn svg,#side2 #chBtn svg{width:34px;height:34px}
/* v16-49: Marius' Arena / Ranking / Cup pictures (img/ui3) */
#onl .lgb{position:relative;display:block;width:100%;height:100%}#onl .lgb img{display:block;width:100%;height:100%;object-fit:contain}
#onl .lgb b{position:absolute;left:0;right:0;top:71%;height:17%;display:flex;align-items:center;justify-content:center;font:900 11px Game,system-ui;color:#fff;text-shadow:0 1px 0 #000}
#onl .badge .lgb b{font-size:16px}
#onl .leag>div .lgb{height:44px}
#onl .opp .bd .lgb{height:100%}
#onl .tabs b{background:url(img/ui3/tab_off.webp) center/100% 100% no-repeat!important;box-shadow:none!important;border-radius:0!important;color:#cfe3ff!important;padding:10px 0!important;text-shadow:0 1px 0 #000}
#onl .tabs b.on{background-image:url(img/ui3/tab_on.webp)!important;color:#3a1d00!important;text-shadow:0 1px 0 #fff8}#onl .tabs b.on:after{display:none}
#onl .ahero.ah3{aspect-ratio:720/249;padding:0;border-radius:0;background:url(img/ui3/ar_me.webp) 0 0/100% 100% no-repeat;box-shadow:none;overflow:visible;filter:drop-shadow(0 6px 12px #000a)}
#onl .ahero.ah3:before{display:none}
#onl .ah3 .badge{position:absolute;left:7.6%;top:19%;width:21%;height:63%;animation:none}
#onl .ah3 .t{position:absolute;left:34%;top:24%;width:61%;height:66%}
#onl .ah3 .t b{font-size:min(5vw,21px)}#onl .ah3 .t small{font-size:min(2.6vw,10.5px)}
#onl .ah3 .o-bar{position:absolute;left:-.5%;top:66%;width:96.5%;height:16%;margin:0;border-radius:20px;background:#140a26;box-shadow:inset 0 0 0 1px #000}
#onl .ah3 .o-bar i{border-radius:20px;background:linear-gradient(#ff9bff,#d23cff 55%,#9a1ad8)}
#onl .ah3 .t small:last-child{position:absolute;top:84%;left:0;right:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#onl .opp{display:block;aspect-ratio:720/166;padding:0;margin-bottom:22px;border-radius:0;background:url(img/ui3/ar_row.webp) 0 0/100% 100% no-repeat;box-shadow:none}
#onl .opp .bd{position:absolute;left:7.4%;top:26%;width:14%;height:62%}
#onl .opp .tm{position:absolute;left:28.7%;top:33%;width:64.6%;height:45%;display:flex;justify-content:space-between}
#onl .opp .tm .ring{width:17.2%;height:100%;margin:0;border-radius:6px}
#onl .opp .o-nm{position:absolute;left:36.5%;top:5%;width:48%;height:21%;padding:0;display:flex;align-items:center;gap:6px}
#onl .opp .o-nm b{font-size:min(2.9vw,12px);flex:1;min-width:0}#onl .opp .o-nm small{margin:0;font-size:9.5px;color:#e2d4ff;white-space:nowrap}
#onl .fight.f3{position:absolute;right:2%;bottom:-17%;width:34%;aspect-ratio:910/240;height:auto;padding:0;border:0;border-radius:0;background:url(img/ui3/ar_fight.webp) center/100% 100% no-repeat;box-shadow:none;font-size:0;z-index:2}
#onl .fight.f3.off{background-image:url(img/ui3/ar_fightg.webp)}
#onl .fight.f3 small{position:absolute;left:-58%;bottom:12%;font:900 10px Game,system-ui;color:#ffe27a;text-shadow:0 1px 0 #000;white-space:nowrap}
#onl .btns>div{background:url(img/ui3/ar_b1.webp) center/100% 100% no-repeat!important;box-shadow:none!important;border-radius:0!important;padding:14px 0!important;color:#fff;text-shadow:0 1px 0 #000}
#onl .o-row.ar3{aspect-ratio:720/100;padding:0 3% 0 0;gap:0;border-radius:0;background:url(img/ui3/ar_r.webp) 0 0/100% 100% no-repeat;box-shadow:none}
#onl .o-row.ar3.me{background-image:url(img/ui3/ar_rme.webp);filter:drop-shadow(0 0 6px #ffb300aa)}
#onl .o-row.ar3 .k{position:absolute;left:5.5%;width:9%;top:0;bottom:0;display:flex;align-items:center;justify-content:center;color:#ffe27a;font-size:14px}
#onl .o-row.ar3 .ring{position:absolute;left:20.3%;top:12%;height:76%;width:auto;aspect-ratio:1}
#onl .o-row.ar3 .o-nm{margin-left:34%}
#onl .o-row.ar3>div:has(.lgb){height:70%}
#onl .o-row.rk3{aspect-ratio:720/108;padding:0 4% 0 0;gap:6px;border-radius:0;background:url(img/ui3/rk4.webp) 0 0/100% 100% no-repeat;box-shadow:none}
#onl .o-row.rk3.me{filter:drop-shadow(0 0 7px #ffb300)}
#onl .o-row.rk3 .k{position:absolute;left:6%;width:14%;top:0;bottom:0;display:flex;align-items:center;justify-content:center;color:#ffe27a;font-size:14px;text-shadow:0 1px 0 #000}
#onl .o-row.rk3 .ring{margin-left:22%;height:62%;width:auto;aspect-ratio:1}
#onl .hrow.hw,#onl .hrow.hl{background:url(img/ui3/ar_rup.webp) 0 0/100% 100% no-repeat!important;box-shadow:none!important;border-radius:0!important;aspect-ratio:720/100;padding:0 22% 0 4%!important;position:relative}
#onl .hrow.hl{background-image:url(img/ui3/ar_rdn.webp)!important}
#onl .hrow .play{position:absolute;right:3.5%;top:22%;height:56%;width:14%;opacity:0}
#onl .hrow.hw,#onl .hrow.hl{padding-left:34%!important;display:flex;align-items:center}
#onl .hrow.hw>b.w,#onl .hrow.hl>b.w{position:absolute;left:5.6%;width:8.8%;top:20%;height:60%;display:flex;align-items:center;justify-content:center;padding:0;margin:0;border-radius:50%;font-size:8px;background:none;box-shadow:none}
#onl .hrow.hw>span,#onl .hrow.hl>span{font-size:11px;min-width:0}
#onl .mt.me{box-shadow:none!important;background:none!important;border:0!important}
#onl .mt{background:none;box-shadow:none;border-radius:0;overflow:visible}
#onl .mt .sd div.cf{height:auto;aspect-ratio:720/159;margin-bottom:2px;padding:0 5% 0 7%;background:url(img/ui3/cup_op.webp) 0 0/100% 100% no-repeat;color:#e8f0ff;gap:10%}
#onl .mt .sd div.cf.me{aspect-ratio:720/200;background-image:url(img/ui3/cup_me.webp);color:#ffe27a}
#onl .mt .sd div.cf .ring{width:15%;height:auto;aspect-ratio:1;border-radius:50%}
#onl .mt .sd div.cf.me .ring{border-radius:8px;width:16%}
#onl .mt .sd div.cf.w{background-color:transparent}#onl .mt .sd div.cf.w:after{content:'WIN';margin-left:auto;font:900 11px Game,system-ui;color:#7CFC9A}
#onl #olCupT b{background:url(img/ui3/cup_pb.webp) center/100% 100% no-repeat!important;padding:9px 16px!important}#onl #olCupT b.on{background-image:url(img/ui3/cup_po.webp)!important;color:#fff!important;text-shadow:0 1px 0 #6a2a00}

/* v16-176: opponent hero window (tap a hero on a profile) */
#onl .pkTap{cursor:pointer;transition:transform .12s}#onl .pkTap:active{transform:scale(.92)}
#onl .pkHint{display:block;margin-top:4px;color:#ffd54a;font-size:11px;opacity:.85}
#onl .pkM .box{width:92%}
#onl .pkH{display:flex;gap:12px;align-items:center;text-align:left;margin:4px 0 8px}#onl .pkC{flex:0 0 96px}
#onl .pkT{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}#onl .pkT>b{font-size:18px;line-height:1.1}#onl .pkT small{font-size:11px;color:#cfd8e3}
#onl .pkL{font:900 13px Game,system-ui;color:#fff}#onl .pkP{font:900 19px Game,system-ui;color:#ffd54a;text-shadow:0 1px 2px #000}#onl .pkP .tki{height:1.15em;vertical-align:-.22em}
#onl .pkSt{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;text-align:left}#onl .pkSt>div{font-size:10.5px}
#onl .pkSk{margin:8px 0;padding:8px 10px;border-radius:10px;background:#0006;box-shadow:inset 0 0 0 1px #ffd54a55;text-align:left}#onl .pkSk b{display:block;color:#ffd54a;font-size:13px}#onl .pkSk small{font-size:11px;color:#dfe6ee;line-height:1.3}
#onl .pkG{display:grid;grid-template-columns:repeat(3,1fr);gap:8px 6px;margin-top:4px}
#onl .pkI{display:flex;flex-direction:column;align-items:center;min-width:0}#onl .pkI .gi{width:72px}#onl .pkI .fc{aspect-ratio:220/236}
#onl .pkN{font:900 10px/1.15 Game,system-ui;margin-top:2px;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#onl .pkS{font-size:9.5px;color:#cfd8e3;white-space:nowrap}#onl .pkC .hfc>:not(:first-child){display:none!important}#onl .pkSk small{display:block;line-height:1.35!important;margin-top:2px}#onl .pkS b{color:#7CFC9A}
#onl .pkI.off .pkE{width:72px;aspect-ratio:220/236;border-radius:10px;border:2px dashed #ffffff33;display:flex;align-items:center;justify-content:center;font-size:10px;color:#8fa0b4}
`;

// ------------------------------------------------------------------ DOM
const SVGDEFS=`<svg width="0" height="0" style="position:absolute"><defs>
 <linearGradient id="olGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe6"/><stop offset=".45" stop-color="#ffd54a"/><stop offset=".7" stop-color="#e08a00"/><stop offset="1" stop-color="#ffcf5a"/></linearGradient>
 <linearGradient id="olSilv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#c8d2de"/><stop offset="1" stop-color="#7a8696"/></linearGradient>
 <linearGradient id="olBron" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd8b0"/><stop offset=".5" stop-color="#d0864a"/><stop offset="1" stop-color="#7a4018"/></linearGradient>
 <symbol id="olTrophy" viewBox="0 0 64 64"><path d="M18 8h28v14c0 10-6 17-14 17S18 32 18 22z" fill="url(#olGold)" stroke="#6a3a00" stroke-width="2.5"/><path d="M18 13H8c0 10 5 15 11 15M46 13h10c0 10-5 15-11 15" fill="none" stroke="#ffc23a" stroke-width="4"/><rect x="28" y="38" width="8" height="10" fill="url(#olGold)" stroke="#6a3a00" stroke-width="2"/><rect x="19" y="48" width="26" height="9" rx="2" fill="url(#olGold)" stroke="#6a3a00" stroke-width="2.5"/><path d="M32 15l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="#fff8"/></symbol>
 <symbol id="olChat" viewBox="0 0 64 64"><path d="M8 8h40a6 6 0 016 6v20a6 6 0 01-6 6H26l-12 10v-10H8a6 6 0 01-6-6V14a6 6 0 016-6z" fill="#3fa7ff" stroke="#062a52" stroke-width="2.5"/><circle cx="16" cy="24" r="3.5" fill="#fff"/><circle cx="28" cy="24" r="3.5" fill="#fff"/><circle cx="40" cy="24" r="3.5" fill="#fff"/><circle cx="50" cy="48" r="12" fill="url(#olGold)" stroke="#6a3a00" stroke-width="2.5"/><path d="M39 48h22M50 37c-4 5-4 17 0 22M50 37c4 5 4 17 0 22" stroke="#6a3a00" stroke-width="2" fill="none"/></symbol>
 <symbol id="olSwords" viewBox="0 0 64 64"><g stroke="#3a1d00" stroke-width="2.5" stroke-linejoin="round"><path d="M8 4l32 30-6 6L4 8z" fill="url(#olSilv)"/><path d="M56 4L24 34l6 6 30-32z" fill="url(#olSilv)"/></g><path d="M22 34l10 10M42 34L32 44" stroke="#3a1d00" stroke-width="8" stroke-linecap="round"/><path d="M22 34l10 10M42 34L32 44" stroke="#ffc23a" stroke-width="5" stroke-linecap="round"/><path d="M27 43l-11 11M37 43l11 11" stroke="#3a1d00" stroke-width="7" stroke-linecap="round"/><path d="M27 43l-11 11M37 43l11 11" stroke="#8a4a1a" stroke-width="4" stroke-linecap="round"/><circle cx="14" cy="56" r="5" fill="#ff3b3b" stroke="#3a1d00" stroke-width="2"/><circle cx="50" cy="56" r="5" fill="#3fa7ff" stroke="#3a1d00" stroke-width="2"/></symbol>
 <symbol id="olCup" viewBox="0 0 64 64"><path d="M14 6h36v8c0 14-8 24-18 24S14 28 14 14z" fill="url(#olGold)" stroke="#6a3a00" stroke-width="2.5"/><path d="M14 10H4c0 12 6 18 13 18M50 10h10c0 12-6 18-13 18" fill="none" stroke="#ffc23a" stroke-width="4.5"/><path d="M27 37h10l3 12H24z" fill="url(#olGold)" stroke="#6a3a00" stroke-width="2"/><rect x="14" y="49" width="36" height="10" rx="3" fill="#7a1a1a" stroke="#ffd54a" stroke-width="2.5"/><circle cx="32" cy="19" r="7" fill="#ff3b3b" stroke="#6a3a00" stroke-width="2"/><circle cx="30" cy="17" r="2" fill="#fff9"/></symbol>
 <symbol id="olUser" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#1f2937" stroke="#ffc23a" stroke-width="5"/><circle cx="32" cy="25" r="10" fill="url(#olGold)"/><path d="M14 50c3-10 10-14 18-14s15 4 18 14" fill="url(#olGold)"/></symbol>
 <symbol id="olCrown" viewBox="0 0 64 48"><path d="M4 14l14 12L32 4l14 22 14-12-6 30H10z" fill="url(#olGold)" stroke="#6a3a00" stroke-width="2.5" stroke-linejoin="round"/><circle cx="32" cy="30" r="5" fill="#ff3b3b" stroke="#6a3a00" stroke-width="1.5"/><circle cx="18" cy="34" r="3.5" fill="#3fa7ff"/><circle cx="46" cy="34" r="3.5" fill="#3fa7ff"/><circle cx="4" cy="14" r="3" fill="#ffd54a"/><circle cx="60" cy="14" r="3" fill="#ffd54a"/><circle cx="32" cy="4" r="3" fill="#ffd54a"/></symbol>
</defs></svg>`;
const top=(ic,t,sub)=>`<div class="top"><div class="ttl">${ICON[ic]}<h1>${t}<small>${sub}</small></h1></div><span class="srv" data-srv></span><button class="o-gift" data-gift>🎁<i></i></button><button class="x" data-x>✕</button></div>`;
const root=document.createElement('div');root.id='onl';
root.innerHTML=SVGDEFS+`
<section class="scr skn sk-rank" id="olRank"><div class="skH"><img class="hi" src="img/ui2/rank_h.webp" alt=""><div id="olPod"></div>${top('trophy','BATTLE RANKING','LIVE · YOUR SERVER')}</div><div class="skB">
  <div class="tabs" id="olRkT"><b data-by="best" class="on">CAMPAIGN</b><b data-by="pow">POWER</b><b data-by="lv">GARAGE</b></div>
  <div class="o-sub"><span class="live">LIVE</span><span id="olUpd"></span></div>
  <div class="body" id="olRkB"></div><div class="pin" id="olRkMe"></div></div></section>
<section class="scr skn sk-chat" id="olChat"><div class="skH"><img class="hi" src="img/ui2/chat_h.webp" alt="">${top('chat','WORLD CHAT','AUTO-TRANSLATE')}</div><div class="skB">
  <div class="tabs" id="olChT"><b data-ch="w" class="on">WORLD</b><b data-ch="a">ARENA</b><b data-tr="1" id="olTrB"></b></div>
  <div class="msgs" id="olMsgs"></div></div>
  <div class="inp"><input id="olIn" maxlength="200" enterkeyhint="send" placeholder="Write a message…" autocomplete="off"><button class="btn shine" id="olSend">SEND</button></div></section>
<section class="scr sk-arena" id="olArena">${top('arena','ARENA','PVP · WEEKLY SEASON')}
  <div class="tabs" id="olArT"><b data-t="fight" class="on">FIGHT</b><b data-t="shop">SHOP</b><b data-t="mile">REWARDS<i id="olAmDot"></i></b><b data-t="top">TOP</b><b data-t="hist">HISTORY</b></div>
  <div class="body" id="olArB"></div></section>
<section class="scr skn sk-cup" id="olCupS"><div class="skH"><img class="hi" src="img/ui2/cup_h.webp" alt="">${top('cup','TORQUE CUP','WEEKEND TOURNAMENT')}</div><div class="skB">
  <div class="body" id="olCupB"></div></div></section>
<section class="scr skn sk-profile" id="olProf"><div class="skH"><img class="hi" src="img/ui2/profile_h.webp" alt=""><div id="olPrH"></div>${top('user','MY PROFILE','NAME · ICON · FRAME · TITLE')}</div><div class="skB">
  <div class="body" id="olPrB"></div></div></section>
<div class="nav" id="olNav"><b data-s="olRank"><img src="img/ui3/on_rank.webp" alt="">RANKING</b><b data-s="olChat"><img src="img/ui3/on_chat.webp" alt="">CHAT<i id="olChDot"></i></b><b data-s="olArena"><img src="img/ui3/on_arena.webp" alt="">ARENA<i id="olArDot"></i></b><b data-s="olCupS"><img src="img/ui3/on_cup.webp" alt="">CUP</b><b data-s="olProf"><img src="img/ui3/on_prof.webp" alt="">PROFILE</b></div>
<div id="olFx"><canvas id="olFc"></canvas><div class="vs" id="olVs"></div><div class="ctl"><button id="olSpd">×2 ⏩</button><button id="olSkip">SKIP ⏭</button></div><div class="res" id="olRes"></div></div>`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);document.body.appendChild(root);

// ------------------------------------------------------------------ state
let ME=null,inboxN=0,chatLast=+(LS('te_chat_seen')||0),chatSrvLast=0,cur='',open_=false,polls={},rkBy='best',rkPrev={},chCh='w',chSince=0,chList=[],arTab='fight',arData=null;
let autoTr=LS('te_tr')!=='0';const mutes=new Set(JSON.parse(LS('te_mutes')||'[]'));
function unlocksLocal(){const G=T()&&T().G;if(!G)return [];const o=[],b=G.cp?G.cp.best:0;if(b>=40)o.push('wr');if(b>=80)o.push('boss');if((G.rep||0)>=10)o.push('speed');if((G.rep||0)>=5)o.push('f1');if(T().PK&&T().PK.fdr)o.push('fdr');if(T().PK&&(+T().PK.rail||0)>Date.now())o.push('rail');
  if(G.gear&&(G.gear.inv||[]).some(it=>it.r>=4))o.push('gear');
  // v16-174: new titles – once reached they stay (G.ttl is saved with the game)
  try{const X=G.ttl||(G.ttl={}),ok=(k,c)=>{if(c)X[k]=1;},tw=(G.tw&&G.tw.b)||0,own=(G.h&&G.h.own)||{},t=T();
    ok('trny',((G.st&&G.st.ar)||0)>=100);ok('raid',((G.st&&G.st.w)||0)>=50);ok('twr',tw>=100);ok('sky',tw>=500);
    ok('dgm',!!G.dg&&['vault','mine','forge','lab'].every(k=>((G.dg.b||{})[k]||0)>=50));ok('bhunt',!!G.wb&&(G.wb.cl||[]).includes(G.wb.tv===2?11:5));
    ok('coll',!!G.cc&&(G.cc.own||[]).length>=10);ok('hard',!!G.cph&&(G.cph.best||0)>=100);ok('daily',!!G.ci&&(G.ci.n||0)>=30);
    ok('lucky',Object.keys(own).some(k=>/^m5_/.test(k)));ok('awk',!!t.mTier&&Object.keys(own).some(k=>/^m5_/.test(k)&&t.mTier((own[k]||{}).s||0)>=1));
    ok('tw3',tw>=300);ok('call',!!G.cc&&(G.cc.own||[]).length>=12);ok('gty',Math.max(0,...Object.values(G.lv||{}).map(v=>+v||0))>=50);for(const k in X)if(X[k])o.push(k);}catch(e){}
  return o;}
// v16-82: G.vip = VIP POINTS; the server and the profile need the VIP LEVEL (0-10 since v16-122)
// v16-122: VIP badge pictures (img/vip/v1-10) next to names; -1 = the player hides his VIP
const vipB=n=>n>0?`<img class="vipB" src="img/vip/v${Math.min(10,n)}.webp" alt="VIP ${n}">`:'';
function vipLv(G){const P=typeof VIP_PTS!=='undefined'?VIP_PTS:null,v=G&&G.vip||0;if(!P)return 0;let n=0;for(let i=1;i<P.length;i++)if(v>=P[i])n=i;return n;}
async function sync(){
  const t=T(),c=C();if(!t||!t.G||!c||!c.arenaTeam||!PID())return;
  let team=[];try{team=c.arenaTeam();}catch(e){}
  const G=t.G,lv=Object.values(G.lv||{}).reduce((a,b)=>a+b,0)+Object.values(G.lx||{}).reduce((a,b)=>a+b,0);
  const r=await call('sync',{srv:window.CLOUD?CLOUD.srv():1,lang:LANG,s:{best:G.cp?G.cp.best:0,vip:vipLv(G),rep:G.rep||0,lv},team,unl:unlocksLocal(),pids:window.SEC&&SEC.pids?SEC.pids():undefined,icon:LS('te_icon')||undefined,annId});
  if(r.ok){ME=r.me;inboxN=r.inbox;chatSrvLast=r.chatLast;arenaTk=r.arenaTk;if(r.gp0)LS('te_gp0_'+(window.CLOUD?CLOUD.srv():1),String(r.gp0));if(r.gp1)LS('te_gp1_'+(window.CLOUD?CLOUD.srv():1),String(r.gp1));if(r.pat&&window.GPX&&GPX.pat)GPX.pat(r.pat);if(r.ann)annGot(r.ann);dots();if(open_)hdr();}
  return r;}
let arenaTk=0;
function dots(){const ch=chatSrvLast>chatLast;const a=$('chDot');if(a)a.classList.toggle('on',ch||inboxN>0);$('olChDot').classList.toggle('on',ch);
  const mr=!!(asData&&asData.mile.some(m=>!m.got&&asData.w>=m.n));const ad=$('arDot');if(ad){ad.classList.toggle('on',arenaTk>0||mr);ad.dataset.t=arenaTk>0?String(arenaTk):mr?'GIFT':'';}const ft=document.querySelector('#olArT [data-t=fight]');if(ft){let q=ft.querySelector('.rdt');if(arenaTk>0){if(!q){ft.insertAdjacentHTML('beforeend','<b class="rdt" style="right:-2px;top:-6px"></b>');q=ft.querySelector('.rdt');}q.textContent=arenaTk;}else if(q)q.remove();}$('olArDot').classList.toggle('on',arenaTk>0);const md=$('olAmDot');if(md)md.classList.toggle('on',!!(asData&&asData.mile.some(m=>!m.got&&asData.w>=m.n)));}
function hdr(){root.querySelectorAll('[data-srv]').forEach(e=>e.textContent='🌍 S'+(window.CLOUD?CLOUD.srv():1));
  root.querySelectorAll('[data-gift]').forEach(e=>{e.classList.toggle('on',inboxN>0);e.querySelector('i').textContent=inboxN;});}
setInterval(()=>{if(document.visibilityState==='visible')sync();},5*60e3);
setTimeout(sync,12000);

// ------------------------------------------------------------------ open / close / tabs
// v16-231 (Marius: "Arena easier to reach, not from the chat"): opened from the BATTLE HUB → SOLO page (no Chat/Ranking bar), ✕ goes back to the Battle Hub
function openHub(s,o){if(!API()){toast('📶 Online features need an internet connection');return;}
  root.classList.toggle('solo',!!(o&&o.solo));root.classList.add('open');open_=true;window.__ONLINE_ON=true;show(s||'olRank');sync().then(()=>{if(cur==='olProf')renderProf();});}
function closeHub(noBack){const so=root.classList.contains('solo')&&noBack!==1;root.classList.remove('open','solo');open_=false;window.__ONLINE_ON=false;stopPolls();closeMenu();if(so&&window.CAMPAIGN&&CAMPAIGN.hub)try{CAMPAIGN.hub();}catch(e){}}
function stopPolls(){for(const k in polls){clearInterval(polls[k]);delete polls[k];}}
function show(s){cur=s;stopPolls();closeMenu();
  root.querySelectorAll('.nav b').forEach(x=>x.classList.toggle('on',x.dataset.s===s));root.querySelectorAll('.scr').forEach(x=>x.classList.toggle('on',x.id===s));hdr();
  if(s==='olRank'){loadRank(true);polls.r=setInterval(()=>loadRank(false),10000);}
  if(s==='olChat'){chatOpen();}
  if(s==='olArena'){loadArena();polls.a=setInterval(arenaTick,1000);}
  if(s==='olCupS'){loadCup();polls.c=setInterval(cupTick,1000);}
  if(s==='olProf'){renderProf();}}
root.addEventListener('click',e=>{
  const nb=e.target.closest('.nav b');if(nb){show(nb.dataset.s);return;}
  if(e.target.closest('[data-x]')){closeHub();return;}
  if(e.target.closest('[data-gift]')){openInbox();return;}
  const pv=e.target.closest('[data-uid]');if(pv&&!e.target.closest('.fight,.play,.menu')&&!e.target.closest('#olMsgs')){const u=+pv.dataset.uid;if(u>0)viewProfile(u);}
});

// ------------------------------------------------------------------ RANKING
async function loadRank(first){
  const r=await call('rank',{by:rkBy});const B=$('olRkB');
  if(!r.ok){if(first)B.innerHTML=`<div class="empty">📶 Could not reach the server.<br>Check your internet and try again.</div>`;return;}
  $('olUpd').textContent=`${r.total} player${r.total===1?'':'s'} · ${new Date(r.time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})}`;
  const val=p=>rkBy==='best'?stLab(p.best):rkBy==='pow'?PWh+' '+fmtN(p.pow):'🏗️ '+p.lv;
  const subv=p=>rkBy==='best'?PWh+' '+fmtN(p.pow):'⚔️ '+stLab(p.best);
  const L=r.list;
  // v16-47: top 3 stand on the podium of Marius' ranking page (header)
  {const P=$('olPod');P.innerHTML=[1,0,2].map(i=>{const p=L[i];return `<div class="pd p${i+1}" ${p?`data-uid="${p.uid}"`:''}>${i===0?'<svg class="crown" viewBox="0 0 64 48"><use href="#olCrown"/></svg>':''}<div class="av">${p?avf(p.icon,p.frame):''}</div><div class="pn"><b>${p?'<span class="pnm">'+flag(p.cc)+' '+esc(p.name)+'</span>'+vipB(p.vip):'—'}</b><small>${p?val(p):''}</small></div></div>`;}).join('');}
  if(first||!B.querySelector('#olRows')){
    const pod=[1,0,2].map(i=>{const p=L[i];if(!p)return `<div class="g g${i+1}" style="opacity:.25">${medal(i+1)}<div class="av">${avf('m0_0',0)}</div><div class="o-n">—</div></div>`;
      return `<div class="g g${i+1}" data-uid="${p.uid}">${i===0?'<svg class="crown" viewBox="0 0 64 48"><use href="#olCrown"/></svg>':''}${medal(i+1)}<div class="av">${avf(p.icon,p.frame)}</div><div class="o-n">${flag(p.cc)} ${onD(p)}${nmc(p)} ${vipB(p.vip)}</div>${tt(p.title)}<div class="o-st" data-v>${val(p)}</div><div class="ps">${subv(p)}</div></div>`;}).join('');
    B.innerHTML=`<div id="olRows"></div><div class="o-note">Top 100 of your server · tap a player to see his profile</div>`;}

  const rows=$('olRows');const html=L.slice(3).map((p,i)=>{const ch=rkPrev[p.uid]!==undefined&&rkPrev[p.uid]!==p[rkBy];
    return `<div class="o-row rk3 ${first?'in':''} ${ch?'flash':''} ${p.uid===r.me.uid?'me':''}" style="${first?`animation-delay:${Math.min(.8,.25+i*.05)}s`:''}" data-uid="${p.uid}"><span class="k">${i+4}</span>${fav(p.icon,p.frame)}<div class="o-nm"><b>${flag(p.cc)} ${onD(p)}${nmc(p)} ${vipB(p.vip)}</b><small>${tt(p.title)} ${subv(p)}</small></div><div class="v">${val(p)}<small>${rkBy==='best'&&p.today?`<span class="o-up">▲${p.today}</span> today`:''}</small></div></div>`;}).join('');
  rows.innerHTML=html;
  L.forEach(p=>rkPrev[p.uid]=p[rkBy]);
  const m=r.me;$('olRkMe').innerHTML=`<div class="o-row rk3 me" data-uid="${m.uid}"><span class="k">${r.myRank}</span>${fav(m.icon,m.frame)}<div class="o-nm"><b>⭐ ${esc(m.name)} ${vipB(m.vip)}</b><small>${tt(m.title)} ${subv(m)}</small></div><div class="v">${val(m)}<small>${rkBy==='best'&&m.today?`<span class="o-up">▲${m.today}</span> today`:''}</small></div></div>`;}
$('olRkT').onclick=e=>{const b=e.target.closest('b');if(!b)return;rkBy=b.dataset.by;$('olRkT').querySelectorAll('b').forEach(x=>x.classList.toggle('on',x===b));rkPrev={};loadRank(true);};

// ------------------------------------------------------------------ CHAT
const LNAME={en:'English',ro:'Română',fr:'Français',es:'Español',pt:'Português',de:'Deutsch',it:'Italiano',pl:'Polski',tr:'Türkçe',nl:'Nederlands',ru:'Русский',uk:'Українська',ar:'العربية',hi:'हिन्दी',id:'Indonesia',ja:'日本語',ko:'한국어',zh:'中文',vi:'Tiếng Việt',th:'ไทย',hu:'Magyar',cs:'Čeština',el:'Ελληνικά',sv:'Svenska'};
function trBtn(){$('olTrB').textContent='🌐 '+(autoTr?'AUTO: ON':'AUTO: OFF');$('olTrB').classList.toggle('on',autoTr);}
function chatOpen(){trBtn();
  if(LS('te_chat_ok')!=='1'){modal(`<h4>💬 Chat rules</h4><p>Be nice – this chat is for everyone 13+.<br><br>❌ No insults, hate, bullying or adult content<br>❌ No spam, links or ads<br>❌ No personal info (phone, address, e-mail…)<br>❌ No selling or trading accounts<br><br>Bad words are hidden automatically. Long-press a message to <b>Mute</b> or <b>Report</b> a player. Players who break the rules are muted or banned.<br><br>Messages are translated automatically by our server (Cloudflare) and are deleted after 7 days.</p><div class="ok"><button class="btn gray" data-m="no">NOT NOW</button><button class="btn shine" data-m="ok">I AGREE</button></div>`,
    b=>{if(b==='ok'){LS('te_chat_ok','1');chatOpen();}else show('olRank');});return;}
  chSince=0;chList=[];$('olMsgs').innerHTML='<div class="empty">Loading…</div>';loadChat();polls.ch=setInterval(loadChat,5000);}
let chBusy=false;
async function loadChat(){if(chBusy)return;chBusy=true;const r=await call('chat',{ch:chCh,since:chSince,lang:LANG,tr:autoTr});chBusy=false;
  const box=$('olMsgs');if(!r.ok){if(!chList.length)box.innerHTML=`<div class="empty">📶 Could not reach the chat.</div>`;return;}
  if(!chList.length)box.innerHTML='';
  const near=box.scrollHeight-box.scrollTop-box.clientHeight<80;
  for(const m of r.list){if(m.id<=chSince)continue;chSince=m.id;chList.push(m);if(m.uid&&mutes.has(m.uid))continue;box.insertAdjacentHTML('beforeend',msgHtml(m));}
  if(!chList.length)box.innerHTML=`<div class="empty">No messages yet.<br>Say hi to your server! 👋</div>`;
  if(near||r.list.length)box.scrollTop=1e6;
  if(chCh==='w'&&chSince>chatLast){chatLast=chSince;LS('te_chat_seen',String(chatLast));dots();}}
function msgHtml(m){const tm=new Date(m.t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  if(m.sys)return `<div class="sys${m.sys===2?' s2'+(/ASCENDED/.test(m.txt)?' g':''):''}"><span class="shine">${esc(m.txt)}</span></div>`;
  const txt=autoTr&&m.tr?m.tr:m.txt;const trl=autoTr&&m.tr?`<div class="tr">🌐 translated from ${LNAME[m.lang]||m.lang} · <u data-orig="${m.id}">show original</u></div>`:'';
  if(m.me)return `<div class="m me" data-mid="${m.id}">${fav(m.icon,m.frame)}<div class="bub"><div class="h" style="justify-content:flex-end"><span class="tm">${tm}</span>${tt(m.title)} You</div><p>${esc(m.txt)}</p></div></div>`;
  return `<div class="m" data-mid="${m.id}" data-u="${m.uid}">${fav(m.icon,m.frame)}<div class="bub"><div class="h">${flag(m.cc)} ${nmc(m)} ${vipB(m.vip)} ${tt(m.title)}<span class="tm">${tm}</span></div><p>${esc(txt)}</p>${trl}</div></div>`;}
$('olMsgs').addEventListener('click',e=>{const o=e.target.closest('[data-orig]');if(o){const m=chList.find(x=>x.id===+o.dataset.orig);if(m){const p=o.closest('.bub').querySelector('p');const sh=o.textContent==='show original';p.textContent=sh?m.txt:m.tr;o.textContent=sh?'show translation':'show original';}return;}
  const mm=e.target.closest('.m[data-u]');if(mm&&!e.target.closest('.menu'))openMenu(mm);});
let lpT=0;$('olMsgs').addEventListener('touchstart',e=>{const mm=e.target.closest('.m[data-u]');if(!mm)return;clearTimeout(lpT);lpT=setTimeout(()=>openMenu(mm),450);},{passive:true});
$('olMsgs').addEventListener('touchend',()=>clearTimeout(lpT),{passive:true});$('olMsgs').addEventListener('touchmove',()=>clearTimeout(lpT),{passive:true});
function closeMenu(){root.querySelectorAll('.menu').forEach(m=>m.remove());}
function openMenu(mm){closeMenu();const mid=+mm.dataset.mid,uid=+mm.dataset.u,box=$('olMsgs');const m=chList.find(x=>x.id===mid);
  const d=document.createElement('div');d.className='menu';d.innerHTML=`<div data-a="prof">👤 View profile</div><div data-a="copy">📋 Copy</div><div data-a="mute">🔇 ${mutes.has(uid)?'Unmute':'Mute'} player</div><div data-a="rep">🚩 Report</div>`;
  d.style.left='56px';d.style.top=(mm.offsetTop+Math.min(40,mm.offsetHeight-10))+'px';box.appendChild(d);
  d.onclick=async e=>{const a=e.target.closest('[data-a]');if(!a)return;e.stopPropagation();closeMenu();
    if(a.dataset.a==='prof')viewProfile(uid);
    if(a.dataset.a==='copy'){try{await navigator.clipboard.writeText(m?(autoTr&&m.tr?m.tr:m.txt):'');toast('📋 Copied');}catch(er){}}
    if(a.dataset.a==='mute'){if(mutes.has(uid))mutes.delete(uid);else mutes.add(uid);LS('te_mutes',JSON.stringify([...mutes]));toast(mutes.has(uid)?'🔇 Player muted – you will not see his messages':'🔈 Player unmuted');chSince=0;chList=[];box.innerHTML='';loadChat();}
    if(a.dataset.a==='rep'){modal(`<h4>🚩 Report this message?</h4><p>“${esc(m?m.txt:'')}”<br><br>Our team will check it. After 3 reports the message is hidden automatically.</p><div class="ok"><button class="btn gray" data-m="no">CANCEL</button><button class="btn" data-m="ok">REPORT</button></div>`,async b=>{if(b!=='ok')return;const r=await call('report',{mid});toast(r.ok?'🚩 Thank you – the message was reported':'⚠️ Could not report');});}};}
document.addEventListener('click',e=>{if(!e.target.closest('.menu')&&!e.target.closest('.m[data-u]'))closeMenu();},true);
$('olChT').onclick=e=>{const b=e.target.closest('b');if(!b)return;if(b.dataset.tr){autoTr=!autoTr;LS('te_tr',autoTr?'1':'0');trBtn();chSince=0;chList=[];$('olMsgs').innerHTML='';loadChat();return;}
  chCh=b.dataset.ch;$('olChT').querySelectorAll('b[data-ch]').forEach(x=>x.classList.toggle('on',x===b));chSince=0;chList=[];$('olMsgs').innerHTML='';loadChat();};
async function send(){const i=$('olIn'),txt=i.value.trim();if(!txt)return;
  const r=await call('say',{ch:chCh,txt,lang:LANG});
  if(r.ok){i.value='';loadChat();return;}
  const E={need_name:'✏️ Choose your player name first (Profile)',slow:'⏳ Slow down – wait a few seconds',muted:'🔇 You are muted until '+(r.until?new Date(r.until).toLocaleString():''),banned:'🚫 Your account is blocked',test:'🧪 Test account – chat is read-only',network:'📶 No connection'};
  toast(E[r.err]||'⚠️ Message not sent',3000);if(r.err==='need_name'){show('olProf');setTimeout(nameModal,300);}}
$('olSend').onclick=send;$('olIn').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();send();}});

// ------------------------------------------------------------------ ARENA
function tierPct(t,p){return t.next?Math.max(4,Math.min(100,(p-t.from)/(t.next-t.from)*100)):100;}
async function loadArena(){const B=$('olArB');if(LS('te_aleg')==='1'){LS('te_aleg','0');setTimeout(legPick,300);}if(!arData)B.innerHTML='<div class="empty">Loading…</div>';
  if(arTab==='top')return arTop();if(arTab==='hist')return arHist();if(arTab==='shop'||arTab==='mile')return arShop();
  const r=await call('arena',{});if(r.banned){B.innerHTML='<div class="empty">🚫 Your account is blocked.</div>';return;}
  if(!r.ok){B.innerHTML=`<div class="empty">📶 Could not reach the Arena.</div>`;return;}
  arData=r;arenaTk=r.tk;dots();const t=r.tier;
  B.innerHTML=`<div class="ahero ah3"><div class="badge">${badge(t.lg,t.div||'★')}</div><div class="t"><b>${t.name}</b><small>🏅 ${r.pts} points · rank #${r.rank} · ${r.w}W / ${r.l}L</small><div class="o-bar"><i style="width:0"></i></div><small>${t.next?`${t.next-r.pts} pts to the next division`:'Top league!'} · season ${r.season} ends in <span id="olSeason">${dur(r.end-Date.now())}</span></small></div></div>
   <div class="tk"><span>⚔️ Arena fights <b id="olTk">${r.tk}</b> / ${r.tkMax} <span id="olTkN"></span></span><span>🎁 daily reward 22:00</span></div>
   <div id="olOpps">${r.opp.map((o,i)=>`<div class="opp" style="animation-delay:${.1+i*.08}s" ${o.uid?`data-uid="${o.uid}"`:''}><div class="bd">${badge(o.tier.lg)}</div><div class="tm">${o.team.slice(0,5).map(h=>ring(h.id)).join('')}</div><div class="o-nm"><b>${flag(o.cc)} ${esc(o.name)} ${o.bot?'<span class="ai">AI</span>':''}</b><small>🏅 ${o.pts} · ${PWh} ${fmtN(o.pow)}</small></div><button class="fight f3 ${r.tk>0?'':'off'}" data-fight="${esc(o.key)}"><small>+${win(r.pts,o.pts)} pts</small></button></div>`).join('')}</div>
   <div class="btns"><div class="shine" data-a="def">🛡️ MY TEAM</div><div class="shine" data-a="ref">🔄 NEW RIVALS</div></div>
   <div class="leag">${LG.map((l,i)=>`<div class="${i===t.lg?'on':''}">${badge(i)}${l[0]}</div>`).join('')}</div>
   <div class="o-note">Fights are automatic: your <b>battle team</b> (with gear) against the other player's team – he does not need to be online. Win = up to +${win(r.pts,r.pts+400)} points. When others attack you, you lose a few points only if they win.<br>Rivals marked <span class="ai">AI</span> are training rivals while the server is still filling up.</div>
   <h3>DAILY REWARD (22:00)</h3><div class="o-rw">${r.daily.map((d,i)=>`<span>${d.lg}</span><span>${DMh} ${d.dm} · ${TKh} ${d.tk} · ${AMh} ${AM_DAILY[i]}</span>`).join('')}</div>`;
  requestAnimationFrame(()=>{const i=B.querySelector('.ahero .o-bar i');if(i)i.style.width=tierPct(t,r.pts)+'%';});arenaTick();}
// ------------------------------------------------------------------ v16-212 ARENA SHOP + MILESTONE REWARDS (Marius 23 nov) – medals live on the SERVER
const AMh='<img class="tki" src="img/arena/am_medal.webp" alt="">',AM_DAILY=[20,30,45,60,80,100];
const DGNm={vault:'Cash Vault',mine:'Scrap Mine',forge:'Gear Forge',lab:'Essence Lab'};
let asData=null;
const asIc=k=>k==='tk'?'img/ticket.webp':k==='gt'?'img/gticket.webp':k==='ct'?'img/cticket.webp':k[0]==='k'&&k[1]==='_'?'img/dg/k_'+k.slice(2)+'.webp':k==='ess'?'img/ui9/essence.webp':k==='bk'?'img/ui12/pk_bk.webp':k==='leg'?'img/arena/am_chest2.webp':k==='agf'?'img/ui3/on_arena.webp':'img/ui/ic_arena.webp';
function asReal(rw){const t=T()||{},o={};for(const k in rw){if(k==='essU')o.ess=Math.round(rw[k]*(t.ESS_U?t.ESS_U():300));else if(k==='bkU')o.pk={r:0,bk:Math.round(rw[k]*300*(t.PART_U?t.PART_U():1))};else if(k==='keys'||k==='leg'||k==='unl'||k==='am')o[k]=rw[k];else o[k]=rw[k];}return o;}
function asName(k,rw){const r=asReal(rw);return {tk:'Recruit Ticket',gt:'Gear Ticket',ct:'Crew Ticket',ess:fmtN(r.ess||0)+' Essence',bk:fmtN(r.pk?r.pk.bk:0)+' Builder Kit',leg:'Legendary Hero (choose)',agf:'Gladiator Frame',awl:'Title ARENA WARLORD'}[k]||(k[0]==='k'?(DGNm[k.slice(2)]||'Dungeon')+' Key':k);}
function rwLine(rw){const r=asReal(rw),a=[];if(r.dm)a.push(DMh+' '+r.dm);if(r.tk)a.push(TKh+' '+r.tk);if(r.gt)a.push(GTh+' '+r.gt);if(r.ct)a.push(CTh+' '+r.ct);if(r.am)a.push(AMh+' '+r.am);
  if(r.keys)for(const k in r.keys)a.push('<img class="tki" src="img/dg/k_'+k+'.webp" alt=""> '+r.keys[k]);return a.join(' · ');}
function asGive(rw){const t=T();if(!t)return;const r=asReal(rw);if(r.keys&&window.DGK)for(const k in r.keys)DGK.add(k,r.keys[k]);
  const g={};['dm','tk','gt','ct','ess','pk'].forEach(k=>{if(r[k])g[k]=r[k];});if(Object.keys(g).length&&t.giveRw)t.giveRw(g);
  if(r.leg){legPick();}if(r.unl){sync().then(()=>{try{renderProf();}catch(e){}});}if(t.save)t.save();}
function legPick(){const t=T();const L=(t.HEROES||[]).filter(h=>h.cat==='m'&&h.gr===4&&!h.soon);
  const d=modal(`<h4>${AMh} CHOOSE 1 LEGENDARY</h4><p>Tap a hero. It joins your team (or adds a copy).</p><div class="asLeg">${L.map(h=>`<div data-m="h_${h.id}">${ring(h.id)}<small>${esc(h.n)}</small></div>`).join('')}</div>`,
    b=>{if(!b||b.slice(0,2)!=='h_')return false;const id=b.slice(2);t.gain(id);try{t.heroRefresh();}catch(e){}if(t.save)t.save();toast('🏆 '+esc(t.HB&&t.HB[id]?t.HB[id].n:'Legendary')+' joined your team!',3200);LS('te_aleg','0');return true;});
  d.querySelector('[data-mx]').remove();LS('te_aleg','1');}   // the choice cannot be closed – if the game is killed, it comes back at the next opening
async function arShop(){const B=$('olArB');if(!asData)B.innerHTML='<div class="empty">Loading…</div>';const r=await call('ashop',{});
  if(r.banned){B.innerHTML='<div class="empty">🚫 Your account is blocked.</div>';return;}if(!r.ok){B.innerHTML='<div class="empty">📶 Could not reach the Arena.</div>';return;}asData=r;asRender();}
function asRender(){const B=$('olArB'),r=asData;if(!r)return;dots();
  const head=`<div class="asHd"><span>${AMh} <b>${fmtN(r.med)}</b> Arena Medals</span><small>Season ${r.season} · ${r.w} wins · resets in ${dur(r.end-Date.now())}</small></div>`;
  if(arTab==='shop'){B.innerHTML=`<img class="asT" src="img/arena/as_title.webp" alt="ARENA SHOP">${head}<div class="asG">${r.shop.map(x=>{const lim=x.k==='leg'?1:x.lim,left=x.once?(x.own?0:1):lim?lim-x.used:9,off=left<=0||r.med<x.pr;
      return `<div class="asC ${left<=0?'sold':''}"><img class="ic" src="${asIc(x.k)}" alt=""><b>${asName(x.k,x.rw)}</b><small>${x.once?(x.own?'OWNED':'once'):x.k==='leg'?(left?'1 / month':'next month'):lim?(x.g?`keys ${x.used} / ${lim} week`:`${x.used} / ${lim} this week`):''}</small><button class="${off?'off':''}" data-ab="${x.k}">${left<=0?'✓':AMh+' '+fmtN(x.pr)}</button></div>`;}).join('')}</div>
    <div class="o-note">Earn ${AMh} medals: <b>+10</b> per win · <b>+3</b> per loss · daily reward by league (${AMh} 20 → 100) · season end (${AMh} 100 → 1,000). Weekly limits reset with the season (Monday).</div>`;return;}
  const mx=r.mile[r.mile.length-1].n,pct=Math.min(100,r.w/mx*100);
  B.innerHTML=`${head}<div class="amTr"><img src="img/arena/am_bar.webp" alt=""><i style="width:${pct*.86}%"></i><span>${r.w} / ${mx} WINS</span></div>
   ${r.mile.map((m,i)=>{const ok=r.w>=m.n;return `<div class="amR ${m.got?'got':ok?'rdy':''}"><img class="ch" src="img/arena/am_chest${i<3?0:i<6?1:2}.webp" alt=""><div class="t"><b>${m.n} WINS</b><small>${rwLine(m.rw)}</small></div><button data-am="${i}" class="${m.got||!ok?'off':''}" style="position:relative">${!m.got&&ok?'<i class="rdd"></i>':''}${m.got?'✓':ok?'CLAIM':`${Math.min(r.w,m.n)}/${m.n}`}</button></div>`;}).join('')}
   <div class="o-note">Win Arena fights to open the chests. Wins and chests reset every season (Monday).</div>`;}
async function asBuy(k){const x=asData&&asData.shop.find(z=>z.k===k);if(!x)return;
  if(x.once&&x.own)return toast('✓ You already own it');if(asData.med<x.pr)return toast(AMh+' Not enough Arena Medals ('+fmtN(x.pr)+')',2400);
  modal(`<h4>Buy ${asName(k,x.rw)}?</h4><p style="text-align:center"><img src="${asIc(k)}" style="width:64px" alt=""><br>for ${AMh} <b>${fmtN(x.pr)}</b> Arena Medals</p><div class="ok"><button class="btn gray" data-m="no">NO</button><button class="btn" data-m="ok">YES, BUY</button></div>`,async b=>{if(b!=='ok')return;
    const r=await call('abuy',{k});if(!r.ok){toast({medals:'Not enough Arena Medals',limit:'Limit reached',owned:'You already own it',network:'📶 No connection'}[r.err]||'⚠️ Could not buy',2400);return;}
    asData=r;asGive(r.rw);toast('🛒 '+asName(k,x.rw),2200);asRender();});}
async function asMile(i){const r=await call('amile',{i});if(!r.ok){toast({wins:'Win more Arena fights first',claimed:'Already claimed'}[r.err]||'⚠️ Could not claim',2200);return;}
  asData=r;asGive(r.rw);toast('🎁 '+rwLine(r.rw),2600);asRender();}
const win=(a,b)=>{const E=1/(1+Math.pow(10,(b-a)/400));return Math.max(6,Math.round(32*(1-E))+4);};
function arenaTick(){if(!arData||arTab!=='fight')return;const s=$('olSeason');if(s)s.textContent=dur(arData.end-Date.now());const n=$('olTkN');if(n)n.textContent=arData.tkNext?'· +1 in '+dur(arData.tkNext-Date.now()):'';
  if(arData.tkNext&&Date.now()>arData.tkNext+1500){arData.tkNext=0;loadArena();}}
async function arTop(){const B=$('olArB');const r=await call('atop',{});if(!r.ok){B.innerHTML='<div class="empty">📶 Could not load.</div>';return;}
  B.innerHTML=r.list.length?r.list.map((p,i)=>`<div class="o-row ar3 in ${ME&&p.uid===ME.uid?'me':''}" style="animation-delay:${Math.min(.6,i*.04)}s" data-uid="${p.uid}"><span class="k">${i+1}</span>${fav(p.icon,p.frame)}<div class="o-nm"><b>${flag(p.cc)} ${onD(p)}${nmc(p)}</b><small>${tt(p.title)} ${p.w}W / ${p.l}L</small></div><div style="width:30px">${badge(p.tier.lg)}</div><div class="v">${p.pts}<small>${p.tier.name}</small></div></div>`).join(''):'<div class="empty">Nobody in the Arena yet – be the first!</div>';}
async function arHist(){const B=$('olArB');const r=await call('hist',{});if(!r.ok){B.innerHTML='<div class="empty">📶 Could not load.</div>';return;}
  B.innerHTML=r.list.length?r.list.map(h=>`<div class="hrow ${h.win?'hw':'hl'}"><b class="w ${h.win?'o-y':'o-n'}">${h.win?'WIN':'LOSS'}</b><span>${h.kind==='cup'?'🏟️':h.atk?'⚔️ you attacked':'🛡️ attacked you:'} <b>${esc(h.other)}</b><br><small>${new Date(h.t).toLocaleString([],{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})} · ${h.d>0?'+':''}${h.d} pts</small></span><button class="play" data-replay="${h.id}">▶ WATCH</button></div>`).join(''):'<div class="empty">No fights yet.</div>';}
$('olArT').onclick=e=>{const b=e.target.closest('b');if(!b)return;arTab=b.dataset.t;$('olArT').querySelectorAll('b').forEach(x=>x.classList.toggle('on',x===b));arData=null;loadArena();};
$('olArB').addEventListener('click',async e=>{
  const ab=e.target.closest('[data-ab]');if(ab){e.stopPropagation();asBuy(ab.dataset.ab);return;}const am=e.target.closest('[data-am]');if(am){e.stopPropagation();if(!am.classList.contains('off'))asMile(+am.dataset.am);return;}
  const f=e.target.closest('[data-fight]');if(f){e.stopPropagation();if(f.classList.contains('off')){toast('⚔️ No Arena fights left – +1 every 2 hours');return;}doFight(f.dataset.fight);return;}
  const rp=e.target.closest('[data-replay]');if(rp){e.stopPropagation();const r=await call('replay',{id:+rp.dataset.replay});if(r.ok)playFight(r,true);else toast('⚠️ This fight is too old');return;}
  const a=e.target.closest('[data-a]');if(!a)return;
  if(a.dataset.a==='ref'){const r=await call('refresh',{});if(r.ok&&arData){arData.opp=r.opp;loadArena();}}
  if(a.dataset.a==='def'){const c=C();const tm=c&&c.arenaTeam?c.arenaTeam():[];
    modal(`<h4>🛡️ My Arena team</h4><p>Your Arena team is your <b>battle team</b> from the Campaign (with its gear). It attacks and it also defends you when others attack.</p><div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;margin:8px 0">${tm.map(h=>fcard(h.id,h.s,52)).join('')}</div><p style="text-align:center">${PWh} Power <b style="color:#ffe27a">${fmtN(c&&c.teamPower?c.teamPower():0)}</b></p><div class="ok"><button class="btn gray" data-m="no">CLOSE</button><button class="btn" data-m="ok">⚔️ HEROES PAGE</button></div>`,
      b=>{if(b==='ok'){closeHub(1);if(c){c.open();setTimeout(()=>c.openGear(),50);}}});}});
async function doFight(key){if(fightBusy)return;fightBusy=true;await sync();const r=await call('fight',{key});fightBusy=false;
  if(!r.ok){toast({no_tickets:'⚔️ No Arena fights left',old_opponents:'🔄 Rivals changed – try again',no_team:'⚔️ You need a battle team first',network:'📶 No connection',banned:'🚫 Account blocked'}[r.err]||'⚠️ Could not start the fight',3000);loadArena();return;}
  if(r.rw){const t=T();if(t&&t.giveRw){t.giveRw(r.rw);t.save();}}
  playFight(r,false);}
let fightBusy=false;

// ------------------------------------------------------------------ CUP
let cupData=null;
async function loadCup(){const B=$('olCupB');if(!cupData)B.innerHTML='<div class="empty">Loading…</div>';const r=await call('cup',{});if(!r.ok){B.innerHTML='<div class="empty">📶 Could not reach the Cup.</div>';return;}cupData=r;renderCup();}
const RW=r=>`<div class="o-rw">${[[1,'🏆 Champion'],[2,'🥈 Final'],[4,'🥉 Semi-final'],[8,'Quarter-final'],[16,'Round of 16'],[32,'Round of 32'],[64,'Round of 64']].map(([k,l])=>{const x=r[k];return `<span>${l}</span><span>💎 ${x.dm}${x.tk?' · 🎟️ '+x.tk:''}${x.gt?' · ⚙️ '+x.gt+' Gear':''}${k===1?' · <i class="tt t5">CUP CHAMPION</i>':''}</span>`;}).join('')}</div>`;
const rName=(n,ri)=>{const left=n/Math.pow(2,ri);return left===2?'FINAL':left===4?'SEMI-FINAL':left===8?'QUARTER-FINAL':'ROUND OF '+left;};
let cupR=-1;
// v16-47: the last 8 on Marius' bracket (quarter-final → champion); '?' until known
function bracket(r){const W=905,H=620,bx=(x0,x1,y0,y1,t,cl)=>`<div class="bx ${cl||''}" style="left:${x0/W*100}%;width:${(x1-x0)/W*100}%;top:${y0/H*100}%;height:${(y1-y0)/H*100}%">${t}</div>`;
  const R=r&&r.R||[],n=r&&r.n||0;let qi=-1;for(let i=0;i<R.length;i++)if(n/Math.pow(2,i)===8)qi=i;
  const nm=k=>{if(k==null||k<0||!r.P[k])return '?';const P=r.P[k];return `<span class="${k===r.me?'me':''}">${esc(P.name)}</span>`;};
  const Q=qi>=0?R[qi]||[]:[],S=qi>=0?R[qi+1]||[]:[],F=qi>=0?R[qi+2]||[]:[];
  const QY=[[35,89],[203,257],[343,397],[505,559]],SY=[[125,177],[411,465]];let h='';
  for(let m=0;m<4;m++){const M=Q[m]||{},L=m<2,x=L?[18,166]:[740,887],y0=QY[(m%2)*2],y1=QY[(m%2)*2+1];
    h+=bx(x[0],x[1],y0[0],y0[1],nm(M.a),M.w>=0&&M.w!==M.a&&M.w!=null?'l':'')+bx(x[0],x[1],y1[0],y1[1],nm(M.b),M.w>=0&&M.w!==M.b&&M.w!=null?'l':'');}
  for(let m=0;m<2;m++){const M=S[m]||{},x=m===0?[214,336]:[570,692];h+=bx(x[0],x[1],SY[0][0],SY[0][1],nm(M.a))+bx(x[0],x[1],SY[1][0],SY[1][1],nm(M.b));}
  const fm=F[0]||{};h+=bx(345,560,491,567,fm.w>=0&&fm.w!=null?'🏆 '+nm(fm.w):fm.a!=null?nm(fm.a)+' <i>vs</i> '+nm(fm.b):'🏆 ?','fin');
  return `<h3>FINAL 8</h3><div class="brk">${h}</div>`;}
function renderCup(){const r=cupData,B=$('olCupB');
  const head=(t,sub,cd)=>`<div class="tw"><svg class="tro" viewBox="0 0 64 64"><use href="#olCup"/></svg><b>${t}</b><small>${sub}</small>${cd?`<div class="cd" id="olCd"></div><small id="olCdL">${cd}</small>`:''}</div>`;
  if(r.state==='wait'){
    B.innerHTML=head(`WEEKEND CUP #${r.num}`,'The best 64 players of the Arena qualify on Friday 22:00 · knock-out · 1 round every 3 h · your battle team fights for you','until the qualification')+
     (r.last&&r.last.done?`<h3>LAST CUP CHAMPION</h3><div class="o-row" ${r.last.P[r.last.champ].uid?`data-uid="${r.last.P[r.last.champ].uid}"`:''}><span class="k">🏆</span>${fav(r.last.P[r.last.champ].icon,r.last.P[r.last.champ].frame)}<div class="o-nm"><b>${esc(r.last.P[r.last.champ].name)}</b><small>Weekend Cup #${r.num-1}</small></div></div>`:'')+
     bracket(null)+`<h3>REWARDS</h3>${RW(r.rw)}<div class="o-note">Climb the Arena this week to qualify. Rewards are diamonds & tickets earned by playing.</div>`;
    cupT=r.qual;cupTick();return;}
  const ri=cupR<0||cupR>r.R.length-1?r.round:cupR, M=r.R[ri]||[];
  const myM=M.find(m=>m.a===r.me||m.b===r.me);const out=r.me>=0&&r.R.some(rr=>rr.some(m=>(m.a===r.me||m.b===r.me)&&m.w>=0&&m.w!==r.me));
  const sub=r.done?`🏆 Champion: <b>${esc(r.P[r.champ].name)}</b>`:`${r.n} players · ${rName(r.n,r.round)} ${r.me<0?'· you are not in this Cup':out?'· you are out – well played!':'· you are still in! 💪'}`;
  B.innerHTML=head(`WEEKEND CUP #${r.num}`,sub,r.done?'':`until the ${rName(r.n,r.round)}`)+
   `<div class="tabs" id="olCupT" style="padding:0 0 8px;overflow-x:auto">${r.R.map((x,i)=>`<b data-r="${i}" class="${i===ri?'on':''}" style="flex:none;padding:8px 10px">${rName(r.n,i).replace('ROUND OF ','R')}</b>`).join('')}</div>`+
   M.map(m=>{const A=r.P[m.a],Bp=r.P[m.b],me=m.a===r.me||m.b===r.me;const cls=x=>m.w<0?'':m.w===x?'w':'l';
     return `<div class="mt ${me?'me':''}"><div class="sd"><div class="cf ${cls(m.a)} ${m.a===r.me?'me':''}">${fav(A.icon,A.frame)}${esc(A.name)} ${A.bot?'<span class="ai">AI</span>':''}</div><div class="cf ${cls(m.b)} ${m.b===r.me?'me':''}">${fav(Bp.icon,Bp.frame)}${esc(Bp.name)} ${Bp.bot?'<span class="ai">AI</span>':''}</div></div><div class="wb">${m.f?`<button class="play" data-replay="${m.f}">▶</button>`:m.w<0?'<small style="color:#8fa0b4;font:800 10px Game,system-ui">soon</small>':''}</div></div>`;}).join('')+
   bracket(r)+`<h3>REWARDS</h3>${RW(r.rw)}`;
  cupT=r.done?r.nextWeek:r.next;cupTick();}
let cupT=0;function cupTick(){const e=$('olCd');if(!e||!cupT)return;const ms=Math.max(0,cupT-Date.now()),h=Math.floor(ms/36e5),m=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);
  e.innerHTML=(h>=24?`<span>${Math.floor(h/24)}d</span>`:'')+`<span>${String(h%24).padStart(2,'0')}</span><span>${String(m).padStart(2,'0')}</span><span>${String(s).padStart(2,'0')}</span>`;
  if(ms<=0&&cupData&&!cupData._re){cupData._re=1;setTimeout(loadCup,60000);}}
$('olCupB').addEventListener('click',async e=>{const b=e.target.closest('[data-r]');if(b){cupR=+b.dataset.r;renderCup();return;}
  const rp=e.target.closest('[data-replay]');if(rp){e.stopPropagation();const r=await call('replay',{id:+rp.dataset.replay});if(r.ok)playFight(r,true);else toast('⚠️ This fight is too old');}});

// ------------------------------------------------------------------ PROFILE
function myHeroes(){const t=T();if(!t)return [];const G=t.G,o=[];for(const id in G.h.own){const h=t.HB[id];if(h&&h.cat==='m'&&!h.soon)o.push(h);}o.sort((a,b)=>b.gr-a.gr||(G.h.own[b.id].s||0)-(G.h.own[a.id].s||0));return o;}
function renderProf(){const B=$('olPrB');if(!ME){B.innerHTML='<div class="empty">Loading…</div>';return;}
  const u=new Set(ME.unl||[]),G=T().G,vip=vipLv(G),rep=G.rep||0;
  const fOk=f=>f===0||(f===1&&(rep>=5||u.has('f1')))||(f===2&&vip>=3)||(f===3&&(u.has('glad')||u.has('agf')))||(f===4&&(vip>=7||u.has('dia')))||(f===5&&(u.has('leg')||u.has('cup')))||(f===7&&(u.has('fdr')||!!(T().PK&&T().PK.fdr)))||(f===8&&vip>=10)||[[9,'raid'],[10,'tw3'],[11,'bhunt'],[12,'dgm'],[13,'call'],[14,'awk']].some(x=>x[0]===f&&u.has(x[1]));
  const tOk=k=>k==='rook'||u.has(k);
  const H=myHeroes();
  $('olPrH').innerHTML=`${hdrAv(ME.icon,ME.frame)}<div class="pnm"><b>${esc(ME.name)}</b><button class="edit" data-a="name">✏️</button></div><div class="ptt">${tt(ME.title)}</div><div class="pid">${flag(ME.cc)} · ID ${ME.uid} · S${window.CLOUD?CLOUD.srv():1}</div><div class="pvip">${vip?vipB(vip)+' <b>VIP '+vip+'</b>':''}<button class="hvB" data-a="hv">${ME.hv?'🙈 VIP HIDDEN':'👁 VIP VISIBLE'}</button><small>${ME.hv?'Others do not see your VIP level':'Tap to hide your VIP level from others'}</small></div>
    <div class="pst s1">CAMPAIGN<b>⚔️ ${stLab(ME.best)}</b></div><div class="pst s2">TEAM POWER<b>${PWh} ${fmtN(ME.pow)}</b></div><div class="pst s3">GARAGE · CUP<b>🏗️ ${ME.lv} · 🏆 ${ME.cupw||0}</b></div>`;
  B.innerHTML=`   ${/^Mechanic\d+$/.test(ME.name)?`<div class="btns" style="margin-bottom:10px"><div class="shine" data-a="name">✏️ CHOOSE YOUR PLAYER NAME (FREE)</div></div>`:''}
   <h3>ICON · YOUR HEROES</h3><div class="grid" id="olIc">${H.map(h=>ring(h.id,h.id===ME.icon?'sel':'').replace('<div ','<div data-ic="'+h.id+'" ')).join('')||'<small style="color:#8fa0b4">Summon heroes to use them as your icon.</small>'}</div>
   <h3>FRAME</h3><div class="frames">${FR.map(f=>`<div class="${f[0]===ME.frame?'sel':''} ${fOk(f[0])?'':'o-lock'}" data-fr="${f[0]}"><div class="av">${avf(ME.icon,f[0])}</div><small>${f[1]}<br>${fOk(f[0])?(f[0]===ME.frame?'✅ in use':'tap to use'):'🔒 '+f[2]}</small></div>`).join('')}</div>
   <h3>TITLE</h3><div class="tlist">${TORD.map(k=>`<div class="${k===ME.title?'sel':''} ${tOk(k)?'':'o-lock'}" data-tt="${k}">${tt(k)}<span>${TT[k][2]}</span><b>${tOk(k)?(k===ME.title?'✅':''):'🔒'}</b></div>`).join('')}</div>
   <h3>GRAPHICS</h3><div class="tlist" id="olGfx">${[['0','⚙️ AUTO','Best for every phone – lowers the quality by itself if the game gets slow'],['1','✨ HD · MAX QUALITY','Sharpest picture on good phones · uses more battery and memory']].map(g=>`<div class="${(LS('te_hd')==='1'?'1':'0')===g[0]?'sel':''}" data-gfx="${g[0]}">${g[1]}<span>${g[2]}</span><b>${(LS('te_hd')==='1'?'1':'0')===g[0]?'✅':''}</b></div>`).join('')}</div>
   <div class="o-note">Your name, icon, frame and title are shown to other players in the ranking, chat and Arena.<br>Player ID ${ME.uid} · <u data-a="mutes">muted players (${mutes.size})</u></div>`;}
async function setProf(set,paid){const r=await call('prof',{set,paid});
  if(r.ok){ME={...ME,...r.me};renderProf();return r;}
  const E={name_rules:'✏️ 3–14 letters, numbers, _ . -',name_bad:'🚫 This name is not allowed',name_taken:'❌ This name is already used on your server',locked:'🔒 Not unlocked yet',network:'📶 No connection'};
  if(r.err!=='pay')toast(E[r.err]||'⚠️ Could not save',3000);return r;}
$('olPrH').addEventListener('click',e=>{if(e.target.closest('[data-a="name"]'))nameModal();if(e.target.closest('[data-a="hv"]'))setProf({hv:ME.hv?0:1});});
$('olPrB').addEventListener('click',async e=>{
  const a=e.target.closest('[data-a]');if(a&&a.dataset.a==='name'){nameModal();return;}
  if(a&&a.dataset.a==='mutes'){mutes.clear();LS('te_mutes','[]');toast('🔈 All players unmuted');renderProf();return;}
  const gx=e.target.closest('[data-gfx]');if(gx){const v=gx.dataset.gfx;if((LS('te_hd')==='1'?'1':'0')===v)return;LS('te_hd',v==='1'?'1':null);try{T().save();}catch(x){}toast(v==='1'?'✨ HD graphics ON – restarting…':'⚙️ AUTO graphics – restarting…',1500);setTimeout(()=>location.reload(),1200);return;}
  const ic=e.target.closest('[data-ic]');if(ic){LS('te_icon',ic.dataset.ic);await setProf({icon:ic.dataset.ic});return;}
  const fr=e.target.closest('[data-fr]');if(fr){if(fr.classList.contains('o-lock')){toast('🔒 '+((FR.find(x=>x[0]===+fr.dataset.fr)||[])[2]||'Locked'),2500);return;}await setProf({frame:+fr.dataset.fr});return;}
  const tk=e.target.closest('[data-tt]');if(tk){if(tk.classList.contains('o-lock')){toast('🔒 '+TT[tk.dataset.tt][2],2500);return;}await setProf({title:tk.dataset.tt});}});
function nameModal(){const free=!(ME&&ME.chg>0);
  modal(`<h4>✏️ ${free?'CHOOSE YOUR NAME':'CHANGE NAME'}</h4><input id="olNm" maxlength="14" value="${esc(ME&&!/^Mechanic\d+$/.test(ME.name)?ME.name:'')}" placeholder="Your player name"><p>3–14 letters / numbers ( _ . - allowed) · no bad words · one name per server<br>${free?'<b style="color:#7dff8a">This change is FREE</b>':'This change costs <b style="color:#ffe27a">300 '+DMh+'</b> (you have '+fmtN(T().G.dm||0)+')'}</p><div class="ok"><button class="btn gray" data-m="no">CANCEL</button><button class="btn shine" data-m="ok">SAVE</button></div>`,
   async b=>{if(b!=='ok')return true;const n=$('olNm').value.trim();const G=T().G;
     if(!free&&(G.dm||0)<300){toast(DMh+' You need 300 Diamonds',2500);return false;}
     const r=await setProf({name:n},!free);
     if(r.ok){if(!free){G.dm-=300;T().save();}toast('✅ Name saved: '+n,2500);return true;}
     return false;});
  setTimeout(()=>{const i=$('olNm');if(i)i.focus();},200);}
async function viewProfile(uid){const r=await call('view',{uid});if(!r.ok){toast('⚠️ Could not load the profile');return;}const p=r.p;
  modal(`<div class="av" style="width:110px;height:118px;margin:0 auto">${avf(p.icon,p.frame)}</div><h4 style="margin:4px 0">${flag(p.cc)} ${onD(p)}${nmc(p)}</h4><div>${tt(p.title)}</div>
   <div class="stats" style="margin-top:10px;text-align:left"><div>Campaign<b>⚔️ ${stLab(p.best)}</b></div><div>Team power<b>${PWh} ${fmtN(p.pow)}</b></div><div>Arena<b>${p.arena?p.arena.tier.name:'—'}</b></div><div>VIP · Cup wins<b>${p.vip} · 🏆 ${p.cupw}</b></div></div>
   <h3>BATTLE TEAM</h3><div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap">${(p.team||[]).map((h,i)=>`<div data-m="h${i}" class="pkTap">${fcard(h.id,h.s,52)}</div>`).join('')||'<small style="color:#8fa0b4">No battle team yet</small>'}</div>${(p.team||[]).length?'<small class="pkHint">Tap a hero to see the gear</small>':''}
   <div class="ok"><button class="btn" data-m="ok">CLOSE</button></div>`,b=>{if(b[0]==='h'){const h=(p.team||[])[+b.slice(1)];if(h)peekHero(h,p);return false;}return true;});}
// v16-176 (Marius): tap a hero on another player's profile → level, power, stats, skill and gear
function peekHero(h,p){const c=C(),g=Math.max(0,Math.min(5,gradeOf(h.id))),nm=hName(h.id)||h.n||'Hero',sk=c&&c.peekSkill?c.peekSkill(h.id):null,old=!(h.eq&&h.eq.length)&&!h.lv;/* v16-180: the server always sends eq:[] and lv:0 → an empty list = team saved by an old version */
  const st=[['❤️ HP',fmtN(h.hp||0)],['⚔️ ATK',fmtN(h.atk||0)],['🛡️ DEF',fmtN(h.def||0)],['🎯 CRIT',h.crit!=null?Math.round(h.crit*1000)/10+'%':'—'],['⏱️ SPEED',h.as?Math.round(100/h.as)/100+'/s':'—']];
  modal(`<div class="pkH"><div class="pkC">${fcard(h.id,h.s,96)}</div><div class="pkT"><b style="color:${GRC[g]}">${esc(nm)}</b><small>${GRN[g]}${c&&c.roleOfId&&c.roleOfId(h.id)?' · '+esc(c.roleOfId(h.id)):''}</small>
     <div class="pkL">${[h.lv?'Lv '+h.lv:'',h.s?'+'+h.s:''].filter(Boolean).join(' · ')}</div><div class="pkP">${PWh} ${fmtN(h.pw||0)}</div><small style="color:#8fa0b4">${esc(p.name)}'s hero</small></div></div>
   <div class="stats pkSt">${st.map(x=>`<div>${x[0]}<b>${x[1]}</b></div>`).join('')}</div>
   ${sk&&sk.n?`<div class="pkSk"><b>✨ ${esc(sk.n)}</b><small>${esc(sk.d)}</small></div>`:''}
   <h3>GEAR</h3>${old?'<small style="color:#8fa0b4;display:block;text-align:center">This player must open the game with the new version to show the gear.</small>':(c&&c.peekGear?c.peekGear(h.eq):'')}
   <div class="ok"><button class="btn" data-m="ok">BACK</button></div>`,()=>true).classList.add('pkM');}

// ------------------------------------------------------------------ INBOX (Arena / Cup rewards)
async function openInbox(){const r=await call('inbox',{});if(!r.ok){toast('📶 No connection');return;}
  const rwTxt=w=>[w.dm?DMh+' '+w.dm:'',w.tk?TKh+' '+w.tk+' Recruit':'',w.gt?GTh+' '+w.gt+' Gear':'',w.ct?CTh+' '+w.ct+' Crew':''].filter(Boolean).join(' · ');
  modal(`<h4>🎁 Rewards</h4>${r.list.length?r.list.map(m=>`<div class="ib"><span class="o-ic">${esc(m.ic)}</span><div><b>${esc(m.title)}</b>${esc(m.body)}${rwTxt(m.rw)?`<br><span class="rw2">${rwTxt(m.rw)}</span>`:''}</div></div>`).join(''):'<p style="text-align:center">Nothing new.</p>'}
   <div class="ok"><button class="btn gray" data-m="no">CLOSE</button>${r.list.length?'<button class="btn shine" data-m="ok">CLAIM ALL</button>':''}</div>`,
   async b=>{if(b!=='ok')return true;const tot={};for(const m of r.list){const c=await call('claim',{id:m.id});if(c.ok)for(const k in c.rw)tot[k]=(tot[k]||0)+c.rw[k];}
     const t=T();if(t&&t.giveRw){t.giveRw(tot);t.save();}toast('🎁 '+(rwTxt(tot)||'Claimed'),3500);inboxN=0;hdr();dots();return true;});}

// ------------------------------------------------------------------ modal helper
function modal(html,cb){const d=document.createElement('div');d.className='modal';d.innerHTML=`<div class="box"><button class="mX" data-mx aria-label="close">✕</button>${html}</div>`;root.appendChild(d);
  d.addEventListener('click',async e=>{if(e.target.closest('[data-mx]')){d.remove();return;}const b=e.target.closest('[data-m]');if(!b){if(e.target===d){d.remove();}return;}const k=await (cb?cb(b.dataset.m):true);if(k!==false)d.remove();});return d;}

// ------------------------------------------------------------------ ARENA FIGHT – plays the fight decided by the server
const fc=$('olFc'),g=fc.getContext('2d');let F=null,fRaf=0;
const IMG={};const im=s=>{if(!IMG[s]){IMG[s]=new Image();IMG[s].src=s;}return IMG[s];};
const FXN=['slash_02','flare_01','spark_05','star_07','magic_02','circle_05','fire_01','twirl_02','light_02'];const FX=n=>im('img/fx/'+n+'.webp');
const SKFX={engine:'circle_05',tuning:'fire_01',inspect:'light_02',service:'magic_02',paint:'twirl_02',elec:'spark_05',all:'star_07',crew:'flare_01'};
const LAY=[[.39,.64],[.27,.56],[.28,.75],[.16,.62],[.17,.81]];
function playFight(r,replay){
  const mk=(u,side,i)=>({...u,hp0:u.hp,side,slot:i,hp:100,mhp:100,dead:false,ps:'idle',pt:0,hx:0,fl:0,ko:0});
  const ta=r.ta.map((u,i)=>mk(u,0,i)),td=r.td.map((u,i)=>mk(u,1,i)),U=[...ta,...td];
  // real HP in % from the log (the server sent damage numbers; we scale with each unit's total damage taken + what is left)
  const taken=U.map(()=>0),healed=U.map(()=>0);r.log.forEach(e=>e.h.forEach(h=>{if(h[1]>0)taken[h[0]]+=h[1];else healed[h[0]]-=h[1];}));
  // total HP estimate per unit: units that died → exactly their damage taken minus heals; survivors get a 35% buffer
  const kos=new Set();r.log.forEach(e=>e.h.forEach(h=>{if(h[3])kos.add(h[0]);}));
  U.forEach((u,i)=>{u.mhp=u.hp0>0?u.hp0:Math.max(1,kos.has(i)?taken[i]-healed[i]:(taken[i]-healed[i])*1.35+1);u.hp=u.mhp;u.en=0;});
  U.forEach(u=>{if(C()&&C().hasSpr&&C().hasSpr(u.id))C().pose(g,u.id,'idle',0,0,-999,-999,1,1);});
  F={r,U,t:-2.0,i:0,pop:[],fx:[],shake:0,white:0,sk:null,spd:+(LS('te_aspd')||2),done:false,replay,proj:[],v2:A2ON()};
  if(r.kind==='train'&&!open_){root.classList.add('open');F.trOpen=1;}   // v16-146 RAIL WARS: the fight layer lives inside the hub
  const me=r.me||{},th=r.them||{};
  $('olVs').innerHTML=`<div class="side a"><div class="av">${avf(me.icon,me.frame)}</div><div>${flag(me.cc)} ${esc(me.name||'You')}<small>${PWh} ${fmtN(me.pow||0)}</small></div></div><div class="side b"><div>${flag(th.cc)} ${esc(th.name||'Rival')} ${th.bot?'<span class="ai" style="font-size:10px">AI</span>':''}<small>${PWh} ${fmtN(th.pow||0)}</small></div><div class="av">${avf(th.icon,th.frame)}</div></div><div class="mid">VS</div>`;
  $('olVs').style.display='flex';$('olRes').classList.remove('on','lose');$('olFx').classList.remove('end');$('olFx').classList.add('on');$('olSpd').textContent='×'+F.spd+' ⏩';
  const rs=()=>{const k=Math.min(1.5,devicePixelRatio||1);fc.width=Math.round(innerWidth*k);fc.height=Math.round(innerHeight*k);};rs();if(F.v2)a2Init();
  setTimeout(()=>{if(F)$('olVs').style.display='none';},1900);
  window.__BATTLE_ON=true;cancelAnimationFrame(fRaf);let last=performance.now();
  const loop=now=>{if(!F)return;const dt=Math.min(.05,(now-last)/1000);last=now;(F.v2?a2Step:stepF)(dt);fRaf=requestAnimationFrame(loop);};fRaf=requestAnimationFrame(loop);}
$('olSpd').onclick=()=>{if(!F)return;F.spd=F.spd===1?2:F.spd===2?3:1;LS('te_aspd',String(F.spd));$('olSpd').textContent='×'+F.spd+' ⏩';};
$('olSkip').onclick=()=>{if(!F||F.done)return;while(F.i<F.r.log.length)(F.v2?a2Ev:applyEv)(F.r.log[F.i++],true);if(F.v2){F.q.forEach(q=>q.fn());F.q=[];}F.t=F.r.dur;finish();};
function upos(u,W,H){const l=LAY[u.slot]||LAY[0];return {x:(u.side?1-l[0]:l[0])*W+u.hx*(u.side?-1:1),y:l[1]*H};}
function applyEv(e,instant){const U=F.U,a=U[e.a];if(!a)return;
  if(!instant){a.ps=e.k==='sk'?'skill':'atk';a.pt=0;if(e.k==='m')a.lunge=1;if(e.k==='sk'){F.sk={u:a,t:0,r:e.r};if(e.r!=='service')F.white=.35;}}
  const W=fc.width,H=fc.height;
  e.h.forEach((h,j)=>{const t=U[h[0]];if(!t)return;const delay=instant?0:(e.k==='m'?.18:e.k==='r'?.3:.45)+j*.06;
    const go=()=>{if(!F)return;if(h[1]<0){t.hp=Math.min(t.mhp,t.hp-h[1]);}else{t.hp=Math.max(0,t.hp-h[1]);t.fl=.25;if(!t.dead&&t.ps!=='skill'){t.ps='hurt';t.pt=0;}}
      if(h[3]){t.dead=true;t.ps='ko';t.pt=0;F.shake=Math.max(F.shake,.35);}
      if(!instant){const p=upos(t,W,H);F.pop.push({x:p.x,y:p.y-H*.16,v:Math.abs(h[1]),c:h[2],heal:h[1]<0,sk:e.k==='sk',t:0});
        F.fx.push({x:p.x,y:p.y-H*.07,im:e.k==='sk'?FX(SKFX[e.r]||'flare_01'):h[1]<0?FX('magic_02'):FX('slash_02'),t:0,big:e.k==='sk',rot:Math.random()*6,heal:h[1]<0});
        if(h[1]>0)F.fx.push({x:p.x,y:p.y-H*.07,im:FX('spark_05'),t:0,rot:0});if(e.k==='sk'&&h[1]>0)F.shake=Math.max(F.shake,.3);}};
    if(e.k==='r'&&!instant){const pa=upos(a,W,H),pt=upos(t,W,H);F.proj.push({x0:pa.x,y0:pa.y-H*.08,x1:pt.x,y1:pt.y-H*.08,t:0,d:delay,c:a.side?'#ff8a7a':'#9fe3ff'});}
    if(instant)go();else setTimeout(go,delay*1000/F.spd);});}
function finish(){if(F.done)return;F.done=true;const r=F.r;F.U.forEach(u=>{if(!u.dead&&u.side===(r.win?0:1)){u.ps='win';u.pt=0;u.hx=0;}});
  setTimeout(()=>{if(!F)return;const R=$('olRes'),t=r.tier;R.classList.toggle('lose',!r.win);
    R.innerHTML=`<div class="rr"></div>${t?`<div class="o-rb">${badge(t.lg,t.div||'★')}</div>`:''}<h2>${r.win?'VICTORY!':'DEFEAT'}</h2>${r.kind==='train'&&!F.replay?(r.rwH||''):F.replay?'<div class="pts" style="color:#9fe3ff;text-shadow:none;font-size:16px">REPLAY</div>':`<div class="pts" id="olPts">${r.da>0?'+':''}0 pts</div>`}
     ${t&&!F.replay?`<div class="lg"><div class="o-bar"><i style="width:${tierPct(t,r.pts-r.da)}%"></i></div><small>${t.name} · ${r.pts} pts</small></div>`:''}
     ${r.rw&&!F.replay?`<div class="rw2">${r.rw.dm?`<div>${DMh} +${r.rw.dm}</div>`:''}${r.rw.tk?`<div>${TKh} +${r.rw.tk} Recruit</div>`:''}${r.rw.am?`<div>${AMh} +${r.rw.am} Medals</div>`:''}</div>`:''}<button class="btn" id="olCont">CONTINUE</button>`;
    R.classList.add('on');$('olFx').classList.add('end');if(!F.replay&&r.kind!=='train'){let n=0;const tgt=r.da,st=Math.sign(tgt)||1;const iv=setInterval(()=>{n+=st;const e=$('olPts');if(e)e.textContent=(tgt>0?'+':'')+n+' pts';if(n===tgt||!F)clearInterval(iv);},40);
      setTimeout(()=>{const b=R.querySelector('.lg .o-bar i');if(b)b.style.width=tierPct(t,r.pts)+'%';},500);}
    $('olCont').onclick=()=>{const tro=F&&F.trOpen,oe=r.onEnd;$('olFx').classList.remove('on');cancelAnimationFrame(fRaf);F=null;window.__BATTLE_ON=false;if(tro){root.classList.remove('open');}if(oe){try{oe();}catch(e){}return;}if(cur==='olArena'){arData=null;loadArena();}};},1100);}
let crowd=null;
// v16-155: moving floodlight beams over the Arena picture (cheap: 4 gradients)
function arenaLights(W,H,t){g.save();g.globalCompositeOperation='lighter';for(let k=0;k<4;k++){const sx=W*(k<2?.08+k*.12:.92-(k-2)*.12),a=(k<2?.35:-.35)+Math.sin(t*.7+k*1.7)*.22;g.save();g.translate(sx,H*.04);g.rotate(a);const lg=g.createLinearGradient(0,0,0,H*.6);lg.addColorStop(0,k%2?'#ff7af02a':'#7ad8ff2a');lg.addColorStop(1,'#0000');g.fillStyle=lg;g.beginPath();g.moveTo(-W*.012,0);g.lineTo(W*.012,0);g.lineTo(W*.11,H*.6);g.lineTo(-W*.11,H*.6);g.fill();g.restore();}g.restore();}
function arenaBg(W,H,t){{const I=im(F&&F.r&&F.r.bg||'img/arena/ar_battle.webp');if(I.complete&&I.naturalWidth){const k=Math.max(W/I.naturalWidth,H/I.naturalHeight),w=I.naturalWidth*k,h=I.naturalHeight*k;g.drawImage(I,(W-w)/2,(H-h)*.35,w,h);if(!(F&&F.r&&F.r.bg))arenaLights(W,H,t);return;}}   // v16-146 RAIL WARS
  let gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#12061f');gr.addColorStop(.42,'#3a1858');gr.addColorStop(.6,'#1a1030');gr.addColorStop(1,'#05030a');g.fillStyle=gr;g.fillRect(0,0,W,H);
  if(!crowd){crowd=[];for(let i=0;i<140;i++)crowd.push([Math.random(),.3+Math.random()*.15,Math.random()*360,Math.random()*6]);}
  for(const c of crowd){g.fillStyle=`hsl(${c[2]},35%,${16+c[1]*20}%)`;g.beginPath();g.arc(c[0]*W,c[1]*H-Math.abs(Math.sin(t*5+c[3]))*H*.006,W*.017,0,7);g.fill();}
  if(Math.random()<.2){g.fillStyle='#fff';g.globalAlpha=.8;g.beginPath();g.arc(Math.random()*W,H*(.3+Math.random()*.15),W*.006,0,7);g.fill();g.globalAlpha=1;}
  g.globalCompositeOperation='lighter';for(let k=0;k<4;k++){const sx=W*(.08+k*.28),a=Math.sin(t*.7+k*1.7)*.3;g.save();g.translate(sx,0);g.rotate(a);const lg=g.createLinearGradient(0,0,0,H*.75);lg.addColorStop(0,k%2?'#ff7af040':'#7ad8ff40');lg.addColorStop(1,'#0000');g.fillStyle=lg;g.beginPath();g.moveTo(-W*.015,0);g.lineTo(W*.015,0);g.lineTo(W*.13,H*.75);g.lineTo(-W*.13,H*.75);g.fill();g.restore();}g.globalCompositeOperation='source-over';
  g.save();g.translate(W/2,H*.68);g.scale(1,.3);const fl=g.createRadialGradient(0,0,0,0,0,W*.62);fl.addColorStop(0,'#6a4a9a');fl.addColorStop(.6,'#2a1a40');fl.addColorStop(1,'#0a0612');g.fillStyle=fl;g.beginPath();g.arc(0,0,W*.62,0,7);g.fill();
  g.lineWidth=W*.008;g.strokeStyle=`hsl(${280+Math.sin(t*2)*30},100%,70%)`;g.shadowColor='#c35cff';g.shadowBlur=W*.03;g.beginPath();g.arc(0,0,W*.5,0,7);g.stroke();g.strokeStyle='#ffd54a99';g.beginPath();g.arc(0,0,W*.18,0,7);g.stroke();
  g.rotate(t*.3);g.strokeStyle='#ffd54a55';g.lineWidth=W*.004;g.shadowBlur=0;for(let k=0;k<12;k++){g.rotate(Math.PI/6);g.beginPath();g.moveTo(W*.2,0);g.lineTo(W*.48,0);g.stroke();}g.restore();
  g.font=`italic 900 ${W*.06}px Game,system-ui`;g.textAlign='center';const tg=g.createLinearGradient(0,H*.2,0,H*.26);tg.addColorStop(0,'#fffbe6');tg.addColorStop(1,'#e08a00');g.fillStyle=tg;g.shadowColor='#ffb300';g.shadowBlur=W*.03;g.fillText('TORQUE ARENA',W/2,H*.255);g.shadowBlur=0;}
function drawU(u,W,H){const p=upos(u,W,H),S=H*.125,face=u.side?-1:1;const c=C();
  g.fillStyle='#0009';g.beginPath();g.ellipse(p.x,p.y,S*.3,S*.07,0,0,7);g.fill();
  if(u.ps==='skill'){g.globalCompositeOperation='lighter';const r=S*(.45+u.pt*.7);const rg=g.createRadialGradient(p.x,p.y-S*.4,0,p.x,p.y-S*.4,r);rg.addColorStop(0,'#ffd54a99');rg.addColorStop(1,'#ffd54a00');g.fillStyle=rg;g.beginPath();g.arc(p.x,p.y-S*.4,r,0,7);g.fill();g.globalCompositeOperation='source-over';}
  const k=u.ps==='atk'?Math.min(1,u.pt/.45):u.ps==='skill'?Math.min(1,u.pt/.8):u.ps==='ko'?Math.min(1,u.pt/.6):0;
  if(u.dead&&u.pt>1.2)g.globalAlpha=Math.max(.35,1-(u.pt-1.2));
  let ok=c&&c.pose&&c.pose(g,u.id,u.ps,F.t,k,p.x,p.y,S,face);
  if(!ok){const i=im(HI(u.id));if(i.complete&&i.naturalWidth){g.save();g.beginPath();g.arc(p.x,p.y-S*.45,S*.3,0,7);g.clip();g.drawImage(i,p.x-S*.3,p.y-S*.75,S*.6,S*.6);g.restore();}}
  if(u.fl>0&&ok){g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,u.fl*3);c.pose(g,u.id,u.ps,F.t,k,p.x,p.y,S,face);g.globalCompositeOperation='source-over';}
  g.globalAlpha=1;
  if(!u.dead){const bw=S*.55,bx=p.x-bw/2,by=p.y-S*1.02;g.fillStyle='#000c';g.fillRect(bx-3,by-3,bw+6,S*.1+4);g.fillStyle=u.side?'#ff4a3a':'#4cd964';g.fillRect(bx,by,bw*u.hp/u.mhp,S*.055);g.fillStyle='#ffc23a';g.fillRect(bx,by+S*.065,bw*Math.min(1,u.en),S*.03);
    const gc=['#cfd8dc','#4cdc4c','#29b6f6','#d05cff','#ffd21a','#ff3b3b'][u.gr|0];g.fillStyle=gc;g.beginPath();g.arc(bx-S*.06,by+S*.04,S*.045,0,7);g.fill();}}
function stepF(dt){const W=fc.width,H=fc.height,r=F.r;const sdt=dt*F.spd;F.t+=F.t<0?dt:sdt;
  if(F.t>=0&&!F.done){while(F.i<r.log.length&&r.log[F.i].t<=F.t){const e=r.log[F.i++];applyEv(e,false);const a=F.U[e.a];if(a&&e.k!=='sk')a.en=Math.min(1,(a.en||0)+.25);if(a&&e.k==='sk')a.en=0;}
    if(F.i>=r.log.length&&F.t>r.dur+.6)finish();}
  F.U.forEach(u=>{u.pt+=sdt;u.fl=Math.max(0,u.fl-sdt);
    if(u.lunge){u.hx=Math.min(W*.13,u.hx+sdt*W*1.4);if(u.pt>.3)u.lunge=0;}else if(u.hx>0&&!u.dead)u.hx=Math.max(0,u.hx-sdt*W*.9);
    if(!u.dead&&((u.ps==='atk'&&u.pt>.5)||(u.ps==='skill'&&u.pt>.9)||(u.ps==='hurt'&&u.pt>.3))){u.ps='idle';u.pt=0;}
  });
  g.save();if(F.shake>0){F.shake-=dt;const s=W*.035*F.shake;g.translate((Math.random()-.5)*s,(Math.random()-.5)*s);}
  arenaBg(W,H,F.t<0?F.t+2:F.t);
  if(F.sk){F.sk.t+=sdt;if(F.sk.t<.9){g.fillStyle=`rgba(0,0,0,${Math.min(.4,F.sk.t*1.5)})`;g.fillRect(0,0,W,H);}else F.sk=null;}
  F.U.slice().sort((a,b)=>upos(a,W,H).y-upos(b,W,H).y).forEach(u=>drawU(u,W,H));
  F.proj=F.proj.filter(p=>{p.t+=sdt;const k=(p.t)/Math.max(.05,p.d);if(k>1)return false;const x=p.x0+(p.x1-p.x0)*k,y=p.y0+(p.y1-p.y0)*k-Math.sin(k*Math.PI)*H*.04;g.fillStyle=p.c;g.shadowColor=p.c;g.shadowBlur=W*.02;g.beginPath();g.arc(x,y,W*.009,0,7);g.fill();g.shadowBlur=0;return true;});
  g.globalCompositeOperation='lighter';F.fx=F.fx.filter(f=>{f.t+=sdt;if(f.t>.5)return false;const s=(f.big?H*.3:H*.14)*(.6+f.t*1.6);g.save();g.globalAlpha=1-f.t/.5;g.translate(f.x,f.y);g.rotate(f.rot+f.t*3);if(f.im.complete&&f.im.naturalWidth)g.drawImage(f.im,-s/2,-s/2,s,s);g.restore();return true;});g.globalCompositeOperation='source-over';g.globalAlpha=1;
  F.pop=F.pop.filter(p=>{p.t+=sdt*.8;if(p.t>1)return false;const s=W*(p.c?.075:p.sk?.068:.052)*(p.t<.15?1+(.15-p.t)*5:1);g.font=`italic 900 ${s}px Game,system-ui`;g.textAlign='center';g.lineWidth=W*.009;g.strokeStyle='#000';g.globalAlpha=Math.min(1,(1-p.t)*2);const y=p.y-p.t*H*.07;const txt=(p.heal?'+':p.c?'CRIT ':'')+fmtN(p.v);g.strokeText(txt,p.x,y);g.fillStyle=p.heal?'#7dff8a':p.c?'#ffd54a':p.sk?'#ff9af0':'#fff';g.fillText(txt,p.x,y);g.globalAlpha=1;return true;});
  g.restore();
  if(F.sk&&F.sk.t<.9){const u=F.sk.u,k=Math.min(1,F.sk.t*6),y=H*.13;g.fillStyle=u.side?'#c4180acc':'#1e6bffcc';g.beginPath();g.moveTo(u.side?W:0,y);g.lineTo(u.side?W-W*.78*k:W*.78*k,y);g.lineTo(u.side?W-W*.72*k:W*.72*k,y+H*.06);g.lineTo(u.side?W:0,y+H*.06);g.fill();
    g.font=`italic 900 ${W*.045}px Game,system-ui`;g.textAlign=u.side?'right':'left';g.fillStyle='#fff';const nm=(u.n||'').toUpperCase();g.fillText('⚡ '+(nm?nm+' · ':'')+'SKILL!',u.side?W-W*.04:W*.04,y+H*.043);}
  if(F.white>0){F.white-=dt*2;g.fillStyle=`rgba(255,240,200,${Math.max(0,F.white)*.6})`;g.fillRect(0,0,W,H);}
  const hb=(side,x,c)=>{const L=F.U.filter(u=>u.side===side),tot=L.reduce((s,u)=>s+u.hp/u.mhp,0)/Math.max(1,L.length);g.fillStyle='#000b';g.fillRect(x,H*.05,W*.36,H*.016);g.fillStyle=c;g.fillRect(side?x+W*.36*(1-tot):x,H*.05,W*.36*tot,H*.016);};
  g.fillStyle='#000a';g.fillRect(0,0,W,H*.08);g.font=`900 ${W*.035}px Game,system-ui`;g.textAlign='left';g.fillStyle='#9ad0ff';g.fillText((r.me&&r.me.name)||'You',W*.03,H*.038);g.textAlign='right';g.fillStyle='#ff9a8a';g.fillText((r.them&&r.them.name)||'Rival',W*.97,H*.038);
  hb(0,W*.03,'#4cd964');hb(1,W*.61,'#ff4a3a');g.textAlign='center';g.fillStyle='#ffd54a';g.font=`italic 900 ${W*.05}px Game,system-ui`;g.fillText('VS',W/2,H*.065);
  if(F.t>=0){g.font=`900 ${W*.032}px Game,system-ui`;g.fillStyle='#fff';g.fillText(Math.max(0,Math.ceil(75-F.t))+'s',W/2,H*.11);}}

// ------------------------------------------------------------------ v16-85: ARENA 2.0 – heroes run, fight up close, real skills (preview: ?arena2=1)
const A2ON=()=>LS('te_arena2')!=='0';   // v16-87: Marius OK → Arena 2.0 for everybody (old look only with te_arena2=0)
const A2RING=[[.42,0],[.36,-.075],[.36,.075],[.62,-.04],[.62,.04]];   // v16-149: places around a target (x × hero size, y × screen height)
const A2SL={m:[[.37,.63],[.33,.77],[.39,.51],[.31,.89],[.41,.70]],r:[[.18,.58],[.14,.74],[.21,.87],[.16,.47],[.23,.66]]};
const RCOL={engine:'#ff8a3d',tuning:'#ff4a2a',inspect:'#3de0ff',service:'#7dff8a',paint:'#ff5ce1',elec:'#9fd8ff',all:'#ffd54a',crew:'#ffd54a'};
const SPI=id=>(C()&&C().spr&&C().spr(id))||null;
function a2Init(){const W=fc.width,H=fc.height,S=H*.135;F.S=S;   /* v16-155: heroes ~18% smaller (Marius) */F.q=[];F.pt=[];F.dec=[];F.bm=[];F.cam={z:1,x:W/2,y:H*.62};F.hs=0;F.ia=0;F.cine=null;
  const ml=F.U.map(()=>[0,0]);F.r.log.forEach(e=>{if(e.k==='m')ml[e.a][0]++;else if(e.k==='r')ml[e.a][1]++;});
  const cnt=[{m:0,r:0},{m:0,r:0}];
  F.U.forEach((u,i)=>{u.mel=ml[i][0]>=ml[i][1]&&(ml[i][0]>0||u.role==='engine'||u.role==='tuning');const k=u.mel?'m':'r',L=A2SL[k][cnt[u.side][k]++%5];
    u.hx2=(u.side?1-L[0]:L[0])*W;u.hy2=L[1]*H;u.x=u.side?W+S*(.6+Math.random()):-S*(.6+Math.random());u.y=u.hy2;u.dir=u.side?-1:1;u.face=u.dir;u.gx=u.hx2;u.gy=u.hy2;u.goal=null;u.kx=0;u.jz=0;u.col=(SPI(u.id)||{}).col||RCOL[u.role]||'#ffd54a';
    try{const h=C().heroOf&&C().heroOf(u.id);u.skn=h&&C().skill(h)?C().skill(h).sk:'';}catch(e){u.skn='';}});}
const a2q=(d,fn)=>F.q.push({at:F.t+d,fn});
function burst(x,y,c,n,sp,up,sz){for(let i=0;i<n&&F.pt.length<260;i++){const a=Math.random()*6.283,v=(.3+Math.random())*sp;F.pt.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(up||0),c,t:0,d:.35+Math.random()*.35,s:(sz||1)*(2+Math.random()*3)*F.S/100});}}
function mz(u){const d=SPI(u.id),k=F.S/215;if(!d||!d.m)return[u.x+u.face*F.S*.25,u.y-F.S*.55];return[u.x+u.face*(d.m[0]-d.a[0])*k*.8,u.y+(d.m[1]-d.a[1])*k*.8];}
function a2Plan(e){const a=F.U[e.a];if(!a||a.dead)return;const t=e.h[0]&&F.U[e.h[0][0]];
  if(t&&t.side!==a.side&&(e.k==='m'||(e.k==='sk'&&a.mel)))a.goal=t;}
function a2Hit(e,j,h,instant){const U=F.U,a=U[e.a],t=U[h[0]];if(!t)return;
  if(h[1]<0)t.hp=Math.min(t.mhp,t.hp-h[1]);else{t.hp=Math.max(0,t.hp-h[1]);t.fl=.22;t.kx+=a.dir*F.S*(e.k==='sk'?.35:h[2]?.22:.1);if(!t.dead&&t.ps!=='skill'){t.ps='hurt';t.pt=0;}}
  if(h[3]){t.dead=true;t.ps='ko';t.pt=0;F.shake=Math.max(F.shake,.4);t.goal=null;}
  if(instant)return;const S=F.S,y=t.y-S*.5,c=h[1]<0?'#7dff8a':e.k==='sk'?a.col:h[2]?'#ffd54a':'#fff3c4';
  F.pop.push({x:t.x+(Math.random()-.5)*S*.3,y:t.y-S*1.05,v:Math.abs(h[1]),c:h[2],heal:h[1]<0,sk:e.k==='sk',t:0});
  if(h[1]<0){burst(t.x,t.y-S*.3,'#7dff8a',10,S*.6,S*1.4);F.fx.push({x:t.x,y:t.y-S*.4,im:FX('magic_02'),t:0,big:0,rot:0,heal:1});return;}
  burst(t.x,y,c,h[2]?18:e.k==='sk'?16:8,S*(h[2]?4:2.6),S*.6);F.fx.push({x:t.x,y,im:FX(e.k==='sk'?(SKFX[a.role]||'flare_01'):'slash_02'),t:0,big:e.k==='sk'||h[2],rot:Math.random()*6});
  if(h[2]){F.shake=Math.max(F.shake,.25);}
  if(e.k==='sk'){F.shake=Math.max(F.shake,.3);
    if(a.role==='engine'){F.dec.push({x:t.x,y:t.y,im:FX('dirt_02'),t:0,d:2.5,s:S*1.3});F.fx.push({x:t.x,y:t.y,im:FX('circle_05'),t:0,big:1,rot:0,ground:1});burst(t.x,t.y,'#a0784a',14,S*3,S*2.5,1.6);}
    else if(a.role==='paint'||a.role==='tuning'){F.dec.push({x:t.x,y:t.y,im:FX(a.role==='paint'?'twirl_02':'scorch_02'),t:0,d:3,s:S*1.1,c:a.col});burst(t.x,y,a.role==='tuning'?'#ff8a00':a.col,14,S*3.2,S*1.2,1.5);}
    else if(a.role==='elec')F.white=Math.max(F.white,.18);}}
function a2Ev(e,instant){const U=F.U,a=U[e.a];if(!a)return;const S=F.S;
  if(instant){e.h.forEach((h,j)=>a2Hit(e,j,h,true));return;}
  a.ps=e.k==='sk'?'skill':'atk';a.pt=0;if(a.goal&&!a.goal.dead)a.face=Math.sign(a.goal.x-a.x)||a.dir;
  if(e.k==='sk'){if(!F.cine&&F.t-(F.lc||-9)>2.5){F.cine={u:a,t:0};F.lc=F.t;}if(e.r!=='service')F.white=Math.max(F.white,.25);burst(a.x,a.y-S*.5,a.col,22,S*2.2,S*.8,1.4);
    if(a.role==='engine')a.jz=1;}
  const [mx,my]=mz(a);if(e.k==='r')F.fx.push({x:mx,y:my,im:FX('muzzle_02'),t:0,big:0,rot:a.face>0?0:3.14,sm:1});
  e.h.forEach((h,j)=>{const t=U[h[0]];if(!t)return;const isK=e.k==='sk',d=(e.k==='m'?.16:e.k==='r'?.32:.5)+j*(a.role==='elec'?.09:.07);
    if(e.k==='r'||(isK&&!a.mel&&h[1]>0)||(isK&&a.role==='service')){const sx=a.role==='service'&&isK?t.x:mx,sy=a.role==='service'&&isK?t.y-S*2.4:my;
      const typ=isK?(a.role==='elec'?'bolt':a.role==='inspect'?'beam':a.role==='paint'?'blob':a.role==='service'?'heal':'orb'):a.role==='elec'?'bolt':a.role==='inspect'?'beam':a.role==='paint'?'blob':a.role==='service'?'heal':a.role==='tuning'?'fire':'bul';
      F.proj.push({sx,sy,t2:t,t:0,d:d*.92,typ,c:a.col,big:isK,tr:[]});}
    a2q(d,()=>F&&a2Hit(e,j,h,false));});}
function a2Step(dt){const W=fc.width,H=fc.height,r=F.r,S=F.S;
  let slo=1;if(F.cine){F.cine.t+=dt*1.6;if(F.cine.t>1.1)F.cine=null;}
  const sdt=dt*F.spd;F.t+=F.t<0?dt:sdt;
  if(F.t>=0&&!F.done){while(F.ia<r.log.length&&r.log[F.ia].t-.5<=F.t)a2Plan(r.log[F.ia++]);
    while(F.i<r.log.length&&r.log[F.i].t<=F.t){const e=r.log[F.i++];a2Ev(e,false);const a=F.U[e.a];if(a)a.en=e.k==='sk'?0:Math.min(1,(a.en||0)+.25);}
    if(F.i>=r.log.length&&F.t>r.dur+.8&&!F.q.length)finish();}
  F.q=F.q.filter(q=>{if(q.at<=F.t){q.fn();return false;}return true;});
  F.U.forEach((u,i)=>{u.pt+=sdt;u.fl=Math.max(0,u.fl-sdt);u.kx*=Math.pow(.004,sdt);if(u.jz>0)u.jz=Math.max(0,u.jz-sdt*1.8);
    if(u.dead)return;if(F.t<0&&F.t>-1.3){u.gx=u.hx2;u.gy=u.hy2;}
    if(u.goal&&u.goal.dead)u.goal=null;
    // v16-149 (Marius: „să nu se mai urce unul peste celălalt”): each melee hero on the same target gets its own place around it
    // (front, above, below, then a 2nd row) instead of all running to the same point
    if(F.t>=0&&!F.done){if(u.goal){const L=F.U.filter(o=>o.goal===u.goal&&!o.dead&&o.side===u.side),k=Math.max(0,L.indexOf(u)),P=A2RING[k%A2RING.length];
        u.gx=u.goal.x-u.dir*S*P[0];u.gy=Math.max(H*.42,Math.min(H*.93,u.goal.y+P[1]*H));}else if(!u.mel||F.t-(u.lastHit||0)>2){u.gx=u.hx2;u.gy=u.hy2;}}
    let dx=u.gx-u.x,dy=u.gy-u.y;
    const dist=Math.hypot(dx,dy),sp=(F.t<0?S*3.2:S*2.6)*(F.t<0?dt:sdt);
    if(dist>2){const m=Math.min(dist,sp);u.x+=dx/dist*m;u.y+=dy/dist*m;u.y=Math.max(H*.42,Math.min(H*.93,u.y));
      if(dist>S*.08){if(u.ps==='idle'||u.ps==='walk')u.ps='walk';if(Math.abs(dx)>4)u.face=Math.sign(dx);}}
    else if(u.ps==='walk'){u.ps='idle';u.face=u.goal?Math.sign(u.goal.x-u.x)||u.dir:u.dir;}
    if(u.ps==='idle'&&!u.goal)u.face=u.dir;
    if((u.ps==='atk'&&u.pt>.5)||(u.ps==='skill'&&u.pt>.9)||(u.ps==='hurt'&&u.pt>.3)){u.ps='idle';u.pt=0;}
    if(u.ps==='atk'||u.ps==='skill')u.lastHit=F.t;});
  // v16-149: bodies push each other apart (oval: wide, flat – the arena is seen from the side) → nobody stands inside / on top of another hero
  if(F.t>-1.3){const A=F.U.filter(u=>!u.dead),rx=S*.44,ry=S*.2;
    for(let it=0;it<2;it++)for(let a=0;a<A.length;a++)for(let b=a+1;b<A.length;b++){const u=A[a],o=A[b];let nx=(u.x-o.x)/rx,ny=(u.y-o.y)/ry,d=Math.hypot(nx,ny);
      if(d>=1)continue;if(d<1e-3){ny=a%2?1:-1;nx=0;d=1e-3;}const f=(1-d)/2*.6/Math.max(d,.15),px=nx*f*rx,py=ny*f*ry*1.6;
      u.x+=px;u.y=Math.max(H*.42,Math.min(H*.93,u.y+py));o.x-=px;o.y=Math.max(H*.42,Math.min(H*.93,o.y-py));}}
  // ---- camera: zoom on the hero casting a skill
  const cz=1,cx=W/2,cy=H*.62,ek=1-Math.pow(.002,dt);
  F.cam.z+=(cz-F.cam.z)*ek;F.cam.x+=(cx-F.cam.x)*ek;F.cam.y+=(cy-F.cam.y)*ek;
  g.save();if(F.shake>0){F.shake-=dt;const s=W*.03*F.shake;g.translate((Math.random()-.5)*s,(Math.random()-.5)*s);}
  g.translate(W/2,H*.62);g.scale(F.cam.z,F.cam.z);g.translate(-F.cam.x,-F.cam.y);
  arenaBg(W,H,F.t<0?F.t+2:F.t);
  F.dec=F.dec.filter(d=>{d.t+=sdt;if(d.t>d.d)return false;if(d.im.complete&&d.im.naturalWidth){g.save();g.globalAlpha=Math.min(.7,(1-d.t/d.d)*1.4);g.translate(d.x,d.y);g.scale(1,.32);g.drawImage(d.im,-d.s/2,-d.s/2,d.s,d.s);g.restore();}return true;});
  if(0){g.fillStyle=`rgba(0,0,0,${Math.min(.28,F.cine.t*2)*(F.cine.t>.6?Math.max(0,(1-F.cine.t)*2.5):1)})`;g.fillRect(-W,-H,W*3,H*3);}
  F.U.slice().sort((a,b)=>a.y-b.y).forEach(u=>a2Draw(u,W,H));
  // projectiles
  F.proj=F.proj.filter(p=>{p.t+=sdt;const k=Math.min(1,p.t/Math.max(.05,p.d)),tx=p.t2.x,ty=p.t2.y-S*.5;
    if(p.typ==='beam'||p.typ==='bolt'){if(k>=1&&p.t>p.d+.18)return false;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=p.c;g.shadowColor=p.c;g.shadowBlur=W*.03;g.lineWidth=(p.big?W*.014:W*.007)*(1-Math.max(0,p.t-p.d)/.2);g.beginPath();g.moveTo(p.sx,p.sy);
      if(p.typ==='bolt'){const n=7;for(let s=1;s<=n;s++){const f=s/n*Math.min(1,k*1.6);g.lineTo(p.sx+(tx-p.sx)*f+(s<n?(Math.random()-.5)*S*.3:0),p.sy+(ty-p.sy)*f+(s<n?(Math.random()-.5)*S*.3:0));}}else g.lineTo(p.sx+(tx-p.sx)*Math.min(1,k*1.6),p.sy+(ty-p.sy)*Math.min(1,k*1.6));
      g.stroke();g.lineWidth*=.35;g.strokeStyle='#fff';g.stroke();g.restore();return true;}
    if(k>=1)return false;const arc=p.typ==='blob'?H*.12:p.typ==='heal'?0:H*.02,x=p.sx+(tx-p.sx)*k,y=p.sy+(ty-p.sy)*k-Math.sin(k*Math.PI)*arc;
    p.tr.push([x,y]);if(p.tr.length>8)p.tr.shift();g.save();g.globalCompositeOperation='lighter';
    p.tr.forEach((q,n)=>{g.globalAlpha=n/p.tr.length*.6;g.fillStyle=p.c;g.beginPath();g.arc(q[0],q[1],(p.big?W*.022:W*.011)*n/p.tr.length,0,7);g.fill();});
    g.globalAlpha=1;g.shadowColor=p.c;g.shadowBlur=W*.04;g.fillStyle='#fff';g.beginPath();g.arc(x,y,p.big?W*.018:p.typ==='bul'?W*.007:W*.011,0,7);g.fill();g.fillStyle=p.c;g.beginPath();g.arc(x,y,(p.big?W*.026:W*.014),0,7);g.globalAlpha=.55;g.fill();g.restore();
    if(p.typ==='fire'&&Math.random()<.6)burst(x,y,'#ff8a00',1,S*.4,S*.5);return true;});
  // particles + fx
  g.globalCompositeOperation='lighter';
  F.pt=F.pt.filter(p=>{p.t+=sdt;if(p.t>p.d)return false;p.vy+=S*5*sdt;p.x+=p.vx*sdt;p.y+=p.vy*sdt;g.globalAlpha=1-p.t/p.d;g.fillStyle=p.c;g.fillRect(p.x-p.s/2,p.y-p.s/2,p.s,p.s);return true;});
  F.fx=F.fx.filter(f=>{f.t+=sdt;const D=f.sm?.15:.45;if(f.t>D)return false;const s=(f.big?S*1.9:f.sm?S*.45:S*.9)*(.55+f.t/D*1.1);g.save();g.globalAlpha=1-f.t/D;g.translate(f.x,f.y);if(f.ground)g.scale(1,.35);g.rotate(f.rot+(f.sm?0:f.t*4));if(f.im.complete&&f.im.naturalWidth)g.drawImage(f.im,-s/2,-s/2,s,s);g.restore();return true;});
  g.globalCompositeOperation='source-over';g.globalAlpha=1;
  F.pop=F.pop.filter(p=>{p.t+=sdt*.75;if(p.t>1)return false;const b=p.t<.12?1.6-p.t*5:1,s=W*(p.c?.08:p.sk?.07:.05)*b;g.font=`italic 900 ${s}px Game,system-ui`;g.textAlign='center';g.lineWidth=W*.01;g.strokeStyle='#000';g.globalAlpha=Math.min(1,(1-p.t)*2.5);const y=p.y-p.t*H*.06;const txt=(p.heal?'+':'')+fmtN(p.v)+(p.c?'!':'');
    if(p.c){g.save();g.translate(p.x,y);g.rotate(-.12);g.font=`italic 900 ${s*.45}px Game,system-ui`;g.strokeText('CRIT',0,-s*.75);g.fillStyle='#ff5a3a';g.fillText('CRIT',0,-s*.75);g.font=`italic 900 ${s}px Game,system-ui`;g.strokeText(txt,0,0);g.fillStyle='#ffd54a';g.fillText(txt,0,0);g.restore();}
    else{g.strokeText(txt,p.x,y);g.fillStyle=p.heal?'#7dff8a':p.sk?'#ff9af0':'#fff';g.fillText(txt,p.x,y);}g.globalAlpha=1;return true;});
  g.restore();
  // skill cut-in: the hero big + the name of the skill
  if(F.cine&&F.cine.t<1.1){const u=F.cine.u,t=F.cine.t,k=Math.min(1,t*5)*(t>.85?Math.max(0,1-(t-.85)*4):1),y=H*.15,L=!u.side;
    g.save();g.globalAlpha=k;const gr=g.createLinearGradient(L?0:W,0,L?W:0,0);gr.addColorStop(0,u.side?'#8a0a0aee':'#0a3a8aee');gr.addColorStop(.7,u.side?'#ff2a1ecc':'#1e6bffcc');gr.addColorStop(1,'#0000');g.fillStyle=gr;
    const off=(1-Math.min(1,t*5))*W*(L?-1:1);g.translate(off,0);g.beginPath();g.moveTo(0,y);g.lineTo(W,y-H*.03);g.lineTo(W,y+H*.09);g.lineTo(0,y+H*.12);g.fill();
    g.strokeStyle=u.col;g.lineWidth=W*.006;g.beginPath();g.moveTo(0,y+H*.12);g.lineTo(W,y+H*.09);g.stroke();
    const px=L?W*.17:W*.83;g.save();g.beginPath();g.rect(0,y-H*.1,W,H*.22);g.clip();if(!(C()&&C().pose&&C().pose(g,u.id,'skill',F.t,Math.min(1,t*1.4),px,y+H*.2,H*.34,L?1:-1))){}g.restore();
    g.textAlign=L?'left':'right';g.font=`italic 900 ${W*.06}px Game,system-ui`;g.lineWidth=W*.012;g.strokeStyle='#000';const tx=L?W*.33:W*.67,nm=(u.skn||'SKILL').toUpperCase()+'!';g.strokeText(nm,tx,y+H*.055);g.fillStyle='#fff';g.fillText(nm,tx,y+H*.055);
    g.font=`900 ${W*.032}px Game,system-ui`;g.fillStyle='#ffe27a';g.strokeText((u.n||'').toUpperCase(),tx,y+H*.09);g.fillText((u.n||'').toUpperCase(),tx,y+H*.09);g.restore();}
  if(F.white>0){F.white-=dt*2;g.fillStyle=`rgba(255,240,200,${Math.max(0,F.white)*.6})`;g.fillRect(0,0,W,H);}
  a2Hud(W,H,r);}
function a2Draw(u,W,H){const S=F.S,c=C(),x=u.x+u.kx,y=u.y,lift=u.jz>0?Math.sin(u.jz*Math.PI)*S*.6:0;
  g.fillStyle='#000a';g.beginPath();g.ellipse(x,y,S*.28*(1-lift/S*.5),S*.065,0,0,7);g.fill();
  if(u.ps==='skill'){g.globalCompositeOperation='lighter';const r=S*(.5+u.pt*.8);const rg=g.createRadialGradient(x,y-S*.45,0,x,y-S*.45,r);rg.addColorStop(0,u.col+'aa');rg.addColorStop(1,u.col+'00');g.fillStyle=rg;g.beginPath();g.arc(x,y-S*.45,r,0,7);g.fill();
    g.strokeStyle=u.col;g.lineWidth=S*.03;g.globalAlpha=Math.max(0,1-u.pt);g.save();g.translate(x,y);g.scale(1,.3);g.beginPath();g.arc(0,0,S*(.3+u.pt*1.2),0,7);g.stroke();g.restore();g.globalAlpha=1;g.globalCompositeOperation='source-over';}
  const k=u.ps==='atk'?Math.min(1,u.pt/.4):u.ps==='skill'?Math.min(1,u.pt/.8):u.ps==='ko'?Math.min(1,u.pt/.6):0;
  if(u.dead&&u.pt>1)g.globalAlpha=Math.max(.0,1-(u.pt-1)*.8);
  if(u.dead&&u.pt>2.3){g.globalAlpha=1;return;}
  const ok=c&&c.pose&&c.pose(g,u.id,u.ps,F.t+u.slot*.3,k,x,y-lift,S,u.face);
  if(!ok){const i=im(HI(u.id));if(i.complete&&i.naturalWidth){g.save();g.beginPath();g.arc(x,y-S*.45,S*.3,0,7);g.clip();g.drawImage(i,x-S*.3,y-S*.75,S*.6,S*.6);g.restore();}}
  if(u.fl>0&&ok){g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,u.fl*4);c.pose(g,u.id,u.ps,F.t+u.slot*.3,k,x,y-lift,S,u.face);g.globalCompositeOperation='source-over';}
  g.globalAlpha=1;
  if(!u.dead&&F.t>-.4){const bw=S*.5,bx=x-bw/2,by=y-S*1.0-lift;g.fillStyle='#000c';g.fillRect(bx-2,by-2,bw+4,S*.085+4);g.fillStyle=u.side?'#ff4a3a':'#4cd964';g.fillRect(bx,by,bw*u.hp/u.mhp,S*.05);g.fillStyle='#ffc23a';g.fillRect(bx,by+S*.06,bw*Math.min(1,u.en||0),S*.025);
    const gc=['#cfd8dc','#4cdc4c','#29b6f6','#d05cff','#ffd21a','#ff3b3b'][u.gr|0];g.fillStyle=gc;g.beginPath();g.arc(bx-S*.06,by+S*.04,S*.042,0,7);g.fill();}}
function a2Hud(W,H,r){const hb=(side,x,c)=>{const L=F.U.filter(u=>u.side===side),tot=L.reduce((s,u)=>s+u.hp/u.mhp,0)/Math.max(1,L.length);g.fillStyle='#000b';g.fillRect(x,H*.05,W*.36,H*.016);g.fillStyle=c;g.fillRect(side?x+W*.36*(1-tot):x,H*.05,W*.36*tot,H*.016);};
  g.fillStyle='#000a';g.fillRect(0,0,W,H*.08);g.font=`900 ${W*.035}px Game,system-ui`;g.textAlign='left';g.fillStyle='#9ad0ff';g.fillText((r.me&&r.me.name)||'You',W*.03,H*.038);g.textAlign='right';g.fillStyle='#ff9a8a';g.fillText((r.them&&r.them.name)||'Rival',W*.97,H*.038);
  hb(0,W*.03,'#4cd964');hb(1,W*.61,'#ff4a3a');g.textAlign='center';g.fillStyle='#ffd54a';g.font=`italic 900 ${W*.05}px Game,system-ui`;g.fillText('VS',W/2,H*.065);
  if(F.t>=0){g.font=`900 ${W*.032}px Game,system-ui`;g.fillStyle='#fff';g.fillText(Math.max(0,Math.ceil(75-F.t))+'s',W/2,H*.11);}}

// ------------------------------------------------------------------ buttons in the game
function addButtons(){
  const s2=$('side2');if(s2&&!$('rkBtn')){
    s2.insertAdjacentHTML('afterbegin',`<button id="rkBtn"><svg viewBox="0 0 64 64"><use href="#olTrophy"/></svg><small>RANK</small></button><button id="chBtn"><svg viewBox="0 0 64 64"><use href="#olChat"/></svg><small>CHAT</small><i id="chDot"></i></button>`);
    $('rkBtn').onclick=()=>openHub('olRank');$('chBtn').onclick=()=>openHub('olChat');}
  const sd=$('side');if(sd&&!$('arBtn')){const b=document.createElement('button');b.id='arBtn';b.innerHTML='<img src="img/ui/ic_arena.webp" alt="Arena"><i id="arDot"></i>';
    const cp=$('cpBtn');if(cp&&cp.nextSibling)sd.insertBefore(b,cp.nextSibling);else sd.appendChild(b);b.onclick=()=>openHub('olArena');}
  dots();}
// ------------------------------------------------------------------ v16-223 BIG ANNOUNCEMENTS (Marius 23 nov): MYTHIC hero / ASCENDED gear → the whole server sees it
// the game calls ONLINE.brag('hero',{ids,src}) / ONLINE.brag('gear',{items:[{s,set}],src}); the server checks it and writes it in the chat (sys=2);
// every game asks for new ones ('ann', every 90 s while the game is open + in sync) and shows the golden banner on top of the screen.
const BQ=[];let bqT=0;
function brag(kind,d){try{if(!PID())return;BQ.push({kind,...d});clearTimeout(bqT);bqT=setTimeout(bragSend,1500);}catch(e){}}
async function bragSend(){const L=BQ.splice(0);const H=L.filter(x=>x.kind==='hero'),Gq=L.filter(x=>x.kind==='gear');
  const grp=(arr,key)=>{const o={};arr.forEach(x=>{(o[x.src]=o[x.src]||[]).push(...x[key]);});return o;};
  const hg=grp(H,'ids'),gg=grp(Gq,'items');
  for(const src in hg)await call('brag',{kind:'hero',src,ids:hg[src].slice(0,11)});
  for(const src in gg)await call('brag',{kind:'gear',src,items:gg[src].slice(0,11)});
  setTimeout(annPoll,800);}
let annId=+LS('te_ann')||0,annQ=[],annBusy=0;
function annGot(list){if(!Array.isArray(list)||!list.length)return;const first=!annId;for(const a of list){if(a.id<=annId)continue;annId=a.id;if(!first)annQ.push(a);}LS('te_ann',String(annId));annNext();}
async function annPoll(){if(document.visibilityState!=='visible'||!PID())return;const r=await call('ann',{since:annId});if(r&&r.ok)annGot(r.list);}
setInterval(annPoll,90e3);setTimeout(annPoll,20e3);
function annNext(){if(annBusy||!annQ.length)return;const a=annQ.shift(),k=a.k||{};annBusy=1;
  let el=$('annB');if(!el){el=document.createElement('div');el.id='annB';document.body.appendChild(el);el.onclick=()=>{el.classList.remove('on');};}
  const hero=k.kind==='hero',ids=hero?(k.ids||[]):[],items=hero?[]:(k.items||[]);
  const pics=hero?ids.slice(0,3).map(id=>`<div class="aP" style="background-image:url(${HI(id)})"></div>`).join(''):items.slice(0,3).map(x=>{let u='';try{u=C().gs.icon(x.s,6);}catch(e){}return `<div class="aP g"><img src="${u}" alt=""></div>`;}).join('');
  const tt=hero?(ids.length>1?ids.length+' MYTHIC HEROES':'MYTHIC HERO'):(items.length>1?items.length+' ASCENDED GEAR':'ASCENDED GEAR');
  el.className=hero?'myth':'asc';
  el.innerHTML=`<div class="aIn"><div class="aPs">${pics}</div><div class="aTx"><small>${hero?'🔥':'💠'} ${tt} ${hero?'🔥':'💠'}</small><b>${esc(String(k.n||'A player').slice(0,16))}</b><span>${esc(String(a.txt||'').replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9!)]+$/g,'').replace(String(k.n||''),'').trim())}</span></div></div>`;
  void el.offsetWidth;el.classList.add('on');setTimeout(()=>{el.classList.remove('on');setTimeout(()=>{annBusy=0;annNext();},700);},6500);}
document.head.insertAdjacentHTML('beforeend',`<style>
#annB{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 58px);transform:translate(-50%,-160%) scale(.9);z-index:9500;width:min(94vw,400px);pointer-events:auto;transition:transform .55s cubic-bezier(.2,1.4,.4,1),opacity .4s;opacity:0}
#annB.on{transform:translate(-50%,0) scale(1);opacity:1}
#annB .aIn{display:flex;align-items:center;gap:9px;padding:8px 12px 8px 8px;border-radius:16px;position:relative;overflow:hidden}
#annB.myth .aIn{background:linear-gradient(100deg,#4a0000,#b3121c 45%,#ff5a1f 75%,#5a0000);box-shadow:0 0 0 2px #ffd54a,0 0 0 4px #6b0000,0 0 26px #ff3b2fcc,0 8px 18px #000a}
#annB.asc .aIn{background:linear-gradient(100deg,#00262e,#036b7d 45%,#14c9e0 75%,#00262e);box-shadow:0 0 0 2px #b9fbff,0 0 0 4px #00414b,0 0 26px #2ef3ffcc,0 8px 18px #000a}
#annB .aIn:after{content:'';position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,#fff7 50%,transparent 70%);transform:translateX(-120%);animation:annSh 1.6s .5s ease-in-out 2}
@keyframes annSh{to{transform:translateX(120%)}}
#annB .aPs{display:flex;flex:none}#annB .aP{width:48px;height:48px;border-radius:12px;background:#000 center/cover;margin-left:-14px;box-shadow:0 0 0 2px #ffd54a,0 3px 8px #000c;animation:annPop .6s cubic-bezier(.2,1.6,.4,1) both}
#annB .aP:first-child{margin-left:0}#annB .aP.g{background:radial-gradient(#0d6b7a,#012a31);box-shadow:0 0 0 2px #b9fbff,0 3px 8px #000c;display:flex;align-items:center;justify-content:center}#annB .aP.g img{width:86%;height:86%;object-fit:contain}
@keyframes annPop{from{transform:scale(.2) rotate(-20deg)}}
#annB .aTx{min-width:0;display:flex;flex-direction:column;line-height:1.15;color:#fff;text-shadow:0 1px 2px #000}
#annB .aTx small{font:900 10.5px Game,system-ui;letter-spacing:.06em;color:#ffe27a}#annB.asc .aTx small{color:#d9feff}
#annB .aTx b{font:900 16px Game,system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#annB .aTx span{font:700 11px Game,system-ui;color:#fff3d6}
#onl .sys.s2 .shine{background:linear-gradient(90deg,#b3121c,#ff5a1f);color:#fff;font-weight:900;box-shadow:0 0 0 1.5px #ffd54a}#onl .sys.s2.g .shine{background:linear-gradient(90deg,#036b7d,#14c9e0)}
</style>`);
addButtons();
window.ONLINE={brag,arTk:()=>arenaTk,name:()=>ME&&ME.name,open:openHub,close:()=>closeHub(1),sync,play:playFight,call,view:viewProfile};
})();
