import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { G } from '../lib/geometry';
import { flat, outline } from '../lib/materials';
import { BODY, LINE, PROP } from '../lib/style';
import { canvasTex, labelTex, metalTex, woodTex } from '../lib/tex';
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

const tailMat = new THREE.MeshToonMaterial({ color: '#e99aa6', gradientMap: RAMP });
/** A tail lying along a list of points (tapers to the tip). */
const TailCurve: React.FC<{ pts: V3[]; r?: number }> = ({ pts, r = 0.03 }) => {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    const g = new THREE.TubeGeometry(curve, 24, r, 6, false);
    // taper: scale ring radius toward the tip
    const pos = g.getAttribute('position');
    const c = new THREE.Vector3();
    for (let i = 0; i <= 24; i++) {
      const k = 1 - (i / 24) * 0.75;
      curve.getPointAt(i / 24, c);
      for (let j = 0; j <= 6; j++) {
        const idx = i * 7 + j;
        pos.setXYZ(idx, c.x + (pos.getX(idx) - c.x) * k, c.y + (pos.getY(idx) - c.y) * k, c.z + (pos.getZ(idx) - c.z) * k);
      }
    }
    g.computeVertexNormals();
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(pts), r]);
  return (
    <group>
      <mesh geometry={geo} material={tailMat} />
      <mesh geometry={geo} material={outline(2)} />
    </group>
  );
};

/** Surface of a container "filled with tails": tail-pink with darker curvy tail lines on top. */
const tailFillTex = canvasTex('tail-fill', 256, 256, (g, w, h) => {
  g.fillStyle = '#e99aa6';
  g.fillRect(0, 0, w, h);
  let seed = 5;
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  g.lineCap = 'round';
  for (let i = 0; i < 70; i++) {
    const x = r() * w;
    const y = r() * h;
    const a = r() * Math.PI * 2;
    const L = 30 + r() * 60;
    g.strokeStyle = r() > 0.5 ? '#c86f80' : '#f6b9c3';
    g.lineWidth = 3 + r() * 3;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a + 0.8) * L * 0.6, y + Math.sin(a + 0.8) * L * 0.6, x + Math.cos(a) * L, y + Math.sin(a) * L);
    g.stroke();
  }
}, [2, 2]);
const fillMat = new THREE.MeshToonMaterial({ map: tailFillTex, color: '#ffffff', gradientMap: RAMP });
/** Solid filler mesh (tail colour) with the tail-line texture. */
const Filler: React.FC<{ geometry: THREE.BufferGeometry; position?: V3; scale?: V3 | number; rotation?: V3 }> = ({ geometry, position, scale, rotation }) => (
  <group position={position} scale={scale} rotation={rotation}>
    <mesh geometry={geometry} material={fillMat} />
    <mesh geometry={geometry} material={outline(2)} />
  </group>
);

/** Lifts its children so the lowest point touches the floor (y = 0): nothing sinks into the ground. */
export const GroundFit: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const g = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const grp = g.current;
    if (!grp) return;
    grp.position.y = 0;
    grp.updateWorldMatrix(true, true);
    const b = new THREE.Box3().setFromObject(grp);
    if (b.isEmpty()) return;
    // compare with the PARENT's origin (where the object was placed), not with world y = 0:
    // a bag put on a desk must stay on the desk
    const base = new THREE.Vector3();
    grp.parent?.getWorldPosition(base);
    grp.position.y = base.y - b.min.y;
  });
  return <group ref={g}>{children}</group>;
};

/** Woven burlap texture. */
const burlap = (base: string) =>
  canvasTex(`burlap-${base}`, 128, 128, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    g.globalAlpha = 0.18;
    g.fillStyle = '#3a2a1a';
    for (let i = 0; i < w; i += 4) g.fillRect(i, 0, 1.5, h);
    for (let j = 0; j < h; j += 4) g.fillRect(0, j, w, 1.5);
    g.globalAlpha = 1;
  }, [3, 3]);

/** Open sack (lathe profile) with a rolled-down rim. */
const sackGeo = (() => {
  const prof = [[0, 0], [0.42, 0.02], [0.55, 0.2], [0.58, 0.5], [0.52, 0.85], [0.46, 1.0], [0.5, 1.06], [0.56, 1.06], [0.55, 1.0]].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(prof, 28);
})();
const sackFillGeo = (() => {
  const prof = [[0, 0.03], [0.4, 0.05], [0.52, 0.2], [0.55, 0.5], [0.5, 0.85], [0.44, 0.97], [0.25, 1.02], [0, 1.04]].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(prof, 28);
})();

