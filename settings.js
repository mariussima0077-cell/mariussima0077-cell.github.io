// =====================================================================
//  TORQUE EMPIRE · SOUND + SETTINGS (settings.js) · v16-380 (Marius 27 nov 2026:
//  "trebuie adăugată o muzică pentru joc și niște efecte sonore când apăsăm click etc, pentru hits skills la fel…
//   o icoană de settings unde apare tot ce ține de setări… muzica on off, effects")
//  • TE_SFX(kind)  – every sound effect of the game, made in code (Web Audio, no files): taps, pages, rewards, upgrades,
//                    battle hits / crits / skills by role / ultimates / heals, thieves (alarm, whistle, punches, dogs, helicopter…)
//  • music         – snd/garage.mp3 on the garage map, snd/battle.mp3 in battles and big raids (made by tools/music_gen.py)
//  • TE_SETTINGS   – the ⚙ SETTINGS page: music, sound effects, camera on thieves, graphics, language
//  Saved on the phone: te_snd (effects), te_mus (music), te_cam (camera follows thieves) – '0' = off.
// =====================================================================
(function(){
'use strict';
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}return null;};
const $=id=>document.getElementById(id);
const ST={sfx:LS('te_snd')!=='0',mus:LS('te_mus')!=='0',cam:LS('te_cam')!=='0'};
const rnd=(a,b)=>a+Math.random()*(b-a);

// ---------------------------------------------------------------- sound effects (Web Audio)
const A={ctx:null,m:null,nb:null,last:{}};
function actx(){if(!ST.sfx||window.__SIM)return null;
  try{if(!A.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;A.ctx=new C();
      A.m=A.ctx.createGain();A.m.gain.value=.5;
      const cp=A.ctx.createDynamicsCompressor();cp.threshold.value=-14;cp.ratio.value=6;cp.attack.value=.003;cp.release.value=.15;A.m.connect(cp);cp.connect(A.ctx.destination); // many hits at once never crackle
      const n=Math.floor(A.ctx.sampleRate*.8),b=A.ctx.createBuffer(1,n,A.ctx.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;A.nb=b;}
    if(A.ctx.state==='suspended')A.ctx.resume().catch(()=>{});
    return A.ctx.state==='running'?A.ctx:null;}catch(e){return null;}}
// one oscillator note: f → f1 (glide), attack `at`, then fades out
function tone(C,t0,f,dur,vol,type,f1,at){const o=C.createOscillator(),g=C.createGain();o.type=type||'sine';o.frequency.setValueAtTime(Math.max(20,f),t0);if(f1)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t0+dur);
  if(at){g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+at);}else g.gain.setValueAtTime(vol,t0);
  g.gain.exponentialRampToValueAtTime(.0008,t0+dur);o.connect(g);g.connect(A.m);o.start(t0);o.stop(t0+dur+.03);}
// filtered noise burst: band at fq → fq1 (sweep)
function noise(C,t0,dur,vol,fq,q,fq1,at){const s=C.createBufferSource(),fl=C.createBiquadFilter(),g=C.createGain();s.buffer=A.nb;s.loop=true;fl.type='bandpass';fl.frequency.setValueAtTime(fq,t0);if(fq1)fl.frequency.exponentialRampToValueAtTime(fq1,t0+dur);fl.Q.value=q||1;
  if(at){g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+at);}else g.gain.setValueAtTime(vol,t0);
  g.gain.exponentialRampToValueAtTime(.0008,t0+dur);s.connect(fl);fl.connect(g);g.connect(A.m);s.start(t0,Math.random()*.4);s.stop(t0+dur+.03);}
const arp=(C,t0,fs,step,dur,vol,type)=>fs.forEach((f,i)=>tone(C,t0+i*step,f,dur,vol,type||'triangle'));
// shortest time between two sounds of the same kind (seconds)
const GAP={tap:.045,open:.12,close:.12,deny:.25,coin:.08,reward:.3,upgrade:.3,levelup:.3,summon:.4,toggle:.08,
  hit:.06,crit:.08,shot:.07,thud:.12,break:.09,boom:.25,cast:.3,ko:.3,win:1,lose:1,heal:.22,shield:.3,
  sk_tank:.25,sk_warrior:.25,sk_ranger:.25,sk_mage:.25,sk_support:.25,ult:.5,
  alarm:1.2,whistle:.5,punch:.07,bark:.22,cuffs:.25,escape:.5,cash:.3,horn:2,chop:.11,scare:.3,siren:1.5,badge:.5,heat:.6,engine:.5,stun:.3};
