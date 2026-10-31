import * as THREE from 'three';
import { G } from '../lib/geometry';
import { dirtTex, woodTex } from '../lib/tex';
import { Toon, type V3 } from '../lib/Toon';
import { Limb } from '../rig/Limb';
import { Rat } from '../rig/Person';
import { OBJECTS } from '../objects';
import { SkyBackdrop } from '../props/Sky';
import { Glow, Tx, box, plane, thatchTex, waterTex } from './kit';

/**
 * Location 5 · Rat farm on the edge of town (sunset). A bamboo shed with a thatched roof
 * over racks of cages, sacks and buckets, a bamboo fence, palms, rice paddies and hills.
 */
/** Thin ring for fence rails (tube 0.6 % of radius → ≈0.15 units after scaling; NOT a fat torus). */
const railGeo = new THREE.TorusGeometry(1, 0.006, 6, 120);
const obj = (id: string) => OBJECTS.find((o) => o.id === id)!.C;

/** Bamboo pole: green segmented cylinder. */
const Bamboo: React.FC<{ a: V3; h: number; r?: number }> = ({ a, h, r = 0.18 }) => (
  <group position={a}>
    <Toon geometry={G.cyl} color="#9ab05a" position={[0, h / 2, 0]} scale={[r, h, r]} line={2} />
    {Array.from({ length: Math.floor(h / 1.2) }).map((_, i) => (
      <Toon key={i} geometry={G.cyl} color="#6e8a3a" position={[0, 1.2 * (i + 1), 0]} scale={[r * 1.15, 0.08, r * 1.15]} line={1} />
    ))}
  </group>
);

const Palm: React.FC<{ x: number; z: number; h?: number }> = ({ x, z, h = 13 }) => (
  <group position={[x, 0, z]}>
    <Limb root={[0, 0, 0]} tip={[1.2, h, 0.4]} length={h * 1.04} bendDir={[1, 0, 0]} radius={0.35} color="#8a6a44" />
    {Array.from({ length: 7 }).map((_, i) => {
      const a = (i / 7) * Math.PI * 2;
      return (
        <Limb key={i} root={[1.2, h, 0.4]} tip={[1.2 + Math.cos(a) * 4.5, h - 2.2, 0.4 + Math.sin(a) * 4.5]} length={5.6} bendDir={[0, 1, 0]} radius={0.28} color={i % 2 ? '#4f8a3a' : '#5fa04a'} />
      );
    })}
  </group>
);

const Paddy: React.FC<{ x: number; z: number; w: number; d: number }> = ({ x, z, w, d }) => (
  <group position={[x, 0, z]}>
    <Toon geometry={G.box} color="#6e8a4a" position={[0, 0.15, 0]} scale={[w + 0.8, 0.3, d + 0.8]} line={2} />
    <Tx geometry={plane} map={waterTex('#7aa0a8', [4, 2])} position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[w, d, 1]} line={0} />
    {Array.from({ length: Math.floor(w / 1.4) }).map((_, i) =>
      Array.from({ length: Math.floor(d / 1.4) }).map((__, k) => (
        <Toon key={`${i}${k}`} geometry={G.cone} color="#7cc04a" position={[-w / 2 + 0.7 + i * 1.4, 0.7, -d / 2 + 0.7 + k * 1.4]} scale={[0.16, 0.8, 0.16]} line={0} />
      )),
    )}
  </group>
);

