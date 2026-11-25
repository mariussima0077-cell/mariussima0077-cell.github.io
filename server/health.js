// v16-318 🩺 SERVER HEALTH (Marius 25 nov 2026: „pe pagina de admin cum putem vedea dacă ceva nu e ok cu serverul? După ce facem
// orice update… cu arena azi dimineață nu am primit nicio notificare”).
//   • every SERVER crash (the 500 answers, the cron) is written in table `serr` → /admin „🩺 Server health” + an alert
//   • every 10 min (cron) and right after an update: self-tests (online.js selfTest + database, cloud save, game website,
//     new game errors from the players) → table `health`; a check that goes red / green again → table `alerts`
//   • GET /api/health (public, no secrets) = the short status. The GitHub Action `.github/workflows/health.yml` reads it every
//     10 min and after every push, and posts NEW alerts in the private Discord channel #admin-alerts (ping 🛠️ Developer).
import {selfTest} from './online.js';

const GAME_SW = 'https://mariussima0077-cell.github.io/sw.js';
export const HNAME = {db:'Database', arena_sim:'Arena fights (test teams)', arena_replay:'Arena / Rail Wars / Cup (last real fights)',
  rank:'Ranking', chat:'Chat', atop:'Arena top 100', hist:'Arena history', cup:'Torque Cup', wb:'World Boss', mail:'Mail',
  cloud:'Cloud save', site:'Game website (GitHub)', gerr:'Game errors (players’ phones)', serr:'Server errors (crashes)'};
const NO_ALERT = new Set(['serr']);   // server crashes alert by themselves in srvErr (one alert per new error)
const AREA = {fight:'Arena', arena:'Arena', refresh:'Arena', replay:'Arena', atop:'Arena', hist:'Arena', ashop:'Arena Shop', abuy:'Arena Shop', amile:'Arena Shop',
  rw:'Rail Wars', rwsend:'Rail Wars', rwatk:'Rail Wars', rwclaim:'Rail Wars', cup:'Torque Cup', chat:'Chat', say:'Chat', report:'Chat', rank:'Ranking',
  sync:'Online sync', prof:'Profile', view:'Profile', wbhit:'World Boss', wbrank:'World Boss', gpsc:'Grand Prix', gprank:'Grand Prix', gpfin:'Grand Prix', gppat:'Grand Prix',
  evsc:'Events', evrank:'Events', inbox:'Mail', claim:'Mail', help:'Support', brag:'Announcements', ann:'Announcements', stbuy:'Street Shop'};
export function areaOf(path) {
  if (path.startsWith('/api/on/')) { const op = path.slice(8); return AREA[op] || 'Online: ' + op; }
  if (path.startsWith('/api/cloud/')) return 'Cloud save';
  if (path.startsWith('/api/xfer/')) return 'Transfer';
  return {'/api/report':'Anti-cheat check-in', '/api/purchase':'Purchases', '/api/err':'Error reports', '/api/integrity':'Play Integrity', '/admin':'Admin page', '/admin/chat':'Admin chat'}[path] || path;
}

let hReady = false;
export async function hEnsure(db) { if (hReady) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS serr(h TEXT PRIMARY KEY, area TEXT, m TEXT, st TEXT, n INTEGER, t0 INTEGER, t INTEGER, fx INTEGER DEFAULT 0)'),
    db.prepare('CREATE TABLE IF NOT EXISTS health(k TEXT PRIMARY KEY, ok INTEGER, msg TEXT, st TEXT, ms INTEGER, t INTEGER, tok INTEGER, tbad INTEGER)'),
    db.prepare('CREATE TABLE IF NOT EXISTS hmeta(k TEXT PRIMARY KEY, v TEXT)'),
    db.prepare('CREATE TABLE IF NOT EXISTS alerts(id INTEGER PRIMARY KEY AUTOINCREMENT, t INTEGER, lvl TEXT, txt TEXT)'),
  ]); hReady = true; }
const getM = async (db, k) => { const r = await db.prepare('SELECT v FROM hmeta WHERE k=?').bind(k).first(); return r ? r.v : null; };
const setM = (db, k, v) => db.prepare('INSERT INTO hmeta(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v').bind(k, String(v)).run();
const alert = (db, lvl, txt) => db.prepare('INSERT INTO alerts(t,lvl,txt) VALUES(?,?,?)').bind(Date.now(), lvl, String(txt).slice(0, 900)).run();

