"""leg_v8.py – v16-364: the 5 new LEGENDARY heroes (Rivet, Kael, Spark, Mira, Lena), Marius 26 nov.
Their animations are small 4x4 ChatGPT sheets (4 frames per animation, skill 8) already cut on transparent
(img/sheets/legend/<name>/<anim>.png, feet aligned). Each 4-frame animation is stretched to 8 frames (every frame twice)
and packed with v8_hero.pack → img/hero/sp_<id>.webp (+ hd_<id>.webp idle at 2.4x), the skill effect sheets
(4x2 on black) → img/fx/lfx_<id>.webp, portraits from the concepts → img/hero/<id>.webp, <id>s.webp, splash_<id>.webp.
Prints the SPRD / HDM entries for battle.js.
usage: python3 tools/leg_v8.py
"""
import sys, os, json, numpy as np
from PIL import Image, ImageFilter, ImageDraw
sys.argv = sys.argv[:1]
sys.path.insert(0, os.path.dirname(__file__))
import v8_hero as V

L = {'m4_6': 'rivet', 'm4_7': 'kael', 'm4_8': 'spark', 'm4_9': 'mira', 'm4_10': 'lena'}
SRC = 'img/sheets/legend/%s/'

def strip(name, an):
    im = Image.open(SRC % name + an + '.png').convert('RGBA'); n = 8 if an == 'skill' else 4
    w = im.width // n
    return [im.crop((i * w, 0, (i + 1) * w, im.height)) for i in range(n)]

def ref(name):
    b = strip(name, 'idle')[0].getchannel('A').point(lambda q: 255 if q > 128 else 0).getbbox(); return b[3] - b[1]

def frames(name, rows, apu):
    s = V.OLDH / ref(name) * apu; out = []
    for fr in rows:
        cs = [np.asarray(f).astype(np.float32) for f in fr]
        ax, ay = V.torso_x(cs[0]), V.bottom(cs[0])
        o = []
        for f in fr:
            im = f.resize((round(f.width * s), round(f.height * s)), Image.LANCZOS); o.append((im, ax * s, ay * s))
        out.append(o)
    return out

def hero_rows(name):
    d2 = lambda L: [L[0], L[0], L[1], L[1], L[2], L[2], L[3], L[3]]
    h, k = strip(name, 'hit'), strip(name, 'ko')
    return [d2(strip(name, 'idle')), d2(strip(name, 'run')), d2(strip(name, 'attack')), strip(name, 'skill'),
            [h[0], h[0], h[1], h[1], k[0], k[1], k[2], k[3]], d2(strip(name, 'win'))]

def fx_atlas(src, out, ch=300):
    im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
    al = np.clip((im.max(-1) - 14) * 255 / 241, 0, 255)
    rgb = np.where(al[..., None] > 0, np.clip(im * 255 / np.maximum(al[..., None], 1), 0, 255), 0)
    a = Image.fromarray(np.dstack([rgb, al]).astype(np.uint8), 'RGBA'); W, H = a.size
    cs = [a.crop((c * W // 4, r * H // 2, (c + 1) * W // 4, (r + 1) * H // 2)) for r in range(2) for c in range(4)]
    bb = [c.getbbox() for c in cs]; x0 = min(b[0] for b in bb); y0 = min(b[1] for b in bb); x1 = max(b[2] for b in bb); y1 = max(b[3] for b in bb)
    for nm, h in ((out, ch), (out + '_low', ch // 2)):
        cw = round((x1 - x0) * h / (y1 - y0)); A = Image.new('RGBA', (cw * 4, h * 2))
        for i, c in enumerate(cs): A.paste(c.crop((x0, y0, x1, y1)).resize((cw, h), Image.LANCZOS), ((i % 4) * cw, (i // 4) * h))
        A.save('img/fx/%s.webp' % nm, quality=82, method=6)

def portraits(hid, concept, face):
    c = Image.open(concept).convert('RGB'); c.resize((768, 1152), Image.LANCZOS).save('img/hero/splash_%s.webp' % hid, quality=88)
    W, H = c.size; s = int(W * .62); x = int(W * face - s / 2); x = max(0, min(W - s, x)); y = int(H * .04)
    p = c.crop((x, y, x + s, y + s)).resize((256, 256), Image.LANCZOS); p.save('img/hero/%s.webp' % hid, quality=88)
    # silhouette like the others: dark blue-grey shape + big "?"
    arr = np.asarray(c.crop((x, y, x + s, y + s)).resize((256, 256))).astype(int); bg = np.median(arr[:6].reshape(-1, 3), 0)
    m = (np.abs(arr - bg).sum(-1) > 40).astype(np.uint8) * 255
    sil = Image.new('RGB', (256, 256), (28, 38, 52)); sil.paste(Image.new('RGB', (256, 256), (52, 66, 84)), mask=Image.fromarray(m).filter(ImageFilter.GaussianBlur(2)))
    d = ImageDraw.Draw(sil)
    try:
        from PIL import ImageFont; f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 120)
    except Exception: f = None
    d.text((128, 130), '?', fill=(90, 110, 135), anchor='mm', font=f); sil.save('img/hero/%ss.webp' % hid, quality=88)

if __name__ == '__main__':
    U = '/mnt/user-data/uploads/'
    CON = {'rivet': '44289ed5', 'kael': '90d334b2', 'spark': 'c5aed92e', 'mira': '0f0e33cd', 'lena': '68477eb5'}
    FX = {'rivet': '9e2b2ebb', 'kael': '7dfad19c', 'spark': '4cfafb89', 'mira': '9a8abbfe', 'lena': 'b2b4ae7c'}
    FACE = {'rivet': .5, 'kael': .5, 'spark': .5, 'mira': .5, 'lena': .5}
    out = {}; hd = {}
    for hid, name in L.items():
        for k, src in (('concept', CON[name]), ('fx', FX[name])):
            p = U + src + '-image.png'
            if os.path.exists(p): Image.open(p).save(SRC % name + k + '.webp', quality=90)
        m, sz = V.pack(frames(name, hero_rows(name), V.APU), 'img/hero/sp_%s.webp' % hid)
        m['ck'] = 5; m['pk'] = [5, 6, 7]
        h, _ = V.pack(frames(name, [hero_rows(name)[0]], V.APU * 2.4), 'img/hero/hd_%s.webp' % hid)
        fx_atlas(SRC % name + 'fx.webp', 'lfx_' + hid)
        portraits(hid, SRC % name + 'concept.webp', FACE[name])
        out[hid] = {'a': [m['ax'], 246], 'm': [round(m['ax'] + 95, 1), 120], 'v8': m}
        hd[hid] = {'cw': round(h['cw'] * 1), 'uw': round(h['uw'] / 2.4 * 1, 1), 'ax': round(h['ax'] / 2.4, 1), 'rows': [[r[0], r[1], round(r[2] / 2.4, 1), round(r[3] / 2.4, 1)] for r in h['rows']]}
        print(hid, name, sz)
    print('SPRD', json.dumps(out, separators=(',', ':')))
    print('HDM', json.dumps(hd, separators=(',', ':')))
