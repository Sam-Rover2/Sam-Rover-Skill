/**
 * New film (v2), built like the reference films: every shot is a small, bright DIORAMA
 * (a corner of a room / street) built for that framing, characters large in frame,
 * saturated colours and coloured light. This file: stage, lights, sets, textures.
 */
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { useLayoutEffect } from 'react';
import * as THREE from 'three';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { InkPass } from './InkPass';
import { G } from '../lib/geometry';
import { canvasTex, plasterTex, stoneTex, woodTex } from '../lib/tex';
import { Toon, type V3 } from '../lib/Toon';
import { keys, smooth } from '../lib/anim';
import { Glow, Tx, box, brickTex, plane } from '../locations/kit';

export type { V3 };

/* ---------------- camera ---------------- */
/** Minimum lens angle (vertical fov): the reference films use a wide lens close to the subject. */
const WIDE = 60;
export interface Frame {
  pos: V3;
  target: V3;
  fov?: number;
  /** Width (scene units) at the target that must stay in frame — in a vertical frame the camera backs off until it fits (QA-040). */
  fit?: number;
}
/** Default width that must stay in frame: two characters side by side. */
const FIT = 5.8;
/** Camera that eases from frame a to frame b over the shot (0..1). */
const Rig: React.FC<{ a: Frame; b: Frame; k: number }> = ({ a, b, k }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  useLayoutEffect(() => {
    const p = keys(k, [[0, a.pos], [1, b.pos]], smooth);
    const tg = keys(k, [[0, a.target], [1, b.target]], smooth);
    const f0 = keys(k, [[0, a.fov ?? 40], [1, b.fov ?? a.fov ?? 40]], smooth);
    // wide lens like the references: same subject size, camera closer, wider angle
    const f = Math.max(f0, WIDE);
    let m = Math.tan((f0 * Math.PI) / 360) / Math.tan((f * Math.PI) / 360);
    // keep the required width in frame whatever the aspect (vertical 9:16 or wide 16:9)
    const aspect = size.width / Math.max(1, size.height);
    const d = Math.hypot(p[0] - tg[0], p[1] - tg[1], p[2] - tg[2]) * m;
    const fit = keys(k, [[0, a.fit ?? FIT], [1, b.fit ?? a.fit ?? FIT]], smooth);
    const halfW = Math.tan((f * Math.PI) / 360) * aspect;
    const need = fit / 2 / halfW;
    if (need > d) m *= need / d;
    // wide 16:9: a little more air above the heads
    if (aspect > 1) m *= 1.22;
    camera.aspect = aspect;
    camera.position.set(tg[0] + (p[0] - tg[0]) * m, tg[1] + (p[1] - tg[1]) * m, tg[2] + (p[2] - tg[2]) * m);
    camera.lookAt(tg[0], tg[1], tg[2]);
    camera.fov = f;
    camera.near = 0.1;
    camera.far = 400;
    camera.updateProjectionMatrix();
  });
  return null;
};

/* ---------------- light presets ---------------- */
export interface Light {
  bg: string;
  amb: [string, number];
  hemi: [string, string, number];
  key: [string, number, V3];
  fog?: [string, number, number];
}
export const LIGHT = {
  day: { bg: '#9fd3f5', amb: ['#fff4e2', 1.0], hemi: ['#cfeaff', '#f0c890', 0.7], key: ['#fff0d0', 2.3, [-8, 14, 10]] },
  office: { bg: '#f3e2c0', amb: ['#fff1dc', 1.05], hemi: ['#fff6e6', '#d8a070', 0.6], key: ['#ffe9c4', 2.1, [6, 12, 10]] },
  sewer: { bg: '#0b1712', amb: ['#7fb39a', 0.8], hemi: ['#6fd0a8', '#2a4434', 0.6], key: ['#ffd89a', 1.2, [4, 10, 8]], fog: ['#0b1712', 14, 55] },
  night: { bg: '#121a44', amb: ['#5c6cd0', 1.0], hemi: ['#7d8cff', '#20264a', 0.6], key: ['#a8b6ff', 1.4, [8, 16, 6]], fog: ['#121a44', 20, 70] },
  sunset: { bg: '#f7a66b', amb: ['#ffd6b8', 1.05], hemi: ['#ffc59a', '#c9733c', 0.6], key: ['#ffa860', 2.4, [12, 8, 10]], fog: ['#f7a66b', 30, 110] },
} satisfies Record<string, Light>;

