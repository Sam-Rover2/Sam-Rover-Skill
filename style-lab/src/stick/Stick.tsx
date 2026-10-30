import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Limb, reach } from '../rig/Limb';

/**
 * Stickman / ink-brush style.
 * - Brush: a black stroke along a curve whose width tapers and frays at the ends (ink look).
 * - Stick: a stick figure — white shaded sphere head in a thick black ring, thick black limbs
 *   on the Bezier rig (elbows/knees bend), straight torso line.
 */

type V3 = [number, number, number];
export const INK = '#0b0b0b';
const inkMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.DoubleSide });

const rand = (n: number) => {
  const x = Math.sin(n * 91.7 + 13.1) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Ink brush stroke through points. Flat ribbon facing the camera (+z), width tapers at both ends,
 * edges are jittered and the tips split into "dry brush" bristles.
 */
export const Brush: React.FC<{ pts: V3[]; width?: number; taper?: [number, number]; seed?: number; rough?: number; bristles?: boolean }> = ({
  pts,
  width = 0.2,
  taper = [0.15, 0.35],
  seed = 1,
  rough = 0.18,
  bristles = true,
}) => {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    const N = 64;
    const pos: number[] = [];
    const idx: number[] = [];
    const up = new THREE.Vector3(0, 0, 1);
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const p = curve.getPointAt(u);
      const t = curve.getTangentAt(u);
      const n = new THREE.Vector3().crossVectors(up, t).normalize();
      // width profile: thin start, thick body, long dry tail
      let w = width;
      if (u < taper[0]) w *= 0.25 + 0.75 * (u / taper[0]);
      if (u > 1 - taper[1]) w *= Math.max(0.02, (1 - u) / taper[1]);
      const j1 = 1 + (rand(seed * 100 + i) - 0.5) * rough * 2;
      const j2 = 1 + (rand(seed * 200 + i) - 0.5) * rough * 2;
      const a = p.clone().addScaledVector(n, (w / 2) * j1);
      const b = p.clone().addScaledVector(n, (-w / 2) * j2);
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
      if (i < N) {
        const k = i * 2;
        idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
    // dry-brush bristles at the tail end: a few thin splinters
    if (bristles) {
      const end = curve.getPointAt(1);
      const t = curve.getTangentAt(1);
      const n = new THREE.Vector3().crossVectors(up, t).normalize();
      for (let k = 0; k < 3; k++) {
        const off = (k - 1) * width * 0.35;
        const base = end.clone().addScaledVector(t, -width * (1.5 + k)).addScaledVector(n, off);
        const tip = end.clone().addScaledVector(t, width * (0.8 + rand(seed + k) * 1.4)).addScaledVector(n, off * 1.6);
        const s = pos.length / 3;
        const wv = width * 0.07;
        pos.push(base.x + n.x * wv, base.y + n.y * wv, base.z, base.x - n.x * wv, base.y - n.y * wv, base.z, tip.x, tip.y, tip.z);
        idx.push(s, s + 1, s + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(pts), width, seed, rough]);
  useEffect(() => () => geo.dispose(), [geo]);
  return <mesh geometry={geo} material={inkMat} />;
};

/** Ink post / stake: thick vertical stroke with a ragged split bottom. */
export const Post: React.FC<{ x: number; y0: number; y1: number; z?: number; w?: number; seed?: number }> = ({ x, y0, y1, z = 0, w = 0.3, seed = 3 }) => (
  <group>
    <Brush pts={[[x, y1, z], [x + 0.02, (y0 + y1) / 2, z], [x - 0.03, y0, z]]} width={w} taper={[0.02, 0.25]} seed={seed} rough={0.12} />
    <mesh position={[x, y1 + 0.02, z]} scale={[w * 0.55, w * 0.35, w * 0.4]} material={inkMat}>
      <sphereGeometry args={[1, 16, 8]} />
    </mesh>
  </group>
);

/** Sagging rope between two points (catenary-like). */
export const Rope: React.FC<{ a: V3; b: V3; sag?: number; w?: number; seed?: number; tail?: boolean }> = ({ a, b, sag = 0.5, w = 0.11, seed = 5, tail }) => {
  const pts: V3[] = [];
  for (let i = 0; i <= 6; i++) {
    const u = i / 6;
    pts.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - sag * 4 * u * (1 - u), a[2] + (b[2] - a[2]) * u]);
  }
  return <Brush pts={pts} width={w} taper={tail ? [0.05, 0.35] : [0.03, 0.06]} seed={seed} rough={0.1} bristles={!!tail} />;
};

/* ---------------- stick figure ---------------- */

const headMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 });
const ringMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });

export interface StickPose {
  hips?: V3; // pelvis position (character space)
  lean?: number; // torso tilt forward (+) radians
  side?: number; // torso tilt sideways
  handL?: V3;
  handR?: V3;
  footL?: V3;
  footR?: V3;
  elbowL?: V3;
  elbowR?: V3;
  kneeDir?: V3;
  headTilt?: number;
  alarm?: number; // 0..1 "!" emphasis lines above the head
}

export const STICK = { torso: 1.35, head: 0.48, arm: 1.2, leg: 1.5, limbR: 0.085 };

