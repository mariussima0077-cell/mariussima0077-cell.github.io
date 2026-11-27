#!/usr/bin/env python3
"""Torque Empire – the game's own music (Marius 27 nov 2026: "trebuie adăugată o muzică pentru joc").
Fully synthesized with numpy (no samples, no outside material) → snd/garage.mp3 (garage map) and snd/battle.mp3 (battles + big raids).
Both are LOOPS: every tail (echo, reverb) wraps around to the start, and the last 8th note is a small "breath",
so the tiny gap an <audio loop> makes is not heard.
Usage: python3 tools/music_gen.py [garage|battle]      (needs numpy, scipy, ffmpeg)
"""
import sys, os, subprocess
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def lp(x, f, o=2): return sosfilt(butter(o, min(f, SR * .45), 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(SR * d)) / SR
def env(n, a=.004, r=.05):
    e = np.ones(n); na = max(1, min(n, int(a * SR))); nr = max(1, min(n, int(r * SR)))
    e[:na] *= np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e

class Mix:
    """Stereo loop buffer: everything added past the end wraps to the start (seamless loop)."""
    def __init__(self, dur):
        self.n = int(round(SR * dur)); self.L = np.zeros(self.n); self.R = np.zeros(self.n)
    def add(self, x, pos, g=1.0, pan=0.0):
        i = int(round(pos * SR)) % self.n
        gl = g * np.cos((pan + 1) * np.pi / 4) * 1.414; gr = g * np.sin((pan + 1) * np.pi / 4) * 1.414
        k = 0
        while k < len(x):
            m = min(len(x) - k, self.n - i)
            self.L[i:i + m] += gl * x[k:k + m]; self.R[i:i + m] += gr * x[k:k + m]
            k += m; i = 0
    def echo(self, x, pos, g, pan, dt, fb=.35, taps=4):
        for k in range(taps + 1):
            self.add(x, pos + k * dt, g * fb ** k, pan * (1 if k % 2 == 0 else -1))
    def render(self, path, drive=1.0, peak=.89):
        L, R = self.L, self.R
        # a little "room": two short wrapped delays, cross-fed
        for d, g in ((.031, .12), (.047, .09)):
            s = int(d * SR); L2 = np.roll(R, s) * g; R2 = np.roll(L, s) * g; L, R = L + lp(L2, 4000), R + lp(R2, 4000)
        L = hp(L, 28); R = hp(R, 28)
        m = max(np.abs(L).max(), np.abs(R).max()); L, R = L / m * drive, R / m * drive
        L, R = np.tanh(L * 1.25), np.tanh(R * 1.25)
        m = max(np.abs(L).max(), np.abs(R).max()); L, R = L / m * peak, R / m * peak
        rms = np.sqrt(np.mean((L ** 2 + R ** 2) / 2)); print(os.path.basename(path), 'sec %.2f' % (len(L) / SR), 'rms dBFS %.1f' % (20 * np.log10(rms)))
        wav = path[:-4] + '.wav'
        wavfile.write(wav, SR, (np.stack([L, R], 1) * 32767).astype(np.int16))
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '96k', '-joint_stereo', '1', path], check=True)
        os.remove(wav); print(' →', path, os.path.getsize(path) // 1024, 'KB')

rng = np.random.default_rng(11)
# ---------------------------------------------------------------- drums
def kick(deep=1.0, click=.5):
    t = tt(.34); f = 46 * deep + 120 * np.exp(-t * 34)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    c = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 220) * click
    return np.tanh(1.8 * s) + c * .25
def snare(tone=190, snap=1.0):
    t = tt(.24); n = bp(rng.standard_normal(len(t)), 1400, 8500) * np.exp(-t * 22) * snap
    b = np.sin(2 * np.pi * tone * t * (1 + .25 * np.exp(-t * 60))) * np.exp(-t * 30)
    return .7 * n + .55 * b
def clap():
    t = tt(.22); x = np.zeros(len(t))
    for d in (0, .011, .023, .034):
        i = int(d * SR); x[i:] += (rng.standard_normal(len(t) - i) * np.exp(-tt(.22)[:len(t) - i] * 34))
    return bp(x, 900, 5200) * .5
def hat(open_=False, bright=1.0):
    t = tt(.22 if open_ else .045); x = hp(rng.standard_normal(len(t)), 6500 * bright) * np.exp(-t * (16 if open_ else 95))
    return x
