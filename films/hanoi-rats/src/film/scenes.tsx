/**
 * Stage 5: the animated film in a SLOW STOP-MOTION style (user's direction):
 *  - characters and rats are FROZEN in poses; on a key word of the voice-over they
 *    snap ("teleport") into the next pose — no continuous limb animation;
 *  - only the camera moves, slowly and smoothly;
 *  - one shot per sentence; shots are joined by soft dissolves (Movie.tsx);
 *  - few rats, and they stand still too.
 * All times are FILM seconds (voice.srt).
 */
import { LOCATIONS } from '../locations';
import { AlleySet } from '../locations/alley';
import { OfficeSet } from '../locations/office';
import { OBJECTS } from '../objects';
import { BODY } from '../lib/style';
import { hash, lerp } from '../lib/anim';
import type { PersonPose } from '../rig/Person';
import { HeldCoin, HeldMagnifier, HeldNotebook, HeldScissors, HeldTail, crouch } from '../staging';
import { RatA, Scene, Who, camAt, face, linear, mix, toLocal, walkPose, type Shot, type V3 } from './kit';

const L = (id: string) => LOCATIONS.find((l) => l.id === id)!;
const O = (id: string) => OBJECTS.find((o) => o.id === id)!.C;

/** Slow camera move between two framings (no shake, no roll). */
const move = (from: number, to: number, a: { pos: V3; target: V3; fov: number }, b: { pos: V3; target: V3; fov: number }): Shot => ({
  from,
  to,
  ease: linear,
  shake: 0,
  k: [
    { t: from, ...a },
    { t: to, ...b },
  ],
});
/** Slow push-in on one framing. */
const calm = (from: number, to: number, pos: V3, target: V3, fov: number, push = 0.07): Shot =>
  move(from, to, { pos, target, fov }, { pos: [lerp(pos[0], target[0], push), lerp(pos[1], target[1], push), lerp(pos[2], target[2], push)], target, fov: fov - 2 });

/** Index of the current pose: how many beat times have passed. */
const beat = (t: number, times: number[]) => times.filter((x) => t >= x).length;
/** Stop-motion step counter (one "frame" of the puppet every `dt` seconds). */
const step = (t: number, t0: number, dt = 0.6) => Math.max(0, Math.floor((t - t0) / dt));

/** Sentence boundaries (cuts in the pauses of the voice). */
export const CUTS = [0, 5.0, 10.0, 15.6, 20.4, 26.95, 33.1, 37.0, 39.5, 43.1, 46.9, 49.3, 56.65, 61.45, 66.3, 69.05, 71.75, 75.4];
const C = CUTS;

const notebook: PersonPose = { handL: [-0.3, 2.5, 0.8], handR: [0.25, 2.6, 0.82], holdL: <HeldNotebook /> };

/** A rat frozen mid-run (stop-motion): no hop, fixed pose. */
const StillRat: React.FC<{ pos: V3; rotY: number; cut?: boolean; scale?: number; face?: 'happy' | 'scared' | 'sly'; stand?: boolean }> = ({ pos, rotY, cut, scale = 1.1, face: f, stand }) => (
  <RatA pos={pos} rotY={rotY} t={0.1} run cut={cut} scale={scale} pose={{ face: f ?? (cut ? 'sly' : 'happy'), stand }} />
);
/** A few rats standing still, scattered deterministically. */
const Rats: React.FC<{ n: number; x: [number, number]; z: [number, number]; y?: number; cut?: number; seed?: number; dir?: number }> = ({ n, x, z, y = 0, cut = 0.5, seed = 1, dir }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const h = (k: number) => hash(i * 9.1 + seed * 13.7 + k);
      return <StillRat key={i} pos={[lerp(x[0], x[1], h(1)), y, lerp(z[0], z[1], h(2))]} rotY={dir !== undefined ? dir + (h(3) - 0.5) * 0.8 : h(3) * 6.28} cut={h(4) < cut} />;
    })}
  </>
);