const K={
  // ---- interface
  tap(C,t,p){tone(C,t,880*p,.045,.16,'triangle',620*p);noise(C,t,.02,.07,4200,1);},
  open(C,t,p){noise(C,t,.16,.10,900,.8,3200,.03);tone(C,t,420*p,.12,.07,'sine',760*p);},
  close(C,t,p){noise(C,t,.13,.08,2600,.8,800);tone(C,t,640*p,.1,.06,'sine',380*p);},
  toggle(C,t,p){tone(C,t,620*p,.05,.14,'square',620*p);tone(C,t+.05,930*p,.07,.12,'triangle');},
  deny(C,t){tone(C,t,170,.11,.16,'sawtooth',150);tone(C,t+.13,130,.16,.16,'sawtooth',110);},
  coin(C,t,p){tone(C,t,1320*p,.09,.13,'triangle');tone(C,t+.07,1760*p,.22,.13,'triangle');},
  reward(C,t){arp(C,t,[784,988,1175,1568],.07,.32,.11);noise(C,t+.2,.4,.04,7000,.7);},
  upgrade(C,t){noise(C,t,.05,.22,2400,1.4);tone(C,t,300,.12,.14,'triangle',200);noise(C,t+.13,.05,.22,2800,1.4);tone(C,t+.13,340,.12,.14,'triangle',220);arp(C,t+.28,[523,659,784,1046],.06,.3,.1);},
  levelup(C,t){arp(C,t,[392,523,659,784,1046],.06,.34,.11);tone(C,t,196,.45,.1,'sine',392);},
  summon(C,t){noise(C,t,.55,.12,500,.7,5200,.25);tone(C,t,180,.55,.1,'sawtooth',720,.2);arp(C,t+.5,[1046,1318,1568,2093],.05,.4,.09);},
  // ---- battle
  hit(C,t,p){const f=470*p;for(const [m,v] of [[1,.2],[2.76,.09],[5.4,.045]])tone(C,t,f*m,.2/m+.05,v,'triangle');noise(C,t,.05,.24,2500,1.2);tone(C,t,150,.07,.12,'sine',70);},
  crit(C,t,p){const f=520*p;for(const [m,v] of [[1,.24],[2.76,.12]])tone(C,t,f*m,.3,v,'triangle');tone(C,t+.01,2100*p,.25,.08);noise(C,t,.08,.3,3200,1);tone(C,t,120,.14,.2,'sine',50);},
  shot(C,t,p){tone(C,t,360*p,.16,.12,'triangle',170*p);noise(C,t,.11,.13,1900,.8,700);},
  thud(C,t,p){tone(C,t,140*p,.16,.22,'sine',70);noise(C,t,.08,.15,600,1);},
  break(C,t){noise(C,t,.45,.33,520,.7,180);for(let i=0;i<3;i++)tone(C,t+i*.06,rnd(300,900),.25,.08,'triangle');},
  boom(C,t){noise(C,t,1.1,.5,200,.6,60);tone(C,t,80,.9,.36,'sine',32);noise(C,t,.12,.25,2600,.8);},
  cast(C,t,p){tone(C,t,220*p,.5,.11,'sawtooth',880*p,.05);noise(C,t,.45,.08,1200,.5,4000);},
  sk_tank(C,t,p){tone(C,t,110*p,.4,.26,'sine',48);noise(C,t,.09,.3,1500,1.5);for(const m of [1,2.4,3.9])tone(C,t+.02,330*p*m,.5/m,.09/m,'triangle');},
  sk_warrior(C,t,p){noise(C,t,.22,.26,5200,1.2,900,.02);tone(C,t,900*p,.2,.09,'sawtooth',240*p);noise(C,t+.16,.08,.22,2400,1);},
  sk_ranger(C,t,p){tone(C,t,300*p,.22,.1,'square',1500*p,.03);noise(C,t+.2,.07,.3,3600,1);tone(C,t+.2,880*p,.25,.13,'triangle',220*p);},
  sk_mage(C,t,p){arp(C,t,[660*p,990*p,1320*p,1760*p,2640*p],.045,.4,.07,'sine');noise(C,t,.5,.07,2500,.6,8000,.2);tone(C,t,165*p,.5,.09,'sine',330*p);},
  sk_support(C,t,p){arp(C,t,[523*p,659*p,784*p,1046*p],.07,.5,.09,'sine');tone(C,t,1568*p,.6,.035,'sine');},
  ult(C,t){noise(C,t,.5,.16,300,.6,6000,.35);tone(C,t,90,.5,.14,'sawtooth',520,.3);noise(C,t+.5,.9,.42,220,.6,70);tone(C,t+.5,70,.8,.32,'sine',30);for(const f of [294,440,587,880])tone(C,t+.5,f,.9,.07,'sawtooth');},
  heal(C,t,p){tone(C,t,784*p,.2,.08,'sine');tone(C,t+.09,1175*p,.32,.08,'sine');},
  shield(C,t,p){tone(C,t,330*p,.35,.09,'triangle',660*p,.05);noise(C,t,.3,.05,3000,.6,6000);},
  stun(C,t){tone(C,t,900,.1,.1,'square',300);tone(C,t+.1,700,.14,.08,'square',240);},
  ko(C,t){tone(C,t,190,.5,.2,'sine',60);noise(C,t,.2,.1,400,1);},
  win(C,t){arp(C,t,[523,659,784],.11,.3,.12);for(const f of [523,659,784,1046])tone(C,t+.36,f,.9,.09,'triangle');tone(C,t+.36,131,.9,.13,'sine');noise(C,t+.36,.6,.05,7000,.6);},
  lose(C,t){arp(C,t,[392,349,311,262],.2,.5,.11,'triangle');tone(C,t+.6,98,1,.14,'sine',55);},
  // ---- thieves & security
  alarm(C,t){for(let i=0;i<4;i++){tone(C,t+i*.26,880,.13,.12,'square');tone(C,t+i*.26+.13,660,.13,.12,'square');}},
  siren(C,t){for(let i=0;i<2;i++){tone(C,t+i*.6,620,.3,.09,'sawtooth',1150,.03);tone(C,t+i*.6+.3,1150,.3,.09,'sawtooth',620);}},
  whistle(C,t,p){for(let i=0;i<5;i++)tone(C,t+i*.045,2850*p*(i%2?1.04:1),.05,.11,'sine');tone(C,t+.24,2850*p,.22,.11,'sine',2500*p);},
  scare(C,t,p){tone(C,t,2700*p,.09,.12,'sine');tone(C,t+.1,2700*p,.2,.12,'sine',2300*p);},
  punch(C,t,p){tone(C,t,160*p,.1,.24,'sine',60);noise(C,t,.06,.24,900,1,300);},
  bark(C,t,p){tone(C,t,420*p,.09,.2,'sawtooth',230*p);noise(C,t,.08,.14,1300,2);tone(C,t+.13,460*p,.08,.18,'sawtooth',250*p);noise(C,t+.13,.07,.12,1400,2);},
  cuffs(C,t,p){for(let i=0;i<3;i++){noise(C,t+i*.06,.03,.2,5200,3);tone(C,t+i*.06,2400*p,.05,.07,'triangle');}arp(C,t+.22,[784,1046],.08,.25,.09);},
  escape(C,t){noise(C,t,.6,.2,2600,6,1500,.05);tone(C,t,90,.6,.12,'sawtooth',190,.05);},
  cash(C,t){arp(C,t,[1320,1100,880,660],.07,.16,.1);tone(C,t+.3,150,.25,.12,'sawtooth',110);},
  horn(C,t){for(const f of [233,277,349]){tone(C,t,f,.5,.11,'sawtooth',f,.03);tone(C,t+.62,f,1,.12,'sawtooth',f*.97,.03);}noise(C,t,1.6,.05,500,.5);},
  chop(C,t){noise(C,t,.07,.16,150,1.2);tone(C,t,95,.06,.1,'sine',60);},
  engine(C,t){tone(C,t,70,.5,.14,'sawtooth',150,.05);noise(C,t,.5,.1,300,.7,900,.05);},
  badge(C,t){arp(C,t,[1046,1318,1568,2093,2637],.055,.4,.09);noise(C,t+.25,.5,.04,8000,.5);},
  heat(C,t){noise(C,t,.5,.16,500,.6,3600,.2);tone(C,t,220,.45,.08,'sawtooth',660,.15);}
};
function sfx(kind){const f=K[kind];if(!f)return;const now=performance.now()/1000;if(now-(A.last[kind]||0)<(GAP[kind]||.05))return;const C=actx();if(!C)return;A.last[kind]=now;
  try{f(C,C.currentTime+.005,rnd(.94,1.07));}catch(e){console.error('sfx '+kind,e);}}
