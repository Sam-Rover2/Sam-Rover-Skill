import { hash } from '../lib/anim';
import { G } from '../lib/geometry';
import { P } from '../lib/style';
import { Flat, Toon, type V3 } from '../lib/Toon';

/** Ground for a real-scale street along X: sidewalk (z −6…5), curb, road (z 5…17). */
export const StreetGround: React.FC = () => (
  <group>
    <Flat color={P.sidewalk} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]} scale={[400, 12, 1]} />
    {Array.from({ length: 60 }).map((_, i) => (
      <Flat key={i} color="#b9b5ab" rotation={[-Math.PI / 2, 0, 0]} position={[-120 + i * 4, 0.004, -1]} scale={[0.06, 12, 1]} />
    ))}
    <Toon geometry={G.box} color="#d9d5cc" position={[0, 0.1, 5.1]} scale={[400, 0.2, 0.35]} line={3} />
    <Flat color={P.asphalt} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 11]} scale={[400, 12, 1]} />
    {Array.from({ length: 50 }).map((_, i) => (
      <Flat key={i} color={P.white} rotation={[-Math.PI / 2, 0, 0]} position={[-120 + i * 5, 0.005, 11]} scale={[2.4, 0.2, 1]} />
    ))}
  </group>
);

/** Gust of wind: leaves and paper scraps flying across the frame. */
export const Gust: React.FC<{ t: number; t0: number; y?: number; z?: number }> = ({ t, t0, y = 1.5, z = 2 }) => {
  if (t < t0 || t > t0 + 2.5) return null;
  const k = t - t0;
  return (
    <>
      {Array.from({ length: 14 }).map((_, i) => (
        <Flat
          key={i}
          geometry={i % 3 ? G.disc : G.plane}
          color={[P.leafOrange, P.white, P.leafYellow][i % 3]}
          position={[-14 + k * (14 + hash(i) * 8) + hash(i + 1) * 4, y + hash(i + 2) * 3 + Math.sin(k * 6 + i) * 0.4, z + hash(i + 3) * 3]}
          rotation={[k * 8 + i, k * 6, k * 4]}
          scale={[0.18, 0.12, 1]}
        />
      ))}
    </>
  );
};

/** Free-floating balloon: string hangs below and sways. Returns [from, to]. */
export function freeBalloon(top: V3, t: number): [V3, V3] {
  return [[top[0] - 0.3 + Math.sin(t * 2) * 0.25, top[1] - 2.3, top[2]], top];
}
export const offset = (p: V3, d: V3): V3 => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
