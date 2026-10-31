/**
 * Stage 5: the animated film, scene by scene. All times are FILM seconds (voice.srt).
 * Each scene = one location + its shots (camera keyframes) + animated actors.
 * Director's notes are in the comments: what the shot does and why.
 */
import { LOCATIONS } from '../locations';
import { AlleySet } from '../locations/alley';
import { OfficeSet } from '../locations/office';
import { OBJECTS } from '../objects';
import { BODY } from '../lib/style';
import { clamp01, lerp, hash } from '../lib/anim';
import { HeldCoin, HeldMagnifier, HeldNotebook, HeldScissors, HeldTail, crouch } from '../staging';
import { CoinRain, RatA, RatSwarm, Scene, Who, bump, camAt, easeIn, easeOut, face, idle, linear, mix, path, reachTo, toLocal, walkPose, type Shot, type V3 } from './kit';

const L = (id: string) => LOCATIONS.find((l) => l.id === id)!;
const O = (id: string) => OBJECTS.find((o) => o.id === id)!.C;
const k01 = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
/** notebook held in both hands; right hand "writes" */
const writing = (t: number) => ({ handL: [-0.25, 2.55, 0.6] as V3, handR: [0.2 + Math.sin(t * 11) * 0.06, 2.65 + Math.cos(t * 7) * 0.03, 0.65] as V3, holdL: <HeldNotebook /> });

/* =====================================================================
 * 1 · STREET 0:00–10.1 — "In 1902 health inspectors in Hanoi noticed…"
 * Crane-down establishing → push-in + snap-zoom on "bizarre" → low tracking
 * shot racing with tail-less rats → macro on the stump → top-down dive into
 * the manhole (match-cut to the sewer).
 * ===================================================================== */
const S1: Shot[] = [
  { from: 0, to: 3, ease: easeOut, k: [
    { t: 0, pos: [-48, 36, 8], target: [14, 0, 0], fov: 50, roll: -0.1 },
    { t: 3, pos: [-20, 5.2, 1.5], target: [6, 3.2, -2], fov: 52, roll: 0 },
  ] },
  { from: 3, to: 5.3, k: [
    { t: 3, pos: [-0.2, 3.9, 4.8], target: [-4.6, 2.3, -7.4], fov: 48 },
    { t: 3.85, pos: [-0.7, 3.7, 3.9], fov: 46, target: [-4.6, 2.3, -7.4] },
    { t: 4.0, pos: [-0.75, 3.7, 3.85], target: [-4.4, 2.1, -7], fov: 33 },
    { t: 5.3, pos: [-1.2, 3.5, 3.2], target: [-4.2, 2.0, -7], fov: 31 },
  ] },
  { from: 5.3, to: 8.1, ease: linear, shake: 0.08, k: [
    { t: 5.3, pos: [-9, 0.8, 4.6], target: [0, 0.6, 0], fov: 56, roll: 0.06 },
    { t: 8.1, pos: [7, 0.9, 4.6], target: [16, 0.6, -0.5], fov: 56, roll: -0.06 },
  ] },
  { from: 8.1, to: 9.4, shake: (t) => 0.02 + bump(t, 9.2, 0.15), k: [
    { t: 8.1, pos: [-6.4, 1.5, -3.2], target: [-2.6, 0.4, -4.8], fov: 34 },
    { t: 9.15, pos: [-6.0, 1.35, -3.5], target: [-2.6, 0.4, -4.8], fov: 30 },
    { t: 9.25, pos: [-5.95, 1.35, -3.55], target: [-2.75, 0.4, -4.8], fov: 18 },
    { t: 9.4, pos: [-5.9, 1.35, -3.6], target: [-2.75, 0.4, -4.8], fov: 17 },
  ] },
  { from: 9.4, to: 10.1, ease: easeIn, k: [
    { t: 9.4, pos: [3.3, 17, -0.2], target: [3, 0, -0.5], fov: 55, roll: 0 },
    { t: 10.1, pos: [3.04, 0.5, -0.48], target: [3, 0, -0.5], fov: 75, roll: 1.2 },
  ] },
];

