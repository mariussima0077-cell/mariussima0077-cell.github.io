// Torque Empire – 👋 WELCOME PING (Marius 26 nov 2026): every new member gets a personal welcome with a ping (@tag) in #welcome:
// the rules in short + where to go. No 24/7 bot needed: Discord's own "X joined" message lands in #welcome,
// this script (GitHub Actions, every 5 min) replies to each new one exactly once.
// Usage: BOT_TOKEN=.. GUILD_ID=.. node discord/greet.mjs
const TOKEN = process.env.BOT_TOKEN, GUILD = process.env.GUILD_ID;
const API = 'https://discord.com/api/v10';
const MAX_AGE_H = 3; // only joins from the last 3 hours (never spams old members)
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
const guild = await api('GET', `/guilds/${GUILD}`);
const ch = await api('GET', `/guilds/${GUILD}/channels`);
const get = n => ch.find(c => norm(c.name) === norm(n))?.id;
const welcome = get('👋┃welcome');
if (!welcome) throw new Error('#welcome not found');
// Discord's join messages must go to #welcome and be ON (flag 1 = suppress join notifications)
if (guild.system_channel_id !== welcome || (guild.system_channel_flags & 1)) {
  await api('PATCH', `/guilds/${GUILD}`, { system_channel_id: welcome, system_channel_flags: guild.system_channel_flags & ~1 });
  console.log('Join messages -> #welcome (ON)');
}
const link = (n, alt) => { const id = get(n); return id ? `<#${id}>` : alt; };
const msgs = await api('GET', `/channels/${welcome}/messages?limit=100`);
const done = new Set(msgs.filter(m => m.author?.id === guild.application_id || (m.author?.bot && m.message_reference)).map(m => m.message_reference?.message_id).filter(Boolean));
const since = Date.now() - MAX_AGE_H * 3600e3;
const joins = msgs.filter(m => m.type === 7 && !done.has(m.id) && Date.parse(m.timestamp) > since && !m.author?.bot).reverse();
for (const j of joins) {
  const u = j.author;
  await api('POST', `/channels/${welcome}/messages`, {
    content: `👋 Welcome to **Torque Empire**, <@${u.id}>! 🏁🔧`,
    allowed_mentions: { users: [u.id] },
    message_reference: { message_id: j.id, fail_if_not_exists: false },
    embeds: [{
      color: 0xFF6D00,
      title: '🏁 Glad to have you in the garage!',
      description: [
        `📜 **Rules in short** (full list in ${link('📜┃rules', '#rules')}):`,
        '• Be respectful – no insults, hate or harassment',
        '• No spam, ads or invite links',
        '• No cheats, hacks or account selling (= ban)',
        '• Staff will **never** ask for your password or payment info',
        '• English in public channels – your own language in **🌍 LANGUAGES**',
        '',
        '🚀 **Where to go:**',
        `📢 News & updates → ${link('📢┃announcements', '#announcements')}`,
        `🧪 Play before release → ${link('🧪┃play-before-release', '#play-before-release')}`,
        `💎 **100,000 free diamonds** (test gift) → ${link('💎┃free-diamonds', '#free-diamonds')}`,
        `🌍 Chat with everyone → ${link('🌍┃global-chat', '#global-chat')}`,
        `❓ Help → ${link('❓┃help', '#help')}  •  🐞 Bugs → ${link('🐞┃bug-reports', '#bug-reports')}  •  💡 Ideas → ${link('💡┃suggestions', '#suggestions')}`,
        '',
        '🎁 **Free gift:** in the game open **PROFILE → REWARDS → 💬 DISCORD REWARD** and get **500 💎 + 10 tickets of each type**!',
      ].join('\n'),
      thumbnail: u.avatar ? { url: `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=128` } : undefined,
      footer: { text: 'Torque Empire • Have fun! 🔧' },
    }],
  });
  console.log(`Welcomed ${u.username}`);
}
console.log(`DONE ✅ (${joins.length} new member(s))`);
