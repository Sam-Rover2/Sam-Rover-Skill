import { useMemo } from 'react';
import * as THREE from 'three';
import { G } from '../lib/geometry';
import { flat, outline } from '../lib/materials';
import { BODY } from '../lib/style';
import { dirtTex, labelTex, plasterTex, roofTex, signTex, stoneTex, woodTex } from '../lib/tex';
import { Toon, type V3 } from '../lib/Toon';
import { Limb } from '../rig/Limb';
import { Shadow, Tree } from '../props/Props';
import { SkyBackdrop } from '../props/Sky';
import { OBJECTS } from '../objects';

/**
 * Location 1 · Old Hanoi street, 1902. French-colonial "tube houses" on both sides of a dirt road.
 * Street runs along X, centre line z = 0. Houses face the street. Scaled to the characters
 * (door ≈ 5.2 units, storey 7 units).
 */

const RAMP = (() => {
  const t = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 205, 205, 205, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();
const box = new THREE.BoxGeometry(1, 1, 1);
const plane = new THREE.PlaneGeometry(1, 1);

const Tx: React.FC<{ geometry: THREE.BufferGeometry; map: THREE.Texture; color?: string; position?: V3; rotation?: V3; scale?: V3 | number; line?: number }> = ({
  geometry,
  map,
  color = '#ffffff',
  position,
  rotation,
  scale,
  line = 4,
}) => {
  const mat = useMemo(() => new THREE.MeshToonMaterial({ map, color, gradientMap: RAMP }), [map, color]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometry} material={mat} />
      {line > 0 && <mesh geometry={geometry} material={outline(line)} />}
    </group>
  );
};

const FH = 7; // storey height
const DOOR = 5.2;

/** Tall French window with open green shutters and a small sill. */
const FrenchWindow: React.FC<{ x: number; y: number; shutter: string; open?: number }> = ({ x, y, shutter, open = 1 }) => (
  <group position={[x, y, 0.06]}>
    <Toon geometry={G.box} color="#efe3c4" scale={[1.9, 3.5, 0.12]} line={3} />
    <mesh geometry={plane} material={flat('#2c2a35')} position={[0, 0, 0.07]} scale={[1.5, 3.1, 1]} />
    {/* glazing bars */}
    <mesh geometry={plane} material={flat('#efe3c4')} position={[0, 0, 0.075]} scale={[0.08, 3.1, 1]} />
    {[-0.6, 0.4].map((yy) => (
      <mesh key={yy} geometry={plane} material={flat('#efe3c4')} position={[0, yy, 0.075]} scale={[1.5, 0.06, 1]} />
    ))}
    {[-1, 1].map((s) => (
      <group key={s} position={[s * 0.75, 0, 0.1]} rotation={[0, s * open * 1.1, 0]}>
        <Toon geometry={G.box} color={shutter} position={[s * 0.38, 0, 0]} scale={[0.76, 3.2, 0.06]} line={3} />
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} geometry={plane} material={flat('#1b1b1f', 0.25)} position={[s * 0.38, -1.4 + i * 0.35, 0.035]} scale={[0.6, 0.04, 1]} />
        ))}
      </group>
    ))}
    <Toon geometry={G.box} color="#e6d6b0" position={[0, -1.85, 0.2]} scale={[2.2, 0.16, 0.45]} line={3} />
  </group>
);

