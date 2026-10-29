import { G } from '../lib/geometry';
import { LINE, P } from '../lib/style';
import { Flat, Toon, type V3 } from '../lib/Toon';

const BG = LINE.bgWidth;
type At = { position?: V3; rotation?: V3; scale?: number };

/* ---------- small hero props ---------- */

export const PaperCup: React.FC<At & { heart?: boolean }> = ({ heart, ...at }) => (
  <group {...at}>
    <Toon geometry={G.cup} color={P.white} position={[0, 0, 0]} scale={[0.15, 0.36, 0.15]} rotation={[Math.PI, 0, 0]} />
    <Toon geometry={G.cup} color={P.woodLight} position={[0, -0.01, 0]} scale={[0.158, 0.14, 0.158]} rotation={[Math.PI, 0, 0]} line={3} />
    <Toon geometry={G.cyl} color={P.red} position={[0, 0.2, 0]} scale={[0.165, 0.05, 0.165]} line={3} />
    {heart && <Flat geometry={G.disc} color={P.red} position={[0, 0.02, 0.16]} scale={[0.05, 0.05, 1]} />}
  </group>
);

export const Mug: React.FC<At & { color?: string }> = ({ color = P.red, ...at }) => (
  <group {...at}>
    <Toon geometry={G.cyl} color={color} scale={[0.15, 0.3, 0.15]} />
    <Toon geometry={G.torus} color={color} position={[0.16, 0, 0]} scale={[0.08, 0.08, 0.15]} line={3} />
  </group>
);

/* ---------- interiors ---------- */

/** Box room: floor, back wall, left wall, trim and baseboard. Open toward +z (camera). */
export const Room: React.FC<{
  w?: number;
  d?: number;
  h?: number;
  wall: string;
  side?: string;
  floor: string;
  floorLine?: string;
  trim?: string;
  tiles?: boolean;
}> = ({ w = 16, d = 12, h = 7, wall, side, floor, floorLine, trim, tiles }) => (
  <group>
    <Flat color={floor} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, d / 2 - 3]} scale={[w * 2, d + 6, 1]} />
    {floorLine &&
      Array.from({ length: 12 }).map((_, i) => (
        <Flat key={i} color={floorLine} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, -3 + i * 0.9]} scale={[w * 2, 0.03, 1]} />
      ))}
    <Flat color={wall} position={[0, h / 2, -3]} scale={[w * 2, h, 1]} />
    <Flat color={side ?? wall} position={[-w / 2, h / 2, d / 2 - 3]} rotation={[0, Math.PI / 2, 0]} scale={[d + 6, h, 1]} />
    <Toon geometry={G.box} color={LINE.color} position={[-w / 2 + 0.02, h / 2, -2.98]} scale={[0.04, h, 0.04]} line={0} />
    {trim && <Toon geometry={G.box} color={trim} position={[0, 1.55, -2.95]} scale={[w * 2, 0.12, 0.06]} line={0} />}
    <Toon geometry={G.box} color={side ?? wall} position={[0, 0.12, -2.92]} scale={[w * 2, 0.24, 0.1]} line={BG} />
    {tiles &&
      Array.from({ length: 30 }).map((_, i) =>
        Array.from({ length: 4 }).map((__, j) => (
          <Flat key={`${i}-${j}`} color={P.white} opacity={0.35} position={[-8 + i * 0.55, 1.75 + j * 0.42, -2.97]} scale={[0.5, 0.37, 1]} />
        )),
      )}
  </group>
);

export const Skyline: React.FC<{ w?: number; h?: number; sky: readonly string[]; tower?: string; lit?: number }> = ({
  w = 3.6,
  h = 2.6,
  sky,
  tower = P.building,
  lit = 0,
}) => {
  const towers = [
    [-0.36, 0.62, 0.15], [-0.17, 0.85, 0.16], [0.04, 0.54, 0.14], [0.22, 1.0, 0.15], [0.4, 0.7, 0.14],
  ];
  return (
    <group>
      {sky.map((c, i) => (
        <Flat key={c} color={c} position={[0, h / 2 - (h / sky.length) * (i + 0.5), 0.001 * i]} scale={[w, h / sky.length + 0.01, 1]} />
      )).reverse()}
      {towers.map(([x, th, tw], i) => (
        <group key={i} position={[x * w, -h / 2 + (th * h) / 2, 0.01]}>
          <Flat color={tower} scale={[tw * w, th * h, 1]} />
          {Array.from({ length: Math.floor((th * h) / 0.25) }).map((_, r) =>
            [-1, 1].map((c) => (
              <Flat
                key={`${r}${c}`}
                color={lit && (r + c + i) % 3 === 0 ? P.lampGlow : P.buildingWindow}
                position={[c * tw * w * 0.2, (th * h) / 2 - 0.18 - r * 0.25, 0.002]}
                scale={[tw * w * 0.18, 0.1, 1]}
              />
            )),
          )}
        </group>
      ))}
    </group>
  );
};

