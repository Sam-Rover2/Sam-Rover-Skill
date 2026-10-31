import { G } from '../lib/geometry';
import { flat } from '../lib/materials';
import { LINE, P } from '../lib/style';
import { Toon, type V3 } from '../lib/Toon';
import { Limb, reach } from './Limb';

/**
 * Character DESIGN constructor: proportions, head/body shapes, eyes, ears, hands, feet, extras.
 * One rig (Bezier limbs) — many kinds of characters.
 */
export interface Design {
  // proportions (units; 1 m = 2.2)
  leg: number; // hip height
  bodyH: number;
  bodyW: number; // half-width
  bodyD?: number; // half-depth
  neck?: number;
  head: V3; // radii x, y, z
  headShape?: 'round' | 'box' | 'pear';
  body?: 'pill' | 'box' | 'pear' | 'tube';
  // colours
  skin: string;
  top: string;
  pants?: string; // tube body: trousers/skirt colour
  limbColor?: string; // default ink (stick limbs)
  sleeves?: boolean; // upper arm in top colour
  limbR?: number;
  // face
  eyes?: 'dot' | 'pie' | 'big' | 'screen' | 'sleepy' | 'cyclops';
  eyeGap?: number;
  nose?: 'none' | 'ball' | 'snout' | 'beak';
  noseColor?: string;
  mouth?: 'smile' | 'grin' | 'open' | 'flat' | 'fangs';
  blush?: boolean;
  ears?: 'human' | 'bear' | 'cat' | 'bunny' | 'none' | 'antenna';
  earColor?: string;
  // hair & hats
  hair?: 'none' | 'cap' | 'bob' | 'spiky' | 'bun' | 'mohawk' | 'curly' | 'tufts';
  hairColor?: string;
  hat?: 'none' | 'top' | 'beanie' | 'chef' | 'horns' | 'crown';
  hatColor?: string;
  glasses?: boolean;
  mustache?: boolean;
  beard?: boolean;
  // extremities
  hands?: 'ball' | 'mitten' | 'glove' | 'paw' | 'claw';
  feet?: 'shoe' | 'bigShoe' | 'paw' | 'boot' | 'none';
  shoeColor?: string;
  tail?: 'none' | 'cat' | 'bear';
  belly?: string; // lighter belly patch (animals)
  outfit?: 'none' | 'tie' | 'vneck' | 'buttons' | 'apron' | 'cape' | 'panel' | 'skirt' | 'scarf';
  outfitColor?: string;
  prop?: 'none' | 'cane' | 'balloon' | 'book' | 'phone';
}

export interface FigPose {
  handL?: V3;
  handR?: V3;
  lean?: number;
  headTilt?: number;
  footL?: V3;
  footR?: V3;
}

const ink = () => flat(LINE.color);
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

export const figureHeight = (d: Design) => d.leg + d.bodyH + (d.neck ?? 0) + d.head[1] * 1.9;

