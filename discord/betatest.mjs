// Torque Empire – moves the "Play BEFORE release" post from #announcements into its own read-only channel 🧪┃play-before-release
// Usage: BOT_TOKEN=.. GUILD_ID=.. node discord/betatest.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
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
const norm = s => s.toLowerCase().replace(/\s/g, '');
const NAME = '🧪┃play-before-release';
let ch = await api('GET', `/guilds/${GUILD}/channels`);
const ann = ch.find(c => norm(c.name) === norm('📢┃announcements'));
if (!ann) throw new Error('#announcements not found');
// 1) channel (read-only for everyone, right under #announcements)
const SEND = 1n << 11n, THR = (1n << 35n) | (1n << 36n) | (1n << 38n);
let bt = ch.find(c => norm(c.name) === norm(NAME));
if (!bt) {
  bt = await api('POST', `/guilds/${GUILD}/channels`, {
    name: NAME, type: 0, parent_id: ann.parent_id,
    topic: 'How to join the test and play Torque Empire before the official release 🎮',
    permission_overwrites: [{ id: GUILD, type: 0, allow: '0', deny: String(SEND | THR) }],
  });
  console.log(`+ ${NAME}`);
}
ch = await api('GET', `/guilds/${GUILD}/channels`);
const sib = ch.filter(c => c.parent_id === ann.parent_id && c.type !== 4 && c.id !== bt.id).sort((a, b) => a.position - b.position);
const order = []; for (const c of sib) { order.push(c.id); if (c.id === ann.id) order.push(bt.id); }
await api('PATCH', `/guilds/${GUILD}/channels`, order.map((id, i) => ({ id, position: i })));
console.log('Placed under #announcements');
// 2) post the guide (no @everyone ping here) and pin it
const dir = 'discord/posts/join-test';
const old = (await api('GET', `/channels/${bt.id}/messages?limit=20`)).filter(m => m.author?.bot);
for (const m of old) await api('DELETE', `/channels/${bt.id}/messages/${m.id}`);
const text = readFileSync(join(dir, 'text.md'), 'utf8').trim().replace('Hey @everyone!', 'Hey everyone!');
const pics = readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const fd = new FormData();
fd.append('payload_json', JSON.stringify({ content: text, allowed_mentions: { parse: [] }, attachments: pics.map((f, i) => ({ id: i, filename: f })) }));
pics.forEach((f, i) => fd.append(`files[${i}]`, new Blob([readFileSync(join(dir, f))]), f));
const r = await fetch(`${API}/channels/${bt.id}/messages`, { method: 'POST', headers: H, body: fd });
if (!r.ok) throw new Error(`POST -> ${r.status} ${await r.text()}`);
const msg = await r.json();
await api('PUT', `/channels/${bt.id}/pins/${msg.id}`);
console.log('Guide posted + pinned');
// 3) remove the old post from #announcements
const am = await api('GET', `/channels/${ann.id}/messages?limit=100`);
for (const m of am.filter(m => m.author?.bot && /BEFORE release/i.test(m.content || ''))) {
  await api('DELETE', `/channels/${ann.id}/messages/${m.id}`); console.log(`- removed old post ${m.id} from #announcements`);
}
console.log('DONE ✅');
