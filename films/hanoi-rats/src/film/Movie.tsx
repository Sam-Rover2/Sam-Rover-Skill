import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { useT } from '../cast';
import { Captions } from '../lib/Captions';
import { clamp01 } from '../lib/anim';
import { SCENES } from './scenes';
import { WORDS } from './words';

export const FILM_SECONDS = 75.4;

/**
 * The whole film in one timeline (global seconds). Parts are windows into it.
 * Calm editing: hard cuts between sentences only, a short fade in/out at the ends.
 */
export const Movie: React.FC = () => {
  const t = useT();
  const sc = SCENES.find((s) => t >= s.from && t < s.to) ?? SCENES[SCENES.length - 1];
  const fade = Math.max(1 - clamp01(t / 0.4), clamp01((t - 74.9) / 0.5));
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Audio src={staticFile('audio/voice.mp3')} />
      <sc.C t={t} />
      <Captions phrases={WORDS} />
      {fade > 0 && <AbsoluteFill style={{ background: '#000', opacity: fade }} />}
    </AbsoluteFill>
  );
};
