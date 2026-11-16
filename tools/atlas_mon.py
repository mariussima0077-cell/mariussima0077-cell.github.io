"""atlas_mon.py – v16-39: cut Marius' monster sprite sheets (ChatGPT, 1536x1024, green #00FF00 background).
Sheet layout (from the prompt): 6 rows · idle 6 · walk 8 · attack 8 · skill 8 · hurt 4 · death 6.
Rows 0/4/5 use 256-px columns, rows 1-3 use 192-px columns (that is how ChatGPT spaced them).
Every picture part goes to the cell holding most of its pixels; a part spread over several cells
(effect glued to the next pose) is split pixel by pixel at the cell border, with a soft edge.
All frames are re-placed in equal cells (feet on one line, centre = cell centre) -> img/mon/<id>.webp + <id>.json
usage: python3 atlas_mon.py <sheet.png> <id> <scale> [fix]
fix may contain "g8" (v16-54): sheet of 6 rows x 8 frames (no separate hurt/death rows)
"""
import sys, json, os, numpy as np
from PIL import Image
from scipy import ndimage as nd
sys.path.insert(0, os.path.dirname(__file__))
import atlas_rare as AR

NF = [6, 8, 8, 8, 4, 6]
CWS = [256, 192, 192, 192, 256, 256]
DEF_ROWS = [0, 171, 341, 512, 683, 853, 1024]


def row_bounds(mask):
    rs = mask.sum(1)
    out = [0]
    for b in DEF_ROWS[1:-1]:
        lo, hi = b - 40, b + 40
        seg = rs[lo:hi]
        z = np.where(seg == seg.min())[0] + lo
        out.append(int(z[np.argmin(np.abs(z - b))]))
    return out + [mask.shape[0]]


