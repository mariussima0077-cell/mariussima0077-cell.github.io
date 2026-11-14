"""atlas_rare.py – v16-23: Rare drivers. Same cutting as atlas_drivers.py, but:
 - these sheets have NO green accents, so every greenish pixel is colour-unmixed (no green fringe in arm gaps / hair),
   and semi-transparent effects (Fiona's blue speed streak) become see-through instead of an opaque block;
 - optional vertical cut "row:x" (6-px transparent gap) to split a pose glued to its effect
   (Fiona row 4: her dash pose -> cell 1, the blue streak -> cell 2).
usage: python3 atlas_rare.py <sheet.png> <id> [row:x[:both]]
"""
import sys, numpy as np
import atlas_drivers as A

K = A.K
CUT = None

def unmix_all(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    gx = g - np.maximum(r, b)
    # v16-24: glow over the green (purple+green = grey-teal) -> estimate alpha assuming the glow's own green is
    # about half its strongest channel; ramps in only where green dominates, so skin/white stay opaque
    M = np.maximum(r, b)
    al = 1 - np.clip(gx / 30, 0, 1) * np.clip((g - .5 * M) / 246, 0, 1)
    al = np.where(gx > 150, 0, al)
    Al = np.clip(al, 1e-3, 1)[..., None]
    F = np.clip((a - (1 - Al) * K) / Al, 0, 255)
    m = np.maximum(F[..., 0], F[..., 2])
    F[..., 1] = np.minimum(F[..., 1], m + 30)   # kill any leftover green cast
    soft = al < .98                             # v16-24: glow/haze over the green -> no teal/grey-green tint
    F[..., 1] = np.where(soft, np.minimum(F[..., 1], m), F[..., 1])
    out = np.dstack([F, al * 255])
    if CUT and CUT[2] == 'both':                 # v16-24: two poses glued by their effects -> gap + soft fade both sides
        row, x, _ = CUT; y0 = row * 256
        out[y0:y0 + 256, x - 3:x + 3, 3] = 0
        out[y0:y0 + 256, x + 3:x + 33, 3] *= np.linspace(0, 1, 30)[None, :]
        out[y0:y0 + 256, x - 33:x - 3, 3] *= np.linspace(1, 0, 30)[None, :]
    elif CUT:
        row, x, _ = CUT
        y0 = row * 256
        out[y0:y0 + 256, x - 3:x + 3, 3] = 0
        # soft ends instead of a hard vertical edge: streak fades in on the right,
        # the ground trail under her feet fades out on the left (her hand above it is untouched)
        rr = np.clip((np.arange(x, x + 50) - x) / 50, 0, 1)
        out[y0:y0 + 256, x:x + 50, 3] *= rr[None, :]
        rl = np.clip((x - np.arange(x - 60, x)) / 60, 0, 1)
        out[y0 + 175:y0 + 256, x - 60:x, 3] *= rl[None, :]
    return out

A.unmix = unmix_all

if __name__ == '__main__':
    if len(sys.argv) > 3:
        q = sys.argv[3].split(':'); CUT = (int(q[0]), int(q[1]), q[2] if len(q) > 2 else 'fiona')
    A.run(sys.argv[1], sys.argv[2], [0, 256, 512, 768, 1024, 1280, 1536], 0)
