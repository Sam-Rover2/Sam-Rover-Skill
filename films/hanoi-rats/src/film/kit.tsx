import { Easing } from 'remotion';
import { clamp01, hash, keys, lerp, smooth } from '../lib/anim';
import type { Cam, LightPreset } from '../lib/Stage';
import { Stage } from '../lib/Stage';
import { Person, Rat, type PersonPose, type RatPose } from '../rig/Person';
import { CAST } from '../project';
import { Shadow } from '../props/Props';

export type V3 = [number, number, number];

/* ---------------- camera: shots made of keyframes ---------------- */

/** One camera keyframe (t = film seconds). fov/roll are inherited from the previous key when omitted. */
export interface CK {
  t: number;
  pos: V3;
  target: V3;
  fov?: number;
  roll?: number;
}
/** One shot between two cuts. */
export interface Shot {
  from: number;
  to: number;
  k: CK[];
  ease?: (x: number) => number;
  /** handheld amount (units), constant or as a function of time */
  shake?: number | ((t: number) => number);
}

export const easeIO = smooth;
export const easeOut = Easing.out(Easing.cubic);
export const easeIn = Easing.in(Easing.cubic);
export const easeExpo = Easing.inOut(Easing.exp);
export const linear = (x: number) => x;

export const camAt = (shots: Shot[], t: number): Cam => {
  const s = shots.find((x) => t >= x.from && t < x.to) ?? shots[t < shots[0].from ? 0 : shots.length - 1];
  let fov = 45;
  let roll = 0;
  const kf = s.k.map((k) => {
    fov = k.fov ?? fov;
    roll = k.roll ?? roll;
    return { ...k, fov, roll };
  });
  const e = s.ease ?? smooth;
  const shake = typeof s.shake === 'function' ? s.shake(t) : s.shake ?? 0.05;
  return {
    pos: keys(t, kf.map((k) => [k.t, k.pos] as [number, V3]), e),
    target: keys(t, kf.map((k) => [k.t, k.target] as [number, V3]), e),
    fov: keys(t, kf.map((k) => [k.t, k.fov] as [number, number]), e),
    roll: keys(t, kf.map((k) => [k.t, k.roll] as [number, number]), e),
    shake,
    t,
  };
};

/** A short burst of shake around time `at` (for impacts / snips). */
export const bump = (t: number, at: number, amp = 0.3, len = 0.35) => (t >= at && t < at + len ? amp * (1 - (t - at) / len) : 0);

/* ---------------- scene wrapper ---------------- */

export const Scene: React.FC<{ light: LightPreset; bg: string; cam: Cam; children: React.ReactNode }> = ({ light, bg, cam, children }) => (
  <Stage light={light} background={bg} cam={cam}>
    {children}
  </Stage>
);

/* ---------------- space helpers ---------------- */

/** Heading (rotY) that makes a character at `from` face the point `to`. */
export const face = (from: V3, to: V3) => Math.atan2(to[0] - from[0], to[2] - from[2]);
/** World point → character-local point (character at pos, turned by rotY). */
export const toLocal = (w: V3, pos: V3, rotY: number): V3 => {
  const dx = w[0] - pos[0];
  const dz = w[2] - pos[2];
  return [dx * Math.cos(rotY) - dz * Math.sin(rotY), w[1] - pos[1], dx * Math.sin(rotY) + dz * Math.cos(rotY)];
};
/** Character-local point → world point. */
export const toWorld = (l: V3, pos: V3, rotY: number): V3 => [
  pos[0] + l[0] * Math.cos(rotY) + l[2] * Math.sin(rotY),
  pos[1] + l[1],
  pos[2] - l[0] * Math.sin(rotY) + l[2] * Math.cos(rotY),
];

/** Position along a polyline path [[t, point], ...] with easing, plus the heading of travel. */
export const path = (t: number, pts: [number, V3][], ease = smooth): { pos: V3; rotY: number; moving: boolean } => {
  const pos = keys(t, pts, ease);
  let i = pts.findIndex(([tt]) => tt > t) - 1;
  if (i < 0) i = t < pts[0][0] ? 0 : pts.length - 2;
  const a = pts[i][1];
  const b = pts[Math.min(i + 1, pts.length - 1)][1];
  const moving = t > pts[0][0] && t < pts[pts.length - 1][0];
  return { pos, rotY: Math.atan2(b[0] - a[0], b[2] - a[2]), moving };
};

/* ---------------- people ---------------- */

/** Walk / run cycle for Person. `ph` grows ~1 per step. */
export const walkPose = (ph: number, a = 1, run = false): PersonPose => {
  const φ = ph * Math.PI;
  const k = run ? 1.5 : 1;
  const foot = (s: number, p: number): V3 => [s * 0.24, 0.08 + 0.3 * k * Math.max(0, Math.cos(p)) * a, 0.05 + 0.45 * k * Math.sin(p) * a];
  const hand = (s: number, p: number): V3 => [s * 0.68, 1.85 + (run ? 0.3 : 0), 0.15 - 0.45 * k * Math.sin(p) * a];
  return {
    footL: foot(-1, φ),
    footR: foot(1, φ + Math.PI),
    handL: hand(-1, φ + Math.PI),
    handR: hand(1, φ),
    hips: [0, (0.07 * Math.cos(2 * φ) - 0.03) * a * k, 0],
    lean: (run ? 0.18 : 0.07) * a,
  };
};

