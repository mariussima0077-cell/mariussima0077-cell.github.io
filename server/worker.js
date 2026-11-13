// TORQUE GUARD – the online anti-cheat bot for Torque Empire (Cloudflare Worker + D1 database).
// Runs 24/7 on Cloudflare for free:
//   • POST /api/report    – the game checks in every few minutes; every report is compared with the previous one
//   • POST /api/purchase  – checks a Google Play purchase with Google and ACKNOWLEDGES it (needed, or Google refunds after 3 days)
//   • cron every 10 min   – scans all players again over 24 h, bans cheaters, finds shared purchase tokens, cleans old data
//   • GET  /admin?key=…   – your page (works on the phone): flagged / banned players, unban button
// Secrets (Settings → Variables): ADMIN_KEY, SAVE_SALT, GOOGLE_SA (service account JSON), PACKAGE_NAME (e.g. com.torqueempire.game)

const BAN_AT = 100;                          // suspicion points that trigger an automatic ban
const FLAG_PTS = {edited_save:60, speed_hack:45, money_jump:35, ticket_jump:30, gear_ticket_jump:30, vip_jump:35, clock_back:20};
const json = (o, s=200) => new Response(JSON.stringify(o), {status:s, headers:{'content-type':'application/json','access-control-allow-origin':'*','access-control-allow-headers':'content-type'}});

// best possible income per second at a total building level (same model as the game, ×40 safety margin)
const capPerSec = lv => 40 * 172 * Math.pow(1.0168, lv);

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return json({});
    try {
      if (url.pathname === '/api/report' && req.method === 'POST') return json(await report(await req.json(), env));
      if (url.pathname === '/api/purchase' && req.method === 'POST') return json(await purchase(await req.json(), env));
      if (url.pathname === '/admin') return admin(url, env);
      if (url.pathname === '/') return json({ok:true, name:'Torque Guard', time:Date.now()});
      return json({err:'not found'}, 404);
    } catch (e) { return json({err:String(e)}, 500); }
  },
  async scheduled(ev, env, ctx) { ctx.waitUntil(scan(env)); }
};

// ------------------------------------------------------------------ report
async function report(b, env) {
  const now = Date.now();
  if (!b || typeof b.pid !== 'string' || b.pid.length > 64 || !b.s) return {err:'bad'};
  const s = b.s, db = env.DB;
  const old = await db.prepare('SELECT * FROM players WHERE pid=?').bind(b.pid).first();
  let pts = 0; const why = [];
  // 1) warning signs found by the game itself
  const newFlags = (b.flags || []).filter(f => FLAG_PTS[f] && !(old && (old.flags || '').split(',').includes(f)));
  newFlags.forEach(f => { pts += FLAG_PTS[f]; why.push('client:' + f); });
  // 2) impossible numbers
  if (s.mythic > 6 || s.heroes > 120 || s.stars > s.heroes * 50 || s.lv > 140 || s.best > 1000 || s.money < 0) { pts += 100; why.push('impossible_values'); }
  // 3) compared with the last report
  if (old) {
    const dt = Math.max(1, (now - old.last) / 1000);
    const ps = capPerSec(Math.max(s.lv, old.lv));
    const capMoney = 600 * ps + ps * dt + 16 * 3600 * ps / 20;     // + a full idle chest (max 14h at VIP 20)
    if (s.money - old.money > capMoney) { pts += 40; why.push(`money +${Math.round(s.money - old.money)} in ${Math.round(dt)}s`); }
    if (s.tk - old.tk > 100 + dt / 45) { pts += 30; why.push(`tickets +${s.tk - old.tk}`); }
    if (s.gtk - old.gtk > 100 + dt / 45) { pts += 30; why.push(`gear tickets +${s.gtk - old.gtk}`); }
    if (s.vip - old.vip > 200 + dt * 160 / 86400) { pts += 35; why.push(`vip +${s.vip - old.vip}`); }
    if (s.best - old.best > 30 + dt / 90) { pts += 30; why.push(`campaign +${s.best - old.best} stages`); }
    if (s.lv - old.lv > 12 + dt / 600) { pts += 30; why.push(`buildings +${s.lv - old.lv} levels`); }
    if (s.sold < old.sold || s.xp < old.xp) { /* new save / reinstall – allowed, just note it */ why.push('progress_reset'); }
  }
  const score = Math.min(999, (old ? old.score : 0) + pts);
  const banned = old && old.banned ? 1 : (score >= BAN_AT ? 1 : 0);
  const flags = [...new Set([...(old && old.flags ? old.flags.split(',') : []), ...(b.flags || [])])].filter(Boolean).join(',');
  await db.prepare(`INSERT INTO players(pid,first,last,ver,app,money,sold,xp,vip,lv,best,tk,gtk,heroes,stars,mythic,score,banned,reason,flags)
    VALUES(?1,?2,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19)
    ON CONFLICT(pid) DO UPDATE SET last=?2,ver=?3,app=?4,money=?5,sold=?6,xp=?7,vip=?8,lv=?9,best=?10,tk=?11,gtk=?12,heroes=?13,stars=?14,mythic=?15,score=?16,banned=?17,reason=COALESCE(?18,reason),flags=?19`)
    .bind(b.pid, now, b.v | 0, b.app | 0, s.money | 0, s.sold | 0, s.xp | 0, s.vip | 0, s.lv | 0, s.best | 0, s.tk | 0, s.gtk | 0, s.heroes | 0, s.stars | 0, s.mythic | 0, score, banned, why.length && pts ? why.join(' · ') : null, flags).run();
  await db.prepare('INSERT INTO snaps(pid,t,money,lv,tk,vip,best) VALUES(?,?,?,?,?,?,?)').bind(b.pid, now, s.money | 0, s.lv | 0, s.tk | 0, s.vip | 0, s.best | 0).run();
  if (pts) await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind(b.pid, now, banned ? 'ban' : 'flag', why.join(' · ')).run();
  return {ok:true, serverTime:now, banned:!!banned, msg: banned ? 'Our anti-cheat system found impossible changes in this game (edited save, money/ticket hack or speed hack).' : undefined};
}