export const Window: React.FC<At & { w?: number; h?: number; sky: readonly string[]; lit?: number; curtains?: string }> = ({
  w = 3.6,
  h = 2.6,
  sky,
  lit,
  curtains,
  ...at
}) => (
  <group {...at}>
    <Toon geometry={G.box} color="#f4f4f4" scale={[w + 0.3, h + 0.3, 0.12]} line={BG} />
    <group position={[0, 0, 0.07]}>
      <Skyline w={w} h={h} sky={sky} lit={lit} />
    </group>
    <Toon geometry={G.box} color="#f4f4f4" position={[0, 0, 0.1]} scale={[0.1, h, 0.06]} line={BG} />
    <Toon geometry={G.box} color="#f4f4f4" position={[0, -h / 2 - 0.1, 0.2]} scale={[w + 0.6, 0.16, 0.4]} line={BG} />
    {curtains &&
      [-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 + 0.25), 0, 0.3]}>
          <Toon geometry={G.softBox} color={curtains} scale={[0.6, h + 0.6, 0.12]} line={BG} />
          {[-0.15, 0.1].map((x) => (
            <Flat key={x} color={LINE.color} opacity={0.18} position={[x, 0, 0.07]} scale={[0.03, h + 0.4, 1]} />
          ))}
        </group>
      ))}
    {curtains && <Toon geometry={G.cyl} color={P.woodDark} position={[0, h / 2 + 0.35, 0.3]} rotation={[0, 0, Math.PI / 2]} scale={[0.05, w + 1.6, 0.05]} line={3} />}
  </group>
);

export const Plant: React.FC<At & { big?: boolean }> = ({ big, ...at }) => {
  const s = big ? 1.5 : 1;
  return (
    <group {...at}>
      <Toon geometry={G.pot} color={P.pot} position={[0, 0.35 * s, 0]} scale={[0.4 * s, 0.7 * s, 0.4 * s]} line={BG} />
      <Toon geometry={G.cyl} color={P.woodDark} position={[0, 0.7 * s, 0]} scale={[0.36 * s, 0.03, 0.36 * s]} line={0} />
      {[[-0.25, 1.05, 0.4], [0.25, 1.2, -0.35], [0, 1.5, 0], [-0.1, 1.25, -0.6], [0.2, 0.95, 0.7]].map(([x, y, r], i) => (
        <Toon key={i} geometry={G.sphere} color={i % 2 ? P.plantDark : P.plant} position={[x * s, y * s, (i % 3) * 0.05]} rotation={[0, 0, r]} scale={[0.26 * s, 0.48 * s, 0.26 * s]} line={BG} />
      ))}
    </group>
  );
};

export const Frame: React.FC<At & { w?: number; h?: number; art: string[] }> = ({ w = 1, h = 0.75, art, ...at }) => (
  <group {...at}>
    <Toon geometry={G.box} color={P.woodDark} scale={[w, h, 0.06]} line={3} />
    <Flat color="#fbf8f0" position={[0, 0, 0.035]} scale={[w * 0.82, h * 0.78, 1]} />
    {art.map((c, i) => (
      <Flat key={i} geometry={i % 2 ? G.disc : G.plane} color={c} position={[(i - (art.length - 1) / 2) * w * 0.22, (i % 2 ? 0.05 : -0.08) * h, 0.04]} scale={[w * 0.16, h * 0.3, 1]} />
    ))}
  </group>
);

export const Clock: React.FC<At & { t: number }> = ({ t, ...at }) => (
  <group {...at}>
    <Toon geometry={G.cyl} color={P.white} rotation={[Math.PI / 2, 0, 0]} scale={[0.4, 0.08, 0.4]} line={4} />
    {Array.from({ length: 12 }).map((_, i) => (
      <Flat key={i} geometry={G.disc} color={LINE.color} position={[Math.sin((i / 12) * 6.283) * 0.31, Math.cos((i / 12) * 6.283) * 0.31, 0.05]} scale={0.025} />
    ))}
    <group position={[0, 0, 0.05]} rotation={[0, 0, -t * 0.5]}>
      <Flat color={LINE.color} position={[0, 0.12, 0]} scale={[0.03, 0.24, 1]} />
    </group>
    <group position={[0, 0, 0.055]} rotation={[0, 0, -t * 6]}>
      <Flat color={P.red} position={[0, 0.15, 0]} scale={[0.015, 0.3, 1]} />
    </group>
  </group>
);

