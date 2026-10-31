/**
 * Stage 5: the animated film. ONE SHOT PER SENTENCE of the voice-over (voice.srt),
 * hard cuts only in the pauses between sentences, calm camera: a locked frame with
 * a slow push-in. Frames come from the approved staging (src/staging).
 * All times are FILM seconds.
 */
import { LOCATIONS } from '../locations';
import { AlleySet } from '../locations/alley';
import { OfficeSet } from '../locations/office';
import { OBJECTS } from '../objects';
import { BODY } from '../lib/style';
import { clamp01, hash, lerp } from '../lib/anim';
import { HeldCoin, HeldMagnifier, HeldNotebook, HeldScissors, HeldTail, crouch } from '../staging';
import { RatA, RatSwarm, Scene, Who, camAt, face, idle, linear, mix, path, reachTo, toLocal, walkPose, type Shot, type V3 } from './kit';

const L = (id: string) => LOCATIONS.find((l) => l.id === id)!;
const O = (id: string) => OBJECTS.find((o) => o.id === id)!.C;
const k01 = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/** A calm shot: locked frame with a slow push-in (push = share of the distance to the target). */
const calm = (from: number, to: number, pos: V3, target: V3, fov: number, push = 0.06): Shot => ({
  from,
  to,
  ease: linear,
  shake: 0,
  k: [
    { t: from, pos, target, fov },
    { t: to, pos: [lerp(pos[0], target[0], push), lerp(pos[1], target[1], push), lerp(pos[2], target[2], push)], target, fov: fov - 2 },
  ],
});

/** Sentence boundaries (cut points, in the pauses of the voice). */
export const CUTS = [0, 5.0, 10.0, 15.6, 20.4, 26.95, 33.1, 37.0, 39.5, 43.1, 46.9, 49.3, 56.65, 61.45, 66.3, 69.05, 71.75, 75.4];
const C = CUTS;

const writing = (t: number) => ({ handL: [-0.25, 2.55, 0.6] as V3, handR: [0.2 + Math.sin(t * 9) * 0.05, 2.65, 0.65] as V3, holdL: <HeldNotebook /> });

/* ---------------- 1–2 · STREET ---------------- */
// 1 «In 1902, health inspectors in Hanoi noticed something bizarre.»
// 2 «Thousands of healthy rats were running through the city with their tails neatly cut off.»
const SH_STREET: Shot[] = [
  calm(C[0], C[1], [-1.2, 3.6, 3.5], [-4.8, 2.4, -7.6], 48),
  calm(C[1], C[2], [-9, 1.4, 2.5], [8, 0.6, -1], 50, 0.04),
];

export const Street1: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('street');
  const notice = t > 3.0; // «noticed»
  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(SH_STREET, t)}>
      <loc.Set />
      <Who id="inspector" pos={[-6, 0.3, -9.4]} rotY={0.55} pose={mix(idle(t, 1), writing(notice ? 3 : t), { face: notice ? 'o' : 'neutral', look: [0.6, -0.4] })} />
      <Who
        id="inspector2"
        pos={[-3.6, 0, -6.6]}
        rotY={0.9}
        pose={mix(crouch(0.5), { handR: [0.25, 1.4, 1.15], holdR: <HeldMagnifier />, face: notice ? 'o' : 'neutral', look: [0, -1] })}
      />
      {t < C[1] && <RatA pos={[-2.6, 0, -4.8]} rotY={-2.2 + Math.sin(t * 1.5) * 0.2} t={t} cut />}
      {/* shot 2: the rats run away from the camera, so the cut stumps are seen */}
      {t >= C[1] && <RatSwarm t={t - C[1]} n={24} x0={-6} x1={40} z0={-6} z1={5} dir={Math.PI / 2} spread={0.12} speed={[4, 6]} cut={0.9} seed={3} />}
    </Scene>
  );
};