// a server crash: one row per kind of error (area + message); a NEW one (or one that came back after 👍 DONE) makes an alert
export async function srvErr(env, area, e) { try {
  const db = env.DB; await hEnsure(db); const now = Date.now();
  const m = String(e && e.message || e).slice(0, 300), st = String(e && e.stack || '').slice(0, 600), h = (area + '|' + m).slice(0, 200);
  const old = await db.prepare('SELECT n, fx, t FROM serr WHERE h=?').bind(h).first();
  await db.prepare('INSERT INTO serr(h,area,m,st,n,t0,t,fx) VALUES(?,?,?,?,1,?,?,0) ON CONFLICT(h) DO UPDATE SET n=CASE WHEN fx>0 THEN 1 ELSE n+1 END, fx=0, t=excluded.t, st=excluded.st')
    .bind(h, area, m, st, now, now).run();
  if (!old || old.fx > 0) await alert(db, 'red', `🔴 SERVER ERROR in ${area}${old ? ' (came back after DONE)' : ''}: ${m}`);
  else if (old.n + 1 === 50) await alert(db, 'red', `🔴 ${area}: the same server error happened 50 times already: ${m}`);
} catch (x) { console.log('srvErr', x && x.message); } }

async function siteVer() { const r = await fetch(GAME_SW + '?h=' + Date.now(), {cf:{cacheTtl:0}}); if (!r.ok) throw new Error('GitHub answered ' + r.status);
  const m = (await r.text()).match(/const V='te-(v[\d-]+)'/); if (!m) throw new Error('version not found in sw.js'); return m[1]; }

// all the checks; why = 'cron' | 'manual' | 'push'
export async function runHealth(env, why) {
  const db = env.DB; await hEnsure(db); const now = Date.now();
  let res = []; try { res = await selfTest(env); } catch (e) { res.push({k:'db', ok:0, msg:'self-test crashed: ' + String(e && e.message || e).slice(0, 180)}); }
  const T = async (k, fn) => { const t0 = Date.now(); try { res.push({k, ok:1, msg:String(await fn() || 'OK').slice(0, 200), ms:Date.now() - t0}); }
    catch (e) { res.push({k, ok:0, msg:String(e && e.message || e).slice(0, 200), ms:Date.now() - t0}); } };
  await T('cloud', async () => { try { const r = await db.prepare('SELECT COUNT(*) n FROM accounts').first(); return (r.n || 0) + ' accounts'; } catch (e) { if (/no such table/.test(e.message)) return 'no cloud saves yet'; throw e; } });
  let gv = null; await T('site', async () => { gv = await siteVer(); return 'live game ' + gv; });
  await T('gerr', async () => { let rows = []; try { rows = (await db.prepare('SELECT m, n, cv, fx FROM errs WHERE t>? AND n>=3 AND (t0>? OR (fx>0 AND cv>fx)) ORDER BY n DESC LIMIT 3').bind(now - 3600e3, now - 3 * 3600e3).all()).results; } catch (e) {}
    if (rows.length) throw new Error(rows.map(r => `${r.n}× v${r.cv}: ${String(r.m).slice(0, 90)}`).join(' | ')); return 'no new errors in the last hours'; });
  await T('serr', async () => { const rows = (await db.prepare('SELECT area, m, n FROM serr WHERE t>? AND fx=0 ORDER BY t DESC LIMIT 3').bind(now - 30 * 60e3).all()).results;
    if (rows.length) throw new Error(rows.map(r => `${r.area} (${r.n}×): ${String(r.m).slice(0, 90)}`).join(' | ')); return 'no crash in the last 30 min'; });
  const prev = {}; for (const r of (await db.prepare('SELECT k, ok FROM health').all()).results) prev[r.k] = r.ok;
  const bad = [];
  for (const r of res) {
    await db.prepare('INSERT INTO health(k,ok,msg,st,ms,t,tok,tbad) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(k) DO UPDATE SET ok=excluded.ok, msg=excluded.msg, st=excluded.st, ms=excluded.ms, t=excluded.t, tok=COALESCE(excluded.tok, tok), tbad=CASE WHEN excluded.ok=1 THEN NULL WHEN ok=1 OR tbad IS NULL THEN excluded.t ELSE tbad END')
      .bind(r.k, r.ok, r.msg, r.st || null, r.ms || 0, now, r.ok ? now : null, r.ok ? null : now).run();
    if (!r.ok) bad.push(r);
    if (NO_ALERT.has(r.k)) continue;
    if (!r.ok && prev[r.k] !== 0) await alert(db, 'red', `🔴 ${HNAME[r.k] || r.k} is NOT OK: ${r.msg}`);
    if (r.ok && prev[r.k] === 0) await alert(db, 'green', `🟢 ${HNAME[r.k] || r.k} is OK again`);
  }
  // an update was detected (new server code or new game version) → one summary line: what changed + the result of all the tests
  const dep = env.CFV && env.CFV.id ? String(env.CFV.id) : '', oDep = await getM(db, 'dep'), oGv = await getM(db, 'gv'), what = [];
  if (dep && dep !== oDep) { if (oDep !== null) what.push('server' + (env.CFV.tag ? ' ' + env.CFV.tag : '')); await setM(db, 'dep', dep); await setM(db, 'depT', now); }
  if (gv && gv !== oGv) { if (oGv !== null) what.push('game ' + gv); await setM(db, 'gv', gv); }
  if (what.length) await alert(db, bad.length ? 'red' : 'info', `📦 Update detected (${what.join(' + ')}) → ` + (bad.length ? `🔴 ${bad.length} problem(s): ${bad.map(b => HNAME[b.k] || b.k).join(', ')}` : `✅ all ${res.length} checks OK`));
  await setM(db, 'run', now); await setM(db, 'why', why || 'cron');
  await db.prepare('DELETE FROM alerts WHERE t<?').bind(now - 30 * 864e5).run();
  await db.prepare('DELETE FROM serr WHERE t<?').bind(now - 30 * 864e5).run();
  return {res, bad};
}
export async function healthCron(env) { await hEnsure(env.DB); await setM(env.DB, 'cron', Date.now()); await runHealth(env, 'cron'); }