/* ---------------- inspection ---------------- */

const Notebook: React.FC = () => (
  <group rotation={[-0.3, 0.3, 0]} position={[0, 0.3, 0]}>
    <Tx geometry={box} map={labelTex('notebook', [{ text: 'SERVICE', size: 52 }, { text: "D'HYGIÈNE", size: 52 }, { text: 'Hanoi · 1902', size: 40, font: 'italic 600' }], '#3d5a40', '#e8d9a8')} scale={[0.36, 0.5, 0.05]} />
    <Toon geometry={G.cyl} color="#d9b44a" position={[0.25, 0, 0.04]} rotation={[0, 0, 0.3]} scale={[0.018, 0.45, 0.018]} line={2} />
    <Toon geometry={G.cone} color="#2a2420" position={[0.32, -0.21, 0.04]} rotation={[0, 0, Math.PI + 0.3]} scale={[0.018, 0.05, 0.018]} line={0} />
  </group>
);

const rimGeo = new THREE.TorusGeometry(1, 0.07, 10, 48); // thin rim (tube = 7% of radius), not a donut
const Magnifier: React.FC = () => (
  <group position={[0, 0.5 * PROP, 0]} rotation={[0, 0, -0.5]} scale={PROP}>
    <Toon geometry={rimGeo} color="#c9a24a" scale={[0.16, 0.16, 0.6]} line={2} />
    <mesh geometry={G.disc} material={flat('#d6eef8', 0.5)} scale={0.155} />
    <mesh geometry={G.disc} material={flat('#ffffff', 0.7)} position={[-0.05, 0.05, 0.003]} scale={[0.04, 0.02, 1]} rotation={[0, 0, 0.6]} />
    <Toon geometry={G.cyl} color="#c9a24a" position={[0, -0.19, 0]} scale={[0.025, 0.06, 0.025]} line={2} />
    <Tx geometry={G.cyl} map={woodTex('#7a4a2a', '#4a2a18', 6)} position={[0, -0.36, 0]} scale={[0.03, 0.28, 0.03]} line={2} />
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
  const top = BODY.waist; // desk top at the characters' waist
  const legH = top - 0.14;
  return (
    <group>
      <Tx geometry={box} map={wood} position={[0, top - 0.07, 0]} scale={[4.4, 0.14, 2.0]} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Tx geometry={box} map={wood} position={[s * 1.55, legH / 2, 0]} scale={[1.1, legH, 1.8]} />
          {[0.5, 1.15, 1.75].map((y) => (
            <group key={y}>
              <Toon geometry={G.box} color="#7a4a2a" position={[s * 1.55, y, 0.92]} scale={[0.9, 0.5, 0.04]} line={2} />
              <Toon geometry={G.sphere} color="#d9b44a" position={[s * 1.55, y, 0.96]} scale={0.05} line={2} />
            </group>
          ))}
        </group>
      ))}
      <Toon geometry={G.box} color="#3d6b4a" position={[0, top + 0.01, 0]} scale={[3.7, 0.02, 1.5]} line={0} />
      <Ledger position={[-0.8, top + 0.02, 0.15]} />
      <CoinStack position={[0.7, top + 0.02, 0.25]} />
      <Toon geometry={G.cyl} color="#2a2a3a" position={[1.5, top + 0.12, -0.4]} scale={[0.11, 0.2, 0.11]} line={2} />
      <Toon geometry={G.cone} color="#f1ead6" position={[1.56, top + 0.42, -0.42]} rotation={[0, 0, -0.3]} scale={[0.05, 0.5, 0.02]} line={2} />
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

/** Money bag = the user's model (public/models/money_bag.glb), toon-styled, ≈0.45 m tall. */
const CoinPouch: React.FC = () => (
  <group>
    <Model file="models/money_bag.glb" height={0.45 * 2.2 * PROP} restyle="toon" />
    <CoinStack position={[0.75, 0, 0.2]} />
  </group>
);

/* ---------------- tails ---------------- */

