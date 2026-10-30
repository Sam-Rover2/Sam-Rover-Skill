import * as THREE from 'three';
import { G } from '../lib/geometry';
import { flat } from '../lib/materials';
import { LINE, P } from '../lib/style';
import { Toon, type V3 } from '../lib/Toon';
import { Limb, reach } from './Limb';

export type Hair = 'short' | 'bob' | 'bun' | 'beanie' | 'grey';
export type Top = 'sweater' | 'hoodie' | 'shirt' | 'apron';
export type Expr = 'smile' | 'grin' | 'open' | 'o' | 'flat' | 'sad';

export interface Look {
  skin: string;
  top: Top;
  topColor: string;
  hair: Hair;
  hairColor: string;
  glasses?: boolean;
  tie?: string;
  shoe?: string;
  /** Overall size, 1 = default (≈3.8 units tall). */
  size?: number;
}

export interface Pose {
  hips?: V3; // pelvis offset from standing
  lean?: number; // forward (+) / back (−), radians
  twist?: number; // torso turn around Y
  side?: number; // torso tilt left/right
  handL?: V3; // targets in character space; undefined = relaxed
  handR?: V3;
  elbowL?: V3; // direction the elbow bends to
  elbowR?: V3;
  footL?: V3;
  footR?: V3;
  /** Direction the knees bend to (default forward; sitting: forward-up). */
  kneeDir?: V3;
  headTurn?: number;
  headTilt?: number;
  headNod?: number;
  look?: [number, number]; // pupils −1..1
  blink?: number;
  happy?: number; // 1 = ^^ eyes
  brows?: number; // −1 angry … 0 … 1 worried/raised
  expr?: Expr;
  talk?: number; // 0..1 mouth opening while speaking
  squash?: number; // breathing / stretch
  holdL?: React.ReactNode;
  holdR?: React.ReactNode;
}

export const HIPS_Y = 1.12;
export const ARM = 1.02;
export const LEG = 1.16;
const R = 0.78; // head radius

const rot = (lean: number, twist: number, side: number) => new THREE.Euler(lean, twist, side, 'YXZ');
const apply = (o: V3, e: THREE.Euler, base: V3): V3 => {
  const p = new THREE.Vector3(...o).applyEuler(e);
  return [p.x + base[0], p.y + base[1], p.z + base[2]];
};

/** Point on the head surface for face decals. */
const onHead = (x: number, y: number, lift = 0.012): V3 => {
  const z = Math.sqrt(Math.max(0, 1 - (x / R) ** 2 - (y / (R * 1.04)) ** 2)) * R * 0.95;
  return [x, y, z + lift];
};

export const relaxedHand = (side: 1 | -1, hipsY = HIPS_Y): V3 => [side * 0.68, hipsY + 0.08, 0.08];
export const restFoot = (side: 1 | -1): V3 => [side * 0.24, 0.1, 0.04];

const ink = () => flat(LINE.color);

const HairMesh: React.FC<{ look: Look }> = ({ look }) => {
  const c = look.hairColor;
  switch (look.hair) {
    case 'bob':
      return (
        <group>
          <Toon geometry={G.hemi} color={c} position={[0, 0.08, -0.04]} rotation={[-0.38, 0, 0]} scale={[R * 1.06, R * 1.06, R * 1.04]} />
          {[-1, 1].map((s) => (
            <Toon key={s} geometry={G.sphere} color={c} position={[s * R * 0.82, -0.2, -0.12]} rotation={[0, 0, s * 0.15]} scale={[0.24, 0.5, 0.42]} />
          ))}
          <Toon geometry={G.sphere} color={c} position={[0, -0.12, -0.4]} scale={[R * 0.92, 0.6, 0.4]} />
        </group>
      );
    case 'bun':
      return (
        <group>
          <Toon geometry={G.hemi} color={c} position={[0, 0.04, -0.03]} rotation={[-0.4, 0, 0]} scale={[R * 1.04, R * 1.02, R * 1.02]} />
          <Toon geometry={G.sphere} color={c} position={[0, R * 1.08, -0.2]} scale={0.3} />
        </group>
      );
    case 'beanie':
      return (
        <group>
          <Toon geometry={G.hemi} color={c} position={[0, 0.12, -0.02]} rotation={[-0.12, 0, 0]} scale={[R * 1.08, R * 1.05, R * 1.06]} />
          <Toon geometry={G.torus} color={c} position={[0, 0.16, -0.02]} rotation={[Math.PI / 2 - 0.12, 0, 0]} scale={[R * 1.02, R * 1.02, 0.5]} />
          <Toon geometry={G.sphere} color={c} position={[0, R * 1.18, -0.08]} scale={0.14} />
        </group>
      );
    case 'grey':
      return (
        <group>
          {[-1, 1].map((s) => (
            <Toon key={s} geometry={G.sphere} color={c} position={[s * R * 0.86, 0.1, -0.15]} scale={[0.2, 0.32, 0.4]} />
          ))}
          <Toon geometry={G.sphere} color={c} position={[0, 0.0, -0.5]} scale={[0.55, 0.4, 0.3]} />
        </group>
      );
    default:
      return (
        <Toon geometry={G.hemi} color={c} position={[0, 0.1, -0.06]} rotation={[-0.42, 0, 0]} scale={[R * 1.04, R * 1.0, R * 1.02]} />
      );
  }
};