/** Balcony slab with turned balusters and a hand rail. */
const Balcony: React.FC<{ w: number; y: number; color: string }> = ({ w, y, color }) => (
  <group position={[0, y, 0.9]}>
    <Toon geometry={G.box} color="#e6d6b0" position={[0, 0, 0]} scale={[w, 0.3, 1.8]} line={3} />
    {[-w / 2 + 0.6, w / 2 - 0.6].map((x) => (
      <Toon key={x} geometry={G.box} color="#e6d6b0" position={[x, -0.45, -0.3]} rotation={[0.6, 0, 0]} scale={[0.3, 0.9, 0.3]} line={3} />
    ))}
    {Array.from({ length: Math.floor(w / 0.45) }).map((_, i) => (
      <Toon key={i} geometry={G.capsule} color={color} position={[-w / 2 + 0.3 + i * 0.45, 0.75, 0.8]} scale={[0.07, 0.35, 0.07]} line={2} />
    ))}
    <Toon geometry={G.box} color={color} position={[0, 1.5, 0.8]} scale={[w, 0.12, 0.14]} line={2} />
    {/* potted plants */}
    {[-w / 3, w / 4].map((x, i) => (
      <group key={x} position={[x, 0.15, 0.2]}>
        <Toon geometry={G.pot} color="#c4603e" position={[0, 0.3, 0]} scale={[0.3, 0.6, 0.3]} line={2} />
        {[0, 1, 2].map((k) => (
          <Toon key={k} geometry={G.sphere} color={k % 2 ? '#4f9d4a' : '#3c7f3a'} position={[(k - 1) * 0.2, 0.85 + (k % 2) * 0.15, 0]} scale={[0.25, 0.35 + i * 0.05, 0.25]} line={2} />
        ))}
      </group>
    ))}
  </group>
);

/** Open shop on the ground floor: dark interior, folding wooden doors, counter with goods, sign, awning. */
const ShopFront: React.FC<{ w: number; sign: string; signBg: string; awning: string; goods: 'rice' | 'baskets' | 'jars' | 'cloth' }> = ({ w, sign, signBg, awning, goods }) => {
  const wood = woodTex('#7a4a2a', '#4a2a18', 6);
  return (
    <group>
      {/* recessed dark interior */}
      <mesh geometry={plane} material={flat('#2b2420')} position={[0, DOOR / 2, -0.6]} scale={[w - 1.6, DOOR, 1]} />
      {/* side walls of the opening */}
      {[-1, 1].map((s) => (
        <Tx key={s} geometry={box} map={plasterTex('#d9b75f')} position={[s * (w / 2 - 0.4), DOOR / 2, -0.3]} scale={[0.8, DOOR, 0.6]} line={3} />
      ))}
      {/* folding door panels pushed to the sides */}
      {[-1, 1].map((s) =>
        [0, 1].map((k) => (
          <Tx key={`${s}${k}`} geometry={box} map={wood} position={[s * (w / 2 - 1.2 - k * 0.55), DOOR / 2 - 0.1, -0.05 - k * 0.05]} rotation={[0, s * (0.5 - k), 0]} scale={[0.6, DOOR - 0.3, 0.08]} line={2} />
        )),
      )}
      {/* counter + goods */}
      <Tx geometry={box} map={wood} position={[0, 0.9, 0.2]} scale={[w - 3.2, 1.8, 1]} line={3} />
      {goods === 'rice' &&
        [-1.2, 0, 1.2].map((x) => (
          <group key={x} position={[x, 1.8, 0.2]}>
            <Toon geometry={G.cyl} color="#c49a5a" position={[0, 0.35, 0]} scale={[0.45, 0.7, 0.45]} line={2} />
            <Toon geometry={G.hemi} color="#f4efe2" position={[0, 0.7, 0]} scale={[0.43, 0.25, 0.43]} line={2} />
          </group>
        ))}
      {goods === 'baskets' &&
        [-1.4, -0.4, 0.6, 1.5].map((x, i) => (
          <group key={x} position={[x, 1.8, 0.2]}>
            <Toon geometry={G.pot} color="#c9a46a" position={[0, 0.25, 0]} scale={[0.4, 0.5, 0.4]} line={2} />
            {[0, 1, 2].map((k) => (
              <Toon key={k} geometry={G.sphere} color={['#e2572f', '#f2b233', '#5fa85a', '#9b4a8a'][(i + k) % 4]} position={[(k - 1) * 0.18, 0.55, 0]} scale={0.16} line={2} />
            ))}
          </group>
        ))}
      {goods === 'jars' &&
        [-1.3, -0.3, 0.7, 1.6].map((x, i) => (
          <Toon key={x} geometry={G.sphere} color={i % 2 ? '#3d6b7a' : '#7a5a3a'} position={[x, 2.3, 0.2]} scale={[0.35, 0.5, 0.35]} line={3} />
        ))}
      {goods === 'cloth' &&
        [-1.2, 0, 1.2].map((x, i) => (
          <Toon key={x} geometry={G.box} color={['#c8302c', '#2f6f9e', '#e8c35a'][i]} position={[x, 2.0, 0.2]} scale={[1, 0.4, 0.8]} line={2} />
        ))}
      {/* horizontal sign above the shop */}
      <Tx geometry={box} map={labelTex(`shop-${sign}`, [{ text: sign, size: 120, color: '#f2c94c' }], signBg, '#f2c94c', 1024, 256)} position={[0, DOOR + 0.6, 0.15]} scale={[w - 1.4, 1.0, 0.12]} line={3} />
      {/* striped fabric awning */}
      <group position={[0, DOOR + 0.05, 1.2]} rotation={[0.42, 0, 0]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Toon key={i} geometry={G.box} color={i % 2 ? '#f4efe2' : awning} position={[-(w - 1.2) / 2 + ((w - 1.2) / 8) * (i + 0.5), 0, 0]} scale={[(w - 1.2) / 8, 0.06, 2.4]} line={0} />
        ))}
        <mesh geometry={box} material={outline(3)} scale={[w - 1.2, 0.06, 2.4]} />
        {Array.from({ length: 8 }).map((_, i) => (
          <Toon key={`v${i}`} geometry={G.cone} color={i % 2 ? '#f4efe2' : awning} position={[-(w - 1.2) / 2 + ((w - 1.2) / 8) * (i + 0.5), -0.25, 1.2]} rotation={[Math.PI, 0, 0]} scale={[(w - 1.2) / 16, 0.4, 0.05]} line={2} />
        ))}
      </group>
    </group>
  );
};

