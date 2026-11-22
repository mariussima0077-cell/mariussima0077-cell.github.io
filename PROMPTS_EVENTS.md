# TORQUE EMPIRE – Prompturi ChatGPT: pagina EVENTS (20 nov 2026, după v16-101)

Ce e încă desenat din cod pe pagina EVENTS → 5 poze. Butoanele CLAIM și barele de progres folosesc deja pozele tale vechi (`img/ui8/btn_*`, `bar_empty`), deci NU trebuie refăcute.

**Mărimi verificate (regula lui Marius: Claude verifică mereu dimensiunea):** ChatGPT face doar 1024x1024, 1536x1024 sau 1024x1536 → fiecare prompt cere una din ele. Pe telefon pagina are ~340 px lățime (×3 pixeli pe ecranele bune ≈ 1020 px) → orice element lat de ~1400 px în poză e destul de clar. Ramele se taie „9-slice” (colțurile rămân neatinse, mijlocul se întinde), de aceea ornamentele trebuie să fie DOAR la colțuri / capete și mijlocul marginilor simplu.

Pentru toate: ATAȘEAZĂ poza paginii (`img/ui9/ev_bg.webp`, Claude o trimite direct în chat ca .jpg) ca să ia aceleași culori — fond verde = Claude decupează.

## 1 · Rama rândului MILESTONE (3 stări într-o poză) → `img/ui10/ev_row_*.webp`
În joc: rând 340×78 px (raport ~4,4:1). În poză: 3 rame de ~1440×280 una sub alta.
```
Create 3 EMPTY horizontal reward-row frames for the mobile game TORQUE EMPIRE, stacked vertically in ONE image 1536x1024, each frame about 1440 px wide and 280 px tall, centered, with at least 40 px of pure flat chroma-green background (#00FF00) between the frames and around them, nothing touching the image edges, no shadow on the green.
Each frame: a dark navy-purple steel panel with rounded corners, a thick ornate gold rim with rivets; on the LEFT end a separate small dark square box (about 20% of the frame width) for a number; the rest of the inside is EMPTY and plain. Decorations (gears, bolts, corner pieces) ONLY in the 4 corners and on the left and right ends – the long middle part of the top and bottom rim must be plain and the same all along (it will be stretched).
TOP frame = LOCKED: dark purple steel, dim gold rim. MIDDLE frame = READY: same frame but the rim glows bright gold with warm light and small sparkles. BOTTOM frame = CLAIMED: same frame, desaturated grey-blue steel, dull rim, a small green check-mark badge on the right end.
STYLE: premium mobile game UI (AFK Arena / Clash Royale quality), Torque Empire garage-mechanic theme, glossy cartoon-realistic painted 3D look, dark navy and charcoal steel, thick gold frames with rivets and bolts, warm orange, violet and electric-blue lights, high contrast, crisp clean edges, no text, no letters, no numbers, no watermark, no real brands or logos. Output 1536x1024.
```

## 2 · Plăcuța „YOUR ESSENCE / YOUR SUMMONS” (scorul) → `img/ui10/ev_score.webp`
În joc: 340×70 px (raport ~4,9:1). În poză: o plăcuță ~1400×290.
```
Create ONE EMPTY wide score plate for the mobile game TORQUE EMPIRE, about 1400 px wide and 290 px tall, centered in an image 1536x1024, on a pure flat chroma-green background (#00FF00), nothing touching the edges, no shadow on the green. A horizontal golden plaque with a dark glossy violet glass center (EMPTY – the game writes the score there), small gears and bolts on the left and right ends only, a soft violet glow behind the glass. The long top and bottom rim in the middle must be plain (it will be stretched).
STYLE: premium mobile game UI (AFK Arena / Clash Royale quality), Torque Empire garage-mechanic theme, glossy cartoon-realistic painted 3D look, dark navy and charcoal steel, thick gold frames with rivets and bolts, warm orange, violet and electric-blue lights, high contrast, crisp clean edges, no text, no letters, no numbers, no watermark, no real brands or logos. Output 1536x1024.
```

## 3 · Butonul TOP 100 RANKING → `img/ui10/ev_rank_btn.webp`
În joc: 340×52 px (raport ~6,5:1). În poză: buton ~1440×220.
```
Create ONE EMPTY wide button for the mobile game TORQUE EMPIRE, about 1440 px wide and 220 px tall, centered in an image 1536x1024, on a pure flat chroma-green background (#00FF00), nothing touching the edges, no shadow on the green. Glossy royal-blue button with a thick gold rim and rivets, a shiny golden trophy cup on the LEFT end, small laurel leaves on the right end; the middle is EMPTY smooth blue glass (the game writes the text). The long top and bottom rim in the middle must be plain (it will be stretched).
STYLE: premium mobile game UI (AFK Arena / Clash Royale quality), Torque Empire garage-mechanic theme, glossy cartoon-realistic painted 3D look, thick gold metal, electric-blue glass, high contrast, crisp clean edges, no text, no letters, no numbers, no watermark. Output 1536x1024.
```

