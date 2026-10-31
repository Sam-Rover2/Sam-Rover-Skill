import { G } from '../lib/geometry';
import { P, SIZE } from '../lib/style';
import { Flat, Toon, type V3 } from '../lib/Toon';
import { Building } from './Big';
import { Chair, Plant, Table, Tree } from './Props';

type At = { position?: V3; rotation?: V3 };
const F = SIZE.floorH;

const Win: React.FC<{ p: V3; w?: number; h?: number; frame?: string; shutters?: string; lit?: boolean }> = ({ p, w = SIZE.windowW, h = SIZE.windowH, frame = '#f4f4f4', shutters, lit }) => (
  <group position={p}>
    <Toon geometry={G.box} color={frame} scale={[w + 0.3, h + 0.3, 0.1]} line={3} />
    <Flat color={lit ? P.lampGlow : P.buildingWindow} position={[0, 0, 0.06]} scale={[w, h, 1]} />
    <Flat color={frame} position={[0, 0, 0.07]} scale={[0.1, h, 1]} />
    {shutters &&
      [-1, 1].map((s) => (
        <Toon key={s} geometry={G.box} color={shutters} position={[s * (w / 2 + 0.55), 0, 0.05]} scale={[0.9, h + 0.2, 0.08]} line={3} />
      ))}
  </group>
);

/** Small cottage with a gable roof, chimney, shutters, fence and flowers. */
export const Cottage: React.FC<At> = (at) => {
  const w = 16;
  const h = F * 1.1;
  return (
    <group {...at}>
      <Toon geometry={G.box} color="#f3e6cc" position={[0, h / 2, -4]} scale={[w, h, 8]} line={5} />
      {/* gable roof: a square prism rotated 45° */}
      {/* gable roof: triangular prism, apex up, slightly wider than the walls */}
      <Toon geometry={G.prism} color={P.trimRed} position={[0, h + 2.2, -4]} rotation={[-Math.PI / 2, 0, 0]} scale={[(w + 1.6) / 1.732, 9.2, 4.4]} line={5} />
      <Toon geometry={G.box} color={P.brick} position={[4.5, h + 4, -5]} scale={[1.2, 3.5, 1.2]} line={4} />
      <Toon geometry={G.box} color={P.woodDark} position={[-3.5, SIZE.doorH / 2, 0.05]} scale={[SIZE.doorW, SIZE.doorH, 0.15]} line={4} />
      <Toon geometry={G.box} color={P.trimRed} position={[-3.5, SIZE.doorH + 0.3, 0.3]} scale={[SIZE.doorW + 1, 0.2, 0.8]} line={3} />
      <Win p={[2.5, 3.6, 0.02]} shutters={P.trimGreen} />
      <Win p={[6, 3.6, 0.02]} shutters={P.trimGreen} />
      <Win p={[0, h + 1.8, 0.75]} w={1.4} h={1.4} />
      {Array.from({ length: 22 }).map((_, i) => (
        <Toon key={i} geometry={G.box} color="#ffffff" position={[-11 + i * 1.05, 0.9, 4]} scale={[0.25, 1.8, 0.12]} line={3} />
      ))}
      <Toon geometry={G.box} color="#ffffff" position={[0, 1.3, 4]} scale={[23, 0.2, 0.1]} line={3} />
      {Array.from({ length: 10 }).map((_, i) => (
        <Toon key={i} geometry={G.sphere} color={[P.red, P.yellow, P.lilac][i % 3]} position={[-9 + i * 2, 0.5, 2.6]} scale={0.35} line={3} />
      ))}
      <Tree position={[11, 0, -1]} scale={2.4} />
    </group>
  );
};

/** Glass office tower: curtain-wall grid, lobby, rooftop crown. */
export const Skyscraper: React.FC<At> = (at) => {
  const w = 22;
  const floors = 14;
  const h = F * floors;
  return (
    <group {...at}>
      <Toon geometry={G.bigBox} color="#5d8fc7" position={[0, h / 2, -6]} scale={[w, h, 12]} line={5} />
      {Array.from({ length: 9 }).map((_, i) => (
        <Toon key={i} geometry={G.bigBox} color="#dfe8f2" position={[-w / 2 + i * (w / 8), h / 2, 0.05]} scale={[0.35, h, 0.3]} line={2} />
      ))}
      {Array.from({ length: floors }).map((_, i) => (
        <Toon key={i} geometry={G.bigBox} color="#dfe8f2" position={[0, F * (i + 1), 0.05]} scale={[w, 0.3, 0.3]} line={2} />
      ))}
      {[[3, 2], [5, 6], [8, 3], [10, 5], [12, 1]].map(([r, c]) => (
        <Flat key={`${r}${c}`} color="#bfe0ff" position={[-w / 2 + c * (w / 8) + w / 16, F * r + F / 2, 0.08]} scale={[w / 8 - 0.4, F - 0.4, 1]} />
      ))}
      <Toon geometry={G.bigBox} color="#2c3446" position={[0, h + 1.5, -6]} scale={[w * 0.7, 3, 9]} line={4} />
      <Toon geometry={G.cyl} color={P.steel} position={[0, h + 7, -6]} scale={[0.15, 9, 0.15]} line={2} />
      <Toon geometry={G.box} color={P.desk} position={[0, 2.6, 0.6]} scale={[10, 5.2, 0.5]} line={4} />
      <Flat color={P.lampGlow} position={[0, 2.4, 0.9]} scale={[8.6, 4.2, 1]} />
      <Toon geometry={G.box} color={P.steel} position={[0, 5.6, 1.4]} scale={[12, 0.3, 2.4]} line={3} />
    </group>
  );
};