/* ---------------- 3–4 · SEWER ---------------- */
// 3 «Months earlier, French colonial officials had built a massive underground sewer system,»
// 4 «accidentally creating a paradise for plague-carrying rats.»
const SH_SEWER: Shot[] = [
  calm(C[2], C[3], [5.5, 3.8, -1], [12, 3.1, -6], 46),
  calm(C[3], C[4], [2, 2.6, 3.5], [40, 0.8, 0], 50, 0.05),
];

export const Sewer: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('sewer');
  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(SH_SEWER, t)}>
      <loc.Set />
      <Who
        id="official"
        pos={[12, 0.6, -6]}
        rotY={-0.6}
        pose={mix(idle(t, 2), {
          face: 'grin',
          // «massive» (13.3): opens his arms, proud
          handL: reachTo(t, 13.1, 13.7, [-0.75, 2.0, 0.35], [-1.3, 3.5, 0.5]),
          handR: reachTo(t, 13.1, 13.7, [0.75, 2.0, 0.35], [1.3, 3.5, 0.5]),
        })}
      />
      <RatSwarm t={t} n={18} x0={4} x1={60} z0={4} z1={8} y={0.6} dir={Math.PI / 2} spread={0.1} speed={[2, 4]} cut={0} seed={7} />
      <RatSwarm t={t} n={18} x0={4} x1={60} z0={-8} z1={-4} y={0.6} dir={-Math.PI / 2} spread={0.1} speed={[2, 4]} cut={0} seed={9} />
    </Scene>
  );
};

/* ---------------- 5–9 · OFFICE ---------------- */
// 5 «To wipe them out… offered citizens a cash bounty for every rat they killed.»
// 6 «And to avoid drowning government offices in rotting carcasses, officials added one simple rule...»
// 7 «Just bring in the severed tail as proof and collect your coin.»
// 8 «At first, it looked like a triumph.»
// 9 «Citizens handed in up to 20,000 tails a day.»
const SH_OFFICE: Shot[] = [
  calm(C[4], C[5], [4.5, 5.2, 5], [-2.6, 3.0, -9.6], 50),
  calm(C[5], C[6], [-14, 5, -7], [0.2, 3.0, -7.2], 46),
  calm(C[6], C[7], [4.5, 3.8, -2.5], [0.2, 3.0, -8.2], 46),
  calm(C[7], C[8], [-2.4, 4.2, -3.4], [0, 4.2, -9.4], 40),
  calm(C[8], C[9], [14, 8, 16], [-2, 2.4, -1], 42),
];

const CIT: V3 = [1.5, 0, -4.4]; // the citizen at the desk
const OFF: V3 = [0, 0, -9.4];
const QUEUE: [number, number][] = [[-1.4, -2.6], [-4.0, -1.3], [-6.8, -0.4], [-9.6, 1.4], [-7.0, 3.4], [-3.6, 3.6], [-0.2, 3.6], [3.2, 3.6], [6.6, 3.6]];
const QUEUE_CAST = ['catcher', 'citizen2', 'citizen1', 'citizen2', 'catcher', 'citizen1', 'citizen2', 'catcher', 'citizen1'];

