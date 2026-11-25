// v16-318 🩺 Torque Bot – SERVER ALERTS for Marius (private Discord channel #admin-alerts, only 🛠️ Developer sees it).
// Run by .github/workflows/health.yml every 10 min and after every push to main.
// Reads the public status https://…workers.dev/api/health and posts every NEW alert (red = ping 🛠️ Developer → phone notification).
// No state is kept anywhere: an alert already posted is recognised by its id in the footer of the last messages.
// Usage: BOT_TOKEN=… GUILD_ID=… node discord/health.mjs [push]

const TOKEN = process.env.BOT_TOKEN, GUILD = process.env.GUILD_ID;
const HEALTH = 'https://torque-guard.torqueempirehelp.workers.dev/api/health';
const CH_NAME = 'admin-alerts';
const PUSH = process.argv[2] === 'push';
if (!TOKEN || !GUILD) { console.error('Missing BOT_TOKEN or GUILD_ID'); process.exit(1); }
const API = 'https://discord.com/api/v10', sleep = ms => new Promise(r => setTimeout(r, ms));
async function api(method, path, body) {
  for (let i = 0; i < 5; i++) {
    const res = await fetch(API + path, { method, headers: { Authorization: `Bot ${TOKEN}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 429) { const j = await res.json(); await sleep((j.retry_after || 1) * 1000 + 200); continue; }
    if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
    await sleep(250); return res.status === 204 ? null : res.json();
  }
  throw new Error('Rate limited too many times');
}
const VIEW = 1n << 10n, SEND = 1n << 11n, HIST = 1n << 16n, EMBED = 1n << 14n;

async function channel() {
  const chans = await api('GET', `/guilds/${GUILD}/channels`);
  let ch = chans.find(c => c.type === 0 && c.name === CH_NAME);
  const roles = await api('GET', `/guilds/${GUILD}/roles`), dev = roles.find(r => /developer/i.test(r.name));
  if (!ch) {
    const me = await api('GET', '/users/@me');
    const ow = [{ id: GUILD, type: 0, deny: VIEW.toString(), allow: '0' },                                  // @everyone: hidden
      { id: me.id, type: 1, allow: (VIEW | SEND | HIST | EMBED).toString(), deny: '0' }];                     // the bot
    if (dev) ow.push({ id: dev.id, type: 0, allow: (VIEW | HIST).toString(), deny: '0' });                    // 🛠️ Developer (Marius)
    ch = await api('POST', `/guilds/${GUILD}/channels`, { name: CH_NAME, type: 0, topic: '🩺 Torque Guard – server problems and update checks (private)', permission_overwrites: ow });
    await api('POST', `/channels/${ch.id}/messages`, { embeds: [{ title: '🩺 Server alerts are ON', color: 0x1565C0,
      description: 'Here the bot writes when something on the server breaks (Arena, Chat, Ranking, Cloud save, crashes…), when it works again, and the result of the tests after every update.\n🔴 = problem (ping) · 🟢 = OK again · 📦 = update checked\nDetails: /admin → 🩺 Server health' }] });
  }
  return { ch, dev };
}

let H = null, down = '';
for (let i = 0; i < 3 && !H; i++) {
  try { const r = await fetch(HEALTH + (PUSH ? '?run=1' : ''), { headers: { 'cache-control': 'no-cache' } });
    if (r.ok) H = await r.json(); else down = 'answered ' + r.status; } catch (e) { down = String(e.message || e); }
  if (!H) await sleep(20000);
}
const now = Date.now(), out = [];
if (!H) out.push({ key: 'down-' + new Date().toISOString().slice(0, 13), lvl: 'red', txt: `🔴 SERVER NOT REACHABLE (${down}). The game cannot go online (Arena, chat, cloud save…). Check Cloudflare → Workers → torque-guard.` });
else {
  if (now - (H.run || 0) > 35 * 60e3) out.push({ key: 'stale-' + new Date().toISOString().slice(0, 13), lvl: 'red', txt: `🔴 The server tests did not run for ${Math.round((now - (H.run || 0)) / 60e3)} min – the 10-min cron may be stopped.` });
  for (const a of (H.alerts || []).slice().reverse()) if (now - a.t < 6 * 3600e3) out.push({ key: 'A' + a.id, lvl: a.lvl, txt: a.txt, t: a.t });
}
if (!out.length) { console.log('nothing new', H ? (H.ok ? '🟢 all OK' : '🔴 not OK') : ''); process.exit(0); }

const { ch, dev } = await channel();
const last = await api('GET', `/channels/${ch.id}/messages?limit=100`);
const posted = new Set(); for (const m of last) for (const e of m.embeds || []) { const f = e.footer && e.footer.text || ''; const k = f.match(/#(\S+)$/); if (k) posted.add(k[1]); }
let newRed = 0;
for (const a of out) {
  if (posted.has(a.key)) continue;
  const red = a.lvl === 'red'; if (red) newRed++;
  await api('POST', `/channels/${ch.id}/messages`, {
    content: red && dev ? `<@&${dev.id}>` : undefined, allowed_mentions: { roles: red && dev ? [dev.id] : [] },
    embeds: [{ description: a.txt, color: red ? 0xD32F2F : a.lvl === 'green' ? 0x2E7D32 : 0x1565C0,
      footer: { text: `Torque Guard 🩺 #${a.key}` }, timestamp: new Date(a.t || now).toISOString() }] });
  console.log('posted', a.key, a.txt);
}
// a NEW red alert also makes this GitHub run fail → GitHub sends an e-mail too (only once per problem)
if (newRed) { console.error(`${newRed} new problem(s) – see Discord #${CH_NAME}`); process.exit(1); }