/** Corner café: two-storey house + awning, sign, outdoor tables. */
export const CafeShop: React.FC<At> = (at) => (
  <group {...at}>
    <Building w={20} floors={2} color={P.wallMint} awning={P.red} litSeed={1} />
    <group position={[0, 6.2, 0.4]}>
      <Toon geometry={G.softBox} color="#ffffff" scale={[6, 1.3, 0.25]} line={4} />
      <Toon geometry={G.cup} color={P.red} rotation={[Math.PI, 0, 0]} position={[-2.1, 0, 0.2]} scale={[0.35, 0.7, 0.2]} line={3} />
      {[0, 1, 2, 3].map((i) => (
        <Flat key={i} color={P.ink} position={[-0.8 + i * 0.9, 0, 0.14]} scale={[0.6, 0.18, 1]} />
      ))}
    </group>
    {[-6, 6].map((x) => (
      <group key={x} position={[x, 0, 4]}>
        <Table round w={1.6} />
        <Chair position={[-1.1, 0, 0]} rotation={[0, 1.4, 0]} />
        <Chair position={[1.1, 0, 0]} rotation={[0, -1.4, 0]} color={P.teal} />
        <Toon geometry={G.cyl} color={P.white} position={[0, 3.3, 0]} scale={[0.05, 3, 0.05]} line={2} />
        <Toon geometry={G.cone} color={P.red} position={[0, 4.9, 0]} scale={[2.2, 0.9, 2.2]} line={4} />
      </group>
    ))}
    <Plant position={[9, 0, 1]} big />
  </group>
);

/** Brick factory: sawtooth roof, smokestacks, roller door. */
export const Factory: React.FC<At> = (at) => {
  const w = 34;
  const h = 9;
  return (
    <group {...at}>
      <Toon geometry={G.bigBox} color={P.brick} position={[0, h / 2, -7]} scale={[w, h, 14]} line={5} />
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={i} position={[-w / 2 + 3 + i * 5.6, h, -7]}>
          <Toon geometry={G.box} color="#8b95a5" position={[0, 1.4, 0]} rotation={[0, 0, 0.55]} scale={[5.6, 0.3, 13]} line={4} />
          <Flat color={P.buildingWindow} position={[2.2, 1.4, 6.6]} scale={[0.8, 2.6, 1]} />
        </group>
      ))}
      {[-10, -5].map((x, i) => (
        <group key={x} position={[x, 0, -12]}>
          <Toon geometry={G.cyl} color={P.brick} position={[0, 10 + i * 2, 0]} scale={[1.1, 20 + i * 4, 1.1]} line={4} />
          {[0, 1].map((r) => (
            <Toon key={r} geometry={G.cyl} color={P.white} position={[0, 17 + i * 3 + r * 1.2, 0]} scale={[1.15, 0.5, 1.15]} line={2} />
          ))}
        </group>
      ))}
      <Toon geometry={G.box} color={P.steel} position={[6, 3, 0.1]} scale={[8, 6, 0.3]} line={4} />
      {Array.from({ length: 10 }).map((_, i) => (
        <Flat key={i} color="#7d8696" position={[6, 0.5 + i * 0.55, 0.3]} scale={[7.6, 0.06, 1]} />
      ))}
      {[-12, -7].map((x) => (
        <Win key={x} p={[x, 5, 0.02]} w={3} h={3} />
      ))}
      <Toon geometry={G.box} color="#d9b457" position={[0, 7.8, 0.2]} scale={[w, 0.8, 0.4]} line={3} />
    </group>
  );
};

