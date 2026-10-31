import * as THREE from 'three';
import { G } from '../lib/geometry';
import { stoneTex, metalTex } from '../lib/tex';
import { Toon, type V3 } from '../lib/Toon';
import { Rat } from '../rig/Person';
import { Glow, Tx, box, brickTex, plane, waterTex } from './kit';

/**
 * Location 2 · The new sewer under Hanoi. A long brick vaulted tunnel along X:
 * water channel in the middle, stone walkways on both sides, pipes, drain grates,
 * a ladder up to the street manhole with a shaft of daylight, wall lanterns, rats.
 * The tunnel fades into dark-green fog at both ends (no void).
 */
const R = 10; // vault radius (walkway level ≈ 0, crown ≈ 10 above it)
const LEN = 800; // long enough that the ends are always lost in the dark fog
const vault = new THREE.CylinderGeometry(R, R, LEN, 40, 1, true, 0, Math.PI); // sin θ ≥ 0 → after rotateZ it is the upper half
vault.rotateZ(Math.PI / 2); // tunnel along X, half cylinder on top

const ribGeo = new THREE.TorusGeometry(R - 0.1, 0.35, 8, 40, Math.PI);

/** Dark side-branch opening in the wall (another tunnel going off into the dark). */
const Branch: React.FC<{ x: number; side: 1 | -1 }> = ({ x, side }) => (
  <group position={[x, 0.6, side * (R - 0.35)]} rotation={[0, side > 0 ? Math.PI : 0, 0]}>
    <Glow geometry={new THREE.CircleGeometry(3.2, 24, 0, Math.PI)} color="#070a08" position={[0, 0, 0.05]} />
    <Toon geometry={new THREE.TorusGeometry(3.3, 0.3, 8, 24, Math.PI)} color="#6e3a28" position={[0, 0, 0.1]} line={2} />
  </group>
);

const Pipe: React.FC<{ z: number; y: number; r?: number; color?: string }> = ({ z, y, r = 0.45, color = '#6b6f78' }) => (
  <group>
    <Tx geometry={G.cyl} map={metalTex(color)} position={[0, y, z]} rotation={[0, 0, Math.PI / 2]} scale={[r, LEN, r]} line={3} />
    {Array.from({ length: Math.floor(LEN / 10) }).map((_, i) => (
      <Toon key={i} geometry={G.cyl} color="#4f545e" position={[-LEN / 2 + 5 + i * 10, y, z]} rotation={[0, 0, Math.PI / 2]} scale={[r * 1.18, 0.35, r * 1.18]} line={2} />
    ))}
  </group>
);

const WallLantern: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 5.2, z]}>
    <Toon geometry={G.box} color="#2a2420" position={[0, 0.6, 0]} scale={[0.2, 0.2, 0.9]} line={2} />
    <Toon geometry={G.box} color="#2a2420" scale={[0.7, 0.9, 0.7]} line={3} />
    <Glow geometry={G.sphere} color="#ffd27a" scale={0.28} />
    <Glow geometry={G.sphere} color="#ffcf70" opacity={0.18} scale={1.6} />
  </group>
);

const Grate: React.FC<{ x: number; z: number; dir: 1 | -1 }> = ({ x, z, dir }) => (
  <group position={[x, 2.2, z]} rotation={[0, dir > 0 ? 0 : Math.PI, 0]}>
    <Tx geometry={box} map={brickTex('#6a3a2a', '#3e3028', [1, 1])} scale={[3.4, 3.2, 0.3]} line={3} />
    <Glow geometry={plane} color="#141614" position={[0, 0, 0.16]} scale={[2.6, 2.4, 1]} />
    {Array.from({ length: 7 }).map((_, i) => (
      <Toon key={i} geometry={G.cyl} color="#3a3d44" position={[-1.2 + i * 0.4, 0, 0.2]} scale={[0.07, 2.4, 0.07]} line={2} />
    ))}
    {/* trickle of water from the grate */}
    <Glow geometry={plane} color="#7fa08a" opacity={0.6} position={[0, -1.9, 0.5]} rotation={[-0.5, 0, 0]} scale={[1.2, 1.6, 1]} />
  </group>
);

