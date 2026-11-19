# EROI CU ANIMAȚII NOI (8 cadre) – metoda (19 nov 2026)
✅ Făcut: **THE TORQUE KING** (m5_0, v16-94). Marius: „a ieșit super, ține minte cum am făcut, o facem și pentru următorii, dar mai târziu”.
Următorul propus: **Lady Overdrive** (m5_1), apoi Legendary.
✅ **19 nov: pozele GRIGORE primite** (`img/sheets/grigore/`, foaia skill e 1774x887 → `cells()` acceptă orice mărime), decupate cu `tools/v8_hero.py m4_0` (EXT: idle 3-7 / run 2 = fără prelungire, fx 4-6 + skill 5-7 = estompat). **În main la v16-95 (OK de la Marius, împreună cu Lady):** `ck:5` (cadrele skill 1-5, al 5-lea = lovitura în pământ), `pk:[5,6,7]` = după cast (praf → scut, `u.post` 0,6 s), zidul de pietre din `fxs_m4_0` merge odată cu fața cutremurului (`quake`). Splash `splash_m4_0.webp`. 
⏳ **19 nov: Legendary #3 = DUKE DIAMOND (m4_2, skill DIAMOND VORTEX)** – prompturi trimise, aștept 8 poze → `img/sheets/duke/m4_2_<anim>.webp`. Descriere: „stocky bearded gentleman painter-mechanic, dark brown beard and curled moustache, round gold-rimmed glasses, cream top hat with gold band and a big blue diamond, long burgundy-and-cream royal coat with white fur collar, gold trim and diamond buttons, cream suit with gold belt, gold gloves and gold-toed boots, brass backpack full of giant paint brushes and glowing purple paint jars; weapons: painter's palette (idle) and a golden diamond paint-blaster gun”.
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
