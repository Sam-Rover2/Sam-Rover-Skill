/**
 * «Здание из 100 работников» — scene templates (Ink Diorama Toon, skill ink-toon).
 * Every shot of the film is one of these templates with its own params.
 * All poses change smoothly (sm/mixV), hands stay outside the body, rooms are closed.
 */
import * as THREE from 'three';
import { G } from '../lib/geometry';
import { canvasTex, plasterTex, stoneTex, woodTex } from '../lib/tex';
import { Toon } from '../lib/Toon';
import { clamp01, hash, lerp, smooth } from '../lib/anim';
import type { PersonPose } from '../rig/Person';
import { Who, mix, walkPose } from '../film/kit';
import { Glow, Tx, box, brickTex, plane } from '../locations/kit';
import { LIGHT, Plant, Room, Shot, WallCard, stripeTex, type Frame, type Light, type V3 } from '../movie/kit';

/* ------------------------------------------------------------------ helpers */
export const sm = (t: number, t0: number, t1 = t0 + 0.45) => smooth(clamp01((t - t0) / (t1 - t0)));
export const mixV = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const breathe = (t: number, s = 0): PersonPose => ({ hips: [0, Math.sin(t * 2.2 + s) * 0.03, 0] });

/** Calm "talking" hands: slow, never jerky (QA-043). */
export const talk = (t: number, s = 0, amt = 1): PersonPose => ({
  handR: [0.78 + 0.18 * Math.sin(t * 1.3 + s) * amt, 2.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.7 + s)) * amt, 0.55 + 0.25 * amt],
  handL: [-0.75, 2.0 + 0.12 * Math.sin(t * 1.1 + s + 1) * amt, 0.3 + 0.1 * amt],
});
export type Gesture = 'talk' | 'point' | 'shrug' | 'think' | 'cheer' | 'present' | 'still' | 'wave' | 'arms';
const gesturePose = (g: Gesture, t: number, s = 0): PersonPose => {
  switch (g) {
    case 'point':
      return { handR: [1.35, 3.6, 0.9], handL: [-0.72, 1.9, 0.25] };
    case 'shrug':
      return { handR: [1.25, 2.9, 0.6], handL: [-1.25, 2.9, 0.6] };
    case 'think':
      return { handR: [0.35, 3.0, 1.3], handL: [-0.6, 2.4, 0.9] };
    case 'cheer':
      return { handR: [1.5, 4.0 + Math.sin(t * 3.2) * 0.12, 0.5], handL: [-1.5, 4.0 + Math.sin(t * 3.2 + 1) * 0.12, 0.5] };
    case 'present':
      return { handR: [1.3, 2.7, 1.0], handL: [-0.72, 1.95, 0.25] };
    case 'wave':
      return { handR: [1.45, 3.9, 0.5 + Math.sin(t * 3.5) * 0.25], handL: [-0.72, 1.9, 0.2] };
    case 'arms':
      return { handR: [1.5, 3.6, 0.5], handL: [-1.5, 3.6, 0.5] };
    case 'still':
      return { handR: [0.72, 1.85, 0.2], handL: [-0.72, 1.85, 0.2] };
    default:
      return talk(t, s);
  }
};

/** A character whose gesture changes smoothly at given times: acts = [[t, gesture, face?], …]. */
export interface Actor {
  id: string;
  pos: V3;
  rotY?: number;
  acts?: [number, Gesture, PersonPose['face']?][];
  hold?: React.ReactNode;
  walk?: { t0: number; t1: number; from: V3 };
}
export const Act: React.FC<{ a: Actor; t: number; seed?: number }> = ({ a, t, seed = 0 }) => {
  const acts = a.acts ?? [[0, 'talk', 'smile']];
  let i = 0;
  for (let j = 0; j < acts.length; j++) if (t >= acts[j][0]) i = j;
  const cur = gesturePose(acts[i][1], t, seed);
  const prev = i > 0 ? gesturePose(acts[i - 1][1], t, seed) : cur;
  const k = i > 0 ? sm(t, acts[i][0], acts[i][0] + 0.45) : 1;
  const blend = (x?: V3, y?: V3) => (x && y ? mixV(x, y, k) : y ?? x);
  let face = acts[0][2] ?? 'smile';
  for (const [tt, , f] of acts) if (t >= tt && f) face = f;
  let pos = a.pos;
  let rot = a.rotY ?? 0;
  let wp: PersonPose = {};
  if (a.walk) {
    const u = clamp01((t - a.walk.t0) / (a.walk.t1 - a.walk.t0));
    const e = 1 - (1 - u) * (1 - u);
    const L = Math.hypot(a.pos[0] - a.walk.from[0], a.pos[2] - a.walk.from[2]);
    const speed = u <= 0 || u >= 1 ? 0 : (2 * (1 - u) * L) / (a.walk.t1 - a.walk.t0);
    pos = mixV(a.walk.from, a.pos, e);
    if (u < 1) rot = Math.atan2(a.pos[0] - a.walk.from[0], a.pos[2] - a.walk.from[2]) * (1 - sm(t, a.walk.t1 - 0.3, a.walk.t1)) + rot * sm(t, a.walk.t1 - 0.3, a.walk.t1);
    wp = walkPose((L * e) / 0.75 + seed, clamp01(speed / 1.4) * 0.9);
  }
  const moving = Object.keys(wp).length > 0 && (wp.lean ?? 0) > 0.01;
  return (
    <Who
      id={a.id}
      pos={pos}
      rotY={rot}
      pose={mix(breathe(t, seed), moving ? wp : {}, moving ? {} : { handR: blend(prev.handR, cur.handR), handL: blend(prev.handL, cur.handL) }, { face, holdR: a.hold })}
    />
  );
};

