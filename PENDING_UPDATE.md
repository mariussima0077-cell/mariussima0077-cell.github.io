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

## 6. Diamond Pass + Founder Pass (gata pe ramură, 21 nov 2026 – Marius: „ok cu diamond pass” + „one time pass ieftin: cadru, titlu, battle speed ×3”)
- **DIAMOND PASS** – abonament lunar **14,99 €**: 900 💎 la cumpărare + 300 💎/zi + 2 Recruit/zi = 9.900 💎 / 30 zile (≈ 660 💎/€, ca Platinum). Fără bonus VIP / Idle. Se cumulează cu Silver/Gold/Platinum. Cheie `dia`, SKU `vip_pass_diamond` (shop2.js, secure.js, server/worker.js).
- **FOUNDER PASS** – o singură plată **4,99 €** (Forever Packs): Battle Speed ×3 + cadru FOUNDER (`img/fr7` – 6 e cadrul Ascended de echipament) + titlu FOUNDER. Cheie `fdr`, SKU `founder_pass`. Serverul (server/online.js `sync`) dă cadrul/titlul DOAR dacă Google a confirmat cumpărarea (tabela `purchases`) – contul de test `tst_` poate oricum.
- Lista veche din index.html: Battle Speed ×3 corectat la **2,99 €** (ca în Play).
- Poze de la Marius (ChatGPT, 21 nov 2026), decupate: `img/shop/vp_dia.webp` 240×279, `img/shop/founder.webp` 200×200, `img/fr7.webp` 300×300 (cadru FOUNDER; are fereastra mai jos → portretul folosește `.p.p7` în online.js).

### 🛒 De făcut în Play Console la urcare (Marius zice când e la laptop → Claude face automat)
1. Abonament nou `vip_pass_diamond` „Diamond Pass”, plan de bază `monthly`, lunar, reînnoire automată, **14,99 €**, grație 7 zile.
2. Produs nou (o singură dată, NU consumabil) `founder_pass` „Founder Pass”, **4,99 €**.
3. `battle_speed_x2`: nume/descriere → „Battle Speed ×3” (prețul rămâne 2,99 €).
4. Apoi PLAY_RULES.md (tabelul secțiunea 1) + Cloudflare ia server/ din GitHub automat la merge.

## 7. KEY ROULETTE – event nou (21 nov 2026, cererea lui Marius) – gata, testat
- Track B are acum 4 eventuri pe rând: ESSENCE RUSH → DIAMOND SPREE → LUCKY WHEEL → **KEY ROULETTE** (3 zile fiecare). Același sistem ca Lucky Wheel: rotiri DOAR din questuri zilnice (login, 5 victorii campanie, **folosește 3 chei de Dungeon**, 10 summon, 2× Idle), milestone 3/6/9/12/15 rotiri, TOP 100 (premii 💎 ×1,5 prin Mail, ca la roată).
- Roata dă DOAR chei de Dungeon: Vault/Mine/Forge/Lab ×1 (17% fiecare), 2 chei la un dungeon aleator 14%, 1 cheie în TOATE 10%, 3 chei la un dungeon aleator 6%, **JACKPOT 3 chei în TOATE 2%**. Anti-reroll: `srun('kw')`.
- **Cheile câștigate = BONUS (`G.dg.x`)**: se adună, NU expiră la miezul nopții; se folosesc după cheile zilnice (`dgUse`). Afișare: „2/2 +5” pe cartea dungeonului, „+5 BONUS” în pagina lui, total în Battle Hub.
- Server (`server/online.js`): `EV_TRK.B` + `key`, `EV_CAP/EV_TKK/EV_NAME`, `evKind` cu lungimea listei (A are 3, B are 4). ⚠️ Serverul trebuie urcat odată cu jocul.
- Poze: pozele lui Marius integrate (21 nov) – `img/ui9/evb_key.webp` 900×360 + `img/ui9/kwheel_disc.webp` 441×441 (verdele scos). Rama și săgeata = cele ale Lucky Wheel. Testat: 0 erori.