/** Stick figure. Origin = between the feet, facing +x is "forward" in profile scenes. */
export const Stick: React.FC<{ pose?: StickPose; scale?: number }> = ({ pose = {}, scale = 1 }) => {
  const hips: V3 = pose.hips ?? [0, 1.5, 0];
  const lean = pose.lean ?? 0;
  const side = pose.side ?? 0;
  const top: V3 = [hips[0] + Math.sin(lean) * STICK.torso, hips[1] + Math.cos(lean) * STICK.torso * Math.cos(side), hips[2] + Math.sin(side) * STICK.torso];
  const shoulder: V3 = [hips[0] + (top[0] - hips[0]) * 0.82, hips[1] + (top[1] - hips[1]) * 0.82, hips[2] + (top[2] - hips[2]) * 0.82];
  const headC: V3 = [top[0] + Math.sin(lean) * STICK.head * 1.15, top[1] + Math.cos(lean) * STICK.head * 1.15, top[2]];
  const hand = (p: V3 | undefined, s: number): V3 => reach(shoulder, p ?? [shoulder[0] + s * 0.28, shoulder[1] - 1.12, s * 0.12], STICK.arm);
  const foot = (p: V3 | undefined, s: number): V3 => reach(hips, p ?? [hips[0] + s * 0.38, 0.06, s * 0.15], STICK.leg);
  const r = STICK.limbR;
  return (
    <group scale={scale}>
      {/* torso: one straight thick line */}
      <Limb root={hips} tip={top} length={STICK.torso} bendDir={[1, 0, 0]} radius={r * 1.05} />
      <Limb root={shoulder} tip={hand(pose.handL, -1)} length={STICK.arm} bendDir={pose.elbowL ?? [-0.3, -1, 0]} radius={r} />
      <Limb root={shoulder} tip={hand(pose.handR, 1)} length={STICK.arm} bendDir={pose.elbowR ?? [-0.3, -1, 0]} radius={r} />
      <Limb root={hips} tip={foot(pose.footL, -1)} length={STICK.leg} bendDir={pose.kneeDir ?? [1, 0, 0]} radius={r} />
      <Limb root={hips} tip={foot(pose.footR, 1)} length={STICK.leg} bendDir={pose.kneeDir ?? [1, 0, 0]} radius={r} />
      {/* head: white shaded ball inside a thick ink ring */}
      <group position={headC} rotation={[0, 0, pose.headTilt ?? 0]}>
        <mesh material={headMat}>
          <sphereGeometry args={[STICK.head, 48, 32]} />
        </mesh>
        {/* ink ring: a bigger black ball behind (back faces) → ring ~22% of the head radius */}
        <mesh material={ringMat} scale={1.24}>
          <sphereGeometry args={[STICK.head, 48, 32]} />
        </mesh>
      </group>
      {/* "!" emphasis strokes */}
      {(pose.alarm ?? 0) > 0 &&
        [-0.55, 0, 0.5].map((x, i) => {
          const k = pose.alarm ?? 0;
          const base: V3 = [headC[0] + x * 0.9, headC[1] + STICK.head + 0.45, headC[2]];
          const dir = [x * 0.6, 1, 0];
          const len = (0.55 + (i === 1 ? 0.25 : 0)) * k;
          return (
            <group key={i}>
              <Brush pts={[base, [base[0] + dir[0] * len * 0.5, base[1] + len * 0.5, base[2]], [base[0] + dir[0] * len, base[1] + len, base[2]]]} width={0.16} taper={[0.6, 0.02]} seed={20 + i} rough={0.05} bristles={false} />
              {i !== 1 && <Brush pts={[[base[0] - dir[0] * 0.25, base[1] - 0.22, base[2]], [base[0] - dir[0] * 0.2, base[1] - 0.12, base[2]]]} width={0.08} taper={[0.3, 0.3]} seed={30 + i} bristles={false} />}
            </group>
          );
        })}
    </group>
  );
};

/* ---------------- poses ---------------- */

export const STICK_POSES: Record<string, { name: string; pose: StickPose }> = {
  idle: { name: 'Стоит', pose: {} },
  walk: {
    name: 'Идёт',
    pose: { lean: 0.08, handL: [0.55, 1.95, -0.1], handR: [-0.45, 1.85, 0.1], footL: [0.6, 0.06, -0.1], footR: [-0.5, 0.25, 0.1], kneeDir: [1, 0, 0] },
  },
  run: {
    name: 'Бежит',
    pose: { hips: [0, 1.4, 0], lean: 0.35, handL: [0.9, 2.5, -0.1], handR: [-0.7, 1.8, 0.1], elbowL: [0, -1, 0], elbowR: [-1, 0.5, 0], footL: [0.9, 0.3, -0.1], footR: [-0.9, 0.8, 0.1] },
  },
  jump: {
    name: 'Прыжок',
    pose: { hips: [0, 2.3, 0], handL: [-0.6, 3.9, -0.1], handR: [0.6, 3.9, 0.1], elbowL: [-1, 0, 0], elbowR: [1, 0, 0], footL: [-0.35, 1.0, -0.1], footR: [0.4, 1.1, 0.1], kneeDir: [1, 0.3, 0] },
  },
  surprised: {
    name: 'Испуг «!»',
    pose: { lean: -0.12, handL: [1.15, 2.45, -0.1], handR: [1.05, 2.1, 0.1], elbowL: [0, -1, 0], elbowR: [0, -1, 0], footL: [0.35, 0.06, -0.1], footR: [-0.25, 0.4, 0.1], alarm: 1 },
  },
  wave: { name: 'Машет', pose: { handR: [1.0, 3.6, 0.4], elbowR: [1, -0.3, 0] } },
  sit: { name: 'Сидит', pose: { hips: [0, 0.95, 0], lean: -0.05, footL: [0.9, 0.06, -0.1], footR: [1.0, 0.06, 0.1], kneeDir: [1, 1, 0], handL: [0.6, 1.4, -0.1], handR: [0.65, 1.45, 0.1] } },
  think: { name: 'Думает', pose: { headTilt: 0.15, handR: [0.35, 2.85, 0.1], elbowR: [0.3, -1, 0], handL: [0.3, 1.9, -0.1] } },
};