export const Street1: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('street');
  const ratRot = t < 8 ? 0.5 : Math.PI / 2;
  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(S1, t)}>
      <loc.Set />
      {/* inspector writes, then freezes on "bizarre" */}
      <Who id="inspector" pos={[-6, 0.3, -9.4]} rotY={0.55} pose={mix(idle(t, 1), writing(t < 3.9 ? t : 3.9), { face: t < 3.9 ? 'neutral' : 'o', look: [0.6, -0.4], headTilt: t > 3.9 ? -0.12 : 0 })} />
      {/* crouched partner with the magnifier, startled jerk at 3.9 */}
      <Who
        id="inspector2"
        pos={[-3.6, 0, -6.6]}
        rotY={0.9}
        pose={mix(crouch(0.5), {
          handR: [0.25 + Math.sin(t * 1.3) * 0.05, 1.4 + (t > 3.9 && t < 4.2 ? 0.25 : 0), 1.15],
          holdR: <HeldMagnifier />,
          face: t < 3.9 ? 'neutral' : 'o',
          look: [0, -1],
          headTilt: t > 3.9 && t < 4.3 ? 0.2 : 0,
        })}
      />
      <RatA pos={[-2.6, 0, -4.8]} rotY={ratRot} t={t} cut pose={{ face: 'sly' }} />
      {/* the city full of tail-less rats */}
      <RatSwarm t={t} n={26} x0={-40} x1={40} z0={-3.2} z1={6.5} speed={[6, 8.5]} cut={0.85} seed={3} />
      {/* rats racing across the manhole for the top-down dive */}
      {[0, 1, 2, 3].map((i) => (
        <RatA key={i} pos={[-3 + (t - 9.1 - i * 0.12) * 9, 0, -0.5 + (i - 1.5) * 0.9]} rotY={Math.PI / 2} t={t} run cut={i !== 2} seed={i + 40} />
      ))}
      <Who id="citizen2" pos={[8, 0.3, 10.5]} rotY={-2.6} pose={mix(idle(t, 4), { face: 'o', handL: [-0.4, 3.4, 0.6] })} />
    </Scene>
  );
};

/* =====================================================================
 * 2 · SEWER 10.1–20.5 — "Months earlier French officials had built…"
 * Fall down the shaft with a spin → the official, low arc, arms open on
 * "massive", then a fast crane-back reveal → FPV flight down the tunnel
 * over the water, rats everywhere → push-in on a rat standing up.
 * ===================================================================== */
const S2: Shot[] = [
  { from: 10.1, to: 11.6, ease: easeOut, k: [
    { t: 10.1, pos: [18.1, 15.4, -6.55], target: [18.5, 0.6, -5.2], fov: 74, roll: 0 },
    { t: 11.6, pos: [17.6, 4.0, -5.4], target: [14, 2.6, -5.6], fov: 58, roll: 0.35 },
  ] },
  { from: 11.6, to: 15.9, k: [
    { t: 11.6, pos: [6.2, 2.6, -1.6], target: [12, 3.6, -6], fov: 42, roll: 0.05 },
    { t: 13.4, pos: [7.4, 2.8, -0.6], target: [12, 3.7, -6], fov: 40, roll: 0 },
    { t: 13.9, pos: [7.5, 2.9, -0.5], target: [12, 3.7, -6], fov: 40 },
    { t: 15.9, pos: [-8, 8.5, 5.5], target: [24, 1.5, -2], fov: 62 },
  ] },
  { from: 15.9, to: 20.5, ease: linear, shake: 0.06, k: [
    { t: 15.9, pos: [-2, 2.6, 0.4], target: [10, 1.6, 0], fov: 64, roll: 0.1 },
    { t: 17.0, pos: [12, 2.3, 1.2], target: [24, 1.4, -0.5], roll: -0.12 },
    { t: 18.2, pos: [27, 2.2, -0.8], target: [39, 1.2, -2], roll: 0.1 },
    { t: 19.2, pos: [40, 2.0, -0.6], target: [52, 1.0, -4], fov: 50, roll: -0.04 },
    { t: 20.15, pos: [50.5, 1.6, -1.8], target: [56, 1.0, -5.4], fov: 36, roll: 0 },
    { t: 20.5, pos: [51, 1.6, -1.9], target: [58, 1.0, -1.0], fov: 36 },
  ] },
];

export const Sewer: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('sewer');
  const open = k01(t, 13.25, 13.6);
  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(S2, t)}>
      <loc.Set />
      <Who
        id="official"
        pos={[12, 0.6, -6]}
        rotY={-0.6}
        pose={mix(idle(t, 2), {
          face: 'grin',
          look: [0.3, 0.2],
          handL: reachTo(t, 13.25, 13.6, [-0.75, 2.0, 0.35], [-1.5, 3.9, 0.5]),
          handR: reachTo(t, 13.25, 13.6, [0.75, 2.0, 0.35], [1.5, 3.9, 0.5]),
          lean: -0.08 * open,
          hips: [0, open * 0.08, 0],
        })}
      />
      {/* both walkways crawling with rats, running both ways */}
      <RatSwarm t={t} n={22} x0={-10} x1={70} z0={3.9} z1={8} y={0.6} dir={Math.PI / 2} speed={[3, 6]} cut={0} seed={7} />
      <RatSwarm t={t} n={22} x0={-10} x1={70} z0={-8} z1={-3.9} y={0.6} dir={-Math.PI / 2} speed={[3, 6]} cut={0} seed={9} />
      {/* the hero rat for the final push-in: stands up, sly */}
      <RatA pos={[56, 0.6, -5.4]} rotY={-1.0} t={t} pose={{ stand: t > 19.6, face: 'sly' }} scale={1.25} />
    </Scene>
  );
};

