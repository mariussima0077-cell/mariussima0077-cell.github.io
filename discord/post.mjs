// Torque Bot – posts a custom announcement (text + pictures) in #announcements.
// Usage: BOT_TOKEN=.. GUILD_ID=.. node discord/post.mjs discord/posts/<name>
// Folder: text.md (max 2000 chars) + pictures 1.jpg, 2.jpg ... (sent in name order)
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
const TOKEN = process.env.BOT_TOKEN, GUILD = process.env.GUILD_ID, dir = process.argv[2];
if (!TOKEN || !GUILD || !dir) { console.error('Missing BOT_TOKEN / GUILD_ID / folder'); process.exit(1); }
const API = 'https://discord.com/api/v10', H = { Authorization: `Bot ${TOKEN}` };
const get = async p => { const r = await fetch(API + p, { headers: H }); if (!r.ok) throw new Error(`GET ${p} -> ${r.status} ${await r.text()}`); return r.json(); };
const norm = s => s.toLowerCase().replace(/\s/g, '');
const ch = (await get(`/guilds/${GUILD}/channels`)).find(c => norm(c.name) === norm('📢┃announcements'));
if (!ch) throw new Error('#announcements not found');
const text = readFileSync(join(dir, 'text.md'), 'utf8').trim();
if (text.length > 2000) throw new Error(`text.md is ${text.length} chars (max 2000)`);
const pics = readdirSync(dir).filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f)).sort();
const fd = new FormData();
fd.append('payload_json', JSON.stringify({
  content: text,
  allowed_mentions: { parse: text.includes('@everyone') ? ['everyone'] : [] },
  attachments: pics.map((f, i) => ({ id: i, filename: f })),
}));
pics.forEach((f, i) => fd.append(`files[${i}]`, new Blob([readFileSync(join(dir, f))]), basename(f)));
const r = await fetch(`${API}/channels/${ch.id}/messages`, { method: 'POST', headers: H, body: fd });
if (!r.ok) throw new Error(`POST -> ${r.status} ${await r.text()}`);
const msg = await r.json();
if (ch.type === 5) { try { await fetch(`${API}/channels/${ch.id}/messages/${msg.id}/crosspost`, { method: 'POST', headers: H }); } catch {} }
console.log(`Posted ${dir} with ${pics.length} picture(s) ✅`);
