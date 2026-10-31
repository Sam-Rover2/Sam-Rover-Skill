import { blink, keys, noise, ramp } from '../lib/anim';
import { G } from '../lib/geometry';
import { LIGHTS, Stage } from '../lib/Stage';
import { P } from '../lib/style';
import { Flat, Toon, type V3 } from '../lib/Toon';
import { Character } from '../rig/Character';
import { breathe } from '../rig/motion';
import { Clock, Frame, Mug, PendantLamp, Plant, Room, Shadow, Shelf, Window } from '../props/Props';
import { MAX, useT } from '../cast';

const POOF = 3.3;

const CoffeeMachine: React.FC<{ position: V3; t: number }> = ({ position, t }) => {
  const rattle = t > 1.8 && t < POOF ? 1 : 0;
  const jx = noise(t * 40, 1) * 0.05 * rattle;
  const jr = noise(t * 40, 2) * 0.06 * rattle;
  const led = rattle && Math.sin(t * 30) > 0 ? P.red : '#63c46a';
  const smoke = ramp(t, POOF, POOF + 0.6);
  return (
    <group position={position}>
      <group position={[jx, 0, 0]} rotation={[0, 0, jr]}>
        <Toon geometry={G.softBox} color="#3d4352" position={[0, 0.85, 0]} scale={[1.1, 1.7, 0.9]} />
        <Toon geometry={G.softBox} color={P.steel} position={[0, 1.55, 0.3]} scale={[0.9, 0.28, 0.4]} line={4} />
        <Toon geometry={G.cyl} color={P.steel} position={[0, 1.05, 0.38]} scale={[0.12, 0.25, 0.12]} line={4} />
        <Toon geometry={G.box} color="#cfe7f3" position={[0, 0.42, 0.32]} scale={[0.6, 0.5, 0.35]} line={4} />
        <Toon geometry={G.sphere} color={led} unlit position={[0.35, 1.56, 0.52]} scale={0.06} line={3} />
        <Toon geometry={G.cyl} color={P.red} position={[-0.3, 1.56, 0.5]} rotation={[Math.PI / 2, 0, 0]} scale={[0.08, 0.06, 0.08]} line={3} />
      </group>
      {/* smoke puffs after the poof */}
      {smoke > 0 &&
        [[0, 2.2, 0.2, 0.7], [-0.6, 1.9, 0.4, 0.5], [0.6, 2.0, 0.3, 0.55], [0.1, 2.8, 0.1, 0.5], [-0.3, 2.6, 0.6, 0.4]].map(([x, y, z, r], i) => {
          const drift = (t - POOF) * 0.35;
          const fade = 1 - ramp(t, POOF + 1.5, POOF + 3.2);
          return (
            fade > 0.02 && (
              <Toon key={i} geometry={G.sphere} color={i % 2 ? '#8d8f99' : '#a7a9b2'} position={[x * (0.6 + smoke * 0.6), y + drift, z]} scale={r * smoke * fade + 0.001} line={4} />
            )
          );
        })}
    </group>
  );
};

