#!/usr/bin/env python3
"""v16-118: ONE close (X) and ONE back (<) button for the whole game, built from Marius' own
button art (img/ui8/btn_red / btn_blue): (red = close, grey + gold arrow = back) both gold ends of the long button glued together
-> small square button, then a white glyph with dark outline on the glass.
Output: img/ui8/ic_close.webp, img/ui8/ic_back.webp"""
from PIL import Image, ImageDraw, ImageFilter

CUT = 66      # px taken from each end of the long button

def compact(src):
    im = Image.open(src).convert('RGBA'); w, h = im.size
    o = Image.new('RGBA', (CUT * 2, h), (0, 0, 0, 0))
    o.paste(im.crop((0, 0, CUT, h)), (0, 0)); o.paste(im.crop((w - CUT, 0, w, h)), (CUT, 0))
    return o

def glyph(im, kind):
    w, h = im.size; S = 4
    big = Image.new('RGBA', (w * S, h * S), (0, 0, 0, 0)); d = ImageDraw.Draw(big)
    cx, cy = w * S / 2, h * S / 2 - 2 * S; r = h * S * 0.18
    fg = (255, 255, 255, 255)
    if kind == 'x':
        segs = [((cx - r, cy - r), (cx + r, cy + r)), ((cx - r, cy + r), (cx + r, cy - r))]
    else:  # gold hook arrow (the same sign as the back buttons in Marius' page headers)
        fg = (255, 206, 64, 255); y0 = cy + r * .25; x0 = cx - r * 1.05
        segs = [((cx + r, cy - r), (cx + r, y0 - r * .35)), ((cx + r, y0 - r * .35), (cx + r * .65, y0)),
                ((cx + r * .65, y0), (x0, y0)), ((x0, y0), (x0 + r * .6, y0 - r * .6)), ((x0, y0), (x0 + r * .6, y0 + r * .6))]
    for col, wd in (((20, 10, 0, 255), 15), (fg, 9)):
        for a, b in segs:
            d.line([a, b], fill=col, width=wd * S)
            for p in (a, b):
                d.ellipse([p[0] - wd / 2 * S, p[1] - wd / 2 * S, p[0] + wd / 2 * S, p[1] + wd / 2 * S], fill=col)
    g = big.resize((w, h), Image.LANCZOS)
    sh = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    sh.putalpha(g.split()[3].point(lambda v: int(v * .6)).filter(ImageFilter.GaussianBlur(2)))
    out = im.copy(); out.alpha_composite(sh, (0, 3)); out.alpha_composite(g); return out

if __name__ == '__main__':
    for kind, src, name in (('x', 'img/ui8/btn_red.webp', 'ic_close'), ('b', 'img/ui8/btn_grey.webp', 'ic_back')):
        glyph(compact(src), kind).save(f'img/ui8/{name}.webp', quality=90)
        print(name, 'ok')
