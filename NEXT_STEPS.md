# TORQUE EMPIRE – Publicare Google Play · stare și pașii următori
*(trimite fișierul ăsta la începutul unui chat nou cu Claude. Arhiva NU mai trebuie: Claude ia jocul direct de pe GitHub și îl poate testa live)*

> 📜 **Ce am declarat la Google Play și ce NU avem voie să schimbăm → `PLAY_RULES.md`** (Claude îl citește înainte de orice schimbare).

## ✅ CE E GATA (12 noiembrie 2026, seara)
### Jocul
- **Joc online (v15)**: https://mariussima0077-cell.github.io/
  - Repository GitHub: `mariussima0077-cell/mariussima0077-cell.github.io` (public, GitHub Pages din `main` / root, `.nojekyll`).
  - Claude are acces de scriere la repository și poate porni jocul live (browser automat) ca să verifice și să facă capturi.
  - Versiunea curentă în `sw.js`: `const V='te-v16-6'`.
  - **v16-6 (14 nov)**: primii 10 mecanici Common au avatare + ANIMAȚII în bătălie din sprite sheet-urile lui Marius (Rusty Joe, Benny Bolt, Tom Wrench, Ollie Oil, Mia Brush, Dan Dent, Sam Spark, Pete Gauge, Kim Tablet, Ricky Rev = `m0_0..m0_9`). Atlas `img/hero/sp_m0_X.webp` (4×6 cadre de 192 px, fond scos), originalele în `img/sheets/`. Cod: `SPRD` / `sprFrame` / `drawSprHero` în `battle.js` (a = punctul picioarelor, m = de unde iese efectul atacului, ca laserul/fulgerul/vopseaua să continue până la monstru). Explozia de vopsea din poză (Mia, Dan) apare la bomba-skill. Pentru eroi noi: adaugă-i în `SPRD` + `HPIC` (index.html) + `sw.js`.
  - **v16-5 (14 nov)**: avatarele lui Rusty Joe, Benny Bolt, Tom Wrench, Ollie Oil, Mia Brush = decupate din sprite sheet-urile lui Marius (4×6 cadre, 256 px, fond verde) → `img/hero/m0_0..4.webp` (+ `…s.webp` = siluetă pt. eroi nedescoperiți). Apar peste tot (summon, colecție, echipă, bătălie) prin `HPIC` din `portrait()`. Sheet-urile întregi pot fi folosite mai târziu pt. animațiile din bătălie (rânduri: idle, mers, atac, skill, lovit/KO, victorie).
  - **v16-4 (14 nov)**: un tester a zis că „nu poate ataca” în bătălie. Nu s-a reprodus (eroii atacă singuri, testat pe 3 ecrane + telefon lent). Adăugat: mesaj la primele 3 bătălii + la atingerea câmpului („mechanics attack on their own · tap a card when it shows TAP!”); atingerea cardurilor calculată față de canvas (mai sigur pe unele telefoane). De aflat de la tester: model telefon + captură.
  - **v16-2 (13 nov)**: login cu Google (opțional) + salvare în cloud – `cloud.js`, căsuța „☁️ Cloud save” jos în Shop. ⚠️ Pornește abia după ce Marius face **Client ID-ul OAuth** (vezi mai jos). Politica de confidențialitate și pagina de ștergere actualizate.
  - **v16-1 (13 nov)**: VIP Pass NU mai dă summon gratuit zilnic (era element aleatoriu plătit → 18+ Brazilia, interzis în Belgia). Idle Rewards: 4h standard + 30 min pe nivel VIP (VIP 20 = 14h); VIP Pass nu crește orele. Diamante: de adăugat mai târziu. În Play: Classification → „éléments aléatoires” = **Non**.
  - **v16 (13 nov)**: deschise Car Wash (Rep 2, $1.500), Gas Station (Rep 3, $4.000), Car Factory (Rep 5, $60.000) pe o stradă nouă sub drumul camionului (pozele lui Marius `img/x_wash1-4`, `x_gas1-4`, `x_factory1-4`; poza se schimbă LV1-4, LV5-10 doar beneficii). Spălătoria: mașini trec prin tunel, + bonus la vânzare. Benzinăria: mașini la pompe (2/2/3/4), camionul revine mai repede. Fabrica: mașină nouă vândută direct. Botul acceptă acum suma nivelurilor până la 140. Rail Terminal și Collection rămân „coming soon”. Prețuri/timpi alese fără simulator → de ajustat după test.
