# TORQUE EMPIRE – Toate resursele: de unde vin și pe ce se cheltuie

## NOU v16-99 (20 nov 2026)
| Resursă | De unde | Pe ce |
|---|---|---|
| **Essence** `G.ess` (unitate `ESS_U` = costul unui nivel la nivelul așteptat la etapa ta) | Idle 0,5/oră · campanie prima trecere 0,5 (mini 1, boss 3), replay 0,1 · Torque Tower 0,8 (×3 la al 10-lea) · Class Towers 0,5 · toate Dungeons 0,8–1,8 · duplicat erou Common/Uncommon/Rare la maxim 1/2/5 · eventul Essence Rush (praguri) | LEVEL UP (Lv 1-300) + ASCENSION la fiecare 20 niveluri |
| **Gear Parts** `G.gp` (unitate `GP_U` = vechii bani de campanie ÷10) | Salvage · campanie (1, mini 1,5, boss 3; replay 0,25) · Idle 0,6/oră · Tower 1 · Class Towers 0,6 · Dungeons (Scrap Mine 3, Forge 1, celelalte 0,5) · echipament vândut când geanta e plină | upgrade echipament (vechiul cost ÷10) |
| **Bani** | ca înainte, campania ×0,71 (`CP_MON` .25) | DOAR garaj (clădiri, upgrade-uri, Classic Collection) |
| **Diamante** – surse noi | duplicat Epic 30 / Legendary 150 / Mythic 1000 la maxim · Lucky Wheel · praguri + clasamente EVENTS | ca înainte (+ se numără la Diamond Spree) |
| **Mythic** | DOAR din summon 0,08% (Fusion închis) | stele +1…+20 din duplicate |

*(verificat în cod la 17 nov 2026, v16-63. Claude actualizează fișierul când apare o sursă nouă.)*

## 1. Bani (Cash / money – `G.money`)
| De unde | Cât |
|---|---|
| Garajul: vânzarea mașinilor reparate, camionul de export, fabrica, spălătoria, benzinăria | principala sursă (×0.8 `ECO`) |
| Idle Rewards | venitul pe oră × ore (4h + 30 min / nivel VIP) |
| Campanie – fiecare etapă câștigată | `REWARD(etapă).money` |
| Torque Tower / Class Towers – prima trecere a etajului | bani + restul |
| **DUNGEONS – CASH VAULT** (nou) | ×5 față de campanie, la fiecare victorie / SWEEP |
| Scrap Mine / Gear Forge / Nitro Lab | puțini bani pe lângă recompensa lor |
| Salvage (piese de echipament topite) | după grad și nivel |
| **Se cheltuie pe**: clădiri și upgrade-uri, upgrade la echipament, mașinile din Classic Collection | |

## 2. Diamante 💎 (`G.dm`) – DOAR câștigate jucând, nu se vând niciodată
| De unde | Cât |
|---|---|
| Daily Quests – cele 4 cadouri | 20 + 30 + 40 + 60 = **150 / zi** |
| Campanie – prima trecere | 10 / mini-boss 30 / boss 100 |
| Torque Tower | 5 pe etaj · 100 la fiecare al 10-lea · +400 la fiecare al 50-lea |
| Class Towers | 3 pe etaj · 50 la fiecare al 10-lea · +200 la al 50-lea |
| World Boss – praguri zilnice | 20+20+30+40+50+80 = **240 / zi** |
| World Boss – clasament săptămânal (mail, top 100) | 150 … 1500 |
| Arenă | 20 / victorie, 5 / înfrângere · mail zilnic 30–220 după ligă |
| Torque Cup (weekend, mail) | 80 … 2000 |
| Nivel nou de Reputație | 100 (Rep 10/15/20/25/30: 200) |
| Nivel nou VIP | 100 |
| Classic Collection (mașini parcate, idle) | 2–20 pe oră pe mașină |
| Mail (cadouri de la noi) | ex. „Diamonds are here!” 1000 |
| **Se cheltuie pe**: summon (100 = 1 summon, mereu cu întrebare), schimbarea numelui (300) | |

