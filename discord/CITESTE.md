# Torque Empire – Discord + Torque Bot (gratuit)

## Ce face
- **setup.mjs** – construiește serverul o singură dată: 8 roluri, 8 categorii, 23 de canale (inclusiv cele vocale), permisiuni, plus mesajele de Welcome, Rules și Roles.
- **announce.mjs** – Torque Bot postează în #updates anunțul de versiune nouă, cu ping pentru cei care au rolul 🔔 Update Ping.
- **Bun venit + rol automat** – le face Discord singur prin Onboarding: e gratuit, merge 24/7 și nu are nevoie de niciun server.

## Pași pe laptop (~10 min)
1. **Discord → + → Create My Own → „Torque Empire”.**
2. Intră pe **discord.com/developers → New Application „Torque Bot” → Bot → Reset Token** și copiază token-ul. Nu-l da nimănui.
3. **OAuth2 → URL Generator:** bifezi `bot` + `Administrator`, deschizi linkul și adaugi botul pe server.
4. **Setări Discord → Advanced → Developer Mode ON**, apoi click dreapta pe server → **Copy Server ID**.
5. Pui folderul `discord/` și fișierul `.github/workflows/discord.yml` în repo-ul de GitHub.
   - Mergi la **Settings → Secrets → Actions** și adaugi `DISCORD_BOT_TOKEN` și `DISCORD_GUILD_ID`.
   - Apoi **Actions → Discord (Torque Bot) → Run workflow → setup**. Serverul se construiește singur.
6. Pe Discord: **Server Settings → Enable Community**, apoi **Onboarding**:
   - rol implicit **🔧 Player**;
   - întrebarea „Language?” cu răspunsurile 🇷🇴 / 🇫🇷 (dau rolurile);
   - întrebarea „Update pings?” cu răspunsul 🔔.
   - La **System Messages**, canalul este 👋┃welcome.
7. În **#updates → Edit Channel → Integrations → Webhooks → New** copiezi URL-ul și îl pui ca secret `DISCORD_UPDATES_WEBHOOK`. ID-ul rolului 🔔 îl pui ca secret `DISCORD_PING_ROLE_ID`.

## Anunț de update
**Actions → Run workflow → announce**, cu versiunea `v16-150` și notele `Hero nou|Arena fix|Bug fixes`.

După setup, îi poți scoate botului rolul de Administrator, pentru că anunțurile merg prin webhook.

## Anunț liber (text + poze)
Un folder nou în `discord/posts/<nume>/` cu `text.md` (max 2000 de caractere) și pozele `1.jpg`, `2.jpg`… Când urcă pe `main`, Torque Bot îl postează singur în #announcements (workflow „Discord post”). Se poate reposta din Actions → Discord post → Run workflow → numele folderului.
