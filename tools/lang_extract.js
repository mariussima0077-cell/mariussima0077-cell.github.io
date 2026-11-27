// Extract player-visible English text pieces from the game's JS + inline scripts + HTML.
const fs=require('fs'),acorn=require('acorn'),walk=require('acorn-walk');
const R='/home/claude/mariussima0077-cell/mariussima0077-cell.github.io/';
const files=['battle.js','btnfx.js','classic.js','cloud.js','events.js','grandprix.js','online.js','pagefx.js','shop2.js','street.js','tutorial.js','xfer.js','secure.js'];
const out=new Map();const NUM=/\d[\d.,]*/g;
function add(t,src){t=t.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
  if(!t||t.length<2)return;if(/[<>]|class=|style=|data-[a-z]+=|px;|^\[data-|="$/.test(t))return;if(/^[A-Z][a-z]+ [A-Z][a-z]+:[a-z]+$/.test(t))return;if(!/[A-Za-z]{2,}/.test(t))return;
  // code-like filters
  if(/^[a-z_$][\w$]*$/.test(t))return;           // identifier / key
  if(/^[\w-]+\.(webp|png|jpg|js|json|html|mp3|ogg|wav)/.test(t))return;
  if(/^(https?:|\/|\.\/|img\/|data:)/.test(t))return;
  if(/[{};]\s*$/.test(t)&&/:/.test(t))return;     // css
  if(/^[#.][\w-]+([ >.#:\[][\w-=\]'"#. >:()]*)?$/.test(t))return; // selector
  if(/(^|;)\s*[a-z-]+\s*:\s*[^;]+;/.test(t))return; // inline css
  if(/^(rgba?|hsla?|linear-gradient|radial-gradient|translate|rotate|scale|cubic-bezier|var|calc|url)\(/.test(t))return;
  if(/^\d*\.?\d+(px|em|rem|%|s|ms|deg|vh|vw)\b/.test(t))return;
  if(/^(bold|normal|italic|\d00)\s+\d/.test(t))return; // canvas font
  if(/^[a-z]+(-[a-z]+)+$/.test(t))return;          // kebab
  if(/^[a-z][a-zA-Z]+[A-Z]\w*$/.test(t))return;    // camelCase
  if(/^(true|false|null|undefined|function|return|const|let|var)$/.test(t))return;
  if(/^[a-z]{1,4}\d*$/.test(t))return;
  if(/^[\w]+=[\w]+/.test(t))return;
  if(/^(click|touchstart|pointerdown|keydown|load|error|resize|visibilitychange|beforeunload|message|input|change)$/.test(t))return;
  if(/^(div|span|button|img|canvas|b|i|small|style|script|a|p|br|hr|ul|li|table|tr|td|input|select|option|label|section|svg|path)$/i.test(t))return;
  const k=t.replace(NUM,'#');if(!out.has(k))out.set(k,src);}
function htmlPieces(s,src){ // split html string into text pieces (between tags)
  s=s.replace(/<(script|style)[\s\S]*?<\/\1>/gi,' ');
  for(const p of s.split(/<[^>]*>/))add(p,src);
  for(const m of s.matchAll(/\b(?:title|placeholder|alt|aria-label|data-tip)=["']([^"']+)["']/g))add(m[1],src);}
function strPiece(s,src){if(/<\/?[a-zA-Z][^>]*>|<[a-z]/.test(s))htmlPieces(s,src);else{
  // html fragments split across template pieces: drop leading partial tag remains
  s=s.replace(/^[^<]*?>/,m=>/[="]/.test(m)?'':m).replace(/<[^>]*$/,'');add(s,src);}}
function doJS(code,src){let ast;try{ast=acorn.parse(code,{ecmaVersion:'latest',allowHashBang:true,sourceType:'script',allowReturnOutsideFunction:true});}catch(e){console.error('PARSE',src,e.message);return;}
  walk.full(ast,n=>{if(n.type==='Literal'&&typeof n.value==='string')strPiece(n.value,src);
    else if(n.type==='TemplateLiteral'){for(const q of n.quasis)strPiece(q.value.cooked||'',src);}});}
for(const f of files)doJS(fs.readFileSync(R+f,'utf8'),f);
let html=fs.readFileSync(R+'index.html','utf8');{const L=html.split('\n');const a=L.findIndex(l=>l.startsWith('const NEWS=['));let b=a;while(!/^\];/.test(L[b]))b++;for(let i=a+1;i<b;i++)L[i]='';html=L.join('\n');}
let i=0;for(const m of html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g))doJS(m[1],'index#'+(i++));
htmlPieces(html.replace(/<script[\s\S]*?<\/script>/g,' ').replace(/<style[\s\S]*?<\/style>/g,' '),'index.html');
const arr=[...out.entries()].map(([k,s])=>({k,s}));
fs.writeFileSync('/home/claude/fr/x/all.json',JSON.stringify(arr,null,0));
console.log(arr.length);const by={};for(const a of arr)by[a.s.split('#')[0]]=(by[a.s.split('#')[0]]||0)+1;console.log(by);