// ------------------------------------------------------------------ the bot: runs every 10 minutes
async function scan(env) {
  const db = env.DB, now = Date.now(), day = 864e5;
  // a) 24-hour check: total money earned over a day must be possible with the player's buildings
  const rows = (await db.prepare('SELECT pid,lv,score,banned FROM players WHERE last>? AND banned=0').bind(now - day).all()).results;
  for (const p of rows) {
    const r = await db.prepare('SELECT MIN(t) t0, MAX(t) t1, MIN(money) m0, MAX(money) m1, MIN(vip) v0, MAX(vip) v1 FROM snaps WHERE pid=? AND t>?').bind(p.pid, now - day).first();
    if (!r || !r.t0) continue;
    const dt = (r.t1 - r.t0) / 1000, why = [];
    if (r.m1 - r.m0 > capPerSec(p.lv) * dt / 4 + 5e7) why.push('24h money too high');
    if (r.v1 - r.v0 > 400) why.push('24h VIP points too high');
    if (why.length) {
      const score = p.score + 50, ban = score >= BAN_AT ? 1 : 0;
      await db.prepare('UPDATE players SET score=?, banned=?, reason=? WHERE pid=?').bind(score, ban, why.join(' · '), p.pid).run();
      await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind(p.pid, now, ban ? 'ban' : 'flag', 'bot: ' + why.join(' · ')).run();
    }
  }
  // b) the same purchase token used by different players = shared / stolen purchase
  const dup = (await db.prepare('SELECT token, COUNT(DISTINCT pid) n FROM purchase_use GROUP BY token HAVING n>2').all()).results;
  for (const d of dup) await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind('-', now, 'token', 'purchase token used by ' + d.n + ' players').run();
  // c) clean up
  await db.prepare('DELETE FROM snaps WHERE t<?').bind(now - 2 * day).run();
  await db.prepare('DELETE FROM players WHERE last<? AND banned=0').bind(now - 180 * day).run();
  await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind('-', now, 'scan', 'checked ' + rows.length + ' active players').run();
  await db.prepare("DELETE FROM events WHERE kind='scan' AND t<?").bind(now - day).run();
}

