// TORQUE ONLINE – part of the Torque Guard bot (Cloudflare Worker + D1). v16-45
//   • profiles (name / icon / frame / title)      • live battle ranking per server (campaign · power · garage)
//   • world chat with automatic translation (Cloudflare Workers AI, free daily quota) + bad-word filter, report, admin delete/mute
//   • ARENA: async PvP against other players' defense teams (the fight is decided HERE, the game only plays the animation)
//   • TORQUE CUP: weekly knock-out tournament of the best 64 Arena players (rounds every 3 h, run by the cron)
// Rewards are only diamonds and tickets that are earned by playing – nothing here is sold (Play: "random items" = No).
// Every table is created by itself. The game calls POST /api/on/<op> with {pid, …}.

const DAY = 864e5, HOUR = 36e5;
const LEAGUES = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'LEGEND'];
// [points needed, league index, division]
const TIERS = [[0,0,'III'],[1050,0,'II'],[1100,0,'I'],[1150,1,'III'],[1250,1,'II'],[1350,1,'I'],[1450,2,'III'],[1540,2,'II'],[1630,2,'I'],
  [1720,3,'III'],[1820,3,'II'],[1920,3,'I'],[2020,4,'III'],[2140,4,'II'],[2260,4,'I'],[2400,5,'']];
export const tierOf = p => { let t = TIERS[0]; for (const x of TIERS) if (p >= x[0]) t = x; const i = TIERS.indexOf(t), nx = TIERS[i + 1];
  return {lg:t[1], div:t[2], name:LEAGUES[t[1]] + (t[2] ? ' ' + t[2] : ''), from:t[0], next:nx ? nx[0] : null}; };
const MIN_CV = 88;   // v16-88: minimum game version allowed online (see CV in online.js)
// v16-85: VIP level is computed HERE from the VIP points the anti-cheat bot already has (players.vip),
// never taken from the client (old app versions sent POINTS as the level → 'VIP 15' at stage 1-13).
const VIP_PTS = [0, 100, 1300, 2850, 4900, 7500, 10600, 14200, 18300, 22900, 28000];   // v16-122: VIP 1-10 (same as index.html)
const vipLvOf = pts => { let n = 0; for (let i = 1; i < VIP_PTS.length; i++) if ((pts | 0) >= VIP_PTS[i]) n = i; return n; };
const VIP_SQL = 'CASE ' + VIP_PTS.map((v, i) => [v, i]).reverse().map(([v, i]) => `WHEN pl.vip>=${v} THEN ${i}`).join(' ') + ' ELSE 0 END';
const START_PTS = 1000, ARENA_TK = 5, TK_EVERY = 2 * HOUR;
const ATK = p => ARENA_TK + Math.min(3, Math.floor(((p && p.vip) | 0) / 3));   // v16-122: VIP 3 / 6 / 9 = +1 Arena fight each
const DAILY = [[30,1],[50,1],[80,2],[120,2],[160,3],[220,4]];          // arena daily reward per league: [diamonds, recruit tickets]
// v16-60 WORLD BOSS: weekly damage ranking (week = Monday 00:00 UTC), rewards by mail for the top 100 – same table as WB_RANK in battle.js
// v16-99: TIME EVENTS (3 days each, 2 tracks at the same time) – the same schedule is in events.js
const EV_E0 = Date.UTC(2026, 10, 20), EV_DUR = 3 * DAY, EV_TRK = {A:['hero','gear','crew'], B:['ess','dia','wheel','key']};   // v16-120 KEY ROULETTE
const EV_CAP = {hero:30000, gear:30000, crew:30000, ess:1e15, dia:5e6, wheel:40, key:40};
const EV_RW = [[1,1,2000,20],[2,3,1500,15],[4,10,1000,10],[11,50,500,5],[51,100,250,3]];
const EV_TKK = {hero:'tk', gear:'gt', crew:'ct', ess:'tk', dia:'tk', wheel:null, key:null};
const EV_NAME = {hero:'Hero Summon Festival', gear:'Gear Summon Forge', crew:'Crew Summon Rally', ess:'Essence Rush', dia:'Diamond Spree', wheel:'Lucky Wheel', key:'Key Roulette'};
const evIdx = t => Math.floor((t - EV_E0) / EV_DUR), evKind = (tr, i) => EV_TRK[tr][((i % EV_TRK[tr].length) + EV_TRK[tr].length) % EV_TRK[tr].length];
const WB_RW = [[1,1,{dm:1500,tk:15,gt:10}],[2,3,{dm:1000,tk:10,gt:6}],[4,10,{dm:600,tk:6,gt:4}],[11,50,{dm:300,tk:3,gt:2}],[51,100,{dm:150,tk:2,gt:1}]];
const WB_DAY = 6;        // max hits per UTC day (3 keys per local day → up to 6 in one UTC day around midnight)
const WB_CAP = 60;       // one 60 s hit can be at most WB_CAP × team power (normal play: ~1-5 ×)
const SEASON_RW = [[150,3],[300,5],[500,8],[800,12],[1200,16],[2000,25]];
const CUP_RW = {1:{dm:2000,tk:50,t:'Champion'}, 2:{dm:1200,tk:30,t:'Final'}, 4:{dm:800,tk:20,t:'Semi-final'}, 8:{dm:500,tk:15,t:'Quarter-final'}, 16:{dm:300,gt:10,t:'Round of 16'}, 32:{dm:150,gt:5,t:'Round of 32'}, 64:{dm:80,gt:3,t:'Round of 64'}};
const BOTN = ['Rusty_Rick','GearGrinder','Lugnut_Lou','OilSlick','Sparky_88','TorqueTina','Wrenchy','PistonPete','Clutch_Kid','Turbo_Ted','NutBuster','RevLimit','BoltBaron','DieselDan','CamshaftCarl','Brake_Bea','Muffler_Max','HubcapHal','ChromeCleo','Axle_Ace'];
const HERO_IDS = [['m0_0','m0_1','m0_2','m0_3','m0_4','m0_5','m0_6','m0_7','m0_8','m0_9'],['m1_0','m1_1','m1_2','m1_3','m1_4','m1_5','m1_6'],['m2_0','m2_1','m2_2','m2_3','m2_4','m2_5','m2_6'],
  ['m3_0','m3_1','m3_2','m3_3','m3_4','m3_5','m3_6'],['m4_0','m4_1','m4_2','m4_3','m4_4','m4_5'],['m5_0','m5_1']];

// ------------------------------------------------------------------ bad words (masked in chat, refused in names)
// STEM = rude anywhere in a word ("fucking") · EXACT = only as a whole word (so "computer", "future", "habite", "populară" stay OK)
const STEM = ['fuck','shit','bitch','cunt','asshole','bastard','whore','slut','nigg','retard','porn','hitler','nazi',
  'pizda','coaie','labagiu','bulangiu','poponar','cacat','merde','putain','salope','connard','connasse','encule',
  'mierda','joder','cabron','pendejo','gilipollas','maricon','caralho','buceta','scheisse','arschloch','fotze','wichser','cazzo','stronzo','vaffanculo','kurwa','pierdol','siktir','orospu'];
const EXACT = ['fuk','fck','fucc','dick','pussy','fag','rape','sex','pula','muie','fut','futu','futut','curva','sugi','bite','nique','pute','puta','puto','porra','foder','viado','hure','troia','frocio','chuj','amk','bok','cono','coño','zboara'];
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[0@]/g, 'o').replace(/[1!|]/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5|\$/g, 's').replace(/7/g, 't');
const badWord = w => { const n = norm(w).replace(/[^a-z]/g, ''); return !!n && (STEM.some(b => n.includes(b)) || EXACT.includes(n)); };
// names: split "PutaGarage" / "puta_garage" / "puta77" into words first
const hasBad = s => String(s).replace(/([a-z])([A-Z])/g, '$1 $2').split(/[^\p{L}]+/u).some(badWord) || STEM.some(b => norm(s).replace(/[^a-z]/g, '').includes(b));
const maskBad = s => String(s).split(/(\s+)/).map(w => w.trim() && badWord(w) ? '*'.repeat(Math.min(8, w.length)) : w).join('');
const clean = s => String(s || '').replace(/[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩]/g, '').replace(/https?:\/\/\S+|www\.\S+/gi, '[link]').trim();

// ------------------------------------------------------------------ language: the phone language + a small guess from the words
const LANGS = ['en','ro','fr','es','pt','de','it','pl','tr','nl','ru','uk','ar','hi','id','ja','ko','zh','vi','th','hu','cs','el','sv'];
const STOP = {en:['the','and','you','is','my','how','what','to','it','i','in','of','for','this','with','are','can','do','beat','your'],
  ro:['si','și','eu','tu','nu','da','este','e','ce','cum','la','pe','cu','un','o','mersi','multumesc','merci','buna','sunt','vreau','acum','incerc','încerc'],
  fr:['le','la','les','et','est','je','tu','pas','oui','une','des','pour','que','avec','sur','merci','bonjour','qui','ce'],
  es:['el','la','los','las','y','es','yo','que','de','no','si','sí','por','con','una','gracias','hola','como','para'],
  pt:['o','a','os','e','é','eu','você','voce','que','não','nao','sim','obrigado','com','uma','para','de'],
  de:['der','die','das','und','ist','ich','du','nicht','ja','ein','eine','mit','danke','wie','zu'],
  it:['il','lo','la','e','è','io','tu','non','si','che','di','un','una','grazie','ciao','come','per']};