/* ------------------------------------------------------------------ textures */
/** A board / plate with lines of text; only the first `n` lines are drawn (reveal). */
export const boardTex = (lines: string[], n: number, o: { bg?: string; fg?: string; accent?: string; w?: number; h?: number; serif?: boolean } = {}) => {
  const { bg = '#244a36', fg = '#f4f1ea', accent = '#ffd34d', w = 768, h = 512, serif = false } = o;
  return canvasTex(`board-${bg}-${w}x${h}-${n}-${lines.join('|')}`, w, h, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const L = lines.length;
    const step = h / (L + 1);
    lines.forEach((ln, i) => {
      if (i >= n) return;
      const big = ln.startsWith('!');
      const txt = big ? ln.slice(1) : ln;
      const size = Math.min(big ? 96 : 60, step * (big ? 0.95 : 0.7), (w * 1.6) / Math.max(6, txt.length));
      g.font = `${big ? 900 : 700} ${size}px ${serif ? 'Georgia, serif' : 'Nunito, Arial, sans-serif'}`;
      g.fillStyle = big ? accent : fg;
      g.fillText(txt, w / 2, step * (i + 1), w - 40);
    });
  });
};
/** Reveal count: how many of the times have passed. */
export const revealed = (t: number, times: number[]) => times.filter((x) => t >= x).length;

/* ------------------------------------------------------------------ set pieces */
const Floor = () => <Tx geometry={box} map={woodTex('#b0703c', '#7e4a24', 6, [6, 8])} position={[0, -0.25, 6]} scale={[40, 0.5, 40]} line={0} />;

/** The model of the building (10 floors, cheapest at the bottom): used on the host's table. */
export const BuildingModel: React.FC<{ hi?: number; s?: number }> = ({ hi = 0, s = 1 }) => (
  <group scale={s}>
    {Array.from({ length: 10 }, (_, f) => {
      const c = new THREE.Color().setHSL(0.58 - f * 0.05, 0.55, 0.55 + f * 0.015).getStyle();
      return (
        <group key={f} position={[0, 0.3 + f * 0.32, 0]}>
          <Toon geometry={G.box} color={hi === f + 1 ? '#ffd34d' : c} scale={[1.4, 0.3, 1.0]} line={2} />
          {Array.from({ length: 5 }, (_, w) => (
            <Glow key={w} geometry={plane} color={hi === f + 1 ? '#fff6c0' : '#f4f1ea'} position={[-0.56 + w * 0.28, 0, 0.51]} scale={[0.14, 0.16, 1]} />
          ))}
        </group>
      );
    })}
    <Toon geometry={G.box} color="#c8302c" position={[0, 3.62, 0]} scale={[1.0, 0.35, 0.7]} line={2} />
  </group>
);

/* ================================================================== templates */
export interface TplProps {
  t: number;
  k: number;
}

/* ---------- A · Host in his office with the model building and a board ---------- */
export const HostOffice: React.FC<TplProps & { cam?: 0 | 1 | 2; acts?: Actor['acts']; board?: { lines: string[]; at: number[] }; hi?: number; extra?: Actor[] }> = ({ t, k, cam = 0, acts, board, hi, extra = [] }) => {
  const cams: [Frame, Frame][] = [
    [{ pos: [-0.4, 4.6, 9], target: [-0.6, 4.0, -3], fov: 44, fit: 11.4 }, { pos: [-0.5, 4.5, 8], target: [-0.6, 4.0, -3], fov: 44, fit: 11 }],
    [{ pos: [-1.4, 4.8, 3.5], target: [-1.9, 4.6, -3], fov: 40, fit: 6.6 }, { pos: [-1.5, 4.8, 2.8], target: [-1.9, 4.6, -3], fov: 40, fit: 6.3 }],
    [{ pos: [4.2, 4.6, 1.2], target: [3.2, 2.6, -4], fov: 40, fit: 3.6 }, { pos: [4.0, 4.4, 0.4], target: [3.2, 2.6, -4], fov: 40, fit: 3.4 }],
  ];
  const n = board ? revealed(t, board.at) : 0;
  return (
    <Shot light={LIGHT.office} k={k} a={cams[cam][0]} b={cams[cam][1]}>
      <OfficeSet />
      {board && <WallCard map={boardTex(board.lines, n)} pos={[-2.5, 6.3, -9.6]} size={[7.2, 4.8]} frame="#7a4424" />}
      <group position={[3.2, 0, -4]}>
        <Toon geometry={G.box} color="#8e5d33" position={[0, 0.9, 0]} scale={[2.6, 1.8, 1.8]} line={3} />
        <group position={[0, 1.8, 0]}>
          <BuildingModel hi={hi} />
        </group>
      </group>
      <Act a={{ id: 'host', pos: [-1.3, 0, -3], rotY: 0.25, acts: acts ?? [[0, 'talk', 'smile']] }} t={t} />
      {extra.map((a, i) => (
        <Act key={i} a={a} t={t} seed={i + 2} />
      ))}
    </Shot>
  );
};

/** The host's office: blue wallpaper, bookshelf, plans, window — closed room. */
export const OfficeSet: React.FC = () => (
  <group>
    <Room w={30} d={20} h={13} floor={woodTex('#b0703c', '#7e4a24', 6, [4, 6])} wall={stripeTex('#4f78b8', '#4469a6', [6, 3])} side={-1} wainscot="#6a3a22" closed ceiling="#f4ead6" front={30} />
    <group position={[-11.2, 0, -9.3]}>
      <Toon geometry={G.box} color="#6a3a22" position={[0, 3.3, 0]} scale={[3.6, 6.6, 1.0]} line={3} />
      {[1.2, 2.8, 4.4, 6.0].map((y, r) =>
        Array.from({ length: 8 }, (_, i) => (
          <Toon key={`${r}${i}`} geometry={G.box} color={['#c8302c', '#2c4fa3', '#f2b233', '#3f8f73', '#7a3a22'][(i + r) % 5]} position={[-1.4 + i * 0.4, y + 0.1, 0.4]} scale={[0.32, 1.05 + (i % 3) * 0.12, 0.6]} line={2} />
        )),
      )}
    </group>
    <group position={[7, 7.4, -9.7]}>
      <Toon geometry={G.box} color="#f4ead6" scale={[4.2, 4.6, 0.25]} line={3} />
      <Glow geometry={plane} color="#9fd3f5" position={[0, 0, 0.14]} scale={[3.6, 4.0, 1]} />
      <Toon geometry={G.box} color="#f4ead6" position={[0, 0, 0.18]} scale={[0.12, 4.0, 0.06]} line={1} />
    </group>
    <Plant pos={[11.5, 0, -8.5]} s={1.5} />
    <Toon geometry={G.cyl} color="#2f5f9a" position={[0, 0.02, 0]} scale={[6, 0.04, 4]} line={2} />
    <group position={[0, 12.6, -1]}>
      <Toon geometry={G.cone} color="#2f7d5b" scale={[1.0, 0.7, 1.0]} line={3} />
      <Glow geometry={G.sphere} color="#fff1b8" position={[0, -0.35, 0]} scale={0.25} />
    </group>
  </group>
);