/* =====================================================================
 * 1–2 · STREET
 * 1 «In 1902, health inspectors in Hanoi noticed something bizarre.»
 *   Inspectors walk along the sidewalk (stop-motion steps), the camera drifts.
 *   «noticed» (3.0): snap — they stop and look at two tail-less rats running off.
 * 2 «Thousands of healthy rats … with their tails neatly cut off.»
 *   Snap: the inspector is crouched by a rat with the magnifier; close-up:
 *   through the lens we see the stump. «tails» (8.3): a few more tail-less rats.
 * ===================================================================== */
const SH_STREET: Shot[] = [
  move(C[0], C[1], { pos: [1.5, 4.2, 4.5], target: [-7, 2.6, -8.5], fov: 50 }, { pos: [0.2, 3.9, 3.4], target: [-5, 2.3, -8], fov: 48 }),
  move(C[1], C[2], { pos: [-3.0, 2.6, -9.4], target: [-3.6, 1.3, -4.4], fov: 44 }, { pos: [-3.05, 2.4, -8.8], target: [-3.6, 1.2, -4.4], fov: 40 }),
];

const RAT_LENS: V3 = [-2.6, 0, -4.8]; // the rat under the magnifier (faces +x, stump to −x)
const INSP2_CROUCH: V3 = [-4.35, 0, -4.0];

export const Street1: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('street');
  const noticed = t >= 3.0;
  const lens = t >= C[1];
  // walking in stop-motion: a small jump forward each 0.6 s, alternating stride
  const s = step(Math.min(t, 3.0), 0);
  const wx = s * 0.45;
  const stride = walkPose(s % 2 ? 0.5 : 1.5, 0.8);
  const ins1: V3 = [-9.5 + wx, 0.3, -9.6];
  const ins2: V3 = [-8.2 + wx, 0.3, -10.3];
  // the two runaway rats (also stop-motion steps after «noticed»)
  const rs = step(t, 3.0, 0.5);
  const r1: V3 = [-4.6 + rs * 0.5, 0, -6.4];
  const r2: V3 = [-3.4 + rs * 0.45, 0, -5.2];
  const look = face(ins1, r1);
  const lensHand = toLocal([-3.2, 0.9, -4.85], INSP2_CROUCH, face(INSP2_CROUCH, [-3.4, 0, -4.8]));
  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(SH_STREET, t)}>
      <loc.Set />
      {!lens && (
        <>
          <Who id="inspector" pos={ins1} rotY={noticed ? look : Math.PI / 2} pose={noticed ? { ...notebook, face: 'o', look: [0.3, -0.5] } : mix(stride, notebook, { face: 'neutral' })} />
          <Who id="inspector2" pos={ins2} rotY={noticed ? face(ins2, r1) : Math.PI / 2} pose={noticed ? { face: 'o', look: [0.3, -0.5], handR: [0.6, 2.9, 1.3] } : mix(stride, { face: 'neutral' })} />
          {noticed && (
            <>
              <StillRat pos={r1} rotY={Math.PI / 2 + 0.3} cut />
              <StillRat pos={r2} rotY={Math.PI / 2 - 0.2} cut />
            </>
          )}
        </>
      )}
      {lens && (
        <>
          <Who id="inspector" pos={[-6, 0.3, -9.4]} rotY={0.6} pose={{ ...notebook, face: 'o', look: [0.6, -0.4] }} />
          <Who
            id="inspector2"
            pos={INSP2_CROUCH}
            rotY={face(INSP2_CROUCH, [-3.4, 0, -4.8])}
            pose={mix(crouch(0.5), { handR: lensHand, holdR: <HeldMagnifier />, face: 'o', look: [0, -1] })}
          />
          <StillRat pos={RAT_LENS} rotY={Math.PI / 2} cut face="sly" />
          {t >= 8.3 && <Rats n={5} x={[0, 9]} z={[-6.5, -1]} cut={1} seed={4} dir={Math.PI / 2} />}
        </>
      )}
    </Scene>
  );
};

