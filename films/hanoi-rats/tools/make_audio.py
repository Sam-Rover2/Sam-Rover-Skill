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

section(0.4, 5.2, happy)
section(5.6, 12.5, [(57, 60, 64), (55, 59, 62), (53, 57, 60), (52, 55, 59)], gain=0.13, pad=True)  # balloon flies away
section(12.5, 19.5, happy, gain=0.15)
section(19.5, 25.0, happy, gain=0.18)                     # run
section(25.0, 29.0, sad, gain=0.11, bass=False)          # Lena is sad
section(29.0, 33.0, happy, gain=0.16, pad=True)
section(33.0, 39.0, [(53, 57, 60), (55, 59, 62), (52, 55, 60), (57, 60, 64)], gain=0.15, pad=True)
for k, m in enumerate((72, 76, 79, 84)):
    add(note(midi(m), 2.5, 1.2), 38.4 + k*0.06, 0.16)

# ---------- SFX ----------
def chirp(f0, f1, d=0.12):
    n = int(d*SR); t = np.arange(n)/SR
    return np.sin(2*np.pi*(f0*t + (f1-f0)*t*t/(2*d))) * np.sin(np.pi*t/d)
n = int(7*SR); tt = np.arange(n)/SR                                # market chatter bed
add(smooth(rng.standard_normal(n), 25) * np.sin(np.pi*tt/7) * (0.7 + 0.3*np.sin(2*np.pi*3*tt)), 0, 0.12)
for k in range(3):
    add(chirp(500, 900, 0.08), 2.3 + k*0.09, 0.08)               # rubber squeak: handing the balloon
n = int(2*SR); tt = np.arange(n)/SR                                # gust
add(smooth(rng.standard_normal(n), 40) * np.sin(np.pi*tt/2), 4.9, 0.5)
add(chirp(800, 1600, 0.6), 5.3, 0.08)                             # "whee" as it rises
for k in range(8):
    add(chirp(2600, 3600), 7.5 + k*0.6 + rng.random()*0.2, 0.05, pan=rng.uniform(-.6, .6))
n = int(1.8*SR); tt = np.arange(n)/SR                              # watering can
add(smooth(rng.standard_normal(n), 3) * np.sin(np.pi*tt/1.8), 12.6, 0.06)
for k, m in enumerate((84, 88, 91)):
    add(note(midi(m), 0.6, 0.3), 16.1 + k*0.08, 0.1)              # catch!
for k in range(14):                                                 # running steps
    add(smooth(rng.standard_normal(1200), 8) * env(1200, 0.001, 0.02), 19.6 + k*0.38, 0.14)
n = int(8*SR); tt = np.arange(n)/SR                                # fountain
add(smooth(rng.standard_normal(n), 4) * (0.8 + 0.2*np.sin(2*np.pi*0.7*tt)) * np.minimum(1, np.minimum(tt, 8-tt)), 25, 0.05)
for k, m in enumerate((79, 84, 88, 91)):
    add(note(midi(m), 0.8, 0.4), 30.7 + k*0.1, 0.1)               # she gets it back
for k in range(5):
    add(chirp(2400, 3300), 33.5 + k*0.9, 0.04)

# ---------- master ----------
mix = np.stack([L, Rch], 1)
fade = np.ones(N); fl = int(0.5*SR); fade[-fl:] = np.linspace(1, 0, fl)
mix *= fade[:, None]
mix /= max(1e-9, np.abs(mix).max()) / 0.85
pcm = (mix * 32767).astype('<i2')
with wave.open('public/audio/film.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok public/audio/film.wav')