- **Politica de confidențialitate**: https://mariussima0077-cell.github.io/privacy.html (e-mail: torqueempirehelp@gmail.com) – menționează și serverul anti-cheat.
- **Cont Google al jocului**: torqueempirehelp@gmail.com (Gmail și Google Drive conectate la Claude).

### Securitate (făcut azi)
- Pe site (browser) pachetele din Shop **nu mai sunt gratis** – afișează „Packs are available in the Torque Empire app on Google Play”.
- **Mod de test doar pentru Marius**: link secret `?dev=...` (îl găsești în Google Drive, fișierul „Torque Empire - link test”). `?dev=off` îl oprește. Cheia NU se scrie niciodată pe GitHub (repository-ul e public).
- În modul de test există `__DEV.startBattle(etapa)` (Claude îl folosește pentru capturi).
- Scoase mesajele „Test version” din Shop/VIP/oferta ×2 și comenzile ascunse de debug (`window.__TE` are doar ce trebuie, `window.CAMPAIGN` doar `open/close/openGear`).

### Botul anti-cheat Torque Guard (GRATIS, Cloudflare Free)
- Adresa: https://torque-guard.torqueempirehelp.workers.dev (răspunde `{"ok":true,"name":"Torque Guard"}`).
- Cont Cloudflare: torqueempirehelp@gmail.com · worker `torque-guard` · bază D1 `torque_guard` (ID `322aec9e-ddaa-4741-874e-5a2105c89523`, 5 tabele create).
- **Se instalează singur din GitHub** (Workers Builds, root directory `/server`, `npx wrangler deploy`) la fiecare push pe `main`. Config: `server/wrangler.toml` (D1 + cron la 10 minute + `PACKAGE_NAME`).
- Jocul trimite datele la bot (`secure.js` → `const API = 'https://torque-guard.torqueempirehelp.workers.dev'`).
- Cheia de admin + linkul paginii de admin: Google Drive, fișierul „Torque Empire - bot anti-cheat (Torque Guard)”.
- Limite gratuite: 100.000 cereri/zi, D1 5 mil. citiri + 100.000 scrieri/zi → ajunge pentru câteva sute de jucători activi/zi. Peste asta: optimizăm botul sau plan Cloudflare ~5 $/lună. Dacă se depășește, jocul merge normal, doar botul stă până a doua zi.
- ⚠️ Claude NU are acces la contul Cloudflare – pașii acolo îi face Marius (Claude ghidează). Claude NU poate deschide adresa botului din sandbox (doar Marius o poate verifica în Chrome).

### Magazin (Store listing)
- Texte în engleză → `store/STORE_LISTING.md` (titlu „Torque Empire: Garage Tycoon”, descriere scurtă 79/80, descriere lungă).
- 6 capturi 1080×1920 → `store/play-screenshot-1..6.png` (toate din v15; nr. 3 = bătălie „Dusk Acid Throne”). Script: capturile au titlu sus, fundal închis cu portocaliu.
- Icon 512: `store/play-icon-512.png` · Feature graphic: `store/feature-graphic-1024x500.png`.

### Pachet Android (PWABuilder)
- Package ID: `com.torqueempire.game` · nume: Torque Empire · fullscreen.
- ⚠️ **Fără Play Billing** → în aplicație plățile nu merg încă („Google Play payments are not available”). Pachetul cu plăți se face mai târziu.
- Cheia de semnare + parolele: Google Drive → folderul **„Torque Empire - Cheie Google Play (NU STERGE)”** (`signing.keystore` + `signing-key-info.txt`).
- ⚠️ Fișierul `.aab` e doar în zip-ul PWABuilder de pe telefon → **de urcat și el în același folder din Drive**, ca să nu se piardă.
- Amprenta cheii de upload (SHA-256), deja în `.well-known/assetlinks.json`:
  `2F:F9:21:56:9B:2B:DC:23:9C:4F:02:02:E9:B6:35:F0:B5:99:62:D1:EB:3F:E9:74:2B:FF:45:C6:22:E8:35:A7`