/* =====================================================================
 * 3–4 · SEWER (dissolve in from the street)
 * 3 «Months earlier, French colonial officials had built a massive underground sewer system,»
 *   The proud official; «massive» (13.3): snap — arms wide.
 * 4 «accidentally creating a paradise for plague-carrying rats.»
 *   The tunnel, slow push; rats standing on the walkways. «plague-carrying» (18.7): more rats.
 * ===================================================================== */
const SH_SEWER: Shot[] = [
  calm(C[2], C[3], [5.5, 3.8, -1], [12, 3.1, -6], 46),
  calm(C[3], C[4], [2, 2.6, 3.5], [40, 0.8, 0], 50, 0.08),
];

export const Sewer: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('sewer');
  const proud = t >= 13.3;
  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(SH_SEWER, t)}>
      <loc.Set />
      <Who
        id="official"
        pos={[12, 0.6, -6]}
        rotY={-0.6}
        pose={proud ? { face: 'grin', handL: [-1.5, 3.6, 0.5], handR: [1.5, 3.6, 0.5] } : { face: 'smug', handL: [-0.7, 2.0, 0.35], handR: [0.7, 2.0, 0.35] }}
      />
      <Rats n={6} x={[8, 40]} z={[4.2, 7.5]} y={0.6} cut={0} seed={7} />
      <Rats n={6} x={[8, 40]} z={[-7.5, -4.2]} y={0.6} cut={0} seed={9} />
      {t >= 18.7 && <Rats n={6} x={[14, 34]} z={[4.2, 7.5]} y={0.6} cut={0} seed={17} />}
      {t >= 18.7 && <Rats n={6} x={[14, 34]} z={[-7.5, -4.2]} y={0.6} cut={0} seed={19} />}
    </Scene>
  );
};

/* =====================================================================
 * 5–9 · OFFICE
 * 5 bounty: «bounty» (25.0) snap — the official points at the poster.
 * 6 carcass + rule: the citizen comes in by steps; «drowning» (28.2) snap —
 *   official recoils; «one simple rule» (31.9) snap — finger up.
 * 7 «Just bring in the severed tail… collect your coin»: «tail» (34.8) — tail on
 *   the desk; «coin» (36.2) — coin in the citizen's hand.
 * 8 «triumph»: snap — the official cheers.
 * 9 «20,000 tails a day»: the queue; sacks appear one by one on the beats.
 * ===================================================================== */
const SH_OFFICE: Shot[] = [
  calm(C[4], C[5], [4.5, 5.2, 5], [-2.6, 3.0, -9.6], 50),
  calm(C[5], C[6], [-14, 5, -7], [-0.8, 3.0, -7.6], 46),
  calm(C[6], C[7], [4.5, 3.8, -2.5], [0.2, 3.0, -8.2], 46),
  calm(C[7], C[8], [-2.4, 4.2, -3.4], [0, 4.2, -9.4], 40),
  calm(C[8], C[9], [14, 8, 16], [-2, 2.4, -1], 42),
];

const CIT: V3 = [1.5, 0, -4.4];
const OFF: V3 = [0, 0, -9.4];
const QUEUE: [number, number][] = [[-1.4, -2.6], [-4.0, -1.3], [-6.8, -0.4], [-9.6, 1.4], [-7.0, 3.4], [-3.6, 3.6], [-0.2, 3.6], [3.2, 3.6], [6.6, 3.6]];
const QUEUE_CAST = ['catcher', 'citizen2', 'citizen1', 'citizen2', 'catcher', 'citizen1', 'citizen2', 'catcher', 'citizen1'];
const DOWN: Pick<PersonPose, 'handL' | 'handR'> = { handL: [-0.7, 2.6, 0.6], handR: [0.7, 2.6, 0.6] };

