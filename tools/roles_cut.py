"""roles_cut.py – v16-127: Marius' 5 role badges (TANK, WARRIOR, RANGER, MAGE, SUPPORT) → img/ui12/role_<k>.webp 160x160.
The RANGER and SUPPORT centres are green themselves → only the green connected to the picture border is removed
(flood fill from the edges), never the green inside the gold rim."""
import numpy as np
from PIL import Image
from scipy import ndimage as nd
im = np.asarray(Image.open('img/sheets/roles/roles_src.png').convert('RGB')).astype(int)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
green = (g > 150) & (g > r + 60) & (g > b + 60)
lab, n = nd.label(green)
edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(edge))
fg = ~bg
fg = nd.binary_opening(fg, iterations=2)
lab2, k = nd.label(fg)
sizes = nd.sum(fg, lab2, range(1, k + 1))
big = [i + 1 for i in np.argsort(sizes)[::-1][:5]]
boxes = [nd.find_objects((lab2 == i).astype(int))[0] for i in big]
boxes.sort(key=lambda s: (s[0].start > 450, s[1].start))   # top row left→right, then bottom row
names = ['tank', 'warrior', 'ranger', 'mage', 'support']
for nm, (ys, xs) in zip(names, boxes):
    a = np.zeros(im.shape[:2], np.uint8); a[fg] = 255
    a = np.asarray(Image.fromarray(a).filter(__import__('PIL.ImageFilter', fromlist=['x']).GaussianBlur(1.2)))
    rgba = np.dstack([im, a]).astype(np.uint8)[ys, xs]
    # despill the outer edge: green fringe → gold-ish
    e = rgba[..., :3].astype(int); m = (e[..., 1] > e[..., 0] + 30) & (rgba[..., 3] < 250)
    e[m, 1] = (e[m, 0] + e[m, 2]) // 2 + 20; rgba[..., :3] = np.clip(e, 0, 255)
    t = Image.fromarray(rgba, 'RGBA'); s = max(t.size); c = Image.new('RGBA', (s, s)); c.paste(t, ((s - t.width) // 2, (s - t.height) // 2))
    c.resize((160, 160), Image.LANCZOS).save('img/ui12/role_%s.webp' % nm, quality=92, method=6)
    print(nm, t.size)