## 8. Ascended doar din drop (Marius, 21 nov 2026) – gata, testat
- Scos **ASCEND** (Mythic ★5 + Mythic același slot → Ascended): butonul nu mai apare, acțiunea `asc` nu mai face nimic (`battle.js`). Mythic ★5 = „STARS 5 / 5 · MAX”.
- Ascended vine DOAR din: **Gear Summon 0,02%** · **campanie de la capitolul 30** (ca înainte, până la 15% din drop-urile Mythic la cap. 50) · **Idle Rewards de la capitolul 30**: 0,1% pe fiecare oră din cufăr (`IDLE_ASC_H`, `idleAsc` în `battle.js`, chemat din `claimIdle` în `index.html`), cu sămânță `srun('ia')` → fără reroll. Cufăr de 8 h ≈ 0,8% (~1 piesă la ~1-2 luni cu 3 cufere/zi). Toast „✦ ASCENDED …!”.
- GEAR GUIDE secțiunea 3 = „ASCENDED · WHERE TO FIND” (cele 3 surse), textul din Gear Rates actualizat.
- Test (Chrome 360 px): jucător etapa 5 → nimic; etapa 700 → piesă r=6 în sac; 2000 cufere de 8 h → 0,55%; claimIdle OK; Mythic ★5 fără buton ASCEND; 0 erori.
- NEWS id 59.

## 9. Joc mai ușor de înțeles (Marius, 21 nov 2026: „toate da” + cadou mare la tutorial) – gata, testat
- **Cadou tutorial**: 1000 💎 + 10 Recruit + 10 Crew + 10 Gear Tickets (înainte 100 💎 + 2 Recruit), anunțat din primul balon (`GIFT`, `giftH` în `tutorial.js`); SKIP arată „SKIP = NO GIFT · TAP AGAIN”. Replay (`?tut=1`) nu dă cadou. Sub limitele botului (bilete < 60 / 100).
- **Verificat anti-bug cadou** (Marius: „skip = fără cadou, replay = fără cadou din nou”), test automat: SKIP → 0 cadou, nici la repornire; replay (`?tut=1` / Shop) după skip sau după terminare → 0 cadou; 3 tap-uri rapide pe START → cadoul o singură dată; repornire după terminare → nimic. **Bug găsit și reparat**: cine închidea aplicația la mijlocul tutorialului (după upgrade-ul SERVICE) nu mai vedea tutorialul niciodată (și nici cadoul / ghidurile) → acum `G.tutS` ține minte că a început și tutorialul repornește de la capăt la următoarea pornire (dacă nu a avansat mult, `progressed()`); cadoul tot o singură dată (`G.tut`). Cloud/transfer: salvarea adusă înlocuiește tot → cadoul nu se dublează.
- **Mini-ghiduri la prima deschidere** (`PG` în `tutorial.js`, cheie `p_*` în `G.tutM`): HEROES, GEAR (fereastra unei piese), MY CREW, SUMMON, VIP, EVENTS, CHECK-IN. Doar după tutorial (`G.tut`), o singură dată, un balon cu Mama Rosa + GOT IT.
- **Fereastra RESOURCES** (`resHtml`/`popRes` în `index.html`): ce e / GET / USE pentru bani, diamante, cele 3 bilete, Essence, Gear Parts, chei, puncte VIP. Se deschide la tap pe 💎 din bara de sus (înainte doar toast) și pe Essence / Gear Parts din pagina HEROES (`battle.js`).
- **„CREW” de 2 ori**: verificat – MY CREW are 3 tab-uri (mecanici, gardieni, șoferi) = tot ce lucrează în garaj, iar Crew Summon dă șoferi + gardieni → numele se potrivesc. NU am redenumit (ar fi cerut 3+ poze noi: butonul hărții, antetul MY CREW, antetul CREW SUMMON); explicat în ghidurile SUMMON și MY CREW.
- **NEXT GOAL**: doar machetă trimisă lui Marius (bandă sub bara de sus: obiectiv + GO). De făcut doar după OK.
- Test Chrome 360 px: cadoul vine corect (0→1000 💎, +10 din fiecare bilet), ghidurile Summon/Heroes/VIP apar o dată, fereastra RESOURCES OK, 0 erori. NEWS id 60.

