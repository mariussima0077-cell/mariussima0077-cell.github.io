// Torque Empire – LANGUAGES (Marius, 26 nov 2026). The game is written in English; this file translates
// what the player sees, while the game runs: every text on the screen (DOM) and every text drawn on a canvas.
// • language = the one chosen in Profile → LANGUAGE (localStorage te_lang), else the phone language, else English
// • English = this file does nothing (no cost)
// • dictionaries: lang/<code>.js → TE_LANG_LOAD({ "English text": "translation", "LV #": "NIV #" … })  (# = any number)
// • a text with no translation simply stays in English (names of heroes, monsters, skills, places stay English on purpose)
// • labels that become too long for their box get a smaller font automatically (fit)
(function(){
var SUP={en:'English',fr:'Français',es:'Español',pt:'Português',ko:'한국어',ja:'日本語'};
var sel=null;try{sel=localStorage.getItem('te_lang');}catch(e){}
var nav=((navigator.language||'en')+'').slice(0,2).toLowerCase();
var L=(sel&&SUP[sel])?sel:(SUP[nav]?nav:'en');
window.TE_LANG=L;window.TE_LANGS=SUP;window.TE_LANGSEL=sel;
window.TE_SETLANG=function(c){try{localStorage.setItem('te_lang',c);}catch(e){}location.reload();};
window.__tr=function(s){return s;};
// language button on the start screen (works offline too) – also in Profile → LANGUAGE
function langBtn(){var ld=document.getElementById('loader');if(!ld||document.getElementById('teLang'))return;
  var b=document.createElement('div');b.id='teLang';b.setAttribute('data-notr','1');
  b.style.cssText='position:absolute;top:calc(env(safe-area-inset-top) + 10px);right:10px;z-index:30;font:800 13px Game,system-ui;color:#fff;background:#000a;border:2px solid #ffd54a;border-radius:12px;padding:6px 10px;cursor:pointer;user-select:none';
  b.textContent='🌐 '+SUP[L];
  var m=document.createElement('div');m.setAttribute('data-notr','1');m.style.cssText='display:none;position:absolute;top:calc(env(safe-area-inset-top) + 48px);right:10px;z-index:31;background:#0d1320f2;border:2px solid #ffd54a;border-radius:12px;overflow:hidden;font:800 15px Game,system-ui';
  Object.keys(SUP).forEach(function(c){var o=document.createElement('div');o.textContent=(c===L?'✅ ':'')+SUP[c];o.style.cssText='padding:10px 18px;color:'+(c===L?'#ffd54a':'#fff')+';border-bottom:1px solid #ffffff18';
    o.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();if(c!==L)window.TE_SETLANG(c);else m.style.display='none';});m.appendChild(o);});
  ['click','pointerdown','pointerup','touchstart','touchend','mousedown','mouseup'].forEach(function(ev){b.addEventListener(ev,function(e){e.stopPropagation();});m.addEventListener(ev,function(e){e.stopPropagation();});});
  b.addEventListener('click',function(){m.style.display=m.style.display==='none'?'block':'none';});
  ld.appendChild(b);ld.appendChild(m);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',langBtn);else langBtn();
if(L==='en')return;
try{document.documentElement.lang=L;}catch(e){}
window.TE_LANG_LOAD=function(D){
  var NUM=/\d[\d.,]*/g,CACHE=new Map(),MISS=window.__MISS=new Set();
  function look(c){var r=D[c];if(r!=null)return r;var n=c.match(NUM);if(n){var t=c.replace(NUM,'#');r=D[t];if(r!=null){var i=0;return r.replace(/#/g,function(){var v=n[i++];return v==null?'':v;});}}return null;}
  var SEPS=['  ·  ',' · ',' – ',' → '];
  function core(c,d){var r=look(c);if(r!=null)return r;if(d>3)return null;
    var pm=c.match(/^([^A-Za-z0-9]+)([\s\S]+)$/);if(pm){r=core(pm[2],d+1);if(r!=null)return pm[1]+r;}
    var sm=c.match(/^([\s\S]*?[A-Za-z0-9)%])([^A-Za-z0-9)%]+)$/);if(sm&&sm[2].trim()){r=core(sm[1],d+1);if(r!=null)return r+sm[2];}
    for(var k=0;k<SEPS.length;k++){var sep=SEPS[k];if(c.indexOf(sep)>=0){var parts=c.split(sep),ok=0;var o=parts.map(function(p){var q=p.trim()?core(p.trim(),d+1):null;if(q!=null){ok++;return p.replace(p.trim(),q);}return p;});if(ok)return o.join(sep);}}
    if(d===0&&DT.test(c)){var any=0,o2=c.replace(TK,function(w){var v=D['@'+w];if(v!=null){any=1;return v;}return w;});if(any){if(D['@cjk']){var sx=D['@cjk'];o2=o2.replace(/(\S+) (\d{1,2}) (\d{1,2}(?:월|月))(?!\d)/g,function(_,w,dd,mm){return mm+' '+dd+sx+'('+w+')';}).replace(/(\d{1,2}(?:월|月)) (\d{1,2}) (\d{4})/g,function(_,mm,dd,yy){return yy+' '+mm+' '+dd+sx;});}var o3=core(o2,1);return o3!=null?o3:o2;}}
    return null;}
  var MO='Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec',DT=new RegExp('\\b\\d{1,2} ('+MO+')\\b|\\b('+MO+') \\d{1,2}\\b'),TK=new RegExp('\\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun|'+MO+')\\b','g');
  function tr(s){if(typeof s!=='string'||!/[A-Za-z]/.test(s))return s;var h=CACHE.get(s);if(h!==undefined)return h;
    var m=s.match(/^(\s*)([\s\S]*?)(\s*)$/),r=core(m[2],0),out=r!=null?m[1]+r+m[3]:s;
    if(r==null&&MISS.size<3000)MISS.add(m[2]);if(CACHE.size>20000)CACHE.clear();CACHE.set(s,out);return out;}
  window.__tr=tr;
  // canvas text (battle, map labels)
  var P=CanvasRenderingContext2D.prototype;['fillText','strokeText','measureText'].forEach(function(f){var o=P[f];P[f]=function(t){if(typeof t==='string'){arguments[0]=tr(t);}return o.apply(this,arguments);};});
  // DOM text
  var busy=false,fitQ=new Set(),fitT=0;
  function skip(p){return !p||/^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName)||(p.closest&&p.closest('[data-notr],.bub p,.bub .h'));}
  function doText(n){if(busy)return;var p=n.parentElement;if(skip(p))return;var t=n.data;if(n.__fr===t)return;var r=tr(t);
    if(r!==t){n.__en=t;n.__fr=r;busy=true;n.data=r;busy=false;fitQ.add(p);if(!fitT)fitT=requestAnimationFrame(fitAll);}}
  function doAttr(e){var a=['placeholder','title','aria-label'];for(var i=0;i<a.length;i++){var v=e.getAttribute&&e.getAttribute(a[i]);if(v&&/[A-Za-z]/.test(v)){var r=tr(v);if(r!==v)e.setAttribute(a[i],r);}}}
  function walk(root){if(!root)return;var it=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT),x=root;
    while(x){if(x.nodeType===3)doText(x);else if(x.nodeType===1){if(x.attributes&&x.attributes.length)doAttr(x);if(x.shadowRoot)watch(x.shadowRoot);}x=it.nextNode();}}
  function watch(root){if(root.__teob)return;root.__teob=1;new MutationObserver(function(ms){if(busy)return;for(var i=0;i<ms.length;i++){var m=ms[i];
      if(m.type==='characterData')doText(m.target);else if(m.type==='attributes')doAttr(m.target);else for(var j=0;j<m.addedNodes.length;j++){var a=m.addedNodes[j];if(a.nodeType===3)doText(a);else if(a.nodeType===1)walk(a);}}})
    .observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});walk(root);}
  // fit: a label that does not fit any more (one line, or a box that cuts it) gets a smaller font, max −30 %
  function fitAll(){fitT=0;var q=Array.from(fitQ);fitQ.clear();for(var i=0;i<q.length;i++){var e=q[i];try{fit(e);}catch(_){}}}
  function fit(e){if(!e.isConnected||e.__fitting)return;var cs=getComputedStyle(e);if(cs.display==='none')return;
    var one=cs.whiteSpace.indexOf('nowrap')>=0||cs.textOverflow==='ellipsis',cut=/hidden|clip/.test(cs.overflowX+cs.overflowY);
    if(!one&&!cut)return;if(e.scrollWidth<=e.clientWidth+1&&e.scrollHeight<=e.clientHeight+1)return;
    var f0=e.__f0||(e.__f0=parseFloat(cs.fontSize));if(!f0)return;e.__fitting=1;var f=parseFloat(cs.fontSize);
    while(f>f0*0.7&&(e.scrollWidth>e.clientWidth+1||(cut&&e.scrollHeight>e.clientHeight+1))){f-=0.5;e.style.fontSize=f+'px';}
    e.__fitting=0;}
  window.__FR={tr:tr,miss:MISS};
  var as=Element.prototype.attachShadow;Element.prototype.attachShadow=function(o){var s=as.call(this,o);setTimeout(function(){watch(s);},0);return s;};
  function start(){watch(document.body);}
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
};
document.write('<script src="lang/'+L+'.js?v=1"><\/script>');
})();