export const Office: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('office');
  const Sack = O('sack');
  // official: one pose per beat
  const b = beat(t, [25.0, C[5], 28.2, 31.9, C[6], 36.2, C[7]]);
  const offPoses: PersonPose[] = [
    { face: 'smug', ...DOWN },
    { face: 'smug', handL: [-1.5, 3.2, 0.7], handR: [0.7, 2.6, 0.6] }, // points at the poster
    { face: 'smug', ...DOWN },
    { face: 'panic', lean: -0.2, handL: [-0.4, 3.4, 1.4], handR: [0.4, 3.45, 1.4] }, // recoils from the stink
    { face: 'smug', handL: [-0.7, 2.6, 0.6], handR: [1.0, 4.0, 0.9] }, // «one simple rule»
    { face: 'smug', handL: [-0.7, 2.6, 0.6], handR: [0.5, 2.75, 1.3], holdR: <HeldCoin /> }, // offers the coin
    { face: 'smile', ...DOWN }, // coin handed over
    { face: 'grin', handL: [-1.5, 4.0, 0.4], handR: [1.5, 4.0, 0.4] }, // triumph
  ];
  const offPose = offPoses[b];

  // the citizen comes in by stop-motion steps, then stands at the desk
  const steps: V3[] = [[9, 0, -3.6], [6.6, 0, -3.9], [4.2, 0, -4.15], CIT];
  const ci = Math.min(steps.length - 1, step(t, C[5], 0.45));
  const citPos = t < C[6] ? steps[ci] : CIT;
  const walking = t < C[6] && ci < steps.length - 1;
  const deadRat = (
    <group rotation={[Math.PI, 0, 0]} scale={0.9}>
      <RatA pos={[0, 0, 0]} t={0} pose={{ face: 'scared' }} />
    </group>
  );
  const tailOnDesk = t >= 34.8;
  const gotCoin = t >= 36.2;
  const citPose: PersonPose = mix(walking ? walkPose(ci % 2 ? 0.5 : 1.5, 0.8) : {}, {
    face: 'grin',
    handR: t < C[6] ? [0.5, 2.9, 1.0] : tailOnDesk ? [0.7, 2.3, 0.4] : [0.3, 2.85, 1.05],
    holdR: t < C[6] ? deadRat : tailOnDesk ? undefined : <HeldTail />,
    handL: gotCoin ? [-0.15, 2.7, 1.2] : undefined,
    holdL: gotCoin ? <HeldCoin /> : undefined,
  });
  const sacks = [40.0, 40.9, 41.9, 42.4].filter((x) => t >= x).length;

  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(SH_OFFICE, t)}>
      <OfficeSet />
      <Who id="official" pos={OFF} rotY={0} pose={offPose} />
      {t >= C[5] && t < C[8] && <Who id="citizen1" pos={citPos} rotY={walking ? -Math.PI / 2 : face(CIT, OFF)} pose={citPose} />}
      {tailOnDesk && t < C[8] && (
        <group position={[1.1, BODY.waist + 0.04, -5.9]} rotation={[0, 0.4, -Math.PI / 2]}>
          <HeldTail />
        </group>
      )}
      {t >= C[8] &&
        QUEUE.map(([x, z], i) => {
          const p: V3 = [x, 0, z];
          const next: V3 = i === 0 ? CIT : [QUEUE[i - 1][0], 0, QUEUE[i - 1][1]];
          return <Who key={i} id={QUEUE_CAST[i]} pos={p} rotY={face(p, next)} pose={{ face: i % 2 ? 'grin' : 'smile', handR: [0.65, 2.3, 0.7], holdR: <HeldTail /> }} />;
        })}
      {Array.from({ length: sacks }, (_, i) => (
        <group key={i} position={[7 + (i % 2) * 1.6, 0, -3.4 - Math.floor(i / 2) * 1.7]} rotation={[0, hash(i + 3) * 3, 0]}>
          <Sack />
        </group>
      ))}
    </Scene>
  );
};

