import { AbsoluteFill } from 'remotion';
import { LIGHTS2, Stage } from '../lib/Stage';
import { Flat } from '../lib/Toon';
import { Actor } from '../rig/Actor';
import { Shadow } from '../props/Props';
import { CAST } from '../project';
import { useT } from '../cast';

/** Stage 1 review: every character side by side, slowly turning. */
export const CastSheet: React.FC = () => {
  const t = useT();
  const people = CAST.filter((c) => c.kind === 'person');
  const rats = CAST.filter((c) => c.kind === 'rat');
  const gap = 2.6;
  return (
    <AbsoluteFill>
      <Stage light={LIGHTS2.morning} background="#efe9df" cam={{ pos: [0, 3.4, 24], target: [0, 2.4, 1], fov: 34, t }}>
        <Flat color="#d8cfbf" rotation={[-Math.PI / 2, 0, 0]} scale={[200, 200, 1]} />
        {people.map((c, i) => (
          <group key={c.id} position={[(i - (people.length - 1) / 2) * gap, 0, 0]} rotation={[0, Math.sin(t * 0.6 + i) * 0.5, 0]}>
            <Shadow r={0.9} />
            <Actor c={c} pose={{ face: i % 3 === 0 ? 'smile' : i % 3 === 1 ? 'grin' : 'smug' }} />
          </group>
        ))}
        {rats.map((c, i) => (
          <group key={c.id} position={[(i - 0.5) * 2.4, 0, 3]} rotation={[0, 0.6 + Math.sin(t) * 0.4, 0]}>
            <Shadow r={0.6} />
            <Actor c={c} />
          </group>
        ))}
      </Stage>
    </AbsoluteFill>
  );
};
