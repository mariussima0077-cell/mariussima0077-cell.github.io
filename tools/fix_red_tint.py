"""fix_red_tint.py – v16-29: red/black characters (Mythic drivers): glow and smoke drawn over the green come out
olive / yellow-green -> on yellow/olive/green pixels only, green never above `k` × red in the listed rows (their costumes have no green).
usage: python3 fix_red_tint.py <id> <rows e.g. 4,5b> [k=0.9]   (out/full_<id>.png, rewrites out/sp_<id>.webp)"""
import sys, numpy as np
from PIL import Image
hid = sys.argv[1]; rows = sys.argv[2].split(',')   # '5b' = only the bottom 70 px of row 5 (feet flames, not the gold coin)
k = float(sys.argv[3]) if len(sys.argv) > 3 else .9
F = np.asarray(Image.open(f'out/full_{hid}.png')).astype(float); CW = 384
for q in rows:
    r = int(q.rstrip('b')); c = F[r * 256 + (186 if q.endswith('b') else 0):(r + 1) * 256]
    # only yellow / olive / green pixels (white hair, checkers, skin and grey stay as they are)
    m = (c[..., 1] - c[..., 2] > 25) & (c[..., 1] > .8 * c[..., 0])
    c[..., 1] = np.where(m, np.minimum(c[..., 1], c[..., 0] * k), c[..., 1])
    # see-through haze (smoke / glow edges) that came out brown-olive -> dark red
    h = ((c[..., 3] < 230) & (c[..., 1] - c[..., 2] > 20)) | ((c[..., 1] - c[..., 2] > 45) & (c[..., 2] < .35 * c[..., 0]))   # + opaque orange/olive haze (skin has more blue)
    c[..., 1] = np.where(h, np.minimum(c[..., 1], np.maximum(c[..., 2] + 8, c[..., 0] * .22)), c[..., 1])
Fi = Image.fromarray(F.clip(0, 255).astype(np.uint8)); Fi.save(f'out/full_{hid}.png'); R = F.shape[0] // 256
A = Image.new('RGBA', (4 * 288, R * 192))
for r in range(R):
    for q in range(4): A.alpha_composite(Fi.crop((q * CW, r * 256, (q + 1) * CW, (r + 1) * 256)).resize((288, 192), Image.LANCZOS), (q * 288, r * 192))
A.save(f'out/sp_{hid}.webp', quality=88, method=6)