export const Office: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('office');
  const Sack = O('sack');
  const s6 = t >= C[5] && t < C[6];
  const recoil = s6 ? k01(t, 28.2, 28.6) * (1 - k01(t, 31.0, 31.4)) : 0; // «drowning… rotting carcasses»
  const finger = s6 && t > 31.9; // «one simple rule»
  const cheer = t >= C[7] && t < C[8];
  const offPose = mix(idle(t, 5), {
    face: recoil > 0.3 ? 'panic' : cheer ? 'grin' : 'smug',
    lean: -0.2 * recoil,
    // shot 5: points at the poster on «bounty»
    handL: cheer ? [-1.1, 4.0, 0.4] : recoil > 0.3 ? [-0.35, 3.8, 0.9] : t < C[5] ? reachTo(t, 24.6, 25.2, [-0.7, 2.6, 0.6], [-1.4, 3.3, 0.6]) : [-0.7, 2.6, 0.6],
    handR: cheer
      ? [1.1, 4.0, 0.4]
      : recoil > 0.3
        ? [0.35, 3.85, 0.9]
        : finger
          ? reachTo(t, 31.9, 32.3, [0.7, 2.6, 0.5], [0.55, 4.4, 0.7])
          : t >= C[6] && t < C[7]
            ? reachTo(t, 35.5, 36.1, [0.7, 2.6, 0.5], [0.5, 2.75, 1.3])
            : [0.7, 2.6, 0.5],
    holdR: t >= 35.5 && t < C[7] ? <HeldCoin /> : undefined,
  });

  // citizen 1 brings in a dead rat (shot 6), then the tail (shot 7)
  const walk = path(t, [[C[5], [9, 0, -3.6]], [28.4, CIT]], linear);
  const walking = s6 && walk.moving;
  const citPos = t < C[6] ? walk.pos : CIT;
  const citRot = walking ? walk.rotY : face(CIT, OFF);
  const deadRat = (
    <group rotation={[Math.PI, 0, 0]} scale={0.9}>
      <RatA pos={[0, 0, 0]} t={0} pose={{ face: 'scared' }} />
    </group>
  );
  const dropped = t >= 34.8; // «tail»
  const fall = clamp01((t - 34.8) / 0.25);
  const citPose = mix(idle(t, 7), walking ? walkPose((t - C[5]) * 3) : {}, {
    face: 'grin',
    handR: t < C[6] ? [0.45, 2.9, 0.9] : dropped ? [0.5, 2.3, 0.6] : reachTo(t, 33.6, 34.6, [0.4, 2.6, 0.8], [0.25, 2.85, 1.05]),
    holdR: t < C[6] ? deadRat : !dropped ? <HeldTail /> : undefined,
    handL: t > 35.9 && t < C[7] ? reachTo(t, 35.9, 36.3, [-0.6, 1.9, 0.3], [-0.1, 2.7, 1.2]) : undefined,
    holdL: t > 36.3 && t < C[7] ? <HeldCoin /> : undefined,
  });
  const showCitizen = t >= C[5] && t < C[8];
  const showQueue = t >= C[8];

  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(SH_OFFICE, t)}>
      <OfficeSet />
      <Who id="official" pos={OFF} rotY={0} pose={offPose} />
      {showCitizen && <Who id="citizen1" pos={citPos} rotY={citRot} pose={citPose} />}
      {dropped && t < C[8] && (
        <group position={[1.15, lerp(2.9, BODY.waist + 0.04, fall * fall), -5.75]} rotation={[0, 0, (-Math.PI / 2) * fall]}>
          <HeldTail />
        </group>
      )}
      {showQueue &&
        QUEUE.map(([x, z], i) => {
          const p: V3 = [x, 0, z];
          const next: V3 = i === 0 ? CIT : [QUEUE[i - 1][0], 0, QUEUE[i - 1][1]];
          return (
            <Who
              key={i}
              id={QUEUE_CAST[i]}
              pos={p}
              rotY={face(p, next)}
              pose={mix(idle(t, i * 3), { face: i % 2 ? 'grin' : 'smile', handR: [0.55, 2.3, 0.55], holdR: <HeldTail /> })}
            />
          );
        })}
      {/* shot 9: sacks of tails pile up beside the desk */}
      {t >= C[8] &&
        [40.2, 40.8, 41.4, 42.0].map((s0, i) => {
          if (t < s0) return null;
          const sc = Math.min(1, (t - s0) / 0.3);
          return (
            <group key={i} position={[7 + (i % 2) * 1.6, 0, -3.4 - Math.floor(i / 2) * 1.7]} rotation={[0, hash(i + 3) * 3, 0]} scale={sc}>
              <Sack />
            </group>
          );
        })}
    </Scene>
  );
};