/* ---------- B · The building, outside ---------- */
export interface ExtProps extends TplProps {
  cam?: 'wide' | 'floor' | 'ground' | 'top';
  floor?: number; // highlighted floor 1..10
  lift?: [number, number, number, number]; // first elevator: from floor, to floor, t0, t1
  rocket?: [number, number, number, number]; // second elevator (wealth)
  night?: boolean;
  crowd?: Actor[];
  sign?: string;
}
const FH = 3.2; // floor height
export const Exterior: React.FC<ExtProps> = ({ t, k, cam = 'wide', floor = 0, lift, rocket, night, crowd = [], sign }) => {
  const fy = (f: number) => (f - 0.5) * FH;
  const target: V3 = floor ? [0, fy(floor), -14] : [0, 15, -14];
  const cams: Record<string, [Frame, Frame]> = {
    wide: [{ pos: [6, 12, 30], target: [0, 16, -14], fov: 44, fit: 26 }, { pos: [4, 13, 27], target: [0, 16, -14], fov: 44, fit: 25 }],
    floor: [{ pos: [3, target[1] + 1.5, 4], target, fov: 42, fit: 15 }, { pos: [2, target[1] + 1.2, 2.5], target, fov: 42, fit: 14 }],
    ground: [{ pos: [0, 3.2, 10], target: [0, 3.8, -4], fov: 46, fit: 9 }, { pos: [0, 3.2, 8.8], target: [0, 4.0, -4], fov: 46, fit: 8.6 }],
    top: [{ pos: [8, 40, 4], target: [0, 31, -14], fov: 44, fit: 16 }, { pos: [6, 41, 2], target: [0, 31.5, -14], fov: 44, fit: 15 }],
  };
  const liftY = lift ? fy(lerp(lift[0], lift[1], sm(t, lift[2], lift[3]))) : fy(1);
  const rocketY = rocket ? fy(lerp(rocket[0], rocket[1], sm(t, rocket[2], rocket[3]))) : fy(1);
  const light: Light = night ? LIGHT.night : LIGHT.day;
  return (
    <Shot light={light} k={k} a={cams[cam][0]} b={cams[cam][1]} lamps={night ? [{ pos: [0, 8, -4], color: '#ffd27a', power: 40, dist: 30 }] : []}>
      <Tx geometry={box} map={stoneTex('#c9b48c', [30, 30], 32)} position={[0, -0.25, -10]} scale={[160, 0.5, 120]} line={0} />
      {/* city behind */}
      {Array.from({ length: 14 }, (_, i) => {
        const x = -70 + i * 10 + (hash(i) - 0.5) * 3;
        if (Math.abs(x) < 12) return null;
        const h = 10 + hash(i + 3) * 22;
        return (
          <group key={i} position={[x, h / 2, -30 - hash(i + 5) * 10]}>
            <Toon geometry={G.box} color={['#7fa6d8', '#a8c4e8', '#8cb8a8', '#d8a8b8'][i % 4]} scale={[7, h, 7]} line={3} />
            {Array.from({ length: Math.floor(h / 3) }, (_, r) => (
              <Glow key={r} geometry={plane} color={night ? '#ffd27a' : '#e8f2ff'} position={[0, -h / 2 + 2 + r * 3, 3.52]} scale={[5, 1.0, 1]} />
            ))}
          </group>
        );
      })}
      {/* the tower: 10 floors × 10 doors (windows) */}
      <group position={[0, 0, -14]}>
        {Array.from({ length: 10 }, (_, f) => {
          const c = new THREE.Color().setHSL(0.08 + f * 0.055, 0.6, 0.62).getStyle();
          const on = floor === f + 1;
          return (
            <group key={f} position={[0, fy(f + 1), 0]}>
              <Tx geometry={box} map={plasterTex(c, [3, 1])} scale={[16, FH, 8]} line={3} />
              <Toon geometry={G.box} color="#f4ead6" position={[0, -FH / 2 + 0.1, 0.1]} scale={[16.4, 0.25, 8.4]} line={2} />
              {Array.from({ length: 10 }, (_, d) => (
                <group key={d} position={[-6.75 + d * 1.5, 0.15, 4.02]}>
                  <Toon geometry={G.box} color="#f4ead6" scale={[1.05, 1.7, 0.1]} line={2} />
                  <Glow geometry={plane} color={on ? '#fff3a0' : night ? (hash(f * 10 + d) > 0.4 ? '#ffd27a' : '#2a3050') : '#9fd3f5'} position={[0, 0, 0.06]} scale={[0.85, 1.5, 1]} />
                </group>
              ))}
              {/* floor number on the side */}
              <Tx geometry={plane} map={boardTex([`!${f + 1}`], 1, { bg: on ? '#ffd34d' : '#1d1830', accent: on ? '#1d1830' : '#ffd34d', w: 256, h: 256 })} position={[8.05, 0, 2]} rotation={[0, Math.PI / 2, 0]} scale={[1.6, 1.6, 1]} line={0} />
            </group>
          );
        })}
        {/* penthouse */}
        <group position={[0, 10 * FH + 1.2, -1]}>
          <Toon geometry={G.box} color="#1d1830" scale={[8, 2.4, 5]} line={3} />
          <Glow geometry={plane} color="#ffd27a" position={[0, 0, 2.52]} scale={[7, 1.6, 1]} />
          <Toon geometry={G.box} color="#d9b44a" position={[0, 1.4, 0]} scale={[8.6, 0.3, 5.6]} line={2} />
        </group>
        {/* first elevator: glass shaft on the right */}
        <group position={[9.4, 0, 2]}>
          <Toon geometry={G.box} color="#cfe6f5" position={[0, 16, 0]} scale={[2.2, 32, 2.2]} line={3} />
          <group position={[0, liftY, 0]}>
            <Toon geometry={G.box} color="#c8302c" scale={[1.9, 2.6, 1.9]} line={3} />
            <Glow geometry={plane} color="#fff1b8" position={[0, 0.2, 0.96]} scale={[1.2, 1.6, 1]} />
          </group>
        </group>
        {/* second elevator: the gold "rocket" on the left */}
        {rocket && (
          <group position={[-9.4, 0, 2]}>
            <Toon geometry={G.box} color="#3a2f5a" position={[0, 20, 0]} scale={[2.2, 40, 2.2]} line={3} />
            <group position={[0, rocketY, 0]}>
              <Toon geometry={G.cyl} color="#e0b23e" scale={[0.95, 2.4, 0.95]} line={3} />
              <Toon geometry={G.cone} color="#c8302c" position={[0, 1.8, 0]} scale={[0.95, 1.2, 0.95]} line={3} />
              <Glow geometry={G.cone} color="#ffb040" position={[0, -1.9, 0]} rotation={[Math.PI, 0, 0]} scale={[0.6, 1.2 + Math.sin(t * 9) * 0.15, 0.6]} />
            </group>
          </group>
        )}
      </group>
      {/* entrance + sign */}
      <group position={[0, 0, -9.9]}>
        <Toon geometry={G.box} color="#6a3a22" position={[0, 1.8, 0]} scale={[4, 3.6, 0.3]} line={3} />
        <Glow geometry={plane} color="#ffe6a8" position={[0, 1.6, 0.17]} scale={[3.2, 3.0, 1]} />
        <Tx geometry={plane} map={boardTex([sign ?? '100 WORKERS · 10 FLOORS'], 1, { bg: '#1d1830', fg: '#ffd34d', w: 1024, h: 160 })} position={[0, 4.1, 0.2]} scale={[7, 1.1, 1]} line={0} />
      </group>
      {[-6, 6].map((x) => (
        <Plant key={x} pos={[x, 0, -8.6]} s={1.4} />
      ))}
      {crowd.map((a, i) => (
        <Act key={i} a={a} t={t} seed={i} />
      ))}
    </Shot>
  );
};

