# TORQUE EMPIRE – Publicare Google Play · stare și pașii următori
*(trimite fișierul ăsta la începutul unui chat nou cu Claude, împreună cu arhiva v15 dacă trebuie modificat jocul)*

## ✅ CE E GATA (12 noiembrie 2026)
- **Joc online (v15)**: https://mariussima0077-cell.github.io/
  - Repository GitHub: `mariussima0077-cell/mariussima0077-cell.github.io` (public, GitHub Pages din `main` / root, are `.nojekyll`)
  - Claude are acces de scriere la repository (aplicația GitHub „Claude” instalată pe „All repositories”)
- **Politica de confidențialitate**: https://mariussima0077-cell.github.io/privacy.html (e-mail: torqueempirehelp@gmail.com)
- **Cont Google al jocului**: torqueempirehelp@gmail.com (Gmail și Google Drive conectate la Claude)
- **Pachet Android (PWABuilder)**:
  - Package ID: `com.torqueempire.game` · nume: Torque Empire · fullscreen
  - ⚠️ **Fără Play Billing** → plățile din Shop nu merg încă (butoanele spun „Google Play payments are not available”). Pachetul cu plăți se face mai târziu.
  - Cheia de semnare + parolele: Google Drive (torqueempirehelp) → folderul **„Torque Empire - Cheie Google Play (NU STERGE)”** (`signing.keystore` + `signing-key-info.txt`). Fișierul `.aab` e în zip-ul PWABuilder de pe telefon.
  - Amprenta cheii de upload (SHA-256), deja pusă în `.well-known/assetlinks.json`:
    `2F:F9:21:56:9B:2B:DC:23:9C:4F:02:02:E9:B6:35:F0:B5:99:62:D1:EB:3F:E9:74:2B:FF:45:C6:22:E8:35:A7`
- **Cont de dezvoltator Google Play**: creat (cont personal, plătit 25 $), **se așteaptă verificarea identității** (buletin românesc, adresă în Franța).

## ⏳ CE URMEAZĂ (în ordine)
### 1. Cât așteptăm verificarea Google
- [ ] **Textele pentru magazin** (engleză): titlu, descriere scurtă (max 80 caractere), descriere lungă → le scrie Claude.
- [ ] **Capturi de ecran** pentru magazin (minim 2, telefon portret) – din `assets/screen-v15-*.png` sau capturi noi.
- [ ] **Botul anti-cheat Torque Guard** pe Cloudflare (gratis) – pașii din `GOOGLE_PLAY.md`, secțiunea 3. După ce e pornit, Claude pune adresa worker-ului în `secure.js` (`const API = '...'`) și urcă pe GitHub.
- [ ] **Strânge 12 testeri** (adrese Gmail: prieteni, familie, sau comunități ca r/AndroidClosedTesting).

### 2. După ce Google aprobă contul
- [ ] Play Console → **Create app**: Torque Empire · Game · Free · categoria Simulation.
- [ ] **Test fermé / Closed testing**: urci `Torque Empire.aab`.
- [ ] **Setup → App signing**: copiezi **SHA-256 al cheii Google** și i-l dai lui Claude → îl adaugă în `assetlinks.json` (lângă cel de mai sus), altfel apare bara de adresă în aplicația din magazin.
- [ ] Fișa aplicației: icon 512 (`store/play-icon-512.png`), feature graphic (`store/feature-graphic-1024x500.png`), capturi, privacy policy (linkul de mai sus).
- [ ] **Data safety**, **Content rating** (IARC), **Target audience 13+**, **Ads: No** – răspunsurile sunt în `GOOGLE_PLAY.md`, secțiunea 6.

### 3. Testul închis – 12 testeri × 14 zile
- [ ] groups.google.com → grup „torque-empire-testers” (oricine se poate alătura).
- [ ] În Closed testing → Testeurs: adaugi adresa grupului → primești **linkul de înscriere**.
- [ ] Trimiți testerilor: linkul grupului + linkul de înscriere. Toți trebuie să rămână înscriși **14 zile la rând** și să joace puțin.
- [ ] După 14 zile: ceri accesul la **Production** din Play Console.

### 4. Mai târziu
- [ ] Pachet Android **cu plăți** (Play Billing) + produsele în Play Console: `vip_car` 3.99 €, `vip_mechanic` 2.99 €, `battle_speed_x2` 4.99 €, abonament `vip_pass_monthly` 5.99 €/lună.
- [ ] Cont de serviciu Google pentru bot (`GOOGLE_SA`), ca botul să confirme cumpărăturile.

## ⚠️ REGULI DUPĂ PUBLICARE
- **Nu mai resetăm salvarea** la update-uri (cheia rămâne `torqueEmpire_v15`).
- La fiecare update: se schimbă `const V='te-v15-1'` din `sw.js` (ex. `te-v16-1`) și se urcă fișierele pe GitHub. Pentru schimbări de joc **nu** trebuie pachet nou în Play.
- Pachet nou în Play (de ex. cu plăți) = semnat cu **aceeași cheie** din Google Drive și același Package ID `com.torqueempire.game`.
