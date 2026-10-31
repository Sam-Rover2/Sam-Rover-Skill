/**
 * New film (v2) — shot list written from scratch from the voice-over (voice.srt).
 * ~3 s per shot, cut on the phrase, each shot is its own small diorama.
 */
import * as THREE from 'three';
import { OBJECTS } from '../objects';
import { G } from '../lib/geometry';
import { canvasTex } from '../lib/tex';
import { Toon } from '../lib/Toon';
import { BODY } from '../lib/style';
import { clamp01, hash, lerp, ramp, smooth } from '../lib/anim';
import type { PersonPose } from '../rig/Person';
import { HeldCoin, HeldNotebook, HeldScissors, HeldTail, crouch } from '../staging';
import { CoinRain, RatA, Who, face, mix, reachTo, toLocal, walkPose } from '../film/kit';
import { Glow, Tx, box, plane, plankTex } from '../locations/kit';
import { AlleyCorner, FarmCorner, LIGHT, OfficeCorner, OpenManhole, Shot, StreetCorner, Tunnel, WallCard, cardTex, type V3 } from './kit';

const O = (id: string) => OBJECTS.find((o) => o.id === id)!.C;
/** Magnifying glass for close-ups: origin = centre of the lens, lens faces +z. */
const Lens: React.FC = () => (
  <group>
    <Toon geometry={new THREE.TorusGeometry(0.34, 0.05, 10, 40)} color="#c9a24a" line={3} />
    <mesh geometry={G.disc} scale={0.33}>
      <meshBasicMaterial color="#dff2ff" transparent opacity={0.22} depthWrite={false} />
    </mesh>
    <mesh geometry={G.disc} position={[-0.12, 0.12, 0.01]} rotation={[0, 0, 0.7]} scale={[0.09, 0.035, 1]}>
      <meshBasicMaterial color="#ffffff" transparent opacity={0.7} depthWrite={false} />
    </mesh>
    <Toon geometry={G.cyl} color="#c9a24a" position={[0.27, -0.27, 0]} rotation={[0, 0, 0.785]} scale={[0.04, 0.12, 0.04]} line={2} />
    <Toon geometry={G.cyl} color="#7a4a2a" position={[0.52, -0.52, 0]} rotation={[0, 0, 0.785]} scale={[0.055, 0.55, 0.055]} line={3} />
  </group>
);
type SP = { t: number; k: number };
export interface ShotDef {
  from: number;
  to: number;
  name: string;
  C: React.FC<SP>;
}

/**
 * Walk from a to b between t0 and t1, decelerating to a stop: the feet move exactly as
 * far as the body (phase = distance / stride) and stop when the body stops (QA-042).
 */
const walkTo = (t: number, t0: number, t1: number, a: V3, b: V3, seed = 0): { pos: V3; pose: PersonPose; moving: boolean; heading: number } => {
  const u = clamp01((t - t0) / (t1 - t0));
  const e = (x: number) => 1 - (1 - x) * (1 - x); // full speed at once, gentle stop
  const kk = e(u);
  const L = Math.hypot(b[0] - a[0], b[2] - a[2]);
  const dist = L * kk;
  const speed = u <= 0 || u >= 1 ? 0 : (2 * (1 - u) * L) / (t1 - t0);
  const amt = clamp01(speed / 1.4);
  const pos: V3 = [lerp(a[0], b[0], kk), lerp(a[1], b[1], kk), lerp(a[2], b[2], kk)];
  return { pos, pose: walkPose(dist / 0.75 + seed, amt * 0.9), moving: amt > 0.02, heading: Math.atan2(b[0] - a[0], b[2] - a[2]) };
};
/** smooth 0→1 between t0 and t1 (for every pose change: no snapping, QA-043) */
const sm = (t: number, t0: number, t1 = t0 + 0.4) => smooth(clamp01((t - t0) / (t1 - t0)));
const mixV = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

const breathe = (t: number, s = 0): PersonPose => ({ hips: [0, Math.sin(t * 2.2 + s) * 0.03, 0] });
const notebookHands: PersonPose = { handL: [-0.3, 2.5, 0.8], handR: [0.25, 2.6, 0.82], holdL: <HeldNotebook /> };
const deadRat = (
  <group rotation={[Math.PI, 0, 0]} scale={0.9}>
    <RatA pos={[0, 0, 0]} t={0} pose={{ face: 'scared' }} />
  </group>
);

/* ---------- textures that only this film uses ---------- */
const blueprintTex = () =>
  canvasTex('blueprint-v2', 640, 440, (g, w, h) => {
    g.fillStyle = '#1f4f9a';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,.18)';
    g.lineWidth = 1;
    for (let x = 0; x < w; x += 20) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
    g.strokeStyle = '#ffffff';
    g.lineWidth = 7;
    g.lineCap = 'round';
    const lines = [[60, 330, 580, 330], [120, 330, 120, 120], [260, 330, 260, 160], [400, 330, 400, 110], [520, 330, 520, 200], [120, 200, 400, 200], [260, 160, 520, 160]];
    for (const [a, b, c, d] of lines) {
      g.beginPath();
      g.moveTo(a, b);
      g.lineTo(c, d);
      g.stroke();
    }
    g.fillStyle = '#ffffff';
    g.font = '900 40px Georgia, serif';
    g.textAlign = 'center';
    g.fillText('ÉGOUTS DE HANOÏ', w / 2, 60);
    g.font = '700 26px Georgia, serif';
    g.fillText('PLAN GÉNÉRAL · 1901', w / 2, 400);
  });