export interface Lamp {
  pos: V3;
  color: string;
  power?: number;
  dist?: number;
}

/**
 * ONE canvas for the whole film (no flash of an empty background at the cuts):
 * shots only swap what is inside it.
 */
export const FilmCanvas: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height, fps } = useVideoConfig();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} linear={false}>
        <InkPass seed={Math.floor((frame * 12) / fps) % 8} />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** One shot: light preset, extra lamps, camera move a→b (k = progress 0..1). Lives inside FilmCanvas. */
export const Shot: React.FC<{ light: Light; a: Frame; b?: Frame; k: number; lamps?: Lamp[]; children: React.ReactNode }> = ({ light, a, b, k, lamps = [], children }) => {
  return (
    <>
        <color attach="background" args={[light.bg]} />
        <Rig a={a} b={b ?? a} k={k} />
        {light.fog && <fog attach="fog" args={light.fog} />}
        <ambientLight color={light.amb[0]} intensity={light.amb[1]} />
        <hemisphereLight args={[light.hemi[0], light.hemi[1], light.hemi[2]]} />
        <directionalLight color={light.key[0]} intensity={light.key[1]} position={light.key[2]} />
        {lamps.map((l, i) => (
          <pointLight key={i} position={l.pos} color={l.color} intensity={l.power ?? 30} distance={l.dist ?? 18} decay={1.6} />
        ))}
        {children}
    </>
  );
};

/* ---------------- textures ---------------- */
export const checkerTex = (a: string, b: string, repeat: [number, number]) =>
  canvasTex(`checker-${a}-${b}-${repeat}`, 256, 256, (g, w, h) => {
    for (let y = 0; y < 2; y++)
      for (let x = 0; x < 2; x++) {
        g.fillStyle = (x + y) % 2 ? a : b;
        g.fillRect((x * w) / 2, (y * h) / 2, w / 2, h / 2);
      }
    g.strokeStyle = 'rgba(0,0,0,.12)';
    g.lineWidth = 3;
    g.strokeRect(0, 0, w, h);
  }, repeat);

export const stripeTex = (a: string, b: string, repeat: [number, number]) =>
  canvasTex(`stripe-${a}-${b}-${repeat}`, 256, 256, (g, w, h) => {
    g.fillStyle = a;
    g.fillRect(0, 0, w, h);
    g.fillStyle = b;
    for (let i = 0; i < 4; i++) g.fillRect(i * 64 + 20, 0, 22, h);
    g.fillStyle = 'rgba(255,255,255,.18)';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) g.fillRect(i * 64 + 52, j * 64 + 28, 6, 6);
  }, repeat);

/** Big flat sign/poster: lines of text on a coloured card. */
export const cardTex = (key: string, lines: { t: string; size: number; color?: string; font?: string }[], bg: string, border = '#1b1b1f', w = 512, h = 640) =>
  canvasTex(`card-${key}`, w, h, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = border;
    g.lineWidth = 14;
    g.strokeRect(14, 14, w - 28, h - 28);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const total = lines.reduce((s, l) => s + l.size * 1.25, 0);
    let y = h / 2 - total / 2;
    for (const l of lines) {
      g.font = `${l.font ?? '900'} ${l.size}px Georgia, serif`;
      g.fillStyle = l.color ?? '#1b1b1f';
      g.fillText(l.t, w / 2, y + (l.size * 1.25) / 2, w - 60);
      y += l.size * 1.25;
    }
  });

/* ---------------- set pieces ---------------- */

