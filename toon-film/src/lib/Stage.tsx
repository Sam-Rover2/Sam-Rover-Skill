import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { useLayoutEffect } from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { noise } from './anim';
import type { V3 } from './Toon';

export type LightPreset = { ambient: string; ambientI: number; sun: string; sunI: number; sunPos: V3; fog?: [string, number, number] };

export const LIGHTS = {
  dawn: { ambient: '#ffe6dc', ambientI: 1.4, sun: '#ffcfa8', sunI: 2.1, sunPos: [-6, 5, 8], fog: ['#f3c4ad', 45, 120] },
  kitchen: { ambient: '#fff6e8', ambientI: 1.6, sun: '#fff0d8', sunI: 2.0, sunPos: [-4, 8, 6] },
  day: { ambient: '#ffffff', ambientI: 1.65, sun: '#fffaf0', sunI: 2.1, sunPos: [-5, 9, 7], fog: ['#d8ecfb', 30, 90] },
  cafe: { ambient: '#fff1dc', ambientI: 1.6, sun: '#ffe2b8', sunI: 2.0, sunPos: [-3, 8, 6] },
  sunset: { ambient: '#ffd5c0', ambientI: 1.3, sun: '#ffab72', sunI: 2.4, sunPos: [7, 4, 6], fog: ['#f3a07a', 22, 70] },
  office: { ambient: '#f4f8ff', ambientI: 1.7, sun: '#ffffff', sunI: 2.0, sunPos: [-4, 9, 7] },
} satisfies Record<string, LightPreset>;

export interface Cam {
  pos: V3;
  target: V3;
  fov?: number;
  /** Handheld shake amplitude in units (0 = locked-off). */
  shake?: number;
  t?: number;
}

const Rig: React.FC<Cam> = ({ pos, target, fov = 32, shake = 0, t = 0 }) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    const n = (seed: number) => noise(t * 0.7, seed) * shake;
    camera.position.set(pos[0] + n(1), pos[1] + n(2), pos[2]);
    camera.lookAt(target[0] + n(3) * 0.5, target[1] + n(4) * 0.5, target[2]);
    if ('fov' in camera) {
      camera.fov = fov;
      camera.near = 0.1;
      camera.far = 300;
      camera.updateProjectionMatrix();
    }
  });
  return null;
};

/** One shot: a Three.js canvas with light preset, fog and a camera. */
export const Stage: React.FC<{ light: LightPreset; cam: Cam; background: string; children: React.ReactNode }> = ({
  light,
  cam,
  background,
  children,
}) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background }}>
      <ThreeCanvas width={width} height={height} linear={false}>
        <Rig {...cam} />
        {light.fog && <fog attach="fog" args={light.fog} />}
        <ambientLight color={light.ambient} intensity={light.ambientI} />
        <directionalLight color={light.sun} intensity={light.sunI} position={light.sunPos} />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
