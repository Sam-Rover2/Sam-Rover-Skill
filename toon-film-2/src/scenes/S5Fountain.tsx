import { blink, keys, ramp } from '../lib/anim';
import { G } from '../lib/geometry';
import { LIGHTS2, Stage } from '../lib/Stage';
import { P, SIZE } from '../lib/style';
import { Flat, type V3 } from '../lib/Toon';
import { Character, type Pose } from '../rig/Character';
import { blendPose, breathe, sit, walk } from '../rig/motion';
import { handWorld } from '../rig/world';
import { Balloon, Fountain } from '../props/Big';
import { Bench, Shadow, StreetLamp, Tree } from '../props/Props';
import { SkyBackdrop } from '../props/Sky';
import { offset } from './common';
import { LENA, MAX, useT } from '../cast';

const BENCH: V3 = [-1.2, 0, -0.6];
const STAND = 4.0; // Lena stands up 4.0 → 4.8
const GIVE = 5.7;

/** Park: sad Lena on a bench; Max arrives with her balloon. */
export const S5Fountain: React.FC = () => {
  const t = useT();
  // Max walks in from the left and stops beside the bench
  const mx = keys(t, [[0, -12], [2.6, -4.4]], (k) => 1 - (1 - k) * (1 - k));
  const mStop = ramp(t, 2.2, 2.7);
  const mRot = keys(t, [[0, 1.4], [2.4, 1.4], [3.0, 0.8]]);
  const mPos: V3 = [mx, 0, 0.4];
  const mOffer = keys(t, [[4.9, 0], [5.5, 1], [GIVE, 1], [6.2, 0]]);
  const mHand: V3 = t < 4.9 ? [0.55, 2.5, 0.1] : t < GIVE + 0.5 ? [0.3, 2.0 + mOffer * 0.2, 0.4 + mOffer * 0.75] : [0.55, 3.25, -0.05];

  // Lena: sits (sad) → looks up → stands and steps forward off the bench (never through it)
  const up = ramp(t, STAND, STAND + 0.8);
  const lRot = keys(t, [[0, 0.1], [3.0, 0.1], [3.4, -0.5]]);
  const lPos: V3 = [BENCH[0], 0, BENCH[2] + up * 0.75];
  const lTake = keys(t, [[5.1, 0], [5.6, 1], [GIVE, 1], [6.3, 0.4]]);
  const lHand: V3 = t < GIVE ? [-0.3, 1.9 + lTake * 0.3, 0.4 + lTake * 0.75] : [-0.5, 2.3 + lTake * 0.3, 0.45];
  const sitPose = sit(SIZE.seatH);
  const stand: Pose = { hips: [0, 0, 0], footL: [-0.24, 0.1, 0.04], footR: [0.24, 0.1, 0.04], kneeDir: [0, 0, 1], lean: 0 };
  const body = blendPose(sitPose, stand, up);

  // balloon: Max's hand → Lena's hand at GIVE
  const from = t < GIVE ? handWorld(mPos, mRot, 1, mHand) : handWorld(lPos, lRot, -1, lHand);
  const to = offset(from, [t < GIVE ? -0.6 + mStop * 0.8 : -0.2, 2.3, -0.1 + Math.sin(t * 1.4) * 0.1]);

  const close = t > 3.6;
  const cam = close
    ? { pos: keys(t, [[3.6, [-2.2, 3.4, 9.6]], [8, [-2.6, 3.5, 8.6]]]), target: [-2.7, 3.0, 0] as V3, fov: 32, shake: 0.03, t }
    : { pos: keys(t, [[0, [-4, 4.2, 16]], [3.6, [-3, 3.8, 13.5]]]), target: keys(t, [[0, [-4.5, 2.8, 0]], [3.6, [-2.4, 2.6, 0]]]), fov: 34, shake: 0.03, t };

  const lenaSad = t < 3.0;
  return (
    <Stage light={LIGHTS2.golden} cam={cam} background="#f6d2a8">
      <SkyBackdrop colors={['#9fb6e0', '#e8b8a8', '#f6d2a8', '#ffe2b8']} y={30} h={120} />
      <Flat color={P.grass} rotation={[-Math.PI / 2, 0, 0]} scale={[300, 300, 1]} />
      <Flat geometry={G.disc} color={P.sidewalk} rotation={[-Math.PI / 2, 0, 0]} position={[4.5, 0.004, -3.5]} scale={9} />
      <Flat color={P.sidewalk} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 1.2]} scale={[300, 3.2, 1]} />
      <Fountain position={[5.5, 0, -4.5]} t={t} />
      {[[-12, -5], [14, -7], [-20, -14], [24, -16], [2, -18]].map(([x, z], i) => (
        <group key={i}>
          <Tree position={[x, 0, z]} scale={SIZE.treeScale} colors={i % 2 ? [P.plant, P.plantDark] : [P.leafYellow, P.plant]} />
          <Shadow position={[x, 0, z]} r={3} opacity={0.14} />
        </group>
      ))}
      <StreetLamp position={[-6.5, 0, -1.6]} scale={SIZE.lampScale} />
      {Array.from({ length: 30 }).map((_, i) => (
        <Flat key={i} geometry={G.disc} color={[P.red, P.white, P.yellow][i % 3]} rotation={[-Math.PI / 2, 0, 0]} position={[-14 + (i * 7.3) % 28, 0.01, -8 + (i * 3.7) % 7]} scale={0.12} />
      ))}
      <Bench position={BENCH} />
      <Shadow position={BENCH} r={2} opacity={0.14} />
      {/* Lena */}
      <group position={lPos} rotation={[0, lRot, 0]}>
        <Character
          look={LENA}
          pose={{
            ...body,
            squash: breathe(t, 1) * (lenaSad ? 0.98 : 1),
            handL: t < STAND ? [-0.3, SIZE.seatH + 0.45, 0.5] : lHand,
            handR: t < STAND ? [0.3, SIZE.seatH + 0.45, 0.5] : t > 6.4 ? [0.6, 2.6, 0.5] : undefined,
            elbowL: [-0.7, -0.3, -0.2],
            blink: blink(t, [1.4, 3.5, 7.0]),
            expr: lenaSad ? 'sad' : t < STAND ? 'o' : 'grin',
            brows: lenaSad ? 0.9 : t < STAND ? 0.7 : 0,
            happy: t > 6.0 ? 1 : 0,
            headNod: lenaSad ? 0.3 : t < STAND ? -0.05 : -0.1,
            look: lenaSad ? [0, -1] : [-0.7, 0.3],
          }}
        />
      </group>
      {/* Max */}
      <group position={mPos} rotation={[0, mRot, 0]}>
        <Shadow r={0.85} />
        <Character
          look={MAX}
          pose={{
            ...(mStop < 1 ? walk((mx + 12) / 0.68, 1 - mStop) : {}),
            squash: breathe(t),
            handR: mHand,
            elbowR: t > GIVE + 0.5 ? [0.8, 0.4, -0.3] : [0.7, -0.4, -0.2],
            blink: blink(t, [1.8, 4.4]),
            expr: t > GIVE + 0.5 ? 'smile' : 'grin',
            happy: t > 6.3 ? 1 : 0,
            brows: t > GIVE + 0.5 ? 0.3 : 0,
            headTilt: t > GIVE + 0.5 ? 0.1 : 0,
            look: [0.6, 0],
          }}
        />
      </group>
      <Balloon from={from} to={to} />
      {[0, 1, 2].map((i) => {
        const k = ramp(t, 6.4 + i * 0.3, 7.8 + i * 0.3);
        return k > 0 && k < 1 && <Flat key={i} geometry={G.disc} color={P.blush} opacity={1 - k} position={[-2.6 + i * 0.4, 4.2 + k * 1.6, 1.2]} scale={0.12} />;
      })}
    </Stage>
  );
};
