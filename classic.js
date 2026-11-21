// Torque Empire v16-59 – CLASSIC COLLECTION: the Collection Garage opens. A dealer sells 12 classic cars (drawn here in code,
// top-down like every car on the map) for CASH. Every car parked in the garage adds fixed idle rewards (💎 + tickets per hour),
// nothing random. Each car can be owned once; 6 parking spots (2 open with the garage, 4 bought with cash).
// Saved in G.cc = {o:1 (garage open), sp:2 (open spots), p:['id',…6]}.
(()=>{
const T=()=>window.__TE;
// ---------------------------------------------------------------- the cars (names invented – no real brands, PLAY_RULES)
// v16-121: diamonds ÷5 (tester: up to 80 💎/h made the Shop useless – 800 💎 cost €4.99) → max ~16 💎/h; instead the cars give
// Essence (es) + Gear Parts (gp) for the battles, in idle units (es 1 = what 2 h of normal idle give).
// r = idle rewards per hour: dm diamonds, tk Recruit, ct Crew, gt Gear tickets (fractions add up while you are away)
const CARS=[
 {id:'bug',   n:'Pebble Bug',      gr:0,k:'bug',     c:['#7ec8e3','#e9f6fb'],price:40e3, rep:6, r:{dm:0.5,es:0.05,gp:0.05}},
 {id:'ramb',  n:'Rusty Rambler',   gr:0,k:'sedan30', c:['#2e3b4e','#151c26'],price:60e3, rep:6, r:{dm:0.5,es:0.05,gp:0.05}},
 {id:'sun',   n:'Sunset Roadster', gr:1,k:'roadster',c:['#e53935','#f5e6c8'],price:150e3,rep:8, r:{dm:0.75,es:0.08,gp:0.08,ct:1/12}},
 {id:'woody', n:'Woody Wagon',     gr:1,k:'wagon',   c:['#f2e3c0','#9a6033'],price:200e3,rep:8, r:{dm:0.75,es:0.08,gp:0.08,ct:1/12}},
 {id:'star',  n:'Starline Cruiser',gr:2,k:'cruiser', c:['#4fc3d9','#f4f1e8'],price:600e3,rep:10,r:{dm:1,es:0.12,gp:0.12,tk:1/12}},
 {id:'midn',  n:'Midnight Coupe',  gr:2,k:'coupe',   c:['#1b2a52','#c9d3e6'],price:800e3,rep:10,r:{dm:1,es:0.12,gp:0.12,tk:1/12}},
 {id:'thund', n:'Thunderbolt GT',  gr:3,k:'muscle',  c:['#ff8f00','#111111'],price:2.5e6,rep:13,r:{dm:1.5,es:0.18,gp:0.18,tk:1/8,gt:1/12}},
 {id:'arrow', n:'Silver Arrow',    gr:3,k:'arrow',   c:['#cfd8dc','#e53935'],price:3e6,  rep:13,r:{dm:1.5,es:0.18,gp:0.18,tk:1/8,gt:1/12}},
 {id:'royal', n:'Royal Phantom',   gr:4,k:'limo',    c:['#4a0e1a','#d9c27a'],price:10e6, rep:17,r:{dm:2.5,es:0.28,gp:0.28,tk:1/6,ct:1/8,gt:1/8}},
 {id:'gull',  n:'Gullwing Grand',  gr:4,k:'gull',    c:['#eceff1','#263238'],price:12e6, rep:17,r:{dm:2.5,es:0.28,gp:0.28,tk:1/6,ct:1/8,gt:1/8}},
 {id:'dyn',   n:'Golden Dynasty',  gr:5,k:'dynasty', c:['#ffcf40','#7a4a00'],price:40e6, rep:22,r:{dm:4,es:0.4,gp:0.4,tk:1/4,ct:1/6,gt:1/6}},
 {id:'etern', n:'Eternal Torque',  gr:5,k:'eternal', c:['#12051f','#ff3d71'],price:50e6, rep:22,r:{dm:4,es:0.4,gp:0.4,tk:1/4,ct:1/6,gt:1/6}},
];
// v16-129 (pending, Marius 21 nov): the money from cars now goes HERE – 24 more cars (36), more and more expensive (up to ~$260B),
// no more parking limit (every car you own counts; the 6 best are shown on the map) and every car makes ALL heroes stronger in battle
// (ATK & HP, small at first, big at the end) + free tickets every hour. b = battle bonus in % · price ×1.42 per car.
const NEW=[['Copper Clipper','sedan30',['#b87333','#f0dcc0']],['Mint Marauder','muscle',['#98ff98','#1b3d2a']],['Azure Ace','roadster',['#2979ff','#e3f2fd']],['Desert Dart','coupe',['#e0b070','#5d4037']],
 ['Ivory Imperial','limo',['#f8f4e3','#3e2723']],['Crimson Comet','arrow',['#c62828','#f5f5f5']],['Night Falcon','gull',['#212121','#ffca28']],['Bronze Baron','cruiser',['#8d6e63','#ffe0b2']],
 ['Jade Jubilee','wagon',['#00a86b','#f1f8e9']],['Plum Prestige','dynasty',['#6a1b9a','#e1bee7']],['Solar Sovereign','eternal',['#ffb300','#4e342e']],['Frost Phantom','limo',['#b3e5fc','#263238']],
 ['Ruby Regent','dynasty',['#9b111e','#ffd700']],['Obsidian Oracle','gull',['#0d0d0d','#7c4dff']],['Platinum Pharaoh','arrow',['#e5e4e2','#c9a227']],['Emerald Empress','cruiser',['#046307','#f9e79f']],
 ['Inferno Imperator','muscle',['#ff3d00','#1a0000']],['Starlight Sultan','eternal',['#1a237e','#ffeb3b']],['Diamond Duchess','roadster',['#b9f2ff','#ffffff']],['Titan Tycoon','limo',['#37474f','#ffd54a']],
 ['Aurora Archon','gull',['#00e5ff','#ea80fc']],['Crown of Torque','dynasty',['#ffd700','#b71c1c']],['Celestial Kaiser','eternal',['#0b0033','#00e5ff']],['The Last Legend','arrow',['#ffffff','#ff1744']]];
NEW.forEach(([n,k,c],j)=>CARS.push({id:'x'+j,n,gr:j<6?3:j<14?4:j<21?5:6,k,c,price:Math.round(80e6*Math.pow(1.42,j)/1e6)*1e6,rep:Math.min(30,18+Math.floor(j/2)),
  r:{dm:.3+j*.05,es:.4+j*.04,gp:.4+j*.04,tk:.012*Math.pow(1.1,12+j),gt:.009*Math.pow(1.1,12+j),ct:.006*Math.pow(1.1,12+j)}}));
CARS.forEach((c,i)=>c.b=Math.round(.15*Math.pow(1.12,i)*100)/100);   // battle bonus % per car: car 1 +0.15% … car 12 +0.5% … car 24 +2% … car 36 +8% (all 36 ≈ +72%)
const BY={};CARS.forEach(c=>BY[c.id]=c);
const OPEN_COST=150e3,OPEN_REP=6,SPOTS=6,SPOT_COST=[0,0,500e3,1.5e6,5e6,15e6],FULL_BONUS=.10,SELL_BACK=.5;
// spot centres on b_collection.webp (560×1033): 2 columns × 3 rows, cars face the middle aisle
const SPOT=[[130,380],[430,380],[130,558],[430,558],[130,735],[430,735]];

function st(){const G=T().G;if(!G.cc)G.cc={o:0,sp:2,p:['','','','','','']};const s=G.cc;if(!s.own)s.own=s.p.filter(Boolean);return s;}   // v16-129: s.own = every car you own (old saves: the parked ones)
function owned(){return st().own.map(id=>BY[id]).filter(Boolean);}
function parked(){return owned();}
function show6(){return owned().slice().sort((a,b)=>b.price-a.price).slice(0,SPOTS);}   // the 6 most expensive are shown on the map
function battleB(){const s=st();if(!s.o)return 0;return owned().reduce((a,c)=>a+c.b,0);}   // % ATK & HP for every hero
function rates(){const s=st(),o={dm:0,tk:0,ct:0,gt:0,es:0,gp:0,mon:0};if(!s.o)return o;
  for(const c of parked())for(const k in c.r)o[k]=(o[k]||0)+c.r[k];
  o.mon=owned().length*.01;return o;}   // v16-129: +1% idle money per car owned

// ---------------------------------------------------------------- drawing (nose = +x, centred, length L, width W)
function rrp(g,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function ellp(g,x,y,rx,ry,a){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),a||0,0,7);}
function paint(g,c,hw,lt){const gr=g.createLinearGradient(0,-hw,0,hw);gr.addColorStop(0,shade(c,-.35));gr.addColorStop(.25,lt?shade(c,.25):c);gr.addColorStop(.5,shade(c,.18));gr.addColorStop(.75,c);gr.addColorStop(1,shade(c,-.4));return gr;}
function shade(hex,k){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;
  if(k>0){r+=(255-r)*k;g+=(255-g)*k;b+=(255-b)*k;}else{r*=1+k;g*=1+k;b*=1+k;}return 'rgb('+(r|0)+','+(g|0)+','+(b|0)+')';}
function chrome(g,x0,y0,x1,y1){const gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,'#8a9399');gr.addColorStop(.35,'#ffffff');gr.addColorStop(.55,'#b8c2c8');gr.addColorStop(1,'#eef3f5');return gr;}
function wheel(g,x,y,l,w,white,gold){g.fillStyle='#0b0b0b';rrp(g,x-l/2,y-w/2,l,w,w*.45);g.fill();
  if(white){g.fillStyle=gold?'#ffd54a':'#f4f4f0';rrp(g,x-l*.32,y-w/2,l*.64,w,w*.3);g.fill();g.fillStyle='#0b0b0b';rrp(g,x-l*.22,y-w/2,l*.44,w,w*.25);g.fill();}}
