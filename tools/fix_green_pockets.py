"""fix_green_pockets.py – v16-31: Uncommon guards (dark-emerald accents, cut with atlas_drivers.py).
1) small pockets of the bright key green left between arm and body -> transparent (the emerald accents are dark, g < ~170, so they stay);
2) optional: take some cells from another cut (e.g. atlas_rare.py, better for glows over green) and pull the green out of the glow.
Works on out/full_<id>.png, rewrites out/sp_<id>.webp.
usage: python3 fix_green_pockets.py <id> [<other_full.png> <row:col,col> ]
"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage as nd
hid = sys.argv[1]; CW = 384
F = np.asarray(Image.open(f'out/full_{hid}.png')).astype(float)
r, g, b, a = F[..., 0], F[..., 1], F[..., 2], F[..., 3]
key = (g > 175) & (g - np.maximum(r, b) > 110) & (a > 0)
key = nd.binary_dilation(key, iterations=1) & (g - np.maximum(r, b) > 60)
F[key, 3] = 0
print('green pocket px removed:', int(key.sum()))
if len(sys.argv) > 3:
    O = np.asarray(Image.open(sys.argv[2])).astype(float)
    row, cols = sys.argv[3].split(':')
    row = int(row)
    for c in map(int, cols.split(',')):
        ys, xs = slice(row * 256, row * 256 + 256), slice(c * CW, c * CW + CW)
        cell = O[ys, xs].copy(); mine = F[ys, xs].copy()
        # glow = bright greenish pixels of this cut (red/blue light mixed with the green screen); the body (dark emerald accents) stays
        glow = (mine[..., 1] > np.maximum(mine[..., 0], mine[..., 2]) + 15) & (mine[..., 1] > 150)
        glow = nd.binary_dilation(glow, iterations=1) & ~((mine[..., 1] < 150) & (mine[..., 3] > 240))
        nc = np.where(glow[..., None], cell, mine)
        R_, G_, B_ = nc[..., 0], nc[..., 1], nc[..., 2]
        mx = np.maximum(np.maximum(R_, G_), B_); mn = np.minimum(np.minimum(R_, G_), B_); d = mx - mn + 1e-6
        hue = np.where(mx == R_, ((G_ - B_) / d) % 6, np.where(mx == G_, (B_ - R_) / d + 2, (R_ - G_) / d + 4)) * 60
        ol = glow & (hue > 35) & (hue < 160)   # olive / yellow-green light -> red
        nc[..., 0] = np.where(ol, np.maximum(R_, G_), R_); nc[..., 1] = np.where(ol, B_ + (G_ - B_) * .2, G_)
        F[ys, xs] = nc
full = Image.fromarray(F.clip(0, 255).astype(np.uint8), 'RGBA'); full.save(f'out/full_{hid}.png')
R = F.shape[0] // 256; cw2 = CW * 3 // 4
A = Image.new('RGBA', (4 * cw2, R * 192))
for rr in range(R):
    for c in range(4):
        A.alpha_composite(full.crop((c * CW, rr * 256, c * CW + CW, rr * 256 + 256)).resize((cw2, 192), Image.LANCZOS), (c * cw2, rr * 192))
A.save(f'out/sp_{hid}.webp', quality=88, method=6)
