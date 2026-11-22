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

import {online, onlineCron, onlineAdmin, giftDm, isGiftDm} from './online.js';
import {EP_N, EP_H} from './ept.js';   // v16-157: enemy power of every campaign stage (made by tools/ept_table.py)

// v16-70: players who got VIP as a gift from Marius (personal Mail in the game) – their VIP jump is not cheating
const GIFT_VIP = ['160672a2'];
const isGift = pid => GIFT_VIP.some(g => String(pid).startsWith(g));
const LEGACY_T = Date.parse('2026-11-18T00:00:00Z');   // v16-125: before this, packs were free in the test versions
// v16-71: Alex was banned by mistake for the gift (VIP 20 jump) → unbanned automatically at his next check-in (only until this date)
const GIFT_UNBAN_UNTIL = Date.parse('2026-11-24T00:00:00Z');
const TESTER_UNBAN = ['03245000-cda3-4e5c-9e6d-d388955218a8'];   // v16-103: one-time unban (Wazza4ever)
// v16-162: personal diamond gifts (GIFT_DM, giftDm, isGiftDm) live in online.js – sent at check-in AND at online sync
const PARTS_T = Date.parse('2026-11-21T00:00:00Z');   // v16-129: garages upgraded with parts (buildings rule recalibrated in v16-150)
const BAN_AT = 100;                          // suspicion points that trigger an automatic ban
const FLAG_PTS = {edited_save:60, speed_hack:45, money_jump:35, ticket_jump:30, gear_ticket_jump:30, vip_jump:35, clock_back:20,
  mem_edit:100, unpaid_pack:100, honeypot:100};   // v16-157: honeypot = a bait value that only a cheat tool can change
// ------------------------------------------------------------------ v16-157 SMARTER GUARD (Marius, 22 nov 2026)
// Every warning belongs to a KIND of sign. An automatic BAN needs score ≥ BAN_AT AND (a PROOF or 2 different kinds).
// One kind only (e.g. only 'campaign too fast') → SHADOW (hidden): the player keeps playing but is out of every ranking,
// Arena / Rail Wars opponent list and prize – he does not see it, so he does not make a new account. Marius decides in /admin.
const SHADOW_AT = 60;
const KIND = {mem_edit:'proof', honeypot:'proof', unpaid_pack:'proof', impossible:'proof', edited_save:'save', speed_hack:'speed', clock_back:'clock',
  money_jump:'econ', ticket_jump:'econ', gear_ticket_jump:'econ', vip_jump:'econ'};
const kindsOf = s => new Set(String(s || '').split(',').filter(Boolean));
const canBan = k => k.has('proof') || k.size >= 2;
// fastest possible campaign stage: ~5 s of fight at speed ×1 → ~1.7 s at ×3, + 3 s AUTO NEXT countdown (tested with sims, v16-157)
const STAGE_MIN_S = 4, RCPT_MIN_MS = 1200;
// power: in simulations a team never won when the monsters were 2× stronger → only ×3.5 or more counts (manual skills, luck)
const POWER_BAD = 3.5, POWER_NOTE = 2.5;
let gReady = false;
async function ensureG(env) {
  if (gReady) return; const db = env.DB;
  for (const q of ['ALTER TABLE players ADD COLUMN bmax INTEGER DEFAULT 0', 'ALTER TABLE players ADD COLUMN shadow INTEGER DEFAULT 0',
    'ALTER TABLE players ADD COLUMN sig TEXT', 'ALTER TABLE players ADD COLUMN pw INTEGER DEFAULT 0', 'ALTER TABLE players ADD COLUMN dk TEXT',
    'ALTER TABLE snaps ADD COLUMN pw INTEGER DEFAULT 0']) { try { await db.prepare(q).run(); } catch (e) {} }
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS devs(dk TEXT, pid TEXT, t INTEGER, PRIMARY KEY(dk, pid))'),
    db.prepare('CREATE INDEX IF NOT EXISTS devs_pid ON devs(pid, t)'),
    db.prepare('CREATE TABLE IF NOT EXISTS ledg(pid TEXT, day TEXT, b0 INTEGER, m INTEGER DEFAULT 0, dm INTEGER DEFAULT 0, tk INTEGER DEFAULT 0, ct INTEGER DEFAULT 0, gtk INTEGER DEFAULT 0, vip INTEGER DEFAULT 0, PRIMARY KEY(pid, day))'),
    db.prepare('CREATE TABLE IF NOT EXISTS rcpt(pid TEXT, t INTEGER, si INTEGER, h INTEGER, ms INTEGER, pw INTEGER, ep INTEGER, sp REAL, bad TEXT)'),
    db.prepare('CREATE INDEX IF NOT EXISTS rcpt_pid ON rcpt(pid, t)'),
  ]);
  gReady = true;
}
export {ensureG};   // v16-104: memory editor (GameGuardian…) · pack used without a purchase confirmed by Google (Lucky Patcher…)
// v16-104: pack key in the game → product ID in Play Console (same as SKU in secure.js; consumables are not checked)
const PACK_SKU = {car:'vip_car', vip:'vip_mechanic', spd2:'battle_speed_x2', sub:'vip_pass_monthly', plat:'vip_pass_platinum',
  p1:'pack_starter', p2:'pack_rookie', p3:'pack_pro', p4:'pack_elite', p5:'pack_master', p6:'pack_legend', p7:'pack_titan', fn:'fund_normal', fh:'fund_hard',
  dia:'vip_pass_diamond', fdr:'founder_pass'};   // v16-122
const json = (o, s=200) => new Response(JSON.stringify(o), {status:s, headers:{'content-type':'application/json','access-control-allow-origin':'*','access-control-allow-headers':'content-type'}});

