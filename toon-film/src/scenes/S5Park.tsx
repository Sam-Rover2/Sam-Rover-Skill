import { blink, hash, keys, ramp } from '../lib/anim';
import { G } from '../lib/geometry';
import { LIGHTS, Stage } from '../lib/Stage';
import { P } from '../lib/style';
import { Flat, Toon } from '../lib/Toon';
import { Character } from '../rig/Character';
import { breathe, sit } from '../rig/motion';
import { Bench, PaperCup, Shadow, StreetLamp, Tree } from '../props/Props';
import { Bird, SkyBackdrop } from '../props/Sky';
import { LENA_COAT, MAX, useT } from '../cast';

/** Falling leaves: deterministic paths, spinning flat shapes. */
const Leaves: React.FC<{ t: number }> = ({ t }) => (
  <>
    {Array.from({ length: 26 }).map((_, i) => {
      const life = 4.5;
      const k = ((t + hash(i) * life) % life) / life;
      const x = -7 + hash(i + 3) * 14 + Math.sin(k * 6 + i) * 0.6;
      const y = 7 - k * 7.2;
      const z = -3 + hash(i + 7) * 6;
      return (
        <Flat
          key={i}
          geometry={G.disc}
          color={[P.leafOrange, P.leafYellow, P.red][i % 3]}
          position={[x, y, z]}
          rotation={[k * 9 + i, k * 7, k * 5]}
          scale={[0.13, 0.07, 1]}
        />
      );
    })}
  </>
);

/** Sunset in the park: they sit on a bench and talk; slow cinematic arc. */
export const S5Park: React.FC = () => {
  const t = useT();
  const a = keys(t, [[0, -0.42], [6.5, 0.28]]);
  const r = keys(t, [[0, 11.5], [6.5, 9.6]]);
  const cam = { pos: [Math.sin(a) * r, 3.2, Math.cos(a) * r] as [number, number, number], target: [0, 2.3, 0] as [number, number, number], fov: 30, shake: 0.03, t };
  const laugh = ramp(t, 2.4, 2.7) * (1 - ramp(t, 3.6, 3.9));
  const lenaTalk = (t > 0.4 && t < 2.3) || (t > 4.6 && t < 5.6) ? Math.abs(Math.sin(t * 10)) : 0;
  const maxTalk = t > 1.2 && t < 2.2 ? 0 : t > 3.9 && t < 4.5 ? Math.abs(Math.sin(t * 11)) : 0;
  const lampOn = t > 4.2 ? 1 : 0;
  const s = sit(0.95);

  return (
    <Stage light={LIGHTS.sunset} cam={cam} background={P.skySunset[1]}>
      <SkyBackdrop colors={['#7d6aa8', '#b5719b', '#f39a6b', '#ffc27a', '#ffe0a0']} y={22} sun={{ pos: [6, 4 - t * 0.3], r: 5, color: '#fff0b0' }} />
      {/* distant city silhouette */}
      {Array.from({ length: 18 }).map((_, i) => (
        <Flat key={i} color={i % 2 ? '#8a5f86' : '#7a527a'} position={[-60 + i * 7, 4 + (i % 5) * 2, -40]} scale={[6, 8 + (i % 5) * 4, 1]} />
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <Bird key={i} position={[8 - t * 2 + i * 1.4, 12 + (i % 2) * 0.7, -25]} flap={t * 12 + i} />
      ))}
      {/* ground + path */}
      <Flat color={P.grass} rotation={[-Math.PI / 2, 0, 0]} scale={[200, 200, 1]} />
      <Flat color={P.sidewalk} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 2.4]} scale={[200, 2.2, 1]} />
      {Array.from({ length: 40 }).map((_, i) => (
        <Toon key={i} geometry={G.cone} color={i % 2 ? '#5f9e45' : '#6dab4f'} position={[-15 + hash(i) * 30, 0.15, -4 + hash(i + 50) * 12]} scale={[0.08, 0.3, 0.08]} line={0} />
      ))}
      {/* trees, bushes, lamp */}
      {[[-5.5, -2.5, 1.0], [5, -3, 1.1], [-10, -6, 1.2], [10, -6.5, 1.0], [0, -8, 1.3]].map(([x, z, sc], i) => (
        <group key={i}>
          <Tree position={[x, 0, z]} scale={sc} colors={i % 2 ? [P.leafOrange, P.leafYellow] : [P.leafYellow, P.red, P.leafOrange]} />
          <Shadow position={[x, 0, z]} r={1.3 * sc} />
        </group>
      ))}
      {[[-3.2, -1.2], [3.4, -1.4]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {[[-0.5, 0.45, 0.6], [0.3, 0.5, 0.7], [0, 0.85, 0.55]].map(([bx, by, br], j) => (
            <Toon key={j} geometry={G.sphere} color={j % 2 ? '#4f8f3f' : P.plant} position={[bx, by, 0]} scale={br} line={4} />
          ))}
        </group>
      ))}
      <StreetLamp position={[2.8, 0, -0.9]} on={lampOn} />
      {lampOn > 0 && <Flat geometry={G.disc} color={P.lampGlow} opacity={0.25} position={[2.8, 4.28, -0.6]} scale={0.9} />}
      <Bench position={[0, 0, -0.1]} />
      <Shadow position={[0, 0, -0.1]} r={2} opacity={0.15} />
      <Leaves t={t} />
      {/* Max (left) and Lena (right) */}
      <group position={[-0.72, 0, 0]} rotation={[0, 0.3, 0]}>
        <Character
          look={MAX}
          pose={{
            ...s,
            squash: breathe(t),
            lean: -0.05 - laugh * 0.15,
            handL: [-0.3, 1.45, 0.55],
            holdL: <PaperCup position={[0, 0.05, 0.05]} heart scale={0.9} />,
            handR: maxTalk > 0 ? [0.55, 1.9 + maxTalk * 0.2, 0.6] : [0.35, 1.25, 0.6],
            elbowR: [0.7, -0.3, -0.3],
            blink: blink(t, [1.0, 4.8]),
            happy: laugh > 0.5 ? 1 : 0,
            expr: laugh > 0.5 ? 'grin' : 'smile',
            talk: maxTalk,
            headTurn: 0.35,
            headTilt: -0.1 * laugh,
            headNod: -0.15 * laugh,
            look: [0.6, 0],
          }}
        />
      </group>
      <group position={[0.72, 0, 0]} rotation={[0, -0.3, 0]}>
        <Character
          look={LENA_COAT}
          pose={{
            ...s,
            squash: breathe(t, 2),
            lean: -0.05 - laugh * 0.12,
            handR: [0.3, 1.45, 0.55],
            holdR: <PaperCup position={[0, 0.05, 0.05]} scale={0.9} />,
            handL: lenaTalk > 0 ? [-0.6, 1.9 + 0.15 * Math.sin(t * 6), 0.55] : [-0.35, 1.25, 0.6],
            elbowL: [-0.7, -0.3, -0.3],
            blink: blink(t, [2.0, 5.3]),
            happy: laugh > 0.5 ? 1 : 0,
            expr: laugh > 0.5 ? 'grin' : 'smile',
            talk: lenaTalk,
            headTurn: -0.35,
            headTilt: 0.1 * laugh,
            headNod: -0.12 * laugh,
            look: [-0.6, 0],
          }}
        />
      </group>
    </Stage>
  );
};