export const FarmSet: React.FC = () => {
  const Farm = obj('farm');
  const Rice = obj('rice');
  const Bucket = obj('bucket');
  const Sack = obj('sack');
  const SW = 22; // shed width
  const SD = 14; // shed depth
  const roofH = 9.5;
  const roof = (() => {
    const shape = new THREE.Shape([new THREE.Vector2(-SD / 2 - 1.5, 0), new THREE.Vector2(SD / 2 + 1.5, 0), new THREE.Vector2(0, 4.5)]);
    const g = new THREE.ExtrudeGeometry(shape, { depth: SW + 2, bevelEnabled: false });
    g.rotateY(Math.PI / 2);
    g.translate(-(SW + 2) / 2, roofH, 0);
    return g;
  })();
  return (
    <>
      <SkyBackdrop colors={['#6a5a9a', '#c0729a', '#f3a06a', '#ffd08a']} y={40} h={150} sun={{ pos: [-20, 14], r: 6, color: '#ffe6a0' }} />
      <group name="Земля вокруг">
        <Toon geometry={G.box} color="#8aa65a" position={[0, -0.5, 0]} scale={[700, 1, 700]} line={0} />
      </group>
      <group name="Двор (утоптанная земля)">
        <Tx geometry={plane} map={dirtTex([6, 4])} position={[0, 0.01, 2]} rotation={[-Math.PI / 2, 0, 0]} scale={[46, 34, 1]} line={0} />
      </group>
      <group name="Холмы вдали">
        {[[-80, -110, 30], [-20, -130, 40], [50, -115, 34], [110, -125, 38]].map(([x, z, r], i) => (
          <Toon key={i} geometry={G.sphere} color={i % 2 ? '#6e8a5a' : '#7e9a62'} position={[x, -r * 0.55, z]} scale={[r * 1.6, r, r]} line={3} />
        ))}
      </group>
      <group name="Рисовые поля">
        {[[-40, -40], [-14, -44], [14, -40], [40, -44], [-40, 32], [40, 30]].map(([x, z], i) => (
          <Paddy key={i} x={x} z={z} w={20} d={14} />
        ))}
      </group>
      {[[-30, -18], [-36, 14], [30, -20], [34, 16], [8, -30]].map(([x, z], i) => (
        <group key={i} name={`Пальма ${i + 1}`}>
          <Palm x={x} z={z} h={12 + (i % 3) * 2} />
        </group>
      ))}
      {/* the shed */}
      <group name="Навес (бамбук, солома)" position={[0, 0, -4]}>
        {[-1, 1].map((sx) =>
          [-1, 0, 1].map((k) => <Bamboo key={`${sx}${k}`} a={[k * (SW / 2 - 0.4), 0, (sx * SD) / 2]} h={roofH + 0.2} r={0.24} />),
        )}
        <Tx geometry={roof} map={thatchTex([6, 2])} line={4} />
        <Toon geometry={G.box} color="#7a5a32" position={[0, roofH - 0.1, 0]} scale={[SW + 1, 0.3, SD + 1]} line={2} />
      </group>
      {[-6.5, 0, 6.5].map((x, i) => (
        <group key={x} name={`Стеллаж с клетками ${i + 1}`} position={[x, 0, -8]}>
          <Farm />
        </group>
      ))}
      <group name="Мешки риса">
        <group position={[-8.5, 0, 1]}>
          <Rice />
        </group>
        <group position={[-6.6, 0, 1.6]} rotation={[0, 0.5, 0]}>
          <Rice />
        </group>
      </group>
      <group name="Ведро хвостов" position={[7.5, 0, 1.2]}>
        <Bucket />
      </group>
      <group name="Мешок хвостов" position={[9.6, 0, 0.2]}>
        <Sack />
      </group>
      <group name="Кормушка" position={[0, 0, 2.5]}>
        <Tx geometry={box} map={woodTex('#8e5d33', '#5a3a1e', 3)} position={[0, 0.6, 0]} scale={[6, 1.2, 1.4]} line={3} />
        <Toon geometry={G.box} color="#e8dcb0" position={[0, 1.22, 0]} scale={[5.6, 0.06, 1.1]} line={0} />
        {[-2, -0.6, 0.8, 2.2].map((x, i) => (
          <group key={x} position={[x, 0, 1.4]} rotation={[0, Math.PI + (i % 2 ? 0.3 : -0.2), 0]}>
            <Rat pose={{ tail: i % 2 === 0, face: 'happy' }} scale={1} />
          </group>
        ))}
      </group>
      <group name="Бамбуковый забор">
        {Array.from({ length: 30 }).map((_, i) => {
          const a = (i / 30) * Math.PI * 2;
          return <Bamboo key={i} a={[Math.cos(a) * 26, 0, Math.sin(a) * 20 + 2]} h={3.2} r={0.14} />;
        })}
        {[1.2, 2.6].map((y) => (
          <Toon key={y} geometry={railGeo} color="#9ab05a" position={[0, y, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[26, 20, 20]} line={0} />
        ))}
      </group>
      <group name="Тёплый фонарь под навесом">
        <Glow geometry={G.sphere} color="#ffcf70" position={[0, roofH - 1.2, -4]} scale={0.35} />
        <Glow geometry={G.sphere} color="#ffcf70" opacity={0.15} position={[0, roofH - 1.2, -4]} scale={2.5} />
      </group>
    </>
  );
};