/* =====================================================================
 * 3 · OFFICE 20.5–43.3 — bounty, the tail rule, triumph, 20 000 a day.
 * ===================================================================== */
const OFF = { pos: [0, 0, -9.4] as V3 }; // official behind the desk
const CIT_DESK: V3 = [1.5, 0, -4.4]; // citizen in front of the desk
const S3: Shot[] = [
  // crane down from the ceiling fan to the hall
  { from: 20.5, to: 23.3, ease: easeOut, k: [
    { t: 20.5, pos: [4, 13, 16], target: [-2, 2, -8], fov: 56, roll: 0.15 },
    { t: 23.3, pos: [2, 6.2, 11], target: [0, 3.4, -8], fov: 48, roll: 0 },
  ] },
  // push into the poster, snap-zoom on "bounty"
  { from: 23.3, to: 27, k: [
    { t: 23.3, pos: [-3.2, 3.9, -3.0], target: [-6.5, 2.8, -11], fov: 50 },
    { t: 24.95, pos: [-4.5, 3.4, -5.8], target: [-6.5, 2.7, -11], fov: 44 },
    { t: 25.1, pos: [-4.55, 3.4, -5.9], target: [-6.5, 2.65, -11], fov: 28 },
    { t: 27, pos: [-4.8, 3.3, -6.4], target: [-6.5, 2.65, -11], fov: 26 },
  ] },
  // the citizen brings a carcass in: camera pans with him
  { from: 27, to: 29.2, k: [
    { t: 27, pos: [-3.2, 4.4, -4.6], target: [11, 3, 1], fov: 46 },
    { t: 29.2, pos: [-2.6, 4.2, -3.2], target: [2.5, 3, -4.4], fov: 44 },
  ] },
  // official recoils from the stink (dutch angle)
  { from: 29.2, to: 31.1, shake: 0.12, k: [
    { t: 29.2, pos: [-2.0, 4.0, -4.2], target: [0, 4.0, -9.4], fov: 38, roll: -0.12 },
    { t: 31.1, pos: [-1.8, 4.1, -4.8], target: [0, 4.1, -9.4], fov: 34, roll: -0.05 },
  ] },
  // "one simple rule": low push-in, finger up
  { from: 31.1, to: 33.3, k: [
    { t: 31.1, pos: [-2.6, 3.2, -3.4], target: [0, 4.3, -9.4], fov: 42, roll: 0 },
    { t: 33.3, pos: [-2.0, 3.6, -5.0], target: [0, 4.4, -9.4], fov: 34 },
  ] },
  // insert over the desk: tail in, coin out (slow orbit)
  { from: 33.3, to: 37.1, k: [
    { t: 33.3, pos: [4.0, 5.6, -4.0], target: [0.8, 2.4, -6.9], fov: 42 },
    { t: 37.1, pos: [3.6, 5.6, -3.8], target: [0.6, 2.5, -7.0], fov: 34 },
  ] },
  // triumph: low side hero angle, coins rain
  { from: 37.1, to: 39.6, k: [
    { t: 37.1, pos: [1.6, 2.8, -6.1], target: [0, 4.4, -9.4], fov: 56, roll: 0.14 },
    { t: 39.6, pos: [1.4, 3.0, -6.4], target: [0, 4.6, -9.4], fov: 50, roll: 0.06 },
  ] },
  // 20 000 a day: long lateral dolly along the queue
  { from: 39.6, to: 43.3, ease: linear, k: [
    { t: 39.6, pos: [13, 4.6, 11], target: [5, 2.8, 2.5], fov: 50 },
    { t: 43.3, pos: [-10, 5.4, 11.5], target: [-4, 2.6, 0], fov: 52 },
  ] },
];

/** the snake-shaped queue (in front of the rope, around its end, behind it) — never through the rope at z=1 */
const QUEUE: [number, number][] = [[-1.4, -2.6], [-4.0, -1.3], [-6.8, -0.4], [-9.6, 1.2], [-7.0, 3.4], [-3.6, 3.6], [-0.2, 3.6], [3.2, 3.6], [6.6, 3.6]];
const QUEUE_CAST = ['catcher', 'citizen2', 'citizen1', 'citizen2', 'catcher', 'citizen1', 'citizen2', 'catcher', 'citizen1'];

