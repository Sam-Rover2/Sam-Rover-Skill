import { blink, keys, ramp } from '../lib/anim';
import { G } from '../lib/geometry';
import { LIGHTS, Stage } from '../lib/Stage';
import { P } from '../lib/style';
import { Flat, Toon } from '../lib/Toon';
import { Character } from '../rig/Character';
import { breathe, walk } from '../rig/motion';
import { Chair, Frame, PaperCup, PendantLamp, Plant, Room, Shadow, Shelf, Table, Window } from '../props/Props';
import { LENA, MAX, useT } from '../cast';

const HANDOFF = 4.9;

/** Café: Max walks in, Lena hands him a coffee. Wide shot → closer two-shot. */
export const S4Cafe: React.FC = () => {
  const t = useT();
  const wide = t < 3.4;
  const cam = wide
    ? { pos: keys(t, [[0, [-2.5, 3.8, 13.5]], [3.4, [-0.6, 3.6, 12.6]]]), target: keys(t, [[0, [-2.2, 2.6, 0]], [3.4, [-0.2, 2.6, -0.4]]]), fov: 34, shake: 0.03, t }
    : { pos: keys(t, [[3.4, [0.3, 3.3, 7.4]], [7.5, [0.0, 3.2, 6.3]]]), target: [0, 2.75, 0] as [number, number, number], fov: 30, shake: 0.025, t };

  // Max walks in from the left and turns to Lena
  const mx = keys(t, [[0, -7], [2.6, -0.95]], (k) => k);
  const arrive = ramp(t, 2.3, 3.0);
  const mw = walk((mx + 7) / 0.68, 1 - arrive);
  const reach = keys(t, [[3.9, 0], [4.6, 1], [HANDOFF, 1], [5.6, 0]]);
  const give = keys(t, [[3.3, 0], [4.0, 1], [HANDOFF, 1], [5.5, 0]]);
  const wave = ramp(t, 1.4, 1.8) * (1 - ramp(t, 2.8, 3.2));
  const joy = ramp(t, 5.3, 5.6);
  const lenaTalk = t > 3.5 && t < 4.6 ? Math.abs(Math.sin(t * 11)) : 0;
  const maxTalk = t > 6.0 && t < 6.9 ? Math.abs(Math.sin(t * 12)) : 0;

  return (
    <Stage light={LIGHTS.cafe} cam={cam} background={P.wallCream}>
      <Room wall={P.wallCream} side="#e6d4b2" floor={P.wood} floorLine={P.woodDark} trim={P.trimGreen} />
      {/* wainscot panels */}
      {Array.from({ length: 14 }).map((_, i) => (
        <Toon key={i} geometry={G.box} color="#e8d7b8" position={[-8 + i * 1.2, 0.85, -2.94]} scale={[1.0, 1.1, 0.04]} line={3} />
      ))}
      <Window position={[-4.6, 4.2, -2.9]} w={3.2} h={2.4} sky={P.skyDay} />
      {/* menu board */}
      <group position={[3.2, 4.6, -2.9]}>
        <Toon geometry={G.box} color="#33393f" scale={[3.4, 1.9, 0.08]} line={4} />
        {Array.from({ length: 4 }).map((_, i) => (
          <group key={i} position={[0, 0.55 - i * 0.38, 0.05]}>
            <Flat color="#f2efe6" position={[-0.7, 0, 0]} scale={[1.3 - (i % 2) * 0.3, 0.07, 1]} />
            <Flat color={P.yellow} position={[1.2, 0, 0]} scale={[0.4, 0.07, 1]} />
          </group>
        ))}
      </group>
      <Frame position={[-1.2, 4.4, -2.9]} w={1.1} h={0.8} art={[P.red, P.yellow]} />
      <Shelf position={[3.2, 2.9, -2.6]} w={3.4} items="cups" />
      {[-2.5, 0.5, 3.5].map((x, i) => (
        <PendantLamp key={x} position={[x, 6.3, -0.4]} color={[P.trimGreen, P.yellow, P.coral][i]} drop={1.4} />
      ))}
      {/* counter */}
      <group position={[3.4, 0, -1.6]}>
        <Toon geometry={G.box} color={P.trimGreen} position={[0, 0.8, 0]} scale={[4.6, 1.6, 1.1]} line={4} />
        {[-1.6, -0.55, 0.5, 1.55].map((x) => (
          <Toon key={x} geometry={G.box} color="#4fa384" position={[x, 0.8, 0.56]} scale={[0.9, 1.2, 0.04]} line={3} />
        ))}
        <Toon geometry={G.box} color={P.woodLight} position={[0, 1.65, 0.05]} scale={[4.8, 0.12, 1.3]} line={4} />
        {/* espresso machine */}
        <group position={[1.4, 1.7, -0.2]}>
          <Toon geometry={G.softBox} color={P.steel} position={[0, 0.55, 0]} scale={[1.4, 1.1, 0.7]} line={4} />
          <Toon geometry={G.box} color={P.red} position={[0, 1.15, 0]} scale={[1.5, 0.12, 0.75]} line={3} />
          {[-0.35, 0.35].map((x) => (
            <Toon key={x} geometry={G.cyl} color="#3d4352" position={[x, 0.4, 0.4]} scale={[0.1, 0.18, 0.1]} line={3} />
          ))}
          {[-0.45, -0.15, 0.15, 0.45].map((x, i) => (
            <Toon key={x} geometry={G.cup} color={P.white} rotation={[Math.PI, 0, 0]} position={[x, 1.32, 0]} scale={[0.1, 0.18, 0.1]} line={3} />
          ))}
        </group>
        {/* register */}
        <group position={[-1.5, 1.72, 0]}>
          <Toon geometry={G.softBox} color={P.navy} position={[0, 0.2, 0]} scale={[0.7, 0.4, 0.6]} line={4} />
          <Toon geometry={G.box} color={P.navy} position={[0, 0.55, -0.15]} rotation={[-0.4, 0, 0]} scale={[0.6, 0.35, 0.06]} line={4} />
          <Flat color="#bfe3c9" position={[0, 0.56, -0.11]} rotation={[-0.4, 0, 0]} scale={[0.5, 0.25, 1]} />
        </group>
        {/* pastry case */}
        <group position={[-0.2, 1.72, 0.2]}>
          <Toon geometry={G.box} color="#d6ecf5" position={[0, 0.3, 0]} scale={[1.1, 0.6, 0.7]} line={4} />
          {[-0.3, 0, 0.3].map((x, i) => (
            <Toon key={x} geometry={G.sphere} color={[P.woodLight, P.coral, P.yellow][i]} position={[x, 0.15, 0.2]} scale={[0.13, 0.08, 0.13]} line={3} />
          ))}
        </group>
      </group>
      {/* tables in the foreground left */}
      <Table position={[-5.2, 0, 1.6]} round w={1.6} />
      <Chair position={[-6.3, 0, 1.6]} rotation={[0, 1.2, 0]} color={P.coral} />
      <PaperCup position={[-5.0, 1.55, 1.7]} scale={0.8} />
      <Plant position={[-7.2, 0, -1.6]} big />
      <Plant position={[6.6, 0, -1.4]} />
      {/* Lena */}
      <group position={[0.95, 0, 0.3]} rotation={[0, -0.9, 0]}>
        <Shadow r={0.85} />
        <Character
          look={LENA}
          pose={{
            squash: breathe(t, 1),
            handL: wave > 0 ? [-0.75, 2.6 + 0.3 * wave, 0.2 + 0.15 * Math.sin(t * 14)] : undefined,
            elbowL: [-0.8, -0.2, 0],
            handR: give > 0 ? [0.25, 1.75 + give * 0.25, 0.4 + give * 0.75] : [0.45, 1.75, 0.45],
            holdR: t < HANDOFF && <PaperCup position={[0, 0.05, 0.05]} heart />,
            blink: blink(t, [0.8, 3.0, 6.4]),
            expr: 'smile',
            talk: lenaTalk,
            happy: joy > 0.5 && t < 6.3 ? 1 : 0,
            headTilt: 0.08 * joy,
            look: [-0.4, 0],
          }}
        />
      </group>
      {/* Max */}
      <group position={[mx, 0, 0.3]} rotation={[0, 1.4 - arrive * 0.5, 0]}>
        <Shadow r={0.85} />
        <Character
          look={MAX}
          pose={{
            ...(arrive < 1 ? mw : {}),
            squash: breathe(t),
            handL: reach > 0 || t > HANDOFF ? [-0.25, 1.9 + reach * 0.1, 0.45 + reach * 0.7] : (mw.handL ?? undefined),
            elbowL: [-0.8, -0.3, -0.2],
            holdL: t >= HANDOFF && <PaperCup position={[0, 0.05, 0.05]} heart />,
            blink: blink(t, [1.0, 3.6]),
            brows: t < HANDOFF ? 0.3 : -0.1,
            expr: t < HANDOFF ? 'smile' : 'grin',
            happy: joy > 0.5 ? 1 : 0,
            talk: maxTalk,
            look: [0.4, 0.1],
          }}
        />
      </group>
      {/* little hearts after the handoff */}
      {[0, 1, 2].map((i) => {
        const k = ramp(t, 5.6 + i * 0.35, 7.2 + i * 0.35);
        return (
          k > 0 &&
          k < 1 && (
            <Flat key={i} geometry={G.disc} color={P.blush} opacity={1 - k} position={[-0.2 + i * 0.25, 3.9 + k * 1.6, 0.6]} scale={0.1 + 0.05 * Math.sin(k * 9)} />
          )
        );
      })}
    </Stage>
  );
};