const Mouth: React.FC<{ expr: Expr; talk: number }> = ({ expr, talk }) => {
  const p = onHead(0, -0.22);
  const e: Expr = talk > 0.15 ? 'open' : expr;
  if (e === 'open') {
    const o = Math.max(0.35, talk || 1);
    return (
      <group position={p}>
        <mesh geometry={G.disc} material={ink()} scale={[0.11, 0.1 * o, 1]} />
        <mesh geometry={G.disc} material={flat('#e86a6a')} position={[0, -0.04 * o, 0.003]} scale={[0.06, 0.04 * o, 1]} />
      </group>
    );
  }
  if (e === 'o') return <mesh geometry={G.disc} material={ink()} position={p} scale={[0.055, 0.075, 1]} />;
  if (e === 'flat') return <mesh geometry={G.stick} material={ink()} position={p} rotation={[0, 0, Math.PI / 2]} scale={[0.018, 0.07, 0.018]} />;
  if (e === 'sad') return <mesh geometry={G.arc} material={ink()} position={[p[0], p[1] - 0.06, p[2]]} scale={0.08} />;
  if (e === 'grin')
    return (
      <group position={[p[0], p[1] + 0.03, p[2]]}>
        <mesh geometry={G.disc} material={ink()} scale={[0.15, 0.1, 1]} position={[0, -0.04, 0]} />
        <mesh geometry={G.plane} material={flat(LINE.color)} position={[0, 0.03, 0]} scale={[0.3, 0.06, 1]} />
        <mesh geometry={G.disc} material={flat('#e86a6a')} position={[0, -0.09, 0.002]} scale={[0.07, 0.035, 1]} />
      </group>
    );
  return <mesh geometry={G.arc} material={ink()} position={p} rotation={[0, 0, Math.PI]} scale={0.1} />;
};

