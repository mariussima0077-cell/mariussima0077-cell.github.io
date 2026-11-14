"""fix_gold_halo.py – v16-34: Legendary guards. Gold glows over the green screen come out lemon / yellow-green after the unmix,
and see-through dark parts (Ghost Gabriel's ghost frame) leave a muddy brown cloud.
 - see-through pixels (alpha < 235) with a yellow-green / green hue -> warm gold, same brightness;
 - see-through dark pixels (the muddy cloud) -> fainter.
Opaque pixels (body, uniform gold trims) are untouched.  Works on out/full_<id>.png, rewrites out/sp_<id>.webp.
usage: python3 fix_gold_halo.py <id> [<id> ...]
"""
import sys, numpy as np
from PIL import Image
CW = 384
MUD = [a for a in sys.argv[1:] if ':' in a]   # e.g. g4_2:4:2 = in that cell the brown cloud around the see-through ghost -> almost gone
for hid in [a for a in sys.argv[1:] if ':' not in a]:
    F = np.asarray(Image.open(f'out/full_{hid}.png')).astype(float)
    r, g, b, a = F[..., 0], F[..., 1], F[..., 2], F[..., 3]
    mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b); d = mx - mn + 1e-6
    hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    sat = d / (mx + 1e-6)
    semi = (a > 3) & (a < 235)
    # lemon / yellow-green (hue 46-110°, any alpha – the unmix keeps yellow almost opaque) -> warm gold 40-50°
    gold = (hue > 46) & (hue < 110) & (sat > .22) & (a > 3)
    hn = 40 + np.clip(hue - 46, 0, 64) * .16
    F[..., 0] = np.where(gold, mx, r); F[..., 2] = np.where(gold, mn, b)
    F[..., 1] = np.where(gold, mn + d * hn / 60, g)
    mud = semi & (mx < 110) & ~gold
    F[..., 3] = np.where(mud, a * .45, a)
    for m in MUD:
        h_, R_, C_ = m.split(':')
        if h_ != hid: continue
        R_, C_ = int(R_), int(C_); ys, xs = slice(R_ * 256, R_ * 256 + 256), slice(C_ * CW, C_ * CW + CW)
        c = F[ys, xs]; cr, cg, cb = c[..., 0], c[..., 1], c[..., 2]
        cmx = np.maximum(np.maximum(cr, cg), cb); cmn = np.minimum(np.minimum(cr, cg), cb); cd = cmx - cmn + 1e-6
        ch = np.where(cmx == cr, ((cg - cb) / cd) % 6, 0) * 60
        brown = (cmx == cr) & (ch < 34) & (c[..., 3] < 250)
        c[..., 3] = np.where(brown, c[..., 3] * .2, c[..., 3]); F[ys, xs] = c
    print(hid, 'gold px:', int(gold.sum()), 'mud px:', int(mud.sum()))
    full = Image.fromarray(F.clip(0, 255).astype(np.uint8), 'RGBA'); full.save(f'out/full_{hid}.png')
    R = F.shape[0] // 256; cw2 = CW * 3 // 4
    A = Image.new('RGBA', (4 * cw2, R * 192))
    for rr in range(R):
        for c in range(4):
            A.alpha_composite(full.crop((c * CW, rr * 256, c * CW + CW, rr * 256 + 256)).resize((cw2, 192), Image.LANCZOS), (c * cw2, rr * 192))
    A.save(f'out/sp_{hid}.webp', quality=88, method=6)