function glass(g,x,y,w,h,r){const gr=g.createLinearGradient(x,y,x+w,y+h);gr.addColorStop(0,'#0f2233');gr.addColorStop(.55,'#2f5874');gr.addColorStop(1,'#10202e');g.fillStyle=gr;rrp(g,x,y,w,h,r);g.fill();
  g.fillStyle='rgba(255,255,255,.28)';rrp(g,x+w*.15,y+h*.12,w*.22,h*.3,r*.5);g.fill();}
function lamps(g,hl,hw,col,round){g.fillStyle=col||'#fff8dc';for(const s of[-1,1]){if(round){ellp(g,hl-2.6,s*hw*.66,1.9,1.9);g.fill();g.fillStyle='rgba(255,248,220,.35)';ellp(g,hl-2.6,s*hw*.66,3.2,3.2);g.fill();g.fillStyle=col||'#fff8dc';}else{g.fillRect(hl-2.2,s*hw*.7-1.3,1.6,2.6);}}}
function tails(g,hl,hw){g.fillStyle='#ff1744';for(const s of[-1,1]){g.fillRect(-hl+.4,s*hw*.7-1.4,1.4,2.8);}}

// generic body outline: nose (front) width fN, tail width fT, curve r (0..1)
function hull(g,hl,hw,fN,fT,r){g.beginPath();g.moveTo(hl,-hw*fN);g.quadraticCurveTo(hl+r*2,0,hl,hw*fN);g.quadraticCurveTo(hl*.92,hw,hl*.6,hw);g.lineTo(-hl*.65,hw);
  g.quadraticCurveTo(-hl*.98,hw*.98,-hl,hw*fT);g.quadraticCurveTo(-hl-r*1.5,0,-hl,-hw*fT);g.quadraticCurveTo(-hl*.98,-hw*.98,-hl*.65,-hw);g.lineTo(hl*.6,-hw);g.quadraticCurveTo(hl*.92,-hw,hl,-hw*fN);g.closePath();}

