"""fix_d4_3_phantom.py – v16-28 Phantom Pilot: (1) row 4 frame 3 = see-through ghost drawn over the green ->
olive-green tint -> pulled back to gold (green never above 0.9 × red); (2) row 2 frame 2: a stray teal glow dot on the
trousers (from the sheet) -> painted dark like the trousers. Run after atlas_rare.py; rewrites out/sp_d4_3.webp."""
import numpy as np
from PIL import Image
F = np.asarray(Image.open('out/full_d4_3.png')).astype(float); CW = 384
c = F[4 * 256:5 * 256, 2 * CW:3 * CW]
c[..., 1] = np.minimum(c[..., 1], c[..., 0] * .9)
d = F[2 * 256:3 * 256, CW:2 * CW]
y0, y1, x0, x1 = 60, 200, 150, 300
s = d[y0:y1, x0:x1]
teal = (s[..., 1] > s[..., 0] + 15) & (s[..., 2] > s[..., 0] + 5) & (s[..., 3] > 0)
s[teal, :3] = [34, 31, 30]
print('teal px fixed:', int(teal.sum()))
Image.fromarray(F.clip(0, 255).astype(np.uint8)).save('out/full_d4_3.png')
Fi = Image.open('out/full_d4_3.png'); A = Image.new('RGBA', (4 * 288, 6 * 192))
for r in range(6):
    for k in range(4): A.alpha_composite(Fi.crop((k * CW, r * 256, (k + 1) * CW, (r + 1) * 256)).resize((288, 192), Image.LANCZOS), (k * 288, r * 192))
A.save('out/sp_d4_3.webp', quality=88, method=6)