window.TE_SFX=sfx;sfx.kinds=Object.keys(K);
// the old switch (battle.js / Profile) keeps working: it is the SOUND EFFECTS switch now
window.TE_SND={get on(){return ST.sfx;},set(v){ST.sfx=!!v;LS('te_snd',v?'1':'0');}};

// taps on anything that can be pressed (buttons, tabs, cards, list rows)
function pressable(el){for(let i=0;el&&el!==document.body&&i<5;i++,el=el.parentElement){const tg=el.tagName;
    if(tg==='BUTTON'||tg==='A'||tg==='SELECT'||(tg==='INPUT'&&el.type!=='text'))return true;
    if(el.onclick||el.hasAttribute('onclick'))return true;
    for(const k in el.dataset)return true;
    if(typeof el.className==='string'&&/(^|[\s_-])(btn|tab|card|shine|edit|close)|B(\s|$)/.test(el.className))return true;}
  return false;}
document.addEventListener('click',e=>{const t=e.target;if(!t||t.id==='game'||t.tagName==='CANVAS'||t.closest('#stg'))return;if(pressable(t))sfx('tap');},true);
// the first touch wakes the audio (browsers start sound only after a touch)
function wake(){actx();music.start();}
['pointerdown','keydown','touchend'].forEach(ev=>addEventListener(ev,wake,{passive:true,capture:true}));

