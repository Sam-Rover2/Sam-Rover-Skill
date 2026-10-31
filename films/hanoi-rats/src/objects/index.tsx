import { useMemo } from 'react';
import * as THREE from 'three';
import { G } from '../lib/geometry';
import { flat, outline } from '../lib/materials';
import { LINE } from '../lib/style';
import { labelTex, metalTex, woodTex } from '../lib/tex';
import { Toon, type V3 } from '../lib/Toon';
import { Limb } from '../rig/Limb';
import { Rat } from '../rig/Person';
import { Model } from '../assets/Model';

/**
 * Stage 2: OBJECTS for «Крысы Ханоя». Built in code with canvas textures and labels
 * (like the reference films: props tell the story). 1 m = 2.2 units.
 */
export interface Obj {
  id: string;
  name: string;
  status: 'draft' | 'approved';
  source: 'code' | 'model';
  C: React.FC;
}

const RAMP = (() => {
  const t = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 205, 205, 205, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();

/** Textured toon mesh with an ink outline. */
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
const box = new THREE.BoxGeometry(1, 1, 1);
const plane = new THREE.PlaneGeometry(1, 1);

/** A pink rat tail (Bezier). */
const Tail: React.FC<{ a: V3; b: V3; bend?: V3; len?: number }> = ({ a, b, bend = [0, 1, 0], len }) => (
  <Limb root={a} tip={b} length={len ?? Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) * 1.15} bendDir={bend} radius={0.028} color="#e99aa6" />
);

/* ---------------- inspection ---------------- */

const Notebook: React.FC = () => (
  <group rotation={[-0.3, 0.3, 0]} position={[0, 0.3, 0]}>
    <Tx geometry={box} map={labelTex('notebook', [{ text: 'SERVICE', size: 52 }, { text: "D'HYGIÈNE", size: 52 }, { text: 'Hanoi · 1902', size: 40, font: 'italic 600' }], '#3d5a40', '#e8d9a8')} scale={[0.36, 0.5, 0.05]} />
    <Toon geometry={G.cyl} color="#d9b44a" position={[0.25, 0, 0.04]} rotation={[0, 0, 0.3]} scale={[0.018, 0.45, 0.018]} line={2} />
    <Toon geometry={G.cone} color="#2a2420" position={[0.32, -0.21, 0.04]} rotation={[0, 0, Math.PI + 0.3]} scale={[0.018, 0.05, 0.018]} line={0} />
  </group>
);

const Magnifier: React.FC = () => (
  <group position={[0, 0.5, 0]} rotation={[0, 0, -0.5]}>
    <Toon geometry={G.torus} color="#c9a24a" scale={[0.16, 0.16, 0.2]} line={3} />
    <mesh geometry={G.disc} material={flat('#cfe8f5', 0.55)} scale={0.15} />
    <Tx geometry={G.cyl} map={woodTex('#7a4a2a', '#4a2a18', 6)} position={[0, -0.33, 0]} scale={[0.035, 0.32, 0.035]} line={3} />
  </group>
);

/* ---------------- bounty office ---------------- */

const Poster: React.FC = () => (
  <group>
    {[-1, 1].map((s) => (
      <Tx key={s} geometry={G.cyl} map={woodTex('#8e5d33', '#5a3a1e', 6)} position={[s * 0.75, 1.5, 0]} scale={[0.05, 3, 0.05]} line={3} />
    ))}
    <Tx
      geometry={box}
      map={labelTex('bounty', [
        { text: 'AVIS', size: 70 },
        { text: 'PRIME AUX RATS', size: 44 },
        { text: '1 queue = 1 cent', size: 50, color: '#a3241f' },
        { text: '— RAT BOUNTY —', size: 30, font: '600' },
        { text: 'Gouvernement Général', size: 26, font: 'italic 600' },
      ])}
      position={[0, 2.25, 0.03]}
      scale={[1.5, 1.6, 0.04]}
    />
  </group>
);

const Desk: React.FC = () => {
  const wood = woodTex('#9a6438', '#5e3a1e', 5);
  return (
    <group>
      <Tx geometry={box} map={wood} position={[0, 1.6, 0]} scale={[3.2, 0.14, 1.5]} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Tx geometry={box} map={wood} position={[s * 1.15, 0.78, 0]} scale={[0.8, 1.56, 1.35]} />
          {[0.45, 0.95].map((y) => (
            <group key={y}>
              <Toon geometry={G.box} color="#7a4a2a" position={[s * 1.15, y, 0.69]} scale={[0.66, 0.36, 0.04]} line={2} />
              <Toon geometry={G.sphere} color="#d9b44a" position={[s * 1.15, y, 0.73]} scale={0.04} line={2} />
            </group>
          ))}
        </group>
      ))}
      {/* green leather top */}
      <Toon geometry={G.box} color="#3d6b4a" position={[0, 1.68, 0]} scale={[2.6, 0.02, 1.1]} line={0} />
      <Ledger position={[-0.6, 1.7, 0.1]} />
      <CoinStack position={[0.5, 1.7, 0.2]} />
      {/* inkwell + quill */}
      <Toon geometry={G.cyl} color="#2a2a3a" position={[1.1, 1.78, -0.3]} scale={[0.09, 0.14, 0.09]} line={2} />
      <Toon geometry={G.cone} color="#f1ead6" position={[1.15, 2.0, -0.32]} rotation={[0, 0, -0.3]} scale={[0.04, 0.4, 0.015]} line={2} />
    </group>
  );
};

