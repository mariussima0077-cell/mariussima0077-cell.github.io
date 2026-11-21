// TORQUE GUARD – the online anti-cheat bot for Torque Empire (Cloudflare Worker + D1 database).
// Runs 24/7 on Cloudflare for free:
//   • POST /api/report    – the game checks in every few minutes; every report is compared with the previous one
//   • POST /api/purchase  – checks a Google Play purchase with Google and ACKNOWLEDGES it (needed, or Google refunds after 3 days)
//   • cron every 10 min   – scans all players again over 24 h, bans cheaters, finds shared purchase tokens, cleans old data
//   • GET  /admin?key=…   – your page (works on the phone): flagged / banned players, unban button
//   • POST /api/on/*     – v16-45 ONLINE: profiles, live ranking, chat (auto-translated), Arena PvP, Torque Cup (server/online.js)
//   • POST /api/xfer/put|get – moving the game from the old Chrome (TWA) version into the new app: the app makes a secret
//                           key, the Chrome page uploads the save under it, the app downloads it ONCE (kept max 30 min)
//   • GET  /admin/chat?key=… – chat moderation (delete, mute, reset name)
//   • POST /api/cloud/*   – Google sign-in + cloud save (login / save / load / delete). Only a HASH of the Google account ID
//                           is stored – never the e-mail or the name. Table `accounts` is created by itself.
// Secrets (Settings → Variables): ADMIN_KEY, SAVE_SALT, GOOGLE_SA (service account JSON), PACKAGE_NAME (e.g. com.torqueempire.game)

import {online, onlineCron, onlineAdmin} from './online.js';

// v16-70: players who got VIP as a gift from Marius (personal Mail in the game) – their VIP jump is not cheating
const GIFT_VIP = ['160672a2'];
const isGift = pid => GIFT_VIP.some(g => String(pid).startsWith(g));
// v16-71: Alex was banned by mistake for the gift (VIP 20 jump) → unbanned automatically at his next check-in (only until this date)
const GIFT_UNBAN_UNTIL = Date.parse('2026-11-24T00:00:00Z');
const TESTER_UNBAN = ['03245000-cda3-4e5c-9e6d-d388955218a8'];   // v16-103: one-time unban (Wazza4ever)
const BAN_AT = 100;                          // suspicion points that trigger an automatic ban
const FLAG_PTS = {edited_save:60, speed_hack:45, money_jump:35, ticket_jump:30, gear_ticket_jump:30, vip_jump:35, clock_back:20,
  mem_edit:100, unpaid_pack:100};   // v16-104: memory editor (GameGuardian…) · pack used without a purchase confirmed by Google (Lucky Patcher…)
// v16-104: pack key in the game → product ID in Play Console (same as SKU in secure.js; consumables are not checked)
const PACK_SKU = {car:'vip_car', vip:'vip_mechanic', spd2:'battle_speed_x2', sub:'vip_pass_monthly', plat:'vip_pass_platinum',
  p1:'pack_starter', p2:'pack_rookie', p3:'pack_pro', p4:'pack_elite', fn:'fund_normal', fh:'fund_hard'};
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
      if (url.pathname.startsWith('/api/cloud/') && req.method === 'POST') { const op = url.pathname.slice(11), b = await req.json();
        if (op === 'save' && !(await integOk(env, b && b.pid))) return json({err:'integrity'});
        return json(await cloud(op, b, env)); }
      if (url.pathname === '/api/integrity' && req.method === 'POST') return json(await integrity(await req.json(), env));
      if (url.pathname.startsWith('/api/on/') && req.method === 'POST') { const op = url.pathname.slice(8), b = await req.json();
        if (INTEG_OPS.includes(op) && !(await integOk(env, b && b.pid))) return json({err:'integrity'});   // v16-105: only when INTEGRITY = 'enforce'
        return json(await online(op, b, env)); }
      if (url.pathname.startsWith('/api/xfer/') && req.method === 'POST') return json(await xfer(url.pathname.slice(10), await req.json(), env));
      if (url.pathname === '/admin/chat') return env.ADMIN_KEY && url.searchParams.get('key') === env.ADMIN_KEY ? onlineAdmin(url, env) : new Response('no', {status:403});
      if (url.pathname === '/admin') return admin(url, env);
      if (url.pathname === '/') return json({ok:true, name:'Torque Guard', time:Date.now()});
      if (url.pathname === '/api/diag') return json(await diag(env));   // v16-82: is the Play API reachable? (no secrets in the answer)
      return json({err:'not found'}, 404);
    } catch (e) { return json({err:String(e)}, 500); }
  },
  async scheduled(ev, env, ctx) { ctx.waitUntil(scan(env)); ctx.waitUntil(onlineCron(env)); }
};