const posterTex = () =>
  cardTex(
    'bounty-v2',
    [
      { t: 'AVIS', size: 96, color: '#8a1c14' },
      { t: 'PRIME AUX RATS', size: 46 },
      { t: '1 QUEUE = 1 CENT', size: 52, color: '#c8302c' },
      { t: '— RAT BOUNTY —', size: 30 },
    ],
    '#f6e7b8',
    '#5a3a24',
  );

const chalkTex = (n: number) =>
  canvasTex(`chalk-${n}`, 512, 340, (g, w, h) => {
    g.fillStyle = '#244a36';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#f4f1ea';
    g.textAlign = 'center';
    g.font = '700 44px Georgia, serif';
    g.fillText('QUEUES / JOUR', w / 2, 80);
    g.font = '900 120px Georgia, serif';
    g.fillText(n.toLocaleString('fr-FR'), w / 2, 230);
    g.strokeStyle = 'rgba(244,241,234,.6)';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(80, 270);
    g.lineTo(w - 80, 270);
    g.stroke();
  });

const chartTex = () =>
  canvasTex('chart-v2', 640, 460, (g, w, h) => {
    g.fillStyle = '#f6efdc';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#1b1b1f';
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(70, 40);
    g.lineTo(70, 400);
    g.lineTo(600, 400);
    g.stroke();
    // the goal: few rats (dashed, low)
    g.setLineDash([18, 14]);
    g.strokeStyle = '#2f7d5b';
    g.beginPath();
    g.moveTo(70, 340);
    g.lineTo(600, 360);
    g.stroke();
    g.setLineDash([]);
    // what happened: rats go up
    g.strokeStyle = '#d8342c';
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(70, 330);
    g.bezierCurveTo(250, 320, 380, 250, 580, 60);
    g.stroke();
    g.fillStyle = '#d8342c';
    g.font = '900 40px Georgia, serif';
    g.fillText('RATS', 470, 150);
    g.fillStyle = '#2f7d5b';
    g.font = '900 30px Georgia, serif';
    g.fillText('GOAL', 470, 330);
  });

/** Poster split into two halves (for tearing). */
const halfTex = (side: 0 | 1) => {
  const t = posterTex().clone();
  t.repeat.set(0.5, 1);
  t.offset.set(side * 0.5, 0);
  t.needsUpdate = true;
  return t;
};

const Desk: React.FC<{ pos: V3 }> = ({ pos }) => {
  const D = O('desk');
  return (
    <group position={pos}>
      <D />
    </group>
  );
};

/* =================================================================== */

const S01: React.FC<SP> = ({ t, k }) => {
  // inspectors walk towards us along the street and stop
  const w1 = walkTo(t, 0, 2.8, [-1.3, 0, -4.5], [-1.3, 0, 0.2]);
  const w2 = walkTo(t, 0, 2.8, [1.3, 0, -4.9], [1.3, 0, -0.2], 1);
  return (
    <Shot light={LIGHT.day} k={k} a={{ pos: [2.6, 3.0, 11], target: [0, 3.3, -2], fov: 42 }} b={{ pos: [2.0, 3.1, 9.6], target: [0, 3.3, -1.5], fov: 42 }}>
      <StreetCorner />
      <Who id="inspector" pos={w1.pos} pose={mix(w1.pose, breathe(t, 1), { face: 'neutral', handL: [-0.35, 2.5, 0.8], holdL: <HeldNotebook /> })} />
      <Who id="inspector2" pos={w2.pos} pose={mix(w2.pose, breathe(t, 2), { face: 'smile' })} />
      <O_Rickshaw />
    </Shot>
  );
};
const O_Rickshaw: React.FC = () => {
  const R = O('rickshaw');
  return (
    <group position={[-9, 0, -6]} rotation={[0, 0.7, 0]}>
      <R />
    </group>
  );
};

const S02: React.FC<SP> = ({ t, k }) => {
  const see = t >= 3.4; // «noticed»
  const k2 = sm(t, 3.4, 3.8);
  const pose = (s: number): PersonPose => mix(breathe(t, s), { face: see ? 'o' : 'neutral', look: [0.5 * k2, -0.8 * k2], headTilt: -0.12 * k2 });
  return (
    <Shot light={LIGHT.day} k={k} a={{ pos: [0.3, 4.0, 8.6], target: [0, 3.6, 0], fov: 40 }} b={{ pos: [0.2, 4.0, 7.6], target: [0, 3.6, 0], fov: 40 }}>
      <StreetCorner />
      <Who id="inspector" pos={[-1.1, 0, 0.2]} rotY={0.25 * k2} pose={mix(pose(1), notebookHands)} />
      <Who id="inspector2" pos={[1.1, 0, -0.2]} rotY={0.4 * k2} pose={pose(2)} />
    </Shot>
  );
};

const S03: React.FC<SP> = ({ t, k }) => (
  <Shot light={LIGHT.day} k={k} a={{ pos: [0, 0.8, 7.5], target: [0, 1.2, -3], fov: 50 }} b={{ pos: [0.8, 0.8, 7], target: [1, 1.2, -3], fov: 50 }}>
    <StreetCorner />
    {Array.from({ length: 16 }, (_, i) => {
      const x0 = -16 + i + hash(i + 1) * 0.6; // evenly spread, so the frame is never empty
      const v = 5.5 + hash(i + 7) * 0.4;
      const z = -5 + hash(i + 3) * 8;
      return <RatA key={i} pos={[-8 + ((((x0 + 16 + v * (t - 5.3)) % 16) + 16) % 16), 0, z]} rotY={Math.PI / 2 + (hash(i + 9) - 0.5) * 0.3} t={t} run cut seed={i} scale={1.15} />;
    })}
  </Shot>
);

