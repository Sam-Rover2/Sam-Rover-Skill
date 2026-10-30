import { useMemo } from 'react';
import * as THREE from 'three';
import { G } from '../lib/geometry';
import { flat } from '../lib/materials';
import { LINE, P, SIZE } from '../lib/style';
import { Flat, Toon, type V3 } from '../lib/Toon';

type At = { position?: V3; rotation?: V3; scale?: number };

/**
 * Real-scale building: storeys of 3 m (6.6 units), a shop on the ground floor
 * with a door taller than a person. Front face at z=0, grows up from y=0.
 */
export const Building: React.FC<At & { w?: number; floors?: number; color: string; trim?: string; awning?: string; shop?: string; litSeed?: number }> = ({
  w = 30,
  floors = 4,
  color,
  trim = '#f4f4f4',
  awning,
  shop = P.woodDark,
  litSeed = 0,
  ...at
}) => {
  const F = SIZE.floorH;
  const h = F * floors + 1.2;
  const cols = Math.max(2, Math.floor(w / 6));
  return (
    <group {...at}>
      <Toon geometry={G.bigBox} color={color} position={[0, h / 2, -2]} scale={[w, h, 4]} line={5} />
      {/* parapet + cornices between storeys */}
      <Toon geometry={G.bigBox} color={trim} position={[0, h - 0.3, 0.1]} scale={[w + 0.6, 0.6, 0.5]} line={4} />
      {Array.from({ length: floors - 1 }).map((_, i) => (
        <Toon key={i} geometry={G.bigBox} color={trim} position={[0, F * (i + 1), 0.05]} scale={[w, 0.25, 0.3]} line={3} />
      ))}
      {/* upper floors: windows with sills and a few AC units / flower boxes */}
      {Array.from({ length: floors - 1 }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const x = (c - (cols - 1) / 2) * (w / cols);
          const y = F * (r + 1) + F * 0.5;
          const k = (r * 7 + c * 3 + litSeed) % 5;
          return (
            <group key={`${r}-${c}`} position={[x, y, 0.02]}>
              <Toon geometry={G.box} color={trim} scale={[SIZE.windowW + 0.3, SIZE.windowH + 0.3, 0.1]} line={3} />
              <Flat color={k === 0 ? P.lampGlow : P.buildingWindow} position={[0, 0, 0.06]} scale={[SIZE.windowW, SIZE.windowH, 1]} />
              <Flat color={trim} position={[0, 0, 0.07]} scale={[0.12, SIZE.windowH, 1]} />
              <Toon geometry={G.box} color={trim} position={[0, -SIZE.windowH / 2 - 0.2, 0.2]} scale={[SIZE.windowW + 0.6, 0.15, 0.45]} line={3} />
              {k === 1 && <Toon geometry={G.box} color={P.steel} position={[SIZE.windowW * 0.9, -1.2, 0.4]} scale={[1.2, 0.9, 0.8]} line={3} />}
              {k === 2 && (
                <group position={[0, -SIZE.windowH / 2 - 0.45, 0.4]}>
                  <Toon geometry={G.box} color={P.pot} scale={[SIZE.windowW, 0.4, 0.4]} line={3} />
                  {[-0.8, 0, 0.8].map((fx) => (
                    <Toon key={fx} geometry={G.sphere} color={fx ? P.red : P.yellow} position={[fx, 0.35, 0]} scale={0.25} line={3} />
                  ))}
                </group>
              )}
            </group>
          );
        }),
      )}
      {/* ground floor: shop window + door (door 2.2 m) */}
      <Toon geometry={G.box} color={shop} position={[-w / 4, SIZE.doorH / 2, 0.06]} scale={[SIZE.doorW, SIZE.doorH, 0.12]} line={4} />
      <Toon geometry={G.sphere} color={P.yellow} position={[-w / 4 + SIZE.doorW * 0.32, SIZE.doorH * 0.48, 0.15]} scale={0.1} line={2} />
      <Toon geometry={G.box} color={trim} position={[w / 8, 2.6, 0.05]} scale={[w / 2.4, 3.6, 0.12]} line={4} />
      <Flat color={P.buildingWindow} position={[w / 8, 2.6, 0.12]} scale={[w / 2.4 - 0.4, 3.2, 1]} />
      {awning && (
        <group position={[0, 5.4, 0.9]}>
          <Toon geometry={G.box} color={awning} rotation={[0.4, 0, 0]} scale={[w * 0.85, 0.12, 2.0]} line={4} />
          {Array.from({ length: 9 }).map((_, i) => (
            <Flat key={i} color={P.white} position={[(i - 4) * w * 0.095, -0.45, 0.95]} scale={[w * 0.045, 0.4, 1]} />
          ))}
        </group>
      )}
    </group>
  );
};