// ---------------------------------------------------------------- music (2 loops, one <audio>)
const MUS={garage:{src:'snd/garage.mp3?v=380',vol:1},battle:{src:'snd/battle.mp3?v=380',vol:1}};   // the files are already quiet (iPhones ignore audio.volume)
const music={el:null,cur:'',vol:0,tg:0,sw:null,woke:false,
  want(){return (window.__BATTLE_ON||window.__RAID_MUS)?'battle':'garage';},
  start(){this.woke=true;if(!this.el&&ST.mus)this.tick(true);},
  tick(now){const on=ST.mus&&this.woke&&!document.hidden&&!window.__SIM;
    if(!on){if(this.el&&!this.el.paused){try{this.el.pause();}catch(e){}}this.vol=0;return;}
    const w=this.want();
    if(!this.el){const a=this.el=new Audio();a.loop=true;a.preload='auto';a.volume=0;a.setAttribute('playsinline','');}
    const a=this.el;
    if(this.cur!==w){if(this.cur&&this.vol>.02&&!now){this.tg=0;return;}   // fade the old track out first
      this.cur=w;this.vol=0;a.volume=0;a.src=MUS[w].src;try{a.currentTime=0;}catch(e){}}
    this.tg=MUS[this.cur].vol;
    if(a.paused){const p=a.play();if(p&&p.catch)p.catch(()=>{});}},
  fade(){if(!this.el)return;const d=this.tg-this.vol;if(Math.abs(d)<.004){this.vol=this.tg;}else this.vol+=Math.sign(d)*Math.min(Math.abs(d),.09);
    try{this.el.volume=Math.max(0,Math.min(1,this.vol));}catch(e){}}};
setInterval(()=>music.tick(),400);setInterval(()=>music.fade(),60);
document.addEventListener('visibilitychange',()=>music.tick());
window.TE_MUS={get on(){return ST.mus;},get track(){return music.el&&!music.el.paused?music.cur:'';},set(v){ST.mus=!!v;LS('te_mus',v?'1':'0');music.tick(true);}};
window.TE_SET={get cam(){return ST.cam;},get sfx(){return ST.sfx;},get mus(){return ST.mus;}};