const S04: React.FC<SP> = ({ t, k }) => {
  const m = smooth(clamp01((t - 8.15) / 0.6));
  // the stump is at the rat's rear: rat at the origin facing +x → rear ≈ (−0.66, 0.37, 0)
  const lensAt: V3 = [-1.0, 0.5, 0.42];
  return (
    <Shot light={LIGHT.day} k={k} a={{ pos: [-2.8, 1.1, 2.6], target: [-0.6, 0.5, 0], fov: 34 }} b={{ pos: [-2.4, 1.0, 2.2], target: [-0.6, 0.45, 0], fov: 33 }}>
      <StreetCorner sign={false} />
      <RatA pos={[0, 0, 0]} rotY={Math.PI / 2} t={t} cut pose={{ face: 'sly' }} />
      <group position={mixV([-2.0, 2.2, 1.2], lensAt, m)} rotation={[-0.18, -0.7, 0]}>
        <Lens />
      </group>
    </Shot>
  );
};

const S05: React.FC<SP> = ({ t, k }) => (
  <Shot light={LIGHT.office} k={k} a={{ pos: [1.4, 4.8, 9.4], target: [-0.8, 4.5, -6], fov: 48 }} b={{ pos: [1.0, 4.7, 8.2], target: [-0.8, 4.5, -6], fov: 47 }}>
    <OfficeCorner />
    <WallCard map={blueprintTex()} pos={[0.6, 6.2, -9.6]} size={[8, 5.5]} frame="#2a2420" />
    <Who
      id="official"
      pos={[-2.9, 0, -5.4]}
      rotY={0.55}
      pose={mix(breathe(t, 3), {
        face: 'smug',
        handR: reachTo(t, 10.4, 11.0, [0.7, 2.4, 0.4], [1.4, 3.7, 0.5]),
        holdR: <Toon geometry={G.cyl} color="#2a2420" position={[0.5, 0.45, 0]} rotation={[0, 0, -1.0]} scale={[0.04, 1.4, 0.04]} line={2} />,
        handL: [-0.75, 2.1, 0.2],
      })}
    />
  </Shot>
);

const tunnelLamps = [
  { pos: [-7, 4.8, 1] as V3, color: '#ffc870', power: 40, dist: 20 },
  { pos: [7, 4.8, -8] as V3, color: '#ffc870', power: 40, dist: 20 },
  { pos: [-7, 4.8, -17] as V3, color: '#ffc870', power: 40, dist: 20 },
];

const S06: React.FC<SP> = ({ t, k }) => {
  const w = sm(t, 13.1, 13.6); // «massive»: arms open smoothly
  return (
    <Shot light={LIGHT.sewer} lamps={tunnelLamps} k={k} a={{ pos: [1.8, 3.8, 5.5], target: [4.4, 3.4, -2], fov: 44 }} b={{ pos: [0.2, 5, 12], target: [2, 2.6, -10], fov: 50 }}>
      <Tunnel />
      <Who
        id="official"
        pos={[4.9, 0.6, -2]}
        rotY={-0.45}
        pose={mix(breathe(t, 1), { face: w > 0.5 ? 'grin' : 'smug', handL: mixV([-0.78, 2.1, 0.1], [-1.5, 3.7, 0.5], w), handR: mixV([0.78, 2.1, 0.1], [1.5, 3.7, 0.5], w) })}
      />
      {/* the sewer is new and clean: no rats yet (they arrive in the next shot) */}
    </Shot>
  );
};

const S07: React.FC<SP> = ({ t, k }) => (
  <Shot light={LIGHT.sewer} lamps={tunnelLamps} k={k} a={{ pos: [-0.6, 2.2, 9], target: [-3.6, 1.6, -2], fov: 44 }} b={{ pos: [-1.6, 1.9, 7.2], target: [-3.8, 1.4, 1], fov: 42 }}>
    <Tunnel />
    {Array.from({ length: 16 }, (_, i) => {
      const s = i % 2 ? 1 : -1;
      const x = s * (4 + hash(i + 2) * 3);
      const z = 1 - hash(i + 5) * 26;
      const t0 = 15.9 + i * 0.18; // «creating a paradise»: rats arrive one by one
      if (t < t0) return null;
      const g = clamp01((t - t0) / 0.35);
      const bob = (1 - Math.cos(t * 4 + i)) * 0.06;
      return <RatA key={i} scale={1.1 * (0.6 + 0.4 * smooth(g))} pos={[x, 0.6 + bob + (1 - g) * 0.4, z]} rotY={face([x, 0, z], [0, 0, 8]) + (hash(i) - 0.5)} t={t} pose={{ stand: i % 3 === 0, face: 'happy' }} />;
    })}
    {t >= 16.4 && <RatA pos={[-4.0, 0.6 + (1 - sm(t, 16.4)) * 0.5, 3.4]} rotY={0.5} t={t} pose={{ stand: true, face: t >= 18.7 ? 'sly' : 'happy' }} scale={1.3 * (0.6 + 0.4 * sm(t, 16.4))} />}
  </Shot>
);

const stampHit = (t: number, hits: number[]) => Math.max(...hits.map((h) => (Math.abs(t - h) < 0.25 ? 1 - Math.abs(t - h) / 0.25 : 0)));
const Stamp = () => (
  <group>
    <Toon geometry={G.cyl} color="#7a3a22" position={[0, 0.2, 0]} scale={[0.09, 0.35, 0.09]} line={2} />
    <Toon geometry={G.sphere} color="#7a3a22" position={[0, 0.4, 0]} scale={0.14} line={2} />
    <Toon geometry={G.box} color="#c8302c" position={[0, -0.02, 0]} scale={[0.4, 0.12, 0.28]} line={2} />
  </group>
);