// ------------------------------------------------------------------ report
async function report(b, env) {
  const now = Date.now();
  if (!b || typeof b.pid !== 'string' || b.pid.length > 64 || !b.s) return {err:'bad'};
  if (b.pid.startsWith('tst_')) return {ok:true, test:1, serverTime:now};   // v16-91: owner's FULL TEST ACCOUNT – not judged, not stored
  const s = b.s, db = env.DB;
  const old = await db.prepare('SELECT * FROM players WHERE pid=?').bind(b.pid).first();
  if (old && old.banned && isGift(b.pid) && now < GIFT_UNBAN_UNTIL && !/by admin/.test(old.reason || '')) {
    await db.prepare('UPDATE players SET banned=0, score=0, reason=? WHERE pid=?').bind('unbanned: gift VIP (v16-71)', b.pid).run();
    await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind(b.pid, now, 'unban', 'gift VIP – banned by mistake').run();
    old.banned = 0; old.score = 0;
  }
  // v16-103 (Marius, 20 nov): tester Wazza4ever (found the cloud-save re-roll, fixed in v16-102) – unbanned ONCE at his next check-in.
  // If he gets banned again later, the ban stays (the 'unban' event below is written only once).
  if (old && old.banned && TESTER_UNBAN.includes(b.pid) && !/by admin/.test(old.reason || '')) {
    const done = await db.prepare("SELECT 1 FROM events WHERE pid=? AND kind='unban' AND detail LIKE 'tester%'").bind(b.pid).first();
    if (!done) {
      await db.prepare('UPDATE players SET banned=0, score=0, reason=? WHERE pid=?').bind('unbanned: tester (v16-103)', b.pid).run();
      await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind(b.pid, now, 'unban', 'tester – found the re-roll bug').run();
      old.banned = 0; old.score = 0;
    }
  }
  let pts = 0; const why = [];
  // 0) v16-104: packs without a purchase confirmed by Google (only in the Play app; the browser test mode is free on purpose)
  let pkCheck = false;
  if (b.app && Array.isArray(b.pk) && b.pk.length && !isGift(b.pid) && !(old && old.banned)) {
    const ids = [...new Set([b.pid, ...(Array.isArray(b.pids) ? b.pids : [])].filter(x => typeof x === 'string' && x.length <= 64))].slice(0, 6);
    const got = new Set((await db.prepare(`SELECT DISTINCT p.sku FROM purchase_use u JOIN purchases p ON p.token=u.token WHERE p.state='ok' AND u.pid IN (${ids.map(() => '?').join(',')})`).bind(...ids).all()).results.map(r => r.sku));
    const miss = b.pk.filter(k => PACK_SKU[k] && !got.has(PACK_SKU[k]));
    if (miss.length) {
      // first time: the game is asked to send its Google Play purchases again (new phone / cloud load / app closed during payment)
      const ask = await db.prepare("SELECT t FROM events WHERE pid=? AND kind='pkask' ORDER BY t DESC LIMIT 1").bind(b.pid).first();
      if (!ask) { await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind(b.pid, now, 'pkask', miss.join(',')).run(); pkCheck = true; }
      else if (now - ask.t > 15 * 60e3) { b.flags = [...(b.flags || []), 'unpaid_pack']; why.push('no Google purchase for: ' + miss.join(',')); }
      else pkCheck = true;
    }
  }
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
    if (s.vip - old.vip > 200 + dt * 160 / 86400 && !isGift(b.pid)) { pts += 35; why.push(`vip +${s.vip - old.vip}`); }
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
  return {ok:true, serverTime:now, banned:!!banned, pkCheck: pkCheck && !banned, msg: banned ? 'Our anti-cheat system found impossible changes in this game (edited save, money/ticket hack or speed hack).' : undefined};
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
    if (r.v1 - r.v0 > 400 && !isGift(p.pid)) why.push('24h VIP points too high');
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
  // d) cloud saves not used for 2 years are deleted (as written in the privacy policy)
  await ensureCloud(env); await db.prepare('DELETE FROM accounts WHERE t<?').bind(now - 730 * day).run();
}