## 4 · Medaliile clasamentului (5) → `img/ui10/rk_1.webp` … `rk_5.webp`
În joc: ~30×30 px lângă fiecare rând de premii (#1, #2-3, #4-10, #11-50, #51-100). În poză: 3 sus + 2 jos, fiecare ~380×380.
```
Create 5 rank medal icons for the mobile game TORQUE EMPIRE in ONE image 1536x1024: 3 medals in the top row and 2 medals centered in the bottom row, each about 380x380 px, with at least 60 px of pure flat chroma-green background (#00FF00) between them and around them, nothing touching the edges, no shadow on the green.
Top row from left: (1) a big GOLD medal with a crown and red ribbon, (2) a SILVER medal with a blue ribbon, (3) a BRONZE medal with a green ribbon. Bottom row: (4) a polished STEEL gear-shaped medal with a purple ribbon, (5) a small dark IRON gear badge with a grey ribbon. The center of each medal is EMPTY and smooth (the game writes the rank number).
STYLE: premium mobile game UI icon (AFK Arena / Clash Royale quality), Torque Empire garage-mechanic theme, glossy cartoon-realistic painted 3D look, thick dark outline, strong highlights, high contrast, crisp clean edges, readable at 30 px, no text, no letters, no numbers, no watermark. Output 1536x1024.
```

## 5 · Panglica de titlu (MILESTONE REWARDS / RANKING PRIZES / TODAY'S QUESTS) → `img/ui10/ev_title.webp`
În joc: 340×34 px (raport ~10:1). În poză: panglică ~1460×150.
```
Create ONE EMPTY long section-title ribbon for the mobile game TORQUE EMPIRE, about 1460 px wide and 150 px tall, centered in an image 1536x1024, on a pure flat chroma-green background (#00FF00), nothing touching the edges, no shadow on the green. A dark violet banner with a thin gold edge, a small golden gear ornament at each end and slightly pointed ends; the middle is EMPTY and plain (the game writes the title) and must look the same all along (it will be stretched).
STYLE: premium mobile game UI (AFK Arena / Clash Royale quality), Torque Empire garage-mechanic theme, glossy cartoon-realistic painted 3D look, dark violet and gold, high contrast, crisp clean edges, no text, no letters, no numbers, no watermark. Output 1536x1024.
```

Când vin pozele: originale în `img/sheets/ui10/`, Claude decupează în `img/ui10/` și le pune în `events.js` (rânduri 9-slice: `ev_row_lock` / `ev_row_ready` / `ev_row_done`; rândurile cu premiile din clasament folosesc rama LOCKED + medalia).

## KEY ROULETTE (21 nov 2026) – 2 poze opționale
1. **Banner** `img/ui9/evb_key.webp` – în joc 900×360 (2,5:1, lățimea paginii pe 360 px ×2,5). ChatGPT 1536x1024, apoi decupat la 2,5:1. Referință: bannerul LUCKY WHEEL (aceeași ramă, aceeași poziție a titlului: jumătatea stângă rămâne liberă pentru text).
2. **Disc** `img/ui9/kwheel_disc.webp` – în joc 441×441 (discul se învârte în rama roții). ChatGPT 1024x1024, fond verde, decupat rotund. 8 felii goale, FĂRĂ text/iconițe (cheile și cifrele le pune jocul). Referință: discul LUCKY WHEEL.

## UI11 (21 nov 2026) – Marius: „nu-mi place scrisul și ramele din cod” (Events + HEROES + My Crew)
Promptuile 1-5 de mai sus (EVENTS) NU au fost încă făcute (`img/ui10/` nu există) → rămân valabile. În plus:

### 6 · Tab-urile EVENTS (activ / inactiv) → `img/ui10/ev_tab_on.webp`, `ev_tab_off.webp`
În joc: 165×46 px (3,6:1). În poză: 2 tab-uri ~1300×340 una sub alta, ChatGPT 1536x1024. Referință: `ev_bg`.

### 7 · Butoanele HERO SUMMON / GEAR SUMMON / BAG → `img/ui10/hs_btn_gold.webp`, `hs_btn_blue.webp`, `hs_btn_bag.webp`
În joc: ~108×58 px fiecare (1,9:1). În poză: 3 butoane ~460×250 unul lângă altul, ChatGPT 1536x1024. Referință: `heroes_h`. Iconița biletului și a sacului le pune jocul (regula „o singură iconiță”).

### 8 · Rama BATTLE TEAM + butonul HERO COLLECTION → `img/ui10/bt_panel.webp`, `hc_btn.webp`
În joc: rama 340×155 px (2,2:1, 9-slice), butonul 340×52 (6,5:1). În poză: rama ~1440×620 sus, butonul ~1440×220 jos, ChatGPT 1536x1024. Referință: `heroes_h`.

Fără poze noi (se folosesc pozele lui deja în joc `img/ui8/btn_*`): POWER/GRADE, AUTO BEST mic, rândul My Crew (AUTO BEST / Collection / Summon).
Scrisul: font de joc gros (Lilita One, gratuit OFL, pus local) pentru titluri/butoane/cifre – Claude arată înainte/după.

## DUNGEON RUSH (22 nov 2026, v16-161) – 1 poză
**Banner** `img/ui9/evb_dgr.webp` – în joc 900×360 (2,5:1, lățimea paginii pe 360 px ×2,5). ChatGPT **1536x1024**, apoi Claude decupează o bandă 1536×614 (2,5:1) din mijloc. Referință atașată: bannerul KEY ROULETTE (`evb_key`). Până vine poza, jocul folosește o copie a bannerului KEY ROULETTE.
