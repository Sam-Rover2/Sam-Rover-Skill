import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import { useLayoutEffect } from 'react';
import { AbsoluteFill } from 'remotion';
import { setRenderStyle } from '../lib/materials';
import { Brush, Post, Rope, STICK_POSES, Stick } from './Stick';

type V3 = [number, number, number];

const Cam: React.FC<{ pos: V3; target: V3; fov: number }> = ({ pos, target, fov }) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.lookAt(...target);
    if ('fov' in camera) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });
  return null;
};

/** Paper-grey studio with a soft vignette, like the reference. */
const Paper: React.FC<{ cam: { pos: V3; target: V3; fov: number }; children: React.ReactNode }> = ({ cam, children }) => {
  setRenderStyle({ id: 'stick', fill: 'toon3', ink: '#0b0b0b', line: 1 });
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #ececec 0%, #dcdcdc 55%, #a9a9a9 100%)' }}>
      <ThreeCanvas width={1920} height={1080} linear={false}>
        <Cam {...cam} />
        <ambientLight intensity={1.1} />
        <directionalLight position={[-4, 6, 8]} intensity={1.6} />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** Ink cliff: thick top edge + loose vertical hatching. */
const Cliff: React.FC<{ x0: number; x1: number; y: number; seed: number; dir: 1 | -1 }> = ({ x0, x1, y, seed, dir }) => (
  <group>
    <Brush pts={[[x0, y + 0.05, 0], [(x0 + x1) / 2, y + 0.12, 0], [x1, y, 0]]} width={0.35} taper={dir > 0 ? [0.02, 0.2] : [0.2, 0.02]} seed={seed} />
    {Array.from({ length: 7 }).map((_, i) => {
      const x = x1 - dir * (0.2 + i * 0.75);
      const h = 2.2 - i * 0.22;
      return <Brush key={i} pts={[[x, y - 0.1, 0], [x + 0.05 * dir, y - h * 0.5, 0], [x - 0.04, y - h, 0]]} width={0.16 - i * 0.012} taper={[0.05, 0.6]} seed={seed + i * 7} />;
    })}
  </group>
);

const Tree: React.FC<{ x: number; y: number; seed: number }> = ({ x, y, seed }) => (
  <group>
    <Brush pts={[[x, y, 0], [x + 0.1, y + 1.6, 0], [x - 0.05, y + 3.2, 0]]} width={0.32} taper={[0.02, 0.4]} seed={seed} />
    <Brush pts={[[x + 0.05, y + 1.9, 0], [x + 0.8, y + 2.6, 0], [x + 1.4, y + 2.9, 0]]} width={0.14} taper={[0.05, 0.5]} seed={seed + 1} />
    <Brush pts={[[x, y + 2.4, 0], [x - 0.7, y + 3.0, 0], [x - 1.2, y + 3.5, 0]]} width={0.12} taper={[0.05, 0.5]} seed={seed + 2} />
    <Brush pts={[[x - 0.02, y + 2.9, 0], [x + 0.5, y + 3.6, 0], [x + 0.7, y + 4.1, 0]]} width={0.1} taper={[0.05, 0.5]} seed={seed + 3} />
  </group>
);

const Bird: React.FC<{ x: number; y: number; s?: number; seed: number }> = ({ x, y, s = 1, seed }) => (
  <group>
    <Brush pts={[[x - 0.5 * s, y + 0.2 * s, 0], [x - 0.2 * s, y + 0.15 * s, 0], [x, y, 0]]} width={0.07 * s} taper={[0.5, 0.05]} seed={seed} bristles={false} />
    <Brush pts={[[x, y, 0], [x + 0.25 * s, y + 0.18 * s, 0], [x + 0.55 * s, y + 0.25 * s, 0]]} width={0.07 * s} taper={[0.05, 0.5]} seed={seed + 1} bristles={false} />
  </group>
);

/** The wobbly rope bridge from the reference, rebuilt from brush strokes. */
const Bridge: React.FC = () => {
  const deckY = 2.0;
  return (
    <group>
      {/* planks */}
      {Array.from({ length: 11 }).map((_, i) => {
        const x = -4.2 + i * 0.78;
        const sag = -0.35 * Math.sin(((i + 0.5) / 11) * Math.PI);
        return (
          <Brush
            key={i}
            pts={[[x, deckY + sag - 0.03, 0.2], [x + 0.28, deckY + sag + 0.02, 0.2], [x + 0.56, deckY + sag - 0.02, 0.2]]}
            width={0.5}
            taper={[0.04, 0.08]}
            seed={40 + i}
            rough={0.25}
            bristles={i % 3 === 0}
          />
        );
      })}
      <Rope a={[-4.6, deckY - 0.1, 0.1]} b={[4.6, deckY - 0.1, 0.1]} sag={0.38} w={0.14} seed={60} />
      <Post x={-3.6} y0={-1.2} y1={3.7} seed={70} />
      <Post x={3.8} y0={-1.6} y1={4.1} seed={71} />
      {/* hand ropes */}
      <Rope a={[-3.6, 3.5, 0]} b={[3.8, 3.9, 0]} sag={0.9} w={0.12} seed={80} />
      <Rope a={[-6.2, 3.0, 0]} b={[-3.6, 3.5, 0]} sag={0.25} w={0.12} seed={81} tail />
      <Rope a={[3.8, 3.9, 0]} b={[6.6, 3.0, 0]} sag={0.2} w={0.12} seed={82} tail />
    </group>
  );
};

export const StickScene: React.FC = () => (
  <Paper cam={{ pos: [0, 3.2, 40], target: [0, 2.6, 0], fov: 24 }}>
    {/* sun: ink ring */}
    <Brush pts={Array.from({ length: 13 }, (_, i) => [-11 + Math.cos((i / 12) * Math.PI * 2 + 0.3) * 1.3, 8.4 + Math.sin((i / 12) * Math.PI * 2 + 0.3) * 1.3, -2] as V3)} width={0.14} taper={[0.05, 0.25]} seed={90} />
    <Bird x={-6} y={8.2} seed={91} />
    <Bird x={-4.6} y={8.9} s={0.7} seed={93} />
    <Bird x={6.5} y={7.6} s={0.85} seed={95} />
    <Cliff x0={-15} x1={-4.4} y={2.0} seed={100} dir={1} />
    <Cliff x0={15} x1={4.4} y={2.0} seed={120} dir={-1} />
    <Tree x={10.5} y={2.1} seed={140} />
    <Bridge />
    {/* hero on the bridge: startled */}
    <group position={[-0.4, 1.72, 0.3]}>
      <Stick pose={STICK_POSES.surprised.pose} scale={0.95} />
    </group>
    {/* friend on the left cliff waving */}
    <group position={[-9, 2.1, 0.3]} rotation={[0, Math.PI, 0]}>
      <Stick pose={STICK_POSES.wave.pose} scale={0.95} />
    </group>
    {/* someone sitting on the right cliff edge */}
    <group position={[6.6, 2.15, 0.3]} rotation={[0, Math.PI, 0]}>
      <Stick pose={STICK_POSES.sit.pose} scale={0.95} />
    </group>
  </Paper>
);

export const StickClose: React.FC = () => (
  <Paper cam={{ pos: [-0.2, 4.1, 16], target: [-0.1, 3.6, 0], fov: 24 }}>
    <Bridge />
    <group position={[-0.4, 1.72, 0.3]}>
      <Stick pose={STICK_POSES.surprised.pose} scale={0.95} />
    </group>
  </Paper>
);

export const StickPoses: React.FC = () => {
  const keys = Object.keys(STICK_POSES);
  return (
    <Paper cam={{ pos: [0, 2.4, 38], target: [0, 2.2, 0], fov: 24 }}>
      <Brush pts={[[-15, 0, 0], [0, 0.08, 0], [15, -0.02, 0]]} width={0.22} taper={[0.03, 0.08]} seed={7} />
      {keys.map((k, i) => (
        <group key={k} position={[(i - (keys.length - 1) / 2) * 3.3 - (k === 'sit' ? 0.5 : 0), 0, 0]}>
          {k === 'sit' && <Brush pts={[[-0.4, 0.95, -0.2], [0.3, 0.97, -0.2], [0.9, 0.93, -0.2]]} width={0.2} taper={[0.05, 0.1]} seed={8} bristles={false} />}
          {k === 'sit' && <Brush pts={[[-0.2, 0.95, -0.2], [-0.2, 0.0, -0.2]]} width={0.14} taper={[0.02, 0.1]} seed={9} bristles={false} />}
          <Stick pose={STICK_POSES[k].pose} scale={0.95} />
        </group>
      ))}
    </Paper>
  );
};