// ------------------------------------------------------------------ v16-105: Google Play Integrity
// The Play app (TEIntegrity.java) asks Google for a token; we ask Google what it means:
//   app  = PLAY_RECOGNIZED → the real app from Google Play (not a modded APK / Lucky Patcher copy)
//   dev  = MEETS_DEVICE_INTEGRITY → a real phone, not rooted, not an emulator
//   lic  = LICENSED → installed from Google Play by this Google account
// Mode = variable INTEGRITY in wrangler.toml: 'log' (only written down, shown on /admin) or 'enforce'
// (online modes + cloud save only for players with a good result in the last 3 days; the browser and old apps are refused).
const INTEG_OPS = ['sync', 'fight', 'refresh', 'wbhit', 'evsc', 'say', 'prof'];
let integReady = false;
async function ensureInteg(env) {
  if (integReady) return;
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS integ(pid TEXT PRIMARY KEY, t INTEGER, app TEXT, dev TEXT, lic TEXT, ok INTEGER, err TEXT)').run();
  integReady = true;
}
async function integOk(env, pid) {
  if (env.INTEGRITY !== 'enforce') return true;
  if (typeof pid !== 'string' || pid.startsWith('tst_')) return true;            // the owner's test account
  await ensureInteg(env);
  const r = await env.DB.prepare('SELECT t, ok FROM integ WHERE pid=?').bind(pid).first();
  return !!(r && r.ok && Date.now() - r.t < 3 * 864e5);
}
async function integrity(b, env) {
  await ensureInteg(env); const db = env.DB, now = Date.now();
  if (!b || typeof b.pid !== 'string' || b.pid.length > 64) return {err:'bad'};
  const save = (app, dev, lic, ok, err) => db.prepare('INSERT INTO integ(pid,t,app,dev,lic,ok,err) VALUES(?,?,?,?,?,?,?) ON CONFLICT(pid) DO UPDATE SET t=?2,app=?3,dev=?4,lic=?5,ok=?6,err=?7')
    .bind(b.pid, now, app, dev, lic, ok ? 1 : 0, err ? String(err).slice(0, 200) : null).run();
  // v16-120: no token (old app 106, plugin error) → ok:false, so the phone does NOT wait 12 h and asks again at the next start
  // (after updating to 107 the check runs right away instead of up to 12 h later)
  if (!b.token) { await save('', '', '', 0, 'no token: ' + (b.err || '?')); return {ok:false, good:false}; }
  let p;
  try {
    const r = await fetch(`https://playintegrity.googleapis.com/v1/${env.PACKAGE_NAME}:decodeIntegrityToken`, {method:'POST',
      headers:{authorization:'Bearer ' + await gToken(env), 'content-type':'application/json'}, body:JSON.stringify({integrity_token:String(b.token)})});
    const j = await r.json(); p = j.tokenPayloadExternal;
    if (!p) { await save('', '', '', 0, 'google: ' + JSON.stringify(j.error || j).slice(0, 180)); return {ok:true, good:false}; }
  } catch (e) { return {err:'google'}; }
  const rq = p.requestDetails || {}, ai = p.appIntegrity || {}, di = p.deviceIntegrity || {}, ad = p.accountDetails || {};
  const app = ai.appRecognitionVerdict || '', dev = (di.deviceRecognitionVerdict || []).join(','), lic = ad.appLicensingVerdict || '';
  const fresh = rq.nonce === b.nonce && String(b.nonce).includes(b.pid.replace(/[^A-Za-z0-9]/g, '').slice(0, 12)) && Math.abs(now - (+rq.timestampMillis || 0)) < 10 * 60e3 && rq.requestPackageName === env.PACKAGE_NAME;
  const good = fresh && app === 'PLAY_RECOGNIZED' && dev.includes('MEETS_DEVICE_INTEGRITY') && lic !== 'UNLICENSED';
  await save(app, dev, lic, good, fresh ? null : 'old or foreign token');
  if (!good) await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind(b.pid, now, 'integ', `app=${app} dev=${dev || 'none'} lic=${lic}${fresh ? '' : ' stale'}`).run();
  return {ok:true, good};
}