// ------------------------------------------------------------------ Google Play purchases
async function purchase(b, env) {
  if (!b || !b.token || !b.sku || !b.pid) return {valid:false, err:'bad'};
  const db = env.DB;
  await db.prepare('INSERT OR IGNORE INTO purchase_use(token,pid,t) VALUES(?,?,?)').bind(b.token, b.pid, Date.now()).run();
  const known = await db.prepare('SELECT * FROM purchases WHERE token=?').bind(b.token).first();
  if (known && known.state === 'ok' && (b.type !== 'subs' || known.expiry > Date.now())) return {valid:true, expiry:known.expiry || undefined};
  const at = await gToken(env);
  const pkg = env.PACKAGE_NAME, base = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${pkg}/purchases`;
  let valid = false, expiry = 0;
  if (b.type === 'subs') {
    const r = await (await fetch(`${base}/subscriptionsv2/tokens/${encodeURIComponent(b.token)}`, {headers:{authorization:'Bearer ' + at}})).json();
    const li = (r.lineItems || [])[0];
    expiry = li ? Date.parse(li.expiryTime) : 0;
    valid = ['SUBSCRIPTION_STATE_ACTIVE', 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD'].includes(r.subscriptionState) && expiry > Date.now();
    if (valid && r.acknowledgementState !== 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED')
      await fetch(`${base}/subscriptions/${b.sku}/tokens/${encodeURIComponent(b.token)}:acknowledge`, {method:'POST', headers:{authorization:'Bearer ' + at, 'content-type':'application/json'}, body:'{}'});
  } else {
    const r = await (await fetch(`${base}/products/${b.sku}/tokens/${encodeURIComponent(b.token)}`, {headers:{authorization:'Bearer ' + at}})).json();
    valid = r.purchaseState === 0;                                   // 0 = purchased
    if (valid && r.acknowledgementState === 0)
      await fetch(`${base}/products/${b.sku}/tokens/${encodeURIComponent(b.token)}:acknowledge`, {method:'POST', headers:{authorization:'Bearer ' + at, 'content-type':'application/json'}, body:'{}'});
  }
  await db.prepare('INSERT INTO purchases(token,pid,sku,type,t,state,expiry) VALUES(?,?,?,?,?,?,?) ON CONFLICT(token) DO UPDATE SET state=excluded.state, expiry=excluded.expiry')
    .bind(b.token, b.pid, b.sku, b.type, Date.now(), valid ? 'ok' : 'bad', expiry).run();
  return {valid, expiry: expiry || undefined};
}

// OAuth token for the Play Developer API, signed with the service-account key (RS256, WebCrypto)
let tokCache = {t:0, v:''};
async function gToken(env) {
  if (tokCache.t > Date.now() + 60e3) return tokCache.v;
  const sa = JSON.parse(env.GOOGLE_SA), now = Math.floor(Date.now() / 1000);
  const enc = o => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsigned = enc({alg:'RS256', typ:'JWT'}) + '.' + enc({iss:sa.client_email, scope:'https://www.googleapis.com/auth/androidpublisher', aud:'https://oauth2.googleapis.com/token', iat:now, exp:now + 3600});
  const pem = sa.private_key.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const key = await crypto.subtle.importKey('pkcs8', Uint8Array.from(atob(pem), c => c.charCodeAt(0)), {name:'RSASSA-PKCS1-v1_5', hash:'SHA-256'}, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned)));
  const jwt = unsigned + '.' + btoa(String.fromCharCode(...sig)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const r = await (await fetch('https://oauth2.googleapis.com/token', {method:'POST', headers:{'content-type':'application/x-www-form-urlencoded'}, body:'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt})).json();
  tokCache = {t:Date.now() + (r.expires_in || 3000) * 1000, v:r.access_token};
  return r.access_token;
}

// ------------------------------------------------------------------ admin page (open it on your phone)
async function admin(url, env) {
  if (!env.ADMIN_KEY || url.searchParams.get('key') !== env.ADMIN_KEY) return new Response('no', {status:403});
  const db = env.DB, k = encodeURIComponent(env.ADMIN_KEY);
  const act = url.searchParams.get('unban');
  if (act) { await db.prepare('UPDATE players SET banned=0, score=0, reason=? WHERE pid=?').bind('unbanned by admin', act).run(); return Response.redirect(url.origin + '/admin?key=' + k, 302); }
  const ban = url.searchParams.get('ban');
  if (ban) { await db.prepare('UPDATE players SET banned=1, score=999, reason=? WHERE pid=?').bind('banned by admin', ban).run(); return Response.redirect(url.origin + '/admin?key=' + k, 302); }
  const tot = await db.prepare('SELECT COUNT(*) n, SUM(last>?) d FROM players').bind(Date.now() - 864e5).first();
  const bad = (await db.prepare('SELECT * FROM players WHERE score>0 ORDER BY banned DESC, score DESC LIMIT 100').all()).results;
  const ev = (await db.prepare('SELECT * FROM events ORDER BY t DESC LIMIT 40').all()).results;
  const buys = await db.prepare("SELECT COUNT(*) n FROM purchases WHERE state='ok'").first();
  const esc = s => String(s ?? '').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
  const d = t => new Date(t).toISOString().slice(5, 16).replace('T', ' ');
  const html = `<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><title>Torque Guard</title>
<style>body{font-family:system-ui;background:#0b1019;color:#eee;margin:0;padding:12px}h1{color:#ffd54a;font-size:22px}.c{background:#141c2b;border:1px solid #e0a82e55;border-radius:12px;padding:10px;margin:8px 0;font-size:13px}.b{color:#ff8a80}.f{color:#ffd54a}a{color:#9fd3ff}small{color:#9fb0c0}</style>
<h1>🛡️ Torque Guard</h1><div class=c>Players: <b>${tot.n}</b> · active 24h: <b>${tot.d || 0}</b> · purchases OK: <b>${buys.n}</b></div>
<h3>Flagged / banned</h3>${bad.map(p => `<div class=c><b class="${p.banned ? 'b' : 'f'}">${p.banned ? '🚫 BANNED' : '⚠️ score ' + p.score}</b> · <small>${esc(p.pid)}</small><br>${esc(p.reason)}<br><small>flags: ${esc(p.flags)} · money ${p.money} · lv ${p.lv} · stage ${p.best} · last ${d(p.last)}</small><br>${p.banned ? `<a href="?key=${k}&unban=${encodeURIComponent(p.pid)}">✅ unban</a>` : `<a href="?key=${k}&ban=${encodeURIComponent(p.pid)}">🚫 ban</a> · <a href="?key=${k}&unban=${encodeURIComponent(p.pid)}">clear</a>`}</div>`).join('') || '<div class=c>Nobody flagged 👍</div>'}
<h3>Last events</h3>${ev.map(e => `<div class=c><small>${d(e.t)} · ${esc(e.kind)} · ${esc(e.pid).slice(0, 10)}</small><br>${esc(e.detail)}</div>`).join('')}`;
  return new Response(html, {headers:{'content-type':'text/html;charset=utf-8'}});
}
