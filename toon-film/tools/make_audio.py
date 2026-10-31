"""Synthesize the film's soundtrack (music + SFX) with numpy only. Free, no samples.
Run:  python3 tools/make_audio.py   → public/audio/film.wav (40 s, 48 kHz stereo)
Timings must match src/Film.tsx (SCENES / PHRASES)."""
import wave, numpy as np

SR = 48000
DUR = 40.0
N = int(SR * DUR)
L = np.zeros(N); Rch = np.zeros(N)
rng = np.random.default_rng(7)

def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    L[i:i+len(sig)] += sig * (1 - max(0, pan))
    Rch[i:i+len(sig)] += sig * (1 + min(0, pan))

def env(n, a=0.005, d=0.6):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)

def note(f, dur=0.8, decay=0.35, harm=(1, .5, .25, .12)):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(h * np.sin(2*np.pi*f*(k+1)*t) * np.exp(-t*(k+1)*1.3/decay) for k, h in enumerate(harm))
    return s * env(n, 0.003, decay)

def smooth(x, k):  # crude low-pass
    return np.convolve(x, np.ones(k)/k, mode='same')

midi = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------- music ----------
BEAT = 0.6  # 100 BPM
happy = [(60, 64, 67), (57, 60, 64), (53, 57, 60), (55, 59, 62)]   # C Am F G
sad = [(57, 60, 64), (53, 57, 60)]                                 # Am F
def section(t0, t1, chords, gain=0.16, arp=True, bass=True, pad=False):
    t = t0; i = 0
    while t < t1 - 0.05:
        ch = chords[(i // 4) % len(chords)]
        if arp:
            m = ch[[0, 1, 2, 1][i % 4]] + 12
            add(note(midi(m), 0.9, 0.4), t, gain, pan=-0.3 if i % 2 else 0.3)
        if bass and i % 2 == 0:
            add(note(midi(ch[0] - 24), 1.2, 0.5, (1, .3)), t, gain * 1.3)
        if pad and i % 4 == 0:
            n = int(BEAT*4*SR); tt = np.arange(n)/SR
            p = sum(np.sin(2*np.pi*midi(m)*tt) for m in ch) * np.sin(np.pi*tt/(BEAT*4))**2
            add(p, t, gain * 0.25)
        t += BEAT; i += 1

section(0.4, 9.8, happy)
section(10.3, 13.0, sad, gain=0.12, arp=True, bass=False)
section(13.0, 19.5, happy, gain=0.17)
section(19.5, 27.0, happy, gain=0.15, pad=True)
section(27.0, 33.5, [(53, 57, 60), (55, 59, 62), (52, 55, 60), (57, 60, 64)], gain=0.14, pad=True)
section(33.5, 38.8, happy, gain=0.15, pad=True)
for k, m in enumerate((72, 76, 79, 84)):  # end chord
    add(note(midi(m), 2.5, 1.2), 39.25 + k*0.06, 0.18)

# ---------- SFX ----------
def chirp(f0, f1, d=0.12):
    n = int(d*SR); t = np.arange(n)/SR
    return np.sin(2*np.pi*(f0*t + (f1-f0)*t*t/(2*d))) * np.sin(np.pi*t/d)
for k in range(9):  # birds at dawn
    add(chirp(2600, 3600), 0.6 + k*0.55 + rng.random()*0.2, 0.05, pan=rng.uniform(-.6, .6))

click = rng.standard_normal(int(0.02*SR)) * env(int(0.02*SR), 0.0005, 0.004)
add(click, 7.65, 0.5)                                            # button press
n = int(1.5*SR); tt = np.arange(n)/SR                             # rattle
add(smooth(rng.standard_normal(n), 6) * (0.5+0.5*np.sign(np.sin(2*np.pi*22*tt))) * np.minimum(1, tt*4), 8.3, 0.12)
n = int(1.2*SR); tt = np.arange(n)/SR                             # POOF
poof = smooth(rng.standard_normal(n), 30) * np.exp(-tt*4) * 3 + np.sin(2*np.pi*60*tt*np.exp(-tt*2)) * np.exp(-tt*6)
add(poof, 9.8, 0.5)
add(note(midi(55), 0.5, 0.3), 10.0, 0.12); add(note(midi(50), 0.9, 0.5), 10.35, 0.12)   # sad "wah-wah"

n = int(2.4*SR); tt = np.arange(n)/SR                             # car whoosh (doppler-ish)
wh = smooth(rng.standard_normal(n), 12) * np.exp(-((tt-1.0)/0.45)**2) + 0.3*np.sin(2*np.pi*(90-20*np.tanh((tt-1)*4))*tt)*np.exp(-((tt-1)/0.5)**2)
add(wh, 14.9, 0.35)
for k in range(10):                                               # footsteps on the street
    add(smooth(rng.standard_normal(1200), 8) * env(1200, 0.001, 0.02), 13.2 + k*0.39, 0.12)

for k, m in enumerate((88, 84)):                                  # café door bell
    add(note(midi(m), 1.2, 0.6, (1, .3, .1)), 19.65 + k*0.18, 0.12)
for k in range(3):                                                # hearts sparkle
    add(note(midi(91 + k*2), 0.4, 0.2), 25.1 + k*0.35, 0.06)

n = int(6.5*SR); tt = np.arange(n)/SR                             # park wind
add(smooth(rng.standard_normal(n), 60) * (0.6+0.4*np.sin(2*np.pi*0.3*tt)) * np.sin(np.pi*tt/6.5), 27.0, 0.25)
add(click, 31.2, 0.4)                                             # lamp turns on

for k in range(36):                                               # office keyboard
    add(click, 33.6 + k*0.15 + rng.random()*0.05, 0.12, pan=0.4)

# ---------- master ----------
mix = np.stack([L, Rch], 1)
fade = np.ones(N); fl = int(0.5*SR); fade[-fl:] = np.linspace(1, 0, fl)
mix *= fade[:, None]
mix /= max(1e-9, np.abs(mix).max()) / 0.85
pcm = (mix * 32767).astype('<i2')
with wave.open('public/audio/film.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok public/audio/film.wav')
