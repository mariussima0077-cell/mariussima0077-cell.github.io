# EROI CU ANIMAȚII NOI (8 cadre) – metoda (19 nov 2026)
✅✅ **21 nov – GOLIATH (m5_3, Mythic TANK)**: aceeași metodă (prezentare cu Lady idle + Ignis concept atașate → 8 prompturi, ChatGPT a pus text pe splash → curățat de Claude). Descrierea + prompturile: `tools/hero_prompts/goliath_8.txt`.
✅✅ **21 nov – EROU NOU de la zero: IGNIS (m5_2, Mythic)**: întâi o PREZENTARE (3 poze + fața, fond verde, atașată Lady idle ca stil) → corectat proporțiile (chibi, cap 1/4, aripi în sus) → apoi cele 8 prompturi cu prezentarea + Lady idle atașate. Merge bine pentru eroi noi.
✅ Făcut: **THE TORQUE KING** (m5_0, v16-94). Marius: „a ieșit super, ține minte cum am făcut, o facem și pentru următorii, dar mai târziu”.
Următorul propus: **Lady Overdrive** (m5_1), apoi Legendary.
✅ **19 nov: pozele GRIGORE primite** (`img/sheets/grigore/`, foaia skill e 1774x887 → `cells()` acceptă orice mărime), decupate cu `tools/v8_hero.py m4_0` (EXT: idle 3-7 / run 2 = fără prelungire, fx 4-6 + skill 5-7 = estompat). **În main la v16-95 (OK de la Marius, împreună cu Lady):** `ck:5` (cadrele skill 1-5, al 5-lea = lovitura în pământ), `pk:[5,6,7]` = după cast (praf → scut, `u.post` 0,6 s), zidul de pietre din `fxs_m4_0` merge odată cu fața cutremurului (`quake`). Splash `splash_m4_0.webp`. 
✅ **19 nov: pozele DUKE DIAMOND primite** (`img/sheets/duke/`), decupate cu `tools/v8_hero.py m4_2` (EXT: idle fără prelungire – paleta atinge marginea; attack 5 = `fade:R`; KO 6-8 fără; diamantele albastre păstrate cu `KEEPBLUE`). **În main la v16-97** (OK de la Marius). (vechi) Legendary #3 = DUKE DIAMOND (m4_2, skill DIAMOND VORTEX). Descriere: „stocky bearded gentleman painter-mechanic, dark brown beard and curled moustache, round gold-rimmed glasses, cream top hat with gold band and a big blue diamond, long burgundy-and-cream royal coat with white fur collar, gold trim and diamond buttons, cream suit with gold belt, gold gloves and gold-toed boots, brass backpack full of giant paint brushes and glowing purple paint jars; weapons: painter's palette (idle) and a golden diamond paint-blaster gun”.
✅ **MAMA ROSA (m4_1) în main la v16-96**: `tools/v8_hero.py m4_1` cu celule LATE (`WIDE`: fiecare bucată merge la coloana centrului ei – cheia aruncată trecea peste linia de 384 px), coloana de lumină din fx cu vârful estompat (`softtop`). `ck:4` (rugăciune → cheia ridicată), `pk:[4,5,6,7]` + `u.post` 0,6 s, efectul `sheet8` sub FIECARE coleg (vârful = cadrul 5 = momentul vindecării). Splash `splash_m4_1.webp`.
(vechi) Legendary #2 = MAMA ROSA (m4_1, skill MIRACLE SHIFT)** – prompturi trimise, aștept 8 poze → `img/sheets/rosa/m4_1_<anim>.webp`. Descriere: „plump cheerful woman medic-mechanic, dark curly hair in a bun, yellow bandana with brass goggles, rosy cheeks, cream shirt with rolled sleeves, dark brown overall-apron with a golden medical cross and wrench patches, cream pleated skirt, brown leather gloves and boots, big brass medical tank backpack with a glowing gold cross, golden wrench as weapon”.
(vechi) Legendary #1 = GRIGORE (m4_0, skill IRON QUAKE)** – prompturi trimise, aștept 8 poze → `img/sheets/grigore/m4_0_<anim>.webp`. Descriere: „huge burly bearded mechanic, dark hair tied back, brass goggles on his forehead, cream shirt with gold gear patch on the shoulder, dark overalls with tool belt and brown leather apron with a golden wrench emblem, giant steel-and-gold armored gauntlets, heavy steel-toed boots”.
✅ **19 nov: pozele Lady Overdrive primite** (`img/sheets/lady/`), decupate cu `tools/v8_hero.py m5_1` (EXT: explozia FX + coloana de foc din skill = margine estompată, nu prelungită; KO = fără prelungire). Integrare pe branch-ul `lady-v8`: cast = cadrele skill 1-4 (`ck:4`), dash = cadrele 5-6 (`dsh`), FX = traseu de foc → explozie (cadrul 5) când trece prin grupul cel mai mare. Clip ÎNAINTE/DUPĂ trimis, **aștept OK** → `main`.
⏳ (vechi) prompturile pentru Lady Overdrive (m5_1) trimise lui Marius (planșa `img/sheets/m5_1_lady.webp`). Aștept cele 8 poze → `img/sheets/lady/m5_1_<anim>.webp`.
Descriere folosită: „young woman racer-mechanic, long fiery red hair in a high ponytail, racing goggles on her head, red-and-black striped armored racing suit with gold trim, red armored gauntlets and boots, big twin-turbine jet engine backpack with glowing orange turbines and exhaust flames”.

