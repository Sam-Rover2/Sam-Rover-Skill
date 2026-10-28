import { keys, noise, ramp } from '../lib/anim';
import { LIGHTS, Stage } from '../lib/Stage';
import { P } from '../lib/style';
import { Cloud, Facade, Shadow, StreetLamp, Tree } from '../props/Props';
import { Bird, SkyBackdrop } from '../props/Sky';
import { Flat } from '../lib/Toon';
import { useT } from '../cast';

/** Dawn over the city: crane down from the rising sun to Max's lit window. */
export const S1City: React.FC = () => {
  const t = useT();
  const cam = {
    pos: keys(t, [[0, [0, 15, 26]], [6.5, [1.2, 6.2, 11]]]),
    target: keys(t, [[0, [0, 13, -30]], [6.5, [1.6, 6.6, -6]]]),
    fov: 34,
    shake: 0.04,
    t,
  };
  const sunY = 13 + ramp(t, 0, 6.5) * 8;
  const lampsOn = t < 3.2 ? 1 : 0;
  return (
    <Stage light={LIGHTS.dawn} cam={cam} background={P.skyDawn[0]}>
      <SkyBackdrop colors={['#9fb6e0', '#c4b4d8', '#f3a8a0', '#f7c59f', '#fbe0b8']} sun={{ pos: [-3, sunY], r: 6, color: '#fff3c4' }} />
      {/* far skyline silhouettes */}
      {Array.from({ length: 14 }).map((_, i) => (
        <Flat key={i} color={i % 2 ? '#b99ab8' : '#a88cab'} position={[-60 + i * 9, 3 + (i % 4) * 1.5, -45]} scale={[7, 6 + (i % 4) * 3, 1]} />
      ))}
      {[[-18, 20, -40], [10, 24, -42], [30, 18, -38]].map(([x, y, z], i) => (
        <Cloud key={i} position={[x + t * 0.6 * (i + 1), y, z]} scale={3.5} />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <Bird key={i} position={[-12 + t * 3 + i * 1.6, 16 + noise(t + i, i) * 0.6 + (i % 2) * 0.8, -20]} flap={t * 14 + i} />
      ))}
      {/* street block */}
      <Flat color={P.asphalt} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} scale={[200, 60, 1]} />
      <Flat color={P.sidewalk} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -3]} scale={[200, 5, 1]} />
      <Facade position={[-12, 0, -6]} w={8} h={11} color={P.brick} awning={P.teal} />
      <Facade position={[-3.5, 0, -7]} w={7} h={14} color="#e8b07a" sign={P.red} />
      <Facade position={[4.5, 0, -6]} w={8} h={12} color={P.wallCream} awning={P.red} />
      <Facade position={[13, 0, -6.5]} w={7} h={15} color="#9cb6d8" />
      {/* Max's window: warm and lit */}
      <Flat color={P.lampGlow} opacity={0.5 + 0.2 * Math.sin(t * 2)} position={[5.3, 7.6, -5.4]} scale={[1.6, 1.6, 1]} />
      {[-8, 0, 8].map((x) => (
        <group key={x}>
          <Tree position={[x, 0, -1.2]} />
          <Shadow position={[x, 0, -1.2]} r={1.2} />
        </group>
      ))}
      {[-4, 4, 12].map((x) => (
        <StreetLamp key={x} position={[x, 0, -0.8]} on={lampsOn} />
      ))}
    </Stage>
  );
};
