// Torque Bot – posts a nice "new update" message to #updates via a Discord webhook.
// Usage: WEBHOOK_URL=... node announce.mjs "v16-150" "New hero Goliath|Arena rewards x2|Bug fixes"
//   optional env: PING_ROLE_ID (the 🔔 Update Ping role), PLAY_URL (Google Play link)

const url = process.env.WEBHOOK_URL;
const [version, notesRaw = ''] = process.argv.slice(2);
if (!url || !version) { console.error('Usage: WEBHOOK_URL=... node announce.mjs <version> "<note1|note2|...>"'); process.exit(1); }

const notes = notesRaw.split('|').map(s => s.trim()).filter(Boolean);
const ping = process.env.PING_ROLE_ID;
const play = process.env.PLAY_URL;

const body = {
  username: 'Torque Bot',
  content: ping ? `<@&${ping}>` : undefined,
  allowed_mentions: { roles: ping ? [ping] : [] },
  embeds: [{
    title: `🆕 Torque Empire ${version} is live!`,
    color: 0xFF6D00,
    description: (notes.length ? notes.map(n => `🔧 ${n}`).join('\n') : 'New update available!') +
      (play ? `\n\n▶️ **[Update on Google Play](${play})**` : '\n\n▶️ Update the game to get the new version.'),
    footer: { text: 'Torque Empire • Patch notes' },
    timestamp: new Date().toISOString(),
  }],
};

const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
if (!res.ok) { console.error('Discord error', res.status, await res.text()); process.exit(1); }
console.log(`Posted ${version} ✅`);
