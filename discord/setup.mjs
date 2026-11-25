// Torque Empire – Discord server setup (run ONCE)
// Creates roles, categories, channels, permissions and posts the Welcome + Rules messages.
// Usage:  BOT_TOKEN=xxx GUILD_ID=123 node setup.mjs
// Safe to run again: existing roles/channels with the same name are skipped.

const TOKEN = process.env.BOT_TOKEN;
const GUILD = process.env.GUILD_ID;
if (!TOKEN || !GUILD) { console.error('Missing BOT_TOKEN or GUILD_ID'); process.exit(1); }

const API = 'https://discord.com/api/v10';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(method, path, body) {
  for (let i = 0; i < 5; i++) {
    const res = await fetch(API + path, {
      method,
      headers: { Authorization: `Bot ${TOKEN}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429) { const j = await res.json(); await sleep((j.retry_after || 1) * 1000 + 200); continue; }
    if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
    await sleep(300);
    return res.status === 204 ? null : res.json();
  }
  throw new Error('Rate limited too many times');
}

// ---- Permission bits ----
const P = {
  ADMIN: 1n << 3n, KICK: 1n << 1n, BAN: 1n << 2n, ADD_REACTIONS: 1n << 6n,
  VIEW: 1n << 10n, SEND: 1n << 11n, MANAGE_MESSAGES: 1n << 13n, ATTACH: 1n << 15n,
  READ_HISTORY: 1n << 16n, MENTION_EVERYONE: 1n << 17n, MANAGE_ROLES: 1n << 28n,
  MANAGE_THREADS: 1n << 34n, CREATE_PUBLIC_THREADS: 1n << 35n, SEND_IN_THREADS: 1n << 38n,
  TIMEOUT: 1n << 40n, CONNECT: 1n << 20n, SPEAK: 1n << 21n,
};
const bits = (...k) => k.reduce((a, n) => a | P[n], 0n).toString();
const NO_TALK = bits('SEND', 'CREATE_PUBLIC_THREADS', 'SEND_IN_THREADS');

// ---- Roles (top = highest) ----
const ROLES = [
  { key: 'dev',    name: '🛠️ Developer',  color: 0xE53935, hoist: true, permissions: bits('ADMIN') },
  { key: 'mod',    name: '🛡️ Moderator',  color: 0x1E88E5, hoist: true,
    permissions: bits('KICK', 'BAN', 'MANAGE_MESSAGES', 'MANAGE_THREADS', 'TIMEOUT', 'VIEW', 'SEND', 'READ_HISTORY', 'ADD_REACTIONS', 'ATTACH') },
  { key: 'tester', name: '🧪 Tester',     color: 0x8E24AA, hoist: true, permissions: '0' },
  { key: 'vip',    name: '💎 VIP Player', color: 0xFFB300, hoist: true, permissions: '0' },
  { key: 'player', name: '🔧 Player',     color: 0x43A047, hoist: false, permissions: '0' },
  { key: 'ro',     name: '🇷🇴 Română',     color: 0, hoist: false, permissions: '0', mentionable: false },
  { key: 'fr',     name: '🇫🇷 Français',   color: 0, hoist: false, permissions: '0', mentionable: false },
  { key: 'news',   name: '🔔 Update Ping', color: 0, hoist: false, permissions: '0', mentionable: true },
];

// ---- Channels ----
// lock: 'readonly' = only staff can write | 'hidden' = only given role sees | 'staff'
const LAYOUT = [
  { cat: '📌 START HERE', channels: [
    { name: '👋┃welcome',  lock: 'readonly', topic: 'Welcome to Torque Empire! Start here.' },
    { name: '📜┃rules',    lock: 'readonly', topic: 'Read the rules before chatting.' },
    { name: '🎭┃roles',    lock: 'readonly', topic: 'Pick your language and notification roles in Channels & Roles.' },
  ]},
  { cat: '📢 NEWS', channels: [
    { name: '📢┃announcements', lock: 'readonly', topic: 'Official news from the Torque Empire team.' },
    { name: '🆕┃updates',       lock: 'readonly', topic: 'Patch notes & new versions (posted by Torque Bot).' },
    { name: '🏁┃events',        lock: 'readonly', topic: 'Events, Grand Prix, World Boss, Rail Wars schedule.' },
  ]},
  { cat: '💬 COMMUNITY', channels: [
    { name: '💬┃general',        topic: 'Chat about anything Torque Empire. English please 🇬🇧' },
    { name: '📸┃screenshots',    topic: 'Show off your garage, heroes and big pulls!' },
    { name: '🧠┃tips-and-guides', topic: 'Team builds, hero roles, progression tips.' },
    { name: '⚔️┃arena-and-pvp',   topic: 'Arena, Rail Wars, tournaments.' },
    { name: '🎲┃off-topic',       topic: 'Anything not about the game.' },
  ]},
  { cat: '🛠️ SUPPORT', channels: [
    { name: '🐞┃bug-reports', topic: 'Found a bug? Version + phone model + what happened + screenshot.' },
    { name: '💡┃suggestions', topic: 'Ideas to make the game better. One idea per message.' },
    { name: '❓┃help',         topic: 'Questions about the game. Players and staff will help.' },
  ]},
  { cat: '🇷🇴 ROMÂNĂ', role: 'ro', channels: [
    { name: '💬┃general-ro', topic: 'Discuții în română despre Torque Empire.' },
    { name: '❓┃ajutor',      topic: 'Întrebări și ajutor în română.' },
  ]},
  { cat: '🇫🇷 FRANÇAIS', role: 'fr', channels: [
    { name: '💬┃general-fr', topic: 'Discussions en français sur Torque Empire.' },
    { name: '❓┃aide',        topic: 'Questions et aide en français.' },
  ]},
  { cat: '🔊 VOICE', channels: [
    { name: '🔊 Garage Talk', type: 2 },
    { name: '🔊 Battle Squad', type: 2 },
  ]},
  { cat: '🔒 STAFF', staff: true, channels: [
    { name: '🛡️┃mod-chat' },
    { name: '🤖┃bot-logs' },
    { name: '🧪┃testers', alsoRole: 'tester' },
  ]},
];

async function main() {
  const me = await api('GET', '/users/@me');
  console.log(`Logged in as ${me.username}`);
  const guild = await api('GET', `/guilds/${GUILD}`);
  const everyone = GUILD; // @everyone role id == guild id
  console.log(`Server: ${guild.name}`);

  // Roles
  const existingRoles = await api('GET', `/guilds/${GUILD}/roles`);
  const R = {};
  for (const r of ROLES) {
    const found = existingRoles.find(x => x.name === r.name);
    R[r.key] = found ? found.id : (await api('POST', `/guilds/${GUILD}/roles`, {
      name: r.name, color: r.color, hoist: r.hoist, permissions: r.permissions, mentionable: r.mentionable ?? false,
    })).id;
    console.log(`${found ? '=' : '+'} role ${r.name}`);
  }

  // Channels
  const existing = await api('GET', `/guilds/${GUILD}/channels`);
  const C = {};
  const staffAllow = { id: null, type: 0, allow: bits('VIEW', 'SEND', 'READ_HISTORY'), deny: '0' };

  for (const block of LAYOUT) {
    const catOverwrites = [];
    if (block.role) {
      catOverwrites.push({ id: everyone, type: 0, allow: '0', deny: bits('VIEW') });
      catOverwrites.push({ id: R[block.role], type: 0, allow: bits('VIEW', 'SEND', 'READ_HISTORY'), deny: '0' });
      catOverwrites.push({ ...staffAllow, id: R.mod });
    }
    if (block.staff) {
      catOverwrites.push({ id: everyone, type: 0, allow: '0', deny: bits('VIEW') });
      catOverwrites.push({ ...staffAllow, id: R.mod });
    }
    let cat = existing.find(c => c.type === 4 && c.name === block.cat);
    if (!cat) cat = await api('POST', `/guilds/${GUILD}/channels`, { name: block.cat, type: 4, permission_overwrites: catOverwrites });
    console.log(`${cat ? '' : ''}# ${block.cat}`);

    for (const ch of block.channels) {
      const ow = [...catOverwrites];
      if (ch.lock === 'readonly') {
        ow.push({ id: everyone, type: 0, allow: bits('VIEW', 'READ_HISTORY', 'ADD_REACTIONS'), deny: NO_TALK });
        ow.push({ ...staffAllow, id: R.mod });
      }
      if (ch.alsoRole) ow.push({ id: R[ch.alsoRole], type: 0, allow: bits('VIEW', 'SEND', 'READ_HISTORY'), deny: '0' });
      const found = existing.find(c => c.name === ch.name.toLowerCase() || c.name === ch.name);
      if (found) { C[ch.name] = found.id; console.log(`  = ${ch.name}`); continue; }
      const made = await api('POST', `/guilds/${GUILD}/channels`, {
        name: ch.name, type: ch.type ?? 0, parent_id: cat.id, topic: ch.topic, permission_overwrites: ow,
        rate_limit_per_user: ['💬┃general', '💡┃suggestions'].includes(ch.name) ? 5 : 0,
      });
      C[ch.name] = made.id;
      console.log(`  + ${ch.name}`);
    }
  }

  // Welcome + rules messages
  const welcome = C['👋┃welcome'], rules = C['📜┃rules'], roles = C['🎭┃roles'];
  await api('POST', `/channels/${welcome}/messages`, { embeds: [{
    title: '🏁 Welcome to TORQUE EMPIRE!',
    color: 0xFF6D00,
    description:
      'Build your garage empire, repair cars, summon heroes and fight in the campaign, Arena and Rail Wars!\n\n' +
      `**1.** Read the <#${rules}>\n` +
      `**2.** Pick your language & ping roles in <#${roles}> 🇷🇴 🇫🇷\n` +
      `**3.** Say hi in <#${C['💬┃general']}>\n\n` +
      `🐞 Bugs → <#${C['🐞┃bug-reports']}>  •  💡 Ideas → <#${C['💡┃suggestions']}>  •  ❓ Help → <#${C['❓┃help']}>`,
    footer: { text: 'Torque Empire • Torque Studios' },
  }]});
  await api('POST', `/channels/${rules}/messages`, { embeds: [{
    title: '📜 Server Rules',
    color: 0x1E88E5,
    description: [
      '**1. Be respectful.** No insults, hate, harassment or discrimination.',
      '**2. No spam.** No flooding, chain messages or self-promotion / invite links.',
      '**3. No cheating talk.** Hacks, mods, exploits or account selling = ban. Found an exploit? Report it in private to staff.',
      '**4. No scams.** Staff will NEVER ask for your password or payment info.',
      '**5. Keep it clean.** No NSFW, gore or illegal content.',
      '**6. Use the right channel.** English in public channels; 🇷🇴/🇫🇷 in their own sections.',
      '**7. Bug reports:** version + phone model + what happened + screenshot.',
      '**8. Listen to staff.** Moderators have the final word.',
      '',
      '⚠️ Warning → Timeout → Kick → Ban',
    ].join('\n'),
  }]});
  await api('POST', `/channels/${roles}/messages`, { content:
    '🎭 **Get your roles:** open **Channels & Roles** (top of the channel list) and choose:\n' +
    '🇷🇴 **Română** – unlocks the Romanian section\n🇫🇷 **Français** – unlocks the French section\n' +
    '🔔 **Update Ping** – get pinged for every new version' });

  console.log('\nDONE ✅  Role IDs (for Onboarding):');
  console.log(JSON.stringify(R, null, 2));
}

main().catch(e => { console.error(e.message); process.exit(1); });
