# GARAGE PARTS – update în așteptare pe ramura `garage-parts` (NU e live) · 21 nov 2026
Marius: „garajele nu mai fac upgrade cu bani, doar cu piese; fiecare garaj de luptă are piesele lui (tank, warrior…), restul clădirilor o piesă comună;
piesele din salvage, idle, stage-uri, towere; banii pe Collection Car (mai mare, mașini scumpe, bonus eroi + bilete); ruletă event cu bani (fără misiuni,
tot mai scumpă, limită de rotiri); garaje până la LV 100, la început puțin, la final mult. Fă update dar nu live.” Include și macheta ROLURI (ramura `roles-preview`).

## 1. Piese de upgrade (index.html, caută `GARAGE PARTS`)
- 6 resurse în `G.upk`: tank · warrior · ranger · mage · support (piese de rol) + `bk` = Builder Kit (comună). Iconițe provizorii `img/ui12/pk_*.webp` (desenate de Claude – de înlocuit cu pozele lui Marius).
- Garaj → piesă: Engine = Tank · Tuning = Warrior · Inspection = Ranger · Paint + Electrical = Mage · Service = Support. Toate celelalte clădiri = Builder Kit (nu se amestecă).
- Cost pe nivel `PCOST(id,L) = 2 + 0,7·L^1,55` (Factory ×1,5, reducerea VIP se aplică): LV10 = 26 · LV50 = 300 · LV100 = 870; total LV1→100 ≈ 35.000 / clădire.
- **LV 1-10 = nivelurile vechi** (aceleași poze și tabele), apoi **LV 11-100 = `G.lx`** (niveluri extra): +2% venit pe nivel (lucrări, vânzare, spălătorie, benzinărie, fabrică) + idle +0,3% / nivel extra. Fără pași (UPN) – un nivel = un click.
- Luminițele din fereastra clădirii: LV1-10 ca înainte, peste 10 se aprind auriu câte una la 9 niveluri; textul „Level X / 100”.
- **Bonus de luptă** (`GB(L)` → `garB(cls)`, battle.js `unitStats`): garajul clasei dă +ATK & HP: LV10 +3% · LV25 +11% · LV50 +31% · LV75 +61% · LV100 +100%. Legend (Mythic) = media celor 6. Se vede în fereastra garajului și pe pagina eroului („GARAGE TRAINING”).
- **Surse**: Idle (2·U piese de rol/oră la întâmplare + 5·U Builder Kit/oră) · campanie (prima trecere 5/8/15·U rol + 4/6/12·U kit, replay puțin) · **salvage** (după grad 1-60 × (1+U/10); setul = piesele clasei lui) · **Class Towers** = piesele clasei (10+2·etaj, ×2 la fiecare al 10-lea) · **Torque Tower** = Builder Kit (10+1,5·etaj) · Cash Roulette · pachete. U = `PART_U()` = 1 + etapa/40 (×1 → ×26).
- Jucători vechi (`pkMigrate`, o singură dată): nivelurile rămân, primesc ×1,5 costul nivelului următor pentru fiecare clădire + pașii neterminați (UPN) întorși în piese. Jucători noi: 15 din fiecare piesă de rol (30 Mage) + 40 Builder Kit.
- Tutorial: pasul UPGRADE dă piesele lipsă + text „Buildings are upgraded with PARTS”. Pe hartă: „BUILD · 3 PARTS / KITS”.
- Fereastra RESOURCES: piese de rol + Builder Kit (unde se iau, la ce folosesc); Money = Collection + Cash Roulette.
- Anti-cheat: `secure.js` lvSum + niveluri extra ×0,5; raportul la server trimite tot doar G.lv (≤ 140). Server `online.js` (clasament garaj) acceptă lv până la 1400.

## 2. Classic Collection mai mare (classic.js)
- 36 de mașini (12 vechi + 24 noi, desenate în cod), prețuri ×1,42 de la $80M la ~$260B, REP 18-30.
- **Fără limită de parcare**: fiecare mașină deținută contează (`G.cc.own`); pe hartă se văd cele mai scumpe 6. Salvările vechi: mașinile parcate devin „own”.
- Fiecare mașină: **+ATK & HP pentru TOȚI eroii** (0,15% la prima … 8% la ultima; toate 36 ≈ +72%) + bilete/oră (Recruit, Gear, Crew – tot mai multe) + 💎 puține + Essence/Gear Parts (idle). Idle money +1% / mașină.
- Pagina eroului: „CLASSIC COLLECTION +X% ATK & HP”.