const S08: React.FC<SP> = ({ t, k }) => {
  const down = stampHit(t, [21.0, 22.0, 22.9]);
  return (
    <Shot light={LIGHT.office} k={k} a={{ pos: [3.4, 5.2, 7.5], target: [0, 3.2, -3.5], fov: 42 }} b={{ pos: [2.8, 5.0, 6.4], target: [0, 3.2, -3.5], fov: 41 }}>
      <OfficeCorner />
      <WallCard map={posterTex()} pos={[-5, 5.6, -9.6]} size={[3.6, 4.6]} />
      <Desk pos={[0, 0, -2.2]} />
      <Toon geometry={G.box} color="#fbf8f0" position={[0.65, BODY.waist + 0.02, -1.6]} rotation={[0, 0.2, 0]} scale={[0.9, 0.02, 1.2]} line={2} />
      <Who id="official" pos={[0, 0, -4.6]} pose={mix(breathe(t, 2), { face: 'smug', handR: [0.65, lerp(3.2, 2.6, down), 1.5], holdR: <Stamp />, handL: [-0.6, 2.55, 1.2] })} />
    </Shot>
  );
};

const S09: React.FC<SP> = ({ t, k }) => {
  const wk = walkTo(t, 23.3, 24.7, [7, 0, -4.2], [1.6, 0, -4.2]);
  const turned = t >= 25.0; // «bounty»
  // turn to the poster, then to us — smoothly
  const rot = lerp(lerp(-Math.PI / 2, -Math.PI * 0.95, sm(t, 24.5, 24.85)), 0.25, sm(t, 24.95, 25.35));
  const rub = sm(t, 25.0, 25.4);
  return (
    <Shot light={LIGHT.office} k={k} a={{ pos: [0.6, 4.6, 9.5], target: [0, 4.4, -6], fov: 46 }} b={{ pos: [0.6, 4.5, 8.2], target: [0.4, 4.2, -6], fov: 45 }}>
      <OfficeCorner flag={false} />
      <WallCard map={posterTex()} pos={[-1.4, 5.8, -9.6]} size={[5, 6.4]} />
      <Who
        id="catcher"
        pos={wk.pos}
        rotY={rot}
        pose={mix(wk.pose, breathe(t, 4), {
          face: turned ? 'grin' : 'smug',
          ...(rub > 0 ? { handL: mixV([-0.68, 1.8, 0.15], [-0.15, 2.6, 0.95], rub), handR: mixV([0.68, 1.8, 0.15], [0.15 + Math.sin(t * 4) * 0.04, 2.62, 0.97], rub) } : {}),
        })}
      />
    </Shot>
  );
};
/** straight walk from a to b between t0 and t1 */
function path3(t: number, t0: number, t1: number, a: V3, b: V3): V3 {
  const k = clamp01((t - t0) / (t1 - t0));
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
}

const S10: React.FC<SP> = ({ t, k }) => {
  const stink = t >= 28.2; // «drowning»
  const r = sm(t, 28.2, 28.6);
  return (
    <Shot light={LIGHT.office} k={k} a={{ pos: [3.2, 4.6, 9.5], target: [0, 2.8, -2.4], fov: 46 }} b={{ pos: [2.6, 4.4, 8.2], target: [0, 2.8, -2.4], fov: 45 }}>
      <OfficeCorner />
      <Desk pos={[0, 0, -3]} />
      <Who
        id="official"
        pos={[0, 0, -5.4]}
        pose={mix(breathe(t, 5), { face: stink ? 'panic' : 'smug', lean: -0.18 * r, handL: mixV([-0.6, 2.55, 1.2], [-0.2, 3.55, 1.35], r), handR: mixV([0.6, 2.55, 1.2], [1.4, 2.9, 0.6], r) })}
      />
      {/* dead rats rain down and pile up in front of the desk */}
      {Array.from({ length: 16 }, (_, i) => {
        const t0 = 27.1 + i * 0.22;
        if (t < t0) return null;
        const f = clamp01((t - t0) / 0.35);
        const x = -3 + hash(i + 1) * 6;
        const z = -0.9 + hash(i + 4) * 2.2;
        const y = Math.floor(i / 6) * 0.45;
        return (
          <group key={i} position={[x, lerp(7, y + 0.55, f * f), z]} rotation={[Math.PI, hash(i + 2) * 6, 0]} scale={0.95}>
            <RatA pos={[0, 0, 0]} t={0} pose={{ face: 'scared' }} />
          </group>
        );
      })}
      {stink &&
        [-1.6, 0, 1.6].map((x, i) => {
          const y = 1.8 + ((t * 0.8 + i * 0.4) % 1.6);
          return <Glow key={i} geometry={new THREE.TorusGeometry(0.45, 0.06, 6, 20, Math.PI)} color="#8fd35a" opacity={0.85} position={[x + Math.sin(t * 3 + i) * 0.2, y, 0.2]} rotation={[0, 0, Math.sin(t * 4 + i) * 0.4]} />;
        })}
    </Shot>
  );
};

