/**
 * The film «Здание из 100 работников». Props (editable in Remotion Studio → Props panel):
 *  - subtitles: show / hide the word captions (turn off to render a clean version).
 */
import { z } from 'zod';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { useT } from '../cast';
import { Captions2 } from '../movie/Captions2';
import { WORDS } from '../film/words';
import { clamp01 } from '../lib/anim';
import { FilmCanvas } from '../movie/kit';
import { SHOTS, FILM_SECONDS } from './shots';

export const filmSchema = z.object({
  subtitles: z.boolean().describe('Субтитры: включить / выключить'),
});
export type FilmProps = z.infer<typeof filmSchema>;

export const BuildingFilm: React.FC<FilmProps> = ({ subtitles }) => {
  const t = useT();
  const s = SHOTS.find((x) => t >= x.from && t < x.to) ?? SHOTS[SHOTS.length - 1];
  const k = s ? clamp01((t - s.from) / (s.to - s.from)) : 0;
  const fade = Math.max(1 - clamp01(t / 0.4), clamp01((t - (FILM_SECONDS - 0.5)) / 0.5));
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Audio src={staticFile('audio/voice.mp3')} />
      {s && (
        <FilmCanvas>
          <s.C key={s.name} t={t} k={k} />
        </FilmCanvas>
      )}
      {subtitles && <Captions2 words={WORDS} />}
      {fade > 0 && <AbsoluteFill style={{ background: '#000', opacity: fade }} />}
    </AbsoluteFill>
  );
};
