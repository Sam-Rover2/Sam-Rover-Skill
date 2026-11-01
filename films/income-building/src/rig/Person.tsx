import * as THREE from 'three';
import { G } from '../lib/geometry';
import { flat } from '../lib/materials';
import { LINE, P } from '../lib/style';
import { Toon, type V3 } from '../lib/Toon';
import { Limb, reach } from './Limb';

/**
 * Character in the style of the reference films (references/REFERENCE.md):
 * big white head WITHOUT ears or nose, coloured pill body, long thin dark arms and legs
 * (legs ≈ half the height), big expressive eyes and mouths, personality through accessories.
 * Height ≈ 4.1 units (≈ 1.85 m with the hat-less head; 1 m = 2.2).
 */

export type Hat = 'none' | 'pith' | 'kepi' | 'bowler' | 'nonla' | 'cap' | 'hardhat' | 'tophat' | 'gradcap' | 'beanie' | 'visor';
export type Outfit = 'colonial' | 'frock' | 'shirt' | 'apron' | 'tunic' | 'suit' | 'overalls' | 'gown' | 'scrubs' | 'hoodie' | 'vest';

export interface PersonLook {
  body: string; // main clothing colour
  trim?: string; // belt / collar / buttons colour
  hat?: Hat;
  hatColor?: string;
  outfit?: Outfit;
  moustache?: 'none' | 'thin' | 'big';
  monocle?: boolean;
  glasses?: boolean;
  hair?: 'none' | 'cap' | 'side';
  hairColor?: string;
  build?: number; // body width multiplier (0.85 … 1.3)
  height?: number; // overall scale (0.8 … 1.1)
  shoe?: string;
}

export type Face = 'neutral' | 'smile' | 'grin' | 'teeth' | 'o' | 'smug' | 'panic' | 'squint';

export interface PersonPose {
  handL?: V3;
  handR?: V3;
  footL?: V3;
  footR?: V3;
  hips?: V3; // offset
  lean?: number;
  headTilt?: number;
  headTurn?: number;
  face?: Face;
  look?: [number, number];
  holdL?: React.ReactNode;
  holdR?: React.ReactNode;
}

const HEAD = 0.82; // head radius
const LEG = 1.9;
const ARM = 1.45;
const HIP = 1.86; // hip height
const BODY_H = 1.25;
const WHITE = '#f6f4ef';
const ink = () => flat(LINE.color);

/** face decal on the front of the white head */
const onHead = (x: number, y: number, lift = 0.01): V3 => [x, y, Math.sqrt(Math.max(0, HEAD * HEAD - x * x - y * y)) * 0.97 + lift];

/** Rotation that lays a flat decal on the head sphere at (x, y) (its normal = the sphere normal). */
const surfaceRot = (x: number, y: number): [number, number, number] => {
  const n = new THREE.Vector3(...onHead(x, y)).normalize();
  const e = new THREE.Euler().setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n));
  return [e.x, e.y, e.z];
};