const S11: React.FC<SP> = ({ t, k }) => {
  const up = t >= 31.85; // «one simple rule»
  return (
    <Shot light={LIGHT.office} k={k} a={{ pos: [0.7, 4.7, 1.2], target: [0, 4.1, -5.4], fov: 40 }} b={{ pos: [0.6, 4.6, 0.2], target: [0, 4.1, -5.4], fov: 39 }}>
      <OfficeCorner />
      <Desk pos={[0, 0, -3]} />
      <Who
        id="official"
        pos={[0, 0, -5.4]}
        pose={mix(breathe(t, 6), {
          face: 'smug',
          handL: [-0.6, 2.55, 1.2],
          handR: up ? reachTo(t, 31.85, 32.2, [0.6, 2.55, 1.2], [1.35, 4.3, 0.7]) : [0.6, 2.55, 1.2],
          holdR: up ? <Toon geometry={G.stick} color="#f6f4ef" position={[0, 0.2, 0]} scale={[0.05, 0.18, 0.05]} line={2} /> : undefined,
        })}
      />
    </Shot>
  );
};

const S12: React.FC<SP> = ({ t, k }) => {
  const CIT: V3 = [0.5, 0, 2.95];
  const rot = Math.PI;
  const placed = t >= 34.8; // «tail»
  const hw = mixV(mixV([0.7, 2.6, 1.9], [0.55, 2.95, 1.25], sm(t, 33.6, 34.4)), [0.6, 2.55, 1.6], sm(t, 34.85, 35.3));
  const hand = toLocal(hw, CIT, rot);
  return (
    <Shot light={LIGHT.office} k={k} a={{ pos: [-2.8, 6.6, -5.4], target: [0.4, 2.8, 1.6], fov: 44 }} b={{ pos: [-2.5, 6.4, -4.8], target: [0.4, 2.8, 1.6], fov: 43 }}>
      <OfficeCorner side={0} />
      <Desk pos={[0, 0, 0]} />
      <Who id="official" pos={[0, 0, -2.4]} pose={{ face: 'smug', handL: [-0.6, 2.55, 1.2], handR: [0.6, 2.55, 1.2] }} />
      <Who id="citizen1" pos={CIT} rotY={rot} pose={mix(breathe(t, 7), { face: 'grin', handR: hand, holdR: placed ? undefined : <HeldTail /> })} />
      {placed && (
        <group position={[0.45, BODY.waist + 0.05, 0.6]} rotation={[0, 0.3, -Math.PI / 2]}>
          <HeldTail />
        </group>
      )}
    </Shot>
  );
};

const S13: React.FC<SP> = ({ t, k }) => {
  const caught = t >= 36.2; // «coin»
  const cy = lerp(8, 2.75, clamp01((t - 35.7) / 0.5) ** 2);
  return (
    <Shot light={LIGHT.office} k={k} a={{ pos: [0.9, 4.0, 4.8], target: [0.3, 3.5, -1.5], fov: 42 }} b={{ pos: [0.8, 4.0, 4.0], target: [0.3, 3.5, -1.5], fov: 41 }}>
      <OfficeCorner />
      <Who
        id="citizen1"
        pos={[0, 0, -1.5]}
        pose={mix(breathe(t, 8), {
          face: caught ? 'grin' : 'o',
          look: [0.4, caught ? 0.2 : -0.3],
          handR: caught ? reachTo(t, 36.2, 36.5, [0.8, 2.6, 1.1], [1.35, 4.0, 0.8]) : [0.8, 2.6, 1.1],
          holdR: caught ? (
            <group scale={2.4}>
              <HeldCoin />
            </group>
          ) : undefined,
        })}
      />
      {!caught && t > 35.7 && <Toon geometry={G.cyl} color="#f0c64e" position={[0.85, cy, -0.4]} rotation={[t * 12, 0, 0]} scale={[0.29, 0.07, 0.29]} line={2} />}
      {caught && <Glow geometry={G.sphere} color="#fff3a0" opacity={0.6 * (1 - clamp01((t - 36.2) / 0.5))} position={[1.35, 4.2, -0.7]} scale={0.8} />}
    </Shot>
  );
};

const S14: React.FC<SP> = ({ t, k }) => (
  <Shot light={LIGHT.office} k={k} a={{ pos: [0.3, 2.5, 6.5], target: [0, 4.2, -5], fov: 48 }} b={{ pos: [0.2, 2.6, 5.4], target: [0, 4.3, -5], fov: 47 }}>
    <OfficeCorner />
    <Desk pos={[0, 0, -3]} />
    <Who id="official" pos={[0, 0, -5.4]} pose={{ face: 'grin', handL: [-1.55, 4.0 + Math.sin(t * 3.5) * 0.12, 0.5], handR: [1.55, 4.0 + Math.sin(t * 3.5 + 1) * 0.12, 0.5], hips: [0, (1 - Math.cos(t * 4)) * 0.05, 0] }} />
    <CoinRain t={t} t0={37.0} n={40} x={[-5, 5]} z={[-7, -1]} top={12} />
  </Shot>
);

const S15: React.FC<SP> = ({ t, k }) => {
  const n = Math.round((20000 * smooth(clamp01((t - 40.0) / 2.4))) / 250) * 250;
  const who = ['citizen1', 'citizen2', 'catcher', 'citizen1', 'citizen2', 'catcher'];
  return (
    <Shot light={LIGHT.office} k={k} a={{ pos: [-0.6, 4.8, 10.5], target: [-0.6, 4.0, -4], fov: 50 }} b={{ pos: [0.2, 4.8, 9.6], target: [0.2, 4.0, -4], fov: 49 }}>
      <OfficeCorner side={0} />
      <WallCard map={chalkTex(n)} pos={[3.4, 7.0, -9.6]} size={[6, 4]} frame="#7a4424" />
      {who.map((id, i) => {
        const x = -9 + i * 2.6 + (t - 39.5) * 0.5;
        return (
          <Who
            key={i}
            id={id}
            pos={[x, 0, -3.2 + (i % 2) * 0.5]}
            rotY={Math.PI / 2}
            pose={mix(walkPose(t * 1.6 + i, 0.5), { face: i % 2 ? 'grin' : 'smile', handR: [0.7, 2.3, 0.6], holdR: <HeldTail /> })}
          />
        );
      })}
      {[[-4, 1.5], [2, 1.2]].map(([x, z], i) => {
        const B = O(i ? 'bucket' : 'sack');
        return (
          <group key={i} position={[x, 0, z]}>
            <B />
          </group>
        );
      })}
    </Shot>
  );
};

