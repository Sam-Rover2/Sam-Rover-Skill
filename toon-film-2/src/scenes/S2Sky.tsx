import { blink, keys, ramp } from '../lib/anim';
import { G } from '../lib/geometry';
import { LIGHTS2, Stage } from '../lib/Stage';
import { P, SIZE } from '../lib/style';
import { Toon, type V3 } from '../lib/Toon';
import { Character } from '../rig/Character';
import { Balloon, Building } from '../props/Big';
import { Cloud } from '../props/Props';
import { Bird, SkyBackdrop } from '../props/Sky';
import { freeBalloon } from './common';
import { BUN, useT } from '../cast';

/** The balloon rises along a 5-storey house; a neighbour waves from a balcony; we rise above the roofs. */
export const S2Sky: React.FC = () => {
  const t = useT();
  const k = ramp(t, 0, 5.5, (x) => x * (0.6 + 0.4 * x));
  const top: V3 = [keys(t, [[0, -3], [5.5, 5]]), 5 + k * 34, 6 + Math.sin(t) * 0.5];
  const [from, to] = freeBalloon(top, t);
  const cam = { pos: [top[0] - 2, top[1] - 0.5, 15] as V3, target: [top[0] - 0.5, top[1] + 0.3, 0] as V3, fov: 36, shake: 0.05, t };
  const balconyY = SIZE.floorH * 3;
  const wave = Math.sin(t * 9) * 0.25;
  return (
    <Stage light={LIGHTS2.morning} cam={cam} background={P.skyDay[1]}>
      <SkyBackdrop colors={['#7fb3e6', '#9cc9ef', '#b5d7f3', '#d8ecfb']} y={50} h={160} />
      {[[-20, 50, -40], [15, 60, -50], [40, 45, -45]].map(([x, y, z], i) => (
        <Cloud key={i} position={[x + t * 0.8, y, z]} scale={5} />
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <Bird key={i} position={[-15 + t * 4 + i * 1.8, 30 + (i % 2), 0]} flap={t * 14 + i} />
      ))}
      <Building position={[0, 0, -2]} w={36} floors={5} color={P.wallCream} litSeed={4} />
      <Building position={[-40, 0, -20]} w={30} floors={7} color="#9cb6d8" litSeed={5} />
      <Building position={[38, 0, -24]} w={28} floors={8} color="#c9b8e6" litSeed={6} />
      {/* balcony with a neighbour (railing hides the legs) */}
      <group position={[6, balconyY, -1.2]}>
        <Toon geometry={G.box} color={P.white} position={[0, 0, 1.2]} scale={[5, 0.3, 2.6]} line={4} />
        <group position={[0, 0.15, 1.0]} rotation={[0, -0.3, 0]}>
          <Character
            look={BUN}
            pose={{
              handL: t > 1.5 ? [-0.7, 3.0, 0.3 + wave] : undefined,
              elbowL: [-0.8, -0.2, 0],
              blink: blink(t, [1.0, 3.6]),
              expr: t > 1.5 ? 'open' : 'smile',
              brows: 0.6,
              look: [-0.8, 0.6],
              headNod: -0.15,
            }}
          />
        </group>
        <Toon geometry={G.box} color={P.trimGreen} position={[0, 1.15, 2.45]} scale={[5, 2.0, 0.1]} line={4} />
        {Array.from({ length: 9 }).map((_, i) => (
          <Toon key={i} geometry={G.box} color={P.white} position={[-2 + i * 0.5, 1.15, 2.52]} scale={[0.06, 1.9, 0.04]} line={0} />
        ))}
      </group>
      <Balloon from={from} to={to} />
    </Stage>
  );
};