const Ledger: React.FC<{ position?: V3 }> = ({ position = [0, 0.05, 0] }) => (
  <group position={position} rotation={[0, 0.2, 0]}>
    <Toon geometry={G.box} color="#6b2a24" position={[0, 0.02, 0]} scale={[0.95, 0.05, 0.62]} line={3} />
    {[-1, 1].map((s) => (
      <Tx
        key={s}
        geometry={plane}
        map={labelTex(`ledger${s}`, s < 0 ? [{ text: 'QUEUES', size: 56 }, { text: 'IIII IIII IIII', size: 60, font: '400' }, { text: 'IIII IIII III', size: 60, font: '400' }] : [{ text: '20 000', size: 90, color: '#a3241f' }, { text: 'par jour', size: 50, font: 'italic 600' }], '#f6efdc', '#3a2a1a', 256, 320)}
        position={[s * 0.23, 0.051, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[0.44, 0.56, 1]}
        line={0}
      />
    ))}
  </group>
);

const CoinStack: React.FC<{ position?: V3 }> = ({ position = [0, 0, 0] }) => (
  <group position={position}>
    {[0, 1, 2].map((k) =>
      Array.from({ length: 5 - k }).map((_, i) => (
        <Toon key={`${k}${i}`} geometry={G.cyl} color={i % 2 ? '#e0b84a' : '#d1a83c'} position={[k * 0.2 - 0.2, 0.025 + i * 0.045, (k % 2) * 0.1]} scale={[0.08, 0.04, 0.08]} line={2} />
      )),
    )}
  </group>
);

const CoinPouch: React.FC = () => (
  <group>
    <Toon geometry={G.sphere} color="#b08a5a" position={[0, 0.32, 0]} scale={[0.35, 0.32, 0.35]} />
    <Tx geometry={plane} map={labelTex('pouch', [{ text: '$', size: 150, color: '#7a2a24' }], '#efe2c4', '#5a3a1e', 256, 256)} position={[0, 0.32, 0.355]} scale={[0.28, 0.28, 1]} line={0} />
    <Toon geometry={G.cone} color="#b08a5a" position={[0, 0.68, 0]} scale={[0.14, 0.18, 0.14]} line={3} />
    <Toon geometry={G.torus} color="#7a2a24" position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.12, 0.12, 0.3]} line={2} />
    <CoinStack position={[0.5, 0, 0.1]} />
  </group>
);

/* ---------------- tails ---------------- */

const TailBucket: React.FC = () => (
  <group>
    <Tx geometry={G.pot} map={woodTex('#a8743f', '#6e4520', 8, [3, 1])} position={[0, 0.45, 0]} scale={[0.45, 0.9, 0.45]} />
    {[0.15, 0.75].map((y) => {
      const r = (0.75 + (y / 0.9) * 0.25) * 0.45 + 0.01; // follows the bucket's taper
      return <Toon key={y} geometry={G.torus} color="#5a5f6a" position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[r, r, 0.12]} line={2} />;
    })}
    {Array.from({ length: 9 }).map((_, i) => {
      const a = (i / 9) * Math.PI * 2;
      return <Tail key={i} a={[Math.cos(a) * 0.2, 0.85, Math.sin(a) * 0.2]} b={[Math.cos(a) * 0.55, 1.2 + (i % 3) * 0.12, Math.sin(a) * 0.55]} bend={[Math.cos(a), 1, Math.sin(a)]} />;
    })}
  </group>
);

