#!/usr/bin/env python3
"""Torque Empire – builds lang/fr.js, lang/es.js, lang/pt.js from lang/src/ (Marius 26 nov 2026: languages).
src.tsv = every English text of the game (id<TAB>text, # = number) – made by tools/lang_extract.js
t01..t10.tsv = id<TAB>FR<TAB>ES<TAB>PT · extra.tsv = EN<TAB>ES<TAB>PT · add.tsv = EN<TAB>FR<TAB>ES<TAB>PT (wins, short forms)
A missing line = the text stays English (hero / monster / skill / place names on purpose).
Usage: python3 tools/lang_build.py"""
import json,glob,re,os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','lang','src'))
src={}
for ln in open('src.tsv'):
    i,k=ln.rstrip('\n').split('\t',1); src[i]=k
L={'fr':{},'es':{},'pt':{},'ko':{},'ja':{}}
bad=0
for f in sorted(glob.glob('t*.tsv')):
    for ln in open(f):
        ln=ln.rstrip('\n')
        if not ln: continue
        p=ln.split('\t')
        if len(p)!=4: print('COLS',f,p[:2]); bad+=1; continue
        i,fr,es,pt=p
        k=src.get(i)
        if k is None: print('NOID',f,i); continue
        for lg,v in (('fr',fr),('es',es),('pt',pt)):
            if v.count('#')!=k.count('#'): print('HASH',lg,i,k[:50],'|',v[:50]); bad+=1
            L[lg][k]=v
for f in sorted(glob.glob('j*.tsv')):
    for ln in open(f):
        p=ln.rstrip('\n').split('\t')
        if len(p)!=3: continue
        k=src.get(p[0])
        if k is None: print('NOID',f,p[0]); continue
        for lg,v in (('ko',p[1]),('ja',p[2])):
            if v.count('#')!=k.count('#'): print('HASH',lg,p[0],k[:40],'|',v[:40]); bad+=1
            L[lg][k]=v
for ln in open('extra_kj.tsv'):
    p=ln.rstrip('\n').split('\t')
    if len(p)==3:
        if p[0].count('#')!=p[1].count('#') or p[0].count('#')!=p[2].count('#'): print('KJHASH',p[0])
        L['ko'][p[0]]=p[1];L['ja'][p[0]]=p[2]
# old crawl FR dict fills gaps
old=json.load(open('old_fr.json'))
for k,v in old.items():
    L['fr'].setdefault(k,v)
for lg in L: print(lg,len(L[lg]))
print('bad',bad)
# extras for es/pt + remove names from fr
for ln in open('extra.tsv'):
    p=ln.rstrip('\n').split('\t')
    if len(p)==3:
        L['es'][p[0]]=p[1];L['pt'][p[0]]=p[2]
        if p[0].count('#')!=p[1].count('#') or p[0].count('#')!=p[2].count('#'): print('XHASH',p[0])
for ln in open('add.tsv'):
    p=ln.rstrip('\n').split('\t')
    if len(p)==4:
        L['fr'][p[0]]=p[1];L['es'][p[0]]=p[2];L['pt'][p[0]]=p[3]
KEEP=re.compile(r"^(Ignis|Goliath|Nova|Vega|Chroma|Doc Volta|Shade|Anvil|Rivet|Kael|Spark|Mira|Lena), the |^The Torque King$|^Doom |^Rust Gate$|^Viktor the Surgeon$")
for lg in L:
    for k in [k for k in L[lg] if KEEP.search(k)]: del L[lg][k]
R='../'
for lg,D in L.items():
    open(R+lg+'.js','w').write('// Torque Empire – '+lg.upper()+' dictionary (English → '+lg+'), # = any number. Generated; edit lang source files.\nTE_LANG_LOAD('+json.dumps(D,ensure_ascii=False,indent=0,sort_keys=True)+');\n')
    print(lg,len(D))