/* =====================================================================
 * 10–12 · ALLEY (night)
 * 10 «Until inspectors realized…»: «realized» (44.5) snap — panic faces.
 * 11 «Why kill the source of your income?»: «income» (48.7) snap — coin shown.
 * 12 «…trapping live rats» rat by the catcher; «snipping» (51.5) snap — tail cut,
 *    shown in his hand; «releasing» (52.9) rat at the manhole; «sewers» (54.2)
 *    gone; «generation» (55.4) young rats around the manhole.
 * ===================================================================== */
const SH_ALLEY: Shot[] = [
  calm(C[9], C[10], [-4.2, 3.2, 2.4], [-10.6, 3.0, -4.7], 44),
  calm(C[10], C[11], [7.8, 3.6, -4.2], [3.6, 1.6, 1.6], 52),
  calm(C[11], C[12], [10, 5.6, -3.4], [3.2, 1.6, 1.2], 50, 0.05),
];
const CATCH: V3 = [4.2, 0, 1.6];
const CATCH_ROT = 2.6;
const RAT0: V3 = [4.75, 0, 0.55];

export const Alley: React.FC<{ t: number }> = ({ t }) => {
  const realize = t >= 44.5;
  const income = t >= 48.7 && t < C[11];
  const snipped = t >= 51.5;
  const ratStage = beat(t, [52.9, 54.2]); // 0 by the catcher, 1 at the manhole, 2 gone
  const sc = toLocal([4.55, 0.6, 0.95], CATCH, CATCH_ROT);
  return (
    <Scene light={L('alley').light} bg={L('alley').bg} cam={camAt(SH_ALLEY, t)}>
      <AlleySet open={1} />
      <Who id="inspector" pos={[-10, 0, -4.6]} rotY={0.9} pose={{ face: realize ? 'panic' : 'o', lean: 0.15, handL: [-0.6, 3.0, 0.9] }} />
      <Who id="inspector2" pos={[-11.3, 0, -5.0]} rotY={0.9} pose={{ face: realize ? 'panic' : 'o' }} />
      <Who
        id="catcher"
        pos={CATCH}
        rotY={CATCH_ROT}
        pose={mix(crouch(0.4), {
          face: 'smug',
          handR: t < C[11] ? [0.4, 1.3, 1.0] : sc,
          holdR: <HeldScissors />,
          handL: income ? [-0.5, 2.8, 1.0] : snipped ? [-0.5, 2.6, 0.9] : [-0.4, 1.1, 1.0],
          holdL: income ? <HeldCoin /> : snipped && t >= C[11] ? <HeldTail /> : undefined,
        })}
      />
      {t >= C[11] && ratStage === 0 && <StillRat pos={RAT0} rotY={CATCH_ROT} cut={snipped} face={snipped ? 'scared' : 'happy'} />}
      {t < C[11] && <StillRat pos={RAT0} rotY={CATCH_ROT} />}
      {ratStage === 1 && <StillRat pos={[2.6, 0, 0.5]} rotY={-2.0} cut face="scared" />}
      {t >= 55.4 && [0, 1, 2, 3].map((i) => <StillRat key={i} pos={[2 + Math.sin(-0.6 + i * 0.6) * 1.9, 0, Math.cos(-0.6 + i * 0.6) * 1.9]} rotY={-0.6 + i * 0.6} scale={0.6} />)}
    </Scene>
  );
};

/* =====================================================================
 * 13 · FARM — «Soon, inspectors even discovered sprawling rat farms on the edge of town.»
 * «discovered» (58.5) snap — shock; «farms» (60.0) snap — the farmer waves.
 * ===================================================================== */
const SH_FARM: Shot[] = [calm(C[12], C[13], [14, 7, 26], [3, 3.5, -2], 50, 0.12)];