const bucketWall = new THREE.CylinderGeometry(1, 0.8, 1, 32, 1, true);
const TailBucket: React.FC = () => {
  const H = 0.75 * PROP;
  const R = 0.38 * PROP;
  const wood = woodTex('#a8743f', '#6e4520', 10, [4, 1]);
  const inner = useMemo(() => new THREE.MeshToonMaterial({ map: wood, color: '#b0a090', gradientMap: RAMP, side: THREE.BackSide }), [wood]);
  return (
    <group>
      {/* 1) primitive bucket: open wall, bottom, iron hoops, rim, handle */}
      <group position={[0, H / 2, 0]} scale={[R, H, R]}>
        <Tx geometry={bucketWall} map={wood} line={3} />
        <mesh geometry={bucketWall} material={inner} />
      </group>
      <Toon geometry={G.cyl} color="#8a5a2e" position={[0, 0.04, 0]} scale={[R * 0.8, 0.08, R * 0.8]} line={2} />
      {[0.12, 0.88].map((k) => {
        const r = R * (0.8 + 0.2 * k) + 0.02;
        return <Toon key={k} geometry={rimGeo} color="#4f545e" position={[0, H * k, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[r, r, r]} line={2} />;
      })}
      <Limb root={[-R, H * 0.9, 0]} tip={[R, H * 0.9, 0]} length={R * 3.2} bendDir={[0, 1, 0]} radius={0.02} color="#4f545e" />
      {/* 2) solid fill (tail colour, tail lines on top) up to just under the rim */}
      <Filler geometry={new THREE.CylinderGeometry(0.96 * (0.8 + 0.2 * 0.9), 0.95 * 0.8, 0.9, 32)} position={[0, H * 0.45, 0]} scale={[R, H, R]} />
      {/* 3) loose tails on top, several hanging over the rim */}
      {Array.from({ length: 14 }).map((_, i) => {
        const a = i * 2.4;
        const r0 = R * 0.15 + (i % 4) * R * 0.18;
        const y0 = H * 0.86 + (i % 3) * 0.04;
        const x = Math.cos(a) * r0;
        const z = Math.sin(a) * r0;
        if (i % 3 === 0) {
          // drapes over the rim and hangs down outside
          const ox = Math.cos(a) * (R + 0.06);
          const oz = Math.sin(a) * (R + 0.06);
          return <TailCurve key={i} pts={[[x, y0, z], [ox * 0.95, H + 0.08, oz * 0.95], [ox * 1.05, H - 0.15, oz * 1.05], [ox * 1.1, H - 0.45, oz * 1.1]]} />;
        }
        return <TailCurve key={i} pts={[[x, y0, z], [x + Math.cos(a + 1.5) * 0.15, y0 + 0.06, z + Math.sin(a + 1.5) * 0.15], [x + Math.cos(a + 2.5) * 0.25, y0 + 0.02, z + Math.sin(a + 2.5) * 0.25]]} />;
      })}
    </group>
  );
};

const TailSack: React.FC = () => {
  const map = burlap('#c2a172');
  const mats = useMemo(
    () => [new THREE.MeshToonMaterial({ map, gradientMap: RAMP, side: THREE.FrontSide }), new THREE.MeshToonMaterial({ map, color: '#9a8060', gradientMap: RAMP, side: THREE.BackSide })],
    [map],
  );
  const S = PROP * 1.1;
  return (
    <group scale={S}>
      <mesh geometry={sackGeo} material={mats[0]} />
      <mesh geometry={sackGeo} material={mats[1]} />
      <mesh geometry={sackGeo} material={outline(3)} />
      <Tx geometry={plane} map={labelTex('sack-tails', [{ text: 'QUEUES', size: 80 }, { text: '× 500', size: 70, color: '#a3241f' }], '#efe2c4', '#5a3a1e', 256, 256)} position={[0, 0.5, 0.585]} scale={[0.42, 0.36, 1]} line={0} />
      {/* solid fill following the sack's inside, slightly domed on top */}
      <Filler geometry={sackFillGeo} />
      {/* loose tails on top of the fill */}
      {Array.from({ length: 22 }).map((_, i) => {
        const a = i * 2.39;
        const r = 0.05 + (i % 5) * 0.08;
        const y = 0.95 + (0.4 - r) * 0.25;
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        if (i % 5 === 0)
          return <TailCurve key={i} r={0.025} pts={[[x, y, z], [Math.cos(a) * 0.5, 1.1, Math.sin(a) * 0.5], [Math.cos(a) * 0.6, 0.9, Math.sin(a) * 0.6], [Math.cos(a) * 0.62, 0.65, Math.sin(a) * 0.62]]} />;
        return <TailCurve key={i} r={0.025} pts={[[x, y, z], [x + Math.cos(a + 1.4) * 0.16, y + 0.05, z + Math.sin(a + 1.4) * 0.16], [x + Math.cos(a + 2.6) * 0.26, y + 0.01, z + Math.sin(a + 2.6) * 0.26]]} />;
      })}
    </group>
  );
};

/** Heap of tails: each tail is a short random walk lying on (or inside) a mound, random directions. */
const TailPile: React.FC = () => {
  const R = 1.0 * PROP;
  const H = 0.75 * PROP;
  const mound = (r: number) => H * Math.max(0, 1 - (r / R) ** 2);
  const rnd = (n: number) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const moundGeo = useMemo(() => {
    const prof: THREE.Vector2[] = [];
    for (let k = 0; k <= 12; k++) {
      const r = (R * 0.92 * (12 - k)) / 12;
      prof.push(new THREE.Vector2(r, mound(r) * 0.85 + 0.01));
    }
    return new THREE.LatheGeometry(prof, 40);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <group>
      {/* solid body of the heap (tail colour, tail lines), tails lie on top of it */}
      <Filler geometry={moundGeo} />
      {Array.from({ length: 120 }).map((_, i) => {
        let a = rnd(i) * Math.PI * 2;
        let r = Math.sqrt(rnd(i + 500)) * R * 0.95;
        let dir = rnd(i + 900) * Math.PI * 2;
        const depth = 0.55 + 0.45 * rnd(i + 1300); // 1 = on the surface, less = buried inside
        const pts: V3[] = [];
        let x = Math.cos(a) * r;
        let z = Math.sin(a) * r;
        for (let k = 0; k < 5; k++) {
          r = Math.hypot(x, z);
          pts.push([x, Math.max(0.03, mound(Math.min(r, R)) * depth) + 0.03, z]);
          dir += (rnd(i * 7 + k) - 0.5) * 1.6;
          x += Math.cos(dir) * 0.14;
          z += Math.sin(dir) * 0.14;
          a = Math.atan2(z, x);
        }
        return <TailCurve key={i} pts={pts} />;
      })}
    </group>
  );
};

const TailCrate: React.FC = () => {
  const wood = woodTex('#b9864e', '#7a5028', 5);
  return (
    <group>
      <Tx geometry={box} map={wood} position={[0, 0.55, 0]} scale={[1.4, 1.1, 1.0]} />
      <Tx geometry={plane} map={labelTex('crate', [{ text: 'QUEUES DE RATS', size: 46 }, { text: 'NE PAS OUVRIR', size: 40, color: '#a3241f' }], '#e9d6a6', '#3a2a1a', 512, 256)} position={[0, 0.6, 0.51]} scale={[1.1, 0.55, 1]} line={0} />
      {[-0.6, 0.6].map((x) => (
        <Toon key={x} geometry={G.box} color="#7a5028" position={[x, 0.55, 0.51]} scale={[0.1, 1.1, 0.04]} line={2} />
      ))}
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

/** Rice sack: plump body (lathe), tied corners ("ears"), seam, burlap weave, stitched label. */
const riceGeo = (() => {
  const prof = [[0, 0], [0.38, 0.02], [0.5, 0.15], [0.54, 0.45], [0.5, 0.78], [0.38, 0.92], [0.12, 0.98], [0, 0.99]].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(prof, 32);
  g.scale(1, 1, 0.68); // flattened front-to-back like a filled sack
  return g;
})();
const RiceSack: React.FC = () => {
  const map = burlap('#d9c39a');
  const mat = useMemo(() => new THREE.MeshToonMaterial({ map, gradientMap: RAMP }), [map]);
  const S = PROP * 1.3;
  return (
    <group scale={S}>
      <mesh geometry={riceGeo} material={mat} />
      <mesh geometry={riceGeo} material={outline(3)} />
      {/* tied corners */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.4, 0.88, 0]} rotation={[0, 0, -s * 0.9]}>
          <Toon geometry={G.cone} color="#d9c39a" scale={[0.09, 0.2, 0.07]} line={2} />
          <Toon geometry={G.torus} color="#7a5a32" position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.07, 0.06, 0.2]} line={1} />
        </group>
      ))}
      {/* top seam with stitches */}
      <Toon geometry={G.box} color="#c8b088" position={[0, 0.97, 0]} scale={[0.85, 0.04, 0.06]} line={2} />
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} geometry={G.stick} material={flat('#6b4a2a')} position={[-0.36 + i * 0.09, 0.97, 0.035]} rotation={[0, 0, 0.6]} scale={[0.006, 0.03, 0.006]} />
      ))}
      {/* stitched label patch */}
      <Tx geometry={plane} map={labelTex('rice', [{ text: 'GẠO', size: 120 }, { text: 'riz · 50 kg', size: 46, font: '600' }], '#f3e8cf', '#7a2a24', 256, 256)} position={[0, 0.48, 0.37]} scale={[0.46, 0.46, 1]} line={0} />
      {/* a few spilled grains */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} geometry={G.sphere} material={flat('#f6f0de')} position={[0.3 + (i % 5) * 0.05, 0.012, 0.35 + Math.floor(i / 5) * 0.05]} scale={[0.012, 0.008, 0.02]} />
      ))}
    </group>
  );
};

