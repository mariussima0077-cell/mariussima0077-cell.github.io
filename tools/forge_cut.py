import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage

# v16-388 THE FORGE: Marius' pictures (img/sheets/forge/) -> img/forge/*.webp + img/ui7/m_forge.webp
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
U = R + '/img/sheets/forge/'
OUT = R + '/img/forge/'
os.makedirs(OUT, exist_ok=True)


def key(path, pockets=True):
    im = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    # distance from pure chroma green
    d = np.sqrt(r**2 + (255 - g)**2 + b**2)
    bgish = d < 150
    lab, k = ndimage.label(bgish)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    pure = d < 30
    lp, kp = ndimage.label(pure)
    if kp and pockets:
        sz = ndimage.sum(pure, lp, range(1, kp + 1))
        big = np.isin(lp, np.where(sz > 150)[0] + 1)
        bg = bg | big
    # soft edge: only near the background region
    near = ndimage.binary_dilation(bg, iterations=3)
    a = np.where(bg, 0.0, 1.0)
    soft = near & ~bg
    a = np.where(soft, np.clip((d - 60) / 140, 0, 1), a)
    a = np.where(bg, np.clip((d - 110) / 60, 0, 1) * 0, a)
    gsp = np.where(near, np.minimum(g, np.maximum(r, b) + 15), g)
    out = np.dstack([r, gsp, b, a * 255]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def fit(im, size, pad=0.06):
    bb = im.getbbox()
    im = im.crop(bb)
    w, h = im.size
    s = max(w, h)
    S = int(s * (1 + 2 * pad))
    c = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    c.paste(im, ((S - w) // 2, (S - h) // 2), im)
    return c.resize((size, size), Image.LANCZOS)


def components(im, n):
    a = np.asarray(im)[..., 3] > 40
    a = ndimage.binary_dilation(a, iterations=12)
    lab, k = ndimage.label(a)
    sizes = ndimage.sum(a, lab, range(1, k + 1))
    idx = np.argsort(sizes)[::-1][:n] + 1
    boxes = []
    for i in idx:
        sl = ndimage.find_objects((lab == i).astype(int))[0]
        boxes.append((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop))
    # order rows then columns
    boxes.sort(key=lambda b: (round(((b[1] + b[3]) / 2) / (im.size[1] / 3)), b[0]))
    return boxes


def grid_cut(path, n, names, size, keep=()):
    im = key(path)
    im2 = key(path, False)
    for nm, b in zip(names, components(im, n)):
        fit((im2 if nm in keep else im).crop(b), size).save(OUT + nm + '.webp', quality=90)


grid_cut(U + 'tools_1.webp', 6, ['tool_m5_0', 'tool_m5_1', 'tool_m5_2', 'tool_m5_3', 'tool_m5_4', 'tool_m5_5'], 256)
grid_cut(U + 'tools_2.webp', 4, ['tool_m5_6', 'tool_m5_7', 'tool_m5_8', 'tool_m5_9'], 256, keep=())
grid_cut(U + 'blueprints.webp', 6, ['bp_1', 'bp_2', 'bp_3', 'bp_4', 'bp_5', 'bp_6'], 256, keep=())
fit(key(U + 'molten.webp'), 256, 0.03).save(OUT + 'molten.webp', quality=90)
fit(key(U + 'slot.webp'), 256, 0.0).save(OUT + 'slot.webp', quality=92)
fit(key(U + 'golem_concept.webp'), 512, 0.02).save(OUT + 'golem.webp', quality=90)
# banner: crop the band on grey
ban = Image.open(U + 'banner.webp').convert('RGB')
arr = np.asarray(ban).astype(int)
diff = np.abs(arr - arr[5, 5]).sum(2) > 40
rows = np.where(diff.mean(1) > 0.3)[0]
cols = np.where(diff.mean(0) > 0.3)[0]
ban.crop((cols[0], rows[0], cols[-1] + 1, rows[-1] + 1)).resize((1100, 143), Image.LANCZOS).save(R + '/img/ui7/m_forge.webp', quality=90)
Image.open(U + 'forge_bg.webp').convert('RGB').save(OUT + 'forge_bg.webp', quality=82)
print(sorted(os.listdir(OUT)))
