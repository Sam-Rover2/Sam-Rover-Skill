import type { V3 } from '../lib/Toon';
import { HIPS_Y, type Pose } from './Character';

/** Walk cycle in place (character walks toward +z). `phase` grows with distance walked. */
export function walk(phase: number, amount = 1): Pose {
  const φ = phase * Math.PI;
  const foot = (s: 1 | -1, p: number): V3 => [s * 0.24, 0.1 + 0.2 * Math.max(0, Math.cos(p)) * amount, 0.04 + 0.34 * Math.sin(p) * amount];
  const hand = (s: 1 | -1, p: number): V3 => [s * 0.66, HIPS_Y + 0.18, 0.1 - 0.32 * Math.sin(p) * amount];
  return {
    footL: foot(-1, φ),
    footR: foot(1, φ + Math.PI),
    handL: hand(-1, φ),
    handR: hand(1, φ + Math.PI),
    hips: [0, (0.05 * Math.cos(2 * φ) - 0.02) * amount, 0],
    lean: 0.06 * amount,
    side: 0.03 * Math.sin(φ) * amount,
  };
}

/**
 * Sitting on a seat of height `seat` (top surface, character space).
 * Pelvis rests ON the seat, thighs go forward over it, knees bend up-forward,
 * feet on the floor in front of the seat edge — nothing passes through the seat.
 * The seat's front edge must be at z ≈ +0.3 relative to the character.
 */
export function sit(seat = 0.66): Pose {
  return {
    hips: [0, seat - HIPS_Y + 0.02, -0.05],
    footL: [-0.26, 0.1, 0.62],
    footR: [0.26, 0.1, 0.62],
    kneeDir: [0, 1, 0.6],
    lean: -0.04,
  };
}

/** Idle life: breathing + tiny sway, deterministic in time. */
export const breathe = (t: number, seed = 0) => 1 + Math.sin(t * 2.2 + seed) * 0.012;

/** Blend two poses (numbers and 3-vectors only), k: 0 → a, 1 → b. */
export function blendPose(a: Pose, b: Pose, k: number): Pose {
  const out: Record<string, unknown> = { ...a };
  for (const key of Object.keys(b) as (keyof Pose)[]) {
    const va = a[key] as unknown;
    const vb = b[key] as unknown;
    if (typeof vb === 'number') out[key] = (typeof va === 'number' ? va : 0) + ((vb - (typeof va === 'number' ? va : 0)) * k);
    else if (Array.isArray(vb) && Array.isArray(va)) out[key] = vb.map((x: number, i: number) => va[i] + (x - va[i]) * k);
    else out[key] = k < 0.5 && va !== undefined ? va : vb;
  }
  return out as Pose;
}