function drawCar(g,m,L,W,t){
  const hl=L/2,hw=W/2,[c1,c2]=m.c;t=t||0;g.save();
  // shadow
  g.fillStyle='rgba(0,0,0,.38)';ellp(g,1.2,1.6,hl+1.5,hw+1);g.fill();
  // rarity glow under the car (Epic+)
  if(m.gr>=3){const col=['','','','#c86bff','#ffc107','#ff3d71','#2ef3ff'][m.gr],p=.5+.5*Math.sin(t*2.6+m.gr);g.fillStyle=col;g.globalAlpha=.1+.1*p;ellp(g,0,0,hl+8,hw+7);g.fill();g.globalAlpha=1;}
  const K=m.k;
  if(K==='bug'){ // round bubble car with fenders
    for(const s of[-1,1])for(const x of[hl*.5,-hl*.5]){g.fillStyle=paint(g,c1,hw);ellp(g,x,s*hw*.72,hl*.3,hw*.36);g.fill();wheel(g,x,s*hw*.92,8,3.6,true);}
    g.fillStyle=paint(g,c1,hw*.82,1);ellp(g,0,0,hl*.94,hw*.8);g.fill();
    glass(g,-hl*.05,-hw*.52,hl*.42,hw*1.04,5);g.fillStyle=paint(g,c1,hw*.6,1);ellp(g,-hl*.36,0,hl*.32,hw*.55);g.fill();
    g.fillStyle=c2;ellp(g,hl*.62,0,hl*.18,hw*.3);g.fill();lamps(g,hl*1.02,hw*.95,null,1);
    g.fillStyle=chrome(g,0,-hw,0,hw);rrp(g,hl*.86,-hw*.75,2,hw*1.5,1);g.fill();rrp(g,-hl*.97,-hw*.7,2,hw*1.4,1);g.fill();}
  else if(K==='sedan30'){ // 1930s sedan: separate fenders, running boards, spare wheel
    g.fillStyle='#1a1a1a';rrp(g,-hl*.62,-hw*1.02,hl*1.2,hw*2.04,2);g.fill();
    for(const s of[-1,1])for(const x of[hl*.58,-hl*.6]){g.fillStyle=paint(g,c2,hw);ellp(g,x,s*hw*.8,hl*.26,hw*.32);g.fill();wheel(g,x,s*hw*.98,8.5,3.4,true);}
    g.fillStyle=paint(g,c1,hw*.8,1);rrp(g,-hl*.78,-hw*.7,hl*1.62,hw*1.4,4);g.fill();
    g.fillStyle=paint(g,c1,hw*.6,1);rrp(g,hl*.3,-hw*.38,hl*.62,hw*.76,3);g.fill(); // long hood
    g.fillStyle=chrome(g,0,-hw,0,hw);rrp(g,hl*.88,-hw*.38,2.4,hw*.76,1);g.fill(); // grille
    glass(g,hl*.12,-hw*.6,hl*.16,hw*1.2,2);g.fillStyle=shade(c1,.1);rrp(g,-hl*.62,-hw*.6,hl*.72,hw*1.2,3);g.fill();
    g.strokeStyle='rgba(255,255,255,.15)';g.lineWidth=.5;g.beginPath();g.moveTo(-hl*.6,0);g.lineTo(hl*.08,0);g.stroke();
    glass(g,-hl*.72,-hw*.44,hl*.08,hw*.88,1.5);
    g.fillStyle='#0b0b0b';ellp(g,-hl-1.5,0,2.6,4);g.fill();g.fillStyle='#d0d6da';ellp(g,-hl-1.5,0,1.2,2);g.fill(); // spare
    lamps(g,hl*.98,hw*1.05,null,1);tails(g,hl*.86,hw);}
  else if(K==='roadster'){ // open two-seater, long hood, wire wheels, cream interior
    for(const s of[-1,1])for(const x of[hl*.6,-hl*.58])wheel(g,x,s*hw*.9,8,3.4,true);
    g.fillStyle=paint(g,c1,hw*.95,1);hull(g,hl,hw*.92,.55,.7,2);g.fill();
    g.fillStyle=shade(c1,.25);rrp(g,hl*.05,-hw*.08,hl*.8,hw*.16,1);g.fill();
    g.fillStyle=c2;rrp(g,-hl*.48,-hw*.62,hl*.46,hw*1.24,4);g.fill(); // interior
    g.fillStyle=shade(c2,-.25);for(const s of[-1,1]){rrp(g,-hl*.44,s*hw*.32-hw*.24,hl*.2,hw*.48,2);g.fill();}
    g.fillStyle='#3e2723';ellp(g,-hl*.08,-hw*.3,2.2,2.2);g.fill(); // steering wheel
    g.fillStyle=chrome(g,0,-hw,0,hw);rrp(g,-hl*.03,-hw*.68,1.4,hw*1.36,.6);g.fill(); // windscreen frame
    g.fillStyle='rgba(180,220,240,.5)';rrp(g,-hl*.01,-hw*.62,1.2,hw*1.24,.5);g.fill();
    g.fillStyle=chrome(g,0,-hw,0,hw);rrp(g,hl*.92,-hw*.5,2,hw,1);g.fill();rrp(g,-hl*.98,-hw*.55,1.8,hw*1.1,1);g.fill();
    lamps(g,hl*.98,hw*.9,null,1);tails(g,hl*.95,hw*.85);}
  else if(K==='wagon'){ // estate with wood side panels
    for(const s of[-1,1])for(const x of[hl*.6,-hl*.56])wheel(g,x,s*hw*.96,8,3.4,true);
    g.fillStyle=paint(g,c2,hw);hull(g,hl,hw,.6,.92,1.5);g.fill(); // wood
    g.strokeStyle='rgba(60,30,10,.5)';g.lineWidth=.5;for(let x=-hl*.9;x<hl*.4;x+=5){g.beginPath();g.moveTo(x,-hw);g.lineTo(x,-hw*.72);g.moveTo(x,hw);g.lineTo(x,hw*.72);g.stroke();}
    g.fillStyle=paint(g,c1,hw*.72,1);rrp(g,-hl*.92,-hw*.72,hl*1.88,hw*1.44,4);g.fill();
    glass(g,hl*.18,-hw*.6,hl*.18,hw*1.2,2);g.fillStyle=shade(c1,.06);rrp(g,-hl*.82,-hw*.62,hl*.98,hw*1.24,3);g.fill();
    g.fillStyle='#5d4037';for(let k=0;k<4;k++)g.fillRect(-hl*.78+k*hl*.25,-hw*.5,1.1,hw);g.fillStyle='#795548';rrp(g,-hl*.7,-hw*.12,hl*.5,hw*.24,1);g.fill(); // roof rack + case
    glass(g,-hl*.92,-hw*.48,hl*.09,hw*.96,1.5);
    g.fillStyle=chrome(g,0,-hw,0,hw);rrp(g,hl*.93,-hw*.6,2,hw*1.2,1);g.fill();
    lamps(g,hl*.98,hw,null,1);tails(g,hl,hw*.9);}
  else if(K==='cruiser'){ // 1950s two-tone with tail fins and lots of chrome
    for(const s of[-1,1])for(const x of[hl*.58,-hl*.55])wheel(g,x,s*hw*.98,8,3.2,true);
    g.fillStyle=paint(g,c1,hw);hull(g,hl,hw,.75,.95,1.2);g.fill();
    g.fillStyle=c1;for(const s of[-1,1]){g.beginPath();g.moveTo(-hl*.35,s*hw);g.lineTo(-hl-3.5,s*hw*1.04);g.lineTo(-hl,s*hw*.62);g.closePath();g.fill();} // fins
    g.fillStyle=chrome(g,-hl,0,hl,0);for(const s of[-1,1])g.fillRect(-hl*.85,s*hw*.86-.5,hl*1.6,1); // side spears
    g.fillStyle=paint(g,c2,hw*.62,1);rrp(g,-hl*.48,-hw*.66,hl*.78,hw*1.32,4);g.fill(); // white roof
    glass(g,hl*.18,-hw*.64,hl*.15,hw*1.28,3);glass(g,-hl*.58,-hw*.56,hl*.12,hw*1.12,3);
    g.fillStyle=chrome(g,0,-hw,0,hw);rrp(g,hl*.9,-hw*.82,2.6,hw*1.64,1.2);g.fill();rrp(g,-hl*1.0,-hw*.8,2,hw*1.6,1);g.fill();
    g.fillStyle='#ffd54a';ellp(g,hl*.82,0,1.6,1.6);g.fill(); // hood ornament
    lamps(g,hl*1.02,hw*.98,null,1);g.fillStyle='#ff1744';for(const s of[-1,1]){ellp(g,-hl-2.6,s*hw*.96,1.6,1.2);g.fill();}}
  else if(K==='coupe'){ // sleek fastback
    for(const s of[-1,1])for(const x of[hl*.58,-hl*.58])wheel(g,x,s*hw*.94,8,3.4,true);
    g.fillStyle=paint(g,c1,hw);hull(g,hl,hw*.98,.5,.8,2.5);g.fill();
    g.fillStyle=paint(g,shade(c1,.08),hw*.6,1);g.beginPath();g.moveTo(hl*.15,-hw*.62);g.quadraticCurveTo(-hl*.2,-hw*.7,-hl*.86,-hw*.36);g.lineTo(-hl*.86,hw*.36);g.quadraticCurveTo(-hl*.2,hw*.7,hl*.15,hw*.62);g.closePath();g.fill();
    glass(g,hl*.08,-hw*.6,hl*.16,hw*1.2,3);g.fillStyle='rgba(15,35,50,.85)';g.beginPath();g.moveTo(-hl*.45,-hw*.42);g.lineTo(-hl*.84,-hw*.28);g.lineTo(-hl*.84,hw*.28);g.lineTo(-hl*.45,hw*.42);g.closePath();g.fill();
    g.fillStyle=c2;g.fillRect(-hl*.98,-hw*.1,L*.98,1);g.fillRect(-hl*.98,hw*.1-1,L*.98,1); // pin stripes
    g.fillStyle=chrome(g,0,-hw,0,hw);rrp(g,hl*.93,-hw*.45,1.8,hw*.9,1);g.fill();
    lamps(g,hl*.98,hw*.9,'#e3f6ff',1);tails(g,hl*.97,hw*.85);}
  else if(K==='muscle'){ // muscle car: wide, hood scoop, racing stripes
    for(const s of[-1,1])for(const x of[hl*.58,-hl*.58])wheel(g,x,s*hw*1.0,8.8,4.4,false);
    g.fillStyle=paint(g,c1,hw,1);rrp(g,-hl,-hw*.98,L,W*.98,4);g.fill();
    g.fillStyle=c2;g.fillRect(-hl,-hw*.28,L,hw*.18);g.fillRect(-hl,hw*.1,L,hw*.18); // stripes
    g.fillStyle='#111';rrp(g,hl*.38,-hw*.2,hl*.26,hw*.4,2);g.fill();g.fillStyle='#444';rrp(g,hl*.52,-hw*.14,hl*.08,hw*.28,1);g.fill(); // scoop
    g.fillStyle=shade(c1,-.05);rrp(g,-hl*.5,-hw*.66,hl*.72,hw*1.32,3);g.fill();g.fillStyle=c2;g.fillRect(-hl*.5,-hw*.28,hl*.72,hw*.18);g.fillRect(-hl*.5,hw*.1,hl*.72,hw*.18);
    glass(g,hl*.1,-hw*.62,hl*.14,hw*1.24,2);glass(g,-hl*.62,-hw*.55,hl*.12,hw*1.1,2);
    g.fillStyle='#111';rrp(g,-hl*1.02,-hw*.8,2.4,hw*1.6,1);g.fill(); // spoiler
    g.fillStyle='#bbb';for(const s of[-1,1]){ellp(g,-hl-.5,s*hw*.45,1,1);g.fill();}
    lamps(g,hl*.99,hw*.95,null,1);tails(g,hl*.9,hw);}
  else if(K==='arrow'){ // pre-war streamliner racer with number roundel
    for(const s of[-1,1])for(const x of[hl*.6,-hl*.55])wheel(g,x,s*hw*.92,8.4,3.6,false);
    const gr=g.createLinearGradient(0,-hw,0,hw);gr.addColorStop(0,'#78858c');gr.addColorStop(.3,'#ffffff');gr.addColorStop(.55,'#cdd6db');gr.addColorStop(1,'#5d6a70');
    g.fillStyle=gr;g.beginPath();g.moveTo(hl+2,0);g.bezierCurveTo(hl,-hw*.8,hl*.2,-hw*.85,-hl*.3,-hw*.8);g.quadraticCurveTo(-hl,-hw*.6,-hl-3,0);g.quadraticCurveTo(-hl,hw*.6,-hl*.3,hw*.8);g.bezierCurveTo(hl*.2,hw*.85,hl,hw*.8,hl+2,0);g.fill();
    g.fillStyle='#212121';ellp(g,-hl*.12,0,hl*.16,hw*.38);g.fill();g.fillStyle='#8d6e63';ellp(g,-hl*.16,0,hl*.08,hw*.22);g.fill(); // cockpit
    g.fillStyle='rgba(170,210,230,.7)';rrp(g,hl*.06,-hw*.32,1.2,hw*.64,.5);g.fill();
    g.fillStyle='#fff';ellp(g,-hl*.62,0,4.4,4.4);g.fill();g.strokeStyle=c2[1]?m.c[1]:'#e53935';g.lineWidth=1;g.stroke();
    g.fillStyle='#e53935';g.font='900 5px Game,system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('7',-hl*.62,.3);g.textBaseline='alphabetic';
    g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=.5;for(let k=0;k<4;k++){g.beginPath();g.moveTo(hl*.35+k*2,-hw*.3);g.lineTo(hl*.35+k*2,hw*.3);g.stroke();} // louvres
    g.fillStyle='#ff1744';ellp(g,-hl-2,0,1,1.4);g.fill();}
  else if(K==='limo'){ // pre-war luxury: huge grille, two-tone, gold trim
    g.fillStyle='#111';rrp(g,-hl*.6,-hw*1.02,hl*1.15,hw*2.04,2);g.fill();
    for(const s of[-1,1])for(const x of[hl*.6,-hl*.62]){g.fillStyle=paint(g,c1,hw);ellp(g,x,s*hw*.8,hl*.24,hw*.32);g.fill();wheel(g,x,s*hw*1.0,8.4,3.2,true,1);}
    g.fillStyle=paint(g,c1,hw*.8,1);rrp(g,-hl*.95,-hw*.72,hl*1.9,hw*1.44,4);g.fill();
    g.fillStyle=c2;g.fillRect(-hl*.95,-hw*.74,hl*1.9,.8);g.fillRect(-hl*.95,hw*.74-.8,hl*1.9,.8); // gold pinline
    g.fillStyle=paint(g,shade(c1,-.2),hw*.6,1);rrp(g,-hl*.72,-hw*.6,hl*.88,hw*1.2,3);g.fill(); // long cabin
    glass(g,hl*.16,-hw*.58,hl*.1,hw*1.16,2);for(const x of[-hl*.18,-hl*.48]){g.fillStyle='rgba(20,40,55,.6)';rrp(g,x,-hw*.6,hl*.22,hw*.12,1);g.fill();rrp(g,x,hw*.48,hl*.22,hw*.12,1);g.fill();}
    g.fillStyle=chrome(g,0,-hw,0,hw);rrp(g,hl*.82,-hw*.42,4,hw*.84,1.2);g.fill();g.fillStyle='#8a9399';for(let k=-3;k<=3;k++)g.fillRect(hl*.82+.6,k*hw*.1-.2,3,.4);
    g.fillStyle=c2;ellp(g,hl*.98,0,1.4,1.4);g.fill(); // mascot
    g.fillStyle='#d9c27a';rrp(g,-hl*1.04,-hw*.4,2.4,hw*.8,1);g.fill(); // trunk
    lamps(g,hl*1.0,hw*1.05,'#fff3c4',1);tails(g,hl*.97,hw*.85);}
  else if(K==='gull'){ // 50s gullwing sports car, silver, bulges over the wheels
    for(const s of[-1,1])for(const x of[hl*.58,-hl*.58])wheel(g,x,s*hw*.92,8,3.4,false);
    g.fillStyle=paint(g,c1,hw,1);hull(g,hl,hw,.62,.75,2.5);g.fill();
    g.fillStyle=shade(c1,.3);for(const x of[hl*.58,-hl*.58])for(const s of[-1,1]){ellp(g,x,s*hw*.72,hl*.18,hw*.2);g.fill();}
    g.fillStyle=c2;rrp(g,-hl*.36,-hw*.62,hl*.54,hw*1.24,4);g.fill(); // dark roof
    g.strokeStyle=shade(c1,-.1);g.lineWidth=.6;g.beginPath();g.moveTo(-hl*.36,0);g.lineTo(hl*.18,0);g.stroke(); // gullwing hinge
    glass(g,hl*.18,-hw*.58,hl*.14,hw*1.16,3);glass(g,-hl*.5,-hw*.5,hl*.13,hw,3);
    g.fillStyle='#37474f';for(let k=0;k<3;k++)g.fillRect(hl*.4+k*2.2,-hw*.3,1,hw*.6);
    g.fillStyle=chrome(g,0,-hw,0,hw);rrp(g,hl*.9,-hw*.35,2,hw*.7,1);g.fill();g.fillStyle='#263238';ellp(g,hl*.94,0,1.3,1.3);g.fill();
    lamps(g,hl*.98,hw*.88,'#e3f6ff',1);tails(g,hl*.95,hw*.8);}
  else if(K==='dynasty'){ // MYTHIC: gold-plated grand tourer with jewels
    for(const s of[-1,1])for(const x of[hl*.58,-hl*.58])wheel(g,x,s*hw*.98,8.6,3.8,true,1);
    const gg=g.createLinearGradient(0,-hw,0,hw);gg.addColorStop(0,'#7a4a00');gg.addColorStop(.25,'#ffe680');gg.addColorStop(.45,'#ffc107');gg.addColorStop(.6,'#fff3b0');gg.addColorStop(1,'#8d5a00');
    g.fillStyle=gg;hull(g,hl,hw,.6,.85,2.2);g.fill();
    g.save();hull(g,hl,hw,.6,.85,2.2);g.clip();const sx=((t*.4)%1.6-.3)*L-hl,sh=g.createLinearGradient(sx-10,0,sx+10,0);sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(.5,'rgba(255,255,255,.6)');sh.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=sh;g.fillRect(-hl,-hw,L,W);g.restore();
    g.fillStyle='#3b2300';rrp(g,-hl*.48,-hw*.62,hl*.8,hw*1.24,4);g.fill();
    glass(g,hl*.16,-hw*.6,hl*.15,hw*1.2,3);glass(g,-hl*.6,-hw*.5,hl*.12,hw,3);
    const gem=['#ff1744','#2979ff','#00e676'];for(let k=0;k<3;k++){g.fillStyle=gem[k];ellp(g,hl*.5,(k-1)*hw*.32,1.2,1.2);g.fill();}
    g.fillStyle='#fff';ellp(g,hl*.5-.3,-hw*.32-.3,.4,.4);g.fill();
    g.fillStyle='#fff3b0';g.save();g.translate(-hl*.08,0);g.rotate(Math.PI/2);g.beginPath();g.moveTo(-4,2);g.lineTo(-4,-2);g.lineTo(-2,0);g.lineTo(0,-3);g.lineTo(2,0);g.lineTo(4,-2);g.lineTo(4,2);g.closePath();g.fill();g.restore(); // crown on the roof
    lamps(g,hl*.99,hw*.9,'#fffde7',1);tails(g,hl*.98,hw*.85);}
  else if(K==='eternal'){ // MYTHIC: black hot-rod with exposed V8, flames and neon
    for(const s of[-1,1]){wheel(g,hl*.62,s*hw*.82,7,3,false);wheel(g,-hl*.58,s*hw*1.0,10,5,false);}
    g.fillStyle=paint(g,c1,hw,1);g.beginPath();g.moveTo(hl+1,-hw*.42);g.lineTo(hl+1,hw*.42);g.lineTo(hl*.2,hw*.6);g.lineTo(-hl*.3,hw*.9);g.lineTo(-hl,hw*.85);g.lineTo(-hl,-hw*.85);g.lineTo(-hl*.3,-hw*.9);g.lineTo(hl*.2,-hw*.6);g.closePath();g.fill();
    // flames along the hood
    for(const s of[-1,1]){const fg=g.createLinearGradient(hl,0,-hl*.2,0);fg.addColorStop(0,'#ffeb3b');fg.addColorStop(.5,'#ff6d00');fg.addColorStop(1,'rgba(255,23,68,0)');g.fillStyle=fg;g.beginPath();g.moveTo(hl,s*hw*.4);
      for(let k=0;k<4;k++){const x=hl-(k+1)*hl*.28;g.quadraticCurveTo(x+hl*.14,s*hw*(.9-.05*k),x,s*hw*(.55+.08*(k%2)));}g.lineTo(hl*.2,s*hw*.15);g.closePath();g.fill();}
    g.fillStyle='#212121';rrp(g,hl*.22,-hw*.3,hl*.5,hw*.6,2);g.fill(); // engine
    g.fillStyle=chrome(g,0,-hw,0,hw);for(let k=0;k<4;k++){rrp(g,hl*.26+k*hl*.11,-hw*.26,hl*.07,hw*.2,1);g.fill();rrp(g,hl*.26+k*hl*.11,hw*.06,hl*.07,hw*.2,1);g.fill();}
    g.fillStyle='#b0bec5';ellp(g,hl*.48,0,2.6,2);g.fill();
    g.fillStyle='#000';rrp(g,-hl*.62,-hw*.6,hl*.68,hw*1.2,3);g.fill();glass(g,hl*.0,-hw*.55,hl*.08,hw*1.1,1.5);
    const p=.5+.5*Math.sin(t*4);g.strokeStyle='rgba(255,61,113,'+(.55+.45*p)+')';g.lineWidth=1;g.beginPath();g.moveTo(-hl*.98,-hw*.82);g.lineTo(-hl*.3,-hw*.88);g.lineTo(hl*.2,-hw*.58);g.moveTo(-hl*.98,hw*.82);g.lineTo(-hl*.3,hw*.88);g.lineTo(hl*.2,hw*.58);g.stroke();
    g.fillStyle='#ff3d71';g.font='900 4px Game,system-ui';g.textAlign='center';g.fillText('∞',-hl*.3,1.5);
    for(const s of[-1,1]){g.fillStyle='#cfd8dc';rrp(g,-hl*.15,s*hw*.98-1,hl*.6,2,1);g.fill();if(((t*8)|0)%3===0){g.fillStyle='rgba(64,196,255,.8)';ellp(g,-hl*.2,s*hw*.98,2.4,.9);g.fill();}} // side pipes
    lamps(g,hl*1.0,hw*.62,'#fff',1);tails(g,hl,hw*.8);}
  g.restore();}