/** A room corner: floor, back wall, side wall (left or right), wainscot and skirting. */
export const Room: React.FC<{
  w?: number;
  d?: number;
  h?: number;
  floor: THREE.Texture;
  wall: THREE.Texture;
  side?: -1 | 1 | 0;
  wainscot?: string;
  sideWall?: THREE.Texture;
  /** closed room: both side walls and a front wall far behind the camera, so no view ever shows the edge of the world (QA-041) */
  closed?: boolean;
  ceiling?: string;
  front?: number;
}> = ({ w = 22, d = 18, h = 12, floor, wall, side = -1, wainscot, sideWall, closed, ceiling, front = 26 }) => {
  const zb = -d / 2;
  const zf = closed ? front : d / 2;
  const L = zf - zb;
  const zc = (zb + zf) / 2;
  const sides: number[] = closed ? [-1, 1] : side ? [side] : [];
  return (
    <group>
      <Tx geometry={box} map={floor} position={[0, -0.25, zc]} scale={[w, 0.5, L]} line={0} />
      <Tx geometry={box} map={wall} position={[0, h / 2, zb]} scale={[w, h, 0.4]} line={0} />
      {sides.map((sd) => (
        <Tx key={sd} geometry={box} map={sideWall ?? wall} position={[(sd * w) / 2, h / 2, zc]} scale={[0.4, h, L]} line={0} />
      ))}
      {closed && <Tx geometry={box} map={sideWall ?? wall} position={[0, h / 2, zf]} scale={[w, h, 0.4]} line={0} />}
      {ceiling && <Toon geometry={G.box} color={ceiling} position={[0, h + 0.2, zc]} scale={[w, 0.4, L]} line={0} />}
      {wainscot && (
        <>
          <Toon geometry={G.box} color={wainscot} position={[0, 1.4, zb + 0.3]} scale={[w, 2.8, 0.2]} line={2} />
          <Toon geometry={G.box} color="#f4ead6" position={[0, 2.85, zb + 0.36]} scale={[w, 0.18, 0.18]} line={2} />
          {sides.map((sd) => (
            <Toon key={sd} geometry={G.box} color={wainscot} position={[(sd * w) / 2 - sd * 0.3, 1.4, zc]} scale={[0.2, 2.8, L]} line={2} />
          ))}
          {closed && <Toon geometry={G.box} color={wainscot} position={[0, 1.4, zf - 0.3]} scale={[w, 2.8, 0.2]} line={2} />}
        </>
      )}
    </group>
  );
};

/** A picture/sign hung on the back wall. */
export const WallCard: React.FC<{ map: THREE.Texture; pos: V3; size: [number, number]; frame?: string; rot?: V3 }> = ({ map, pos, size, frame = '#5a3a24', rot }) => (
  <group position={pos} rotation={rot}>
    <Toon geometry={G.box} color={frame} scale={[size[0] + 0.3, size[1] + 0.3, 0.12]} line={3} />
    <Tx geometry={plane} map={map} position={[0, 0, 0.07]} scale={[size[0], size[1], 1]} line={0} />
  </group>
);

/** Window with shutters on a facade. */
export const ShutterWindow: React.FC<{ pos: V3; lit?: boolean; color?: string }> = ({ pos, lit, color = '#2f7d5b' }) => (
  <group position={pos}>
    <Toon geometry={G.box} color="#f3ead6" scale={[2.2, 3.2, 0.2]} line={3} />
    <Glow geometry={plane} color={lit ? '#ffd27a' : '#3a4a5e'} position={[0, 0, 0.12]} scale={[1.7, 2.7, 1]} />
    <Toon geometry={G.box} color="#f3ead6" position={[0, 0, 0.16]} scale={[0.1, 2.7, 0.06]} line={1} />
    {[-1, 1].map((s) => (
      <Toon key={s} geometry={G.box} color={color} position={[s * 1.55, 0, 0.18]} scale={[0.85, 2.9, 0.1]} line={3} />
    ))}
    <Toon geometry={G.box} color="#e8d9b8" position={[0, -1.75, 0.25]} scale={[2.6, 0.18, 0.5]} line={2} />
  </group>
);

