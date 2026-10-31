import { Composition } from 'remotion';
import { ToonTest } from './toon/ToonTest';
import { VIDEO } from './toon/style';

/** All 3D animations of the project. Render: npm run anim:render -- <Id> */
export const Root: React.FC = () => (
  <>
    <Composition
      id="ToonTest"
      component={ToonTest}
      durationInFrames={VIDEO.fps * 4}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  </>
);