/** A French-colonial tube house facing +z. */
const TubeHouse: React.FC<{
  w: number;
  floors: number;
  color: string;
  shutter: string;
  roof: 'tile' | 'flat';
  sign: string;
  signBg: string;
  awning: string;
  goods: 'rice' | 'baskets' | 'jars' | 'cloth';
  vSign?: string[];
  year?: boolean;
}> = ({ w, floors, color, shutter, roof, sign, signBg, awning, goods, vSign, year }) => {
  const d = 10;
  const h = floors * FH;
  const wall = plasterTex(color, [w / 8, h / 8]);
  return (
    <group>
      <Tx geometry={box} map={wall} position={[0, h / 2, -d / 2]} scale={[w, h, d]} line={5} />
      {/* pilasters + cornices */}
      {[-1, 1].map((s) => (
        <Toon key={s} geometry={G.box} color="#efe3c4" position={[s * (w / 2 - 0.25), h / 2, 0.1]} scale={[0.5, h, 0.3]} line={3} />
      ))}
      {Array.from({ length: floors }).map((_, f) => (
        <Toon key={f} geometry={G.box} color="#efe3c4" position={[0, (f + 1) * FH - 0.2, 0.15]} scale={[w + 0.4, 0.4, 0.5]} line={3} />
      ))}
      <ShopFront w={w} sign={sign} signBg={signBg} awning={awning} goods={goods} />
      {Array.from({ length: floors - 1 }).map((_, f) => {
        const y = (f + 1) * FH + 2.6;
        const n = w > 10 ? 3 : 2;
        return (
          <group key={f}>
            {Array.from({ length: n }).map((__, i) => (
              <FrenchWindow key={i} x={(i - (n - 1) / 2) * (w / n)} y={y} shutter={shutter} open={(i + f) % 3 === 2 ? 0.2 : 1} />
            ))}
            {f === 0 && <Balcony w={w - 0.8} y={(f + 1) * FH + 0.4} color="#2f4a3a" />}
          </group>
        );
      })}
      {/* roof */}
      {roof === 'tile' ? (
        (() => {
          const shape = new THREE.Shape([new THREE.Vector2(-d / 2 - 0.8, 0), new THREE.Vector2(d / 2 + 0.8, 0), new THREE.Vector2(0, 3.6)]);
          const g = new THREE.ExtrudeGeometry(shape, { depth: w + 0.6, bevelEnabled: false });
          g.rotateY(Math.PI / 2);
          g.translate(-(w + 0.6) / 2, h, -d / 2);
          const map = roofTex([3, 2]);
          return <Tx geometry={g} map={map} line={4} />;
        })()
      ) : (
        <group position={[0, h, 0]}>
          <Toon geometry={G.box} color="#efe3c4" position={[0, 0.2, -d / 2 + 0.2]} scale={[w + 0.4, 0.4, d + 0.4]} line={3} />
          {Array.from({ length: Math.floor(w / 0.6) }).map((_, i) => (
            <Toon key={i} geometry={G.capsule} color="#efe3c4" position={[-w / 2 + 0.4 + i * 0.6, 0.9, 0.1]} scale={[0.1, 0.3, 0.1]} line={2} />
          ))}
          <Toon geometry={G.box} color="#efe3c4" position={[0, 1.55, 0.1]} scale={[w + 0.4, 0.3, 0.4]} line={3} />
          {year && (
            <group position={[0, 2.6, 0.05]}>
              <Toon geometry={G.cone} color="#efe3c4" scale={[w * 0.35, 1.8, 0.3]} line={3} />
              <Tx geometry={plane} map={labelTex('year1902', [{ text: '1902', size: 150 }], '#efe3c4', '#8a5a2a', 512, 256)} position={[0, -0.25, 0.32]} scale={[2.6, 1.0, 1]} line={0} />
            </group>
          )}
        </group>
      )}
      {/* vertical side sign */}
      {vSign && <Tx geometry={box} map={signTex(vSign.join(''), vSign)} position={[w / 2 - 0.2, FH + 3.2, 1.0]} scale={[0.9, 3.6, 0.12]} line={3} />}
    </group>
  );
};

