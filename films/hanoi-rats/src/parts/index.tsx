import { blink, keys } from '../lib/anim';
import { Stage } from '../lib/Stage';
import { Character } from '../rig/Character';
import { walk } from '../rig/motion';
import { Shadow } from '../props/Props';
import { LOCATIONS } from '../locations';
import { CAST } from '../project';
import { useT } from '../cast';

/**
 * Stage 3: the film is made in PARTS of 20–30 s. Each part is reviewed in the player
 * on its own; only approved parts go into the full film.
 */
export interface Part {
  id: string;
  name: string;
  seconds: number;
  status: 'draft' | 'approved';
  C: React.FC;
}

/** Example part (replace with the real script). */
const Part01: React.FC = () => {
  const t = useT();
  const loc = LOCATIONS[0];
  const x = keys(t, [[0, -8], [5, 2]], (k) => k);
  return (
    <Stage light={loc.light} background={loc.bg} cam={{ pos: [x * 0.6, 3.4, 16], target: [x * 0.6, 2.6, 0], fov: 32, shake: 0.03, t }}>
      <loc.Set />
      <group position={[x, 0, 1]} rotation={[0, 1.0, 0]}>
        <Shadow r={0.85} />
        <Character look={CAST[0].look} pose={{ ...walk((x + 8) / 0.68), blink: blink(t, [1.2, 3.4]), expr: 'smile' }} />
      </group>
    </Stage>
  );
};

export const PARTS: Part[] = [{ id: 'part01', name: 'Часть 1 (пример)', seconds: 5, status: 'draft', C: Part01 }];