/* ---------------- street ---------------- */

/** Cast-iron manhole: square stone frame in the pavement, round cover with relief rings,
 * radial ribs, pick holes and big readable embossed text. */
const manholeTex = canvasTex('manhole-top', 1024, 1024, (g, w) => {
  const cx = w / 2;
  g.fillStyle = '#34373f';
  g.beginPath();
  g.arc(cx, cx, cx, 0, Math.PI * 2);
  g.fill();
  // only ONE outer relief ring and two pick holes — nothing behind the text
  g.strokeStyle = '#4f5460';
  g.lineWidth = 22;
  g.beginPath();
  g.arc(cx, cx, cx * 0.9, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = '#121418';
  for (const a of [0, Math.PI]) {
    g.beginPath();
    g.ellipse(cx + Math.cos(a) * cx * 0.76, cx, 30, 16, 0, 0, Math.PI * 2);
    g.fill();
  }
  // big high-contrast text, thick dark outline
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.lineJoin = 'round';
  for (const [t, y, sz] of [['ÉGOUTS', cx - 95, 190], ['HANOI', cx + 90, 150], ['1902', cx + 225, 90]] as [string, number, number][]) {
    g.font = `900 ${sz}px Arial Black, Arial, sans-serif`;
    g.lineWidth = sz * 0.12;
    g.strokeStyle = '#0b0c0f';
    g.strokeText(t, cx, y, w * 0.8);
    g.fillStyle = '#f2ead8';
    g.fillText(t, cx, y, w * 0.8);
  }
});
const Manhole: React.FC = () => {
  const mat = useMemo(() => new THREE.MeshToonMaterial({ map: manholeTex, gradientMap: RAMP }), []);
  const R = 0.62 * PROP;
  return (
    <group>
      {/* square stone frame set into the pavement */}
      <Tx geometry={box} map={canvasTex('stone', 64, 64, (g) => { g.fillStyle = '#9a958a'; g.fillRect(0, 0, 64, 64); g.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 40; i++) g.fillRect((i * 37) % 64, (i * 23) % 64, 3, 3); })} position={[0, 0.03, 0]} scale={[R * 2.25, 0.06, R * 2.25]} line={3} />
      {/* iron ring frame */}
      <Toon geometry={rimGeo} color="#2f333c" position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} scale={R * 1.02} line={2} />
      {/* cover */}
      <Toon geometry={G.cyl} color="#3d414b" position={[0, 0.08, 0]} scale={[R, 0.05, R]} line={3} />
      <mesh geometry={G.disc} material={mat} position={[0, 0.106, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={R * 0.99} />
    </group>
  );
};

const Rickshaw: React.FC = () => {
  const wood = woodTex('#7a2a24', '#4a1612', 3);
  const WR = 1.35; // wheel radius: wheel top near the characters' waist (like real ~1.2 m wheels)
  const seat = BODY.hip; // seat at hip height of a standing character
  return (
    <group>
      <Tx geometry={box} map={wood} position={[0, seat, -0.25]} scale={[1.8, 0.4, 1.3]} />
      <Toon geometry={G.box} color="#c8302c" position={[0, seat + 0.55, -0.85]} rotation={[-0.2, 0, 0]} scale={[1.75, 1.05, 0.14]} line={3} />
      <Toon geometry={G.hemi} color="#2a2420" position={[0, seat + 1.05, -0.7]} rotation={[-1.2, 0, 0]} scale={[0.98, 1.05, 0.72]} />
      <Toon geometry={G.box} color="#4a1612" position={[0, seat - 0.55, 0.5]} rotation={[0.5, 0, 0]} scale={[1.6, 0.08, 0.7]} line={2} />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 1.05, WR, 0]} rotation={[0, Math.PI / 2, 0]}>
          <Toon geometry={G.torus} color="#2a2420" scale={[WR, WR, 0.3]} line={3} />
          {Array.from({ length: 10 }).map((_, i) => (
            <mesh key={i} geometry={G.stick} material={wireMat} rotation={[0, 0, (i / 10) * Math.PI]} scale={[0.025, WR * 0.95, 0.025]} />
          ))}
          <Toon geometry={G.cyl} color="#d9b44a" rotation={[Math.PI / 2, 0, 0]} scale={[0.13, 0.3, 0.13]} line={2} />
        </group>
      ))}
      <Toon geometry={G.cyl} color="#2a2420" position={[0, WR, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.05, 2.1, 0.05]} line={2} />
      {/* shafts: from the seat forward and down, front tips resting on the ground */}
      {[-1, 1].map((s) => {
        const a = new THREE.Vector3(s * 0.75, seat - 0.15, 0.3);
        const b = new THREE.Vector3(s * 0.62, 0.08, 3.6);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const len = a.distanceTo(b);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
        const e = new THREE.Euler().setFromQuaternion(q);
        return <Tx key={s} geometry={G.cyl} map={woodTex('#b9864e', '#7a5028', 6)} position={mid.toArray() as V3} rotation={[e.x, e.y, e.z]} scale={[0.06, len, 0.06]} line={3} />;
      })}
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

