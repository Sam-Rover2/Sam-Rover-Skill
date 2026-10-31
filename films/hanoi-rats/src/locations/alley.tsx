import { G } from '../lib/geometry';
import { plasterTex, stoneTex, woodTex } from '../lib/tex';
import { Toon } from '../lib/Toon';
import { Limb } from '../rig/Limb';
import { Rat } from '../rig/Person';
import { OBJECTS } from '../objects';
import { SkyBackdrop } from '../props/Sky';
import { Glow, Tx, box, plane } from './kit';

/**
 * Location 4 · Night alley with the manhole. An alley along X between two tall old walls
 * (z = ±6), laundry and wires overhead, a warm lantern, a back door with light,
 * crates, barrels, puddles, a few rats. Night: moon, deep blue sky.
 */
const AW = 6; // half width of the alley
const LEN = 90;
const obj = (id: string) => OBJECTS.find((o) => o.id === id)!.C;

const Barrel: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <Tx geometry={G.cyl} map={woodTex('#7a5028', '#4a2a18', 10)} position={[0, 1.2, 0]} scale={[0.9, 2.4, 0.9]} line={3} />
    {[0.4, 2.0].map((y) => (
      <Toon key={y} geometry={G.cyl} color="#3a3d44" position={[0, y, 0]} scale={[0.93, 0.12, 0.93]} line={1} />
    ))}
  </group>
);

const Laundry: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <group>
    <Limb root={[x, y, -AW]} tip={[x + 1, y, AW]} length={AW * 2.1} bendDir={[0, -1, 0]} radius={0.025} color="#d8d2c4" />
    {[-3.5, -1.2, 1.4, 3.6].map((z, i) => {
      const sag = (1 - (z / AW) ** 2) * AW * 0.3;
      return (
        <Toon key={z} geometry={G.box} color={['#c8302c', '#e8e2d0', '#3f6f9e', '#e8b44a'][i]} position={[x + 0.5 + z / 12, y - sag - 0.8, z]} rotation={[0, 0.1, 0.05 * i]} scale={[0.06, 1.5 + (i % 2) * 0.5, 1.3]} line={2} />
      );
    })}
  </group>
);

export const AlleySet: React.FC = () => {
  const Manhole = obj('manhole');
  const Crate = obj('crate');
  const Trap = obj('trap');
  const Lantern = obj('lantern');
  const wallL = plasterTex('#7a6a58', [10, 2]);
  const wallR = plasterTex('#6e6252', [10, 2]);
  return (
    <>
      <SkyBackdrop colors={['#0e1430', '#1a2450', '#2a3668']} y={40} h={150} sun={{ pos: [10, 36], r: 4, color: '#f3efd8' }} />
      <group name="Земля вокруг">
        <Toon geometry={G.box} color="#2a2a30" position={[0, -0.6, 0]} scale={[700, 1, 700]} line={0} />
      </group>
      <group name="Мостовая">
        <Tx geometry={plane} map={stoneTex('#5c5a60', [30, 4], 24)} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[LEN, AW * 2, 1]} line={0} />
        {/* puddles reflecting the moonlight */}
        {[[-12, 2], [6, -2.5], [22, 1.6]].map(([x, z], i) => (
          <Glow key={i} geometry={G.disc} color="#3e4a78" opacity={0.45} position={[x, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.2, 1.2, 1]} />
        ))}
      </group>
      {[-1, 1].map((s) => (
        <group key={s} name={s < 0 ? 'Стена левая' : 'Стена правая'}>
          <Tx geometry={box} map={s < 0 ? wallL : wallR} position={[0, 11, s * (AW + 2)]} scale={[LEN, 22, 4]} line={4} />
          {/* shuttered windows, some lit */}
          {Array.from({ length: 8 }).map((_, i) =>
            [9, 16].map((y, k) => {
              const lit = (i + k) % 3 === 0;
              return (
                <group key={`${i}${y}`} position={[-LEN / 2 + 8 + i * 10.5, y, s * (AW - 0.02)]} rotation={[0, s < 0 ? 0 : Math.PI, 0]}>
                  <Toon geometry={G.box} color="#4a3a2e" scale={[2, 3, 0.2]} line={2} />
                  <Glow geometry={plane} color={lit ? '#ffcf70' : '#1a1c26'} position={[0, 0, 0.12]} scale={[1.6, 2.6, 1]} />
                </group>
              );
            }),
          )}
        </group>
      ))}
      <group name="Дверь со светом" position={[-10, 0, -AW + 0.05]}>
        <Toon geometry={G.box} color="#3a2a20" position={[0, 2.8, 0]} scale={[3, 5.6, 0.2]} line={3} />
        <Glow geometry={plane} color="#ffcf70" position={[0.4, 2.7, 0.12]} scale={[1.6, 5.2, 1]} />
        <Glow geometry={plane} color="#ffcf70" opacity={0.25} position={[0.6, 0.03, 2.6]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.2, 5, 1]} />
      </group>
      <group name="Люк">
        <group position={[2, 0.02, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <Manhole />
        </group>
      </group>
      <group name="Ловушка с крысой" position={[5.5, 0, 3.2]} rotation={[0, -0.6, 0]}>
        <Trap />
      </group>
      <group name="Ящик" position={[-20, 0, AW - 1.6]} rotation={[0, 0.3, 0]}>
        <Crate />
      </group>
      <group name="Бочки">
        <Barrel x={-17} z={AW - 1.2} />
        <Barrel x={-15.2} z={AW - 1.6} />
        <Barrel x={16} z={-AW + 1.2} />
      </group>
      <group name="Фонарь" position={[12, 0, AW - 1.2]} rotation={[0, Math.PI, 0]}>
        <Lantern />
      </group>
      <group name="Бельё и провода">
        <Laundry x={-24} y={13} />
        <Laundry x={-2} y={14.5} />
        <Laundry x={20} y={12.5} />
        {[17, 18.4].map((y) => (
          <Limb key={y} root={[-LEN / 2, y, -AW]} tip={[LEN / 2, y, AW]} length={LEN * 1.03} bendDir={[0, -1, 0]} radius={0.03} />
        ))}
      </group>
      {[[-6, -3.6, 0.8], [9, 4.2, -2.2], [-28, 2.8, 1.6]].map(([x, z, r], i) => (
        <group key={i} name={`Крыса ${i + 1}`} position={[x, 0, z]} rotation={[0, r, 0]}>
          <Rat pose={{ tail: i !== 1, face: i ? 'sly' : 'scared' }} scale={1.1} />
        </group>
      ))}
    </>
  );
};
