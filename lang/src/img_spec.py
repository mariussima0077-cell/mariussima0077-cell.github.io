# Pictures with English text → translated copies (tools/img_l10n.py).
# box = (x0,y0,x1,y1) in picture pixels: painted over and the new text centred in it.
# erase = other boxes to paint over (default = box); fill 'h' (rows, default) / 'v' (columns) / 'tel' (inpaint)
# st = gold / white / cream / silver / dark ; it = italic shear (e.g. .18) ; h = text height share of box
T = {
 'ARENA SHOP':  dict(fr='BOUTIQUE ARÈNE', es='TIENDA DE ARENA', pt='LOJA DA ARENA', ko='아레나 상점', ja='アリーナショップ'),
 'BAG':         dict(fr='SAC', es='BOLSA', pt='BOLSA', ko='가방', ja='バッグ'),
 'SHOP':        dict(fr='BOUTIQUE', es='TIENDA', pt='LOJA', ko='상점', ja='ショップ'),
 'MY CREW':     dict(fr='MON ÉQUIPAGE', es='MI CUADRILLA', pt='MINHA EQUIPE', ko='내 크루', ja='マイクルー'),
 'CREW SUMMON': dict(fr='INVOC. ÉQUIPAGE', es='INVOC. CUADRILLA', pt='INVOC. EQUIPE', ko='크루 소환', ja='クルー召喚'),
 'GEAR SUMMON': dict(fr='INVOC. ÉQUIPEMENT', es='INVOC. EQUIPO', pt='INVOC. EQUIPAMENTO', ko='장비 소환', ja='装備召喚'),
 'HERO SUMMON': dict(fr='INVOC. HÉROS', es='INVOC. HÉROES', pt='INVOC. HERÓIS', ko='영웅 소환', ja='ヒーロー召喚'),
 'CORE SHOP':   dict(fr='BOUTIQUE NOYAUX', es='TIENDA NÚCLEOS', pt='LOJA NÚCLEOS', ko='코어 상점', ja='コアショップ'),
 'CAMPAIGN':    dict(fr='CAMPAGNE', es='CAMPAÑA', pt='CAMPANHA', ko='캠페인', ja='キャンペーン'),
 'BATTLE':      dict(fr='COMBAT', es='COMBATE', pt='BATALHA', ko='전투', ja='バトル'),
 'HEROES':      dict(fr='HÉROS', es='HÉROES', pt='HERÓIS', ko='영웅', ja='ヒーロー'),
 'TEAM · SKILLS · GEAR': dict(fr='ÉQUIPE · COMPÉTENCES · ÉQUIPEMENT', es='EQUIPO · HABILIDADES · EQUIPAMIENTO', pt='EQUIPE · HABILIDADES · EQUIPAMENTO', ko='팀 · 스킬 · 장비', ja='チーム・スキル・装備'),
 'DAILY QUESTS': dict(fr='QUÊTES DU JOUR', es='MISIONES DIARIAS', pt='MISSÕES DIÁRIAS', ko='일일 퀘스트', ja='デイリークエスト'),
 'CHOOSE MECHANIC': dict(fr='CHOISIS UN MÉCANICIEN', es='ELIGE UN MECÁNICO', pt='ESCOLHA UM MECÂNICO', ko='정비공 선택', ja='メカニックを選択'),
 'TODAY':       dict(fr="AUJOURD'HUI", es='HOY', pt='HOJE', ko='오늘', ja='今日'),
 '5000 FREE SUMMONS': dict(fr='5000 INVOC. GRATUITES', es='5000 INVOC. GRATIS', pt='5000 INVOC. GRÁTIS', ko='무료 소환 5000회', ja='無料召喚5000回'),
 'DAILY CHECK-IN': dict(fr='CONNEXION DU JOUR', es='CHECK-IN DIARIO', pt='CHECK-IN DIÁRIO', ko='일일 출석', ja='デイリーログイン'),
 'DAMAGE RANKING': dict(fr='CLASSEMENT DES DÉGÂTS', es='RANKING DE DAÑO', pt='RANKING DE DANO', ko='피해 랭킹', ja='ダメージランキング'),
 'DAILY REWARDS': dict(fr='RÉCOMPENSES DU JOUR', es='RECOMPENSAS DIARIAS', pt='RECOMPENSAS DIÁRIAS', ko='일일 보상', ja='デイリー報酬'),
 'WEAK TO':     dict(fr='FAIBLE CONTRE', es='DÉBIL CONTRA', pt='FRACO CONTRA', ko='약점', ja='弱点'),
 'GEAR FORGE':  dict(fr="FORGE D'ÉQUIPEMENT", es='FORJA DE EQUIPO', pt='FORJA DE EQUIPAMENTO', ko='장비 대장간', ja='装備の鍛冶場'),
 'FORGE SUB':   dict(fr='Commun · Mythique · seulement en combat', es='Común · Mítico · solo en combates', pt='Comum · Mítico · só em batalhas', ko='일반 · 신화 · 전투 전용', ja='コモン・神話・バトル専用'),
 'DUNGEON PASS': dict(fr='PASS DONJON', es='PASE MAZMORRA', pt='PASSE MASMORRA', ko='던전 패스', ja='ダンジョンパス'),
}
SPEC = {
 'arena/as_title.webp': [dict(box=(240, 80, 765, 166), fill='plate', t='ARENA SHOP', st='gold')],
 'ui2/bag_h.webp':      [dict(box=(330, 194, 678, 316), fill='plate', t='BAG', st='gold')],
 'ui2/shop_h.webp':     [dict(box=(244, 164, 702, 306), fill='plate', t='SHOP', st='gold')],
 'ui3/crew_h.webp':     [dict(box=(262, 72, 648, 148), fill='plate', t='MY CREW', st='silver')],
 'ui3/csum_h.webp':     [dict(box=(230, 60, 668, 126), fill='plate', t='CREW SUMMON', st='gold')],
 'ui3/gsum_h.webp':     [dict(box=(235, 62, 662, 124), fill='plate', t='GEAR SUMMON', st='cream')],
 'ui4/hsum_h.webp':     [dict(box=(318, 52, 790, 114), fill='plate', t='HERO SUMMON', st='cream')],
 'ui9/mc_title.webp':   [dict(box=(155, 110, 752, 226), fill='plate', t='CORE SHOP', st='gold', it=.16)],
 'ui/t_heroes.webp':    [dict(box=(26, 40, 440, 154), erase=[(40, 56, 426, 142)], t='HEROES', fill='tel', st='gold', it=.12, h=.92, ol=.17),
                         dict(box=(130, 146, 346, 167), t='TEAM · SKILLS · GEAR', fill='plate', st='white', h=.7, ol=.08)],
 'ui3/camp_h.webp':     [dict(box=(268, 132, 642, 204), t='CAMPAIGN', fill='plate')],
 'ui7/hub_bg.webp':     [dict(box=(285, 95, 745, 190), t='BATTLE', fill='plate', it=.14)],
 'dq.webp':             [dict(box=(250, 308, 686, 382), t='DAILY QUESTS', fill='plate', it=.12)],
 'ui3/ch_f.webp':       [dict(box=(232, 140, 802, 218), t='CHOOSE MECHANIC', fill='plate')],
 'ci/c5_today.webp':    [dict(box=(290, 8, 480, 60), t='TODAY', fill='plate', st='dark', pct=(55, 85))],
 'ci/c5_hero.webp':     [dict(box=(72, 140, 762, 228), t='5000 FREE SUMMONS', fill='plate', it=.06),
                         dict(box=(296, 230, 560, 262), t='DAILY CHECK-IN', fill='plate', st='white', ol=.08)],
 'wb/t_rank.webp':      [dict(box=(130, 30, 680, 98), t='DAMAGE RANKING', fill='plate', it=.14)],
 'wb/t_daily.webp':     [dict(box=(130, 28, 680, 96), t='DAILY REWARDS', fill='plate', it=.14)],
 'wb/t_weak.webp':      [dict(box=(95, 26, 325, 80), t='WEAK TO', fill='plate', it=.12)],
 'ui/forge.webp':       [dict(box=(195, 30, 650, 100), t='GEAR FORGE', fill='plate', st='silver', it=.14),
                         dict(box=(128, 116, 700, 164), tbox=(140, 122, 688, 158), t='FORGE SUB', fill='plate', st='white', ol=.06)],
 'dg/pass_w.webp':      [dict(box=(180, 110, 730, 186), t='DUNGEON PASS', fill='plate', it=.14)],
}

