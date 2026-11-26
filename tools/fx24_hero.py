"""fx24_hero.py – v16-348 (Marius 26 nov): 24-frame ultimate EFFECT for a hero whose ultimate is drawn ON THE TARGET (Shade's EXHAUST PHANTOM),
3 ChatGPT sheets (frames 1-8 / 9-16 / 17-24, 1536x1024, 4x2 cells of 384x512, chroma green): img/sheets/<dir>/<id>_fx24a/b/c.webp.
Same cleaning + scale as the 8-frame fx of tools/v8_hero.py (REF['fx']); each sheet anchored on ITS OWN ground line (the sheets are drawn
with slightly different baselines), x = cell centre. One row of 24 cells → img/hero/fx24_<id>.webp. Prints the meta for FX24 in battle.js.
usage: python3 tools/fx24_hero.py m5_8"""
import sys, os, json, numpy as np
from PIL import Image
HID = sys.argv[1]; sys.argv = [sys.argv[0], HID]
sys.path.insert(0, os.path.dirname(__file__))
import v8_hero as V
import at16_hero as A16
s = V.OLDH / V.REF['fx'] * V.APU
fr = []
for part in 'abc':
    cs = V.cells('fx24' + part)
    ay = int(np.median([V.bottom(c) for c in cs])) - 10; ax = cs[0].shape[1] / 2
    for c in cs:
        e = np.clip(V.extend(c, 'fadeS'), 0, 255).astype(np.uint8)
        im = Image.fromarray(e, 'RGBA'); w, h = im.size
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
        fr.append((im, (ax + V.P) * s, (ay + V.P) * s))
m, sz = A16.pack16(fr, 'img/hero/fx24_%s.webp' % HID)
print('fx24 atlas', sz); print(json.dumps({HID: m}, separators=(',', ':')))
