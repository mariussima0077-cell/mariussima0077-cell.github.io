// Torque Bot – posts an update announcement in #announcements (uses the bot token, no webhook)
// Usage: BOT_TOKEN=.. GUILD_ID=.. node announce.mjs "v16-150" "New hero Goliath|Arena rewards x2|Bug fixes" [soon]
// 3rd arg "soon" = upcoming update (what it will contain); default = update is live.
const TOKEN = process.env.BOT_TOKEN, GUILD = process.env.GUILD_ID, PLAY = process.env.PLAY_URL;
const [version, notesRaw = '', kind = 'live'] = process.argv.slice(2);
if (!TOKEN || !GUILD || !version) { console.error('Missing BOT_TOKEN / GUILD_ID / version'); process.exit(1); }
const API = 'https://discord.com/api/v10';
const api = async (m, p, b) => { const r = await fetch(API + p, { method: m, headers: { Authorization: `Bot ${TOKEN}`, 'Content-Type': 'application/json' }, body: b ? JSON.stringify(b) : undefined }); if (!r.ok) throw new Error(`${m} ${p} -> ${r.status} ${await r.text()}`); return r.status === 204 ? null : r.json(); };
const norm = s => s.toLowerCase().replace(/\s/g, '');

const ch = (await api('GET', `/guilds/${GUILD}/channels`)).find(c => norm(c.name) === norm('📢┃announcements'));
const ping = (await api('GET', `/guilds/${GUILD}/roles`)).find(r => r.name === '🔔 Update Ping')?.id;
const notes = notesRaw.split('|').map(s => s.trim()).filter(Boolean);
const soon = kind === 'soon';

const msg = await api('POST', `/channels/${ch.id}/messages`, {
  content: ping ? `<@&${ping}>` : undefined,
  allowed_mentions: { roles: ping ? [ping] : [] },
  embeds: [{
    title: soon ? `🔜 Coming soon: Torque Empire ${version}` : `🆕 Torque Empire ${version} is live!`,
    color: soon ? 0x1E88E5 : 0xFF6D00,
    description: (notes.length ? notes.map(n => `🔧 ${n}`).join('\n') : (soon ? 'New update on the way!' : 'New update available!')) +
      (soon ? '' : (PLAY ? `\n\n▶️ **[Update on Google Play](${PLAY})**` : '\n\n▶️ Update the game to get the new version.')),
    footer: { text: soon ? 'Torque Empire • Upcoming update' : 'Torque Empire • Patch notes' },
    timestamp: new Date().toISOString(),
  }],
});
if (ch.type === 5) { try { await api('POST', `/channels/${ch.id}/messages/${msg.id}/crosspost`); } catch {} }
console.log(`Posted ${version} ✅`);