## 3. CASH ROULETTE (events.js, track B, după KEY ROULETTE)
- Fără questuri: rotiri cumpărate cu cash. Prima = 30 min din banii tăi de idle, fiecare următoare ×1,15, **max 25 rotiri / event** (≈ 106 h de idle în total).
- 8 felii: piese de rol ×8/16/32·U, Builder Kit ×20/40·U, 1 cheie de dungeon, 1 cheie în fiecare dungeon, JACKPOT (60·U din fiecare piesă + 150·U kit). Praguri + TOP 100 ca la celelalte eventuri.
- Server: `EV_TRK.B` are `cash` la SFÂRȘIT (eventurile 0-3 rămân la fel). ⚠️ Urcă pe `main` ÎNAINTE de 2 dec 2026 (indexul 4 al track-ului B), altfel eventul curent se schimbă în timpul lui.
- Banner provizoriu: lipsește `img/ui9/evb_cash.webp` (până atunci culoare).

## 4. Shop (shop2.js)
- Fără cash în pachete (ca ruleta să nu fie „gambling” la Play): Starter 30 din fiecare piesă de rol + 80 kit · Rookie 60/150 · Pro 120/300 · Elite 250/600.

## 5. Simulare (tools/sim_player.py, botul folosește piese + cumpără mașini) – free, 30 zile, SEED=7
- Ziua 30: etapa **9-8** (înainte ~7) · clădiri 283/1400 niveluri (≈ LV 20 în medie, ~6 niveluri/zi la final) · 15 mașini (+6% luptă) · bani 14-40M.
- Builder Kit e cel mai cerut (8,5 clădiri) – de urmărit. LV100 peste tot ≈ 8-12 luni de joc (de reglat după feedback).

## La urcare
`const V` + `CV`, `python3 tools/sw_hash.py`, NEWS, test + `tools/budget_phone.py`, apoi `main`. Pozele lui Marius: 6 piese (`img/ui12/pk_*`), banner `evb_cash`.

## 6. v16-129b (21 nov, Marius: „1 + puțin din 2 + puțin din 3”) – cifre ×10, puțin mai lent, mai mult Builder Kit
- Cost ×13 (`PCOST` rotunjit la 5): LV1 40 · LV10 350 · LV50 3.950 · LV100 11.450. Piesele primite ×10, Builder Kit ×13 (idle 20·U rol + 65·U kit / oră, stage 50/80/150·U rol + 52/78/156·U kit, salvage 10-600, Class Towers 100+20·etaj, Torque Tower 130+20·etaj kit, ruleta ×10, pachete Starter 300/1000 … Elite 2500/8000, start 150 / 300 Mage / 520 kit).
- Bonusul de garaj mai mic la început: `GB(L)=0,0001·L²` → LV10 +1% · LV25 +6% · LV50 +25% · LV75 +56% · LV100 +100%.
- Simulare free 30 zile SEED=7: clădiri 342/1400 (medie LV24), 15 mașini (+6%). Campania: 13-20 (live fără garage parts: 8-20) – DAR simularea e foarte zgomotoasă: aceeași ramură cu bonusul de garaj oprit SAU cu bonusul Collection oprit a ajuns doar la 5-9 / 5-11 în ziua 20. ⚠️ De făcut mai multe simulări (alte SEED) înainte de live.

## 7. Pozele lui Marius (21 nov) – PUSE
- 6 piese: `img/sheets/parts/parts_src.png` → `tools/parts_cut.py` → `img/ui12/pk_*.webp` 160×160 (verdele din strălucirile Ranger/Support/Builder păstrat).
- Banner Cash Roulette: `img/sheets/parts/cash_banner_src.png` → `img/ui9/evb_cash.webp` 900×360.
- **Nu mai lipsește nicio poză pentru garage-parts.**

## CE MAI E DE FĂCUT (pentru chatul nou)
1. Mai multe simulări (`SEED=3/11/19 python3 tools/sim_player.py free 30 …`) – ritmul campaniei (o rulare a dat 13-20 la ziua 30 față de 8-20 live; zgomot mare). Dacă e prea rapid: micșorează `GB` (index.html) sau `c.b` din classic.js.
2. OK-ul lui Marius → merge `garage-parts` în `main`: `const V` + `CV`, NEWS (garaje cu piese, LV 100, Collection, Cash Roulette, roluri), `tools/sw_hash.py`, test + `tools/budget_phone.py`. **ÎNAINTE de 2 dec 2026** (rotația eventurilor).
3. Rolurile: bonusul TEAM ROLES e doar afișat (nu e aplicat în luptă) – de întrebat Marius dacă îl vrea aplicat.