const nightLamps = [{ pos: [4, 6.2, -8.4] as V3, color: '#ffbf60', power: 45, dist: 22 }];

const S16: React.FC<SP> = ({ t, k }) => {
  const scared = t >= 44.5; // «realized»
  return (
    <Shot light={LIGHT.night} lamps={nightLamps} k={k} a={{ pos: [3.6, 4.2, 8], target: [-1.2, 3.8, -2.5], fov: 44 }} b={{ pos: [3.0, 4.1, 6.8], target: [-1.2, 3.8, -2.5], fov: 43 }}>
      <AlleyCorner />
      {/* the corner they hide behind */}
      <Toon geometry={G.box} color="#3f4890" position={[-5.4, 6.5, -2.4]} scale={[4, 13, 3]} line={3} />
      <Who id="inspector" pos={[-1.4, 0, -2.4]} rotY={0.55} pose={{ face: scared ? 'panic' : 'o', lean: 0.12, ...notebookHands }} />
      <Who id="inspector2" pos={[0.9, 0, -2.2]} rotY={0.45} pose={{ face: scared ? 'panic' : 'o', lean: 0.12 }} />
    </Shot>
  );
};

const S17: React.FC<SP> = ({ t, k }) => {
  const pet = Math.sin(t * 2.2) * 0.07; // slow, gentle petting (never jerky, QA-043)
  const wink = t >= 48.7 && t < 49.1; // «income»
  return (
    <Shot light={LIGHT.night} lamps={[{ pos: [2, 6, 2], color: '#ffbf60', power: 30, dist: 14 }]} k={k} a={{ pos: [0.6, 3.6, 5.2], target: [0, 3.3, -2], fov: 42 }} b={{ pos: [0.5, 3.6, 4.4], target: [0, 3.3, -2], fov: 41 }}>
      <AlleyCorner />
      <Who id="catcher" pos={[0, 0, -2]} pose={{ face: wink ? 'squint' : 'smug', handL: [-0.45, 2.25, 1.05], handR: [0.3, 2.85 + pet, 1.05] }} />
      <RatA pos={[0, 2.05, -0.95]} t={t} pose={{ face: 'happy' }} scale={1.05} />
    </Shot>
  );
};

const S18: React.FC<SP> = ({ t, k }) => {
  const cut = t >= 51.6; // «snipping»
  const CATCH: V3 = [-0.9, 0, -3.7];
  const hand = toLocal([-1.15, 1.75, -2.05], CATCH, 0);
  const fall = clamp01((t - 51.6) / 0.4);
  const Trap = O('trap');
  return (
    <Shot light={LIGHT.night} lamps={nightLamps} k={k} a={{ pos: [-0.6, 2.5, 3.4], target: [-0.5, 1.6, -2], fov: 42 }} b={{ pos: [-0.6, 2.4, 2.7], target: [-0.5, 1.6, -2], fov: 41 }}>
      <AlleyCorner />
      <Tx geometry={box} map={plankTex('#8a6a44', [2, 1])} position={[0, 0.6, -2]} scale={[2.6, 1.2, 1.6]} line={3} />
      <RatA pos={[0, 1.2, -2]} rotY={Math.PI / 2} t={t} cut={cut} pose={{ face: cut ? 'scared' : 'happy' }} />
      {cut && (
        <group position={[-1.15, lerp(1.45, 0.05, fall * fall), -1.9]} rotation={[0, 0, lerp(0, -Math.PI / 2, fall)]}>
          <HeldTail />
        </group>
      )}
      <Who id="catcher" pos={CATCH} pose={mix(crouch(0.45), { face: 'smug', handR: [hand[0], hand[1] + (cut && t < 51.8 ? -0.08 : 0), hand[2]], holdR: <HeldScissors />, handL: [-0.5, 1.4, 1.0] })} />
      <group position={[2.6, 0, -2.6]} rotation={[0, -0.4, 0]}>
        <Trap />
      </group>
    </Shot>
  );
};

const S19: React.FC<SP> = ({ t, k }) => {
  const run = clamp01((t - 52.9) / 0.9);
  const dive = clamp01((t - 53.8) / 0.35);
  const p: V3 = [lerp(3.6, 0.3, run), -dive * 1.2, lerp(1.4, -1.7, run)];
  return (
    <Shot light={LIGHT.night} lamps={nightLamps} k={k} a={{ pos: [2.4, 6.8, 4.8], target: [0.4, 0, -1.6], fov: 44 }} b={{ pos: [1.8, 6.2, 3.8], target: [0.3, 0, -1.8], fov: 43 }}>
      <AlleyCorner />
      <OpenManhole pos={[0, 0, -2]} />
      {dive < 1 && <RatA pos={p} rotY={face([3.6, 0, 1.4], [0, 0, -2])} t={t} run={run > 0 && run < 1} cut pose={{ face: 'happy' }} pitch={dive * 1.2} />}
      {Array.from({ length: 5 }, (_, i) => {
        const t0 = 55.0 + i * 0.25;
        if (t < t0) return null;
        const a = -2.2 + i * 1.1;
        const d = Math.min(2.2, 1.0 + (t - t0) * 2);
        return <RatA key={i} pos={[Math.sin(a) * d, 0, -2 + Math.cos(a) * d]} rotY={a} t={t} run={d < 2.2} scale={0.6} seed={i} />;
      })}
    </Shot>
  );
};