const TailSack: React.FC = () => (
  <group>
    <Toon geometry={G.sphere} color="#c2a172" position={[0, 0.55, 0]} scale={[0.5, 0.58, 0.45]} />
    <Tx geometry={plane} map={labelTex('sack-tails', [{ text: 'QUEUES', size: 80 }, { text: '× 500', size: 70, color: '#a3241f' }], '#efe2c4', '#5a3a1e', 256, 256)} position={[0, 0.58, 0.455]} rotation={[-0.05, 0, 0]} scale={[0.5, 0.42, 1]} line={0} />
    <Toon geometry={G.cone} color="#c2a172" position={[0, 1.15, 0]} scale={[0.22, 0.25, 0.22]} line={3} />
    {[-0.12, 0, 0.12].map((x, i) => (
      <Tail key={i} a={[x, 1.2, 0]} b={[x * 3 + 0.2, 1.6 + i * 0.1, 0.2]} bend={[1, 1, 0]} />
    ))}
  </group>
);

const TailPile: React.FC = () => (
  <group>
    {Array.from({ length: 40 }).map((_, i) => {
      const a = i * 2.39;
      const r = 0.15 + (i % 7) * 0.12;
      const y = Math.max(0.03, 0.55 - r * 0.6) + (i % 3) * 0.04;
      return <Tail key={i} a={[Math.cos(a) * r, y, Math.sin(a) * r]} b={[Math.cos(a + 1.2) * (r + 0.35), y * 0.5 + 0.02, Math.sin(a + 1.2) * (r + 0.35)]} bend={[0, 1, 0]} />;
    })}
  </group>
);

const TailCrate: React.FC = () => {
  const wood = woodTex('#b9864e', '#7a5028', 5);
  return (
    <group>
      <Tx geometry={box} map={wood} position={[0, 0.55, 0]} scale={[1.4, 1.1, 1.0]} />
      <Tx geometry={plane} map={labelTex('crate', [{ text: 'QUEUES DE RATS', size: 46 }, { text: 'NE PAS OUVRIR', size: 40, color: '#a3241f' }], '#e9d6a6', '#3a2a1a', 512, 256)} position={[0, 0.6, 0.51]} scale={[1.1, 0.55, 1]} line={0} />
      {[-0.6, 0.6].map((x) => (
        <Toon key={x} geometry={G.box} color="#7a5028" position={[x, 0.55, 0.51]} scale={[0.1, 1.1, 0.04]} line={2} />
      ))}
      <Tail a={[0.3, 1.1, 0.1]} b={[0.6, 1.3, 0.5]} bend={[0, 1, 1]} />
    </group>
  );
};

/* ---------------- catchers & farm ---------------- */

const wireMat = new THREE.MeshBasicMaterial({ color: LINE.color });
const CageTrap: React.FC<{ rat?: boolean }> = ({ rat = true }) => {
  const w = 1.2;
  const h = 0.6;
  const d = 0.6;
  return (
    <group>
      <Tx geometry={box} map={woodTex('#9a6438', '#5e3a1e', 3)} position={[0, 0.03, 0]} scale={[w + 0.1, 0.06, d + 0.1]} line={3} />
      {Array.from({ length: 9 }).map((_, i) => (
        <group key={i}>
          <mesh geometry={G.stick} material={wireMat} position={[-w / 2 + (i / 8) * w, h / 2 + 0.06, d / 2]} scale={[0.012, h / 2, 0.012]} />
          <mesh geometry={G.stick} material={wireMat} position={[-w / 2 + (i / 8) * w, h / 2 + 0.06, -d / 2]} scale={[0.012, h / 2, 0.012]} />
          <mesh geometry={G.stick} material={wireMat} position={[-w / 2 + (i / 8) * w, h + 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.012, d / 2, 0.012]} />
        </group>
      ))}
      {[0.06, h + 0.06].map((y) =>
        [-1, 1].map((s) => <mesh key={`${y}${s}`} geometry={G.stick} material={wireMat} position={[0, y, (s * d) / 2]} rotation={[0, 0, Math.PI / 2]} scale={[0.014, w / 2, 0.014]} />),
      )}
      <Toon geometry={G.box} color="#6e7380" position={[w / 2 + 0.02, h / 2 + 0.06, 0]} rotation={[0, 0, -0.15]} scale={[0.04, h, d]} line={2} />
      {rat && (
        <group position={[-0.1, 0.06, 0]} rotation={[0, 1.4, 0]}>
          <Rat pose={{ face: 'scared' }} scale={0.8} />
        </group>
      )}
    </group>
  );
};