const Eyes: React.FC<{ face: Face; look: [number, number]; glasses?: boolean }> = ({ face, look, glasses }) => {
  const big = face === 'panic' || face === 'o';
  return (
    <>
      {[-1, 1].map((s) => {
        const p = onHead(s * 0.27, 0.12, 0.035);
        if (face === 'squint' || face === 'smug')
          return (
            <mesh key={s} geometry={G.stick} material={ink()} position={p} rotation={[0, 0, Math.PI / 2 + (face === 'smug' ? s * 0.12 : 0)]} scale={[0.028, 0.08, 0.028]} />
          );
        return (
          <group key={s} position={p} rotation={surfaceRot(s * 0.27, 0.12)}>
            {big && <mesh geometry={G.disc} material={flat('#ffffff')} scale={0.17} />}
            {big && <mesh geometry={G.thinRing} material={ink()} scale={0.17} />}
            <mesh geometry={G.sphere} material={ink()} position={[look[0] * 0.04, look[1] * 0.04, 0.01]} scale={big ? [0.06, 0.06, 0.03] : [0.07, 0.095, 0.035]} />
            {!big && <mesh geometry={G.disc} material={flat('#ffffff')} position={[0.022 + look[0] * 0.04, 0.035 + look[1] * 0.04, 0.04]} scale={0.02} />}
          </group>
        );
      })}
      {/* brows */}
      {[-1, 1].map((s) => {
        const angry = face === 'smug' || face === 'squint';
        const worried = face === 'panic';
        const p = onHead(s * 0.28, big ? 0.36 : 0.32);
        return (
          <mesh key={s} geometry={G.stick} material={ink()} position={p} rotation={[0, 0, Math.PI / 2 + s * (angry ? -0.35 : worried ? 0.35 : 0.08)]} scale={[0.026, 0.085, 0.026]} />
        );
      })}
      {glasses &&
        [-1, 1].map((s) => <mesh key={s} geometry={G.ring} material={ink()} position={onHead(s * 0.27, 0.12, 0.07)} rotation={surfaceRot(s * 0.27, 0.12)} scale={0.15} />)}
    </>
  );
};

const Mouth: React.FC<{ face: Face }> = ({ face }) => {
  const p = onHead(0, -0.24);
  if (face === 'teeth' || face === 'grin')
    return (
      <group position={p}>
        <mesh geometry={G.disc} material={ink()} scale={[0.2, face === 'grin' ? 0.11 : 0.08, 1]} />
        <mesh geometry={G.plane} material={flat('#ffffff')} position={[0, face === 'grin' ? 0.035 : 0, 0.003]} scale={[0.3, 0.05, 1]} />
        {[-0.08, 0, 0.08].map((x) => (
          <mesh key={x} geometry={G.plane} material={ink()} position={[x, face === 'grin' ? 0.035 : 0, 0.005]} scale={[0.008, 0.05, 1]} />
        ))}
      </group>
    );
  if (face === 'o' || face === 'panic') return <mesh geometry={G.disc} material={ink()} position={p} scale={[0.07, 0.09, 1]} />;
  if (face === 'neutral') return <mesh geometry={G.stick} material={ink()} position={p} rotation={[0, 0, Math.PI / 2]} scale={[0.02, 0.07, 0.02]} />;
  if (face === 'smug')
    return <mesh geometry={G.arc} material={ink()} position={[p[0] + 0.05, p[1], p[2]]} rotation={[0, 0, Math.PI + 0.35]} scale={0.1} />;
  return <mesh geometry={G.arc} material={ink()} position={p} rotation={[0, 0, Math.PI]} scale={0.11} />;
};