export const PendantLamp: React.FC<At & { color?: string; glow?: boolean; drop?: number }> = ({ color = P.teal, glow = true, drop = 1.2, ...at }) => (
  <group {...at}>
    <Flat color={LINE.color} position={[0, drop / 2, 0]} scale={[0.025, drop, 1]} />
    <Toon geometry={G.hemi} color={color} rotation={[Math.PI, 0, 0]} position={[0, 0, 0]} scale={[0.45, 0.32, 0.45]} line={4} />
    {glow && <Toon geometry={G.sphere} color={P.lampGlow} unlit position={[0, -0.06, 0]} scale={0.13} line={0} />}
  </group>
);

export const Shelf: React.FC<At & { w?: number; items?: 'books' | 'cups' | 'jars' }> = ({ w = 2.4, items = 'books', ...at }) => {
  const colors = [P.red, P.teal, P.yellow, P.lilac, P.navy, P.coral, P.green];
  return (
    <group {...at}>
      <Toon geometry={G.box} color={P.woodLight} scale={[w, 0.1, 0.5]} line={BG} />
      {Array.from({ length: Math.floor(w / 0.24) }).map((_, i) => {
        const x = -w / 2 + 0.18 + i * 0.24;
        const c = colors[(i * 3) % colors.length];
        if (items === 'cups')
          return <Mug key={i} color={c} position={[x, 0.2, 0]} scale={0.8} />;
        if (items === 'jars')
          return <Toon key={i} geometry={G.softBox} color={i % 2 ? P.woodLight : P.apron} position={[x, 0.26, 0]} scale={[0.18, 0.42, 0.18]} line={3} />;
        const hh = 0.38 + ((i * 7) % 4) * 0.06;
        return <Toon key={i} geometry={G.box} color={c} position={[x, 0.05 + hh / 2, 0]} rotation={[0, 0, i % 5 === 4 ? 0.25 : 0]} scale={[0.17, hh, 0.36]} line={3} />;
      })}
    </group>
  );
};

export const Table: React.FC<At & { w?: number; d?: number; h?: number; top?: string; round?: boolean }> = ({
  w = 1.6,
  d = 1,
  h = 1.3,
  top = P.woodLight,
  round,
  ...at
}) => (
  <group {...at}>
    {round ? (
      <>
        <Toon geometry={G.cyl} color={top} position={[0, h, 0]} scale={[w / 2, 0.08, w / 2]} line={BG} />
        <Toon geometry={G.cyl} color={LINE.color} position={[0, h / 2, 0]} scale={[0.05, h, 0.05]} line={0} />
        <Toon geometry={G.cyl} color={LINE.color} position={[0, 0.03, 0]} scale={[0.35, 0.05, 0.35]} line={0} />
      </>
    ) : (
      <>
        <Toon geometry={G.box} color={top} position={[0, h, 0]} scale={[w, 0.1, d]} line={BG} />
        {[-1, 1].map((sx) =>
          [-1, 1].map((sz) => (
            <Toon key={`${sx}${sz}`} geometry={G.box} color={P.woodDark} position={[sx * (w / 2 - 0.1), h / 2, sz * (d / 2 - 0.1)]} scale={[0.08, h, 0.08]} line={3} />
          )),
        )}
      </>
    )}
  </group>
);

/** Chair sized to the characters: seat top at SIZE.seatH, front edge at z=+0.35. */
export const Chair: React.FC<At & { color?: string }> = ({ color = P.coral, ...at }) => (
  <group {...at}>
    <Toon geometry={G.softBox} color={color} position={[0, 0.6, 0]} scale={[0.8, 0.12, 0.7]} line={BG} />
    <Toon geometry={G.softBox} color={color} position={[0, 1.15, -0.34]} scale={[0.8, 1.0, 0.1]} line={BG} />
    {[-1, 1].map((sx) =>
      [-1, 1].map((sz) => <Toon key={`${sx}${sz}`} geometry={G.box} color={LINE.color} position={[sx * 0.32, 0.27, sz * 0.28]} scale={[0.05, 0.54, 0.05]} line={0} />),
    )}
  </group>
);