// ------------------------------------------------------------------ Google sign-in + cloud save
let cloudReady = false;
async function ensureCloud(env) {
  if (cloudReady) return;
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS accounts(uid TEXT PRIMARY KEY, sess TEXT UNIQUE, pid TEXT, created INTEGER, t INTEGER, save TEXT, sig TEXT, sum TEXT)').run();
  cloudReady = true;
}
const b64u = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));
let jwks = {t:0, keys:[]};
async function googleUser(cred, env) {                // checks the Google ID token (signature, audience, expiry)
  if (!env.GOOGLE_CLIENT_ID) throw new Error('GOOGLE_CLIENT_ID not set');
  const [h, p, sg] = String(cred).split('.');
  const head = JSON.parse(new TextDecoder().decode(b64u(h))), pay = JSON.parse(new TextDecoder().decode(b64u(p)));
  if (jwks.t < Date.now() || !jwks.keys.find(k => k.kid === head.kid)) jwks = {t:Date.now() + 6 * 3600e3, keys:(await (await fetch('https://www.googleapis.com/oauth2/v3/certs')).json()).keys};
  const jwk = jwks.keys.find(k => k.kid === head.kid); if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, {name:'RSASSA-PKCS1-v1_5', hash:'SHA-256'}, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64u(sg), new TextEncoder().encode(h + '.' + p));
  if (!ok || pay.aud !== env.GOOGLE_CLIENT_ID || !['accounts.google.com', 'https://accounts.google.com'].includes(pay.iss) || pay.exp * 1000 < Date.now()) return null;
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('te-acc:' + pay.sub)));
  return [...d].map(x => x.toString(16).padStart(2, '0')).join('');   // we keep only this hash
}
async function cloud(op, b, env) {
  await ensureCloud(env); const db = env.DB, now = Date.now();
  if (op === 'login') {
    const gid = await googleUser(b.cred, env); if (!gid) return {err:'bad_token'};
    const srv = Math.max(1, Math.min(99, parseInt(b.srv) || 1));      // v16-44: one cloud save per Google account PER SERVER (S1 keeps the old key)
    const uid = srv > 1 ? gid + '#s' + srv : gid;
    let a = await db.prepare('SELECT uid,sess,pid,t,sum FROM accounts WHERE uid=?').bind(uid).first();
    if (!a) { const sess = crypto.randomUUID() + crypto.randomUUID();
      await db.prepare('INSERT INTO accounts(uid,sess,pid,created,t) VALUES(?,?,?,?,0)').bind(uid, sess, String(b.pid || '').slice(0, 64), now).run();
      a = {sess, pid:b.pid, t:0, sum:null}; }
    return {ok:true, sess:a.sess, pid:a.pid, t:a.t, sum:a.sum ? JSON.parse(a.sum) : null};
  }
  const a = b && typeof b.sess === 'string' ? await db.prepare('SELECT uid,pid,t,sum FROM accounts WHERE sess=?').bind(b.sess).first() : null;
  if (!a) return {err:'signed_out'};
  if (op === 'meta') return {ok:true, pid:a.pid, t:a.t, sum:a.sum ? JSON.parse(a.sum) : null};
  if (op === 'load') { const r = await db.prepare('SELECT save,sig,pid,t,sum FROM accounts WHERE uid=?').bind(a.uid).first(); return {ok:true, ...r, sum:r.sum ? JSON.parse(r.sum) : null}; }
  if (op === 'delete') { await db.prepare('DELETE FROM accounts WHERE uid=?').bind(a.uid).run(); return {ok:true}; }
  if (op === 'save') {
    if (typeof b.save !== 'string' || b.save.length > 300000 || typeof b.pid !== 'string' || b.pid.length > 64) return {err:'bad'};
    const p = await db.prepare('SELECT banned FROM players WHERE pid=?').bind(b.pid).first();
    if (p && p.banned) return {err:'banned'};
    if (b.base !== undefined && b.base !== a.t && a.t) return {err:'conflict', t:a.t, sum:a.sum ? JSON.parse(a.sum) : null};  // another phone saved meanwhile
    await db.prepare('UPDATE accounts SET save=?, sig=?, pid=?, t=?, sum=? WHERE uid=?').bind(b.save, String(b.sig || '').slice(0, 64), b.pid, now, JSON.stringify(b.sum || {}).slice(0, 2000), a.uid).run();
    return {ok:true, t:now};
  }
  return {err:'not found'};
}

