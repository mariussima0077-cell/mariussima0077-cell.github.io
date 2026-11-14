"""fix_purple_halo.py – v16-33: Epic guards. Purple glows over the green screen come out of the unmix with a grey-blue halo
(the semi-transparent edge of the glow). Those see-through grey/blue pixels -> purple (same brightness); opaque pixels untouched.
Works on out/full_<id>.png, rewrites out/sp_<id>.webp.   usage: python3 fix_purple_halo.py <id> [<id> ...]
"""
import sys, numpy as np
from PIL import Image
CW = 384
for hid in sys.argv[1:]:
    F = np.asarray(Image.open(f'out/full_{hid}.png')).astype(float)
    r, g, b, a = F[..., 0], F[..., 1], F[..., 2], F[..., 3]
    mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b); d = mx - mn + 1e-6
    hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    sat = d / (mx + 1e-6)
    halo = (a > 4) & (a < 225) & ((sat < .28) | ((hue > 160) & (hue < 255))) & (mx > 60)
    v = mx
    F[..., 0] = np.where(halo, v * .80, r); F[..., 1] = np.where(halo, v * .40, g); F[..., 2] = np.where(halo, v, b)
    print(hid, 'halo px:', int(halo.sum()))
    full = Image.fromarray(F.clip(0, 255).astype(np.uint8), 'RGBA'); full.save(f'out/full_{hid}.png')
    R = F.shape[0] // 256; cw2 = CW * 3 // 4
    A = Image.new('RGBA', (4 * cw2, R * 192))
    for rr in range(R):
        for c in range(4):
            A.alpha_composite(full.crop((c * CW, rr * 256, c * CW + CW, rr * 256 + 256)).resize((cw2, 192), Image.LANCZOS), (c * cw2, rr * 192))
    A.save(f'out/sp_{hid}.webp', quality=88, method=6)