/** Helium balloon on a string that sags like a real string (Bezier, longer than the gap). */
export const Balloon: React.FC<{ from: V3; to: V3; color?: string; stringLen?: number }> = ({ from, to, color = P.red, stringLen }) => {
  const a = new THREE.Vector3(...from);
  const b = new THREE.Vector3(...to);
  const len = stringLen ?? a.distanceTo(b) * 1.05;
  const key = [...from, ...to].map((x) => x.toFixed(3)).join(',') + len.toFixed(3);
  const geom = useMemo(() => {
    const d = a.distanceTo(b);
    const sag = Math.sqrt(Math.max(0, (len / 2) ** 2 - (d / 2) ** 2));
    const mid = a.clone().add(b).multiplyScalar(0.5).add(new THREE.Vector3(0.6, -0.3, 0).normalize().multiplyScalar(sag));
    const ctrl = mid.clone().multiplyScalar(2).sub(a.clone().add(b).multiplyScalar(0.5));
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, ctrl, b), 24, 0.018, 6, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (
    <group>
      <mesh geometry={geom} material={flat(LINE.color)} />
      <group position={to}>
        <Toon geometry={G.sphere} color={color} position={[0, 0.62, 0]} scale={[0.5, 0.6, 0.5]} />
        <Toon geometry={G.cone} color={color} position={[0, 0.02, 0]} rotation={[Math.PI, 0, 0]} scale={[0.09, 0.12, 0.09]} line={3} />
        <Flat geometry={G.disc} color="#ffffff" opacity={0.7} position={[-0.18, 0.85, 0.45]} scale={[0.09, 0.14, 1]} />
      </group>
    </group>
  );
};

/** Balloon seller's cart with a bunch of balloons. */
export const BalloonCart: React.FC<At & { t: number; missing?: number }> = ({ t, missing = -1, ...at }) => {
  const cols = [P.red, P.yellow, P.teal, P.lilac, P.coral, P.green];
  return (
    <group {...at}>
      <Toon geometry={G.softBox} color={P.yellow} position={[0, 1.0, 0]} scale={[2.4, 1.2, 1.3]} line={4} />
      <Toon geometry={G.box} color={P.red} position={[0, 1.65, 0]} scale={[2.6, 0.12, 1.45]} line={4} />
      {[-0.9, 0.9].map((x) => (
        <group key={x} position={[x, 0.32, 0.66]} rotation={[Math.PI / 2, 0, 0]}>
          <Toon geometry={G.cyl} color="#2b2b30" scale={[0.32, 0.12, 0.32]} line={4} />
        </group>
      ))}
      {cols.map((c, i) => {
        if (i === missing) return null;
        const sway = Math.sin(t * 1.4 + i) * 0.25;
        return <Balloon key={i} from={[-0.5 + i * 0.2, 1.7, 0]} to={[-1.4 + i * 0.55 + sway, 4.4 + (i % 2) * 0.7, 0.1 * (i % 3)]} color={c} />;
      })}
    </group>
  );
};

/** Round fountain with animated water. */
export const Fountain: React.FC<At & { t: number }> = ({ t, ...at }) => (
  <group {...at}>
    <Toon geometry={G.cyl} color={P.sidewalk} position={[0, 0.4, 0]} scale={[3.2, 0.8, 3.2]} line={5} />
    <Flat geometry={G.disc} color="#7fc3e8" position={[0, 0.78, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={2.9} />
    {[0, 1, 2].map((i) => {
      const k = (t * 0.6 + i / 3) % 1;
      return <Flat key={i} geometry={G.thinRing} color="#ffffff" opacity={1 - k} position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={0.6 + k * 2.2} />;
    })}
    <Toon geometry={G.cyl} color={P.sidewalk} position={[0, 1.4, 0]} scale={[0.35, 1.6, 0.35]} line={4} />
    <Toon geometry={G.cyl} color={P.sidewalk} position={[0, 2.2, 0]} scale={[1.1, 0.25, 1.1]} line={4} />
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i / 8) * Math.PI * 2;
      const k = (t * 1.5 + i * 0.13) % 1;
      return (
        <Toon
          key={i}
          geometry={G.sphere}
          color="#bfe6fa"
          position={[Math.cos(a) * (0.8 + k * 1.2), 2.6 + 1.2 * Math.sin(k * Math.PI) - k * 1.6, Math.sin(a) * (0.8 + k * 1.2)]}
          scale={0.12}
          line={2}
        />
      );
    })}
    <Toon geometry={G.sphere} color="#bfe6fa" position={[0, 2.7 + Math.sin(t * 6) * 0.05, 0]} scale={[0.25, 0.4, 0.25]} line={3} />
  </group>
);