export const Office: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('office');
  const Sack = O('sack');
  // official: neutral → stink recoil → finger up → coin → triumph
  const recoil = k01(t, 29.2, 29.5) * (1 - k01(t, 30.9, 31.3));
  const finger = k01(t, 31.9, 32.3);
  const cheer = k01(t, 37.1, 37.4);
  const offFace = t < 29.2 ? 'smug' : t < 31.1 ? 'panic' : t < 37.1 ? 'smug' : 'grin';
  const offPose = mix(idle(t, 5), {
    face: offFace,
    lean: -0.25 * recoil,
    handL: cheer > 0 ? reachTo(t, 37.1, 37.4, [-0.7, 2.6, 0.6], [-1.3, 4.3 + Math.sin(t * 10) * 0.15, 0.4]) : recoil > 0 ? [-0.3, 3.9, 0.9] : [-0.7, 2.6, 0.6],
    handR:
      cheer > 0
        ? reachTo(t, 37.1, 37.4, [0.5, 2.7, 1.3], [1.3, 4.3 + Math.cos(t * 10) * 0.15, 0.4])
        : recoil > 0
          ? [0.3, 3.95, 0.9]
          : finger > 0 && t < 33.3
            ? reachTo(t, 31.9, 32.3, [0.7, 2.6, 0.5], [0.55, 4.6, 0.7])
            : t >= 35.6
              ? reachTo(t, 35.6, 36.2, [0.7, 2.6, 0.5], [0.5, 2.75, 1.35])
              : [0.7, 2.6, 0.5],
    holdR: t >= 35.6 && t < 37.1 ? <HeldCoin /> : undefined,
    hips: [0, cheer * Math.abs(Math.sin(t * 8)) * 0.18, 0],
  });

  // citizen 1: walks in from the door with a dead rat, then gives the tail
  const walkIn = path(t, [[27, [13, 0, 5.5]], [27.9, [11, 0, -1.2]], [29.2, CIT_DESK]], linear);
  const citPos = t < 29.2 ? walkIn.pos : CIT_DESK;
  const citRot = t < 29.2 ? walkIn.rotY : face(CIT_DESK, OFF.pos);
  const deadRat = (
    <group rotation={[Math.PI, 0, 0]} position={[0, -0.05, 0]} scale={0.9}>
      <RatA pos={[0, 0, 0]} t={0} pose={{ face: 'scared' }} />
    </group>
  );
  const tailDrop = t >= 34.8;
  const citHandR: V3 = t < 29.2 ? [0.6, 2.3, 0.45] : t < 33.3 ? [0.35, 3.0, 1.0] : t < 34.8 ? reachTo(t, 33.3, 34.6, [0.35, 2.7, 0.9], [0.25, 2.9, 1.05]) : [0.4, 2.4, 0.7];
  const citWalk = t < 29.2 ? walkPose((t - 27) * 3.4, 1) : {};
  const citPose = mix(idle(t, 7), citWalk, {
    face: t < 33.3 ? 'grin' : 'smile',
    handR: t < 29.2 ? (citWalk as { handR?: V3 }).handR ?? citHandR : citHandR,
    holdR: t < 33.3 ? deadRat : !tailDrop ? <HeldTail /> : undefined,
    handL: t > 35.9 && t < 37.1 ? reachTo(t, 35.9, 36.3, [-0.6, 1.9, 0.3], [-0.1, 2.7, 1.2]) : undefined,
    holdL: t > 36.25 && t < 37.1 ? <HeldCoin /> : undefined,
  });
  // world position of the dropped tail on the desk
  const fall = clamp01((t - 34.8) / 0.18);

  // queue of hunters: visible in the wide shots; they shuffle forward on the beat
  const queueOn = t < 23.3 || t >= 37.1;
  const sacks = [40.0, 40.5, 41.0, 41.4, 41.8, 42.2, 42.6];

  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(S3, t)}>
      <OfficeSet />
      <Who id="official" pos={OFF.pos} rotY={0} pose={offPose} />
      {t >= 27 && <Who id="citizen1" pos={citPos} rotY={citRot} pose={citPose} />}
      {tailDrop && (
        <group position={[1.15, lerp(2.9, BODY.waist + 0.04, fall * fall), -5.75]} rotation={[0, 0, -Math.PI / 2 * fall]}>
          <HeldTail />
        </group>
      )}
      {queueOn &&
        QUEUE.map(([x, z], i) => {
          const step = Math.max(0, Math.sin(t * 2.2 + i)) * 0.15;
          const p: V3 = [x, 0, z + (z < 1 ? 0 : 0)];
          const next = i === 0 ? CIT_DESK : ([QUEUE[i - 1][0], 0, QUEUE[i - 1][1]] as V3);
          return (
            <Who
              key={i}
              id={QUEUE_CAST[i]}
              pos={p}
              rotY={face(p, next)}
              pose={mix(idle(t, i * 3), {
                face: i % 3 === 0 ? 'smug' : i % 3 === 1 ? 'grin' : 'smile',
                hips: [0, step, 0],
                handR: [0.55, 2.2 + Math.sin(t * 3 + i) * 0.15, 0.55],
                holdR: <HeldTail />,
              })}
            />
          );
        })}
      {/* coins rain on "triumph" */}
      <CoinRain t={t} t0={37.15} n={40} x={[-4.5, 4.5]} z={[-11, -8.7]} />
      {/* sacks of tails keep popping up next to the pile */}
      {sacks.map((s0, i) => {
        if (t < s0) return null;
        const sc = Math.min(1, (t - s0) / 0.2) * (1 + Math.sin(Math.min(1, (t - s0) / 0.35) * Math.PI) * 0.15);
        return (
          <group key={i} position={[6.8 + (i % 4) * 1.4, 0, -3.2 - Math.floor(i / 4) * 1.6 + hash(i) * 0.3]} rotation={[0, hash(i + 3) * 3, 0]} scale={sc}>
            <Sack />
          </group>
        );
      })}
    </Scene>
  );
};

