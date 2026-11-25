"""at16_hero.py – v16-324 (Marius 25 nov: "only the ATTACK", 16 frames instead of 8).
Two ChatGPT sheets per hero (frames 1-8 and 9-16, each 1536x1024, 4x2 cells of 384x512, chroma green):
  img/sheets/<dir>/<id>_attack16a.webp + <id>_attack16b.webp
Same cleaning / scale as tools/v8_hero.py (unmix → despill → extend), ONE anchor for all 16 frames (frame 1 of sheet A),
packed in one row of 16 cells → img/hero/at16_<id>.webp. Prints the meta for AT16 in battle.js.
usage: python3 tools/at16_hero.py m5_0 [REF px = standing height of frame 1 in the new sheet, default = attack REF of v8_hero]
"""
import sys, os, json
import numpy as np
from PIL import Image
HID = sys.argv[1]
sys.argv = [sys.argv[0], HID] + sys.argv[2:]
sys.path.insert(0, os.path.dirname(__file__))
import v8_hero as V

# heroes whose attack crosses the 384-px columns in v8_hero (WIDE) → same wide cells for both 16-frame sheets
_w = V.WIDE.get(HID)
if isinstance(_w, dict) and _w.get('attack'): _w['attack16a'] = _w['attack']   # (sheet B: simple split – Ignis' fire of frame 9 touches the hero of frame 10)
def frames16(ref):
    s = V.OLDH / ref * V.APU
    ca = V.cells('attack16a'); cb = V.cells('attack16b')
    ax, ay = V.torso_x(ca[0]), V.bottom(ca[0])   # one anchor for both sheets (frame 1 of sheet A)
    out = []
    for n, cs in (('attack', ca), ('attack', cb)):
        for i, c in enumerate(cs):
            e = np.clip(V.extend(c, None), 0, 255).astype(np.uint8)
            im = Image.fromarray(e, 'RGBA'); w, h = im.size
            im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
            out.append((im, (ax + V.P) * s, (ay + V.P) * s))
    return out

def pack16(fr, name):
    L = R = t = b = 0
    for im, ax, ay in fr:
        bb = im.getchannel('A').point(lambda q: 255 if q > 6 else 0).getbbox()
        if not bb: continue
        L = max(L, ax - bb[0]); R = max(R, bb[2] - ax); t = max(t, ay - bb[1]); b = max(b, bb[3] - ay)
    L, R, T, B = int(np.ceil(L)) + 2, int(np.ceil(R)) + 2, int(np.ceil(t)) + 2, int(np.ceil(b)) + 2
    cw, h = L + R, T + B
    A = Image.new('RGBA', (cw * len(fr), h))
    for j, (im, ax, ay) in enumerate(fr):
        A.alpha_composite(im, (round(j * cw + L - ax), round(T - ay)))
    A.save(name, quality=90, method=6)
    u = lambda v: round(v / V.APU, 1)
    return {'cw': cw, 'uw': u(cw), 'ax': u(L), 'n': len(fr), 'rows': [[0, h, u(h), u(T)]]}, A.size

if __name__ == '__main__':
    ref = float(sys.argv[2]) if len(sys.argv) > 2 else V.REF['attack']
    m, sz = pack16(frames16(ref), 'img/hero/at16_%s.webp' % HID)
    print('attack16 atlas', sz)
    print(json.dumps({HID: m}, separators=(',', ':')))