const S20: React.FC<SP> = ({ t, k }) => {
  const F = O('farm');
  const shock = t >= 59.3;
  return (
    <Shot light={LIGHT.sunset} k={k} a={{ pos: [2.2, 4.6, 12.5], target: [0.6, 3.4, -3], fov: 48 }} b={{ pos: [1.6, 4.5, 10.8], target: [0.6, 3.4, -3], fov: 47 }}>
      <FarmCorner />
      {[-4.4, 4.4].map((x) => (
        <group key={x} position={[x, 0, -6.5]}>
          <F />
        </group>
      ))}
      <Who id="farmer" pos={[-0.6, 0, -3]} rotY={0.15} pose={mix(breathe(t, 3), { face: 'smug', handL: [-0.25, 2.5, 0.9], handR: mixV([0.25, 2.45, 0.92], [1.55, 4.0, 0.5 + Math.sin(t * 4) * 0.25], sm(t, 60.0, 60.4)) })} />
      {[0, 1].map((i) => {
        const wk = walkTo(t, 58.0, 59.2, [10 + i * 1.6, 0, -0.6 + i * 0.8], [3.4 + i * 1.8, 0, -0.6 + i * 0.8], i);
        const sh = sm(t, 59.3, 59.7);
        return (
          <Who
            key={i}
            id={i ? 'inspector2' : 'inspector'}
            pos={wk.pos}
            rotY={lerp(-Math.PI / 2, -0.7, sm(t, 59.0, 59.4))}
            pose={mix(wk.pose, breathe(t, i), { face: shock ? 'panic' : 'o' }, i === 0 ? { handL: mixV([-0.68, 1.8, 0.15], [-1.5, 3.8, 0.5], sh), handR: mixV([0.68, 1.8, 0.15], [1.5, 3.8, 0.5], sh) } : {})}
          />
        );
      })}
    </Shot>
  );
};

const S21: React.FC<SP> = ({ t, k }) => {
  const torn = clamp01((t - 62.2) / 0.6); // «scrapped»
  return (
    <Shot light={LIGHT.office} k={k} a={{ pos: [0.6, 4.8, 8.4], target: [-0.6, 4.6, -7], fov: 46 }} b={{ pos: [0.5, 4.7, 7.4], target: [-0.6, 4.6, -7], fov: 45 }}>
      <OfficeCorner flag={false} />
      {[0, 1].map((s) => {
        const dir = s ? 1 : -1;
        return (
          <group key={s} position={[dir * 1.25 + dir * torn * 1.2, 5.8 - torn * torn * 5.2, -9.4 + torn * 1.2]} rotation={[-torn * 1.4, 0, dir * torn * 0.8]}>
            <Toon geometry={G.box} color="#5a3a24" scale={[2.65, 6.6, 0.08]} line={2} />
            <Tx geometry={plane} map={halfTex(s as 0 | 1)} position={[0, 0, 0.05]} scale={[2.5, 6.4, 1]} line={0} />
          </group>
        );
      })}
      <Who
        id="official"
        pos={[-3.4, 0, -6.6]}
        rotY={0.5}
        pose={mix(breathe(t, 9), { face: 'panic', handL: mixV([-0.8, 3.0, 1.2], [-1.55, 4.0 + Math.sin(t * 4.5) * 0.12, 0.5], sm(t, 63.0, 63.4)), handR: mixV([0.8, 3.0, 1.2], [1.55, 4.0 + Math.sin(t * 4.5 + 1) * 0.12, 0.5], sm(t, 63.0, 63.4)) })}
      />
    </Shot>
  );
};

const S22: React.FC<SP> = ({ t, k }) => (
  <Shot light={LIGHT.day} k={k} a={{ pos: [0, 9.5, 15], target: [0, 0.5, -3], fov: 46 }} b={{ pos: [0, 8.8, 13.4], target: [0, 0.5, -3], fov: 46 }}>
    <StreetCorner />
    {Array.from({ length: 34 }, (_, i) => {
      const cx = -12 + hash(i + 1) * 24;
      const cz = -8 + hash(i + 2) * 14;
      const a = t * (0.6 + hash(i + 3)) + i;
      const r = 0.6 + hash(i + 4) * 0.8;
      return <RatA key={i} pos={[cx + Math.sin(a) * r, 0, cz + Math.cos(a) * r]} rotY={a + Math.PI / 2} t={t} run cut={hash(i + 5) < 0.6} seed={i} />;
    })}
  </Shot>
);

