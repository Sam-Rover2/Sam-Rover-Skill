import { keys } from '../lib/anim';
import { G } from '../lib/geometry';
import { LIGHTS, Stage } from '../lib/Stage';
import { P, SIZE } from '../lib/style';
import { Flat, type V3 } from '../lib/Toon';
import { Character } from '../rig/Character';
import { walk } from '../rig/motion';
import { handWorld } from '../rig/world';
import { Balloon, Building } from '../props/Big';
import { Shadow, StreetLamp, Tree } from '../props/Props';
import { Bird, SkyBackdrop } from '../props/Sky';
import { offset } from './common';
import { LENA, MAX, useT } from '../cast';

/** Finale: they walk away along the path into the sunset; the camera cranes up over the city. */
export const S6Sunset: React.FC = () => {
  const t = useT();
  const z = keys(t, [[0, 2], [7, -9]], (k) => k);
  const ph = (2 - z) / 0.68;
  const rot = Math.PI + 0.12;
  const lPos: V3 = [0.75, 0, z];
  const mPos: V3 = [-0.75, 0, z];
  const lHand: V3 = [0.5, 2.5, 0.2];
  const from = handWorld(lPos, rot, 1, lHand);
  const to = offset(from, [0.2 + Math.sin(t * 1.3) * 0.2, 2.3, 0.3]);
  const cam = {
    pos: keys(t, [[0, [1.5, 3.2, 11]], [7, [1.5, 11, 16]]]),
    target: keys(t, [[0, [0, 2.8, 0]], [7, [0, 3, -30]]]),
    fov: 36,
    shake: 0.03,
    t,
  };
  const wM = walk(ph);
  return (
    <Stage light={LIGHTS.sunset} cam={cam} background={P.skySunset[1]}>
      <SkyBackdrop colors={['#7d6aa8', '#b5719b', '#f39a6b', '#ffc27a', '#ffe0a0']} y={40} h={140} z={-120} w={500} sun={{ pos: [6, 12 - t * 0.6], r: 9, color: '#fff0b0' }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <Bird key={i} position={[-14 + t * 3 + i * 2, 22 + (i % 2), -40]} flap={t * 12 + i} />
      ))}
      {/* real-scale city at the end of the park */}
      {[-90, -55, -20, 15, 50, 85].map((x, i) => (
        <Building key={x} position={[x, 0, -70 - (i % 2) * 10]} w={30} floors={5 + (i % 3) * 2} color={['#8a5f86', '#7a527a', '#9a6a8e'][i % 3]} trim="#c99ab0" litSeed={i} />
      ))}
      <Flat color={P.grass} rotation={[-Math.PI / 2, 0, 0]} scale={[400, 400, 1]} />
      <Flat color={P.sidewalk} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -20]} scale={[3.6, 60, 1]} />
      {[-1, 1].map((s) =>
        [0, -10, -20, -30].map((zz, i) => (
          <group key={`${s}${zz}`}>
            {i % 2 ? (
              <StreetLamp position={[s * 3.2, 0, zz]} scale={SIZE.lampScale} on={1} />
            ) : (
              <>
                <Tree position={[s * 11, 0, zz - 3]} scale={SIZE.treeScale} colors={[P.leafOrange, P.leafYellow, P.red]} />
                <Shadow position={[s * 11, 0, zz - 3]} r={3} opacity={0.14} />
              </>
            )}
            {i % 2 === 1 && <Flat geometry={G.disc} color={P.lampGlow} opacity={0.25} position={[s * 3.2, 10.3, zz + 0.4]} scale={1.6} />}
          </group>
        )),
      )}
      <group position={mPos} rotation={[0, rot, 0]}>
        <Shadow r={0.85} />
        <Character look={MAX} pose={{ ...wM, handL: [-0.5, 1.6, 0.25] }} />
      </group>
      <group position={lPos} rotation={[0, rot, 0]}>
        <Shadow r={0.85} />
        <Character look={LENA} pose={{ ...walk(ph + 1), handR: lHand, handL: [0.5, 1.6, 0.25], headTilt: 0.1 }} />
      </group>
      <Balloon from={from} to={to} />
    </Stage>
  );
};