const HatMesh: React.FC<{ hat: Hat; color?: string }> = ({ hat, color }) => {
  switch (hat) {
    case 'hardhat': // construction / elevator-tech helmet with a ridge and a brim
      return (
        <group position={[0, HEAD * 0.5, 0]} rotation={[-0.08, 0, 0]}>
          <Toon geometry={G.hemi} color={color ?? '#f2c230'} scale={[HEAD * 1.0, HEAD * 0.82, HEAD * 1.04]} />
          <Toon geometry={G.box} color={color ?? '#f2c230'} position={[0, HEAD * 0.55, 0]} scale={[0.14, 0.18, HEAD * 1.7]} line={3} />
          <Toon geometry={G.cyl} color={color ?? '#f2c230'} position={[0, 0.02, 0.12]} scale={[HEAD * 1.18, 0.05, HEAD * 1.3]} line={3} />
        </group>
      );
    case 'tophat':
      return (
        <group position={[0, HEAD * 0.72, 0]} rotation={[-0.06, 0, 0.05]}>
          <Toon geometry={G.cyl} color={color ?? '#1b1b1f'} position={[0, 0.55, 0]} scale={[HEAD * 0.7, 1.1, HEAD * 0.7]} />
          <Toon geometry={G.cyl} color="#c8302c" position={[0, 0.15, 0]} scale={[HEAD * 0.72, 0.16, HEAD * 0.72]} line={2} />
          <Toon geometry={G.cyl} color={color ?? '#1b1b1f'} scale={[HEAD * 1.15, 0.05, HEAD * 1.15]} line={3} />
        </group>
      );
    case 'gradcap': // mortarboard with a tassel
      return (
        <group position={[0, HEAD * 0.7, 0]} rotation={[-0.12, 0, 0]}>
          <Toon geometry={G.cyl} color={color ?? '#1b1b1f'} position={[0, 0.05, 0]} scale={[HEAD * 0.75, 0.3, HEAD * 0.75]} />
          <Toon geometry={G.box} color={color ?? '#1b1b1f'} position={[0, 0.25, 0]} rotation={[0, Math.PI / 4, 0]} scale={[HEAD * 1.7, 0.07, HEAD * 1.7]} line={3} />
          <Toon geometry={G.cyl} color="#f2c230" position={[HEAD * 0.75, -0.05, HEAD * 0.2]} scale={[0.02, 0.6, 0.02]} line={0} />
          <Toon geometry={G.sphere} color="#f2c230" position={[HEAD * 0.75, -0.38, HEAD * 0.2]} scale={0.07} line={1} />
        </group>
      );
    case 'beanie':
      return (
        <group position={[0, HEAD * 0.45, 0]}>
          <Toon geometry={G.hemi} color={color ?? '#3a6fb0'} scale={[HEAD * 1.03, HEAD * 0.9, HEAD * 1.03]} />
          <Toon geometry={G.cyl} color={color ?? '#3a6fb0'} position={[0, 0.02, 0]} scale={[HEAD * 1.05, 0.22, HEAD * 1.05]} line={3} />
          <Toon geometry={G.sphere} color="#f4ead6" position={[0, HEAD * 0.9, 0]} scale={0.15} line={2} />
        </group>
      );
    case 'visor': // shop cap with a stiff peak
      return (
        <group position={[0, HEAD * 0.55, 0]}>
          <Toon geometry={G.hemi} color={color ?? '#c8302c'} scale={[HEAD * 0.98, HEAD * 0.6, HEAD * 1.0]} />
          <Toon geometry={G.hemi} color={color ?? '#c8302c'} position={[0, 0.02, HEAD * 0.75]} rotation={[0.1, 0, 0]} scale={[HEAD * 0.7, 0.05, HEAD * 0.6]} line={3} />
        </group>
      );
    case 'pith': // colonial sun helmet
      return (
        <group position={[0, HEAD * 0.55, 0]} rotation={[-0.08, 0, 0]}>
          <Toon geometry={G.hemi} color={color ?? '#efe6cf'} scale={[HEAD * 0.98, HEAD * 0.85, HEAD * 1.05]} />
          <Toon geometry={G.cyl} color={color ?? '#efe6cf'} position={[0, 0.02, 0.04]} scale={[HEAD * 1.35, 0.04, HEAD * 1.45]} />
          <Toon geometry={G.cyl} color="#b9a57a" position={[0, 0.12, 0]} scale={[HEAD * 0.99, 0.09, HEAD * 1.06]} line={3} />
        </group>
      );
    case 'kepi': // French officer cap
      return (
        <group position={[0, HEAD * 0.6, 0]} rotation={[-0.1, 0, 0]}>
          <Toon geometry={G.cyl} color={color ?? '#2c3a6b'} position={[0, 0.25, 0]} scale={[HEAD * 0.82, 0.55, HEAD * 0.82]} />
          <Toon geometry={G.cyl} color="#c8302c" position={[0, 0.55, 0]} scale={[HEAD * 0.8, 0.06, HEAD * 0.8]} line={3} />
          <Toon geometry={G.cyl} color="#d9b44a" position={[0, 0.05, 0]} scale={[HEAD * 0.84, 0.07, HEAD * 0.84]} line={3} />
          <Toon geometry={G.box} color="#1b1b1f" position={[0, 0.0, HEAD * 0.75]} rotation={[0.3, 0, 0]} scale={[HEAD * 1.1, 0.05, 0.45]} line={3} />
        </group>
      );
    case 'bowler':
      return (
        <group position={[0, HEAD * 0.62, 0]}>
          <Toon geometry={G.hemi} color={color ?? '#2a2420'} scale={[HEAD * 0.82, HEAD * 0.75, HEAD * 0.82]} />
          <Toon geometry={G.cyl} color={color ?? '#2a2420'} scale={[HEAD * 1.15, 0.04, HEAD * 1.15]} />
        </group>
      );
    case 'nonla': // Vietnamese conical hat
      return (
        <group position={[0, HEAD * 0.55, 0]} rotation={[-0.05, 0, 0]}>
          <Toon geometry={G.cone} color={color ?? '#e3c27a'} position={[0, 0.42, 0]} scale={[HEAD * 1.75, 0.85, HEAD * 1.75]} />
          {[0.2, 0.4, 0.6].map((k) => (
            <mesh key={k} geometry={G.thinRing} material={flat('#b8924a')} position={[0, 0.42 - 0.425 + k * 0.85, 0]} rotation={[Math.PI / 2, 0, 0]} scale={HEAD * 1.75 * (1 - k) + 0.01} />
          ))}
        </group>
      );
    case 'cap': // flat newsboy cap sitting ON the head, with a visible brim
      return (
        <group position={[0, HEAD * 0.7, 0.02]}>
          <Toon geometry={G.sphere} color={color ?? '#6b5444'} scale={[HEAD * 0.92, HEAD * 0.32, HEAD * 0.98]} />
          <Toon geometry={G.cyl} color={color ?? '#6b5444'} position={[0, -0.05, 0]} scale={[HEAD * 0.86, 0.12, HEAD * 0.9]} line={3} />
          <Toon geometry={G.sphere} color={color ?? '#6b5444'} position={[0, HEAD * 0.3, 0]} scale={0.07} line={2} />
          {/* brim sticks out in front of the forehead */}
          <Toon geometry={G.hemi} color="#4f3d30" position={[0, -0.1, HEAD * 0.62]} rotation={[0.25, 0, 0]} scale={[HEAD * 0.85, 0.07, HEAD * 0.75]} line={4} />
        </group>
      );
    default:
      return null;
  }
};

