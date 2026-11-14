"""fade_cell.py – v16-24: an effect the sheet cut square at the frame border -> soft oval fade (character in the middle stays).
usage: python3 fade_cell.py <id> <row> <col>   (out/full_<id>.png, rewrites out/sp_<id>.webp)"""
from PIL import Image; import numpy as np, sys
hid, R, C = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); CW = 384
F = Image.open(f'out/full_{hid}.png'); a = np.asarray(F).astype(float)
cell = a[R*256:(R+1)*256, C*CW:(C+1)*CW]
al = cell[..., 3] > 30; ys, xs = np.where(al)
cy, cx = (ys.min()+ys.max())/2, (xs.min()+xs.max())/2; ry, rx = (ys.max()-ys.min())/2, (xs.max()-xs.min())/2
yy, xx = np.mgrid[0:256, 0:CW]; d = np.sqrt(((yy-cy)/ry)**2 + ((xx-cx)/rx)**2)
k = np.clip((1.12 - d)/.4, 0, 1)
k = np.where(yy > ys.max()-40, np.maximum(k, (yy-(ys.max()-40))/40), k)   # feet keep full strength
cell[..., 3] *= np.clip(k, 0, 1)
F = Image.fromarray(a.clip(0,255).astype(np.uint8), 'RGBA'); F.save(f'out/full_{hid}.png')
A = Image.new('RGBA', (4*288, 6*192))
for r in range(6):
    for c in range(4): A.alpha_composite(F.crop((c*CW, r*256, (c+1)*CW, (r+1)*256)).resize((288,192), Image.LANCZOS), (c*288, r*192))
A.save(f'out/sp_{hid}.webp', quality=88, method=6)
