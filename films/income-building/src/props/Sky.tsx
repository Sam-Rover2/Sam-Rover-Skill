import { G } from '../lib/geometry';
import { Flat, type V3 } from '../lib/Toon';

/** Far painted sky: horizontal colour bands + optional sun disc. */
export const SkyBackdrop: React.FC<{ colors: readonly string[]; z?: number; w?: number; h?: number; y?: number; sun?: { pos: [number, number]; r: number; color: string } }> = ({
  colors,
  z = -60,
  w = 260,
  h = 90,
  y = 30,
  sun,
}) => {
  const band = h / colors.length;
  return (
    <group position={[0, y, z]}>
      {colors.map((c, i) => (
        <Flat key={i} color={c} position={[0, h / 2 - band * (i + 0.5), 0]} scale={[w, band + 0.05, 1]} />
      ))}
      {sun && (
        <>
          <Flat geometry={G.disc} color={sun.color} opacity={0.35} position={[sun.pos[0], sun.pos[1] - y, 0.1]} scale={sun.r * 1.6} />
          <Flat geometry={G.disc} color={sun.color} position={[sun.pos[0], sun.pos[1] - y, 0.2]} scale={sun.r} />
        </>
      )}
    </group>
  );
};

/** A tiny "v" bird made of two arcs, flapping. */
export const Bird: React.FC<{ position: V3; flap: number }> = ({ position, flap }) => (
  <group position={position}>
    {[-1, 1].map((s) => (
      <Flat key={s} color="#3b3340" position={[s * 0.18, 0, 0]} rotation={[0, 0, s * (0.35 + 0.4 * Math.sin(flap))]} scale={[0.4, 0.06, 1]} />
    ))}
  </group>
);
