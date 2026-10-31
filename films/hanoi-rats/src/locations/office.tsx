import { G } from '../lib/geometry';
import { BODY } from '../lib/style';
import { labelTex, plasterTex, woodTex } from '../lib/tex';
import { Toon } from '../lib/Toon';
import { Limb } from '../rig/Limb';
import { OBJECTS } from '../objects';
import { Glow, Tx, box, plane, plankTex } from './kit';

/**
 * Location 3 · Bounty office of the colonial administration (day). Room 40 × 26, height 13.
 * Back wall at z = −13, the front (camera side) is open. Desk at the back centre.
 */
const W = 40;
const D = 26;
const H = 13;
const obj = (id: string) => OBJECTS.find((o) => o.id === id)!.C;

const TallWindow: React.FC<{ x: number }> = ({ x }) => (
  <group position={[x, 0, -D / 2 + 0.25]}>
    <Toon geometry={G.box} color="#f1e6c8" position={[0, 6.4, 0]} scale={[3.4, 7.2, 0.3]} line={3} />
    <Glow geometry={plane} color="#dff0fb" position={[0, 6.4, 0.17]} scale={[2.8, 6.6, 1]} />
    {[-0.7, 0.7].map((xx) => (
      <Toon key={xx} geometry={G.box} color="#f1e6c8" position={[xx, 6.4, 0.2]} scale={[0.1, 6.6, 0.06]} line={1} />
    ))}
    {[4.3, 6.4, 8.5].map((y) => (
      <Toon key={y} geometry={G.box} color="#f1e6c8" position={[0, y, 0.2]} scale={[2.8, 0.08, 0.06]} line={1} />
    ))}
    {/* open green shutters */}
    {[-1, 1].map((s) => (
      <group key={s} position={[s * 1.7, 6.4, 0.25]} rotation={[0, s * 1.2, 0]}>
        <Toon geometry={G.box} color="#3f7a5a" position={[s * 0.75, 0, 0]} scale={[1.5, 6.8, 0.08]} line={2} />
      </group>
    ))}
    {/* sun beam falling into the room */}
    <Glow geometry={plane} color="#fff1c4" opacity={0.13} position={[0.8, 3.4, 6]} rotation={[-1.05, 0, 0.12]} scale={[3, 14, 1]} />
    <Glow geometry={plane} color="#fff1c4" opacity={0.22} position={[1.4, 0.02, 10.5]} rotation={[-Math.PI / 2, 0, 0]} scale={[3.2, 6, 1]} />
  </group>
);

const CeilingFan: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, H, z]}>
    <Toon geometry={G.cyl} color="#3a2a20" position={[0, -1, 0]} scale={[0.08, 2, 0.08]} line={2} />
    <Toon geometry={G.cyl} color="#c9a24a" position={[0, -2.1, 0]} scale={[0.4, 0.4, 0.4]} line={2} />
    {[0, 1, 2, 3].map((i) => (
      <Tx key={i} geometry={box} map={woodTex('#8e5d33', '#5a3a1e', 4)} position={[Math.cos((i * Math.PI) / 2) * 1.6, -2.2, Math.sin((i * Math.PI) / 2) * 1.6]} rotation={[0, -(i * Math.PI) / 2, 0.08]} scale={[2.6, 0.06, 0.6]} line={2} />
    ))}
  </group>
);

const Stanchion: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <Toon geometry={G.cyl} color="#c9a24a" position={[0, 0.08, 0]} scale={[0.45, 0.16, 0.45]} line={2} />
    <Toon geometry={G.cyl} color="#c9a24a" position={[0, 1.6, 0]} scale={[0.08, 3.2, 0.08]} line={2} />
    <Toon geometry={G.sphere} color="#c9a24a" position={[0, 3.25, 0]} scale={0.16} line={2} />
  </group>
);

