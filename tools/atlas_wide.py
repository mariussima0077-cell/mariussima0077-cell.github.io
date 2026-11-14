"""atlas3.py – cut Marius' green-screen sprite sheets (Epic set, v16-13) into wide-cell atlases.
Cells are 384×256 (in sheet px) so a pose that crosses the sheet's 256-px column is not cut; atlas = 288×192 per cell.
Each pose = the picture parts whose centre falls in that column (so a neighbour's arm/backpack never leaks in).
usage: python3 atlas3.py <sheet.png> <id> <row bounds> <grid 0/1>
"""
import sys, json, numpy as np
from PIL import Image
from scipy import ndimage as nd

K = np.array([3., 249., 3.])
PAD = 64           # extra px left/right of every 256-px column
CW = 256 + 2 * PAD  # 384

def unmix(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    gx = g - np.maximum(r, b)
    hard = (g > 140) & (gx > 110)
    lab, n = nd.label(hard)
    sz = nd.sum(hard, lab, range(1, n + 1))
    big = np.zeros(n + 1, bool); big[1:] = sz > 400
    bg = big[lab]
    pure = np.sqrt(((a - K) ** 2).sum(2)) < 60
    lab2, n2 = nd.label(pure)
    sz2 = nd.sum(pure, lab2, range(1, n2 + 1))
    ok2 = np.zeros(n2 + 1, bool); ok2[1:] = sz2 >= 6
    bg = bg | ok2[lab2]
    # green-screen unmix everywhere: these sheets have no real green, and glows/holograms/bubbles are see-through
    t0, t1 = 25., 215.
    al = 1 - np.clip((gx - t0) / (t1 - t0), 0, 1)
    al[bg] = 0
    al = np.where(nd.binary_dilation(bg, iterations=1) & (al < .35), 0, al)
    A = np.clip(al, 1e-3, 1)[..., None]
    F = np.clip((a - (1 - A) * K) / A, 0, 255)
    m = np.maximum(F[..., 0], F[..., 2])
    F[..., 1] = np.minimum(F[..., 1], m + 12)
    return np.dstack([F, al * 255])

def run(src, hid, rows, grid, out='out'):
    im = np.asarray(Image.open(src).convert('RGB')).astype(float)
    H, W = im.shape[:2]
    rgba = unmix(im)
    if grid:
        dark = im.sum(2) < 150
        for y in range(H):
            if dark[y].mean() > .6: rgba[max(0, y - 1):y + 2, :, 3] = 0
        for x in range(W):
            if dark[:, x].mean() > .6: rgba[:, max(0, x - 1):x + 2, 3] = 0
    # feather where the generator cut an effect: image border (+ grid lines)
    f = 14
    yy, xx = np.mgrid[0:H, 0:W]
    dist = np.minimum.reduce([xx, W - 1 - xx, yy, H - 1 - yy]).astype(float)
    if grid:
        for c in (256, 512, 768): dist = np.minimum(dist, np.abs(xx - c) - 2)
        for r in rows[1:-1]: dist = np.minimum(dist, np.abs(yy - r) - 2)
    rgba[..., 3] *= np.clip(dist / f, 0, 1)
    cells = []
    for ri in range(len(rows) - 1):
        y0, y1 = rows[ri], rows[ri + 1]
        band = rgba[y0:y1]
        al = band[..., 3] > 12
        lab, n = nd.label(nd.binary_dilation(al, iterations=2))
        lab = lab * al
        idx = np.arange(1, n + 1)
        cx = np.array(nd.center_of_mass(band[..., 3], lab, idx))[:, 1] if n else np.zeros(0)
        own = np.clip((np.nan_to_num(cx) // 256).astype(int), 0, 3)
        row = []
        for ci in range(4):
            keep = np.zeros(n + 1, bool); keep[1:] = own == ci
            mask = keep[lab]
            x0 = ci * 256 - PAD
            c = np.zeros((y1 - y0, CW, 4))
            sx0, sx1 = max(0, x0), min(W, x0 + CW)
            sub = band[:, sx0:sx1].copy()
            sub[..., 3] *= mask[:, sx0:sx1]
            c[:, sx0 - x0:sx1 - x0] = sub
            row.append(c)
        cells.append(row)
    out_cells = []
    for row in cells:
        bots = []
        for c in row:
            ys = np.where((c[..., 3] > 128).any(1))[0]
            bots.append(ys.max() if len(ys) else c.shape[0] - 1)
        gnd = int(np.median(bots))
        oc = []
        for c in row:
            img = Image.fromarray(c.astype(np.uint8), 'RGBA')
            canvas = Image.new('RGBA', (CW, 256))
            top = 248 - gnd
            if top >= 0: canvas.alpha_composite(img, (0, top))
            else: canvas.alpha_composite(img.crop((0, -top, CW, img.height)), (0, 0))
            oc.append(canvas)
        out_cells.append(oc)
    nR = len(out_cells)
    cw2 = CW * 3 // 4
    atlas = Image.new('RGBA', (4 * cw2, nR * 192))
    full = Image.new('RGBA', (4 * CW, nR * 256))
    for r, row in enumerate(out_cells):
        for c, cv in enumerate(row):
            full.alpha_composite(cv, (c * CW, r * 256))
            atlas.alpha_composite(cv.resize((cw2, 192), Image.LANCZOS), (c * cw2, r * 192))
    atlas.save(f'{out}/sp_{hid}.webp', quality=88, method=6)
    full.save(f'{out}/full_{hid}.png')
    idle = np.asarray(out_cells[0][0])[..., 3] > 128
    ys, xs = np.where(idle)
    feet = xs[ys > ys.max() - 12]
    print(json.dumps({'id': hid, 'rows': nR, 'feet_x': int(np.median(feet)), 'bottom': int(ys.max()), 'top': int(ys.min())}))

if __name__ == '__main__':
    run(sys.argv[1], sys.argv[2], [int(x) for x in sys.argv[3].split(',')], int(sys.argv[4]))
