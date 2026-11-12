# TORQUE EMPIRE – README proiect (versiunea 15.0 · Pagini noi din pozele mele · MY CREW · pregătit pentru Google Play · anti-cheat)

> Trimite arhiva (index.html + battle.js + folderul img/ + acest README) la începutul unui chat nou cu Claude, ca să știe tot contextul.

## Cine sunt și cum lucrez
- Nu am experiență în dezvoltarea de jocuri și lucrez **doar de pe telefon**.
- Claude creează jocul, iar eu spun ce schimbăm după ce îl joc.
- **La sfârșitul fiecărui pas îmi dai mereu 2 arhive zip**: una **mică** (capturi WebP) și una **mare** (capturi PNG). Publici jocul și ca pagină, ca să-l joc pe telefon.
- Fiecare versiune nouă pornește **de la zero** (salvare nouă), ca să pot testa.
- Nu adaugi funcții pe care nu le-am cerut. Îmi place ca jocul să fie **complex**.

## Ce este jocul
- Joc **idle** pentru telefon, în **engleză**, ecran portret: `index.html` (HTML5 + canvas) + `battle.js` (Campania / bătăliile, din v12) + folderul `img/` cu imaginile mele.
- Grafica e desenată din cod, **în afară de** ce e din imaginile mele (în `img/`): ecranul de start, garajele, mecanicii, mașina VIP, **Arrivals, Sales Office, Transport Yard + barierele, Security (fără om), pagina Daily Quests, pagina Mechanic Summon**. Mașinile, mașina VIP și camionul de transport sunt desenate din cod (decizia mea din v6). Folderul `assets/` are doar capturi de ecran.
- **Regulă**: orice schimbare pe hartă se face din pozele mele. Claude taie singur bucăți din poze și le adaugă după upgrade. Dacă o poză nu merge, îmi spune și trimit alta.
- Clădiri încă desenate din cod (n-am trimis poze încă): Export Parking, Helipad, Race Track, cabina VALET, garajul Service (are încă poza veche), Car Wash, Benzinăria, Gara, Fabrica, străzile/iarba, elicopterul, oamenii (șoferi, agenți de vânzări).
- **Mașinile rămân desenate din cod** (pozele mele de mașini nu se potriveau cu vederea de sus).
- Vedere strict de sus, o hartă mare (1500 × ~1830) care se mișcă cu degetul, zoom cu 2 degete sau butoane + / −.
- Salvare în browser (localStorage, cheia `torqueEmpire_v14`). Pachetele cumpărate și VIP Pass au cheia lor separată `torqueEmpire_packs`, care **nu se resetează** la versiune/capitol nou.