def shaker():
    t = tt(.07); return bp(rng.standard_normal(len(t)), 4500, 9500) * np.sin(np.pi * t / .07) ** 2
def clink(f=2140):
    """small metallic 'wrench on steel' ping – the garage flavour"""
    t = tt(.5); x = sum(np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) * a for r, d, a in ((1, 9, 1), (2.76, 14, .5), (5.4, 22, .25), (1.51, 12, .35)))
    return x * env(len(t), .001, .1)
def tom(f):
    t = tt(.3); return np.sin(2 * np.pi * np.cumsum(f * (1 + .6 * np.exp(-t * 20))) / SR) * np.exp(-t * 11)
def crash():
    t = tt(1.6); return hp(rng.standard_normal(len(t)), 4200) * np.exp(-t * 3.2) * .6
def riser(d):
    t = tt(d); x = bp(rng.standard_normal(len(t)), 800, 9000) * (t / d) ** 2.2; return x
# ---------------------------------------------------------------- pitched voices
def bass_pluck(n, d, bright=520):
    t = tt(d); f = midi(n)
    x = np.sin(2 * np.pi * f * t) + .45 * (2 * ((t * f) % 1) - 1) + .25 * np.sin(2 * np.pi * 2 * f * t)
    x = lp(x * np.exp(-t * 3.2), bright + 900 * np.exp(-3)) * env(len(t), .004, min(.06, d * .4))
    return np.tanh(x * 1.4)
def bass_saw(n, d, cut=700):
    t = tt(d); f = midi(n)
    x = (2 * ((t * f) % 1) - 1) + .6 * (2 * ((t * f * 1.006) % 1) - 1) + .8 * np.sin(2 * np.pi * f / 2 * t)
    return lp(x, cut) * env(len(t), .003, min(.03, d * .3)) * (.75 + .25 * np.exp(-t * 14))
def epiano(n, d):
    """soft electric piano: a few decaying partials + a bell tick"""
    t = tt(d); f = midi(n)
    x = (np.sin(2 * np.pi * f * t + .9 * np.sin(2 * np.pi * f * t) * np.exp(-t * 5)) * np.exp(-t * 2.4)
         + .28 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 4.5) + .12 * np.sin(2 * np.pi * 7 * f * t) * np.exp(-t * 26))
    return x * (1 + .06 * np.sin(2 * np.pi * 5.1 * t)) * env(len(t), .006, min(.12, d * .4))
def pluck(n, d, bright=1.0):
    t = tt(d); f = midi(n)
    tri = 2 * np.abs(2 * ((t * f) % 1) - 1) - 1
    x = tri * np.exp(-t * 5.5) + .35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 8) + .18 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 12) * bright
    return x * env(len(t), .003, min(.08, d * .4))
def organ(n, d):
    t = tt(d); f = midi(n)
    x = sum(np.sin(2 * np.pi * f * h * t) * a for h, a in ((1, 1), (2, .5), (3, .3), (4, .12)))
    return x * (1 + .05 * np.sin(2 * np.pi * 6.3 * t)) * env(len(t), .01, min(.05, d * .3))
def supersaw(notes, d, cut=2600, att=.008):
    t = tt(d); x = np.zeros(len(t))
    for n in notes:
        for dt in (-.011, -.005, 0, .006, .012):
            x += (2 * ((t * midi(n) * (1 + dt) + rng.random()) % 1) - 1) * .1
    return lp(x, cut) * env(len(t), att, min(.06, d * .35))
def brass(n, d, cut=2300):
    t = tt(d); f = midi(n) * (1 + .004 * np.sin(2 * np.pi * 5.6 * t) * np.minimum(1, t / .18))
    ph = np.cumsum(f) / SR
    x = (2 * (ph % 1) - 1) + .5 * (2 * ((ph * 1.005) % 1) - 1) + .35 * np.sign(np.sin(2 * np.pi * ph))
    return lp(x, cut) * env(len(t), .018, min(.07, d * .3)) * (.85 + .15 * np.exp(-t * 6))