/* =====================================================================
 * 4 · ALLEY (night) 43.3–56.7 — the catchers' trick.
 * Push-in + snap on the peeking inspectors → over-the-shoulder vertigo
 * zoom to the catcher → his smug close-up → macro "SNIP" with shake →
 * low chase of the tail-less rat into the manhole → crane up while the
 * next generation pops out.
 * ===================================================================== */
const CATCH: V3 = [4.2, 0, 1.6];
const CATCH_ROT = 2.6;
const RAT0: V3 = [4.75, 0, 0.55];
const S4: Shot[] = [
  { from: 43.3, to: 45.3, k: [
    { t: 43.3, pos: [-4.5, 3.4, 2.6], target: [-10.6, 3.1, -4.7], fov: 46 },
    { t: 44.45, pos: [-6.0, 3.3, 0.6], target: [-10.6, 3.2, -4.8], fov: 42 },
    { t: 44.6, pos: [-6.05, 3.3, 0.55], target: [-10.6, 3.3, -4.8], fov: 29 },
    { t: 45.3, pos: [-6.1, 3.3, 0.5], target: [-10.6, 3.3, -4.8], fov: 28 },
  ] },
  { from: 45.3, to: 47.1, k: [
    { t: 45.3, pos: [-12.4, 4.6, -3.4], target: [4.2, 1.6, 1.4], fov: 42 },
    { t: 47.1, pos: [-11.6, 4.4, -3.1], target: [4.2, 1.8, 1.4], fov: 18 },
  ] },
  { from: 47.1, to: 49.4, k: [
    { t: 47.1, pos: [7.8, 3.6, -4.2], target: [3.8, 1.8, 1.6], fov: 50 },
    { t: 49.4, pos: [6.6, 2.6, -1.8], target: [4.2, 2.0, 1.6], fov: 42 },
  ] },
  { from: 49.4, to: 52.6, shake: (t) => 0.03 + bump(t, 51.6, 0.25), k: [
    { t: 49.4, pos: [7.0, 1.6, -2.4], target: [4.5, 0.9, 1.0], fov: 46 },
    { t: 51.5, pos: [6.4, 1.4, -1.8], target: [4.5, 0.8, 1.0], fov: 38 },
    { t: 51.62, pos: [6.35, 1.4, -1.75], target: [4.5, 0.7, 0.9], fov: 26 },
    { t: 52.0, pos: [6.35, 1.5, -1.75], target: [4.4, 1.3, 1.2], fov: 32 },
    { t: 52.6, pos: [6.6, 2.0, -2.0], target: [4.3, 1.9, 1.4], fov: 42 },
  ] },
  { from: 52.6, to: 54.4, shake: 0.08, k: [
    { t: 52.6, pos: [0.4, 1.0, -1.6], target: [4.4, 0.4, 0.8], fov: 50 },
    { t: 53.6, pos: [0.3, 1.1, -1.0], target: [2.1, 0.1, 0.2], fov: 50 },
    { t: 54.4, pos: [0.8, 2.2, -0.4], target: [2, -0.2, 0], fov: 46 },
  ] },
  { from: 54.4, to: 56.7, ease: easeOut, k: [
    { t: 54.4, pos: [2.3, 4.2, 0.4], target: [2, 0, 0], fov: 55, roll: 0 },
    { t: 56.7, pos: [2.8, 17, 1.2], target: [2, 0, 0], fov: 50, roll: 0.8 },
  ] },
];