export const Figure: React.FC<{ d: Design; pose?: FigPose }> = ({ d, pose = {} }) => {
  const bodyD = d.bodyD ?? d.bodyW * 0.8;
  const neck = d.neck ?? 0;
  const [rx, ry, rz] = d.head;
  const L = d.leg;
  const bodyTop = L + d.bodyH;
  const headY = bodyTop + neck + ry * 0.85;
  const limbR = d.limbR ?? 0.055;
  const limbColor = d.limbColor ?? LINE.color;
  const lineW = limbColor === LINE.color ? 0 : 4;
  const armLen = Math.max(0.8, d.bodyH * 0.95 + 0.25);
  const legLen = L * 1.04;
  const shY = L + d.bodyH * 0.86;
  const shX = d.bodyW * 0.82;
  const shoulderL: V3 = [-shX, shY, 0];
  const shoulderR: V3 = [shX, shY, 0];
  const handL = reach(shoulderL, pose.handL ?? [-shX - 0.22, L + 0.05, 0.1], armLen);
  const handR = reach(shoulderR, pose.handR ?? [shX + 0.22, L + 0.05, 0.1], armLen);
  const hipX = Math.min(d.bodyW * 0.45, 0.32);
  const footL = reach([-hipX, L, 0], pose.footL ?? [-hipX - 0.03, 0.1, 0.04], legLen);
  const footR = reach([hipX, L, 0], pose.footR ?? [hipX + 0.03, 0.1, 0.04], legLen);
  const legColor = d.pants && d.body === 'tube' ? d.pants : limbColor;
  const legLine = legColor === LINE.color ? 0 : 4;

  // face decal on the head's front surface
  const face = (x: number, y: number, lift = 0.012): V3 => {
    if (d.headShape === 'box') return [x, y, rz + lift];
    const k = 1 - (x / rx) ** 2 - (y / ry) ** 2;
    return [x, y, Math.sqrt(Math.max(0, k)) * rz + lift];
  };
  const gap = d.eyeGap ?? rx * 0.32;
  const eyeY = ry * 0.1;

  const Hand = ({ at, side }: { at: V3; side: 1 | -1 }) => {
    const s = Math.max(0.12, limbR * 2.3);
    switch (d.hands) {
      case 'glove':
        return (
          <group position={at}>
            <Toon geometry={G.sphere} color="#ffffff" scale={0.22} />
            <Toon geometry={G.torus} color="#ffffff" position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.17, 0.17, 0.2]} line={3} />
            <Toon geometry={G.sphere} color="#ffffff" position={[side * 0.17, 0.05, 0.05]} scale={0.08} line={3} />
          </group>
        );
      case 'mitten':
        return (
          <group position={at}>
            <Toon geometry={G.sphere} color={d.skin} scale={[s * 0.85, s * 1.15, s * 0.6]} />
            <Toon geometry={G.sphere} color={d.skin} position={[-side * s * 0.75, s * 0.25, 0.02]} scale={s * 0.4} line={3} />
          </group>
        );
      case 'paw':
        return (
          <group position={at}>
            <Toon geometry={G.sphere} color={d.skin} scale={s * 1.25} />
            {[-1, 0, 1].map((i) => (
              <mesh key={i} geometry={G.disc} material={flat(d.belly ?? P.blush)} position={[i * s * 0.45, -s * 0.35, s * 1.2]} scale={s * 0.25} />
            ))}
          </group>
        );
      case 'claw':
        return (
          <group position={at}>
            <Toon geometry={G.cyl} color={P.steel} scale={[s * 0.8, s * 0.6, s * 0.8]} line={3} />
            {[-1, 1].map((i) => (
              <Toon key={i} geometry={G.box} color={P.steel} position={[i * s * 0.45, -s * 0.8, 0]} rotation={[0, 0, i * 0.3]} scale={[s * 0.3, s * 1.1, s * 0.5]} line={3} />
            ))}
          </group>
        );
      default:
        return <Toon geometry={G.sphere} color={d.skin} position={at} scale={s} />;
    }
  };

  const Foot = ({ at }: { at: V3 }) => {
    const c = d.shoeColor ?? P.shoe;
    switch (d.feet) {
      case 'none':
        return null;
      case 'bigShoe':
        return <Toon geometry={G.sphere} color={c} position={[at[0], 0.2, at[2] + 0.2]} scale={[0.32, 0.2, 0.48]} />;
      case 'paw':
        return <Toon geometry={G.sphere} color={d.skin} position={[at[0], 0.14, at[2] + 0.1]} scale={[0.26, 0.16, 0.34]} />;
      case 'boot':
        return (
          <group position={[at[0], 0, at[2]]}>
            <Toon geometry={G.box} color={c} position={[0, 0.3, 0.05]} scale={[0.3, 0.6, 0.32]} line={4} />
            <Toon geometry={G.box} color={c} position={[0, 0.1, 0.18]} scale={[0.3, 0.2, 0.56]} line={4} />
          </group>
        );
      default:
        return <Toon geometry={G.softBox} color={c} position={[at[0], Math.max(0.09, at[1] - 0.02), at[2] + 0.1]} scale={[0.24, 0.17, 0.4]} line={4} />;
    }
  };

  const torso = () => {
    const cy = L + d.bodyH / 2;
    switch (d.body) {
      case 'box':
        return <Toon geometry={G.box} color={d.top} position={[0, cy, 0]} scale={[d.bodyW * 2, d.bodyH, bodyD * 2]} />;
      case 'pear':
        return (
          <>
            <Toon geometry={G.sphere} color={d.top} position={[0, L + d.bodyH * 0.38, 0]} scale={[d.bodyW * 1.15, d.bodyH * 0.48, bodyD * 1.1]} />
            <Toon geometry={G.capsule} color={d.top} position={[0, L + d.bodyH * 0.62, 0]} scale={[d.bodyW * 0.85, d.bodyH * 0.2, bodyD * 0.85]} />
          </>
        );
      case 'tube':
        return (
          <>
            <Toon geometry={G.capsule} color={d.top} position={[0, L + d.bodyH * 0.58, 0]} scale={[d.bodyW, d.bodyH * 0.2, bodyD]} />
            {d.outfit === 'skirt' ? (
              <Toon geometry={G.cone} color={d.pants ?? d.top} position={[0, L + 0.05, 0]} scale={[d.bodyW * 1.5, d.bodyH * 0.55, bodyD * 1.5]} />
            ) : (
              <Toon geometry={G.softBox} color={d.pants ?? d.top} position={[0, L + 0.1, 0]} scale={[d.bodyW * 2, d.bodyH * 0.35, bodyD * 2]} />
            )}
          </>
        );
      default:
        return <Toon geometry={G.capsule} color={d.top} position={[0, cy, 0]} scale={[d.bodyW, d.bodyH / 3, bodyD]} />;
    }
  };
  const front = bodyD + 0.01;

  const Hair = () => {
    const c = d.hairColor ?? P.hairDark;
    switch (d.hair) {
      case 'cap':
        return <Toon geometry={G.hemi} color={c} position={[0, ry * 0.12, -rz * 0.06]} rotation={[-0.42, 0, 0]} scale={[rx * 1.04, ry * 0.98, rz * 1.04]} />;
      case 'bob':
        return (
          <group>
            <Toon geometry={G.hemi} color={c} position={[0, ry * 0.1, -0.04]} rotation={[-0.38, 0, 0]} scale={[rx * 1.06, ry * 1.04, rz * 1.06]} />
            {[-1, 1].map((s) => (
              <Toon key={s} geometry={G.sphere} color={c} position={[s * rx * 0.85, -ry * 0.25, -rz * 0.15]} scale={[rx * 0.3, ry * 0.62, rz * 0.5]} />
            ))}
          </group>
        );
      case 'spiky':
        return (
          <group>
            <Toon geometry={G.hemi} color={c} position={[0, ry * 0.1, -0.04]} rotation={[-0.4, 0, 0]} scale={[rx * 1.03, ry * 0.95, rz * 1.03]} />
            {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
              <Toon key={x} geometry={G.cone} color={c} position={[x * rx, ry * 0.95, -rz * 0.1]} rotation={[-0.3, 0, -x * 0.8]} scale={[rx * 0.22, ry * (0.55 + (i % 2) * 0.2), rx * 0.22]} line={4} />
            ))}
          </group>
        );
      case 'bun':
        return (
          <group>
            <Toon geometry={G.hemi} color={c} position={[0, ry * 0.08, -0.04]} rotation={[-0.4, 0, 0]} scale={[rx * 1.04, ry * 1.0, rz * 1.04]} />
            <Toon geometry={G.sphere} color={c} position={[0, ry * 1.08, -rz * 0.25]} scale={rx * 0.38} />
          </group>
        );
      case 'mohawk':
        return <Toon geometry={G.softBox} color={c} position={[0, ry * 1.05, -rz * 0.1]} rotation={[-0.2, 0, 0]} scale={[rx * 0.25, ry * 0.6, rz * 1.5]} />;
      case 'curly':
        return (
          <group>
            {Array.from({ length: 9 }).map((_, i) => {
              const a = (i / 8) * Math.PI;
              return <Toon key={i} geometry={G.sphere} color={c} position={[Math.cos(a) * rx * 0.85, ry * 0.45 + Math.sin(a) * ry * 0.55, -rz * 0.2]} scale={rx * 0.34} line={4} />;
            })}
          </group>
        );
      case 'tufts':
        return (
          <group>
            {[-1, 1].map((s) => (
              <Toon key={s} geometry={G.sphere} color={c} position={[s * rx * 0.9, ry * 0.15, -rz * 0.2]} scale={[rx * 0.22, ry * 0.35, rz * 0.45]} />
            ))}
          </group>
        );
      default:
        return null;
    }
  };

  const Hat = () => {
    const c = d.hatColor ?? P.navy;
    switch (d.hat) {
      case 'top':
        return (
          <group position={[0, ry * 0.9, 0]}>
            <Toon geometry={G.cyl} color={c} position={[0, 0.05, 0]} scale={[rx * 1.2, 0.06, rx * 1.2]} />
            <Toon geometry={G.cyl} color={c} position={[0, 0.5, 0]} scale={[rx * 0.7, 0.9, rx * 0.7]} />
            <Toon geometry={G.cyl} color={P.red} position={[0, 0.2, 0]} scale={[rx * 0.71, 0.15, rx * 0.71]} line={3} />
          </group>
        );
      case 'beanie':
        return (
          <group>
            <Toon geometry={G.hemi} color={c} position={[0, ry * 0.15, 0]} rotation={[-0.15, 0, 0]} scale={[rx * 1.08, ry * 1.05, rz * 1.08]} />
            <Toon geometry={G.sphere} color={c} position={[0, ry * 1.2, 0]} scale={rx * 0.2} />
          </group>
        );
      case 'chef':
        return (
          <group position={[0, ry * 0.85, 0]}>
            <Toon geometry={G.cyl} color="#ffffff" position={[0, 0.2, 0]} scale={[rx * 0.75, 0.4, rx * 0.75]} />
            {[-1, 0, 1].map((i) => (
              <Toon key={i} geometry={G.sphere} color="#ffffff" position={[i * rx * 0.45, 0.6, 0]} scale={rx * 0.45} />
            ))}
          </group>
        );
      case 'horns':
        return (
          <>
            {[-1, 1].map((s) => (
              <Toon key={s} geometry={G.cone} color={c} position={[s * rx * 0.55, ry * 0.95, 0]} rotation={[0, 0, -s * 0.35]} scale={[rx * 0.18, ry * 0.5, rx * 0.18]} />
            ))}
          </>
        );
      case 'crown':
        return (
          <group position={[0, ry * 0.92, 0]}>
            <Toon geometry={G.cyl} color={P.yellow} scale={[rx * 0.6, 0.25, rx * 0.6]} />
            {[0, 1, 2, 3, 4].map((i) => {
              const a = (i / 5) * Math.PI * 2;
              return <Toon key={i} geometry={G.cone} color={P.yellow} position={[Math.sin(a) * rx * 0.55, 0.25, Math.cos(a) * rx * 0.55]} scale={[0.08, 0.25, 0.08]} line={3} />;
            })}
          </group>
        );
      default:
        return null;
    }
  };

  const Ears = () => {
    const c = d.earColor ?? d.skin;
    switch (d.ears) {
      case 'none':
        return null;
      case 'bear':
        return (
          <>
            {[-1, 1].map((s) => (
              <group key={s} position={[s * rx * 0.72, ry * 0.75, 0]}>
                <Toon geometry={G.sphere} color={c} scale={[rx * 0.32, rx * 0.32, rx * 0.2]} />
                <mesh geometry={G.disc} material={flat(d.belly ?? P.blush)} position={[0, 0, rx * 0.21]} scale={rx * 0.17} />
              </group>
            ))}
          </>
        );
      case 'cat':
        return (
          <>
            {[-1, 1].map((s) => (
              <Toon key={s} geometry={G.cone} color={c} position={[s * rx * 0.6, ry * 0.85, 0]} rotation={[0, 0, -s * 0.35]} scale={[rx * 0.3, ry * 0.5, rx * 0.15]} />
            ))}
          </>
        );
      case 'bunny':
        return (
          <>
            {[-1, 1].map((s) => (
              <Toon key={s} geometry={G.capsule} color={c} position={[s * rx * 0.35, ry * 1.45, -0.05]} rotation={[0, 0, -s * 0.15]} scale={[rx * 0.17, ry * 0.3, rx * 0.1]} />
            ))}
          </>
        );
      case 'antenna':
        return (
          <group position={[0, ry, 0]}>
            <mesh geometry={G.stick} material={ink()} position={[0, 0.3, 0]} scale={[0.03, 0.4, 0.03]} />
            <Toon geometry={G.sphere} color={P.red} position={[0, 0.65, 0]} scale={0.12} line={3} />
          </group>
        );
      default:
        return (
          <>
            {[-1, 1].map((s) => (
              <Toon key={s} geometry={G.sphere} color={c} position={[s * rx * 0.97, -ry * 0.08, 0]} scale={[0.1, 0.15, 0.09]} line={4} />
            ))}
          </>
        );
    }
  };

  const Eyes = () => {
    switch (d.eyes) {
      case 'pie':
        return (
          <>
            {[-1, 1].map((s) => (
              <group key={s} position={face(s * gap * 0.75, eyeY + 0.05)}>
                <mesh geometry={G.disc} material={flat('#ffffff')} scale={[0.13, 0.2, 1]} />
                <mesh geometry={G.disc} material={ink()} position={[0, -0.05, 0.004]} scale={[0.07, 0.12, 1]} />
                <mesh geometry={G.thinRing} material={ink()} position={[0, 0, 0.002]} scale={[0.13, 0.2, 1]} />
              </group>
            ))}
          </>
        );
      case 'big':
        return (
          <>
            {[-1, 1].map((s) => (
              <group key={s} position={face(s * gap, eyeY)}>
                <mesh geometry={G.disc} material={flat('#ffffff')} scale={[0.15, 0.18, 1]} />
                <mesh geometry={G.disc} material={flat('#4a7fc7')} position={[0, -0.02, 0.003]} scale={0.1} />
                <mesh geometry={G.disc} material={ink()} position={[0, -0.02, 0.005]} scale={0.055} />
                <mesh geometry={G.disc} material={flat('#ffffff')} position={[0.03, 0.03, 0.007]} scale={0.025} />
                <mesh geometry={G.thinRing} material={ink()} scale={[0.15, 0.18, 1]} />
              </group>
            ))}
          </>
        );
      case 'screen':
        return (
          <group position={[0, eyeY - 0.05, rz + 0.01]}>
            <mesh geometry={G.plane} material={flat('#10202e')} scale={[rx * 1.5, ry * 0.9, 1]} />
            {[-1, 1].map((s) => (
              <mesh key={s} geometry={G.disc} material={flat('#4ef0ff')} position={[s * rx * 0.35, 0.08, 0.005]} scale={[0.1, 0.13, 1]} />
            ))}
            <mesh geometry={G.arc} material={flat('#4ef0ff')} position={[0, -0.17, 0.005]} rotation={[0, 0, Math.PI]} scale={0.1} />
          </group>
        );
      case 'sleepy':
        return (
          <>
            {[-1, 1].map((s) => (
              <mesh key={s} geometry={G.stick} material={ink()} position={face(s * gap, eyeY)} rotation={[0, 0, Math.PI / 2]} scale={[0.025, 0.06, 0.025]} />
            ))}
          </>
        );
      case 'cyclops':
        return (
          <group position={face(0, eyeY + 0.05)}>
            <mesh geometry={G.disc} material={flat('#ffffff')} scale={0.28} />
            <mesh geometry={G.disc} material={flat(P.green)} position={[0, 0, 0.003]} scale={0.15} />
            <mesh geometry={G.disc} material={ink()} position={[0, 0, 0.005]} scale={0.08} />
            <mesh geometry={G.disc} material={flat('#ffffff')} position={[0.05, 0.05, 0.007]} scale={0.03} />
            <mesh geometry={G.thinRing} material={ink()} scale={0.28} />
          </group>
        );
      default:
        return (
          <>
            {[-1, 1].map((s) => (
              <group key={s} position={face(s * gap, eyeY)}>
                <mesh geometry={G.sphere} material={ink()} scale={[0.07, 0.1, 0.035]} />
                <mesh geometry={G.disc} material={flat('#ffffff')} position={[0.022, 0.035, 0.036]} scale={0.018} />
              </group>
            ))}
          </>
        );
    }
  };

  const Mouth = () => {
    if (d.eyes === 'screen') return null;
    const p = face(0, -ry * 0.3);
    switch (d.mouth) {
      case 'grin':
        return (
          <group position={p}>
            <mesh geometry={G.disc} material={ink()} position={[0, -0.03, 0]} scale={[0.15, 0.1, 1]} />
            <mesh geometry={G.disc} material={flat('#e86a6a')} position={[0, -0.08, 0.002]} scale={[0.07, 0.035, 1]} />
          </group>
        );
      case 'open':
        return <mesh geometry={G.disc} material={ink()} position={p} scale={[0.09, 0.11, 1]} />;
      case 'flat':
        return <mesh geometry={G.stick} material={ink()} position={p} rotation={[0, 0, Math.PI / 2]} scale={[0.02, 0.08, 0.02]} />;
      case 'fangs':
        return (
          <group position={p}>
            <mesh geometry={G.arc} material={ink()} rotation={[0, 0, Math.PI]} scale={0.18} />
            {[-1, 1].map((s) => (
              <mesh key={s} geometry={G.cone} material={flat('#ffffff')} position={[s * 0.08, -0.07, 0.01]} rotation={[0, 0, Math.PI]} scale={[0.035, 0.07, 0.01]} />
            ))}
          </group>
        );
      default:
        return <mesh geometry={G.arc} material={ink()} position={p} rotation={[0, 0, Math.PI]} scale={0.1} />;
    }
  };

  const Nose = () => {
    const c = d.noseColor ?? d.skin;
    switch (d.nose) {
      case 'ball':
        return <Toon geometry={G.sphere} color={c} position={face(0, -ry * 0.08, 0.06)} scale={0.11} line={4} />;
      case 'snout':
        return (
          <group position={face(0, -ry * 0.22, 0.02)}>
            <Toon geometry={G.sphere} color={d.belly ?? '#f3e2c8'} scale={[rx * 0.38, ry * 0.26, rx * 0.22]} line={4} />
            <Toon geometry={G.sphere} color={LINE.color} position={[0, ry * 0.1, rx * 0.2]} scale={[0.08, 0.055, 0.05]} line={0} />
          </group>
        );
      case 'beak':
        return <Toon geometry={G.cone} color={P.yellow} position={face(0, -ry * 0.12, 0.1)} rotation={[Math.PI / 2, 0, 0]} scale={[0.12, 0.25, 0.08]} line={3} />;
      default:
        return null;
    }
  };

  const tilt = pose.headTilt ?? 0;
  return (
    <group>
      <Limb root={[-hipX, L, 0]} tip={footL} length={legLen} bendDir={[0, 0, 1]} radius={d.body === 'tube' ? Math.max(limbR, 0.1) : limbR + 0.005} color={legColor} line={legLine} />
      <Limb root={[hipX, L, 0]} tip={footR} length={legLen} bendDir={[0, 0, 1]} radius={d.body === 'tube' ? Math.max(limbR, 0.1) : limbR + 0.005} color={legColor} line={legLine} />
      <Foot at={footL} />
      <Foot at={footR} />
      <Limb root={shoulderL} tip={handL} length={armLen} bendDir={[-0.4, -0.1, -0.6]} radius={limbR} color={limbColor} line={lineW} />
      <Limb root={shoulderR} tip={handR} length={armLen} bendDir={[0.4, -0.1, -0.6]} radius={limbR} color={limbColor} line={lineW} />
      {d.sleeves &&
        [shoulderL, shoulderR].map((s, i) => {
          const dir = sub(i ? handR : handL, s);
          const len = Math.hypot(...dir);
          const k = 0.35 / Math.max(0.01, len);
          return <Toon key={i} geometry={G.sphere} color={d.top} position={[s[0] + dir[0] * k * 0.5, s[1] + dir[1] * k * 0.5, s[2] + dir[2] * k * 0.5]} scale={limbR * 2.6} line={4} />;
        })}
      <Hand at={handL} side={-1} />
      <Hand at={handR} side={1} />
      {d.tail === 'cat' && <Limb root={[0, L + 0.2, -bodyD]} tip={[0.5, L + 1.0, -bodyD - 0.5]} length={1.4} bendDir={[1, 0, -0.5]} radius={0.07} color={d.skin} line={4} />}
      {d.tail === 'bear' && <Toon geometry={G.sphere} color={d.skin} position={[0, L + 0.25, -bodyD]} scale={0.16} />}
      {d.outfit === 'cape' && <Toon geometry={G.box} color={d.outfitColor ?? P.red} position={[0, L + d.bodyH * 0.45, -bodyD - 0.05]} rotation={[0.12, 0, 0]} scale={[d.bodyW * 2.2, d.bodyH * 1.05, 0.06]} line={4} />}

      {torso()}
      {d.belly && <Toon geometry={G.sphere} color={d.belly} position={[0, L + d.bodyH * 0.42, front - 0.15]} scale={[d.bodyW * 0.65, d.bodyH * 0.32, 0.18]} line={3} />}
      {d.outfit === 'vneck' &&
        [-1, 1].map((s) => (
          <mesh key={s} geometry={G.stick} material={ink()} position={[s * 0.09, bodyTop - 0.15, front - 0.02]} rotation={[0.25, 0, s * 0.45]} scale={[0.02, 0.15, 0.02]} />
        ))}
      {d.outfit === 'tie' && (
        <>
          {[-1, 1].map((s) => (
            <Toon key={s} geometry={G.box} color="#ffffff" position={[s * 0.1, bodyTop - 0.1, front - 0.05]} rotation={[0.3, 0, s * 0.7]} scale={[0.2, 0.12, 0.04]} line={3} />
          ))}
          <Toon geometry={G.box} color={d.outfitColor ?? P.red} position={[0, bodyTop - 0.38, front + 0.01]} rotation={[0.1, 0, 0]} scale={[0.1, 0.42, 0.03]} line={3} />
        </>
      )}
      {d.outfit === 'buttons' &&
        [0.25, 0.45, 0.65].map((k) => <mesh key={k} geometry={G.lowSphere} material={ink()} position={[0, L + d.bodyH * k, front + 0.02]} scale={0.035} />)}
      {d.outfit === 'apron' && <Toon geometry={G.softBox} color={d.outfitColor ?? P.apron} position={[0, L + d.bodyH * 0.4, front - 0.04]} rotation={[-0.1, 0, 0]} scale={[d.bodyW * 1.15, d.bodyH * 0.7, 0.06]} line={4} />}
      {d.outfit === 'panel' && (
        <group position={[0, L + d.bodyH * 0.5, front + 0.02]}>
          <Toon geometry={G.box} color="#3d4352" scale={[d.bodyW * 1.1, d.bodyH * 0.45, 0.05]} line={3} />
          {[P.red, P.yellow, P.green].map((c, i) => (
            <Toon key={c} geometry={G.sphere} color={c} position={[(i - 1) * 0.16, 0.05, 0.04]} scale={0.05} line={2} />
          ))}
        </group>
      )}
      {d.outfit === 'scarf' && <Toon geometry={G.torus} color={d.outfitColor ?? P.red} position={[0, bodyTop - 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[d.bodyW * 0.75, bodyD * 0.85, 0.6]} />}

      {neck > 0 && <Limb root={[0, bodyTop - 0.1, 0]} tip={[0, bodyTop + neck + 0.05, 0]} length={neck + 0.2} bendDir={[0, 0, 1]} radius={0.11} color={d.skin} line={4} />}

      <group position={[0, headY, 0]} rotation={[0, 0, tilt]}>
        {d.headShape === 'box' ? (
          <Toon geometry={G.box} color={d.skin} scale={[rx * 2, ry * 2, rz * 2]} />
        ) : d.headShape === 'pear' ? (
          <>
            <Toon geometry={G.sphere} color={d.skin} position={[0, -ry * 0.2, 0]} scale={[rx, ry * 0.8, rz]} />
            <Toon geometry={G.sphere} color={d.skin} position={[0, ry * 0.25, 0]} scale={[rx * 0.82, ry * 0.75, rz * 0.85]} line={0} />
          </>
        ) : (
          <Toon geometry={G.sphere} color={d.skin} scale={[rx, ry, rz]} />
        )}
        <Ears />
        <Hair />
        <Hat />
        <Eyes />
        {d.eyes !== 'screen' && d.eyes !== 'cyclops' && d.eyes !== 'pie' &&
          [-1, 1].map((s) => (
            <mesh key={s} geometry={G.stick} material={ink()} position={face(s * gap * 1.05, eyeY + 0.22)} rotation={[0, 0, Math.PI / 2 - s * 0.1]} scale={[0.018, 0.07, 0.018]} />
          ))}
        {d.blush !== false && d.eyes !== 'screen' &&
          [-1, 1].map((s) => <mesh key={s} geometry={G.disc} material={flat(P.blush, 0.55)} position={face(s * rx * 0.55, -ry * 0.15, 0.004)} rotation={[0, s * 0.55, 0]} scale={[0.1, 0.065, 1]} />)}
        <Nose />
        <Mouth />
        {d.mustache &&
          [-1, 1].map((s) => (
            <Toon key={s} geometry={G.sphere} color={d.hairColor ?? P.hairGrey} position={face(s * 0.1, -ry * 0.2, 0.03)} rotation={[0, 0, s * 0.4]} scale={[0.13, 0.05, 0.05]} line={3} />
          ))}
        {d.beard && <Toon geometry={G.sphere} color={d.hairColor ?? P.hairBrown} position={[0, -ry * 0.6, rz * 0.45]} scale={[rx * 0.75, ry * 0.45, rz * 0.5]} />}
        {d.glasses &&
          [-1, 1].map((s) => <mesh key={s} geometry={G.ring} material={ink()} position={face(s * gap, eyeY, 0.06)} scale={0.17} />)}
      </group>

      {d.prop === 'cane' && (
        <group position={handR}>
          <Toon geometry={G.cyl} color={P.woodDark} position={[0, -handR[1] / 2, 0.05]} scale={[0.04, handR[1], 0.04]} line={3} />
        </group>
      )}
      {d.prop === 'book' && <Toon geometry={G.box} color={P.red} position={[handL[0] + 0.1, handL[1] + 0.15, handL[2] + 0.1]} rotation={[0.3, 0.4, 0]} scale={[0.4, 0.55, 0.12]} line={3} />}
      {d.prop === 'phone' && <Toon geometry={G.box} color="#2c2f38" position={[handR[0], handR[1] + 0.15, handR[2] + 0.06]} rotation={[0.3, 0, 0]} scale={[0.17, 0.32, 0.04]} line={3} />}
    </group>
  );
};
