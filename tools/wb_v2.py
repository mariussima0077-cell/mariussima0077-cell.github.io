# v16-134: WORLD BOSS animations v2 – Marius' new sheets (img/sheets/wb/<boss>2/, 1536x1024 = 3x2 frames of 512)
# -> img/mon/<id>2.webp  atlas 6 cols x 7 rows: 0 idle · 1 idle (walk, bosses never walk) · 2 attack · 3 skill · 4 hit · 5 enrage · 6 intro
# -> img/wb/fx_<id>.webp 4 strips (the skill effect: fire breath / shockwave / lava wave / chain), emitter on the RIGHT end
# Fixes done here: frames that cross the 512 line (blobs go to the cell of their centre), flashes cut by the picture edge (faded),
# enclosed green (crown rims) keyed too, every sheet aligned on the same feet line / body centre.
# Prints the MSPR numbers to paste in battle.js.
import os, json, numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.join(os.path.dirname(__file__), '..')
BOSS = {  # id: (folder, prefix, fx name, fx axis (0..1 of the strip height))
    'scrapzilla': ('scrapzilla2', 'scrapzilla', 'fxbreath', .50),
    'crusher':    ('crusher2', 'crusher', 'fxshock', .90),
    'inferno':    ('inferno2', 'inferno', 'fxlava', .90),
    'tow':        ('tow2', 'tow', 'fxchain', .80),
}
ROWS = ['idle', 'idle', 'attack', 'skill', 'hit', 'enrage', 'intro']
SC = .5  # atlas scale

def key(im):
    a = np.asarray(im.convert('RGB')).astype(np.float32)
    bg = np.median(np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3)]), 0)
    d = np.sqrt(((a - bg) ** 2).sum(-1))
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    al = np.clip((d - 45) / 105, 0, 1)
    al = np.where((g > r + 70) & (g > b + 70), np.minimum(al, .0), al)  # pure green anywhere (crown rim holes)
    # unmix the green out of the soft edges / smoke: colour = (pixel - (1-alpha)·green) / alpha
    A = np.maximum(al, .08)[..., None]
    fg = np.where(al[..., None] < .999, (a - (1 - A) * bg) / A, a).clip(0, 255)
    r, g, b = fg[..., 0], fg[..., 1], fg[..., 2]
    m = np.maximum(r, b)
    g2 = np.where(g > m, m + (g - m) * .15, g)  # what is still greener than red and blue → neutral
    g2 = np.where((al < .98) & (g2 > r * .92) & (g2 > b * 1.15), np.minimum(g2, r * .85 + 8), g2)  # lemon-green flame tips → warm gold
    o = np.dstack([r, g2, b, al * 255]).clip(0, 255).astype(np.uint8)
    return o