export const Farm: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('farm');
  const shock = t >= 58.5;
  const wave = t >= 60.0;
  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(SH_FARM, t)}>
      <loc.Set />
      <Who id="farmer" pos={[0, 0, -4.6]} rotY={0.15} pose={wave ? { face: 'smug', handL: [-0.7, 2.0, 0.4], handR: [1.5, 3.9, 0.5] } : { face: 'smug', handL: [-0.2, 2.5, 0.85], handR: [0.2, 2.45, 0.87] }} />
      <Who id="inspector" pos={[8.6, 0, 4.4]} rotY={-2.35} pose={shock ? { face: 'panic', handL: [-1.5, 3.8, 0.5], handR: [1.5, 3.8, 0.5] } : { face: 'o' }} />
      <Who id="inspector2" pos={[10.1, 0, 5.4]} rotY={-2.35} pose={{ face: shock ? 'panic' : 'o', ...notebook }} />
    </Scene>
  );
};

/* =====================================================================
 * 14 · OFFICE (panic) — «The government scrapped the bounty in panic, leaving Hanoi with more rats than ever.»
 * «scrapped» (62.2) snap — the poster is down; «panic» (63.3) — hands up;
 * «rats» (65.2) — rats in the office.
 * ===================================================================== */
const SH_PANIC: Shot[] = [calm(C[13], C[14], [-1.6, 4.2, -2.2], [-5.4, 3.0, -10.2], 50)];

export const OfficePanic: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('office');
  const Poster = O('poster');
  const down = t >= 62.2;
  const panic = t >= 63.3;
  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(SH_PANIC, t)}>
      <OfficeSet poster={false} />
      <group position={[-6.5, 0, -11]} rotation={[0, 0.15, 0]}>
        <group rotation={[down ? Math.PI / 2.05 : 0, 0, 0]}>
          <Poster />
        </group>
      </group>
      <Who
        id="official"
        pos={[-5.2, 0, -9.6]}
        rotY={0.25}
        pose={panic ? { face: 'panic', handL: [-1.5, 4.0, 0.4], handR: [1.5, 4.0, 0.4] } : down ? { face: 'panic', lean: -0.1, handL: [-0.8, 2.4, 0.9], handR: [0.8, 2.4, 0.9] } : { face: 'panic', handL: [-0.8, 3.0, 1.2], handR: [0.8, 3.0, 1.2] }}
      />
      {t >= 65.2 && <Rats n={5} x={[-11, -3.5]} z={[-9.8, -7.6]} cut={0.6} seed={21} />}
    </Scene>
  );
};

/* =====================================================================
 * 15–17 · STREET (finale)
 * 15 «They forgot the iron law of incentives.» — the street, rats standing everywhere.
 * 16 «People never optimize for the goal you want.» — the tired inspectors.
 * 17 «They optimize for the metric you pay for.» — high wide view, slow rise; fade out.
 * ===================================================================== */
const SH_FINAL: Shot[] = [
  calm(C[14], C[15], [-12, 1.4, 0.5], [10, 0.6, 0], 55, 0.05),
  calm(C[15], C[16], [-1.5, 3.6, -3], [-5, 3, -10.4], 44),
  move(C[16], C[17], { pos: [-28, 20, 0.5], target: [10, 0, 0], fov: 55 }, { pos: [-30, 24, 0.5], target: [10, 0, 0], fov: 55 }),
];

export const Finale: React.FC<{ t: number }> = ({ t }) => {
  const loc = L('street');
  return (
    <Scene light={loc.light} bg={loc.bg} cam={camAt(SH_FINAL, t)}>
      <loc.Set />
      <Rats n={22} x={[1, 36]} z={[-7, 7]} cut={0.6} seed={31} />
      <Who id="inspector" pos={[-6, 0.3, -10.2]} rotY={0.5} pose={{ face: 'neutral', look: [0.6, -0.5] }} />
      <Who id="inspector2" pos={[-4.3, 0.3, -10.8]} rotY={0.3} pose={{ face: 'neutral', ...notebook }} />
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
