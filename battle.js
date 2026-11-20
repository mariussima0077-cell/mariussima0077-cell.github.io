// =====================================================================
//  TORQUE EMPIRE · CAMPAIGN (battle.js) · v14
//  Up to 5 mechanics fight monsters built from car parts.
//  v14: 50 chapters (10 acts × 5 worlds), gear art for every grade, Gear Summon with blue Gear Tickets.
//  Everything here is drawn from code (except the frames, tickets and portraits frames from img/).
// =====================================================================
(function(){
'use strict';
const TE=()=>window.__TE;
const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
// v16-42: update a page WITHOUT recreating its pictures (re-creating every <img> made them blink for a frame on cheap phones)
function morph(el,html){const t=document.createElement('template');t.innerHTML=html;mKids(el,t.content);}
function mKids(a,b){const an=a.childNodes,bn=[...b.childNodes];
  for(let i=0;i<bn.length;i++){const o=an[i],n=bn[i];if(!o){a.appendChild(n);continue;}
    if(o.nodeType!==n.nodeType||o.nodeName!==n.nodeName){a.replaceChild(n,o);continue;}
    if(o.nodeType!==1){if(o.nodeValue!==n.nodeValue)o.nodeValue=n.nodeValue;continue;}
    for(const at of [...o.attributes])if(!n.hasAttribute(at.name))o.removeAttribute(at.name);
    for(const at of n.attributes)if(o.getAttribute(at.name)!==at.value)o.setAttribute(at.name,at.value);
    mKids(o,n);}
  while(an.length>bn.length)a.removeChild(a.lastChild);}
const $m=id=>({set innerHTML(v){morph($(id),v);}}); // $m('x').innerHTML=… = same as $('x') but without blinking
const lerp=(a,b,t)=>a+(b-a)*t;
const TAU=Math.PI*2;

// ---------------------------------------------------------------- styles
const css=document.createElement('style');
css.textContent=`
#cp{position:fixed;inset:0;z-index:20;display:none;background:#0a0e14;color:#fff;font-family:system-ui,-apple-system,Roboto,sans-serif;overflow:hidden;touch-action:none}
#cp.open{display:block}
#cpMap{position:absolute;inset:0;overflow-y:auto;touch-action:pan-y;background:linear-gradient(#2a1608 0%,#4a2410 30%,#1d1410 70%,#0c0a09 100%)}
#cpTop{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:8px;padding:10px 10px 8px;background:linear-gradient(#0d0907f0,#0d090700)}
.cpB{border:0;border-radius:12px;background:#24170f;color:#ffd54a;font-weight:900;font-size:18px;height:40px;min-width:44px;border:1px solid #ffb30066}
#cpTitle{flex:1;text-align:center;line-height:1.05}
#cpTitle b{display:block;font-size:19px;letter-spacing:1px;color:#ffcc80;text-shadow:0 2px 0 #000,0 0 10px #ff6d00}
#cpTitle small{font-size:11px;color:#c8a27c;font-weight:800;letter-spacing:1.5px}
#cpTk{background:#24170f;border:1px solid #ffb30066;border-radius:12px;padding:8px 10px;font-weight:900;color:#ffd54a;font-size:14px}
#cpPath{position:relative;height:1180px;margin:0 auto;max-width:520px}
#cpPath canvas{position:absolute;left:0;top:0;width:100%;height:100%}
.node{position:absolute;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;border:3px solid #ffb300;background:radial-gradient(circle at 50% 35%,#6d3b12,#2a1406);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:24px;color:#ffe0b2;box-shadow:0 6px 0 #000a,0 0 18px #ff6d0066;text-shadow:0 2px 0 #000}
.node.lock{filter:grayscale(1) brightness(.45);box-shadow:0 6px 0 #000a}
.node.cur{animation:cpPulse 1.1s infinite}
.node.boss{width:92px;height:92px;margin:-46px 0 0 -46px;border-color:#ff3d00;background:radial-gradient(circle at 50% 35%,#b71c1c,#3a0606);font-size:38px}
.node .st{position:absolute;bottom:-17px;left:50%;transform:translateX(-50%);font-size:13px;white-space:nowrap;letter-spacing:-1px}
.node .nm{position:absolute;top:-20px;left:50%;transform:translateX(-50%);font-size:10px;white-space:nowrap;background:#000a;padding:1px 6px;border-radius:6px;color:#ffcc80;letter-spacing:.5px}
@keyframes cpPulse{0%,100%{transform:scale(1);box-shadow:0 6px 0 #000a,0 0 10px #ff6d00}50%{transform:scale(1.08);box-shadow:0 6px 0 #000a,0 0 30px #ffab00}}
#cpCard,#cpTeam,#cpRes{position:absolute;inset:0;z-index:5;display:none;align-items:center;justify-content:center;background:rgba(4,6,9,.78)}
#cpCard.open,#cpTeam.open,#cpRes.open{display:flex}
.cpBox{width:min(92vw,420px);max-height:90vh;overflow-y:auto;touch-action:pan-y;background:linear-gradient(#2b1a10,#140c08);border:2px solid #ffb300;border-radius:18px;padding:16px;box-shadow:0 0 40px #ff6d0055;box-sizing:border-box}
.cpBox h2{margin:0 0 4px;font-size:22px;color:#ffcc80;text-align:center;text-shadow:0 2px 0 #000}
.cpBox .sub{text-align:center;color:#c8a27c;font-size:12px;font-weight:800;letter-spacing:1px}
.cpSec{margin:12px 0 6px;font-size:12px;font-weight:900;color:#ffb300;letter-spacing:1.5px}
.mons{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.mon{width:76px;background:#0008;border:1px solid #ffffff22;border-radius:10px;padding:4px;text-align:center;font-size:10px;font-weight:800;color:#ffccbc}
.mon canvas{width:68px;height:58px;display:block;margin:0 auto}
.rw{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.rw span{background:#0008;border:1px solid #ffd54a55;border-radius:10px;padding:6px 10px;font-weight:900;color:#ffd54a;font-size:14px}
.cpGo{display:block;width:100%;margin-top:14px;height:52px;border:0;border-radius:14px;font-size:20px;font-weight:900;color:#2a1000;background:linear-gradient(#ffe082,#ffa000 60%,#e65100);box-shadow:0 5px 0 #7a2e00;letter-spacing:1px}
.cpGo.alt{background:linear-gradient(#5d4a3a,#3a2c22);color:#ffd9b0;box-shadow:0 5px 0 #1a120c}
.cpRow{display:flex;gap:8px}.cpRow .cpGo{flex:1}
.anx{display:flex;align-items:center;gap:8px;margin:12px 0 -4px;padding:8px 12px;border-radius:12px;border:1.5px solid #ffb30055;background:#1e140d;font-weight:900;font-size:13px;color:#ffd9b0;letter-spacing:.5px}
.anx i{flex:1;text-align:right;font-style:normal;font-size:12px;color:#ffe082}.anx b{min-width:42px;text-align:center;padding:4px 0;border-radius:9px;background:#3a2c22;color:#a1887f;font-size:12px}
.anx.on{border-color:#66bb6a;box-shadow:0 0 12px #66bb6a44}.anx.on b{background:linear-gradient(#81c784,#388e3c);color:#fff}
.slots{display:flex;gap:6px;justify-content:center}
.slot{width:62px;height:84px;border-radius:12px;border:2px dashed #ffb30088;background:#0007;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;color:#ffb30099;font-size:26px;font-weight:900}
.slot img,.pick img{width:100%;height:62px;object-fit:cover;display:block}
.slot .n,.pick .n{position:absolute;bottom:0;left:0;right:0;font-size:8.5px;font-weight:900;text-align:center;background:#000c;padding:2px 1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff}
.slot .r,.pick .r{position:absolute;top:2px;left:3px;font-size:9px;font-weight:900;text-shadow:0 1px 0 #000}
.slot.f{border-style:solid}
.pool{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:6px}
.pick{position:relative;border-radius:10px;border:2px solid #444;overflow:hidden;background:#000;height:84px}
.pick.on{outline:3px solid #fff;filter:brightness(.55)}
.pick .rl{position:absolute;top:2px;right:3px;font-size:12px}
#cpPow{text-align:center;font-weight:900;color:#ffd54a;margin-top:8px;font-size:15px}
#bt{position:absolute;inset:0;z-index:4;display:none}
#bt.open{display:block}
#btcv{position:absolute;inset:0;width:100%;height:100%;display:block}
#cpRes .stars{font-size:46px;text-align:center;letter-spacing:4px;margin:6px 0}
#cpRes .big{font-size:30px;text-align:center;font-weight:900;letter-spacing:2px}
#cpTop{flex-direction:column;align-items:stretch;gap:6px;background:linear-gradient(#0d0907 70%,#0d0907d0)}
#cpTop .tr1{display:flex;align-items:center;gap:8px}
.cpB.gb{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 6px;line-height:1}.cpB.gb small{font-size:8px;letter-spacing:.5px;margin-top:1px}
.cpB.sm{font-size:11px;height:30px;padding:0 8px;display:inline-flex;align-items:center;gap:3px}
#cpChap{display:flex;align-items:center;gap:8px;background:#000a;border:1px solid #ffb30044;border-radius:12px;padding:4px}
#cpChN{flex:1;text-align:center;line-height:1.1}#cpChN b{display:block;font-size:15px;letter-spacing:.5px;text-shadow:0 1px 0 #000}#cpChN small{font-size:10px;color:#c8a27c;font-weight:800}
.chA{width:40px;height:34px;border-radius:10px;border:1px solid #ffb30088;background:linear-gradient(#3a2614,#1d120a);color:#ffd54a;font-size:22px;font-weight:900;padding:0}.chA.off{opacity:.45}
#cpPath{height:2280px}
.node img{width:62%;height:62%;object-fit:contain;pointer-events:none}
.node.mini{width:78px;height:78px;margin:-39px 0 0 -39px;background:radial-gradient(circle at 50% 35%,#8a3a12,#2a0a04);border-width:4px}
.mon.bossm{width:100px;border-color:#ff525288}
.chUn{margin:10px 0 0;padding:8px;border-radius:12px;background:linear-gradient(90deg,#4a2a00,#7a4a00,#4a2a00);text-align:center;font-weight:900;color:#ffe082;letter-spacing:1px}.chUn small{color:#fff;letter-spacing:0;font-weight:700}
.rw img{vertical-align:-.28em}
.pick .rl,.slot .rl{position:absolute;top:2px;right:2px;width:17px;height:17px}
.roles{margin-top:10px;display:grid;grid-template-columns:1fr;gap:3px;font-size:11.5px;color:#c8a27c;font-weight:800}.roles b{color:#ffcc80;letter-spacing:.5px}
#cpPop.out{position:fixed;z-index:40;color:#fff;font-family:system-ui,-apple-system,Roboto,sans-serif}#cpPop{position:absolute;inset:0;z-index:9;display:none;align-items:center;justify-content:center;background:rgba(2,3,5,.8)}#cpPop.open{display:flex}
#cpPop .cpBox{max-height:92vh}
.pT{font-size:20px;font-weight:900;color:#ffcc80;text-align:center;text-shadow:0 2px 0 #000}
.pD{font-size:12px;color:#d7b994;text-align:center;margin:4px 0 8px;line-height:1.4}
.pR{background:#0007;border:1px solid #ffffff1a;border-radius:12px;margin:5px 0;padding:4px 6px;font-weight:800;font-size:13px;color:#ffe0b2}
.pR>span{display:block;text-align:center;padding:6px}
.hl{display:flex;align-items:center;gap:8px}.hl span{flex:1;line-height:1.25;font-size:13px}.hl small{color:#c8a27c;font-size:11px}.hl em{font-style:normal;text-align:right;font-size:13px;line-height:1.1}
.mp{width:40px;height:40px;border-radius:10px;border:2px solid;object-fit:cover;background:#000}
.up{color:#69f0ae!important}.dn{color:#ff6e6e!important}
.cmp{display:flex;align-items:center;justify-content:center;gap:10px;margin:6px 0}
.mc{width:110px;text-align:center}.mc b{display:block;font-size:12px;margin-top:3px}.mc small{font-size:10px;color:#c8a27c;font-weight:900;letter-spacing:1px}
.mcI{position:relative;width:84px;height:94px;margin:0 auto;border:3px solid;border-radius:14px;overflow:hidden;background:#000}.mcI img{width:100%;height:100%;object-fit:cover}.mcI .rb{position:absolute;right:3px;top:3px;width:24px;height:24px}
.mcI.empty{border:3px dashed #ffb30066;display:flex;align-items:center;justify-content:center;color:#ffb30088;font-size:30px}
.cmA{font-size:26px;color:#ffd54a;font-weight:900}
.ct{background:#0008;border:1px solid #ffffff1a;border-radius:12px;padding:4px 8px;margin:8px 0;font-size:12px}
.ct>div{display:grid;grid-template-columns:1.45fr .95fr .95fr 1.35fr;gap:4px;align-items:center;padding:5px 0;border-bottom:1px solid #ffffff10}.ct>div>b:nth-child(4){font-size:10.5px;white-space:nowrap}
.ct.tx>div{grid-template-columns:.8fr 1.6fr 1.6fr}
.ct>div:last-child{border-bottom:0}.ct span{color:#e0c6ad;font-weight:800}.ct b{text-align:center;color:#fff}.ct .ch b,.ct .ch span{color:#ffb300;font-size:10px;letter-spacing:1px}
.ct .pw{background:#ffb30014;border-radius:8px}
.pc{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:6px 0}
.pc>div{border-radius:12px;padding:6px 8px;font-size:11.5px;line-height:1.35}.pc h4{margin:0 0 4px;font-size:11px;letter-spacing:1px}
.pc .pro{background:#0e3a1e;border:1px solid #69f0ae55}.pc .pro h4{color:#69f0ae}.pc .con{background:#3a0e0e;border:1px solid #ff6e6e55}.pc .con h4{color:#ff8a80}
.pc p{margin:0 0 3px;color:#fff}.pc p.no{opacity:.5}
.tpw{text-align:center;font-weight:900;color:#ffcc80;font-size:13px;margin:6px 0}.tpw small{color:#ff8a80}
.cpGo img{vertical-align:-.22em}.cpGo.dis{filter:grayscale(1) brightness(.7)}
#cpGear{position:absolute;inset:0;z-index:7;display:none;overflow-y:auto;touch-action:pan-y;background:radial-gradient(ellipse at 50% 20%,#3a2414,#140c08 70%);padding-bottom:30px}
#cpGear.open{display:block}
#gSum{position:absolute;inset:0;z-index:8;display:none;overflow-y:auto;touch-action:pan-y;background:radial-gradient(ellipse at 50% 10%,#16264d,#07060a 70%);padding-bottom:28px}#gSum.open{display:block}
#gSum .gTitle b{color:#90caf9}.gsTkP{background:#0d1a33;border:1px solid #64b5f699;border-radius:12px;padding:8px 10px;font-weight:900;color:#e3f2ff;font-size:15px;white-space:nowrap}
#gsHeroCv{display:block;width:calc(100% - 20px);height:230px;margin:4px 10px 10px;border-radius:16px;border:2px solid #64b5f6aa;box-shadow:0 0 30px #2962ff55}
#gsTiles{display:grid;grid-template-columns:repeat(6,1fr);gap:4px;margin:0 8px}.gsT{text-align:center}.gsT b{display:block;font-size:9px;font-weight:900;margin-top:1px;white-space:nowrap;overflow:hidden}
#gsPity{margin:10px 12px 0;padding:8px 10px;border-radius:12px;background:#0b1428;border:1px solid #64b5f655;color:#bbdefb;font-size:12px;font-weight:700;line-height:1.6;text-align:center}#gsPity b{color:#fff}
.gsBtns{display:flex;gap:8px;margin:12px 10px 0}.gsBtn{flex:1;height:70px;border:0;border-radius:16px;background:linear-gradient(#64b5f6,#1e64d0 60%,#0d3a8a);box-shadow:0 5px 0 #08224f,0 0 18px #2962ff66;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}
.gsBtn b{font-size:19px;font-weight:900;letter-spacing:1px;text-shadow:0 2px 0 #0a1f4d}.gsBtn span{font-size:14px;font-weight:900}.gsBtn i{font-style:normal;color:#ffe082;font-size:11px}
.gsBtn.big{background:linear-gradient(#ffe082,#ffa000 60%,#e65100);box-shadow:0 5px 0 #7a2e00,0 0 18px #ffb30066;color:#2a1000}.gsBtn.big b{text-shadow:none}.gsBtn.big i{color:#7a2e00}.gsBtn.dis{filter:grayscale(1) brightness(.65)}
.gsLinks{display:flex;gap:6px;justify-content:center;margin:12px 8px 0;flex-wrap:wrap}
.cpB.gsb{border-color:#64b5f699;background:#0d1a33;color:#e3f2ff;min-width:52px;padding:0 5px}.cpB.gsb span{white-space:nowrap}.cpB.gsb b{font-size:13px}
.gsGo{display:block;margin:2px 12px 6px;width:calc(100% - 24px);height:40px;border:0;border-radius:12px;background:linear-gradient(#64b5f6,#1e64d0);box-shadow:0 4px 0 #08224f;color:#fff;font-weight:900;font-size:14px;letter-spacing:.5px}.gsGo span{font-size:11px;color:#e3f2ff;opacity:.85}
.gsRes{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:10px 0}.gsR{animation:gsIn .45s both;text-align:center}.gsR i{display:block;font-style:normal;font-size:9px;font-weight:900;color:#ffe0b2;line-height:1.15;margin-top:1px}
.gsR.r3 .fc{filter:drop-shadow(0 0 6px #b04dff)}.gsR.r4 .fc{filter:drop-shadow(0 0 9px #ffc400)}.gsR.r5 .fc{filter:drop-shadow(0 0 12px #ff1744)}
@keyframes gsIn{0%{opacity:0;transform:scale(.3) rotateY(90deg)}70%{opacity:1;transform:scale(1.12)}100%{transform:scale(1)}}
.gsRates div{display:flex;align-items:baseline;gap:8px;padding:6px 4px;border-bottom:1px solid #ffffff14}.gsRates span{margin-left:auto;font-weight:900;color:#fff}.gsRates small{color:#a1887f;font-size:10px;width:110px;text-align:right}
.chL{max-height:62vh;overflow-y:auto;margin:8px 0}.chAct{font-size:11px;font-weight:900;letter-spacing:1px;color:#ffb74d;margin:10px 2px 4px}.chI{display:flex;align-items:center;gap:10px;padding:6px 8px;margin:4px 0;border-radius:10px;border:1px solid;border-left-width:5px;background:#1e140d}
.chI b{font-size:18px;font-weight:900;width:28px;text-align:center}.chI span{font-size:13px;font-weight:900;color:#ffe0b2;display:flex;flex-direction:column}.chI small{font-size:10px;color:#a1887f;font-weight:700}.chI.lk{opacity:.5}.chI.on{background:#3a2412;box-shadow:0 0 10px #ffb30055}
#cpChN{cursor:pointer}
.gsHist{max-height:50vh;overflow-y:auto;margin:8px 0}.gsHist div{display:flex;align-items:center;gap:8px;padding:3px 0;border-bottom:1px solid #ffffff10}.gsHist img{width:30px;height:30px;border-radius:6px}.gsHist b{font-size:12px}.gsHist small{margin-left:auto;color:#a1887f;font-size:10px}
.gTop{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:8px;padding:10px;background:linear-gradient(#0d0907f5,#0d0907c0)}
.gTitle{flex:1;text-align:center;line-height:1.05}.gTitle b{display:block;font-size:20px;color:#ffcc80;letter-spacing:1px;text-shadow:0 2px 0 #000}.gTitle small{font-size:10px;color:#69f0ae;font-weight:900;letter-spacing:1px}
#gMoney{background:#24170f;border:1px solid #ffb30066;border-radius:12px;padding:7px 9px;font-weight:900;color:#ffd54a;font-size:13px;white-space:nowrap}
#gHeroes{display:flex;gap:7px;overflow-x:auto;padding:6px 10px 8px;touch-action:pan-x}
.gh{position:relative;flex:0 0 62px;height:80px;border:2px solid;border-radius:12px;overflow:hidden;background:#000;opacity:.6}.gh.on{opacity:1;box-shadow:0 0 0 2px #fff,0 0 14px #ffb300}
.gh>img{width:100%;height:58px;object-fit:cover;display:block}.gh .rb{position:absolute;right:2px;top:2px;width:16px;height:16px}
.gh i{position:absolute;left:2px;top:2px;font-style:normal;font-size:7px;font-weight:900;background:#ffb300;color:#2a1000;border-radius:4px;padding:1px 3px}
.gh span{position:absolute;bottom:0;left:0;right:0;font-size:8.5px;font-weight:900;text-align:center;background:#000c;padding:3px 1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#gMain{display:flex;align-items:center;justify-content:center;gap:8px;padding:4px 10px}
.gCol{display:flex;flex-direction:column;gap:6px;width:78px}
.gsl{text-align:center}.gsl small{display:block;font-size:9px;font-weight:900;color:#c8a27c;letter-spacing:.5px;margin-top:-2px}
.gse{aspect-ratio:220/236;border:2px dashed #ffb30055;border-radius:14px;background:#0006;display:flex;align-items:center;justify-content:center}.gse img{width:55%}.gse.sm{width:56px;font-size:20px;color:#ffb30088}
.gMid{flex:1;max-width:170px;text-align:center}.gPor{width:130px;margin:0 auto}.gMid>b{display:block;font-size:15px;margin-top:2px}.gMid>small{display:block;font-size:10.5px;color:#c8a27c;font-weight:800;margin-top:2px}
.gPow{margin-top:6px;display:inline-block;background:#000a;border:1px solid #ffd54a66;border-radius:10px;padding:4px 10px;font-weight:900;color:#ffd54a;font-size:16px}
#gStats{margin:8px 12px;background:#0008;border:1px solid #ffffff1a;border-radius:14px;padding:6px 10px;display:grid;grid-template-columns:1fr 1fr;gap:2px 12px}
#gStats>div{display:flex;align-items:center;gap:4px;font-size:11.5px;padding:3px 0;white-space:nowrap}#gStats span{flex:1;color:#e0c6ad;font-weight:800}#gStats b{color:#fff}#gStats em{font-style:normal;color:#69f0ae;font-weight:900;font-size:10.5px;min-width:42px;text-align:right}
#gStats .gNote{grid-column:1/3;justify-content:center;color:#c8a27c;font-size:11px;border-top:1px solid #ffffff12;margin-top:3px;padding-top:5px}
#gBtns{display:flex;gap:8px;margin:0 12px}#gBtns .cpGo{flex:1;margin-top:4px;height:44px;font-size:15px}
#gFil{display:flex;gap:5px;overflow-x:auto;padding:12px 12px 4px;touch-action:pan-x}
.gf{flex:0 0 auto;display:flex;align-items:center;gap:3px;height:32px;border-radius:16px;border:1px solid #ffb30066;background:#24170f;color:#ffd54a;font-weight:900;font-size:11px;padding:0 10px 0 6px}.gf img{width:20px;height:20px}.gf.on{background:linear-gradient(#ffe082,#ffa000);color:#2a1000}
#gInv{padding:0 12px}.gIh{font-size:11px;font-weight:900;color:#ffb300;letter-spacing:1.5px;margin:6px 0}
.gGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
.gi{position:relative}.gi.mine{filter:drop-shadow(0 0 5px #69f0ae)}.gi .own{position:absolute;right:0;top:0;width:20px;height:20px;border-radius:50%;border:2px solid;object-fit:cover;background:#000}
.gi.used{opacity:.75}
.gEmpty{text-align:center;color:#c8a27c;font-weight:800;padding:24px 10px;font-size:13px}
.gDrop{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.gDrop .gi{width:76px}.gDrop i{display:block;font-style:normal;font-size:10px;font-weight:900;text-align:center;color:#ffe0b2}
.iTop{display:flex;gap:10px;align-items:flex-start}.iTop>.gi{flex:0 0 92px}.iTop>div:last-child{flex:1}
.iSt{font-size:12.5px;color:#e0c6ad;font-weight:800;margin:3px 0}.iSt b{color:#fff}.iSt.main{font-size:14px}.iSt.main b{color:#ffd54a}
.iUp{text-align:center;font-weight:900;color:#ffe0b2;font-size:13px;margin:4px 0}.iUp small{color:#c8a27c}
#upFx{position:absolute;left:0;right:0;top:0;height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;z-index:3;animation:ufOut 1.8s ease forwards;background:radial-gradient(ellipse 62% 56% at 50% 52%,rgba(4,3,2,.9) 0,rgba(4,3,2,.72) 55%,transparent 100%)}
#upFx .ufRays{position:absolute;left:50%;top:44%;width:340px;height:340px;margin:-170px 0 0 -170px;border-radius:50%;background:repeating-conic-gradient(from 0deg,var(--c) 0 7deg,transparent 7deg 22deg);-webkit-mask:radial-gradient(circle,#000 18%,transparent 66%);mask:radial-gradient(circle,#000 18%,transparent 66%);opacity:.55;animation:ufRay 1.8s linear forwards}
#upFx .ufIc{position:relative;width:96px;height:96px;border-radius:18px;box-shadow:0 0 0 3px var(--c),0 0 34px var(--c);overflow:hidden;animation:ufPop .55s cubic-bezier(.2,1.6,.4,1) both}#upFx .ufIc img{width:100%;height:100%;display:block}
#upFx .ufIc:after{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.85) 50%,transparent 70%);transform:translateX(-120%);animation:ufShine .7s .25s ease-out forwards}
#upFx .ufSp{position:absolute;left:50%;top:44%}#upFx .ufSp i{position:absolute;width:7px;height:7px;margin:-3px;border-radius:50%;background:#fff;box-shadow:0 0 8px 2px var(--c);animation:ufSpk .8s var(--d) ease-out forwards;opacity:0}
#upFx .ufT{position:relative;margin-top:10px;font-size:24px;font-weight:900;letter-spacing:1px;color:#fff3c4;-webkit-text-stroke:1px #6a3a00;text-shadow:0 0 14px var(--c),0 3px 0 #3a1c00;animation:ufPop .5s .1s cubic-bezier(.2,1.6,.4,1) both}
#upFx .ufL,#upFx .ufS,#upFx .ufP{position:relative;margin-top:4px;padding:3px 12px;border-radius:12px;background:rgba(10,8,6,.82);font-weight:900;color:#ffe0b2;font-size:15px;animation:ufUp .45s .2s ease-out both}
#upFx .ufS{font-size:13px;animation-delay:.28s}#upFx .ufP{font-size:13px;color:#ffd54a;animation-delay:.34s}#upFx b{color:#ffb300}#upFx span{color:#69f0ae}
@keyframes ufOut{0%,75%{opacity:1}100%{opacity:0}}@keyframes ufRay{from{transform:rotate(0) scale(.4)}to{transform:rotate(80deg) scale(1.1)}}
@keyframes ufPop{0%{transform:scale(.2);opacity:0}100%{transform:scale(1);opacity:1}}@keyframes ufUp{0%{transform:translateY(12px);opacity:0}100%{transform:none;opacity:1}}
@keyframes ufShine{to{transform:translateX(120%)}}@keyframes ufSpk{0%{transform:translate(0,0) scale(1.4);opacity:1}100%{transform:translate(var(--x),var(--y)) scale(.2);opacity:0}}
.gi.upHit{animation:upHit .6s ease-out}@keyframes upHit{0%{transform:scale(1);filter:brightness(1)}25%{transform:scale(1.16);filter:brightness(2) drop-shadow(0 0 10px #ffd54a)}100%{transform:scale(1);filter:brightness(1)}}
.upHit2{animation:upHit2 .9s ease-out}@keyframes upHit2{0%,40%{color:#69f0ae;text-shadow:0 0 10px #69f0ae}100%{text-shadow:none}}
.aeL>div{display:grid;grid-template-columns:62px 56px 20px 56px;align-items:center;gap:6px;justify-content:center;margin:4px 0}.aeL small{font-size:10px;font-weight:900;color:#c8a27c;text-align:right}.aeL span{color:#ffd54a;font-weight:900;text-align:center}

/* ===== v15: campaign map like the player's picture ===== */
#cpMap{background:#3a281c}
#cpTop{background:linear-gradient(#07090d 0%,#0d1016 78%,#0d1016e6)!important;border-bottom:2px solid #e0a82e;box-shadow:0 3px 0 #5e3d00,0 8px 18px #000c;padding-top:4px!important}
#cpLogo{display:block;height:44px;margin:0 auto -4px;filter:drop-shadow(0 2px 4px #000)}
.cpB,#cpTk,.chA{background:linear-gradient(#2c3340,#10141b)!important;border:2px solid #d79b22!important;box-shadow:inset 0 1px 0 #ffffff30,0 3px 0 #000a,0 0 8px #ffb30033;border-radius:12px!important}
.cpB.gsb{background:linear-gradient(#1f4f9c,#0b1d44)!important;border-color:#5ab0ff!important;box-shadow:inset 0 1px 0 #ffffff40,0 0 12px #2f8cff88!important}
#cpTitle b{font-size:22px!important;color:#ffcf4a!important;text-shadow:0 2px 0 #5a2c00,0 0 12px #ff9800aa!important;letter-spacing:.5px}
#cpTitle small{color:#cfd3da!important}
#cpChap{background:linear-gradient(#171a20,#0b0d11)!important;border:2px solid #d79b22!important;border-radius:14px!important;box-shadow:0 0 14px #ffb30044,inset 0 0 0 1px #0008}
#cpChN b{font-size:18px!important;color:#ffc93a!important;text-shadow:0 2px 0 #000,0 0 8px #ff9800aa!important}#cpChN small{color:#e8e8e8!important;font-size:11.5px!important}
.chA{width:44px!important;height:38px!important;color:#ffc93a!important}
.node{width:100px!important;height:86px!important;margin:-43px 0 0 -50px!important;border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;animation:none!important;filter:none!important;display:block!important}
.node .pad{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 6px 5px #000a)}
.node .no{position:absolute;left:0;right:0;top:20%;text-align:center;font-size:34px;font-weight:900;color:#eceff1;text-shadow:0 3px 2px #000,0 0 6px #0008;font-family:system-ui;line-height:1}
.node .ic{position:absolute;left:50%;top:44%;width:42%!important;height:auto!important;transform:translate(-50%,-50%);filter:drop-shadow(0 2px 2px #000)}
.node.cur .pad{filter:drop-shadow(0 6px 5px #000a) drop-shadow(0 0 10px #ffb300)}.node.cur::before{content:'';position:absolute;left:8%;right:8%;top:14%;bottom:8%;border-radius:50%;background:radial-gradient(#ffc40088,#ffab0000 70%);animation:padHalo 1.3s ease-in-out infinite;will-change:opacity,transform;pointer-events:none}@keyframes padHalo{0%,100%{opacity:.35;transform:scale(.9)}50%{opacity:1;transform:scale(1.15)}}
.node.cur .no{color:#fff;text-shadow:0 3px 2px #6a3500,0 0 10px #fff6}
@keyframes padGlow{0%,100%{filter:drop-shadow(0 6px 5px #000a) drop-shadow(0 0 6px #ffab00)}50%{filter:drop-shadow(0 6px 5px #000a) drop-shadow(0 0 20px #ffc400)}}
.node.lock .pad{filter:brightness(.8) drop-shadow(0 6px 5px #000a)}.node.lock .no{color:#9ea4ab}
.node .lk{position:absolute;right:16%;bottom:24%;width:18px;height:18px;border-radius:50%;background:#000c url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23ffc93a" d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>') center/12px no-repeat;border:1px solid #d79b22}
.node.boss{width:126px!important;height:108px!important;margin:-54px 0 0 -63px!important}.node.boss .pad{filter:sepia(1) saturate(5) hue-rotate(-38deg) brightness(.8) drop-shadow(0 0 12px #ff1744)}
.node.mini{width:112px!important;height:96px!important;margin:-48px 0 0 -56px!important}.node.mini .pad{filter:sepia(1) saturate(3.5) hue-rotate(-14deg) brightness(.85) drop-shadow(0 0 9px #ff6d00)}
.node.boss.cur .pad,.node.mini.cur .pad{filter:drop-shadow(0 6px 5px #000a) drop-shadow(0 0 10px #ffb300)}
.node .nm{top:-21px!important;font-size:12px!important;font-weight:800;color:#fff!important;background:linear-gradient(#2a2e35,#0c0d10)!important;border:2px solid #8f969f;border-radius:7px!important;padding:2px 9px!important;box-shadow:0 2px 0 #000,inset 0 1px 0 #ffffff25;letter-spacing:.2px!important;font-family:system-ui}
.node.cur .nm{border-color:#e0a82e;background:linear-gradient(#3a2a10,#140c02)!important;box-shadow:0 0 10px #ffb30088}
.node .st{bottom:-12px!important;letter-spacing:0!important;font-size:0!important;background:#000b;border-radius:9px;padding:0 4px;border:1px solid #d79b2288}
.node .st em{font-style:normal;font-size:14px;color:#555;text-shadow:0 1px 0 #000}.node .st em.on{color:#ffc93a;text-shadow:0 0 5px #ff9800}

/* ===== v15: pages like the player's pictures (navy + gold, blue glow) ===== */
.cpBox{background:linear-gradient(#141c2b,#0a0e17)!important;border:2px solid #e0a82e!important;box-shadow:0 0 0 1px #000,0 0 26px #ffb30044,inset 0 0 0 1px #ffffff10!important}
.cpBox h2,.pT{color:#ffd54a!important;text-shadow:0 2px 0 #4a2a00,0 0 10px #ff980066!important}
.pR,.ct,.mon,.rw span{background:linear-gradient(#1b2436,#0e1420)!important;border-color:#3d5a8a66!important}
.cpGo{background:linear-gradient(#ffe27a,#ffb300 55%,#e08a00)!important;box-shadow:0 4px 0 #8a4a00,0 0 14px #ffb30044,inset 0 1px 0 #fff8!important;border-radius:14px!important;color:#2a1600!important}
.cpGo.alt{background:linear-gradient(#3d78d8,#1c47a0 60%,#12337a)!important;box-shadow:0 4px 0 #0a1f4f,0 0 12px #2f8cff55,inset 0 1px 0 #ffffff55!important;color:#fff!important;text-shadow:0 2px 0 #0a1f4d}
.gTop{background:linear-gradient(#05070b,#0b1019 85%,#0b1019e0)!important;border-bottom:2px solid #e0a82e;box-shadow:0 3px 0 #5e3d00,0 6px 16px #000c}
.gTitle.pic img{display:block;height:64px;margin:0 auto;max-width:100%;object-fit:contain}
.gTop .cpB{width:52px;height:44px;font-size:22px}
#cpGear,#gSum{background:radial-gradient(ellipse at 50% 18%,#1a3466,#0a1222 55%,#05070c)!important}
#gMoney,.gsTkP{background:linear-gradient(#2c3340,#10141b)!important;border:2px solid #d79b22!important;border-radius:14px!important;box-shadow:inset 0 1px 0 #ffffff30,0 0 8px #ffb30033;color:#ffd54a!important}
.gsTkP{border-color:#d79b22!important}
.gsGo{height:50px!important;border-radius:14px!important;background:linear-gradient(#5ab4ff,#1f6fe0 55%,#0f3f9c)!important;box-shadow:0 0 0 2px #8fd0ff,0 4px 0 #082a66,0 0 18px #2f8cff88!important;font-size:18px!important;letter-spacing:1px;margin:8px 12px 8px!important}
.gsGo span{color:#bfe3ff!important;font-size:14px!important;opacity:1!important}
#gHeroes{padding:6px 10px 10px!important}
/* stage card team row */
.ctm{display:flex;align-items:center;gap:5px;justify-content:center}.ctm img{width:40px;height:40px;border-radius:9px;border:2px solid;object-fit:cover;background:#000}.ctm .cpB{margin-left:6px}
/* v16-46 HEROES hub: one page for battle team · all heroes · skills · gear · stars */
.gSumRow{display:flex;gap:7px;padding:0 10px}.gSumRow .gsGo{flex:1;margin:0!important;font-size:13px!important;padding:9px 4px!important}.gSumRow .gsGo span{display:block;font-size:10px}
.gSumRow .gsGo.hs{background:linear-gradient(#ffcf5a,#e08a00)!important;color:#2a1000!important;border-color:#fff3!important}
#gTeam{margin:10px 10px 4px;border-radius:16px;padding:9px 8px 8px;background:linear-gradient(#3a2a10,#1a1208);box-shadow:0 0 0 1.5px #ffc23a,0 0 16px #ffb30044,inset 0 1px 0 #fff3}
#gTeam .gtH{display:flex;align-items:center;justify-content:space-between;font:900 12px system-ui;color:#ffd54a;letter-spacing:1px;margin:0 2px 7px}
#gTeam .gtH button{border:0;border-radius:9px;padding:5px 9px;font:900 10.5px system-ui;background:linear-gradient(#fff1a8,#ffb300);color:#2a1000;box-shadow:0 2px 0 #7a4a00}
#gTeam .gtS{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
#gTeam .gts{position:relative;aspect-ratio:.78;border:2px solid;border-radius:11px;overflow:hidden;background:#000}
#gTeam .gts>img{width:100%;height:76%;object-fit:cover;display:block}#gTeam .gts .rb{position:absolute;right:2px;top:2px;width:15px;height:15px}
#gTeam .gts span{position:absolute;left:0;right:0;bottom:0;font:900 8.5px system-ui;text-align:center;background:#000c;padding:3px 1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#gTeam .gts i{position:absolute;left:2px;top:2px;font:900 8px system-ui;font-style:normal;background:#000b;border-radius:4px;padding:1px 3px}
#gTeam .gts.on{box-shadow:0 0 0 2px #fff,0 0 12px #ffb300}
#gTeam .gts.e{border-style:dashed;border-color:#ffc23a77!important;display:flex;align-items:center;justify-content:center;color:#ffc23a;font:900 22px system-ui;background:#0006}
#gTeam .gtP{display:flex;justify-content:space-between;align-items:center;margin-top:7px;font:900 12.5px system-ui;color:#ffe27a}#gTeam .gtP small{font:800 10px system-ui;color:#c9b88a}
.gSecH{display:flex;align-items:center;gap:6px;margin:10px 12px 0;font:900 12px system-ui;color:#ffd54a;letter-spacing:1px}.gSecH #gCnt{color:#c9b88a;font-size:10px}.gSecH .gSort{margin-left:auto;display:flex;gap:4px}
.gSecH .gSort b{font:900 9.5px system-ui;letter-spacing:0;padding:4px 7px;border-radius:7px;background:#1b2330;color:#8fa0b4;border:1px solid #2c3746}.gSecH .gSort b.on{background:linear-gradient(#fff1a8,#ffb300);color:#2a1000;border-color:#7a4a00}
#gHeroes{display:grid!important;grid-template-columns:repeat(4,1fr);gap:7px;overflow:visible!important;padding:7px 10px 10px!important;touch-action:pan-y!important}
#gHeroes .gh{flex:none;height:auto;aspect-ratio:.74;opacity:1}#gHeroes .gh>img{height:74%}
#gHeroes .gh.on{box-shadow:0 0 0 2.5px #fff,0 0 16px #ffb300;transform:scale(1.04)}
#gHeroes .gh .pw{position:absolute;left:0;right:0;bottom:15px;font:900 8.5px system-ui;color:#ffe27a;text-align:center;text-shadow:0 1px 2px #000}
#gHeroes .gh .st{position:absolute;right:2px;bottom:28px;font:900 9px system-ui;color:#fff;background:#000a;border-radius:5px;padding:0 3px}
#gHeroes .gh .gc{position:absolute;left:2px;bottom:28px;font:900 8px system-ui;color:#9fe3ff;background:#000a;border-radius:5px;padding:0 3px}
#gHeroes .gh .up{position:absolute;left:50%;top:17px;transform:translateX(-50%);font:900 7.5px system-ui;color:#fff;background:#2e9d3a;border-radius:0 0 5px 5px;padding:1px 4px;white-space:nowrap}
.gDet{margin:4px 10px 0;font:900 12px system-ui;color:#ffd54a;letter-spacing:1px;display:flex;align-items:center;gap:6px}.gDet:after{content:"";flex:1;height:1px;background:linear-gradient(90deg,#ffd54a88,transparent)}
#gBtns .cpGo.tm{background:linear-gradient(#7dff8a,#2e9d3a)!important;color:#062a0a!important}#gBtns .cpGo.tmo{background:linear-gradient(#56657a,#334)!important;color:#fff!important}
#gBtns{display:flex;flex-wrap:wrap;gap:6px}#gBtns .cpGo{flex:1 1 45%;margin:0!important;font-size:13.5px!important;padding:11px 4px!important;line-height:1.15}

.gh{flex:0 0 66px!important;height:84px!important;border-width:3px!important;border-radius:12px!important;opacity:.85!important;box-shadow:0 0 10px currentColor}
.gh.on{opacity:1!important;box-shadow:0 0 0 2px #fff,0 0 16px #ffb300!important}
.gh .rb{width:20px!important;height:20px!important}
.gse{border:2px solid #d79b22!important;border-radius:14px!important;background:linear-gradient(#1b2232,#0b0f17)!important;box-shadow:inset 0 0 12px #000,0 0 6px #ffb30033;position:relative;flex-direction:column}
.gse img{width:62%!important;filter:grayscale(1) brightness(1.5) contrast(.8);opacity:.5}
.gse:after{content:'+';position:absolute;right:-6px;top:-6px;width:20px;height:20px;border-radius:50%;background:radial-gradient(#ffe27a,#e09a00);color:#3a2000;font-weight:900;font-size:17px;line-height:19px;text-align:center;box-shadow:0 0 0 2px #5e3d00}
.gsl small{color:#fff!important;font-size:10px!important;margin-top:2px!important}
.gPow{background:linear-gradient(#2a2410,#0c0a04)!important;border:2px solid #e0a82e!important;font-size:22px!important;padding:3px 16px!important;border-radius:14px!important;color:#ffd54a!important;font-style:italic;box-shadow:0 0 12px #ffb30044}
.gMid>b{font-size:19px!important;text-shadow:0 2px 0 #000}
.gMid>small{display:inline-block!important;background:#0008;border-radius:12px;padding:3px 10px;color:#fff!important}
#gStats{background:linear-gradient(#141c2b,#0a0e17)!important;border:2px solid #e0a82e!important;box-shadow:0 0 14px #ffb30033!important}
#gStats span{color:#fff!important}#gStats b{color:#fff!important}
#gStats .gNote{grid-column:1/3;background:linear-gradient(90deg,#0b2a5a,#123a7a,#0b2a5a);border:1px solid #4aa3ff88;border-radius:10px;color:#9fd3ff!important;padding:6px!important;margin-top:6px!important}
#gBtns .cpGo{height:52px!important;font-size:18px!important;font-style:italic}
.gf{background:linear-gradient(#2c3340,#10141b);border-color:#d79b22!important;color:#ffd54a}.gf.on{background:linear-gradient(#ffe082,#ffa000)!important;color:#2a1000}
#gsHeroCv{aspect-ratio:824/560;height:auto!important;border:0!important;box-shadow:0 0 30px #2962ff66!important;border-radius:14px!important;width:calc(100% - 16px)!important;margin:6px 8px 10px!important}
#gsTiles{gap:5px!important}
.gsT b{font-size:11px!important;text-shadow:0 1px 0 #000}
.gsT .fs{font-size:12px!important}
.gpBar{position:relative;height:24px;border-radius:12px;background:#05080e;box-shadow:inset 0 0 0 1.5px #6b5420;overflow:hidden}.gpBar i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#b8860b,#ffd54a)}.gpBar span{position:relative;line-height:24px;text-shadow:0 1px 2px #000}
#gsPity{background:linear-gradient(#141c2b,#0a0e17)!important;border:2px solid #e0a82e!important;color:#fff!important;font-size:14px!important;font-weight:800!important;box-shadow:0 0 12px #ffb30033}
.gsBtn{height:78px!important;border-radius:16px!important;background:linear-gradient(#5ab4ff,#1f6fe0 55%,#0f3f9c)!important;box-shadow:0 0 0 2px #8fd0ff,0 5px 0 #082a66,0 0 18px #2f8cff88!important}
.gsBtn b{font-size:22px!important;font-style:italic}
.gsBtn span{background:#0b1a3acc;border-radius:12px;padding:2px 14px;color:#fff}
.gsBtn.big{background:linear-gradient(#ffe27a,#ffb300 55%,#e08a00)!important;box-shadow:0 0 0 2px #fff0b0,0 5px 0 #8a4a00,0 0 18px #ffb30088!important}
.gsBtn.big span{background:#5a2e00cc;color:#fff}.gsBtn.big i{background:#d32f2f;color:#fff!important;padding:1px 6px;border-radius:4px;font-style:italic}
.gsLinks .cpB.sm{height:40px!important;font-size:13px!important;padding:0 12px!important;color:#fff!important}
.ii{display:inline-flex;width:18px;height:18px;border-radius:50%;border:2px solid #ffd54a;color:#ffd54a;font-style:normal;font-size:11px;align-items:center;justify-content:center;font-family:Georgia,serif;font-weight:900}
.pT.pic{margin:-6px -6px 4px}.pT.pic img{display:block;width:100%;height:auto}
.pSub{display:block;margin:-6px auto 8px;width:fit-content;max-width:94%;padding:5px 22px;border-radius:6px;background:linear-gradient(#ffe27a,#ffb300 60%,#d88a00);color:#2a1600;font-weight:900;font-style:italic;font-size:15px;letter-spacing:1px;clip-path:polygon(10px 0,calc(100% - 10px) 0,100% 50%,calc(100% - 10px) 100%,10px 100%,0 50%);text-align:center}
.pSub.blue{background:linear-gradient(#123a7a,#0b2450);color:#fff;box-shadow:inset 0 0 0 2px #4aa3ff;font-style:italic}
.gsHist div{background:linear-gradient(90deg,#141c2b,#0d1320);border:1px solid #3d5a8a44!important;border-radius:8px;padding:5px 8px!important;margin:4px 0}
.gsHist img{width:38px!important;height:38px!important;border-radius:8px!important}
.gsHist b{font-size:15px!important}.gsHist small{font-size:13px!important;font-weight:800}
.gsRates div{background:linear-gradient(90deg,#141c2b,#0d1320);border:1px solid #3d5a8a44;border-radius:10px;margin:4px 0;padding:8px!important}

.grit{margin-top:8px;padding:7px 10px;border-radius:12px;background:linear-gradient(90deg,#4a1500,#7a2a00,#4a1500);border:1px solid #ff9800;color:#ffe0b2;font-size:12px;font-weight:800;text-align:center}.grit b{color:#fff;font-size:14px}
`;
document.head.appendChild(css);

// v16-49: new pictures from Marius (img/ui3): campaign header, stage card, battle buttons, gear summon header
const css3=document.createElement('style');css3.textContent=`
#cpTop{position:sticky!important;top:0;display:block!important;padding:0!important;aspect-ratio:900/443;width:100%;max-width:560px;margin:0 auto;background:url(img/ui3/camp_h.webp) 0 0/100% 100% no-repeat!important;border:0!important;box-shadow:none!important;filter:drop-shadow(0 6px 10px #000c)}
#cpTop .tr1,#cpTop #cpChap{display:contents!important}#cpLogo,#cpTitle,#cpTk{display:none!important}
#cpBack{position:absolute!important;left:2.82%;top:27.44%;width:13.9%;height:28.24%;background:none!important;border:0!important;box-shadow:none!important;border-radius:50%!important;margin:0!important;padding:0!important;min-width:0!important;color:#ffd54a!important;font-size:min(8vw,34px)!important;text-shadow:0 2px 0 #000,0 0 10px #ffb300}
#cpGearB{position:absolute!important;left:75.48%;top:29.28%;width:10.4%;height:21.81%;background:none!important;border:0!important;box-shadow:none!important;border-radius:12%!important;margin:0!important;padding:0!important;min-width:0!important;justify-content:flex-end!important;color:#ffe27a!important}
#cpGSB{position:absolute!important;left:87.06%;top:29.28%;width:10.4%;height:21.81%;background:none!important;border:0!important;box-shadow:none!important;border-radius:12%!important;margin:0!important;padding:0!important;min-width:0!important;justify-content:center!important}
#cpGearB>img{display:none}#cpGearB small,#cpGSB small{font:900 min(2vw,9px) system-ui!important;color:#ffe27a;text-shadow:0 1px 0 #000,0 0 3px #000;margin-bottom:6%}
#cpGSB span{display:flex;flex-direction:column;align-items:center;gap:0}#cpGSB span img{height:min(7.5vw,34px)!important;width:auto;filter:drop-shadow(0 2px 2px #000)}#cpGSB b{font-size:min(3vw,13px)!important;color:#fff;text-shadow:0 1px 0 #000;margin-top:-2px}#cpGSB small{display:none}
#cpPrev{position:absolute!important;left:6.78%;top:67.62%;width:11.92%;height:24.23%;background:none!important;border:0!important;box-shadow:none!important;border-radius:14%!important;margin:0!important;padding:0!important;min-width:0!important;color:transparent!important}
#cpNext{position:absolute!important;left:81.36%;top:67.62%;width:11.92%;height:24.23%;background:none!important;border:0!important;box-shadow:none!important;border-radius:14%!important;margin:0!important;padding:0!important;min-width:0!important;color:transparent!important}
#cpPrev.off,#cpNext.off{opacity:1!important;background:#0009!important}#cpNext img{display:block;margin:auto;width:40%!important;height:auto!important}
#cpChN{position:absolute!important;left:21.92%;top:66.82%;width:56.21%;height:25.83%;display:flex;flex-direction:column;justify-content:center;align-items:center}
#cpCardBox.prepSk{position:relative;width:min(96vw,calc(94vh*1010/1525),470px);aspect-ratio:1010/1525;max-height:none;overflow:visible;padding:0;border:0!important;border-radius:0;box-shadow:none!important;background:url(img/ui3/prep.webp) 0 0/100% 100% no-repeat!important;container-type:inline-size;filter:drop-shadow(0 10px 30px #000)}
#cpCardBox.prepSk>*{position:absolute;box-sizing:border-box}
#cpCardBox .ppT{position:absolute!important;left:18.12%;top:6.03%;width:63.86%;height:8.85%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;line-height:1.1}
#cpCardBox .ppT b{font:900 5.4cqw system-ui;color:#ffd54a;text-shadow:0 2px 0 #000,0 0 8px #ff9800aa}#cpCardBox .ppT small{font:800 2.9cqw system-ui;color:#cfe3ff;letter-spacing:.5px;margin-top:2px}
#cpCardBox .mons{position:absolute!important;left:15.64%;top:21.44%;width:68.81%;height:13.11%;display:flex!important;justify-content:space-between;gap:0;margin:0;padding:0}
#cpCardBox .mons .mon{width:28.6%;height:100%;margin:0;padding:0;background:none;border:0;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:none}#cpCardBox .mons .mon canvas{width:100%;height:auto;max-height:78%}#cpCardBox .mons .mon div{font:900 2.5cqw system-ui;color:#fff;text-shadow:0 1px 0 #000;white-space:nowrap;max-width:96%;overflow:hidden;text-overflow:ellipsis}
#cpCardBox .ppE{position:absolute!important;left:9.21%;top:38.62%;width:31.68%;height:5.77%;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding-left:4%;font:900 4.4cqw system-ui;color:#fff;text-shadow:0 2px 0 #000}
#cpCardBox .ppP{position:absolute!important;left:59.7%;top:38.62%;width:31.68%;height:5.77%;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;padding-right:4%;font:900 4.4cqw system-ui;text-shadow:0 2px 0 #000,0 0 6px #000}
#cpCardBox .ppE small,#cpCardBox .ppP small{font:900 2.2cqw system-ui;color:#fff;opacity:.85;letter-spacing:1px}
#cpCardBox .grit{position:absolute!important;left:14.16%;top:35.21%;width:71.78%;height:3.15%;margin:0;padding:0 2%;display:flex;align-items:center;justify-content:center;font-size:2.5cqw;border-radius:2cqw}
#cpCardBox .ppRT{position:absolute!important;left:36.93%;top:49.64%;width:25.74%;height:1.97%;text-align:center;font:900 2.4cqw system-ui;color:#ffe27a;letter-spacing:1px;text-shadow:0 1px 0 #000;z-index:1;pointer-events:none;display:none}
#cpCardBox .ppR0{position:absolute!important;left:19.6%;top:52.79%;width:13.47%;height:8.79%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2%}
#cpCardBox .ppR1{position:absolute!important;left:35.45%;top:52.79%;width:13.47%;height:8.79%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2%}
#cpCardBox .ppR2{position:absolute!important;left:51.29%;top:52.79%;width:13.47%;height:8.79%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2%}
#cpCardBox .ppR3{position:absolute!important;left:66.93%;top:52.79%;width:13.47%;height:8.79%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2%}
#cpCardBox .ppR span{line-height:1}#cpCardBox .ppR span img{max-height:7cqw}#cpCardBox .ppR b{font:900 3cqw system-ui;color:#fff;text-shadow:0 1px 0 #000,0 0 4px #000;white-space:nowrap}
#cpCardBox .ppG{position:absolute!important;left:12.18%;top:62.1%;width:75.74%;height:2.95%;display:flex;justify-content:center;align-items:center;gap:1.4cqw;flex-wrap:wrap;font:900 2.2cqw system-ui;text-shadow:0 1px 0 #000}
#cpCardBox .ppS0{position:absolute!important;left:13.07%;top:70.23%;width:12.48%;height:8.2%;display:flex;align-items:center;justify-content:center;cursor:pointer}
#cpCardBox .ppS1{position:absolute!important;left:28.61%;top:70.23%;width:12.48%;height:8.2%;display:flex;align-items:center;justify-content:center;cursor:pointer}
#cpCardBox .ppS2{position:absolute!important;left:43.96%;top:70.23%;width:12.48%;height:8.2%;display:flex;align-items:center;justify-content:center;cursor:pointer}
#cpCardBox .ppS3{position:absolute!important;left:59.31%;top:70.23%;width:12.48%;height:8.2%;display:flex;align-items:center;justify-content:center;cursor:pointer}
#cpCardBox .ppS4{position:absolute!important;left:74.65%;top:70.23%;width:12.48%;height:8.2%;display:flex;align-items:center;justify-content:center;cursor:pointer}
#cpCardBox .ppS img{width:88%;height:88%;object-fit:cover;border-radius:1.4cqw;background:#000}#cpCardBox .ppS i{font:900 7cqw system-ui;color:#ffd54a55;font-style:normal}
#cpCardBox .ppEd{position:absolute!important;left:33%;top:65.4%;width:34%;height:4.1%;border:0;border-radius:2cqw;background:linear-gradient(#64b5f6,#1565c0);box-shadow:0 0 0 .4cqw #0a2a52,0 .6cqw 0 #0a2a52;color:#fff;font:900 2.9cqw system-ui;letter-spacing:.3px;text-shadow:0 1px 0 #000}
#cpCardBox .ppB{position:absolute!important;left:4.46%;top:83.61%;width:21.78%;height:11.15%;background:none;border:0;border-radius:3cqw}
#cpCardBox .ppF{position:absolute!important;left:29.01%;top:83.87%;width:65.94%;height:10.75%;background:none;border:0;border-radius:3cqw;padding-left:20%;font:900 7.5cqw system-ui;font-style:italic;color:#3a1c00;text-shadow:0 2px 0 #fff8;letter-spacing:1px}
#cpCardBox .ppB:active,#cpCardBox .ppF:active{background:#0003}
#gSum .gTop{position:sticky!important;top:0;display:block!important;padding:0!important;aspect-ratio:900/365;width:100%;max-width:560px;margin:0 auto;background:url(img/ui3/gsum_h.webp) 0 0/100% 100% no-repeat!important;border:0!important;box-shadow:none!important;filter:drop-shadow(0 6px 10px #000c)}
#gSum .gTop .gTitle{display:none}
#gSum .gTop [data-gs=back]{position:absolute!important;left:2.93%;top:18.23%;width:10.27%;height:24.05%;background:none!important;border:0!important;box-shadow:none!important;margin:0!important;padding:0!important;border-radius:50%!important;color:transparent!important;font-size:1px!important;width:auto!important;height:auto!important}
#gSum #gsTk{position:absolute!important;left:78.43%;top:23.29%;width:19.16%;height:13.42%;background:none!important;border:0!important;box-shadow:none!important;margin:0!important;padding:0!important;border-radius:30px!important;display:flex;align-items:center;justify-content:flex-end;gap:4px;padding-right:6%!important;font:900 min(4.2vw,19px) system-ui!important;color:#fff!important;text-shadow:0 1px 0 #000}
#gSum #gsTk img{position:absolute;left:1%;top:-6%;height:112%!important;width:auto;filter:drop-shadow(0 2px 2px #000)}
#gSum .gsSub{position:absolute!important;left:31.07%;top:38.48%;width:37.49%;height:12.15%;display:flex;white-space:nowrap;overflow:hidden;align-items:center;justify-content:center;font:900 min(2.7vw,12px) system-ui;color:#9fd3ff;letter-spacing:.5px;text-shadow:0 1px 0 #000}
/* v16-53 GEAR SUMMON on Marius' background */
#gSum.open{position:fixed!important;z-index:8!important;display:flex!important;align-items:center;justify-content:center;background:rgba(5,8,12,.92)!important;padding:0!important;overflow:hidden!important}
#gsBox{position:relative;--u:.35px;overflow:hidden;border-radius:calc(var(--u)*18);background:#0a1322}#gsBox>*{position:absolute}
.gsHd,.gsBg{pointer-events:none;display:block}.gsHd{filter:drop-shadow(0 calc(var(--u)*6) calc(var(--u)*8) #000c)}
.gsL{display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*8);color:#fff;font:900 italic calc(var(--u)*32) system-ui;text-shadow:0 calc(var(--u)*3) 0 #000a,0 0 calc(var(--u)*8) #000;white-space:nowrap}
.gsL img{height:1.25em!important;width:auto;vertical-align:middle}
.gsTkN{justify-content:flex-end;padding-right:calc(var(--u)*14);box-sizing:border-box;font-size:calc(var(--u)*30)}
.gsDm{background:url(img/ui5/coin.webp) 0 0/100% 100% no-repeat;font-size:calc(var(--u)*28);font-style:normal}
.gsRt{font-size:calc(var(--u)*26);font-style:normal}
.gsPl{font-size:calc(var(--u)*28)}.gi .fc{position:relative}.gStr{position:absolute;left:0;right:0;top:3%;z-index:3;text-align:center;font:900 13px/1 system-ui;color:#ffd54a;letter-spacing:-1px;text-shadow:0 1px 0 #000,0 0 4px #000}.gi.asc .fc{filter:drop-shadow(0 0 5px #2ef3ffaa)}.iFood{display:flex;align-items:center;gap:10px;margin:6px 4px;font:800 13px/1.35 system-ui;color:#cfe0f2}.iFood .gi{width:58px;flex:none}.iFood small{color:#8ea3b8}.cpGo.asc{background:linear-gradient(#5ff7ff,#0a8c9a);color:#012}.gsTab{gap:calc(var(--u)*8);font-size:calc(var(--u)*32)}.gsTab img{height:1.3em;width:auto}.gsTab.on{color:#ffd54a;text-shadow:0 2px 0 #000,0 0 calc(var(--u)*14) #ffb300}.gsTab:not(.on){opacity:.8}
.gsBig{flex-direction:column;gap:0;font-size:calc(var(--u)*42)}.gsBig span{display:flex;align-items:center;gap:calc(var(--u)*8);font-size:.72em;padding:calc(var(--u)*2) calc(var(--u)*22);border-radius:calc(var(--u)*30);background:#0008;margin-top:calc(var(--u)*6)}
.gsBig.gold{color:#3a1d00;text-shadow:0 calc(var(--u)*2) 0 #fff7}.gsBig.gold span{color:#fff;text-shadow:0 2px 0 #000}.gsBig.dis{filter:grayscale(1) brightness(.7)}
.gsRib{transform:rotate(43deg);font-size:calc(var(--u)*24);pointer-events:none}
.gsFill{border-image:url(img/ui5/fill_g.webp) 0 40 fill/0 calc(var(--u)*27) stretch;pointer-events:none}
.gsCol{flex-direction:column;gap:calc(var(--u)*4);color:#3a1d00;text-shadow:0 calc(var(--u)*2) 0 #fff7;font-size:calc(var(--u)*44)}.gsCol small{color:#5a3300;font-size:.55em;font-style:normal;letter-spacing:calc(var(--u)*1.5)}
/* v16-53 SET PANEL kit (Marius' pictures img/ui5/slot0/1, srow0/1) */
.setPc>div{background:url(img/ui5/slot0.webp) center/100% 100% no-repeat!important;box-shadow:none!important;border-radius:0!important;padding:3px 2px 4px!important}
.setPc>div.on{background-image:url(img/ui5/slot1.webp)!important}
.setPc img{width:78%!important;margin:9% auto 0}
.setBl{gap:2px!important}
.setBl>div{position:relative;height:46px;box-sizing:border-box;padding:0!important;background:none!important;box-shadow:none!important;border-radius:0!important;border-style:solid;border-color:transparent;border-width:0 51px 0 60px;border-image:url(img/ui5/srow0.webp) 0 210 0 250 fill/0 51px 0 60px stretch;color:#8fa0b5!important}
.setBl>div.on{border-width:0 46px 0 57px;border-image:url(img/ui5/srow1.webp) 0 210 0 260 fill/0 46px 0 57px stretch;color:#fff!important;text-shadow:0 1px 2px #000}
.setBl>div b{position:absolute;left:-43px;top:50%;margin-top:-14px;width:28px!important;height:28px!important;background:none!important;color:#cfd8e3!important;font:900 15px system-ui!important;text-shadow:0 1px 2px #000}
.setBl>div.on b{left:-40px;color:#3a1d00!important;text-shadow:0 1px 0 #fff8}
.setBl>div i{display:none}.setBl>div span{padding:0 4px;font-size:11.5px;line-height:1.15}
/* v16-53 HERO COLLECTION: rainbow fill, check / lock on the chests, grade rows from the INFO WINDOW kit */
.gcBar2 i{background:none!important;opacity:1!important;border-image:url(img/ui5/fill_r.webp) 0 38 fill/0 1.6cqw stretch;min-width:3.2cqw}
.gcCh .gcOk{position:absolute;right:-3%;bottom:-8%;width:44%;height:auto;filter:drop-shadow(0 .4cqw .6cqw #000)}.gcCh:not(.ok) .gcOk{width:34%;opacity:.95}
.gcW{--k:calc(min(100vw - 20px,540px)/948)}
.gcRow{background:linear-gradient(180deg,var(--c3),#0b142400 60%)!important;box-shadow:none!important;padding:0 4px 8px!important}
.gcRow .gcHd{grid-column:1/-1;margin:0 0 6px}.gcRow .gcHd .gk{display:flex;align-items:center;gap:4px}.gcRow .gcHd .gk img{height:1.5em}
.gcRow.ok .gk::after{content:''!important}
/* v16-51 sets + hero collection */
.fc .setB{position:absolute;left:3%;top:3%;width:34%;height:auto;filter:drop-shadow(0 1px 2px #000);z-index:2;pointer-events:none}
.itSet{display:block;color:#ffd54a!important;font-weight:900;letter-spacing:.3px;font-size:8.5px!important;line-height:1.1;margin-top:1px;white-space:nowrap}
.setPc{display:grid;grid-template-columns:repeat(6,1fr);gap:3px;margin:5px 0 3px}.setPc>div{display:flex;flex-direction:column;align-items:center;border-radius:9px;background:#0b1424;box-shadow:inset 0 0 0 1px #34465f;padding:2px 1px 3px}.setPc img{width:100%;aspect-ratio:1;object-fit:contain;filter:grayscale(1) brightness(.45)}.setPc small{font:800 7.5px/1.1 system-ui;color:#6f7f93;text-align:center;min-height:2.2em}.setPc>div.on{background:linear-gradient(#3a2a05,#122033);box-shadow:inset 0 0 0 1px #ffb300}.setPc>div.on img{filter:drop-shadow(0 0 4px #ffb30088)}.setPc>div.on small{color:#ffe9a8}
.setBl{display:flex;flex-direction:column;gap:3px;margin:4px 0 2px}
.setBl>div{display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:9px;background:#0b1424;box-shadow:inset 0 0 0 1px #34465f;color:#7f8fa3;font:800 11.5px system-ui}
.setBl>div b{flex:none;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#1c2738;color:#9fb0c0;font-size:11px}
.setBl>div span{flex:1}.setBl>div i{font-style:normal}
.setBl>div.on{background:linear-gradient(90deg,#3a2a05,#122033);box-shadow:inset 0 0 0 1px #ffb300;color:#ffe9a8}.setBl>div.on b{background:linear-gradient(#ffe27a,#e08a00);color:#2a1000}
.gSumRow2{display:flex;padding:7px 10px 0}
.gsGo.col{flex:1;margin:0!important;height:auto!important;min-height:44px;display:flex!important;align-items:center;justify-content:center;gap:8px;background:linear-gradient(#a45cff,#5b1fb8 55%,#33106e)!important;box-shadow:0 0 0 2px #ffc23a,0 4px 0 #1a0638,0 0 16px #a45cff66!important;font-size:15px!important}
.gsGo.col img{height:34px;width:auto;margin:-6px 0}.gsGo.col span{color:#ffe27a!important;font-size:12px!important}
#gColl>.skBg{background:radial-gradient(ellipse at 50% 0,#1d3566,#070c18 70%)!important;filter:none}
.gcW{position:relative;max-width:560px;margin:0 auto;padding:0 10px 30px}
.gcPic{position:relative;width:min(100%,calc((100vh - 10px)*.6667));margin:0 auto;container-type:inline-size}
.gcPic>*{position:absolute}.gcPic>.gcBg{position:relative;display:block;width:100%;height:auto;pointer-events:none}
.gcL{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff;font:900 4.4cqw/1.05 system-ui;text-shadow:0 .3cqw 0 #000,0 0 1cqw #000;pointer-events:none}
.gcN2{font-size:3.6cqw;white-space:nowrap}
.gcBar2{border-radius:3cqw;overflow:hidden;pointer-events:none}.gcBar2 i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#9e9e9e,#43c463,#29b6f6,#b04dff,#ffc400,#ff1744);opacity:.85}
.gcBar2 span{position:relative;display:flex;height:100%;align-items:center;justify-content:center;color:#fff;font:900 2.6cqw system-ui;letter-spacing:.15cqw;text-shadow:0 .25cqw 0 #000,0 0 .8cqw #000;white-space:nowrap}
.gcK{font-size:3.6cqw;color:#cfd8dc;white-space:nowrap}.gcK.ok{color:#7CFC9A}
.gcB b{font-size:3.3cqw;color:#ffe9a8;white-space:nowrap}.gcB small{font:900 1.9cqw system-ui;color:#8fa3b8;letter-spacing:.1cqw;margin-top:.5cqw}.gcB.ok b{color:#7CFC9A}.gcB.ok small{color:#7CFC9A}
.gcCh{pointer-events:none;border-radius:2cqw}.gcCh:not(.ok){background:radial-gradient(#0000 40%,#0006 75%)}
.gcCh.ok{box-shadow:0 0 3cqw #7CFC9A88;animation:gcGl 1.6s ease-in-out infinite alternate}@keyframes gcGl{to{box-shadow:0 0 1cqw #7CFC9A44}}
.gcCh i{position:absolute;right:-1cqw;top:-1cqw;width:5cqw;height:5cqw;border-radius:50%;background:#2e7d32;color:#fff;font:900 3.4cqw/5cqw system-ui;text-align:center;font-style:normal;box-shadow:0 0 0 .4cqw #fff}
.gcGo{font-size:6.4cqw;color:#3a1d00;text-shadow:0 .3cqw 0 #fff8;letter-spacing:.3cqw;pointer-events:auto;cursor:pointer}
.gcA{cursor:pointer}

.gcTop{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:8px;padding:10px 0 8px;background:linear-gradient(#070c18 75%,#070c1800)}
.gcTop .cpB{flex:none}
.gcT{flex:1;text-align:center;font:900 22px system-ui;letter-spacing:1.5px;color:#ffe27a;text-shadow:0 2px 0 #6a3a00,0 0 10px #ffb30088;font-style:italic}
.gcN{flex:none;min-width:64px;padding:4px 10px;border-radius:10px;background:#0b1424;box-shadow:inset 0 0 0 2px #e0a82e;font:900 15px system-ui;color:#fff;text-align:center}
.gcSub{text-align:center;font:900 11.5px system-ui;letter-spacing:1.5px;color:#9fd3ff;margin:4px 0 6px}
.gcBar{height:14px;border-radius:8px;background:#0b1424;box-shadow:inset 0 0 0 2px #e0a82e;overflow:hidden;margin:0 6px 12px}.gcBar i{display:block;height:100%;background:linear-gradient(90deg,#9e9e9e,#43c463,#29b6f6,#b04dff,#ffc400,#ff1744)}
.gcRow{position:relative;display:grid;grid-template-columns:1fr auto;align-items:center;gap:4px 8px;margin:0 0 9px;padding:9px 12px;border-radius:14px;background:linear-gradient(90deg,var(--c3),#0b1424 70%);box-shadow:inset 0 0 0 2px var(--c),0 3px 0 #000a}
.gcRow .gn{font:900 15px system-ui;color:var(--c);text-shadow:0 1px 0 #000;letter-spacing:.5px}
.gcRow .gk{font:900 14px system-ui;color:#fff;text-align:right}
.gcRow .gb{grid-column:1/-1;font:800 12px system-ui;color:#c9d6e2}.gcRow .gb b{color:#7CFC9A}
.gcRow.ok{box-shadow:inset 0 0 0 2px var(--c),0 0 14px var(--c),0 3px 0 #000a}.gcRow.ok .gk::after{content:' ✓';color:#7CFC9A}
.gcHs{grid-column:1/-1;display:flex;gap:5px;flex-wrap:wrap}
.gcHs img{width:40px;height:40px;border-radius:8px;border:2px solid var(--c);object-fit:cover;background:#000}.gcHs img.no{filter:grayscale(1) brightness(.25);border-color:#333}
.gcTot{margin:12px 4px 0;padding:10px 12px;border-radius:12px;background:#0b1424;box-shadow:inset 0 0 0 2px #ffb300;font:800 12.5px system-ui;color:#ffe9a8;text-align:center}
.gcTot b{color:#7CFC9A}
/*UI3MORE*/
#cpHM{position:absolute;left:50%;top:100%;transform:translate(-50%,4px);z-index:4;display:flex;gap:2px;align-items:center;padding:7px 13px 8px;border:0;background:url(img/shop/hm_box.webp) center/100% 100% no-repeat;filter:drop-shadow(0 3px 4px #000a)}
#cpHM img{display:block;height:34px;width:auto}
#cpHM img.off{filter:grayscale(.85) brightness(.62)}
#cp.hm #cpMap{background:#2a1010!important}#cp.hm #cpPath{filter:saturate(.75) hue-rotate(-18deg) brightness(.85)}
#cp.hm #cpPath .node{filter:hue-rotate(18deg) brightness(1.18) saturate(1.3)}

/* v16-93 (Marius' pictures, PROMPTS_UI8.md): battle windows = img/ui8/win.webp (9-slice), buttons = img/ui8/btn_*_s.webp + gear ornaments, stars = img/ui8/star_*.webp */
.cpBox:not(.winSk):not(.itPop):not(.prepSk):not(.rsSk):not(.wbSk){--k:calc(min(92vw,420px)/700);background:none!important;box-shadow:none!important;border-radius:0!important;border-style:solid!important;border-color:transparent!important;border-width:calc(var(--k)*138) calc(var(--k)*48) calc(var(--k)*70)!important;border-image:url(img/ui8/win.webp) 160 115 120 fill/calc(var(--k)*160) calc(var(--k)*115) calc(var(--k)*120) stretch!important;padding:4px 6px!important;filter:drop-shadow(0 6px 18px #000c)}
.cpGo{--bh:52px;position:relative;background:none!important;box-shadow:none!important;border-radius:0!important;border-style:solid!important;border-color:transparent!important;border-width:0!important;border-image:url(img/ui8/btn_gold_s.webp) 0 100 fill/0 calc(var(--bh)*1.08) stretch!important;color:#2a1600!important;text-shadow:0 1px 0 #fff6}
.cpGo::before,.cpGo::after{content:'';position:absolute;left:50%;width:calc(var(--bh)*1.6);height:calc(var(--bh)*.26);transform:translateX(-50%);background:url(img/ui8/btn_ot.webp) center/100% 100% no-repeat;pointer-events:none}
.cpRow .cpGo::before,.cpRow .cpGo::after,#gBtns .cpGo::before,#gBtns .cpGo::after{display:none}.cpGo::before{top:0}.cpGo::after{bottom:0;background-image:url(img/ui8/btn_ob.webp)}
.cpGo.alt{border-image-source:url(img/ui8/btn_blue_s.webp)!important;color:#fff!important;text-shadow:0 2px 0 #0a1f4d!important}
.cpGo.red{border-image-source:url(img/ui8/btn_red_s.webp)!important;color:#fff!important;text-shadow:0 2px 0 #4a0000!important}
.cpGo.asc{border-image-source:url(img/ui8/btn_blue_s.webp)!important;color:#fff!important;filter:hue-rotate(-25deg) saturate(1.3) brightness(1.1)}
#gBtns .cpGo.tm{border-image-source:url(img/ui8/btn_green_s.webp)!important;background:none!important;color:#062a0a!important}
.cpGo.dis,#gBtns .cpGo.tmo{border-image-source:url(img/ui8/btn_grey_s.webp)!important;background:none!important;color:#cfd8dc!important;text-shadow:0 2px 0 #000!important;filter:none!important}
#gBtns .cpGo{--bh:52px}
.gStr{display:flex;justify-content:center;top:1%!important;gap:0}.gStr img{width:17%;height:auto;margin:0 -1.5%;filter:drop-shadow(0 1px 1px #000)}
.sti{height:1.15em;width:auto;vertical-align:-.22em;margin:0 -.04em}
.gh .lv{position:absolute;right:2px;top:2px;font:900 9px system-ui;color:#e6d2ff;background:#2a0f45e0;border-radius:5px;padding:1px 3px;font-style:normal;z-index:2}.gh .lv.up{background:#1b5e20f0;color:#b9ffc0;box-shadow:0 0 6px #7CFC9A}
/* v16-101: ✕ that stays at the top of every battle window / team screen (no scrolling down to close) */
.stX{position:sticky;top:0;float:right;z-index:6;width:38px;height:38px;margin:-6px -6px 4px 8px;border:2px solid #ffd54a;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff7a6a,#c62828 60%,#6d0f0f);color:#fff;font:900 18px/1 system-ui;box-shadow:0 3px 0 #3a0606,0 0 10px #000;padding:0;cursor:pointer}
#cpTeamBox .tmRow{position:sticky;bottom:-2px;z-index:5;margin:10px -6px -4px;padding:8px 6px 6px;background:linear-gradient(#0a0e1700,#0a0e17 30%)}
#gTeam .tEd{background:linear-gradient(#7dff8a,#2e9d3a)!important;color:#062a0a!important;margin-right:6px}
.cpGo.alt{background:none!important;box-shadow:none!important}
#gBtns .cpGo{font-size:14.5px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-style:italic}#gHName .gLvC{display:block;margin:5px auto 0;pointer-events:auto;border:2px solid #ffd54a;border-radius:12px;padding:5px 14px;font:900 13px system-ui;color:#fff;background:linear-gradient(#9c4dff,#5a1aa8);box-shadow:0 3px 0 #2a0a55,0 0 10px #000}#gHName .gLvC.rdy{background:linear-gradient(#5ee06c,#1f8a2c);box-shadow:0 3px 0 #0b3a12,0 0 12px #7CFC9A}#gHName .gLvC .tki{height:1.3em;vertical-align:-.35em}
#gBtns .gLvB{flex-basis:100%!important;font-size:17px!important}#gBtns .gLvB.rdy{filter:drop-shadow(0 0 8px #7CFC9A)}
#gHero #gBtns{padding:10px 10px 6px!important}
.lvW{text-align:center}.lvW .lvN{font:900 26px system-ui;color:#e2c6ff;text-shadow:0 2px 0 #000}.lvW .lvN small{font-size:14px;color:#a993c4}
.lvBar{height:10px;border-radius:6px;background:#1a1028;box-shadow:inset 0 0 0 1px #6a3fa0;margin:6px 8px;overflow:hidden}.lvBar i{display:block;height:100%;background:linear-gradient(90deg,#9d4edd,#e0aaff)}
.lvE{font:800 14px system-ui;color:#fff;margin:4px 0}.lvE .tki{height:1.35em;vertical-align:-.35em}
.lvG{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin:8px 0}.lvG button{padding:9px 2px!important;font-size:13px!important}.lvG button small{display:block;font-size:10px;opacity:.85}
.lvA{margin:8px 0;padding:8px;border-radius:10px;background:linear-gradient(#3a1d5c,#1b0e2c);box-shadow:inset 0 0 0 1.5px #c77dff;font:700 12px system-ui;color:#eadcff}.lvA b{color:#ffd54a}
/* v16-93 GEAR GUIDE (Marius: "o mică pagină cu poze ca să se vadă ușor cum ai echipament după Mythic") */
.gGd{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;margin-left:8px;border-radius:50%;border:2px solid #2ef3ff;background:#04303a;color:#2ef3ff;font:900 13px/1 system-ui;vertical-align:middle;box-shadow:0 0 8px #2ef3ff88;animation:gGdP 1.6s ease-in-out infinite}@keyframes gGdP{50%{box-shadow:0 0 2px #2ef3ff44}}
.gdW h2{margin:0}.gdW .sub{margin-bottom:6px}
.gdS{margin:10px 0 4px;padding:8px 8px 10px;border-radius:12px;background:linear-gradient(#0f1d33cc,#08101dcc);box-shadow:inset 0 0 0 1px #ffffff14}
.gdH{display:flex;align-items:center;gap:6px;font:900 13px/1.1 system-ui;color:#ffd54a;letter-spacing:1px;text-shadow:0 1px 0 #000;margin-bottom:7px}.gdH i{font-style:normal;display:inline-flex;width:22px;height:22px;border-radius:50%;align-items:center;justify-content:center;background:#ffd54a;color:#2a1600;flex:none}
.gdG{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 3%;align-items:end}.gdG>div{width:22%}.gdG .gi{width:100%}.gdG b{display:block;font:900 9.5px/1.1 system-ui;text-align:center;margin-top:2px;text-shadow:0 1px 0 #000;white-space:nowrap;overflow:hidden}
.gdG .gi.asc{animation:gdAsc 1.4s ease-in-out infinite alternate}@keyframes gdAsc{to{filter:drop-shadow(0 0 7px #2ef3ff)}}
.gdEq{display:flex;align-items:center;justify-content:center;gap:4px}.gdEq .gi{width:27%;flex:none}.gdEq em{font:900 26px/1 system-ui;color:#fff;font-style:normal;text-shadow:0 2px 0 #000;flex:none}.gdEq em.to{color:#2ef3ff}
.ascI{height:1.45em;width:auto;vertical-align:-.4em;filter:drop-shadow(0 1px 2px #000)}
.gdL{display:grid;grid-template-columns:auto 1fr auto;gap:3px 6px;padding:0 2px;align-items:center;font:800 12px system-ui;color:#cfe0f2;margin-top:6px}.gdL span{white-space:nowrap}.gdL b{color:#7CFC9A}.gdL .sti{height:1.25em}
.gdC{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-top:7px}.gdC span{padding:4px 8px;border-radius:999px;background:#04303a;box-shadow:inset 0 0 0 1px #2ef3ff88;font:800 11px system-ui;color:#c9fbff}.gdC span b{color:#fff}
.gdT{font:700 12px/1.4 system-ui;color:#cfe0f2;text-align:center;margin-top:6px}.gdT b{color:#ffd54a}
`;document.head.appendChild(css3);

const GTKI0='<img src="img/gticket.webp" style="height:1.2em;vertical-align:-.28em">';
const root=document.createElement('div');root.id='cp';
root.innerHTML=`
<div id="cpMap"><div id="cpTop"><img id="cpLogo" src="img/ui/t_logo.webp" alt=""><div class="tr1"><button class="cpB" id="cpBack">↩</button><div id="cpTitle"><b id="cpT1"></b><small id="cpT2"></small></div><button class="cpB gb" id="cpGearB"></button><button class="cpB gb gsb" id="cpGSB"></button><div id="cpTk">🎟 0</div></div>
<div id="cpChap"><button class="chA" id="cpPrev">‹</button><div id="cpChN"></div><button class="chA" id="cpNext">›</button></div></div>
<div id="cpPath"><canvas id="cpPathCv"></canvas></div></div>
<div id="cpCard"><div class="cpBox" id="cpCardBox"></div></div>
<div id="cpTeam"><div class="cpBox" id="cpTeamBox"></div></div>
<div id="bt"><canvas id="btcv"></canvas></div>
<div id="cpRes"><div class="cpBox" id="cpResBox"></div></div>
<div id="cpGear" class="skP sk-heroes"><div class="skBg"></div>
<div class="skH"><img class="hi" src="img/ui2/heroes_h.webp" alt=""><canvas id="gPedCv"></canvas><div id="gPeds"></div><div class="gTop2"><button class="cpB" data-g="back">↩</button><img class="gTi" src="img/ui/t_heroes.webp" alt="HEROES"><div id="gMoney"></div></div></div>
<div class="skB" id="gBody"><div class="gSumRow"><button class="gsGo hs" id="gHSB" data-g="hsum"></button><button class="gsGo" id="gGSB"></button><button class="gsGo bag" data-g="bag"><img src="img/ui2/i_scrap.webp" alt=""><b>BAG</b><span id="gBagS"></span></button></div><div class="gSumRow2"><button class="gsGo col" data-g="coll"><img src="img/ui3/g_book.webp" alt=""><b>HERO COLLECTION</b><span id="gColS"></span></button></div>
<div id="gTeam"></div><div class="gSecH">ALL HEROES <span id="gCnt"></span><span class="gSort" id="gSort"></span></div><div id="gHeroes"></div></div>
<div id="gHero" class="gPg"><div class="skBg" style="background-image:url(img/ui2/equip_f.webp)"></div><div class="eqW"><img class="hi" src="img/ui2/equip_f.webp" alt=""><canvas id="gHeroCv"></canvas><div id="gHName"></div><div id="gMain"></div><div id="gStats"></div><button class="cpB gBk" data-g="hback">↩</button></div><div id="gBtns"></div><div id="gInfo"></div></div>
<div id="gBag" class="skP sk-bag"><div class="skBg"></div><div class="skH"><img class="hi" src="img/ui2/bag_h.webp" alt=""><div id="gFil"></div><button class="cpB gBk" data-g="bback">↩</button><div id="gBagFor"></div></div><div class="skB" id="gInv"></div><div class="gBagBar"><span id="gBagN"></span><button data-g="salvP"><img src="img/ui2/i_scrap.webp" alt="">SALVAGE</button></div></div>
<div id="gSalv" class="gPg"><div class="skBg" style="background-image:url(img/ui2/salvage_f.webp)"></div><div class="eqW sv"><img class="hi" src="img/ui2/salvage_f.webp" alt=""><button class="cpB gBk" data-g="sback">↩</button><div id="svSlots"></div><div id="svInfo"></div><button id="svGo" data-g="salvGo"></button></div><div id="svHelp"></div></div>
<div id="gColl" class="gPg"><div class="skBg"></div><div class="gcW" id="gcW"></div></div>
<div id="gSum"><div id="gsBox"></div></div>
<div id="tw"><div id="twBox"></div></div>
<div id="cpPop"><div class="cpBox" id="cpPopBox"></div></div>`;
document.body.appendChild(root);

// ---------------------------------------------------------------- data
// roles come from the mechanic's specialization
const ROLE={
 engine:{n:'Bruiser',ic:'⚙️',hp:1450,atk:72,def:30,mv:78,rng:34,as:1.15,crit:.08,sk:'PISTON SLAM',skd:'Leaps into the biggest group: 220% damage, stun 1.2s, taunts enemies and gains a shield.'},
 tuning:{n:'Racer',ic:'🏁',hp:930,atk:96,def:14,mv:118,rng:30,as:.72,crit:.25,sk:'NITRO DASH',skd:'Dashes through every enemy in its lane with blue fire: 260% damage, always critical.'},
 inspect:{n:'Scanner',ic:'🔍',hp:760,atk:84,def:10,mv:80,rng:225,as:1.2,crit:.1,sk:'FULL DIAGNOSTIC',skd:'A scan wave marks all enemies: 120% damage and they take +35% damage for 7s.'},
 service:{n:'Medic',ic:'🔧',hp:820,atk:56,def:12,mv:80,rng:185,as:1.3,crit:.06,sk:'OIL CHANGE',skd:'Heals all mechanics for 32% of their HP + 12% more over 4s. Every 3rd hit heals the weakest ally.'},
 paint:{n:'Sprayer',ic:'🎨',hp:790,atk:68,def:11,mv:80,rng:175,as:1.0,crit:.1,sk:'COLOR STORM',skd:'Paint bomb on the biggest group: 180% damage, 50% slow and burning paint for 4s.'},
 elec:{n:'Shocker',ic:'⚡',hp:730,atk:90,def:10,mv:80,rng:205,as:1.25,crit:.1,sk:'OVERVOLT',skd:'Chain lightning jumps 6 times: 200% damage and stun 1.5s.'},
 all:{n:'Legend',ic:'🌟',hp:1350,atk:112,def:26,mv:92,rng:42,as:.9,crit:.15,sk:'TORQUE STORM',skd:'Giant gears rain on every enemy: 300% damage. All mechanics +30% attack for 6s.'},
 crew:{n:'Crew',ic:'🔩',hp:700,atk:50,def:8,mv:84,rng:30,as:1.1,crit:.06,sk:'WRENCH THROW',skd:'Throws a spinning wrench: 250% damage.'}};
const GMUL=[1,1.32,1.75,2.3,3.4,4.4]; // v16-40: Legendary 3.0→3.4, Mythic 3.9→4.4 (a new Legendary now beats an Uncommon +50)
// v16-14: unique skills (each Legendary / Mythic has its own skill; the others still use their class skill)
const HSK={
 m4_0:{sk:'IRON QUAKE',skd:'Smashes the ground: a wall of rocks rolls through ALL enemies – 230% damage and stun 1.6s. Gains a 30% shield and taunts enemies.'},
 m4_1:{sk:'MIRACLE SHIFT',skd:'Holy light heals all mechanics for 35% HP (+15% over 4s) and REVIVES one K.O. mechanic with 40% HP (once per battle). Team: −20% damage taken for 6s.'},
 m4_2:{sk:'DIAMOND VORTEX',skd:'A paint-and-diamond tornado on the biggest group: 210% damage, then crystal freeze – frozen 2.2s and they take +35% damage for 4s.'},
 m4_3:{sk:'THUNDERSTORM',skd:'Storm cloud over the enemies: 8 lightning strikes of 150% damage, each stuns 1s. Team: +25% attack speed for 6s.'},
 m4_4:{sk:'TIME WARP',skd:'The All-Seeing Eye bends time: all enemies slowed 50% and marked (+35% damage) for 6s. Team: +40% attack speed for 6s.'},
 m4_5:{sk:'INFERNO DASH',skd:'Rocket-kick dash through every enemy in its lane: 280% damage, always critical, and they burn for 4s.'},
 m5_0:{sk:'GEAR APOCALYPSE',skd:'Flaming gears crash on every enemy: 320% damage + a giant gear on the biggest group (150%). Team: +30% attack and −20% damage taken for 8s.'},
 m5_1:{sk:'OVERDRIVE',skd:'Full throttle: blasts through ALL enemies – 300% damage, always critical, they burn for 4s. Team: +30% attack speed and +15% crit for 6s.'}};
// v16-17: unique skills for Common → Epic, made from what each hero does in his sprite sheet. p = numbers used by the class skill code
const SKP={
 // Bruisers (jump + ground slam)
 m0_2:{sk:'WRENCH CRUSHER',skd:'Jumps and smashes the giant wrench down: 260% damage in a small area, stun 1.4s. Gains a 25% shield and taunts.',p:{mult:2.6,rad:80,stun:1.4,col:'#ffab00'}},
 m0_3:{sk:'OIL SLICK SMASH',skd:'Hammer jump into the biggest group: 200% damage, stun 1s and spilled oil slows them 50% for 4s. Shield + taunt.',p:{mult:2,stun:1,slow:4,col:'#a1887f'}},
 m1_0:{sk:'GEAR BREAKER',skd:'Leaps with her wrench and cracks the ground: 230% damage, stun 1.2s and knocks enemies far back. Shield + taunt.',p:{mult:2.3,push:60,col:'#b2ff59'}},
 m1_1:{sk:'PISTON FURY',skd:'Dumbbell jump slam: 220% damage, stun 1.2s. Then he goes wild: +30% attack and +30% attack speed for 6s.',p:{mult:2.2,rage:6,col:'#76ff03'}},
 m2_0:{sk:'DIESEL CLOUD',skd:'Belly-flop into the enemies: 230% damage, stun 1.2s. Black diesel smoke weakens them: they deal −30% damage for 5s.',p:{mult:2.3,weak:5,col:'#90a4ae'}},
 m2_1:{sk:'CLUTCH SLAM',skd:'Smashes the clutch disc down: 240% damage and a long stun of 2s. Gains a big 40% shield and taunts.',p:{mult:2.4,stun:2,shield:.4,col:'#40c4ff'}},
 m3_0:{sk:'ENGINE DROP',skd:'Lifts a whole engine block and drops it: 280% damage in a big area, toxic fumes burn 4s and weaken enemies (−30% damage).',p:{mult:2.8,rad:110,burn:1,weak:4,col:'#d05cff'}},
 // Racers (dash)
 m0_9:{sk:'REV & RETURN',skd:'Dashes through his lane (220%, always critical) and hits everyone AGAIN on the way back (90%).',p:{mult:2.2,back:.9,col:'#40c4ff'}},
 m1_8:{sk:'GRINDER RUSH',skd:'Dashes with the angle grinder: 240% damage, always critical. Sparks mark enemies: +35% damage taken for 5s.',p:{mult:2.4,mark:5,col:'#ffd54a'}},
 m2_7:{sk:'TURBO BOOST',skd:'Turbo dash through her lane: 260%, always critical. The whole team gets +25% attack speed for 5s.',p:{mult:2.6,aspd:5,col:'#40c4ff'}},
 m3_5:{sk:'NEON SPIN',skd:'Spinning neon dash that hits a WIDE path: 240%, always critical, enemies slowed 50% for 3s.',p:{mult:2.4,band:.38,slow:3,col:'#ff4fd8'}},
 m3_6:{sk:'NITRO ROCKET',skd:'Rides a nitro rocket through her lane: 260%, always critical, and every hit explodes on the enemies around (60%).',p:{mult:2.6,splash:.6,col:'#d05cff'}},
 // Medics (heal)
 m0_0:{sk:'FIRST AID KIT',skd:'Heals all mechanics 30% (+10% over 4s) and removes stun from everyone.',p:{heal:.3,hot:.1,cleanse:1,col:'#69f0ae'}},
 m0_1:{sk:'FRESH OIL',skd:'Heals all mechanics 25% (+10% over 4s). Fresh oil: team +30% attack for 5s.',p:{heal:.25,hot:.1,atk:5,col:'#b2ff59'}},
 m1_2:{sk:'SLOW-DRIP OIL',skd:'Heals all mechanics 15% now and a big 36% more over 6s.',p:{heal:.15,hot:.36,hotT:6,col:'#76ff03'}},
 m1_3:{sk:'LIFT & PATCH',skd:'Heals all mechanics 20% (+10% over 4s) and the weakest one gets +45% extra.',p:{heal:.2,hot:.1,low:.45,col:'#b2ff59'}},
 m2_2:{sk:'BRAKE PADS',skd:'Heals all mechanics 30% (+10% over 4s). Team takes −20% damage for 6s.',p:{heal:.3,hot:.1,def:6,col:'#69f0ae'}},
 m3_1:{sk:'TOOLBOX FORTRESS',skd:'Slams down his toolbox: heals all mechanics 15% and gives everyone a shield of 30% HP.',p:{heal:.15,hot:0,shield:.3,col:'#b388ff'}},
 // Sprayers (bomb)
 m0_4:{sk:'COLOR SPLASH',skd:'Big paint bomb: 170% damage in a wide area, enemies slowed 50% for 5s, burning paint on the ground.',p:{mult:1.7,rad:115,slow:5,puddle:1}},
 m0_5:{sk:'DENT BLAST',skd:'Heavy paint bomb: 230% damage in a small area, knocks enemies back and stuns 0.8s.',p:{mult:2.3,rad:85,push:40,stun:.8}},
 m1_4:{sk:'ACID BATH',skd:'Acid bomb: 150% damage, acid burns 4s and weakens enemies (−30% damage) for 4s.',p:{mult:1.5,burn:1,weak:4,pal:['#76ff03','#c6ff00','#b2ff59']}},
 m1_5:{sk:'TOXIC GLOSS',skd:'Purple toxic bomb: 170% damage, marks enemies (+35% damage taken) for 6s and slows them 3s.',p:{mult:1.7,mark:6,slow:3,pal:['#d05cff','#e040fb','#7c4dff']}},
 m2_3:{sk:'PRESSURE WASH',skd:'Water bomb: 190% damage, the blast pushes enemies back and stuns them 1.2s.',p:{mult:1.9,stun:1.2,push:50,pal:['#29b6f6','#80d8ff','#e1f5fe']}},
 m3_2:{sk:'GLOSS WAVE',skd:'A purple gloss wave sweeps the WHOLE field: 160% damage to every enemy, slowed 50% and marked (+35% damage) for 4s.',p:{wave:1,mult:1.6,slow:4,mark:4,col:'#e040fb'}},
 // Shockers (lightning)
 m0_6:{sk:'SPARK CHAIN',skd:'Lightning jumps 5 times: 200% damage, stun 1.2s.',p:{jumps:5,mult:2,stun:1.2}},
 m1_6:{sk:'GREEN SURGE',skd:'A long green chain that jumps 9 times: 140% damage, stun 0.8s.',p:{jumps:9,mult:1.4,stun:.8}},
 m2_4:{sk:'STATIC FIELD',skd:'Electrifies the ground under ALL enemies: 150% damage and stun 1.6s to everyone.',p:{allz:1,mult:1.5,stun:1.6}},
 m2_5:{sk:'LIVE WIRE',skd:'Heavy current that jumps 4 times without getting weaker: 270% damage, stun 1.5s.',p:{jumps:4,mult:2.7,stun:1.5,decay:1}},
 m3_3:{sk:'TESLA COIL',skd:'Places his Tesla coil: for 4s it zaps a random enemy every 0.4s (80% damage, stun 0.5s).',p:{coil:1}},
 // Scanners (scan / beam)
 m0_7:{sk:'ENGINE CHECK',skd:'A strong scan wave: 140% damage to every enemy and marks them (+35% damage taken) for 7s.',p:{mult:1.4,mark:7,col:'#64ffda'}},
 m0_8:{sk:'WEAK SPOT DATA',skd:'Scan wave: 110% damage, marks enemies 6s and the team gets +15% critical chance for 5s.',p:{mult:1.1,mark:6,crit:5,col:'#40c4ff'}},
 m1_7:{sk:'SCAN PULSE',skd:'Cold scan pulse: 120% damage, marks enemies 6s and slows them 50% for 3s.',p:{mult:1.2,mark:6,slow:3,col:'#80d8ff'}},
 m2_6:{sk:'TARGET LOCK',skd:'Red targeting scan: 120% damage, marks enemies 7s and the team gets +30% attack for 5s.',p:{mult:1.2,mark:7,atk:5,col:'#ff5252'}},
 m3_4:{sk:'HEADSHOT',skd:'Locks onto the strongest enemy and fires a huge sniper beam: 450% damage, always critical, marked 6s.',p:{snipe:1,col:'#e040fb'}}};
for(const k in SKP)HSK[k]={sk:SKP[k].sk,skd:SKP[k].skd};
const skp=u=>u&&u.h&&SKP[u.h.id]?SKP[u.h.id].p:{};
const hexA=(c,a)=>{const n=parseInt(c.slice(1),16);return 'rgba('+(n>>16)+','+(n>>8&255)+','+(n&255)+','+a+')';};
const skOf=h=>h&&!h.crew&&HSK[h.id]||ROLE[h?(h.crew?'crew':(h.sp||'all')):'all'];
// v16-46: PASSIVE skills – work on their own in battle. Common/Uncommon/Rare = 1 passive, Epic/Legendary/Mythic = 2. Numbers grow with the grade.
const PASV={
 engine:[{n:'IRON SKIN',ic:'🛡️',v:[8,10,12,14,17,20],d:v=>`Takes −${v}% damage from every hit.`},
         {n:'LAST STAND',ic:'💢',v:[0,0,0,25,30,35],d:v=>`Once per battle, under 35% HP: gains a shield of ${v}% HP and taunts enemies for 3s.`}],
 tuning:[{n:'ADRENALINE',ic:'🔥',v:[15,18,21,25,30,35],d:v=>`Every enemy he knocks out: +${v}% attack speed for 4s.`},
         {n:'QUICK STEP',ic:'💨',v:[0,0,0,12,15,18],d:v=>`${v}% chance to dodge an enemy hit.`}],
 service:[{n:'FIELD CARE',ic:'💚',v:[4,5,6,7,8,10],d:v=>`Every 6s heals the weakest mechanic for ${v}% of his HP.`},
          {n:'EMERGENCY KIT',ic:'🚑',v:[0,0,0,18,22,26],d:v=>`When a mechanic drops under 30% HP: instant heal of ${v}% HP (15s cooldown).`}],
 paint:[{n:'STICKY PAINT',ic:'🎨',v:[1,1.2,1.5,1.8,2.1,2.5],d:v=>`Every shot slows the enemy 50% for ${v}s.`},
        {n:'THINNER',ic:'🧪',v:[0,0,0,15,20,25],d:v=>`+${v}% damage to slowed enemies.`}],
 elec:[{n:'STATIC',ic:'⚡',v:[20,24,28,33,39,45],d:v=>`${v}% chance that a shot jumps to a second enemy (60% damage).`},
       {n:'SHORT CIRCUIT',ic:'💫',v:[0,0,0,10,14,18],d:v=>`${v}% chance that a shot stuns the enemy 0.6s.`}],
 inspect:[{n:'WEAK SPOT',ic:'🎯',v:[5,5,4,4,3,3],d:v=>`Every ${v}${v===3?'rd':'th'} shot marks the target for 3s (+35% damage taken).`},
          {n:'PRECISION',ic:'🔍',v:[0,0,0,15,20,25],d:v=>`+${v}% damage to marked enemies.`}],
 all:[{n:'LEADER',ic:'👑',v:[4,5,6,7,8,10],d:v=>`All mechanics deal +${v}% damage while this hero stands.`},
      {n:'SECOND WIND',ic:'❤️',v:[0,0,0,2,2.5,3],d:v=>`Under 50% HP: regenerates ${v}% HP every second.`}]};
const pasN=h=>!h||h.crew||!PASV[roleOf(h)]?0:h.gr>=3?2:1;
function pasOf(h){const n=pasN(h),o=[];for(let i=0;i<n;i++){const p=PASV[roleOf(h)][i];o.push({n:p.n,ic:p.ic,d:p.d(p.v[h.gr])});}return o;}
// in battle: pv(u,'engine',0) → the number of that passive if this unit has it, else 0
const pv=(u,role,i)=>u&&u.hero&&u.role===role&&u.pn>i?PASV[role][i].v[u.h.gr]:0;
function pasTxt(u,i,txt){if(B.sim)return;const p=PASV[u.role][i];num(u.x,headY(u)-14*S,txt||p.n,'#ffe082',0);}
const CREW_NAMES=['Rookie Rob','Rookie Dan','Rookie Max','Rookie Ivo','Rookie Sam'];

// monsters (stats at stage scale 1) · dr = drawing, b = special behaviour, at = attack type
const MON={
 imp:{n:'Spark Imp',hp:260,atk:30,def:2,mv:125,rng:24,as:.8,h:36,desc:'Fast spark plug'},
 tire:{n:'Tire Roller',hp:480,atk:40,def:8,mv:100,rng:30,as:1.0,h:48,charge:1,desc:'Rolls in hard'},
 snake:{n:'Muffler Serpent',hp:420,atk:46,def:6,mv:70,rng:170,as:1.5,h:40,at:'smoke',desc:'Spits exhaust'},
 drone:{n:'Headlight Drone',hp:300,atk:50,def:4,mv:85,rng:200,as:1.4,h:30,fly:1,at:'beam',desc:'Laser eye'},
 spider:{n:'Piston Spider',hp:620,atk:56,def:12,mv:88,rng:32,as:1.0,h:44,pounce:1,desc:'Pounces'},
 brute:{n:'Radiator Brute',hp:1500,atk:88,def:20,mv:58,rng:42,as:1.6,h:84,b:'pound',big:1.8,desc:'Ground pound'},
 battery:{n:'Battery Golem',hp:1100,atk:70,def:18,mv:60,rng:38,as:1.4,h:62,b:'pound',big:1.6,at:'zap',desc:'Shocking punches'},
 canister:{n:'Fuel Can Bomber',hp:400,atk:54,def:6,mv:72,rng:190,as:1.6,h:44,at:'acid',desc:'Lobs acid bombs'},
 wiper:{n:'Wiper Mantis',hp:560,atk:44,def:9,mv:122,rng:30,as:.62,h:52,pounce:1,desc:'Double blade slash'},
 hubcap:{n:'Hubcap Saw',hp:450,atk:58,def:14,mv:112,rng:28,as:.9,h:28,fly:1,charge:1,desc:'Spinning saw'},
 horn:{n:'Horn Howler',hp:480,atk:56,def:8,mv:70,rng:205,as:1.5,h:46,at:'wave',desc:'Sound blast slows'},
 turbo:{n:'Turbo Hound',hp:640,atk:64,def:10,mv:138,rng:30,as:.85,h:40,charge:1,desc:'Charging hound'},
 gearbox:{n:'Gearbox Golem',hp:1900,atk:96,def:26,mv:52,rng:44,as:1.6,h:90,b:'pound',big:2,desc:'Huge and heavy'},
 bat:{n:'Exhaust Bat',hp:430,atk:68,def:6,mv:96,rng:185,as:1.3,h:30,fly:1,at:'fire',desc:'Spits fire'},
 // v16-54: 3 new monsters drawn by Marius (dr = old drawing used while the picture loads)
 wraith:{n:'Spark Wraith',dr:'drone',hp:380,atk:62,def:5,mv:90,rng:200,as:1.3,h:40,fly:1,at:'beam',desc:'Shoots spark plugs'},
 brake:{n:'Brake Beast',dr:'tire',hp:900,atk:72,def:22,mv:84,rng:32,as:1.2,h:52,charge:1,desc:'Rolls in like a brake disc'},
 airbag:{n:'Airbag Blob',dr:'brute',hp:1300,atk:50,def:16,mv:62,rng:36,as:1.4,h:50,b:'pound',big:1.4,desc:'Inflates and bursts'},
 crusher:{n:'CRUSHER',hp:4600,atk:110,def:24,mv:55,rng:50,as:1.5,h:110,boss:1,b:'crusher',sc:1.3,big:3,pal:{a:'#bf5a1e',b:'#5d2a0c',c:'#e07b39',e:'#ff1744',horn:1},desc:'Mini-boss'},
 sludge:{n:'SLUDGE CRUSHER',dr:'crusher',hp:4800,atk:110,def:24,mv:55,rng:50,as:1.5,h:110,boss:1,b:'crusher',sc:1.3,big:3,pal:{a:'#4e8a1e',b:'#1d3a0a',c:'#8bc34a',e:'#c6ff00',horn:1},desc:'Mini-boss'},
 frost:{n:'FROST CRUSHER',dr:'crusher',hp:5000,atk:112,def:26,mv:55,rng:50,as:1.5,h:110,boss:1,b:'crusher',sc:1.3,big:3,pal:{a:'#5c8db8',b:'#1d3550',c:'#b3e5fc',e:'#80d8ff',horn:1},desc:'Mini-boss'},
 neonc:{n:'NEON CRUSHER',dr:'crusher',hp:5200,atk:114,def:26,mv:55,rng:50,as:1.5,h:110,boss:1,b:'crusher',sc:1.3,big:3,pal:{a:'#7b1fa2',b:'#2a0638',c:'#ff4fd8',e:'#00e5ff',horn:1},desc:'Mini-boss'},
 magma:{n:'MAGMA CRUSHER',dr:'crusher',hp:5400,atk:118,def:28,mv:55,rng:50,as:1.5,h:110,boss:1,b:'crusher',sc:1.3,big:3,pal:{a:'#3a2a2a',b:'#120808',c:'#ff6d00',e:'#ffea00',horn:1},desc:'Mini-boss'},
 titan:{n:'JUNK TITAN',hp:12500,atk:130,def:28,mv:28,rng:130,as:1.7,h:220,boss:1,b:'titan',big:5,summ:'imp',lc:'#ffea00',desc:'Chapter boss'},
 tanker:{n:'ACID TANKER',hp:13500,atk:132,def:28,mv:28,rng:130,as:1.7,h:220,boss:1,b:'titan',big:5,summ:'canister',lc:'#76ff03',desc:'Chapter boss'},
 plow:{n:'FROST PLOW',hp:14500,atk:136,def:30,mv:28,rng:130,as:1.7,h:220,boss:1,b:'titan',big:5,summ:'hubcap',lc:'#80d8ff',desc:'Chapter boss'},
 wyrm:{n:'TURBO WYRM',hp:15500,atk:140,def:30,mv:28,rng:130,as:1.7,h:220,boss:1,b:'titan',big:5,summ:'turbo',lc:'#ff4fd8',desc:'Chapter boss'},
 omega:{n:'OMEGA ENGINE',hp:17000,atk:146,def:32,mv:28,rng:130,as:1.7,h:220,boss:1,b:'titan',big:5,summ:'bat',lc:'#ff3d00',desc:'Final boss'}};
// v16-39: monsters drawn by Marius (ChatGPT sprite sheets, cut by tools/atlas_mon.py → img/mon/<id>.webp)
// rows: idle 6 · walk 8 · attack 8 · skill 8 · hurt 4 · death 6 · w/h = cell, ax/ay = feet point, ih = idle height (atlas px)
const MSPR={cbrute:{w:281,h:153,ax:140.5,ay:144.5,ih:138.6},crawler:{w:197,h:132,ax:98.5,ay:120.8,ih:115.6},esnake:{w:239,h:119,ax:119.5,ay:113.2,ih:100.0},hound:{w:253,h:119,ax:126.5,ay:112.8,ih:111.2},jtitan:{w:280,h:187,ax:140.0,ay:178.0,ih:176.0},ndragon:{w:294,h:171,ax:147.0,ay:166.0,ih:165.0},pimp:{w:228,h:142,ax:114.0,ay:135.2,ih:130.4},rat:{w:224,h:121,ax:112.0,ay:113.6,ih:109.6},towking:{w:284,h:179,ax:142.0,ay:169.0,ih:159.0},wasp:{w:269,h:163,ax:134.5,ay:145.8,ih:140.4},
 // v16-54: the 13 new sheets (L = 8x6 sheet without hurt/death rows: i idle · w walk · a attack · s skill · d death row or -1)
 gbattery:{w:250,h:158,ax:125,ay:151.3,ih:123.2},gdrone:{w:240,h:153,ax:120,ay:145.8,ih:123.2},gcan:{w:329,h:142,ax:164.5,ay:136.4,ih:118.2},gmantis:{w:279,h:151,ax:139.5,ay:137.7,ih:136},gsaw:{w:218,h:151,ax:109,ay:138.5,ih:137.7},ggolem:{w:261,h:157,ax:130.5,ay:151.2,ih:140.4},gtanker:{w:372,h:172,ax:186,ay:165,ih:147},gbat:{w:247,h:145,ax:123.5,ay:130.9,ih:110.5},ghorn:{w:227,h:155,ax:113.5,ay:146.2,ih:128.4},gomega:{w:316,h:169,ax:158,ay:163.5,ih:161},
 gspark:{w:204,h:128,ax:102,ay:119.8,ih:112.2,L:{i:0,w:1,a:2,s:4,s2:3,d:-1}},gbrake:{w:210,h:115,ax:105,ay:108,ih:107.1,L:{i:0,w:1,a:2,s:4,s2:3,d:-1}},gairbag:{w:213,h:146,ax:106.5,ay:137.3,ih:101.1,L:{i:0,w:1,a:2,s:3,s2:4,d:4}}};
// monster key → [sprite, height in game units, new name, hue (mini-boss colours per world)]
const MSKIN={spider:['crawler',46,'Bolt Crawler'],tire:['rat',46,'Tire Rat'],imp:['pimp',50,'Piston Imp'],snake:['esnake',42,'Exhaust Snake'],
 turbo:['hound',50,'Scrap Hound'],brute:['cbrute',88,'Crankshaft Brute'],
 crusher:['wasp',128,'TURBO WASP'],sludge:['wasp',128,'TOXIC WASP',95],frost:['wasp',128,'FROST WASP',165],neonc:['wasp',128,'NEON WASP',265],magma:['wasp',128,'MAGMA WASP',-28],
 titan:['jtitan',215,'JUNKYARD TITAN'],wyrm:['ndragon',190,'NITRO DRAGON'],plow:['towking',210,'TOW KING'],
 battery:['gbattery',64,'Battery Golem'],drone:['gdrone',36,'Headlight Drone'],canister:['gcan',48,'Fuel Can Bomber'],wiper:['gmantis',54,'Wiper Mantis'],hubcap:['gsaw',36,'Hubcap Saw'],
 gearbox:['ggolem',92,'Gearbox Golem'],bat:['gbat',38,'Exhaust Bat'],horn:['ghorn',50,'Horn Howler'],tanker:['gtanker',165,'ACID TANKER'],omega:['gomega',180,'OMEGA ENGINE'],
 wraith:['gspark',44,'Spark Wraith'],brake:['gbrake',54,'Brake Beast'],airbag:['gairbag',56,'Airbag Blob']};
for(const k in MSKIN){const [id,h,n,hue]=MSKIN[k],M=MON[k];M.dr0=M.dr||k;M.dr='spr_'+id;M.sp=id;M.h=h;M.sc=1;M.n=n;if(hue!=null){M.hue=hue;M.sat=1.1;}}
MON.wyrm.lc='#40c4ff';MON.tanker.lz=[150,95];MON.omega.lz=[150,110];MON.titan.lz=[20,120];MON.wyrm.lz=[125,128];MON.plow.lz=[70,150];MON.plow.lc='#ffd740';MON.crusher.desc=MON.sludge.desc=MON.frost.desc=MON.neonc.desc=MON.magma.desc='Mini-boss · stinger dive';
for(const k in MON){const M=MON[k];M.dr=M.dr||k;M.sc=M.sc||1;M.big=M.big||1;M.b=M.b||'';}

// 5 chapters × 20 stages · 4 zones of 5 stages each
const CHAP=[
 {n:'Scrapyard Wastes',col:'#ff8f00',bios:[0,1,2,3],zones:['Rusty Junkyard','Smog Valley','Burning Stacks',"Titan's Foundry"],
  pool:[['imp','tire'],['imp','tire','snake','drone'],['tire','snake','drone','spider'],['spider','drone','snake','brute']],mini:'crusher',boss:'titan',
  names:['Rust Gate','Tire Hills','Crushed Row','Bolt Alley','Wreck Ridge','Smog Valley','Muffler Marsh','Oil Lake','Fume Gate','Crusher Pit','Burning Stacks','Magnet Yard','Cinder Walk','Furnace Road','Ember Heap','Slag River','Gear Graveyard','Molten Gate','Foundry Steps',"Titan's Foundry"]},
 {n:'Toxic Refinery',col:'#76ff03',bios:[4,5,6,7],zones:['Acid Swamp','Pipe Maze','Tank Farm','Refinery Core'],
  pool:[['imp','canister','tire'],['canister','snake','battery','drone'],['battery','canister','spider','drone'],['battery','canister','brute','airbag']],mini:'sludge',boss:'tanker',
  names:['Green Gate','Acid Puddles','Rot Marsh','Bubble Bog','Sludge Pond','Pipe Maze','Valve Street','Leaky Joints','Steam Vents','Sludge Pit','Tank Farm','Barrel Hill','Fuel Depot','Pump Station','Chem Lab','Toxic Tower','Flare Stack','Reactor Walk','Core Gate','Acid Throne']},
 {n:'Frozen Pass',col:'#80d8ff',bios:[8,9,10,11],zones:['Snow Road','Ice Bridges','Frost Peaks','Glacier Depot'],
  pool:[['wiper','imp','tire'],['wiper','hubcap','drone','snake'],['hubcap','wiper','brake','battery'],['wiper','hubcap','brake','airbag']],mini:'frost',boss:'plow',
  names:['Snow Gate','Slush Lane','Chain Road','Frozen Jam','Wiper Woods','Ice Bridge','Black Ice','Salt Barns','Avalanche Turn','Frost Pit','Frost Peaks','Blizzard Pass','Crystal Cave','Pine Hairpin','Summit Garage','Glacier Depot','Plow Yard','Ice Wall','Frozen Gate','Plow King Hall']},
 {n:'Neon Highway',col:'#ff4fd8',bios:[12,13,14,15],zones:['City Lights','Tunnel Run','Skyline Ramp','Turbo Arena'],
  pool:[['turbo','horn','imp'],['turbo','horn','hubcap','drone'],['turbo','horn','wraith','battery'],['turbo','wraith','gearbox','hubcap']],mini:'neonc',boss:'wyrm',
  names:['Neon Gate','Taxi Rank','Billboard Row','Night Market','Drift Corner','Tunnel Run','Echo Tube','Toll Booth','Speed Trap','Neon Pit','Skyline Ramp','Overpass','Rooftop Lot','Laser Bridge','Street Race','Turbo Arena','Nitro Lane','Boost Ring','Wyrm Gate','Turbo Wyrm Nest']},
 {n:'Volcano Forge',col:'#ff3d00',bios:[16,17,18,19],zones:['Ash Fields','Lava Rivers','Forge Halls','Omega Core'],
  pool:[['bat','gearbox','imp'],['bat','gearbox','turbo','canister'],['bat','wraith','brake','horn'],['bat','gearbox','airbag','wraith']],mini:'magma',boss:'omega',
  names:['Ash Gate','Smoke Fields','Ember Road','Cinder Dunes','Lava Bridge','Lava River','Obsidian Ford','Magma Falls','Fire Hollow','Magma Pit','Forge Halls','Anvil Row','Piston Hall','Crank Forge','Cast Yard','Omega Core','Blast Furnace','Molten Heart','Last Gate','Omega Engine']}];
const BIO=[
 {n:'Rust Gate',sky:['#3f86c6','#f6c98d','#f39a5b'],sun:'#fff1c1',sunY:.42,sunR:.11,far:'#7a5546',far2:'#5e3f33',ga:'#9b7650',gb:'#4f3322',haze:'rgba(255,196,130,.32)',rim:'rgba(255,230,170,.55)',mid:.15},
 {n:'Smog Valley',sky:['#2b1a4a','#8a4a6e','#e08a5c'],sun:'#ffd9a8',sunY:.72,sunR:.09,far:'#3a2840',far2:'#2a1d30',ga:'#6b5040',gb:'#24180f',haze:'rgba(170,190,90,.22)',rim:'rgba(255,190,140,.45)',stacks:1,smog:1,mid:.3},
 {n:'Burning Stacks',sky:['#05081a','#16163a','#4a1f2c'],sun:'#eef3ff',sunY:.25,sunR:.05,moon:1,far:'#160f1f',far2:'#0d0913',ga:'#3e2c22',gb:'#120b08',haze:'rgba(255,90,30,.16)',rim:'rgba(255,120,60,.35)',stacks:1,fires:1,night:1,mid:.45},
 {n:"Titan's Foundry",sky:['#160303','#5c0f0a','#d24a14'],sun:'#ff6a2a',sunY:.62,sunR:.16,far:'#2a0b07',far2:'#1a0604',ga:'#4a2414',gb:'#120503',haze:'rgba(255,80,20,.28)',rim:'rgba(255,140,60,.6)',stacks:1,fires:1,lava:1,mid:.45},
 // chapter 2 · toxic refinery
 {n:'Acid Swamp',sky:['#2f5a3a','#9fbf6a','#d8d27a'],sun:'#f4ffc0',sunY:.45,sunR:.1,far:'#3d4f33',far2:'#2c3a25',ga:'#5d6b3a',gb:'#232b14',haze:'rgba(170,255,80,.25)',rim:'rgba(220,255,150,.45)',acid:1,mid:.2},
 {n:'Pipe Maze',sky:['#24363a','#5f8a6a','#b9c77a'],sun:'#eaffb0',sunY:.6,sunR:.09,far:'#2c3b38',far2:'#1d2a28',ga:'#4f5a3c',gb:'#1c2214',haze:'rgba(150,230,90,.22)',rim:'rgba(190,255,140,.4)',pipes:1,acid:1,smog:1,mid:.3},
 {n:'Tank Farm',sky:['#101a22','#1f3a3a','#3f6a3a'],sun:'#d8ffd0',sunY:.25,sunR:.05,moon:1,far:'#14201e',far2:'#0b1412',ga:'#344030',gb:'#0f140c',haze:'rgba(120,255,80,.18)',rim:'rgba(150,255,120,.35)',pipes:1,acid:1,night:1,stacks:1,mid:.45},
 {n:'Refinery Core',sky:['#081008','#1f4a12','#7ad61a'],sun:'#c6ff00',sunY:.62,sunR:.15,far:'#10220c',far2:'#081306',ga:'#2c3a1a',gb:'#0a1006',haze:'rgba(150,255,40,.3)',rim:'rgba(180,255,80,.6)',pipes:1,acid:1,stacks:1,fires:1,mid:.45},
 // chapter 3 · frozen pass
 {n:'Snow Road',sky:['#6fa8dc','#cfe6f7','#f3f8fc'],sun:'#ffffff',sunY:.4,sunR:.09,far:'#a9bfd3',far2:'#8aa3ba',ga:'#e3eef6',gb:'#9fb6c8',haze:'rgba(255,255,255,.35)',rim:'rgba(255,255,255,.7)',snow:1,mid:.1},
 {n:'Ice Bridges',sky:['#3b5f8a','#8fb4d9','#d9ecf8'],sun:'#f0fbff',sunY:.55,sunR:.08,far:'#6f8db0',far2:'#55708f',ga:'#cfe0ee',gb:'#7f98ad',haze:'rgba(200,235,255,.3)',rim:'rgba(220,245,255,.6)',snow:1,mid:.2},
 {n:'Frost Peaks',sky:['#0a1630','#1c3366','#3e5c9a'],sun:'#e8f3ff',sunY:.25,sunR:.05,moon:1,far:'#22345a',far2:'#172540',ga:'#9fb4cc',gb:'#3a4d66',haze:'rgba(150,200,255,.2)',rim:'rgba(180,220,255,.45)',snow:1,night:1,mid:.35},
 {n:'Glacier Depot',sky:['#08263a','#1a6a8a','#7fdcf0'],sun:'#e0fbff',sunY:.6,sunR:.14,far:'#1a4a60',far2:'#0f3346',ga:'#a8d8e8',gb:'#3a6a80',haze:'rgba(120,230,255,.3)',rim:'rgba(170,240,255,.6)',snow:1,stacks:1,mid:.35},
 // chapter 4 · neon highway
 {n:'City Lights',sky:['#120a2a','#3a1a5a','#c04a8a'],sun:'#ffd0f0',sunY:.7,sunR:.08,far:'#1a1030',far2:'#100a20',ga:'#3a3448',gb:'#121018',haze:'rgba(255,80,200,.2)',rim:'rgba(255,120,220,.45)',neon:1,road:1,mid:.3},
 {n:'Tunnel Run',sky:['#06060e','#141030','#2a1850'],sun:'#e0e8ff',sunY:.25,sunR:.05,moon:1,far:'#0e0a1c',far2:'#08060f',ga:'#2c2a36',gb:'#0c0b10',haze:'rgba(0,220,255,.16)',rim:'rgba(0,229,255,.4)',neon:1,road:1,night:1,mid:.45},
 {n:'Skyline Ramp',sky:['#1a0630','#5a1070','#ff6a5a'],sun:'#ffe0a0',sunY:.65,sunR:.12,far:'#2a0c3a',far2:'#1a0626',ga:'#3a3040',gb:'#140f18',haze:'rgba(255,100,160,.25)',rim:'rgba(255,170,120,.5)',neon:1,road:1,mid:.35},
 {n:'Turbo Arena',sky:['#03000a','#20003a','#7a0aa0'],sun:'#ff4fd8',sunY:.6,sunR:.15,far:'#14001f',far2:'#0a0012',ga:'#2a2236',gb:'#08060c',haze:'rgba(255,60,220,.3)',rim:'rgba(255,90,230,.6)',neon:1,road:1,night:1,fires:1,mid:.45},
 // chapter 5 · volcano forge
 {n:'Ash Fields',sky:['#4a3a3a','#9a7a6a','#d6a27a'],sun:'#ffe0b0',sunY:.5,sunR:.1,far:'#4a3630',far2:'#352620',ga:'#5a4a44',gb:'#221a16',haze:'rgba(200,170,150,.3)',rim:'rgba(255,200,160,.45)',ash:1,volcano:1,mid:.25},
 {n:'Lava Rivers',sky:['#200606','#6a1a0a','#ff7a2a'],sun:'#ffb060',sunY:.62,sunR:.12,far:'#2a0c08',far2:'#1a0604',ga:'#3a2420',gb:'#120806',haze:'rgba(255,100,30,.28)',rim:'rgba(255,150,70,.6)',lava:1,volcano:1,fires:1,mid:.4},
 {n:'Forge Halls',sky:['#08040a','#2a0a10','#6a1a10'],sun:'#ffd0a0',sunY:.25,sunR:.05,moon:1,far:'#1a0808',far2:'#0f0404',ga:'#2e2420',gb:'#0c0806',haze:'rgba(255,90,20,.2)',rim:'rgba(255,130,60,.45)',stacks:1,fires:1,night:1,lava:1,mid:.45},
 {n:'Omega Core',sky:['#000000','#3a0000','#ff2a00'],sun:'#ffea00',sunY:.62,sunR:.17,far:'#200000',far2:'#120000',ga:'#3a1a10',gb:'#0a0302',haze:'rgba(255,60,0,.35)',rim:'rgba(255,170,40,.7)',lava:1,volcano:1,stacks:1,fires:1,ash:1,mid:.45}];
// ---------------------------------------------------------------- v14: 50 chapters = 10 acts × the 5 worlds
// Act 1 = the 5 hand-made chapters. Acts 2-10 revisit the 5 worlds with new weather/colours, stronger "elite" monsters
// (same drawings, new colours via a hue filter) and new bosses.
MON.omega.desc='Chapter boss';
const ACTS=[null,
 {n:'Dusk',bio:{h:22,s:1.1,l:.92},mh:28,ms:1.15},
 {n:'Storm',bio:{h:0,s:.6,l:.78,rain:1},mh:195,ms:1.1},
 {n:'Crimson',bio:{h:-28,s:1.2,l:.85},mh:-38,ms:1.35},
 {n:'Midnight',bio:{h:12,s:.9,l:.55,night:1,moon:1},mh:255,ms:1.1},
 {n:'Venom',bio:{h:78,s:1.1,l:.9},mh:95,ms:1.3},
 {n:'Frostbite',bio:{h:175,s:.65,l:1.12,snow:1},mh:175,ms:.9,mb:1.1},
 {n:'Golden',bio:{h:32,s:1.25,l:1.05},mh:42,ms:1.4,mb:1.12},
 {n:'Void',bio:{h:235,s:.7,l:.55,night:1},mh:230,ms:.55,mb:.85},
 {n:'Omega',bio:{h:-12,s:1.3,l:.7,fires:1,lava:1},mh:320,ms:1.5}];
const CH_NAMES=[
 ['Scrapyard Wastes','Rustfall Canyon','Storm Junkyard','Crimson Scrapheap','Midnight Wreckyard','Venom Dump','Frostbite Salvage','Golden Junkpile','Void Graveyard','Omega Scrap Throne'],
 ['Toxic Refinery','Dusk Oil Fields','Storm Refinery','Blood Oil Swamp','Midnight Chem Works','Venom Lagoon','Frozen Pipeline','Golden Oil Rigs','Void Reactor','Omega Refinery'],
 ['Frozen Pass','Dusk Glacier','Blizzard Peaks','Crimson Tundra','Midnight Icefields','Venom Snowfields','Frostbite Summit','Golden Ice Caves','Void Iceberg','Omega Ice Fortress'],
 ['Neon Highway','Sunset Boulevard','Storm Speedway','Crimson Strip','Midnight Expressway','Venom City','Frostbite Freeway','Golden Grand Prix','Void Overpass','Omega Raceway'],
 ['Volcano Forge','Dusk Caldera','Thunder Volcano','Crimson Magma Pits','Midnight Forge','Venom Crater','Frostfire Mountain','Golden Foundry','Void Core','Omega Inferno']];
const CH_COL=['#ff8f00','#76ff03','#80d8ff','#ff4fd8','#ff3d00'];
function colX(c,m){// hue / saturation / lightness change of '#rrggbb' or 'rgba(...)'
  let r,g2,b,a=null,mm;if(c[0]==='#'){r=parseInt(c.substr(1,2),16);g2=parseInt(c.substr(3,2),16);b=parseInt(c.substr(5,2),16);}
  else if((mm=c.match(/rgba?\(([^)]+)\)/))){const v=mm[1].split(',').map(Number);[r,g2,b]=v;a=v.length>3?v[3]:null;}else return c;
  r/=255;g2/=255;b/=255;const mx=Math.max(r,g2,b),mn=Math.min(r,g2,b);let h=0,sat=0,l=(mx+mn)/2;
  if(mx!==mn){const d=mx-mn;sat=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g2-b)/d+(g2<b?6:0):mx===g2?(b-r)/d+2:(r-g2)/d+4;h*=60;}
  h=((h+(m.h||0))%360+360)%360;sat=clamp(sat*(m.s||1),0,1);l=clamp(l*(m.l||1),0,1);
  const q=l<.5?l*(1+sat):l+sat-l*sat,p2=2*l-q,hk=h/360,f=t=>{t=(t+1)%1;return t<1/6?p2+(q-p2)*6*t:t<.5?q:t<2/3?p2+(q-p2)*(2/3-t)*6:p2;};
  const R=Math.round(f(hk+1/3)*255),Gc=Math.round(f(hk)*255),Bc=Math.round(f(hk-1/3)*255);
  return a==null?'#'+[R,Gc,Bc].map(v=>v.toString(16).padStart(2,'0')).join(''):'rgba('+R+','+Gc+','+Bc+','+a+')';}
function bioVariant(P,m){const o={};for(const k in P){const v=P[k];o[k]=typeof v==='string'&&k!=='n'?colX(v,m):Array.isArray(v)?v.map(x=>typeof x==='string'?colX(x,m):x):v;}
  ['rain','night','moon','snow','fires','lava'].forEach(f=>{if(m[f])o[f]=1;});if(m.night){o.sunY=.25;o.sunR=.05;}return o;}
function monClone(k,a){const A=ACTS[a],key=k+'_'+a;if(MON[key])return key;const M=MON[k];
  let n=M.boss?A.n.toUpperCase()+' '+M.n:A.n+' '+M.n;if(k==='omega'&&a===9)n='ULTIMA ENGINE';
  // bosses of acts 2-10 get the same base stats in every world, so only the stage level decides how hard they are
  const norm=M.b==='titan'?{hp:14000,atk:136,def:30}:M.b==='crusher'?{hp:5000,atk:112,def:26}:{};
  MON[key]=Object.assign({},M,norm,{n,hue:A.mh,sat:A.ms,bri:A.mb||1,base:k,desc:k==='omega'&&a===9?'Final boss':M.desc});return key;}
for(let a=1;a<10;a++)for(let t=0;t<5;t++){const B0=CHAP[t],A=ACTS[a],nb=t+a*5;
  const bios=B0.bios.map(bi=>{BIO.push(Object.assign(bioVariant(BIO[bi],A.bio),{n:A.n+' '+BIO[bi].n}));return BIO.length-1;});
  const pool=B0.pool.map((pz,z)=>{const p2=pz.map(k=>monClone(k,a));if(a>=2){const ex=CHAP[(t+a)%5].pool[z][(a+z)%CHAP[(t+a)%5].pool[z].length];p2.push(monClone(ex,a));}return p2;});
  CHAP.push({n:CH_NAMES[t][a],col:colX(CH_COL[t],{h:A.mh*.35,s:1.1}),bios,zones:B0.zones.map(z=>z.startsWith(A.n)?z.replace(A.n,'Ultima'):A.n+' '+z),pool,mini:monClone(B0.mini,a),boss:monClone(B0.boss,a),
    names:B0.names.map(x=>x.startsWith(A.n)?x.replace(A.n,'Ultima'):A.n+' '+x),act:a});}
CHAP.forEach((C,i)=>{C.n=CH_NAMES[i%5][Math.floor(i/5)];});
const NCH=CHAP.length,SPC=20,NST=NCH*SPC;
function seeded(n){let s=n||1;return()=>{s=(s*16807)%2147483647;return s/2147483647;};}
const STAGES=[];
CHAP.forEach((C,c)=>{for(let j=0;j<SPC;j++){const z=Math.floor(j/5),R=seeded(911+c*131+j*17),pool=C.pool[z],pk=()=>pool[Math.floor(R()*pool.length)];
  const n0=Math.min(5,3+Math.floor(j/6)+(c>0?1:0)),mk=n=>{const w=[];for(let k=0;k<n;k++)w.push(pk());return w;};
  let w;
  if(c===0&&j===0)w=[['imp','imp','tire'],['tire','imp','imp','tire']];
  else if(j===9)w=[mk(n0),mk(Math.min(5,n0+1)),[C.mini,pk(),pk()]];
  else if(j===19)w=[mk(n0),mk(Math.min(5,n0+1)),[C.boss]];
  else if(j%5===4)w=[mk(n0),mk(n0),mk(Math.min(5,n0+1))];
  else w=[mk(n0),mk(Math.min(5,n0+(j%2)))];
  STAGES.push({n:C.names[j],c,j,bio:C.bios[z],w,boss:j===19,mini:j===9});}});
// v14: 1000 stages. Chapter 1 as before, then a steady climb to the last boss (5-20 ≈ ×26, 50-20 ≈ ×345)
const SMK=[[19,6.12],[99,26],[239,66],[439,112],[639,215],[839,300],[999,345]]; // tested: these bosses need ≈ Myth/Leg +5 Epic Lv10 · +10 Leg Lv15 · +20 Leg Lv25 · +30 Myth Lv30 · +40 Myth Lv40 · +50 Myth Lv50
// v16-74: the campaign was ~4× faster than planned (2-month test: day 16 = stage 16-20) → chapters 2-12 climb to ×HK_MAX stronger, kept until ch 32, then back to ×1.3 at the end
const HK_MAX=1.75,HK=i=>i<20?1:i<240?1+(HK_MAX-1)*(i-19)/220:i<640?HK_MAX:HK_MAX-(HK_MAX-1.3)*(i-639)/360;
// v16-74: HARD MODE – hard chapter N opens when normal chapter N is cleared (and hard N-1); monsters ×HARD_K, rewards ×HARD_RW
const HARD_K=2.5,HARD_RW=1.5;let HM=0;
const CPX=()=>{const G=TE().G;if(!HM)return G.cp;if(!G.cph)G.cph={best:0,stars:{},ch:0};if(!G.cph.stars)G.cph.stars={};return G.cph;};
const hardOK=()=>TE().G.cp.best>=SPC;
const stageMul=i=>stageMul0(i)*HK(i)*(HM?HARD_K:1);
const stageMul0=i=>stageMulB(i)*(TE().expMul?TE().expMul(i):1); // v16-99: monsters follow the hero level the game expects at this stage
const stageMulB=i=>{if(i<20)return Math.pow(1.1,i);for(let k=1;k<SMK.length;k++){const [a,va]=SMK[k-1],[b,vb]=SMK[k];if(i<=b)return va*Math.pow(vb/va,(i-a)/(b-a));}return SMK[SMK.length-1][1];};
// v16-73: battles gave ~20× more money than the garage at the start (all buildings LV4 in 20 min) → CP_MON
const CP_MON=.25; // v16-99: .35→.25 – gear does not cost money any more (Gear Parts), money is only for the garage
const REWARDX=i=>{const r=REWARD(i);if(!HM)return r;const o={};for(const k in r)o[k]=typeof r[k]==='number'?Math.round(r[k]*HARD_RW/(k==='money'?10:1))*(k==='money'?10:1):r[k];return o;};
const REWARD=i=>{const s=STAGES[i];return {money:Math.round(CP_MON*(i<20?250*Math.pow(1.2,i):250*Math.pow(1.2,19)*Math.pow(1+(i-19)*.05,1.5))/10)*10,tk:s.boss?5:s.mini?3:1,gtk:s.boss?5:s.mini?3:1,ct:s.boss?3:s.mini?1:0,dm:s.boss?100:s.mini?30:10};};
const sLabel=i=>(HM?'H ':'')+(STAGES[i].c+1)+'-'+(STAGES[i].j+1);

// ---------------------------------------------------------------- GEAR (works only in battles)
const GSLOT=[
 {k:'tool',n:'Tool',ic:'tool',st:'atk'},
 {k:'helm',n:'Helmet',ic:'helm',st:'hp'},
 {k:'vest',n:'Work Vest',ic:'vest',st:'def'},
 {k:'glove',n:'Gloves',ic:'glove',st:'crit'},
 {k:'boots',n:'Boots',ic:'boots',st:'aspd'},
 {k:'chip',n:'ECU Chip',ic:'chip',st:'en'}];
const GS={};GSLOT.forEach(s=>GS[s.k]=s);
const GSTAT={atk:{n:'Attack',ic:'atk',col:'#ff7043',v:[6,10,15,22,30,40,52]},hp:{n:'HP',ic:'heart',col:'#66bb6a',v:[6,10,15,22,30,40,52]},def:{n:'Defense',ic:'shield',col:'#42a5f5',v:[8,13,20,28,38,50,65]},
 crit:{n:'Crit chance',ic:'crit',col:'#ffca28',v:[3,4,6,8,11,15,19]},aspd:{n:'Attack speed',ic:'aspd',col:'#26c6da',v:[4,6,9,13,17,22,28]},en:{n:'Skill charge',ic:'energy',col:'#ffab00',v:[6,10,15,22,30,40,52]}};
const GNAMES={tool:['Rusty Wrench','Steel Wrench','Torque Wrench','Impact Gun','Golden Ratchet','Titan Breaker','Celestial Driver'],helm:['Cloth Cap','Hard Hat','Welding Mask','Carbon Helmet','Golden Helmet','Crown of Gears','Halo of Torque'],
 vest:['Old Overalls','Work Vest','Kevlar Apron','Armored Vest','Golden Plate','Mythic Exo-Suit','Starforged Exo-Suit'],glove:['Cotton Gloves','Leather Gloves','Grip Gloves','Shock Gloves','Golden Gauntlets','Titan Fists','Nova Gauntlets'],
 boots:['Old Sneakers','Work Boots','Steel Toes','Racing Boots','Golden Boots','Nitro Boots','Warp Boots'],chip:['Basic Fuse','ECU Chip','Tuned ECU','Stage 2 ECU','Golden ECU','Quantum ECU','Singularity ECU']};
// v16-89 (Marius): ASCENDED = gear grade above Mythic (grade 6, gear only) + gear STARS ★1-★5 (merge an identical piece: same slot + same grade)
const ASC={n:'Ascended',c:'#2ef3ff',d:'#04505e'},GG=r=>r>=6?ASC:TE().GRADES[r],GGLOW=['','','','#d070ff','#ffd54a','#ff3d3d','#2ef3ff'];
const GSTARMAX=5,GSTAR_K=.2,ASC_CH=29,GSTARMAX6=20,gsMax=it=>it&&it.r>=6?GSTARMAX6:GSTARMAX; // v16-99: Ascended ★1…★20 (every 5 = new color + new stat)
const gStarK=sr=>{sr=sr||0;return sr<=5?1+GSTAR_K*sr:(1+GSTAR_K*5+.05*(sr-5))*Math.pow(1.03,Math.floor((sr-1)/5));}; // +20% main stat per star · Ascended drops from chapter 30
const STI=(k,t)=>'<img class="sti" src="'+(t&&k!=='off'?'img/ui9/star_'+ST_COL[t]:'img/ui8/star_'+k)+'.webp" alt="★">',starsH=(n,asc,all)=>{let h='';if(n>5){const t=Math.min(3,Math.ceil(n/5)-1),w=n-5*t;for(let i=0;i<5;i++)h+=STI(asc?'asc':'on',i<w?t:t-1);return h;}for(let i=0;i<(all?5:n);i++)h+=STI(i<n?(asc?'asc':'on'):'off');return h;};
const ST_COL=['gold','red','purple','rainbow']; // v16-93: Marius' star pictures
const gStars=it=>it.sr?'<span class="gStr">'+starsH(it.sr,it.r>=6)+'</span>':'';
function starFood(it){return GR().inv.filter(o=>o!==it&&o.s===it.s&&o.r===it.r&&!ownerOf(o)).sort((a,b)=>(a.set?1:0)-(b.set?1:0)||(a.sr||0)-(b.sr||0)||a.lv-b.lv)[0]||null;}
const GMAXLV=10,GSUBN=[0,0,1,1,2,2,3],GINV=150;
const GDROP=[[60,30,9,1,0,0],[30,40,22,7,1,0],[10,30,38,18,4,0],[0,15,35,35,14,1],[0,0,25,42,28,5]];
function GR(){const G=TE().G;if(!G.gear)G.gear={inv:[],eq:{},nid:1,kit:0};const g=G.gear;
  if(!g.kit){g.kit=1;['tool','helm','vest'].forEach(s=>g.inv.push(newItem(s,0)));}return g;}
function newItem(s,r,set){const g=TE().G.gear;const st=GS[s].st,others=Object.keys(GSTAT).filter(k=>k!==st),sub=[];
  for(let i=0;i<GSUBN[r];i++){const k=others.splice(Math.floor(Math.random()*others.length),1)[0];sub.push([k,Math.round(GSTAT[k].v[r]*.4*10)/10]);}
  const it={id:g.nid++,s,r,lv:1,sub};if(set)it.set=set;return it;}
// v14: from chapter 6 on the chances keep improving until chapter 50
function gdrop(c){if(c<5)return GDROP[c];const k=Math.min(1,(c-4)/45),A=GDROP[4],Z=[0,0,5,30,45,20];return A.map((v,i)=>Math.round(v+(Z[i]-v)*k));}
const GMAXR=[10,15,20,30,40,50,60],gMax=it=>GMAXR[it.r];
function rollR(c,bump){const w=gdrop(c);let r=Math.random()*100,k=0;for(;k<5;k++){r-=w[k];if(r<0)break;}if(bump&&Math.random()<.5)k++;k=Math.min(5,k);if(k===5&&c>=ASC_CH&&Math.random()<.15*Math.min(1,(c-ASC_CH+1)/21))k=6;return k;}
function dropItem(c,bump){const g=GR();const rr=rollR(c,bump),it=newItem(GSLOT[Math.floor(Math.random()*6)].k,rr,rollSet(rr));if(g.inv.length>=GINV){return {it,sold:salvageV(it)};}g.inv.push(it);return {it};}
const itemById=id=>id?GR().inv.find(i=>i.id===id):null;
const mainV=it=>Math.round(GSTAT[GS[it.s].st].v[it.r]*(1+.12*(it.lv-1))*gStarK(it.sr)*10)/10; // +12% of the base value per level (Lv 50 = ×6.9)
const itemName=it=>it.set&&SETS[it.set]?SETS[it.set].p[GSLOT.indexOf(GS[it.s])]:GNAMES[it.s][it.r];
const upCost=it=>Math.round(150*Math.pow(it.r+1,1.6)*Math.pow(1.4,Math.min(it.lv,10)-1)*Math.pow(1.08,Math.max(0,it.lv-10))/10)*10;
const salvageV=it=>Math.max(1,Math.round(4*Math.pow(it.r+1,1.8)*(1+.5*(it.lv-1))*(1+(it.sr||0)))); // v16-99: salvage gives GEAR PARTS (= old money ÷ 10)
const gpCost=it=>Math.max(1,Math.round(upCost(it)/10)); // v16-99: gear upgrades cost GEAR PARTS, money stays for the garage
const GPN=n=>TE().GPI+' '+TE().nf(n);
function ownerOf(it){const eq=GR().eq;for(const hid in eq)for(const s in eq[hid])if(eq[hid][s]===it.id)return hid;return null;}
function heroGear(hid,ov){const eq=GR().eq[hid]||{},o=[];for(const sl of GSLOT){const it=ov&&(sl.k in ov)?ov[sl.k]:itemById(eq[sl.k]);if(it)o.push(it);}return o;}
const ZB={atk:0,hp:0,def:0,crit:0,aspd:0,en:0};
// ---------------------------------------------------------------- v16-51: HERO SETS (Marius: 6 special pieces per class; every extra piece unlocks a bonus, battle only)
// a set piece is a normal item (any grade from Rare up) with it.set = class key; the bonus counts only on a hero of THAT class
const SETS={
 engine:{n:'Iron Piston',p:['Piston Hammer','Piston Helm','Piston Plate','Hydraulic Fists','Piston Boots','Engine Core'],t:[[['hp',8]],[['def',10]],[['atk',8]],[['hp',10]],[['def',15],['en',15]]]},
 tuning:{n:'Nitro Rush',p:['Nitro Impact Gun','Nitro Racing Helmet','Nitro Racing Vest','Nitro Gloves','Nitro Jet Boots','Nitro Race ECU'],t:[[['atk',8]],[['crit',4]],[['aspd',8]],[['atk',10]],[['crit',6],['aspd',10]]]},
 inspect:{n:'Laser Scope',p:['Laser Scanner','Scope Helmet','Circuit Vest','Laser Gloves','Light-Strip Boots','Scan Crystal'],t:[[['atk',8]],[['crit',4]],[['en',10]],[['atk',10]],[['crit',6],['en',15]]]},
 service:{n:'Field Medic',p:['Healing Wrench','Medic Helmet','Medic Vest','Healing Gloves','Medic Boots','Heart Chip'],t:[[['hp',8]],[['en',10]],[['def',8]],[['hp',10]],[['en',20],['hp',8]]]},
 paint:{n:'Color Storm',p:['Rainbow Spray Gun','Painter Mask','Splash Vest','Dripping Gloves','Splash Boots','Palette Chip'],t:[[['atk',8]],[['en',10]],[['hp',8]],[['atk',10]],[['en',15],['aspd',10]]]},
 elec:{n:'Thunder Coil',p:['Tesla Wrench','Coil Helmet','Battery Vest','Arc Gloves','Spark Boots','Thunder Cell'],t:[[['atk',8]],[['aspd',8]],[['en',10]],[['atk',10]],[['aspd',10],['crit',6]]]},
 all:{n:'Torque King',p:['Royal Scepter','Gear Crown','Royal Armor','Ruby Gauntlets','Gear-Wing Boots','Ruby Core'],t:[[['atk',6]],[['hp',6]],[['def',8]],[['atk',8]],[['hp',10],['en',10]]]}};
const SETK=Object.keys(SETS),SET_MINR=2,SET_CH=.3; // Rare+ items: 30% are set pieces
const rollSet=r=>r>=SET_MINR&&Math.random()<SET_CH?SETK[Math.floor(Math.random()*SETK.length)]:undefined;
function setCount(h,items){const k=roleOf(h);return items.filter(it=>it.set===k).length;}
function setBon(h,items){const b={atk:0,hp:0,def:0,crit:0,aspd:0,en:0},S=SETS[roleOf(h)];if(!S)return b;const n=setCount(h,items);
  S.t.forEach((t,i)=>{if(n>=i+2)t.forEach(([k,v])=>b[k]+=v);});return b;}
const setTierTxt=t=>t.map(([k,v])=>GSTAT[k].n+' +'+v+'%').join(' · ');
function setPcs(k,items){return '<div class="setPc">'+GSLOT.map((sl,i)=>{const on=(items||[]).some(it=>it.set===k&&it.s===sl.k);return `<div class="${on?'on':''}"><img src="img/ui4/st_${k}_${sl.k}.webp" alt=""><small>${SETS[k].p[i]}</small></div>`;}).join('')+'</div>';}
function setBlock(k,n){return '<div class="setBl">'+SETS[k].t.map((t,i)=>`<div class="${n>=i+2?'on':''}"><b>${i+2}</b><span>${setTierTxt(t)}</span><i>${n>=i+2?'✓':'🔒'}</i></div>`).join('')+'</div>';}
// v16-51: HERO COLLECTION = battle bonus (replaces the old Mechanics collection income bonus). Complete a color → all battle heroes get it
const CBON=[[['hp',3]],[['atk',3]],[['def',5]],[['hp',5]],[['atk',6]],[['hp',5],['atk',5],['def',5]]];
let cbK='',cbV=null;
function collInfo(){const T=TE(),L=T.HEROES.filter(h=>h.cat==='m'&&!h.soon);return [0,1,2,3,4,5].map(gr=>{const a=L.filter(h=>h.gr===gr);return {gr,tot:a.length,n:a.filter(h=>T.G.h.disc[h.id]).length};});}
function collBon(){const T=TE(),k=Object.keys(T.G.h.disc).length;if(k===cbK&&cbV)return cbV;const b={atk:0,hp:0,def:0,crit:0,aspd:0,en:0};
  collInfo().forEach(c=>{if(c.tot&&c.n>=c.tot)CBON[c.gr].forEach(([s,v])=>b[s]+=v);});cbK=k;cbV=b;return b;}
function gearBon(items){const b={atk:0,hp:0,def:0,crit:0,aspd:0,en:0};for(const it of items){b[GS[it.s].st]+=mainV(it);for(const [k,v] of it.sub)b[k]+=v;}return b;}
// item picture: rarity glow + drawn glyph
// ---------------------------------------------------------------- v14: item pictures – every grade has its own drawing (36 items)
const IMAT=[{b:'#8d6e57',h:'#c9a68a',l:'#4a3527',a:'#b5562a',t:'#d9c3a5'},{b:'#8fa3a0',h:'#eef6f3',l:'#4d5d59',a:'#43c463',t:'#2e7d32'},{b:'#3f7fd6',h:'#d6ecff',l:'#123a78',a:'#40c4ff',t:'#82b1ff'},
 {b:'#6a3fa6',h:'#e2c6ff',l:'#25103f',a:'#ea5cff',t:'#b388ff'},{b:'#e6a817',h:'#fff6c2',l:'#8a5600',a:'#ff2d55',t:'#ffe082'},{b:'#4a0f14',h:'#ff8a65',l:'#140204',a:'#ff1744',t:'#ffd180'},{b:'#0a5a66',h:'#b8fbff',l:'#02262c',a:'#2ef3ff',t:'#e0fdff'}];
function IA(x,r){const m=IMAT[r];
  const met=(x0,y0,x1,y1,c)=>{c=c||m;const gr=x.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,c.h);gr.addColorStop(.45,c.b);gr.addColorStop(1,c.l);return gr;};
  const P=(pts,close)=>{x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));if(close!==false)x.closePath();};
  const out=(w)=>{x.lineWidth=w||3;x.strokeStyle='rgba(10,6,4,.85)';x.stroke();};
  const shine=(x0,y0,w,h,a)=>{x.save();x.globalAlpha=a||.55;x.fillStyle='#fff';rr(x,x0,y0,w,h,Math.min(w,h)/2);x.fill();x.restore();};
  const gem=(cx,cy,R,col)=>{x.save();x.shadowColor=col;x.shadowBlur=10;x.fillStyle=col;P([[cx,cy-R],[cx+R,cy],[cx,cy+R],[cx-R,cy]]);x.fill();x.restore();out(1.5);x.fillStyle='rgba(255,255,255,.7)';P([[cx,cy-R*.75],[cx+R*.45,cy-R*.1],[cx+R*.05,cy-R*.05]]);x.fill();};
  const spark=(cx,cy,R,col)=>{x.save();x.fillStyle=col||'#fff';x.globalAlpha=.9;P([[cx,cy-R],[cx+R*.22,cy-R*.22],[cx+R,cy],[cx+R*.22,cy+R*.22],[cx,cy+R],[cx-R*.22,cy+R*.22],[cx-R,cy],[cx-R*.22,cy-R*.22]]);x.fill();x.restore();};
  const flame=(cx,cy,w,h,ang)=>{x.save();x.translate(cx,cy);x.rotate(ang||0);for(const [k,c] of [[1,'#ff3d00'],[.72,'#ff9100'],[.42,'#ffe57f']]){x.fillStyle=c;x.beginPath();x.moveTo(-w*k,0);x.quadraticCurveTo(-w*k,-h*k*.6,0,-h*k);x.quadraticCurveTo(w*k,-h*k*.6,w*k,0);x.quadraticCurveTo(0,w*k*.8,-w*k,0);x.fill();}x.restore();};
  const rust=()=>{if(r)return;x.fillStyle='rgba(150,60,20,.55)';for(let i=0;i<9;i++){const a=i*2.4,d=12+i*3.1;circ(x,64+Math.cos(a)*d*.9,64+Math.sin(a)*d*.9,2.2+(i%3));}};
  const glow=()=>{if(r<3)return;x.save();x.globalCompositeOperation='lighter';const g2=x.createRadialGradient(64,64,10,64,64,62);g2.addColorStop(0,m.a+'55');g2.addColorStop(1,m.a+'00');x.fillStyle=g2;x.fillRect(0,0,128,128);x.restore();};
  return {m,met,P,out,shine,gem,spark,flame,rust,glow};}
const IDRAW={
 tool(x,r){const {m,met,P,out,shine,gem,spark,flame,rust,glow}=IA(x,r);glow();
  if(r===3){// impact gun
    x.save();x.translate(64,66);x.rotate(-.12);x.fillStyle=met(0,-30,0,30);rr(x,-40,-26,62,30,10);x.fill();out();x.fillStyle='#1b1b1f';rr(x,-24,0,22,42,6);x.fill();out();
    x.fillStyle=met(0,26,0,48,IMAT[3]);rr(x,-30,36,40,16,5);x.fill();out();x.fillStyle=m.a;x.fillRect(-24,42,8,4);x.fillStyle=met(20,-20,20,0,IMAT[1]);rr(x,20,-20,16,18,3);x.fill();out();
    x.fillStyle='#263238';rr(x,34,-16,14,10,2);x.fill();out(2);shine(-34,-22,40,5);x.fillStyle=m.a;x.fillRect(-36,-8,10,3);x.restore();return;}
  if(r===5){// titan breaker
    x.save();x.translate(64,64);x.rotate(-.7);x.fillStyle=met(-5,0,5,0,IMAT[5]);rr(x,-6,-10,12,62,5);x.fill();out();x.fillStyle='#111';for(let i=0;i<4;i++)x.fillRect(-6,26+i*7,12,3);
      x.fillStyle=met(0,-42,0,-12);rr(x,-34,-44,68,34,8);x.fill();out();x.strokeStyle=m.a;x.lineWidth=2.5;x.shadowColor=m.a;x.shadowBlur=8;x.beginPath();x.moveTo(-26,-38);x.lineTo(-12,-28);x.lineTo(-18,-18);x.moveTo(10,-40);x.lineTo(4,-28);x.lineTo(18,-20);x.stroke();x.shadowBlur=0;
      flame(-30,-30,9,22,-1.4);flame(30,-30,9,22,1.4);x.restore();spark(30,24,7,'#ffd180');spark(100,98,5,'#ff8a65');return;}
  x.save();x.translate(64,64);x.rotate(-.78);
  const L=r===2?96:r===4?84:78,hw=r===2?7:8;
  x.fillStyle=met(-hw,0,hw,0);rr(x,-hw,-L/2+12,hw*2,L-14,hw);x.fill();out();
  if(r===2){x.fillStyle='#212121';rr(x,-hw-1,14,hw*2+2,30,5);x.fill();out(2);x.fillStyle='#fafafa';circ(x,0,-2,11);x.lineWidth=3;x.strokeStyle='#263238';x.stroke();x.strokeStyle='#e53935';x.lineWidth=2;x.beginPath();x.moveTo(0,-2);x.lineTo(6,-8);x.stroke();}
  const head=(y,flip)=>{x.save();x.translate(0,y);if(flip)x.scale(1,-1);
    if(r===4||r===2){x.fillStyle=met(-16,-16,16,16);circ(x,0,-4,16);out();x.fillStyle=m.l;circ(x,0,-4,8);if(r===4)gem(0,-4,7,'#ff1744');else{x.fillStyle='#cfd8dc';circ(x,0,-4,5);}}
    else{x.fillStyle=met(-16,-18,16,6);x.beginPath();x.arc(0,-6,15,0,TAU);x.fill();out();x.save();x.globalCompositeOperation='destination-out';x.fillRect(-6,-24,12,16);x.restore();}
    x.restore();};
  head(-L/2+8);if(r===1)head(L/2-8,1);
  shine(-hw+2,-L/2+16,3,L-30,.45);x.restore();rust();
  if(r===4){spark(28,30,7,'#fff8e1');spark(98,96,5,'#fff8e1');}},
 helm(x,r){const {m,met,P,out,shine,gem,spark,flame,glow}=IA(x,r);glow();
  if(r===5){// crown of gears
    x.fillStyle=met(0,40,0,96,IMAT[4]);P([[22,92],[18,48],[38,66],[50,36],[64,60],[78,36],[90,66],[110,48],[106,92]]);x.fill();out();
    x.fillStyle=m.b;rr(x,20,84,88,16,5);x.fill();out();for(const [cx,cy] of [[18,46],[50,34],[78,34],[110,46]]){x.fillStyle=met(cx-8,cy-8,cx+8,cy+8,IMAT[4]);for(let i=0;i<8;i++){const a=i/8*TAU;x.save();x.translate(cx,cy);x.rotate(a);x.fillRect(-2.5,-9,5,4);x.restore();}circ(x,cx,cy,7);out(2);}
    gem(64,74,9,'#ff1744');gem(38,90,5,'#00e5ff');gem(90,90,5,'#76ff03');flame(64,30,8,20);return;}
  if(r===2){// welding mask
    x.fillStyle=met(30,24,98,104);P([[34,26],[94,26],[102,60],[96,100],[32,100],[26,60]]);x.fill();out();x.fillStyle='#0d1b2a';rr(x,40,48,48,18,4);x.fill();out(2);
    x.save();x.globalAlpha=.6;x.fillStyle='#4fc3f7';rr(x,43,51,20,5,2);x.fill();x.restore();x.fillStyle=m.l;rr(x,50,78,28,14,4);x.fill();x.fillStyle='#000';for(let i=0;i<4;i++)x.fillRect(54+i*6,81,3,8);return;}
  // domes
  const base=r===0?'#7d6b5d':null;x.fillStyle=met(30,24,98,84,r===0?{h:'#b8a690',b:'#7d6b5d',l:'#45392f'}:m);
  x.beginPath();x.moveTo(22,80);x.quadraticCurveTo(22,26,64,24);x.quadraticCurveTo(106,26,106,80);x.closePath();x.fill();out();
  if(r===0){x.fillStyle='#5d4e42';P([[60,80],[112,80],[118,92],[66,92]]);x.fill();out();x.strokeStyle='rgba(255,255,255,.35)';x.setLineDash([3,3]);x.lineWidth=1.5;x.beginPath();x.moveTo(64,26);x.lineTo(64,80);x.stroke();x.setLineDash([]);circ(x,64,25,4);return;}
  x.fillStyle=met(0,78,0,94);rr(x,14,78,100,14,7);x.fill();out();
  if(r===1){x.fillStyle=m.l;rr(x,58,24,12,56,5);x.fill();x.fillStyle='#ffeb3b';rr(x,30,62,68,6,3);x.fill();}
  if(r===3){x.fillStyle='#101418';x.beginPath();x.moveTo(30,62);x.quadraticCurveTo(64,48,98,62);x.lineTo(96,78);x.lineTo(32,78);x.closePath();x.fill();out(2);x.save();x.globalAlpha=.7;x.fillStyle=m.a;rr(x,40,62,40,5,2);x.fill();x.restore();
    x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=1;for(let i=0;i<6;i++){x.beginPath();x.moveTo(38+i*9,30);x.lineTo(30+i*9,58);x.stroke();}}
  if(r===4){x.fillStyle=met(56,8,72,30,IMAT[4]);P([[58,26],[64,6],[70,26]]);x.fill();out(2);x.fillStyle='#c62828';rr(x,60,10,8,22,3);x.fill();gem(64,52,8,'#ff1744');spark(26,30,6,'#fff8e1');}
  shine(36,34,26,6,.5);},
 vest(x,r){const {m,met,P,out,shine,gem,spark,flame,rust,glow}=IA(x,r);glow();
  const body=[[34,18],[48,18],[64,34],[80,18],[94,18],[110,40],[102,56],[96,52],[96,112],[32,112],[32,52],[26,56],[18,40]];
  if(r===0){x.fillStyle=met(32,20,96,112);P([[40,40],[88,40],[92,112],[70,112],[64,84],[58,112],[36,112]]);x.fill();out();x.fillStyle=m.l;rr(x,40,14,8,30,3);x.fill();rr(x,80,14,8,30,3);x.fill();
    x.fillStyle=m.h;rr(x,52,48,24,16,3);x.fill();out(2);x.fillStyle='#c9a227';circ(x,44,42,3.5);circ(x,84,42,3.5);x.fillStyle='rgba(60,40,20,.5)';rr(x,74,86,12,10,2);x.fill();rust();return;}
  x.fillStyle=met(18,18,110,112,r===1?{h:'#e6ff8a',b:'#9ccc28',l:'#4f6b0e'}:m);P(body);x.fill();out();
  x.save();x.globalCompositeOperation='destination-out';P([[48,18],[64,34],[80,18],[72,18],[64,26],[56,18]]);x.fill();x.restore();
  if(r===1){x.fillStyle='#e0e0e0';rr(x,32,70,64,8,2);x.fill();rr(x,32,88,64,8,2);x.fill();x.fillStyle='rgba(0,0,0,.25)';x.fillRect(63,34,2,78);}
  if(r===2){x.strokeStyle=m.l;x.lineWidth=2;for(let i=0;i<4;i++){x.beginPath();x.moveTo(36,52+i*15);x.lineTo(92,52+i*15);x.stroke();}x.fillStyle=m.t;rr(x,48,60,32,22,4);x.fill();out(2);}
  if(r===3){x.fillStyle=met(0,40,0,100,IMAT[2]);for(let i=0;i<3;i++){rr(x,38,44+i*20,52,16,5);x.fill();out(2);}x.fillStyle=met(18,24,40,56);P([[18,40],[34,18],[46,26],[30,56]]);x.fill();out(2);P([[110,40],[94,18],[82,26],[98,56]]);x.fill();out(2);}
  if(r===4){x.fillStyle=met(40,40,88,100,IMAT[4]);P([[40,40],[88,40],[92,80],[64,104],[36,80]]);x.fill();out(2);gem(64,66,10,'#ff1744');spark(28,24,6,'#fff8e1');spark(104,100,5,'#fff8e1');}
  if(r===5){x.fillStyle='#120204';rr(x,40,40,48,60,8);x.fill();out(2);x.save();x.shadowColor='#ff1744';x.shadowBlur=16;x.fillStyle='#ff5252';circ(x,64,64,11);x.fillStyle='#ffd180';circ(x,64,64,5);x.restore();
    x.strokeStyle='#ff6e40';x.lineWidth=3;x.beginPath();x.moveTo(44,86);x.lineTo(84,86);x.moveTo(50,96);x.lineTo(78,96);x.stroke();x.fillStyle=met(10,30,30,60,IMAT[3]);circ(x,22,44,9);out(2);circ(x,106,44,9);out(2);flame(22,36,6,14);flame(106,36,6,14);}
  shine(36,28,6,24,.4);},
 glove(x,r){const {m,met,P,out,shine,gem,spark,flame,glow}=IA(x,r);glow();
  const big=r===5?1.12:1;x.save();x.translate(64,66);x.scale(big,big);x.translate(-64,-66);
  const fill=r===0?met(30,20,98,110,{h:'#f5f0e6',b:'#d8cfbf',l:'#9a8f7c'}):r===1?met(30,20,98,110,{h:'#d7a86e',b:'#8d5a2b',l:'#4a2c12'}):met(30,20,98,110);
  x.fillStyle=fill;for(let i=0;i<4;i++){rr(x,34+i*15,22+Math.abs(i-1.5)*5,13,46,6.5);x.fill();out(2.5);}
  x.save();x.translate(96,70);x.rotate(-.7);rr(x,-7,-24,14,34,7);x.fill();out(2.5);x.restore();
  rr(x,32,54,66,44,12);x.fill();out();x.fillStyle=r===1?'#3e2410':m.l;rr(x,30,92,70,20,6);x.fill();out(2.5);
  if(r===0){x.strokeStyle='rgba(120,100,80,.5)';x.lineWidth=1.5;for(let i=0;i<5;i++){x.beginPath();x.moveTo(34,96+i*3);x.lineTo(98,96+i*3);x.stroke();}}
  if(r===1){x.strokeStyle='#f5deb3';x.setLineDash([3,3]);x.lineWidth=1.5;x.beginPath();x.moveTo(32,94);x.lineTo(98,94);x.stroke();x.setLineDash([]);}
  if(r===2){x.fillStyle=m.l;for(let i=0;i<4;i++)for(let j=0;j<3;j++)circ(x,44+i*13,62+j*10,2.6);}
  if(r===3){x.strokeStyle='#ffee58';x.lineWidth=3;x.shadowColor='#ffee58';x.shadowBlur=8;x.beginPath();x.moveTo(20,34);x.lineTo(30,46);x.lineTo(24,50);x.lineTo(36,64);x.moveTo(108,24);x.lineTo(100,38);x.lineTo(108,40);x.lineTo(98,56);x.stroke();x.shadowBlur=0;x.fillStyle=met(40,60,90,90,IMAT[1]);rr(x,46,64,38,12,4);x.fill();out(2);}
  if(r===4){x.fillStyle=met(0,20,0,60,IMAT[4]);for(let i=0;i<4;i++){rr(x,35+i*15,30+Math.abs(i-1.5)*5,11,10,3);x.fill();out(1.5);}gem(65,74,9,'#ff1744');}
  if(r===5){x.fillStyle='#120204';for(let i=0;i<4;i++){rr(x,35+i*15,46+Math.abs(i-1.5)*3,11,12,3);x.fill();}x.save();x.shadowColor='#ff1744';x.shadowBlur=12;x.fillStyle='#ff5252';for(let i=0;i<4;i++)circ(x,40.5+i*15,52+Math.abs(i-1.5)*3,3);x.restore();}
  x.restore();shine(40,30,4,26,.4);if(r===5){flame(30,40,8,20,-.5);flame(104,40,8,20,.5);}if(r===4)spark(104,26,6,'#fff8e1');},
 boots(x,r){const {m,met,P,out,shine,gem,spark,flame,rust,glow}=IA(x,r);glow();
  const hi=r===0?62:30;const col=r===0?{h:'#ffffff',b:'#d0d6dc',l:'#7c8790'}:r===1?{h:'#c9935a',b:'#8a5a2b',l:'#3e2410'}:m;
  if(r===5)flame(30,98,10,30,-1.9);
  x.fillStyle=met(30,hi,100,108,col);P([[34,hi],[66,hi],[68,74],[100,84],[108,96],[106,104],[28,104],[28,80]]);x.fill();out();
  x.fillStyle=r===0?'#ef5350':r===1?'#2b1a0c':m.l;rr(x,24,100,86,10,4);x.fill();out(2.5);
  if(r<=1){x.strokeStyle=r===0?'#455a64':'#f5deb3';x.lineWidth=2;for(let i=0;i<(r?5:2);i++){x.beginPath();x.moveTo(40,hi+8+i*8);x.lineTo(60,hi+12+i*8);x.stroke();}}
  if(r===2){x.fillStyle=met(80,76,108,104,IMAT[1]);P([[82,80],[100,84],[108,96],[106,102],[82,102]]);x.fill();out(2);}
  if(r===3){x.fillStyle='#fff';P([[36,58],[66,52],[66,60],[36,66]]);x.fill();x.fillStyle=m.a;P([[36,70],[70,62],[72,70],[36,78]]);x.fill();}
  if(r===4){x.fillStyle=met(0,20,0,50,IMAT[4]);P([[30,40],[12,26],[20,48],[10,50],[30,58]]);x.fill();out(2);gem(48,72,7,'#ff1744');spark(100,40,6,'#fff8e1');}
  if(r===5){x.fillStyle='#ff1744';x.save();x.shadowColor='#ff1744';x.shadowBlur=10;rr(x,38,60,22,6,3);x.fill();rr(x,38,74,22,6,3);x.fill();x.restore();x.fillStyle=met(20,80,40,104,IMAT[1]);rr(x,22,82,12,18,3);x.fill();out(2);}
  shine(38,hi+6,5,28,.4);rust();},
 chip(x,r){const {m,met,P,out,shine,gem,spark,flame,glow}=IA(x,r);glow();
  if(r===0){// blade fuse
    x.fillStyle='#b0bec5';rr(x,48,74,10,30,2);x.fill();out(2);rr(x,70,74,10,30,2);x.fill();out(2);x.fillStyle=met(36,30,92,80,{h:'#ffcc80',b:'#ef6c00',l:'#8a3a00'});rr(x,36,30,56,48,8);x.fill();out();
    x.save();x.globalAlpha=.5;x.fillStyle='#fff';rr(x,44,40,40,16,4);x.fill();x.restore();x.strokeStyle='#5d4037';x.lineWidth=2;x.beginPath();x.moveTo(50,48);x.bezierCurveTo(58,40,70,56,78,48);x.stroke();x.fillStyle='#3e2723';x.font='900 14px system-ui';x.textAlign='center';x.fillText('10',64,72);return;}
  const S=r===3?74:62,o=64-S/2;
  if(r===3){x.fillStyle=met(16,16,112,112,{h:'#69f0ae',b:'#1b5e20',l:'#0a2a0e'});rr(x,14,14,100,100,10);x.fill();out();x.strokeStyle='#b2ff59';x.lineWidth=2;x.shadowColor='#b2ff59';x.shadowBlur=6;for(let i=0;i<6;i++){x.beginPath();x.moveTo(18,26+i*16);x.lineTo(40,26+i*16);x.lineTo(48,34+i*12);x.stroke();}x.shadowBlur=0;}
  x.strokeStyle=r>=4?'#ffe082':'#b0bec5';x.lineWidth=3;for(let i=0;i<5;i++){const p=o+8+i*(S-16)/4;x.beginPath();x.moveTo(p,o-8);x.lineTo(p,o);x.moveTo(p,o+S);x.lineTo(p,o+S+8);x.moveTo(o-8,p);x.lineTo(o,p);x.moveTo(o+S,p);x.lineTo(o+S+8,p);x.stroke();}
  x.fillStyle=met(o,o,o+S,o+S,r===1?{h:'#90a4ae',b:'#37474f',l:'#101518'}:r===2?{h:'#90caf9',b:'#1e3a6a',l:'#0a1630'}:m);rr(x,o,o,S,S,6);x.fill();out();
  if(r===1){x.fillStyle='#cfd8dc';x.font='900 13px system-ui';x.textAlign='center';x.fillText('ECU',64,69);x.fillStyle='#78909c';circ(x,o+8,o+8,3);}
  if(r===2){x.fillStyle=met(0,o+6,0,o+S-6,IMAT[1]);for(let i=0;i<6;i++){rr(x,o+7+i*8.5,o+8,5,S-16,2);x.fill();}x.fillStyle='#76ff03';x.shadowColor='#76ff03';x.shadowBlur=8;circ(x,o+S-9,o+S-9,3.5);x.shadowBlur=0;}
  if(r===3){x.fillStyle='#e1bee7';x.font='900 12px system-ui';x.textAlign='center';x.fillText('STAGE 2',64,70);}
  if(r===4){gem(64,64,13,'#ff1744');spark(28,26,6,'#fff8e1');spark(102,102,5,'#fff8e1');}
  if(r===5){x.save();x.shadowColor='#ff1744';x.shadowBlur=18;const g2=x.createRadialGradient(64,64,2,64,64,20);g2.addColorStop(0,'#fff3e0');g2.addColorStop(.4,'#ff6e40');g2.addColorStop(1,'#b71c1c');x.fillStyle=g2;circ(x,64,64,17);x.restore();
    x.strokeStyle='rgba(255,138,101,.9)';x.lineWidth=2;for(const a of [0,1.05,2.1]){x.save();x.translate(64,64);x.rotate(a);x.beginPath();x.ellipse(0,0,34,11,0,0,TAU);x.stroke();x.restore();}spark(30,30,6,'#ffd180');}
  shine(o+6,o+5,S*.5,4,.4);}};
// v15: the 6 gear pictures from the player (same picture for every grade – the grade shows in the frame and the glow)
const ITIMG={};['tool','helm','vest','glove','boots','chip'].forEach(k=>{const i=new Image();i.src='img/ui/it_'+k+'.webp';ITIMG[k]=i;});
const itOK=s=>ITIMG[s]&&ITIMG[s].complete&&ITIMG[s].naturalWidth>0;
// v16-52: Marius' set pictures (7 classes × 6 pieces, img/ui4/st_<class>_<slot>.webp) – a set piece shows its own picture
let stT=0;const stRe=()=>{clearTimeout(stT);stT=setTimeout(()=>{try{if($('cpGear').classList.contains('open'))renderGear();}catch(e){}},150);}; // a set picture arrived → redraw the open HEROES / BAG page once
const STIMG={};function stImg(set,s){const k=set+'_'+s;if(!STIMG[k]){const i=new Image();i.onload=stRe;i.src='img/ui4/st_'+k+'.webp';STIMG[k]=i;}return STIMG[k];}
const stOK=(set,s)=>{const i=stImg(set,s);return i.complete&&i.naturalWidth>0;};
function itemArtCv(s,r,set){if(set&&stOK(set,s)){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');if(r>=3){x.save();x.shadowColor=GGLOW[r];x.shadowBlur=r>=5?18:12;x.drawImage(STIMG[set+'_'+s],6,6,116,116);x.restore();}x.drawImage(STIMG[set+'_'+s],6,6,116,116);return c;}
  return itemArtCv0(s,r);}
function itemArtCv0(s,r){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.lineJoin='round';x.lineCap='round';
  if(itOK(s)){if(r>=3){x.save();x.shadowColor=GGLOW[r];x.shadowBlur=r>=5?18:12;x.drawImage(ITIMG[s],10,10,108,108);x.restore();}x.drawImage(ITIMG[s],10,10,108,108);}else IDRAW[s](x,r);return c;}
function itemIconURL(s,r,set){const key='it'+s+r+(set||'');if(ICC[key])return ICC[key];const ok=set?stOK(set,s):itOK(s);const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  const col=GG(r).c,dk=GG(r).d;const bg=x.createRadialGradient(64,58,6,64,64,96);bg.addColorStop(0,hexC(col,-.15));bg.addColorStop(.45,dk);bg.addColorStop(1,'#07090c');x.fillStyle=bg;x.fillRect(0,0,128,128);
  x.globalAlpha=.18;x.strokeStyle='#fff';x.lineWidth=10;for(let i=0;i<8;i++){x.save();x.translate(64,64);x.rotate(i/8*TAU+.2);x.beginPath();x.moveTo(0,0);x.lineTo(0,-100);x.stroke();x.restore();}x.globalAlpha=1;
  x.save();x.shadowColor='rgba(0,0,0,.75)';x.shadowOffsetY=4;x.shadowBlur=6;x.drawImage(itemArtCv(s,r,set),0,0);x.restore();
  const u=c.toDataURL();if(ok)ICC[key]=u;return u;}
function itemCard(it,extra,cls){const T=TE(),i=Math.min(6,it.r),r=T.FIN[i],p=T.FPL[i];
  return `<div class="gi ${cls||''}${it.r>=6?' asc':''}" data-it="${it.id}"><div class="fc"><img class="ff" src="img/fr${i}.webp">${it.sr?gStars(it):''}<img class="fp" src="${itemIconURL(it.s,it.r,it.set)}" style="left:${r[0]}%;top:${r[1]}%;width:${r[2]}%;height:${r[3]}%"><span class="fs" style="top:${p[0]}%;height:${p[1]}%">Lv ${it.lv}</span>${it.set?`<img class="setB" src="${roleBadge(it.set,48)}" alt="SET">`:''}</div>${extra||''}</div>`;}

// ---------------------------------------------------------------- team helpers
function myMechs(){const T=TE(),o=[];
  for(const id in T.G.h.own){const h=T.HB[id];if(h&&h.cat==='m'&&!h.soon)o.push(h);}
  o.sort((a,b)=>pow(b)-pow(a));return o;}
function stars(h){const o=TE().G.h.own[h.id];return o?o.s:0;}
function roleOf(h){return h.crew?'crew':(h.sp||'all');}
function unitStats(h,ov){const R=ROLE[roleOf(h)],m=h.crew?.85:GMUL[h.gr]*(TE().starK?TE().starK(stars(h),h.gr):1+.2*stars(h))*(TE().heroLvK?TE().heroLvK(h.id):1)/* v16-99: × hero level + ascension */;let b=ZB;if(!h.crew){const its=heroGear(h.id,ov),g1=gearBon(its),g2=setBon(h,its),g3=collBon();b={};for(const k in g1)b[k]=g1[k]+g2[k]+g3[k];}
  return {hp:Math.round(R.hp*m*(1+b.hp/100)),atk:R.atk*m*(1+b.atk/100),def:R.def*(h.crew?1:1+h.gr*.12)*(1+b.def/100),mv:R.mv,rng:R.rng,as:R.as/(1+softCap(b.aspd,60,150)/100),crit:Math.min(.75,R.crit+b.crit/100),eg:1+softCap(b.en,60,120)/100,b};}
// v16-98: Skill charge / Attack speed – full value up to +60%, then they grow slower and never pass +120% / +150% (max gear made ultimates non-stop)
function softCap(x,K,C){return x<=K?x:K+(C-K)*(1-Math.exp(-(x-K)/(C-K)));}
function powS(s,R){return Math.round(s.hp*.25+s.atk*6*(R.as/s.as)*(1+(s.crit-R.crit)*.8)*(1+(s.eg-1)*.25)+s.def*4);}
function pow(h,ov){return powS(unitStats(h,ov),ROLE[roleOf(h)]);}
function crewHero(k){return {id:'crew'+k,crew:true,n:CREW_NAMES[k],gr:0,cat:'m',sp:'crew',f:false};}
function teamHeroes(){const T=TE(),ids=(T.G.cp.team||[]).filter(id=>id.startsWith('crew')||(T.HB[id]&&T.G.h.own[id]));
  return ids.slice(0,5).map(id=>id.startsWith('crew')?crewHero(+id.slice(4)):T.HB[id]);}
function bestTeam(){const m=myMechs().slice(0,5).map(h=>h.id);let k=0;while(m.length<5)m.push('crew'+(k++));return m;}
function teamPower(list){return list.reduce((a,h)=>a+pow(h),0);}
// v15: early bosses are easier (no long wall at the start of the game)
const BEASE=c=>[.42,.55,.68,.8,.8][c]??.72; // v16-40: 2-month test – chapter bosses were walls of 7-13 days (5-20 .9→.8, chapter 6+ 1→.72)
const stEase=i=>{const s=STAGES[i];return s.boss?BEASE(s.c):s.mini?(1+BEASE(s.c))/2:1;};
function enemyPower(i){const s=STAGES[i],k=stageMul(i)*stEase(i);let p=0;s.w.forEach(w=>w.forEach(t=>{const M=MON[t];p+=(M.hp*.25+M.atk*6+M.def*4)*k;}));return Math.round(p/s.w.length*1.05);}
function crewPortrait(k){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
  const bg=g.createRadialGradient(64,48,6,64,64,92);bg.addColorStop(0,'#8d6e63');bg.addColorStop(.6,'#3e2723');bg.addColorStop(1,'#120a06');g.fillStyle=bg;g.fillRect(0,0,128,128);
  g.fillStyle='#ef6c00';g.beginPath();g.ellipse(64,138,56,44,0,0,7);g.fill();g.fillStyle='#263238';g.fillRect(44,100,10,30);g.fillRect(74,100,10,30);
  const sk=['#f1c27d','#e0ac69','#c68642','#ffdbac','#8d5524'][k%5];g.fillStyle=sk;g.fillRect(55,82,18,18);g.beginPath();g.ellipse(64,62,24,28,0,0,7);g.fill();
  g.fillStyle='#212121';g.beginPath();g.ellipse(64,42,27,15,0,Math.PI,0);g.fill();g.fillRect(37,40,54,8);g.fillStyle='#ef6c00';g.fillRect(60,40,30,8);
  g.fillStyle='#1b1b1b';g.beginPath();g.arc(55,64,3,0,7);g.arc(73,64,3,0,7);g.fill();g.strokeStyle='#5d4037';g.lineWidth=3;g.beginPath();g.arc(64,74,7,.2,Math.PI-.2);g.stroke();
  return c;}
const PIMG={};
const TKI='<img src="img/ticket.webp" style="height:1.15em;vertical-align:-.25em" onerror="this.replaceWith(\'🎟\')">';
function portraitURL(h){if(PIMG[h.id])return PIMG[h.id];PIMG[h.id]=h.crew?crewPortrait(+h.id.slice(4)).toDataURL():TE().portrait(h);return PIMG[h.id];}
// returns a drawable picture (canvas, or an image once it has loaded) or null
// v16-6: Marius' sprite sheets (4 frames × 6 rows: idle · walk · attack · skill · hurt/KO · win), cell 192 px
// a = feet anchor, m = where the attack effect leaves the picture (both in 256-px cell coords)
const SPRD={
 m0_0:{a:[134,242],m:[236,106],look:'wrench'},m0_1:{a:[132,244],m:[250,98],look:'oil'},m0_2:{a:[129,243],m:[230,150]},m0_3:{a:[136,244],m:[230,150]},
 m0_4:{a:[132,247],m:[252,130],boom:'fx_paintboom'},m0_5:{a:[133,246],m:[252,114],boom:'fx_paintboom5'},m0_6:{a:[131,247],m:[252,90]},
 m0_7:{a:[131,246],m:[252,94],col:'#ff5252'},m0_8:{a:[125,247],m:[252,118],col:'#ff5252'},m0_9:{a:[131,246],m:[230,150]},
 m1_0:{a:[132,248],m:[230,150]},m1_1:{a:[134,243],m:[230,150]},m1_2:{a:[133,247],m:[250,103],look:'wrench'},m1_3:{a:[118,245],m:[252,178],look:'oil'},m1_4:{a:[126,244],m:[252,98],col:'#b2ff59',boom:'fx_acidboom'},m1_5:{a:[131,248],m:[252,105],col:'#d05cff',boom:'fx_purpleboom'},m1_6:{a:[132,247],m:[252,98],col:'#b2ff59',n:3},m1_7:{a:[126,241],m:[250,120],col:'#b2ff59'},m1_8:{a:[136,246],m:[230,150]},
 m2_0:{a:[132,243],m:[230,150]},m2_1:{a:[128,247],m:[230,150]},m2_2:{a:[132,241],m:[249,107],look:'wrench'},m2_3:{a:[128,249],m:[252,93],col:'#29b6f6',boom:'fx_waterboom'},m2_4:{a:[128,247],m:[252,97],n:3},m2_5:{a:[129,243],m:[252,150]},m2_6:{a:[132,248],m:[252,90],col:'#ff5252'},m2_7:{a:[131,242],m:[230,150]},
 // v16-14 Epic: wide cells (w=384 px of the sheet, the pose can cross the 256-px column). R = rows [idle,walk,attack,skill,hurt/KO,win]
 // hk = separate hurt/KO rows (h = hit, s = stunned, ko = falling sequence)
 // cs = skill frames · lp = leap frames · ld = landing frames (lt s) · ds = dash frames (first ones once, last 2 loop) · noKO = sheet has no hurt/KO row
 m3_0:{w:384,a:[195,248],m:[300,150],R:[0,1,2,3,5,6],lp:[[3,0],[3,1],[3,2],[3,3]],ld:[[4,0],[4,1],[4,2],[4,3]],lt:.6},
 m3_1:{w:384,a:[194,249],m:[300,100],look:'wrench'},
 m3_2:{w:384,a:[205,248],m:[312,102],col:'#d05cff',boom:'fx_purpleboom',R:[0,1,2,3,0,5],cs:[[3,1],[3,2],[3,3],[4,0],[4,1]],hk:{h:[6,1],s:[7,0],ko:[[6,2],[6,3],[7,1],[7,2],[7,3]]}},
 m3_3:{w:384,a:[184,250],m:[312,130],col:'#d05cff'},
 m3_4:{w:384,a:[201,248],m:[312,142],col:'#e040fb',R:[0,1,3,4,5,6]},
 m3_5:{w:384,a:[183,249],m:[300,150]},
 m3_6:{w:384,a:[203,248],m:[300,150],R:[0,1,2,3,5,6],ds:[[3,0],[3,1],[3,2],[4,0],[4,1]],boom:'fx_ninaboom',dboom:1},
 // v16-14: Legendary + Mythic (cs = skill frames; the frames with other people / cut boxes in the sheets are not used)
 m4_0:{a:[198.7,246],m:[300,150],fx:'quake',v8:{cw:299,uw:398.7,ax:198.7,ck:5,pk:[5,6,7],rows:[[0,202,269.3,264.0],[202,176,234.7,229.3],[378,186,248.0,242.7],[564,209,278.7,273.3],[773,177,236.0,230.7],[950,190,253.3,249.3]]},fx8:{cw:314,uw:418.7,ax:206.7,rows:[[0,309,412.0,393.3]]}}, // v16-95: GRIGORE – 8 frames (tools/v8_hero.py m4_0); ck = cast frames 0-4 (smash = impact), quake wall = fxs frames
m4_1:{a:[134.7,246],m:[253,71],look:'wrench',fx:'holy',v8:{cw:210,uw:280.0,ax:134.7,ck:4,pk:[4,5,6,7],rows:[[0,195,260.0,256.0],[195,189,252.0,248.0],[384,190,253.3,248.0],[574,286,381.3,358.7],[860,198,264.0,258.7],[1058,208,277.3,272.0]]},fx8:{cw:158,uw:210.7,ax:105.3,rows:[[0,253,337.3,325.3]]}}, // v16-96: MAMA ROSA – 8 frames (tools/v8_hero.py m4_1); ck = pray → wrench raised, pk = golden sweep → idle; holy pillar = fxs frames on every healed ally
 m4_2:{a:[136.0,246],m:[300,150],col:'#d05cff',fx:'vortex',v8:{cw:240,uw:320.0,ax:136.0,rows:[[0,195,260.0,256.0],[195,189,252.0,246.7],[384,188,250.7,245.3],[572,196,261.3,249.3],[768,191,254.7,249.3],[959,205,273.3,268.0]],ck:5,pk:[5,6,7]},fx8:{cw:205,uw:273.3,ax:136.0,rows:[[0,240,320.0,289.3]]}}, // v16-96: DUKE DIAMOND – 8 frames (tools/v8_hero.py m4_2); ck = cast frames 0-4 (frame 5 = beam), pk = recoil after; vortex = fxs frames, frame 5 = crystal freeze
m4_3:{a:[119,246],m:[250,117],col:'#ffd54a',cs:[[3,1],[3,2],[3,3]],fx:'cloud'},
 m4_4:{a:[124,247],m:[250,118],col:'#ffd21a',cs:[[3,0],[3,1],[3,2],[3,3]],fx:'hglass'},m4_5:{a:[135,247],m:[230,150],fire:1},
 m5_0:{a:[210.7,246],m:[316.7,150],v8:{cw:316,uw:421.3,ax:210.7,rows:[[0,206,274.7,269.3],[206,187,249.3,245.3],[393,199,265.3,257.3],[592,302,402.7,384],[894,196,261.3,256],[1090,222,296,290.7]]},fx8:{cw:307,uw:409.3,ax:205.3,rows:[[0,240,320,298.7]]}}, // v16-94: THE TORQUE KING – 8 frames per animation (tools/v8_hero.py)
m5_1:{a:[193.3,246],m:[300,150],fire:1,v8:{cw:286,uw:381.3,ax:193.3,ck:4,dsh:[4,5],rows:[[0,197,262.7,258.7],[197,183,244.0,238.7],[380,171,228.0,221.3],[551,223,297.3,286.7],[774,187,249.3,244.0],[961,206,274.7,269.3]]},fx8:{cw:286,uw:381.3,ax:190.7,rows:[[0,186,248.0,237.3]]}}, // v16-95: LADY OVERDRIVE – 8 frames (tools/v8_hero.py m5_1); ck = cast frames 0-3, dsh = dash frames
 // v16-21: Drivers (map only, not in battle). Rows: 0 idle · 1 walk · 2 run · 3 scooter · 4 signature move · 5 tip
 d0_0:{w:384,a:[193,248],m:[300,150]},d0_1:{w:384,a:[197,248],m:[300,150]},d0_2:{w:384,a:[200,248],m:[300,150]},d0_3:{w:384,a:[202,248],m:[300,150]},
 d0_4:{w:384,a:[190,248],m:[300,150]},d0_5:{w:384,a:[180,248],m:[300,150]},d0_6:{w:384,a:[193,248],m:[300,150]},
 // v16-22: Uncommon drivers (tools/atlas_drivers.py keeps the dark-emerald accents; Gina rows 4-5 rescaled by tools/fix_d1_2_gina.py)
 d1_0:{w:384,a:[196,248],m:[300,150]},d1_1:{w:384,a:[181,248],m:[300,150]},d1_2:{w:384,a:[192,248],m:[300,150]},d1_3:{w:384,a:[185,248],m:[300,150]},d1_4:{w:384,a:[186,248],m:[300,150]},d1_5:{w:384,a:[195,248],m:[300,150]},
 // v16-23: Rare drivers (tools/atlas_rare.py: full green unmix; Fiona row 4 split pose | speed streak)
 d2_0:{w:384,a:[177,248],m:[300,150]},d2_1:{w:384,a:[192,248],m:[300,150]},d2_2:{w:384,a:[171,248],m:[300,150]},d2_3:{w:384,a:[175,248],m:[300,150]},d2_4:{w:384,a:[188,248],m:[300,150]},
 // v16-24: Epic drivers (atlas_rare.py + fix_closeup.py for close-up row 4, fade_cell.py for Nova's burst)
 d3_0:{w:384,a:[173,248],m:[300,150]},d3_1:{w:384,a:[195,248],m:[300,150]},d3_2:{w:384,a:[172,248],m:[300,150]},d3_3:{w:384,a:[169,248],m:[300,150]},d3_4:{w:384,a:[170,248],m:[300,150]},
 // v16-28: Legendary drivers (atlas_rare.py; Clutch row 4 = rebuild_row.py, 5 glued poses -> 4; fix_closeup.py; fix_d4_3_phantom.py; clean_bits.py)
 d4_0:{w:384,a:[178,248],m:[300,150]},d4_1:{w:384,a:[195,248],m:[300,150]},d4_2:{w:384,a:[188,248],m:[300,150]},d4_3:{w:384,a:[171,248],m:[300,150]},
 // v16-29: Mythic drivers (rebuild_row.py + fix_closeup.py --blend for row 4, fade_cell.py, fix_red_tint.py)
 d5_0:{w:384,a:[176,248],m:[300,150]},d5_1:{w:384,a:[193,248],m:[300,150]},
 // v16-30: Common guards (map only, not in battle). Rows: 0 idle · 1 walk · 2 run · 3 catch · 4 signature move · 5 reward
 g0_0:{w:384,a:[202,248],m:[300,150]},g0_1:{w:384,a:[207,248],m:[300,150]},g0_2:{w:384,a:[202,248],m:[300,150]},g0_3:{w:384,a:[199,248],m:[300,150]},g0_4:{w:384,a:[204,248],m:[300,150]},g0_5:{w:384,a:[195,248],m:[300,150]},g0_6:{w:384,a:[200,248],m:[300,150]},
 // v16-31: Uncommon guards (atlas_drivers.py keeps the dark-emerald accents + tools/fix_green_pockets.py; Sid's siren glow from atlas_rare.py)
 g1_0:{w:384,a:[202,248],m:[300,150]},g1_1:{w:384,a:[204,248],m:[300,150]},g1_2:{w:384,a:[206,248],m:[300,150]},g1_3:{w:384,a:[206,248],m:[300,150]},g1_4:{w:384,a:[198,248],m:[300,150]},g1_5:{w:384,a:[206,248],m:[300,150]},
 // v16-32: Rare guards (atlas_rare.py, clean – blue glows semi-transparent)
 g2_0:{w:384,a:[208,248],m:[300,150]},g2_1:{w:384,a:[200,248],m:[300,150]},g2_2:{w:384,a:[203,248],m:[300,150]},g2_3:{w:384,a:[204,248],m:[300,150]},g2_4:{w:384,a:[204,248],m:[300,150]},
 // v16-33: Epic guards (atlas_rare.py + tools/fix_purple_halo.py: grey-blue halo around the purple glows -> purple)
 g3_0:{w:384,a:[207,248],m:[300,150]},g3_1:{w:384,a:[201,248],m:[300,150]},g3_2:{w:384,a:[206,248],m:[300,150]},g3_3:{w:384,a:[201,248],m:[300,150]},g3_4:{w:384,a:[205,248],m:[300,150]},
 // v16-34: Legendary guards (atlas_rare.py + tools/fix_gold_halo.py: lemon glow -> gold, Gabriel's ghost frame without the brown cloud)
 g4_0:{w:384,a:[209,248],m:[300,150]},g4_1:{w:384,a:[198,248],m:[300,150]},g4_2:{w:384,a:[213,248],m:[300,150]},g4_3:{w:384,a:[204,248],m:[300,150]},
 // v16-35: Mythic guards (fix_red_tint.py rows 2-5, fade_cell.py The Wall hex wall) + 6 thieves t0..t5 (map only)
 g5_0:{w:384,a:[195,248],m:[300,150]},g5_1:{w:384,a:[213,248],m:[300,150]},t0:{w:384,a:[197,248],m:[300,150]},t1:{w:384,a:[181,248],m:[300,150]},t2:{w:384,a:[195,248],m:[300,150]},t3:{w:384,a:[198,248],m:[300,150]},t4:{w:384,a:[195,248],m:[300,150]},t5:{w:384,a:[199,248],m:[300,150]}};
const FXIM={};for(const k of['quake','holy','vortex','cloud','hglass','gearboom']){FXIM[k]=new Image();FXIM[k].src='img/hero/fx_'+k+'.webp';}
const fxOK=k=>FXIM[k]&&FXIM[k].complete&&FXIM[k].naturalWidth>0;
const SPK=.37,SPCELL=192;
// v16-25: atlases load only when a hero/driver is actually drawn (before: ALL ~95 atlases were decoded at startup ≈ 290 MB of memory)
for(const id in SPRD)SPRD[id].id=id;
function sprLoad(d){if(!d.im){d.im=new Image();d.im.decoding='async';d.im.src='img/hero/sp_'+d.id+'.webp';if(d.boom){d.bi=new Image();d.bi.src='img/hero/'+d.boom+'.webp';}if(d.fx8){d.fi=new Image();d.fi.decoding='async';d.fi.src='img/hero/fxs_'+d.id+'.webp';}}return d.im;}
// v16-94: draws frame (r,c) of a sprite at the feet point (0,0), k = screen units per 256-cell unit. v8 = 8 frames per row, each row its own height
function sprBlit(X,d,r,c,k){const v=d.v8;if(v){const R=v.rows[r];X.drawImage(d.im,c*v.cw,R[0],v.cw,R[1],-v.ax*k,-R[3]*k,v.uw*k,R[2]*k);return;}
  const w=d.w||256,cw=w*SPCELL/256;X.drawImage(d.im,c*cw,r*SPCELL,cw,SPCELL,-d.a[0]*k,-d.a[1]*k,w*k,256*k);}
// v16-94: frame of an 8-frame hero (rows idle·run·attack·skill·hit/KO·win)
function sprFrame8(u,t){const a=u.act;
  if(u.dead)return[4,Math.min(7,4+Math.floor(u.deadT/.13))];
  const v=u.spr.v8;
  if(a&&a.k==='dash'&&!a.back&&v.dsh)return[3,v.dsh[Math.floor(t*16)%v.dsh.length]]; // v16-95: Lady's dash = her own blurred skill frames
  if(a&&(a.k==='leap'||a.k==='dash'))return[1,Math.floor(t*14)%8];
  if(a&&a.k==='cast'){const n=v.ck||8;return[3,Math.min(n-1,Math.floor(a.t/a.dur*n))];}
  if(u.post>0&&v.pk)return[3,v.pk[Math.min(v.pk.length-1,Math.floor((1-u.post/.6)*v.pk.length))]]; // v16-95: frames after the cast (Grigore: dust → shield)
  if(u.land>0)return[3,7];
  if(u.st==='atk')return[2,Math.min(7,Math.floor(u.ap*8))];
  if(u.stun>0)return[4,2];
  if(u.hurt>.35)return[4,1];
  if(u.st==='walk'||u.st==='run')return[1,Math.floor(u.wph/TAU*8+80)%8];
  if(u.st==='win')return[5,Math.floor(t*8+u.k)%8];
  return[0,Math.floor(t*8+u.k*3)%8];}
const sprOf=h=>h&&!h.crew&&SPRD[h.id]||null;
const sprOK=d=>{if(!d)return false;const im=sprLoad(d);return im.complete&&im.naturalWidth>0;};
// muzzle: [x, y] on screen where a ranged attack / skill effect starts (continues the effect drawn in the picture)
function muzzle(u,dx,dy){const d=u.spr,k=dsc(u.d);if(!sprOK(d))return[u.x+u.face*dx*S,fy(u.d)-(u.lift||0)-dy*k];
  return[u.x+u.face*(d.m[0]-d.a[0])*SPK*k,fy(u.d)-(u.lift||0)-(d.a[1]-d.m[1])*SPK*k];}
function sprFrame(u,t){if(u.spr.v8)return sprFrame8(u,t);const a=u.act,d=u.spr,R=d.R||[0,1,2,3,4,5];
  if(u.dead){if(d.hk){const k=d.hk.ko;return k[Math.min(k.length-1,Math.floor(u.deadT/.12))];}return d.noKO?[R[0],0]:[R[4],u.deadT<.25?2:3];}
  if(a&&a.k==='leap'){const k=a.t/a.dur;if(d.lp)return d.lp[Math.min(d.lp.length-1,Math.floor(k*d.lp.length))];return[R[3],k<.2?0:k<.55||u.h.id==='m0_2'?1:2];} // Tom: his falling frame has a backpack he never wears → keep the jump frame
  if(a&&a.k==='dash'){if(a.back)return[R[1],Math.floor(u.wph/TAU*4+40)%4];
    if(d.ds){const n0=d.ds.length-2,i=Math.floor(a.t/.06);return d.ds[i<n0?i:n0+(i-n0)%2];}
    return[R[3],a.t<.09?0:1+Math.floor(a.t/.06)%2];}
  const cs=d.cs,cn=cs?cs.length:d.n||(u.role==='paint'?3:4);
  if(a&&a.k==='cast'){const i=Math.min(cn-1,Math.floor(a.t/a.dur*cn));return cs?cs[i]:[R[3],i];}
  if(u.land>0){if(d.ld){const lt=d.lt||.32;return d.ld[Math.min(d.ld.length-1,Math.floor((1-u.land/lt)*d.ld.length))];}return cs?cs[cn-1]:[R[3],cn-1];}
  if(u.st==='atk')return[R[2],u.ap<.25?0:u.ap<.5?1:u.ap<.75?2:3];
  if(u.stun>0)return d.hk?d.hk.s:d.noKO?[R[0],0]:[R[4],1];
  if(u.hurt>.35)return d.hk?d.hk.h:d.noKO?[R[0],0]:[R[4],0];
  if(u.st==='walk'||u.st==='run')return[R[1],Math.floor(u.wph/TAU*4+40)%4];
  if(u.st==='win')return[R[5],Math.floor(t*5+u.k)%4];
  return[R[0],Math.floor(t*4+u.k*3)%4];}
function drawSprHero(g,u,t,d,alpha){const [r,c]=sprFrame(u,t);
  g.save();g.scale(u.face,1);
  const k=SPK; // units per 256-cell px
  if(d.noKO&&u.dead)g.rotate(-Math.min(1,u.deadT*2.2)*Math.PI/2*.92); // no KO picture → falls over
  g.globalAlpha=alpha*GA;sprBlit(g,d,r,c,k);
  g.restore();}
function portraitCv(h){const k='cv'+h.id;if(PIMG[k])return PIMG[k].complete===false||PIMG[k].naturalWidth===0?null:PIMG[k];
  if(h.crew)return PIMG[k]=crewPortrait(+h.id.slice(4));const im=new Image();im.src=TE().portrait(h);PIMG[k]=im;return null;}

// ---------------------------------------------------------------- drawing helpers
function rr(g,x,y,w,h,r){r=Math.min(r,Math.abs(w)/2,Math.abs(h)/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function circ(g,x,y,r){g.beginPath();g.arc(x,y,Math.max(.1,r),0,TAU);g.fill();}
function ell(g,x,y,rx,ry){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);g.fill();}
function hexC(h,t){return TE().shade(h,t);}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function metal(g,y0,y1,c0,c1,c2){const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,c0);gr.addColorStop(.45,c1);gr.addColorStop(1,c2);return gr;}
// ---------------------------------------------------------------- icons (drawn, no emoji)
const ICC={};
function glyph(x,k,c){// draws glyph k in a 64x64 box, color c
  x.save();x.fillStyle=c;x.strokeStyle=c;x.lineCap='round';x.lineJoin='round';
  const P=(pts)=>{x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fill();};
  if(k==='cog'){x.beginPath();for(let i=0;i<16;i++){const a=i/16*TAU,r=i%2?17:23;x.lineTo(32+Math.cos(a)*r,32+Math.sin(a)*r);}x.closePath();x.fill();x.globalCompositeOperation='destination-out';circ(x,32,32,7);x.globalCompositeOperation='source-over';}
  else if(k==='flag'){x.lineWidth=4;x.beginPath();x.moveTo(17,54);x.lineTo(17,10);x.stroke();for(let r=0;r<4;r++)for(let q=0;q<4;q++){if((r+q)%2)continue;x.fillRect(19+q*8,12+r*7+Math.sin(q)*1.5,8,7);}x.lineWidth=2;x.strokeRect(19,12,32,28);}
  else if(k==='scan'){x.lineWidth=6;x.beginPath();x.arc(27,27,14,0,TAU);x.stroke();x.lineWidth=9;x.beginPath();x.moveTo(38,38);x.lineTo(52,52);x.stroke();x.globalAlpha=.35;circ(x,27,27,10);x.globalAlpha=1;}
  else if(k==='wrench'||k==='tool'){x.save();x.translate(32,32);x.rotate(-.78);x.fillRect(-4.5,-6,9,30);x.beginPath();x.arc(0,-14,12,0,TAU);x.fill();x.globalCompositeOperation='destination-out';x.fillRect(-4.5,-30,9,16);x.globalCompositeOperation='source-over';circ(x,0,22,5.5);x.restore();}
  else if(k==='brush'){rr(x,20,22,22,32,5);x.fill();x.fillRect(25,14,12,9);x.fillRect(29,9,5,6);x.globalAlpha=.6;for(let i=0;i<5;i++)circ(x,44+i*3,10+((i*7)%9),1.8);x.globalAlpha=1;x.globalCompositeOperation='destination-out';x.fillRect(23,30,16,3);x.globalCompositeOperation='source-over';}
  else if(k==='bolt'||k==='energy'){P([[36,6],[16,36],[30,36],[25,58],[48,26],[34,26],[42,6]]);}
  else if(k==='star'){x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i/10*TAU,r=i%2?10:24;x.lineTo(32+Math.cos(a)*r,33+Math.sin(a)*r);}x.closePath();x.fill();}
  else if(k==='nut'){x.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+Math.PI/6;x.lineTo(32+Math.cos(a)*22,32+Math.sin(a)*22);}x.closePath();x.fill();x.globalCompositeOperation='destination-out';circ(x,32,32,9);x.globalCompositeOperation='source-over';}
  else if(k==='skull'){x.beginPath();x.arc(32,28,19,Math.PI,0);x.lineTo(51,36);x.quadraticCurveTo(51,44,43,45);x.lineTo(43,53);x.lineTo(21,53);x.lineTo(21,45);x.quadraticCurveTo(13,44,13,36);x.closePath();x.fill();
    x.globalCompositeOperation='destination-out';x.beginPath();x.ellipse(24,32,5.5,6.5,0,0,TAU);x.ellipse(40,32,5.5,6.5,0,0,TAU);x.fill();P([[32,38],[28,45],[36,45]]);for(let i=0;i<3;i++)x.fillRect(25+i*6,48,2.5,6);x.globalCompositeOperation='source-over';}
  else if(k==='horns'){x.beginPath();x.moveTo(12,12);x.quadraticCurveTo(14,30,24,32);x.lineTo(20,24);x.closePath();x.fill();x.beginPath();x.moveTo(52,12);x.quadraticCurveTo(50,30,40,32);x.lineTo(44,24);x.closePath();x.fill();
    x.beginPath();x.ellipse(32,38,17,17,0,0,TAU);x.fill();x.globalCompositeOperation='destination-out';P([[20,33],[29,37],[21,40]]);P([[44,33],[35,37],[43,40]]);x.fillRect(24,46,16,4);x.globalCompositeOperation='source-over';}
  else if(k==='swords'){x.lineWidth=5;for(const s of[-1,1]){x.save();x.translate(32,32);x.rotate(s*.785);x.beginPath();x.moveTo(0,-24);x.lineTo(0,14);x.stroke();x.lineWidth=4;x.beginPath();x.moveTo(-8,14);x.lineTo(8,14);x.stroke();x.lineWidth=5;x.beginPath();x.moveTo(0,16);x.lineTo(0,23);x.stroke();x.restore();}}
  else if(k==='bag'){rr(x,14,20,36,34,8);x.fill();x.lineWidth=5;x.beginPath();x.arc(32,20,9,Math.PI,0);x.stroke();x.globalCompositeOperation='destination-out';x.fillRect(14,32,36,3);x.globalCompositeOperation='source-over';rr(x,27,29,10,9,2);x.fill();}
  else if(k==='helm'){x.beginPath();x.moveTo(10,42);x.quadraticCurveTo(10,14,32,13);x.quadraticCurveTo(54,14,54,42);x.closePath();x.fill();rr(x,6,40,52,8,4);x.fill();x.globalCompositeOperation='destination-out';x.fillRect(29,14,6,26);x.globalCompositeOperation='source-over';}
  else if(k==='vest'){P([[20,10],[27,10],[32,22],[37,10],[44,10],[54,20],[50,30],[46,28],[46,56],[18,56],[18,28],[14,30],[10,20]]);x.globalCompositeOperation='destination-out';x.fillRect(18,38,28,4);x.fillRect(30,24,4,32);x.globalCompositeOperation='source-over';}
  else if(k==='glove'){rr(x,18,26,28,28,8);x.fill();for(let i=0;i<4;i++){rr(x,19+i*7,10+Math.abs(i-1.5)*2,6,22,3);x.fill();}x.save();x.translate(46,36);x.rotate(-.6);rr(x,-3,-12,7,18,3);x.fill();x.restore();x.globalCompositeOperation='destination-out';x.fillRect(18,46,28,3);x.globalCompositeOperation='source-over';}
  else if(k==='boots'){P([[20,8],[34,8],[34,38],[52,44],[54,54],[16,54],[16,42],[20,38]]);x.globalCompositeOperation='destination-out';x.fillRect(16,48,40,2.5);x.fillRect(20,20,14,2.5);x.fillRect(20,27,14,2.5);x.globalCompositeOperation='source-over';}
  else if(k==='chip'){rr(x,16,16,32,32,4);x.fill();x.lineWidth=3;for(let i=0;i<4;i++){const p=21+i*7.3;x.beginPath();x.moveTo(p,8);x.lineTo(p,16);x.moveTo(p,48);x.lineTo(p,56);x.moveTo(8,p);x.lineTo(16,p);x.moveTo(48,p);x.lineTo(56,p);x.stroke();}x.globalCompositeOperation='destination-out';rr(x,23,23,18,18,2);x.fill();x.globalCompositeOperation='source-over';P([[33,25],[26,33],[31,33],[29,40],[37,30],[32,30]]);}
  else if(k==='heart'){x.beginPath();x.moveTo(32,54);x.bezierCurveTo(4,36,8,10,24,12);x.quadraticCurveTo(30,13,32,20);x.quadraticCurveTo(34,13,40,12);x.bezierCurveTo(56,10,60,36,32,54);x.fill();}
  else if(k==='atk'){x.save();x.translate(32,32);x.rotate(.785);P([[0,-27],[5,-19],[5,12],[-5,12],[-5,-19]]);x.fillRect(-12,12,24,5);x.fillRect(-3,17,6,10);x.restore();}
  else if(k==='shield'){x.beginPath();x.moveTo(32,8);x.lineTo(52,15);x.quadraticCurveTo(52,44,32,56);x.quadraticCurveTo(12,44,12,15);x.closePath();x.fill();x.globalCompositeOperation='destination-out';x.beginPath();x.moveTo(32,16);x.lineTo(32,48);x.quadraticCurveTo(45,40,45,20);x.closePath();x.globalAlpha=.4;x.fill();x.globalCompositeOperation='source-over';x.globalAlpha=1;}
  else if(k==='crit'){x.lineWidth=5;x.beginPath();x.arc(32,32,18,0,TAU);x.stroke();circ(x,32,32,6);x.lineWidth=4;x.beginPath();x.moveTo(32,6);x.lineTo(32,16);x.moveTo(32,48);x.lineTo(32,58);x.moveTo(6,32);x.lineTo(16,32);x.moveTo(48,32);x.lineTo(58,32);x.stroke();}
  else if(k==='aspd'){for(let i=0;i<3;i++)P([[10+i*15,14],[24+i*15,32],[10+i*15,50],[16+i*15,50],[30+i*15,32],[16+i*15,14]]);}
  else if(k==='flame'){x.beginPath();x.moveTo(33,5);x.bezierCurveTo(44,18,52,28,51,41);x.bezierCurveTo(50,53,42,59,32,59);x.bezierCurveTo(21,59,13,52,13,41);x.bezierCurveTo(13,31,20,25,24,16);x.quadraticCurveTo(27,28,33,29);x.quadraticCurveTo(29,17,33,5);x.fill();
    x.globalCompositeOperation='destination-out';x.beginPath();x.moveTo(32,34);x.bezierCurveTo(40,42,40,52,32,53);x.bezierCurveTo(24,52,24,42,32,34);x.globalAlpha=.55;x.fill();x.globalAlpha=1;x.globalCompositeOperation='source-over';}
  else if(k==='snow'){x.lineWidth=5;for(let i=0;i<3;i++){x.save();x.translate(32,32);x.rotate(i*Math.PI/3);x.beginPath();x.moveTo(0,-25);x.lineTo(0,25);x.moveTo(-7,-19);x.lineTo(0,-12);x.lineTo(7,-19);x.moveTo(-7,19);x.lineTo(0,12);x.lineTo(7,19);x.stroke();x.restore();}}
  else if(k==='clock'){P([[15,7],[49,7],[49,14],[37,32],[49,50],[49,57],[15,57],[15,50],[27,32],[15,14]]);x.globalCompositeOperation='destination-out';P([[21,13],[43,13],[32,27]]);P([[32,40],[42,51],[22,51]]);x.globalAlpha=.45;x.fillRect(31,27,2,14);x.globalAlpha=1;x.globalCompositeOperation='source-over';}
  else if(k==='pause'){rr(x,18,14,10,36,3);x.fill();rr(x,36,14,10,36,3);x.fill();}
  else if(k==='play'){P([[20,12],[50,32],[20,52]]);}
  else if(k==='lock'){rr(x,15,28,34,26,5);x.fill();x.lineWidth=6;x.beginPath();x.arc(32,28,10,Math.PI,0);x.stroke();}
  else if(k==='coin'){circ(x,32,32,22);x.globalCompositeOperation='destination-out';x.lineWidth=3;x.beginPath();x.arc(32,32,16,0,TAU);x.stroke();x.globalCompositeOperation='source-over';x.font='900 24px system-ui';x.textAlign='center';x.textBaseline='middle';x.globalCompositeOperation='destination-out';x.fillText('$',32,33);x.globalCompositeOperation='source-over';}
  x.restore();}
// badge: round medal with glyph (cached)
function badgeCv(k,col,sz){const key=k+col+sz;if(ICC[key])return ICC[key];const c=document.createElement('canvas');c.width=c.height=sz;const x=c.getContext('2d');x.scale(sz/64,sz/64);
  const gr=x.createLinearGradient(0,4,0,60);gr.addColorStop(0,hexC(col,.35));gr.addColorStop(.55,col);gr.addColorStop(1,hexC(col,-.45));
  x.fillStyle='#0b0704';circ(x,32,32,31);x.fillStyle=gr;circ(x,32,32,28);x.fillStyle='rgba(255,255,255,.25)';x.beginPath();x.ellipse(32,20,20,10,0,0,TAU);x.fill();
  x.save();x.translate(32,32);x.scale(.62,.62);x.translate(-32,-30);x.shadowColor='rgba(0,0,0,.55)';x.shadowOffsetY=3;x.shadowBlur=2;glyph(x,k,'#fff');x.restore();
  return ICC[key]=c;}
function badge(k,col,sz){const key='u'+k+col+(sz||64);if(ICC[key])return ICC[key];return ICC[key]=badgeCv(k,col,sz||64).toDataURL();}
// plain glyph image (for buttons)
function glyphURL(k,col,sz){sz=sz||64;const key='g'+k+col+sz;if(ICC[key])return ICC[key];const c=document.createElement('canvas');c.width=c.height=sz;const x=c.getContext('2d');x.scale(sz/64,sz/64);
  x.shadowColor='rgba(0,0,0,.6)';x.shadowOffsetY=2;x.shadowBlur=2;glyph(x,k,col);return ICC[key]=c.toDataURL();}
const IMGI=(src,h,va)=>`<img src="${src}" style="height:${h||'1.2em'};vertical-align:${va||'-.28em'}">`;
const ROLECOL={engine:'#ff7043',tuning:'#29b6f6',inspect:'#3d7cf0',service:'#00a58e',paint:'#e0457b',elec:'#18b26b',all:'#ffb300',crew:'#ef6c00'};
const ROLEGL={engine:'cog',tuning:'flag',inspect:'scan',service:'wrench',paint:'brush',elec:'bolt',all:'star',crew:'nut'};
// v16-52: Marius' class icons with the English name (img/ui4/cls_<class>.webp); Crew keeps the drawn badge
// v16-53: CREW (Rookie) has its own class icon too (img/ui5/cls_crew.webp)
const CLSU=k=>k==='crew'?'img/ui5/cls_crew.webp':'img/ui4/cls_'+k+'.webp';
const CLSI={};['engine','tuning','inspect','service','paint','elec','all','crew'].forEach(k=>{const i=new Image();i.src=CLSU(k);CLSI[k]=i;});
const roleBadge=(r,sz)=>CLSI[r]?CLSU(r):badge(ROLEGL[r],ROLECOL[r],sz||64);
const roleBadgeCv=r=>CLSI[r]&&CLSI[r].complete&&CLSI[r].naturalWidth?CLSI[r]:badgeCv(ROLEGL[r],ROLECOL[r],64);

// ---------------------------------------------------------------- hero look
function lookOf(h){const T=TE();let sd=hash(h.id)||1;const R=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
  const skin=T.SKINS[Math.floor(R()*T.SKINS.length)];const hairs=h.gr>=4?['#1b1b1b','#e8e8e8','#8d6e63','#d7b26a','#b71c1c']:T.HAIRS;const hair=hairs[Math.floor(R()*hairs.length)];
  let suit,cap;const r=roleOf(h);
  if(r==='crew'){suit='#ef6c00';cap='#212121';}else if(r==='all'){suit='#1b1b1b';cap='#ffd54a';}else{suit=T.ST[r].suit;cap=T.ST[r].cap;}
  return {skin,hair,suit,cap,beard:!h.f&&R()<.45,pony:h.f,gc:h.crew?'#8d6e63':T.GRADES[h.gr].c};}

function drawTool(g,role,u,t){
  if(role==='engine'||role==='crew'||role==='all'){const big=role==='crew'?.7:1,gold=role==='all';
    g.save();g.rotate(-.25);g.scale(big,big);
    g.fillStyle=gold?metal(g,-3,3,'#fff8c4','#ffc107','#a16800'):metal(g,-3,3,'#eceff1','#9ea7ad','#546e7a');rr(g,-2.5,-2,30,5,2);g.fill();
    g.beginPath();g.arc(30,0,7,0,TAU);g.fill();g.fillStyle='rgba(0,0,0,.85)';g.beginPath();g.moveTo(31,-2.4);g.lineTo(39,-4);g.lineTo(39,4);g.lineTo(31,2.4);g.closePath();g.fill();
    if(gold){g.fillStyle='rgba(255,255,255,.7)';g.fillRect(4,-1.5,18,1.2);}
    g.restore();return;}
  if(role==='tuning'){g.fillStyle='#ff6d00';rr(g,-2,-5,16,9,3);g.fill();g.fillStyle='#212121';rr(g,-1,2,6,9,2);g.fill();g.fillStyle=metal(g,-3,3,'#eceff1','#90a4ae','#455a64');g.fillRect(14,-3,8,5);
    g.save();g.translate(23,-.5);g.rotate((u.st==='atk'?t*40:0));g.fillStyle='#cfd8dc';g.fillRect(-2,-2,4,4);g.restore();return;}
  if(role==='inspect'){g.fillStyle='#263238';rr(g,-2,-9,14,18,3);g.fill();g.fillStyle=u.st==='atk'||u.st==='cast'?'#80ffea':'#26c6da';g.fillRect(0,-7,10,12);
    g.fillStyle='rgba(255,255,255,.5)';g.fillRect(1,-6,3,10);return;}
  if(role==='service'){g.fillStyle='#c62828';rr(g,-2,-6,12,12,2);g.fill();g.fillStyle='#ffca28';g.fillRect(-2,-2,12,3);g.strokeStyle='#9e9e9e';g.lineWidth=2;g.beginPath();g.moveTo(9,-4);g.lineTo(20,-12);g.stroke();return;}
  if(role==='paint'){g.fillStyle='#78909c';rr(g,-2,-4,14,7,2);g.fill();g.fillStyle='#e0457b';g.fillRect(12,-2,8,3);g.fillStyle='#455a64';g.fillRect(2,2,4,8);
    g.fillStyle='#fff';circ(g,5,-7,3.5);return;}
  if(role==='elec'){g.strokeStyle='#5d4037';g.lineWidth=3;g.beginPath();g.moveTo(0,0);g.lineTo(24,-6);g.stroke();g.strokeStyle='#ff9800';g.lineWidth=1.4;
    for(let k=0;k<4;k++){g.beginPath();g.arc(8+k*4,-2-k,2.2,0,TAU);g.stroke();}
    g.fillStyle='#ffee58';circ(g,25,-6,2.6+Math.sin(t*30)*1);g.fillStyle='rgba(120,220,255,.6)';circ(g,25,-6,5+Math.sin(t*22)*2);return;}
}

function drawHero(g,u,t){
  const L=u.look,role=u.role;let legA=0,legB=0,armF=.25,armB=-.15,lean=0,by=0,rot=0,alpha=1;
  const ph=u.wph;
  if(u.st==='walk'||u.st==='run'){legA=Math.sin(ph)*.7;legB=-legA;armF=-Math.sin(ph)*.6+.2;armB=Math.sin(ph)*.6;by=-Math.abs(Math.sin(ph))*2.2;lean=.08;}
  else if(u.st==='atk'){const p=u.ap;
    if(p<.45){const k=p/.45;armF=lerp(.2,-2.3,k);lean=-.08*k;}else if(p<.62){const k=(p-.45)/.17;armF=lerp(-2.3,1.3,k);lean=lerp(-.08,.18,k);}else{const k=(p-.62)/.38;armF=lerp(1.3,.25,k);lean=lerp(.18,0,k);}
    if(u.rng>80){armF=p<.4?lerp(.2,-1.4,p/.4):p<.6?-1.4:lerp(-1.4,.2,(p-.6)/.4);armF=-armF*.3-.9;}
    legA=.25;legB=-.2;}
  else if(u.st==='cast'){armF=-2.7;armB=-2.4;by=-3-Math.sin(t*20)*1;lean=-.1;}
  else if(u.st==='leap'){armF=-2.6;armB=-2.2;legA=.6;legB=-.8;}
  else if(u.st==='dash'){lean=.45;armF=1.2;armB=-1.2;legA=1;legB=-1;}
  else if(u.st==='win'){by=-Math.abs(Math.sin(t*7+u.k))*12;armF=-2.8;armB=-2.6;}
  else{by=Math.sin(t*2.6+u.k)*.9;armF=.25+Math.sin(t*2.6+u.k)*.08;}
  if(u.hurt>0)lean-=.18*u.hurt;
  if(u.dead){rot=-Math.min(1,u.deadT*2.2)*Math.PI/2;alpha=clamp(2.2-u.deadT,0,1);}
  g.save();g.translate(u.sx,u.sy);g.scale(u.sc,u.sc);
  // grade ring + shadow
  g.globalAlpha=alpha*.95*GA;g.fillStyle='rgba(0,0,0,.35)';ell(g,0,0,17,5);
  if(!u.dead){g.strokeStyle=L.gc;g.globalAlpha=GA*alpha*(.55+.25*Math.sin(t*4+u.k));g.lineWidth=2;g.beginPath();g.ellipse(0,0,18,5.5,0,0,TAU);g.stroke();}
  g.globalAlpha=alpha*GA;
  if(u.shield>0){g.fillStyle='rgba(120,200,255,.18)';ell(g,0,-30,30,36);g.strokeStyle='rgba(160,220,255,.7)';g.lineWidth=1.5;g.beginPath();g.ellipse(0,-30,30,36,0,0,TAU);g.stroke();}
  if(sprOK(u.spr)){drawSprHero(g,u,t,u.spr,alpha);g.restore();return;}
  g.scale(u.face,1);g.translate(0,by);if(rot){g.translate(-8,0);g.rotate(rot);g.translate(8,0);}g.rotate(lean);
  if(u.buff>0&&!u.dead){g.fillStyle='rgba(255,170,0,.22)';ell(g,0,-30,22,34);}
  if(u.h.gr===5&&!u.h.crew&&!u.dead){for(let k=0;k<5;k++){const x=-12+k*6,hh=18+Math.sin(t*9+k*1.7)*7;g.fillStyle=k%2?'rgba(255,120,0,.45)':'rgba(255,214,0,.4)';g.beginPath();g.moveTo(x-5,-8);g.quadraticCurveTo(x,-8-hh,x+5,-8);g.fill();}}
  const dark=hexC(L.suit,-.25),boot='#2b1d14';
  const leg=(a,c)=>{g.save();g.translate(0,-19);g.rotate(a);g.fillStyle=c;rr(g,-4,0,8,15,3);g.fill();g.fillStyle=boot;rr(g,-4,13,12,6,3);g.fill();g.restore();};
  // back arm
  g.save();g.translate(-2,-37);g.rotate(armB);g.fillStyle=dark;rr(g,-3,0,7,15,3);g.fill();g.fillStyle=L.skin;circ(g,.5,16,3.2);g.restore();
  if(role==='paint'){g.fillStyle='#b0bec5';rr(g,-16,-42,8,20,4);g.fill();g.fillStyle='#e0457b';g.fillRect(-16,-36,8,3);}
  leg(legB,dark);leg(legA,L.suit);
  // torso (overalls)
  g.fillStyle=L.suit;rr(g,-10,-44,20,27,6);g.fill();
  g.fillStyle=dark;g.fillRect(-10,-22,20,4);g.fillStyle='#ffd54a';g.fillRect(-2,-22,4,4);
  g.fillStyle='rgba(255,255,255,.12)';rr(g,-8,-42,7,18,3);g.fill();
  g.strokeStyle=dark;g.lineWidth=2;g.beginPath();g.moveTo(-6,-44);g.lineTo(-6,-30);g.moveTo(6,-44);g.lineTo(6,-30);g.stroke();
  if(role==='all'||u.h.gr>=4&&!u.h.crew){g.fillStyle=L.gc;g.fillRect(-10,-33,20,2);}
  // head
  g.fillStyle=hexC(L.skin,-.1);g.fillRect(-3,-48,7,6);
  if(L.pony){g.fillStyle=L.hair;g.save();g.translate(-12,-56);g.rotate(Math.sin(t*5+u.k)*.15+(u.st==='walk'?.3:0));rr(g,-4,0,7,16,4);g.fill();g.restore();}
  g.fillStyle=L.skin;circ(g,1,-57,12.5);
  g.fillStyle=L.hair;g.beginPath();g.arc(-4,-57,10,Math.PI*.55,Math.PI*1.2);g.fill();
  if(L.beard){g.fillStyle=L.hair;g.beginPath();g.arc(3,-54,10,.1,Math.PI*.8);g.lineTo(0,-55);g.fill();}
  g.fillStyle=hexC(L.skin,-.15);circ(g,-3,-56,3);
  g.fillStyle='#1b1b1b';const blink=(t+u.k)%3.4<.12;if(blink)g.fillRect(6,-59,4,1.4);else circ(g,8,-58.5,1.9);
  g.fillStyle='rgba(0,0,0,.6)';g.fillRect(5,-63,6,1.4);
  if(u.st==='atk'||u.st==='cast'||u.st==='dash'){g.fillStyle='#5d1a10';circ(g,9,-51.5,2);}else{g.strokeStyle='#5d4037';g.lineWidth=1.2;g.beginPath();g.arc(8,-53,2.6,.3,2);g.stroke();}
  // cap
  g.fillStyle=L.cap;g.beginPath();g.arc(1,-60,13,Math.PI*1.02,TAU*1.0);g.closePath();g.fill();g.fillRect(4,-62,15,3.4);
  g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.arc(-2,-66,6,Math.PI,TAU);g.fill();
  if(role==='all'||(u.h.gr===5)){g.fillStyle='#ffd54a';g.beginPath();g.moveTo(-8,-71);g.lineTo(-6,-80);g.lineTo(-2,-74);g.lineTo(1,-82);g.lineTo(4,-74);g.lineTo(8,-80);g.lineTo(10,-71);g.closePath();g.fill();g.fillStyle='#e53935';circ(g,1,-74,1.5);}
  else{g.fillStyle='#fff';circ(g,-1,-65,2.4);}
  // front arm + tool
  g.save();g.translate(1,-38);g.rotate(armF);g.fillStyle=L.suit;rr(g,-3.5,0,7,15,3);g.fill();g.fillStyle=L.skin;circ(g,0,16,3.6);
  g.translate(0,16);g.rotate(-armF*.35-.6);drawTool(g,role,u,t);g.restore();
  g.restore();
}

// ---------------------------------------------------------------- monsters (drawn facing right, mirrored when needed)
let GA=1;
function eye(g,x,y,r,col,t,k){g.fillStyle=col;circ(g,x,y,r);g.fillStyle='rgba(255,255,255,.85)';circ(g,x-r*.3,y-r*.3,r*.3);g.globalAlpha*=.35;g.fillStyle=col;circ(g,x,y,r*2.2+Math.sin(t*6+k)*.6);g.globalAlpha=Math.min(1,g.globalAlpha/.35);}
function drawUnit(g,u,t){const f=u.hero?drawHero:drawMonster;GA=1;f(g,u,t);
  if(u.flash>0&&!u.dead){g.save();g.globalCompositeOperation='lighter';GA=Math.min(1,u.flash)*.75;f(g,u,t);GA=1;g.restore();}}
const MDRAW={
 imp(g,u,t){const ph=u.wph,lunge=u.st==='atk'?Math.sin(u.ap*Math.PI)*8:0;g.translate(lunge,0);
   g.strokeStyle='#90a4ae';g.lineWidth=2.4;for(const s of[-1,1]){g.beginPath();g.moveTo(s*3,-10);g.lineTo(s*3+Math.sin(ph+(s>0?0:3))*5,-1);g.lineTo(s*3+Math.sin(ph+(s>0?0:3))*5+3,0);g.stroke();}
   g.fillStyle=metal(g,-16,-8,'#eceff1','#9ea7ad','#546e7a');g.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU;g.lineTo(Math.cos(a)*9,-12+Math.sin(a)*4.5);}g.closePath();g.fill();
   g.fillStyle='#78909c';g.fillRect(-4,-10,8,3);
   const bob=Math.sin(t*9+u.k)*1;g.translate(0,bob);
   g.fillStyle=metal(g,-36,-14,'#ffffff','#f1ede4','#c9c1b0');rr(g,-6,-36,12,22,5);g.fill();
   g.strokeStyle='rgba(0,0,0,.12)';g.lineWidth=1;for(let y=-31;y<-16;y+=4){g.beginPath();g.moveTo(-6,y);g.lineTo(6,y);g.stroke();}
   g.fillStyle='#78909c';g.fillRect(-2.5,-41,5,6);g.fillStyle='#b0bec5';circ(g,0,-42,3);
   eye(g,-1.5,-27,2,'#ff3d00',t,u.k);eye(g,3.5,-27,2,'#ff3d00',t,u.k+1);
   g.strokeStyle='#5d1a10';g.lineWidth=1.3;g.beginPath();g.moveTo(-2,-21);g.lineTo(0,-22.5);g.lineTo(2,-21);g.lineTo(4,-22.5);g.stroke();
   g.strokeStyle='#90a4ae';g.lineWidth=1.6;g.beginPath();g.moveTo(5,-18);g.lineTo(11,-22+(u.st==='atk'?-6*Math.sin(u.ap*Math.PI):0));g.moveTo(-5,-18);g.lineTo(-10,-14);g.stroke();
   if((t*14+u.k|0)%3===0){g.strokeStyle='#80d8ff';g.lineWidth=1.4;g.beginPath();let x=0,y=-44;g.moveTo(x,y);for(let k=0;k<3;k++){x+=rnd(-5,5);y-=4;g.lineTo(x,y);}g.stroke();}},
 tire(g,u,t){const lunge=u.st==='atk'?Math.sin(u.ap*Math.PI)*12:0;g.translate(lunge,-Math.abs(Math.sin(u.roll*.5))*1.5);
   const R=23;g.save();g.translate(0,-R);g.rotate(u.roll);
   g.fillStyle='#151515';circ(g,0,0,R);g.fillStyle='#262626';for(let k=0;k<16;k++){g.save();g.rotate(k/16*TAU);g.fillRect(R-4,-3,5,6);g.restore();}
   g.fillStyle='#2e2e2e';circ(g,0,0,R-6);g.fillStyle=metal(g,-12,12,'#eceff1','#9ea7ad','#455a64');circ(g,0,0,12);
   g.fillStyle='#546e7a';for(let k=0;k<5;k++){const a=k/5*TAU;circ(g,Math.cos(a)*7.5,Math.sin(a)*7.5,1.8);}g.restore();
   g.fillStyle='#000';circ(g,0,-R,5.8);eye(g,1.5,-R,3.6,u.st==='atk'?'#ff1744':'#ff6d00',t,u.k);
   g.fillStyle='rgba(0,0,0,.8)';g.beginPath();g.moveTo(-6,-R-6);g.lineTo(7,-R-3.5);g.lineTo(7,-R-5.5);g.lineTo(-5,-R-8);g.closePath();g.fill();},
 snake(g,u,t){const n=7,lunge=u.st==='atk'?Math.sin(u.ap*Math.PI)*6:0;
   for(let i=0;i<n;i++){const x=-34+i*6.5,y=-10+Math.sin(t*5+u.k-i*.8)*4-i*1.6;g.fillStyle=metal(g,y-6,y+6,'#eceff1','#9ea7ad','#455a64');ell(g,x,y,5.2,6.2-i*.1);
     g.fillStyle='rgba(120,60,20,.45)';ell(g,x+1,y+1,2,2.5);}
   const hx=12+lunge,hy=-26+Math.sin(t*5+u.k-n*.8)*3;g.save();g.translate(hx,hy);g.rotate(-.15);
   g.fillStyle=metal(g,-9,9,'#f5f5f5','#b0bec5','#546e7a');rr(g,-10,-9,20,18,7);g.fill();
   g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1;g.beginPath();g.moveTo(-10,-2);g.lineTo(10,-2);g.stroke();
   const open=u.st==='atk'?Math.sin(u.ap*Math.PI)*.6:.1;g.fillStyle='#3e2723';g.save();g.translate(9,3);g.rotate(open);g.fillRect(0,-2,10,4);g.restore();
   g.fillStyle=metal(g,-3,3,'#eceff1','#90a4ae','#37474f');g.fillRect(8,-2,9,4);g.fillStyle='#1a1a1a';ell(g,17,0,1.5,2);
   eye(g,2,-5,2.3,'#76ff03',t,u.k);g.restore();},
 drone(g,u,t){const hov=Math.sin(t*3+u.k)*3;g.translate(0,-42+hov);
   g.strokeStyle='#37474f';g.lineWidth=2;g.beginPath();g.moveTo(-2,-14);g.lineTo(-2,-20);g.stroke();
   g.fillStyle='rgba(180,190,200,.35)';ell(g,-2,-21,22*Math.abs(Math.cos(t*40)),2.4);ell(g,-2,-21,22*Math.abs(Math.sin(t*40)),2.4);
   g.fillStyle='#263238';rr(g,-14,-6,10,12,3);g.fill();
   g.fillStyle=metal(g,-14,14,'#ffffff','#b0bec5','#37474f');circ(g,0,0,14);
   const lit=u.st==='atk'&&u.ap>.3;const lg=g.createRadialGradient(4,0,1,4,0,11);lg.addColorStop(0,lit?'#ffffff':'#fff9c4');lg.addColorStop(.6,lit?'#ff5252':'#ffd54a');lg.addColorStop(1,lit?'#b71c1c':'#ff8f00');g.fillStyle=lg;circ(g,4,0,10.5);
   g.fillStyle='#000';circ(g,6,0,3.6);g.fillStyle=lit?'#ff1744':'#ff6d00';circ(g,6.5,0,2);
   g.fillStyle='rgba(255,255,255,.55)';ell(g,0,-5,4,2);
   if(lit){g.fillStyle='rgba(255,60,60,.25)';circ(g,8,0,16);}},
 spider(g,u,t){const ph=u.wph,lunge=u.st==='atk'?Math.sin(u.ap*Math.PI)*10:0;const by=-24-Math.abs(Math.sin(ph))*2-(u.st==='atk'?Math.sin(u.ap*Math.PI)*6:0);g.translate(lunge,0);
   for(let k=0;k<4;k++){const s=k<2?-1:1,fx=(k%2?-1:1)*(10+k*3)*.9+s*4,a=Math.sin(ph+k*1.6)*5;const kx=fx*.6+a*.3,ky=by-14,ex=fx+a,ey=0;
     g.strokeStyle=k%2?'#78909c':'#90a4ae';g.lineWidth=4;g.beginPath();g.moveTo(fx*.35,by+4);g.lineTo(kx,ky);g.stroke();
     g.strokeStyle=metal(g,ky,0,'#eceff1','#b0bec5','#607d8b');g.lineWidth=2.4;g.beginPath();g.moveTo(kx,ky);g.lineTo(ex,ey);g.stroke();
     g.fillStyle='#455a64';circ(g,kx,ky,2.8);}
   g.fillStyle=metal(g,by-12,by+10,'#78909c','#455a64','#263238');rr(g,-16,by-10,32,20,4);g.fill();
   g.fillStyle='#c62828';rr(g,-13,by-17,26,8,3);g.fill();g.fillStyle='rgba(255,255,255,.3)';g.fillRect(-11,by-16,22,1.4);
   g.fillStyle='#212121';for(let k=0;k<4;k++)circ(g,-9+k*6,by-2,2.6);
   eye(g,10,by-3,2.6,'#ff9100',t,u.k);eye(g,15,by+1,2,'#ff9100',t,u.k+2);
   g.fillStyle='#9e9e9e';g.fillRect(-4,by-22,8,5);if((t*3+u.k|0)%4===0){g.fillStyle='rgba(120,120,120,.35)';circ(g,0,by-28,4);}},
 brute(g,u,t,pal){pal=pal||{a:'#607d8b',b:'#37474f',c:'#90a4ae',e:'#ffd54a'};const ph=u.wph;let armF=.2,armB=-.2,lean=0;
   const walking=u.st==='walk';const by=walking?-Math.abs(Math.sin(ph))*2.5:Math.sin(t*2+u.k)*1.2;
   if(u.st==='atk'||u.st==='pound'){const p=u.ap;armF=p<.5?lerp(.2,-2.6,p/.5):p<.65?lerp(-2.6,1.2,(p-.5)/.15):lerp(1.2,.2,(p-.65)/.35);armB=armF*.8;lean=p<.5?-.1:p<.7?.15:0;}
   g.translate(0,by);g.rotate(lean);
   const leg=(a,x)=>{g.save();g.translate(x,-34);g.rotate(a);g.strokeStyle='#ffca28';g.lineWidth=3;for(let k=0;k<6;k++){g.beginPath();g.ellipse(0,5+k*4.2,7,2,0,0,TAU);g.stroke();}
     g.fillStyle=pal.b;g.fillRect(-3,0,6,30);g.fillStyle='#151515';rr(g,-10,28,22,8,3);g.fill();g.restore();};
   const sw=walking?Math.sin(ph)*.45:0;leg(-sw,-8);
   const arm=(a,x,back)=>{g.save();g.translate(x,-66);g.rotate(a);g.fillStyle=back?hexC(pal.c,-.25):pal.c;rr(g,-6,0,12,26,5);g.fill();g.fillStyle='rgba(0,0,0,.25)';for(let k=0;k<3;k++)g.fillRect(-6,6+k*7,12,1.5);
     g.translate(0,30);g.fillStyle='#151515';circ(g,0,0,11);g.fillStyle=metal(g,-7,7,'#eceff1','#9ea7ad','#455a64');circ(g,0,0,7);g.fillStyle='#455a64';for(let k=0;k<5;k++){const q=k/5*TAU;circ(g,Math.cos(q)*4.5,Math.sin(q)*4.5,1.1);}g.restore();};
   arm(armB,-14,1);
   g.fillStyle='#4e342e';rr(g,-16,-42,32,14,5);g.fill();g.fillStyle='#ff6d00';g.fillRect(-16,-37,32,3);
   g.fillStyle=pal.a;rr(g,-20,-78,40,40,7);g.fill();
   g.fillStyle=pal.b;rr(g,-15,-73,30,28,3);g.fill();g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=1;for(let x=-13;x<15;x+=3.2){g.beginPath();g.moveTo(x,-72);g.lineTo(x,-46);g.stroke();}
   g.fillStyle='rgba(255,255,255,.12)';rr(g,-19,-77,10,38,5);g.fill();
   g.fillStyle='#9e9e9e';g.fillRect(-24,-86,8,14);g.fillRect(14,-86,8,14);
   if((t*4+u.k|0)%3===0){g.fillStyle='rgba(60,60,60,.35)';circ(g,-20,-92-(t*20%8),5);circ(g,18,-92-(t*20%8),5);}
   g.fillStyle=pal.b;rr(g,-11,-96,24,18,5);g.fill();g.fillStyle='#c62828';rr(g,-11,-99,24,6,3);g.fill();
   eye(g,6,-87,3.4,pal.e,t,u.k);eye(g,-3,-87,2.8,pal.e,t,u.k+1);
   g.fillStyle='#212121';g.fillRect(-5,-81,15,3);g.fillStyle='#eceff1';for(let k=0;k<4;k++)g.fillRect(-4+k*3.8,-81,2,2);
   if(pal.horn){g.strokeStyle='#bdbdbd';g.lineWidth=4;g.beginPath();g.moveTo(-8,-97);g.quadraticCurveTo(-16,-108,-8,-114);g.moveTo(10,-97);g.quadraticCurveTo(18,-108,12,-114);g.stroke();}
   leg(sw,8);arm(armF,15,0);},
 crusher(g,u,t){g.scale(1.3,1.3);MDRAW.brute(g,u,t,MON[u.t].pal);},
 titan(g,u,t){const enr=u.enr,ph=t*1.6;let armF=.15+Math.sin(ph)*.05,armB=-.15,lean=0;
   if(u.st==='atk'||u.st==='pound'){const p=u.ap;armF=p<.5?lerp(.15,-2.4,p/.5):p<.65?lerp(-2.4,1.1,(p-.5)/.15):lerp(1.1,.15,(p-.65)/.35);lean=p<.5?-.08:p<.7?.12:0;}
   if(u.st==='laser'){armF=-.6;armB=-.8;}
   const S=1;g.scale(S,S);g.translate(0,Math.sin(ph)*2);g.rotate(lean);
   // legs: hydraulic pistons + tire feet
   for(const x of[-30,30]){g.fillStyle='#212121';rr(g,x-20,-14,40,14,6);g.fill();g.fillStyle='#424242';for(let k=0;k<6;k++)g.fillRect(x-18+k*7,-14,3,14);
     g.fillStyle=metal(g,-70,-14,'#eceff1','#9ea7ad','#455a64');g.fillRect(x-6,-70,12,58);g.fillStyle='#37474f';rr(g,x-11,-92,22,32,5);g.fill();g.fillStyle='#ffca28';g.fillRect(x-11,-74,22,3);}
   // back arm
   const arm=(a,x,back)=>{g.save();g.translate(x,-170);g.rotate(a);g.fillStyle=back?'#263238':'#37474f';circ(g,0,0,16);g.fillStyle='#b71c1c';circ(g,0,0,8);
     g.strokeStyle=back?'#8d6e00':'#ffca28';g.lineWidth=5;for(let k=0;k<7;k++){g.beginPath();g.ellipse(0,18+k*8,11,3,0,0,TAU);g.stroke();}
     g.fillStyle=metal(g,0,0,'#cfd8dc','#78909c','#37474f');g.fillRect(-4,10,8,60);
     g.translate(0,80);g.fillStyle='#151515';circ(g,0,0,24);g.fillStyle='#2b2b2b';circ(g,0,0,19);g.fillStyle=metal(g,-12,12,'#eceff1','#9ea7ad','#455a64');circ(g,0,0,12);
     g.fillStyle='#455a64';for(let k=0;k<5;k++){const q=k/5*TAU+t;circ(g,Math.cos(q)*7.5,Math.sin(q)*7.5,2);}
     g.fillStyle='#9e9e9e';for(let k=0;k<3;k++){g.save();g.rotate(-.8+k*.8);g.beginPath();g.moveTo(18,-4);g.lineTo(34,0);g.lineTo(18,4);g.fill();g.restore();}g.restore();};
   arm(armB,-56,1);
   // pelvis engine block
   g.fillStyle=metal(g,-110,-80,'#78909c','#455a64','#263238');rr(g,-44,-112,88,30,6);g.fill();g.fillStyle='#212121';for(let k=0;k<5;k++)circ(g,-32+k*16,-97,4);
   // exhaust stacks with fire
   for(const x of[-38,-20]){g.fillStyle=metal(g,0,0,'#eceff1','#9ea7ad','#455a64');g.fillRect(x-5,-238,10,70);g.fillStyle='#212121';ell(g,x,-238,5,2);
     const fh=12+Math.sin(t*15+x)*5+(enr?14:0);const fg=g.createLinearGradient(0,-238,0,-238-fh*2);fg.addColorStop(0,'#ffeb3b');fg.addColorStop(.5,enr?'#ff1744':'#ff6d00');fg.addColorStop(1,'rgba(255,60,0,0)');g.fillStyle=fg;g.beginPath();g.moveTo(x-5,-238);g.quadraticCurveTo(x,-238-fh*2.2,x+5,-238);g.fill();}
   // torso = car front standing up
   const bc=enr?'#7f1010':'#1e3a5f',bc2=enr?'#3a0606':'#0d1b2a';
   g.fillStyle=metal(g,-220,-110,hexC(bc,.25),bc,bc2);rr(g,-52,-222,104,116,16);g.fill();
   g.fillStyle='rgba(255,255,255,.12)';rr(g,-48,-218,26,108,12);g.fill();
   // windscreen as brow
   g.fillStyle='#0b1117';rr(g,-40,-218,80,18,6);g.fill();g.fillStyle='rgba(120,200,255,.25)';g.fillRect(-36,-216,24,4);
   // headlight eyes
   const ec=enr?'#ff1744':'#ffe066';for(const x of[-26,26]){g.fillStyle='#263238';rr(g,x-15,-196,30,16,7);g.fill();const eg=g.createRadialGradient(x,-188,1,x,-188,14);eg.addColorStop(0,'#fff');eg.addColorStop(.5,ec);eg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=eg;ell(g,x,-188,13,7);
     g.globalAlpha=GA*(.3+.15*Math.sin(t*5));g.fillStyle=ec;ell(g,x,-188,26,13);g.globalAlpha=GA;}
   // engine heart
   const hp=.6+.4*Math.sin(t*(enr?9:5));const hg=g.createRadialGradient(0,-150,2,0,-150,30);hg.addColorStop(0,'#fff8e1');hg.addColorStop(.35,enr?'#ff5252':'#ffab00');hg.addColorStop(1,'rgba(255,80,0,0)');
   g.fillStyle='#111';rr(g,-22,-170,44,38,6);g.fill();g.globalAlpha=hp*GA;g.fillStyle=hg;circ(g,0,-151,30);g.globalAlpha=GA;
   g.strokeStyle='#546e7a';g.lineWidth=3;for(let k=0;k<4;k++){g.beginPath();g.moveTo(-20+k*13,-170);g.lineTo(-20+k*13,-132);g.stroke();}
   // grill mouth with teeth
   const mo=u.st==='laser'?8:u.st==='atk'?Math.sin(u.ap*Math.PI)*6:Math.sin(t*2)*1.5;
   g.fillStyle='#0b0b0b';rr(g,-34,-128,68,14+mo,4);g.fill();g.fillStyle=metal(g,-128,-110,'#ffffff','#b0bec5','#607d8b');for(let k=0;k<8;k++){g.beginPath();g.moveTo(-32+k*8.5,-128);g.lineTo(-28+k*8.5,-120);g.lineTo(-24+k*8.5,-128);g.fill();g.beginPath();g.moveTo(-32+k*8.5,-114+mo);g.lineTo(-28+k*8.5,-121+mo);g.lineTo(-24+k*8.5,-114+mo);g.fill();}
   g.fillStyle='#cfd8dc';rr(g,-50,-112,100,8,3);g.fill();g.fillStyle='#ffca28';g.fillRect(-14,-112,28,8);g.fillStyle='#111';g.fillRect(-10,-109,20,2);
   arm(armF,58,0);}
};
// ---- new monsters (v13) ----
Object.assign(MDRAW,{
 battery(g,u,t){const ph=u.wph,walk=u.st==='walk';const by=walk?-Math.abs(Math.sin(ph))*2:Math.sin(t*2+u.k)*1;let arm=Math.sin(ph)*.3;
   if(u.st==='atk'||u.st==='pound'){const p=u.ap;arm=p<.5?lerp(0,-2.2,p/.5):p<.65?lerp(-2.2,1,(p-.5)/.15):lerp(1,0,(p-.65)/.35);}
   g.translate(0,by);
   for(const s of[-1,1]){const a=walk?Math.sin(ph+(s>0?0:3))*.35:0;g.save();g.translate(s*9,-22);g.rotate(a);g.fillStyle='#263238';rr(g,-5,0,10,18,4);g.fill();g.fillStyle='#111';rr(g,-8,16,16,6,3);g.fill();g.restore();}
   const cable=(col,x,a,back)=>{g.save();g.translate(x,-48);g.rotate(a);g.strokeStyle=back?hexC(col,-.35):col;g.lineWidth=5;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(10,10,4,26);g.stroke();
     g.translate(4,28);g.fillStyle=back?'#8d6e00':'#ffca28';g.save();g.rotate(-.3);rr(g,-6,-3,12,6,2);g.fill();g.restore();g.save();g.rotate(.4);rr(g,-6,0,12,5,2);g.fill();g.restore();g.restore();};
   cable('#d32f2f',-14,-arm*.7-.2,1);
   g.fillStyle=metal(g,-62,-22,'#455a64','#263238','#11181c');rr(g,-19,-62,38,40,5);g.fill();
   g.fillStyle='#1b5e20';rr(g,-19,-62,38,8,4);g.fill();g.fillStyle='#76ff03';g.fillRect(-16,-51,32,2);
   g.fillStyle='rgba(255,255,255,.12)';rr(g,-17,-60,8,36,4);g.fill();
   g.fillStyle='#b71c1c';g.fillRect(-14,-68,8,7);g.fillStyle='#212121';g.fillRect(6,-68,8,7);g.fillStyle='#fff';g.font='900 7px system-ui';g.textAlign='center';g.fillText('+',-10,-62.5);g.fillText('−',10,-62.5);
   if((t*7+u.k|0)%4===0){g.strokeStyle='#b2ff59';g.lineWidth=1.5;g.beginPath();g.moveTo(-10,-68);for(let k=1;k<5;k++)g.lineTo(-10+k*5,-72+rnd(-4,4));g.stroke();}
   eye(g,4,-40,3.2,'#76ff03',t,u.k);eye(g,12,-40,2.6,'#76ff03',t,u.k+1);
   g.fillStyle='#0b0b0b';g.fillRect(2,-32,14,3);g.fillStyle='#b2ff59';for(let k=0;k<3;k++)g.fillRect(3+k*4.5,-32,2,2);
   cable('#212121',16,arm+.2,0);},
 canister(g,u,t){const ph=u.wph,walk=u.st==='walk',lunge=u.st==='atk'?Math.sin(u.ap*Math.PI)*5:0;const by=walk?-Math.abs(Math.sin(ph))*2:0;
   for(const s of[-1,1]){const a=walk?Math.sin(ph+(s>0?0:3))*4:0;g.strokeStyle='#5d4037';g.lineWidth=3;g.beginPath();g.moveTo(s*6,-10+by);g.lineTo(s*6+a,0);g.stroke();g.fillStyle='#212121';ell(g,s*6+a+2,0,4,2);}
   g.translate(lunge,by);
   g.fillStyle=metal(g,-44,-10,'#ff5252','#c62828','#6d0f0f');rr(g,-13,-44,26,34,4);g.fill();
   g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1.5;g.beginPath();g.moveTo(-13,-44);g.lineTo(13,-10);g.moveTo(13,-44);g.lineTo(-13,-10);g.stroke();
   g.fillStyle='#8e1a1a';rr(g,-11,-50,14,7,3);g.fill();g.fillStyle='#000';rr(g,-8,-49,8,4,2);g.fill();
   g.save();g.translate(9,-44);g.rotate(-.7+(u.st==='atk'?-.4*Math.sin(u.ap*Math.PI):0));g.fillStyle='#9e9e9e';g.fillRect(0,-3,14,6);g.fillStyle='#424242';g.fillRect(12,-4,4,8);
   g.fillStyle='rgba(118,255,3,'+(.5+.4*Math.sin(t*9+u.k))+')';circ(g,18,0,2.4);g.restore();
   g.fillStyle='#fff8e1';rr(g,-9,-30,18,10,2);g.fill();g.fillStyle='#ff6d00';g.beginPath();g.moveTo(0,-29);g.quadraticCurveTo(5,-24,0,-21);g.quadraticCurveTo(-5,-24,0,-29);g.fill();
   eye(g,2,-37,2.4,'#ffea00',t,u.k);eye(g,8,-37,2,'#ffea00',t,u.k+1);},
 wiper(g,u,t){const ph=u.wph,walk=u.st==='walk';const p=u.st==='atk'?u.ap:0;const sw=u.st==='atk'?Math.sin(p*Math.PI*2)*1.4:Math.sin(t*3+u.k)*.15;
   for(let k=0;k<4;k++){const fx=-12+k*8,a=walk?Math.sin(ph+k*1.5)*4:0;g.strokeStyle='#37474f';g.lineWidth=2.2;g.beginPath();g.moveTo(fx*.5,-20);g.lineTo(fx+a,-10);g.lineTo(fx+a+(k<2?-3:3),0);g.stroke();}
   g.fillStyle=metal(g,-30,-14,'#455a64','#263238','#101417');ell(g,-8,-22,14,7);g.fillStyle='#ffca28';g.fillRect(-18,-24,18,2);
   g.fillStyle='#37474f';g.save();g.translate(4,-26);g.rotate(-.9);rr(g,-3,-18,6,20,3);g.fill();g.restore();
   const hx=14,hy=-44;g.fillStyle=metal(g,hy-8,hy+8,'#b0bec5','#607d8b','#263238');circ(g,hx,hy,8);g.fillStyle='#212121';circ(g,hx-6,hy,3.5);
   eye(g,hx+3,hy-2,2.2,'#00e5ff',t,u.k);eye(g,hx+7,hy+1,1.7,'#00e5ff',t,u.k+1);
   g.strokeStyle='#8d6e63';g.lineWidth=1.2;g.beginPath();g.moveTo(hx-2,hy-7);g.lineTo(hx-8,hy-16);g.moveTo(hx+2,hy-7);g.lineTo(hx+4,hy-17);g.stroke();
   for(const s of[0,1]){g.save();g.translate(8+s*4,-36);g.rotate(-1.2+sw*(s?1:-1)*.8+(s?.3:0));g.fillStyle='#9e9e9e';g.fillRect(0,-1.5,22,3);g.translate(22,0);g.rotate(.9);
     g.fillStyle='#111';rr(g,-2,-2,30,4,2);g.fill();g.fillStyle='#424242';for(let q=0;q<5;q++)g.fillRect(2+q*6,-3,2,6);g.restore();}},
 hubcap(g,u,t){const hov=Math.sin(t*4+u.k)*3,lunge=u.st==='atk'?Math.sin(u.ap*Math.PI)*10:0;g.translate(lunge,-30+hov);
   const sp=t*(u.st==='walk'||u.charge?18:9);g.save();g.rotate(sp);g.fillStyle='#455a64';g.beginPath();for(let i=0;i<24;i++){const a=i/24*TAU,r=i%2?17:21;g.lineTo(Math.cos(a)*r,Math.sin(a)*r*.92);}g.closePath();g.fill();
   g.fillStyle=metal(g,-17,17,'#ffffff','#b0bec5','#455a64');circ(g,0,0,16);g.fillStyle='#78909c';for(let i=0;i<6;i++){g.save();g.rotate(i/6*TAU);rr(g,4,-2.5,10,5,2);g.fill();g.restore();}g.restore();
   g.fillStyle='rgba(255,255,255,.35)';ell(g,-5,-7,6,3);g.fillStyle='#212121';circ(g,0,0,6);eye(g,0,0,3.4,u.st==='atk'?'#ff1744':'#ff6d00',t,u.k);
   g.globalAlpha=GA*.25;g.strokeStyle='#cfd8dc';g.lineWidth=2;g.beginPath();g.arc(0,0,24,sp%TAU,sp%TAU+1.2);g.stroke();g.globalAlpha=GA;},
 horn(g,u,t){const ph=u.wph,walk=u.st==='walk',blow=u.st==='atk'?Math.sin(u.ap*Math.PI):0;const by=walk?-Math.abs(Math.sin(ph))*2:0;
   for(const s of[-1,1]){const a=walk?Math.sin(ph+(s>0?0:3))*4:0;g.strokeStyle='#424242';g.lineWidth=3.5;g.beginPath();g.moveTo(s*7-4,-14+by);g.lineTo(s*7-4+a,0);g.stroke();g.fillStyle='#212121';ell(g,s*7-2+a,0,5,2.2);}
   g.translate(0,by);
   g.fillStyle=metal(g,-40,-12,'#ffe082','#ffa000','#8d5000');circ(g,-6,-28,15);g.fillStyle='rgba(0,0,0,.25)';circ(g,-6,-28,8);g.fillStyle='#5d4037';circ(g,-6,-28,4);
   g.save();g.translate(6,-32);g.scale(1+blow*.12,1+blow*.12);g.fillStyle=metal(g,-14,14,'#fff8e1','#ffca28','#a06a00');g.beginPath();g.moveTo(0,-5);g.lineTo(18,-15);g.quadraticCurveTo(24,0,18,15);g.lineTo(0,5);g.closePath();g.fill();
   g.fillStyle='#3e2723';ell(g,19,0,4,13);g.restore();
   eye(g,-10,-34,2.6,'#ff1744',t,u.k);eye(g,-3,-36,2.2,'#ff1744',t,u.k+1);
   if(blow>.2){g.strokeStyle='rgba(255,240,180,'+blow*.7+')';g.lineWidth=2;for(let k=0;k<3;k++){g.beginPath();g.arc(30,-32,8+k*7+blow*6,-.7,.7);g.stroke();}}},
 turbo(g,u,t){const ph=u.wph,walk=u.st==='walk',lunge=u.st==='atk'?Math.sin(u.ap*Math.PI)*10:0;const by=walk?-Math.abs(Math.sin(ph*1.2))*3:0;g.translate(lunge,by);
   for(let k=0;k<4;k++){const fx=k<2?12-k*5:-10-(k-2)*5,a=walk?Math.sin(ph*1.2+k*1.6)*6:0;g.strokeStyle=metal(g,-20,0,'#cfd8dc','#90a4ae','#455a64');g.lineWidth=3.5;g.beginPath();g.moveTo(fx,-18);g.lineTo(fx+a,-6);g.lineTo(fx+a+2,0);g.stroke();}
   g.strokeStyle='#757575';g.lineWidth=4;g.beginPath();g.moveTo(-18,-24);g.quadraticCurveTo(-30,-30,-32,-40+Math.sin(t*8)*3);g.stroke();if((t*10+u.k|0)%3===0){g.fillStyle='rgba(90,90,90,.4)';circ(g,-33,-45,4);}
   g.fillStyle=metal(g,-32,-14,'#b0bec5','#607d8b','#263238');rr(g,-20,-32,30,16,7);g.fill();
   g.fillStyle=metal(g,-40,-14,'#eceff1','#9ea7ad','#546e7a');circ(g,14,-30,13);g.fillStyle='#37474f';circ(g,14,-30,9);
   g.save();g.translate(14,-30);g.rotate(t*(walk?25:10));g.fillStyle='#cfd8dc';for(let i=0;i<7;i++){g.rotate(TAU/7);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(5,-3,8,1);g.lineTo(2,2);g.fill();}g.restore();
   eye(g,14,-30,2.6,'#ff6d00',t,u.k);
   g.fillStyle='#212121';g.beginPath();g.moveTo(20,-20);g.lineTo(30,-18+(u.st==='atk'?4*Math.sin(u.ap*Math.PI):0));g.lineTo(20,-16);g.fill();
   g.fillStyle='#eceff1';for(let k=0;k<3;k++){g.beginPath();g.moveTo(21+k*3,-20);g.lineTo(22.5+k*3,-17.5);g.lineTo(24+k*3,-20);g.fill();}},
 gearbox(g,u,t){MDRAW.brute(g,u,t,{a:'#6d4c41',b:'#3e2723',c:'#a1887f',e:'#ffab00'});
   g.save();
   for(const [x,y,r,s] of[[-6,-60,9,1],[8,-50,6,-1.4]]){g.save();g.translate(x,y);g.rotate(t*2*s);g.fillStyle='#ffca28';g.beginPath();for(let i=0;i<16;i++){const a=i/16*TAU,q=i%2?r:r*1.3;g.lineTo(Math.cos(a)*q,Math.sin(a)*q);}g.fill();g.fillStyle='#5d4037';circ(g,0,0,r*.35);g.restore();}
   g.strokeStyle='#bdbdbd';g.lineWidth=3;g.beginPath();g.moveTo(1,-98);g.lineTo(-4,-114);g.stroke();g.fillStyle='#212121';circ(g,-4,-117,5);g.restore();},
 bat(g,u,t){const hov=Math.sin(t*5+u.k)*4,fl=Math.sin(t*16+u.k);g.translate(0,-44+hov);
   for(const s of[-1,1]){g.save();g.scale(1,1);g.rotate(s*(.2+fl*.5));g.fillStyle=s<0?'#455a64':'#607d8b';g.beginPath();g.moveTo(0,0);g.lineTo(s*8,-14);g.lineTo(s*24,-10+fl*4);g.lineTo(s*20,-2);g.lineTo(s*14,2);g.lineTo(s*8,0);g.closePath();g.fill();
     g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1;g.beginPath();g.moveTo(s*8,-14);g.lineTo(s*14,2);g.moveTo(s*24,-10+fl*4);g.lineTo(s*10,0);g.stroke();g.restore();}
   g.fillStyle=metal(g,-10,10,'#cfd8dc','#78909c','#37474f');ell(g,0,0,9,8);g.fillStyle='#263238';ell(g,9,1,5,4);
   const lit=u.st==='atk';g.fillStyle=lit?'#ffea00':'#ff6d00';circ(g,10,1,2.5);if(lit){g.globalAlpha=GA*.4;circ(g,12,1,7);g.globalAlpha=GA;}
   eye(g,2,-3,2,'#ff1744',t,u.k);eye(g,6,-4,1.6,'#ff1744',t,u.k+1);
   g.fillStyle='#37474f';g.beginPath();g.moveTo(-4,-7);g.lineTo(-2,-14);g.lineTo(0,-7);g.fill();g.beginPath();g.moveTo(2,-7);g.lineTo(5,-13);g.lineTo(6,-6);g.fill();},
 // ---- chapter bosses ----
 tanker(g,u,t){const enr=u.enr,ph=t*1.6;let armF=.2+Math.sin(ph)*.06,armB=-.2,lean=0;
   if(u.st==='atk'||u.st==='pound'){const p=u.ap;armF=p<.5?lerp(.2,-2.3,p/.5):p<.65?lerp(-2.3,1.1,(p-.5)/.15):lerp(1.1,.2,(p-.65)/.35);lean=p<.5?-.07:p<.7?.1:0;}
   if(u.st==='laser'){armF=-1.2;armB=-1;}
   g.translate(0,Math.sin(ph)*2);g.rotate(lean);
   for(const x of[-34,34]){g.fillStyle='#151515';for(let k=0;k<2;k++){circ(g,x,-16-k*30,17);g.fillStyle='#2b2b2b';circ(g,x,-16-k*30,11);g.fillStyle=metal(g,-8,8,'#eceff1','#9ea7ad','#455a64');circ(g,x,-16-k*30,6);g.fillStyle='#151515';}
     g.fillStyle='#37474f';rr(g,x-8,-70,16,40,4);g.fill();}
   const hose=(a,x,back)=>{g.save();g.translate(x,-150);g.rotate(a);g.strokeStyle=back?'#1b5e20':'#2e7d32';g.lineWidth=14;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(20,30,-10,60,6,90);g.stroke();
     g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=14;g.setLineDash([3,6]);g.stroke();g.setLineDash([]);g.translate(6,92);g.fillStyle=metal(g,-10,30,'#eceff1','#9ea7ad','#455a64');rr(g,-9,0,18,30,4);g.fill();
     g.fillStyle='#212121';rr(g,-6,26,12,8,2);g.fill();if(!back){g.fillStyle='rgba(118,255,3,'+(.5+.4*Math.sin(t*8))+')';circ(g,0,36,5);}g.restore();};
   hose(armB,-58,1);
   const tc=enr?'#9e1b1b':'#b0bec5';g.fillStyle=metal(g,-200,-80,hexC(tc,.3),tc,hexC(tc,-.5));rr(g,-62,-200,124,124,58);g.fill();
   g.fillStyle='rgba(0,0,0,.25)';for(const y of[-170,-110])g.fillRect(-60,y,120,5);
   g.fillStyle='#0b1a06';rr(g,-34,-160,68,42,10);g.fill();const lv=.55+.1*Math.sin(t*2);g.fillStyle=enr?'#ff1744':'#76ff03';g.globalAlpha=GA*.85;rr(g,-32,-160+42*(1-lv),64,42*lv,9);g.fill();
   g.fillStyle='rgba(255,255,255,.5)';for(let k=0;k<4;k++){const p=(t*.6+k*.27)%1;circ(g,-24+k*16,-122-p*36,2.2+k%2);}g.globalAlpha=GA;
   g.fillStyle='#ffca28';g.beginPath();g.moveTo(0,-100);g.lineTo(9,-86);g.lineTo(-9,-86);g.fill();g.fillStyle='#000';g.font='900 10px system-ui';g.textAlign='center';g.fillText('!',0,-88);
   g.fillStyle=metal(g,-250,-196,'#ffffff','#c8e6c9','#4e7a3a');rr(g,-40,-250,80,58,12);g.fill();
   g.fillStyle='#0b1117';rr(g,-34,-244,68,22,6);g.fill();const ec=enr?'#ff1744':'#c6ff00';
   for(const x of[-18,18]){const eg=g.createRadialGradient(x,-233,1,x,-233,12);eg.addColorStop(0,'#fff');eg.addColorStop(.5,ec);eg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=eg;ell(g,x,-233,12,7);}
   const mo=u.st==='laser'?8:u.st==='atk'?Math.sin(u.ap*Math.PI)*5:1;g.fillStyle='#111';rr(g,-28,-216,56,12+mo,3);g.fill();g.fillStyle='#cfd8dc';for(let k=0;k<7;k++)g.fillRect(-26+k*8,-216,4,10+mo);
   g.fillStyle='#ffab00';circ(g,-30,-252,4);circ(g,30,-252,4);
   hose(armF,58,0);},
 plow(g,u,t){const enr=u.enr,ph=t*1.5;let armF=.1+Math.sin(ph)*.05,lean=0;
   if(u.st==='atk'||u.st==='pound'){const p=u.ap;armF=p<.5?lerp(.1,-2.2,p/.5):p<.65?lerp(-2.2,1,(p-.5)/.15):lerp(1,.1,(p-.65)/.35);lean=p<.5?-.07:p<.7?.1:0;}
   g.translate(0,Math.sin(ph)*1.5);g.rotate(lean);
   for(const x of[-34,30]){g.fillStyle='#1a1a1a';rr(g,x-24,-30,48,30,14);g.fill();g.fillStyle='#333';for(let k=0;k<7;k++)g.fillRect(x-22+k*7,-30,3,30);g.fillStyle='#455a64';circ(g,x-12,-15,7);circ(g,x+12,-15,7);}
   const bc=enr?'#c62828':'#ff8f00';g.fillStyle=metal(g,-180,-30,hexC(bc,.3),bc,hexC(bc,-.5));rr(g,-50,-170,100,140,10);g.fill();
   g.fillStyle='rgba(255,255,255,.15)';rr(g,-46,-166,22,132,8);g.fill();g.fillStyle='#212121';for(let k=0;k<4;k++)g.fillRect(-40+k*22,-60,14,24);
   g.fillStyle=metal(g,-250,-170,'#ffe0b2',hexC(bc,.1),hexC(bc,-.4));rr(g,-38,-240,76,72,10);g.fill();
   g.fillStyle='#0b1117';rr(g,-32,-232,64,30,6);g.fill();g.fillStyle='rgba(160,220,255,.35)';g.fillRect(-28,-229,20,6);
   const ec=enr?'#ff1744':'#80d8ff';for(const x of[-16,16]){const eg=g.createRadialGradient(x,-217,1,x,-217,12);eg.addColorStop(0,'#fff');eg.addColorStop(.5,ec);eg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=eg;ell(g,x,-217,11,7);}
   const bl=Math.sin(t*8)>0;g.fillStyle=bl?'#ffab00':'#8d5000';rr(g,-10,-250,20,10,4);g.fill();if(bl){g.globalAlpha=GA*.35;g.fillStyle='#ffab00';circ(g,0,-246,22);g.globalAlpha=GA;}
   g.fillStyle='#e3f2fd';for(let k=0;k<6;k++)ell(g,-40+k*16,-240,9,4);
   g.save();g.translate(44,-90);g.rotate(armF*.35);
   g.fillStyle=metal(g,-60,60,'#eceff1','#90a4ae','#37474f');g.beginPath();g.moveTo(0,-70);g.quadraticCurveTo(44,-10,10,74);g.lineTo(26,78);g.quadraticCurveTo(64,-10,14,-78);g.closePath();g.fill();
   g.fillStyle='#ffca28';for(let k=0;k<5;k++){g.save();g.translate(14+Math.sin(k*.7)*16,-56+k*28);g.rotate(.6);g.fillRect(-2,-8,4,16);g.restore();}
   g.fillStyle='#fff';for(let k=0;k<6;k++)ell(g,28+Math.sin(k)*10,-60+k*24,6,3);
   const mo=u.st==='laser'?.25:0;g.restore();
   if(u.st==='laser'){g.fillStyle='rgba(128,216,255,.4)';circ(g,0,-217,30);}},
 wyrm(g,u,t){const enr=u.enr,ph=t*1.8;const segs=11;let hx=0,hy=0;const lunge=u.st==='atk'||u.st==='pound'?Math.sin(u.ap*Math.PI):0;
   const pts=[];for(let i=0;i<segs;i++){const k=i/(segs-1);const x=-70+k*100+Math.sin(ph+k*4)*10+lunge*k*30,y=-10-k*200+Math.sin(ph*1.2+k*5)*8*k-lunge*k*20;pts.push([x,y]);}
   for(let i=0;i<segs-1;i++){const [x,y]=pts[i];const r=26-i*1.3;g.fillStyle=metal(g,y-r,y+r,'#eceff1','#9ea7ad','#37474f');circ(g,x,y,r);g.fillStyle=enr?'#ff1744':(i%2?'#ff4fd8':'#00e5ff');g.globalAlpha=GA*.85;g.fillRect(x-r,y-2,r*2,4);g.globalAlpha=GA;
     g.fillStyle='#212121';g.beginPath();g.moveTo(x-6,y-r+2);g.lineTo(x,y-r-12);g.lineTo(x+6,y-r+2);g.fill();}
   for(const s of[-1,1]){const [x,y]=pts[6];g.save();g.translate(x,y);g.rotate(s*.5+Math.sin(ph*2)*.2*s);g.fillStyle='rgba(255,79,216,.35)';g.beginPath();g.moveTo(0,0);g.lineTo(s*60,-60);g.lineTo(s*80,-20);g.lineTo(s*50,10);g.closePath();g.fill();
     g.strokeStyle='#9ea7ad';g.lineWidth=3;g.beginPath();g.moveTo(0,0);g.lineTo(s*60,-60);g.lineTo(s*80,-20);g.moveTo(0,0);g.lineTo(s*50,10);g.stroke();g.restore();}
   [hx,hy]=pts[segs-1];g.save();g.translate(hx,hy);
   g.fillStyle=metal(g,-30,30,'#ffffff','#b0bec5','#455a64');circ(g,0,0,30);g.fillStyle='#263238';circ(g,0,0,22);
   g.save();g.rotate(t*(enr?20:10));g.fillStyle='#cfd8dc';for(let i=0;i<9;i++){g.rotate(TAU/9);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(9,-6,16,2);g.lineTo(4,4);g.fill();}g.restore();
   const mo=u.st==='laser'?16:lunge*10;g.fillStyle='#111';g.beginPath();g.moveTo(16,6);g.lineTo(52,0+mo*.3);g.lineTo(18,18+mo);g.closePath();g.fill();g.fillStyle='#eceff1';for(let k=0;k<4;k++){g.beginPath();g.moveTo(20+k*8,6);g.lineTo(23+k*8,12);g.lineTo(26+k*8,5);g.fill();}
   const ec=enr?'#ff1744':'#ff4fd8';const eg=g.createRadialGradient(10,-12,1,10,-12,14);eg.addColorStop(0,'#fff');eg.addColorStop(.4,ec);eg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=eg;circ(g,10,-12,14);
   g.strokeStyle='#9ea7ad';g.lineWidth=5;g.beginPath();g.moveTo(-10,-26);g.quadraticCurveTo(-26,-50,-6,-60);g.moveTo(8,-28);g.quadraticCurveTo(4,-56,24,-62);g.stroke();
   if(u.st==='laser'){g.fillStyle='rgba(255,79,216,.5)';circ(g,50,4,12);}g.restore();},
 omega(g,u,t){const enr=u.enr,ph=t*(enr?9:6);let armF=.2,armB=-.2,lean=0;
   if(u.st==='atk'||u.st==='pound'){const p=u.ap;armF=p<.5?lerp(.2,-2.4,p/.5):p<.65?lerp(-2.4,1.1,(p-.5)/.15):lerp(1.1,.2,(p-.65)/.35);lean=p<.5?-.07:p<.7?.1:0;}
   if(u.st==='laser'){armF=-.7;armB=-.9;}
   g.translate(0,Math.sin(t*1.5)*2);g.rotate(lean);
   for(const x of[-34,34]){g.fillStyle='#212121';rr(g,x-22,-16,44,16,6);g.fill();g.fillStyle=metal(g,-80,-14,'#cfd8dc','#78909c','#37474f');g.fillRect(x-8,-80,16,66);g.fillStyle='#ff6d00';g.fillRect(x-8,-60,16,3);}
   const hdr=(a,x,back)=>{g.save();g.translate(x,-160);g.rotate(a);g.strokeStyle=back?'#6d4c41':'#a1887f';g.lineWidth=8;for(let k=0;k<4;k++){g.beginPath();g.moveTo(-9+k*6,0);g.quadraticCurveTo(-14+k*6,40,0,80);g.stroke();}
     g.translate(0,84);g.fillStyle='#151515';circ(g,0,0,22);g.fillStyle=metal(g,-14,14,'#ffe082','#ffa000','#6d4000');circ(g,0,0,14);
     const fh=10+Math.sin(t*15+x)*5+(enr?10:0);g.fillStyle=enr?'#ff1744':'#ff6d00';g.beginPath();g.moveTo(-8,14);g.quadraticCurveTo(0,14+fh*2,8,14);g.fill();g.restore();};
   hdr(armB,-62,1);
   const bc=enr?'#4a0d0d':'#3a3f44';g.fillStyle=metal(g,-200,-80,hexC(bc,.35),bc,hexC(bc,-.5));rr(g,-58,-200,116,120,12);g.fill();
   g.fillStyle='rgba(255,255,255,.1)';rr(g,-54,-196,26,112,10);g.fill();
   for(const s of[-1,1]){g.save();g.translate(s*30,-200);g.rotate(s*.45);g.fillStyle=metal(g,-60,0,'#ef5350','#b71c1c','#4a0000');rr(g,-26,-56,52,56,8);g.fill();
     for(let k=0;k<4;k++){const py=-Math.abs(Math.sin(ph+k*1.57+(s>0?.8:0)))*14;g.fillStyle='#9e9e9e';g.fillRect(-21+k*12,-70+py,8,18);g.fillStyle='#e0e0e0';rr(g,-23+k*12,-78+py,12,9,2);g.fill();}g.restore();}
   g.fillStyle='#111';circ(g,0,-140,34);g.save();g.translate(0,-140);g.rotate(t*(enr?6:3));g.fillStyle='#455a64';circ(g,0,0,28);g.fillStyle='#212121';for(let k=0;k<6;k++){g.rotate(TAU/6);circ(g,16,0,5);}g.restore();
   const ec=enr?'#ff1744':'#ffea00';for(const x of[-14,14]){const eg=g.createRadialGradient(x,-146,1,x,-146,12);eg.addColorStop(0,'#fff');eg.addColorStop(.45,ec);eg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=eg;ell(g,x,-146,11,8);}
   const mo=u.st==='laser'?8:u.st==='atk'?Math.sin(u.ap*Math.PI)*5:1;g.fillStyle='#1a0000';rr(g,-20,-128,40,8+mo,3);g.fill();const hg=g.createRadialGradient(0,-124,1,0,-124,18);hg.addColorStop(0,'#fff8e1');hg.addColorStop(.5,'#ff6d00');hg.addColorStop(1,'rgba(255,60,0,0)');g.globalAlpha=GA*(.6+.4*Math.sin(t*7));g.fillStyle=hg;circ(g,0,-124,18);g.globalAlpha=GA;
   g.save();g.scale(u.face||1,1);g.fillStyle='#ffca28';g.font='900 13px system-ui';g.textAlign='center';g.fillText('V8',0,-96);g.restore();
   hdr(armF,62,0);}
});
const FILT=typeof CanvasRenderingContext2D!=='undefined'&&'filter' in CanvasRenderingContext2D.prototype;
function msprLoad(id){const d=MSPR[id];if(!d.im){d.im=new Image();d.im.decoding='async';d.im.src='img/mon/'+id+'.webp';}return d;}
const msprOK=id=>{const d=msprLoad(id);return d.im.complete&&d.im.naturalWidth>0;};
function msprFrame(u,t){const a=u.act,id=MON[u.t].sp;
  const L=MSPR[id].L;if(L){const f8=v=>Math.min(7,Math.floor(v*8));
    if(u.dead)return L.d>=0?[L.d,Math.min(7,3+Math.floor(u.deadT/.1))]:[L.i,0];
    if(a&&a.k==='charge'&&a.t<a.dur)return[L.s,Math.floor(a.t*12)%8];
    if(a)return[L.s,f8(a.t/(a.dur+.4))];
    if(u.st==='atk')return[u.alt?L.s:L.a,f8(u.ap)];
    if(u.st==='walk')return[L.w,Math.floor(u.wph/TAU*8+80)%8];
    return[L.i,Math.floor(t*7+u.k)%8];}
  if(u.dead)return[5,Math.min(5,Math.floor(u.deadT/.1))];
  const WBX=MSPR[id].wb,SZ=!!WBX; // v16-61: every WORLD BOSS sprite (SCRAPZILLA, CRUSHER KING, INFERNO PISTON, TOW SERPENT)
  if(a&&a.k==='pound')return[SZ?WBX.pr:3,Math.min(7,Math.floor(a.t/a.dur*8))];
  if(a&&a.k==='laser'){if(id==='ndragon'||SZ)return[3,a.t<a.dur?Math.min(2,Math.floor(a.t/a.dur*3)):2]; // dragon: open mouth, the game draws the nitro breath
    return[3,Math.min(7,Math.floor(a.t/(a.dur+.6)*8))];}
  if(a&&a.k==='charge'&&a.t<a.dur)return[3,Math.floor(a.t*8)%2+1];
  if(u.st==='atk')return[u.alt&&!SZ?3:2,Math.min(7,Math.floor(u.ap*8))];
  if(SZ){if(u.hurtS>0)return[4,u.hurtS>.3?1:2];if(u.enr)return[5,Math.floor(t*8+u.k)%6];if(u.st!=='walk')return[0,Math.floor(t*7+u.k)%WBX.ni];} // v16-60 SCRAPZILLA: hurt only on skills/crits (it is hit all the time), ENRAGE row while enraged
  if(u.stun>0)return[4,3];
  if(u.hurt>.35)return[4,u.hurt>.7?1:2];
  if(u.st==='walk')return[1,Math.floor(u.wph/TAU*8+80)%8];
  return[0,Math.floor(t*7+u.k)%6];}
// drawn facing right like the other monsters (Marius' pictures face left → mirrored here)
function drawSprMon(g,u,t,id){const M=MON[u.t],d=msprLoad(id);if(!msprOK(id)){MDRAW[M.dr0](g,u,t);return;}
  const [r,c]=msprFrame(u,t),k=M.h/d.ih;g.save();g.scale(-1,1);if(id==='wasp')g.translate(0,-12-Math.sin(t*5+u.k)*3);else if(M.fly)g.translate(0,-38-Math.sin(t*5+u.k)*4);
  g.drawImage(d.im,c*d.w,r*d.h,d.w,d.h,-d.ax*k,-d.ay*k,d.w*k,d.h*k);g.restore();}
for(const id in MSPR)MDRAW['spr_'+id]=(g,u,t)=>drawSprMon(g,u,t,id);
function drawMonster(g,u,t){
  g.save();g.translate(u.sx,u.sy);g.scale(u.sc,u.sc);
  const SPM=!!MON[u.t].sp;let alpha=1;if(u.dead){const L8=SPM&&MSPR[MON[u.t].sp].L;alpha=SPM&&!(L8&&L8.d<0)?clamp(1-(u.deadT-.75)*2.6,0,1):clamp(1-u.deadT*1.6,0,1);}
  g.globalAlpha=alpha*GA;const M=MON[u.t],big=M.b==='titan'?70:M.b==='crusher'?34:M.big>1.5?26:16;
  g.fillStyle='rgba(0,0,0,.38)';ell(g,0,0,big,big*.28);
  if(u.mark>0){g.strokeStyle='rgba(80,255,170,.85)';g.lineWidth=1.6;g.beginPath();g.ellipse(0,0,big+4,(big+4)*.3,0,0,TAU);g.stroke();}
  if(u.slow>0){g.fillStyle='rgba(224,69,123,.35)';ell(g,0,0,big+6,(big+6)*.3);}
  if(M.hue!=null&&FILT){// v14 elite colours: draw the monster on its own small canvas, then recolour it once
    const tr=g.getTransform(),ps=Math.max(.5,Math.hypot(tr.a,tr.b)),hw=M.b==='titan'?230:M.b==='crusher'?150:Math.max(64,M.h*1.5*(M.big>1?1.2:1)),top=M.h*(M.b==='titan'?1.45:1.7)+(M.fly?80:0)+60,bot=40;
    const cw=Math.ceil(2*hw*ps),ch=Math.ceil((top+bot)*ps);let oc=u._oc;if(!oc||oc.width<cw||oc.height<ch||oc.width>cw*1.6){oc=u._oc=document.createElement('canvas');oc.width=cw;oc.height=ch;}
    const o=oc.getContext('2d');o.setTransform(1,0,0,1,0,0);o.clearRect(0,0,oc.width,oc.height);o.setTransform(ps,0,0,ps,hw*ps,top*ps);
    o.scale(u.face,1);if(u.dead&&!SPM)o.rotate(-u.deadT*.6);if(u.stun>0)o.rotate(Math.sin(t*30)*.04);const ga=GA;GA=1;MDRAW[M.dr](o,u,t);GA=ga;
    g.filter='hue-rotate('+M.hue+'deg) saturate('+(M.sat||1)+') brightness('+(M.bri||1)+')';g.drawImage(oc,0,0,cw,ch,-hw,-top,2*hw,top+bot);g.filter='none';
  }else{
  g.scale(u.face,1);if(u.dead&&!SPM)g.rotate(-u.deadT*.6);
  if(u.stun>0)g.rotate(Math.sin(t*30)*.04);
  MDRAW[MON[u.t].dr](g,u,t);}
  g.restore();
  if(u.stun>0&&!u.dead){g.save();g.translate(u.sx,u.sy-u.H*u.sc-8);for(let k=0;k<3;k++){const a=t*6+k*2.1;g.fillStyle='#ffd54a';g.font='900 10px system-ui';g.textAlign='center';g.fillText('★',Math.cos(a)*12,Math.sin(a)*4);}g.restore();}
}

// ---------------------------------------------------------------- battle state
const cv=$('btcv');let g=cv.getContext('2d',{alpha:false}); // v16-26: opaque battle canvas = cheaper for the phone to show
let W=390,H=844,DPR=1,BDPR=1,FY0=0,FY1=0,HOR=0,PANEL=0,S=1;
let B=null,raf=0,lastT=0,running=false;
const fy=d=>FY0+d*(FY1-FY0);
const dsc=d=>(.98+.36*d)*S;
// v16-25: background pictures are soft → drawn at max 1.5× (less memory); the canvas is only re-made when the size really changes
function bsize(force){const w=innerWidth,h=innerHeight,d=Math.min(2,window.devicePixelRatio||1)*(B&&B.lowRes?.75:1);
  if(!force&&w===W&&h===H&&d===DPR&&cv.width===Math.round(w*d))return false;W=w;H=h;DPR=d;BDPR=Math.min(DPR,1.5);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  S=clamp(Math.min(W/390,H/800),.8,1.5);HOR=H*.36;FY0=H*.47;FY1=H*.77;PANEL=H-Math.min(150,H*.19);if(B)buildBG();return true;}

// v15: NEVER GIVE UP – stuck on your next stage? Your mechanics train: +7.5% HP & attack every 6 hours for 2 days, then +15% every 6 hours (max +300%). Resets when you win it.
// v16-40: no wall longer than ~2 days (Marius' rule) – after 2 days the training grows faster: +15% every 6 h, up to +300%
const GRIT_N=24,gritK=n=>n<=8?n*.075:.6+(n-8)*.15,gritStep=n=>n<8?.075:.15;
function grit(si){const P=CPX(),st=P.stuck;if(!st||st.si!==si||si!==P.best)return 0;return gritK(Math.min(GRIT_N,Math.floor((Date.now()-st.t)/216e5)));}
function mkHeroUnit(h,i,n){const s=unitStats(h),r=roleOf(h),gk=1+(B.grit||0)+(B.nit||0);
  return {hero:1,h,spr:sprOf(h),land:0,role:r,look:lookOf(h),k:i*1.7,name:h.crew?h.n:h.n,hp:s.hp*gk,max:s.hp*gk,atk:s.atk*gk,def:s.def,mv:s.mv*S,rng:s.rng*S,as:s.as,crit:s.crit,eg:s.eg,
    skK:h.crew?1:1+.06*((TE().skLv?TE().skLv(h.id):1)-1),x:0,d:0,face:1,st:'idle',ap:0,cd:rnd(0,.6),wph:rnd(0,6),en:0,stun:0,slow:0,mark:0,buff:0,aspd:0,aspdK:0,defB:0,critB:0,shield:0,flash:0,hurt:0,hot:0,hotT:0,taunt:0,dead:false,deadT:0,hits:0,act:null,slot:i,pn:pasN(h),shots:0,fcT:3,ekCd:0,swT:0};}
function mkMon(t,i,k){const M=MON[t];if(M.sp)msprLoad(M.sp);const m=B.tw?B.tw.mul:stageMul(B.si)*stEase(B.si);
  return {hero:0,t,k:rnd(0,9),name:M.n,boss:!!M.boss,hp:M.hp*m*1.25,max:M.hp*m*1.25,atk:M.atk*m,def:M.def*(1+Math.min(B.si,19)*.06),mv:M.mv*S,rng:M.rng*S,as:M.as,crit:.05,H:M.h,fly:!!M.fly,
    x:0,d:0,face:-1,st:'walk',ap:0,cd:rnd(.3,1),wph:rnd(0,6),roll:0,stun:0,slow:0,mark:0,weak:0,burn:0,burnT:0,ice:0,tw:0,flash:0,hurt:0,dot:0,dead:false,deadT:0,act:null,
    b:M.b,at:M.at||'',sp1:M.b==='pound'?4:M.b==='crusher'?3:M.b==='titan'?4:0,sp2:M.b==='crusher'?8:M.b==='titan'?9:0,sp3:M.b==='titan'?14:0,pounce:M.pounce?1:0,charge:M.charge?1:0,enr:false};}

const FORM=[[.36,.22],[.33,.62],[.22,.42],[.14,.14],[.13,.8]];
function formation(){const hs=B.heroes;const melee=hs.filter(u=>u.rng<80*S),rng=hs.filter(u=>u.rng>=80*S);
  const order=[...melee,...rng];order.forEach((u,i)=>{u.fx=W*FORM[i][0];u.fd=FORM[i][1];});}

// v16-10: a tester's battle never started (FIGHT → back to the stages). If starting fails, retry without the new effects;
// if it still fails, show the error so he can send a screenshot.
function safeStart(si,team,tw){try{startBattle(si,team,tw);return;}catch(e){console.error(e);window.__BERR=e;}
  try{FX2=false;startBattle(si,team,tw);TE().toast('⚠️ Battle started in safe mode',2500);return;}catch(e2){console.error(e2);
    $('bt').classList.remove('open');window.__BATTLE_ON=false;
    const e=window.__BERR||e2,msg=String(e&&e.message||e).slice(0,160),st=String(e&&e.stack||'').split('\n').slice(0,3).join(' | ').slice(0,300);
    pop(`<div class="pT">Battle could not start</div><div class="pD">Please send a screenshot of this to the developer:</div><div class="pD" style="font-family:monospace;font-size:11px;word-break:break-all;text-align:left">${msg.replace(/</g,'&lt;')}<br>${st.replace(/</g,'&lt;')}<br>${navigator.userAgent.replace(/</g,'&lt;')}</div><button class="cpGo alt" data-p="x">CLOSE</button>`);}}
function startBattle(si,team,tw){
  B={si,stage:tw?tw.st:STAGES[si],tw:tw||null,mod:tw&&tw.mod>=0?TW_MOD[tw.mod].k:'',wave:0,heroes:[],mons:[],proj:[],fx:[],parts:[],nums:[],tele:[],t:0,real:0,ts:1,slowT:0,spd:spdOK(TE().G.cp.spd),auto:TE().G.cp.auto!==false,
    phase:'intro',phT:0,scroll:0,scrollV:0,shake:0,banner:null,flash:0,paused:false,deaths:0,bossBar:null,lowRes:false,perf:[],fx2:[],hs:0,sx:0,sy:0};if(FX2)fxPre();
  B.grit=window.__SIM||tw?0:grit(si);if(tw)twArenaImg();if(B.grit)TE().toast('🔥 NEVER GIVE UP: +'+Math.round(B.grit*100)+'% HP & attack',2600);B.nit=window.__SIM||(tw&&(tw.wb||tw.dg))?0:dgNitro()/100;if(B.nit)setTimeout(()=>{if(B&&!B.res)TE().toast('⚡ NITRO BOOST: +'+Math.round(B.nit*100)+'% HP & attack',2400);},B.grit?2700:0);
  B.lowRes=LOWRES;if(!bsize())buildBG();
  B.heroes=team.map((h,i)=>mkHeroUnit(h,i,team.length));B.heroes.forEach(u=>{portraitCv(u.h);if(u.spr)sprLoad(u.spr);});
  formation();B.heroes.forEach(u=>{u.x=u.fx-W*.5;u.d=u.fd;u.st='walk';});
  spawnWave();
  $('bt').classList.add('open');window.__BATTLE_ON=true;if(!window.__SIM){let n=0;try{n=+localStorage.getItem('te_bhint')||0;localStorage.setItem('te_bhint',n+1);}catch(e){}if(n<3)setTimeout(()=>{if(B&&!B.res)TE().toast('🔧 Your mechanics attack on their own · tap a card when it shows TAP! to use its skill',4200);},2600);}running=true;lastT=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);}
function spawnWave(){const w=B.stage.w[B.wave];
  w.forEach((t,i)=>{const m=mkMon(t,i);if(B.mod)twModMon(m);const n=w.length;
    if(m.b==='titan'){m.x=W*.78;m.d=.42;m.st='idle';}
    if(B.tw&&B.tw.wb&&m.boss){m.x=W*.75;m.d=.4;m.max=m.hp=B.tw.L*WB_LAYERS;m.wbB=1;m.sp3=1e9;m.sp1=3;m.sp2=MON[m.t].noLz?1e9:7;m.hurtS=0;B.wbB=m;B.wbD=0;B.wbT=WB_T;}
    else{m.x=W+30+i*(26*S)+rnd(0,20);m.d=n===1?.45:clamp(.1+(i/(n-1||1))*.8+rnd(-.06,.06),.05,.95);}
    B.mons.push(m);
    if(m.boss)B.bossBar=m;});
  B.waveT=0;}

// ---------------------------------------------------------------- combat helpers
const alive=a=>a.filter(u=>!u.dead);
function dist(a,b){return Math.hypot(a.x-b.x,(a.d-b.d)*(FY1-FY0)*1.25);}
function nearest(u,list){let best=null,bd=1e9;for(const o of list){if(o.dead)continue;const d=dist(u,o);if(d<bd){bd=d;best=o;}}return best;}
function cluster(list,r){let best=null,bn=-1;for(const a of list){if(a.dead)continue;let n=0;for(const b of list)if(!b.dead&&dist(a,b)<r)n++;if(n>bn||(n===bn&&a.x<best.x)){bn=n;best=a;}}return best;}
function sxy(u){return [u.x,fy(u.d)];}
function headY(u){return fy(u.d)-(u.lift||0)-(u.hero?(u.spr?84:70):(u.H*MON[u.t].sc+(u.fly?42:0))*(u.boss?1:1.22))*dsc(u.d);}

function num(x,y,txt,col,big){B.nums.push({x:x+rnd(-8,8),y,txt,col,t:0,big:big||0});if(B.nums.length>60)B.nums.shift();}
function part(o){if(B.parts.length>380)B.parts.shift();B.parts.push(Object.assign({vx:0,vy:0,g:0,life:1,max:1,r:2,col:'#fff',type:'spark',rot:0,vr:0,drag:0},o));}
function sparks(x,y,n,col,sp){for(let k=0;k<n;k++){const a=rnd(0,TAU),v=rnd(.4,1)*(sp||160);part({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,g:300,life:rnd(.2,.45),r:rnd(1,2.2),col:col||'#ffd54a',type:'spark'});}}
function smoke(x,y,n,col,r){for(let k=0;k<n;k++)part({x:x+rnd(-8,8),y:y+rnd(-6,6),vx:rnd(-25,25),vy:rnd(-40,-10),life:rnd(.6,1.2),r:rnd(5,10)*(r||1),col:col||'rgba(70,70,70,.5)',type:'smoke',drag:1.2});}
function debris(x,y,n,cols){for(let k=0;k<n;k++){const a=rnd(-Math.PI,0),v=rnd(80,230);part({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:520,life:rnd(.7,1.3),r:rnd(2.2,4.5),col:cols[k%cols.length],type:k%3?'bolt':'gear',vr:rnd(-14,14),floor:y+rnd(4,22)});}}
function shake(n){B.shake=Math.max(B.shake,n);}
// ---------------------------------------------------------------- FX v2 (demo) · CC0 particle textures by Kenney (kenney.nl), see img/fx/LICENSE-Kenney-CC0.txt
// Off by default. ?fx=2 turns it on (and shows the OLD/NEW toggle in battle), ?fx=1 turns it off.
let FX2=true; // v16-41: only the new effects (Marius) – the FX NEW / FX OLD switch is gone; safe mode can still turn them off if a battle cannot start
const FXN=['circle_05','flare_01','spark_05','smoke_04','magic_02','star_07','trace_01','slash_02','twirl_02','scorch_02','fire_01','flame_04','light_02','muzzle_02','circle_03','spark_02','dirt_02','star_04'];
const FXI={},FXK={};
function fxImg(n){let i=FXI[n];if(!i){i=FXI[n]=new Image();i.src='img/fx/'+n+'.webp';}return i;}
function fxPre(){FXN.forEach(fxImg);}
function fxTint(n,col){const k=n+col;if(FXK[k])return FXK[k];const im=fxImg(n);if(!im.complete||!im.naturalWidth)return null;
  const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);
  if(col!=='#ffffff'){x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,c.width,c.height);}return FXK[k]=c;}
function fxs(n,col,x,y,o){if(!FX2||!B||B.sim)return;if(B.fx2.length>260)B.fx2.shift();
  B.fx2.push(Object.assign({n,col,x,y,vx:0,vy:0,g:0,t:0,d:.5,s0:40,s1:80,a0:1,rot:0,vr:0,sx:1,sy:1,add:1,ground:0,drag:0,ease:0},o||{}));}
function fx2Update(dt){if(!B.fx2||!B.fx2.length)return;for(const p of B.fx2){p.t+=dt;if(p.t<0)continue;p.vy+=p.g*dt;if(p.drag){p.vx*=1-p.drag*dt;p.vy*=1-p.drag*dt;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;}
  B.fx2=B.fx2.filter(p=>p.t<p.d);}
function drawFx2(ground){if(!FX2||!B.fx2||!B.fx2.length)return;g.save();
  for(const p of B.fx2){if(!!p.ground!==ground||p.t<0)continue;const c=fxTint(p.n,p.col);if(!c)continue;const k=Math.min(1,p.t/p.d);
    const e=p.ease?1-(1-k)*(1-k)*(1-k):k;const sz=lerp(p.s0,p.s1,e);if(sz<=.5)continue;
    g.globalCompositeOperation=p.add?'lighter':'source-over';g.globalAlpha=Math.max(0,p.a0*Math.min(1,k*12)*(1-k*k));
    camT();g.translate(p.x,p.y);if(p.ground)g.scale(1,p.sy);g.rotate(p.rot);
    const w=sz*p.sx,h=sz*(p.ground?1:p.sy);g.drawImage(c,-w/2,-h/2,w,h);}
  g.restore();}
// building blocks
function fxBurst(x,y,col,sz){fxs('flare_01','#ffffff',x,y,{d:.28,s0:sz*.6,s1:sz*2.4,a0:.95,ease:1});fxs('scorch_02',col,x,y,{d:.32,s0:sz*.4,s1:sz*1.5,rot:rnd(0,TAU),ease:1});fxs('circle_05',col,x,y,{d:.3,s0:sz*.9,s1:sz*1.8,a0:.75});}
function fxSpark(x,y,col,n,sz){for(let k=0;k<n;k++)fxs('star_07',k%2?'#ffffff':col,x+rnd(-sz,sz),y+rnd(-sz,sz)*.6,{d:rnd(.35,.7),s0:sz*rnd(.5,.9),s1:0,vx:rnd(-40,40)*S,vy:rnd(-80,-20)*S,rot:rnd(0,TAU),vr:rnd(-5,5)});}
function fxShock(x,y,col,r){fxs('circle_03',col,x,y,{ground:1,d:.45,s0:r*.3,s1:r*2.3,sy:.34,ease:1});fxs('light_02',col,x,y,{ground:1,d:.55,s0:r*.5,s1:r*2.5,sy:.34,a0:.7,ease:1});}
function fxScorch(x,y,col,r,d){fxs('scorch_02',col,x,y,{ground:1,add:0,d:d||1.6,s0:r*1.7,s1:r*1.9,sy:.34,a0:.55,rot:rnd(0,TAU)});}
function fxSmoke(x,y,col,n,sz){for(let k=0;k<n;k++)fxs('smoke_04',col,x+rnd(-sz,sz)*.6,y+rnd(-8,8),{add:0,d:rnd(.7,1.15),s0:sz*.6,s1:sz*rnd(1.5,2.1),a0:.6,vx:rnd(-35,35)*S,vy:rnd(-40,-10)*S,rot:rnd(0,TAU),vr:rnd(-1,1),drag:1});}
function fxBolt(x0,y0,x1,y1,col,w){const L=Math.hypot(x1-x0,y1-y0)||1,a=Math.atan2(y1-y0,x1-x0)-Math.PI/2,mx=(x0+x1)/2,my=(y0+y1)/2,len=L*1.12,ww=(w||70)*S,f=Math.random()<.5?-1:1;
  fxs('spark_05',col,mx,my,{d:.3,s0:len,s1:len,sx:f*ww/len,rot:a});fxs('spark_05','#ffffff',mx,my,{d:.22,s0:len,s1:len,sx:-f*ww*.6/len,rot:a,a0:.9});}
function fxAura(u){const col=ROLECOL[u.role]||'#ffb300',x=u.x,y=fy(u.d),h=dsc(u.d);
  fxs('magic_02',col,x,y,{ground:1,d:.8,s0:30*S,s1:130*S,sy:.34,vr:3,ease:1});fxs('twirl_02',col,x,y-40*h,{d:.5,s0:30*S,s1:120*S,vr:7,a0:.85,ease:1});
  fxs('trace_01',col,x,y-70*h,{d:.55,s0:170*S,s1:220*S,sx:2.2,a0:.8});fxs('trace_01','#ffffff',x,y-70*h,{d:.4,s0:150*S,s1:200*S,sx:.9,a0:.7});fxSpark(x,y-40*h,col,6,26*S);}


function damage(src,tgt,mult,o){o=o||{};if(!tgt||tgt.dead)return 0;
  if(tgt.hero&&!o.sure){const dg=pv(tgt,'tuning',1);if(dg&&!tgt.stun&&Math.random()*100<dg){pasTxt(tgt,1,'DODGE');return 0;}}
  let a=src.atk*mult*(src.buff>0?1.3:1)*rnd(.9,1.1);if(src.hero&&src.skK>1&&(o.skill||mult>1.15))a*=src.skK; // v16-99: skill level (+6% skill damage per level)
  a*=100/(100+tgt.def*3);if(tgt.mark>0)a*=1.35;
  if(src.hero){let ld=0;for(const h of B.heroes)if(!h.dead)ld=Math.max(ld,pv(h,'all',0));if(ld)a*=1+ld/100;
    const th=pv(src,'paint',1);if(th&&tgt.slow>0)a*=1+th/100;const pr=pv(src,'inspect',1);if(pr&&tgt.mark>0)a*=1+pr/100;}
  else if(tgt.hero){const ir=pv(tgt,'engine',0);if(ir)a*=1-ir/100;}
  if(tgt.defB>0)a*=.8;if(src.weak>0)a*=.7;
  if(tgt.wbB&&src.hero&&src.role===B.tw.weak)a*=1.3; // v16-60 WORLD BOSS: the weak class deals +30%
  const crit=o.crit||(!o.noCrit&&Math.random()<src.crit+(src.critB>0?.15:0));if(crit)a*=1.8;
  a=Math.max(1,Math.round(a));let left=a;
  if(tgt.shield>0){const s=Math.min(tgt.shield,left);tgt.shield-=s;left-=s;}
  tgt.hp-=left;tgt.flash=1;tgt.hurt=1;
  if(tgt.wbB){B.wbD+=left;if(o.skill||crit)tgt.hurtS=.45;if(tgt.hp<1)tgt.hp=tgt.max;} // v16-60: endless HP bars, only the damage counts
  const [x]=sxy(tgt);const y=headY(tgt);
  if(FX2&&!B.sim&&!tgt.hero&&(o.skill||crit)){B.hs=Math.max(B.hs,o.skill?.06:.035);fxs('star_04','#ffffff',x,y+22*dsc(tgt.d),{d:.22,s0:20*S,s1:70*S,rot:rnd(0,1),ease:1});}
  num(x,y,(crit?'💥':'')+a,tgt.hero?'#ff8a80':crit?'#ffd54a':'#ffffff',crit?1:0);
  if(tgt.hero&&!(tgt.enLock>0))tgt.en=Math.min(100,tgt.en+a/tgt.max*55*tgt.eg);
  if(src.hero&&!(src.enLock>0))src.en=Math.min(100,src.en+(o.skill?0:11*src.eg)); // v16-98: no charge for 3 s after an ultimate
  if(tgt.hp<=0){kill(tgt);const ad=pv(src,'tuning',0);if(ad&&!tgt.hero){src.aspdK=Math.max(src.aspd>0?(src.aspdK||0):0,ad/100);src.aspd=Math.max(src.aspd,4);pasTxt(src,0);}}
  else if(tgt.hero){const ls=pv(tgt,'engine',1);if(ls&&!tgt.ls&&tgt.hp<tgt.max*.35){tgt.ls=1;tgt.shield=Math.max(tgt.shield,tgt.max*ls/100);tgt.taunt=Math.max(tgt.taunt,3);pasTxt(tgt,1,'LAST STAND!');if(!B.sim)B.fx.push({type:'ring',x:tgt.x,y:fy(tgt.d),t:0,d:.5,r:60*S,col:'#ffd54a',ground:1});}
    if(tgt.hp<tgt.max*.3)for(const h of B.heroes){const ek=pv(h,'service',1);if(ek&&!h.dead&&h.ekCd<=0){h.ekCd=15;heal(tgt,tgt.max*ek/100);pasTxt(h,1);if(!B.sim)B.fx.push({type:'plus',u:tgt,t:0,d:.7});break;}}}
  return a;}
function heal(u,amt){if(B.hk>1&&u.hero)amt*=B.hk;if(u.dead||(B.mod==='noheal'&&u.hero))return;const a=Math.round(Math.min(amt,u.max-u.hp));u.hp+=a;if(a>0)num(u.x,headY(u),'+'+a,'#69f0ae');}
function kill(u){u.hp=0;u.dead=true;u.deadT=0;u.st='dead';u.act=null;u.sP=null;u.sT=null;
  const [x,y]=sxy(u);
  if(u.hero){B.deaths++;smoke(x,y-20,6);num(x,headY(u)-10,'K.O.','#ff5252',1);}
  else{if(!B.sim){const n=B.t-(B.lastK||-9)<1.1?(B.kn||1)+1:1;B.kn=n;B.lastK=B.t;if(n>=2){B.combo={n,t:0};punch(.03+Math.min(3,n)*.01);}}
    const s=u.boss?3:MON[u.t].big;debris(x,y-u.H*.4*dsc(u.d),Math.round(10*s),['#9ea7ad','#607d8b','#ffca28','#424242','#b0bec5']);smoke(x,y-u.H*.4*dsc(u.d),Math.round(6*s),'rgba(60,60,60,.55)',s);sparks(x,y-u.H*.5*dsc(u.d),Math.round(12*s),'#ffab00',220);
    B.fx.push({type:'boom',x,y:y-u.H*.4*dsc(u.d),t:0,d:.45,r:28*s*S});shake(u.boss?16:4);
    if(FX2){const yy=y-u.H*.4*dsc(u.d);fxs('fire_01','#ff9100',x,yy,{d:.5,s0:20*S,s1:70*s*S,rot:rnd(0,TAU),ease:1});fxBurst(x,yy,'#ffab00',26*s*S);fxSmoke(x,yy,'#4e4e4e',Math.round(3+s),26*s*S);fxScorch(x,y,'#2b1a10',22*s*S);if(u.boss)B.hs=.25;}
    if(u.boss){B.flash=.8;punch(.09);}}}

// projectiles
function shoot(src,tgt,type,mult,o){const [x,y]=sxy(src);const mz=src.hero&&sprOK(src.spr)?muzzle(src):null;B.proj.push(Object.assign({src,tgt,type,mult,x:mz?mz[0]:src.x+src.face*14*S,d:src.d,h:mz?fy(src.d)-mz[1]:(src.fly?44:34)*dsc(src.d),t:0,spd:type==='wrench'?420:type==='bomb'?300:360,rot:0},o||{}));}
function projUpdate(p,dt){
  const tg=p.tgt;if(!p.tx||(tg&&!tg.dead)){if(tg){p.tx=tg.x;p.td=tg.d;}}
  const dx=p.tx-p.x,dd=(p.td-p.d)*(FY1-FY0),L=Math.hypot(dx,dd);const step=p.spd*S*dt;
  p.rot+=dt*18;
  if(p.type==='bomb'||p.type==='wrench'||p.type==='acid'){p.t+=dt;}
  if(L<=step+2){p.x=p.tx;p.d=p.td;projHit(p);return true;}
  p.x+=dx/L*step;p.d+=dd/L*step/(FY1-FY0);
  if(p.type==='bomb'||p.type==='acid'){p.h=Math.max(10,p.h0?p.h0:(p.h0=p.h))+Math.sin(Math.min(1,p.t*p.spd*S/(p.L0||(p.L0=L+1)))*Math.PI)*(p.type==='acid'?45:60);}
  if(FX2&&p.type==='wrench')fxs('circle_05','#ffd54a',p.x,fy(p.d)-p.h,{d:.3,s0:30*S,s1:4*S,a0:.7});
  if(p.type==='fire'&&Math.random()<.7)part({x:p.x,y:fy(p.d)-p.h,vx:rnd(10,30),vy:rnd(-20,5),life:.3,r:rnd(3,5),col:Math.random()<.5?'rgba(255,160,0,.8)':'rgba(255,60,0,.7)',type:'flame'});
  if(p.type==='acid'&&Math.random()<.4)part({x:p.x,y:fy(p.d)-p.h,vx:0,vy:30,g:200,life:.35,r:1.8,col:'#b2ff59',type:'spark'});
  if(p.type==='smoke'&&Math.random()<.5)part({x:p.x,y:fy(p.d)-p.h,vx:rnd(-10,10),vy:rnd(-10,10),life:.4,r:rnd(3,5),col:'rgba(90,90,90,.45)',type:'smoke'});
  if(p.type==='paint'&&Math.random()<.4)part({x:p.x,y:fy(p.d)-p.h,vx:0,vy:20,g:200,life:.3,r:1.6,col:p.col,type:'spark'});
  return false;}
function projHit(p){const s=p.src,[x,y0]=[p.x,fy(p.d)],y=y0-p.h;
  if(p.type==='bolt'||p.type==='wrench'){damage(s,p.tgt,p.mult,{skill:p.type==='wrench'});sparks(x,y,8,'#ffe082');if(p.type==='wrench'){shake(5);B.fx.push({type:'ring',x,y,t:0,d:.3,r:30*S,col:'#ffd54a'});fxBurst(x,y,'#ffd54a',44*S);fxSpark(x,y,'#ffd54a',6,24*S);}else if(FX2)fxs('flare_01','#e0f7fa',x,y,{d:.18,s0:14*S,s1:46*S});
    if(s.role==='service'&&++s.hits%3===0){const w=alive(B.heroes).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];if(w){heal(w,w.max*.06);B.fx.push({type:'plus',u:w,t:0,d:.7});}}}
  else if(p.type==='paint'){damage(s,p.tgt,p.mult);const sp=pv(s,'paint',0);if(sp&&p.tgt&&!p.tgt.dead)p.tgt.slow=Math.max(p.tgt.slow,sp);for(const m of alive(B.mons))if(m!==p.tgt&&Math.abs(m.x-x)<35*S&&Math.abs(m.d-p.d)<.12)damage(s,m,p.mult*.6,{noCrit:1});
    for(let k=0;k<10;k++)part({x,y,vx:rnd(-90,90),vy:rnd(-120,10),g:380,life:.5,r:rnd(1.5,3),col:p.col,type:'spark'});}
  else if(p.type==='smoke'){damage(s,p.tgt,p.mult);smoke(x,y,5,'rgba(80,80,80,.5)');}
  else if(p.type==='acid'){damage(s,p.tgt,p.mult);for(const h of alive(B.heroes))if(h!==p.tgt&&Math.hypot(h.x-x,(h.d-p.d)*(FY1-FY0)*1.25)<38*S)damage(s,h,p.mult*.45,{noCrit:1});
    B.fx.push({type:'ring',x,y:y0,t:0,d:.4,r:34*S,col:'#76ff03',ground:1});for(let k=0;k<12;k++)part({x,y,vx:rnd(-80,80),vy:rnd(-110,0),g:380,life:.5,r:rnd(1.5,3),col:k%2?'#76ff03':'#c6ff00',type:'spark'});}
  else if(p.type==='wave'){damage(s,p.tgt,p.mult);if(p.tgt&&!p.tgt.dead)p.tgt.slow=Math.max(p.tgt.slow,2);B.fx.push({type:'ring',x,y,t:0,d:.35,r:26*S,col:'#ffe082'});}
  else if(p.type==='fire'){damage(s,p.tgt,p.mult);sparks(x,y,8,'#ff9100');smoke(x,y,2,'rgba(60,40,30,.45)');}
  else if(p.type==='bomb'){const P=p.p||{},R=(P.rad||100)*S;B.fx.push({type:'paintBoom',x,y:y0,t:0,d:.6,r:R});if(s.spr&&s.spr.bi)B.fx.push({type:'sprBoom',x,y:y0,t:0,d:.7,r:R,im:s.spr.bi});
    if(FX2){const pc=['#e0457b','#29b6f6','#ffd21a','#76ff03','#d05cff'];for(let k=0;k<7;k++){const a=k/7*TAU;fxs('smoke_04',pc[k%5],x+Math.cos(a)*R*.35,y0-14+Math.sin(a)*R*.12,{add:0,d:rnd(.8,1.1),s0:30*S,s1:R*rnd(1.1,1.5),a0:.8,rot:rnd(0,TAU),vr:rnd(-1,1),vx:Math.cos(a)*40*S,vy:-20*S,drag:1.5,ease:1});}
      fxBurst(x,y0-14,'#ff4fd8',60*S);fxShock(x,y0,'#d05cff',R*.6);for(let k=0;k<5;k++)fxScorch(x+rnd(-R,R)*.6,y0+rnd(-8,8),pc[k],R*.35,4);}if(P.puddle!==undefined?P.puddle:!P.pal)B.fx.push({type:'puddle',x,y:y0,d0:p.d,t:0,d:4,r:R*.85,src:s,tick:0});shake(8);
    const cols=P.pal||['#e0457b','#29b6f6','#ffd21a','#76ff03','#d05cff'];for(let k=0;k<40;k++){const a=rnd(0,TAU),v=rnd(60,260);part({x,y:y0-10,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.5-120,g:420,life:rnd(.5,.9),r:rnd(2,4),col:cols[k%5],type:'spark'});}
    for(const m of alive(B.mons))if(Math.hypot(m.x-x,(m.d-p.d)*(FY1-FY0)*1.25)<R){damage(s,m,p.mult||1.8,{skill:1});m.slow=Math.max(m.slow,P.slow||(P.pal?0:4));if(P.stun)m.stun=Math.max(m.stun,P.stun);if(P.push&&!m.boss)m.x+=P.push*S*(m.x>=x?1:.4);if(P.mark)m.mark=Math.max(m.mark,P.mark);if(P.weak)m.weak=Math.max(m.weak,P.weak);if(P.burn)burnOn(m,s);}}}

// ---------------------------------------------------------------- hero skills
function canCast(u){return B.phase==='fight'&&!u.dead&&u.en>=100&&u.stun<=0&&!u.act&&alive(B.mons).length>0;}
function cast(u){if(!canCast(u))return;u.en=0;u.enLock=3;B.slowT=Math.max(B.slowT,1.3);B.flash=.35;punch(.045);if(FX2&&!sprOK(u.spr))fxAura(u); // v16-40: heroes with Marius' pictures show only the effect drawn in their own skill animation
  B.banner={u,t:0,name:skOf(u.h).sk};
  const R=u.role,ms=alive(B.mons);
  if(SKF[u.h.id]){B.hk=u.skK||1;try{SKF[u.h.id](u,ms);}finally{B.hk=1;}return;}
  const P=skp(u);
  if(R==='engine'){const c=cluster(ms,(P.rad||95)*S)||ms[0];u.act={k:'leap',t:0,dur:.55,x0:u.x,d0:u.d,x1:c.x-24*S,d1:c.d,p:P};u.st='leap';}
  else if(R==='tuning'){u.act={k:'dash',t:0,x0:u.x,d0:u.d,hit:new Set(),back:false,mult:P.mult,band:P.band,col:P.col,p:P};u.st='dash';if(P.aspd)teamBuff({aspd:P.aspd,aspdK:.25,col:'#40c4ff',txt:'SPEED UP'});}
  else if(R==='all'){u.act={k:'cast',t:0,dur:.6,fire:()=>{for(const m of alive(B.mons)){B.fx.push({type:'gear',x:m.x+rnd(-10,10),tgt:m,y0:-40,t:-rnd(0,.5),d:.55,src:u,r:rnd(14,20)*S});}
      for(let k=0;k<8;k++)B.fx.push({type:'gear',x:rnd(W*.3,W),tgt:null,y0:-40,t:-rnd(0,.8),d:.55,src:u,r:rnd(8,14)*S,dl:rnd(0,1)});
      for(const h of alive(B.heroes)){h.buff=6;B.fx.push({type:'plus',u:h,t:0,d:.7,col:'#ffab00',txt:'ATK+30%'});}}};u.st='cast';}
  else{u.act={k:'cast',t:0,dur:R==='service'||R==='inspect'?.5:.35,fire:()=>skillFire(u)};u.st='cast';}}
function skillFire(u){B.hk=u.skK||1;try{return skillFire0(u);}finally{B.hk=1;}}
function skillFire0(u){const R=u.role,ms=alive(B.mons);if(!ms.length)return;
  const P=skp(u);
  if(P.snipe){const t=ms.slice().sort((a,b)=>b.hp-a.hp)[0],[bx,by]=muzzle(u,20,44),x=t.x,y=headY(t)+22*dsc(t.d);B.fx.push({type:'beam',x0:bx,y0:by,x1:x,y1:y,t:0,d:.5,col:P.col,w:14});
    damage(u,t,4.5,{crit:1,skill:1});t.mark=Math.max(t.mark,6);shake(10);B.fx.push({type:'ring',x,y,t:0,d:.4,r:50*S,col:P.col});if(FX2){fxBurst(x,y,P.col,70*S);fxs('flare_01','#ffffff',x,y,{d:.3,s0:20*S,s1:110*S});}return;}
  if(P.wave||R==='inspect'){B.fx.push({type:'scan',x:u.x,t:0,d:.7,src:u,hit:new Set(),p:P});if(P.crit||P.atk)teamBuff({crit:P.crit,atk:P.atk,col:P.col,txt:P.crit?'CRIT UP':'ATK+30%'});return;}
  if(P.coil){B.fx.push({type:'coil',x:u.x+50*S,dd:u.d,t:0,d:4,tick:0,src:u});return;}
  if(R==='service'){const low=P.low&&alive(B.heroes).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];
    for(const h of alive(B.heroes)){heal(h,h.max*(P.heal||.32));const hd=P.hotT||4;if(P.hot!==0){h.hot=hd;h.hotA=h.max*(P.hot||.12)/hd;}if(P.cleanse)h.stun=0;if(P.shield)h.shield=Math.max(h.shield,h.max*P.shield);if(h===low){heal(h,h.max*P.low);num(h.x,headY(h)-16,'PATCHED!','#b2ff59',1);}
      B.fx.push({type:'oil',u:h,t:0,d:.9});
      if(FX2){const hx=h.x,hy=fy(h.d),hh=dsc(h.d);fxs('magic_02','#69f0ae',hx,hy,{ground:1,d:1,s0:20*S,s1:90*S,sy:.34,vr:2.5,ease:1});fxs('light_02','#69f0ae',hx,hy-36*hh,{d:.7,s0:30*S,s1:100*S,a0:.8,ease:1});fxs('trace_01','#b9f6ca',hx,hy-50*hh,{d:.6,s0:110*S,s1:150*S,sx:1.6,a0:.7});fxSpark(hx,hy-40*hh,'#69f0ae',5,22*S);}}
    if(P.atk||P.def)teamBuff({atk:P.atk,def:P.def,col:P.col,txt:P.atk?'ATK+30%':'DEF UP'});}
  else if(R==='paint'){const c=cluster(ms,(P.rad||100)*S);shoot(u,c,'bomb',P.mult||1.8,{spd:340,p:P});}
  else if(R==='elec'&&P.allz){for(const m of ms){B.fx.push({type:'bolt',x0:m.x+rnd(-20,20)*S,y0:FY0-150*S,x1:m.x,y1:headY(m)+22*dsc(m.d),t:-rnd(0,.25),d:.3,col:u.spr&&u.spr.col||'#80d8ff'});damage(u,m,P.mult,{skill:1});m.stun=Math.max(m.stun,P.stun);B.fx.push({type:'ring',x:m.x,y:fy(m.d),t:0,d:.5,r:40*S,col:'#80d8ff',ground:1});if(FX2)fxBolt(m.x,FY0-150*S,m.x,headY(m)+22*dsc(m.d),'#80d8ff',40);}shake(8);}
  else if(R==='elec'){let cur=u,used=[];const chain=[];for(let k=0;k<(P.jumps||6);k++){let pool=ms.filter(m=>!m.dead&&!used.includes(m));if(!pool.length){used=[];pool=ms.filter(m=>!m.dead&&m!==cur);}if(!pool.length)break;
      const n=nearest(cur,pool);chain.push([cur,n]);used.push(n);cur=n;}
    chain.forEach(([a,b],k)=>B.fx.push({type:'chain',a,b,t:-k*.08,d:.35,src:u,mult:(P.mult||2)*Math.pow(P.decay||.9,k),stun:P.stun,done:false}));}
  else if(R==='crew'){const t=nearest(u,ms);shoot(u,t,'wrench',2.5,{spd:440});}}

// ---------------------------------------------------------------- v16-14: unique skills (Legendary / Mythic)
function teamBuff(o){for(const h of alive(B.heroes)){if(o.atk){h.buff=Math.max(h.buff,o.atk);}if(o.aspd){h.aspdK=Math.max(h.aspd>0?(h.aspdK||0):0,o.aspdK);h.aspd=Math.max(h.aspd,o.aspd);}
  if(o.def)h.defB=Math.max(h.defB,o.def);if(o.crit)h.critB=Math.max(h.critB,o.crit);B.fx.push({type:'plus',u:h,t:0,d:.8,col:o.col||'#ffab00',txt:o.txt});}}
function imgFx(k,x,y,w,d,o){B.fx.push(Object.assign({type:'imgfx',k,x,y,w,t:0,d},o||{}));}
function burnOn(m,src){m.burn=4;m.burnSrc=src;}
function castAct(u,dur,fire){u.act={k:'cast',t:0,dur,fire};u.st='cast';}
const SKF={
 m4_0(u){castAct(u,.75,()=>{const y=fy(.5);shake(14);u.post=.6;B.fx.push({type:'quake',x0:u.x+30*S,t:0,d:1.1,src:u,hit:new Set()});
   B.fx.push({type:'ring',x:u.x+30*S,y:fy(u.d),t:0,d:.5,r:90*S,col:'#ffd54a',ground:1});debris(u.x+30*S,fy(u.d),10,['#6d4c41','#9e9e9e','#ffca28']);
   if(FX2){fxShock(u.x+30*S,fy(u.d),'#ffd54a',90*S);fxBurst(u.x+30*S,fy(u.d)-14*S,'#ffab00',50*S);}
   u.taunt=4;u.shield=Math.max(u.shield,u.max*.3);});},
 m4_1(u){const f8=u.spr&&u.spr.fx8&&u.spr.fi&&u.spr.fi.naturalWidth; // v16-96: her own holy pillar (8 frames), peak (frame 5) = the moment of the heal
   if(f8){const dd=!u.rev&&B.heroes.find(h=>h.dead&&h!==u);for(const h of B.heroes)if(!h.dead||h===dd)B.fx.push({type:'sheet8',t:-.32,d:.96,sp:u.spr,x:h.x,dd:h.d});}
   castAct(u,.8,()=>{const dead=!u.rev&&B.heroes.find(h=>h.dead&&h!==u);u.post=.6;
   if(dead){u.rev=1;dead.dead=false;dead.hp=Math.round(dead.max*.4);dead.deadT=0;dead.st='idle';dead.act=null;dead.stun=0;dead.lift=0;dead.en=0;
     num(dead.x,headY(dead)-16,'REVIVED!','#fff59d',1);if(!f8)imgFx('holy',dead.x,fy(dead.d)+6*S,120*S,1.3);}
   for(const h of alive(B.heroes)){heal(h,h.max*.35);h.hot=4;h.hotA=h.max*.15/4;if(h!==dead&&!f8)imgFx('holy',h.x,fy(h.d)+6*S,90*S,1);
     if(FX2){fxs('magic_02','#fff176',h.x,fy(h.d),{ground:1,d:1,s0:20*S,s1:90*S,sy:.34,vr:2.5,ease:1});fxSpark(h.x,fy(h.d)-40*dsc(h.d),'#fff176',5,22*S);}}
   teamBuff({def:6,col:'#fff176',txt:'DEF UP'});B.flash=.5;});},
 m4_2(u,ms){const c=cluster(ms,100*S)||ms[0];castAct(u,.6,()=>{const cx=c.x,cd=c.d,v=u.spr&&u.spr.fx8&&u.spr.fi&&u.spr.fi.naturalWidth;u.post=.6;
   // v16-96: Duke's own vortex (8 frames): tornado grows, frame 5 = crystal burst → damage + freeze land then (old image fx only if the sheet didn't load)
   if(v){B.fx.push({type:'sheet8',t:-.12,d:1.25,sp:u.spr,x:cx,dd:cd});if(FX2)fxBurst(cx,fy(cd)-30*S,'#d05cff',50*S);}else imgFx('vortex',cx,fy(cd)+12*S,215*S,1.1,{spin:1});
   B.fx.push({type:'dvort',t:v?-.67:0,src:u,x:cx,dd:cd});shake(6);});},
 m4_3(u,ms){castAct(u,.85,()=>{const cx=ms.reduce((a,m)=>a+m.x,0)/ms.length,top=FY0-120*S;B.fx.push({type:'imgfx',k:'cloud',x:cx,y:top+40*S,w:Math.min(W*.9,300*S),t:0,d:1.6,cloud:1});
   for(let k=0;k<8;k++)B.fx.push({type:'strike',t:-.25-k*.13,d:.3,src:u,top});
   teamBuff({aspd:6,aspdK:.25,col:'#ffd54a',txt:'SPEED UP'});});},
 m4_4(u,ms){castAct(u,1,()=>{B.flash=.45;B.slowT=Math.max(B.slowT,1.3);
   for(const m of alive(B.mons)){m.slow=Math.max(m.slow,6);m.mark=Math.max(m.mark,6);m.tw=6;imgFx('hglass',m.x,headY(m)-8*S,30*S,1.4,{float:1,u:m});damage(u,m,.6,{skill:1,noCrit:1});}
   teamBuff({aspd:6,aspdK:.4,col:'#80d8ff',txt:'SPEED UP'});});},
 m4_5(u){u.act={k:'dash',t:0,x0:u.x,d0:u.d,hit:new Set(),back:false,fire:1,mult:2.8};u.st='dash';},
 m5_0(u,ms){castAct(u,.85,()=>{for(const m of alive(B.mons))B.fx.push({type:'gear',x:m.x+rnd(-10,10),tgt:m,y0:-40,t:-rnd(0,.5),d:.55,src:u,r:rnd(15,21)*S,mult:3.2});
   for(let k=0;k<8;k++)B.fx.push({type:'gear',x:rnd(W*.3,W),tgt:null,y0:-40,t:-rnd(0,.8),d:.55,src:u,r:rnd(8,14)*S});
   const c=cluster(alive(B.mons),100*S)||alive(B.mons)[0];if(c){B.fx.push({type:'mega',t:-.75,d:1.1,src:u,x:c.x,dd:c.d});if(u.spr&&u.spr.fx8)B.fx.push({type:'sheet8',t:-.28,d:.96,sp:u.spr,x:c.x,dd:c.d});}
   teamBuff({atk:8,def:8,col:'#ff7043',txt:'ATK+30% DEF UP'});});},
 m5_1(u){castAct(u,.45,()=>{u.act={k:'dash',t:0,x0:u.x,d0:u.d,hit:new Set(),back:false,fire:1,all:1,mult:3};u.st='dash';
   if(u.spr&&u.spr.fx8){const c=cluster(alive(B.mons),100*S)||alive(B.mons)[0];if(c){const tt=Math.max(0,(c.x-u.x)/(1100*S));B.fx.push({type:'sheet8',t:-Math.max(0,tt-.46),d:.96,sp:u.spr,x:c.x,dd:c.d});}} // v16-95: fire trail → explosion (frame 5) when she passes the biggest group
   teamBuff({aspd:6,aspdK:.3,crit:6,col:'#ff5252',txt:'OVERDRIVE!'});});}};

// ---------------------------------------------------------------- monster specials
function monSpecial(m,dt){const hs=alive(B.heroes);if(!hs.length)return false;
  if(m.b==='pound'||m.b==='crusher'||m.b==='titan'){m.sp1-=dt;if(m.sp1<=0&&!m.act){const tg=m.b==='titan'?(cluster(hs,110*S)||hs[0]):nearest(m,hs);
      const r=(m.b==='titan'?115:m.b==='crusher'?85:72)*S;m.sp1=m.b==='titan'?(MON[m.t].noLz?(m.enr?3.5:4.5):m.enr?5:7):m.b==='crusher'?6:8;
      const tx=m.b==='titan'?tg.x:clamp(tg.x,m.x-140*S,m.x+140*S);
      B.tele.push({type:'circle',x:tx,d:tg.d,r,t:0,dur:1.05,col:'#ff1744'});
      m.act={k:'pound',t:0,dur:1.05,tx,td:tg.d,r};m.st='pound';m.ap=0;m.face=tx<m.x?-1:1;return true;}}
  if(m.b==='crusher'){m.sp2-=dt;if(m.sp2<=0&&!m.act){const tg=hs[Math.floor(Math.random()*hs.length)];m.sp2=11;
      B.tele.push({type:'lane',x0:W*.04,x1:m.x,d:tg.d,w:.13,t:0,dur:1.0,col:'#ff6d00'});m.act={k:'charge',t:0,dur:1.0,hit:new Set(),x0:m.x,d:tg.d};m.st='idle';return true;}}
  if(m.b==='titan'){m.sp2-=dt;m.sp3-=dt;
    if(m.sp2<=0&&!m.act){const tg=hs[Math.floor(Math.random()*hs.length)];m.sp2=m.enr?9:12;B.tele.push({type:'lane',x0:0,x1:m.x-40*S,d:tg.d,w:.16,t:0,dur:1.3,col:MON[m.t].lc});
      m.act={k:'laser',t:0,dur:1.3,d:tg.d,fired:false};m.st='laser';return true;}
    if(m.sp3<=0&&!m.act){m.sp3=16;for(let k=0;k<2;k++){const im=mkMon(MON[m.t].summ||'imp',0);im.x=m.x-40*S;im.d=clamp(m.d+(k?.25:-.25),.05,.95);B.mons.push(im);sparks(im.x,fy(im.d)-20,14,'#80d8ff');}
      num(m.x,headY(m)+20,'SUMMON!','#80d8ff',1);}}
  return false;}
function monAct(m,dt){const a=m.act;a.t+=dt;
  if(a.k==='pound'){m.ap=a.t/a.dur;if(a.t>=a.dur){const hs=alive(B.heroes);const mult=m.b==='titan'?2.0:m.b==='crusher'?1.9:1.8;
      for(const h of hs)if(Math.hypot(h.x-a.tx,(h.d-a.td)*(FY1-FY0)*1.25)<a.r){damage(m,h,mult);h.stun=Math.max(h.stun,.8);}
      const y=fy(a.td);B.fx.push({type:'ring',x:a.tx,y,t:0,d:.45,r:a.r,col:'#ff8a65',ground:1});smoke(a.tx,y,10,'rgba(120,90,60,.55)',1.4);debris(a.tx,y,8,['#6d4c41','#8d6e63','#9e9e9e']);shake(m.boss?14:9);if(FX2){fxShock(a.tx,y,'#ff5722',a.r*.8);fxs('dirt_02','#6d4c41',a.tx,y-12*S,{add:0,d:.55,s0:40*S,s1:a.r*1.6,rot:rnd(0,TAU),ease:1});fxScorch(a.tx,y,'#2b1a10',a.r*.6,2);}
      m.act=null;m.st='idle';m.cd=m.as*.6;}}
  else if(a.k==='charge'){if(a.t<a.dur){m.st='idle';m.d+=(a.d-m.d)*Math.min(1,dt*5);m.ap=a.t/a.dur;return;}m.st='walk';m.wph+=dt*24;m.face=-1;m.x-=520*S*dt;
    for(const h of alive(B.heroes))if(!a.hit.has(h)&&Math.abs(h.x-m.x)<30*S&&Math.abs(h.d-m.d)<.14){a.hit.add(h);damage(m,h,2.2);h.x-=30*S;h.stun=Math.max(h.stun,.6);shake(8);}
    if(Math.random()<.6)smoke(m.x+30*S,fy(m.d),1,'rgba(140,110,80,.5)');
    if(m.x<=W*.06){m.act={k:'return',t:0};}}
  else if(a.k==='return'){m.face=1;m.st='walk';m.wph+=dt*10;m.x+=m.mv*dt*1.5;if(m.x>=Math.min(a.x0||W*.7,W*.72)){m.act=null;m.face=-1;}}
  else if(a.k==='laser'){if(a.t>=a.dur&&!a.fired){a.fired=true;shake(12);for(const h of alive(B.heroes))if(Math.abs(h.d-a.d)<.16)damage(m,h,2.0);const LZ=MON[m.t].lz||[30,185];B.fx.push({type:'beam',x0:m.x-LZ[0]*dsc(m.d),y0:fy(m.d)-LZ[1]*dsc(m.d),x1:-20,y1:fy(a.d)-30*dsc(a.d),t:0,d:.6,col:MON[m.t].lc,w:16});}
    if(a.t>=a.dur+.6){m.act=null;m.st='idle';}}}

// ---------------------------------------------------------------- update
function unitUpdate(u,dt,foes,friends){
  u.flash=Math.max(0,u.flash-dt*6);u.hurt=Math.max(0,u.hurt-dt*4);if(u.land>0)u.land-=dt;if(u.post>0)u.post-=dt;if(u.enLock>0)u.enLock-=dt;
  if(u.dead){u.deadT+=dt;return;}
  u.stun=Math.max(0,u.stun-dt);u.slow=Math.max(0,u.slow-dt);u.mark=Math.max(0,u.mark-dt);
  if(!u.hero){u.ice=Math.max(0,u.ice-dt);u.weak=Math.max(0,u.weak-dt);u.tw=Math.max(0,u.tw-dt);if(u.burn>0){u.burn-=dt;u.burnT+=dt;if(Math.random()<.35)part({x:u.x+rnd(-10,10)*S,y:headY(u)+rnd(14,40)*dsc(u.d),vx:rnd(-10,10),vy:rnd(-50,-20),life:.4,r:rnd(3,6)*S,col:Math.random()<.5?'rgba(255,145,0,.8)':'rgba(255,61,0,.7)',type:'flame'});
    if(u.burnT>=.5){u.burnT=0;if(u.burnSrc)damage(u.burnSrc,u,.22,{noCrit:1,skill:1});if(u.dead)return;}}}
  if(u.hero){u.buff=Math.max(0,u.buff-dt);u.aspd=Math.max(0,u.aspd-dt);u.defB=Math.max(0,u.defB-dt);u.critB=Math.max(0,u.critB-dt);u.taunt=Math.max(0,u.taunt-dt);if(u.shield>0)u.shield=Math.max(0,u.shield-u.max*.04*dt);
    if(u.hot>0){u.hot-=dt;u.hotT=(u.hotT||0)+dt;if(u.hotT>=1){u.hotT=0;heal(u,u.hotA);}}
    if(u.pn){u.ekCd=Math.max(0,u.ekCd-dt);
      const fc=pv(u,'service',0);if(fc){u.fcT=Math.min(6,u.fcT+dt);if(u.fcT>=6){const w=alive(B.heroes).filter(h=>h.hp<h.max*.97).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];if(w){u.fcT=0;heal(w,w.max*fc/100);if(!B.sim)B.fx.push({type:'plus',u:w,t:0,d:.7});}}}
      const sw=pv(u,'all',1);if(sw&&u.hp<u.max*.5){u.swT+=dt;if(u.swT>=1){u.swT=0;heal(u,u.max*sw/100);}}}}
  if(u.stun>0){u.st='idle';u.act=u.act&&u.act.k==='return'?u.act:null;return;}
  // hero actions
  if(u.act&&u.hero){const a=u.act;a.t+=dt;
    if(a.k==='cast'){u.st='cast';if(!a.f&&a.t>=a.dur*.6){a.f=1;a.fire();if(u.act!==a)return;}if(a.t>=a.dur){u.act=null;u.st='idle';if(u.spr)u.land=.3;}return;}
    if(a.k==='leap'){const k=Math.min(1,a.t/a.dur);u.x=lerp(a.x0,a.x1,k);u.d=lerp(a.d0,a.d1,k);u.lift=Math.sin(k*Math.PI)*80*S;
      if(k>=1){u.lift=0;const P=a.p||{},R=(P.rad||95)*S,y=fy(u.d),RC=P.col||'#ffab00';B.fx.push({type:'ring',x:u.x+24*S,y,t:0,d:.5,r:R,col:RC,ground:1});B.fx.push({type:'ring',x:u.x+24*S,y,t:-.08,d:.5,r:R*.6,col:'#fff3c4',ground:1});
        smoke(u.x+20*S,y,12,'rgba(150,110,70,.55)',1.3);debris(u.x+20*S,y,10,['#6d4c41','#9e9e9e','#ffca28']);shake(14);
        if(FX2){const lx=u.x+24*S;fxShock(lx,y,RC,R);if(P.weak||P.burn)fxSmoke(lx,y,P.col||'#616161',8,60*S);fxScorch(lx,y,'#2b1a10',R*.7,2.5);fxBurst(lx,y-18*S,'#ff6d00',60*S);fxs('dirt_02','#8d6e63',lx,y-14*S,{add:0,d:.55,s0:40*S,s1:180*S,a0:.95,rot:rnd(0,TAU),ease:1});fxSmoke(lx,y,'#a1887f',6,50*S);B.hs=.12;}
        for(const m of alive(B.mons))if(Math.hypot(m.x-(u.x+24*S),(m.d-u.d)*(FY1-FY0)*1.25)<R){damage(u,m,P.mult||2.2,{skill:1});m.stun=Math.max(m.stun,P.stun||1.2);if(!m.boss)m.x+=(P.push||26)*S;if(P.slow)m.slow=Math.max(m.slow,P.slow);if(P.weak)m.weak=Math.max(m.weak,P.weak);if(P.burn)burnOn(m,u);}
        if(P.rage){u.buff=Math.max(u.buff,P.rage);u.aspdK=Math.max(u.aspd>0?u.aspdK:0,.3);u.aspd=Math.max(u.aspd,P.rage);num(u.x,headY(u)-14,'RAGE!','#ff7043',1);}
        u.taunt=4;u.shield=Math.max(u.shield,u.max*(P.shield||.25));u.act=null;u.st='idle';u.cd=.3;u.land=u.spr&&u.spr.lt||.32;}
      return;}
    if(a.k==='dash'){const v=1100*S*dt;
      if(!a.back){u.face=1;u.x+=v;u.st='dash';
        const F=a.fire,P=a.p||{},c1=F?'#ff6d00':a.col||'#40c4ff',c2=F?'#ff3d00':a.col||'#2979ff',c3=F?'#ffd180':a.col?hexA(a.col,.6):'#80d8ff';
        for(const m of alive(B.mons))if(!a.hit.has(m)&&Math.abs(m.x-u.x)<26*S&&(a.all||Math.abs(m.d-u.d)<(a.band||.2))){a.hit.add(m);damage(u,m,a.mult||2.6,{crit:1,skill:1});if(F)burnOn(m,u);if(P.mark)m.mark=Math.max(m.mark,P.mark);if(P.slow)m.slow=Math.max(m.slow,P.slow);
          if(P.splash){for(const o of alive(B.mons))if(o!==m&&Math.hypot(o.x-m.x,(o.d-m.d)*(FY1-FY0)*1.25)<60*S)damage(u,o,P.splash,{noCrit:1,skill:1});B.fx.push({type:'ring',x:m.x,y:fy(m.d),t:0,d:.4,r:60*S,col:c1,ground:1});if(FX2)fxBurst(m.x,fy(m.d)-20*S,c1,50*S);shake(4);}if(u.spr&&u.spr.dboom&&u.spr.bi)B.fx.push({type:'sprBoom',x:m.x,y:fy(m.d),t:0,d:.6,r:60*S,im:u.spr.bi});sparks(m.x,headY(m)+20,10,c1);if(FX2){fxs('slash_02',c1,m.x,headY(m)+24*dsc(m.d),{d:.25,s0:50*S,s1:90*S,rot:-Math.PI/2+rnd(-.4,.4),ease:1});fxBurst(m.x,headY(m)+24*dsc(m.d),c2,40*S);if(F)fxs('fire_01','#ff9100',m.x,headY(m)+24*dsc(m.d),{d:.4,s0:20*S,s1:80*S,rot:rnd(0,TAU),ease:1});}}
        if(FX2&&!sprOK(u.spr)){const ty=fy(u.d)-30*dsc(u.d);fxs('muzzle_02',c2,u.x-26*S,ty,{d:.22,s0:70*S,s1:40*S,rot:-Math.PI/2,a0:.9});fxs('trace_01',c3,u.x-60*S,ty+rnd(-14,14)*S,{d:.25,s0:120*S,s1:160*S,sx:.6,rot:Math.PI/2,a0:.7});}
        for(let k=0;k<(F?5:3);k++)part({x:u.x-rnd(0,F?40:24)*S,y:fy(u.d)-rnd(4,40)*S,vx:rnd(-60,-20),vy:rnd(-20,20),life:rnd(.25,.5),r:rnd(3,F?9:7)*S,col:F?(k%2?'rgba(255,109,0,.75)':'rgba(255,214,0,.8)'):(k%2?'rgba(41,121,255,.7)':'rgba(180,230,255,.8)'),type:'flame'});
        if(u.x>W-20*S){a.back=true;}}
      else{u.face=-1;u.x-=v*.8;u.st='run';u.wph+=dt*22;const P=a.p||{};if(P.back){a.hit2=a.hit2||new Set();for(const m of alive(B.mons))if(!a.hit2.has(m)&&Math.abs(m.x-u.x)<26*S&&Math.abs(m.d-u.d)<(a.band||.2)){a.hit2.add(m);damage(u,m,P.back,{crit:1,skill:1});sparks(m.x,headY(m)+20,8,a.col||'#40c4ff');}}
        if(u.x<=a.x0){u.x=a.x0;u.face=1;u.act=null;u.st='idle';}}
      return;}}
  if(!u.hero){if(u.act){monAct(u,dt);return;}
    // v16-65: a monster still outside the picture (march ended before it walked in) first walks in. Before, a ranged one
    // (Exhaust Snake / Headlight Drone) shot from off-screen, the mechanics stood at the right edge unable to reach it → battle stuck.
    if(!u.in&&u.b!=='titan'&&!u.wbB){const xm=W-(u.boss?64:40)*S;if(u.x<=xm)u.in=1;else{u.face=-1;u.st='walk';u.wph+=dt*9;u.x=Math.max(xm,u.x-(u.mv+180*S)*dt);if(u.x<=xm)u.in=1;return;}}
    if(monSpecial(u,dt))return;}
  // pick target
  let tg=null;
  if(!u.hero){const tn=alive(foes).find(h=>h.taunt>0);tg=tn||nearest(u,foes);}else tg=nearest(u,foes);
  if(!tg){u.st=B.phase==='win'?'win':'idle';return;}
  if(!u.hero||u.st!=='atk'||Math.abs(tg.x-u.x)>8*S)u.face=tg.x>=u.x?1:-1;
  const dd=dist(u,tg),range=u.rng+(tg.boss?(tg.b==='titan'?60:20)*S:0);
  const spot=u.hero&&u.rng<80*S?meleeSpot(u,tg,range):null;
  if(u.st==='atk'){const prev=u.ap;u.ap+=dt/(u.hero?.42/(u.aspd>0?1+u.aspdK:1):Math.min(.6,u.as*.45));
    if(prev<.55&&u.ap>=.55)doHit(u,tg);
    if(u.ap>=1){u.st='idle';u.ap=0;u.cd=u.as/(u.aspd>0?1+u.aspdK:1);}return;}
  u.cd-=dt;
  // spider pounce
  if(u.pounce&&dd<140*S&&dd>u.rng*1.5){u.pounce=0;u.act=null;B.fx.push({type:'dust',x:u.x,y:fy(u.d)});u.x=tg.x-u.face*24*S;u.d=tg.d;damage(u,tg,1.5);shake(4);sparks(tg.x,headY(tg)+20,8);return;}
  if(dd<=range||(spot&&Math.abs(u.x-spot[0])<=18*S&&Math.abs(u.d-spot[1])*(FY1-FY0)<=18*S)){if(u.cd<=0){u.st='atk';u.ap=0;if(!u.hero)u.alt=(u.na=(u.na||0)+1)%3===0;}else if(u.st!=='atk')u.st='idle';return;}
  // move
  const sp=u.mv*(u.slow>0?.5:1)*(u.charge?2.2:1)*(spot&&dd<130*S?1.7:1)*dt;
  const tx=spot?spot[0]:tg.x-u.face*range*.85,dx=tx-u.x,ddp=((spot?spot[1]:tg.d)-u.d)*(FY1-FY0);const L=Math.hypot(dx,ddp)||1;
  u.x+=dx/L*Math.min(sp,L);u.d+=ddp/L*Math.min(sp,L)/(FY1-FY0)*(spot?1:.8);u.d=clamp(u.d,.02,.98);
  u.st='walk';u.wph+=dt*(u.hero?11:9)*(u.charge?2:1);if(u.t==='tire')u.roll+=dt*(u.charge?14:7)*u.face;
}
// v16-46: melee mechanics no longer fight for the same spot. Each one takes his own place around the monster
// (in front, a bit above, a bit below…), far enough from the other mechanics' places (sep() keeps 56 between heroes),
// and attacks from that place. Before, two mechanics on one monster pushed each other out of range and just stood there.
function meleeSpot(u,tg,range){const F=FY1-FY0,st=66*S,KD=.72;
  if(u.sT!==tg){u.sT=tg;u.sK=null;}
  const at=k=>[clamp(tg.x-u.face*(range*.85+Math.abs(k)*30*S),26*S,W-26*S),tg.d+k*st/F];
  const gap=k=>{const p=at(k);if(p[1]<.03||p[1]>.97)return -1;let g=1e9;for(const h of B.heroes){if(h===u||h.dead||!h.sP||h.rng>=80*S)continue;g=Math.min(g,Math.hypot(p[0]-h.sP[0],(p[1]-h.sP[1])*F*KD));}return g;};
  if(u.sK==null||gap(u.sK)<44*S){const cur=(u.d-tg.d)*F/st;let best=0,bs=-1e9;
    for(const k of [0,1,-1,2,-2,3,-3]){const g=gap(k);if(g<0)continue;const sc=Math.min(g,56*S)/S-Math.abs(k-cur)*9-Math.abs(k)*4;if(sc>bs){bs=sc;best=k;}}u.sK=best;}
  const p=at(u.sK);p[1]=clamp(p[1],.02,.98);u.sP=p;return p;}
function doHit(u,tg){const [x]=sxy(tg),y=headY(tg)+16*dsc(tg.d);
  if(u.hero){const R=u.role;
    if(R==='inspect'){const [bx,sy]=muzzle(u,14,40),bc=sprOK(u.spr)?u.spr.col||'#ff5252':'#64ffda';B.fx.push({type:'beam',x0:bx,y0:sy,x1:x,y1:y,t:0,d:.26,col:bc,w:sprOK(u.spr)?4:3});if(FX2){fxs('circle_05',bc,x,y,{d:.22,s0:14*S,s1:44*S});if(!sprOK(u.spr))fxs('circle_05',bc,bx,sy,{d:.15,s0:10*S,s1:26*S});}damage(u,tg,1);sparks(x,y,5,'#a7ffeb');const ws=pv(u,'inspect',0);if(ws&&++u.shots%ws===0&&!tg.dead){tg.mark=Math.max(tg.mark,3);pasTxt(u,0);}}
    else if(R==='elec'){const [ex,ey]=muzzle(u,20,44),ec=u.spr&&u.spr.col;B.fx.push({type:'bolt',x0:ex,y0:ey,x1:x,y1:y,t:0,d:.24,col:ec});if(FX2){fxBolt(ex,ey,x,y,ec||'#40c4ff',34);fxs('circle_05','#80d8ff',x,y,{d:.2,s0:16*S,s1:40*S});}damage(u,tg,1);sparks(x,y,6,'#80d8ff');
      const sc=pv(u,'elec',1);if(sc&&!tg.dead&&Math.random()*100<sc){tg.stun=Math.max(tg.stun,.6);pasTxt(u,1);}
      const stc=pv(u,'elec',0);if(stc&&Math.random()*100<stc){let o=null,bd=170*S;for(const m of B.mons){if(m.dead||m===tg)continue;const d2=dist(tg,m);if(d2<bd){bd=d2;o=m;}}
        if(o){const oy=headY(o)+16*dsc(o.d);if(!B.sim){B.fx.push({type:'bolt',x0:x,y0:y,x1:o.x,y1:oy,t:0,d:.22,col:ec});if(FX2)fxBolt(x,y,o.x,oy,ec||'#40c4ff',26);}damage(u,o,.6,{noCrit:1});}}}
    else if(R==='service')shoot(u,tg,'bolt',1,u.spr&&u.spr.look?{look:u.spr.look}:null);
    else if(R==='paint'){const pc=['#e0457b','#29b6f6','#ffd21a','#76ff03'][u.hits++%4];shoot(u,tg,'paint',1,{col:pc});
      if(sprOK(u.spr)){const [px,py]=muzzle(u);B.fx.push({type:'beam',x0:px,y0:py,x1:x,y1:y,t:0,d:.2,col:u.spr.col||'#ff4fd8',w:5});}}
    else{const m=R==='all'?1.15:1;damage(u,tg,m);sparks(x,y,R==='engine'?10:6,R==='tuning'?'#40c4ff':'#ffe082');if(R==='engine'||R==='all'){shake(3);if(!tg.boss)tg.x+=6*S;}
      B.fx.push({type:'slash',x,y,t:0,d:.18,f:u.face,col:R==='tuning'?'#40c4ff':'#fff'});
      if(FX2){const sc=R==='tuning'?'#40c4ff':R==='engine'?'#ff9100':'#ffe082';fxs('slash_02',sc,x-u.face*4*S,y,{d:.2,s0:40*S,s1:64*S,rot:(u.face>0?-Math.PI/2:Math.PI/2)+rnd(-.5,.5),ease:1});fxs('flare_01','#ffffff',x,y,{d:.15,s0:12*S,s1:44*S});}}
    return;}
  const t=u.t;
  if(u.at==='smoke')shoot(u,tg,'smoke',1,{spd:260});
  else if(u.at==='acid')shoot(u,tg,'acid',1,{spd:230});
  else if(u.at==='wave')shoot(u,tg,'wave',1,{spd:300});
  else if(u.at==='fire')shoot(u,tg,'fire',1,{spd:320});
  else if(u.at==='zap'){B.fx.push({type:'bolt',x0:u.x+u.face*16*S,y0:fy(u.d)-40*dsc(u.d),x1:x,y1:y,t:0,d:.2});damage(u,tg,1);tg.stun=Math.max(tg.stun,.35);sparks(x,y,8,'#b2ff59');}
  else if(u.at==='beam'){B.fx.push({type:'beam',x0:u.x+u.face*10*S,y0:fy(u.d)-42*dsc(u.d),x1:x,y1:y,t:0,d:.2,col:'#ff5252',w:3});damage(u,tg,1);sparks(x,y,5,'#ff8a80');}
  else{const m=u.charge?2:1;u.charge=0;damage(u,tg,m);sparks(x,y,u.b==='titan'?14:6,'#ffab40');if(u.b){shake(u.b==='titan'?8:4);tg.x-=8*S;}
    if(u.b==='titan')for(const h of alive(B.heroes))if(h!==tg&&dist(h,tg)<45*S)damage(u,h,.6,{noCrit:1});
    B.fx.push({type:'slash',x,y,t:0,d:.2,f:u.face,col:'#ff8a65'});}}
// v16-41: mechanics keep a bigger gap (their pictures are wider) and two on the same spot are pushed apart too
function sep(list){for(let i=0;i<list.length;i++){const a=list[i];if(a.dead||a.act)continue;for(let j=i+1;j<list.length;j++){const b=list[j];if(b.dead||b.act)continue;
  let dx=b.x-a.x,dd=(b.d-a.d)*(FY1-FY0);if(Math.abs(dx)+Math.abs(dd)<.01){dd=(j%2?1:-1)*.5;dx=.3;}const hh=a.hero&&b.hero,kd=hh?.72:1,L=Math.hypot(dx,dd*kd),min=(a.boss||b.boss?48:hh?56:30)*S;if(L<min){const p=(min-L)/2*(hh?1.6:1);const ux=dx/L,uy=dd*kd/L/kd;
    if(!a.boss){a.x-=ux*p*.5;a.d-=uy*p/(FY1-FY0);}if(!b.boss){b.x+=ux*p*.5;b.d+=uy*p/(FY1-FY0);}a.d=clamp(a.d,.02,.98);b.d=clamp(b.d,.02,.98);}}}}

function keepIn(){for(const m of B.mons){if(m.dead||m.b==='titan')continue;const xm=W-(m.boss?64:40)*S;if(m.x<=xm)m.in=1;else if(m.in)m.x=xm;if(m.in&&!m.act)m.x=Math.max(m.x,30*S);}}
function simRun(si,team,maxT){startBattle(si,team);B.sim=1;running=false;cancelAnimationFrame(raf);B.auto=true;let t=0;while(t<(maxT||400)&&!B.res){step(1/30);t+=1/30;}
  const r={win:B.phase==='win',t:Math.round(t),deaths:B.deaths,wave:B.wave,left:B.mons.filter(m=>!m.dead).map(m=>m.t+':'+Math.round(m.hp/m.max*100)+'%')};return r;}
function step(dt){B.t+=dt;B.phT+=dt;
  if(B.wbB&&B.wbB.hurtS>0)B.wbB.hurtS-=dt;
  if(B.bossBar&&!B.bossBar.dead&&B.bossBar.b==='titan'&&!B.bossBar.enr&&(B.wbB?B.wbT<WB_ENR:B.bossBar.hp<B.bossBar.max*.5)){const b=B.bossBar;b.enr=true;b.as*=.7;b.atk*=1.15;B.flash=.6;shake(16);B.banner={boss:b,t:0,name:'ENRAGED!'};}
  if(B.phase==='intro'){for(const u of B.heroes){const dx=u.fx-u.x;u.x+=Math.sign(dx)*Math.min(Math.abs(dx),250*S*dt);u.st=Math.abs(dx)>1?'walk':'idle';u.wph+=dt*11;u.face=1;}
    for(const m of B.mons){if(m.b==='titan')continue;const tx=W*(.6+.12*(B.mons.indexOf(m)%3));if(m.x>tx){m.x-=m.mv*dt*1.3;m.st='walk';m.wph+=dt*9;if(m.t==='tire')m.roll-=dt*7;}else m.st='idle';}
    B.scroll+=dt*90;if(B.phT>1.25){B.phase='fight';B.phT=0;punch(.035);}}
  else if(B.phase==='fight'){
    if(B.mod==='burn')for(const u of B.heroes)if(!u.dead)u.hp=Math.max(1,u.hp-u.max*.006*dt);
    for(const u of B.heroes)unitUpdate(u,dt,B.mons,B.heroes);
    for(const m of B.mons)unitUpdate(m,dt,B.heroes,B.mons);
    sep(B.heroes);sep(B.mons);
    for(const u of B.heroes)if(!u.dead){u.x=clamp(u.x,u.act?8*S:26*S,W-(u.act?8:26)*S);}
    // v16-46: monsters can no longer be pushed out of the picture (knock-backs + crowding moved them past the right edge)
    keepIn();
    if(B.auto)for(const u of B.heroes)if(canCast(u)){if(u.role==='service'){const low=alive(B.heroes).some(h=>h.hp/h.max<.6)||(u.h.id==='m4_1'&&!u.rev&&B.heroes.some(h=>h.dead));if(!low&&(u.waitT=(u.waitT||0)+dt)<4)continue;u.waitT=0;}cast(u);break;}
    B.mons=B.mons.filter(m=>!(m.dead&&m.deadT>1.2));
    if(B.wbB){B.wbT-=dt;if(B.wbT<=0){B.wbT=0;B.phase='win';B.phT=0;B.wbUp=1;for(const h of B.heroes)if(!h.dead)h.st='win';}}
    if(B.phase==='win'){}
    else if(!alive(B.heroes).length){B.phase='lose';B.phT=0;}
    else if(!alive(B.mons).length&&!B.proj.length){if(B.wave<B.stage.w.length-1){B.phase='march';B.phT=0;B.wave++;B.bossBar=null;
        for(const h of alive(B.heroes)){heal(h,h.max*.15);h.act=null;h.lift=0;h.sP=null;h.sT=null;}formation();}
      else{B.phase='win';B.phT=0;for(const h of B.heroes)if(!h.dead)h.st='win';}}}
  else if(B.phase==='march'){let done=true;for(const u of alive(B.heroes)){const dx=u.fx-u.x,ddp=u.fd-u.d;u.x+=Math.sign(dx)*Math.min(Math.abs(dx),210*S*dt);u.d+=Math.sign(ddp)*Math.min(Math.abs(ddp),.8*dt);
      u.face=1;u.st='walk';u.wph+=dt*11;u.stun=0;if(Math.abs(dx)>2||Math.abs(ddp)>.01)done=false;}
    B.scroll+=dt*240*S;if(B.phT>.3&&!B.spawned){B.spawned=true;spawnWave();for(const m of B.mons)if(m.b!=='titan')m.x+=W*.4;}
    for(const m of B.mons){if(m.b==='titan')continue;const tx=W*(.62+.1*(B.mons.indexOf(m)%3));if(m.x>tx){m.x-=(m.mv+240*S)*dt;m.st='walk';m.wph+=dt*9;if(m.t==='tire')m.roll-=dt*9;}}
    if(B.phT>1.05&&done){B.phase='fight';B.phT=0;B.spawned=false;punch(.03);}}
  else if(B.phase==='win'){for(const u of B.heroes){if(!u.dead)u.st='win';u.flash=Math.max(0,u.flash-dt*6);if(u.dead)u.deadT+=dt;}if(B.phT>1.6&&!B.res){B.res=1;if(!B.sim)finish(true);}}
  else if(B.phase==='lose'){for(const m of B.mons){if(!m.dead){m.st='idle';}}if(B.phT>1.6&&!B.res){B.res=1;if(!B.sim)finish(false);}}
  for(let i=B.proj.length-1;i>=0;i--)if(projUpdate(B.proj[i],dt))B.proj.splice(i,1);
  for(const p of B.parts){p.life-=dt;p.vy+=p.g*dt;if(p.drag){p.vx*=1-p.drag*dt;p.vy*=1-p.drag*dt;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
    if(p.floor&&p.y>p.floor){p.y=p.floor;p.vy*=-.35;p.vx*=.6;p.vr*=.6;}}
  B.parts=B.parts.filter(p=>p.life>0);
  for(const n of B.nums)n.t+=dt;B.nums=B.nums.filter(n=>n.t<1);
  for(const tl of B.tele)tl.t+=dt;B.tele=B.tele.filter(tl=>tl.t<tl.dur);
  for(const f of B.fx){f.t+=dt;fxUpdate(f,dt);}B.fx=B.fx.filter(f=>f.t<f.d);
  if(B.fx2)fx2Update(dt);
  if(B.phase==='fight')keepIn(); // skills that push are applied after the first check
  if(B.banner){B.banner.t+=dt;if(B.banner.t>1.3)B.banner=null;}
}
function fxUpdateGear(f){f.done=true;const x=f.tgt?f.tgt.x:f.x;const y=f.tgt?fy(f.tgt.d):fy(rnd(.1,.9));
  if(f.tgt&&!f.tgt.dead){damage(f.src,f.tgt,f.mult||3,{skill:1});}debris(x,y-6,4,['#ffd54a','#ffca28','#9e9e9e']);shake(6);B.fx.push({type:'ring',x,y,t:0,d:.35,r:40*S,col:'#ffd54a',ground:1});f.lx=x;
  if(FX2){fxs('fire_01','#ffab00',x,y-16*S,{d:.45,s0:24*S,s1:110*S,rot:rnd(0,TAU),ease:1});fxShock(x,y,'#ffd54a',40*S);fxScorch(x,y,'#2b1a10',30*S,2);}}
function fxUpdate(f,dt){
  if(f.type==='scan'){const P=f.p||{},SC=P.col||'#64ffda',x=lerp(f.x,W+20,Math.max(0,f.t/f.d));if(FX2&&Math.random()<.5)fxs('trace_01',SC,x,(FY0+FY1)/2-50*S,{d:.3,s0:(FY1-FY0)+180*S,s1:(FY1-FY0)+180*S,sx:.35,a0:.6});
    for(const m of alive(B.mons))if(!f.hit.has(m)&&m.x<=x){f.hit.add(m);m.mark=Math.max(m.mark,P.mark||7);if(P.slow)m.slow=Math.max(m.slow,P.slow);damage(f.src,m,P.mult||1.2,{skill:1});sparks(m.x,headY(m)+20,6,SC);if(FX2){const my=headY(m)+22*dsc(m.d);fxs('magic_02',SC,m.x,my,{d:.7,s0:20*S,s1:80*S,vr:3,ease:1});fxs('circle_05','#a7ffeb',m.x,my,{d:.35,s0:20*S,s1:60*S});}}}
  else if(f.type==='chain'&&!f.done&&f.t>=0){f.done=true;if(!f.b.dead){damage(f.src,f.b,f.mult,{skill:1});f.b.stun=Math.max(f.b.stun,f.stun||1.5);sparks(f.b.x,headY(f.b)+20,10,'#80d8ff',200);}shake(3);
    if(FX2){const a=f.a,b=f.b,ax=a.x,ay=a.hero?fy(a.d)-44*dsc(a.d):headY(a)+20,bx=b.x,by=headY(b)+20;fxBolt(ax,ay,bx,by,'#40c4ff',80);fxs('spark_02','#80d8ff',bx,by,{d:.4,s0:40*S,s1:100*S,rot:rnd(0,TAU),ease:1});fxBurst(bx,by,'#40c4ff',36*S);}}
  else if(FX2&&f.type==='gear'&&!f.done&&f.t>=0){const gx=f.tgt&&f.tgt.x!==undefined?f.tgt.x:f.x,ty=f.tgt?fy(f.tgt.d)-20*dsc(f.tgt.d):fy(.5),gy=lerp(f.y0,ty,Math.min(1,f.t/f.d/.85));fxs('flame_04','#ff9100',gx,gy-f.r*.6,{d:.22,s0:f.r*2.6,s1:f.r*1.2,a0:.7,rot:rnd(-.3,.3)});
    if(f.t>=f.d*.85)fxUpdateGear(f);}
  else if(f.type==='gear'&&!f.done&&f.t>=f.d*.85)fxUpdateGear(f);
  else if(f.type==='puddle'){f.tick+=dt;if(f.tick>.5){f.tick=0;for(const m of alive(B.mons))if(Math.hypot(m.x-f.x,(m.d-f.d0)*(FY1-FY0)*1.25)<f.r){damage(f.src,m,.22,{noCrit:1,skill:1});m.slow=Math.max(m.slow,.6);}}}
  else if(f.type==='quake'){const x=lerp(f.x0,W+90*S,Math.max(0,f.t/f.d));f.fx=x;if(Math.random()<.5)debris(x,fy(rnd(.1,.9)),2,['#6d4c41','#9e9e9e','#ffca28']);if(f.t<f.d*.8)B.shake=Math.max(B.shake,5);
    for(const m of alive(B.mons))if(!f.hit.has(m)&&m.x<=x){f.hit.add(m);damage(f.src,m,2.3,{skill:1});m.stun=Math.max(m.stun,1.6);if(!m.boss)m.x+=22*S;sparks(m.x,headY(m)+20,10,'#ffd54a');if(FX2)fxBurst(m.x,fy(m.d)-20*S,'#ffab00',40*S);}}
  else if(f.type==='strike'&&!f.done&&f.t>=0){f.done=true;const ms=alive(B.mons);if(ms.length){const m=ms[Math.floor(Math.random()*ms.length)],x=m.x,y=headY(m)+22*dsc(m.d);
    B.fx.push({type:'bolt',x0:x+rnd(-30,30)*S,y0:f.top,x1:x,y1:y,t:0,d:.28,col:'#ffe066'});damage(f.src,m,1.5,{skill:1});m.stun=Math.max(m.stun,1);sparks(x,y,10,'#fff176',220);shake(5);
    if(FX2){fxBolt(x,f.top,x,y,'#ffd54a',60);fxs('spark_02','#fff59d',x,y,{d:.35,s0:40*S,s1:110*S,rot:rnd(0,TAU),ease:1});fxBurst(x,y,'#ffd54a',40*S);}}}
  else if(f.type==='mega'&&!f.done&&f.t>=0){f.done=true;const y=fy(f.dd);if(!(f.src&&f.src.spr&&f.src.spr.fx8&&f.src.spr.fi&&f.src.spr.fi.naturalWidth))imgFx('gearboom',f.x,y+16*S,230*S,1);shake(16);B.flash=.4;
    for(const m of alive(B.mons))if(Math.hypot(m.x-f.x,(m.d-f.dd)*(FY1-FY0)*1.25)<110*S)damage(f.src,m,1.5,{skill:1});
    if(FX2){fxShock(f.x,y,'#ff6d00',110*S);fxScorch(f.x,y,'#2b1a10',80*S,2.5);}}
  else if(f.type==='dvort'&&!f.done&&f.t>=0){f.done=true;const R=105*S,y=fy(f.dd);shake(10);  // v16-96: DIAMOND VORTEX impact (crystal freeze)
    for(const m of alive(B.mons))if(Math.hypot(m.x-f.x,(m.d-f.dd)*(FY1-FY0)*1.25)<R){damage(f.src,m,2.1,{skill:1});m.stun=Math.max(m.stun,2.2);m.ice=2.2;m.mark=Math.max(m.mark,4);}
    if(FX2){fxBurst(f.x,y-30*S,'#80d8ff',70*S);fxShock(f.x,y,'#80d8ff',R*.7);}}
  else if(f.type==='coil'){f.tick+=dt;if(f.tick>=.4){f.tick=0;const ms=alive(B.mons);if(ms.length){const m=ms[Math.floor(Math.random()*ms.length)],y0=fy(f.dd)-70*dsc(f.dd),y=headY(m)+22*dsc(m.d);
      B.fx.push({type:'bolt',x0:f.x,y0,x1:m.x,y1:y,t:0,d:.22,col:'#e040fb'});damage(f.src,m,.8,{skill:1});m.stun=Math.max(m.stun,.5);sparks(m.x,y,6,'#ea80fc');if(FX2)fxBolt(f.x,y0,m.x,y,'#e040fb',40);}}}
  else if(f.type==='imgfx'&&f.u&&!f.u.dead){f.x=f.u.x;f.y=headY(f.u)-8*S;}
  else if(f.type==='plus'&&f.t<dt*1.5&&f.txt)num(f.u.x,headY(f.u)-14,f.txt,f.col||'#69f0ae');
}

// ---------------------------------------------------------------- landscape (painted once per battle)
// v16-25: the same few canvases are re-used for every battle (before: ~8 new big canvases per battle → memory kept growing on Android)
const LPOOL=[];let LI=0;
function layer(w,h){const c=LPOOL[LI]||(LPOOL[LI]=document.createElement('canvas'));LI++;c.width=Math.ceil(w*BDPR);c.height=Math.ceil(h*BDPR);const x=c.getContext('2d');x.setTransform(1,0,0,1,0,0);x.globalAlpha=1;x.globalCompositeOperation='source-over';x.shadowBlur=0;x.scale(BDPR,BDPR);return [c,x];}
function buildBG(){LI=0;B._cA=null;const P=BIO[B.stage.bio],R=seeded(77+B.si*13);const LW=Math.round(W*1.7);B.LW=LW;B.bgP=P;B.bgo={stacks:[],fires:[],cranes:[]};
  // sky
  let [c,x]=layer(W,HOR+40);let gr=x.createLinearGradient(0,0,0,HOR+40);gr.addColorStop(0,P.sky[0]);gr.addColorStop(.6,P.sky[1]);gr.addColorStop(1,P.sky[2]);x.fillStyle=gr;x.fillRect(0,0,W,HOR+40);
  if(P.night)for(let k=0;k<90;k++){x.fillStyle='rgba(255,255,255,'+(R()*.7+.2)+')';x.fillRect(R()*W,R()*HOR*.8,R()<.1?2:1,R()<.1?2:1);}
  const sx=W*.72,sy=HOR*P.sunY,sr=W*P.sunR;let sg=x.createRadialGradient(sx,sy,sr*.2,sx,sy,sr*5);sg.addColorStop(0,P.sun+'cc');sg.addColorStop(.25,P.sun+'44');sg.addColorStop(1,P.sun+'00');x.fillStyle=sg;x.fillRect(0,0,W,HOR+40);
  x.fillStyle=P.sun;circ(x,sx,sy,sr);if(P.moon){x.fillStyle=P.sky[1];circ(x,sx+sr*.4,sy-sr*.2,sr*.85);}
  if(!P.night)for(let k=0;k<7;k++){const cx=R()*W,cy=R()*HOR*.55+10,cw=40+R()*90;x.fillStyle='rgba(255,255,255,'+(.08+R()*.14)+')';for(let j=0;j<5;j++)ell(x,cx+(j-2)*cw*.25,cy+Math.sin(j)*4,cw*.3,cw*.11);}
  if(P.lava){x.fillStyle='rgba(255,120,40,.12)';for(let k=0;k<5;k++)ell(x,R()*W,HOR*(.3+R()*.5),120+R()*80,14);}
  B.bgSky=c;
  // far scrap mountains
  [c,x]=layer(LW,HOR+30);const base=HOR+6;const pts=[];for(let i=0;i<=40;i++){const px=i/40*LW;const n=Math.sin(i*.7+1)*.5+Math.sin(i*1.9)*.25+R()*.35;pts.push([px,base-HOR*(.12+n*.16)]);}
  pts[40][1]=pts[0][1];
  const mount=(col,dy,k)=>{x.fillStyle=col;x.beginPath();x.moveTo(0,base+30);for(const [px,py] of pts)x.lineTo(px,py*k+base*(1-k)+dy);x.lineTo(LW,base+30);x.closePath();x.fill();};
  mount(P.far,0,1);
  if(P.snow){x.save();x.beginPath();x.moveTo(0,base+30);for(const [px,py] of pts)x.lineTo(px,py);x.lineTo(LW,base+30);x.closePath();x.clip();x.fillStyle='rgba(255,255,255,.92)';
    for(const [px,py] of pts){ell(x,px,py+2,LW/40*.9,9);}x.fillStyle='rgba(255,255,255,.35)';for(const [px,py] of pts)ell(x,px+6,py+16,LW/40*.6,6);x.restore();}
  if(P.neon){let bx=0;const nc=['#ff4fd8','#00e5ff','#ffea00','#76ff03'];while(bx<LW){const bw=22+R()*36,bh=HOR*(.25+R()*.45),by=base-bh;x.fillStyle=R()<.5?'#0e0a1e':'#151030';x.fillRect(bx,by,bw,bh+30);
      for(let wy=by+6;wy<base-4;wy+=7)for(let wx=bx+4;wx<bx+bw-4;wx+=6)if(R()<.45){x.fillStyle=R()<.7?'rgba(255,230,150,.75)':nc[Math.floor(R()*4)]+'cc';x.fillRect(wx,wy,3,3.5);}
      if(R()<.4){x.fillStyle='#ff1744';x.fillRect(bx+bw/2-1,by-10,2,10);circ(x,bx+bw/2,by-11,2);}
      if(R()<.35){const c=nc[Math.floor(R()*4)];x.shadowColor=c;x.shadowBlur=10;x.strokeStyle=c;x.lineWidth=2;x.strokeRect(bx+4,by+8,bw-8,8);x.shadowBlur=0;}
      bx+=bw+2+R()*6;}}
  const wrap=(fn,px,m)=>{fn(px);if(px<m)fn(px+LW);if(px>LW-m)fn(px-LW);};
  if(P.volcano){B.bgo.volc=[];for(const vx of[LW*.28,LW*.78]){const vh=HOR*.62,vw=HOR*.9;wrap(X0=>{x.fillStyle=P.far2;x.beginPath();x.moveTo(X0-vw,base+20);x.lineTo(X0-vw*.13,base-vh);x.lineTo(X0+vw*.13,base-vh);x.lineTo(X0+vw,base+20);x.closePath();x.fill();
      const lg=x.createLinearGradient(0,base-vh,0,base-vh*.4);lg.addColorStop(0,'rgba(255,140,30,.95)');lg.addColorStop(1,'rgba(255,60,0,0)');x.fillStyle=lg;for(const o of[-.05,.04]){x.beginPath();x.moveTo(X0+vw*o-4,base-vh);x.quadraticCurveTo(X0+vw*o*3,base-vh*.7,X0+vw*o*5,base-vh*.35);x.lineTo(X0+vw*o*5+6,base-vh*.35);x.quadraticCurveTo(X0+vw*o*3+6,base-vh*.7,X0+vw*o+6,base-vh);x.fill();}
      x.fillStyle='#ffab40';ell(x,X0,base-vh,vw*.13,5);},vx,vw);B.bgo.volc.push({x:vx,y:base-vh});}}
  for(let k=0;k<26;k++){const px=R()*LW,i=Math.floor(px/LW*40),py=pts[i][1]+8,a=R()*1.4-.7,w=18+R()*16;wrap(X0=>{x.save();x.translate(X0,py);x.rotate(a);x.fillStyle=P.far2;rr(x,-w/2,-w*.35,w,w*.42,3);x.fill();x.fillRect(-w*.25,-w*.55,w*.45,w*.25);x.restore();},px,40);}
  for(let k=0;k<10;k++){const px=R()*LW,i=Math.floor(px/LW*40),py=pts[i][1]+4,r=5+R()*5;wrap(X0=>{x.strokeStyle=P.far2;x.lineWidth=r*.6;x.beginPath();x.arc(X0,py,r,0,TAU);x.stroke();},px,20);}
  // cranes
  for(let k=0;k<2;k++){const px=LW*(.25+k*.5)+R()*60,h=HOR*.42;B.bgo.cranes.push({x:px,y:base-h,l:70+R()*30});
    wrap(X0=>{x.strokeStyle=P.far2;x.lineWidth=2;x.beginPath();x.moveTo(X0-6,base);x.lineTo(X0,base-h);x.lineTo(X0+6,base);x.stroke();for(let j=0;j<8;j++){const y0=base-j*h/8;x.beginPath();x.moveTo(X0-6+j*.75,y0);x.lineTo(X0+6-j*.75,y0-h/8);x.stroke();}
      x.lineWidth=3;x.beginPath();x.moveTo(X0-30,base-h);x.lineTo(X0+80,base-h+4);x.stroke();x.fillStyle=P.far2;x.fillRect(X0-34,base-h-4,10,10);},px,120);}
  if(P.stacks)for(let k=0;k<3;k++){const px=LW*(.12+k*.33)+R()*50,h=HOR*(.3+R()*.15),w=10+R()*6;B.bgo.stacks.push({x:px,y:base-h,w});
    wrap(X0=>{x.fillStyle=P.far2;x.fillRect(X0-w/2,base-h,w,h);x.fillStyle=P.rim;x.fillRect(X0-w/2,base-h+8,w,2);x.fillRect(X0-w/2,base-h+16,w,1.5);},px,30);}
  // rim light + haze
  x.globalCompositeOperation='source-atop';let hz=x.createLinearGradient(0,base-HOR*.45,0,base);hz.addColorStop(0,'rgba(0,0,0,0)');hz.addColorStop(1,P.haze);x.fillStyle=hz;x.fillRect(0,0,LW,HOR+30);x.globalCompositeOperation='source-over';
  B.bgFar=c;
  // mid: crushed car stacks, tire piles, barrels, fence
  [c,x]=layer(LW,HOR*.5+60);const mb=HOR*.5+40;B.midY=HOR-mb+18;
  const carCols=['#8e3b2e','#2f5d8a','#4f7a3a','#b08a2c','#6d6d6d','#7a3f7a','#2b6f6b','#a65a1c'];
  const fx0=[];let px=10;while(px<LW-40){fx0.push(px);px+=60+R()*80;}
  x.strokeStyle='rgba(30,25,25,.55)';x.lineWidth=1;for(let i=0;i<LW;i+=7){x.beginPath();x.moveTo(i,mb-34);x.lineTo(i+14,mb);x.moveTo(i+14,mb-34);x.lineTo(i,mb);x.stroke();}
  x.fillStyle='#2b2422';for(let i=0;i<LW;i+=46)x.fillRect(i,mb-38,3,38);x.fillRect(0,mb-38,LW,2);
  for(const p0 of fx0){const kind=R();
    if(kind<.55){const n=2+Math.floor(R()*3),w=44+R()*14;let y=mb;for(let j=0;j<n;j++){const h=13+R()*4,ox=R()*8-4,col=carCols[Math.floor(R()*carCols.length)];
        wrap(X0=>{const X1=X0+ox;x.fillStyle=TE().shade(col,-.35);rr(x,X1-w/2,y-h,w,h,3);x.fill();x.fillStyle=col;rr(x,X1-w/2+2,y-h+1,w-4,h-5,3);x.fill();
          x.fillStyle='rgba(20,30,40,.75)';x.fillRect(X1-w*.3,y-h+3,w*.55,3.5);x.fillStyle='rgba(120,60,20,.35)';for(let q=0;q<4;q++)circ(x,X1-w/2+R()*w,y-h+R()*h,1.5+R()*2);
          x.fillStyle='#151515';circ(x,X1-w*.32,y-1,3.2);circ(x,X1+w*.3,y-1,3.2);},p0,60);
        y-=h-1;}}
    else if(kind<.8){const n=4+Math.floor(R()*4);wrap(X0=>{for(let j=0;j<n;j++){x.fillStyle='#161616';ell(x,X0,mb-4-j*6.5,13,4.5);x.fillStyle='#2a2a2a';ell(x,X0,mb-5.5-j*6.5,7,2);}},p0,20);}
    else{const n=1+Math.floor(R()*3);for(let j=0;j<n;j++){const col=['#b71c1c','#1565c0','#2e7d32','#ef6c00'][Math.floor(R()*4)],bx=p0+j*15;
        wrap(X0=>{x.fillStyle=TE().shade(col,-.3);rr(x,X0-7,mb-22,14,22,2);x.fill();x.fillStyle=col;x.fillRect(X0-7,mb-20,9,18);x.fillStyle='rgba(0,0,0,.35)';x.fillRect(X0-7,mb-15,14,1.5);x.fillRect(X0-7,mb-8,14,1.5);},bx,20);
        if(P.fires&&R()<.6)B.bgo.fires.push({x:bx,y:mb-22});}}}
  x.globalCompositeOperation='source-atop';hz=x.createLinearGradient(0,0,0,mb);hz.addColorStop(0,P.haze);hz.addColorStop(1,'rgba(0,0,0,'+(P.night?.35:.12)+')');x.fillStyle=hz;x.fillRect(0,0,LW,mb+20);
  x.fillStyle='rgba(0,0,0,'+P.mid*.5+')';x.fillRect(0,0,LW,mb+20);x.globalCompositeOperation='source-over';
  if(P.pipes){for(let k=0;k<5;k++){const tx=R()*LW,tr=18+R()*14,th=30+R()*30;wrap(X0=>{x.fillStyle=metal(x,mb-th,mb,'#9aa6a0','#5f6b66','#2f3633');x.fillRect(X0-tr,mb-th,tr*2,th);x.fillStyle='#7d8a84';ell(x,X0,mb-th,tr,5);x.fillStyle='rgba(118,255,3,.5)';x.fillRect(X0-tr,mb-th*.45,tr*2,3);
      x.strokeStyle='#4a5550';x.lineWidth=1;for(let q=0;q<4;q++){x.beginPath();x.moveTo(X0-tr+q*tr*.6,mb-th);x.lineTo(X0-tr+q*tr*.6,mb);x.stroke();}},tx,50);}
    for(let k=0;k<4;k++){const px0=R()*LW,len=80+R()*140,py=mb-12-R()*30;wrap(X0=>{x.strokeStyle='#59625e';x.lineWidth=6;x.beginPath();x.moveTo(X0,mb);x.lineTo(X0,py);x.lineTo(X0+len,py);x.lineTo(X0+len,mb);x.stroke();x.strokeStyle='rgba(255,255,255,.2)';x.lineWidth=1.5;x.beginPath();x.moveTo(X0,py-2);x.lineTo(X0+len,py-2);x.stroke();
      x.fillStyle='#c62828';circ(x,X0+len*.5,py,4);},px0,len+10);}}
  if(P.snow){for(let k=0;k<14;k++){const tx=R()*LW,th=24+R()*26;wrap(X0=>{x.fillStyle='#4e342e';x.fillRect(X0-2,mb-8,4,8);for(let q=0;q<3;q++){const w=th*(.5-q*.12),y=mb-6-q*th*.28;x.fillStyle='#1b4332';x.beginPath();x.moveTo(X0-w,y);x.lineTo(X0,y-th*.42);x.lineTo(X0+w,y);x.closePath();x.fill();x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.moveTo(X0-w*.55,y-th*.18);x.lineTo(X0,y-th*.42);x.lineTo(X0+w*.55,y-th*.18);x.closePath();x.fill();}},tx,40);}
    x.fillStyle='rgba(240,248,255,.95)';for(let i=0;i<LW;i+=10)ell(x,i,mb-1,9,3.5);}
  if(P.neon){for(let k=0;k<7;k++){const lx=R()*LW,c=['#ff4fd8','#00e5ff','#ffea00'][k%3];wrap(X0=>{x.fillStyle='#22202a';x.fillRect(X0-1.5,mb-62,3,62);x.fillRect(X0-1.5,mb-62,16,3);const lg=x.createRadialGradient(X0+14,mb-58,1,X0+14,mb-58,26);lg.addColorStop(0,c+'cc');lg.addColorStop(1,c+'00');x.fillStyle=lg;circ(x,X0+14,mb-58,26);x.fillStyle='#fff';circ(x,X0+14,mb-58,2.5);},lx,40);
      if(k%2===0){const sx2=lx+60;wrap(X0=>{x.shadowColor=c;x.shadowBlur=12;x.strokeStyle=c;x.lineWidth=2.5;rr(x,X0,mb-52,46,20,4);x.stroke();x.fillStyle=c+'55';x.fill();x.shadowBlur=0;x.fillStyle='#fff';x.fillRect(X0+8,mb-44,30,3);},sx2,60);}}}
  B.bgMid=c;B.midH=mb+20;
  // ground (static) + scrolling detail strip
  [c,x]=layer(W,H-HOR+10);const gh=H-HOR+10;gr=x.createLinearGradient(0,0,0,gh);gr.addColorStop(0,P.ga);gr.addColorStop(.55,TE().shade(P.ga,-.25));gr.addColorStop(1,P.gb);x.fillStyle=gr;x.fillRect(0,0,W,gh);
  x.fillStyle=P.haze;x.fillRect(0,0,W,16);
  for(let k=0;k<6;k++){const y0=(FY0-HOR)*.4+k*(gh*.12);x.strokeStyle='rgba(0,0,0,.12)';x.lineWidth=2+k*1.2;x.beginPath();x.moveTo(-10,y0+10);x.bezierCurveTo(W*.3,y0-6,W*.7,y0+16,W+10,y0+4);x.stroke();}
  if(P.lava){for(let k=0;k<9;k++){let lx=R()*W,ly=(FY0-HOR)*.3+R()*gh*.6;x.strokeStyle='rgba(255,110,20,.85)';x.lineWidth=2;x.shadowColor='#ff6d00';x.shadowBlur=10;x.beginPath();x.moveTo(lx,ly);for(let j=0;j<5;j++){lx+=R()*30-8;ly+=R()*10-5;x.lineTo(lx,ly);}x.stroke();x.shadowBlur=0;}}
  if(P.road){const ry=(FY0-HOR)*.15;x.fillStyle='rgba(0,0,0,.28)';x.fillRect(0,ry,W,gh*.08);x.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<W;i+=40)x.fillRect(i,ry+gh*.035,22,3);
    x.strokeStyle='rgba(255,79,216,.25)';x.lineWidth=2;for(let k=0;k<4;k++){const yy=gh*(.3+k*.17);x.beginPath();x.moveTo(0,yy);x.lineTo(W,yy+6);x.stroke();}}
  if(P.snow){for(let k=0;k<160;k++){x.fillStyle='rgba(255,255,255,'+(.3+R()*.6)+')';const py=R()*gh;circ(x,R()*W,py,.6+R()*1.8*(py/gh+.4));}for(let k=0;k<8;k++){x.fillStyle='rgba(160,200,230,.35)';ell(x,R()*W,gh*(.2+R()*.7),20+R()*30,5);}}
  if(P.acid){B.bgo.pools=[];for(let k=0;k<4;k++){const px=W*(.08+k*.27)+R()*30,py=(FY0-HOR)*.3+R()*((FY1-HOR)-(FY0-HOR)*.3),pr=18+R()*16;x.fillStyle='#1b3a08';ell(x,px,py,pr+4,pr*.3+2);const pg=x.createRadialGradient(px,py,2,px,py,pr);pg.addColorStop(0,'#aeea00');pg.addColorStop(.6,'#4caf1a');pg.addColorStop(1,'#2e5a0c');x.fillStyle=pg;ell(x,px,py,pr,pr*.28);B.bgo.pools.push({x:px,y:py+HOR-10,r:pr});}}
  if(P.ash){for(let k=0;k<50;k++){x.fillStyle='rgba(30,25,25,'+(.15+R()*.2)+')';ell(x,R()*W,R()*gh,3+R()*6,1+R()*2);}}
  B.bgGround=c;
  [c,x]=layer(LW,gh);for(let k=0;k<70;k++){const px=R()*LW,py=8+Math.pow(R(),.8)*(gh*.75),s=.5+py/gh;
    wrap(X0=>{const t=R();if(t<.5){x.fillStyle='rgba(0,0,0,'+(.15+R()*.15)+')';ell(x,X0,py,2.5*s+R()*3,1.2*s+R());}
      else if(t<.7){x.fillStyle='rgba(20,15,20,.55)';ell(x,X0,py,14*s+R()*10,3.5*s);x.fillStyle='rgba(255,255,255,.08)';ell(x,X0-3,py-1,6*s,1.2*s);}
      else if(t<.85){x.fillStyle='#8d959c';x.save();x.translate(X0,py);x.rotate(R()*3);x.fillRect(-3*s,-1*s,6*s,2*s);x.restore();}
      else{x.strokeStyle='#5a5f63';x.lineWidth=1.5*s;x.beginPath();x.arc(X0,py,3.5*s,0,TAU);x.stroke();}},px,30);}
  B.bgDet=c;B.bgp=[];}
const BGC={};
// v16-26: the 2 cached background pictures are copied pixel-for-pixel (no re-scaling) and only the rows they really cover
// (sky part / ground part) – on a budget phone this was the most expensive part of every battle frame.
function bgBlit(c,y0,y1){y0=Math.max(0,Math.floor(y0));y1=Math.min(H,Math.ceil(y1));if(y1<=y0)return;
  if(!B.zoom&&!B.sx&&!B.sy){const a=Math.round(y0*DPR),b=Math.min(c.height,Math.round(y1*DPR));g.setTransform(1,0,0,1,0,0);g.drawImage(c,0,a,c.width,b-a,0,a,c.width,b-a);camT();}
  else g.drawImage(c,0,y0*DPR,c.width,(y1-y0)*DPR,0,y0,W,y1-y0);}
function tiled(c,par,y,h){const LW=B.LW,o=((B.scroll*par)%LW+LW)%LW;g.drawImage(c,-o,y,LW,h);if(LW-o<W)g.drawImage(c,LW-o,y,LW,h);}
function drawBG(t){const P=B.bgP;
  if(B.tw){const im=twArenaImg();if(im.complete&&im.naturalWidth){ // v16-60: the arena picture is scaled ONCE into a screen-sized canvas (cheaper every frame on slow phones)
    const cw=Math.round(W*BDPR),ch=Math.round(H*BDPR),key=im.src+cw+'x'+ch;let c=TWA.c;
    if(!c||TWA.ck!==key){c=TWA.c=TWA.c||document.createElement('canvas');c.width=cw;c.height=ch;const x=c.getContext('2d',{alpha:false}),k=Math.max(W/1024,H/1536)*1.04*BDPR,w=1024*k;x.drawImage(im,(cw-w)/2,-12*k,w,1536*k);TWA.ck=key;}
    g.drawImage(c,0,0,cw,ch,0,0,W,H);return;}}
  // v15 speed-up: while the team stands still the background layers are merged into 2 cached pictures (2 copies per frame instead of 8)
  const still=B.phase!=='intro'&&B.phase!=='march'; // v16-25: before, the 2 full-screen caches were re-drawn EVERY frame while the background scrolled
  if(still&&(B._cs!==B.scroll||B._cW!==W||B._cD!==DPR||!B._cA)){B._cs=B.scroll;B._cW=W;B._cD=DPR;
    const mk=k=>{const c=BGC[k]||(BGC[k]=document.createElement('canvas'));const w=Math.round(W*DPR),h=Math.round(H*DPR);if(c.width!==w||c.height!==h){c.width=w;c.height=h;}return c;};B._cA=mk('a');B._cB=mk('b');
    const g0=g;for(const [cv0,f] of [[B._cA,()=>{g.drawImage(B.bgSky,0,0,W,HOR+40);tiled(B.bgFar,.15,0,HOR+30);}],[B._cB,()=>{tiled(B.bgMid,.4,B.midY,B.midH);g.drawImage(B.bgGround,0,HOR-10,W,H-HOR+10);tiled(B.bgDet,1,HOR-10,H-HOR+10);}]]){
      const x2=cv0.getContext('2d');x2.setTransform(DPR,0,0,DPR,0,0);x2.clearRect(0,0,W,H);g=x2;try{f();}finally{g=g0;}}}
  if(still&&B._cA){bgBlit(B._cA,0,HOR+40);
  // smoke from stacks (behind mountains rim)
    const of=((B.scroll*.15)%B.LW+B.LW)%B.LW;
    for(const s of B.bgo.stacks){for(const X0 of[s.x-of,s.x-of+B.LW]){if(X0<-40||X0>W+40)continue;
      for(let k=0;k<6;k++){const p=((t*.18+k/6+s.x*.01)%1);g.fillStyle=P.night?'rgba(60,50,60,'+(.35*(1-p))+')':'rgba(90,80,90,'+(.3*(1-p))+')';circ(g,X0+p*40+Math.sin(p*5+k)*6,s.y-p*90,s.w*.5+p*22);}}}
    if(B.bgo.volc)for(const v of B.bgo.volc){for(const X0 of[v.x-of,v.x-of+B.LW]){if(X0<-120||X0>W+120)continue;for(let k=0;k<7;k++){const p=((t*.12+k/7)%1);g.fillStyle='rgba(50,40,40,'+(.42*(1-p))+')';circ(g,X0+p*60+Math.sin(p*4+k)*10,v.y-p*HOR*.55,10+p*34);}}}
    for(const cr of B.bgo.cranes){for(const X0 of[cr.x-of,cr.x-of+B.LW]){if(X0<-150||X0>W+150)continue;const sw=Math.sin(t*.6+cr.x)*.18,ax=X0+70;g.strokeStyle=P.far2;g.lineWidth=1;g.beginPath();g.moveTo(ax,cr.y+4);const ex=ax+Math.sin(sw)*40,ey=cr.y+4+Math.cos(sw)*40;g.lineTo(ex,ey);g.stroke();g.fillStyle=P.far2;ell(g,ex,ey+3,8,3.5);}}
    bgBlit(B._cB,B.midY,H);
  const om=((B.scroll*.4)%B.LW+B.LW)%B.LW;
  for(const f of B.bgo.fires){for(const X0 of[f.x-om,f.x-om+B.LW]){if(X0<-20||X0>W+20)continue;const y=B.midY+f.y;
    const fl=g.createRadialGradient(X0,y,1,X0,y,26);fl.addColorStop(0,'rgba(255,170,60,.45)');fl.addColorStop(1,'rgba(255,90,20,0)');g.fillStyle=fl;circ(g,X0,y,26);
    for(let k=0;k<3;k++){const h=8+Math.sin(t*13+k*2+f.x)*3;g.fillStyle=k===1?'#ffeb3b':'#ff6d00';g.beginPath();g.moveTo(X0-5+k*3,y);g.quadraticCurveTo(X0-3+k*3,y-h*1.6,X0-1+k*3+Math.sin(t*9+k)*2,y-h*2);g.quadraticCurveTo(X0+1+k*3,y-h,X0+2+k*3,y);g.fill();}}}
  if(B.bgo.pools)for(const pl of B.bgo.pools){g.fillStyle='rgba(198,255,0,'+(.12+.08*Math.sin(t*3+pl.x))+')';ell(g,pl.x,pl.y,pl.r*1.3,pl.r*.4);for(let k=0;k<3;k++){const p=(t*.7+k*.33+pl.x*.01)%1;g.strokeStyle='rgba(220,255,150,'+(1-p)+')';g.lineWidth=1.2;g.beginPath();g.arc(pl.x+Math.sin(k*2.3)*pl.r*.5,pl.y-p*4,2+p*4,0,TAU);g.stroke();}}
  }else{
  g.drawImage(B.bgSky,0,0,W,HOR+40);
  // smoke from stacks (behind mountains rim)
  const of=((B.scroll*.15)%B.LW+B.LW)%B.LW;
  for(const s of B.bgo.stacks){for(const X0 of[s.x-of,s.x-of+B.LW]){if(X0<-40||X0>W+40)continue;
    for(let k=0;k<6;k++){const p=((t*.18+k/6+s.x*.01)%1);g.fillStyle=P.night?'rgba(60,50,60,'+(.35*(1-p))+')':'rgba(90,80,90,'+(.3*(1-p))+')';circ(g,X0+p*40+Math.sin(p*5+k)*6,s.y-p*90,s.w*.5+p*22);}}}
  if(B.bgo.volc)for(const v of B.bgo.volc){for(const X0 of[v.x-of,v.x-of+B.LW]){if(X0<-120||X0>W+120)continue;for(let k=0;k<7;k++){const p=((t*.12+k/7)%1);g.fillStyle='rgba(50,40,40,'+(.42*(1-p))+')';circ(g,X0+p*60+Math.sin(p*4+k)*10,v.y-p*HOR*.55,10+p*34);}}}
  tiled(B.bgFar,.15,0,HOR+30);
  for(const cr of B.bgo.cranes){for(const X0 of[cr.x-of,cr.x-of+B.LW]){if(X0<-150||X0>W+150)continue;const sw=Math.sin(t*.6+cr.x)*.18,ax=X0+70;g.strokeStyle=P.far2;g.lineWidth=1;g.beginPath();g.moveTo(ax,cr.y+4);const ex=ax+Math.sin(sw)*40,ey=cr.y+4+Math.cos(sw)*40;g.lineTo(ex,ey);g.stroke();g.fillStyle=P.far2;ell(g,ex,ey+3,8,3.5);}}
  tiled(B.bgMid,.4,B.midY,B.midH);
  const om=((B.scroll*.4)%B.LW+B.LW)%B.LW;
  for(const f of B.bgo.fires){for(const X0 of[f.x-om,f.x-om+B.LW]){if(X0<-20||X0>W+20)continue;const y=B.midY+f.y;
    const fl=g.createRadialGradient(X0,y,1,X0,y,26);fl.addColorStop(0,'rgba(255,170,60,.45)');fl.addColorStop(1,'rgba(255,90,20,0)');g.fillStyle=fl;circ(g,X0,y,26);
    for(let k=0;k<3;k++){const h=8+Math.sin(t*13+k*2+f.x)*3;g.fillStyle=k===1?'#ffeb3b':'#ff6d00';g.beginPath();g.moveTo(X0-5+k*3,y);g.quadraticCurveTo(X0-3+k*3,y-h*1.6,X0-1+k*3+Math.sin(t*9+k)*2,y-h*2);g.quadraticCurveTo(X0+1+k*3,y-h,X0+2+k*3,y);g.fill();}}}
  g.drawImage(B.bgGround,0,HOR-10,W,H-HOR+10);
  if(B.bgo.pools)for(const pl of B.bgo.pools){g.fillStyle='rgba(198,255,0,'+(.12+.08*Math.sin(t*3+pl.x))+')';ell(g,pl.x,pl.y,pl.r*1.3,pl.r*.4);for(let k=0;k<3;k++){const p=(t*.7+k*.33+pl.x*.01)%1;g.strokeStyle='rgba(220,255,150,'+(1-p)+')';g.lineWidth=1.2;g.beginPath();g.arc(pl.x+Math.sin(k*2.3)*pl.r*.5,pl.y-p*4,2+p*4,0,TAU);g.stroke();}}
  tiled(B.bgDet,1,HOR-10,H-HOR+10);
  }
  if(P.lava){g.fillStyle='rgba(255,90,20,'+(.05+.04*Math.sin(t*2))+')';g.fillRect(0,HOR,W,H-HOR);}
  if(P.smog){for(let k=0;k<4;k++){const x=((t*12+k*W*.4)%(W*1.6))-W*.3;g.fillStyle='rgba(170,190,110,.07)';ell(g,x,HOR+20+k*30,W*.4,26);}}
}
function drawAtmo(t){const P=B.bgP;
  if(P.rain){g.strokeStyle='rgba(190,215,255,.45)';g.lineWidth=1.2;g.beginPath();for(let k=0;k<80;k++){const p=(t*1.6*(1+k%4*.15)+k*.0619)%1,x=((k*53.3+t*60)%(W+80)+W+80)%(W+80)-40,y=p*H*1.1-20;g.moveTo(x,y);g.lineTo(x-7,y+18);}g.stroke();
    if(((t*.37)%7)<.12){g.fillStyle='rgba(220,235,255,.35)';g.fillRect(0,0,W,H);}}
  if(P.snow){for(let k=0;k<55;k++){const sp=.05+(k%5)*.012,p=(t*sp*3+k*.0731)%1,x=((k*61.7+t*(14+k%4*6))%(W+40)+W+40)%(W+40)-20,y=p*H;g.fillStyle='rgba(255,255,255,'+(.55+(k%3)*.15)+')';circ(g,x+Math.sin(t*1.5+k)*8,y,1+(k%4)*.6);}
    const vg=g.createRadialGradient(W/2,H*.5,H*.25,W/2,H*.5,H*.8);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(10,30,60,.4)');g.fillStyle=vg;g.fillRect(0,0,W,H);return;}
  if(P.ash){for(let k=0;k<30;k++){const p=(t*.05+k*.0917)%1,x=((k*83.1+t*10)%W+W)%W,y=p*H;g.fillStyle='rgba(70,60,60,'+(.5*(1-p*.5))+')';ell(g,x+Math.sin(t+k)*10,y,2,1.2);}}
  const n=P.night||P.lava?26:14;for(let k=0;k<n;k++){const p=(t*.08*(1+k%3*.3)+k*.137)%1,x=((k*97.3+t*8*(k%2?1:-1))%W+W)%W;
    if(P.night||P.lava){const y=H*.85-p*H*.7;g.fillStyle='rgba(255,'+(140+(k%3)*30)+',60,'+(.8*(1-p))+')';g.fillRect(x+Math.sin(t*2+k)*10,y,2,2);}
    else{const y=HOR+(1-p)*H*.4;g.fillStyle='rgba(255,240,210,'+(.35*Math.sin(p*Math.PI))+')';circ(g,x+Math.sin(t+k)*14,y,1.4);}}
  // vignette
  const vg=g.createRadialGradient(W/2,H*.5,H*.25,W/2,H*.5,H*.8);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=vg;g.fillRect(0,0,W,H);}

// ---------------------------------------------------------------- fx drawing
function drawTele(t){for(const tl of B.tele){const k=tl.t/tl.dur,a=.25+.35*((t*8|0)%2);g.save();
  if(tl.type==='circle'){const y=fy(tl.d);g.fillStyle=tl.col+'33';g.strokeStyle=tl.col;g.lineWidth=2;g.beginPath();g.ellipse(tl.x,y,tl.r,tl.r*.32,0,0,TAU);g.fill();g.globalAlpha=a+.2;g.stroke();
    g.globalAlpha=.55;g.fillStyle=tl.col;g.beginPath();g.ellipse(tl.x,y,tl.r*k,tl.r*.32*k,0,0,TAU);g.fill();}
  else{const y=fy(tl.d),hh=tl.w*(FY1-FY0);g.fillStyle=tl.col+'2a';g.fillRect(tl.x0,y-hh,tl.x1-tl.x0,hh*2);g.globalAlpha=a+.2;g.strokeStyle=tl.col;g.lineWidth=2;g.setLineDash([8,6]);g.strokeRect(tl.x0,y-hh,tl.x1-tl.x0,hh*2);g.setLineDash([]);
    g.globalAlpha=.4;g.fillStyle=tl.col;g.fillRect(tl.x1-(tl.x1-tl.x0)*k,y-hh,(tl.x1-tl.x0)*k,hh*2);}
  g.restore();}}
function drawGroundFx(){for(const f of B.fx){if(f.type==='puddle'){const a=Math.min(1,(f.d-f.t)*1.5)*.55;const cols=['#e0457b','#29b6f6','#ffd21a','#76ff03','#d05cff'];g.save();g.globalAlpha=a;
    for(let k=0;k<5;k++){g.fillStyle=cols[k];ell(g,f.x+Math.cos(k*1.3)*f.r*.45,f.y+Math.sin(k*2.1)*f.r*.12,f.r*.5,f.r*.15);}g.restore();}
  else if(f.type==='ring'&&f.ground&&f.t>=0){const k=f.t/f.d;g.save();g.globalAlpha=1-k;g.strokeStyle=f.col;g.lineWidth=6*(1-k)+1;g.beginPath();g.ellipse(f.x,f.y,f.r*(.3+k*.8),f.r*.32*(.3+k*.8),0,0,TAU);g.stroke();g.restore();}}}
function bolt(x0,y0,x1,y1,w,col){const n=7;g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);for(let i=1;i<n;i++){const k=i/n;g.lineTo(lerp(x0,x1,k)+rnd(-7,7),lerp(y0,y1,k)+rnd(-7,7));}g.lineTo(x1,y1);g.stroke();}
function drawFx(t){
  for(const f of B.fx){if(f.t<0)continue;const k=f.t/f.d;g.save();
    if(f.type==='beam'){g.globalAlpha=1-k;g.strokeStyle=f.col;g.lineWidth=f.w*(1-k*.5);g.lineCap='round';g.beginPath();g.moveTo(f.x0,f.y0);g.lineTo(f.x1,f.y1);g.stroke();g.strokeStyle='#fff';g.lineWidth=Math.max(1,f.w*.35);g.stroke();
      if(f.w>8){g.globalAlpha=(1-k)*.35;g.strokeStyle=f.col;g.lineWidth=f.w*3;g.stroke();}}
    else if(f.type==='bolt'){g.globalAlpha=1-k;bolt(f.x0,f.y0,f.x1,f.y1,2.5,f.col||'#80d8ff');bolt(f.x0,f.y0,f.x1,f.y1,1,'#fff');}
    else if(f.type==='chain'){const a=f.a,b=f.b;const cc=f.src&&f.src.spr&&f.src.spr.col||'#40c4ff';let [ax,ay]=a.hero?muzzle(a,20,44):[a.x,headY(a)+20];const bx=b.x,by=headY(b)+20;g.globalAlpha=1-k;bolt(ax,ay,bx,by,4,cc);bolt(ax,ay,bx,by,1.5,'#fff');g.fillStyle='rgba(128,216,255,.4)';circ(g,bx,by,16*(1-k)+4);}
    else if(f.type==='ring'&&!f.ground){g.globalAlpha=1-k;g.strokeStyle=f.col;g.lineWidth=4*(1-k)+1;g.beginPath();g.arc(f.x,f.y,f.r*(.2+k),0,TAU);g.stroke();}
    else if(f.type==='boom'){g.globalAlpha=1-k;const r=f.r*(.4+k);const bg=g.createRadialGradient(f.x,f.y,1,f.x,f.y,r);bg.addColorStop(0,'#fff8e1');bg.addColorStop(.35,'#ffab00');bg.addColorStop(1,'rgba(255,60,0,0)');g.fillStyle=bg;circ(g,f.x,f.y,r);}
    else if(f.type==='sprBoom'){if(f.im.complete&&f.im.naturalWidth){const e=1-Math.pow(1-Math.min(1,k*2.2),3),w=f.r*2.6*(.55+.45*e);g.globalAlpha=k<.6?1:1-(k-.6)/.4;g.drawImage(f.im,f.x-w/2,f.y-w*.92,w,w);}}
    else if(f.type==='paintBoom'){g.globalAlpha=1-k;const cols=['#e0457b','#29b6f6','#ffd21a','#76ff03','#d05cff'];for(let i=0;i<5;i++){g.fillStyle=cols[i];circ(g,f.x+Math.cos(i*1.26)*f.r*.4*k,f.y-20+Math.sin(i*1.26)*f.r*.2*k,f.r*.35*(1-k*.4));}}
    else if(f.type==='slash'){g.globalAlpha=1-k;g.strokeStyle=f.col;g.lineWidth=3*(1-k)+1;g.beginPath();g.arc(f.x-f.f*6,f.y,14+k*10,-1.2,1.2);g.stroke();}
    else if(f.type==='scan'){const SC=f.p&&f.p.col||'#64ffda',x=lerp(f.x,W+20,k);const sg=g.createLinearGradient(x-50,0,x,0);sg.addColorStop(0,hexA(SC,0));sg.addColorStop(1,hexA(SC,.45));g.fillStyle=sg;g.fillRect(x-50,FY0-140,50,FY1-FY0+160);
      g.fillStyle='#ffffff';g.fillRect(x-2,FY0-140,3,FY1-FY0+160);g.globalAlpha=.6;g.strokeStyle=SC;g.lineWidth=1;for(let y=FY0-130;y<FY1+20;y+=12){g.beginPath();g.moveTo(x-40,y);g.lineTo(x,y);g.stroke();}}
    else if(f.type==='oil'){const u=f.u;if(!u.dead){const [x,y]=sxy(u);for(let i=0;i<6;i++){const p=(k*1.4+i*.17)%1;g.globalAlpha=1-p;g.fillStyle=i%2?'#69f0ae':'#b9f6ca';circ(g,x+Math.sin(i*2.1)*14,y-90*dsc(u.d)+p*70*dsc(u.d),2.5);}
      g.globalAlpha=(1-k)*.5;g.fillStyle='#69f0ae';ell(g,x,y,26,7);}}
    else if(f.type==='plus'){const u=f.u;const [x,y]=sxy(u);g.globalAlpha=1-k;g.fillStyle=f.col||'#69f0ae';g.font='900 14px system-ui';g.textAlign='center';g.fillText('✚',x+8,y-70*dsc(u.d)-k*20);}
    else if(f.type==='gear'){const x=f.tgt&&f.tgt.x!==undefined?(f.lx||f.tgt.x):f.x,ty=f.tgt?fy(f.tgt.d)-20*dsc(f.tgt.d):fy(.5);const y=lerp(f.y0,ty,Math.min(1,k/.85));
      if(k<.85){g.translate(x,y);g.rotate(t*12);gearShape(f.r,'#ffd54a');g.rotate(-t*12);g.globalAlpha=.25;g.fillStyle='#ffab00';g.fillRect(-2,-80,4,70);}}
    else if(f.type==='sheet8'){const d=f.sp,v=d.fx8,R=v.rows[0];if(d.fi&&d.fi.complete&&d.fi.naturalWidth){const c=Math.min(7,Math.floor(k*8)),kk=SPK*dsc(f.dd)*1.25;g.globalAlpha=k>.9?(1-k)*10:1;g.translate(f.x,fy(f.dd)+6*S);g.drawImage(d.fi,c*v.cw,R[0],v.cw,R[1],-v.ax*kk,-R[3]*kk,v.uw*kk,R[2]*kk);}}
    else if(f.type==='imgfx'){const im=FXIM[f.k];if(fxOK(f.k)){const e=1-Math.pow(1-Math.min(1,k*3),3),w=f.w*(f.float?1:(.6+.4*e)),h=w*im.naturalHeight/im.naturalWidth;
        g.globalAlpha=Math.min(1,k*6)*(k<.7?1:1-(k-.7)/.3);if(f.spin){g.translate(f.x,f.y-h/2);g.scale(1+Math.sin(f.t*30)*.03,1);g.drawImage(im,-w/2,-h/2,w,h);}else g.drawImage(im,f.x-w/2,f.y-(f.cloud?h/2:h)-(f.float?Math.sin(f.t*6)*3:0),w,h);}}
    else if(f.type==='quake'&&f.fx!==undefined&&f.src&&f.src.spr&&f.src.spr.fx8&&f.src.spr.fi&&f.src.spr.fi.naturalWidth){ // v16-95: Grigore's own rock wall (8 frames) rolls with the quake front
      const d=f.src.spr,v=d.fx8,R=v.rows[0],c=Math.min(7,Math.floor(k*8)),kk=(FY1-FY0)*.85/R[2];g.globalAlpha=k>.9?(1-k)*10:1;
      g.drawImage(d.fi,c*v.cw,R[0],v.cw,R[1],f.fx-v.uw*.55*kk,fy(.58)-R[3]*kk,v.uw*kk,R[2]*kk);}
    else if(f.type==='quake'&&fxOK('quake')&&f.fx!==undefined){const im=FXIM.quake,h=(FY1-FY0)*.62+40*S,w=h*im.naturalWidth/im.naturalHeight;g.globalAlpha=k<.85?1:1-(k-.85)/.15;
      g.drawImage(im,f.fx-w,FY1+18*S-h,w,h);g.globalAlpha*=.5;g.drawImage(im,f.fx-w*1.7,FY1+18*S-h*.8,w*.8,h*.8);}
    else if(f.type==='coil'){const y=fy(f.dd),h=dsc(f.dd);g.globalAlpha=k>.9?(1-k)*10:1;g.fillStyle='#37474f';rr(g,f.x-12*h,y-10*h,24*h,10*h,3);g.fill();g.fillStyle='#ffca28';g.fillRect(f.x-12*h,y-6*h,24*h,3*h);
      g.fillStyle='#78909c';g.fillRect(f.x-3*h,y-60*h,6*h,52*h);g.strokeStyle='#b87333';g.lineWidth=2*h;for(let i=0;i<7;i++){g.beginPath();g.ellipse(f.x,y-14*h-i*6*h,7*h,2.2*h,0,0,TAU);g.stroke();}
      const gl=g.createRadialGradient(f.x,y-70*h,2,f.x,y-70*h,22*h);gl.addColorStop(0,'#ffffff');gl.addColorStop(.35,'#e040fb');gl.addColorStop(1,'rgba(224,64,251,0)');g.fillStyle=gl;circ(g,f.x,y-70*h,(18+Math.sin(f.t*30)*4)*h);}
    else if(f.type==='dust'){g.globalAlpha=1-k;g.fillStyle='rgba(150,120,90,.5)';ell(g,f.x,f.y,20+k*20,6);}
    g.restore();}}
function gearShape(r,col){g.fillStyle=col;g.beginPath();for(let i=0;i<20;i++){const a=i/20*TAU,rr2=i%2?r:r*1.28;g.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2);}g.closePath();g.fill();g.fillStyle='rgba(0,0,0,.35)';circ(g,0,0,r*.4);g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=1.5;g.beginPath();g.arc(0,0,r*.75,0,TAU);g.stroke();}
function drawProj(t){for(const p of B.proj){const x=p.x,y=fy(p.d)-p.h;g.save();g.translate(x,y);
  if(p.look==='wrench'){g.rotate(p.rot*1.2);g.fillStyle='#cfd8dc';rr(g,-10,-2,20,4,2);g.fill();circ(g,10,0,4.5);circ(g,-10,0,3.5);g.fillStyle='rgba(255,255,255,.25)';circ(g,0,0,12);}
  else if(p.look==='oil'){g.fillStyle='rgba(255,193,7,.35)';ell(g,-9,0,10,3.5);g.fillStyle='#e0a100';circ(g,0,0,6);g.fillStyle='#ffd54f';circ(g,-2,-2,2.4);}
  else if(p.type==='bolt'){g.rotate(p.rot);g.fillStyle='#b0bec5';g.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;g.lineTo(Math.cos(a)*4.5,Math.sin(a)*4.5);}g.fill();g.fillStyle='#37474f';circ(g,0,0,1.8);}
  else if(p.type==='wrench'){g.rotate(p.rot*1.5);g.fillStyle='#cfd8dc';rr(g,-12,-2,24,4,2);g.fill();circ(g,12,0,5);circ(g,-12,0,4);g.fillStyle='rgba(255,255,255,.3)';circ(g,0,0,16);}
  else if(p.type==='paint'){g.fillStyle=p.col;circ(g,0,0,4.5);g.fillStyle='rgba(255,255,255,.6)';circ(g,-1.5,-1.5,1.5);}
  else if(p.type==='smoke'){g.fillStyle='rgba(60,60,60,.85)';circ(g,0,0,7);g.fillStyle='rgba(255,120,0,.6)';circ(g,0,0,3);}
  else if(p.type==='acid'){g.fillStyle='#33691e';circ(g,0,0,5.5);g.fillStyle='#76ff03';circ(g,0,0,4);g.fillStyle='rgba(255,255,255,.7)';circ(g,-1.5,-1.5,1.4);}
  else if(p.type==='wave'){g.strokeStyle='rgba(255,236,170,.9)';g.lineWidth=2.5;for(let k=0;k<3;k++){g.globalAlpha=1-k*.28;g.beginPath();g.arc(-k*7,0,6+k*3,-1,1);g.stroke();}g.globalAlpha=1;}
  else if(p.type==='fire'){const fg=g.createRadialGradient(0,0,1,0,0,9);fg.addColorStop(0,'#fff8e1');fg.addColorStop(.4,'#ffab00');fg.addColorStop(1,'rgba(255,40,0,0)');g.fillStyle=fg;circ(g,0,0,9);}
  else if(p.type==='bomb'){g.rotate(p.rot);g.fillStyle='#455a64';rr(g,-6,-9,12,18,4);g.fill();g.fillStyle='#e0457b';g.fillRect(-6,-3,12,5);g.fillStyle='#fff';g.fillRect(-2,-12,4,4);}
  g.restore();}}
function drawParts(){for(const p of B.parts){const a=Math.max(0,p.life/p.max);
  if(p.type==='smoke'){g.globalAlpha=Math.min(1,a*1.4);g.fillStyle=p.col;circ(g,p.x,p.y,p.r*(1.6-a*.6));}
  else if(p.type==='flame'){g.globalAlpha=a;g.fillStyle=p.col;circ(g,p.x,p.y,p.r*a);}
  else if(p.type==='gear'||p.type==='bolt'){g.globalAlpha=Math.min(1,a*2);g.save();g.translate(p.x,p.y);g.rotate(p.rot);if(p.type==='gear'){g.fillStyle=p.col;g.beginPath();for(let i=0;i<12;i++){const q=i/12*TAU,r=i%2?p.r:p.r*1.3;g.lineTo(Math.cos(q)*r,Math.sin(q)*r);}g.fill();}else{g.fillStyle=p.col;g.fillRect(-p.r,-p.r*.45,p.r*2,p.r*.9);}g.restore();}
  else{g.globalAlpha=a;g.fillStyle=p.col;g.fillRect(p.x-p.r/2,p.y-p.r/2,p.r,p.r);}}g.globalAlpha=1;}
function drawNums(){g.textAlign='center';g.lineJoin='round';for(const n of B.nums){const k=n.t,y=n.y-k*34,s=n.big?1+Math.max(0,.35-k)*1.6:1;g.globalAlpha=k<.7?1:1-(k-.7)/.3;
  g.font='900 '+Math.round((n.big?17:13)*s*S)+'px system-ui';g.lineWidth=3.5;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText(n.txt,n.x,y);g.fillStyle=n.col;g.fillText(n.txt,n.x,y);}g.globalAlpha=1;}
// v16-14: little status icons above the HP bar (buffs on mechanics, debuffs on monsters) – they blink in the last second
const STI_H=[['buff','atk','#ff7043'],['aspd','aspd','#ffca28'],['critB','crit','#ff4081'],['defB','helm','#42a5f5'],['shield','shield','#90caf9'],['hot','heart','#66bb6a'],['taunt','horns','#e53935']];
const STI_M=[['ice','snow','#80d8ff'],['stun','star','#fdd835'],['burn','flame','#ff6d00'],['slow','clock','#ba68c8'],['mark','scan','#26c6da'],['weak','skull','#9e9e9e']];
function statusIcons(u,x,y){const L=[];for(const [f,ic,col] of u.hero?STI_H:STI_M){const v=u[f]||0;if(v<=0)continue;if(f==='stun'&&u.ice>0)continue;
    const left=f==='shield'?9:v;L.push([ic,col,left]);}
  if(!L.length)return;const sz=Math.round(13*S),gap=1.5*S,tw=L.length*sz+(L.length-1)*gap;let ix=x-tw/2;
  for(const [ic,col,left] of L){g.globalAlpha=left<1?.35+.65*Math.abs(Math.sin(B.real*10)):1;g.drawImage(badgeCv(ic,col,32),ix,y-sz,sz,sz);ix+=sz+gap;}g.globalAlpha=1;}
function iceOverlay(u){const y=fy(u.d),hh=(u.H||40)*dsc(u.d)*1.1,w=Math.max(22,hh*.5);g.save();g.globalAlpha=.42*Math.min(1,u.ice*2);
  const gr=g.createLinearGradient(0,y-hh,0,y);gr.addColorStop(0,'rgba(225,245,255,.9)');gr.addColorStop(1,'rgba(64,196,255,.7)');g.fillStyle=gr;
  g.beginPath();g.moveTo(u.x-w,y);g.lineTo(u.x-w*1.05,y-hh*.55);g.lineTo(u.x-w*.45,y-hh*1.05);g.lineTo(u.x+w*.2,y-hh*.8);g.lineTo(u.x+w*.6,y-hh*1.1);g.lineTo(u.x+w*1.05,y-hh*.5);g.lineTo(u.x+w,y);g.closePath();g.fill();
  g.globalAlpha=.8*Math.min(1,u.ice*2);g.strokeStyle='#e1f5fe';g.lineWidth=1.5;g.stroke();g.restore();}
function bars(u){if(u.dead)return;const x=u.x,y=headY(u)-6,w=(u.boss?0:u.hero?34:28)*S;
  if(!u.hero&&u.ice>0)iceOverlay(u);
  statusIcons(u,x,w?y-3*S:y+10*S);if(!w)return;
  g.fillStyle='rgba(0,0,0,.65)';rr(g,x-w/2-1,y-1,w+2,6,3);g.fill();g.fillStyle=u.hero?'#66bb6a':'#ef5350';rr(g,x-w/2,y,w*Math.max(0,u.hp/u.max),4,2);g.fill();
  if(u.shield>0){g.fillStyle='#90caf9';g.fillRect(x-w/2,y,w*Math.min(1,u.shield/u.max),1.6);}
  if(u.hero){g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x-w/2,y+5,w,2.4);g.fillStyle=u.en>=100?'#ffd54a':'#ffb300aa';g.fillRect(x-w/2,y+5,w*u.en/100,2.4);
}}

// ---------------------------------------------------------------- HUD (canvas)
let HIT=[];
function btn(x,y,w,h,label,on,id,col){g.fillStyle=on?(col||'#ffb300'):'rgba(20,14,10,.78)';rr(g,x,y,w,h,10);g.fill();g.strokeStyle=on?'#fff3':'rgba(255,179,0,.55)';g.lineWidth=1.5;g.stroke();
  g.fillStyle=on?'#2a1000':'#ffd54a';g.font='900 '+Math.round(14*Math.min(1.2,S))+'px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(label,x+w/2,y+h/2+1);g.textBaseline='alphabetic';HIT.push({x,y,w,h,id});}
// v16-49: battle buttons = Marius' pictures (img/ui3/b_*.webp); the old drawn buttons stay as fallback until they are loaded
const BIM={};['pause','x1','x15','x2','aoff','aon'].forEach(k=>{const im=new Image();im.src='img/ui3/b_'+k+'.webp';BIM[k]=im;});
function ibtn(x,y,s,k,id){const im=BIM[k];if(!im||!im.complete||!im.naturalWidth)return false;g.drawImage(im,x,y,s,s*im.naturalHeight/im.naturalWidth);HIT.push({x,y,w:s,h:s,id});return true;}
function drawHUD(t){HIT=[];const top=10,bh=38;
  if(!ibtn(8,top-2,44,'pause','pause')){btn(10,top,44,bh,'',false,'pause');g.drawImage(badgeCv('pause','#ffb300',64),10+22-13,top+bh/2-13,26,26);}
  g.textAlign='center';const tt=(B.wbB?'WORLD BOSS':B.tw&&B.tw.dg?'DUNGEON':B.tw?'TOWER':sLabel(B.si))+' · '+B.stage.n.toUpperCase();let fs=Math.round(15*S);g.font='900 '+fs+'px system-ui';while(fs>9&&g.measureText(tt).width>W-250){fs--;g.font='900 '+fs+'px system-ui';}g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.8)';g.strokeText(tt,W/2,top+17);g.fillStyle='#ffe0b2';g.fillText(tt,W/2,top+17);
  const nw=B.wbB?0:B.stage.w.length;for(let i=0;i<nw;i++){const x=W/2+(i-(nw-1)/2)*22,y=top+33;const boss=B.stage.w[i].some(m=>MON[m].boss);g.fillStyle=i<B.wave?'#66bb6a':i===B.wave?'#ffb300':'rgba(255,255,255,.25)';
    if(boss){g.font='900 13px system-ui';g.fillText('💀',x,y+5);}else{rr(g,x-7,y-3,14,7,3);g.fill();}}
  if(ibtn(W-104,top-2,44,B.spd===2?'x2':B.spd===1.5?'x15':'x1','spd')){if(B.spd===1.5&&!TE().spd2())g.drawImage(badgeCv('lock','#8d6e63',64),W-104+32,top-6,16,16);}
  else{btn(W-112,top,48,bh,'×'+B.spd,B.spd>1,'spd');if(B.spd===1.5&&!TE().spd2()){g.drawImage(badgeCv('lock','#8d6e63',64),W-112+36,top-4,16,16);}}
  if(!ibtn(W-54,top-2,44,B.auto?'aon':'aoff','auto'))btn(W-58,top,48,bh,'AUTO',B.auto,'auto','#66bb6a');
  if(B.wbB)wbHUD(t,top);
  else if(B.bossBar&&!B.bossBar.dead){const b=B.bossBar,bw=W*.8,x=W*.1,y=top+50;g.fillStyle='rgba(0,0,0,.75)';rr(g,x-2,y-2,bw+4,16,8);g.fill();
    const bg2=g.createLinearGradient(x,0,x+bw,0);bg2.addColorStop(0,'#b71c1c');bg2.addColorStop(1,b.enr?'#ff1744':'#ff6d00');g.fillStyle=bg2;rr(g,x,y,bw*Math.max(0,b.hp/b.max),12,6);g.fill();
    g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x,y+1,bw*Math.max(0,b.hp/b.max),3);
    g.font='900 '+Math.round(11*S)+'px system-ui';g.fillStyle='#fff';g.textAlign='center';g.fillText('💀 '+b.name+(b.enr?' · ENRAGED':''),W/2,y+26);}
  // hero cards
  const n=B.heroes.length,pad=8,cw=(W-pad*(n+1))/n,ch=H-PANEL-14,y0=PANEL+4;
  const pg=g.createLinearGradient(0,PANEL-10,0,H);pg.addColorStop(0,'rgba(10,6,4,0)');pg.addColorStop(.18,'rgba(10,6,4,.88)');pg.addColorStop(1,'rgba(6,3,2,.97)');g.fillStyle=pg;g.fillRect(0,PANEL-10,W,H-PANEL+10);
  B.heroes.forEach((u,i)=>{const x=pad+i*(cw+pad),y=y0,ready=canCast(u);
    g.save();if(u.dead)g.globalAlpha=.45;
    if(!drawFCard(u,x,y,cw,ch,ready,t)){ // frame picture not loaded yet → old plain card
      g.fillStyle=u.look.gc;rr(g,x,y,cw,ch,10);g.fill();
      g.font='900 '+Math.round(Math.min(9.5,cw/7.2))+'px system-ui';g.textAlign='center';g.fillStyle='#fff';g.fillText(u.h.n.slice(0,11),x+cw/2,y+ch-23);}
    g.restore();HIT.push({x,y,w:cw,h:ch,id:'card',u});});
}
// v16-17: battle cards use the grade frames (img/fr0-5, Marius' pictures). The frame is stretched only on a plain
// strip of its sides (FSTR, rows of the 220-px picture) so it gets as tall as the card without bending the corners.
const FRM=[0,1,2,3,4,5].map(i=>{const im=new Image();im.src='img/fr'+i+'.webp';return im;});
const FWIN=[[8.5,17.5,83,61.5],[8.5,17.5,83,61.5],[8.5,18,83,61],[15.5,17.5,69,55],[14.5,20.5,71,50],[17.8,21.5,64.4,46.5]]; // window % (same as the Team page)
const FPLT=[[81,11],[81,11],[81,11],[73.5,9.5],[74.5,9.5],[74.5,9]]; // bottom plate % (top, height)
const FSTR=[[62,78],[62,78],[62,78],[60,76],[58,74],[96,108]];
const FACE={m0_0:0.7,m0_1:0.64,m0_2:0.64,m0_3:0.68,m0_4:0.6,m0_5:0.66,m0_6:0.62,m0_7:0.58,m0_8:0.58,m0_9:0.55,m1_0:0.55,m1_1:0.62,m1_2:0.58,m1_3:0.66,m1_4:0.62,m1_5:0.58,m1_6:0.58,m1_7:0.62,m1_8:0.58,m2_0:0.64,m2_1:0.58,m2_2:0.58,m2_3:0.66,m2_4:0.62,m2_5:0.62,m2_6:0.62,m2_7:0.65,m3_0:0.6,m3_1:0.6,m3_2:0.65,m3_3:0.62,m3_4:0.62,m3_5:0.65,m3_6:0.65,m4_0:0.64,m4_1:0.52,m4_2:0.62,m4_3:0.6,m4_4:0.58,m4_5:0.66,m5_0:0.5,m5_1:0.62}; // v16-40: where the face is in each portrait (0-1 of the width) → card window centred on it
function drawFCard(u,x,y,cw,ch,ready,t){const h=u.h,i=h.crew?0:Math.min(5,h.gr|0),im=FRM[i];
  if(!im.complete||!im.naturalWidth)return false;
  const iw=im.naturalWidth,ih=im.naturalHeight;let s=cw/iw;if(ih*s>ch)s=ch/ih;
  const fw=iw*s,fx=x+(cw-fw)/2,ex=ch-ih*s,[a,b]=FSTR[i],mid=(b-a)*s+ex;
  const Y=sy=>sy<=a?y+sy*s:sy>=b?y+sy*s+ex:y+a*s+(sy-a)/(b-a)*mid;
  const F=FWIN[i],wx=fx+F[0]/100*fw,ww=F[2]/100*fw,wy=Y(F[1]/100*ih),wb=Y((F[1]+F[3])/100*ih),wh=wb-wy;
  const GR=TE().GRADES[h.crew?0:h.gr]||TE().GRADES[0];
  // frame: top · stretched strip · bottom (drawn first – its window is opaque · glows when the skill is ready)
  g.save();if(ready){const p=.5+.5*Math.sin(t*8);g.shadowColor='#ffb300';g.shadowBlur=12+p*12;}
  g.drawImage(im,0,0,iw,a,fx,y,fw,a*s);g.drawImage(im,0,a,iw,b-a,fx,y+a*s,fw,mid);g.drawImage(im,0,b,iw,ih-b,fx,y+a*s+mid,fw,(ih-b)*s);
  g.restore();
  // window: grade-coloured background + portrait (head at the top)
  g.save();g.beginPath();g.rect(wx,wy,ww,wh);g.clip();
  const bg=g.createLinearGradient(0,wy,0,wb);bg.addColorStop(0,GR.d);bg.addColorStop(1,'#07090c');g.fillStyle=bg;g.fillRect(wx,wy,ww,wh);
  const pc=portraitCv(h);if(pc){const K=(pc.naturalWidth||pc.width)/128,AH=wh-22,wide=ww>AH;let sw=clamp(128*ww/AH,78,128),sH=128,y0=0,dh=ww*128/sw;
    if(wide){sw=128;sH=Math.max(48,128*AH/ww);y0=clamp(.38*128-sH/2,0,128-sH);dh=AH;} // v16-40: wide card (few heroes) → show the face, not the top of the head
    const x0=clamp((FACE[h.id]||.6)*128-sw/2,0,128-sw);g.drawImage(pc,x0*K,y0*K,sw*K,sH*K,wx,wy,ww,dh);
    const sh=g.createLinearGradient(0,wy+dh-18,0,wy+dh);sh.addColorStop(0,'rgba(7,9,12,0)');sh.addColorStop(1,'rgba(7,9,12,1)');g.fillStyle=sh;g.fillRect(wx,wy+dh-18,ww,18);
    g.fillStyle='#07090c';g.fillRect(wx,wy+dh,ww,wh-dh+1);}
  // name (shrinks to fit) + HP + energy at the bottom of the window
  let fs=Math.min(10,cw/6.6);g.font='900 '+fs+'px system-ui';const tw=g.measureText(h.n).width;if(tw>ww-4){fs*=(ww-4)/tw;g.font='900 '+fs+'px system-ui';}
  g.textAlign='center';g.lineWidth=2.5;g.strokeStyle='#000';g.strokeText(h.n,wx+ww/2,wb-17);g.fillStyle='#fff';g.fillText(h.n,wx+ww/2,wb-17);
  const bx=wx+3,bw=ww-6;
  g.fillStyle='rgba(0,0,0,.8)';g.fillRect(bx,wb-13,bw,5);g.fillStyle='#66bb6a';g.fillRect(bx,wb-13,bw*Math.max(0,u.hp/u.max),5);
  g.fillStyle='rgba(0,0,0,.8)';g.fillRect(bx,wb-7,bw,5);g.fillStyle=u.en>=100?'#ffd54a':'#ff9800';g.fillRect(bx,wb-7,bw*u.en/100,5);
  if(ready){g.fillStyle='rgba(255,179,0,'+(.18+.15*Math.sin(t*8))+')';g.fillRect(wx,wy,ww,wh);}
  g.restore();
  // role badge (top-left of the window) · +stars on the bottom plate
  const rb=Math.min(18,ww*.34);g.drawImage(roleBadgeCv(u.role),wx+1,wy+1,rb*1.25,rb*1.25);
  const P=FPLT[i],py=Y((P[0]+P[1]/2)/100*ih),st=h.crew?'CREW':'+'+stars(h);
  g.font='900 '+Math.max(7,Math.min(10,fw/7))+'px system-ui';g.textAlign='center';g.lineWidth=2.5;g.strokeStyle='#000';g.strokeText(st,fx+fw/2,py+3.5);g.fillStyle=GR.c;g.fillText(st,fx+fw/2,py+3.5);
  if(ready){g.font='900 '+Math.round(cw/4.6)+'px system-ui';g.lineWidth=3;g.strokeStyle='#000';g.strokeText('TAP!',x+cw/2,wy+wh*.42);g.fillStyle='#fff3c4';g.fillText('TAP!',x+cw/2,wy+wh*.42);}
  if(u.dead){g.globalAlpha=1;g.font='900 22px system-ui';g.fillText('💀',x+cw/2,wy+wh*.42);}
  return true;}
function drawBanner(t){const b=B.banner;if(!b)return;if(FX2&&b.u)return drawBanner2(t,b);const k=b.t,a=k<.15?k/.15:k>1.05?Math.max(0,(1.3-k)/.25):1;const y=H*.3;
  g.save();g.globalAlpha=a;const off=(1-Math.min(1,k/.18))*-W;
  const gr=g.createLinearGradient(0,y-34,0,y+34);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,b.boss?'rgba(120,0,0,.85)':'rgba(30,15,0,.85)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,y-40,W,80);
  g.fillStyle=b.boss?'#ff1744':(b.u?b.u.look.gc:'#ffb300');g.fillRect(0,y-30,W,2);g.fillRect(0,y+28,W,2);
  if(b.u&&portraitCv(b.u.h)){const pc=portraitCv(b.u.h);g.save();g.translate(off,0);g.beginPath();g.arc(W*.2,y,30,0,TAU);g.clip();g.drawImage(pc,W*.2-32,y-32,64,64);g.restore();}
  g.font='900 '+Math.round(24*S)+'px system-ui';g.textAlign=b.u?'left':'center';g.lineWidth=5;g.strokeStyle='#000';const tx=b.u?W*.2+44-off*.3:W/2;g.strokeText(b.name,tx,y+4);g.fillStyle=b.boss?'#ff8a80':'#ffe082';g.fillText(b.name,tx,y+4);
  if(b.u){g.font='800 '+Math.round(11*S)+'px system-ui';g.fillStyle='#fff';g.fillText(b.u.h.n,tx,y+22);}
  g.restore();}
function drawBanner2(t,b){const k=b.t,a=k<.12?k/.12:k>1.05?Math.max(0,(1.3-k)/.25):1,y=H*.3,col=b.u.look.gc||'#ffb300',rc=ROLECOL[b.u.role]||col;
  const sl=Math.min(1,k/.16),ease=1-(1-sl)*(1-sl)*(1-sl),drift=(k-.16)*14;g.save();g.globalAlpha=a;
  // slanted band
  g.save();g.translate(W/2,y);g.rotate(-.12);const bw=W*1.5,bh=96*S;g.translate(-bw/2+(1-ease)*-W,0);
  const gr=g.createLinearGradient(0,-bh/2,0,bh/2);gr.addColorStop(0,'rgba(0,0,0,.0)');gr.addColorStop(.18,'rgba(12,6,2,.92)');gr.addColorStop(.82,'rgba(12,6,2,.92)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,-bh/2,bw,bh);
  g.fillStyle=rc;g.fillRect(0,-bh/2+8,bw,3);g.fillRect(0,bh/2-11,bw,3);
  g.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const ly=((i*37)%(bh-24))-bh/2+12,lx=((i*173+t*900)%(bw+200))-100;g.globalAlpha=a*.35;g.fillStyle=i%3?rc:'#fff';g.fillRect(bw-lx,ly,60+(i*29)%90,2);}
  g.globalCompositeOperation='source-over';g.restore();g.globalAlpha=a;
  // portrait with glow
  const pc=portraitCv(b.u.h),px=W*.2+(1-ease)*-W*.6+drift,py=y-6*S,pr=50*S;
  const gl=g.createRadialGradient(px,py,pr*.5,px,py,pr*1.6);gl.addColorStop(0,rc+'cc');gl.addColorStop(1,rc+'00');g.fillStyle=gl;g.beginPath();g.arc(px,py,pr*1.6,0,TAU);g.fill();
  if(pc){g.save();g.beginPath();g.arc(px,py,pr,0,TAU);g.clip();g.drawImage(pc,px-pr,py-pr,pr*2,pr*2);g.restore();}
  g.lineWidth=4;g.strokeStyle='#fff';g.beginPath();g.arc(px,py,pr,0,TAU);g.stroke();g.lineWidth=2;g.strokeStyle=rc;g.beginPath();g.arc(px,py,pr+4,0,TAU);g.stroke();
  // name
  const tx=px+pr+14*S+(1-ease)*W*.8;const fs=Math.round(Math.min(28*S,(W-tx-8)/Math.max(6,b.name.length)*1.75));g.font='italic 900 '+fs+'px system-ui';g.textAlign='left';
  g.lineWidth=6;g.strokeStyle='#000';g.strokeText(b.name,tx,y+6);g.shadowColor=rc;g.shadowBlur=18;const ng=g.createLinearGradient(0,y-fs,0,y+6);ng.addColorStop(0,'#fffde7');ng.addColorStop(1,'#ffc400');g.fillStyle=ng;g.fillText(b.name,tx,y+6);g.shadowBlur=0;
  g.font='800 '+Math.round(12*S)+'px system-ui';g.fillStyle='#fff';g.fillText(b.u.h.n,tx,y+26*S);
  g.restore();}
function drawCombo(){const c=B.combo;if(!c)return;const L=['','','DOUBLE KO!','TRIPLE KO!','QUAD KO!'],txt=L[c.n]||'MEGA KO ×'+c.n,k=c.t,s=k<.12?.6+k/.12*.6:1.2-Math.min(.2,(k-.12)*.6),a=k>1.1?Math.max(0,(1.4-k)/.3):1;
  g.save();g.globalAlpha=a;g.translate(W*.5,H*.4);g.rotate(-.06);g.scale(s,s);g.textAlign='center';g.font='900 italic '+Math.round(28*S)+'px system-ui';g.lineJoin='round';g.lineWidth=7;g.strokeStyle='#2a0a00';g.strokeText(txt,0,0);
  const gr=g.createLinearGradient(0,-24,0,4);gr.addColorStop(0,'#fffde7');gr.addColorStop(1,c.n>=4?'#ff1744':c.n===3?'#ff6d00':'#ffc400');g.fillStyle=gr;g.fillText(txt,0,0);g.restore();}
function drawCenterText(t){let txt=null,sub=null;
  if(B.phase==='intro'){txt=B.phT<.8?'WAVE '+(B.wave+1)+'/'+B.stage.w.length:'FIGHT!';}
  else if(B.phase==='march'&&B.phT>.3){const boss=B.stage.w[B.wave].some(m=>MON[m].boss);txt=boss?'⚠ BOSS ⚠':'WAVE '+(B.wave+1)+'/'+B.stage.w.length;if(boss)sub=B.stage.w[B.wave].map(m=>MON[m]).find(m=>m.boss).n;}
  else if(B.phase==='win')txt='VICTORY!';else if(B.phase==='lose')txt='DEFEAT';
  if(!txt)return;const s=1+Math.max(0,.3-(B.phT%10))*1.2;g.save();g.translate(W/2,H*.27);g.scale(s,s);g.textAlign='center';g.font='900 '+Math.round(38*S)+'px system-ui';g.lineWidth=7;g.lineJoin='round';g.strokeStyle='#1a0800';g.strokeText(txt,0,0);
  const gr=g.createLinearGradient(0,-30,0,6);gr.addColorStop(0,'#fff8e1');gr.addColorStop(1,B.phase==='lose'||txt.includes('BOSS')?'#ff5252':'#ffa000');g.fillStyle=gr;g.fillText(txt,0,0);
  if(sub){g.font='900 '+Math.round(16*S)+'px system-ui';g.lineWidth=4;g.strokeText(sub,0,26);g.fillStyle='#ffccbc';g.fillText(sub,0,26);}g.restore();}
function spdOK(v){const own=TE().spd2();if(v===2&&own)return 2;if(v===1.5||v===2||v===3)return 1.5;return 1;}
function drawOffer(t){g.fillStyle='rgba(0,0,0,.78)';g.fillRect(0,0,W,H);HIT=[];const bw=Math.min(330,W*.86),bh2=300,x=W/2-bw/2,y=H*.22;
  const gr=g.createLinearGradient(0,y,0,y+bh2);gr.addColorStop(0,'#3a2410');gr.addColorStop(1,'#150c06');g.fillStyle=gr;rr(g,x,y,bw,bh2,18);g.fill();g.strokeStyle='#ffb300';g.lineWidth=2.5;g.stroke();
  g.drawImage(badgeCv('aspd','#ff6d00',96),W/2-36,y+16,72,72);g.textAlign='center';g.fillStyle='#ffe082';g.font='900 '+Math.round(22*Math.min(1.2,S))+'px system-ui';g.fillText('BATTLE SPEED ×2',W/2,y+116);
  g.fillStyle='#e0c6ad';g.font='700 13px system-ui';g.fillText('×1.5 is free for everyone.',W/2,y+142);g.fillText('×2 is a pack – yours forever, every chapter.',W/2,y+161);
  btn(x+20,y+182,bw-40,48,'€2.99'+' · UNLOCK ×2',true,'buy');btn(x+20,y+240,bw-40,40,'NO THANKS',false,'nobuy');
  if(window.SEC&&SEC.TEST_MODE){g.fillStyle='#9a8';g.font='700 10px system-ui';g.fillText('TEST MODE (owner): tapping the price unlocks without payment',W/2,y+bh2+18);}}
function drawPause(){g.fillStyle='rgba(0,0,0,.7)';g.fillRect(0,0,W,H);g.textAlign='center';g.font='900 '+Math.round(30*S)+'px system-ui';g.fillStyle='#ffe082';g.fillText('PAUSED',W/2,H*.36);
  HIT=[];const bw=Math.min(260,W*.7);btn(W/2-bw/2,H*.44,bw,52,'▶  RESUME',true,'resume');btn(W/2-bw/2,H*.44+66,bw,52,'🏳  RETREAT',false,'retreat');}

// ---------------------------------------------------------------- render
// v16-25: camera = screen shake + a short zoom "punch" on skills, boss hits and multi-KOs (more dynamic battles)
function camT(){const z=1+(B.zoom||0);g.setTransform(DPR*z,0,0,DPR*z,DPR*(W/2*(1-z)+(B.sx||0)*z),DPR*(H*.55*(1-z)+(B.sy||0)*z));}
function punch(z){if(!B.sim)B.zoom=Math.max(B.zoom||0,z);}
function render(){const t=B.real;g.setTransform(DPR,0,0,DPR,0,0);
  let sx=0,sy=0;if(B.shake>0){sx=rnd(-1,1)*B.shake;sy=rnd(-1,1)*B.shake*.6;}
  B.sx=sx;B.sy=sy;if(sx||sy){g.fillStyle='#000';g.fillRect(0,0,W,H);}g.save();camT();
  drawBG(t);drawTele(t);drawGroundFx();drawFx2(true);
  const all=[...B.heroes,...B.mons].sort((a,b)=>a.d-b.d||(a.dead?-1:1));
  for(const u of all){u.sx=u.x;u.sy=fy(u.d)-(u.lift||0);u.sc=dsc(u.d)*(u.hero?1:u.boss?1:1.22);drawUnit(g,u,B.t);}
  for(const u of all)bars(u);
  drawProj(t);drawFx(t);drawParts();drawFx2(false);camT();drawNums();
  g.restore();
  drawAtmo(t);
  if(B.flash>0){g.fillStyle='rgba(255,240,200,'+B.flash*.6+')';g.fillRect(0,0,W,H);}
  drawHUD(t);drawBanner(t);drawCenterText(t);drawCombo();
  if(B.paused){if(B.offer)drawOffer(t);else drawPause();}}
function loop(now){if(!running)return;raf=requestAnimationFrame(loop);if(now-lastT<14.5)return; // v16-27: max 60 fps (120 Hz phones drew twice as much)
  const raw=Math.min(.05,(now-lastT)/1000);lastT=now;
  if(!B.paused){B.real+=raw;B.shake=Math.max(0,B.shake-raw*40);if(B.zoom)B.zoom=Math.max(0,B.zoom-raw*(B.zoom*5+.02));if(B.combo){B.combo.t+=raw;if(B.combo.t>1.4)B.combo=null;}B.flash=Math.max(0,B.flash-raw*2.2);
    let ts=B.spd;if(B.slowT>0){B.slowT-=raw;ts=.38;} // v16-41: skills in slow motion (same at ×1, ×1.5, ×2) so you can see themif(B.hs>0){B.hs-=raw;ts*=.06;}
    let left=raw*ts;while(left>0){const s=Math.min(1/60,left);step(s);left-=s;}}
  const t0=performance.now();render();
  // v16-25: the old check counted loading hiccups at the start and re-made the canvas in the middle of the fight → the screen "tore".
  // Now: the first 2 s are ignored (on phones the drawing happens on the graphics chip, so the frame time must count too), and lower quality starts at the next wave change (hidden by the march) or next battle.
  if(B.real>2){B.perf.push(Math.max(performance.now()-t0,raw*1000));if(B.perf.length>120){const a=B.perf.reduce((x,y)=>x+y,0)/B.perf.length;B.perf=[];if(a>30&&!B.lowRes&&!LOWRES){LOWRES=true;try{sessionStorage.setItem('te_lowres','1');}catch(e){}}}}
  if(LOWRES&&!B.lowRes&&B.phase==='march'&&B.phT<.2){B.lowRes=true;bsize(true);}}
cv.addEventListener('pointerdown',e=>{if(!B)return;const R=cv.getBoundingClientRect(),x=(e.clientX-R.left)*W/(R.width||W),y=(e.clientY-R.top)*H/(R.height||H),P=6;for(const h of HIT){if(x>=h.x-P&&x<=h.x+h.w+P&&y>=h.y-P&&y<=h.y+h.h+P){
  if(h.id==='pause'){B.paused=true;}else if(h.id==='resume'){B.paused=false;lastT=performance.now();}else if(h.id==='retreat'){B.paused=false;B.res=1;finish(false,true);}
  else if(h.id==='spd'){if(B.spd===1)B.spd=1.5;else if(B.spd===1.5){if(TE().spd2())B.spd=2;else{B.offer=true;B.paused=true;}}else B.spd=1;TE().G.cp.spd=B.spd;}
  else if(h.id==='buy'){if(B.buying)return;B.buying=1;const T=TE(); // v16-75: real payment (before: unlocked for free!)
    SEC.buy('spd2').then(ok=>{B.buying=0;if(!ok)return;T.PK.spd2=true;T.savePacks();B.spd=2;T.G.cp.spd=2;B.offer=false;B.paused=false;lastT=performance.now();T.toast('⏩ Battle Speed ×2 unlocked forever!',3000);});}
  else if(h.id==='nobuy'){B.offer=false;B.paused=false;B.spd=1;TE().G.cp.spd=1;lastT=performance.now();}else if(h.id==='auto'){B.auto=!B.auto;TE().G.cp.auto=B.auto;}
  else if(h.id==='card'&&!B.paused){if(canCast(h.u))cast(h.u);else if(!h.u.dead&&B.phase==='fight')tapHint(1);}
  return;}}
  if(!B.paused&&!B.res)tapHint(0);});
// v16-3: testers thought they had to tap to attack – explain that fights are automatic
let hintT=0;function tapHint(card){const n=performance.now();if(n-hintT<3500)return;hintT=n;
  TE().toast(card?'⚡ Skill charging – tap the card when it shows TAP!':'🔧 Your mechanics attack on their own · tap a card when it shows TAP! to use its skill',3200);}
let LOWRES=false;try{LOWRES=sessionStorage.getItem('te_lowres')==='1';}catch(e){}
let rzT=0;addEventListener('resize',()=>{clearTimeout(rzT);rzT=setTimeout(()=>{if(running)bsize();},180);});

// ---------------------------------------------------------------- results
const ANX={id:0,n:0};
function finish(win,retreat){running=false;cancelAnimationFrame(raf);if(B.tw)return twFinish(win,retreat);const T=TE(),G=T.G,si=B.si,S0=STAGES[si];
  const P=CPX();if(!B.sim&&si===P.best){if(win)delete P.stuck;else if(!P.stuck||P.stuck.si!==si)P.stuck={si,t:Date.now()};}
  let html='';const lab=sLabel(si);
  if(win){const st=B.deaths===0?3:B.deaths<=2?2:1;const first=si>=P.best;const R=REWARDX(si);const money=first?R.money:Math.round(R.money*.25/10)*10,tk=first?R.tk:0;
    G.money+=money;if(first)P.best=si+1;P.stars[si]=Math.max(P.stars[si]||0,st);
    const drops=[];const big=S0.boss||S0.mini;const n=first?(S0.boss?2:1):(big||Math.random()<.4?1:0);for(let k=0;k<n;k++)drops.push(dropItem(S0.c,big));
    let sold=0;drops.forEach(d=>{if(d.sold){sold+=d.sold;G.gp=(G.gp||0)+d.sold;}});
    const gtk=first?R.gtk:0;if(gtk)GSD().tk+=gtk;
    const ct=first?R.ct:0,dmw=first?R.dm:0;if(ct)G.h.ct+=ct;if(dmw)G.dm=(G.dm||0)+dmw;
    const hk=HM?HARD_RW:1,ess=Math.round(T.ESS_U()*(first?(S0.boss?3:S0.mini?1:.5):.1)*hk),gpw=Math.round(T.GP_U()*(first?(S0.boss?3:S0.mini?1.5:1):.25)*hk);G.ess=(G.ess||0)+ess;G.gp=(G.gp||0)+gpw;if(window.EVT)EVT.q('win',1); // v16-99 // v16-37: bosses give Crew Tickets + Diamonds
    T.save();if(tk)T.addTickets(tk,'Campaign '+lab);
    const chDone=first&&S0.boss&&S0.c<NCH-1;
    // v16-47: Marius' VICTORY page – stars on the emblem (missing ones greyed), rewards in the 4 slots
    const rws=[[`<img src="img/ui2/i_coins.webp">`,T.fmt(money)],[T.ESI,'+'+T.nf(ess)],[T.GPI,'+'+T.nf(gpw)]];if(tk)rws.push([TKI,'+'+tk]);if(gtk)rws.push([GTKI,'+'+gtk]);if(ct)rws.push(['<img src="img/cticket.webp">','+'+ct]);if(dmw)rws.push([T.DMI,'+'+dmw]);
    html=`<div class="rsV"><img class="hi" src="img/ui2/victory.webp" alt="VICTORY">${[0,1,2].map(k=>k<st?'':`<i class="stx s${k}"></i>`).join('')}
      <div class="rsL">STAGE ${lab} · ${S0.n.toUpperCase()}<small>${first?'FIRST CLEAR REWARDS':'REPLAY REWARD'}</small></div>
      ${rws.slice(0,4).map((r,k)=>`<div class="rsS" style="left:${[10.7,31.3,51.6,72][k]}%">${r[0]}<b>${r[1]}</b></div>`).join('')}
      <div class="rsU">${rws.length>4?rws.slice(4).map(r=>r[0]+' '+r[1]).join(' · ')+' · ':''}${st<3?'⭐⭐⭐ = no mechanic knocked out':'Perfect! No mechanic was knocked out.'}</div></div>
      <div class="rsM">${chDone?`<div class="chUn">CHAPTER ${S0.c+1} CLEARED!<br><small>Chapter ${S0.c+2} · ${CHAP[S0.c+1].n} is now open</small></div>`:''}
      ${drops.length?`<div class="cpSec">${IMGI(glyphURL('bag','#ffb300'))} GEAR FOUND</div><div class="gDrop">${drops.map(d=>itemCard(d.it,`<i>${itemName(d.it)}</i>`)).join('')}</div>${sold?`<div class="sub">Bag full (${GINV}) – salvaged for ${GPN(sold)}</div>`:''}`:''}
      ${si<NST-1?'<div class="anx" data-a="atog"><span>⟳ AUTO NEXT</span><i id="anxC"></i><b id="anxS"></b></div>':''}
      <div class="cpRow">${si<NST-1?'<button class="cpGo" data-a="next">NEXT ▶</button>':''}<button class="cpGo alt" data-a="map">CAMPAIGN</button></div>${gtk?'<button class="cpGo alt" data-a="gsum">'+GTKI+' GEAR SUMMON</button>':''}${drops.length?'<button class="cpGo alt" data-a="gear">'+IMGI(glyphURL('bag','#ffd9b0'))+' EQUIP GEAR</button>':''}</div>`;}
  else{html=`<div class="rsD"><img class="hi" src="img/ui2/defeat.webp" alt="DEFEAT">${retreat?'<div class="rsR">RETREAT</div>':''}<div class="rsL">STAGE ${lab} · ${S0.n.toUpperCase()}<small>HOW TO GET STRONGER – tap one</small></div>
      <div class="rsDB b0" data-a="gear"><img src="img/ui2/i_forge.webp"><span><b>Equip & upgrade gear</b>works only in battles</span></div>
      <div class="rsDB b1" data-a="hsum">${TKI}<span><b>Summon more mechanics</b>higher color = much stronger · duplicates +1 star</span></div>
      <div class="rsDB b2" data-a="team"><img src="img/ui9/essence.webp"><span><b>Level up your heroes</b>Essence → LEVEL UP · Ascension every 20 levels</span></div>
      <button class="rsGo" data-a="retry">RETRY</button></div>
      <div class="rsM"><div class="cpRow"><button class="cpGo alt" data-a="team">${IMGI('img/ui2/i_star1.webp','1.3em','-.35em')} HEROES</button><button class="cpGo alt" data-a="map">CAMPAIGN</button></div></div>`;}
  $('cpResBox').classList.add('rsSk');
  $('cpResBox').innerHTML=html;$('cpRes').classList.add('open');$('cpResBox').scrollTop=0;
  // v16-25: AUTO NEXT – after a victory the next stage starts by itself after a 3 s countdown (same team). Stops on defeat, on any tap, or with the switch.
  clearInterval(ANX.id);const canAuto=win&&si<NST-1&&chOpen(STAGES[si+1].c);
  const anxShow=()=>{const on=G.cp.autoNext!==false,b=$('anxS'),c=$('anxC');if(!b)return;b.textContent=on?'ON':'OFF';b.parentNode.classList.toggle('on',on);c.textContent=on&&ANX.n>0?'next stage in '+ANX.n+'…':on?'':'tap to turn on';};
  const anxGo=()=>{clearInterval(ANX.id);ANX.n=0;if(!canAuto||G.cp.autoNext===false||window.__TUTON)return anxShow(); /* v16-72: no auto-next during the tutorial */ANX.n=3;anxShow();
    ANX.id=setInterval(()=>{if(!$('cpRes').classList.contains('open')){clearInterval(ANX.id);return;}ANX.n--;anxShow();if(ANX.n<=0){clearInterval(ANX.id);
      $('cpRes').classList.remove('open');CPX().ch=STAGES[si+1].c;safeStart(si+1,teamHeroes());}},1000);};
  if(canAuto)anxGo();
  $('cpResBox').onclick=e=>{const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;
    if(a==='atog'){G.cp.autoNext=G.cp.autoNext===false;T.save();anxGo();return;}
    clearInterval(ANX.id);ANX.n=0;$('cpRes').classList.remove('open');$('bt').classList.remove('open');
    if(a==='next'){if(si<NST-1&&chOpen(STAGES[si+1].c)){CPX().ch=STAGES[si+1].c;showMap();openCard(si+1);}else showMap();}else if(a==='retry'){safeStart(si,teamHeroes());}else if(a==='team'){showMap();openGear(null,si);}
    else if(a==='gear'){showMap();openGear();}else if(a==='gsum'){showMap();gsOpenSm();}else if(a==='hsum'){showMap();openGear(null,si);const T2=TE();if(T2.openSummon){const sm=document.getElementById('sm');if(sm)sm.style.zIndex=30;T2.openSummon('m');}}else showMap();};}

// ---------------------------------------------------------------- campaign map (5 chapters × 20 stages)
const PH=2280;
const NODEX=j=>j===19?50:(j%2?70:30)+(j%4===1?6:j%4===3?-6:0);
const NODEY=j=>PH-110-j*106-(j===19?24:0);
const chOpen=c=>CPX().best>=c*SPC&&(!HM||TE().G.cp.best>=(c+1)*SPC);
function curCh(){const P=CPX();let c=P.ch;if(c==null||c<0||c>=NCH||!chOpen(c)){c=Math.min(NCH-1,Math.floor(Math.min(P.best,NST-1)/SPC));while(c>0&&!chOpen(c))c--;}P.ch=c;return c;}
// v15: new map look (from the player's picture) – dirt ground, junkyard props cut from the picture, metal road, metal stage pads
const UIM={};function uim(n){if(UIM[n])return UIM[n];const i=new Image();i.onload=()=>{if(root.classList.contains('open')&&!$('bt').classList.contains('open')){clearTimeout(uim.t);uim.t=setTimeout(()=>drawPath(curCh()),60);}};i.src='img/ui/'+n+'.webp';return UIM[n]=i;}
const PROPS_L=['pr_crane','pr_cars','pr_redcar','pr_fence','pr_barrierL'],PROPS_R=['pr_shed','pr_barrels','pr_tires'];
['ground','pr_sign','pr_puddle','pr_tire1','pr_barrels2',...PROPS_L,...PROPS_R].forEach(uim);
const PSC={pr_fence:.8,pr_shed:.95};
function propDraw(x,name,side,y,k,flip){const im=uim(name);if(!im.complete||!im.naturalWidth)return;const sc=k*(PSC[name]||1),w=im.naturalWidth*sc,h=im.naturalHeight*sc;
  // side: 'L' anchored to left edge, 'R' anchored to right edge (flip mirrors a left prop to the right and back)
  x.save();const W=x.canvas.width/x.getTransform().a;
  if(flip){x.translate(W,0);x.scale(-1,1);}
  const nat=(name.startsWith('pr_shed')||name.startsWith('pr_barrels')||name.startsWith('pr_tires'))?'R':'L';
  const px=nat==='L'?0:W-w;x.drawImage(im,px,y-h/2,w,h);x.restore();}
function zoneSign(x,cx,cy,k,txt,col){const im=uim('pr_sign');const w=272*k*1.05,h=195*k*1.05;if(im.complete&&im.naturalWidth)x.drawImage(im,cx-w/2,cy-h/2,w,h);
  const words=txt.toUpperCase().split(' ');let l1=txt.toUpperCase(),l2='';if(words.length>1){const m=Math.ceil(words.length/2);l1=words.slice(0,m).join(' ');l2=words.slice(m).join(' ')+' →';}else l1+=' →';
  x.save();x.translate(cx-w*.02,cy-h*.18);x.rotate(-.025);x.textAlign='center';x.textBaseline='middle';let fs=Math.min(19,w*.85/Math.max(5,Math.max(l1.length,l2.length))*1.7);x.font='900 '+fs+'px system-ui';
  x.shadowColor=col;x.shadowBlur=10;x.fillStyle='#ffe9a8';x.strokeStyle='#4a2200';x.lineWidth=3;
  [[l1,l2?-fs*.58:0],[l2,fs*.62]].forEach(([t,dy])=>{if(!t)return;x.strokeText(t,0,dy);x.fillText(t,0,dy);});x.restore();}
function drawPath(c){const C=CHAP[c],cv2=$('cpPathCv'),w=cv2.clientWidth||Math.min(520,innerWidth),h=PH,d=Math.min(2,window.devicePixelRatio||1);cv2.width=w*d;cv2.height=h*d;const x=cv2.getContext('2d');x.scale(d,d);
  const k=w/839,R=seeded(11+c*31);
  // ground (tile cut from the picture)
  const gi=uim('ground');if(gi.complete&&gi.naturalWidth){x.save();const pat=x.createPattern(gi,'repeat');const ts=.62;x.scale(ts,ts);x.fillStyle=pat;x.fillRect(0,0,w/ts,h/ts);x.restore();}else{x.fillStyle='#5b3f2c';x.fillRect(0,0,w,h);}
  // big soft light/dark patches, tyre tracks
  for(let i=0;i<26;i++){const px=R()*w,py=R()*h,r=60+R()*120,gr=x.createRadialGradient(px,py,0,px,py,r);const dk=R()<.6;gr.addColorStop(0,dk?'rgba(20,10,4,.28)':'rgba(255,200,150,.10)');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(px-r,py-r,r*2,r*2);}
  x.strokeStyle='rgba(25,14,8,.30)';x.lineWidth=7;x.setLineDash([3,4]);for(let i=0;i<9;i++){const sx=R()*w,sy=R()*h,a=R()*Math.PI;x.beginPath();x.ellipse(sx,sy,90+R()*80,40+R()*40,a,0,Math.PI*(.6+R()*.6));x.stroke();x.beginPath();x.ellipse(sx+9,sy+5,90+R()*80,40+R()*40,a,0,Math.PI*.8);x.stroke();}x.setLineDash([]);
  // road (metal edge + dark asphalt + glowing yellow dashes)
  const pts=[];for(let j=0;j<SPC;j++)pts.push([NODEX(j)/100*w,NODEY(j)]);
  const road=()=>{x.beginPath();pts.forEach(([px,py],j)=>j?x.lineTo(px,py):x.moveTo(px,py));};
  x.lineJoin='round';x.lineCap='round';
  road();x.strokeStyle='rgba(0,0,0,.45)';x.lineWidth=34;x.save();x.translate(3,6);x.stroke();x.restore();
  road();x.strokeStyle='#7c838c';x.lineWidth=30;x.stroke();road();x.strokeStyle='#2b2f35';x.lineWidth=26;x.stroke();road();x.strokeStyle='#17191c';x.lineWidth=20;x.stroke();
  road();x.setLineDash([9,9]);x.strokeStyle='#ffb300';x.shadowColor='#ff8f00';x.shadowBlur=8;x.lineWidth=3;x.stroke();x.setLineDash([]);x.shadowBlur=0;
  // small scattered things
  for(let i=0;i<16;i++){const px=R()*w,py=60+R()*(h-120);let near=false;for(const [nx,ny] of pts)if(Math.hypot(nx-px,ny-py)<70)near=true;if(near)continue;
    const n=R()<.5?'pr_puddle':R()<.6?'pr_tire1':'pr_barrels2',im=uim(n);if(!im.complete||!im.naturalWidth)continue;const sc=k*(n==='pr_barrels2'?.7:.9),iw=im.naturalWidth*sc,ih=im.naturalHeight*sc;x.drawImage(im,px-iw/2,py-ih/2,iw,ih);}
  // props: on the side opposite each stage pad
  let li=Math.floor(R()*9),ri=Math.floor(R()*9);
  for(let j=SPC-1;j>=0;j--){const left=NODEX(j)<50,py=NODEY(j)+(R()-.5)*30;if(j%5===0)continue;
    if(left){const useR=R()<.62;if(useR)propDraw(x,PROPS_R[(ri++)%PROPS_R.length],'R',py,k,false);else propDraw(x,PROPS_L[(li++)%PROPS_L.length],'L',py,k,true);}
    else{const useL=R()<.62;if(useL)propDraw(x,PROPS_L[(li++)%PROPS_L.length],'L',py,k,false);else propDraw(x,PROPS_R[(ri++)%PROPS_R.length],'R',py,k,true);}}
  // zone colours (each world / act gets its own colour over the same junkyard look)
  for(let z=0;z<4;z++){const P=BIO[C.bios[z]],y1=z===0?h:NODEY(z*5)+53,y0=z===3?0:NODEY(z*5+5)+53;
    x.save();x.beginPath();x.rect(0,y0,w,y1-y0);x.clip();
    const base=C.bios[z]===0;if(!base){x.globalCompositeOperation='color';x.globalAlpha=.42;x.fillStyle=P.ga;x.fillRect(0,y0,w,y1-y0);}
    if(P.night){x.globalCompositeOperation='multiply';x.globalAlpha=.55;x.fillStyle='#4a5a8a';x.fillRect(0,y0,w,y1-y0);}
    x.globalCompositeOperation='source-over';x.globalAlpha=1;const R2=seeded(3+z*17+c*7);
    if(P.snow){x.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<70;i++)ell(x,R2()*w,y0+R2()*(y1-y0),4+R2()*16,2+R2()*5);}
    if(P.acid){for(let i=0;i<10;i++){const px=R2()*w,py=y0+R2()*(y1-y0),gr=x.createRadialGradient(px,py,0,px,py,26);gr.addColorStop(0,'rgba(170,255,40,.55)');gr.addColorStop(1,'rgba(118,255,3,0)');x.fillStyle=gr;ell(x,px,py,30,12);}}
    if(P.neon){for(let i=0;i<14;i++){x.shadowColor=x.fillStyle=['#ff4fd8','#00e5ff','#ffea00'][i%3];x.shadowBlur=10;x.fillRect(R2()*w,y0+R2()*(y1-y0),16+R2()*26,3);}x.shadowBlur=0;}
    if(P.lava){for(let i=0;i<8;i++){const px=R2()*w,py=y0+R2()*(y1-y0);let near=false;for(const [nx,ny] of pts)if(Math.hypot(nx-px,ny-py)<60)near=true;if(near)continue;const rx=16+R2()*22,ry=rx*.42;
      x.fillStyle='#1a0a05';ell(x,px,py,rx+5,ry+4);const gr=x.createRadialGradient(px,py,0,px,py,rx);gr.addColorStop(0,'#fff176');gr.addColorStop(.35,'#ff9100');gr.addColorStop(1,'#bf360c');x.fillStyle=gr;x.shadowColor='#ff3d00';x.shadowBlur=14;ell(x,px,py,rx,ry);x.shadowBlur=0;}}
    if(P.ash||P.smog){x.fillStyle='rgba(200,200,200,.10)';for(let i=0;i<6;i++)ell(x,R2()*w,y0+R2()*(y1-y0),70,26);}
    x.restore();
    // zone sign (like "RUSTY JUNKYARD →" in the picture)
    const j0=z*5,left=NODEX(j0)<50;zoneSign(x,left?w*.75:w*.25,NODEY(j0)+(j0===0?60:6),k,C.zones[z],C.col);}
  // vignette at the sides
  const vg=x.createLinearGradient(0,0,w,0);vg.addColorStop(0,'rgba(0,0,0,.35)');vg.addColorStop(.12,'rgba(0,0,0,0)');vg.addColorStop(.88,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.35)');x.fillStyle=vg;x.fillRect(0,0,w,h);}
function showMap(){const T=TE(),G=T.G;GR();try{teamHeroes().forEach(h=>{const d=sprOf(h);if(d)sprLoad(d);});}catch(e){} // v16-27: get the team's animations ready before the fight (only those, not all)
$('cpTk').innerHTML=TKI+' '+G.h.tk;const c=curCh(),C=CHAP[c];
  const PX=CPX();
  $('cpT1').innerHTML=IMGI(glyphURL('swords','#ffcc80'),'1em','-.12em')+(HM?' HARD':' CAMPAIGN');$('cpT2').textContent='CHAPTER '+(c+1)+' OF '+NCH;
  const done=Math.max(0,Math.min(SPC,PX.best-c*SPC));let stc=0;for(let j=0;j<SPC;j++)stc+=PX.stars[c*SPC+j]||0;
  $('cpChN').innerHTML=`<b style="color:${HM?'#ff5252':C.col}">${HM?'HARD · ':''}${C.n}</b><small>${done}/${SPC} stages · ${stc}/${SPC*3} ⭐</small>`;
  hmBtn();root.classList.toggle('hm',!!HM);
  $('cpPrev').classList.toggle('off',c===0);$('cpNext').classList.toggle('off',c>=NCH-1||!chOpen(c+1));$('cpNext').innerHTML=c<NCH-1&&!chOpen(c+1)?IMGI(glyphURL('lock','#ffd54a'),'.8em','-.05em'):'›';
  const P=$('cpPath');P.querySelectorAll('.node').forEach(n=>n.remove());drawPath(c);
  for(let j=0;j<SPC;j++){const i=c*SPC+j,s=STAGES[i];const d=document.createElement('div');const lock=i>PX.best,cur=i===PX.best;d.className='node'+(s.boss?' boss':s.mini?' mini':'')+(lock?' lock':'')+(cur?' cur':'');
    d.style.left=NODEX(j)+'%';d.style.top=NODEY(j)+'px';
    d.innerHTML=`<img class="pad" src="img/ui/${cur?'node_gold':'node_gray'}.webp">`+(s.boss?`<img class="ic" src="${glyphURL('skull','#ffe0d0')}">`:s.mini?`<img class="ic" src="${glyphURL('horns','#ffe0b2')}">`:`<b class="no">${j+1}</b>`)+`<span class="nm">${s.n}</span>`+(PX.stars[i]?`<span class="st">${[0,1,2].map(q=>`<em class="${q<PX.stars[i]?'on':''}">★</em>`).join('')}</span>`:'');
    d.onclick=()=>{if(lock){T.toast('🔒 Clear stage '+sLabel(i-1)+' first',2000);return;}openCard(i);};P.appendChild(d);}
  requestAnimationFrame(()=>{const m=$('cpMap'),j=Math.max(0,Math.min(SPC-1,PX.best-c*SPC));m.scrollTop=Math.max(0,NODEY(j)-m.clientHeight*.55+60);});}
// v14: 50 chapters – tap the chapter name for the full list
// v16-74: NORMAL / HARD switch on the campaign map (HARD opens after normal chapter 1)
function hmBtn(){let b=$('cpHM');if(!b){b=document.createElement('button');b.id='cpHM';$('cpTop').appendChild(b);
    b.onclick=()=>{const T=TE(),G=T.G;if(!hardOK()){T.toast('🔒 HARD MODE opens after NORMAL chapter 1 (stage 1-20)',2600);return;}
      HM=HM?0:1;G.cp.hm=HM;T.save();showMap();if(HM&&!G.cp.hmSeen){G.cp.hmSeen=1;T.save();popW('HARD MODE','<div style="padding:4px 2px;line-height:1.45">The same chapters with <b style="color:#ff5252">much stronger monsters</b> – and <b style="color:#7CFC9A">×'+HARD_RW+' rewards</b> (money, tickets, diamonds).<br><br>HARD chapter N opens when you clear NORMAL chapter N.</div>');}};}
  b.className=HM?'on':'';const ok=hardOK(),I=(f,c)=>'<img src="img/shop/'+f+'.webp" alt=""'+(c?' class="'+c+'"':'')+'>'; // v16-80: Marius' NORMAL / HARD tabs
  b.innerHTML=I(HM?'hm_n0':'hm_n1')+(!ok?I('hm_h0'):I('hm_h1',HM?'':'off'));}
function chList(){const T=TE(),G=T.G,cur=curCh();let h=`<div class="pT">${IMGI(glyphURL('swords','#ffcc80'),'1em','-.12em')} ALL CHAPTERS</div><div class="pD">10 acts × 5 worlds · ${NCH} chapters · ${NST} stages</div><div class="chL">`;
  const PX=CPX();for(let c=0;c<NCH;c++){const C=CHAP[c],op=chOpen(c),done=Math.max(0,Math.min(SPC,PX.best-c*SPC));let st=0;for(let j=0;j<SPC;j++)st+=PX.stars[c*SPC+j]||0;
    if(c%5===0)h+=`<div class="chAct">ACT ${c/5+1}${c?' · '+ACTS[c/5].n.toUpperCase():' · ORIGINS'}</div>`;
    h+=`<div class="chI${op?'':' lk'}${c===cur?' on':''}" data-ch="${c}" style="border-color:${C.col}"><b style="color:${C.col}">${c+1}</b><span>${C.n}<small>${op?done+'/'+SPC+' · '+st+'⭐':HM&&G.cp.best<(c+1)*SPC?'🔒 clear NORMAL chapter '+(c+1):'🔒 beat '+MON[CHAP[Math.max(0,c-1)].boss].n}</small></span></div>`;}
  pop(h+'</div><button class="cpGo alt" data-p="x">CLOSE</button>');
  requestAnimationFrame(()=>{const e=document.querySelector('.chI.on');if(e)e.scrollIntoView({block:'center'});});}
function chGo(dl){const T=TE(),G=T.G,c=curCh()+dl;if(c<0||c>=NCH)return;if(!chOpen(c)){T.toast(HM&&G.cp.best<(c+1)*SPC?'🔒 Clear NORMAL chapter '+(c+1)+' first':'🔒 Beat '+MON[CHAP[c-1].boss].n+' (stage '+(HM?'H ':'')+c+'-20) to open Chapter '+(c+1),2600);return;}CPX().ch=c;showMap();$('cpMap').scrollTop=PH;}
function monPreview(t){const c=document.createElement('canvas');c.width=136;c.height=116;const x=c.getContext('2d');const M=MON[t];const sc=Math.min(1.5,50/(M.b==='titan'?255:(M.h*M.sc+(M.fly?48:4))));
  x.setTransform(2,0,0,2,0,0);const u={t,b:M.b,sx:M.b==='titan'?36:34,sy:55,sc,face:-1,st:'idle',ap:0,wph:0,k:1,roll:0,d:.5,H:M.h,mark:0,slow:0,stun:0,flash:0,dead:false,enr:false};
  if(M.sp){const d=MSPR[M.sp],k=M.h/d.ih;u.sc=Math.min(50/(d.ay*k),64/(d.w*k));u.sx=34;u.sy=57;
    if(!msprOK(M.sp)){msprLoad(M.sp).im.addEventListener('load',()=>{x.clearRect(0,0,68,58);GA=1;drawMonster(x,u,1.3);},{once:true});}}
  GA=1;drawMonster(x,u,1.3);return c;}
function openCard(i){const T=TE(),G=T.G,PX=CPX(),s=STAGES[i],C=CHAP[s.c],first=i>=PX.best,R=REWARDX(i);const types=[...new Set(s.w.flat())];
  const tp=teamPower(curTeamList()),ep=enemyPower(i);
  const col=tp>=ep*1.15?'#66bb6a':tp>=ep*.85?'#ffb300':'#ff5252';const big=s.boss||s.mini;
  // v16-49: stage card = Marius' battle-prep picture (img/ui3/prep.webp): title plate, 3 enemy windows, VS power bar, 4 reward boxes, 5 team boxes, BACK + FIGHT
  const rws=[[IMGI(badge('coin','#ffb300'),'1.5em'),T.fmt(first?R.money:Math.round(R.money*.25/10)*10)]];
  if(first){rws.push([TKI.replace('1.15em','1.6em')+(R.ct?'<img src="img/cticket.webp" style="height:1.2em;margin-left:-.5em;vertical-align:-.1em">':''),'+'+R.tk+(R.ct?' / +'+R.ct:'')]);rws.push([T.DMI.replace(/height:[^;"]+/,'height:1.5em'),'+'+R.dm]);}
  rws.push([IMGI(glyphURL('bag','#ffd54a'),'1.5em'),first?(s.boss?'2 ★':big?'1 ★':'×1'):(big?'×1':'40%')]);
  const tm=curTeamList();
  $('cpCardBox').classList.add('prepSk');
  $('cpCardBox').innerHTML=`<div class="ppT"><b>${s.boss?IMGI(glyphURL('skull','#ff8a80'))+' ':s.mini?IMGI(glyphURL('horns','#ffb74d'))+' ':''}${sLabel(i)} · ${s.n}</b><small>CH ${s.c+1} · ${C.zones[Math.floor(s.j/5)].toUpperCase()} · ${s.w.length} WAVES${HM?' · HARD ×'+HARD_RW+' REWARDS':''}${PX.stars[i]?' · '+'⭐'.repeat(PX.stars[i]):''}</small></div>
   <div class="mons" id="cpMons"></div>
   <div class="ppE"><small>ENEMY</small>${ep.toLocaleString()}</div><div class="ppP" style="color:${col}"><small>YOUR TEAM</small>${tp.toLocaleString()}</div>
   ${(()=>{const st=PX.stuck;if(i!==PX.best||!st||st.si!==i)return '';const gk=Math.min(GRIT_N,Math.floor((Date.now()-st.t)/216e5)),nx=gk<GRIT_N?Math.ceil((216e5-(Date.now()-st.t)%216e5)/36e5):0;return `<div class="grit">🔥 NEVER GIVE UP: <b>+${Math.round(gritK(gk)*100)}%</b> HP &amp; attack${gk<GRIT_N?` · next +${gritStep(gk)*100}% in ~${nx}h`:' (max)'}</div>`;})()}
   <div class="ppRT">${first?'FIRST CLEAR':'REPLAY'}</div>${rws.slice(0,4).map((r,k)=>`<div class="ppR ppR${k}"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')}
   <div class="ppG">${(()=>{const d=gdrop(s.c).slice(),a=s.c>=ASC_CH?Math.round(d[5]*.15*Math.min(1,(s.c-ASC_CH+1)/21)*10)/10:0;d[5]=Math.round((d[5]-a)*10)/10;d.push(a);return ['COM','UNC','RAR','EPI','LEG','MYT','ASC'].map((n,k)=>d[k]?`<span style="color:${GG(k).c}">${n} ${d[k]}%</span>`:'').filter(Boolean).join(' ');})()}</div>
   ${[0,1,2,3,4].map(k=>{const h=tm[k];return `<div class="ppS ppS${k}" data-a="team">${h?`<img src="${portraitURL(h)}" style="box-shadow:0 0 0 2px ${gcol(h)}">`:'<i>+</i>'}</div>`;}).join('')}
   <button class="ppEd" data-a="team">✎ EDIT TEAM</button><button class="ppB" data-a="close" aria-label="Back"></button><button class="ppF" data-a="fight">FIGHT!</button>`;
  const mc=$('cpMons');types.slice(0,3).forEach(t=>{const d=document.createElement('div');d.className='mon'+(MON[t].boss?' bossm':'');d.appendChild(monPreview(t));const l=document.createElement('div');l.textContent=MON[t].n;d.appendChild(l);mc.appendChild(d);});
  $('cpCard').classList.add('open');$('cpCardBox').onclick=e=>{const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;if(a==='close')$('cpCard').classList.remove('open');if(a==='heroes'){openGear(null,i);}if(a==='team'){$('cpCard').classList.remove('open');openTeam(i);}if(a==='fight'){const T=TE();if(!T.G.cp.team||!T.G.cp.team.length){T.G.cp.team=curTeamList().map(h=>h.id);T.save();}$('cpCard').classList.remove('open');safeStart(i,teamHeroes());}};}

// ---------------------------------------------------------------- shared popup + before/after helpers
// v16-53: info window (Marius' frame, CSS .winSk in index.html)
function popHost(){const P=$('cpPop'),sm=document.getElementById('sm'),out=!!(sm&&sm.classList.contains('open'));if(out&&P.parentNode!==document.body){document.body.appendChild(P);P.classList.add('out');}else if(!out&&P.parentNode!==root){root.appendChild(P);P.classList.remove('out');}} // v16-91: gear summon windows over the SUMMON page
function popW(title,html){popHost();const b=$('cpPopBox');b.className='cpBox winSk';b.innerHTML='<div class="wT">'+title+'</div><button class="wX" data-p="x" aria-label="close"></button><div class="wIn">'+html+'</div>';$('cpPop').classList.add('open');b.querySelector('.wIn').scrollTop=0;}
const wRowB=(g,a,v,e)=>'<div class="wR'+(g>=0?' g'+g:'')+'"><span>'+a+'</span>'+(v!=null?'<b class="wV">'+v+'</b>':'')+(e?'<em>'+e+'</em>':'')+'</div>';
function pop(html){popHost();$('cpPopBox').className='cpBox';$('cpPopBox').innerHTML='<button class="stX" data-p="x" aria-label="close">✕</button>'+html;$('cpPop').classList.add('open');$('cpPopBox').scrollTop=0;}
function closePop(){$('cpPop').classList.remove('open');}
const heroOf=id=>!id?null:id.startsWith('crew')?crewHero(+id.slice(4)):TE().HB[id];
const gcol=h=>h.crew?'#8d6e63':TE().GRADES[h.gr].c;
function heroLine(h,right){return `<div class="hl"><img class="mp" src="${portraitURL(h)}" style="border-color:${gcol(h)}"><span><b style="color:${gcol(h)}">${h.n}</b> ${h.crew?'':'<small>+'+stars(h)+'</small>'}<br><small>${IMGI(roleBadge(roleOf(h)),'1.25em')} ${ROLE[roleOf(h)].n}</small></span><em>${right||''}</em></div>`;}
function miniCard(h,lab){if(!h)return `<div class="mc"><div class="mcI empty">—</div><b>empty</b><small>${lab}</small></div>`;
  return `<div class="mc"><div class="mcI" style="border-color:${gcol(h)}"><img src="${portraitURL(h)}"><img class="rb" src="${roleBadge(roleOf(h))}"></div><b style="color:${gcol(h)}">${h.n}</b><small>${lab}</small></div>`;}
const STROWS=[['heart','HP',s=>s.hp,v=>Math.round(v).toLocaleString()],['atk','Attack',s=>s.atk,v=>Math.round(v).toLocaleString()],['shield','Defense',s=>s.def,v=>Math.round(v)],
 ['crit','Crit chance',s=>s.crit*100,v=>v.toFixed(1)+'%'],['aspd','Attack speed',s=>1/s.as,v=>v.toFixed(2)+'/s'],['energy','Skill charge',s=>(s.eg-1)*100,v=>'+'+Math.round(v)+'%']];
function dTxt(a,b,fmt){const d=b-a;if(Math.abs(d)<1e-6)return '<b>=</b>';const pc=a>0.0001?' ('+(d>0?'+':'')+Math.round(d/a*100)+'%)':'';return `<b class="${d>0?'up':'dn'}">${d>0?'▲':'▼'} ${fmt(Math.abs(d))}${pc}</b>`;}
// stat table + advantages / disadvantages
function cmpBlock(sa,sb,pa,pb,extraPros,extraCons,hideZero){const pros=[...(extraPros||[])],cons=[...(extraCons||[])];
  let t='<div class="ct"><div class="ch"><span>Stat</span><b>Before</b><b>After</b><b>Change</b></div>';
  STROWS.forEach(([ic,n,f,fmt])=>{const a=sa?f(sa):0,b=sb?f(sb):0;if(hideZero&&!a&&!b)return;t+=`<div><span>${IMGI(glyphURL(ic,'#ffcc80'),'1.1em','-.22em')} ${n}</span><b>${sa?fmt(a):'—'}</b><b>${sb?fmt(b):'—'}</b>${dTxt(a,b,fmt)}</div>`;
    const d=b-a;if(Math.abs(d)>1e-6&&sa&&sb){const pc=a>0.0001?' ('+(d>0?'+':'')+Math.round(d/a*100)+'%)':'';(d>0?pros:cons).push(`${n} ${d>0?'+':'−'}${fmt(Math.abs(d))}${pc}`);}});
  t+=`<div class="pw"><span>${IMGI(glyphURL('swords','#ffd54a'),'1.1em','-.22em')} Power</span><b>${pa.toLocaleString()}</b><b>${pb.toLocaleString()}</b>${dTxt(pa,pb,v=>Math.round(v).toLocaleString())}</div></div>`;
  t+=`<div class="pc"><div class="pro"><h4>✅ ADVANTAGES</h4>${pros.length?pros.map(x=>'<p>'+x+'</p>').join(''):'<p class="no">none</p>'}</div><div class="con"><h4>❌ DISADVANTAGES</h4>${cons.length?cons.map(x=>'<p>'+x+'</p>').join(''):'<p class="no">none</p>'}</div></div>`;
  return t;}

// ---------------------------------------------------------------- team select (with before / after before every change)
let tsel=[],tsi=0,TCX=null; // v16-99: TCX = team screen opened from Tower / Class Towers / Dungeons / World Boss {t,ep,pool,get,set,best,go,back}
const tPool=()=>TCX?TCX.pool():[...myMechs(),...[0,1,2,3,4].map(crewHero)],tEP=()=>TCX?TCX.ep():enemyPower(tsi),tBest=()=>TCX?TCX.best():bestTeam();
function tSave(){const T=TE();if(TCX)TCX.set(tsel.slice());else T.G.cp.team=tsel.slice();T.save();}
const isTank=r=>r==='engine'||r==='all';
function curTeamList(){const T=TE(),G=T.G;const ids=(G.cp.team&&G.cp.team.length?G.cp.team:bestTeam()).filter(id=>id.startsWith('crew')||(T.HB[id]&&G.h.own[id])).slice(0,5);return ids.map(heroOf);}
function teamDiff(Lb,La){const cb=Lb.map(h=>roleOf(h)),ca=La.map(h=>roleOf(h)),pros=[],cons=[];
  const med=l=>l.filter(r=>r==='service').length,tank=l=>l.filter(isTank).length,rng=l=>l.filter(r=>ROLE[r].rng>=80).length;
  if(med(cb)&&!med(ca))cons.push('No Medic left – nobody heals the team');if(!med(cb)&&med(ca))pros.push('Team gets a Medic – heals everybody');
  if(tank(cb)&&!tank(ca))cons.push('No tank (Bruiser / Legend) – monsters hit your weak mechanics');if(!tank(cb)&&tank(ca))pros.push('Team gets a tank in front');
  if(rng(ca)>rng(cb)&&rng(ca)>=4)cons.push('Many ranged mechanics, few in front');
  return {pros,cons};}
function popTeamCmp(k,newId){const T=TE(),si=tsi,ep=tEP();const Lb=tsel.map(heroOf);const La=Lb.slice();const oldH=Lb[k]||null,newH=heroOf(newId);
  if(newH){const j=tsel.indexOf(newId);if(j>=0&&j!==k){T.toast('Already in the team',1600);return;}La[k]=newH;}else La.splice(k,1);
  const tpb=teamPower(Lb),tpa=teamPower(La);const tag=p=>p>=ep*1.15?'<span style="color:#66bb6a">EASY</span>':p>=ep*.85?'<span style="color:#ffb300">EVEN</span>':'<span style="color:#ff5252">HARD</span>';
  const td=teamDiff(Lb,La);const ro=oldH&&roleOf(oldH),rn=newH&&roleOf(newH);
  const xp=[...td.pros],xc=[...td.cons];
  if(oldH&&newH&&skOf(oldH).sk!==skOf(newH).sk){xp.push(`New skill: <b>${skOf(newH).sk}</b> – ${skOf(newH).skd}`);xc.push(`Loses skill: <b>${skOf(oldH).sk}</b>`);}
  if(newH)pasOf(newH).forEach(p=>{if(!oldH||!pasOf(oldH).some(q=>q.n===p.n&&q.d===p.d))xp.push(`Passive: <b>${p.ic} ${p.n}</b> – ${p.d}`);});
  if(oldH)pasOf(oldH).forEach(p=>{if(!newH||!pasOf(newH).some(q=>q.n===p.n))xc.push(`Loses passive: <b>${p.ic} ${p.n}</b>`);});
  if(oldH&&newH&&(ROLE[ro].rng>=80)!==(ROLE[rn].rng>=80))(ROLE[rn].rng>=80?xp:xc).push(ROLE[rn].rng>=80?'Attacks from far away (safer)':'Fights up close (takes more hits)');
  if(!newH)xc.push('Team has only '+La.length+' mechanics');
  if(oldH&&!oldH.crew&&heroGear(oldH.id).length)xc.push(`${oldH.n}'s gear stays with ${oldH.n}`);
  let x=`<div class="pT">Before / After</div><div class="pD">${newH?(oldH?'Replace in the battle team':'Add to the battle team'):'Remove from the battle team'} · ${TCX?TCX.t:'stage '+sLabel(si)}</div>
   <div class="cmp">${miniCard(oldH,'BEFORE')}<div class="cmA">➜</div>${miniCard(newH,'AFTER')}</div>`;
  x+=`<div class="ct tx"><div class="ch"><span></span><b>Before</b><b>After</b></div><div><span>Role</span><b>${oldH?IMGI(roleBadge(ro),'1.1em','-.22em')+' '+ROLE[ro].n:'—'}</b><b>${newH?IMGI(roleBadge(rn),'1.1em','-.22em')+' '+ROLE[rn].n:'—'}</b></div>
   <div><span>Skill</span><b>${oldH?skOf(oldH).sk:'—'}</b><b>${newH?skOf(newH).sk:'—'}</b></div><div><span>Range</span><b>${oldH?(ROLE[ro].rng>=80?'Ranged':'Melee'):'—'}</b><b>${newH?(ROLE[rn].rng>=80?'Ranged':'Melee'):'—'}</b></div></div>`;
  x+=cmpBlock(oldH&&unitStats(oldH),newH&&unitStats(newH),oldH?pow(oldH):0,newH?pow(newH):0,xp,xc);
  x+=`<div class="tpw">TEAM POWER <b>${tpb.toLocaleString()}</b> ${tag(tpb)} ➜ <b>${tpa.toLocaleString()}</b> ${tag(tpa)} <small>vs ${ep.toLocaleString()}</small></div>`;
  x+=`<button class="cpGo" data-p="tok" data-k="${k}" data-id="${newId||''}">✓ CONFIRM</button><button class="cpGo alt" data-p="x">CANCEL</button>`;
  pop(x);}
function popReplace(k){const h=heroOf(tsel[k]),pool=tPool().filter(c=>!tsel.includes(c.id));const p0=pow(h);
  pool.sort((a,b)=>pow(b)-pow(a));
  pop(`<div class="pT">Change ${h.n}?</div><div class="pD">Tap a mechanic to see the advantages and disadvantages before you change.</div>${heroLine(h,'<small>now</small>')}
   ${tsel.length>1?'<div class="pR" data-p="tcmp" data-k="'+k+'" data-id=""><span>✖ Remove from the team</span></div>':''}
   ${pool.map(c=>{const d=pow(c)-p0;return '<div class="pR" data-p="tcmp" data-k="'+k+'" data-id="'+c.id+'">'+heroLine(c,'<b class="'+(d>=0?'up':'dn')+'">'+(d>=0?'▲ +':'▼ −')+Math.abs(d).toLocaleString()+'</b><br><small>power</small>')+'</div>';}).join('')}
   <button class="cpGo alt" data-p="x">CLOSE</button>`);}
function popWhoLeaves(id){const h=heroOf(id),p=pow(h);
  pop(`<div class="pT">Team is full</div><div class="pD">Who should ${h.n} replace? Tap to see before / after.</div>${heroLine(h,'<small>comes in</small>')}
   ${tsel.map((tid,k)=>{const o=heroOf(tid),d=p-pow(o);return '<div class="pR" data-p="tcmp" data-k="'+k+'" data-id="'+id+'">'+heroLine(o,'<b class="'+(d>=0?'up':'dn')+'">'+(d>=0?'▲ +':'▼ −')+Math.abs(d).toLocaleString()+'</b><br><small>if replaced</small>')+'</div>';}).join('')}
   <button class="cpGo alt" data-p="x">CLOSE</button>`);}
function popAutoBest(){const T=TE(),nb=tBest(),Lb=tsel.map(heroOf),La=nb.map(heroOf),ep=tEP();
  const out=Lb.filter(h=>!nb.includes(h.id)),inn=La.filter(h=>!tsel.includes(h.id));
  if(!out.length&&!inn.length){T.toast('⚡ This is already your best team',1800);return;}
  const tpb=teamPower(Lb),tpa=teamPower(La),td=teamDiff(Lb,La);
  pop(`<div class="pT">Auto best – before / after</div><div class="pD">The strongest mechanics by power.</div>
   <div class="cpSec">LEAVE THE TEAM</div>${out.length?out.map(h=>heroLine(h,'<b class="dn">−'+pow(h).toLocaleString()+'</b>')).join(''):'<div class="pD">nobody</div>'}
   <div class="cpSec">JOIN THE TEAM</div>${inn.length?inn.map(h=>heroLine(h,'<b class="up">+'+pow(h).toLocaleString()+'</b>')).join(''):'<div class="pD">nobody</div>'}
   <div class="pc"><div class="pro"><h4>✅ ADVANTAGES</h4>${tpa>tpb?'<p>Team power +'+(tpa-tpb).toLocaleString()+'</p>':''}${td.pros.map(x=>'<p>'+x+'</p>').join('')||(tpa>tpb?'':'<p class="no">none</p>')}</div><div class="con"><h4>❌ DISADVANTAGES</h4>${tpa<tpb?'<p>Team power −'+(tpb-tpa).toLocaleString()+'</p>':''}${td.cons.map(x=>'<p>'+x+'</p>').join('')||(tpa<tpb?'':'<p class="no">none</p>')}</div></div>
   <div class="tpw">TEAM POWER <b>${tpb.toLocaleString()}</b> ➜ <b>${tpa.toLocaleString()}</b> <small>vs ${ep.toLocaleString()}</small></div>
   <button class="cpGo" data-p="bok">✓ CONFIRM</button><button class="cpGo alt" data-p="x">CANCEL</button>`);}
function openTeam(si,cx){const T=TE(),G=T.G;tsi=si;TCX=cx||null;cleanGear();tsel=TCX?TCX.get():curTeamList().map(h=>h.id);
  const render=()=>{const pool=tPool();const list=tsel.map(heroOf);
    const card=(h,cls,extra,k)=>`<div class="${cls}" style="border-color:${gcol(h)}" ${k!=null?'data-slot="'+k+'"':'data-id="'+h.id+'"'}><img src="${portraitURL(h)}"><span class="r" style="color:${gcol(h)}">${h.crew?'CREW':'+'+stars(h)+' <small style="color:#e2c6ff">Lv'+TE().lvOf(h.id)+'</small>'}</span><img class="rl" src="${roleBadge(roleOf(h))}">${extra||''}<span class="n">${h.n}</span></div>`;
    let sl='';for(let k=0;k<5;k++){const h=list[k];sl+=h?card(h,'slot f','',k):'<div class="slot">+</div>';}
    const ep=tEP(),tp=teamPower(list),col=tp>=ep*1.15?'#66bb6a':tp>=ep*.85?'#ffb300':'#ff5252';
    $('cpTeamBox').innerHTML=`<button class="stX" data-a="back" aria-label="close">✕</button><h2>${TCX&&TCX.done?'EDIT BATTLE TEAM':'CHOOSE YOUR TEAM'}</h2><div class="sub">${TCX?TCX.t:'STAGE '+sLabel(si)} · max 5 · ${TCX&&TCX.done?'tap a mechanic below to add him · tap a team slot to change him':'tap a hero in the team to change him'}</div><div class="cpSec">TEAM</div><div class="slots">${sl}</div>
     <div id="cpPow">${IMGI(glyphURL('swords','#ffd54a'),'1em','-.12em')} ${tp.toLocaleString()} <span style="color:#9a8">vs</span> <span style="color:#ff8a80">${ep.toLocaleString()}</span> <span style="color:${col}">${tp>=ep*1.15?'· EASY':tp>=ep*.85?'· EVEN':'· HARD'}</span></div>
     <div class="cpSec" style="display:flex;justify-content:space-between;align-items:center;gap:6px">YOUR MECHANICS <span style="display:flex;gap:6px">${TCX?'':`<button class="cpB sm" data-a="gear">`}${TCX?'':`${IMGI(glyphURL('bag','#ffd54a'))} GEAR</button>`}<button class="cpB sm" data-a="best">${IMGI(glyphURL('bolt','#ffd54a'))} AUTO BEST</button></span></div>
     <div class="pool">${pool.map(h=>card(h,'pick'+(tsel.includes(h.id)?' on':''))).join('')}</div>
     <div class="roles">${Object.entries(ROLE).filter(([k])=>k!=='crew'&&(!TCX||!TCX.cls||k===TCX.cls||k==='all')).map(([k,r])=>'<div>'+IMGI(roleBadge(k),'1.5em','-.4em')+' <span>'+r.n+'</span> <b>'+r.sk+'</b></div>').join('')}</div>
     <div class="cpRow tmRow">${TCX&&TCX.done?'':'<button class="cpGo alt" data-a="back">BACK</button>'}<button class="cpGo${TCX&&TCX.done?' tm':''}" data-a="go">${TCX&&TCX.done?'✓ DONE':IMGI(glyphURL('swords','#2a1000'),'1em','-.12em')+' FIGHT!'}</button></div>`;};
  render();openTeam.render=render;$('cpTeam').classList.add('open');
  $('cpTeamBox').onclick=e=>{const el=e.target.closest('[data-id],[data-a],[data-slot]');if(!el)return;const a=el.dataset.a,id=el.dataset.id,sk=el.dataset.slot;
    if(a==='back'){$('cpTeam').classList.remove('open');const c=TCX;TCX=null;if(c&&c.back)c.back();return;}
    if(a==='best'){popAutoBest();return;}
    if(a==='gear'){openGear(tsel.find(i=>!i.startsWith('crew')));return;}
    if(a==='go'){if(!tsel.length){T.toast('Pick at least 1 hero',2000);return;}tSave();$('cpTeam').classList.remove('open');if(TCX){const c=TCX;TCX=null;c.go(tsel.map(heroOf));return;}safeStart(si,teamHeroes());return;}
    if(sk!=null){popReplace(+sk);return;}
    if(id){const k=tsel.indexOf(id);if(k>=0)popReplace(k);else if(tsel.length<5){tsel.push(id);tSave();render();}else popWhoLeaves(id);}};}

// v16-101 (Marius: "team modification must be easier"): EDIT TEAM from the HEROES page = the team screen (tap to add,
// tap a slot to change – still with before / after), opened above the HEROES page, DONE goes back to it.
function heroTeamEdit(){const T=TE(),G=T.G,si=Math.max(0,Math.min(NST-1,tsi==null?CPX().best:tsi)),tm=$('cpTeam'),bk=()=>{tm.style.zIndex='';openTeam.render=renderGear;tsel=curTeamList().map(x=>x.id);renderGear();};
  tm.style.zIndex=8;
  openTeam(si,{done:1,t:'BATTLE TEAM · campaign + Arena',ep:()=>enemyPower(si),pool:()=>[...myMechs(),...[0,1,2,3,4].map(crewHero)],best:()=>bestTeam(),
    get:()=>curTeamList().map(h=>h.id),set:ids=>{G.cp.team=ids.slice();},go:()=>{T.toast('✓ Battle team saved',1500);bk();},back:bk});}
// v16-99 (Marius): LEVEL UP window – Essence → levels (max 300), ASCENSION every 20 levels (+3% all stats, +1 skill level, +20 max level)
function powLv(h,dl,da){const o=TE().G.h.own[h.id];if(!o)return pow(h);const l0=o.lv,a0=o.a;o.lv=(o.lv||1)+dl;o.a=(o.a||0)+da;const p=pow(h);o.lv=l0;o.a=a0;return p;}
function popLvl(h){const T=TE(),G=T.G,id=h.id,lv=T.lvOf(id),cap=T.lvCap(id),a=T.ascOf(id),es=G.ess||0,p0=pow(h);
  const costN=n=>{let c=0;for(let k=0;k<n;k++)c+=T.lvCost(lv+k);return c;},can=()=>{let c=0,k=0;while(lv+k<cap&&c+T.lvCost(lv+k)<=es){c+=T.lvCost(lv+k);k++;}return k;};
  const n10=Math.min(10,cap-lv),nm=can();
  let x=`<div class="pT">LEVEL UP · <span style="color:${gcol(h)}">${h.n}</span></div><div class="lvW"><div class="lvN">Lv ${lv} <small>/ ${cap}${cap<T.LV_MAX?' · max '+T.LV_MAX:''}</small></div><div class="lvBar"><i style="width:${lv/T.LV_MAX*100}%"></i></div>
    <div class="lvE">${T.ESI} Essence: <b>${T.nf(es)}</b></div><div class="pD"><img class="ascI" src="img/ui9/asc_badge.webp" alt=""> Ascension ${a} / ${T.LV_MAX/T.ASC_STEP-1} · Skill Lv <b>${T.skLv(id)}</b> (+${(T.skLv(id)-1)*6}% skill damage &amp; heal)${h.gr===5?' · Mythic stars +'+stars(h)+' / 20 '+starsH(stars(h)||0,0,1):''}</div></div>`;
  if(lv<cap){x+=`<div class="lvG"><button class="cpGo${es>=T.lvCost(lv)?'':' dis'}" data-p="lvN" data-h="${id}" data-n="1">+1<small>${T.nf(T.lvCost(lv))}</small></button><button class="cpGo${es>=costN(n10)?'':' dis'}" data-p="lvN" data-h="${id}" data-n="${n10}">+${n10}<small>${T.nf(costN(n10))}</small></button><button class="cpGo alt${nm?'':' dis'}" data-p="lvN" data-h="${id}" data-n="${Math.max(1,nm)}">MAX +${nm}<small>${nm?T.nf(costN(nm)):'—'}</small></button></div>
    <div class="tpw">POWER <b>${p0.toLocaleString()}</b> ➜ +1: <b class="up">${powLv(h,1,0).toLocaleString()}</b>${n10>1?` · +${n10}: <b class="up">${powLv(h,n10,0).toLocaleString()}</b>`:''}</div>`;}
  else if(cap<T.LV_MAX){const c=T.ascCost(a);x+=`<div class="lvA"><b>✦ ASCENSION ${a} ➜ ${a+1}</b> – Lv ${lv} is the limit for now.<br>• all stats <b>+3%</b> (power ${p0.toLocaleString()} ➜ <b class="up">${powLv(h,0,1).toLocaleString()}</b>)<br>• skill Lv <b>${T.skLv(id)} ➜ ${T.skLv(id)+1}</b> (+6% skill damage &amp; heal)<br>• max level <b>${cap} ➜ ${cap+T.ASC_STEP}</b></div>
    <button class="cpGo${es>=c?'':' dis'}" data-p="hasc" data-h="${id}"><img class="ascI" src="img/ui9/asc_badge.webp" alt=""> ASCEND · ${T.ESI} ${T.nf(c)}</button>`;}
  else x+=`<div class="lvA" style="text-align:center"><b>MAX LEVEL ${T.LV_MAX}</b> · all ascensions done</div>`;
  x+=`<div class="pD" style="text-align:left">${T.ESI} <b>Essence</b> comes from Idle Rewards, campaign stages, Torque Tower, Class Towers, all Dungeons, the Essence event and duplicates of maxed heroes. Levels work in every battle and a little in the garage (+0.1% per level).</div><button class="cpGo alt" data-p="x">CLOSE</button>`;
  pop(x);}

// ---------------------------------------------------------------- GEAR page (separate page · gear works only in battles)
let gsel=null,gfil='all',gsalv=0,gsort='pow',gpgFrom='';
function cleanGear(){const T=TE(),g=GR();for(const hid in g.eq){if(!T.G.h.own[hid]){delete g.eq[hid];continue;}for(const s in g.eq[hid])if(!itemById(g.eq[hid][s]))delete g.eq[hid][s];}}
function gHero(){const L=myMechs();if(!L.length)return null;if(!gsel||!L.find(h=>h.id===gsel))gsel=L[0].id;return TE().HB[gsel];}
function openGear(hid,si){cleanGear();if(hid)gsel=hid;tsi=si!=null?si:Math.min(CPX().best,NST-1);openTeam.render=renderGear;$('cpGear').classList.add('open');gpg='';renderGear();gPage(hid?'hero':'');$('gBody').scrollTop=0;}
function lvCan(id){const T=TE(),G=T.G,l=T.lvOf(id),c=T.lvCap(id),e=G.ess||0;return l<c?e>=T.lvCost(l):c<T.LV_MAX&&e>=T.ascCost(T.ascOf(id));}
function renderGear(){const T=TE(),G=T.G,g=GR(),h=gHero();
  $m('gGSB').innerHTML=GTKI0+' <b>GEAR SUMMON</b> <span>'+GSD().tk+' tickets</span>';
  $m('gMoney').innerHTML=T.ESI+' '+T.nf(G.ess||0)+' &nbsp;'+T.GPI+' '+T.nf(G.gp||0); // v16-99: Essence (hero levels) + Gear Parts (gear upgrades)
  tsel=curTeamList().map(x=>x.id);const team=tsel;let L=myMechs();
  if(gsort==='pow')L=L.slice().sort((a,b)=>pow(b)-pow(a));else if(gsort==='gr')L=L.slice().sort((a,b)=>(b.gr||0)-(a.gr||0)||stars(b)-stars(a));
  // BATTLE TEAM (5 places) – tap a place to change it (before / after)
  const tl=team.map(heroOf),tp=teamPower(tl),si=Math.max(0,Math.min(NST-1,tsi==null?CPX().best:tsi)),ep=enemyPower(si),col=tp>=ep*1.15?'#66bb6a':tp>=ep*.85?'#ffb300':'#ff5252';
  renderPeds(tl);
  $m('gTeam').innerHTML=`<div class="gtH">⚔️ BATTLE TEAM <span style="color:#c9b88a;font-size:10px;letter-spacing:0">also for the Arena</span><button data-g="tedit" class="tEd">✎ EDIT TEAM</button><button data-g="best">${IMGI(glyphURL('bolt','#2a1000'))} AUTO BEST</button></div>
    <div class="gtP"><span>${IMGI(glyphURL('swords','#ffd54a'),'1em','-.12em')} ${tp.toLocaleString()} <small>team power</small></span><span style="color:${col}">${tp>=ep*1.15?'EASY':tp>=ep*.85?'EVEN':'HARD'} <small>vs stage ${sLabel(si)} · ${ep.toLocaleString()}</small></span></div>`;
  $m('gBagS').textContent=g.inv.length+'/'+GINV;
  {const C=collInfo();$m('gColS').textContent=C.reduce((a,c)=>a+c.n,0)+' / '+C.reduce((a,c)=>a+c.tot,0);}
  $m('gCnt').textContent=L.length+' heroes';
  $m('gSort').innerHTML=[['pow','POWER'],['gr','GRADE']].map(([k,n])=>`<b data-sort="${k}" class="${gsort===k?'on':''}">${n}</b>`).join('');
  const fz=T.canFuse?T.canFuse:()=>false;
  $m('gHeroes').innerHTML=L.length?L.map(m=>{const ng=heroGear(m.id).length;return `<div class="gh${m.id===gsel?' on':''}" data-h="${m.id}" style="border-color:${gcol(m)}"><img src="${portraitURL(m)}"><img class="rb" src="${roleBadge(roleOf(m))}">${team.includes(m.id)?'<i>TEAM</i>':''}${fz(m.id)?'<b class="up">FUSE ✓</b>':''}<em class="st">+${stars(m)}</em><em class="lv${lvCan(m.id)?' up':''}">Lv ${T.lvOf(m.id)}${lvCan(m.id)?' ▲':''}</em>${ng?`<em class="gc">⚙${ng}</em>`:''}<b class="pw">⚔ ${pow(m).toLocaleString()}</b><span>${m.n}</span></div>`;}).join(''):'<div class="gEmpty" style="grid-column:1/-1">No heroes yet – summon your first heroes!</div>';
  $m('gHSB').innerHTML='🎟️ <b>HERO SUMMON</b><span>'+T.G.h.tk+' tickets</span>';
  if(!h){$m('gMain').innerHTML=`<div class="gEmpty">You have no mechanic heroes yet.<br><br>${TKI} Summon mechanics first – the Rookie Crew can't use gear.</div>`;$m('gStats').innerHTML='';$m('gBtns').innerHTML='';$m('gInfo').innerHTML='';$m('gHName').innerHTML='';renderBag(null);if(gpg==='hero')gPage('');if(gpg==='coll')renderColl();return;}
  const eq=g.eq[h.id]||{};const slotBox=sl=>{const it=itemById(eq[sl.k]);return `<div class="gsl q-${sl.k}" data-s="${sl.k}">${it?itemCard(it):''}</div>`;};
  const st=unitStats(h),st0=unitStats(h,{tool:null,helm:null,vest:null,glove:null,boots:null,chip:null});
  $m('gMain').innerHTML=GSLOT.map(slotBox).join('')+(hasSpr(h.id)?'':`<div class="gPor">${T.fbox(h,0,stars(h))}</div>`);
  $m('gHName').innerHTML=`<b style="color:${gcol(h)}">${h.n} <em>+${stars(h)}</em></b><small style="color:#e2c6ff;font-weight:900">Lv ${T.lvOf(h.id)} / ${T.lvCap(h.id)}${T.ascOf(h.id)?' · <img class="ascI" src="img/ui9/asc_badge.webp" alt=""> ASCENSION '+T.ascOf(h.id):''} · SKILL Lv ${T.skLv(h.id)}${h.gr===5?' · '+starsH(stars(h)||0,0,1):''}</small><small>${IMGI(roleBadge(roleOf(h)),'1.3em','-.3em')} ${T.GRADES[h.gr||0]?T.GRADES[h.gr||0].n+' · ':''}${ROLE[roleOf(h)].n}</small><div class="gPow">${IMGI(glyphURL('swords','#ffd54a'),'1em','-.12em')} ${pow(h).toLocaleString()}</div><button class="gLvC${lvCan(h.id)?' rdy':''}" data-g="lvl">${T.ESI} LEVEL UP${lvCan(h.id)?' ▲':''}</button>${T.SPLASH&&T.SPLASH[h.id]?'<button class="gArt" data-g="art">🖼 ART</button>':''}`;
  $m('gInfo').innerHTML=`<div class="gSk"><b>${IMGI(glyphURL('bolt','#ffd54a'),'1em','-.15em')} ${skOf(h).sk}</b>${HSK[h.id]?`<span>${HSK[h.id].skd}</span>`:''}</div>${pasOf(h).map(p=>`<div class="gSk ps"><b>${p.ic} ${p.n}</b><span>${p.d}</span></div>`).join('')}${(()=>{const S=SETS[roleOf(h)];if(!S)return '';const n=setCount(h,heroGear(h.id));return `<div class="gSk ps"><b>${IMGI(roleBadge(roleOf(h)),'1.2em','-.3em')} ${S.n.toUpperCase()} SET <em style="color:#ffd54a;font-style:normal">${n}/6</em></b><span>${n?'':'Set pieces drop from Rare up (campaign + Gear Summon). '}Only ${ROLE[roleOf(h)].n} heroes get this bonus.</span>${setPcs(roleOf(h),heroGear(h.id))}${setBlock(roleOf(h),n)}</div>`;})()}<div class="gNote">${IMGI(glyphURL('swords','#ffb300'),'1em','-.15em')} Gear works <b>only in battles</b> (not in the garage) · tap a slot to change it</div>`;
  $m('gStats').innerHTML=STROWS.map(([ic,n,f,fmt])=>{const a=f(st0),b=f(st),d=b-a;return `<div><span>${IMGI(glyphURL(ic,'#ffcc80'),'1.15em','-.25em')} ${n}</span><b>${fmt(b)}</b><em>${Math.abs(d)>1e-6?'+'+String(fmt(d)).replace('+',''):''}</em></div>`;}).join('');
  const inT=team.includes(h.id);
  const lvRdy=T.lvOf(h.id)<T.lvCap(h.id)&&(G.ess||0)>=T.lvCost(T.lvOf(h.id))||T.lvOf(h.id)===T.lvCap(h.id)&&T.lvCap(h.id)<T.LV_MAX&&(G.ess||0)>=T.ascCost(T.ascOf(h.id));
  $m('gBtns').innerHTML=`<button class="cpGo gLvB${lvRdy?' rdy':''}" data-g="lvl">${T.ESI} LEVEL UP · Lv ${T.lvOf(h.id)}${lvRdy?' ▲':''}</button><button class="cpGo ${inT?'tmo':'tm'}" data-g="${inT?'tout':'tin'}">${inT?'✖ LEAVE TEAM':'➕ ADD TO TEAM'}</button><button class="cpGo" data-g="auto">${IMGI('img/ui2/i_energy.webp','1.4em','-.4em')} AUTO EQUIP</button><button class="cpGo alt" data-g="none">UNEQUIP ALL</button>`;
  renderBag(h);if(gpg==='salv')renderSalv();if(gpg==='coll')renderColl();}
function renderBag(h){const T=TE(),g=GR();
  $m('gFil').innerHTML=[['all','ALL','bag'],...GSLOT.map(s=>[s.k,s.n,s.ic])].map(([k,n,ic])=>`<button class="gf${gfil===k?' on':''}" data-f="${k}"><img src="${glyphURL(ic,gfil===k?'#2a1000':'#ffd54a')}" alt="${n}"></button>`).join('');
  $m('gBagFor').innerHTML=h?`for <b style="color:${gcol(h)}">${h.n}</b> · ${gfil==='all'?'ALL GEAR':GS[gfil].n.toUpperCase()}`:'';
  $m('gBagN').innerHTML=`BAG <b>${g.inv.length}</b>/${GINV}`;
  const inv=g.inv.filter(it=>gfil==='all'||it.s===gfil).sort((a,b)=>b.r-a.r||b.lv-a.lv||a.s.localeCompare(b.s));
  $m('gInv').innerHTML=inv.length?'<div class="gGrid">'+inv.map(it=>{const o=ownerOf(it);const oh=o&&T.HB[o];return '<div class="gSlot">'+itemCard(it,o?`<img class="own" src="${portraitURL(oh)}" style="border-color:${gcol(oh)}">`:'',h&&o===h.id?'mine':o?'used':'')+'</div>';}).join('')+'</div>':'<div class="gEmpty">No gear here yet. Win battles to find gear!</div>';}
// v16-47: the 5 battle-team heroes stand on the pedestals of Marius' HEROES page (animated idle pose)
function renderPeds(tl){const T=TE();let x='';for(let k=0;k<5;k++){const h=tl[k];x+=`<div class="gPed${h&&h.id===gsel&&gpg==='hero'?' on':''}" data-ts="${k}" style="left:${[12.4,31.2,50,68.8,87.5][k]}%">${h?(hasSpr(h.id)?'':`<img class="pp" src="${portraitURL(h)}" style="border-color:${gcol(h)}">`)+`<span style="color:${gcol(h)}">${h.n}</span><i>${h.crew?'CREW':'+'+stars(h)}</i>`:'<b>+</b>'}</div>`;}
  $m('gPeds').innerHTML=x;pedList=tl;}
let pedList=[],pedRaf=0,gpg='',pedT0=0;
function pedLoop(t){pedRaf=0;const cg=$('cpGear');if(!cg.classList.contains('open'))return;pedRaf=requestAnimationFrame(pedLoop);if(t-pedT0<50)return;pedT0=t;const s=t/1000;
  if(gpg===''){const cv=$('gPedCv'),r=cv.getBoundingClientRect();if(!r.width)return;const dpr=Math.min(2,devicePixelRatio||1),W=Math.round(r.width*dpr),H=Math.round(r.height*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
    const X=cv.getContext('2d');X.clearRect(0,0,W,H);pedList.forEach((h,k)=>{if(h&&hasSpr(h.id))pose(X,h.id,'idle',s+k*.37,0,W*[.124,.312,.5,.688,.875][k],H*.905,H*.46,1);});}
  else if(gpg==='hero'){const h=gHero(),cv=$('gHeroCv'),r=cv.getBoundingClientRect();if(!h||!r.width)return;const dpr=Math.min(2,devicePixelRatio||1),W=Math.round(r.width*dpr),H=Math.round(r.height*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
    const X=cv.getContext('2d');X.clearRect(0,0,W,H);if(hasSpr(h.id))pose(X,h.id,'idle',s,0,W*.5,H*.93,H*.62,1);}}
function pedGo(){if(!pedRaf)pedRaf=requestAnimationFrame(pedLoop);}
// v16-51: HERO COLLECTION page (battle bonus). Until Marius' picture arrives it is drawn with CSS.
// v16-52: HERO COLLECTION on Marius' picture (img/ui4/coll.webp, 1024×1536) – positions in % of the picture
const cP=(x,y,w,h)=>`left:${x/10.24}%;top:${y/15.36}%;width:${w/10.24}%;height:${h/15.36}%;`;
const CROWY=[610,742,870,998,1122,1247],GSH={hp:'HP',atk:'ATK',def:'DEF',crit:'CRIT',aspd:'SPEED',en:'ENERGY'};
const cbTxt=t=>t.every(([,v])=>v===t[0][1])?t.map(([k])=>GSH[k]).join(' · ')+' +'+t[0][1]+'%':t.map(([k,v])=>GSH[k]+' +'+v+'%').join(' ');
function renderColl(){const T=TE(),C=collInfo(),tot=C.reduce((a,c)=>a+c.tot,0),n=C.reduce((a,c)=>a+c.n,0),b=collBon();
  const act=Object.keys(b).filter(k=>b[k]).map(k=>GSTAT[k].n+' +'+b[k]+'%');
  let x=`<div class="gcPic"><img class="gcBg" src="img/ui4/coll.webp" alt="HERO COLLECTION">
   <div class="gcA" data-g="cback" style="${cP(13,33,112,112)}border-radius:50%"></div>
   <div class="gcL gcN2" style="${cP(858,64,150,54)}">${n} / ${tot}</div>
   <div class="gcBar2" style="${cP(101,491,823,34)}"><i style="width:${tot?Math.round(n/tot*100):0}%"></i><span>${act.length?'ACTIVE: '+act.join(' · '):'COMPLETE A COLOR = BONUS FOR ALL HEROES'}</span></div>`;
  C.forEach(c=>{const g=T.GRADES[c.gr],ok=c.tot&&c.n>=c.tot,y=CROWY[c.gr];
    x+=`<div class="gcA" data-gcr="${c.gr}" style="${cP(20,y-58,970,116)}"></div>
     <div class="gcL gcK${ok?' ok':''}" style="${cP(381,y-31,96,62)}">${c.n}/${c.tot}</div>
     <div class="gcL gcB${ok?' ok':''}" style="${cP(500,y-31,308,62)}"><b>${cbTxt(CBON[c.gr])}</b><small>${ok?'✓ ACTIVE · ALL HEROES':c.gr===5?'LOCKED · MYTHIC = SUMMON':'LOCKED · ALL HEROES'}</small></div>
     <div class="gcCh${ok?' ok':''}" style="${cP(835,y-52,138,104)}"><img class="gcOk" src="img/ui5/${ok?'ok':'lock'}.webp" alt="${ok?'done':'locked'}"></div>`;});
  x+=`<div class="gcL gcGo" data-g="hsum" style="${cP(200,1352,624,92)}">HERO SUMMON</div></div>
   <div class="gcSub">YOUR HEROES · tap a color above to jump to it</div>`;
  C.forEach(c=>{const g=T.GRADES[c.gr],L=T.HEROES.filter(h=>h.cat==='m'&&!h.soon&&h.gr===c.gr);
    x+=`<div class="gcRow${c.tot&&c.n>=c.tot?' ok':''}" id="gcr${c.gr}" style="--c:${g.c};--c3:${g.c}33"><div class="wR g${c.gr} gcHd"><span class="gn">◆ ${g.n.toUpperCase()}</span><span class="gk">${c.n} / ${c.tot}${c.tot&&c.n>=c.tot?' <img src="img/ui5/ok.webp" alt="">':''}</span></div>
     <div class="gcHs">${L.map(h=>{const d=T.G.h.disc[h.id];return `<img class="${d?'':'no'}" src="${d?portraitURL(h):T.portrait(h,1)}" ${d&&T.G.h.own[h.id]?`data-h="${h.id}"`:''} alt="">`;}).join('')}</div></div>`;});
  x+=`<div class="gcTot"><small style="color:#9fb0c0">The bonus works in the campaign and in the Arena. Summon new heroes to fill the collection.</small></div>`;
  morph($('gcW'),x);}
function gPage(p){gpg=p;['gHero','gBag','gSalv','gColl'].forEach(id=>$(id).classList.toggle('open',id==={hero:'gHero',bag:'gBag',salv:'gSalv',coll:'gColl'}[p]));if(p==='coll'){renderColl();$('gColl').scrollTop=0;}if(p==='bag')$('gInv').scrollTop=0;if(p==='hero')$('gHero').scrollTop=0;if(p==='salv'){svPick=null;renderSalv();}renderPeds(pedList);pedGo();}
// v16-47: SALVAGE page – up to 20 free (not worn) items at once, auto-picked by grade; tap an item to keep it
let svG=[1,1,0,0,0,0],svPick=null,svSkip=new Set();
function svList(){const g=GR();return g.inv.filter(it=>!ownerOf(it)&&it.r<6&&svG[it.r]&&!svSkip.has(it.id)).sort((a,b)=>a.r-b.r||a.lv-b.lv).slice(0,20);}
function svFx(n,sum){const T=TE(),b=$('svGo');try{navigator.vibrate&&navigator.vibrate(30);}catch(e){}const o=document.createElement('div');o.className='svFx';o.innerHTML=`<img src="img/ui2/i_scrap.webp"><b>+${GPN(sum)}</b><small>${n} item${n>1?'s':''} salvaged</small>`;$('gSalv').appendChild(o);setTimeout(()=>o.remove(),1700);}
function renderSalv(){const T=TE();const L=svPick=svList();let sum=0;L.forEach(it=>sum+=salvageV(it));
  $m('svSlots').innerHTML=Array.from({length:20},(_,k)=>{const it=L[k];return `<div class="svS" style="left:${[8.5,25.6,42.7,59.6,76.7][k%5]}%;top:${[33.7,44.3,54.9,65.4][k/5|0]}%">${it?`<div data-sx="${it.id}">${itemCard(it)}</div>`:''}</div>`;}).join('');
  $m('svInfo').innerHTML=`<div class="svT">${L.length?`<b>${L.length}</b> item${L.length>1?'s':''} · <b class="g">+${GPN(sum)}</b>`:'Nothing to salvage'}</div><div class="svC">${T.GRADES.slice(0,6).map((gr,i)=>`<b data-sv="${i}" class="${svG[i]?'on':''}" style="--c:${gr.c}">${gr.n.toUpperCase()}</b>`).join('')}</div>`;
  $('svGo').innerHTML=L.length?`SALVAGE ${L.length}`:'—';$('svGo').classList.toggle('dis',!L.length);
  $m('svHelp').innerHTML=`<div class="gNote">${IMGI('img/ui2/i_scrap.webp','1.3em','-.35em')} Gear that a hero wears is never salvaged. Tap the grades to choose what goes in · tap an item to keep it${svSkip.size?` · <u data-g="svReset">show kept items (${svSkip.size})</u>`:''}</div>`;}
function cmpForHero(h,ov,xp,xc){return cmpBlock(unitStats(h),unitStats(h,ov),pow(h),pow(h,ov),xp,xc);}
let gstar='';function popItem(id,keep){const T=TE(),G=T.G,g=GR(),it=itemById(id);if(!it)return;const h=gHero(),sl=GS[it.s],st=GSTAT[sl.st],o=ownerOf(it),oh=o&&T.HB[o];gsalv=0;gstar='';
  // v16-47: Marius' item card (img/ui2/item_f.webp): icon · name plate · 4 stat lines · EQUIP (green) / UPGRADE (blue) / SALVAGE (orange)
  const rows=[`<div class="iSt main">${IMGI(glyphURL(st.ic,st.col),'1.1em','-.22em')} ${st.n} <b>+${mainV(it)}%</b></div>`,...it.sub.map(([k,v])=>`<div class="iSt">${IMGI(glyphURL(GSTAT[k].ic,GSTAT[k].col),'1.1em','-.22em')} ${GSTAT[k].n} <b>+${v}%</b></div>`)];
  while(rows.length<3)rows.push('<div class="iSt e">—</div>');
  rows.push(oh?`<div class="iSt ow">${IMGI(portraitURL(oh),'1.4em','-.4em')} worn by <b style="color:${gcol(oh)}">${oh.n}</b></div>`:`<div class="iSt ow">${IMGI('img/ui2/i_key.webp','1.2em','-.3em')} free · in the bag</div>`);
  const mx=it.lv>=gMax(it),c=mx?0:gpCost(it);
  let b1='';if(h){b1=o===h.id?`<button class="b1" data-p="ueq" data-it="${it.id}">UNEQUIP</button>`:`<button class="b1" data-p="eq" data-it="${it.id}">EQUIP<small>on ${h.n}</small></button>`;}else b1='<button class="b1 dis">EQUIP</button>';
  let x=`<div class="itW"><button class="itX" data-p="x">✕</button><div class="itIc">${itemCard(it)}</div>
   <div class="itNm"><b style="color:${GG(it.r).c}">${itemName(it)}</b><small>${GG(it.r).n} ${sl.n} · Lv ${it.lv}/${gMax(it)}${' · '+starsH(it.sr||0,it.r>=6,1)}</small>${it.set?`<small class="itSet">${IMGI(roleBadge(it.set),'1.2em','-.3em')} ${SETS[it.set].n.toUpperCase()} SET · ${ROLE[it.set].n} only</small>`:''}</div>
   <div class="itSt">${rows.slice(0,4).join('')}</div>
   <div class="itBt">${b1}<button class="b2${mx||(G.gp||0)<c?' dis':''}" data-p="${mx?'':'up'}" data-it="${it.id}">${mx?'MAX LEVEL':`${IMGI('img/ui2/i_forge.webp','1.5em','-.45em')}UPGRADE<small>${GPN(c)}</small>`}</button><button class="b3" data-p="salv" data-it="${it.id}">${IMGI('img/ui2/i_scrap.webp','1.5em','-.45em')}SALVAGE<small>+${GPN(salvageV(it))}</small></button></div></div><div class="itMore">`;
  if(h){const cur=itemById((g.eq[h.id]||{})[it.s]);
    if(o===h.id){x+=`<div class="cpSec">IF YOU UNEQUIP IT FROM ${h.n.toUpperCase()}</div>`+cmpForHero(h,{[it.s]:null},[],[`${sl.n} slot becomes empty`]);}
    else{const xc=[],xp=[];if(cur)xc.push(`Replaces <b style="color:${GG(cur.r).c}">${itemName(cur)}</b> Lv ${cur.lv} (goes back to the bag)`);
      if(oh){const d=pow(oh)-pow(oh,{[it.s]:null});xc.push(`Taken from <b>${oh.n}</b> (his power −${d.toLocaleString()})`);}
      x+=`<div class="cpSec">BEFORE / AFTER ON ${h.n.toUpperCase()}</div>`+cmpForHero(h,{[it.s]:it},xp,xc);}}
  if(it.set){const n=h&&roleOf(h)===it.set?setCount(h,heroGear(h.id)):0;x+=`<div class="cpSec">${SETS[it.set].n.toUpperCase()} SET · ${ROLE[it.set].n.toUpperCase()} ONLY</div>`+setBlock(it.set,n);}
  // v16-89: STARS (merge an identical free piece) and ASCEND (Mythic ★5 + 1 more Mythic of the same slot)
  {const sr=it.sr||0,f=starFood(it),nm=`${GG(it.r).n} ${sl.n}`,fx=f?`<div class="iFood">${itemCard(f)}<span>uses <b style="color:${GG(f.r).c}">${itemName(f)}</b> Lv ${f.lv}${f.sr?' '+starsH(f.sr,f.r>=6):''}<br><small>free piece from the bag · it is gone after</small></span></div>`:`<div class="pD">Needs one more <b style="color:${GG(it.r).c}">${nm}</b> in the bag (not worn).</div>`;
   const SM=gsMax(it);if(sr<SM){x+=`<div class="cpSec">${STI('on')} STARS ${sr} / ${SM}<button class="gGd" data-p="gguide" data-it="${it.id}">?</button></div><div class="iUp">${st.n}: <b>+${mainV(it)}%</b> ➜ <b class="up">+${mainV({...it,sr:sr+1})}%</b> <small>(★${sr} ➜ ★${sr+1}${sr>=5?' · +5% each star'+((sr+1)%5===0&&sr+1>5?' · NEW STAR COLOR + NEW STAT':''):' · +'+GSTAR_K*100+'% each star'})</small></div>${fx}<button class="cpGo${f?'':' dis'}" data-p="${f?'star':''}" data-it="${it.id}">${STI('on')} STAR UP</button>`;}
   else if(it.r===5){const nx={...it,r:6};x+=`<div class="cpSec" style="color:${ASC.c}">${STI('asc')} ASCEND · ABOVE MYTHIC<button class="gGd" data-p="gguide" data-it="${it.id}">?</button></div><div class="iUp">${st.n}: <b>+${mainV(it)}%</b> ➜ <b class="up">+${mainV(nx)}%</b> <small>(stars stay ★5 · max Lv ${GMAXR[5]} ➜ ${GMAXR[6]} · +1 bonus stat)</small></div>${fx}<button class="cpGo asc${f?'':' dis'}" data-p="${f?'asc':''}" data-it="${it.id}">${STI('asc')} ASCEND</button>`;}
   else x+=`<div class="cpSec">${STI('on')} STARS ${sr} / ${SM} · MAX</div>`;}
  if(!mx){const nx={...it,lv:it.lv+1};x+=`<div class="cpSec">UPGRADE</div><div class="iUp">${st.n}: <b>+${mainV(it)}%</b> ➜ <b class="up">+${mainV(nx)}%</b> <small>(Lv ${it.lv} ➜ ${it.lv+1})</small></div>`;}
  x+='</div>';
  if(keep)morph($('cpPopBox'),x);else pop(x);$('cpPopBox').classList.add('itPop');}
// v16-93 GEAR GUIDE – how gear gets stronger than Mythic, with pictures (Marius: "doar scris nu se vede")
let gdBack='';function gearGuide(back){gdBack=back||'';const T=TE(),sl='tool',st=GSTAT[GS[sl].st];
  const it=(r,sr,lv)=>({id:'gd'+r+'_'+sr,s:sl,r,lv:lv||GMAXR[r],sr:sr||0,sub:[]}),M0=it(5,0),M5=it(5,5),A5=it(6,5);
  let g='';for(let r=0;r<=6;r++)g+=`<div>${itemCard(it(r,r===6?5:0,1))}<b style="color:${GG(r).c}">${GG(r).n.toUpperCase()}</b></div>`;
  let L='';for(let n=0;n<=5;n++)L+=`<span>${starsH(n,0,1)}</span><span>${n?'+'+n+' copy':'new'}</span><span>${st.n} <b>+${mainV(it(5,n))}%</b></span>`;
  const x=`<div class="gdW"><h2>GEAR GUIDE</h2><div class="sub">HOW GEAR GETS STRONGER THAN MYTHIC</div>
  <div class="gdS"><div class="gdH"><i>1</i>7 GRADES</div><div class="gdG">${g}</div>
   <div class="gdT">Common ➜ Mythic come from <b>Gear Summon</b>, the Campaign and Dungeons.<br><b style="color:${ASC.c}">ASCENDED</b> is the new grade above Mythic.</div></div>
  <div class="gdS"><div class="gdH"><i>2</i>${STI('on')} STARS ★1 – ★5</div>
   <div class="gdEq">${itemCard(M0)}<em>+</em>${itemCard(M0)}<em class="to">➜</em>${itemCard(it(5,1))}</div>
   <div class="gdT">Put a <b>second identical piece</b> (same grade + same slot, free in the bag) into it = <b>+1 star</b>.<br>Every star = <b>+${GSTAR_K*100}% main stat</b>. Works for every grade.</div>
   <div class="gdL">${L}</div></div>
  <div class="gdS"><div class="gdH"><i>3</i>${STI('asc')} <span style="color:${ASC.c}">ASCEND</span></div>
   <div class="gdEq">${itemCard(M5)}<em>+</em>${itemCard(M0)}<em class="to">➜</em>${itemCard(A5)}</div>
   <div class="gdT">A <b>Mythic ★5</b> + one more <b>Mythic of the same slot</b> = <b style="color:${ASC.c}">ASCENDED</b>.</div>
   <div class="gdC"><span>${st.n} <b>+${mainV(M5)}%</b> ➜ <b>+${mainV(A5)}%</b></span><span>Max level <b>${GMAXR[5]} ➜ ${GMAXR[6]}</b></span><span><b>+1</b> bonus stat</span><span>Stars stay <b>★5</b></span></div></div>
  <div class="gdS"><div class="gdH"><i>4</i>WHERE TO FIND</div>
   <div class="gdT">Ascended pieces can also <b>drop in the Campaign from chapter ${ASC_CH+1}</b> and come from Gear Summon (0.02%). Ascended pieces go up to <b>★20</b> (new star color + new stat every 5).<br>Open any Mythic piece ➜ <b>${STI('on')} STAR UP</b> / <b>${STI('asc')} ASCEND</b> at the bottom of its window.<br>SALVAGE never takes Ascended pieces.</div></div>
  <div class="cpRow">${gdBack?'<button class="cpGo alt" data-p="gdback">↩ BACK</button>':''}<button class="cpGo" data-p="x">GOT IT</button></div></div>`;
  pop(x);}
// v16-42: GEAR UPGRADE animation (Marius: "I see nothing when I upgrade – only after I leave and come back")
// Everything stays on screen (no rebuild, no scroll jump): the item card in the popup and in the bag flashes,
// a burst with sparks + "UPGRADE SUCCESS!  Lv 3 ➜ Lv 4  ·  HP +6.7% ➜ +7.4%" plays over the popup (taps go through it).
function upFx(it,v0,p0){const T=TE(),st=GSTAT[GS[it.s].st],col=GG(it.r).c,h=gHero(),mx=it.lv>=gMax(it);
  try{navigator.vibrate&&navigator.vibrate(25);}catch(e){}
  const bx=$('cpPopBox');let o=$('upFx');if(o)o.remove();o=document.createElement('div');o.id='upFx';o.style.setProperty('--c',col);
  const dp=h&&ownerOf(it)===h.id?pow(h)-p0:0;
  let sp='';for(let i=0;i<16;i++){const a=i/16*6.283+Math.random()*.3,d=70+Math.random()*60;sp+=`<i style="--x:${Math.cos(a)*d|0}px;--y:${Math.sin(a)*d|0}px;--d:${(Math.random()*.15).toFixed(2)}s"></i>`;}
  o.innerHTML=`<div class="ufRays"></div><div class="ufSp">${sp}</div><div class="ufIc"><img src="${itemIconURL(it.s,it.r,it.set)}"></div>
    <div class="ufT">${mx?'MAX LEVEL!':'UPGRADE SUCCESS!'}</div><div class="ufL">Lv ${it.lv-1} <b>➜</b> <span>Lv ${it.lv}</span></div>
    <div class="ufS">${IMGI(glyphURL(st.ic,st.col),'1.1em','-.22em')} ${st.n} +${v0}% <b>➜</b> <span>+${mainV(it)}%</span></div>${dp>0?`<div class="ufP">${IMGI(glyphURL('swords','#ffd54a'),'1em','-.15em')} Power +${dp.toLocaleString()}</div>`:''}`;
  const P=$('cpPop').getBoundingClientRect(),cd=bx.querySelector('.iTop>.gi,.itIc>.gi'),cr=cd&&cd.getBoundingClientRect();let cy=cr&&cr.bottom>40&&cr.top<P.height-40?cr.top+cr.height/2:P.height*.42;o.style.top=Math.max(0,Math.min(P.height-300,cy-P.top-130))+'px';
  $('cpPop').appendChild(o);clearTimeout(upFx.t);upFx.t=setTimeout(()=>o.remove(),1800);
  // flash the item card in the popup + in the bag / slot (same elements – nothing re-created)
  document.querySelectorAll(`#cpPopBox .iTop>.gi, #cpPopBox .itIc>.gi, #cpGear .gi[data-it="${it.id}"]`).forEach(e=>{e.classList.remove('upHit');void e.offsetWidth;e.classList.add('upHit');});
  const u=bx.querySelector('.iUp');if(u){u.classList.remove('upHit2');void u.offsetWidth;u.classList.add('upHit2');}
  const m=bx.querySelector('.iSt.main b');if(m){m.classList.remove('upHit2');void m.offsetWidth;m.classList.add('upHit2');}}
function equip(hid,it){const g=GR(),o=ownerOf(it);if(o)delete g.eq[o][it.s];if(!g.eq[hid])g.eq[hid]={};g.eq[hid][it.s]=it.id;}
// v16-83 (Marius: "first check if the set is better, then the normal pieces"): the hero's OWN class set is tried first –
// 2, 3 … all slots with a set piece (the set slots that lose the least go first), the other slots get the best normal item.
// The plan with the highest Power wins; if no set plan beats the normal one, the normal (best item per slot) plan is used.
function autoPlan(h){const g=GR(),eq=g.eq[h.id]||{},k=roleOf(h);
  const free=it=>{const o=ownerOf(it);return !o||o===h.id;};
  const fill=ov=>{for(const sl of GSLOT){if(sl.k in ov)continue;let best=itemById(eq[sl.k])||null;if(best&&!free(best))best=null;let bp=pow(h,{...ov,[sl.k]:best});
    for(const it of g.inv){if(it.s!==sl.k||!free(it))continue;const p=pow(h,{...ov,[sl.k]:it});if(p>bp){bp=p;best=it;}}
    ov[sl.k]=best;}return ov;};
  const norm=fill({});let bestOv=norm,bestP=pow(h,norm);
  if(!SETS[k])return bestOv;
  const cand=[];for(const sl of GSLOT){let b=null,bp=-1;
    for(const it of g.inv){if(it.s!==sl.k||it.set!==k||!free(it))continue;const p=pow(h,{...norm,[sl.k]:it});if(p>bp){bp=p;b=it;}}
    if(b)cand.push({k:sl.k,it:b,p:bp});}
  cand.sort((a,b)=>b.p-a.p);
  for(let m=2;m<=cand.length;m++){const ov={};for(let i=0;i<m;i++)ov[cand[i].k]=cand[i].it;fill(ov);const p=pow(h,ov);if(p>=bestP){bestP=p;bestOv=ov;}}
  return bestOv;}
function popAuto(){const T=TE(),g=GR(),h=gHero();if(!h)return;const ov=autoPlan(h),eq=g.eq[h.id]||{};const ch=GSLOT.filter(sl=>(ov[sl.k]?ov[sl.k].id:0)!==(eq[sl.k]||0));
  if(!ch.length){T.toast('⚡ '+h.n+' already wears the best free gear',2000);return;}
  let x=`<div class="pT">Auto equip – before / after</div><div class="pD">Best free gear for ${h.n}: ${SETS[roleOf(h)]?'checks the '+SETS[roleOf(h)].n+' set first, then normal items – the one with the most Power wins':'the strongest items'} (gear worn by other mechanics is not taken).</div><div class="aeL">`+ch.map(sl=>{const a=itemById(eq[sl.k]),b=ov[sl.k];return `<div><small>${sl.n}</small>${a?itemCard(a):'<div class="gse sm">—</div>'}<span>➜</span>${b?itemCard(b):'<div class="gse sm">—</div>'}</div>`;}).join('')+'</div>';
  x+=cmpForHero(h,ov,[],[])+`<button class="cpGo" data-p="aok">✓ CONFIRM</button><button class="cpGo alt" data-p="x">CANCEL</button>`;pop(x);}
function popNone(){const T=TE(),h=gHero();if(!h)return;const eq=GR().eq[h.id]||{};if(!Object.keys(eq).length){T.toast('Nothing equipped',1500);return;}
  const ov={};GSLOT.forEach(s=>ov[s.k]=null);pop(`<div class="pT">Remove all gear?</div><div class="pD">${h.n} – before / after</div>`+cmpForHero(h,ov,[],['All gear goes back to the bag'])+`<button class="cpGo" data-p="nok">✓ CONFIRM</button><button class="cpGo alt" data-p="x">CANCEL</button>`);}
$('cpGear').addEventListener('click',e=>{const T=TE(),el=e.target.closest('[data-g],[data-h],[data-s],[data-f],[data-it],[data-sort],[data-ts],[data-gcr]');if(!el)return;
  if(el.dataset.g==='back'){gPage('');$('cpGear').classList.remove('open');if(TWS.ret){TWS.ret=0;twOpen();return;}if(WBS.ret){WBS.ret=0;wbOpen();return;}if(DGS.ret){DGS.ret=0;rootOn();dgEl.classList.add('open');dgRender();return;}if(collHome){collHome=0;close();return;}if($('cpTeam').classList.contains('open')&&openTeam.render)openTeam.render();return;}
  if(el.dataset.g==='auto'){popAuto();return;}if(el.dataset.g==='none'){popNone();return;}
  if(el.dataset.g==='best'){popAutoBest();return;}
  if(el.dataset.g==='hback'||el.dataset.g==='bback'){gPage(el.dataset.g==='bback'&&gpgFrom==='hero'?'hero':'');return;}
  if(el.dataset.g==='bag'){gpgFrom='';gfil='all';renderGear();gPage('bag');return;}
  if(el.dataset.g==='salvP'){gPage('salv');return;}
  if(el.dataset.gcr!=null){const r=$('gcr'+el.dataset.gcr);if(r)r.scrollIntoView({behavior:'smooth',block:'center'});return;}
  if(el.dataset.g==='coll'){gPage('coll');return;}if(el.dataset.g==='cback'){gPage('');if(collHome){collHome=0;$('cpGear').classList.remove('open');close();}return;}
  if(el.dataset.g==='sback'){gPage('bag');return;}
  if(el.dataset.g==='svReset'){svSkip.clear();renderSalv();return;}
  if(el.dataset.g==='salvGo'){const L=svPick||[];if(!L.length)return;let sum=0;L.forEach(it=>sum+=salvageV(it));
    pop(`<div class="pT">${IMGI('img/ui2/i_scrap.webp','1.4em','-.4em')} Salvage ${L.length} item${L.length>1?'s':''}?</div><div class="gDrop">${L.map(it=>itemCard(it)).join('')}</div><div class="pD">You get <b style="color:#ffd54a">+${T.fmt(sum)}</b>. Salvaged gear is gone forever.</div><button class="cpGo" data-p="svok">✓ SALVAGE</button><button class="cpGo alt" data-p="x">CANCEL</button>`);return;}
  if(el.dataset.g==='hsum'){if(T.openSummon){const sm=document.getElementById('sm');if(sm)sm.style.zIndex=30;T.openSummon('m');}return;}
  if(el.dataset.g==='art'){const h=gHero();if(h&&window.showSplash)showSplash(h.id);return;}
  if(el.dataset.g==='lvl'){const h=gHero();if(h)popLvl(h);return;}
  if(el.dataset.g==='tedit'){heroTeamEdit();return;}
  if(el.dataset.g==='fuse'){const h=gHero();if(h&&h.gr===4&&T.openFuse){const tm=document.getElementById('team');if(tm)tm.style.zIndex=30;T.openFuse(gsel);}else T.toast('⭐ Stars go up when you summon '+(h?h.n:'this hero')+' again (max +50). Legendary +'+5+' heroes can be fused into Mythic.',3800);return;}
  if(el.dataset.g==='tin'){const h=gHero();if(!h)return;if(tsel.length<5)popTeamCmp(tsel.length,h.id);else popWhoLeaves(h.id);return;}
  if(el.dataset.g==='tout'){const h=gHero();if(!h)return;const k=tsel.indexOf(h.id);if(k<0)return;if(tsel.length<=1){T.toast('The team needs at least 1 hero',1800);return;}popTeamCmp(k,'');return;}
  if(el.dataset.sort){gsort=el.dataset.sort;renderGear();return;}
  if(el.dataset.ts!=null){const k=+el.dataset.ts,id=tsel[k];if(id&&!id.startsWith('crew')){gsel=id;renderGear();gPage('hero');return;}if(id){popReplace(k);return;}T.toast('Tap a hero below, then ➕ ADD TO BATTLE TEAM',2200);return;}
  if(el.dataset.h){gsel=el.dataset.h;renderGear();gPage('hero');return;}
  if(el.dataset.f){gfil=el.dataset.f;renderGear();return;}
  if(el.dataset.s){const h=gHero(),it=h&&itemById((GR().eq[h.id]||{})[el.dataset.s]);if(it)popItem(it.id);else{gfil=el.dataset.s;gpgFrom='hero';renderGear();gPage('bag');T.toast('Choose a '+GS[el.dataset.s].n+' – you will see before / after',2200);}return;}
  if(el.dataset.it)popItem(+el.dataset.it);});
// v16-46: coming back from Hero Summon / Fusion → refresh the HEROES page
['sm','team'].forEach(id=>{const el=document.getElementById(id);if(el)new MutationObserver(()=>{if(!el.classList.contains('open')&&$('cpGear').classList.contains('open'))renderGear();}).observe(el,{attributes:true,attributeFilter:['class']});});
$('cpPop').addEventListener('click',e=>{const T=TE(),G=T.G;if(e.target.id==='cpPop'){closePop();return;}const ci=e.target.closest('[data-ch]');if(ci){const c=+ci.dataset.ch;if(!chOpen(c)){T.toast('🔒 Locked – clear the chapter before it',1800);return;}CPX().ch=c;closePop();showMap();return;}const el=e.target.closest('[data-p]');if(!el)return;const a=el.dataset.p;if(a==='gguide'){gearGuide(el.dataset.it);return;}if(a==='gdback'){if(gdBack&&itemById(gdBack))popItem(gdBack);else closePop();return;}
  if(a==='payOK'){const g=window.__payGo;window.__payGo=null;closePop();if(g)g();return;}
  if(a==='gsAgain'){closePop();gsummon(+el.dataset.n);return;}if(a==='gsHist'){gsHist();return;}if(a==='gsGear'){closePop();if(document.getElementById('sm').classList.contains('open')){gsBag();return;}closeGSum();openGear();return;}
  if(a==='x'){closePop();return;}
  if(a==='tcmp'){popTeamCmp(+el.dataset.k,el.dataset.id||null);return;}
   if(a==='lvN'||a==='hasc'){const h=T.HB[el.dataset.h];if(!h)return;const p0=pow(h);let ok=0;
     if(a==='lvN'){ok=T.lvUp(h.id,+el.dataset.n||1);if(!ok){T.toast('Not enough Essence · Dungeons, campaign, Idle Rewards, events',2400);return;}T.toast(T.ESI+' '+h.n+' Lv '+T.lvOf(h.id)+' · Power +'+(pow(h)-p0).toLocaleString(),1800);}
     else{ok=T.ascend(h.id);if(!ok){T.toast('Not enough Essence for the Ascension',2200);return;}T.toast('✦ ASCENSION '+T.ascOf(h.id)+'! '+h.n+' · max Lv '+T.lvCap(h.id)+' · skill Lv '+T.skLv(h.id),2800);}
     renderGear();popLvl(h);return;}
  if(a==='tok'){const k=+el.dataset.k,id=el.dataset.id;if(id)tsel[k]=id;else tsel.splice(k,1);tSave();closePop();openTeam.render&&openTeam.render();return;}
  if(a==='bok'){tsel=tBest();tSave();closePop();openTeam.render&&openTeam.render();return;}
  const it=el.dataset.it?itemById(+el.dataset.it):null,h=gHero();
  if(a==='eq'&&it&&h){equip(h.id,it);T.save();closePop();renderGear();T.toast('✓ '+itemName(it)+' equipped on '+h.n,1800);return;}
  if(a==='ueq'&&it){const o=ownerOf(it);if(o)delete GR().eq[o][it.s];T.save();closePop();renderGear();return;}
  if(a==='up'&&it){const c=gpCost(it);if((G.gp||0)<c){T.toast('Not enough Gear Parts ('+GPN(c)+') · salvage gear, Dungeons, campaign, Idle Rewards',2600);return;}if(it.lv>=gMax(it))return;
    const v0=mainV(it),p0=gHero()?pow(gHero()):0;G.gp-=c;it.lv++;T.save();renderGear();popItem(it.id,true);upFx(it,v0,p0);return;}
  if((a==='star'||a==='asc')&&it){const f=starFood(it);if(!f)return;
    if(gstar!==it.id+a){gstar=it.id+a;el.innerHTML='TAP AGAIN<small>'+itemName(f)+' Lv '+f.lv+' is used</small>';return;}gstar='';
    const g=GR(),p0=gHero()?pow(gHero()):0;g.inv.splice(g.inv.indexOf(f),1);
    if(a==='star'){if((it.sr||0)>=gsMax(it))return;it.sr=(it.sr||0)+1;if(it.r>=6&&it.sr>5&&it.sr%5===0){const k0=Object.keys(GSTAT).filter(k=>k!==GS[it.s].st&&!it.sub.some(z=>z[0]===k));if(k0.length){const k=k0[Math.floor(Math.random()*k0.length)];it.sub.push([k,Math.round(GSTAT[k].v[6]*.4*10)/10]);}it.sub.forEach(z=>z[1]=Math.round(z[1]*1.15*10)/10);}}else{it.r=6;const k0=Object.keys(GSTAT).filter(k=>k!==GS[it.s].st&&!it.sub.some(z=>z[0]===k));if(k0.length){const k=k0[Math.floor(Math.random()*k0.length)];it.sub.push([k,Math.round(GSTAT[k].v[6]*.4*10)/10]);}}
    T.save();renderGear();popItem(it.id,true);const dp=gHero()&&ownerOf(it)===gHero().id?pow(gHero())-p0:0;
    T.toast(a==='star'?'★ STAR UP! '+itemName(it)+' ★'+it.sr+(dp>0?' · Power +'+dp.toLocaleString():''):'✦ ASCENDED! '+itemName(it)+' is now Ascended',2600);return;}
  if(a==='salv'&&it){if(!gsalv){gsalv=1;el.innerHTML=el.closest('.itBt')?'TAP AGAIN<small>to salvage</small>':'TAP AGAIN TO SALVAGE (+'+T.nf(salvageV(it))+' parts)';el.classList.remove('alt');el.classList.add('red');el.style.background='linear-gradient(#ff8a80,#c62828)';el.style.color='#fff';return;}
    const o=ownerOf(it);if(o)delete GR().eq[o][it.s];const g=GR();g.inv.splice(g.inv.indexOf(it),1);G.gp=(G.gp||0)+salvageV(it);T.save();closePop();renderGear();T.toast('🔨 Salvaged for '+GPN(salvageV(it)),1800);return;}
  if(a==='aok'&&h){const ov=autoPlan(h),g=GR();if(!g.eq[h.id])g.eq[h.id]={};for(const sl of GSLOT){if(ov[sl.k])equip(h.id,ov[sl.k]);else delete g.eq[h.id][sl.k];}T.save();closePop();renderGear();return;}
  if(a==='nok'&&h){GR().eq[h.id]={};T.save();closePop();renderGear();return;}
  if(a==='svok'){const g=GR(),L=(svPick||[]).filter(it=>g.inv.includes(it)&&!ownerOf(it));let sum=0;L.forEach(it=>{sum+=salvageV(it);g.inv.splice(g.inv.indexOf(it),1);});G.gp=(G.gp||0)+sum;T.save();closePop();renderGear();renderSalv();svFx(L.length,sum);return;}});

// ---------------------------------------------------------------- v14: GEAR SUMMON (blue Gear Tickets · gear works only in battles)
const GTKI='<img src="img/gticket.webp" style="height:1.15em;vertical-align:-.25em" onerror="this.replaceWith(\'🎫\')">';
const GS_RATE=[50,28,14.5,5.5,1.6,.38,.02], GS_PITY={l:500}; // v16-99 (Marius): lower rates, ASCENDED in the summon (0.02%) // v16-37: only one pity – Legendary every 500 (Marius)
const GS_NAMES=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Ascended'];
function GSD(){const g=GR();if(g.tk==null)g.tk=10;if(!g.pity)g.pity={e:0,l:0,m:0};if(!g.hist)g.hist=[];if(g.sum==null)g.sum=0;return g;}
function addGTk(n,why){const g=GSD();g.tk+=n;TE().save();if(why)TE().toast(GTKI+' +'+n+' Gear Ticket'+(n>1?'s':'')+' · '+why,2600);gsBadge();}
function gsRoll(){const g=GSD(),p=g.pity;p.e++;p.l++;p.m++;let x=Math.random()*100,r=0;for(;r<6;r++){x-=GS_RATE[r];if(x<0)break;}r=Math.min(6,r);
  if(p.l>=GS_PITY.l&&r<4)r=4;
  if(r>=4)p.l=0;return r;}
function gsummon(n,paid){const T=TE(),g=GSD();
  if(!paid&&g.tk<n){const have=g.tk;T.payAsk(have,n,GTKI,'Gear Tickets',()=>{g.tk-=have;T.G.dm-=(n-have)*T.DM_SUM;gsummon(n,1);},pop);return;}
  if(!paid)g.tk-=n;const cnt=n===10?11:1,res=[];let sold=0;
  for(let k=0;k<cnt;k++){const [r,it]=T.srun('g',()=>{const r=gsRoll();return [r,newItem(GSLOT[Math.floor(Math.random()*6)].k,r,rollSet(r))];});g.sum++; // v16-101 anti-reroll (index.html srun)
    g.hist.unshift({s:it.s,r,t:Date.now()});if(g.inv.length>=GINV){sold+=salvageV(it);res.push({it,sold:1});}else{g.inv.push(it);res.push({it});}}
  g.hist.length=Math.min(g.hist.length,60);if(sold)T.G.gp=(T.G.gp||0)+sold;if(window.EVT){EVT.add('gear',cnt);EVT.q('sum',cnt);}T.save();gsBadge();renderGSum();if(T.smRefresh)T.smRefresh();gsResults(res,n,sold);}
function gsBadge(){const b=$('cpGSB');if(b)b.innerHTML='<span>'+GTKI.replace('1.15em','1.3em')+' <b>'+GSD().tk+'</b></span><small>SUMMON</small>';}
function gsTiles(){const T=TE(),ex=['tool','helm','vest','glove','boots','chip'];
  return GS_RATE.map((p,r)=>{const i=r,fr=T.FIN[i],pl=T.FPL[i];return `<div class="gsT" data-r="${r}"><div class="fc"><img class="ff" src="img/fr${i}.webp"><img class="fp" src="${itemIconURL(ex[(r+gsTick)%6],r)}" style="left:${fr[0]}%;top:${fr[1]}%;width:${fr[2]}%;height:${fr[3]}%"><span class="fs" style="top:${pl[0]}%;height:${pl[1]}%">${p}%</span></div><b style="color:${T.GRADES[r].c}">${GS_NAMES[r]}</b></div>`;}).join('');}
let gsTick=0;
const FORGE=new Image();FORGE.src='img/ui/forge.webp';
// v15: the GEAR FORGE picture from the player + the 6 gear pictures floating over it
function gsHero(){const c=$('gsHeroCv');if(!c)return;const w=c.clientWidth||360,h=c.clientHeight||245,d=Math.min(2,devicePixelRatio||1);if(c.width!==Math.round(w*d)){c.width=Math.round(w*d);c.height=Math.round(h*d);}
  const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);const t=performance.now()/1000;x.clearRect(0,0,w,h);
  if(FORGE.complete&&FORGE.naturalWidth)x.drawImage(FORGE,0,0,w,h);else{x.fillStyle='#0d1f4a';x.fillRect(0,0,w,h);}
  const kx=w/824,ky=h/560;
  // glow pulse on the anvil
  const ax=412*kx,ay=372*ky,gl=x.createRadialGradient(ax,ay,0,ax,ay,140*kx);gl.addColorStop(0,'rgba(255,220,140,'+(.25+.15*Math.sin(t*3))+')');gl.addColorStop(1,'rgba(255,160,40,0)');x.fillStyle=gl;x.fillRect(0,0,w,h);
  const its=[['helm',4,190,272],['chip',5,329,244],['vest',3,497,220],['boots',4,640,304],['tool',5,117,384],['glove',5,714,400]];
  its.forEach(([s,r,px,py],i)=>{const sz=(i===1?120:100)*kx,yy=py*ky+Math.sin(t*1.6+i*1.3)*5;const im=gsImg(s,r);
    if(im.complete&&im.naturalWidth){x.save();x.shadowColor=['','','','#c060ff','#ffd54a','#ff1744'][r];x.shadowBlur=22;x.drawImage(im,px*kx-sz/2,yy-sz/2,sz,sz);x.restore();}});
  for(let k=0;k<26;k++){const p=(t*.35+k*.083)%1,sx=ax+Math.sin(k*7.3)*80*kx*(1-p),sy=ay-20*ky-p*h*.55;x.fillStyle='rgba(255,'+(170+(k%3)*30)+',80,'+(1-p)+')';x.fillRect(sx,sy,2.6,2.6);}}
const GSIMG={};function gsImg(s,r){const k=s+r;if(!GSIMG[k]||(!GSIMG[k].ok&&itOK(s))){const im=new Image();im.src=itemArtCv(s,r).toDataURL();im.ok=itOK(s);GSIMG[k]=im;}return GSIMG[k];}
let gsRaf=0;function gsLoop(){if(!$('gSum').classList.contains('open'))return;gsHero();gsRaf=requestAnimationFrame(gsLoop);}
function openGSum(){$('gSum').classList.add('open');renderGSum();}
function closeGSum(){$('gSum').classList.remove('open');cancelAnimationFrame(gsRaf);if(gsHome){gsHome=0;$('cpGear').classList.remove('open');close();return;}if($('cpGear').classList.contains('open'))renderGear();}
// v16-53: GEAR SUMMON on Marius' background (img/ui5/gsum_bg.webp, 1024x1536) under the GEAR SUMMON header (img/ui3/gsum_h.webp);
// box 1024 x 1836 units, background from y=300. Same idea as the HERO SUMMON page.
let GYM=null;const GSU=n=>'calc(var(--u)*'+n+')',gbx=(x,y,w,h)=>{if(GYM){const t=GYM.top(y);h=GYM.end(y+h)-t;y=t;}return 'left:'+GSU(x)+';top:'+GSU(y)+';width:'+GSU(w)+';height:'+GSU(h)+';';};
const GEMX=[143,296,446,596,744,894];
const gsMap=()=>TALL.map(1024,1836,[[958,.25],[1272,.2],[1390,.15],[1546,.15],[1642,.25]]);
function gsSize(){const b=$('gsBox');if(!b)return;TALL.size(b,gsMap());}
addEventListener('resize',()=>{if($('gSum').classList.contains('open'))renderGSum();});
function renderGSum(){const T=TE(),g=GSD(),p=g.pity,dm=T.G.dm||0;gsSize();
  const pc=Math.min(100,p.l/GS_PITY.l*100);
  const M=gsMap();GYM=M;let h=TALL.bg(M,'img/ui5/gsum_bg.webp',0,300,1024,1536,'gsBg')+'<img class="gsHd" src="img/ui3/gsum_h.webp" alt="GEAR SUMMON" style="'+gbx(0,0,1024,415)+'">';
  h+='<div data-gs="back" style="'+gbx(26,62,112,108)+'border-radius:50%"></div>';
  h+='<div class="gsL gsTkN" data-gs="rates" style="'+gbx(803,97,196,56)+'">'+GTKI+' '+g.tk+'</div>';
  h+='<div class="gsL" style="'+gbx(318,160,384,50)+'font-size:'+GSU(26)+';color:#9fd3ff">FOR BATTLES ONLY</div>';
  h+='<div class="gsL gsDm" style="'+gbx(812,190,186,88)+'">'+T.DMI+' '+dm.toLocaleString()+'</div>';
  h+='<div class="gsL" style="'+gbx(190,855,640,80)+'font-size:'+GSU(40)+'">AVAILABLE GEAR</div><div data-gs="rates" style="'+gbx(890,853,84,84)+'border-radius:50%"></div>';
  GEMX.forEach((x,r)=>{h+='<div class="gsL gsRt" style="'+gbx(x-75,1176,150,34)+'color:'+T.GRADES[r].c+'">'+GS_RATE[r]+'%</div><div data-gs="rates" style="'+gbx(x-72,995,144,215)+'"></div>';});
  // v16-89 (Marius): the 3 plates = the 3 summons (HERO · CREW · GEAR); Rate Info = (i) button + tiles, History inside Rate Info
  [['hsum','HERO','img/ticket.webp',45,280],['csum','CREW','img/cticket.webp',365,295],['','GEAR','img/gticket.webp',700,290]].forEach(([a,n,ic,x,w])=>{
    h+='<div class="gsL gsPl gsTab'+(a?'':' on')+'" data-gs="'+(a||'on')+'" style="'+gbx(x,1285,w,90)+'"><img src="'+ic+'" alt="">'+n+'</div>';});
  h+='<div class="gsL gsBig'+(g.tk<1&&dm<T.DM_SUM?' dis':'')+'" data-gs="1" style="'+gbx(45,1405,445,125)+'">SUMMON ×1<span>'+GTKI+' 1</span></div>';
  h+='<div class="gsL gsBig gold'+(g.tk+Math.floor(dm/T.DM_SUM)<10?' dis':'')+'" data-gs="10" style="'+gbx(530,1400,400,130)+'">SUMMON ×10<span>'+GTKI+' 10</span></div>';
  h+='<div class="gsL gsRib" style="'+gbx(868,1412,72,40)+'">+1</div>';
  h+='<i class="gsFill" style="'+gbx(99,1570,Math.max(pc?54:0,832*pc/100).toFixed(1),47)+'"></i>';
  h+='<div class="gsL" style="'+gbx(90,1562,850,63)+'font-size:'+GSU(28)+'">LEGENDARY PITY&nbsp;<b style="color:#ffd54a">'+p.l+' / '+GS_PITY.l+'</b></div>';
  h+='<div class="gsL gsCol" data-gs="gear" style="'+gbx(150,1660,725,135)+'">BAG '+g.inv.length+' / '+GINV+'<small>EQUIP YOUR HEROES</small></div>';
  GYM=null;$('gsBox').innerHTML=h;}
function gsResults(res,n,sold){const T=TE(),best=Math.max(...res.map(o=>o.it.r));
  let x=`<h2 style="color:${GG(best).c}">${best>=5?'MYTHIC GEAR!':best>=4?'LEGENDARY GEAR!':'GEAR SUMMONED'}</h2><div class="sub">${res.length} item${res.length>1?'s':''}${n===10?' · +1 BONUS':''}</div>
   <div class="gsRes">${res.map((o,k)=>`<div class="gsR r${o.it.r}" style="animation-delay:${k*.12}s">${itemCard(o.it,`<i style="color:${GG(o.it.r).c}">${GG(o.it.r).n}</i><i>${itemName(o.it)}</i>${o.sold?'<i style="color:#ff8a80">bag full – sold</i>':''}`)}</div>`).join('')}</div>
   ${sold?`<div class="sub">Bag full (${GINV}) – extra gear salvaged for ${GPN(sold)}</div>`:''}
   <div class="cpRow"><button class="cpGo${GSD().tk+Math.floor((TE().G.dm||0)/TE().DM_SUM)<n?' dis':''}" data-p="gsAgain" data-n="${n}">AGAIN x${n} ${GTKI}</button><button class="cpGo alt" data-p="gsGear">${IMGI(glyphURL('bag','#ffd9b0'))} EQUIP</button></div><button class="cpGo alt" data-p="x">CLOSE</button>`;
  pop(x);}
function gsRates(){const T=TE();popW('SUMMON RATES','<div class="wS">GEAR · FOR BATTLES ONLY</div>'+GS_RATE.map((p,r)=>wRowB(r,'<b style="color:'+GG(r).c+'">'+GS_NAMES[r]+'</b>',p+'%','Lv '+GMAXR[r]+(GSUBN[r]?' · +'+GSUBN[r]+' stat'+(GSUBN[r]>1?'s':''):''))).join('')+
  `<div class="wP"><div>Every summon gives 1 random gear piece (Tool, Helmet, Work Vest, Gloves, Boots or ECU Chip).</div><div><b>Summon x10</b> gives <b>11</b> pieces.</div><div>Guaranteed: a <b>Legendary</b> every ${GS_PITY.l} summons (no other pity).</div><div>★ <b>Stars</b>: merge 2 identical pieces (same slot + same grade) → ★1…★5, each star +20% main stat.</div><div style="color:#2ef3ff">✦ <b>Ascended</b> (above Mythic): 0.02% in the summon, Ascend a Mythic ★5, or find it in campaign chapters 30-50. Ascended pieces go up to <b>★20</b>: every 5 stars a new star color (gold → red → purple → rainbow) + a new bonus stat.</div><div>No tickets? <b>${T.DM_SUM}</b> ${T.DMI} = 1 summon – you are always asked first.</div></div>
  <div class="wS">WHERE TO GET ${GTKI} GEAR TICKETS</div><div class="wP">First clear of every campaign stage: <b>+1</b> · mini-boss (X-10): <b>+3</b> · boss (X-20): <b>+5</b> · Daily Check-in: <b>+10</b> every day<br>Start: 10 tickets.</div><button class="wHist" data-p="gsHist">📜 SUMMON HISTORY</button>`);}
function gsHist(){const T=TE(),g=GSD();popW('SUMMON HISTORY','<div class="wS">Last '+g.hist.length+' of '+g.sum+' gear summons</div>'+(g.hist.length?g.hist.map(o=>wRowB(o.r,'<img src="'+itemIconURL(o.s,o.r)+'" alt=""> <b style="color:'+GG(o.r).c+'">'+GNAMES[o.s][o.r]+'</b>',null,GS_NAMES[o.r])).join(''):'<div class="wP">Nothing yet.</div>'));}

// ---------------------------------------------------------------- v16-54: TORQUE TOWER (Marius' pictures in img/ui6/tw_*)
// 300 floors · one fight per floor · FIXED rewards (first clear only, nothing random) · boss every 10 floors (mini-boss X10, big boss X20)
// most floors have a modifier · monsters are picked (seeded = always the same per floor) from all of Marius' monsters.
// Strength: floor f fights like campaign stage ≈ 3 + 3.2·f (floor 300 ≈ stage 50-15). Saved in G.tw = {b: floors cleared}.
const TW_N=300,TW_UNLOCK=10;
const TW_REG=['imp','tire','snake','drone','spider','brute','battery','canister','wiper','hubcap','horn','turbo','gearbox','bat','wraith','brake','airbag'];
const TW_MINI=['crusher','sludge','frost','neonc','magma'],TW_BOSS=['titan','tanker','plow','wyrm','omega'];
const TW_MOD=[
 {k:'rage',n:'RAGE',d:'Enemies deal <b>+30%</b> damage.'},
 {k:'armor',n:'IRON PLATING',d:'Enemies have <b>+60%</b> defense and <b>+15%</b> HP.'},
 {k:'speed',n:'OVERDRIVE',d:'Enemies move <b>25%</b> faster and attack <b>15%</b> faster.'},
 {k:'burn',n:'HOT FLOOR',d:'Your heroes lose <b>0.6%</b> of their max HP every second.'},
 {k:'noheal',n:'NO REPAIRS',d:'Your heroes <b>cannot be healed</b> (skills, potions and between waves).'},
 {k:'crit',n:'SHARP EDGES',d:'Enemies get <b>+25%</b> critical chance.'}];
const TWS={ret:0};root.appendChild($('tw'));root.appendChild($('cpPop')); // #cpPop too, so its windows also show over the tower page // (the #tw div sits in the HTML after #gSum, which is inside #cpGear → move it to the top level)
function twModMon(m){const k=B.mod;if(k==='rage')m.atk*=1.3;else if(k==='armor'){m.def*=1.6;m.hp*=1.15;m.max*=1.15;}else if(k==='speed'){m.mv*=1.25;m.as*=.85;}else if(k==='crit')m.crit+=.25;}
function twFloor(f){const R=seeded(5003+f*97),pk=a=>a[Math.floor(R()*a.length)],act=Math.min(9,Math.floor((f-1)/30)),cl=k=>act?monClone(k,act):k;
  const pool=[];while(pool.length<4){const m=pk(TW_REG);if(!pool.includes(m))pool.push(m);}
  const n=Math.min(5,3+Math.floor(f/45)),one=()=>cl(pk(pool)),mk=k=>{const w=[];for(let i=0;i<k;i++)w.push(one());return w;};
  const boss=f%20===0,mini=f%20===10;let w;
  if(boss)w=[mk(n),[cl(TW_BOSS[(f/20-1)%5])]];
  else if(mini)w=[mk(n),[cl(TW_MINI[((f-10)/20)%5]),one(),one()]];
  else if(f%5===0)w=[mk(n),mk(n),mk(Math.min(5,n+1))];
  else w=[mk(n),mk(Math.min(5,n+(f%2)))];
  const mod=f<=5?-1:(boss||mini||R()<.6)?Math.floor(R()*6):-1;
  const eq=Math.min(NST-1,Math.round(3+f*3.2));
  const mul=stageMul0(eq)*(boss?.78:mini?.9:1)*(mod>=0?.92:1);
  return {f,w,mod,eq,mul,boss,mini,st:{n:'FLOOR '+f+(mod>=0?' · '+TW_MOD[mod].n:''),bio:18,w,boss,mini}};}
const EGI=r=>{const T=TE(),a=[];if(r.ess)a.push(T.ESI+' '+T.nf(r.ess));if(r.gp)a.push(T.GPI+' '+T.nf(r.gp));return a;}; // v16-99
const giveEG=r=>{const G=TE().G;if(r.ess)G.ess=(G.ess||0)+r.ess;if(r.gp)G.gp=(G.gp||0)+r.gp;};
function twRew(f){const F=twFloor(f),r={money:REWARD(F.eq).money,dm:5,tk:0,gtk:0,ct:0};
  if(f%5===0)r.tk=2;if(f%10===0){r.dm=100;r.gtk=3;r.ct=1;}if(f%50===0)r.dm+=400;const T=TE(),x=f%10===0?3:1;r.ess=Math.round(.8*x*T.ESS_U());r.gp=Math.round(x*T.GP_U());return r;}
const twG=()=>{const G=TE().G;if(!G.tw)G.tw={b:0};return G.tw;};
const twOK=()=>TE().G.cp.best>=TW_UNLOCK;
const TWA={};function twArenaImg(){const k=B&&B.tw&&B.tw.wb?'wb':B&&B.tw&&B.tw.dg?'dg_'+B.tw.dg:'im';if(!TWA[k]){TWA[k]=new Image();TWA[k].decoding='async';TWA[k].src=k==='wb'?'img/wb/wb_arena.webp':k.startsWith('dg_')?'img/dg/bt_'+k.slice(3)+'.webp':'img/ui6/tw_arena.webp';}return TWA[k];}
function twPower(f){const F=twFloor(f);let p=0;F.w.forEach(w=>w.forEach(t=>{const M=MON[t];p+=(M.hp*.25+M.atk*6+M.def*4)*F.mul;}));return Math.round(p/F.w.length*1.05*(F.mod>=0?1.12:1));}
function twRewHtml(r,big){const T=TE(),a=EGI(r);if(r.dm)a.push(T.DMI+' '+r.dm);if(r.gtk)a.push(GTKI+' '+r.gtk);if(r.tk)a.push(TKI+' '+r.tk);if(r.ct)a.push('<img src="img/cticket.webp" alt=""> '+r.ct);if(big)a.push('<img src="img/ui2/i_coins.webp" alt=""> '+T.fmt(r.money));return '<span class="twRw">'+a.join(' &nbsp;')+'</span>';}
const twMap=()=>TALL.map(1024,1786,[[1100,1]]);
function twSize(){const b=$('twBox');if(!b)return;TALL.size(b,twMap());}
addEventListener('resize',()=>{if($('tw').classList.contains('open'))twRender();});
// box 1024 x 1786 units: title 0-346, background from y=250 (panel inside = 56..970 x 852..1334)
function twRender(){const T=TE(),t=twG(),cur=Math.min(TW_N,t.b+1),done=t.b>=TW_N;twSize();
  const M=twMap();GYM=M;let h=TALL.bg(M,'img/ui6/tw_bg.webp',0,250,1024,1536,'gsBg')+'<img class="gsHd" src="img/ui6/tw_h.webp" alt="TORQUE TOWER" style="'+gbx(0,0,1024,346)+'">';
  h+='<button class="cpB twBk" data-tw="back" style="'+gbx(18,18,96,96)+'">↩</button>';
  h+='<div class="gsL twRec" style="'+gbx(262,712,500,70)+'">RECORD&nbsp;<b>'+t.b+'</b>&nbsp;/ '+TW_N+'</div>';
  h+='<div class="twList" id="twList" style="'+gbx(56,858,914,470)+'">';
  const lo=Math.max(1,cur-12),hi=Math.min(TW_N,cur+12);
  for(let f=hi;f>=lo;f--){const F=twFloor(f),r=twRew(f),st=f<=t.b?3:f===cur&&!done?1:F.boss||F.mini?2:4,boss=F.boss||F.mini;
    const ttl=boss&&st!==3?(F.boss?'BOSS':'MINI-BOSS'):'FLOOR '+f;
    h+='<div class="twRow s'+st+(f===cur?' cur':'')+'" data-f="'+f+'"><img class="twPl" src="img/ui6/tw_f'+(st===3?3:st===1?1:boss?2:st===4?4:0)+'.webp" alt="">'+
      (st===2&&boss?'':'<b class="twN">'+f+'</b>')+'<div class="twT"><b>'+(boss&&st!==3?'FLOOR '+f+' · <i>'+ttl+'</i>':ttl)+'</b><span>'+(st===3?'CLEARED':twRewHtml(r))+'</span></div>'+
      (F.mod>=0&&st!==3?'<img class="twMd" data-md="'+F.mod+'" src="img/ui6/tw_m'+F.mod+'.webp" alt="'+TW_MOD[F.mod].n+'">':'')+'</div>';}
  h+='</div>';
  const F=twFloor(cur),pw=twPower(cur),my=teamPower(curTeamList().filter(Boolean));
  h+='<div class="gsL twB" data-tw="rew" style="'+gbx(70,1418,410,120)+'">REWARDS</div>';
  h+='<div class="gsL twB gold" data-tw="team" style="'+gbx(550,1418,410,120)+'">HEROES</div>';
  h+='<div class="gsL gsBig gold twGo'+(done?' dis':'')+'" data-tw="go" style="'+gbx(170,1585,684,124)+'">'+(done?'TOWER CLEARED!':'CHALLENGE · FLOOR '+cur)+(done?'':'<span style="color:'+(my>=pw*1.15?'#7CFC9A':my>=pw*.85?'#ffd54a':'#ff8a80')+'">⚡ '+my.toLocaleString()+' vs '+pw.toLocaleString()+(my>=pw*1.15?' · EASY':my>=pw*.85?' · EVEN':' · HARD')+'</span>')+'</div>';
  GYM=null;$('twBox').innerHTML=h;
  const L=$('twList'),c=L.querySelector('.cur');if(c)L.scrollTop=c.offsetTop-L.clientHeight/2+c.offsetHeight/2;}
function twOpen(){if(!twOK()){TE().toast('🔒 TORQUE TOWER opens after campaign stage 1-10',2600);return;}
  if(!root.classList.contains('open')){root.classList.add('open');window.__BATTLE_ON=true;showMap();}
  twArenaImg();$('tw').classList.add('open');twRender();}
function twClose(){$('tw').classList.remove('open');if(!backToHub())close();}
function twMilestones(){const T=TE(),t=twG();let x='<div class="wS">FIXED REWARDS · FIRST CLEAR OF EACH FLOOR</div><div class="wP"><div>Every floor: '+T.DMI+' <b>5</b> + coins</div><div>Every 5th floor: + '+TKI+' <b>2</b></div><div>Every 10th floor (boss): '+T.DMI+' <b>100</b> · '+GTKI+' <b>3</b> · <img src="img/cticket.webp" alt="" style="height:1.2em;vertical-align:-.28em"> <b>1</b></div><div>Every 50th floor: + '+T.DMI+' <b>400</b></div><div>Nothing is random. Each floor gives its reward only once.</div></div><div class="wS">NEXT BIG FLOORS</div>';
  for(let f=Math.ceil((t.b+1)/10)*10,k=0;f<=TW_N&&k<6;f+=10,k++)x+=wRowB(f%50===0?5:f%20===0?4:3,'<b>FLOOR '+f+'</b> '+(f%20===0?'BOSS':'MINI-BOSS'),null,twRewHtml(twRew(f)));
  x+='<div class="wS">MODIFIERS</div>'+TW_MOD.map((m,i)=>'<div class="wP twMP"><img src="img/ui6/tw_m'+i+'.webp" alt=""><span><b>'+m.n+'</b><br>'+m.d+'</span></div>').join('');
  popW('TORQUE TOWER',x);}
function twFloorInfo(f){const T=TE(),F=twFloor(f),t=twG(),types=[...new Set(F.w.flat())];
  let x='<div class="wS">FLOOR '+f+' · '+F.w.length+' WAVES</div><div class="wP">'+types.map(k=>MON[k].n).join(' · ')+'</div>';
  if(F.mod>=0)x+='<div class="wS">MODIFIER</div><div class="wP twMP"><img src="img/ui6/tw_m'+F.mod+'.webp" alt=""><span><b>'+TW_MOD[F.mod].n+'</b><br>'+TW_MOD[F.mod].d+'</span></div>';
  x+='<div class="wS">'+(f<=t.b?'CLEARED':'FIRST CLEAR REWARD')+'</div><div class="wP">'+twRewHtml(twRew(f),1)+'</div><div class="wP">Enemy power ⚡ '+twPower(f).toLocaleString()+'</div>';
  popW('FLOOR '+f,x);}
// v16-99 (Marius): before every battle you can change the team
function mainCX(t,ep,go,back){const T=TE();return {t,ep,go,back,pool:()=>[...myMechs(),...[0,1,2,3,4].map(crewHero)],get:()=>curTeamList().map(h=>h.id),set:ids=>{T.G.cp.team=ids;},best:bestTeam};}
function twGo(direct){const t=twG();if(t.b>=TW_N)return;const f=t.b+1;if(direct===true)return twGo0(teamHeroes());$('tw').classList.remove('open');openTeam(twFloor(f).eq,mainCX('TORQUE TOWER · FLOOR '+f,()=>twPower(f),twGo0,twOpen));}
function twGo0(team){const t=twG();if(t.b>=TW_N)return;if(!team||!team.length)team=bestTeam().map(heroOf);
  const F=twFloor(t.b+1);$('tw').classList.remove('open');try{teamHeroes().forEach(h=>{const d=sprOf(h);if(d)sprLoad(d);});}catch(e){}safeStart(F.eq,team,F);}
function twFinish(win,retreat){if(B.tw.wb)return wbFinish(win,retreat);if(B.tw.dg)return dgFinish(win,retreat);if(B.tw.ct)return ctFinish(win,retreat);const T=TE(),G=T.G,t=twG(),F=B.tw,f=F.f;let html;
  if(win&&f===t.b+1){const r=twRew(f);t.b=f;G.money+=r.money;giveEG(r);if(r.dm)G.dm=(G.dm||0)+r.dm;if(r.gtk)GSD().tk+=r.gtk;if(r.ct)G.h.ct+=r.ct;T.save();if(r.tk)T.addTickets(r.tk,'Tower floor '+f);
    const rws=[[`<img src="img/ui2/i_coins.webp">`,T.fmt(r.money)],[T.DMI,'+'+r.dm]];if(r.gtk)rws.push([GTKI,'+'+r.gtk]);if(r.tk)rws.push([TKI,'+'+r.tk]);if(r.ct)rws.push(['<img src="img/cticket.webp">','+'+r.ct]);
    html=`<div class="rsV"><img class="hi" src="img/ui2/victory.webp" alt="VICTORY"><div class="rsL">TORQUE TOWER · FLOOR ${f}<small>${f>=TW_N?'THE TOWER IS CLEARED!':'FLOOR '+(f+1)+' IS OPEN'}</small></div>
      ${rws.slice(0,4).map((q,k)=>`<div class="rsS" style="left:${[10.7,31.3,51.6,72][k]}%">${q[0]}<b>${q[1]}</b></div>`).join('')}
      <div class="rsU">${rws.length>4?rws.slice(4).map(q=>q[0]+' '+q[1]).join(' · ')+' · ':''}Record: floor ${t.b} / ${TW_N}</div></div>
      <div class="rsM"><div class="cpRow">${f<TW_N?'<button class="cpGo" data-a="twnext">NEXT FLOOR ▶</button>':''}<button class="cpGo alt" data-a="tw">TOWER</button></div></div>`;}
  else{html=`<div class="rsD"><img class="hi" src="img/ui2/defeat.webp" alt="DEFEAT">${retreat?'<div class="rsR">RETREAT</div>':''}<div class="rsL">TORQUE TOWER · FLOOR ${f}<small>HOW TO GET STRONGER – tap one</small></div>
      <div class="rsDB b0" data-a="gear"><img src="img/ui2/i_forge.webp"><span><b>Equip & upgrade gear</b>works only in battles</span></div>
      <div class="rsDB b1" data-a="hsum">${TKI}<span><b>Summon more mechanics</b>higher color = much stronger · duplicates +1 star</span></div>
      <div class="rsDB b2" data-a="team"><img src="img/ui2/i_star1.webp"><span><b>Better team & skills</b>${F.mod>=0?'this floor: '+TW_MOD[F.mod].n:'Essence → LEVEL UP · Ascension'}</span></div>
      <button class="rsGo" data-a="twretry">RETRY</button></div>
      <div class="rsM"><div class="cpRow"><button class="cpGo alt" data-a="team">${IMGI('img/ui2/i_star1.webp','1.3em','-.35em')} HEROES</button><button class="cpGo alt" data-a="tw">TOWER</button></div></div>`;}
  $('cpResBox').classList.add('rsSk');$('cpResBox').innerHTML=html;$('cpRes').classList.add('open');$('cpResBox').scrollTop=0;clearInterval(ANX.id);
  $('cpResBox').onclick=e=>{const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;$('cpRes').classList.remove('open');$('bt').classList.remove('open');
    if(a==='twnext'||a==='twretry')twGo(true);else if(a==='team'){showMap();TWS.ret=1;openGear();}else if(a==='gear'){showMap();TWS.ret=1;openGear();}
    else if(a==='hsum'){showMap();TWS.ret=1;openGear();const T2=TE();if(T2.openSummon){const sm=document.getElementById('sm');if(sm)sm.style.zIndex=30;T2.openSummon('m');}}else{showMap();twOpen();}};}
$('tw').addEventListener('click',e=>{const md=e.target.closest('[data-md]');if(md){twMilestones();return;}const el=e.target.closest('[data-tw]');
  if(el){const a=el.dataset.tw;if(a==='back')twClose();else if(a==='rew')twMilestones();else if(a==='team'){$('tw').classList.remove('open');TWS.ret=1;openGear();}else if(a==='go')twGo();return;}
  const row=e.target.closest('.twRow');if(row)twFloorInfo(+row.dataset.f);});
const twCss=document.createElement('style');twCss.textContent=`
#tw{position:fixed;inset:0;z-index:8;display:none;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 30%,#16264d,#05070c 75%)}#tw.open{display:flex}
#twBox{position:relative;--u:.35px;overflow:hidden;border-radius:calc(var(--u)*18);background:#0a1322}#twBox>*{position:absolute}
#twBox .twBk{min-width:0;padding:0;border-radius:50%;font-size:calc(var(--u)*46);z-index:2}
.twRec{font-size:calc(var(--u)*34);border-radius:calc(var(--u)*40);background:linear-gradient(#0d1a33e6,#05081ae6);box-shadow:0 0 0 calc(var(--u)*3) #e0aa25,0 calc(var(--u)*6) calc(var(--u)*14) #000a}.twRec b{color:#ffd54a;font-size:1.25em}
.twList{overflow-y:auto;overflow-x:hidden;touch-action:pan-y;padding:calc(var(--u)*6) 0;-webkit-mask:linear-gradient(#0000,#000 4%,#000 96%,#0000);mask:linear-gradient(#0000,#000 4%,#000 96%,#0000)}
.twRow{position:relative;height:calc(var(--u)*118);margin:0 auto calc(var(--u)*4);width:calc(var(--u)*900)}
.twRow.s4{opacity:.82}
.twPl{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}
.twN{position:absolute;left:calc(var(--u)*28);top:calc(var(--u)*27);width:calc(var(--u)*118);height:calc(var(--u)*64);display:flex;align-items:center;justify-content:center;font:900 italic calc(var(--u)*40) system-ui;color:#fff;text-shadow:0 calc(var(--u)*3) 0 #000}
.twRow.s1 .twN{color:#ffd54a}.twRow.s4 .twN{color:#9aa4b1}
.twT{position:absolute;left:calc(var(--u)*190);right:calc(var(--u)*150);top:calc(var(--u)*18);bottom:calc(var(--u)*18);display:flex;flex-direction:column;justify-content:center;gap:calc(var(--u)*4);overflow:hidden}
.twT b{font:900 italic calc(var(--u)*34) system-ui;color:#fff;text-shadow:0 calc(var(--u)*3) 0 #000;white-space:nowrap}.twT b i{color:#ff8a65}
.twRow.s1 .twT b{color:#ffe082}.twRow.s3 .twT b{color:#cfd8dc}
.twT span{font:900 calc(var(--u)*30) system-ui;color:#d7e3ff;white-space:nowrap;display:flex;align-items:center;gap:calc(var(--u)*4)}.twT span img{height:1.35em!important;width:auto;vertical-align:middle}
.twRow.s3 .twT span{color:#7CFC9A;font-weight:900}
.twMd{position:absolute;right:calc(var(--u)*26);top:calc(var(--u)*16);width:calc(var(--u)*84);height:calc(var(--u)*84);filter:drop-shadow(0 calc(var(--u)*3) calc(var(--u)*4) #000)}
.twRow.s4 .twMd{right:calc(var(--u)*130)}
.twB{font-size:calc(var(--u)*40)}.twB.gold{color:#3a1d00;text-shadow:0 calc(var(--u)*2) 0 #fff7}
.twGo{font-size:calc(var(--u)*44)}
.twRw img{height:1.35em!important;width:auto!important;vertical-align:-.3em}.twMP{display:flex;align-items:center;gap:10px;text-align:left}.twMP img{width:44px;height:44px;flex:none}.twGo span{font-size:.6em}
`;document.head.appendChild(twCss);
// button on the garage map (left menu, under ARENA)
function twBtn(){const sd=$('side');if(!sd||$('twBtn'))return;const b=document.createElement('button');b.id='twBtn';b.innerHTML='<img src="img/ui6/tw_ic.webp" alt="Tower">';b.onclick=()=>twOpen();
  const ar=$('arBtn'),cp=$('cpBtn'),ref=ar||cp;if(ref&&ref.nextSibling)sd.insertBefore(b,ref.nextSibling);else sd.appendChild(b);}
setTimeout(twBtn,0);setTimeout(()=>{const b=$('twBtn'),ar=$('arBtn');if(b&&ar&&ar.nextSibling!==b)ar.parentNode.insertBefore(b,ar.nextSibling);else twBtn();},1500);

// ---------------------------------------------------------------- v16-55: BATTLE HUB + CLASS TOWERS (Marius' pictures in img/ui7/)
// BATTLE button on the map → one page with all battle modes (Campaign · Arena · Torque Tower · Class Towers · Torque Cup · Coming soon).
// The separate ARENA / TOWER buttons on the map are gone (fewer icons on the main page).
const HUBS={from:0};
const hubEl=document.createElement('div');hubEl.id='hub';hubEl.innerHTML='<div id="hubBox"></div>';root.appendChild(hubEl);
const ctEl=document.createElement('div');ctEl.id='ct';ctEl.innerHTML='<div id="ctBox"></div>';root.appendChild(ctEl);
function boxSize(id,w,h){const b=$(id);if(!b)return;const k=Math.min(innerWidth/w,innerHeight/h);b.style.width=w*k+'px';b.style.height=h*k+'px';b.style.setProperty('--u',k+'px');}
// v16-56: the hub / class-tower pages fill the WHOLE phone screen. The pictures are 2:3 (ChatGPT's tallest size), a phone is ~9:20,
// so the box is as wide as the screen and HX design-units taller than 1536: the empty asphalt in the middle of hub_bg is extended
// with hub_mid.webp (a mirrored strip of it, repeats without a seam) and the buttons/cards are spread over the extra height.
let HX=0;
function tallBox(id){const b=$(id);if(!b)return 0;const k=innerWidth/1024,H=innerHeight/k;
  if(H<1536){b.classList.remove('tall');boxSize(id,1024,1536);return HX=0;}
  b.classList.add('tall');b.style.width=innerWidth+'px';b.style.height=innerHeight+'px';b.style.setProperty('--u',k+'px');return HX=H-1536;}
function tallBg(){if(HX<=0)return '<img class="hubBg" src="img/ui7/hub_bg.webp" alt="" style="'+gbx(0,0,1024,1536)+'">';
  const S=760,bg='url(img/ui7/hub_bg.webp) 0 ';
  return '<div class="hubBg" style="'+gbx(0,0,1024,S+2)+'background:'+bg+'0/'+GSU(1024)+' '+GSU(1536)+' no-repeat"></div>'+
    '<div class="hubBg" style="'+gbx(0,S,1024,HX+4)+'background:url(img/ui7/hub_mid.webp) 0 0/'+GSU(1024)+' '+GSU(280)+' repeat-y"></div>'+
    '<div class="hubBg hbF" style="'+gbx(0,S+HX,1024,1536-S)+'background:'+bg+GSU(-S)+'/'+GSU(1024)+' '+GSU(1536)+' no-repeat"></div>';}
addEventListener('resize',()=>{if(hubEl.classList.contains('open'))hubRender();if(ctEl.classList.contains('open'))ctRender();});
function rootOn(){if(!root.classList.contains('open')){root.classList.add('open');window.__BATTLE_ON=true;showMap();}}
// v16-58: bigger tabs (Marius: "too small, too much empty space"). The banners are 1100×~143, already as wide as the page, so a
// taller tab = the banner cut in 3: left title block + right frame end at the same scale, the middle art cropped around cx (no stretching).
const HUBM=[
 {k:'camp',im:'m_camp',sh:160,cx:600},{k:'arena',im:'m_arena',sh:143,cx:670},{k:'tower',im:'m_tower',sh:144,cx:600},
 {k:'class',im:'m_class',sh:143,cx:735},{k:'cup',im:'m_cup',sh:144,cx:690},{k:'boss',full:'img/wb/m_boss.webp',ar:1100/250},{k:'dg',full:'img/dg/m_dg.webp',ar:1100/255}]; // v16-60: WORLD BOSS in place of COMING SOON (Marius' banner, shown whole)
const HUB_L=395,HUB_R=46,HUB_W=1012;
function hubTab(m,hh){const f=hh/m.sh,u='url(img/ui7/'+m.im+'.webp)',L=HUB_L*f,R=HUB_R*f,M=HUB_W-L-R,full=1100*f,
    px=Math.min(-HUB_L*f,Math.max(M-(1100-HUB_R)*f,M/2-m.cx*f)); // background x of the middle part: src cx in its centre, never past the title or the frame end
  return '<i class="hubP" style="left:0;width:'+GSU(L+1)+';background:'+u+' 0 0/'+GSU(full)+' 100% no-repeat"></i>'+
    '<i class="hubP" style="left:'+GSU(L)+';width:'+GSU(M+1)+';background:'+u+' '+GSU(px)+' 0/'+GSU(full)+' 100% no-repeat"></i>'+
    '<i class="hubP" style="right:0;width:'+GSU(R)+';background:'+u+' 100% 0/'+GSU(full)+' 100% no-repeat"></i>';}
function hubRender(){const T=TE(),G=T.G;tallBox('hubBox');
  let h=tallBg()+'<button class="cpB hubBk" data-hb="back" style="'+gbx(18,18,96,96)+'">↩</button>';
  const st={camp:'STAGE '+sLabel(Math.min(G.cp.best,NST-1)),arena:'PvP · ONLINE',tower:twOK()?'FLOOR '+Math.min(TW_N,twG().b+1)+' / '+TW_N:'🔒 STAGE '+sLabel(TW_UNLOCK),
    class:ctOK()?'TODAY: '+ctToday().map(k=>ROLE[k].n.toUpperCase()).join(' · '):'🔒 STAGE '+sLabel(CT_UNLOCK),cup:'EVERY WEEKEND',soon:'',
    boss:wbOK()?WBOSS[wbCur()].n+' · KEYS '+wbKeys()+'/'+WB_KEYS:'🔒 STAGE '+sLabel(WB_UNLOCK-1),
    dg:dgOK()?'KEYS '+DG_K.reduce((a,k)=>a+dgKeys(k),0)+'/'+DG_K.length*dgMax():'🔒 STAGE '+sLabel(DG_UNLOCK)};
  const top=285,avail=1536+HX-(HX>0?250:20)-top,n=HUBM.length,ex=m=>m.full?1.3:m.k==='camp'?1.08:1,
    hh=Math.max(118,Math.min(190,(avail-(n-1)*30)/HUBM.reduce((a,m)=>a+ex(m),0))),ths=HUBM.map(m=>m.full?Math.min(HUB_W/m.ar,hh*ex(m)):hh*ex(m)),sum=ths.reduce((a,b)=>a+b,0),
    gap=Math.max(10,Math.min(70,(avail-sum)/(n-1)));let y=top+Math.max(0,(avail-sum-(n-1)*gap)*.4);
  HUBM.forEach((m,i)=>{const th=ths[i],lock=(m.k==='tower'&&!twOK())||(m.k==='class'&&!ctOK())||(m.k==='boss'&&!wbOK())||(m.k==='dg'&&!dgOK()),bw=m.full?Math.min(HUB_W,th*m.ar):HUB_W;
    h+='<div class="hubM'+(lock?' lk':'')+'" data-hb="'+m.k+'" style="'+gbx((1024-bw)/2,y,bw,th)+'">'+(m.full?'<img src="'+m.full+'" alt="">':hubTab(m,th))+(st[m.k]?'<b class="hubS">'+st[m.k]+'</b>':'')+'</div>';y+=th+gap;});
  $('hubBox').innerHTML=h;}
function hubOpen(){HM=0;rootOn();HUBS.from=0;hubEl.classList.add('open');hubRender();}
function hubClose(){hubEl.classList.remove('open');close();}
function hubGo(k){if(k==='back'){hubClose();return;}
  if(k==='soon'){TE().toast('🔒 New battle modes are coming soon!',2200);return;}
  if(k==='tower'&&!twOK()){TE().toast('🔒 TORQUE TOWER opens after campaign stage '+sLabel(TW_UNLOCK),2600);return;}
  if(k==='class'&&!ctOK()){TE().toast('🔒 CLASS TOWERS open after campaign stage '+sLabel(CT_UNLOCK),2600);return;}
  if(k==='boss'&&!wbOK()){TE().toast('🔒 WORLD BOSS opens after campaign stage '+sLabel(WB_UNLOCK-1),2600);return;}
  if(k==='dg'&&!dgOK()){TE().toast('🔒 DUNGEONS open after campaign stage '+sLabel(DG_UNLOCK),2600);return;}
  hubEl.classList.remove('open');HUBS.from=1;
  if(k==='boss'){wbOpen();return;}
  if(k==='dg'){dgOpen();return;}
  if(k==='camp')return;                       // the campaign map is already under the hub
  if(k==='tower'){twOpen();return;}
  if(k==='class'){ctOpen();return;}
  if(k==='arena'||k==='cup'){close();HUBS.from=0;if(window.ONLINE)ONLINE.open(k==='arena'?'olArena':'olCupS');}}
hubEl.addEventListener('click',e=>{const el=e.target.closest('[data-hb]');if(el)hubGo(el.dataset.hb);});
// back from a mode that was opened from the hub → the hub again
function backToHub(){if(HUBS.from){HUBS.from=0;hubEl.classList.add('open');hubRender();return true;}return false;}

// ---- CLASS TOWERS: one tower per class (Bruiser · Racer · Scanner · Medic · Sprayer · Shocker), 100 floors each,
// only heroes of that class (+ Legend heroes) may fight. Each tower is open on 2 days a week, Sunday all are open.
// FIXED rewards on the first clear (nothing random): 💎 + coins every floor, a SET PIECE of that class every 5th floor
// (slot in a fixed order, grade Rare → Epic → Legendary → Mythic), 💎 + gear ticket every 10th. Saved in G.ct = {class: floors cleared}.
const CT_K=['engine','tuning','inspect','service','paint','elec'],CT_N=100,CT_UNLOCK=20;
const CT_DAYS={engine:[1,4],tuning:[1,4],inspect:[2,5],service:[2,5],paint:[3,6],elec:[3,6]};
const DAYN=['SUN','MON','TUE','WED','THU','FRI','SAT'],DAYL=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
const ctOK=()=>TE().G.cp.best>=CT_UNLOCK;
const ctDay=()=>new Date().getDay();
const ctOpenK=k=>ctDay()===0||CT_DAYS[k].includes(ctDay());
const ctToday=()=>CT_K.filter(ctOpenK);
const ctG=()=>{const G=TE().G;if(!G.ct)G.ct={};CT_K.forEach(k=>{if(!G.ct[k])G.ct[k]=0;});return G.ct;};
const CTS={k:null};
function ctFloor(k,f){const ci=CT_K.indexOf(k),R=seeded(7001+ci*1009+f*97),pk=a=>a[Math.floor(R()*a.length)],act=Math.min(9,Math.floor((f-1)/10)),cl=m=>act?monClone(m,act):m;
  const pool=[];while(pool.length<4){const m=pk(TW_REG);if(!pool.includes(m))pool.push(m);}
  const n=Math.min(5,3+Math.floor(f/30)),one=()=>cl(pk(pool)),mk=q=>{const w=[];for(let i=0;i<q;i++)w.push(one());return w;};
  const boss=f%20===0,mini=f%20===10;let w;
  if(boss)w=[mk(n),[cl(TW_BOSS[(f/20-1+ci)%5])]];else if(mini)w=[mk(n),[cl(TW_MINI[((f-10)/20+ci)%5]),one(),one()]];
  else if(f%5===0)w=[mk(n),mk(n),mk(Math.min(5,n+1))];else w=[mk(n),mk(Math.min(5,n+(f%2)))];
  const mod=f<=10?-1:(boss||mini||R()<.4)?Math.floor(R()*6):-1;
  const eq=Math.min(NST-1,Math.round(2+f*2.4)),mul=stageMul0(eq)*(boss?.78:mini?.9:1)*(mod>=0?.92:1)*.85;
  return {f,ct:k,w,mod,eq,mul,boss,mini,st:{n:ROLE[k].n.toUpperCase()+' '+f+(mod>=0?' · '+TW_MOD[mod].n:''),bio:18,w,boss,mini}};}
const CT_GR=f=>f<=30?2:f<=60?3:f<=90?4:5;
function ctRew(k,f){const r={money:Math.round(REWARD(ctFloor(k,f).eq).money*.5/10)*10,dm:3,gtk:0,set:null};
  if(f%5===0)r.set={s:GSLOT[(f/5-1)%6].k,r:CT_GR(f)};if(f%10===0){r.dm=50;r.gtk=1;}if(f%50===0)r.dm+=200;const T=TE();r.ess=Math.round(.5*T.ESS_U());r.gp=Math.round(.6*T.GP_U());return r;}
function ctPower(k,f){const F=ctFloor(k,f);let p=0;F.w.forEach(w=>w.forEach(t=>{const M=MON[t];p+=(M.hp*.25+M.atk*6+M.def*4)*F.mul;}));return Math.round(p/F.w.length*1.05*(F.mod>=0?1.12:1));}
const ctPool=k=>myMechs().filter(h=>{const r=roleOf(h);return r===k||r==='all';});
function ctTeam(k){const T=TE(),sv=(T.G.ctm||{})[k],P=ctPool(k),ok=sv&&sv.map(id=>P.find(h=>h.id===id)).filter(Boolean);return ok&&ok.length?ok.slice(0,5):P.slice(0,5);} // v16-99: own team per class tower
const GRC=['#b0bec5','#66bb6a','#42a5f5','#ab47bc','#ffb300','#ff3d3d','#2ef3ff'];
function ctSetHtml(s){return '<img src="img/ui4/st_'+s.k+'_'+s.s+'.webp" alt="" style="border-radius:4px;background:'+GRC[s.r]+'55;box-shadow:0 0 0 2px '+GRC[s.r]+'">';}
function ctRewHtml(k,r,big){const T=TE(),a=EGI(r);if(r.set)a.push(ctSetHtml({k,s:r.set.s,r:r.set.r}));if(r.dm)a.push(T.DMI+' '+r.dm);if(r.gtk)a.push(GTKI+' '+r.gtk);if(big)a.push('<img src="img/ui2/i_coins.webp" alt=""> '+T.fmt(r.money));return '<span class="twRw">'+a.join(' &nbsp;')+'</span>';}
function ctDaysTxt(k){return CT_DAYS[k].map(d=>DAYN[d]).join(' · ')+' · SUN';}
// list of the 6 towers
function ctRenderList(){const t=ctG(),d=ctDay();tallBox('ctBox');
  let h=tallBg()+'<img src="img/ui7/ct_logo.webp" alt="CLASS TOWERS" style="'+gbx(0,4,1024,354)+'">';
  h+='<button class="cpB hubBk" data-ct="back" style="'+gbx(14,250,96,96)+'">↩</button>';
  h+='<div class="ctDay" style="'+gbx(62,366,900,126)+'"><img src="img/ui7/bar_long.webp" alt=""><b>TODAY · '+DAYL[d]+'</b><small>'+(d===0?'ALL TOWERS ARE OPEN':ctToday().map(k=>ROLE[k].n.toUpperCase()).join(' & ')+' OPEN · SUNDAY ALL')+'</small></div>';
  CT_K.forEach((k,i)=>{const op=ctOpenK(k),x=37+(i%3)*325,y=510+HX*.14+Math.floor(i/3)*(425+HX*.14);
    h+='<div class="ctC'+(op?'':' cl')+'" data-ck="'+k+'" style="'+gbx(x,y,300,404)+'"><img src="img/ui7/ct_'+(op?'c_':'l_')+k+'.webp" alt="">'+
      '<b class="ctN"><img src="img/ui4/cls_'+k+'.webp" alt="">'+ROLE[k].n.toUpperCase()+'</b><span class="ctF">'+(op?'FLOOR '+Math.min(CT_N,t[k]+1)+(t[k]>=CT_N?' ✓':''):ctDaysTxt(k))+'</span></div>';});
  h+='<div class="ctBt" data-ct="rew" style="'+gbx(60,1372+HX*.92,430,140)+'"><img src="img/ui7/btn_grey.webp" alt=""><b>REWARDS</b></div>';
  h+='<div class="ctBt" data-ct="heroes" style="'+gbx(534,1372+HX*.92,430,140)+'"><img src="img/ui7/btn_green.webp" alt=""><b>HEROES</b></div>';
  $('ctBox').innerHTML=h;}
// one tower
function ctRenderTower(k){const T=TE(),t=ctG(),cur=Math.min(CT_N,t[k]+1),done=t[k]>=CT_N,op=ctOpenK(k);tallBox('ctBox');const Y=HX*.04;
  let h=tallBg();
  h+='<div class="ctTi" style="'+gbx(12,10,1000,300)+'"><img src="img/ui7/bar_gold.webp" alt=""><b><img src="img/ui4/cls_'+k+'.webp" alt="">'+ROLE[k].n.toUpperCase()+' TOWER</b></div>';
  h+='<button class="cpB hubBk" data-ct="list" style="'+gbx(14,250,96,96)+'">↩</button>';
  h+='<img class="ctTw" src="img/ui7/ct_'+k+'.webp" alt="" style="'+gbx(40,300+Y,300,366)+(op?'':'filter:grayscale(1) brightness(.6)')+'">';
  h+='<div class="ctRec" style="'+gbx(370,300+Y,620,222)+'"><img src="img/ui7/bar_crown.webp" alt=""><span>RECORD</span><span><b>'+t[k]+'</b>/'+CT_N+'</span></div>';
  const tm=ctTeam(k),my=teamPower(tm),pw=ctPower(k,cur);
  h+='<div class="ctTeam" style="'+gbx(360,532+Y,640,150)+'">'+(tm.length?tm.map(x=>'<img src="'+portraitURL(x)+'" alt="">').join(''):'<i>NO '+ROLE[k].n.toUpperCase()+' HEROES YET – summon some!</i>')+'</div>';
  h+='<div class="ctRule" style="'+gbx(360,684+Y,640,40)+'">ONLY '+ROLE[k].n.toUpperCase()+' + LEGEND HEROES · BEST 5 FIGHT</div>';
  h+='<div class="twList" id="ctList" style="'+gbx(56,738+Y,914,560+HX*.86)+'">';
  const lo=Math.max(1,cur-10),hi=Math.min(CT_N,cur+10);
  for(let f=hi;f>=lo;f--){const F=ctFloor(k,f),r=ctRew(k,f),st=f<=t[k]?3:f===cur&&!done?1:F.boss||F.mini?2:4,boss=F.boss||F.mini;
    h+='<div class="twRow s'+st+(f===cur?' cur':'')+'" data-cf="'+f+'"><img class="twPl" src="img/ui6/tw_f'+(st===3?3:st===1?1:boss?2:st===4?4:0)+'.webp" alt="">'+
      (st===2&&boss?'':'<b class="twN">'+f+'</b>')+'<div class="twT"><b>'+(boss&&st!==3?'FLOOR '+f+' · <i>'+(F.boss?'BOSS':'MINI-BOSS')+'</i>':'FLOOR '+f)+'</b><span>'+(st===3?'CLEARED':ctRewHtml(k,r))+'</span></div>'+
      (F.mod>=0&&st!==3?'<img class="twMd" src="img/ui6/tw_m'+F.mod+'.webp" alt="'+TW_MOD[F.mod].n+'">':'')+'</div>';}
  h+='</div>';
  h+='<div class="ctBt sm" data-ct="trew" style="'+gbx(40,1318+HX*.92,320,110)+'"><img src="img/ui7/btn_grey.webp" alt=""><b>REWARDS</b></div>';
  const can=op&&!done&&tm.length,col=my>=pw*1.15?'#7CFC9A':my>=pw*.85?'#ffd54a':'#ff8a80';
  h+='<div class="ctBt go'+(can?'':' dis')+'" data-ct="go" style="'+gbx(380,1306+HX*.92,604,150)+'"><img src="img/ui7/'+(can?'btn_green':'btn_grey')+'.webp" alt=""><b>'+(done?'TOWER CLEARED!':!op?'CLOSED TODAY':'CHALLENGE · '+cur)+'</b>'+
    (can?'<small style="color:'+col+'">⚡ '+my.toLocaleString()+' vs '+pw.toLocaleString()+'</small>':!op?'<small>OPEN: '+ctDaysTxt(k)+'</small>':'')+'</div>';
  $('ctBox').innerHTML=h;const L=$('ctList'),c=L.querySelector('.cur');if(c)L.scrollTop=c.offsetTop-L.clientHeight/2+c.offsetHeight/2;
  CT_K.length;tm.forEach(x=>{try{const d=sprOf(x);if(d)sprLoad(d);}catch(e){}});}
function ctRender(){if(CTS.k)ctRenderTower(CTS.k);else ctRenderList();}
function ctOpen(k){if(!ctOK()){TE().toast('🔒 CLASS TOWERS open after campaign stage '+sLabel(CT_UNLOCK),2600);return;}rootOn();twArenaImg();CTS.k=k||null;ctEl.classList.add('open');ctRender();}
function ctClose(){ctEl.classList.remove('open');if(!backToHub())close();}
function ctRules(){const T=TE();let x='<div class="wS">HOW IT WORKS</div><div class="wP"><div>6 towers, one per class · <b>'+CT_N+' floors</b> each.</div><div>Only heroes of that class + <b>Legend</b> heroes fight (your best 5).</div><div>Each tower is open on 2 days a week · <b>SUNDAY all towers are open</b>.</div></div><div class="wS">SCHEDULE</div>';
  CT_K.forEach(k=>x+=wRowB(CT_K.indexOf(k)%6,'<b>'+ROLE[k].n.toUpperCase()+'</b>',null,ctDaysTxt(k)));
  x+='<div class="wS">FIXED REWARDS · FIRST CLEAR</div><div class="wP"><div>Every floor: '+T.DMI+' <b>3</b> + coins</div><div>Every 5th floor: <b>1 SET PIECE</b> of that class (Rare → Epic → Legendary → Mythic)</div><div>Every 10th floor (boss): '+T.DMI+' <b>50</b> · '+GTKI+' <b>1</b></div><div>Every 50th floor: + '+T.DMI+' <b>200</b></div><div>Nothing is random. Each floor gives its reward only once.</div></div>';
  popW('CLASS TOWERS',x);}
function ctTRew(k){const t=ctG();let x='<div class="wS">'+ROLE[k].n.toUpperCase()+' TOWER · NEXT SET PIECES</div>';
  for(let f=Math.ceil((t[k]+1)/5)*5,n=0;f<=CT_N&&n<8;f+=5,n++){const r=ctRew(k,f),it=SETS[k].p[GSLOT.findIndex(s=>s.k===r.set.s)];
    x+=wRowB(r.set.r,'<b>FLOOR '+f+'</b> '+it,null,ctRewHtml(k,r));}
  x+='<div class="wS">SET · '+SETS[k].n.toUpperCase()+'</div><div class="wP">'+SETS[k].t.map((q,i)=>'<div>'+(i+2)+' pieces: '+setTierTxt(q)+'</div>').join('')+'<div>The bonus works only on '+ROLE[k].n+' heroes.</div></div>';
  popW(ROLE[k].n.toUpperCase()+' TOWER',x);}
function ctFloorInfo(k,f){const T=TE(),F=ctFloor(k,f),t=ctG(),types=[...new Set(F.w.flat())];
  let x='<div class="wS">FLOOR '+f+' · '+F.w.length+' WAVES</div><div class="wP">'+types.map(q=>MON[q].n).join(' · ')+'</div>';
  if(F.mod>=0)x+='<div class="wS">MODIFIER</div><div class="wP twMP"><img src="img/ui6/tw_m'+F.mod+'.webp" alt=""><span><b>'+TW_MOD[F.mod].n+'</b><br>'+TW_MOD[F.mod].d+'</span></div>';
  x+='<div class="wS">'+(f<=t[k]?'CLEARED':'FIRST CLEAR REWARD')+'</div><div class="wP">'+ctRewHtml(k,ctRew(k,f),1)+'</div><div class="wP">Enemy power ⚡ '+ctPower(k,f).toLocaleString()+'</div>';
  popW('FLOOR '+f,x);}
function ctGo(k,direct){const t=ctG();if(t[k]>=CT_N)return;if(!ctOpenK(k)){TE().toast('🔒 This tower is closed today · open: '+ctDaysTxt(k),2600);return;}
  if(!ctPool(k).length){TE().toast('You have no '+ROLE[k].n+' heroes yet – summon some!',2600);return;}
  const T=TE(),f=t[k]+1;CTS.k=k;ctEl.classList.remove('open');if(direct===true){const F=ctFloor(k,f);safeStart(F.eq,ctTeam(k),F);return;}
  openTeam(ctFloor(k,f).eq,{t:ROLE[k].n.toUpperCase()+' TOWER · FLOOR '+f+' · only '+ROLE[k].n+' + Legend',cls:k,ep:()=>ctPower(k,f),pool:()=>ctPool(k),get:()=>ctTeam(k).map(h=>h.id),set:ids=>{if(!T.G.ctm)T.G.ctm={};T.G.ctm[k]=ids;},best:()=>ctPool(k).slice(0,5).map(h=>h.id),
    go:team=>{const F=ctFloor(k,t[k]+1);CTS.k=k;safeStart(F.eq,team,F);},back:()=>ctOpen(k)});}
function ctFinish(win,retreat){const T=TE(),G=T.G,t=ctG(),F=B.tw,k=F.ct,f=F.f;let html;
  if(win&&f===t[k]+1){const r=ctRew(k,f);t[k]=f;G.money+=r.money;giveEG(r);if(r.dm)G.dm=(G.dm||0)+r.dm;if(r.gtk)GSD().tk+=r.gtk;
    let setTxt='';if(r.set){const g=GR(),it=newItem(r.set.s,r.set.r,k);if(g.inv.length>=GINV){const v=salvageV(it);G.gp=(G.gp||0)+v;setTxt='BAG FULL → '+GPN(v);}else{g.inv.push(it);setTxt=itemName(it);}}
    T.save();
    const rws=[[`<img src="img/ui2/i_coins.webp">`,T.fmt(r.money)],[T.DMI,'+'+r.dm]];if(r.gtk)rws.push([GTKI,'+'+r.gtk]);if(r.set)rws.push([ctSetHtml({k,s:r.set.s,r:r.set.r}),'SET']);
    html=`<div class="rsV"><img class="hi" src="img/ui2/victory.webp" alt="VICTORY"><div class="rsL">${ROLE[k].n.toUpperCase()} TOWER · FLOOR ${f}<small>${f>=CT_N?'THE TOWER IS CLEARED!':'FLOOR '+(f+1)+' IS OPEN'}</small></div>
      ${rws.slice(0,4).map((q,i)=>`<div class="rsS" style="left:${[10.7,31.3,51.6,72][i]}%">${q[0]}<b>${q[1]}</b></div>`).join('')}
      <div class="rsU">${setTxt?'New set piece: <b>'+setTxt+'</b> · ':''}Record: floor ${t[k]} / ${CT_N}</div></div>
      <div class="rsM"><div class="cpRow">${f<CT_N&&ctOpenK(k)?'<button class="cpGo" data-a="ctnext">NEXT FLOOR ▶</button>':''}<button class="cpGo alt" data-a="ct">TOWER</button></div></div>`;}
  else{html=`<div class="rsD"><img class="hi" src="img/ui2/defeat.webp" alt="DEFEAT">${retreat?'<div class="rsR">RETREAT</div>':''}<div class="rsL">${ROLE[k].n.toUpperCase()} TOWER · FLOOR ${f}<small>HOW TO GET STRONGER – tap one</small></div>
      <div class="rsDB b0" data-a="gear"><img src="img/ui2/i_forge.webp"><span><b>Equip & upgrade gear</b>set pieces of this class help a lot</span></div>
      <div class="rsDB b1" data-a="hsum">${TKI}<span><b>Summon more ${ROLE[k].n} heroes</b>only this class (+ Legend) fights here</span></div>
      <div class="rsDB b2" data-a="gear"><img src="img/ui2/i_star1.webp"><span><b>Levels & stars</b>${F.mod>=0?'this floor: '+TW_MOD[F.mod].n:'duplicates +1 star'}</span></div>
      <button class="rsGo" data-a="ctnext">RETRY</button></div>
      <div class="rsM"><div class="cpRow"><button class="cpGo alt" data-a="gear">${IMGI('img/ui2/i_star1.webp','1.3em','-.35em')} HEROES</button><button class="cpGo alt" data-a="ct">TOWER</button></div></div>`;}
  $('cpResBox').classList.add('rsSk');$('cpResBox').innerHTML=html;$('cpRes').classList.add('open');$('cpResBox').scrollTop=0;clearInterval(ANX.id);
  $('cpResBox').onclick=e=>{const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;$('cpRes').classList.remove('open');$('bt').classList.remove('open');
    if(a==='ctnext')ctGo(k,true);else if(a==='gear'){showMap();CTS.ret=1;openGear();}
    else if(a==='hsum'){showMap();CTS.ret=1;openGear();const T2=TE();if(T2.openSummon){const sm=document.getElementById('sm');if(sm)sm.style.zIndex=30;T2.openSummon('m');}}else{showMap();ctOpen(k);}};}
ctEl.addEventListener('click',e=>{const md=e.target.closest('.twMd');if(md&&CTS.k){ctRules();return;}const el=e.target.closest('[data-ct]');
  if(el){const a=el.dataset.ct;if(a==='back')ctClose();else if(a==='list'){CTS.k=null;ctRender();}else if(a==='rew')ctRules();else if(a==='trew')ctTRew(CTS.k);
    else if(a==='heroes'){ctEl.classList.remove('open');CTS.ret=1;openGear();}else if(a==='go')ctGo(CTS.k);return;}
  const c=e.target.closest('[data-ck]');if(c){CTS.k=c.dataset.ck;ctRender();return;}
  const row=e.target.closest('[data-cf]');if(row&&CTS.k)ctFloorInfo(CTS.k,+row.dataset.cf);});
const hubCss=document.createElement('style');hubCss.textContent=`
#hub,#ct{position:fixed;inset:0;z-index:8;display:none;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 30%,#16264d,#05070c 75%)}#hub.open,#ct.open{display:flex}
#hubBox,#ctBox{position:relative;--u:.35px;overflow:hidden;border-radius:calc(var(--u)*18);background:#0a1322}#hubBox>*,#ctBox>*{position:absolute}#hubBox.tall,#ctBox.tall{border-radius:0}.hbF{-webkit-mask-image:linear-gradient(transparent,#000 calc(var(--u)*90));mask-image:linear-gradient(transparent,#000 calc(var(--u)*90))}
.hubBk{min-width:0;padding:0;border-radius:50%;font-size:calc(var(--u)*46);z-index:2}
.hubM{cursor:pointer;filter:drop-shadow(0 calc(var(--u)*8) calc(var(--u)*10) #000c);transition:transform .12s}.hubM:active{transform:scale(.97)}
.hubM>img{width:100%;height:100%;display:block}.hubM.lk>img{filter:grayscale(.8) brightness(.7)}.hubP{position:absolute;top:0;height:100%;display:block}.hubM.lk>.hubP{filter:grayscale(.8) brightness(.7)}
.hubS{position:absolute;right:calc(var(--u)*50);bottom:calc(var(--u)*20);font:900 italic calc(var(--u)*30) system-ui;color:#ffe082;background:#000c;padding:calc(var(--u)*3) calc(var(--u)*16);border-radius:calc(var(--u)*20);box-shadow:0 0 0 calc(var(--u)*2) #e0aa2588;text-shadow:0 2px 0 #000;white-space:nowrap}
.hubM[data-hb=camp] .hubS{bottom:calc(var(--u)*22)}
.ctDay img,.ctBt>img,.ctRec>img,.ctTi>img,.ctC>img{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}
.ctDay{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.ctDay b,.ctDay small{position:relative;font:900 italic calc(var(--u)*36) system-ui;color:#ffd54a;text-shadow:0 calc(var(--u)*3) 0 #000}.ctDay small{font-size:calc(var(--u)*24);color:#fff}
.ctC{cursor:pointer;filter:drop-shadow(0 calc(var(--u)*8) calc(var(--u)*10) #000c);transition:transform .12s}.ctC:active{transform:scale(.96)}
.ctN{position:absolute;left:calc(var(--u)*56);right:calc(var(--u)*56);top:calc(var(--u)*45);height:calc(var(--u)*50);display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*6);font:900 italic calc(var(--u)*30) system-ui;color:#fff;text-shadow:0 calc(var(--u)*3) 0 #000}
.ctN img{height:calc(var(--u)*40);width:auto}.ctC.cl .ctN{color:#cfd8dc}
.ctF{position:absolute;left:calc(var(--u)*44);right:calc(var(--u)*44);top:calc(var(--u)*326);height:calc(var(--u)*48);display:flex;align-items:center;justify-content:center;font:900 italic calc(var(--u)*27) system-ui;color:#3a1d00;text-shadow:0 calc(var(--u)*2) 0 #fff7;white-space:nowrap}
.ctC.cl .ctF{color:#e8eef3;text-shadow:0 calc(var(--u)*2) 0 #000;font-size:calc(var(--u)*22)}
.ctBt{cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center}.ctBt b,.ctBt small{position:relative;font:900 italic calc(var(--u)*40) system-ui;color:#fff;text-shadow:0 calc(var(--u)*3) 0 #000}
.ctBt.sm b{font-size:calc(var(--u)*32)}.ctBt small{font-size:calc(var(--u)*24);margin-top:calc(var(--u)*-2);background:#0009;padding:0 calc(var(--u)*14);border-radius:calc(var(--u)*16)}.ctBt.dis b{color:#cfd8dc}
.ctTi{display:flex;align-items:center;justify-content:center}.ctTi b{position:relative;display:flex;align-items:center;gap:calc(var(--u)*12);font:900 italic calc(var(--u)*58) system-ui;color:#3a1d00;text-shadow:0 calc(var(--u)*2) 0 #fff8;margin-top:calc(var(--u)*-14)}.ctTi b img{height:calc(var(--u)*76);width:auto}
.ctTw{object-fit:contain;filter:drop-shadow(0 0 calc(var(--u)*20) #000)}
.ctRec{box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;padding:0 calc(var(--u)*74) 0 calc(var(--u)*80)}.ctRec span{position:relative;font:900 italic calc(var(--u)*30) system-ui;color:#fff;text-shadow:0 calc(var(--u)*3) 0 #000}.ctRec b{color:#ffd54a;font-size:1.5em}
.ctTeam{display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*10);background:#000a;border-radius:calc(var(--u)*24);box-shadow:0 0 0 calc(var(--u)*3) #e0aa2566}
.ctTeam img{width:calc(var(--u)*112);height:calc(var(--u)*112);border-radius:calc(var(--u)*16);object-fit:cover;box-shadow:0 0 0 calc(var(--u)*3) #ffd54a}
.ctTeam i{font:900 calc(var(--u)*26) system-ui;color:#ff8a80;text-align:center}
.ctRule{display:flex;align-items:center;justify-content:center;font:900 calc(var(--u)*22) system-ui;color:#b3e5fc;text-shadow:0 2px 0 #000}
.twRw img[src*="st_"]{height:1.5em!important}
#cpBtn,#arBtn,#twBtn{}#arBtn,#twBtn{display:none!important}
`;document.head.appendChild(hubCss);

// ---------------------------------------------------------------- open / close
function open(){HM=hardOK()&&TE().G.cp.hm?1:0;root.classList.add('open');window.__BATTLE_ON=true;showMap();gsBadge();}
function close(){HM=0;running=false;cancelAnimationFrame(raf);cancelAnimationFrame(gsRaf);root.classList.remove('open');['cpCard','cpTeam','cpRes','bt','cpGear','cpPop','gSum','tw','hub','ct'].forEach(id=>$(id).classList.remove('open'));window.__BATTLE_ON=false;}
$('gSum').addEventListener('click',e=>{if(e.target.id==='gSum'){closeGSum();return;}const el=e.target.closest('[data-gs]');if(!el)return;const a=el.dataset.gs;
  if(a==='back')closeGSum();else if(a==='hsum'||a==='csum'){closeGSum();const sm=document.getElementById('sm');if(sm)sm.style.zIndex=30;TE().openSummon(a==='csum'?'c':'m');}else if(a==='1')gsummon(1);else if(a==='10')gsummon(10);else if(a==='rates')gsRates();else if(a==='hist')gsHist();else if(a==='gear'){closeGSum();openGear();}
  else{const t=e.target.closest('.gsT');if(t)gsRates();}});
function gsOpenSm(){const sm=document.getElementById('sm');if(sm)sm.style.zIndex=30;TE().openSummon('gear');} // v16-91: Gear Summon = tab of the SUMMON page (Marius)
function gsBag(){const sm=document.getElementById('sm');if(root.classList.contains('open')){sm.classList.remove('open');sm.style.zIndex='';}else{open();collHome=1;}if(!$('cpGear').classList.contains('open'))openGear();}
$('cpGSB').onclick=gsOpenSm;$('gGSB').onclick=gsOpenSm;
$('cpChN').onclick=()=>chList();
$('cpBack').onclick=()=>{if(!backToHub())close();};$('cpPrev').onclick=()=>chGo(-1);$('cpNext').onclick=()=>chGo(1);$('cpGearB').onclick=()=>openGear();
// v15: GEAR title is the player's picture
$('cpGearB').innerHTML=IMGI(glyphURL('bag','#ffd54a'),'1.25em','-.3em')+'<small>HEROES</small>';
// v16-20: mini hero on the garage map (same sprite sheet as in battle). an: idle · walk · work · cel, or a row number (drivers). hgt = height on the map.
function mini(X,id,an,t,x,y,hgt,face,ph){const d=SPRD[id];if(!sprOK(d))return false;const R=d.R||[0,1,2,3,4,5];
  const num=typeof an==='number',row=num?R[an]:an==='walk'?R[1]:an==='work'?R[2]:an==='cel'?R[5]:R[0],N=d.v8?8:4,fps=(num?[4,9,11,6,5,4][an]:an==='walk'?9:an==='work'?6:4)*N/4,c=Math.floor(t*fps+(ph||0)*3)%N;
  const k=hgt/215;X.save();X.translate(x,y);X.scale(face<0?-1:1,1);
  sprBlit(X,d,row,c,k);X.restore();return true;}

// v16-45: ARENA (online PvP) – the battle team as numbers for the server (stats incl. gear) + a pose drawer for the arena fight
function arenaTeam(){return curTeamList().filter(Boolean).map(h=>{const s=unitStats(h),R=ROLE[roleOf(h)];
  return {id:h.id,n:h.n,gr:h.gr||0,s:stars(h),role:roleOf(h),hp:s.hp,atk:Math.round(s.atk*10)/10,def:Math.round(s.def*10)/10,as:Math.round(s.as*1000)/1000,crit:Math.round(s.crit*1000)/1000,rng:s.rng,eg:Math.round(s.eg*100)/100,pw:powS(s,R)};});}
// pose: idle · walk · atk · skill · hurt · ko · win ; k = 0..1 progress of one-shot poses
function pose(X,id,ps,t,k,x,y,hgt,face){const d=SPRD[id];if(!sprOK(d))return false;const R=d.R||[0,1,2,3,4,5];let f;
  if(d.v8){const q=n=>Math.min(n-1,Math.floor(k*n));f=ps==='walk'?[1,Math.floor(t*13)%8]:ps==='atk'?[2,q(8)]:ps==='skill'?[3,q(8)]:ps==='hurt'?[4,1]:ps==='ko'?[4,4+q(4)]:ps==='win'?[5,Math.floor(t*8)%8]:[0,Math.floor(t*8)%8];}
  else if(ps==='walk')f=[R[1],Math.floor(t*9)%4];
  else if(ps==='atk')f=[R[2],Math.min(3,Math.floor(k*4))];
  else if(ps==='skill'){const cs=d.cs,n=cs?cs.length:d.n||4,i=Math.min(n-1,Math.floor(k*n));f=cs?cs[i]:[R[3],i];}
  else if(ps==='hurt')f=d.hk?d.hk.h:d.noKO?[R[0],0]:[R[4],0];
  else if(ps==='ko'){if(d.hk){const q=d.hk.ko;f=q[Math.min(q.length-1,Math.floor(k*q.length))];}else f=d.noKO?[R[0],0]:[R[4],k<.4?2:3];}
  else if(ps==='win')f=[R[5],Math.floor(t*5)%4];
  else f=[R[0],Math.floor(t*4)%4];
  const kk=hgt/215;X.save();X.translate(x,y);X.scale(face<0?-1:1,1);
  if(ps==='ko'&&d.noKO)X.rotate(-Math.min(1,k*2.2)*Math.PI/2*.92);
  sprBlit(X,d,f[0],f[1],kk);X.restore();return true;}
const hasSpr=id=>!!SPRD[id];
let collHome=0,gsHome=0;   // v16-87: gsHome = Gear Summon opened from the main SUMMON page
// ---------------------------------------------------------------- v16-60: WORLD BOSS (Marius' 6 pictures in img/wb/, cut by tools/wb_cut.py)
// 3 attacks a day (BOSS KEY, new keys at midnight, phone time) · a 60 s fight with the battle team · the boss never dies (endless HP bars),
// only the DAMAGE counts · FIXED daily rewards for the total damage of the day (6 tiers, nothing random) · weekly DAMAGE RANKING on the
// server (week = Monday 00:00 UTC, top 100 rewarded by mail, server/online.js) · one boss a week in rotation (SCRAPZILLA → CRUSHER KING → INFERNO PISTON → TOW SERPENT),
// each boss has a weak class (+30% damage). One HP bar = WB_LK × the power of your 5 best heroes, fixed for the whole day (G.wb.L, taken at
// the first visit of the day; best heroes, not the current team → cannot be lowered on purpose). A normal team does ~2-4 bars per attack.
// Saved in G.wb.
const WB_UNLOCK=21,WB_KEYS=3,WB_T=60,WB_ENR=20,WB_LAYERS=100,WB_LK=.5;
const WBOSS=[{k:'scrap',sp:'scrapzilla',n:'SCRAPZILLA',weak:'elec',d:'A gigantic dinosaur made of crushed cars: claw swipes, ground slams and a wide fire breath. It ENRAGES in the last 20 seconds.'},
  {k:'crushk',sp:'crusher',n:'CRUSHER KING',weak:'inspect',d:'A giant golem built from a car-crusher press: huge hydraulic punches and frequent ground slams that hit everyone close to it. No ranged attack. It ENRAGES in the last 20 seconds.'},
  {k:'infp',sp:'inferno',n:'INFERNO PISTON',weak:'paint',d:'A fire demon made from a giant V12 engine: fan-belt whip lashes, ground slams and a cone of fire from its cylinder chest. It ENRAGES in the last 20 seconds.'},
  {k:'tows',sp:'tow',n:'TOW SERPENT',weak:'tuning',d:'A giant serpent made of heavy chains and crane hooks with a tow-truck head: fast lunges along the ground that hit everyone in front of it, many times. No ranged attack. It ENRAGES in the last 20 seconds.'}]; // v16-61 bosses 2-3 · v16-62 boss 4
const WB_TIER=[{b:1,dm:20},{b:3,dm:20,tk:1},{b:5,dm:30,gt:1},{b:8,dm:40,tk:1},{b:12,dm:50,gt:1,ct:1},{b:18,dm:80,tk:2,gt:1}];
const WB_RANK=[[1,1,{dm:1500,tk:15,gt:10}],[2,3,{dm:1000,tk:10,gt:6}],[4,10,{dm:600,tk:6,gt:4}],[11,50,{dm:300,tk:3,gt:2}],[51,100,{dm:150,tk:2,gt:1}]]; // same table in server/online.js (WB_RW)
MON.scrap={n:'SCRAPZILLA',hp:12500,atk:118,def:28,mv:0,rng:150,as:1.8,h:230,boss:1,b:'titan',big:5,lc:'#ff6d00',lz:[58,155],dr:'spr_scrapzilla',dr0:'titan',sp:'scrapzilla',sc:1,desc:'World boss'};
MSPR.scrapzilla={w:288,h:192,ax:144,ay:187.5,ih:157,wb:{pr:2,ni:6}};MDRAW.spr_scrapzilla=(g,u,t)=>drawSprMon(g,u,t,'scrapzilla');
// v16-61: CRUSHER KING (pound = the ground-slam SKILL row, no fire breath → slams more often) · INFERNO PISTON (pound = whip row,
// fire = chest opening frames 1-3 + the fire cone drawn by the game, like SCRAPZILLA; its idle row has 5 frames)
MON.crushk={n:'CRUSHER KING',hp:12500,atk:118,def:28,mv:0,rng:150,as:1.8,h:230,boss:1,b:'titan',big:5,lc:'#ffd740',lz:[40,120],dr:'spr_crusher',dr0:'titan',sp:'crusher',sc:1,noLz:1,desc:'World boss'};
MSPR.crusher={w:304,h:180,ax:152,ay:175,ih:153,wb:{pr:3,ni:6}};MDRAW.spr_crusher=(g,u,t)=>drawSprMon(g,u,t,'crusher');
MON.infp={n:'INFERNO PISTON',hp:12500,atk:118,def:28,mv:0,rng:150,as:1.8,h:230,boss:1,b:'titan',big:5,lc:'#ff6d00',lz:[78,93],dr:'spr_inferno',dr0:'titan',sp:'inferno',sc:1,desc:'World boss'};
MSPR.inferno={w:322,h:177,ax:161,ay:173,ih:150,wb:{pr:2,ni:5}};MDRAW.spr_inferno=(g,u,t)=>drawSprMon(g,u,t,'inferno');
// v16-62: TOW SERPENT (weak to RACER) – its SKILL row whips the chain backwards (away from the heroes) → not used;
// pound = the ATTACK row (lunge forward, sparks on the ground), no breath (like CRUSHER KING → pounds more often)
MON.tows={n:'TOW SERPENT',hp:12500,atk:118,def:28,mv:0,rng:150,as:1.8,h:230,boss:1,b:'titan',big:5,lc:'#ffab00',lz:[40,120],dr:'spr_tow',dr0:'titan',sp:'tow',sc:1,noLz:1,desc:'World boss'};
MSPR.tow={w:310,h:191,ax:155,ay:158,ih:151,wb:{pr:2,ni:6}};MDRAW.spr_tow=(g,u,t)=>drawSprMon(g,u,t,'tow');
const WBS={ret:0,sending:0,rank:null,raf:0};
const wbEl=document.createElement('div');wbEl.id='wb';wbEl.innerHTML='<div id="wbBox"></div>';root.appendChild(wbEl);
const fmtD=n=>{n=Math.round(n||0);return n>=1e12?(n/1e12).toFixed(2)+'T':n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e4?(n/1e3).toFixed(1)+'K':String(n);};
const wbDay=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
const wbWS=()=>{const d=new Date();d.setUTCHours(0,0,0,0);return d.getTime()-((d.getUTCDay()+6)%7)*864e5;};
const wbWeek=()=>new Date(wbWS()).toISOString().slice(0,10);
let WBF=-1; // test mode only: force a boss (__DEV.wbSet)
const wbCur=()=>WBF>=0?WBF%WBOSS.length:Math.max(0,Math.floor((wbWS()-Date.UTC(2026,10,16))/6048e5))%WBOSS.length;
const wbOK=()=>TE().G.cp.best>=WB_UNLOCK;
const wbEq=()=>Math.min(NST-1,Math.max(0,TE().G.cp.best));
const wbLayer=()=>Math.max(500,Math.round(teamPower(bestTeam().map(heroOf).filter(Boolean))*WB_LK));
function wbG(){const G=TE().G;if(!G.wb)G.wb={d:'',n:0,dmg:0,best:0,cl:[],L:0,wk:'',wd:0,wbest:0,pend:[]};const w=G.wb,d=wbDay();
  if(w.d!==d){w.d=d;w.n=0;w.dmg=0;w.best=0;w.cl=[];w.L=wbLayer();}
  if(!w.L)w.L=wbLayer();
  if(w.wk!==wbWeek()){w.wk=wbWeek();w.wd=0;w.wbest=0;}
  return w;}
const wbKeys=()=>Math.max(0,WB_KEYS-wbG().n);
const wbTierSt=i=>{const w=wbG();return w.cl.includes(i)?2:w.dmg>=WB_TIER[i].b*w.L?1:0;}; // 0 locked · 1 ready · 2 claimed
const wbReady=()=>wbOK()&&(wbKeys()>0||WB_TIER.some((q,i)=>wbTierSt(i)===1));
const KEYI=h=>'<img src="img/wb/key.webp" alt="" style="height:'+(h||'1.3em')+';vertical-align:-.3em">';
function wbRwHtml(r){const T=TE(),a=[];if(r.dm)a.push(T.DMI+' '+r.dm);if(r.tk)a.push(TKI+' '+r.tk);if(r.gt)a.push(GTKI+' '+r.gt);if(r.ct)a.push('<img src="img/cticket.webp" alt="" style="height:1.15em;vertical-align:-.25em"> '+r.ct);return a.join(' &nbsp;');}
function wbFight(){const w=wbG(),Bo=WBOSS[wbCur()],eq=wbEq();
  return {wb:1,f:0,eq,mod:-1,mul:stageMul0(eq)*.6,L:w.L,weak:Bo.weak,boss:true,mini:false,w:[[Bo.k]],st:{n:Bo.n,bio:18,w:[[Bo.k]],boss:true,mini:false}};}
const wbMap=()=>TALL.map(1024,1536,[[1250,1]]),wbBgMap=()=>TALL.map(1024,1536,[[1000,1]]);
addEventListener('resize',()=>{if(wbEl.classList.contains('open'))wbRender();});
// box 1024 x 1536 units (taller phones: the asphalt row at y=1150 is stretched, the reward list grows)
function wbRender(){const T=TE(),w=wbG(),Bo=WBOSS[wbCur()],M=wbMap(),bx=$('wbBox');TALL.size(bx,M);GYM=M;
  let h=TALL.bg(wbBgMap(),'img/wb/wb_bg.webp',0,0,1024,1536,'gsBg');
  h+='<img class="wbT" src="img/wb/t_title.webp" alt="WORLD BOSS" style="'+gbx(92,8,840,274)+'">';
  h+='<button class="cpB wbBk" data-wb="back" style="'+gbx(18,18,96,96)+'">↩</button>';
  h+='<button class="cpB wbBk wbI" data-wb="info" style="'+gbx(910,18,96,96)+'">?</button>';
  h+='<div class="wbN" style="'+gbx(112,288,800,64)+'">'+Bo.n+'</div>';
  h+='<canvas id="wbCv" style="'+gbx(62,318,900,400)+'"></canvas>';
  h+='<div class="wbW" data-wb="info" style="'+gbx(170,712,684,84)+'"><img src="img/wb/t_weak.webp" alt="WEAK TO"><span>'+'<img src="'+CLSU(Bo.weak)+'" alt="">'+'<b>'+ROLE[Bo.weak].n.toUpperCase()+'</b> +30%</span></div>';
  h+='<div class="wbD" style="'+gbx(152,800,720,168)+'"><img src="img/wb/dmg.webp" alt=""><div><small>TODAY\'S DAMAGE</small><b>'+fmtD(w.dmg)+'</b><small>'+(w.dmg/w.L).toFixed(1)+' HP BARS · BEST HIT '+fmtD(w.best)+'</small></div></div>';
  const ms=new Date();ms.setHours(24,0,0,0);const left=ms-Date.now();
  h+='<div class="wbK" style="'+gbx(112,972,800,70)+'">'+[0,1,2].map(i=>'<img src="img/wb/key.webp" alt="" class="'+(i<wbKeys()?'':'off')+'">').join('')+'<span><b>'+wbKeys()+'/'+WB_KEYS+'</b> BOSS KEYS · new in '+Math.floor(left/36e5)+'h '+Math.floor(left%36e5/6e4)+'m</span></div>';
  h+='<img class="wbTD" src="img/wb/t_daily.webp" alt="DAILY REWARDS" style="'+gbx(172,1046,680,108)+'">';
  h+='<div class="wbList" style="'+gbx(56,1160,912,200)+'">';
  WB_TIER.forEach((q,i)=>{const st=wbTierSt(i);
    h+='<div class="wbRow s'+st+'" data-wt="'+i+'"><img class="wbRI" src="img/wb/row_'+['l','r','c'][st]+'.webp" alt=""><div class="wbRT"><b>DAMAGE '+fmtD(q.b*w.L)+' <i>· '+q.b+' BAR'+(q.b>1?'S':'')+'</i></b><span>'+wbRwHtml(q)+'</span></div>'+(st===1?'<em>CLAIM</em>':'')+'</div>';});
  h+='</div>';
  h+='<div class="wbRk" data-wb="rank" style="'+gbx(26,1382,500,80)+'"><img src="img/wb/t_rank.webp" alt="DAMAGE RANKING"></div>';
  h+='<div class="wbA'+(wbKeys()?'':' dis')+'" data-wb="go" style="'+gbx(540,1352,460,178)+'"><img src="img/wb/atk.webp" alt=""><b>'+(wbKeys()?'ATTACK':'NO KEYS')+'<small>'+KEYI('1.2em')+' '+wbKeys()+'/'+WB_KEYS+' · 60 s</small></b></div>';
  h+='<div class="wbWk" style="'+gbx(26,1470,500,52)+'">THIS WEEK '+fmtD(w.wd)+(WBS.rank&&WBS.rank.rank?' · #'+WBS.rank.rank:'')+'</div>';
  GYM=null;bx.innerHTML=h;wbAnim();}
// the boss idles on the page (12 fps, only while the page is open)
function wbAnim(){cancelAnimationFrame(WBS.raf);const sp=WBOSS[wbCur()].sp,d=msprLoad(sp),ni=MSPR[sp].wb.ni;let last=0;
  const f=ts=>{if(!wbEl.classList.contains('open'))return;WBS.raf=requestAnimationFrame(f);if(ts-last<80)return;last=ts;const c=$('wbCv');if(!c||!d.im.complete||!d.im.naturalWidth)return;
    const r=c.getBoundingClientRect(),dp=Math.min(2,devicePixelRatio||1),cw=Math.round(r.width*dp),ch=Math.round(r.height*dp);if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;}
    const x=c.getContext('2d'),k=Math.min(cw/d.w,ch/d.h)*1.05,i=Math.floor(ts/110)%ni;x.clearRect(0,0,cw,ch);
    x.drawImage(d.im,i*d.w,0,d.w,d.h,(cw-d.w*k)/2,ch-d.h*k,d.w*k,d.h*k);};
  WBS.raf=requestAnimationFrame(f);}
function wbOpen(){if(!wbOK()){TE().toast('🔒 WORLD BOSS opens after campaign stage '+sLabel(WB_UNLOCK-1),2600);return;}
  rootOn();twArenaImg();wbEl.classList.add('open');wbRender();wbSend().then(()=>{if(wbEl.classList.contains('open'))wbRender();});}
function wbClose(){wbEl.classList.remove('open');cancelAnimationFrame(WBS.raf);if(!backToHub())close();}
function wbInfo(){const Bo=WBOSS[wbCur()],w=wbG();
  let x='<div class="wS">'+Bo.n+' · THIS WEEK\'S BOSS</div><div class="wP">'+Bo.d+'</div><div class="wP twMP"><img src="'+CLSU(Bo.weak)+'" alt=""><span><b>WEAK TO '+ROLE[Bo.weak].n.toUpperCase()+'</b><br>'+ROLE[Bo.weak].n+' heroes deal <b>+30%</b> damage to it.</span></div>';
  x+='<div class="wS">HOW IT WORKS</div><div class="wP"><div>'+KEYI()+' <b>3 BOSS KEYS</b> a day – one key = one attack of <b>60 seconds</b> with your battle team.</div><div>The boss cannot be killed: every bar you empty fills again. Only your <b>damage</b> counts.</div><div>One HP bar = <b>'+fmtD(w.L)+'</b> today (it grows with your heroes).</div><div>Daily rewards are <b>fixed</b> – nothing is random.</div></div>';
  x+='<div class="wS">WEEKLY DAMAGE RANKING · REWARDS BY MAIL</div>'+WB_RANK.map((r,i)=>wRowB(5-i,'<b>'+(r[0]===r[1]?'#'+r[0]:'#'+r[0]+' – '+r[1])+'</b>',null,wbRwHtml(r[2]))).join('');
  x+='<div class="wP">The week ends on Monday 00:00 UTC (01:00 Paris). A new boss comes every week.</div>';
  popW('WORLD BOSS',x);}
function wbClaim(i){const T=TE(),w=wbG();if(wbTierSt(i)!==1)return;const q=WB_TIER[i];w.cl.push(i);T.giveRw?T.giveRw(q):null;
  if(!T.giveRw){if(q.dm)T.G.dm=(T.G.dm||0)+q.dm;if(q.tk)T.G.h.tk+=q.tk;if(q.gt)GSD().tk+=q.gt;if(q.ct)T.G.h.ct+=q.ct;}
  T.save();T.toast('🎁 '+wbRwHtml(q).replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ')+' · claimed!',2600);if(T.updHud)T.updHud();wbRender();}
function wbGo(){const w=wbG();if(w.n>=WB_KEYS){TE().toast('🔑 No BOSS KEYS left today · new keys at midnight',2600);return;}
  wbEl.classList.remove('open');cancelAnimationFrame(WBS.raf);openTeam(wbEq(),mainCX('WORLD BOSS · '+WBOSS[wbCur()].n,()=>Math.round((w.L||0)*2),wbGo0,wbOpen));}
function wbGo0(team){const w=wbG();if(w.n>=WB_KEYS)return;if(!team||!team.length)team=bestTeam().map(heroOf);
  w.n++;TE().save();wbEl.classList.remove('open');cancelAnimationFrame(WBS.raf);
  try{team.forEach(h=>{const d=sprOf(h);if(d)sprLoad(d);});}catch(e){}msprLoad(WBOSS[wbCur()].sp);
  safeStart(wbEq(),team,wbFight());if(!(B&&B.wbB&&running)){w.n--;TE().save();}}
async function wbSend(){const w=wbG();if(!w.pend.length||!window.ONLINE||!ONLINE.call||WBS.sending)return;WBS.sending=1;
  try{while(w.pend.length){const q=w.pend[0];if(q.t<wbWS()){w.pend.shift();continue;}const r=await ONLINE.call('wbhit',{dmg:q.d,t:q.t,boss:WBOSS[wbCur()].k});
      if(r&&r.ok){w.pend.shift();WBS.rank=r;TE().save();}else if(r&&(r.err==='limit'||r.err==='bad'||r.banned)){w.pend.shift();TE().save();}else break;}}
  catch(e){}finally{WBS.sending=0;}}
async function wbRank(){const w=wbG(),esc=s=>String(s).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
  popW('DAMAGE RANKING','<div class="wP">Loading…</div>');await wbSend();
  const r=window.ONLINE&&ONLINE.call?await ONLINE.call('wbrank',{}):{err:'offline'};let x='';
  if(!r||!r.ok)x+='<div class="wP">📶 The ranking needs an internet connection (and the game online at least once).<br>Your damage this week: <b>'+fmtD(w.wd)+'</b> – it is sent as soon as you are online.</div>';
  else{WBS.rank={rank:r.rank};const hl=Math.max(0,r.end-r.now),dd=Math.floor(hl/864e5),hh=Math.floor(hl%864e5/36e5);
    x+='<div class="wS">THIS WEEK · ENDS IN '+(dd?dd+'d ':'')+hh+'h</div>';
    x+=wRowB(4,'<b>YOU '+(r.rank?'#'+r.rank:'–')+'</b> '+esc(r.name||''),null,fmtD(r.dmg||0));
    x+=r.top.length?r.top.map((p,i)=>wRowB(i===0?5:i<3?4:i<10?3:i<50?2:1,'<b>#'+(i+1)+'</b> '+esc(p.name),null,fmtD(p.dmg))).join(''):'<div class="wP">Nobody has attacked yet this week – be the first!</div>';}
  x+='<div class="wS">WEEKLY REWARDS · BY MAIL ON MONDAY</div>'+WB_RANK.map((q,i)=>wRowB(5-i,'<b>'+(q[0]===q[1]?'#'+q[0]:'#'+q[0]+' – '+q[1])+'</b>',null,wbRwHtml(q[2]))).join('');
  popW('DAMAGE RANKING',x);}
function wbFinish(win,retreat){const T=TE(),w=wbG(),dmg=Math.round(B.wbD||0),before=w.dmg;
  w.dmg+=dmg;const nb=dmg>w.best;w.best=Math.max(w.best,dmg);w.wd+=dmg;w.wbest=Math.max(w.wbest||0,dmg);if(dmg>0)w.pend.push({d:dmg,t:Date.now()});T.save();wbSend();
  const nt=WB_TIER.filter(q=>before<q.b*w.L&&w.dmg>=q.b*w.L).length;
  const html=`<div class="wbRes"><img class="wbRT" src="img/wb/t_title.webp" alt="WORLD BOSS">
    <div class="wbRK">${B.wbUp?'TIME UP!':retreat?'RETREAT':'TEAM DEFEATED'}</div>
    <div class="wbRD"><img src="img/wb/dmg.webp" alt=""><div><small>DAMAGE</small><b>${fmtD(dmg)}</b></div></div>
    <div class="wbRL">${(dmg/w.L).toFixed(1)} HP BARS${nb&&dmg>0?' · <i>NEW BEST TODAY!</i>':''}</div>
    <div class="wbRL">TODAY <b>${fmtD(w.dmg)}</b> · THIS WEEK <b>${fmtD(w.wd)}</b></div>
    ${nt?`<div class="wbRN">🎁 ${nt} new daily reward${nt>1?'s':''} – claim on the WORLD BOSS page</div>`:''}
    <div class="wbRL">${KEYI()} ${wbKeys()}/${WB_KEYS} keys left today</div>
    <div class="cpRow"><button class="cpGo" data-a="wb">WORLD BOSS</button><button class="cpGo alt" data-a="team">${IMGI('img/ui2/i_star1.webp','1.3em','-.35em')} HEROES</button></div></div>`;
  $('cpResBox').classList.remove('rsSk');$('cpResBox').classList.add('wbSk');$('cpResBox').innerHTML=html;$('cpRes').classList.add('open');$('cpResBox').scrollTop=0;clearInterval(ANX.id);
  $('cpResBox').onclick=e=>{const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;$('cpRes').classList.remove('open');$('cpResBox').classList.remove('wbSk');$('bt').classList.remove('open');
    showMap();if(a==='team'){WBS.ret=1;openGear();}else wbOpen();};}
wbEl.addEventListener('click',e=>{const el=e.target.closest('[data-wb]');
  if(el){const a=el.dataset.wb;if(a==='back')wbClose();else if(a==='info')wbInfo();else if(a==='rank')wbRank();else if(a==='go')wbGo();return;}
  const r=e.target.closest('[data-wt]');if(r){const i=+r.dataset.wt;if(wbTierSt(i)===1)wbClaim(i);else{const q=WB_TIER[i],w=wbG();TE().toast(wbTierSt(i)===2?'✅ Already claimed today':'Deal '+fmtD(q.b*w.L)+' damage today ('+fmtD(Math.max(0,q.b*w.L-w.dmg))+' to go)',2400);}}});
// battle HUD: Marius' boss bar (frame + fill), bars left (x N), the damage plate and the timer
const WBI={};['bar','fill','dmg','key'].forEach(k=>{const im=new Image();im.src='img/wb/'+k+'.webp';WBI[k]=im;});
const wbOk=k=>WBI[k].complete&&WBI[k].naturalWidth>0;
function wbHUD(t,top){const b=B.wbB,L=B.tw.L,d=B.wbD,lay=Math.floor(d/L),fr=1-(d-lay*L)/L,left=Math.max(0,WB_LAYERS-lay);
  const bw=Math.min(W*.97,560),bh=bw/6,bx=(W-bw)/2,by=top+38;
  // inner part of bar.webp (1200x200): x 210..1146, y 66..134
  const ix=bx+bw*.175,iw=bw*.78,iy=by+bh*.33,ih=bh*.34;
  if(wbOk('bar'))g.drawImage(WBI.bar,bx,by,bw,bh);
  if(lay<WB_LAYERS){const nxt=['#ff9100','#ffd600','#76ff03','#00e5ff','#d500f9'][lay%5];g.fillStyle=nxt;g.globalAlpha=.55;g.fillRect(ix,iy,iw,ih);g.globalAlpha=1;} // next bar colour under the red
  if(wbOk('fill'))g.drawImage(WBI.fill,0,0,WBI.fill.naturalWidth*Math.max(.002,fr),WBI.fill.naturalHeight,ix,iy-ih*.08,iw*fr,ih*1.16);else{g.fillStyle=b.enr?'#ff1744':'#e53935';g.fillRect(ix,iy,iw*fr,ih);}
  g.textAlign='center';g.textBaseline='middle';g.font='900 '+Math.round(bh*.27)+'px system-ui';g.lineWidth=4;g.strokeStyle='#000';
  const nm=b.name+(b.enr?' · ENRAGED':'');g.strokeText(nm,ix+iw*.45,iy+ih/2+1);g.fillStyle=b.enr?'#ff8a80':'#fff';g.fillText(nm,ix+iw*.45,iy+ih/2+1);
  g.textAlign='right';g.font='900 italic '+Math.round(bh*.3)+'px system-ui';g.strokeText('x'+left,ix+iw-6,iy+ih/2+1);g.fillStyle='#ffd54a';g.fillText('x'+left,ix+iw-6,iy+ih/2+1);
  // damage plate + timer
  const pw=Math.min(W*.62,330),ph=pw*149/640,px=bx+4,py=by+bh+2;
  if(wbOk('dmg'))g.drawImage(WBI.dmg,px,py,pw,ph);
  g.textAlign='left';g.font='900 '+Math.round(ph*.36)+'px system-ui';g.strokeText(fmtD(d),px+pw*.27,py+ph*.53);g.fillStyle='#ffe082';g.fillText(fmtD(d),px+pw*.27,py+ph*.53);
  const sec=Math.ceil(B.wbT),low=sec<=10,tx=bx+bw-4,ty=py+ph*.5;
  g.textAlign='right';g.font='900 '+Math.round(ph*.42*(low?1+.08*Math.sin(t*12):1))+'px system-ui';const ts='⏱ 0:'+String(sec).padStart(2,'0');
  g.strokeText(ts,tx,ty);g.fillStyle=low?'#ff5252':'#fff';g.fillText(ts,tx,ty);
  if(B.tw.weak){g.font='800 '+Math.round(ph*.22)+'px system-ui';const wt='WEAK: '+ROLE[B.tw.weak].n.toUpperCase()+' +30%';g.strokeText(wt,tx,ty+ph*.42);g.fillStyle='#80d8ff';g.fillText(wt,tx,ty+ph*.42);}
  g.textBaseline='alphabetic';}
const wbCss=document.createElement('style');wbCss.textContent=`
#wb{position:fixed;inset:0;z-index:8;display:none;align-items:center;justify-content:center;background:#05070c}#wb.open{display:flex}
#wbBox{position:relative;--u:.35px;overflow:hidden;background:#0a0d16}#wbBox>*{position:absolute}
#wbBox .wbBk{min-width:0;padding:0;border-radius:50%;font-size:calc(var(--u)*46);z-index:2}#wbBox .wbI{font-weight:900}
.wbT,.wbTD{object-fit:contain;filter:drop-shadow(0 calc(var(--u)*6) calc(var(--u)*8) #000c)}
.wbN{display:flex;align-items:center;justify-content:center;font:900 italic calc(var(--u)*58) system-ui;color:#ffd54a;letter-spacing:calc(var(--u)*3);text-shadow:0 calc(var(--u)*4) 0 #6a1a00,0 0 calc(var(--u)*18) #ff3d00}
.wbW{display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*14);cursor:pointer}.wbW>img{height:100%;width:auto}
.wbW span{display:flex;align-items:center;gap:calc(var(--u)*8);font:900 calc(var(--u)*38) system-ui;color:#80d8ff;text-shadow:0 calc(var(--u)*3) 0 #000;background:#000a;padding:calc(var(--u)*4) calc(var(--u)*18) calc(var(--u)*4) calc(var(--u)*6);border-radius:calc(var(--u)*40)}
.wbW span img,.wbW span canvas{height:calc(var(--u)*64)!important;width:auto!important}.wbW span b{color:#fff}
.wbD>img{position:absolute;inset:0;width:100%;height:100%}.wbD>div{position:absolute;left:25%;right:6%;top:16%;bottom:16%;display:flex;flex-direction:column;justify-content:center;line-height:1.05}
.wbD b{font:900 italic calc(var(--u)*62) system-ui;color:#ffe082;text-shadow:0 calc(var(--u)*4) 0 #000}.wbD small{font:900 calc(var(--u)*22) system-ui;color:#c9d6ee;letter-spacing:calc(var(--u)*1)}
.wbK{display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*8)}.wbK img{height:100%;width:auto;filter:drop-shadow(0 calc(var(--u)*3) calc(var(--u)*3) #000)}.wbK img.off{filter:grayscale(1) brightness(.45)}
.wbK span{font:900 calc(var(--u)*30) system-ui;color:#e3ebff;text-shadow:0 calc(var(--u)*3) 0 #000;margin-left:calc(var(--u)*10)}.wbK b{color:#ffd54a;font-size:1.3em}
.wbList{overflow-y:auto;overflow-x:hidden;touch-action:pan-y;-webkit-mask:linear-gradient(#0000,#000 3%,#000 97%,#0000);mask:linear-gradient(#0000,#000 3%,#000 97%,#0000)}
.wbRow{position:relative;height:calc(var(--u)*140);margin:0 auto calc(var(--u)*6);width:calc(var(--u)*880);cursor:pointer}
.wbRI{position:absolute;left:0;top:0;width:100%;height:100%}.wbRow.s1 .wbRI{animation:wbGlow 1.4s ease-in-out infinite}
@keyframes wbGlow{50%{filter:brightness(1.18)}}
.wbRT{position:absolute;left:calc(var(--u)*48);right:calc(var(--u)*175);top:calc(var(--u)*22);bottom:calc(var(--u)*22);display:flex;flex-direction:column;justify-content:center;gap:calc(var(--u)*4);overflow:hidden}
.wbRT b{font:900 italic calc(var(--u)*32) system-ui;color:#fff;text-shadow:0 calc(var(--u)*3) 0 #000;white-space:nowrap}.wbRT b i{color:#ffcc80;font-size:.8em}
.wbRT span{font:900 calc(var(--u)*30) system-ui;color:#e3ebff;white-space:nowrap;text-shadow:0 calc(var(--u)*2) 0 #000}.wbRT span img{height:1.3em!important;width:auto!important;vertical-align:-.3em!important}
.wbRow.s0 .wbRT{opacity:.85}.wbRow.s2 .wbRT b{color:#b9f6ca}
.wbRow em{position:absolute;right:calc(var(--u)*60);top:50%;transform:translateY(-50%);font:900 italic calc(var(--u)*38) system-ui;color:#3a1d00;background:linear-gradient(#ffe082,#ffb300);padding:calc(var(--u)*8) calc(var(--u)*20);border-radius:calc(var(--u)*14);box-shadow:0 0 0 calc(var(--u)*3) #7a4a00}
.wbRk{cursor:pointer}.wbRk img{width:100%;height:100%;object-fit:contain}.wbRk:active,.wbA:active{transform:scale(.96)}
.wbA{cursor:pointer}.wbA>img{position:absolute;inset:0;width:100%;height:100%}.wbA.dis{filter:grayscale(.85) brightness(.75)}
.wbA>b{position:absolute;left:24%;right:8%;top:22%;bottom:12%;display:flex;flex-direction:column;align-items:center;justify-content:center;font:900 italic calc(var(--u)*54) system-ui;color:#fff;text-shadow:0 calc(var(--u)*4) 0 #5a0000;line-height:1.05}
.wbA>b small{font:900 calc(var(--u)*26) system-ui;color:#ffe082;font-style:normal}
.wbWk{display:flex;align-items:center;justify-content:center;font:900 calc(var(--u)*28) system-ui;color:#ffe082;text-shadow:0 calc(var(--u)*3) 0 #000}
#cpResBox.wbSk{width:min(96vw,420px)!important;background:linear-gradient(#141c30f2,#070a14f2)!important;border:3px solid #e0aa25!important;border-radius:18px!important;padding:12px 12px 14px!important;text-align:center}
.wbRes .wbRT{position:static;display:block;width:88%;margin:-4px auto 0}.wbRK{font:900 italic 26px system-ui;color:#ff8a65;text-shadow:0 3px 0 #000;margin:2px 0 6px}
.wbRD{position:relative;width:92%;aspect-ratio:640/149;margin:0 auto 6px}.wbRD>img{position:absolute;inset:0;width:100%;height:100%}.wbRD>div{position:absolute;left:26%;right:6%;top:14%;bottom:14%;display:flex;flex-direction:column;justify-content:center;text-align:left;line-height:1.05}
.wbRD small{font:900 11px system-ui;color:#c9d6ee}.wbRD b{font:900 italic 32px system-ui;color:#ffe082;text-shadow:0 3px 0 #000}
.wbRL{font:800 14px system-ui;color:#e3ebff;margin:4px 0}.wbRL b{color:#ffe082}.wbRL i{color:#7CFC9A;font-style:normal}.wbRN{font:900 15px system-ui;color:#7CFC9A;margin:6px 0}
.wbRes .cpRow{margin-top:10px}
`;document.head.appendChild(wbCss);
// ---------------------------------------------------------------- v16-63: DUNGEONS (Marius' pictures in img/dg/, cut by tools/dg_cut.py)
// 4 dungeons · 30 floors each · 2 free keys a day per dungeon (DUNGEON PASS: +2 keys and SWEEP, 30 days, real money).
// Rewards are FIXED and never diamonds or tickets (Play: the pass is paid → nothing random, nothing that buys a summon):
//  CASH VAULT = cash · SCRAP MINE = one gear piece (slot in a fixed order) · GEAR FORGE = one SET piece (class + slot in a fixed order)
//  NITRO LAB = NITRO BOOST (+HP & attack for 3 h in Campaign / Torque Tower / Class Towers – not Arena, Cup, World Boss or Dungeons).
// A key is used only when you WIN (a defeat costs nothing). Gear stats come from a seeded generator → the same item every time.
const DG_K=['vault','mine','forge','lab'],DG_N=30,DG_UNLOCK=15,DG_FREE=2,DG_PASS=2,DG_DAYS=30,DG_NIT_H=3,DG_PRICE='€2.99';
const DG={vault:{n:'CASH VAULT',c:'#ffd54a',pool:['hubcap','horn','wiper','imp','gearbox'],mini:'crusher',boss:'titan',r:'CASH',d:'Lots of cash – for buildings, gear upgrades and classic cars.'},
 mine:{n:'SCRAP MINE',c:'#9be7a0',pool:['tire','spider','brute','gearbox','brake'],mini:'sludge',boss:'plow',r:'GEAR',d:'One gear piece every win. The slot changes in a fixed order (Tool → Helmet → … ). Deeper floors = higher grade.'},
 forge:{n:'GEAR FORGE',c:'#ffab40',pool:['canister','turbo','brute','wraith','imp'],mini:'magma',boss:'wyrm',r:'SET PIECES',d:'One SET piece every win. Class and slot change in a fixed order. Deeper floors = higher grade.'},
 lab:{n:'NITRO LAB',c:'#64d8ff',pool:['battery','drone','bat','snake','airbag'],mini:'neonc',boss:'omega',r:'NITRO BOOST',d:'NITRO BOOST: +HP & +attack for '+DG_NIT_H+' hours in Campaign, Torque Tower and Class Towers (not Arena, Cup, World Boss).'}};
const DGS={k:null,sel:0,ret:0};
const dgOK=()=>TE().G.cp.best>=DG_UNLOCK;
function dgG(){const G=TE().G;if(!G.dg)G.dg={d:'',n:{},b:{},c:{mine:0,forge:0},nt:0,np:0};const g=G.dg,d=wbDay();
  DG_K.forEach(k=>{if(g.n[k]==null)g.n[k]=0;if(g.b[k]==null)g.b[k]=0;});if(g.d!==d){g.d=d;DG_K.forEach(k=>g.n[k]=0);}return g;}
const dgPass=()=>{const P=TE().PK;return !!(P&&P.dg&&P.dg>Date.now());};
const dgMax=()=>DG_FREE+(dgPass()?DG_PASS:0);
const dgKeys=k=>Math.max(0,dgMax()-dgG().n[k]);
const dgNitro=()=>{try{const g=dgG();return g.nt>Date.now()?g.np:0;}catch(e){return 0;}};
const dgEq=f=>Math.min(NST-1,Math.round(6+f*f*.95));
const DG_GR={mine:f=>f<=5?1:f<=12?2:f<=20?3:4,forge:f=>f<=10?2:f<=20?3:4},DG_NIT=f=>f<=10?10:f<=20?15:20;
function dgFloor(k,f){const D=DG[k],ki=DG_K.indexOf(k),R=seeded(9001+ki*1013+f*89),pk=a=>a[Math.floor(R()*a.length)],act=Math.min(9,Math.floor((f-1)/3)),cl=m=>act?monClone(m,act):m;
  const n=Math.min(5,3+Math.floor(f/12)),one=()=>cl(pk(D.pool)),mk=q=>{const w=[];for(let i=0;i<q;i++)w.push(one());return w;};
  const boss=f%10===0,mini=f%5===0&&!boss;let w;
  if(boss)w=[mk(n),[cl(D.boss)]];else if(mini)w=[mk(n),[cl(D.mini),one(),one()]];else w=[mk(n),mk(Math.min(5,n+(f%2)))];
  const eq=dgEq(f),mul=stageMul0(eq)*(boss?.78:mini?.9:1)*.9;
  return {dg:k,f,w,mod:-1,eq,mul,boss,mini,st:{n:D.n+' · FLOOR '+f,bio:18,w,boss,mini}};}
function dgRew(k,f){const m=REWARD(dgEq(f)).money,g=dgG(),r={money:Math.round(m*(k==='vault'?5:.6)/10)*10};
  if(k==='mine')r.gear={s:GSLOT[g.c.mine%6].k,r:DG_GR.mine(f)};
  if(k==='forge'){const c=g.c.forge;r.gear={s:GSLOT[c%6].k,r:DG_GR.forge(f),set:CT_K[Math.floor(c/6)%6]};}
  if(k==='lab')r.nitro=DG_NIT(f);const T=TE();r.ess=Math.round(.8*T.ESS_U()*(1+f/30));r.gp=Math.round(T.GP_U()*(k==='mine'?3:k==='forge'?1:.5)*(1+f/30));return r;} // v16-99: every dungeon also gives Essence + Gear Parts
const dgItHtml=q=>'<img src="'+itemIconURL(q.s,q.r,q.set)+'" alt="" style="border-radius:4px;background:'+GRC[q.r]+'55;box-shadow:0 0 0 2px '+GRC[q.r]+'">';
function dgRewHtml(k,f,big){const T=TE(),r=dgRew(k,f),a=EGI(r);
  if(r.gear)a.push(dgItHtml(r.gear)+' <b style="color:'+GRC[r.gear.r]+'">'+GG(r.gear.r).n.toUpperCase()+(r.gear.set?' SET':'')+'</b>');
  if(r.nitro)a.push('<img src="img/dg/k_lab.webp" alt=""> +'+r.nitro+'% · '+DG_NIT_H+'h');
  if(k==='vault'||big)a.push('<img src="img/ui2/i_coins.webp" alt=""> '+T.fmt(r.money));
  return '<span class="twRw">'+a.join(' &nbsp;')+'</span>';}
function dgItem(q){const o=Math.random;Math.random=seeded(424242+GR().nid*31);try{return newItem(q.s,q.r,q.set);}finally{Math.random=o;}}
function dgAddNitro(p){const g=dgG(),now=Date.now(),on=g.nt>now,cap=now+12*36e5;
  if(on&&g.np>p){g.nt=Math.min(cap,g.nt+DG_NIT_H*36e5*p/g.np);return;}g.np=p;g.nt=Math.min(cap,(on?g.nt:now)+DG_NIT_H*36e5);}
function dgGive(k,f){const T=TE(),G=T.G,g=dgG(),r=dgRew(k,f),rws=[['<img src="img/ui2/i_coins.webp">',T.fmt(r.money)],[T.ESI,T.nf(r.ess)],[T.GPI,T.nf(r.gp)]];let txt='+'+T.fmt(r.money)+' · '+T.ESI+' +'+T.nf(r.ess)+' · '+T.GPI+' +'+T.nf(r.gp);G.money+=r.money;giveEG(r);
  if(r.gear){const it=dgItem(r.gear),gr=GR();g.c[k]++;const gn=GG(r.gear.r).n.toUpperCase();
    if(gr.inv.length>=GINV){const v=salvageV(it);G.gp=(G.gp||0)+v;rws.push([dgItHtml(r.gear),'BAG FULL']);txt+=' · bag full → '+GPN(v);}else{gr.inv.push(it);rws.push([dgItHtml(r.gear),gn]);txt+=' · '+itemName(it)+' ('+gn+')';}}
  if(r.nitro){dgAddNitro(r.nitro);rws.push(['<img src="img/dg/k_lab.webp">','+'+r.nitro+'%']);txt+=' · NITRO +'+r.nitro+'% for '+DG_NIT_H+'h';}
  T.save();if(T.updHud)T.updHud();return {rws,txt};}
function dgNoKeys(){TE().toast('🔑 No keys left for '+DG[DGS.k].n+' today · new keys at midnight'+(dgPass()?'':' · DUNGEON PASS: +'+DG_PASS+' keys a day'),3000);}
const dgLeft=()=>{const ms=new Date();ms.setHours(24,0,0,0);const l=ms-Date.now();return Math.floor(l/36e5)+'h '+Math.floor(l%36e5/6e4)+'m';};
const dgNitTxt=()=>{const p=dgNitro();if(!p)return '';const l=dgG().nt-Date.now();return 'NITRO +'+p+'% · '+Math.floor(l/36e5)+'h '+Math.floor(l%36e5/6e4)+'m';};

const dgEl=document.createElement('div');dgEl.id='dg';dgEl.innerHTML='<div id="dgBox"></div>';root.appendChild(dgEl);
const dgPw=document.createElement('div');dgPw.id='dgPw';dgPw.innerHTML='<div id="dgPwBox"></div>';root.appendChild(dgPw);
const dgMap=()=>TALL.map(1024,1536,[[1100,1]]);
addEventListener('resize',()=>{if(dgEl.classList.contains('open'))dgRender();});
function dgRender(){if(DGS.k)dgRenderOne(DGS.k);else dgRenderList();}
// list page: title · DUNGEON PASS · 4 cards · info bar
function dgRenderList(){const T=TE(),g=dgG(),M=dgMap(),bx=$('dgBox');TALL.size(bx,M);GYM=M;
  let h=TALL.bg(M,'img/dg/dg_bg.webp',0,0,1024,1536,'gsBg');
  h+='<img class="dgT" src="img/dg/title.webp" alt="DUNGEONS" style="'+gbx(112,6,800,262)+'">';
  h+='<button class="cpB dgBk" data-dg="back" style="'+gbx(18,18,96,96)+'">↩</button><button class="cpB dgBk" data-dg="info" style="'+gbx(910,18,96,96)+'">?</button>';
  h+='<div class="dgPB" data-dg="pass" style="'+gbx(232,292,560,123)+'"><img src="img/dg/b_pass.webp" alt="DUNGEON PASS"></div>';
  h+='<div class="dgPS" style="'+gbx(162,420,700,50)+'"><span>'+(dgPass()?'<b>ACTIVE</b> · '+Math.ceil((TE().PK.dg-Date.now())/864e5)+' days left · '+dgMax()+' keys a day + SWEEP':'Free: <b>'+DG_FREE+' keys</b> a day in every dungeon · a key is used only when you win')+'</span></div>';
  GYM=null;const y0=M.top(490),y1=M.top(1100)-40,grid=y1-y0>1300,cw=grid?Math.min(420,((y1-y0-60)/2)*.4417):240,ch=cw/.4417; // tall phone → 2×2 bigger cards
  DG_K.forEach((k,i)=>{const D=DG[k],ky=dgKeys(k),x=grid?512+(i%2?14:-14-cw):14+i*252,y=grid?y0+(y1-y0-2*ch-60)/2+Math.floor(i/2)*(ch+60):y0+(y1-y0-ch)*.35;
    h+='<div class="dgC" data-dk="'+k+'" style="'+'left:'+GSU(x)+';top:'+GSU(y)+';width:'+GSU(cw)+';height:'+GSU(ch)+';--cs:'+(cw/240)+'"><img src="img/dg/c_'+k+'.webp" alt="'+D.n+'"><div class="dgCP"><b>FLOOR '+Math.min(DG_N,g.b[k]+1)+'<i>/'+DG_N+'</i></b><span><img src="img/dg/k_'+k+'.webp" alt="">'+ky+'/'+dgMax()+'</span></div><div class="dgCR" style="color:'+D.c+'">'+D.r+'</div>'+(ky?'<em></em>':'')+'</div>';});
  const nt=dgNitTxt();GYM=M;
  h+='<div class="dgBar" style="'+gbx(62,1110,900,115)+'"><img src="img/dg/bar.webp" alt=""><span>'+(nt?'<img src="img/dg/k_lab.webp" alt=""> <b>'+nt+'</b> · ':'')+'New keys in <b>'+dgLeft()+'</b> · rewards are fixed</span></div>';
  GYM=null;bx.innerHTML=h;}
// one dungeon: card · keys · floor list · ENTER / SWEEP
function dgRenderOne(k){const T=TE(),g=dgG(),D=DG[k],M=dgMap(),bx=$('dgBox'),cur=Math.min(DG_N,g.b[k]+1),ky=dgKeys(k);TALL.size(bx,M);GYM=M;
  if(!DGS.sel||DGS.sel>cur)DGS.sel=cur;const f=DGS.sel;
  let h=TALL.bg(M,'img/dg/bt_'+k+'.webp',0,0,1024,1536,'gsBg')+'<div class="dgDim" style="'+gbx(0,0,1024,1536)+'"></div>';
  h+='<button class="cpB dgBk" data-dg="list" style="'+gbx(18,18,96,96)+'">↩</button><button class="cpB dgBk" data-dg="info" style="'+gbx(910,18,96,96)+'">?</button>';
  h+='<img class="dgOC" src="img/dg/c_'+k+'.webp" alt="'+D.n+'" style="'+gbx(40,40,250,566)+'">';
  let p='<div class="dgN" style="color:'+D.c+'">'+D.n+'</div><div class="dgD">'+D.d+'</div>';
  p+='<div class="dgK">'+Array.from({length:dgMax()},(_,i)=>'<img src="img/dg/k_'+k+'.webp" alt="" class="'+(i<ky?'':'off')+'">').join('')+(dgPass()?'':'<img src="img/dg/k_pass.webp" alt="" class="pk" data-dg="pass">')+'</div>';
  p+='<div class="dgL"><b>'+ky+'/'+dgMax()+'</b> KEYS · new in '+dgLeft()+'</div>';
  p+='<div class="dgL">BEST <b>'+g.b[k]+'</b> / '+DG_N+'</div>';
  if(k==='lab'){const nt=dgNitTxt();p+='<div class="dgL">'+(nt?'<b>'+nt+'</b>':'NITRO BOOST: off')+'</div>';}
  if(k==='mine'||k==='forge'){const q=dgRew(k,f).gear;p+='<div class="dgL">NEXT: <b>'+(q.set?ROLE[q.set].n.toUpperCase()+' SET · ':'')+GS[q.s].n.toUpperCase()+'</b></div>';}
  h+='<div class="dgP" style="'+gbx(316,46,680,560)+'">'+p+'</div>';
  h+='<div class="dgList" id="dgList" style="'+gbx(62,632,900,630)+'">';
  for(let i=1;i<=DG_N;i++){const F=dgFloor(k,i),st=i===f?'cur':i<=g.b[k]?'done':i>cur?'lock':F.boss||F.mini?'boss':'norm';
    h+='<div class="dgRow '+st+'" data-f="'+i+'"><img src="img/dg/f_'+st+'.webp" alt=""><b class="dgRN">'+i+'</b><div class="dgRT"><b>FLOOR '+i+(F.boss?' · <i>BOSS</i>':F.mini?' · <i>MINI-BOSS</i>':'')+'</b>'+dgRewHtml(k,i)+'</div></div>';}
  h+='</div>';
  const can=ky>0,sw=g.b[k]>0;
  h+='<div class="dgBtn" data-dg="go" style="'+gbx(56,1290,440,146)+'"><img src="img/dg/b_'+(can?'enter':'lock')+'.webp" alt="ENTER"></div>';
  h+='<div class="dgBtn'+(dgPass()&&sw&&can?'':' dis')+'" data-dg="sweep" style="'+gbx(528,1290,440,146)+'"><img src="img/dg/b_sweep.webp" alt="SWEEP">'+(dgPass()?'':'<img class="lk" src="img/ui7/lock_big.webp" alt="">')+'</div>';
  const my=teamPower(curTeamList().filter(Boolean)),pw=dgPower(k,f);
  h+='<div class="dgSel" style="'+gbx(40,1444,944,80)+'">FLOOR '+f+' · <span style="color:'+(my>=pw*1.15?'#7CFC9A':my>=pw*.85?'#ffd54a':'#ff8a80')+'">⚡ '+my.toLocaleString()+' vs '+pw.toLocaleString()+'</span>'+(dgPass()?'':' · SWEEP needs DUNGEON PASS')+'</div>';
  GYM=null;bx.innerHTML=h;const L=$('dgList'),c=L.querySelector('.cur');if(c)L.scrollTop=c.offsetTop-L.clientHeight/2+c.offsetHeight/2;}
function dgPower(k,f){const F=dgFloor(k,f);let p=0;F.w.forEach(w=>w.forEach(t=>{const M=MON[t];p+=(M.hp*.25+M.atk*6+M.def*4)*F.mul;}));return Math.round(p/F.w.length*1.05);}
function dgOpen(k){if(!dgOK()){TE().toast('🔒 DUNGEONS open after campaign stage '+sLabel(DG_UNLOCK),2600);return;}
  rootOn();DGS.k=k||null;if(k)DGS.sel=0;dgEl.classList.add('open');dgRender();}
function dgClose(){dgEl.classList.remove('open');DGS.k=null;if(!backToHub())close();}
function dgInfo(){const T=TE();let x='<div class="wS">HOW IT WORKS</div><div class="wP"><div>4 dungeons · <b>'+DG_N+' floors</b> each · a boss every 10th floor.</div><div><b>'+DG_FREE+' free keys</b> a day in EVERY dungeon. A key is used <b>only when you win</b>.</div><div>Win a floor to open the next one. You can replay any floor you reached.</div><div>Rewards are <b>fixed</b> – nothing is random. Dungeons never give diamonds or tickets.</div></div>';
  DG_K.forEach(k=>{const D=DG[k];x+='<div class="wS">'+D.n+'</div><div class="wP twMP"><img src="img/dg/k_'+k+'.webp" alt=""><span>'+D.d+'</span></div>';
    x+='<div class="wP">'+[1,10,20,30].map(f=>'Floor '+f+': '+dgRewHtml(k,f,k!=='vault')).join('<br>')+'</div>';});
  x+='<div class="wS">DUNGEON PASS · '+DG_PRICE+' · '+DG_DAYS+' DAYS</div><div class="wP"><div>+'+DG_PASS+' keys a day in every dungeon ('+(DG_FREE+DG_PASS)+' instead of '+DG_FREE+').</div><div>SWEEP: finish a floor you already cleared in one tap.</div><div>No automatic renewal.</div></div>';
  popW('DUNGEONS',x);}
function dgPassWin(){const on=dgPass(),d=on?Math.ceil((TE().PK.dg-Date.now())/864e5):0,u=n=>'calc(var(--u)*'+n+')',b=(x,y,w,hh)=>'left:'+u(x)+';top:'+u(y)+';width:'+u(w)+';height:'+u(hh)+';';
  const k=Math.min(innerWidth*.96/900,innerHeight*.96/1395),bx=$('dgPwBox');bx.style.width=900*k+'px';bx.style.height=1395*k+'px';bx.style.setProperty('--u',k+'px');
  bx.innerHTML='<img src="img/dg/pass_w.webp" alt="DUNGEON PASS" style="'+b(0,0,900,1395)+'"><button class="dgPX" data-pw="x" style="'+b(776,74,106,98)+'" aria-label="close"></button>'+
    '<div class="dgPD" style="'+b(80,690,740,150)+'"><span>Fixed rewards only · no diamonds, no tickets.<br><b>'+DG_DAYS+' days</b> · no automatic renewal</span></div>'+
    [['<img src="img/dg/k_vault.webp" alt="">','<b>+'+DG_PASS+' KEYS</b> a day in every dungeon'],['<img src="img/dg/b_sweep.webp" alt="" class="w">','<b>SWEEP</b> · cleared floors in one tap'],['<img src="img/dg/k_pass.webp" alt="">','<b>'+(DG_FREE+DG_PASS)+' keys</b> instead of '+DG_FREE+' · '+DG_DAYS+' days']].map((r,i)=>'<div class="dgPR" style="'+b(80,860+i*120,740,104)+'">'+r[0]+'<span>'+r[1]+'</span></div>').join('')+
    '<div class="dgPBy'+(on?' on':'')+'" data-pw="buy" style="'+b(176,1230,546,132)+'">'+(on?'ACTIVE · '+d+' DAYS LEFT':DG_PRICE+' · BUY')+'</div>';
  dgPw.classList.add('open');}
dgPw.addEventListener('click',e=>{const el=e.target.closest('[data-pw]');if(!el){if(e.target===dgPw)dgPw.classList.remove('open');return;}
  if(el.dataset.pw==='x'){dgPw.classList.remove('open');return;}
  if(el.dataset.pw==='buy'){if(el.dataset.busy)return;el.dataset.busy=1;const T=TE();
    (window.SEC?SEC.buy('dg'):Promise.resolve(false)).then(ok=>{delete el.dataset.busy;if(!ok)return;T.PK.dg=Math.max(Date.now(),T.PK.dg||0)+DG_DAYS*864e5;T.savePacks();
      T.toast('🔑 DUNGEON PASS active for '+DG_DAYS+' days! +'+DG_PASS+' keys a day + SWEEP',4000);dgPassWin();if(dgEl.classList.contains('open'))dgRender();});}});
function dgGo(direct){const k=DGS.k,g=dgG(),f=DGS.sel||Math.min(DG_N,g.b[k]+1);if(!dgKeys(k)){dgNoKeys();return;}if(f>g.b[k]+1)return;
  dgEl.classList.remove('open');if(direct===true)return dgGo0(teamHeroes(),k,f);openTeam(dgEq(f),mainCX(DG[k].n.toUpperCase()+' · FLOOR '+f,()=>dgPower(k,f),team=>dgGo0(team,k,f),()=>{DGS.k=k;dgEl.classList.add('open');dgRender();}));}
function dgGo0(team,k,f){DGS.k=k;if(!team||!team.length)team=bestTeam().map(heroOf);dgEl.classList.remove('open');try{team.forEach(h=>{const d=sprOf(h);if(d)sprLoad(d);});}catch(e){}
  safeStart(dgEq(f),team,dgFloor(k,f));}
function dgSweep(){const k=DGS.k,g=dgG();if(!dgPass()){dgPassWin();return;}if(!g.b[k]){TE().toast('Win floor 1 first – SWEEP repeats floors you already cleared',2600);return;}if(!dgKeys(k)){dgNoKeys();return;}
  const f=Math.min(DGS.sel||g.b[k],g.b[k]);g.n[k]++;const R=dgGive(k,f);TE().toast('⏩ SWEEP '+DG[k].n+' floor '+f+': '+R.txt,3000);dgRender();}
function dgFinish(win,retreat){const T=TE(),g=dgG(),F=B.tw,k=F.dg,f=F.f,D=DG[k];let html;
  if(win){const first=f>g.b[k];if(first)g.b[k]=f;g.n[k]++;const R=dgGive(k,f),ky=dgKeys(k);
    html=`<div class="rsV"><img class="hi" src="img/ui2/victory.webp" alt="VICTORY"><div class="rsL">${D.n} · FLOOR ${f}<small>${first&&f<DG_N?'FLOOR '+(f+1)+' IS OPEN':f>=DG_N&&first?'ALL FLOORS CLEARED!':'KEYS LEFT TODAY: '+ky}</small></div>
      ${R.rws.slice(0,4).map((q,i)=>`<div class="rsS" style="left:${[10.7,31.3,51.6,72][i]}%">${q[0]}<b>${q[1]}</b></div>`).join('')}
      <div class="rsU">${R.txt.includes(' · ')?R.txt.slice(R.txt.indexOf(' · ')+3)+' · ':''}Best: floor ${g.b[k]} / ${DG_N} · keys ${ky}/${dgMax()}</div></div>
      <div class="rsM"><div class="cpRow">${ky&&f<DG_N&&f+1<=g.b[k]+1?'<button class="cpGo" data-a="dgnext">NEXT FLOOR ▶</button>':''}${ky?'<button class="cpGo alt" data-a="dgagain">AGAIN</button>':''}<button class="cpGo alt" data-a="dg">DUNGEON</button></div></div>`;}
  else{html=`<div class="rsD"><img class="hi" src="img/ui2/defeat.webp" alt="DEFEAT">${retreat?'<div class="rsR">RETREAT</div>':''}<div class="rsL">${D.n} · FLOOR ${f}<small>NO KEY USED – tap one to get stronger</small></div>
      <div class="rsDB b0" data-a="gear"><img src="img/ui2/i_forge.webp"><span><b>Equip & upgrade gear</b>Scrap Mine + Gear Forge give gear</span></div>
      <div class="rsDB b1" data-a="hsum">${TKI}<span><b>Summon more mechanics</b>higher color = much stronger · duplicates +1 star</span></div>
      <div class="rsDB b2" data-a="team"><img src="img/ui2/i_star1.webp"><span><b>Better team & skills</b>or try an easier floor</span></div>
      <button class="rsGo" data-a="dgagain">RETRY</button></div>
      <div class="rsM"><div class="cpRow"><button class="cpGo alt" data-a="team">${IMGI('img/ui2/i_star1.webp','1.3em','-.35em')} HEROES</button><button class="cpGo alt" data-a="dg">DUNGEON</button></div></div>`;}
  $('cpResBox').classList.add('rsSk');$('cpResBox').innerHTML=html;$('cpRes').classList.add('open');$('cpResBox').scrollTop=0;clearInterval(ANX.id);
  $('cpResBox').onclick=e=>{const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;$('cpRes').classList.remove('open');$('bt').classList.remove('open');DGS.k=k;
    if(a==='dgnext'){DGS.sel=f+1;dgGo(true);}else if(a==='dgagain'){DGS.sel=f;dgGo(true);}
    else if(a==='team'||a==='gear'){showMap();DGS.ret=1;openGear();}
    else if(a==='hsum'){showMap();DGS.ret=1;openGear();const T2=TE();if(T2.openSummon){const sm=document.getElementById('sm');if(sm)sm.style.zIndex=30;T2.openSummon('m');}}
    else{showMap();DGS.sel=f;rootOn();dgEl.classList.add('open');dgRender();}};}
dgEl.addEventListener('click',e=>{const T=TE();const c=e.target.closest('[data-dk]');if(c){DGS.k=c.dataset.dk;DGS.sel=0;dgRender();return;}
  const el=e.target.closest('[data-dg]');if(el){const a=el.dataset.dg;
    if(a==='back')dgClose();else if(a==='list'){DGS.k=null;dgRender();}else if(a==='info')dgInfo();else if(a==='pass')dgPassWin();
    else if(a==='go')dgGo();else if(a==='sweep')dgSweep();return;}
  const r=e.target.closest('.dgRow');if(r){const f=+r.dataset.f,g=dgG();if(f>g.b[DGS.k]+1){T.toast('🔒 Win floor '+(g.b[DGS.k]+1)+' first',2000);return;}DGS.sel=f;dgRender();}});
const dgCss=document.createElement('style');dgCss.textContent=`
#dg{position:fixed;inset:0;z-index:8;display:none;align-items:center;justify-content:center;background:#05070c}#dg.open{display:flex}
#dgBox{position:relative;--u:.35px;overflow:hidden;background:#0a0d16}#dgBox>*{position:absolute}
#dgBox .dgBk{min-width:0;padding:0;border-radius:50%;font-size:calc(var(--u)*46);font-weight:900;z-index:2}
.dgT,.dgOC{object-fit:contain;filter:drop-shadow(0 calc(var(--u)*6) calc(var(--u)*8) #000c)}
.dgPB,.dgC,.dgBtn{cursor:pointer;transition:transform .12s}.dgPB:active,.dgC:active,.dgBtn:active{transform:scale(.96)}
.dgPB img,.dgBtn>img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 calc(var(--u)*5) calc(var(--u)*6) #000b)}
.dgPS,.dgSel{display:flex;align-items:center;justify-content:center;text-align:center;font:900 calc(var(--u)*26) system-ui;color:#e3ebff;text-shadow:0 calc(var(--u)*3) 0 #000;background:#000a;border-radius:calc(var(--u)*30)}.dgPS b{color:#ffd54a;margin:0 .25em}
.dgSel{font-size:calc(var(--u)*30);background:#000b}
.dgC>img{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 calc(var(--u)*8) calc(var(--u)*10) #000c)}
.dgCP{position:absolute;left:12%;right:12%;top:80.6%;height:11.6%;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.05}
.dgCP b{font:900 italic calc(var(--u)*28*var(--cs,1)) system-ui;color:#fff;text-shadow:0 calc(var(--u)*3) 0 #000}.dgCP b i{font-size:.75em;color:#9fb3d1}
.dgCP span{display:flex;align-items:center;gap:calc(var(--u)*4);font:900 calc(var(--u)*24*var(--cs,1)) system-ui;color:#ffe082;text-shadow:0 calc(var(--u)*2) 0 #000}.dgCP span img{height:calc(var(--u)*32*var(--cs,1));width:auto}
.dgCR{position:absolute;left:0;right:0;top:101%;text-align:center;font:900 italic calc(var(--u)*24*var(--cs,1)) system-ui;text-shadow:0 calc(var(--u)*3) 0 #000}
.dgC em{position:absolute;right:4%;top:2%;width:calc(var(--u)*30);height:calc(var(--u)*30);border-radius:50%;background:#ff3d3d;box-shadow:0 0 0 calc(var(--u)*3) #fff,0 0 calc(var(--u)*10) #f00}
.dgBar>img{position:absolute;inset:0;width:100%;height:100%}.dgBar span{position:absolute;left:5%;right:5%;top:0;bottom:0;display:flex;align-items:center;justify-content:center;gap:calc(var(--u)*6);font:900 calc(var(--u)*26) system-ui;color:#d7e3ff;text-shadow:0 calc(var(--u)*2) 0 #000;white-space:nowrap}.dgBar b{color:#ffe082}.dgBar span img{height:calc(var(--u)*44);width:auto}
.dgDim{background:linear-gradient(#05070cee,#05070c99 45%,#05070cdd 75%,#05070cf2)}
.dgP{display:flex;flex-direction:column;justify-content:center;gap:calc(var(--u)*12);padding:calc(var(--u)*14) calc(var(--u)*24);background:linear-gradient(#0d1a33e6,#05081ae6);border-radius:calc(var(--u)*24);box-shadow:0 0 0 calc(var(--u)*3) #e0aa25,0 calc(var(--u)*6) calc(var(--u)*14) #000a;box-sizing:border-box}
.dgN{font:900 italic calc(var(--u)*58) system-ui;letter-spacing:calc(var(--u)*2);text-shadow:0 calc(var(--u)*4) 0 #000,0 0 calc(var(--u)*16) currentColor}
.dgD{font:800 calc(var(--u)*25) system-ui;color:#c9d6ee;line-height:1.25}
.dgK{display:flex;align-items:center;gap:calc(var(--u)*8);height:calc(var(--u)*92)}.dgK img{height:100%;width:auto;filter:drop-shadow(0 calc(var(--u)*3) calc(var(--u)*3) #000)}.dgK img.off{filter:grayscale(1) brightness(.4)}.dgK img.pk{cursor:pointer;opacity:.85;margin-left:auto}
.dgL{font:900 calc(var(--u)*28) system-ui;color:#e3ebff;text-shadow:0 calc(var(--u)*2) 0 #000}.dgL b{color:#ffd54a;font-size:1.15em}
.dgList{overflow-y:auto;overflow-x:hidden;touch-action:pan-y;padding:calc(var(--u)*6) 0;-webkit-mask:linear-gradient(#0000,#000 4%,#000 96%,#0000);mask:linear-gradient(#0000,#000 4%,#000 96%,#0000)}
.dgRow{position:relative;width:calc(var(--u)*880);height:calc(var(--u)*102);margin:0 auto calc(var(--u)*6);cursor:pointer}.dgRow>img{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.dgRow.lock{opacity:.8}.dgRow.cur>img{animation:wbGlow 1.4s ease-in-out infinite}
.dgRN{position:absolute;left:calc(var(--u)*22);top:calc(var(--u)*18);width:calc(var(--u)*104);height:calc(var(--u)*66);display:flex;align-items:center;justify-content:center;font:900 italic calc(var(--u)*40) system-ui;color:#fff;text-shadow:0 calc(var(--u)*3) 0 #000}
.dgRow.cur .dgRN{color:#ffd54a}.dgRow.lock .dgRN{color:#9aa4b1}
.dgRT{position:absolute;left:calc(var(--u)*165);right:calc(var(--u)*110);top:calc(var(--u)*10);bottom:calc(var(--u)*10);display:flex;flex-direction:column;justify-content:center;gap:calc(var(--u)*2);overflow:hidden}
.dgRT>b{font:900 italic calc(var(--u)*30) system-ui;color:#fff;text-shadow:0 calc(var(--u)*3) 0 #000;white-space:nowrap}.dgRT>b i{color:#ff8a65}.dgRow.cur .dgRT>b{color:#ffe082}.dgRow.done .dgRT>b{color:#b9f6ca}
.dgRT .twRw{font:900 calc(var(--u)*26) system-ui;color:#d7e3ff;white-space:nowrap;text-shadow:0 calc(var(--u)*2) 0 #000}
.dgBtn.dis{filter:grayscale(.8) brightness(.7)}.dgBtn .lk{position:absolute;right:-4%;top:-14%;width:30%;height:auto}
#dgPw{position:fixed;inset:0;z-index:12;display:none;align-items:center;justify-content:center;background:#000b}#dgPw.open{display:flex}
#dgPwBox{position:relative;--u:.35px}#dgPwBox>*{position:absolute}
.dgPX{background:none;border:0;cursor:pointer;padding:0}
.dgPD{display:flex;align-items:center;justify-content:center;text-align:center;font:900 calc(var(--u)*30) system-ui;color:#e3ebff;text-shadow:0 calc(var(--u)*2) 0 #000;line-height:1.3}.dgPD b{color:#ffd54a}
.dgPR{display:flex;align-items:center;gap:calc(var(--u)*18);padding:0 calc(var(--u)*24);box-sizing:border-box}.dgPR img{height:calc(var(--u)*76);width:auto}.dgPR img.w{height:calc(var(--u)*56)}
.dgPR span{font:900 calc(var(--u)*31) system-ui;color:#e3ebff;text-shadow:0 calc(var(--u)*2) 0 #000}.dgPR b{color:#ffd54a}
.dgPBy{display:flex;align-items:center;justify-content:center;font:900 italic calc(var(--u)*50) system-ui;color:#fff;text-shadow:0 calc(var(--u)*4) 0 #6a2a00;cursor:pointer}.dgPBy:active{transform:scale(.96)}.dgPBy.on{font-size:calc(var(--u)*38);color:#ffe082}
`;document.head.appendChild(dgCss);
// v16-91 (Marius): FULL TEST ACCOUNT (owner only, SEC.TEST_ACC) – everything unlocked / maxed, hidden from all rankings on the server
function testFill(){const T=TE(),G=T.G;let first=!G.tacc;
  // resources are topped up at every start
  G.money=Math.max(G.money||0,1e10);G.dm=Math.max(G.dm||0,1e6);G.h.tk=Math.max(G.h.tk||0,10000);G.h.ct=Math.max(G.h.ct||0,10000);const g=GR();g.tk=Math.max(g.tk||0,10000);G.ess=Math.max(G.ess||0,1e12);G.gp=Math.max(G.gp||0,1e10);
  if(!G.t99){G.t99=1;for(const id in G.h.own){const o=G.h.own[id],h=T.HB[id];if(!h)continue;o.lv=300;o.a=14;if(h.gr===5)o.s=Math.min(o.s||0,20);}first=first||false;T.save();}
  if(!first){T.save();return false;}
  G.tacc=1;G.tut=1;G.vip=Math.max(G.vip||0,28000);G.xp=Math.max(G.xp||0,179900);G.rep=30;G.sold=Math.max(G.sold||0,5000);
  Object.keys(G.lv).forEach(k=>G.lv[k]=10);
  T.HEROES.forEach(h=>{if(h.soon)return;G.h.own[h.id]={s:h.gr===5?20:50,lv:300,a:14};G.h.disc[h.id]=1;});G.t99=1;G.m99=1;
  G.cp.best=NST;for(let i=0;i<NST;i++)G.cp.stars[i]=3;G.cph={best:NST,stars:{},ch:0};for(let i=0;i<NST;i++)G.cph.stars[i]=3;
  // gear: a full Ascended ★5 Lv 60 class set for every Legendary + Mythic battle hero + a few Mythic pieces to try STAR UP / ASCEND
  const hs=myMechs().filter(h=>h.gr>=4);g.inv=[];g.eq={};
  hs.forEach(h=>{GSLOT.forEach(sl=>{const it=newItem(sl.k,6,SETS[roleOf(h)]?roleOf(h):'all');it.lv=GMAXR[6];it.sr=5;g.inv.push(it);equip(h.id,it);});});
  GSLOT.forEach(sl=>{for(let k=0;k<2;k++){const it=newItem(sl.k,5);it.lv=GMAXR[5];g.inv.push(it);}});
  G.cp.team=myMechs().slice(0,5).map(h=>h.id);
  T.save();return true;}
if(window.SEC&&SEC.TEST_ACC){try{if(testFill())setTimeout(()=>location.reload(),300);}catch(e){console.error('testFill',e);}}
window.CAMPAIGN={gs:{guide:()=>gearGuide(),d:GSD,sum:n=>gsummon(n),rates:()=>gsRates(),icon:(sl,r)=>itemIconURL(sl,r),RATE:GS_RATE,PITY:GS_PITY.l,INV:GINV,GTKI,bag:()=>gsBag()},spr:id=>SPRD[id]||null,gearSum:()=>{if(!root.classList.contains('open')){open();gsHome=1;}if(!$('cpGear').classList.contains('open'))openGear();openGSum();},openColl:()=>{if(!root.classList.contains('open')){open();collHome=1;}if(!$('cpGear').classList.contains('open'))openGear();gPage('coll');},passives:pasOf,skill:h=>skOf(h),roleName:h=>ROLE[roleOf(h)].n,open,close,openGear,mini,arenaTeam,pose,hasSpr,sLabel:i=>sLabel(Math.max(0,Math.min(NST-1,i))),NST:()=>NST,heroOf,portraitURL,teamPower:()=>teamPower(curTeamList().filter(Boolean)),best:()=>TE().G.cp.best,tower:()=>twOpen(),hub:()=>hubOpen(),classTowers:k=>ctOpen(k),worldBoss:()=>wbOpen(),dungeons:k=>dgOpen(k),wbReady:()=>{try{return wbReady();}catch(e){return false;}}};
if(window.SEC&&SEC.TEST_MODE)window.__DEV={card:i=>{rootOn();showMap();openCard(i);},popItem:id=>popItem(id),openGSum:()=>{root.classList.add('open');window.__BATTLE_ON=true;openGear();openGSum();},CP:()=>window.CAMPAIGN,startBattle:(si,ids)=>{root.classList.add('open');window.__BATTLE_ON=true;startBattle(si,(ids||bestTeam()).map(heroOf));},get B(){return B;},gr:()=>GR(),newItem,gPage,openGear,sel:id=>{gsel=id;renderGear();gPage('hero');},tower:f=>{root.classList.add('open');window.__BATTLE_ON=true;const F=twFloor(f);startBattle(F.eq,bestTeam().map(heroOf),F);},twFloor:f=>twFloor(f),ctFloor,ct:(k,f)=>{root.classList.add('open');window.__BATTLE_ON=true;const F=ctFloor(k,f);startBattle(F.eq,ctTeam(k).length?ctTeam(k):bestTeam().map(heroOf),F);},wb:()=>{root.classList.add('open');window.__BATTLE_ON=true;const w=wbG();w.n=0;wbGo();},wbG:()=>wbG(),dg:(k,f)=>{root.classList.add('open');window.__BATTLE_ON=true;startBattle(dgEq(f),bestTeam().map(heroOf),dgFloor(k,f));},dgG:()=>dgG(),dgOpen:k=>{const G=TE().G;G.cp.best=Math.max(G.cp.best,DG_UNLOCK);dgOpen(k);},dgPass:()=>dgPassWin(),wbSet:i=>{WBF=i;},wbOpen:()=>{const G=TE().G;G.cp.best=Math.max(G.cp.best,WB_UNLOCK);wbOpen();},towerW:(w,mul)=>{root.classList.add('open');window.__BATTLE_ON=true;const F=twFloor(1);F.w=[w];F.st.w=F.w;F.mod=-1;F.st.n='TEST';F.mul=mul||.2;startBattle(F.eq,bestTeam().map(heroOf),F);},simRun:(si,ids,t)=>{window.__SIM=1;try{return simRun(si,(ids||bestTeam()).map(heroOf),t);}finally{window.__SIM=0;}}};
})();