/**
 * Keeps a hand target OUTSIDE the head and the body (QA-038): hands never go into the
 * character, and a raised arm passes beside the head, not through it.
 */
function safeHand(p: V3, side: number, hips: V3, top: V3, headC: V3, b: number): V3 {
  let [x, y, z] = p;
  // raised above the shoulders: keep the hand out to the side so the arm clears the head
  if (y > top[1] - 0.2 && Math.abs(x - headC[0]) < 1.25 && z - headC[2] < 1.1) x = headC[0] + side * 1.25;
  // head: stay outside a sphere a bit larger than the head
  const R = HEAD + 0.3;
  let dx = x - headC[0], dy = y - headC[1], dz = z - headC[2];
  let d = Math.hypot(dx, dy, dz);
  if (d < R) {
    if (d < 1e-3) { dx = 0; dy = 0; dz = 1; d = 1; }
    x = headC[0] + (dx / d) * R; y = headC[1] + (dy / d) * R; z = headC[2] + (dz / d) * R;
  }
  // body: an elliptic column from the hips to the top of the body
  if (y > hips[1] - 0.2 && y < top[1] + 0.1) {
    const rx = 0.52 * b + 0.16, rz = 0.46 * b + 0.16;
    const ex = (x - hips[0]) / rx, ez = (z - hips[2]) / rz;
    const r = Math.hypot(ex, ez);
    if (r < 1) {
      const k = r < 1e-3 ? 0 : 1 / r;
      x = r < 1e-3 ? hips[0] + side * rx : hips[0] + ex * k * rx;
      z = r < 1e-3 ? z : hips[2] + ez * k * rz;
    }
  }
  return [x, y, z];
}