/* ---------- C · A door in the hallway, with its resident and the numbers ---------- */
export interface DoorProps extends TplProps {
  door: number;
  floor: number;
  who: string;
  lines: string[]; // plate lines (prefix "!" = big)
  at: number[]; // reveal times per line
  cam?: 0 | 1 | 2;
  acts?: Actor['acts'];
  open?: number; // time the door opens
  guest?: Actor;
}
export const Door: React.FC<DoorProps> = ({ t, k, door, floor, who, lines, at, cam = 0, acts, open = -1, guest }) => {
  const hue = 0.08 + (floor - 1) * 0.055;
  const wall = new THREE.Color().setHSL(hue, 0.45, 0.62).getStyle();
  const wall2 = new THREE.Color().setHSL(hue, 0.45, 0.55).getStyle();
  const n = revealed(t, at);
  const cams: [Frame, Frame][] = [
    [{ pos: [-0.8, 4.4, 9], target: [-1.0, 4.0, -6], fov: 44, fit: 10.8 }, { pos: [-0.9, 4.3, 7.8], target: [-1.0, 4.0, -6], fov: 44, fit: 10.4 }],
    [{ pos: [-3.0, 4.6, 1], target: [-3.2, 4.6, -9.4], fov: 40, fit: 6.4 }, { pos: [-3.0, 4.6, 0], target: [-3.2, 4.6, -9.4], fov: 40, fit: 6.2 }],
    [{ pos: [3.0, 4.0, -1.5], target: [2.1, 3.6, -7], fov: 40, fit: 3.4 }, { pos: [2.9, 4.0, -2.3], target: [2.1, 3.6, -7], fov: 40, fit: 3.2 }],
  ];
  const o = open >= 0 ? sm(t, open, open + 0.8) : 0;
  return (
    <Shot light={LIGHT.office} k={k} a={cams[cam][0]} b={cams[cam][1]} lamps={[{ pos: [0, 9, -5], color: '#ffe6b0', power: 25, dist: 18 }]}>
      <Room w={26} d={20} h={12} floor={stoneTex('#8a5a3a', [8, 10], 40)} wall={stripeTex(wall, wall2, [6, 3])} side={-1} wainscot="#6a3a22" closed ceiling="#f4ead6" front={28} />
      {/* door */}
      <group position={[2.1, 0, -9.7]}>
        <Toon geometry={G.box} color="#f4ead6" position={[0, 3.3, 0]} scale={[3.4, 6.6, 0.3]} line={3} />
        <Glow geometry={plane} color="#2a2030" position={[0, 3.1, 0.16]} scale={[2.7, 6.1, 1]} />
        <group position={[-1.35, 0, 0.25]} rotation={[0, -o * 1.2, 0]}>
          <Toon geometry={G.box} color="#8a2f2f" position={[1.35, 3.1, 0]} scale={[2.7, 6.1, 0.2]} line={3} />
          {[1.6, 4.4].map((y) => (
            <Toon key={y} geometry={G.box} color="#7a2626" position={[1.35, y, 0.12]} scale={[1.9, 2.0, 0.05]} line={2} />
          ))}
          <Toon geometry={G.sphere} color="#d9b44a" position={[2.4, 3.0, 0.2]} scale={0.14} line={2} />
          {/* brass number plate */}
          <Tx geometry={plane} map={boardTex([`!${door}`], 1, { bg: '#d9b44a', accent: '#1d1830', w: 256, h: 192 })} position={[1.35, 5.2, 0.14]} scale={[1.3, 0.95, 1]} line={0} />
        </group>
        <Tx geometry={plane} map={boardTex([`DOOR ${door}`, `FLOOR ${floor}`], 2, { bg: '#1d1830', fg: '#f4ead6', w: 512, h: 256 })} position={[0, 7.4, 0.2]} scale={[2.8, 1.4, 1]} line={0} />
      </group>
      {/* the numbers plate */}
      <WallCard map={boardTex(lines, n, { bg: '#f6efdc', fg: '#1d1830', accent: '#c8302c' })} pos={[-3.2, 4.6, -9.6]} size={[5.4, 3.6]} frame="#1d1830" />
      <Plant pos={[-9.5, 0, -8.6]} s={1.3} />
      <Toon geometry={G.box} color="#6a3a22" position={[7.5, 0.5, -8.6]} scale={[2.2, 1.0, 1.2]} line={3} />
      <Act a={{ id: who, pos: [2.1, 0, -7.6], rotY: -0.15, acts: acts ?? [[0, 'still', 'smile']] }} t={t} seed={door} />
      {guest && <Act a={guest} t={t} seed={door + 7} />}
    </Shot>
  );
};

