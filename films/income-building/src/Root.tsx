import { Composition, Folder } from 'remotion';
import { PROJECT } from './project';
import { CastSheet, castSeconds } from './building/CastSheet';
import { BuildingFilm, filmSchema } from './building/Film';
import { FILM_SECONDS } from './building/shots';

const { previewFps: pf } = PROJECT;

/**
 * «Здание из 100 работников» — Ink Diorama Toon style (skill ink-toon).
 * Every composition exists in two formats: vertical 9:16 and wide 16:9.
 */
export const Root: React.FC = () => (
  <>
    <Folder name="1-Characters">
      <Composition id="cast" component={CastSheet} durationInFrames={Math.round(castSeconds() * pf)} fps={pf} width={1080} height={1920} />
      <Composition id="cast-wide" component={CastSheet} durationInFrames={Math.round(castSeconds() * pf)} fps={pf} width={1920} height={1080} />
    </Folder>
    <Folder name="2-Film">
      <Composition id="film" component={BuildingFilm} schema={filmSchema} defaultProps={{ subtitles: true }} durationInFrames={Math.round(FILM_SECONDS * pf)} fps={pf} width={1080} height={1920} />
      <Composition id="film-wide" component={BuildingFilm} schema={filmSchema} defaultProps={{ subtitles: true }} durationInFrames={Math.round(FILM_SECONDS * pf)} fps={pf} width={1920} height={1080} />
    </Folder>
  </>
);