/** Hanging paper lantern (glowing). */
export const PaperLantern: React.FC<{ pos: V3; color?: string }> = ({ pos, color = '#e84a3a' }) => (
  <group position={pos}>
    <Toon geometry={G.cyl} color="#2a2420" position={[0, 0.75, 0]} scale={[0.03, 0.8, 0.03]} line={0} />
    <Toon geometry={G.sphere} color={color} scale={[0.42, 0.55, 0.42]} line={3} />
    <Toon geometry={G.cyl} color="#d9b44a" position={[0, 0.55, 0]} scale={[0.2, 0.08, 0.2]} line={2} />
    <Toon geometry={G.cyl} color="#d9b44a" position={[0, -0.55, 0]} scale={[0.2, 0.08, 0.2]} line={2} />
  </group>
);

/** Potted palm / plant. */
export const Plant: React.FC<{ pos: V3; s?: number }> = ({ pos, s = 1 }) => (
  <group position={pos} scale={s}>
    <Toon geometry={G.pot} color="#c8643c" position={[0, 0.5, 0]} scale={[0.55, 1, 0.55]} line={3} />
    {Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2;
      return <Toon key={i} geometry={G.sphere} color={i % 2 ? '#3f9a4a' : '#4fb35a'} position={[Math.sin(a) * 0.55, 1.7 + (i % 3) * 0.2, Math.cos(a) * 0.55]} rotation={[Math.cos(a) * 0.7, 0, -Math.sin(a) * 0.7]} scale={[0.22, 0.9, 0.4]} line={2} />;
    })}
  </group>
);

/** Brick tunnel section along −z (vault, walkways, water). */
export const Tunnel: React.FC<{ len?: number }> = ({ len = 70 }) => {
  const R = 8.5;
  const vault = new THREE.CylinderGeometry(R, R, len, 36, 1, true, -Math.PI / 2, Math.PI);
  vault.rotateX(Math.PI / 2);
  return (
    <group>
      <Tx geometry={vault} map={brickTex('#a3502f', '#5e4a3c', [24, 5])} position={[0, 1.2, -len / 2 + 6]} line={0} side={THREE.BackSide} />
      {Array.from({ length: 10 }, (_, i) => (
        <Toon key={i} geometry={new THREE.TorusGeometry(R - 0.05, 0.3, 8, 36, Math.PI)} color="#7a3a22" position={[0, 1.2, 4 - i * 7]} line={2} />
      ))}
      <Tx geometry={plane} map={canvasTex('sewer-water', 128, 128, (g, w, h) => {
        g.fillStyle = '#2f6a58';
        g.fillRect(0, 0, w, h);
        g.strokeStyle = 'rgba(160,230,200,.35)';
        g.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
          g.beginPath();
          g.moveTo(10 + i * 20, 0);
          g.bezierCurveTo(30 + i * 20, 40, -10 + i * 20, 80, 10 + i * 20, 128);
          g.stroke();
        }
      }, [2, 12])} position={[0, -0.7, -len / 2 + 6]} rotation={[-Math.PI / 2, 0, 0]} scale={[6, len, 1]} line={0} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Tx geometry={box} map={stoneTex('#9a9384', [3, 30], 32)} position={[s * 5.6, 0.1, -len / 2 + 6]} scale={[5.2, 1.0, len]} line={0} />
          <Toon geometry={G.box} color="#6f6a60" position={[s * 3.1, 0.62, -len / 2 + 6]} scale={[0.3, 0.2, len]} line={2} />
          <Toon geometry={G.cyl} color={s < 0 ? '#5f6774' : '#7a5a3a'} position={[s * 7.4, 3.6, -len / 2 + 6]} rotation={[Math.PI / 2, 0, 0]} scale={[0.45, len, 0.45]} line={3} />
        </group>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} position={[(i % 2 ? 1 : -1) * 7.6, 4.8, 1 - i * 9]}>
          <Toon geometry={G.box} color="#2a2420" scale={[0.6, 0.8, 0.6]} line={3} />
          <Glow geometry={G.sphere} color="#ffd27a" scale={0.26} />
          <Glow geometry={G.sphere} color="#ffcf70" opacity={0.16} scale={1.5} />
        </group>
      ))}
    </group>
  );
};

