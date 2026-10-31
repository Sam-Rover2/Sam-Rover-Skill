import { blink, keys, ramp } from '../lib/anim';
import { LIGHTS2, Stage } from '../lib/Stage';
import { P, SIZE } from '../lib/style';
import type { V3 } from '../lib/Toon';
import { Character } from '../rig/Character';
import { breathe } from '../rig/motion';
import { handWorld } from '../rig/world';
import { Balloon, BalloonCart, Building } from '../props/Big';
import { Cloud, Shadow, StreetLamp, Tree } from '../props/Props';
import { SkyBackdrop } from '../props/Sky';
import { freeBalloon, Gust, offset, StreetGround } from './common';
import { LENA, VENDOR, useT } from '../cast';

export const RELEASE = 5.2;
const LENA_POS: V3 = [0, 0, 0.8];
const VENDOR_POS: V3 = [4.6, 0, -1.2];
const HANDOFF = 2.4;
const HOLD_OFFSET: V3 = [0.3, 2.4, 0.1];

/** Morning street market: Lena gets a red balloon; a gust takes it away. */
export const S1Market: React.FC = () => {
  const t = useT();
  const lenaRot = keys(t, [[0, 0.7], [2.6, 0.7], [3.3, 0.05], [RELEASE, 0.05], [5.8, 0.4]]);
  const vendorRot = -0.7;
  const give = keys(t, [[1.3, 0], [2.0, 1], [HANDOFF, 1], [2.9, 0]]);
  const take = keys(t, [[1.7, 0], [2.2, 1], [HANDOFF, 1]]);
  const reachUp = ramp(t, RELEASE + 0.15, RELEASE + 0.6);

  const vendorHand: V3 = [0.25, 2.0 + give * 0.3, 0.45 + give * 0.6];
  const lenaHand: V3 =
    t < HANDOFF ? [0.3, 1.9 + take * 0.4, 0.45 + take * 0.6] : t < RELEASE ? [0.6, 2.4, 0.35] : [0.55 + reachUp * 0.1, 2.4 + reachUp * 1.1, 0.35];

  // balloon in world space, owned by vendor → Lena → nobody (flies away)
  const releasePoint = offset(handWorld(LENA_POS, lenaRot, 1, [0.6, 2.4, 0.35]), HOLD_OFFSET);
  let bFrom: V3;
  let bTo: V3;
  if (t < HANDOFF) {
    bFrom = handWorld(VENDOR_POS, vendorRot, 1, vendorHand);
    bTo = offset(bFrom, [0.2, 2.4, 0]);
  } else if (t < RELEASE) {
    bFrom = handWorld(LENA_POS, lenaRot, 1, lenaHand);
    bTo = offset(bFrom, [HOLD_OFFSET[0] + Math.sin(t * 1.6) * 0.15, HOLD_OFFSET[1], HOLD_OFFSET[2]]);
  } else {
    const dt = t - RELEASE;
    [bFrom, bTo] = freeBalloon([releasePoint[0] + dt * 1.2, releasePoint[1] + dt * dt * 0.9 + dt * 1.2, releasePoint[2]], t);
  }

  const follow = ramp(t, RELEASE + 0.3, 7);
  const cam = {
    pos: keys(t, [[0, [2.6, 4.2, 18]], [RELEASE, [1.6, 4.0, 15.5]], [7, [2.2, 4.6, 15]]]),
    target: [1.6 + follow * 1.5, 3.0 + follow * Math.max(0, bTo[1] - 3.5) * 0.85, 0] as V3,
    fov: 34,
    shake: 0.04,
    t,
  };

  return (
    <Stage light={LIGHTS2.morning} cam={cam} background={P.skyDay[0]}>
      <SkyBackdrop colors={['#8fc0ec', '#b5d7f3', '#d8ecfb']} y={40} h={140} />
      {[[-30, 48, -70], [20, 56, -80], [60, 44, -70]].map(([x, y, z], i) => (
        <Cloud key={i} position={[x + t * 0.5, y, z]} scale={7} />
      ))}
      <StreetGround />
      {/* real-scale houses: 3 m storeys, door taller than people */}
      <Building position={[-34, 0, -6]} w={28} floors={4} color="#9cb6d8" awning={P.navy} litSeed={1} />
      <Building position={[-3, 0, -6]} w={32} floors={5} color={P.brick} awning={P.teal} litSeed={2} />
      <Building position={[30, 0, -6]} w={26} floors={4} color={P.wallCream} awning={P.red} litSeed={3} />
      {[-14, 14].map((x) => (
        <group key={x}>
          <Tree position={[x, 0, 3.5]} scale={SIZE.treeScale} />
          <Shadow position={[x, 0, 3.5]} r={3} opacity={0.14} />
        </group>
      ))}
      <StreetLamp position={[-7, 0, 4.2]} scale={SIZE.lampScale} />
      <StreetLamp position={[22, 0, 4.2]} scale={SIZE.lampScale} />
      <BalloonCart position={[3.2, 0, -1.6]} t={t} missing={t > 1.2 ? 0 : -1} />
      <Shadow position={[3.2, 0, -1.6]} r={1.6} />
      <group position={VENDOR_POS} rotation={[0, vendorRot, 0]}>
        <Shadow r={0.85} />
        <Character
          look={VENDOR}
          pose={{
            squash: breathe(t, 3),
            handR: give > 0 || t < HANDOFF ? vendorHand : undefined,
            elbowR: [0.7, -0.3, -0.3],
            blink: blink(t, [0.9, 4.0]),
            expr: t > RELEASE + 0.3 ? 'o' : 'grin',
            brows: t > RELEASE + 0.3 ? 0.8 : -0.1,
            look: t > RELEASE + 0.3 ? [0.3, 1] : [-0.6, 0],
            headNod: t > RELEASE + 0.3 ? -0.2 : 0,
          }}
        />
      </group>
      <group position={LENA_POS} rotation={[0, lenaRot, 0]}>
        <Shadow r={0.85} />
        <Character
          look={LENA}
          pose={{
            squash: breathe(t) * (t > 3.0 && t < 3.6 ? 1 + 0.04 * Math.sin((t - 3) * 10) : 1),
            hips: [0, reachUp * 0.12, 0],
            footL: reachUp > 0 ? [-0.24, 0.1 + reachUp * 0.12, 0.04] : undefined,
            footR: reachUp > 0 ? [0.24, 0.1 + reachUp * 0.12, 0.04] : undefined,
            handR: lenaHand,
            elbowR: [0.7, -0.4, -0.2],
            handL: t > RELEASE + 0.3 ? [-0.55, 3.0, 0.4] : undefined,
            blink: blink(t, [1.1, 4.4]),
            happy: t > 2.6 && t < RELEASE ? 1 : 0,
            expr: t > RELEASE + 0.1 ? 'o' : 'grin',
            brows: t > RELEASE + 0.1 ? 0.9 : 0,
            look: t < 2.6 ? [0.7, 0.2] : t > RELEASE ? [0.4, 1] : [0.2, 0.3],
            headNod: t > RELEASE + 0.2 ? -0.28 : 0,
            headTilt: t > 2.6 && t < RELEASE ? 0.1 : 0,
          }}
        />
      </group>
      <Balloon from={bFrom} to={bTo} />
      <Gust t={t} t0={RELEASE - 0.3} />
    </Stage>
  );
};