/** Parametric cartoon person: big round head, pill body, bendable Bezier arms/legs with rounded ends. */
export const Character: React.FC<{ look: Look; pose?: Pose }> = ({ look, pose = {} }) => {
  const {
    hips = [0, 0, 0],
    lean = 0,
    twist = 0,
    side = 0,
    elbowL = [-0.4, -0.1, -0.6],
    elbowR = [0.4, -0.1, -0.6],
    headTurn = 0,
    headTilt = 0,
    headNod = 0,
    look: eyes = [0, 0],
    blink = 0,
    happy = 0,
    brows = 0,
    expr = 'smile',
    talk = 0,
    squash = 1,
    kneeDir = [0, 0, 1],
  } = pose;
  const pelvis: V3 = [hips[0], HIPS_Y + hips[1], hips[2]];
  const e = rot(lean, twist, side);
  const shoulderL = apply([-0.45, 1.0, 0], e, pelvis);
  const shoulderR = apply([0.45, 1.0, 0], e, pelvis);
  const handL = reach(shoulderL, pose.handL ?? relaxedHand(-1, pelvis[1]), ARM);
  const handR = reach(shoulderR, pose.handR ?? relaxedHand(1, pelvis[1]), ARM);
  const hipL: V3 = [pelvis[0] - 0.2, pelvis[1] + 0.08, pelvis[2]];
  const hipR: V3 = [pelvis[0] + 0.2, pelvis[1] + 0.08, pelvis[2]];
  const footL = reach(hipL, pose.footL ?? restFoot(-1), LEG);
  const footR = reach(hipR, pose.footR ?? restFoot(1), LEG);
  const shoe = look.shoe ?? P.shoe;
  const top = look.topColor;
  const front = 0.44; // front surface of the body pill (z)

  return (
    <group scale={look.size ?? 1}>
      {/* legs + shoes */}
      <Limb root={hipL} tip={footL} length={LEG} bendDir={kneeDir} radius={0.06} />
      <Limb root={hipR} tip={footR} length={LEG} bendDir={kneeDir} radius={0.06} />
      {[footL, footR].map((f, i) => (
        <Toon key={i} geometry={G.softBox} color={shoe} position={[f[0], Math.max(0.09, f[1] - 0.02), f[2] + 0.1]} scale={[0.24, 0.17, 0.4]} line={4} />
      ))}

      {/* arms (behind the hands) */}
      <Limb root={shoulderL} tip={handL} length={ARM} bendDir={elbowL} radius={0.055} />
      <Limb root={shoulderR} tip={handR} length={ARM} bendDir={elbowR} radius={0.055} />
      <group position={handL}>
        <Toon geometry={G.sphere} color={look.skin} scale={0.14} />
        {pose.holdL}
      </group>
      <group position={handR}>
        <Toon geometry={G.sphere} color={look.skin} scale={0.14} />
        {pose.holdR}
      </group>

      {/* torso */}
      <group position={pelvis} rotation={e}>
        <group scale={[1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash)]}>
          <Toon geometry={G.capsule} color={top} position={[0, 0.62, 0]} scale={[0.58, 0.42, 0.45]} />
          {look.top === 'sweater' && (
            <>
              {[-1, 1].map((s) => (
                <mesh key={s} geometry={G.stick} material={ink()} position={[s * 0.09, 0.98, front - 0.02]} rotation={[0.25, 0, s * 0.45]} scale={[0.02, 0.15, 0.02]} />
              ))}
              <Toon geometry={G.torus} color={top} position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.5, 0.4, 0.25]} line={4} />
            </>
          )}
          {look.top === 'hoodie' && (
            <>
              <Toon geometry={G.torus} color={top} position={[0, 1.12, -0.12]} rotation={[Math.PI / 2.4, 0, 0]} scale={[0.36, 0.32, 0.5]} line={5} />
              <Toon geometry={G.softBox} color={top} position={[0, 0.35, front - 0.03]} rotation={[-0.15, 0, 0]} scale={[0.62, 0.3, 0.06]} line={4} />
              {[-1, 1].map((s) => (
                <mesh key={s} geometry={G.stick} material={flat(P.white)} position={[s * 0.08, 0.86, front + 0.01]} rotation={[0.2, 0, 0]} scale={[0.018, 0.12, 0.018]} />
              ))}
            </>
          )}
          {(look.top === 'shirt' || look.top === 'apron') && (
            <>
              {[-1, 1].map((s) => (
                <Toon key={s} geometry={G.box} color={P.white} position={[s * 0.1, 1.04, front - 0.06]} rotation={[0.3, 0, s * 0.7]} scale={[0.2, 0.12, 0.04]} line={4} />
              ))}
              {look.top === 'shirt' &&
                [0.8, 0.6, 0.4].map((y) => <mesh key={y} geometry={G.lowSphere} material={ink()} position={[0, y, front + 0.01]} scale={0.025} />)}
              {look.tie && (
                <Toon geometry={G.box} color={look.tie} position={[0, 0.78, front + 0.02]} rotation={[0.15, 0, 0]} scale={[0.1, 0.42, 0.03]} line={3} />
              )}
            </>
          )}
          {look.top === 'apron' && (
            <>
              <Toon geometry={G.softBox} color={P.apron} position={[0, 0.48, front - 0.04]} rotation={[-0.12, 0, 0]} scale={[0.66, 0.78, 0.06]} line={4} />
              <Toon geometry={G.softBox} color={P.apron} position={[0, 0.3, front + 0.0]} rotation={[-0.12, 0, 0]} scale={[0.3, 0.16, 0.05]} line={3} />
            </>
          )}
        </group>

        {/* head */}
        <group position={[0, 1.88 * squash, 0]} rotation={[headNod, headTurn, headTilt]}>
          <Toon geometry={G.sphere} color={look.skin} scale={[R, R * 1.04, R * 0.95]} />
          {[-1, 1].map((s) => (
            <Toon key={s} geometry={G.sphere} color={look.skin} position={[s * R * 0.97, -0.06, 0]} scale={[0.1, 0.15, 0.09]} line={4} />
          ))}
          <HairMesh look={look} />
          {/* eyes */}
          {[-1, 1].map((s) => {
            const p = onHead(s * 0.25 + eyes[0] * 0.05, 0.06 + eyes[1] * 0.04);
            if (happy > 0.5) return <mesh key={s} geometry={G.arc} material={ink()} position={[p[0], p[1] - 0.03, p[2]]} scale={0.09} />;
            const open = Math.max(0.1, 1 - blink);
            return (
              <group key={s} position={p}>
                <mesh geometry={G.sphere} material={ink()} scale={[0.07, 0.1 * open, 0.035]} />
                {open > 0.6 && <mesh geometry={G.disc} material={flat('#ffffff')} position={[0.022, 0.035, 0.036]} scale={0.018} />}
              </group>
            );
          })}
          {/* brows: positive = worried (inner ends up) */}
          {[-1, 1].map((s) => {
            const p = onHead(s * 0.26, 0.3 + Math.abs(brows) * 0.04);
            return <mesh key={s} geometry={G.stick} material={ink()} position={p} rotation={[0, 0, Math.PI / 2 - s * (0.1 + brows * 0.35)]} scale={[0.018, 0.07, 0.018]} />;
          })}
          {[-1, 1].map((s) => (
            <mesh key={s} geometry={G.disc} material={flat(P.blush, 0.55)} position={onHead(s * 0.42, -0.12, 0.004)} rotation={[0, s * 0.55, 0]} scale={[0.1, 0.065, 1]} />
          ))}
          <Mouth expr={expr} talk={talk} />
          {look.glasses && (
            <>
              {[-1, 1].map((s) => (
                <mesh key={s} geometry={G.ring} material={ink()} position={onHead(s * 0.25, 0.06, 0.07)} scale={0.18} />
              ))}
              <mesh geometry={G.stick} material={ink()} position={onHead(0, 0.08, 0.08)} rotation={[0, 0, Math.PI / 2]} scale={[0.025, 0.04, 0.025]} />
            </>
          )}
        </group>
      </group>
    </group>
  );
};