// ---------------------------------------------------------------- the garage on the map (called from drawCollection)
// x,y,w,h = where b_collection is drawn. Returns true when the garage is open (index.html then skips the "coming soon" tape).
function drawMap(X,x,y,w,h,time){const s=st();if(!s.o)return false;const k=w/560;
  for(let i=0;i<SPOTS;i++){const [sx,sy]=SPOT[i],cx=x+sx*k,cy=y+sy*k;
    const m=show6()[i];if(!m)continue;X.save();X.translate(cx,cy);if(i%2)X.rotate(Math.PI);drawCar(X,m,52,24,time||0);X.restore();}
  return true;}
const fmtS=n=>n>=1e9?'$'+(n/1e9).toFixed(1)+'B':n>=1e6?'$'+(n/1e6).toFixed(n%1e6?1:0)+'M':'$'+Math.round(n/1e3)+'K';

// ---------------------------------------------------------------- thumbnails for the pages
const TH={};
function thumb(id,w,hh){const key=id+'|'+w;if(TH[key])return TH[key];const c=document.createElement('canvas'),d=2;c.width=w*d;c.height=hh*d;
  const g=c.getContext('2d');g.scale(d,d);g.translate(w/2,hh/2);const sc=Math.min(w/54,hh/26)*.95;g.scale(sc,sc);drawCar(g,BY[id],46,20,.6);return TH[key]=c.toDataURL();}