/** Telegraph pole + wires to the next pole. */
const Pole: React.FC<{ x: number; z: number; next?: number }> = ({ x, z, next }) => (
  <group>
    <Tx geometry={G.cyl} map={woodTex('#6e4a2e', '#3e2614', 6)} position={[x, 7, z]} scale={[0.18, 14, 0.18]} line={3} />
    <Toon geometry={G.box} color="#4a3020" position={[x, 13.2, z]} scale={[2.6, 0.2, 0.2]} line={2} />
    {[-1, 0, 1].map((k) => (
      <Toon key={k} geometry={G.cyl} color="#f4f1ea" position={[x + k * 1.1, 13.45, z]} scale={[0.09, 0.3, 0.09]} line={2} />
    ))}
    {next !== undefined &&
      [-1, 0, 1].map((k) => (
        <Limb key={k} root={[x + k * 1.1, 13.6, z]} tip={[next + k * 1.1, 13.6, z]} length={Math.abs(next - x) * 1.02} bendDir={[0, -1, 0]} radius={0.025} />
      ))}
  </group>
);

/** String of red lanterns across the street. */
const LanternString: React.FC<{ x: number; y: number; span: number }> = ({ x, y, span }) => (
  <group>
    <Limb root={[x, y, -span / 2]} tip={[x, y, span / 2]} length={span * 1.05} bendDir={[0, -1, 0]} radius={0.02} />
    {Array.from({ length: 7 }).map((_, i) => {
      const k = (i + 1) / 8;
      const sag = Math.sin(k * Math.PI) * span * 0.16;
      return (
        <group key={i} position={[x, y - sag - 0.55, -span / 2 + k * span]}>
          <Toon geometry={G.sphere} color={i % 2 ? '#e8452c' : '#f2b233'} scale={[0.32, 0.42, 0.32]} line={3} />
          <Toon geometry={G.cyl} color="#d9b44a" position={[0, 0.45, 0]} scale={[0.12, 0.08, 0.12]} line={2} />
        </group>
      );
    })}
  </group>
);

