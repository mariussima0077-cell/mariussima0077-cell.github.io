"""mon_rowk.py – v16-345 (Marius 26 nov: "monsters sometimes become big, sometimes small when they attack").
The old 6-row monster atlases (idle·walk·attack·skill·hurt·death) were cut with the IDLE / HURT / DEATH rows ~15-25% bigger
than WALK / ATTACK / SKILL → the monster grew and shrank every time it changed animation.
This measures the body size per row (median of sqrt(bbox w×h) over the frames) and prints MROWK for battle.js:
rows 0 / 4 / 5 are scaled down to the walk·attack·skill size (only when >6% bigger), rows 1-3 stay as they are.
usage: python3 tools/mon_rowk.py   (reads MSPR from battle.js)"""
import json, os, re, subprocess, numpy as np
from PIL import Image
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
js = "const s=require('fs').readFileSync('battle.js','utf8');const m=s.match(/const MSPR=(\\{.*?\\});/s);let o;eval('o='+m[1]);const r={};for(const k in o)r[k]={w:o[k].w,h:o[k].h,L:!!o[k].L};console.log(JSON.stringify(r))"
M = json.loads(subprocess.check_output(['node', '-e', js]))
out = {}
for k, d in M.items():
    p = 'img/mon/%s.webp' % k
    if d['L'] or not os.path.exists(p): continue
    a = np.asarray(Image.open(p).convert('RGBA'))[..., 3]; W, H = d['w'], d['h']
    rows, cols = a.shape[0] // H, a.shape[1] // W
    if rows < 6: continue
    sz = []
    for r in range(rows):
        v = []
        for c in range(cols):
            m = a[r*H:(r+1)*H, c*W:(c+1)*W] > 100; ys = np.nonzero(m.any(1))[0]; xs = np.nonzero(m.any(0))[0]
            if len(ys) > 5: v.append(np.sqrt((ys.max()-ys.min()) * (xs.max()-xs.min())))
        sz.append(float(np.median(v)) if v else 0)
    base = float(np.median(sz[1:4]))
    f = [1.0] * rows
    for r in (0, 4, 5):
        if sz[r] > base * 1.06: f[r] = round(max(.75, base / sz[r]), 3)
    if any(x != 1 for x in f): out[k] = f
print('const MROWK=' + json.dumps(out, separators=(',', ':')) + ';')
