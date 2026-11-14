# TORQUE EMPIRE – Ce am declarat la Google Play și ce NU avem voie să schimbăm

*Claude citește fișierul ăsta ÎNAINTE de orice schimbare în joc. Dacă Marius cere ceva ce se lovește de o regulă de aici, Claude îi spune ÎNAINTE să facă schimbarea: ce regulă e încălcată, ce ar trebui actualizat în Play Console și dacă se poate face deloc.*

Ultima actualizare: 13 noiembrie 2026 (v16-2).

---

## 1. Ce e completat în Play Console (stare reală)

| Secțiune | Ce am pus | Stare |
|---|---|---|
| Cont dezvoltator | „Torque Studios”, cont **personal** | ✅ aprobat 13 nov |
| Aplicația | Torque Empire: Garage Tycoon · `com.torqueempire.game` · **Jeu** · **Sans frais (gratuit)** · limba en-US | ✅ creată 13 nov |
| Classification / éléments aléatoires | **Non** (summon doar cu bilete câștigate în joc – Recruit Tickets pentru mecanici + Crew Tickets pentru șoferi/paznici din v16-20 –, VIP Pass fără summon gratuit; Crew Tickets nu se vând niciodată) | ✅ ales de Marius (v16-1) |
| Data safety | vezi secțiunea 3 de mai jos | ⏳ de completat |
| Content rating (IARC) | violență cartoon, fără sânge, achiziții în aplicație, fără jocuri de noroc | ⏳ de completat |
| Target audience | **13+** (NU pentru copii) | ⏳ de completat |
| Ads | **No** | ⏳ de completat |
| App access | jocul merge fără cont; login Google e opțional | ⏳ de completat |
| Privacy policy | https://mariussima0077-cell.github.io/privacy.html | ✅ online |
| Ștergere date (URL) | https://mariussima0077-cell.github.io/delete-data.html | ✅ online |
| Package Android | PWABuilder (TWA), **fără Play Billing** încă | ✅ făcut |
| Test închis | 12 testeri × 14 zile | ⏳ |

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

## 3. Data safety – răspunsurile corecte (de la v16-2)

**Does your app collect or share user data?** Yes · **Encrypted in transit?** Yes · **Can users request deletion?** Yes (in-app + https://mariussima0077-cell.github.io/delete-data.html)

| Tip de date (Play) | Colectat | Partajat | Opțional? | Scop |
|---|---|---|---|---|
| App activity → **Other actions / Game progress** (rezumat progres pentru anti-cheat + salvarea din cloud) | Da | Nu | Anti-cheat: obligatoriu când e online · Cloud: opțional | App functionality, Fraud prevention / security |
| Device or other IDs (ID anonim de jucător) | Da | Nu | Obligatoriu | Fraud prevention / security, App functionality |
| Personal info → **User IDs** (codul hash al contului Google, doar la login) | Da | Nu | **Opțional** | App functionality, Account management |
| Financial info → Purchase history (prin Google Play, când vor fi plăți) | Da | Nu | Obligatoriu la cumpărare | App functionality, Fraud prevention |

- **NU colectăm**: e-mail, nume, poză, locație, contacte.
- **Account creation**: „Yes – OAuth (Sign in with Google)”, opțional. Ștergere cont: în joc + URL-ul de mai sus.

---

## 4. Login Google (cloud save) – cum e făcut
- Fișiere: `cloud.js` (în joc, căsuța „☁️ Cloud save” jos în Shop) + `server/worker.js` (`/api/cloud/login|meta|save|load|delete`, tabelul `accounts` se creează singur).
- Serverul verifică token-ul Google și păstrează **doar hash-ul** ID-ului Google + salvarea. Nu păstrează e-mailul.
- Salvare automată la 3 minute + când ieși din joc. Dacă alt telefon a salvat mai nou, jocul arată **ambele salvări una lângă alta** și jucătorul alege.
- Jucătorii banați nu pot salva în cloud.
- **Pornire**: trebuie un **Client ID OAuth** de tip Web (îl face Marius în Google Cloud Console, contul torqueempirehelp@gmail.com). Claude îl pune în `cloud.js` (`const CLIENT_ID`) și în `server/wrangler.toml` (`GOOGLE_CLIENT_ID`). Client ID-ul NU e secret, poate sta pe GitHub. Cât timp e gol, jucătorii nu văd căsuța.