### Cont Google Play
- Cont de dezvoltator **aprobat** (13 nov): „Torque Studios”, personal.
- **Aplicația creată** (13 nov): Torque Empire: Garage Tycoon · `com.torqueempire.game` · Jeu · Sans frais · en-US.

## ⏳ CE A MAI RĂMAS
### Acum (cât așteptăm Google)
- [ ] **Demo efecte noi în bătălii (FX v2)** – deschide jocul cu `?fx=2` la final de link, intră într-o bătălie și apasă butonul mov „FX: NEW / FX: OLD” ca să compari. Pentru jucători e OPRIT până aprobă Marius. Texturi gratuite CC0 (Kenney Particle Pack) în `img/fx/`. Dacă e aprobat: FX2 devine implicit și butonul de comparație dispare.
- [ ] **Client ID pentru login Google** (Google Cloud Console, contul torqueempirehelp@gmail.com): proiect nou → OAuth consent screen (External, „Torque Empire”, publicat) → Credentials → OAuth client ID → *Web application* → Authorized JavaScript origins: `https://mariussima0077-cell.github.io` → copiezi Client ID-ul (`…apps.googleusercontent.com`) și i-l dai lui Claude.
- [ ] Verifică dacă `ADMIN_KEY` e pus în Cloudflare (torque-guard → Settings → Variables and Secrets → Secret). Test: linkul de admin din Drive trebuie să arate pagina „🛡️ Torque Guard” (nu „no”).
- [ ] Urcă `.aab`-ul în Google Drive (folderul cu cheia).
- [ ] **Strânge 12 testeri** (adrese Gmail: prieteni, familie, sau r/AndroidClosedTesting). Claude poate scrie mesajul de invitație.

### După ce Google aprobă contul
- [x] Play Console → **Create app** (făcut 13 nov). Categoria Simulation se pune la fișa magazinului.
- [ ] **Closed testing**: urci `.aab`-ul.
- [ ] **Setup → App signing**: copiezi **SHA-256 al cheii Google** și i-l dai lui Claude → îl adaugă în `assetlinks.json` (altfel apare bara de adresă în aplicație).
- [ ] Fișa aplicației: textele din `store/STORE_LISTING.md`, icon, feature graphic, cele 6 capturi, privacy policy.
- [ ] **Data safety**, **Content rating** (IARC), **Target audience 13+**, **Ads: No** – răspunsurile sunt în `PLAY_RULES.md` (s-au schimbat cu login-ul Google: + „User IDs”, opțional, + ștergere cont).

### Testul închis – 12 testeri × 14 zile
- [ ] groups.google.com → grup „torque-empire-testers”.
- [ ] Closed testing → Testers: adresa grupului → **linkul de înscriere**.
- [ ] Testerii rămân înscriși **14 zile la rând** și joacă puțin.
- [ ] După 14 zile: ceri accesul la **Production**.

### Mai târziu
- [ ] Pachet Android **cu plăți** (Play Billing) + produsele în Play Console: `vip_car` 3.99 €, `vip_mechanic` 2.99 €, `battle_speed_x2` 4.99 €, abonament `vip_pass_monthly` 5.99 €/lună.
- [ ] Cont de serviciu Google pentru bot (secretul `GOOGLE_SA` în Cloudflare), ca botul să confirme cumpărăturile (altfel Google le rambursează după 3 zile).

## ⚠️ REGULI
- **Nu mai resetăm salvarea** la update-uri (cheia rămâne `torqueEmpire_v15`).
- Orice schimbare se verifică întâi cu `PLAY_RULES.md`.
- La fiecare update de joc: Claude schimbă `const V` din `sw.js` (următorul: `te-v16-7`), testează live și urcă pe GitHub. Pentru schimbări de joc **nu** trebuie pachet nou în Play.
- Pachet nou în Play (de ex. cu plăți) = semnat cu **aceeași cheie** din Drive și același Package ID `com.torqueempire.game`.
- Secretele (cheie dev, ADMIN_KEY, parole) stau DOAR în Google Drive, niciodată pe GitHub.
- Imaginile le alege mereu Marius; înainte de mecanici noi, Claude arată diferența înainte/după.
