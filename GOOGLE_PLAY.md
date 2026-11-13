# Torque Empire → Google Play (pași de pe telefon)

Tot ce scrie aici se poate face din browserul telefonului (Chrome). Ordinea contează.

## 0. Ce e deja gata în arhivă
- `manifest.webmanifest`, `sw.js` (jocul merge offline și pornește repede), `icons/` (192, 512, maskable), `privacy.html` (politica de confidențialitate – **scrie e-mailul tău** la punctul 6).
- `store/play-icon-512.png` și `store/feature-graphic-1024x500.png` pentru pagina din magazin. Capturi pentru magazin: din folderul `assets/` (ex. `screen-v15-*.png`).
- `secure.js` = plăți reale Google Play + anti-cheat în joc. `server/` = **botul online** (Torque Guard) care verifică non-stop.
- `.well-known/assetlinks.json` = legătura dintre aplicație și site (completezi amprenta la pasul 5).

## 1. Cont de dezvoltator Google Play
- play.google.com/console → creezi contul (taxă unică **25 $**, verificare identitate).
- ⚠️ La conturile **personale noi**, Google cere un **test închis cu cel puțin 12 testeri timp de 14 zile** înainte de publicarea pentru toată lumea (verifică regula exactă în Play Console când îți faci contul). Poți folosi prieteni/familie cu cont Google.

## 2. Pui jocul pe internet (HTTPS, gratis) – Cloudflare Pages
1. dash.cloudflare.com → cont gratuit → **Workers & Pages → Create → Pages → Upload assets**.
2. Nume proiect: `torque-empire` → încarci **arhiva zip mică** (conținutul folderului jocului). Primești adresa `https://torque-empire.pages.dev`.
3. Deschide adresa în Chrome și verifică jocul.

## 3. Botul anti-cheat (Torque Guard) – Cloudflare Worker + D1 (gratis, merge 24/7)
1. **Workers & Pages → D1 → Create database** → nume `torque_guard`. Intră în ea → **Console** → copiezi tot din `server/schema.sql` → **Execute**.
2. **Workers & Pages → Create → Worker** → nume `torque-guard` → **Deploy** → **Edit code** → ștergi tot, lipești conținutul din `server/worker.js` → **Deploy**.
3. Worker → **Settings → Bindings → Add → D1 database**: variable name `DB`, baza `torque_guard`.
4. Worker → **Settings → Variables and secrets** (tip *Secret*):
   - `ADMIN_KEY` = o parolă lungă inventată de tine (cu ea vezi pagina admin)
   - `PACKAGE_NAME` = `com.torqueempire.game`
   - `GOOGLE_SA` = fișierul JSON al contului de serviciu (pasul 7 – îl pui după ce ai Play Console)
5. Worker → **Settings → Triggers → Cron Triggers → Add** → `*/10 * * * *` (botul verifică toți jucătorii la 10 minute).
6. Copiezi adresa worker-ului (ex. `https://torque-guard.NUMELE-TAU.workers.dev`) și o pui în `secure.js`, rândul `const API = '...'`. Reîncarci arhiva pe Pages (pasul 2, „Create new deployment").
7. Pagina ta de control: `https://torque-guard.NUMELE-TAU.workers.dev/admin?key=PAROLA` → vezi jucătorii suspecți, banați, butoane **ban / unban**.

Ce face botul: compară fiecare raportare cu cea dinainte (bani, bilete, puncte VIP, nivele, stage-uri – nu pot crește mai repede decât permite jocul), primește semnalele din joc (salvare editată, ceas dat înapoi, speed-hack), la 10 minute verifică ultimele 24 h ale fiecărui jucător, găsește achiziții „împrumutate" (același token la mai mulți jucători) și **banează automat** la 100 de puncte de suspiciune. Jucătorul banat vede un ecran „Account blocked" cu ID-ul lui.

## 4. Pachetul Android – PWABuilder
1. pwabuilder.com → pui adresa de la pasul 2 → **Package for stores → Android**.
2. Package ID: `com.torqueempire.game` · App name: `Torque Empire` · Display mode: fullscreen · Signing key: **New** (PWABuilder îl creează).
3. Descarci zip-ul. **Păstrează-l în siguranță** (Google Drive): conține cheia de semnare și parolele – fără ele nu mai poți face update.
4. În zip ai fișierul `.aab` (îl urci în Play Console) și `assetlinks.json`.

## 5. Legătura site ↔ aplicație
- Play Console → aplicația ta → **Setup → App signing** → copiezi **SHA-256** (cheia Google) și îl pui în `.well-known/assetlinks.json` (poți pune și amprenta din zip-ul PWABuilder, ambele în listă). Reîncarci pe Pages. Fără asta aplicația arată o bară de adresă sus.

## 6. Play Console – fișa aplicației
- **Create app** → Game · Free · nume, descriere scurtă/lungă (engleză).
- Grafică: icon 512 (`store/play-icon-512.png`), feature graphic (`store/feature-graphic-1024x500.png`), capturile `store/play-screenshot-1..6.png` (1080×1920).
- **Privacy policy**: `https://mariussima0077-cell.github.io/privacy.html`.
- **Data safety**: răspunsurile exacte sunt în `PLAY_RULES.md` (secțiunea „Data safety”) – de la v16-2 există login Google opțional (salvare în cloud), deci răspunsurile s-au schimbat.
- **Content rating** (chestionar IARC): violență de desene animate (monștri din piese de mașină), fără sânge; are achiziții în aplicație; casele de noroc: summon-ul e **doar cu bilete câștigate în joc, nu cu bani** (șansele sunt afișate în Rate Info).
- **Target audience**: 13+ (nu „pentru copii").  **Ads**: No.

## 7. Plăți reale (pachetele din Shop)
1. Play Console → **Monetize → Products → In-app products**: `vip_car` (3.99 €), `vip_mechanic` (2.99 €), `battle_speed_x2` (4.99 €). **Subscriptions**: `vip_pass_monthly` (5.99 € / lună).
2. Cont de serviciu pentru bot: Google Cloud Console → IAM → Service accounts → Create → **Keys → Add key → JSON** (descarci). Play Console → **Users and permissions → Invite** e-mailul contului de serviciu, cu „View financial data" + „Manage orders and subscriptions". Lipești JSON-ul în secretul `GOOGLE_SA` (pasul 3.4).
3. ⚠️ Plățile din joc funcționează doar dacă pachetul Android are **Play Billing** activat (`"playBilling": {"enabled": true}` – opțiune din Bubblewrap). Dacă PWABuilder nu îți oferă opțiunea, prima versiune poate ieși fără plăți (în aplicație butoanele spun „Google Play payments are not available"), iar pachetul cu plăți îl facem apoi (spune-mi și pregătesc varianta).
4. Fiecare cumpărare e verificată și **confirmată (acknowledge) de bot** – altfel Google o rambursează după 3 zile. De asta botul trebuie să fie pornit înainte de plăți.

## 8. Update-uri după publicare
- ⚠️ De acum **nu mai resetăm salvarea** la fiecare versiune (jucătorii își pierd progresul). În v15 cheia e `torqueEmpire_v15` – la prima versiune publicată o păstrăm pentru totdeauna.
- La fiecare update de joc: schimbi `const V='te-v15-1'` din `sw.js` (ex. `te-v16-1`) ca telefoanele să ia fișierele noi, apoi reîncarci pe Pages. Pentru simple schimbări de joc **nu** trebuie pachet nou în Play – aplicația încarcă site-ul.
