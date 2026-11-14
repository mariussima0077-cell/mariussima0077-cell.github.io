"""fix_closeup.py – v16-24: a row drawn closer (legs cut by the sheet) -> scale the pose down to idle size
(head tops aligned) and put the idle legs under it. Frames listed in J are only scaled (full body, e.g. a jump)
and stand on the ground. Works on out/full_<id>.png, rewrites out/sp_<id>.webp.
usage: python3 fix_closeup.py <id> <row> <scale> [jump frames, e.g. 3 or -] [only these frames, e.g. 0] [--blend]
"""
from PIL import Image; import numpy as np, sys
hid = sys.argv[1]; R = int(sys.argv[2]); s = float(sys.argv[3])
BLEND = '--blend' in sys.argv; sys.argv = [a for a in sys.argv if a != '--blend']
J = [int(x) for x in sys.argv[4].split(',')] if len(sys.argv) > 4 and sys.argv[4] != '-' else []
ONLY = [int(x) for x in sys.argv[5].split(',')] if len(sys.argv) > 5 else [0, 1, 2, 3]   # v16-28
F = Image.open(f'out/full_{hid}.png'); CW = 384
def box(im):
    a = np.asarray(im)[..., 3] > 128; ys, xs = np.where(a); return ys.min(), ys.max()
def cx(im, y0, y1):
    a = np.asarray(im)[y0:y1, :, 3] > 128; xs = np.where(a.any(0))[0]; return (xs.min() + xs.max()) / 2
idle = F.crop((0, 0, CW, 256)); it, ib = box(idle)
for c in ONLY:
    fr = F.crop((c * CW, R * 256, (c + 1) * CW, (R + 1) * 256)); ft, fb = box(fr)
    t = fr.resize((round(CW * s), round(256 * s)), Image.LANCZOS)
    out = Image.new('RGBA', (CW, 256))
    if c in J:                                   # full body: keep it standing on the ground
        out.alpha_composite(t, ((CW - t.width) // 2, 248 - round(fb * s)))
    else:
        y = it - round(ft * s)                   # head tops aligned
        cut = y + round(fb * s) - 4              # where the sheet cut the legs
        O = 14 if BLEND else 0                   # v16-29: legs start 14 px higher, pose bottom fades into them (no seam)
        legs = idle.crop((0, cut - O, CW, 256))
        lx = cx(idle, cut, cut + 14); px = cx(t, round(fb * s) - 18, round(fb * s) - 4)
        out.alpha_composite(legs, (0, cut - O))
        if BLEND:
            ta = np.asarray(t).copy().astype(float); b = round(fb * s)
            ta[b - O - 4:b + 1, :, 3] *= np.linspace(1, 0, O + 5)[:, None]
            t = Image.fromarray(ta.astype(np.uint8), 'RGBA')
        out.alpha_composite(t, (round(lx - px), y))
    F.paste(out, (c * CW, R * 256))
F.save(f'out/full_{hid}.png')
A = Image.new('RGBA', (4 * 288, 6 * 192))
for r in range(6):
    for c in range(4): A.alpha_composite(F.crop((c * CW, r * 256, (c + 1) * CW, (r + 1) * 256)).resize((288, 192), Image.LANCZOS), (c * 288, r * 192))
A.save(f'out/sp_{hid}.webp', quality=88, method=6)
