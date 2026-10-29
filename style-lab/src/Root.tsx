import { Composition } from 'remotion';
import { BUILDING_IDS, BuildingCard, CharCard, DetailCard, Lineup } from './Catalog';
import { DESIGNS } from './designs';
import { Showcase } from './Showcase';
import { STYLES } from './styles';
import { HumanStage, type Actor } from './human/HumanViews';
import { PEOPLE } from './human/cast';
import type { HumanSpec } from './human/Human';

const P = (id: string) => PEOPLE.find((p) => p.id === id)!.spec;
const walkers: Actor[] = PEOPLE.map((p, i) => ({ spec: p.spec, pos: [(i - 2.5) * 2.1, 0, (i % 2) * -1.2] as [number, number, number], rotY: 0, pose: { walk: i * 1.1, stride: 0.9 } }));
const turn: Actor[] = [0, Math.PI / 4, Math.PI / 2, Math.PI].map((r, i) => ({ spec: P('m-blue'), pos: [(i - 1.5) * 2.4, 0, 0] as [number, number, number], rotY: r }));
const faceSpec = P('f-teal');
export const FACES = [{}, { smile: 1 }, { jaw: 0.9, brow: 1 }, { brow: -1, smile: -0.6 }, { blink: 1, smile: 0.6 }];
const faceCam = { pos: [0.6, 3.45, 3.4] as [number, number, number], target: [0, 3.4, 0] as [number, number, number], fov: 30 };
const base = P('m-blue');
const outfits: HumanSpec[] = [
  base,
  { ...base, top: { type: 'longsleeve', color: '#e9e1cf' }, bottom: { type: 'pants', color: '#34405e' }, shoes: { type: 'boot', color: '#5a3a24' } },
  { ...base, top: { type: 'none', color: '' }, bottom: { type: 'shorts', color: '#1f6f86' }, watch: '#e0573f' },
  { ...base, top: { type: 'tank', color: '#f2b233' }, bottom: { type: 'cargo', color: '#9c8466' } },
  { ...base, hair: { style: 'buzz', color: '#2a2420' }, top: { type: 'tshirt', color: '#1b1b1f' }, bottom: { type: 'pants', color: '#3a3f4f' }, shoes: { type: 'sneaker', color: '#e0573f' } },
];
const wardrobe: Actor[] = outfits.map((s, i) => ({ spec: s, pos: [(i - 2) * 2.2, 0, 0] as [number, number, number] }));
const bodies: Actor[] = [
  { sex: 'm', build: 0.8 }, { sex: 'm', build: 1 }, { sex: 'm', build: 1.4 }, { sex: 'f', build: 0.8 }, { sex: 'f', build: 1 }, { sex: 'f', build: 1.4 },
].map((o, i) => ({ spec: { ...(o.sex === 'f' ? P('f-teal') : P('m-grey')), build: o.build } as HumanSpec, pos: [(i - 2.5) * 2.0, 0, 0] as [number, number, number] }));

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
    <Composition id="human-walk" component={HumanStage} defaultProps={{ actors: walkers, cam: { pos: [0, 2.4, 12.5], target: [0, 1.95, -0.4], fov: 34 } }} {...one} />
    <Composition id="human-turn" component={HumanStage} defaultProps={{ actors: turn, cam: { pos: [0, 2.3, 12], target: [0, 2.0, 0], fov: 32 } }} {...one} />
    <Composition id="human-rig" component={HumanStage} defaultProps={{ actors: [{ spec: P('m-blue'), pos: [-1.6, 0, 0], wire: true }, { spec: P('m-blue'), pos: [1.6, 0, 0], wire: true, pose: { walk: 1.2, wave: 0.8 } }], cam: { pos: [0, 2.4, 11], target: [0, 2.0, 0], fov: 32 } }} {...one} />
    {FACES.map((f, i) => (
      <Composition key={i} id={`human-face-${i}`} component={HumanStage} defaultProps={{ actors: [{ spec: i % 2 ? P('m-blue') : faceSpec, pos: [0, 0, 0] as [number, number, number], face: f }], cam: { ...faceCam, target: [0, i % 2 ? 3.6 : 3.4, 0] as [number, number, number], pos: [0.6, i % 2 ? 3.65 : 3.45, 3.4] as [number, number, number] } }} {...one} />
    ))}
    <Composition id="human-wardrobe" component={HumanStage} defaultProps={{ actors: wardrobe, cam: { pos: [0, 2.3, 13], target: [0, 2.0, 0], fov: 34 } }} {...one} />
    <Composition id="human-bodies" component={HumanStage} defaultProps={{ actors: bodies, cam: { pos: [0, 2.3, 13.5], target: [0, 2.0, 0], fov: 34 } }} {...one} />
    {([1, 2, 3] as const).map((l) => (
      <Composition key={l} id={`detail-${l}`} component={DetailCard} defaultProps={{ level: l }} {...one} />
    ))}
  </>
);
