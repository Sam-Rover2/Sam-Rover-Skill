import { blink, keys, ramp } from '../lib/anim';
import { G } from '../lib/geometry';
import { LIGHTS, Stage } from '../lib/Stage';
import { P } from '../lib/style';
import { Flat, Toon, type V3 } from '../lib/Toon';
import { Character, type Look } from '../rig/Character';
import { breathe, sit } from '../rig/motion';
import { Chair, Clock, Desk, Frame, PaperCup, Plant, Room, Shadow, Window } from '../props/Props';
import { BEANIE, BOSS, BUN, MAX, useT } from '../cast';

/** A coworker typing at a back-row desk. */
const Typist: React.FC<{ look: Look; position: V3; t: number; seed: number }> = ({ look, position, t, seed }) => {
  const tap = (k: number) => Math.abs(Math.sin(t * 9 + seed + k)) * 0.06;
  return (
    <group position={position}>
      <Chair position={[0, 0, -0.1]} rotation={[0, Math.PI, 0]} color={P.navy} />
      <Character
        look={look}
        pose={{
          ...sit(1.0),
          footL: [-0.26, 0.1, 0.55],
          footR: [0.26, 0.1, 0.55],
          lean: 0.1,
          handL: [-0.3, 1.62 + tap(0), 1.0],
          handR: [0.3, 1.62 + tap(1.5), 1.0],
          squash: breathe(t, seed),
          blink: blink(t, [1 + seed * 0.3, 4 + seed * 0.2]),
          expr: 'flat',
          look: [0, -0.5],
        }}
      />
      <Desk position={[0, 0, 1.15]} rotation={[0, Math.PI, 0]} t={t + seed} monitorX={1.0} />
    </group>
  );
};

/** Next morning at the office: Max with Lena's cup; a coworker peeks in. */
export const S6Office: React.FC = () => {
  const t = useT();
  const cam = {
    pos: keys(t, [[0, [2.2, 3.7, 12]], [5.2, [0.2, 3.3, 8.2]]]),
    target: keys(t, [[0, [0.4, 2.6, -0.5]], [5.2, [-1.0, 2.75, 0.4]]]),
    fov: 32,
    shake: 0.025,
    t,
  };
  const sip = keys(t, [[0.8, 0], [1.4, 1], [2.1, 1], [2.6, 0]]);
  const peek = ramp(t, 3.0, 3.6) * (1 - ramp(t, 5.4, 5.9));
  const dream = ramp(t, 2.6, 3.0);
  return (
    <Stage light={LIGHTS.office} cam={cam} background={P.wallBlue}>
      <Room wall={P.wallBlue} side="#b9c9e2" floor="#8796b8" trim={P.navy} />
      {[-6, -1.5, 3, 7.5].map((x) => (
        <Window key={x} position={[x, 4.3, -2.9]} w={3.4} h={2.6} sky={P.skyDay} lit={1} />
      ))}
      <Clock position={[0.75, 6.4, -2.9]} t={t + 3} />
      <Frame position={[-8.4, 3.2, -2.9]} w={1.1} h={1.4} art={[P.green, P.yellow]} />
      {/* water cooler */}
      <group position={[9.6, 0, -2.1]}>
        <Toon geometry={G.box} color={P.white} position={[0, 0.9, 0]} scale={[0.8, 1.8, 0.7]} line={4} />
        <Toon geometry={G.cyl} color="#bfe0f5" position={[0, 2.25, 0]} scale={[0.32, 0.9, 0.32]} line={4} />
        <Toon geometry={G.box} color={P.steel} position={[0, 1.3, 0.38]} scale={[0.3, 0.1, 0.1]} line={3} />
      </group>
      <Plant position={[-9.3, 0, -1.8]} big />
      {/* back row of coworkers */}
      <Typist look={BOSS} position={[1.4, 0, -1.4]} t={t} seed={0.7} />
      <Typist look={BUN} position={[5.2, 0, -1.4]} t={t} seed={2.1} />
      {/* Max's desk (to his left) */}
      <Desk position={[-4.1, 0, 0.6]} rotation={[0, 0.5, 0]} t={t} color={P.trimGreen} />
      <Plant position={[-5.4, 1.5, 1.2]} scale={0.45} />
      {/* Max */}
      <group position={[-1.3, 0, 1.4]} rotation={[0, 0.25, 0]}>
        <Chair position={[0, 0, -0.1]} color={P.yellow} />
        <Shadow r={0.9} />
        <Character
          look={MAX}
          pose={{
            ...sit(1.0),
            squash: breathe(t),
            handL: [-0.15, 1.85 + sip * 0.75, 0.55 + sip * 0.15],
            elbowL: [-0.8, -0.2, 0],
            holdL: <PaperCup position={[0, 0.05, 0.05]} heart />,
            handR: [0.5, 1.3, 0.55],
            blink: blink(t, [3.2]),
            happy: dream > 0.5 && peek < 0.5 ? 1 : 0,
            expr: peek > 0.5 ? 'o' : 'smile',
            brows: peek > 0.5 ? 0.7 : 0,
            headTilt: 0.12 * dream * (1 - peek),
            headTurn: peek > 0.5 ? 0.5 : 0,
            look: peek > 0.5 ? [0.8, 0.1] : [0, -0.2],
          }}
        />
      </group>
      {/* coworker peeks in from the right */}
      <group position={[3.2 - ramp(t, 2.2, 3.4) * 1.4 - peek * 0.4, 0, 0.5]} rotation={[0, -0.5, 0]}>
        <Shadow r={0.85} />
        <Character
          look={BEANIE}
          pose={{
            side: -0.25 * peek,
            lean: 0.12 * peek,
            hips: [-0.1 * peek, 0, 0],
            handR: peek > 0.5 ? [0.55, 2.6, 0.7] : undefined,
            blink: blink(t, [4.5]),
            expr: 'grin',
            brows: -0.3,
            look: [-0.7, -0.1],
            headTilt: -0.15 * peek,
          }}
        />
      </group>
      {/* little thought-bubble heart */}
      {dream > 0 && peek < 0.3 && <Flat geometry={G.disc} color={P.blush} position={[-0.7, 4.6 + 0.08 * Math.sin(t * 3), 1.5]} scale={0.18 * dream} />}
    </Stage>
  );
};
