import { Composition, Folder } from 'remotion';
import { Film, filmParts } from './Film';
import { LOCATIONS, LocationPreview } from './locations';
import { PARTS } from './parts';
import { PROJECT } from './project';
import { CastSheet } from './stages/CastSheet';

const { previewFps: pf, fps, width, height } = PROJECT;
const total = () => filmParts().reduce((s, p) => s + p.seconds, 0);

/**
 * The player (Remotion Studio) shows one folder per production stage.
 * Previews run at 30 fps; the final film is 120 fps.
 */
export const Root: React.FC = () => (
  <>
    <Folder name="1-Characters">
      <Composition id="cast" component={CastSheet} durationInFrames={pf * 8} fps={pf} width={width} height={height} />
    </Folder>
    <Folder name="2-Locations">
      {LOCATIONS.map((l) => (
        <Composition key={l.id} id={`loc-${l.id}`} component={LocationPreview} defaultProps={{ id: l.id }} durationInFrames={pf * 8} fps={pf} width={width} height={height} />
      ))}
    </Folder>
    <Folder name="3-Parts">
      {PARTS.map((p) => (
        <Composition key={p.id} id={p.id} component={p.C} durationInFrames={Math.round(p.seconds * pf)} fps={pf} width={width} height={height} />
      ))}
    </Folder>
    <Folder name="4-Film">
      <Composition id="film" component={Film} durationInFrames={Math.round(total() * fps)} fps={fps} width={width} height={height} />
    </Folder>
  </>
);
