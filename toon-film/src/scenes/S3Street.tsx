import { blink, keys, ramp } from '../lib/anim';
import { G } from '../lib/geometry';
import { LIGHTS, Stage } from '../lib/Stage';
import { P } from '../lib/style';
import { Flat, Toon } from '../lib/Toon';
import { Character } from '../rig/Character';
import { walk } from '../rig/motion';
import { Car, Cloud, Facade, Shadow, StreetLamp, Tree } from '../props/Props';
import { SkyBackdrop } from '../props/Sky';
import { BUN, MAX, useT } from '../cast';

const STRIDE = 0.68;

const Pigeon: React.FC<{ x: number; t: number; seed: number }> = ({ x, t, seed }) => {
  const peck = Math.max(0, Math.sin(t * 5 + seed)) * 0.35;
  return (
    <group position={[x, 0, 1.4]} rotation={[0, seed, 0]}>
      <Toon geometry={G.sphere} color="#9aa3b5" position={[0, 0.2, 0]} scale={[0.22, 0.16, 0.14]} line={3} />
      <group position={[0.18, 0.32, 0]} rotation={[0, 0, -peck]}>
        <Toon geometry={G.sphere} color="#7f889c" scale={0.09} line={3} />
        <Toon geometry={G.cone} color={P.yellow} position={[0.1, -0.01, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[0.03, 0.08, 0.03]} line={0} />
      </group>
    </group>
  );
};

/** Tracking shot along the street; a car wipes through the foreground. */
export const S3Street: React.FC = () => {
  const t = useT();
  // Max walks, slows down and stops in front of the café at x≈9
  const x = keys(t, [[0, -4], [4.9, 6.6], [5.7, 7.6]], (k) => k);
  const stopK = ramp(t, 4.9, 5.7);
  const w = walk(x / STRIDE, 1 - stopK);
  const notice = ramp(t, 5.2, 5.8);

  const cam = {
    pos: keys(t, [[0, [-4.5, 3.4, 12.5]], [5.7, [7.0, 3.3, 11.5]], [6.5, [7.4, 3.2, 10.8]]]),
    target: keys(t, [[0, [-3.4, 2.5, 0]], [5.7, [8.2, 2.6, 0]], [6.5, [8.4, 2.6, 0]]]),
    fov: 32,
    shake: 0.05,
    t,
  };
  const carX = keys(t, [[2.0, 28], [3.8, -24]], (k) => k);
  const ped = keys(t, [[0, 12], [6.5, 3]], (k) => k);

  return (
    <Stage light={LIGHTS.day} cam={cam} background={P.skyDay[0]}>
      <SkyBackdrop colors={['#9cc9ef', '#b5d7f3', '#d8ecfb']} />
      {[[-20, 20, -40], [5, 25, -45], [30, 19, -40]].map(([cx, cy, cz], i) => (
        <Cloud key={i} position={[cx + t * 0.4, cy, cz]} scale={4} />
      ))}
      {/* ground: far sidewalk, road with dashes, near sidewalk */}
      <Flat color={P.sidewalk} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} scale={[200, 5, 1]} />
      <Toon geometry={G.box} color="#d9d5cc" position={[0, 0.06, 2.55]} scale={[200, 0.12, 0.2]} line={3} />
      <Flat color={P.asphalt} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 8]} scale={[200, 11, 1]} />
      {Array.from({ length: 30 }).map((_, i) => (
        <Flat key={i} color={P.white} rotation={[-Math.PI / 2, 0, 0]} position={[-40 + i * 3, 0.005, 7]} scale={[1.4, 0.15, 1]} />
      ))}
      {/* façades */}
      <Facade position={[-14, 0, -2.5]} w={7} h={10} color="#9cb6d8" awning={P.navy} />
      <Facade position={[-7, 0, -2.5]} w={7} h={12} color={P.brick} awning={P.teal} />
      <Facade position={[0, 0, -2.5]} w={7} h={9} color={P.wallCream} awning={P.yellow} />
      <Facade position={[7, 0, -2.5]} w={7} h={11} color="#e8b07a" />
      {/* the café */}
      <Facade position={[14, 0, -2.5]} w={7} h={10} color={P.wallMint} awning={P.red} sign={P.white} />
      <group position={[14, 3.5, -2.2]}>
        <Toon geometry={G.cup} color={P.red} rotation={[Math.PI, 0, 0]} position={[-0.6, 0, 0]} scale={[0.18, 0.36, 0.1]} line={3} />
        {[0, 1, 2].map((i) => (
          <Flat key={i} color={P.ink} position={[0.1 + i * 0.3, 0, 0.08]} scale={[0.2, 0.08, 1]} />
        ))}
      </group>
      <Facade position={[21, 0, -2.5]} w={7} h={13} color="#c9b8e6" awning={P.green} />
      {/* street furniture */}
      {[-10, -4, 2, 8, 16, 22].map((tx, i) =>
        i % 2 ? (
          <StreetLamp key={tx} position={[tx, 0, 1.8]} />
        ) : (
          <group key={tx}>
            <Tree position={[tx, 0, 1.6]} scale={0.85} />
            <Shadow position={[tx, 0, 1.6]} r={1} />
          </group>
        ),
      )}
      <group position={[4.5, 0, 1.9]}>
        <Toon geometry={G.cyl} color={P.red} position={[0, 0.4, 0]} scale={[0.22, 0.8, 0.22]} line={4} />
        <Toon geometry={G.hemi} color={P.red} position={[0, 0.8, 0]} scale={0.22} line={4} />
      </group>
      <group position={[-1, 0, 1.9]}>
        <Toon geometry={G.cyl} color={P.green} position={[0, 0.55, 0]} scale={[0.35, 1.1, 0.35]} line={4} />
        <Toon geometry={G.cyl} color={P.plantDark} position={[0, 1.12, 0]} scale={[0.38, 0.08, 0.38]} line={3} />
      </group>
      {[0.5, 1.6, 2.4].map((px, i) => (
        <Pigeon key={i} x={px} t={t} seed={i * 2.1} />
      ))}
      {/* passer-by in the back */}
      <group position={[ped, 0, -0.9]} rotation={[0, -1.1, 0]}>
        <Shadow r={0.8} />
        <Character look={BUN} pose={{ ...walk((12 - ped) / STRIDE), blink: blink(t, [1.5, 4.2]), expr: 'smile' }} />
      </group>
      {/* Max */}
      <group position={[x, 0, 0.6]} rotation={[0, 1.0 - notice * 0.6, 0]}>
        <Shadow r={0.85} />
        <Character
          look={MAX}
          pose={{
            ...w,
            blink: blink(t, [1.2, 3.1, 5.9]),
            brows: notice > 0.5 ? -0.2 : 0.5,
            expr: notice > 0.5 ? 'grin' : 'flat',
            look: notice > 0.5 ? [0.4, 0.3] : [0, -0.4],
            headNod: 0.12 * (1 - notice),
            headTurn: notice * 0.4,
          }}
        />
      </group>
      {/* foreground car wipe */}
      <Car position={[carX, 0, 6.2]} color={P.teal} spin={t * 18} />
    </Stage>
  );
};