function guessLang(txt, dev) {
  const w = String(txt).toLowerCase().split(/[^\p{L}]+/u).filter(Boolean); if (w.length < 2) return dev;
  let best = dev, bs = 0; for (const l in STOP) { const n = w.filter(x => STOP[l].includes(x)).length; if (n > bs) { bs = n; best = l; } }
  return bs >= 1 && (best === dev || bs >= 2) ? best : dev;
}
async function translate(env, text, from, to) {
  if (!env.AI || from === to) return null;
  try { const r = await env.AI.run('@cf/meta/m2m100-1.2b', {text, source_lang:from, target_lang:to}); const t = r && (r.translated_text || r.response);
    return t && t.trim() && t.trim().toLowerCase() !== String(text).trim().toLowerCase() ? t.trim().slice(0, 400) : '='; }
  catch (e) { return null; }        // quota used up / AI down → not cached, tried again later
}

// ------------------------------------------------------------------ tables
let ready = false;
async function ensure(env) {
  if (ready) return; const db = env.DB;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS prof(uid INTEGER PRIMARY KEY AUTOINCREMENT, pid TEXT UNIQUE, srv INTEGER, name TEXT, nlow TEXT, icon TEXT, frame INTEGER DEFAULT 0,
      title TEXT DEFAULT 'rook', cc TEXT, lang TEXT, vip INTEGER DEFAULT 0, rep INTEGER DEFAULT 0, best INTEGER DEFAULT 0, bday TEXT, bd0 INTEGER DEFAULT 0, pow INTEGER DEFAULT 0,
      lv INTEGER DEFAULT 0, team TEXT, t INTEGER, created INTEGER, chg INTEGER DEFAULT 0, nmsg INTEGER DEFAULT 0, lastmsg INTEGER DEFAULT 0, mute INTEGER DEFAULT 0, unl TEXT DEFAULT '', cunl TEXT DEFAULT '', cupw INTEGER DEFAULT 0)`),
    db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS prof_name ON prof(srv, nlow)'),
    db.prepare('CREATE INDEX IF NOT EXISTS prof_best ON prof(srv, best)'),
    db.prepare('CREATE INDEX IF NOT EXISTS prof_pow ON prof(srv, pow)'),
    db.prepare(`CREATE TABLE IF NOT EXISTS chat(id INTEGER PRIMARY KEY AUTOINCREMENT, srv INTEGER, ch TEXT, uid INTEGER, t INTEGER, txt TEXT, lang TEXT, tr TEXT DEFAULT '{}', hid INTEGER DEFAULT 0, rep INTEGER DEFAULT 0, sys INTEGER DEFAULT 0)`),
    db.prepare('CREATE INDEX IF NOT EXISTS chat_srv ON chat(srv, ch, id)'),
    db.prepare('CREATE TABLE IF NOT EXISTS creps(mid INTEGER, uid INTEGER, t INTEGER, PRIMARY KEY(mid, uid))'),
    db.prepare(`CREATE TABLE IF NOT EXISTS arena(uid INTEGER PRIMARY KEY, srv INTEGER, season INTEGER, pts INTEGER, w INTEGER DEFAULT 0, l INTEGER DEFAULT 0, tk INTEGER, tkt INTEGER, opp TEXT, peak INTEGER, t INTEGER, rday TEXT DEFAULT '')`),
    db.prepare('CREATE INDEX IF NOT EXISTS arena_pts ON arena(srv, season, pts)'),
    db.prepare(`CREATE TABLE IF NOT EXISTS ahist(id INTEGER PRIMARY KEY AUTOINCREMENT, srv INTEGER, t INTEGER, kind TEXT, a INTEGER, d INTEGER, an TEXT, dn TEXT, win INTEGER, da INTEGER, dd INTEGER, seed INTEGER, ta TEXT, td TEXT)`),
    db.prepare('CREATE INDEX IF NOT EXISTS ahist_a ON ahist(a, id)'), db.prepare('CREATE INDEX IF NOT EXISTS ahist_d ON ahist(d, id)'),
    db.prepare('CREATE TABLE IF NOT EXISTS inbox(id INTEGER PRIMARY KEY AUTOINCREMENT, uid INTEGER, t INTEGER, ic TEXT, title TEXT, body TEXT, rw TEXT, got INTEGER DEFAULT 0)'),
    db.prepare('CREATE INDEX IF NOT EXISTS inbox_uid ON inbox(uid, got)'),
    db.prepare('CREATE TABLE IF NOT EXISTS cup(srv INTEGER, wk TEXT, data TEXT, PRIMARY KEY(srv, wk))'),
    db.prepare('CREATE TABLE IF NOT EXISTS kv(k TEXT PRIMARY KEY, v TEXT)'),
    db.prepare('CREATE TABLE IF NOT EXISTS wboss(uid INTEGER, wk TEXT, srv INTEGER, dmg INTEGER DEFAULT 0, best INTEGER DEFAULT 0, hits INTEGER DEFAULT 0, day TEXT, nday INTEGER DEFAULT 0, t INTEGER, PRIMARY KEY(uid, wk))'),
    db.prepare('CREATE INDEX IF NOT EXISTS wboss_rank ON wboss(srv, wk, dmg)'),
    db.prepare('CREATE TABLE IF NOT EXISTS evt(uid INTEGER, eid TEXT, srv INTEGER, sc INTEGER DEFAULT 0, t INTEGER, PRIMARY KEY(uid, eid))'),
    db.prepare('CREATE INDEX IF NOT EXISTS evt_rank ON evt(eid, srv, sc)'),
  ]);
  try { await db.prepare('ALTER TABLE prof ADD COLUMN hv INTEGER DEFAULT 0').run(); } catch (e) {}   // v16-122: HIDE VIP (others do not see the VIP level)
  ready = true;
}
const kvGet = async (env, k) => { const r = await env.DB.prepare('SELECT v FROM kv WHERE k=?').bind(k).first(); return r ? r.v : null; };
const kvSet = (env, k, v) => env.DB.prepare('INSERT INTO kv(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v').bind(k, String(v)).run();

// weeks start Monday 00:00 UTC. Arena season = 1 week. Cup: qualification Friday 21:00 UTC, round 1 Saturday 09:00 UTC, then every 3 h.
const weekStart = t => { const d = new Date(t); d.setUTCHours(0, 0, 0, 0); const wd = (d.getUTCDay() + 6) % 7; return d.getTime() - wd * DAY; };
const seasonOf = t => Math.floor((weekStart(t) - Date.UTC(2026, 10, 9)) / (7 * DAY)) + 1;   // season 1 = week of Mon 9 Nov 2026
const dayKey = t => new Date(t).toISOString().slice(0, 10);
const CUP_Q = 4 * DAY + 21 * HOUR, CUP_R1 = 5 * DAY + 9 * HOUR, CUP_STEP = 3 * HOUR;

// ------------------------------------------------------------------ helpers
const num = (v, lo, hi) => { v = +v; return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : lo; };
const ROLES = ['engine','tuning','inspect','service','paint','elec','all','crew'];
function cleanTeam(t) {
  if (!Array.isArray(t)) return [];
  return t.slice(0, 5).map(u => ({id:String(u.id || '').replace(/[^a-z0-9_]/g, '').slice(0, 12), n:clean(u.n).slice(0, 24), gr:num(u.gr, 0, 5) | 0, s:num(u.s, 0, 50) | 0,
    role:ROLES.includes(u.role) ? u.role : 'crew', hp:num(u.hp, 1, 5e7), atk:num(u.atk, 1, 5e6), def:num(u.def, 0, 5e4), as:num(u.as, .25, 3), crit:num(u.crit, 0, .75),
    rng:num(u.rng, 20, 300), eg:num(u.eg, 1, 3)})).filter(u => u.id);
}
const teamPow = t => Math.round(t.reduce((a, s) => a + s.hp * .25 + s.atk * 6 * (1 / s.as) + s.def * 4, 0));
const pubTeam = t => (t || []).map(u => ({id:u.id, n:u.n, gr:u.gr, s:u.s, role:u.role, hp:Math.round(u.hp)}));
function ccOf(lang) {
  const m = String(lang || '').match(/^([a-z]{2,3})(?:[-_]([A-Za-z]{2}))?/); if (!m) return '';
  if (m[2]) return m[2].toUpperCase();
  return ({en:'GB',ro:'RO',fr:'FR',es:'ES',pt:'PT',de:'DE',it:'IT',pl:'PL',tr:'TR',nl:'NL',ru:'RU',uk:'UA',ja:'JP',ko:'KR',zh:'CN',hu:'HU',cs:'CZ',el:'GR',sv:'SE',vi:'VN',th:'TH',id:'ID',hi:'IN',ar:'SA'})[m[1]] || '';
}
const langOf = l => { const x = String(l || 'en').slice(0, 2).toLowerCase(); return LANGS.includes(x) ? x : 'en'; };
function pub(p, extra) {
  return {uid:p.uid, name:p.name, icon:p.icon, frame:p.frame | 0, title:p.title || 'rook', cc:p.cc || '', vip:p.hv ? -1 : p.vip | 0, best:p.best | 0, pow:p.pow | 0, lv:p.lv | 0, today:Math.max(0, (p.best | 0) - (p.bday === dayKey(Date.now()) ? p.bd0 | 0 : p.best | 0)), cupw:p.cupw | 0, ...extra};
}
const isTst = pid => String(pid || '').startsWith('tst_');   // v16-91: owner's FULL TEST ACCOUNT (hidden from rankings)
async function profOf(env, pid) { return pid && typeof pid === 'string' ? env.DB.prepare('SELECT * FROM prof WHERE pid=?').bind(pid.slice(0, 64)).first() : null; }
async function isBanned(env, pid) { const r = await env.DB.prepare('SELECT banned FROM players WHERE pid=?').bind(pid).first(); return !!(r && r.banned); }
const unlocks = p => new Set([...(p.unl || '').split(','), ...(p.cunl || '').split(','), ...((p.vip | 0) >= 5 ? ['vip5'] : []), ...((p.vip | 0) >= 10 ? ['vip10'] : [])].filter(Boolean));   // v16-122: VIP titles
async function addUnl(env, uid, k) { const p = await env.DB.prepare('SELECT unl FROM prof WHERE uid=?').bind(uid).first(); if (!p) return;
  const s = new Set((p.unl || '').split(',').filter(Boolean)); if (s.has(k)) return; s.add(k); await env.DB.prepare('UPDATE prof SET unl=? WHERE uid=?').bind([...s].join(','), uid).run(); }
async function mail(env, uid, ic, title, body, rw) { if (uid > 0) await env.DB.prepare('INSERT INTO inbox(uid,t,ic,title,body,rw) VALUES(?,?,?,?,?,?)').bind(uid, Date.now(), ic, title, body, JSON.stringify(rw || {})).run(); }
async function sysMsg(env, srv, txt) { await env.DB.prepare('INSERT INTO chat(srv,ch,uid,t,txt,lang,sys) VALUES(?,?,0,?,?,?,1)').bind(srv, 'w', Date.now(), txt, 'en').run(); }
// frames: 0 free · 1 Rep 5 · 2 VIP 3 · 3 Arena GOLD · 4 VIP 7 or Arena DIAMOND · 5 Arena LEGEND or a Cup win
function frameOk(p, f) { const u = unlocks(p); return f === 0 || (f === 1 && (p.rep >= 5 || u.has('f1'))) || (f === 2 && p.vip >= 3) || (f === 3 && u.has('glad')) || (f === 4 && (p.vip >= 7 || u.has('dia'))) || (f === 5 && (u.has('leg') || u.has('cup'))) || (f === 7 && u.has('fdr')); }   // v16-122: 7 = FOUNDER (Founder Pass)
const TITLES = ['rook','wr','boss','gear','speed','chat','glad','leg','cup','king','fdr','vip5','vip10'];   // v16-122: + FOUNDER (was missing here) + VIP STAR / VIP LEGEND
function titleOk(p, k) { return k === 'rook' || unlocks(p).has(k); }

// ------------------------------------------------------------------ ARENA FIGHT (decided by the server, seeded → the same fight can be replayed)
function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
export function arenaSim(ta, td, seed) {
  const R = rng(seed), U = [], log = [];
  const mk = (s, side, i) => ({i:U.length, side, slot:i, ...s, mhp:s.hp, hp:s.hp, en:R() * 30, cd:.3 + R() * s.as, stun:0, mark:0, slow:0, buff:0, shield:0, dead:false});
  ta.forEach((s, i) => U.push(mk(s, 0, i))); td.forEach((s, i) => U.push(mk(s, 1, i)));
  const alive = side => U.filter(u => !u.dead && u.side === side);
  const melee = u => u.rng < 80;
  const pick = (u) => { const e = alive(1 - u.side); if (!e.length) return null; const fr = e.filter(melee);
    if (melee(u)) return (fr.length ? fr : e).reduce((a, b) => a.hp < b.hp && R() < .5 ? a : b);
    return R() < .6 ? e.reduce((a, b) => a.hp / a.mhp < b.hp / b.mhp ? a : b) : e[Math.floor(R() * e.length)]; };
  const dmg = (src, tgt, mult, crit) => { let a = 1.7 * src.atk * mult * (src.buff > 0 ? 1.3 : 1) * (.9 + R() * .2);   // ×1.7: arena fights last ~15-30 s a *= 100 / (100 + tgt.def * 3); if (tgt.mark > 0) a *= 1.35;
    const c = crit || R() < src.crit; if (c) a *= 1.8; a = Math.max(1, Math.round(a)); let left = a;
    if (tgt.shield > 0) { const s = Math.min(tgt.shield, left); tgt.shield -= s; left -= s; }
    tgt.hp -= left; tgt.en = Math.min(100, tgt.en + 10); let ko = 0; if (tgt.hp <= 0) { tgt.hp = 0; tgt.dead = true; ko = 1; } return [tgt.i, a, c ? 1 : 0, ko]; };
  let t = 0; const T_MAX = 75, DT = .1;
  while (t < T_MAX && alive(0).length && alive(1).length) {
    t = Math.round((t + DT) * 10) / 10;
    for (const u of U) { if (u.dead) continue;
      for (const k of ['stun','mark','slow','buff']) if (u[k] > 0) u[k] = Math.max(0, u[k] - DT);
      if (u.stun > 0) continue; u.cd -= DT * (u.slow > 0 ? .6 : 1); if (u.cd > 0) continue;
      const e = alive(1 - u.side); if (!e.length) break;
      if (u.en >= 100) {                      // ---------- SKILL (one per role, like the campaign)
        u.en = 0; u.cd = u.as * 1.2; const ev = {t, a:u.i, k:'sk', r:u.role, h:[]};
        if (u.role === 'service') { const al = alive(u.side); al.forEach(o => { const v = Math.round(o.mhp * .32); o.hp = Math.min(o.mhp, o.hp + v); ev.h.push([o.i, -v, 0, 0]); }); }
        else if (u.role === 'engine') { const tg = pick(u); if (tg) { ev.h.push(dmg(u, tg, 2.2)); tg.stun = 1.2; } u.shield = Math.round(u.mhp * .15); }
        else if (u.role === 'tuning') { const tg = pick(u); if (tg) ev.h.push(dmg(u, tg, 2.6, true)); }
        else if (u.role === 'inspect') { e.forEach(o => { ev.h.push(dmg(u, o, 1.2)); o.mark = 7; }); }
        else if (u.role === 'paint') { e.slice().sort(() => R() - .5).slice(0, 3).forEach(o => { ev.h.push(dmg(u, o, 1.8)); o.slow = 4; }); }
        else if (u.role === 'elec') { for (let j = 0; j < 4; j++) { const l = alive(1 - u.side); if (!l.length) break; const o = l[Math.floor(R() * l.length)]; ev.h.push(dmg(u, o, 1.1)); o.stun = Math.max(o.stun, .8); } }
        else if (u.role === 'all') { e.forEach(o => ev.h.push(dmg(u, o, 1.6))); alive(u.side).forEach(o => o.buff = 6); }
        else { const tg = pick(u); if (tg) ev.h.push(dmg(u, tg, 2.5)); }
        log.push(ev); continue;
      }
      const tg = pick(u); if (!tg) continue;                  // ---------- normal attack
      u.cd = u.as; u.en = Math.min(100, u.en + 25 * u.eg);
      const h = dmg(u, tg, 1); log.push({t, a:u.i, k:melee(u) ? 'm' : 'r', h:[h]});
    }
  }
  const win = alive(0).length > 0 && alive(1).length === 0 ? 1 : 0;   // time out = the defender wins
  return {win, log, dur:t, left:U.map(u => Math.round(u.hp / u.mhp * 100))};
}
function botTeam(ref, k, R) {
  const pool = ref.length ? ref : [{role:'engine',gr:1,s:0,hp:1500,atk:70,def:30,as:1.15,crit:.08,rng:34,eg:1}];
  return pool.map(u => { const gr = Math.max(0, Math.min(5, u.gr + (R() < .25 ? 1 : R() < .3 ? -1 : 0))), ids = HERO_IDS[gr];
    return {...u, id:ids[Math.floor(R() * ids.length)], n:'', gr, hp:Math.round(u.hp * k), atk:u.atk * k, def:u.def * (.9 + R() * .2)}; });
}
function botOf(key, me) {      // a training rival (marked "AI" in the game) – used while there are not enough real players
  const sd = [...key].reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0, R = rng(sd);
  const k = .72 + R() * .42, team = botTeam(me.team, k, R);
  return {uid:-(sd % 1e6) - 1, bot:1, key, name:BOTN[sd % BOTN.length], icon:team[0] ? team[0].id : 'm0_0', frame:Math.min(5, Math.floor(R() * 3)), title:'rook', cc:'',
    pts:Math.max(800, me.pts + Math.round((R() - .5) * 160)), pow:teamPow(team), team};
}

// ------------------------------------------------------------------ arena state
async function arenaRow(env, p) {
  const db = env.DB, now = Date.now(), season = seasonOf(now);
  let a = await db.prepare('SELECT * FROM arena WHERE uid=?').bind(p.uid).first();
  if (!a) { a = {uid:p.uid, srv:p.srv, season, pts:START_PTS, w:0, l:0, tk:ARENA_TK, tkt:now, opp:'[]', peak:START_PTS, t:0, rday:''};
    await db.prepare('INSERT INTO arena(uid,srv,season,pts,w,l,tk,tkt,opp,peak,t) VALUES(?,?,?,?,0,0,?,?,?,?,0)').bind(p.uid, p.srv, season, START_PTS, ARENA_TK, now, '[]', START_PTS).run(); }
  if (a.season !== season) { a.pts = START_PTS + Math.round((a.pts - START_PTS) * .5); a.season = season; a.w = 0; a.l = 0; }
  const AM = ATK(p); if (a.tk < AM) { const n = Math.floor((now - a.tkt) / TK_EVERY); if (n > 0) { a.tk = Math.min(AM, a.tk + n); a.tkt = a.tk >= AM ? now : a.tkt + n * TK_EVERY; } } else a.tkt = now;
  return a;
}
const saveArena = (env, a) => env.DB.prepare('UPDATE arena SET season=?, pts=?, w=?, l=?, tk=?, tkt=?, opp=?, peak=?, t=?, srv=? WHERE uid=?').bind(a.season, a.pts, a.w, a.l, a.tk, a.tkt, a.opp, a.peak, a.t, a.srv, a.uid).run();
async function findOpp(env, p, a) {
  const db = env.DB, season = a.season, me = {pts:a.pts, team:JSON.parse(p.team || '[]')};
  const rows = (await db.prepare(`SELECT a.uid, a.pts, p.name, p.icon, p.frame, p.title, p.cc, p.pow, p.team FROM arena a JOIN prof p ON p.uid=a.uid LEFT JOIN players pl ON pl.pid=p.pid
     WHERE a.srv=? AND a.season=? AND a.uid<>? AND p.team IS NOT NULL AND p.team<>'[]' AND COALESCE(pl.banned,0)=0 AND substr(p.pid,1,4)<>'tst_' AND a.pts BETWEEN ? AND ? ORDER BY RANDOM() LIMIT 12`)
    .bind(p.srv, season, p.uid, a.pts - 250, a.pts + 300).all()).results;
  const hi = rows.filter(r => r.pts > a.pts + 20), mid = rows.filter(r => Math.abs(r.pts - a.pts) <= 60), lo = rows.filter(r => r.pts < a.pts - 20);
  const out = [], used = new Set();
  for (const g of [hi, mid, lo, rows]) { const r = g.find(x => !used.has(x.uid)); if (r && out.length < 3) { used.add(r.uid); out.push({uid:r.uid}); } }
  let k = 0; while (out.length < 3) out.push({bot:'b' + p.uid + ':' + Date.now().toString(36) + ':' + (k++)});
  return out;
}
async function oppView(env, p, a) {
  const list = JSON.parse(a.opp || '[]'), out = [];
  for (const o of list) {
    if (o.bot) { const b = botOf(o.bot, {pts:a.pts, team:JSON.parse(p.team || '[]')}); out.push({key:o.bot, bot:1, name:b.name, icon:b.icon, frame:b.frame, title:'rook', cc:'', pts:b.pts, pow:b.pow, team:pubTeam(b.team), tier:tierOf(b.pts)}); continue; }
    const r = await env.DB.prepare('SELECT p.uid,p.name,p.icon,p.frame,p.title,p.cc,p.pow,p.team,a.pts FROM prof p JOIN arena a ON a.uid=p.uid WHERE p.uid=?').bind(o.uid).first();
    if (r) out.push({key:'u' + r.uid, uid:r.uid, name:r.name, icon:r.icon, frame:r.frame, title:r.title, cc:r.cc, pts:r.pts, pow:r.pow, team:pubTeam(JSON.parse(r.team || '[]')), tier:tierOf(r.pts)});
  }
  return out;
}
const gain = (pa, pd) => { const E = 1 / (1 + Math.pow(10, (pd - pa) / 400)); return {w:Math.max(6, Math.round(32 * (1 - E)) + 4), l:Math.max(4, Math.round(32 * E * .6))}; };
async function arenaView(env, p) {
  const a = await arenaRow(env, p);
  if (!JSON.parse(a.opp || '[]').length) { a.opp = JSON.stringify(await findOpp(env, p, a)); }
  await saveArena(env, a);
  const rank = (await env.DB.prepare('SELECT COUNT(*) n FROM arena WHERE srv=? AND season=? AND pts>?').bind(p.srv, a.season, a.pts).first()).n + 1;
  const end = weekStart(Date.now()) + 7 * DAY;
  return {pts:a.pts, w:a.w, l:a.l, tk:a.tk, tkMax:ATK(p), tkNext:a.tk < ATK(p) ? a.tkt + TK_EVERY : 0, rank, tier:tierOf(a.pts), peak:tierOf(a.peak || a.pts), season:a.season, end,
    opp:await oppView(env, p, a), daily:DAILY.map((d, i) => ({lg:LEAGUES[i], dm:d[0], tk:d[1]})), leagues:TIERS.map(x => ({p:x[0], name:LEAGUES[x[1]] + (x[2] ? ' ' + x[2] : ''), lg:x[1]}))};
}
async function fight(env, p, b) {
  const db = env.DB, a = await arenaRow(env, p), list = JSON.parse(a.opp || '[]'), key = String(b.key || '');
  const o = list.find(x => (x.bot && x.bot === key) || ('u' + x.uid) === key); if (!o) return {err:'old_opponents'};
  if (a.tk <= 0) return {err:'no_tickets'};
  const ta = JSON.parse(p.team || '[]'); if (!ta.length) return {err:'no_team'};
  let dp, td, dpts, dname;
  if (o.bot) { const bo = botOf(o.bot, {pts:a.pts, team:ta}); td = bo.team; dpts = bo.pts; dname = bo.name; dp = {uid:0, name:bo.name, icon:bo.icon, frame:bo.frame, title:'rook', cc:'', pow:bo.pow, bot:1}; }
  else { const r = await db.prepare('SELECT p.*, a.pts apts FROM prof p JOIN arena a ON a.uid=p.uid WHERE p.uid=?').bind(o.uid).first(); if (!r) return {err:'old_opponents'};
    td = JSON.parse(r.team || '[]'); dpts = r.apts; dname = r.name; dp = pub(r); }
  const seed = (Math.random() * 4294967295) >>> 0, res = arenaSim(ta, td, seed), g = gain(a.pts, dpts);
  const da = res.win ? g.w : -g.l, dd = (o.bot || isTst(p.pid)) ? 0 : (res.win ? -Math.round(g.w * .5) : 3);   // v16-91: the owner's test account never changes real players
  a.tk -= 1; if (a.tk === ATK(p) - 1) a.tkt = Date.now(); a.pts = Math.max(0, a.pts + da); a.peak = Math.max(a.peak || 0, a.pts); if (res.win) a.w++; else a.l++; a.t = Date.now();
  a.opp = JSON.stringify(await findOpp(env, p, a)); await saveArena(env, a);
  if (!o.bot) await db.prepare('UPDATE arena SET pts=MAX(0,pts+?), peak=MAX(peak,pts+?) WHERE uid=?').bind(dd, dd, o.uid).run();
  const hid = (await db.prepare('INSERT INTO ahist(srv,t,kind,a,d,an,dn,win,da,dd,seed,ta,td) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id')
    .bind(p.srv, Date.now(), 'arena', p.uid, o.bot ? 0 : o.uid, p.name, dname, res.win, da, dd, seed, JSON.stringify(ta), JSON.stringify(td)).first()).id;
  // titles / frames from the league reached
  const tr = tierOf(a.peak); if (tr.lg >= 2) await addUnl(env, p.uid, 'glad'); if (tr.lg >= 4) await addUnl(env, p.uid, 'dia'); if (tr.lg >= 5) await addUnl(env, p.uid, 'leg');
  const before = tierOf(a.pts - da).lg; if (!isTst(p.pid) && tr.lg > before && tierOf(a.pts).lg >= 3) await sysMsg(env, p.srv, `⚔️ ${p.name} climbed to ${LEAGUES[tierOf(a.pts).lg]} in the Arena!`);
  const rw = res.win ? {dm:20, tk:1} : {dm:5};
  return {ok:true, id:hid, win:res.win, log:res.log, dur:res.dur, ta:pubTeam(ta), td:pubTeam(td), me:pub(p), them:dp, da, pts:a.pts, tier:tierOf(a.pts), tk:a.tk, rw};
}
async function replay(env, id) {
  const h = await env.DB.prepare('SELECT * FROM ahist WHERE id=?').bind(id | 0).first(); if (!h) return {err:'not found'};
  const ta = JSON.parse(h.ta), td = JSON.parse(h.td), res = arenaSim(ta, td, h.seed);
  const pa = h.a > 0 ? await env.DB.prepare('SELECT * FROM prof WHERE uid=?').bind(h.a).first() : null, pd = h.d > 0 ? await env.DB.prepare('SELECT * FROM prof WHERE uid=?').bind(h.d).first() : null;
  return {ok:true, id:h.id, kind:h.kind, win:res.win, log:res.log, dur:res.dur, ta:pubTeam(ta), td:pubTeam(td), me:pa ? pub(pa) : {name:h.an, icon:ta[0] && ta[0].id, frame:0}, them:pd ? pub(pd) : {name:h.dn, icon:td[0] && td[0].id, frame:0, bot:1}, da:h.da};
}

// ------------------------------------------------------------------ CUP (weekly knock-out)
const nextPow2 = n => { let k = 1; while (k < n) k *= 2; return k; };
function seedOrder(n) { let o = [0]; while (o.length < n) { const m = o.length * 2; o = o.flatMap(x => [x, m - 1 - x]); } return o; }
async function cupTick(env) {
  const now = env.TEST_NOW ? +env.TEST_NOW : Date.now(), ws = weekStart(now), wk = dayKey(ws), db = env.DB;
  const srvs = (await db.prepare('SELECT DISTINCT srv FROM arena').all()).results.map(r => r.srv);
  for (const srv of srvs) {
    let c = await db.prepare('SELECT data FROM cup WHERE srv=? AND wk=?').bind(srv, wk).first(); let d = c ? JSON.parse(c.data) : null;
    if (!d && now >= ws + CUP_Q) {                       // qualification: the best 64 of the Arena (played in the last 3 days)
      const season = seasonOf(now);
      const rows = (await db.prepare(`SELECT a.uid, a.pts, p.name, p.icon, p.frame, p.pow FROM arena a JOIN prof p ON p.uid=a.uid LEFT JOIN players pl ON pl.pid=p.pid
        WHERE a.srv=? AND a.season=? AND (a.t>? OR p.t>?) AND p.team IS NOT NULL AND p.team<>'[]' AND COALESCE(pl.banned,0)=0 AND substr(p.pid,1,4)<>'tst_' ORDER BY a.pts DESC LIMIT 64`).bind(srv, season, now - 3 * DAY, now - 3 * DAY).all()).results;
      if (!rows.length) continue;
      const n = Math.min(64, nextPow2(Math.max(8, rows.length))), P = rows.map(r => ({uid:r.uid, name:r.name, icon:r.icon, frame:r.frame, pow:r.pow, pts:r.pts}));
      let k = 0; while (P.length < n) { const ref = rows[Math.min(rows.length - 1, P.length - rows.length + Math.floor(rows.length / 2))] || rows[0];
        const b = botOf('cup' + wk + srv + (k++), {pts:ref.pts - 40, team:JSON.parse((await db.prepare('SELECT team FROM prof WHERE uid=?').bind(ref.uid).first()).team || '[]')});
        P.push({uid:0, bot:b.key, name:b.name, icon:b.icon, frame:b.frame, pow:b.pow, pts:b.pts, team:b.team}); }
      const ord = seedOrder(n), first = []; for (let i = 0; i < n; i += 2) first.push({a:ord[i], b:ord[i + 1], w:-1, f:0});
      d = {n, P, R:[first], round:0, next:ws + CUP_R1, done:0}; for (const p of P) if (p.uid) await mail(env, p.uid, '🏟️', 'You are in the Torque Cup!', `You qualified for Weekend Cup #${seasonOf(now)} (${n} players). Round 1 starts Saturday. Your battle team fights for you – make it strong!`, {});
      await sysMsg(env, srv, `🏟️ Weekend Cup #${seasonOf(now)}: ${n} players qualified. Round 1 starts Saturday!`);
    }
    if (d && !d.done && now >= d.next) {                  // play the current round
      const cur = d.R[d.round], nxt = [];
      for (const m of cur) {
        const A = d.P[m.a], B = d.P[m.b];
        const team = async x => x.uid ? JSON.parse(((await db.prepare('SELECT team FROM prof WHERE uid=?').bind(x.uid).first()) || {team:'[]'}).team || '[]') : (x.team || []);
        const ta = await team(A), tb = await team(B);
        let win;
        if (!ta.length) win = 0; else if (!tb.length) win = 1;
        else { const seed = (Math.random() * 4294967295) >>> 0, r = arenaSim(ta, tb, seed); win = r.win;
          m.f = (await db.prepare('INSERT INTO ahist(srv,t,kind,a,d,an,dn,win,da,dd,seed,ta,td) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id')
            .bind(srv, now, 'cup', A.uid, B.uid, A.name, B.name, win, 0, 0, seed, JSON.stringify(ta), JSON.stringify(tb)).first()).id; }
        m.w = win ? m.a : m.b; const loser = win ? B : A;
        if (loser.uid) { const place = cur.length * 2; const rw = CUP_RW[place] || CUP_RW[64];
          await mail(env, loser.uid, '🏟️', 'Torque Cup – ' + rw.t, `Your Cup ends in the ${rw.t}. Well played! Here are your rewards.`, {dm:rw.dm, tk:rw.tk, gt:rw.gt}); }
      }
      for (let i = 0; i < cur.length; i += 2) if (cur[i + 1]) nxt.push({a:cur[i].w, b:cur[i + 1].w, w:-1, f:0});
      if (cur.length === 1) { d.done = 1; d.champ = cur[0].w; const C = d.P[d.champ];
        if (C.uid) { const rw = CUP_RW[1]; await mail(env, C.uid, '🏆', 'CUP CHAMPION!', 'You won the Torque Cup! The CUP CHAMPION title and the Mythic frame are yours.', {dm:rw.dm, tk:rw.tk});
          await addUnl(env, C.uid, 'cup'); await db.prepare('UPDATE prof SET cupw=cupw+1 WHERE uid=?').bind(C.uid).run(); }
        await sysMsg(env, srv, `🏆 ${C.name} won the Weekend Cup #${seasonOf(now)}!`); }
      else { d.R.push(nxt); d.round++; d.next = d.next + CUP_STEP; }
    }
    if (d) await db.prepare('INSERT INTO cup(srv,wk,data) VALUES(?,?,?) ON CONFLICT(srv,wk) DO UPDATE SET data=excluded.data').bind(srv, wk, JSON.stringify(d)).run();
  }
}
async function cupView(env, p) {
  const now = env.TEST_NOW ? +env.TEST_NOW : Date.now(), ws = weekStart(now), wk = dayKey(ws);
  let c = await env.DB.prepare('SELECT data FROM cup WHERE srv=? AND wk=?').bind(p.srv, wk).first();
  if (!c) { const prev = await env.DB.prepare('SELECT data, wk FROM cup WHERE srv=? AND wk<? ORDER BY wk DESC LIMIT 1').bind(p.srv, wk).first();
    return {state:'wait', qual:ws + CUP_Q, r1:ws + CUP_R1, step:CUP_STEP, num:seasonOf(now), last:prev ? slim(JSON.parse(prev.data), p.uid) : null, rw:CUP_RW}; }
  return {state:'on', num:seasonOf(now), step:CUP_STEP, ...slim(JSON.parse(c.data), p.uid), rw:CUP_RW, nextWeek:ws + 7 * DAY + CUP_Q};
}
const slim = (d, uid) => ({n:d.n, P:d.P.map(x => ({uid:x.uid, bot:x.bot ? 1 : 0, name:x.name, icon:x.icon, frame:x.frame, pow:x.pow})), R:d.R, round:d.round, next:d.next, done:d.done, champ:d.champ, me:d.P.findIndex(x => x.uid === uid)});