# ================================================================ GARAGE (map) – relaxed funk, 104 BPM, 24 bars
def garage():
    BPM = 104; B = 60 / BPM; S = B / 4; BAR = 4 * B; NB = 24
    M = Mix(NB * BAR)
    sw = lambda s: s * S + (S * .16 if s % 2 else 0)            # light swing on the off 16ths
    # chords: root (bass), chord tones
    Am7 = (45, [57, 60, 64, 67]); D9 = (50, [57, 60, 64, 66]); F7 = (41, [57, 60, 64, 65]); G6 = (43, [59, 62, 64, 67])
    E7 = (40, [56, 59, 62, 64]); Em7 = (40, [59, 62, 64, 67]); Dm7 = (38, [57, 60, 62, 65]); C7M = (36, [55, 59, 60, 64])
    A = [Am7, D9, F7, G6, Am7, D9, F7, E7]
    Bs = [F7, G6, Em7, Am7, Dm7, G6, C7M, E7]
    prog = A + Bs + A
    for b, (root, ch) in enumerate(prog):
        t0 = b * BAR; sec = b // 8; last = b == NB - 1
        # --- drums
        for s in (0, 7, 10) if b % 2 == 0 else (0, 6, 10):
            if last and s == 10: continue
            M.add(kick(), t0 + sw(s), .60)
        for s in (4, 12):
            M.add(snare(200, .8), t0 + sw(s), .46); M.add(clap(), t0 + sw(s), .5, .1)
        if b % 4 == 3 and not last: M.add(snare(200, .5), t0 + sw(15), .22)
        for s in range(0, 16, 2):
            if last and s >= 14: break
            M.add(hat(), t0 + sw(s), .26 if s % 4 else .34, .25)
        for s in (3, 11) if sec != 1 else (3, 7, 11, 15):
            if last and s >= 14: break
            M.add(hat(), t0 + sw(s), .13, .25)
        if not last: M.add(hat(True), t0 + sw(14), .2, .25)
        if sec >= 1:
            for s in range(1, 16, 2):
                if last and s >= 13: break
                M.add(shaker(), t0 + sw(s), .16, -.35)
        # garage "clink" – a wrench tapping steel on the off-beat
        if b % 2 == 1: M.add(clink(2140 if b % 4 == 1 else 2540), t0 + sw(6), .11, .5)
        if b % 8 == 7 and not last:
            for k, f in enumerate((170, 140, 110)): M.add(tom(f), t0 + sw(12 + k), .4, -.3 + .3 * k)
        if b % 8 == 0: M.add(crash(), t0, .16, -.2)
        # --- bass: syncopated octave funk line
        pat = [(0, 2, 0), (3, 1, 0), (6, 1.5, 12), (8, 1.5, 0), (10, 1, 7), (12, 1.5, 0), (14, 1.5, 10 if b % 2 else 12)]
        if b % 4 == 3: pat = [(0, 2, 0), (3, 1, 0), (6, 1.5, 12), (8, 1, 0), (10, 1, 3), (11, 1, 5), (12, 1.5, 7), (14, 1.2, 10)]
        for s, ln, iv in pat:
            if last and s >= 14: break
            M.add(bass_pluck(root + iv, ln * S * 1.05, 1100), t0 + sw(s), .33)
        # --- electric piano comping (off-beat stabs + a held pad underneath)
        for s, ln, g in ((2, 1.6, .9), (5, 1.2, .7), (10, 1.6, .9), (13, 1.2, .65)):
            for k, n in enumerate(ch):
                M.add(epiano(n, ln * S * 1.6), t0 + sw(s) + k * .004, .16 * g, -.45 + .3 * k)
        for k, n in enumerate(ch[:3]):
            M.add(organ(n, BAR * .98) * .5, t0, .04, .4 - .4 * k)
    # --- lead melody (pluck with echo), A minor pentatonic + passing tones; (bar, 16th, len in 16ths, note)
    P1 = [(0, 0, 2, 69), (0, 3, 1, 72), (0, 4, 3, 76), (0, 8, 2, 74), (0, 11, 1, 72), (0, 12, 4, 69),
          (1, 2, 2, 66), (1, 4, 2, 69), (1, 6, 2, 72), (1, 10, 4, 74),
          (2, 0, 2, 72), (2, 3, 1, 69), (2, 4, 3, 65), (2, 8, 2, 69), (2, 11, 1, 72), (2, 12, 4, 76),
          (3, 2, 2, 74), (3, 4, 2, 71), (3, 6, 2, 67), (3, 10, 5, 69)]
    P2 = [(4, 0, 2, 76), (4, 3, 1, 79), (4, 4, 3, 81), (4, 8, 2, 79), (4, 11, 1, 76), (4, 12, 4, 72),
          (5, 2, 2, 74), (5, 4, 2, 78), (5, 6, 2, 81), (5, 10, 4, 78),
          (6, 0, 2, 77), (6, 3, 1, 76), (6, 4, 3, 72), (6, 8, 2, 69), (6, 11, 1, 72), (6, 12, 4, 77),
          (7, 2, 2, 76), (7, 4, 2, 74), (7, 6, 2, 71), (7, 10, 5, 68)]
    PB = [(8, 0, 3, 81), (8, 4, 2, 77), (8, 8, 3, 72), (8, 12, 3, 77),
          (9, 0, 3, 79), (9, 4, 2, 74), (9, 8, 3, 71), (9, 12, 3, 74),
          (10, 0, 3, 76), (10, 4, 2, 71), (10, 8, 3, 67), (10, 12, 3, 71),
          (11, 0, 2, 72), (11, 3, 1, 76), (11, 4, 6, 81),
          (12, 0, 3, 77), (12, 4, 2, 74), (12, 8, 3, 69), (12, 12, 3, 74),
          (13, 0, 3, 79), (13, 4, 2, 74), (13, 8, 3, 71), (13, 12, 3, 79),
          (14, 0, 2, 76), (14, 3, 1, 79), (14, 4, 3, 84), (14, 8, 2, 83), (14, 11, 1, 79), (14, 12, 4, 76),
          (15, 2, 2, 74), (15, 4, 2, 71), (15, 6, 2, 68), (15, 10, 5, 64)]
    P3 = [(b + 16, s, l, n) for b, s, l, n in P1] + [(b + 16, s, l, n) for b, s, l, n in P2[:-4]] + \
         [(23, 0, 2, 76), (23, 3, 1, 74), (23, 4, 2, 71), (23, 6, 2, 68), (23, 8, 5, 69)]
    for b, s, l, n in P1 + P2 + PB + P3:
        oct_up = 12 if b >= 16 and b < 20 else 0
        M.echo(pluck(n + oct_up, l * S * 1.5), b * BAR + sw(s), .33 if oct_up else .38, .18, 3 * S, .32, 3)
        if b >= 8 and b < 16: M.add(pluck(n - 12, l * S * 1.3) * .6, b * BAR + sw(s), .15, -.3)
    M.render(os.path.join(ROOT, 'snd', 'garage.mp3'), 1.0, .36)   # quiet on purpose: iPhones ignore audio.volume, so the level is in the file

