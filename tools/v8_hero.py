"""v8_hero.py – v16-94: 8-frame hero animations (first: THE TORQUE KING m5_0).
Marius' ChatGPT sheets: one animation per picture, 1536x1024, 4x2 cells of 384x512, chroma green.
  img/sheets/king/m5_0_{idle,run,attack,skill,hitko,win,fx}.webp
Steps: unmix green (atlas_wide.unmix) → despill (flame edges warm, smoke grey) → EXTEND effects cut by the cell
edge (Marius: "completează tu unde trebuie": the edge line is smeared outward and fades) → one scale + one feet
anchor for all sheets (REF = standing height in sheet px) → atlas rows idle·run·attack·skill·hit/KO·win, 8 frames,
each row its own height (the skill row is tall because of the light beam).
Output: img/hero/sp_m5_0.webp + img/hero/fxs_m5_0.webp, prints the SPRD entry (v8 meta) for battle.js.
usage: python3 tools/v8_hero.py [m5_0|m5_1]
"""
import sys, os, json, numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from atlas_wide import unmix

# usage: python3 tools/v8_hero.py [hero id]   (default m5_0)
HEROES = {
  'm5_0': ('king', {'idle': 359, 'run': 342, 'attack': 342, 'skill': 345, 'hitko': 381, 'win': 384, 'fx': 345}),
  # v16-95 Lady Overdrive: REF measured on the standing frames (idle 1, win 1, hit 1, skill 8), run/attack stances estimated
  # v16-96 GRIGORE (first Legendary). REF: idle/win/hit frame 1 standing; skill sheet is 1774x887 (cells 443x443) → own px
  'm4_0': ('grigore', {'idle': 428, 'run': 395, 'attack': 355, 'skill': 375, 'hitko': 400, 'win': 420, 'fx': 214}),
  # v16-96 MAMA ROSA: REF = idle 1 / attack 8 / skill 1 / hit 1 / win 1 standing; fx = holy pillar, sized ~1.1x her width
  'm4_1': ('rosa', {'idle': 432, 'run': 425, 'attack': 359, 'skill': 359, 'hitko': 380, 'win': 392, 'fx': 420}),
  'm5_1': ('lady', {'idle': 439, 'run': 381, 'attack': 385, 'skill': 372, 'hitko': 384, 'win': 430, 'fx': 372}),
}
HID = sys.argv[1] if len(sys.argv) > 1 else 'm5_0'
SRC = 'img/sheets/%s/%s_%%s.webp' % (HEROES[HID][0], HID)
ROWS = ['idle', 'run', 'attack', 'skill', 'hitko', 'win']
REF = HEROES[HID][1]
OLDH = 241          # standing height in 256-cell units (same size as the old sheet)
APU = .75           # atlas px per unit (same as the old 192-px cells)
P = 110             # extension padding (sheet px)

