import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import { AbsoluteFill } from 'remotion';
import { G } from './lib/geometry';
import { setRenderStyle } from './lib/materials';
import { LINE, P } from './lib/style';
import { Flat, Toon, type V3 } from './lib/Toon';
import { Figure } from './rig/Figure';
import { DESIGNS } from './designs';
import { Shadow, StreetLamp, Tree } from './props/Props';
import { Building } from './props/Big';
import { CafeShop, Cottage, DetailHouse, Factory, Parisian, Skyscraper } from './props/Buildings';

const Cam: React.FC<{ pos: V3; target: V3; fov?: number }> = ({ pos, target, fov = 30 }) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.lookAt(...target);
    if ('fov' in camera) {
      camera.fov = fov;
      camera.far = 800;
      camera.updateProjectionMatrix();
    }
  });
  return null;
};

const Studio: React.FC<{ cam: { pos: V3; target: V3; fov?: number }; children: React.ReactNode; sky?: boolean }> = ({ cam, children, sky }) => {
  setRenderStyle({ id: 'toon', fill: 'toon3', ink: LINE.color, line: 1 });
  return (
    <AbsoluteFill style={{ background: sky ? 'linear-gradient(#9cc9ef, #e6f2fb)' : 'radial-gradient(circle at 50% 40%, #fffaf2, #e9e1d3)' }}>
      <ThreeCanvas width={1920} height={1080} linear={false}>
        <Cam {...cam} />
        <ambientLight intensity={1.6} />
        <directionalLight intensity={2.1} position={[-5, 9, 8]} color="#fff6e8" />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** One character design, studio framing (same camera for all, so sizes are comparable). */
export const CharCard: React.FC<{ id: string }> = ({ id }) => {
  const def = DESIGNS.find((d) => d.id === id)!;
  return (
    <Studio cam={{ pos: [0, 2.8, 13], target: [0, 2.4, 0], fov: 30 }}>
      <Flat geometry={G.disc} color="#d8cfbf" rotation={[-Math.PI / 2, 0, 0]} scale={3.2} />
      <Shadow r={1.1} opacity={0.2} />
      <group rotation={[0, 0.3, 0]}>
        <Figure d={def.d} pose={def.pose} />
      </group>
    </Studio>
  );
};

/** All characters side by side with a 1 m grid: shows height differences. */
export const Lineup: React.FC = () => {
  const n = DESIGNS.length;
  const gap = 2.35;
  return (
    <Studio cam={{ pos: [0, 3.0, 32], target: [0, 2.7, 0], fov: 30 }}>
      <Flat color="#d8cfbf" rotation={[-Math.PI / 2, 0, 0]} scale={[80, 6, 1]} />
      {[1, 2, 3, 4, 5].map((m) => (
        <Flat key={m} color="#b8ad99" position={[0, m * 1.1, -1.5]} scale={[n * gap + 2, 0.04, 1]} />
      ))}
      {DESIGNS.map((d, i) => (
        <group key={d.id} position={[(i - (n - 1) / 2) * gap, 0, 0]} rotation={[0, 0.15, 0]}>
          <Shadow r={0.9} opacity={0.2} />
          <Figure d={d.d} />
        </group>
      ))}
    </Studio>
  );
};

const PERSON = DESIGNS[0];
const ScaleRef: React.FC<{ x: number; z?: number }> = ({ x, z = 3 }) => (
  <group position={[x, 0, z]}>
    <Shadow r={0.9} />
    <Figure d={PERSON.d} pose={PERSON.pose} />
  </group>
);

const BUILDINGS: Record<string, { C: React.FC; cam: { pos: V3; target: V3; fov?: number } }> = {
  townhouse: { C: () => <Building w={26} floors={4} color={P.brick} awning={P.teal} litSeed={1} />, cam: { pos: [6, 9, 66], target: [2, 13, 0], fov: 34 } },
  skyscraper: { C: () => <Skyscraper />, cam: { pos: [12, 10, 165], target: [0, 44, 0], fov: 34 } },
  cottage: { C: () => <Cottage />, cam: { pos: [5, 6, 40], target: [1, 6, 0], fov: 34 } },
  cafe: { C: () => <CafeShop />, cam: { pos: [4, 6, 38], target: [1, 6, 0], fov: 34 } },
  factory: { C: () => <Factory />, cam: { pos: [8, 8, 58], target: [0, 10, 0], fov: 36 } },
  parisian: { C: () => <Parisian />, cam: { pos: [8, 8, 62], target: [1, 17, 0], fov: 36 } },
};
export const BUILDING_IDS = Object.keys(BUILDINGS);

export const BuildingCard: React.FC<{ id: string }> = ({ id }) => {
  const b = BUILDINGS[id];
  return (
    <Studio cam={b.cam} sky>
      <Flat color={P.grass} rotation={[-Math.PI / 2, 0, 0]} scale={[400, 400, 1]} />
      <Flat color={P.sidewalk} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 4]} scale={[400, 10, 1]} />
      <b.C />
      <ScaleRef x={-6} z={6} />
      <StreetLamp position={[14, 0, 7]} scale={2.4} />
      <Tree position={[-22, 0, 4]} scale={3} />
    </Studio>
  );
};

export const DetailCard: React.FC<{ level: 1 | 2 | 3 }> = ({ level }) => (
  <Studio cam={{ pos: [3, 7, 44], target: [0, 9, 0], fov: 34 }} sky>
    <Flat color={P.sidewalk} rotation={[-Math.PI / 2, 0, 0]} scale={[400, 400, 1]} />
    <DetailHouse level={level} />
    <ScaleRef x={-1} z={5} />
  </Studio>
);
