import { Composition } from 'remotion';
import { Showcase } from './Showcase';
import { STYLES } from './styles';

/** One 1-frame composition per style: render each with `remotion still`. */
export const Root: React.FC = () => (
  <>
    {STYLES.map((s) => (
      <Composition key={s.r.id} id={`style-${s.r.id}`} component={Showcase} defaultProps={{ styleId: s.r.id }} durationInFrames={1} fps={30} width={1920} height={1080} />
    ))}
  </>
);
