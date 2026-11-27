# v16-394 (Marius 27 nov): pictures that replace UI drawn in code
#   img/sheets/ui11/*.webp (Marius' ChatGPT pictures) -> img/ui11/
#   crew_slot.webp (empty bay "+") · vip_card.webp (purple 9-slice card) · tog_on / tog_off.webp · settings_h.webp (941x230 header)
import os
import numpy as np
from PIL import Image
from scipy import ndimage
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
S, O = R + '/img/sheets/ui11/', R + '/img/ui11/'
os.makedirs(O, exist_ok=True)


def key(path):
    im = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    d = np.sqrt(r ** 2 + (255 - g) ** 2 + b ** 2)
    lab, _ = ndimage.label(d < 150)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    near = ndimage.binary_dilation(bg, iterations=3)
    a = np.where(bg, 0.0, 1.0)
    a = np.where(near & ~bg, np.clip((d - 60) / 140, 0, 1), a)
    gsp = np.where(near, np.minimum(g, np.maximum(r, b) + 15), g)
    return Image.fromarray(np.dstack([r, gsp, b, a * 255]).astype(np.uint8), 'RGBA')


def tight(im):
    return im.crop(im.getbbox())


c = tight(key(S + 'crew_slot.webp')); c.resize((200, round(200 * c.size[1] / c.size[0])), Image.LANCZOS).save(O + 'crew_slot.webp', quality=88)
v = tight(key(S + 'vip_card.webp')); v.resize((v.size[0] // 2, v.size[1] // 2), Image.LANCZOS).save(O + 'vip_card.webp', quality=88)
t = key(S + 'toggles.webp'); W = t.size[0]
for nm, box in [('tog_on', (0, 0, W // 2, t.size[1])), ('tog_off', (W // 2, 0, W, t.size[1]))]:
    p = tight(t.crop(box)); p.resize((180, round(180 * p.size[1] / p.size[0])), Image.LANCZOS).save(O + nm + '.webp', quality=90)
ban = Image.open(S + 'settings_banner.webp').convert('RGB'); arr = np.asarray(ban).astype(int)
diff = np.abs(arr - arr[5, 5]).sum(2) > 40
rows = np.where(diff.mean(1) > 0.3)[0]; cols = np.where(diff.mean(0) > 0.3)[0]
ban.crop((cols[0], rows[0], cols[-1] + 1, rows[-1] + 1)).resize((941, 230), Image.LANCZOS).save(O + 'settings_h.webp', quality=88)
for f in sorted(os.listdir(O)): print(f, Image.open(O + f).size)
# the little gems in the middle of the top / bottom edge would stretch in a 9-slice: cover them with plain border
im = Image.open(O + 'vip_card.webp').convert('RGBA'); W, H = im.size; cx, w = W // 2, 26
for y0, y1 in [(0, 48), (H - 48, H)]:
    im.paste(im.crop((int(W * .3), y0, int(W * .3) + 2 * w, y1)), (cx - w, y0))
im.save(O + 'vip_card.webp', quality=88)
