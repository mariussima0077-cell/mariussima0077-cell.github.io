// Torque Empire – LABELS ON BUTTON PICTURES (Marius, 26 nov 2026: languages).
// The map button pictures (img/nt/…) have NO text any more; the word on the red ribbon is written here, in every
// language (English too), through window.__tr. Positions = the ribbon area in % of the picture (from the old picture).
(function(){
var LB={ // id: [English text, cx%, cy%, w%, h%]
  cpBtn:['BATTLE',49.7,90.1,62,11],heBtn:['HEROES',50.4,76.4,64,13],smBtn:['SUMMON',51.3,77.2,68,10],tmBtn:['CREW',49,77.3,60,10.2],
  idBtn:['IDLE',51,77.3,58,10.5],dqBtn:['QUESTS',49,77.2,66,10.1],arBtn:['ARENA',49.7,85.6,56,9],
  rkBtn:['RANK',50,74.6,52,9],chBtn:['CHAT',50,74.7,52,9.6],ciBtn:['CHECK-IN',50,75,64,10.3],nwBtn:['NEWS',50,74.5,52,9.7],
  mlBtn:['MAIL',50,74.6,52,9],evBtn:['EVENTS',50,73.2,56,7.6]
};
var NAT={};
function nat(url,cb){if(NAT[url])return cb(NAT[url]);var i=new Image();i.onload=function(){NAT[url]=[i.naturalWidth,i.naturalHeight];cb(NAT[url]);};i.src=url;}
function bgRect(el,e,cb){var cs=getComputedStyle(el),m=/url\(["']?([^"')]+)/.exec(cs.backgroundImage);if(!m)return;
  nat(m[1],function(n){var W=e.width,H=e.height,bs=cs.backgroundSize.split(' '),w,h;
    if(bs[0]==='contain'||bs[0]==='cover'){var k=bs[0]==='contain'?Math.min(W/n[0],H/n[1]):Math.max(W/n[0],H/n[1]);w=n[0]*k;h=n[1]*k;}
    else{w=bs[0]==='auto'?null:(bs[0].indexOf('%')>0?W*parseFloat(bs[0])/100:parseFloat(bs[0]));h=!bs[1]||bs[1]==='auto'?null:(bs[1].indexOf('%')>0?H*parseFloat(bs[1])/100:parseFloat(bs[1]));
      if(w==null&&h==null){w=n[0];h=n[1];}else if(w==null)w=h*n[0]/n[1];else if(h==null)h=w*n[1]/n[0];}
    var bp=cs.backgroundPosition.split(' '),px=function(v,free){return v.indexOf('%')>0?free*parseFloat(v)/100:parseFloat(v)||0;};
    cb({left:px(bp[0]||'50%',W-w),top:px(bp[1]||'50%',H-h),width:w,height:h});});}
function put(el,r,d){if(getComputedStyle(el).position==='static')el.style.position='relative';var s=el.querySelector(':scope>.teLb');if(!s){s=document.createElement('span');s.className='teLb';s.setAttribute('data-notr','1');el.appendChild(s);}
  var t=(window.__tr||String)(d[0]).replace(/ /g,'\u00a0').replace(/-/g,'\u2011'); // no-break: normal white-space keeps pagefx.js awayvar key=t+'|'+Math.round(r.left)+'|'+Math.round(r.top)+'|'+Math.round(r.width)+'|'+Math.round(r.height);if(s.__k===key)return;s.__k=key;
  var w=r.width*d[3]/100,h=r.height*d[4]/100;
  s.style.cssText='position:absolute;pointer-events:none;z-index:2;display:flex;align-items:center;justify-content:center;white-space:normal;word-break:keep-all;overflow:visible;'+
    'left:'+(r.left+r.width*d[1]/100-w/2)+'px;top:'+(r.top+r.height*d[2]/100-h/2)+'px;width:'+w+'px;height:'+h+'px;'+
    'font:900 '+(h*1.35)+'px Game,system-ui;color:#fff;letter-spacing:.2px;text-shadow:0 1px 0 #4a0000,0 -1px 0 #4a0000,1px 0 0 #4a0000,-1px 0 0 #4a0000,0 2px 2px #0008;line-height:1';
  s.textContent=t;var f=h*1.35;var g=0;while(s.scrollWidth>w*1.08&&f>h*0.7&&g++<30){f-=0.5;s.style.fontSize=f+'px';}}
function one(id){var el=document.getElementById(id),d=LB[id];if(!el||!el.offsetParent)return;if(el.offsetWidth<4)return;
  if(getComputedStyle(el).position==='static')el.style.position='relative';
  // layout sizes (offset*) – not getBoundingClientRect, so a scaled button is not scaled twice
  var img=el.querySelector(':scope>img');
  if(img){if(!img.offsetWidth)return;var x=img.offsetLeft,y=img.offsetTop;if(img.offsetParent!==el){x-=el.offsetLeft;y-=el.offsetTop;}
    put(el,{left:x,top:y,width:img.offsetWidth,height:img.offsetHeight},d);}
  else bgRect(el,{width:el.clientWidth,height:el.clientHeight},function(r){put(el,r,d);});}
function all(){for(var id in LB)try{one(id);}catch(_){}}
window.TE_LABELS=all;
addEventListener('resize',function(){setTimeout(all,50);});
setInterval(all,1000);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(all,300);});else setTimeout(all,300);
})();