def despill(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    gr = (g > r) | (g > b + (r - b) * .8)
    fl = gr & (r > 2 * b + 20)
    sm = gr & ~fl
    a = a.copy()
    a[..., 1] = np.where(fl, np.minimum(g, r * .82), a[..., 1])
    v = (r + b) / 2
    for k, o in ((0, 6), (1, 2), (2, 0)): a[..., k] = np.where(sm, v + o, a[..., k])
    return a

# v16-95: per frame override where smearing the edge looks wrong (explosions / fire columns → soft fade instead,
# tiny ground-shadow touches → nothing). key (sheet, frame 0-7)
EXT = {'m4_0': {('fx', 3): 'fade', ('fx', 4): 'fade', ('fx', 5): 'fade', ('skill', 3): 'none', ('skill', 4): 'fade',
                ('skill', 5): 'fade', ('skill', 6): 'fade', ('idle', 2): 'none', ('idle', 3): 'none', ('idle', 4): 'none',
                ('idle', 5): 'none', ('idle', 6): 'none', ('run', 1): 'none', ('attack', 2): 'fade', ('win', 3): 'fade'},
       'm4_1': {('fx', 2): 'softtop', ('fx', 3): 'softtop', ('fx', 5): 'softtop', ('fx', 6): 'softtop'},
       'm5_1': {('fx', 4): 'fade', ('fx', 5): 'fade', ('fx', 6): 'fade', ('fx', 7): 'fade', ('skill', 3): 'fade',
                ('hitko', 5): 'none', ('hitko', 6): 'none', ('hitko', 7): 'none'}}

def fade_edges(c, F=34):
    h, w = c.shape[:2]; E = 8; c = c.copy()
    def touch(a): return (a[..., 3] > 40).sum() > 6
    r = (np.arange(F) / F) ** 1.3
    if touch(c[:E]): c[:F, :, 3] *= r[:, None]
    if touch(c[-E:]): c[-F:, :, 3] *= r[::-1, None]
    if touch(c[:, :E]): c[:, :F, 3] *= r[None, :]
    if touch(c[:, -E:]): c[:, -F:, 3] *= r[None, ::-1]
    o = np.zeros((h + 2 * P, w + 2 * P, 4), np.float32); o[P:P + h, P:P + w] = c
    return o

def extend(c, mode=None):
    if mode == 'softtop':   # v16-96: light pillar whose top ends ragged on the green → soft fade over its top 40 %
        a = c[..., 3] > 30; ys = np.nonzero(a.any(1))[0]
        if len(ys):
            y0, y1 = ys.min(), ys.max(); r = np.clip((np.arange(c.shape[0]) - y0) / (.4 * (y1 - y0) + 1), 0, 1) ** 1.4
            c = c.copy(); c[..., 3] *= r[:, None]
        mode = None
    if mode == 'fade': return fade_edges(c, 95)
    if mode == 'none':
        o = np.zeros((c.shape[0] + 2 * P, c.shape[1] + 2 * P, 4), np.float32); o[P:-P, P:-P] = c; return o
    """pad the cell; where the picture comes within 8 px of an edge, smear the line 8 px inside outward and fade it"""
    h, w = c.shape[:2]; E = 8
    o = np.zeros((h + 2 * P, w + 2 * P, 4), np.float32); o[P:P + h, P:P + w] = c
    n = P + E; fade = (1 - np.arange(1, n + 1) / n) ** 1.6
    def touch(a): return (a[..., 3] > 40).sum() > 6
    if touch(c[:E]):
        ln = c[E:E + 3].mean(0)
        for i in range(n): o[P + E - 1 - i, P:P + w] = ln * [1, 1, 1, fade[i]]
    if touch(c[-E:]):
        ln = c[-E - 3:-E].mean(0)
        for i in range(n): o[P + h - E + i, P:P + w] = ln * [1, 1, 1, fade[i]]
    if touch(c[:, :E]):
        ln = c[:, E:E + 3].mean(1)
        for i in range(n): o[P:P + h, P + E - 1 - i] = ln * [1, 1, 1, fade[i]]
    if touch(c[:, -E:]):
        ln = c[:, -E - 3:-E].mean(1)
        for i in range(n): o[P:P + h, P + w - E + i] = ln * [1, 1, 1, fade[i]]
    return o

# v16-96: heroes whose poses / thrown weapons cross the 384-px columns (Rosa's wrench swooshes) → wide cells:
# every picture part goes to the column its centre is in (no neighbour leaking, nothing cut at the column line)
WIDE = {'m4_1': 90}
def cells(n):
    im = np.asarray(Image.open(SRC % n).convert('RGB')).astype(float)
    a = despill(unmix(im)).astype(np.float32)
    H, W = a.shape[:2]; ch, cw = H // 2, W // 4   # v16-96: any sheet size (Grigore's skill sheet is 1774x887)
    pc = WIDE.get(HID, 0)
    if not pc: return [a[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw] for r in range(2) for c in range(4)]
    from scipy import ndimage as nd
    lab, k = nd.label(nd.binary_dilation(a[..., 3] > 12, iterations=3))
    cx = np.array(nd.center_of_mass(a[..., 3], lab, range(1, k + 1)))[:, 1] if k else np.zeros(0)
    col = np.zeros(k + 1, int); col[1:] = np.clip((cx // cw).astype(int), 0, 3)
    C = col[lab]; out = []
    for r in range(2):
        band = a[r * ch:(r + 1) * ch]; cb = C[r * ch:(r + 1) * ch]; lb = lab[r * ch:(r + 1) * ch]
        p = np.zeros((ch, W + 2 * pc, 4), np.float32); p[:, pc:pc + W] = band
        cp = np.full((ch, W + 2 * pc), -1); cp[:, pc:pc + W] = np.where(lb > 0, cb, -1)
        for c in range(4):
            x0 = c * cw; o = p[:, x0:x0 + cw + 2 * pc].copy(); o[cp[:, x0:x0 + cw + 2 * pc] != c] = 0; out.append(o)
    return out

def torso_x(c):
    a = c[..., 3] > 128; ys, xs = np.nonzero(a); y0, y1 = ys.min(), ys.max()
    return np.nonzero(a[int(y0 + .4 * (y1 - y0)):int(y0 + .7 * (y1 - y0))])[1].mean()

def bottom(c): return np.nonzero((c[..., 3] > 128).any(1))[0].max()

def frames(n):
    """→ list of (RGBA image at APU px/unit, anchor x, anchor y in that image)"""
    cs = cells(n); s = OLDH / REF[n] * APU
    if n == 'fx': ax, ay = cs[0].shape[1] / 2, bottom(cs[4]) - 10
    elif n == 'run': ax, ay = np.mean([torso_x(c) for c in cs]), max(bottom(c) for c in cs)
    else: ax, ay = torso_x(cs[0]), bottom(cs[0])
    out = []
    for i, c in enumerate(cs):
        e = np.clip(extend(c, EXT.get(HID, {}).get((n, i))), 0, 255).astype(np.uint8)
        im = Image.fromarray(e, 'RGBA'); w, h = im.size
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
        out.append((im, (ax + P) * s, (ay + P) * s))
    return out

def pack(rows, name):
    """rows: list of frame lists → atlas; every row: same cell width, own height. Returns meta (units)."""
    L = R = 0; T = []; B = []
    for fr in rows:
        t = b = 0
        for im, ax, ay in fr:
            bb = im.getchannel('A').point(lambda q: 255 if q > 6 else 0).getbbox()
            L = max(L, ax - bb[0]); R = max(R, bb[2] - ax); t = max(t, ay - bb[1]); b = max(b, bb[3] - ay)
        T.append(int(np.ceil(t)) + 2); B.append(int(np.ceil(b)) + 2)
    L, R = int(np.ceil(L)) + 2, int(np.ceil(R)) + 2
    cw = L + R; hs = [T[i] + B[i] for i in range(len(rows))]
    A = Image.new('RGBA', (cw * 8, sum(hs)))
    y = 0; meta = []
    for i, fr in enumerate(rows):
        for j, (im, ax, ay) in enumerate(fr):
            A.alpha_composite(im, (round(j * cw + L - ax), round(y + T[i] - ay)))
        meta.append([y, hs[i], T[i]]); y += hs[i]
    # crop each cell to its own box (alpha_composite of a neighbour never leaks: the box is the max of all frames)
    A.save(name, quality=90, method=6)
    u = lambda v: round(v / APU, 1)
    return {'cw': cw, 'uw': u(cw), 'ax': u(L), 'rows': [[m[0], m[1], u(m[1]), u(m[2])] for m in meta]}, A.size

if __name__ == '__main__':
    hero = [frames(n) for n in ROWS]
    m, sz = pack(hero, 'img/hero/sp_%s.webp' % HID)
    f, fsz = pack([frames('fx')], 'img/hero/fxs_%s.webp' % HID)
    print('hero atlas', sz, 'fx atlas', fsz)
    print(json.dumps({'v8': m, 'fx8': f}, separators=(',', ':')))