// ------------------------------------------------------------------ daily / season rewards (cron)
async function rewardsTick(env) {
  const db = env.DB, now = env.TEST_NOW ? +env.TEST_NOW : Date.now(), dk = dayKey(now), h = new Date(now).getUTCHours();
  if (h >= 21 && (await kvGet(env, 'daily')) !== dk) {             // 21:00 UTC = 22:00 Paris
    await kvSet(env, 'daily', dk); const season = seasonOf(now);
    const rows = (await db.prepare('SELECT uid, pts FROM arena WHERE season=? AND t>?').bind(season, now - 2 * DAY).all()).results;
    for (const r of rows) { const lg = tierOf(r.pts).lg, [dm, tk] = DAILY[lg]; await mail(env, r.uid, '⚔️', 'Arena daily reward', `Your league today: ${tierOf(r.pts).name}.`, {dm, tk}); }
  }
  const season = seasonOf(now), last = +(await kvGet(env, 'season') || 0);
  if (last && last < season) {                                      // the week is over: season rewards + soft reset happens when each player comes back
    const rows = (await db.prepare('SELECT uid, pts, peak FROM arena WHERE season=? AND t>?').bind(last, now - 9 * DAY).all()).results;
    for (const r of rows) { const lg = tierOf(r.pts).lg, [dm, tk] = SEASON_RW[lg]; await mail(env, r.uid, '🏅', `Arena season ${last} ended`, `Final league: ${tierOf(r.pts).name}. A new season has started – your points were partly reset.`, {dm, tk}); }
    await db.prepare('UPDATE arena SET peak=pts').run();
  }
  if (last !== season) await kvSet(env, 'season', season);
  // WORLD BOSS: the week is over → mail the top 100 of each server
  const wk = dayKey(weekStart(now)), wlast = await kvGet(env, 'wbwk');
  if (wlast && wlast !== wk) {
    const rows = (await db.prepare('SELECT w.uid, w.srv, w.dmg FROM wboss w LEFT JOIN prof p ON p.uid=w.uid LEFT JOIN players pl ON pl.pid=p.pid WHERE w.wk=? AND COALESCE(pl.banned,0)=0 AND substr(p.pid,1,4)<>\'tst_\' ORDER BY w.srv, w.dmg DESC').bind(wlast).all()).results;
    let srv = -1, n = 0;
    for (const r of rows) { if (r.srv !== srv) { srv = r.srv; n = 0; } n++; if (n > 100) continue;
      const t = WB_RW.find(q => n >= q[0] && n <= q[1]); if (t) await mail(env, r.uid, '👹', 'World Boss – weekly ranking', `Your rank last week: #${n} (damage ${r.dmg.toLocaleString('en-US')}).`, t[2]); }
    await db.prepare('DELETE FROM wboss WHERE wk<?').bind(dayKey(weekStart(now) - 21 * DAY)).run();
  }
  if (wlast !== wk) await kvSet(env, 'wbwk', wk);
  // v16-99 TIME EVENTS: an event is over → mail the top 100 of each server
  for (const tr of ['A', 'B']) { const ci = evIdx(now), key = 'ev_' + tr, li = await kvGet(env, key);
    if (li !== null && +li < ci) { const eid = tr + li, k = evKind(tr, +li), tkk = EV_TKK[k];
      const rows = (await db.prepare('SELECT e.uid, e.srv, e.sc FROM evt e LEFT JOIN prof p ON p.uid=e.uid LEFT JOIN players pl ON pl.pid=p.pid WHERE e.eid=? AND COALESCE(pl.banned,0)=0 AND substr(p.pid,1,4)<>\'tst_\' ORDER BY e.srv, e.sc DESC, e.t ASC').bind(eid).all()).results;
      let srv = -1, n = 0;
      for (const r of rows) { if (r.srv !== srv) { srv = r.srv; n = 0; } n++; if (n > 100) continue; const q = EV_RW.find(x => n >= x[0] && n <= x[1]); if (!q) continue;
        const rw = {dm: tkk ? q[2] : Math.round(q[2] * 1.5)}; if (tkk) rw[tkk] = q[3];
        await mail(env, r.uid, '⭐', EV_NAME[k] + ' – final ranking', `Your rank: #${n} (score ${Math.round(r.sc).toLocaleString('en-US')}).`, rw); }
      await db.prepare('DELETE FROM evt WHERE eid=?').bind(tr + (+li - 4)).run(); }
    if (li === null || +li !== ci) await kvSet(env, key, ci); }
  // TORQUE KING title: #1 of the campaign ranking on each server
  for (const r of (await db.prepare('SELECT srv, uid FROM prof p WHERE substr(p.pid,1,4)<>\'tst_\' AND best=(SELECT MAX(best) FROM prof q WHERE q.srv=p.srv AND substr(q.pid,1,4)<>\'tst_\') GROUP BY srv').all()).results) await addUnl(env, r.uid, 'king');
  await db.prepare('DELETE FROM chat WHERE t<?').bind(now - 7 * DAY).run();
  await db.prepare('DELETE FROM ahist WHERE t<?').bind(now - 14 * DAY).run();
  await db.prepare('DELETE FROM inbox WHERE (got=1 AND t<?) OR t<?').bind(now - 7 * DAY, now - 60 * DAY).run();
}
export async function onlineCron(env) { await ensure(env);
  try { await env.DB.prepare(`UPDATE prof SET vip=(SELECT ${VIP_SQL} FROM players pl WHERE pl.pid=prof.pid) WHERE pid IN (SELECT pid FROM players)`).run(); } catch (e) {}   // v16-85: fix every profile
  await rewardsTick(env); await cupTick(env); }