# --- big panels (team / collection / summon backgrounds) ---
RAR = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC', 'ASCENDED']
T.update({
 'COMMON': dict(fr='COMMUN', es='COMÚN', pt='COMUM', ko='일반', ja='コモン'),
 'UNCOMMON': dict(fr='PEU COMMUN', es='POCO COMÚN', pt='INCOMUM', ko='고급', ja='アンコモン'),
 'RARE': dict(fr='RARE', es='RARO', pt='RARO', ko='희귀', ja='レア'),
 'EPIC': dict(fr='ÉPIQUE', es='ÉPICO', pt='ÉPICO', ko='에픽', ja='エピック'),
 'LEGENDARY': dict(fr='LÉGENDAIRE', es='LEGENDARIO', pt='LENDÁRIO', ko='전설', ja='伝説'),
 'MYTHIC': dict(fr='MYTHIQUE', es='MÍTICO', pt='MÍTICO', ko='신화', ja='神話'),
 'ASCENDED': dict(fr='TRANSCENDÉ', es='ASCENDIDO', pt='ASCENDIDO', ko='초월', ja='超越'),
 'Mechanics': dict(fr='Mécaniciens', es='Mecánicos', pt='Mecânicos', ko='정비공', ja='メカニック'),
 'Guards': dict(fr='Gardes', es='Guardias', pt='Guardas', ko='경비원', ja='警備員'),
 'Drivers': dict(fr='Chauffeurs', es='Conductores', pt='Motoristas', ko='운전사', ja='ドライバー'),
 'Fusion': dict(fr='Fusion', es='Fusión', pt='Fusão', ko='합성', ja='合成'),
 'TEAM & COLLECTION': dict(fr='ÉQUIPE & COLLECTION', es='EQUIPO Y COLECCIÓN', pt='EQUIPE E COLEÇÃO', ko='팀 & 도감', ja='チーム＆図鑑'),
 'COLLECTION BONUS': dict(fr='BONUS DE COLLECTION · Complète une couleur', es='BONO DE COLECCIÓN · Completa un color', pt='BÔNUS DE COLEÇÃO · Complete uma cor', ko='도감 보너스 · 한 색상을 완성', ja='図鑑ボーナス・1色をコンプリート'),
 'BATTLE BONUS': dict(fr='BONUS DE COMBAT · COMPLÈTE UNE COULEUR', es='BONO DE COMBATE · COMPLETA UN COLOR', pt='BÔNUS DE BATALHA · COMPLETE UMA COR', ko='전투 보너스 · 한 색상을 완성', ja='バトルボーナス・1色をコンプリート'),
 'HERO COLLECTION': dict(fr='COLLECTION DE HÉROS', es='COLECCIÓN DE HÉROES', pt='COLEÇÃO DE HERÓIS', ko='영웅 도감', ja='ヒーロー図鑑'),
 'COMING SOON': dict(fr='??? · BIENTÔT', es='??? · PRÓXIMAMENTE', pt='??? · EM BREVE', ko='??? · 곧 공개', ja='???・近日公開'),
 'SOON': dict(fr='BIENTÔT', es='PRONTO', pt='EM BREVE', ko='곧', ja='近日'),
 'MYTHIC ONLY': dict(fr='MYTHIQUE · seulement par invocation', es='MÍTICO · solo por invocación', pt='MÍTICO · só por invocação', ko='신화 · 소환으로만 획득', ja='神話・召喚のみ'),
 'RANDOM1': dict(fr='1 HÉROS ALÉATOIRE', es='1 HÉROE ALEATORIO', pt='1 HERÓI ALEATÓRIO', ko='랜덤 1명', ja='ランダム1体'),
})
for k in RAR[:6]:
    T[k.title()] = {l: (v if l in ('ko', 'ja') else v[0] + v[1:].lower()) for l, v in T[k].items()}