**REGULA LUI MARIUS (19 nov): NU mai trimite clip înainte/după – integrează direct în bătălie (taie, prelungește, completează singur) și spune-i DOAR dacă ceva nu e ok.**

## Pașii
1. Claude trimite planșa actuală a eroului (`img/sheets/<id>_*.webp`) – Marius o **atașează în ChatGPT la fiecare prompt** (referință).
2. Claude scrie descrierea eroului (o frază, la fel în toate prompturile) + skill-ul lui (din `HSK` în `battle.js`) și trimite cele **8 prompturi** de mai jos, fiecare cu stilul inclus.
3. Marius face cele 8 poze și le trimite toate odată (ordinea: splash, idle, run, skill, attack, fx, hit/KO, win).
4. Claude: originalele în `img/sheets/<nume>/<id>_<anim>.webp` → `tools/v8_hero.py` (schimbă `SRC`, `REF` = înălțimea eroului în picioare pe fiecare foaie, numele de ieșire) → verifică atlasul, **prelungește ce e tăiat**, clip ÎNAINTE/DUPĂ → OK de la Marius → meta `v8`/`fx8` în `SPRD`, efectul skill-ului (`sheet8`), splash în `SPLASH` (index.html) + `sw.js` → test bătălie + telefon de buget → `main`.

Format: 1536x1024, 4 coloane × 2 rânduri = 8 cadre (celule 384×512), fond verde #00FF00, privește spre DREAPTA, picioarele pe aceeași linie, tot în celula lui.

## Șablon (înlocuiește <HERO>, <DESCRIERE>, <SKILL>, <MIȘCĂRI>)
Bloc comun pus la finalul fiecărui prompt cu erou:
```
Character (identical to reference): <DESCRIERE>.
STYLE: premium mobile game character animation (AFK Arena quality), glossy cartoon-realistic painted 3D look, chibi-heroic proportions like the reference, smooth shading, NOT pixel art, crisp clean edges, no text, no watermark.
```
Reguli comune (după prima propoziție a fiecărui prompt de animație):
```
Image 1536x1024, grid of 4 columns x 2 rows = 8 frames (each cell 384x512), left to right, top to bottom. Pure flat chroma-green background (#00FF00), no grid lines, no borders, no shadows on the green, no green on the character.
Rules: same character size and camera in every cell, facing RIGHT, feet on the same baseline (about 40 px above the bottom), everything fully inside its own cell (nothing cut).
```
1. **Splash** (1024x1536, cu fundal, poză eroică, aura gradului, sus 200 px și jos 250 px mai calme pentru UI).
2. **IDLE** – respirație în buclă, pelerina/părul se mișcă cu întârziere, cadrul 8 → cadrul 1. *(La rege corpul a stat aproape pe loc → cere „clearly visible breathing, shoulders and chest move”.)*
3. **RUN** – ciclu de 8 cadre pe loc, praf la contact, buclă.
4. **ATTACK** – 1-2 pregătire, 3 pornire, 4 IMPACT cu urmă, 5 continuare, 6-7 revenire, 8 = poziție idle.
5. **SKILL** – doar eroul + efectele de lângă corp (efectul mare separat), 8 cadre: pregătire → încărcare → vârf → lovitură → revenire.
6. **FX** – doar efectul (fără erou), punctul de impact jos la mijloc, cadrul 5 = IMPACT, 6-8 se stinge.
7. **HIT + KO** – rândul de sus lovit (4), rândul de jos K.O. (4, ultimul cu steluțe).
8. **WIN** – sărbătoare de 8 cadre.

