// Torque Empire – 💎 FREE DIAMONDS during the test (Marius 26 nov 2026): channel 💎┃free-diamonds (players post in-game name + ID,
// slowmode 6 h) with a pinned guide + an @everyone announcement in #announcements. Staff send 100,000 💎 from /admin → 🎁 Gift
// (search by the in-game ID number) → the game MAIL; /admin gifts are added to the anti-cheat ledger → never flagged or banned.
// Usage: BOT_TOKEN=.. GUILD_ID=.. node discord/freedm.mjs
import { readFileSync } from 'node:fs';
const TOKEN = process.env.BOT_TOKEN, GUILD = process.env.GUILD_ID;
const API = 'https://discord.com/api/v10', H = { Authorization: `Bot ${TOKEN}` };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function api(method, path, body) {
  for (let i = 0; i < 5; i++) {
    const res = await fetch(API + path, { method, headers: { ...H, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 429) { const j = await res.json(); await sleep((j.retry_after || 1) * 1000 + 200); continue; }
    if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
    await sleep(400);
    return res.status === 204 ? null : res.json();
  }
}
async function postFile(chId, content, file, mentions) {
  const fd = new FormData();
  fd.append('payload_json', JSON.stringify({ content, allowed_mentions: { parse: mentions }, attachments: [{ id: 0, filename: 'free-diamonds.jpg' }] }));
  fd.append('files[0]', new Blob([readFileSync(file)]), 'free-diamonds.jpg');
  const r = await fetch(`${API}/channels/${chId}/messages`, { method: 'POST', headers: H, body: fd });
  if (!r.ok) throw new Error(`POST -> ${r.status} ${await r.text()}`);
  return r.json();
}
const norm = s => s.toLowerCase().replace(/\s/g, '');
const NAME = '💎┃free-diamonds';
let ch = await api('GET', `/guilds/${GUILD}/channels`);
const ann = ch.find(c => norm(c.name) === norm('📢┃announcements'));
const bt = ch.find(c => norm(c.name) === norm('🧪┃play-before-release'));
if (!ann) throw new Error('#announcements not found');
// 1) channel: everyone may write (text only, 1 message every 6 h), no threads, no files, no links
const DENY = (1n << 14n) | (1n << 15n) | (1n << 35n) | (1n << 36n) | (1n << 38n);
let fdc = ch.find(c => norm(c.name) === norm(NAME));
const body = { topic: 'Post your in-game NAME + ID here → 100,000 💎 in your game Mail (test period gift)', rate_limit_per_user: 21600,
  permission_overwrites: [{ id: GUILD, type: 0, allow: String(1n << 11n), deny: String(DENY) }] };
if (!fdc) { fdc = await api('POST', `/guilds/${GUILD}/channels`, { name: NAME, type: 0, parent_id: ann.parent_id, ...body }); console.log(`+ ${NAME}`); }
else await api('PATCH', `/channels/${fdc.id}`, body);
ch = await api('GET', `/guilds/${GUILD}/channels`);
const after = bt || ann;
const sib = ch.filter(c => c.parent_id === ann.parent_id && c.type !== 4 && c.id !== fdc.id).sort((a, b) => a.position - b.position);
const order = []; for (const c of sib) { order.push(c.id); if (c.id === after.id) order.push(fdc.id); }
await api('PATCH', `/guilds/${GUILD}/channels`, order.map((id, i) => ({ id, position: i })));
// 2) pinned guide in the channel
for (const m of (await api('GET', `/channels/${fdc.id}/messages?limit=50`)).filter(m => m.author?.bot)) await api('DELETE', `/channels/${fdc.id}/messages/${m.id}`);
const guide = await postFile(fdc.id, [
  '# 💎 100,000 FREE DIAMONDS – how to get them',
  '',
  '**1️⃣** Open the game → tap your **PROFILE** (top left).',
  '**2️⃣** Under your name you see **ID** + a number (example: `ID 1234`).',
  '**3️⃣** Post **ONE message** here with your **in-game name + ID**, like this:',
  '> `Name: RoadKing  ·  ID: 1234`',
  '**4️⃣** Our team sends **100,000 💎** to your **game MAIL** (usually within 24 h). Open Mail and tap **CLAIM**!',
  '',
  '✅ It is an **official gift from Torque Studios** → **100% safe, no ban**, our anti-cheat knows about it.',
  '⏳ 1 message every 6 hours · 1 gift per player · only your own account.',
  '⚠️ It is a test version: progress (and diamonds) may be **reset** before the official launch.',
].join('\n'), 'discord/freedm.jpg', []);
await api('PUT', `/channels/${fdc.id}/pins/${guide.id}`);
console.log('Guide posted + pinned');
// 3) announcement in #announcements (@everyone)
if (process.env.NO_ANN !== '1') {
  const msg = await postFile(ann.id, [
    '# 💎 TEST PERIOD = GIFTS FOR EVERYONE! 💎',
    '',
    'Hey @everyone! 👋 Thank you for testing **Torque Empire** with us! 🔧🏎️',
    '',
    'Until the **next test phase**, we are giving away **lots of diamonds and gifts** so you can try EVERYTHING: summons, heroes, Awakening, Arena, Rail Wars… 🎁',
    '',
    '**🎁 First gift: 100,000 FREE DIAMONDS 💎**',
    `👉 Post your **in-game name + ID** (PROFILE → under your name) in <#${fdc.id}>`,
    '👉 The diamonds arrive in your **game MAIL** – just tap **CLAIM**!',
    '',
    '✅ **Official gift = 100% safe**, no ban from our anti-cheat.',
    `🧪 Not playing yet? Join the test here: ${bt ? `<#${bt.id}>` : 'see the test channel'}`,
    '',
    'More gifts and gift codes are coming here on Discord – keep notifications ON! 🔔',
    '',
    '— *The Torque Empire Team*',
  ].join('\n'), 'discord/freedm.jpg', ['everyone']);
  if (ann.type === 5) { try { await fetch(`${API}/channels/${ann.id}/messages/${msg.id}/crosspost`, { method: 'POST', headers: H }); } catch {} }
  console.log('Announcement posted');
}
console.log('DONE ✅');