const Basket: React.FC<{ position: V3; fill?: string }> = ({ position, fill = '#e2572f' }) => (
  <group name="Корзина" position={position}>
    <Toon geometry={G.pot} color="#c9a46a" position={[0, 0.35, 0]} scale={[0.55, 0.7, 0.55]} line={3} />
    {[0, 1, 2, 3].map((k) => (
      <Toon key={k} geometry={G.sphere} color={fill} position={[Math.cos(k * 1.6) * 0.25, 0.75, Math.sin(k * 1.6) * 0.25]} scale={0.2} line={2} />
    ))}
  </group>
);

const obj = (id: string) => OBJECTS.find((o) => o.id === id)!.C;

/** Old Hanoi street set. */
export const StreetSet: React.FC = () => {
  const Rickshaw = obj('rickshaw');
  const Manhole = obj('manhole');
  const Rice = obj('rice');
  const Lantern = obj('lantern');
  const SW = 12; // sidewalk width: tree canopy (≈3.6 units each way) + balconies (2.7) never touch
  const HZ = 20; // house front z (both sides): road = 2 × (HZ − SW) = 16 units
  const TZ = HZ - SW + 2.5; // trees stand near the curb, canopy clears balconies by ≈3 units
  const left: [number, number, number, string, string, 'tile' | 'flat', string, string, string, 'rice' | 'baskets' | 'jars' | 'cloth', string[]?, boolean?][] = [
    // x, w, floors, colour, shutter, roof, sign, signBg, awning, goods, vertical sign, year
    [-42, 10, 3, '#e3b85a', '#3f7a5a', 'flat', 'TIỆM GẠO', '#8a1c14', '#c8302c', 'rice', ['GẠO', 'NGON'], false],
    [-31.5, 11, 2, '#d99a5a', '#2f5f7a', 'tile', 'HÀNG GIỎ', '#1d3a2a', '#2f7a5a', 'baskets'],
    [-20.5, 11, 3, '#e8c97a', '#3f7a5a', 'flat', 'HIỆU THUỐC', '#2a2a4a', '#c8302c', 'jars', ['THUỐC', 'BẮC'], true],
    [-9.5, 11, 2, '#c9a56a', '#7a3a2a', 'tile', 'HÀNG VẢI', '#8a1c14', '#e8a33a', 'cloth'],
    [1.5, 11, 3, '#e3b85a', '#2f5f7a', 'flat', 'TRÀ · CAFÉ', '#3a2a1a', '#2f6f9e', 'jars', ['TRÀ', 'NGON']],
    [12.5, 11, 2, '#d9a96a', '#3f7a5a', 'tile', 'HÀNG GẠO', '#8a1c14', '#c8302c', 'rice'],
    [23.5, 11, 3, '#e8c97a', '#7a3a2a', 'flat', 'HÀNG GIỎ', '#1d3a2a', '#e8a33a', 'baskets'],
  ];
  return (
    <>
      <SkyBackdrop colors={['#86b8e6', '#a9cdef', '#d6e9f7', '#f3e6c8']} y={40} h={150} />
      {/* ground: dirt road, stone sidewalks with curbs, gutters */}
      <group name="Земля вокруг">
        <Tx geometry={plane} map={dirtTex([60, 60])} color="#efe4cf" position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[700, 700, 1]} line={0} />
      </group>
      <group name="Дорога">
        <Tx geometry={plane} map={dirtTex([10, 3])} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[200, 2 * (HZ - SW), 1]} line={0} />
      </group>
      {[-1, 1].map((s) => (
        <group key={s} name={s < 0 ? 'Тротуар левый' : 'Тротуар правый'}>
          <Tx geometry={box} map={stoneTex('#b3ab9c', [40, 2])} position={[0, 0.15, s * (HZ - SW / 2)]} scale={[200, 0.3, SW]} line={0} />
          <Toon geometry={G.box} color="#8f877a" position={[0, 0.18, s * (HZ - SW)]} scale={[200, 0.36, 0.35]} line={2} />
          <mesh geometry={plane} material={flat('#5a5040')} position={[0, 0.01, s * (HZ - SW - 0.45)]} rotation={[-Math.PI / 2, 0, 0]} scale={[200, 0.5, 1]} />
        </group>
      ))}
      {/* houses: one row each side, facing the street */}
      {left.map(([x, w, fl, c, sh, rf, sg, sb, aw, gd, vs, yr], i) => (
        <group key={`L${i}`} name={`Дом L${i + 1} «${sg}»`} position={[x, 0.3, -HZ]}>
          <TubeHouse w={w} floors={fl} color={c} shutter={sh} roof={rf} sign={sg} signBg={sb} awning={aw} goods={gd} vSign={vs} year={yr} />
        </group>
      ))}
      {left.map(([x, w, fl, c, sh, rf, sg, sb, aw, gd, vs], i) => (
        <group key={`R${i}`} name={`Дом R${i + 1} «${left[(i + 2) % left.length][6]}»`} position={[x + 5, 0.3, HZ]} rotation={[0, Math.PI, 0]}>
          <TubeHouse w={w} floors={((fl + i) % 2) + 2} color={left[(i + 3) % left.length][3]} shutter={sh} roof={rf === 'tile' ? 'flat' : 'tile'} sign={left[(i + 2) % left.length][6]} signBg={sb} awning={aw} goods={left[(i + 1) % left.length][9]} vSign={vs} />
        </group>
      ))}
      {/* trees, poles + wires, lantern strings */}
      {[-36, -14, 8, 30].map((x, i) => (
        <group key={x} name={`Дерево ${i + 1}`}>
          <Tree position={[x, 0.3, -TZ]} scale={2.6} colors={['#4f9d4a', '#3c7f3a']} />
          <Shadow position={[x, 0.31, -TZ]} r={2.4} opacity={0.15} />
        </group>
      ))}
      {[-44, -24, -4, 16, 36].map((x, i, a) => (
        <group key={x} name={`Столб ${i + 1}`}>
          <Pole x={x} z={HZ - SW + 1} next={a[i + 1]} />
        </group>
      ))}
      {[-26, -4, 18].map((x, i) => (
        <group key={x} name={`Гирлянда фонариков ${i + 1}`}>
          <LanternString x={x} y={11.5} span={2 * HZ - 1} />
        </group>
      ))}
      {/* street props: rickshaw, manhole, rice sacks, baskets, lantern post */}
      <group name="Рикша" position={[6, 0, -4]} rotation={[0, -1.2, 0]}>
        <Rickshaw />
      </group>
      <group name="Люк" position={[3, 0.005, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <Manhole />
      </group>
      <group name="Мешок риса 1" position={[-40, 0.3, -HZ + 2.8]}>
        <Rice />
      </group>
      <group name="Мешок риса 2" position={[-38.2, 0.3, -HZ + 2.6]} rotation={[0, 0.6, 0]}>
        <Rice />
      </group>
      <Basket position={[-30, 0.3, -HZ + 2.4]} />
      <Basket position={[-28.8, 0.3, -HZ + 2.9]} fill="#f2b233" />
      <Basket position={[24.5, 0.3, HZ - 2.4]} fill="#5fa85a" />
      <group name="Фонарь 1" position={[-17, 0.3, -HZ + 4.6]}>
        <Lantern />
      </group>
      <group name="Фонарь 2" position={[20, 0.3, HZ - 4.6]} rotation={[0, Math.PI, 0]}>
        <Lantern />
      </group>
      {/* far end of the street: a colonial building closing the view */}
      <group name="Почта (конец улицы)" position={[60, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <TubeHouse w={2 * HZ + 6} floors={3} color="#efe0b0" shutter="#3f7a5a" roof="flat" sign="POSTE · BƯU ĐIỆN" signBg="#2a3a6a" awning="#2f4a8a" goods="cloth" year />
      </group>
    </>
  );
};

/** Characters' reference for scale (used by the viewer and the turntable). */
export const STREET_BODY = BODY;