/** Balcony with a railing (bars) under a window. */
const Balcony: React.FC<{ pos: V3; w?: number }> = ({ pos, w = 3 }) => (
  <group position={pos}>
    <Toon geometry={G.box} color="#e8d9b8" scale={[w, 0.25, 1.1]} line={2} />
    <Toon geometry={G.box} color="#2b2b33" position={[0, 0.95, 0.5]} scale={[w, 0.08, 0.08]} line={1} />
    {Array.from({ length: Math.round(w * 3) }, (_, i) => (
      <Toon key={i} geometry={G.box} color="#2b2b33" position={[-w / 2 + 0.17 + i * 0.33, 0.5, 0.5]} scale={[0.05, 0.85, 0.05]} line={0} />
    ))}
  </group>
);

/** Open Vietnamese shop: counter, shelves of jars and boxes, hanging goods, warm light inside. */
const Shop: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos}>
    {/* dark interior with shelves */}
    <Toon geometry={G.box} color="#6a3a22" position={[0, 2.3, -0.3]} scale={[6.4, 4.6, 0.2]} line={2} />
    {[1.2, 2.4, 3.6].map((y) => (
      <group key={y}>
        <Toon geometry={G.box} color="#8e5d33" position={[0, y, 0]} scale={[6, 0.12, 0.6]} line={2} />
        {Array.from({ length: 9 }, (_, i) => (
          <Toon key={i} geometry={i % 3 ? G.cyl : G.box} color={['#e84a3a', '#f2b233', '#5fa58f', '#f4ead6', '#3f6fd8'][(i + Math.round(y)) % 5]} position={[-2.6 + i * 0.65, y + 0.32, 0.05]} scale={i % 3 ? [0.2, 0.5, 0.2] : [0.45, 0.5, 0.35]} line={2} />
        ))}
      </group>
    ))}
    {/* counter with rice baskets */}
    <Toon geometry={G.box} color="#a8743c" position={[0, 0.6, 1.4]} scale={[5.6, 1.2, 0.9]} line={3} />
    {[-1.8, 0, 1.8].map((x, i) => (
      <group key={x} position={[x, 1.25, 1.4]}>
        <Toon geometry={G.cup} color="#c9a05a" scale={[0.55, 0.35, 0.55]} line={2} />
        <Toon geometry={G.hemi} color={['#f4ead6', '#d9a94e', '#7fae4a'][i]} position={[0, 0.15, 0]} scale={[0.5, 0.25, 0.5]} line={1} />
      </group>
    ))}
    {/* frame + hanging lanterns and goods */}
    {[-1, 1].map((sd) => (
      <Toon key={sd} geometry={G.box} color="#7a3a22" position={[sd * 3.3, 2.3, 0.6]} scale={[0.35, 4.6, 0.35]} line={3} />
    ))}
    <Toon geometry={G.box} color="#7a3a22" position={[0, 4.7, 0.6]} scale={[7, 0.35, 0.35]} line={3} />
    <PaperLantern pos={[-2, 3.9, 1.0]} />
    <PaperLantern pos={[2, 3.9, 1.0]} color="#f2b233" />
    <Tx geometry={box} map={stripeTex('#f4ead6', '#d9443a', [3, 1])} position={[0, 5.4, 1.6]} rotation={[0.5, 0, 0]} scale={[7.6, 2.2, 0.12]} line={3} />
  </group>
);