export const Alley: React.FC<{ t: number }> = ({ t }) => {
  const peek = t > 44.5;
  const snipped = t >= 51.6;
  // the rat in front of the catcher: waits, gets snipped, runs into the manhole
  const run = path(t, [[52.6, RAT0], [53.2, [3.5, 0, 1.4]], [53.7, [2.2, 0, 0.15]]], linear);
  const dive = clamp01((t - 53.7) / 0.3);
  const ratPos: V3 = t < 52.6 ? RAT0 : [run.pos[0], -dive * 1.4, run.pos[2]];
  const scissorsL = toLocal([4.55, 0.55, 0.95], CATCH, CATCH_ROT);
  const close = snipped && t < 51.75;
  return (
    <Scene light={L('alley').light} bg={L('alley').bg} cam={camAt(S4, t)}>
      <AlleySet open={1} />
      {/* inspectors peeking out of the lit door */}
      <Who id="inspector" pos={[-10, 0, -4.6]} rotY={0.9} pose={mix(idle(t, 1), { face: peek ? 'panic' : 'o', lean: 0.15, handL: [-0.45, 3.2, 0.6], headTilt: peek ? 0.15 : 0 })} />
      <Who id="inspector2" pos={[-11.3, 0, -5.0]} rotY={0.9} pose={mix(idle(t, 2), { face: peek ? 'panic' : 'o', ...writing(t < 44.5 ? t : 44.5), hips: [0, peek && t < 44.8 ? 0.25 : 0, 0] })} />
      {/* the catcher */}
      <Who
        id="catcher"
        pos={CATCH}
        rotY={CATCH_ROT}
        pose={mix(crouch(0.4), {
          face: 'smug',
          headTilt: t > 47.1 && t < 49.4 ? Math.sin(t * 3) * 0.12 : 0,
          look: t > 47.1 && t < 49.4 ? [0.2, 0.1] : [0, -0.6],
          handR: t < 49.4 ? [0.35, 1.3, 1.0] : [scissorsL[0], scissorsL[1] + (close ? -0.05 : 0), scissorsL[2]],
          holdR: (
            <group rotation={[0, 0, close ? 0.4 : 0]}>
              <HeldScissors />
            </group>
          ),
          handL: t < 47.6 ? [-0.35, 1.1, 1.0] : t < 49.4 ? reachTo(t, 47.6, 48.6, [-0.35, 1.1, 1.0], [-0.4, 3.0, 0.9]) : snipped ? reachTo(t, 51.8, 52.2, [-0.35, 1.1, 1.0], [-0.4, 3.0, 0.8]) : [-0.35, 1.1, 1.0],
          holdL: t >= 47.6 && t < 49.4 ? <HeldCoin /> : snipped && t > 51.9 ? <HeldTail /> : undefined,
        })}
      />
      {t < 54.2 && <RatA pos={ratPos} rotY={t < 52.6 ? CATCH_ROT : run.rotY} t={t} run={t >= 52.6} cut={snipped} pose={{ face: snipped ? 'scared' : 'happy' }} pitch={dive * 0.9} />}
      {/* the next generation of payouts pops out */}
      {Array.from({ length: 7 }, (_, i) => {
        const t0 = 55.0 + i * 0.16;
        if (t < t0) return null;
        const a = i * 0.9 + 0.4;
        const d = (t - t0) * 4;
        const up = Math.sin(clamp01((t - t0) / 0.35) * Math.PI) * 0.6;
        return <RatA key={i} pos={[2 + Math.sin(a) * d, up, Math.cos(a) * d]} rotY={a} t={t} run scale={0.6} seed={i} cut={false} />;
      })}
    </Scene>
  );
};

/* =====================================================================
 * 5 · FARM (sunset) 56.7–61.5 — "rat farms on the edge of town"
 * Fast push from far away as the inspectors walk in → lateral truck past
 * the cages, the farmer waves → snap-zoom on their shocked faces.
 * ===================================================================== */
