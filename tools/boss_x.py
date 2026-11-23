# v16-197: chapter bosses INTRO + ENRAGE (Marius' ChatGPT sheets, img/sheets/boss/<id>/<id>_{intro,enrage}.webp, 3x2 frames of 512)
# -> img/mon/<id>_x.webp  atlas 6 cols x 2 rows (0 intro · 1 enrage), same pixel scale as img/mon/<id>.webp
#    (scaled so the body width of the neutral pose = the old idle frame 0; feet line + body centre matched)
# Prints MSPR.<id>.x numbers for battle.js.
import os, re, json, numpy as np
from PIL import Image
R = os.path.join(os.path.dirname(__file__), '..')
src = open(os.path.join(os.path.dirname(__file__), 'wb_v2.py')).read()
exec(src[:src.index('out = {}')])  # key(), split(), fade_border(), anchor()
JS = open(f'{R}/battle.js').read()
IDS = ['jtitan', 'gtanker', 'towking', 'ndragon', 'gomega']

def solid_metrics(a):
    """width of the lower 60% of the solid body, feet line, centre of the lowest 25%"""
    A = a[..., 3] > 200
    ys = np.nonzero(A.sum(1) >= 6)[0]; t, b = ys.min(), ys.max()
    lo = A[int(b - (b - t) * .6):b + 1]
    xs = np.nonzero(lo.sum(0) >= 4)[0]
    lo2 = A[int(b - (b - t) * .25):b + 1]; xs2 = np.nonzero(lo2.any(0))[0]
    return xs.max() - xs.min() + 1, b, (xs2.min() + xs2.max()) / 2

out = {}
for mid in IDS:
    m = re.search(mid + r':\{w:([\d.]+),h:([\d.]+),ax:([\d.]+),ay:([\d.]+),ih:([\d.]+)', JS)
    w, h, ax, ay, ih = [float(v) for v in m.groups()]
    old = np.asarray(Image.open(f'{R}/img/mon/{mid}.webp').convert('RGBA'))[0:int(h), 0:int(w)]
    bw0, feet0, cx0 = solid_metrics(old)
    rows = []
    for n, ref in (('intro', 5), ('enrage', 0)):
        cells = [fade_border(c) for c in split(key(Image.open(f'{R}/img/sheets/boss/{mid}/{mid}_{n}.webp')))]
        bw, feet, cx = solid_metrics(cells[ref])
        s = bw0 / bw
        sc = []
        for c in cells:
            im = Image.fromarray(c).resize((round(512 * s), round(512 * s)), Image.LANCZOS)
            sc.append(np.asarray(im))
        rows.append((sc, feet * s, cx * s))  # anchor = feet / body centre of the neutral frame
    # common box around the anchors
    L = Rt = U = D = 0
    for sc, fy, fx in rows:
        for c in sc:
            A = c[..., 3] > 8
            ys, xs = np.nonzero(A.any(1))[0], np.nonzero(A.any(0))[0]
            if not len(ys): continue
            L = max(L, fx - xs.min()); Rt = max(Rt, xs.max() - fx); U = max(U, fy - ys.min()); D = max(D, ys.max() - fy)
    pa_x, pa_y = int(np.ceil(L)) + 2, int(np.ceil(U)) + 2
    CW, CH = pa_x + int(np.ceil(Rt)) + 3, pa_y + int(np.ceil(D)) + 3
    atlas = Image.new('RGBA', (CW * 6, CH * 2))
    for r, (sc, fy, fx) in enumerate(rows):
        for k, c in enumerate(sc):
            atlas.alpha_composite(Image.fromarray(c), (k * CW + int(round(pa_x - fx)), r * CH + int(round(pa_y - fy))))
    atlas.save(f'{R}/img/mon/{mid}_x.webp', quality=86, method=6)
    # same screen point: new anchor ↔ old (cx0, feet0)
    nax, nay = pa_x - (cx0 - ax), pa_y - (feet0 - ay)
    out[mid] = dict(w=CW, h=CH, ax=round(nax, 1), ay=round(nay, 1))
    print(mid, out[mid], atlas.size, os.path.getsize(f'{R}/img/mon/{mid}_x.webp') // 1024, 'KB', 'old', (w, h, ax, ay))
json.dump(out, open('/tmp/boss_x.json', 'w'))
