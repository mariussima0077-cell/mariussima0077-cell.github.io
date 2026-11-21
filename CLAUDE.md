# Torque Empire – instrucțiuni pentru Claude

- Jocul e publicat (în curs) pe Google Play. **Înainte de orice schimbare citește `PLAY_RULES.md`**: ce e declarat în Play Console și ce nu avem voie să schimbăm. Dacă o cerere a lui Marius încalcă o regulă, spune-i înainte de a schimba ceva.
- Starea și pașii următori: `NEXT_STEPS.md`. Pașii de publicare: `GOOGLE_PLAY.md`.
- Când se completează ceva nou în Play Console sau se ia o decizie de publicare, actualizează `PLAY_RULES.md` (tabelul din secțiunea 1).
- La fiecare update: schimbă `const V` din `sw.js`, rulează `python3 tools/sw_hash.py` (altfel pozele schimbate nu ajung la jucători), testează live, rulează și `python3 tools/budget_phone.py` (telefon de buget simulat – cere Marius la fiecare test), urcă pe `main`. Nu reseta salvarea (`torqueEmpire_v15`).
- Marius vorbește română; are doar telefon. Secretele stau doar în Google Drive, niciodată aici (repository public).
- **Regula lui Marius (16 nov 2026): la sfârșitul FIECĂRUI răspuns lasă o notiță scurtă** – ce am făcut acum, ce urmează și ce imagini / iconițe / pagini mai lipsesc (sau „nu lipsește nimic”). Aceeași listă trebuie să fie și în `NEXT_STEPS.md`, ca să poată continua într-un chat nou.
- **Versiune minimă online (v16-88)**: `CV` din `online.js` = numărul versiunii jocului; serverul (`MIN_CV` în `server/online.js`) refuză versiunile mai vechi → fereastra „UPDATE REQUIRED”. La fiecare update crește `CV` (= numărul din `const V`). Crește `MIN_CV` doar când Marius vrea ca TOȚI să fie obligați să ia versiunea nouă (ex. bug de server/trișare).
- **Regula lui Marius (20 nov 2026): când trimiți prompturi pentru poze, verifică ÎNTÂI dimensiunea** – cât de mare e elementul în joc (px pe telefon de 360 px, ×3 pentru ecrane bune), raportul lățime/înălțime, ce mărime ChatGPT (1024x1024 / 1536x1024 / 1024x1536) și cum se decupează (9-slice = ornamente doar la colțuri). Scrie mărimea lângă fiecare prompt.
- **Regula lui Marius (20 nov 2026): NU-i mai trimite linkuri de descărcat pentru pozele de atașat** – trimite poza direct în chat (SendUserFile, convertită în .jpg/.png ca s-o poată pune în ChatGPT), chiar lângă promptul ei.
- **Regula lui Marius (21 nov 2026): simulările (`tools/sim_player.py`) se fac DOAR când cere el.** Nu porni simulări din proprie inițiativă.