/* ---------- D · Board (chalkboard / napkin) with the math, the host beside it ---------- */
export const Board: React.FC<TplProps & { lines: string[]; at: number[]; napkin?: boolean; who?: string; acts?: Actor['acts']; cam?: 0 | 1 }> = ({ t, k, lines, at, napkin, who = 'host', acts, cam = 0 }) => {
  const n = revealed(t, at);
  if (napkin) {
    return (
      <Shot light={LIGHT.office} k={k} a={{ pos: [0.3, 7.2, 2.4], target: [0, 1.0, -0.6], fov: 40, fit: 5.6 }} b={{ pos: [0.3, 6.6, 2.0], target: [0, 1.0, -0.6], fov: 40, fit: 5.2 }}>
        <OfficeSet />
        <Tx geometry={box} map={woodTex('#8e5d33', '#5a3a1e', 5)} position={[0, 0.5, -0.6]} scale={[8, 1.0, 5]} line={3} />
        <group position={[0, 1.02, -0.6]} rotation={[-Math.PI / 2, 0, 0.05]}>
          <Toon geometry={G.box} color="#fbf8f0" scale={[5.2, 3.6, 0.02]} line={2} />
          <Tx geometry={plane} map={boardTex(lines, n, { bg: '#fbf8f0', fg: '#2a3a8a', accent: '#c8302c', serif: true })} position={[0, 0, 0.02]} scale={[5.0, 3.4, 1]} line={0} />
        </group>
        <group position={[2.9, 1.1, 0.4]} rotation={[0, 0.6, Math.PI / 2]}>
          <Toon geometry={G.cyl} color="#2a3a8a" scale={[0.06, 1.3, 0.06]} line={2} />
        </group>
        <Toon geometry={G.cup} color="#f4f1ea" position={[-3.0, 1.45, -1.8]} scale={[0.45, 0.9, 0.45]} line={3} />
      </Shot>
    );
  }
  const cams: [Frame, Frame][] = [
    [{ pos: [0.6, 4.8, 8.5], target: [0.4, 4.6, -6], fov: 44, fit: 11.4 }, { pos: [0.5, 4.8, 7.6], target: [0.4, 4.6, -6], fov: 44, fit: 11 }],
    [{ pos: [1.2, 5.4, 2], target: [1.2, 5.6, -9.4], fov: 40, fit: 9.4 }, { pos: [1.2, 5.4, 1.2], target: [1.2, 5.6, -9.4], fov: 40, fit: 9.1 }],
  ];
  return (
    <Shot light={LIGHT.office} k={k} a={cams[cam][0]} b={cams[cam][1]}>
      <OfficeSet />
      <WallCard map={boardTex(lines, n)} pos={[1.2, 5.6, -9.6]} size={[8.4, 5.6]} frame="#7a4424" />
      <Act a={{ id: who, pos: [-4.0, 0, -6.2], rotY: 0.55, acts: acts ?? [[0, 'point', 'smile']] }} t={t} />
    </Shot>
  );
};