// ---------------------------------------------------------------- page: MY COLLECTION · DEALER
const el=document.createElement('div');el.id='ccP';el.innerHTML='<div id="ccBox"><div class="ccHd"><button class="ccX" data-cc="x">↩</button><img class="ccT" src="img/cc/head.webp" alt="CLASSIC COLLECTION"><div class="ccMon" id="ccMon"></div></div>'+
  '<div class="ccTabs"><button data-cc="tab:g"><img class="i1" src="img/cc/tg1.webp" alt="MY GARAGE"><img class="i0" src="img/cc/tg0.webp" alt="MY GARAGE"></button><button data-cc="tab:d"><img class="i1" src="img/cc/td1.webp" alt="DEALER"><img class="i0" src="img/cc/td0.webp" alt="DEALER"></button></div><div id="ccBody"></div></div><div id="ccPop"></div>';
document.body.appendChild(el);let tab='g';
const GN=['COMMON','UNCOMMON','RARE','EPIC','LEGENDARY','MYTHIC','ASCENDED'];
function gc(gr){const G=T().GRADES;return G&&G[gr]?G[gr].c:'#999';}
function rwLine(r,big,b){const T0=T(),a=[];if(b)a.push('⚔️ <b style="color:#7dff8a">+'+b+'% ATK &amp; HP</b>');const per=v=>v>=1?'+'+Math.round(v*10)/10+' / h':'1 every '+Math.round(1/v)+' h';
  if(r.dm)a.push(T0.DMI+' '+per(r.dm));if(r.es)a.push(T0.ESI+' +'+T0.fmt(Math.round(r.es*T0.ESS_U())).replace('$','')+' / h');if(r.gp)a.push(T0.GPI+' +'+T0.fmt(Math.round(r.gp*T0.GP_U())).replace('$','')+' / h');if(r.tk)a.push('<img class="tki" src="img/ticket.webp"> '+per(r.tk));if(r.ct)a.push('<img class="tki" src="img/cticket.webp"> '+per(r.ct));if(r.gt)a.push('<img class="tki" src="img/gticket.webp"> '+per(r.gt));
  return a.join(big?'<br>':' · ');}
