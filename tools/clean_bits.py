"""clean_bits.py – v16-28: the next row's head tops (helmet/cap/hair) reach 2-10 px over the sheet's row line and show
as small arcs under the feet -> remove small separate pieces that sit entirely in the bottom 30 px of a cell.
usage: python3 clean_bits.py <id> ...   (out/full_<id>.png, rewrites out/sp_<id>.webp)"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage as nd
CW = 384
for hid in sys.argv[1:]:
    F = np.asarray(Image.open(f'out/full_{hid}.png')).copy(); n0 = 0
    for r in range(F.shape[0] // 256 - 1):        # last row has no row under it (keeps the tip-row sparks)
        for c in range(4):
            a = F[r * 256:(r + 1) * 256, c * CW:(c + 1) * CW, 3]
            lab, n = nd.label(a > 8)
            for i, sl in enumerate(nd.find_objects(lab), 1):
                if sl[0].start >= 226 and (lab[sl] == i).sum() < 1500:
                    a[sl][lab[sl] == i] = 0; n0 += 1
    Image.fromarray(F).save(f'out/full_{hid}.png')
    Fi = Image.fromarray(F); R = F.shape[0] // 256; A = Image.new('RGBA', (4 * 288, R * 192))
    for r in range(R):
        for k in range(4): A.alpha_composite(Fi.crop((k * CW, r * 256, (k + 1) * CW, (r + 1) * 256)).resize((288, 192), Image.LANCZOS), (k * 288, r * 192))
    A.save(f'out/sp_{hid}.webp', quality=88, method=6); print(hid, 'pieces removed:', n0)