const fit = (C: React.FC): React.FC => () => (
  <GroundFit>
    <C />
  </GroundFit>
);

export const OBJECTS: Obj[] = [
  { id: 'notebook', name: 'Блокнот инспектора', status: 'approved', source: 'code', C: fit(Notebook) },
  { id: 'magnifier', name: 'Лупа', status: 'approved', source: 'code', C: fit(Magnifier) },
  { id: 'poster', name: 'Плакат «Награда за хвост»', status: 'approved', source: 'code', C: fit(Poster) },
  { id: 'desk', name: 'Стол чиновника (журнал, монеты, чернильница)', status: 'approved', source: 'code', C: fit(Desk) },
  { id: 'ledger', name: 'Журнал учёта хвостов', status: 'approved', source: 'code', C: fit(() => <Ledger />) },
  { id: 'coins', name: 'Мешок денег (ваша модель) и монеты', status: 'approved', source: 'code', C: fit(CoinPouch) },
  { id: 'bucket', name: 'Ведро с хвостами', status: 'approved', source: 'code', C: fit(TailBucket) },
  { id: 'sack', name: 'Мешок хвостов', status: 'approved', source: 'code', C: fit(TailSack) },
  { id: 'pile', name: 'Гора хвостов', status: 'approved', source: 'code', C: fit(TailPile) },
  { id: 'crate', name: 'Ящик «QUEUES DE RATS»', status: 'approved', source: 'code', C: fit(TailCrate) },
  { id: 'trap', name: 'Ловушка-клетка с крысой', status: 'approved', source: 'code', C: fit(() => <CageTrap />) },
  { id: 'scissors', name: 'Ножницы ловца', status: 'approved', source: 'code', C: fit(Scissors) },
  { id: 'farm', name: 'Стеллаж крысиной фермы', status: 'approved', source: 'code', C: fit(FarmCages) },
  { id: 'rice', name: 'Мешок риса «GẠO»', status: 'approved', source: 'code', C: fit(RiceSack) },
  { id: 'manhole', name: 'Люк «ÉGOUTS HANOI»', status: 'approved', source: 'code', C: fit(Manhole) },
  { id: 'rickshaw', name: 'Рикша', status: 'approved', source: 'code', C: fit(Rickshaw) },
  { id: 'lantern', name: 'Фонарь с красным фонариком', status: 'approved', source: 'code', C: fit(Lantern) },
];
export { Model };