export const Monitor: React.FC<At & { t?: number }> = ({ t = 0, ...at }) => (
  <group {...at}>
    <Toon geometry={G.box} color={P.monitor} position={[0, 0.6, 0]} scale={[1.3, 0.85, 0.08]} line={BG} />
    <Toon geometry={G.box} color={P.monitor} position={[0, 0.05, 0]} scale={[0.1, 0.4, 0.1]} line={BG} />
    <Toon geometry={G.box} color={P.monitor} position={[0, -0.14, 0.05]} scale={[0.5, 0.04, 0.3]} line={BG} />
    <group position={[0, 0.6, 0.05]}>
      <Flat color={P.screen} scale={[1.15, 0.7, 1]} />
      {P.bars.map((c, i) => {
        const hh = 0.25 + 0.3 * (0.5 + 0.5 * Math.sin(t * 1.3 + i * 1.7));
        return <Flat key={c} color={c} position={[-0.36 + i * 0.24, -0.3 + hh / 2, 0.003]} scale={[0.14, hh, 1]} />;
      })}
    </group>
  </group>
);

export const Desk: React.FC<At & { t?: number; color?: string; monitorX?: number }> = ({ t = 0, color = P.desk, monitorX = 0, ...at }) => (
  <group {...at}>
    <Toon geometry={G.box} color={color} position={[0, 0.7, 0]} scale={[2.6, 1.4, 1.1]} line={BG} />
    <Toon geometry={G.box} color={P.deskTop} position={[0, 1.44, 0.05]} scale={[2.8, 0.1, 1.25]} line={BG} />
    {[0.35, 0.85].map((y) => (
      <Flat key={y} color={LINE.color} opacity={0.5} position={[0.55, y, 0.56]} scale={[0.4, 0.04, 1]} />
    ))}
    <Monitor position={[monitorX, 1.65, -0.2]} t={t} />
    <Toon geometry={G.box} color="#d7dbe3" position={[0, 1.52, 0.3]} scale={[0.9, 0.05, 0.3]} line={3} />
  </group>
);

/* ---------- exteriors ---------- */

export const Tree: React.FC<At & { colors?: string[] }> = ({ colors = [P.plant, P.plantDark], ...at }) => (
  <group {...at}>
    <Toon geometry={G.cone} color={P.bark} position={[0, 1.2, 0]} scale={[0.22, 2.4, 0.22]} line={BG} />
    {[[0, 3.2, 0, 1.2], [-0.8, 2.6, 0.2, 0.85], [0.85, 2.7, -0.1, 0.9], [0.2, 3.9, -0.2, 0.8]].map(([x, y, z, r], i) => (
      <Toon key={i} geometry={G.sphere} color={colors[i % colors.length]} position={[x, y, z]} scale={r} line={BG} />
    ))}
  </group>
);

export const StreetLamp: React.FC<At & { on?: number }> = ({ on = 0, ...at }) => (
  <group {...at}>
    <Toon geometry={G.cyl} color={P.navy} position={[0, 2.2, 0]} scale={[0.07, 4.4, 0.07]} line={4} />
    <Toon geometry={G.cyl} color={P.navy} position={[0, 0.15, 0]} scale={[0.2, 0.3, 0.2]} line={4} />
    <Toon geometry={G.softBox} color={P.navy} position={[0, 4.5, 0]} scale={[0.45, 0.3, 0.45]} line={4} />
    <Toon geometry={G.sphere} color={on > 0.5 ? P.lampGlow : '#e8e4d8'} unlit position={[0, 4.28, 0]} scale={0.18} line={3} />
  </group>
);

/** Park bench sized to the characters: seat top at y=0.66, front edge at z=+0.35. */
export const Bench: React.FC<At> = (at) => (
  <group {...at}>
    {[0, 1, 2].map((i) => (
      <Toon key={i} geometry={G.box} color={P.woodLight} position={[0, 0.62, -0.15 + i * 0.2]} scale={[3.2, 0.08, 0.17]} line={3} />
    ))}
    {[0, 1].map((i) => (
      <Toon key={i} geometry={G.box} color={P.woodLight} position={[0, 1.15 + i * 0.32, -0.42]} rotation={[-0.15, 0, 0]} scale={[3.2, 0.2, 0.08]} line={3} />
    ))}
    {[-1, 1].map((s) => (
      <group key={s} position={[s * 1.4, 0, 0]}>
        <Toon geometry={G.box} color={P.navy} position={[0, 0.3, 0.05]} scale={[0.1, 0.6, 0.6]} line={3} />
        <Toon geometry={G.box} color={P.navy} position={[0, 1.05, -0.42]} scale={[0.1, 0.9, 0.1]} line={3} />
      </group>
    ))}
  </group>
);