const Scissors: React.FC = () => (
  <group position={[0, 0.6, 0]} rotation={[0, 0, 0.3]}>
    {[-1, 1].map((s) => (
      <group key={s} rotation={[0, 0, s * 0.18]}>
        <Tx geometry={G.cone} map={metalTex('#b9c0cc')} position={[0, 0.32, 0.02 * s]} scale={[0.07, 0.6, 0.02]} line={3} />
        <Toon geometry={G.torus} color="#2a2a30" position={[s * 0.12, -0.18, 0.02 * s]} scale={[0.1, 0.13, 0.15]} line={2} />
      </group>
    ))}
    <Toon geometry={G.sphere} color="#d9b44a" position={[0, 0.02, 0.05]} scale={0.035} line={2} />
  </group>
);

const FarmCages: React.FC = () => {
  const wood = woodTex('#8e5d33', '#5a3a1e', 4);
  return (
    <group>
      {[-1.4, 1.4].map((x) => (
        <Tx key={x} geometry={box} map={wood} position={[x, 1.6, 0]} scale={[0.12, 3.2, 0.9]} line={3} />
      ))}
      {[0.05, 1.1, 2.15].map((y, row) => (
        <group key={y}>
          <Tx geometry={box} map={wood} position={[0, y, 0]} scale={[2.9, 0.08, 0.9]} line={3} />
          {[-0.85, 0, 0.85].map((x, i) => (
            <group key={x} position={[x, y + 0.05, 0]}>
              {Array.from({ length: 5 }).map((_, k) => (
                <mesh key={k} geometry={G.stick} material={wireMat} position={[-0.38 + k * 0.19, 0.42, 0.42]} scale={[0.01, 0.42, 0.01]} />
              ))}
              <group position={[0, 0, 0]} rotation={[0, (row + i) % 2 ? 0.8 : -0.6, 0]}>
                <Rat pose={{ tail: (row + i) % 3 !== 0, face: (row + i) % 2 ? 'happy' : 'sly' }} scale={0.55} />
              </group>
            </group>
          ))}
        </group>
      ))}
      <Tx geometry={plane} map={labelTex('farm', [{ text: 'TRẠI CHUỘT', size: 60 }, { text: 'élevage', size: 44, font: 'italic 600' }], '#e9d6a6', '#3a2a1a', 512, 256)} position={[0, 3.45, 0.05]} scale={[1.6, 0.8, 1]} />
    </group>
  );
};

const RiceSack: React.FC = () => (
  <group>
    <Toon geometry={G.capsule} color="#d9c39a" position={[0, 0.62, 0]} scale={[0.45, 0.28, 0.35]} />
    <Tx geometry={plane} map={labelTex('rice', [{ text: 'GẠO', size: 110 }, { text: 'riz · 50 kg', size: 46, font: '600' }], '#efe2c4', '#6b4a2a', 256, 256)} position={[0, 0.62, 0.355]} scale={[0.5, 0.48, 1]} line={0} />
    <Toon geometry={G.cone} color="#d9c39a" position={[0, 1.15, 0]} scale={[0.18, 0.22, 0.14]} line={3} />
  </group>
);

/* ---------------- street ---------------- */

const Manhole: React.FC = () => (
  <group>
    <Toon geometry={G.cyl} color="#5f6470" position={[0, 0.03, 0]} scale={[0.75, 0.06, 0.75]} />
    <Tx
      geometry={G.disc}
      map={labelTex('manhole', [{ text: 'ÉGOUTS', size: 70, color: '#2a2a30' }, { text: 'HANOI · 1902', size: 46, color: '#2a2a30' }], '#6a6f7b', '#2a2a30', 256, 256)}
      position={[0, 0.062, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={0.68}
      line={0}
    />
    <Toon geometry={G.torus} color="#4a4f5a" position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.78, 0.78, 0.25]} line={3} />
  </group>
);

