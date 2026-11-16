# TORQUE EMPIRE – Ce am declarat la Google Play și ce NU avem voie să schimbăm

*Claude citește fișierul ăsta ÎNAINTE de orice schimbare în joc. Dacă Marius cere ceva ce se lovește de o regulă de aici, Claude îi spune ÎNAINTE să facă schimbarea: ce regulă e încălcată, ce ar trebui actualizat în Play Console și dacă se poate face deloc.*

Ultima actualizare: 15 noiembrie 2026 (v16-45 – online: clasament, chat, arenă, Cup).

---

## 1. Ce e completat în Play Console (stare reală)

| Secțiune | Ce am pus | Stare |
|---|---|---|
| Cont dezvoltator | „Torque Studios”, cont **personal** | ✅ aprobat 13 nov |
| Aplicația | Torque Empire: Garage Tycoon · `com.torqueempire.game` · **Jeu** · **Sans frais (gratuit)** · limba en-US | ✅ creată 13 nov |
| Classification / éléments aléatoires | **Non** (summon doar cu bilete și **diamante câștigate în joc** – Recruit / Crew / Gear Tickets + din v16-37 diamante 💎 (100 = 1 summon); VIP Pass fără summon gratuit; biletele și diamantele **nu se vând niciodată** pe bani reali) | ✅ ales de Marius (v16-1) |
| Data safety | vezi secțiunea 3 de mai jos | ✅ 16 nov 2026: adăugat Personal info → **Name** + Messages → **Other in-app messages** (colectate, nepartajate, opționale, funcționarea aplicației) – trimis la examinare |
| Content rating (IARC) | violență cartoon (fantastic, contra creaturi ne-umane, fără sânge), achiziții în aplicație fără elemente aleatorii, fără jocuri de noroc · „Users can interact” = DA + blocare/raportare/moderare = DA, „Shares location” = NU → **PEGI 3, USK 12** | ✅ refăcut 16 nov 2026 (v16-45) și trimis la examinare |
| Target audience | **13+** (NU pentru copii) | ⏳ de completat |
| Ads | **No** | ⏳ de completat |
| App access | jocul merge fără cont; login Google e opțional | ⏳ de completat |
| Privacy policy | https://mariussima0077-cell.github.io/privacy.html | ✅ online |
| Ștergere date (URL) | https://mariussima0077-cell.github.io/delete-data.html | ✅ online |
| Package Android | PWABuilder (TWA), **fără Play Billing** încă | ✅ făcut |
| Test închis | 12 testeri × 14 zile | ⏳ |
| Chat între jucători (UGC) | Marius a aprobat (15 nov): filtru de cuvinte, reguli acceptate la prima intrare, Mute + Report, ascundere automată la 3 raportări, pagina de moderare `/admin/chat` (șterge, mute, resetează numele), mesaje șterse după 7 zile | ✅ în joc din v16-45 |

> Când Marius completează o secțiune în Play Console, Claude trece aici ✅ și ce s-a ales exact.

---

## 2. REGULI – lucruri pe care NU le schimbăm (sau doar cu pașii de lângă)

### Pentru totdeauna (nu se pot schimba deloc)
- **Package ID `com.torqueempire.game`** – nu se schimbă niciodată.
- **Cheia de semnare** (Drive → „Torque Empire - Cheie Google Play (NU STERGE)”). Orice pachet nou = aceeași cheie.
- **Aplicația e gratuită** – Google NU permite trecerea din gratuit în plătit. Banii vin doar din pachetele din Shop.
- **Cheia de salvare `torqueEmpire_v15`** – nu se resetează niciodată progresul jucătorilor.

### Doar dacă actualizăm întâi declarațiile din Play
| Dacă vrei să… | Problema | Ce trebuie făcut |
|---|---|---|
| Scoți **Report / Mute / regulile chatului** sau pagina de moderare | Google cere pentru chat (conținut scris de jucători): reguli, raportare, blocare și moderare | Rămân mereu cât există chat |
| Pui chat **privat** (1 la 1), poze, voce sau link-uri în chat | Risc mult mai mare (13+), IARC + Data safety se schimbă | Întâi întrebi Claude, se actualizează declarațiile |
| Dai premii în Arenă / Cup pe **bani reali** sau vinzi bilete de Arenă | La fel ca summon pe bani → elemente aleatorii / „pay to win” la PvP | Premiile rămân doar diamante + bilete câștigate jucând |
| Adaugi **reclame** (orice SDK de ads, video cu recompensă) | Am declarat „Ads: No” | Schimbi „Ads” în Play + Data safety + privacy policy, ÎNAINTE de update |
| Vinzi **bilete de summon / diamante / cufere cu noroc** pe bani reali (direct sau prin altă monedă) | Am declarat „éléments aléatoires: Non”. Cu bani reali → rating 18+ în Brazilia, interzis în Belgia/Olanda | Refaci chestionarul IARC, schimbi Classification. **Recomandare: NU** – summon rămâne doar cu bilete câștigate jucând |
| Aduni **date noi** (e-mail, nume, locație, analytics, crash reports, notificări cu token) | Data safety + privacy policy nu le menționează | Actualizezi Data safety + `privacy.html` ÎNAINTE de update |
| Adaugi **sânge, violență realistă, alcool, jocuri de noroc, limbaj urât** | Ratingul IARC s-ar schimba | Refaci chestionarul Content rating |
| Faci jocul **pentru copii** (personaje/teme pentru sub 13) | Target audience 13+; politica „Families” e mult mai strictă | Nu schimbăm publicul |
| Pui **plăți în afara Google Play** (PayPal, link spre site cu plată, „mai ieftin pe site”) | Interzis pentru bunuri digitale | Nu se face – doar Google Play Billing |
| Adaugi **permisiuni Android** (cameră, locație, notificări) | Trebuie declarate, unele cer formular | Pachet nou + declarații |
| Schimbi **numele / iconul** jocului | Fișa magazinului trebuie să corespundă cu aplicația | Actualizezi fișa în același timp |
| Scoți **pagina Rate Info** (șansele la summon) | Google cere afișarea șanselor la elemente aleatorii | Rămâne mereu |
| Abonament VIP Pass: schimbi prețul / ce dă | Trebuie scris clar prețul, perioada și reînnoirea | Actualizezi textul din Shop + produsul din Play |
| Scrii „Test version”, „Beta”, nume de alte jocuri/mărci reale (Ferrari, BMW…) | Poate fi respins / probleme de mărci | Mașinile rămân cu nume inventate |
| Ștergi **login-ul Google** după ce jucătorii l-au folosit | Și-ar pierde salvarea din cloud | Doar cu anunț + timp să-și descarce salvarea |

