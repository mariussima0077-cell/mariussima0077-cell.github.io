# EROI CU ANIMAȚII NOI (8 cadre) – metoda (19 nov 2026)
✅ Făcut: **THE TORQUE KING** (m5_0, v16-94). Marius: „a ieșit super, ține minte cum am făcut, o facem și pentru următorii, dar mai târziu”.
Următorul propus: **Lady Overdrive** (m5_1), apoi Legendary.
⏳ **19 nov: prompturile pentru Lady Overdrive (m5_1) trimise** lui Marius (planșa `img/sheets/m5_1_lady.webp`). Aștept cele 8 poze → `img/sheets/lady/m5_1_<anim>.webp`.
Descriere folosită: „young woman racer-mechanic, long fiery red hair in a high ponytail, racing goggles on her head, red-and-black striped armored racing suit with gold trim, red armored gauntlets and boots, big twin-turbine jet engine backpack with glowing orange turbines and exhaust flames”.

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
