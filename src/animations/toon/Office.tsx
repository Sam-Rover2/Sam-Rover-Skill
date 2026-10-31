import { Toon } from './Toon';
import { G } from './geometry';
import { flat } from './materials';
import { LINE, PALETTE } from './style';

const BG = LINE.bgWidth;

/** City skyline seen through the window: flat shapes, no shading (like a painted backdrop). */
const Skyline: React.FC = () => {
  const towers = [
    [-1.3, 1.6, 0.55], [-0.6, 2.2, 0.6], [0.15, 1.4, 0.5], [0.8, 2.6, 0.55], [1.45, 1.8, 0.5],
  ];
  return (
    <group>
      <mesh geometry={G.plane} material={flat(PALETTE.skyBottom)} scale={[3.6, 2.6, 1]} />
      <mesh geometry={G.plane} material={flat(PALETTE.skyTop)} position={[0, 0.65, 0.001]} scale={[3.6, 1.3, 1]} />
      {towers.map(([x, h, w], i) => (
        <group key={i} position={[x, -1.3 + h / 2, 0.01]}>
          <mesh geometry={G.plane} material={flat(PALETTE.building)} scale={[w, h, 1]} />
          {Array.from({ length: Math.floor(h / 0.25) }).map((_, r) =>
            [-1, 1].map((c) => (
              <mesh
                key={`${r}${c}`}
                geometry={G.plane}
                material={flat(PALETTE.buildingWindow)}
                position={[c * w * 0.2, h / 2 - 0.18 - r * 0.25, 0.002]}
                scale={[w * 0.18, 0.1, 1]}
              />
            )),
          )}
        </group>
      ))}
    </group>
  );
};

export const Office: React.FC = () => (
  <group>
    {/* floor with plank lines */}
    <mesh geometry={G.plane} material={flat(PALETTE.floorWood)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]} scale={[30, 14, 1]} />
    {Array.from({ length: 9 }).map((_, i) => (
      <mesh
        key={i}
        geometry={G.plane}
        material={flat(PALETTE.floorLine)}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.002, -2.6 + i * 1.1]}
        scale={[30, 0.03, 1]}
      />
    ))}

    {/* back wall + side wall (darker = turned away from the light) */}
    <mesh geometry={G.plane} material={flat(PALETTE.wallYellow)} position={[0, 4, -3]} scale={[30, 8, 1]} />
    <mesh geometry={G.plane} material={flat(PALETTE.wallYellowShade)} position={[-6.5, 4, 1]} rotation={[0, Math.PI / 2.6, 0]} scale={[10, 8, 1]} />
    {/* corner line + red trim + baseboard */}
    <Toon geometry={G.box} color={LINE.color} position={[-5.72, 4, -2.98]} scale={[0.05, 8, 0.05]} line={0} />
    <Toon geometry={G.box} color={PALETTE.trimRed} position={[0, 1.55, -2.95]} scale={[23, 0.12, 0.06]} line={0} />
    <Toon geometry={G.box} color={PALETTE.wallYellowShade} position={[0, 0.12, -2.92]} scale={[23, 0.24, 0.1]} line={BG} />

    {/* window */}
    <group position={[2.6, 4.1, -2.95]}>
      <Toon geometry={G.box} color="#f4f4f4" scale={[3.9, 2.9, 0.12]} line={BG} />
      <group position={[0, 0, 0.07]}>
        <Skyline />
      </group>
      <Toon geometry={G.box} color="#f4f4f4" position={[0, 0, 0.1]} scale={[0.1, 2.7, 0.06]} line={BG} />
      <Toon geometry={G.box} color="#f4f4f4" position={[0, -1.55, 0.2]} scale={[4.2, 0.18, 0.4]} line={BG} />
    </group>

    {/* desk with a monitor showing a bar chart */}
    <group position={[-3.6, 0, -1.6]}>
      <Toon geometry={G.box} color={PALETTE.desk} position={[0, 0.7, 0]} scale={[2.6, 1.4, 1.1]} line={BG} />
      <Toon geometry={G.box} color={PALETTE.deskTop} position={[0, 1.44, 0.05]} scale={[2.8, 0.1, 1.25]} line={BG} />
      <Toon geometry={G.box} color={PALETTE.monitor} position={[0.2, 2.25, -0.1]} scale={[1.3, 0.85, 0.08]} line={BG} />
      <Toon geometry={G.box} color={PALETTE.monitor} position={[0.2, 1.65, -0.1]} scale={[0.1, 0.4, 0.1]} line={BG} />
      <group position={[0.2, 2.25, -0.05]}>
        <mesh geometry={G.plane} material={flat(PALETTE.screen)} scale={[1.15, 0.7, 1]} />
        {PALETTE.bars.map((c, i) => {
          const h = [0.3, 0.5, 0.38, 0.58][i];
          return (
            <mesh key={c} geometry={G.plane} material={flat(c)} position={[-0.36 + i * 0.24, -0.3 + h / 2, 0.003]} scale={[0.14, h, 1]} />
          );
        })}
      </group>
    </group>

    {/* plant */}
    <group position={[5.2, 0, -2.0]}>
      <Toon geometry={G.pot} color={PALETTE.pot} position={[0, 0.35, 0]} scale={[0.4, 0.7, 0.4]} line={BG} />
      {[[-0.2, 1.05, 0.35], [0.22, 1.2, -0.3], [0, 1.45, 0]].map(([x, y, r], i) => (
        <Toon key={i} geometry={G.sphere} color={PALETTE.plant} position={[x, y, 0]} rotation={[0, 0, r]} scale={[0.3, 0.5, 0.3]} line={BG} />
      ))}
    </group>
  </group>
);