const S5: Shot[] = [
  { from: 56.7, to: 59, ease: easeOut, k: [
    { t: 56.7, pos: [22, 10, 32], target: [0, 3.5, -4], fov: 55, roll: -0.05 },
    { t: 59, pos: [14, 5.6, 16], target: [2, 3, -5], fov: 46, roll: 0 },
  ] },
  { from: 59, to: 60.4, ease: linear, k: [
    { t: 59, pos: [10, 3.4, 1.0], target: [5.5, 2.6, -8], fov: 46 },
    { t: 60.4, pos: [-8, 3.4, 1.0], target: [-6, 2.6, -8], fov: 46 },
  ] },
  { from: 60.4, to: 61.5, k: [
    { t: 60.4, pos: [3.5, 3.6, 1.5], target: [9.2, 3.4, 4.8], fov: 44 },
    { t: 60.55, pos: [3.6, 3.6, 1.6], target: [9.2, 3.5, 4.8], fov: 28 },
    { t: 61.5, pos: [3.7, 3.6, 1.7], target: [9.2, 3.5, 4.8], fov: 26 },
  ] },
];

export const Farm: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('farm');
  const ins = (id: string, from: V3, to: V3, seed: number, extra: object) => {
    const w = path(t, [[56.7, from], [58.6, to]], linear);
    const walking = w.moving;
    const jump = t > 60.42 && t < 60.8 ? Math.sin(((t - 60.42) / 0.38) * Math.PI) * 0.35 : 0;
    return (
      <Who
        id={id}
        pos={w.pos}
        rotY={walking ? w.rotY : -2.35}
        pose={mix(idle(t, seed), walking ? walkPose((t - 56.7) * 3.2) : {}, { face: t > 60.4 ? 'panic' : 'o', hips: [0, jump, 0] }, walking ? {} : extra)}
      />
    );
  };
  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(S5, t)}>
      <loc.Set />
      <Who
        id="farmer"
        pos={[0, 0, -4.6]}
        rotY={t < 59 ? 0.15 : 0.15 + Math.sin((t - 59) * 2) * 0.4}
        pose={mix(idle(t, 3), { face: 'smug', handL: [-0.1, 2.6, 0.6], handR: t > 59 ? [0.9, 4.0 + Math.sin(t * 12) * 0.2, 0.4] : [0.1, 2.55, 0.62] })}
      />
      {ins('inspector', [16, 0, 12], [8.6, 0, 4.4], 1, { handL: [-0.3, 3.6, 0.5] })}
      {ins('inspector2', [17.5, 0, 13], [10.1, 0, 5.4], 2, writing(58))}
      {/* rats running around the yard */}
      <RatSwarm t={t} n={12} x0={-12} x1={12} z0={-2} z1={6} speed={[2, 4]} spread={3} cut={0.7} seed={11} />
    </Scene>
  );
};

/* =====================================================================
 * 6 · OFFICE (panic) 61.5–66.4 — "scrapped the bounty in panic"
 * Handheld dutch angle while he rips the poster down → close-up, then a
 * fast pull-back reveals rats flooding the office.
 * ===================================================================== */
const S6: Shot[] = [
  { from: 61.5, to: 64.1, shake: (t) => 0.18 + bump(t, 62.5, 0.3), k: [
    { t: 61.5, pos: [-1.8, 3.9, -3.0], target: [-5.8, 3.2, -10.4], fov: 46, roll: 0.22 },
    { t: 64.1, pos: [-2.6, 3.6, -4.4], target: [-5.6, 3.0, -10.2], fov: 42, roll: -0.18 },
  ] },
  { from: 64.1, to: 66.4, ease: easeIn, shake: 0.15, k: [
    { t: 64.1, pos: [-4.4, 4.1, -5.4], target: [-5.2, 4.0, -9.6], fov: 40, roll: 0.1 },
    { t: 66.4, pos: [3, 10, 11], target: [-3, 1.2, -5], fov: 60, roll: -0.05 },
  ] },
];