export const Person: React.FC<{ look: PersonLook; pose?: PersonPose }> = ({ look, pose = {} }) => {
  const b = look.build ?? 1;
  const face = pose.face ?? 'smile';
  const look2 = pose.look ?? [0, 0];
  const hips: V3 = pose.hips ? [pose.hips[0], HIP + pose.hips[1], pose.hips[2]] : [0, HIP, 0];
  const lean = pose.lean ?? 0;
  const top: V3 = [hips[0], hips[1] + BODY_H, hips[2] + Math.sin(lean) * BODY_H];
  const shY = hips[1] + BODY_H * 0.82;
  const shX = 0.42 * b;
  const sL: V3 = [-shX, shY, hips[2] + Math.sin(lean) * BODY_H * 0.8];
  const sR: V3 = [shX, shY, sL[2]];
  const headC: V3 = [top[0], top[1] + HEAD * 0.82, top[2]];
  const hL = reach(sL, safeHand(pose.handL ?? [-shX - 0.25, hips[1] - 0.05, 0.1], -1, hips, top, headC, b), ARM);
  const hR = reach(sR, safeHand(pose.handR ?? [shX + 0.25, hips[1] - 0.05, 0.1], 1, hips, top, headC, b), ARM);
  const fL = reach([hips[0] - 0.2, hips[1], hips[2]], pose.footL ?? [-0.24, 0.08, 0.05], LEG);
  const fR = reach([hips[0] + 0.2, hips[1], hips[2]], pose.footR ?? [0.24, 0.08, 0.05], LEG);
  const shoe = look.shoe ?? '#2a2420';
  const front = 0.5 * b;
  const outfit = look.outfit ?? 'shirt';
  const trim = look.trim ?? '#1b1b1f';

  return (
    <group scale={look.height ?? 1}>
      {/* legs + shoes */}
      {[[[hips[0] - 0.2, hips[1], hips[2]], fL], [[hips[0] + 0.2, hips[1], hips[2]], fR]].map(([a, f], i) => (
        <group key={i}>
          <Limb root={a as V3} tip={f as V3} length={LEG} bendDir={[0, 0, 1]} radius={0.055} />
          <Toon geometry={G.softBox} color={shoe} position={[(f as V3)[0], Math.max(0.08, (f as V3)[1] - 0.02), (f as V3)[2] + 0.1]} scale={[0.22, 0.15, 0.38]} line={4} />
        </group>
      ))}
      {/* arms + small round hands */}
      <Limb root={sL} tip={hL} length={ARM} bendDir={[-0.4, -0.1, -0.6]} radius={0.05} />
      <Limb root={sR} tip={hR} length={ARM} bendDir={[0.4, -0.1, -0.6]} radius={0.05} />
      <group position={hL}>
        <Toon geometry={G.sphere} color={WHITE} scale={0.12} />
        {pose.holdL}
      </group>
      <group position={hR}>
        <Toon geometry={G.sphere} color={WHITE} scale={0.12} />
        {pose.holdR}
      </group>

      {/* body pill */}
      <group position={hips} rotation={[lean, 0, 0]}>
        <Toon geometry={G.capsule} color={look.body} position={[0, BODY_H * 0.5, 0]} scale={[0.52 * b, BODY_H / 3, 0.46 * b]} />
        {outfit === 'colonial' && (
          <>
            {[0.3, 0.55, 0.8].map((k) => (
              <Toon key={k} geometry={G.sphere} color="#d9b44a" position={[0, BODY_H * k, front - 0.02]} scale={0.045} line={2} />
            ))}
            <Toon geometry={G.torus} color="#8a6a3a" position={[0, BODY_H * 0.22, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.52 * b, 0.46 * b, 0.25]} line={3} />
            {[-1, 1].map((s) => (
              <Toon key={s} geometry={G.box} color={look.body} position={[s * 0.18, BODY_H * 0.62, front - 0.04]} scale={[0.2, 0.16, 0.04]} line={3} />
            ))}
          </>
        )}
        {outfit === 'frock' && (
          <>
            {[-1, 1].map((s) => (
              <Toon key={s} geometry={G.box} color="#f4f1ea" position={[s * 0.1, BODY_H * 0.86, front - 0.08]} rotation={[0.3, 0, s * 0.6]} scale={[0.2, 0.14, 0.04]} line={3} />
            ))}
            {[0.35, 0.55].map((k) => (
              <Toon key={k} geometry={G.sphere} color="#d9b44a" position={[0.08, BODY_H * k, front - 0.02]} scale={0.04} line={2} />
            ))}
            <Toon geometry={G.box} color="#c8302c" position={[0, BODY_H * 0.72, front - 0.03]} rotation={[0.15, 0, 0]} scale={[0.08, 0.3, 0.03]} line={2} />
          </>
        )}
        {outfit === 'apron' && <Toon geometry={G.softBox} color={trim} position={[0, BODY_H * 0.38, front - 0.06]} rotation={[-0.1, 0, 0]} scale={[0.62 * b, BODY_H * 0.6, 0.06]} line={3} />}
        {(outfit === 'suit' || outfit === 'vest') && (
          <>
            {/* white shirt collar, tie */}
            {[-1, 1].map((s) => (
              <Toon key={s} geometry={G.box} color="#f4f1ea" position={[s * 0.11, BODY_H * 0.86, front - 0.07]} rotation={[0.3, 0, s * 0.6]} scale={[0.2, 0.13, 0.04]} line={3} />
            ))}
            <Toon geometry={G.box} color={trim} position={[0, BODY_H * 0.62, front - 0.02]} rotation={[0.12, 0, 0]} scale={[0.11, 0.42, 0.03]} line={2} />
            {outfit === 'suit' &&
              [-1, 1].map((s) => (
                <Toon key={s} geometry={G.box} color={look.body} position={[s * 0.2, BODY_H * 0.62, front - 0.01]} rotation={[0.1, 0, s * 0.35]} scale={[0.1, 0.5, 0.04]} line={3} />
              ))}
            {outfit === 'vest' && <Toon geometry={G.box} color="#f4f1ea" position={[0, BODY_H * 0.9, front - 0.12]} scale={[0.36, 0.14, 0.05]} line={2} />}
          </>
        )}
        {outfit === 'overalls' && (
          <>
            <Toon geometry={G.softBox} color={look.body} position={[0, BODY_H * 0.36, front - 0.06]} scale={[0.66 * b, BODY_H * 0.5, 0.08]} line={3} />
            {[-1, 1].map((s) => (
              <Toon key={s} geometry={G.box} color={look.body} position={[s * 0.2, BODY_H * 0.74, front - 0.05]} scale={[0.09, 0.42, 0.05]} line={2} />
            ))}
            {[-1, 1].map((s) => (
              <Toon key={s} geometry={G.sphere} color="#d9b44a" position={[s * 0.2, BODY_H * 0.58, front - 0.01]} scale={0.04} line={1} />
            ))}
            <Toon geometry={G.box} color={trim} position={[0, BODY_H * 0.4, front - 0.01]} scale={[0.28, 0.2, 0.03]} line={2} />
          </>
        )}
        {outfit === 'gown' && <Toon geometry={G.cone} color={look.body} position={[0, -0.25, 0]} scale={[0.75 * b, 1.3, 0.7 * b]} />}
        {outfit === 'scrubs' && (
          <>
            <Toon geometry={G.cone} color={trim} position={[0, BODY_H * 0.85, front - 0.04]} rotation={[Math.PI, 0, 0]} scale={[0.16, 0.25, 0.03]} line={2} />
            <Toon geometry={G.box} color={trim} position={[0.2, BODY_H * 0.62, front - 0.03]} scale={[0.18, 0.16, 0.03]} line={2} />
          </>
        )}
        {outfit === 'hoodie' && (
          <>
            <Toon geometry={G.torus} color={look.body} position={[0, BODY_H * 0.98, -0.12]} rotation={[1.3, 0, 0]} scale={[0.42, 0.42, 0.55]} line={3} />
            <Toon geometry={G.softBox} color={trim} position={[0, BODY_H * 0.32, front - 0.04]} scale={[0.5, 0.24, 0.05]} line={2} />
            {[-1, 1].map((s) => (
              <Toon key={s} geometry={G.cyl} color="#f4f1ea" position={[s * 0.09, BODY_H * 0.72, front]} scale={[0.02, 0.28, 0.02]} line={0} />
            ))}
          </>
        )}
        {outfit === 'tunic' && <Toon geometry={G.box} color={trim} position={[0.12, BODY_H * 0.55, front - 0.03]} rotation={[0.1, 0, 0]} scale={[0.05, BODY_H * 0.6, 0.03]} line={2} />}
        {outfit === 'shirt' && (
          <>
            {[-1, 1].map((s) => (
              <mesh key={s} geometry={G.stick} material={ink()} position={[s * 0.08, BODY_H * 0.86, front - 0.04]} rotation={[0.3, 0, s * 0.45]} scale={[0.02, 0.12, 0.02]} />
            ))}
          </>
        )}
      </group>

      {/* head */}
      <group position={[top[0], top[1] + HEAD * 0.82, top[2]]} rotation={[0, pose.headTurn ?? 0, pose.headTilt ?? 0]}>
        <Toon geometry={G.sphere} color={WHITE} scale={HEAD} line={7} />
        {look.hair === 'cap' && <Toon geometry={G.hemi} color={look.hairColor ?? '#3a2a20'} position={[0, 0.12, -0.05]} rotation={[-0.45, 0, 0]} scale={HEAD * 1.03} />}
        {look.hair === 'side' && <Toon geometry={G.hemi} color={look.hairColor ?? '#3a2a20'} position={[0, 0.1, -0.05]} rotation={[-0.4, 0, 0.25]} scale={HEAD * 1.03} />}
        <Eyes face={face} look={look2} glasses={look.glasses} />
        <Mouth face={face} />
        {look.moustache && look.moustache !== 'none' &&
          [-1, 1].map((s) => (
            <Toon key={s} geometry={G.sphere} color={look.hairColor ?? '#3a2a20'} position={onHead(s * (look.moustache === 'big' ? 0.16 : 0.1), -0.12, 0.03)} rotation={[0, 0, s * (look.moustache === 'big' ? 0.5 : 0.3)]} scale={look.moustache === 'big' ? [0.2, 0.07, 0.06] : [0.12, 0.035, 0.04]} line={3} />
          ))}
        {look.monocle && (
          <>
            <mesh geometry={G.ring} material={flat('#d9b44a')} position={onHead(0.27, 0.12, 0.06)} scale={0.17} />
            <mesh geometry={G.stick} material={flat('#d9b44a')} position={onHead(0.42, -0.08, 0.02)} rotation={[0, 0, 0.4]} scale={[0.008, 0.18, 0.008]} />
          </>
        )}
        <HatMesh hat={look.hat ?? 'none'} color={look.hatColor} />
      </group>
    </group>
  );
};