## Nou în v15 – pozele noi · MY CREW · pregătire Google Play · bot anti-cheat
### 🎨 Paginile refăcute după pozele mele (folder `img/ui/`)
- **Coloana din stânga** = iconițele mele (BATTLE, bilet, echipă, cutie de scule, clipboard, VIP). La VIP, nivelul se scrie din cod peste plăcuța galbenă.
- **Harta campaniei** ca în poză și pentru toate cele 20 de stage-uri și cele 50 de capitole: pământ tăiat din poză, macaraua cu mașina, mașinile strivite, atelierul, butoaiele, anvelopele, gardul și semnul „RUSTY JUNKYARD →" (scrisul l-am șters și scriu din cod numele fiecărei zone). Stage-urile = pastilele de metal din poză (gri; cea curentă aurie și strălucește; mini-boss portocalie, boss roșie cu craniu), drum de metal cu linii galbene, plăcuțe cu nume, stele. Fiecare lume/act primește culoarea ei peste același stil (otravă = verde, zăpadă = alb-albastru, neon = mov, vulcan = lavă). Sus: logo-ul TORQUE EMPIRE din poză.
- **Gear-urile** = cele 6 poze ale mele (cheie, vestă, ECU, mască de sudură, mănuși, bocanci), **aceeași poză la toate gradele**; gradul se vede din ramă (fr0–fr5) și din strălucire (Epic mov, Legendary auriu, Mythic roșu).
- **GEAR**, **GEAR SUMMON** (panoul GEAR FORGE din poză, cu piesele tale plutind peste el), **Summon Rates** (mecanici + gear), **Summon History**, **cardul eroului** – titlurile tăiate din poze, stil bleumarin + auriu ca în poze.
- **Bug reparat**: „28.0000000000004%" la șanse → acum 28%.
### 👥 MY CREW (butonul cu cei 3 mecanici) – cine lucrează în GARAJ (nu echipa de bătălie)
- Tab-uri Mechanics / Guards / Drivers. **WORKING NOW**: fiecare atelier cu boxele lui și cine e în ele (+ bonusul lui acolo, „½" dacă nu e specialitatea lui). Atingi o boxă → lista cu cine poate intra.
- **ON THE BENCH**: toți cei care nu lucrează. Cei care ar fi mai buni au „▲ BETTER" + cât câștigi și pe cine înlocuiesc → atingi → pagina **Before / After** și abia la ✓ CONFIRM se schimbă.
- **⚡ AUTO BEST**: pune pe fiecare unde ajută cel mai mult – îți arată înainte toate schimbările, totalul înainte → după, avantaje / dezavantaje.
- După summon, în rezultate: butonul **👥 SEE MY CREW · who to replace**. Bulină verde pe butonul echipei când ai pe bancă pe cineva mai bun. Albumul vechi (Collection) e în MY CREW → „Collection".
### ⏳ Durata jocului – fără „zid" mai lung de 2 zile (verificat cu simulatoare)
- **Clădirile LV 5–10**: costă ×2.5, dar se plătesc în **5 părți** (bară cu 5 liniuțe; la garaje fiecare parte dă deja o parte din bonusul de bani al nivelului următor). Rezultat simulat: **~6 luni** până la tot LV 10 la ~1 oră de joc pe zi (≈ 3.5 luni la 2 h/zi, ≈ 8 luni la 30 min/zi), cu maxim ~2 zile între două progrese.
- **Idle Rewards** cresc și cu nivelul clădirilor (la nivele mari câștigi bine și cu jocul închis).
- **Campania**: boss-urile din primele capitole sunt mai ușoare (cap. 1 ×0.42 … cap. 5 ×0.9) – boss-ul 1-20 se bate în ~2–3 zile, nu în săptămâni. Nou: **🔥 NEVER GIVE UP** – dacă pierzi la stage-ul următor, echipa ta primește **+7.5% HP și atac la fiecare 6 ore** cât stai blocat (max +60% după 2 zile), doar pentru acel stage; se vede pe cartonașul stage-ului.
### ⚡ Lag
- În bătălie fundalul (5 straturi) se lipește în 2 poze gata făcute cât echipa stă pe loc → mult mai puțin de desenat pe fiecare cadru. Testat: harta, campania și MY CREW la 60 fps; fără erori.
### 📱 Google Play + 🛡️ anti-cheat – vezi **GOOGLE_PLAY.md** (pași de pe telefon)
- `manifest.webmanifest`, `sw.js` (offline), `icons/`, `store/` (icon 512 + feature graphic), `privacy.html`, `.well-known/assetlinks.json`.
- `secure.js`: **plăți reale Google Play** (în aplicația din Play; în browser rămâne modul de test gratis), restaurare cumpărături, prețuri din Play; **anti-cheat**: semnătură pe salvare (editarea salvării se detectează), ceas dat înapoi, speed-hack, salturi imposibile de bani/bilete/VIP, ora serverului pentru Idle Rewards.
- `server/` = **Torque Guard**, botul online (Cloudflare Worker + D1, gratis): verifică fiecare jucător la fiecare raportare și **non-stop la 10 minute**, banează automat, confirmă cumpărăturile la Google, pagina ta `/admin` cu ban/unban.
- ⚠️ Salvarea: v15 pornește de la zero (cheia `torqueEmpire_v15`). **După publicare nu mai resetăm** salvarea la update-uri.

## Nou în v14 – pozele noi LV2–LV4 · clădiri până la LV 10 · 50 de capitole · Gear pe grade · GEAR SUMMON
### 🏗️ Pozele tale noi pentru upgrade (LV2 · LV3 · LV4)
- **Inspection Center, Paint Garage, Electrical Service, Engine Workshop, Tuning Garage**: fiecare nivel are acum **poza lui** (LV2 = 2 boxe, LV3 = 3 boxe, LV4 = 4 boxe; la Electrical LV4 boxele sunt 2 × 2, ca în poză). LV1 folosește poza LV2 cu a doua boxă blocată („🔒 LV 2”).
  - Din fiecare poză am tăiat firma de sus (firma rămâne cea veche, dreaptă, cu „LV x” lângă ea) și am pus restul pe hartă. Pozele sunt aproape pătrate, iar locul garajului pe hartă e lat (2:1), așa că poza e **puțin turtită pe înălțime** (≈ 0.6) – altfel ar fi trebuit mutată toată harta. Dacă vrei să arate perfect, trimite pozele **late (2:1)** și le pun fără turtire.
  - Pozele noi au **o singură ușă mare** → mașinile intră pe ușa din mijloc și merg înăuntru până la boxa lor (și ies tot pe acolo). Ușa se deschide când intră/iese o mașină.
  - Pozele LV3/LV4 erau câte 3 pe o imagine, deci au rezoluție mai mică decât Electrical (unde ai trimis fiecare nivel separat). Dacă trimiți fiecare nivel ca imagine separată, garajele vor fi mai clare la zoom mare.
- **Security**: LV1 = poza veche, **LV2/LV3/LV4 = pozele noi** (LV3 și LV4 sunt late, clădirea crește spre dreapta – am scos copacii de acolo). Paznicul stă pe scaunul din fiecare poză, iese pe ușa din poză, „REC” clipește, monitoarele au scanare. Scrisul „LV.2/3/4” din poză e acoperit cu nivelul real (1–10).
- **Parts Office**: LV1 = poza veche goală, **LV2/LV3/LV4 = pozele noi**. „LV.x” din poză e acoperit cu nivelul real.
### ⬆️ Toate clădirile până la **LV 10** (durează luni)
- **LV 1–4** = ca înainte (boxe, mecanici, șoferi, agenți, locuri de parcare, paznici cresc cu pozele). **LV 5–10** nu mai adaugă boxe (pozele au maxim 4), dar fac totul mai rapid și mai profitabil:
  - Garaje: viteză de lucru 175% → **350%** la LV 10 · **bonus bani pe lucrare** +10% (LV5) … **+80%** (LV10) · scutere tot mai rapide (până la *Electric superbike*).
  - Arrival Parking: mașină nouă la 2.9 s → **1.7 s**. Sales Office: vânzare 4 s → **2.1 s**, bonus vânzare +40% → **+120%**. Trailer: se întoarce în 5 s → **1.2 s**. Parts: pickup, lăzi și elicopter mai rapide. Security: prindere 85% → **92%**, recompensă 30% → **60%**.
- Pe hartă, de la LV 5 eticheta nivelului devine **aurie cu ★**. În panou sunt 10 liniuțe (cele de la 5 în sus sunt aurii).
- **Costuri** (calculate cu un simulator al jocului: la LV 4 + REP 6 câștigi ~$1.3M/oră cu jocul deschis, la LV 10 ~$3.9M/oră). Toate cele 11 clădiri la LV 10 ≈ **$350M** ≈ ~120–140 de ore de joc ≈ **câteva luni**:

| Clădire | LV 2 / 3 / 4 | LV 5 / 6 / 7 / 8 / 9 / 10 | Total LV 5→10 |
|---|---|---|---|
| Arrival Parking | $250 / $900 / $3K | $210K / $480K / $1.1M / $2.4M / $5.2M / $11M | $20.39M |
| Inspection | $300 / $1.1K / $3.5K | $220K / $510K / $1.2M / $2.6M / $5.6M / $12M | $22.13M |
| Service | $300 / $1.1K / $3.5K | $220K / $510K / $1.2M / $2.6M / $5.6M / $12M | $22.13M |
| Body & Paint | $1K / $2.6K / $6.5K | $310K / $700K / $1.6M / $3.5M / $7.6M / $17M | $30.71M |
| Electronics | $1.7K / $3.9K / $8.5K | $350K / $800K / $1.8M / $4M / $8.7M / $19M | $34.65M |
| Engine Shop | $3.8K / $7.5K / $15K | $460K / $1.1M / $2.4M / $5.3M / $12M / $25M | $46.26M |
| Tuning | $5.5K / $10K / $20K | $540K / $1.2M / $2.8M / $6.2M / $13M / $29M | $52.74M |
| Parts Office & Helipad | $3K / $6.5K / $13K | $430K / $990K / $2.2M / $5M / $11M / $24M | $43.62M |
| Sales Office | $600 / $2K / $5K | $270K / $620K / $1.4M / $3.1M / $6.7M / $15M | $27.09M |
| Security | $400 / $1.5K / $4K | $240K / $550K / $1.2M / $2.8M / $6M / $13M | $23.79M |
| Trailer | $500 / $1.8K / $4.5K | $250K / $580K / $1.3M / $2.9M / $6.3M / $14M | $25.33M |

### ⚔️ Campania: **50 de capitole × 20 = 1000 de stage-uri** (10 acte × cele 5 lumi)
- **Actul 1** = cele 5 capitole din v13. **Actele 2–10** se întorc prin cele 5 lumi cu vreme și culori noi: **Dusk** (amurg), **Storm** (ploaie + fulgere), **Crimson**, **Midnight** (noapte, lună), **Venom**, **Frostbite** (zăpadă peste tot, chiar și la vulcan), **Golden**, **Void**, **Omega** (foc și lavă). Exemple: 6 Rustfall Canyon · 13 Blizzard Peaks · 24 Midnight Expressway · 38 Golden Ice Caves · **50 Omega Inferno**.
- Monștrii din actele 2–10 sunt **monștri „elite”**: aceleași desene, dar recolorați (ex. „Storm Spark Imp”, „Venom Turbo Hound”); de la actul 3 apare în fiecare zonă și un monstru din altă lume. Mini-boss și boss noi la fiecare capitol (ex. „STORM JUNK TITAN”, „GOLDEN FROST PLOW”); **boss-ul final = ULTIMA ENGINE** (50-20).
- **Atinge numele capitolului** (sus pe hartă) → lista cu **toate cele 50 de capitole**, grupate pe acte, cu progresul și stelele. Săgețile ‹ › merg în continuare.
- **Echilibru testat automat** (echipa: 2 Mythic + 3 Legendary, gear pe toți 5):

| Echipa ta | Ajunge până la boss-ul din |
|---|---|
| Legendary +5, fără gear | capitolul 1 |
| +5 cu gear Epic Lv 10 | capitolul ~6 |
| +10 cu gear Legendary Lv 15 | capitolul ~12 |
| +20 cu gear Legendary Lv 25 | capitolul ~18–22 |
| +30 cu gear Mythic Lv 30 | capitolul ~29–32 |
| +40 cu gear Mythic Lv 40 | capitolul ~42 |
| **+50 cu gear Mythic Lv 50 (maxim)** | **capitolul 50** (boss-ul final câștigat cam 1 din 2 pe AUTO) |
- **Recompense** prima trecere: bani (de la $250 la ~$2.8M la 50-20), bilete eroi 🎟 (1 · mini-boss 3 · boss 5) și **bilete Gear 🎫 (1 · mini-boss 3 · boss 5)**, gear. Șansele de gear bun cresc până la capitolul 50 (Rare 5% · Epic 30% · Legendary 45% · Mythic 20%).
### 🎒 Gear pe grade, cu ramele tale
- **Fiecare grad are desenul lui** (36 de piese, toate în ramele tale fr0–fr5): ex. Tool = Rusty Wrench (gri, ruginit) → Steel Wrench (verde) → Torque Wrench cu cadran (albastru) → Impact Gun (mov) → Golden Ratchet cu rubin (galben) → **Titan Breaker** cu foc (roșu, Mythic). La fel pentru Helmet (Cloth Cap → **Crown of Gears**), Work Vest (Old Overalls → **Mythic Exo-Suit**), Gloves (Cotton → **Titan Fists**), Boots (Old Sneakers → **Nitro Boots** cu flăcări), ECU Chip (Basic Fuse → **Quantum ECU**).
- **Nivel maxim pe grad**: Common 10 · Uncommon 15 · Rare 20 · Epic 30 · Legendary 40 · **Mythic 50** (+12% din valoarea de bază pe nivel). Upgrade-urile peste Lv 10 costă bani din garaj (cresc cu 8% pe nivel).
### 🎫 GEAR SUMMON – pagină nouă cu **bilete noi (albastre)**
- Se deschide din butonul albastru **🎫 SUMMON** de sus din harta campaniei, din pagina **GEAR** („GEAR SUMMON”) și după o victorie în care ai primit bilete Gear.
- Biletul Gear = biletul tău, recolorat în albastru (ca să nu se confunde cu cel roșu pentru eroi). **Gear-ul merge doar în bătălii.**
- Pagina: „GEAR FORGE” (nicovală, piese Mythic/Legendary care plutesc, scântei) · cele 6 grade în rame cu șansele · contoare de garantat · **SUMMON x1** (1 bilet) · **SUMMON x10** (10 bilete = **11 piese**, +1 bonus) · Rate Info · Summon History (ultimele 60) · BAG.
- Șanse (ca la eroi, pe grade): **Common 45% · Uncommon 28% · Rare 16% · Epic 8% · Legendary 2.5% · Mythic 0.5%**. Garantat: **Epic+ la 10**, **Legendary+ la 50**, **Mythic la 200** de summon-uri.
- Rezultatele apar pe rând (cele Epic/Legendary/Mythic strălucesc), cu butoanele AGAIN x10 / EQUIP / CLOSE. Dacă bag-ul e plin (150), piesele în plus se vând automat.
- La start ai **10 bilete Gear**. De unde mai iei: prima trecere a fiecărui stage **+1**, mini-boss **+3**, boss **+5**.

## Nou în v13 – Campania mare · Gear (echipament) · viteză ×1.5 / ×2 · iconițe noi
### ⏩ Viteza bătăliei
- **×1** și **×1.5 = gratis** pentru toți. **×2 = pachet €4.99** (pentru totdeauna, toate capitolele). ×3 a fost scos.
- Butonul de viteză: ×1 → ×1.5 → (dacă nu ai pachetul) apare oferta „BATTLE SPEED ×2 · €4.99 · UNLOCK ×2 / NO THANKS”. Pachetul e și în **Shop** 🛒 (cheia separată `torqueEmpire_packs`, nu se resetează).
- Versiune de test: apăsarea pe preț deblochează fără plată.
### 🗺️ 5 capitole × 20 stage-uri = 100 de stage-uri
- Sus pe hartă: **‹ Capitolul ›** cu progresul (stage-uri și stele). Capitolul următor se deschide după boss-ul capitolului (stage X-20). Fiecare capitol are 4 zone × 5 stage-uri, peisaje proprii și monștri proprii. **X-10 = mini-boss**, **X-20 = boss**. La fiecare al 5-lea stage = 3 valuri.

| Capitol | Zone (peisaje) | Monștri noi | Mini-boss · Boss |
|---|---|---|---|
| 1 · Scrapyard Wastes | Rusty Junkyard · Smog Valley · Burning Stacks · Titan's Foundry | (cei din v12) | CRUSHER · JUNK TITAN |
| 2 · Toxic Refinery | Acid Swamp · Pipe Maze · Tank Farm · Refinery Core (bălți de acid cu bule, țevi, rezervoare) | **Battery Golem** (pumni cu electricitate, stun scurt, lovește pământul) · **Fuel Can Bomber** (aruncă bombe cu acid care lovesc și în jur) | SLUDGE CRUSHER · **ACID TANKER** (cisternă în picioare, furtunuri-brațe, jet de acid pe bandă, cheamă Fuel Cans) |
| 3 · Frozen Pass | Snow Road · Ice Bridges · Frost Peaks · Glacier Depot (zăpadă care cade, brazi, munți albi) | **Wiper Mantis** (lame de ștergătoare, sare pe tine) · **Hubcap Saw** (capac de roată-fierăstrău zburător) | FROST CRUSHER · **FROST PLOW** (plug de zăpadă cu girofar, rază de gheață, cheamă Hubcap Saws) |
| 4 · Neon Highway | City Lights · Tunnel Run · Skyline Ramp · Turbo Arena (oraș noaptea, clădiri cu geamuri, neoane, felinare, șosea) | **Horn Howler** (claxon – undă de sunet care încetinește) · **Turbo Hound** (câine-turbină, prima lovitură dublă) | NEON CRUSHER · **TURBO WYRM** (dragon din țevi cromate cu neon, cap-turbină, cheamă Turbo Hounds) |
| 5 · Volcano Forge | Ash Fields · Lava Rivers · Forge Halls · Omega Core (vulcani cu fum, lavă, cenușă) | **Gearbox Golem** (uriaș, roți dințate) · **Exhaust Bat** (liliac-eșapament, scuipă foc) | MAGMA CRUSHER · **OMEGA ENGINE** (motor V8 uriaș cu pistoane, boss final) |

- Toți monștrii, boss-ii și peisajele sunt desenați din cod (nu am poze pentru ei – dacă trimiți, le pun).
- **Recompense** prima trecere: bani (de la $250 la ~$85,000 la 5-20), bilete (1 · mini-boss 3 · boss 5), **gear** (1 · mini-boss 1 mai bun · boss 2 mai bune). Rejucare: 25% din bani, 40% șanse de gear (boss/mini-boss: 1 gear sigur).
- **Echilibru testat automat**: capitolul 1 ca în v12 (boss-ul cere Legendary +4/+5) · capitolul 2 = Legendary +5 cu gear Epic · capitolul 3 = Mythic +5 cu gear Epic · capitolul 4 = Mythic +20 cu gear Legendary · **boss-ul final** = Mythic +50 cu gear Mythic Lv 10.
### 🎒 GEAR – pagină separată (merge **doar în bătălii**, nu în garaj)
- Se deschide din butonul **GEAR** (sus pe harta campaniei), din **CHOOSE YOUR TEAM** și după victorie (**EQUIP GEAR**).
- Sus: lista mecanicilor tăi (cu „TEAM” la cei din echipă). În mijloc: eroul în rama lui + **6 locuri**: 🔧 **Tool** (Attack) · ⛑ **Helmet** (HP) · 🦺 **Work Vest** (Defense) · 🧤 **Gloves** (Crit) · 👢 **Boots** (Attack speed) · 💾 **ECU Chip** (Skill charge = ultimate mai repede). Dedesubt: statisticile eroului (verde = cât vine din gear) și puterea.
- **Bag** (max 150) cu filtre pe tipuri. Gear-ul folosește **ramele mele de raritate** (fr0…fr5) cu „Lv x” pe plăcuță.
- Raritate: Common 6% · Uncommon 10% · Rare 15% (+1 bonus) · Epic 22% (+1) · Legendary 30% (+2) · Mythic 40% (+2 bonusuri). **Upgrade Lv 1 → 10** cu bani (+12% pe nivel). **Salvage** = bani (apeși de 2 ori).
- Ce gear pică depinde de capitol (cap. 1 mai mult Common … cap. 5 Epic / Legendary / Mythic). Pe cardul stage-ului scrie șansa.
- Rookie Crew nu poate purta gear. Dacă un erou e folosit în Fusion, gear-ul lui se întoarce în bag.
### ✅ Înainte / După – avantaje și dezavantaje înainte de orice schimbare
- **Echipa de bătălie**: atingi un mecanic din echipă → lista celor care îl pot înlocui (cu puterea în plus / în minus) + „Remove”. Atingi unul → pagina **Before / After**: rol, skill, distanță (melee / ranged), tabel HP · Attack · Defense · Crit · Attack speed · Skill charge · Power, apoi **✅ ADVANTAGES** și **❌ DISADVANTAGES** (ex. „No Medic left – nobody heals the team”, „Loses skill: PISTON SLAM”, „Fights up close”), puterea echipei înainte → după (EASY / EVEN / HARD). Abia la **✓ CONFIRM** se schimbă.
- Echipa plină + atingi un mecanic de jos → „Who should he replace?” → aceeași pagină. **AUTO BEST** arată cine iese / cine intră și diferența înainte de confirmare.
- **Gear**: atingi o piesă → tabel înainte / după pe eroul ales + avantaje / dezavantaje („Replaces …”, „Taken from Viktor (his power −…)”) → **✓ EQUIP**. La fel pentru Unequip, **AUTO EQUIP** (ia doar gear liber) și **REMOVE ALL**.
### 🎨 Iconițe noi în paginile de bătălie
- Emoji-urile au fost înlocuite cu iconițe desenate: medalii rotunde colorate pentru roluri (Bruiser = roată dințată, Racer = steag, Scanner = lupă, Medic = cheie, Sprayer = spray, Shocker = fulger, Legend = stea, Crew = piuliță) pe cartonașele din echipă și din luptă, craniu pentru boss și coarne pentru mini-boss pe hartă, săbii încrucișate, rucsac GEAR, monedă, butonul de pauză, iconițe pentru statistici.

## Nou în v12 – fix lag + claritate la zoom · ⚔️ CAMPANIA v1 (bătălii)
### Lag și „ceața” la zoom (rezolvat)
- **Cauza ceții**: rezoluția adaptivă cobora la 1× și nu mai urca niciodată. Pe telefoanele care țin ecranul la 30 de cadre/s (economisire baterie) asta se întâmpla mereu, chiar dacă jocul nu avea lag → la zoom mare totul arăta încețoșat.
  - Acum: **nu mai coboară sub 1.5×** pe ecranele clare, nu mai confundă „telefonul la 30 fps” cu lag și **urcă înapoi** singură după ~25 s fără lag.
  - Pozele mari (Arrivals, Sales Office, Security) se folosesc la **rezoluție completă** (înainte erau micșorate la 60–75%) → clare și la zoom maxim.
  - În timpul zoom-ului cu degetele harta se întinde cu netezire (înainte pixeli „în trepte”).
- **Lag**: garajele, Sales Office, Parts Office, Security și helipad-ul se desenează acum **o singură dată** în harta salvată (bucăți de 512 px) – pe fiecare cadru se mai desenează doar ce se mișcă (uși, lumini, girofare, monitoare). Se refac singure la fiecare upgrade.
  - Fiecare **mașină** se desenează într-o poză mică proprie de ~12 ori pe secundă, iar pe fiecare cadru doar se rotește și se mută → arată la fel, dar mult mai puțină muncă.
  - Test (telefon simulat, procesor 4× mai lent): **20 → 9 ms** pe cadru la zoom mic, **16 → 8 ms** la zoom normal, **11 → 5 ms** la zoom mare.

### ⚔️ Campania (buton roșu **⚔️ BATTLE**, sus în coloana din stânga)
- **Capitolul 1 · Scrapyard Wastes** – 10 stage-uri pe o hartă-drum (de jos în sus), 4 zone: Rusty Junkyard (1–3), Smog Valley (4–6), Burning Stacks (7–9), Titan's Foundry (10). Stage-ul 5 = mini-boss **CRUSHER**, stage-ul 10 = boss-ul **JUNK TITAN**.
- Atingi un stage → panou cu monștrii (desenați), puterea inamicului vs. a echipei tale, recompense → **BATTLE** → alegi echipa.
- **Echipa: maxim 5 mecanici** (eroii-mecanici din Summon). Dacă ai mai puțini, completezi cu **Rookie Crew** (mecanici simpli, portocalii). „⚡ AUTO BEST” pune cei mai puternici. Puterea crește cu culoarea (×1 … ×3.9 la Mythic) și cu „+”-ul eroului (aceleași reguli ca în v11: +1…+5 = +20% fiecare, +6…+50 = +4% fiecare).
- **Rolul vine din specializare**, fiecare cu altă unealtă, alt atac și alt skill:

| Specializare | Rol | Atac normal | Skill (ULTIMATE) |
|---|---|---|---|
| ⚙️ Engine | Bruiser (tank, aproape) | cheie uriașă | **PISTON SLAM** – sare în grupul cel mai mare: 220%, stun 1.2s, îi atrage pe inamici la el + scut |
| 🏁 Tuning | Racer (rapid, aproape) | pistol de impact | **NITRO DASH** – trece prin toți inamicii de pe banda lui cu flacără albastră: 260%, mereu critic |
| 🔍 Inspection | Scanner (distanță) | rază laser | **FULL DIAGNOSTIC** – val de scanare: 120% și inamicii primesc +35% damage 7s |
| 🔧 Service | Medic (distanță) | aruncă piulițe | **OIL CHANGE** – vindecă toată echipa 32% + încă 12% în 4s (și la fiecare a 3-a lovitură îl vindecă pe cel mai slab) |
| 🎨 Body & Paint | Sprayer (distanță) | bile de vopsea (lovesc și în jur) | **COLOR STORM** – bombă de vopsea: 180%, încetinire 50%, baltă de vopsea care arde 4s |
| ⚡ Electronics | Shocker (distanță) | fulger | **OVERVOLT** – fulger în lanț de 6 ori: 200%, stun 1.5s |
| 🌟 Mythic (toate) | Legend | cheie de aur | **TORQUE STORM** – cad roți dințate uriașe pe toți inamicii: 300% + toată echipa +30% atac 6s |
| 🔩 Rookie Crew | Crew | cheie | **WRENCH THROW** – cheie aruncată: 250% |

- **Energia** (bara galbenă) se umple când lovești și când ești lovit. Când e plină, cartonașul de jos strălucește „**TAP!**” → îl apeși și eroul folosește skill-ul (încetinire de timp, bandă cu portretul și numele skill-ului). **AUTO** = le folosește singur (Medicul așteaptă să fie cineva rănit). **×1 / ×2 / ×3** = viteza. **❚❚** = pauză (Resume / Retreat).
- **Monștri din piese de mașină** (desenați din cod, animați): **Spark Imp** (bujie cu scântei), **Tire Roller** (anvelopă cu ochi roșu, se rostogolește și prima lovitură e dublă), **Muffler Serpent** (șarpe din țevi de eșapament, scuipă fum), **Headlight Drone** (far zburător cu elice, laser), **Piston Spider** (bloc motor cu picioare-pistoane, sare pe tine), **Radiator Brute** (radiator, amortizoare, pumni-jante, lovește pământul – cerc roșu de avertizare).
  - **CRUSHER** (mini-boss): lovește pământul + **șarjă** pe o bandă (dreptunghi portocaliu de avertizare).
  - **JUNK TITAN** (boss): corp de mașină în picioare, faruri-ochi, grilă cu dinți, motor-inimă care pulsează, brațe din arcuri cu roți, coșuri cu foc. Lovește pământul (cerc), **laser** pe o bandă (galben), cheamă Spark Imps, la 50% viață intră în **ENRAGED** (se face roșu, mai rapid).
- **Peisajele** (desenate din cod, cu paralaxă când echipa merge spre valul următor): cer, soare/lună, munți de fier vechi, macarale cu magnet care se leagănă, coșuri de fabrică cu fum, mașini strivite stivuite, anvelope, butoaie (cu foc noaptea), gard, crăpături cu lavă la Titan, scântei/praf în aer.
- Efecte: scântei, fum, bucăți de metal și roți dințate care sar la explozii, cifre de damage (💥 = critic), scutură ecranul, bliț la lovituri.
- 2–3 **valuri** pe stage; între valuri echipa merge înainte (fundalul se mișcă) și se vindecă 15%.
- **Stele**: ⭐⭐⭐ niciun mecanic K.O. · ⭐⭐ maxim 2 · ⭐ restul.
- **Recompense** la prima trecere: bani (de la $250 la ~$7,000 la stage 10) + bilete (biletul tău nou) (1, stage 5 = 3, boss = 5). Rejucare: 25% din bani, fără bilete.
- Jocul garajului **merge mai departe** cât timp ești în campanie (doar nu se mai desenează harta, ca să nu consume).
- Echilibru testat automat: doar Rookie Crew → stage 1 · eroi gri/verzi → ~stage 6 · albaștri/mov +1–3 → ~stage 8 · galbeni → stage 9 · boss-ul cere Legendary +4/+5 sau un Mythic.

## Nou în v11 – paginile mele pentru echipă, Fusion și Idle Rewards · bilet nou · +50
### Pagini noi = pozele mele
- **Team & Collection** (`img/team.webp`): din poză am șters doar cifrele (0, 10/42, 5/10…, textele bonusurilor, „MECHANIC SUMMON”, bara plină) și le scriu din cod. Tab-ul Mechanics din poză era auriu – l-am înlocuit cu tab-ul gri din pagina Fusion, iar tab-ul activ primește contur auriu din cod.
  - Rândurile de culoare (Common … Mythic): atingi rândul → lista eroilor din culoarea aceea (cu ramele noi). Când aduni toată culoarea: textul devine verde + ✓ pe cufăr.
  - La **Guards / Drivers**, peste mecanicii din poză se pun 3 eroi Legendary în ramele aurii (n-am poze pentru ei). Titlul devine „GUARDS / DRIVERS COLLECTION”, butonul „GUARD / DRIVER SUMMON”.
  - **??? COMING SOON** = eroii noi (încă nu există). Banda „MYTHIC · only from Fusion” deschide Fusion.
- **Fusion** (`img/fusion.webp`): am șters textele care depindeau de categorie (DRIVER, info, FUSE (0/3), „YOUR LEGENDARY +5 DRIVERS”) și le scriu din cod. Pastila aurie „Drivers” am făcut-o gri ca celelalte; cea activă primește contur auriu din cod. Eroii aleși apar în cele 3 rame „+5 LEGENDARY”, cei 2 Mythic apar în cele 2 pătrate „?” când îi descoperi. Lista de jos (6 locuri) se derulează la stânga/dreapta dacă ai mai mulți.
- **Idle Rewards** (`img/idle.webp`): am șters $167, 0h 25m, $390 / hour, 0, 1 every 2h, bara portocalie și textul de jos; le scriu din cod. Biletele cu mașină din poză (lângă cufăr și pe rândul Recruit Tickets) le-am înlocuit cu biletul nou.
### Biletul nou 🎟 = poza mea (`img/ticket.webp`)
- Peste tot: butonul din stânga jos, pagina Summon (sus + Summon x1 + Summon x10 – tăiate și înlocuite în poză), Team, Fusion, Idle Rewards, rezultate, mesaje (toast), popup-uri.
### Ramele de raritate = pozele mele (`img/fr0…fr5.webp`)
- Gri Common · Verde Uncommon · Albastru Rare · Mov Epic · Galben Legendary · **Roșu Mythic** (Mythic e acum **roșu**, ca în pozele mele; „???” = coming soon). Portretul stă în fereastra ramei, iar „+N” pe plăcuța de jos.
### Eroii până la **+50**
- Fiecare duplicat = **+1** (de la +0 până la **+50**). La +50 → bani în loc.
- Fiecare + dă statistici: **+1…+5 = +20% din bază fiecare**, **+6…+50 = +4% din bază fiecare** → la +50 = **×3.8** din bază.
- Plafoane ca să nu treacă de 100%: lucrare dublă max 60%, pierdere mai mică max 80%, bacșiș max 80%.
- **Fusion** cere Legendary **minim +5** (poate fi și mai mare – stelele se pierd la fuziune). Când adăugăm eroii noi (???), pentru ei o să cerem **Mythic +5**.
### Înainte / după (Before / After) când pui sau schimbi un erou
- În lista de alegere (din clădire „+ ADD / CHANGE” sau din erou „ASSIGN / MOVE”), fiecare rând arată deja diferența principală („⚡ Work speed here: +14%” sau „vs now: −5%”).
- Când atingi un erou se deschide pagina **Before / After**: cine e acum în loc → cine vine, tabel cu toate bonusurile în **acel loc** (Înainte · După · Schimbare ▲ verde / ▼ roșu), avertisment dacă e specialist în alt garaj (doar jumătate), cine pleacă de unde. Abia la **✓ CONFIRM** se face schimbarea.
### Idle Rewards după nivelul VIP
- Bani pe oră = (120 + 45 × suma nivelurilor clădirilor) × Reputație × **(1 + bonus VIP Idle)**.
- Bonus VIP nou în lista VIP: **🧰 Idle Rewards money: +5% pe fiecare nivel VIP** (VIP 1 = +5% … **VIP 20 = +100%**, cu VIP Pass ×1.3 = +130%). Înainte se folosea bonusul de bani pe lucrări (+1%/nivel).
- Jos pe pagină scrie bonusul VIP actual.

## v10 – upgrade vizual pentru tot jocul
- Temă nouă pentru hartă și meniuri (iarbă, copaci, umbre, panouri, butoane, popup-uri, bara de jos etc.), aleasă după comparația „Vechi vs Nou”. v11 e construită peste v10.

## Nou în v9 – Summon (mecanici · paznici · șoferi) + Idle Rewards
### Pagina de Summon = poza mea (`img/summon.webp`)
- Butonul **🎟** (stânga jos, cu numărul de bilete) deschide pagina. Din poză am șters doar cifrele (3,450 / 216,800) și cele 5 puncte. Diamantul l-am înlocuit cu biletul galben tăiat din butonul „Summon x1”. Peste poză se scriu din cod: biletele, banii, cele **3 puncte = 3 categorii** (🔧 mecanici · 🛡️ paznici · 🛵 șoferi) și săgețile ‹ ›.
- Pentru **paznici și șoferi** nu am poze, așa că partea de sus (titlul „GUARD SUMMON” / „DRIVER SUMMON” + eroii) e desenată din cod, iar peste „Available Mechanics” scrie „Available Guards / Drivers”. **Dacă trimiți poze pentru ele, le pun.**
- Butoane: ↩ înapoi · biletul / + = de unde iei bilete · plăcile de culoare = lista eroilor din acea culoare · „i” și **Rate Info** = șansele · **Summon History** = ultimele 60 · **Summon x1** (1 bilet) · **Summon x10** (10 bilete = **11 eroi**, „+1 Bonus!”) · **Collection Bonus** = pagina echipei.

### Grade (culori)
| Culoare | Grad | Șansă | Cum îl iei |
|---|---|---|---|
| ⚪ Gri | Common | 49% | summon |
| 🟢 Verde | Uncommon | 28% | summon |
| 🔵 Albastru | Rare | 15% | summon |
| 🟣 Mov | Epic | 6% | summon |
| 🟡 Galben | Legendary | 2% | summon |
| 🟠 Portocaliu | Mythic | 0% | **doar din Fusion** |
| 🔴 Roșu | ??? | – | **COMING SOON** (siluete) |
- **Garantat**: un Epic sau mai bun la fiecare **10** summon-uri, un Legendary la fiecare **50** (contoare separate pe categorie, scrise sub butoane).
- **Stele +0 … +5**: dacă tragi un erou pe care îl ai deja, primește **+1 ★**. Fiecare stea = +20% din puterea lui de bază (la +5 e dublu). Dacă e deja +5 → primești **bani** în loc.
- **Un singur tip de bilet 🎟 (Recruit Ticket)** pentru toate cele 3 categorii. La start: **10 bilete**.

### Eroi (portretele sunt desenate din cod, fiecare arată altfel)
- **Mecanici – 42** (+2 roșii): gri 10 · verde 9 · albastru 8 · mov 7 · galben 6 · **mythic 2** (The Torque King, Lady Overdrive). Fiecare are o **specializare** (Inspection, Service, Body & Paint, Electronics, Engine, Tuning). În garajul lui dă bonus întreg, în altul doar **jumătate**. Mythic = toate garajele.
  - Dau: ⚡ viteză de lucru, 💰 bani pe lucrări, 🎯 (de la Rare) șansă ca lucrarea să fie plătită dublu. Mythic: **aură +10% viteză pentru tot garajul**.
- **Paznici – 29** (+2 roșii): gri 7 · verde 6 · albastru 5 · mov 5 · galben 4 · mythic 2 (The Wall, Night Hawk). Locuri: paznicul de la birou + paznicul care patrulează (Security LV 3).
  - Dau: 🛡️ șanse să prindă hoțul, 🏃 viteză la alergat, 💰 recompensă mai mare, 🔒 (de la Epic) pierzi mai puțini bani dacă fură o mașină.
- **Șoferi – 29** (+2 roșii): gri 7 · verde 6 · albastru 5 · mov 5 · galben 4 · mythic 2 (Apex, Midnight Rider). Lucrează la Arrivals (valeți), la fiecare garaj și la Sales Office.
  - Dau: 🛵 viteză (scuter și mers pe jos), 💵 (de la Rare) șansă de **bacșiș** la fiecare drum.

| Bază (+0) | Gri | Verde | Albastru | Mov | Galben | Mythic |
|---|---|---|---|---|---|---|
| Mecanic: viteză / bani | 5% / 3% | 9% / 6% | 14% / 10% | 21% / 15% | 30% / 22% | 45% / 34% |
| Mecanic: lucrare dublă | – | – | 4% | 7% | 10% | 15% |
| Paznic: prindere / viteză / recompensă | 2/5/2% | 4/10/4% | 6/15/6% | 9/22/9% | 13/30/12% | 18/42/18% |
| Paznic: pierdere mai mică | – | – | – | 20% | 35% | 50% |
| Șofer: viteză / bacșiș | 5% / – | 10% / – | 16% / 10% | 24% / 15% | 34% / 22% | 50% / 30% |

### Unde pui eroii
- Atingi o clădire → secțiunea **👥 TEAM** (sub rânduri): fiecare boxă / șofer / paznic are „+ ADD” sau „CHANGE” → lista eroilor tăi, cei mai buni primii (cu ✓ dacă e specializarea potrivită).
- Sau din pagina echipei: atingi eroul → **ASSIGN** / **MOVE** / **REMOVE**.
- Pe hartă (cu zoom) eroii au deasupra un romb în culoarea lor + „+stele”; la zoom mare și numele.

### 👥 Team & Collection (buton 👥 sau „Collection Bonus”)
- Tab-uri: 🔧 Mecanici · 🛡️ Paznici · 🛵 Șoferi · 🧪 Fusion. Albumul arată toți eroii; cei pe care nu i-ai găsit sunt siluete „???”, roșii = SOON.
- **Collection Bonus**: când aduni toți eroii dintr-o culoare primești un bonus pentru toată categoria (ex. mecanici: toți gri → +2% bani pe lucrări … toți mythic → +10% viteză). Eroii folosiți în Fusion **rămân în album** (bonusul nu se pierde).

### 🧪 Fusion Lab
- **3 eroi Galbeni (Legendary) diferiți, toți la +5 → 1 erou Mythic** (portocaliu) din aceeași categorie, la întâmplare dintre cei 2. Cei 3 galbeni se consumă (îi poți trage din nou). Dacă ai deja Mythic-ul → +1 ★.

### De unde iei bilete 🎟
- Fiecare Daily Quest luat: **+1** · cadourile Daily Quests: **+1 / +2 / +2 / +3** · fiecare hoț prins: **+1** · fiecare nivel nou de Reputație: **+5** · fiecare nivel VIP nou: **+5** · Idle Rewards: **+1 la 2 ore** · **VIP Pass: 1 summon GRATUIT pe zi** (apare „FREE 👑” pe Summon x1).

### 🧰 Idle Rewards (buton 🧰)
- Garajul câștigă și când jocul e închis: lada se umple până la **12 ore**. Bani pe oră = (120 + 45 × suma nivelurilor clădirilor) × Reputație (×1 / 1.5 / 2.3 / 3.5 / 5 / 7) × bonus VIP bani. + 1 bilet la 2 ore (max 6).
- Bulină verde pe buton după 1 oră, roșie „!” când e plină. Când revii după mai mult de 10 minute apare singur panoul „Welcome back” cu CLAIM.

## Nou în v8
### Garaje noi (pozele mele)
- **Inspection Center, Paint Garage (Body & Paint), Electrical Service (Electronics), Engine Workshop, Tuning Garage** = pozele mele noi. **Service** păstrează poza veche (n-am trimis una nouă).
- Pozele au câte 2 boxe; Claude le taie în bucăți (stânga · 2 boxe · dreapta) și pune bucata cu boxe de 2 ori → garaj cu **4 boxe**. Fațada e refăcută din poză: o ușă rulantă tăiată din poză în dreptul fiecărei boxe + ușa mică din dreapta (pe acolo ies șoferii). La Paint, cabinele 3 și 4 au numerele 03 / 04.
- Boxele blocate sunt întunecate cu dungi și „🔒 LV x”; la upgrade apar. Când intră o mașină, ușa rulantă se deschide.
- Firma din poză (ex. „PAINT GARAGE”) e tăiată și pusă deasupra garajului, mereu dreaptă, cu nivelul „LV x” lângă ea. (Rândurile cu ușa în sus sunt întoarse 180°, deci desenele din interior sunt cu capul în jos – firma rămâne citibilă.)
### Parts Office (poza mea) – se deschide la REP 3
- LV 1 = fără rafturile din mijloc · LV 2 = raftul **OEM / GENUINE** · LV 3 = raftul **SPECIAL PARTS** · LV 4 = masa de ambalare cu scanerul. Restul (bucăți de podea) sunt tăiate tot din poză.
- Când sunt comenzi: „URGENT · n” clipește pe tejghea. Pickup-ul descarcă la ușa rulantă din poză.
### Bara de sus (HUD) = poza mea
- Textele din poză ($216, REP 1, 4) au fost șterse; banii, REP + bara de progres și mașinile vândute sunt scrise peste. Coșul 🛒 deschide Shop-ul, pastila REP deschide reputația.
### Collection Garage (poza mea) – showroom mașini de epocă · COMING SOON
- În dreapta hărții, cu drum privat din strada de jos. Securitate în plus fiindcă e premium: **gard pe tot perimetrul, 6 camere CCTV, gheretă de pază, barieră, poartă cu laser, stâlpi, reflectoare**. Panou „🏆 CLASSIC COLLECTION · PREMIUM”. Sistemul îl facem când îmi spui cum vrei.
### Cartier nou COMING SOON (sub autostrada trailerului, harta e mai mare: 1500 × ~2390)
- **🫧 Car Wash**, **⛽ Benzinărie** (lângă autostradă), **🚆 Rail Terminal** (trenul vine să ia mai multe mașini deodată – tren cu vagoane cu 2 etaje), **🏭 Torque Motors – fabrica de mașini**, cu drum de serviciu și cale ferată. Toate desenate din cod, cu bandă „COMING SOON”. Le atingi → panou „Coming soon”.
### VIP 20 ≈ 6 luni
- Maxim ~155 puncte VIP pe zi (5 quest-uri + cadourile). Praguri noi: VIP 1 = 50, VIP 2 = 220, VIP 5 = 1,500 (~10 zile), VIP 10 = 6,480 (~6 săpt.), VIP 15 = 15,250 (~3 luni), **VIP 20 = 28,000 (~6 luni)**.

## Nou în v7
### Security (poza mea nouă, fără om)
- Paznicul e desenat din cod: stă pe scaunul de la birou și se uită la monitoare. Când vine un hoț, se ridică, iese pe ușă și **aleargă** până la hoț (prin poarta de sus a Transport Yard sau pe lângă gard).
- **Hoți**: cam o dată la 1–2 minute apare un hoț (îmbrăcat în negru, „🦹 THIEF”) care se furișează la o mașină din **Transport Yard** sau din **Export Parking**. Când o sparge: alarma mașinii clipește, girofarul de pe birou și monitoarele se fac roșii, „🚨 THIEF!”.
  - **Prins**: paznicul îl ține („⛓ CAUGHT”), primești recompensă (% din valoarea mașinii), vine **mașina de poliție** cu girofar pe autostradă, intră pe poartă, hoțul urcă în ea și poliția pleacă.
  - **Scapă**: hoțul fuge cu mașina pe autostradă, pierzi **50% din valoarea mașinii**, iar o **mașină de poliție îl urmărește** pe autostradă („🚔 POLICE CHASE!”). Banii nu scad sub $0.
- Atingi clădirea → panou Security cu upgrade și record (hoți prinși / mașini furate).

| Security | LV1 | LV2 ($400) | LV3 ($1,500) | LV4 ($4,000) |
|---|---|---|---|---|
| Șanse să-l prindă | 40% | 55% | 70% | 85% |
| Viteza paznicului | 95 | 110 | 125 | 140 |
| Recompensă | 15% din mașină | 20% | 25% | 30% |
| Ce se vede | 1 paznic | +2 camere în curte | +1 paznic care patrulează în jurul curții | +2 camere pe clădire |

### VIP 1–20 (buton 👑 stânga jos)
- Puncte VIP **doar din Daily Quests** – pentru toți jucătorii (și cei care nu plătesc).
- (v7) Puncte necesare: VIP 20 = 6,030 – **schimbat în v8**: VIP 20 = 28,000 (~6 luni).
- **VIP Pass – €5.99 / 30 de zile** (în panoul VIP și în Shop): toate beneficiile VIP sunt **×1.3**. Test: apăsarea pe preț îl activează fără plată.
- Beneficii (+1% pe fiecare nivel de la nivelul la care apar; cu VIP Pass ×1.3):

| Beneficiu | Apare la | La VIP 20 | La VIP 20 cu Pass |
|---|---|---|---|
| 💰 Bani pe lucrări | VIP 1 | +20% | +26% |
| 🛡️ Șanse să prindă hoțul | VIP 2 | +19% | +24.7% |
| ⚡ Viteză de lucru | VIP 3 | +18% | +23.4% |
| 🏷️ Preț de vânzare | VIP 5 | +16% | +20.8% |
| 🔧 Reducere la upgrade-uri | VIP 8 | −13% | −16.9% |
| 🚗 Mai mulți clienți | VIP 10 | +11% | +14.3% |

### Daily Quests (buton 📋 stânga jos, cu bulină roșie când ai ceva de luat)
- Pagina e poza mea. 5 quest-uri pe zi, se schimbă la miezul nopții (ceas pe panglica roșie). Fiecare dă **doar puncte VIP** (10–25). Apeși CLAIM.
- Quest-uri posibile: vinde mașini, câștigă $, inspectează, lucrări la Service / Body & Paint / Electronics / Engine / Tuning (doar dacă ai garajul), upgrade la clădiri, prinde un hoț, repară mașini City Fleet, încarcă mașini pe trailer. Numerele cresc cu reputația.
- Cadourile de jos: la 2 / 3 / 4 / 5 quest-uri luate se deschid cadouri cu +10 / +15 / +20 / +30 puncte VIP.

## v6.1 / v6.2 – fluiditate (fix lag)
- **Fundalul static** (iarbă, drumuri, autostradă, pista de curse, Arrivals, Export Parking, Transport Yard) se desenează **o singură dată** în bucăți (tile-uri de 512 px) la rezoluția exactă a ecranului și apoi doar se copiază la fiecare cadru. Înainte se redesena totul de la zero de 60 de ori pe secundă.
- **Zoom (v6.2)**: cât timp degetele mișcă zoom-ul nu se desenează nimic nou – se întinde rapid (fără netezire) ce e deja gata, iar unde lipsește se folosește o poză mică a întregii hărți (făcută o dată la pornire). După ce zoom-ul se oprește, harta se face clară treptat (max ~4 ms pe cadru). În v6.1 zoom-ul redesena toată harta la fiecare cadru și era mai lent decât înainte. La upgrade la Arrivals se refac automat. Memorie maximă ~40 MB.
- **Rezoluția adaptivă chiar funcționează acum**: înainte măsura doar timpul JavaScript (~3 ms), nu și desenarea reală, deci nu scădea niciodată rezoluția. Acum măsoară timpul real al cadrului; dacă telefonul nu ține pasul, scade rezoluția treptat (până la 1×) și nu mai urcă înapoi peste nivelul la care a avut lag.
- Jocul nu se mai desenează în spatele ecranului de încărcare.
- Test (telefon simulat, procesor de 4× mai lent): **~53 ms → ~25 ms** de lucru pe cadru pe loc și **~54 ms → ~28 ms** în timpul zoom-ului (de la ~20 la ~36 cadre/s), înainte de reducerea rezoluției. Arată identic.

## Nou în v6
- **Mașinile desenate din cod sunt înapoi** (se rotesc lin, orice culoare). Sprite-urile mele de mașini și trailere au fost scoase.
- **Mașini noi pentru clienți**: Coupe, Convertible (decapotabilă, se vede interiorul), Minivan, Limuzină, Hot hatch, Taxi.
- **Flota orașului vine la întreținere**: Police car, Police SUV, Ambulanță, Fire chief. Au livrea (alb-negru cu stea, cruce roșie, dungi), girofar pe plafon și eticheta „🚨 CITY FLEET”. Primesc doar reparații, fără tuning sau vopsea. După ce plătesc la Sales Office **pleacă singure pe autostradă cu girofarul pornit** („🚨 BACK ON DUTY”), nu urcă pe trailer.
- **Trafic pe autostradă** cu toate tipurile, unele cu girofarul pornit și unele cu tuning.
- **17 tuninguri** (înainte 6). Noi: Chrome rims (jante care se învârt), Window tint, LED lights (faruri cu lumină în față), Sport exhaust (4 țevi + flăcări), Two-tone wrap, Carbon hood, Flame decals, Roof scoop, Air suspension (mașina „sare” când stă), Drift kit (fum la roți în viraje), Nitro kit (flacără albastră). Mașinile sport au mai multe tuninguri decât cele normale.
- **Mașina VIP din shop: „VIP Royal Hypercar”** – negru-violet cu sclipire care se mișcă pe caroserie, dungi și contur aurii, coroană pe bot, bandă LED care baleiază, cupolă de sticlă, motor V12 auriu la vedere, eleron cu capete aurii, 4 țevi aurii cu flăcări albastre, lumină aurie dedesubt, scântei aurii la mers și sclipiri. După service pleacă singură („👑 SEE YOU SOON!”). În shop poza e chiar mașina asta.
- **Camionul de transport nou** (desenat de mine): cap tractor mov-auriu „TORQUE EMPIRE” cu crom, rezervoare, țevi de eșapament cu fum, girofar pe plafon, faruri care luminează drumul. Remorcă cu șine galben-negre, cale, panou mov cu coroană. Când stă: rampe care coboară și girofare care clipesc. Capacitate: LV 1 = 2, LV 2 = 4, LV 3 = 6 (cu stâlpi de etaj), **LV 4 = tren rutier cu 2 remorci (8 mașini)**. Mașinile încărcate se văd pe remorcă.

## v5.1 – fluiditate
- Pozele se pregătesc o singură dată la încărcare (rămân gata în memoria plăcii video), iar cele prea mari sunt micșorate la cât e nevoie.
- Culoarea după respray nu se mai calculează la fiecare cadru: se face o copie colorată a mașinii o singură dată.
- Fum mai puțin: maximum ~140 de particule și deloc când harta e foarte micșorată. Neonul nu mai folosește gradient la fiecare cadru.

## Nou în v5
- **Arrivals** = poza mea. La LV 1 se văd doar 4 locuri (2 coloane din dreapta) cu liniile din poză; restul sunt asfalt fără linii, cu dungi și „🔒 EXPANSION · LV x”. Fiecare upgrade „lipește” încă 2 coloane din poză.
- **Sales Office** = poza mea. La LV 1 e doar primul birou; LV 2 și LV 3 adaugă birourile 2 și 3 (tăiate din poză), LV 4 adaugă biroul cu coroana (cu omul din poză). Pe locurile goale e parchet + „🔒 LV x”. Textul de pe banda mov e scris din cod (se schimbă nivelul).
- **Transport Yard** = poza mea (gard, camere, 12 locuri, „TRANSPORT ONLY”, panoul roșu „TRANSPORT YARD”). Mașinile parchează exact în locurile din poză.
- **Bariere animate**: brațul roșu-alb e tăiat din poza mea. Se ridică (se scurtează spre stâlp) când vine o mașină și coboară după ea, cu lumină portocalie care clipește cât se mișcă. La fel la bariera principală de la intrare.
- **Security** = poza mea (paznicul stă la birou, nu mai patrulează). Animații: „● REC” clipește, linie de scanare pe monitoare.
- **Mașini noi** din sprite sheet-urile mele (15 vehicule, 4 direcții × 4 cadre): Hatchback, Sedan (2 modele), Wagon, SUV (SUV portocaliu + Jeep roșu), Pickup, Van (dubă neagră + camion alb), Sports, Muscle, Supercar. Pe autostradă circulă și Poliția, rulota, tractarea, platforma și camionul.
  - Animație la mers: cadrele din sheet, ușoară legănare, **fum din eșapament** (alb), **fum negru** la mașinile cu motorul stricat, se înclină în viraje.
  - Peste sprite se desenează: praf, rugină, lovituri, grund (respray), avarii electrice (avarii care clipesc), scanare la inspecție, neon, dungi, număr de curse, eleron. După **respray** mașina își schimbă culoarea.
  - Pickup-ul de piese folosește sprite-ul Pickup.
- **Trailere noi** (pozele mele): LV 1 = platformă cu 2 mașini, LV 2 = trailer cu 3, LV 3 = trailer cu 4, LV 4 = același de 4 dar se întoarce mult mai repede (2 s în loc de 5). Are „LOADING x/y” cât încarcă și fum din țeavă când pleacă.
  - Atenție: în pozele trailerelor mașinile sunt deja pe el, așa că trailerul pare plin și când e gol. Mașinile vândute urcă pe rampa din spate și „intră” sub el.

## Nou în v4
- **Ecran de start nou** (imaginea mea „Torque Empire – Garage Tycoon”) cu bară de încărcare animată (se umple pe măsură ce se încarcă), apoi „TAP TO PLAY”.
- **Garaje noi** din imaginea mea (vedere de sus, bancul de scule, rafturi, elevator): boxele blocate au dungi galbene și „🔒 LV 2/3/4”, iar la upgrade boxa devine elevator ca prima. Numele garajului e pe banda de sus, în culoarea garajului.
- **Mecanici noi** din sprite sheet-ul meu (portocaliu): animații idle, mers, lucru (tabletă la Inspection), reparație (cheie), gândire (când așteaptă piese) și bucurie (când termină o lucrare), pe 4 direcții.
- **Magazin 🛒** (butonul din dreapta sus). Pachetele rămân **pentru totdeauna, în toate capitolele și stage-urile**:
  - **VIP Client Car – €3.99**: mașina neagră (sprite-ul meu) vine des la întreținere (cam la 40 s după ce pleacă cea dinainte). Fiecare lucrare pe ea plătește **×2.5**. Are eticheta „⭐ VIP CLIENT”.
  - **VIP Mechanic – €2.99**: mecanicul negru-auriu (sprite-ul meu de pe fundal verde) lucrează în **prima boxă din fiecare garaj**: **30% mai rapid** și **30% mai mulți bani** pe lucrările lui. Boxa lui e marcată cu auriu.
  - Acum e **versiune de test**: apăsarea pe preț deblochează fără plată. Plata reală (Google Play Billing) se face când jocul e publicat ca aplicație.

## Nou în v3
- **Mișcare mai fluidă**: inerție mai lină, zoom animat la butoane, se desenează doar ce e pe ecran, rezoluția se adaptează singură dacă telefonul e lent.
- **Totul redesenat**: mașini (9 tipuri: Hatchback, Sedan, Wagon, SUV, Pickup, Van, Sports, Muscle, Supercar) cu caroserie curbată, geamuri, oglinzi, faruri, avarii vizibile (rugină, lovituri, praf, cauciuc pe jantă, fum de la motor, avarii la electrică); clădiri cu interior detaliat (elevatoare, bancuri de lucru, cabină de vopsit, macara de motor, dyno la tuning, vestiar șoferi); oameni cu umeri, mâini, șapcă, vestă. La zoom apar mai multe detalii.
- **Garaje pe mai multe linii, ca un centru**: 4 rânduri (A–D) în jurul unui pătrat de străzi.
  - A: Inspection, Service · B: Body & Paint, Electronics · C: Engine Shop, Tuning · D: Sales Office, Export Parking.
- **Șoferi**: fiecare garaj are șoferii lui (nu mecanici). Șoferul duce mașina la următorul garaj, apoi se întoarce pe **scuter** pe o **bandă separată cu 2 sensuri** (verde, „DRIVERS LANE”).
  - Arrival Parking are valeți (cabina VALET de la barieră), Sales Office are șoferi care duc mașinile vândute în Transport Yard.
  - Upgrade la garaj = +1 boxă, +1 mecanic, +1 șofer și scuter mai rapid: Kick scooter → E-scooter → Moped → Sport scooter.
- **Reputație (REP 1–6)**: fiecare mașină vândută dă XP. La REP 1 doar reparații mici.
  - REP 1: Inspection, Service, Body & Paint – reparații mici
  - REP 2: Electronics · Wagon, SUV, Pickup, Van · suspensie, rugină, revopsire
  - REP 3: Engine Shop · Parts Office & Helipad · mașini sport · ambreiaj, curea distribuție, ECU
  - REP 4: Tuning · Muscle cars · turbo, kit street, ECU stage 1
  - REP 5: Supercars · schimb motor/cutie de viteze · widebody · kit sport
  - REP 6: V8 swap · Race build
- **Reparații complexe**: inspecția descoperă lista de lucrări (27 de lucrări diferite). Mașina trece prin garaje în ordinea Service → Engine → Electronics → Body & Paint → Tuning. Lucrările mari durează mult dar aduc mulți bani. Atingi o mașină ca să vezi lista ei de lucrări.
- **Piese pe urgență**: lucrările cu 📦 au nevoie de piese. Inspecția le comandă la **Parts Office**, **elicopterul** le aduce pe **helipad**, iar un angajat separat cu **pickup + remorcă** merge pe un **drum privat** să le ia (are bucle mari de întoarcere). Până vin piesele, mașina așteaptă în boxă („WAITING PARTS”).
- **Tuning vizibil pe mașini**: dungi, jante, mașină coborâtă, eleron, splitter, neon, decoruri, aripă mare de curse, priză de aer, aripi lățite (widebody), flăcări din eșapament.
- **Race Track – COMING SOON** (zona din stânga): pistă de teste și concursuri, pentru mai târziu.

## Fluxul mașinii
Șosea → bariera principală → Arrival Parking → (valet) Inspection → (șoferul garajului) Service / Engine / Electronics / Body & Paint / Tuning, după ce a găsit inspecția → Export Parking → vândută de Sales Office → (șofer birou) Transport Yard → trailer.

## Costuri (construire / Lv2 / Lv3 / Lv4) și reputația necesară
| Clădire | REP | Build/Lv1 | Lv2 | Lv3 | Lv4 |
|---|---|---|---|---|---|
| Arrival Parking | 1 | – | $250 | $900 | $3,000 |
| Inspection | 1 | – | $300 | $1,100 | $3,500 |
| Service | 1 | – | $300 | $1,100 | $3,500 |
| Body & Paint | 1 | $450 | $1,000 | $2,600 | $6,500 |
| Electronics | 2 | $900 | $1,700 | $3,900 | $8,500 |
| Engine Shop | 3 | $2,200 | $3,800 | $7,500 | $15,000 |
| Parts Office & Helipad | 3 | $1,600 | $3,000 | $6,500 | $13,000 |
| Tuning | 4 | $3,500 | $5,500 | $10,000 | $20,000 |
| Sales Office | 1 | – | $600 | $2,000 | $5,000 |
| Trailer (2 / 4 / 6 / 8 mașini) | 1 | – | $500 | $1,800 | $4,500 |
| Security | 1 | – | $400 | $1,500 | $4,000 |

- Bani de start: **$300**.
- Pachete (din magazin): VIP Client Car €3.99 (×2.5 pe lucrări, vine la ~40 s), VIP Mechanic €2.99 (prima boxă din fiecare garaj: +30% viteză, +30% bani). XP pentru REP 2–6: 10 / 35 / 90 / 180 / 320.

## Următorii pași (de discutat)
- Poze late (2:1) sau fiecare nivel separat pentru garaje, ca să nu mai fie turtite și să fie mai clare la zoom.
- Poză pentru pagina Gear Summon și pentru biletul Gear (acum: pagina e desenată din cod, biletul e al tău recolorat).
- Campania: poze pentru eroi/monștri/peisaje dacă vrei (acum totul e desenat din cod), seturi de gear, niveluri pentru eroi.
- Poze pentru paginile Guard Summon și Driver Summon și portretele eroilor (acum sunt desenate din cod).
- Eroii ??? (COMING SOON) – se vor face din Mythic +5.
- Poze care lipsesc ca totul să fie din pozele mele: Service, Export Parking, Helipad, cabina VALET, elicopter, oameni, Car Wash, Benzinărie, Gară, Fabrică.
- Sistemul pentru Collection Garage (mașini de epocă).
- Trailere **goale** (fără mașini pe ele) ca să apară mașinile pe rând când se încarcă.
- Race Track (concursuri) vine mai târziu.
- Beneficiile VIP le putem schimba după ce le testez.