def col_bounds(m, n, cw):
    cs = m.sum(0)
    on = cs > 0
    on = nd.binary_closing(on, iterations=3)
    lab, k = nd.label(on)
    runs = [list(np.where(lab == i)[0][[0, -1]]) for i in range(1, k + 1)]
    runs = [r for r in runs if (cs[r[0]:r[1] + 1]).sum() > 150] or runs
    while len(runs) > n:          # merge the two closest runs
        g = [runs[i + 1][0] - runs[i][1] for i in range(len(runs) - 1)]
        i = int(np.argmin(g)); runs[i] = [runs[i][0], runs[i + 1][1]]; del runs[i + 1]
    while len(runs) < n:          # split the widest run at its thinnest column
        i = int(np.argmax([b - a for a, b in runs])); a, b = runs[i]
        q = a + (b - a) // 4 + int(np.argmin(cs[a + (b - a) // 4:b - (b - a) // 4]))
        runs[i:i + 1] = [[a, q], [q + 1, b]]
    xb = [0] + [(runs[i][1] + runs[i + 1][0]) // 2 for i in range(n - 1)] + [m.shape[1]]
    return np.array(xb)


def cut(src, mid, scale, fix=''):
    global NF
    NF = [8] * 6 if 'g8' in fix else [6, 8, 8, 8, 4, 6]
    im = np.asarray(Image.open(src).convert('RGB')).astype(float)
    H, W = im.shape[:2]
    rgba = AR.unmix_all(im)
    al = rgba[..., 3] / 255
    # grey smoke / see-through wings over green came out purple -> back to neutral grey
    R, G, B = rgba[..., 0], rgba[..., 1], rgba[..., 2]
    soft = (al < .97) & (np.abs(R - B) < 50) & (G < np.minimum(R, B))
    rgba[..., 1] = np.where(soft, (R + B) / 2, G)
    mask = al > .08
    rows = row_bounds(mask)
    # cell index of every pixel
    yy, xx = np.mgrid[0:H, 0:W]
    rix = np.searchsorted(rows, yy, side='right') - 1
    rix = np.clip(rix, 0, 5)
    # v16-39: frame borders per row from the picture itself (ChatGPT does not keep an exact grid)
    cix = np.zeros((H, W), int)
    XB = []
    for r in range(6):
        xb = col_bounds(al[rows[r]:rows[r + 1]] > .3, NF[r], CWS[r])
        XB.append(xb)
        cix[rows[r]:rows[r + 1]] = np.clip(np.searchsorted(xb, np.arange(W), side='right') - 1, 0, NF[r] - 1)[None, :]
    cell = rix * 8 + cix
    lab, n = nd.label(mask, structure=np.ones((3, 3)))
    owner = cell.copy()
    split = np.zeros((H, W), bool)
    for i, sl in enumerate(nd.find_objects(lab), 1):
        m = lab[sl] == i
        cs = cell[sl][m]
        v, c = np.unique(cs, return_counts=True)
        if c.max() >= .85 * c.sum():
            o = owner[sl]; o[m] = v[np.argmax(c)]
        else:
            s = split[sl]; s[m] = True
    # soft edge where a glued part was cut at a cell border (12 px fade)
    bord = np.zeros((H, W), bool)
    bord[:, 1:] |= cell[:, 1:] != cell[:, :-1]
    bord[1:, :] |= cell[1:, :] != cell[:-1, :]
    dist = nd.distance_transform_edt(~bord)
    fade = np.where(split, np.clip(dist / 12, 0, 1), 1)
    rgba[..., 3] *= fade
    if fix == 'dragon':
        # Nitro Dragon skill row: blue fire breath of frame c reaches back over frame c-1 -> remove blue fire
        # pixels from the right side of each skill frame (the breath is drawn by the game as a beam)
        r = 3; y0, y1 = rows[r], rows[r + 1]
        b = rgba[y0:y1]
        R, G, Bc = b[..., 0], b[..., 1], b[..., 2]
        fire = (Bc > 170) & (Bc > R + 50) & (G > 120)
        for c in range(8):
            x1 = XB[r][c + 1]
            zone = np.zeros(fire.shape, bool); zone[:, x1 - 45:x1] = True
            b[..., 3] = np.where(fire & zone, 0, b[..., 3])
    frames = {}
    A = rgba[..., 3]
    for r in range(6):
        for c in range(NF[r]):
            k = r * 8 + c
            sel = (owner == k) & (A > 2)
            if not sel.any():
                frames[k] = None; continue
            ys, xs = np.where(sel)
            y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
            pic = rgba[y0:y1, x0:x1].copy()
            pic[..., 3] *= sel[y0:y1, x0:x1]
            # body bottom: lowest row with >= 6 solid pixels
            solid = (pic[..., 3] > 150).sum(1)
            bot = y0 + (np.where(solid >= 6)[0].max() if (solid >= 6).any() else y1 - y0 - 1)
            sy, sx = np.where(pic[..., 3] > 200)
            cx = x0 + (np.median(sx) if len(sx) else pic.shape[1] / 2)
            frames[k] = dict(pic=pic, x0=x0 - cx, y0=y0, bot=bot, row=r)
    # one baseline per row (median of the frame bottoms) so jumps stay jumps
    base = {}
    for r in range(6):
        b = [f['bot'] for k, f in frames.items() if f and f['row'] == r]
        base[r] = float(np.median(b))
    L = Rr = T = Bm = 0
    for f in frames.values():
        if not f: continue
        top = f['y0'] - base[f['row']]
        L = min(L, f['x0']); Rr = max(Rr, f['x0'] + f['pic'].shape[1])
        T = min(T, top); Bm = max(Bm, top + f['pic'].shape[0])
    hw = int(np.ceil(max(-L, Rr))) + 2
    cwo, cho = int(np.ceil(2 * hw * scale)), int(np.ceil((Bm - T + 2) * scale))
    ay = (-T + 1) * scale
    atlas = Image.new('RGBA', (cwo * 8, cho * 6), (0, 0, 0, 0))
    for k, f in frames.items():
        if not f: continue
        r, c = divmod(k, 8)
        p = Image.fromarray(np.clip(f['pic'], 0, 255).astype(np.uint8), 'RGBA')
        if scale != 1:
            p = p.resize((max(1, round(p.width * scale)), max(1, round(p.height * scale))), Image.LANCZOS)
        px = c * cwo + round(cwo / 2 + f['x0'] * scale)
        py = r * cho + round(ay + (f['y0'] - base[r]) * scale)
        atlas.alpha_composite(p, (max(0, px), max(0, py)))
    # idle body height (for the game's size) = frame 0
    f0 = frames[0]
    idle_h = (base[0] - f0['y0']) * scale
    os.makedirs('img/mon', exist_ok=True)
    atlas.save(f'img/mon/{mid}.webp', 'WEBP', quality=86, method=6)
    meta = dict(w=cwo, h=cho, ax=cwo / 2, ay=round(ay, 1), ih=round(idle_h, 1), n=NF)
    print(mid, json.dumps(meta), 'rows', rows, 'size', atlas.size, os.path.getsize(f'img/mon/{mid}.webp') // 1024, 'KB')
    return meta


if __name__ == '__main__':
    cut(sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4] if len(sys.argv) > 4 else '')