const Rickshaw: React.FC = () => {
  const wood = woodTex('#7a2a24', '#4a1612', 3);
  return (
    <group>
      {/* seat + hood */}
      <Tx geometry={box} map={wood} position={[0, 1.55, -0.2]} scale={[1.4, 0.35, 1.0]} />
      <Toon geometry={G.box} color="#c8302c" position={[0, 1.95, -0.65]} rotation={[-0.2, 0, 0]} scale={[1.35, 0.8, 0.12]} line={3} />
      <Toon geometry={G.hemi} color="#2a2420" position={[0, 2.3, -0.55]} rotation={[-1.2, 0, 0]} scale={[0.75, 0.8, 0.55]} />
      {/* big wheels */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.82, 1.1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <Toon geometry={G.torus} color="#2a2420" scale={[1.05, 1.05, 0.3]} line={3} />
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} geometry={G.stick} material={wireMat} rotation={[0, 0, (i / 8) * Math.PI]} scale={[0.02, 1.0, 0.02]} />
          ))}
          <Toon geometry={G.cyl} color="#d9b44a" rotation={[Math.PI / 2, 0, 0]} scale={[0.1, 0.25, 0.1]} line={2} />
        </group>
      ))}
      {/* shafts */}
      {[-1, 1].map((s) => (
        <Tx key={s} geometry={G.cyl} map={woodTex('#b9864e', '#7a5028', 6)} position={[s * 0.55, 1.25, 1.4]} rotation={[Math.PI / 2 - 0.25, 0, 0]} scale={[0.05, 2.6, 0.05]} line={3} />
      ))}
    </group>
  );
};

const Lantern: React.FC = () => (
  <group>
    <Toon geometry={G.cyl} color="#2a2420" position={[0, 2.6, 0]} scale={[0.04, 5.2, 0.04]} line={2} />
    <Toon geometry={G.box} color="#2a2420" position={[0.35, 5.0, 0]} scale={[0.75, 0.05, 0.05]} line={2} />
    <group position={[0.7, 4.55, 0]}>
      <Toon geometry={G.sphere} color="#e8452c" scale={[0.32, 0.4, 0.32]} />
      {[-0.22, 0, 0.22].map((y) => (
        <mesh key={y} geometry={G.thinRing} material={flat('#7a1a12')} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.32 * Math.cos(y * 2.2)} />
      ))}
      <Toon geometry={G.cyl} color="#d9b44a" position={[0, 0.42, 0]} scale={[0.14, 0.08, 0.14]} line={2} />
      <Toon geometry={G.cyl} color="#d9b44a" position={[0, -0.42, 0]} scale={[0.14, 0.08, 0.14]} line={2} />
    </group>
  </group>
);

export const OBJECTS: Obj[] = [
  { id: 'notebook', name: 'Блокнот инспектора', status: 'draft', source: 'code', C: Notebook },
  { id: 'magnifier', name: 'Лупа', status: 'draft', source: 'code', C: Magnifier },
  { id: 'poster', name: 'Плакат «Награда за хвост»', status: 'draft', source: 'code', C: Poster },
  { id: 'desk', name: 'Стол чиновника (журнал, монеты, чернильница)', status: 'draft', source: 'code', C: Desk },
  { id: 'ledger', name: 'Журнал учёта хвостов', status: 'draft', source: 'code', C: () => <Ledger /> },
  { id: 'coins', name: 'Монеты и мешочек «PIASTRES»', status: 'draft', source: 'code', C: CoinPouch },
  { id: 'bucket', name: 'Ведро с хвостами', status: 'draft', source: 'code', C: TailBucket },
  { id: 'sack', name: 'Мешок хвостов', status: 'draft', source: 'code', C: TailSack },
  { id: 'pile', name: 'Гора хвостов', status: 'draft', source: 'code', C: TailPile },
  { id: 'crate', name: 'Ящик «QUEUES DE RATS»', status: 'draft', source: 'code', C: TailCrate },
  { id: 'trap', name: 'Ловушка-клетка с крысой', status: 'draft', source: 'code', C: () => <CageTrap /> },
  { id: 'scissors', name: 'Ножницы ловца', status: 'draft', source: 'code', C: Scissors },
  { id: 'farm', name: 'Стеллаж крысиной фермы', status: 'draft', source: 'code', C: FarmCages },
  { id: 'rice', name: 'Мешок риса «GẠO»', status: 'draft', source: 'code', C: RiceSack },
  { id: 'manhole', name: 'Люк «ÉGOUTS HANOI»', status: 'draft', source: 'code', C: Manhole },
  { id: 'rickshaw', name: 'Рикша', status: 'draft', source: 'code', C: Rickshaw },
  { id: 'lantern', name: 'Фонарь с красным фонариком', status: 'draft', source: 'code', C: Lantern },
];
export { Model };