/* ---------------- 10–12 · ALLEY (night) ---------------- */
// 10 «Until inspectors realized how the market had adapted.»
// 11 «Why kill the source of your income?»
// 12 «Catchers were trapping live rats, snipping off their tails, and releasing them back into the sewers…»
const SH_ALLEY: Shot[] = [
  calm(C[9], C[10], [-4.2, 3.2, 2.4], [-10.6, 3.0, -4.7], 44),
  calm(C[10], C[11], [7.8, 3.6, -4.2], [3.6, 1.6, 1.6], 52),
  calm(C[11], C[12], [10, 5.6, -3.4], [3.2, 1.6, 1.2], 50, 0.04),
];

const CATCH: V3 = [4.2, 0, 1.6];
const CATCH_ROT = 2.6;
const RAT0: V3 = [4.75, 0, 0.55];

export const Alley: React.FC<{ t: number }> = ({ t }) => {
  const realize = t > 44.5;
  const snipped = t >= 51.7; // «snipping»
  const run = path(t, [[53.0, RAT0], [53.6, [3.4, 0, -0.2]], [54.1, [2.2, 0, 0.1]]], linear); // «releasing»
  const dive = clamp01((t - 54.1) / 0.3);
  const ratPos: V3 = t < 53.0 ? RAT0 : [run.pos[0], -dive * 1.4, run.pos[2]];
  const sc = toLocal([4.55, 0.55, 0.95], CATCH, CATCH_ROT);
  return (
    <Scene light={L('alley').light} bg={L('alley').bg} cam={camAt(SH_ALLEY, t)}>
      <AlleySet open={1} />
      <Who id="inspector" pos={[-10, 0, -4.6]} rotY={0.9} pose={mix(idle(t, 1), { face: realize ? 'panic' : 'o', lean: 0.15, handL: [-0.45, 3.2, 0.6] })} />
      <Who id="inspector2" pos={[-11.3, 0, -5.0]} rotY={0.9} pose={mix(idle(t, 2), { face: realize ? 'panic' : 'o' })} />
      <Who
        id="catcher"
        pos={CATCH}
        rotY={CATCH_ROT}
        pose={mix(crouch(0.4), {
          face: 'smug',
          handR: t < C[11] ? [0.35, 1.3, 1.0] : [sc[0], sc[1], sc[2]],
          holdR: <HeldScissors />,
          // shot 11: shows a coin («income»); shot 12: shows the cut tail
          handL: t >= C[10] && t < C[11] ? reachTo(t, 47.4, 48.2, [-0.35, 1.1, 1.0], [-0.4, 2.8, 0.9]) : snipped ? reachTo(t, 52.0, 52.5, [-0.35, 1.1, 1.0], [-0.4, 2.6, 0.8]) : [-0.35, 1.1, 1.0],
          holdL: t >= 47.4 && t < C[11] ? <HeldCoin /> : snipped && t > 52.2 ? <HeldTail /> : undefined,
        })}
      />
      {t < 54.4 && <RatA pos={ratPos} rotY={t < 53.0 ? CATCH_ROT : run.rotY} t={t} run={t >= 53.0} cut={snipped} pose={{ face: snipped ? 'scared' : 'happy' }} />}
      {/* «to breed the next generation»: young rats come out of the manhole */}
      {Array.from({ length: 5 }, (_, i) => {
        const t0 = 55.2 + i * 0.25;
        if (t < t0) return null;
        const a = -0.6 + i * 0.5;
        const d = Math.min(2.5, (t - t0) * 2);
        return <RatA key={i} pos={[2 + Math.sin(a) * d, 0, Math.cos(a) * d]} rotY={a} t={t} run={d < 2.5} scale={0.6} seed={i} />;
      })}
    </Scene>
  );
};

/* ---------------- 13 · FARM ---------------- */
// 13 «Soon, inspectors even discovered sprawling rat farms on the edge of town.»
const SH_FARM: Shot[] = [calm(C[12], C[13], [14, 7, 26], [3, 3.5, -2], 50, 0.1)];