// GET /api/health  (public: names + OK / not OK + the alerts of the last 2 days – no player data, no secrets)
// ?run=1 → run the tests now (max once a minute) – the GitHub Action calls it after every push
export async function healthApi(url, env) {
  const db = env.DB; await hEnsure(db); const now = Date.now();
  if (url.searchParams.get('run') === '1' && now - (+(await getM(db, 'run')) || 0) > 60e3) await runHealth(env, 'push');
  const rows = (await db.prepare('SELECT k, ok, msg, t, tok FROM health').all()).results;
  const run = +(await getM(db, 'run')) || 0, cron = +(await getM(db, 'cron')) || 0;
  const since = +url.searchParams.get('since') || now - 2 * 864e5;
  const al = (await db.prepare('SELECT id, t, lvl, txt FROM alerts WHERE t>? ORDER BY id DESC LIMIT 30').bind(since).all()).results;
  return {ok:rows.length > 0 && rows.every(r => r.ok) && now - run < 30 * 60e3, now, run, cron, gv:await getM(db, 'gv'),
    checks:rows.map(r => ({k:r.k, name:HNAME[r.k] || r.k, ok:r.ok, msg:r.ok ? undefined : r.msg, tok:r.tok})), alerts:al};
}

// /admin actions: ?hrun=1 (run the tests now) · ?sfix=<h>|all (👍 DONE on a server error)
export async function healthAct(url, env, k) {
  const db = env.DB; await hEnsure(db);
  if (url.searchParams.get('hrun')) { await runHealth(env, 'manual'); return Response.redirect(url.origin + '/admin?key=' + k + '#health', 302); }
  const f = url.searchParams.get('sfix');
  if (f) { if (f === 'all') await db.prepare('UPDATE serr SET fx=t').run(); else await db.prepare('UPDATE serr SET fx=t WHERE h=?').bind(f).run();
    return Response.redirect(url.origin + '/admin?key=' + k + '#health', 302); }
  return null;
}