function open(t){tab=t||tab;el.classList.add('open');render();}
function close(){el.classList.remove('open');$p().classList.remove('open');}
const $p=()=>document.getElementById('ccPop');
function render(){const T0=T(),G=T0.G,s=st();document.getElementById('ccMon').innerHTML=T0.fmt(G.money);
  el.querySelectorAll('.ccTabs button').forEach(b=>b.classList.toggle('on',b.dataset.cc==='tab:'+tab));let h='';
  if(!s.o){const ok=G.rep>=OPEN_REP;
    h='<div class="ccClosed"><img src="'+thumb('dyn',260,120)+'"><h3>Open your Collection Garage</h3><p>Buy classic cars from the dealer and park them in your private showroom. Every parked car brings <b>diamonds</b> and <b>tickets</b> while you are away (collect them with <b>IDLE</b>).</p>'+
      '<button class="ccBuy'+(ok&&G.money>=OPEN_COST?'':' off')+'" data-cc="open">'+(ok?'OPEN · '+T0.fmt(OPEN_COST):'🔒 REP '+OPEN_REP)+'</button></div>';
    document.getElementById('ccBody').innerHTML=h;return;}
  if(tab==='g'){const R=rates(),O=owned(),n=O.length,bb=Math.round(battleB()*100)/100;
    h+='<div class="ccSum"><b>YOUR COLLECTION · '+n+' / '+CARS.length+' CARS</b><div>⚔️ All heroes in battle: <b style="color:#7dff8a">+'+bb+'% ATK &amp; HP</b></div><div>'+(n?rwLine(R):'Buy a car to get diamonds, Essence, Gear Parts and tickets')+'</div>'+
      '<small>Idle money +'+n+'% (1% per car) · your 6 most expensive cars are shown in the garage on the map</small></div><div class="ccGrid">';
    for(const m of O.slice().sort((a,b)=>b.price-a.price))h+='<div class="ccSp" data-cc="car:'+m.id+'" style="--gc:'+gc(m.gr)+'"><div class="ccGl"><em>'+GN[m.gr]+'</em><img src="'+thumb(m.id,150,72)+'"><small>'+rwLine(m.r,0,m.b)+'</small></div><b class="ccPl">'+m.n+'</b></div>';
    h+='<div class="ccSp empty" data-cc="tab:d"><div class="ccGl"><span>＋</span><em>BUY MORE CARS</em></div><b class="ccPl">DEALER</b></div></div>';}
  else{h+='<div class="ccNote">Every car can be owned <b>once</b> and counts forever – no parking limit. Rewards are fixed – nothing random.</div>';
    for(const m of CARS){const own=s.own.includes(m.id),lk=G.rep<m.rep,cant=!own&&(lk||G.money<m.price);
      h+='<div class="ccRow" data-cc="car:'+m.id+'" style="--gc:'+gc(m.gr)+'"><div class="ccImg"><img src="'+thumb(m.id,150,72)+'"></div><div class="ccInf"><b>'+m.n+'</b><em>'+GN[m.gr]+'</em><small>'+rwLine(m.r,0,m.b)+'</small></div>'+
        '<button class="ccBuy'+(own?' own':cant?' off':'')+'" data-cc="buy:'+m.id+'">'+(own?'✓ OWNED':lk?'🔒 REP '+m.rep:T0.fmt(m.price))+'</button></div>';}}
  document.getElementById('ccBody').innerHTML=h;}
