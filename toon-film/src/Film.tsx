import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Captions, type Phrase } from './lib/Captions';
import { S1City } from './scenes/S1City';
import { S2Kitchen } from './scenes/S2Kitchen';
import { S3Street } from './scenes/S3Street';
import { S4Cafe } from './scenes/S4Cafe';
import { S5Park } from './scenes/S5Park';
import { S6Office } from './scenes/S6Office';

/** Scene list in seconds. Edit here to retime the film. */
export const SCENES = [
  { from: 0, to: 6.5, C: S1City },
  { from: 6.5, to: 13, C: S2Kitchen },
  { from: 13, to: 19.5, C: S3Street },
  { from: 19.5, to: 27, C: S4Cafe },
  { from: 27, to: 33.5, C: S5Park },
  { from: 33.5, to: 40, C: S6Office },
];

export const PHRASES: Phrase[] = [
  { text: 'Каждое утро Макс спешил на работу.', start: 0.8, end: 5.9 },
  { text: 'Но однажды утром', start: 7.0, end: 9.3 },
  { text: 'кофемашина сломалась.', start: 10.3, end: 12.7 },
  { text: 'Пришлось искать кофе в городе.', start: 13.7, end: 19.1 },
  { text: 'В маленьком кафе на углу', start: 20.1, end: 23.0 },
  { text: 'он встретил Лену.', start: 23.6, end: 26.6 },
  { text: 'Они проговорили до самого вечера.', start: 27.6, end: 33.1 },
  { text: 'С тех пор Макс не чинит кофемашину.', start: 34.2, end: 38.6 },
];

/** Cinematic finish: vignette, fade in, fade out to the end title. */
const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const black = Math.max(
    interpolate(t, [0, 0.8], [1, 0], { extrapolateRight: 'clamp' }),
    interpolate(t, [38.7, 39.2], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
  );
  const title = interpolate(t, [39.2, 39.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(40,20,30,0.38) 100%)' }} />
      <AbsoluteFill style={{ background: '#111', opacity: black }} />
      {title > 0 && (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Nunito', fontWeight: 900, fontSize: 120, color: '#f2b233', opacity: title, transform: `scale(${0.85 + 0.15 * title})` }}>
            Конец
          </span>
        </AbsoluteFill>
      )}
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
      <Captions phrases={PHRASES} />
      <Audio src={staticFile('audio/film.wav')} />
    </AbsoluteFill>
  );
};
