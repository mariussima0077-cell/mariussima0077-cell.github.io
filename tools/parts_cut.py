"""parts_cut.py – v16-129: Marius' 6 garage-part icons → img/ui12/pk_<k>.webp 160x160 + Cash Roulette banner → img/ui9/evb_cash.webp 900x360.
Ranger / Support / Builder glows are green-ish → only pure chroma green connected to the border is removed, the glow edge is despilled."""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
im = np.asarray(Image.open('img/sheets/parts/parts_src.png').convert('RGB')).astype(int)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
green = (g > 200) & (r < 90) & (b < 90)            # pure chroma green only
soft = (g > 150) & (g > r + 80) & (g > b + 80)      # green-ish halo (partly transparent)
lab, n = nd.label(green | soft)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(edge))
# alpha: full green → 0, halo → by how "green" it is
gx = np.clip((g - np.maximum(r, b) - 60) / 120, 0, 1)
a = np.where(bg, (1 - gx) * 255 * (~green), 255).astype(float)
a = np.asarray(Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.GaussianBlur(.8))).astype(float)
rgb = im.copy().astype(float)
m = a < 250
rgb[..., 1] = np.where(m, np.minimum(g, np.maximum(r, b) + 40), g)   # despill the halo
fg = a > 30
lab2, k = nd.label(nd.binary_closing(fg, iterations=4))
sizes = nd.sum(fg, lab2, range(1, k + 1)); big = [i + 1 for i in np.argsort(sizes)[::-1][:6]]
boxes = [nd.find_objects((lab2 == i).astype(int))[0] for i in big]
boxes.sort(key=lambda s: (s[0].start > 450, s[1].start))
for nm, (ys, xs) in zip(['tank', 'warrior', 'ranger', 'mage', 'support', 'bk'], boxes):
    t = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), a]).astype(np.uint8)[ys, xs], 'RGBA')
    s = int(max(t.size) * 1.04); c = Image.new('RGBA', (s, s)); c.paste(t, ((s - t.width) // 2, (s - t.height) // 2))
    c.resize((160, 160), Image.LANCZOS).save('img/ui12/pk_%s.webp' % nm, quality=92, method=6); print(nm, t.size)
# banner: find the gold frame band (non-navy rows), crop to 2.5:1, resize 900x360
B = np.asarray(Image.open('img/sheets/parts/cash_banner_src.png').convert('RGB')).astype(int)
br = (B.max(-1) - B.min(-1) > 60) | (B.sum(-1) > 250)
rows = np.nonzero(br.mean(1) > .5)[0]; cols = np.nonzero(br.mean(0) > .5)[0]
y0, y1, x0, x1 = rows.min(), rows.max(), cols.min(), cols.max()
Image.fromarray(B[y0:y1 + 1, x0:x1 + 1].astype(np.uint8)).resize((900, 360), Image.LANCZOS).save('img/ui9/evb_cash.webp', quality=88, method=6)
print('banner', (x0, y0, x1, y1))