export const Farm: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('farm');
  const shock = t > 59.0; // «sprawling rat farms»
  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(SH_FARM, t)}>
      <loc.Set />
      <Who id="farmer" pos={[0, 0, -4.6]} rotY={0.15} pose={mix(idle(t, 3), { face: 'smug', handL: [-0.1, 2.6, 0.6], handR: [0.1, 2.55, 0.62] })} />
      <Who id="inspector" pos={[8.6, 0, 4.4]} rotY={-2.35} pose={mix(idle(t, 1), { face: shock ? 'panic' : 'o', handL: shock ? [-0.3, 3.6, 0.5] : undefined })} />
      <Who id="inspector2" pos={[10.1, 0, 5.4]} rotY={-2.35} pose={mix(idle(t, 2), { face: shock ? 'panic' : 'o' }, writing(58))} />
    </Scene>
  );
};

/* ---------------- 14 · OFFICE (panic) ---------------- */
// 14 «The government scrapped the bounty in panic, leaving Hanoi with more rats than ever.»
const SH_PANIC: Shot[] = [calm(C[13], C[14], [-1.6, 4.2, -2.2], [-5.4, 3.0, -10.2], 50)];

export const OfficePanic: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('office');
  const Poster = O('poster');
  const fk = clamp01((t - 62.3) / 0.5); // «scrapped»
  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(SH_PANIC, t)}>
      <OfficeSet poster={false} />
      <group position={[-6.5, 0, -11]} rotation={[0, 0.15, 0]}>
        <group rotation={[(fk * fk * Math.PI) / 2.05, 0, 0]}>
          <Poster />
        </group>
      </group>
      <Who
        id="official"
        pos={[-5.2, 0, -9.6]}
        rotY={0.25}
        pose={mix(idle(t, 6), {
          face: 'panic',
          handL: t < 62.3 ? [-0.7, 3.7, 0.75] : [-0.55, 4.5, 0.3],
          handR: t < 62.3 ? [0.7, 3.7, 0.75] : [0.55, 4.5, 0.3],
        })}
      />
      {/* «more rats than ever»: rats run in across the floor */}
      {t > 64.0 && <RatSwarm t={t - 64.0} n={16} x0={-12} x1={-3.5} z0={-10} z1={-7.5} dir={-Math.PI / 2} spread={0.2} speed={[3, 5]} cut={0.7} seed={21} />}
    </Scene>
  );
};

/* ---------------- 15–17 · STREET (finale) ---------------- */
// 15 «They forgot the iron law of incentives.»
// 16 «People never optimize for the goal you want.»
// 17 «They optimize for the metric you pay for.»
const SH_FINAL: Shot[] = [
  calm(C[14], C[15], [-12, 1.2, 0.5], [10, 0.6, 0], 55, 0.04),
  calm(C[15], C[16], [-1.5, 3.6, -3], [-5, 3, -10.4], 44),
  calm(C[16], C[17], [-30, 24, 0.5], [10, 0, 0], 55, 0.05),
];

export const Finale: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('street');
  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(SH_FINAL, t)}>
      <loc.Set />
      <RatSwarm t={t} n={40} x0={-8} x1={40} z0={-7} z1={7} dir={Math.PI / 2} spread={0.6} speed={[2, 4]} cut={0.6} seed={31} />
      <Who id="inspector" pos={[-6, 0.3, -10.2]} rotY={0.5} pose={mix(idle(t, 1), { face: 'neutral', look: [0.6, -0.5] })} />
      <Who id="inspector2" pos={[-4.3, 0.3, -10.8]} rotY={0.3} pose={mix(idle(t, 2), { face: 'neutral', handL: [-0.25, 2.2, 0.5], holdL: <HeldNotebook /> })} />
    </Scene>
  );
};

export const SCENES: { from: number; to: number; C: React.FC<{ t: number }> }[] = [
  { from: C[0], to: C[2], C: Street1 },
  { from: C[2], to: C[4], C: Sewer },
  { from: C[4], to: C[9], C: Office },
  { from: C[9], to: C[12], C: Alley },
  { from: C[12], to: C[13], C: Farm },
  { from: C[13], to: C[14], C: OfficePanic },
  { from: C[14], to: 99, C: Finale },
];