export const SewerSet: React.FC = () => {
  const brick = brickTex('#8a4a34', '#5a4a3e', [40, 6]);
  const WALK = 5; // walkway width
  const CH = 7; // channel width
  return (
    <>
      {/* surrounding earth: no void if you fly out of the tunnel */}
      <group name="Земля вокруг">
        <Toon geometry={G.box} color="#3a2f26" position={[0, -6, 0]} scale={[700, 10, 700]} line={0} />
      </group>
      <group name="Свод тоннеля (кирпич)">
        <Tx geometry={vault} map={brick} position={[0, 0.6, 0]} line={0} side={THREE.DoubleSide} />
        {/* brick ribs every 12 units */}
        {Array.from({ length: Math.floor(LEN / 12) }).map((_, i) => (
          <Toon key={i} geometry={ribGeo} color="#6e3a28" position={[-LEN / 2 + 8 + i * 12, 0.6, 0]} rotation={[0, Math.PI / 2, 0]} line={2} />
        ))}
      </group>
      <group name="Канал с водой">
        <Tx geometry={plane} map={waterTex('#3e5a48', [30, 1])} position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[LEN, CH, 1]} line={0} />
        <Toon geometry={G.box} color="#2e3a30" position={[0, -2.2, 0]} scale={[LEN, 1.8, CH]} line={0} />
      </group>
      {[-1, 1].map((s) => (
        <group key={s} name={s < 0 ? 'Дорожка левая' : 'Дорожка правая'}>
          <Tx geometry={box} map={stoneTex('#8a8478', [60, 2], 32)} position={[0, 0.0, s * (CH / 2 + WALK / 2)]} scale={[LEN, 1.2, WALK]} line={0} />
          <Toon geometry={G.box} color="#6f6a60" position={[0, 0.62, s * (CH / 2 + 0.2)]} scale={[LEN, 0.25, 0.4]} line={2} />
          {/* walls under the vault spring line, down to the walkway */}
          <Tx geometry={box} map={brickTex('#8a4a34', '#5a4a3e', [40, 1])} position={[0, 1.5, s * (R - 0.2)]} scale={[LEN, 2, 0.4]} line={0} />
        </group>
      ))}
      <group name="Трубы">
        <Pipe z={-8.4} y={3.2} />
        <Pipe z={-8.6} y={4.4} r={0.3} color="#7a5a3a" />
        <Pipe z={8.4} y={3.6} r={0.55} />
      </group>
      {Array.from({ length: 16 }, (_, i) => -360 + i * 48 + 12).map((x, i) => (
        <group key={x} name={`Решётка стока ${i + 1}`}>
          <Grate x={x} z={(i % 2 ? 1 : -1) * (R - 0.6)} dir={i % 2 ? -1 : 1} />
        </group>
      ))}
      {Array.from({ length: 22 }, (_, i) => -378 + i * 36).map((x, i) => (
        <group key={x} name={`Настенный фонарь ${i + 1}`}>
          <WallLantern x={x} z={(i % 2 ? -1 : 1) * (R - 1.2)} />
        </group>
      ))}
      {Array.from({ length: 12 }, (_, i) => -330 + i * 60).map((x, i) => (
        <group key={x} name={`Боковой тоннель ${i + 1}`}>
          <Branch x={x} side={i % 2 ? 1 : -1} />
        </group>
      ))}
      <group name="Мох и подтёки">
        {Array.from({ length: 40 }).map((_, i) => (
          <Glow key={i} geometry={G.disc} color={i % 2 ? '#3f5a34' : '#2f4a2a'} opacity={0.55} position={[-380 + i * 19 + (i % 3) * 4, 1.6 + (i % 4) * 0.6, (i % 2 ? 1 : -1) * (R - 0.42)]} rotation={[0, i % 2 ? Math.PI : 0, 0]} scale={[1.6 + (i % 3) * 0.6, 0.7, 1]} />
        ))}
      </group>
      {/* ladder up to the street manhole + shaft of daylight */}
      <group name="Лестница к люку" position={[18, 0.6, -8.2]}>
        {[-0.7, 0.7].map((x) => (
          <Toon key={x} geometry={G.cyl} color="#4a4f58" position={[x, 7, 0]} scale={[0.09, 14, 0.09]} line={2} />
        ))}
        {Array.from({ length: 18 }).map((_, i) => (
          <Toon key={i} geometry={G.cyl} color="#4a4f58" position={[0, 0.6 + i * 0.75, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.06, 1.4, 0.06]} line={1} />
        ))}
      </group>
      {/* vertical brick shaft through the vault, the street manhole sits on top, slightly ajar */}
      <group name="Шахта люка" position={[18, 0, -6.6]}>
        <Tx geometry={new THREE.CylinderGeometry(1.6, 1.6, 8, 24, 1, true)} map={brickTex('#7a3e2c', '#4e3e32', [3, 2])} position={[0, 12, 0]} line={2} side={THREE.DoubleSide} />
        <Toon geometry={new THREE.TorusGeometry(1, 0.07, 8, 32)} color="#2f333c" position={[0, 15.9, 0]} rotation={[Math.PI / 2, 0, 0]} scale={1.65} line={2} />
        {/* cover pushed aside: a crescent of daylight */}
        <Glow geometry={G.disc} color="#fff6d8" position={[0, 15.95, 0]} rotation={[Math.PI / 2, 0, 0]} scale={1.55} />
        <Toon geometry={G.cyl} color="#3d414b" position={[0.7, 16.05, 0.2]} scale={[1.55, 0.12, 1.55]} line={3} />
      </group>
      <group name="Луч света из люка">
        <Glow geometry={new THREE.CylinderGeometry(1.4, 2.8, 15.4, 24, 1, true)} color="#fff4d0" opacity={0.15} position={[18, 8.3, -6.6]} />
        <Glow geometry={G.disc} color="#fff4d0" opacity={0.35} position={[18, 0.62, -6.4]} rotation={[-Math.PI / 2, 0, 0]} scale={2.4} />
      </group>
      {/* rats along the walkways */}
      {([[-90, 1, 2], [-62, -1, 0.8], [-30, -1, 0.4], [-8, 1, 2.6], [6, -1, -1.2], [26, 1, 1.4], [40, -1, 3], [70, 1, 0.2], [104, -1, 2.2]] as [number, number, number][]).map(([x, s, r], i) => (
        <group key={i} name={`Крыса ${i + 1}`} position={[x, 0.6, s * (CH / 2 + 1.5)] as V3} rotation={[0, r, 0]}>
          <Rat pose={{ tail: i % 3 !== 1, face: i % 2 ? 'sly' : 'happy' }} scale={1.1} />
        </group>
      ))}
    </>
  );
};
