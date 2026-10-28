import { blink, keys } from '../lib/anim';
import { LIGHTS2, Stage } from '../lib/Stage';
import { P, SIZE } from '../lib/style';
import type { V3 } from '../lib/Toon';
import { Character } from '../rig/Character';
import { walk } from '../rig/motion';
import { handWorld } from '../rig/world';
import { Balloon, Building } from '../props/Big';
import { Car, Cloud, Shadow, StreetLamp, Tree } from '../props/Props';
import { SkyBackdrop } from '../props/Sky';
import { offset, StreetGround } from './common';
import { BEANIE, MAX, SHIRT, useT } from '../cast';

const STRIDE = 0.88; // running: longer steps

/** Max runs down the street with the balloon; low tracking camera shows how tall the houses are. */
export const S4Run: React.FC = () => {
  const t = useT();
  const mx = keys(t, [[0, -14], [5.5, 12]], (k) => k);
  const rot = 1.05;
  const pose = walk((mx + 14) / STRIDE, 1.3);
  const handR: V3 = [0.55, 2.5, 0.1];
  const pos: V3 = [mx, 0, 1.5];
  const hand = handWorld(pos, rot, 1, handR, pose.hips?.[1] ?? 0);
  const top = offset(hand, [-1.3 + Math.sin(t * 3) * 0.2, 2.1, -0.2]);
  const ped = keys(t, [[0, 16], [5.5, 2]], (k) => k);
  const cam = { pos: [mx - 3, 2.4, 16] as V3, target: [mx + 1.5, 4.5, 0] as V3, fov: 38, shake: 0.06, t };
  return (
    <Stage light={LIGHTS2.morning} cam={cam} background={P.skyDay[1]}>
      <SkyBackdrop colors={['#8fc0ec', '#b5d7f3', '#d8ecfb']} y={40} h={140} />
      {[[-30, 46, -70], [15, 52, -80], [55, 44, -70]].map(([x, y, z], i) => (
        <Cloud key={i} position={[x + t * 0.5, y, z]} scale={7} />
      ))}
      <StreetGround />
      <Building position={[-44, 0, -6]} w={28} floors={4} color={P.brick} awning={P.teal} litSeed={1} />
      <Building position={[-14, 0, -6]} w={30} floors={5} color="#e8b07a" awning={P.yellow} litSeed={2} />
      <Building position={[16, 0, -6]} w={28} floors={4} color={P.wallMint} awning={P.red} litSeed={3} />
      <Building position={[45, 0, -6]} w={28} floors={6} color="#9cb6d8" litSeed={4} />
      {[-24, 0, 24].map((x) => (
        <group key={x}>
          <Tree position={[x, 0, 3.8]} scale={SIZE.treeScale} />
          <Shadow position={[x, 0, 3.8]} r={3} opacity={0.14} />
        </group>
      ))}
      {[-12, 12, 36].map((x) => (
        <StreetLamp key={x} position={[x, 0, 4.3]} scale={SIZE.lampScale} />
      ))}
      <Car position={[-30, 0, 8.5]} color={P.lilac} scale={SIZE.carScale} />
      <Car position={[30, 0, 8.5]} color={P.yellow} scale={SIZE.carScale} />
      <group position={[ped, 0, -2.8]} rotation={[0, -1.2, 0]}>
        <Shadow r={0.8} />
        <Character look={BEANIE} pose={{ ...walk((16 - ped) / 0.68), expr: 'o', look: [0.6, 0], headTurn: 0.5, blink: blink(t, [2]) }} />
      </group>
      <group position={[6, 0, -3.2]} rotation={[0, 0.3, 0]}>
        <Shadow r={0.8} />
        <Character look={SHIRT} pose={{ handR: [0.3, 2.3, 0.6], expr: 'flat', look: [0, -0.8], headNod: 0.2, blink: blink(t, [1.4, 4]) }} />
      </group>
      <group position={pos} rotation={[0, rot, 0]}>
        <Shadow r={0.85} />
        <Character
          look={MAX}
          pose={{
            ...pose,
            lean: 0.2,
            handR,
            elbowR: [0.6, -0.4, -0.3],
            expr: 'grin',
            brows: -0.2,
            blink: blink(t, [1.3, 3.9]),
            look: [0.5, 0],
          }}
        />
      </group>
      <Balloon from={hand} to={top} />
    </Stage>
  );
};