TABS = [dict(box=b, t=k, fill='plate', st='white', h=.62, ol=.1, it=.06) for b, k in
        [((112, 192, 256, 228), 'Mechanics'), ((362, 192, 478, 228), 'Guards'), ((618, 192, 730, 228), 'Drivers')]]
SPEC.update({
 'ui4/coll.webp': [dict(box=(215, 48, 800, 132), t='HERO COLLECTION', fill='plate', st='gold', h=.7),
                   dict(box=(170, 418, 858, 472), t='BATTLE BONUS', fill='plate', st='gold', h=.6)] +
                  [dict(box=(146, c - 34, 372, c + 34), t=k, fill='plate', pct=(25, 55), st='r%d' % i, h=.62, ol=.12, al='l')
                   for i, (c, k) in enumerate(zip((610, 740, 870, 994, 1120, 1244), RAR))],
 'team.webp': [dict(box=(305, 86, 795, 152), t='TEAM & COLLECTION', fill='plate', st='gold', it=.12, h=.66)] + TABS +
              [dict(box=(212, 506, 812, 554), t='COLLECTION BONUS', fill='plate', st='gold', it=.08, h=.62)] +
              [dict(box=(126, c - 20, 330, c + 20), t=k.title(), fill='plate', pct=(25, 55), st='white', it=.08, h=.6, ol=.1, al='l')
               for c, k in zip((596, 658, 720, 782, 842, 906), RAR)] +
              [dict(box=(344, 1100, 690, 1140), t='COMING SOON', fill='plate', st='white', h=.64),
               dict(box=(322, 1308, 404, 1340), t='SOON', fill='plate', st='white', h=.6),
               dict(box=(626, 1308, 710, 1340), t='SOON', fill='plate', st='white', h=.6),
               dict(box=(348, 1450, 770, 1490), t='MYTHIC ONLY', fill='plate', st='gold', it=.08, h=.6)],
 'fusion.webp': [dict(box=(305, 86, 795, 152), t='TEAM & COLLECTION', fill='plate', st='gold', it=.12, h=.66)] + TABS +
                [dict(box=(866, 192, 976, 228), t='Fusion', fill='plate', st='gold', h=.62, ol=.1, it=.06)] +
                [dict(box=(x0, 540, x0 + 142, 568), t='LEGENDARY', fill='plate', st='cream', h=.6, ol=.1) for x0 in (155, 445, 729)] +
                [dict(box=(616, 762, 786, 792), t='RANDOM1', fill='plate', st='white', h=.62, ol=.1),
                 dict(box=(612, 794, 790, 842), t='MYTHIC', fill='plate', st='gold', it=.1, h=.72)],
 'ui4/sum_bg.webp': [dict(box=(c - 74, 850, c + 74, 884), t=k, fill='plate', st='r%d' % i, h=.62, ol=.12) for i, (c, k) in enumerate(zip((124, 282, 438, 590, 744, 900), RAR))],
 'ui5/gsum_bg.webp': [dict(box=(c - 72, 834, c + 72, 868), t=k, fill='plate', st='r%d' % i, h=.62, ol=.12) for i, (c, k) in enumerate(zip((138, 296, 450, 598, 742, 896), RAR))],
 'ui5/gsum_bg2.webp': [dict(box=(c - 62, 846, c + 62, 872), t=k, fill='plate', st='r%d' % i, h=.62, ol=.12) for i, (c, k) in enumerate(zip((116, 250, 382, 514, 646, 776, 910), RAR))],
})
