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

## 4. Boși de capitol mai slabi (gata, 20 nov seara)
- `battle.js`: TANKER 13.000 HP · FROST PLOW 13.000/134 · TURBO WYRM 13.500/134 · **OMEGA ENGINE 17.000/146 → 13.500/134** · boșii capitolelor 6-50 (`norm` în `monClone`) 14.000/136/30 → 12.500/130/28.
- Simulare 30 zile, același început (`SEED=7`): vechi → zid 5-20 de 3 zile; nou → 5-20 ~1,5 zile, 8-20 ~2 zile. Niciun zid > 2 zile.
- `tools/sim_player.py`: `SEED=n` (același noroc), `TAG`/`PORTOFF` (două simulări în paralel).
- ⚠️ Progresul depinde mult de noroc: un Mythic din summon în ziua 1 (0,08%) = ~2-3 capitole în plus după 2 săptămâni. Fără el, jucătorul gratuit e la cap. 4 după 2 săptămâni, cap. 7 după 30 de zile.
- Rămâne de văzut: banii se strâng în milioane în unele zile (nimic de cumpărat).

## 5. Feedback tester Wazza4ever (21 nov 2026) – gata, testat
- **Venit pe oră**: sub bani „+$X/h” (ultimele 20 min de joc); tap pe bani → pagina „Income per hour” pe clădiri; fiecare clădire: „💰 Income now → după upgrade” (spălătorie/benzinărie/fabrică = calcul exact; garaje/birou = măsurat × efectul upgrade-ului). `incAdd/incSale/incRates` în index.html.
- Eroii din clădiri arată bonusul (⚡ viteză · 💵 plată · 🎯 crit); clasă greșită = „wrong class · no bonus”.
- **Classic Collection**: 💎 ÷5 (max 16/h în loc de 80/h), în plus Essence + Gear Parts (`es`/`gp` în classic.js, adăugate la Idle). Reparat „+1.0833333 / h”.
- **Towers**: AUTO NEXT (3 s) la Torque Tower + Class Towers, același buton ON/OFF ca la campanie (`anxTower`).
- **Battle Speed pack: ×2 → ×3** (cine l-a cumpărat are ×3). Iconiță nouă `img/ui3/b_x3.webp` (de la Marius, ChatGPT). ⚠️ La urcare: schimbă numele/descrierea produsului `battle_speed_x2` în Play Console („Battle Speed ×3”) + PLAY_RULES.md.
- News id 58 (data de pus la ziua urcării).
- Test (test mode): 0 erori; telefon buget: hartă 457 MB, încărcare 9,6 s.
