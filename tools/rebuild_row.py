"""rebuild_row.py – v16-28: a row with 5 poses glued by their glows (Captain Clutch row 4) -> pick 4 poses by
sheet x-ranges, soft-fade the edges where a neighbour's glow was cut, optional bottom fade of props cut by the sheet
(lever pedestal). Rewrites that row in out/full_<id>.png (run fix_closeup.py after it for close-up rows).
usage: python3 rebuild_row.py <sheet.png> <id> <row> x0-x1[:fl][:fr][:pX] ...   (4 ranges; fl/fr = fade left/right edge,
       pX = fade the bottom 34 px right of sheet x=X)
"""
import sys, numpy as np
from PIL import Image
import atlas_rare as R
src, hid, row = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = np.asarray(Image.open(src).convert('RGB')).astype(float)
y0 = row * 256
band = R.unmix_all(im[y0:y0 + 256])
F = Image.open(f'out/full_{hid}.png'); CW = 384
for c, spec in enumerate(sys.argv[4:8]):
    q = spec.split(':'); a, b = map(int, q[0].split('-'))
    cr = band[:, a:b].copy(); w = b - a
    if 'fl' in q: cr[:, :30, 3] *= np.linspace(0, 1, 30)[None, :]
    if 'fr' in q: cr[:, -30:, 3] *= np.linspace(1, 0, 30)[None, :]
    for t in q:
        if t.startswith('p'):
            px = int(t[1:]) - a
            cr[-34:, px:, 3] *= np.linspace(1, 0, 34)[:, None]
    ys = np.where((cr[..., 3] > 128).any(1))[0]; top = 248 - ys.max()
    cell = Image.new('RGBA', (CW, 256))
    img = Image.fromarray(cr.astype(np.uint8), 'RGBA')
    cell.alpha_composite(img.crop((0, max(0, -top), w, 256)), ((CW - w) // 2, max(0, top)))
    F.paste(cell, (c * CW, row * 256))
F.save(f'out/full_{hid}.png')