/** Max tries to make coffee; the machine dies. Wide shot, then a close-up on his face. */
export const S2Kitchen: React.FC = () => {
  const t = useT();
  const closeUp = t >= 3.8;
  const cam = closeUp
    ? { pos: keys(t, [[3.8, [-0.6, 3.1, 5.6]], [6.5, [-0.7, 3.05, 4.9]]]), target: [-1.4, 2.9, 0.4] as V3, fov: 28, shake: 0.02, t }
    : { pos: keys(t, [[0, [1.0, 3.4, 11.0]], [3.8, [0.4, 3.2, 9.4]]]), target: keys(t, [[0, [0.4, 2.4, 0]], [3.8, [0.2, 2.5, 0]]]), fov: 32, shake: 0.03, t };

  const press = keys(t, [[1.0, 0], [1.5, 1], [1.9, 1], [2.2, 0]]);
  const jump = t > POOF ? Math.max(0, Math.sin(Math.min(Math.PI, (t - POOF) * 6))) : 0;
  const shocked = t > POOF && t < 4.6;
  const sad = t >= 4.6;
  const sink = ramp(t, 4.6, 5.6);
  return (
    <Stage light={LIGHTS.kitchen} cam={cam} background={P.wallMint}>
      <Room wall={P.wallMint} side="#bcd8c5" floor={P.tile} floorLine="#d3cbbb" trim={P.trimGreen} tiles />
      <Window position={[-3.8, 4.4, -2.9]} w={2.8} h={2.2} sky={['#9fb6e0', '#f3a8a0', '#f7c59f']} curtains={P.coral} />
      <Clock position={[-0.4, 5.6, -2.9]} t={t + 7} />
      <Frame position={[-6.2, 4.3, -2.9]} art={[P.teal, P.yellow, P.coral]} />
      <PendantLamp position={[1.2, 6.2, -0.6]} color={P.yellow} />
      {/* counter + cabinets */}
      <group position={[2.6, 0, -2.1]}>
        <Toon geometry={G.box} color="#f4efe4" position={[0, 0.75, 0]} scale={[6.4, 1.5, 1.4]} line={4} />
        {[-2.4, -0.8, 0.8, 2.4].map((x) => (
          <group key={x}>
            <Toon geometry={G.box} color="#f4efe4" position={[x, 0.75, 0.72]} scale={[1.45, 1.3, 0.06]} line={3} />
            <Toon geometry={G.stick} color={P.steel} position={[x + 0.5, 1.15, 0.79]} scale={[0.03, 0.12, 0.03]} line={0} />
          </group>
        ))}
        <Toon geometry={G.box} color={P.woodLight} position={[0, 1.55, 0.05]} scale={[6.6, 0.12, 1.55]} line={4} />
        {[-2.4, -0.8, 0.8, 2.4].map((x) => (
          <Toon key={x} geometry={G.box} color="#f4efe4" position={[x, 4.9, -0.2]} scale={[1.5, 1.4, 0.9]} line={3} />
        ))}
        <Shelf position={[0.2, 3.2, -0.4]} w={2.6} items="jars" />
        <Mug position={[-1.6, 1.78, 0.3]} color={P.teal} />
        <Toon geometry={G.softBox} color={P.steel} position={[2.4, 1.95, 0.1]} scale={[0.9, 0.7, 0.6]} line={4} />
        {[[2.2, 2.35], [2.55, 2.35]].map(([x, y]) => (
          <Toon key={x} geometry={G.box} color={P.woodLight} position={[x, y, 0.1]} scale={[0.12, 0.3, 0.4]} line={3} />
        ))}
      </group>
      <CoffeeMachine position={[0.9, 1.61, -1.7]} t={t} />
      {/* fridge */}
      <group position={[6.6, 0, -2.0]}>
        <Toon geometry={G.softBox} color="#eef3f6" position={[0, 2.4, 0]} scale={[1.8, 4.8, 1.4]} />
        <Flat color="#1b1b1f" opacity={0.6} position={[0, 3.2, 0.71]} scale={[1.7, 0.04, 1]} />
        {[3.9, 2.6].map((y) => (
          <Toon key={y} geometry={G.stick} color={P.steel} position={[-0.7, y, 0.78]} scale={[0.04, 0.3, 0.04]} line={3} />
        ))}
        {[P.red, P.yellow, P.teal].map((c, i) => (
          <Flat key={c} geometry={G.disc} color={c} position={[0.1 + i * 0.3, 4.1 - i * 0.2, 0.72]} scale={0.1} />
        ))}
      </group>
      <Plant position={[-6.5, 0, -1.4]} big />
      {/* foreground table with fruit bowl */}
      <group position={[-4.5, 0, 2.5]}>
        <Toon geometry={G.cyl} color={P.woodLight} position={[0, 1.3, 0]} scale={[1.2, 0.08, 1.2]} line={4} />
        <Toon geometry={G.cyl} color={P.woodDark} position={[0, 0.65, 0]} scale={[0.08, 1.3, 0.08]} line={0} />
        <Toon geometry={G.hemi} color={P.teal} rotation={[Math.PI, 0, 0]} position={[0, 1.6, 0]} scale={[0.5, 0.25, 0.5]} line={4} />
        {[[-0.18, 1.62, P.red], [0.15, 1.65, P.yellow], [0, 1.75, P.green]].map(([x, y, c], i) => (
          <Toon key={i} geometry={G.sphere} color={c as string} position={[x as number, y as number, 0.05]} scale={0.17} line={3} />
        ))}
      </group>
      {/* Max */}
      <group position={[-1.4, 0, 0.3]} rotation={[0, 0.55, 0]}>
        <Shadow r={0.9} />
        <Character
          look={MAX}
          pose={{
            hips: [0, jump * 0.35, -jump * 0.2],
            lean: -0.18 * jump + sink * 0.12,
            squash: breathe(t) * (1 - 0.04 * sink),
            handL: shocked ? [-0.85, 2.7, 0.3] : [-0.45, 1.85, 0.55],
            elbowL: [-0.6, -0.3, -0.4],
            holdL: !shocked && <Mug position={[0, 0.15, 0.05]} scale={0.9} color={P.navy} />,
            handR: shocked ? [0.85, 2.7, 0.3] : [0.45 + press * 0.5, 1.75 + press * 0.15, 0.4 + press * 0.55],
            elbowR: [0.6, -0.3, -0.5],
            blink: t < 1 ? 0.45 : blink(t, [2.6, 5.2]),
            brows: shocked ? 0.8 : sad ? 0.9 : t < 1 ? 0.3 : 0,
            expr: shocked ? 'o' : sad ? 'sad' : 'flat',
            look: t > 1.0 && t < POOF ? [0.6, -0.3] : sad ? [0, -0.6] : [0.2, 0],
            headTurn: t < POOF ? 0.25 : sad ? 0.1 : 0,
            headNod: sad ? 0.12 * sink : 0,
            headTilt: sad ? -0.08 * sink : 0,
          }}
        />
      </group>
    </Stage>
  );
};
