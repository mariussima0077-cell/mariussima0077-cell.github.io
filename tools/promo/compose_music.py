"""Original 'boss fight' track for Torque Empire reels (fully synthesized, no samples).
Usage: python3 compose.py out.wav [seconds] [seed]
"""
import sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
BPM = 140
BEAT = 60 / BPM
out = sys.argv[1] if len(sys.argv) > 1 else "track.wav"
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 30.0
rng = np.random.default_rng(int(sys.argv[3]) if len(sys.argv) > 3 else 7)
N = int(SR * (DUR + 2))
L = np.zeros(N); R = np.zeros(N)

def t_(d): return np.arange(int(SR * d)) / SR
def midi(n): return 440 * 2 ** ((n - 69) / 12)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def env(n, a=0.005, r=0.1):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, min(n, int(r * SR)))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def add(buf, x, pos, g=1.0):
    i = int(pos * SR); j = min(N, i + len(x))
    if i < N: buf[i:j] += g * x[:j - i]
def addst(x, pos, g=1.0, pan=0.0):
    add(L, x, pos, g * np.sqrt((1 - pan) / 2) * 1.414)
    add(R, x, pos, g * np.sqrt((1 + pan) / 2) * 1.414)
def saw(f, d, det=0.0):
    t = t_(d); return 2 * ((t * f * (1 + det)) % 1) - 1

# --- drums ---
def kick():
    t = t_(0.45); f = 50 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(2.2 * np.sin(ph) * np.exp(-t * 6.5))
def snare():
    t = t_(0.3); n = hp(rng.standard_normal(len(t)), 1500) * np.exp(-t * 16)
    b = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 22)
    return 0.6 * n + 0.5 * b
def hat(open_=False):
    t = t_(0.25 if open_ else 0.05)
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * (12 if open_ else 70))
def impact():
    t = t_(2.5); f = 40 + 60 * np.exp(-t * 4)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    n = lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 2.5)
    return np.tanh(1.8 * (s + 0.5 * n))

# --- harmony: D minor epic progression  Dm  Bb  F  C ---
prog = [(50, [62, 65, 69]), (46, [58, 62, 65]), (53, [57, 60, 65]), (48, [55, 60, 64])]
BAR = 4 * BEAT

def supersaw(notes, d, cutoff):
    x = np.zeros(int(SR * d))
    for n in notes:
        for k, dt in enumerate([-0.012, -0.006, 0, 0.006, 0.012]):
            x += saw(midi(n), d, dt) * 0.12
    return lp(x, cutoff) * env(len(x), 0.02, 0.15)

def bass(n, d):
    x = 0.7 * saw(midi(n), d) + 0.5 * np.sin(2 * np.pi * midi(n - 12) * t_(d))
    return np.tanh(1.5 * lp(x, 500)) * env(len(x), 0.003, 0.03)

def lead(n, d):
    t = t_(d); vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.clip(t * 4, 0, 1)
    ph = 2 * np.pi * np.cumsum(midi(n) * vib) / SR
    x = np.sign(np.sin(ph)) * 0.4 + 2 * ((ph / (2 * np.pi)) % 1) - 1
    return lp(x * 0.35, 3500) * env(len(x), 0.01, 0.08)

melody = [  # (beat offset in 2-bar phrase, midi, length beats)
    (0, 74, 1.5), (1.5, 72, 0.5), (2, 74, 1), (3, 77, 1),
    (4, 76, 1.5), (5.5, 74, 0.5), (6, 72, 1), (7, 69, 1)]

intro = (int(sys.argv[4]) if len(sys.argv) > 4 else 2) * BAR  # build-up bars, then drop
pump = np.ones(N)  # sidechain envelope
t = 0.0; bar = 0
while t < DUR:
    root, chord = prog[bar % 4]
    dropped = t >= intro
    # pads / chords
    addst(supersaw(chord, BAR, 1800 if dropped else 600 + 500 * bar), t, 0.55 if dropped else 0.4, -0.2)
    addst(supersaw([c + 12 for c in chord], BAR, 2500), t, 0.2 if dropped else 0.0, 0.3)
    for b in range(4):
        bt = t + b * BEAT
        if dropped:
            addst(kick(), bt, 0.9)
            i = int(bt * SR); seg = min(N - i, int(0.25 * SR))
            if seg > 0: pump[i:i + seg] = np.minimum(pump[i:i + seg], 0.35 + 0.65 * np.linspace(0, 1, seg) ** 0.6)
            if b in (1, 3): addst(snare(), bt, 0.6)
            for h in range(2): addst(hat(h == 1), bt + h * BEAT / 2, 0.18, 0.4 if h else -0.4)
            for e in range(2):  # 8th-note bass
                addst(bass(root - 12 if e == 0 else root, BEAT / 2), bt + e * BEAT / 2, 0.5)
        else:
            if bar == round(intro / BAR) - 1:  # snare roll build
                for s in range(4 if b < 2 else 8):
                    addst(snare(), bt + s * BEAT / (4 if b < 2 else 8), 0.15 + 0.1 * b)
            addst(hat(), bt, 0.1)
    if dropped:
        ph_start = t - (bar % 2) * BAR
        for off, n, ln in melody:
            pos = ph_start + off * BEAT
            if t <= pos < t + BAR:
                addst(lead(n, ln * BEAT), pos, 0.38, 0.1)
    t += BAR; bar += 1

# riser before the drop + impact on the drop
rl = BAR; rt = t_(rl)
riser = hp(rng.standard_normal(len(rt)), 800) * (rt / rl) ** 2
sw = np.sin(2 * np.pi * np.cumsum(200 + 1800 * (rt / rl) ** 2) / SR) * (rt / rl) ** 2
addst(0.25 * riser + 0.15 * sw, intro - rl, 1.0)
addst(impact(), intro, 0.8)
addst(impact(), 0, 0.5)

L *= pump ** 0.8; R *= pump ** 0.8
# simple stereo reverb-ish: delayed, filtered copies
for d, g in [(0.031, 0.25), (0.047, 0.2), (0.071, 0.15)]:
    k = int(d * SR)
    L[k:] += g * lp(R[:-k], 4000); R[k:] += g * lp(L[:-k], 4000)

mix = np.stack([L, R], 1)[: int(SR * DUR)]
fade = int(1.5 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = np.tanh(1.3 * mix / (np.max(np.abs(mix)) + 1e-9)) * 0.92
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print("wrote", out, DUR, "s")