def split(a):
    """6 cells of 512; each blob goes to the cell holding its centre"""
    A = a[..., 3] > 20
    lab, n = ndimage.label(A)
    cells = [np.zeros((512, 512, 4), np.uint8) for _ in range(6)]
    if n:
        com = ndimage.center_of_mass(A, lab, range(1, n + 1))
        sl = ndimage.find_objects(lab)
    for i in range(n):
        cy, cx = com[i]; ci = min(1, int(cy // 512)) * 3 + min(2, int(cx // 512))
        oy, ox = (ci // 3) * 512, (ci % 3) * 512
        ys, xs = sl[i]
        msk = lab[ys, xs] == i + 1
        src = a[ys, xs]
        # place in an extended canvas then crop to the cell (parts outside the cell are dropped, they are tiny)
        Y0, X0 = ys.start - oy, xs.start - ox
        y0, x0 = max(0, Y0), max(0, X0)
        y1, x1 = min(512, ys.stop - oy), min(512, xs.stop - ox)
        if y1 <= y0 or x1 <= x0: continue
        sub = src[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0]; mk = msk[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0]
        c = cells[ci][y0:y1, x0:x1]
        c[mk] = sub[mk]
    # soft faint halo pixels (alpha<=20) of each cell
    for ci in range(6):
        oy, ox = (ci // 3) * 512, (ci % 3) * 512
        src = a[oy:oy + 512, ox:ox + 512]
        lo = (src[..., 3] <= 20) & (cells[ci][..., 3] == 0)
        cells[ci][lo] = src[lo]
    return cells

def fade_border(c, F=26):
    """flashes cut by the picture / cell edge → fade them out instead of a hard cut"""
    c = c.astype(np.float32); h, w = c.shape[:2]
    for side in 'LRTB':
        e = {'L': c[:, :3, 3], 'R': c[:, -3:, 3], 'T': c[:3, :, 3], 'B': c[-3:, :, 3]}[side]
        if (e > 40).sum() < 4: continue
        r = np.clip(np.arange(F) / F, 0, 1)
        if side == 'L': c[:, :F, 3] *= r[None]
        if side == 'R': c[:, -F:, 3] *= r[::-1][None]
        if side == 'T': c[:F, :, 3] *= r[:, None]
        if side == 'B': c[-F:, :, 3] *= r[::-1][:, None]
    return c.clip(0, 255).astype(np.uint8)

def anchor(cells):
    """feet line (median bottom) + body centre (alpha centre of the lowest 25%) of a sheet"""
    bots, cxs = [], []
    for c in cells:
        A = c[..., 3] > 128
        ys = np.nonzero(A.any(1))[0]
        if not len(ys): continue
        b = ys.max(); t = ys.min(); bots.append(b)
        lo = A[int(b - (b - t) * .25):b + 1]
        xs = np.nonzero(lo.any(0))[0]; cxs.append((xs.min() + xs.max()) / 2)
    return float(np.median(bots)), float(np.median(cxs))

out = {}
for bid, (fol, pre, fxn, fxa) in BOSS.items():
    S = {}
    for n in set(ROWS):
        a = key(Image.open(f'{R}/img/sheets/wb/{fol}/{pre}_{n}.webp'))
        cells = [fade_border(c) for c in split(a)]
        S[n] = (cells, anchor(cells))
    # common box around the anchor for every frame
    ext = [0, 0, 0, 0]  # left, right, up, down from the anchor
    for n, (cells, (by, bx)) in S.items():
        for c in cells:
            A = c[..., 3] > 8
            ys, xs = np.nonzero(A.any(1))[0], np.nonzero(A.any(0))[0]
            if not len(ys): continue
            ext[0] = max(ext[0], bx - xs.min()); ext[1] = max(ext[1], xs.max() - bx)
            ext[2] = max(ext[2], by - ys.min()); ext[3] = max(ext[3], ys.max() - by)
    ax0, ay0 = int(np.ceil(ext[0])) + 4, int(np.ceil(ext[2])) + 4
    CW, CH = ax0 + int(np.ceil(ext[1])) + 4, ay0 + int(np.ceil(ext[3])) + 4
    cw, ch = round(CW * SC), round(CH * SC)
    atlas = Image.new('RGBA', (cw * 6, ch * len(ROWS)))
    for r, n in enumerate(ROWS):
        cells, (by, bx) = S[n]
        for k, c in enumerate(cells):
            big = Image.new('RGBA', (CW, CH))
            big.paste(Image.fromarray(c), (int(round(ax0 - bx)), int(round(ay0 - by))))
            atlas.paste(big.resize((cw, ch), Image.LANCZOS), (k * cw, r * ch))
    atlas.save(f'{R}/img/mon/{bid}2.webp', quality=86, method=6)
    # body height on the idle frame 1 (for the size in battle, like the old atlases)
    A = np.asarray(atlas)[0:ch, 0:cw, 3] > 128
    top = np.nonzero(A.any(1))[0].min()
    ax, ay = ax0 * SC, ay0 * SC
    out[bid] = dict(w=cw, h=ch, ax=round(ax, 1), ay=round(ay, 1), ih=round(ay - top, 1))
    # fx strips
    f = key(Image.open(f'{R}/img/sheets/wb/{fol}/{pre}_{fxn}.webp'))
    W = 1024; hh = round(256 * W / 1536)
    fa = Image.new('RGBA', (W, hh * 4))
    for s in range(4):
        st = f[s * 256:(s + 1) * 256].copy()
        st[:3, :, 3] = 0; st[-3:, :, 3] = 0  # strips that touch each other: cut on the strip line
        st = fade_border(st, 18)
        fa.paste(Image.fromarray(st).resize((W, hh), Image.LANCZOS), (0, s * hh))
    fa.save(f'{R}/img/wb/fx_{bid}.webp', quality=84, method=6)
    out[bid]['fx'] = dict(w=W, h=hh, ya=fxa)
    print(bid, out[bid], atlas.size)
json.dump(out, open('/tmp/wb_v2.json', 'w'))
