import { useMemo } from 'react';
import type * as THREE from 'three';
import { flat, outline, toon } from './materials';
import { LINE } from './style';

type V3 = [number, number, number];

interface ToonProps {
  geometry: THREE.BufferGeometry;
  color: string;
  position?: V3;
  rotation?: V3;
  scale?: V3 | number;
  /** Outline width in px; 0 = no outline. */
  line?: number;
  /** Flat colour without shading (screens, decals). */
  unlit?: boolean;
}

/** One cartoon mesh: toon-shaded fill + constant-width black outline. */
export const Toon: React.FC<ToonProps> = ({ geometry, color, position, rotation, scale, line = LINE.width, unlit }) => {
  const fill = useMemo(() => (unlit ? flat(color) : toon(color)), [color, unlit]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometry} material={fill} />
      {line > 0 && <mesh geometry={geometry} material={outline(line)} />}
    </group>
  );
};
