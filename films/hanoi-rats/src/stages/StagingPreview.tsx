import { Series, useVideoConfig } from 'remotion';
import { Stage } from '../lib/Stage';
import { Actor } from '../rig/Actor';
import { Shadow } from '../props/Props';
import { LOCATIONS } from '../locations';
import { OBJECTS } from '../objects';
import { CAST } from '../project';
import { STAGINGS, type Shot } from '../staging';
import { useT } from '../cast';

/** Stage 4 in the player: the static staging seen through each planned shot camera (2 s per shot). */
const ShotView: React.FC<{ id: string; shot: Shot }> = ({ id, shot }) => {
  const t = useT();
  const s = STAGINGS.find((x) => x.id === id)!;
  const loc = LOCATIONS.find((l) => l.id === s.location)!;
  return (
    <Stage light={loc.light} background={loc.bg} cam={{ pos: shot.pos, target: shot.target, fov: shot.fov, t }}>
      <loc.Set />
      {s.objects.map((o, i) => {
        const O = OBJECTS.find((x) => x.id === o.obj)!;
        return (
          <group key={i} position={o.pos} rotation={[0, o.rotY ?? 0, 0]}>
            <O.C />
          </group>
        );
      })}
      {s.actors.map((a, i) => (
        <group key={i} position={a.pos} rotation={[0, a.rotY ?? 0, 0]}>
          <Shadow r={0.85} />
          <Actor c={CAST.find((c) => c.id === a.cast)!} pose={a.pose} />
        </group>
      ))}
    </Stage>
  );
};

export const StagingPreview: React.FC<{ id: string }> = ({ id }) => {
  const { fps } = useVideoConfig();
  const s = STAGINGS.find((x) => x.id === id)!;
  return (
    <Series>
      {s.shots.map((sh) => (
        <Series.Sequence key={sh.name} durationInFrames={fps * 2}>
          <ShotView id={id} shot={sh} />
        </Series.Sequence>
      ))}
    </Series>
  );
};