/** A three-storey colonial facade section: cornices, shuttered windows, balconies. */
const Facade: React.FC<{ x: number; w: number; color: string; shutter?: string; z?: number }> = ({ x, w, color, shutter = '#2f7d5b', z = -10.75 }) => {
  const n = Math.max(2, Math.round(w / 4));
  return (
    <group position={[x, 0, z]}>
      <Tx geometry={box} map={plasterTex(color, [2, 3])} position={[0, 11, -0.05]} scale={[w, 22, 0.3]} line={2} />
      {[6.2, 11.9, 17.6].map((y) => (
        <Toon key={y} geometry={G.box} color="#f4ead6" position={[0, y, 0.2]} scale={[w + 0.3, 0.35, 0.5]} line={2} />
      ))}
      <Toon geometry={G.box} color="#f4ead6" position={[0, 22.1, 0.25]} scale={[w + 0.6, 0.6, 0.8]} line={3} />
      {[8.8, 14.6, 19.9].map((y, row) =>
        Array.from({ length: n }, (_, i) => {
          const wx = -w / 2 + (w / n) * (i + 0.5);
          return (
            <group key={`${row}-${i}`}>
              <ShutterWindow pos={[wx, y, 0.15]} color={shutter} lit={(i + row) % 3 === 0} />
              {row === 0 && <Balcony pos={[wx, y - 1.9, 0.6]} w={2.8} />}
            </group>
          );
        }),
      )}
    </group>
  );
};

/** Hanoi street corner: three-storey colonial houses, an open shop, lanterns, wires, plants. */
export const StreetCorner: React.FC<{ sign?: boolean }> = ({ sign = true }) => (
  <group>
    <Room w={60} d={22} h={24} floor={stoneTex('#c9b48c', [20, 12], 32)} wall={plasterTex('#f2c14e', [8, 3])} side={0} closed front={30} sideWall={plasterTex('#e9b84a', [8, 3])} />
    <Toon geometry={G.box} color="#b98a3a" position={[0, 0.25, -10.4]} scale={[60, 0.5, 1.2]} line={2} />
    <Facade x={-15} w={14} color="#f2c14e" />
    <Facade x={0} w={16} color="#ef9fb0" shutter="#3a6fb0" z={-10.6} />
    <Facade x={15} w={14} color="#8fcbbd" shutter="#b8452f" />
    <Shop pos={[-1, 0, -9.9]} />
    {sign && <Tx geometry={plane} map={cardTex('hanoi-sign', [{ t: 'HÀ NỘI · 1902', size: 64, color: '#f2c94c' }], '#8a1c14', '#f2c94c', 640, 140)} position={[-1, 6.9, -9.3]} scale={[6.4, 1.4, 1]} line={0} />}
    {/* a shop sign on the left house and a lamp */}
    <Tx geometry={box} map={cardTex('pho-sign', [{ t: 'PHỞ', size: 120, color: '#f4ead6' }], '#2f7d5b', '#f4ead6', 360, 200)} position={[-13, 4.2, -10.2]} scale={[3.2, 1.8, 0.15]} line={3} />
    <Tx geometry={box} map={cardTex('tra-sign', [{ t: 'TRÀ', size: 120, color: '#8a1c14' }], '#f6e7b8', '#8a1c14', 360, 200)} position={[13, 4.2, -10.2]} scale={[3.2, 1.8, 0.15]} line={3} />
    {/* lantern wires across the street */}
    {[-9, -3, 3, 9].map((x, i) => (
      <PaperLantern key={x} pos={[x, 9.4 - (i % 2) * 0.3, -6]} color={i % 2 ? '#f2b233' : '#e84a3a'} />
    ))}
    <Toon geometry={G.cyl} color="#2a2420" position={[0, 10.2, -6]} rotation={[0, 0, Math.PI / 2]} scale={[0.025, 30, 0.025]} line={0} />
    <Plant pos={[-11, 0, -8.8]} s={1.6} />
    <Plant pos={[10.5, 0, -8.9]} s={1.4} />
    <Plant pos={[6.5, 0, -9.2]} s={1.1} />
  </group>
);