# ================================================================ BATTLE – driving, heroic, 140 BPM, D minor, 24 bars
def battle():
    BPM = 140; B = 60 / BPM; S = B / 4; BAR = 4 * B; NB = 24
    M = Mix(NB * BAR)
    Dm = (38, [62, 65, 69]); Bb = (34, [58, 62, 65]); F = (41, [60, 65, 69]); C = (36, [60, 64, 67])
    Gm = (31, [58, 62, 67]); A7 = (33, [61, 64, 69]); Am = (33, [60, 64, 69])
    A_ = [Dm, Dm, Bb, C, Dm, Dm, Bb, A7]
    B_ = [Gm, Bb, F, C, Gm, Bb, A7, A7]
    C_ = [Dm, Bb, F, C, Dm, Bb, A7, Dm]
    prog = A_ + B_ + C_
    for b, (root, ch) in enumerate(prog):
        t0 = b * BAR; sec = b // 8; last = b == NB - 1
        # --- drums: four on the floor, snare 2 & 4, 16th hats
        for s in (0, 4, 8, 12):
            M.add(kick(1.05, .8), t0 + s * S, .62)
        if b % 2 == 1 and not last: M.add(kick(1.05, .8), t0 + 14 * S, .45)
        for s in (4, 12):
            M.add(snare(185, 1.0), t0 + s * S, .7)
        for s in range(16):
            if last and s >= 14: break
            M.add(hat(False, 1.1), t0 + s * S, (.26 if s % 4 == 2 else .15 if s % 2 else .2) * (1.15 if sec == 2 else 1), .3)
        if not last: M.add(hat(True, 1.1), t0 + 10 * S, .17, .3)
        if b % 8 == 0: M.add(crash(), t0, .3, 0)
        if b % 8 == 7:
            if not last:
                for k in range(4): M.add(snare(185 + 12 * k, .9), t0 + (12 + k) * S, .35 + .08 * k)
                M.add(riser(BAR * .5), t0 + BAR * .5, .09)
            else:
                for k, f in enumerate((200, 160, 125, 100)): M.add(tom(f), t0 + (8 + 1.5 * k) * S, .55, -.4 + .25 * k)
        # --- bass: pumping 8ths, octave jumps
        for k in range(8):
            if last and k >= 7: break
            n = root + (12 if k in (3, 6) else 0) + (7 if k == 7 and b % 2 else 0)
            M.add(bass_saw(n, S * 1.75, 950 if sec != 1 else 760), t0 + k * 2 * S, .25)
        # --- supersaw chord stabs (rhythm: x..x..x. x..x.x..)
        for s, ln in ((0, 2.5), (3, 2.5), (6, 1.5), (8, 2.5), (11, 1.5), (13, 2)):
            if last and s >= 13: break
            M.add(supersaw(ch + [ch[0] + 12], ln * S, 2400 if sec != 1 else 1700), t0 + s * S, .46 if sec != 1 else .34, -.25)
            M.add(supersaw([n + 12 for n in ch], ln * S, 3400), t0 + s * S, .2, .35)
        # pad in the B part
        if sec == 1: M.add(supersaw([n - 12 for n in ch] + ch, BAR, 1100, .2), t0, .22, 0)
    # --- lead (brass-like) : (bar, 16th, len, note)
    LA = [(0, 0, 3, 74), (0, 4, 2, 77), (0, 6, 2, 76), (0, 8, 6, 74),
          (1, 0, 2, 69), (1, 2, 2, 72), (1, 4, 2, 74), (1, 6, 2, 77), (1, 8, 7, 76),
          (2, 0, 3, 74), (2, 4, 2, 77), (2, 6, 2, 79), (2, 8, 6, 77),
          (3, 0, 3, 76), (3, 4, 3, 72), (3, 8, 3, 76), (3, 12, 3, 79),
          (4, 0, 3, 81), (4, 4, 2, 77), (4, 6, 2, 76), (4, 8, 6, 74),
          (5, 0, 2, 69), (5, 2, 2, 72), (5, 4, 2, 74), (5, 6, 2, 77), (5, 8, 7, 81),
          (6, 0, 3, 82), (6, 4, 2, 81), (6, 6, 2, 79), (6, 8, 6, 77),
          (7, 0, 4, 76), (7, 4, 4, 73), (7, 8, 7, 69)]
    LB = [(8, 0, 6, 70), (8, 8, 3, 74), (8, 12, 3, 79), (9, 0, 6, 77), (9, 8, 3, 74), (9, 12, 3, 70),
          (10, 0, 6, 72), (10, 8, 3, 77), (10, 12, 3, 81), (11, 0, 6, 79), (11, 8, 3, 76), (11, 12, 3, 72),
          (12, 0, 6, 74), (12, 8, 3, 79), (12, 12, 3, 82), (13, 0, 6, 81), (13, 8, 3, 77), (13, 12, 3, 74),
          (14, 0, 4, 73), (14, 4, 4, 76), (14, 8, 4, 81), (14, 12, 4, 85), (15, 0, 10, 88)]
    LC = [(b + 16, s, l, n + 12 if b < 4 else n) for b, s, l, n in LA[:-3]] + [(23, 0, 3, 76), (23, 4, 3, 73), (23, 8, 5, 74)]
    for b, s, l, n in LA + LB + LC:
        t0 = b * BAR + s * S
        M.add(brass(n, l * S * .96, 2900), t0, .40, .12)
        M.add(brass(n - 12, l * S * .96, 1700), t0, .15, -.2)
        if b >= 16: M.echo(pluck(n + 12, l * S), t0, .1, .5, 3 * S, .4, 2)
    # arpeggio sparkle in A'/C
    for b in range(16, 24):
        root, ch = prog[b]
        for k in range(16):
            if b == 23 and k >= 13: break
            n = (ch + [ch[0] + 12])[(k * 3) % 4] + 12
            M.add(pluck(n, S * 1.4, 1.4), b * BAR + k * S, .09, -.5 + (k % 4) * .33)
    M.render(os.path.join(ROOT, 'snd', 'battle.mp3'), 1.05, .30)

if __name__ == '__main__':
    os.makedirs(os.path.join(ROOT, 'snd'), exist_ok=True)
    w = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if w in ('garage', 'all'): garage()
    if w in ('battle', 'all'): battle()