/** poster=false: the film animates its own poster (torn down in part 3). */
export const OfficeSet: React.FC<{ poster?: boolean }> = ({ poster = true }) => {
  const Desk = obj('desk');
  const Poster = obj('poster');
  const Sack = obj('sack');
  const Bucket = obj('bucket');
  const Crate = obj('crate');
  const Pile = obj('pile');
  const Coins = obj('coins');
  const wall = plasterTex('#efe2c0', [5, 2]);
  const panel = woodTex('#7a4a2a', '#4a2a18', 3);
  const ropeY = 2.9;
  return (
    <>
      <group name="Земля вокруг">
        <Toon geometry={G.box} color="#cdbb98" position={[0, -0.6, 0]} scale={[700, 1, 700]} line={0} />
      </group>
      <group name="Пол (доски)">
        <Tx geometry={plane} map={plankTex('#a06c40', [6, 4])} position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[W, D, 1]} line={0} />
      </group>
      <group name="Стены">
        <Tx geometry={box} map={wall} position={[0, H / 2, -D / 2]} scale={[W, H, 0.5]} line={3} />
        {[-1, 1].map((s) => (
          <Tx key={s} geometry={box} map={wall} position={[s * (W / 2), H / 2, 0]} scale={[0.5, H, D]} line={3} />
        ))}
        {/* wooden wainscot + rail around the walls */}
        <Tx geometry={box} map={panel} position={[0, 1.5, -D / 2 + 0.3]} scale={[W, 3, 0.15]} line={2} />
        {[-1, 1].map((s) => (
          <Tx key={s} geometry={box} map={panel} position={[s * (W / 2 - 0.3), 1.5, 0]} scale={[0.15, 3, D]} line={2} />
        ))}
        <Toon geometry={G.box} color="#5a3a1e" position={[0, 3.05, -D / 2 + 0.35]} scale={[W, 0.2, 0.25]} line={2} />
        <Toon geometry={G.box} color="#f6edd6" position={[0, H - 0.3, -D / 2 + 0.35]} scale={[W, 0.6, 0.4]} line={2} />
      </group>
      <group name="Потолок">
        <Tx geometry={box} map={plasterTex('#f6edd6', [4, 3])} position={[0, H + 0.25, 0]} scale={[W, 0.5, D]} line={0} />
      </group>
      {[-13, 13].map((x, i) => (
        <group key={x} name={`Окно ${i + 1}`}>
          <TallWindow x={x} />
        </group>
      ))}
      <group name="Вентилятор">
        <CeilingFan x={0} z={4} />
      </group>
      <group name="Стол чиновника" position={[0, 0, -7]}>
        <Desk />
      </group>
      {poster && (
        <group name="Плакат о награде" position={[-6.5, 0, -11]} rotation={[0, 0.15, 0]}>
          <Poster />
        </group>
      )}
      <group name="Карта Индокитая">
        <Tx geometry={box} map={labelTex('map', [{ text: 'INDOCHINE', size: 80 }, { text: 'FRANÇAISE', size: 60 }, { text: '— 1902 —', size: 40, font: 'italic 600' }], '#e9d9aa', '#3a5a3a')} position={[0, 8.2, -D / 2 + 0.35]} scale={[6, 4, 0.1]} line={3} />
      </group>
      <group name="Флаг Франции" position={[5.6, 0, -11.5]}>
        <Toon geometry={G.cyl} color="#5a3a1e" position={[0, 4, 0]} scale={[0.07, 8, 0.07]} line={2} />
        {['#2a4a9e', '#f4f1ea', '#c8302c'].map((c, i) => (
          <Toon key={c} geometry={G.box} color={c} position={[0.45 + i * 0.9, 6.9, 0]} scale={[0.9, 1.9, 0.04]} line={i === 1 ? 0 : 2} />
        ))}
      </group>
      <group name="Часы" position={[0, 11.2, -D / 2 + 0.4]}>
        <Toon geometry={G.cyl} color="#f6efdc" rotation={[Math.PI / 2, 0, 0]} scale={[0.9, 0.15, 0.9]} line={3} />
        <Toon geometry={G.torus} color="#5a3a1e" rotation={[0, 0, 0]} scale={[0.92, 0.92, 0.3]} line={1} />
        <Toon geometry={G.box} color="#1b1b1f" position={[0.2, 0.2, 0.1]} rotation={[0, 0, -0.8]} scale={[0.06, 0.6, 0.04]} line={0} />
        <Toon geometry={G.box} color="#1b1b1f" position={[0, 0.3, 0.1]} scale={[0.06, 0.7, 0.04]} line={0} />
      </group>
      {[-1, 1].map((s) => (
        <group key={s} name={`Шкаф с картотекой ${s < 0 ? 1 : 2}`} position={[s * (W / 2 - 1.6), 0, -6]}>
          <Tx geometry={box} map={woodTex('#6e4224', '#4a2a18', 4)} position={[0, 3, 0]} scale={[2.4, 6, 2.2]} line={3} />
          {Array.from({ length: 4 }).map((_, i) => (
            <group key={i}>
              <Toon geometry={G.box} color="#8a5a32" position={[-s * 1.21, 0.9 + i * 1.4, 0]} scale={[0.05, 1.1, 1.8]} line={2} />
              <Toon geometry={G.sphere} color="#c9a24a" position={[-s * 1.28, 0.9 + i * 1.4, 0]} scale={0.08} line={1} />
            </group>
          ))}
        </group>
      ))}
      {/* queue: posts + rope, a bench along the side */}
      <group name="Ограждение очереди">
        {[-8, -4, 0, 4, 8].map((x) => (
          <Stanchion key={x} x={x} z={1} />
        ))}
        {[-8, -4, 0, 4].map((x) => (
          <Limb key={x} root={[x, ropeY + 0.2, 1]} tip={[x + 4, ropeY + 0.2, 1]} length={4.3} bendDir={[0, -1, 0]} radius={0.06} color="#9a2a24" />
        ))}
      </group>
      <group name="Скамья для очереди" position={[-14, 0, 5]} rotation={[0, Math.PI / 2, 0]}>
        <Tx geometry={box} map={woodTex('#8e5d33', '#5a3a1e', 3)} position={[0, BODY.hip * 0.6, 0]} scale={[6, 0.25, 1.4]} line={3} />
        {[-2.6, 2.6].map((x) => (
          <Toon key={x} geometry={G.box} color="#5a3a1e" position={[x, BODY.hip * 0.3, 0]} scale={[0.25, BODY.hip * 0.6, 1.2]} line={2} />
        ))}
      </group>
      {/* tails everywhere near the desk */}
      <group name="Мешок хвостов у стола" position={[-4.2, 0, -5.4]}>
        <Sack />
      </group>
      <group name="Ведро хвостов у стола" position={[4.4, 0, -5.2]}>
        <Bucket />
      </group>
      <group name="Ящик хвостов" position={[11, 0, -10]} rotation={[0, -0.3, 0]}>
        <Crate />
      </group>
      <group name="Гора хвостов" position={[9.5, 0, -6.5]}>
        <Pile />
      </group>
      <group name="Мешок денег" position={[0.15, BODY.waist, -7.55]} rotation={[0, 0.4, 0]}>
        <Coins />
      </group>
      <group name="Дверь" position={[W / 2 - 0.3, 0, 7]}>
        <Tx geometry={box} map={woodTex('#6e4224', '#4a2a18', 3)} position={[0, 3.2, 0]} scale={[0.2, 6.4, 3.4]} line={3} />
        <Toon geometry={G.sphere} color="#c9a24a" position={[-0.2, 3.1, -1.2]} scale={0.12} line={1} />
      </group>
    </>
  );
};