// best possible income per second at a total building level (same model as the game, ×40 safety margin)
const capPerSec = lv => 40 * 172 * Math.pow(1.0168, lv);

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return json({});
    try {
      await ensureG(env);   // v16-157: new columns / tables (once per server start)
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
  async scheduled(ev, env, ctx) { await ensureG(env); ctx.waitUntil(scan(env)); ctx.waitUntil(onlineCron(env)); }
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
  // v16-162: personal diamond gift from Marius → one Mail in the game inbox (only once, needs the online profile)
  if (!(old && old.banned)) await giftDm(env, b.pid);
  let pts = 0; const why = [];
  // 0) v16-104: packs without a purchase confirmed by Google (only in the Play app; the browser test mode is free on purpose)
  let pkCheck = false;
  if (b.app && Array.isArray(b.pk) && b.pk.length && !isGift(b.pid) && !(old && old.banned)) {
    const ids = [...new Set([b.pid, ...(Array.isArray(b.pids) ? b.pids : [])].filter(x => typeof x === 'string' && x.length <= 64))].slice(0, 6);
    const got = new Set((await db.prepare(`SELECT DISTINCT p.sku FROM purchase_use u JOIN purchases p ON p.token=u.token WHERE p.state='ok' AND u.pid IN (${ids.map(() => '?').join(',')})`).bind(...ids).all()).results.map(r => r.sku));
    // v16-125: players from before the real Shop (18 nov 2026) got car / vip / sub / spd2 for free in the old test versions
    // (Marius' own account was banned for it) → those 4 are allowed for them; everything newer must be paid
    const legacy = old && old.first && old.first < LEGACY_T ? ['car', 'vip', 'sub', 'spd2'] : [];
    const miss = b.pk.filter(k => PACK_SKU[k] && !got.has(PACK_SKU[k]) && !legacy.includes(k));
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
  const kinds = kindsOf(old && old.sig); const add = (p, k, w) => { pts += p; if (k) kinds.add(k); why.push(w); };
  newFlags.forEach(f => { pts += FLAG_PTS[f]; kinds.add(KIND[f] || 'client'); why.push('client:' + f); });
  // v16-157: install key → same account on 2 phones at the same time (cloud save) = 'dual' (not cheating by itself, but its
  // numbers jump back and forth between the 2 phones → the progress rules must not count those jumps)
  const dk = typeof b.dk === 'string' && /^k[a-z0-9]{6,40}$/.test(b.dk) ? b.dk : null;
  let dual = false;
  if (dk) { await db.prepare('INSERT INTO devs(dk,pid,t) VALUES(?,?,?) ON CONFLICT(dk,pid) DO UPDATE SET t=excluded.t').bind(dk, b.pid, now).run();
    dual = !!(await db.prepare('SELECT 1 FROM devs WHERE pid=? AND dk<>? AND t>?').bind(b.pid, dk, now - 30 * 60e3).first());
    if (dual && !(await db.prepare("SELECT 1 FROM events WHERE pid=? AND kind='dual' AND t>?").bind(b.pid, now - 864e5).first()))
      await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind(b.pid, now, 'dual', 'same account on 2 phones at the same time (info only)').run(); }
  const bmaxOld = old ? Math.max(old.bmax || 0, old.best || 0) : 0, bmax = Math.max(bmaxOld, s.best | 0);
  // 2) impossible numbers
  if (s.mythic > 10 ||  /* v16-161: 6 Mythic heroes + 2 Mythic drivers + 2 Mythic guards (was 6 → a full collection could be flagged) */ s.heroes > 120 || s.stars > s.heroes * 50 || s.lv > 140 || s.best > 1500 || s.money < 0) { pts += 100; kinds.add('proof'); why.push('impossible_values'); }
  // 3) compared with the last report
  if (old) {
    const dt = Math.max(1, (now - old.last) / 1000);
    // v16-157: 2 phones on the same account report in turn → compare with the HIGHEST value of the last 24 h, not with the
    // other phone's lower number (that made fake jumps). A cheater gains nothing by faking a 2nd phone: the rules still apply.
    if (dual) { const mx = await db.prepare('SELECT MAX(money) money, MAX(tk) tk, MAX(vip) vip, MAX(lv) lv FROM snaps WHERE pid=? AND t>?').bind(b.pid, now - 864e5).first();
      if (mx) for (const f of ['money', 'tk', 'vip', 'lv']) old[f] = Math.max(old[f] || 0, mx[f] || 0); }
    const ps = capPerSec(Math.max(s.lv, old.lv));
    const capMoney = 600 * ps + ps * dt + 22 * 3600 * ps / 20;   // v16-122: + 3 Quick Idle (2 h each)     // + a full idle chest (max 14h at VIP 10)
    if (s.money - old.money > capMoney) add(40, 'econ', `money +${Math.round(s.money - old.money)} in ${Math.round(dt)}s`);
    // v16-122: purchases give VIP points (1 € = 20) → allow 2,100 per confirmed purchase since the last report
    const nb = old ? ((await db.prepare("SELECT COUNT(*) n FROM purchases WHERE pid=? AND state='ok' AND t>?").bind(b.pid, old.last - 6e5).first()) || {n:0}).n : 0;
    // v16-143: a confirmed purchase may bring up to 450 tickets (TITAN PACK)
    if (s.tk - old.tk > 100 + dt / 45 + nb * 450) add(30, 'econ', `tickets +${s.tk - old.tk}`);
    if (s.gtk - old.gtk > 100 + dt / 45 + nb * 450 && !dual) add(30, 'econ', `gear tickets +${s.gtk - old.gtk}`);
    if (s.vip - old.vip > 200 + dt * 160 / 86400 + nb * 2100 && !isGift(b.pid)) add(35, 'econ', `vip +${s.vip - old.vip}`);
    // v16-151 (Wazza4ever banned 22 nov): AUTO NEXT (v16-25) + battle speed x3 + a strong team clear easy stages in ~8 s each
    // while the game is just left ON → old limit (30 + 1 per 90 s) banned honest players. Now ~1 stage per 5 s, only 15 pts.
    // v16-157: compared with the BEST stage ever reported (not the last one: 2 phones / a cloud load made fake jumps, e.g. Wazza4ever
    // +42 on 22 nov) and with the FASTEST fight possible (AUTO NEXT + ×3 ≈ 1 stage per 4.7 s). Faster than that is impossible.
    const gain = bmax - bmaxOld;
    if (gain > 10 + dt / STAGE_MIN_S) add(40, 'speed', `campaign +${gain} stages in ${Math.round(dt)}s (faster than the fastest fight)`);
    // v16-150 (server): since v16-129 garages are upgraded with PARTS (LV1-10 = 40-350 parts, ~350 parts per new stage at stage 100,
    // + the parts gift for old saves) → +30 levels in one session is normal. Old rule (12 + 1 per 10 min, 30 pts) flagged honest testers.
    // Now: only a huge jump (most of the map at once) and only 15 pts (never a ban by itself; max total is ~140).
    if (s.lv - old.lv > 45 + dt / 120) add(15, 'prog', `buildings +${s.lv - old.lv} levels`);
    if (s.sold < old.sold || s.xp < old.xp) { /* new save / reinstall – allowed, just note it */ why.push('progress_reset'); }
  }
  // 4) v16-157 BATTLE RECEIPTS: team power vs. the monsters of that stage + duration of the fight
  let pwLast = old ? old.pw || 0 : 0;
  if (Array.isArray(b.rc) && b.rc.length) {
    let nPow = 0, nSpd = 0, worst = 0, wsi = 0; const rows = [];
    for (const r of b.rc.slice(-60)) {
      const si = r.si | 0, h = r.h ? 1 : 0, pw = Math.max(0, +r.pw || 0), ms = Math.max(0, r.ms | 0), sp = +r.sp || 1;
      if (si < 0 || si >= EP_N.length || !pw) continue;
      const ep = (h ? EP_H : EP_N)[si], ratio = ep / pw; const bad = [];
      if (ratio > POWER_BAD) { nPow++; bad.push('power'); } else if (ratio > POWER_NOTE) bad.push('close');
      if (ms > 0 && ms < RCPT_MIN_MS) { nSpd++; bad.push('fast'); }
      if (ratio > worst) { worst = ratio; wsi = (h ? 'H ' : '') + (Math.floor(si / 20) + 1) + '-' + (si % 20 + 1); }
      pwLast = pw; rows.push(db.prepare('INSERT INTO rcpt(pid,t,si,h,ms,pw,ep,sp,bad) VALUES(?,?,?,?,?,?,?,?,?)').bind(b.pid, +r.t || now, si, h, ms, Math.round(pw), ep, sp, bad.join(',') || null));
    }
    if (rows.length) await db.batch(rows);
    if (nPow) add(40, 'power', `won ${nPow} stage(s) with a team too weak (stage ${wsi}: monsters ×${worst.toFixed(1)} stronger)`);
    if (nSpd) add(30, 'speed', `${nSpd} fight(s) shorter than ${RCPT_MIN_MS / 1000}s`);
  }
  // 5) v16-157 LEDGER: what the game GAVE today. Diamonds: max ~10,000 a day free + 40 per new stage + 25,000 per purchase + mails
  if (b.lg && typeof b.lg === 'object') {
    const day = parisDay(now), g = k => Math.max(0, Math.min(2e9, Math.round(+b.lg[k] || 0)));
    await db.prepare(`INSERT INTO ledg(pid,day,b0,m,dm,tk,ct,gtk,vip) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(pid,day) DO UPDATE SET m=m+excluded.m, dm=dm+excluded.dm, tk=tk+excluded.tk, ct=ct+excluded.ct, gtk=gtk+excluded.gtk, vip=vip+excluded.vip`)
      .bind(b.pid, day, bmaxOld, g('m'), g('dm'), g('tk'), g('ct'), g('gtk'), g('vip')).run();
    const L = await db.prepare('SELECT * FROM ledg WHERE pid=? AND day=?').bind(b.pid, day).first();
    const nbD = ((await db.prepare("SELECT COUNT(*) n FROM purchases WHERE pid=? AND state='ok' AND t>?").bind(b.pid, now - 864e5).first()) || {n:0}).n;
    let mailDm = 0; try { const pr = await db.prepare('SELECT uid FROM prof WHERE pid=?').bind(b.pid).first();
      if (pr) for (const m of (await db.prepare('SELECT rw FROM inbox WHERE uid=? AND t>?').bind(pr.uid, now - 2 * 864e5).all()).results) mailDm += +(JSON.parse(m.rw || '{}').dm || 0); } catch (e) {}
    const capDm = 10000 + 40 * Math.max(0, bmax - (L.b0 || 0)) + 25000 * nbD + mailDm;
    if (L.dm > capDm && !isGift(b.pid) && !isGiftDm(b.pid) && !(await db.prepare("SELECT 1 FROM events WHERE pid=? AND t>? AND detail LIKE 'ledger:%'").bind(b.pid, now - 864e5).first()))
      add(25, 'econ', `ledger: +${L.dm} diamonds today (max possible ~${capDm})`);
  }
  const score = Math.min(999, (old ? old.score : 0) + pts);
  // v16-157: ban only with a PROOF or 2 different kinds of signs; otherwise hidden (shadow) from score SHADOW_AT
  const banned = old && old.banned ? 1 : (score >= BAN_AT && canBan(kinds) ? 1 : 0);
  const shadow = old && old.shadow === 2 ? 2 : (!banned && score >= SHADOW_AT ? 1 : old && old.shadow === 1 && score >= 30 ? 1 : 0);
  if (shadow === 1 && !(old && old.shadow)) why.push('→ hidden (shadow)');
  const flags = [...new Set([...(old && old.flags ? old.flags.split(',') : []), ...(b.flags || [])])].filter(Boolean).join(',');
  await db.prepare(`INSERT INTO players(pid,first,last,ver,app,money,sold,xp,vip,lv,best,tk,gtk,heroes,stars,mythic,score,banned,reason,flags,bmax,shadow,sig,pw,dk)
    VALUES(?1,?2,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24)
    ON CONFLICT(pid) DO UPDATE SET last=?2,ver=?3,app=?4,money=?5,sold=?6,xp=?7,vip=?8,lv=?9,best=?10,tk=?11,gtk=?12,heroes=?13,stars=?14,mythic=?15,score=?16,banned=?17,reason=COALESCE(?18,reason),flags=?19,bmax=?20,shadow=?21,sig=?22,pw=?23,dk=COALESCE(?24,dk)`)
    .bind(b.pid, now, b.v | 0, b.app | 0, s.money | 0, s.sold | 0, s.xp | 0, s.vip | 0, s.lv | 0, s.best | 0, s.tk | 0, s.gtk | 0, s.heroes | 0, s.stars | 0, s.mythic | 0, score, banned, why.length && pts ? why.join(' · ') : null, flags, bmax, shadow, [...kinds].join(',') || null, Math.round(pwLast) || 0, dk).run();
  await db.prepare('INSERT INTO snaps(pid,t,money,lv,tk,vip,best,pw) VALUES(?,?,?,?,?,?,?,?)').bind(b.pid, now, s.money | 0, s.lv | 0, s.tk | 0, s.vip | 0, s.best | 0, Math.round(pwLast) || 0).run();
  if (pts) await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind(b.pid, now, banned ? 'ban' : 'flag', why.join(' · ')).run();
  try { await ensureStats(env); await db.prepare('INSERT OR IGNORE INTO seen(day,pid) VALUES(?,?)').bind(parisDay(now), b.pid).run(); } catch (e) {}   // daily stats: who played on which day
  return {ok:true, serverTime:now, banned:!!banned, pkCheck: pkCheck && !banned, msg: banned ? 'Our anti-cheat system found impossible changes in this game (edited save, money/ticket hack or speed hack).' : undefined};
}

// ------------------------------------------------------------------ the bot: runs every 10 minutes
async function scan(env) {
  const db = env.DB, now = Date.now(), day = 864e5;
  // a) 24-hour check: total money earned over a day must be possible with the player's buildings
  const rows = (await db.prepare('SELECT pid,lv,score,banned,sig,shadow FROM players WHERE last>? AND banned=0').bind(now - day).all()).results;
  for (const p of rows) {
    const r = await db.prepare('SELECT MIN(t) t0, MAX(t) t1, MIN(money) m0, MAX(money) m1, MIN(vip) v0, MAX(vip) v1 FROM snaps WHERE pid=? AND t>?').bind(p.pid, now - day).first();
    if (!r || !r.t0) continue;
    const dt = (r.t1 - r.t0) / 1000, why = [];
    if (r.m1 - r.m0 > capPerSec(p.lv) * dt / 4 + 5e7) why.push('24h money too high');
    const nb24 = ((await db.prepare("SELECT COUNT(*) n FROM purchases WHERE pid=? AND state='ok' AND t>?").bind(p.pid, now - day).first()) || {n:0}).n;   // v16-122
    if (r.v1 - r.v0 > 400 + nb24 * 2100 && !isGift(p.pid)) why.push('24h VIP points too high');
    // v16-151: the bot runs every 10 min – a 24h rule may add points only ONCE per 24h (before: +50 every 10 min = ban in 20 min)
    if (why.length && await db.prepare("SELECT 1 FROM events WHERE pid=? AND t>? AND detail LIKE 'bot:%'").bind(p.pid, now - day).first()) continue;
    if (why.length) {
      const k = kindsOf(p.sig); k.add('econ');
      const score = p.score + 50, ban = score >= BAN_AT && canBan(k) ? 1 : 0, sh = p.shadow === 2 ? 2 : (!ban && score >= SHADOW_AT ? 1 : p.shadow || 0);   // v16-157
      await db.prepare('UPDATE players SET score=?, banned=?, reason=?, sig=?, shadow=? WHERE pid=?').bind(score, ban, why.join(' · '), [...k].join(','), sh, p.pid).run();
      await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind(p.pid, now, ban ? 'ban' : 'flag', 'bot: ' + why.join(' · ')).run();
    }
  }
  // a2) v16-150 (server, once): give back the points of the old 'buildings +N levels' rule written after the PARTS update (21 nov)
  //     and unban players banned only because of it (never a ban by admin)
  if (!(await db.prepare("SELECT 1 FROM events WHERE kind='fix' AND detail='v16-150 buildings'").first())) {
    const ev = (await db.prepare("SELECT pid, COUNT(*) n FROM events WHERE kind IN ('flag','ban') AND t>? AND detail LIKE 'buildings +%' AND detail NOT LIKE '%·%' GROUP BY pid").bind(PARTS_T).all()).results;
    for (const e of ev) {
      const p = await db.prepare('SELECT score, banned, reason FROM players WHERE pid=?').bind(e.pid).first();
      if (!p || /by admin/.test(p.reason || '')) continue;
      const score = Math.max(0, p.score - 30 * e.n), ban = p.banned && score >= BAN_AT ? 1 : 0;
      await db.prepare('UPDATE players SET score=?, banned=?, reason=? WHERE pid=?').bind(score, ban, score ? p.reason : null, e.pid).run();
      await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind(e.pid, now, p.banned && !ban ? 'unban' : 'fix', `buildings rule recalibrated: -${30 * e.n} pts`).run();
    }
    await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind('-', now, 'fix', 'v16-150 buildings').run();
  }
  // a3) v16-151 (server, once): same for the old 'campaign +N stages' rule (AUTO NEXT + speed x3 banned Wazza4ever on 22 nov)
  if (!(await db.prepare("SELECT 1 FROM events WHERE kind='fix' AND detail='v16-151 campaign'").first())) {
    const ev = (await db.prepare("SELECT pid, COUNT(*) n FROM events WHERE kind IN ('flag','ban') AND t>? AND detail LIKE 'campaign +%' AND detail NOT LIKE '%·%' GROUP BY pid").bind(now - 7 * day).all()).results;
    for (const e of ev) {
      const p = await db.prepare('SELECT score, banned, reason FROM players WHERE pid=?').bind(e.pid).first();
      if (!p || /by admin/.test(p.reason || '')) continue;
      const score = Math.max(0, p.score - 30 * e.n), ban = p.banned && score >= BAN_AT ? 1 : 0;
      await db.prepare('UPDATE players SET score=?, banned=?, reason=? WHERE pid=?').bind(score, ban, score ? p.reason : null, e.pid).run();
      await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind(e.pid, now, p.banned && !ban ? 'unban' : 'fix', `campaign rule recalibrated: -${30 * e.n} pts`).run();
    }
    await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind('-', now, 'fix', 'v16-151 campaign').run();
  }
  // b) the same purchase token used by different players = shared / stolen purchase
  const dup = (await db.prepare('SELECT token, COUNT(DISTINCT pid) n FROM purchase_use GROUP BY token HAVING n>2').all()).results;
  for (const d of dup) await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind('-', now, 'token', 'purchase token used by ' + d.n + ' players').run();
  // v16-157 SMARTER GUARD – once a day (Paris time)
  const today = parisDay(now);
  if (!(await db.prepare("SELECT 1 FROM events WHERE kind='fix' AND detail=?").bind('v16-157 day ' + today).first())) {
    await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind('-', now, 'fix', 'v16-157 day ' + today).run();
    // e) points go DOWN with honest play: −10 a day without any new warning; under 30 the automatic shadow is lifted; at 0 the kinds are forgotten
    await db.prepare(`UPDATE players SET score=MAX(0,score-10) WHERE banned=0 AND score>0 AND COALESCE(reason,'') NOT LIKE '%by admin%'
      AND pid NOT IN (SELECT pid FROM events WHERE t>? AND kind IN ('flag','ban'))`).bind(now - day).run();
    await db.prepare('UPDATE players SET shadow=0 WHERE shadow=1 AND score<30').run();
    await db.prepare('UPDATE players SET sig=NULL, reason=NULL WHERE score=0 AND banned=0 AND sig IS NOT NULL').run();
    // f) many accounts on one phone (info) – 3+ Player IDs with the same install key in 7 days
    for (const r of (await db.prepare('SELECT dk, COUNT(*) n, GROUP_CONCAT(substr(pid,1,8)) ids FROM devs WHERE t>? GROUP BY dk HAVING n>=3').bind(now - 7 * day).all()).results)
      await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind('-', now, 'multi', `${r.n} accounts on one phone: ${r.ids}`).run();
    // g) "feeding": an account that keeps beating (Arena / Rail Wars) another account from THE SAME phone → +25 to the winner
    try {
      const fd = (await db.prepare(`SELECT pa.pid apid, pd.pid dpid, COUNT(*) n FROM ahist h JOIN prof pa ON pa.uid=h.a JOIN prof pd ON pd.uid=h.d
        JOIN devs da ON da.pid=pa.pid JOIN devs dd ON dd.pid=pd.pid AND dd.dk=da.dk WHERE h.t>? AND h.win=1 AND h.d>0 GROUP BY pa.pid, pd.pid HAVING n>=3`).bind(now - day).all()).results;
      for (const f of fd) { const p = await db.prepare('SELECT score,sig,shadow,banned FROM players WHERE pid=?').bind(f.apid).first(); if (!p || p.banned) continue;
        const k = kindsOf(p.sig); k.add('pvp'); const score = p.score + 25, ban = score >= BAN_AT && canBan(k) ? 1 : 0, sh = p.shadow === 2 ? 2 : (!ban && score >= SHADOW_AT ? 1 : p.shadow || 0);
        const w = `feeding: beat ${f.n}× an account from the same phone (${String(f.dpid).slice(0, 8)})`;
        await db.prepare('UPDATE players SET score=?, banned=?, shadow=?, sig=?, reason=? WHERE pid=?').bind(score, ban, sh, [...k].join(','), w, f.apid).run();
        await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind(f.apid, now, ban ? 'ban' : 'flag', w).run(); }
    } catch (e) {}
    // h) compared with everybody: a NEW account (< 3 days) already in the top 1 % of stages → "to check" (no points)
    const act = (await db.prepare('SELECT best FROM players WHERE last>? AND banned=0 ORDER BY best DESC').bind(now - 7 * day).all()).results;
    if (act.length >= 30) { const p99 = act[Math.floor(act.length * .01)].best;
      for (const r of (await db.prepare('SELECT pid, best FROM players WHERE first>? AND banned=0 AND best>=? AND best>0').bind(now - 3 * day, p99).all()).results)
        await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind(r.pid, now, 'review', `new account (< 3 days) already in the top 1 % (stage ${r.best}, top 1 % = ${p99})`).run(); }
    await db.prepare('DELETE FROM devs WHERE t<?').bind(now - 30 * day).run();
    await db.prepare('DELETE FROM rcpt WHERE t<?').bind(now - 7 * day).run();
    await db.prepare('DELETE FROM ledg WHERE day<?').bind(parisDay(now - 30 * day)).run();
  }
  // c) clean up
  await db.prepare('DELETE FROM snaps WHERE t<?').bind(now - 7 * day).run();   // v16-157: 7 days (player card chart in /admin)
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
const INTEG_OPS = ['sync', 'fight', 'refresh', 'wbhit', 'evsc', 'gpsc', 'gpfin', 'say', 'prof'];
let integReady = false;
// daily stats (/admin): one row per player per day (Paris time), kept 90 days
let statsReady = false;
async function ensureStats(env) {
  if (statsReady) return;
  await env.DB.prepare('CREATE TABLE IF NOT EXISTS seen(day TEXT, pid TEXT, PRIMARY KEY(day, pid))').run();
  statsReady = true;
}
const parisDay = t => new Date(t).toLocaleDateString('sv-SE', {timeZone:'Europe/Paris'});   // "2026-11-22"
async function dailyStats(env) {
  await ensureStats(env); const db = env.DB, now = Date.now(), day = 864e5;
  const days = [...Array(30)].map((_, i) => parisDay(now - i * day));
  const dau = Object.fromEntries((await db.prepare('SELECT day, COUNT(*) n FROM seen WHERE day>=? GROUP BY day').bind(days[29]).all()).results.map(r => [r.day, r.n]));
  // D1 retention: new players of day X who were seen again on day X+1 (2 queries in total)
  const newp = (await db.prepare('SELECT pid, first FROM players WHERE first>?').bind(now - 31 * day).all()).results;
  const seenNew = new Set((await db.prepare('SELECT s.day || s.pid k FROM seen s JOIN players p ON p.pid=s.pid WHERE p.first>?').bind(now - 31 * day).all()).results.map(r => r.k));
  const ret = {};
  for (const r of newp) {
    const d0 = parisDay(r.first), d1 = parisDay(r.first + day); if (d1 > days[0]) continue;
    const x = ret[d0] || (ret[d0] = {n:0, b:0}); x.n++; if (seenNew.has(d1 + r.pid)) x.b++;
  }
  const fresh = {}; for (const r of newp) { const d = parisDay(r.first); fresh[d] = (fresh[d] || 0) + 1; }
  const on = await db.prepare('SELECT SUM(last>?) m10, SUM(last>?) h1, SUM(last>?) d7, SUM(last>?) d30 FROM players').bind(now - 6e5, now - 36e5, now - 7 * day, now - 30 * day).first();
  await db.prepare('DELETE FROM seen WHERE day<?').bind(parisDay(now - 90 * day)).run();
  return {days, dau, fresh, ret, on};
}

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
  // v16-120: Google gives the nonce back RE-ENCODED as base64 (padding '=' added, last characters can change when the
  // length is not a multiple of 4) → the exact compare failed for every real phone (18 × "old or foreign token").
  // Now: the first 20 characters (12 = this player's ID + 8 = time of the request) must match, the rest is ignored.
  const nz = x => String(x || '').replace(/[=\s]/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const pid12 = b.pid.replace(/[^A-Za-z0-9]/g, '').slice(0, 12), gotN = nz(rq.nonce), myN = nz(b.nonce);
  const okN = myN.length >= 20 && myN.startsWith(pid12) && gotN.slice(0, 20) === myN.slice(0, 20);
  const okT = Math.abs(now - (+rq.timestampMillis || 0)) < 10 * 60e3, okP = rq.requestPackageName === env.PACKAGE_NAME;
  const fresh = okN && okT && okP;
  const good = fresh && app === 'PLAY_RECOGNIZED' && dev.includes('MEETS_DEVICE_INTEGRITY') && lic !== 'UNLICENSED';
  await save(app, dev, lic, good, fresh ? null : 'stale:' + (okN ? '' : ` nonce(got ${String(rq.nonce || '-').slice(0, 26)} want ${String(b.nonce).slice(0, 26)})`) + (okT ? '' : ` time(${Math.round((now - (+rq.timestampMillis || 0)) / 1000)}s)`) + (okP ? '' : ` pkg(${rq.requestPackageName || '-'})`));
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

// ------------------------------------------------------------------ v16-157: player card (/admin?key=…&p=PLAYER_ID)
const fmtN = n => n >= 1e9 ? (n / 1e9).toFixed(1) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(Math.round(n));
function powLine(r) {
  const ratio = r.ep / Math.max(1, r.pw), lab = (r.h ? 'H ' : '') + (Math.floor(r.si / 20) + 1) + '-' + (r.si % 20 + 1);
  const ic = ratio > POWER_BAD ? '❌' : ratio > POWER_NOTE ? '⚠️' : '✅';
  return `<small>⚔️ team <b>${fmtN(r.pw)}</b> / stage ${lab} <b>${fmtN(r.ep)}</b> ${ic}${r.ms ? ` · ${(r.ms / 1000).toFixed(1)}s${r.ms < RCPT_MIN_MS ? ' ❌' : ''}` : ''}</small>`;
}
// v16-179: player names (online profile) for /admin – pid → name
async function pnames(db, pids) {
  const m = {}, u = [...new Set(pids.filter(x => x && x !== '-'))];
  try { for (let i = 0; i < u.length; i += 90) { const c = u.slice(i, i + 90);
    for (const r of (await db.prepare(`SELECT pid,name FROM prof WHERE pid IN (${c.map(() => '?').join(',')})`).bind(...c).all()).results) if (r.name) m[r.pid] = r.name; } } catch (e) {}
  return m;
}
// small line chart (SVG) – an honest player climbs smoothly, a cheater has vertical jumps
function chart(title, pts, col, log) {
  if (pts.length < 2) return `<div class=c><b>${title}</b><br><small>not enough data yet</small></div>`;
  const W = 340, H = 110, t0 = pts[0][0], t1 = pts[pts.length - 1][0], f = v => log ? Math.log10(Math.max(1, v)) : v;
  const vs = pts.map(p => f(p[1])), lo = Math.min(...vs), hi = Math.max(...vs), sx = t => 4 + (W - 8) * (t - t0) / Math.max(1, t1 - t0), sy = v => H - 14 - (H - 24) * (v - lo) / Math.max(1e-9, hi - lo);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + sx(p[0]).toFixed(1) + ',' + sy(vs[i]).toFixed(1)).join('');
  return `<div class=c><b>${title}</b> <small>${fmtN(pts[0][1])} → <b>${fmtN(pts[pts.length - 1][1])}</b></small><svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block"><path d="${path}" fill="none" stroke="${col}" stroke-width="2"/><text x="4" y="${H - 2}" fill="#9fb0c0" font-size="10">${new Date(t0).toISOString().slice(5, 16).replace('T', ' ')}</text><text x="${W - 4}" y="${H - 2}" fill="#9fb0c0" font-size="10" text-anchor="end">${new Date(t1).toISOString().slice(5, 16).replace('T', ' ')}</text></svg></div>`;
}
async function playerCard(url, env, pid) {
  const db = env.DB, k = encodeURIComponent(env.ADMIN_KEY), esc = s => String(s ?? '').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
  const d = t => new Date(t).toISOString().slice(5, 16).replace('T', ' ');
  const p = await db.prepare('SELECT * FROM players WHERE pid=?').bind(pid).first(); if (!p) return new Response('unknown player', {status:404});
  const sn = (await db.prepare('SELECT t,money,lv,tk,best,pw FROM snaps WHERE pid=? ORDER BY t').bind(pid).all()).results;
  const thin = a => a.length <= 300 ? a : a.filter((_, i) => i % Math.ceil(a.length / 300) === 0 || i === a.length - 1);
  const S = thin(sn), rc = (await db.prepare('SELECT * FROM rcpt WHERE pid=? ORDER BY t DESC LIMIT 25').bind(pid).all()).results;
  const ev = (await db.prepare('SELECT * FROM events WHERE pid=? ORDER BY t DESC LIMIT 30').bind(pid).all()).results;
  const dv = (await db.prepare('SELECT dk, t FROM devs WHERE pid=? ORDER BY t DESC LIMIT 5').bind(pid).all()).results;
  const same = p.dk ? (await db.prepare('SELECT pid, t FROM devs WHERE dk=? AND pid<>? ORDER BY t DESC LIMIT 10').bind(p.dk, pid).all()).results : [];
  const lg = (await db.prepare('SELECT * FROM ledg WHERE pid=? ORDER BY day DESC LIMIT 7').bind(pid).all()).results;
  const NM = await pnames(db, [pid, ...same.map(x => x.pid)]), nm = NM[pid];
  const html = `<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><title>${nm ? esc(nm) : 'Player ' + esc(pid.slice(0, 8))}</title>
<style>body{font-family:system-ui;background:#0b1019;color:#eee;margin:0;padding:12px}h1{color:#ffd54a;font-size:20px}h3{margin:14px 0 4px}.c{background:#141c2b;border:1px solid #e0a82e55;border-radius:12px;padding:10px;margin:8px 0;font-size:13px}a{color:#9fd3ff}small{color:#9fb0c0}table{width:100%;border-collapse:collapse;font-size:12px}td,th{padding:3px 2px;border-top:1px solid #ffffff14;text-align:left}</style>
<a href="/admin?key=${k}">← back</a><h1>📈 ${nm ? `${esc(nm)}</h1><small>${esc(pid)}</small>` : `Player ${esc(pid.slice(0, 13))}…</h1><small>no name yet (no online profile)</small>`}
<div class=c>${p.banned ? '🚫 <b style="color:#ff8a80">BANNED</b>' : `⚠️ score <b>${p.score}</b>`}${p.shadow ? ` · 👻 hidden${p.shadow === 2 ? ' (by you)' : ''}` : ''} · kinds: <b>${esc(p.sig || '–')}</b><br>${esc(p.reason || '')}<br>
<small>first seen ${d(p.first)} · last ${d(p.last)} · app ${p.app ? 'Play' : 'browser'} · stage ${p.best} (best ever ${Math.max(p.bmax || 0, p.best)}) · buildings lv ${p.lv} · heroes ${p.heroes} (${p.mythic} Mythic)</small><br>
${p.banned ? `<a href="?key=${k}&unban=${encodeURIComponent(pid)}">✅ unban</a>` : `<a href="?key=${k}&ban=${encodeURIComponent(pid)}">🚫 ban</a> · <a href="?key=${k}&unban=${encodeURIComponent(pid)}">clear</a> · ${p.shadow ? `<a href="?key=${k}&unshadow=${encodeURIComponent(pid)}">👁️ show again</a>` : `<a href="?key=${k}&shadow=${encodeURIComponent(pid)}">👻 hide (shadow)</a>`}`}</div>
<small>Charts: last 7 days. Honest = a line that climbs smoothly. Cheat = a vertical jump.</small>
${chart('🏁 Campaign stage', S.map(r => [r.t, r.best]), '#ffd54a')}${chart('⚔️ Team power', S.filter(r => r.pw > 0).map(r => [r.t, r.pw]), '#ff8a65', true)}${chart('💰 Money (log)', S.map(r => [r.t, r.money]), '#66bb6a', true)}${chart('🎟️ Tickets', S.map(r => [r.t, r.tk]), '#9fd3ff')}${chart('🏗️ Buildings level', S.map(r => [r.t, r.lv]), '#ce93d8')}
<h3>⚔️ Battle receipts (new stages won)</h3><div class=c>${rc.length ? `<table><tr><th>when</th><th>stage</th><th>team</th><th>monsters</th><th></th><th>time</th></tr>${rc.map(r => { const ratio = r.ep / Math.max(1, r.pw);
  return `<tr><td>${d(r.t).slice(6)}</td><td>${r.h ? 'H ' : ''}${Math.floor(r.si / 20) + 1}-${r.si % 20 + 1}</td><td>${fmtN(r.pw)}</td><td>${fmtN(r.ep)}</td><td>${ratio > POWER_BAD ? '❌' : ratio > POWER_NOTE ? '⚠️' : '✅'}</td><td>${(r.ms / 1000).toFixed(1)}s${r.ms && r.ms < RCPT_MIN_MS ? '❌' : ''} ×${r.sp}</td></tr>`; }).join('')}</table>` : '<small>none yet (needs the new game version)</small>'}</div>
<h3>📒 Ledger – what the game gave (per day)</h3><div class=c>${lg.length ? `<table><tr><th>day</th><th>💎</th><th>🎟️</th><th>crew</th><th>gear</th><th>VIP</th></tr>${lg.map(r => `<tr><td>${r.day.slice(5)}</td><td>${fmtN(r.dm)}</td><td>${fmtN(r.tk)}</td><td>${fmtN(r.ct)}</td><td>${fmtN(r.gtk)}</td><td>${fmtN(r.vip)}</td></tr>`).join('')}</table>` : '<small>none yet</small>'}</div>
<h3>📱 Phones</h3><div class=c>${dv.map(x => `<small>${esc(x.dk).slice(0, 9)}… last ${d(x.t)}</small>`).join('<br>') || '<small>none yet</small>'}${same.length ? `<br><b>Other accounts on this phone:</b><br>${same.map(x => `<a href="?key=${k}&p=${encodeURIComponent(x.pid)}">${NM[x.pid] ? esc(NM[x.pid]) : esc(x.pid).slice(0, 13)}</a> <small>${d(x.t)}</small>`).join('<br>')}` : ''}</div>
<h3>📜 Events</h3>${ev.map(e => `<div class=c><small>${d(e.t)} · ${esc(e.kind)}</small><br>${esc(e.detail)}</div>`).join('') || '<div class=c>none</div>'}`;
  return new Response(html, {headers:{'content-type':'text/html;charset=utf-8'}});
}

// ------------------------------------------------------------------ admin page (open it on your phone)
async function admin(url, env) {
  if (!env.ADMIN_KEY || url.searchParams.get('key') !== env.ADMIN_KEY) return new Response('no', {status:403});
  const db = env.DB, k = encodeURIComponent(env.ADMIN_KEY);
  const act = url.searchParams.get('unban');
  if (act) { await db.prepare('UPDATE players SET banned=0, score=0, shadow=0, sig=NULL, reason=? WHERE pid=?').bind('unbanned by admin', act).run(); return Response.redirect(url.origin + '/admin?key=' + k, 302); }
  // v16-157: hide (shadow) / show again by hand · player card
  const shw = url.searchParams.get('shadow'), ush = url.searchParams.get('unshadow');
  if (shw) { await db.prepare('UPDATE players SET shadow=2 WHERE pid=?').bind(shw).run(); await db.prepare('INSERT INTO events(pid,t,kind,detail) VALUES(?,?,?,?)').bind(shw, Date.now(), 'flag', 'hidden (shadow) by admin').run(); return Response.redirect(url.origin + '/admin?key=' + k + '&p=' + encodeURIComponent(shw), 302); }
  if (ush) { await db.prepare('UPDATE players SET shadow=0 WHERE pid=?').bind(ush).run(); return Response.redirect(url.origin + '/admin?key=' + k + '&p=' + encodeURIComponent(ush), 302); }
  if (url.searchParams.get('p')) return playerCard(url, env, url.searchParams.get('p'));
  const q = (url.searchParams.get('q') || '').trim().toLowerCase().slice(0, 20);   // v16-179: search a player by name
  if (q) { let rs = []; try { rs = (await db.prepare('SELECT pid,name,best,lv,t FROM prof WHERE nlow LIKE ? ORDER BY t DESC LIMIT 30').bind('%' + q + '%').all()).results; } catch (e) {}
    const e2 = s => String(s ?? '').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
    return new Response(`<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><title>Search</title><style>body{font-family:system-ui;background:#0b1019;color:#eee;margin:0;padding:12px}.c{background:#141c2b;border:1px solid #e0a82e55;border-radius:12px;padding:10px;margin:8px 0;font-size:14px}a{color:#9fd3ff}small{color:#9fb0c0}</style>
<a href="/admin?key=${k}">← back</a><h2>🔎 “${e2(q)}”</h2>${rs.map(r => `<div class=c><a href="?key=${k}&p=${encodeURIComponent(r.pid)}"><b>${e2(r.name)}</b></a><br><small>${e2(r.pid)} · stage ${r.best} · lv ${r.lv}</small></div>`).join('') || '<div class=c>nobody with this name</div>'}`, {headers:{'content-type':'text/html;charset=utf-8'}}); }
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
  const ev = (await db.prepare("SELECT * FROM events WHERE kind NOT IN ('review','dual','multi','stshop') ORDER BY t DESC LIMIT 40").all()).results;
  const rv = (await db.prepare("SELECT * FROM events WHERE kind IN ('review','dual','multi') AND t>? ORDER BY t DESC LIMIT 30").bind(Date.now() - 3 * 864e5).all()).results;
  // last battle receipt of every flagged player: team power vs. monsters
  const lastR = {}; for (const p of bad) { const r = await db.prepare('SELECT * FROM rcpt WHERE pid=? ORDER BY t DESC LIMIT 1').bind(p.pid).first(); if (r) lastR[p.pid] = r; }
  const NM = await pnames(db, [...bad.map(p => p.pid), ...rv.map(e => e.pid), ...ev.map(e => e.pid)]), who = id => NM[id] ? `<b style="color:#fff">${esc(NM[id])}</b>` : '<small>(no name)</small>';
  const buys = await db.prepare("SELECT COUNT(*) n FROM purchases WHERE state='ok'").first();
  await ensureInteg(env); const ig = await db.prepare('SELECT COUNT(*) n, SUM(ok) g FROM integ WHERE t>?').bind(Date.now() - 3 * 864e5).first();
  // v16-120: WHY phones fail Play Integrity (reason → count) + the last 15 checks
  const igr = (await db.prepare(`SELECT CASE WHEN ok=1 THEN '✅ OK' WHEN err IS NOT NULL AND err NOT LIKE 'stale%' AND err<>'old or foreign token' THEN err
      ELSE 'app=' || COALESCE(NULLIF(app,''),'-') || ' dev=' || COALESCE(NULLIF(dev,''),'none') || ' lic=' || COALESCE(NULLIF(lic,''),'-') || CASE WHEN err IS NULL THEN '' ELSE ' · ' || err END END r,
      COUNT(*) n FROM integ WHERE t>? GROUP BY r ORDER BY n DESC LIMIT 20`).bind(Date.now() - 3 * 864e5).all()).results;
  const igl = (await db.prepare('SELECT pid,t,app,dev,lic,ok,err FROM integ ORDER BY t DESC LIMIT 15').all()).results;
  const esc = s => String(s ?? '').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
  const d = t => new Date(t).toISOString().slice(5, 16).replace('T', ' ');
  let st = null; try { st = await dailyStats(env); } catch (e) {}
  const stats = !st ? '' : `<h3>📊 Players per day (Paris time)</h3><div class=c>🟢 online now (10 min): <b>${st.on.m10 || 0}</b> · last hour: <b>${st.on.h1 || 0}</b> · 7 days: <b>${st.on.d7 || 0}</b> · 30 days: <b>${st.on.d30 || 0}</b></div>
<div class=c><table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="color:#ffd54a;text-align:left"><th>Day</th><th>Active</th><th>New</th><th>Back next day</th></tr>${st.days.map(x => { const r = st.ret[x];
  return `<tr style="border-top:1px solid #ffffff14"><td>${x.slice(5)}</td><td><b>${st.dau[x] ?? '–'}</b></td><td>${st.fresh[x] || 0}</td><td>${r && r.n ? `${r.b}/${r.n} (${Math.round(100 * r.b / r.n)}%)` : '–'}</td></tr>`; }).join('')}</table>
<small>“Active” is counted from the day this update went live (older days show “–”). “New” works for the past too (players inactive 180+ days are removed).</small></div>`;
  const html = `<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><title>Torque Guard</title>
<style>body{font-family:system-ui;background:#0b1019;color:#eee;margin:0;padding:12px}h1{color:#ffd54a;font-size:22px}.c{background:#141c2b;border:1px solid #e0a82e55;border-radius:12px;padding:10px;margin:8px 0;font-size:13px}.b{color:#ff8a80}.f{color:#ffd54a}a{color:#9fd3ff}small{color:#9fb0c0}</style>
<h1>🛡️ Torque Guard</h1><form class=c style="display:flex;gap:6px"><input type=hidden name=key value="${esc(env.ADMIN_KEY)}"><input name=q placeholder="🔎 player name" style="flex:1;padding:8px;border-radius:8px;border:0;font-size:15px"><button style="padding:8px 12px;border-radius:8px;border:0;background:#ffd54a;font-weight:bold">Search</button></form><div class=c><a href="/admin/chat?key=${k}">💬 Chat moderation →</a></div><div class=c>Players: <b>${tot.n}</b> · active 24h: <b>${tot.d || 0}</b> · purchases OK: <b>${buys.n}</b><br>🔒 Play Integrity (${esc(env.INTEGRITY || 'log')}): <b>${ig.g || 0}</b> OK of <b>${ig.n || 0}</b> phones (3 days)</div>
${stats}
<h3>🔒 Play Integrity – why (3 days)</h3><div class=c>${igr.map(r => `<b>${r.n}</b> × ${esc(r.r === 'app=PLAY_RECOGNIZED dev=MEETS_DEVICE_INTEGRITY lic=LICENSED · old or foreign token' ? '⏳ good phone, last check from before the v16-120 fix (app not opened since)' : r.r)}`).join('<br>') || 'no checks yet'}</div>
<details class=c><summary>Last 15 checks</summary>${igl.map(r => `<small>${d(r.t)} · ${esc(r.pid).slice(0, 10)}</small> ${r.ok ? '✅' : '❌'} ${esc(r.err || `app=${r.app} dev=${r.dev || 'none'} lic=${r.lic}`)}`).join('<br>')}</details>
<h3>Flagged / banned</h3><small>👻 = hidden (shadow): plays normally but is out of rankings, opponents and prizes. Ban needs a PROOF or 2 different kinds of signs. Points go down 10 a day with honest play.</small>${bad.map(p => { const r = lastR[p.pid], pv = r ? powLine(r) : '';
  return `<div class=c><b class="${p.banned ? 'b' : 'f'}">${p.banned ? '🚫 BANNED' : '⚠️ score ' + p.score}</b>${p.shadow ? ' 👻' : ''} · ${who(p.pid)} <small>${esc(p.pid).slice(0, 13)}…</small><br>${esc(p.reason)}<br><small>kinds: <b>${esc(p.sig || '–')}</b>${(p.sig || '').includes('proof') || (p.sig || '').split(',').length >= 2 ? ' (ban possible)' : ' (1 kind → no automatic ban)'} · flags: ${esc(p.flags)}</small><br>${pv ? pv + '<br>' : ''}<small>money ${p.money} · lv ${p.lv} · stage ${p.best} · last ${d(p.last)}</small><br><a href="?key=${k}&p=${encodeURIComponent(p.pid)}">📈 player card</a> · ${p.banned ? `<a href="?key=${k}&unban=${encodeURIComponent(p.pid)}">✅ unban</a>` : `<a href="?key=${k}&ban=${encodeURIComponent(p.pid)}">🚫 ban</a> · <a href="?key=${k}&unban=${encodeURIComponent(p.pid)}">clear</a>`}</div>`; }).join('') || '<div class=c>Nobody flagged 👍</div>'}
<h3>🔎 To check (no points, 3 days)</h3>${rv.map(e => `<div class=c><small>${d(e.t)} · ${esc(e.kind)} · ${e.pid !== '-' ? `<a href="?key=${k}&p=${encodeURIComponent(e.pid)}">${NM[e.pid] ? esc(NM[e.pid]) : esc(e.pid).slice(0, 10)}</a>` : ''}</small><br>${esc(e.detail)}</div>`).join('') || '<div class=c>Nothing 👍</div>'}
<h3>Last events</h3>${ev.map(e => `<div class=c><small>${d(e.t)} · ${esc(e.kind)} · ${NM[e.pid] ? esc(NM[e.pid]) : esc(e.pid).slice(0, 10)}</small><br>${esc(e.detail)}</div>`).join('')}`;
  return new Response(html, {headers:{'content-type':'text/html;charset=utf-8'}});
}