// the admin part: banner on top + the folded section „🩺 Server health”
export async function healthHtml(env, k) {
  const db = env.DB; await hEnsure(db); const now = Date.now();
  const esc = s => String(s ?? '').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
  const ago = t => { if (!t) return 'never'; const m = Math.round((now - t) / 60e3); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : Math.round(m / 1440) + ' days ago'; };
  const d = t => new Date(t + 3600e3).toISOString().slice(5, 16).replace('T', ' ');   // Paris (winter)
  const rows = (await db.prepare('SELECT * FROM health').all()).results, order = Object.keys(HNAME);
  rows.sort((a, b) => (a.ok - b.ok) || (order.indexOf(a.k) - order.indexOf(b.k)));
  const sr = (await db.prepare('SELECT * FROM serr WHERE fx=0 AND t>? ORDER BY t DESC LIMIT 20').bind(now - 7 * 864e5).all()).results;
  const al = (await db.prepare('SELECT * FROM alerts ORDER BY id DESC LIMIT 15').all()).results;
  const run = +(await getM(db, 'run')) || 0, cron = +(await getM(db, 'cron')) || 0, gv = await getM(db, 'gv'), depT = +(await getM(db, 'depT')) || 0;
  const nBad = rows.filter(r => !r.ok).length, stale = !run || now - run > 30 * 60e3, red = nBad > 0 || stale;
  const crashes = sr.filter(r => now - r.t < 864e5).length;
  const banner = `<a href="#health" onclick="var e=document.getElementById('health');if(e)e.open=true" style="display:block;text-decoration:none;margin:6px 0 8px;padding:12px;border-radius:12px;font-weight:800;font-size:15px;color:#fff;background:${red ? '#b71c1c' : crashes ? '#e65100' : '#1b5e20'}">
${red ? `🔴 SERVER: ${stale ? 'tests not running (' + ago(run) + ')' : nBad + ' problem(s) – ' + esc(rows.filter(r => !r.ok).map(r => HNAME[r.k] || r.k).join(', '))}` : crashes ? `🟠 SERVER OK, but ${crashes} kind(s) of crash today – tap to see` : `🟢 SERVER OK – all ${rows.length} checks passed`}
<br><small style="color:#ffffffcc;font-weight:600">last test ${ago(run)}${gv ? ' · live game ' + esc(gv) : ''}${depT ? ' · server updated ' + ago(depT) : ''}</small></a>`;
  const sec = `<div class=c style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><a href="?key=${k}&hrun=1" style="padding:8px 14px;border-radius:10px;background:#1565c0;color:#fff;font-weight:800;text-decoration:none">▶️ Run all tests now</a>
<small>Automatic: every 10 min + right after every update. Cron last ran ${ago(cron)}. New problems → Discord <b>#admin-alerts</b> (ping 🛠️ Developer).</small></div>
${rows.map(r => `<div class=c style="border-color:${r.ok ? '#2e7d3288' : '#ff5252'}">${r.ok ? '🟢' : '🔴'} <b>${esc(HNAME[r.k] || r.k)}</b> <small>· ${r.ok ? 'OK' : 'broken since ' + d(r.tbad || r.t) + ' · last OK ' + ago(r.tok)} · ${r.ms | 0} ms</small><br><small${r.ok ? '' : ' style="color:#ff8a80"'}>${esc(r.msg)}</small>${!r.ok && r.st ? `<br><small style="font-family:monospace;color:#9fb3c8;word-break:break-all">📍 ${esc(r.st)}</small>` : ''}</div>`).join('') || '<div class=c>No test yet – tap ▶️ Run all tests now.</div>'}
<h3 style="margin:12px 4px 4px;font-size:15px">💥 Server crashes (7 days)</h3>${sr.length > 1 ? `<div class=c><a href="?key=${k}&sfix=all">👍 mark ALL as done</a></div>` : ''}
${sr.map(r => `<div class=c style="border-color:#ff525288"><a href="?key=${k}&sfix=${encodeURIComponent(r.h)}" onclick="return confirm('Fixed? It is hidden and comes back (with a new alert) if it happens again.')" style="float:right;padding:4px 10px;border-radius:8px;background:#2e7d32;color:#fff;text-decoration:none;font-weight:800">👍 DONE</a><b class=b>${esc(r.area)}</b> <b class=f>${r.n}×</b> <small>last ${d(r.t)} · first ${d(r.t0)}</small><br>${esc(r.m)}${r.st ? `<br><small style="font-family:monospace;color:#9fb3c8;word-break:break-all">📍 ${esc(r.st.slice(0, 300))}</small>` : ''}</div>`).join('') || '<div class=c>No server crash 👍</div>'}
<h3 style="margin:12px 4px 4px;font-size:15px">🔔 Last alerts</h3>${al.map(a => `<div class=c><small>${d(a.t)}</small><br>${esc(a.txt)}</div>`).join('') || '<div class=c>No alerts yet.</div>'}`;
  return {banner, sec, red, title:`🩺 Server health ${red ? '🔴' : crashes ? '🟠' : '🟢'}`};
}