/** Idle life: breathing bob and a little head sway. */
export const idle = (t: number, seed = 0): PersonPose => ({
  hips: [0, Math.sin(t * 2.3 + seed) * 0.025, 0],
  headTilt: Math.sin(t * 0.9 + seed * 3) * 0.05,
});

/** Merge poses: later ones win, hips are added. */
export const mix = (...ps: (PersonPose | undefined)[]): PersonPose => {
  const out: PersonPose = {};
  for (const p of ps) {
    if (!p) continue;
    const h = out.hips;
    Object.assign(out, p);
    if (h && p.hips) out.hips = [h[0] + p.hips[0], h[1] + p.hips[1], h[2] + p.hips[2]];
  }
  return out;
};

/** Hand target that moves between two local points with easing. */
export const reachTo = (t: number, t0: number, t1: number, a: V3, b: V3, e = smooth): V3 => {
  const k = e(clamp01((t - t0) / (t1 - t0)));
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
};

export const Who: React.FC<{ id: string; pos: V3; rotY?: number; pose?: PersonPose; shadow?: boolean }> = ({ id, pos, rotY = 0, pose, shadow = true }) => {
  const c = CAST.find((x) => x.id === id)!;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {shadow && <Shadow r={0.85} />}
      <Person look={c.look!} pose={pose} />
    </group>
  );
};

/* ---------------- rats ---------------- */

/** A rat. run=true adds a scurry hop; `t` drives it. */
export const RatA: React.FC<{ pos: V3; rotY?: number; t: number; run?: boolean; cut?: boolean; pose?: RatPose; scale?: number; seed?: number; pitch?: number }> = ({
  pos,
  rotY = 0,
  t,
  run = false,
  cut,
  pose,
  scale = 1.1,
  seed = 0,
  pitch = 0,
}) => {
  const ph = t * 15 + seed * 2.1;
  const hop = run ? Math.abs(Math.sin(ph)) * 0.16 : Math.abs(Math.sin(t * 3 + seed)) * 0.02;
  const p = run ? Math.cos(ph) * 0.12 : 0;
  return (
    <group position={[pos[0], pos[1] + hop, pos[2]]} rotation={[0, rotY, 0]}>
      <group rotation={[p + pitch, 0, 0]} scale={[scale, scale * (run ? 1 - Math.abs(Math.cos(ph)) * 0.08 : 1), scale]}>
        <Rat pose={{ tail: !cut, face: cut ? 'sly' : 'happy', ...pose }} />
      </group>
    </group>
  );
};

/**
 * A crowd of running rats. Each rat runs in a straight line with its own speed,
 * staying inside the box [x0,x1]×[z0,z1] (wraps around, so the crowd never runs out).
 */
export const RatSwarm: React.FC<{ t: number; n: number; x0: number; x1: number; z0: number; z1: number; y?: number; dir?: number; spread?: number; speed?: [number, number]; cut?: number; seed?: number; scale?: number }> = ({
  t,
  n,
  x0,
  x1,
  z0,
  z1,
  y = 0,
  dir = Math.PI / 2,
  spread = 0.25,
  speed = [5, 8],
  cut = 0.6,
  seed = 1,
  scale = 1.1,
}) => {
  const W = x1 - x0;
  const D = z1 - z0;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const h = (k: number) => hash(i * 7.13 + seed * 31.7 + k);
        const a = dir + (h(1) - 0.5) * 2 * spread;
        const v = lerp(speed[0], speed[1], h(2));
        const dx = Math.sin(a) * v * t;
        const dz = Math.cos(a) * v * t;
        const wrap = (u: number, L: number) => ((u % L) + L) % L;
        const x = x0 + wrap(h(3) * W + dx, W);
        const z = z0 + wrap(h(4) * D + dz, D);
        return <RatA key={i} pos={[x, y, z]} rotY={a} t={t} run cut={h(5) < cut} seed={i} scale={scale * (0.9 + h(6) * 0.2)} />;
      })}
    </>
  );
};

/* ---------------- falling coins ---------------- */

export const CoinRain: React.FC<{ t: number; t0: number; n: number; x: [number, number]; z: [number, number]; top?: number; floor?: number }> = ({ t, t0, n, x, z, top = 11, floor = 0.06 }) => {
  if (t < t0) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const delay = hash(i + 0.3) * 1.2;
        const tt = t - t0 - delay;
        if (tt < 0) return null;
        const y = Math.max(floor, top - 0.5 * 22 * tt * tt);
        const px = lerp(x[0], x[1], hash(i + 5.1));
        const pz = lerp(z[0], z[1], hash(i + 9.7));
        const spin = y > floor ? tt * 14 + i : Math.PI / 2;
        return (
          <mesh key={i} position={[px, y + 0.03, pz]} rotation={[spin, i, 0]} scale={[0.2, 0.05, 0.2]}>
            <cylinderGeometry args={[1, 1, 1, 18]} />
            <meshToonMaterial color="#f0c64e" />
          </mesh>
        );
      })}
    </>
  );
};