// ---------------------------------------------------------------- ⚙ SETTINGS page
const css=document.createElement('style');css.textContent=`
#zoom #stBtn{padding:0;display:flex;align-items:center;justify-content:center}
#zoom #stBtn svg{width:30px;height:30px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.6))}
#zoom #stBtn.pic{background:url(img/ui10/settings.webp) center/contain no-repeat!important;box-shadow:none!important;border:0!important;border-radius:0!important;width:52px;height:52px;margin:-2px;filter:drop-shadow(0 4px 5px #000a)}#zoom #stBtn.pic svg{display:none}
#stg{position:fixed;inset:0;z-index:9400;display:none;flex-direction:column;background:#0b1118 url(img/forge/forge_bg.webp) center top/cover no-repeat;color:#fff;font:700 13px Body,system-ui}#stg::before{content:"";position:absolute;inset:0;background:linear-gradient(#000a,#000c);pointer-events:none}#stg>*{position:relative} /* v16-394 Marius' pictures */
#stg.open{display:flex;animation:stgIn .18s ease-out}@keyframes stgIn{from{opacity:0;transform:translateY(14px)}}
#stg .sgH{flex:none;display:flex;align-items:center;gap:6px;padding:calc(env(safe-area-inset-top) + 6px) 8px 4px}
#stg .sgH button{flex:none;width:56px;height:40px;border:0;background:url(img/ui8/ic_back.webp) center/contain no-repeat;font-size:0}
#stg .sgH b{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
#stg .sgH img{flex:1;min-width:0;width:100%;height:auto;max-height:84px;object-fit:contain;filter:drop-shadow(0 3px 6px #000a)}
#stg .sgB{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:6px 12px calc(env(safe-area-inset-bottom) + 24px)}
#stg h3{margin:16px 2px 7px;font:900 14px Game,system-ui;color:#ffd54a;letter-spacing:1px;text-shadow:0 1px 0 #000}
#stg .sgR{display:flex;align-items:center;gap:10px;min-height:56px;padding:2px 4px;margin:0 0 7px;border-style:solid;border-color:transparent;border-width:14px;border-image:url(img/forge/panel.webp) 104 fill/14px stretch;background:none}
#stg .sgR.sel{filter:drop-shadow(0 0 5px #ffd54a)}
#stg .sgR>div{flex:1;min-width:0}
#stg .sgR b{display:block;font:900 14.5px Game,system-ui;color:#fff;text-shadow:0 1px 0 #000}
#stg .sgR small{display:block;margin-top:2px;font:700 11px Body,system-ui;color:#9fb0c3;line-height:1.25}
#stg .sgR small b{display:inline;font:800 11px Body,system-ui;color:#ffd54a}
#stg .sgR>i{flex:none;font:900 16px Game,system-ui;font-style:normal;color:#7CFC9A}
#stg .sgT{flex:none;position:relative;width:64px;height:33px;background:url(img/ui11/tog_off.webp) center/100% 100% no-repeat}
#stg .sgT::after{content:none}
#stg .sgT.on{background-image:url(img/ui11/tog_on.webp)}
#stg .sgN{margin:14px 4px 0;font:700 11px Body,system-ui;color:#7f8fa3;text-align:center;line-height:1.4}`;
document.head.appendChild(css);
const GEAR='<svg viewBox="0 0 40 40"><path d="M17 3h6l1 4.3 3 1.3 3.8-2.3 4.2 4.2-2.3 3.8 1.3 3 4.3 1v6l-4.3 1-1.3 3 2.3 3.8-4.2 4.2-3.8-2.3-3 1.3-1 4.3h-6l-1-4.3-3-1.3-3.8 2.3-4.2-4.2 2.3-3.8-1.3-3-4.3-1v-6l4.3-1 1.3-3-2.3-3.8 4.2-4.2 3.8 2.3 3-1.3z" fill="#ffd54a" stroke="#5e3d00" stroke-width="2" stroke-linejoin="round"/><circle cx="20" cy="20" r="6.5" fill="#1a2430" stroke="#5e3d00" stroke-width="2"/><circle cx="20" cy="20" r="2.4" fill="#ffd54a"/></svg>';
function row(k,ttl,sub,on){return '<div class="sgR" data-sg="'+k+'"><div><b>'+ttl+'</b><small>'+sub+'</small></div><span class="sgT'+(on?' on':'')+'"></span></div>';}
function render(){const B=$('stgB');if(!B)return;const G=window.GFX||{man:'auto',eff:'std'},TN={hd:'HD',std:'STANDARD',low:'LOW'},lang=window.TE_LANG||'en';
  B.innerHTML='<h3>SOUND</h3>'+
    row('mus','🎵 MUSIC','Game music on the map and in battles',ST.mus)+
    row('sfx','🔊 SOUND EFFECTS','Taps, hits, skills, rewards and thieves',ST.sfx)+
    '<h3>GAME</h3>'+
    row('cam','🎥 CAMERA ON THIEVES','When thieves come, the map moves to them by itself',ST.cam)+
    '<h3>GRAPHICS</h3>'+[['auto','⚙️ AUTO · recommended','The game checked your phone → <b>'+TN[G.man==='auto'?G.eff:(G.tier==='lo'?'low':'std')]+'</b> for you'],['hd','✨ HD · MAX QUALITY','Sharpest picture on good phones · uses more battery and memory'],['std','🖼️ STANDARD','Sharp picture, normal battery use'],['low','🍃 LOW · SMOOTH','For older phones – lighter picture, no lag, less battery']]
      .map(g=>'<div class="sgR'+(G.man===g[0]?' sel':'')+'" data-gfx="'+g[0]+'"><div><b>'+g[1]+'</b><small>'+g[2]+'</small></div><i>'+(G.man===g[0]?'✅':'')+'</i></div>').join('')+
    '<h3>LANGUAGE</h3>'+Object.entries(window.TE_LANGS||{en:'English'}).map(([c,n])=>'<div class="sgR'+(lang===c?' sel':'')+'" data-lng="'+c+'" data-notr="1"><div><b>'+n+'</b></div><i>'+(lang===c?'✅':'')+'</i></div>').join('')+
    '<div class="sgN">Your settings are saved on this phone.</div>';}
