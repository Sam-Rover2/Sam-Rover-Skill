import { keys } from '../lib/anim';
import { LIGHTS2, Stage } from '../lib/Stage';
import { Flat } from '../lib/Toon';
import { OBJECTS } from '../objects';
import { useT } from '../cast';

/** Stage 2 in the player: one object on a turntable. */
export const ObjectPreview: React.FC<{ id: string }> = ({ id }) => {
  const t = useT();
  const o = OBJECTS.find((x) => x.id === id)!;
  const a = keys(t, [[0, -0.8], [6, 0.8]]);
  return (
    <Stage light={LIGHTS2.morning} background="#efe9df" cam={{ pos: [Math.sin(a) * 16, 6, Math.cos(a) * 16], target: [0, 2, 0], fov: 36, t }}>
      <Flat color="#d8cfbf" rotation={[-Math.PI / 2, 0, 0]} scale={[200, 200, 1]} />
      <o.C />
    </Stage>
  );
};
