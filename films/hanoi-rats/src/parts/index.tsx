import { Sequence, useVideoConfig } from 'remotion';
import { FILM_SECONDS, Movie } from '../film/Movie';
/**
 * Stage 5: the film is made in PARTS of 20–30 s. Each part is reviewed in the player
 * on its own; only approved parts go into the full film.
 */
export interface Part {
  id: string;
  name: string;
  seconds: number;
  status: 'draft' | 'approved';
  C: React.FC;
}

/** A window [from, to) into the one continuous film timeline (src/film/Movie.tsx). */
const windowOf = (from: number): React.FC => () => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={-Math.round(from * fps)}>
      <Movie />
    </Sequence>
  );
};

export const PARTS: Part[] = [
  { id: 'part1', name: 'Часть 1 · Загадка и канализация (0:00–0:20.5)', seconds: 20.5, status: 'draft', C: windowOf(0) },
  { id: 'part2', name: 'Часть 2 · Награда за хвост (0:20.5–0:43.3)', seconds: 22.8, status: 'draft', C: windowOf(20.5) },
  { id: 'part3', name: 'Часть 3 · Рынок приспособился (0:43.3–1:15.4)', seconds: FILM_SECONDS - 43.3, status: 'draft', C: windowOf(43.3) },
];