function open(){const o=$('stg');if(!o)return;render();o.classList.add('open');sfx('open');}
function close(){const o=$('stg');if(o&&o.classList.contains('open')){o.classList.remove('open');sfx('close');}}
function init(){const o=$('stg');if(!o||o.__in)return;o.__in=1;
  o.innerHTML='<div class="sgH"><button id="stgX" aria-label="Back">↩</button><img src="img/ui11/settings_h.webp" alt="SETTINGS"><b>SETTINGS</b></div><div class="sgB" id="stgB"></div>';
  $('stgX').onclick=close;
  $('stgB').addEventListener('click',e=>{
    const r=e.target.closest('[data-sg]');
    if(r){const k=r.dataset.sg;
      if(k==='mus'){window.TE_MUS.set(!ST.mus);}
      else if(k==='sfx'){window.TE_SND.set(!ST.sfx);}
      else if(k==='cam'){ST.cam=!ST.cam;LS('te_cam',ST.cam?'1':'0');}
      sfx('toggle');render();return;}
    const gx=e.target.closest('[data-gfx]');
    if(gx){const v=gx.dataset.gfx,G=window.GFX;if(!G||G.man===v)return;sfx('tap');G.set(v);try{window.__TE.save();}catch(x){}
      render();setTimeout(()=>location.reload(),700);return;}
    const lg=e.target.closest('[data-lng]');
    if(lg){sfx('tap');if(lg.dataset.lng!==(window.TE_LANG||'en')&&window.TE_SETLANG)window.TE_SETLANG(lg.dataset.lng);}});
  const b=$('stBtn');if(b){b.innerHTML=GEAR;b.classList.add('pic');b.onclick=open;}}   // v16-381: Marius' own icon (img/ui10/settings.webp); the drawn gear stays as a fallback in the code
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.TE_SETTINGS={open,close};
})();