/** Office corner: patterned wallpaper, wood wainscot, French flag, clock. */
export const OfficeCorner: React.FC<{ flag?: boolean; side?: -1 | 1 | 0 }> = ({ flag = true, side = -1 }) => (
  <group>
    <Room w={30} d={20} h={13} floor={woodTex('#b0703c', '#7e4a24', 6, [4, 6])} wall={stripeTex('#5fa58f', '#4f907c', [6, 3])} side={side} wainscot="#7a4424" closed ceiling="#f4ead6" front={30} />
    {flag && (
      <group position={[7.5, 0, -9.5]}>
        <Toon geometry={G.cyl} color="#d9b44a" position={[0, 4, 0]} scale={[0.07, 8, 0.07]} line={2} />
        {['#2c4fa3', '#f4f1ea', '#d8342c'].map((c, i) => (
          <Toon key={c} geometry={G.box} color={c} position={[0.45 + i * 0.9, 6.9, 0]} scale={[0.9, 2, 0.05]} line={2} />
        ))}
      </group>
    )}
    {/* bookshelf, filing cabinet, window, rug, hat stand, ceiling lamp, plant */}
    <group position={[-11.2, 0, -9.3]}>
      <Toon geometry={G.box} color="#6a3a22" position={[0, 3.3, 0]} scale={[3.6, 6.6, 1.0]} line={3} />
      {[1.2, 2.8, 4.4, 6.0].map((y, r) =>
        Array.from({ length: 8 }, (_, i) => (
          <Toon key={`${r}${i}`} geometry={G.box} color={['#c8302c', '#2c4fa3', '#f2b233', '#3f8f73', '#7a3a22'][(i + r) % 5]} position={[-1.4 + i * 0.4, y + 0.1 + (i % 2) * 0.05, 0.4]} scale={[0.32, 1.05 + (i % 3) * 0.12, 0.6]} line={2} />
        )),
      )}
    </group>
    <group position={[11.4, 0, -8.8]}>
      <Toon geometry={G.box} color="#7d8a96" position={[0, 2.2, 0]} scale={[2.2, 4.4, 1.6]} line={3} />
      {[1.0, 2.2, 3.4].map((y) => (
        <Toon key={y} geometry={G.box} color="#d9b44a" position={[0, y, 0.82]} scale={[0.6, 0.12, 0.08]} line={1} />
      ))}
      <Plant pos={[0, 4.4, 0]} s={0.8} />
    </group>
    <group position={[14.8, 7.0, -2]} rotation={[0, -Math.PI / 2, 0]}>
      <Toon geometry={G.box} color="#f4ead6" scale={[4.2, 5.2, 0.25]} line={3} />
      <Glow geometry={plane} color="#bfe6ff" position={[0, 0, 0.14]} scale={[3.6, 4.6, 1]} />
      <Toon geometry={G.box} color="#f4ead6" position={[0, 0, 0.18]} scale={[0.12, 4.6, 0.06]} line={1} />
      <Toon geometry={G.box} color="#f4ead6" position={[0, 0, 0.18]} scale={[3.6, 0.12, 0.06]} line={1} />
    </group>
    <Toon geometry={G.cyl} color="#a8323a" position={[0, 0.02, 1.5]} scale={[6, 0.04, 4.2]} line={2} />
    <Toon geometry={G.cyl} color="#e0a83a" position={[0, 0.05, 1.5]} scale={[5.2, 0.02, 3.5]} line={0} />
    <group position={[-13.4, 0, -5]}>
      <Toon geometry={G.cyl} color="#4a2a18" position={[0, 2.6, 0]} scale={[0.08, 5.2, 0.08]} line={2} />
      <Toon geometry={G.hemi} color="#2a2420" position={[0, 5.2, 0]} scale={[0.5, 0.35, 0.5]} line={2} />
    </group>
    <group position={[0, 12.6, -1]}>
      <Toon geometry={G.cyl} color="#2a2420" position={[0, 0.6, 0]} scale={[0.03, 1.2, 0.03]} line={0} />
      <Toon geometry={G.cone} color="#2f7d5b" scale={[1.0, 0.7, 1.0]} line={3} />
      <Glow geometry={G.sphere} color="#fff1b8" position={[0, -0.35, 0]} scale={0.25} />
    </group>
    <group position={[-6, 9.5, -9.7]}>
      <Toon geometry={G.cyl} color="#f4ead6" rotation={[Math.PI / 2, 0, 0]} scale={[1.1, 0.15, 1.1]} line={4} />
      <Toon geometry={G.box} color="#1b1b1f" position={[0, 0.35, 0.1]} scale={[0.08, 0.7, 0.04]} line={0} />
      <Toon geometry={G.box} color="#1b1b1f" position={[0.25, 0, 0.1]} rotation={[0, 0, -1.2]} scale={[0.08, 0.5, 0.04]} line={0} />
    </group>
  </group>
);

