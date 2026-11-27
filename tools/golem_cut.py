# v16-388 THE FORGE boss SCRAP GOLEM – Marius' 4 sheets (img/sheets/forge/golem_<idle|walk|attack|skill>.webp, 1536x1024 = 4x2 frames)
# -> img/mon/golem2.webp in the World Boss v2 atlas format (6 cols x 7 rows: 0 idle · 1 idle · 2 attack · 3 skill · 4 hit · 5 enrage · 6 intro)
# hit = idle frames pushed back + red flash · enrage = idle frames with a red-hot glow · intro = walk frames (made here, no extra pictures)
# -> img/wb/fx_golem.webp = the CRUSHER KING ground shockwave recoloured to molten orange
# Prints the MSPR numbers to paste in battle.js.
import os, sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
sys.path.insert(0, os.path.dirname(__file__))
_src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'wb_v2.py')).read().split('\nout = {}')[0]
exec(_src)  # key(), fade_border(), anchor() from the World Boss tool (its main part is NOT run)
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SC = .5


def split8(a):
    """8 cells of 384x512; each blob goes to the cell holding its centre"""
    A = a[..., 3] > 20
    lab, n = ndimage.label(A)
    cells = [np.zeros((512, 384, 4), np.uint8) for _ in range(8)]
    com = ndimage.center_of_mass(A, lab, range(1, n + 1)) if n else []
    sl = ndimage.find_objects(lab)
    for i in range(n):
        cy, cx = com[i]; ci = min(1, int(cy // 512)) * 4 + min(3, int(cx // 384))
        oy, ox = (ci // 4) * 512, (ci % 4) * 384
        ys, xs = sl[i]; msk = lab[ys, xs] == i + 1; src = a[ys, xs]
        Y0, X0 = ys.start - oy, xs.start - ox
        y0, x0 = max(0, Y0), max(0, X0); y1, x1 = min(512, ys.stop - oy), min(384, xs.stop - ox)
        if y1 <= y0 or x1 <= x0: continue
        sub = src[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0]; mk = msk[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0]
        cells[ci][y0:y1, x0:x1][mk] = sub[mk]
    return cells


def tint(c, col, k):
    f = c.astype(np.float32); m = f[..., 3:4] / 255
    f[..., :3] = f[..., :3] * (1 - k) + np.array(col, np.float32) * k * m + f[..., :3] * 0
    return f.clip(0, 255).astype(np.uint8)


def glow(c, col, rad, k):
    im = Image.fromarray(c); a = im.split()[3].filter(ImageFilter.GaussianBlur(rad))
    g = Image.new('RGBA', im.size, col + (0,)); g.putalpha(a.point(lambda v: int(v * k)))
    out = Image.alpha_composite(g, im)
    return np.asarray(out)


S = {}
for n in ['idle', 'walk', 'attack', 'skill']:
    a = key(Image.open(f'{R}/img/sheets/forge/golem_{n}.webp'))
    S[n] = [fade_border(c) for c in split8(a)]
PICK = {'idle': [0, 1, 3, 4, 6, 7], 'attack': [1, 2, 3, 4, 5, 7], 'skill': [0, 2, 3, 4, 5, 6], 'walk': [0, 2, 3, 4, 5, 7]}
rows = []
rows.append([S['idle'][i] for i in PICK['idle']])
rows.append([S['idle'][i] for i in PICK['idle']])
rows.append([S['attack'][i] for i in PICK['attack']])
rows.append([S['skill'][i] for i in PICK['skill']])
hit = []
for j, i in enumerate([0, 1, 3, 4, 6, 7]):
    c = tint(S['idle'][i], (255, 60, 40), [.45, .3, .2, .12, .06, 0][j]); hit.append(c)
rows.append(hit)
rows.append([glow(tint(S['idle'][i], (255, 90, 30), .18), (255, 60, 0), 10, .9) for i in PICK['idle']])
rows.append([S['walk'][i] for i in PICK['walk']])
# every row aligned on the idle feet line / body centre
by, bx = anchor(S['idle'])
ext = [0, 0, 0, 0]
anc = [anchor(r) for r in rows]
for r, (ry, rx) in zip(rows, anc):
    for c in r:
        A = c[..., 3] > 8
        ys, xs = np.nonzero(A.any(1))[0], np.nonzero(A.any(0))[0]
        if not len(ys): continue
        ext[0] = max(ext[0], rx - xs.min()); ext[1] = max(ext[1], xs.max() - rx)
        ext[2] = max(ext[2], ry - ys.min()); ext[3] = max(ext[3], ys.max() - ry)
ax0, ay0 = int(np.ceil(ext[0])) + 4, int(np.ceil(ext[2])) + 4
CW, CH = ax0 + int(np.ceil(ext[1])) + 4, ay0 + int(np.ceil(ext[3])) + 4
cw, ch = round(CW * SC), round(CH * SC)
atlas = Image.new('RGBA', (cw * 6, ch * 7))
for r, (row, (ry, rx)) in enumerate(zip(rows, anc)):
    for k, c in enumerate(row):
        big = Image.new('RGBA', (CW, CH)); big.paste(Image.fromarray(c), (int(round(ax0 - rx)), int(round(ay0 - ry))))
        atlas.paste(big.resize((cw, ch), Image.LANCZOS), (k * cw, r * ch))
atlas.save(f'{R}/img/mon/golem2.webp', quality=86, method=6)
A = np.asarray(atlas)[0:ch, 0:cw, 3] > 128
top = np.nonzero(A.any(1))[0].min()
print("MSPR.golem2={w:%d,h:%d,ax:%.1f,ay:%.1f,ih:%.1f,wb:{v2:1,ni:6,pr:3,fxP:1,fx:{w:1024,h:171,ya:0.9}}};" % (cw, ch, ax0 * SC, ay0 * SC, ay0 * SC - top))
# molten shockwave = crusher's, recoloured
fx = Image.open(f'{R}/img/wb/fx_crusher.webp').convert('RGBA'); f = np.asarray(fx).astype(np.float32)
lum = f[..., :3].mean(-1, keepdims=True) / 255
col = np.concatenate([255 * np.ones_like(lum), 60 + 170 * lum, 20 + 120 * lum ** 2], -1)
f[..., :3] = col
Image.fromarray(f.clip(0, 255).astype(np.uint8)).save(f'{R}/img/wb/fx_golem.webp', quality=84, method=6)
print('atlas', atlas.size)
