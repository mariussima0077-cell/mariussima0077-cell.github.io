# Torque Empire – LIMBI (26 nov 2026) · NU e încă pe live

Marius: „fă jocul în câteva limbi (5-6 max), prescurtări unde nu încape, fără să bagi pe live”.

## Ce e gata (testat local, 0 erori)
- `lang/i18n.js` – sistemul de traducere: traduce tot textul de pe ecran (DOM + canvas) în timpul jocului.
  - limba: cea aleasă (localStorage `te_lang`), altfel limba telefonului, altfel engleză. Engleza = nu face nimic.
  - text fără traducere = rămâne în engleză (numele eroilor, monștrilor, skill-urilor, locurilor rămân englezește intenționat).
  - un text care nu mai încape în chenar (un rând / chenar care taie) primește scris mai mic automat (max −30%).
  - datele (Sat 29 Nov…) se traduc singure (`@Mon`…`@Dec` în add.tsv).
  - buton `🌐 Limba` pe ecranul de start (merge și offline) + secțiunea LANGUAGE în Profil.
- `lang/fr.js`, `lang/es.js`, `lang/pt.js` (Brazilia), `lang/ko.js` (coreeană), `lang/ja.js` (japoneză) – ~3400 texte fiecare (fără NEWS – notițele de update rămân în engleză).
- Surse: `lang/src/` (src.tsv = toate textele engleze, t01-t10 = FR/ES/PT pe id, j01-j09 = KO/JA pe id, extra.tsv + extra_kj.tsv, add.tsv = prescurtări care câștigă; `@cjk` = datele în ordinea coreeană/japoneză). Reconstruiește: `python3 tools/lang_build.py`. Texte noi din cod: `node tools/lang_extract.js` (are nevoie de `npm i acorn acorn-walk`).
- Cod schimbat: `index.html` (încarcă lang/i18n.js primul + REP comparat cu dataset), `online.js` (LANG din alegere, „show original” cu dataset, secțiunea LANGUAGE), `sw.js` (lang/i18n.js în FILES).

## Poze fără scris (26 nov, Marius: „e ok, nu se vede diferența”)
- `img/nt/` = poze curățate automat de scris (OpenCV inpaint): `idle.webp`, `ui/ic_battle`, `ui/ic_arena`, `ui3/n_heroes|n_summon|n_crew|n_idle|n_quests`, `ui3/s_rank|s_chat|s_ci|s_news|s_mail|s_event`.
- Textul vine din cod: fereastra Idle în `renderIdle()` (index.html, `.idT`), butoanele hărții în `lang/labels.js` (poziții în % din poza veche; merge în toate limbile, și în engleză).
- Atenție: `pagefx.js` micșorează textele `nowrap` → etichetele folosesc white-space normal + spații/cratime care nu se rup; `word-break:keep-all` pentru japoneză/coreeană.

## Ce lipsește
- **Poze cu scris englezesc** (~60-80): butoanele hărții (HEROES, SUMMON, CREW, IDLE, QUESTS, EVENTS, MAIL, RANK, CHAT, NEWS), titluri de pagini (HEROES, SHOP, EVENTS, BATTLE…), bannerele Battle Hub, fereastra IDLE REWARDS (Money / Recruit Tickets / CLAIM), fundalul Summon / Team / Gear Summon (COMMON…MYTHIC), DAILY QUESTS, DUNGEONS. Soluția bună: poze FĂRĂ scris + scrisul pus din cod (o singură poză pentru toate limbile). Firmele clădirilor (SECURITY, SALES OFFICE…) pot rămâne englezește.
- Limbile: EN + FR, ES, PT-BR, KO, JA (6, decis de Marius 26 nov: „Coreea și mai alege tu una” → japoneza).

## Ca să-l pui pe live (doar când spune Marius)
schimbă `const V` în sw.js + `CV` în online.js, `python3 tools/sw_hash.py`, `bash tools/check_undef.sh`, `python3 tools/budget_phone.py`, apoi push pe `main`.

## Poze traduse (v16-374)
- 26 de poze cu text englezesc (titluri SHOP/BAG/CREW, HERO/GEAR/CREW SUMMON, CAMPAIGN, BATTLE, DAILY QUESTS, TEAM & COLLECTION, HERO COLLECTION, FUSION, raritățile din summon, WORLD BOSS, GEAR FORGE, DUNGEON PASS, check-in 5000…) au copii traduse în `img/l/<limbă>/` (aceeași cale).
- Sursa: `lang/src/img_spec.py` (casete + texte) → `python3 tools/img_l10n.py` (refăcute toate) sau `ONLY=team python3 tools/img_l10n.py fr` (una singură). Lista ajunge în `lang/imgs.js`.
- `lang/i18n.js` schimbă căile `img/...` → `img/l/<limbă>/...` (HTML, <img>, stiluri, canvas). Engleza nu încarcă nimic în plus.
- Rămân în engleză intenționat (nume de moduri / marcă): CAMPAIGN/ARENA/TORQUE TOWER/CLASS TOWERS/TORQUE CUP/WORLD BOSS/DUNGEONS pe cardurile din BATTLE, RAIL WARS, GRAND PRIX, WANTED, numele pachetelor din Shop, firmele clădirilor.
