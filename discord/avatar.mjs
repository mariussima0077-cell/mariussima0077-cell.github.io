// Torque Bot avatar (Marius 26 nov 2026): the crash-test face of ANVIL. Usage: BOT_TOKEN=.. node discord/avatar.mjs
import { readFileSync } from 'node:fs';
const b64 = readFileSync(new URL('./bot_avatar.png', import.meta.url)).toString('base64');
const r = await fetch('https://discord.com/api/v10/users/@me', { method: 'PATCH', headers: { Authorization: `Bot ${process.env.BOT_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar: `data:image/png;base64,${b64}` }) });
if (!r.ok) throw new Error(`PATCH /users/@me -> ${r.status} ${await r.text()}`);
console.log('Avatar set ✅');
