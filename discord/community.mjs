// Torque Empire – enable Community + Onboarding (run once)
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
const guild = await api('GET', `/guilds/${GUILD}`);
let ch = await api('GET', `/guilds/${GUILD}/channels`);
const id = n => ch.find(c => norm(c.name) === norm(n))?.id;
const roles = await api('GET', `/guilds/${GUILD}/roles`);
const role = n => roles.find(r => r.name === n)?.id;

// 1) Community
if (!guild.features.includes('COMMUNITY')) {
  await api('PATCH', `/guilds/${GUILD}`, {
    features: [...guild.features, 'COMMUNITY'],
    verification_level: 1,            // verified e-mail
    explicit_content_filter: 2,       // scan media from everyone
    default_message_notifications: 1, // mentions only
    rules_channel_id: id('📜┃rules'),
    public_updates_channel_id: id('🛡️┃mod-chat'),
    preferred_locale: 'en-US',
    description: 'Official community of Torque Empire – garage tycoon & hero battles.',
  });
  console.log('Community ON');
} else console.log('Community already ON');

// 2) #announcements -> Announcement channel (players can Follow it)
const ann = ch.find(c => norm(c.name) === norm('📢┃announcements'));
if (ann && ann.type === 0) { await api('PATCH', `/channels/${ann.id}`, { type: 5 }); console.log('#announcements is now an Announcement channel'); }

// 3) Onboarding
let n = 0n;
const sid = () => String(((BigInt(Date.now()) - 1420070400000n) << 22n) + (n++));
ch = await api('GET', `/guilds/${GUILD}/channels`);
const defaults = ['👋┃welcome', '📜┃rules', '📢┃announcements', '💬┃general', '📸┃screenshots', '🧠┃tips-and-guides',
  '⚔️┃arena-and-pvp', '🎲┃off-topic', '🐞┃bug-reports', '💡┃suggestions', '❓┃help'].map(id).filter(Boolean);
const langIds = ch.filter(c => c.type === 0 && c.parent_id === ch.find(x => x.type === 4 && x.name === '🌍 LANGUAGES')?.id);
defaults.push(...langIds.map(c => c.id));

await api('PUT', `/guilds/${GUILD}/onboarding`, {
  enabled: true, mode: 0, default_channel_ids: defaults,
  prompts: [
    { id: sid(), type: 0, title: 'Do you play Torque Empire?', single_select: true, required: true, in_onboarding: true,
      options: [
        { id: sid(), title: 'Yes, I play!', description: 'Get the Player role', emoji_name: '🔧', role_ids: [role('🔧 Player')], channel_ids: [] },
        { id: sid(), title: 'Not yet, just looking', description: 'You can still chat everywhere', emoji_name: '👀', role_ids: [role('🔧 Player')], channel_ids: [] },
      ]},
    { id: sid(), type: 0, title: 'Notifications', single_select: false, required: false, in_onboarding: true,
      options: [
        { id: sid(), title: 'Ping me for new updates', description: 'Get the 🔔 Update Ping role', emoji_name: '🔔', role_ids: [role('🔔 Update Ping')], channel_ids: [id('📢┃announcements')] },
      ]},
  ],
});
console.log('Onboarding ON ✅');
