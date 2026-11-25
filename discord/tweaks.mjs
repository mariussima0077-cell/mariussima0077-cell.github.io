// Torque Empire – tweaks: owner gets Developer role, #general -> #global-chat, language channels -> "<lang>-chat"
const TOKEN = process.env.BOT_TOKEN, GUILD = process.env.GUILD_ID;
const API = 'https://discord.com/api/v10';
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function api(method, path, body) {
  for (let i = 0; i < 5; i++) {
    const res = await fetch(API + path, { method, headers: { Authorization: `Bot ${TOKEN}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 429) { const j = await res.json(); await sleep((j.retry_after || 1) * 1000 + 200); continue; }
    if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
    await sleep(400);
    return res.status === 204 ? null : res.json();
  }
}
const norm = s => s.toLowerCase().replace(/\s/g, '');
const guild = await api('GET', `/guilds/${GUILD}`);
const roles = await api('GET', `/guilds/${GUILD}/roles`);
const dev = roles.find(r => r.name === '🛠️ Developer');
await api('PUT', `/guilds/${GUILD}/members/${guild.owner_id}/roles/${dev.id}`);
console.log('Owner got 🛠️ Developer');

const ch = await api('GET', `/guilds/${GUILD}/channels`);
const gen = ch.find(c => norm(c.name) === norm('💬┃general'));
if (gen) { await api('PATCH', `/channels/${gen.id}`, { name: '🌍┃global-chat', topic: 'Global chat for everyone – English please 🇬🇧' }); console.log('#general -> #global-chat'); }
const langCat = ch.find(c => c.type === 4 && c.name === '🌍 LANGUAGES');
for (const c of ch.filter(c => c.parent_id === langCat?.id && c.type === 0)) {
  if (c.name.endsWith('-chat')) continue;
  await api('PATCH', `/channels/${c.id}`, { name: `${c.name}-chat` }); console.log(`${c.name} -> ${c.name}-chat`);
}
const NEW = [['🇰🇷┃한국어-chat','한국어 채팅'],['🇨🇳┃中文-chat','中文聊天'],['🇯🇵┃日本語-chat','日本語チャット'],['🇻🇳┃tiếng-việt-chat','Trò chuyện tiếng Việt'],['🇹🇭┃ไทย-chat','แชทภาษาไทย'],['🇮🇳┃हिन्दी-chat','हिन्दी चैट']];
const now = await api('GET', `/guilds/${GUILD}/channels`);
for (const [name, topic] of NEW) {
  if (now.find(c => norm(c.name) === norm(name))) continue;
  await api('POST', `/guilds/${GUILD}/channels`, { name, type: 0, parent_id: langCat.id, topic: `${topic} • Help & bug reports in English channels`, rate_limit_per_user: 3 });
  console.log(`+ ${name}`);
}
console.log('DONE ✅');