/* ---------- E · Register: paycheck vs prices ---------- */
export const Register: React.FC<TplProps & { display: string; receipt: string[]; at: number[]; acts?: Actor['acts']; cam?: 0 | 1 }> = ({ t, k, display, receipt, at, acts, cam = 0 }) => {
  const n = revealed(t, at);
  const cams: [Frame, Frame][] = [
    [{ pos: [1.2, 4.4, 8], target: [0, 3.0, -2.5], fov: 44, fit: 7.4 }, { pos: [1.0, 4.3, 7], target: [0, 3.0, -2.5], fov: 44, fit: 7 }],
    [{ pos: [1.6, 3.6, 2.2], target: [0.8, 2.6, -1.4], fov: 40, fit: 3.2 }, { pos: [1.5, 3.5, 1.6], target: [0.8, 2.6, -1.4], fov: 40, fit: 3.0 }],
  ];
  return (
    <Shot light={LIGHT.office} k={k} a={cams[cam][0]} b={cams[cam][1]} lamps={[{ pos: [0, 8, 0], color: '#fff1d0', power: 25 }]}>
      <Room w={26} d={20} h={12} floor={stoneTex('#d8d0c0', [10, 10], 40)} wall={stripeTex('#f2b233', '#e0a028', [6, 3])} side={-1} closed ceiling="#f4ead6" front={28} />
      {/* shelves with goods */}
      {[-6, 0, 6].map((x) => (
        <group key={x} position={[x, 0, -9]}>
          <Toon geometry={G.box} color="#8e5d33" position={[0, 3, 0]} scale={[5, 6, 1]} line={3} />
          {[1.2, 2.6, 4.0, 5.4].map((y, r) =>
            Array.from({ length: 7 }, (_, i) => (
              <Toon key={`${r}${i}`} geometry={i % 2 ? G.cyl : G.box} color={['#e84a3a', '#2f5f9a', '#3f8f73', '#f4ead6', '#e0702a'][(i + r + x) % 5 < 0 ? 0 : (i + r + x) % 5]} position={[-2.1 + i * 0.7, y + 0.3, 0.45]} scale={i % 2 ? [0.22, 0.55, 0.22] : [0.5, 0.55, 0.35]} line={2} />
            )),
          )}
        </group>
      ))}
      {/* counter + register */}
      <Toon geometry={G.box} color="#c8302c" position={[0, 1.1, -1.4]} scale={[5.5, 2.2, 1.6]} line={3} />
      <group position={[0.8, 2.2, -1.4]}>
        <Toon geometry={G.box} color="#2a2d35" position={[0, 0.4, 0]} scale={[1.6, 0.8, 1.2]} line={3} />
        <Toon geometry={G.box} color="#2a2d35" position={[0, 1.2, -0.3]} rotation={[-0.4, 0, 0]} scale={[1.4, 0.7, 0.15]} line={3} />
        <Tx geometry={plane} map={boardTex([`!${display}`], 1, { bg: '#0c2a18', accent: '#5fff9a', w: 512, h: 256 })} position={[0, 1.22, -0.21]} rotation={[-0.4, 0, 0]} scale={[1.2, 0.55, 1]} line={0} />
        {/* receipt strip */}
        <group position={[0.4, 0.85, 0.5]} rotation={[0.9, 0, 0]}>
          <Tx geometry={plane} map={boardTex(receipt, n, { bg: '#fbf8f0', fg: '#1d1830', accent: '#c8302c', w: 384, h: 768 })} position={[0, -0.3 - 0.8 * sm(t, at[0] ?? 0, (at[0] ?? 0) + 1.5), 0]} scale={[0.9, 1.8, 1]} line={0} />
        </group>
      </group>
      {/* a shopping basket */}
      <group position={[-1.6, 2.2, -1.2]}>
        <Toon geometry={G.cup} color="#2f5f9a" position={[0, 0.35, 0]} scale={[0.8, 0.7, 0.55]} line={3} />
        {['#e84a3a', '#f2b233', '#3f8f73'].map((c, i) => (
          <Toon key={c} geometry={G.sphere} color={c} position={[-0.3 + i * 0.3, 0.8, 0]} scale={0.25} line={2} />
        ))}
      </group>
      <Act a={{ id: 'door10', pos: [1.2, 0, -3.6], rotY: 0, acts: acts ?? [[0, 'still', 'smile']] }} t={t} />
    </Shot>
  );
};

/* ---------- F · Stairs that get steeper ---------- */
export const Stairs: React.FC<TplProps & { labels: string[]; heights: number[]; hi?: number; climber?: string; step?: [number, number, number, number]; acts?: Actor['acts'] }> = ({ t, k, labels, heights, hi = -1, climber = 'host', step = [0, 0, 0, 1], acts }) => {
  // flights: each flight i has 5 steps of rise heights[i]
  const steps: { x: number; y: number; h: number; f: number }[] = [];
  let x = -9;
  let y = 0;
  heights.forEach((h, f) => {
    for (let s = 0; s < 5; s++) {
      y += h;
      steps.push({ x, y, h, f });
      x += 1.1;
    }
  });
  const si = Math.round(lerp(step[0], step[1], sm(t, step[2], step[3])));
  const st = steps[Math.min(steps.length - 1, Math.max(0, si))];
  const top = steps[steps.length - 1];
  return (
    <Shot light={LIGHT.office} k={k} a={{ pos: [st.x + 1, st.y + 4, 13], target: [st.x * 0.4, st.y * 0.5 + 3, -2], fov: 46, fit: 16 }} b={{ pos: [st.x + 0.5, st.y + 4, 12], target: [st.x * 0.4, st.y * 0.5 + 3, -2], fov: 46, fit: 15 }}>
      <Room w={60} d={20} h={Math.max(16, top.y + 8)} floor={woodTex('#b0703c', '#7e4a24', 6, [8, 8])} wall={stripeTex('#7a5ad6', '#6a4ac6', [10, 4])} side={0} closed ceiling="#f4ead6" front={30} />
      {steps.map((s, i) => (
        <Toon key={i} geometry={G.box} color={s.f === hi ? '#ffd34d' : ['#e0a050', '#e08a50', '#d8705a', '#c85a6a'][s.f % 4]} position={[s.x, s.y / 2, -2]} scale={[1.1, s.y, 3.2]} line={3} />
      ))}
      {labels.map((l, f) => {
        const s = steps[f * 5 + 2];
        return <Tx key={f} geometry={plane} map={boardTex([`!${l}`], 1, { bg: f === hi ? '#ffd34d' : '#1d1830', accent: f === hi ? '#1d1830' : '#ffd34d', w: 512, h: 192 })} position={[s.x, s.y + 3.5, -3.4]} scale={[3.0, 1.1, 1]} line={0} />;
      })}
      <Act a={{ id: climber, pos: [st.x, st.y, -1.6], rotY: 0.2, acts: acts ?? [[0, 'still', 'o']] }} t={t} />
    </Shot>
  );
};

