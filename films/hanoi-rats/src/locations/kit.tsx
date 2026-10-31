import { useMemo } from 'react';
import * as THREE from 'three';
import { outline } from '../lib/materials';
import type { V3 } from '../lib/Toon';
import { canvasTex, shade } from '../lib/tex';

/** Shared building blocks for location sets. */
export const RAMP = (() => {
  const t = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 205, 205, 205, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();
export const box = new THREE.BoxGeometry(1, 1, 1);
export const plane = new THREE.PlaneGeometry(1, 1);

/** Textured toon mesh + ink outline. `side` lets us see inside vaults and rooms. */
export const Tx: React.FC<{
  geometry: THREE.BufferGeometry;
  map: THREE.Texture;
  color?: string;
  position?: V3;
  rotation?: V3;
  scale?: V3 | number;
  line?: number;
  side?: THREE.Side;
}> = ({ geometry, map, color = '#ffffff', position, rotation, scale, line = 4, side = THREE.FrontSide }) => {
  const mat = useMemo(() => new THREE.MeshToonMaterial({ map, color, gradientMap: RAMP, side }), [map, color, side]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometry} material={mat} />
      {line > 0 && <mesh geometry={geometry} material={outline(line)} />}
    </group>
  );
};

/** Unlit glowing shape (lamp flames, lit windows, light beams). */
export const Glow: React.FC<{ geometry: THREE.BufferGeometry; color: string; opacity?: number; position?: V3; rotation?: V3; scale?: V3 | number }> = ({
  geometry,
  color,
  opacity = 1,
  position,
  rotation,
  scale,
}) => {
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, toneMapped: false, side: THREE.DoubleSide }),
    [color, opacity],
  );
  return <mesh geometry={geometry} material={mat} position={position} rotation={rotation} scale={scale} />;
};

/** Red brick wall texture. */
export const brickTex = (base = '#9a4a32', mortar = '#6e5a4a', repeat: [number, number] = [6, 4]) =>
  canvasTex(`brick-${base}-${mortar}`, 256, 256, (g, w, h) => {
    g.fillStyle = mortar;
    g.fillRect(0, 0, w, h);
    let seed = 41;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const bh = 32;
    const bw = 64;
    for (let y = 0; y < h; y += bh)
      for (let x = (y / bh) % 2 ? -bw / 2 : 0; x < w; x += bw) {
        g.fillStyle = shade(base, Math.round((r() - 0.5) * 30));
        g.fillRect(x + 3, y + 3, bw - 6, bh - 6);
      }
  }, repeat);

/** Thatch / straw roof texture. */
export const thatchTex = (repeat: [number, number] = [4, 3]) =>
  canvasTex('thatch', 128, 128, (g, w, h) => {
    g.fillStyle = '#b8954e';
    g.fillRect(0, 0, w, h);
    let seed = 13;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 500; i++) {
      g.strokeStyle = r() > 0.5 ? 'rgba(90,60,20,0.35)' : 'rgba(240,215,150,0.35)';
      g.lineWidth = 1 + r();
      const x = r() * w;
      const y = r() * h;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + (r() - 0.5) * 4, y + 10 + r() * 12);
      g.stroke();
    }
  }, repeat);

/** Murky water with ripples. */
export const waterTex = (base = '#3e5a48', repeat: [number, number] = [8, 2]) =>
  canvasTex(`water-${base}`, 256, 128, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    let seed = 7;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    g.strokeStyle = 'rgba(200,230,210,0.25)';
    g.lineWidth = 2;
    for (let i = 0; i < 40; i++) {
      const x = r() * w;
      const y = r() * h;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + 10, y - 4, x + 22, y);
      g.stroke();
    }
  }, repeat);

/** Floor planks. */
export const plankTex = (base = '#a87445', repeat: [number, number] = [6, 6]) =>
  canvasTex(`planks-${base}`, 256, 256, (g, w, h) => {
    const n = 8;
    let seed = 3;
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      g.fillStyle = shade(base, Math.round((r() - 0.5) * 26));
      g.fillRect(0, (i * h) / n, w, h / n);
      g.fillStyle = 'rgba(40,20,5,0.5)';
      g.fillRect(0, (i * h) / n, w, 2);
      g.fillRect(r() * w, (i * h) / n, 2, h / n);
    }
  }, repeat);
