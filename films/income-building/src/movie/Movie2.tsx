import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { useT } from '../cast';
import { Captions2 } from './Captions2';
import { clamp01 } from '../lib/anim';
import { WORDS } from '../film/words';
import { SHOTS } from './shots';
import { FilmCanvas } from './kit';

export const MOVIE2_SECONDS = 75.4;

/** New film (v2): one diorama per shot, cut on the phrase, word captions, voice. */
export const Movie2: React.FC = () => {
  const t = useT();
  const s = SHOTS.find((x) => t >= x.from && t < x.to) ?? SHOTS[SHOTS.length - 1];
  const k = clamp01((t - s.from) / (s.to - s.from));
  const fade = Math.max(1 - clamp01(t / 0.4), clamp01((t - 74.9) / 0.5));
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Audio src={staticFile('audio/voice.mp3')} />
      <FilmCanvas>
        <s.C key={s.name} t={t} k={k} />
      </FilmCanvas>
      <Captions2 words={WORDS} />
      {fade > 0 && <AbsoluteFill style={{ background: '#000', opacity: fade }} />}
    </AbsoluteFill>
  );
};
