import { blink, keys, ramp } from '../lib/anim';
import { G } from '../lib/geometry';
import { LIGHTS2, Stage } from '../lib/Stage';
import { P, SIZE } from '../lib/style';
import { Flat, Toon, type V3 } from '../lib/Toon';
import { Character } from '../rig/Character';
import { breathe, walk } from '../rig/motion';
import { handWorld } from '../rig/world';
import { Balloon, Building } from '../props/Big';
import { Cloud, Plant, Shadow } from '../props/Props';
import { SkyBackdrop } from '../props/Sky';
import { freeBalloon, offset } from './common';
import { MAX, useT } from '../cast';

const CATCH = 3.6;
const MAX_POS: V3 = [0, 0, 0.6];

const WateringCan: React.FC<{ tilt: number }> = ({ tilt }) => (
  <group rotation={[0, 0, tilt]} position={[0, -0.15, 0.05]}>
    <Toon geometry={G.cyl} color={P.teal} position={[0, -0.15, 0]} scale={[0.22, 0.32, 0.22]} line={4} />
    <Toon geometry={G.cone} color={P.teal} position={[0.32, -0.08, 0]} rotation={[0, 0, -1.0]} scale={[0.05, 0.4, 0.05]} line={3} />
  </group>
);

/** Max waters his rooftop plants and catches the passing balloon. */
export const S3Roof: React.FC = () => {
  const t = useT();
  const notice = ramp(t, 1.9, 2.3);
  const tiptoe = keys(t, [[2.8, 0], [3.4, 1], [CATCH + 0.2, 1], [CATCH + 0.6, 0]]);
  const runOff = ramp(t, 5.6, 7.0, (x) => x * x);
  const mx = -runOff * 7;
  const rot = t < 5.6 ? keys(t, [[0, -0.7], [1.9, -0.7], [2.4, 0.2]]) : keys(t, [[5.6, 0.2], [5.9, -1.3]]);
  const pos: V3 = [MAX_POS[0] + mx, 0, MAX_POS[2]];

  const handR: V3 = t < 1.9 ? [0.65, 1.75, 0.6] : t < CATCH + 0.3 ? [0.5 + tiptoe * 0.1, 2.2 + tiptoe * 1.3, 0.35] : [0.6, 2.5, 0.35];
  const hipsUp = tiptoe * 0.18;
  const hand = handWorld(pos, rot, 1, handR, hipsUp);
  // balloon drifts up from below the parapet and into Max's hand
  const catchTop = offset(handWorld(MAX_POS, 0.2, 1, [0.6, 3.5, 0.35], 0.18), [0.3, 2.3, 0]);
  let from: V3;
  let to: V3;
  if (t < CATCH) {
    const top: V3 = keys(t, [[0, [5, -4, -2.5]], [2.0, [3.2, 4.5, -1.0]], [CATCH, catchTop]]);
    [from, to] = freeBalloon(top, t);
    if (t > CATCH - 0.6) from = keys(t, [[CATCH - 0.6, from], [CATCH, offset(catchTop, [-0.3, -2.3, 0])]]);
  } else {
    from = hand;
    to = offset(hand, [0.3 + Math.sin(t * 1.5) * 0.12 + runOff * 1.2, 2.3, 0]);
  }

  const cam =
    t < CATCH
      ? { pos: keys(t, [[0, [2.2, 3.8, 13]], [CATCH, [1.6, 4.2, 11.5]]]), target: keys(t, [[0, [0.6, 2.8, 0]], [CATCH, [1.0, 3.8, 0]]]), fov: 33, shake: 0.03, t }
      : { pos: keys(t, [[CATCH, [1.2, 3.8, 9.5]], [7, [-1.5, 3.6, 10.5]]]), target: keys(t, [[CATCH, [0.4, 3.4, 0]], [7, [-2.5, 3.2, 0]]]), fov: 32, shake: 0.03, t };

  return (
    <Stage light={LIGHTS2.morning} cam={cam} background={P.skyDay[1]}>
      <SkyBackdrop colors={['#8fc0ec', '#b5d7f3', '#d8ecfb']} y={20} h={120} />
      {[[-25, 22, -70], [20, 28, -80]].map(([x, y, z], i) => (
        <Cloud key={i} position={[x + t * 0.5, y, z]} scale={6} />
      ))}
      {/* neighbouring roofs: real-scale buildings whose tops are around us */}
      <group position={[0, -SIZE.floorH * 5 - 1.2, 0]}>
        <Building position={[-30, 0, -26]} w={30} floors={6} color="#9cb6d8" litSeed={1} />
        <Building position={[8, 0, -34]} w={34} floors={4} color={P.brick} litSeed={2} />
        <Building position={[44, 0, -30]} w={26} floors={7} color="#c9b8e6" litSeed={3} />
      </group>
      {/* our roof */}
      <Flat color="#a7a3a0" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} scale={[60, 12, 1]} />
      {Array.from({ length: 12 }).map((_, i) => (
        <Flat key={i} color="#97938f" rotation={[-Math.PI / 2, 0, 0]} position={[-24 + i * 4, 0.004, 0]} scale={[0.05, 12, 1]} />
      ))}
      <Toon geometry={G.box} color={P.wallCream} position={[0, 1.0, -3]} scale={[60, 2.0, 0.5]} line={4} />
      <Toon geometry={G.box} color={P.white} position={[0, 2.05, -3]} scale={[60, 0.15, 0.7]} line={3} />
      {/* water tank, chimney, antenna, laundry */}
      <group position={[-7, 0, -1.5]}>
        {[-1, 1].map((sx) => [-1, 1].map((sz) => <Toon key={`${sx}${sz}`} geometry={G.box} color={P.woodDark} position={[sx * 0.9, 1.0, sz * 0.9]} scale={[0.15, 2, 0.15]} line={3} />))}
        <Toon geometry={G.cyl} color={P.woodLight} position={[0, 3.2, 0]} scale={[1.4, 2.4, 1.4]} line={5} />
        <Toon geometry={G.cone} color={P.woodDark} position={[0, 4.8, 0]} scale={[1.5, 0.8, 1.5]} line={5} />
      </group>
      <Toon geometry={G.box} color={P.brick} position={[6.5, 1.4, -1.8]} scale={[1.2, 2.8, 1.2]} line={4} />
      <Toon geometry={G.box} color="#3d4352" position={[6.5, 2.9, -1.8]} scale={[1.4, 0.2, 1.4]} line={3} />
      <Toon geometry={G.cyl} color={P.steel} position={[9, 3, -2]} scale={[0.05, 6, 0.05]} line={2} />
      {[-0.6, 0, 0.6].map((y, i) => (
        <Toon key={i} geometry={G.cyl} color={P.steel} position={[9, 5 + y, -2]} rotation={[0, 0, Math.PI / 2]} scale={[0.03, 1.4 - i * 0.3, 0.03]} line={2} />
      ))}
      <group position={[-3, 0, -2.2]}>
        {[-3, 3].map((x) => (
          <Toon key={x} geometry={G.cyl} color={P.navy} position={[x, 2, 0]} scale={[0.06, 4, 0.06]} line={3} />
        ))}
        <Toon geometry={G.cyl} color={P.white} position={[0, 3.85, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.015, 6, 0.015]} line={0} />
        {[P.red, P.yellow, P.teal, P.lilac].map((c, i) => (
          <group key={c} position={[-2 + i * 1.3, 3.85, 0]} rotation={[Math.sin(t * 2 + i) * 0.2, 0, 0]}>
            <Toon geometry={G.box} color={c} position={[0, -0.45, 0]} scale={[0.8, 0.9, 0.03]} line={3} />
          </group>
        ))}
      </group>
      {/* Max's plant pots */}
      {[-4.2, -3.0, -1.8].map((x, i) => (
        <Plant key={x} position={[x, 0, 0.4]} scale={0.7 + (i % 2) * 0.15} />
      ))}
      {t < 1.9 && Array.from({ length: 6 }).map((_, i) => {
        const k = (t * 2 + i / 6) % 1;
        return <Flat key={i} geometry={G.disc} color="#7fc3e8" position={[-1.1 - k * 0.4, 1.6 - k * 0.8, 1.2]} scale={0.05} />;
      })}
      {/* Max */}
      <group position={pos} rotation={[0, rot, 0]}>
        <Shadow r={0.85} />
        <Character
          look={MAX}
          pose={{
            ...(runOff > 0 ? walk(runOff * 7 / 0.85, 1.3) : {}),
            squash: breathe(t),
            hips: [0, hipsUp, 0],
            footL: tiptoe > 0 ? [-0.24, 0.1 + hipsUp, 0.04] : runOff > 0 ? walk(runOff * 7 / 0.85, 1.3).footL : undefined,
            footR: tiptoe > 0 ? [0.24, 0.1 + hipsUp, 0.04] : runOff > 0 ? walk(runOff * 7 / 0.85, 1.3).footR : undefined,
            handR,
            elbowR: [0.7, -0.4, -0.2],
            holdR: t < 2.4 && <WateringCan tilt={t < 1.9 ? -0.6 : 0} />,
            blink: blink(t, [1.0, 4.6]),
            expr: notice > 0.5 && t < CATCH ? 'o' : t >= CATCH ? 'grin' : 'smile',
            brows: notice > 0.5 && t < CATCH ? 0.8 : 0,
            happy: t > CATCH + 0.3 && t < 5.0 ? 1 : 0,
            look: notice > 0.5 && t < 5.0 ? [0.4, 1] : t >= 5.0 && t < 5.6 ? [0.3, -1] : [-0.5, -0.5],
            headNod: notice > 0.5 && t < 5.0 ? -0.25 : t >= 5.0 && t < 5.6 ? 0.3 : 0.15,
            lean: t >= 5.0 && t < 5.6 ? 0.15 : runOff > 0 ? 0.2 : 0,
          }}
        />
      </group>
      {t < 2.4 ? null : t < 5.6 && <WateringCanOnFloor />}
      <Balloon from={from} to={to} />
    </Stage>
  );
};

const WateringCanOnFloor: React.FC = () => (
  <group position={[1.4, 0.32, 1.0]}>
    <Toon geometry={G.cyl} color={P.teal} scale={[0.22, 0.32, 0.22]} line={4} />
    <Toon geometry={G.cone} color={P.teal} position={[0.32, 0.07, 0]} rotation={[0, 0, -1.0]} scale={[0.05, 0.4, 0.05]} line={3} />
  </group>
);
