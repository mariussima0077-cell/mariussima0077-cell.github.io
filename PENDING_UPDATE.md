# Update în așteptare (NU e live) – ramura `pending-v16-120`
Marius (20 nov 2026): „nu faci update la joc, doar salvăm și facem mai târziu când avem mai multe strânse”.
Când se urcă: merge în `main`, apoi `const V` în sw.js + `CV` în online.js, `python3 tools/sw_hash.py`, test live + `tools/budget_phone.py`.

## 1. Memorie (gata, testat pe telefon buget simulat, 0 erori)
- `index.html`: pozele hărții (`IMG`) se încarcă DOAR când harta le cere (nivelul actual al clădirii), nu toate LV1-4 la pornire.
  Înainte: 609 MB / încărcare 15,7 s → după: ~480 MB / 12,1 s.
- Poza ecranului de încărcare eliberată după start; `fusion.webp` nu se mai preîncarcă (Fusion e închis).

## 2. Deblocare treptată (gata, de verificat vizual cu un jucător nou)
- Butoane hartă: NEWS de la REP 2 · CREW + VIP REP 3 · RANK etapa 10 · EVENTS etapa 15 · CHAT REP 5 + etapa 10. Mesaj „🔓 NEW … unlocked!” + puls. Jucătorii vechi nu văd nimic schimbat (`G.ul`).
- Battle Hub: ARENA + TORQUE CUP de la etapa 20 (`AR_UNLOCK`, ca Class Towers).
- Rămân de la început: Battle, Heroes, Summon, Idle, Quests, Check-in, Mail (le folosește tutorialul).

## 3. Economie – simulare 30 zile jucător gratuit (NEREPARAT încă)
- Ziua 1 foarte rapidă: etapa 2-17, REP 11, 43/140 clădiri (botul joacă 2 h).
- Ziduri la boșii de capitol: 4-20 ~2 zile, **5-20 ~4 zile** (zilele 10-13), 6-20 ~2 zile, **8-20 ~3 zile** (24-26) → peste regula de max 2 zile.
- Cauza la 5-20: OMEGA ENGINE are 17.000 HP / 146 atac, ceilalți boși ~14.000 / 136. Propunere: OMEGA 14.000/136 și boșii de capitol ceva mai slabi după capitolul 5.
- Banii se strâng în milioane fără pe ce să-i cheltui unele zile (zilele 21, 28).