function pop(id){const T0=T(),G=T0.G,s=st(),m=BY[id],own=s.own.includes(id);
  const P=$p();P.innerHTML='<div class="ccPB" style="--gc:'+gc(m.gr)+'"><button class="ccX" data-cc="px">✕</button><em>'+GN[m.gr]+'</em><h3>'+m.n+'</h3><img src="'+thumb(id,300,140)+'">'+
    '<div class="ccPR"><b>WHILE YOU OWN IT</b><div>'+rwLine(m.r,1,m.b)+'</div></div>'+
    (own?'<button class="ccBuy sell" data-cc="sell:'+id+'">SELL · '+T0.fmt(m.price*SELL_BACK)+'</button>':'<button class="ccBuy" data-cc="buy:'+id+'">BUY · '+T0.fmt(m.price)+(G.rep<m.rep?' · 🔒 REP '+m.rep:'')+'</button>')+'</div>';
  P.classList.add('open');}
function act(a){const T0=T(),G=T0.G,s=st();
  if(a==='x')return close();if(a==='px')return $p().classList.remove('open');
  if(a.startsWith('tab:')){tab=a.slice(4);return render();}
  if(a==='open'){if(G.rep<OPEN_REP)return T0.toast('🔒 The Collection Garage opens at REP '+OPEN_REP,2500);if(G.money<OPEN_COST)return T0.toast('Not enough money',2000);
    G.money-=OPEN_COST;s.o=1;T0.save();T0.toast('🏆 Collection Garage OPEN! Buy your first classic car at the dealer.',3500);tab='d';return render();}
  if(a==='spot'){const i=s.sp,c=SPOT_COST[i];if(i>=SPOTS)return;if(G.money<c)return T0.toast('Not enough money',2000);G.money-=c;s.sp++;T0.save();T0.toast('🅿️ Spot '+(i+1)+' unlocked',2200);return render();}
  if(a.startsWith('car:'))return pop(a.slice(4));
  if(a.startsWith('buy:')){const m=BY[a.slice(4)];if(s.own.includes(m.id))return pop(m.id);
    if(G.rep<m.rep)return T0.toast('🔒 '+m.n+' needs REP '+m.rep,2500);if(G.money<m.price)return T0.toast('Not enough money',2000);
    G.money-=m.price;s.own.push(m.id);s.p=show6().map(c=>c.id);T0.save();$p().classList.remove('open');T0.toast('🚘 '+m.n+' joins your collection! All heroes +'+m.b+'% ATK & HP',3200);tab='g';return render();}
  if(a.startsWith('sell:')){const id=a.slice(5),i=s.own.indexOf(id);if(i<0)return;const btn=$p().querySelector('.sell');
    if(!btn.dataset.sure){btn.dataset.sure=1;btn.textContent='TAP AGAIN TO SELL';return;}
    G.money+=Math.round(BY[id].price*SELL_BACK);s.own.splice(i,1);s.p=show6().map(c=>c.id);T0.save();$p().classList.remove('open');T0.toast('💰 Sold for '+T0.fmt(BY[id].price*SELL_BACK),2500);return render();}}
el.addEventListener('click',e=>{const b=e.target.closest('[data-cc]');if(b&&b.dataset.cc)act(b.dataset.cc);else if(e.target.id==='ccPop')$p().classList.remove('open');});
setInterval(()=>{if(el.classList.contains('open')){const T0=T();if(T0)document.getElementById('ccMon').innerHTML=T0.fmt(T0.G.money);}},1000);