/** Parisian-style block: stone walls, mansard roof, wrought-iron balconies. */
export const Parisian: React.FC<At> = (at) => {
  const w = 26;
  const floors = 5;
  const h = F * floors;
  return (
    <group {...at}>
      <Building w={w} floors={floors} color="#efe1c4" trim="#f8f0de" awning={P.navy} litSeed={3} />
      <Toon geometry={G.box} color="#5f6878" position={[0, h + 2.4, -2.6]} rotation={[0.35, 0, 0]} scale={[w + 0.4, 5.4, 3]} line={5} />
      {[-8, 0, 8].map((x) => (
        <group key={x} position={[x, h + 2.6, -1.2]}>
          <Toon geometry={G.box} color="#f8f0de" scale={[2.4, 2.8, 1]} line={3} />
          <Flat color={P.buildingWindow} position={[0, -0.1, 0.52]} scale={[1.6, 2, 1]} />
          <Toon geometry={G.cone} color="#5f6878" position={[0, 1.8, 0]} scale={[1.6, 1, 0.9]} line={3} />
        </group>
      ))}
      {[2, 3, 4].map((fl) =>
        [-1, 1].map((s) => (
          <group key={`${fl}${s}`} position={[s * 6.5, F * fl + 0.4, 0.9]}>
            <Toon geometry={G.box} color="#f8f0de" position={[0, -0.2, -0.3]} scale={[6, 0.3, 1.6]} line={3} />
            {Array.from({ length: 13 }).map((_, i) => (
              <mesh key={i} geometry={G.stick} position={[-2.9 + i * 0.48, 0.55, 0.4]} scale={[0.03, 0.5, 0.03]}>
                <meshBasicMaterial color="#1b1b1f" />
              </mesh>
            ))}
            <Toon geometry={G.box} color="#1b1b1f" position={[0, 1.15, 0.4]} scale={[6, 0.08, 0.08]} line={0} />
          </group>
        )),
      )}
    </group>
  );
};

/** Same house at 3 levels of detail (1 = blocks, 2 = our default, 3 = rich). */
export const DetailHouse: React.FC<At & { level: 1 | 2 | 3 }> = ({ level, ...at }) => {
  if (level === 1)
    return (
      <group {...at}>
        <Toon geometry={G.bigBox} color={P.brick} position={[0, (F * 3 + 1.2) / 2, -2]} scale={[20, F * 3 + 1.2, 4]} line={5} />
        {[1, 2].map((r) => [-6, 0, 6].map((x) => <Flat key={`${r}${x}`} color={P.buildingWindow} position={[x, F * r + F / 2, 0.02]} scale={[2.6, 3.2, 1]} />))}
        <Flat color={P.woodDark} position={[-5, 2.4, 0.02]} scale={[2.2, 4.8, 1]} />
        <Flat color={P.buildingWindow} position={[3, 2.6, 0.02]} scale={[7, 3.2, 1]} />
      </group>
    );
  return (
    <group {...at}>
      <Building w={20} floors={3} color={P.brick} awning={level === 3 ? P.teal : undefined} litSeed={2} />
      {level === 3 && (
        <>
          {/* brick courses */}
          {Array.from({ length: 30 }).map((_, i) => (
            <Flat key={i} color="#b45f40" position={[0, 0.4 + i * 0.68, 0.01]} scale={[20, 0.05, 1]} />
          ))}
          {/* drainpipe, lamps, sign, plants, bike, steps */}
          <Toon geometry={G.cyl} color={P.steel} position={[9.6, 10, 0.4]} scale={[0.15, 20, 0.15]} line={2} />
          {[-7.5, -2.5].map((x) => (
            <group key={x} position={[x, 5.6, 0.5]}>
              <Toon geometry={G.box} color="#2c2f38" scale={[0.3, 0.6, 0.3]} line={2} />
              <Toon geometry={G.sphere} color={P.lampGlow} position={[0, -0.4, 0]} scale={0.2} line={2} />
            </group>
          ))}
          <group position={[6.8, 8.2, 0.6]}>
            <Toon geometry={G.cyl} color={P.navy} rotation={[Math.PI / 2, 0, 0]} scale={[1.1, 0.2, 1.1]} line={3} />
            <Toon geometry={G.cup} color={P.yellow} rotation={[Math.PI, 0, 0]} position={[0, 0, 0.15]} scale={[0.3, 0.6, 0.1]} line={2} />
          </group>
          {[-8.5, 8].map((x) => (
            <Plant key={x} position={[x, 0, 1.4]} big />
          ))}
          {[0, 1, 2].map((i) => (
            <Toon key={i} geometry={G.box} color="#c7c3ba" position={[-5, 0.15 + i * 0.3, 1.4 - i * 0.4]} scale={[3, 0.3, 0.6]} line={2} />
          ))}
          <group position={[3, 0, 2]}>
            {[-1, 1].map((s) => (
              <Toon key={s} geometry={G.torus} color="#2c2f38" position={[s * 1.1, 0.8, 0]} scale={[0.75, 0.75, 0.25]} line={2} />
            ))}
            <Toon geometry={G.box} color={P.red} position={[0, 1.3, 0]} rotation={[0, 0, 0.3]} scale={[2.2, 0.12, 0.12]} line={2} />
          </group>
          {[1, 2].map((r) =>
            [-6, 6].map((x) => (
              <group key={`${r}${x}`} position={[x, F * r + 1.3, 0.8]}>
                <Toon geometry={G.box} color={P.pot} scale={[3, 0.5, 0.5]} line={2} />
                {[-1, 0, 1].map((i) => (
                  <Toon key={i} geometry={G.sphere} color={[P.red, P.yellow, P.lilac][i + 1]} position={[i, 0.4, 0]} scale={0.3} line={2} />
                ))}
              </group>
            )),
          )}
        </>
      )}
    </group>
  );
};