// ------------------------------------------------------------------ transfer from the Chrome (TWA) version to the app
let xferReady = false;
async function xfer(op, b, env) {
  const db = env.DB, now = Date.now();
  if (!xferReady) { await db.prepare('CREATE TABLE IF NOT EXISTS xfer(k TEXT PRIMARY KEY, data TEXT, t INTEGER)').run(); xferReady = true; }
  if (!b || typeof b.k !== 'string' || !/^[A-Za-z0-9]{24,64}$/.test(b.k)) return {err:'bad'};
  await db.prepare('DELETE FROM xfer WHERE t<?').bind(now - 30 * 60e3).run();
  if (op === 'put') {
    if (typeof b.data !== 'string' || b.data.length > 600000) return {err:'bad'};
    await db.prepare('INSERT INTO xfer(k,data,t) VALUES(?,?,?) ON CONFLICT(k) DO UPDATE SET data=excluded.data, t=excluded.t').bind(b.k, b.data, now).run();
    return {ok:true};
  }
  if (op === 'get') {
    const r = await db.prepare('SELECT data FROM xfer WHERE k=?').bind(b.k).first();
    if (!r) return {ok:true, wait:true};
    await db.prepare('DELETE FROM xfer WHERE k=?').bind(b.k).run();
    return {ok:true, data:r.data};
  }
  return {err:'not found'};
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

// v16-82: checks the Google side of /api/purchase with a fake token → shows Google's error text
// ("invalid token" = all good; "insufficient permissions" = the service account has no access yet)
async function diag(env) {
  const out = {pkg: env.PACKAGE_NAME || null, sa: !!env.GOOGLE_SA};
  try { const at = await gToken(env); out.token = !!at;
    const r = await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${env.PACKAGE_NAME}/purchases/products/pack_starter/tokens/diag-fake-token`, {headers:{authorization:'Bearer ' + at}});
    const j = await r.json().catch(() => ({})); out.status = r.status; out.google = (j.error && j.error.message) || 'ok';
    // v16-105: Play Integrity reachable? A fake token must give 'invalid token' (= all good), not 'permission denied'
    const ri = await fetch(`https://playintegrity.googleapis.com/v1/${env.PACKAGE_NAME}:decodeIntegrityToken`, {method:'POST', headers:{authorization:'Bearer ' + at, 'content-type':'application/json'}, body:'{"integrity_token":"diag-fake-token"}'});
    const ji = await ri.json().catch(() => ({})); out.integrity = {status:ri.status, google:(ji.error && ji.error.message) || 'ok', mode:env.INTEGRITY || 'log'};
    const q = await env.DB.prepare("SELECT sku,type,state,t FROM purchases ORDER BY t DESC LIMIT 5").all(); out.last = (q.results || []).map(x => ({sku:x.sku, type:x.type, state:x.state, t:new Date(x.t).toISOString()}));
  } catch (e) { out.err = String(e).slice(0, 200); }
  return out;
}

// OAuth token for the Play Developer API, signed with the service-account key (RS256, WebCrypto)
let tokCache = {t:0, v:''};
async function gToken(env) {
  if (tokCache.t > Date.now() + 60e3) return tokCache.v;
  const sa = JSON.parse(env.GOOGLE_SA), now = Math.floor(Date.now() / 1000);
  const enc = o => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsigned = enc({alg:'RS256', typ:'JWT'}) + '.' + enc({iss:sa.client_email, scope:'https://www.googleapis.com/auth/androidpublisher https://www.googleapis.com/auth/playintegrity', aud:'https://oauth2.googleapis.com/token', iat:now, exp:now + 3600});
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
  const del = url.searchParams.get('delete');          // "Delete my data" e-mail: /admin?key=…&delete=PLAYER_ID (first 8 characters are enough)
  if (del && del.length >= 8) { await ensureCloud(env); const like = del + '%';
    await db.prepare('DELETE FROM accounts WHERE pid LIKE ?').bind(like).run(); await db.prepare('DELETE FROM snaps WHERE pid LIKE ?').bind(like).run();
    await db.prepare('DELETE FROM events WHERE pid LIKE ?').bind(like).run(); try { for (const r of (await db.prepare('SELECT uid FROM prof WHERE pid LIKE ?').bind(like).all()).results) for (const q of ['DELETE FROM chat WHERE uid=?','DELETE FROM arena WHERE uid=?','DELETE FROM inbox WHERE uid=?','DELETE FROM creps WHERE uid=?']) await db.prepare(q).bind(r.uid).run();
    await db.prepare('DELETE FROM prof WHERE pid LIKE ?').bind(like).run(); } catch (e) {}   // v16-45: online profile, chat messages, Arena await db.prepare('DELETE FROM players WHERE pid LIKE ? AND banned=0').bind(like).run();
    return new Response('deleted ' + del, {headers:{'content-type':'text/plain'}}); }
  const ban = url.searchParams.get('ban');
  if (ban) { await db.prepare('UPDATE players SET banned=1, score=999, reason=? WHERE pid=?').bind('banned by admin', ban).run(); return Response.redirect(url.origin + '/admin?key=' + k, 302); }
  const tot = await db.prepare('SELECT COUNT(*) n, SUM(last>?) d FROM players').bind(Date.now() - 864e5).first();
  const bad = (await db.prepare('SELECT * FROM players WHERE score>0 ORDER BY banned DESC, score DESC LIMIT 100').all()).results;
  const ev = (await db.prepare('SELECT * FROM events ORDER BY t DESC LIMIT 40').all()).results;
  const buys = await db.prepare("SELECT COUNT(*) n FROM purchases WHERE state='ok'").first();
  await ensureInteg(env); const ig = await db.prepare('SELECT COUNT(*) n, SUM(ok) g FROM integ WHERE t>?').bind(Date.now() - 3 * 864e5).first();
  // v16-120: WHY phones fail Play Integrity (reason → count) + the last 15 checks
  const igr = (await db.prepare(`SELECT CASE WHEN ok=1 THEN '✅ OK' WHEN err IS NOT NULL AND err<>'old or foreign token' THEN err
      ELSE 'app=' || COALESCE(NULLIF(app,''),'-') || ' dev=' || COALESCE(NULLIF(dev,''),'none') || ' lic=' || COALESCE(NULLIF(lic,''),'-') || CASE WHEN err IS NULL THEN '' ELSE ' · ' || err END END r,
      COUNT(*) n FROM integ WHERE t>? GROUP BY r ORDER BY n DESC LIMIT 20`).bind(Date.now() - 3 * 864e5).all()).results;
  const igl = (await db.prepare('SELECT pid,t,app,dev,lic,ok,err FROM integ ORDER BY t DESC LIMIT 15').all()).results;
  const esc = s => String(s ?? '').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
  const d = t => new Date(t).toISOString().slice(5, 16).replace('T', ' ');
  const html = `<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><title>Torque Guard</title>
<style>body{font-family:system-ui;background:#0b1019;color:#eee;margin:0;padding:12px}h1{color:#ffd54a;font-size:22px}.c{background:#141c2b;border:1px solid #e0a82e55;border-radius:12px;padding:10px;margin:8px 0;font-size:13px}.b{color:#ff8a80}.f{color:#ffd54a}a{color:#9fd3ff}small{color:#9fb0c0}</style>
<h1>🛡️ Torque Guard</h1><div class=c><a href="/admin/chat?key=${k}">💬 Chat moderation →</a></div><div class=c>Players: <b>${tot.n}</b> · active 24h: <b>${tot.d || 0}</b> · purchases OK: <b>${buys.n}</b><br>🔒 Play Integrity (${esc(env.INTEGRITY || 'log')}): <b>${ig.g || 0}</b> OK of <b>${ig.n || 0}</b> phones (3 days)</div>
<h3>🔒 Play Integrity – why (3 days)</h3><div class=c>${igr.map(r => `<b>${r.n}</b> × ${esc(r.r)}`).join('<br>') || 'no checks yet'}</div>
<details class=c><summary>Last 15 checks</summary>${igl.map(r => `<small>${d(r.t)} · ${esc(r.pid).slice(0, 10)}</small> ${r.ok ? '✅' : '❌'} ${esc(r.err || `app=${r.app} dev=${r.dev || 'none'} lic=${r.lic}`)}`).join('<br>')}</details>
<h3>Flagged / banned</h3>${bad.map(p => `<div class=c><b class="${p.banned ? 'b' : 'f'}">${p.banned ? '🚫 BANNED' : '⚠️ score ' + p.score}</b> · <small>${esc(p.pid)}</small><br>${esc(p.reason)}<br><small>flags: ${esc(p.flags)} · money ${p.money} · lv ${p.lv} · stage ${p.best} · last ${d(p.last)}</small><br>${p.banned ? `<a href="?key=${k}&unban=${encodeURIComponent(p.pid)}">✅ unban</a>` : `<a href="?key=${k}&ban=${encodeURIComponent(p.pid)}">🚫 ban</a> · <a href="?key=${k}&unban=${encodeURIComponent(p.pid)}">clear</a>`}</div>`).join('') || '<div class=c>Nobody flagged 👍</div>'}
<h3>Last events</h3>${ev.map(e => `<div class=c><small>${d(e.t)} · ${esc(e.kind)} · ${esc(e.pid).slice(0, 10)}</small><br>${esc(e.detail)}</div>`).join('')}`;
  return new Response(html, {headers:{'content-type':'text/html;charset=utf-8'}});
}
