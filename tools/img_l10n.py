# Torque Empire – translated copies of pictures that have English text painted in them.
# For each picture in lang/src/img_spec.py: the English text is painted over (each row is filled
# from its left/right edge colours = the plate keeps its light/shade), then the translated text is
# drawn in game style (Lilita / Noto CJK Black). Output: img/l/<lang>/<same path>.webp.
# lang/i18n.js swaps the paths at run time (only for that language; English untouched).
# Run: python3 tools/img_l10n.py [lang ...]   (needs: pip install brotli pillow numpy opencv-python)
import os, sys, json, importlib.util
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sp = importlib.util.spec_from_file_location('spec', R + '/lang/src/img_spec.py'); S = importlib.util.module_from_spec(sp); sp.loader.exec_module(S)
LANGS = sys.argv[1:] or ['fr', 'es', 'pt', 'ko', 'ja']
TTF = '/tmp/te_lilita.ttf'
if not os.path.exists(TTF):
    from fontTools.ttLib import TTFont
    f = TTFont(R + '/assets/fonts/lilita.woff2'); f.flavor = None; f.save(TTF)
CJK = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'

def font(lang, size):
    if lang == 'ja': return ImageFont.truetype(CJK, size, index=0)
    if lang == 'ko': return ImageFont.truetype(CJK, size, index=1)
    return ImageFont.truetype(TTF, size)