/* ---------------- rat ---------------- */

export interface RatPose {
  tail?: boolean; // false = tail cut off (a short stump with a bandage)
  face?: 'happy' | 'scared' | 'sly';
  stand?: boolean; // on hind legs
  color?: string;
}

/** Cute cartoon rat in the same style: round body, big ears, big eyes, Bezier tail. ~0.5 m long. */
export const Rat: React.FC<{ pose?: RatPose; scale?: number }> = ({ pose = {}, scale = 1 }) => {
  const c = pose.color ?? '#8f8a90';
  const belly = '#d8d2d6';
  const pink = '#f0a5b0';
  const stand = pose.stand;
  const face = pose.face ?? 'happy';
  return (
    <group scale={scale}>
      <group rotation={[stand ? -1.1 : 0, 0, 0]} position={[0, stand ? 0.35 : 0, 0]}>
        {/* body */}
        <Toon geometry={G.sphere} color={c} position={[0, 0.34, -0.1]} scale={[0.34, 0.3, 0.48]} />
        <Toon geometry={G.sphere} color={belly} position={[0, 0.27, 0.06]} scale={[0.22, 0.2, 0.3]} line={3} />
        {/* head */}
        <group position={[0, 0.48, 0.36]}>
          <Toon geometry={G.sphere} color={c} scale={[0.26, 0.24, 0.28]} />
          <Toon geometry={G.cone} color={c} position={[0, -0.04, 0.28]} rotation={[Math.PI / 2, 0, 0]} scale={[0.13, 0.22, 0.11]} line={4} />
          <Toon geometry={G.sphere} color={pink} position={[0, -0.04, 0.4]} scale={0.045} line={2} />
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.2, 0.2, -0.04]} rotation={[0, 0, s * -0.3]}>
              <Toon geometry={G.sphere} color={c} scale={[0.14, 0.16, 0.05]} />
              <mesh geometry={G.disc} material={flat(pink)} position={[0, 0, 0.052]} scale={[0.09, 0.11, 1]} />
            </group>
          ))}
          {/* eyes: white eyeballs that sit ON the head (not decals sunk into it) */}
          {[-1, 1].map((s) => {
            const r = face === 'scared' ? 0.085 : 0.075;
            return (
              <group key={s} position={[s * 0.11, 0.07, 0.2]} rotation={[0, s * 0.35, 0]}>
                <Toon geometry={G.sphere} color="#ffffff" scale={[r, r * 1.1, r * 0.7]} line={3} />
                <mesh geometry={G.sphere} material={ink()} position={[0, face === 'sly' ? -0.012 : 0, r * 0.62]} scale={[r * 0.5, r * 0.6, r * 0.2]} />
                <mesh geometry={G.disc} material={flat('#ffffff')} position={[r * 0.18, r * 0.25, r * 0.75]} scale={r * 0.18} />
                {face === 'sly' && (
                  /* heavy lid for the sly look: covers the top of the eye, does not cross it */
                  <Toon geometry={G.hemi} color={c} position={[0, 0, 0]} rotation={[0.35, 0, 0]} scale={[r * 1.08, r * 1.2, r * 0.8]} line={3} />
                )}
              </group>
            );
          })}
          {/* whiskers */}
          {[-1, 1].map((s) =>
            [-0.04, 0.02].map((y) => (
              <mesh key={`${s}${y}`} geometry={G.stick} material={ink()} position={[s * 0.14, -0.04 + y, 0.33]} rotation={[0, 0, Math.PI / 2 + s * y * 4]} scale={[0.006, 0.12, 0.006]} />
            )),
          )}
          {face === 'scared' && <mesh geometry={G.disc} material={ink()} position={[0, -0.15, 0.25]} scale={[0.04, 0.03, 1]} />}
        </group>
        {/* paws */}
        {[-1, 1].map((s) => (
          <Toon key={s} geometry={G.sphere} color={pink} position={[s * 0.16, 0.06, 0.18]} scale={[0.07, 0.05, 0.09]} line={3} />
        ))}
        {[-1, 1].map((s) => (
          <Toon key={`b${s}`} geometry={G.sphere} color={pink} position={[s * 0.2, 0.06, -0.38]} scale={[0.08, 0.05, 0.12]} line={3} />
        ))}
        {/* tail or stump */}
        {pose.tail === false ? (
          <group position={[0, 0.3, -0.58]}>
            <Toon geometry={G.sphere} color={pink} scale={[0.06, 0.06, 0.08]} line={3} />
            <Toon geometry={G.cyl} color="#ffffff" rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.03]} scale={[0.07, 0.05, 0.07]} line={3} />
          </group>
        ) : (
          <Limb root={[0, 0.28, -0.56]} tip={[0.35, 0.05, -1.3]} length={1.0} bendDir={[1, 1, 0]} radius={0.03} color={pink} />
        )}
      </group>
    </group>
  );
};
export { P };