### Obligații care rămân mereu
- Contul Google (login) se poate **șterge din joc** (Shop → Cloud save → DELETE) **și** prin pagina web `delete-data.html` – Google cere ambele.
- **Target API**: Google cere ca pachetul Android să fie actualizat la noul nivel Android cam o dată pe an (aug.). Atunci facem pachet nou, cu aceeași cheie.
- Capturile din magazin trebuie să arate jocul real.
- Secretele (cheie dev, ADMIN_KEY, parole, cheie de semnare) **niciodată pe GitHub** – doar în Google Drive.

---

### Decizie în așteptare: pass-uri cu diamante/bilete (14 nov 2026, v16-37)
- Marius a cerut pass-uri: Standard (pe diamante), Pass+ 2.99 €, Pro 5.99 €, Ultra 10.99 € – pe viață, cu diamante + bilete zilnice. Claude i-a spus: dacă un pass **plătit cu bani reali** dă diamante sau bilete (sau o monedă care cumpără bilete), Google și legile (Belgia, Brazilia din martie 2026 → 18+) le socotesc **summon pe bani = elemente aleatorii**.
- Marius: „nu adăuga pass-urile încă”. **Nimic nu s-a schimbat în Play.** Standard Pass (pe diamante câștigate jucând) ar fi OK oricând.
- Dacă se aleg pass-uri plătite cu diamante/bilete: ÎNAINTE de update → Classification „éléments aléatoires” = **Oui**, refaci IARC, scoți Belgia din țări, accepți 18+ în Brazilia, actualizezi `privacy.html`/fișa dacă e cazul, iar Rate Info rămâne afișat.

## 3. Data safety – răspunsurile corecte (de la v16-2)

**Does your app collect or share user data?** Yes · **Encrypted in transit?** Yes · **Can users request deletion?** Yes (in-app + https://mariussima0077-cell.github.io/delete-data.html)

| Tip de date (Play) | Colectat | Partajat | Opțional? | Scop |
|---|---|---|---|---|
| App activity → **Other actions / Game progress** (rezumat progres pentru anti-cheat + salvarea din cloud) | Da | Nu | Anti-cheat: obligatoriu când e online · Cloud: opțional | App functionality, Fraud prevention / security |
| Device or other IDs (ID anonim de jucător) | Da | Nu | Obligatoriu | Fraud prevention / security, App functionality |
| Personal info → **User IDs** (codul hash al contului Google, doar la login) | Da | Nu | **Opțional** | App functionality, Account management |
| Financial info → Purchase history (prin Google Play, când vor fi plăți) | Da | Nu | Obligatoriu la cumpărare | App functionality, Fraud prevention |

| Personal info → **Name** (din v16-45: numele de jucător ales în joc – poreclă, nu numele real) | Da | Nu (îl arată jucătorul altor jucători = acțiunea lui, nu „sharing”) | Opțional (fără nume = „Mechanic123”) | App functionality |
| Messages → **Other in-app messages** (din v16-45: chat pe server; traducerea o face Cloudflare Workers AI = furnizor de servicii, nu „sharing”; șterse după 7 zile) | Da | Nu | Opțional | App functionality |

- **NU colectăm**: e-mail, nume real, poză, locație, contacte. (Numele de jucător e o poreclă aleasă de el.)
- **Account creation**: „Yes – OAuth (Sign in with Google)”, opțional. Ștergere cont: în joc + URL-ul de mai sus.

---

## 4. Login Google (cloud save) – cum e făcut
- Fișiere: `cloud.js` (în joc, căsuța „☁️ Cloud save” jos în Shop) + `server/worker.js` (`/api/cloud/login|meta|save|load|delete`, tabelul `accounts` se creează singur).
- Serverul verifică token-ul Google și păstrează **doar hash-ul** ID-ului Google + salvarea. Nu păstrează e-mailul.
- Salvare automată la 3 minute + când ieși din joc. Dacă alt telefon a salvat mai nou, jocul arată **ambele salvări una lângă alta** și jucătorul alege.
- Jucătorii banați nu pot salva în cloud.
- **Pornire**: trebuie un **Client ID OAuth** de tip Web (îl face Marius în Google Cloud Console, contul torqueempirehelp@gmail.com). Claude îl pune în `cloud.js` (`const CLIENT_ID`) și în `server/wrangler.toml` (`GOOGLE_CLIENT_ID`). Client ID-ul NU e secret, poate sta pe GitHub. Cât timp e gol, jucătorii nu văd căsuța.