const S23: React.FC<SP> = ({ t, k }) => (
  <Shot light={LIGHT.day} k={k} a={{ pos: [0, 3.9, 8], target: [0, 3.0, 0], fov: 44 }} b={{ pos: [0, 3.9, 7], target: [0, 3.0, 0], fov: 43 }}>
    <StreetCorner />
    <Who id="inspector" pos={[-1.1, 0, 0.3]} rotY={0.1} pose={mix(breathe(t, 1), { face: 'squint', headTilt: 0.15, look: [0, -0.5], ...notebookHands })} />
    <Who id="inspector2" pos={[1.1, 0, 0.1]} rotY={-0.1} pose={mix(breathe(t, 2), { face: 'neutral', headTilt: -0.12, look: [0, -0.6] })} />
    {Array.from({ length: 6 }, (_, i) => {
      const a = t * 1.4 + (i * Math.PI * 2) / 6;
      return <RatA key={i} pos={[Math.sin(a) * 2.6, 0, 0.6 + Math.cos(a) * 1.4]} rotY={a + Math.PI / 2} t={t} run cut={i % 2 === 0} seed={i} />;
    })}
  </Shot>
);

const S24: React.FC<SP> = ({ t, k }) => (
  <Shot light={LIGHT.office} k={k} a={{ pos: [0.8, 5, 9], target: [-0.4, 5, -8], fov: 46 }} b={{ pos: [0.6, 5, 7.8], target: [-0.4, 5, -8], fov: 45 }}>
    <OfficeCorner />
    <WallCard map={chartTex()} pos={[1.2, 6.2, -9.6]} size={[7, 5]} frame="#2a2420" />
    <Who id="official" pos={[-2.2, 0, -6]} rotY={0.45} pose={mix(breathe(t, 4), { face: 'o', look: [0.6, 0.3], handL: [-0.75, 2.1, 0.2], handR: [1.35, 4.2, 0.6] })} />
  </Shot>
);

const CoinHill: React.FC = () => (
  <group>
    <Toon geometry={G.cone} color="#e0b23e" position={[0, 1.1, 0]} scale={[2.6, 2.2, 2.6]} line={4} />
    {Array.from({ length: 40 }, (_, i) => {
      const a = hash(i) * 6.28;
      const h = hash(i + 9) * 2.0;
      const r = (1 - h / 2.2) * 2.5;
      return <Toon key={i} geometry={G.cyl} color={i % 2 ? '#f0c64e' : '#d9a83a'} position={[Math.sin(a) * r, h + 0.05, Math.cos(a) * r]} rotation={[0.5 + hash(i + 3), a, 0]} scale={[0.26, 0.06, 0.26]} line={2} />;
    })}
  </group>
);

const S25: React.FC<SP> = ({ t, k }) => (
  <Shot light={LIGHT.office} lamps={[{ pos: [0, 8, 2], color: '#ffe0a0', power: 25, dist: 16 }]} k={k} a={{ pos: [0.8, 4.2, 7.5], target: [0.6, 3.5, -2], fov: 42 }} b={{ pos: [0.8, 4.8, 10], target: [0.4, 3.4, -2.5], fov: 44 }}>
    <OfficeCorner />
    <group position={[2.6, 0, -3.6]}>
      <CoinHill />
    </group>
    <Who id="catcher" pos={[-0.4, 0, -2]} rotY={0.2} pose={mix(breathe(t, 5), { face: 'grin', handR: [1.55, 4.0, 0.5], holdR: <HeldTail />, handL: [-0.6, 2.5, 1.0], holdL: <HeldCoin /> })} />
    {(() => {
      const S = O('sack');
      return (
        <group position={[-2.8, 0, -1.4]}>
          <S />
        </group>
      );
    })()}
  </Shot>
);

export const SHOTS: ShotDef[] = [
  { from: 0, to: 3.0, name: 'Улица: инспекторы идут', C: S01 },
  { from: 3.0, to: 5.3, name: 'Лица: заметили', C: S02 },
  { from: 5.3, to: 8.1, name: 'Бегут бесхвостые крысы', C: S03 },
  { from: 8.1, to: 10.0, name: 'Лупа: обрубок хвоста', C: S04 },
  { from: 10.0, to: 12.6, name: 'Чиновник у плана канализации', C: S05 },
  { from: 12.6, to: 15.6, name: 'Канализация: «massive»', C: S06 },
  { from: 15.6, to: 20.4, name: 'Рай для крыс', C: S07 },
  { from: 20.4, to: 23.3, name: 'Штамп: свободный рынок', C: S08 },
  { from: 23.3, to: 27.0, name: 'Плакат «награда»', C: S09 },
  { from: 27.0, to: 31.0, name: 'Офис тонет в дохлых крысах', C: S10 },
  { from: 31.0, to: 33.1, name: 'Одно простое правило', C: S11 },
  { from: 33.1, to: 35.6, name: 'Хвост на стол', C: S12 },
  { from: 35.6, to: 37.0, name: 'Монета в руку', C: S13 },
  { from: 37.0, to: 39.5, name: 'Триумф', C: S14 },
  { from: 39.5, to: 43.1, name: 'Очередь, 20 000 в день', C: S15 },
  { from: 43.1, to: 46.9, name: 'Инспекторы подглядывают', C: S16 },
  { from: 46.9, to: 49.3, name: 'Ловец с крысой', C: S17 },
  { from: 49.3, to: 52.6, name: 'Чик: хвост отрезан', C: S18 },
  { from: 52.6, to: 56.65, name: 'Крыса в люк, крысята', C: S19 },
  { from: 56.65, to: 61.45, name: 'Крысиная ферма', C: S20 },
  { from: 61.45, to: 64.0, name: 'Плакат порван', C: S21 },
  { from: 64.0, to: 66.3, name: 'Город полон крыс', C: S22 },
  { from: 66.3, to: 69.05, name: 'Грустные инспекторы', C: S23 },
  { from: 69.05, to: 71.75, name: 'График: цель и крысы', C: S24 },
  { from: 71.75, to: 75.4, name: 'Метрика: гора монет', C: S25 },
];

void ramp;
