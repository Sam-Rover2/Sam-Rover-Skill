import { Toon } from './Toon';
import { G } from './geometry';
import { flat } from './materials';
import { LINE, PALETTE } from './style';

export interface CharacterLook {
  skin: string;
  top: string;
  topType: 'sweater' | 'hoodie';
  hair: string;
  glasses?: boolean;
}

export interface CharacterPose {
  /** Arm angles in radians from hanging down; positive = raised outward. */
  armLeft?: number;
  armRight?: number;
  /** Extra bend of the forearm-less stick toward the face (holding a mug). */
  mug?: { lift: number };
  blink?: number; // 0 open … 1 closed
  squash?: number; // 1 = neutral, >1 = taller
  headTilt?: number; // radians
  /** Eye happiness: 0 = dots, 1 = closed smiling arcs ^^ */
  happy?: number;
}

const HEAD_Y = 3.0;
const HEAD_R = 0.78;

/** Point on the head surface for face decals (head = sphere scaled 1, 1.04, 0.95). */
const onHead = (x: number, y: number, lift = 0.01): [number, number, number] => {
  const z = Math.sqrt(Math.max(0, 1 - (x / HEAD_R) ** 2 - (y / (HEAD_R * 1.04)) ** 2)) * HEAD_R * 0.95;
  return [x, y, z + lift];
};

const Eye: React.FC<{ x: number; blink: number; happy: number }> = ({ x, blink, happy }) => {
  const p = onHead(x, 0.08, 0.0);
  if (happy > 0.5) {
    return (
      <mesh geometry={G.smile} material={flat(LINE.color)} position={[p[0], p[1] - 0.02, p[2]]} scale={[0.1, 0.1, 0.1]} />
    );
  }
  return (
    <mesh
      geometry={G.sphere}
      material={flat(LINE.color)}
      position={p}
      scale={[0.07, 0.1 * Math.max(0.12, 1 - blink), 0.04]}
    />
  );
};

export const Character: React.FC<{ look: CharacterLook; pose?: CharacterPose }> = ({ look, pose = {} }) => {
  const { armLeft = 0.12, armRight = 0.12, blink = 0, squash = 1, headTilt = 0, happy = 0, mug } = pose;
  const hoodie = look.topType === 'hoodie';
  const mouth = onHead(0, -0.2);

  const Arm = ({ side, angle }: { side: 1 | -1; angle: number }) => (
    <group position={[side * 0.5, 2.25, 0]} rotation={[0, 0, side * angle]}>
      <Toon geometry={G.stick} color={LINE.color} position={[0, -0.48, 0]} scale={[0.045, 0.96, 0.045]} line={0} />
      <Toon geometry={G.sphere} color={look.skin} position={[0, -0.98, 0]} scale={0.14} />
    </group>
  );

  return (
    <group scale={[1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash)]}>
      {/* legs + feet */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Toon geometry={G.stick} color={LINE.color} position={[s * 0.22, 0.6, 0]} scale={[0.05, 1.1, 0.05]} line={0} />
          <Toon geometry={G.sphere} color={LINE.color} position={[s * 0.26, 0.08, 0.1]} scale={[0.16, 0.09, 0.24]} line={0} />
        </group>
      ))}

      {/* body: a soft pill */}
      <Toon geometry={G.capsule} color={look.top} position={[0, 1.75, 0]} scale={[0.58, 0.42, 0.45]} />
      {hoodie ? (
        <>
          {/* hood behind the neck + front pocket */}
          <Toon geometry={G.ring} color={look.top} position={[0, 2.25, -0.12]} rotation={[Math.PI / 2.4, 0, 0]} scale={0.32} />
          <Toon geometry={G.softBox} color={look.top} position={[0, 1.45, 0.42]} scale={[0.62, 0.3, 0.06]} line={4} />
        </>
      ) : (
        // V-neck
        [-1, 1].map((s) => (
          <mesh
            key={s}
            geometry={G.stick}
            material={flat(LINE.color)}
            position={[s * 0.09, 2.08, 0.44]}
            rotation={[0.15, 0, s * 0.45]}
            scale={[0.022, 0.38, 0.022]}
          />
        ))
      )}

      <Arm side={-1} angle={armLeft} />
      {mug ? (
        <group position={[0.5, 2.25, 0]} rotation={[-2.0 * mug.lift, 0, 0.3 - 0.6 * mug.lift]}>
          <Toon geometry={G.stick} color={LINE.color} position={[0, -0.48, 0]} scale={[0.045, 0.96, 0.045]} line={0} />
          <group position={[0, -1.0, 0.1]} rotation={[2.0 * mug.lift, 0, -0.3 + 0.6 * mug.lift]}>
            <Toon geometry={G.cylinder} color={PALETTE.mug} position={[-0.05, 0.08, 0.06]} scale={[0.15, 0.3, 0.15]} />
            <Toon geometry={G.sphere} color={look.skin} scale={0.14} />
          </group>
        </group>
      ) : (
        <Arm side={1} angle={armRight} />
      )}

      {/* head */}
      <group position={[0, HEAD_Y, 0]} rotation={[0, 0, headTilt]}>
        <Toon geometry={G.sphere} color={look.skin} scale={[HEAD_R, HEAD_R * 1.04, HEAD_R * 0.95]} />
        <Toon
          geometry={G.hairCap}
          color={look.hair}
          position={[0, 0.02, -0.04]}
          rotation={[-0.12, 0, 0]}
          scale={[HEAD_R * 1.03, HEAD_R * 1.07, HEAD_R * 1.0]}
        />
        <Eye x={-0.25} blink={blink} happy={happy} />
        <Eye x={0.25} blink={blink} happy={happy} />
        {/* brows */}
        {[-1, 1].map((s) => {
          const p = onHead(s * 0.26, 0.3, 0.0);
          return (
            <mesh key={s} geometry={G.stick} material={flat(LINE.color)} position={p} rotation={[0, 0, Math.PI / 2 + s * 0.1]} scale={[0.02, 0.16, 0.02]} />
          );
        })}
        {/* blush */}
        {[-1, 1].map((s) => {
          const p = onHead(s * 0.42, -0.12, 0.004);
          return (
            <mesh key={s} geometry={G.disc} material={flat(PALETTE.blush, 0.55)} position={p} rotation={[0, s * 0.55, 0]} scale={[0.1, 0.065, 1]} />
          );
        })}
        {/* smile */}
        <mesh geometry={G.smile} material={flat(LINE.color)} position={mouth} rotation={[0, 0, Math.PI]} scale={0.1} />
        {look.glasses &&
          [-1, 1].map((s) => {
            const p = onHead(s * 0.25, 0.08, 0.06);
            return <mesh key={s} geometry={G.ring} material={flat(LINE.color)} position={p} scale={0.19} />;
          })}
      </group>
    </group>
  );
};