export const Car: React.FC<At & { color?: string; spin?: number }> = ({ color = P.red, spin = 0, ...at }) => (
  <group {...at}>
    <Toon geometry={G.softBox} color={color} position={[0, 0.75, 0]} scale={[3.6, 0.8, 1.6]} />
    <Toon geometry={G.softBox} color={color} position={[-0.2, 1.4, 0]} scale={[2, 0.8, 1.45]} />
    {[-1, 1].map((s) => (
      <Flat key={s} color={P.buildingWindow} position={[-0.2 + s * 0.48, 1.42, 0.735]} scale={[0.8, 0.5, 1]} />
    ))}
    <Toon geometry={G.sphere} color={P.lampGlow} unlit position={[1.78, 0.85, 0.5]} scale={[0.06, 0.12, 0.16]} line={3} />
    {[-1.15, 1.15].map((x) =>
      [-0.8, 0.8].map((z) => (
        <group key={`${x}${z}`} position={[x, 0.38, z]} rotation={[Math.PI / 2, 0, -spin]}>
          <Toon geometry={G.cyl} color="#2b2b30" scale={[0.38, 0.3, 0.38]} line={4} />
          <Toon geometry={G.cyl} color={P.steel} position={[0, z > 0 ? 0.16 : -0.16, 0]} scale={[0.18, 0.02, 0.18]} line={0} />
        </group>
      )),
    )}
  </group>
);

/** A building façade with windows, a door and an optional awning; front face at z=0. */
export const Facade: React.FC<At & { w?: number; h?: number; color: string; awning?: string; sign?: string; door?: string }> = ({
  w = 6,
  h = 8,
  color,
  awning,
  sign,
  door = P.woodDark,
  ...at
}) => (
  <group {...at}>
    <Toon geometry={G.box} color={color} position={[0, h / 2, -0.5]} scale={[w, h, 1]} line={BG} />
    {Array.from({ length: Math.floor((h - 3) / 1.8) }).map((_, r) =>
      Array.from({ length: Math.floor(w / 1.6) }).map((__, c, arr) => (
        <group key={`${r}${c}`} position={[(c - (arr.length - 1) / 2) * 1.6, 4 + r * 1.8, 0.02]}>
          <Toon geometry={G.box} color="#f4f4f4" scale={[0.95, 1.2, 0.08]} line={3} />
          <Flat color={(r + c) % 3 === 0 ? P.lampGlow : P.buildingWindow} position={[0, 0, 0.05]} scale={[0.8, 1.05, 1]} />
          <Toon geometry={G.box} color="#f4f4f4" position={[0, -0.65, 0.12]} scale={[1.1, 0.1, 0.25]} line={3} />
        </group>
      )),
    )}
    <Toon geometry={G.box} color={door} position={[-w / 4, 1.1, 0.04]} scale={[1.1, 2.2, 0.1]} line={3} />
    <Toon geometry={G.box} color="#f4f4f4" position={[w / 6, 1.4, 0.03]} scale={[w / 2.6, 1.6, 0.08]} line={3} />
    <Flat color={P.buildingWindow} position={[w / 6, 1.4, 0.08]} scale={[w / 2.6 - 0.2, 1.4, 1]} />
    {awning && (
      <group position={[0, 2.75, 0.5]}>
        <Toon geometry={G.box} color={awning} rotation={[0.45, 0, 0]} scale={[w * 0.8, 0.08, 1.2]} line={4} />
        {Array.from({ length: 7 }).map((_, i) => (
          <Flat key={i} color={P.white} position={[(i - 3) * w * 0.115, -0.25, 0.56]} scale={[w * 0.05, 0.25, 1]} />
        ))}
      </group>
    )}
    {sign && (
      <group position={[0, 3.5, 0.1]}>
        <Toon geometry={G.softBox} color={sign} scale={[2.4, 0.6, 0.12]} line={4} />
      </group>
    )}
  </group>
);

export const Cloud: React.FC<At> = (at) => (
  <group {...at}>
    {[[0, 0, 1], [-0.9, -0.15, 0.7], [0.9, -0.2, 0.75], [0.35, 0.35, 0.65]].map(([x, y, r], i) => (
      <Toon key={i} geometry={G.sphere} color="#ffffff" position={[x, y, 0]} scale={[r, r * 0.75, 0.4]} line={BG} />
    ))}
  </group>
);

/** Soft contact shadow under feet / objects. */
export const Shadow: React.FC<{ position?: V3; r?: number; opacity?: number }> = ({ position = [0, 0, 0], r = 0.8, opacity = 0.18 }) => (
  <Flat geometry={G.disc} color={LINE.color} opacity={opacity} position={[position[0], position[1] + 0.01, position[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={[r, r * 0.6, 1]} />
);
