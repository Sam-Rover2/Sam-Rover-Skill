import { Easing } from 'remotion';

/** Easing used for almost everything: smooth start and stop. */
export const smooth = Easing.inOut(Easing.cubic);
export const out = Easing.out(Easing.cubic);
export const backOut = Easing.out(Easing.back(1.4));

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** 0→1 between t0 and t1 seconds with easing. */
export const ramp = (t: number, t0: number, t1: number, ease = smooth) => ease(clamp01((t - t0) / (t1 - t0)));

type V3 = [number, number, number];
export const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/**
 * Keyframes in seconds: [[t, value], ...]; eased between neighbours.
 * Works for numbers and 3-vectors.
 */
export function keys(t: number, kf: [number, number][], ease?: (x: number) => number): number;
export function keys(t: number, kf: [number, V3][], ease?: (x: number) => number): V3;
export function keys(t: number, kf: [number, number | V3][], ease = smooth): number | V3 {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 0; i < kf.length - 1; i++) {
    const [t0, a] = kf[i];
    const [t1, b] = kf[i + 1];
    if (t <= t1) {
      const k = ease(clamp01((t - t0) / (t1 - t0)));
      return typeof a === 'number' ? lerp(a, b as number, k) : mix3(a, b as V3, k);
    }
  }
  return kf[kf.length - 1][1];
}

/** Blink: 0 open … 1 closed, ~0.12 s, at the given times. */
export const blink = (t: number, at: number[]) =>
  Math.max(0, ...at.map((s) => (t >= s && t < s + 0.14 ? 1 - Math.abs(t - s - 0.07) / 0.07 : 0)));

/** Deterministic pseudo-random in [0,1). */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Smooth 1D noise in [-1,1] for handheld camera / idle. */
export const noise = (t: number, seed = 0) => {
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i + seed * 17.3), hash(i + 1 + seed * 17.3), u) * 2 - 1;
};