/** Night alley: blue brick walls, warm lamp, open or closed manhole. */
export const AlleyCorner: React.FC = () => (
  <group>
    <Room w={26} d={20} h={13} floor={stoneTex('#5a6390', [8, 10], 32)} wall={brickTex('#4f5aa8', '#2c335e', [6, 4])} side={-1} sideWall={brickTex('#46509a', '#2c335e', [12, 4])} closed front={28} />
    <group position={[4, 6.5, -9.6]}>
      <Toon geometry={G.box} color="#2a2420" position={[0, 0.9, 0.4]} scale={[0.15, 0.15, 0.9]} line={2} />
      <Toon geometry={G.box} color="#2a2420" scale={[0.8, 1.1, 0.8]} line={3} />
      <Glow geometry={G.sphere} color="#ffcf70" scale={0.35} />
      <Glow geometry={G.sphere} color="#ffcf70" opacity={0.15} scale={2.2} />
    </group>
    {/* a few barrels and a crate */}
    {[[-8, -7.5], [-6.6, -8.2]].map(([x, z], i) => (
      <group key={i} position={[x, 0, z]}>
        <Tx geometry={G.cyl} map={woodTex('#7a5a3a', '#4e3a26', 8)} position={[0, 1.1, 0]} scale={[0.9, 2.2, 0.9]} line={3} />
        <Toon geometry={new THREE.TorusGeometry(1, 0.06, 8, 32)} color="#2a2a30" position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.93} line={0} />
        <Toon geometry={new THREE.TorusGeometry(1, 0.06, 8, 32)} color="#2a2a30" position={[0, 1.7, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.93} line={0} />
      </group>
    ))}
  </group>
);

/** Open manhole: dark hole, rim, and the cover pushed aside. */
export const OpenManhole: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos}>
    <Glow geometry={G.disc} color="#05060a" position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1.1} />
    <Toon geometry={new THREE.TorusGeometry(1, 0.09, 8, 40)} color="#2f333c" position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]} scale={1.18} line={2} />
    <group position={[1.9, 0.08, 0.9]} rotation={[0, 0.5, 0]}>
      <Toon geometry={G.cyl} color="#3d414b" scale={[1.15, 0.12, 1.15]} line={3} />
      {[-0.5, 0, 0.5].map((x) => (
        <Toon key={x} geometry={G.box} color="#2a2d35" position={[x, 0.07, 0]} scale={[0.12, 0.04, 1.6]} line={0} />
      ))}
    </group>
  </group>
);

/** Farm: bamboo shed with a thatched roof, sunset sky, rice field strip. */
export const FarmCorner: React.FC = () => (
  <group>
    <Tx geometry={box} map={stoneTex('#c9925a', [8, 8], 40)} position={[0, -0.25, 0]} scale={[60, 0.5, 40]} line={0} />
    <Toon geometry={G.box} color="#7fae4a" position={[0, 0.05, -18]} scale={[60, 0.2, 8]} line={0} />
    <Glow geometry={G.disc} color="#ffe2a0" position={[8, 9, -30]} scale={4} />
    {[-6, -2, 2, 6].map((x) =>
      [-8.5, -1.5].map((z) => <Toon key={`${x}${z}`} geometry={G.cyl} color="#b7a24a" position={[x, 4, z]} scale={[0.2, 8, 0.2]} line={2} />),
    )}
    <Toon geometry={G.box} color="#d9a94e" position={[0, 8.3, -5]} rotation={[0.18, 0, 0]} scale={[15, 0.5, 9]} line={4} />
  </group>
);
