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
#cpPop{position:absolute;inset:0;z-index:9;display:none;align-items:center;justify-content:center;background:rgba(2,3,5,.8)}#cpPop.open{display:flex}
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
<div id="cpGear"><div class="gTop"><button class="cpB" data-g="back">↩</button><div class="gTitle pic"><img src="img/ui/t_gear.webp" alt="GEAR"></div><div id="gMoney"></div></div><button class="gsGo" id="gGSB"></button>
<div id="gHeroes"></div><div id="gMain"></div><div id="gStats"></div><div id="gBtns"></div><div id="gFil"></div><div id="gInv"></div></div>
<div id="gSum"><div class="gTop"><button class="cpB" data-gs="back">↩</button><div class="gTitle pic"><img src="img/ui/t_gsum.webp" alt="GEAR SUMMON"></div><div id="gsTk" class="gsTkP"></div></div>
<canvas id="gsHeroCv"></canvas><div id="gsTiles"></div><div id="gsPity"></div>
<div class="gsBtns"><button id="gsB1" class="gsBtn" data-gs="1"><b>SUMMON x1</b><span>${GTKI0} 1</span></button><button id="gsB10" class="gsBtn big" data-gs="10"><b>SUMMON x10</b><span>${GTKI0} 10 · <i>+1 BONUS</i></span></button></div>
<div class="gsLinks"><button class="cpB sm" data-gs="rates"><i class="ii">i</i> Rate Info</button><button class="cpB sm" data-gs="hist">📋 Summon History</button><button class="cpB sm" data-gs="gear" id="gsBag">BAG</button></div></div>
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
const GMUL=[1,1.32,1.75,2.3,3.0,3.9];
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
for(const k in MON){const M=MON[k];M.dr=M.dr||k;M.sc=M.sc||1;M.big=M.big||1;M.b=M.b||'';}

