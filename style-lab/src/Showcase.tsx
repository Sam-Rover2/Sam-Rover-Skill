import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import { AbsoluteFill } from 'remotion';
import { useLowPoly } from './lib/geometry';
import { setRenderStyle } from './lib/materials';
import { P, SIZE } from './lib/style';
import { Flat, type V3 } from './lib/Toon';
import { Character } from './rig/Character';
import { handWorld } from './rig/world';
import { Balloon, Building } from './props/Big';
import { Bench, Plant, Shadow, StreetLamp, Tree } from './props/Props';
import { MAX, LENA } from './cast';
import { STYLES } from './styles';

const Cam: React.FC = () => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(0.3, 3.8, 15.5);
    camera.lookAt(0, 3.1, 0);
    if ('fov' in camera) {
      camera.fov = 34;
      camera.updateProjectionMatrix();
    }
  });
  return null;
};

/** One still: Max and Lena in a small park in front of a house, rendered in the chosen style. */
export const Showcase: React.FC<{ styleId: string }> = ({ styleId }) => {
  const st = STYLES.find((s) => s.r.id === styleId)!;
  // style must be active BEFORE children create their materials
  setRenderStyle(st.r);
  useLowPoly(!!st.lowPoly);
  const k = st.pixel ?? 1;
  const w = 1920 / k;
  const h = 1080 / k;
  const lenaPos: V3 = [1.5, 0, 0.6];
  const lenaRot = -0.35;
  const lenaHand: V3 = [0.6, 2.4, 0.35];
  const from = handWorld(lenaPos, lenaRot, 1, lenaHand);
  const to: V3 = [from[0] + 0.3, from[1] + 2.3, from[2]];
  const sky = st.sky ?? ['#9cc9ef', '#d8ecfb'];
  return (
    <AbsoluteFill style={{ background: st.bg }}>
      <AbsoluteFill style={{ filter: st.filter }}>
        <div style={{ width: w, height: h, transform: `scale(${k})`, transformOrigin: '0 0', imageRendering: 'pixelated' }}>
          <ThreeCanvas width={w} height={h} linear={false} gl={{ antialias: k === 1 }}>
            <Cam />
            <ambientLight color={st.light.ambient} intensity={st.light.ai} />
            <directionalLight color={st.light.sun} intensity={st.light.si} position={[-5, 8, 7]} />
            {/* sky and ground */}
            <Flat color={sky[0]} position={[0, 40, -40]} scale={[300, 60, 1]} />
            <Flat color={sky[1]} position={[0, 6, -39]} scale={[300, 20, 1]} />
            <Flat color={st.ground ?? P.grass} rotation={[-Math.PI / 2, 0, 0]} scale={[300, 300, 1]} />
            <Flat color={st.ground ?? P.sidewalk} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -2.2]} scale={[300, 4, 1]} />
            <Building position={[2, 0, -5]} w={30} floors={3} color={P.wallCream} awning={P.red} litSeed={2} />
            <Tree position={[-8, 0, -1.5]} scale={SIZE.treeScale * 0.8} />
            <Shadow position={[-8, 0, -1.5]} r={2.4} opacity={0.14} />
            <StreetLamp position={[6.5, 0, -0.6]} scale={SIZE.lampScale * 0.8} />
            <Plant position={[4.6, 0, -0.8]} big />
            <Bench position={[-3.6, 0, -0.9]} />
            {/* Max waves, Lena holds a balloon */}
            <group position={[-1.3, 0, 0.6]} rotation={[0, 0.35, 0]}>
              <Shadow r={0.85} />
              <Character
                look={MAX}
                pose={{ handR: [0.7, 3.3, 0.3], elbowR: [0.8, -0.2, -0.2], expr: 'grin', look: [0.5, 0.1], headTilt: 0.06 }}
              />
            </group>
            <group position={lenaPos} rotation={[0, lenaRot, 0]}>
              <Shadow r={0.85} />
              <Character look={LENA} pose={{ handR: lenaHand, elbowR: [0.7, -0.4, -0.2], expr: 'smile', look: [-0.5, 0.1], headTilt: -0.05 }} />
            </group>
            <Balloon from={from} to={to} />
          </ThreeCanvas>
        </div>
      </AbsoluteFill>
      {st.overlay && <AbsoluteFill style={{ background: st.overlay, mixBlendMode: (st.overlayBlend ?? 'normal') as 'multiply' }} />}
      {st.r.id === 'pixel' && <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0 3px, transparent 3px 6px)' }} />}
    </AbsoluteFill>
  );
};
