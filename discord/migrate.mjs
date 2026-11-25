// Torque Empire – restructure v2 (run once)
// - removes voice channels, per-language help, #updates, #events, #roles, Discord default channels, RO/FR roles
// - adds one 🌍 LANGUAGES category with one chat channel per language (visible to everyone)
// - #announcements = upcoming updates + what they contain
// - re-posts the Welcome message
const TOKEN = process.env.BOT_TOKEN, GUILD = process.env.GUILD_ID;
if (!TOKEN || !GUILD) { console.error('Missing BOT_TOKEN or GUILD_ID'); process.exit(1); }
const API = 'https://discord.com/api/v10';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function api(method, path, body) {
  for (let i = 0; i < 5; i++) {
    const res = await fetch(API + path, { method, headers: { Authorization: `Bot ${TOKEN}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 429) { const j = await res.json(); await sleep((j.retry_after || 1) * 1000 + 200); continue; }
    if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
    await sleep(300);
    return res.status === 204 ? null : res.json();
  }
}
const norm = s => s.toLowerCase().replace(/\s/g, '');

const DELETE_CHANNELS = [
  '🆕┃updates', '🏁┃events', '🎭┃roles',
  '💬┃general-ro', '❓┃ajutor', '💬┃general-fr', '❓┃aide',
  '🔊 Garage Talk', '🔊 Battle Squad',
  'général', 'Général', 'general', 'General',
];
const DELETE_CATEGORIES = ['🇷🇴 ROMÂNĂ', '🇫🇷 FRANÇAIS', '🔊 VOICE', 'Salons textuels', 'Salons vocaux', 'Text Channels', 'Voice Channels'];
const DELETE_ROLES = ['🇷🇴 Română', '🇫🇷 Français'];

const LANGS = [
  ['🇷🇴┃română', 'Chat în română'],
  ['🇫🇷┃français', 'Chat en français'],
  ['🇪🇸┃español', 'Chat en español'],
  ['🇵🇹┃português', 'Chat em português'],
  ['🇩🇪┃deutsch', 'Chat auf Deutsch'],
  ['🇮🇹┃italiano', 'Chat in italiano'],
  ['🇹🇷┃türkçe', 'Türkçe sohbet'],
  ['🇷🇺┃русский', 'Чат на русском'],
  ['🇵🇱┃polski', 'Czat po polsku'],
  ['🇵🇭┃filipino', 'Filipino chat'],
  ['🇮🇩┃indonesia', 'Obrolan bahasa Indonesia'],
  ['🇸🇦┃العربية', 'دردشة بالعربية'],
];

const channels = await api('GET', `/guilds/${GUILD}/channels`);
const find = (name, type) => channels.find(c => norm(c.name) === norm(name) && (type === undefined || c.type === type));

// 1) delete channels (text/voice), then categories
for (const n of DELETE_CHANNELS) {
  for (const c of channels.filter(c => c.type !== 4 && norm(c.name) === norm(n))) {
    await api('DELETE', `/channels/${c.id}`); console.log(`- ${c.name}`);
  }
}
for (const n of DELETE_CATEGORIES) {
  const c = find(n, 4); if (c) { await api('DELETE', `/channels/${c.id}`); console.log(`- # ${c.name}`); }
}
// 2) delete language roles
const roles = await api('GET', `/guilds/${GUILD}/roles`);
for (const n of DELETE_ROLES) { const r = roles.find(x => x.name === n); if (r) { await api('DELETE', `/guilds/${GUILD}/roles/${r.id}`); console.log(`- role ${n}`); } }

// 3) announcements topic
const ann = find('📢┃announcements');
if (ann) await api('PATCH', `/channels/${ann.id}`, { topic: 'Upcoming updates, what they will contain, and patch notes. Official news only.' });

// 4) languages category (after COMMUNITY)
const community = find('💬 COMMUNITY', 4);
let cat = find('🌍 LANGUAGES', 4);
if (!cat) cat = await api('POST', `/guilds/${GUILD}/channels`, { name: '🌍 LANGUAGES', type: 4 });
console.log('# 🌍 LANGUAGES');
for (const [name, topic] of LANGS) {
  if (find(name)) { console.log(`  = ${name}`); continue; }
  await api('POST', `/guilds/${GUILD}/channels`, { name, type: 0, parent_id: cat.id, topic: `${topic} • Help & bug reports in English channels`, rate_limit_per_user: 3 });
  console.log(`  + ${name}`);
}
// order categories
const order = ['📌 START HERE', '📢 NEWS', '💬 COMMUNITY', '🌍 LANGUAGES', '🛠️ SUPPORT', '🔒 STAFF'];
const now = await api('GET', `/guilds/${GUILD}/channels`);
const pos = order.map((n, i) => { const c = now.find(x => x.type === 4 && x.name === n); return c && { id: c.id, position: i }; }).filter(Boolean);
await api('PATCH', `/guilds/${GUILD}/channels`, pos);

// 5) re-post welcome
const get = n => now.find(c => norm(c.name) === norm(n))?.id;
const welcome = get('👋┃welcome');
const msgs = await api('GET', `/channels/${welcome}/messages?limit=20`);
for (const m of msgs) if (m.author?.bot) await api('DELETE', `/channels/${welcome}/messages/${m.id}`);
await api('POST', `/channels/${welcome}/messages`, { embeds: [{
  title: '🏁 Welcome to TORQUE EMPIRE!', color: 0xFF6D00,
  description:
    'Build your garage empire, repair cars, summon heroes and fight in the campaign, Arena and Rail Wars!\n\n' +
    `**1.** Read the <#${get('📜┃rules')}>\n` +
    `**2.** Check <#${get('📢┃announcements')}> for upcoming updates\n` +
    `**3.** Chat in <#${get('💬┃general')}> 🇬🇧 or in your language in **🌍 LANGUAGES**\n\n` +
    `🐞 Bugs → <#${get('🐞┃bug-reports')}>  •  💡 Ideas → <#${get('💡┃suggestions')}>  •  ❓ Help → <#${get('❓┃help')}>\n` +
    '*(help, bugs & suggestions in English please)*',
  image: { url: 'https://mariussima0077-cell.github.io/discord/banner.png' },
  footer: { text: 'Torque Empire • Torque Studios' },
}]});
// fix rules line 6
const rules = get('📜┃rules');
const rm = (await api('GET', `/channels/${rules}/messages?limit=10`)).find(m => m.author?.bot && m.embeds?.length);
if (rm) {
  const e = rm.embeds[0];
  e.description = e.description.replace(/\*\*6\.[^\n]*/, '**6. Use the right channel.** English in public channels; your own language in 🌍 LANGUAGES. Help, bugs & suggestions in English.');
  await api('PATCH', `/channels/${rules}/messages/${rm.id}`, { embeds: [{ title: e.title, color: e.color, description: e.description }] });
}
// 6) server icon
import { readFileSync } from 'node:fs';
const ic = readFileSync(new URL('./icon.png', import.meta.url)).toString('base64');
await api('PATCH', `/guilds/${GUILD}`, { icon: `data:image/png;base64,${ic}` });
console.log('icon set');
console.log('DONE ✅');