// 5 chapters × 20 stages · 4 zones of 5 stages each
const CHAP=[
 {n:'Scrapyard Wastes',col:'#ff8f00',bios:[0,1,2,3],zones:['Rusty Junkyard','Smog Valley','Burning Stacks',"Titan's Foundry"],
  pool:[['imp','tire'],['imp','tire','snake','drone'],['tire','snake','drone','spider'],['spider','drone','snake','brute']],mini:'crusher',boss:'titan',
  names:['Rust Gate','Tire Hills','Crushed Row','Bolt Alley','Wreck Ridge','Smog Valley','Muffler Marsh','Oil Lake','Fume Gate','Crusher Pit','Burning Stacks','Magnet Yard','Cinder Walk','Furnace Road','Ember Heap','Slag River','Gear Graveyard','Molten Gate','Foundry Steps',"Titan's Foundry"]},
 {n:'Toxic Refinery',col:'#76ff03',bios:[4,5,6,7],zones:['Acid Swamp','Pipe Maze','Tank Farm','Refinery Core'],
  pool:[['imp','canister','tire'],['canister','snake','battery','drone'],['battery','canister','spider','drone'],['battery','canister','brute','snake']],mini:'sludge',boss:'tanker',
  names:['Green Gate','Acid Puddles','Rot Marsh','Bubble Bog','Sludge Pond','Pipe Maze','Valve Street','Leaky Joints','Steam Vents','Sludge Pit','Tank Farm','Barrel Hill','Fuel Depot','Pump Station','Chem Lab','Toxic Tower','Flare Stack','Reactor Walk','Core Gate','Acid Throne']},
 {n:'Frozen Pass',col:'#80d8ff',bios:[8,9,10,11],zones:['Snow Road','Ice Bridges','Frost Peaks','Glacier Depot'],
  pool:[['wiper','imp','tire'],['wiper','hubcap','drone','snake'],['hubcap','wiper','spider','battery'],['wiper','hubcap','brute','canister']],mini:'frost',boss:'plow',
  names:['Snow Gate','Slush Lane','Chain Road','Frozen Jam','Wiper Woods','Ice Bridge','Black Ice','Salt Barns','Avalanche Turn','Frost Pit','Frost Peaks','Blizzard Pass','Crystal Cave','Pine Hairpin','Summit Garage','Glacier Depot','Plow Yard','Ice Wall','Frozen Gate','Plow King Hall']},
 {n:'Neon Highway',col:'#ff4fd8',bios:[12,13,14,15],zones:['City Lights','Tunnel Run','Skyline Ramp','Turbo Arena'],
  pool:[['turbo','horn','imp'],['turbo','horn','hubcap','drone'],['turbo','horn','wiper','battery'],['turbo','horn','gearbox','hubcap']],mini:'neonc',boss:'wyrm',
  names:['Neon Gate','Taxi Rank','Billboard Row','Night Market','Drift Corner','Tunnel Run','Echo Tube','Toll Booth','Speed Trap','Neon Pit','Skyline Ramp','Overpass','Rooftop Lot','Laser Bridge','Street Race','Turbo Arena','Nitro Lane','Boost Ring','Wyrm Gate','Turbo Wyrm Nest']},
 {n:'Volcano Forge',col:'#ff3d00',bios:[16,17,18,19],zones:['Ash Fields','Lava Rivers','Forge Halls','Omega Core'],
  pool:[['bat','gearbox','imp'],['bat','gearbox','turbo','canister'],['bat','gearbox','battery','horn'],['bat','gearbox','brute','wiper']],mini:'magma',boss:'omega',
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
const stageMul=i=>{if(i<20)return Math.pow(1.1,i);for(let k=1;k<SMK.length;k++){const [a,va]=SMK[k-1],[b,vb]=SMK[k];if(i<=b)return va*Math.pow(vb/va,(i-a)/(b-a));}return SMK[SMK.length-1][1];};
const REWARD=i=>{const s=STAGES[i];return {money:Math.round((i<20?250*Math.pow(1.2,i):250*Math.pow(1.2,19)*Math.pow(1+(i-19)*.05,1.5))/10)*10,tk:s.boss?5:s.mini?3:1,gtk:s.boss?5:s.mini?3:1};};
const sLabel=i=>(STAGES[i].c+1)+'-'+(STAGES[i].j+1);

// ---------------------------------------------------------------- GEAR (works only in battles)
const GSLOT=[
 {k:'tool',n:'Tool',ic:'tool',st:'atk'},
 {k:'helm',n:'Helmet',ic:'helm',st:'hp'},
 {k:'vest',n:'Work Vest',ic:'vest',st:'def'},
 {k:'glove',n:'Gloves',ic:'glove',st:'crit'},
 {k:'boots',n:'Boots',ic:'boots',st:'aspd'},
 {k:'chip',n:'ECU Chip',ic:'chip',st:'en'}];
const GS={};GSLOT.forEach(s=>GS[s.k]=s);
const GSTAT={atk:{n:'Attack',ic:'atk',col:'#ff7043',v:[6,10,15,22,30,40]},hp:{n:'HP',ic:'heart',col:'#66bb6a',v:[6,10,15,22,30,40]},def:{n:'Defense',ic:'shield',col:'#42a5f5',v:[8,13,20,28,38,50]},
 crit:{n:'Crit chance',ic:'crit',col:'#ffca28',v:[3,4,6,8,11,15]},aspd:{n:'Attack speed',ic:'aspd',col:'#26c6da',v:[4,6,9,13,17,22]},en:{n:'Skill charge',ic:'energy',col:'#ffab00',v:[6,10,15,22,30,40]}};
const GNAMES={tool:['Rusty Wrench','Steel Wrench','Torque Wrench','Impact Gun','Golden Ratchet','Titan Breaker'],helm:['Cloth Cap','Hard Hat','Welding Mask','Carbon Helmet','Golden Helmet','Crown of Gears'],
 vest:['Old Overalls','Work Vest','Kevlar Apron','Armored Vest','Golden Plate','Mythic Exo-Suit'],glove:['Cotton Gloves','Leather Gloves','Grip Gloves','Shock Gloves','Golden Gauntlets','Titan Fists'],
 boots:['Old Sneakers','Work Boots','Steel Toes','Racing Boots','Golden Boots','Nitro Boots'],chip:['Basic Fuse','ECU Chip','Tuned ECU','Stage 2 ECU','Golden ECU','Quantum ECU']};
const GMAXLV=10,GSUBN=[0,0,1,1,2,2],GINV=150;
const GDROP=[[60,30,9,1,0,0],[30,40,22,7,1,0],[10,30,38,18,4,0],[0,15,35,35,14,1],[0,0,25,42,28,5]];
function GR(){const G=TE().G;if(!G.gear)G.gear={inv:[],eq:{},nid:1,kit:0};const g=G.gear;
  if(!g.kit){g.kit=1;['tool','helm','vest'].forEach(s=>g.inv.push(newItem(s,0)));}return g;}
function newItem(s,r){const g=TE().G.gear;const st=GS[s].st,others=Object.keys(GSTAT).filter(k=>k!==st),sub=[];
  for(let i=0;i<GSUBN[r];i++){const k=others.splice(Math.floor(Math.random()*others.length),1)[0];sub.push([k,Math.round(GSTAT[k].v[r]*.4*10)/10]);}
  return {id:g.nid++,s,r,lv:1,sub};}
// v14: from chapter 6 on the chances keep improving until chapter 50
function gdrop(c){if(c<5)return GDROP[c];const k=Math.min(1,(c-4)/45),A=GDROP[4],Z=[0,0,5,30,45,20];return A.map((v,i)=>Math.round(v+(Z[i]-v)*k));}
const GMAXR=[10,15,20,30,40,50],gMax=it=>GMAXR[it.r];
function rollR(c,bump){const w=gdrop(c);let r=Math.random()*100,k=0;for(;k<5;k++){r-=w[k];if(r<0)break;}if(bump&&Math.random()<.5)k++;return Math.min(5,k);}
function dropItem(c,bump){const g=GR();const it=newItem(GSLOT[Math.floor(Math.random()*6)].k,rollR(c,bump));if(g.inv.length>=GINV){return {it,sold:salvageV(it)};}g.inv.push(it);return {it};}
const itemById=id=>id?GR().inv.find(i=>i.id===id):null;
const mainV=it=>Math.round(GSTAT[GS[it.s].st].v[it.r]*(1+.12*(it.lv-1))*10)/10; // +12% of the base value per level (Lv 50 = ×6.9)
const itemName=it=>GNAMES[it.s][it.r];
const upCost=it=>Math.round(150*Math.pow(it.r+1,1.6)*Math.pow(1.4,Math.min(it.lv,10)-1)*Math.pow(1.08,Math.max(0,it.lv-10))/10)*10;
const salvageV=it=>Math.round(40*Math.pow(it.r+1,1.8)*(1+.5*(it.lv-1))/10)*10;
function ownerOf(it){const eq=GR().eq;for(const hid in eq)for(const s in eq[hid])if(eq[hid][s]===it.id)return hid;return null;}
function heroGear(hid,ov){const eq=GR().eq[hid]||{},o=[];for(const sl of GSLOT){const it=ov&&(sl.k in ov)?ov[sl.k]:itemById(eq[sl.k]);if(it)o.push(it);}return o;}
const ZB={atk:0,hp:0,def:0,crit:0,aspd:0,en:0};
function gearBon(items){const b={atk:0,hp:0,def:0,crit:0,aspd:0,en:0};for(const it of items){b[GS[it.s].st]+=mainV(it);for(const [k,v] of it.sub)b[k]+=v;}return b;}
// item picture: rarity glow + drawn glyph
// ---------------------------------------------------------------- v14: item pictures – every grade has its own drawing (36 items)
const IMAT=[{b:'#8d6e57',h:'#c9a68a',l:'#4a3527',a:'#b5562a',t:'#d9c3a5'},{b:'#8fa3a0',h:'#eef6f3',l:'#4d5d59',a:'#43c463',t:'#2e7d32'},{b:'#3f7fd6',h:'#d6ecff',l:'#123a78',a:'#40c4ff',t:'#82b1ff'},
 {b:'#6a3fa6',h:'#e2c6ff',l:'#25103f',a:'#ea5cff',t:'#b388ff'},{b:'#e6a817',h:'#fff6c2',l:'#8a5600',a:'#ff2d55',t:'#ffe082'},{b:'#4a0f14',h:'#ff8a65',l:'#140204',a:'#ff1744',t:'#ffd180'}];
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
function itemArtCv(s,r){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.lineJoin='round';x.lineCap='round';
  if(itOK(s)){if(r>=3){x.save();x.shadowColor=['','','','#d070ff','#ffd54a','#ff3d3d'][r];x.shadowBlur=r>=5?18:12;x.drawImage(ITIMG[s],10,10,108,108);x.restore();}x.drawImage(ITIMG[s],10,10,108,108);}else IDRAW[s](x,r);return c;}
function itemIconURL(s,r){const key='it'+s+r;if(ICC[key])return ICC[key];const ok=itOK(s);const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  const col=TE().GRADES[r].c,dk=TE().GRADES[r].d;const bg=x.createRadialGradient(64,58,6,64,64,96);bg.addColorStop(0,hexC(col,-.15));bg.addColorStop(.45,dk);bg.addColorStop(1,'#07090c');x.fillStyle=bg;x.fillRect(0,0,128,128);
  x.globalAlpha=.18;x.strokeStyle='#fff';x.lineWidth=10;for(let i=0;i<8;i++){x.save();x.translate(64,64);x.rotate(i/8*TAU+.2);x.beginPath();x.moveTo(0,0);x.lineTo(0,-100);x.stroke();x.restore();}x.globalAlpha=1;
  x.save();x.shadowColor='rgba(0,0,0,.75)';x.shadowOffsetY=4;x.shadowBlur=6;x.drawImage(itemArtCv(s,r),0,0);x.restore();
  const u=c.toDataURL();if(ok)ICC[key]=u;return u;}
function itemCard(it,extra,cls){const T=TE(),i=Math.min(5,it.r),r=T.FIN[i],p=T.FPL[i];
  return `<div class="gi ${cls||''}" data-it="${it.id}"><div class="fc"><img class="ff" src="img/fr${i}.webp"><img class="fp" src="${itemIconURL(it.s,it.r)}" style="left:${r[0]}%;top:${r[1]}%;width:${r[2]}%;height:${r[3]}%"><span class="fs" style="top:${p[0]}%;height:${p[1]}%">Lv ${it.lv}</span></div>${extra||''}</div>`;}

// ---------------------------------------------------------------- team helpers
function myMechs(){const T=TE(),o=[];
  for(const id in T.G.h.own){const h=T.HB[id];if(h&&h.cat==='m'&&!h.soon)o.push(h);}
  o.sort((a,b)=>pow(b)-pow(a));return o;}
function stars(h){const o=TE().G.h.own[h.id];return o?o.s:0;}
function roleOf(h){return h.crew?'crew':(h.sp||'all');}
function unitStats(h,ov){const R=ROLE[roleOf(h)],m=h.crew?.85:GMUL[h.gr]*(TE().starK?TE().starK(stars(h)):1+.2*stars(h));const b=h.crew?ZB:gearBon(heroGear(h.id,ov));
  return {hp:Math.round(R.hp*m*(1+b.hp/100)),atk:R.atk*m*(1+b.atk/100),def:R.def*(h.crew?1:1+h.gr*.12)*(1+b.def/100),mv:R.mv,rng:R.rng,as:R.as/(1+b.aspd/100),crit:Math.min(.75,R.crit+b.crit/100),eg:1+b.en/100,b};}
function powS(s,R){return Math.round(s.hp*.25+s.atk*6*(R.as/s.as)*(1+(s.crit-R.crit)*.8)*(1+(s.eg-1)*.25)+s.def*4);}
function pow(h,ov){return powS(unitStats(h,ov),ROLE[roleOf(h)]);}
function crewHero(k){return {id:'crew'+k,crew:true,n:CREW_NAMES[k],gr:0,cat:'m',sp:'crew',f:false};}
function teamHeroes(){const T=TE(),ids=(T.G.cp.team||[]).filter(id=>id.startsWith('crew')||(T.HB[id]&&T.G.h.own[id]));
  return ids.slice(0,5).map(id=>id.startsWith('crew')?crewHero(+id.slice(4)):T.HB[id]);}
function bestTeam(){const m=myMechs().slice(0,5).map(h=>h.id);let k=0;while(m.length<5)m.push('crew'+(k++));return m;}
function teamPower(list){return list.reduce((a,h)=>a+pow(h),0);}
// v15: early bosses are easier (no long wall at the start of the game)
const BEASE=c=>[.42,.55,.68,.8,.9][c]??1;
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
 m4_0:{a:[130,246],m:[230,150],cs:[[3,0],[3,1],[3,2],[3,3]],fx:'quake'},m4_1:{a:[129,246],m:[250,109],look:'wrench',cs:[[3,0],[3,1]],fx:'holy'},
 m4_2:{a:[120,246],m:[250,112],col:'#d05cff',cs:[[3,0],[3,1]],fx:'vortex'},m4_3:{a:[119,246],m:[250,117],col:'#ffd54a',cs:[[3,1],[3,2],[3,3]],fx:'cloud'},
 m4_4:{a:[124,247],m:[250,118],col:'#ffd21a',cs:[[3,0],[3,1],[3,2],[3,3]],fx:'hglass'},m4_5:{a:[135,247],m:[230,150],fire:1},
 m5_0:{a:[124,246],m:[230,150],cs:[[3,0],[3,1],[3,2]],fx:'gearboom'},m5_1:{a:[123,246],m:[230,150],cs:[[3,0]],fire:1},
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
 g4_0:{w:384,a:[209,248],m:[300,150]},g4_1:{w:384,a:[198,248],m:[300,150]},g4_2:{w:384,a:[213,248],m:[300,150]},g4_3:{w:384,a:[204,248],m:[300,150]}};
const FXIM={};for(const k of['quake','holy','vortex','cloud','hglass','gearboom']){FXIM[k]=new Image();FXIM[k].src='img/hero/fx_'+k+'.webp';}
const fxOK=k=>FXIM[k]&&FXIM[k].complete&&FXIM[k].naturalWidth>0;
const SPK=.37,SPCELL=192;
// v16-25: atlases load only when a hero/driver is actually drawn (before: ALL ~95 atlases were decoded at startup ≈ 290 MB of memory)
for(const id in SPRD)SPRD[id].id=id;
function sprLoad(d){if(!d.im){d.im=new Image();d.im.decoding='async';d.im.src='img/hero/sp_'+d.id+'.webp';if(d.boom){d.bi=new Image();d.bi.src='img/hero/'+d.boom+'.webp';}}return d.im;}
const sprOf=h=>h&&!h.crew&&SPRD[h.id]||null;
const sprOK=d=>{if(!d)return false;const im=sprLoad(d);return im.complete&&im.naturalWidth>0;};
// muzzle: [x, y] on screen where a ranged attack / skill effect starts (continues the effect drawn in the picture)
function muzzle(u,dx,dy){const d=u.spr,k=dsc(u.d);if(!sprOK(d))return[u.x+u.face*dx*S,fy(u.d)-(u.lift||0)-dy*k];
  return[u.x+u.face*(d.m[0]-d.a[0])*SPK*k,fy(u.d)-(u.lift||0)-(d.a[1]-d.m[1])*SPK*k];}
function sprFrame(u,t){const a=u.act,d=u.spr,R=d.R||[0,1,2,3,4,5];
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
  if(u.buff>0&&!u.dead){g.fillStyle='rgba(255,170,0,.22)';ell(g,0,-40,30,46);}
  const k=SPK; // units per 256-cell px
  if(d.noKO&&u.dead)g.rotate(-Math.min(1,u.deadT*2.2)*Math.PI/2*.92); // no KO picture → falls over
  const w=d.w||256,cw=w*SPCELL/256;
  g.globalAlpha=alpha*GA;g.drawImage(d.im,c*cw,r*SPCELL,cw,SPCELL,-d.a[0]*k,-d.a[1]*k,w*k,256*k);
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
const roleBadge=(r,sz)=>badge(ROLEGL[r],ROLECOL[r],sz||64);

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
function drawMonster(g,u,t){
  g.save();g.translate(u.sx,u.sy);g.scale(u.sc,u.sc);
  let alpha=1;if(u.dead){alpha=clamp(1-u.deadT*1.6,0,1);}
  g.globalAlpha=alpha*GA;const M=MON[u.t],big=M.b==='titan'?70:M.b==='crusher'?34:M.big>1.5?26:16;
  g.fillStyle='rgba(0,0,0,.38)';ell(g,0,0,big,big*.28);
  if(u.mark>0){g.strokeStyle='rgba(80,255,170,.85)';g.lineWidth=1.6;g.beginPath();g.ellipse(0,0,big+4,(big+4)*.3,0,0,TAU);g.stroke();}
  if(u.slow>0){g.fillStyle='rgba(224,69,123,.35)';ell(g,0,0,big+6,(big+6)*.3);}
  if(M.hue!=null&&FILT){// v14 elite colours: draw the monster on its own small canvas, then recolour it once
    const tr=g.getTransform(),ps=Math.max(.5,Math.hypot(tr.a,tr.b)),hw=M.b==='titan'?230:M.b==='crusher'?150:Math.max(64,M.h*1.5*(M.big>1?1.2:1)),top=M.h*(M.b==='titan'?1.45:1.7)+(M.fly?80:0)+60,bot=40;
    const cw=Math.ceil(2*hw*ps),ch=Math.ceil((top+bot)*ps);let oc=u._oc;if(!oc||oc.width<cw||oc.height<ch||oc.width>cw*1.6){oc=u._oc=document.createElement('canvas');oc.width=cw;oc.height=ch;}
    const o=oc.getContext('2d');o.setTransform(1,0,0,1,0,0);o.clearRect(0,0,oc.width,oc.height);o.setTransform(ps,0,0,ps,hw*ps,top*ps);
    o.scale(u.face,1);if(u.dead)o.rotate(-u.deadT*.6);if(u.stun>0)o.rotate(Math.sin(t*30)*.04);const ga=GA;GA=1;MDRAW[M.dr](o,u,t);GA=ga;
    g.filter='hue-rotate('+M.hue+'deg) saturate('+(M.sat||1)+') brightness('+(M.bri||1)+')';g.drawImage(oc,0,0,cw,ch,-hw,-top,2*hw,top+bot);g.filter='none';
  }else{
  g.scale(u.face,1);if(u.dead)g.rotate(-u.deadT*.6);
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

// v15: NEVER GIVE UP – stuck on your next stage? Your mechanics train: +7.5% HP & attack every 6 hours (max +60% after 2 days). Resets when you win it.
function grit(si){const G=TE().G,st=G.cp.stuck;if(!st||st.si!==si||si!==G.cp.best)return 0;return Math.min(8,Math.floor((Date.now()-st.t)/216e5))*.075;}
function mkHeroUnit(h,i,n){const s=unitStats(h),r=roleOf(h),gk=1+(B.grit||0);
  return {hero:1,h,spr:sprOf(h),land:0,role:r,look:lookOf(h),k:i*1.7,name:h.crew?h.n:h.n,hp:s.hp*gk,max:s.hp*gk,atk:s.atk*gk,def:s.def,mv:s.mv*S,rng:s.rng*S,as:s.as,crit:s.crit,eg:s.eg,
    x:0,d:0,face:1,st:'idle',ap:0,cd:rnd(0,.6),wph:rnd(0,6),en:0,stun:0,slow:0,mark:0,buff:0,aspd:0,aspdK:0,defB:0,critB:0,shield:0,flash:0,hurt:0,hot:0,hotT:0,taunt:0,dead:false,deadT:0,hits:0,act:null,slot:i};}
function mkMon(t,i,k){const M=MON[t],m=stageMul(B.si)*stEase(B.si);
  return {hero:0,t,k:rnd(0,9),name:M.n,boss:!!M.boss,hp:M.hp*m*1.25,max:M.hp*m*1.25,atk:M.atk*m,def:M.def*(1+Math.min(B.si,19)*.06),mv:M.mv*S,rng:M.rng*S,as:M.as,crit:.05,H:M.h,fly:!!M.fly,
    x:0,d:0,face:-1,st:'walk',ap:0,cd:rnd(.3,1),wph:rnd(0,6),roll:0,stun:0,slow:0,mark:0,weak:0,burn:0,burnT:0,ice:0,tw:0,flash:0,hurt:0,dot:0,dead:false,deadT:0,act:null,
    b:M.b,at:M.at||'',sp1:M.b==='pound'?4:M.b==='crusher'?3:M.b==='titan'?4:0,sp2:M.b==='crusher'?8:M.b==='titan'?9:0,sp3:M.b==='titan'?14:0,pounce:M.pounce?1:0,charge:M.charge?1:0,enr:false};}

const FORM=[[.36,.22],[.33,.62],[.22,.42],[.14,.14],[.13,.8]];
function formation(){const hs=B.heroes;const melee=hs.filter(u=>u.rng<80*S),rng=hs.filter(u=>u.rng>=80*S);
  const order=[...melee,...rng];order.forEach((u,i)=>{u.fx=W*FORM[i][0];u.fd=FORM[i][1];});}

// v16-10: a tester's battle never started (FIGHT → back to the stages). If starting fails, retry without the new effects;
// if it still fails, show the error so he can send a screenshot.
function safeStart(si,team){try{startBattle(si,team);return;}catch(e){console.error(e);window.__BERR=e;}
  try{FX2=false;startBattle(si,team);TE().toast('⚠️ Battle started in safe mode',2500);return;}catch(e2){console.error(e2);
    $('bt').classList.remove('open');window.__BATTLE_ON=false;
    const e=window.__BERR||e2,msg=String(e&&e.message||e).slice(0,160),st=String(e&&e.stack||'').split('\n').slice(0,3).join(' | ').slice(0,300);
    pop(`<div class="pT">Battle could not start</div><div class="pD">Please send a screenshot of this to the developer:</div><div class="pD" style="font-family:monospace;font-size:11px;word-break:break-all;text-align:left">${msg.replace(/</g,'&lt;')}<br>${st.replace(/</g,'&lt;')}<br>${navigator.userAgent.replace(/</g,'&lt;')}</div><button class="cpGo alt" data-p="x">CLOSE</button>`);}}
function startBattle(si,team){
  B={si,stage:STAGES[si],wave:0,heroes:[],mons:[],proj:[],fx:[],parts:[],nums:[],tele:[],t:0,real:0,ts:1,slowT:0,spd:spdOK(TE().G.cp.spd),auto:TE().G.cp.auto!==false,
    phase:'intro',phT:0,scroll:0,scrollV:0,shake:0,banner:null,flash:0,paused:false,deaths:0,bossBar:null,lowRes:false,perf:[],fx2:[],hs:0,sx:0,sy:0};if(FX2)fxPre();
  B.grit=window.__SIM?0:grit(si);if(B.grit)TE().toast('🔥 NEVER GIVE UP: +'+Math.round(B.grit*100)+'% HP & attack',2600);
  B.lowRes=LOWRES;if(!bsize())buildBG();
  B.heroes=team.map((h,i)=>mkHeroUnit(h,i,team.length));B.heroes.forEach(u=>{portraitCv(u.h);if(u.spr)sprLoad(u.spr);});
  formation();B.heroes.forEach(u=>{u.x=u.fx-W*.5;u.d=u.fd;u.st='walk';});
  spawnWave();
  $('bt').classList.add('open');window.__BATTLE_ON=true;if(!window.__SIM){let n=0;try{n=+localStorage.getItem('te_bhint')||0;localStorage.setItem('te_bhint',n+1);}catch(e){}if(n<3)setTimeout(()=>{if(B&&!B.res)TE().toast('🔧 Your mechanics attack on their own · tap a card when it shows TAP! to use its skill',4200);},2600);}running=true;lastT=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);}
function spawnWave(){const w=B.stage.w[B.wave];
  w.forEach((t,i)=>{const m=mkMon(t,i);const n=w.length;
    if(m.b==='titan'){m.x=W*.78;m.d=.42;m.st='idle';}
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
let FX2=false,FXDEMO=false;
try{const q=location.search.match(/[?&]fx=(\d)/);if(q){localStorage.setItem('te_fx2',q[1]==='2'?'1':'0');localStorage.setItem('te_fxdemo','1');}
  FX2=localStorage.getItem('te_fx2')==='1';FXDEMO=localStorage.getItem('te_fxdemo')==='1';}catch(e){}
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
  let a=src.atk*mult*(src.buff>0?1.3:1)*rnd(.9,1.1);
  a*=100/(100+tgt.def*3);if(tgt.mark>0)a*=1.35;
  if(tgt.defB>0)a*=.8;if(src.weak>0)a*=.7;
  const crit=o.crit||(!o.noCrit&&Math.random()<src.crit+(src.critB>0?.15:0));if(crit)a*=1.8;
  a=Math.max(1,Math.round(a));let left=a;
  if(tgt.shield>0){const s=Math.min(tgt.shield,left);tgt.shield-=s;left-=s;}
  tgt.hp-=left;tgt.flash=1;tgt.hurt=1;
  const [x]=sxy(tgt);const y=headY(tgt);
  if(FX2&&!B.sim&&!tgt.hero&&(o.skill||crit)){B.hs=Math.max(B.hs,o.skill?.06:.035);fxs('star_04','#ffffff',x,y+22*dsc(tgt.d),{d:.22,s0:20*S,s1:70*S,rot:rnd(0,1),ease:1});}
  num(x,y,(crit?'💥':'')+a,tgt.hero?'#ff8a80':crit?'#ffd54a':'#ffffff',crit?1:0);
  if(tgt.hero)tgt.en=Math.min(100,tgt.en+a/tgt.max*55*tgt.eg);
  if(src.hero)src.en=Math.min(100,src.en+(o.skill?0:11*src.eg));
  if(tgt.hp<=0)kill(tgt);
  return a;}
function heal(u,amt){if(u.dead)return;const a=Math.round(Math.min(amt,u.max-u.hp));u.hp+=a;if(a>0)num(u.x,headY(u),'+'+a,'#69f0ae');}
function kill(u){u.hp=0;u.dead=true;u.deadT=0;u.st='dead';u.act=null;
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
  else if(p.type==='paint'){damage(s,p.tgt,p.mult);for(const m of alive(B.mons))if(m!==p.tgt&&Math.abs(m.x-x)<35*S&&Math.abs(m.d-p.d)<.12)damage(s,m,p.mult*.6,{noCrit:1});
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
function cast(u){if(!canCast(u))return;u.en=0;B.slowT=.45;B.flash=.35;punch(.045);if(FX2)fxAura(u);
  B.banner={u,t:0,name:skOf(u.h).sk};
  const R=u.role,ms=alive(B.mons);
  if(SKF[u.h.id]){SKF[u.h.id](u,ms);return;}
  const P=skp(u);
  if(R==='engine'){const c=cluster(ms,(P.rad||95)*S)||ms[0];u.act={k:'leap',t:0,dur:.55,x0:u.x,d0:u.d,x1:c.x-24*S,d1:c.d,p:P};u.st='leap';}
  else if(R==='tuning'){u.act={k:'dash',t:0,x0:u.x,d0:u.d,hit:new Set(),back:false,mult:P.mult,band:P.band,col:P.col,p:P};u.st='dash';if(P.aspd)teamBuff({aspd:P.aspd,aspdK:.25,col:'#40c4ff',txt:'SPEED UP'});}
  else if(R==='all'){u.act={k:'cast',t:0,dur:.6,fire:()=>{for(const m of alive(B.mons)){B.fx.push({type:'gear',x:m.x+rnd(-10,10),tgt:m,y0:-40,t:-rnd(0,.5),d:.55,src:u,r:rnd(14,20)*S});}
      for(let k=0;k<8;k++)B.fx.push({type:'gear',x:rnd(W*.3,W),tgt:null,y0:-40,t:-rnd(0,.8),d:.55,src:u,r:rnd(8,14)*S,dl:rnd(0,1)});
      for(const h of alive(B.heroes)){h.buff=6;B.fx.push({type:'plus',u:h,t:0,d:.7,col:'#ffab00',txt:'ATK+30%'});}}};u.st='cast';}
  else{u.act={k:'cast',t:0,dur:R==='service'||R==='inspect'?.5:.35,fire:()=>skillFire(u)};u.st='cast';}}
function skillFire(u){const R=u.role,ms=alive(B.mons);if(!ms.length)return;
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
 m4_0(u){castAct(u,.75,()=>{const y=fy(.5);shake(14);B.fx.push({type:'quake',x0:u.x+30*S,t:0,d:1.1,src:u,hit:new Set()});
   B.fx.push({type:'ring',x:u.x+30*S,y:fy(u.d),t:0,d:.5,r:90*S,col:'#ffd54a',ground:1});debris(u.x+30*S,fy(u.d),10,['#6d4c41','#9e9e9e','#ffca28']);
   if(FX2){fxShock(u.x+30*S,fy(u.d),'#ffd54a',90*S);fxBurst(u.x+30*S,fy(u.d)-14*S,'#ffab00',50*S);}
   u.taunt=4;u.shield=Math.max(u.shield,u.max*.3);});},
 m4_1(u){castAct(u,.8,()=>{const dead=!u.rev&&B.heroes.find(h=>h.dead&&h!==u);
   if(dead){u.rev=1;dead.dead=false;dead.hp=Math.round(dead.max*.4);dead.deadT=0;dead.st='idle';dead.act=null;dead.stun=0;dead.lift=0;dead.en=0;
     num(dead.x,headY(dead)-16,'REVIVED!','#fff59d',1);imgFx('holy',dead.x,fy(dead.d)+6*S,120*S,1.3);}
   for(const h of alive(B.heroes)){heal(h,h.max*.35);h.hot=4;h.hotA=h.max*.15/4;if(h!==dead)imgFx('holy',h.x,fy(h.d)+6*S,90*S,1);
     if(FX2){fxs('magic_02','#fff176',h.x,fy(h.d),{ground:1,d:1,s0:20*S,s1:90*S,sy:.34,vr:2.5,ease:1});fxSpark(h.x,fy(h.d)-40*dsc(h.d),'#fff176',5,22*S);}}
   teamBuff({def:6,col:'#fff176',txt:'DEF UP'});B.flash=.5;});},
 m4_2(u,ms){const c=cluster(ms,100*S)||ms[0];castAct(u,.6,()=>{const R=105*S,cx=c.x,cd=c.d;imgFx('vortex',cx,fy(cd)+12*S,215*S,1.1,{spin:1});shake(8);
   for(const m of alive(B.mons))if(Math.hypot(m.x-cx,(m.d-cd)*(FY1-FY0)*1.25)<R){damage(u,m,2.1,{skill:1});m.stun=Math.max(m.stun,2.2);m.ice=2.2;m.mark=Math.max(m.mark,4);}
   if(FX2){fxBurst(cx,fy(cd)-30*S,'#d05cff',70*S);fxShock(cx,fy(cd),'#80d8ff',R*.7);}});},
 m4_3(u,ms){castAct(u,.85,()=>{const cx=ms.reduce((a,m)=>a+m.x,0)/ms.length,top=FY0-120*S;B.fx.push({type:'imgfx',k:'cloud',x:cx,y:top+40*S,w:Math.min(W*.9,300*S),t:0,d:1.6,cloud:1});
   for(let k=0;k<8;k++)B.fx.push({type:'strike',t:-.25-k*.13,d:.3,src:u,top});
   teamBuff({aspd:6,aspdK:.25,col:'#ffd54a',txt:'SPEED UP'});});},
 m4_4(u,ms){castAct(u,1,()=>{B.flash=.45;B.slowT=.6;
   for(const m of alive(B.mons)){m.slow=Math.max(m.slow,6);m.mark=Math.max(m.mark,6);m.tw=6;imgFx('hglass',m.x,headY(m)-8*S,30*S,1.4,{float:1,u:m});damage(u,m,.6,{skill:1,noCrit:1});}
   teamBuff({aspd:6,aspdK:.4,col:'#80d8ff',txt:'SPEED UP'});});},
 m4_5(u){u.act={k:'dash',t:0,x0:u.x,d0:u.d,hit:new Set(),back:false,fire:1,mult:2.8};u.st='dash';},
 m5_0(u,ms){castAct(u,.85,()=>{for(const m of alive(B.mons))B.fx.push({type:'gear',x:m.x+rnd(-10,10),tgt:m,y0:-40,t:-rnd(0,.5),d:.55,src:u,r:rnd(15,21)*S,mult:3.2});
   for(let k=0;k<8;k++)B.fx.push({type:'gear',x:rnd(W*.3,W),tgt:null,y0:-40,t:-rnd(0,.8),d:.55,src:u,r:rnd(8,14)*S});
   const c=cluster(alive(B.mons),100*S)||alive(B.mons)[0];if(c)B.fx.push({type:'mega',t:-.75,d:1.1,src:u,x:c.x,dd:c.d});
   teamBuff({atk:8,def:8,col:'#ff7043',txt:'ATK+30% DEF UP'});});},
 m5_1(u){castAct(u,.45,()=>{u.act={k:'dash',t:0,x0:u.x,d0:u.d,hit:new Set(),back:false,fire:1,all:1,mult:3};u.st='dash';
   teamBuff({aspd:6,aspdK:.3,crit:6,col:'#ff5252',txt:'OVERDRIVE!'});});}};

// ---------------------------------------------------------------- monster specials
function monSpecial(m,dt){const hs=alive(B.heroes);if(!hs.length)return false;
  if(m.b==='pound'||m.b==='crusher'||m.b==='titan'){m.sp1-=dt;if(m.sp1<=0&&!m.act){const tg=m.b==='titan'?(cluster(hs,110*S)||hs[0]):nearest(m,hs);
      const r=(m.b==='titan'?115:m.b==='crusher'?85:72)*S;m.sp1=m.b==='titan'?(m.enr?5:7):m.b==='crusher'?6:8;
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
  else if(a.k==='laser'){if(a.t>=a.dur&&!a.fired){a.fired=true;shake(12);for(const h of alive(B.heroes))if(Math.abs(h.d-a.d)<.16)damage(m,h,2.0);B.fx.push({type:'beam',x0:m.x-30*S,y0:fy(m.d)-185*dsc(m.d),x1:-20,y1:fy(a.d)-30*dsc(a.d),t:0,d:.6,col:MON[m.t].lc,w:16});}
    if(a.t>=a.dur+.6){m.act=null;m.st='idle';}}}

// ---------------------------------------------------------------- update
function unitUpdate(u,dt,foes,friends){
  u.flash=Math.max(0,u.flash-dt*6);u.hurt=Math.max(0,u.hurt-dt*4);if(u.land>0)u.land-=dt;
  if(u.dead){u.deadT+=dt;return;}
  u.stun=Math.max(0,u.stun-dt);u.slow=Math.max(0,u.slow-dt);u.mark=Math.max(0,u.mark-dt);
  if(!u.hero){u.ice=Math.max(0,u.ice-dt);u.weak=Math.max(0,u.weak-dt);u.tw=Math.max(0,u.tw-dt);if(u.burn>0){u.burn-=dt;u.burnT+=dt;if(Math.random()<.35)part({x:u.x+rnd(-10,10)*S,y:headY(u)+rnd(14,40)*dsc(u.d),vx:rnd(-10,10),vy:rnd(-50,-20),life:.4,r:rnd(3,6)*S,col:Math.random()<.5?'rgba(255,145,0,.8)':'rgba(255,61,0,.7)',type:'flame'});
    if(u.burnT>=.5){u.burnT=0;if(u.burnSrc)damage(u.burnSrc,u,.22,{noCrit:1,skill:1});if(u.dead)return;}}}
  if(u.hero){u.buff=Math.max(0,u.buff-dt);u.aspd=Math.max(0,u.aspd-dt);u.defB=Math.max(0,u.defB-dt);u.critB=Math.max(0,u.critB-dt);u.taunt=Math.max(0,u.taunt-dt);if(u.shield>0)u.shield=Math.max(0,u.shield-u.max*.04*dt);
    if(u.hot>0){u.hot-=dt;u.hotT=(u.hotT||0)+dt;if(u.hotT>=1){u.hotT=0;heal(u,u.hotA);}}}
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
        if(FX2){const ty=fy(u.d)-30*dsc(u.d);fxs('muzzle_02',c2,u.x-26*S,ty,{d:.22,s0:70*S,s1:40*S,rot:-Math.PI/2,a0:.9});fxs('trace_01',c3,u.x-60*S,ty+rnd(-14,14)*S,{d:.25,s0:120*S,s1:160*S,sx:.6,rot:Math.PI/2,a0:.7});}
        for(let k=0;k<(F?5:3);k++)part({x:u.x-rnd(0,F?40:24)*S,y:fy(u.d)-rnd(4,40)*S,vx:rnd(-60,-20),vy:rnd(-20,20),life:rnd(.25,.5),r:rnd(3,F?9:7)*S,col:F?(k%2?'rgba(255,109,0,.75)':'rgba(255,214,0,.8)'):(k%2?'rgba(41,121,255,.7)':'rgba(180,230,255,.8)'),type:'flame'});
        if(u.x>W-20*S){a.back=true;}}
      else{u.face=-1;u.x-=v*.8;u.st='run';u.wph+=dt*22;const P=a.p||{};if(P.back){a.hit2=a.hit2||new Set();for(const m of alive(B.mons))if(!a.hit2.has(m)&&Math.abs(m.x-u.x)<26*S&&Math.abs(m.d-u.d)<(a.band||.2)){a.hit2.add(m);damage(u,m,P.back,{crit:1,skill:1});sparks(m.x,headY(m)+20,8,a.col||'#40c4ff');}}
        if(u.x<=a.x0){u.x=a.x0;u.face=1;u.act=null;u.st='idle';}}
      return;}}
  if(!u.hero){if(u.act){monAct(u,dt);return;}if(monSpecial(u,dt))return;}
  // pick target
  let tg=null;
  if(!u.hero){const tn=alive(foes).find(h=>h.taunt>0);tg=tn||nearest(u,foes);}else tg=nearest(u,foes);
  if(!tg){u.st=B.phase==='win'?'win':'idle';return;}
  u.face=tg.x>=u.x?1:-1;
  const dd=dist(u,tg),range=u.rng+(tg.boss?(tg.b==='titan'?60:20)*S:0);
  if(u.st==='atk'){const prev=u.ap;u.ap+=dt/(u.hero?.42/(u.aspd>0?1+u.aspdK:1):Math.min(.6,u.as*.45));
    if(prev<.55&&u.ap>=.55)doHit(u,tg);
    if(u.ap>=1){u.st='idle';u.ap=0;u.cd=u.as/(u.aspd>0?1+u.aspdK:1);}return;}
  u.cd-=dt;
  // spider pounce
  if(u.pounce&&dd<140*S&&dd>u.rng*1.5){u.pounce=0;u.act=null;B.fx.push({type:'dust',x:u.x,y:fy(u.d)});u.x=tg.x-u.face*24*S;u.d=tg.d;damage(u,tg,1.5);shake(4);sparks(tg.x,headY(tg)+20,8);return;}
  if(dd<=range){if(u.cd<=0){u.st='atk';u.ap=0;}else if(u.st!=='atk')u.st='idle';return;}
  // move
  const sp=u.mv*(u.slow>0?.5:1)*(u.charge?2.2:1)*dt;
  const tx=tg.x-u.face*range*.85,dx=tx-u.x,ddp=(tg.d-u.d)*(FY1-FY0);const L=Math.hypot(dx,ddp)||1;
  u.x+=dx/L*Math.min(sp,L);u.d+=ddp/L*Math.min(sp,L)/(FY1-FY0)*.8;u.d=clamp(u.d,.02,.98);
  u.st='walk';u.wph+=dt*(u.hero?11:9)*(u.charge?2:1);if(u.t==='tire')u.roll+=dt*(u.charge?14:7)*u.face;
}
function doHit(u,tg){const [x]=sxy(tg),y=headY(tg)+16*dsc(tg.d);
  if(u.hero){const R=u.role;
    if(R==='inspect'){const [bx,sy]=muzzle(u,14,40),bc=sprOK(u.spr)?u.spr.col||'#ff5252':'#64ffda';B.fx.push({type:'beam',x0:bx,y0:sy,x1:x,y1:y,t:0,d:.26,col:bc,w:sprOK(u.spr)?4:3});if(FX2){fxs('circle_05',bc,x,y,{d:.22,s0:14*S,s1:44*S});fxs('circle_05',bc,bx,sy,{d:.15,s0:10*S,s1:26*S});}damage(u,tg,1);sparks(x,y,5,'#a7ffeb');}
    else if(R==='elec'){const [ex,ey]=muzzle(u,20,44),ec=u.spr&&u.spr.col;B.fx.push({type:'bolt',x0:ex,y0:ey,x1:x,y1:y,t:0,d:.24,col:ec});if(FX2){fxBolt(ex,ey,x,y,ec||'#40c4ff',34);fxs('circle_05','#80d8ff',x,y,{d:.2,s0:16*S,s1:40*S});}damage(u,tg,1);sparks(x,y,6,'#80d8ff');}
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
function sep(list){for(let i=0;i<list.length;i++){const a=list[i];if(a.dead||a.act)continue;for(let j=i+1;j<list.length;j++){const b=list[j];if(b.dead||b.act)continue;
  const dx=b.x-a.x,dd=(b.d-a.d)*(FY1-FY0);const L=Math.hypot(dx,dd),min=(a.boss||b.boss?48:30)*S;if(L<min&&L>0.01){const p=(min-L)/2;const ux=dx/L,uy=dd/L;
    if(!a.boss){a.x-=ux*p*.5;a.d-=uy*p/(FY1-FY0);}if(!b.boss){b.x+=ux*p*.5;b.d+=uy*p/(FY1-FY0);}a.d=clamp(a.d,.02,.98);b.d=clamp(b.d,.02,.98);}}}}

function simRun(si,team,maxT){startBattle(si,team);B.sim=1;running=false;cancelAnimationFrame(raf);B.auto=true;let t=0;while(t<(maxT||400)&&!B.res){step(1/30);t+=1/30;}
  const r={win:B.phase==='win',t:Math.round(t),deaths:B.deaths,wave:B.wave,left:B.mons.filter(m=>!m.dead).map(m=>m.t+':'+Math.round(m.hp/m.max*100)+'%')};return r;}
function step(dt){B.t+=dt;B.phT+=dt;
  if(B.bossBar&&!B.bossBar.dead&&B.bossBar.b==='titan'&&!B.bossBar.enr&&B.bossBar.hp<B.bossBar.max*.5){const b=B.bossBar;b.enr=true;b.as*=.7;b.atk*=1.15;B.flash=.6;shake(16);B.banner={boss:b,t:0,name:'ENRAGED!'};}
  if(B.phase==='intro'){for(const u of B.heroes){const dx=u.fx-u.x;u.x+=Math.sign(dx)*Math.min(Math.abs(dx),250*S*dt);u.st=Math.abs(dx)>1?'walk':'idle';u.wph+=dt*11;u.face=1;}
    for(const m of B.mons){if(m.b==='titan')continue;const tx=W*(.6+.12*(B.mons.indexOf(m)%3));if(m.x>tx){m.x-=m.mv*dt*1.3;m.st='walk';m.wph+=dt*9;if(m.t==='tire')m.roll-=dt*7;}else m.st='idle';}
    B.scroll+=dt*90;if(B.phT>1.25){B.phase='fight';B.phT=0;punch(.035);}}
  else if(B.phase==='fight'){
    for(const u of B.heroes)unitUpdate(u,dt,B.mons,B.heroes);
    for(const m of B.mons)unitUpdate(m,dt,B.heroes,B.mons);
    sep(B.heroes);sep(B.mons);
    for(const u of B.heroes)if(!u.dead){u.x=clamp(u.x,8*S,W-8*S);}
    if(B.auto)for(const u of B.heroes)if(canCast(u)){if(u.role==='service'){const low=alive(B.heroes).some(h=>h.hp/h.max<.6)||(u.h.id==='m4_1'&&!u.rev&&B.heroes.some(h=>h.dead));if(!low&&(u.waitT=(u.waitT||0)+dt)<4)continue;u.waitT=0;}cast(u);break;}
    B.mons=B.mons.filter(m=>!(m.dead&&m.deadT>1.2));
    if(!alive(B.heroes).length){B.phase='lose';B.phT=0;}
    else if(!alive(B.mons).length&&!B.proj.length){if(B.wave<B.stage.w.length-1){B.phase='march';B.phT=0;B.wave++;B.bossBar=null;
        for(const h of alive(B.heroes)){heal(h,h.max*.15);h.act=null;h.lift=0;}formation();}
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
  else if(f.type==='mega'&&!f.done&&f.t>=0){f.done=true;const y=fy(f.dd);imgFx('gearboom',f.x,y+16*S,230*S,1);shake(16);B.flash=.4;
    for(const m of alive(B.mons))if(Math.hypot(m.x-f.x,(m.d-f.dd)*(FY1-FY0)*1.25)<110*S)damage(f.src,m,1.5,{skill:1});
    if(FX2){fxShock(f.x,y,'#ff6d00',110*S);fxScorch(f.x,y,'#2b1a10',80*S,2.5);}}
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
    else if(f.type==='imgfx'){const im=FXIM[f.k];if(fxOK(f.k)){const e=1-Math.pow(1-Math.min(1,k*3),3),w=f.w*(f.float?1:(.6+.4*e)),h=w*im.naturalHeight/im.naturalWidth;
        g.globalAlpha=Math.min(1,k*6)*(k<.7?1:1-(k-.7)/.3);if(f.spin){g.translate(f.x,f.y-h/2);g.scale(1+Math.sin(f.t*30)*.03,1);g.drawImage(im,-w/2,-h/2,w,h);}else g.drawImage(im,f.x-w/2,f.y-(f.cloud?h/2:h)-(f.float?Math.sin(f.t*6)*3:0),w,h);}}
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
function drawHUD(t){HIT=[];const top=10,bh=38;
  btn(10,top,44,bh,'',false,'pause');g.drawImage(badgeCv('pause','#ffb300',64),10+22-13,top+bh/2-13,26,26);
  if(FXDEMO)btn(10,top+bh+8,96,32,FX2?'FX: NEW':'FX: OLD',FX2,'fx','#7c4dff');
  g.textAlign='center';const tt=sLabel(B.si)+' · '+B.stage.n.toUpperCase();let fs=Math.round(15*S);g.font='900 '+fs+'px system-ui';while(fs>9&&g.measureText(tt).width>W-250){fs--;g.font='900 '+fs+'px system-ui';}g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.8)';g.strokeText(tt,W/2,top+17);g.fillStyle='#ffe0b2';g.fillText(tt,W/2,top+17);
  const nw=B.stage.w.length;for(let i=0;i<nw;i++){const x=W/2+(i-(nw-1)/2)*22,y=top+33;const boss=B.stage.w[i].some(m=>MON[m].boss);g.fillStyle=i<B.wave?'#66bb6a':i===B.wave?'#ffb300':'rgba(255,255,255,.25)';
    if(boss){g.font='900 13px system-ui';g.fillText('💀',x,y+5);}else{rr(g,x-7,y-3,14,7,3);g.fill();}}
  btn(W-112,top,48,bh,'×'+B.spd,B.spd>1,'spd');if(B.spd===1.5&&!TE().PK.spd2){g.drawImage(badgeCv('lock','#8d6e63',64),W-112+36,top-4,16,16);}btn(W-58,top,48,bh,'AUTO',B.auto,'auto','#66bb6a');
  if(B.bossBar&&!B.bossBar.dead){const b=B.bossBar,bw=W*.8,x=W*.1,y=top+50;g.fillStyle='rgba(0,0,0,.75)';rr(g,x-2,y-2,bw+4,16,8);g.fill();
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
  const pc=portraitCv(h);if(pc){const K=(pc.naturalWidth||pc.width)/128,sw=clamp(128*ww/(wh-22),78,128),dh=ww*128/sw;
    g.drawImage(pc,(128-sw)/2*K,0,sw*K,128*K,wx,wy,ww,dh);
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
  const rb=Math.min(18,ww*.34);g.drawImage(badgeCv(ROLEGL[u.role],ROLECOL[u.role],64),wx+2,wy+2,rb,rb);
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
function spdOK(v){const own=TE().PK.spd2;if(v===2&&own)return 2;if(v===1.5||v===2||v===3)return 1.5;return 1;}
function drawOffer(t){g.fillStyle='rgba(0,0,0,.78)';g.fillRect(0,0,W,H);HIT=[];const bw=Math.min(330,W*.86),bh2=300,x=W/2-bw/2,y=H*.22;
  const gr=g.createLinearGradient(0,y,0,y+bh2);gr.addColorStop(0,'#3a2410');gr.addColorStop(1,'#150c06');g.fillStyle=gr;rr(g,x,y,bw,bh2,18);g.fill();g.strokeStyle='#ffb300';g.lineWidth=2.5;g.stroke();
  g.drawImage(badgeCv('aspd','#ff6d00',96),W/2-36,y+16,72,72);g.textAlign='center';g.fillStyle='#ffe082';g.font='900 '+Math.round(22*Math.min(1.2,S))+'px system-ui';g.fillText('BATTLE SPEED ×2',W/2,y+116);
  g.fillStyle='#e0c6ad';g.font='700 13px system-ui';g.fillText('×1.5 is free for everyone.',W/2,y+142);g.fillText('×2 is a pack – yours forever, every chapter.',W/2,y+161);
  btn(x+20,y+182,bw-40,48,'€4.99 · UNLOCK ×2',true,'buy');btn(x+20,y+240,bw-40,40,'NO THANKS',false,'nobuy');
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
    let ts=B.spd;if(B.slowT>0){B.slowT-=raw;ts*=.3;}if(B.hs>0){B.hs-=raw;ts*=.06;}
    let left=raw*ts;while(left>0){const s=Math.min(1/60,left);step(s);left-=s;}}
  const t0=performance.now();render();
  // v16-25: the old check counted loading hiccups at the start and re-made the canvas in the middle of the fight → the screen "tore".
  // Now: the first 2 s are ignored (on phones the drawing happens on the graphics chip, so the frame time must count too), and lower quality starts at the next wave change (hidden by the march) or next battle.
  if(B.real>2){B.perf.push(Math.max(performance.now()-t0,raw*1000));if(B.perf.length>120){const a=B.perf.reduce((x,y)=>x+y,0)/B.perf.length;B.perf=[];if(a>30&&!B.lowRes&&!LOWRES){LOWRES=true;try{sessionStorage.setItem('te_lowres','1');}catch(e){}}}}
  if(LOWRES&&!B.lowRes&&B.phase==='march'&&B.phT<.2){B.lowRes=true;bsize(true);}}
cv.addEventListener('pointerdown',e=>{if(!B)return;const R=cv.getBoundingClientRect(),x=(e.clientX-R.left)*W/(R.width||W),y=(e.clientY-R.top)*H/(R.height||H),P=6;for(const h of HIT){if(x>=h.x-P&&x<=h.x+h.w+P&&y>=h.y-P&&y<=h.y+h.h+P){
  if(h.id==='fx'){FX2=!FX2;try{localStorage.setItem('te_fx2',FX2?'1':'0');}catch(e){}if(FX2)fxPre();B.fx2=[];}
  else if(h.id==='pause'){B.paused=true;}else if(h.id==='resume'){B.paused=false;lastT=performance.now();}else if(h.id==='retreat'){B.paused=false;B.res=1;finish(false,true);}
  else if(h.id==='spd'){if(B.spd===1)B.spd=1.5;else if(B.spd===1.5){if(TE().PK.spd2)B.spd=2;else{B.offer=true;B.paused=true;}}else B.spd=1;TE().G.cp.spd=B.spd;}
  else if(h.id==='buy'){const T=TE();T.PK.spd2=true;T.savePacks();B.spd=2;T.G.cp.spd=2;B.offer=false;B.paused=false;lastT=performance.now();T.toast('⏩ Battle Speed ×2 unlocked forever!',3000);}
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
function finish(win,retreat){running=false;cancelAnimationFrame(raf);const T=TE(),G=T.G,si=B.si,S0=STAGES[si];
  if(!B.sim&&si===G.cp.best){if(win)delete G.cp.stuck;else if(!G.cp.stuck||G.cp.stuck.si!==si)G.cp.stuck={si,t:Date.now()};}
  let html='';const lab=sLabel(si);
  if(win){const st=B.deaths===0?3:B.deaths<=2?2:1;const first=si>=G.cp.best;const R=REWARD(si);const money=first?R.money:Math.round(R.money*.25/10)*10,tk=first?R.tk:0;
    G.money+=money;if(first)G.cp.best=si+1;G.cp.stars[si]=Math.max(G.cp.stars[si]||0,st);
    const drops=[];const big=S0.boss||S0.mini;const n=first?(S0.boss?2:1):(big||Math.random()<.4?1:0);for(let k=0;k<n;k++)drops.push(dropItem(S0.c,big));
    let sold=0;drops.forEach(d=>{if(d.sold){sold+=d.sold;G.money+=d.sold;}});
    const gtk=first?R.gtk:0;if(gtk)GSD().tk+=gtk;
    T.save();if(tk)T.addTickets(tk,'Campaign '+lab);
    const chDone=first&&S0.boss&&S0.c<NCH-1;
    html=`<div class="big" style="color:#ffd54a">VICTORY!</div><div class="stars">${'⭐'.repeat(st)}${'<span style="opacity:.25">⭐</span>'.repeat(3-st)}</div>
      <div class="sub">STAGE ${lab} · ${S0.n.toUpperCase()}</div>${chDone?`<div class="chUn">CHAPTER ${S0.c+1} CLEARED!<br><small>Chapter ${S0.c+2} · ${CHAP[S0.c+1].n} is now open</small></div>`:''}<div class="cpSec">${first?'FIRST CLEAR REWARDS':'REPLAY REWARD'}</div>
      <div class="rw"><span>${IMGI(badge('coin','#ffb300'))} ${T.fmt(money)}</span>${tk?`<span>${TKI} +${tk}</span>`:''}${gtk?`<span>${GTKI} +${gtk}</span>`:''}</div>
      ${drops.length?`<div class="cpSec">${IMGI(glyphURL('bag','#ffb300'))} GEAR FOUND</div><div class="gDrop">${drops.map(d=>itemCard(d.it,`<i>${itemName(d.it)}</i>`)).join('')}</div>${sold?`<div class="sub">Bag full (${GINV}) – sold for ${T.fmt(sold)}</div>`:''}`:''}
      <div class="sub" style="margin-top:10px">${st<3?'⭐⭐⭐ = finish with no mechanic knocked out':'Perfect! No mechanic was knocked out.'}</div>
      ${si<NST-1?'<div class="anx" data-a="atog"><span>⟳ AUTO NEXT</span><i id="anxC"></i><b id="anxS"></b></div>':''}
      <div class="cpRow">${si<NST-1?'<button class="cpGo" data-a="next">NEXT ▶</button>':''}<button class="cpGo alt" data-a="map">CAMPAIGN</button></div>${gtk?'<button class="cpGo alt" data-a="gsum">'+GTKI+' GEAR SUMMON</button>':''}${drops.length?'<button class="cpGo alt" data-a="gear">'+IMGI(glyphURL('bag','#ffd9b0'))+' EQUIP GEAR</button>':''}`;}
  else{html=`<div class="big" style="color:#ff5252">${retreat?'RETREAT':'DEFEAT'}</div><div class="sub" style="margin:10px 0">STAGE ${lab} · ${S0.n.toUpperCase()}</div>
      <div class="cpSec">HOW TO GET STRONGER</div><div style="font-size:13px;line-height:1.6;color:#e0c6ad">${IMGI(glyphURL('bag','#ffb300'))} Equip and upgrade <b>gear</b> (works only in battles)<br>${TKI} Summon more mechanics (higher color = much stronger)<br>⭐ Duplicates give +1 (up to +50)<br>🧪 Fusion: 3 Legendary +5 → 1 Mythic<br>${IMGI(glyphURL('bolt','#ffb300'))} Tap the glowing cards to use skills at the right moment</div>
      <div class="cpRow"><button class="cpGo" data-a="retry">RETRY</button><button class="cpGo alt" data-a="team">TEAM</button></div><div class="cpRow"><button class="cpGo alt" data-a="gear">${IMGI(glyphURL('bag','#ffd9b0'))} GEAR</button><button class="cpGo alt" data-a="map">CAMPAIGN</button></div>`;}
  $('cpResBox').innerHTML=html;$('cpRes').classList.add('open');$('cpResBox').scrollTop=0;
  // v16-25: AUTO NEXT – after a victory the next stage starts by itself after a 3 s countdown (same team). Stops on defeat, on any tap, or with the switch.
  clearInterval(ANX.id);const canAuto=win&&si<NST-1;
  const anxShow=()=>{const on=G.cp.autoNext!==false,b=$('anxS'),c=$('anxC');if(!b)return;b.textContent=on?'ON':'OFF';b.parentNode.classList.toggle('on',on);c.textContent=on&&ANX.n>0?'next stage in '+ANX.n+'…':on?'':'tap to turn on';};
  const anxGo=()=>{clearInterval(ANX.id);ANX.n=0;if(!canAuto||G.cp.autoNext===false)return anxShow();ANX.n=3;anxShow();
    ANX.id=setInterval(()=>{if(!$('cpRes').classList.contains('open')){clearInterval(ANX.id);return;}ANX.n--;anxShow();if(ANX.n<=0){clearInterval(ANX.id);
      $('cpRes').classList.remove('open');G.cp.ch=STAGES[si+1].c;safeStart(si+1,teamHeroes());}},1000);};
  if(canAuto)anxGo();
  $('cpResBox').onclick=e=>{const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;
    if(a==='atog'){G.cp.autoNext=G.cp.autoNext===false;T.save();anxGo();return;}
    clearInterval(ANX.id);ANX.n=0;$('cpRes').classList.remove('open');$('bt').classList.remove('open');
    if(a==='next'){G.cp.ch=STAGES[si+1].c;showMap();openCard(si+1);}else if(a==='retry'){safeStart(si,teamHeroes());}else if(a==='team'){showMap();openTeam(si);}
    else if(a==='gear'){showMap();openGear();}else if(a==='gsum'){showMap();openGSum();}else showMap();};}

// ---------------------------------------------------------------- campaign map (5 chapters × 20 stages)
const PH=2280;
const NODEX=j=>j===19?50:(j%2?70:30)+(j%4===1?6:j%4===3?-6:0);
const NODEY=j=>PH-110-j*106-(j===19?24:0);
const chOpen=c=>TE().G.cp.best>=c*SPC;
function curCh(){const G=TE().G;let c=G.cp.ch;if(c==null||c<0||c>=NCH||!chOpen(c))c=Math.min(NCH-1,Math.floor(Math.min(G.cp.best,NST-1)/SPC));G.cp.ch=c;return c;}
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
  $('cpT1').innerHTML=IMGI(glyphURL('swords','#ffcc80'),'1em','-.12em')+' CAMPAIGN';$('cpT2').textContent='CHAPTER '+(c+1)+' OF '+NCH;
  const done=Math.max(0,Math.min(SPC,G.cp.best-c*SPC));let stc=0;for(let j=0;j<SPC;j++)stc+=G.cp.stars[c*SPC+j]||0;
  $('cpChN').innerHTML=`<b style="color:${C.col}">${C.n}</b><small>${done}/${SPC} stages · ${stc}/${SPC*3} ⭐</small>`;
  $('cpPrev').classList.toggle('off',c===0);$('cpNext').classList.toggle('off',c>=NCH-1||!chOpen(c+1));$('cpNext').innerHTML=c<NCH-1&&!chOpen(c+1)?IMGI(glyphURL('lock','#ffd54a'),'.8em','-.05em'):'›';
  const P=$('cpPath');P.querySelectorAll('.node').forEach(n=>n.remove());drawPath(c);
  for(let j=0;j<SPC;j++){const i=c*SPC+j,s=STAGES[i];const d=document.createElement('div');const lock=i>G.cp.best,cur=i===G.cp.best;d.className='node'+(s.boss?' boss':s.mini?' mini':'')+(lock?' lock':'')+(cur?' cur':'');
    d.style.left=NODEX(j)+'%';d.style.top=NODEY(j)+'px';
    d.innerHTML=`<img class="pad" src="img/ui/${cur?'node_gold':'node_gray'}.webp">`+(s.boss?`<img class="ic" src="${glyphURL('skull','#ffe0d0')}">`:s.mini?`<img class="ic" src="${glyphURL('horns','#ffe0b2')}">`:`<b class="no">${j+1}</b>`)+`<span class="nm">${s.n}</span>`+(G.cp.stars[i]?`<span class="st">${[0,1,2].map(q=>`<em class="${q<G.cp.stars[i]?'on':''}">★</em>`).join('')}</span>`:'');
    d.onclick=()=>{if(lock){T.toast('🔒 Clear stage '+sLabel(i-1)+' first',2000);return;}openCard(i);};P.appendChild(d);}
  requestAnimationFrame(()=>{const m=$('cpMap'),j=Math.max(0,Math.min(SPC-1,G.cp.best-c*SPC));m.scrollTop=Math.max(0,NODEY(j)-m.clientHeight*.55+60);});}
// v14: 50 chapters – tap the chapter name for the full list
function chList(){const T=TE(),G=T.G,cur=curCh();let h=`<div class="pT">${IMGI(glyphURL('swords','#ffcc80'),'1em','-.12em')} ALL CHAPTERS</div><div class="pD">10 acts × 5 worlds · ${NCH} chapters · ${NST} stages</div><div class="chL">`;
  for(let c=0;c<NCH;c++){const C=CHAP[c],op=chOpen(c),done=Math.max(0,Math.min(SPC,G.cp.best-c*SPC));let st=0;for(let j=0;j<SPC;j++)st+=G.cp.stars[c*SPC+j]||0;
    if(c%5===0)h+=`<div class="chAct">ACT ${c/5+1}${c?' · '+ACTS[c/5].n.toUpperCase():' · ORIGINS'}</div>`;
    h+=`<div class="chI${op?'':' lk'}${c===cur?' on':''}" data-ch="${c}" style="border-color:${C.col}"><b style="color:${C.col}">${c+1}</b><span>${C.n}<small>${op?done+'/'+SPC+' · '+st+'⭐':'🔒 beat '+MON[CHAP[Math.max(0,c-1)].boss].n}</small></span></div>`;}
  pop(h+'</div><button class="cpGo alt" data-p="x">CLOSE</button>');
  requestAnimationFrame(()=>{const e=document.querySelector('.chI.on');if(e)e.scrollIntoView({block:'center'});});}
function chGo(dl){const T=TE(),G=T.G,c=curCh()+dl;if(c<0||c>=NCH)return;if(!chOpen(c)){T.toast('🔒 Beat '+MON[CHAP[c-1].boss].n+' (stage '+c+'-20) to open Chapter '+(c+1),2600);return;}G.cp.ch=c;showMap();$('cpMap').scrollTop=PH;}
function monPreview(t){const c=document.createElement('canvas');c.width=136;c.height=116;const x=c.getContext('2d');const M=MON[t];const sc=Math.min(1.5,50/(M.b==='titan'?255:(M.h*M.sc+(M.fly?48:4))));
  x.setTransform(2,0,0,2,0,0);const u={t,b:M.b,sx:M.b==='titan'?36:34,sy:55,sc,face:-1,st:'idle',ap:0,wph:0,k:1,roll:0,d:.5,H:M.h,mark:0,slow:0,stun:0,flash:0,dead:false,enr:false};
  GA=1;drawMonster(x,u,1.3);return c;}
function openCard(i){const T=TE(),G=T.G,s=STAGES[i],C=CHAP[s.c],first=i>=G.cp.best,R=REWARD(i);const types=[...new Set(s.w.flat())];
  const tp=teamPower(curTeamList()),ep=enemyPower(i);
  const col=tp>=ep*1.15?'#66bb6a':tp>=ep*.85?'#ffb300':'#ff5252';const big=s.boss||s.mini;
  $('cpCardBox').innerHTML=`<h2>${s.boss?IMGI(glyphURL('skull','#ff8a80'))+' ':s.mini?IMGI(glyphURL('horns','#ffb74d'))+' ':''}${sLabel(i)} · ${s.n}</h2><div class="sub">CHAPTER ${s.c+1} · ${C.zones[Math.floor(s.j/5)].toUpperCase()} · ${s.w.length} WAVES${G.cp.stars[i]?' · '+'⭐'.repeat(G.cp.stars[i]):''}</div>
   <div class="cpSec">ENEMIES</div><div class="mons" id="cpMons"></div>
   <div class="cpSec">POWER</div><div style="display:flex;justify-content:space-around;font-weight:900"><div>Enemy <span style="color:#ff8a80">${IMGI(glyphURL('swords','#ff8a80'),'1em','-.12em')} ${ep.toLocaleString()}</span></div><div>Your team <span style="color:${col}">${IMGI(glyphURL('swords',col),'1em','-.12em')} ${tp.toLocaleString()}</span></div></div>
   ${(()=>{const st=G.cp.stuck;if(i!==G.cp.best||!st||st.si!==i)return '';const gk=Math.min(8,Math.floor((Date.now()-st.t)/216e5)),nx=gk<8?Math.ceil((216e5-(Date.now()-st.t)%216e5)/36e5):0;return `<div class="grit">🔥 NEVER GIVE UP: <b>+${Math.round(gk*7.5)}%</b> HP &amp; attack for this stage${gk<8?` · next +7.5% in ~${nx}h (max +60%)`:' (max)'}</div>`;})()}
   <div class="cpSec">${first?'FIRST CLEAR REWARDS':'REPLAY REWARD'}</div><div class="rw"><span>${IMGI(badge('coin','#ffb300'))} ${T.fmt(first?R.money:Math.round(R.money*.25/10)*10)}</span>${first?`<span>${TKI} +${R.tk}</span>`:''}<span>${IMGI(glyphURL('bag','#ffd54a'))} ${first?(s.boss?'2 gear ★':big?'1 gear ★':'1 gear'):(big?'1 gear':'40% gear')}</span></div>
   <div class="sub" style="margin-top:6px">Gear chance: ${['Common','Uncommon','Rare','Epic','Legendary','Mythic'].map((n,k)=>gdrop(s.c)[k]?`<span style="color:${T.GRADES[k].c}">${n} ${gdrop(s.c)[k]}%</span>`:'').filter(Boolean).join(' · ')}${big?' · ★ better':''}</div>
   <div class="cpRow"><button class="cpGo alt" data-a="close">BACK</button><button class="cpGo" data-a="team">${IMGI(glyphURL('swords','#2a1000'),'1em','-.12em')} BATTLE</button></div>`;
  const mc=$('cpMons');types.forEach(t=>{const d=document.createElement('div');d.className='mon'+(MON[t].boss?' bossm':'');d.appendChild(monPreview(t));const l=document.createElement('div');l.textContent=MON[t].n;d.appendChild(l);mc.appendChild(d);});
  $('cpCard').classList.add('open');$('cpCardBox').onclick=e=>{const el=e.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;if(a==='close')$('cpCard').classList.remove('open');if(a==='team'){$('cpCard').classList.remove('open');openTeam(i);}};}

// ---------------------------------------------------------------- shared popup + before/after helpers
function pop(html){$('cpPopBox').innerHTML=html;$('cpPop').classList.add('open');$('cpPopBox').scrollTop=0;}
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
let tsel=[],tsi=0;
const isTank=r=>r==='engine'||r==='all';
function curTeamList(){const T=TE(),G=T.G;const ids=(G.cp.team&&G.cp.team.length?G.cp.team:bestTeam()).filter(id=>id.startsWith('crew')||(T.HB[id]&&G.h.own[id])).slice(0,5);return ids.map(heroOf);}
function teamDiff(Lb,La){const cb=Lb.map(h=>roleOf(h)),ca=La.map(h=>roleOf(h)),pros=[],cons=[];
  const med=l=>l.filter(r=>r==='service').length,tank=l=>l.filter(isTank).length,rng=l=>l.filter(r=>ROLE[r].rng>=80).length;
  if(med(cb)&&!med(ca))cons.push('No Medic left – nobody heals the team');if(!med(cb)&&med(ca))pros.push('Team gets a Medic – heals everybody');
  if(tank(cb)&&!tank(ca))cons.push('No tank (Bruiser / Legend) – monsters hit your weak mechanics');if(!tank(cb)&&tank(ca))pros.push('Team gets a tank in front');
  if(rng(ca)>rng(cb)&&rng(ca)>=4)cons.push('Many ranged mechanics, few in front');
  return {pros,cons};}
function popTeamCmp(k,newId){const T=TE(),si=tsi,ep=enemyPower(si);const Lb=tsel.map(heroOf);const La=Lb.slice();const oldH=Lb[k]||null,newH=heroOf(newId);
  if(newH){const j=tsel.indexOf(newId);if(j>=0&&j!==k){T.toast('Already in the team',1600);return;}La[k]=newH;}else La.splice(k,1);
  const tpb=teamPower(Lb),tpa=teamPower(La);const tag=p=>p>=ep*1.15?'<span style="color:#66bb6a">EASY</span>':p>=ep*.85?'<span style="color:#ffb300">EVEN</span>':'<span style="color:#ff5252">HARD</span>';
  const td=teamDiff(Lb,La);const ro=oldH&&roleOf(oldH),rn=newH&&roleOf(newH);
  const xp=[...td.pros],xc=[...td.cons];
  if(oldH&&newH&&skOf(oldH).sk!==skOf(newH).sk){xp.push(`New skill: <b>${skOf(newH).sk}</b> – ${skOf(newH).skd}`);xc.push(`Loses skill: <b>${skOf(oldH).sk}</b>`);}
  if(oldH&&newH&&(ROLE[ro].rng>=80)!==(ROLE[rn].rng>=80))(ROLE[rn].rng>=80?xp:xc).push(ROLE[rn].rng>=80?'Attacks from far away (safer)':'Fights up close (takes more hits)');
  if(!newH)xc.push('Team has only '+La.length+' mechanics');
  if(oldH&&!oldH.crew&&heroGear(oldH.id).length)xc.push(`${oldH.n}'s gear stays with ${oldH.n}`);
  let x=`<div class="pT">Before / After</div><div class="pD">${newH?(oldH?'Replace in the battle team':'Add to the battle team'):'Remove from the battle team'} · stage ${sLabel(si)}</div>
   <div class="cmp">${miniCard(oldH,'BEFORE')}<div class="cmA">➜</div>${miniCard(newH,'AFTER')}</div>`;
  x+=`<div class="ct tx"><div class="ch"><span></span><b>Before</b><b>After</b></div><div><span>Role</span><b>${oldH?IMGI(roleBadge(ro),'1.1em','-.22em')+' '+ROLE[ro].n:'—'}</b><b>${newH?IMGI(roleBadge(rn),'1.1em','-.22em')+' '+ROLE[rn].n:'—'}</b></div>
   <div><span>Skill</span><b>${oldH?skOf(oldH).sk:'—'}</b><b>${newH?skOf(newH).sk:'—'}</b></div><div><span>Range</span><b>${oldH?(ROLE[ro].rng>=80?'Ranged':'Melee'):'—'}</b><b>${newH?(ROLE[rn].rng>=80?'Ranged':'Melee'):'—'}</b></div></div>`;
  x+=cmpBlock(oldH&&unitStats(oldH),newH&&unitStats(newH),oldH?pow(oldH):0,newH?pow(newH):0,xp,xc);
  x+=`<div class="tpw">TEAM POWER <b>${tpb.toLocaleString()}</b> ${tag(tpb)} ➜ <b>${tpa.toLocaleString()}</b> ${tag(tpa)} <small>vs ${ep.toLocaleString()}</small></div>`;
  x+=`<button class="cpGo" data-p="tok" data-k="${k}" data-id="${newId||''}">✓ CONFIRM</button><button class="cpGo alt" data-p="x">CANCEL</button>`;
  pop(x);}
function popReplace(k){const h=heroOf(tsel[k]),pool=[...myMechs(),...[0,1,2,3,4].map(crewHero)].filter(c=>!tsel.includes(c.id));const p0=pow(h);
  pool.sort((a,b)=>pow(b)-pow(a));
  pop(`<div class="pT">Change ${h.n}?</div><div class="pD">Tap a mechanic to see the advantages and disadvantages before you change.</div>${heroLine(h,'<small>now</small>')}
   ${tsel.length>1?'<div class="pR" data-p="tcmp" data-k="'+k+'" data-id=""><span>✖ Remove from the team</span></div>':''}
   ${pool.map(c=>{const d=pow(c)-p0;return '<div class="pR" data-p="tcmp" data-k="'+k+'" data-id="'+c.id+'">'+heroLine(c,'<b class="'+(d>=0?'up':'dn')+'">'+(d>=0?'▲ +':'▼ −')+Math.abs(d).toLocaleString()+'</b><br><small>power</small>')+'</div>';}).join('')}
   <button class="cpGo alt" data-p="x">CLOSE</button>`);}
function popWhoLeaves(id){const h=heroOf(id),p=pow(h);
  pop(`<div class="pT">Team is full</div><div class="pD">Who should ${h.n} replace? Tap to see before / after.</div>${heroLine(h,'<small>comes in</small>')}
   ${tsel.map((tid,k)=>{const o=heroOf(tid),d=p-pow(o);return '<div class="pR" data-p="tcmp" data-k="'+k+'" data-id="'+id+'">'+heroLine(o,'<b class="'+(d>=0?'up':'dn')+'">'+(d>=0?'▲ +':'▼ −')+Math.abs(d).toLocaleString()+'</b><br><small>if replaced</small>')+'</div>';}).join('')}
   <button class="cpGo alt" data-p="x">CLOSE</button>`);}
function popAutoBest(){const T=TE(),nb=bestTeam(),Lb=tsel.map(heroOf),La=nb.map(heroOf),ep=enemyPower(tsi);
  const out=Lb.filter(h=>!nb.includes(h.id)),inn=La.filter(h=>!tsel.includes(h.id));
  if(!out.length&&!inn.length){T.toast('⚡ This is already your best team',1800);return;}
  const tpb=teamPower(Lb),tpa=teamPower(La),td=teamDiff(Lb,La);
  pop(`<div class="pT">Auto best – before / after</div><div class="pD">The strongest mechanics by power.</div>
   <div class="cpSec">LEAVE THE TEAM</div>${out.length?out.map(h=>heroLine(h,'<b class="dn">−'+pow(h).toLocaleString()+'</b>')).join(''):'<div class="pD">nobody</div>'}
   <div class="cpSec">JOIN THE TEAM</div>${inn.length?inn.map(h=>heroLine(h,'<b class="up">+'+pow(h).toLocaleString()+'</b>')).join(''):'<div class="pD">nobody</div>'}
   <div class="pc"><div class="pro"><h4>✅ ADVANTAGES</h4>${tpa>tpb?'<p>Team power +'+(tpa-tpb).toLocaleString()+'</p>':''}${td.pros.map(x=>'<p>'+x+'</p>').join('')||(tpa>tpb?'':'<p class="no">none</p>')}</div><div class="con"><h4>❌ DISADVANTAGES</h4>${tpa<tpb?'<p>Team power −'+(tpb-tpa).toLocaleString()+'</p>':''}${td.cons.map(x=>'<p>'+x+'</p>').join('')||(tpa<tpb?'':'<p class="no">none</p>')}</div></div>
   <div class="tpw">TEAM POWER <b>${tpb.toLocaleString()}</b> ➜ <b>${tpa.toLocaleString()}</b> <small>vs ${ep.toLocaleString()}</small></div>
   <button class="cpGo" data-p="bok">✓ CONFIRM</button><button class="cpGo alt" data-p="x">CANCEL</button>`);}
function openTeam(si){const T=TE(),G=T.G;tsi=si;cleanGear();tsel=curTeamList().map(h=>h.id);
  const render=()=>{const pool=[...myMechs(),...[0,1,2,3,4].map(crewHero)];const list=tsel.map(heroOf);
    const card=(h,cls,extra,k)=>`<div class="${cls}" style="border-color:${gcol(h)}" ${k!=null?'data-slot="'+k+'"':'data-id="'+h.id+'"'}><img src="${portraitURL(h)}"><span class="r" style="color:${gcol(h)}">${h.crew?'CREW':'+'+stars(h)}</span><img class="rl" src="${roleBadge(roleOf(h))}">${extra||''}<span class="n">${h.n}</span></div>`;
    let sl='';for(let k=0;k<5;k++){const h=list[k];sl+=h?card(h,'slot f','',k):'<div class="slot">+</div>';}
    const ep=enemyPower(si),tp=teamPower(list),col=tp>=ep*1.15?'#66bb6a':tp>=ep*.85?'#ffb300':'#ff5252';
    $('cpTeamBox').innerHTML=`<h2>CHOOSE YOUR TEAM</h2><div class="sub">STAGE ${sLabel(si)} · max 5 mechanics · tap a mechanic in the team to change him</div><div class="cpSec">TEAM</div><div class="slots">${sl}</div>
     <div id="cpPow">${IMGI(glyphURL('swords','#ffd54a'),'1em','-.12em')} ${tp.toLocaleString()} <span style="color:#9a8">vs</span> <span style="color:#ff8a80">${ep.toLocaleString()}</span> <span style="color:${col}">${tp>=ep*1.15?'· EASY':tp>=ep*.85?'· EVEN':'· HARD'}</span></div>
     <div class="cpSec" style="display:flex;justify-content:space-between;align-items:center;gap:6px">YOUR MECHANICS <span style="display:flex;gap:6px"><button class="cpB sm" data-a="gear">${IMGI(glyphURL('bag','#ffd54a'))} GEAR</button><button class="cpB sm" data-a="best">${IMGI(glyphURL('bolt','#ffd54a'))} AUTO BEST</button></span></div>
     <div class="pool">${pool.map(h=>card(h,'pick'+(tsel.includes(h.id)?' on':''))).join('')}</div>
     <div class="roles">${Object.entries(ROLE).filter(([k])=>k!=='crew').map(([k,r])=>'<div>'+IMGI(roleBadge(k),'1.5em','-.4em')+' <span>'+r.n+'</span> <b>'+r.sk+'</b></div>').join('')}</div>
     <div class="cpRow"><button class="cpGo alt" data-a="back">BACK</button><button class="cpGo" data-a="go">${IMGI(glyphURL('swords','#2a1000'),'1em','-.12em')} FIGHT!</button></div>`;};
  render();openTeam.render=render;$('cpTeam').classList.add('open');
  $('cpTeamBox').onclick=e=>{const el=e.target.closest('[data-id],[data-a],[data-slot]');if(!el)return;const a=el.dataset.a,id=el.dataset.id,sk=el.dataset.slot;
    if(a==='back'){$('cpTeam').classList.remove('open');return;}
    if(a==='best'){popAutoBest();return;}
    if(a==='gear'){openGear(tsel.find(i=>!i.startsWith('crew')));return;}
    if(a==='go'){if(!tsel.length){T.toast('Pick at least 1 mechanic',2000);return;}G.cp.team=tsel.slice();T.save();$('cpTeam').classList.remove('open');safeStart(si,teamHeroes());return;}
    if(sk!=null){popReplace(+sk);return;}
    if(id){const k=tsel.indexOf(id);if(k>=0)popReplace(k);else if(tsel.length<5){tsel.push(id);G.cp.team=tsel.slice();render();}else popWhoLeaves(id);}};}

// ---------------------------------------------------------------- GEAR page (separate page · gear works only in battles)
let gsel=null,gfil='all',gsalv=0;
function cleanGear(){const T=TE(),g=GR();for(const hid in g.eq){if(!T.G.h.own[hid]){delete g.eq[hid];continue;}for(const s in g.eq[hid])if(!itemById(g.eq[hid][s]))delete g.eq[hid][s];}}
function gHero(){const L=myMechs();if(!L.length)return null;if(!gsel||!L.find(h=>h.id===gsel))gsel=L[0].id;return TE().HB[gsel];}
function openGear(hid){cleanGear();if(hid)gsel=hid;$('cpGear').classList.add('open');renderGear();$('cpGear').scrollTop=0;}
function renderGear(){const T=TE(),G=T.G,g=GR(),h=gHero();
  $('gGSB').innerHTML=GTKI0+' <b>GEAR SUMMON</b> <span>'+GSD().tk+' tickets</span>';
  $('gMoney').innerHTML=IMGI(badge('coin','#ffb300'))+' '+T.fmt(G.money);
  const team=G.cp.team||[];const L=myMechs();
  $('gHeroes').innerHTML=L.length?L.map(m=>`<div class="gh${m.id===gsel?' on':''}" data-h="${m.id}" style="border-color:${gcol(m)}"><img src="${portraitURL(m)}"><img class="rb" src="${roleBadge(roleOf(m))}">${team.includes(m.id)?'<i>TEAM</i>':''}<span>${m.n}</span></div>`).join(''):'';
  if(!h){$('gMain').innerHTML=`<div class="gEmpty">You have no mechanic heroes yet.<br><br>${TKI} Summon mechanics first – the Rookie Crew can't use gear.</div>`;$('gStats').innerHTML='';$('gInv').innerHTML='';$('gFil').innerHTML='';$('gBtns').innerHTML='';return;}
  const eq=g.eq[h.id]||{};const slotBox=sl=>{const it=itemById(eq[sl.k]);return `<div class="gsl" data-s="${sl.k}">${it?itemCard(it):`<div class="gse"><img src="${glyphURL(sl.ic,'rgba(255,220,170,.35)')}"></div>`}<small>${sl.n}</small></div>`;};
  const st=unitStats(h),st0=unitStats(h,{tool:null,helm:null,vest:null,glove:null,boots:null,chip:null});
  $('gMain').innerHTML=`<div class="gCol">${GSLOT.slice(0,3).map(slotBox).join('')}</div><div class="gMid"><div class="gPor">${T.fbox(h,0,stars(h))}</div><b style="color:${gcol(h)}">${h.n}</b><small>${IMGI(roleBadge(roleOf(h)),'1.3em','-.3em')} ${ROLE[roleOf(h)].n} · ${skOf(h).sk}</small>${HSK[h.id]?`<small style="display:block;opacity:.8;font-size:.7em;max-width:170px;margin:3px auto 0;line-height:1.25">${HSK[h.id].skd}</small>`:''}<div class="gPow">${IMGI(glyphURL('swords','#ffd54a'),'1em','-.12em')} ${pow(h).toLocaleString()}</div></div><div class="gCol">${GSLOT.slice(3).map(slotBox).join('')}</div>`;
  $('gStats').innerHTML=STROWS.map(([ic,n,f,fmt])=>{const a=f(st0),b=f(st),d=b-a;return `<div><span>${IMGI(glyphURL(ic,'#ffcc80'),'1.15em','-.25em')} ${n}</span><b>${fmt(b)}</b><em>${Math.abs(d)>1e-6?'+'+fmt(d).replace('+',''):''}</em></div>`;}).join('')+`<div class="gNote">${IMGI(glyphURL('swords','#ffb300'),'1em','-.15em')} Gear works <b>only in battles</b> (not in the garage)</div>`;
  $('gBtns').innerHTML=`<button class="cpGo" data-g="auto">${IMGI(glyphURL('bolt','#2a1000'))} AUTO EQUIP</button><button class="cpGo alt" data-g="none">REMOVE ALL</button>`;
  $('gFil').innerHTML=[['all','ALL','bag'],...GSLOT.map(s=>[s.k,s.n,s.ic])].map(([k,n,ic])=>`<button class="gf${gfil===k?' on':''}" data-f="${k}"><img src="${glyphURL(ic,gfil===k?'#2a1000':'#ffd54a')}"><span>${n}</span></button>`).join('');
  const inv=g.inv.filter(it=>gfil==='all'||it.s===gfil).sort((a,b)=>b.r-a.r||b.lv-a.lv||a.s.localeCompare(b.s));
  $('gInv').innerHTML=`<div class="gIh">BAG ${g.inv.length}/${GINV}</div>`+(inv.length?'<div class="gGrid">'+inv.map(it=>{const o=ownerOf(it);const oh=o&&T.HB[o];return itemCard(it,o?`<img class="own" src="${portraitURL(oh)}" style="border-color:${gcol(oh)}">`:'',o===h.id?'mine':o?'used':'');}).join('')+'</div>':'<div class="gEmpty">No gear here yet. Win battles to find gear!</div>');}
function cmpForHero(h,ov,xp,xc){return cmpBlock(unitStats(h),unitStats(h,ov),pow(h),pow(h,ov),xp,xc);}
function popItem(id){const T=TE(),G=T.G,g=GR(),it=itemById(id);if(!it)return;const h=gHero(),sl=GS[it.s],st=GSTAT[sl.st],o=ownerOf(it),oh=o&&T.HB[o];gsalv=0;
  let x=`<div class="iTop">${itemCard(it)}<div><div class="pT" style="text-align:left;color:${T.GRADES[it.r].c}">${itemName(it)}</div><div class="pD" style="text-align:left;margin:2px 0">${T.GRADES[it.r].n} ${sl.n} · Lv ${it.lv}/${gMax(it)}</div>
   <div class="iSt main">${IMGI(glyphURL(st.ic,st.col),'1.1em','-.22em')} ${st.n} <b>+${mainV(it)}%</b></div>${it.sub.map(([k,v])=>`<div class="iSt">${IMGI(glyphURL(GSTAT[k].ic,GSTAT[k].col),'1.1em','-.22em')} ${GSTAT[k].n} <b>+${v}%</b></div>`).join('')}
   ${oh?`<div class="pD" style="text-align:left">${IMGI(portraitURL(oh),'1.4em','-.4em')} worn by <b style="color:${gcol(oh)}">${oh.n}</b></div>`:''}</div></div>`;
  if(h){const cur=itemById((g.eq[h.id]||{})[it.s]);
    if(o===h.id){x+=`<div class="cpSec">IF YOU UNEQUIP IT FROM ${h.n.toUpperCase()}</div>`+cmpForHero(h,{[it.s]:null},[],[`${sl.n} slot becomes empty`]);x+=`<button class="cpGo alt" data-p="ueq" data-it="${it.id}">✓ UNEQUIP</button>`;}
    else{const xc=[],xp=[];if(cur)xc.push(`Replaces <b style="color:${T.GRADES[cur.r].c}">${itemName(cur)}</b> Lv ${cur.lv} (goes back to the bag)`);
      if(oh){const d=pow(oh)-pow(oh,{[it.s]:null});xc.push(`Taken from <b>${oh.n}</b> (his power −${d.toLocaleString()})`);}
      x+=`<div class="cpSec">BEFORE / AFTER ON ${h.n.toUpperCase()}</div>`+cmpForHero(h,{[it.s]:it},xp,xc);
      x+=`<button class="cpGo" data-p="eq" data-it="${it.id}">✓ EQUIP ON ${h.n.toUpperCase()}</button>`;}}
  if(it.lv<gMax(it)){const nx={...it,lv:it.lv+1},c=upCost(it);x+=`<div class="cpSec">UPGRADE</div><div class="iUp">${st.n}: <b>+${mainV(it)}%</b> ➜ <b class="up">+${mainV(nx)}%</b> <small>(Lv ${it.lv} ➜ ${it.lv+1})</small></div>
    <button class="cpGo${G.money<c?' dis':''}" data-p="up" data-it="${it.id}">⬆ UPGRADE · ${IMGI(badge('coin','#ffb300'))} ${T.fmt(c)}</button>`;}
  else x+=`<div class="iUp">MAX LEVEL</div>`;
  x+=`<button class="cpGo alt" data-p="salv" data-it="${it.id}">SALVAGE · +${T.fmt(salvageV(it))}</button><button class="cpGo alt" data-p="x">CLOSE</button>`;
  pop(x);}
function equip(hid,it){const g=GR(),o=ownerOf(it);if(o)delete g.eq[o][it.s];if(!g.eq[hid])g.eq[hid]={};g.eq[hid][it.s]=it.id;}
function autoPlan(h){const g=GR(),eq=g.eq[h.id]||{},ov={};
  for(const sl of GSLOT){let best=itemById(eq[sl.k])||null,bp=pow(h,{...ov,[sl.k]:best});
    for(const it of g.inv){if(it.s!==sl.k)continue;const o=ownerOf(it);if(o&&o!==h.id)continue;const p=pow(h,{...ov,[sl.k]:it});if(p>bp){bp=p;best=it;}}
    ov[sl.k]=best;}
  return ov;}
function popAuto(){const T=TE(),g=GR(),h=gHero();if(!h)return;const ov=autoPlan(h),eq=g.eq[h.id]||{};const ch=GSLOT.filter(sl=>(ov[sl.k]?ov[sl.k].id:0)!==(eq[sl.k]||0));
  if(!ch.length){T.toast('⚡ '+h.n+' already wears the best free gear',2000);return;}
  let x=`<div class="pT">Auto equip – before / after</div><div class="pD">Best free gear for ${h.n} (gear worn by other mechanics is not taken).</div><div class="aeL">`+ch.map(sl=>{const a=itemById(eq[sl.k]),b=ov[sl.k];return `<div><small>${sl.n}</small>${a?itemCard(a):'<div class="gse sm">—</div>'}<span>➜</span>${b?itemCard(b):'<div class="gse sm">—</div>'}</div>`;}).join('')+'</div>';
  x+=cmpForHero(h,ov,[],[])+`<button class="cpGo" data-p="aok">✓ CONFIRM</button><button class="cpGo alt" data-p="x">CANCEL</button>`;pop(x);}
function popNone(){const T=TE(),h=gHero();if(!h)return;const eq=GR().eq[h.id]||{};if(!Object.keys(eq).length){T.toast('Nothing equipped',1500);return;}
  const ov={};GSLOT.forEach(s=>ov[s.k]=null);pop(`<div class="pT">Remove all gear?</div><div class="pD">${h.n} – before / after</div>`+cmpForHero(h,ov,[],['All gear goes back to the bag'])+`<button class="cpGo" data-p="nok">✓ CONFIRM</button><button class="cpGo alt" data-p="x">CANCEL</button>`);}
$('cpGear').addEventListener('click',e=>{const T=TE(),el=e.target.closest('[data-g],[data-h],[data-s],[data-f],[data-it]');if(!el)return;
  if(el.dataset.g==='back'){$('cpGear').classList.remove('open');if($('cpTeam').classList.contains('open')&&openTeam.render)openTeam.render();return;}
  if(el.dataset.g==='auto'){popAuto();return;}if(el.dataset.g==='none'){popNone();return;}
  if(el.dataset.h){gsel=el.dataset.h;renderGear();return;}
  if(el.dataset.f){gfil=el.dataset.f;renderGear();return;}
  if(el.dataset.s){const h=gHero(),it=h&&itemById((GR().eq[h.id]||{})[el.dataset.s]);if(it)popItem(it.id);else{gfil=el.dataset.s;renderGear();const iv=$('gInv');iv.scrollIntoView({behavior:'smooth',block:'start'});T.toast('Choose '+GS[el.dataset.s].n+' below – you will see before / after',2200);}return;}
  if(el.dataset.it)popItem(+el.dataset.it);});
$('cpPop').addEventListener('click',e=>{const T=TE(),G=T.G;if(e.target.id==='cpPop'){closePop();return;}const ci=e.target.closest('[data-ch]');if(ci){const c=+ci.dataset.ch;if(!chOpen(c)){T.toast('🔒 Locked – clear the chapter before it',1800);return;}G.cp.ch=c;closePop();showMap();return;}const el=e.target.closest('[data-p]');if(!el)return;const a=el.dataset.p;
  if(a==='gsAgain'){closePop();gsummon(+el.dataset.n);return;}if(a==='gsGear'){closePop();closeGSum();openGear();return;}
  if(a==='x'){closePop();return;}
  if(a==='tcmp'){popTeamCmp(+el.dataset.k,el.dataset.id||null);return;}
  if(a==='tok'){const k=+el.dataset.k,id=el.dataset.id;if(id)tsel[k]=id;else tsel.splice(k,1);G.cp.team=tsel.slice();T.save();closePop();openTeam.render&&openTeam.render();return;}
  if(a==='bok'){tsel=bestTeam();G.cp.team=tsel.slice();T.save();closePop();openTeam.render&&openTeam.render();return;}
  const it=el.dataset.it?itemById(+el.dataset.it):null,h=gHero();
  if(a==='eq'&&it&&h){equip(h.id,it);T.save();closePop();renderGear();T.toast('✓ '+itemName(it)+' equipped on '+h.n,1800);return;}
  if(a==='ueq'&&it){const o=ownerOf(it);if(o)delete GR().eq[o][it.s];T.save();closePop();renderGear();return;}
  if(a==='up'&&it){const c=upCost(it);if(G.money<c){T.toast('Not enough money ('+T.fmt(c)+')',2000);return;}G.money-=c;it.lv++;T.save();renderGear();popItem(it.id);T.toast('⬆ '+itemName(it)+' is now Lv '+it.lv,1600);return;}
  if(a==='salv'&&it){if(!gsalv){gsalv=1;el.innerHTML='TAP AGAIN TO SALVAGE (+'+T.fmt(salvageV(it))+')';el.classList.remove('alt');el.style.background='linear-gradient(#ff8a80,#c62828)';el.style.color='#fff';return;}
    const o=ownerOf(it);if(o)delete GR().eq[o][it.s];const g=GR();g.inv.splice(g.inv.indexOf(it),1);G.money+=salvageV(it);T.save();closePop();renderGear();T.toast('🔨 Salvaged for '+T.fmt(salvageV(it)),1800);return;}
  if(a==='aok'&&h){const ov=autoPlan(h),g=GR();if(!g.eq[h.id])g.eq[h.id]={};for(const sl of GSLOT){if(ov[sl.k])equip(h.id,ov[sl.k]);else delete g.eq[h.id][sl.k];}T.save();closePop();renderGear();return;}
  if(a==='nok'&&h){GR().eq[h.id]={};T.save();closePop();renderGear();return;}});

// ---------------------------------------------------------------- v14: GEAR SUMMON (blue Gear Tickets · gear works only in battles)
const GTKI='<img src="img/gticket.webp" style="height:1.15em;vertical-align:-.25em" onerror="this.replaceWith(\'🎫\')">';
const GS_RATE=[45,28,16,8,2.5,.5], GS_PITY={e:10,l:50,m:200};
const GS_NAMES=['Common','Uncommon','Rare','Epic','Legendary','Mythic'];
function GSD(){const g=GR();if(g.tk==null)g.tk=10;if(!g.pity)g.pity={e:0,l:0,m:0};if(!g.hist)g.hist=[];if(g.sum==null)g.sum=0;return g;}
function addGTk(n,why){const g=GSD();g.tk+=n;TE().save();if(why)TE().toast(GTKI+' +'+n+' Gear Ticket'+(n>1?'s':'')+' · '+why,2600);gsBadge();}
function gsRoll(){const g=GSD(),p=g.pity;p.e++;p.l++;p.m++;let x=Math.random()*100,r=0;for(;r<5;r++){x-=GS_RATE[r];if(x<0)break;}r=Math.min(5,r);
  if(p.m>=GS_PITY.m)r=5;else if(p.l>=GS_PITY.l&&r<4)r=4;else if(p.e>=GS_PITY.e&&r<3)r=3;
  if(r>=3)p.e=0;if(r>=4)p.l=0;if(r>=5)p.m=0;return r;}
function gsummon(n){const T=TE(),g=GSD();if(g.tk<n){T.toast(GTKI+' Not enough Gear Tickets – win campaign stages to get more',2600);return;}
  g.tk-=n;const cnt=n===10?11:1,res=[];let sold=0;
  for(let k=0;k<cnt;k++){const r=gsRoll(),it=newItem(GSLOT[Math.floor(Math.random()*6)].k,r);g.sum++;
    g.hist.unshift({s:it.s,r,t:Date.now()});if(g.inv.length>=GINV){sold+=salvageV(it);res.push({it,sold:1});}else{g.inv.push(it);res.push({it});}}
  g.hist.length=Math.min(g.hist.length,60);if(sold)T.G.money+=sold;T.save();gsBadge();renderGSum();gsResults(res,n,sold);}
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
function openGSum(){$('gSum').classList.add('open');renderGSum();cancelAnimationFrame(gsRaf);gsRaf=requestAnimationFrame(gsLoop);$('gSum').scrollTop=0;}
function closeGSum(){$('gSum').classList.remove('open');cancelAnimationFrame(gsRaf);if($('cpGear').classList.contains('open'))renderGear();}
function renderGSum(){const T=TE(),g=GSD(),p=g.pity;
  $('gsTk').innerHTML=GTKI+' '+g.tk;
  $('gsTiles').innerHTML=gsTiles();
  $('gsPity').innerHTML=`<div><b>${GS_PITY.e-p.e}</b> summons to a guaranteed <b style="color:${T.GRADES[3].c}">Epic</b> or better</div><div><b>${GS_PITY.l-p.l}</b> to a guaranteed <b style="color:${T.GRADES[4].c}">Legendary</b> · <b>${GS_PITY.m-p.m}</b> to a guaranteed <b style="color:${T.GRADES[5].c}">Mythic</b></div>`;
  $('gsB1').className='gsBtn'+(g.tk<1?' dis':'');$('gsB10').className='gsBtn big'+(g.tk<10?' dis':'');
  $('gsBag').textContent='BAG '+g.inv.length+'/'+GINV;}
function gsResults(res,n,sold){const T=TE(),best=Math.max(...res.map(o=>o.it.r));
  let x=`<h2 style="color:${T.GRADES[best].c}">${best>=5?'MYTHIC GEAR!':best>=4?'LEGENDARY GEAR!':'GEAR SUMMONED'}</h2><div class="sub">${res.length} item${res.length>1?'s':''}${n===10?' · +1 BONUS':''}</div>
   <div class="gsRes">${res.map((o,k)=>`<div class="gsR r${o.it.r}" style="animation-delay:${k*.12}s">${itemCard(o.it,`<i style="color:${T.GRADES[o.it.r].c}">${GS_NAMES[o.it.r]}</i><i>${itemName(o.it)}</i>${o.sold?'<i style="color:#ff8a80">bag full – sold</i>':''}`)}</div>`).join('')}</div>
   ${sold?`<div class="sub">Bag full (${GINV}) – extra gear sold for ${T.fmt(sold)}</div>`:''}
   <div class="cpRow"><button class="cpGo${GSD().tk<n?' dis':''}" data-p="gsAgain" data-n="${n}">AGAIN x${n} ${GTKI}</button><button class="cpGo alt" data-p="gsGear">${IMGI(glyphURL('bag','#ffd9b0'))} EQUIP</button></div><button class="cpGo alt" data-p="x">CLOSE</button>`;
  pop(x);}
function gsRates(){const T=TE();pop(`<div class="pT pic"><img src="img/ui/t_rates.webp" alt="SUMMON RATES"></div><span class="pSub">GEAR</span><div class="gsRates">${GS_RATE.map((p,r)=>`<div><b style="color:${T.GRADES[r].c}">${GS_NAMES[r]}</b><span>${p}%</span><small>max Lv ${GMAXR[r]} · ${GSUBN[r]} bonus stat${GSUBN[r]===1?'':'s'}</small></div>`).join('')}</div>
  <div class="pD" style="margin-top:8px">Every summon gives 1 random gear piece (Tool, Helmet, Work Vest, Gloves, Boots or ECU Chip).<br><b>Summon x10</b> gives <b>11</b> pieces.<br>Guaranteed: <b>Epic+</b> every ${GS_PITY.e}, <b>Legendary+</b> every ${GS_PITY.l}, <b>Mythic</b> every ${GS_PITY.m} summons.</div>
  <div class="cpSec">WHERE TO GET ${GTKI} GEAR TICKETS</div><div class="pD">First clear of every campaign stage: <b>+1</b> · mini-boss (X-10): <b>+3</b> · boss (X-20): <b>+5</b><br>Start: 10 tickets.</div><button class="cpGo alt" data-p="x">CLOSE</button>`);}
function gsHist(){const T=TE(),g=GSD();pop(`<div class="pT pic"><img src="img/ui/t_hist.webp" alt="SUMMON HISTORY"></div><span class="pSub blue">Last ${g.hist.length} of ${g.sum} gear summons</span><div class="gsHist">${g.hist.length?g.hist.map(o=>`<div><img src="${itemIconURL(o.s,o.r)}"><b style="color:${T.GRADES[o.r].c}">${GNAMES[o.s][o.r]}</b><small style="color:${T.GRADES[o.r].c}">${GS_NAMES[o.r]}</small></div>`).join(''):'<div class="pD">Nothing yet.</div>'}</div><button class="cpGo alt" data-p="x">CLOSE</button>`);}

// ---------------------------------------------------------------- open / close
function open(){root.classList.add('open');window.__BATTLE_ON=true;showMap();gsBadge();}
function close(){running=false;cancelAnimationFrame(raf);cancelAnimationFrame(gsRaf);root.classList.remove('open');['cpCard','cpTeam','cpRes','bt','cpGear','cpPop','gSum'].forEach(id=>$(id).classList.remove('open'));window.__BATTLE_ON=false;}
$('gSum').addEventListener('click',e=>{const el=e.target.closest('[data-gs]');if(!el)return;const a=el.dataset.gs;
  if(a==='back')closeGSum();else if(a==='1')gsummon(1);else if(a==='10')gsummon(10);else if(a==='rates')gsRates();else if(a==='hist')gsHist();else if(a==='gear'){closeGSum();openGear();}
  else{const t=e.target.closest('.gsT');if(t)gsRates();}});
$('gsTiles').addEventListener('click',()=>gsRates());
$('cpGSB').onclick=()=>openGSum();$('gGSB').onclick=()=>openGSum();
$('cpChN').onclick=()=>chList();
$('cpBack').onclick=close;$('cpPrev').onclick=()=>chGo(-1);$('cpNext').onclick=()=>chGo(1);$('cpGearB').onclick=()=>openGear();
// v15: GEAR title is the player's picture
$('cpGearB').innerHTML=IMGI(glyphURL('bag','#ffd54a'),'1.25em','-.3em')+'<small>GEAR</small>';
// v16-20: mini hero on the garage map (same sprite sheet as in battle). an: idle · walk · work · cel, or a row number (drivers). hgt = height on the map.
function mini(X,id,an,t,x,y,hgt,face,ph){const d=SPRD[id];if(!sprOK(d))return false;const R=d.R||[0,1,2,3,4,5];
  const num=typeof an==='number',row=num?R[an]:an==='walk'?R[1]:an==='work'?R[2]:an==='cel'?R[5]:R[0],fps=num?[4,9,11,6,5,4][an]:an==='walk'?9:an==='work'?6:4,c=Math.floor(t*fps+(ph||0)*3)%4;
  const k=hgt/215,w=d.w||256,cw=w*SPCELL/256;X.save();X.translate(x,y);X.scale(face<0?-1:1,1);
  X.drawImage(d.im,c*cw,row*SPCELL,cw,SPCELL,-d.a[0]*k,-d.a[1]*k,w*k,256*k);X.restore();return true;}
window.CAMPAIGN={open,close,openGear,mini};
if(window.SEC&&SEC.TEST_MODE)window.__DEV={startBattle:(si,ids)=>{root.classList.add('open');window.__BATTLE_ON=true;startBattle(si,(ids||bestTeam()).map(heroOf));}};
})();