## 3. Bilete
| | Recruit 🎟 (roșu, eroi) `G.h.tk` | Crew (mov, șoferi + paznici) `G.h.ct` | Gear (albastru, echipament) `G.gear.tk` |
|---|---|---|---|
| Check-in „5000 FREE SUMMONS” | 10 / zi | 10 / zi | 10 / zi (167 de zile) |
| Daily Quests | 1 pe fiecare misiune + 8 din cadouri | 8 din cadouri | – |
| Idle Rewards | 1 la 2 ore | 1 la 4 ore | doar din mașinile Classic |
| Campanie (prima trecere) | 1 / mini 3 / boss 5 | mini 1 / boss 3 | 1 / mini 3 / boss 5 |
| Torque Tower | 2 la fiecare al 5-lea etaj | 1 la fiecare al 10-lea | 3 la fiecare al 10-lea |
| Class Towers | – | – | 1 la fiecare al 10-lea |
| World Boss (zilnic) | 4 | 1 | 3 |
| World Boss (săptămânal) / Cup / Arenă | da (mail) | – | da (WB, Cup) |
| Reputație / VIP nivel nou | 5 (15) / 5 | 3 (8) / 3 | – |
| Hoț prins | – | 1 | – |
| Classic Collection | fracțiuni pe oră | fracțiuni pe oră | fracțiuni pe oră |

## 4. Puncte VIP (`G.vip`)
- DOAR din Daily Quests: ~10–20 pe misiune + 75 din cadouri ≈ **150 / zi** → VIP 20 (28.000) în ~6 luni.
- VIP Pass (bani) NU dă puncte, doar ×1.5 la avantaje.

## 5. Reputație (XP garaj, `G.xp`)
- Din fiecare mașină reparată/vândută și din fabrică. Nivelurile deblochează clădiri și dau bilete + diamante.

## 6. EROI și sinteza MYTHIC (Fusion Lab)
- **Rețeta Mythic**: 3 eroi **Legendary diferiți**, fiecare la **+5** (adică 6 exemplare din același erou) → 1 Mythic la întâmplare din aceeași categorie. Cei 3 se consumă cu stelele lor.
- **Legendary** vine DOAR din summon: 2% (Recruit/Crew) + garantat la fiecare **500** de summonuri.
- **Stele (+1)** vin DOAR din duplicate (același erou din summon). Nu există altă resursă pentru stele.
- **Summon** = bilete (secțiunea 3) sau diamante (100 = 1).
- Estimare jucător activ gratuit: ~40–45 summonuri / zi (10 check-in + ~13 quests + ~8 idle + 4 World Boss + arenă + ~5 din diamante) → primul Mythic în aproximativ **5–6 săptămâni**.
- Excepție: pre-înregistrarea promite The Torque King (Mythic) la 200K – de dat prin Mail la lansare (lista completă a pragurilor: `NEXT_STEPS.md`, 20 nov, site v2).

## 7. Echipament (gear, doar pentru bătălii)
| De unde | Ce |
|---|---|
| Gear Summon (bilete albastre / diamante) | grad la întâmplare (Mythic 0.5%, Legendary garantat la 500) |
| Campanie – drop | prima trecere 1 (boss 2), după aceea 40% șansă; gradele cresc cu capitolul |
| Class Towers | piesă de SET la fiecare al 5-lea etaj (Rare → Mythic) |
| **DUNGEONS – SCRAP MINE** (nou) | 1 piesă la fiecare victorie, grad fix după etaj (Uncommon → Legendary), slotul pe rând |
| **DUNGEONS – GEAR FORGE** (nou) | 1 piesă de SET la fiecare victorie (Rare → Legendary), clasa și slotul pe rând |
| Upgrade | doar cu bani · Salvage → bani |

## 8. NITRO BOOST (nou, din NITRO LAB)
- +10% / +15% / +20% HP și atac (etajele 1-10 / 11-20 / 21-30), 3 ore pe victorie, maximum 12 ore strânse.
- Merge în Campanie, Torque Tower, Class Towers. NU în Arenă, Cup, World Boss, Dungeons.

## 9. Ce NU se poate cumpăra cu bani reali (regula Play)
- Diamante, bilete, summon, premii de Arenă / Cup / World Boss. DUNGEON PASS dă doar chei în plus + SWEEP, iar dungeon-urile au recompense fixe fără diamante/bilete.
