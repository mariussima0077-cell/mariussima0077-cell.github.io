# TORQUE EMPIRE – Publicare Google Play · stare și pașii următori
*(trimite fișierul ăsta la începutul unui chat nou cu Claude. Arhiva NU mai trebuie: Claude ia jocul direct de pe GitHub și îl poate testa live)*

> 📜 **Ce am declarat la Google Play și ce NU avem voie să schimbăm → `PLAY_RULES.md`** (Claude îl citește înainte de orice schimbare).

## ✅ CE E GATA (12 noiembrie 2026, seara)
### Jocul
- **Joc online (v15)**: https://mariussima0077-cell.github.io/
  - Repository GitHub: `mariussima0077-cell/mariussima0077-cell.github.io` (public, GitHub Pages din `main` / root, `.nojekyll`).
  - Claude are acces de scriere la repository și poate porni jocul live (browser automat) ca să verifice și să facă capturi.
  - Versiunea curentă în `sw.js`: `const V='te-v16-21'`.
  - **v16-21 (14 nov)**: **primii 7 șoferi Common** au sprite sheet-uri (Zippy Zack, Pam Pedal, Lenny Lane, Speedy Sue, Kurt Kick, Bea Brake, Milo Mirror = `d0_0..d0_6`), făcute de Marius în ChatGPT (4×6, fond verde; rânduri: repaus · mers · alergat · scuter · mișcare proprie · bacșiș). Avatare cu fond gri Common (`tools/avatar.py <grad> <id>…`, acum cu culoare pe grad), atlas cu `tools/atlas_wide.py` (celule 384). Pe hartă (`drawDriver` în `index.html`, `CAMPAIGN.mini` acceptă acum și un număr de rând): mers, scuterul LUI din poză când merge pe banda de scutere (viteza tot din upgrade), mișcarea proprie la ~12 s când stă, la bacșiș se oprește 1 s și joacă rândul de bacșiș. Când stă la locul lui: doar gradul, fără nume. Nu intră în bătălie. ⏳ Urmează Uncommon (Rhonda Rev, Turbo Ted, Gina Gas, Ray Roundabout, Polly Parker, Vince Valet = `d1_0..d1_5`) – prompturile i-au fost date lui Marius (accente verde-smarald închis, nu #00FF00), apoi Rare/Epic/Legendary/Mythic și paznicii.
  - **v16-20 (14 nov)**: (1) **Eroii lucrează pe hartă**: eroul pus la un loc de mecanic apare ca figurină mică din sprite sheet-ul lui (`CAMPAIGN.mini` în `battle.js`, `drawMech` în `index.html`): mers, lucru (rândul de atac), repaus, victorie la reparație terminată. Lucrează pe o singură parte a mașinii (roata din față ↔ spate), gradul deasupra capului, numele ascuns cât lucrează. Aprobat de Marius după 2 clipuri de test. (2) **Summon Crew**: paginile separate Drivers / Guards au fost înlocuite cu un singur summon mixt „CREW” (`SMK=['m','c']`, `inCat`): grade ca la mecanici, apoi un erou din acel grad dintre toți șoferii + paznicii. **Bilet nou**: Crew Ticket `img/cticket.webp` (biletul roșu recolorat verde→mov), `G.h.ct`, pity `G.h.pity.c`. Câștig (doar jucând): hoț prins +1 (înainte dădea Recruit), cadouri Daily Quest la fel ca Recruit, Reputație +3, VIP +3, Idle 1 / 4 h. Jucătorii vechi primesc o dată 10 Crew Tickets (`ctInit`), jucătorii noi pornesc cu 5. ⏳ Marius trimite mai târziu pozele pentru șoferi și paznici (nu intră în bătălie).
  - **v16-19 (14 nov)**: Marius nu primea update-ul: fiecare update re-descărca TOT jocul (24 MB, `addAll` – dacă pica o singură poză, update-ul eșua). Acum `sw.js` are `H` (hash pe fișier): la update se descarcă doar codul (html/js) + fișierele schimbate, restul se copiază din cache-ul vechi; o poză care pică nu mai blochează update-ul. ⚠️ La fiecare update rulează `python3 tools/sw_hash.py` după ce schimbi `const V`.
  - **v16-18 (14 nov)**: **TOȚI eroii au acum skill unic** (Common → Epic, 34 de eroi), făcut după ce face fiecare în animația lui. Tabelul `SKP` în `battle.js` (nume, descriere, numere): mișcarea rămâne cea a clasei (săritură, dash, vindecare, bombă, fulger, scan), dar efectul e propriu (ex. Ollie – ulei care încetinește, Diesel Dave – fum care slăbește monștrii, Ricky – lovește și la întoarcere, Nitro Nina – racheta explodează, Big Mo – scut la toată echipa, Gloria – val pe tot câmpul, Prof. Ohm – bobină Tesla 4s, Hawk-Eye Hugo – lovitură de lunetist pe cel mai puternic monstru). Debuff nou: „weak” (monstrul dă −30% damage, iconiță craniu).
  - **v16-17 (14 nov)**: (1) Cărțile eroilor din bătălie au acum **cadrele de grad** ale lui Marius (`img/fr0-5`, `drawFCard` în `battle.js`): cadrul e întins doar pe o fâșie simplă din laterale (`FSTR`), colțurile/ornamentele rămân intacte; în fereastră: portret (capul sus), nume (se micșorează singur), HP + energie; pe plăcuța de jos `+stele` în culoarea gradului; TAP! = cadrul strălucește. (2) Update: **nu mai repornește singur** – apare fereastra „New update ready” cu **OK** (salvează + repornește) și **LATER** (versiunea nouă intră la următoarea pornire). Niciodată în bătălie.
  - **v16-16 (14 nov)**: cei 6 Legendary (Grigore Iron Hands, Mama Rosa, Duke Diamond, Sofia Lightning, Oracle Otto, Rex Redline = `m4_0..m4_5`) + 2 Mythic (The Torque King, Lady Overdrive = `m5_0..m5_1`) au avatare (fond auriu / roșu) + animații + **skill UNIC pe erou** (`HSK` + `SKF` în `battle.js`): Iron Quake (zid de pietre prin toți), Miracle Shift (vindecă + ÎNVIE un coleg o dată pe bătălie), Diamond Vortex (tornadă + îngheață), Thunderstorm (8 fulgere), Time Warp (încetinește + marchează, echipa atacă mai repede), Inferno Dash (arde), Gear Apocalypse (roți dințate + roată gigant), Overdrive (trece prin toți, arde). Efectele decupate din pozele lui Marius: `img/hero/fx_quake/holy/vortex/cloud/hglass/gearboom.webp`. NOU: **iconițe de buff/debuff deasupra barei de HP** (atac, viteză, crit, apărare, scut, vindecare, provocare; pe monștri: îngheț, stun, foc, încetinire, marcat) – clipesc în ultima secundă. Cadre sărite (aveau alți oameni desenați sau efecte tăiate pătrat): Rosa skill 3-4, Duke 3-4 (tornada folosită ca efect la monștri), Sofia rândul 5, King rândul 5 (doar explozia), Lady rândul 6 (clone) → victoria Lady = cadrele de repaus, Otto nu avea rând de lovit/KO → făcut din cadrele lui de repaus (înclinat/culcat). ⏳ Skill unic pentru Common–Epic: de făcut (acum doar Legendary + Mythic au skill propriu).
  - **v16-15 (14 nov)**: Gloria Gloss – Marius a trimis rândurile lipsă de lovit/KO (`img/sheets/m3_2_gloria_ko.webp`, micșorate 0.92 ca să aibă aceeași mărime) → adăugate ca rândurile 7-8 în atlas; `hk` în `SPRD` (h = lovită, s = amețită, ko = căderea în 5 cadre). `noKO` scos.
  - **v16-14 (14 nov)**: cei 7 **Epic** (Viktor the Surgeon, Big Mo, Gloria Gloss, Professor Ohm, Hawk-Eye Hugo, Aria Neon, Nitro Nina = `m3_0..m3_6`) au avatare (fond mov Epic) + animații în bătălie. Scripturi în repo: `tools/atlas_wide.py` (celule late 384 px → poza nu mai e tăiată când trece de coloana ei; fiecare bucată a pozei merge la cadrul ei; planșe cu 6 sau 7 rânduri; verdele din efecte/holograme devine transparent) și `tools/avatar.py`. Cod nou în `SPRD`: `w` (lățime celulă), `R` (ordinea rândurilor), `cs` (cadre skill), `lp`/`ld`/`lt` (salt/aterizare), `ds` (cadre dash), `dboom`, `noKO`. Rezolvări: Gloria – planșa n-are rând lovit/KO → flash pe cadrul de repaus, la KO cade pe spate; cadrele cu siluete de monștri (rândul 5, cadrele 3-4) sărite. Nina – explozia din poza ei (`fx_ninaboom`) apare pe fiecare monstru lovit de rachetă. Viktor – sare cu motorul deasupra capului, aterizare = cele 4 cadre cu trântitul motorului. Ohm/Aria/Big Mo – unele cadre treceau în coloana vecină → decupate pe bucăți. Skill-urile rămân pe clasă (Bruiser/Medic/…); skill unic pe erou = de făcut.
  - **v16-13 (14 nov)**: cei 8 Rare (Diesel Dave, Carlos Clutch, Max Brake, Rafael Chrome, Elena Spark, Lena Wire, Kenji Scan, Tess Turbo = `m2_0..m2_7`) au avatare (fond albastru Rare) + animații. Decupaj: `atlas3.py` (scoate și buzunarele de verde închise între brațe/corp și umbrele verzi de pe sol). Rezolvări: Elena – cadrul 4 din skill avea monștri negri desenați → sărit (`n:3`); Rafael – stropirea de apă era lipită de el → explozia de apă (`fx_waterboom`) apare la monstru, atacul cu jet albastru; Kenji – laser roșu din ochi; Max – aruncă cheia (look wrench). ⏳ Skill unic pe erou (cerut de Marius) – încă pe clasă, de făcut.
  - **v16-12 (14 nov)**: GĂSIT bugul testerului (Samsung S20 Ultra, Android 12, WebView Chrome 95): culorile `#RRGGBBAA` (ex. soarele `#fff1c1`+`cc`) aruncau eroare în `addColorStop` → bătălia nu pornea. Fix: polyfill la începutul `index.html` care, doar pe telefoanele care nu le înțeleg, le transformă în `rgba()` (gradient, fillStyle, strokeStyle, shadowColor). ⚠️ Pe viitor: în canvas nu folosi culoare+'cc'; folosește rgba().
  - **v16-11 (14 nov)**: actualizare automată – jocul verifică versiunea nouă la fiecare revenire în aplicație și la 15 min; când s-a instalat, salvează, arată „Update ready” și se reîncarcă singur (niciodată în timpul unei bătălii). Primul update după v16-11 tot trebuie prins o dată cu închis/deschis.
  - **v16-10 (14 nov)**: (1) un tester: FIGHT → îl întoarce la etape, bătălia nu pornește (nereprodus pe telefonul de test). Acum `safeStart()`: dacă pornirea crapă, reîncearcă fără efectele FX2; dacă tot crapă, arată eroarea + modelul telefonului → de cerut captura de la tester. (2) Bara de sus: cifrele (bani, REP, mașini) stau în căsuța lor și se micșorează singure (`fitT`); mașinile vândute scurtate (1.2K, 98K).
  - **v16-9 (14 nov)**: Leo Lift – căruciorul (luat din cadrul de repaus) pus lângă el în cadrele de skill, lovit, KO și ultima victorie, unde lipsea (aprobat de Marius).
  - **v16-8 (14 nov)**: cei 9 Uncommon (Gina Gear, Bruno Piston, Marco Torque, Leo Lift, Hank Hammer, Vic Spray, Ivy Volt, Nora Check, Axel Grind = `m1_0..m1_8`) au avatare + animații. Decupaj NOU pentru planșe cu mult verde (`atlas2.py`: scoate doar verdele pur de fond, legat în zone mari, păstrează verdele de pe haine/efecte). Rezolvări: Ivy – cadrul 4 din skill avea un fundal verde pătrat cu monștri → sărit; Leo – strălucirea de la vindecare era tăiată pătrat → margini estompate; Hank – explozia acidă tăiată din poza lui și oglindită (era lipită de el) → apare la monstru; Vic – aceeași explozie colorată mov. Culori proprii pt. efecte (`col` în `SPRD`): laser/fulger/jet verde la Nora, Ivy, Hank, mov la Vic, roșu la Pete/Kim.
  - **v16-7 (14 nov)**: Tom Wrench – cadrul de cădere din skill (rândul 4, cadrul 3) are un rucsac pe care nu-l poartă în rest → în aer rămâne pe cadrul de săritură, apoi aterizarea. Regula lui Marius: când o poză are o problemă, Claude caută singur o soluție (decupează, mută, prelungește) și îi spune ce a făcut.
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
- La fiecare update de joc: Claude schimbă `const V` din `sw.js` (următorul: `te-v16-19`), testează live și urcă pe GitHub. Pentru schimbări de joc **nu** trebuie pachet nou în Play.
- Pachet nou în Play (de ex. cu plăți) = semnat cu **aceeași cheie** din Drive și același Package ID `com.torqueempire.game`.
- Secretele (cheie dev, ADMIN_KEY, parole) stau DOAR în Google Drive, niciodată pe GitHub.
- Imaginile le alege mereu Marius; înainte de mecanici noi, Claude arată diferența înainte/după.