export const OfficePanic: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('office');
  const Poster = O('poster');
  const fallK = clamp01((t - 62.2) / 0.45);
  const fall = fallK * fallK * (fallK < 1 ? 1 : 1);
  const bounce = t > 62.65 && t < 62.9 ? Math.sin(((t - 62.65) / 0.25) * Math.PI) * 0.08 : 0;
  const ripped = t >= 62.2;
  const jump = t > 64.1 ? Math.abs(Math.sin((t - 64.1) * 7)) * 0.3 : 0;
  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(S6, t)}>
      <OfficeSet poster={false} />
      {/* the poster topples over */}
      <group position={[-6.5, 0, -11]} rotation={[0, 0.15, 0]}>
        <group rotation={[(fall * Math.PI) / 2.05 - bounce, 0, 0]}>
          <Poster />
        </group>
      </group>
      <Who
        id="official"
        pos={[-5.2, 0, -9.6]}
        rotY={t < 62.4 ? 0.25 + Math.PI * 0.8 * k01(t, 61.5, 61.8) * (1 - k01(t, 62.1, 62.4)) : 0.25}
        pose={mix(idle(t, 6), {
          face: 'panic',
          lean: ripped ? -0.12 : 0.1,
          handL: t > 64.1 ? [-0.55, 4.6, 0.3] : [-0.7, 3.7 + Math.sin(t * 14) * 0.15, 0.75],
          handR: t > 64.1 ? [0.55, 4.6, 0.3] : [0.7, 3.7 + Math.cos(t * 14) * 0.15, 0.75],
          hips: [0, jump, 0],
          headTilt: Math.sin(t * 9) * 0.1,
        })}
      />
      {/* rats flood in from the door */}
      {t > 63.6 && <RatSwarm t={t - 63.6} n={40} x0={-14} x1={16} z0={-5} z1={9} dir={-Math.PI / 2 - 0.4} spread={0.5} speed={[7, 10]} cut={0.7} seed={21} />}
    </Scene>
  );
};

/* =====================================================================
 * 7 · STREET FINALE 66.4–74.6 — the moral.
 * Ground-level dolly back as a wave of rats charges the lens → slow push
 * on the defeated inspectors → big crane up over a city full of rats.
 * ===================================================================== */
const S7: Shot[] = [
  { from: 66.4, to: 69.2, ease: easeOut, shake: 0.1, k: [
    { t: 66.4, pos: [-4, 0.7, 0.6], target: [10, 0.9, 0], fov: 60, roll: 0.08 },
    { t: 69.2, pos: [-14, 1.3, 0.6], target: [6, 1.2, 0], fov: 54, roll: 0 },
  ] },
  { from: 69.2, to: 71.9, k: [
    { t: 69.2, pos: [-1.8, 3.8, -2.4], target: [-5, 3, -10.4], fov: 46 },
    { t: 71.9, pos: [-3.2, 3.6, -5.0], target: [-5.1, 3.2, -10.4], fov: 36 },
  ] },
  { from: 71.9, to: 76, ease: easeOut, k: [
    { t: 71.9, pos: [-8, 4, 4], target: [0, 1.5, 0], fov: 50, roll: 0 },
    { t: 75, pos: [-36, 38, 3], target: [12, 0, 0], fov: 55, roll: -0.15 },
  ] },
];

export const Finale: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('street');
  const sigh = Math.sin(t * 1.4);
  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(S7, t)}>
      <loc.Set />
      <RatSwarm t={t} n={45} x0={-30} x1={45} z0={-7.5} z1={7.5} dir={-Math.PI / 2} spread={0.4} speed={[6, 9]} cut={0.6} seed={31} />
      <RatSwarm t={t} n={14} x0={-30} x1={45} z0={9} z1={14} y={0.3} dir={Math.PI / 2} spread={0.3} speed={[4, 6]} cut={0.6} seed={33} />
      <Who id="inspector" pos={[-6, 0.3, -10.2]} rotY={0.5} pose={mix(idle(t, 1), { face: 'neutral', look: [0.6, -0.5], headTurn: Math.sin(t * 3) * 0.25 * k01(t, 69.5, 70), lean: 0.06 })} />
      <Who id="inspector2" pos={[-4.3, 0.3, -10.8]} rotY={0.3} pose={mix(idle(t, 2), { face: 'neutral', hips: [0, sigh * 0.04, 0], handL: [-0.25, 2.2, 0.5], holdL: <HeldNotebook />, handR: [0.6, 1.9, 0.2] })} />
      {/* a few rats run around the inspectors' feet */}
      {[0, 1, 2].map((i) => {
        const a = t * 1.6 + (i * Math.PI * 2) / 3;
        return <RatA key={i} pos={[-5.1 + Math.sin(a) * 2.4, 0.3, -8.2 + Math.cos(a) * 0.9]} rotY={a + Math.PI / 2} t={t} run cut seed={i} />;
      })}
    </Scene>
  );
};

export const SCENES: { from: number; to: number; C: React.FC<{ t: number }> }[] = [
  { from: 0, to: 10.1, C: Street1 },
  { from: 10.1, to: 20.5, C: Sewer },
  { from: 20.5, to: 43.3, C: Office },
  { from: 43.3, to: 56.7, C: Alley },
  { from: 56.7, to: 61.5, C: Farm },
  { from: 61.5, to: 66.4, C: OfficePanic },
  { from: 66.4, to: 99, C: Finale },
];
