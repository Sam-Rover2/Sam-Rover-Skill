import { Composition } from 'remotion';
import { BUILDING_IDS, BuildingCard, CharCard, DetailCard, Lineup } from './Catalog';
import { DESIGNS } from './designs';
import { Showcase } from './Showcase';
import { STYLES } from './styles';
import { StickClose, StickPoses, StickScene } from './stick/StickScenes';

const one = { durationInFrames: 1, fps: 30, width: 1920, height: 1080 };

export const Root: React.FC = () => (
  <>
    {STYLES.map((s) => (
      <Composition key={s.r.id} id={`style-${s.r.id}`} component={Showcase} defaultProps={{ styleId: s.r.id }} {...one} />
    ))}
    {DESIGNS.map((d) => (
      <Composition key={d.id} id={`char-${d.id}`} component={CharCard} defaultProps={{ id: d.id }} {...one} />
    ))}
    <Composition id="lineup" component={Lineup} {...one} />
    {BUILDING_IDS.map((b) => (
      <Composition key={b} id={`bld-${b}`} component={BuildingCard} defaultProps={{ id: b }} {...one} />
    ))}
    <Composition id="stick-scene" component={StickScene} {...one} />
    <Composition id="stick-close" component={StickClose} {...one} />
    <Composition id="stick-poses" component={StickPoses} {...one} />
    {([1, 2, 3] as const).map((l) => (
      <Composition key={l} id={`detail-${l}`} component={DetailCard} defaultProps={{ level: l }} {...one} />
    ))}
  </>
);