def fill(a, box, mode, pct=(12, 40)):
    x0, y0, x1, y1 = box
    if mode == 'tel':
        m = np.zeros(a.shape[:2], np.uint8); m[y0:y1, x0:x1] = 255
        bgr = cv2.cvtColor(a[:, :, :3], cv2.COLOR_RGB2BGR)
        a[:, :, :3] = cv2.cvtColor(cv2.inpaint(bgr, m, 9, cv2.INPAINT_TELEA), cv2.COLOR_BGR2RGB); return
    f = a.astype(np.float32)
    if mode == 'plate':  # new plate: every row = typical dark plate colour of that row (+ wider context), soft edges
        X0, X1 = max(0, x0 - 60), min(a.shape[1], x1 + 60)
        cols = []
        for y in range(y0, y1):
            row = f[y, X0:X1, :3]; lum = row.mean(1); lo, hi = np.percentile(lum, pct[0]), np.percentile(lum, pct[1])
            sel = row[(lum >= lo) & (lum <= hi)]; cols.append(np.median(sel, 0) if len(sel) else row.mean(0))
        cols = np.array(cols); k = max(3, (y1 - y0) // 6)
        cols = np.array([cols[max(0, i - k):i + k + 1].mean(0) for i in range(len(cols))])
        m = np.zeros(a.shape[:2], np.float32); rr = max(4, (y1 - y0) // 5)
        cv2.rectangle(m, (x0 + rr, y0), (x1 - rr, y1 - 1), 1, -1); cv2.rectangle(m, (x0, y0 + rr), (x1 - 1, y1 - rr), 1, -1)
        for cx, cy in ((x0 + rr, y0 + rr), (x1 - rr, y0 + rr), (x0 + rr, y1 - rr), (x1 - rr, y1 - rr)): cv2.circle(m, (cx, cy), rr, 1, -1)
        m = cv2.GaussianBlur(m, (0, 0), 2.2)[:, :, None]
        newp = f.copy(); newp[y0:y1, x0:x1, :3] = cols[:, None, :]
        f[:, :, :3] = f[:, :, :3] * (1 - m) + newp[:, :, :3] * m
        a[:] = np.clip(f, 0, 255).astype(np.uint8); return
    if mode == 'v':
        top = f[y0 - 3:y0, x0:x1].mean(0); bot = f[y1:y1 + 3, x0:x1].mean(0)
        for i, y in enumerate(range(y0, y1)):
            t = (i + .5) / (y1 - y0); f[y, x0:x1] = top * (1 - t) + bot * t
    else:  # 'h' – default: every row from its left/right edge
        L = f[y0:y1, x0 - 3:x0].mean(1); Rr = f[y0:y1, x1:x1 + 3].mean(1)
        n = x1 - x0; t = ((np.arange(n) + .5) / n)[None, :, None]
        f[y0:y1, x0:x1] = L[:, None] * (1 - t) + Rr[:, None] * t
    a[:] = np.clip(f, 0, 255).astype(np.uint8)
    # soft seam
    sub = Image.fromarray(a[max(0, y0 - 2):y1 + 2, max(0, x0 - 2):x1 + 2]).filter(ImageFilter.GaussianBlur(1.2))
    a[max(0, y0 - 2):y1 + 2, max(0, x0 - 2):x1 + 2] = np.array(sub)

STY = {  # fill gradient (top, mid, bottom), outline, shadow
    'gold':  (((255, 250, 205), (255, 214, 60), (226, 130, 0)), (52, 22, 0), (0, 0, 0, 170)),
    'white': (((255, 255, 255), (255, 255, 255), (214, 222, 235)), (20, 24, 40), (0, 0, 0, 160)),
    'cream': (((255, 246, 214), (255, 236, 180), (240, 204, 130)), (40, 20, 4), (0, 0, 0, 150)),
    'dark':  (((40, 26, 8), (30, 18, 4), (22, 12, 0)), None, None),
    'r0': (((255, 255, 255), (226, 232, 240), (170, 180, 195)), (20, 24, 34), (0, 0, 0, 170)),
    'r1': (((210, 255, 190), (110, 230, 70), (40, 160, 20)), (8, 40, 4), (0, 0, 0, 170)),
    'r2': (((200, 245, 255), (80, 200, 255), (20, 120, 230)), (4, 24, 60), (0, 0, 0, 170)),
    'r3': (((255, 210, 255), (230, 120, 255), (160, 50, 230)), (40, 6, 60), (0, 0, 0, 170)),
    'r4': (((255, 250, 205), (255, 214, 60), (226, 130, 0)), (52, 22, 0), (0, 0, 0, 170)),
    'r5': (((255, 200, 190), (255, 90, 70), (200, 20, 20)), (50, 4, 4), (0, 0, 0, 170)),
    'r6': (((210, 255, 250), (90, 240, 220), (20, 170, 160)), (4, 40, 40), (0, 0, 0, 170)),
    'silver':(((255, 255, 255), (222, 228, 236), (150, 160, 175)), (24, 26, 34), (0, 0, 0, 170)),
}

def text(img, lang, t, box, st='gold', it=0, hmul=.74, ol=.10, al='c'):
    x0, y0, x1, y1 = box; W, H = x1 - x0, y1 - y0
    cjk = lang in ('ko', 'ja')
    size = int(H * 2)
    while size > 6:
        f = font(lang, size); bb = f.getbbox(t); cb = f.getbbox({'ko': '한', 'ja': '漢'}.get(lang, 'H'))
        if bb[2] - bb[0] + size * (abs(it) + 2 * ol) <= W and cb[3] - cb[1] <= H * hmul + 1: break
        size -= 1
    f = font(lang, size); bb = f.getbbox(t); tw, th = bb[2] - bb[0], bb[3] - bb[1]
    pad = int(size * .6); cw, ch = tw + 2 * pad, th + 2 * pad
    grad, oc, sh = STY[st]; sw = max(1, int(size * ol)) if oc else 0
    mask = Image.new('L', (cw, ch), 0); ImageDraw.Draw(mask).text((pad - bb[0], pad - bb[1]), t, font=f, fill=255)
    omask = Image.new('L', (cw, ch), 0)
    if sw: ImageDraw.Draw(omask).text((pad - bb[0], pad - bb[1]), t, font=f, fill=255, stroke_width=sw, stroke_fill=255)
    # gradient fill
    g = np.zeros((ch, cw, 3), np.float32)
    for y in range(ch):
        v = min(1, max(0, (y - pad) / max(1, th)))
        c = np.array(grad[0]) * (1 - v * 2) + np.array(grad[1]) * (v * 2) if v < .5 else np.array(grad[1]) * (2 - v * 2) + np.array(grad[2]) * (v * 2 - 1)
        g[y, :] = c
    lay = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    if sh:
        s = Image.new('RGBA', (cw, ch), sh[:3] + (0,)); s.putalpha(omask if sw else mask)
        s = s.filter(ImageFilter.GaussianBlur(max(1, size * .04)))
        a = np.array(s); a[:, :, 3] = (a[:, :, 3] * sh[3] / 255).astype(np.uint8); s = Image.fromarray(a)
        off = max(1, int(size * .07)); lay.alpha_composite(s, (0, off))
    if sw:
        o = Image.new('RGBA', (cw, ch), oc + (255,)); o.putalpha(omask); lay.alpha_composite(o)
    fi = Image.fromarray(g.astype(np.uint8)).convert('RGBA'); fi.putalpha(mask); lay.alpha_composite(fi)
    if it:  # italic shear
        lay = lay.transform(lay.size, Image.AFFINE, (1, it, -it * ch / 2, 0, 1, 0), Image.BICUBIC)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    if al == 'l': cx = x0 + cw / 2 - pad + 2
    img.alpha_composite(lay, (int(cx - cw / 2), int(cy - ch / 2 + (size * .02))))

def build(path, regs, lang):
    src = R + '/img/' + path; im = Image.open(src).convert('RGBA'); a = np.array(im)
    for r in regs:
        for b in r.get('erase', [r['box']]): fill(a, b, r.get('fill', 'h'), r.get('pct', (12, 40)))
    im = Image.fromarray(a)
    for r in regs:
        t = r['t'] if isinstance(r['t'], str) else r['t'].get(lang)
        if t is None: t = S.T[r['t_key']][lang] if 't_key' in r else None
        if t: text(im, lang, t, r.get('tbox', r['box']), r.get('st', 'gold'), r.get('it', 0), r.get('h', .74), r.get('ol', .10), r.get('al', 'c'))
    out = R + '/img/l/' + lang + '/' + path; os.makedirs(os.path.dirname(out), exist_ok=True)
    keep_alpha = Image.open(src).mode in ('RGBA', 'LA', 'P')
    (im if keep_alpha else im.convert('RGB')).save(out, 'WEBP', quality=86, method=6)
    return out

if __name__ == '__main__':
    only = os.environ.get('ONLY')
    for path, regs in S.SPEC.items():
        if only and only not in path: continue
        for lang in LANGS:
            regs2 = [dict(r, t=(S.T[r['t']][lang] if isinstance(r['t'], str) and r['t'] in S.T else r['t'])) for r in regs]
            build(path, regs2, lang)
    # list for lang/i18n.js
    js = R + '/lang/imgs.js'
    open(js, 'w').write('// generated by tools/img_l10n.py – pictures that have a translated copy in img/l/<lang>/\nwindow.TE_IMGL=' + json.dumps(sorted(S.SPEC)) + ';\n')
    print('done', len(S.SPEC), 'pictures ×', LANGS)
