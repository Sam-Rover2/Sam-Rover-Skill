import { Composition } from 'remotion';
import { Film } from './Film';
import { VIDEO } from './lib/style';

export const Root: React.FC = () => (
  <>
    {/* Final film: 120 fps */}
    <Composition id="Film" component={Film} durationInFrames={VIDEO.fps * VIDEO.seconds} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
    {/* Same film at 30 fps for quick previews (all animation is time-based) */}
    <Composition id="FilmPreview" component={Film} durationInFrames={30 * VIDEO.seconds} fps={30} width={VIDEO.width} height={VIDEO.height} />
  </>
);