/* ---------- G · Elevator lobby with the repairman ---------- */
export const Lift: React.FC<TplProps & { open?: number; plates?: { lines: string[]; at: number[] }; who?: Actor[]; cam?: 0 | 1; dial?: number }> = ({ t, k, open = 0, plates, who = [], cam = 0, dial = 1 }) => {
  const o = sm(t, open, open + 1.0);
  const n = plates ? revealed(t, plates.at) : 0;
  const cams: [Frame, Frame][] = [
    [{ pos: [-1.6, 4.6, 9], target: [-1.8, 4.0, -5], fov: 44, fit: 15.6 }, { pos: [-1.7, 4.5, 7.8], target: [-1.8, 4.0, -5], fov: 44, fit: 15.2 }],
    [{ pos: [-0.4, 4.0, 2.4], target: [0, 3.6, -7.5], fov: 40, fit: 3.6 }, { pos: [-0.4, 4.0, 1.6], target: [0, 3.6, -7.5], fov: 40, fit: 3.4 }],
  ];
  const angle = -1.2 + ((dial - 1) / 9) * 2.4;
  return (
    <Shot light={LIGHT.office} k={k} a={cams[cam][0]} b={cams[cam][1]} lamps={[{ pos: [0, 6, -7], color: '#fff1b8', power: 30, dist: 12 }]}>
      <Room w={26} d={20} h={12} floor={stoneTex('#3a3a48', [8, 8], 40)} wall={brickTex('#8a4a34', '#5a4a3e', [6, 3])} side={-1} closed ceiling="#e8e0d0" front={28} />
      <group position={[0, 0, -9.7]}>
        <Toon geometry={G.box} color="#d9b44a" position={[0, 3.6, 0]} scale={[5.0, 7.2, 0.35]} line={3} />
        <Glow geometry={plane} color="#ffe9b0" position={[0, 3.2, 0.2]} scale={[3.6, 6.2, 1]} />
        {[-1, 1].map((s) => (
          <Toon key={s} geometry={G.box} color="#b9c2cc" position={[s * (0.9 + o * 1.7), 3.2, 0.32]} scale={[1.8, 6.2, 0.12]} line={3} />
        ))}
        {/* floor dial */}
        <group position={[0, 7.9, 0.25]}>
          <Toon geometry={G.cyl} color="#d9b44a" rotation={[Math.PI / 2, 0, 0]} scale={[1.2, 0.1, 1.2]} line={3} />
          <Toon geometry={G.box} color="#1d1830" position={[Math.sin(angle) * 0.45, Math.cos(angle) * 0.45, 0.08]} rotation={[0, 0, -angle]} scale={[0.08, 0.9, 0.04]} line={0} />
        </group>
      </group>
      {plates && <WallCard map={boardTex(plates.lines, n, { bg: '#f6efdc', fg: '#1d1830', accent: '#c8302c' })} pos={[-6.4, 4.8, -9.6]} size={[5.4, 3.8]} frame="#1d1830" />}
      {/* toolbox */}
      <group position={[3.6, 0, -6.6]}>
        <Toon geometry={G.box} color="#c8302c" position={[0, 0.45, 0]} scale={[1.4, 0.9, 0.7]} line={3} />
        <Toon geometry={new THREE.TorusGeometry(0.35, 0.06, 6, 16, Math.PI)} color="#2a2a30" position={[0, 0.95, 0]} line={0} />
      </group>
      {who.map((a, i) => (
        <Act key={i} a={a} t={t} seed={i + 3} />
      ))}
    </Shot>
  );
};

/* ---------- H · Penthouse at night ---------- */
export const Penthouse: React.FC<TplProps & { plates?: { lines: string[]; at: number[] }; acts?: Actor['acts']; extra?: Actor[] }> = ({ t, k, plates, acts, extra = [] }) => {
  const n = plates ? revealed(t, plates.at) : 0;
  return (
    <Shot light={LIGHT.night} k={k} a={{ pos: [1, 5.2, 9], target: [0, 4.6, -4], fov: 44, fit: 9.6 }} b={{ pos: [0.8, 5.1, 8], target: [0, 4.6, -4], fov: 44, fit: 9.2 }} lamps={[{ pos: [2, 6, -2], color: '#ffd27a', power: 40, dist: 18 }]}>
      <Tx geometry={box} map={stoneTex('#3a3048', [10, 10], 40)} position={[0, -0.25, 0]} scale={[30, 0.5, 26]} line={0} />
      {/* skyline far below */}
      {Array.from({ length: 16 }, (_, i) => {
        const h = 6 + hash(i) * 14;
        return (
          <group key={i} position={[-40 + i * 5.5, -20 + h / 2, -30 - hash(i + 2) * 8]}>
            <Toon geometry={G.box} color="#2a2f5a" scale={[4.6, h, 4]} line={2} />
            {Array.from({ length: 4 }, (_, r) => (
              <Glow key={r} geometry={plane} color="#ffd27a" position={[0, -h / 2 + 2 + r * 3, 2.02]} scale={[3, 0.5, 1]} />
            ))}
          </group>
        );
      })}
      <Glow geometry={G.disc} color="#f3efd8" position={[12, 18, -40]} scale={2.6} />
      {/* glass railing, sofa, gold, champagne */}
      <Toon geometry={G.box} color="#9fd3f5" position={[0, 0.9, 3]} scale={[26, 1.8, 0.1]} line={2} />
      <Toon geometry={G.box} color="#c8302c" position={[-4.5, 0.7, -5]} scale={[4.5, 1.4, 1.6]} line={3} />
      <Toon geometry={G.box} color="#c8302c" position={[-4.5, 1.6, -5.7]} scale={[4.5, 1.6, 0.4]} line={3} />
      <group position={[4.2, 0, -5]}>
        <Toon geometry={G.cone} color="#e0b23e" position={[0, 1.2, 0]} scale={[2.2, 2.4, 2.2]} line={3} />
      </group>
      {plates && <Tx geometry={plane} map={boardTex(plates.lines, n, { bg: '#1d1830', fg: '#f4ead6', accent: '#ffd34d' })} position={[0, 7.0, -8]} scale={[8, 5.3, 1]} line={0} />}
      <Act a={{ id: 'penthouse', pos: [0.4, 0, -3], rotY: 0.1, acts: acts ?? [[0, 'present', 'smug']] }} t={t} />
      {extra.map((a, i) => (
        <Act key={i} a={a} t={t} seed={i + 4} />
      ))}
    </Shot>
  );
};

