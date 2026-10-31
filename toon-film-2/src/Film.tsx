import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { S1Market } from './scenes/S1Market';
import { S2Sky } from './scenes/S2Sky';
import { S3Roof } from './scenes/S3Roof';
import { S4Run } from './scenes/S4Run';
import { S5Fountain } from './scenes/S5Fountain';
import { S6Sunset } from './scenes/S6Sunset';

/** «Красный шарик» — scene list in seconds. No captions: the story is told by acting. */
export const SCENES = [
  { from: 0, to: 7, C: S1Market },
  { from: 7, to: 12.5, C: S2Sky },
  { from: 12.5, to: 19.5, C: S3Roof },
  { from: 19.5, to: 25, C: S4Run },
  { from: 25, to: 33, C: S5Fountain },
  { from: 33, to: 40, C: S6Sunset },
];

/** Vignette, fade in from black, fade out to black. */
const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const black = Math.max(
    interpolate(t, [0, 0.8], [1, 0], { extrapolateRight: 'clamp' }),
    interpolate(t, [38.8, 39.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  );
  return (
    <>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(40,20,30,0.38) 100%)' }} />
      <AbsoluteFill style={{ background: '#111', opacity: black }} />
    </>
  );
};

export const Film: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: '#111' }}>
      {SCENES.map(({ from, to, C }) => (
        <Sequence key={from} from={Math.round(from * fps)} durationInFrames={Math.round((to - from) * fps)}>
          <C />
        </Sequence>
      ))}
      <Grade />
      <Audio src={staticFile('audio/film.wav')} />
    </AbsoluteFill>
  );
};
