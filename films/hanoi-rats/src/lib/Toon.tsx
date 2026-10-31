import { useMemo } from 'react';
import type * as THREE from 'three';
import { G } from './geometry';
import { flat, outline, toon } from './materials';
import { LINE } from './style';

export type V3 = [number, number, number];

interface ToonProps {
  geometry: THREE.BufferGeometry;
  color: string;
  position?: V3;
  rotation?: V3;
  scale?: V3 | number;
  /** Outline width in px; 0 = none. */
  line?: number;
  /** Flat colour, no shading. */
  unlit?: boolean;
  opacity?: number;
}

/** One cartoon mesh: toon fill + constant-width outline. */
export const Toon: React.FC<ToonProps> = ({ geometry, color, position, rotation, scale, line = LINE.width, unlit, opacity = 1 }) => {
  const fill = useMemo(() => (unlit ? flat(color, opacity) : toon(color)), [color, unlit, opacity]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometry} material={fill} />
      {line > 0 && <mesh geometry={geometry} material={outline(line)} />}
    </group>
  );
};

/** Flat decal / backdrop shape. */
export const Flat: React.FC<{ geometry?: THREE.BufferGeometry; color: string; position?: V3; rotation?: V3; scale?: V3 | number; opacity?: number }> = ({
  geometry,
  color,
  position,
  rotation,
  scale,
  opacity = 1,
}) => <mesh geometry={geometry ?? G.plane} material={flat(color, opacity)} position={position} rotation={rotation} scale={scale} />;