/* ---------- J · A house and its key ---------- */
export const HouseKey: React.FC<TplProps & { plates?: { lines: string[]; at: number[] }; who?: Actor[] }> = ({ t, k, plates, who = [] }) => {
  const n = plates ? revealed(t, plates.at) : 0;
  return (
    <Shot light={LIGHT.sunset} k={k} a={{ pos: [1, 4.6, 11], target: [0, 3.6, -4], fov: 44, fit: 11 }} b={{ pos: [0.8, 4.5, 9.8], target: [0, 3.6, -4], fov: 44, fit: 10.4 }}>
      <Tx geometry={box} map={stoneTex('#7fae4a', [12, 12], 40)} position={[0, -0.25, 0]} scale={[90, 0.5, 70]} line={0} />
      <Glow geometry={G.disc} color="#ffe2a0" position={[14, 10, -40]} scale={4} />
      {/* the house */}
      <group position={[-3, 0, -8]}>
        <Toon geometry={G.box} color="#f4ead6" position={[0, 2.6, 0]} scale={[7, 5.2, 5]} line={3} />
        <Toon geometry={G.box} color="#c8302c" position={[0, 6.0, 0]} rotation={[0, 0, Math.PI / 4]} scale={[4.2, 4.2, 5.4]} line={3} />
        <Toon geometry={G.box} color="#2f5f9a" position={[0, 1.6, 2.55]} scale={[1.4, 3.2, 0.1]} line={3} />
        {[-2.2, 2.2].map((x) => (
          <Glow key={x} geometry={plane} color="#ffd27a" position={[x, 3.2, 2.56]} scale={[1.4, 1.4, 1]} />
        ))}
      </group>
      {/* the giant key */}
      <group position={[4.5, 4.2 + Math.sin(t * 1.5) * 0.2, -5]} rotation={[0, 0.3, 0.3 + Math.sin(t) * 0.05]}>
        <Toon geometry={new THREE.TorusGeometry(0.9, 0.3, 10, 28)} color="#e0b23e" line={3} />
        <Toon geometry={G.box} color="#e0b23e" position={[0, -2.2, 0]} scale={[0.45, 3.0, 0.3]} line={3} />
        {[-3.2, -2.6].map((y) => (
          <Toon key={y} geometry={G.box} color="#e0b23e" position={[0.5, y, 0]} scale={[0.7, 0.3, 0.3]} line={3} />
        ))}
      </group>
      {plates && <WallCard map={boardTex(plates.lines, n, { bg: '#1d1830', fg: '#f4ead6', accent: '#ffd34d' })} pos={[5.5, 9.5, -9]} size={[7, 4.6]} frame="#f4ead6" />}
      {who.map((a, i) => (
        <Act key={i} a={a} t={t} seed={i + 5} />
      ))}
    </Shot>
  );
};

/* ---------- K · Bars: a 3D comparison chart ---------- */
export interface Bar {
  label: string;
  value: number; // relative height 0..1
  text: string;
  color: string;
  at: number; // grow time
}
export const Bars: React.FC<TplProps & { title: string; bars: Bar[]; who?: Actor; cam?: 0 | 1 }> = ({ t, k, title, bars, who, cam = 0 }) => {
  const W = bars.length;
  const H = 7;
  return (
    <Shot light={LIGHT.office} k={k} a={cam ? { pos: [0, 6, 9], target: [0, 5.4, -4], fov: 44, fit: Math.max(11.5, W * 3 + 3) } : { pos: [1, 6, 11], target: [0, 5.4, -4], fov: 44, fit: Math.max(15, W * 3 + 6) }} b={cam ? { pos: [0, 6, 8], target: [0, 5.4, -4], fov: 44, fit: Math.max(11.2, W * 3 + 2.6) } : { pos: [0.8, 6, 10], target: [0, 5.4, -4], fov: 44, fit: Math.max(14.6, W * 3 + 5.6) }}>
      <OfficeSet />
      <Tx geometry={plane} map={boardTex([`!${title}`], 1, { bg: '#1d1830', accent: '#ffd34d', w: 1024, h: 180 })} position={[0, 10.2, -9.5]} scale={[11, 1.9, 1]} line={0} />
      <Toon geometry={G.box} color="#6a3a22" position={[0, 0.3, -4]} scale={[W * 3 + 1.5, 0.6, 2.4]} line={3} />
      {bars.map((b, i) => {
        const x = (i - (W - 1) / 2) * 3;
        const h = Math.max(0.05, b.value * H * smooth(clamp01((t - b.at) / 0.9)));
        const shown = t >= b.at + 0.4;
        return (
          <group key={i} position={[x, 0.6, -4]}>
            <Toon geometry={G.box} color={b.color} position={[0, h / 2, 0]} scale={[2.0, h, 1.6]} line={3} />
            {shown && <Tx geometry={plane} map={boardTex([`!${b.text}`], 1, { bg: '#fbf8f0', accent: '#1d1830', w: 512, h: 160 })} position={[0, h + 0.9, 0.2]} scale={[2.8, 0.88, 1]} line={0} />}
            <Tx geometry={plane} map={boardTex([b.label], 1, { bg: '#f4ead6', fg: '#1d1830', w: 512, h: 128 })} position={[0, -0.05, 1.25]} scale={[2.8, 0.7, 1]} line={0} />
          </group>
        );
      })}
      {who && <Act a={who} t={t} />}
    </Shot>
  );
};

/* ---------- L · Two people side by side with plates (age, income vs wealth, women vs men) ---------- */
export const Duo: React.FC<TplProps & { a: Actor; b: Actor; la: { lines: string[]; at: number[] }; lb: { lines: string[]; at: number[] }; bg?: 'office' | 'street' }> = ({ t, k, a, b, la, lb }) => (
  <Shot light={LIGHT.office} k={k} a={{ pos: [0, 5.0, 9.5], target: [0, 4.8, -4], fov: 44, fit: 11.8 }} b={{ pos: [0, 5.0, 8.4], target: [0, 4.8, -4], fov: 44, fit: 11.4 }}>
    <OfficeSet />
    <WallCard map={boardTex(la.lines, revealed(t, la.at), { bg: '#f6efdc', fg: '#1d1830', accent: '#c8302c' })} pos={[-3.2, 7.2, -9.6]} size={[5.2, 3.6]} frame="#1d1830" />
    <WallCard map={boardTex(lb.lines, revealed(t, lb.at), { bg: '#f6efdc', fg: '#1d1830', accent: '#c8302c' })} pos={[3.2, 7.2, -9.6]} size={[5.2, 3.6]} frame="#1d1830" />
    <Act a={a} t={t} seed={1} />
    <Act a={b} t={t} seed={2} />
  </Shot>
);

export { Floor, FH };