const css=document.createElement('style');css.textContent=`
#ccP{position:fixed;inset:0;z-index:40;display:none;background:linear-gradient(#0000 0,#0000 18%,#0a0c1499 45%,#0a0c14cc),url(img/cc/bg.webp) center top/cover #0a0c14;color:#fff;font-family:Game,system-ui;overflow:hidden}#ccP.open{display:block}
#ccBox{position:absolute;inset:0;display:flex;flex-direction:column;max-width:560px;margin:0 auto}
.ccHd{position:relative;display:flex;flex-direction:column;align-items:center;padding:calc(env(safe-area-inset-top) + 6px) 8px 0}
.ccHd .ccX{position:absolute;left:8px;top:calc(env(safe-area-inset-top) + 6px);z-index:1}.ccHd .ccMon{margin-top:-4px;z-index:1}
.ccX{width:40px;height:40px;border-radius:50%;border:2px solid #e0aa25;background:#1d1a2e;color:#ffd54a;font:900 20px Game,system-ui;flex:none}
.ccT{width:min(84%,440px);margin-top:6px;display:block;filter:drop-shadow(0 4px 8px #000c)}
.ccMon{font:900 13px Game,system-ui;color:#ffd54a;background:#0008;border:1px solid #e0aa2588;border-radius:12px;padding:4px 8px;flex:none}
.ccTabs{display:flex;gap:8px;padding:6px 10px 8px}.ccTabs button{flex:1;padding:0;border:0;background:none;aspect-ratio:420/100;position:relative}
.ccTabs img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 3px 4px #000a)}.ccTabs .i1{display:none}.ccTabs button.on .i1{display:block}.ccTabs button.on .i0{display:none}
#ccBody{flex:1;overflow-y:auto;padding:4px 10px 18px;touch-action:pan-y}
.ccSum{background:linear-gradient(#1f1a33ee,#120f20ee);border:2px solid #e0aa2588;border-radius:14px;padding:10px;text-align:center;margin-bottom:10px}.ccSum b{color:#ffd54a;font-size:12px;letter-spacing:.5px}.ccSum div{margin:6px 0;font:800 13px Game,system-ui}.ccSum small{color:#9fb0c0}.ccSum i{color:#7CFC9A;font-style:normal}
.ccGrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}
.ccSp{position:relative;aspect-ratio:420/539;background:url(img/cc/card.webp) center/100% 100% no-repeat;text-align:center;container-type:inline-size;filter:drop-shadow(0 4px 8px #000c)}
.ccGl{position:absolute;left:8%;right:8%;top:12%;height:58%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2%;background:radial-gradient(ellipse at 50% 55%,color-mix(in srgb,var(--gc,#000) 30%,transparent),transparent 70%)}
.ccGl>img{width:100%}.ccGl em{font:900 7cqw Game,system-ui;color:var(--gc);font-style:normal;text-shadow:0 1px 2px #000}.ccGl small{font:800 6.4cqw/1.3 Game,system-ui;color:#d7e3ff;text-shadow:0 1px 2px #000}.ccGl .tki{height:1.25em;vertical-align:-.3em}
.ccPl{position:absolute;left:17%;right:17%;top:77.5%;height:13%;display:flex;align-items:center;justify-content:center;font:900 italic 7.6cqw Game,system-ui;color:#ffe9a8;text-shadow:0 2px 2px #000;white-space:nowrap;overflow:hidden}
.ccSp.empty .ccGl span{font:300 30cqw/1 Game,system-ui;color:#ffd54a;text-shadow:0 0 12px #e0aa25}.ccSp.empty .ccGl em{color:#ffd54a}.ccSp.lock{filter:grayscale(.85) brightness(.75) drop-shadow(0 4px 8px #000c)}.ccSp.lock.nx{filter:drop-shadow(0 4px 8px #000c)}.ccSp.lock .ccGl span{font-size:20cqw}.ccSp.lock .ccGl em{color:#aaa}.ccSp.lock .ccBuy{font-size:6.5cqw;padding:5px 7px;filter:none}
.ccSp:not(.lock) .ccPl{color:#ffe082}
.ccNote{font:700 12px Game,system-ui;color:#c9b8ef;text-align:center;margin:0 0 8px}
.ccRow{display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:6px;border-radius:14px;border:2px solid var(--gc);background:linear-gradient(90deg,color-mix(in srgb,var(--gc) 22%,#120f20ee),#120f20e6 60%);box-shadow:0 3px 8px #000a}
.ccImg{width:96px;flex:none;background:radial-gradient(ellipse,#2e3440,#15181f);border-radius:10px;padding:2px}.ccImg img{width:100%;display:block}
.ccInf{flex:1;min-width:0;display:flex;flex-direction:column}.ccInf b{font:900 14px Game,system-ui}.ccInf em{font:900 10px Game,system-ui;color:var(--gc);font-style:normal}.ccInf small{font:700 10.5px Game,system-ui;color:#d7e3ff;margin-top:2px}
.ccBuy{flex:none;padding:9px 10px;border-radius:12px;border:2px solid #7a4a00;background:linear-gradient(#ffe066,#ffa000);color:#3a1d00;font:900 13px Game,system-ui;box-shadow:0 3px 0 #7a4a00;white-space:nowrap}
.ccBuy.off{filter:grayscale(1) brightness(.7)}.ccBuy.own{background:linear-gradient(#69f0ae,#1b9e55);border-color:#0b5c30;color:#04230f;box-shadow:0 3px 0 #0b5c30}.ccBuy.sell{background:linear-gradient(#ff8a80,#d32f2f);border-color:#7f0000;color:#fff;box-shadow:0 3px 0 #7f0000}
.ccClosed{text-align:center;padding:20px 10px}.ccClosed img{width:80%;max-width:300px}.ccClosed h3{color:#ffd54a;font:900 20px Game,system-ui}.ccClosed p{color:#d7e3ff;line-height:1.45}.ccClosed .ccBuy{font-size:17px;padding:12px 26px}
#ccPop{position:fixed;inset:0;z-index:41;display:none;align-items:center;justify-content:center;background:#000a}#ccPop.open{display:flex}
.ccPB{position:relative;width:min(92vw,400px);border-radius:18px;border:3px solid var(--gc);background:radial-gradient(ellipse at 50% 30%,#2c2440,#0f0c18);padding:16px;text-align:center;box-shadow:0 0 30px color-mix(in srgb,var(--gc) 50%,transparent)}
.ccPB .ccX{position:absolute;right:8px;top:8px;width:34px;height:34px;font-size:16px}.ccPB em{color:var(--gc);font:900 12px Game,system-ui;font-style:normal}.ccPB h3{margin:2px 0 6px;font:900 italic 22px Game,system-ui;color:#fff}.ccPB img{width:100%}
.ccPR{margin:8px 0 12px;background:#0007;border-radius:12px;padding:8px;font:800 14px Game,system-ui;line-height:1.6}.ccPR b{color:#ffd54a;font-size:11px}
#ccP .tki,#ccPop .tki{height:1.3em;vertical-align:-.3em}
`;document.head.appendChild(css);

window.CC={CARS,drawMap,drawCar,open,close,rates,st,battleB,isOpen:()=>el.classList.contains('open'),sig:()=>{const s=T()&&T().G.cc;return s?s.o+'|'+(s.own||s.p).join(','):'';}};
})();