// ------------------------------------------------------------------ the API
export async function online(op, b, env) {
  await ensure(env); const db = env.DB, now = Date.now();
  if (!b || typeof b.pid !== 'string' || b.pid.length < 8 || b.pid.length > 64) return {err:'bad'};
  // v16-88: only the newest game may go online (ranking, chat, arena, cup, mail). Old versions get err:'update'.
  // Raise MIN_CV together with CV in online.js when a release MUST reach everybody.
  if ((b.cv | 0) < MIN_CV) return {err:'update', min:MIN_CV};
  if (op === 'replay') return replay(env, b.id);
  if (op === 'view') { const p = await db.prepare('SELECT * FROM prof WHERE uid=?').bind(b.uid | 0).first(); if (!p) return {err:'not found'};
    const a = await db.prepare('SELECT pts, w, l, season FROM arena WHERE uid=?').bind(p.uid).first();
    return {ok:true, p:pub(p, {team:pubTeam(JSON.parse(p.team || '[]')), arena:a && a.season === seasonOf(now) ? {pts:a.pts, w:a.w, l:a.l, tier:tierOf(a.pts)} : null})}; }
  let p = await profOf(env, b.pid);
  if (op === 'sync') {
    if (await isBanned(env, b.pid)) return {banned:1};
    const srv = Math.max(1, Math.min(99, b.srv | 0 || 1)), s = b.s || {}, team = cleanTeam(b.team), lang = String(b.lang || 'en').slice(0, 12);
    const best = num(s.best, 0, 1000) | 0, vip = vipLvOf(await db.prepare('SELECT vip FROM players WHERE pid=?').bind(b.pid).first().then(r => r && r.vip, () => 0)), rep = num(s.rep, 0, 30) | 0, lv = num(s.lv, 0, 200) | 0, pw = teamPow(team);
    const cl = Array.isArray(b.unl) ? b.unl : [];
    // v16-122: FOUNDER only with a purchase Google confirmed (purchases table) – the test account (tst_…) may claim it
    const fdr = cl.includes('fdr') && (String(b.pid).startsWith('tst_') || !!(await db.prepare("SELECT 1 FROM purchases WHERE sku='founder_pass' AND state='ok' AND pid IN (" + [b.pid, ...(Array.isArray(b.pids) ? b.pids : [])].slice(0, 6).map(() => '?').join(',') + ") LIMIT 1").bind(b.pid, ...(Array.isArray(b.pids) ? b.pids : []).slice(0, 5).map(String)).first()));
    const cunl = cl.filter(k => ['wr','boss','gear','speed','f1'].includes(k) || (k === 'fdr' && fdr)).join(',');
    const icon = String(b.icon || (team[0] && team[0].id) || 'm0_0').replace(/[^a-z0-9_]/g, '').slice(0, 12), dk = dayKey(now);
    if (!p) {
      await db.prepare(`INSERT INTO prof(pid,srv,name,nlow,icon,cc,lang,vip,rep,best,bday,bd0,pow,lv,team,t,created,cunl) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(b.pid, srv, '#tmp' + b.pid.slice(0, 12), '#tmp' + b.pid.slice(0, 12), icon, ccOf(lang), langOf(lang), vip, rep, best, dk, best, pw, lv, JSON.stringify(team), now, now, cunl).run();
      p = await profOf(env, b.pid); const nm = 'Mechanic' + p.uid;
      await db.prepare('UPDATE prof SET name=?, nlow=? WHERE uid=?').bind(nm, nm.toLowerCase(), p.uid).run(); p.name = nm;
    } else {
      const bd0 = p.bday === dk ? p.bd0 : p.best;
      await db.prepare('UPDATE prof SET srv=?, cc=COALESCE(NULLIF(?,\'\'),cc), lang=?, vip=?, rep=?, best=?, bday=?, bd0=?, pow=?, lv=?, team=?, t=?, cunl=? WHERE uid=?')
        .bind(srv, ccOf(lang), langOf(lang), vip, rep, best, dk, bd0, pw, lv, JSON.stringify(team), now, cunl, p.uid).run();
      p = await profOf(env, b.pid);
    }
    if (team.length) await db.prepare('INSERT OR IGNORE INTO arena(uid,srv,season,pts,w,l,tk,tkt,opp,peak,t) VALUES(?,?,?,?,0,0,?,?,?,?,0)').bind(p.uid, p.srv, seasonOf(now), START_PTS, ARENA_TK, now, '[]', START_PTS).run();
    const inbox = (await db.prepare('SELECT COUNT(*) n FROM inbox WHERE uid=? AND got=0').bind(p.uid).first()).n;
    const last = await db.prepare('SELECT MAX(id) id FROM chat WHERE srv=? AND ch=? AND hid=0').bind(p.srv, 'w').first();
    const ar = await db.prepare('SELECT tk, tkt, season FROM arena WHERE uid=?').bind(p.uid).first();
    const atk = ar ? (ar.season !== seasonOf(now) ? ATK(p) : Math.min(ATK(p), ar.tk + Math.floor((now - ar.tkt) / TK_EVERY))) : ATK(p);
    return {ok:true, me:pub(p, {chg:p.chg, unl:[...unlocks(p)], named:!p.name.startsWith('Mechanic'), vip:p.vip | 0, hv:p.hv | 0}), inbox, chatLast:last && last.id || 0, arenaTk:atk, time:now};
  }
  if (!p) return {err:'no_profile'};
  if (op === 'prof') {
    const set = b.set || {}, up = {};
    if (set.name !== undefined) {
      const n = clean(set.name).replace(/\s+/g, ' ');
      if (n.length < 3 || n.length > 14 || !/^[\p{L}\p{N}_ .\-]+$/u.test(n)) return {err:'name_rules'};
      if (hasBad(n) || /^mechanic\d+$/i.test(n) || /admin|torque ?studios|moderator|support/i.test(n)) return {err:'name_bad'};
      const ex = await db.prepare('SELECT uid FROM prof WHERE srv=? AND nlow=? AND uid<>?').bind(p.srv, n.toLowerCase(), p.uid).first(); if (ex) return {err:'name_taken'};
      if (p.chg > 0 && !b.paid) return {err:'pay', cost:300};
      up.name = n; up.nlow = n.toLowerCase(); up.chg = p.chg + 1;
    }
    if (set.hv !== undefined) up.hv = set.hv ? 1 : 0;   // v16-122: HIDE VIP
    if (set.icon !== undefined) up.icon = String(set.icon).replace(/[^a-z0-9_]/g, '').slice(0, 12);
    if (set.frame !== undefined) { const f = set.frame | 0; if (!frameOk(p, f)) return {err:'locked'}; up.frame = f; }
    if (set.title !== undefined) { const k = String(set.title); if (!TITLES.includes(k) || !titleOk(p, k)) return {err:'locked'}; up.title = k; }
    const ks = Object.keys(up); if (ks.length) await db.prepare(`UPDATE prof SET ${ks.map(k => k + '=?').join(',')} WHERE uid=?`).bind(...ks.map(k => up[k]), p.uid).run();
    p = await profOf(env, b.pid); return {ok:true, me:pub(p, {chg:p.chg, unl:[...unlocks(p)], vip:p.vip | 0, hv:p.hv | 0})};
  }
  if (op === 'rank') {
    const by = ['best','pow','lv'].includes(b.by) ? b.by : 'best';
    const rows = (await db.prepare(`SELECT p.* FROM prof p LEFT JOIN players pl ON pl.pid=p.pid WHERE p.srv=? AND COALESCE(pl.banned,0)=0 AND substr(p.pid,1,4)<>'tst_' AND p.t>? ORDER BY p.${by} DESC, p.pow DESC LIMIT 100`).bind(p.srv, now - 30 * DAY).all()).results;
    const my = (await db.prepare(`SELECT COUNT(*) n FROM prof p LEFT JOIN players pl ON pl.pid=p.pid WHERE p.srv=? AND COALESCE(pl.banned,0)=0 AND substr(p.pid,1,4)<>'tst_' AND p.t>? AND (p.${by}>? OR (p.${by}=? AND p.pow>?))`).bind(p.srv, now - 30 * DAY, p[by], p[by], p.pow).first()).n + 1;
    const tot = (await db.prepare('SELECT COUNT(*) n FROM prof WHERE srv=? AND t>?').bind(p.srv, now - 30 * DAY).first()).n;
    return {ok:true, by, list:rows.map(r => pub(r)), me:pub(p), myRank:my, total:tot, time:now};
  }
  if (op === 'chat') {
    const ch = b.ch === 'a' ? 'a' : 'w', lang = langOf(b.lang), since = b.since | 0;
    const rows = (await db.prepare(`SELECT c.*, p.name, p.icon, p.frame, p.title, p.cc, p.vip, p.hv FROM chat c LEFT JOIN prof p ON p.uid=c.uid WHERE c.srv=? AND c.ch=? AND c.hid=0 AND c.id>? ORDER BY c.id DESC LIMIT 40`)
      .bind(p.srv, ch, since).all()).results.reverse();
    const todo = rows.filter(m => !m.sys && m.lang !== lang && b.tr !== false && !JSON.parse(m.tr || '{}')[lang]).slice(-12);
    await Promise.all(todo.map(async m => { const t = await translate(env, m.txt, m.lang, lang); if (t === null) return; const tr = JSON.parse(m.tr || '{}'); tr[lang] = t; m.tr = JSON.stringify(tr);
      await db.prepare('UPDATE chat SET tr=? WHERE id=?').bind(m.tr, m.id).run(); }));
    return {ok:true, list:rows.map(m => { const tr = JSON.parse(m.tr || '{}')[lang]; return {id:m.id, uid:m.uid, sys:m.sys, t:m.t, txt:m.txt, lang:m.lang, tr:tr && tr !== '=' ? tr : null,
      name:m.name, icon:m.icon, frame:m.frame, title:m.title, cc:m.cc, vip:m.hv ? -1 : m.vip, me:m.uid === p.uid}; }), muted:p.mute > now ? p.mute : 0};
  }
  if (op === 'say') {
    if (isTst(b.pid)) return {err:'test'};   // v16-91: the test account only looks, it does not write in the chat
    if (await isBanned(env, b.pid)) return {err:'banned'};
    if (p.mute > now) return {err:'muted', until:p.mute};
    if (p.name.startsWith('Mechanic')) return {err:'need_name'};
    if (now - p.lastmsg < 4000) return {err:'slow'};
    let txt = clean(b.txt).replace(/\s+/g, ' ').slice(0, 200); if (!txt) return {err:'empty'};
    txt = maskBad(txt); const ch = b.ch === 'a' ? 'a' : 'w', lang = guessLang(txt, langOf(b.lang));
    const id = (await db.prepare('INSERT INTO chat(srv,ch,uid,t,txt,lang) VALUES(?,?,?,?,?,?) RETURNING id').bind(p.srv, ch, p.uid, now, txt, lang).first()).id;
    await db.prepare('UPDATE prof SET nmsg=nmsg+1, lastmsg=? WHERE uid=?').bind(now, p.uid).run(); if (p.nmsg + 1 >= 100) await addUnl(env, p.uid, 'chat');
    return {ok:true, id};
  }
  if (op === 'report') {
    const m = await db.prepare('SELECT id, uid FROM chat WHERE id=?').bind(b.mid | 0).first(); if (!m || m.uid === p.uid || !m.uid) return {err:'bad'};
    const r = await db.prepare('INSERT OR IGNORE INTO creps(mid,uid,t) VALUES(?,?,?)').bind(m.id, p.uid, now).run();
    if (r.meta && r.meta.changes) await db.prepare('UPDATE chat SET rep=rep+1, hid=CASE WHEN rep+1>=3 THEN 1 ELSE hid END WHERE id=?').bind(m.id).run();
    return {ok:true};
  }
  if (op === 'arena') { if (await isBanned(env, b.pid)) return {banned:1}; return {ok:true, ...(await arenaView(env, p))}; }
  if (op === 'refresh') { const a = await arenaRow(env, p); a.opp = JSON.stringify(await findOpp(env, p, a)); await saveArena(env, a); return {ok:true, opp:await oppView(env, p, a)}; }
  if (op === 'fight') { if (await isBanned(env, b.pid)) return {banned:1}; return fight(env, p, b); }
  if (op === 'atop') {
    const season = seasonOf(now);
    const rows = (await db.prepare(`SELECT a.pts, a.w, a.l, p.* FROM arena a JOIN prof p ON p.uid=a.uid LEFT JOIN players pl ON pl.pid=p.pid WHERE a.srv=? AND a.season=? AND COALESCE(pl.banned,0)=0 AND substr(p.pid,1,4)<>'tst_' ORDER BY a.pts DESC LIMIT 100`).bind(p.srv, season).all()).results;
    return {ok:true, list:rows.map(r => pub(r, {pts:r.pts, w:r.w, l:r.l, tier:tierOf(r.pts)}))};
  }
  if (op === 'hist') {
    const rows = (await db.prepare(`SELECT id,t,kind,a,d,an,dn,win,da,dd FROM ahist WHERE a=? OR d=? ORDER BY id DESC LIMIT 20`).bind(p.uid, p.uid).all()).results;
    return {ok:true, list:rows.map(r => ({id:r.id, t:r.t, kind:r.kind, atk:r.a === p.uid, other:r.a === p.uid ? r.dn : r.an, otherUid:r.a === p.uid ? r.d : r.a, win:r.a === p.uid ? r.win : 1 - r.win, d:r.a === p.uid ? r.da : r.dd}))};
  }
  if (op === 'cup') return {ok:true, ...(await cupView(env, p))};
  if (op === 'wbhit') { if (await isBanned(env, b.pid)) return {banned:1};
    const ws = weekStart(now), wk = dayKey(ws), day = dayKey(now), t = +b.t || now;
    if (t < ws || t > now + 6e4) return {err:'bad'};
    let dmg = Math.round(num(b.dmg, 0, 1e15)); const cap = Math.max(2e5, (p.pow || 0) * WB_CAP); if (dmg > cap) dmg = cap;
    const r = await db.prepare('SELECT * FROM wboss WHERE uid=? AND wk=?').bind(p.uid, wk).first();
    const nday = r && r.day === day ? r.nday + 1 : 1; if (nday > WB_DAY) return {err:'limit'};
    if (r) await db.prepare('UPDATE wboss SET srv=?, dmg=dmg+?, best=MAX(best,?), hits=hits+1, day=?, nday=?, t=? WHERE uid=? AND wk=?').bind(p.srv, dmg, dmg, day, nday, now, p.uid, wk).run();
    else await db.prepare('INSERT INTO wboss(uid,wk,srv,dmg,best,hits,day,nday,t) VALUES(?,?,?,?,?,1,?,1,?)').bind(p.uid, wk, p.srv, dmg, dmg, day, now).run();
    const me = await db.prepare('SELECT dmg FROM wboss WHERE uid=? AND wk=?').bind(p.uid, wk).first();
    const rank = (await db.prepare('SELECT COUNT(*) n FROM wboss WHERE srv=? AND wk=? AND dmg>?').bind(p.srv, wk, me.dmg).first()).n + 1;
    return {ok:true, dmg:me.dmg, rank};
  }
  if (op === 'evsc' || op === 'evrank') {   // v16-99 TIME EVENTS
    if (!p) return {err:'noprof'}; const eid = String(b.eid || ''), m = /^([AB])(\d{1,6})$/.exec(eid); if (!m) return {err:'bad'};
    const tr = m[1], i = +m[2], k = evKind(tr, i), ci = evIdx(now); if (i !== ci && !(i === ci - 1 && now - (EV_E0 + ci * EV_DUR) < HOUR)) return {err:'over'};
    if (op === 'evsc') { if (await isBanned(env, b.pid)) return {banned:1}; const sc = Math.round(num(b.sc, 0, EV_CAP[k]));
      await db.prepare('INSERT INTO evt(uid,eid,srv,sc,t) VALUES(?,?,?,?,?) ON CONFLICT(uid,eid) DO UPDATE SET srv=excluded.srv, t=CASE WHEN excluded.sc>evt.sc THEN excluded.t ELSE evt.t END, sc=MAX(evt.sc, excluded.sc)').bind(p.uid, eid, p.srv, sc, now).run(); }
    const me = await db.prepare('SELECT sc, t FROM evt WHERE uid=? AND eid=?').bind(p.uid, eid).first();
    const rank = me ? (await db.prepare('SELECT COUNT(*) n FROM evt WHERE eid=? AND srv=? AND (sc>? OR (sc=? AND t<?))').bind(eid, p.srv, me.sc, me.sc, me.t).first()).n + 1 : 0;
    if (op === 'evsc') return {ok:true, rank, sc:me ? me.sc : 0};
    const top = (await db.prepare('SELECT e.uid, e.sc, p.name FROM evt e JOIN prof p ON p.uid=e.uid LEFT JOIN players pl ON pl.pid=p.pid WHERE e.eid=? AND e.srv=? AND COALESCE(pl.banned,0)=0 AND substr(p.pid,1,4)<>\'tst_\' ORDER BY e.sc DESC, e.t ASC LIMIT 100').bind(eid, p.srv).all()).results;
    return {ok:true, top:top.map(r => ({uid:r.uid, name:r.name, sc:r.sc})), me:p.uid, rank, sc:me ? me.sc : 0};
  }
  if (op === 'wbrank') {
    const ws = weekStart(now), wk = dayKey(ws);
    const top = (await db.prepare('SELECT w.uid, w.dmg, p.name, p.icon, p.frame FROM wboss w JOIN prof p ON p.uid=w.uid LEFT JOIN players pl ON pl.pid=p.pid WHERE w.srv=? AND w.wk=? AND COALESCE(pl.banned,0)=0 AND substr(p.pid,1,4)<>\'tst_\' ORDER BY w.dmg DESC LIMIT 100').bind(p.srv, wk).all()).results;
    const me = await db.prepare('SELECT dmg FROM wboss WHERE uid=? AND wk=?').bind(p.uid, wk).first();
    const rank = me ? (await db.prepare('SELECT COUNT(*) n FROM wboss WHERE srv=? AND wk=? AND dmg>?').bind(p.srv, wk, me.dmg).first()).n + 1 : 0;
    return {ok:true, top:top.map(r => ({uid:r.uid, name:r.name, icon:r.icon, frame:r.frame, dmg:r.dmg})), dmg:me ? me.dmg : 0, rank, name:p.name, end:ws + 7 * DAY, now};
  }
  if (op === 'inbox') return {ok:true, list:(await db.prepare('SELECT id,t,ic,title,body,rw FROM inbox WHERE uid=? AND got=0 ORDER BY id DESC LIMIT 30').bind(p.uid).all()).results.map(r => ({...r, rw:JSON.parse(r.rw || '{}')}))};
  if (op === 'claim') {
    const r = await db.prepare('UPDATE inbox SET got=1 WHERE id=? AND uid=? AND got=0 RETURNING rw').bind(b.id | 0, p.uid).first();
    return r ? {ok:true, rw:JSON.parse(r.rw || '{}')} : {err:'claimed'};
  }
  return {err:'not found'};
}

// ------------------------------------------------------------------ admin: chat moderation (/admin/chat?key=…)
export async function onlineAdmin(url, env) {
  await ensure(env); const db = env.DB, k = encodeURIComponent(env.ADMIN_KEY), now = Date.now();
  const del = url.searchParams.get('del'), mute = url.searchParams.get('mute'), unmute = url.searchParams.get('unmute'), rename = url.searchParams.get('rename');
  if (del) await db.prepare('UPDATE chat SET hid=2 WHERE id=?').bind(del | 0).run();
  if (mute) { const [uid, days] = mute.split(':'); await db.prepare('UPDATE prof SET mute=? WHERE uid=?').bind(now + (+days || 1) * DAY, uid | 0).run(); }
  if (unmute) await db.prepare('UPDATE prof SET mute=0 WHERE uid=?').bind(unmute | 0).run();
  if (rename) { await db.prepare("UPDATE prof SET name='Mechanic'||uid, nlow='mechanic'||uid WHERE uid=?").bind(rename | 0).run(); }
  if (del || mute || unmute || rename) return Response.redirect(url.origin + '/admin/chat?key=' + k, 302);
  const esc = s => String(s ?? '').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
  const d = t => new Date(t).toISOString().slice(5, 16).replace('T', ' ');
  const rep = (await db.prepare('SELECT c.*, p.name FROM chat c LEFT JOIN prof p ON p.uid=c.uid WHERE c.rep>0 AND c.hid<2 ORDER BY c.rep DESC, c.id DESC LIMIT 50').all()).results;
  const last = (await db.prepare('SELECT c.*, p.name FROM chat c LEFT JOIN prof p ON p.uid=c.uid WHERE c.sys=0 AND c.hid<2 ORDER BY c.id DESC LIMIT 60').all()).results;
  const muted = (await db.prepare('SELECT uid, name, mute FROM prof WHERE mute>?').bind(now).all()).results;
  const st = await db.prepare('SELECT COUNT(*) n, SUM(t>?) d FROM prof').bind(now - DAY).first();
  const row = m => `<div class=c><small>${d(m.t)} · S${m.srv} · #${m.uid} <b>${esc(m.name)}</b> · ${esc(m.lang)}${m.rep ? ` · <b class=b>🚩 ${m.rep}</b>` : ''}${m.hid ? ' · hidden' : ''}</small><br>${esc(m.txt)}<br>
    <a href="?key=${k}&del=${m.id}">🗑️ delete</a> · <a href="?key=${k}&mute=${m.uid}:1">🔇 mute 1 day</a> · <a href="?key=${k}&mute=${m.uid}:7">🔇 7 days</a> · <a href="?key=${k}&mute=${m.uid}:3650">⛔ forever</a> · <a href="?key=${k}&rename=${m.uid}">✏️ reset name</a></div>`;
  const html = `<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><title>Torque Chat</title>
<style>body{font-family:system-ui;background:#0b1019;color:#eee;margin:0;padding:12px}h1{color:#ffd54a;font-size:22px}.c{background:#141c2b;border:1px solid #e0a82e55;border-radius:12px;padding:10px;margin:8px 0;font-size:13px}.b{color:#ff8a80}a{color:#9fd3ff}small{color:#9fb0c0}</style>
<h1>💬 Torque Chat – moderation</h1><div class=c>Profiles: <b>${st.n}</b> · active 24h: <b>${st.d || 0}</b> · <a href="/admin?key=${k}">🛡️ back to Torque Guard</a></div>
<h3>🚩 Reported (${rep.length}) – 3 reports hide a message by itself</h3>${rep.map(row).join('') || '<div class=c>Nothing reported 👍</div>'}
<h3>🔇 Muted</h3>${muted.map(m => `<div class=c>#${m.uid} ${esc(m.name)} until ${d(m.mute)} · <a href="?key=${k}&unmute=${m.uid}">unmute</a></div>`).join('') || '<div class=c>nobody</div>'}
<h3>Last messages</h3>${last.map(row).join('')}`;
  return new Response(html, {headers:{'content-type':'text/html;charset=utf-8'}});
}