Exemplu de descriere (regele): „old muscular king-mechanic, silver-white hair, big white beard, golden gear crown with red gem, red royal cape with gold gear patterns, black-and-gold armored mechanic outfit, tool belt, giant golden wrench with a red gear center”. Pozele rezultate: `img/sheets/king/`.

## 20 nov 2026 – generate de Claude direct în ChatGPT (Chrome-ul lui Marius)
Marius descarcă pozele din ChatGPT și le trimite. Prompturile: `tools/hero_prompts/mk.py` (Legendary) + `mk2.py` (Epic, aura mov) → `python3 mk2.py` scrie câte 8 fișiere text per erou.
Referința atașată = captură cu cadrele mari din planșa veche (ChatGPT nu primește fișiere, doar captura).
- ✅✅ **SOFIA + OTTO + REX în main la v16-106** (20 nov): `v8_hero.py m4_3/m4_4/m4_5`, `KEEPBLUE` pentru Sofia/Otto (tableta albastră), Otto: hit/KO = **varianta 1** (cadrul 1 în picioare, ca la ceilalți; v2 păstrată `m4_4_hitko_v2.webp`), skill cadrul 6 = cadrul 5 colorat albastru. Sofia `ck:5 pk:[5,6,7]` + norul `sheet8` pe grupul cel mai mare; Otto `ck:5 pk:[5,6,7]` + ceasul cu ochiul pe grupul cel mai mare; Rex `ck:4 dsh:[4]` (castAct .4 înainte de dash) + explozia pe primul monstru din banda lui. Splash-uri m4_3/4/5.
- ✅ **SOFIA LIGHTNING (m4_3)** – 8/8 (chat „Create Splash Art”). Attack cadrul 4 și skill cadrul 5: fulgerul atinge marginea → de estompat.
- ✅ **ORACLE OTTO (m4_4)** – 8/8 (chat „Create splash art”). Hit/KO = **varianta 2** (ChatGPT a dat 2). Skill cadrul 6 fără rucsac → de înlocuit cu cadrul 5 colorat albastru. FX: interiorul ceasului e verde-închis → atenție la decupare (KEEP).
- ✅ **REX REDLINE (m4_5)** – 8/8 (chat „Create splash art”).
- ✅ **VIKTOR (m3_0, Epic)** – 8/8 (chat „Create Viktor Splash Art”). Attack cadrul 3: cheia atinge sus → de prelungit.
- ✅ **BIG MO (m3_1, Epic)** – 8/8 (al doilea chat „Generate Splash Art”, cel mai nou). Attack cadrul 4: flash-ul atinge marginea dreaptă; FX = dom semi-transparent (atenție la verdele din spate la decupare).
- ✅✅ **GLORIA (m3_2) în main la v16-108** (20 nov, primul Epic cu 8 cadre): `v8_hero.py m3_2` (`SPECKS` = scoate bucățile din cadrul vecin la KO, marginile vopselei → mov, nu gri; spray-ul din FX → roz-mov lucios). `SKF.m3_2`: cast .6 s `ck:5`, `pk:[5,6,7]`, valul `sheet8` pe grupul cel mai mare, sincron cu linia `scan` (damage-ul GLOSS WAVE neschimbat). Splash `splash_m3_2`.
- ✅✅ **HAWK-EYE HUGO (m3_4) în main la v16-110** (20 nov): `v8_hero.py m3_4`, `SKF.m3_4` = ținta de lunetă pe cel mai puternic monstru în timpul cast-ului, raza din cer + damage la cadrul 5 al skill-ului (fx `call`). Splash `splash_m3_4`.
- ✅✅ **ARIA NEON (m3_5) în main la v16-113** (20 nov): a venit fără foaia IDLE (2 foi de skill) → idle = cadrul 1 din WIN cu respirație (partea de sus întinsă ±1,6 %, `img/sheets/aria/m3_5_idle.webp`); skill = prima foaie (a doua păstrată `m3_5_skill_v2.webp`). `v8_hero.py m3_5` (SPECKS, WIDE pe attack/hitko, PURPLEGLOW = vârtejurile lila nu gri, run 1/6 fără prelungire – praful). `ck:3 dsh:[3,4]`, `SKF.m3_5` = dash-ul vechi (aceleași cifre) + tornada `sheet8` pe grupul cel mai mare din banda ei când ajunge acolo. Splash m3_5.
- ✅✅ **NINA + VIKTOR + BIG MO în main la v16-126** (21 nov) – toți eroii Epic/Legendary/Mythic au acum 8 cadre. (vechi) **NINA (m3_6)** – ultimul Epic: cele 8 prompturi + `Nina_referinta.jpg` (planșa veche întreagă) trimise în chat (20 nov), aștept 8 poze → `img/sheets/nina/m3_6_<anim>.webp`.
- ⏳ Dr. Ohm (m3_3): prompturile + referința trimise din nou în chat (20 nov), aștept 8 poze → `img/sheets/ohm/m3_3_<anim>.webp`.
- ✅✅ **DR. OHM (m3_3) în main la v16-109** (20 nov, pozele trimise de Marius → `img/sheets/ohm/`): `v8_hero.py m3_3` (`WIDE` doar pe foaia hitko – corpul întins trece de linia coloanei; `PURPLEGLOW` = ceața fulgerelor rămâne lila; attack 4 `fade:R`, fx 4-5 `fade`). `ck:5 pk:[5,6,7]`, `SKF.m3_3` (cast 0,6 s → turnul la 62·S în fața lui). Turnul Tesla `fxs_m3_3` desenat în fx `coil` (4 s): apare 0-2 → explozia 4 → la fiecare zap 3/5 ↔ 2 → se stinge 5-7 (damage ca înainte). Splash m3_3.
- ⏳ **HUGO (m3_4)**: 20 nov – cele 8 prompturi + `Hugo_referinta.jpg` retrimise în chat. Aștept pozele → `img/sheets/hugo/`.
- ⏳ Următorii Epic: Gloria (m3_2), Dr. Ohm (m3_3), Hugo (m3_4), Aria (m3_5), Nina (m3_6) – prompturile gata în `mk2.py`. **20 nov (v16-107): trimise lui Marius** (Gloria în chat, ceilalți 4 într-un .txt, fiecare cu poza de referință .jpg).

## AWAKENING (22 nov 2026, v16-161) – 1 planșă WOW + 6 portrete Awakened
1. **Planșa WOW** → `img/fx/awaken.webp` (apoi `AWK_SHEET=true` în `index.html`). ChatGPT **1536x1024**, 4×2 frame-uri de **384×512** (3:4), fond NEGRU (se pune peste joc cu „screen”, negrul dispare). În joc: lățime ~360 px pe telefon, mărită ×1,25 – efect de lumină, deci se poate să fie puțin moale.
2. **Portret Awakened** pentru fiecare Mythic → `img/hero/awk_<id>.webp` 768×1152 (ca splash-ul) + rând în `AWK_ART` (`index.html`). ChatGPT **1024x1536**, apoi micșorat la 768×1152. Referință: splash-ul eroului (`img/hero/splash_<id>.webp`). Se vede pe pagina eroului / la WOW de la Awakened V.
